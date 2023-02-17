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
import { Transfer } from "../../generated/RealmDiamond/RealmDiamond";
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
import { handleTransfer } from "../../src/mappings/realm";

let mockEvent = newMockEvent();
let realmId = BIGINT_ONE;
describe("handleTransfer", () => {
    beforeAll(() => {
        // prepare event
        let event = new Transfer(
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
                "_from",
                ethereum.Value.fromAddress(mockEvent.transaction.from)
            )
        );

        event.parameters.push(
            new ethereum.EventParam(
                "_to",
                ethereum.Value.fromAddress(mockEvent.transaction.from)
            )
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

        handleTransfer(event);
    });

    test("it should create an event entity", () => {
        let id =
            mockEvent.transaction.hash.toHexString() +
            "/" +
            mockEvent.logIndex.toString();
        assert.fieldEquals("TransferEvent", id, "id", id);

        assert.fieldEquals(
            "TransferEvent",
            id,
            "block",
            mockEvent.block.number.toString()
        );
        assert.fieldEquals(
            "TransferEvent",
            id,
            "timestamp",
            mockEvent.block.timestamp.toString()
        );

        assert.fieldEquals(
            "TransferEvent",
            id,
            "transaction",
            mockEvent.transaction.hash.toHexString()
        );

        assert.fieldEquals(
            "TransferEvent",
            id,
            "from",
            mockEvent.transaction.from.toHexString()
        );

        assert.fieldEquals(
            "TransferEvent",
            id,
            "to",
            mockEvent.transaction.from.toHexString()
        );

        assert.fieldEquals(
            "TransferEvent",
            id,
            "contract",
            mockEvent.address.toHexString()
        );

        assert.fieldEquals("TransferEvent", id, "tokenId", "1");
    });

    test("it should set owner of parcel entity", () => {
        assert.fieldEquals(
            "Parcel",
            "1",
            "owner",
            mockEvent.transaction.from.toHexString()
        );
    });

    afterAll(() => {
        clearStore();
    });
});
