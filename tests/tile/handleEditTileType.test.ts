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
import {
    BIGINT_EIGHT,
    BIGINT_FIVE,
    BIGINT_FOUR,
    BIGINT_ONE,
    BIGINT_SEVEN,
    BIGINT_SIX,
    BIGINT_THREE,
    BIGINT_TWO,
    TILE_DIAMOND,
} from "../../src/helper/constants";
import { handleEditTileType } from "../../src/mappings/tile";

let mockEvent = newMockEvent();
let tileId = BIGINT_SEVEN;
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
                ethereum.Value.fromSignedBigInt(tileId)
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
            ethereum.Value.fromUnsignedBigInt(BIGINT_TWO),
            ethereum.Value.fromBoolean(true),
            ethereum.Value.fromUnsignedBigInt(BIGINT_THREE),
            ethereum.Value.fromUnsignedBigInt(BIGINT_FOUR),
            ethereum.Value.fromUnsignedBigIntArray([
                BIGINT_FIVE,
                BIGINT_SIX,
                BIGINT_SEVEN,
                BIGINT_EIGHT,
            ]),
            ethereum.Value.fromString("A"),
        ]);
        createMockedFunction(
            TILE_DIAMOND,
            "getTileType",
            "getTileType(uint256):((uint8,uint8,bool,uint16,uint32,uint256[4],string))"
        )
            .withArgs([ethereum.Value.fromUnsignedBigInt(tileId)])
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
        assert.fieldEquals(
            "EditTileTypeEvent",
            id,
            "tileType",
            tileId.toString()
        );
        assert.fieldEquals(
            "EditTileTypeEvent",
            id,
            "tileId",
            tileId.toString()
        );
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
        assert.fieldEquals("TileType", tileId.toString(), "width", "1");
        assert.fieldEquals("TileType", tileId.toString(), "height", "1");
        assert.fieldEquals("TileType", tileId.toString(), "craftTime", "1");
        assert.fieldEquals("TileType", tileId.toString(), "deprecated", "true");
        assert.fieldEquals(
            "TileType",
            tileId.toString(),
            "alchemicaCost",
            "[1, 1, 1, 1]"
        );
        assert.fieldEquals("TileType", tileId.toString(), "name", "A");
        assert.fieldEquals("TileType", tileId.toString(), "amount", "0");
    });

    afterAll(() => {
        clearStore();
    });
});
