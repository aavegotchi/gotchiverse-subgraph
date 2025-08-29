import { BigInt } from "@graphprotocol/graph-ts";
import { Parcel, Tile, TileType } from "../../generated/schema";
import {
    MintTile,
    MintTiles,
    TileDiamond,
} from "../../generated/TileDiamond/TileDiamond";
import { BIGINT_ZERO, TILE_DIAMOND } from "./constants";

export function getOrCreateTileType(tileId: BigInt): TileType {
    let id = tileId.toString();
    let tile = TileType.load(id);
    if (!tile) {
        tile = new TileType(id);
        let contract = TileDiamond.bind(TILE_DIAMOND);
        let result = contract.try_getTileType(tileId);
        if (result.reverted) {
            return tile;
        }

        let data = result.value;
        tile.alchemicaCost = data.alchemicaCost;
        tile.craftTime = data.craftTime;
        tile.deprecated = data.deprecated;
        tile.deprecatedAt = BIGINT_ZERO;
        tile.height = data.height;
        tile.width = data.width;
        tile.name = data.name;
        tile.tileType = data.tileType;
        tile.amount = BIGINT_ZERO;
    }

    return tile;
}

export function getOrCreateTile(
    parcel: Parcel,
    tileType: TileType,
    x: BigInt,
    y: BigInt
): Tile {
    let id =
        parcel.id + "-" + tileType.id + "-" + x.toString() + "-" + y.toString();
    let tile = Tile.load(id);
    if (!tile) {
        tile = new Tile(id);
        tile.parcel = parcel.id;
        tile.type = tileType.id;
        tile.x = x;
        tile.y = y;
    }
    return tile;
}

// createMintTileEvent removed - no longer storing event entities

// createMintTilesEvent removed - no longer storing event entities
