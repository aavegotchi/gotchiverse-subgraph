import { BigInt, TypedMap } from "@graphprotocol/graph-ts";
import { CraftTimeReduced } from "../../generated/InstallationDiamond/InstallationDiamond";
import { MintTile } from "../../generated/TileDiamond/TileDiamond";
import { BIGINT_ONE, StatCategory } from "../helper/constants";
import { createCraftTimeReducedEvent } from "../helper/installation";
import { getStat, updateAlchemicaSpendOnTiles } from "../helper/stats";
import { createMintTileEvent, getOrCreateTileType } from "../helper/tiles";

export function handleMintTile (event: MintTile): void {
    let eventEntity = createMintTileEvent(event);
    eventEntity.save();

    let type = getOrCreateTileType(event.params._tileId);
    type.tileType = event.params._tileType;
    type.save();

    // stats
    let statsOverall = getStat(StatCategory.OVERALL);
    statsOverall.tilesMinted = statsOverall.tilesMinted.plus(BIGINT_ONE);
    statsOverall = updateAlchemicaSpendOnTiles(statsOverall, type);
    statsOverall.save();

    let statsUser = getStat(StatCategory.USER, event.params._owner.toHexString());
    statsUser.tilesMinted = statsUser.tilesMinted.plus(BIGINT_ONE);
    statsUser = updateAlchemicaSpendOnTiles(statsUser, type);
    statsUser.save();
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
