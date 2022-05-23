import { ChannelAlchemica, EquipInstallation, InstallationUpgraded, UnequipInstallation } from "../../generated/RealmDiamond/RealmDiamond";
import { BIGINT_ONE, BIGINT_ZERO, StatCategory } from "../helper/constants";
import { createChannelAlchemicaEvent, createEquipInstallationEvent, createInstallationUpgradedEvent, createParcelInstallation, createUnequipInstallationEvent, getStat, removeParcelInstallation } from "../helper/realm";

export function handleChannelAlchemica(event: ChannelAlchemica): void  {
    // create and persist event
    let eventEntity = createChannelAlchemicaEvent(event); 
    eventEntity.save();
    
    // update stats
    let gotchiStats = getStat(StatCategory.GOTCHI, eventEntity.gotchi)
    gotchiStats.countChannelAlchemicaEvents = gotchiStats.countChannelAlchemicaEvents.plus(BIGINT_ONE);
    gotchiStats.save();

    let parcelStats = getStat(StatCategory.PARCEL, eventEntity.parcel)
    parcelStats.countChannelAlchemicaEvents = parcelStats.countChannelAlchemicaEvents.plus(BIGINT_ONE);
    parcelStats.save();

    let overallStats = getStat(StatCategory.OVERALL, BIGINT_ZERO)
    overallStats.countChannelAlchemicaEvents = overallStats.countChannelAlchemicaEvents.plus(BIGINT_ONE);
    overallStats.save();
}

export function handleEquipInstallation(event: EquipInstallation): void {
    let eventEntity = createEquipInstallationEvent(event);
    eventEntity.save();

    let installation = createParcelInstallation(event.params._realmId, event.params._installationId);
    installation.save();

    // update stats
    let parcelStats = getStat(StatCategory.PARCEL, eventEntity.realmId)
    parcelStats.countParcelInstallations = parcelStats.countParcelInstallations.plus(BIGINT_ONE);
    parcelStats.save();

    let overallStats = getStat(StatCategory.OVERALL, BIGINT_ZERO)
    overallStats.countParcelInstallations = overallStats.countParcelInstallations.plus(BIGINT_ONE);
    overallStats.save();
}

export function handleUnequipInstallation(event: UnequipInstallation): void {
    let eventEntity = createUnequipInstallationEvent(event);
    eventEntity.save();

    removeParcelInstallation(event.params._realmId, event.params._installationId);

    // update stats
    let parcelStats = getStat(StatCategory.PARCEL, eventEntity.realmId)
    parcelStats.countParcelInstallations = parcelStats.countParcelInstallations.minus(BIGINT_ONE);
    parcelStats.save();

    let overallStats = getStat(StatCategory.OVERALL, BIGINT_ZERO)
    overallStats.countParcelInstallations = overallStats.countParcelInstallations.minus(BIGINT_ONE);
    overallStats.save();
}

export function handleInstallationUpgraded(event: InstallationUpgraded): void {
    let eventEntity = createInstallationUpgradedEvent(event);
    eventEntity.save();

    removeParcelInstallation(event.params._realmId, event.params._prevInstallationId);
    let installation = createParcelInstallation(event.params._realmId, event.params._nextInstallationId);
    installation.save();
}