import { BigInt } from "@graphprotocol/graph-ts";
import { AlchemicaClaimed, ChannelAlchemica, EquipInstallation, EquipTile, ExitAlchemica, InstallationUpgraded, MintParcel, Transfer, UnequipInstallation, UnequipTile } from "../../generated/RealmDiamond/RealmDiamond";
import { AlchemicaClaimedEvent, ChannelAlchemicaEvent, EquipInstallationEvent, EquipTileEvent, ExitAlchemicaEvent, Gotchi, InstallationUpgradedEvent, MintParcelEvent, Parcel, TransferEvent, UnequipInstallationEvent, UnequipTileEvent } from "../../generated/schema"

export const getOrCreateParcel = (realmId: BigInt): Parcel => {
    let id = realmId.toString();
    let parcel = Parcel.load(id);
    if(!parcel) {
        parcel = new Parcel(id);
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

export const createAlchemicaClaimedEvent = (event: AlchemicaClaimed): AlchemicaClaimedEvent => {
    let id = event.transaction.hash.toHexString();
    let eventEntity = new AlchemicaClaimedEvent(id);
    eventEntity.transaction = event.transaction.hash
    eventEntity.block = event.block.number;
    eventEntity.timestamp = event.block.timestamp;
    eventEntity.gotchi = event.params._gotchiId.toString();
    eventEntity.parcel = event.params._realmId.toString();
    eventEntity.alchemicaType = event.params._alchemicaType
    eventEntity.amount = event.params._amount
    eventEntity.spilloverRadius = event.params._spilloverRadius
    eventEntity.spilloverRate = event.params._spilloverRate
    return eventEntity;
}

export const createExitAlchemicaEvent = (event: ExitAlchemica): ExitAlchemicaEvent => {
    let id = event.transaction.hash.toHexString();
    let eventEntity = new ExitAlchemicaEvent(id);
    eventEntity.transaction = event.transaction.hash
    eventEntity.block = event.block.number;
    eventEntity.timestamp = event.block.timestamp;
    eventEntity.gotchi = event.params._gotchiId.toString();
    eventEntity.alchemica = event.params._alchemica;
    return eventEntity;
}

export const createEquipInstallationEvent = (event: EquipInstallation): EquipInstallationEvent => {
    let id = event.params._realmId.toString() + "-" + event.params._installationId.toString();
    let eventEntity = new EquipInstallationEvent(id);
    eventEntity.transaction = event.transaction.hash
    eventEntity.block = event.block.number;
    eventEntity.timestamp = event.block.timestamp;
    eventEntity.installation = event.params._installationId.toString();
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
    eventEntity.installation = event.params._installationId.toString();
    eventEntity.parcel = event.params._realmId.toString();
    eventEntity.x = event.params._x;
    eventEntity.y = event.params._y;
    return eventEntity;
}

export const createEquipTileEvent = (event: EquipTile): EquipTileEvent => {
    let id = event.transaction.hash.toHexString();
    let eventEntity = new EquipTileEvent(id);
    eventEntity.transaction = event.transaction.hash
    eventEntity.block = event.block.number;
    eventEntity.timestamp = event.block.timestamp;
    eventEntity.tile = event.params._tileId.toString();
    eventEntity.parcel = event.params._realmId.toString();
    eventEntity.x = event.params._x;
    eventEntity.y = event.params._y;
    return eventEntity;
}

export const createUnequipTileEvent = (event: UnequipTile): UnequipTileEvent => {
    let id = event.transaction.hash.toHexString();
    let eventEntity = new UnequipTileEvent(id);
    eventEntity.transaction = event.transaction.hash
    eventEntity.block = event.block.number;
    eventEntity.timestamp = event.block.timestamp;
    eventEntity.tile = event.params._tileId.toString();
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
    eventEntity.prevInstallation = event.params._prevInstallationId.toString();
    eventEntity.nextInstallation = event.params._nextInstallationId.toString();
    eventEntity.parcel = event.params._realmId.toString();
    eventEntity.x = event.params._coordinateX;
    eventEntity.y = event.params._coordinateY;
    return eventEntity;
}

export const createParcelInstallation = (parcel: Parcel, installationId: BigInt): Parcel  => {
    let installations = parcel.equippedInstallations;
    let id = installationId.toString();
    installations.push(id);
    parcel.equippedInstallations = installations;
    return parcel;
}

export const removeParcelInstallation = (parcel: Parcel, installationId: BigInt): Parcel => {
    let installations = parcel.equippedInstallations;
    let newInstallations = new Array<string>();
    let id = installationId.toString();
    for(let i=0; i<installations.length;i++) {
        let item = installations[i];
        if(item != id) {
            newInstallations.push(item);
        }
    }
    parcel.equippedInstallations = newInstallations;
    return parcel;
}

export const createMintParcelEvent = (event: MintParcel): MintParcelEvent => {
    let entity = new MintParcelEvent(event.transaction.hash.toHexString());
    entity.owner = event.params._owner;
    entity.tokenId = event.params._tokenId;
    return entity;
}

export const createParcelTransferEvent = (event: Transfer): TransferEvent => {
    let entity = new TransferEvent(event.transaction.hash);
    entity.block = event.block.number;
    entity.timestamp = event.block.timestamp;
    entity.contract = event.address;
    entity.from = event.params._from;
    entity.to = event.params._to;
    entity.tokenId = event.params._tokenId;
    return entity;
}