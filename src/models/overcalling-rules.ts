/// Overcall Bidding Rules

import { type BidRule } from './bidding-types';
import {
  dontSingleSuitDoubleApplies, dontSpadeOvercallApplies, dontTwoSuitOvercallApplies,
  naturalOneNtOvercallApplies, ordinaryTakeoutDoubleApplies, refineDontOvercallerCorrection,
  refinePreemptiveJumpOvercall, refineSimpleSuitOvercall
} from './overcalling-functions';


export const OvercallRules: BidRule[] = [
  // Compact DONT defense to an opposing strong 1NT.  Shape and suit quality carry more weight
  // than raw HCP; the app uses 7 HCP as a conservative floor because vulnerability is unmodeled.
  {
    id: 'overcall-dont-single-suit-double',
    kind: 'overcall',
    title: 'Use DONT Double with one long non-spade suit',
    auctionContext: { stage: 'overcalling', openerCalls: ['1NT'] },
    calls: ['Double'],
    callCategory: ['conventional', 'forcing'],
    appliesWhen: dontSingleSuitDoubleApplies,
    meaning: 'DONT Double shows one good 6+ card club, diamond, or heart suit and asks partner ' +
             'to relay to 2C.',
    guidance: ['This is not a penalty Double. Partner normally bids 2C; the DONT bidder then ' +
               'passes with clubs or names the long suit.',
               'A one-suited spade hand uses direct 2S in this compact treatment.'],
    certainty: 'high',
  },
  //
  {
    id: 'overcall-dont-clubs-plus-higher',
    kind: 'overcall',
    title: 'Use DONT 2C with clubs and a higher suit',
    auctionContext: { stage: 'overcalling', openerCalls: ['1NT'] },
    calls: ['2C'],
    callCategory: ['conventional'],
    appliesWhen: dontTwoSuitOvercallApplies,
    meaning: 'DONT 2C shows clubs plus exactly one higher suit, normally at least 5-4.',
    guidance: ['Partner may pass with a club fit; otherwise 2D asks for the higher suit.'],
    certainty: 'high',
  },
  //
  {
    id: 'overcall-dont-diamonds-plus-major',
    kind: 'overcall',
    title: 'Use DONT 2D with diamonds and a major',
    auctionContext: { stage: 'overcalling', openerCalls: ['1NT'] },
    calls: ['2D'],
    callCategory: ['conventional'],
    appliesWhen: dontTwoSuitOvercallApplies,
    meaning: 'DONT 2D shows diamonds plus exactly one major, normally at least 5-4.',
    guidance: ['Partner may pass with a diamond fit; otherwise 2H asks partner to pass or ' +
               'correct to 2S.'],
    certainty: 'high',
  },
  //
  {
    id: 'overcall-dont-majors',
    kind: 'overcall',
    title: 'Use DONT 2H with hearts and spades',
    auctionContext: { stage: 'overcalling', openerCalls: ['1NT'] },
    calls: ['2H'],
    callCategory: ['conventional'],
    appliesWhen: dontTwoSuitOvercallApplies,
    meaning: 'DONT 2H shows both majors, normally at least 5-4.',
    guidance: ['Partner passes with a heart preference or bids 2S with a spade preference.'],
    certainty: 'high',
  },
  //
  {
    id: 'overcall-dont-natural-spades',
    kind: 'overcall',
    title: 'Use natural DONT 2S with one long spade suit',
    auctionContext: { stage: 'overcalling', openerCalls: ['1NT'] },
    calls: ['2S'],
    callCategory: ['natural'],
    appliesWhen: dontSpadeOvercallApplies,
    meaning: 'Natural DONT 2S shows one good 6+ card spade suit.',
    guidance: ['Full DONT treatments often distinguish a stronger spade hand by doubling first; ' +
               'that strength split is intentionally omitted here.'],
    certainty: 'high',
  },
  // Basic DONT relay corrections are the first modeled overcaller rebids.  They apply only when
  // responder and opener both pass after the DONT action and advancer makes the expected relay.
  {
    id: 'overcaller-rebid-dont-pass-or-correct',
    kind: 'overcallerRebid',
    title: 'Complete the DONT pass-or-correct sequence',
    auctionContext: { stage: 'overcallerRebid', openerCalls: ['1NT'] },
    calls: ['Pass', '2D', '2H', '2S'],
    callRefinement: refineDontOvercallerCorrection,
    callCategory: ['conventional'],
    meaning: 'Accept advancer’s relay when it reaches the concealed suit, or correct to that suit.',
    guidance: ['This models only the basic DONT landing sequence. Game inquiries and ' +
               'continuations after responder competes remain unsupported.'],
    certainty: 'high',
  },
  // Direct natural overcalls and informational takeout doubles after a one-level suit opening.
  // Other opening families and most later overcaller continuations remain unmodeled.
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
