/// Shared bridge-auction parsing, seat navigation, and auction-shape helpers.

import { STRAIN_ORDER, type BidStage, type Call, type DirectInterference, type Strain, type SuitBid } from './bidding-types';
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

/// PartnerOneNtSuitInterference identifies a natural two-level suit bid over partner's natural 1NT.
/// opponentOpening is present when partner's 1NT was an overcall rather than an opening bid.
export interface PartnerOneNtSuitInterference {
  interference: ParsedSuitBid;
  opponentOpening: ParsedSuitBid | null;
}

/// getBidStage identifies bidding roles from seats and the physical auction.  Unsupported later
/// competitive continuations return null without preventing the user from entering further calls.
///
export function getBidStage (dealer: Seat, auction: Call[]): BidStage | null {
  if (auctionIsComplete(auction)) {
    return null;
  }
  const opening = getOpeningCallInfo(dealer, auction);
  if (opening === null) {
    return 'opening';
  }
  const nextSeat = getNextSeat(dealer, auction);
  const responder = getPartnerSeat(opening.seat);
  const overcaller = getSeatForCallIndex(dealer, opening.index + 1);
  const advancer = getPartnerSeat(overcaller);
  const overcallIndex = opening.index + 1;
  const overcall = auction[overcallIndex];
  if (nextSeat === overcaller && auction.length === overcallIndex) {
    return 'overcalling';
  }
  if (nextSeat === responder && auction.length === opening.index + 2) {
    return 'responding';
  }
  if (nextSeat === advancer && auction.length === opening.index + 3 &&
      overcall !== undefined && (isContractBid(overcall) || overcall === 'Double')) {
    return 'advancing';
  }
  // The overcaller acts again after opener, overcaller, responder, advancer, and opener have each
  // had their next physical turn.  Only selected overcaller-rebid meanings are modeled so far.
  if (nextSeat === overcaller && auction.length === opening.index + 5 &&
      overcall !== undefined && (isContractBid(overcall) || overcall === 'Double')) {
    return 'overcallerRebid';
  }
  // Later opener/responder continuation meanings after competition remain unreviewed.
  // Recognize Double as intervention here, without treating it as a penalty-double decision.
  const opponentsBid = auction.some((call, index) =>
    index > opening.index && (isContractBid(call) || call === 'Double') &&
    getSeatForCallIndex(dealer, index) !== opening.seat &&
    getSeatForCallIndex(dealer, index) !== responder);
  if (opponentsBid) {
    return null;
  }
  const partnershipCalls = getOpeningPartnershipCalls(dealer, auction, opening.seat);
  if (nextSeat === opening.seat && partnershipCalls.length === 2) {
    return 'openerRebid';
  }
  if (nextSeat === responder && partnershipCalls.length === 3) {
    return 'responderRebid';
  }
  return null;
}

/// getPartnerOneNtSuitInterference recognizes the two supported natural-interference contexts:
/// responder after partner opens 1NT, and advancer after partner directly overcalls 1NT.
/// This first treatment stops at natural two-level suit interference.
///
export function getPartnerOneNtSuitInterference (dealer: Seat, auction: Call[]):
    PartnerOneNtSuitInterference | null {
  const openingInfo = getOpeningCallInfo(dealer, auction);
  if (openingInfo === null) {
    return null;
  }
  const stage = getBidStage(dealer, auction);
  if (stage === 'responding' && openingInfo.call === '1NT' &&
      auction.length === openingInfo.index + 2) {
    const interference = parseSuitBid(auction[openingInfo.index + 1] ?? 'Pass');
    return interference !== null && interference.level === 2 && interference.strain !== 'NT'
      ? { interference, opponentOpening: null }
      : null;
  }
  const opening = parseSuitBid(openingInfo.call);
  if (stage !== 'advancing' || opening === null || opening.level !== 1 ||
      opening.strain === 'NT' || auction.length !== openingInfo.index + 3 ||
      auction[openingInfo.index + 1] !== '1NT') {
    return null;
  }
  const interference = parseSuitBid(auction[openingInfo.index + 2] ?? 'Pass');
  return interference !== null && interference.level === 2 && interference.strain !== 'NT'
    ? { interference, opponentOpening: opening }
    : null;
}

/// getInterferenceAfterOpening classifies the opponent's first call immediately after opener's
/// bid, distinguishing natural suit overcalls, preemptive jumps, and a takeout double.
export function getInterferenceAfterOpening (dealer: Seat, auction: Call[]): DirectInterference {
  const opening = getOpeningCallInfo(dealer, auction);
  if (opening === null) {
    return 'none';
  }
  const action = auction[opening.index + 1];
  if (action === undefined || action === 'Pass') {
    return 'none';
  }
  if (action === 'Double') {
    return 'takeoutDouble';
  }
  const parsed = parseSuitBid(action);
  const openerBid = parseSuitBid(opening.call);
  if (parsed === null || openerBid === null || openerBid.level !== 1 ||
      openerBid.strain === 'NT') {
    return 'other';
  }
  if (parsed.strain === 'NT') {
    return action === '1NT' ? 'notrumpOvercall' : 'other';
  }
  if (parsed.strain === openerBid.strain) {
    return 'other';
  }
  const cheapest = cheapestBidInStrainAfter(openerBid, parsed.strain);
  return cheapest === action ? 'suitOvercall' : 'jumpSuitOvercall';
}

/// isCallAvailableInAuction checks contract ordering independently of bidding-rule meaning.
/// Pass is always mechanically available. Double meanings are evaluated by bidding rules;
/// Redouble is available only to the doubled contract's partnership while Double is in force.
export function isCallAvailableInAuction (call: Call, auction: Call[]): boolean {
  if (call === 'Redouble') {
    const lastActionIndex = auction.findLastIndex((action) => action !== 'Pass');
    if (lastActionIndex < 0 || auction[lastActionIndex] !== 'Double') {
      return false;
    }
    const contractIndex = auction.findLastIndex((action) => isContractBid(action));
    return contractIndex >= 0 && contractIndex % 2 === auction.length % 2;
  }
  if (! isContractBid(call)) {
    return true;
  }
  for (let index = auction.length - 1; index >= 0; index -= 1) {
    const prior = auction[index];
    if (prior !== undefined && isContractBid(prior)) {
      return compareSuitBids(parseSuitBid(call)!, parseSuitBid(prior)!) > 0;
    }
  }
  return true;
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

/// responseJump reports how many levels responder bid above the cheapest legal contract in the
/// same strain.  Zero is an ordinary non-jump response; one and two are single and double jumps.
/// Larger values are returned rather than being collapsed into the modeled 0/1/2 rule constraint.
///
export function responseJump (openingCall: SuitBid, responseCall: SuitBid): number {
  const opening = parseSuitBid(openingCall)!;
  const response = parseSuitBid(responseCall)!;
  const cheapest = cheapestBidInStrainAfter(opening, response.strain);
  if (cheapest === null) {
    return 0;
  }
  const cheapestLevel = parseSuitBid(cheapest)!.level;
  return response.level - cheapestLevel;
}

/// compareSuitBids compares contract bids in normal auction order: level first, then strain.
/// A negative result means a is lower than b, zero means equal, and a positive result means a is
/// higher than b.  This return shape is intended for Array.sort and explicit order comparisons.
///
export function compareSuitBids (a: ParsedSuitBid, b: ParsedSuitBid): number {
  if (a.level !== b.level) {
    return a.level - b.level;
  }
  return STRAIN_ORDER.indexOf(a.strain) - STRAIN_ORDER.indexOf(b.strain);
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
