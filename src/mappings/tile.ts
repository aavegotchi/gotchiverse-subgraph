import { BigInt } from "@graphprotocol/graph-ts";
import { CraftTimeReduced } from "../../generated/InstallationDiamond/InstallationDiamond";
import {
    EditDeprecateTimeEvent,
    EditTileTypeEvent,
    URIEvent,
} from "../../generated/schema";
import {
    EditDeprecateTime,
    EditTileType,
    MintTile,
    MintTiles,
    URI,
} from "../../generated/TileDiamond/TileDiamond";
import { BIGINT_ONE, StatCategory } from "../helper/constants";
import { createCraftTimeReducedEvent } from "../helper/installation";
import { getStat, updateAlchemicaSpendOnTiles } from "../helper/stats";
import {
    createMintTileEvent,
    createMintTilesEvent,
    getOrCreateTileType,
} from "../helper/tiles";

export function handleMintTile(event: MintTile): void {
    let eventEntity = createMintTileEvent(event);
    eventEntity.save();

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
    let eventEntity = createMintTilesEvent(event);
    eventEntity.save();
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
    let eventEntity = createCraftTimeReducedEvent(event);
    eventEntity.save();

    // stats
    let gltrSpend = event.params._blocksReduced.times(
        BigInt.fromString("1e18")
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
    // create event
    let id =
        event.transaction.from.toHexString() +
        "-" +
        event.params._tokenId.toString() +
        "-" +
        event.block.number.toString();
    let eventEntity = new URIEvent(id);
    eventEntity.transaction = event.transaction.hash;
    eventEntity.block = event.block.number;
    eventEntity.timestamp = event.block.timestamp;
    eventEntity.contract = event.address;
    eventEntity.value = event.params._value;
    eventEntity.tokenId = event.params._tokenId;
    eventEntity.save();

    // update tile
    let tile = getOrCreateTileType(event.params._tokenId);
    tile.uri = event.params._value;
    tile.save();
}

export function handleEditTileType(event: EditTileType): void {
    // create Event entity
    let id =
        event.transaction.from.toHexString() +
        "-" +
        event.params._tileId.toString() +
        "-" +
        event.block.number.toString();
    let eventEntity = new EditTileTypeEvent(id);
    eventEntity.transaction = event.transaction.hash;
    eventEntity.block = event.block.number;
    eventEntity.timestamp = event.block.timestamp;
    eventEntity.contract = event.address;
    eventEntity.tileId = event.params._tileId.toI32();
    eventEntity.tileType = event.params._tileId.toString();
    eventEntity.save();

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
    // create Event entity
    let id =
        event.transaction.from.toHexString() +
        "-" +
        event.params._tileId.toString() +
        "-" +
        event.block.number.toString();
    let eventEntity = new EditDeprecateTimeEvent(id);
    eventEntity.transaction = event.transaction.hash;
    eventEntity.block = event.block.number;
    eventEntity.timestamp = event.block.timestamp;
    eventEntity.contract = event.address;
    eventEntity.tileId = event.params._tileId.toI32();
    eventEntity.newDeprecatetime = eventEntity.newDeprecatetime;
    eventEntity.tileType = event.params._tileId.toString();
    eventEntity.save();

    // update tileType
    let tileType = getOrCreateTileType(event.params._tileId);
    tileType.deprecated = true;
    tileType.deprecatedAt = event.params._newDeprecatetime.toI32();
    tileType.save();
}
