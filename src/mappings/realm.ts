import { ChannelAlchemica } from "../../generated/RealmDiamond/RealmDiamond";
import { getOrCreateChannelAlchemica } from "../helper/realm";

export function handleChannelAlchemica(event: ChannelAlchemica): void  {
    let entity = getOrCreateChannelAlchemica(event);
    entity.spilloverRadius = event.params._spilloverRadius;
    entity.spilloverRate = event.params._spilloverRate;
    entity.alchemica = event.params._alchemica;
}