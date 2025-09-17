import { BigInt, log } from "@graphprotocol/graph-ts";
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
        parcel.equippedInstallationsBalance = new Array<BigInt>();
        parcel.equippedTilesBalance = new Array<BigInt>();
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

            // Extract installation IDs and balances from the structured array
            let installationIds = new Array<string>();
            let installationBalances = new Array<BigInt>();
            for (
                let i = 0;
                i < parcelMetadata.equippedInstallations.length;
                i++
            ) {
                let item = parcelMetadata.equippedInstallations[i];
                let installationId = item.installationId.toString();
                let balance = item.balance;

                installationIds.push(installationId);
                installationBalances.push(balance);
            }
            parcel.equippedInstallations = installationIds;
            parcel.equippedInstallationsBalance = installationBalances;

            // Extract tile IDs and balances from the structured array
            let tileIds = new Array<string>();
            let tileBalances = new Array<BigInt>();
            for (let i = 0; i < parcelMetadata.equippedTiles.length; i++) {
                let item = parcelMetadata.equippedTiles[i];
                let tileId = item.tileId.toString();
                let balance = item.balance;

                tileIds.push(tileId);
                tileBalances.push(balance);
            }
            parcel.equippedTiles = tileIds;
            parcel.equippedTilesBalance = tileBalances;

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
    let installationsBalance = parcel.equippedInstallationsBalance;
    let id = installationId.toString();

    // Find if this installation type already exists
    let existingIndex = installations.indexOf(id);

    if (existingIndex === -1) {
        // First installation of this type - add to arrays
        installations.push(id);
        installationsBalance.push(BIGINT_ONE);
    } else {
        // Installation type exists - increment balance
        installationsBalance[existingIndex] = installationsBalance[
            existingIndex
        ].plus(BIGINT_ONE);
    }

    parcel.equippedInstallations = installations;
    parcel.equippedInstallationsBalance = installationsBalance;
    return parcel;
};

export const removeParcelInstallation = (
    parcel: Parcel,
    installationId: BigInt
): Parcel => {
    let installations = parcel.equippedInstallations;
    let installationsBalance = parcel.equippedInstallationsBalance;
    let id = installationId.toString();

    // Find the installation type
    let existingIndex = installations.indexOf(id);

    if (existingIndex !== -1) {
        // Decrement balance
        installationsBalance[existingIndex] = installationsBalance[
            existingIndex
        ].minus(BIGINT_ONE);

        // If balance reaches zero, remove from both arrays
        if (installationsBalance[existingIndex].equals(BIGINT_ZERO)) {
            let newInstallations = new Array<string>();
            let newInstallationsBalance = new Array<BigInt>();

            for (let i = 0; i < installations.length; i++) {
                if (i !== existingIndex) {
                    newInstallations.push(installations[i]);
                    newInstallationsBalance.push(installationsBalance[i]);
                }
            }

            parcel.equippedInstallations = newInstallations;
            parcel.equippedInstallationsBalance = newInstallationsBalance;
        } else {
            parcel.equippedInstallationsBalance = installationsBalance;
        }
    }

    return parcel;
};

export const createParcelTile = (parcel: Parcel, tileId: BigInt): Parcel => {
    let tiles = parcel.equippedTiles;
    let tilesBalance = parcel.equippedTilesBalance;
    let id = tileId.toString();

    // Find if this tile type already exists
    let existingIndex = tiles.indexOf(id);

    if (existingIndex === -1) {
        // First tile of this type - add to arrays
        tiles.push(id);
        tilesBalance.push(BIGINT_ONE);
    } else {
        // Tile type exists - increment balance
        tilesBalance[existingIndex] = tilesBalance[existingIndex].plus(
            BIGINT_ONE
        );
    }

    parcel.equippedTiles = tiles;
    parcel.equippedTilesBalance = tilesBalance;
    return parcel;
};

export const removeParcelTile = (parcel: Parcel, tileId: BigInt): Parcel => {
    let tiles = parcel.equippedTiles;
    let tilesBalance = parcel.equippedTilesBalance;
    let id = tileId.toString();

    // Find the tile type
    let existingIndex = tiles.indexOf(id);

    if (existingIndex !== -1) {
        // Decrement balance
        tilesBalance[existingIndex] = tilesBalance[existingIndex].minus(
            BIGINT_ONE
        );

        // If balance reaches zero, remove from both arrays
        if (tilesBalance[existingIndex].equals(BIGINT_ZERO)) {
            let newTiles = new Array<string>();
            let newTilesBalance = new Array<BigInt>();

            for (let i = 0; i < tiles.length; i++) {
                if (i !== existingIndex) {
                    newTiles.push(tiles[i]);
                    newTilesBalance.push(tilesBalance[i]);
                }
            }

            parcel.equippedTiles = newTiles;
            parcel.equippedTilesBalance = newTilesBalance;
        } else {
            parcel.equippedTilesBalance = tilesBalance;
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
