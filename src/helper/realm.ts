import { BigInt, log } from "@graphprotocol/graph-ts";
import {
    AlchemicaClaimed,
    ChannelAlchemica,
    EquipInstallation,
    EquipTile,
    EventCancelled,
    EventPriorityAndDurationUpdated,
    EventStarted,
    ExitAlchemica,
    InstallationUpgraded,
    MintParcel,
    NFTDisplayStatusUpdated,
    ParcelAccessRightSet,
    RealmDiamond,
    SurveyParcel,
    Transfer,
    UnequipInstallation,
    UnequipTile,
} from "../../generated/RealmDiamond/RealmDiamond";
import {
    AlchemicaClaimedEvent,
    BounceGateEvent,
    BounceGateEventCancelled,
    BounceGateEventPriorityAndDurationUpdated,
    BounceGateEventStarted,
    ChannelAlchemicaEvent,
    EquipInstallationEvent,
    EquipTileEvent,
    ExitAlchemicaEvent,
    Gotchi,
    InstallationUpgradedEvent,
    MintParcelEvent,
    NFTDisplayStatus,
    NFTDisplayStatusUpdatedEvent,
    Parcel,
    ParcelAccessRight,
    ParcelAccessRightSetEvent,
    TransferEvent,
    UnequipInstallationEvent,
    UnequipTileEvent,
} from "../../generated/schema";
import { BIGINT_ZERO, REALM_DIAMOND, StatCategory } from "./constants";
import { getStat } from "./stats";

