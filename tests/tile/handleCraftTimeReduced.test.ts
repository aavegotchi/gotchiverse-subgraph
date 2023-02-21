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
import { BIGINT_TEN, BIGINT_THREE } from "../../src/helper/constants";
import { handleCraftTimeReduced } from "../../src/mappings/tile";

let mockEvent = newMockEvent();
let queueId = BIGINT_THREE;
let blocksReduced = BIGINT_TEN;
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
            blocksReduced.toString()
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
            blocksReduced.toString()
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
