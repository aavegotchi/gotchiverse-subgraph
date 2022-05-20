import { ChannelAlchemica } from "../../generated/RealmDiamond/RealmDiamond";
import { ChannelAlchemicaEvent } from "../../generated/schema"

export const createChannelAlchemicaEvent = (event: ChannelAlchemica): void => {
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
}