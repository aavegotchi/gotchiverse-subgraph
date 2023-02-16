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
import { AlchemicaClaimed } from "../../generated/RealmDiamond/RealmDiamond";
import { BIGINT_ONE, REALM_DIAMOND } from "../../src/helper/constants";
import { handleAlchemicaClaimed } from "../../src/mappings/realm";

let mockEvent = newMockEvent();
describe("handleAlchemicaClaimed", () => {
    beforeAll(() => {
        // prepare event
        let event = new AlchemicaClaimed(
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
                "_alchemicaType",
                ethereum.Value.fromSignedBigInt(BIGINT_ONE)
            )
        );

        event.parameters.push(
            new ethereum.EventParam(
                "_amount",
                ethereum.Value.fromSignedBigInt(BIGINT_ONE)
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

        handleAlchemicaClaimed(event);
    });

    test("it should create an event entity", () => {
        let id =
            mockEvent.transaction.hash.toHexString() +
            "/" +
            mockEvent.logIndex.toString();
        assert.fieldEquals("AlchemicaClaimedEvent", id, "id", id);
        assert.fieldEquals(
            "AlchemicaClaimedEvent",
            id,
            "block",
            mockEvent.block.number.toString()
        );
        assert.fieldEquals(
            "AlchemicaClaimedEvent",
            id,
            "timestamp",
            mockEvent.block.timestamp.toString()
        );

        assert.fieldEquals(
            "AlchemicaClaimedEvent",
            id,
            "transaction",
            mockEvent.transaction.hash.toHexString()
        );

        assert.fieldEquals("AlchemicaClaimedEvent", id, "gotchiId", "1");
        assert.fieldEquals("AlchemicaClaimedEvent", id, "gotchi", "1");

        assert.fieldEquals("AlchemicaClaimedEvent", id, "realmId", "1");
        assert.fieldEquals("AlchemicaClaimedEvent", id, "parcel", "1");

        assert.fieldEquals("AlchemicaClaimedEvent", id, "amount", "1");
        assert.fieldEquals("AlchemicaClaimedEvent", id, "alchemicaType", "1");

        assert.fieldEquals("AlchemicaClaimedEvent", id, "spilloverRadius", "1");
        assert.fieldEquals("AlchemicaClaimedEvent", id, "spilloverRate", "1");
    });

    test("it should update lastClaimedAlchemica attribute of parcel entity", () => {
        assert.fieldEquals(
            "Parcel",
            "1",
            "lastClaimedAlchemica",
            mockEvent.block.timestamp.toString()
        );
    });

    test("it should update alchemicaClaimedTotal attribute of global stats", () => {
        assert.fieldEquals(
            "Stat",
            "overall",
            "alchemicaClaimedTotal",
            "[0, 1, 0, 0]"
        );
    });

    test("it should update alchemicaClaimedTotal attribute of user stats", () => {
        assert.fieldEquals(
            "Stat",
            "user-" + mockEvent.transaction.from.toHexString(),
            "alchemicaClaimedTotal",
            "[0, 1, 0, 0]"
        );
    });

    test("it should update alchemicaClaimedTotal attribute of gotchi stats", () => {
        assert.fieldEquals(
            "Stat",
            "gotchi-1",
            "alchemicaClaimedTotal",
            "[0, 1, 0, 0]"
        );
    });

    test("it should update alchemicaClaimedTotal attribute of parcel stats", () => {
        assert.fieldEquals(
            "Stat",
            "parcel-1",
            "alchemicaClaimedTotal",
            "[0, 1, 0, 0]"
        );
    });

    afterAll(() => {
        clearStore();
    });
});
