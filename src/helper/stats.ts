import { Stat } from "../../generated/schema";
import { BIGINT_ZERO, StatCategory, STAT_CATEGORIES } from "./constants";

export const getStat = (category: StatCategory, entityId: string = "0"): Stat => {
    let id = STAT_CATEGORIES[category];
    if(category != StatCategory.OVERALL) {
        id = id  + "-" + entityId.toString();
    }
    
    let stats = Stat.load(id);
    if(!stats) {
        stats = new Stat(id);
        stats.countChannelAlchemicaEvents = BIGINT_ZERO;
        stats.countParcelInstallations = BIGINT_ZERO;
        stats.countInstallationTypes = BIGINT_ZERO;

        let emptyAlchemicaWallet = [BIGINT_ZERO, BIGINT_ZERO, BIGINT_ZERO, BIGINT_ZERO];
        stats.spendAlchemicaOnUpgrades = emptyAlchemicaWallet;
        stats.spendAlchemicaTotal = emptyAlchemicaWallet;
    }

    return stats;
}