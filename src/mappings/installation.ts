import { AddInstallationType, DeprecateInstallation, EditInstallationType, MintInstallation, UpgradeInitiated } from "../../generated/InstallationDiamond/InstallationDiamond";
import { BIGINT_ONE, StatCategory } from "../helper/constants";
import { createAddInstallationType, createDeprecateInstallationEvent, createEditInstallationType, createMintInstallationEvent, createUpgradeInitiatedEvent, getOrCreateInstallation, getOrCreateInstallationType, updateInstallationType } from "../helper/installation";
import { getStat, updateAlchemicaSpendOnInstallationsAndUpgrades } from "../helper/stats";


export function handleMintInstallation(event: MintInstallation): void  {
    // Event entity
    let eventEntity = createMintInstallationEvent(event);
    eventEntity.save();

    let installation = getOrCreateInstallation(event.params._installationId);
    // InstallationType entity
    let installationType = getOrCreateInstallationType(event.params._installationType);
    if(installation.type == null || installation.type != installationType.id) {
        installation.type = installationType.id;
    }
    if(installationType.name == null) {
        installationType = updateInstallationType(event, installationType);
    }

    // stats
    let overallStats = getStat(StatCategory.OVERALL);
    let userStats = getStat(StatCategory.USER, event.params._owner.toHexString());
    overallStats = updateAlchemicaSpendOnInstallationsAndUpgrades(overallStats, installationType);
    overallStats.installationsMintedTotal = overallStats.installationsMintedTotal.plus(BIGINT_ONE);
    userStats = updateAlchemicaSpendOnInstallationsAndUpgrades(userStats, installationType);
    userStats.installationsMintedTotal = userStats.installationsMintedTotal.plus(BIGINT_ONE);

    // persist
    userStats.save();
    overallStats.save();
    installation.save();
    installationType.save();
}

export function handleUpgradeInitiated(event: UpgradeInitiated): void {
    let eventEntity = createUpgradeInitiatedEvent(event);
    eventEntity.save()

    let type = getOrCreateInstallationType(event.params.installationId);
    if(type.name == null) {
        type = updateInstallationType(event, type);
        type.save();
    }

    // stats
    let overallStats = getStat(StatCategory.OVERALL);
    overallStats = updateAlchemicaSpendOnInstallationsAndUpgrades(overallStats, type);
    overallStats.installationsMintedTotal = overallStats.installationsMintedTotal.plus(BIGINT_ONE);
    overallStats.save();

    let userStats = getStat(StatCategory.USER, event.transaction.from.toHexString());
    userStats = updateAlchemicaSpendOnInstallationsAndUpgrades(userStats, type);
    userStats.installationsMintedTotal = userStats.installationsMintedTotal.plus(BIGINT_ONE);
    userStats.save();
}

export function handleAddInstallationType(event: AddInstallationType): void {
    let eventEntity = createAddInstallationType(event);
    eventEntity.save();

    let installationTypeId = event.params._installationId;
    let installationType = getOrCreateInstallationType(installationTypeId);
    installationType = updateInstallationType(event, installationType);
    installationType.save();
}

export function handleEditInstallationType(event: EditInstallationType): void {
    let eventEntity = createEditInstallationType(event);
    eventEntity.save();

    let installationTypeId = event.params._installationId;
    let installationType = getOrCreateInstallationType(installationTypeId);
    installationType = updateInstallationType(event, installationType);
    installationType.save();
}

export function handleDeprecateInstallation(event: DeprecateInstallation): void {
    let eventEntity = createDeprecateInstallationEvent(event);
    eventEntity.save();

    let installationTypeId = event.params._installationId;
    let installationType = getOrCreateInstallationType(installationTypeId);
    installationType = updateInstallationType(event, installationType);
    installationType.save();
}