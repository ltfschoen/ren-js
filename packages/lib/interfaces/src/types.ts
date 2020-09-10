import { RenContract } from "./networks";
import {
    SerializableBurnAndReleaseParams,
    SerializableLockAndMintParams,
} from "./parameters";
import { BurnTransaction, MintTransaction } from "./transaction";

export type Base64String = string;
export type HexString = string;

export enum LockAndMintStatus {
    Committed = "mint_committed",
    Deposited = "mint_deposited",
    Confirmed = "mint_confirmed",
    SubmittedToRenVM = "mint_submittedToRenVM",
    ReturnedFromRenVM = "mint_returnedFromRenVM",
    SubmittedToLockChain = "mint_submittedToLockChain",
    ConfirmedOnLockChain = "mint_confirmedOnLockChain",

    // Backwards compatibility
    SubmittedToEthereum = "mint_submittedToEthereum",
    ConfirmedOnEthereum = "mint_confirmedOnEthereum",
}

export enum BurnAndReleaseStatus {
    Committed = "burn_committed",
    SubmittedToLockChain = "burn_submittedToLockChain",
    ConfirmedOnLockChain = "burn_confirmedOnLockChain",
    SubmittedToRenVM = "burn_submittedToRenVM",
    ReturnedFromRenVM = "burn_returnedFromRenVM",
    NoBurnFound = "burn_noBurnFound",

    // Backwards compatibility
    SubmittedToEthereum = "burn_submittedToEthereum",
    ConfirmedOnEthereum = "burn_confirmedOnEthereum",
}

export enum TxStatus {
    // TxStatusNil is used for transactions that have not been seen, or are
    // otherwise unknown.
    TxStatusNil = "nil",
    // TxStatusConfirming is used for transactions that are currently waiting
    // for their underlying blockchain transactions to ne confirmed.
    TxStatusConfirming = "confirming",
    // TxStatusPending is used for transactions that are waiting for consensus
    // to be reached on when the transaction should be executed.
    TxStatusPending = "pending",
    // TxStatusExecuting is used for transactions that are currently being
    // executed.
    TxStatusExecuting = "executing",
    // TxStatusDone is used for transactions that have been successfully
    // executed.
    TxStatusDone = "done",
    // TxStatusReverted is used for transactions that were reverted during
    // execution.
    TxStatusReverted = "reverted",
}

export interface SendTokenInterface {
    sendToken: RenContract;
}

interface HistoryEventCommon {
    id: string;
    time: number; // Seconds since Unix epoch
    inTx: {} | null;
    outTx: {} | null;
    txHash: string | null;
    renVMStatus: TxStatus | null;
    returned: boolean;
    archived?: boolean;
}

export enum EventType {
    LockAndMint = "lockAndMint",
    BurnAndRelease = "burnAndRelease",
}

export interface LockAndMintEvent extends HistoryEventCommon {
    eventType: EventType.LockAndMint;
    status: LockAndMintStatus;
    transferParams: SerializableLockAndMintParams;
    renVMQuery: MintTransaction | null;
    gatewayAddress?: string;
}

export interface BurnAndReleaseEvent extends HistoryEventCommon {
    eventType: EventType.BurnAndRelease;
    status: BurnAndReleaseStatus;
    transferParams: SerializableBurnAndReleaseParams;
    renVMQuery: BurnTransaction | null;
}

export type HistoryEvent = LockAndMintEvent | BurnAndReleaseEvent;
