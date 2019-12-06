import BigNumber from "bignumber.js";
import { OrderedMap } from "immutable";
import Web3 from "web3";
import { TransactionConfig, TransactionReceipt } from "web3-core";
import { provider } from "web3-providers";

import { BitcoinCashUTXO } from "./blockchain/bch";
import { BitcoinUTXO } from "./blockchain/btc";
import { ZcashUTXO } from "./blockchain/zec";
import { payloadToShiftInABI } from "./lib/abi";
import { forwardEvents, newPromiEvent, PromiEvent } from "./lib/promievent";
import {
    fixSignature, generateAddress, generateGHash, generatePHash, ignoreError, Ox, randomNonce,
    retrieveDeposits, SECONDS, signatureToString, sleep, strip0x, UTXO, withDefaultAccount,
} from "./lib/utils";
import { ShifterNetwork, unmarshalTx } from "./renVM/shifterNetwork";
import { QueryTxResponse, Tx } from "./renVM/transaction";
import { NetworkDetails } from "./types/networks";
import { ShiftInFromDetails, ShiftInParams, ShiftInParamsAll } from "./types/parameters";

export class ShiftInObject {
    public utxo: BitcoinUTXO | ZcashUTXO | BitcoinCashUTXO | undefined;
    public gatewayAddress: string | undefined;
    private readonly network: NetworkDetails;
    private readonly renVMNetwork: ShifterNetwork;
    private readonly params: ShiftInParamsAll;

    constructor(renVMNetwork: ShifterNetwork, network: NetworkDetails, params: ShiftInParams) {
        this.params = params;
        this.network = network;
        this.renVMNetwork = renVMNetwork;

        const renTxHash = (params as ShiftInParamsAll).renTxHash || (params as ShiftInParamsAll).messageID;

        if (!renTxHash) {
            const { sendToken, contractParams, sendTo, sendAmount, nonce: maybeNonce } = params as ShiftInFromDetails;

            const nonce = maybeNonce || randomNonce();
            (this.params as ShiftInFromDetails).nonce = nonce;

            // const sendAmountString = BigNumber.isBigNumber(sendAmount) ? sendAmount.toFixed() : new BigNumber(sendAmount.toString()).toFixed();
            const sendAmountNumber = BigNumber.isBigNumber(sendAmount) ? sendAmount.toNumber() : new BigNumber(sendAmount.toString()).toNumber();

            // TODO: Validate inputs
            const gHash = generateGHash(contractParams, sendAmountNumber, strip0x(sendTo), sendToken, nonce, network);
            const gatewayAddress = generateAddress(sendToken, gHash, network);
            this.gatewayAddress = gatewayAddress;
        }
    }

    public addr = () => this.gatewayAddress;

    public waitForDeposit = (confirmations: number): PromiEvent<this> => {
        const promiEvent = newPromiEvent<this>();
        (async () => {
            if (this.params.renTxHash || this.params.messageID) {
                return this;
            }

            if (!this.gatewayAddress) {
                throw new Error("Unable to calculate gateway address");
            }

            const { sendAmount, sendToken } = this.params as ShiftInFromDetails;

            let deposits: OrderedMap<string, UTXO> = OrderedMap();
            // const depositedAmount = (): number => {
            //     return deposits.map(item => item.utxo.value).reduce((prev, next) => prev + next, 0);
            // };

            // tslint:disable-next-line: no-constant-condition
            while (true) {
                if (deposits.size > 0) {
                    // Sort deposits
                    const greatestTx = deposits.filter(utxo => utxo.utxo.confirmations >= confirmations).sort((a, b) => a.utxo.value > b.utxo.value ? -1 : 1).first<UTXO>(undefined);
                    if (greatestTx && greatestTx.utxo.value >= sendAmount) {
                        this.utxo = greatestTx.utxo;
                        break;
                    }
                }

                try {
                    const newDeposits = await retrieveDeposits(this.network, sendToken, this.gatewayAddress, 0);

                    let newDeposit = false;
                    for (const deposit of newDeposits) {
                        // tslint:disable-next-line: no-non-null-assertion
                        if (!deposits.has(deposit.utxo.txid) || deposits.get(deposit.utxo.txid)!.utxo.confirmations !== deposit.utxo.confirmations) {
                            promiEvent.emit("deposit", deposit);
                            newDeposit = true;
                        }
                        deposits = deposits.set(deposit.utxo.txid, deposit);
                    }
                    if (newDeposit) { continue; }
                } catch (error) {
                    // tslint:disable-next-line: no-console
                    console.error(String(error));
                    await sleep(1 * SECONDS);
                    continue;
                }
                await sleep(10 * SECONDS);
            }
            return this;
        })().then(promiEvent.resolve).catch(promiEvent.reject);

        return promiEvent;
    }

