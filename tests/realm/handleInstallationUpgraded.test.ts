import { BigInt, ethereum, store } from "@graphprotocol/graph-ts";
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
import { InstallationUpgraded } from "../../generated/RealmDiamond/RealmDiamond";
import { Installation } from "../../generated/schema";
import {
    BIGINT_ONE,
    INSTALLATION_DIAMOND,
    REALM_DIAMOND,
} from "../../src/helper/constants";
import { getOrCreateParcel } from "../../src/helper/realm";
import { handleInstallationUpgraded } from "../../src/mappings/realm";

let mockEvent = newMockEvent();
describe("handleInstallationUpgraded", () => {
    beforeAll(() => {
        // prepare event
        let event = new InstallationUpgraded(
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
                "_prevInstallationId",
                ethereum.Value.fromSignedBigInt(BIGINT_ONE)
            )
        );

        event.parameters.push(
            new ethereum.EventParam(
                "_nextInstallationId",
                ethereum.Value.fromSignedBigInt(BigInt.fromI32(2))
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

        // mock getParcelInfo
        let tuple: ethereum.Tuple = changetype<ethereum.Tuple>([
            ethereum.Value.fromString("A"),
            ethereum.Value.fromString("B"),
            ethereum.Value.fromAddress(REALM_DIAMOND),
            ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
            ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
            ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
            ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
            ethereum.Value.fromUnsignedBigIntArray([
                BIGINT_ONE,
                BIGINT_ONE,
                BIGINT_ONE,
                BIGINT_ONE,
            ]),
        ]);
        createMockedFunction(
            REALM_DIAMOND,
            "getParcelInfo",
            "getParcelInfo(uint256):((string,string,address,uint256,uint256,uint256,uint256,uint256[4]))"
        )
            .withArgs([ethereum.Value.fromUnsignedBigInt(BIGINT_ONE)])
            .returns([ethereum.Value.fromTuple(tuple)]);

        // mock getInstallationType
        let tupleInstallation: ethereum.Tuple = changetype<ethereum.Tuple>([
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
            ethereum.Value.fromString("B"),
        ]);
        createMockedFunction(
            INSTALLATION_DIAMOND,
            "getInstallationType",
            "getInstallationType(uint256):((uint8,uint8,uint16,uint8,uint8,uint32,uint16,uint8,uint32,uint32,bool,uint256[4],uint256,uint256,uint256[],string))"
        )
            .withArgs([ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(2))])
            .returns([ethereum.Value.fromTuple(tupleInstallation)]);

        // prepare testdata
        let installation = new Installation("1-1-1-1");
        installation.equipped = true;
        installation.x = BIGINT_ONE;
        installation.y = BIGINT_ONE;
        installation.parcel = "1";
        installation.type = "1";
        installation.owner = mockEvent.transaction.from;
        store.set("Installation", "1-1-1-1", installation);

        let parcel = getOrCreateParcel(BIGINT_ONE);
        let equippedInstallations = parcel.equippedInstallations;
        equippedInstallations.push("1");
        parcel.equippedInstallations = equippedInstallations;
        store.set("Parcel", "1", parcel);

        handleInstallationUpgraded(event);
    });

    test("it should create an event entity", () => {
        let id =
            mockEvent.transaction.hash.toHexString() +
            "/" +
            mockEvent.logIndex.toString();
        assert.fieldEquals("InstallationUpgradedEvent", id, "id", id);
        assert.fieldEquals(
            "InstallationUpgradedEvent",
            id,
            "block",
            mockEvent.block.number.toString()
        );
        assert.fieldEquals(
            "InstallationUpgradedEvent",
            id,
            "timestamp",
            mockEvent.block.timestamp.toString()
        );

        assert.fieldEquals(
            "InstallationUpgradedEvent",
            id,
            "transaction",
            mockEvent.transaction.hash.toHexString()
        );

        assert.fieldEquals(
            "InstallationUpgradedEvent",
            id,
            "prevInstallation",
            "1"
        );
        assert.fieldEquals(
            "InstallationUpgradedEvent",
            id,
            "nextInstallation",
            "2"
        );

        // assert.fieldEquals("UnequipInstallationEvent", id, "realmId", "1");
        assert.fieldEquals("InstallationUpgradedEvent", id, "parcel", "1");

        assert.fieldEquals("InstallationUpgradedEvent", id, "x", "1");
        assert.fieldEquals("InstallationUpgradedEvent", id, "y", "1");
    });

    test("it should replace the prevInstallationId with nextInstallationId from the equippedInstallations", () => {
        assert.fieldEquals("Parcel", "1", "equippedInstallations", "[2]");
    });

    test("it should set equipped attribute of prev installation instance to false", () => {
        assert.fieldEquals("Installation", "1-1-1-1", "id", "1-1-1-1");
        assert.fieldEquals("Installation", "1-1-1-1", "x", "1");
        assert.fieldEquals("Installation", "1-1-1-1", "y", "1");
        assert.fieldEquals("Installation", "1-1-1-1", "type", "1");
        assert.fieldEquals("Installation", "1-1-1-1", "parcel", "1");
        assert.fieldEquals("Installation", "1-1-1-1", "equipped", "false");
        assert.fieldEquals(
            "Installation",
            "1-1-1-1",
            "owner",
            mockEvent.transaction.from.toHexString()
        );
    });

    test("it should set equipped attribute of next installation instance to true", () => {
        assert.fieldEquals("Installation", "2-1-1-1", "id", "2-1-1-1");
        assert.fieldEquals("Installation", "2-1-1-1", "x", "1");
        assert.fieldEquals("Installation", "2-1-1-1", "y", "1");
        assert.fieldEquals("Installation", "2-1-1-1", "type", "2");
        assert.fieldEquals("Installation", "2-1-1-1", "parcel", "1");
        assert.fieldEquals("Installation", "2-1-1-1", "equipped", "true");
        assert.fieldEquals(
            "Installation",
            "1-1-1-1",
            "owner",
            mockEvent.transaction.from.toHexString()
        );
    });

    test("it should updateinstallationsUpgradedTotal attribute of global stats", () => {
        assert.fieldEquals(
            "Stat",
            "overall",
            "installationsUpgradedTotal",
            "1"
        );
    });

    test("it should updateinstallationsUpgradedTotal attribute of user stats", () => {
        assert.fieldEquals(
            "Stat",
            "user-" + mockEvent.transaction.from.toHexString(),
            "installationsUpgradedTotal",
            "1"
        );
    });

    test("it should updateinstallationsUpgradedTotal attribute of parcel stats", () => {
        assert.fieldEquals(
            "Stat",
            "parcel-1",
            "installationsUpgradedTotal",
            "1"
        );
    });

    afterAll(() => {
        clearStore();
    });
});
