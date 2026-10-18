/// Shared natural calls after two-level natural suit interference over partner's natural 1NT.
/// After a 1NT opening, this means the natural one-suited DONT 2S; after a
/// natural 1NT overcall, the opponent's suit response remains natural.
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
    callCategory: ['conventional', 'forcing'],
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


/// After our own 1NT opening, 2H is NOT a natural heart overcall: under the app's
/// fixed DONT agreement it shows both majors. Use selected natural continuations
/// that respect both opposing suits. More complex defenses (including Double and
/// cuebids of a shown suit) remain unjudged rather than assigned false meanings.
function isDontMajorsAfterOneNt (context: RuleEvalContext): boolean {
  const opening = context.auction.findIndex((call) => call !== 'Pass');
  return opening >= 0 && context.auction[opening] === '1NT' &&
    context.auction.length === opening + 2 && context.auction[opening + 1] === '2H';
}

function dontMajorsNaturalNt (context: RuleEvalContext, system: BiddingSystem,
                              low: number, high: number): AppliesWhenResult {
  const hcp = context.handFacts.hcp;
  const shift = oneNtResponseHcpShift(system);
  const stopped = hasBasicSuitStopper(context, 'H') && hasBasicSuitStopper(context, 'S');
  const success = isDontMajorsAfterOneNt(context) && hcp >= low - shift &&
    hcp <= high - shift && context.handFacts.balanced && stopped;
  return { success, telemetryLines: [
    `${success ? 'PASS' : 'FAIL'}: ${low - shift}-${high - shift} HCP, balanced, and ` +
      'stoppers in BOTH majors shown by DONT 2H.',
  ] };
}

function dontMajorsNaturalMinor (call: Call, context: RuleEvalContext,
                                system: BiddingSystem): AppliesWhenResult {
  const suit = call === '3C' ? 'C' : 'D';
  const hcp = context.handFacts.hcp;
  const min = 10 - oneNtResponseHcpShift(system);
  const success = isDontMajorsAfterOneNt(context) && hcp >= min &&
    context.handFacts.lengths[suit] >= 5 && hasTwoOfTopThreeHonors(context.hand, suit);
  return { success, telemetryLines: [
    `${success ? 'PASS' : 'FAIL'}: natural 3${suit} needs ${min}+ HCP, ` +
      'five or more cards and two top honors; both majors belong to opponents.',
  ] };
}

export const DontTwoMajorInterferenceResponseRules: BidRule[] = [
  {
    id: 'respond-after-dont-majors-pass',
    kind: 'responseBid',
    title: 'Pass weakly when DONT 2H shows both majors',
    auctionContext: { stage: 'responding', openerCalls: ['1NT'] },
    calls: ['Pass'],
    callCategory: ['signoff'],
    appliesWhen: (_call, context, system) => ({
      success: isDontMajorsAfterOneNt(context) &&
        context.handFacts.hcp <= 7 - oneNtResponseHcpShift(system),
      telemetryLines: ['Pass is an ordinary weak action over DONT interference.'],
    }),
    meaning: 'Insufficient values for a selected constructive action against both majors.',
    certainty: 'high',
  },
  {
    id: 'respond-after-dont-majors-2nt',
    kind: 'responseBid',
    title: 'Natural 2NT invitation with both majors stopped over DONT',
    auctionContext: { stage: 'responding', openerCalls: ['1NT'] },
    calls: ['2NT'],
    callCategory: ['natural', 'invitational'],
    appliesWhen: (_call, context, system) => dontMajorsNaturalNt(context, system, 8, 9),
    meaning: 'Natural invitation with balanced values and stoppers in hearts and spades.',
    certainty: 'high',
  },
  {
    id: 'respond-after-dont-majors-3nt',
    kind: 'responseBid',
    title: 'Natural 3NT game with both majors stopped over DONT',
    auctionContext: { stage: 'responding', openerCalls: ['1NT'] },
    calls: ['3NT'],
    callCategory: ['natural', 'signoff'],
    appliesWhen: (_call, context, system) => dontMajorsNaturalNt(context, system, 10, 15),
    meaning: 'Natural game with balanced values and stoppers in both opposing majors.',
    certainty: 'high',
  },
  {
    id: 'respond-after-dont-majors-natural-minor',
    kind: 'responseBid',
    title: 'Bid a strong natural minor at the three level over DONT majors',
    auctionContext: { stage: 'responding', openerCalls: ['1NT'] },
    calls: ['3C', '3D'],
    callCategory: ['natural'],
    appliesWhen: dontMajorsNaturalMinor,
    meaning: 'Constructive, natural minor suit outside the two suits shown by DONT.',
    guidance: ['A five-card minor with two of the top three honors and 10+ HCP is needed ' +
               '(9+ over a configured 16–18 1NT opening).',
               'This is nonforcing; opener may pass without a suitable notrump contract.'],
    certainty: 'high',
  },
  {
    id: 'respond-after-dont-scope-boundary',
    kind: 'scopeBoundary',
    title: 'Other continuations after an opposing artificial DONT overcall',
    auctionContext: { stage: 'responding', openerCalls: ['1NT'] },
    scopeBoundaryWhen: (context) => ({
      success: (() => {
        const first = context.auction.findIndex((call) => call !== 'Pass');
        return first >= 0 && context.auction[first] === '1NT' &&
          context.auction.length === first + 2 &&
          ['2C', '2D', '2H'].includes(context.auction[first + 1] ?? '');
      })(),
      telemetryLines: ['DONT is artificial: direct 2C, 2D, and 2H show two suits.'],
    }),
    meaning: 'DONT shows two suits; unagreed doubles and cuebids are not judged as natural bids.',
    guidance: ['Over DONT 2H, both hearts and spades belong to the opponents, so 2S is ' +
               'not a natural spade response and an ordinary heart-only negative Double ' +
               'description is wrong.',
               'Beyond the selected natural minor and stopped NT decisions, further ' +
               'defensive meanings require specific partnership agreements.'],
    certainty: 'high',
  },
];
