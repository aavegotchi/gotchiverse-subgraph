import { ethereum } from "@graphprotocol/graph-ts";
import {
    afterAll,
    assert,
    beforeAll,
    clearStore,
    describe,
    newMockEvent,
    test,
} from "matchstick-as";
import { NFTDisplayStatusUpdated } from "../generated/RealmDiamond/RealmDiamond";
import { BIGINT_ONE, REALM_DIAMOND } from "../src/helper/constants";
import { handleNFTDisplayStatusUpdated } from "../src/mappings/realm";

let mockEvent = newMockEvent();
describe("handleNFTDisplayStatusUpdated", () => {
    beforeAll(() => {
        // prepare event
        let event = new NFTDisplayStatusUpdated(
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
                "_token",
                ethereum.Value.fromAddress(REALM_DIAMOND)
            )
        );

        event.parameters.push(
            new ethereum.EventParam(
                "_chainId",
                ethereum.Value.fromUnsignedBigInt(BIGINT_ONE)
            )
        );

        event.parameters.push(
            new ethereum.EventParam(
                "_allowed",
                ethereum.Value.fromBoolean(true)
            )
        );

        handleNFTDisplayStatusUpdated(event);
    });

    test("it should store an event entity", () => {
        let id =
            mockEvent.transaction.hash.toHexString() +
            "/" +
            mockEvent.logIndex.toString();

        assert.fieldEquals("NFTDisplayStatusUpdatedEvent", id, "id", id);
        assert.fieldEquals(
            "NFTDisplayStatusUpdatedEvent",
            id,
            "block",
            mockEvent.block.number.toString()
        );
        assert.fieldEquals(
            "NFTDisplayStatusUpdatedEvent",
            id,
            "timestamp",
            mockEvent.block.timestamp.toString()
        );

        assert.fieldEquals(
            "NFTDisplayStatusUpdatedEvent",
            id,
            "transaction",
            mockEvent.transaction.hash.toHexString()
        );

        assert.fieldEquals(
            "NFTDisplayStatusUpdatedEvent",
            id,
            "contract",
            mockEvent.address.toHexString()
        );
        assert.fieldEquals(
            "NFTDisplayStatusUpdatedEvent",
            id,
            "token",
            REALM_DIAMOND.toHexString()
        );
        assert.fieldEquals("NFTDisplayStatusUpdatedEvent", id, "chainId", "1");
        assert.fieldEquals(
            "NFTDisplayStatusUpdatedEvent",
            id,
            "allowed",
            "true"
        );
    });

    test("it should create and update NFTDisplayStatus entity", () => {
        assert.fieldEquals("NFTDisplayStatus", "0-1", "id", "0-1");
        assert.fieldEquals("NFTDisplayStatus", "0-1", "chainId", "1");
        assert.fieldEquals(
            "NFTDisplayStatus",
            "0-1",
            "contractAddress",
            REALM_DIAMOND.toHexString()
        );
        assert.fieldEquals("NFTDisplayStatus", "0-1", "contractId", "0");
        assert.fieldEquals("NFTDisplayStatus", "0-1", "allowed", "true");
    });

    afterAll(() => {
        clearStore();
    });
});
