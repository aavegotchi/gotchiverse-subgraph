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
import { EditTileType } from "../../generated/TileDiamond/TileDiamond";
import { BIGINT_ONE, TILE_DIAMOND } from "../../src/helper/constants";
import { handleEditTileType } from "../../src/mappings/tile";

let mockEvent = newMockEvent();
describe("handleEditTileType", () => {
    beforeAll(() => {
        // prepare event
        let event = new EditTileType(
            mockEvent.address,
            mockEvent.logIndex,
            mockEvent.transactionLogIndex,
            mockEvent.logType,
            mockEvent.block,
            mockEvent.transaction,
            mockEvent.parameters,
            null
        );

        let paramTuple = changetype<ethereum.Tuple>([
            ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
            ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
            ethereum.Value.fromBoolean(true),
            ethereum.Value.fromI32(1),
            ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
            ethereum.Value.fromUnsignedBigIntArray([
                BIGINT_ONE,
                BIGINT_ONE,
                BIGINT_ONE,
                BIGINT_ONE,
            ]),
            ethereum.Value.fromString("A"),
        ]);

        event.parameters.push(
            new ethereum.EventParam(
                "_tileId",
                ethereum.Value.fromSignedBigInt(BIGINT_ONE)
            )
        );

        event.parameters.push(
            new ethereum.EventParam(
                "param1",
                ethereum.Value.fromTuple(paramTuple)
            )
        );

        // mock getTileType
        let tuple = changetype<ethereum.Tuple>([
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
            ethereum.Value.fromString("A"),
        ]);
        createMockedFunction(
            TILE_DIAMOND,
            "getTileType",
            "getTileType(uint256):((uint8,uint8,bool,uint16,uint32,uint256[4],string))"
        )
            .withArgs([ethereum.Value.fromUnsignedBigInt(BIGINT_ONE)])
            .returns([ethereum.Value.fromTuple(tuple)]);

        handleEditTileType(event);
    });

    test("it should create an event entity", () => {
        let id =
            mockEvent.transaction.hash.toHexString() +
            "/" +
            mockEvent.logIndex.toString();
        assert.fieldEquals("EditTileTypeEvent", id, "id", id);
        assert.fieldEquals(
            "EditTileTypeEvent",
            id,
            "block",
            mockEvent.block.number.toString()
        );
        assert.fieldEquals(
            "EditTileTypeEvent",
            id,
            "timestamp",
            mockEvent.block.timestamp.toString()
        );
        assert.fieldEquals(
            "EditTileTypeEvent",
            id,
            "transaction",
            mockEvent.transaction.hash.toHexString()
        );
        assert.fieldEquals("EditTileTypeEvent", id, "tileType", "1");
        assert.fieldEquals("EditTileTypeEvent", id, "tileId", "1");
        assert.fieldEquals(
            "EditTileTypeEvent",
            id,
            "_alchemicaCost",
            "[1, 1, 1, 1]"
        );
        assert.fieldEquals("EditTileTypeEvent", id, "_craftTime", "1");
        assert.fieldEquals("EditTileTypeEvent", id, "_deprecated", "true");
        assert.fieldEquals("EditTileTypeEvent", id, "_height", "1");
        assert.fieldEquals("EditTileTypeEvent", id, "_width", "1");
        assert.fieldEquals("EditTileTypeEvent", id, "_name", "A");
        assert.fieldEquals(
            "EditTileTypeEvent",
            id,
            "contract",
            mockEvent.address.toHexString()
        );
    });

    test("it should create TileType entity", () => {
        assert.fieldEquals("TileType", "1", "width", "1");
        assert.fieldEquals("TileType", "1", "tileType", "1");
        assert.fieldEquals("TileType", "1", "height", "1");
        assert.fieldEquals("TileType", "1", "craftTime", "1");
        assert.fieldEquals("TileType", "1", "deprecated", "true");
        assert.fieldEquals("TileType", "1", "alchemicaCost", "[1, 1, 1, 1]");
        assert.fieldEquals("TileType", "1", "name", "A");
        assert.fieldEquals("TileType", "1", "amount", "0");
    });

    afterAll(() => {
        clearStore();
    });
});
