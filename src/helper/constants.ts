import { Address, BigInt } from "@graphprotocol/graph-ts";

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
export const REALM_DIAMOND = Address.fromString("0x1d0360bac7299c86ec8e99d0c1c9a95fefaf2a11");
export const TILE_DIAMOND = Address.fromString("0x9216c31d8146bCB3eA5a9162Dc1702e8AEDCa355");
export const INSTALLATION_DIAMOND = Address.fromString("0x19f870bD94A34b3adAa9CaA439d333DA18d6812A");