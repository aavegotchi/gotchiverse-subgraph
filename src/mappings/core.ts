import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
    AavegotchiDiamond,
    AavegotchiInteract,
    AddItemType,
    BuyPortals,
    ClaimAavegotchi,
    EquipWearables,
    ExperienceTransfer,
    GotchiLendingAdded,
    GotchiLendingCanceled,
    GotchiLendingClaimed,
    GotchiLendingEnded,
    GotchiLendingExecuted,
    GrantExperience,
    ItemModifiersSet,
    MintPortals,
    PortalOpened,
    RemoveExperience,
    SetAavegotchiName,
    SpendSkillpoints,
    Transfer,
    WhitelistCreated,
    WhitelistUpdated,
    Xingyun,
} from "../../generated/AavegotchiDiamond/AavegotchiDiamond";
import {
    BIGINT_ONE,
    BIGINT_ZERO,
    STATUS_CLAIMED,
    STATUS_PORTAL_CLOSED,
    STATUS_PORTAL_OPENED,
} from "../helper/constants";
import {
    createBuyPortalsEvent,
    createClaimAavegotchiEvent,
    createEquipWearablesEvent,
    createGrantExperienceEvent,
    createOrUpdateWhitelist,
    createSpendSkillpointsEvent,
    createXingyunEvent,
    getOrCreateAavegotchi,
    getOrCreateClaimedToken,
    getOrCreateGotchiLending,
    getOrCreateItemType,
    getOrCreateWhitelist,
} from "../helper/core";

export function handleBuyPortals(event: BuyPortals): void {
    createBuyPortalsEvent(event);

    let gotchi = getOrCreateAavegotchi(event.params._tokenId.toString());
    gotchi.status = STATUS_PORTAL_CLOSED;
    gotchi.save();
}
export function handleXingyun(event: Xingyun): void {
    createXingyunEvent(event);

    let gotchi = getOrCreateAavegotchi(event.params._tokenId.toString());
    gotchi.status = STATUS_PORTAL_CLOSED;
    gotchi.save();
}
export function handlePortalOpened(event: PortalOpened): void {
    let gotchi = getOrCreateAavegotchi(event.params.tokenId.toString());
    gotchi.status = STATUS_PORTAL_OPENED;
    gotchi.save();
}
export function handleClaimAavegotchi(event: ClaimAavegotchi): void {
    createClaimAavegotchiEvent(event);

    let gotchi = getOrCreateAavegotchi(event.params._tokenId.toString());
    let contract = AavegotchiDiamond.bind(event.address);
    let result = contract.try_getAavegotchi(event.params._tokenId);
    if (result.value) {
        gotchi.numericTraits = result.value.numericTraits.map<BigInt>(
            (e: i32) => BigInt.fromI32(e)
        );
        gotchi.brs = result.value.baseRarityScore;
    }
    gotchi.status = STATUS_CLAIMED;
    gotchi.save();
}

export function handleSpendSkillpoints(event: SpendSkillpoints): void {
    createSpendSkillpointsEvent(event);

    let gotchi = getOrCreateAavegotchi(event.params._tokenId.toString());
    if (!gotchi.numericTraits) {
        gotchi.numericTraits = event.params._values.map<BigInt>((e: i32) =>
            BigInt.fromI32(e)
        );
    } else {
        let traits = gotchi.numericTraits;
        for (let i = 0; i < event.params._values.length; i++) {
            if (traits) {
                traits[i] = traits[i].plus(
                    BigInt.fromI32(event.params._values[i])
                );
            }
        }
        gotchi.numericTraits = traits;
    }
    gotchi.save();
}
export function handleEquipWearables(event: EquipWearables): void {
    createEquipWearablesEvent(event);

    let gotchi = getOrCreateAavegotchi(event.params._tokenId.toString());
    gotchi.equippedWearables = event.params._newWearables.map<BigInt>(
        (e: i32) => BigInt.fromI32(e)
    );
    gotchi.save();
}
export function handleGrantExperience(event: GrantExperience): void {
    createGrantExperienceEvent(event);

    for (let i = 0; i < event.params._tokenIds.length; i++) {
        let gotchi = getOrCreateAavegotchi(
            event.params._tokenIds[i].toString()
        );
        gotchi.xp = gotchi.xp.plus(event.params._xpValues[i]);
        gotchi.save();
    }
}

export function handleAavegotchiInteract(event: AavegotchiInteract): void {
    let gotchi = getOrCreateAavegotchi(event.params._tokenId.toString());
    gotchi.kinship = event.params.kinship;
}

export function handleExperienceTransfer(event: ExperienceTransfer): void {
    let fromGotchi = getOrCreateAavegotchi(
        event.params._fromTokenId.toString()
    );
    fromGotchi.xp = fromGotchi.xp.minus(event.params.experience);
    fromGotchi.save();
    let toGotchi = getOrCreateAavegotchi(event.params._toTokenId.toString());
    toGotchi.xp = toGotchi.xp.plus(event.params.experience);
    toGotchi.save();
}

export function handleMintPortals(event: MintPortals): void {
    let gotchi = getOrCreateAavegotchi(event.params._tokenId.toString());
    gotchi.status = STATUS_PORTAL_CLOSED;
    gotchi.save();
}

