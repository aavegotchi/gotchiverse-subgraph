import { Address, BigInt } from "@graphprotocol/graph-ts";

export enum StatCategory {
    GOTCHI,
    PARCEL,
    OVERALL,
    USER,
}

export const STAT_CATEGORIES = ["gotchi", "parcel", "overall", "user"];

export const BIGINT_ZERO = BigInt.fromI32(0);
export const BIGINT_ONE = BigInt.fromI32(1);
export const BIGINT_TWO = BigInt.fromI32(2);
export const BIGINT_THREE = BigInt.fromI32(3);
export const BIGINT_FOUR = BigInt.fromI32(4);
export const BIGINT_FIVE = BigInt.fromI32(5);
export const BIGINT_SIX = BigInt.fromI32(6);
export const BIGINT_SEVEN = BigInt.fromI32(7);
export const BIGINT_EIGHT = BigInt.fromI32(8);
export const BIGINT_NINE = BigInt.fromI32(9);
export const BIGINT_TEN = BigInt.fromI32(10);
export const REALM_DIAMOND = Address.fromString(
    "0x726F201A9aB38cD56D60ee392165F1434C4F193D"
);
export const TILE_DIAMOND = Address.fromString(
    "0xDd8947D7F6705136e5A12971231D134E80DFC15d"
);
export const INSTALLATION_DIAMOND = Address.fromString(
    "0x663aeA831087487d2944ce44836F419A35Ee005A"
);
