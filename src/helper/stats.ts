import { BigInt } from "@graphprotocol/graph-ts";
import { InstallationType, Stat, TileType } from "../../generated/schema";
import { BIGINT_ONE, BIGINT_ZERO, StatCategory, STAT_CATEGORIES } from "./constants";

export const getStat = (category: StatCategory, entityId: string = "0"): Stat => {
    let id = STAT_CATEGORIES[category];
    if(category != StatCategory.OVERALL) {
        id = id  + "-" + entityId.toString();
    }
    
    let stats = Stat.load(id);
    if(!stats) {
        stats = new Stat(id);
        stats.countChannelAlchemicaEvents = BIGINT_ZERO;
        stats.countParcelInstallations = BIGINT_ZERO;
        stats.countInstallationTypes = BIGINT_ZERO;
        stats.countUpgradesInitiated = BIGINT_ZERO;

        let emptyAlchemicaWallet = [BIGINT_ZERO, BIGINT_ZERO, BIGINT_ZERO, BIGINT_ZERO];
        stats.alchemicaChanneledTotal = emptyAlchemicaWallet;
        stats.alchemicaSpendOnInstallations = emptyAlchemicaWallet;
        stats.alchemicaSpendOnUpgrades = emptyAlchemicaWallet;
        stats.alchemicaSpendOnTiles = emptyAlchemicaWallet;
        stats.alchemicaSpendTotal = emptyAlchemicaWallet;
        stats.alchemicaClaimedTotal = emptyAlchemicaWallet;
        stats.alchemicaExitedTotal = emptyAlchemicaWallet;
        
        stats.tilesEquippedTotal = BIGINT_ZERO;
        stats.tilesUnequippedTotal = BIGINT_ZERO;
        stats.tilesEquippedCurrent = BIGINT_ZERO;
        stats.tilesMinted = BIGINT_ZERO;
        stats.installationsMintedTotal = BIGINT_ZERO;
        stats.installationsUpgradedTotal = BIGINT_ZERO;
        stats.installationsEquippedTotal = BIGINT_ZERO;
        stats.installationsUnequippedTotal = BIGINT_ZERO;
        stats.installationsEquippedCurrent = BIGINT_ZERO;
        
        stats.craftTimeReduced = BIGINT_ZERO;
        stats.upgradeTimeReduced = BIGINT_ZERO;

        stats.gltrSpendOnUpgrades = BigInt.fromI32("250630180000000000000000000");
    }

    return stats;
}

export function updateAlchemicaSpendOnTiles(stats: Stat, tile: TileType): Stat {
    let costsTiles = stats.alchemicaSpendOnTiles;
    let costsTotal = stats.alchemicaSpendTotal;
    let newCosts = tile.alchemicaCost;
    for(let i=0;i<newCosts.length; i++) {
        costsTiles[i] = costsTiles[i].plus(newCosts[i]);
        costsTotal[i] = costsTotal[i].plus(newCosts[i]);
    }
    stats.alchemicaSpendOnTiles = costsTiles;
    stats.alchemicaSpendTotal = costsTotal;
    return stats;
}

export function updateAlchemicaSpendOnUpgrades(stats: Stat, installation: InstallationType): Stat {
    let costs = installation.alchemicaCost;
    let spendTotal = stats.alchemicaSpendTotal;
    let spendDetail = stats.alchemicaSpendOnUpgrades; 

    for(let i=0;i<costs.length; i++) {
        spendDetail[i] = spendDetail[i].plus(costs[i]);
        spendTotal[i] = spendTotal[i].plus(costs[i]);
    }
    
    stats.alchemicaSpendOnUpgrades = spendDetail;
    stats.alchemicaSpendTotal = spendTotal;

    stats.installationsUpgradedTotal = stats.installationsUpgradedTotal.plus(BIGINT_ONE);
    return stats;
}

export function updateAlchemicaSpendOnInstallations(stats: Stat, installation: InstallationType): Stat {
    let costs = installation.alchemicaCost;
    let spendTotal = stats.alchemicaSpendTotal;
    let spendDetail = stats.alchemicaSpendOnInstallations; 

    for(let i=0;i<costs.length; i++) {
        spendDetail[i] = spendDetail[i].plus(costs[i]);
        spendTotal[i] = spendTotal[i].plus(costs[i]);
    }
    
    stats.alchemicaSpendOnInstallations = spendDetail;
    stats.alchemicaSpendTotal = spendTotal;

    stats.installationsMintedTotal = stats.installationsMintedTotal.plus(BIGINT_ONE);
    return stats;
}

export function updateChannelAlchemicaStats(stats: Stat, alchemica: Array<BigInt>):Stat {
    let alchemicaChanneledTotal = stats.alchemicaChanneledTotal;
    for(let i=0;i<alchemica.length; i++) {
        alchemicaChanneledTotal[i] = alchemicaChanneledTotal[i].plus(alchemica[i]);
        alchemicaChanneledTotal[i] = alchemicaChanneledTotal[i].plus(alchemica[i]);
    }
    stats.alchemicaChanneledTotal = alchemicaChanneledTotal;
    return stats;
}

export function updateAlchemicaClaimedStats(stats: Stat, index: i32, amount: BigInt): Stat {
    let alchemicaClaimedTotal = stats.alchemicaClaimedTotal;
    alchemicaClaimedTotal[index] = alchemicaClaimedTotal[index].plus(amount);
    stats.alchemicaClaimedTotal = alchemicaClaimedTotal;
    return stats;
}

export function updateExitedAlchemicaStats(stats: Stat, alchemica: Array<BigInt>): Stat {
    let alchemicaExitedTotal = stats.alchemicaExitedTotal;
    for(let i=0;i<alchemica.length; i++) {
        alchemicaExitedTotal[i] = alchemicaExitedTotal[i].plus(alchemica[i]);
        alchemicaExitedTotal[i] = alchemicaExitedTotal[i].plus(alchemica[i]);
    }
    stats.alchemicaExitedTotal = alchemicaExitedTotal;
    return stats;
}

export function updateInstallationEquippedStats(stats: Stat): Stat {
    stats.installationsEquippedCurrent = stats.installationsEquippedCurrent.plus(BIGINT_ONE);
    stats.installationsEquippedTotal = stats.installationsEquippedTotal.plus(BIGINT_ONE);
    return stats;
}

export function updateInstallationUnequippedStats(stats: Stat): Stat {
    stats.countParcelInstallations = stats.countParcelInstallations.minus(BIGINT_ONE);
    stats.installationsEquippedCurrent = stats.installationsEquippedCurrent.minus(BIGINT_ONE);
    stats.installationsUnequippedTotal = stats.installationsUnequippedTotal.plus(BIGINT_ONE);
    return stats;
}

export function updateInstallationUpgradedStats(stats: Stat): Stat {
    stats.installationsUpgradedTotal = stats.installationsUpgradedTotal.plus(BIGINT_ONE);
    return stats;
}

export function updateTileEquippedStats(stats: Stat): Stat {
    stats.tilesEquippedCurrent = stats.tilesEquippedCurrent.plus(BIGINT_ONE);
    stats.tilesEquippedTotal = stats.tilesEquippedTotal.plus(BIGINT_ONE);
    return stats;
}

export function updateTileUnequippedStats(stats: Stat): Stat {
    stats.tilesEquippedCurrent = stats.tilesEquippedCurrent.minus(BIGINT_ONE);
    stats.tilesUnequippedTotal = stats.tilesUnequippedTotal.plus(BIGINT_ONE);
    return stats;
}