import { Address, BigInt } from "@graphprotocol/graph-ts";
import {
    AddInstallationType,
    CraftTimeReduced,
    DeprecateInstallation,
    EditInstallationType,
    InstallationDiamond,
    MintInstallation,
    MintInstallations,
    UpgradeFinalized,
    UpgradeInitiated,
    UpgradeQueued,
    UpgradeTimeReduced,
} from "../../generated/InstallationDiamond/InstallationDiamond";
import {
    AddInstallationTypeEvent,
    CraftTimeReducedEvent,
    DeprecateInstallationEvent,
    EditInstallationTypeEvent,
    Installation,
    InstallationType,
    MintInstallationEvent,
    MintInstallationsEvent,
    UpgradeFinalizedEvent,
    UpgradeInitiatedEvent,
    UpgradeQueuedEvent,
    UpgradeTimeReducedEvent,
} from "../../generated/schema";
import { BIGINT_ZERO, INSTALLATION_DIAMOND } from "./constants";

export function getOrCreateInstallationType(typeId: BigInt): InstallationType {
    let id = typeId.toString();
    let installationType = InstallationType.load(id);
    if (!installationType) {
        installationType = new InstallationType(id);
        installationType.amount = BIGINT_ZERO;
        installationType = updateInstallationType(installationType);
    }
    return installationType;
}

export function getOrCreateInstallation(
    installationId: BigInt,
    realmId: BigInt,
    x: BigInt,
    y: BigInt,
    owner: Address
): Installation {
    let id =
        installationId.toString() +
        "-" +
        realmId.toString() +
        "-" +
        x.toString() +
        "-" +
        y.toString();
    let installation = Installation.load(id);
    if (!installation) {
        installation = new Installation(id);
        installation.x = x;
        installation.y = y;
        installation.type = installationId.toString();
        installation.parcel = realmId.toString();
        installation.equipped = true;
        installation.owner = owner;
    }
    return installation;
}

export function createMintInstallationEvent(
    event: MintInstallation
): MintInstallationEvent {
    let id =
        event.params._installationId.toString() +
        "_" +
        event.block.number.toString() +
        "-" +
        event.transaction.hash.toHexString();

    let eventEntity = new MintInstallationEvent(id);
    eventEntity.transaction = event.transaction.hash;
    eventEntity.block = event.block.number;
    eventEntity.timestamp = event.block.timestamp;
    eventEntity.installationType = event.params._installationType.toString();
    eventEntity.owner = event.params._owner;
    return eventEntity;
}

export function createMintInstallationsEvent(
    event: MintInstallations
): MintInstallationsEvent {
    let id =
        event.params._installationId.toString() +
        "_" +
        event.params._amount.toString() +
        "_" +
        event.block.number.toString() +
        "-" +
        event.transaction.hash.toHexString();
    let eventEntity = new MintInstallationsEvent(id);
    eventEntity.transaction = event.transaction.hash;
    eventEntity.block = event.block.number;
    eventEntity.timestamp = event.block.timestamp;
    eventEntity.installationType = event.params._installationId.toString();
    eventEntity.owner = event.params._owner;
    eventEntity.amount = event.params._amount;
    return eventEntity;
}

export function createUpgradeInitiatedEvent(
    event: UpgradeInitiated
): UpgradeInitiatedEvent {
    let id =
        event.params.installationId.toString() +
        "-" +
        event.params._realmId.toString() +
        "-" +
        event.params._coordinateX.toString() +
        "-" +
        event.params._coordinateY.toString() +
        "-" +
        event.block.number.toString() +
        "-" +
        event.transaction.hash.toHexString();
    let eventEntity = UpgradeInitiatedEvent.load(id);
    if (!eventEntity) {
        eventEntity = new UpgradeInitiatedEvent(id);
        eventEntity.transaction = event.transaction.hash;
        eventEntity.block = event.block.number;
        eventEntity.timestamp = event.block.timestamp;
        eventEntity.installation = event.params.installationId.toString();
        eventEntity.parcel = event.params._realmId.toString();
        eventEntity.x = event.params._coordinateX;
        eventEntity.y = event.params._coordinateY;
        eventEntity.blockInitiated = event.params.blockInitiated;
        eventEntity.readyBlock = event.params.readyBlock;
        eventEntity.realmId = event.params._realmId;
        eventEntity.installationId = event.params.installationId;
    }
    return eventEntity;
}

export function createAddInstallationType(
    event: AddInstallationType
): AddInstallationTypeEvent {
    let id =
        event.params._installationId.toString() +
        "-" +
        event.block.number.toString() +
        "-" +
        event.transaction.hash.toHexString();
    let eventEntity = AddInstallationTypeEvent.load(id);
    if (!eventEntity) {
        eventEntity = new AddInstallationTypeEvent(id);
        eventEntity.transaction = event.transaction.hash;
        eventEntity.block = event.block.number;
        eventEntity.timestamp = event.block.timestamp;
        eventEntity.installationType = event.params._installationId.toString();
    }
    return eventEntity;
}

