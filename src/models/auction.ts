/// Shared bridge-auction parsing, seat navigation, and auction-shape helpers.

import { STRAIN_ORDER, type BidStage, type Call, type Strain, type SuitBid } from './bidding-types';
import { SEATS, type Seat } from './cards';

/// OpeningCallInfo identifies the auction's first contract bid.
///
export interface OpeningBidInfo {
  // Zero-based index of the opening bid in the full auction model.
  index: number;
  // Seat that made the opening bid.
  seat: Seat;
  // First contract bid in the auction.  SuitBid includes notrump bids.
  call: SuitBid;
}

export interface ParsedSuitBid {
  level: number;
  strain: Strain;
}

/// getBidStage derives the current uncontested bidding stage from the real auction.  Opponent
/// non-pass calls currently leave the stage unresolved rather than guessing.
///
export function getBidStage (dealer: Seat, auction: Call[]): BidStage | null {
  if (auctionIsComplete(auction)) {
    return null;
  }
  const opening = getOpeningCallInfo(dealer, auction);
  if (opening === null) {
    return 'opening';
  }
  // Reject competitive auctions until the competitive stages and rule semantics are implemented.
  const openerPartner = getPartnerSeat(opening.seat);
  const openingPartnership = new Set<Seat>([opening.seat, openerPartner]);
  for (let index = opening.index + 1; index < auction.length; index += 1) {
    const call = auction[index];
    const seat = getSeatForCallIndex(dealer, index);
    if (! openingPartnership.has(seat) && call !== 'Pass') {
      return null;
    }
  }
  // Count the opening partnership's non-pass calls to identify whose turn in the sequence is next.
  const nextSeat = getNextSeat(dealer, auction);
  const partnershipCalls = getOpeningPartnershipCalls(dealer, auction, opening.seat);
  if (nextSeat === openerPartner && partnershipCalls.length === 1) {
    return 'responding';
  }
  if (nextSeat === opening.seat && partnershipCalls.length === 2) {
    return 'openerRebid';
  }
  if (nextSeat === openerPartner && partnershipCalls.length === 3) {
    return 'responderRebid';
  }
  return null;
}

/// getNextSeat returns the seat whose turn it is after the calls already in the auction.
///
export function getNextSeat (dealer: Seat, auction: Call[]): Seat {
  return getSeatForCallIndex(dealer, auction.length);
}

export function auctionIsComplete (auction: Call[]): boolean {
  return auction.length >= 4 &&
    auction.slice(-3).every((call) => call === 'Pass');
}

/// getPartnerOpeningCall returns the opening bid only when the opener is the given seat's partner.
///
export function getPartnerOpeningCall (dealer: Seat, auction: Call[], seat: Seat): SuitBid | null {
  const opening = getOpeningCallInfo(dealer, auction);
  if (opening === null || opening.seat !== getPartnerSeat(seat)) {
    return null;
  }
  return opening.call;
}

/// getResponderCall returns opener's partner's first physical call after the opening bid.
///
export function getResponderCall (dealer: Seat, auction: Call[]): Call | null {
  const opening = getOpeningCallInfo(dealer, auction);
  if (opening === null) {
    return null;
  }
  // Find opener's partner's first turn after the opening, ignoring intervening opponent turns.
  const responderSeat = getPartnerSeat(opening.seat);
  for (let index = opening.index + 1; index < auction.length; index += 1) {
    if (getSeatForCallIndex(dealer, index) === responderSeat) {
      return auction[index] ?? null;
    }
  }
  return null;
}

/// getOpeningCallInfo finds the first contract bid and the physical seat that made it.
///
export function getOpeningCallInfo (dealer: Seat, auction: Call[]): OpeningBidInfo | null {
  for (let index = 0; index < auction.length; index += 1) {
    const call = auction[index];
    if (call !== undefined && isContractBid(call)) {
      return { index, seat: getSeatForCallIndex(dealer, index), call };
    }
  }
  return null;
}

/// getOpeningPartnershipCalls returns the opening partnership's non-pass calls in auction order.
///
export function getOpeningPartnershipCalls (dealer: Seat, auction: Call[], openingSeat: Seat): Call[] {
  const partner = getPartnerSeat(openingSeat);
  const calls: Call[] = [];
  for (let index = 0; index < auction.length; index += 1) {
    const seat = getSeatForCallIndex(dealer, index);
    const call = auction[index];
    if ((seat === openingSeat || seat === partner) && call !== undefined && call !== 'Pass') {
      calls.push(call);
    }
  }
  return calls;
}

