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

/// Choose the longest five-card major first, breaking equal-major ties with spades.
/// Without a five-card major, choose the longer minor; four-four ties favor diamonds,
/// three-three ties favor clubs, and equal longer minors favor diamonds.
export function refineOneLevelSuitOpening (calls: Call[], context: RuleEvalContext) :
      CallRefinementResult {
  const lengths = context.handFacts.lengths;
  let wantedCall: Call;
  let reason: NonNullable<CallRefinementResult['callEvidence']>['openingSelection'];
  if (lengths.S >= 5 || lengths.H >= 5) {
    wantedCall = lengths.H > lengths.S ? '1H' : '1S';
    reason = { call: wantedCall, reason: lengths.H === lengths.S ? 'equal-majors' :
      Math.min(lengths.H, lengths.S) >= 5 ? 'longer-major' : 'only-major' };
  } else if (lengths.D > lengths.C) {
    wantedCall = '1D';
    reason = { call: wantedCall, reason: 'longer-minor' };
  } else if (lengths.C > lengths.D) {
    wantedCall = '1C';
    reason = { call: wantedCall, reason: 'longer-minor' };
  } else if (lengths.D >= 4) {
    wantedCall = '1D';
    reason = { call: wantedCall, reason: lengths.D === 4 ? 'equal-four-minors' : 'equal-long-minors' };
  } else {
    wantedCall = '1C';
    reason = { call: wantedCall, reason: 'equal-three-minors' };
  }
  return {
    calls: calls.filter((call) => call === wantedCall),
    callEvidence: { openingSelection: reason },
    telemetryLines: [`One-level suit opening resolves to ${wantedCall} by ${reason.reason}.`],
  };
}

/// The convenient-minor route should not open a balanced 11-HCP hand just because its
/// five-card minor adds a length point: the ordinary balanced 1NT rebid promises 12 HCP.
/// Keep the separately selected five-card-major opening treatment unchanged.
export function convenientMinorOpeningValuesApply (_call: Call, context: RuleEvalContext):
    AppliesWhenResult {
  const facts = context.handFacts;
  const success = ! facts.hasFiveCardMajor && facts.hcp <= 21 && facts.totalPointsWLength >= 12 &&
    (! facts.balanced || facts.hcp >= 12);
  return { success,
    callEvidence: { convenientMinor: { hcp: facts.hcp,
      totalPoints: facts.totalPointsWLength, balanced: facts.balanced,
      hasFiveCardMajor: facts.hasFiveCardMajor } },
    telemetryLines: [
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
    callEvidence: { requirements: [
      { kind: 'hcp', actual: context.handFacts.hcp,
        min: normalMinimum - 1, max: normalMinimum - 1,
        passed: context.handFacts.hcp === normalMinimum - 1 },
      { kind: 'balanced', actual: context.handFacts.balanced,
        passed: context.handFacts.balanced },
      { kind: 'fiveCardMajor', actual: hasFiveCardMajor, passed: hasFiveCardMajor },
    ] },
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
