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
        assert.fieldEquals(
            "UpgradeInitiatedEvent",
            id,
            "installation",
            BIGINT_ONE.toString()
        );
        assert.fieldEquals(
            "UpgradeInitiatedEvent",
            id,
            "parcel",
            BIGINT_ONE.toString()
        );
        assert.fieldEquals(
            "UpgradeInitiatedEvent",
            id,
            "x",
            BIGINT_ONE.toString()
        );
        assert.fieldEquals(
            "UpgradeInitiatedEvent",
            id,
            "y",
            BIGINT_ONE.toString()
        );
        assert.fieldEquals(
            "UpgradeInitiatedEvent",
            id,
            "blockInitiated",
            BIGINT_ONE.toString()
        );
        assert.fieldEquals(
            "UpgradeInitiatedEvent",
            id,
            "readyBlock",
            BIGINT_ONE.toString()
        );
        assert.fieldEquals(
            "UpgradeInitiatedEvent",
            id,
            "realmId",
            BIGINT_ONE.toString()
        );
        assert.fieldEquals(
            "UpgradeInitiatedEvent",
            id,
            "installationId",
            BIGINT_ONE.toString()
        );
    });

    test("it should update InstallationType entity", () => {
        assert.fieldEquals(
            "InstallationType",
            BIGINT_ONE.toString(),
            "width",
            BIGINT_ONE.toString()
        );
        assert.fieldEquals(
            "InstallationType",
            BIGINT_ONE.toString(),
            "installationType",
            BIGINT_THREE.toString()
        );
        assert.fieldEquals(
            "InstallationType",
            BIGINT_ONE.toString(),
            "height",
            BIGINT_TWO.toString()
        );
        assert.fieldEquals(
            "InstallationType",
            BIGINT_ONE.toString(),
            "level",
            BIGINT_FOUR.toString()
        );
        assert.fieldEquals(
            "InstallationType",
            BIGINT_ONE.toString(),
            "alchemicaType",
            BIGINT_FIVE.toString()
        );
        assert.fieldEquals(
            "InstallationType",
            BIGINT_ONE.toString(),
            "spillRadius",
            BIGINT_SIX.toString()
        );
        assert.fieldEquals(
            "InstallationType",
            BIGINT_ONE.toString(),
            "spillRate",
            BIGINT_SEVEN.toString()
        );
        assert.fieldEquals(
            "InstallationType",
            BIGINT_ONE.toString(),
            "upgradeQueueBoost",
            BIGINT_EIGHT.toString()
        );
        assert.fieldEquals(
            "InstallationType",
            BIGINT_ONE.toString(),
            "craftTime",
            BIGINT_NINE.toString()
        );
        assert.fieldEquals(
            "InstallationType",
            BIGINT_ONE.toString(),
            "nextLevelId",
            BIGINT_TEN.toString()
        );
        assert.fieldEquals(
            "InstallationType",
            BIGINT_ONE.toString(),
            "deprecated",
            "true"
        );
        assert.fieldEquals(
            "InstallationType",
            BIGINT_ONE.toString(),
            "alchemicaCost",
            "[1, 2, 3, 4]"
        );
        assert.fieldEquals(
            "InstallationType",
            BIGINT_ONE.toString(),
            "harvestRate",
            BIGINT_ONE.toString()
        );
        assert.fieldEquals(
            "InstallationType",
            BIGINT_ONE.toString(),
            "capacity",
            BIGINT_TWO.toString()
        );
        assert.fieldEquals(
            "InstallationType",
            BIGINT_ONE.toString(),
            "prerequisites",
            "[3]"
        );
        assert.fieldEquals(
            "InstallationType",
            BIGINT_ONE.toString(),
            "amountPrerequisites",
            BIGINT_ONE.toString()
        );
        assert.fieldEquals(
            "InstallationType",
            BIGINT_ONE.toString(),
            "name",
            "A"
        );
        assert.fieldEquals(
            "InstallationType",
            BIGINT_ONE.toString(),
            "amount",
            "0"
        );
    });

    test("it should update installationsUpgradedTotal and alchemicaSpend of overall stats", () => {
        assert.fieldEquals(
            "Stat",
            "overall",
            "installationsUpgradedTotal",
            BIGINT_ONE.toString()
        );

        assert.fieldEquals(
            "Stat",
            "overall",
            "alchemicaSpendTotal",
            "[1, 2, 3, 4]"
        );

        assert.fieldEquals(
            "Stat",
            "overall",
            "alchemicaSpendOnUpgrades",
            "[1, 2, 3, 4]"
        );
    });

    test("it should update installationsUpgradedTotal and alchemicaSpend of user stats", () => {
        assert.fieldEquals(
            "Stat",
            "user-" + mockEvent.transaction.from.toHexString(),
            "installationsUpgradedTotal",
            BIGINT_ONE.toString()
        );

        assert.fieldEquals(
            "Stat",
            "user-" + mockEvent.transaction.from.toHexString(),
            "alchemicaSpendTotal",
            "[1, 2, 3, 4]"
        );

        assert.fieldEquals(
            "Stat",
            "user-" + mockEvent.transaction.from.toHexString(),
            "alchemicaSpendOnUpgrades",
            "[1, 2, 3, 4]"
        );
    });

    test("it should update installationsUpgradedTotal and alchemicaSpend of parcel stats", () => {
        assert.fieldEquals(
            "Stat",
            "parcel-1",
            "installationsUpgradedTotal",
            BIGINT_ONE.toString()
        );

        assert.fieldEquals(
            "Stat",
            "parcel-1",
            "alchemicaSpendTotal",
            "[1, 2, 3, 4]"
        );

        assert.fieldEquals(
            "Stat",
            "parcel-1",
            "alchemicaSpendOnUpgrades",
            "[1, 2, 3, 4]"
        );
    });

    afterAll(() => {
        clearStore();
    });
});
