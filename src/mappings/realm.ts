import { BigInt, dataSource, log } from "@graphprotocol/graph-ts";
import {
    AlchemicaClaimed,
    ChannelAlchemica,
    EquipInstallation,
    EquipTile,
    ExitAlchemica,
    MintParcel,
    InstallationUpgraded,
    Transfer,
    UnequipInstallation,
    UnequipTile,
    ResyncParcel,
    RealmDiamond,
    NFTDisplayStatusUpdated,
    ParcelAccessRightSet,
    EventStarted,
    EventCancelled,
    EventPriorityAndDurationUpdated,
    ParcelWhitelistSet,
    SurveyParcel,
    MigrateResyncParcel,
} from "../../generated/RealmDiamond/RealmDiamond";
import { ParcelWhitelistSetEvent } from "../../generated/schema";
import {
    BIGINT_ONE,
    NETWORK_CONSTANTS,
    REALM_DIAMOND,
    StatCategory,
} from "../helper/constants";
import {
    getOrCreateInstallation,
    getOrCreateInstallationType,
} from "../helper/installation";
import {
    createAlchemicaClaimedEvent,
    createBounceGateEventCancelledEvent,
    createBounceGateEventPriorityAndDurationUpdatedEvent,
    createBounceGateEventStartedEvent,
    createChannelAlchemicaEvent,
    createEquipInstallationEvent,
    createEquipTileEvent,
    createExitAlchemicaEvent,
    createInstallationUpgradedEvent,
    createMintParcelEvent,
    createNFTDisplayStatusUpdatedEvent,
    createParcelAccessRightSetEvent,
    createParcelInstallation,
    createParcelTile,
    createParcelTransferEvent,
    createUnequipInstallationEvent,
    createUnequipTileEvent,
    getOrCreateBounceGateEvent,
    getOrCreateGotchi,
    getOrCreateParcel,
    getOrCreateParcelAccessRight,
    getOrCreatetypeNFTDisplayStatus,
    removeParcelInstallation,
    removeParcelTile,
    updateParcelInfo,
} from "../helper/realm";
import {
    getStat,
    updateAlchemicaClaimedStats,
    updateChannelAlchemicaStats,
    updateExitedAlchemicaStats,
    updateInstallationEquippedStats,
    updateInstallationUnequippedStats,
    updateInstallationUpgradedStats,
    updateTileEquippedStats,
    updateTileUnequippedStats,
} from "../helper/stats";
import { getOrCreateTile, getOrCreateTileType } from "../helper/tiles";

export function handleChannelAlchemica(event: ChannelAlchemica): void {
    // create and persist event
    let eventEntity = createChannelAlchemicaEvent(event);
    eventEntity.save();

    // update gotchi and parcel entities
    let gotchi = getOrCreateGotchi(event.params._gotchiId);
    gotchi.lastChanneledAlchemica = event.block.timestamp;
    gotchi.save();

    let parcel = getOrCreateParcel(event.params._realmId);
    parcel.lastChanneledAlchemica = event.block.timestamp;
    parcel.save();

    // update stats
    let gotchiStats = getStat(StatCategory.GOTCHI, eventEntity.gotchi);
    gotchiStats.countChannelAlchemicaEvents = gotchiStats.countChannelAlchemicaEvents.plus(
        BIGINT_ONE
    );
    gotchiStats = updateChannelAlchemicaStats(
        gotchiStats,
        event.params._alchemica
    );
    gotchiStats.save();

    let parcelStats = getStat(StatCategory.PARCEL, eventEntity.parcel);
    parcelStats.countChannelAlchemicaEvents = parcelStats.countChannelAlchemicaEvents.plus(
        BIGINT_ONE
    );
    parcelStats = updateChannelAlchemicaStats(
        parcelStats,
        event.params._alchemica
    );
    parcelStats.save();

    let userStats = getStat(
        StatCategory.USER,
        event.transaction.from.toHexString()
    );
    userStats.countChannelAlchemicaEvents = userStats.countChannelAlchemicaEvents.plus(
        BIGINT_ONE
    );
    userStats = updateChannelAlchemicaStats(userStats, event.params._alchemica);
    userStats.save();

    let overallStats = getStat(StatCategory.OVERALL);
    overallStats.countChannelAlchemicaEvents = overallStats.countChannelAlchemicaEvents.plus(
        BIGINT_ONE
    );
    overallStats = updateChannelAlchemicaStats(
        overallStats,
        event.params._alchemica
    );
    overallStats.save();
}

