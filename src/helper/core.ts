import { BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import {
    AavegotchiDiamond,
    AavegotchiInteract,
    AddItemType,
    BuyPortals,
    ClaimAavegotchi,
    EquipWearables,
    ExperienceTransfer,
    GrantExperience,
    ItemModifiersSet,
    MintPortals,
    RemoveExperience,
    SpendSkillpoints,
    Transfer,
    WhitelistCreated,
    WhitelistUpdated,
    Xingyun,
} from "../../generated/AavegotchiDiamond/AavegotchiDiamond";
import {
    Aavegotchi,
    AavegotchiInteractEvent,
    AddItemTypeEvent,
    BuyPortalsEvent,
    ClaimAavegotchiEvent,
    ClaimedToken,
    EquipWearablesEvent,
    ExperienceTransferEvent,
    GotchiLending,
    GrantExperienceEvent,
    ItemModifiersSetEvent,
    ItemType,
    MintPortalsEvent,
    RemoveExperienceEvent,
    SpendSkillpointsEvent,
    TransferEvent,
    Whitelist,
    WhitelistCreatedEvent,
    WhitelistUpdatedEvent,
    XingyunEvent,
} from "../../generated/schema";
import { BIGINT_ZERO, ZERO_ADDRESS } from "./constants";

export function createOrUpdateWhitelist(
    id: BigInt,
    event: ethereum.Event
): Whitelist | null {
    let contract = AavegotchiDiamond.bind(event.address);
    let response = contract.try_getWhitelist(id);

    if (response.reverted) {
        return null;
    }

    let result = response.value;

    let members = result.addresses;
    let name = result.name;

    let whitelist = Whitelist.load(id.toString());
    if (!whitelist) {
        whitelist = new Whitelist(id.toString());
        whitelist.owner = result.owner;
        whitelist.name = name;
    }

    whitelist.members = members.map<Bytes>(e => e);

    whitelist.save();
    return whitelist;
}

export function getOrCreateGotchiLending(listingId: BigInt): GotchiLending {
    let lending = GotchiLending.load(listingId.toString());
    if (!lending) {
        lending = new GotchiLending(listingId.toString());
        lending.cancelled = false;
        lending.completed = false;
        lending.whitelist = null;
        lending.whitelistMembers = [];
        lending.whitelistId = null;
    }

    return lending;
}

export function getOrCreateClaimedToken(
    tokenAddress: Bytes,
    lending: GotchiLending
): ClaimedToken {
    let id = lending.id + "_" + tokenAddress.toHexString();
    let ctoken = ClaimedToken.load(id);
    if (ctoken == null) {
        ctoken = new ClaimedToken(id);
        ctoken.amount = BIGINT_ZERO;
        ctoken.lending = lending.id;
        ctoken.token = tokenAddress;
    }

    return ctoken;
}

export function getOrCreateWhitelist(
    whitelistId: BigInt,
    event: ethereum.Event
): Whitelist | null {
    let id = whitelistId.toString();
    let whitelist = Whitelist.load(id);
    if (!whitelist) {
        whitelist = createOrUpdateWhitelist(whitelistId, event);
    }

    return whitelist;
}

export function getOrCreateAavegotchi(id: string): Aavegotchi {
    let gotchi = Aavegotchi.load(id);

    if (gotchi == null) {
        gotchi = new Aavegotchi(id);
        gotchi.tokenId = BigInt.fromString(id);
        gotchi.brs = BIGINT_ZERO;
        gotchi.kinship = BigInt.fromI32(50);
        gotchi.xp = BIGINT_ZERO;
        gotchi.status = BIGINT_ZERO;
        gotchi.owner = ZERO_ADDRESS;
        gotchi.originalOwner = ZERO_ADDRESS;
    }

    return gotchi;
}

export function updateSkillpoints(
    gotchi: Aavegotchi,
    values: Array<BigInt>
): Aavegotchi {
    if (!gotchi.numericTraits) {
        gotchi.numericTraits = values;
        return gotchi;
    }

    let traits = gotchi.numericTraits;
    for (let i = 0; i < values.length; i++) {
        traits[i] = traits[i].plus(values[i]);
    }
    gotchi.numericTraits = traits;
    return gotchi;
}

export function updateBRS(gotchi: Aavegotchi): Aavegotchi {
    let brs = BIGINT_ZERO;
    for (let i = 0; i < gotchi.equippedWearables!.length; i++) {
        let itemId = gotchi.equippedWearables![i];
        if (itemId && itemId != BIGINT_ZERO) {
            let item = getOrCreateItemType(
                gotchi.equippedWearables![i].toString()
            );
            brs = brs.plus(BigInt.fromI32(item.rarityScoreModifier!));
        }
    }

    return gotchi;
}

export function getOrCreateItemType(id: string): ItemType {
    let item = ItemType.load(id);
    if (!item) {
        item = new ItemType(id);
    }

    return item;
}

export function createBuyPortalsEvent(event: BuyPortals): void {
    let id =
        event.params._tokenId.toString() +
        "_" +
        event.params._numAavegotchisToPurchase.toString() +
        "_" +
        event.block.number.toString();
    let eventEntity = new BuyPortalsEvent(id);
    eventEntity.transaction = event.transaction.hash;
    eventEntity.block = event.block.number;
    eventEntity.timestamp = event.block.timestamp;
    eventEntity.contract = event.address;

    eventEntity.from = event.params._from;
    eventEntity.numAavegotchisToPurchase = event.params._numAavegotchisToPurchase.toI32();
    eventEntity.to = event.params._to;
    eventEntity.totalPrice = event.params._totalPrice;
    eventEntity.tokenId = event.params._tokenId;
    eventEntity.save();
}

export function createXingyunEvent(event: Xingyun): void {
    let id =
        event.params._tokenId.toString() +
        "_" +
        event.params._numAavegotchisToPurchase.toString() +
        "_" +
        event.block.number.toString();
    let eventEntity = new XingyunEvent(id);
    eventEntity.transaction = event.transaction.hash;
    eventEntity.block = event.block.number;
    eventEntity.timestamp = event.block.timestamp;
    eventEntity.contract = event.address;

    eventEntity.from = event.params._from;
    eventEntity.numAavegotchisToPurchase = event.params._numAavegotchisToPurchase.toI32();
    eventEntity.to = event.params._to;
    eventEntity.totalPrice = event.params._totalPrice;
    eventEntity.tokenId = event.params._tokenId;
    eventEntity.save();
}

export function createClaimAavegotchiEvent(event: ClaimAavegotchi): void {
    let id =
        event.params._tokenId.toString() + "_" + event.block.number.toString();
    let eventEntity = new ClaimAavegotchiEvent(id);
    eventEntity.transaction = event.transaction.hash;
    eventEntity.block = event.block.number;
    eventEntity.timestamp = event.block.timestamp;
    eventEntity.contract = event.address;

    eventEntity.tokenId = event.params._tokenId;
    eventEntity.save();
}

export function createSpendSkillpointsEvent(event: SpendSkillpoints): void {
    let id =
        event.params._tokenId.toString() + "_" + event.block.number.toString();
    let eventEntity = new SpendSkillpointsEvent(id);
    eventEntity.transaction = event.transaction.hash;
    eventEntity.block = event.block.number;
    eventEntity.timestamp = event.block.timestamp;
    eventEntity.contract = event.address;

    eventEntity.tokenId = event.params._tokenId;
    eventEntity.values = event.params._values;
    eventEntity.save();
}

export function createEquipWearablesEvent(event: EquipWearables): void {
    let id =
        event.params._tokenId.toString() + "_" + event.block.number.toString();

    let eventEntity = new EquipWearablesEvent(id);
    eventEntity.transaction = event.transaction.hash;
    eventEntity.block = event.block.number;
    eventEntity.timestamp = event.block.timestamp;
    eventEntity.contract = event.address;

    eventEntity.tokenId = event.params._tokenId;
    eventEntity.newWearables = event.params._newWearables;
    eventEntity.oldWearables = event.params._oldWearables;
    eventEntity.save();
}

export function createGrantExperienceEvent(event: GrantExperience): void {
    let id =
        event.transaction.hash.toHexString() +
        "_" +
        event.block.number.toString();

    let eventEntity = new GrantExperienceEvent(id);
    eventEntity.transaction = event.transaction.hash;
    eventEntity.block = event.block.number;
    eventEntity.timestamp = event.block.timestamp;
    eventEntity.contract = event.address;

    eventEntity.tokenIds = event.params._tokenIds;
    eventEntity.xpValues = event.params._xpValues;

    eventEntity.save();
}

export function createRemoveExperienceEvent(event: RemoveExperience): void {
    let id =
        event.transaction.hash.toHexString() +
        "_" +
        event.block.number.toString();

    let eventEntity = new RemoveExperienceEvent(id);
    eventEntity.transaction = event.transaction.hash;
    eventEntity.block = event.block.number;
    eventEntity.timestamp = event.block.timestamp;
    eventEntity.contract = event.address;

    eventEntity.tokenIds = event.params._tokenIds;
    eventEntity.xpValues = event.params._xpValues;

    eventEntity.save();
}

export function createAavegotchiInteractEvent(event: AavegotchiInteract): void {
    let id =
        event.params._tokenId.toString() +
        "_" +
        event.params.kinship.toString() +
        "_" +
        event.block.number.toString();

    let eventEntity = new AavegotchiInteractEvent(id);
    eventEntity.transaction = event.transaction.hash;
    eventEntity.block = event.block.number;
    eventEntity.timestamp = event.block.timestamp;
    eventEntity.contract = event.address;

    eventEntity.tokenId = event.params._tokenId;
    eventEntity.kinship = event.params.kinship;

    eventEntity.save();
}

export function createExperienceTransferEvent(event: ExperienceTransfer): void {
    let id =
        event.params._fromTokenId.toString() +
        "_" +
        event.params._toTokenId.toString() +
        "_" +
        event.params.experience.toString() +
        "_" +
        event.block.number.toString();

    let eventEntity = new ExperienceTransferEvent(id);
    eventEntity.transaction = event.transaction.hash;
    eventEntity.block = event.block.number;
    eventEntity.timestamp = event.block.timestamp;
    eventEntity.contract = event.address;

    eventEntity.fromTokenId = event.params._fromTokenId;
    eventEntity.toTokenId = event.params._toTokenId;
    eventEntity.experience = event.params.experience;

    eventEntity.save();
}

export function createMintPortalsEvent(event: MintPortals): void {
    let id =
        event.params._tokenId.toString() +
        "_" +
        event.params._numAavegotchisToPurchase.toString() +
        "_" +
        event.block.number.toString();

    let eventEntity = new MintPortalsEvent(id);
    eventEntity.transaction = event.transaction.hash;
    eventEntity.block = event.block.number;
    eventEntity.timestamp = event.block.timestamp;
    eventEntity.contract = event.address;

    eventEntity.from = event.params._from;
    eventEntity.hauntId = event.params._hauntId;
    eventEntity.numAavegotchisToPurchase =
        event.params._numAavegotchisToPurchase;
    eventEntity.to = event.params._to;
    eventEntity.tokenId = event.params._tokenId;

    eventEntity.save();
}

export const createTransferEvent = (event: Transfer): void => {
    let id =
        event.params._tokenId.toString() + "-" + event.block.number.toString();
    let entity = new TransferEvent(id);
    entity.block = event.block.number;
    entity.timestamp = event.block.timestamp;
    entity.contract = event.address;
    entity.from = event.params._from;
    entity.to = event.params._to;
    entity.tokenId = event.params._tokenId;
    entity.transaction = event.transaction.hash;
    entity.save();
};

export function createWhitelistCreatedEvent(event: WhitelistCreated): void {
    let id =
        event.params.whitelistId.toString() +
        "-" +
        event.block.number.toString();
    let entity = new WhitelistCreatedEvent(id);
    entity.block = event.block.number;
    entity.timestamp = event.block.timestamp;
    entity.contract = event.address;
    entity.transaction = event.transaction.hash;
    entity.whitelistId = event.params.whitelistId;

    entity.save();
}

export function createWhitelistUpdatedEvent(event: WhitelistUpdated): void {
    let id =
        event.params.whitelistId.toString() +
        "-" +
        event.block.number.toString();
    let entity = new WhitelistUpdatedEvent(id);
    entity.block = event.block.number;
    entity.timestamp = event.block.timestamp;
    entity.contract = event.address;
    entity.transaction = event.transaction.hash;
    entity.whitelistId = event.params.whitelistId;

    entity.save();
}

export function createItemModifiersSetEvent(event: ItemModifiersSet): void {
    let id =
        event.params._wearableId.toString() +
        "-" +
        event.block.number.toString();
    let entity = new ItemModifiersSetEvent(id);
    entity.block = event.block.number;
    entity.timestamp = event.block.timestamp;
    entity.contract = event.address;
    entity.transaction = event.transaction.hash;

    entity.rarityScoreModifier = event.params._rarityScoreModifier;
    entity.traitModifiers = event.params._traitModifiers;
    entity.wearableId = event.params._wearableId;

    entity.save();
}

export function createAddItemTypeEvent(event: AddItemType): void {
    let id =
        event.params._itemType.svgId.toString() +
        "-" +
        event.block.number.toString();
    let entity = new AddItemTypeEvent(id);
    entity.block = event.block.number;
    entity.timestamp = event.block.timestamp;
    entity.contract = event.address;
    entity.transaction = event.transaction.hash;

    entity.itemType = event.params._itemType.svgId.toString();

    entity.save();
}
