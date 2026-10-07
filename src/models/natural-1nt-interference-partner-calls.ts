/// Shared natural calls after two-level natural suit interference over partner's natural 1NT.
/// These rules apply both after a 1NT opening and after a direct natural 1NT overcall.
/// Stayman, Jacoby, and Texas remain off once the opponent makes the natural suit bid.
/// BidRule has no neutral partner-call kind, so these shared declarations use responseBid.

import { oneNtResponseHcpShift, type AppliesWhenResult, type BidRule, type BiddingSystem,
         type Call, type CallRefinementResult, type RuleEvalContext } from './bidding-types';
import { hasTwoOfTopThreeHonors, SUITS, type Suit } from './cards';
import { cheapestBidInStrainAfter, getPartnerOneNtSuitInterference, parseSuitBid } from './auction';
import { hasBasicSuitStopper } from './common-rule-helpers';


export const NaturalOneNtInterferencePartnerCallRules: BidRule[] = [
  //
  {
    id: 'partner-of-1nt-after-interference-pass',
    kind: 'responseBid',
    title: 'Pass weakly after natural interference over partner\'s 1NT',
    auctionContext: { partnerNaturalOneNtAfterSuitInterference: true },
    calls: ['Pass'],
    callCategory: ['signoff'],
    appliesWhen: { hcp: { min: 0, max: 7 }, hcpRelativeToOneNtOpening: true },
    priority: { rank: 10 },
    guidance: ['15-17: 0-7 HCP; 16-18: 0-6 HCP.',
               'Natural interference turns off the ordinary Stayman and transfer treatments.'],
    meaning: 'No constructive action after the opponent competes over partner\'s 1NT.',
    certainty: 'high',
  },
  //
  {
    id: 'partner-of-1nt-after-interference-natural-suit-two-level',
    kind: 'responseBid',
    title: 'Bid a good natural suit economically at the two level after 1NT interference',
    auctionContext: { partnerNaturalOneNtAfterSuitInterference: true },
    calls: ['2C', '2D', '2H', '2S'],
    callRefinement: (calls, context) => refineNaturalSuitAfterOneNtInterference(calls, context, 2),
    callCategory: ['natural'],
    appliesWhen: (call, context, system) =>
      naturalSuitAfterOneNtInterferenceApplies(call, context, system, 8),
    priority: { rank: 70 },
    guidance: ['15-17: normally 8+ HCP; 16-18: normally 7+ HCP.',
               'The suit must contain five or more cards with at least two of A/K/Q.',
               'This is a natural, nonforcing competitive action.'],
    meaning: 'Natural competitive suit bid after the opponent interferes over partner\'s 1NT.',
    certainty: 'high',
  },
  //
  {
    id: 'partner-of-1nt-after-interference-natural-suit-three-level',
    kind: 'responseBid',
    title: 'Bid a good natural suit economically at the three level after 1NT interference',
    auctionContext: { partnerNaturalOneNtAfterSuitInterference: true },
    calls: ['3C', '3D', '3H', '3S'],
    callRefinement: (calls, context) => refineNaturalSuitAfterOneNtInterference(calls, context, 3),
    callCategory: ['natural'],
    appliesWhen: (call, context, system) =>
      naturalSuitAfterOneNtInterferenceApplies(call, context, system, 10),
    priority: { rank: 70 },
    guidance: ['15-17: normally 10+ HCP; 16-18: normally 9+ HCP.',
               'The suit must contain five or more cards with at least two of A/K/Q.',
               'This treatment is deliberately natural rather than an artificial relay or ' +
               'transfer method.'],
    meaning: 'Natural constructive suit bid when interference forces the auction to three.',
    certainty: 'medium',
  },
  //
  {
    id: 'partner-of-1nt-after-interference-2nt',
    kind: 'responseBid',
    title: 'Invite with 2NT after natural interference over partner\'s 1NT',
    auctionContext: { partnerNaturalOneNtAfterSuitInterference: true },
    calls: ['2NT'],
    callCategory: ['invitational', 'natural'],
    appliesWhen: (_call, context, system) =>
      naturalNotrumpAfterOneNtInterferenceApplies(context, system, 8, 9),
    priority: { rank: 60 },
    guidance: ['15-17: 8-9 HCP; 16-18: 7-8 HCP.',
               'A basic stopper in the interference suit is required.'],
    meaning: 'Natural invitation with balanced shape and a stopper in the opponent\'s suit.',
    certainty: 'high',
  },
  //
  {
    id: 'partner-of-1nt-after-interference-3nt',
    kind: 'responseBid',
    title: 'Bid 3NT after natural interference over partner\'s 1NT',
    auctionContext: { partnerNaturalOneNtAfterSuitInterference: true },
    calls: ['3NT'],
    callCategory: ['signoff', 'natural'],
    appliesWhen: (_call, context, system) =>
      naturalNotrumpAfterOneNtInterferenceApplies(context, system, 10, 15),
    priority: { rank: 60 },
    guidance: ['15-17: 10-15 HCP; 16-18: 9-14 HCP.',
               'A basic stopper in the interference suit is required.'],
    meaning: 'Natural game bid with balanced shape and a stopper in the opponent\'s suit.',
    certainty: 'high',
  },
  //
  {
    id: 'partner-of-1nt-after-interference-negative-double',
    kind: 'responseBid',
    title: 'Make a negative Double after natural interference over partner\'s 1NT',
    auctionContext: { partnerNaturalOneNtAfterSuitInterference: true },
    calls: ['Double'],
    callCategory: ['conventional'],
    appliesWhen: negativeDoubleAfterOneNtInterferenceApplies,
    priority: { rank: 40 },
    guidance: ['15-17: normally 8+ HCP; 16-18: normally 7+ HCP.',
               'Double is takeout-oriented, not a penalty Double.',
               'With minor-suit interference, show both available majors when both are unbid.',
               'With major-suit interference, show the available unbid major or, when no major ' +
               'is available, both minors.',
               'Prefer a descriptive natural suit or notrump action when it fits clearly.'],
    meaning: 'Negative/takeout Double showing values and useful shape in the unbid suits.',
    certainty: 'high',
  },
];