export function getPartnerSeat (seat: Seat): Seat {
  if (seat === 'N') return 'S';
  if (seat === 'E') return 'W';
  if (seat === 'S') return 'N';
  return 'E';
}

/// getSeatForCallIndex derives the physical bidder from dealer and zero-based auction index.
///
export function getSeatForCallIndex (dealer: Seat, callIndex: number): Seat {
  const dealerIndex = SEATS.indexOf(dealer);
  const seat = SEATS[(dealerIndex + callIndex) % SEATS.length];
  if (seat === undefined) {
    throw new Error(`Cannot derive seat for dealer ${dealer} and call index ${callIndex}.`);
  }
  return seat;
}

/// isContractBid returns whether a call is 1C..7NT and narrows it to SuitBid, which includes NT.
///
export function isContractBid (call: Call): call is SuitBid {
  if (call.length !== 2 && call.length !== 3) {
    return false;
  }
  const levelText = call.substring(0, 1);
  const strainText = call.substring(1);
  const level = Number(levelText);
  if (! Number.isInteger(level) || level < 1 || level > 7) {
    return false;
  }
  return strainText === 'C' || strainText === 'D' || strainText === 'H' || strainText === 'S' ||
         strainText === 'NT';
}

/// parseSuitBid returns the numeric level and strain of a contract bid; other bids return null.
///
export function parseSuitBid (call: Call): ParsedSuitBid | null {
  if (call === 'Pass' || call === 'Double' || call === 'Redouble') {
    return null;
  }
  return {
    level: Number(call.substring(0, 1)),
    strain: getStrainFromSuitBid(call),
  };
}

export function getStrainFromSuitBid (call: SuitBid): Strain {
  return call.substring(1) as Strain;
}

/// responseIsJump reports whether responder skipped a cheaper contract in the same response strain.
///
export function responseIsJump (openingCall: SuitBid, responseCall: SuitBid): boolean {
  const opening = parseSuitBid(openingCall)!;
  const responseStrain = getStrainFromSuitBid(responseCall);
  const cheapest = cheapestBidInStrainAfter(opening, responseStrain);
  return cheapest !== null && Number(responseCall.substring(0, 1)) > Number(cheapest.substring(0, 1));
}

/// openerRebidIsReverse reports whether opener's cheapest rebid in a new suit forces responder
/// above two of opener's first suit to give simple preference.  This returns true based the rebid
/// pushing partner up a level, regardless of opener's points.  Bidding rules decide what strength a
/// reverse promises in the configured system.
///
export function openerRebidIsReverse (opening: ParsedSuitBid, response: ParsedSuitBid,
                                      rebid: ParsedSuitBid): boolean {
  // Verify new suitness
  if (opening.strain === 'NT' || rebid.strain === 'NT' || rebid.strain === opening.strain ||
      rebid.strain === response.strain) {
    return false;
  }
  // A jump in the new suit is not itself a reverse; compare the cheapest legal rebid in that suit.
  const cheapestSecondSuit = cheapestBidInStrainAfter(response, rebid.strain);
  if (cheapestSecondSuit === null) {
    return false;
  }
  const cheapestParsed = parseSuitBid(cheapestSecondSuit)!;
  if (rebid.level !== cheapestParsed.level) {
    return false;
  }
  // A reverse forces responder past the next level of opener's original suit.
  const returnToOpeningSuit = cheapestBidInStrainAfter(rebid, opening.strain);
  if (returnToOpeningSuit === null) {
    return false;
  }
  const returnParsed = parseSuitBid(returnToOpeningSuit)!;
  return returnParsed.level > opening.level + 1;
}

/// cheapestNewSuitBid returns the cheapest legal contract in a different strain after opening.
///
export function cheapestNewSuitBid (opening: ParsedSuitBid, strain: Strain): SuitBid | null {
  if (strain === opening.strain) {
    return null;
  }
  return cheapestBidInStrainAfter(opening, strain);
}

/// cheapestBidInStrainAfter returns the lowest legal contract in strain above the previous bid.
///
export function cheapestBidInStrainAfter (previous: ParsedSuitBid, strain: Strain): SuitBid | null {
  let level = previous.level;
  if (STRAIN_ORDER.indexOf(strain) <= STRAIN_ORDER.indexOf(previous.strain)) {
    level += 1;
  }
  if (level > 7) {
    return null;
  }
  return `${level}${strain}` as SuitBid;
}
