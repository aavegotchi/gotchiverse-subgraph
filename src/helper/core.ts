import { BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { AavegotchiDiamond } from "../../generated/AavegotchiDiamond/AavegotchiDiamond";
import {
    Aavegotchi,
    ClaimedToken,
    GotchiLending,
    Whitelist,
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
        let item = getOrCreateWearable(gotchi.equippedWearables![i]);
        brs = brs.plus(item.)
    }

    return gotchi;
}