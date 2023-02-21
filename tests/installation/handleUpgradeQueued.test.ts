import { BigInt, ethereum } from "@graphprotocol/graph-ts";
import {
    afterAll,
    assert,
    beforeAll,
    clearStore,
    describe,
    newMockEvent,
    test,
} from "matchstick-as";
import { UpgradeQueued } from "../../generated/InstallationDiamond/InstallationDiamond";
import { BIGINT_ONE } from "../../src/helper/constants";
import { handleUpgradeQueued } from "../../src/mappings/installation";

let mockEvent = newMockEvent();
describe("handleUpgradeQueued", () => {
    beforeAll(() => {
        // prepare event
        let event = new UpgradeQueued(
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
                "_realmId",
                ethereum.Value.fromSignedBigInt(BIGINT_ONE)
            )
        );

        event.parameters.push(
            new ethereum.EventParam(
                "_queueIndex",
                ethereum.Value.fromSignedBigInt(BIGINT_ONE)
            )
        );

        handleUpgradeQueued(event);
    });

    test("it should create an event entity", () => {
        let id =
            mockEvent.transaction.hash.toHexString() +
            "/" +
            mockEvent.logIndex.toString();
        assert.fieldEquals("UpgradeQueuedEvent", id, "id", id);
        assert.fieldEquals(
            "UpgradeQueuedEvent",
            id,
            "block",
            mockEvent.block.number.toString()
        );
        assert.fieldEquals(
            "UpgradeQueuedEvent",
            id,
            "timestamp",
            mockEvent.block.timestamp.toString()
        );
        assert.fieldEquals(
            "UpgradeQueuedEvent",
            id,
            "transaction",
            mockEvent.transaction.hash.toHexString()
        );
        assert.fieldEquals(
            "UpgradeQueuedEvent",
            id,
            "realmId",
            BIGINT_ONE.toString()
        );
        assert.fieldEquals(
            "UpgradeQueuedEvent",
            id,
            "owner",
            mockEvent.transaction.from.toHexString()
        );
        assert.fieldEquals(
            "UpgradeQueuedEvent",
            id,
            "queueIndex",
            BIGINT_ONE.toString()
        );
        assert.fieldEquals(
            "UpgradeQueuedEvent",
            id,
            "parcel",
            BIGINT_ONE.toString()
        );
    });

    afterAll(() => {
        clearStore();
    });
});
