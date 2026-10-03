/// Overcall Bidding Rules

import { type BidRule } from './bidding-types';
import {
  naturalOneNtOvercallApplies, ordinaryTakeoutDoubleApplies, refinePreemptiveJumpOvercall,
  refineSimpleSuitOvercall
} from './overcalling-functions';


export const OvercallRules: BidRule[] = [
  // Direct natural overcalls and informational takeout doubles after a one-level suit opening.
  // Later competitive continuations, other doubles, and 1NT-opening defenses remain unmodeled.
  {
    id: 'overcall-simple-suit-at-one-level',
    kind: 'overcall',
    title: 'Make a natural one-level suit overcall',
    auctionContext: { stage: 'overcalling', openerLevel: 1, openerStrain: 'suit' },
    calls: ['1D', '1H', '1S'],
    callRefinement: refineSimpleSuitOvercall,
    callCategory: ['natural'],
    appliesWhen: { totalPoints: { min: 7, valuation: 'length' }, hcp: { max: 17 } },
    meaning: 'A non-jump one-level overcall: at least 7 points with length, up to 17 HCP, ' +
             'and a good five-card suit or any six-card-or-longer suit.',
    guidance: ['With 18+ HCP, begin with a takeout double and describe the hand later.'],
    certainty: 'high',
  },
  //
  {
    id: 'overcall-simple-suit-at-two-level',
    kind: 'overcall',
    title: 'Make a natural two-level suit overcall',
    auctionContext: { stage: 'overcalling', openerLevel: 1, openerStrain: 'suit' },
    calls: ['2C', '2D', '2H', '2S'],
    callRefinement: refineSimpleSuitOvercall,
    callCategory: ['natural'],
    appliesWhen: { totalPoints: { min: 13, valuation: 'length' }, hcp: { max: 17 } },
    meaning: 'A non-jump two-level overcall: at least 13 points with length, up to 17 HCP, ' +
             'and a good five-card suit or any six-card-or-longer suit.',
    guidance: ['A jump overcall is preemptive and is not part of these simple-overcall rules.'],
    certainty: 'high',
  },
  // Natural 1NT overcalls are balanced 15-18 HCP with a stopper in opener's suit.
  {
    id: 'overcall-natural-1nt-with-stopper',
    kind: 'overcall',
    title: 'Overcall 1NT with a balanced 15-18 HCP hand and a stopper',
    auctionContext: { stage: 'overcalling', openerLevel: 1, openerStrain: 'suit' },
    calls: ['1NT'],
    callCategory: ['natural'],
    priority: { rank: 20, note: 'A balanced hand with a stopper is well described by 1NT.' },
    appliesWhen: naturalOneNtOvercallApplies, // 15-18 HCP balanced with an opening-suit stopper
    meaning: "Natural 1NT overcall: 15-18 HCP, balanced, with a stopper in opener's suit.",
    guidance: ['The app uses A, Kx, Qxx, or Jxxx as an executable stopper approximation.'],
    certainty: 'high',
  },
  //
  // Preemptive jump overcalls are distinct from economical suit overcalls: honor quality is
  // required, with exactly six, seven, or eight cards at the corresponding level.
  {
    id: 'overcall-preemptive-jump-at-two-level',
    kind: 'overcall',
    title: 'Make a weak two-level jump overcall with a good six-card suit',
    auctionContext: { stage: 'overcalling', openerLevel: 1, openerStrain: 'suit' },
    calls: ['2C', '2D', '2H', '2S'],
    callRefinement: refinePreemptiveJumpOvercall,
    callCategory: ['natural', 'signoff'],
    priority: { rank: 15 },
    appliesWhen: { hcp: { min: 5, max: 11 } },
    meaning: 'Preemptive jump to the two level: 5-11 HCP with a good six-card suit.',
    guidance: ['This must be a jump over the cheapest natural overcall in that suit.'],
    certainty: 'high',
  },
  //
  {
    id: 'overcall-preemptive-jump-at-three-level',
    kind: 'overcall',
    title: 'Make a weak three-level jump overcall with a good seven-card suit',
    auctionContext: { stage: 'overcalling', openerLevel: 1, openerStrain: 'suit' },
    calls: ['3C', '3D', '3H', '3S'],
    callRefinement: refinePreemptiveJumpOvercall,
    callCategory: ['natural', 'signoff'],
    priority: { rank: 15 },
    appliesWhen: { hcp: { max: 9 } },
    meaning: 'Preemptive jump to the three level: fewer than 10 HCP with a good seven-card suit.',
    guidance: ['The source treats intermediate jump strains as partnership agreement; ' +
               'this app uses only natural jump overcalls in a new suit.'],
    certainty: 'high',
  },
  //
  {
    id: 'overcall-preemptive-jump-at-four-level',
    kind: 'overcall',
    title: 'Make a weak four-level jump overcall with a good eight-card suit',
    auctionContext: { stage: 'overcalling', openerLevel: 1, openerStrain: 'suit' },
    calls: ['4C', '4D', '4H', '4S'],
    callRefinement: refinePreemptiveJumpOvercall,
    callCategory: ['natural', 'signoff'],
    priority: { rank: 15 },
    appliesWhen: { hcp: { max: 9 } },
    meaning: 'Preemptive jump to the four level: fewer than 10 HCP with a good eight-card suit.',
    guidance: ['This is separate from rare four- and five-level opening preempts.'],
    certainty: 'high',
  },
  //
  // Ordinary takeout doubles promise a tolerable fit in each unbid suit; a high-card-strength
  // exception permits doubling first with any distribution and showing the hand on the next turn.
  {
    id: 'overcall-takeout-double-with-unbid-suit-support',
    kind: 'overcall',
    title: 'Make a takeout double with support for the unbid suits',
    auctionContext: { stage: 'overcalling', openerLevel: 1, openerStrain: 'suit' },
    calls: ['Double'],
    callCategory: ['conventional', 'forcing'],
    appliesWhen: ordinaryTakeoutDoubleApplies, // 13+ shortage points, 3+ in all unbid suits
    meaning: 'Takeout double with opening values and at least three cards in each unbid suit.',
    guidance: ['Prefer four-card support in the unbid suits. Partner is being asked to select a ' +
               'suit, not to treat this as a penalty double.',
               'An 18+ HCP hand may double without this distribution, then describe its strength ' +
               'or suit on the next turn; those continuations are not yet modeled.'],
    certainty: 'high',
  },
  //
  {
    id: 'overcall-takeout-double-strong-hand',
    kind: 'overcall',
    title: 'Begin with a takeout double on a very strong hand',
    auctionContext: { stage: 'overcalling', openerLevel: 1, openerStrain: 'suit' },
    calls: ['Double'],
    callCategory: ['conventional', 'forcing'],
    appliesWhen: { hcp: { min: 18 } },
    meaning: 'An 18+ HCP takeout double can precede a later natural suit or notrump bid ' +
             'without promising support for all unbid suits.',
    guidance: ['Exceptionally powerful distributional hands with fewer than 18 HCP require ' +
               'judgment; the app does not estimate playing tricks for this exception.',
               'No general penalty double or doubler rebid treatment is modeled.'],
    certainty: 'high',
  },
];
