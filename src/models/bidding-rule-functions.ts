/// Bidding rule call refiners, appliesWhen functions, and their shared helpers.

import { biddingBaseline, oneNtResponseHcpShift, STRAIN_ORDER, type AppliesWhenResult, type BiddingSystem, type Call,
         type CallRefinementResult, type RuleEvalContext, type SuitBid }
  from './bidding-types';
import { getCardsForSuit, hasPreemptSuitQuality, hasTwoOfTopThreeHonors, SUITS, type Suit } from './cards';
import { cheapestBidInStrainAfter, cheapestNewSuitBid, compareSuitBids, getOpeningCallInfo,
         getPartnerOpeningCall, getResponderCall, openerRebidIsReverse, parseSuitBid,
         type ParsedSuitBid } from './auction';

///
//// Bidding Rule Bid Refinements
///

/// refineNtStaymanReply selects the reply one level above a natural 1NT or 2NT opening.
/// Separate declarative rules decide whether opener has no four-card major, hearts, or spades.
export function refineNtStaymanReply (calls: Call[], context: RuleEvalContext): CallRefinementResult {
  const opening = getOpenerOpeningBid(context);
  const response = getResponderBid(context);
  if (opening === null || response === null || opening.strain !== 'NT' ||
      (opening.level !== 1 && opening.level !== 2) ||
      response.strain !== 'C' || response.level !== opening.level + 1) {
    return { calls: [], telemetryLines: ['This is not a 1NT/2NT Stayman auction.'] };
  }
  const level = opening.level + 1;
  return {
    calls: calls.filter((call) => parseSuitBid(call)?.level === level),
    telemetryLines: [`Stayman replies are at the ${level} level.`],
  };
}

/// Normal Jacoby completion is compulsory; this first treatment does not model superaccepts.
export function refineNtJacobyCompletion (calls: Call[], context: RuleEvalContext):
    CallRefinementResult {
  const opening = getOpenerOpeningBid(context);
  const response = getResponderBid(context);
  if (opening === null || response === null || opening.strain !== 'NT' ||
      (opening.level !== 1 && opening.level !== 2) ||
      response.level !== opening.level + 1) {
    return { calls: [], telemetryLines: ['This is not a 1NT/2NT Jacoby transfer.'] };
  }
  const target = response.strain === 'D' ? 'H' : response.strain === 'H' ? 'S' : null;
  const wanted = target === null ? null : `${response.level}${target}` as SuitBid;
  return {
    calls: wanted === null ? [] : calls.filter((call) => call === wanted),
    telemetryLines: wanted === null ? ['Not a Jacoby transfer call.']
      : [`Complete the Jacoby transfer with ${wanted}.`],
  };
}

/// Texas over either natural notrump opening always completes at the four level.
export function refineNtTexasCompletion (calls: Call[], context: RuleEvalContext):
    CallRefinementResult {
  const opening = getOpenerOpeningBid(context);
  const response = getResponderBid(context);
  if (opening === null || response === null || opening.strain !== 'NT' ||
      (opening.level !== 1 && opening.level !== 2) || response.level !== 4) {
    return { calls: [], telemetryLines: ['This is not a 1NT/2NT Texas transfer.'] };
  }
  const wanted: Call | null = response.strain === 'D' ? '4H'
    : response.strain === 'H' ? '4S' : null;
  return {
    calls: wanted === null ? [] : calls.filter((call) => call === wanted),
    telemetryLines: wanted === null ? ['Not a Texas transfer call.']
      : [`Complete the Texas transfer with ${wanted}.`],
  };
}

/// refineOpenerNtResponderMajorToGame keeps four of responder's natural three-level major
/// after a 1NT or 2NT opening.
export function refineOpenerNtResponderMajorToGame (calls: Call[], context: RuleEvalContext):
    CallRefinementResult {
  const opening = getOpenerOpeningBid(context);
  const response = getResponderBid(context);
  if (opening === null || response === null || opening.strain !== 'NT' ||
      (opening.level !== 1 && opening.level !== 2) || response.level !== 3 ||
      (response.strain !== 'H' && response.strain !== 'S')) {
    return { calls: [], telemetryLines: ['No natural 1NT/2NT-3M auction is available.'] };
  }
  const wanted = `4${response.strain}` as SuitBid;
  return {
    calls: calls.filter((call) => call === wanted),
    telemetryLines: [`Keep the major game ${wanted} after responder's natural 3${response.strain}.`],
  };
}

/// refineOpenerNtMajorSlamControlBid keeps the cheapest side-suit control below game after a
/// direct 1NT-3M slam-interest response.  The agreed major is responder's six-card-or-longer suit.
/// Because the notrump opener is strictly balanced, the executable controls here are aces or kings.
///
export function refineOpenerNtMajorSlamControlBid (calls: Call[], context: RuleEvalContext):
    CallRefinementResult {
  const opening = getOpenerOpeningBid(context);
  const response = getResponderBid(context);
  if (opening === null || response === null || opening.level !== 1 || opening.strain !== 'NT' ||
      response.level !== 3 || (response.strain !== 'H' && response.strain !== 'S')) {
    return { calls: [], telemetryLines: ['No direct 1NT-3M slam-interest auction is available.'] };
  }
  const game = parseSuitBid(`4${response.strain}` as SuitBid)!;
  const legalControls = calls.filter((call) => {
    const candidate = parseSuitBid(call);
    // The control must be a side suit, bid as cheaply as possible after responder's 3M, and
    // remain below four of the agreed major so that 4M is still available as the stopping place.
    if (candidate === null || candidate.strain === 'NT' || candidate.strain === response.strain ||
        cheapestBidInStrainAfter(response, candidate.strain) !== call ||
        compareSuitBids(candidate, game) >= 0) {
      return false;
    }
    const cards = getCardsForSuit(context.hand, candidate.strain as Suit);
    // A natural 1NT opener has no singleton or void, so A/K are the relevant side-suit controls.
    return cards.some((card) => card.rank === 'A' || card.rank === 'K');
  });
  // Control-bid upward from the cheapest available suit.
  legalControls.sort((a, b) => compareSuitBids(parseSuitBid(a)!, parseSuitBid(b)!));
  const cheapestControl = legalControls[0];
  return {
    calls: cheapestControl === undefined ? [] : [cheapestControl],
    telemetryLines: [cheapestControl === undefined
      ? `No modeled side-suit A/K control is available below 4${response.strain}.`
      : `Use the cheapest available side-suit A/K control below game: ${cheapestControl}.`],
  };
}

/// refineOpenerLowerRankingSecondSuitRebid keeps only a natural lower-ranking second suit.
/// After 1C there is no lower-ranking suit; after 1D this resolves to 2C.  Higher-ranking
/// two-level calls are reverses and are deliberately left for the separate reverse rule.
///
export function refineOpenerLowerRankingSecondSuitRebid (calls: Call[], context: RuleEvalContext):
    CallRefinementResult {
  const opening = getOpenerOpeningBid(context);
  if (opening === null || opening.strain === 'NT') {
    return { calls: [], telemetryLines: ['No suit opening is available for a second-suit rebid.'] };
  }
  const openingIndex = STRAIN_ORDER.indexOf(opening.strain);
  const refined = calls.filter((call) => {
    const candidate = parseSuitBid(call);
    if (candidate === null || candidate.strain === 'NT' || candidate.strain === opening.strain) {
      return false;
    }
    return STRAIN_ORDER.indexOf(candidate.strain) < openingIndex &&
           cheapestNewSuitBid(opening, candidate.strain) === call;
  });
  return {
    calls: refined,
    telemetryLines: ['Keep only a cheapest lower-ranking second-suit rebid; exclude reverses.'],
  };
}


/// refineOpenerSplinterControlBid keeps the cheapest available side-suit control below four of the
/// agreed major when opener has slam-interest working values.  Working HCP discounts K/Q/J in
/// responder's splinter suit; the ace remains counted because the splinter does not distinguish a
/// singleton from a void, and an ace may not be a wasted high card against a void.  A control is A,
/// K, singleton, or void.
///
export function refineOpenerSplinterControlBid (calls: Call[], context: RuleEvalContext):
    CallRefinementResult {
  const opening = getOpenerOpeningBid(context);
  const response = getResponderBid(context);
  if (opening === null || response === null ||
      (opening.strain !== 'H' && opening.strain !== 'S') || response.strain === 'NT' ||
      response.strain === opening.strain) {
    return { calls: [], telemetryLines: ['No major-opening splinter auction is available.'] };
  }
  // Discount K/Q/J held opposite responder's announced shortness; keep the ace counted in this
  // deliberately simple approximation because the splinter does not distinguish singleton/void.
  const splinterSuit = response.strain as Suit;
  const wastedHcp = getCardsForSuit(context.hand, splinterSuit).reduce((total, card) => {
    if (card.rank === 'K') return total + 3;
    if (card.rank === 'Q') return total + 2;
    if (card.rank === 'J') return total + 1;
    return total;
  }, 0);
  const workingHcp = context.handFacts.hcp - wastedHcp;
  if (workingHcp < 15) {
    return { calls: [], telemetryLines: [
      `No splinter control bid: ${context.handFacts.hcp} HCP - ${wastedHcp} wasted K/Q/J points ` +
      `in ${splinterSuit} = ${workingHcp} working HCP; 15+ is the slam-interest threshold.`,
    ] };
  }
  // A control bid must be a side suit below game in the agreed major.  Exclude both the trump
  // suit and responder's already-announced splinter suit before examining opener's side suits.
  const game = parseSuitBid(`4${opening.strain}` as SuitBid)!;
  const legalControls = calls.filter((call) => {
    const candidate = parseSuitBid(call);
    if (candidate === null || candidate.strain === 'NT' || candidate.strain === opening.strain ||
        candidate.strain === response.strain) {
      return false;
    }
    if (cheapestBidInStrainAfter(response, candidate.strain) !== call ||
        compareSuitBids(candidate, game) >= 0) {
      return false;
    }
    const suit = candidate.strain as Suit;
    const cards = getCardsForSuit(context.hand, suit);
    // In opener's candidate side suit, A/K is a high-card control and singleton/void is a
    // shortness control.  The responder's splinter suit was excluded above.
    return cards.length <= 1 || cards.some((card) => card.rank === 'A' || card.rank === 'K');
  });
  // Control-bid upward from the cheapest available suit.
  legalControls.sort((a, b) => compareSuitBids(parseSuitBid(a)!, parseSuitBid(b)!));
  const cheapestControl = legalControls[0];
  return {
    calls: cheapestControl === undefined ? [] : [cheapestControl],
    telemetryLines: [
      `${workingHcp} working HCP after discounting K/Q/J in responder's ${splinterSuit} splinter.`,
      cheapestControl === undefined
        ? `No modeled side-suit control is available below 4${opening.strain}.`
        : `Use the cheapest available A/K/singleton/void control below game: ${cheapestControl}.`,
    ],
  };
}

