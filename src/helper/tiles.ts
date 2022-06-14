import { BigInt } from "@graphprotocol/graph-ts";
import { CraftTimeReducedEvent, MintTileEvent, Tile, TileType } from "../../generated/schema";
import { CraftTimeReduced, MintTile, TileDiamond } from "./../../generated/TileDiamond/TileDiamond"
import { TILE_DIAMOND } from "./constants";

export function createCraftTimeReducedEvent(event: CraftTimeReduced): CraftTimeReducedEvent {
  let id = event.transaction.hash.toHexString();
  let eventEntity = CraftTimeReducedEvent.load(id);
  if(!eventEntity) {
      eventEntity = new CraftTimeReducedEvent(id);
      eventEntity.transaction = event.transaction.hash
      eventEntity.block = event.block.number;
      eventEntity.timestamp = event.block.timestamp;
      eventEntity.blocksReduced = event.params._blocksReduced;
  }
  return eventEntity;
}

export function createMintTileEvent(event: MintTile): MintTileEvent {
  let id = event.transaction.hash.toHexString();
  let eventEntity = new MintTileEvent(id);
  eventEntity.transaction = event.transaction.hash
  eventEntity.block = event.block.number;
  eventEntity.timestamp = event.block.timestamp;
  eventEntity.owner = event.params._owner;
  eventEntity.tileType = event.params._tileType.toString();
  eventEntity.tile = event.params._tileId.toString();
  let tileType = getOrCreateTiletype(event.params._tileType);
  eventEntity.tileType = tileType.id;
  let tile = getOrCreateTile(event.params._tileId);
  eventEntity.tile = tile.id;

  return eventEntity;
}

export function getOrCreateTile(tileId: BigInt): Tile {
  let id = "tile-"+ tileId.toString();
  let tile = Tile.load(id);
  if(!tile) {
      tile = new Tile(id);
  }
  return tile;
}

export function getOrCreateTiletype(tileTypeId: BigInt): TileType {
  let id = "tiletype-"+tileTypeId.toString();
  let type = TileType.load(id);
  if(!type) {
      type = new TileType(id);
      let contract = TileDiamond.bind(TILE_DIAMOND);
      let result = contract.try_getTileType(tileTypeId);
      if(result.reverted) {
          return type;
      }

      let data = result.value;
      type.alchemicaCost = data.alchemicaCost;
      type.craftTime = data.craftTime;
      type.deprecated = data.deprecated;
      type.height =  data.height;
      type.width = data.width;
      type.tileType = data.tileType;
      type.name = data.name;
  }

  return type;
}