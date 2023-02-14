import { ethereum, store } from "@graphprotocol/graph-ts";
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
import { UnequipInstallation } from "../generated/RealmDiamond/RealmDiamond";
import { Installation } from "../generated/schema";
import { BIGINT_ONE, REALM_DIAMOND } from "../src/helper/constants";
import { getOrCreateParcel } from "../src/helper/realm";
import { handleUnequipInstallation } from "../src/mappings/realm";

let mockEvent = newMockEvent();
describe("handleUnequipInstallation", () => {
    beforeAll(() => {
        // prepare event
        let event = new UnequipInstallation(
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

        handleUnequipInstallation(event);
    });

    test("it should create an event entity", () => {
        let id =
            mockEvent.transaction.hash.toHexString() +
            "/" +
            mockEvent.logIndex.toString();
        assert.fieldEquals("UnequipInstallationEvent", id, "id", id);
        assert.fieldEquals(
            "UnequipInstallationEvent",
            id,
            "block",
            mockEvent.block.number.toString()
        );
        assert.fieldEquals(
            "UnequipInstallationEvent",
            id,
            "timestamp",
            mockEvent.block.timestamp.toString()
        );

        assert.fieldEquals(
            "UnequipInstallationEvent",
            id,
            "transaction",
            mockEvent.transaction.hash.toHexString()
        );

        assert.fieldEquals("UnequipInstallationEvent", id, "installation", "1");
        assert.fieldEquals(
            "UnequipInstallationEvent",
            id,
            "installationId",
            "1"
        );

        assert.fieldEquals("UnequipInstallationEvent", id, "realmId", "1");
        assert.fieldEquals("UnequipInstallationEvent", id, "parcel", "1");

        assert.fieldEquals("UnequipInstallationEvent", id, "x", "1");
        assert.fieldEquals("UnequipInstallationEvent", id, "y", "1");
    });

    test("it should remove the installationId from the equippedInstallations array of parcel entity", () => {
        assert.fieldEquals("Parcel", "1", "equippedInstallations", "[]");
    });

    test("it should set equipped attribute of installation instance to false", () => {
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

    test("it should update equippend installations attributes of global stats", () => {
        assert.fieldEquals("Stat", "overall", "countParcelInstallations", "-1");
        assert.fieldEquals(
            "Stat",
            "overall",
            "installationsEquippedCurrent",
            "-1"
        );
        assert.fieldEquals(
            "Stat",
            "overall",
            "installationsEquippedTotal",
            "0"
        );
    });

    test("it should update equippend installations attributes of user stats", () => {
        assert.fieldEquals(
            "Stat",
            "user-" + mockEvent.transaction.from.toHexString(),
            "countParcelInstallations",
            "-1"
        );

        assert.fieldEquals(
            "Stat",
            "user-" + mockEvent.transaction.from.toHexString(),
            "installationsEquippedCurrent",
            "-1"
        );

        assert.fieldEquals(
            "Stat",
            "user-" + mockEvent.transaction.from.toHexString(),
            "installationsEquippedTotal",
            "0"
        );
    });

    test("it should update equippend installations attributes of parcel stats", () => {
        assert.fieldEquals(
            "Stat",
            "parcel-1",
            "countParcelInstallations",
            "-1"
        );
        assert.fieldEquals(
            "Stat",
            "parcel-1",
            "installationsEquippedCurrent",
            "-1"
        );
        assert.fieldEquals(
            "Stat",
            "parcel-1",
            "installationsEquippedTotal",
            "0"
        );
    });

    afterAll(() => {
        clearStore();
    });
});
