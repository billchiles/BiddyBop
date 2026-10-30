/// Responder Bid Functions: refiners, applicability checks, and related helpers.

import {biddingBaseline, STRAIN_ORDER, type AppliesWhenResult,
        type BiddingSystem, type Call, type CallRefinementResult, type RuleEvalContext, 
        type SuitBid} from './bidding-types';
import { hasPreemptSuitQuality, SUITS, type Suit } from './cards';
import {cheapestBidInStrainAfter, cheapestNewSuitBid, getOpeningCallInfo, responderPreviouslyPassed,
        getInterferenceAfterOpening, parseSuitBid, type ParsedSuitBid} from './auction';
import {getPartnerOpeningBid, getThreeLevelPreemptOpeningBid, getWeakTwoOpeningBid, 
        hasBasicSuitStopper, orderMajorSuitCandidates} from './common-rule-helpers';

///
//// Responses to One-Level Suit Openings
///

/// refineRaisePartnerSuitBy1 returns a simple raise one level above opening in the same suit.  Resolve the
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

/// refineRaisePartnerSuitBy2 chooses a bid two levels above partner's one-level suit opening.  Resolve
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

//// Weak Pass and minor-opening new-suit responses
/// refineSharedWeakResponderPass keeps the ordinary weak Pass available in uncontested and
/// explicitly modeled one-level competitive auctions, but does not let it define behavior once
/// the auction has crossed an intentionally unsupported interference boundary.
///
export function refineSharedWeakResponderPass (calls: Call[], context: RuleEvalContext):
    CallRefinementResult {
  const interference = getInterferenceAfterOpening(context.dealer, context.auction);
  if (interference === 'other') {
    return { calls: [], telemetryLines: ['Weak Pass is not modeled for this interference.'] };
  }
  if (interference === 'jumpSuitOvercall') {
    const openingInfo = getOpeningCallInfo(context.dealer, context.auction);
    const overcall = openingInfo === null ? null :
      parseSuitBid(context.auction[openingInfo.index + 1] ?? 'Pass');
    if (overcall === null || overcall.level >= 4) {
      return {
        calls: [], telemetryLines: ['Four-level jump-overcall responses remain unmodeled.'],
      };
    }
  }
  return {
    calls, telemetryLines: ['Weak Pass remains available in this modeled responder auction.'],
  };
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
  const considered: { call: Call; length: number }[] = [];
  for (const call of legalResult.calls) {
    const candidate = parseSuitBid(call)!;
    if (candidate.level !== 1) {continue;}
    const suit = candidate.strain as Suit;
    const length = context.handFacts.lengths[suit];
    considered.push({ call, length });
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
      callEvidence: { minorResponseSelection: { preferredCall: null, retainedCalls: [],
        considered, reason: 'no-four-card-suit', longerDiamondAlternative: false } },
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
    const topMajor = majors[0];
    const otherMajor = majors.length > 1 ? majors[1] : undefined;
    const reason = otherMajor !== undefined && topMajor.length === 4
      ? 'equal-four-majors' : otherMajor !== undefined ? 'equal-long-majors'
      : eligible.some((candidate) => candidate.suit !== topMajor.suit &&
          (candidate.suit === 'H' || candidate.suit === 'S')) ? 'longer-major' : 'major-first';
    return {calls: refined,
            telemetryLines: [
              ...legalResult.telemetryLines,
              'With convenient minors, prefer a 4+ card major; after 1C with 6-10 HCP, ' +
              'a longer 1D may remain as an alternative.',],
            callEvidence: { minorResponseSelection: {
              preferredCall: refined[0] ?? null, retainedCalls: refined, considered, reason,
              longerDiamondAlternative: refined.some((call) => call === '1D') &&
                refined.some((call) => call === '1H' || call === '1S'),
            } },};
  } // convenient minors and 4+ card majors exist
  // No major is available under the convenient-minor agreement, or convenient minors is off.
  // In either case use ordinary longest-suit treatment among the remaining eligible calls.
  // This code seems oddly super general and falsely clever, but we need to handle 0 majors, equal
  // majors, unequal majors, diamonds existence and their length, and it all falls out of this code.
  // First keep only equally longest suits.
  const longest = Math.max(...eligible.map((candidate) => candidate.length));
  const refined = eligible.filter((candidate) => candidate.length === longest);
  const retained = refined.map((candidate) => candidate.call);
  return {calls: retained,
          telemetryLines: [
            ...legalResult.telemetryLines,
            `Keep longest one-level new suits (${longest} cards); ` +
            `${longest === 4 ? 'bid equal suits up the line'
                             : 'prefer the higher-ranking equal suit'}.`,
          ],
          callEvidence: { minorResponseSelection: {
            preferredCall: retained[0] ?? null, retainedCalls: retained, considered,
            reason: majors.length > 1 && refined.length > 1
              ? (longest === 4 ? 'equal-four-majors' : 'equal-long-majors') : 'longest-suit',
            longerDiamondAlternative: false,
          } },
        };
} // refineOneLevelNewSuitAfterMinor()

/// refineToCheapestNewSuitBids chooses the cheapest legal call in a new suit over partner's actual
/// opening suit, thereby removing raises and jump shifts.  This does not yet choose among multiple
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
    callEvidence: { majorNoSupportNewSuit: {
      orderedCalls: candidates.map(({ call }) => call),
      considered: candidates.map(({ call, length }) => ({ call, length })),
    } },
  };
}

//// Major support -- Indirect limit and game-forcing routes
/// refineThreeCardLimitRaiseOneNtFallback keeps 1NT for an exactly-three-card limit raise only
/// when responder cannot first show four or more spades over a 1H opening.  After 1S there is no
/// one-level new suit, so 1NT remains the catch-all route under either forcing or non-forcing
/// partnership treatment.  See the major-support family comment in responding-rules.ts for the
/// surrounding direct-raise and new-suit-then-raise routes.
///
export function refineThreeCardLimitRaiseOneNtFallback (
    calls: Call[], context: RuleEvalContext): CallRefinementResult {
  const opening = getPartnerOpeningBid(context);
  if (opening !== null && opening.strain === 'H' && context.handFacts.lengths.S >= 4) {
    return {
      calls: [],
      telemetryLines: ['With 4+ spades over 1H, show 1S before later making the limit raise.'],
      callEvidence: { majorSupportRoute: { reason: 'spades-first',
        spadeLength: context.handFacts.lengths.S } },
    };
  }
  return {
    calls,
    telemetryLines: ['No one-level new suit takes priority; keep 1NT as the three-card limit-raise route.'],
    callEvidence: { majorSupportRoute: { reason: 'one-nt-fallback',
      spadeLength: context.handFacts.lengths.S } },
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
    callEvidence: refined.calls.some((call) => call === '1S')
      ? { majorSupportRoute: { reason: 'spades-first',
          spadeLength: context.handFacts.lengths.S } } : undefined,
  };
}

