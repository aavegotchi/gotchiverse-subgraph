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
    BIGINT_NINE,
    BIGINT_ONE,
    BIGINT_SEVEN,
    BIGINT_SIX,
    BIGINT_TEN,
    BIGINT_THREE,
    BIGINT_TWO,
    INSTALLATION_DIAMOND,
} from "../../src/helper/constants";
import { handleCraftTimeReduced } from "../../src/mappings/installation";

let mockEvent = newMockEvent();
let queueId = BIGINT_EIGHT;
let blocksReduced = BIGINT_FIVE;
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
                ethereum.Value.fromSignedBigInt(queueId)
            )
        );

        event.parameters.push(
            new ethereum.EventParam(
                "_blocksReduced",
                ethereum.Value.fromSignedBigInt(blocksReduced)
            )
        );

        // mock getInstallationType
        let tuple = changetype<ethereum.Tuple>([
            ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
            ethereum.Value.fromUnsignedBigInt(BIGINT_TWO),
            ethereum.Value.fromUnsignedBigInt(BIGINT_THREE),
            ethereum.Value.fromUnsignedBigInt(BIGINT_FOUR),
            ethereum.Value.fromUnsignedBigInt(BIGINT_FIVE),
            ethereum.Value.fromUnsignedBigInt(BIGINT_SIX),
            ethereum.Value.fromUnsignedBigInt(BIGINT_SEVEN),
            ethereum.Value.fromUnsignedBigInt(BIGINT_EIGHT),
            ethereum.Value.fromUnsignedBigInt(BIGINT_NINE),
            ethereum.Value.fromUnsignedBigInt(BIGINT_TEN),
            ethereum.Value.fromBoolean(true),
            ethereum.Value.fromUnsignedBigIntArray([
                BIGINT_ONE,
                BIGINT_TWO,
                BIGINT_THREE,
                BIGINT_FOUR,
            ]),
            ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
            ethereum.Value.fromUnsignedBigInt(BIGINT_TWO),
            ethereum.Value.fromUnsignedBigIntArray([BIGINT_THREE]),
            ethereum.Value.fromString("A"),
        ]);
        createMockedFunction(
            INSTALLATION_DIAMOND,
            "getInstallationType",
            "getInstallationType(uint256):((uint8,uint8,uint16,uint8,uint8,uint32,uint16,uint8,uint32,uint32,bool,uint256[4],uint256,uint256,uint256[],string))"
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
        assert.fieldEquals(
            "CraftTimeReducedEvent",
            id,
            "blocksReduced",
            blocksReduced.toString()
        );
    });

    test("it should update overall stats", () => {
        let gltrSpend = blocksReduced.times(
            BigInt.fromString("1000000000000000000")
        );

        let initGltr = BigInt.fromString("250630180000000000000000000");

        assert.fieldEquals(
            "Stat",
            "overall",
            "craftTimeReduced",
            BIGINT_FIVE.toString()
        );
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
        let gltrSpend = blocksReduced.times(
            BigInt.fromString("1000000000000000000")
        );

        let initGltr = BigInt.fromString("250630180000000000000000000");

        assert.fieldEquals(
            "Stat",
            "user-" + mockEvent.transaction.from.toHexString(),
            "craftTimeReduced",
            BIGINT_FIVE.toString()
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
