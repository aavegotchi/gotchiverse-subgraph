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
import { EditDeprecateTime } from "../../generated/TileDiamond/TileDiamond";
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
import { handleEditDeprecateTime } from "../../src/mappings/tile";

let mockEvent = newMockEvent();
let tileId = BIGINT_NINE;
let newDeprecateTime = BIGINT_FOUR;
describe("handleEditDeprecateTime", () => {
    beforeAll(() => {
        // prepare event
        let event = new EditDeprecateTime(
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
                "_tileId",
                ethereum.Value.fromUnsignedBigInt(tileId)
            )
        );

        event.parameters.push(
            new ethereum.EventParam(
                "_newDeprecatetime",
                ethereum.Value.fromUnsignedBigInt(newDeprecateTime)
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

        handleEditDeprecateTime(event);
    });

    test("it should create an event entity", () => {
        let id =
            mockEvent.transaction.hash.toHexString() +
            "/" +
            mockEvent.logIndex.toString();
        assert.fieldEquals("EditDeprecateTimeEvent", id, "id", id);
        assert.fieldEquals(
            "EditDeprecateTimeEvent",
            id,
            "block",
            mockEvent.block.number.toString()
        );
        assert.fieldEquals(
            "EditDeprecateTimeEvent",
            id,
            "timestamp",
            mockEvent.block.timestamp.toString()
        );
        assert.fieldEquals(
            "EditDeprecateTimeEvent",
            id,
            "transaction",
            mockEvent.transaction.hash.toHexString()
        );

        assert.fieldEquals(
            "EditDeprecateTimeEvent",
            id,
            "contract",
            mockEvent.address.toHexString()
        );

        assert.fieldEquals(
            "EditDeprecateTimeEvent",
            id,
            "tileType",
            tileId.toString()
        );
        assert.fieldEquals(
            "EditDeprecateTimeEvent",
            id,
            "tileId",
            tileId.toString()
        );
        assert.fieldEquals(
            "EditDeprecateTimeEvent",
            id,
            "newDeprecatetime",
            newDeprecateTime.toString()
        );
    });

    test("it should create TileType entity", () => {
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
        assert.fieldEquals(
            "TileType",
            tileId.toString(),
            "deprecatedAt",
            newDeprecateTime.toString()
        );
    });

    afterAll(() => {
        clearStore();
    });
});
