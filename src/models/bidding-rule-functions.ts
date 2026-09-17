/// Bidding rule call refiners, appliesWhen functions, and their shared helpers.

import { biddingBaseline, strainOrder, type AppliesWhenResult, type BiddingSystem, type Call,
         type CallRefinementResult, type RuleEvalContext, type Strain, type SuitBid }
  from './bidding-types';
import { hasPreemptSuitQuality, type Suit } from './cards';

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
  const openingIndex = strainOrder.indexOf(opening.strain);
  const refined = calls.filter((call) => {
    const candidate = parseSuitBid(call);
    if (candidate === null || candidate.strain === 'NT' || candidate.strain === opening.strain) {
      return false;
    }
    return strainOrder.indexOf(candidate.strain) < openingIndex &&
           cheapestNewSuitBid(opening, candidate.strain) === call;
  });
  return {
    calls: refined,
    telemetryLines: ['Keep only a cheapest lower-ranking second-suit rebid; exclude reverses.'],
  };
}

/// refineOpenerReverseRebid keeps higher-ranking new suits at the two level.  This classifies the
/// call geometrically; the reverse rule's appliesWhen separately enforces the extra strength.
export function refineOpenerReverseRebid (calls: Call[], context: RuleEvalContext):
    CallRefinementResult {
  const opening = getOpenerOpeningBid(context);
  if (opening === null || opening.strain === 'NT') {
    return { calls: [], telemetryLines: ['No suit opening is available for a reverse.'] };
  }
  const openingIndex = strainOrder.indexOf(opening.strain);
  const refined = calls.filter((call) => {
    const candidate = parseSuitBid(call);
    if (candidate === null || candidate.strain === 'NT' || candidate.strain === opening.strain) {
      return false;
    }
    return candidate.level === 2 && strainOrder.indexOf(candidate.strain) > openingIndex;
  });
  return { calls: refined, telemetryLines: ['Keep only higher-ranking two-level second suits.'] };
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

/// cheapestNewSuitBid returns the cheapest legal contract bid in a different strain after opening.
/// Callers that mean "new suit" reject NT candidates before calling this function.  If opening is
/// NT, any suit must be bid at the next level because NT outranks every suit at the current level.
///
function cheapestNewSuitBid (opening: { level: number; strain: Strain }, strain: Strain): SuitBid | null {
  if (strain === opening.strain) {
    return null;
  }
  // let level = opening.level;
  // if (getBidRank(level, strain) <= getBidRank(opening.level, opening.strain)) {
  //   level += 1;
  // }
  const level = opening.strain === 'NT' ||
                strainOrder.indexOf(strain) < strainOrder.indexOf(opening.strain)
                ? opening.level + 1 : opening.level;
  if (level > 7) {
    return null;
  }
  return `${level}${strain}` as SuitBid;
}

/// getBidRank returns an absolute index into a virtual table of all possible bids.  If the table
/// had rows 1C..1NT, 2C..2NT, etc., then this function returns the row major index of the bid.
///
// function getBidRank (level: number, strain: Strain): number {
//   return (level - 1) * strainOrder.length + strainOrder.indexOf(strain);
// }


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

/// openerLowerRankingSecondSuitApplies requires the ordinary 12-18 total-point range,
/// five or more cards in the opening minor, and four or more cards in the lower-ranking second suit.
export function openerLowerRankingSecondSuitApplies (call: Call, context: RuleEvalContext):
    AppliesWhenResult {
  return openerSecondSuitApplies(call, context, 12, 18, 'lower-ranking second suit');
}

/// openerReverseApplies requires extra strength for a geometrically reverse-shaped rebid.
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

/// getOpenerOpeningBid returns the first contract bid in the full auction.
function getOpenerOpeningBid (context: RuleEvalContext): { level: number; strain: Strain } | null {
  for (const call of context.auction) {
    const bid = parseSuitBid(call);
    if (bid !== null) {
      return bid;
    }
  }
  return null;
}

/// getPartnerOpeningBid parses partnerOpeningCall when the current rule needs the exact
/// level/strain partner opened.  Return null for a missing opening or a non-contract call.
///
function getPartnerOpeningBid (context: RuleEvalContext): { level: number; strain: Strain } | null {
  if (context.partnerOpeningCall === null) {
    return null;
  }
  return parseSuitBid(context.partnerOpeningCall);
}

/// parseSuitBid parses a contract Call into numeric level and Strain for candidate refinement
/// functions and appliesWhen test functions.  Pass, Double, and Redouble are not contract bids and
/// return null.
///
function parseSuitBid (call: Call): { level: number; strain: Strain } | null {
  if (call === 'Pass' || call === 'Double' || call === 'Redouble') {
    return null;
  }
  const level = Number(call.substring(0, 1));
  const strain = call.substring(1) as Strain;
  return { level, strain };
}
