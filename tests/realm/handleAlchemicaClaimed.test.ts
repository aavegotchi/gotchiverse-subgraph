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
import {
    BIGINT_EIGHT,
    BIGINT_FIVE,
    BIGINT_FOUR,
    BIGINT_NINE,
    BIGINT_ONE,
    BIGINT_SEVEN,
    BIGINT_SIX,
    BIGINT_TEN,
    BIGINT_THREE,
    BIGINT_TWO,
    REALM_DIAMOND,
} from "../../src/helper/constants";
import { handleAlchemicaClaimed } from "../../src/mappings/realm";

let mockEvent = newMockEvent();
let gotchiId = BIGINT_SIX;
let realmId = BIGINT_FOUR;
let alchemicaType = BIGINT_TWO;
let amount = BIGINT_TEN;
let spilloverRate = BIGINT_SEVEN;
let spilloverRadius = BIGINT_NINE;
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
                ethereum.Value.fromSignedBigInt(realmId)
            )
        );

        event.parameters.push(
            new ethereum.EventParam(
                "_gotchiId",
                ethereum.Value.fromSignedBigInt(gotchiId)
            )
        );

        event.parameters.push(
            new ethereum.EventParam(
                "_alchemicaType",
                ethereum.Value.fromSignedBigInt(alchemicaType)
            )
        );

        event.parameters.push(
            new ethereum.EventParam(
                "_amount",
                ethereum.Value.fromSignedBigInt(amount)
            )
        );

        event.parameters.push(
            new ethereum.EventParam(
                "_spilloverRate",
                ethereum.Value.fromSignedBigInt(spilloverRate)
            )
        );

        event.parameters.push(
            new ethereum.EventParam(
                "_spilloverRadius",
                ethereum.Value.fromSignedBigInt(spilloverRadius)
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

        assert.fieldEquals(
            "AlchemicaClaimedEvent",
            id,
            "gotchiId",
            gotchiId.toString()
        );
        assert.fieldEquals(
            "AlchemicaClaimedEvent",
            id,
            "gotchi",
            gotchiId.toString()
        );

        assert.fieldEquals(
            "AlchemicaClaimedEvent",
            id,
            "realmId",
            realmId.toString()
        );
        assert.fieldEquals(
            "AlchemicaClaimedEvent",
            id,
            "parcel",
            realmId.toString()
        );

        assert.fieldEquals(
            "AlchemicaClaimedEvent",
            id,
            "amount",
            amount.toString()
        );
        assert.fieldEquals(
            "AlchemicaClaimedEvent",
            id,
            "alchemicaType",
            alchemicaType.toString()
        );

        assert.fieldEquals(
            "AlchemicaClaimedEvent",
            id,
            "spilloverRadius",
            spilloverRadius.toString()
        );
        assert.fieldEquals(
            "AlchemicaClaimedEvent",
            id,
            "spilloverRate",
            spilloverRate.toString()
        );
    });

    test("it should update lastClaimedAlchemica attribute of parcel entity", () => {
        assert.fieldEquals(
            "Parcel",
            realmId.toString(),
            "lastClaimedAlchemica",
            mockEvent.block.timestamp.toString()
        );
    });

    test("it should update alchemicaClaimedTotal attribute of global stats", () => {
        assert.fieldEquals(
            "Stat",
            "overall",
            "alchemicaClaimedTotal",
            "[0, 0, 10, 0]"
        );
    });

    test("it should update alchemicaClaimedTotal attribute of user stats", () => {
        assert.fieldEquals(
            "Stat",
            "user-" + mockEvent.transaction.from.toHexString(),
            "alchemicaClaimedTotal",
            "[0, 0, 10, 0]"
        );
    });

    test("it should update alchemicaClaimedTotal attribute of gotchi stats", () => {
        assert.fieldEquals(
            "Stat",
            "gotchi-" + gotchiId.toString(),
            "alchemicaClaimedTotal",
            "[0, 0, 10, 0]"
        );
    });

    test("it should update alchemicaClaimedTotal attribute of parcel stats", () => {
        assert.fieldEquals(
            "Stat",
            "parcel-" + realmId.toString(),
            "alchemicaClaimedTotal",
            "[0, 0, 10, 0]"
        );
    });

    afterAll(() => {
        clearStore();
    });
});
