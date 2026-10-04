/// Advancing Overcalls and Competitive Bidding

import { type BidRule } from './bidding-types';
import { naturalNotrumpAdvanceApplies, refineAdvancerCuebid, refineAdvancerNewSuit,
         refineAdvancerRaise } from './advancing-functions';


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
];
