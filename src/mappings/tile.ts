import { MintTile } from "../../generated/TileDiamond/TileDiamond";
import { BIGINT_ONE, StatCategory } from "../helper/constants";
import { getStat, updateAlchemicaSpendOnTiles } from "../helper/stats";
import { createMintTileEvent, getOrCreateTile } from "../helper/tiles";

export function handleMintTile (event: MintTile): void {
    let eventEntity = createMintTileEvent(event);
    eventEntity.save();

    let tile = getOrCreateTile(event.params._tileId);
    tile.save();

    // stats
    let statsOverall = getStat(StatCategory.OVERALL);
    statsOverall.tilesMinted = statsOverall.tilesMinted.plus(BIGINT_ONE);
    statsOverall = updateAlchemicaSpendOnTiles(statsOverall, tile);
    statsOverall.save();

    let statsUser = getStat(StatCategory.USER, event.params._owner.toHexString());
    statsUser.tilesMinted = statsUser.tilesMinted.plus(BIGINT_ONE);
    statsUser = updateAlchemicaSpendOnTiles(statsUser, tile);
    statsUser.save();
}