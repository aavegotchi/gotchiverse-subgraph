import { ethereum } from "@graphprotocol/graph-ts";
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
import { EquipTile } from "../generated/RealmDiamond/RealmDiamond";
import {
    BIGINT_ONE,
    REALM_DIAMOND,
    TILE_DIAMOND,
} from "../src/helper/constants";
import { handleEquipTile } from "../src/mappings/realm";

let mockEvent = newMockEvent();
describe("handleEquipTile", () => {
    beforeAll(() => {
        // prepare event
        let event = new EquipTile(
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
                ethereum.Value.fromSignedBigInt(BIGINT_ONE)
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
            ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
            ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
            ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
            ethereum.Value.fromUnsignedBigIntArray([
                BIGINT_ONE,
                BIGINT_ONE,
                BIGINT_ONE,
                BIGINT_ONE,
            ]),
        ]);
        createMockedFunction(
            REALM_DIAMOND,
            "getParcelInfo",
            "getParcelInfo(uint256):((string,string,address,uint256,uint256,uint256,uint256,uint256[4]))"
        )
            .withArgs([ethereum.Value.fromUnsignedBigInt(BIGINT_ONE)])
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

        handleEquipTile(event);
    });

    test("it should create an event entity", () => {
        let id =
            mockEvent.transaction.hash.toHexString() +
            "/" +
            mockEvent.logIndex.toString();
        assert.fieldEquals("EquipTileEvent", id, "id", id);
        assert.fieldEquals(
            "EquipTileEvent",
            id,
            "block",
            mockEvent.block.number.toString()
        );
        assert.fieldEquals(
            "EquipTileEvent",
            id,
            "timestamp",
            mockEvent.block.timestamp.toString()
        );

        assert.fieldEquals(
            "EquipTileEvent",
            id,
            "transaction",
            mockEvent.transaction.hash.toHexString()
        );

        assert.fieldEquals("EquipTileEvent", id, "tile", "1");
        assert.fieldEquals("EquipTileEvent", id, "tileId", "1");

        assert.fieldEquals("EquipTileEvent", id, "realmId", "1");
        assert.fieldEquals("EquipTileEvent", id, "parcel", "1");

        assert.fieldEquals("EquipTileEvent", id, "x", "1");
        assert.fieldEquals("EquipTileEvent", id, "y", "1");
    });

    test("it should add the tileId to the equippedtiles array of parcel entity", () => {
        assert.fieldEquals("Parcel", "1", "equippedTiles", "[1]");
    });

    test("it should create entity of equipped tiles instance", () => {
        assert.fieldEquals("Tile", "1-1-1-1", "id", "1-1-1-1");
        assert.fieldEquals("Tile", "1-1-1-1", "x", "1");
        assert.fieldEquals("Tile", "1-1-1-1", "y", "1");
        assert.fieldEquals("Tile", "1-1-1-1", "type", "1");
        assert.fieldEquals("Tile", "1-1-1-1", "parcel", "1");
        assert.fieldEquals("Tile", "1-1-1-1", "equipped", "true");
    });

    test("it should update equippend tiles attributes of global stats", () => {
        assert.fieldEquals("Stat", "overall", "tilesEquippedCurrent", "1");
        assert.fieldEquals("Stat", "overall", "tilesEquippedTotal", "1");
    });

    test("it should update equippend tiles attributes of user stats", () => {
        assert.fieldEquals(
            "Stat",
            "user-" + mockEvent.transaction.from.toHexString(),
            "tilesEquippedCurrent",
            "1"
        );

        assert.fieldEquals(
            "Stat",
            "user-" + mockEvent.transaction.from.toHexString(),
            "tilesEquippedTotal",
            "1"
        );
    });

    test("it should update equippend tiles attributes of parcel stats", () => {
        assert.fieldEquals("Stat", "parcel-1", "tilesEquippedCurrent", "1");
        assert.fieldEquals("Stat", "parcel-1", "tilesEquippedTotal", "1");
    });

    afterAll(() => {
        clearStore();
    });
});