/// refineOpenerReverseRebid keeps cheapest new-suit rebids that force responder above two of
/// opener's first suit to give simple preference.  The rule's appliesWhen separately enforces the
/// strength promised by the configured treatment.
///
export function refineOpenerReverseRebid (calls: Call[], context: RuleEvalContext):
    CallRefinementResult {
  const opening = getOpenerOpeningBid(context);
  const response = getResponderBid(context);
  if (opening === null || response === null || opening.strain === 'NT') {
    return { calls: [], telemetryLines: ['No suit opening and response are available for a reverse.'] };
  }
  const refined = calls.filter((call) => {
    const candidate = parseSuitBid(call);
    return candidate !== null && openerRebidIsReverse(opening, response, candidate);
  });
  return {
    calls: refined,
    telemetryLines: [
      "Keep only cheapest new-suit rebids that force responder above two of opener's first suit.",
    ],
  };
}

/// refineOpenerFiveCardMajorFallback allows a minimum Standard opener to repeat exactly five
/// cards only when a forcing two-level response leaves no descriptive rebid.  In particular,
/// a three-level lower second suit after 1S-2H is a strength-showing high reverse, not an
/// economical alternative for a minimum hand.
///
export function refineOpenerFiveCardMajorFallback (calls: Call[], context: RuleEvalContext):
    CallRefinementResult {
  const opening = getOpenerOpeningBid(context);
  const response = getResponderBid(context);
  if (opening === null || response === null ||
      (opening.strain !== 'S' && opening.strain !== 'H') ||
      response.level !== 2 || response.strain === 'NT' ||
      context.handFacts.lengths[opening.strain] !== 5) {
    return { calls: [], telemetryLines: ['Five-card fallback requires a major opening and natural two-level response.'] };
  }
  // A known fit or an ordinary minimum balanced NT rebid takes precedence over the fallback.
  const responderSuit = response.strain as Suit;
  const minSupport = opening.strain === 'S' && responderSuit === 'H' ? 3 : 4;
  if (context.handFacts.lengths[responderSuit] >= minSupport ||
      (context.handFacts.balanced && context.handFacts.hcp >= 12 &&
       context.handFacts.hcp <= 14)) {
    return { calls: [], telemetryLines: ['Responder support or a minimum balanced 2NT rebid is available.'] };
  }
  // An economical natural second suit is available only if it does not force preference higher.
  const hasEconomicalSecondSuit = SUITS.some((suit) => {
    if (suit === opening.strain || suit === responderSuit ||
        context.handFacts.lengths[suit] < 4) {
      return false;
    }
    const cheapest = cheapestBidInStrainAfter(response, suit);
    const candidate = cheapest === null ? null : parseSuitBid(cheapest);
    return candidate !== null && ! openerRebidIsReverse(opening, response, candidate);
  });
  if (hasEconomicalSecondSuit) {
    return { calls: [], telemetryLines: ['An economical natural four-card second suit is available.'] };
  }
  // With no descriptive call, show the five-card major rather than promise reverse strength.
  const wantedCall = `2${opening.strain}` as SuitBid;
  return {
    calls: calls.filter((call) => call === wantedCall),
    telemetryLines: ['Minimum Standard fallback: five-card major repeat because no natural rebid fits.'],
  };
}

/// refineOpenerNonReverseSecondSuitRebid keeps the cheapest natural new-suit rebids that are
/// not reverses.  Unlike a rank-only test, this correctly keeps 1C-1H-1S while rejecting
/// 1C-1H-2D, and it can also keep a lower-ranking two-level suit such as 1D-1H-2C.
///
export function refineOpenerNonReverseNewSuitRebid (calls: Call[], context: RuleEvalContext):
    CallRefinementResult {
  const opening = getOpenerOpeningBid(context);
  const response = getResponderBid(context);
  if (opening === null || response === null || opening.strain === 'NT') {
    return { calls: [], telemetryLines: ['No suit opening and response are available for rebid.'] };
  }
  const refined = calls.filter((call) => {
    const candidate = parseSuitBid(call);
    if (candidate === null || candidate.strain === 'NT' || candidate.strain === opening.strain ||
        candidate.strain === response.strain) {
      return false;
    }
    return cheapestBidInStrainAfter(response, candidate.strain) === call &&
           ! openerRebidIsReverse(opening, response, candidate);
  });
  return {
    calls: refined,
    telemetryLines: ['Keep cheapest natural second-suit rebids that are not reverses.'],
  };
}

/// refineOpenerNaturalJumpShiftRebid keeps a one-level jump in a new suit only when the
/// corresponding non-jump bid is not already a reverse.  For example 1C-1H-2S is a natural
/// maximum jump shift, while 1C-1H-3D is left to partnership agreement because 2D is a reverse.
///
export function refineOpenerNaturalJumpShiftRebid (calls: Call[], context: RuleEvalContext):
    CallRefinementResult {
  const opening = getOpenerOpeningBid(context);
  const response = getResponderBid(context);
  if (opening === null || response === null || opening.strain === 'NT') {
    return { calls: [], telemetryLines: ['No suit opening and response are available for a jump shift.'] };
  }
  const refined = calls.filter((call) => {
    const candidate = parseSuitBid(call);
    if (candidate === null || candidate.strain === 'NT' || candidate.strain === opening.strain ||
        candidate.strain === response.strain) {
      return false;
    }
    const cheapest = cheapestBidInStrainAfter(response, candidate.strain);
    if (cheapest === null) {
      return false;
    }
    const cheapestParsed = parseSuitBid(cheapest)!;
    return candidate.level === cheapestParsed.level + 1 &&
           ! openerRebidIsReverse(opening, response, cheapestParsed);
  });
  return {
    calls: refined,
    telemetryLines: ['Keep natural jump shifts whose non-jump new-suit bid is not a reverse.'],
  };
}

export function refineOpenerOpeningSuitToLevel (calls: Call[], context: RuleEvalContext,
                                                targetLevel: number): CallRefinementResult {
  const opening = getOpenerOpeningBid(context);
  if (opening === null || opening.strain === 'NT') {
    return { calls: [], telemetryLines: ['No suit opening is available to rebid.'] };
  }
  const wantedCall = `${targetLevel}${opening.strain}` as SuitBid;
  return {
    calls: calls.filter((call) => call === wantedCall),
    telemetryLines: [`Keep opener's ${wantedCall} rebid.`],
  };
}

/// refineOpenerOpeningSuitAtCheapestLevel repeats opener's suit at its cheapest legal level after
/// responder's actual call.
///
export function refineOpenerOpeningSuitAtCheapestLevel (
    calls: Call[], context: RuleEvalContext): CallRefinementResult {
  const opening = getOpenerOpeningBid(context);
  const response = getResponderBid(context);
  if (opening === null || response === null || opening.strain === 'NT') {
    return { calls: [], telemetryLines: ['No suit opening and response are available to repeat.'] };
  }
  const wantedCall = cheapestBidInStrainAfter(response, opening.strain);
  return {
    calls: wantedCall === null ? [] : calls.filter((call) => call === wantedCall),
    telemetryLines: wantedCall === null
      ? ["Opener's suit cannot be rebid legally after responder's call."]
      : [`Repeat opener's ${opening.strain} at the cheapest legal level: ${wantedCall}.`],
  };
}

/// refineOpenerNotrumpAtCheapestLevel keeps the cheapest legal notrump rebid after responder.
///
export function refineOpenerNotrumpAtCheapestLevel (
    calls: Call[], context: RuleEvalContext): CallRefinementResult {
  const response = getResponderBid(context);
  if (response === null) {
    return { calls: [], telemetryLines: ['No responder bid is available for a notrump rebid.'] };
  }
  const wantedCall = cheapestBidInStrainAfter(response, 'NT');
  return {
    calls: wantedCall === null ? [] : calls.filter((call) => call === wantedCall),
    telemetryLines: wantedCall === null
      ? ['No legal notrump rebid is available.']
      : [`Use the cheapest legal notrump rebid: ${wantedCall}.`],
  };
}

/// refineOpenerResponderSuitToGame raises responder's natural suit to its normal game level.
///
export function refineOpenerResponderSuitToGame (calls: Call[], context: RuleEvalContext):
    CallRefinementResult {
  const response = getResponderBid(context);
  if (response === null || response.strain === 'NT') {
    return { calls: [], telemetryLines: ['No responder suit is available to raise to game.'] };
  }
  const targetLevel = response.strain === 'H' || response.strain === 'S' ? 4 : 5;
  return refineOpenerRaiseResponderSuitToLevel(calls, context, targetLevel);
}


