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
import { handleAddInstallationType } from "../../src/mappings/installation";

let mockEvent = newMockEvent();
let installationId = BIGINT_SEVEN;
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
                ethereum.Value.fromSignedBigInt(installationId)
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
            .withArgs([ethereum.Value.fromUnsignedBigInt(installationId)])
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
            installationId.toString()
        );
    });

    test("it should create InstallationType entity", () => {
        assert.fieldEquals(
            "InstallationType",
            installationId.toString(),
            "width",
            BIGINT_ONE.toString()
        );
        assert.fieldEquals(
            "InstallationType",
            installationId.toString(),
            "installationType",
            BIGINT_THREE.toString()
        );
        assert.fieldEquals(
            "InstallationType",
            installationId.toString(),
            "height",
            BIGINT_TWO.toString()
        );
        assert.fieldEquals(
            "InstallationType",
            installationId.toString(),
            "level",
            BIGINT_FOUR.toString()
        );
        assert.fieldEquals(
            "InstallationType",
            installationId.toString(),
            "alchemicaType",
            BIGINT_FIVE.toString()
        );
        assert.fieldEquals(
            "InstallationType",
            installationId.toString(),
            "spillRadius",
            BIGINT_SIX.toString()
        );
        assert.fieldEquals(
            "InstallationType",
            installationId.toString(),
            "spillRate",
            BIGINT_SEVEN.toString()
        );
        assert.fieldEquals(
            "InstallationType",
            installationId.toString(),
            "upgradeQueueBoost",
            BIGINT_EIGHT.toString()
        );
        assert.fieldEquals(
            "InstallationType",
            installationId.toString(),
            "craftTime",
            BIGINT_NINE.toString()
        );
        assert.fieldEquals(
            "InstallationType",
            installationId.toString(),
            "nextLevelId",
            BIGINT_TEN.toString()
        );
        assert.fieldEquals(
            "InstallationType",
            installationId.toString(),
            "deprecated",
            "true"
        );
        assert.fieldEquals(
            "InstallationType",
            installationId.toString(),
            "alchemicaCost",
            "[1, 2, 3, 4]"
        );
        assert.fieldEquals(
            "InstallationType",
            installationId.toString(),
            "harvestRate",
            BIGINT_ONE.toString()
        );
        assert.fieldEquals(
            "InstallationType",
            installationId.toString(),
            "capacity",
            BIGINT_TWO.toString()
        );
        assert.fieldEquals(
            "InstallationType",
            installationId.toString(),
            "prerequisites",
            "[3]"
        );
        assert.fieldEquals(
            "InstallationType",
            installationId.toString(),
            "amountPrerequisites",
            BIGINT_ONE.toString()
        );
        assert.fieldEquals(
            "InstallationType",
            installationId.toString(),
            "name",
            "A"
        );
        assert.fieldEquals(
            "InstallationType",
            installationId.toString(),
            "amount",
            "0"
        );
    });

    afterAll(() => {
        clearStore();
    });
});
