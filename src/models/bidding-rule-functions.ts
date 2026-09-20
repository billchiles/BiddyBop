/// Bidding rule call refiners, appliesWhen functions, and their shared helpers.

import { biddingBaseline, STRAIN_ORDER, type AppliesWhenResult, type BiddingSystem, type Call,
         type CallRefinementResult, type RuleEvalContext, type SuitBid }
  from './bidding-types';
import { hasPreemptSuitQuality, SUITS, type Suit } from './cards';
import { cheapestBidInStrainAfter, cheapestNewSuitBid, getOpeningCallInfo,
         getPartnerOpeningCall, getResponderCall, openerRebidIsReverse, parseSuitBid,
         type ParsedSuitBid } from './auction';

///
//// Bidding Rule Bid Refinements
///

/// refineOpenerLowerRankingSecondSuitRebid keeps only a natural lower-ranking second suit.
/// After 1C there is no lower-ranking suit; after 1D this resolves to 2C.  Higher-ranking
/// two-level calls are reverses and are deliberately left for the separate reverse rule.
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
/// requested level.  Three-card support is enough when responder's non-jump 2H over 1S promised
/// five hearts; otherwise opener needs four-card support for a new suit shown by responder.
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
  const minSupport = opening.strain === 'S' && response.strain === 'H' && 
                     response.level === 2 ? 3 : 4;
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
    majors.sort((left, right) => {
      if (left.length !== right.length) { // return negative if left belongs first because it's longer
        return right.length - left.length;
      }
      if (left.length === 4) { // bid up the line
        return left.suit === 'H' ? -1 : 1;
      }
      return left.suit === 'S' ? -1 : 1; // bid down the line
    });
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

/// refineThreeCardMajorSupportNewSuitFirst applies the new-suit-first treatment for the 11-12
/// point, exactly-three-card-support, response to major open rule.  With Standard two-level
/// responses, normal two-level candidates are available; with 2/1 game-force responses, this hand
/// is not strong enough for a two-level new-suit response, so only a legal one-level response can
/// survive.
///
export function refineThreeCardMajorSupportNewSuitFirst (
    calls: Call[], context: RuleEvalContext, system: BiddingSystem): CallRefinementResult {
  const refined = refineMajorSupportNewSuitFirst(calls, context);
  if (system.twoLevelNewSuitResponse === 'standard') {
    return refined;
  }

  return {
    calls: refined.calls.filter((call) => parseSuitBid(call)!.level === 1),
    telemetryLines: [
      ...refined.telemetryLines,
      'With 2/1 game-force responses, 11-12 cannot start this limit raise with a two-level new suit.',
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

function getResponderBid (context: RuleEvalContext): ParsedSuitBid | null {
  const call = getResponderCall(context.dealer, context.auction);
  return call === null ? null : parseSuitBid(call);
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
      `${hcpApplies ? 'PASS' : 'FAIL'}: 1NT rebid needs 12-14 HCP; opener has ' +
        '${context.handFacts.hcp}.`,
      `${balancedApplies ? 'PASS' : 'FAIL'}: 1NT rebid needs a balanced hand.`,
      `${supportApplies ? 'PASS' : 'FAIL'}: responder's ${responseSuit} needs fewer than ' +
        'four-card support.`,
      `${! hasOneLevelSecondSuit ? 'PASS' : 'FAIL'}: no four-card second suit is available at ' + 1
        'the one level.`,],};
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

/// oneNtTwoNtInvitationApplies uses the ordinary balanced 2NT invitation, but when neither
/// Stayman nor Jacoby transfers is available, 2NT is the basic natural 8-9 HCP invitation
/// regardless of shape.
///
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
  const hcpApplies = context.handFacts.hcp >= 8 && context.handFacts.hcp <= 9;
  const shapeApplies = context.handFacts.balanced || (! system.stayman && ! system.jacobyTransfers);

  return {
    success: hcpApplies && shapeApplies,
    telemetryLines: [
      `${hcpApplies ? 'PASS' : 'FAIL'}: 2NT invitation needs 8-9 HCP.`,
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
