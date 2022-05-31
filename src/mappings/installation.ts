import { AddInstallationType, CraftTimeReduced, DeprecateInstallation, EditInstallationType, MintInstallation, UpgradeInitiated, UpgradeTimeReduced } from "../../generated/InstallationDiamond/InstallationDiamond";
import { BIGINT_ONE, StatCategory } from "../helper/constants";
import { createAddInstallationType, createDeprecateInstallationEvent, createEditInstallationType, createMintInstallationEvent, createUpgradeInitiatedEvent, createUpgradeTimeReducedEvent, getOrCreateInstallation, getOrCreateInstallationType, updateInstallationType } from "../helper/installation";
import { getStat, updateAlchemicaSpendOnInstallations, updateAlchemicaSpendOnUpgrades } from "../helper/stats";


export function handleMintInstallation(event: MintInstallation): void  {
    // Event entity
    let eventEntity = createMintInstallationEvent(event);
    eventEntity.save();

    let installation = getOrCreateInstallation(event.params._installationId);
    // InstallationType entity
    let installationType = getOrCreateInstallationType(event.params._installationType, event);
    installation.type = installation.id;

    // stats
    let overallStats = getStat(StatCategory.OVERALL);
    overallStats = updateAlchemicaSpendOnInstallations(overallStats, installationType);

    let userStats = getStat(StatCategory.USER, event.params._owner.toHexString());
    userStats = updateAlchemicaSpendOnInstallations(userStats, installationType);

    // persist
    userStats.save();
    overallStats.save();
    installation.save();
    installationType.save();
}

export function handleUpgradeInitiated(event: UpgradeInitiated): void {
    let eventEntity = createUpgradeInitiatedEvent(event);
    eventEntity.save()

    let type = getOrCreateInstallationType(event.params.installationId, event);
    type.save();

    // stats
    let overallStats = getStat(StatCategory.OVERALL);
    overallStats = updateAlchemicaSpendOnUpgrades(overallStats, type);
    overallStats.save();

    let userStats = getStat(StatCategory.USER, event.transaction.from.toHexString());
    userStats = updateAlchemicaSpendOnUpgrades(userStats, type);
    userStats.save();
}

export function handleAddInstallationType(event: AddInstallationType): void {
    let eventEntity = createAddInstallationType(event);
    eventEntity.save();

    let installationTypeId = event.params._installationId;
    let installationType = getOrCreateInstallationType(installationTypeId, event);
    installationType.save();
}

export function handleEditInstallationType(event: EditInstallationType): void {
    let eventEntity = createEditInstallationType(event);
    eventEntity.save();

    let installationTypeId = event.params._installationId;
    let installationType = getOrCreateInstallationType(installationTypeId, event);
    installationType.save();
}

export function handleDeprecateInstallation(event: DeprecateInstallation): void {
    let eventEntity = createDeprecateInstallationEvent(event);
    eventEntity.save();

    let installationTypeId = event.params._installationId;
    let installationType = getOrCreateInstallationType(installationTypeId, event);
    installationType.save();
}

export function handleCraftTimeReduced(event: CraftTimeReduced): void {
    let eventEntity = createCraftTimeReducedEvent(event);
    eventEntity.save();

    // stats
    let overallStats = getStat(StatCategory.OVERALL);
    overallStats.craftTimeReduced = overallStats.craftTimeReduced.plus(event.params._blocksReduced);
    overallStats.save();

    let parcelStats = getStat(StatCategory.PARCEL, eventEntity.parcel)
    parcelStats.craftTimeReduced = parcelStats.craftTimeReduced.plus(event.params._blocksReduced);
    parcelStats.save();

    let userStats = getStat(StatCategory.USER, event.transaction.from.toHexString());
    userStats.craftTimeReduced = userStats.craftTimeReduced.plus(event.params._blocksReduced);
    userStats.save();

}

export function handleUpgradeTimeReduced(event: UpgradeTimeReduced): void {
    let eventEntity = createUpgradeTimeReducedEvent(event);
    eventEntity.save();

    let overallStats = getStat(StatCategory.OVERALL);
    overallStats.upgradeTimeReduced = overallStats.upgradeTimeReduced.plus(event.params._blocksReduced);
    overallStats.save();

    let parcelStats = getStat(StatCategory.PARCEL, eventEntity.parcel)
    parcelStats.upgradeTimeReduced = parcelStats.upgradeTimeReduced.plus(event.params._blocksReduced);
    parcelStats.save();

    let userStats = getStat(StatCategory.USER, event.transaction.from.toHexString());
    userStats.upgradeTimeReduced = userStats.upgradeTimeReduced.plus(event.params._blocksReduced);
    userStats.save();
}