import { BigInt } from "@graphprotocol/graph-ts";
import { CraftTimeReduced } from "../../generated/InstallationDiamond/InstallationDiamond";
// Removed event entity imports - no longer storing event entities
import {
    EditDeprecateTime,
    EditTileType,
    MintTile,
    MintTiles,
    URI,
} from "../../generated/TileDiamond/TileDiamond";
import { BIGINT_ONE, StatCategory } from "../helper/constants";
// Removed createCraftTimeReducedEvent import - no longer storing event entities
import { getStat, updateAlchemicaSpendOnTiles } from "../helper/stats";
import { getOrCreateTileType } from "../helper/tiles";

export function handleMintTile(event: MintTile): void {
    // Event entity creation removed - no longer storing event entities

    let type = getOrCreateTileType(event.params._tileType);
    type.amount = type.amount.plus(BIGINT_ONE);
    type.save();

    // stats
    let statsOverall = getStat(StatCategory.OVERALL);
    statsOverall.tilesMinted = statsOverall.tilesMinted.plus(BIGINT_ONE);
    statsOverall = updateAlchemicaSpendOnTiles(statsOverall, type);
    statsOverall.save();

    let statsUser = getStat(
        StatCategory.USER,
        event.params._owner.toHexString()
    );
    statsUser.tilesMinted = statsUser.tilesMinted.plus(BIGINT_ONE);
    statsUser = updateAlchemicaSpendOnTiles(statsUser, type);
    statsUser.save();
}

export function handleMintTiles(event: MintTiles): void {
    // Event entity creation removed - no longer storing event entities
    let bigIntAmount = BigInt.fromI32(event.params._amount);
    let type = getOrCreateTileType(event.params._tileId);
    type.amount = type.amount.plus(bigIntAmount);
    type.save();

    // stats
    let statsOverall = getStat(StatCategory.OVERALL);
    statsOverall.tilesMinted = statsOverall.tilesMinted.plus(bigIntAmount);
    for (let i = 0; i < event.params._amount; i++) {
        statsOverall = updateAlchemicaSpendOnTiles(statsOverall, type);
    }
    statsOverall.save();

    let statsUser = getStat(
        StatCategory.USER,
        event.params._owner.toHexString()
    );

    statsUser.tilesMinted = statsUser.tilesMinted.plus(bigIntAmount);
    for (let i = 0; i < event.params._amount; i++) {
        statsUser = updateAlchemicaSpendOnTiles(statsUser, type);
    }
    statsUser.save();
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

export function handleURI(event: URI): void {
    // Event entity creation removed - no longer storing event entities

    // update tile
    let tile = getOrCreateTileType(event.params._tokenId);
    tile.uri = event.params._value;
    tile.save();
}

export function handleEditTileType(event: EditTileType): void {
    // Event entity creation removed - no longer storing event entities

    // update tileType
    let tileType = getOrCreateTileType(event.params._tileId);
    tileType.alchemicaCost = event.params.param1.alchemicaCost;
    tileType.craftTime = event.params.param1.craftTime;
    tileType.deprecated = event.params.param1.deprecated;
    tileType.height = event.params.param1.height;
    tileType.width = event.params.param1.width;
    tileType.name = event.params.param1.name;
    tileType.tileType = event.params.param1.tileType;
    tileType.save();
}

export function handleEditDeprecateTime(event: EditDeprecateTime): void {
    // Event entity creation removed - no longer storing event entities

    // update tileType
    let tileType = getOrCreateTileType(event.params._tileId);
    tileType.deprecatedAt = event.params._newDeprecatetime;
    tileType.save();
}
