import BN from "bn.js";
import { rawEncode } from "ethereumjs-abi";
import { ecrecover, keccak256, pubToAddress } from "ethereumjs-util";

import { actionToDetails, Chain, ShiftAction } from "./assets";
import { BitcoinUTXO, createBTCTestnetAddress, getBTCTestnetUTXOs } from "./blockchain/btc";
import { createZECTestnetAddress, getZECTestnetUTXOs, ZcashUTXO } from "./blockchain/zec";
import { Ox, ShiftedInResponse, strip0x } from "./index";
import { masterKeys, NETWORK, zBTC } from "./networks";

export type UTXO = { chain: Chain.Bitcoin, utxo: BitcoinUTXO } | { chain: Chain.ZCash, utxo: ZcashUTXO };

// 32-byte zero value
export const NULL32 = "0x0000000000000000000000000000000000000000000000000000000000000000";

export interface Arg {
    name: string;
    type: string;
    // tslint:disable-next-line: no-any
    value: any;
}

export type Payload = Arg[];

const unzip = (zip: Arg[]) => [zip.map(param => param.type), zip.map(param => param.value)];

// tslint:disable-next-line: no-any
export const generatePHash = (...zip: Arg[] | [Arg[]]): string => {
    // You can annotate values passed in to soliditySha3.
    // Example: { type: "address", value: srcToken }

    // Check if they called as hashPayload([...]) instead of hashPayload(...)
    const args = Array.isArray(zip) ? zip[0] as any as Arg[] : zip; // tslint:disable-line: no-any

    // If the payload is empty, use 0x0
    if (args.length === 0) {
        return NULL32;
    }

    const [types, values] = unzip(args);

    // tslint:disable-next-line: no-any
    return Ox(keccak256(rawEncode(types, values))); // sha3 can accept a Buffer
};

export const generateHash = (_payload: Payload, amount: number | string, _to: string, _shiftAction: ShiftAction, nonce: string): string => {
    const token = zBTC[NETWORK]; // actionToDetails(_shiftAction).asset;
    console.log(`Payload and hash:`);
    console.log(_payload);
    const pHash = generatePHash(_payload);
    console.log(`pHash: ${pHash}`);

    const hash = rawEncode(
        ["bytes32", "uint256", "address", "address", "bytes32"],
        [Ox(pHash), amount, Ox(token), Ox(_to), Ox(nonce)],
    );

    // tslint:disable-next-line: no-any
    return Ox(keccak256(hash));
};

// Generates the gateway address
export const generateAddress = (_shiftAction: ShiftAction, hash: string): string => {

    const chain = actionToDetails(_shiftAction).from;
    switch (chain) {
        case Chain.Bitcoin:
            return createBTCTestnetAddress(hash);
        case Chain.ZCash:
            return createZECTestnetAddress(hash);
        default:
            throw new Error(`Unable to generate deposit address for chain ${chain}`);
    }
};

// Retrieves unspent deposits at the provided address
export const retrieveDeposits = async (_shiftAction: ShiftAction, _depositAddress: string, _limit = 10, _confirmations = 0): Promise<UTXO[]> => {
    const chain = actionToDetails(_shiftAction).from;
    switch (chain) {
        case Chain.Bitcoin:
            return (await getBTCTestnetUTXOs(_depositAddress, _limit, _confirmations)).map(utxo => ({ chain: Chain.Bitcoin, utxo }));
        case Chain.ZCash:
            return (await getZECTestnetUTXOs(_depositAddress, _limit, _confirmations)).map(utxo => ({ chain: Chain.ZCash, utxo }));
        default:
            throw new Error(`Unable to retrieve deposits for chain ${chain}`);
    }
};

export const SECONDS = 1000;
// tslint:disable-next-line: no-string-based-set-timeout
export const sleep = async (timeout: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, timeout));

export interface Signature { r: string; s: string; v: number; }

export const signatureToString = <T extends Signature>(sig: T): string => Ox(`${strip0x(sig.r)}${sig.s}${sig.v.toString(16)}`);

const switchV = (v: number) => v === 27 ? 28 : 27; // 28 - (v - 27);

const secp256k1n = new BN("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141", "hex");
export const fixSignature = (response: ShiftedInResponse): Signature => {
    const r = response.r;
    let s = new BN(strip0x(response.s), "hex");
    let v = ((parseInt(response.v || "0", 10) + 27) || 27);

    // For a given key, there are two valid signatures for each signed message.
    // We always take the one with the lower `s`.
    if (s.gt(secp256k1n.div(new BN(2)))) {
        // Take s = -s % secp256k1n
        s = secp256k1n.sub(new BN(s));
        // Switch v
        v = switchV(v);
    }

    // Currently, the wrong `v` value may be returned from the darknodes.
    // We recover the address to see if we need to switch `v`.
    const recovered = {
        [v]: pubToAddress(ecrecover(
            Buffer.from(strip0x(response.hash), "hex"),
            v,
            Buffer.from(strip0x(r), "hex"),
            s.toArrayLike(Buffer, "be", 32),
        )),

        [switchV(v)]: pubToAddress(ecrecover(
            Buffer.from(strip0x(response.hash), "hex"),
            switchV(v),
            Buffer.from(strip0x(r), "hex"),
            s.toArrayLike(Buffer, "be", 32),
        )),
    };

    const expected = Buffer.from(masterKeys[NETWORK].eth, "hex");
    if (recovered[v].equals(expected)) {
        // Do nothing
    } else if (recovered[switchV(v)].equals(expected)) {
        console.warn("Switching v value");
        v = switchV(v);
    } else {
        throw new Error("Invalid signature. Unable to recover darknode master public key.");
    }

    const signature: Signature = {
        r,
        s: strip0x(s.toArrayLike(Buffer, "be", 32).toString("hex")),
        v,
    };

    return signature;
};
