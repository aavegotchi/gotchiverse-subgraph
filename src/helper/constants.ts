import { BigInt } from "@graphprotocol/graph-ts";

export enum StatCategory {
    GOTCHI,
    PARCEL,
    OVERALL,
    USER
}

export const STAT_CATEGORIES = [
    "gotchi",
    "parcel",
    "overall",
    "user"
]

export const BIGINT_ZERO = BigInt.fromI32(0);
export const BIGINT_ONE = BigInt.fromI32(1);