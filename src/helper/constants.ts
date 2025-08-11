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
export const NETWORK_CONSTANTS = new Map<string, Map<string, string>>();

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
        .set("REALM_DIAMOND", "0xF5Bc2D611C89C8C331F5969Abcc55E0C440EF43D")
        .set("TILE_DIAMOND", "0xAf5B09c81a7D709d7fbC0E6d0a8a413bA671537d")
        .set(
            "INSTALLATION_DIAMOND",
            "0xBf1a271e3Fc33b6978BD3f356a9f8424C7Eda473"
        )
);

// Base Mainnet
NETWORK_CONSTANTS.set(
    "base",
    new Map<string, string>()
        .set("REALM_DIAMOND", "0x4B0040c3646D3c44B8a28Ad7055cfCF536c05372")
        .set("TILE_DIAMOND", "0x617fdB8093b309e4699107F48812b407A7c37938")
        .set(
            "INSTALLATION_DIAMOND",
            "0xebba5b725A2889f7f089a6cAE0246A32cad4E26b"
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
