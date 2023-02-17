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
import { MintTile } from "../../generated/TileDiamond/TileDiamond";
import { BIGINT_ONE, TILE_DIAMOND } from "../../src/helper/constants";
import { handleMintTile } from "../../src/mappings/tile";

let mockEvent = newMockEvent();
describe("handleMintTile", () => {
    beforeAll(() => {
        // prepare event
        let event = new MintTile(
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
                "_tileType",
                ethereum.Value.fromSignedBigInt(BIGINT_ONE)
            )
        );

        event.parameters.push(
            new ethereum.EventParam(
                "_tileId",
                ethereum.Value.fromSignedBigInt(BIGINT_ONE)
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

        handleMintTile(event);
    });

    test("it should create an event entity", () => {
        let id =
            "1-" +
            mockEvent.transaction.from.toHexString() +
            "-" +
            mockEvent.transaction.hash.toHexString();
        assert.fieldEquals("MintTileEvent", id, "id", id);
        assert.fieldEquals(
            "MintTileEvent",
            id,
            "block",
            mockEvent.block.number.toString()
        );
        assert.fieldEquals(
            "MintTileEvent",
            id,
            "timestamp",
            mockEvent.block.timestamp.toString()
        );

        assert.fieldEquals(
            "MintTileEvent",
            id,
            "transaction",
            mockEvent.transaction.hash.toHexString()
        );

        assert.fieldEquals("MintTileEvent", id, "tile", "1");
        assert.fieldEquals(
            "MintTileEvent",
            id,
            "owner",
            mockEvent.transaction.from.toHexString()
        );
        assert.fieldEquals("MintTileEvent", id, "quantity", "1");
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
