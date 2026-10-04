/// Functions for advancer after partner's overcall or takeout double.

import { type AppliesWhenResult, type Call, type CallRefinementResult,
         type RuleEvalContext } from './bidding-types';
import { cheapestBidInStrainAfter, getInterferenceAfterOpening, getOpeningCallInfo,
         parseSuitBid, type ParsedSuitBid } from './auction';
import { hasBasicSuitStopper } from './common-rule-helpers';
import { hasPreemptSuitQuality, SUITS, type Suit } from './cards';


/// Advancer after a natural, non-jump suit overcall of the given level, with the
/// opponents' responder passing.  Jump overcalls and responder interference are excluded.
///
function getNaturalSuitOvercallForAdvancer (context: RuleEvalContext, level: 1 | 2):
    { opening: ParsedSuitBid; overcall: ParsedSuitBid } | null {
  if (context.stage !== 'advancing' ||
      getInterferenceAfterOpening(context.dealer, context.auction) !== 'suitOvercall') {
    return null;
  }
  const openingInfo = getOpeningCallInfo(context.dealer, context.auction);
  if (openingInfo === null || context.auction.length !== openingInfo.index + 3 ||
      context.auction[openingInfo.index + 2] !== 'Pass') {
    return null;
  }
  const opening = parseSuitBid(openingInfo.call);
  const overcallCall = context.auction[openingInfo.index + 1];
  const overcall = overcallCall === undefined ? null : parseSuitBid(overcallCall);
  if (opening === null || opening.level !== 1 || opening.strain === 'NT' ||
      overcall === null || overcall.level !== level || overcall.strain === 'NT' ||
      cheapestBidInStrainAfter(opening, overcall.strain) !== overcallCall) {
    return null;
  }
  return { opening, overcall };
}

export function refineAdvancerRaise (calls: Call[], context: RuleEvalContext):
    CallRefinementResult {
  const info = getNaturalSuitOvercallForAdvancer(context, 1);
  return {
    calls: info === null ? [] : calls.filter((call) =>
      parseSuitBid(call)?.strain === info.overcall.strain),
    telemetryLines: [],
  };
}

export function refineAdvancerCuebid (calls: Call[], context: RuleEvalContext):
    CallRefinementResult {
  const info = getNaturalSuitOvercallForAdvancer(context, 1);
  return {
    calls: info === null ? [] : calls.filter((call) =>
      parseSuitBid(call)?.strain === info.opening.strain),
    telemetryLines: [],
  };
}

/// A natural new-suit advance is at the cheapest legal level for that suit.  In
/// particular, a 2-level call is not necessarily economical after every overcall.
export function refineAdvancerNewSuit (calls: Call[], context: RuleEvalContext):
    CallRefinementResult {
  const info = getNaturalSuitOvercallForAdvancer(context, 1);
  return {
    calls: info === null ? [] : calls.filter((call) => {
      const bid = parseSuitBid(call);
      return bid !== null && bid.strain !== 'NT' &&
        bid.strain !== info.opening.strain && bid.strain !== info.overcall.strain &&
        cheapestBidInStrainAfter(info.overcall, bid.strain) === call;
    }),
    telemetryLines: [],
  };
}

/// Natural notrump advances need an opener-suit stopper, balanced shape, and the
/// appropriate range; these are distinct from notrump responses to an opening bid.
export function naturalNotrumpAdvanceApplies (call: Call, context: RuleEvalContext):
    AppliesWhenResult {
  const info = getNaturalSuitOvercallForAdvancer(context, 1);
  const hcp = context.handFacts.hcp;
  const rangeMatches = call === '1NT' ? hcp >= 8 && hcp <= 11 :
    call === '2NT' && hcp >= 12 && hcp <= 14;
  const success = info !== null && rangeMatches && context.handFacts.balanced &&
    hasBasicSuitStopper(context, info.opening.strain as Suit);
  return {
    success,
    telemetryLines: [success ? 'PASS: natural NT advance with range, shape, and stopper.' :
      'FAIL: natural NT advance needs a passed responder, 1-level suit overcall, ' +
      'balanced shape, proper HCP, and opening-suit stopper.'],
  };
}