/// refineMajorSupportNewSuitFirst chooses the new suit used before a later raise of opener's major.
/// Keep legal new-suit responses to opening, requiring 4+ spades for 1H-1S, 5+ hearts for 1S-2H,
/// and 4+ cards for a new minor at the two level.  If no normally qualifying new suit is available,
/// allow a three-card minor as a fallback.  Do not retain that fallback when a normally qualifying
/// new suit exists.  Order surviving calls according to the preferred new-suit treatment.  See the
/// major-support family comment in responding-rules.ts for when this route is chosen.
///
export function refineMajorSupportNewSuitFirst (calls: Call[], context: RuleEvalContext) :
      CallRefinementResult {
  const legalResult = refineToCheapestNewSuitBids(calls, context);
  const considered = legalResult.calls.map((call) => {
    const candidate = parseSuitBid(call)!;
    const suit = candidate.strain as Suit;
    const requiredLength = suit === 'H' ? 5 : 4;
    return { call, length: context.handFacts.lengths[suit], requiredLength };
  });
  const normalCalls = considered.filter(({ length, requiredLength }) =>
    length >= requiredLength).map(({ call }) => call);
  if (normalCalls.length > 0) {
    return {
      calls: normalCalls,
      telemetryLines: [...legalResult.telemetryLines,
        'Keep normally supported new suits for the major-support response.'],
      callEvidence: { majorGameForceNewSuit: {
        reason: 'normal', considered, retainedCalls: normalCalls,
      } },
    };
  }
  // Only if no normal new suit exists, admit the unusual three-card-minor choice.
  const fallbackMinorCalls = considered.filter(({ call, length }) => {
    const suit = parseSuitBid(call)!.strain;
    return (suit === 'C' || suit === 'D') && length === 3;
  }).map(({ call }) => call);
  return {
    calls: fallbackMinorCalls,
    telemetryLines: [
      ...legalResult.telemetryLines,
      fallbackMinorCalls.length > 0
        ? 'No normal new suit is available; allow a three-card minor as the fallback.'
        : 'No normally supported new suit or three-card minor fallback is available.',
    ],
    callEvidence: { majorGameForceNewSuit: {
      reason: fallbackMinorCalls.length > 0 ? 'three-card-minor-fallback' : 'unavailable',
      considered, retainedCalls: fallbackMinorCalls,
    } },
  };
}

/// refineLongMajorSupportLimitRaiseFallback allows a conservative three-level invitation with
/// exactly 13 support points only when no game-forcing new-suit route is available.  This is a
/// narrow fallback for long trump fits with no suitable side suit, not a general 13-point raise.
/// Singleton/void hands are excluded because their playing strength calls for separate judgment
/// (and may qualify for a splinter) rather than an automatic limit raise.
///
export function refineLongMajorSupportLimitRaiseFallback (
    calls: Call[], context: RuleEvalContext): CallRefinementResult {
  const opening = getPartnerOpeningBid(context)!;
  const otherSuits = SUITS.filter((suit) => suit !== opening.strain);
  if (otherSuits.some((suit) => context.handFacts.lengths[suit] < 2)) {
    return { calls: [], telemetryLines: ['Shortness rules out the conservative long-fit limit-raise fallback.'],
      callEvidence: { longMajorLimitFallback: { reason: 'shortness', alternativeCalls: [] } } };
  }
  const newSuit = refineMajorSupportNewSuitFirst(['1S', '2C', '2D', '2H'], context);
  if (newSuit.calls.length > 0) {
    return { calls: [], telemetryLines: ['A game-forcing new-suit response is available instead of a limit raise.'],
      callEvidence: { longMajorLimitFallback: {
        reason: 'new-suit-available', alternativeCalls: newSuit.calls,
        alternativeIsRareThreeCardMinor: newSuit.callEvidence?.majorGameForceNewSuit
          ?.reason === 'three-card-minor-fallback',
      } } };
  }
  const raise = refineRaisePartnerSuitBy2(calls, context);
  return { ...raise, callEvidence: { longMajorLimitFallback: {
    reason: 'qualified', alternativeCalls: [],
  } } };
}

