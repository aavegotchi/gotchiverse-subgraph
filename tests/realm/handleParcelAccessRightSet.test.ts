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
import { ParcelAccessRightSet } from "../../generated/RealmDiamond/RealmDiamond";
import { BIGINT_ONE, REALM_DIAMOND } from "../../src/helper/constants";
import { handleParcelAccessRightSet } from "../../src/mappings/realm";

let event: ParcelAccessRightSet;
describe("handleParcelAccessRightSet", () => {
    beforeAll(() => {
        let mockEvent = newMockEvent();
        event = new ParcelAccessRightSet(
            mockEvent.address,
            mockEvent.logIndex,
            mockEvent.transactionLogIndex,
            mockEvent.logType,
            mockEvent.block,
            mockEvent.transaction,
            mockEvent.parameters,
            null
        );

        event.parameters = new Array();

        event.parameters.push(
            new ethereum.EventParam(
                "_realmId",
                ethereum.Value.fromSignedBigInt(BIGINT_ONE)
            )
        );
        event.parameters.push(
            new ethereum.EventParam(
                "_actionRight",
                ethereum.Value.fromSignedBigInt(BIGINT_ONE)
            )
        );
        event.parameters.push(
            new ethereum.EventParam(
                "_accessright",
                ethereum.Value.fromSignedBigInt(BigInt.fromI32(2))
            )
        );

        // mock getParcelInfo

        let tuple = changetype<ethereum.Tuple>([
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

        handleParcelAccessRightSet(event);
    });

    test("it should store an event entity with id of transaction hash and logIndex", () => {
        let id =
            event.transaction.hash.toHexString() +
            "/" +
            event.logIndex.toString();
        assert.fieldEquals("ParcelAccessRightSetEvent", id, "realmId", "1");
        assert.fieldEquals("ParcelAccessRightSetEvent", id, "actionRight", "1");
        assert.fieldEquals("ParcelAccessRightSetEvent", id, "accessRight", "2");
    });

    test("it should create an entity with id of realm id and action right", () => {
        let id = "1-1";
        assert.fieldEquals("ParcelAccessRight", id, "parcel", "1");
        assert.fieldEquals("ParcelAccessRight", id, "actionRight", "1");
        assert.fieldEquals("ParcelAccessRight", id, "accessRight", "2");
    });

    afterAll(() => {
        clearStore();
    });
});
