import { ethereum } from "@graphprotocol/graph-ts";
import {
    afterAll,
    assert,
    beforeAll,
    clearStore,
    describe,
    newMockEvent,
    test,
} from "matchstick-as";
import { EventPriorityAndDurationUpdated } from "../../generated/RealmDiamond/RealmDiamond";
import { BIGINT_ONE } from "../../src/helper/constants";
import { handleBounceGateEventPriorityAndDurationUpdated } from "../../src/mappings/realm";

let mockEvent = newMockEvent();
describe("handleBounceGateEventPriorityAndDurationUpdated", () => {
    beforeAll(() => {
        let event = new EventPriorityAndDurationUpdated(
            mockEvent.address,
            mockEvent.logIndex,
            mockEvent.transactionLogIndex,
            mockEvent.logType,
            mockEvent.block,
            mockEvent.transaction,
            mockEvent.parameters,
            null
        );

        event.parameters = new Array();

        event.parameters.push(
            new ethereum.EventParam(
                "_eventId",
                ethereum.Value.fromSignedBigInt(BIGINT_ONE)
            )
        );

        event.parameters.push(
            new ethereum.EventParam(
                "_newPriority",
                ethereum.Value.fromSignedBigInt(BIGINT_ONE)
            )
        );

        event.parameters.push(
            new ethereum.EventParam(
                "_newEndTime",
                ethereum.Value.fromSignedBigInt(BIGINT_ONE)
            )
        );

        handleBounceGateEventPriorityAndDurationUpdated(event);
    });

    test("it should store an event entity", () => {
        let id =
            mockEvent.transaction.hash.toHexString() +
            "/" +
            mockEvent.logIndex.toString();

        assert.fieldEquals(
            "BounceGateEventPriorityAndDurationUpdated",
            id,
            "id",
            id
        );

        assert.fieldEquals(
            "BounceGateEventPriorityAndDurationUpdated",
            id,
            "block",
            mockEvent.block.number.toString()
        );
        assert.fieldEquals(
            "BounceGateEventPriorityAndDurationUpdated",
            id,
            "timestamp",
            mockEvent.block.timestamp.toString()
        );

        assert.fieldEquals(
            "BounceGateEventPriorityAndDurationUpdated",
            id,
            "transaction",
            mockEvent.transaction.hash.toHexString()
        );
        assert.fieldEquals(
            "BounceGateEventPriorityAndDurationUpdated",
            id,
            "_eventId",
            "1"
        );
        assert.fieldEquals(
            "BounceGateEventPriorityAndDurationUpdated",
            id,
            "_newEndTime",
            "1"
        );
        assert.fieldEquals(
            "BounceGateEventPriorityAndDurationUpdated",
            id,
            "_newPriority",
            "1"
        );
    });

    test("it should update the BounceGateEvent entity", () => {
        let id = "1";
        assert.fieldEquals("BounceGateEvent", id, "id", id);
        assert.fieldEquals("BounceGateEvent", id, "cancelled", "false");
        assert.fieldEquals("BounceGateEvent", id, "endTime", "1");
        assert.fieldEquals(
            "BounceGateEvent",
            id,
            "lastTimeUpdated",
            mockEvent.block.timestamp.toString()
        );
        assert.fieldEquals("BounceGateEvent", id, "priority", "1");
    });

    afterAll(() => {
        clearStore();
    });
});
