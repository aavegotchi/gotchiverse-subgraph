import { Address, BigInt } from "@graphprotocol/graph-ts";
import { InstallationDiamond } from "../../generated/InstallationDiamond/InstallationDiamond";
import { Installation, InstallationType } from "../../generated/schema";
import { BIGINT_ZERO, INSTALLATION_DIAMOND } from "./constants";

export function getOrCreateInstallationType(typeId: BigInt): InstallationType {
    let id = typeId.toString();
    let installationType = InstallationType.load(id);
    if (!installationType) {
        installationType = new InstallationType(id);
        installationType.amount = BIGINT_ZERO;
        installationType.deprecatedAt = BIGINT_ZERO;
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

// createMintInstallationEvent removed - no longer storing event entities

// createMintInstallationsEvent removed - no longer storing event entities

// Event creation functions removed - no longer storing event entities
// createUpgradeInitiatedEvent removed
// createAddInstallationType removed
// createEditInstallationType removed
// createDeprecateInstallationEvent removed

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

// More event creation functions removed - no longer storing event entities
// createUpgradeTimeReducedEvent removed
// createCraftTimeReducedEvent removed
// createUpgradeFinalizedEvent removed
// createUpgradeQueuedEvent removed