    public submitToRenVM = (specifyUTXO?: BitcoinUTXO | ZcashUTXO | BitcoinCashUTXO): PromiEvent<Signature> => {
        const promiEvent = newPromiEvent<Signature>();

        (async () => {
            let renTxHash = this.params.renTxHash || this.params.messageID;

            if (!renTxHash) {
                const utxo = specifyUTXO || this.utxo;

                if (!utxo) {
                    throw new Error("Unable to submit without UTXO. Call waitForDeposit() or provide a UTXO as a parameter.");
                }

                const { nonce, sendToken, sendTo, sendAmount, contractParams } = this.params as ShiftInFromDetails;

                if (!nonce) {
                    throw new Error("Unable to submitToRenVM without nonce");
                }

                const sendAmountNumber = BigNumber.isBigNumber(sendAmount) ? sendAmount.toNumber() : new BigNumber(sendAmount.toString()).toNumber();

                renTxHash = await this.renVMNetwork.submitShiftIn(
                    sendToken,
                    sendTo,
                    sendAmountNumber,
                    nonce,
                    generatePHash(contractParams),
                    utxo.txid,
                    utxo.output_no,
                    this.network,
                );

                promiEvent.emit("messageID", renTxHash);
                promiEvent.emit("renTxHash", renTxHash);
            }

            const marshalledResponse = await this.renVMNetwork.waitForTX<QueryTxResponse>(renTxHash, (status) => {
                promiEvent.emit("status", status);
            });

            const response = unmarshalTx(marshalledResponse);

            // tslint:disable-next-line: no-use-before-declare
            return new Signature(this.network, this.params as ShiftInParams, response, renTxHash);
        })().then(promiEvent.resolve).catch(promiEvent.reject);

        return promiEvent;
    }

    // tslint:disable-next-line:no-any
    public waitAndSubmit = async (web3Provider: provider, confirmations: number, txConfig?: TransactionConfig, specifyUTXO?: BitcoinUTXO | ZcashUTXO | BitcoinCashUTXO) => {
        await this.waitForDeposit(confirmations);
        const signature = await this.submitToRenVM(specifyUTXO);
        return signature.submitToEthereum(web3Provider, txConfig);
    }
}

export class Signature {
    public params: ShiftInParams;
    public network: NetworkDetails;
    public response: Tx;
    public signature: string;
    public renTxHash: string;
    // Here to maintain backwards compatibility
    public messageID: string;

    constructor(network: NetworkDetails, params: ShiftInParams, response: Tx, renTxHash: string) {
        this.params = params;
        this.network = network;
        this.response = response;
        this.renTxHash = renTxHash;
        this.messageID = renTxHash;
        this.signature = signatureToString(fixSignature(response, network));
    }

    // tslint:disable-next-line: no-any
    public submitToEthereum = (web3Provider: provider, txConfig?: TransactionConfig): PromiEvent<TransactionReceipt> => {
        // tslint:disable-next-line: no-any
        const promiEvent = newPromiEvent<TransactionReceipt>();

        (async () => {
            const params = [
                ...this.params.contractParams.map(value => value.value),
                Ox(this.response.args.amount.toString(16)), // _amount: BigNumber
                Ox(this.response.args.nhash),
                // Ox(this.response.args.n), // _nHash: string
                Ox(this.signature), // _sig: string
            ];

            const ABI = payloadToShiftInABI(this.params.contractFn, this.params.contractParams);
            const web3 = new Web3(web3Provider);
            const contract = new web3.eth.Contract(ABI, this.params.sendTo);

            const tx = contract.methods[this.params.contractFn](
                ...params,
            ).send(await withDefaultAccount(web3, {
                ...this.params.txConfig,
                ...txConfig,
            }));

            forwardEvents(tx, promiEvent);

            return await new Promise<TransactionReceipt>((resolve, reject) => tx
                .once("confirmation", (_confirmations: number, receipt: TransactionReceipt) => { resolve(receipt); })
                .catch((error: Error) => {
                    try { if (ignoreError(error)) { console.error(String(error)); return; } } catch (_error) { /* Ignore _error */ }
                    reject(error);
                })
            );
        })().then(promiEvent.resolve).catch(promiEvent.reject);

        // TODO: Look into why .catch isn't being called on tx
        promiEvent.on("error", (error) => {
            try { if (ignoreError(error)) { console.error(String(error)); return; } } catch (_error) { /* Ignore _error */ }
            promiEvent.reject(error);
        });

        return promiEvent;
    }

    /**
     * Alternative to `submitToEthereum` that doesn't need a web3 instance
     */
    public createTransaction = async (txConfig?: TransactionConfig): Promise<TransactionConfig> => {
        const params = [
            ...this.params.contractParams.map(value => value.value),
            Ox(this.response.args.amount.toString(16)), // _amount: BigNumber
            Ox(this.response.args.nhash),
            // Ox(generateNHash(this.response)), // _nHash: string
            Ox(this.signature), // _sig: string
        ];

        const ABI = payloadToShiftInABI(this.params.contractFn, this.params.contractParams);
        // tslint:disable-next-line: no-any
        const web3 = new (Web3 as any)() as Web3;
        const contract = new web3.eth.Contract(ABI);

        const data = contract.methods[this.params.contractFn](
            ...params,
        ).encodeABI();

        return await withDefaultAccount(web3, {
            to: this.params.sendTo,
            data,
            ...this.params.txConfig,
            ...txConfig,
        });
    }
}