export function handleExitAlchemica(event: ExitAlchemica): void {
    let eventEntity = createExitAlchemicaEvent(event);
    eventEntity.save();

    // stats
    let overallStats = getStat(StatCategory.OVERALL);
    overallStats = updateExitedAlchemicaStats(
        overallStats,
        event.params._alchemica
    );
    overallStats.save();

    let userStats = getStat(
        StatCategory.USER,
        event.transaction.from.toHexString()
    );
    userStats = updateExitedAlchemicaStats(userStats, event.params._alchemica);
    userStats.save();

    let gotchiStats = getStat(
        StatCategory.GOTCHI,
        event.params._gotchiId.toString()
    );
    gotchiStats = updateExitedAlchemicaStats(
        gotchiStats,
        event.params._alchemica
    );
    gotchiStats.save();
}

export function handleAlchemicaClaimed(event: AlchemicaClaimed): void {
    let eventEntity = createAlchemicaClaimedEvent(event);
    eventEntity.save();

    // set last claim alchemica
    let parcel = getOrCreateParcel(event.params._realmId);
    parcel.lastClaimedAlchemica = event.block.timestamp;

    let alchemicas = parcel.remainingAlchemica;
    let entry = alchemicas[event.params._alchemicaType.toI32()];
    alchemicas[event.params._alchemicaType.toI32()] = entry.minus(
        event.params._amount
    );
    parcel.remainingAlchemica = alchemicas;

    // Update the total claimed alchemica for this parcel
    let totalClaimed = parcel.totalAlchemicaClaimed;
    totalClaimed[event.params._alchemicaType.toI32()] = totalClaimed[
        event.params._alchemicaType.toI32()
    ].plus(event.params._amount);
    parcel.totalAlchemicaClaimed = totalClaimed;

    parcel.save();

    // stats
    let overallStats = getStat(StatCategory.OVERALL);
    overallStats = updateAlchemicaClaimedStats(
        overallStats,
        event.params._alchemicaType.toI32(),
        event.params._amount
    );
    overallStats.save();

    let userStats = getStat(
        StatCategory.USER,
        event.transaction.from.toHexString()
    );
    userStats = updateAlchemicaClaimedStats(
        userStats,
        event.params._alchemicaType.toI32(),
        event.params._amount
    );
    userStats.save();

    let gotchiStats = getStat(
        StatCategory.GOTCHI,
        event.params._gotchiId.toString()
    );
    gotchiStats = updateAlchemicaClaimedStats(
        gotchiStats,
        event.params._alchemicaType.toI32(),
        event.params._amount
    );
    gotchiStats.save();

    let parcelStats = getStat(
        StatCategory.PARCEL,
        event.params._realmId.toString()
    );
    parcelStats = updateAlchemicaClaimedStats(
        parcelStats,
        event.params._alchemicaType.toI32(),
        event.params._amount
    );
    parcelStats.save();
}

