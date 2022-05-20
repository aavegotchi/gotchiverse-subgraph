import { BigInt, ethereum } from "@graphprotocol/graph-ts"
import { ChannelAlchemica } from "../../generated/RealmDiamond/RealmDiamond";
import { ChannelAlchemicaEvent } from "../../generated/schema"

export const getOrCreateChannelAlchemica = (event: ChannelAlchemica): ChannelAlchemicaEvent => {
    let id = event.params._gotchiId.toString() + "-" + event.params._realmId.toString() + "-" + event.block.number.toString();
    let eventEntity = ChannelAlchemicaEvent.load(id);
    if(!eventEntity) {
        eventEntity = new ChannelAlchemicaEvent(id);
        eventEntity.parcel = event.params._gotchiId;
        eventEntity.gotchi = event.params._realmId;
        eventEntity.block = event.block.number;
        eventEntity.timestamp = event.block.timestamp;
        eventEntity.alchemica = new Array();
    }

    return eventEntity;
}