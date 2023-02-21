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
let tileId = BIGINT_SEVEN;
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
                "_tileId",
                ethereum.Value.fromSignedBigInt(tileId)
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
            .withArgs([ethereum.Value.fromUnsignedBigInt(tileId)])
            .returns([ethereum.Value.fromTuple(tuple)]);

        handleMintTiles(event);
    });

    test("it should create an event entity", () => {
        let id =
            "7-1-" +
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

        assert.fieldEquals("MintTilesEvent", id, "tile", tileId.toString());
        assert.fieldEquals(
            "MintTilesEvent",
            id,
            "owner",
            mockEvent.transaction.from.toHexString()
        );
        assert.fieldEquals("MintTilesEvent", id, "amount", "1");
    });

    test("it should update TileType entity", () => {
        assert.fieldEquals("TileType", tileId.toString(), "width", "1");
        assert.fieldEquals("TileType", tileId.toString(), "tileType", "3");
        assert.fieldEquals("TileType", tileId.toString(), "height", "2");
        assert.fieldEquals("TileType", tileId.toString(), "craftTime", "4");
        assert.fieldEquals("TileType", tileId.toString(), "deprecated", "true");
        assert.fieldEquals("TileType", tileId.toString(), "deprecatedAt", "0");
        assert.fieldEquals(
            "TileType",
            tileId.toString(),
            "alchemicaCost",
            "[5, 6, 7, 8]"
        );
        assert.fieldEquals("TileType", tileId.toString(), "name", "A");
        assert.fieldEquals("TileType", tileId.toString(), "amount", "1");
    });

    test("it should update tilesMinted of overall stats", () => {
        assert.fieldEquals("Stat", "overall", "tilesMinted", "1");
        assert.fieldEquals(
            "Stat",
            "overall",
            "alchemicaSpendOnTiles",
            "[5, 6, 7, 8]"
        );
        assert.fieldEquals(
            "Stat",
            "overall",
            "alchemicaSpendTotal",
            "[5, 6, 7, 8]"
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
            "[5, 6, 7, 8]"
        );
        assert.fieldEquals(
            "Stat",
            "user-" + mockEvent.transaction.from.toHexString(),
            "alchemicaSpendTotal",
            "[5, 6, 7, 8]"
        );
    });

    afterAll(() => {
        clearStore();
    });
});
