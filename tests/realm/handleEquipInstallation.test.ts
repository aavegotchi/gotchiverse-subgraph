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
import { EquipInstallation } from "../../generated/RealmDiamond/RealmDiamond";
import { BIGINT_ONE, REALM_DIAMOND } from "../../src/helper/constants";
import { handleEquipInstallation } from "../../src/mappings/realm";

let mockEvent = newMockEvent();
describe("handleEquipInstallation", () => {
    beforeAll(() => {
        // prepare event
        let event = new EquipInstallation(
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
                "_installationId",
                ethereum.Value.fromSignedBigInt(BIGINT_ONE)
            )
        );

        event.parameters.push(
            new ethereum.EventParam(
                "_x",
                ethereum.Value.fromSignedBigInt(BIGINT_ONE)
            )
        );

        event.parameters.push(
            new ethereum.EventParam(
                "_y",
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

        handleEquipInstallation(event);
    });

    test("it should create an event entity", () => {
        let id =
            mockEvent.transaction.hash.toHexString() +
            "/" +
            mockEvent.logIndex.toString();
        assert.fieldEquals("EquipInstallationEvent", id, "id", id);
        assert.fieldEquals(
            "EquipInstallationEvent",
            id,
            "block",
            mockEvent.block.number.toString()
        );
        assert.fieldEquals(
            "EquipInstallationEvent",
            id,
            "timestamp",
            mockEvent.block.timestamp.toString()
        );

        assert.fieldEquals(
            "EquipInstallationEvent",
            id,
            "transaction",
            mockEvent.transaction.hash.toHexString()
        );

        assert.fieldEquals("EquipInstallationEvent", id, "installation", "1");
        assert.fieldEquals("EquipInstallationEvent", id, "installationId", "1");

        assert.fieldEquals("EquipInstallationEvent", id, "realmId", "1");
        assert.fieldEquals("EquipInstallationEvent", id, "parcel", "1");

        assert.fieldEquals("EquipInstallationEvent", id, "x", "1");
        assert.fieldEquals("EquipInstallationEvent", id, "y", "1");
    });

    test("it should add the installationId to the equippedInstallations array of parcel entity", () => {
        assert.fieldEquals("Parcel", "1", "equippedInstallations", "[1]");
    });

    test("it should create entity of equipped installation instance", () => {
        assert.fieldEquals("Installation", "1-1-1-1", "id", "1-1-1-1");
        assert.fieldEquals("Installation", "1-1-1-1", "x", "1");
        assert.fieldEquals("Installation", "1-1-1-1", "y", "1");
        assert.fieldEquals("Installation", "1-1-1-1", "type", "1");
        assert.fieldEquals("Installation", "1-1-1-1", "parcel", "1");
        assert.fieldEquals("Installation", "1-1-1-1", "equipped", "true");
        assert.fieldEquals(
            "Installation",
            "1-1-1-1",
            "owner",
            mockEvent.transaction.from.toHexString()
        );
    });

    test("it should update equippend installations attributes of global stats", () => {
        assert.fieldEquals("Stat", "overall", "countParcelInstallations", "1");
        assert.fieldEquals(
            "Stat",
            "overall",
            "installationsEquippedCurrent",
            "1"
        );
        assert.fieldEquals(
            "Stat",
            "overall",
            "installationsEquippedTotal",
            "1"
        );
    });

    test("it should update equippend installations attributes of user stats", () => {
        assert.fieldEquals(
            "Stat",
            "user-" + mockEvent.transaction.from.toHexString(),
            "countParcelInstallations",
            "1"
        );

        assert.fieldEquals(
            "Stat",
            "user-" + mockEvent.transaction.from.toHexString(),
            "installationsEquippedCurrent",
            "1"
        );

        assert.fieldEquals(
            "Stat",
            "user-" + mockEvent.transaction.from.toHexString(),
            "installationsEquippedTotal",
            "1"
        );
    });

    test("it should update equippend installations attributes of parcel stats", () => {
        assert.fieldEquals("Stat", "parcel-1", "countParcelInstallations", "1");
        assert.fieldEquals(
            "Stat",
            "parcel-1",
            "installationsEquippedCurrent",
            "1"
        );
        assert.fieldEquals(
            "Stat",
            "parcel-1",
            "installationsEquippedTotal",
            "1"
        );
    });

    afterAll(() => {
        clearStore();
    });
});
