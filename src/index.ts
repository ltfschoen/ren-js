import _BN from "bn.js";

import { Chain, Network, ShiftInParams, ShiftOutParams } from "@renproject/ren-js-common";

import { Ox, randomNonce, strip0x } from "./lib/utils";
import { Darknode } from "./renVM/darknode";
import { DarknodeGroup } from "./renVM/darknodeGroup";
import { RPCMethod } from "./renVM/jsonRPC";
import { ShifterNetwork } from "./renVM/shifterNetwork";
import { TxStatus } from "./renVM/transaction";
import { ShiftInObject } from "./shiftIn";
import { ShiftOutObject } from "./shiftOut";
import { bchUtils, btcUtils, Tokens, zecUtils } from "./types/assets";
import { NetworkChaosnet, NetworkDetails, NetworkTestnet, stringToNetwork } from "./types/networks";

// Export types
export { BitcoinUTXO } from "./blockchain/btc";
export { BitcoinCashUTXO } from "./blockchain/bch";
export { ZcashUTXO } from "./blockchain/zec";
export { ShiftInObject, Signature } from "./shiftIn";
export { ShiftOutObject } from "./shiftOut";
export { UTXO } from "./lib/utils";
export { NetworkDetails } from "./types/networks";
export { TxStatus } from "./renVM/transaction";
export { Chain, RenContract as Token, RenContract } from "@renproject/ren-js-common";
export { Darknode } from "./renVM/darknode";
export { DarknodeGroup } from "./renVM/darknodeGroup";
export { RPCMethod } from "./renVM/jsonRPC";

const NetworkDetails = {
    NetworkChaosnet,
    NetworkTestnet,
    stringToNetwork,
};

const utils = {
    Ox,
    strip0x,
    randomNonce,

    // Bitcoin
    BTC: btcUtils,
    btc: btcUtils,

    // Zcash
    ZEC: zecUtils,
    zec: zecUtils,

    // Bitcoin Cash
    BCH: bchUtils,
    bch: bchUtils,
};

/**
 * This is the main exported class.
 *
 * ```typescript
 * import RenJS from "@renproject/ren";
 * ```
 *
 * It's initialized with a network, which controls both the RenVM network and
 * Ethereum chain to use:
 *
 * ```typescript
 * new RenJS(); // Same as `new RenJS("mainnet");`
 * new RenJS("testnet");
 * new RenJS({ ...NetworkMainnet, lightnodeURL: "custom lightnode URL" });
 * ```
 *
 * It then exposes two main functions: [[shiftIn]] and [[shiftOut]].
 */
export default class RenJS {
    // Expose constants so they can be accessed on the RenJS class
    // e.g. `RenJS.Tokens`
    public static Tokens = Tokens;
    public static Networks = Network;
    public static NetworkDetails = NetworkDetails;
    public static Chains = Chain;
    public static TxStatus = TxStatus;
    public static utils = utils;
    public static Darknode = Darknode;
    public static DarknodeGroup = DarknodeGroup;
    public static RPCMethod = RPCMethod;

    // Not static
    public readonly utils = utils;
    public readonly renVM: ShifterNetwork;
    public readonly lightnode: DarknodeGroup;
    public readonly network: NetworkDetails;

    /**
     * Takes a Network object that contains relevant addresses.
     * @param network One of "mainnet" (or empty), "testnet" or a custom
     *                Network object.
     */
    constructor(network?: NetworkDetails | string | null | undefined) {
        this.network = stringToNetwork(network);
        this.lightnode = new DarknodeGroup(this.network.nodeURLs);
        this.renVM = new ShifterNetwork(this.lightnode);
    }

    /**
     * Submits the commitment and transaction to RenVM, and then submits the
     * signature to the adapter address.
     *
     * @param params See [[ShiftInParams]].
     * @returns An instance of [[ShiftInObject]].
     */
    public readonly shiftIn = (params: ShiftInParams): ShiftInObject => {
        return new ShiftInObject(this.renVM, this.network, params);
    }

    /**
     * Submits a burn log to RenVM.
     *
     * @param params See [[ShiftOutParams]].
     * @returns An instance of [[ShiftOutObject]].
     */
    public readonly shiftOut = (params: ShiftOutParams): ShiftOutObject => {
        return new ShiftOutObject(this.renVM, params);
    }
}