export function handleEquipInstallation(event: EquipInstallation): void {
    let eventEntity = createEquipInstallationEvent(event);
    eventEntity.save();

    // create if not exist
    let parcel = getOrCreateParcel(event.params._realmId);
    parcel = createParcelInstallation(parcel, event.params._installationId);
    parcel.save();

    let params = event.params;
    let installation = getOrCreateInstallation(
        params._installationId,
        params._realmId,
        params._x,
        params._y,
        event.transaction.from
    );
    installation.equipped = true;
    installation.save();

    // update stats
    let parcelStats = getStat(StatCategory.PARCEL, eventEntity.parcel);
    parcelStats.countParcelInstallations = parcelStats.countParcelInstallations.plus(
        BIGINT_ONE
    );
    parcelStats = updateInstallationEquippedStats(parcelStats);
    parcelStats.save();

    let overallStats = getStat(StatCategory.OVERALL);
    overallStats.countParcelInstallations = overallStats.countParcelInstallations.plus(
        BIGINT_ONE
    );
    overallStats = updateInstallationEquippedStats(overallStats);
    overallStats.save();

    let userStats = getStat(
        StatCategory.USER,
        event.transaction.from.toHexString()
    );
    userStats.countParcelInstallations = userStats.countParcelInstallations.plus(
        BIGINT_ONE
    );
    userStats = updateInstallationEquippedStats(userStats);
    userStats.save();
}

export function handleUnequipInstallation(event: UnequipInstallation): void {
    let eventEntity = createUnequipInstallationEvent(event);
    eventEntity.save();

    let parcel = getOrCreateParcel(event.params._realmId);
    parcel = removeParcelInstallation(parcel, event.params._installationId);
    parcel.save();

    // update stats
    let userStats = getStat(
        StatCategory.USER,
        event.transaction.from.toHexString()
    );
    userStats = updateInstallationUnequippedStats(userStats);
    userStats.save();

    let parcelStats = getStat(StatCategory.PARCEL, eventEntity.parcel);
    parcelStats = updateInstallationUnequippedStats(parcelStats);
    parcelStats.save();

    let overallStats = getStat(StatCategory.OVERALL);
    overallStats = updateInstallationUnequippedStats(overallStats);
    overallStats.save();

    // unequip
    let params = event.params;
    let installation = getOrCreateInstallation(
        params._installationId,
        params._realmId,
        params._x,
        params._y,
        event.transaction.from
    );
    installation.equipped = false;
    installation.save();
}

export function handleInstallationUpgraded(event: InstallationUpgraded): void {
    let eventEntity = createInstallationUpgradedEvent(event);
    eventEntity.save();

    let type = getOrCreateInstallationType(event.params._nextInstallationId);
    type.save();

    let parcel = getOrCreateParcel(event.params._realmId);
    parcel = removeParcelInstallation(parcel, event.params._prevInstallationId);
    parcel = createParcelInstallation(parcel, event.params._nextInstallationId);
    parcel.save();

    // stats
    let overallStats = getStat(StatCategory.OVERALL);
    overallStats = updateInstallationUpgradedStats(overallStats);
    overallStats.save();

    let userStats = getStat(
        StatCategory.USER,
        event.transaction.from.toHexString()
    );
    userStats = updateInstallationUpgradedStats(userStats);
    userStats.save();

    let parcelStats = getStat(
        StatCategory.PARCEL,
        event.params._realmId.toString()
    );
    parcelStats = updateInstallationUpgradedStats(parcelStats);
    parcelStats.save();
    // unequip old
    let params = event.params;
    let installation = getOrCreateInstallation(
        params._prevInstallationId,
        params._realmId,
        params._coordinateX,
        params._coordinateY,
        event.transaction.from
    );
    installation.equipped = false;
    installation.save();

    // equip new
    installation = getOrCreateInstallation(
        params._nextInstallationId,
        params._realmId,
        params._coordinateX,
        params._coordinateY,
        event.transaction.from
    );
    installation.equipped = true;
    installation.save();
}

