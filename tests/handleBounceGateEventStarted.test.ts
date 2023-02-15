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
import {
    EventStarted,
    ParcelAccessRightSet,
} from "../generated/RealmDiamond/RealmDiamond";
import { BIGINT_ONE, REALM_DIAMOND } from "../src/helper/constants";
import { handleBounceGateEventStarted } from "../src/mappings/realm";

let mockEvent = newMockEvent();
describe("handleBounceGateEventStarted", () => {
    beforeAll(() => {
        let event = new EventStarted(
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

        let tuple = changetype<ethereum.Tuple>([
            ethereum.Value.fromString("title"),
            ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
            ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
            ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
            ethereum.Value.fromBoolean(true),
            ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ]);

        event.parameters.push(
            new ethereum.EventParam(
                "eventDetails",
                ethereum.Value.fromTuple(tuple)
            )
        );

        handleBounceGateEventStarted(event);
    });

    test("it should store an event entity", () => {
        let id =
            mockEvent.transaction.hash.toHexString() +
            "/" +
            mockEvent.logIndex.toString();

        assert.fieldEquals("BounceGateEventStarted", id, "id", id);

        assert.fieldEquals(
            "BounceGateEventStarted",
            id,
            "block",
            mockEvent.block.number.toString()
        );
        assert.fieldEquals(
            "BounceGateEventStarted",
            id,
            "timestamp",
            mockEvent.block.timestamp.toString()
        );

        assert.fieldEquals(
            "BounceGateEventStarted",
            id,
            "transaction",
            mockEvent.transaction.hash.toHexString()
        );
        assert.fieldEquals("BounceGateEventStarted", id, "_eventId", "1");
        assert.fieldEquals("BounceGateEventStarted", id, "_endTime", "1");
        assert.fieldEquals("BounceGateEventStarted", id, "_equipped", "true");
        assert.fieldEquals(
            "BounceGateEventStarted",
            id,
            "_lastTimeUpdated",
            "1"
        );
        assert.fieldEquals("BounceGateEventStarted", id, "_priority", "1");
        assert.fieldEquals("BounceGateEventStarted", id, "_startTime", "1");
        assert.fieldEquals("BounceGateEventStarted", id, "_title", "title");
    });

    test("it should create a BounceGateEvent entity", () => {
        let id = "1";
        assert.fieldEquals("BounceGateEvent", id, "id", id);
        assert.fieldEquals("BounceGateEvent", id, "cancelled", "false");
        assert.fieldEquals("BounceGateEvent", id, "endTime", "1");
        assert.fieldEquals("BounceGateEvent", id, "equipped", "true");
        assert.fieldEquals("BounceGateEvent", id, "lastTimeUpdated", "1");
        assert.fieldEquals("BounceGateEvent", id, "priority", "1");
        assert.fieldEquals("BounceGateEvent", id, "startTime", "1");
        assert.fieldEquals("BounceGateEvent", id, "title", "title");
        assert.fieldEquals(
            "BounceGateEvent",
            id,
            "creator",
            mockEvent.transaction.from.toHexString()
        );
    });

    afterAll(() => {
        clearStore();
    });
});
