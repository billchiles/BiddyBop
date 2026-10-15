/// Overcall Bidding Rules

import { type BidRule } from './bidding-types';
import {
  dontSingleSuitDoubleApplies, dontSpadeOvercallApplies, dontTwoSuitOvercallApplies,
  naturalNotrumpOvercallApplies, naturalOneNtOvercallerInvitationApplies,
  naturalOneNtOvercallerMinorInvitationApplies, naturalOneNtOvercallerSignoffApplies,
  naturalOneNtOvercallerSlamBoundaryApplies, naturalOneNtOvercallerThreeMajorApplies,
  naturalSuitOvercallerRebidApplies, naturalSuitOvercallerRebidBoundaryApplies,
  jumpOvercallForcingAdvanceRebidApplies, jumpOvercallForcingAdvanceBoundaryApplies,
  contestedSuitOvercallerRebidApplies, contestedSuitOvercallerBoundaryApplies,
  contestedOneNtOvercallerRebidApplies, contestedOneNtOvercallerBoundaryApplies,
  ordinaryTakeoutDoubleApplies, takeoutDoublerRebidApplies, takeoutDoublerBoundaryApplies,
  takeoutDoublerFurtherCompetitionBoundaryApplies,
  refineDontOvercallerCorrection,
  refineNaturalOneNtOvercallJacoby, refineNaturalOneNtOvercallStayman,
  refineNaturalOneNtOvercallTexas,
  refinePreemptiveJumpOvercall, refineSimpleSuitOvercall, refineWeakTwoSuitOvercall,
  refineWeakTwoTwoNtJacobyCompletion, refineWeakTwoTwoNtStaymanReply,
  refineWeakTwoTwoNtTexasCompletion, weakTwoTwoNtNaturalSignoffApplies,
  weakTwoDoublerRebidApplies, weakTwoSuitOvercallerRebidApplies,
  weakTwoDefenseBoundaryApplies, refineBalancingSuitBid, balancingTakeoutDoubleApplies,
  balancingStrongDoubleApplies, balancingOneNtApplies, balancingPassApplies
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
  //// Direct defenses intentionally outside the selected bidding treatment
  // These boundaries are explanations, not Pass recommendations.  The evaluator suppresses
  // a boundary when a concrete competitive call qualifies for this hand and auction.
  {
    id: 'overcall-boundary-strong-2c-opening',
    kind: 'scopeBoundary',
    title: 'Defense to an opposing strong artificial 2C opening',
    auctionContext: { stage: 'overcalling', openerCalls: ['2C'] },
    meaning: 'The opponents have opened a strong artificial 2C; the app does not teach ' +
             'competitive defenses to this opening.',
    guidance: ['Partnership agreements, suit quality, and vulnerability matter when deciding ' +
               'whether to compete.  Pass is not automatically the only reasonable action.'],
    certainty: 'high',
  },
  //
  {
    id: 'overcall-boundary-strong-2nt-opening',
    kind: 'scopeBoundary',
    title: 'Defense to an opposing strong 2NT opening',
    auctionContext: { stage: 'overcalling', openerCalls: ['2NT'] },
    meaning: 'The app does not teach a defensive convention or reliable natural competition ' +
             'against a strong 2NT opening.',
    guidance: ['Suit quality, distribution, and partnership agreements affect the choice.  ' +
               'Do not interpret the lack of a recommendation as advice to Pass.'],
    certainty: 'high',
  },
  //
  {
    id: 'overcall-boundary-three-level-preempt',
    kind: 'scopeBoundary',
    title: 'Defense to an opposing three-level preempt',
    auctionContext: { stage: 'overcalling', openerCalls: ['3C', '3D', '3H', '3S'] },
    meaning: 'Competing against a three-level preempt requires playing-strength judgment ' +
             'outside the app’s selected defense rules.',
    guidance: ['Consider distribution, likely tricks, vulnerability, and possible sacrifices.  ' +
               'No automatic Pass or Double is recommended.'],
    certainty: 'high',
  },
  //
  {
    id: 'overcall-boundary-very-high-opening',
    kind: 'scopeBoundary',
    title: 'Defense to an opposing 3NT or four-level-and-higher opening',
    auctionContext: { stage: 'overcalling', openerCalls: [
      '3NT', '4C', '4D', '4H', '4S', '4NT', '5C', '5D', '5H', '5S', '5NT',
      '6C', '6D', '6H', '6S', '6NT', '7C', '7D', '7H', '7S', '7NT',
    ] },
    meaning: 'The app does not model defensive bidding against this high-level opening.',
    guidance: ['Penalty, sacrifice, and high-level competitive decisions depend on judgment ' +
               'and partnership methods that the app cannot evaluate reliably.'],
    certainty: 'high',
  },
  //
  {
    id: 'overcall-boundary-strong-hand-vs-1nt',
    kind: 'scopeBoundary',
    title: 'Strong defensive hand without a modeled action over 1NT',
    auctionContext: { stage: 'overcalling', openerCalls: ['1NT'] },
    scopeBoundaryWhen: (context) => ({
      success: context.handFacts.hcp >= 18,
      telemetryLines: ['18+ HCP: a strong defensive decision may require penalty-oriented ' +
                       'methods not included in the compact DONT treatment.'],
    }),
    meaning: 'A strong hand does not automatically justify a penalty Double under DONT.',
    guidance: ['The app’s DONT Double is artificial and promises a long one-suited hand, ' +
               'not a penalty hand.  When no DONT call qualifies, penalty-oriented choices ' +
               'and other partnership methods require judgment outside the app’s treatment.'],
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
  //// Natural suit overcall -- After advancer's ordinary or weak raise
  // A simple raise is nonforcing. Preserve a preemptive jump raise as a signoff, except
  // when an unusually strong overcaller needs judgment about possible game.
  {
    id: 'overcaller-rebid-suit-raise-pass', kind: 'overcallerRebid',
    title: 'Pass an ordinary or weak raise of a natural suit overcall',
    auctionContext: { stage: 'overcallerRebid', openerLevel: 1, openerStrain: 'suit',
                      interference: 'suitOvercall' },
    calls: ['Pass'],
    appliesWhen: (call, context) => naturalSuitOvercallerRebidApplies(call, context, 'raise-pass'),
    callCategory: ['signoff'],
    meaning: 'Pass the nonforcing raise with ordinary overcall values.',
    guidance: ['A weak jump raise is preemptive, not invitational.'],
    certainty: 'high',
  },
  //
  {
    id: 'overcaller-rebid-suit-raise-invite', kind: 'overcallerRebid',
    title: 'Invite game after a simple major-suit raise',
    auctionContext: { stage: 'overcallerRebid', openerLevel: 1, openerStrain: 'suit',
                      interference: 'suitOvercall' },
    calls: ['3H', '3S'],
    appliesWhen: (call, context) => naturalSuitOvercallerRebidApplies(call, context, 'raise-invite'),
    callCategory: ['natural', 'invitational'],
    meaning: 'Invite game with extras after a constructive raise of a one-level major overcall.',
    guidance: ['Advancer weighs maximum values, trump support and working honors before ' +
               'accepting; remember that the original overcall might have been light.'],
    certainty: 'high',
  },
  //
  {
    id: 'overcaller-rebid-suit-raise-game', kind: 'overcallerRebid',
    title: 'Bid major game after constructive overcall support',
    auctionContext: { stage: 'overcallerRebid', openerLevel: 1, openerStrain: 'suit',
                      interference: 'suitOvercall' },
    calls: ['4H', '4S'],
    appliesWhen: (call, context) => naturalSuitOvercallerRebidApplies(call, context, 'raise-game'),
    callCategory: ['natural', 'signoff'],
    meaning: 'Choose major game with a strong six-card overcall and a known fit.',
    certainty: 'high',
  },
  //
  //// Natural suit overcall -- After a forcing support cuebid
  // The cuebid promises support and forces one reply, but does not promise game.
  {
    id: 'overcaller-rebid-cuebid-return', kind: 'overcallerRebid',
    title: 'Describe a minimum overcall by returning to partner’s supported suit',
    auctionContext: { stage: 'overcallerRebid', openerLevel: 1, openerStrain: 'suit',
                      interference: 'suitOvercall' },
    calls: ['2C', '2D', '2H', '2S', '3C', '3D', '3H', '3S'],
    appliesWhen: (call, context) => naturalSuitOvercallerRebidApplies(call, context, 'cue-return'),
    callCategory: ['natural'],
    meaning: 'Return economically to the overcalled suit after the forcing support cuebid.',
    guidance: ['The cuebid is artificial and shows 11+ support points; this return is not a signoff.'],
    certainty: 'high',
  },
  //
  {
    id: 'overcaller-rebid-cuebid-invite', kind: 'overcallerRebid',
    title: 'Show extras after a support cuebid of a one-level major overcall',
    auctionContext: { stage: 'overcallerRebid', openerLevel: 1, openerStrain: 'suit',
                      interference: 'suitOvercall' },
    calls: ['3H', '3S'],
    appliesWhen: (call, context) => naturalSuitOvercallerRebidApplies(call, context, 'cue-invite'),
    callCategory: ['natural', 'invitational'],
    meaning: 'Show more than a minimum overcall after advancer’s artificial support cuebid.',
    guidance: ['The forcing cuebid has already shown support. Advancer now judges whether ' +
               'the extra strength warrants major game; the invitation is not a game force.'],
    certainty: 'high',
  },
  //
  {
    id: 'overcaller-rebid-cuebid-game', kind: 'overcallerRebid',
    title: 'Show a strong major overcall after a forcing support cuebid',
    auctionContext: { stage: 'overcallerRebid', openerLevel: 1, openerStrain: 'suit',
                      interference: 'suitOvercall' },
    calls: ['4H', '4S'],
    appliesWhen: (call, context) => naturalSuitOvercallerRebidApplies(call, context, 'cue-game'),
    callCategory: ['natural'],
    meaning: 'Bid major game with substantial extras and a six-card trump suit.',
    certainty: 'high',
  },
  //
  //// Preemptive jump overcall -- After advancer's forcing new suit
  // The preempter must answer once, but neither a second suit nor notrump
  // carries a deterministic meaning here.  This is not an ordinary overcall rebid.
  {
    id: 'overcaller-rebid-jump-new-suit-support', kind: 'overcallerRebid',
    title: 'Support advancer’s forcing new suit after a weak jump overcall',
    auctionContext: { stage: 'overcallerRebid', openerLevel: 1, openerStrain: 'suit',
                      interference: 'jumpSuitOvercall' },
    calls: ['3C', '3D', '3H', '3S', '4C', '4D', '4H', '4S'],
    appliesWhen: (call, context) =>
      jumpOvercallForcingAdvanceRebidApplies(call, context, 'support'),
    callCategory: ['natural'],
    meaning: 'Raise advancer’s good five-card-or-longer suit with a known fit.',
    guidance: ['Three-card support suffices for a three-level raise.  A four-level raise ' +
               'needs stronger support: four trumps, A/K, or QJ in partner’s suit.',
               'Advancer’s new suit was forcing for one round; this raise satisfies that force.'],
    certainty: 'high',
  },
  //
  {
    id: 'overcaller-rebid-jump-new-suit-repeat', kind: 'overcallerRebid',
    title: 'Return to the preempt suit after advancer’s forcing new suit',
    auctionContext: { stage: 'overcallerRebid', openerLevel: 1, openerStrain: 'suit',
                      interference: 'jumpSuitOvercall' },
    calls: ['3C', '3D', '3H', '3S', '4C', '4D', '4H', '4S'],
    appliesWhen: (call, context) =>
      jumpOvercallForcingAdvanceRebidApplies(call, context, 'repeat'),
    callCategory: ['natural'],
    meaning: 'Repeat the original long preempt suit without sufficient support for a raise.',
    guidance: ['This is a minimum description, not a promise of extra high-card strength. ' +
               'It answers advancer’s one-round force.',
               'Advancer’s next judgment, including notrump and slam exploration, ' +
               'is beyond the modeled bidding depth.'],
    certainty: 'high',
  },
  //
  {
    id: 'overcaller-rebid-jump-new-suit-boundary', kind: 'scopeBoundary',
    title: 'Judgment after advancer’s forcing new suit opposite a jump overcall',
    auctionContext: { stage: 'overcallerRebid', openerLevel: 1, openerStrain: 'suit',
                      interference: 'jumpSuitOvercall' },
    scopeBoundaryWhen: jumpOvercallForcingAdvanceBoundaryApplies,
    meaning: 'Advancer’s new suit forces overcaller to make another call.',
    guidance: ['When no selected simple raise or long-suit return fits the hand, ' +
               'further strain and playing-strength judgment is needed.',
               'Pass does not satisfy this one-round force.  The app cannot reliably ' +
               'recommend a notrump, second-suit, or unusual high-level continuation.'],
    certainty: 'high',
  },
  //
  //// Natural suit overcall -- After a constructive new suit
  // One-level new suits are nonforcing; economical two-/three-level new suits are forcing
  // under this trainer's chosen advancing agreements.
  {
    id: 'overcaller-rebid-new-suit-pass', kind: 'overcallerRebid',
    title: 'Pass advancer’s nonforcing one-level new suit',
    auctionContext: { stage: 'overcallerRebid', openerLevel: 1, openerStrain: 'suit',
                      interference: 'suitOvercall' },
    calls: ['Pass'],
    appliesWhen: (call, context) => naturalSuitOvercallerRebidApplies(call, context, 'new-pass'),
    callCategory: ['signoff'],
    meaning: 'Pass a nonforcing one-level advance with ordinary overcall values.',
    certainty: 'high',
  },
  //
  {
    id: 'overcaller-rebid-new-suit-support', kind: 'overcallerRebid',
    title: 'Raise advancer’s natural five-card suit with three-card support',
    auctionContext: { stage: 'overcallerRebid', openerLevel: 1, openerStrain: 'suit',
                      interference: 'suitOvercall' },
    calls: ['2C', '2D', '2H', '2S', '3C', '3D', '3H', '3S', '4H', '4S'],
    appliesWhen: (call, context) => naturalSuitOvercallerRebidApplies(call, context, 'new-support'),
    callCategory: ['natural'],
    meaning: 'Support a five-card advancer suit when an eight-card fit is known.',
    guidance: ['A two-/three-level new suit is forcing one round; do not Pass it.'],
    certainty: 'high',
  },
  //
  {
    id: 'overcaller-rebid-new-suit-repeat', kind: 'overcallerRebid',
    title: 'Repeat a six-card overcall suit without support for advancer',
    auctionContext: { stage: 'overcallerRebid', openerLevel: 1, openerStrain: 'suit',
                      interference: 'suitOvercall' },
    calls: ['2C', '2D', '2H', '2S', '3C', '3D', '3H', '3S', '4H', '4S'],
    appliesWhen: (call, context) => naturalSuitOvercallerRebidApplies(call, context, 'new-repeat'),
    callCategory: ['natural'],
    meaning: 'Repeat the original six-card overcall suit when partner has forced a description.',
    certainty: 'high',
  },
  //
  {
    id: 'overcaller-rebid-new-suit-nt', kind: 'overcallerRebid',
    title: 'Describe a suitable balanced hand in notrump after a forcing new suit',
    auctionContext: { stage: 'overcallerRebid', openerLevel: 1, openerStrain: 'suit',
                      interference: 'suitOvercall' },
    calls: ['2NT', '3NT'],
    appliesWhen: (call, context) => naturalSuitOvercallerRebidApplies(call, context, 'new-nt'),
    callCategory: ['natural'],
    meaning: 'Describe strength in natural NT with a stopper in opener’s suit and no known fit.',
    certainty: 'high',
  },
  //
  {
    id: 'overcaller-rebid-new-suit-second', kind: 'overcallerRebid',
    title: 'Show a second good five-card suit after a forcing new-suit advance',
    auctionContext: { stage: 'overcallerRebid', openerLevel: 1, openerStrain: 'suit',
                      interference: 'suitOvercall' },
    calls: ['2C', '2D', '2H', '2S', '3C', '3D', '3H', '3S'],
    appliesWhen: (call, context) => naturalSuitOvercallerRebidApplies(call, context, 'new-second-suit'),
    callCategory: ['natural'],
    meaning: 'Describe a second five-card suit with sufficient strength and no advancer fit.',
    certainty: 'high',
  },
  //
  //// Natural suit overcall -- After natural notrump advances
  {
    id: 'overcaller-rebid-nt-pass', kind: 'overcallerRebid',
    title: 'Pass a natural 1NT/2NT or 3NT advance with suitable values',
    auctionContext: { stage: 'overcallerRebid', openerLevel: 1, openerStrain: 'suit',
                      interference: 'suitOvercall' },
    calls: ['Pass'],
    appliesWhen: (call, context) => naturalSuitOvercallerRebidApplies(call, context, 'nt-pass'),
    callCategory: ['signoff'],
    meaning: 'Decline a natural notrump invitation or accept a game signoff.',
    certainty: 'high',
  },
  //
  {
    id: 'overcaller-rebid-nt-invite', kind: 'overcallerRebid',
    title: 'Invite in 2NT after advancer’s natural 1NT',
    auctionContext: { stage: 'overcallerRebid', openerLevel: 1, openerStrain: 'suit',
                      interference: 'suitOvercall' },
    calls: ['2NT'],
    appliesWhen: (call, context) => naturalSuitOvercallerRebidApplies(call, context, 'nt-invite'),
    callCategory: ['natural', 'invitational'],
    meaning: 'Invite game with extras opposite 8–11 balanced points.',
    guidance: ['Advancer normally declines with a minimum and accepts with sufficient ' +
               'maximum values and adequate notrump stoppers.'],
    certainty: 'high',
  },
  //
  {
    id: 'overcaller-rebid-nt-game', kind: 'overcallerRebid',
    title: 'Bid 3NT with substantial extras after a natural NT advance',
    auctionContext: { stage: 'overcallerRebid', openerLevel: 1, openerStrain: 'suit',
                      interference: 'suitOvercall' },
    calls: ['3NT'],
    appliesWhen: (call, context) => naturalSuitOvercallerRebidApplies(call, context, 'nt-game'),
    callCategory: ['natural', 'signoff'],
    meaning: 'Bid natural 3NT with sufficient overcall strength to accept game.',
    certainty: 'high',
  },
  //
  //// Natural suit overcall -- Judgment boundaries
  {
    id: 'overcaller-rebid-support-cuebid-boundary', kind: 'scopeBoundary',
    title: 'Further strength and fit decisions after advancer’s forcing support cuebid',
    auctionContext: { stage: 'overcallerRebid', openerLevel: 1, openerStrain: 'suit',
                      interference: 'suitOvercall' },
    scopeBoundaryWhen: (context) =>
      naturalSuitOvercallerRebidBoundaryApplies(context, 'supportCuebid'),
    meaning: 'Advancer’s artificial cuebid promised support and requires an overcaller reply.',
    guidance: ['The overcall does not fit the selected minimum return or strong major description. ' +
               'Pass cannot satisfy the cuebid’s force; further strength and game judgment ' +
               'remain outside the modeled replies.'],
    certainty: 'high',
  },
  //
  {
    id: 'overcaller-rebid-forcing-new-suit-boundary', kind: 'scopeBoundary',
    title: 'Describe an awkward hand after advancer’s forcing new suit',
    auctionContext: { stage: 'overcallerRebid', openerLevel: 1, openerStrain: 'suit',
                      interference: 'suitOvercall' },
    scopeBoundaryWhen: (context) =>
      naturalSuitOvercallerRebidBoundaryApplies(context, 'forcingNewSuit'),
    meaning: 'Advancer’s economical two-/three-level new suit is forcing one round.',
    guidance: ['No selected support, long-suit repetition, natural NT, or second-suit description ' +
               'fits this hand. Do not Pass a forcing advance merely because the app has no ' +
               'specific natural recommendation.'],
    certainty: 'high',
  },
  //
  {
    id: 'overcaller-rebid-nonforcing-boundary', kind: 'scopeBoundary',
    title: 'Judgmental improvement after a nonforcing advance',
    auctionContext: { stage: 'overcallerRebid', openerLevel: 1, openerStrain: 'suit',
                      interference: 'suitOvercall' },
    scopeBoundaryWhen: (context) =>
      naturalSuitOvercallerRebidBoundaryApplies(context, 'nonforcing'),
    meaning: 'The raise, natural notrump, or one-level new suit does not require overcaller to bid.',
    guidance: ['With substantial extras, deciding whether to invite, bid game, or stop can depend ' +
               'on playing strength, suit quality, and partnership judgment.'],
    certainty: 'high',
  },
  //
  //// Natural suit overcall -- After responder also bids -- nonforcing support
  // The original overcall is natural; only the selected advancer meanings are continued.
  {
    id: 'overcaller-rebid-contested-suit-raise-pass',
    kind: 'overcallerRebid',
    title: 'Pass after competing for support',
    auctionContext: { stage: 'overcallerRebid', openerLevel: 1, openerStrain: 'suit',
                      interference: 'suitOvercall' },
    calls: ['Pass'],
    appliesWhen: (call, context) => contestedSuitOvercallerRebidApplies(call, context, 'raise-pass'),
    callCategory: ['signoff'],
    meaning: 'Pass an ordinary competitive raise with minimum overcall values.',
    certainty: 'high',
  },
  //
  {
    id: 'overcaller-rebid-contested-suit-raise-invite',
    kind: 'overcallerRebid',
    title: 'Invite major game after both sides raise',
    auctionContext: { stage: 'overcallerRebid', openerLevel: 1, openerStrain: 'suit',
                      interference: 'suitOvercall' },
    calls: ['3H', '3S'],
    appliesWhen: (call, context) => contestedSuitOvercallerRebidApplies(call, context, 'raise-invite'),
    callCategory: ['invitational'],
    meaning: 'Compete to three of the major with extra overcall values and a known fit.',
    certainty: 'high',
  },
  //
  {
    id: 'overcaller-rebid-contested-suit-raise-game',
    kind: 'overcallerRebid',
    title: 'Bid major game after both partnerships raise',
    auctionContext: { stage: 'overcallerRebid', openerLevel: 1, openerStrain: 'suit',
                      interference: 'suitOvercall' },
    calls: ['4H', '4S'],
    appliesWhen: (call, context) => contestedSuitOvercallerRebidApplies(call, context, 'raise-game'),
    callCategory: ['natural'],
    meaning: 'With a strong six-card major and fit, bid game.',
    certainty: 'high',
  },
  //
  //// Natural suit overcall -- After responder also bids -- forcing support cuebid
  // The original overcall is natural; only the selected advancer meanings are continued.
  {
    id: 'overcaller-rebid-contested-suit-cue-return',
    kind: 'overcallerRebid',
    title: 'Return economically to agreed suit after a support cuebid',
    auctionContext: { stage: 'overcallerRebid', openerLevel: 1, openerStrain: 'suit',
                      interference: 'suitOvercall' },
    calls: ['2C', '2D', '2H', '2S', '3C', '3D', '3H', '3S', '4C', '4D', '4H', '4S'],
    appliesWhen: (call, context) => contestedSuitOvercallerRebidApplies(call, context, 'cue-return'),
    callCategory: ['natural'],
    meaning: 'A strong artificial support cuebid requires overcaller to describe the strength and trump fit.',
    certainty: 'high',
  },
  //
  {
    id: 'overcaller-rebid-contested-suit-cue-game',
    kind: 'overcallerRebid',
    title: 'Bid major game after a strong support cuebid',
    auctionContext: { stage: 'overcallerRebid', openerLevel: 1, openerStrain: 'suit',
                      interference: 'suitOvercall' },
    calls: ['4H', '4S'],
    appliesWhen: (call, context) => contestedSuitOvercallerRebidApplies(call, context, 'cue-game'),
    callCategory: ['natural'],
    meaning: 'Bid major game with an exceptionally strong six-card major overcall.',
    certainty: 'high',
  },
  //
  //// Natural suit overcall -- After responder also bids -- natural new suit
  // The original overcall is natural; only the selected advancer meanings are continued.
  {
    id: 'overcaller-rebid-contested-suit-new-pass',
    kind: 'overcallerRebid',
    title: 'Pass a nonforcing new suit',
    auctionContext: { stage: 'overcallerRebid', openerLevel: 1, openerStrain: 'suit',
                      interference: 'suitOvercall' },
    calls: ['Pass'],
    appliesWhen: (call, context) => contestedSuitOvercallerRebidApplies(call, context, 'new-pass'),
    callCategory: ['signoff'],
    meaning: 'An economical one-level new suit is nonforcing; a minimum overcaller can Pass.',
    certainty: 'high',
  },
  //
  {
    id: 'overcaller-rebid-contested-suit-new-support',
    kind: 'overcallerRebid',
    title: "Support advancer's natural suit",
    auctionContext: { stage: 'overcallerRebid', openerLevel: 1, openerStrain: 'suit',
                      interference: 'suitOvercall' },
    calls: ['2C', '2D', '2H', '2S', '3C', '3D', '3H', '3S', '4H', '4S'],
    appliesWhen: (call, context) => contestedSuitOvercallerRebidApplies(call, context, 'new-support'),
    callCategory: ['natural'],
    meaning: "Three-card support completes an eight-card fit in advancer's five-card suit.",
    certainty: 'high',
  },
  //
  {
    id: 'overcaller-rebid-contested-suit-new-repeat',
    kind: 'overcallerRebid',
    title: 'Repeat a six-card overcall suit',
    auctionContext: { stage: 'overcallerRebid', openerLevel: 1, openerStrain: 'suit',
                      interference: 'suitOvercall' },
    calls: ['2C', '2D', '2H', '2S', '3C', '3D', '3H', '3S', '4C', '4D', '4H', '4S'],
    appliesWhen: (call, context) => contestedSuitOvercallerRebidApplies(call, context, 'new-repeat'),
    callCategory: ['natural'],
    meaning: "A long original suit is a useful natural description without partner's suit fit.",
    certainty: 'high',
  },
  //
  {
    id: 'overcaller-rebid-contested-suit-new-nt',
    kind: 'overcallerRebid',
    title: 'Describe a forcing new-suit response in notrump',
    auctionContext: { stage: 'overcallerRebid', openerLevel: 1, openerStrain: 'suit',
                      interference: 'suitOvercall' },
    calls: ['2NT', '3NT'],
    appliesWhen: (call, context) => contestedSuitOvercallerRebidApplies(call, context, 'new-nt'),
    callCategory: ['natural'],
    meaning: "Balanced or semi-balanced with stoppers in the opponents' naturally shown suits.",
    certainty: 'high',
  },
  //
  {
    id: 'overcaller-rebid-contested-suit-new-second-suit',
    kind: 'overcallerRebid',
    title: 'Show another long suit after a forcing advance',
    auctionContext: { stage: 'overcallerRebid', openerLevel: 1, openerStrain: 'suit',
                      interference: 'suitOvercall' },
    calls: ['2C', '2D', '2H', '2S', '3C', '3D', '3H', '3S'],
    appliesWhen: (call, context) => contestedSuitOvercallerRebidApplies(call, context, 'new-second-suit'),
    callCategory: ['natural'],
    meaning: 'Describe a clear five-card second suit with sufficient extra strength.',
    certainty: 'high',
  },
  //
  //// Natural suit overcall -- After responder raises -- responsive Double
  // The original overcall is natural; only the selected advancer meanings are continued.
  {
    id: 'overcaller-rebid-contested-suit-responsive-suit',
    kind: 'overcallerRebid',
    title: 'Choose an unbid suit after responsive Double',
    auctionContext: { stage: 'overcallerRebid', openerLevel: 1, openerStrain: 'suit',
                      interference: 'suitOvercall' },
    calls: ['2C', '2D', '2H', '2S', '3C', '3D', '3H', '3S', '4C', '4D', '4H', '4S'],
    appliesWhen: (call, context) => contestedSuitOvercallerRebidApplies(call, context, 'responsive-suit'),
    callCategory: ['natural'],
    meaning: 'Show the economical four-card unbid suit requested by advancer.',
    certainty: 'high',
  },
  //
  {
    id: 'overcaller-rebid-contested-suit-responsive-repeat',
    kind: 'overcallerRebid',
    title: 'Repeat six-card suit after responsive Double',
    auctionContext: { stage: 'overcallerRebid', openerLevel: 1, openerStrain: 'suit',
                      interference: 'suitOvercall' },
    calls: ['2C', '2D', '2H', '2S', '3C', '3D', '3H', '3S', '4C', '4D', '4H', '4S'],
    appliesWhen: (call, context) => contestedSuitOvercallerRebidApplies(call, context, 'responsive-repeat'),
    callCategory: ['natural'],
    meaning: 'Describe a sound six-card overcall when neither unbid suit fits.',
    certainty: 'high',
  },
  //
  //// Natural suit overcall -- After responder also bids -- natural notrump
  // The original overcall is natural; only the selected advancer meanings are continued.
  {
    id: 'overcaller-rebid-contested-suit-nt-pass',
    kind: 'overcallerRebid',
    title: 'Pass a suitable natural notrump advance',
    auctionContext: { stage: 'overcallerRebid', openerLevel: 1, openerStrain: 'suit',
                      interference: 'suitOvercall' },
    calls: ['Pass'],
    appliesWhen: (call, context) => contestedSuitOvercallerRebidApplies(call, context, 'nt-pass'),
    callCategory: ['signoff'],
    meaning: 'Pass a nonforcing natural notrump call with minimum values, or a game signoff.',
    certainty: 'high',
  },
  //
  {
    id: 'overcaller-rebid-contested-suit-nt-invite',
    kind: 'overcallerRebid',
    title: 'Invite game after advancer bids natural 1NT',
    auctionContext: { stage: 'overcallerRebid', openerLevel: 1, openerStrain: 'suit',
                      interference: 'suitOvercall' },
    calls: ['2NT'],
    appliesWhen: (call, context) => contestedSuitOvercallerRebidApplies(call, context, 'nt-invite'),
    callCategory: ['invitational'],
    meaning: 'With extras, invite notrump game by raising advancer to 2NT.',
    certainty: 'high',
  },
  //
  {
    id: 'overcaller-rebid-contested-suit-nt-game',
    kind: 'overcallerRebid',
    title: 'Bid 3NT with extras after a natural NT advance',
    auctionContext: { stage: 'overcallerRebid', openerLevel: 1, openerStrain: 'suit',
                      interference: 'suitOvercall' },
    calls: ['3NT'],
    appliesWhen: (call, context) => contestedSuitOvercallerRebidApplies(call, context, 'nt-game'),
    callCategory: ['natural'],
    meaning: 'A stronger overcaller can accept a natural invitation or improve a 1NT advance.',
    certainty: 'high',
  },
  //
  {
    id: 'overcaller-rebid-contested-forcing-boundary',
    kind: 'scopeBoundary',
    title: 'Forcing advance in competition needs further judgment',
    auctionContext: { stage: 'overcallerRebid', openerLevel: 1, openerStrain: 'suit',
                      interference: 'suitOvercall' },
    scopeBoundaryWhen: (context) => contestedSuitOvercallerBoundaryApplies(context, 'forcing'),
    meaning: 'A forcing cuebid, forcing new suit, or responsive Double asks for a description.',
    guidance: ['When no clear fit, natural suit, or stopped notrump bid qualifies, this competitive choice requires further judgment; do not treat it as a signoff.'],
    certainty: 'high',
  },
  //
  {
    id: 'overcaller-rebid-contested-redouble-boundary',
    kind: 'scopeBoundary',
    title: 'Strong Redouble after negative Double needs partnership decisions',
    auctionContext: { stage: 'overcallerRebid', openerLevel: 1, openerStrain: 'suit',
                      interference: 'suitOvercall' },
    scopeBoundaryWhen: (context) => contestedSuitOvercallerBoundaryApplies(context, 'redouble'),
    meaning: "Advancer's general strength Redouble does not specify a trump fit or a penalty contract.",
    guidance: ['Whether to defend the redoubled contract or continue in a suit needs further agreement and judgment.'],
    certainty: 'high',
  },
  //
  {
    id: 'overcaller-rebid-contested-nonforcing-boundary',
    kind: 'scopeBoundary',
    title: 'Further competitive action after a nonforcing advance',
    auctionContext: { stage: 'overcallerRebid', openerLevel: 1, openerStrain: 'suit',
                      interference: 'suitOvercall' },
    scopeBoundaryWhen: (context) => contestedSuitOvercallerBoundaryApplies(context, 'nonforcing'),
    meaning: 'A nonforcing raise, suit bid, or NT advance may permit Pass; extra-value action may depend on fit and playing strength.',
    guidance: ['No selected additional action fits this hand; marginal competition is not modeled.'],
    certainty: 'high',
  },
  //
  {
    id: 'overcaller-rebid-contested-furtherCompetition-boundary',
    kind: 'scopeBoundary',
    title: 'Further competition after opener bids again',
    auctionContext: { stage: 'overcallerRebid', openerLevel: 1, openerStrain: 'suit',
                      interference: 'suitOvercall' },
    scopeBoundaryWhen: (context) => contestedSuitOvercallerBoundaryApplies(context, 'furtherCompetition'),
    meaning: "The opening side has competed again after advancer's call.",
    guidance: ['High-level bidding, penalty decisions, and forcing Pass meanings remain outside this selected overcaller continuation.'],
    certainty: 'high',
  },
  //
  //// Natural 1NT overcall -- Natural interference and nonforcing advances
  {
    id: 'overcaller-rebid-interfered-1nt-pass',
    kind: 'overcallerRebid',
    title: 'Pass after opponent natural suit interference',
    auctionContext: { stage: 'overcallerRebid', openerLevel: 1, openerStrain: 'suit',
                      interference: 'notrumpOvercall' },
    calls: ['Pass'],
    appliesWhen: (call, context, system) => contestedOneNtOvercallerRebidApplies(call, context, system, 'pass'),
    callCategory: ['signoff'],
    meaning: "Defend the opponents' natural suit after advancer Passes; further competition is judgment-dependent.",
    certainty: 'high',
  },
  //
  {
    id: 'overcaller-rebid-interfered-1nt-invite-decline',
    kind: 'overcallerRebid',
    title: 'Decline natural 2NT invitation after interference',
    auctionContext: { stage: 'overcallerRebid', openerLevel: 1, openerStrain: 'suit',
                      interference: 'notrumpOvercall' },
    calls: ['Pass'],
    appliesWhen: (call, context, system) => contestedOneNtOvercallerRebidApplies(call, context, system, 'invite-decline'),
    callCategory: ['signoff'],
    meaning: "With minimum configured NT values, Pass advancer's natural 2NT invitation.",
    certainty: 'high',
  },
  //
  {
    id: 'overcaller-rebid-interfered-1nt-invite-accept',
    kind: 'overcallerRebid',
    title: 'Accept natural 2NT invitation after interference',
    auctionContext: { stage: 'overcallerRebid', openerLevel: 1, openerStrain: 'suit',
                      interference: 'notrumpOvercall' },
    calls: ['3NT'],
    appliesWhen: (call, context, system) => contestedOneNtOvercallerRebidApplies(call, context, system, 'invite-accept'),
    callCategory: ['signoff'],
    meaning: 'Bid 3NT with sufficient NT strength and a stopper in the naturally overcalled suit.',
    certainty: 'high',
  },
  //
  {
    id: 'overcaller-rebid-interfered-1nt-boundary',
    kind: 'scopeBoundary',
    title: 'Further natural 1NT overcall competition needs judgment',
    auctionContext: { stage: 'overcallerRebid', openerLevel: 1, openerStrain: 'suit',
                      interference: 'notrumpOvercall' },
    scopeBoundaryWhen: contestedOneNtOvercallerBoundaryApplies,
    meaning: 'Responder has introduced a natural two-level suit over our 1NT overcall.',
    guidance: ['Further competition and stopper-sensitive notrump decisions are limited here.'],
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
  //
  {
    id: 'overcaller-rebid-weak-two-2nt-natural-signoff-pass',
    kind: 'overcallerRebid',
    title: 'Pass advancer’s natural signoff after a 2NT overcall of a weak two',
    auctionContext: { stage: 'overcallerRebid', openerCalls: ['2D', '2H', '2S'],
                      interference: 'notrumpOvercall' },
    calls: ['Pass'],
    callCategory: ['signoff'],
    appliesWhen: weakTwoTwoNtNaturalSignoffApplies,
    meaning: 'A natural 3NT or major-suit signoff is intended as the final contract. ' +
             'Transfer requests must instead be completed.',
    certainty: 'high',
  },
  //// Weak-two takeout Double -- Selected rebids after advancer Pass-side response
  // An economical advance may have few values, even when forced to the three level.
  // The Doubler must not Pass a strong forcing cuebid or conceal a strong 18+ HCP hand.
  {
    id: 'overcaller-rebid-weak-two-double-minimum-pass',
    kind: 'overcallerRebid',
    title: 'Pass advancer’s minimum suit after an ordinary weak-two Double',
    auctionContext: { stage: 'overcallerRebid', openerCalls: ['2D', '2H', '2S'],
                      interference: 'takeoutDouble' },
    calls: ['Pass'],
    callCategory: ['signoff'],
    appliesWhen: (call, context) => weakTwoDoublerRebidApplies(call, context, 'minimum-pass'),
    meaning: 'Pass an unforced minimum advance with ordinary takeout-Double strength.',
    certainty: 'high',
  },
  //
  {
    id: 'overcaller-rebid-weak-two-double-jump-pass',
    kind: 'overcallerRebid',
    title: 'Decline a constructive suit jump after a weak-two Double',
    auctionContext: { stage: 'overcallerRebid', openerCalls: ['2D', '2H', '2S'],
                      interference: 'takeoutDouble' },
    calls: ['Pass'],
    callCategory: ['signoff'],
    appliesWhen: (call, context) => weakTwoDoublerRebidApplies(call, context, 'jump-pass'),
    meaning: 'A minimum Doubler may stop in advancer’s invitational jump suit.',
    certainty: 'high',
  },
  //
  {
    id: 'overcaller-rebid-weak-two-double-jump-game',
    kind: 'overcallerRebid',
    title: 'Accept an invitational major-suit jump after a weak-two Double',
    auctionContext: { stage: 'overcallerRebid', openerCalls: ['2D', '2H', '2S'],
                      interference: 'takeoutDouble' },
    calls: ['4H', '4S'],
    callCategory: ['natural'],
    appliesWhen: (call, context) => weakTwoDoublerRebidApplies(call, context, 'jump-game'),
    meaning: 'With extra Doubler values and four-card support, accept advancer’s ' +
             'constructive major-suit invitation.',
    certainty: 'high',
  },
  //
  {
    id: 'overcaller-rebid-weak-two-double-minimum-raise',
    kind: 'overcallerRebid',
    title: 'Support advancer’s major after a strong weak-two Double',
    auctionContext: { stage: 'overcallerRebid', openerCalls: ['2D', '2H', '2S'],
                      interference: 'takeoutDouble' },
    calls: ['3H', '3S'],
    callCategory: ['natural'],
    appliesWhen: (call, context) => weakTwoDoublerRebidApplies(call, context, 'minimum-raise'),
    meaning: 'With strong Doubler values and four-card support, make an economical constructive raise.',
    certainty: 'high',
  },
  //
  {
    id: 'overcaller-rebid-weak-two-double-nt-pass',
    kind: 'overcallerRebid',
    title: 'Decline a natural 2NT invitation after a weak-two Double',
    auctionContext: { stage: 'overcallerRebid', openerCalls: ['2D', '2H', '2S'],
                      interference: 'takeoutDouble' },
    calls: ['Pass'],
    callCategory: ['signoff'],
    appliesWhen: (call, context) => weakTwoDoublerRebidApplies(call, context, 'nt-pass'),
    meaning: 'With a minimum ordinary Double, stop in advancer’s natural 2NT.',
    certainty: 'high',
  },
  //
  {
    id: 'overcaller-rebid-weak-two-double-nt-game',
    kind: 'overcallerRebid',
    title: 'Accept advancer’s natural 2NT invitation after a weak-two Double',
    auctionContext: { stage: 'overcallerRebid', openerCalls: ['2D', '2H', '2S'],
                      interference: 'takeoutDouble' },
    calls: ['3NT'],
    callCategory: ['natural'],
    appliesWhen: (call, context) => weakTwoDoublerRebidApplies(call, context, 'nt-game'),
    meaning: 'Bid 3NT with suitable combined values opposite the 11–12 HCP invitation.',
    certainty: 'high',
  },
  //
  {
    id: 'overcaller-rebid-weak-two-double-game-pass',
    kind: 'overcallerRebid',
    title: 'Pass advancer’s natural game after a weak-two Double',
    auctionContext: { stage: 'overcallerRebid', openerCalls: ['2D', '2H', '2S'],
                      interference: 'takeoutDouble' },
    calls: ['Pass'],
    callCategory: ['signoff'],
    appliesWhen: (call, context) => weakTwoDoublerRebidApplies(call, context, 'game-pass'),
    meaning: 'Advancer has selected a game contract; no further action is normally needed.',
    certainty: 'high',
  },
  //
  {
    id: 'overcaller-rebid-weak-two-double-cue-suit',
    kind: 'overcallerRebid',
    title: 'Show an economical unbid suit after a forcing cuebid',
    auctionContext: { stage: 'overcallerRebid', openerCalls: ['2D', '2H', '2S'],
                      interference: 'takeoutDouble' },
    calls: ['3C', '3D', '3H', '3S'],
    callCategory: ['natural'],
    appliesWhen: (call, context) => weakTwoDoublerRebidApplies(call, context, 'cue-suit'),
    meaning: 'Answer the strong cuebid with a four-card-or-longer unbid suit where space permits.',
    certainty: 'high',
  },
  //
  {
    id: 'overcaller-rebid-weak-two-double-cue-nt',
    kind: 'overcallerRebid',
    title: 'Show stopped notrump after a weak-two cuebid',
    auctionContext: { stage: 'overcallerRebid', openerCalls: ['2D', '2H', '2S'],
                      interference: 'takeoutDouble' },
    calls: ['3NT'],
    callCategory: ['natural'],
    appliesWhen: (call, context) => weakTwoDoublerRebidApplies(call, context, 'cue-nt'),
    meaning: 'Bid 3NT with sufficient values, suitable shape, and a stopper in the opening suit.',
    certainty: 'high',
  },
  //
  {
    id: 'overcaller-rebid-weak-two-double-strong-suit',
    kind: 'overcallerRebid',
    title: 'Show a good suit after a strong weak-two Double',
    auctionContext: { stage: 'overcallerRebid', openerCalls: ['2D', '2H', '2S'],
                      interference: 'takeoutDouble' },
    calls: ['2C', '2D', '2H', '2S', '3C', '3D', '3H', '3S'],
    callCategory: ['natural'],
    appliesWhen: (call, context) => weakTwoDoublerRebidApplies(call, context, 'strong-suit'),
    meaning: 'After a minimum or jump advance, show a good five-card-or-longer suit with 18+ HCP.',
    certainty: 'high',
  },
  //
  {
    id: 'overcaller-rebid-weak-two-double-strong-nt',
    kind: 'overcallerRebid',
    title: 'Show a strong balanced hand after a weak-two Double',
    auctionContext: { stage: 'overcallerRebid', openerCalls: ['2D', '2H', '2S'],
                      interference: 'takeoutDouble' },
    calls: ['2NT', '3NT'],
    callCategory: ['natural'],
    appliesWhen: (call, context) => weakTwoDoublerRebidApplies(call, context, 'strong-nt'),
    meaning: 'After a weak suit advance, a natural notrump rebid shows extra strength and an opening-suit stopper.',
    certainty: 'high',
  },
  //
  {
    id: 'overcaller-rebid-weak-two-double-forcing-boundary',
    kind: 'scopeBoundary',
    title: 'Further strength and strain choice after a weak-two Double cuebid',
    auctionContext: { stage: 'overcallerRebid', openerCalls: ['2D', '2H', '2S'],
                      interference: 'takeoutDouble' },
    scopeBoundaryWhen: (context) => weakTwoDefenseBoundaryApplies(context, 'Double', true),
    meaning: 'Advancer’s cuebid is forcing; the Doubler must describe the hand further.',
    guidance: ['When no clear unbid suit or stopped notrump bid is available, choosing a ' +
               'strain at the remaining level requires judgment. Pass is not a signoff here.'],
    certainty: 'high',
  },
  //
  {
    id: 'overcaller-rebid-weak-two-double-other-boundary',
    kind: 'scopeBoundary',
    title: 'Further constructive choices after a weak-two Double',
    auctionContext: { stage: 'overcallerRebid', openerCalls: ['2D', '2H', '2S'],
                      interference: 'takeoutDouble' },
    scopeBoundaryWhen: (context) => weakTwoDefenseBoundaryApplies(context, 'Double', false),
    meaning: 'No further automatic continuation is supported for this combination of strength ' +
             'and available bidding room.',
    guidance: ['After a nonforcing advance, Pass may be reasonable; a very strong Double ' +
               'usually needs a further description.'],
    certainty: 'high',
  },
  //// Weak-two natural two-level suit overcall -- Selected rebids
  {
    id: 'overcaller-rebid-weak-two-suit-raise-pass',
    kind: 'overcallerRebid',
    title: 'Pass advancer’s simple raise of a weak-two defense overcall',
    auctionContext: { stage: 'overcallerRebid', openerCalls: ['2D', '2H', '2S'],
                      interference: 'suitOvercall' },
    calls: ['Pass'],
    callCategory: ['signoff'],
    appliesWhen: (call, context) => weakTwoSuitOvercallerRebidApplies(call, context, 'raise-pass'),
    meaning: 'Accept a nonforcing three-level raise without enough extra playing strength for game.',
    certainty: 'high',
  },
  //
  {
    id: 'overcaller-rebid-weak-two-suit-raise-game',
    kind: 'overcallerRebid',
    title: 'Raise a supported major overcall to game after a weak two',
    auctionContext: { stage: 'overcallerRebid', openerCalls: ['2D', '2H', '2S'],
                      interference: 'suitOvercall' },
    calls: ['4H', '4S'],
    callCategory: ['natural'],
    appliesWhen: (call, context) => weakTwoSuitOvercallerRebidApplies(call, context, 'raise-game'),
    meaning: 'An upper-range six-card major overcall can accept a three-level simple raise.',
    certainty: 'high',
  },
  //
  {
    id: 'overcaller-rebid-weak-two-suit-nt-pass',
    kind: 'overcallerRebid',
    title: 'Decline advancer’s 2NT invitation after a weak-two suit overcall',
    auctionContext: { stage: 'overcallerRebid', openerCalls: ['2D', '2H', '2S'],
                      interference: 'suitOvercall' },
    calls: ['Pass'],
    callCategory: ['signoff'],
    appliesWhen: (call, context) => weakTwoSuitOvercallerRebidApplies(call, context, 'nt-pass'),
    meaning: 'Stop in natural 2NT with lower-range overcall values.',
    certainty: 'high',
  },
  //
  {
    id: 'overcaller-rebid-weak-two-suit-nt-game',
    kind: 'overcallerRebid',
    title: 'Accept advancer’s 2NT invitation after a weak-two suit overcall',
    auctionContext: { stage: 'overcallerRebid', openerCalls: ['2D', '2H', '2S'],
                      interference: 'suitOvercall' },
    calls: ['3NT'],
    callCategory: ['natural'],
    appliesWhen: (call, context) => weakTwoSuitOvercallerRebidApplies(call, context, 'nt-game'),
    meaning: 'With upper-range values and suitable shape, raise the natural invitation to game.',
    certainty: 'high',
  },
  //
  {
    id: 'overcaller-rebid-weak-two-suit-game-pass',
    kind: 'overcallerRebid',
    title: 'Pass natural 3NT after a weak-two suit overcall',
    auctionContext: { stage: 'overcallerRebid', openerCalls: ['2D', '2H', '2S'],
                      interference: 'suitOvercall' },
    calls: ['Pass'],
    callCategory: ['signoff'],
    appliesWhen: (call, context) => weakTwoSuitOvercallerRebidApplies(call, context, 'game-pass'),
    meaning: 'Advancer has already placed the contract in notrump game.',
    certainty: 'high',
  },
  //
  {
    id: 'overcaller-rebid-weak-two-suit-cue-return',
    kind: 'overcallerRebid',
    title: 'Return to the overcalled major after a forcing support cuebid',
    auctionContext: { stage: 'overcallerRebid', openerCalls: ['2D', '2H', '2S'],
                      interference: 'suitOvercall' },
    calls: ['3H', '3S'],
    callCategory: ['natural'],
    appliesWhen: (call, context) => weakTwoSuitOvercallerRebidApplies(call, context, 'cue-return'),
    meaning: 'An economical return to the original major describes a lower-range overcall.',
    certainty: 'high',
  },
  //
  {
    id: 'overcaller-rebid-weak-two-suit-cue-game',
    kind: 'overcallerRebid',
    title: 'Bid major game after a strong support cuebid of a weak two',
    auctionContext: { stage: 'overcallerRebid', openerCalls: ['2D', '2H', '2S'],
                      interference: 'suitOvercall' },
    calls: ['4H', '4S'],
    callCategory: ['natural'],
    appliesWhen: (call, context) => weakTwoSuitOvercallerRebidApplies(call, context, 'cue-game'),
    meaning: 'With an upper-range six-card major and known support, place the contract in game.',
    certainty: 'high',
  },
  //
  {
    id: 'overcaller-rebid-weak-two-suit-new-support',
    kind: 'overcallerRebid',
    title: 'Support advancer’s forcing new suit over a weak two',
    auctionContext: { stage: 'overcallerRebid', openerCalls: ['2D', '2H', '2S'],
                      interference: 'suitOvercall' },
    calls: ['3C', '3D', '3H', '3S'],
    callCategory: ['natural'],
    appliesWhen: (call, context) => weakTwoSuitOvercallerRebidApplies(call, context, 'new-support'),
    meaning: 'Show three-card or longer support for advancer’s natural forcing new suit.',
    certainty: 'high',
  },
  //
  {
    id: 'overcaller-rebid-weak-two-suit-new-repeat',
    kind: 'overcallerRebid',
    title: 'Repeat a six-card major after a forcing new-suit advance',
    auctionContext: { stage: 'overcallerRebid', openerCalls: ['2D', '2H', '2S'],
                      interference: 'suitOvercall' },
    calls: ['3H', '3S'],
    callCategory: ['natural'],
    appliesWhen: (call, context) => weakTwoSuitOvercallerRebidApplies(call, context, 'new-repeat'),
    meaning: 'A six-card original major supplies a natural response to advancer’s forcing suit.',
    certainty: 'high',
  },
  //
  {
    id: 'overcaller-rebid-weak-two-suit-new-nt',
    kind: 'overcallerRebid',
    title: 'Bid stopped notrump after a forcing new-suit advance',
    auctionContext: { stage: 'overcallerRebid', openerCalls: ['2D', '2H', '2S'],
                      interference: 'suitOvercall' },
    calls: ['3NT'],
    callCategory: ['natural'],
    appliesWhen: (call, context) => weakTwoSuitOvercallerRebidApplies(call, context, 'new-nt'),
    meaning: 'A higher-range semi-balanced overcaller with an opening-suit stopper may choose 3NT.',
    certainty: 'high',
  },
  //
  {
    id: 'overcaller-rebid-weak-two-suit-forcing-boundary',
    kind: 'scopeBoundary',
    title: 'Further judgment after a strong advance of a weak-two suit overcall',
    auctionContext: { stage: 'overcallerRebid', openerCalls: ['2D', '2H', '2S'],
                      interference: 'suitOvercall' },
    scopeBoundaryWhen: (context) => weakTwoDefenseBoundaryApplies(context, 'suit', true),
    meaning: 'A support cuebid or natural new suit asks for another description, not Pass.',
    guidance: ['Without a clear fit, repeatable major, or suitable stopped notrump, ' +
               'the remaining bidding space calls for judgment.'],
    certainty: 'high',
  },
  //
  {
    id: 'overcaller-rebid-weak-two-suit-other-boundary',
    kind: 'scopeBoundary',
    title: 'Judgment after an ordinary advance of a weak-two suit overcall',
    auctionContext: { stage: 'overcallerRebid', openerCalls: ['2D', '2H', '2S'],
                      interference: 'suitOvercall' },
    scopeBoundaryWhen: (context) => weakTwoDefenseBoundaryApplies(context, 'suit', false),
    meaning: 'A nonforcing raise or notrump invitation may be accepted; ' +
             'other constructive continuations need judgment.',
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
  //// Takeout Double -- Doubler rebids after advancer acts
  // Keep ordinary and 18+ HCP doubles distinct. Forcing cuebids and responsive Doubles
  // cannot become an automatic Pass when no deterministic description qualifies.
  {
    id: 'overcaller-rebid-takeout-minimum-pass',
    kind: 'overcallerRebid',
    title: "Pass after partner's weak forced suit response",
    auctionContext: { stage: 'overcallerRebid', openerLevel: 1, openerStrain: 'suit',
                      interference: 'takeoutDouble' },
    calls: ['Pass'],
    callCategory: ['signoff'],
    appliesWhen: (call, context) => takeoutDoublerRebidApplies(call, context, 'minimum-pass'),
    meaning: 'A minimum ordinary takeout Doubler may stop in the suit advancer was obliged to choose.',
    certainty: 'high',
  },
  //
  {
    id: 'overcaller-rebid-takeout-minimum-raise',
    kind: 'overcallerRebid',
    title: "Raise advancer's selected suit with extra values",
    auctionContext: { stage: 'overcallerRebid', openerLevel: 1, openerStrain: 'suit',
                      interference: 'takeoutDouble' },
    calls: ['2C', '2D', '2H', '2S', '3C', '3D', '3H', '3S'],
    callCategory: ['natural'],
    appliesWhen: (call, context) => takeoutDoublerRebidApplies(call, context, 'minimum-raise'),
    meaning: 'Medium ordinary takeout Double with four-card support; raise economically.',
    certainty: 'high',
  },
  //
  {
    id: 'overcaller-rebid-takeout-maximum-raise',
    kind: 'overcallerRebid',
    title: 'Bid major game with maximum support',
    auctionContext: { stage: 'overcallerRebid', openerLevel: 1, openerStrain: 'suit',
                      interference: 'takeoutDouble' },
    calls: ['4H', '4S'],
    callCategory: ['natural'],
    appliesWhen: (call, context) => takeoutDoublerRebidApplies(call, context, 'maximum-raise'),
    meaning: 'Maximum ordinary takeout Double with a clear major fit and playing strength.',
    certainty: 'high',
  },
  //
  {
    id: 'overcaller-rebid-takeout-jump-pass',
    kind: 'overcallerRebid',
    title: "Decline advancer's invitational suit jump",
    auctionContext: { stage: 'overcallerRebid', openerLevel: 1, openerStrain: 'suit',
                      interference: 'takeoutDouble' },
    calls: ['Pass'],
    callCategory: ['signoff'],
    appliesWhen: (call, context) => takeoutDoublerRebidApplies(call, context, 'jump-pass'),
    meaning: 'Ordinary minimum doubler can decline an invitational jump.',
    certainty: 'high',
  },
  //
  {
    id: 'overcaller-rebid-takeout-jump-game',
    kind: 'overcallerRebid',
    title: "Accept advancer's major-suit jump invitation",
    auctionContext: { stage: 'overcallerRebid', openerLevel: 1, openerStrain: 'suit',
                      interference: 'takeoutDouble' },
    calls: ['4H', '4S'],
    callCategory: ['natural'],
    appliesWhen: (call, context) => takeoutDoublerRebidApplies(call, context, 'jump-game'),
    meaning: 'Stronger doubler with a suitable major fit accepts the invitation.',
    certainty: 'high',
  },
  //
  {
    id: 'overcaller-rebid-takeout-cue-suit',
    kind: 'overcallerRebid',
    title: 'Describe a four-card unbid suit after advancer cuebids',
    auctionContext: { stage: 'overcallerRebid', openerLevel: 1, openerStrain: 'suit',
                      interference: 'takeoutDouble' },
    calls: ['2C', '2D', '2H', '2S', '3C', '3D', '3H', '3S'],
    callCategory: ['natural'],
    appliesWhen: (call, context) => takeoutDoublerRebidApplies(call, context, 'cue-suit'),
    meaning: "Advancer's cuebid is artificial and forcing; show a four-card unbid suit.",
    certainty: 'high',
  },
  //
  {
    id: 'overcaller-rebid-takeout-cue-nt',
    kind: 'overcallerRebid',
    title: 'Describe balanced values after advancer cuebids',
    auctionContext: { stage: 'overcallerRebid', openerLevel: 1, openerStrain: 'suit',
                      interference: 'takeoutDouble' },
    calls: ['2NT', '3NT'],
    callCategory: ['natural'],
    appliesWhen: (call, context) => takeoutDoublerRebidApplies(call, context, 'cue-nt'),
    meaning: 'Without a four-card unbid fit, natural notrump requires balanced shape and an opening-suit stopper.',
    certainty: 'high',
  },
  //
  {
    id: 'overcaller-rebid-takeout-nt-pass',
    kind: 'overcallerRebid',
    title: "Pass advancer's natural notrump with minimum values",
    auctionContext: { stage: 'overcallerRebid', openerLevel: 1, openerStrain: 'suit',
                      interference: 'takeoutDouble' },
    calls: ['Pass'],
    callCategory: ['signoff'],
    appliesWhen: (call, context) => takeoutDoublerRebidApplies(call, context, 'nt-pass'),
    meaning: 'Advancer has already promised the opening-suit stopper; do not require it again.',
    certainty: 'high',
  },
  //
  {
    id: 'overcaller-rebid-takeout-nt-invite',
    kind: 'overcallerRebid',
    title: 'Invite game after advancer bids natural 1NT',
    auctionContext: { stage: 'overcallerRebid', openerLevel: 1, openerStrain: 'suit',
                      interference: 'takeoutDouble' },
    calls: ['2NT'],
    callCategory: ['invitational'],
    appliesWhen: (call, context) => takeoutDoublerRebidApplies(call, context, 'nt-invite'),
    meaning: 'Extra values may invite over natural 1NT.',
    guidance: ['Advancer evaluates the invitation with the originally promised opener-suit ' +
               'stopper and useful maximum values; a minimum can Pass.'],
    certainty: 'high',
  },
  //
  {
    id: 'overcaller-rebid-takeout-nt-game',
    kind: 'overcallerRebid',
    title: 'Bid 3NT with game-going combined values',
    auctionContext: { stage: 'overcallerRebid', openerLevel: 1, openerStrain: 'suit',
                      interference: 'takeoutDouble' },
    calls: ['3NT'],
    callCategory: ['natural'],
    appliesWhen: (call, context) => takeoutDoublerRebidApplies(call, context, 'nt-game'),
    meaning: 'Accept a natural notrump invitation or raise 1NT to game with sufficient strength.',
    certainty: 'high',
  },
  //
  {
    id: 'overcaller-rebid-takeout-game-pass',
    kind: 'overcallerRebid',
    title: "Pass advancer's natural game signoff",
    auctionContext: { stage: 'overcallerRebid', openerLevel: 1, openerStrain: 'suit',
                      interference: 'takeoutDouble' },
    calls: ['Pass'],
    callCategory: ['signoff'],
    appliesWhen: (call, context) => takeoutDoublerRebidApplies(call, context, 'game-pass'),
    meaning: 'A game-level advance is ordinarily a signoff; slam exploration is outside this treatment.',
    certainty: 'high',
  },
  //
  //// Strong takeout Double -- Double then suit or notrump
  {
    id: 'overcaller-rebid-takeout-strong-suit',
    kind: 'overcallerRebid',
    title: 'Describe a strong takeout Double with a natural suit',
    auctionContext: { stage: 'overcallerRebid', openerLevel: 1, openerStrain: 'suit',
                      interference: 'takeoutDouble' },
    calls: ['1C', '1D', '1H', '1S', '2C', '2D', '2H', '2S', '3C', '3D', '3H', '3S'],
    callCategory: ['natural'],
    appliesWhen: (call, context) => takeoutDoublerRebidApplies(call, context, 'strong-suit'),
    meaning: 'An 18+ HCP Double followed by a good natural five-card-or-longer suit shows extra values.',
    certainty: 'high',
  },
  //
  {
    id: 'overcaller-rebid-takeout-strong-nt',
    kind: 'overcallerRebid',
    title: 'Describe a strong takeout Double with natural notrump',
    auctionContext: { stage: 'overcallerRebid', openerLevel: 1, openerStrain: 'suit',
                      interference: 'takeoutDouble' },
    calls: ['1NT', '2NT', '3NT'],
    callCategory: ['natural'],
    appliesWhen: (call, context) => takeoutDoublerRebidApplies(call, context, 'strong-nt'),
    meaning: 'With 18+ HCP, a balanced hand and opener-suit stopper, Double then NT shows strength.',
    certainty: 'high',
  },
  //
  {
    id: 'overcaller-rebid-takeout-strong-fit',
    kind: 'overcallerRebid',
    title: "Raise advancer's major with a very strong Double",
    auctionContext: { stage: 'overcallerRebid', openerLevel: 1, openerStrain: 'suit',
                      interference: 'takeoutDouble' },
    calls: ['4H', '4S'],
    callCategory: ['natural'],
    appliesWhen: (call, context) => takeoutDoublerRebidApplies(call, context, 'strong-fit'),
    meaning: 'A strong doubler can show a substantial fit rather than inventing a side suit.',
    certainty: 'high',
  },
  //
  //// Takeout Double -- After responder competes
  {
    id: 'overcaller-rebid-takeout-competitive-pass',
    kind: 'overcallerRebid',
    title: "Pass after voluntary advance and responder competition",
    auctionContext: { stage: 'overcallerRebid', openerLevel: 1, openerStrain: 'suit',
                      interference: 'takeoutDouble' },
    calls: ['Pass'],
    callCategory: ['signoff'],
    appliesWhen: (call, context) => takeoutDoublerRebidApplies(call, context, 'competitive-pass'),
    meaning: 'A voluntary natural suit advance after responder acts is not a forced response.',
    certainty: 'high',
  },
  //
  {
    id: 'overcaller-rebid-takeout-competitive-raise',
    kind: 'overcallerRebid',
    title: 'Raise a major after responder competes',
    auctionContext: { stage: 'overcallerRebid', openerLevel: 1, openerStrain: 'suit',
                      interference: 'takeoutDouble' },
    calls: ['4H', '4S'],
    callCategory: ['natural'],
    appliesWhen: (call, context) => takeoutDoublerRebidApplies(call, context, 'competitive-raise'),
    meaning: 'Selected constructive major game with adequate support and strength.',
    certainty: 'high',
  },
  //
  {
    id: 'overcaller-rebid-takeout-responsive-suit',
    kind: 'overcallerRebid',
    title: 'Choose an unbid suit after responsive Double',
    auctionContext: { stage: 'overcallerRebid', openerLevel: 1, openerStrain: 'suit',
                      interference: 'takeoutDouble' },
    calls: ['2C', '2D', '2H', '2S', '3C', '3D', '3H', '3S'],
    callCategory: ['natural'],
    appliesWhen: (call, context) => takeoutDoublerRebidApplies(call, context, 'responsive-suit'),
    meaning: 'Responsive Double asks the doubler to choose an economical unbid suit.',
    certainty: 'high',
  },
  //
  {
    id: 'overcaller-rebid-takeout-escape-pass',
    kind: 'overcallerRebid',
    title: "Pass advancer's weak suit escape after Redouble",
    auctionContext: { stage: 'overcallerRebid', openerLevel: 1, openerStrain: 'suit',
                      interference: 'takeoutDouble' },
    calls: ['Pass'],
    callCategory: ['signoff'],
    appliesWhen: (call, context) => takeoutDoublerRebidApplies(call, context, 'escape-pass'),
    meaning: "An ordinary doubler can stop in partner's weak escape; complex penalty choices are omitted.",
    certainty: 'high',
  },
  //
  //// Takeout Double -- Explanations at the selected stopping point
  {
    id: 'overcaller-rebid-takeout-forcing-boundary',
    kind: 'scopeBoundary',
    title: 'Forcing cuebid or responsive Double needs further judgment',
    auctionContext: { stage: 'overcallerRebid', openerLevel: 1, openerStrain: 'suit',
                      interference: 'takeoutDouble' },
    scopeBoundaryWhen: (context) => takeoutDoublerBoundaryApplies(context, 'forcing'),
    meaning: 'Partner asked the doubler to describe a suit or strength, not to Pass.',
    guidance: ['Without a clear natural fit or stopped notrump description, consider the ' +
               'best strain and playing strength; no automatic signoff is modeled.'],
    certainty: 'high',
  },
  //
  {
    id: 'overcaller-rebid-takeout-strong-boundary',
    kind: 'scopeBoundary',
    title: 'Strong Double without a clear natural rebid',
    auctionContext: { stage: 'overcallerRebid', openerLevel: 1, openerStrain: 'suit',
                      interference: 'takeoutDouble' },
    scopeBoundaryWhen: (context) => takeoutDoublerBoundaryApplies(context, 'strong'),
    meaning: 'An 18+ HCP Double normally needs another description after a weak advance.',
    guidance: ['No selected good suit, fit, or suitable balanced NT rebid is available. ' +
               'Further strength and strain judgment is outside this treatment.'],
    certainty: 'high',
  },
  //
  {
    id: 'overcaller-rebid-takeout-ordinary-boundary',
    kind: 'scopeBoundary',
    title: 'Competitive decision after an ordinary takeout Double',
    auctionContext: { stage: 'overcallerRebid', openerLevel: 1, openerStrain: 'suit',
                      interference: 'takeoutDouble' },
    scopeBoundaryWhen: (context) => takeoutDoublerBoundaryApplies(context, 'ordinary'),
    meaning: 'A nonforcing advance may be passed; improving the contract may require judgment.',
    guidance: ['A fit, playing strength, bidding space, and competition determine whether ' +
               'to compete further. No mechanical bid is recommended for this hand.'],
    certainty: 'high',
  },
  //
  {
    id: 'overcaller-rebid-takeout-further-competition-boundary',
    kind: 'scopeBoundary',
    title: 'Further opponent competition after a takeout Double',
    auctionContext: { stage: 'overcallerRebid', openerLevel: 1, openerStrain: 'suit',
                      interference: 'takeoutDouble' },
    scopeBoundaryWhen: takeoutDoublerFurtherCompetitionBoundaryApplies,
    meaning: 'After both sides compete further, the doubler cannot choose a mechanical continuation.',
    guidance: ['Pass may be reasonable after a nonforcing advance, but a forcing call from ' +
               'partner changes the obligation. Further competition and penalty decisions ' +
               'require partnership judgment not modeled here.'],
    certainty: 'high',
  },
  //
  // Direct natural overcalls and informational takeout doubles after a one-level suit opening.
  // Weak-two defenses are defined separately below; their selected later rebids are above.
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
               'or suit on the next turn.'],
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
               'General penalty decisions are not modeled; selected natural doubler rebids are modeled.'],
    certainty: 'high',
  },
  //
  // Direct defenses to opposing weak 2D/2H/2S openings. They reuse the existing
  // takeout-Double shape treatment, followed by selected advances and natural rebids.
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
               'Later rebids distinguish this strong Double from an ordinary takeout Double.'],
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
  //
  //// Fourth-seat balancing after a one-level suit opening and two Passes
  // These rules are deliberately isolated from direct-seat overcall strength, weak jumps,
  // and takeout-double treatments.  Advancer's next turn remains explanatory only.
  {
    id: 'balance-natural-one-level-suit',
    kind: 'overcall',
    title: 'Balance in a natural suit at the one level',
    auctionContext: { stage: 'balancing', openerLevel: 1, openerStrain: 'suit' },
    calls: ['1D', '1H', '1S'],
    callRefinement: refineBalancingSuitBid,
    appliesWhen: { hcp: { min: 6, max: 14 } },
    priority: { rank: 50 },
    callCategory: ['natural'],
    meaning: 'A balancing suit bid can be about a king lighter than a direct-seat overcall.',
    guidance: ['Show a good five-card suit or any six-card suit at the cheapest level. ' +
               'Partner may have values despite passing directly; do not infer full opening values.',
               'A jump to a new suit is constructive in the balancing seat, not a weak ' +
               'direct-seat preempt; jump bidding is outside this executable treatment.',
               'Vulnerability and the likely defensive result still matter.'],
    certainty: 'high',
  },
  //
  {
    id: 'balance-natural-two-level-suit',
    kind: 'overcall',
    title: 'Balance in a good natural suit at the two level',
    auctionContext: { stage: 'balancing', openerLevel: 1, openerStrain: 'suit' },
    calls: ['2C', '2D', '2H', '2S'],
    callRefinement: refineBalancingSuitBid,
    appliesWhen: { hcp: { min: 8, max: 14 } },
    priority: { rank: 50 },
    callCategory: ['natural'],
    meaning: 'A natural, non-jump two-level balance with a respectable five-card-or-longer suit.',
    guidance: ['A balancing two-level suit bid needs more suit quality and strength than a ' +
               'one-level balance; a mere six-card suit without honors is insufficient.',
               'Partner must allow for the lighter balancing range when considering game.'],
    certainty: 'high',
  },
  //
  {
    id: 'balance-natural-1nt',
    kind: 'overcall',
    title: 'Balance with a natural 1NT',
    auctionContext: { stage: 'balancing', openerLevel: 1, openerStrain: 'suit' },
    calls: ['1NT'],
    appliesWhen: balancingOneNtApplies,
    priority: { rank: 70 },
    callCategory: ['natural'],
    meaning: 'Natural balancing 1NT: 12–15 HCP, balanced, with a stopper in opener’s suit.',
    guidance: ['This is weaker than the 15–18 HCP direct 1NT overcall. ' +
               'Partner should allow for the balancing range when evaluating game.',
               'With a stronger suitable hand, Double first and describe notrump later; ' +
               'the subsequent auction is not practiced here.'],
    certainty: 'high',
  },
  //
  {
    id: 'balance-takeout-double',
    kind: 'overcall',
    title: 'Make a balancing takeout Double with support for unbid suits',
    auctionContext: { stage: 'balancing', openerLevel: 1, openerStrain: 'suit' },
    calls: ['Double'],
    appliesWhen: balancingTakeoutDoubleApplies,
    priority: { rank: 40 },
    callCategory: ['conventional', 'forcing'],
    meaning: 'Balancing takeout Double: suitable shortage and support for the unbid suits, ' +
             'with less strength than a direct-seat takeout Double.',
    guidance: ['Partner generally chooses an unbid suit, but need not assume a full opening hand.',
               'A penalty conversion by passing requires unusual defensive strength in ' +
               'opener’s suit; partner’s continuation is outside the practiced auction.'],
    certainty: 'high',
  },
  //
  {
    id: 'balance-strong-double',
    kind: 'overcall',
    title: 'Start with Double on a strong balancing hand',
    auctionContext: { stage: 'balancing', openerLevel: 1, openerStrain: 'suit' },
    calls: ['Double'],
    appliesWhen: balancingStrongDoubleApplies,
    priority: { rank: 80 },
    callCategory: ['conventional', 'forcing'],
    meaning: 'Strong balancing Double may precede a natural suit or notrump description.',
    guidance: ['A strong hand outside the 12–15 balancing 1NT range can Double and then ' +
               'bid notrump with a stopper or show a long suit. The continuation is not practiced.',
               'With substantial length in opener’s suit, Pass for penalties may instead be ' +
               'preferable; that judgment is not automatic.',
               'A strong jump to 2NT is another partnership-dependent treatment, not ' +
               'an executable choice in this trainer.'],
    certainty: 'high',
  },
  //
  {
    id: 'balance-pass-defend',
    kind: 'overcall',
    title: 'Pass in the balancing seat',
    auctionContext: { stage: 'balancing', openerLevel: 1, openerStrain: 'suit' },
    calls: ['Pass'],
    appliesWhen: balancingPassApplies,
    priority: { rank: 0 },
    callCategory: ['signoff'],
    meaning: 'Let the opening contract play: balancing is an option, not an obligation.',
    guidance: ['Pass with insufficient strength or unsuitable shape, especially when holding ' +
               'length in opener’s suit. Reopening can help the opponents find a better contract.',
               'Some marginal hands also qualify for a light competing bid; length in opener’s ' +
               'suit and expected defensive tricks can favor Pass.'],
    certainty: 'high',
  },
  //
  {
    id: 'balance-scope-boundary',
    kind: 'scopeBoundary',
    title: 'Balancing choices requiring further judgment',
    auctionContext: { stage: 'balancing', openerLevel: 1, openerStrain: 'suit' },
    meaning: 'Some fourth-seat hands need a partnership-specific or judgment-driven balancing call.',
    guidance: ['Jump suit bids are constructive rather than the weak direct-seat preempts; ' +
               'strong 2NT, penalty choices, and specialized cuebids are not executable here.',
               'Consider opener-suit length, suit quality, strength, vulnerability and ' +
               'whether passing would defend a favorable contract.'],
    certainty: 'high',
  },
];
