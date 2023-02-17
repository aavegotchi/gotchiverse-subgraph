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
import { MintInstallations } from "../../generated/InstallationDiamond/InstallationDiamond";
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
import { handleMintInstallations } from "../../src/mappings/installation";

let mockEvent = newMockEvent();
let installationId = BIGINT_SEVEN;
let owner = mockEvent.transaction.from;
let amount = BIGINT_SIX;
describe("handleMintInstallations", () => {
    beforeAll(() => {
        // prepare event
        let event = new MintInstallations(
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
            new ethereum.EventParam("_owner", ethereum.Value.fromAddress(owner))
        );

        event.parameters.push(
            new ethereum.EventParam(
                "_installationId",
                ethereum.Value.fromSignedBigInt(installationId)
            )
        );

        event.parameters.push(
            new ethereum.EventParam(
                "_amount",
                ethereum.Value.fromSignedBigInt(amount)
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

        handleMintInstallations(event);
    });

    test("it should create an event entity", () => {
        let id =
            mockEvent.transaction.hash.toHexString() +
            "/" +
            mockEvent.logIndex.toString();
        assert.fieldEquals("MintInstallationsEvent", id, "id", id);
        assert.fieldEquals(
            "MintInstallationsEvent",
            id,
            "block",
            mockEvent.block.number.toString()
        );
        assert.fieldEquals(
            "MintInstallationsEvent",
            id,
            "timestamp",
            mockEvent.block.timestamp.toString()
        );

        assert.fieldEquals(
            "MintInstallationsEvent",
            id,
            "transaction",
            mockEvent.transaction.hash.toHexString()
        );

        assert.fieldEquals(
            "MintInstallationsEvent",
            id,
            "installationType",
            BIGINT_SEVEN.toString()
        );
        assert.fieldEquals(
            "MintInstallationsEvent",
            id,
            "owner",
            mockEvent.transaction.from.toHexString()
        );
        assert.fieldEquals(
            "MintInstallationsEvent",
            id,
            "amount",
            amount.toString()
        );
    });

    test("it should update InstallationType entity", () => {
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
            "10"
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
            amount.toString()
        );
    });

    test("it should update installationsMintedTotal of overall stats", () => {
        assert.fieldEquals(
            "Stat",
            "overall",
            "installationsMintedTotal",
            amount.toString()
        );
    });

    test("it should update installationsMintedTotal of user stats", () => {
        assert.fieldEquals(
            "Stat",
            "user-" + mockEvent.transaction.from.toHexString(),
            "installationsMintedTotal",
            amount.toString()
        );
    });

    afterAll(() => {
        clearStore();
    });
});
