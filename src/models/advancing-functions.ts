/// Functions for advancer after partner's overcall or takeout double.

import { type AppliesWhenResult, type Call, type CallRefinementResult,
         type RuleEvalContext } from './bidding-types';
import { cheapestBidInStrainAfter, getInterferenceAfterOpening, getOpeningCallInfo,
         parseSuitBid, type ParsedSuitBid } from './auction';
import { getNegativeDoubleImpliedSuits, hasBasicSuitStopper } from './common-rule-helpers';
import { hasPreemptSuitQuality, SUITS, type Suit } from './cards';


/// Basic DONT advances are pass-or-correct decisions after responder passes.  This compact
/// treatment omits game inquiries and all continuations after responder competes.
export function refineDontAdvance (calls: Call[], context: RuleEvalContext): CallRefinementResult {
  const opening = getOpeningCallInfo(context.dealer, context.auction);
  if (context.stage !== 'advancing' || opening === null || opening.call !== '1NT' ||
      context.auction.length !== opening.index + 3 ||
      context.auction[opening.index + 2] !== 'Pass') {
    return { calls: [], telemetryLines: [] };
  }
  const overcall = context.auction[opening.index + 1];
  let target: Call | null = null;
  if (overcall === 'Double') {
    target = '2C';
  } else if (overcall === '2C') {
    target = context.handFacts.lengths.C >= 3 ? 'Pass' : '2D';
  } else if (overcall === '2D') {
    const preferMajors = context.handFacts.lengths.H >= 4 && context.handFacts.lengths.S >= 4;
    target = context.handFacts.lengths.D >= 3 && ! preferMajors ? 'Pass' : '2H';
  } else if (overcall === '2H') {
    target = context.handFacts.lengths.S > context.handFacts.lengths.H ? '2S' : 'Pass';
  } else if (overcall === '2S') {
    target = 'Pass';
  }
  return { calls: target === null ? [] : calls.filter((call) => call === target),
           telemetryLines: [] };
}

/// Advancer after a natural, non-jump suit overcall of the given level, with the
/// opponents' responder passing.  Support one-level suit openings and weak-two openings;
/// jump overcalls and responder interference are excluded.
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
  const weakTwoOpening = ['2D', '2H', '2S'].includes(openingInfo.call);
  if (opening === null || opening.strain === 'NT' ||
      (opening.level !== 1 && ! weakTwoOpening) ||
      overcall === null || overcall.level !== level || overcall.strain === 'NT' ||
      cheapestBidInStrainAfter(opening, overcall.strain) !== overcallCall) {
    return null;
  }
  return { opening, overcall };
}

