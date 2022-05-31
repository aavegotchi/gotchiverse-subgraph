import { BigInt, ethereum } from "@graphprotocol/graph-ts";
import { AddInstallationType, DeprecateInstallation, EditInstallationType, InstallationDiamond, MintInstallation, MintTile, UpgradeInitiated } from "../../generated/InstallationDiamond/InstallationDiamond";
import { AddInstallationTypeEvent, DeprecateInstallationEvent, EditInstallationTypeEvent, Installation, InstallationType, MintInstallationEvent, MintTileEvent, Tile, TileType, UpgradeInitiatedEvent } from "../../generated/schema"
import { TileDiamond } from "../../generated/TileDiamond/TileDiamond";
import { BIGINT_ZERO } from "./constants";

export function getOrCreateInstallationType(typeId: BigInt, event: ethereum.Event): InstallationType {
    let id = typeId.toString();
    let installationType = InstallationType.load(id);
    if(!installationType) {
        installationType = new InstallationType(id);
        installationType = updateInstallationType(event, installationType);
    }
    return installationType;
}

export function getOrCreateInstallation(installationId: BigInt): Installation {
    let id = installationId.toString();
    let installation = Installation.load(id);
    if(!installation)  {
        installation = new Installation(id);
    }
    return installation;
}

export function getOrCreateTile(tileId: BigInt): Tile {
    let id = "tile-"+ tileId.toString();
    let tile = Tile.load(id);
    if(!tile) {
        tile = new Tile(id);
    }
    return tile;
}

export function getOrCreateTiletype(tileTypeId: BigInt, event: ethereum.Event): TileType {
    let id = "tiletype-"+tileTypeId.toString();
    let type = TileType.load(id);
    if(!type) {
        type = new TileType(id);
        let contract = TileDiamond.bind(event.address);
        let result = contract.try_getTileType(tileTypeId);
        if(result.reverted) {
            return type;
        }

        let data = result.value;
        type.alchemicaCost = data.alchemicaCost;
        type.craftTime = data.craftTime;
        type.deprecated = data.deprecated;
        type.height =  data.height;
        type.width = data.width;
        type.tileType = data.tileType;
        type.name = data.name;
    }

    return type;
}

export function createMintTileEvent(event: MintTile): MintTileEvent {
    let id = event.transaction.hash.toHexString();
    let eventEntity = new MintTileEvent(id);
    eventEntity.transaction = event.transaction.hash
    eventEntity.block = event.block.number;
    eventEntity.timestamp = event.block.timestamp;
    eventEntity.owner = event.params._owner;
    eventEntity.tileType = event.params._tileType.toString();
    eventEntity.tile = event.params._tileId.toString();
    let tileType = getOrCreateTiletype(event.params._tileType, event);
    eventEntity.tileType = tileType.id;
    let tile = getOrCreateTile(event.params._tileId);
    eventEntity.tile = tile.id;

    return eventEntity;
}

export function createMintInstallationEvent(event: MintInstallation): MintInstallationEvent {
    let id = event.transaction.hash.toHexString();
    let eventEntity = new MintInstallationEvent(id);
    eventEntity.transaction = event.transaction.hash
    eventEntity.block = event.block.number;
    eventEntity.timestamp = event.block.timestamp;
    eventEntity.installationType = event.params._installationType.toString();
    eventEntity.owner = event.params._owner;
    return eventEntity;
}

export function createUpgradeInitiatedEvent (event: UpgradeInitiated): UpgradeInitiatedEvent  {
    let id = event.transaction.hash.toHexString();
    let eventEntity = UpgradeInitiatedEvent.load(id);
    if(!eventEntity) {
        eventEntity = new UpgradeInitiatedEvent(id);
        eventEntity.transaction = event.transaction.hash
        eventEntity.block = event.block.number;
        eventEntity.timestamp = event.block.timestamp;
        eventEntity.installation = event.params.installationId.toString();
        eventEntity.parcel = event.params._realmId.toString();
        eventEntity.x = event.params._coordinateX;
        eventEntity.y = event.params._coordinateY;
        eventEntity.blockInitiated = event.params.blockInitiated;
        eventEntity.readyBlock = event.params.readyBlock;
    }
    return eventEntity;
}

export function createAddInstallationType(event: AddInstallationType): AddInstallationTypeEvent {
    let id = event.transaction.hash.toHexString();
    let eventEntity = AddInstallationTypeEvent.load(id);
    if(!eventEntity) {
        eventEntity = new AddInstallationTypeEvent(id);
        eventEntity.transaction = event.transaction.hash
        eventEntity.block = event.block.number;
        eventEntity.timestamp = event.block.timestamp;
        eventEntity.installationType = event.params._installationId.toString();
    }
    return eventEntity;
}

export function createEditInstallationType(event: EditInstallationType): EditInstallationTypeEvent {
    let id = event.transaction.hash.toHexString();
    let eventEntity = EditInstallationTypeEvent.load(id);
    if(!eventEntity) {
        eventEntity = new EditInstallationTypeEvent(id);
        eventEntity.transaction = event.transaction.hash
        eventEntity.block = event.block.number;
        eventEntity.timestamp = event.block.timestamp;
        eventEntity.installationType = event.params._installationId.toString();
    }
    return eventEntity;
}

export function createDeprecateInstallationEvent(event: DeprecateInstallation): DeprecateInstallationEvent {
    let id = event.transaction.hash.toHexString();
    let eventEntity = DeprecateInstallationEvent.load(id);
    if(!eventEntity) {
        eventEntity = new DeprecateInstallationEvent(id);
        eventEntity.transaction = event.transaction.hash
        eventEntity.block = event.block.number;
        eventEntity.timestamp = event.block.timestamp;
        eventEntity.installationType = event.params._installationId.toString();
    }
    return eventEntity;
}


export function updateInstallationType(event: ethereum.Event, installationType: InstallationType): InstallationType {
    let contract = InstallationDiamond.bind(event.address);
    let result = contract.try_getInstallationType(BigInt.fromString(installationType.id));
    if(result.reverted) {
        return installationType;
    }
    let newType = result.value;
    installationType.width = newType.width;
    installationType.height = newType.height;
    installationType.level = newType.level;
    installationType.alchemicaType = newType.alchemicaType;
    installationType.spillRadius = newType.spillRadius;
    installationType.spillRate = newType.spillRate;
    installationType.upgradeQueueBoost = newType.upgradeQueueBoost;
    installationType.craftTime = newType.craftTime;
    installationType.nextLevelId = newType.nextLevelId;
    installationType.deprecated = newType.deprecated;
    installationType.alchemicaCost = newType.alchemicaCost;
    installationType.harvestRate = newType.harvestRate;
    installationType.capacity = newType.capacity;
    installationType.prerequisites = newType.prerequisites.map<string>(e => e.toString());
    installationType.amountPrerequisites = newType.prerequisites.length;
    installationType.name = newType.name;
    return installationType;
}


