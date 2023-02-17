import { BigInt, ethereum } from "@graphprotocol/graph-ts";
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
import { CraftTimeReduced } from "../../generated/InstallationDiamond/InstallationDiamond";
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
import { handleCraftTimeReduced } from "../../src/mappings/tile";

let mockEvent = newMockEvent();
describe("handleCraftTimeReduced", () => {
    beforeAll(() => {
        // prepare event
        let event = new CraftTimeReduced(
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
                "_queueId",
                ethereum.Value.fromSignedBigInt(BIGINT_ONE)
            )
        );

        event.parameters.push(
            new ethereum.EventParam(
                "_blocksReduced",
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

        handleCraftTimeReduced(event);
    });

    test("it should create an event entity", () => {
        let id =
            mockEvent.transaction.hash.toHexString() +
            "/" +
            mockEvent.logIndex.toString();
        assert.fieldEquals("CraftTimeReducedEvent", id, "id", id);
        assert.fieldEquals(
            "CraftTimeReducedEvent",
            id,
            "block",
            mockEvent.block.number.toString()
        );
        assert.fieldEquals(
            "CraftTimeReducedEvent",
            id,
            "timestamp",
            mockEvent.block.timestamp.toString()
        );
        assert.fieldEquals(
            "CraftTimeReducedEvent",
            id,
            "transaction",
            mockEvent.transaction.hash.toHexString()
        );
        assert.fieldEquals("CraftTimeReducedEvent", id, "blocksReduced", "1");
    });

    test("it should update overall stats", () => {
        let gltrSpend = BIGINT_ONE.times(
            BigInt.fromString("1000000000000000000")
        );

        let initGltr = BigInt.fromString("250630180000000000000000000");

        assert.fieldEquals("Stat", "overall", "craftTimeReduced", "1");
        assert.fieldEquals(
            "Stat",
            "overall",
            "gltrSpendOnCrafts",
            gltrSpend.toString()
        );
        assert.fieldEquals(
            "Stat",
            "overall",
            "gltrSpendTotal",
            gltrSpend.plus(initGltr).toString()
        );
    });

    test("it should update user stats", () => {
        let gltrSpend = BIGINT_ONE.times(
            BigInt.fromString("1000000000000000000")
        );

        let initGltr = BigInt.fromString("250630180000000000000000000");

        assert.fieldEquals(
            "Stat",
            "user-" + mockEvent.transaction.from.toHexString(),
            "craftTimeReduced",
            "1"
        );
        assert.fieldEquals(
            "Stat",
            "user-" + mockEvent.transaction.from.toHexString(),
            "gltrSpendOnCrafts",
            gltrSpend.toString()
        );
        assert.fieldEquals(
            "Stat",
            "user-" + mockEvent.transaction.from.toHexString(),
            "gltrSpendTotal",
            gltrSpend.plus(initGltr).toString()
        );
    });

    afterAll(() => {
        clearStore();
    });
});
