import { BigInt } from "@graphprotocol/graph-ts";
import {
    AddInstallationType,
    CraftTimeReduced,
    DeprecateInstallation,
    EditDeprecateTime,
    EditInstallationType,
    MintInstallation,
    MintInstallations,
    UpgradeInitiated,
    UpgradeTimeReduced,
    URI,
} from "../../generated/InstallationDiamond/InstallationDiamond";
// Removed EditDeprecateTimeEvent and URIEvent imports - no longer storing event entities
import { BIGINT_ONE, StatCategory } from "../helper/constants";
import {
    getOrCreateInstallationType,
    updateInstallationType,
} from "../helper/installation";
import {
    getStat,
    updateAlchemicaSpendOnInstallations,
    updateAlchemicaSpendOnUpgrades,
} from "../helper/stats";

export function handleMintInstallation(event: MintInstallation): void {
    // Event entity creation removed - no longer storing event entities

    let installationType = getOrCreateInstallationType(
        event.params._installationType
    );
    installationType.amount = installationType.amount.plus(BIGINT_ONE);

    // stats
    let overallStats = getStat(StatCategory.OVERALL);
    overallStats = updateAlchemicaSpendOnInstallations(
        overallStats,
        installationType
    );
    overallStats.installationsMintedTotal = overallStats.installationsMintedTotal.plus(
        BIGINT_ONE
    );

    let userStats = getStat(
        StatCategory.USER,
        event.params._owner.toHexString()
    );
    userStats = updateAlchemicaSpendOnInstallations(
        userStats,
        installationType
    );
    userStats.installationsMintedTotal = userStats.installationsMintedTotal.plus(
        BIGINT_ONE
    );

    // persist
    userStats.save();
    overallStats.save();
    installationType.save();
}

export function handleMintInstallations(event: MintInstallations): void {
    // Event entity
    // Event entity creation removed - no longer storing event entities

    let installationType = getOrCreateInstallationType(
        event.params._installationId
    );

    let bigIntAmount = BigInt.fromI32(event.params._amount);
    installationType.amount = installationType.amount.plus(bigIntAmount);

    // stats
    let overallStats = getStat(StatCategory.OVERALL);
    for (let i = 0; i < event.params._amount; i++) {
        overallStats = updateAlchemicaSpendOnInstallations(
            overallStats,
            installationType
        );
    }
    overallStats.installationsMintedTotal = overallStats.installationsMintedTotal.plus(
        bigIntAmount
    );

    let userStats = getStat(
        StatCategory.USER,
        event.params._owner.toHexString()
    );
    for (let i = 0; i < event.params._amount; i++) {
        userStats = updateAlchemicaSpendOnInstallations(
            userStats,
            installationType
        );
    }
    userStats.installationsMintedTotal = userStats.installationsMintedTotal.plus(
        bigIntAmount
    );

    // persist
    userStats.save();
    overallStats.save();
    installationType.save();
}

export function handleUpgradeInitiated(event: UpgradeInitiated): void {
    // Event entity creation removed - no longer storing event entities

    let type = getOrCreateInstallationType(event.params.installationId);
    type.save();

    // stats
    let overallStats = getStat(StatCategory.OVERALL);
    overallStats = updateAlchemicaSpendOnUpgrades(overallStats, type);
    overallStats.installationsUpgradedTotal = overallStats.installationsUpgradedTotal.plus(
        BIGINT_ONE
    );
    overallStats.save();

    let userStats = getStat(
        StatCategory.USER,
        event.transaction.from.toHexString()
    );
    userStats = updateAlchemicaSpendOnUpgrades(userStats, type);
    userStats.installationsUpgradedTotal = userStats.installationsUpgradedTotal.plus(
        BIGINT_ONE
    );
    userStats.save();

    let parcelStats = getStat(
        StatCategory.PARCEL,
        event.params._realmId.toString()
    );
    parcelStats = updateAlchemicaSpendOnUpgrades(parcelStats, type);
    parcelStats.installationsUpgradedTotal = parcelStats.installationsUpgradedTotal.plus(
        BIGINT_ONE
    );
    parcelStats.save();
}

export function handleAddInstallationType(event: AddInstallationType): void {
    // Event entity creation removed - no longer storing event entities

    let installationTypeId = event.params._installationId;
    let installationType = getOrCreateInstallationType(installationTypeId);
    installationType.save();
}

