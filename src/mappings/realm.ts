import { BigInt } from "@graphprotocol/graph-ts";
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
    ParcelWhitelistSet,
    SurveyParcel,
} from "../../generated/RealmDiamond/RealmDiamond";
// Removed ParcelWhitelistSetEvent import - no longer storing event entities
import { BIGINT_ONE, StatCategory } from "../helper/constants";
import {
    getOrCreateInstallation,
    getOrCreateInstallationType,
} from "../helper/installation";
import {
    createParcelInstallation,
    createParcelTile,
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
    // update gotchi and parcel entities
    let gotchi = getOrCreateGotchi(event.params._gotchiId);
    gotchi.lastChanneledAlchemica = event.block.timestamp;
    gotchi.save();

    let parcel = getOrCreateParcel(event.params._realmId);
    parcel.lastChanneledAlchemica = event.block.timestamp;
    parcel.save();

    // update stats
    let gotchiStats = getStat(
        StatCategory.GOTCHI,
        event.params._gotchiId.toString()
    );
    gotchiStats.countChannelAlchemicaEvents = gotchiStats.countChannelAlchemicaEvents.plus(
        BIGINT_ONE
    );
    gotchiStats = updateChannelAlchemicaStats(
        gotchiStats,
        event.params._alchemica
    );
    gotchiStats.save();

    let parcelStats = getStat(
        StatCategory.PARCEL,
        event.params._realmId.toString()
    );
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
    // Event entity creation removed - no longer storing event entities

    // set last claim alchemica
    let parcel = getOrCreateParcel(event.params._realmId);
    parcel.lastClaimedAlchemica = event.block.timestamp;

    let alchemicas = parcel.remainingAlchemica;
    let entry = alchemicas[event.params._alchemicaType.toI32()];
    alchemicas[event.params._alchemicaType.toI32()] = entry.minus(
        event.params._amount
    );
    parcel.remainingAlchemica = alchemicas;

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
    // Event entity creation removed - no longer storing event entities

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
    let parcelStats = getStat(
        StatCategory.PARCEL,
        event.params._realmId.toString()
    );
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
    // Event entity creation removed - no longer storing event entities

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

    let parcelStats = getStat(
        StatCategory.PARCEL,
        event.params._realmId.toString()
    );
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
    // Event entity creation removed - no longer storing event entities

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
    // Event entity creation removed - no longer storing event entities

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

    let parcelStats = getStat(
        StatCategory.PARCEL,
        event.params._realmId.toString()
    );
    parcelStats = updateTileEquippedStats(parcelStats);
    parcelStats.save();
}

export function handleUnequipTile(event: UnequipTile): void {
    // event
    // Event entity creation removed - no longer storing event entities

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

    let parcelStats = getStat(
        StatCategory.PARCEL,
        event.params._realmId.toString()
    );
    parcelStats = updateTileUnequippedStats(parcelStats);
    parcelStats.save();
}

export function handleMintParcel(event: MintParcel): void {
    // event
    // Event entity creation removed - no longer storing event entities

    // maintain owner in parcel entity
    let parcel = getOrCreateParcel(event.params._tokenId);
    parcel.owner = event.params._owner;
    parcel.save();
}

export function handleTransfer(event: Transfer): void {
    // event
    // Event entity creation removed - no longer storing event entities

    // maintain parcel owner field
    let parcel = getOrCreateParcel(event.params._tokenId);
    parcel.owner = event.params._to;
    parcel.save();
}

export function handleResyncParcel(event: ResyncParcel): void {
    let parcel = getOrCreateParcel(event.params._tokenId);
    parcel = updateParcelInfo(parcel);
    parcel.save();
}

export function handleNFTDisplayStatusUpdated(
    event: NFTDisplayStatusUpdated
): void {
    // Event entity creation removed - no longer storing event entities

    let entity = getOrCreatetypeNFTDisplayStatus(event);
    entity.chainId = event.params._chainId.toI32();
    entity.contractAddress = event.params._token;
    entity.allowed = event.params._allowed;
    entity.save();
}

export function handleParcelAccessRightSet(event: ParcelAccessRightSet): void {
    // event
    // Event entity creation removed - no longer storing event entities

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

// Removed empty BounceGateEvent handlers - they only created event entities with no other business logic

export function handleParcelWhitelistSet(event: ParcelWhitelistSet): void {
    // Event entity creation removed - no longer storing event entities

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
