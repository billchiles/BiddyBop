/// Overcall Bidding Rules

import { type BidRule } from './bidding-types';
import {
  dontSingleSuitDoubleApplies, dontSpadeOvercallApplies, dontTwoSuitOvercallApplies,
  naturalNotrumpOvercallApplies, naturalOneNtOvercallerInvitationApplies,
  naturalOneNtOvercallerMinorInvitationApplies, naturalOneNtOvercallerSignoffApplies,
  naturalOneNtOvercallerSlamBoundaryApplies, naturalOneNtOvercallerThreeMajorApplies,
  ordinaryTakeoutDoubleApplies, refineDontOvercallerCorrection,
  refineNaturalOneNtOvercallJacoby, refineNaturalOneNtOvercallStayman,
  refineNaturalOneNtOvercallTexas,
  refinePreemptiveJumpOvercall, refineSimpleSuitOvercall, refineWeakTwoSuitOvercall,
  refineWeakTwoTwoNtJacobyCompletion, refineWeakTwoTwoNtStaymanReply,
  refineWeakTwoTwoNtTexasCompletion
} from './overcalling-functions';


export const OvercallRules: BidRule[] = [
  // Passing is normal when no modeled competitive action qualifies. The evaluator suppresses
  // this fallback when a natural overcall, takeout Double, preempt, or DONT action applies.
  // Limit the ordinary treatment to 17 HCP; strong hands without a modeled defense remain
  // unjudged rather than being presented with an automatic Pass.
  {
    id: 'overcall-pass-no-qualifying-action',
    kind: 'overcall',
    title: 'Pass without a suitable overcall or takeout Double',
    auctionContext: { stage: 'overcalling',
                      openerCalls: ['1C', '1D', '1H', '1S', '1NT', '2D', '2H', '2S'] },
    calls: ['Pass'],
    callCategory: ['signoff'],
    appliesWhen: { hcp: { max: 17 } },
    meaning: 'Pass when the hand does not qualify for a modeled direct overcall, takeout Double, ' +
             'or DONT defense.',
    guidance: ['Partner has not bid, so you are not obliged to act over an opposing opening. ' +
               'Passing with a marginal hand may also be reasonable, but vulnerability and ' +
               'scoring judgment are outside this treatment.'],
    certainty: 'high',
  },
  //
  //// Natural 1NT overcall -- Stayman and compulsory transfers
  // Advancer uses the same responses as after a natural 1NT opening. Further competition
  // by the opening side is deliberately not part of these immediate replies.
  {
    id: 'overcaller-rebid-1nt-stayman',
    kind: 'overcallerRebid',
    title: 'Answer Stayman after a natural 1NT overcall',
    auctionContext: { stage: 'overcallerRebid', openerLevel: 1, openerStrain: 'suit',
                      interference: 'notrumpOvercall' },
    calls: ['2D', '2H', '2S'],
    agreement: { setting: 'stayman', value: true },
    callRefinement: refineNaturalOneNtOvercallStayman,
    callCategory: ['conventional'],
    meaning: 'Show hearts first with four cards in both majors, or deny a major with 2D.',
    certainty: 'high',
  },
  //
  {
    id: 'overcaller-rebid-1nt-jacoby',
    kind: 'overcallerRebid',
    title: 'Complete Jacoby transfer after a natural 1NT overcall',
    auctionContext: { stage: 'overcallerRebid', openerLevel: 1, openerStrain: 'suit',
                      interference: 'notrumpOvercall' },
    calls: ['2H', '2S'],
    agreement: { setting: 'jacobyTransfers', value: true },
    callRefinement: refineNaturalOneNtOvercallJacoby,
    callCategory: ['conventional'],
    meaning: 'Complete advancer’s artificial two-level major transfer.',
    guidance: ['Do not superaccept in this selected treatment.'],
    certainty: 'high',
  },
  //
  {
    id: 'overcaller-rebid-1nt-texas',
    kind: 'overcallerRebid',
    title: 'Complete Texas transfer after a natural 1NT overcall',
    auctionContext: { stage: 'overcallerRebid', openerLevel: 1, openerStrain: 'suit',
                      interference: 'notrumpOvercall' },
    calls: ['4H', '4S'],
    agreement: { setting: 'texasTransfers', value: true },
    callRefinement: refineNaturalOneNtOvercallTexas,
    callCategory: ['conventional'],
    meaning: 'Complete the artificial transfer to game in advancer’s major.',
    certainty: 'high',
  },
  //
  //// Natural 1NT overcall -- Invitations and natural signoffs
  {
    id: 'overcaller-rebid-1nt-decline-2nt-invitation',
    kind: 'overcallerRebid',
    title: 'Decline advancer’s natural 2NT invitation',
    auctionContext: { stage: 'overcallerRebid', openerLevel: 1, openerStrain: 'suit',
                      interference: 'notrumpOvercall' },
    calls: ['Pass'],
    appliesWhen: (call, context, system) =>
      naturalOneNtOvercallerInvitationApplies(call, context, system, '2NT', false),
    callCategory: ['signoff'],
    meaning: 'Stop in 2NT with minimum or borderline values.',
    guidance: ['Use the configured 1NT strength range; the middle value permits either choice.'],
    certainty: 'high',
  },
  //
  {
    id: 'overcaller-rebid-1nt-accept-2nt-invitation',
    kind: 'overcallerRebid',
    title: 'Accept advancer’s natural 2NT invitation',
    auctionContext: { stage: 'overcallerRebid', openerLevel: 1, openerStrain: 'suit',
                      interference: 'notrumpOvercall' },
    calls: ['3NT'],
    appliesWhen: (call, context, system) =>
      naturalOneNtOvercallerInvitationApplies(call, context, system, '2NT', true),
    callCategory: ['natural', 'signoff'],
    meaning: 'Accept the invitation and bid 3NT.',
    guidance: ['Use the configured 1NT strength range; the middle value permits either choice.'],
    certainty: 'high',
  },
  //
  {
    id: 'overcaller-rebid-1nt-pass-natural-signoff',
    kind: 'overcallerRebid',
    title: 'Pass a natural signoff after a 1NT overcall',
    auctionContext: { stage: 'overcallerRebid', openerLevel: 1, openerStrain: 'suit',
                      interference: 'notrumpOvercall' },
    calls: ['Pass'],
    appliesWhen: naturalOneNtOvercallerSignoffApplies,
    callCategory: ['signoff'],
    meaning: 'Pass natural 3NT/6NT/7NT, or a natural major signoff with transfers disabled.',
    certainty: 'high',
  },
  //
  {
    id: 'overcaller-rebid-1nt-decline-3minor-invitation',
    kind: 'overcallerRebid',
    title: 'Decline a natural three-minor invitation without a fitting top honor',
    auctionContext: { stage: 'overcallerRebid', openerLevel: 1, openerStrain: 'suit',
                      interference: 'notrumpOvercall' },
    calls: ['Pass'],
    appliesWhen: (call, context) => naturalOneNtOvercallerMinorInvitationApplies(call, context, false),
    callCategory: ['signoff'],
    meaning: 'Play the good six-card minor when overcaller lacks a fitting A/K/Q.',
    certainty: 'high',
  },
  //
  {
    id: 'overcaller-rebid-1nt-accept-3minor-invitation',
    kind: 'overcallerRebid',
    title: 'Accept a natural three-minor invitation with a fitting top honor',
    auctionContext: { stage: 'overcallerRebid', openerLevel: 1, openerStrain: 'suit',
                      interference: 'notrumpOvercall' },
    calls: ['3NT'],
    appliesWhen: (call, context) => naturalOneNtOvercallerMinorInvitationApplies(call, context, true),
    callCategory: ['natural', 'signoff'],
    meaning: 'Bid 3NT with A, K, or Q in advancer’s long minor.',
    certainty: 'high',
  },
  //
  {
    id: 'overcaller-rebid-1nt-3major-continuation',
    kind: 'overcallerRebid',
    title: 'Choose game after advancer’s direct three-major response',
    auctionContext: { stage: 'overcallerRebid', openerLevel: 1, openerStrain: 'suit',
                      interference: 'notrumpOvercall' },
    calls: ['3NT', '4H', '4S'],
    appliesWhen: naturalOneNtOvercallerThreeMajorApplies,
    callCategory: ['natural'],
    meaning: 'With Jacoby off, choose 3NT on two-card major support or major game with a fit. ' +
             'With Jacoby on, four of the major is the bounded continuation after slam interest.',
    guidance: ['Further control bids or slam exploration are outside this selected overcall system.'],
    certainty: 'high',
  },
  //
  {
    id: 'overcaller-rebid-1nt-decline-quantitative-4nt',
    kind: 'overcallerRebid',
    title: 'Decline a quantitative 4NT small-slam invitation',
    auctionContext: { stage: 'overcallerRebid', openerLevel: 1, openerStrain: 'suit',
                      interference: 'notrumpOvercall' },
    calls: ['Pass'],
    appliesWhen: (call, context, system) =>
      naturalOneNtOvercallerInvitationApplies(call, context, system, '4NT', false),
    callCategory: ['signoff'],
    meaning: 'Stop in 4NT rather than automatically bidding slam.',
    certainty: 'high',
  },
  //
  {
    id: 'overcaller-rebid-1nt-accept-quantitative-4nt',
    kind: 'overcallerRebid',
    title: 'Accept a quantitative 4NT small-slam invitation',
    auctionContext: { stage: 'overcallerRebid', openerLevel: 1, openerStrain: 'suit',
                      interference: 'notrumpOvercall' },
    calls: ['6NT'],
    appliesWhen: (call, context, system) =>
      naturalOneNtOvercallerInvitationApplies(call, context, system, '4NT', true),
    callCategory: ['natural', 'signoff'],
    meaning: 'Bid 6NT when the selected range and hand strength justify accepting.',
    certainty: 'high',
  },
  //
  {
    id: 'overcaller-rebid-1nt-slam-boundary',
    kind: 'scopeBoundary',
    title: 'Further slam replies after 1NT overcall are outside selected scope',
    auctionContext: { stage: 'overcallerRebid', openerLevel: 1, openerStrain: 'suit',
                      interference: 'notrumpOvercall' },
    scopeBoundaryWhen: naturalOneNtOvercallerSlamBoundaryApplies,
    meaning: 'Advancer made a forcing ace inquiry or forcing 5NT slam invitation.',
    guidance: ['Gerber ace replies and forcing 5NT continuations are deliberately not modeled. ' +
               'Do not treat this as a signoff or an automatic Pass.'],
    certainty: 'high',
  },
  //
  // Systems-on replies after a natural 2NT overcall of a weak two are a separate selected
  // overcaller-rebid family. The opening side must pass during the convention.
  {
    id: 'overcaller-rebid-weak-two-2nt-stayman',
    kind: 'overcallerRebid',
    title: 'Answer Stayman after a natural 2NT overcall of a weak two',
    auctionContext: { stage: 'overcallerRebid', openerCalls: ['2D', '2H', '2S'],
                      interference: 'notrumpOvercall' },
    calls: ['3D', '3H', '3S'],
    callRefinement: refineWeakTwoTwoNtStaymanReply,
    agreement: { setting: 'stayman', value: true },
    callCategory: ['conventional'],
    meaning: 'Show a four-card major after Stayman, or bid 3D to deny one.',
    certainty: 'high',
  },
  //
  {
    id: 'overcaller-rebid-weak-two-2nt-jacoby',
    kind: 'overcallerRebid',
    title: 'Complete a Jacoby transfer after a natural 2NT overcall of a weak two',
    auctionContext: { stage: 'overcallerRebid', openerCalls: ['2D', '2H', '2S'],
                      interference: 'notrumpOvercall' },
    calls: ['3H', '3S'],
    callRefinement: refineWeakTwoTwoNtJacobyCompletion,
    agreement: { setting: 'jacobyTransfers', value: true },
    callCategory: ['conventional'],
    meaning: 'Complete the transfer to advancer’s requested major.',
    guidance: ['This compact treatment does not model transfer superaccepts.'],
    certainty: 'high',
  },
  //
  {
    id: 'overcaller-rebid-weak-two-2nt-texas',
    kind: 'overcallerRebid',
    title: 'Complete a Texas transfer after a natural 2NT overcall of a weak two',
    auctionContext: { stage: 'overcallerRebid', openerCalls: ['2D', '2H', '2S'],
                      interference: 'notrumpOvercall' },
    calls: ['4H', '4S'],
    callRefinement: refineWeakTwoTwoNtTexasCompletion,
    agreement: { setting: 'texasTransfers', value: true },
    callCategory: ['conventional'],
    meaning: 'Complete the Texas transfer to game in the requested major.',
    certainty: 'high',
  },
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
  // Weak-two defenses are defined separately below; most later overcaller continuations remain
  // unmodeled.
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
    appliesWhen: naturalNotrumpOvercallApplies, // 15-18 HCP balanced with an opening-suit stopper
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
  //
  // Direct defenses to opposing weak 2D/2H/2S openings.  These reuse the existing takeout-double
  // shape treatment and stop at the overcaller's first action; advancing is a separate batch.
  {
    id: 'overcall-weak-two-natural-suit-at-two-level',
    kind: 'overcall',
    title: 'Make a natural two-level suit overcall of a weak two',
    auctionContext: { stage: 'overcalling', openerCalls: ['2D', '2H', '2S'] },
    calls: ['2D', '2H', '2S'],
    callRefinement: refineWeakTwoSuitOvercall,
    callCategory: ['natural'],
    appliesWhen: { totalPoints: { min: 13, valuation: 'length' }, hcp: { max: 17 } },
    meaning: 'Natural two-level overcall of a weak two: 13+ points with length, up to 17 HCP, ' +
             'and a good 5+ card suit.',
    guidance: ['With 18+ HCP, begin with a takeout double and describe the hand later.'],
    certainty: 'high',
  },
  //
  {
    id: 'overcall-weak-two-natural-suit-at-three-level',
    kind: 'overcall',
    title: 'Make a natural three-level suit overcall of a weak two',
    auctionContext: { stage: 'overcalling', openerCalls: ['2D', '2H', '2S'] },
    calls: ['3C', '3D', '3H', '3S'],
    callRefinement: refineWeakTwoSuitOvercall,
    callCategory: ['natural'],
    appliesWhen: { totalPoints: { min: 15, valuation: 'length' }, hcp: { max: 17 } },
    meaning: 'Natural three-level overcall of a weak two: 15+ points with length, up to 17 HCP, ' +
             'and a good 6+ card suit.',
    guidance: ['Higher-level natural competition needs more shape and strength; the app does not ' +
               'model jump-overcall treatments over weak twos.'],
    certainty: 'high',
  },
  //
  {
    id: 'overcall-weak-two-takeout-double-with-unbid-suit-support',
    kind: 'overcall',
    title: 'Make a takeout double of a weak two with support for the unbid suits',
    auctionContext: { stage: 'overcalling', openerCalls: ['2D', '2H', '2S'] },
    calls: ['Double'],
    callCategory: ['conventional', 'forcing'],
    appliesWhen: ordinaryTakeoutDoubleApplies,
    meaning: 'Takeout double with 13+ shortage points and at least three cards in each unbid suit.',
    guidance: ['This uses the same basic takeout-double shape as over a one-level suit opening. ' +
               'Prefer four-card support in the unbid suits when possible.'],
    certainty: 'high',
  },
  //
  {
    id: 'overcall-weak-two-takeout-double-strong-hand',
    kind: 'overcall',
    title: 'Begin with a takeout double of a weak two on a very strong hand',
    auctionContext: { stage: 'overcalling', openerCalls: ['2D', '2H', '2S'] },
    calls: ['Double'],
    callCategory: ['conventional', 'forcing'],
    appliesWhen: { hcp: { min: 18 } },
    meaning: 'An 18+ HCP takeout double can precede a later natural suit or notrump bid without ' +
             'promising support for all unbid suits.',
    guidance: ['The strong-hand exception is the same one used over a one-level suit opening; ' +
               'later doubler continuations are not part of this patch.'],
    certainty: 'high',
  },
  //
  {
    id: 'overcall-weak-two-natural-2nt-with-stopper',
    kind: 'overcall',
    title: 'Overcall a weak two with natural 2NT and a stopper',
    auctionContext: { stage: 'overcalling', openerCalls: ['2D', '2H', '2S'] },
    calls: ['2NT'],
    callCategory: ['natural'],
    priority: { rank: 20, note: 'A balanced hand with a stopper is well described by 2NT.' },
    appliesWhen: naturalNotrumpOvercallApplies,
    meaning: "Natural 2NT overcall: 15-18 HCP, balanced, with a stopper in opener's suit.",
    guidance: ['The app uses A, Kx, Qxx, or Jxxx as an executable stopper approximation.'],
    certainty: 'high',
  },
];