export const getOrCreateParcel = (realmId: BigInt): Parcel => {
    let id = realmId.toString();
    let parcel = Parcel.load(id);
    if (!parcel) {
        parcel = new Parcel(id);
        parcel.equippedInstallations = new Array<string>();
        parcel.equippedTiles = new Array<string>();
        parcel.remainingAlchemica = [
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
    resync: boolean = false
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

        if (resync) {
            parcel.surveyRound = parcelMetadata.surveyRound.toI32();
            parcel.remainingAlchemica = parcelMetadata.alchemicaRemaining;

            // Extract installation IDs from the structured array
            parcel.equippedInstallations = parcelMetadata.equippedInstallations.map<
                string
            >(item => item.installationId.toString());

            // Extract tile IDs from the structured array
            parcel.equippedTiles = parcelMetadata.equippedTiles.map<string>(
                item => item.tileId.toString()
            );

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

export const createChannelAlchemicaEvent = (
    event: ChannelAlchemica
): ChannelAlchemicaEvent => {
    let id =
        event.transaction.hash.toHexString() + "/" + event.logIndex.toString();
    let eventEntity = new ChannelAlchemicaEvent(id);
    eventEntity.gotchi = event.params._gotchiId.toString();
    eventEntity.parcel = event.params._realmId.toString();

    eventEntity.transaction = event.transaction.hash;
    eventEntity.block = event.block.number;
    eventEntity.timestamp = event.block.timestamp;

    eventEntity.spilloverRadius = event.params._spilloverRadius;
    eventEntity.spilloverRate = event.params._spilloverRate;
    eventEntity.alchemica = event.params._alchemica;
    eventEntity.realmId = event.params._realmId;
    eventEntity.gotchiId = event.params._gotchiId;

    return eventEntity;
};

export const createAlchemicaClaimedEvent = (
    event: AlchemicaClaimed
): AlchemicaClaimedEvent => {
    let id =
        event.transaction.hash.toHexString() + "/" + event.logIndex.toString();
    let eventEntity = new AlchemicaClaimedEvent(id);
    eventEntity.transaction = event.transaction.hash;
    eventEntity.block = event.block.number;
    eventEntity.timestamp = event.block.timestamp;
    eventEntity.gotchi = event.params._gotchiId.toString();
    eventEntity.parcel = event.params._realmId.toString();
    eventEntity.alchemicaType = event.params._alchemicaType;
    eventEntity.amount = event.params._amount;
    eventEntity.spilloverRadius = event.params._spilloverRadius;
    eventEntity.spilloverRate = event.params._spilloverRate;
    eventEntity.realmId = event.params._realmId;
    eventEntity.gotchiId = event.params._gotchiId;
    return eventEntity;
};

export const createExitAlchemicaEvent = (
    event: ExitAlchemica
): ExitAlchemicaEvent => {
    let id =
        event.transaction.hash.toHexString() + "/" + event.logIndex.toString();
    let eventEntity = new ExitAlchemicaEvent(id);
    eventEntity.transaction = event.transaction.hash;
    eventEntity.block = event.block.number;
    eventEntity.timestamp = event.block.timestamp;
    eventEntity.gotchi = event.params._gotchiId.toString();
    eventEntity.alchemica = event.params._alchemica;
    eventEntity.gotchiId = event.params._gotchiId;
    return eventEntity;
};

export const createEquipInstallationEvent = (
    event: EquipInstallation
): EquipInstallationEvent => {
    let id =
        event.transaction.hash.toHexString() + "/" + event.logIndex.toString();
    let eventEntity = new EquipInstallationEvent(id);
    eventEntity.transaction = event.transaction.hash;
    eventEntity.block = event.block.number;
    eventEntity.timestamp = event.block.timestamp;
    eventEntity.installation = event.params._installationId.toString();
    eventEntity.parcel = event.params._realmId.toString();
    eventEntity.x = event.params._x;
    eventEntity.y = event.params._y;
    eventEntity.realmId = event.params._realmId;
    eventEntity.installationId = event.params._installationId;
    return eventEntity;
};

export const createUnequipInstallationEvent = (
    event: UnequipInstallation
): UnequipInstallationEvent => {
    let id =
        event.transaction.hash.toHexString() + "/" + event.logIndex.toString();
    let eventEntity = new UnequipInstallationEvent(id);
    eventEntity.transaction = event.transaction.hash;
    eventEntity.block = event.block.number;
    eventEntity.timestamp = event.block.timestamp;
    eventEntity.installation = event.params._installationId.toString();
    eventEntity.parcel = event.params._realmId.toString();
    eventEntity.x = event.params._x;
    eventEntity.y = event.params._y;
    eventEntity.realmId = event.params._realmId;
    eventEntity.installationId = event.params._installationId;
    return eventEntity;
};

export const createEquipTileEvent = (event: EquipTile): EquipTileEvent => {
    let id =
        event.transaction.hash.toHexString() + "/" + event.logIndex.toString();
    let eventEntity = new EquipTileEvent(id);
    eventEntity.transaction = event.transaction.hash;
    eventEntity.block = event.block.number;
    eventEntity.timestamp = event.block.timestamp;
    eventEntity.tile = event.params._tileId.toString();
    eventEntity.parcel = event.params._realmId.toString();
    eventEntity.x = event.params._x;
    eventEntity.y = event.params._y;
    eventEntity.realmId = event.params._realmId;
    eventEntity.tileId = event.params._tileId;
    return eventEntity;
};

export const createUnequipTileEvent = (
    event: UnequipTile
): UnequipTileEvent => {
    let id =
        event.transaction.hash.toHexString() + "/" + event.logIndex.toString();
    let eventEntity = new UnequipTileEvent(id);
    eventEntity.transaction = event.transaction.hash;
    eventEntity.block = event.block.number;
    eventEntity.timestamp = event.block.timestamp;
    eventEntity.tile = event.params._tileId.toString();
    eventEntity.parcel = event.params._realmId.toString();
    eventEntity.x = event.params._x;
    eventEntity.y = event.params._y;
    eventEntity.realmId = event.params._realmId;
    eventEntity.tileId = event.params._tileId;
    return eventEntity;
};

export const createInstallationUpgradedEvent = (
    event: InstallationUpgraded
): InstallationUpgradedEvent => {
    let id =
        event.transaction.hash.toHexString() + "/" + event.logIndex.toString();
    let eventEntity = new InstallationUpgradedEvent(id);
    eventEntity.transaction = event.transaction.hash;
    eventEntity.block = event.block.number;
    eventEntity.timestamp = event.block.timestamp;
    eventEntity.prevInstallation = event.params._prevInstallationId.toString();
    eventEntity.nextInstallation = event.params._nextInstallationId.toString();
    eventEntity.parcel = event.params._realmId.toString();
    eventEntity.x = event.params._coordinateX;
    eventEntity.y = event.params._coordinateY;
    return eventEntity;
};

export const createParcelInstallation = (
    parcel: Parcel,
    installationId: BigInt
): Parcel => {
    let installations = parcel.equippedInstallations;
    let id = installationId.toString();
    installations.push(id);
    parcel.equippedInstallations = installations;
    return parcel;
};

export const removeParcelInstallation = (
    parcel: Parcel,
    installationId: BigInt
): Parcel => {
    let installations = parcel.equippedInstallations;
    let newInstallations = new Array<string>();
    let id = installationId.toString();
    for (let i = 0; i < installations.length; i++) {
        let item = installations[i];
        if (item != id) {
            newInstallations.push(item);
        }
    }
    parcel.equippedInstallations = newInstallations;
    return parcel;
};

export const createParcelTile = (parcel: Parcel, tileId: BigInt): Parcel => {
    let tiles = parcel.equippedTiles;
    let id = tileId.toString();
    tiles.push(id);
    parcel.equippedTiles = tiles;
    return parcel;
};

export const removeParcelTile = (parcel: Parcel, tileId: BigInt): Parcel => {
    let tiles = parcel.equippedTiles;
    let newTiles = new Array<string>();
    let id = tileId.toString();
    for (let i = 0; i < tiles.length; i++) {
        let item = tiles[i];
        if (item != id) {
            newTiles.push(item);
        }
    }
    parcel.equippedTiles = newTiles;
    return parcel;
};

export const createMintParcelEvent = (event: MintParcel): MintParcelEvent => {
    let id =
        event.transaction.hash.toHexString() + "/" + event.logIndex.toString();
    let entity = new MintParcelEvent(id);
    entity.owner = event.params._owner;
    entity.tokenId = event.params._tokenId;
    entity.transaction = event.transaction.hash;
    entity.block = event.block.number;
    entity.timestamp = event.block.timestamp;
    entity.from = event.transaction.from;
    entity.to = event.transaction.to;
    return entity;
};

export const createParcelTransferEvent = (event: Transfer): TransferEvent => {
    let id =
        event.transaction.hash.toHexString() + "/" + event.logIndex.toString();
    let entity = new TransferEvent(id);
    entity.block = event.block.number;
    entity.timestamp = event.block.timestamp;
    entity.contract = event.address;
    entity.from = event.params._from;
    entity.to = event.params._to;
    entity.tokenId = event.params._tokenId;
    entity.transaction = event.transaction.hash;
    return entity;
};

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

export const createNFTDisplayStatusUpdatedEvent = (
    event: NFTDisplayStatusUpdated
): NFTDisplayStatusUpdatedEvent => {
    let id =
        event.transaction.hash.toHexString() + "/" + event.logIndex.toString();
    let entity = new NFTDisplayStatusUpdatedEvent(id);
    entity.block = event.block.number;
    entity.timestamp = event.block.timestamp;
    entity.contract = event.address;
    entity.token = event.params._token;
    entity.chainId = event.params._chainId.toI32();
    entity.allowed = event.params._allowed;
    entity.transaction = event.transaction.hash;
    return entity;
};

export const createParcelAccessRightSetEvent = (
    event: ParcelAccessRightSet
): ParcelAccessRightSetEvent => {
    let id =
        event.transaction.hash.toHexString() + "/" + event.logIndex.toString();
    let entity = new ParcelAccessRightSetEvent(id);
    entity.block = event.block.number;
    entity.timestamp = event.block.timestamp;
    entity.contract = event.address;
    entity.realmId = event.params._realmId.toI32();
    entity.accessRight = event.params._accessRight.toI32();
    entity.actionRight = event.params._actionRight.toI32();
    entity.transaction = event.transaction.hash;
    return entity;
};

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

export const createBounceGateEventStartedEvent = (
    event: EventStarted
): BounceGateEventStarted => {
    let id =
        event.transaction.hash.toHexString() + "/" + event.logIndex.toString();
    let entity = new BounceGateEventStarted(id);
    entity.block = event.block.number;
    entity.timestamp = event.block.timestamp;
    entity.contract = event.address;
    entity.transaction = event.transaction.hash;

    entity._eventId = event.params._eventId;
    entity._endTime = event.params.eventDetails.endTime;
    entity._equipped = event.params.eventDetails.equipped;
    entity._lastTimeUpdated = event.params.eventDetails.lastTimeUpdated;
    entity._priority = event.params.eventDetails.priority;
    entity._startTime = event.params.eventDetails.startTime;
    entity._title = event.params.eventDetails.title;

    return entity;
};

export const createBounceGateEventCancelledEvent = (
    event: EventCancelled
): BounceGateEventCancelled => {
    let id =
        event.transaction.hash.toHexString() + "/" + event.logIndex.toString();
    let entity = new BounceGateEventCancelled(id);
    entity.block = event.block.number;
    entity.timestamp = event.block.timestamp;
    entity.contract = event.address;
    entity.transaction = event.transaction.hash;

    entity._eventId = event.params._eventId;
    return entity;
};

export const createBounceGateEventPriorityAndDurationUpdatedEvent = (
    event: EventPriorityAndDurationUpdated
): BounceGateEventPriorityAndDurationUpdated => {
    let id =
        event.transaction.hash.toHexString() + "/" + event.logIndex.toString();
    let entity = new BounceGateEventPriorityAndDurationUpdated(id);
    entity.block = event.block.number;
    entity.timestamp = event.block.timestamp;
    entity.contract = event.address;
    entity.transaction = event.transaction.hash;

    entity._eventId = event.params._eventId;
    entity._newEndTime = event.params._newEndTime;
    entity._newPriority = event.params._newPriority;

    return entity;
};

export const getOrCreateBounceGateEvent = (
    eventId: BigInt
): BounceGateEvent => {
    let id = eventId.toString();
    let entity = BounceGateEvent.load(id);
    if (!entity) {
        entity = new BounceGateEvent(id);
        entity.cancelled = false;
    }

    return entity;
};