export function handleRemoveExperience(event: RemoveExperience): void {
    for (let i = 0; i < event.params._tokenIds.length; i++) {
        let gotchi = getOrCreateAavegotchi(
            event.params._tokenIds[i].toString()
        );
        gotchi.xp = gotchi.xp.minus(event.params._xpValues[i]);
        gotchi.save();
    }
}

export function handleTransfer(event: Transfer): void {
    let gotchi = getOrCreateAavegotchi(event.params._tokenId.toString());
    gotchi.owner = event.params._to;
    gotchi.originalOwner = event.params._to;
    gotchi.save();
}

export function handleGotchiLendingAdded(event: GotchiLendingAdded): void {
    let lending = getOrCreateGotchiLending(event.params.listingId);
    lending.upfrontCost = event.params.initialCost;
    lending.rentDuration = event.params.period;
    lending.lender = event.params.lender;
    lending.originalOwner = event.params.originalOwner;
    lending.period = event.params.period;
    lending.splitOwner = BigInt.fromI32(event.params.revenueSplit[0]);
    lending.splitBorrower = BigInt.fromI32(event.params.revenueSplit[1]);
    lending.splitOther = BigInt.fromI32(event.params.revenueSplit[2]);
    lending.tokensToShare = event.params.revenueTokens.map<Bytes>(e => e);
    lending.thirdPartyAddress = event.params.thirdParty;
    lending.timeCreated = event.params.timeCreated;
    lending.cancelled = false;
    lending.completed = false;
    if (event.params.whitelistId != BIGINT_ZERO) {
        let whitelist = getOrCreateWhitelist(event.params.whitelistId, event);
        if (whitelist) {
            lending.whitelist = whitelist.id;
            lending.whitelistMembers = whitelist.members;
            lending.whitelistId = event.params.whitelistId;
        }
    }
    let gotchi = getOrCreateAavegotchi(event.params.tokenId.toString());
    lending.gotchi = gotchi.id;
    lending.gotchiTokenId = event.params.tokenId;
    lending.gotchiKinship = gotchi.kinship;
    lending.gotchiBRS = gotchi.brs;
    lending.save();
}

export function handleGotchiLendingClaimed(event: GotchiLendingClaimed): void {
    let lending = getOrCreateGotchiLending(event.params.listingId);
    for (let i = 0; i < event.params.revenueTokens.length; i++) {
        let ctoken = getOrCreateClaimedToken(
            event.params.revenueTokens[i],
            lending
        );
        ctoken.amount = ctoken.amount.plus(event.params.amounts[i]);
        ctoken.save();
    }
    lending.lastClaimed = event.params.timeClaimed;
    lending.save();
}

export function handleGotchiLendingCanceled(
    event: GotchiLendingCanceled
): void {
    let lending = getOrCreateGotchiLending(event.params.listingId);
    lending.cancelled = true;
    lending.save();
}

export function handleGotchiLendingExecuted(
    event: GotchiLendingExecuted
): void {
    let lending = getOrCreateGotchiLending(event.params.listingId);
    lending.timeAgreed = event.params.timeAgreed;
    lending.save();

    let gotchi = getOrCreateAavegotchi(lending.gotchi);
    gotchi.originalOwner = event.params.lender;
    gotchi.save();
}

export function handleGotchiLendingEnded(event: GotchiLendingEnded): void {
    let lending = getOrCreateGotchiLending(event.params.listingId);
    lending.completed = true;
    lending.timeEnded = event.block.timestamp;
    lending.save();
}

export function handleAddItemType(event: AddItemType): void {
    let item = getOrCreateItemType(event.params._itemType.svgId.toString());
    item.rarityScoreModifier = BigInt.fromI32(
        event.params._itemType.rarityScoreModifier
    );
    item.traitModifiers = event.params._itemType.traitModifiers.map<BigInt>(
        (e: i32) => BigInt.fromI32(e)
    );
    item.name = event.params._itemType.name;
    item.experienceBonus = event.params._itemType.experienceBonus;
    item.save();
}

export function handleSetAavegotchiName(event: SetAavegotchiName): void {
    let gotchi = getOrCreateAavegotchi(event.params._tokenId.toString());
    gotchi.name = event.params._newName;
    gotchi.save();
}

export function handleItemModifiersSet(event: ItemModifiersSet): void {
    let itemType = getOrCreateItemType(event.params._wearableId.toString());
    itemType.traitModifiers = event.params._traitModifiers.map<BigInt>(
        (e: i32) => BigInt.fromI32(e)
    );
    itemType.rarityScoreModifier = BigInt.fromI32(
        event.params._rarityScoreModifier
    );
    itemType.save();
}

export function handleWhitelistCreated(event: WhitelistCreated): void {
    let whitelist = getOrCreateWhitelist(event.params.whitelistId, event);
    if (whitelist) {
        whitelist.save();
    }
}

export function handleWhitelistUpdated(event: WhitelistUpdated): void {
    let whitelist = createOrUpdateWhitelist(event.params.whitelistId, event);
    if (whitelist) {
        whitelist.save();
    }
}
