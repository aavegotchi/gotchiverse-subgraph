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
import { MintTiles } from "../../generated/TileDiamond/TileDiamond";
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
import { handleMintTiles } from "../../src/mappings/tile";

let mockEvent = newMockEvent();
describe("handleMintTiles", () => {
    beforeAll(() => {
        // prepare event
        let event = new MintTiles(
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
                "_owner",
                ethereum.Value.fromAddress(mockEvent.transaction.from)
            )
        );

        event.parameters.push(
            new ethereum.EventParam(
                "_installationId",
                ethereum.Value.fromSignedBigInt(BIGINT_ONE)
            )
        );

        event.parameters.push(
            new ethereum.EventParam(
                "_amount",
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

        handleMintTiles(event);
    });

    test("it should create an event entity", () => {
        let id =
            "1-1-" +
            mockEvent.transaction.from.toHexString() +
            "-" +
            mockEvent.transaction.hash.toHexString();
        assert.fieldEquals("MintTilesEvent", id, "id", id);
        assert.fieldEquals(
            "MintTilesEvent",
            id,
            "block",
            mockEvent.block.number.toString()
        );
        assert.fieldEquals(
            "MintTilesEvent",
            id,
            "timestamp",
            mockEvent.block.timestamp.toString()
        );

        assert.fieldEquals(
            "MintTilesEvent",
            id,
            "transaction",
            mockEvent.transaction.hash.toHexString()
        );

        assert.fieldEquals("MintTilesEvent", id, "tile", "1");
        assert.fieldEquals(
            "MintTilesEvent",
            id,
            "owner",
            mockEvent.transaction.from.toHexString()
        );
        assert.fieldEquals("MintTilesEvent", id, "amount", "1");
    });

    test("it should update TileType entity", () => {
        assert.fieldEquals("TileType", "1", "width", "1");
        assert.fieldEquals("TileType", "1", "tileType", "1");
        assert.fieldEquals("TileType", "1", "height", "1");
        assert.fieldEquals("TileType", "1", "craftTime", "1");
        assert.fieldEquals("TileType", "1", "deprecated", "true");
        assert.fieldEquals("TileType", "1", "deprecatedAt", "0");
        assert.fieldEquals("TileType", "1", "alchemicaCost", "[1, 1, 1, 1]");
        assert.fieldEquals("TileType", "1", "name", "A");
        assert.fieldEquals("TileType", "1", "amount", "1");
    });

    test("it should update tilesMinted of overall stats", () => {
        assert.fieldEquals("Stat", "overall", "tilesMinted", "1");
        assert.fieldEquals(
            "Stat",
            "overall",
            "alchemicaSpendOnTiles",
            "[1, 1, 1, 1]"
        );
        assert.fieldEquals(
            "Stat",
            "overall",
            "alchemicaSpendTotal",
            "[1, 1, 1, 1]"
        );
    });

    test("it should update tilesMinted of user stats", () => {
        assert.fieldEquals(
            "Stat",
            "user-" + mockEvent.transaction.from.toHexString(),
            "tilesMinted",
            "1"
        );
        assert.fieldEquals(
            "Stat",
            "user-" + mockEvent.transaction.from.toHexString(),
            "alchemicaSpendOnTiles",
            "[1, 1, 1, 1]"
        );
        assert.fieldEquals(
            "Stat",
            "user-" + mockEvent.transaction.from.toHexString(),
            "alchemicaSpendTotal",
            "[1, 1, 1, 1]"
        );
    });

    afterAll(() => {
        clearStore();
    });
});
