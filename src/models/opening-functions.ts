/// Opening Bid Functions: refiners, applicability checks, and related helpers.

import {
  type AppliesWhenResult, type BiddingSystem, type Call, type CallRefinementResult,
  type RuleEvalContext
} from './bidding-types';
import { hasPreemptSuitQuality, type Suit } from './cards';
import { parseSuitBid } from './auction';

///
//// Suit and Notrump Openings
///

/// refineOneLevelSuitOpening chooses the one-level suit opening implied by five-card-major and
/// convenient-minor priorities.  Branch order is significant: with two 5+ majors choose the
/// higher-ranking spade suit; otherwise use the longer minor, breaking a 4-4 minor tie with 1D and
/// a 3-3 tie with 1C.
///
export function refineOneLevelSuitOpening (calls: Call[], context: RuleEvalContext) : 
      CallRefinementResult {
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

/// The convenient-minor route should not open a balanced 11-HCP hand just because its
/// five-card minor adds a length point: the ordinary balanced 1NT rebid promises 12 HCP.
/// Keep the separately selected five-card-major opening treatment unchanged.
export function convenientMinorOpeningValuesApply (_call: Call, context: RuleEvalContext):
    AppliesWhenResult {
  const facts = context.handFacts;
  const success = ! facts.hasFiveCardMajor && facts.hcp <= 21 && facts.totalPointsWLength >= 12 &&
    (! facts.balanced || facts.hcp >= 12);
  return { success, telemetryLines: [
    `${success ? 'PASS' : 'FAIL'}: convenient-minor opening needs 12 length-adjusted points, ` +
    'and at least 12 HCP when balanced; ' +
    `HCP ${facts.hcp}, length-adjusted ${facts.totalPointsWLength}, balanced ${facts.balanced}.`,
  ] };
}

/// guidelineOf20Applies tests the Rule of 20 in first or second seat for a hand below 12 HCP.
/// This is a separate valuation explanation: under our ordinary HCP-plus-length opening method,
/// every Rule-of-20 qualifier already satisfies the 12-total-point opening minimum.
///
export function guidelineOf20Applies (_call: Call, context: RuleEvalContext): AppliesWhenResult {
  const lengths = Object.values(context.handFacts.lengths).sort((a, b) => b - a);
  const value = context.handFacts.hcp + (lengths[0] ?? 0) + (lengths[1] ?? 0);
  // getNextBiddingRuleStage only identifies opening before a contract is bid, so the preceding calls here
  // are Passes. Zero or one preceding Pass means first or second seat respectively.
  const firstOrSecondSeat = context.auction.length <= 1;
  const pass = firstOrSecondSeat && context.handFacts.hcp < 12 && value >= 20;
  return {
    success: pass,
    telemetryLines: [
      `${pass ? 'APPLIES' : 'FAIL'}: Guideline of 20 (first/second seat only) = ` +
      `HCP ${context.handFacts.hcp} + ${lengths[0] ?? 0} + ${lengths[1] ?? 0} = ${value}; ` +
      `position=${context.auction.length + 1}.`, ],
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
    basicOpeningEvidence: [
      { kind: 'hcp', actual: context.handFacts.hcp,
        min: normalMinimum - 1, max: normalMinimum - 1,
        passed: context.handFacts.hcp === normalMinimum - 1 },
      { kind: 'balanced', actual: context.handFacts.balanced,
        passed: context.handFacts.balanced },
      { kind: 'fiveCardMajor', actual: hasFiveCardMajor, passed: hasFiveCardMajor },
    ],
    telemetryLines: [
      `${success ? 'APPLIES' : 'FAIL'}: 1NT five-card-major upgrade needs balanced, ` +
      `${normalMinimum - 1} HCP, and a five-card major; HCP=${context.handFacts.hcp}, ` +
      `H=${context.handFacts.lengths.H}, S=${context.handFacts.lengths.S}.`,],};
}

///
//// Preemptive Openings
///

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
