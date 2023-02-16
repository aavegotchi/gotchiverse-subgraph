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
import { UpgradeTimeReduced } from "../../generated/InstallationDiamond/InstallationDiamond";
import { BIGINT_ONE, INSTALLATION_DIAMOND } from "../../src/helper/constants";
import { handleUpgradeTimeReduced } from "../../src/mappings/installation";

let mockEvent = newMockEvent();
describe("handleUpgradeTimeReduced", () => {
    beforeAll(() => {
        // prepare event
        let event = new UpgradeTimeReduced(
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
                "_queueId",
                ethereum.Value.fromSignedBigInt(BIGINT_ONE)
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
                "_blocksReduced",
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
            ethereum.Value.fromBoolean(false),
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

        handleUpgradeTimeReduced(event);
    });

    test("it should create an event entity", () => {
        let id =
            mockEvent.transaction.hash.toHexString() +
            "/" +
            mockEvent.logIndex.toString();
        assert.fieldEquals("UpgradeTimeReducedEvent", id, "id", id);
        assert.fieldEquals(
            "UpgradeTimeReducedEvent",
            id,
            "block",
            mockEvent.block.number.toString()
        );
        assert.fieldEquals(
            "UpgradeTimeReducedEvent",
            id,
            "timestamp",
            mockEvent.block.timestamp.toString()
        );
        assert.fieldEquals(
            "UpgradeTimeReducedEvent",
            id,
            "transaction",
            mockEvent.transaction.hash.toHexString()
        );
        assert.fieldEquals("UpgradeTimeReducedEvent", id, "parcel", "1");
        assert.fieldEquals("UpgradeTimeReducedEvent", id, "x", "1");
        assert.fieldEquals("UpgradeTimeReducedEvent", id, "y", "1");
        assert.fieldEquals("UpgradeTimeReducedEvent", id, "blocksReduced", "1");
        assert.fieldEquals("UpgradeTimeReducedEvent", id, "realmId", "1");
    });

    test("it should update overall stats", () => {
        let gltrSpend = BIGINT_ONE.times(
            BigInt.fromString("1000000000000000000")
        );

        let initGltr = BigInt.fromString("250630180000000000000000000");

        assert.fieldEquals("Stat", "overall", "upgradeTimeReduced", "1");
        assert.fieldEquals(
            "Stat",
            "overall",
            "gltrSpendOnUpgrades",
            gltrSpend.plus(initGltr).toString()
        );
        assert.fieldEquals(
            "Stat",
            "overall",
            "gltrSpendTotal",
            gltrSpend.plus(initGltr).toString()
        );
    });

    test("it should update parcel stats", () => {
        let gltrSpend = BIGINT_ONE.times(
            BigInt.fromString("1000000000000000000")
        );

        let initGltr = BigInt.fromString("250630180000000000000000000");

        assert.fieldEquals("Stat", "parcel-1", "upgradeTimeReduced", "1");
        assert.fieldEquals(
            "Stat",
            "parcel-1",
            "gltrSpendOnUpgrades",
            gltrSpend.plus(initGltr).toString()
        );
        assert.fieldEquals(
            "Stat",
            "parcel-1",
            "gltrSpendTotal",
            gltrSpend.plus(initGltr).toString()
        );
    });

    test("it should update user stats", () => {
        let gltrSpend = BIGINT_ONE.times(
            BigInt.fromString("1000000000000000000")
        );

        let initGltr = BigInt.fromString("250630180000000000000000000");

        assert.fieldEquals(
            "Stat",
            "user-" + mockEvent.transaction.from.toHexString(),
            "upgradeTimeReduced",
            "1"
        );
        assert.fieldEquals(
            "Stat",
            "user-" + mockEvent.transaction.from.toHexString(),
            "gltrSpendOnUpgrades",
            gltrSpend.plus(initGltr).toString()
        );
        assert.fieldEquals(
            "Stat",
            "user-" + mockEvent.transaction.from.toHexString(),
            "gltrSpendTotal",
            gltrSpend.plus(initGltr).toString()
        );
    });

    afterAll(() => {
        clearStore();
    });
});
