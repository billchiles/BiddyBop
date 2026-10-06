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
//// DONT over a Strong 1NT
///

/// The compact DONT treatment in this app uses shape and suit quality rather than trying to
/// model vulnerability.  A one-suited hand has exactly one 6+ card suit and no second 4-card suit.
function getDontSingleSuit (context: RuleEvalContext): Suit | null {
  const longSuits = SUITS.filter((suit) => context.handFacts.lengths[suit] >= 6);
  if (longSuits.length !== 1) return null;
  const suit = longSuits[0]!;
  if (SUITS.some((other) => other !== suit && context.handFacts.lengths[other] >= 4) ||
      ! hasPreemptSuitQuality(context.hand, suit)) {
    return null;
  }
  return suit;
}

/// A DONT two-suiter has exactly two suits of at least four cards, at least nine cards between
/// them, and useful honor concentration in a five-card-or-longer member of the pair.
function getDontTwoSuits (context: RuleEvalContext, lowerSuit: Suit,
                          higherSuits: readonly Suit[]): [Suit, Suit] | null {
  const fourCardSuits = SUITS.filter((suit) => context.handFacts.lengths[suit] >= 4);
  if (fourCardSuits.length !== 2 || ! fourCardSuits.includes(lowerSuit)) return null;
  const higherSuit = fourCardSuits.find((suit) => higherSuits.includes(suit));
  if (higherSuit === undefined ||
      context.handFacts.lengths[lowerSuit] + context.handFacts.lengths[higherSuit] < 9) {
    return null;
  }
  const quality = [lowerSuit, higherSuit].some((suit) =>
    context.handFacts.lengths[suit] >= 5 && hasPreemptSuitQuality(context.hand, suit));
  return quality ? [lowerSuit, higherSuit] : null;
}

/// In this compact DONT treatment, Double shows a good one-suited club, diamond, or heart hand.
/// Direct 2S handles the ordinary one-suited spade hand; stronger spade distinctions are deferred.
export function dontSingleSuitDoubleApplies (_call: Call, context: RuleEvalContext):
    AppliesWhenResult {
  const suit = getDontSingleSuit(context);
  const success = context.handFacts.hcp >= 7 && suit !== null && suit !== 'S';
  return { success, telemetryLines: [success ?
    `PASS: DONT Double shows the one-suited ${suit} hand.` :
    'FAIL: DONT Double needs 7+ HCP and one good 6+ card non-spade suit.'] };
}

/// 2C/2D/2H show the named lower suit plus exactly one higher suit, normally at least 5-4.
export function dontTwoSuitOvercallApplies (call: Call, context: RuleEvalContext):
    AppliesWhenResult {
  const shape = call === '2C' ? getDontTwoSuits(context, 'C', ['D', 'H', 'S']) :
    call === '2D' ? getDontTwoSuits(context, 'D', ['H', 'S']) :
    call === '2H' ? getDontTwoSuits(context, 'H', ['S']) : null;
  const success = context.handFacts.hcp >= 7 && shape !== null;
  return { success, telemetryLines: [success ?
    `PASS: DONT ${call} shows ${shape[0]} plus ${shape[1]}.` :
    `FAIL: DONT ${call} needs 7+ HCP and the modeled 5-4-or-better two-suit shape.`] };
}

/// Direct 2S is the app's ordinary one-suited spade action: 7+ HCP and a good 6+ card suit.
export function dontSpadeOvercallApplies (_call: Call, context: RuleEvalContext):
    AppliesWhenResult {
  const success = context.handFacts.hcp >= 7 && getDontSingleSuit(context) === 'S';
  return { success, telemetryLines: [success ?
    'PASS: direct 2S shows the ordinary one-suited spade DONT hand.' :
    'FAIL: direct DONT 2S needs 7+ HCP and one good 6+ card spade suit.'] };
}

/// After advancer makes the basic DONT relay/pass-or-correct call and opener passes, the
/// overcaller either accepts that strain or names the concealed suit.  Game-inquiry continuations
/// and responder interference are intentionally outside this compact treatment.
export function refineDontOvercallerCorrection (calls: Call[], context: RuleEvalContext):
    CallRefinementResult {
  const opening = getOpeningCallInfo(context.dealer, context.auction);
  if (context.stage !== 'overcallerRebid' || opening === null || opening.call !== '1NT' ||
      context.auction.length !== opening.index + 5 ||
      context.auction[opening.index + 2] !== 'Pass' ||
      context.auction[opening.index + 4] !== 'Pass') {
    return { calls: [], telemetryLines: [] };
  }
  const overcall = context.auction[opening.index + 1];
  const advance = context.auction[opening.index + 3];
  let target: Call | null = null;
  if (overcall === 'Double' && advance === '2C') {
    const suit = getDontSingleSuit(context);
    target = suit === null ? null : suit === 'C' ? 'Pass' : `2${suit}` as Call;
  } else if (overcall === '2C' && advance === '2D') {
    const shape = getDontTwoSuits(context, 'C', ['D', 'H', 'S']);
    const higher = shape?.[1];
    target = higher === undefined ? null : higher === 'D' ? 'Pass' : `2${higher}` as Call;
  } else if (overcall === '2D' && advance === '2H') {
    const shape = getDontTwoSuits(context, 'D', ['H', 'S']);
    const higher = shape?.[1];
    target = higher === undefined ? null : higher === 'H' ? 'Pass' : '2S';
  } else if (overcall === '2H' && advance === '2S') {
    target = getDontTwoSuits(context, 'H', ['S']) === null ? null : 'Pass';
  }
  return { calls: target === null ? [] : calls.filter((call) => call === target),
           telemetryLines: [] };
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
