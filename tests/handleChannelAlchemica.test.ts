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
import { ChannelAlchemica } from "../generated/RealmDiamond/RealmDiamond";
import { BIGINT_ONE, REALM_DIAMOND } from "../src/helper/constants";
import { handleChannelAlchemica } from "../src/mappings/realm";

let mockEvent = newMockEvent();
describe("handleChannelAlchemica", () => {
    beforeAll(() => {
        // prepare event
        let event = new ChannelAlchemica(
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
                "_gotchiId",
                ethereum.Value.fromSignedBigInt(BIGINT_ONE)
            )
        );
        event.parameters.push(
            new ethereum.EventParam(
                "_alchemica",
                ethereum.Value.fromSignedBigIntArray([
                    BIGINT_ONE,
                    BIGINT_ONE,
                    BIGINT_ONE,
                    BIGINT_ONE,
                ])
            )
        );
        event.parameters.push(
            new ethereum.EventParam(
                "_spilloverRate",
                ethereum.Value.fromSignedBigInt(BIGINT_ONE)
            )
        );
        event.parameters.push(
            new ethereum.EventParam(
                "_spilloverRadius",
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

        handleChannelAlchemica(event);
    });

    test("it should create an event entity", () => {
        let id =
            mockEvent.transaction.hash.toHexString() +
            "/" +
            mockEvent.logIndex.toString();
        assert.fieldEquals("ChannelAlchemicaEvent", id, "id", id);
        assert.fieldEquals("ChannelAlchemicaEvent", id, "realmId", "1");
        assert.fieldEquals("ChannelAlchemicaEvent", id, "gotchiId", "1");
        assert.fieldEquals("ChannelAlchemicaEvent", id, "gotchi", "1");
        assert.fieldEquals("ChannelAlchemicaEvent", id, "parcel", "1");
        assert.fieldEquals(
            "ChannelAlchemicaEvent",
            id,
            "alchemica",
            "[1, 1, 1, 1]"
        );
        assert.fieldEquals("ChannelAlchemicaEvent", id, "spilloverRate", "1");
        assert.fieldEquals("ChannelAlchemicaEvent", id, "spilloverRadius", "1");

        assert.fieldEquals(
            "ChannelAlchemicaEvent",
            id,
            "block",
            mockEvent.block.number.toString()
        );
        assert.fieldEquals(
            "ChannelAlchemicaEvent",
            id,
            "block",
            mockEvent.block.timestamp.toString()
        );

        assert.fieldEquals(
            "ChannelAlchemicaEvent",
            id,
            "transaction",
            mockEvent.transaction.hash.toHexString()
        );
    });

    test("it should update lastChanneledAlchemica attribute on parcel entity", () => {
        assert.fieldEquals("Parcel", "1", "id", "1");
        assert.fieldEquals(
            "Parcel",
            "1",
            "lastChanneledAlchemica",
            mockEvent.block.timestamp.toString()
        );
    });

    test("it should update lastChanneledAlchemica attribute on gotchi entity", () => {
        assert.fieldEquals("Parcel", "1", "id", "1");
        assert.fieldEquals(
            "Gotchi",
            "1",
            "lastChanneledAlchemica",
            mockEvent.block.timestamp.toString()
        );
    });

    test("it should update countChannelAlchemicaEvents attribute of user stats", () => {
        assert.fieldEquals(
            "Stat",
            "user-" + mockEvent.transaction.from.toHexString(),
            "countChannelAlchemicaEvents",
            "1"
        );
    });

    test("it should update countChannelAlchemicaEvents attribute of parcel stats", () => {
        assert.fieldEquals(
            "Stat",
            "parcel-1",
            "countChannelAlchemicaEvents",
            "1"
        );
    });

    test("it should update countChannelAlchemicaEvents attribute of gotchi stats", () => {
        assert.fieldEquals(
            "Stat",
            "gotchi-1",
            "countChannelAlchemicaEvents",
            "1"
        );
    });

    test("it should update countChannelAlchemicaEvents attribute of global stats", () => {
        assert.fieldEquals(
            "Stat",
            "overall",
            "countChannelAlchemicaEvents",
            "1"
        );
    });

    afterAll(() => {
        clearStore();
    });
});