//// Jump shifts and economical suit-bid selection
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
  const considered = jumpResult.calls.map((call) => {
    const suit = parseSuitBid(call)!.strain as Suit;
    return { call, suit, length: context.handFacts.lengths[suit],
      suitHcp: context.handFacts.hcpBySuit[suit] };
  });
  const candidates = considered.filter((candidate) => candidate.length >= 6);
  if (candidates.length === 0) {
    return { calls: [], telemetryLines: [
      ...jumpResult.telemetryLines,
      'No six-card-or-longer suit is available for a weak jump shift.',
    ], callEvidence: { jumpShift: {
      treatment: 'weak', hcp: context.handFacts.hcp, considered,
      selectedCall: null, reason: 'no-long-suit', longNewSuits: [],
    } } };
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
    callEvidence: { jumpShift: {
      treatment: 'weak', hcp: context.handFacts.hcp, considered,
      selectedCall: selected.call,
      ordinaryCall: cheapestNewSuitBid(getPartnerOpeningBid(context)!, selected.suit) ?? undefined,
      reason: 'qualified', longNewSuits: candidates.map(({ suit }) => suit),
    } },
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

  const jumpResult = refineNewSuitByExtraLevels(calls, context, 1, 'strong jump-shift');
  const considered = jumpResult.calls.map((call) => {
    const suit = parseSuitBid(call)!.strain as Suit;
    return { call, length: context.handFacts.lengths[suit],
      suitHcp: context.handFacts.hcpBySuit[suit] };
  });
  const fiveCardNewSuits = SUITS.filter((suit) =>
    suit !== opening.strain && context.handFacts.lengths[suit] >= 5);
  if (fiveCardNewSuits.length !== 1) {
    return { calls: [], telemetryLines: [
      fiveCardNewSuits.length > 1
        ? 'With two 5+ new suits, respond naturally in the higher-ranking suit rather than jump shift.'
        : 'No five-card-or-longer new suit is available for a strong jump shift.',
    ], callEvidence: { jumpShift: {
      treatment: 'strong', hcp: context.handFacts.hcp, considered, selectedCall: null,
      reason: fiveCardNewSuits.length > 1 ? 'two-long-suits' : 'no-long-suit',
      longNewSuits: fiveCardNewSuits,
    } } };
  }

  const wantedSuit = fiveCardNewSuits[0]!;
  if (context.handFacts.hcpBySuit[wantedSuit] < 5) {
    return { calls: [], telemetryLines: [
      `Strong jump-shift suit ${wantedSuit} needs at least 5 HCP in the suit; responder has ` +
        `${context.handFacts.hcpBySuit[wantedSuit]}.`,
    ], callEvidence: { jumpShift: {
      treatment: 'strong', hcp: context.handFacts.hcp, considered, selectedCall: null,
      reason: 'insufficient-suit-hcp', longNewSuits: fiveCardNewSuits,
    } } };
  }

  const refined = jumpResult.calls.filter((call) => parseSuitBid(call)!.strain === wantedSuit);
  return {
    calls: refined,
    telemetryLines: [
      ...jumpResult.telemetryLines,
      `Keep the one-suited strong jump shift in ${wantedSuit}; the suit has ` +
        `${context.handFacts.hcpBySuit[wantedSuit]} HCP.`,
    ],
    callEvidence: { jumpShift: {
      treatment: 'strong', hcp: context.handFacts.hcp, considered,
      selectedCall: refined[0] ?? null,
      ordinaryCall: cheapestNewSuitBid(opening, wantedSuit) ?? undefined,
      reason: 'qualified', longNewSuits: fiveCardNewSuits,
    } },
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

/// standardMajorTwoLevelNewSuitApplies applies the Standard 11+ HCP threshold.
export function standardMajorTwoLevelNewSuitApplies (call: Call, context: RuleEvalContext):
    AppliesWhenResult {
  return majorTwoLevelNewSuitApplies(call, context, 11, 'Standard');
}

//// Minor raises and strong minor support
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
    callEvidence: { requirements: [
      { kind: 'hcp', actual: hcp, min: minHcp, max: maxHcp,
        passed: hcp >= minHcp && hcp <= maxHcp },
      { kind: 'minorSupport', suit: opening.strain, actual: supportLength, min: minSupport,
        passed: supportLength >= minSupport },
      { kind: 'noFourCardMajor', actual: !context.handFacts.hasFourCardMajor,
        passed: !context.handFacts.hasFourCardMajor },
    ] },
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
    callEvidence: { requirements: [
      { kind: 'hcp', actual: context.handFacts.hcp, min: 13,
        passed: context.handFacts.hcp >= 13 },
      { kind: 'minorSupport', suit: opening.strain, actual: supportLength, min: minSupport,
        passed: supportLength >= minSupport },
      { kind: 'suitLength', actual: candidateLength, min: 4, passed: candidateLength >= 4 },
    ] },
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
  const candidate = parseSuitBid(call);
  const opening = getPartnerOpeningBid(context);
  if (candidate === null || opening === null || candidate.strain === 'NT' || opening.strain === 'NT') {
    return { success: false, telemetryLines: [`FAIL: ${label} two-level new-suit rule needs suit bids.`] };
  }
  const supportLength = context.handFacts.lengths[opening.strain as 'C' | 'D' | 'H' | 'S'];
  const candidateLength = context.handFacts.lengths[candidate.strain as 'C' | 'D' | 'H' | 'S'];
  const minSuitLength = candidate.strain === 'H' && opening.strain === 'S' ? 5 : 4;
  const hcp = context.handFacts.hcp;
  const unpassed = !responderPreviouslyPassed(context.dealer, context.auction);
  const needsUnpassed = label === '2/1';
  const success = hcp >= minHcp && supportLength <= 2 &&
    candidateLength >= minSuitLength && (!needsUnpassed || unpassed);
  return {
    success,
    telemetryLines: [
      `${success ? 'APPLIES' : 'FAIL'}: ${label} two-level new-suit response requires ${minHcp}+ HCP, ` +
      `no major support, and ${minSuitLength}+ cards in ${candidate.strain}.`,
      ...(needsUnpassed && !unpassed ? ['FAIL: a previously passed responder cannot establish a 2/1 game force.'] : []),
    ],
    callEvidence: { requirements: [
      { kind: 'hcp', actual: hcp, min: minHcp, passed: hcp >= minHcp },
      { kind: 'partnerSupport', suit: opening.strain as Suit, actual: supportLength, max: 2,
        passed: supportLength <= 2 },
      { kind: 'suitLength', actual: candidateLength, min: minSuitLength,
        passed: candidateLength >= minSuitLength },
      ...(needsUnpassed ? [{ kind: 'responderPreviouslyPassed' as const, actual: !unpassed,
        required: false, passed: unpassed }] : []),
    ] },
  };
}

///
//// Responses to Notrump Openings
///

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

///
//// Responses to Strong Two-Club Openings
///

/// refineStrongTwoCPositiveSuitResponse keeps immediate positive responses in good five-card-or-
/// longer suits.  The artificial 2D waiting response is handled by a separate rule.
export function refineStrongTwoCPositiveSuitResponse (calls: Call[], context: RuleEvalContext):
    CallRefinementResult {
  const opening = getPartnerOpeningBid(context);
  if (opening === null || opening.level !== 2 || opening.strain !== 'C') {
    return { calls: [], telemetryLines: ['A strong-2C positive suit response needs a 2C opening.'] };
  }

  const refined = calls.filter((call) => {
    const candidate = parseSuitBid(call);
    if (candidate === null || candidate.strain === 'NT') {
      return false;
    }
    const suit = candidate.strain as Suit;
    return context.handFacts.lengths[suit] >= 5 && hasPreemptSuitQuality(context.hand, suit);
  });
  return {
    calls: refined,
    telemetryLines: [
      'Keep positive suit responses with 5+ cards and at least two of A/K/Q or three of A/K/Q/J/T.',
    ],
  };
}

///
//// Responses to Weak Two- and Three-Level Openings
///

/// refineWeakTwoNewSuitResponse chooses responder's natural forcing suit after a weak two.  The
/// suit is 5+ cards, has ordinary preempt-style honor concentration, and is bid at the cheapest
/// legal level through three.  With multiple candidates, prefer length, then higher rank.
export function refineWeakTwoNewSuitResponse (calls: Call[], context: RuleEvalContext):
    CallRefinementResult {
  const opening = getWeakTwoOpeningBid(context);
  if (opening === null) {
    return { calls: [], telemetryLines: ['A forcing new-suit response needs a weak-two opening.'] };
  }

  const considered = calls.flatMap((call) => {
    const parsed = parseSuitBid(call);
    if (parsed === null || parsed.strain === 'NT' || parsed.strain === opening.strain) return [];
    const suit = parsed.strain as Suit;
    return [{ call, length: context.handFacts.lengths[suit],
      quality: hasPreemptSuitQuality(context.hand, suit),
      economical: cheapestBidInStrainAfter(opening, suit) === call }];
  });

  const candidates: { call: Call; suit: Suit; length: number }[] = [];
  for (const call of calls) {
    const candidate = parseSuitBid(call);
    if (candidate === null || candidate.strain === 'NT' || candidate.strain === opening.strain ||
        candidate.level > 3 || cheapestBidInStrainAfter(opening, candidate.strain) !== call) {
      continue;
    }
    const suit = candidate.strain as Suit;
    const length = context.handFacts.lengths[suit];
    if (length < 5 || ! hasPreemptSuitQuality(context.hand, suit)) {
      continue;
    }
    candidates.push({ call, suit, length });
  }
  if (candidates.length === 0) {
    return { calls: [], telemetryLines: [
      'No good five-card-or-longer new suit is available at the cheapest legal level.',
    ], callEvidence: { weakTwoNewSuit: { considered, selected: null } } };
  }

  const longest = Math.max(...candidates.map((candidate) => candidate.length));
  const best = candidates.filter((candidate) => candidate.length === longest);
  best.sort((left, right) => STRAIN_ORDER.indexOf(right.suit) - STRAIN_ORDER.indexOf(left.suit));
  return {
    calls: [best[0]!.call],
    telemetryLines: [
      `Choose the longest good forcing suit after the weak two; equal lengths use the ` +
        `higher-ranking suit: ${best[0]!.call}.`,
    ], callEvidence: { weakTwoNewSuit: { considered, selected: best[0]!.call } },
  };
}

/// refineThreeLevelPreemptNewSuitResponse keeps the cheapest new-suit response that remains below
/// game in that suit.  A three-level response needs a good 5+ suit; a four-level minor response
/// needs a good 6+ suit.  Length, then higher rank, resolves multiple qualifying suits.
export function refineThreeLevelPreemptNewSuitResponse (calls: Call[], context: RuleEvalContext):
    CallRefinementResult {
  const opening = getThreeLevelPreemptOpeningBid(context);
  if (opening === null) {
    return { calls: [], telemetryLines: ['A forcing new-suit response needs a three-level preempt.'] };
  }

  const candidates: { call: Call; suit: Suit; length: number }[] = [];
  for (const call of calls) {
    const candidate = parseSuitBid(call);
    if (candidate === null || candidate.strain === 'NT' || candidate.strain === opening.strain ||
        cheapestBidInStrainAfter(opening, candidate.strain) !== call) {
      continue;
    }
    const gameLevel = candidate.strain === 'H' || candidate.strain === 'S' ? 4 : 5;
    if (candidate.level >= gameLevel) {
      continue;
    }
    const suit = candidate.strain as Suit;
    const minLength = candidate.level === 3 ? 5 : 6;
    const length = context.handFacts.lengths[suit];
    if (length < minLength || ! hasPreemptSuitQuality(context.hand, suit)) {
      continue;
    }
    candidates.push({ call, suit, length });
  }
  if (candidates.length === 0) {
    return { calls: [], telemetryLines: [
      'No sufficiently long good new suit is available below game after the three-level preempt.',
    ] };
  }

  const longest = Math.max(...candidates.map((candidate) => candidate.length));
  const best = candidates.filter((candidate) => candidate.length === longest);
  best.sort((left, right) => STRAIN_ORDER.indexOf(right.suit) - STRAIN_ORDER.indexOf(left.suit));
  return {
    calls: [best[0]!.call],
    telemetryLines: [
      `Keep the longest good forcing new suit below game; equal lengths use the higher-ranking ` +
        `suit: ${best[0]!.call}.`,
    ],
  };
}

/// guidelineOf17Applies uses responder HCP plus support length as a rough game-interest check
/// after partner's weak two.  It is a named guideline, not an estimate of actual playing tricks.
export function guidelineOf17Applies (_call: Call, context: RuleEvalContext): AppliesWhenResult {
  const info = getWeakTwoGuidelineOf17Info(context);
  if (info === null) {
    return { success: false, telemetryLines: ['FAIL: Guideline of 17 needs a weak-two opening.'] };
  }
  const success = info.value >= 17;
  return {
    success,
    telemetryLines: [
      `${success ? 'APPLIES' : 'FAIL'}: Guideline of 17 = responder HCP ${context.handFacts.hcp} + ` +
        `${info.supportLength} cards in opener's ${info.opening.strain} = ${info.value}.`,
    ],
    callEvidence: info === null ? undefined : { weakTwoResponse: { openingSuit: info.opening.strain as Suit, hcp: context.handFacts.hcp, support: info.supportLength, guideline: info.value } },
  };
}

/// weakTwoPassApplies keeps Pass when the Guideline of 17 does not suggest game investigation and
/// responder has at most two cards in opener's suit.
export function weakTwoPassApplies (_call: Call, context: RuleEvalContext): AppliesWhenResult {
  const info = getWeakTwoGuidelineOf17Info(context);
  const success = info !== null && info.value < 17 && info.supportLength <= 2;
  return { success, telemetryLines: [
    info === null
      ? 'FAIL: Pass treatment needs a weak-two opening.'
      : `${success ? 'APPLIES' : 'FAIL'}: Pass needs two or fewer trumps and Guideline of 17 ` +
        `below 17; support=${info.supportLength}, value=${info.value}.`,
  ], callEvidence: info === null ? undefined : { weakTwoResponse: { openingSuit: info.opening.strain as Suit, hcp: context.handFacts.hcp, support: info.supportLength, guideline: info.value } } };
}

/// weakTwoSimpleRaiseApplies keeps the three-level preemptive raise with exactly three-card support
/// and no game interest under the Guideline of 17.
export function weakTwoSimpleRaiseApplies (_call: Call, context: RuleEvalContext): AppliesWhenResult {
  const info = getWeakTwoGuidelineOf17Info(context);
  const success = info !== null && info.value < 17 && info.supportLength === 3;
  return { success, telemetryLines: [
    info === null
      ? 'FAIL: Three-level raise treatment needs a weak-two opening.'
      : `${success ? 'APPLIES' : 'FAIL'}: Three-level raise needs exactly three trumps and ` +
        `Guideline of 17 below 17; support=${info.supportLength}, value=${info.value}.`,
  ], callEvidence: info === null ? undefined : { weakTwoResponse: { openingSuit: info.opening.strain as Suit, hcp: context.handFacts.hcp, support: info.supportLength, guideline: info.value } } };
}

/// weakTwoFourLevelRaiseApplies uses four-card-or-longer support to raise the six-card weak two to
/// the four level.  The same call can be further preemption or a game contract in a major.
export function weakTwoFourLevelRaiseApplies (_call: Call, context: RuleEvalContext):
    AppliesWhenResult {
  const info = getWeakTwoGuidelineOf17Info(context);
  const success = info !== null && info.supportLength >= 4;
  return { success, telemetryLines: [
    info === null
      ? 'FAIL: Four-level raise treatment needs a weak-two opening.'
      : `${success ? 'APPLIES' : 'FAIL'}: Four-level raise needs 4+ trumps; responder has ` +
        `${info.supportLength}.`,
  ], callEvidence: info === null ? undefined : { weakTwoResponse: { openingSuit: info.opening.strain as Suit, hcp: context.handFacts.hcp, support: info.supportLength, guideline: info.value } } };
}

/// threeLevelPreemptPassApplies keeps Pass with two or fewer trumps.  Responder must also judge
/// that game is unlikely; the app does not estimate playing tricks.
export function threeLevelPreemptPassApplies (_call: Call, context: RuleEvalContext):
    AppliesWhenResult {
  const opening = getThreeLevelPreemptOpeningBid(context);
  if (opening === null || opening.strain === 'NT') {
    return { success: false, telemetryLines: ['FAIL: Pass treatment needs a three-level preempt.'] };
  }
  const support = context.handFacts.lengths[opening.strain as Suit];
  const success = support <= 2;
  return { success, telemetryLines: [
    `${success ? 'APPLIES' : 'FAIL'}: structural Pass candidate needs two or fewer trumps; ` +
      `responder has ${support}.  Game still depends on playing-trick judgment.`,
  ] };
}

/// threeLevelPreemptRaiseApplies further preempts to the four level with three-card-or-longer
/// support for opener's promised seven-card suit, giving at least ten combined trumps.
export function threeLevelPreemptRaiseApplies (_call: Call, context: RuleEvalContext):
    AppliesWhenResult {
  const opening = getThreeLevelPreemptOpeningBid(context);
  if (opening === null || opening.strain === 'NT') {
    return { success: false, telemetryLines: ['FAIL: Raise treatment needs a three-level preempt.'] };
  }
  const support = context.handFacts.lengths[opening.strain as Suit];
  const success = support >= 3;
  return { success, telemetryLines: [
    `${success ? 'APPLIES' : 'FAIL'}: four-level raise needs 3+ support opposite opener's ` +
      `seven-card suit; responder has ${support}.`,
  ] };
}

interface WeakTwoGuidelineOf17Info {
  opening: ParsedSuitBid;
  supportLength: number;
  value: number;
}

function getWeakTwoGuidelineOf17Info (context: RuleEvalContext): WeakTwoGuidelineOf17Info | null {
  const opening = getWeakTwoOpeningBid(context);
  if (opening === null || opening.strain === 'NT') {
    return null;
  }
  const supportLength = context.handFacts.lengths[opening.strain as Suit];
  return { opening, supportLength, value: context.handFacts.hcp + supportLength };
}

///
//// Responder After a Natural Suit Overcall
///

/// getOpenerCallAndOvercallForResponder reads the opener's suit bid and the opponent's
/// subsequent suit overcall for responder's refiners and applicability checks. It returns
/// null unless the opening is at the one level and the overcall is the cheapest natural bid
/// in a different suit. This helper identifies the auction; it does not choose a bid.
///
function getOpenerCallAndOvercallForResponder (context: RuleEvalContext):
    { opening: ParsedSuitBid; overcall: ParsedSuitBid } | null {
  const openingInfo = getOpeningCallInfo(context.dealer, context.auction);
  if (openingInfo === null) {
    return null;
  }
  const action = context.auction[openingInfo.index + 1];
  const opening = parseSuitBid(openingInfo.call);
  const overcall = action === undefined ? null : parseSuitBid(action);
  if (opening === null || overcall === null || opening.level !== 1 ||
      opening.strain === 'NT' || overcall.strain === 'NT' ||
      opening.strain === overcall.strain ||
      cheapestBidInStrainAfter(opening, overcall.strain) !== action) {
    return null;
  }
  return { opening, overcall };
}

/// refineResponderNewSuitAfterOvercall selects responder's cheapest natural new-suit bid
/// after an opponent's suit overcall. Four cards suffice for a one-level major after
/// 1m-(1D); otherwise responder needs five cards in the new suit.
///
export function refineResponderNewSuitAfterOvercall (calls: Call[], context: RuleEvalContext): CallRefinementResult {
  const auction = getOpenerCallAndOvercallForResponder(context);
  if (auction === null) {
    return { calls: [], telemetryLines: ['No direct non-jump suit overcall.'] };
  }
  const survivors = calls.filter((call) => {
    const candidate = parseSuitBid(call);
    if (candidate === null || candidate.strain === 'NT' ||
        candidate.strain === auction.opening.strain ||
        candidate.strain === auction.overcall.strain ||
        cheapestBidInStrainAfter(auction.overcall, candidate.strain) !== call) {
      return false;
    }
    const minimum = candidate.level === 1 &&
      (auction.opening.strain === 'C' || auction.opening.strain === 'D') &&
      auction.overcall.strain === 'D' &&
      (candidate.strain === 'H' || candidate.strain === 'S') ? 4 : 5;
    return context.handFacts.lengths[candidate.strain as Suit] >= minimum;
  });
  survivors.sort((a, b) => {
    const first = parseSuitBid(a)!.strain as Suit;
    const second = parseSuitBid(b)!.strain as Suit;
    const gap = context.handFacts.lengths[second] - context.handFacts.lengths[first];
    return gap !== 0 ? gap : STRAIN_ORDER.indexOf(second) - STRAIN_ORDER.indexOf(first);
  });
  return { calls: survivors, telemetryLines: [
    'Natural new suits must not be the opponent suit; use the cheapest bid after interference.',
  ] };
}

/// refineResponderRaiseAfterOvercall selects responder's raise of opener's suit at the
/// specified level, distinguishing the cheapest available raise from a jump raise.
///
export function refineResponderRaiseAfterOvercall (calls: Call[], context: RuleEvalContext,
                                          level: number, jump: boolean): CallRefinementResult {
  const auction = getOpenerCallAndOvercallForResponder(context);
  if (auction === null) {
    return { calls: [], telemetryLines: ['No direct non-jump suit overcall.'] };
  }
  const cheapest = cheapestBidInStrainAfter(auction.overcall, auction.opening.strain);
  const cheapestParsed = cheapest === null ? null : parseSuitBid(cheapest);
  const expectedLevel = cheapestParsed?.level;
  const wanted = `${level}${auction.opening.strain}`;
  return { calls: calls.filter((call) => call === wanted && expectedLevel !== undefined &&
      (jump ? level === expectedLevel + 1 : level === expectedLevel)), telemetryLines: [
        jump ? 'True jump raise measured from the intervening contract.' :
               `Cheapest available raise to level ${level} after the opponent's overcall.`,
      ] };
}

/// refineResponderCuebidAfterOvercall selects responder's cheapest legal cuebid in
/// the opponent's overcalled suit (an artificial support bid, not a natural suit bid).
///
export function refineResponderCuebidAfterOvercall (calls: Call[], context: RuleEvalContext): CallRefinementResult {
  const auction = getOpenerCallAndOvercallForResponder(context);
  const wanted = auction === null ? null :
    cheapestBidInStrainAfter(auction.overcall, auction.overcall.strain);
  return { calls: wanted === null ? [] : calls.filter((call) => call === wanted),
    telemetryLines: ['Opponent suit is artificial cuebid, not a natural new suit.'] };
}

/// responderCuebidAfterOvercallApplies checks responder's support and shortage-adjusted
/// points for an artificial cuebid in the opponent's overcalled suit.
///
export function responderCuebidAfterOvercallApplies (_call: Call, context: RuleEvalContext): AppliesWhenResult {
  const auction = getOpenerCallAndOvercallForResponder(context);
  if (auction === null) {
    return { success: false, telemetryLines: ['No natural opponent suit overcall.'] };
  }
  const minor = auction.opening.strain === 'C' || auction.opening.strain === 'D';
  const support = context.handFacts.lengths[auction.opening.strain as Suit];
  const points = context.handFacts.totalPointsWShortage;
  const enough = support >= (minor ? 4 : 3) && points >= 11;
  return { success: enough, telemetryLines: [
    `${enough ? 'PASS' : 'FAIL'}: cuebid needs 11+ support points and ` +
      `${minor ? 4 : 3}+ trump cards (have ${points} points, ${support} trump).`,
  ], callEvidence: { competitiveResponse: {
    hcp: context.handFacts.hcp, supportPoints: points, minSupportPoints: 11,
    partnerSuit: auction.opening.strain as Suit, partnerSupport: support,
    minPartnerSupport: minor ? 4 : 3,
  } } };
}

/// responderNegativeDoubleAfterOvercallApplies checks strength and unbid-suit length for
/// responder's negative double after a suit overcall. Require 6+ HCP at the one level or 10+
/// at the two level, with the modeled suit holdings; overcalls above 2S are not supported.
///
export function responderNegativeDoubleAfterOvercallApplies (_call: Call, context: RuleEvalContext): AppliesWhenResult {
  const auction = getOpenerCallAndOvercallForResponder(context);
  if (auction === null || auction.overcall.level > 2) {
    return { success: false, telemetryLines: ['Negative doubles modeled only through 2S.'] };
  }
  const unbid = SUITS.filter((suit) => suit !== auction.opening.strain &&
                                   suit !== auction.overcall.strain);
  const majors = unbid.filter((suit) => suit === 'H' || suit === 'S');
  const relevant = majors.length > 0 ? majors : unbid;
  const exactlyFourSpades = auction.overcall.strain === 'H' &&
    (auction.opening.strain === 'C' || auction.opening.strain === 'D') &&
    auction.overcall.level === 1;
  const suitsOkay = relevant.every((suit) => context.handFacts.lengths[suit] >= 4) &&
    (! exactlyFourSpades || context.handFacts.lengths.S === 4);
  const points = context.handFacts.hcp;
  const min = auction.overcall.level === 1 ? 6 : 10;
  return { success: points >= min && suitsOkay, telemetryLines: [
    `${points >= min ? 'PASS' : 'FAIL'}: negative double after level ` +
      `${auction.overcall.level} needs ${min}+ HCP; have ${points}.`,
    `${suitsOkay ? 'PASS' : 'FAIL'}: unbid suit lengths ` +
      `${relevant.map((suit) => `${suit}=${context.handFacts.lengths[suit]}`).join(', ')}; ` +
      `${exactlyFourSpades ? 'requires exactly four spades' : 'requires at least four in each listed suit'}.`,
  ], callEvidence: { competitiveResponse: {
    hcp: points, minHcp: min,
    unbidSuits: relevant.map((suit) => ({
      suit, length: context.handFacts.lengths[suit], min: 4,
      exact: exactlyFourSpades && suit === 'S' ? 4 : undefined,
    })),
  } } };
}

/// responderNotrumpAfterOvercallApplies checks responder's natural 1NT, 2NT, or 3NT bid
/// after a suit overcall: suitable HCP, balanced shape, and a stopper in opponent's suit.
///
export function responderNotrumpAfterOvercallApplies (call: Call, context: RuleEvalContext): AppliesWhenResult {
  const auction = getOpenerCallAndOvercallForResponder(context);
  const parsed = parseSuitBid(call);
  if (auction === null || parsed === null || parsed.strain !== 'NT') {
    return { success: false, telemetryLines: ['Not a natural notrump response after a suit overcall.'] };
  }
  const range = parsed.level === 1 ? { min: 6, max: 10 } :
    parsed.level === 2 ? { min: 11, max: 12 } : { min: 13, max: 15 };
  const points = context.handFacts.hcp;
  const suit = auction.overcall.strain as Suit;
  const stopper = hasBasicSuitStopper(context, suit);
  const strength = points >= range.min && points <= range.max;
  const balanced = context.handFacts.balanced;
  return { success: strength && balanced && stopper, telemetryLines: [
    `${strength ? 'PASS' : 'FAIL'}: natural ${call} needs ${range.min}-${range.max} HCP; have ${points}.`,
    `${balanced ? 'PASS' : 'FAIL'}: natural notrump needs balanced distribution.`,
    `${stopper ? 'PASS' : 'FAIL'}: need A, Kx, Qxx, or Jxxx stopper in opponent ${suit}.`,
  ] };
}

///
//// Responder After a Takeout Double
///

/// responderWeakTwoLevelNewSuitApplies checks a good six-card suit and 5-9 HCP for a natural,
/// nonforcing two-level response after a takeout double or a natural 1NT overcall.
///
export function responderWeakTwoLevelNewSuitApplies (call: Call, context: RuleEvalContext): AppliesWhenResult {
  const candidate = parseSuitBid(call);
  if (candidate === null || candidate.strain === 'NT' || candidate.level !== 2) {
    return { success: false, telemetryLines: ['A natural two-level suit response is required.'] };
  }
  const suit = candidate.strain as Suit;
  const length = context.handFacts.lengths[suit];
  const hcp = context.handFacts.hcp;
  const enough = length >= 6 && hasPreemptSuitQuality(context.hand, suit) && hcp >= 5 && hcp <= 9;
  return { success: enough, telemetryLines: [
    `${enough ? 'PASS' : 'FAIL'}: nonforcing two-level new suit needs a good six-card ` +
      `${suit} suit and 5-9 HCP (have ${length} cards, ${hcp} HCP).`,
  ] };
}

/// responderJordanTwoNtAfterDoubleApplies uses 10+ shortage-adjusted support points and
/// enough trump support for an artificial limit-or-better raise: 3+ majors, 4+ D, or 5+ C.
///
export function responderJordanTwoNtAfterDoubleApplies (_call: Call, context: RuleEvalContext): AppliesWhenResult {
  const opening = getPartnerOpeningBid(context);
  if (opening === null || opening.level !== 1 || opening.strain === 'NT') {
    return { success: false, telemetryLines: ['Jordan 2NT requires a one-level suit opening.'] };
  }
  const suit = opening.strain as Suit;
  const support = context.handFacts.lengths[suit];
  const minimum = suit === 'C' ? 5 : suit === 'D' ? 4 : 3;
  const points = context.handFacts.totalPointsWShortage;
  const enough = support >= minimum && points >= 10;
  return { success: enough, telemetryLines: [
    `${enough ? 'PASS' : 'FAIL'}: Jordan 2NT needs 10+ support points and ` +
      `${minimum}+ ${suit} cards (have ${points} points, ${support} cards).`,
  ], callEvidence: { competitiveResponse: {
    hcp: context.handFacts.hcp, supportPoints: points, minSupportPoints: 10,
    partnerSuit: suit, partnerSupport: support, minPartnerSupport: minimum,
  } } };
}

/// responderWeakJumpRaiseAfterInterferenceApplies requires a weak hand and substantial
/// support for a preemptive raise after Double or 1NT: four trumps in a major/D, five in C.
///
export function responderWeakJumpRaiseAfterInterferenceApplies (_call: Call, context: RuleEvalContext): AppliesWhenResult {
  const opening = getPartnerOpeningBid(context);
  if (opening === null || opening.level !== 1 || opening.strain === 'NT') {
    return { success: false, telemetryLines: ['A one-level suit opening is required.'] };
  }
  const suit = opening.strain as Suit;
  const minimum = suit === 'C' ? 5 : 4;
  const support = context.handFacts.lengths[suit];
  const hcp = context.handFacts.hcp;
  const points = context.handFacts.totalPointsWShortage;
  const enough = support >= minimum && hcp <= 6 && points <= 9;
  return { success: enough, telemetryLines: [
    `${enough ? 'PASS' : 'FAIL'}: weak jump raise needs ${minimum}+ ${suit}, ` +
      `0-6 HCP, and no more than 9 support points (have ${support}, ${hcp}, ${points}).`,
  ] };
}

///
//// Responder After a Natural 1NT Overcall
///

/// refineResponderNewSuitAfterNotrumpOvercall measures the cheapest natural new-suit response
/// from the opposing 1NT contract, not from partner's earlier one-level opening.
///
export function refineResponderNewSuitAfterNotrumpOvercall (calls: Call[], context: RuleEvalContext):
    CallRefinementResult {
  const opening = getOpeningCallInfo(context.dealer, context.auction);
  const parsedOpening = opening === null ? null : parseSuitBid(opening.call);
  if (opening === null || parsedOpening === null || parsedOpening.level !== 1 ||
      parsedOpening.strain === 'NT' || context.auction[opening.index + 1] !== '1NT') {
    return { calls: [], telemetryLines: ['No natural 1NT overcall of a one-level suit opening.'] };
  }
  return { calls: calls.filter((call) => {
    const candidate = parseSuitBid(call);
    return candidate !== null && candidate.strain !== 'NT' &&
      candidate.strain !== parsedOpening.strain &&
      cheapestBidInStrainAfter({ level: 1, strain: 'NT' }, candidate.strain) === call;
  }), telemetryLines: ['Natural new suit must be the cheapest available bid above opposing 1NT.'] };
}

///
//// Responder After a Preemptive Jump Overcall
///

/// refineResponderPreemptiveMajorGameRaise preserves the ordinary weak four-of-a-major
/// response except after a four-level jump overcall, where continuations are not modeled.
///
export function refineResponderPreemptiveMajorGameRaise (calls: Call[], context: RuleEvalContext):
    CallRefinementResult {
  const openingInfo = getOpeningCallInfo(context.dealer, context.auction);
  const overcall = openingInfo === null ? null : parseSuitBid(context.auction[openingInfo.index + 1] ?? 'Pass');
  if (getInterferenceAfterOpening(context.dealer, context.auction) === 'jumpSuitOvercall' &&
      overcall !== null && overcall.level >= 4) {
    return { calls: [], telemetryLines: ['Four-level jump-overcall responses remain unmodeled.'] };
  }
  return refineRaiseToLevel(calls, context, 4);
}

/// getJumpOvercallForResponder identifies an opposing two- or three-level jump suit
/// overcall of partner's one-level opening; four-level interference stays unmodeled.
///
function getJumpOvercallForResponder (context: RuleEvalContext):
    { opening: ParsedSuitBid; overcall: ParsedSuitBid } | null {
  if (getInterferenceAfterOpening(context.dealer, context.auction) !== 'jumpSuitOvercall') {
    return null;
  }
  const openingInfo = getOpeningCallInfo(context.dealer, context.auction);
  const opening = openingInfo === null ? null : parseSuitBid(openingInfo.call);
  const action = openingInfo === null ? undefined : context.auction[openingInfo.index + 1];
  const overcall = action === undefined ? null : parseSuitBid(action);
  if (opening === null || overcall === null || opening.level !== 1 ||
      opening.strain === 'NT' || overcall.strain === 'NT' ||
      (overcall.level !== 2 && overcall.level !== 3)) {
    return null;
  }
  return { opening, overcall };
}

/// refineResponderRaiseAfterJumpOvercall selects only the cheapest legal three-level raise,
/// enforcing four-card D support or five-card C support in addition to major support.
///
export function refineResponderRaiseAfterJumpOvercall (calls: Call[], context: RuleEvalContext,
                                                       level: number): CallRefinementResult {
  const auction = getJumpOvercallForResponder(context);
  if (auction === null || auction.opening.strain === 'NT') {
    return { calls: [], telemetryLines: ['No supported jump-overcall raise auction.'] };
  }
  const suit = auction.opening.strain as Suit;
  const minimum = suit === 'C' ? 5 : suit === 'D' ? 4 : 3;
  const cheapest = cheapestBidInStrainAfter(auction.overcall, suit);
  return { calls: context.handFacts.lengths[suit] < minimum ? [] :
    calls.filter((call) => call === cheapest && parseSuitBid(call)?.level === level),
    telemetryLines: [`Cheapest raise after opponent preempt; need ${minimum}+ ${suit} trumps.`] };
}

/// refineResponderNewSuitAfterJumpOvercall retains only an economical natural new suit
/// above the preempt, excluding both opener's strain and the opponent's cuebid strain.
///
export function refineResponderNewSuitAfterJumpOvercall (calls: Call[], context: RuleEvalContext):
    CallRefinementResult {
  const auction = getJumpOvercallForResponder(context);
  return { calls: auction === null ? [] : calls.filter((call) => {
    const bid = parseSuitBid(call);
    return bid !== null && bid.strain !== 'NT' &&
      bid.strain !== auction.opening.strain && bid.strain !== auction.overcall.strain &&
      cheapestBidInStrainAfter(auction.overcall, bid.strain) === call;
  }), telemetryLines: ['Natural new suit must be economical over the actual preempt.'] };
}

/// refineResponderCuebidAfterJumpOvercall restricts the artificial three-level opponent-suit
/// cuebid to a two-level jump overcall after a major-suit opening.
///
export function refineResponderCuebidAfterJumpOvercall (calls: Call[], context: RuleEvalContext):
    CallRefinementResult {
  const auction = getJumpOvercallForResponder(context);
  if (auction === null || auction.overcall.level !== 2 ||
      (auction.opening.strain !== 'H' && auction.opening.strain !== 'S')) {
    return { calls: [], telemetryLines: ['Only a two-level jump overcall of a major is modeled.'] };
  }
  const wanted = cheapestBidInStrainAfter(auction.overcall, auction.overcall.strain);
  return { calls: calls.filter((call) => call === wanted),
    telemetryLines: ['Opponent suit is a game-going support cuebid, not a natural suit.'] };
}

/// responderPassAfterJumpOvercallApplies allows 6-9 HCP to Pass when responder lacks
/// sufficient support points and trump length for an economical competitive raise.
///
export function responderPassAfterJumpOvercallApplies (_call: Call, context: RuleEvalContext):
    AppliesWhenResult {
  const auction = getJumpOvercallForResponder(context);
  if (auction === null) {
    return { success: false, telemetryLines: ['No supported jump-overcall Pass auction.'] };
  }
  const suit = auction.opening.strain as Suit;
  const minimum = suit === 'C' ? 5 : suit === 'D' ? 4 : 3;
  const economical = cheapestBidInStrainAfter(auction.overcall, suit);
  const raiseIsAvailable = economical !== null && parseSuitBid(economical)?.level === 3 &&
    context.handFacts.lengths[suit] >= minimum && context.handFacts.totalPointsWShortage >= 8;
  const hcp = context.handFacts.hcp;
  const success = hcp >= 6 && hcp <= 9 && ! raiseIsAvailable;
  return { success, telemetryLines: [
    `${success ? 'PASS' : 'FAIL'}: limited Pass needs 6-9 HCP and no qualifying economical raise; ` +
      `have ${hcp} HCP, economical raise ${economical ?? 'none'}.`,
  ] };
}

/// responderNegativeDoubleAfterJumpOvercallApplies checks 10+ HCP at the two level or
/// 12+ at the three level and four cards in each relevant unbid suit.
///
export function responderNegativeDoubleAfterJumpOvercallApplies (_call: Call, context: RuleEvalContext):
    AppliesWhenResult {
  const auction = getJumpOvercallForResponder(context);
  if (auction === null) {
    return { success: false, telemetryLines: ['No supported jump-overcall negative double.'] };
  }
  const unbid = SUITS.filter((suit) => suit !== auction.opening.strain &&
                                   suit !== auction.overcall.strain);
  const majors = unbid.filter((suit) => suit === 'H' || suit === 'S');
  const relevant = majors.length > 0 ? majors : unbid;
  const suitsOkay = relevant.every((suit) => context.handFacts.lengths[suit] >= 4);
  const minimum = auction.overcall.level === 2 ? 10 : 12;
  const success = context.handFacts.hcp >= minimum && suitsOkay;
  return { success, telemetryLines: [
    `${success ? 'PASS' : 'FAIL'}: jump-overcall negative double needs ${minimum}+ HCP and ` +
      `4+ in ${relevant.join(', ')}; have ${context.handFacts.hcp} HCP.`,
  ], callEvidence: { competitiveResponse: {
    hcp: context.handFacts.hcp, minHcp: minimum,
    unbidSuits: relevant.map((suit) => ({
      suit, length: context.handFacts.lengths[suit], min: 4,
    })),
  } } };
}

/// responderCuebidAfterJumpOvercallApplies checks a 13+ support-point game-going
/// cuebid with three or more cards in opener's major.
///
export function responderCuebidAfterJumpOvercallApplies (_call: Call, context: RuleEvalContext):
    AppliesWhenResult {
  const auction = getJumpOvercallForResponder(context);
  if (auction === null || auction.overcall.level !== 2 ||
      (auction.opening.strain !== 'H' && auction.opening.strain !== 'S')) {
    return { success: false, telemetryLines: ['No supported major-opening cuebid.'] };
  }
  const support = context.handFacts.lengths[auction.opening.strain];
  const points = context.handFacts.totalPointsWShortage;
  const success = support >= 3 && points >= 13;
  return { success, telemetryLines: [
    `${success ? 'PASS' : 'FAIL'}: support cuebid needs 3+ trump and 13+ support points; ` +
      `have ${support} trump, ${points} points.`,
  ], callEvidence: { competitiveResponse: {
    hcp: context.handFacts.hcp, supportPoints: points, minSupportPoints: 13,
    partnerSuit: auction.opening.strain as Suit,
    partnerSupport: support, minPartnerSupport: 3,
  } } };
}

/// responderNotrumpAfterJumpOvercallApplies checks balanced 2NT/3NT strength and the
/// shared conservative stopper in the opponent's preempt suit.
///
export function responderNotrumpAfterJumpOvercallApplies (call: Call, context: RuleEvalContext):
    AppliesWhenResult {
  const auction = getJumpOvercallForResponder(context);
  if (auction === null || (call !== '2NT' && call !== '3NT')) {
    return { success: false, telemetryLines: ['No supported natural notrump response.'] };
  }
  const hcp = context.handFacts.hcp;
  const pointsOkay = call === '2NT' ? hcp >= 11 && hcp <= 12 : hcp >= 13 && hcp <= 15;
  const stopper = hasBasicSuitStopper(context, auction.overcall.strain as Suit);
  const success = pointsOkay && context.handFacts.balanced && stopper;
  return { success, telemetryLines: [
    `${success ? 'PASS' : 'FAIL'}: ${call} needs ${call === '2NT' ? '11-12' : '13-15'} HCP, ` +
      `balanced shape, and a ${auction.overcall.strain} stopper.`,
  ] };
}
