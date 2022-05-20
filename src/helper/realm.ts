import { BigInt } from "@graphprotocol/graph-ts";
import { ChannelAlchemica } from "../../generated/RealmDiamond/RealmDiamond";
import { ChannelAlchemicaEvent, Stat } from "../../generated/schema"
import { BIGINT_ZERO, StatCategory, STAT_CATEGORIES } from "./constants";

export const createChannelAlchemicaEvent = (event: ChannelAlchemica): ChannelAlchemicaEvent => {
    let id = event.params._gotchiId.toString() + "-" + event.params._realmId.toString() + "-" + event.block.number.toString();
    let eventEntity = new ChannelAlchemicaEvent(id);
    eventEntity.parcel = event.params._gotchiId;
    eventEntity.gotchi = event.params._realmId;
    eventEntity.block = event.block.number;
    eventEntity.timestamp = event.block.timestamp;
    eventEntity.spilloverRadius = event.params._spilloverRadius;
    eventEntity.spilloverRate = event.params._spilloverRate;
    eventEntity.alchemica = event.params._alchemica;
    eventEntity.save();
    return eventEntity;
}

export const getStat = (category: StatCategory, entityId: BigInt): Stat => {
    let id = STAT_CATEGORIES[category];
    if(id != "overall") {
        id = id  + "-" + entityId.toString();
    }
    
    let stats = Stat.load(id);
    if(!stats) {
        stats = new Stat(id);
        stats.countChannelAlchemicaEvents = BIGINT_ZERO;
    }

    return stats;
}