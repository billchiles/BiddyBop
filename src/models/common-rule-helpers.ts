/// Shared Auction and Valuation Helpers: refiners, applicability checks, and related helpers.

import { type RuleEvalContext } from './bidding-types';
import { getCardsForSuit, SUITS, type Suit } from './cards';
import { getOpeningCallInfo, getPartnerOpeningCall, getResponderCall, parseSuitBid, 
         type ParsedSuitBid } from './auction';



/// getNegativeDoubleImpliedSuits returns the unbid suits responder's negative Double asks partner
/// to consider.  When any unbid major exists, the major suit or suits are the primary implication;
/// only when neither unbid suit is a major does the treatment imply both minors.
export function getNegativeDoubleImpliedSuits (opening: ParsedSuitBid,
                                               overcall: ParsedSuitBid): Suit[] {
  const unbidSuits = SUITS.filter((suit) => suit !== opening.strain && suit !== overcall.strain);
  const unbidMajors = unbidSuits.filter((suit) => suit === 'H' || suit === 'S');
  return unbidMajors.length > 0 ? unbidMajors : unbidSuits;
}

export function getWeakTwoOpeningBid (context: RuleEvalContext): ParsedSuitBid | null {
  const opening = getOpenerOpeningBid(context);
  if (opening === null || opening.level !== 2 || opening.strain === 'C' || opening.strain === 'NT') {
    return null;
  }
  return opening;
}

export function getThreeLevelPreemptOpeningBid (context: RuleEvalContext): ParsedSuitBid | null {
  const opening = getOpenerOpeningBid(context);
  if (opening === null || opening.level !== 3 || opening.strain === 'NT') {
    return null;
  }
  return opening;
}

export function getResponderBid (context: RuleEvalContext): ParsedSuitBid | null {
  const call = getResponderCall(context.dealer, context.auction);
  return call === null ? null : parseSuitBid(call);
}

/// getOpenerOpeningBid parses the auction's opening contract bid for rule refiners.
///
export function getOpenerOpeningBid (context: RuleEvalContext): ParsedSuitBid | null {
  const opening = getOpeningCallInfo(context.dealer, context.auction);
  return opening === null ? null : parseSuitBid(opening.call);
}

/// getPartnerOpeningBid parses partner's opening contract bid when a response rule needs it.
///
export function getPartnerOpeningBid (context: RuleEvalContext): ParsedSuitBid | null {
  const opening = getPartnerOpeningCall(context.dealer, context.auction, context.seat);
  return opening === null ? null : parseSuitBid(opening);
}

/// hasBasicSuitStopper uses one conservative, shared approximation for natural NT actions.
/// A, Kx, Qxx, or Jxxx counts; this does not promise a sure trick against any lead.
///
export function hasBasicSuitStopper (context: RuleEvalContext, suit: Suit): boolean {
  const cards = getCardsForSuit(context.hand, suit);
  const ranks = cards.map((card) => card.rank);
  return ranks.includes('A') || (cards.length >= 2 && ranks.includes('K')) ||
    (cards.length >= 3 && ranks.includes('Q')) ||
    (cards.length >= 4 && ranks.includes('J'));
}


/// orderMajorSuitCandidates orders the at-most-two major candidates by major-suit priority:
/// longer major first; equal four-card majors up the line; equal five-card-or-longer majors down
/// the line.
///
export function orderMajorSuitCandidates<T extends { suit: Suit; length: number }> (majors: T[]): T[] {
  if (majors.length < 2) {
    return majors;
  }
  const [first, second] = majors;
  if (first.length !== second.length) {
    return first.length > second.length ? majors : [second, first];
  }
  const wantedFirst = first.length === 4 ? 'H' : 'S';
  return first.suit === wantedFirst ? majors : [second, first];
}
