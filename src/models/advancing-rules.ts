/// Advancing Overcalls and Competitive Bidding

import { type BidRule } from './bidding-types';
import { naturalNotrumpAdvanceApplies, naturalTakeoutDoubleNotrumpAdvanceApplies,
         naturalTwoLevelNotrumpAdvanceApplies, refineTakeoutDoubleSuitAdvance,
         refineTakeoutDoubleCuebid, refineTakeoutDoubleMajorGame,
         refineAdvancerCuebid, refineAdvancerNewSuit, refineAdvancerRaise,
         refineAdvancerTwoLevelCuebid, refineAdvancerTwoLevelNewSuit,
         refineAdvancerTwoLevelRaise } from './advancing-functions';


export const AdvanceRules: BidRule[] = [
  // First family: advance partner's natural one-level suit overcall when responder passes.
  // The refiners also require the actual auction shape and exclude other overcall levels.
  {
    id: 'advance-one-level-suit-overcall-simple-raise',
    kind: 'advance',
    title: 'Give partner a simple raise after a one-level suit overcall',
    auctionContext: { stage: 'advancing', openerLevel: 1, openerStrain: 'suit',
                      interference: 'suitOvercall' },
    calls: ['2C', '2D', '2H', '2S'],
    callRefinement: refineAdvancerRaise,
    callCategory: ['natural'],
    priority: { rank: 10 },
    appliesWhen: { totalPoints: { min: 6, max: 10, valuation: 'shortage' },
                   supportLength: { min: 3 } },
    meaning: 'A constructive, nonforcing raise with 6-10 support points and 3+ trumps.',
    guidance: ['An overcall may be lighter than an opening bid. Value a known fit with ' +
               'shortage points, not ordinary length points.'],
    certainty: 'high',
  },
  //
  {
    id: 'advance-one-level-suit-overcall-preemptive-raise',
    kind: 'advance',
    title: 'Make a weak jump raise with four trumps',
    auctionContext: { stage: 'advancing', openerLevel: 1, openerStrain: 'suit',
                      interference: 'suitOvercall' },
    calls: ['3C', '3D', '3H', '3S'],
    callRefinement: refineAdvancerRaise,
    callCategory: ['natural', 'signoff'],
    priority: { rank: 15 },
    appliesWhen: { totalPoints: { max: 6, valuation: 'shortage' },
                   supportLength: { min: 4 } },
    meaning: 'A preemptive, nonforcing jump raise with 4+ trumps and at most 6 support points.',
    guidance: ['The jump consumes opponents’ bidding room; it is not a traditional limit raise.',
               'At exactly 6 support points, the simple raise may also qualify.'],
    certainty: 'high',
  },
  //
  {
    id: 'advance-one-level-suit-overcall-support-cuebid',
    kind: 'advance',
    title: 'Cuebid opener’s suit to show a strong raise',
    auctionContext: { stage: 'advancing', openerLevel: 1, openerStrain: 'suit',
                      interference: 'suitOvercall' },
    calls: ['2C', '2D', '2H', '2S'],
    callRefinement: refineAdvancerCuebid,
    callCategory: ['conventional', 'forcing'],
    priority: { rank: 20 },
    appliesWhen: { totalPoints: { min: 11, valuation: 'shortage' },
                   supportLength: { min: 3 } },
    meaning: 'An artificial cuebid of opener’s suit: 11+ support points, ' +
             '3+ trumps, invitational or stronger, forcing one round.',
    guidance: ['This is not a natural bid of the opponents’ suit. ' +
               'The cuebid frees the direct jump raise to be preemptive.'],
    certainty: 'high',
  },
  //
  {
    id: 'advance-one-level-suit-overcall-one-notrump',
    kind: 'advance',
    title: 'Advance 1NT with a stopper',
    auctionContext: { stage: 'advancing', openerLevel: 1, openerStrain: 'suit',
                      interference: 'suitOvercall' },
    calls: ['1NT'],
    callCategory: ['natural'],
    appliesWhen: naturalNotrumpAdvanceApplies, // 8-11 HCP, balanced, opening-suit stopper
    meaning: 'Natural, nonforcing 1NT: 8-11 HCP, balanced, with a stopper in opener’s suit.',
    guidance: ['A one-level overcall can be light, so these NT ranges are not the same as ' +
               'responses to a full opening bid.'],
    certainty: 'high',
  },
  //
  {
    id: 'advance-one-level-suit-overcall-two-notrump',
    kind: 'advance',
    title: 'Invite with natural 2NT and a stopper',
    auctionContext: { stage: 'advancing', openerLevel: 1, openerStrain: 'suit',
                      interference: 'suitOvercall' },
    calls: ['2NT'],
    callCategory: ['natural', 'invitational'],
    appliesWhen: naturalNotrumpAdvanceApplies, // 12-14 HCP, balanced, opening-suit stopper
    meaning: 'Natural, invitational 2NT: 12-14 HCP, balanced, with an opener-suit stopper.',
    guidance: ['Partner judges the invitation against the strength and quality of the overcall.'],
    certainty: 'high',
  },
  //
  {
    id: 'advance-one-level-suit-overcall-new-suit-at-one-level',
    kind: 'advance',
    title: 'Show a five-card new suit at the one level',
    auctionContext: { stage: 'advancing', openerLevel: 1, openerStrain: 'suit',
                      interference: 'suitOvercall' },
    calls: ['1D', '1H', '1S'],
    callRefinement: refineAdvancerNewSuit,
    callCategory: ['natural'],
    appliesWhen: { hcp: { min: 8, max: 13 }, suitLengths: [{ min: 5 }] },
    meaning: 'A constructive, nonforcing new-suit advance: 5+ cards and 8-13 HCP.',
    guidance: ['New suits by advancer are not automatically forcing as they would be ' +
               'when responding to partner’s opening bid.'],
    certainty: 'high',
  },
  //
  {
    id: 'advance-one-level-suit-overcall-new-suit-at-two-level',
    kind: 'advance',
    title: 'Show a new suit at the cheapest two-level bid',
    auctionContext: { stage: 'advancing', openerLevel: 1, openerStrain: 'suit',
                      interference: 'suitOvercall' },
    calls: ['2C', '2D', '2H', '2S'],
    callRefinement: refineAdvancerNewSuit,
    callCategory: ['natural', 'forcing'],
    appliesWhen: { hcp: { min: 10 }, suitLengths: [{ min: 5 }] },
    meaning: 'A non-jump, new-suit advance at the two level: 5+ cards, 10+ HCP, ' +
             'forcing one round.',
    guidance: ['Bid economically; a jump in a new suit would require a different, ' +
               'stronger agreement that is not yet modeled.'],
    certainty: 'high',
  },
  // Second family: partner makes a natural, non-jump two-level suit overcall.
  // The refiners require responder's Pass and distinguish simple bids from jumps.
  {
    id: 'advance-two-level-suit-overcall-simple-raise',
    kind: 'advance',
    title: 'Raise a two-level suit overcall to three',
    auctionContext: { stage: 'advancing', openerLevel: 1, openerStrain: 'suit',
                      interference: 'suitOvercall' },
    calls: ['3C', '3D', '3H', '3S'],
    callRefinement: refineAdvancerTwoLevelRaise,
    callCategory: ['natural'],
    priority: { rank: 10 },
    appliesWhen: { totalPoints: { min: 7, max: 10, valuation: 'shortage' },
                   supportLength: { min: 3 } },
    meaning: 'A nonforcing single raise to the three level: 7-10 support points and 3+ trumps.',
    guidance: ['This is not a preemptive jump raise: partner has already overcalled at two.'],
    certainty: 'high',
  },
  //
  {
    id: 'advance-two-level-suit-overcall-support-cuebid',
    kind: 'advance',
    title: 'Cuebid opener’s suit after a two-level overcall',
    auctionContext: { stage: 'advancing', openerLevel: 1, openerStrain: 'suit',
                      interference: 'suitOvercall' },
    calls: ['2D', '2H', '2S'],
    callRefinement: refineAdvancerTwoLevelCuebid,
    callCategory: ['conventional', 'forcing'],
    priority: { rank: 20 },
    appliesWhen: { totalPoints: { min: 11, valuation: 'shortage' },
                   supportLength: { min: 3 } },
    meaning: 'An artificial cuebid: 11+ support points, 3+ trumps, and forcing one round.',
    guidance: ['Cuebid the opponents’ opening suit to show a strong raise, not a natural suit.'],
    certainty: 'high',
  },
  //
  {
    id: 'advance-two-level-suit-overcall-two-notrump',
    kind: 'advance',
    title: 'Invite with 2NT after a two-level suit overcall',
    auctionContext: { stage: 'advancing', openerLevel: 1, openerStrain: 'suit',
                      interference: 'suitOvercall' },
    calls: ['2NT'],
    callCategory: ['natural', 'invitational'],
    appliesWhen: naturalTwoLevelNotrumpAdvanceApplies, // 11-13 HCP, balanced, opening-suit stopper
    meaning: 'Natural, invitational 2NT: 11-13 HCP, balanced, with an opener-suit stopper.',
    guidance: ['Partner’s two-level overcall is stronger than a typical one-level overcall.'],
    certainty: 'high',
  },
  //
  {
    id: 'advance-two-level-suit-overcall-new-suit-at-two-level',
    kind: 'advance',
    title: 'Show a new suit economically at the two level',
    auctionContext: { stage: 'advancing', openerLevel: 1, openerStrain: 'suit',
                      interference: 'suitOvercall' },
    calls: ['2D', '2H', '2S'],
    callRefinement: refineAdvancerTwoLevelNewSuit,
    callCategory: ['natural', 'forcing'],
    appliesWhen: { hcp: { min: 10 }, suitLengths: [{ min: 5 }] },
    meaning: 'An economical new-suit advance: 5+ cards and 10+ HCP, forcing one round.',
    guidance: ['The suit must differ from both the opener’s suit and partner’s overcall.'],
    certainty: 'high',
  },
  //
  {
    id: 'advance-two-level-suit-overcall-new-suit-at-three-level',
    kind: 'advance',
    title: 'Show a good new suit economically at the three level',
    auctionContext: { stage: 'advancing', openerLevel: 1, openerStrain: 'suit',
                      interference: 'suitOvercall' },
    calls: ['3C', '3D', '3H', '3S'],
    callRefinement: refineAdvancerTwoLevelNewSuit,
    callCategory: ['natural', 'forcing'],
    appliesWhen: { hcp: { min: 12 }, suitLengths: [{ min: 5 }] },
    meaning: 'Non-jump three-level new suit: 12+ HCP, a good 5+ card suit, ' +
             'forcing one round.',
    guidance: ['Suit quality uses the shared test: two of A/K/Q or three of A/K/Q/J/T. ' +
               'Jump new-suit advances remain unmodeled.'],
    certainty: 'high',
  },
  // Third family: Advancer responds to partner's takeout double of an opposing one-level suit
  // opening.  When opener's partner passes, advancer ordinarily must select a suit even with no
  // points.
  {
    id: 'advance-takeout-double-minimum-suit',
    kind: 'advance',
    title: 'Select an unbid suit after partner’s takeout double',
    auctionContext: { stage: 'advancing', openerLevel: 1, openerStrain: 'suit',
                      interference: 'takeoutDouble' },
    calls: ['1H', '1S', '2C', '2D', '2H', '2S'],
    callRefinement: (calls, context) => refineTakeoutDoubleSuitAdvance(calls, context, 0),
    callCategory: ['natural'],
    appliesWhen: { totalPoints: { max: 8, valuation: 'length' } },
    meaning: 'A nonforcing, cheapest-level suit advance with 0-8 length-adjusted points; ' +
             'normally 4+ cards.',
    guidance: ['Partner’s takeout double normally requests a bid even with no HCP.',
               'With no four-card unbid suit, a three-card unbid suit is a necessary fallback.',
               'An 18+ HCP doubler may have doubled without the usual unbid-suit support.'],
    certainty: 'high',
  },
  //
  {
    id: 'advance-takeout-double-invitational-jump',
    kind: 'advance',
    title: 'Invite with a jump in an unbid suit',
    auctionContext: { stage: 'advancing', openerLevel: 1, openerStrain: 'suit',
                      interference: 'takeoutDouble' },
    calls: ['2C', '2D', '2H', '2S', '3C', '3D', '3H', '3S'],
    callRefinement: (calls, context) => refineTakeoutDoubleSuitAdvance(calls, context, 1),
    callCategory: ['natural', 'invitational'],
    appliesWhen: { totalPoints: { min: 9, max: 11, valuation: 'length' } },
    meaning: 'Invitational single jump in an unbid suit: 9-11 length-adjusted points ' +
             'and 4+ cards.',
    guidance: ['A jump is measured against the cheapest legal bid in that same suit, ' +
               'not merely by its numbered level.'],
    certainty: 'high',
  },
  //
  {
    id: 'advance-takeout-double-strong-cuebid',
    kind: 'advance',
    title: 'Cuebid opener’s suit after partner’s takeout double',
    auctionContext: { stage: 'advancing', openerLevel: 1, openerStrain: 'suit',
                      interference: 'takeoutDouble' },
    calls: ['2C', '2D', '2H', '2S'],
    callRefinement: refineTakeoutDoubleCuebid,
    callCategory: ['conventional', 'forcing'],
    priority: { rank: 15 },
    appliesWhen: { totalPoints: { min: 12, valuation: 'length' } },
    meaning: 'A strong, forcing cuebid with 12+ length-adjusted points; ' +
             'it does not promise support for a particular unbid suit.',
    guidance: ['Unlike a cuebid after partner’s suit overcall, this is not a raise. ' +
               'Partner should describe the doubled hand further.'],
    certainty: 'high',
  },
  //
  {
    id: 'advance-takeout-double-one-notrump',
    kind: 'advance',
    title: 'Bid natural 1NT after partner’s takeout double',
    auctionContext: { stage: 'advancing', openerLevel: 1, openerStrain: 'suit',
                      interference: 'takeoutDouble' },
    calls: ['1NT'],
    callCategory: ['natural'],
    appliesWhen: naturalTakeoutDoubleNotrumpAdvanceApplies, // 8-11 HCP, balanced, stopper
    meaning: 'Natural 1NT: 8-11 HCP, balanced, and a stopper in opener’s suit.',
    guidance: ['This is not a suit preference. It offers to play notrump with protection ' +
               'against the opponents’ opening suit.'],
    certainty: 'high',
  },
  //
  {
    id: 'advance-takeout-double-two-notrump',
    kind: 'advance',
    title: 'Invite with natural 2NT after partner’s double',
    auctionContext: { stage: 'advancing', openerLevel: 1, openerStrain: 'suit',
                      interference: 'takeoutDouble' },
    calls: ['2NT'],
    callCategory: ['natural', 'invitational'],
    priority: { rank: 18 },
    appliesWhen: naturalTakeoutDoubleNotrumpAdvanceApplies, // 12-13 HCP, balanced, stopper
    meaning: 'Natural invitational 2NT: 12-13 HCP, balanced, and a stopper in opener’s suit.',
    certainty: 'high',
  },
  //
  {
    id: 'advance-takeout-double-three-notrump',
    kind: 'advance',
    title: 'Bid natural 3NT after partner’s double',
    auctionContext: { stage: 'advancing', openerLevel: 1, openerStrain: 'suit',
                      interference: 'takeoutDouble' },
    calls: ['3NT'],
    callCategory: ['natural', 'signoff'],
    priority: { rank: 20 },
    appliesWhen: naturalTakeoutDoubleNotrumpAdvanceApplies, // 14-16 HCP, balanced, stopper
    meaning: 'Natural game in 3NT: 14-16 HCP, balanced, and a stopper in opener’s suit.',
    certainty: 'high',
  },
  //
  {
    id: 'advance-takeout-double-major-game',
    kind: 'advance',
    title: 'Bid game directly in an unbid major',
    auctionContext: { stage: 'advancing', openerLevel: 1, openerStrain: 'suit',
                      interference: 'takeoutDouble' },
    calls: ['4H', '4S'],
    callRefinement: refineTakeoutDoubleMajorGame,
    callCategory: ['natural', 'signoff'],
    priority: { rank: 20 },
    appliesWhen: { totalPoints: { min: 12, valuation: 'length' } },
    meaning: 'Direct major-suit game with 12+ length-adjusted points and a 5+ card unbid major.',
    guidance: ['This deterministic game treatment assumes partner has an ordinary takeout double. ' +
               'It does not replace judgment about honor location or a strong off-shape double.'],
    certainty: 'high',
  },
];
