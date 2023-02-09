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
import { StatCategory } from "./constants";
import { getStat } from "./stats";

export const getOrCreateParcel = (realmId: BigInt): Parcel => {
    let id = realmId.toString();
    let parcel = Parcel.load(id);
    if (!parcel) {
        parcel = new Parcel(id);
        parcel.equippedInstallations = new Array<string>();
        parcel.equippedTiles = new Array<string>();
    }
    return parcel;
};

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
        event.params._gotchiId.toString() +
        "-" +
        event.params._realmId.toString() +
        "-" +
        event.transaction.hash.toHexString();
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
        event.params._realmId.toString() +
        "-" +
        event.params._alchemicaType.toString() +
        "-" +
        event.params._gotchiId.toString() +
        "-" +
        event.transaction.hash.toHexString();
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
        event.params._gotchiId.toString() +
        "-" +
        event.transaction.hash.toHexString();
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
        event.params._realmId.toString() +
        "-" +
        event.params._installationId.toString() +
        "-" +
        event.params._x.toString() +
        "-" +
        event.params._y.toString() +
        "-" +
        event.transaction.hash.toHexString();
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
        event.params._realmId.toString() +
        "-" +
        event.params._installationId.toString() +
        "-" +
        event.params._x.toString() +
        "-" +
        event.params._y.toString() +
        "-" +
        event.transaction.hash.toHexString();
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
        event.params._realmId.toString() +
        "-" +
        event.params._tileId.toString() +
        "-" +
        event.params._x.toString() +
        "-" +
        event.params._y.toString() +
        "-" +
        event.transaction.hash.toHexString();
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
        event.params._realmId.toString() +
        "-" +
        event.params._tileId.toString() +
        "-" +
        event.params._x.toString() +
        "-" +
        event.params._y.toString() +
        "-" +
        event.transaction.hash.toHexString();
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
        event.params._realmId.toString() +
        "-" +
        event.params._prevInstallationId.toString() +
        "-" +
        event.params._nextInstallationId.toString() +
        "-" +
        event.transaction.hash.toHexString();
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
        event.params._tokenId.toString() +
        "-" +
        event.transaction.hash.toHexString();
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
        event.params._tokenId.toString() +
        "-" +
        event.transaction.hash.toHexString();
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
        event.params._token.toHexString() +
        "-" +
        event.params._chainId.toString() +
        "-" +
        event.transaction.hash.toHexString();
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
    accessRight: BigInt
): ParcelAccessRight => {
    let id = realmId.toString() + "-" + accessRight.toString();
    let entity = ParcelAccessRight.load(id);
    if (!entity) {
        entity = new ParcelAccessRight(id);
        entity.accessRight = accessRight.toI32();
        entity.parcel = realmId.toString();
    }

    return entity;
};

export const createBounceGateEventStartedEvent = (
    event: EventStarted
): BounceGateEventStarted => {
    let id =
        event.params._eventId.toString() + "-" + event.block.number.toString();
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
        event.params._eventId.toString() + "-" + event.block.number.toString();
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
        event.params._eventId.toString() + "-" + event.block.number.toString();
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
