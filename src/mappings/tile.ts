import { BigInt } from "@graphprotocol/graph-ts";
import { MintTile, CraftTimeReduced } from "../../generated/TileDiamond/TileDiamond";
import { BIGINT_ONE, StatCategory } from "../helper/constants";
import { getStat, updateAlchemicaSpendOnTiles } from "../helper/stats";
import { createCraftTimeReducedEvent, createMintTileEvent, getOrCreateTile, getOrCreateTiletype } from "../helper/tiles";

export function handleMintTile (event: MintTile): void {
    let eventEntity = createMintTileEvent(event);
    eventEntity.save();

    let tileType = getOrCreateTiletype(event.params._tileType);
    tileType.save();

    let tile = getOrCreateTile(event.params._tileId);
    tile.type = tileType.id;
    tile.save();

    // stats
    let statsOverall = getStat(StatCategory.OVERALL);
    statsOverall.tilesMinted = statsOverall.tilesMinted.plus(BIGINT_ONE);
    statsOverall = updateAlchemicaSpendOnTiles(statsOverall, tileType);
    statsOverall.save();

    let statsUser = getStat(StatCategory.USER, event.params._owner.toHexString());
    statsUser.tilesMinted = statsUser.tilesMinted.plus(BIGINT_ONE);
    statsUser = updateAlchemicaSpendOnTiles(statsUser, tileType);
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

    let parcelStats = getStat(StatCategory.PARCEL, eventEntity.parcel)
    parcelStats.craftTimeReduced = parcelStats.craftTimeReduced.plus(event.params._blocksReduced);
    parcelStats.gltrSpendOnCrafts = parcelStats.gltrSpendOnCrafts!.plus(gltrSpend);
    parcelStats.gltrSpendTotal = parcelStats.gltrSpendTotal!.plus(gltrSpend);
    parcelStats.save();

    let userStats = getStat(StatCategory.USER, event.transaction.from.toHexString());
    userStats.craftTimeReduced = userStats.craftTimeReduced.plus(event.params._blocksReduced);
    userStats.gltrSpendOnCrafts = userStats.gltrSpendOnCrafts!.plus(gltrSpend);
    userStats.gltrSpendTotal = userStats.gltrSpendTotal!.plus(gltrSpend);
    userStats.save();
}
