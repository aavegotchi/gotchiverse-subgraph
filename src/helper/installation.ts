import { BigInt, ethereum } from "@graphprotocol/graph-ts";
import { AddInstallationType, CraftTimeReduced, DeprecateInstallation, EditInstallationType, InstallationDiamond, MintInstallation, UpgradeInitiated, UpgradeTimeReduced } from "../../generated/InstallationDiamond/InstallationDiamond";
import { AddInstallationTypeEvent, CraftTimeReducedEvent, DeprecateInstallationEvent, EditInstallationTypeEvent, Installation, InstallationType, MintInstallationEvent, UpgradeInitiatedEvent, UpgradeTimeReducedEvent } from "../../generated/schema"
import { INSTALLATION_DIAMOND } from "./constants";


export function getOrCreateInstallationType(typeId: BigInt, event: ethereum.Event): InstallationType {
    let id = typeId.toString();
    let installationType = InstallationType.load(id);
    if(!installationType) {
        installationType = new InstallationType(id);
        installationType = updateInstallationType(installationType);
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


export function updateInstallationType(installationType: InstallationType): InstallationType {
    let contract = InstallationDiamond.bind(INSTALLATION_DIAMOND);
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
    installationType.prerequisites = newType.prerequisites;
    installationType.amountPrerequisites = newType.prerequisites.length;
    installationType.name = newType.name;
    return installationType;
}

export function createUpgradeTimeReducedEvent(event: UpgradeTimeReduced): UpgradeTimeReducedEvent {
    let id = event.transaction.hash.toHexString();
    let eventEntity = UpgradeTimeReducedEvent.load(id);
    if(!eventEntity) {
        eventEntity = new UpgradeTimeReducedEvent(id);
        eventEntity.transaction = event.transaction.hash
        eventEntity.block = event.block.number;
        eventEntity.timestamp = event.block.timestamp;
        eventEntity.parcel = event.params._realmId.toString();
        eventEntity.x = event.params._coordinateX;
        eventEntity.y = event.params._coordinateY;
        eventEntity.blocksReduced = event.params._blocksReduced;
    }
    return eventEntity;
}

export function createCraftTimeReducedEvent(event: CraftTimeReduced): CraftTimeReducedEvent {
    let id = event.transaction.hash.toHexString();
    let eventEntity = CraftTimeReducedEvent.load(id);
    if(!eventEntity) {
        eventEntity = new CraftTimeReducedEvent(id);
        eventEntity.transaction = event.transaction.hash
        eventEntity.block = event.block.number;
        eventEntity.timestamp = event.block.timestamp;
        eventEntity.blocksReduced = event.params._blocksReduced;
    }
    return eventEntity;
}