/// Second advancing family: non-jump natural two-level suit overcalls.  Raising
/// to the three level is a simple raise, not the weak jump raise used after 1-level overcalls.
export function refineAdvancerTwoLevelRaise (calls: Call[], context: RuleEvalContext):
    CallRefinementResult {
  const info = getNaturalSuitOvercallForAdvancer(context, 2);
  return {
    calls: info === null ? [] : calls.filter((call) =>
      parseSuitBid(call)?.strain === info.overcall.strain),
    telemetryLines: [],
  };
}

export function refineAdvancerTwoLevelCuebid (calls: Call[], context: RuleEvalContext):
    CallRefinementResult {
  const info = getNaturalSuitOvercallForAdvancer(context, 2);
  return {
    calls: info === null ? [] : calls.filter((call) =>
      cheapestBidInStrainAfter(info.overcall, info.opening.strain) === call),
    telemetryLines: [],
  };
}

/// At either the two or three level, the new suit must be the cheapest available
/// bid in that strain; a three-level five-card suit also needs concentrated honors.
export function refineAdvancerTwoLevelNewSuit (calls: Call[], context: RuleEvalContext):
    CallRefinementResult {
  const info = getNaturalSuitOvercallForAdvancer(context, 2);
  return {
    calls: info === null ? [] : calls.filter((call) => {
      const bid = parseSuitBid(call);
      return bid !== null && bid.strain !== 'NT' &&
        bid.strain !== info.opening.strain && bid.strain !== info.overcall.strain &&
        cheapestBidInStrainAfter(info.overcall, bid.strain) === call &&
        (bid.level !== 3 || hasPreemptSuitQuality(context.hand, bid.strain as Suit));
    }),
    telemetryLines: [],
  };
}

/// A natural invitational 2NT advance requires a balanced 11-13 HCP hand and
/// a stopper in the opponents' opening suit.
export function naturalTwoLevelNotrumpAdvanceApplies (_call: Call, context: RuleEvalContext):
    AppliesWhenResult {
  const info = getNaturalSuitOvercallForAdvancer(context, 2);
  const hcp = context.handFacts.hcp;
  const success = info !== null && hcp >= 11 && hcp <= 13 && context.handFacts.balanced &&
    hasBasicSuitStopper(context, info.opening.strain as Suit);
  return {
    success,
    telemetryLines: [success ? 'PASS: 2NT advance with range, shape, and stopper.' :
      'FAIL: 2NT advance needs a passed responder, natural 2-level non-jump overcall, ' +
      '11-13 HCP, balanced shape, and opening-suit stopper.'],
  };
}


/// Advancer may act after a takeout double of a one-level suit opening when
/// responder passes.  Other doubles and competitive continuations are excluded.
///
function getTakeoutDoubleForAdvancer (context: RuleEvalContext): ParsedSuitBid | null {
  if (context.stage !== 'advancing' ||
      getInterferenceAfterOpening(context.dealer, context.auction) !== 'takeoutDouble') {
    return null;
  }
  const openingInfo = getOpeningCallInfo(context.dealer, context.auction);
  if (openingInfo === null || context.auction.length !== openingInfo.index + 3 ||
      context.auction[openingInfo.index + 1] !== 'Double' ||
      context.auction[openingInfo.index + 2] !== 'Pass') {
    return null;
  }
  const opening = parseSuitBid(openingInfo.call);
  return opening !== null && opening.level === 1 && opening.strain !== 'NT' ? opening : null;
}