/// refineOpenerRaiseResponderSuitToLevel keeps the raise of responder's natural suit to the
/// requested level.  Three-card support is enough when responder's bid promised five cards:
/// non-jump 2H over 1S, or 2C over 1D in the current Standard and 2/1 treatments.  Otherwise opener
/// needs four-card support for a new suit shown by responder.
///
export function refineOpenerRaiseResponderSuitToLevel (calls: Call[], context: RuleEvalContext,
                                                       targetLevel: number): CallRefinementResult {
  const opening = getOpenerOpeningBid(context);
  const response = getResponderBid(context);
  if (opening === null || response === null || opening.strain === 'NT' ||
      response.strain === 'NT' || response.strain === opening.strain) {
    return { calls: [], telemetryLines: ['No responder new suit is available to raise.'] };
  }
  const responseSuit = response.strain as Suit;
  const responsePromisesFive = response.level === 2 &&
    ((opening.strain === 'S' && response.strain === 'H') ||
     (opening.strain === 'D' && response.strain === 'C'));
  const minSupport = responsePromisesFive ? 3 : 4;
  if (context.handFacts.lengths[responseSuit] < minSupport) {
    return {calls: [],
            telemetryLines: [
              `Responder's ${responseSuit} needs ${minSupport}+ cards of opener support; ` +
              `opener has ${context.handFacts.lengths[responseSuit]}.`,
            ],
    };
  }
  const wantedCall = `${targetLevel}${responseSuit}` as SuitBid;
  return {calls: calls.filter((call) => call === wantedCall),
          telemetryLines: [`Raise responder's ${responseSuit} to ${wantedCall}.`],
  };
} // refineOpenerRaiseResponderSuitToLevel()

/// refineOpenerRaiseResponderSuitOneLevel supports responder's natural suit one level above the
/// actual response, preserving bidding room in an auction already forced to game.
///
export function refineOpenerRaiseResponderSuitOneLevel (
    calls: Call[], context: RuleEvalContext): CallRefinementResult {
  const response = getResponderBid(context);
  if (response === null || response.strain === 'NT') {
    return { calls: [], telemetryLines: ['No responder suit is available for a one-level raise.'] };
  }
  const responseSuit = response.strain as Suit;
  if (context.handFacts.lengths[responseSuit] < 3) {
    return { calls: [], telemetryLines: [
      `Responder's strong jump-shift suit needs three-card opener support; opener has ` +
        `${context.handFacts.lengths[responseSuit]}.`,
    ] };
  }
  const wantedCall = `${response.level + 1}${response.strain}` as SuitBid;
  return {
    calls: calls.filter((call) => call === wantedCall),
    telemetryLines: [`Raise responder's ${response.strain} one level to ${wantedCall}.`],
  };
}

/// refineOpenerFourCardMajorUpTheLine keeps opener's cheapest four-card major rebids and orders
/// equal-length majors up the line.  This is the shared major-choice refinement for the Standard
/// and 2/1 continuations after 1D-2C; the rules separately decide whether the bid promises extra
/// strength or first denies five diamonds.
///
export function refineOpenerFourCardMajorUpTheLine (calls: Call[], context: RuleEvalContext):
    CallRefinementResult {
  const legalResult = refineOpenerNewSuitAtCheapestLevel(calls, context);
  let majors = legalResult.calls
    .map((call) => {
      const candidate = parseSuitBid(call)!;
      const suit = candidate.strain as Suit;
      return { call, suit, length: context.handFacts.lengths[suit] };
    })
    .filter((candidate) =>
      (candidate.suit === 'H' || candidate.suit === 'S') && candidate.length >= 4);
  if (majors.length > 1) {
    majors = orderMajorSuitCandidates(majors);
  }
  return {
    calls: majors.map((candidate) => candidate.call),
    telemetryLines: [
      ...legalResult.telemetryLines,
      'Keep four-card major rebids; with equal four-card majors, bid hearts before spades.',
    ],
  };
}

/// refineOpenerNewSuitAtCheapestLevel keeps opener's cheapest legal second-suit calls after
/// responder's actual call.  suitOrder can restrict the second suit to lower- or higher-ranking
/// than opener's first suit; higher is the reverse case (17+ points) in the current uncontested
/// rules.
///
export function refineOpenerNewSuitAtCheapestLevel (
    calls: Call[], context: RuleEvalContext, suitOrder: 'any' | 'lower' | 'higher' = 'any'):
    CallRefinementResult {
  const opening = getOpenerOpeningBid(context);
  const response = getResponderBid(context);
  if (opening === null || response === null || opening.strain === 'NT') {
    return { calls: [], telemetryLines: ['No suit opening and response are available for rebid.'] };
  }
  const openingIndex = STRAIN_ORDER.indexOf(opening.strain);
  const refined = calls.filter((call) => {
    const candidate = parseSuitBid(call);
    if (candidate === null || candidate.strain === 'NT' || candidate.strain === opening.strain ||
        candidate.strain === response.strain) {
      return false;
    }
    const candidateIndex = STRAIN_ORDER.indexOf(candidate.strain);
    if (suitOrder === 'lower' && candidateIndex >= openingIndex) {
      return false;
    }
    if (suitOrder === 'higher' && candidateIndex <= openingIndex) {
      return false;
    }
    return cheapestBidInStrainAfter(response, candidate.strain) === call;
  });
  return {
    calls: refined,
    telemetryLines: [`Keep cheapest ${suitOrder} new-suit rebids after responder's call.`],
  };
}

/// refineOpenerNewSuitByExtraLevels keeps opener new-suit calls a fixed number of levels above the
/// cheapest legal call after responder.  This covers strong jump shifts and opener-side splinters.
///
export function refineOpenerNewSuitByExtraLevels (
    calls: Call[], context: RuleEvalContext, extraLevels: number,
    suitOrder: 'any' | 'lower' | 'higher', label: string): CallRefinementResult {
  const opening = getOpenerOpeningBid(context);
  const response = getResponderBid(context);
  if (opening === null || response === null || opening.strain === 'NT') {
    return { calls: [], 
             telemetryLines: [`No suit opening and response are available for ${label}.`] };
  }
  const openingIndex = STRAIN_ORDER.indexOf(opening.strain);
  const refined = calls.filter((call) => {
    const candidate = parseSuitBid(call);
    if (candidate === null || candidate.strain === 'NT' || candidate.strain === opening.strain ||
        candidate.strain === response.strain) {
      return false;
    }
    const candidateIndex = STRAIN_ORDER.indexOf(candidate.strain);
    if (suitOrder === 'lower' && candidateIndex >= openingIndex) {
      return false;
    }
    if (suitOrder === 'higher' && candidateIndex <= openingIndex) {
      return false;
    }
    const cheapest = cheapestBidInStrainAfter(response, candidate.strain);
    if (cheapest === null) {
      return false;
    }
    const cheapestParsed = parseSuitBid(cheapest)!;
    return candidate.level === cheapestParsed.level + extraLevels;
  });
  return { calls: refined, telemetryLines: [`Keep only ${label} calls after responder's bid.`] };
}

/// refineForcingOneNtMinorFallback supplies the awkward rebid required by a completely forcing
/// 1NT response when opener has no normal descriptive rebid.  Prefer the longer three-card-or-
/// longer minor, choosing clubs when the minors are equal.
///
export function refineForcingOneNtMinorFallback (calls: Call[], context: RuleEvalContext):
    CallRefinementResult {
  const opening = getOpenerOpeningBid(context);
  const response = getResponderBid(context);
  // Ensure our situation is suit opening followed by 1NT ...
  if (opening === null || response === null || opening.strain === 'NT' || response.strain !== 'NT') {
    return { calls: [], telemetryLines: ['Forcing-1NT minor fallback needs a major opening and 1NT.'] };
  }
  // if there are natural bids in this situation, don't look for rare minor bid ...
  const openingSuit = opening.strain as Suit;
  if (context.handFacts.lengths[openingSuit] >= 6) {
    return { calls: [], telemetryLines: ['Six-card opening major supplies a normal rebid.'] };
  }
  if (context.handFacts.hcp >= 18 && context.handFacts.hcp <= 19 &&
      context.handFacts.balancedOrSemiBalanced) {
    return { calls: [], telemetryLines: ['18-19 balanced/semi-balanced hand can rebid 2NT.'] };
  }
  // if a 4+ card suit ranked below the opening major, can bid it 2 level, so stop trying minor.
  const openingIndex = STRAIN_ORDER.indexOf(opening.strain);
  const hasNaturalLowerSecondSuit = SUITS.some((suit) =>
    suit !== openingSuit && STRAIN_ORDER.indexOf(suit) < openingIndex &&
    context.handFacts.lengths[suit] >= 4);
  if (hasNaturalLowerSecondSuit) {
    return { calls: [], telemetryLines: ['A natural lower-ranking four-card second suit is available.'] };
  }
  // If have points to reverse, and have reverse suit to bid, stop looking for minor
  const hasStrengthForReverse = context.handFacts.totalPointsWLength >= 17;
  const hasHigherSecondSuit = SUITS.some((suit) =>
    suit !== openingSuit && STRAIN_ORDER.indexOf(suit) > openingIndex &&
    context.handFacts.lengths[suit] >= 4);
  if (hasStrengthForReverse && hasHigherSecondSuit) {
    return { calls: [], telemetryLines: ['A strength-qualified reverse is available.'] };
  }
  // No good bids, so if we have 3+ of a minor, we can use it to honor the forcing 1NT
  const minorCandidates = calls.filter((call) => {
    const candidate = parseSuitBid(call);
    return candidate !== null && candidate.level === 2 &&
           (candidate.strain === 'C' || candidate.strain === 'D') &&
           context.handFacts.lengths[candidate.strain] >= 3;
  });
  if (minorCandidates.length === 0) {
    return { calls: [], telemetryLines: ['No three-card minor is available for the fallback rebid.'] };
  }
  // With only one available minor, use it.  With both minors available, bid the longer one;
  let refined = minorCandidates;
  if (minorCandidates.length === 2) {
    if (context.handFacts.lengths.C > context.handFacts.lengths.D) {
      refined = ['2C'];
    } else if (context.handFacts.lengths.D > context.handFacts.lengths.C) {
      refined = ['2D'];
    } else {
      refined = ['2C']; // if equal len, convention is bid clubs
    }
  }
  return {
    calls: refined,
    telemetryLines: ['No normal rebid is available; manufacture the best three-card minor rebid.'],
  };
}

