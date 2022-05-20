import { ChannelAlchemica } from "../../generated/RealmDiamond/RealmDiamond";
import { createChannelAlchemicaEvent } from "../helper/realm";

export function handleChannelAlchemica(event: ChannelAlchemica): void  {
    createChannelAlchemicaEvent(event);   
}