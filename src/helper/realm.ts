import { BigInt } from "@graphprotocol/graph-ts";
import { ChannelAlchemica, EquipInstallation, InstallationUpgraded, UnequipInstallation } from "../../generated/RealmDiamond/RealmDiamond";
import { ChannelAlchemicaEvent, EquipInstallationEvent, Gotchi, InstallationUpgradedEvent, Parcel, Stat, UnequipInstallationEvent } from "../../generated/schema"
import { BIGINT_ZERO, StatCategory, STAT_CATEGORIES } from "./constants";

export const getOrCreateParcel = (realmId: BigInt): Parcel => {
    let id = realmId.toString();
    let parcel = Parcel.load(id);
    if(!parcel) {
        parcel = new Parcel(id);
        parcel.equippedInstallations = new Array<BigInt>();
    }
    return parcel;
}

export const getOrCreateGotchi = (gotchiId: BigInt): Gotchi => {
    let id = gotchiId.toString();
    let gotchi = Gotchi.load(id);
    if(!gotchi) {
        gotchi = new Gotchi(id);
    }
    return gotchi;
}

export const createChannelAlchemicaEvent = (event: ChannelAlchemica): ChannelAlchemicaEvent => {
    let id = event.params._gotchiId.toString() + "-" + event.params._realmId.toString() + "-" + event.block.number.toString();
    let eventEntity = new ChannelAlchemicaEvent(id);
    eventEntity.gotchi = event.params._gotchiId.toString();
    eventEntity.parcel = event.params._realmId.toString();

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
    eventEntity.parcel = event.params._realmId.toString();
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
    eventEntity.parcel = event.params._realmId.toString();
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
    eventEntity.parcel = event.params._realmId.toString();
    eventEntity.x = event.params._coordinateX;
    eventEntity.y = event.params._coordinateY;
    return eventEntity;
}

export const createParcelInstallation = (parcel: Parcel, installationId: BigInt): Parcel  => {
    let installations = parcel.equippedInstallations;
    installations.push(installationId);
    parcel.equippedInstallations = installations;
    return parcel;
}

export const removeParcelInstallation = (parcel: Parcel, installationId: BigInt): Parcel => {
    let installations = parcel.equippedInstallations;
    let newInstallations = new Array<BigInt>();
    for(let i=0; i<installations.length;i++) {
        let item = installations[i];
        if(item.notEqual(installationId)) {
            newInstallations.push(item);
        }
    }
    parcel.equippedInstallations = newInstallations;
    return parcel;
}

export const getStat = (category: StatCategory, entityId: string = "0"): Stat => {
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