export function createEditInstallationType(
    event: EditInstallationType
): EditInstallationTypeEvent {
    let id = event.transaction.hash.toHexString();
    let eventEntity = EditInstallationTypeEvent.load(id);
    if (!eventEntity) {
        eventEntity = new EditInstallationTypeEvent(id);
        eventEntity.transaction = event.transaction.hash;
        eventEntity.block = event.block.number;
        eventEntity.timestamp = event.block.timestamp;
        eventEntity.installationType = event.params._installationId.toString();
    }
    return eventEntity;
}

export function createDeprecateInstallationEvent(
    event: DeprecateInstallation
): DeprecateInstallationEvent {
    let id =
        event.params._installationId.toString() +
        "-" +
        event.block.number.toString() +
        "-" +
        event.transaction.hash.toHexString();
    let eventEntity = DeprecateInstallationEvent.load(id);
    if (!eventEntity) {
        eventEntity = new DeprecateInstallationEvent(id);
        eventEntity.transaction = event.transaction.hash;
        eventEntity.block = event.block.number;
        eventEntity.timestamp = event.block.timestamp;
        eventEntity.installationType = event.params._installationId.toString();
    }
    return eventEntity;
}

export function updateInstallationType(
    installationType: InstallationType
): InstallationType {
    let contract = InstallationDiamond.bind(INSTALLATION_DIAMOND);
    let result = contract.try_getInstallationType(
        BigInt.fromString(installationType.id)
    );
    if (result.reverted) {
        return installationType;
    }
    let newType = result.value;
    installationType.width = newType.width;
    installationType.installationType = newType.installationType;
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

export function createUpgradeTimeReducedEvent(
    event: UpgradeTimeReduced
): UpgradeTimeReducedEvent {
    let id =
        event.params._realmId.toString() +
        "-" +
        event.params._queueId.toString() +
        "-" +
        event.params._coordinateX.toString() +
        "-" +
        event.params._coordinateY.toString() +
        "-" +
        event.block.number.toString() +
        "-" +
        event.transaction.hash.toHexString();
    let eventEntity = UpgradeTimeReducedEvent.load(id);
    if (!eventEntity) {
        eventEntity = new UpgradeTimeReducedEvent(id);
        eventEntity.transaction = event.transaction.hash;
        eventEntity.block = event.block.number;
        eventEntity.timestamp = event.block.timestamp;
        eventEntity.parcel = event.params._realmId.toString();
        eventEntity.x = event.params._coordinateX;
        eventEntity.y = event.params._coordinateY;
        eventEntity.blocksReduced = event.params._blocksReduced;
        eventEntity.realmId = event.params._realmId;
    }
    return eventEntity;
}

export function createCraftTimeReducedEvent(
    event: CraftTimeReduced
): CraftTimeReducedEvent {
    let id =
        event.transaction.from.toHexString() +
        "-" +
        event.params._queueId.toString() +
        "-" +
        event.params._blocksReduced.toString() +
        "-" +
        event.block.number.toString() +
        "-" +
        event.transaction.hash.toHexString();
    let eventEntity = CraftTimeReducedEvent.load(id);
    if (!eventEntity) {
        eventEntity = new CraftTimeReducedEvent(id);
        eventEntity.transaction = event.transaction.hash;
        eventEntity.block = event.block.number;
        eventEntity.timestamp = event.block.timestamp;
        eventEntity.blocksReduced = event.params._blocksReduced;
    }
    return eventEntity;
}

export function createUpgradeFinalizedEvent(
    event: UpgradeFinalized
): UpgradeFinalizedEvent {
    let id =
        event.params._realmId.toString() +
        "-" +
        event.params._newInstallationId.toString() +
        "-" +
        event.params._coordinateX.toString() +
        "-" +
        event.params._coordinateY.toString() +
        "-" +
        event.block.number.toString() +
        "-" +
        event.transaction.hash.toHexString();
    let eventEntity = new UpgradeFinalizedEvent(id);
    eventEntity.transaction = event.transaction.hash;
    eventEntity.block = event.block.number;
    eventEntity.timestamp = event.block.timestamp;
    eventEntity.x = event.params._coordinateX;
    eventEntity.y = event.params._coordinateY;
    eventEntity.installation = event.params._newInstallationId.toString();
    eventEntity.parcel = event.params._realmId.toString();
    return eventEntity;
}

export function createUpgradeQueuedEvent(
    event: UpgradeQueued
): UpgradeQueuedEvent {
    let id =
        event.params._realmId.toString() +
        "-" +
        event.params._owner.toHexString() +
        "-" +
        event.params._queueIndex.toString() +
        "-" +
        event.block.number.toString() +
        "-" +
        event.transaction.hash.toHexString();
    let eventEntity = new UpgradeQueuedEvent(id);
    eventEntity.transaction = event.transaction.hash;
    eventEntity.block = event.block.number;
    eventEntity.timestamp = event.block.timestamp;

    eventEntity.realmId = event.params._realmId;
    eventEntity.owner = event.params._owner;
    eventEntity.queueIndex = event.params._queueIndex;
    eventEntity.parcel = event.params._realmId.toString();

    return eventEntity;
}
