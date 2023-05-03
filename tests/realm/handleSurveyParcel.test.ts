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
import {
    MintParcel,
    SurveyParcel,
} from "../../generated/RealmDiamond/RealmDiamond";
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
import { handleMintParcel, handleSurveyParcel } from "../../src/mappings/realm";

let mockEvent = newMockEvent();
let realmId = BIGINT_ONE;
let round = BIGINT_TWO;
describe("handleSurveyParcel", () => {
    beforeAll(() => {
        // prepare event
        let event = new SurveyParcel(
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

        event.parameters.push(
            new ethereum.EventParam(
                "_round",
                ethereum.Value.fromUnsignedBigInt(round)
            )
        );

        event.parameters.push(
            new ethereum.EventParam(
                "_alchemicas",
                ethereum.Value.fromUnsignedBigIntArray([
                    BIGINT_TWO,
                    BIGINT_TWO,
                    BIGINT_TWO,
                    BIGINT_TWO,
                ])
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

        handleSurveyParcel(event);
    });

    test("it should has remainingAlchemica field", () => {
        assert.fieldEquals("Parcel", "1", "remainingAlchemica", "[2, 2, 2, 2]");
    });

    afterAll(() => {
        clearStore();
    });
});
