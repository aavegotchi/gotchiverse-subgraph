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
    BIGINT_NINE,
    BIGINT_ONE,
    BIGINT_SEVEN,
    BIGINT_SIX,
    BIGINT_THREE,
    BIGINT_TWO,
    TILE_DIAMOND,
} from "../../src/helper/constants";
import { handleURI } from "../../src/mappings/tile";

let mockEvent = newMockEvent();
let tileId = BIGINT_NINE;
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
                ethereum.Value.fromSignedBigInt(tileId)
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
        assert.fieldEquals("URIEvent", id, "tokenId", "9");
    });

    test("it should update uri of TileType entity", () => {
        assert.fieldEquals("TileType", tileId.toString(), "width", "1");
        assert.fieldEquals("TileType", tileId.toString(), "tileType", "3");
        assert.fieldEquals("TileType", tileId.toString(), "height", "2");
        assert.fieldEquals("TileType", tileId.toString(), "craftTime", "4");
        assert.fieldEquals("TileType", tileId.toString(), "deprecated", "true");
        assert.fieldEquals(
            "TileType",
            tileId.toString(),
            "alchemicaCost",
            "[5, 6, 7, 8]"
        );
        assert.fieldEquals("TileType", tileId.toString(), "name", "A");
        assert.fieldEquals("TileType", tileId.toString(), "amount", "0");
        assert.fieldEquals("TileType", tileId.toString(), "uri", "newuri");
    });

    afterAll(() => {
        clearStore();
    });
});
