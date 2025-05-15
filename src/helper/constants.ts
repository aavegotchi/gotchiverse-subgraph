import { Address, BigInt, dataSource } from "@graphprotocol/graph-ts";

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

// Network specific constants mapping (address strings to maintain readability)
const NETWORK_CONSTANTS = new Map<string, Map<string, string>>();

// Polygon Mainnet
NETWORK_CONSTANTS.set(
    "polygon",
    new Map<string, string>()
        .set("REALM_DIAMOND", "0x1d0360bac7299c86ec8e99d0c1c9a95fefaf2a11")
        .set("TILE_DIAMOND", "0x9216c31d8146bCB3eA5a9162Dc1702e8AEDCa355")
        .set(
            "INSTALLATION_DIAMOND",
            "0x19f870bD94A34b3adAa9CaA439d333DA18d6812A"
        )
);

// Polygon Amoy
NETWORK_CONSTANTS.set(
    "polygon-amoy",
    new Map<string, string>()
        .set("REALM_DIAMOND", "0x5a4faEb79951bAAa0866B72fD6517E693c8E4620")
        .set("TILE_DIAMOND", "0xCa6F4Ef19a1Beb9BeF12f64b395087E5680bcB22")
        .set(
            "INSTALLATION_DIAMOND",
            "0x514b7c55FB3DFf3533B58D85CD25Ba04bb30612D"
        )
);

// Base Sepolia
NETWORK_CONSTANTS.set(
    "base-sepolia",
    new Map<string, string>()
        .set("REALM_DIAMOND", "0xb674fD8E82967d53Bd4513c25DB61943504884aA")
        .set("TILE_DIAMOND", "0xead385D9BABc904B2531a4b2AB5c6Af2c70014C3")
        .set(
            "INSTALLATION_DIAMOND",
            "0x4773f06Fb66735F1350A2dB582660CBf6C0FF64B"
        )
);

// Get current network from dataSource.network()
const network = dataSource.network();

// Helper function to get address for a specific contract based on current network
function getAddressForNetwork(contractKey: string): Address {
    const networkConstants = NETWORK_CONSTANTS.get(network);
    if (networkConstants) {
        const addressStr = networkConstants.get(contractKey);
        if (addressStr) {
            return Address.fromString(addressStr);
        }
    }
    throw new Error(
        `No address found for ${contractKey} on network ${network}`
    );
}

// Export dynamic contract addresses based on the current network
export const REALM_DIAMOND = getAddressForNetwork("REALM_DIAMOND");
export const TILE_DIAMOND = getAddressForNetwork("TILE_DIAMOND");
export const INSTALLATION_DIAMOND = getAddressForNetwork(
    "INSTALLATION_DIAMOND"
);
