import { BigInt } from "@graphprotocol/graph-ts";
import { AddInstallationType, CraftTimeReduced, DeprecateInstallation, EditInstallationType, MintInstallation, UpgradeFinalized, UpgradeInitiated, UpgradeTimeReduced } from "../../generated/InstallationDiamond/InstallationDiamond";
import { BIGINT_ONE, StatCategory } from "../helper/constants";
import { createAddInstallationType, createCraftTimeReducedEvent, createDeprecateInstallationEvent, createEditInstallationType, createMintInstallationEvent, createUpgradeFinalizedEvent, createUpgradeInitiatedEvent, createUpgradeTimeReducedEvent, getOrCreateInstallation, getOrCreateInstallationType } from "../helper/installation";
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
    overallStats.installationsMintedTotal = overallStats.installationsMintedTotal.plus(BIGINT_ONE);

    let userStats = getStat(StatCategory.USER, event.params._owner.toHexString());
    userStats = updateAlchemicaSpendOnInstallations(userStats, installationType);
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

    let type = getOrCreateInstallationType(event.params.installationId, event);
    type.save();

    // stats
    let overallStats = getStat(StatCategory.OVERALL);
    overallStats = updateAlchemicaSpendOnUpgrades(overallStats, type);
    overallStats.installationsUpgradedTotal = overallStats.installationsUpgradedTotal.plus(BIGINT_ONE);
    overallStats.save();

    let userStats = getStat(StatCategory.USER, event.transaction.from.toHexString());
    userStats = updateAlchemicaSpendOnUpgrades(userStats, type);
    userStats.installationsUpgradedTotal = userStats.installationsUpgradedTotal.plus(BIGINT_ONE);
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
    let gltrSpend = event.params._blocksReduced.times(BigInt.fromString("1e18"));
    let overallStats = getStat(StatCategory.OVERALL);
    overallStats.craftTimeReduced = overallStats.craftTimeReduced.plus(event.params._blocksReduced);
    overallStats.gltrSpendOnCrafts = overallStats.gltrSpendOnCrafts!.plus(gltrSpend);
    overallStats.gltrSpendTotal = overallStats.gltrSpendTotal!.plus(gltrSpend);
    overallStats.save();

    let userStats = getStat(StatCategory.USER, event.transaction.from.toHexString());
    userStats.craftTimeReduced = userStats.craftTimeReduced.plus(event.params._blocksReduced);
    userStats.gltrSpendOnCrafts = userStats.gltrSpendOnCrafts!.plus(gltrSpend);
    userStats.gltrSpendTotal = userStats.gltrSpendTotal!.plus(gltrSpend);
    userStats.save();
}

export function handleUpgradeTimeReduced(event: UpgradeTimeReduced): void {
    let eventEntity = createUpgradeTimeReducedEvent(event);
    eventEntity.save();

    // stats
    let gltrSpend = event.params._blocksReduced.times(BigInt.fromString("1e18"));
    let overallStats = getStat(StatCategory.OVERALL);
    overallStats.upgradeTimeReduced = overallStats.upgradeTimeReduced.plus(event.params._blocksReduced);
    overallStats.gltrSpendOnUpgrades = overallStats.gltrSpendOnUpgrades!.plus(gltrSpend);
    overallStats.gltrSpendTotal = overallStats.gltrSpendTotal!.plus(gltrSpend);
    overallStats.save();

    let parcelStats = getStat(StatCategory.PARCEL, eventEntity.parcel)
    parcelStats.upgradeTimeReduced = parcelStats.upgradeTimeReduced.plus(event.params._blocksReduced);
    parcelStats.gltrSpendOnUpgrades = parcelStats.gltrSpendOnUpgrades!.plus(gltrSpend);
    parcelStats.gltrSpendTotal = parcelStats.gltrSpendTotal!.plus(gltrSpend);
    parcelStats.save();

    let userStats = getStat(StatCategory.USER, event.transaction.from.toHexString());
    userStats.upgradeTimeReduced = userStats.upgradeTimeReduced.plus(event.params._blocksReduced);
    userStats.gltrSpendOnUpgrades = userStats.gltrSpendOnUpgrades!.plus(gltrSpend);
    userStats.gltrSpendTotal = userStats.gltrSpendTotal!.plus(gltrSpend);
    userStats.save();
}

export function handleUpgradeFinalized(event: UpgradeFinalized): void {
    let eventEntity = createUpgradeFinalizedEvent(event);
    eventEntity.save();
}