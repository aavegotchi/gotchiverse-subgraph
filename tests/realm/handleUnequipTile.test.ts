import { ethereum, store } from "@graphprotocol/graph-ts";
import {
    afterAll,
    assert,
    beforeAll,
    clearStore,
    createMockedFunction,
    describe,
    newMockEvent,
    test,
} from "matchstick-as";
import { UnequipTile } from "../../generated/RealmDiamond/RealmDiamond";
import { Tile } from "../../generated/schema";
import {
    BIGINT_EIGHT,
    BIGINT_FIVE,
    BIGINT_FOUR,
    BIGINT_ONE,
    BIGINT_SEVEN,
    BIGINT_SIX,
    BIGINT_THREE,
    BIGINT_TWO,
    REALM_DIAMOND,
    TILE_DIAMOND,
} from "../../src/helper/constants";
import { getOrCreateParcel } from "../../src/helper/realm";
import { handleUnequipTile } from "../../src/mappings/realm";

let mockEvent = newMockEvent();
let realmId = BIGINT_ONE;
describe("handleUnequipTile", () => {
    beforeAll(() => {
        // prepare event
        let event = new UnequipTile(
            mockEvent.address,
            mockEvent.logIndex,
            mockEvent.transactionLogIndex,
            mockEvent.logType,
            mockEvent.block,
            mockEvent.transaction,
            mockEvent.parameters,
            null
        );

        event.parameters.push(
            new ethereum.EventParam(
                "_realmId",
                ethereum.Value.fromSignedBigInt(realmId)
            )
        );

        event.parameters.push(
            new ethereum.EventParam(
                "_tileId",
                ethereum.Value.fromSignedBigInt(BIGINT_ONE)
            )
        );

        event.parameters.push(
            new ethereum.EventParam(
                "_x",
                ethereum.Value.fromSignedBigInt(BIGINT_ONE)
            )
        );

        event.parameters.push(
            new ethereum.EventParam(
                "_y",
                ethereum.Value.fromSignedBigInt(BIGINT_ONE)
            )
        );

        // mock getParcelInfo
        let tuple: ethereum.Tuple = changetype<ethereum.Tuple>([
            ethereum.Value.fromString("A"),
            ethereum.Value.fromString("B"),
            ethereum.Value.fromAddress(REALM_DIAMOND),
            ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
            ethereum.Value.fromUnsignedBigInt(BIGINT_TWO),
            ethereum.Value.fromUnsignedBigInt(BIGINT_THREE),
            ethereum.Value.fromUnsignedBigInt(BIGINT_FOUR),
            ethereum.Value.fromUnsignedBigIntArray([
                BIGINT_FIVE,
                BIGINT_SIX,
                BIGINT_SEVEN,
                BIGINT_EIGHT,
            ]),
        ]);
        createMockedFunction(
            REALM_DIAMOND,
            "getParcelInfo",
            "getParcelInfo(uint256):((string,string,address,uint256,uint256,uint256,uint256,uint256[4]))"
        )
            .withArgs([ethereum.Value.fromUnsignedBigInt(realmId)])
            .returns([ethereum.Value.fromTuple(tuple)]);

        // mock getTileType
        let tupleTile: ethereum.Tuple = changetype<ethereum.Tuple>([
            ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
            ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
            ethereum.Value.fromBoolean(true),
            ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
            ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
            ethereum.Value.fromUnsignedBigIntArray([
                BIGINT_ONE,
                BIGINT_ONE,
                BIGINT_ONE,
                BIGINT_ONE,
            ]),
            ethereum.Value.fromString("B"),
        ]);
        createMockedFunction(
            TILE_DIAMOND,
            "getTileType",
            "getTileType(uint256):((uint8,uint8,bool,uint16,uint32,uint256[4],string))"
        )
            .withArgs([ethereum.Value.fromUnsignedBigInt(BIGINT_ONE)])
            .returns([ethereum.Value.fromTuple(tupleTile)]);

        // prepare testdata
        let tile = new Tile("1-1-1-1");
        tile.equipped = true;
        tile.x = BIGINT_ONE;
        tile.y = BIGINT_ONE;
        tile.parcel = "1";
        tile.type = "1";
        tile.owner = mockEvent.transaction.from;
        store.set("Tile", "1-1-1-1", tile);

        let parcel = getOrCreateParcel(BIGINT_ONE);
        let equippedTiles = parcel.equippedTiles;
        equippedTiles.push("1");
        parcel.equippedTiles = equippedTiles;
        store.set("Parcel", "1", parcel);

        handleUnequipTile(event);
    });

    test("it should create an event entity", () => {
        let id =
            mockEvent.transaction.hash.toHexString() +
            "/" +
            mockEvent.logIndex.toString();
        assert.fieldEquals("UnequipTileEvent", id, "id", id);
        assert.fieldEquals(
            "UnequipTileEvent",
            id,
            "block",
            mockEvent.block.number.toString()
        );
        assert.fieldEquals(
            "UnequipTileEvent",
            id,
            "timestamp",
            mockEvent.block.timestamp.toString()
        );

        assert.fieldEquals(
            "UnequipTileEvent",
            id,
            "transaction",
            mockEvent.transaction.hash.toHexString()
        );

        assert.fieldEquals("UnequipTileEvent", id, "tile", "1");
        assert.fieldEquals("UnequipTileEvent", id, "tileId", "1");

        assert.fieldEquals("UnequipTileEvent", id, "realmId", "1");
        assert.fieldEquals("UnequipTileEvent", id, "parcel", "1");

        assert.fieldEquals("UnequipTileEvent", id, "x", "1");
        assert.fieldEquals("UnequipTileEvent", id, "y", "1");
    });

    test("it should remove the tileId from the equippedTiles array of parcel entity", () => {
        assert.fieldEquals("Parcel", "1", "equippedTiles", "[]");
    });

    test("it should set equipped attribute of tile instance to false", () => {
        assert.fieldEquals("Tile", "1-1-1-1", "id", "1-1-1-1");
        assert.fieldEquals("Tile", "1-1-1-1", "x", "1");
        assert.fieldEquals("Tile", "1-1-1-1", "y", "1");
        assert.fieldEquals("Tile", "1-1-1-1", "type", "1");
        assert.fieldEquals("Tile", "1-1-1-1", "parcel", "1");
        assert.fieldEquals("Tile", "1-1-1-1", "equipped", "false");
        assert.fieldEquals(
            "Tile",
            "1-1-1-1",
            "owner",
            mockEvent.transaction.from.toHexString()
        );
    });

    test("it should update equippend tiles attributes of global stats", () => {
        assert.fieldEquals("Stat", "overall", "tilesEquippedCurrent", "-1");
        assert.fieldEquals("Stat", "overall", "tilesEquippedTotal", "0");
    });

    test("it should update equippend tiles attributes of user stats", () => {
        assert.fieldEquals(
            "Stat",
            "user-" + mockEvent.transaction.from.toHexString(),
            "tilesEquippedCurrent",
            "-1"
        );

        assert.fieldEquals(
            "Stat",
            "user-" + mockEvent.transaction.from.toHexString(),
            "tilesEquippedTotal",
            "0"
        );
    });

    test("it should update equippend tiles attributes of parcel stats", () => {
        assert.fieldEquals("Stat", "parcel-1", "tilesEquippedCurrent", "-1");
        assert.fieldEquals("Stat", "parcel-1", "tilesEquippedTotal", "0");
    });

    afterAll(() => {
        clearStore();
    });
});
