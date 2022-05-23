import { BigInt, store } from "@graphprotocol/graph-ts";
import { ChannelAlchemica, EquipInstallation, InstallationUpgraded, UnequipInstallation } from "../../generated/RealmDiamond/RealmDiamond";
import { ChannelAlchemicaEvent, EquipInstallationEvent, InstallationUpgradedEvent, ParcelInstallation, Stat, UnequipInstallationEvent } from "../../generated/schema"
import { BIGINT_ZERO, StatCategory, STAT_CATEGORIES } from "./constants";

export const createChannelAlchemicaEvent = (event: ChannelAlchemica): ChannelAlchemicaEvent => {
    let id = event.params._gotchiId.toString() + "-" + event.params._realmId.toString() + "-" + event.block.number.toString();
    let eventEntity = new ChannelAlchemicaEvent(id);
    eventEntity.gotchi = event.params._gotchiId;
    eventEntity.parcel = event.params._realmId;

    eventEntity.transaction = event.transaction.hash
    eventEntity.block = event.block.number;
    eventEntity.timestamp = event.block.timestamp;

    eventEntity.spilloverRadius = event.params._spilloverRadius;
    eventEntity.spilloverRate = event.params._spilloverRate;
    eventEntity.alchemica = event.params._alchemica;
    return eventEntity;
}

export const createEquipInstallationEvent = (event: EquipInstallation): EquipInstallationEvent => {
    let id = event.params._realmId.toString() + "-" + event.params._installationId.toString();
    let eventEntity = new EquipInstallationEvent(id);
    eventEntity.transaction = event.transaction.hash
    eventEntity.block = event.block.number;
    eventEntity.timestamp = event.block.timestamp;
    eventEntity.installationId = event.params._installationId;
    eventEntity.realmId = event.params._realmId;
    eventEntity.x = event.params._x;
    eventEntity.y = event.params._y;
    return eventEntity;
}

export const createUnequipInstallationEvent = (event: UnequipInstallation): UnequipInstallationEvent => {
    let id = event.params._realmId.toString() + "-" + event.params._installationId.toString();
    let eventEntity = new UnequipInstallationEvent(id);
    eventEntity.transaction = event.transaction.hash
    eventEntity.block = event.block.number;
    eventEntity.timestamp = event.block.timestamp;
    eventEntity.installationId = event.params._installationId;
    eventEntity.realmId = event.params._realmId;
    eventEntity.x = event.params._x;
    eventEntity.y = event.params._y;
    return eventEntity;
}

export const createInstallationUpgradedEvent = (event: InstallationUpgraded): InstallationUpgradedEvent => {
    let id = event.params._realmId.toString() + "-" + event.params._prevInstallationId.toString() + "-" + event.params._nextInstallationId.toString();
    let eventEntity = new InstallationUpgradedEvent(id);
    eventEntity.transaction = event.transaction.hash
    eventEntity.block = event.block.number;
    eventEntity.timestamp = event.block.timestamp;
    eventEntity.prevInstallationId = event.params._prevInstallationId;
    eventEntity.nextInstallationId = event.params._nextInstallationId;
    eventEntity.realmId = event.params._realmId;
    eventEntity.x = event.params._coordinateX;
    eventEntity.y = event.params._coordinateY;
    return eventEntity;
}

export const createParcelInstallation = (realmId: BigInt, installationId: BigInt): ParcelInstallation  => {
    let id = realmId.toString() + "-" + installationId.toString();
    let installation = ParcelInstallation.load(id);
    if(!installation) {
        installation = new ParcelInstallation(id);
        installation.realmId = realmId;
        installation.installationId = installationId;
    }
    return installation;
}

export const removeParcelInstallation = (realmId: BigInt, installationId: BigInt): void => {
    let id = realmId.toString() + "-" + installationId.toString();
    store.remove("ParcelInstallation", id);
}

export const getStat = (category: StatCategory, entityId: BigInt): Stat => {
    let id = STAT_CATEGORIES[category];
    if(id != "overall") {
        id = id  + "-" + entityId.toString();
    }
    
    let stats = Stat.load(id);
    if(!stats) {
        stats = new Stat(id);
        stats.countChannelAlchemicaEvents = BIGINT_ZERO;
        stats.countParcelInstallations = BIGINT_ZERO;
    }

    return stats;
}