export function handleEquipTile(event: EquipTile): void {
    let eventEntity = createEquipTileEvent(event);
    eventEntity.save();

    let tileType = getOrCreateTileType(event.params._tileId);
    tileType.save();

    let parcel = getOrCreateParcel(event.params._realmId);
    parcel = createParcelTile(parcel, event.params._tileId);
    parcel.save();

    let x = event.params._x;
    let y = event.params._y;
    let tile = getOrCreateTile(parcel, tileType, x, y);
    tile.equipped = true;
    tile.save();

    // stats
    let userStats = getStat(
        StatCategory.USER,
        event.transaction.from.toHexString()
    );
    userStats = updateTileEquippedStats(userStats);
    userStats.save();

    let overallStats = getStat(StatCategory.OVERALL);
    overallStats = updateTileEquippedStats(overallStats);
    overallStats.save();

    let parcelStats = getStat(StatCategory.PARCEL, eventEntity.parcel!);
    parcelStats = updateTileEquippedStats(parcelStats);
    parcelStats.save();
}

export function handleUnequipTile(event: UnequipTile): void {
    // event
    let eventEntity = createUnequipTileEvent(event);
    eventEntity.save();

    let tileType = getOrCreateTileType(event.params._tileId);
    tileType.save();

    let parcel = getOrCreateParcel(event.params._realmId);

    parcel = removeParcelTile(parcel, event.params._tileId);
    parcel.save();

    let tile = getOrCreateTile(
        parcel,
        tileType,
        event.params._x,
        event.params._y
    );
    tile.equipped = false;
    tile.save();

    // stats
    let userStats = getStat(
        StatCategory.USER,
        event.transaction.from.toHexString()
    );
    userStats = updateTileUnequippedStats(userStats);
    userStats.save();

    let overallStats = getStat(StatCategory.OVERALL);
    overallStats = updateTileUnequippedStats(overallStats);
    overallStats.save();

    let parcelStats = getStat(StatCategory.PARCEL, eventEntity.parcel!);
    parcelStats = updateTileUnequippedStats(parcelStats);
    parcelStats.save();
}

export function handleMintParcel(event: MintParcel): void {
    // event
    let eventEntity = createMintParcelEvent(event);
    eventEntity.save();

    // maintain owner in parcel entity
    let parcel = getOrCreateParcel(event.params._tokenId);
    parcel.owner = event.params._owner;
    parcel.save();
}

export function handleTransfer(event: Transfer): void {
    // event
    let eventEntity = createParcelTransferEvent(event);
    eventEntity.save();

    // maintain parcel owner field
    let parcel = getOrCreateParcel(event.params._tokenId);
    parcel.owner = event.params._to;
    parcel.save();
}

export function handleResyncParcel(event: ResyncParcel): void {
    let parcel = getOrCreateParcel(event.params._tokenId);

    const currentNetwork = dataSource.network();
    const isBaseSepolia = currentNetwork == "base-sepolia";

    parcel = updateParcelInfo(parcel, isBaseSepolia);

    parcel.save();
}

export function handleNFTDisplayStatusUpdated(
    event: NFTDisplayStatusUpdated
): void {
    let eventEntity = createNFTDisplayStatusUpdatedEvent(event);
    eventEntity.save();

    let entity = getOrCreatetypeNFTDisplayStatus(event);
    entity.chainId = event.params._chainId.toI32();
    entity.contractAddress = event.params._token;
    entity.allowed = event.params._allowed;
    entity.save();
}

export function handleParcelAccessRightSet(event: ParcelAccessRightSet): void {
    // event
    let eventEntity = createParcelAccessRightSetEvent(event);
    eventEntity.save();

    // parcel
    let parcel = getOrCreateParcel(event.params._realmId);
    parcel.save();

    // entity
    let entity = getOrCreateParcelAccessRight(
        event.params._realmId,
        event.params._actionRight
    );
    entity.accessRight = event.params._accessRight.toI32();
    entity.save();
}

