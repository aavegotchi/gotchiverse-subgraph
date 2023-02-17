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
import { ResyncParcel } from "../../generated/RealmDiamond/RealmDiamond";
import {
    BIGINT_EIGHT,
    BIGINT_FIVE,
    BIGINT_FOUR,
    BIGINT_ONE,
    BIGINT_SEVEN,
    BIGINT_SIX,
    BIGINT_THREE,
    BIGINT_TWO,
    REALM_DIAMOND,
} from "../../src/helper/constants";
import { handleResyncParcel } from "../../src/mappings/realm";

let mockEvent = newMockEvent();
let realmId = BIGINT_ONE;
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
                ethereum.Value.fromUnsignedBigInt(realmId)
            )
        );

        // mock getParcelInfo
        let tuple: ethereum.Tuple = changetype<ethereum.Tuple>([
            ethereum.Value.fromString("A"),
            ethereum.Value.fromString("B"),
            ethereum.Value.fromAddress(REALM_DIAMOND),
            ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
            ethereum.Value.fromUnsignedBigInt(BIGINT_TWO),
            ethereum.Value.fromUnsignedBigInt(BIGINT_THREE),
            ethereum.Value.fromUnsignedBigInt(BIGINT_FOUR),
            ethereum.Value.fromUnsignedBigIntArray([
                BIGINT_FIVE,
                BIGINT_SIX,
                BIGINT_SEVEN,
                BIGINT_EIGHT,
            ]),
        ]);
        createMockedFunction(
            REALM_DIAMOND,
            "getParcelInfo",
            "getParcelInfo(uint256):((string,string,address,uint256,uint256,uint256,uint256,uint256[4]))"
        )
            .withArgs([ethereum.Value.fromUnsignedBigInt(realmId)])
            .returns([ethereum.Value.fromTuple(tuple)]);

        handleResyncParcel(event);
    });

    test("it should create and update parcel entity", () => {
        assert.fieldEquals("Parcel", "1", "id", "1");
        assert.fieldEquals("Parcel", "1", "parcelId", "A");
        assert.fieldEquals("Parcel", "1", "tokenId", "1");
        assert.fieldEquals("Parcel", "1", "coordinateX", "1");
        assert.fieldEquals("Parcel", "1", "coordinateY", "2");
        assert.fieldEquals("Parcel", "1", "district", "4");
        assert.fieldEquals("Parcel", "1", "parcelHash", "B");
        assert.fieldEquals("Parcel", "1", "size", "3");
        assert.fieldEquals("Parcel", "1", "fudBoost", "5");
        assert.fieldEquals("Parcel", "1", "fomoBoost", "6");
        assert.fieldEquals("Parcel", "1", "alphaBoost", "7");
        assert.fieldEquals("Parcel", "1", "kekBoost", "8");
    });

    afterAll(() => {
        clearStore();
    });
});
