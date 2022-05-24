import { ChannelAlchemica, EquipInstallation, InstallationUpgraded, UnequipInstallation } from "../../generated/RealmDiamond/RealmDiamond";
import { BIGINT_ONE, StatCategory } from "../helper/constants";
import { createChannelAlchemicaEvent, createEquipInstallationEvent, createInstallationUpgradedEvent, createParcelInstallation, createUnequipInstallationEvent, getOrCreateGotchi, getOrCreateParcel, removeParcelInstallation } from "../helper/realm";
import { getStat } from "../helper/stats";

export function handleChannelAlchemica(event: ChannelAlchemica): void  {
    // create and persist event
    let eventEntity = createChannelAlchemicaEvent(event); 
    eventEntity.save();

    // update gotchi and parcel entities
    let gotchi = getOrCreateGotchi(event.params._gotchiId);
    gotchi.lastChanneledAlchemica = event.block.timestamp;
    gotchi.save();

    let parcel = getOrCreateParcel(event.params._realmId);
    parcel.lastChanneledAlchemica = event.block.timestamp;
    parcel.save();
    
    // update stats
    let gotchiStats = getStat(StatCategory.GOTCHI, eventEntity.gotchi)
    gotchiStats.countChannelAlchemicaEvents = gotchiStats.countChannelAlchemicaEvents.plus(BIGINT_ONE);
    gotchiStats.save();

    let parcelStats = getStat(StatCategory.PARCEL, eventEntity.parcel)
    parcelStats.countChannelAlchemicaEvents = parcelStats.countChannelAlchemicaEvents.plus(BIGINT_ONE);
    parcelStats.save();

    let overallStats = getStat(StatCategory.OVERALL)
    overallStats.countChannelAlchemicaEvents = overallStats.countChannelAlchemicaEvents.plus(BIGINT_ONE);
    overallStats.save();
}

export function handleEquipInstallation(event: EquipInstallation): void {
    let eventEntity = createEquipInstallationEvent(event);
    eventEntity.save();

    // create if not exist
    let parcel = getOrCreateParcel(event.params._realmId);
    parcel = createParcelInstallation(parcel, event.params._installationId);
    parcel.save();

    // update stats
    let parcelStats = getStat(StatCategory.PARCEL, eventEntity.parcel)
    parcelStats.countParcelInstallations = parcelStats.countParcelInstallations.plus(BIGINT_ONE);
    parcelStats.save();

    let overallStats = getStat(StatCategory.OVERALL)
    overallStats.countParcelInstallations = overallStats.countParcelInstallations.plus(BIGINT_ONE);
    overallStats.save();
}

export function handleUnequipInstallation(event: UnequipInstallation): void {
    let eventEntity = createUnequipInstallationEvent(event);
    eventEntity.save();

    let parcel = getOrCreateParcel(event.params._realmId);
    parcel = removeParcelInstallation(parcel, event.params._installationId);
    parcel.save();

    // update stats
    let parcelStats = getStat(StatCategory.PARCEL, eventEntity.parcel)
    parcelStats.countParcelInstallations = parcelStats.countParcelInstallations.minus(BIGINT_ONE);
    parcelStats.save();

    let overallStats = getStat(StatCategory.OVERALL)
    overallStats.countParcelInstallations = overallStats.countParcelInstallations.minus(BIGINT_ONE);
    overallStats.save();
}

export function handleInstallationUpgraded(event: InstallationUpgraded): void {
    let eventEntity = createInstallationUpgradedEvent(event);
    eventEntity.save();

    let parcel = getOrCreateParcel(event.params._realmId);
    parcel = removeParcelInstallation(parcel, event.params._prevInstallationId);
    parcel = createParcelInstallation(parcel, event.params._nextInstallationId);
    parcel.save();
}