import { BigInt } from "@graphprotocol/graph-ts";
import {
    NFTDisplayStatusUpdated,
    RealmDiamond,
} from "../../generated/RealmDiamond/RealmDiamond";
import {
    Gotchi,
    NFTDisplayStatus,
    Parcel,
    ParcelAccessRight,
} from "../../generated/schema";
import {
    BIGINT_ONE,
    BIGINT_ZERO,
    REALM_DIAMOND,
    StatCategory,
} from "./constants";
import { getStat } from "./stats";

export const getOrCreateParcel = (realmId: BigInt): Parcel => {
    let id = realmId.toString();
    let parcel = Parcel.load(id);
    if (!parcel) {
        parcel = new Parcel(id);
        parcel.equippedInstallations = new Array<string>();
        parcel.equippedTiles = new Array<string>();
        parcel.equippedInstallationsBalance = BIGINT_ZERO;
        parcel.equippedTilesBalance = BIGINT_ZERO;
        parcel.remainingAlchemica = [
            BIGINT_ZERO,
            BIGINT_ZERO,
            BIGINT_ZERO,
            BIGINT_ZERO,
        ];
        parcel.totalAlchemicaClaimed = [
            BIGINT_ZERO,
            BIGINT_ZERO,
            BIGINT_ZERO,
            BIGINT_ZERO,
        ];
        parcel.surveyRound = 0;
        parcel = updateParcelInfo(parcel);
    }
    return parcel;
};

export function updateParcelInfo(
    parcel: Parcel,
    isBase: boolean = false
): Parcel {
    let parcelId = BigInt.fromString(parcel.id);
    let contract = RealmDiamond.bind(REALM_DIAMOND);
    let parcelInfo = contract.try_getParcelInfo(parcelId);

    if (!parcelInfo.reverted) {
        let parcelMetadata = parcelInfo.value;
        parcel.parcelId = parcelMetadata.parcelId;
        parcel.tokenId = parcelId;
        parcel.coordinateX = parcelMetadata.coordinateX;
        parcel.coordinateY = parcelMetadata.coordinateY;
        parcel.district = parcelMetadata.district;
        parcel.parcelHash = parcelMetadata.parcelAddress;

        parcel.size = parcelMetadata.size;

        let boostArray = parcelMetadata.boost;
        parcel.fudBoost = boostArray[0];
        parcel.fomoBoost = boostArray[1];
        parcel.alphaBoost = boostArray[2];
        parcel.kekBoost = boostArray[3];

        if (isBase) {
            parcel.surveyRound = parcelMetadata.surveyRound.toI32();

            parcel.remainingAlchemica = parcelMetadata.alchemicaRemaining;

            // Extract installation IDs and calculate total balance
            let installationIds = new Array<string>();
            let totalInstallationsBalance = BIGINT_ZERO;
            for (
                let i = 0;
                i < parcelMetadata.equippedInstallations.length;
                i++
            ) {
                let item = parcelMetadata.equippedInstallations[i];
                let installationId = item.installationId.toString();
                let balance = item.balance;

                installationIds.push(installationId);
                totalInstallationsBalance = totalInstallationsBalance.plus(
                    balance
                );
            }
            parcel.equippedInstallations = installationIds;
            parcel.equippedInstallationsBalance = totalInstallationsBalance;

            // Extract tile IDs and calculate total balance
            let tileIds = new Array<string>();
            let totalTilesBalance = BIGINT_ZERO;
            for (let i = 0; i < parcelMetadata.equippedTiles.length; i++) {
                let item = parcelMetadata.equippedTiles[i];
                let tileId = item.tileId.toString();
                let balance = item.balance;

                tileIds.push(tileId);
                totalTilesBalance = totalTilesBalance.plus(balance);
            }
            parcel.equippedTiles = tileIds;
            parcel.equippedTilesBalance = totalTilesBalance;

            parcel.lastChanneledAlchemica =
                parcelMetadata.lastChanneledAlchemica;

            parcel.lastClaimedAlchemica = parcelMetadata.lastClaimedAlchemica;

            parcel.owner = parcelMetadata.owner;
        }
    }

    return parcel;
}

export const getOrCreateGotchi = (gotchiId: BigInt): Gotchi => {
    let id = gotchiId.toString();
    let gotchi = Gotchi.load(id);
    if (!gotchi) {
        gotchi = new Gotchi(id);
    }
    return gotchi;
};

// createChannelAlchemicaEvent removed - no longer storing event entities

// createAlchemicaClaimedEvent removed - no longer storing event entities

// createExitAlchemicaEvent removed - no longer storing event entities

// createEquipInstallationEvent removed - no longer storing event entities

// createUnequipInstallationEvent removed - no longer storing event entities

// createEquipTileEvent removed - no longer storing event entities

// createUnequipTileEvent removed - no longer storing event entities

// createInstallationUpgradedEvent removed - no longer storing event entities

