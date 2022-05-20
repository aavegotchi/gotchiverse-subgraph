import { ChannelAlchemica } from "../../generated/RealmDiamond/RealmDiamond";
import { BIGINT_ONE, BIGINT_ZERO, StatCategory } from "../helper/constants";
import { createChannelAlchemicaEvent, getStats } from "../helper/realm";

export function handleChannelAlchemica(event: ChannelAlchemica): void  {
    // create and persist event
    let eventEntity = createChannelAlchemicaEvent(event); 
    
    // update stats
    let gotchiStats = getStats(StatCategory.GOTCHI, eventEntity.gotchi)
    gotchiStats.countChannelAlchemicaEvents = gotchiStats.countChannelAlchemicaEvents.plus(BIGINT_ONE);
    gotchiStats.save();

    let parcelStats = getStats(StatCategory.PARCEL, eventEntity.parcel)
    parcelStats.countChannelAlchemicaEvents = parcelStats.countChannelAlchemicaEvents.plus(BIGINT_ONE);
    parcelStats.save();

    let overallStats = getStats(StatCategory.OVERALL, BIGINT_ZERO)
    overallStats.countChannelAlchemicaEvents = overallStats.countChannelAlchemicaEvents.plus(BIGINT_ONE);
    overallStats.save();
}