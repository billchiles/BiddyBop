/// Overcall Bid Functions: refiners, applicability checks, and related helpers.

import {
  type AppliesWhenResult, type Call, type CallRefinementResult, type RuleEvalContext
} from './bidding-types';
import { hasPreemptSuitQuality, SUITS, type Suit } from './cards';
import { cheapestBidInStrainAfter, getOpeningCallInfo, parseSuitBid } from './auction';
import { hasBasicSuitStopper } from './common-rule-helpers';

///
//// Natural Suit Overcalls
///

/// refineSimpleSuitOvercall selects the cheapest available non-jump suit bid for the
/// overcaller. A five-card suit needs the shared good-suit test; six or more cards suffice.
export function refineSimpleSuitOvercall (calls: Call[], context: RuleEvalContext): CallRefinementResult {
  const opening = getOpeningCallInfo(context.dealer, context.auction)?.call;
  if (opening === undefined || opening.substring(1) === 'NT') {
    return { calls: [], telemetryLines: ['A one-level suit opening is required.'] };
  }
  const parsedOpening = parseSuitBid(opening);
  if (parsedOpening === null) {
    return { calls: [], telemetryLines: ['No contract opening was found.'] };
  }
  const qualifying = calls.filter((call) => {
    const bid = parseSuitBid(call);
    if (bid === null || bid.strain === 'NT' || bid.strain === parsedOpening.strain) {
      return false;
    }
    const cheapest = cheapestBidInStrainAfter(parsedOpening, bid.strain);
    if (cheapest !== call) {
      return false;
    }
    const suit = bid.strain as Suit;
    const length = context.handFacts.lengths[suit];
    return length >= 6 || (length === 5 && hasPreemptSuitQuality(context.hand, suit));
  });
  return { calls: qualifying, telemetryLines: [
    'Keep non-jump new suits with a good five-card suit or any six-card-or-longer suit.',
  ] };
}

/// refinePreemptiveJumpOvercall selects a jump bid for the overcaller, with a good six-,
/// seven-, or eight-card suit at level 2, 3, or 4. The bid must exceed the cheapest bid in that suit.
export function refinePreemptiveJumpOvercall (calls: Call[], context: RuleEvalContext): CallRefinementResult {
  const opening = getOpeningCallInfo(context.dealer, context.auction)?.call;
  const parsedOpening = opening === undefined ? null : parseSuitBid(opening);
  if (parsedOpening === null || parsedOpening.level !== 1 || parsedOpening.strain === 'NT') {
    return { calls: [], telemetryLines: ['Requires a one-level suit opening.'] };
  }
  const qualifying = calls.filter((call) => {
    const bid = parseSuitBid(call);
    if (bid === null || bid.strain === 'NT' || bid.strain === parsedOpening.strain ||
        bid.level < 2 || bid.level > 4) {
      return false;
    }
    const cheapest = cheapestBidInStrainAfter(parsedOpening, bid.strain);
    const parsedCheapest = cheapest === null ? null : parseSuitBid(cheapest);
    if (parsedCheapest === null || bid.level <= parsedCheapest.level) {
      return false;
    }
    const suit = bid.strain as Suit;
    return context.handFacts.lengths[suit] === bid.level + 4 &&
      hasPreemptSuitQuality(context.hand, suit);
  });
  return { calls: qualifying, telemetryLines: [
    'Jump in a different suit: good six cards at two, seven at three, eight at four.',
  ] };
}

///
//// Natural Notrump Overcalls
///

/// naturalOneNtOvercallApplies requires 15-18 HCP, balanced shape, and A, Kx, Qxx, or Jxxx
/// in opener's suit as a simple stopper approximation, not a guaranteed trick.
export function naturalOneNtOvercallApplies (_call: Call, context: RuleEvalContext): AppliesWhenResult {
  const opening = getOpeningCallInfo(context.dealer, context.auction)?.call;
  const parsed = opening === undefined ? null : parseSuitBid(opening);
  if (parsed === null || parsed.strain === 'NT') {
    return { success: false, telemetryLines: ['FAIL: an opposing suit opening is required.'] };
  }
  const stopper = hasBasicSuitStopper(context, parsed.strain as Suit);
  const points = context.handFacts.hcp;
  const strength = points >= 15 && points <= 18;
  const balanced = context.handFacts.balanced;
  return {
    success: strength && balanced && stopper,
    telemetryLines: [
      `${strength ? 'PASS' : 'FAIL'}: 1NT overcall requires 15-18 HCP; hand has ${points}.`,
      `${balanced ? 'PASS' : 'FAIL'}: 1NT overcall needs balanced distribution.`,
      `${stopper ? 'PASS' : 'FAIL'}: 1NT overcall needs A, Kx, Qxx, or Jxxx in ` +
        `opener's ${parsed.strain} suit.`,
    ],
  };
}

///
//// Takeout Doubles
///

/// ordinaryTakeoutDoubleApplies checks the ordinary takeout double (not the strong-hand
/// exception): 13+ shortage-adjusted points, fewer than 18 HCP, and 3+ cards in each unbid suit.
///
export function ordinaryTakeoutDoubleApplies (_call: Call, context: RuleEvalContext):
     AppliesWhenResult {
  const opening = getOpeningCallInfo(context.dealer, context.auction)?.call;
  const parsed = opening === undefined ? null : parseSuitBid(opening);
  if (parsed === null || parsed.strain === 'NT') {
    return { success: false, telemetryLines: ['FAIL: requires a natural suit opening.'] };
  }
  const unbid = SUITS.filter((suit) => suit !== parsed.strain);
  const support = unbid.every((suit) => context.handFacts.lengths[suit] >= 3);
  const points = context.handFacts.totalPointsWShortage;
  return {
    success: support && points >= 13 && context.handFacts.hcp < 18,
    telemetryLines: [
      `${points >= 13 ? 'PASS' : 'FAIL'}: ${points} points with shortage; need at least 13.`,
      `${support ? 'PASS' : 'FAIL'}: need three cards in each unbid suit (${unbid.map((suit) =>
        `${suit}=${context.handFacts.lengths[suit]}`).join(', ')}).`,
      `${context.handFacts.hcp < 18 ? 'PASS' : 'FAIL'}: 18+ HCP uses the strong-double rule.`,
    ],
  };
}