/// Partner's natural suit overcall is not forcing.  With limited values and no
/// available constructive raise, natural new suit, or notrump advance, Pass.
/// Use the same auction/level checks as the positive advancing rules.
export function naturalSuitOvercallPassApplies (
    _call: Call, context: RuleEvalContext, level: 1 | 2): AppliesWhenResult {
  const info = getNaturalSuitOvercallForAdvancer(context, level);
  if (info === null) {
    return { success: false, telemetryLines: [
      'FAIL: Pass needs a natural non-jump suit overcall and responder Pass.',
    ] };
  }
  const hcp = context.handFacts.hcp;
  const support = context.handFacts.lengths[info.overcall.strain as Suit];
  const supportPoints = context.handFacts.totalPointsWShortage;
  const hasRaise = level === 1 ?
    support >= 4 || (support >= 3 && supportPoints >= 6) :
    support >= 3 && supportPoints >= 7;
  const hasNotrump = level === 1 && hcp >= 8 && hcp <= 11 &&
    context.handFacts.balanced && hasBasicSuitStopper(context, info.opening.strain as Suit);
  const hasNewSuit = SUITS.some((suit) => {
    if (suit === info.opening.strain || suit === info.overcall.strain ||
        context.handFacts.lengths[suit] < 5) {
      return false;
    }
    const call = cheapestBidInStrainAfter(info.overcall, suit);
    const bid = call === null ? null : parseSuitBid(call);
    return bid !== null && ((level === 1 && bid.level === 1 && hcp >= 8) ||
      (bid.level === 2 && hcp >= 10));
  });
  const success = hcp <= 10 && ! hasRaise && ! hasNotrump && ! hasNewSuit;
  return { success, telemetryLines: [success ?
    'PASS: limited strength with no qualifying raise, new suit, or notrump advance.' :
    'FAIL: stronger values or a constructive advance make this weak Pass inappropriate.'] };
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


/// Advancer may act after a takeout double of a one-level suit or weak-two opening when
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
  if (opening === null || opening.strain === 'NT') return null;
  return opening.level === 1 || ['2D', '2H', '2S'].includes(openingInfo.call) ? opening : null;
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

/// Without Lebensohl, a direct three-level suit after a weak-two Double can be forced by
/// bidding space, so allow 9-11 as well as 0-8 when the cheapest suit action is already at three.
export function takeoutDoubleMinimumSuitAdvanceApplies (call: Call, context: RuleEvalContext):
    AppliesWhenResult {
  const opening = getTakeoutDoubleForAdvancer(context);
  const bid = parseSuitBid(call);
  const points = context.handFacts.totalPointsWLength;
  const directThreeLevel = opening?.level === 2 && bid?.level === 3;
  const success = opening !== null && points <= (directThreeLevel ? 11 : 8);
  return { success, telemetryLines: [success ?
    'PASS: cheapest suit advance has the modeled strength for this takeout-double auction.' :
    'FAIL: cheapest suit advance is too strong for the modeled non-jump range.'] };
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
  const weakTwoOpening = opening?.level === 2;
  const strength = call === '1NT' ? ! weakTwoOpening && hcp >= 8 && hcp <= 11 :
    call === '2NT' ? (weakTwoOpening ? hcp >= 11 && hcp <= 12 : hcp >= 12 && hcp <= 13) :
    call === '3NT' && (weakTwoOpening ? hcp >= 13 && hcp <= 15 : hcp >= 14 && hcp <= 16);
  const success = opening !== null && strength && context.handFacts.balanced &&
    hasBasicSuitStopper(context, opening.strain as Suit);
  return { success, telemetryLines: [success ?
    'PASS: natural NT advance after takeout double with proper range, shape, and stopper.' :
    'FAIL: takeout-double NT advance needs balanced shape, the context-specific HCP range, ' +
    'and a stopper.'] };
}


/// A simple raise by opener's partner changes advancer's obligations.  These helpers
/// recognize the real competitive auction instead of treating it like the earlier Pass cases.
///
function getNaturalSuitOvercallWithResponderRaise (context: RuleEvalContext, overcallLevel: 1 | 2):
    { opening: ParsedSuitBid; overcall: ParsedSuitBid; responderRaise: ParsedSuitBid } | null {
  if (context.stage !== 'advancing' ||
      getInterferenceAfterOpening(context.dealer, context.auction) !== 'suitOvercall') {
    return null;
  }
  const openingInfo = getOpeningCallInfo(context.dealer, context.auction);
  if (openingInfo === null || context.auction.length !== openingInfo.index + 3) {
    return null;
  }
  const opening = parseSuitBid(openingInfo.call);
  const overcallCall = context.auction[openingInfo.index + 1];
  const responderCall = context.auction[openingInfo.index + 2];
  const overcall = overcallCall === undefined ? null : parseSuitBid(overcallCall);
  const responderRaise = responderCall === undefined ? null : parseSuitBid(responderCall);
  if (opening === null || opening.level !== 1 || opening.strain === 'NT' ||
      overcall === null || overcall.level !== overcallLevel || overcall.strain === 'NT' ||
      responderRaise === null || responderRaise.strain !== opening.strain ||
      cheapestBidInStrainAfter(opening, overcall.strain) !== overcallCall ||
      cheapestBidInStrainAfter(overcall, opening.strain) !== responderCall) {
    return null;
  }
  return { opening, overcall, responderRaise };
}

function getTakeoutDoubleWithResponderRaise (context: RuleEvalContext):
    { opening: ParsedSuitBid; responderRaise: ParsedSuitBid } | null {
  if (context.stage !== 'advancing' ||
      getInterferenceAfterOpening(context.dealer, context.auction) !== 'takeoutDouble') {
    return null;
  }
  const openingInfo = getOpeningCallInfo(context.dealer, context.auction);
  if (openingInfo === null || context.auction.length !== openingInfo.index + 3 ||
      context.auction[openingInfo.index + 1] !== 'Double') {
    return null;
  }
  const opening = parseSuitBid(openingInfo.call);
  const responderCall = context.auction[openingInfo.index + 2];
  const responderRaise = responderCall === undefined ? null : parseSuitBid(responderCall);
  if (opening === null || opening.level !== 1 || opening.strain === 'NT' ||
      responderRaise === null || responderRaise.strain !== opening.strain ||
      cheapestBidInStrainAfter(opening, opening.strain) !== responderCall) {
    return null;
  }
  return { opening, responderRaise };
}

function hasResponsiveShape (context: RuleEvalContext, unbidSuits: Suit[]): boolean {
  const fourCardSuits = unbidSuits.filter((suit) => context.handFacts.lengths[suit] >= 4);
  return fourCardSuits.length >= 2 &&
    unbidSuits.every((suit) => context.handFacts.lengths[suit] < 5);
}

function hasQualifyingNewSuitAfterOvercallRaise (
    context: RuleEvalContext,
    info: { opening: ParsedSuitBid; overcall: ParsedSuitBid; responderRaise: ParsedSuitBid },
): boolean {
  return SUITS.some((suit) => {
    if (suit === info.opening.strain || suit === info.overcall.strain ||
        context.handFacts.lengths[suit] < 5) {
      return false;
    }
    const call = cheapestBidInStrainAfter(info.responderRaise, suit);
    const bid = call === null ? null : parseSuitBid(call);
    if (bid === null) return false;
    if (bid.level === 2) return context.handFacts.hcp >= 10;
    return bid.level === 3 && context.handFacts.hcp >= 12 &&
      hasPreemptSuitQuality(context.hand, suit);
  });
}

function hasQualifyingNewSuitAfterTakeoutRaise (
    context: RuleEvalContext,
    info: { opening: ParsedSuitBid; responderRaise: ParsedSuitBid },
): boolean {
  const points = context.handFacts.totalPointsWLength;
  return SUITS.some((suit) => {
    if (suit === info.opening.strain || context.handFacts.lengths[suit] < 5) {
      return false;
    }
    const call = cheapestBidInStrainAfter(info.responderRaise, suit);
    const bid = call === null ? null : parseSuitBid(call);
    if (bid === null) return false;
    if (bid.level === 2) return points >= 6 && points <= 11;
    return bid.level === 3 && points >= 9 && points <= 11 &&
      hasPreemptSuitQuality(context.hand, suit);
  });
}

export function overcallResponderRaisePassApplies (_call: Call, context: RuleEvalContext):
    AppliesWhenResult {
  const info = getNaturalSuitOvercallWithResponderRaise(context, 1);
  if (info === null) {
    return { success: false, telemetryLines: ['FAIL: no supported overcall-and-raise auction.'] };
  }
  const support = context.handFacts.lengths[info.overcall.strain as Suit];
  const supportPoints = context.handFacts.totalPointsWShortage;
  const unbidSuits = SUITS.filter((suit) =>
    suit !== info.opening.strain && suit !== info.overcall.strain);
  const hasRaise = (support >= 4 && supportPoints <= 6) ||
    (support >= 3 && supportPoints >= 6);
  const hasResponsiveDouble = support < 3 && context.handFacts.totalPointsWLength >= 7 &&
    hasResponsiveShape(context, unbidSuits);
  const success = ! hasRaise && ! hasResponsiveDouble &&
    ! hasQualifyingNewSuitAfterOvercallRaise(context, info);
  return { success, telemetryLines: [success ?
    'PASS: no preferred raise, natural new suit, or responsive double.' :
    'FAIL: a descriptive competitive action is available after responder raises.'] };
}

export function refineAdvancerRaiseAfterResponderRaise (
    calls: Call[], context: RuleEvalContext, jump: 0 | 1): CallRefinementResult {
  return refineAdvancerRaiseAfterResponderRaiseForLevel(calls, context, jump, 1);
}

function refineAdvancerRaiseAfterResponderRaiseForLevel (
    calls: Call[], context: RuleEvalContext, jump: 0 | 1,
    overcallLevel: 1 | 2): CallRefinementResult {
  const info = getNaturalSuitOvercallWithResponderRaise(context, overcallLevel);
  if (info === null) return { calls: [], telemetryLines: [] };
  const cheapest = cheapestBidInStrainAfter(info.responderRaise, info.overcall.strain);
  const parsedCheapest = cheapest === null ? null : parseSuitBid(cheapest);
  return { calls: parsedCheapest === null ? [] : calls.filter((call) => {
    const bid = parseSuitBid(call);
    return bid !== null && bid.strain === info.overcall.strain &&
      bid.level === parsedCheapest.level + jump;
  }), telemetryLines: [] };
}

export function refineAdvancerTwoLevelRaiseAfterResponderRaise (
    calls: Call[], context: RuleEvalContext): CallRefinementResult {
  return refineAdvancerRaiseAfterResponderRaiseForLevel(calls, context, 0, 2);
}

export function refineAdvancerCuebidAfterResponderRaise (calls: Call[], context: RuleEvalContext):
    CallRefinementResult {
  return refineAdvancerCuebidAfterResponderRaiseForLevel(calls, context, 1);
}

function refineAdvancerCuebidAfterResponderRaiseForLevel (
    calls: Call[], context: RuleEvalContext, overcallLevel: 1 | 2): CallRefinementResult {
  const info = getNaturalSuitOvercallWithResponderRaise(context, overcallLevel);
  return { calls: info === null ? [] : calls.filter((call) =>
    cheapestBidInStrainAfter(info.responderRaise, info.opening.strain) === call),
    telemetryLines: [] };
}

export function refineAdvancerTwoLevelCuebidAfterResponderRaise (
    calls: Call[], context: RuleEvalContext): CallRefinementResult {
  return refineAdvancerCuebidAfterResponderRaiseForLevel(calls, context, 2);
}

export function refineAdvancerNewSuitAfterResponderRaise (
    calls: Call[], context: RuleEvalContext, level: 2 | 3): CallRefinementResult {
  return refineAdvancerNewSuitAfterResponderRaiseForLevel(calls, context, level, 1);
}

function refineAdvancerNewSuitAfterResponderRaiseForLevel (
    calls: Call[], context: RuleEvalContext, level: 2 | 3,
    overcallLevel: 1 | 2): CallRefinementResult {
  const info = getNaturalSuitOvercallWithResponderRaise(context, overcallLevel);
  return { calls: info === null ? [] : calls.filter((call) => {
    const bid = parseSuitBid(call);
    return bid !== null && bid.level === level && bid.strain !== 'NT' &&
      bid.strain !== info.opening.strain && bid.strain !== info.overcall.strain &&
      cheapestBidInStrainAfter(info.responderRaise, bid.strain) === call &&
      (level !== 3 || hasPreemptSuitQuality(context.hand, bid.strain as Suit));
  }), telemetryLines: [] };
}

export function refineAdvancerTwoLevelNewSuitAfterResponderRaise (
    calls: Call[], context: RuleEvalContext, level: 2 | 3): CallRefinementResult {
  return refineAdvancerNewSuitAfterResponderRaiseForLevel(calls, context, level, 2);
}

export function responsiveDoubleAfterOvercallRaiseApplies (_call: Call, context: RuleEvalContext):
    AppliesWhenResult {
  return responsiveDoubleAfterOvercallRaiseForLevel(context, 1, 7);
}

function responsiveDoubleAfterOvercallRaiseForLevel (
    context: RuleEvalContext, overcallLevel: 1 | 2, minPoints: number): AppliesWhenResult {
  const info = getNaturalSuitOvercallWithResponderRaise(context, overcallLevel);
  const unbidSuits = info === null ? [] : SUITS.filter((suit) =>
    suit !== info.opening.strain && suit !== info.overcall.strain);
  const support = info === null ? 0 : context.handFacts.lengths[info.overcall.strain as Suit];
  const success = info !== null && support < 3 &&
    context.handFacts.totalPointsWLength >= minPoints && hasResponsiveShape(context, unbidSuits);
  return { success, telemetryLines: [success ?
    `PASS: responsive double with ${minPoints}+ length points and both unbid suits.` :
    `FAIL: responsive double needs ${minPoints}+ length points, two four-card unbid suits, ` +
    'and no clear fit.'] };
}

export function twoLevelOvercallResponderRaisePassApplies (_call: Call, context: RuleEvalContext):
    AppliesWhenResult {
  const info = getNaturalSuitOvercallWithResponderRaise(context, 2);
  if (info === null) {
    return { success: false, telemetryLines: [
      'FAIL: no supported two-level overcall-and-raise auction.',
    ] };
  }
  const support = context.handFacts.lengths[info.overcall.strain as Suit];
  const supportPoints = context.handFacts.totalPointsWShortage;
  const unbidSuits = SUITS.filter((suit) =>
    suit !== info.opening.strain && suit !== info.overcall.strain);
  const hasRaise = support >= 3 && supportPoints >= 7;
  const hasResponsiveDouble = support < 3 && context.handFacts.totalPointsWLength >= 9 &&
    hasResponsiveShape(context, unbidSuits);
  const success = ! hasRaise && ! hasResponsiveDouble &&
    ! hasQualifyingNewSuitAfterOvercallRaise(context, info);
  return { success, telemetryLines: [success ?
    'PASS: no preferred raise, natural new suit, or responsive double.' :
    'FAIL: a descriptive competitive action is available after responder raises.'] };
}

export function responsiveDoubleAfterTwoLevelOvercallRaiseApplies (
    _call: Call, context: RuleEvalContext): AppliesWhenResult {
  return responsiveDoubleAfterOvercallRaiseForLevel(context, 2, 9);
}

export function takeoutResponderRaisePassApplies (_call: Call, context: RuleEvalContext):
    AppliesWhenResult {
  const info = getTakeoutDoubleWithResponderRaise(context);
  if (info === null) {
    return { success: false, telemetryLines: [
      'FAIL: no supported takeout-double-and-raise auction.',
    ] };
  }
  const points = context.handFacts.totalPointsWLength;
  const unbidSuits = SUITS.filter((suit) => suit !== info.opening.strain);
  const hasResponsiveDouble = points >= 6 && points <= 11 &&
    hasResponsiveShape(context, unbidSuits);
  const success = points < 12 && ! hasResponsiveDouble &&
    ! hasQualifyingNewSuitAfterTakeoutRaise(context, info);
  return { success, telemetryLines: [success ?
    'PASS: responder’s raise removes the obligation to advance partner’s takeout double.' :
    'FAIL: values and shape support a descriptive competitive action.'] };
}

export function refineTakeoutNewSuitAfterResponderRaise (
    calls: Call[], context: RuleEvalContext, level: 2 | 3): CallRefinementResult {
  const info = getTakeoutDoubleWithResponderRaise(context);
  return { calls: info === null ? [] : calls.filter((call) => {
    const bid = parseSuitBid(call);
    return bid !== null && bid.level === level && bid.strain !== 'NT' &&
      bid.strain !== info.opening.strain &&
      cheapestBidInStrainAfter(info.responderRaise, bid.strain) === call &&
      (level !== 3 || hasPreemptSuitQuality(context.hand, bid.strain as Suit));
  }), telemetryLines: [] };
}

export function refineTakeoutCuebidAfterResponderRaise (calls: Call[], context: RuleEvalContext):
    CallRefinementResult {
  const info = getTakeoutDoubleWithResponderRaise(context);
  return { calls: info === null ? [] : calls.filter((call) =>
    cheapestBidInStrainAfter(info.responderRaise, info.opening.strain) === call),
    telemetryLines: [] };
}

export function responsiveDoubleAfterTakeoutRaiseApplies (_call: Call, context: RuleEvalContext):
    AppliesWhenResult {
  const info = getTakeoutDoubleWithResponderRaise(context);
  const points = context.handFacts.totalPointsWLength;
  const unbidSuits = info === null ? [] : SUITS.filter((suit) => suit !== info.opening.strain);
  const success = info !== null && points >= 6 && points <= 11 &&
    hasResponsiveShape(context, unbidSuits);
  return { success, telemetryLines: [success ?
    'PASS: responsive double asks partner to choose among the unbid suits.' :
    'FAIL: responsive double needs 6-11 length points and at least two four-card unbid suits.'] };
}


/// Responder has bid a natural new suit or 1NT after a natural, non-jump suit overcall
/// by advancer's partner.  Raises, cuebids, and other responder actions are handled by
/// other families or intentionally remain unsupported.
///
function getNaturalSuitOvercallWithResponderNaturalAction (
    context: RuleEvalContext,
    overcallLevel: 1 | 2,
): { opening: ParsedSuitBid; overcall: ParsedSuitBid; responderAction: ParsedSuitBid } | null {
  if (context.stage !== 'advancing' ||
      getInterferenceAfterOpening(context.dealer, context.auction) !== 'suitOvercall') {
    return null;
  }
  const openingInfo = getOpeningCallInfo(context.dealer, context.auction);
  if (openingInfo === null || context.auction.length !== openingInfo.index + 3) {
    return null;
  }
  const opening = parseSuitBid(openingInfo.call);
  const overcallCall = context.auction[openingInfo.index + 1];
  const responderCall = context.auction[openingInfo.index + 2];
  const overcall = overcallCall === undefined ? null : parseSuitBid(overcallCall);
  const responderAction = responderCall === undefined ? null : parseSuitBid(responderCall);
  if (opening === null || opening.level !== 1 || opening.strain === 'NT' ||
      overcall === null || overcall.level !== overcallLevel || overcall.strain === 'NT' ||
      responderAction === null ||
      cheapestBidInStrainAfter(opening, overcall.strain) !== overcallCall) {
    return null;
  }
  const naturalOneNt = responderCall === '1NT' && overcallLevel === 1;
  const naturalNewSuit = responderAction.strain !== 'NT' &&
    responderAction.strain !== opening.strain && responderAction.strain !== overcall.strain &&
    cheapestBidInStrainAfter(overcall, responderAction.strain) === responderCall;
  return naturalOneNt || naturalNewSuit ? { opening, overcall, responderAction } : null;
}

function getNaturalSuitOvercallWithResponderNaturalActionAtEitherLevel (context: RuleEvalContext):
    { opening: ParsedSuitBid; overcall: ParsedSuitBid; responderAction: ParsedSuitBid } | null {
  return getNaturalSuitOvercallWithResponderNaturalAction(context, 1) ??
    getNaturalSuitOvercallWithResponderNaturalAction(context, 2);
}

function hasQualifyingNewSuitAfterResponderNaturalAction (
    context: RuleEvalContext,
    info: { opening: ParsedSuitBid; overcall: ParsedSuitBid; responderAction: ParsedSuitBid },
): boolean {
  return SUITS.some((suit) => {
    if (suit === info.opening.strain || suit === info.overcall.strain ||
        suit === info.responderAction.strain || context.handFacts.lengths[suit] < 5) {
      return false;
    }
    const call = cheapestBidInStrainAfter(info.responderAction, suit);
    const bid = call === null ? null : parseSuitBid(call);
    if (bid === null) return false;
    if (bid.level === 1) return context.handFacts.hcp >= 8;
    if (bid.level === 2) return context.handFacts.hcp >= 10;
    return bid.level === 3 && context.handFacts.hcp >= 12 &&
      hasPreemptSuitQuality(context.hand, suit);
  });
}

export function overcallResponderNaturalActionPassApplies (_call: Call, context: RuleEvalContext):
    AppliesWhenResult {
  const info = getNaturalSuitOvercallWithResponderNaturalActionAtEitherLevel(context);
  if (info === null) {
    return { success: false, telemetryLines: [
      'FAIL: no supported natural responder action after a suit overcall.',
    ] };
  }
  const support = context.handFacts.lengths[info.overcall.strain as Suit];
  const supportPoints = context.handFacts.totalPointsWShortage;
  const hasSupportAction = info.overcall.level === 1 ?
    support >= 4 || (support >= 3 && supportPoints >= 6) :
    support >= 3 && supportPoints >= 7;
  const success = context.handFacts.hcp <= 10 && ! hasSupportAction &&
    ! hasQualifyingNewSuitAfterResponderNaturalAction(context, info);
  return { success, telemetryLines: [success ?
    'PASS: responder has acted and no modeled natural competitive action is preferred.' :
    'FAIL: strength, fit, or a natural new suit supports a competitive action.'] };
}

export function refineAdvancerRaiseAfterResponderNaturalAction (
    calls: Call[], context: RuleEvalContext, overcallLevel: 1 | 2, jump: 0 | 1):
    CallRefinementResult {
  const info = getNaturalSuitOvercallWithResponderNaturalAction(context, overcallLevel);
  if (info === null) return { calls: [], telemetryLines: [] };
  const cheapest = cheapestBidInStrainAfter(info.responderAction, info.overcall.strain);
  const parsedCheapest = cheapest === null ? null : parseSuitBid(cheapest);
  return { calls: parsedCheapest === null ? [] : calls.filter((call) => {
    const bid = parseSuitBid(call);
    return bid !== null && bid.strain === info.overcall.strain &&
      bid.level === parsedCheapest.level + jump;
  }), telemetryLines: [] };
}

export function refineAdvancerCuebidAfterResponderNaturalAction (
    calls: Call[], context: RuleEvalContext): CallRefinementResult {
  const info = getNaturalSuitOvercallWithResponderNaturalActionAtEitherLevel(context);
  return { calls: info === null ? [] : calls.filter((call) =>
    cheapestBidInStrainAfter(info.responderAction, info.opening.strain) === call),
    telemetryLines: [] };
}

export function refineAdvancerNewSuitAfterResponderNaturalAction (
    calls: Call[], context: RuleEvalContext, level: 1 | 2 | 3): CallRefinementResult {
  const info = getNaturalSuitOvercallWithResponderNaturalActionAtEitherLevel(context);
  return { calls: info === null ? [] : calls.filter((call) => {
    const bid = parseSuitBid(call);
    return bid !== null && bid.level === level && bid.strain !== 'NT' &&
      bid.strain !== info.opening.strain && bid.strain !== info.overcall.strain &&
      bid.strain !== info.responderAction.strain &&
      cheapestBidInStrainAfter(info.responderAction, bid.strain) === call &&
      (level !== 3 || hasPreemptSuitQuality(context.hand, bid.strain as Suit));
  }), telemetryLines: [] };
}


/// Responder has bid an economical natural new suit or 1NT after advancer's partner
/// made a takeout double.  Because responder has acted, advancer is no longer compelled
/// to choose a suit with a weak hand.
///
function getTakeoutDoubleWithResponderNaturalAction (context: RuleEvalContext):
    { opening: ParsedSuitBid; responderAction: ParsedSuitBid } | null {
  if (context.stage !== 'advancing' ||
      getInterferenceAfterOpening(context.dealer, context.auction) !== 'takeoutDouble') {
    return null;
  }
  const openingInfo = getOpeningCallInfo(context.dealer, context.auction);
  if (openingInfo === null || context.auction.length !== openingInfo.index + 3 ||
      context.auction[openingInfo.index + 1] !== 'Double') {
    return null;
  }
  const opening = parseSuitBid(openingInfo.call);
  const responderCall = context.auction[openingInfo.index + 2];
  const responderAction = responderCall === undefined ? null : parseSuitBid(responderCall);
  if (opening === null || opening.level !== 1 || opening.strain === 'NT' ||
      responderAction === null) {
    return null;
  }
  const naturalOneNt = responderCall === '1NT';
  const naturalNewSuit = responderAction.strain !== 'NT' &&
    responderAction.strain !== opening.strain &&
    cheapestBidInStrainAfter(opening, responderAction.strain) === responderCall;
  return naturalOneNt || naturalNewSuit ? { opening, responderAction } : null;
}

function hasQualifyingNewSuitAfterTakeoutResponderNaturalAction (
    context: RuleEvalContext,
    info: { opening: ParsedSuitBid; responderAction: ParsedSuitBid },
): boolean {
  const points = context.handFacts.totalPointsWLength;
  return SUITS.some((suit) => {
    if (suit === info.opening.strain || suit === info.responderAction.strain ||
        context.handFacts.lengths[suit] < 5) {
      return false;
    }
    const call = cheapestBidInStrainAfter(info.responderAction, suit);
    const bid = call === null ? null : parseSuitBid(call);
    if (bid === null) return false;
    if (bid.level === 1 || bid.level === 2) return points >= 6 && points <= 11;
    return bid.level === 3 && points >= 9 && points <= 11 &&
      hasPreemptSuitQuality(context.hand, suit);
  });
}

export function takeoutResponderNaturalActionPassApplies (_call: Call, context: RuleEvalContext):
    AppliesWhenResult {
  const info = getTakeoutDoubleWithResponderNaturalAction(context);
  if (info === null) {
    return { success: false, telemetryLines: [
      'FAIL: no supported natural responder action after a takeout double.',
    ] };
  }
  const points = context.handFacts.totalPointsWLength;
  const success = points <= 11 &&
    ! hasQualifyingNewSuitAfterTakeoutResponderNaturalAction(context, info);
  return { success, telemetryLines: [success ?
    'PASS: responder has acted, so a weak hand need not advance the takeout double.' :
    'FAIL: values and a natural suit or strong cuebid support further action.'] };
}

export function refineTakeoutNewSuitAfterResponderNaturalAction (
    calls: Call[], context: RuleEvalContext, level: 1 | 2 | 3): CallRefinementResult {
  const info = getTakeoutDoubleWithResponderNaturalAction(context);
  return { calls: info === null ? [] : calls.filter((call) => {
    const bid = parseSuitBid(call);
    return bid !== null && bid.level === level && bid.strain !== 'NT' &&
      bid.strain !== info.opening.strain && bid.strain !== info.responderAction.strain &&
      cheapestBidInStrainAfter(info.responderAction, bid.strain) === call &&
      (level !== 3 || hasPreemptSuitQuality(context.hand, bid.strain as Suit));
  }), telemetryLines: [] };
}

export function refineTakeoutCuebidAfterResponderNaturalAction (
    calls: Call[], context: RuleEvalContext): CallRefinementResult {
  const info = getTakeoutDoubleWithResponderNaturalAction(context);
  return { calls: info === null ? [] : calls.filter((call) =>
    cheapestBidInStrainAfter(info.responderAction, info.opening.strain) === call),
    telemetryLines: [] };
}


/// Responder's negative Double after a natural suit overcall is artificial and does not
/// consume bidding space.  These helpers preserve the actual overcall level and let advancer
/// choose among support, notrump, a clear side suit, Pass, or a strength-showing Redouble.
///
function getNaturalSuitOvercallWithResponderNegativeDouble (
    context: RuleEvalContext,
    overcallLevel?: 1 | 2,
): { opening: ParsedSuitBid; overcall: ParsedSuitBid } | null {
  if (context.stage !== 'advancing' ||
      getInterferenceAfterOpening(context.dealer, context.auction) !== 'suitOvercall') {
    return null;
  }
  const openingInfo = getOpeningCallInfo(context.dealer, context.auction);
  if (openingInfo === null || context.auction.length !== openingInfo.index + 3 ||
      context.auction[openingInfo.index + 2] !== 'Double') {
    return null;
  }
  const opening = parseSuitBid(openingInfo.call);
  const overcallCall = context.auction[openingInfo.index + 1];
  const overcall = overcallCall === undefined ? null : parseSuitBid(overcallCall);
  if (opening === null || opening.level !== 1 || opening.strain === 'NT' ||
      overcall === null || overcall.strain === 'NT' ||
      (overcall.level !== 1 && overcall.level !== 2) ||
      (overcallLevel !== undefined && overcall.level !== overcallLevel) ||
      cheapestBidInStrainAfter(opening, overcall.strain) !== overcallCall) {
    return null;
  }
  return { opening, overcall };
}

function hasSelectedNewSuitAfterNegativeDouble (
    context: RuleEvalContext,
    info: { opening: ParsedSuitBid; overcall: ParsedSuitBid },
): boolean {
  const impliedSuits = getNegativeDoubleImpliedSuits(info.opening, info.overcall);
  return SUITS.some((suit) => {
    if (suit === info.opening.strain || suit === info.overcall.strain ||
        impliedSuits.includes(suit) || context.handFacts.lengths[suit] < 5) {
      return false;
    }
    const call = cheapestBidInStrainAfter(info.overcall, suit);
    const bid = call === null ? null : parseSuitBid(call);
    return bid !== null && bid.level === 2 && context.handFacts.hcp >= 10;
  });
}

function hasNaturalNotrumpAfterNegativeDouble (
    context: RuleEvalContext,
    info: { opening: ParsedSuitBid; overcall: ParsedSuitBid },
): boolean {
  if (! context.handFacts.balanced ||
      ! hasBasicSuitStopper(context, info.opening.strain as Suit)) {
    return false;
  }
  const hcp = context.handFacts.hcp;
  if (info.overcall.level === 1) return hcp >= 8 && hcp <= 14;
  return hcp >= 11 && hcp <= 13;
}

function hasStrongSupportCuebidAfterNegativeDouble (
    context: RuleEvalContext,
    info: { opening: ParsedSuitBid; overcall: ParsedSuitBid },
): boolean {
  const support = context.handFacts.lengths[info.overcall.strain as Suit];
  return support >= 3 && context.handFacts.totalPointsWShortage >= 11;
}

export function overcallNegativeDoublePassApplies (_call: Call, context: RuleEvalContext):
    AppliesWhenResult {
  const info = getNaturalSuitOvercallWithResponderNegativeDouble(context);
  if (info === null) {
    return { success: false, telemetryLines: [
      'FAIL: no supported negative-Double auction after a natural suit overcall.',
    ] };
  }
  const support = context.handFacts.lengths[info.overcall.strain as Suit];
  const supportPoints = context.handFacts.totalPointsWShortage;
  const hasSupportAction = info.overcall.level === 1 ?
    support >= 4 || (support >= 3 && supportPoints >= 6) :
    support >= 3 && supportPoints >= 7;
  const success = context.handFacts.hcp < 10 && ! hasSupportAction &&
    ! hasNaturalNotrumpAfterNegativeDouble(context, info) &&
    ! hasSelectedNewSuitAfterNegativeDouble(context, info);
  return { success, telemetryLines: [success ?
    'PASS: responder’s negative Double leaves no preferred constructive advance.' :
    'FAIL: strength, fit, notrump shape, or a clear side suit supports another action.'] };
}

export function refineAdvancerRaiseAfterNegativeDouble (
    calls: Call[], context: RuleEvalContext, overcallLevel: 1 | 2, jump: 0 | 1):
    CallRefinementResult {
  const info = getNaturalSuitOvercallWithResponderNegativeDouble(context, overcallLevel);
  if (info === null) return { calls: [], telemetryLines: [] };
  const cheapest = cheapestBidInStrainAfter(info.overcall, info.overcall.strain);
  const parsedCheapest = cheapest === null ? null : parseSuitBid(cheapest);
  return { calls: parsedCheapest === null ? [] : calls.filter((call) => {
    const bid = parseSuitBid(call);
    return bid !== null && bid.strain === info.overcall.strain &&
      bid.level === parsedCheapest.level + jump;
  }), telemetryLines: [] };
}

export function refineAdvancerCuebidAfterNegativeDouble (
    calls: Call[], context: RuleEvalContext): CallRefinementResult {
  const info = getNaturalSuitOvercallWithResponderNegativeDouble(context);
  return { calls: info === null ? [] : calls.filter((call) =>
    cheapestBidInStrainAfter(info.overcall, info.opening.strain) === call),
    telemetryLines: [] };
}

export function naturalNotrumpAfterNegativeDoubleApplies (call: Call, context: RuleEvalContext):
    AppliesWhenResult {
  const info = getNaturalSuitOvercallWithResponderNegativeDouble(context);
  if (info === null || ! context.handFacts.balanced ||
      ! hasBasicSuitStopper(context, info.opening.strain as Suit)) {
    return { success: false, telemetryLines: [
      'FAIL: natural NT needs the supported negative-Double auction, balance, and ' +
      'opener-suit stopper.',
    ] };
  }
  const hcp = context.handFacts.hcp;
  const success = info.overcall.level === 1 ?
    (call === '1NT' && hcp >= 8 && hcp <= 11) ||
      (call === '2NT' && hcp >= 12 && hcp <= 14) :
    call === '2NT' && hcp >= 11 && hcp <= 13;
  return { success, telemetryLines: [success ?
    'PASS: natural NT advance has the modeled range, balance, and opener-suit stopper.' :
    'FAIL: natural NT strength does not match the overcall level.'] };
}

export function refineSelectedNewSuitAfterNegativeDouble (
    calls: Call[], context: RuleEvalContext): CallRefinementResult {
  const info = getNaturalSuitOvercallWithResponderNegativeDouble(context);
  if (info === null) return { calls: [], telemetryLines: [] };
  const impliedSuits = getNegativeDoubleImpliedSuits(info.opening, info.overcall);
  return { calls: calls.filter((call) => {
    const bid = parseSuitBid(call);
    return bid !== null && bid.level === 2 && bid.strain !== 'NT' &&
      bid.strain !== info.opening.strain && bid.strain !== info.overcall.strain &&
      ! impliedSuits.includes(bid.strain as Suit) &&
      cheapestBidInStrainAfter(info.overcall, bid.strain) === call;
  }), telemetryLines: [] };
}

export function strengthRedoubleAfterNegativeDoubleApplies (_call: Call, context: RuleEvalContext):
    AppliesWhenResult {
  const info = getNaturalSuitOvercallWithResponderNegativeDouble(context);
  const success = info !== null && context.handFacts.hcp >= 10 &&
    ! hasStrongSupportCuebidAfterNegativeDouble(context, info) &&
    ! hasNaturalNotrumpAfterNegativeDouble(context, info) &&
    ! hasSelectedNewSuitAfterNegativeDouble(context, info);
  return { success, telemetryLines: [success ?
    'PASS: Redouble shows 10+ HCP when no clearer strong support, NT, or side-suit call applies.' :
    'FAIL: Redouble needs 10+ HCP and no preferred descriptive action.'] };
}


/// After responder Redoubles partner's takeout Double, an ordinary weak advancer should
/// escape economically rather than use the invitational jumps modeled after responder's Pass.
///
function getTakeoutDoubleWithResponderRedouble (context: RuleEvalContext): ParsedSuitBid | null {
  if (context.stage !== 'advancing' ||
      getInterferenceAfterOpening(context.dealer, context.auction) !== 'takeoutDouble') {
    return null;
  }
  const openingInfo = getOpeningCallInfo(context.dealer, context.auction);
  if (openingInfo === null || context.auction.length !== openingInfo.index + 3 ||
      context.auction[openingInfo.index + 1] !== 'Double' ||
      context.auction[openingInfo.index + 2] !== 'Redouble') {
    return null;
  }
  const opening = parseSuitBid(openingInfo.call);
  return opening !== null && opening.level === 1 && opening.strain !== 'NT' ? opening : null;
}

export function refineTakeoutEscapeAfterResponderRedouble (
    calls: Call[], context: RuleEvalContext): CallRefinementResult {
  const opening = getTakeoutDoubleWithResponderRedouble(context);
  if (opening === null) return { calls: [], telemetryLines: [] };
  const unbidSuits = SUITS.filter((suit) => suit !== opening.strain);
  const hasFourCardUnbidSuit = unbidSuits.some((suit) => context.handFacts.lengths[suit] >= 4);
  const qualifying = calls.filter((call) => {
    const bid = parseSuitBid(call);
    if (bid === null || bid.strain === 'NT' || bid.strain === opening.strain) return false;
    const suit = bid.strain as Suit;
    const length = context.handFacts.lengths[suit];
    if (length < 4 && (hasFourCardUnbidSuit || length !== 3)) return false;
    return cheapestBidInStrainAfter(opening, suit) === call;
  });
  qualifying.sort((left, right) => {
    const leftSuit = parseSuitBid(left)!.strain as Suit;
    const rightSuit = parseSuitBid(right)!.strain as Suit;
    const lengthDifference =
      context.handFacts.lengths[rightSuit] - context.handFacts.lengths[leftSuit];
    if (lengthDifference !== 0) return lengthDifference;
    if (leftSuit === 'H' && rightSuit === 'S') return context.handFacts.lengths.H >= 5 ? 1 : -1;
    if (leftSuit === 'S' && rightSuit === 'H') return context.handFacts.lengths.S >= 5 ? -1 : 1;
    return 0;
  });
  return { calls: qualifying, telemetryLines: [] };
}


/// Advances of partner's preemptive jump overcall are restricted to a one-level
/// suit opening, an actual jump in a different suit, and responder's Pass.
/// This is distinct from an economical two-level overcall.
function getJumpOvercallForAdvancer (context: RuleEvalContext):
    { opening: ParsedSuitBid; overcall: ParsedSuitBid } | null {
  if (context.stage !== 'advancing' ||
      getInterferenceAfterOpening(context.dealer, context.auction) !== 'jumpSuitOvercall') {
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
      overcall === null || overcall.strain === 'NT' || overcall.strain === opening.strain ||
      overcall.level < 2 || overcall.level > 4) {
    return null;
  }
  const cheapest = cheapestBidInStrainAfter(opening, overcall.strain);
  const parsedCheapest = cheapest === null ? null : parseSuitBid(cheapest);
  return parsedCheapest !== null && overcall.level > parsedCheapest.level ?
    { opening, overcall } : null;
}

/// Limited advancer values and insufficient fit favor Pass after a lower-level
/// jump. After a four-level preempt, Pass remains normal regardless of HCP.
export function jumpOvercallPassApplies (_call: Call, context: RuleEvalContext):
    AppliesWhenResult {
  const info = getJumpOvercallForAdvancer(context);
  const hcp = context.handFacts.hcp;
  const support = info === null ? 0 : context.handFacts.lengths[info.overcall.strain as Suit];
  const success = info !== null && (info.overcall.level === 4 ||
    (hcp <= 11 && support < (info.overcall.level === 3 ? 4 : 3)));
  return { success, telemetryLines: [success ?
    'PASS: leave partner’s preempt in place.' :
    'FAIL: Pass requires a preemptive jump overcall with no preferred further action.'] };
}

/// A two-level jump promises six trumps, so a modest raise with three-card support
/// competes at three.  After a seven-card three-level jump, require four trumps
/// for a conservative, preemptive minor-suit raise to four.
export function refineJumpOvercallRaise (calls: Call[], context: RuleEvalContext):
    CallRefinementResult {
  const info = getJumpOvercallForAdvancer(context);
  if (info === null) {
    return { calls: [], telemetryLines: [] };
  }
  const suit = info.overcall.strain as Suit;
  const targetLevel = info.overcall.level + 1;
  const suitable = (info.overcall.level === 2 && context.handFacts.lengths[suit] >= 3) ||
    (info.overcall.level === 3 && (suit === 'C' || suit === 'D') &&
     context.handFacts.lengths[suit] >= 4);
  return { calls: suitable ? calls.filter((call) =>
    call === `${targetLevel}${suit}`) : [], telemetryLines: [] };
}

/// A major game needs a good trump fit and some useful values.  Partner's
/// two-level jump typically shows six trumps; a three-level jump shows seven.
export function refineJumpOvercallMajorGame (calls: Call[], context: RuleEvalContext):
    CallRefinementResult {
  const info = getJumpOvercallForAdvancer(context);
  if (info === null || (info.overcall.strain !== 'H' && info.overcall.strain !== 'S')) {
    return { calls: [], telemetryLines: [] };
  }
  const suit = info.overcall.strain;
  const support = context.handFacts.lengths[suit];
  return { calls: (info.overcall.level === 2 && support >= 4) ||
                  (info.overcall.level === 3 && support >= 3) ?
    calls.filter((call) => call === `4${suit}`) : [], telemetryLines: [] };
}

/// A new suit after a preempt is forcing, unlike a casual preference.
/// Require an economical call no higher than the three level and a good suit;
/// any jump-new-suit advance or four-level new suit remains unsupported.
export function refineJumpOvercallNewSuit (calls: Call[], context: RuleEvalContext):
    CallRefinementResult {
  const info = getJumpOvercallForAdvancer(context);
  return { calls: info === null ? [] : calls.filter((call) => {
    const bid = parseSuitBid(call);
    return bid !== null && bid.strain !== 'NT' && bid.level <= 3 &&
      bid.strain !== info.overcall.strain && bid.strain !== info.opening.strain &&
      cheapestBidInStrainAfter(info.overcall, bid.strain) === call &&
      hasPreemptSuitQuality(context.hand, bid.strain as Suit);
  }), telemetryLines: [] };
}
