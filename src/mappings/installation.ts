import { AddInstallationType, DeprecateInstallation, EditInstallationType, MintInstallation, MintTile, UpgradeInitiated } from "../../generated/InstallationDiamond/InstallationDiamond";
import { StatCategory } from "../helper/constants";
import { createAddInstallationType, createDeprecateInstallationEvent, createEditInstallationType, createMintInstallationEvent, createMintTileEvent, createUpgradeInitiatedEvent, getOrCreateInstallation, getOrCreateInstallationType, getOrCreateTile, updateInstallationType } from "../helper/installation";
import { getStat, updateSpendAlchemicaStats } from "../helper/stats";


export function handleMintTile (event: MintTile): void {
    let eventEntity = createMintTileEvent(event);
    eventEntity.save();

    let tileType = getOrCreateInstallationType(event.params._tileType);
    if(tileType.name == null) {
        tileType = updateInstallationType(event, tileType);
        tileType.save();
    }
}

export function handleMintInstallation(event: MintInstallation): void  {
    // Event entity
    let eventEntity = createMintInstallationEvent(event);
    eventEntity.save();

    let installation = getOrCreateInstallation(event.params._installationId);
    // InstallationType entity
    let installationType = getOrCreateInstallationType(event.params._installationType);
    if(installation.installationType == null || installation.installationType != installationType.id) {
        installation.installationType = installationType.id;
    }
    if(installationType.name == null) {
        installationType = updateInstallationType(event, installationType);
    }

    // stats
    let overallStats = getStat(StatCategory.OVERALL);
    let userStats = getStat(StatCategory.USER, event.params._owner.toHexString());
    overallStats = updateSpendAlchemicaStats(overallStats, installationType);
    userStats = updateSpendAlchemicaStats(userStats, installationType);

    // persist
    userStats.save();
    overallStats.save();
    installation.save();
    installationType.save();
}

export function handleUpgradeInitiated(event: UpgradeInitiated): void {
    let eventEntity = createUpgradeInitiatedEvent(event);
    eventEntity.save()
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