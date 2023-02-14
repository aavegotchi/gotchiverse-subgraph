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
import { ResyncParcel } from "../generated/RealmDiamond/RealmDiamond";
import { BIGINT_ONE, REALM_DIAMOND } from "../src/helper/constants";
import { handleResyncParcel } from "../src/mappings/realm";

let mockEvent = newMockEvent();
describe("handleResyncParcel", () => {
    beforeAll(() => {
        // prepare event
        let event = new ResyncParcel(
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
                "_tokenId",
                ethereum.Value.fromUnsignedBigInt(BIGINT_ONE)
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

        handleResyncParcel(event);
    });

    test("it should create and update parcel entity", () => {
        assert.fieldEquals("Parcel", "1", "id", "1");
        assert.fieldEquals("Parcel", "1", "parcelId", "A");
        assert.fieldEquals("Parcel", "1", "tokenId", "1");
        assert.fieldEquals("Parcel", "1", "coordinateX", "1");
        assert.fieldEquals("Parcel", "1", "coordinateY", "1");
        assert.fieldEquals("Parcel", "1", "district", "1");
        assert.fieldEquals("Parcel", "1", "parcelHash", "B");
        assert.fieldEquals("Parcel", "1", "size", "1");
        assert.fieldEquals("Parcel", "1", "fudBoost", "1");
        assert.fieldEquals("Parcel", "1", "fomoBoost", "1");
        assert.fieldEquals("Parcel", "1", "alphaBoost", "1");
        assert.fieldEquals("Parcel", "1", "kekBoost", "1");
    });

    afterAll(() => {
        clearStore();
    });
});
