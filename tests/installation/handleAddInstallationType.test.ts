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
import { AddInstallationType } from "../../generated/InstallationDiamond/InstallationDiamond";
import { BIGINT_ONE, INSTALLATION_DIAMOND } from "../../src/helper/constants";
import { handleAddInstallationType } from "../../src/mappings/installation";

let mockEvent = newMockEvent();
describe("handleAddInstallationType", () => {
    beforeAll(() => {
        // prepare event
        let event = new AddInstallationType(
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
                "_installationId",
                ethereum.Value.fromSignedBigInt(BIGINT_ONE)
            )
        );

        // mock getInstallationType
        let tuple = changetype<ethereum.Tuple>([
            ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
            ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
            ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
            ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
            ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
            ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
            ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
            ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
            ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
            ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
            ethereum.Value.fromBoolean(true),
            ethereum.Value.fromUnsignedBigIntArray([
                BIGINT_ONE,
                BIGINT_ONE,
                BIGINT_ONE,
                BIGINT_ONE,
            ]),
            ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
            ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
            ethereum.Value.fromUnsignedBigIntArray([BIGINT_ONE]),
            ethereum.Value.fromString("A"),
        ]);
        createMockedFunction(
            INSTALLATION_DIAMOND,
            "getInstallationType",
            "getInstallationType(uint256):((uint8,uint8,uint16,uint8,uint8,uint32,uint16,uint8,uint32,uint32,bool,uint256[4],uint256,uint256,uint256[],string))"
        )
            .withArgs([ethereum.Value.fromUnsignedBigInt(BIGINT_ONE)])
            .returns([ethereum.Value.fromTuple(tuple)]);

        handleAddInstallationType(event);
    });

    test("it should create an event entity", () => {
        let id =
            mockEvent.transaction.hash.toHexString() +
            "/" +
            mockEvent.logIndex.toString();
        assert.fieldEquals("AddInstallationTypeEvent", id, "id", id);
        assert.fieldEquals(
            "AddInstallationTypeEvent",
            id,
            "block",
            mockEvent.block.number.toString()
        );
        assert.fieldEquals(
            "AddInstallationTypeEvent",
            id,
            "timestamp",
            mockEvent.block.timestamp.toString()
        );
        assert.fieldEquals(
            "AddInstallationTypeEvent",
            id,
            "transaction",
            mockEvent.transaction.hash.toHexString()
        );
        assert.fieldEquals(
            "AddInstallationTypeEvent",
            id,
            "installationType",
            "1"
        );
    });

    test("it should create InstallationType entity", () => {
        assert.fieldEquals("InstallationType", "1", "width", "1");
        assert.fieldEquals("InstallationType", "1", "installationType", "1");
        assert.fieldEquals("InstallationType", "1", "height", "1");
        assert.fieldEquals("InstallationType", "1", "level", "1");
        assert.fieldEquals("InstallationType", "1", "alchemicaType", "1");
        assert.fieldEquals("InstallationType", "1", "spillRadius", "1");
        assert.fieldEquals("InstallationType", "1", "spillRate", "1");
        assert.fieldEquals("InstallationType", "1", "upgradeQueueBoost", "1");
        assert.fieldEquals("InstallationType", "1", "craftTime", "1");
        assert.fieldEquals("InstallationType", "1", "nextLevelId", "1");
        assert.fieldEquals("InstallationType", "1", "deprecated", "true");
        assert.fieldEquals(
            "InstallationType",
            "1",
            "alchemicaCost",
            "[1, 1, 1, 1]"
        );
        assert.fieldEquals("InstallationType", "1", "harvestRate", "1");
        assert.fieldEquals("InstallationType", "1", "capacity", "1");
        assert.fieldEquals("InstallationType", "1", "prerequisites", "[1]");
        assert.fieldEquals("InstallationType", "1", "amountPrerequisites", "1");
        assert.fieldEquals("InstallationType", "1", "name", "A");
        assert.fieldEquals("InstallationType", "1", "amount", "0");
    });

    afterAll(() => {
        clearStore();
    });
});
