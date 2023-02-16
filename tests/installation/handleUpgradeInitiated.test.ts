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
import { UpgradeInitiated } from "../../generated/InstallationDiamond/InstallationDiamond";
import { BIGINT_ONE, INSTALLATION_DIAMOND } from "../../src/helper/constants";
import { handleUpgradeInitiated } from "../../src/mappings/installation";

let mockEvent = newMockEvent();
describe("handleUpgradeInitiated", () => {
    beforeAll(() => {
        // prepare event
        let event = new UpgradeInitiated(
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
                "blockInitiated",
                ethereum.Value.fromSignedBigInt(BIGINT_ONE)
            )
        );

        event.parameters.push(
            new ethereum.EventParam(
                "readyBlock",
                ethereum.Value.fromSignedBigInt(BIGINT_ONE)
            )
        );

        event.parameters.push(
            new ethereum.EventParam(
                "installationId",
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

        handleUpgradeInitiated(event);
    });

    test("it should create an event entity", () => {
        let id =
            mockEvent.transaction.hash.toHexString() +
            "/" +
            mockEvent.logIndex.toString();
        assert.fieldEquals("UpgradeInitiatedEvent", id, "id", id);
        assert.fieldEquals(
            "UpgradeInitiatedEvent",
            id,
            "block",
            mockEvent.block.number.toString()
        );
        assert.fieldEquals(
            "UpgradeInitiatedEvent",
            id,
            "timestamp",
            mockEvent.block.timestamp.toString()
        );
        assert.fieldEquals(
            "UpgradeInitiatedEvent",
            id,
            "transaction",
            mockEvent.transaction.hash.toHexString()
        );
        assert.fieldEquals("UpgradeInitiatedEvent", id, "installation", "1");
        assert.fieldEquals("UpgradeInitiatedEvent", id, "parcel", "1");
        assert.fieldEquals("UpgradeInitiatedEvent", id, "x", "1");
        assert.fieldEquals("UpgradeInitiatedEvent", id, "y", "1");
        assert.fieldEquals("UpgradeInitiatedEvent", id, "blockInitiated", "1");
        assert.fieldEquals("UpgradeInitiatedEvent", id, "readyBlock", "1");
        assert.fieldEquals("UpgradeInitiatedEvent", id, "realmId", "1");
        assert.fieldEquals("UpgradeInitiatedEvent", id, "installationId", "1");
    });

    test("it should update InstallationType entity", () => {
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

    test("it should update installationsUpgradedTotal and alchemicaSpend of overall stats", () => {
        assert.fieldEquals(
            "Stat",
            "overall",
            "installationsUpgradedTotal",
            "1"
        );

        assert.fieldEquals(
            "Stat",
            "overall",
            "alchemicaSpendTotal",
            "[1, 1, 1, 1]"
        );

        assert.fieldEquals(
            "Stat",
            "overall",
            "alchemicaSpendOnUpgrades",
            "[1, 1, 1, 1]"
        );
    });

    test("it should update installationsUpgradedTotal and alchemicaSpend of user stats", () => {
        assert.fieldEquals(
            "Stat",
            "user-" + mockEvent.transaction.from.toHexString(),
            "installationsUpgradedTotal",
            "1"
        );

        assert.fieldEquals(
            "Stat",
            "user-" + mockEvent.transaction.from.toHexString(),
            "alchemicaSpendTotal",
            "[1, 1, 1, 1]"
        );

        assert.fieldEquals(
            "Stat",
            "user-" + mockEvent.transaction.from.toHexString(),
            "alchemicaSpendOnUpgrades",
            "[1, 1, 1, 1]"
        );
    });

    test("it should update installationsUpgradedTotal and alchemicaSpend of parcel stats", () => {
        assert.fieldEquals(
            "Stat",
            "parcel-1",
            "installationsUpgradedTotal",
            "1"
        );

        assert.fieldEquals(
            "Stat",
            "parcel-1",
            "alchemicaSpendTotal",
            "[1, 1, 1, 1]"
        );

        assert.fieldEquals(
            "Stat",
            "parcel-1",
            "alchemicaSpendOnUpgrades",
            "[1, 1, 1, 1]"
        );
    });

    afterAll(() => {
        clearStore();
    });
});
