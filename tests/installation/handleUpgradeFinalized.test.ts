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
import { UpgradeFinalized } from "../../generated/InstallationDiamond/InstallationDiamond";
import { BIGINT_ONE, INSTALLATION_DIAMOND } from "../../src/helper/constants";
import { handleUpgradeFinalized } from "../../src/mappings/installation";

let mockEvent = newMockEvent();
describe("handleUpgradeFinalized", () => {
    beforeAll(() => {
        // prepare event
        let event = new UpgradeFinalized(
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
                "_realmId",
                ethereum.Value.fromSignedBigInt(BIGINT_ONE)
            )
        );

        event.parameters.push(
            new ethereum.EventParam(
                "_coordinateX",
                ethereum.Value.fromSignedBigInt(BIGINT_ONE)
            )
        );

        event.parameters.push(
            new ethereum.EventParam(
                "_coordinateY",
                ethereum.Value.fromSignedBigInt(BIGINT_ONE)
            )
        );

        event.parameters.push(
            new ethereum.EventParam(
                "_newInstallationId",
                ethereum.Value.fromSignedBigInt(BIGINT_ONE)
            )
        );

        handleUpgradeFinalized(event);
    });

    test("it should create an event entity", () => {
        let id =
            mockEvent.transaction.hash.toHexString() +
            "/" +
            mockEvent.logIndex.toString();
        assert.fieldEquals("UpgradeFinalizedEvent", id, "id", id);
        assert.fieldEquals(
            "UpgradeFinalizedEvent",
            id,
            "block",
            mockEvent.block.number.toString()
        );
        assert.fieldEquals(
            "UpgradeFinalizedEvent",
            id,
            "timestamp",
            mockEvent.block.timestamp.toString()
        );
        assert.fieldEquals(
            "UpgradeFinalizedEvent",
            id,
            "transaction",
            mockEvent.transaction.hash.toHexString()
        );
        assert.fieldEquals("UpgradeFinalizedEvent", id, "parcel", "1");
        assert.fieldEquals("UpgradeFinalizedEvent", id, "x", "1");
        assert.fieldEquals("UpgradeFinalizedEvent", id, "y", "1");
        assert.fieldEquals("UpgradeFinalizedEvent", id, "installation", "1");
    });

    afterAll(() => {
        clearStore();
    });
});