export function handleBounceGateEventStarted(event: EventStarted): void {
    let eventEntity = createBounceGateEventStartedEvent(event);
    eventEntity.save();

    let entity = getOrCreateBounceGateEvent(event.params._eventId);
    entity.startTime = event.params.eventDetails.startTime;
    entity.endTime = event.params.eventDetails.endTime;
    entity.cancelled = false;
    entity.title = event.params.eventDetails.title;

    entity.priority = event.params.eventDetails.priority;

    entity.equipped = event.params.eventDetails.equipped;
    entity.lastTimeUpdated = event.block.timestamp;

    entity.creator = event.transaction.from;
    entity.save();
}

export function handleBounceGateEventCancelled(event: EventCancelled): void {
    let eventEntity = createBounceGateEventCancelledEvent(event);
    eventEntity.save();

    let entity = getOrCreateBounceGateEvent(event.params._eventId);
    entity.endTime = event.block.timestamp;
    entity.cancelled = true;
    entity.lastTimeUpdated = event.block.timestamp;
    entity.save();
}

export function handleBounceGateEventPriorityAndDurationUpdated(
    event: EventPriorityAndDurationUpdated
): void {
    let eventEntity = createBounceGateEventPriorityAndDurationUpdatedEvent(
        event
    );
    eventEntity.save();

    let entity = getOrCreateBounceGateEvent(event.params._eventId);
    entity.priority = event.params._newPriority;
    entity.endTime = event.params._newEndTime;
    entity.lastTimeUpdated = event.block.timestamp;
    entity.save();
}

export function handleParcelWhitelistSet(event: ParcelWhitelistSet): void {
    // add event entity
    let eventEntity = new ParcelWhitelistSetEvent(
        event.transaction.hash.toHexString() + "/" + event.logIndex.toString()
    );
    eventEntity.block = event.block.number;
    eventEntity.timestamp = event.block.timestamp;
    eventEntity.contract = event.address;
    eventEntity.transaction = event.transaction.hash;
    eventEntity.actionRight = event.params._actionRight.toI32();
    eventEntity.whitelistId = event.params._whitelistId.toI32();
    eventEntity.realmId = event.params._realmId.toI32();
    eventEntity.save();

    // update ParcelAccessRight for Whitelist
    let parEntity = getOrCreateParcelAccessRight(
        event.params._realmId,
        event.params._actionRight
    );
    parEntity.accessRight = 2;
    parEntity.whitelistId = event.params._whitelistId.toI32();
    parEntity.save();
}

export function handleSurveyParcel(event: SurveyParcel): void {
    let entity = getOrCreateParcel(event.params._tokenId);

    let alchemica = entity.remainingAlchemica;
    for (let i = 0; i < event.params._alchemicas.length; i++) {
        alchemica[i] = alchemica[i].plus(event.params._alchemicas[i]);
    }

    entity.surveyRound = entity.surveyRound + 1;
    entity.remainingAlchemica = alchemica;
    entity.save();
}

