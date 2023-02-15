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
import { EventCancelled } from "../generated/RealmDiamond/RealmDiamond";
import { BIGINT_ONE } from "../src/helper/constants";
import { handleBounceGateEventCancelled } from "../src/mappings/realm";

let mockEvent = newMockEvent();
describe("handleBounceGateEventCancelled", () => {
    beforeAll(() => {
        let event = new EventCancelled(
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

        handleBounceGateEventCancelled(event);
    });

    test("it should store an event entity", () => {
        let id =
            mockEvent.transaction.hash.toHexString() +
            "/" +
            mockEvent.logIndex.toString();

        assert.fieldEquals("BounceGateEventCancelled", id, "id", id);

        assert.fieldEquals(
            "BounceGateEventCancelled",
            id,
            "block",
            mockEvent.block.number.toString()
        );
        assert.fieldEquals(
            "BounceGateEventCancelled",
            id,
            "timestamp",
            mockEvent.block.timestamp.toString()
        );

        assert.fieldEquals(
            "BounceGateEventCancelled",
            id,
            "transaction",
            mockEvent.transaction.hash.toHexString()
        );
        assert.fieldEquals("BounceGateEventCancelled", id, "_eventId", "1");
    });

    test("it should set BounceGateEvent entity to cancelled with endTime and lastTimeUpdated", () => {
        let id = "1";
        assert.fieldEquals("BounceGateEvent", id, "id", id);
        assert.fieldEquals("BounceGateEvent", id, "cancelled", "true");
        assert.fieldEquals(
            "BounceGateEvent",
            id,
            "endTime",
            mockEvent.block.timestamp.toString()
        );
        assert.fieldEquals(
            "BounceGateEvent",
            id,
            "lastTimeUpdated",
            mockEvent.block.timestamp.toString()
        );
    });

    afterAll(() => {
        clearStore();
    });
});
