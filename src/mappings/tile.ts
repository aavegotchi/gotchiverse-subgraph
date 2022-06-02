import { MintTile } from "../../generated/InstallationDiamond/InstallationDiamond";
import { BIGINT_ONE, StatCategory } from "../helper/constants";
import { createMintTileEvent, getOrCreateTile, getOrCreateTiletype } from "../helper/installation";
import { getStat, updateAlchemicaSpendOnTiles } from "../helper/stats";

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