export function handleEditInstallationType(event: EditInstallationType): void {
    // Event entity creation removed - no longer storing event entities

    let installationTypeId = event.params._installationId;
    let installationType = getOrCreateInstallationType(installationTypeId);
    installationType = updateInstallationType(installationType);
    installationType.save();
}

export function handleDeprecateInstallation(
    event: DeprecateInstallation
): void {
    // Event entity creation removed - no longer storing event entities

    let installationTypeId = event.params._installationId;
    let installationType = getOrCreateInstallationType(installationTypeId);
    installationType.deprecatedAt = event.block.timestamp;
    installationType.deprecated = true;
    installationType.save();
}

export function handleCraftTimeReduced(event: CraftTimeReduced): void {
    // Event entity creation removed - no longer storing event entities

    // stats
    let gltrSpend = event.params._blocksReduced.times(
        BigInt.fromString("1000000000000000000")
    );
    let overallStats = getStat(StatCategory.OVERALL);
    overallStats.craftTimeReduced = overallStats.craftTimeReduced.plus(
        event.params._blocksReduced
    );
    overallStats.gltrSpendOnCrafts = overallStats.gltrSpendOnCrafts!.plus(
        gltrSpend
    );
    overallStats.gltrSpendTotal = overallStats.gltrSpendTotal!.plus(gltrSpend);
    overallStats.save();

    let userStats = getStat(
        StatCategory.USER,
        event.transaction.from.toHexString()
    );
    userStats.craftTimeReduced = userStats.craftTimeReduced.plus(
        event.params._blocksReduced
    );
    userStats.gltrSpendOnCrafts = userStats.gltrSpendOnCrafts!.plus(gltrSpend);
    userStats.gltrSpendTotal = userStats.gltrSpendTotal!.plus(gltrSpend);
    userStats.save();
}

export function handleUpgradeTimeReduced(event: UpgradeTimeReduced): void {
    // Event entity creation removed - no longer storing event entities

    // stats
    let gltrSpend = event.params._blocksReduced.times(
        BigInt.fromString("1000000000000000000")
    );
    let overallStats = getStat(StatCategory.OVERALL);
    overallStats.upgradeTimeReduced = overallStats.upgradeTimeReduced.plus(
        event.params._blocksReduced
    );
    overallStats.gltrSpendOnUpgrades = overallStats.gltrSpendOnUpgrades!.plus(
        gltrSpend
    );
    overallStats.gltrSpendTotal = overallStats.gltrSpendTotal!.plus(gltrSpend);
    overallStats.save();

    let parcelStats = getStat(
        StatCategory.PARCEL,
        event.params._realmId.toString()
    );
    parcelStats.upgradeTimeReduced = parcelStats.upgradeTimeReduced.plus(
        event.params._blocksReduced
    );
    parcelStats.gltrSpendOnUpgrades = parcelStats.gltrSpendOnUpgrades!.plus(
        gltrSpend
    );
    parcelStats.gltrSpendTotal = parcelStats.gltrSpendTotal!.plus(gltrSpend);
    parcelStats.save();

    let userStats = getStat(
        StatCategory.USER,
        event.transaction.from.toHexString()
    );
    userStats.upgradeTimeReduced = userStats.upgradeTimeReduced.plus(
        event.params._blocksReduced
    );
    userStats.gltrSpendOnUpgrades = userStats.gltrSpendOnUpgrades!.plus(
        gltrSpend
    );
    userStats.gltrSpendTotal = userStats.gltrSpendTotal!.plus(gltrSpend);
    userStats.save();
}

// Removed empty handlers - they only created event entities with no other business logic
// handleUpgradeFinalized and handleUpgradeQueued removed

export function handleURI(event: URI): void {
    // Event entity creation removed - no longer storing event entities

    // update installationtype
    let installation = getOrCreateInstallationType(event.params._tokenId);
    installation.uri = event.params._value;
    installation.save();
}

export function handleEditDeprecateTime(event: EditDeprecateTime): void {
    // Event entity creation removed - no longer storing event entities

    // update installationType
    let installationType = getOrCreateInstallationType(
        event.params._installationId
    );
    installationType.deprecatedAt = event.params._newDeprecatetime;
    installationType.save();
}