export const createParcelInstallation = (
    parcel: Parcel,
    installationId: BigInt
): Parcel => {
    let installations = parcel.equippedInstallations;
    let id = installationId.toString();

    // Find if this installation type already exists
    let existingIndex = installations.indexOf(id);

    if (existingIndex === -1) {
        // First installation of this type - add to array
        installations.push(id);
    }

    // Always increment total balance
    parcel.equippedInstallations = installations;
    parcel.equippedInstallationsBalance = parcel.equippedInstallationsBalance.plus(
        BIGINT_ONE
    );

    return parcel;
};

export const removeParcelInstallation = (
    parcel: Parcel,
    installationId: BigInt
): Parcel => {
    let installations = parcel.equippedInstallations;
    let id = installationId.toString();

    // Find the installation type
    let existingIndex = installations.indexOf(id);

    if (existingIndex !== -1) {
        // Always decrement total balance
        parcel.equippedInstallationsBalance = parcel.equippedInstallationsBalance.minus(
            BIGINT_ONE
        );

        // Check if we need to remove this installation type from array
        // We need to count how many installations of this type remain
        let count = 0;
        for (let i = 0; i < installations.length; i++) {
            if (installations[i] == id) {
                count++;
            }
        }

        // If this was the only installation of this type, remove from array
        if (count === 1) {
            let newInstallations = new Array<string>();
            for (let i = 0; i < installations.length; i++) {
                if (i !== existingIndex) {
                    newInstallations.push(installations[i]);
                }
            }
            parcel.equippedInstallations = newInstallations;
        }
    }

    return parcel;
};

export const createParcelTile = (parcel: Parcel, tileId: BigInt): Parcel => {
    let tiles = parcel.equippedTiles;
    let id = tileId.toString();

    // Find if this tile type already exists
    let existingIndex = tiles.indexOf(id);

    if (existingIndex === -1) {
        // First tile of this type - add to array
        tiles.push(id);
    }

    // Always increment total balance
    parcel.equippedTiles = tiles;
    parcel.equippedTilesBalance = parcel.equippedTilesBalance.plus(BIGINT_ONE);
    return parcel;
};

export const removeParcelTile = (parcel: Parcel, tileId: BigInt): Parcel => {
    let tiles = parcel.equippedTiles;
    let id = tileId.toString();

    // Find the tile type
    let existingIndex = tiles.indexOf(id);

    if (existingIndex !== -1) {
        // Always decrement total balance
        parcel.equippedTilesBalance = parcel.equippedTilesBalance.minus(
            BIGINT_ONE
        );

        // Check if we need to remove this tile type from array
        // We need to count how many tiles of this type remain
        let count = 0;
        for (let i = 0; i < tiles.length; i++) {
            if (tiles[i] == id) {
                count++;
            }
        }

        // If this was the only tile of this type, remove from array
        if (count === 1) {
            let newTiles = new Array<string>();
            for (let i = 0; i < tiles.length; i++) {
                if (i !== existingIndex) {
                    newTiles.push(tiles[i]);
                }
            }
            parcel.equippedTiles = newTiles;
        }
    }

    return parcel;
};

// createMintParcelEvent removed - no longer storing event entities

// createParcelTransferEvent removed - no longer storing event entities

export const getOrCreatetypeNFTDisplayStatus = (
    event: NFTDisplayStatusUpdated
): NFTDisplayStatus => {
    let id = "";
    let stats = getStat(StatCategory.OVERALL);
    let tokens = stats.contracts;
    let index = tokens.indexOf(event.params._token);
    if (index == -1) {
        index = tokens.length;
        id = index.toString() + "-" + event.params._chainId.toString();
        tokens.push(event.params._token);
        stats.contracts = tokens;
        stats.save();
    } else {
        id = index.toString() + "-" + event.params._chainId.toString();
    }

    let entity = NFTDisplayStatus.load(id);
    if (!entity) {
        entity = new NFTDisplayStatus(id);
        entity.contractId = index;
    }

    return entity;
};

// createNFTDisplayStatusUpdatedEvent removed - no longer storing event entities

// createParcelAccessRightSetEvent removed - no longer storing event entities

export const getOrCreateParcelAccessRight = (
    realmId: BigInt,
    actionRight: BigInt
): ParcelAccessRight => {
    let id = realmId.toString() + "-" + actionRight.toString();
    let entity = ParcelAccessRight.load(id);
    if (!entity) {
        entity = new ParcelAccessRight(id);
        entity.actionRight = actionRight.toI32();
        entity.parcel = realmId.toString();
    }

    return entity;
};

// createBounceGateEventStartedEvent removed - no longer storing event entities

// createBounceGateEventCancelledEvent removed - no longer storing event entities

// createBounceGateEventPriorityAndDurationUpdatedEvent removed - no longer storing event entities

// getOrCreateBounceGateEvent removed - no longer storing event entities
