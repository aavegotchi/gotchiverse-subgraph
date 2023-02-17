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
import { URI } from "../../generated/TileDiamond/TileDiamond";
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
import { handleURI } from "../../src/mappings/tile";

let mockEvent = newMockEvent();
describe("handleURI", () => {
    beforeAll(() => {
        // prepare event
        let event = new URI(
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
                "_value",
                ethereum.Value.fromString("newuri")
            )
        );

        event.parameters.push(
            new ethereum.EventParam(
                "_tokenId",
                ethereum.Value.fromSignedBigInt(BIGINT_ONE)
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
            .withArgs([ethereum.Value.fromUnsignedBigInt(BIGINT_ONE)])
            .returns([ethereum.Value.fromTuple(tuple)]);

        handleURI(event);
    });

    test("it should create an event entity", () => {
        let id =
            mockEvent.transaction.hash.toHexString() +
            "/" +
            mockEvent.logIndex.toString();
        assert.fieldEquals("URIEvent", id, "id", id);
        assert.fieldEquals(
            "URIEvent",
            id,
            "block",
            mockEvent.block.number.toString()
        );
        assert.fieldEquals(
            "URIEvent",
            id,
            "timestamp",
            mockEvent.block.timestamp.toString()
        );
        assert.fieldEquals(
            "URIEvent",
            id,
            "transaction",
            mockEvent.transaction.hash.toHexString()
        );
        assert.fieldEquals("URIEvent", id, "value", "newuri");
        assert.fieldEquals("URIEvent", id, "tokenId", "1");
    });

    test("it should update uri of TileType entity", () => {
        assert.fieldEquals("TileType", "1", "width", "1");
        assert.fieldEquals("TileType", "1", "tileType", "1");
        assert.fieldEquals("TileType", "1", "height", "1");
        assert.fieldEquals("TileType", "1", "craftTime", "1");
        assert.fieldEquals("TileType", "1", "deprecated", "true");
        assert.fieldEquals("TileType", "1", "alchemicaCost", "[1, 1, 1, 1]");
        assert.fieldEquals("TileType", "1", "name", "A");
        assert.fieldEquals("TileType", "1", "amount", "0");
        assert.fieldEquals("TileType", "1", "uri", "newuri");
    });

    afterAll(() => {
        clearStore();
    });
});
