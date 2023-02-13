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
import { ExitAlchemica } from "../generated/RealmDiamond/RealmDiamond";
import { BIGINT_ONE } from "../src/helper/constants";
import { handleExitAlchemica } from "../src/mappings/realm";

let mockEvent = newMockEvent();
describe("handleExitAlchemica", () => {
    beforeAll(() => {
        // prepare event
        let event = new ExitAlchemica(
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

        handleExitAlchemica(event);
    });

    test("it should create an event entity", () => {
        let id =
            mockEvent.transaction.hash.toHexString() +
            "/" +
            mockEvent.logIndex.toString();
        assert.fieldEquals("ExitAlchemicaEvent", id, "id", id);
        assert.fieldEquals("ExitAlchemicaEvent", id, "gotchiId", "1");
        assert.fieldEquals("ExitAlchemicaEvent", id, "gotchi", "1");
        assert.fieldEquals(
            "ExitAlchemicaEvent",
            id,
            "alchemica",
            "[1, 1, 1, 1]"
        );

        assert.fieldEquals(
            "ExitAlchemicaEvent",
            id,
            "block",
            mockEvent.block.number.toString()
        );
        assert.fieldEquals(
            "ExitAlchemicaEvent",
            id,
            "timestamp",
            mockEvent.block.timestamp.toString()
        );

        assert.fieldEquals(
            "ExitAlchemicaEvent",
            id,
            "transaction",
            mockEvent.transaction.hash.toHexString()
        );
    });

    test("it should update alchemicaExitedTotal attribute of user stats", () => {
        assert.fieldEquals(
            "Stat",
            "user-" + mockEvent.transaction.from.toHexString(),
            "alchemicaExitedTotal",
            "[1, 1, 1, 1]"
        );
    });

    test("it should update alchemicaExitedTotal attribute of gotchi stats", () => {
        assert.fieldEquals(
            "Stat",
            "gotchi-1",
            "alchemicaExitedTotal",
            "[1, 1, 1, 1]"
        );
    });

    test("it should update alchemicaExitedTotal attribute of global stats", () => {
        assert.fieldEquals(
            "Stat",
            "overall",
            "alchemicaExitedTotal",
            "[1, 1, 1, 1]"
        );
    });

    afterAll(() => {
        clearStore();
    });
});