/// refineSimpleRaise returns a simple raise one level above opening in the same suit.  Resolve the
/// 2H/2S or 2C/2D declaration to the one call matching the actual opening.
///
export function refineRaisePartnerSuitBy1 (calls: Call[], context: RuleEvalContext)
    : CallRefinementResult {
  const opening = getPartnerOpeningBid(context)!;
  // if (opening === null) {
  //   return { calls: [], telemetryLines: ['No opening bid is available for a simple raise.'] };
  // }
  return refineRaiseToLevel(calls, context, opening.level + 1);
}

/// refineLimitRaise chooses a bid two levels above partner's one-level suit opening.  Resolve
/// the several declared raise calls to the suit the partner actually opened.
///
export function refineRaisePartnerSuitBy2 (calls: Call[], context: RuleEvalContext)
    : CallRefinementResult {
  const opening = getPartnerOpeningBid(context)!;
  // if (opening === null) {
  //   return { calls: [], telemetryLines: ['No opening bid is available for a limit raise.'] };
  // }
  return refineRaiseToLevel(calls, context, opening.level + 2);
}

/// refineRaiseToLevel chooses the call that raises partner's bid suit to targetLevel.  This is the
/// shared mechanism used by simple, jump, and direct game raises.
///
export function refineRaiseToLevel (calls: Call[], context: RuleEvalContext,
                             targetLevel: number): CallRefinementResult {
  const opening = getPartnerOpeningBid(context)!;
  // if (opening === null || opening.strain === 'NT') {
  //   return { calls: [], telemetryLines: ['No suit opening is available to raise.'] };
  // }
  const wantedCall = `${targetLevel}${opening.strain}` as SuitBid;
  const refined = calls.filter((call) => call === wantedCall);
  return {calls: refined,
          telemetryLines: [`Raise partner's ${opening.strain} to ${targetLevel}${opening.strain}.`] };
}

/// refineOneLevelNewSuitAfterMinor chooses among legal one-level new-suit responses after a
/// minor opening.  A candidate suit must be four cards or longer.
///
/// With convenient minors, finding a major fit has priority: choose the longest available major.
/// With equal four-card majors bid hearts before spades; with equal five-card-or-longer majors
/// bid spades before hearts.  After 1C with 6-10 HCP, a strictly longer diamond suit may remain
/// as a lower-preference alternative.
///
/// Without convenient minors, use ordinary longest-suit treatment across all eligible new suits.
///
export function refineOneLevelNewSuitAfterMinor (calls: Call[], context: RuleEvalContext) :
      CallRefinementResult {
  const legalResult = refineToCheapestNewSuitBids(calls, context);
  const opening = getPartnerOpeningBid(context)!;
  // get eligible 1 level calls with their suit and length support
  const eligible: { call: Call; suit: Suit; length: number }[] = [];
  for (const call of legalResult.calls) {
    const candidate = parseSuitBid(call)!;
    if (candidate.level !== 1) {continue;}
    const suit = candidate.strain as Suit;
    const length = context.handFacts.lengths[suit];
    if (length < 4) {continue;}
    eligible.push({ call, suit, length });
  }
  // if no good bids ...
  if (eligible.length === 0) {
    return {
      calls: [],
      telemetryLines: [
        ...legalResult.telemetryLines,
        'No four-card-or-longer new suit is available at the one level.',
      ],
    };
  }
  // Sort qualifying majors regarless of convenient minors agreement:
  // longer first, H before S if both have 4 cards, S before H each is 5+
  let majors = eligible.filter((candidate) => candidate.suit === 'H' || candidate.suit === 'S');
  if (majors.length > 1) {
    majors = orderMajorSuitCandidates(majors);
  }
  // Order based on opening, convenient minors, and majors
  if (biddingBaseline.convenientMinors && majors.length > 0) {
    if (majors.length === 2) {
      if (majors[0].length !== majors[1].length) {
        majors = [majors[0]];
      }
    }
    const refined = majors.map((candidate) => candidate.call);
    // With a minimum response after 1C, retain a genuinely longer diamond suit as a
    // lower-preference alternative.  Equal or shorter diamonds are suppressed by the major.
    if (opening.strain === 'C' && context.handFacts.hcp <= 10) {
      const diamond = eligible.find((candidate) => candidate.suit === 'D');
      // Alternative treatment: suppress 1D entirely whenever a 4+ major is available.
      // const refined = majors.map((candidate) => candidate.call);
      if (diamond !== undefined && diamond.length > majors[0].length) { // a longest major
        refined.push(diamond.call);
      }
    }
    return {calls: refined,
            telemetryLines: [
              ...legalResult.telemetryLines,
              'With convenient minors, prefer a 4+ card major; after 1C with 6-10 HCP, ' +
              'a longer 1D may remain as an alternative.',],};
  } // convenient minors and 4+ card majors exist
  // No major is available under the convenient-minor agreement, or convenient minors is off.
  // In either case use ordinary longest-suit treatment among the remaining eligible calls.
  // This code seems oddly super general and falsely clever, but we need to handle 0 majors, equal
  // majors, unequal majors, diamonds existence and their length, and it all falls out of this code.
  // First keep only equally longest suits.
  const longest = Math.max(...eligible.map((candidate) => candidate.length));
  const refined = eligible.filter((candidate) => candidate.length === longest);
  return {calls: refined.map((candidate) => candidate.call),
          telemetryLines: [
            ...legalResult.telemetryLines,
            `Keep longest one-level new suits (${longest} cards); ` +
            `${longest === 4 ? 'bid equal suits up the line'
                             : 'prefer the higher-ranking equal suit'}.`,
          ],
        };
} // refineOneLevelNewSuitAfterMinor()