function refineNaturalSuitAfterOneNtInterference (calls: Call[], context: RuleEvalContext,
                                                  level: number): CallRefinementResult {
  const info = getPartnerOneNtSuitInterference(context.dealer, context.auction);
  if (info === null) {
    return { calls: [], telemetryLines: [
      'No supported natural interference over partner\'s 1NT.',
    ] };
  }
  const excluded = new Set<Suit>([info.interference.strain as Suit]);
  if (info.opponentOpening !== null && info.opponentOpening.strain !== 'NT') {
    excluded.add(info.opponentOpening.strain as Suit);
  }
  const refined = calls.filter((call) => {
    const bid = parseSuitBid(call);
    return bid !== null && bid.level === level && bid.strain !== 'NT' &&
      ! excluded.has(bid.strain as Suit) &&
      cheapestBidInStrainAfter(info.interference, bid.strain) === call;
  });
  return { calls: refined, telemetryLines: [
    `Natural suit calls at level ${level} must be economical and avoid the opponents' suits.`,
  ] };
}

function naturalSuitAfterOneNtInterferenceApplies (call: Call, context: RuleEvalContext,
                                                    system: BiddingSystem,
                                                    baseMinimumHcp: number): AppliesWhenResult {
  const bid = parseSuitBid(call);
  if (bid === null || bid.strain === 'NT') {
    return { success: false, telemetryLines: ['A natural suit call is required.'] };
  }
  const suit = bid.strain as Suit;
  const minimum = baseMinimumHcp - oneNtResponseHcpShift(system);
  const length = context.handFacts.lengths[suit];
  const hcp = context.handFacts.hcp;
  const goodSuit = hasTwoOfTopThreeHonors(context.hand, suit);
  const success = hcp >= minimum && length >= 5 && goodSuit;
  return { success, telemetryLines: [
    `${success ? 'PASS' : 'FAIL'}: natural ${call} needs ${minimum}+ HCP, 5+ cards, and ` +
      `two of A/K/Q (have ${hcp} HCP and ${length} cards).`,
  ] };
}

function naturalNotrumpAfterOneNtInterferenceApplies (context: RuleEvalContext,
                                                       system: BiddingSystem, baseMin: number,
                                                       baseMax: number): AppliesWhenResult {
  const info = getPartnerOneNtSuitInterference(context.dealer, context.auction);
  if (info === null || info.interference.strain === 'NT') {
    return { success: false, telemetryLines: ['No supported natural suit interference.'] };
  }
  const shift = oneNtResponseHcpShift(system);
  const min = baseMin - shift;
  const max = baseMax - shift;
  const hcp = context.handFacts.hcp;
  const stopper = hasBasicSuitStopper(context, info.interference.strain as Suit);
  const success = hcp >= min && hcp <= max && context.handFacts.balanced && stopper;
  return { success, telemetryLines: [
    `${success ? 'PASS' : 'FAIL'}: natural NT needs ${min}-${max} HCP, balanced shape, and ` +
      `a stopper in ${info.interference.strain}.`,
  ] };
}

function negativeDoubleAfterOneNtInterferenceApplies (_call: Call, context: RuleEvalContext,
                                                       system: BiddingSystem): AppliesWhenResult {
  const info = getPartnerOneNtSuitInterference(context.dealer, context.auction);
  if (info === null || info.interference.strain === 'NT') {
    return { success: false, telemetryLines: ['No supported natural suit interference.'] };
  }
  const minimum = 8 - oneNtResponseHcpShift(system);
  const excluded = new Set<Suit>([info.interference.strain as Suit]);
  if (info.opponentOpening !== null && info.opponentOpening.strain !== 'NT') {
    excluded.add(info.opponentOpening.strain as Suit);
  }
  const available = SUITS.filter((suit) => ! excluded.has(suit));
  const availableMajors = available.filter((suit) => suit === 'H' || suit === 'S');
  let shapeFits = false;
  if (availableMajors.length >= 2) {
    shapeFits = availableMajors.every((suit) => context.handFacts.lengths[suit] >= 4);
  } else if (availableMajors.length === 1) {
    shapeFits = context.handFacts.lengths[availableMajors[0]!] >= 4;
  } else {
    shapeFits = available.length >= 2 &&
      available.slice(0, 2).every((suit) => context.handFacts.lengths[suit] >= 4);
  }
  const success = context.handFacts.hcp >= minimum && shapeFits;
  return { success, telemetryLines: [
    `${success ? 'PASS' : 'FAIL'}: negative Double needs ${minimum}+ HCP and takeout shape ` +
      `in the available suits (have ${context.handFacts.hcp} HCP).`,
  ] };
}
