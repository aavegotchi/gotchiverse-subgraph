import { BigInt } from "@graphprotocol/graph-ts";
import {
    MintTileEvent,
    MintTilesEvent,
    Parcel,
    Tile,
    TileType,
} from "../../generated/schema";
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

export function createMintTileEvent(event: MintTile): MintTileEvent {
    let id =
        event.params._tileId.toString() +
        "-" +
        event.params._owner.toHexString() +
        "-" +
        event.block.number.toString();
    let eventEntity = new MintTileEvent(id);
    eventEntity.transaction = event.transaction.hash;
    eventEntity.block = event.block.number;
    eventEntity.timestamp = event.block.timestamp;
    eventEntity.owner = event.params._owner;
    eventEntity.tile = event.params._tileType.toString();
    return eventEntity;
}

export function createMintTilesEvent(event: MintTiles): MintTilesEvent {
    let id =
        event.params._tileId.toString() +
        "-" +
        event.params._amount.toString() +
        "-" +
        event.params._owner.toHexString() +
        "-" +
        event.block.number.toString();
    let eventEntity = new MintTilesEvent(id);
    eventEntity.transaction = event.transaction.hash;
    eventEntity.block = event.block.number;
    eventEntity.timestamp = event.block.timestamp;
    eventEntity.owner = event.params._owner;
    eventEntity.tile = event.params._tileId.toString();
    eventEntity.amount = event.params._amount;
    return eventEntity;
}