/// Select an unbid suit at the cheapest level (jump=0), or exactly one level
/// above it (jump=1). A weak three-card fallback is allowed only when there
/// is no four-card unbid suit; a jump always requires four cards.
export function refineTakeoutDoubleSuitAdvance (calls: Call[], context: RuleEvalContext,
                                                jump: 0 | 1): CallRefinementResult {
  const opening = getTakeoutDoubleForAdvancer(context);
  if (opening === null) {
    return { calls: [], telemetryLines: [] };
  }
  const unbidSuits = SUITS.filter((suit) => suit !== opening.strain);
  const hasFourCardUnbidSuit = unbidSuits.some((suit) => context.handFacts.lengths[suit] >= 4);
  const qualifying = calls.filter((call) => {
    const bid = parseSuitBid(call);
    if (bid === null || bid.strain === 'NT' || bid.strain === opening.strain) {
      return false;
    }
    const suit = bid.strain as Suit;
    const length = context.handFacts.lengths[suit];
    if (length < 4 && (jump !== 0 || hasFourCardUnbidSuit || length !== 3)) {
      return false;
    }
    const cheapest = cheapestBidInStrainAfter(opening, bid.strain);
    const parsedCheapest = cheapest === null ? null : parseSuitBid(cheapest);
    return parsedCheapest !== null && bid.level === parsedCheapest.level + jump;
  });
  // Length first; with equal four-card majors prefer H, with equal 5+ majors prefer S.
  qualifying.sort((left, right) => {
    const leftSuit = parseSuitBid(left)!.strain as Suit;
    const rightSuit = parseSuitBid(right)!.strain as Suit;
    const lengthDifference = context.handFacts.lengths[rightSuit] - context.handFacts.lengths[leftSuit];
    if (lengthDifference !== 0) return lengthDifference;
    if (leftSuit === 'H' && rightSuit === 'S') return context.handFacts.lengths.H >= 5 ? 1 : -1;
    if (leftSuit === 'S' && rightSuit === 'H') return context.handFacts.lengths.S >= 5 ? -1 : 1;
    return 0;
  });
  return { calls: qualifying, telemetryLines: [] };
}

export function refineTakeoutDoubleCuebid (calls: Call[], context: RuleEvalContext):
    CallRefinementResult {
  const opening = getTakeoutDoubleForAdvancer(context);
  return { calls: opening === null ? [] : calls.filter((call) =>
    cheapestBidInStrainAfter(opening, opening.strain) === call), telemetryLines: [] };
}

export function refineTakeoutDoubleMajorGame (calls: Call[], context: RuleEvalContext):
    CallRefinementResult {
  const opening = getTakeoutDoubleForAdvancer(context);
  return { calls: opening === null ? [] : calls.filter((call) => {
    const bid = parseSuitBid(call);
    return bid !== null && bid.level === 4 && (bid.strain === 'H' || bid.strain === 'S') &&
      bid.strain !== opening.strain && context.handFacts.lengths[bid.strain] >= 5;
  }), telemetryLines: [] };
}

/// Natural notrump responses to a takeout double have a distinct strength ladder
/// and require a balanced hand with a stopper in the opponents' opening suit.
export function naturalTakeoutDoubleNotrumpAdvanceApplies (call: Call, context: RuleEvalContext):
    AppliesWhenResult {
  const opening = getTakeoutDoubleForAdvancer(context);
  const hcp = context.handFacts.hcp;
  const strength = call === '1NT' ? hcp >= 8 && hcp <= 11 :
    call === '2NT' ? hcp >= 12 && hcp <= 13 :
    call === '3NT' && hcp >= 14 && hcp <= 16;
  const success = opening !== null && strength && context.handFacts.balanced &&
    hasBasicSuitStopper(context, opening.strain as Suit);
  return { success, telemetryLines: [success ?
    'PASS: natural NT advance after takeout double with proper range, shape, and stopper.' :
    'FAIL: requires 1-suit Double Pass, balanced shape, appropriate HCP, and a stopper.'] };
}