// This is used for migration data to set installations and tiles entities
export function handleMigrateResyncParcel(event: MigrateResyncParcel): void {
    const parcels = event.params._parcelEquippedData;

    for (let i = 0; i < parcels.length; i++) {
        const parcelData = parcels[i];
        const realmId = parcelData.realmId;

        log.info("Processing parcel {} with {} installations and {} tiles", [
            realmId.toString(),
            parcelData.installations.length.toString(),
            parcelData.tiles.length.toString(),
        ]);

        // Get or create the parcel
        let parcel = getOrCreateParcel(realmId);

        // STEP 1: Unequip all previously equipped installations
        let previousInstallations = parcel.equippedInstallations;
        for (let p = 0; p < previousInstallations.length; p++) {
            let installationTypeId = BigInt.fromString(
                previousInstallations[p]
            );

            // We need to find and unequip installations of this type on this parcel
            // Since we don't have coordinates, we'll search by parcel and type
            // This is a limitation - we'd need to track installation IDs differently for perfect cleanup
            parcel = removeParcelInstallation(parcel, installationTypeId);
        }

        // STEP 2: Unequip all previously equipped tiles
        let previousTiles = parcel.equippedTiles;
        for (let q = 0; q < previousTiles.length; q++) {
            let tileTypeId = BigInt.fromString(previousTiles[q]);
            parcel = removeParcelTile(parcel, tileTypeId);
        }

        // Clear the equipped arrays to start fresh
        parcel.equippedInstallations = new Array<string>();
        parcel.equippedTiles = new Array<string>();

        // STEP 3: Equip installations from the new event
        for (let j = 0; j < parcelData.installations.length; j++) {
            const installationData = parcelData.installations[j];

            log.info("Adding installation type {} at ({}, {}) to parcel {}", [
                installationData.installationType.toString(),
                installationData.x.toString(),
                installationData.y.toString(),
                realmId.toString(),
            ]);

            // Add to parcel's equipped list
            parcel = createParcelInstallation(
                parcel,
                installationData.installationType
            );

            // Create/update installation entity
            let installation = getOrCreateInstallation(
                installationData.installationType,
                realmId,
                installationData.x,
                installationData.y,
                parcelData.owner
            );
            installation.equipped = true;
            installation.save();

            // Update installation type
            let installationType = getOrCreateInstallationType(
                installationData.installationType
            );
            installationType.save();
        }

        // STEP 4: Equip tiles from the new event
        for (let k = 0; k < parcelData.tiles.length; k++) {
            const tileData = parcelData.tiles[k];

            log.info("Adding tile type {} at ({}, {}) to parcel {}", [
                tileData.tileType.toString(),
                tileData.x.toString(),
                tileData.y.toString(),
                realmId.toString(),
            ]);

            // Add to parcel's equipped list
            log.info("Before createParcelTile - parcel has {} tiles: [{}]", [
                parcel.equippedTiles.length.toString(),
                parcel.equippedTiles.join(", "),
            ]);

            parcel = createParcelTile(parcel, tileData.tileType);

            log.info("After createParcelTile - parcel has {} tiles: [{}]", [
                parcel.equippedTiles.length.toString(),
                parcel.equippedTiles.join(", "),
            ]);

            // Create/update tile type
            let tileType = getOrCreateTileType(tileData.tileType);
            tileType.save();

            // Create/update tile entity
            let tile = getOrCreateTile(
                parcel,
                tileType,
                tileData.x,
                tileData.y
            );
            tile.equipped = true;
            tile.owner = parcelData.owner;

            log.info(
                "About to save tile entity {} with equipped={}, owner={}",
                [
                    tile.id,
                    tile.equipped.toString(),
                    tile.owner ? tile.owner!.toHexString() : "null",
                ]
            );

            tile.save();
            log.info("Tile entity {} saved successfully", [tile.id]);
        }

        // Log final state before saving
        log.info(
            "Final state - Parcel {} will have {} installations and {} tiles",
            [
                realmId.toString(),
                parcel.equippedInstallations.length.toString(),
                parcel.equippedTiles.length.toString(),
            ]
        );

        log.info("Installation IDs: [{}]", [
            parcel.equippedInstallations.join(", "),
        ]);
        log.info("Tile IDs: [{}]", [parcel.equippedTiles.join(", ")]);

        // Save the updated parcel
        parcel.save();

        // Add verification logging after save
        log.info("Parcel {} saved. Verifying data...", [realmId.toString()]);

        // Re-load the parcel to verify it was saved correctly
        let verifyParcel = getOrCreateParcel(realmId);
        log.info(
            "After save verification - Parcel {} has {} installations and {} tiles",
            [
                realmId.toString(),
                verifyParcel.equippedInstallations.length.toString(),
                verifyParcel.equippedTiles.length.toString(),
            ]
        );
        log.info("Verified Installation IDs: [{}]", [
            verifyParcel.equippedInstallations.join(", "),
        ]);
        log.info("Verified Tile IDs: [{}]", [
            verifyParcel.equippedTiles.join(", "),
        ]);
    }
}