/// orderMajorSuitCandidates orders the at-most-two major candidates by normal response priority:
/// longer major first; equal four-card majors up the line; equal five-card-or-longer majors down
/// the line.
///
function orderMajorSuitCandidates<T extends { suit: Suit; length: number }> (majors: T[]): T[] {
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

/// refineToCheapestNewSuitBids chooses the cheapest legal call in a new suit over partner's actual
/// opening suit, thereby emoving raises and jump shifts.  This does not yet choose among multiple
/// eligible suits by hand length or up-the-line/down-the-line preference; candidate hand
/// constraints do that only partially.
///
export function refineToCheapestNewSuitBids (calls: Call[], context: RuleEvalContext)
    : CallRefinementResult {
  const opening = getPartnerOpeningBid(context);
  // Most refiners don't need this check, and technically this function shouldn't, but it is used
  // enough places, let's be defensive.
  if (opening === null) {
    return { calls: [], telemetryLines: ['No opening bid is available for a new-suit response.'] };
  }
  const refined = calls.filter((call) => {
      const candidate = parseSuitBid(call);
      // This refiner is specifically for a new suit, never NT, and while all current rules have no
      // NT call candidates, this is defensive for future rules.
      if (candidate === null || candidate.strain === 'NT') {
        return false;
      }
      return cheapestNewSuitBid(opening, candidate.strain) === call;
    });
  return {calls: refined,
          telemetryLines: ['Keep only non-jump new-suit calls legal over the actual opening.'] };
}

/// refineMajorTwoLevelNewSuitByLength orders natural two-level responses by suit length.  With
/// equal five-card-or-longer suits prefer the higher-ranking suit so the lower suit can be shown
/// economically later; equal four-card suits stay up the line.  Lower choices remain visible.
///
export function refineMajorTwoLevelNewSuitByLength (
    calls: Call[], context: RuleEvalContext): CallRefinementResult {
  const legalResult = refineToCheapestNewSuitBids(calls, context);
  const candidates = legalResult.calls.map((call) => {
    const candidate = parseSuitBid(call)!;
    const suit = candidate.strain as Suit;
    return { call, suit, length: context.handFacts.lengths[suit] };
  });
  candidates.sort((left, right) => {
    if (left.length !== right.length) {
      return right.length - left.length;
    }
    const suitOrder = STRAIN_ORDER.indexOf(left.suit) - STRAIN_ORDER.indexOf(right.suit);
    return left.length >= 5 ? -suitOrder : suitOrder;
  });
  return {
    calls: candidates.map((candidate) => candidate.call),
    telemetryLines: [
      ...legalResult.telemetryLines,
      'Order two-level new suits by length; with equal 5+ suits bid the higher-ranking suit first.',
    ],
  };
}

/// refineThreeCardLimitRaiseOneNtFallback keeps 1NT for an exactly-three-card limit raise only
/// when responder cannot first show four or more spades over a 1H opening.  After 1S there is no
/// one-level new suit, so 1NT remains the catch-all route under either forcing or non-forcing
/// partnership treatment.
///
export function refineThreeCardLimitRaiseOneNtFallback (
    calls: Call[], context: RuleEvalContext): CallRefinementResult {
  const opening = getPartnerOpeningBid(context);
  if (opening !== null && opening.strain === 'H' && context.handFacts.lengths.S >= 4) {
    return {
      calls: [],
      telemetryLines: ['With 4+ spades over 1H, show 1S before later making the limit raise.'],
    };
  }
  return {
    calls,
    telemetryLines: ['No one-level new suit takes priority; keep 1NT as the three-card limit-raise route.'],
  };
}

/// refineThreeCardMajorSupportNewSuitFirst keeps only the one-level new-suit route for an 11-12
/// point hand with exactly three-card major support.  In practice this is 1H-1S with four or more
/// spades.  Otherwise responder uses the partnership's 1NT route and plans to invite later.
///
export function refineThreeCardMajorSupportNewSuitFirst (
    calls: Call[], context: RuleEvalContext): CallRefinementResult {
  const refined = refineMajorSupportNewSuitFirst(calls, context);
  return {
    calls: refined.calls.filter((call) => parseSuitBid(call)!.level === 1),
    telemetryLines: [
      ...refined.telemetryLines,
      'Keep a one-level new suit before the later three-card limit raise; otherwise use 1NT.',
    ],
  };
}

/// refineMajorSupportNewSuitFirst chooses the new suit used before a later raise of opener's major.
/// Keep legal new-suit responses to opening, requiring 4+ spades for 1H-1S, 5+ hearts for 1S-2H,
/// and 4+ cards for a new minor at the two level.  If no normally qualifying new suit is available,
/// allow a three-card minor as a fallback.  Do not retain that fallback when a normally qualifying
/// new suit exists.  Order surviving calls according to the preferred new-suit treatment.
///
export function refineMajorSupportNewSuitFirst (calls: Call[], context: RuleEvalContext) :
      CallRefinementResult {
  const legalResult = refineToCheapestNewSuitBids(calls, context);
  const opening = getPartnerOpeningBid(context)!;
  const normalCalls = legalResult.calls.filter((call) => {
    const candidate = parseSuitBid(call)!;
    const suit = candidate.strain as Suit;
    const length = context.handFacts.lengths[suit];
    if (candidate.strain === 'C' || candidate.strain === 'D') {
      return length >= 4;
    }
    if (opening.strain === 'H' && candidate.strain === 'S') {
      return length >= 4;
    }
    if (opening.strain === 'S' && candidate.strain === 'H') {
      return length >= 5;
    }
    return false;
  });
  if (normalCalls.length > 0) {
    return { calls: normalCalls,
             telemetryLines: [
               ...legalResult.telemetryLines,
               'Keep normally supported new suits for the major-support response.',],
    };
  }
  // check for minor fallback
  const fallbackMinorCalls = legalResult.calls.filter((call) => {
    const candidate = parseSuitBid(call)!;
    const suit = candidate.strain as Suit;
    return (suit === 'C' || suit === 'D') && context.handFacts.lengths[suit] === 3;
  });
  return {calls: fallbackMinorCalls,
          telemetryLines: [
            ...legalResult.telemetryLines,
            fallbackMinorCalls.length > 0
              ? 'No normal new suit is available; allow a three-card minor as the fallback.'
              : 'No normally supported new suit or three-card minor fallback is available.',],};
}

/// refinePreemptSuitQuality keeps only preempt calls whose candidate suit has enough concentrated
/// honor strength: at least two of the top three honors, or at least three of the top five.
/// HCP and suit length remain declarative constraints on the individual preempt rules.
///
export function refinePreemptSuitQuality (calls: Call[], context: RuleEvalContext) :
      CallRefinementResult {
  const refinedCalls = calls.filter((call) => {
    const candidate = parseSuitBid(call)!;
    const suit = candidate.strain as Suit; // only rules with suit calls use this refiner, no NT
    return hasPreemptSuitQuality(context.hand, suit);
  });

  return {
    calls: refinedCalls,
    telemetryLines: [
      'Keep preempt candidates with at least two of A/K/Q or at least three of A/K/Q/J/T.',
    ],
  };
}

/// refineJumpNewSuit chooses a jump to a new suit that is the cheapest legal bid in each suit.
/// This is a one liner so that it can be used in rule declaration to satisfy refineCandidates.
///
export function refineJumpNewSuit (calls: Call[], context: RuleEvalContext): CallRefinementResult {
  return refineNewSuitByExtraLevels(calls, context, 1, 'single-jump');
}

/// refineWeakJumpShift chooses one weak single-jump suit: six cards or longer, longest first, and
/// the higher-ranking suit when equally long.  Equal long suits are rare, but choosing one keeps
/// the practice recommendation deterministic.
///
export function refineWeakJumpShift (calls: Call[], context: RuleEvalContext): CallRefinementResult {
  const jumpResult = refineNewSuitByExtraLevels(calls, context, 1, 'weak jump-shift');
  const candidates = jumpResult.calls
    .map((call) => {
      const candidate = parseSuitBid(call)!;
      const suit = candidate.strain as Suit;
      return { call, suit, length: context.handFacts.lengths[suit] };
    })
    .filter((candidate) => candidate.length >= 6);
  if (candidates.length === 0) {
    return { calls: [], telemetryLines: [
      ...jumpResult.telemetryLines,
      'No six-card-or-longer suit is available for a weak jump shift.',
    ] };
  }

  const longestLength = Math.max(...candidates.map((candidate) => candidate.length));
  const longest = candidates.filter((candidate) => candidate.length === longestLength);
  longest.sort((left, right) => STRAIN_ORDER.indexOf(right.suit) - STRAIN_ORDER.indexOf(left.suit));
  const selected = longest[0]!;
  return {
    calls: [selected.call],
    telemetryLines: [
      ...jumpResult.telemetryLines,
      `Choose the longest weak jump-shift suit; with equal length prefer the higher-ranking suit: ` +
        `${selected.call}.`,
    ],
  };
}

/// refineStrongJumpShift keeps a classic strong single-jump response only for a one-suited hand.
/// The jump suit must be 5+ cards with at least 5 HCP.  With two 5+ unbid suits, respond naturally
/// in the higher-ranking suit first and plan to show the lower-ranking suit later.
///
export function refineStrongJumpShift (calls: Call[], context: RuleEvalContext): CallRefinementResult {
  const opening = getPartnerOpeningBid(context);
  if (opening === null || opening.strain === 'NT') {
    return { calls: [], telemetryLines: ['A strong jump shift needs a one-level suit opening.'] };
  }

  const fiveCardNewSuits = SUITS.filter((suit) =>
    suit !== opening.strain && context.handFacts.lengths[suit] >= 5);
  if (fiveCardNewSuits.length !== 1) {
    return { calls: [], telemetryLines: [
      fiveCardNewSuits.length > 1
        ? 'With two 5+ new suits, respond naturally in the higher-ranking suit rather than jump shift.'
        : 'No five-card-or-longer new suit is available for a strong jump shift.',
    ] };
  }

  const wantedSuit = fiveCardNewSuits[0]!;
  if (context.handFacts.hcpBySuit[wantedSuit] < 5) {
    return { calls: [], telemetryLines: [
      `Strong jump-shift suit ${wantedSuit} needs at least 5 HCP in the suit; responder has ` +
        `${context.handFacts.hcpBySuit[wantedSuit]}.`,
    ] };
  }

  const jumpResult = refineNewSuitByExtraLevels(calls, context, 1, 'strong jump-shift');
  const refined = jumpResult.calls.filter((call) => parseSuitBid(call)!.strain === wantedSuit);
  return {
    calls: refined,
    telemetryLines: [
      ...jumpResult.telemetryLines,
      `Keep the one-suited strong jump shift in ${wantedSuit}; the suit has ` +
        `${context.handFacts.hcpBySuit[wantedSuit]} HCP.`,
    ],
  };
}

/// refineNewSuitByExtraLevels chooses new-suit calls that are extraLevels above the cheapest legal
/// bid in that suit.  A value of one represents a jump shift; two represents a double-jump
/// splinter.
export function refineNewSuitByExtraLevels (calls: Call[], context: RuleEvalContext,
                                            extraLevels: number, label: string) : 
      CallRefinementResult {
  const opening = getPartnerOpeningBid(context)!;
  // if (opening === null) {
  //   return {calls: [],
  //           telemetryLines: [`No opening bid is available for a ${label} new-suit response.`]};
  // }
  const refined = calls.filter((call) => {
    const candidate = parseSuitBid(call);
    // Probably excessively defensive, but make sure NT is not in candidates list
    if (candidate === null || candidate.strain === 'NT') {
      return false;
    }
    const cheapest = cheapestNewSuitBid(opening, candidate.strain);
    if (cheapest === null) {
      return false;
    }
    const cheapestParsed = parseSuitBid(cheapest);
    if (cheapestParsed === null) { // almost certainly excessively defensive
      return false;
    }
    return candidate.level === cheapestParsed.level + extraLevels;
  });
  return {calls: refined,
          telemetryLines:[`Keep only ${label} new-suit calls over the actual opening.`]};
}

/// refineOneLevelSuitOpening chooses the one-level suit opening implied by five-card-major and
/// convenient-minor priorities.  Branch order is significant: with two 5+ majors choose the
/// higher-ranking spade suit; otherwise use the longer minor, breaking a 4-4 minor tie with 1D and
/// a 3-3 tie with 1C.
///
export function refineOneLevelSuitOpening (calls: Call[], context: RuleEvalContext): CallRefinementResult {
  const lengths = context.handFacts.lengths;
  let wantedCall: Call;
  if (lengths.S >= 5) {
    wantedCall = '1S';
  } else if (lengths.H >= 5) {
    wantedCall = '1H';
  } else if (lengths.D > lengths.C) {
    wantedCall = '1D';
  } else if (lengths.C > lengths.D) {
    wantedCall = '1C';
  } else if (lengths.D >= 4) {
    wantedCall = '1D';
  } else {
    wantedCall = '1C';
  }
  return { calls: calls.filter((call) => call === wantedCall),
           telemetryLines: [`One-level suit opening resolves to ${wantedCall} ` +
                            `by five-card-major/convenient-minor priorities.`]};
}

/// refineNaturalMajorGameOver2Nt keeps only natural 4H/4S responses supported by an actual 6+ card
/// major.  If both majors qualify, preserve both and prefer the major containing more HCP.  With
/// equal suit HCP, prefer the higher-ranking major, spades.
///
export function refineNaturalMajorGameOver2Nt (calls: Call[], context: RuleEvalContext) :
    CallRefinementResult {
  const heartsQualify = calls.includes('4H') && context.handFacts.lengths.H >= 6;
  const spadesQualify = calls.includes('4S') && context.handFacts.lengths.S >= 6;
  let refinedCalls: Call[];
  if (heartsQualify && spadesQualify) {
    refinedCalls = context.handFacts.hcpBySuit.S >= context.handFacts.hcpBySuit.H ? ['4S', '4H']
                                                                                  : ['4H', '4S'];
  } else if (heartsQualify) {
    refinedCalls = ['4H'];
  } else if (spadesQualify) {
    refinedCalls = ['4S'];
  } else {
    refinedCalls = [];
  }
  return { calls: refinedCalls,
           telemetryLines: [
             'Keep six-card-or-longer majors; with both majors, prefer more suit HCP, then spades.'],
  };
}

///
//// Bidding Rule When Applies Functions
///

/// openerMinorOneLevelOneNtApplies uses the 12-14 HCP balanced rebid after a one-level new-suit
/// response.  Opener normally raises four-card support and shows another four-card suit at the one
/// level rather than hiding either feature in 1NT.
///
export function openerMinorOneLevelOneNtApplies (_call: Call, context: RuleEvalContext):
    AppliesWhenResult {
  const opening = getOpenerOpeningBid(context);
  const response = getResponderBid(context);
  if (opening === null || response === null || opening.strain === 'NT' || response.strain === 'NT') {
    return { success: false, 
             telemetryLines: ['FAIL: 1NT rebid needs a minor opening and suit response.'] };
  }
  // Check the normal strength, shape, and responder-support limits first.
  const hcpApplies = context.handFacts.hcp >= 12 && context.handFacts.hcp <= 14;
  const balancedApplies = context.handFacts.balanced;
  const responseSuit = response.strain as Suit;
  const supportApplies = context.handFacts.lengths[responseSuit] < 4;
  // Do not hide a four-card second suit that opener can still show at the one level.
  const openingSuit = opening.strain as Suit;
  const hasOneLevelSecondSuit = SUITS.some((suit) => {
    if (suit === openingSuit || suit === responseSuit || context.handFacts.lengths[suit] < 4) {
      return false;
    }
    const cheapest = cheapestBidInStrainAfter(response, suit);
    const parsed = cheapest === null ? null : parseSuitBid(cheapest);
    return parsed !== null && parsed.level === 1;
  });
  const success = hcpApplies && balancedApplies && supportApplies && ! hasOneLevelSecondSuit;
  return {
    success,
    telemetryLines: [
      `${hcpApplies ? 'PASS' : 'FAIL'}: 1NT rebid needs 12-14 HCP; opener has ` +
        `${context.handFacts.hcp}.`,
      `${balancedApplies ? 'PASS' : 'FAIL'}: 1NT rebid needs a balanced hand.`,
      `${supportApplies ? 'PASS' : 'FAIL'}: responder's ${responseSuit} needs fewer than ` +
        'four-card support.',
      `${! hasOneLevelSecondSuit ? 'PASS' : 'FAIL'}: no four-card second suit is available at ` +
        'the one level.',],};
}

/// openerLowerRankingSecondSuitApplies requires the ordinary 12-18 total-point range,
/// five or more cards in the opening minor, and four or more cards in the lower-ranking second suit.
export function openerLowerRankingSecondSuitApplies (call: Call, context: RuleEvalContext):
    AppliesWhenResult {
  return openerSecondSuitApplies(call, context, 12, 18, 'lower-ranking second suit');
}

/// openerReverseApplies requires extra strength for a structurally reverse rebid.
export function openerReverseApplies (call: Call, context: RuleEvalContext): AppliesWhenResult {
  return openerSecondSuitApplies(call, context, 17, 21, 'reverse');
}

export function openerSecondSuitApplies (call: Call, context: RuleEvalContext, minPoints: number,
                                         maxPoints: number, label: string): AppliesWhenResult {
  const opening = getOpenerOpeningBid(context);
  const candidate = parseSuitBid(call);
  if (opening === null || opening.strain === 'NT' || candidate === null ||
      candidate.strain === 'NT' || candidate.strain === opening.strain) {
    return { success: false, telemetryLines: [`FAIL: ${label} needs two different suit bids.`] };
  }
  const openingSuit = opening.strain as Suit;
  const candidateSuit = candidate.strain as Suit;
  const points = context.handFacts.totalPointsWLength;
  const pointsApply = points >= minPoints && points <= maxPoints;
  const openingLengthApplies = context.handFacts.lengths[openingSuit] >= 5;
  const secondSuitLengthApplies = context.handFacts.lengths[candidateSuit] >= 4;
  const success = pointsApply && openingLengthApplies && secondSuitLengthApplies;
  return {
    success,
    telemetryLines: [
      `${pointsApply ? 'PASS' : 'FAIL'}: ${label} needs ${minPoints}-${maxPoints} total points; ` +
        `opener has ${points}.`,
      `${openingLengthApplies ? 'PASS' : 'FAIL'}: opening ${openingSuit} needs 5+ cards; ` +
        `opener has ${context.handFacts.lengths[openingSuit]}.`,
      `${secondSuitLengthApplies ? 'PASS' : 'FAIL'}: rebid ${candidateSuit} needs 4+ cards; ` +
        `opener has ${context.handFacts.lengths[candidateSuit]}.`,
    ],
  };
}

/// oneNtNaturalMinorInvitationApplies requires the candidate minor to be six cards or longer
/// with at least two of A/K/Q.  The response HCP range follows the selected 1NT opening range.
export function oneNtNaturalMinorInvitationApplies (call: Call, context: RuleEvalContext,
                                                     system: BiddingSystem): AppliesWhenResult {
  const candidate = parseSuitBid(call);
  if (candidate === null || candidate.level !== 3 ||
      (candidate.strain !== 'C' && candidate.strain !== 'D')) {
    return { success: false, telemetryLines: ['FAIL: natural 1NT minor invitation needs 3C or 3D.'] };
  }
  const shift = oneNtResponseHcpShift(system);
  const minHcp = 8 - shift;
  const maxHcp = 9 - shift;
  const suit = candidate.strain as Suit;
  const hcpApplies = context.handFacts.hcp >= minHcp && context.handFacts.hcp <= maxHcp;
  const lengthApplies = context.handFacts.lengths[suit] >= 6;
  const qualityApplies = hasTwoOfTopThreeHonors(context.hand, suit);
  const success = hcpApplies && lengthApplies && qualityApplies;
  return {
    success,
    telemetryLines: [
      `${hcpApplies ? 'PASS' : 'FAIL'}: natural 3${suit} invitation needs ${minHcp}-${maxHcp} HCP.`,
      `${lengthApplies ? 'PASS' : 'FAIL'}: natural 3${suit} invitation needs 6+ ${suit}.`,
      `${qualityApplies ? 'PASS' : 'FAIL'}: natural 3${suit} invitation needs at least two of A/K/Q.`,
    ],
  };
}

/// twoNtNaturalMinorForcingApplies supplies a natural descriptive minor response when the
/// conventional meaning of 3C or 3D is disabled.  Reserve it for strong unbalanced hands;
/// balanced hands use the normal notrump ladder, and a useful major-suit route takes precedence.
export function twoNtNaturalMinorForcingApplies (call: Call, context: RuleEvalContext,
                                                 system: BiddingSystem): AppliesWhenResult {
  const candidate = parseSuitBid(call);
  if (candidate === null || candidate.level !== 3 ||
      (candidate.strain !== 'C' && candidate.strain !== 'D')) {
    return { success: false, telemetryLines: ['FAIL: natural 2NT minor response needs 3C or 3D.'] };
  }
  const suit = candidate.strain as Suit;
  const hcpApplies = context.handFacts.hcp >= 10;
  const lengthApplies = context.handFacts.lengths[suit] >= 5;
  const shapeApplies = ! context.handFacts.balanced;
  const hasPreferredMajor = context.handFacts.hasFiveCardMajor ||
    (system.stayman && context.handFacts.hasFourCardMajor);
  const success = hcpApplies && lengthApplies && shapeApplies && ! hasPreferredMajor;
  return {
    success,
    telemetryLines: [
      `${hcpApplies ? 'PASS' : 'FAIL'}: natural 3${suit} over 2NT needs 10+ HCP.`,
      `${lengthApplies ? 'PASS' : 'FAIL'}: natural 3${suit} over 2NT needs 5+ ${suit}.`,
      `${shapeApplies ? 'PASS' : 'FAIL'}: balanced hands use the normal notrump response ladder.`,
      `${! hasPreferredMajor ? 'PASS' : 'FAIL'}: no preferred major-suit response takes precedence.`,
    ],
  };
}

/// oneNtTwoNtInvitationApplies uses the ordinary balanced 2NT invitation, but when neither
/// Stayman nor Jacoby transfers is available, 2NT is the basic natural 8-9 HCP invitation
/// (7-8 opposite 16-18) regardless of shape.
///
/// The following examples assume the standard 15-17 range; reduce the responder HCP
/// boundaries by one under the selected 16-18 treatment.
/// ACBL instructional path starts without conventions:
///    0–7 + 5+ major        -> 2M, weak signoff
///    8–9                   -> 2NT, invitational
///    10+ + exactly 5 major -> 3M, forcing / choice of games
///    10+ + 6+ major        -> 4M, game
///    10+ without major     -> 3NT
/// Then adding Stayman fixes:
///    8–9 + major           -> Stayman rather than inviting 2NT and missing a level of majors
/// Adding transfers improves the whole 5+ major structure:
//     all strengths + 5+ major -> transfer first, then describe strength
/// With an unbalanced 8-9 HCP hand (5-4-3-1), with both Stayman and transfers disabled:
///    not balanced -> current 2NT rule fails, but ACBL says to use this without stayman and jacoby
///    too strong for the new weak 2M rule;
///    too weak for natural forcing 3M;
///    no Stayman, which normally provides an out to keep the level low and ask for major
///    no transfer
///
/// This applies function doesn't impose the balanced condition when not using stayman and jacoby.
///
export function oneNtTwoNtInvitationApplies (_call: Call, context: RuleEvalContext,
                                      system: BiddingSystem): AppliesWhenResult {
  const shift = oneNtResponseHcpShift(system);
  const hcpApplies = context.handFacts.hcp >= 8 - shift &&
                     context.handFacts.hcp <= 9 - shift;
  const shapeApplies = context.handFacts.balanced || (! system.stayman && ! system.jacobyTransfers);

  return {
    success: hcpApplies && shapeApplies,
    telemetryLines: [
      `${hcpApplies ? 'PASS' : 'FAIL'}: 2NT invitation needs ${8 - shift}-${9 - shift} HCP.`,
      `${shapeApplies ? 'PASS' : 'FAIL'}: 2NT needs balanced shape unless Stayman and ` +
        'Jacoby transfers are both off.',
    ],
  };
}

/// guidelineOf20Applies tests the Rule of 20 for a hand below the normal 12-HCP opening.  If HCP
/// + the lengths of the two longest suits >= 20 -> open.
///
export function guidelineOf20Applies (_call: Call, context: RuleEvalContext): AppliesWhenResult {
  const lengths = Object.values(context.handFacts.lengths).sort((a, b) => b - a);
  const value = context.handFacts.hcp + (lengths[0] ?? 0) + (lengths[1] ?? 0);
  const pass = context.handFacts.hcp < 12 && value >= 20;
  return {
    success: pass,
    telemetryLines: [
      `${pass ? 'APPLIES' : 'FAIL'}: Guideline of 20 for a sub-12-HCP hand = ` +
      `HCP ${context.handFacts.hcp} + ${lengths[0] ?? 0} + ${lengths[1] ?? 0} = ${value}.`, ],
  };
}

/// oneNtFiveCardLengthUpgradeApplies tests the optional 1NT open when there is a 5+ card major,
/// adding one point for that length.
///
export function oneNtFiveCardLengthUpgradeApplies (_call: Call, context: RuleEvalContext,
                                            system: BiddingSystem): AppliesWhenResult {
  const normalMinimum = system.oneNtOpening === '15-17' ? 15 : 16;
  const hasFiveCardMajor = context.handFacts.lengths.H >= 5 || context.handFacts.lengths.S >= 5;
  const success = context.handFacts.balanced && context.handFacts.hcp === normalMinimum - 1 &&
                  hasFiveCardMajor;
  return {
    success,
    telemetryLines: [
      `${success ? 'APPLIES' : 'FAIL'}: 1NT five-card-major upgrade needs balanced, ` +
      `${normalMinimum - 1} HCP, and a five-card major; HCP=${context.handFacts.hcp}, ` +
      `H=${context.handFacts.lengths.H}, S=${context.handFacts.lengths.S}.`,],};
}

/// standardMajorTwoLevelNewSuitApplies applies the Standard 11+ HCP threshold.
export function standardMajorTwoLevelNewSuitApplies (call: Call, context: RuleEvalContext):
    AppliesWhenResult {
  return majorTwoLevelNewSuitApplies(call, context, 11, 'Standard');
}

/// minorRaiseApplies uses four-card support after 1D and five-card support after 1C.  It also
/// enforces the rule's HCP range and the normal requirement that responder not bypass a four-card
/// major to raise the minor.
export function minorRaiseApplies (_call: Call, context: RuleEvalContext, minHcp: number,
                                   maxHcp: number, label: string): AppliesWhenResult {
  const opening = getPartnerOpeningBid(context);
  if (opening === null || (opening.strain !== 'C' && opening.strain !== 'D')) {
    return { success: false, telemetryLines: [`FAIL: ${label} needs a minor-suit opening.`] };
  }
  const hcp = context.handFacts.hcp;
  const supportLength = context.handFacts.lengths[opening.strain];
  const minSupport = opening.strain === 'C' ? 5 : 4;
  const success = hcp >= minHcp && hcp <= maxHcp &&
                  supportLength >= minSupport && ! context.handFacts.hasFourCardMajor;
  return {
    success,
    telemetryLines: [
      `${success ? 'APPLIES' : 'FAIL'}: ${label} requires ${minHcp}-${maxHcp} HCP, ` +
      `${minSupport}+ ${opening.strain} support, and no four-card major.`,
    ],
  };
}

/// minorSupportNewSuitApplies handles the strong responder who plans to show minor support later.
/// Four diamonds support 1D; five clubs support 1C.  The immediate forcing response must still be
/// a natural new suit with four or more cards.
export function minorSupportNewSuitApplies (call: Call, context: RuleEvalContext): AppliesWhenResult {
  const opening = getPartnerOpeningBid(context);
  const candidate = parseSuitBid(call);
  if (opening === null || candidate === null || candidate.strain === 'NT' ||
      (opening.strain !== 'C' && opening.strain !== 'D')) {
    return { success: false, telemetryLines: ['FAIL: strong minor-support route needs suit bids.'] };
  }
  const minSupport = opening.strain === 'C' ? 5 : 4;
  const supportLength = context.handFacts.lengths[opening.strain];
  const candidateLength = context.handFacts.lengths[candidate.strain as Suit];
  const success = context.handFacts.hcp >= 13 && supportLength >= minSupport && candidateLength >= 4;
  return {
    success,
    telemetryLines: [
      `${success ? 'APPLIES' : 'FAIL'}: strong minor-support route requires 13+ HCP, ` +
      `${minSupport}+ ${opening.strain} support, and 4+ cards in ${candidate.strain}.`,
    ],
  };
}

/// majorDirectThreeNtApplies models the direct 3NT response as the very-flat 13-15 HCP treatment:
/// exactly 4-3-3-3, exactly three-card support for opener's major, and no four-card other major.
export function majorDirectThreeNtApplies (_call: Call, context: RuleEvalContext): AppliesWhenResult {
  const opening = getPartnerOpeningBid(context);
  if (opening === null || (opening.strain !== 'H' && opening.strain !== 'S')) {
    return { success: false, telemetryLines: ['FAIL: direct 3NT needs a major-suit opening.'] };
  }
  const lengths = context.handFacts.lengths;
  const supportLength = lengths[opening.strain];
  const otherMajor = opening.strain === 'H' ? 'S' : 'H';
  const sortedLengths = SUITS.map((suit) => lengths[suit]).sort((a, b) => a - b);
  const isFourThreeThreeThree = sortedLengths.join('-') === '3-3-3-4';
  const hcp = context.handFacts.hcp;
  const success = hcp >= 13 && hcp <= 15 && supportLength === 3 &&
                  lengths[otherMajor] <= 3 && isFourThreeThreeThree;
  return {
    success,
    telemetryLines: [
      `${success ? 'APPLIES' : 'FAIL'}: direct 3NT requires 13-15 HCP, 4-3-3-3 shape, ` +
      `exactly three-card support, and no four-card other major.`,
    ],
  };
}

/// majorTwoLevelNewSuitApplies tests a non-jump two-level new-suit response to a major opening.
/// The responder must meet the configured HCP threshold, have no major support, and have enough
/// length in the bid suit; 2H over 1S requires five hearts while minor-suit responses require four.
///
export function majorTwoLevelNewSuitApplies (call: Call, context: RuleEvalContext,
                                             minHcp: number, label: string): AppliesWhenResult {
  // The responder must first have enough strength for this response.
  if (context.handFacts.hcp < minHcp) {
    return { success: false,
             telemetryLines: [
               `FAIL: ${label} two-level new-suit response requires ${minHcp}+ HCP; ` +
               `responder has ${context.handFacts.hcp}.`, ], };
  }
  const candidate = parseSuitBid(call);
  const opening = getPartnerOpeningBid(context);
  if (candidate === null || opening === null || candidate.strain === 'NT' || opening.strain === 'NT') {
    return { success: false, telemetryLines: [`FAIL: ${label} two-level new-suit rule needs suit bids.`] };
  }
  const supportLength = context.handFacts.lengths[opening.strain as 'C' | 'D' | 'H' | 'S'];
  const candidateLength = context.handFacts.lengths[candidate.strain as 'C' | 'D' | 'H' | 'S'];
  const minSuitLength = candidate.strain === 'H' && opening.strain === 'S' ? 5 : 4;
  const success = supportLength <= 2 && candidateLength >= minSuitLength;
  return {
    success: success,
    telemetryLines: [
      `${success ? 'APPLIES' : 'FAIL'}: ${label} two-level new-suit response requires ${minHcp}+ HCP, ` +
      `no major support, and ${minSuitLength}+ cards in ${candidate.strain}.`,
    ],
  };
}

/// After a natural 3NT response to a one-level suit opening, a strong opener can invite slam
/// with quantitative 4NT.  This chosen treatment keeps Pass available as the practical game
/// decision; 4NT is not Blackwood in this auction family.
export function openerSuitThreeNtQuantitativeApplies (_call: Call, context: RuleEvalContext):
    AppliesWhenResult {
  const opening = getOpenerOpeningBid(context);
  const response = getResponderCall(context.dealer, context.auction);
  const isSuitThreeNt = opening !== null && opening.level === 1 && opening.strain !== 'NT' &&
    response === '3NT';
  const hcp = context.handFacts.hcp;
  const success = isSuitThreeNt && hcp >= 18 && hcp <= 21;
  return { success, telemetryLines: [
    `${success ? 'APPLIES' : 'FAIL'}: quantitative 4NT after a one-level suit opening and ` +
    `natural 3NT response requires an 18-21 HCP opener.`,
  ] };
}

/// A Jacoby 2NT four-level side-suit rebid shows a good five-card-or-longer suit.  This chosen
/// executable threshold is at least two of A/K/Q/J in the bid suit.
export function openerJacobyGoodSideSuitApplies (call: Call, context: RuleEvalContext):
    AppliesWhenResult {
  const opening = getOpenerOpeningBid(context);
  const response = getResponderCall(context.dealer, context.auction);
  const candidate = parseSuitBid(call);
  if (opening === null || (opening.strain !== 'H' && opening.strain !== 'S') ||
      response !== '2NT' || candidate === null || candidate.strain === 'NT' ||
      candidate.strain === opening.strain) {
    return { success: false, telemetryLines: ['FAIL: not a Jacoby 2NT side-suit rebid.'] };
  }
  const suit = candidate.strain as Suit;
  const cards = getCardsForSuit(context.hand, suit);
  const honorCount = cards.filter((card) =>
    card.rank === 'A' || card.rank === 'K' || card.rank === 'Q' || card.rank === 'J').length;
  const success = cards.length >= 5 && honorCount >= 2;
  return { success, telemetryLines: [
    `${success ? 'PASS' : 'FAIL'}: ${suit} has ${cards.length} cards and ${honorCount} of A/K/Q/J; ` +
    'Jacoby side-suit rebid needs 5+ cards and at least two top-four honors.',
  ] };
}

/// A natural 1NT-3m invitation asks whether opener holds one of A/K/Q in responder's good
/// six-card minor.  Holding the fitting top honor supports trying 3NT; otherwise play 3m.
export function openerNtMinorInvitationApplies (_call: Call, context: RuleEvalContext,
                                                accept: boolean): AppliesWhenResult {
  const opening = getOpenerOpeningBid(context);
  const response = getResponderBid(context);
  if (opening === null || response === null || opening.level !== 1 || opening.strain !== 'NT' ||
      response.level !== 3 || (response.strain !== 'C' && response.strain !== 'D')) {
    return { success: false, telemetryLines: ['FAIL: not a natural 1NT-3m invitation.'] };
  }
  const suit = response.strain as Suit;
  const hasTopHonor = getCardsForSuit(context.hand, suit).some((card) =>
    card.rank === 'A' || card.rank === 'K' || card.rank === 'Q');
  const success = accept ? hasTopHonor : ! hasTopHonor;
  return { success, telemetryLines: [
    `${success ? 'PASS' : 'FAIL'}: opener ${accept ? 'accepts' : 'declines'} 1NT-3${suit} ` +
    `based on ${hasTopHonor ? 'holding' : 'not holding'} A/K/Q in responder's minor.`,
  ] };
}

/// A natural 3m response after 2NT is available only when that call is not Stayman or a Jacoby
/// transfer under the active agreements.  Opener's basic continuation is natural 3NT.
export function openerNtNaturalThreeMinorApplies (_call: Call, context: RuleEvalContext,
                                                  system: BiddingSystem): AppliesWhenResult {
  const opening = getOpenerOpeningBid(context);
  const response = getResponderBid(context);
  if (opening === null || response === null || opening.level !== 2 || opening.strain !== 'NT') {
    return { success: false,
             telemetryLines: ['FAIL: responder has not made a natural forcing 3m response to 2NT.'] };
  }
  const naturalThreeClub = response.level === 3 && response.strain === 'C' && ! system.stayman;
  const naturalThreeDiamond = response.level === 3 && response.strain === 'D' &&
    ! system.jacobyTransfers;
  const success = naturalThreeClub || naturalThreeDiamond;
  return { success, telemetryLines: [success
    ? 'PASS: natural forcing 3m response to 2NT; 3NT is the basic continuation.'
    : 'FAIL: responder has not made a natural forcing 3m response to 2NT.'] };
}

/// Without Jacoby transfers, a direct 3H/3S response to 1NT or 2NT is natural and game forcing.
/// Opener chooses 3NT with exactly two-card support or four of responder's major with 3+ support.
export function openerNtNaturalThreeMajorApplies (_call: Call, context: RuleEvalContext,
                                                  minSupport: number, maxSupport?: number):
    AppliesWhenResult {
  const opening = getOpenerOpeningBid(context);
  const response = getResponderBid(context);
  if (opening === null || response === null || opening.strain !== 'NT' ||
      (opening.level !== 1 && opening.level !== 2) || response.level !== 3 ||
      (response.strain !== 'H' && response.strain !== 'S')) {
    return { success: false, telemetryLines: ['FAIL: not a natural 1NT/2NT-3M response.'] };
  }
  const support = context.handFacts.lengths[response.strain];
  const supportApplies = support >= minSupport && (maxSupport === undefined || support <= maxSupport);
  return { success: supportApplies, telemetryLines: [
    `${supportApplies ? 'PASS' : 'FAIL'}: opener has ${support} ${response.strain}; ` +
    `this continuation needs ${minSupport}${maxSupport === undefined ? '+' : `-${maxSupport}`} support.`,
  ] };
}

/// With Jacoby transfers available, direct 1NT-3M shows a six-card-or-longer major with slam
/// interest.  Four of the major always remains available; middle-or-better opener strength can
/// cooperate with a side-suit control while retaining 4M as the judgment alternative.
export function openerNtDirectMajorSlamInterestApplies (_call: Call, context: RuleEvalContext,
                                                        system: BiddingSystem, cooperate: boolean):
    AppliesWhenResult {
  const opening = getOpenerOpeningBid(context);
  const response = getResponderBid(context);
  const isDirectSlamTry = opening !== null && response !== null && opening.level === 1 &&
    opening.strain === 'NT' && response.level === 3 &&
    (response.strain === 'H' || response.strain === 'S');
  const minimum = system.oneNtOpening === '15-17' ? 15 : 16;
  const strengthApplies = ! cooperate || context.handFacts.hcp >= minimum + 1;
  const success = isDirectSlamTry && strengthApplies;
  return { success, telemetryLines: [
    `${success ? 'PASS' : 'FAIL'}: direct 1NT-3M slam interest; ` +
    `${cooperate ? `control cooperation needs ${minimum + 1}+ HCP` : '4M remains available'}.`,
  ] };
}

/// Natural NT game and slam signoffs require Pass, never acceptance of an invitation.
export function openerNtNotrumpSignoffApplies (_call: Call, context: RuleEvalContext):
    AppliesWhenResult {
  const opening = getOpenerOpeningBid(context);
  const response = getResponderCall(context.dealer, context.auction);
  const success = opening !== null && opening.strain === 'NT' &&
    (opening.level === 1 || opening.level === 2) &&
    (response === '3NT' || response === '6NT' || response === '7NT');
  return { success, telemetryLines: [success ? 'PASS: natural NT signoff.'
    : 'FAIL: responder has not made a natural NT signoff.'] };
}

/// A direct 4H/4S is a natural game signoff only when Texas is disabled.
export function openerNtNaturalMajorGameApplies (_call: Call, context: RuleEvalContext):
    AppliesWhenResult {
  const opening = getOpenerOpeningBid(context);
  const response = getResponderCall(context.dealer, context.auction);
  const success = opening !== null && opening.strain === 'NT' &&
    (opening.level === 1 || opening.level === 2) &&
    (response === '4H' || response === '4S');
  return { success, telemetryLines: [success ? 'PASS: natural major game signoff.'
    : 'FAIL: not a natural major game signoff.'] };
}

/// Without Jacoby, a natural weak major response to 1NT ends the auction at 2H/2S.
export function openerNtWeakMajorSignoffApplies (_call: Call, context: RuleEvalContext):
    AppliesWhenResult {
  const opening = getOpenerOpeningBid(context);
  const response = getResponderCall(context.dealer, context.auction);
  const success = opening !== null && opening.level === 1 && opening.strain === 'NT' &&
    (response === '2H' || response === '2S');
  return { success, telemetryLines: [success ? 'PASS: natural weak major signoff.'
    : 'FAIL: not a weak major signoff over 1NT.'] };
}

/// A natural 2NT response invites game after 1NT. The middle HCP is a judgment case:
/// keep both Pass and 3NT instead of forcing either choice on every balanced opener.
export function openerNtGameInvitationApplies (_call: Call, context: RuleEvalContext,
                                               system: BiddingSystem, accept: boolean):
    AppliesWhenResult {
  const opening = getOpenerOpeningBid(context);
  const response = getResponderCall(context.dealer, context.auction);
  const isInvitation = opening?.level === 1 && opening.strain === 'NT' && response === '2NT';
  const minimum = system.oneNtOpening === '15-17' ? 15 : 16;
  const hcp = context.handFacts.hcp;
  // At the middle value either action can be reasonable; upgrades below the range decline.
  const strengthApplies = accept ? hcp >= minimum + 1 : hcp <= minimum + 1;
  const success = isInvitation && strengthApplies;
  return { success, telemetryLines: [
    `${success ? 'PASS' : 'FAIL'}: 1NT-2NT invitation: ${accept ? 'accept' : 'decline'} ` +
    `with ${hcp} HCP under the ${system.oneNtOpening} agreement.`,
  ] };
}

/// Quantitative 4NT invites a small slam, not Blackwood. A 21-HCP 2NT opener may
/// decline: opposite responder's 11-12 HCP, slam remains a judgment call.
export function openerNtQuantitativeInvitationApplies (_call: Call, context: RuleEvalContext,
                                                       system: BiddingSystem, accept: boolean):
    AppliesWhenResult {
  const opening = getOpenerOpeningBid(context);
  const response = getResponderCall(context.dealer, context.auction);
  const openingLevel = opening?.strain === 'NT' ? opening.level : null;
  if (response !== '4NT' || (openingLevel !== 1 && openingLevel !== 2)) {
    return { success: false, telemetryLines: ['FAIL: not a quantitative 4NT response to 1NT/2NT.'] };
  }
  const minimum = system.oneNtOpening === '15-17' ? 15 : 16;
  const hcp = context.handFacts.hcp;
  const strengthApplies = openingLevel === 1
    ? (accept ? hcp >= minimum + 1 : hcp <= minimum + 1)
    : (accept ? hcp >= 21 : hcp <= 21);
  return { success: strengthApplies, telemetryLines: [
    `${strengthApplies ? 'PASS' : 'FAIL'}: quantitative 4NT ${accept ? 'acceptance' : 'decline'} ` +
    `with a ${hcp}-HCP ${openingLevel}NT opener.`,
  ] };
}


///
//// Helpers
///

function getResponderBid (context: RuleEvalContext): ParsedSuitBid | null {
  const call = getResponderCall(context.dealer, context.auction);
  return call === null ? null : parseSuitBid(call);
}

/// getOpenerOpeningBid parses the auction's opening contract bid for rule refiners.
function getOpenerOpeningBid (context: RuleEvalContext): ParsedSuitBid | null {
  const opening = getOpeningCallInfo(context.dealer, context.auction);
  return opening === null ? null : parseSuitBid(opening.call);
}

/// getPartnerOpeningBid parses partner's opening contract bid when a response rule needs it.
function getPartnerOpeningBid (context: RuleEvalContext): ParsedSuitBid | null {
  const opening = getPartnerOpeningCall(context.dealer, context.auction, context.seat);
  return opening === null ? null : parseSuitBid(opening);
}
