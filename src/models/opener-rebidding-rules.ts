/// Opener Rebid Bidding Rules

import {
  type BidRule, type BiddingSystem, type Call, type RuleEvalContext, type CallRefinementResult,
  type AppliesWhenResult
} from './bidding-types';
import {
  openerJacobyGoodSideSuitApplies, openerMinorOneLevelOneNtApplies,
  openerNtDirectMajorSlamInterestApplies, openerNtGameInvitationApplies,
  openerNtMinorInvitationApplies, openerNtNaturalMajorGameApplies,
  openerNtNaturalThreeMajorApplies, openerNtNaturalThreeMinorApplies,
  oneNtInterferenceDoubleNtApplies, oneNtInterferenceNaturalPassApplies,
  oneNtInterferenceNaturalMajorRaiseApplies, oneNtInterferenceNaturalThreeNtApplies,
  oneNtInterferenceScopeBoundaryApplies, refineOneNtInterferenceDoubleFit,
  openerNtNotrumpSignoffApplies, openerNtQuantitativeInvitationApplies,
  openerNtWeakMajorSignoffApplies, openerPreemptNewSuitRaiseApplies,
  openerForcingResponseCompetitionNtApplies, openerForcingResponseCompetitionPassApplies,
  openerForcingResponseCompetitionScopeBoundaryApplies,
  openerThreeLevelForcingResponseThreeNtApplies,
  openerThreeLevelForcingResponseOpeningMajorGameApplies,
  openerSupportCuebidPassApplies, openerSupportCuebidGameApplies,
  openerSupportCuebidScopeBoundaryApplies,
  openerSimpleRaiseContinuedCompetitionScopeBoundaryApplies,
  openerPreemptNewSuitRepeatApplies, openerSecondSuitApplies, openerSuitThreeNtQuantitativeApplies,
  refineForcingOneNtMinorFallback, refineNtJacobyCompletion, refineNtStaymanReply,
  refineNtTexasCompletion, refineOpenerFiveCardMajorFallback, refineOpenerFourCardMajorUpTheLine,
  refineOpenerLowerRankingSecondSuitRebid, refineOpenerNaturalJumpShiftRebid,
  refineOpenerNewSuitAtCheapestLevel, refineOpenerNewSuitByExtraLevels,
  openerNegativeDoubleCompetitionPassApplies, openerNegativeDoubleNtApplies,
  openerNegativeDoubleScopeBoundaryApplies, refineOpenerNegativeDoubleImpliedSuitRebid,
  refineOpenerNegativeDoubleOpeningSuitRebid, refineOpenerNonReverseNewSuitRebid,
  refineOpenerForcingResponseCompetitionGameRaise, refineOpenerForcingResponseCompetitionRepeat,
  refineOpenerForcingResponseCompetitionSupport,
  refineOpenerNotrumpAtCheapestLevel, refineOpenerNtMajorSlamControlBid,
  refineOpenerNtResponderMajorToGame,
  refineOpenerOpeningSuitAtCheapestLevel, refineOpenerOpeningSuitToLevel,
  refineOpenerRaiseResponderSuitOneLevel, refineOpenerRaiseResponderSuitToLevel,
  refineOpenerResponderSuitToGame, refineOpenerReverseRebid, refineOpenerSplinterControlBid,
  refineStrongTwoCUnbalancedSuitRebid, refineStrongTwoCPositiveNewSuitRebid,
  strongTwoCPositiveMajorSupportApplies, strongTwoCPositiveMinorSupportApplies,
  strongTwoCPositiveBalancedNtApplies, strongTwoCPositiveScopeBoundaryApplies,
  refineWeakTwoFeatureRebid,
  jumpOvercallOpenerContinuationApplies, jumpOvercallOpenerBoundaryApplies,
  refineJumpOvercallOpenerAction,
  weakTwoFeatureAfterInquiryApplies, weakTwoRepeatAfterInquiryApplies, weakTwoSolidThreeNtApplies
} from './opener-rebidding-functions';
import { getResponderBid } from './common-rule-helpers';


export const OpenerRebidRules: BidRule[] = [
  // Opener's first rebid after the artificial 2D waiting response to strong 2C.
  {
    id: 'opener-rebid-2nt-after-2c-2d',
    kind: 'openerRebid',
    title: 'Rebid 2NT with 22-24 balanced after 2C-2D',
    auctionContext: { stage: 'openerRebid', auction: ['2C', '2D'] },
    calls: ['2NT'],
    callCategory: ['natural'],
    appliesWhen: { hcp: { min: 22, max: 24 }, shape: { balanced: true } },
    meaning: 'Balanced 22-24 HCP hand.',
    guidance: ["This rebid is not forcing.  Later responder methods can mirror the partnership's " +
               'methods over a notrump opening.'],
    certainty: 'high',
  },
  {
    id: 'opener-rebid-3nt-after-2c-2d',
    kind: 'openerRebid',
    title: 'Rebid 3NT with 25-27 balanced after 2C-2D',
    auctionContext: { stage: 'openerRebid', auction: ['2C', '2D'] },
    calls: ['3NT'],
    callCategory: ['natural'],
    appliesWhen: { hcp: { min: 25, max: 27 }, shape: { balanced: true } },
    meaning: 'Balanced 25-27 HCP hand.',
    guidance: ['No additional qualification beyond the stated balanced shape and HCP range is used.'],
    certainty: 'high',
  },
  {
    id: 'opener-rebid-4nt-after-2c-2d',
    kind: 'openerRebid',
    title: 'Rebid 4NT with 28-30 balanced after 2C-2D',
    auctionContext: { stage: 'openerRebid', auction: ['2C', '2D'] },
    calls: ['4NT'],
    callCategory: ['natural'],
    appliesWhen: { hcp: { min: 28, max: 30 }, shape: { balanced: true } },
    meaning: 'Balanced 28-30 HCP hand; this is a natural strength-showing rebid, not Blackwood.',
    guidance: ['No additional qualification beyond the stated balanced shape and HCP range is used.'],
    certainty: 'high',
  },
  {
    id: 'opener-rebid-longest-suit-after-2c-2d',
    kind: 'openerRebid',
    title: 'Show the longest suit after 2C-2D with an unbalanced hand',
    auctionContext: { stage: 'openerRebid', auction: ['2C', '2D'] },
    calls: ['2H', '2S', '3C', '3D'],
    callRefinement: refineStrongTwoCUnbalancedSuitRebid,
    callCategory: ['forcing', 'natural'],
    appliesWhen: { hcp: { min: 22 } },
    meaning: "Natural forcing rebid in opener's longest five-card-or-longer suit.",
    guidance: ['With two equal five-card or equal six-card suits, bid the higher-ranking suit.',
               'Balanced hands use the separate 2NT, 3NT, or 4NT rebids instead.'],
    certainty: 'high',
  },
  //
  // Strong 2C followed by a positive suit or balanced 2NT response is already game-forcing.
  // Keep the opener's first description natural and economical; subsequent slam evaluation
  // belongs to responder's rebid or an explicit judgment boundary, not an automatic jump.
  {
    id: 'opener-rebid-support-positive-major-after-2c',
    kind: 'openerRebid',
    title: 'Raise a positive major economically after strong 2C',
    auctionContext: { stage: 'openerRebid', openerCalls: ['2C'], interference: 'none',
                      responderCall: { kind: 'newSuit', level: 2 } },
    calls: ['3H', '3S'],
    callRefinement: (calls, context) => {
      const response = getResponderBid(context);
      return { calls: calls.filter((call) => response !== null &&
        (response.strain === 'H' || response.strain === 'S') && call === `3${response.strain}`),
        telemetryLines: [] };
    },
    appliesWhen: strongTwoCPositiveMajorSupportApplies,
    callCategory: ['gameForcing', 'natural'],
    priority: { rank: 20 },
    meaning: 'Three-card-or-longer support for responder\'s positive five-card major; forcing.',
    guidance: ['Raise at the cheapest three-level bid to preserve space for game or slam exploration.',
               'Do not treat this raise as a weak or invitational major raise.'],
    certainty: 'high',
  },
  {
    id: 'opener-rebid-support-positive-minor-after-2c',
    kind: 'openerRebid',
    title: 'Show an unbalanced minor fit after a positive minor response',
    auctionContext: { stage: 'openerRebid', openerCalls: ['2C'], interference: 'none',
                      responderCall: { kind: 'newSuit', level: 3 } },
    calls: ['4C', '4D'],
    callRefinement: (calls, context) => {
      const response = getResponderBid(context);
      return { calls: calls.filter((call) => response !== null &&
        (response.strain === 'C' || response.strain === 'D') && call === `4${response.strain}`),
        telemetryLines: [] };
    },
    appliesWhen: strongTwoCPositiveMinorSupportApplies,
    callCategory: ['gameForcing', 'natural'],
    meaning: 'Unbalanced four-card-or-longer support for responder\'s positive minor.',
    guidance: ['This deliberately bypasses 3NT only with a substantial minor fit and no longer ' +
               'natural side suit to describe. Further bidding may investigate slam.'],
    certainty: 'medium',
  },
  {
    id: 'opener-rebid-longest-suit-after-2c-positive',
    kind: 'openerRebid',
    title: 'Show an unbalanced opener\'s own long suit after a positive response',
    auctionContext: { stage: 'openerRebid', openerCalls: ['2C'], interference: 'none' },
    calls: ['2S', '3C', '3D', '3H', '3S'],
    callRefinement: refineStrongTwoCPositiveNewSuitRebid,
    appliesWhen: { hcp: { min: 22 } },
    callCategory: ['gameForcing', 'natural'],
    meaning: 'Natural five-card-or-longer opener suit, game forcing after a positive response.',
    guidance: ['Prefer a three-card fit for responder\'s positive major when one exists.',
               'Show the longest eligible own suit at the cheapest legal level through 3S; ' +
               'equal lengths use the higher-ranking suit.',
               'Do not invent a four-level new suit where it would bypass 3NT.'],
    certainty: 'high',
  },
  {
    id: 'opener-rebid-natural-nt-after-2c-positive',
    kind: 'openerRebid',
    title: 'Describe a 22-24 balanced hand after a positive response',
    auctionContext: { stage: 'openerRebid', openerCalls: ['2C'], interference: 'none' },
    calls: ['2NT', '3NT'],
    appliesWhen: strongTwoCPositiveBalancedNtApplies,
    callCategory: ['gameForcing', 'natural'],
    meaning: 'Minimum 22-24 balanced strong 2C opener; natural NT description, not a signoff.',
    guidance: ['After a positive major, prefer 3M with a three-card fit; otherwise describe with 2NT.',
               'After a positive minor or balanced 2NT response, the lowest available natural NT is 3NT.',
               'Partner has shown 8+ HCP, so a game-level rebid does not end possible slam interest.'],
    certainty: 'high',
  },
  {
    id: 'opener-rebid-scope-boundary-after-2c-positive',
    kind: 'scopeBoundary',
    title: 'Strong 2C positive response: further descriptive or slam judgment',
    auctionContext: { stage: 'openerRebid', openerCalls: ['2C'], interference: 'none' },
    scopeBoundaryWhen: strongTwoCPositiveScopeBoundaryApplies,
    meaning: 'The positive response is game-forcing, but opener has no chosen natural rebid.',
    guidance: ['For very strong balanced hands, an awkward unbalanced shape, or a new suit ' +
               'that would bypass 3NT, do not manufacture a signoff.',
               'Deciding on a control bid, a strain, or a slam investigation requires more ' +
               'judgment and agreements than this selected strong-2C treatment models.'],
    certainty: 'high',
  },
  //
  // These immediate, uncontested rebids apply to natural 1NT and 2NT alike.
  // Stayman shows hearts first with both four-card majors.
  {
    id: 'opener-rebid-deny-major-after-nt-stayman',
    kind: 'openerRebid',
    title: 'Deny a four-card major after Stayman',
    auctionContext: { stage: 'openerRebid', openerStrain: 'NT' },
    calls: ['2D', '3D'],
    callRefinement: refineNtStaymanReply,
    agreement: { setting: 'stayman', value: true },
    callCategory: ['conventional'],
    appliesWhen: { suitLengths: [{ suit: 'H', max: 3 }, { suit: 'S', max: 3 }] },
    meaning: 'No four-card major; responder can now describe their hand.',
    certainty: 'high',
  },
  {
    id: 'opener-rebid-show-hearts-after-nt-stayman',
    kind: 'openerRebid',
    title: 'Show four or more hearts after Stayman',
    auctionContext: { stage: 'openerRebid', openerStrain: 'NT' },
    calls: ['2H', '3H'],
    callRefinement: refineNtStaymanReply,
    agreement: { setting: 'stayman', value: true },
    callCategory: ['conventional'],
    appliesWhen: { suitLengths: [{ suit: 'H', min: 4 }] },
    meaning: 'Show hearts first when opener has both four-card majors.',
    certainty: 'high',
  },
  {
    id: 'opener-rebid-show-spades-after-nt-stayman',
    kind: 'openerRebid',
    title: 'Show four or more spades without four hearts after Stayman',
    auctionContext: { stage: 'openerRebid', openerStrain: 'NT' },
    calls: ['2S', '3S'],
    callRefinement: refineNtStaymanReply,
    agreement: { setting: 'stayman', value: true },
    callCategory: ['conventional'],
    appliesWhen: { suitLengths: [{ suit: 'S', min: 4 }, { suit: 'H', max: 3 }] },
    meaning: 'Show a four-card spade suit when no four-card heart suit is available.',
    certainty: 'high',
  },
  {
    id: 'opener-rebid-complete-jacoby-after-nt',
    kind: 'openerRebid',
    title: 'Complete a Jacoby transfer after 1NT or 2NT',
    auctionContext: { stage: 'openerRebid', openerStrain: 'NT' },
    calls: ['2H', '2S', '3H', '3S'],
    callRefinement: refineNtJacobyCompletion,
    agreement: { setting: 'jacobyTransfers', value: true },
    callCategory: ['conventional'],
    meaning: 'Complete the transfer at the next level; opener normally becomes declarer.',
    guidance: ['This initial treatment does not model superaccepting transfers.'],
    certainty: 'high',
  },
  {
    id: 'opener-rebid-complete-texas-after-nt',
    kind: 'openerRebid',
    title: 'Complete a Texas transfer after 1NT or 2NT',
    auctionContext: { stage: 'openerRebid', openerStrain: 'NT' },
    calls: ['4H', '4S'],
    callRefinement: refineNtTexasCompletion,
    agreement: { setting: 'texasTransfers', value: true },
    callCategory: ['conventional'],
    meaning: 'Complete the Texas transfer to game in the requested major.',
    certainty: 'high',
  },
  {
    id: 'opener-rebid-pass-after-nt-natural-nt-signoff',
    kind: 'openerRebid',
    title: 'Pass a natural notrump game or slam signoff',
    auctionContext: {
      stage: 'openerRebid', openerRebidAfterInterference: true, openerStrain: 'NT',
    },
    calls: ['Pass'],
    callCategory: ['signoff'],
    appliesWhen: openerNtNotrumpSignoffApplies,
    meaning: 'Responder placed the contract in 3NT, 6NT, or 7NT.',
    certainty: 'high',
  },
  {
    id: 'opener-rebid-pass-after-nt-natural-major-game',
    kind: 'openerRebid',
    title: 'Pass a natural four-of-a-major game signoff',
    auctionContext: { stage: 'openerRebid', openerStrain: 'NT' },
    calls: ['Pass'],
    agreement: { setting: 'texasTransfers', value: false },
    callCategory: ['signoff'],
    appliesWhen: openerNtNaturalMajorGameApplies,
    meaning: 'Without Texas, a direct 4H or 4S is natural and to play.',
    certainty: 'high',
  },
  {
    id: 'opener-rebid-pass-after-1nt-weak-natural-major',
    kind: 'openerRebid',
    title: 'Pass a weak natural major signoff over 1NT',
    auctionContext: { stage: 'openerRebid', openerStrain: 'NT' },
    calls: ['Pass'],
    agreement: { setting: 'jacobyTransfers', value: false },
    callCategory: ['signoff'],
    appliesWhen: openerNtWeakMajorSignoffApplies,
    meaning: 'Without Jacoby transfers, 2H and 2S are natural weak signoffs.',
    certainty: 'high',
  },
  // A natural 1NT-3m invitation is about fitting honor strength, not simply minimum/maximum.
  {
    id: 'opener-rebid-pass-after-1nt-3-minor-invitation',
    kind: 'openerRebid',
    title: 'Decline a natural minor invitation without a fitting top honor',
    auctionContext: { stage: 'openerRebid', openerStrain: 'NT',
                      responderCall: { kind: 'newSuit', level: 3 } },
    calls: ['Pass'],
    callCategory: ['signoff'],
    priority: { rank: 55 },
    appliesWhen: (call, context) => openerNtMinorInvitationApplies(call, context, false),
    meaning: "Play three of responder's minor when opener cannot guarantee the suit will run.",
    guidance: ['Responder has promised 6+ cards and at least two of A/K/Q; without one of A/K/Q ' +
               'in that minor, opener cannot guarantee all three top honors.'],
    certainty: 'high',
  },
  {
    id: 'opener-rebid-3nt-after-1nt-3-minor-invitation',
    kind: 'openerRebid',
    title: 'Accept a natural minor invitation with a fitting top honor',
    auctionContext: { stage: 'openerRebid', openerStrain: 'NT',
                      responderCall: { kind: 'newSuit', level: 3 } },
    calls: ['3NT'],
    callCategory: ['signoff', 'natural'],
    priority: { rank: 55 },
    appliesWhen: (call, context) => openerNtMinorInvitationApplies(call, context, true),
    meaning: "Bid 3NT when opener holds A, K, or Q in responder's promised good six-card minor.",
    guidance: ['The fitting honor, rather than raw opener HCP, is the executable acceptance test.'],
    certainty: 'high',
  },
  // Natural 3M with Jacoby off is a choice of games: two-card support favors 3NT, 3+ favors 4M.
  {
    id: 'opener-rebid-3nt-after-nt-natural-3-major',
    kind: 'openerRebid',
    title: 'Choose 3NT with two-card support after a natural 3M response',
    auctionContext: { stage: 'openerRebid', openerStrain: 'NT',
                      responderCall: { kind: 'newSuit', level: 3 } },
    calls: ['3NT'],
    agreement: { setting: 'jacobyTransfers', value: false },
    callCategory: ['natural'],
    priority: { rank: 45 },
    appliesWhen: (call, context) => openerNtNaturalThreeMajorApplies(call, context, 2, 2),
    meaning: "With only two cards in responder's five-card-or-longer major, choose the notrump game.",
    certainty: 'high',
  },
  {
    id: 'opener-rebid-game-in-responder-major-after-nt-natural-3-major',
    kind: 'openerRebid',
    title: "Choose four of responder's major with three-card-or-longer support",
    auctionContext: { stage: 'openerRebid', openerStrain: 'NT',
                      responderCall: { kind: 'newSuit', level: 3 } },
    calls: ['4H', '4S'],
    callRefinement: refineOpenerNtResponderMajorToGame,
    agreement: { setting: 'jacobyTransfers', value: false },
    callCategory: ['natural'],
    priority: { rank: 45 },
    appliesWhen: (call, context) => openerNtNaturalThreeMajorApplies(call, context, 3),
    meaning: 'Three-card support establishes the known eight-card major fit; choose the major game.',
    certainty: 'high',
  },
  // With transfers on, direct 1NT-3M is the existing slam-interest treatment.  4M always remains
  // available; middle-or-better opener values may cooperate by showing the cheapest side control.
  {
    id: 'opener-rebid-game-after-1nt-direct-3-major-slam-interest',
    kind: 'openerRebid',
    title: 'Stop in game after a direct major slam try',
    auctionContext: { stage: 'openerRebid', openerStrain: 'NT',
                      responderCall: { kind: 'newSuit', level: 3 } },
    calls: ['4H', '4S'],
    callRefinement: refineOpenerNtResponderMajorToGame,
    agreement: { setting: 'jacobyTransfers', value: true },
    callCategory: ['signoff', 'natural'],
    priority: { rank: 30 },
    appliesWhen: (call, context, system) =>
      openerNtDirectMajorSlamInterestApplies(call, context, system, false),
    meaning: 'Decline further slam exploration while placing the contract in the agreed major game.',
    guidance: ['4M remains visible even when a control bid is also reasonable.'],
    certainty: 'medium',
  },
  {
    id: 'opener-rebid-control-after-1nt-direct-3-major-slam-interest',
    kind: 'openerRebid',
    title: 'Cooperate with a direct major slam try by showing a side control',
    auctionContext: { stage: 'openerRebid', openerStrain: 'NT',
                      responderCall: { kind: 'newSuit', level: 3 } },
    calls: ['3S', '4C', '4D', '4H'],
    callRefinement: refineOpenerNtMajorSlamControlBid,
    agreement: { setting: 'jacobyTransfers', value: true },
    callCategory: ['gameForcing', 'conventional'],
    priority: { rank: 45 },
    appliesWhen: (call, context, system) =>
      openerNtDirectMajorSlamInterestApplies(call, context, system, true),
    meaning: 'Show the cheapest side-suit ace or king while keeping the agreed major available at game.',
    guidance: ['Cooperate from the middle of the 1NT range upward; a maximum is especially suitable.',
               'This is modest control bidding, not Gerber or Blackwood.'],
    certainty: 'medium',
  },
  // A strong natural 3m over 2NT is forcing; 3NT is the basic continuation rather than Pass.
  {
    id: 'opener-rebid-3nt-after-2nt-natural-3-minor',
    kind: 'openerRebid',
    title: 'Return to 3NT after a natural forcing minor response to 2NT',
    auctionContext: { stage: 'openerRebid', openerStrain: 'NT',
                      responderCall: { kind: 'newSuit', level: 3 } },
    calls: ['3NT'],
    callCategory: ['natural'],
    priority: { rank: 40 },
    appliesWhen: openerNtNaturalThreeMinorApplies,
    meaning: 'Use 3NT as the normal game destination after responder describes a strong long minor.',
    guidance: ['Responder may continue with additional slam interest; deeper minor-fit slam ' +
               'machinery is not modeled in this treatment.'],
    certainty: 'medium',
  },
  // After a natural suit overcall of our 1NT, responder's takeout Double promises
  // unbid-suit length.  It is not a penalty Double, and opener must describe a fit
  // or a stopped NT hand rather than pass the Double.
  {
    id: 'opener-rebid-fit-after-1nt-interference-double',
    kind: 'openerRebid',
    title: 'Show a four-card unbid-suit fit after responder Doubles 1NT interference',
    auctionContext: { stage: 'openerRebid', openerStrain: 'NT',
                      interference: 'other',
                      responderCall: { kind: 'double' } },
    calls: ['2H', '2S', '3C', '3D', '3S'],
    callRefinement: refineOneNtInterferenceDoubleFit,
    callCategory: ['natural'],
    meaning: 'Show a four-card fit for responder’s takeout-oriented Double in an unbid suit.',
    guidance: ['After minor interference prefer hearts, then spades; after spade interference ' +
               'show clubs before diamonds. A raise by the opponents may force a higher level.',
               'This reply completes the takeout Double; responder can assess a game invitation ' +
               'or game with additional values.'],
    certainty: 'high',
  },
  {
    id: 'opener-rebid-2nt-after-1nt-interference-double',
    kind: 'openerRebid',
    title: 'Show a stopped minimum/middle 1NT hand without a takeout fit',
    auctionContext: { stage: 'openerRebid', openerStrain: 'NT',
                      interference: 'other',
                      responderCall: { kind: 'double' } },
    calls: ['2NT'],
    callCategory: ['natural'],
    appliesWhen: oneNtInterferenceDoubleNtApplies,
    meaning: 'No four-card fit in responder’s indicated suits; minimum or middle 1NT opening ' +
             'with a stopper in the opposing suit.',
    certainty: 'high',
  },
  {
    id: 'opener-rebid-3nt-after-1nt-interference-double',
    kind: 'openerRebid',
    title: 'Show a stopped maximum 1NT hand without a takeout fit',
    auctionContext: { stage: 'openerRebid', openerStrain: 'NT',
                      interference: 'other',
                      responderCall: { kind: 'double' } },
    calls: ['3NT'],
    callCategory: ['natural'],
    appliesWhen: oneNtInterferenceDoubleNtApplies,
    meaning: 'Maximum 1NT values, a stopper in the opponent’s suit, and no four-card fit ' +
             'for responder’s takeout Double.',
    certainty: 'medium',
  },
  // Responder\'s natural suit calls are nonforcing; partner has 8+ at the two level
  // or 10+ at the three level, so use a conservative signoff/invitation/game ladder.
  {
    id: 'opener-rebid-pass-after-1nt-interference-natural-suit',
    kind: 'openerRebid',
    title: 'Pass a nonforcing natural response to 1NT interference',
    auctionContext: { stage: 'openerRebid', openerStrain: 'NT',
                      interference: 'other',
                      responderCall: { kind: 'newSuit' } },
    calls: ['Pass'],
    callCategory: ['signoff'],
    appliesWhen: oneNtInterferenceNaturalPassApplies,
    meaning: 'No constructive improvement over partner’s natural, nonforcing suit response.',
    guidance: ['23–25 minimum combined HCP makes game possible, not automatic. ' +
               'Strong fit and stoppers may justify an invitation or game.'],
    certainty: 'medium',
  },
  {
    id: 'opener-rebid-raise-major-after-1nt-interference-natural-suit',
    kind: 'openerRebid',
    title: 'Invite or bid game with major support after 1NT interference',
    auctionContext: { stage: 'openerRebid', openerStrain: 'NT',
                      interference: 'other',
                      responderCall: { kind: 'newSuit' } },
    calls: ['3H', '3S', '4H', '4S'],
    callCategory: ['natural'],
    appliesWhen: oneNtInterferenceNaturalMajorRaiseApplies,
    meaning: 'A three-level raise invites with an adequate major fit; four of the major ' +
             'places game with sufficient strength and support.',
    certainty: 'medium',
  },
  {
    id: 'opener-rebid-3nt-after-1nt-interference-natural-suit',
    kind: 'openerRebid',
    title: 'Bid 3NT after a constructive natural suit response with a stopper',
    auctionContext: { stage: 'openerRebid', openerStrain: 'NT',
                      interference: 'other',
                      responderCall: { kind: 'newSuit' } },
    calls: ['3NT'],
    callCategory: ['natural'],
    appliesWhen: oneNtInterferenceNaturalThreeNtApplies,
    meaning: 'Responder has 10+ HCP, making game realistic, and opener stops the opposing ' +
             'suit without a preferred major fit.',
    certainty: 'high',
  },
  {
    id: 'opener-rebid-scope-boundary-after-1nt-interference',
    kind: 'scopeBoundary',
    title: 'Unresolved strain after natural interference over 1NT',
    auctionContext: { stage: 'openerRebid', openerStrain: 'NT',
                      openerRebidAfterInterference: true },
    scopeBoundaryWhen: oneNtInterferenceScopeBoundaryApplies,
    meaning: 'The partnership has values to compete, but no selected natural fit or stopped ' +
             'notrump description can be recommended reliably.',
    guidance: ['After a takeout Double, opener should not Pass merely because there is no ' +
               'four-card fit; further suit choice may require judgment.',
               'A constructive three-level response often suggests game, but without a stopper ' +
               'or agreed trump fit the exact strain requires additional bidding methods.'],
    certainty: 'high',
  },
  // Natural invitations are not signoffs: minimums decline, maximums accept, and
  // the middle strength deliberately offers both choices with judgment guidance.
  {
    id: 'opener-rebid-pass-after-1nt-2nt-invitation',
    kind: 'openerRebid',
    title: 'Decline a natural 2NT game invitation over 1NT',
    auctionContext: {
      stage: 'openerRebid', openerRebidAfterInterference: true, openerStrain: 'NT',
    },
    calls: ['Pass'],
    callCategory: ['signoff'],
    priority: { rank: 60 },
    appliesWhen: (call, context, system) =>
      openerNtGameInvitationApplies(call, context, system, false),
    meaning: 'Decline the invitation and play 2NT.',
    guidance: ['Over 15-17, Pass with 15 and generally with 16; consider 3NT with a good 16.',
               'Over 16-18, Pass with 16 and generally with 17; consider 3NT with a good 17.'],
    certainty: 'high',
  },
  {
    id: 'opener-rebid-3nt-after-1nt-2nt-invitation',
    kind: 'openerRebid',
    title: 'Accept a natural 2NT game invitation over 1NT',
    auctionContext: {
      stage: 'openerRebid', openerRebidAfterInterference: true, openerStrain: 'NT',
    },
    calls: ['3NT'],
    callCategory: ['signoff', 'natural'],
    priority: { rank: 60 },
    appliesWhen: (call, context, system) =>
      openerNtGameInvitationApplies(call, context, system, true),
    meaning: 'Accept the game invitation and bid 3NT.',
    guidance: ['Over 15-17, accept with 17 or a suitable 16.',
               'Over 16-18, accept with 18 or a suitable 17.',
               'Borderline hands depend on texture, working honors, and likely tricks.'],
    certainty: 'high',
  },
  {
    id: 'opener-rebid-pass-after-nt-4nt-quantitative-invitation',
    kind: 'openerRebid',
    title: 'Decline a quantitative 4NT invitation after a notrump opening',
    auctionContext: { stage: 'openerRebid', openerStrain: 'NT' },
    calls: ['Pass'],
    callCategory: ['signoff'],
    priority: { rank: 65 },
    appliesWhen: (call, context, system) =>
      openerNtQuantitativeInvitationApplies(call, context, system, false),
    meaning: 'Stop in 4NT rather than force a slam with insufficient values.',
    guidance: ['Minimum 1NT openers decline; middle-strength hands require judgment.',
               'A 20-HCP 2NT opener declines, and a 21-HCP opener may also decline: ' +
               'responder could have only 11 HCP.'],
    certainty: 'high',
  },
  {
    id: 'opener-rebid-6nt-after-nt-4nt-quantitative-invitation',
    kind: 'openerRebid',
    title: 'Accept a quantitative 4NT invitation with sufficient strength',
    auctionContext: { stage: 'openerRebid', openerStrain: 'NT' },
    calls: ['6NT'],
    callCategory: ['signoff', 'natural'],
    priority: { rank: 50 },
    appliesWhen: (call, context, system) =>
      openerNtQuantitativeInvitationApplies(call, context, system, true),
    meaning: 'Accept the quantitative invitation to a small slam.',
    guidance: ['Maximum 1NT openers normally accept; the middle HCP is a judgment case.',
               'After a 20-21 2NT opening, even 21 opposite 11-12 may provide only 32-33 ' +
               'combined HCP: treat 6NT as conditional on good trick-taking prospects.'],
    certainty: 'high',
  },
  //
  // Weak-preempt continuations.  The 2NT inquiry has explicit minimum/maximum messages; natural
  // forcing new-suit responses are answered economically with support or by returning to the
  // preempt suit.
  //
  {
    id: 'opener-rebid-repeat-after-weak-two-2nt-inquiry',
    kind: 'openerRebid',
    title: 'Repeat the weak-two suit after the forcing 2NT inquiry',
    auctionContext: { stage: 'openerRebid', openerCalls: ['2D', '2H', '2S'],
                      responderCall: { kind: 'notrump', level: 2 } },
    calls: ['3D', '3H', '3S'],
    callRefinement: (calls, context) => refineOpenerOpeningSuitToLevel(calls, context, 3),
    callCategory: ['natural'],
    appliesWhen: weakTwoRepeatAfterInquiryApplies, // 5-7 minimum or max with no feature/solid suit
    meaning: 'Minimum weak two; or a maximum without another modeled descriptive message.',
    guidance: ['A 5-7 minimum rebids the opening suit at the three level.',
               'For an 8-10 maximum, a side ace/king or solid-suit 3NT message takes precedence; ' +
                 'repeating the suit is the conservative fallback when neither applies.'],
    certainty: 'high',
  },
  {
    id: 'opener-rebid-feature-after-weak-two-2nt-inquiry',
    kind: 'openerRebid',
    title: 'Show a side ace or king with a maximum weak two',
    auctionContext: { stage: 'openerRebid', openerCalls: ['2D', '2H', '2S'],
                      responderCall: { kind: 'notrump', level: 2 } },
    calls: ['3C', '3D', '3H', '3S'],
    callRefinement: refineWeakTwoFeatureRebid, // choose the cheapest side A/K feature
    callCategory: ['conventional'],
    appliesWhen: weakTwoFeatureAfterInquiryApplies,
    meaning: 'An 8-10 HCP maximum with a side ace or king; the side-suit bid shows that feature.',
    certainty: 'high',
  },
  {
    id: 'opener-rebid-3nt-after-weak-two-2nt-inquiry',
    kind: 'openerRebid',
    title: 'Rebid 3NT with a maximum weak two and a solid suit',
    auctionContext: { stage: 'openerRebid', openerCalls: ['2D', '2H', '2S'],
                      responderCall: { kind: 'notrump', level: 2 } },
    calls: ['3NT'],
    callCategory: ['natural'],
    appliesWhen: weakTwoSolidThreeNtApplies, // AKQJ is the executable solid-suit approximation
    meaning: 'Maximum weak two with a solid opening suit suitable for notrump.',
    guidance: ['The app uses AKQJ in the six-card opening suit as its conservative executable ' +
               "approximation of the solid-suit requirement."],
    certainty: 'high',
  },
  {
    id: 'opener-rebid-raise-after-preempt-new-suit',
    kind: 'openerRebid',
    title: "Raise responder's forcing new suit after a preempt",
    auctionContext: { stage: 'openerRebid',
                      openerCalls: ['2D', '2H', '2S', '3C', '3D', '3H', '3S'],
                      responderCall: { kind: 'newSuit' } },
    calls: ['3H', '3S', '4C', '4D', '4H', '4S', '5C', '5D'],
    callRefinement: refineOpenerRaiseResponderSuitOneLevel, // economical raise with 3+ support
    callCategory: ['natural'],
    appliesWhen: openerPreemptNewSuitRaiseApplies,
    meaning: "Three-card-or-longer support for responder's forcing natural suit.",
    certainty: 'medium',
  },
  {
    id: 'opener-rebid-repeat-after-preempt-new-suit',
    kind: 'openerRebid',
    title: "Return to opener's preempt suit without support for responder",
    auctionContext: { stage: 'openerRebid',
                      openerCalls: ['2D', '2H', '2S', '3C', '3D', '3H', '3S'],
                      responderCall: { kind: 'newSuit' } },
    calls: ['3D', '3H', '3S', '4C', '4D', '4H', '4S'],
    callRefinement: refineOpenerOpeningSuitAtCheapestLevel, // satisfy the force with no 3-card fit
    callCategory: ['natural'],
    appliesWhen: openerPreemptNewSuitRepeatApplies,
    meaning: "No three-card fit for responder's forcing suit; return to the preempt suit economically.",
    certainty: 'medium',
  },
  //
  // A8: partner's natural and artificial continuations after an opposing jump preempt.
  // Keep this separate from ordinary suit overcalls: passing a nonforcing raise is sensible,
  // but a negative Double or forcing new suit requires a descriptive action or boundary.
  {
    id: 'opener-rebid-after-jump-overcall-nonforcing-pass',
    kind: 'openerRebid',
    title: 'Pass a minimum after responder competes over a jump overcall',
    auctionContext: { stage: 'openerRebid', openerLevel: 1, openerStrain: 'suit',
                      interference: 'jumpSuitOvercall', advancerCall: { kind: 'pass' } },
    calls: ['Pass'],
    appliesWhen: jumpOvercallOpenerContinuationApplies,
    callCategory: ['signoff'],
    priority: { rank: 30 },
    meaning: 'Pass a nonforcing three-level raise, natural 2NT invitation, or game signoff ' +
             'when opener lacks sufficient extras to bid again.',
    guidance: ['Do not pass a negative Double or a forcing new-suit response.'],
    certainty: 'high',
  },
  {
    id: 'opener-rebid-after-jump-overcall-major-game',
    kind: 'openerRebid',
    title: 'Bid major game after strong support or a forcing response to a jump overcall',
    auctionContext: { stage: 'openerRebid', openerLevel: 1, openerStrain: 'suit',
                      interference: 'jumpSuitOvercall', advancerCall: { kind: 'pass' } },
    calls: ['4H', '4S'],
    callRefinement: refineJumpOvercallOpenerAction,
    appliesWhen: jumpOvercallOpenerContinuationApplies,
    callCategory: ['natural'],
    priority: { rank: 40 },
    meaning: 'Show game-going major support when partner has identified a fit or forced game.',
    guidance: ['A support cuebid is artificial: return to opener\'s agreed major, not the opponent suit.'],
    certainty: 'medium',
  },
  {
    id: 'opener-rebid-after-jump-overcall-natural-suit',
    kind: 'openerRebid',
    title: 'Describe a fit, long opening suit, or economical second suit after jump interference',
    auctionContext: { stage: 'openerRebid', openerLevel: 1, openerStrain: 'suit',
                      interference: 'jumpSuitOvercall', advancerCall: { kind: 'pass' } },
    calls: ['2H', '2S', '3C', '3D', '3H', '3S', '4C', '4D'],
    callRefinement: refineJumpOvercallOpenerAction,
    appliesWhen: jumpOvercallOpenerContinuationApplies,
    callCategory: ['natural'],
    priority: { rank: 35 },
    meaning: 'Support a forcing suit, answer a negative Double, repeat a six-card opening ' +
             'suit, or describe an eligible second suit; selected minor support is conditional.',
    guidance: ['Choose the cheapest descriptive call; do not name the natural overcall suit. ' +
               'A reverse needs extra values.'],
    certainty: 'medium',
  },
  {
    id: 'opener-rebid-after-jump-overcall-natural-nt',
    kind: 'openerRebid',
    title: 'Describe a stopped balanced hand or accept the 2NT invitation',
    auctionContext: { stage: 'openerRebid', openerLevel: 1, openerStrain: 'suit',
                      interference: 'jumpSuitOvercall', advancerCall: { kind: 'pass' } },
    calls: ['2NT', '3NT'],
    callRefinement: refineJumpOvercallOpenerAction,
    appliesWhen: jumpOvercallOpenerContinuationApplies,
    callCategory: ['natural'],
    priority: { rank: 30 },
    meaning: 'Selected balanced natural notrump description or 3NT invitation acceptance.',
    guidance: ['After a natural forcing suit or negative Double, opener must have a stopper ' +
               'in the opposing preempt suit. Responder\'s natural 2NT already showed one.'],
    certainty: 'medium',
  },
  {
    id: 'opener-rebid-scope-boundary-after-jump-overcall',
    kind: 'scopeBoundary',
    title: 'Competitive judgment after responder acts over a jump preempt',
    auctionContext: { stage: 'openerRebid', openerLevel: 1, openerStrain: 'suit',
                      interference: 'jumpSuitOvercall', advancerCall: { kind: 'pass' } },
    scopeBoundaryWhen: jumpOvercallOpenerBoundaryApplies,
    meaning: 'Partner\'s response has a known natural or artificial meaning, but no ' +
             'selected reliable opener continuation applies to this shape and strength.',
    guidance: ['A negative Double or forcing new suit must not be passed just because ' +
               'our limited continuation rules cannot place the contract.',
               'With a minor fit, an uncertain stopper, or extra/slam-going strength, ' +
               'choosing a game or further competition can depend on playing tricks and controls.'],
    certainty: 'high',
  },
  //
  // Selected competitive opener rebids.  Natural responder meanings reuse explicitly opted-in
  // uncontested rules where competition has not changed the call; these declarations cover
  // artificial or level-sensitive competitive meanings that need their own opener treatment.
  //
  // Responder's negative Double is one coordinated opener-rebid family.  It asks opener first
  // to look for a four-card fit in the suit or suits the Double implied; if no such fit exists,
  // opener can still describe a six-card opening suit or the ordinary balanced NT ranges.  With
  // advancer Pass, minimum/medium hands keep the economical/jump ladder and a maximum major fit
  // reaches game.  Once advancer acts, a still-cheap implied-suit fit remains descriptive, but
  // competition must not promote a vanished three-level call into an automatic game.
  //
  // If advancer intervenes and a minimum opener has no selected descriptive call, Pass is real:
  // responder still has another turn.  Extra-value hands without a deterministic route reach a
  // hand-specific scope boundary instead of manufacturing a bid.  Strong support cuebids,
  // natural NT, side suits, preemptive raises, and strength Redouble are admitted here only
  // because the advancing rules already assign those calls explicit meanings.
  {
    id: 'opener-rebid-implied-suit-after-negative-double-minimum',
    kind: 'openerRebid',
    title: 'Bid an implied suit economically after a negative Double',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'suit',
      interference: 'suitOvercall', responderCall: { kind: 'double' },
      advancerCall: { kind: 'pass' },
    },
    calls: ['1H', '1S', '2C', '2D', '2H', '2S', '3C', '3D', '3H', '3S'],
    callRefinement: (calls: Call[], context: RuleEvalContext): CallRefinementResult =>
      refineOpenerNegativeDoubleImpliedSuitRebid(calls, context, 'minimum'),
    callCategory: ['natural'],
    appliesWhen: { totalPoints: { min: 12, max: 16, valuation: 'shortage' } },
    meaning: 'Show a four-card or longer fit in a suit implied by responder’s negative Double.',
    guidance: ['Prefer the longer implied fit.  Equal four-card majors use the existing up-line ' +
               'major ordering; equal implied minors are presented up the line.'],
    certainty: 'high',
  },
  {
    id: 'opener-rebid-jump-implied-suit-after-negative-double-medium',
    kind: 'openerRebid',
    title: 'Jump in an implied suit after a negative Double with medium values',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'suit',
      interference: 'suitOvercall', responderCall: { kind: 'double' },
      advancerCall: { kind: 'pass' },
    },
    calls: ['2H', '2S', '3C', '3D', '3H', '3S', '4H', '4S'],
    callRefinement: (calls: Call[], context: RuleEvalContext): CallRefinementResult =>
      refineOpenerNegativeDoubleImpliedSuitRebid(calls, context, 'medium'),
    callCategory: ['invitational', 'natural'],
    appliesWhen: { totalPoints: { min: 17, max: 18, valuation: 'shortage' } },
    meaning: 'Jump one level in a four-card or longer suit implied by the negative Double.',
    certainty: 'high',
  },
  {
    id: 'opener-rebid-game-major-after-negative-double-maximum',
    kind: 'openerRebid',
    title: 'Bid game in an implied major after a negative Double with maximum values',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'suit',
      interference: 'suitOvercall', responderCall: { kind: 'double' },
      advancerCall: {
        kind: ['pass', 'raise', 'preemptiveRaise', 'newSuit', 'notrump', 'cuebid', 'redouble'],
      },
    },
    calls: ['4H', '4S'],
    callRefinement: (calls: Call[], context: RuleEvalContext): CallRefinementResult =>
      refineOpenerNegativeDoubleImpliedSuitRebid(calls, context, 'maximum'),
    callCategory: ['signoff', 'natural'],
    appliesWhen: { totalPoints: { min: 19, valuation: 'shortage' } },
    meaning: 'Bid game with maximum values and a four-card or longer implied major.',
    certainty: 'high',
  },
  {
    id: 'opener-rebid-jump-implied-minor-after-negative-double-maximum',
    kind: 'openerRebid',
    title: 'Jump in an implied minor with maximum values and advancer passing',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'suit',
      interference: 'suitOvercall', responderCall: { kind: 'double' },
      advancerCall: { kind: 'pass' },
    },
    calls: ['3C', '3D'],
    callRefinement: (calls: Call[], context: RuleEvalContext): CallRefinementResult =>
      refineOpenerNegativeDoubleImpliedSuitRebid(calls, context, 'maximum'),
    callCategory: ['forcing', 'natural'],
    appliesWhen: { totalPoints: { min: 19, valuation: 'shortage' } },
    meaning: 'Show the strong implied-minor fit below the four level without assuming minor game.',
    guidance: ['Five of a minor is not automatic merely because opener has maximum values.'],
    certainty: 'high',
  },
  {
    id: 'opener-rebid-implied-suit-after-negative-double-competition-minimum',
    kind: 'openerRebid',
    title: 'Describe an implied-suit fit after advancer acts with a minimum',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'suit',
      interference: 'suitOvercall', responderCall: { kind: 'double' },
      advancerCall: {
        kind: ['raise', 'preemptiveRaise', 'newSuit', 'notrump', 'cuebid', 'redouble'],
      },
    },
    calls: ['1H', '1S', '2C', '2D', '2H', '2S', '3C', '3D', '3H', '3S'],
    callRefinement: (calls: Call[], context: RuleEvalContext): CallRefinementResult =>
      refineOpenerNegativeDoubleImpliedSuitRebid(calls, context, 'minimum'),
    callCategory: ['natural'],
    appliesWhen: { totalPoints: { min: 12, max: 16, valuation: 'shortage' } },
    meaning: 'Keep describing a known implied-suit fit when competition leaves a cheap call.',
    guidance: ['The trainer does not turn a consumed three-level fit bid into an automatic game.'],
    certainty: 'high',
  },
  {
    id: 'opener-rebid-implied-suit-after-negative-double-competition-medium',
    kind: 'openerRebid',
    title: 'Keep competing in an implied suit with medium values',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'suit',
      interference: 'suitOvercall', responderCall: { kind: 'double' },
      advancerCall: {
        kind: ['raise', 'preemptiveRaise', 'newSuit', 'notrump', 'cuebid', 'redouble'],
      },
    },
    calls: ['1H', '1S', '2C', '2D', '2H', '2S', '3C', '3D', '3H', '3S'],
    callRefinement: (calls: Call[], context: RuleEvalContext): CallRefinementResult =>
      refineOpenerNegativeDoubleImpliedSuitRebid(calls, context, 'medium'),
    callCategory: ['natural'],
    appliesWhen: { totalPoints: { min: 17, max: 18, valuation: 'shortage' } },
    meaning: 'Medium opener uses the cheapest still-descriptive implied-suit fit through level three.',
    guidance: ['Advancer’s action consumes the old jump step; it does not force opener one level ' +
               'higher merely to preserve the uncontested strength ladder.'],
    certainty: 'high',
  },
  {
    id: 'opener-rebid-repeat-opening-suit-after-negative-double',
    kind: 'openerRebid',
    title: 'Repeat a six-card opening suit after a negative Double',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'suit',
      interference: 'suitOvercall', responderCall: { kind: 'double' },
      advancerCall: {
        kind: ['pass', 'raise', 'preemptiveRaise', 'newSuit', 'notrump', 'cuebid', 'redouble'],
      },
    },
    calls: ['2C', '2D', '2H', '2S', '3C', '3D', '3H', '3S'],
    callRefinement: refineOpenerNegativeDoubleOpeningSuitRebid,
    callCategory: ['natural'],
    appliesWhen: { totalPoints: { min: 12, max: 18 } },
    meaning: 'Without an implied-suit fit, repeat a six-card opening suit while it stays below game.',
    certainty: 'high',
  },
  {
    id: 'opener-rebid-natural-nt-after-negative-double',
    kind: 'openerRebid',
    title: 'Rebid natural notrump after a negative Double',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'suit',
      interference: 'suitOvercall', responderCall: { kind: 'double' },
      advancerCall: {
        kind: ['pass', 'raise', 'preemptiveRaise', 'newSuit', 'notrump', 'cuebid', 'redouble'],
      },
    },
    calls: ['1NT', '2NT'],
    callCategory: ['natural'],
    appliesWhen: openerNegativeDoubleNtApplies,
    meaning: 'Use the ordinary balanced 12-14 or 18-19 HCP NT rebid when that exact level remains.',
    guidance: ['Opener must stop every suit the opponents have bid naturally.  Do not promote an ' +
               'unavailable NT level merely because competition consumed it.'],
    certainty: 'high',
  },
  {
    id: 'opener-rebid-pass-after-negative-double-competition-minimum',
    kind: 'openerRebid',
    title: 'Pass with a minimum after advancer acts when no clear description remains',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'suit',
      interference: 'suitOvercall', responderCall: { kind: 'double' },
      advancerCall: {
        kind: ['raise', 'preemptiveRaise', 'newSuit', 'notrump', 'cuebid', 'redouble'],
      },
    },
    calls: ['Pass'],
    callCategory: ['natural'],
    appliesWhen: openerNegativeDoubleCompetitionPassApplies,
    meaning: 'Advancer’s intervention removes the obligation to manufacture a rebid with a minimum.',
    guidance: ['Responder still has another turn; this Pass does not convert the negative Double ' +
               'into a penalty Double.'],
    certainty: 'high',
  },
  {
    id: 'opener-rebid-scope-boundary-after-negative-double-advancer-pass',
    kind: 'scopeBoundary',
    title: 'Descriptive judgment after a negative Double when advancer passes',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'suit',
      interference: 'suitOvercall', responderCall: { kind: 'double' },
      advancerCall: { kind: 'pass' },
    },
    scopeBoundaryWhen: openerNegativeDoubleScopeBoundaryApplies,
    meaning: 'Responder’s negative Double requires action, but no selected deterministic ' +
             'description fits opener’s hand.',
    guidance: [
      'Responder has shown the modeled unbid-suit pattern and enough strength for this negative ' +
      'Double.  With advancer passing, opener must continue rather than treat the Double as penalty.',
      'The trainer has no selected deterministic route when opener lacks a modeled implied-suit ' +
      'fit, six-card repeat, natural NT rebid, or clear major game.  A cuebid or another strong ' +
      'description may be appropriate, but choosing among those actions depends on hand texture ' +
      'and partnership judgment beyond this treatment.',
    ],
    certainty: 'high',
  },
  {
    id: 'opener-rebid-scope-boundary-after-negative-double-advancer-action',
    kind: 'scopeBoundary',
    title: 'Competitive judgment after a negative Double and further advancer action',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'suit',
      interference: 'suitOvercall', responderCall: { kind: 'double' },
      advancerCall: {
        kind: ['raise', 'preemptiveRaise', 'newSuit', 'notrump', 'cuebid', 'redouble'],
      },
    },
    scopeBoundaryWhen: openerNegativeDoubleScopeBoundaryApplies,
    meaning: 'The negative Double is understood, but further competition leaves no deterministic ' +
             'selected opener action.',
    guidance: [
      'Responder has shown the modeled unbid-suit pattern and enough strength for the negative ' +
      'Double.  Advancer has now supplied additional competitive information or consumed bidding ' +
      'space.',
      'Pass may be right, and bidding on may also be right.  The trainer has already tried the ' +
      'clear implied-suit fit, six-card opening-suit, natural NT, and major-game routes; the ' +
      'remaining choice depends on playing strength, fit quality, honor location, vulnerability, ' +
      'and the level of the opponents’ action.',
    ],
    certainty: 'high',
  },
  // A strength-showing Redouble does not force opener to choose a new strain.  With advancer
  // passing, opener can wait and leave the Redouble in force; the doubler still has another turn.
  {
    id: 'opener-rebid-pass-after-takeout-redouble',
    kind: 'openerRebid',
    title: 'Pass after responder’s strength-showing Redouble when advancer passes',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'suit',
      interference: 'takeoutDouble', responderCall: { kind: 'redouble' },
      advancerCall: { kind: 'pass' },
    },
    calls: ['Pass'],
    meaning: 'Wait after responder shows strength with Redouble; opener need not make a new bid.',
    guidance: [
      'This is not a final signoff or a penalty-double system; the original doubler still has a ' +
      'turn.',
    ],
    certainty: 'high',
  },
  //
  // A natural two-level new-suit response after a suit overcall is forcing one round but is not
  // automatically game forcing, regardless of the partnership's uncontested 2/1 setting.  This
  // selected opener family therefore mirrors the useful Standard descriptive branches without
  // inheriting the 2/1 game-force meaning: support responder, repeat a long opening suit, show a
  // natural second suit, or rebid notrump with the shared stopper requirement.  Medium/maximum
  // support hands can jump or bid game; other strong distributions remain separate decisions.
  {
    id: 'opener-rebid-raise-after-overcall-two-level-new-suit-minimum',
    kind: 'openerRebid',
    title: "Raise responder's forcing two-level suit with minimum values",
    auctionContext: {
      stage: 'openerRebid', openerRebidAfterInterference: true, openerLevel: 1,
      openerStrain: 'suit', interference: 'suitOvercall',
      responderCall: { kind: 'newSuit', level: 2, opponentSuit: false },
    },
    calls: ['3C', '3D', '3H', '3S'],
    callRefinement: (calls: Call[], context: RuleEvalContext): CallRefinementResult =>
      refineOpenerRaiseResponderSuitToLevel(calls, context, 3, 3),
    callCategory: ['natural'],
    appliesWhen: { totalPoints: { min: 12, max: 16, valuation: 'shortage' },
                   supportLength: { min: 3 } },
    meaning: "Minimum opener confirms support for responder's five-card-or-longer forcing suit.",
    certainty: 'high',
  },
  {
    id: 'opener-rebid-repeat-after-overcall-two-level-new-suit-minimum',
    kind: 'openerRebid',
    title: 'Repeat a six-card opening suit after a forcing two-level response',
    auctionContext: {
      stage: 'openerRebid', openerRebidAfterInterference: true, openerLevel: 1,
      openerStrain: 'suit', interference: 'suitOvercall',
      responderCall: { kind: 'newSuit', level: 2, opponentSuit: false },
    },
    calls: ['2C', '2D', '2H', '2S', '3C', '3D', '3H', '3S'],
    callRefinement: refineOpenerOpeningSuitAtCheapestLevel,
    callCategory: ['natural'],
    appliesWhen: { totalPoints: { min: 12, max: 16 }, suitLengths: [{ min: 6 }] },
    meaning: 'Minimum opener repeats a six-card or longer opening suit economically.',
    certainty: 'high',
  },
  {
    id: 'opener-rebid-second-suit-after-overcall-two-level-new-suit',
    kind: 'openerRebid',
    title: 'Show an economical second suit after a forcing competitive response',
    auctionContext: {
      stage: 'openerRebid', openerRebidAfterInterference: true, openerLevel: 1,
      openerStrain: 'suit', interference: 'suitOvercall',
      responderCall: { kind: 'newSuit', level: 2, opponentSuit: false },
    },
    calls: ['2C', '2D', '2H', '2S', '3C', '3D', '3H', '3S'],
    callRefinement: refineOpenerNonReverseNewSuitRebid,
    callCategory: ['natural'],
    appliesWhen: { totalPoints: { min: 12, max: 18 }, suitLengths: [{ min: 4 }] },
    meaning: 'Show a natural four-card or longer second suit without promising reverse strength.',
    certainty: 'high',
  },
  {
    id: 'opener-rebid-reverse-after-overcall-two-level-new-suit',
    kind: 'openerRebid',
    title: 'Reverse into a second suit after a forcing competitive response',
    auctionContext: {
      stage: 'openerRebid', openerRebidAfterInterference: true, openerLevel: 1,
      openerStrain: 'suit', interference: 'suitOvercall',
      responderCall: { kind: 'newSuit', level: 2, opponentSuit: false },
    },
    calls: ['2H', '2S', '3C', '3D', '3H', '3S'],
    callRefinement: refineOpenerReverseRebid,
    callCategory: ['forcing', 'natural'],
    appliesWhen: { totalPoints: { min: 17, max: 21 }, suitLengths: [{ min: 4 }] },
    meaning: 'Show a natural second suit with the extra strength required for a reverse.',
    certainty: 'high',
  },
  {
    id: 'opener-rebid-2nt-after-overcall-two-level-new-suit',
    kind: 'openerRebid',
    title: 'Rebid 2NT with a minimum balanced hand and an overcall stopper',
    auctionContext: {
      stage: 'openerRebid', openerRebidAfterInterference: true, openerLevel: 1,
      openerStrain: 'suit', interference: 'suitOvercall',
      responderCall: { kind: 'newSuit', level: 2, opponentSuit: false },
    },
    calls: ['2NT'],
    callCategory: ['natural'],
    appliesWhen: { hcp: { min: 12, max: 14 }, shape: { balanced: true } },
    meaning: 'Natural minimum balanced rebid; the shared competitive filter requires a stopper.',
    certainty: 'high',
  },
  {
    id: 'opener-rebid-jump-raise-after-overcall-two-level-new-suit',
    kind: 'openerRebid',
    title: "Jump raise responder's forcing suit with medium values",
    auctionContext: {
      stage: 'openerRebid', openerRebidAfterInterference: true, openerLevel: 1,
      openerStrain: 'suit', interference: 'suitOvercall',
      responderCall: { kind: 'newSuit', level: 2, opponentSuit: false },
    },
    calls: ['4C', '4D', '4H', '4S'],
    callRefinement: (calls: Call[], context: RuleEvalContext): CallRefinementResult =>
      refineOpenerRaiseResponderSuitToLevel(calls, context, 4, 3),
    callCategory: ['invitational', 'natural'],
    appliesWhen: { totalPoints: { min: 17, max: 18, valuation: 'shortage' },
                   supportLength: { min: 3 } },
    meaning: "Show medium values and support for responder's five-card-or-longer suit.",
    certainty: 'high',
  },
  {
    id: 'opener-rebid-3nt-after-overcall-two-level-new-suit',
    kind: 'openerRebid',
    title: 'Rebid 3NT with 18-19 balanced and an overcall stopper',
    auctionContext: {
      stage: 'openerRebid', openerRebidAfterInterference: true, openerLevel: 1,
      openerStrain: 'suit', interference: 'suitOvercall',
      responderCall: { kind: 'newSuit', level: 2, opponentSuit: false },
    },
    calls: ['3NT'],
    callCategory: ['signoff', 'natural'],
    appliesWhen: { hcp: { min: 18, max: 19 }, shape: { balanced: true } },
    meaning: 'Natural strong balanced rebid; the shared competitive filter requires a stopper.',
    certainty: 'high',
  },
  {
    id: 'opener-rebid-game-raise-after-overcall-two-level-new-suit',
    kind: 'openerRebid',
    title: "Raise responder's forcing suit to game with maximum values",
    auctionContext: {
      stage: 'openerRebid', openerRebidAfterInterference: true, openerLevel: 1,
      openerStrain: 'suit', interference: 'suitOvercall',
      responderCall: { kind: 'newSuit', level: 2, opponentSuit: false },
    },
    calls: ['4H', '4S', '5C', '5D'],
    callRefinement: (calls: Call[], context: RuleEvalContext, system: BiddingSystem):
        CallRefinementResult => refineOpenerResponderSuitToGame(calls, context, system, 3),
    callCategory: ['signoff', 'natural'],
    appliesWhen: { totalPoints: { min: 19, max: 21, valuation: 'shortage' },
                   supportLength: { min: 3 } },
    meaning: "Bid game with maximum values and support for responder's natural suit.",
    certainty: 'high',
  },
  //
  // After responder makes a natural forcing suit bid and advancer then competes naturally, opener
  // does not mechanically preserve the old uncontested ladder.  Keep only calls whose descriptive
  // meaning remains clear at the new level: support below game, a six-card opening suit below game,
  // an unchanged economical second suit or reverse, natural balanced NT with all opponent suits
  // stopped, or a clear maximum game raise.  With no such action, a minimum may genuinely Pass;
  // extra-value hands stop at family-specific scope guidance rather than receiving a fabricated bid.
  {
    id: 'opener-rebid-support-after-forcing-response-advancer-competition',
    kind: 'openerRebid',
    title: "Support responder's forcing suit after advancer competes",
    auctionContext: {
      stage: 'openerRebid', openerRebidAfterInterference: true, openerLevel: 1,
      openerStrain: 'suit', responderCall: { kind: 'newSuit', opponentSuit: false },
      advancerCall: { kind: ['raise', 'preemptiveRaise', 'newSuit'] },
    },
    calls: ['2C', '2D', '2H', '2S', '3C', '3D', '3H', '3S'],
    callRefinement: refineOpenerForcingResponseCompetitionSupport,
    callCategory: ['natural'],
    appliesWhen: { totalPoints: { min: 12, max: 18, valuation: 'shortage' } },
    meaning: 'Raise responder naturally when competition still leaves a below-game support bid.',
    guidance: ['A two-level forcing response after a suit overcall promises five or more cards, ' +
               'so three-card opener support is enough there; the one-level forcing families use ' +
               'their normal four-card support threshold.'],
    certainty: 'high',
  },
  {
    id: 'opener-rebid-repeat-after-forcing-response-advancer-competition',
    kind: 'openerRebid',
    title: 'Repeat a six-card opening suit after advancer competes',
    auctionContext: {
      stage: 'openerRebid', openerRebidAfterInterference: true, openerLevel: 1,
      openerStrain: 'suit', responderCall: { kind: 'newSuit', opponentSuit: false },
      advancerCall: { kind: ['raise', 'preemptiveRaise', 'newSuit'] },
    },
    calls: ['2C', '2D', '2H', '2S', '3C', '3D', '3H', '3S'],
    callRefinement: refineOpenerForcingResponseCompetitionRepeat,
    callCategory: ['natural'],
    appliesWhen: { totalPoints: { min: 12, max: 18 }, suitLengths: [{ min: 6 }] },
    meaning: 'Describe a six-card or longer opening suit at the cheapest level competition leaves.',
    guidance: ['The trainer keeps this descriptive continuation only through the three level; it ' +
               'does not promote a blocked partscore rebid into game by formula.'],
    certainty: 'high',
  },
  {
    id: 'opener-rebid-second-suit-after-forcing-response-advancer-competition',
    kind: 'openerRebid',
    title: 'Show an economical second suit that remains available after competition',
    auctionContext: {
      stage: 'openerRebid', openerRebidAfterInterference: true, openerLevel: 1,
      openerStrain: 'suit', responderCall: { kind: 'newSuit', opponentSuit: false },
      advancerCall: { kind: ['raise', 'preemptiveRaise', 'newSuit'] },
    },
    calls: ['1D', '1H', '1S', '2C', '2D', '2H', '2S', '3C', '3D', '3H', '3S'],
    callRefinement: refineOpenerNonReverseNewSuitRebid,
    callCategory: ['natural'],
    appliesWhen: { totalPoints: { min: 12, max: 18 }, suitLengths: [{ min: 4 }] },
    meaning: 'Keep an ordinary non-reverse second-suit description only if advancer has not ' +
             'consumed that exact call.',
    certainty: 'high',
  },
  {
    id: 'opener-rebid-reverse-after-forcing-response-advancer-competition',
    kind: 'openerRebid',
    title: 'Keep a strength-qualified reverse that remains available after competition',
    auctionContext: {
      stage: 'openerRebid', openerRebidAfterInterference: true, openerLevel: 1,
      openerStrain: 'suit', responderCall: { kind: 'newSuit', opponentSuit: false },
      advancerCall: { kind: ['raise', 'preemptiveRaise', 'newSuit'] },
    },
    calls: ['2D', '2H', '2S', '3C', '3D', '3H', '3S'],
    callRefinement: refineOpenerReverseRebid,
    callCategory: ['forcing', 'natural'],
    appliesWhen: (call: Call, context: RuleEvalContext): AppliesWhenResult =>
      openerSecondSuitApplies(call, context, 17, 21, 'competitive reverse'),
    meaning: 'A natural reverse keeps its extra-strength meaning when the same call remains legal.',
    guidance: ['Do not move the reverse one level higher merely because advancer consumed the ' +
               'original descriptive call.'],
    certainty: 'high',
  },
  {
    id: 'opener-rebid-nt-after-forcing-response-advancer-competition',
    kind: 'openerRebid',
    title: 'Retain a natural balanced notrump rebid after advancer competes',
    auctionContext: {
      stage: 'openerRebid', openerRebidAfterInterference: true, openerLevel: 1,
      openerStrain: 'suit', responderCall: { kind: 'newSuit', opponentSuit: false },
      advancerCall: { kind: ['raise', 'preemptiveRaise', 'newSuit'] },
    },
    calls: ['1NT', '2NT', '3NT'],
    callCategory: ['natural'],
    appliesWhen: openerForcingResponseCompetitionNtApplies,
    meaning: 'Use the normal balanced HCP range only when its original notrump level is still ' +
             'available after competition.',
    guidance: ['The shared competitive filter additionally requires a basic stopper in every suit ' +
               'the opponents have bid naturally.'],
    certainty: 'high',
  },
  {
    id: 'opener-rebid-game-raise-after-forcing-response-advancer-competition',
    kind: 'openerRebid',
    title: "Bid game with maximum values and support for responder's forcing suit",
    auctionContext: {
      stage: 'openerRebid', openerRebidAfterInterference: true, openerLevel: 1,
      openerStrain: 'suit', responderCall: { kind: 'newSuit', opponentSuit: false },
      advancerCall: { kind: ['raise', 'preemptiveRaise', 'newSuit'] },
    },
    calls: ['4H', '4S', '5C', '5D'],
    callRefinement: refineOpenerForcingResponseCompetitionGameRaise,
    callCategory: ['signoff', 'natural'],
    appliesWhen: { totalPoints: { min: 19, max: 21, valuation: 'shortage' } },
    meaning: "Maximum opener can still place responder's supported natural suit in game.",
    certainty: 'high',
  },
  {
    id: 'opener-rebid-pass-after-forcing-response-advancer-competition-minimum',
    kind: 'openerRebid',
    title: 'Pass with a minimum when competition removes the clear descriptive rebids',
    auctionContext: {
      stage: 'openerRebid', openerRebidAfterInterference: true, openerLevel: 1,
      openerStrain: 'suit', responderCall: { kind: 'newSuit', opponentSuit: false },
      advancerCall: { kind: ['raise', 'preemptiveRaise', 'newSuit'] },
    },
    calls: ['Pass'],
    callCategory: ['natural'],
    appliesWhen: openerForcingResponseCompetitionPassApplies,
    meaning: 'The intervening call removes the obligation to manufacture a rebid when a minimum ' +
             'opener has no selected natural continuation.',
    guidance: ['Responder still has another turn.  This Pass does not change the strength or ' +
               'forcing meaning responder showed before advancer acted.'],
    certainty: 'high',
  },
  // These three boundaries share the same hand test but keep family-specific guidance so the user
  // sees exactly what responder promised before the auction became judgment-heavy.
  {
    id: 'opener-rebid-scope-boundary-after-overcall-one-level-forcing-response',
    kind: 'scopeBoundary',
    title: 'Competitive judgment after a one-level forcing response and further competition',
    auctionContext: {
      stage: 'openerRebid', openerRebidAfterInterference: true, openerLevel: 1,
      openerStrain: 'suit', interference: 'suitOvercall',
      responderCall: { kind: 'newSuit', level: 1, opponentSuit: false },
      advancerCall: { kind: ['raise', 'preemptiveRaise', 'newSuit'] },
    },
    scopeBoundaryWhen: openerForcingResponseCompetitionScopeBoundaryApplies,
    meaning: 'Opener has extra values, but competition has removed the selected deterministic ' +
             'descriptive route.',
    guidance: [
      'Responder has shown a natural suit with at least 6 HCP; it is normally five cards, with ' +
      'the existing minor-opening/1D-overcall exception where a four-card major can qualify.  ' +
      'Without advancer intervening, this response would force opener for one round.',
      'Pass may be right, and bidding on may also be right.  The decision depends on playing ' +
      'strength, fit, honor location, vulnerability, and how high the opponents have pushed the ' +
      'auction.  The trainer stops rather than assign false precision to that judgment.',
    ],
    certainty: 'high',
  },
  {
    id: 'opener-rebid-scope-boundary-after-overcall-two-level-forcing-response',
    kind: 'scopeBoundary',
    title: 'Competitive judgment after a two-level forcing response and further competition',
    auctionContext: {
      stage: 'openerRebid', openerRebidAfterInterference: true, openerLevel: 1,
      openerStrain: 'suit', interference: 'suitOvercall',
      responderCall: { kind: 'newSuit', level: 2, opponentSuit: false },
      advancerCall: { kind: ['raise', 'preemptiveRaise', 'newSuit'] },
    },
    scopeBoundaryWhen: openerForcingResponseCompetitionScopeBoundaryApplies,
    meaning: 'Opener has extra values, but competition has removed the selected deterministic ' +
             'descriptive route.',
    guidance: [
      'Responder has shown a five-card-or-longer natural suit with at least 10 HCP; without ' +
      'advancer intervening, this response would force opener for one round.  Its strength ' +
      'meaning is independent of the partnership\'s uncontested 2/1 setting.',
      'Pass may be right, and bidding on may also be right.  The decision depends on playing ' +
      'strength, fit, honor location, vulnerability, and how high the opponents have pushed the ' +
      'auction.  The trainer stops rather than assign false precision to that judgment.',
    ],
    certainty: 'high',
  },
  {
    id: 'opener-rebid-scope-boundary-after-double-one-level-forcing-response',
    kind: 'scopeBoundary',
    title: 'Competitive judgment after a forcing response to a takeout Double',
    auctionContext: {
      stage: 'openerRebid', openerRebidAfterInterference: true, openerLevel: 1,
      openerStrain: 'suit', interference: 'takeoutDouble',
      responderCall: { kind: 'newSuit', level: 1, opponentSuit: false },
      advancerCall: { kind: 'newSuit' },
    },
    scopeBoundaryWhen: openerForcingResponseCompetitionScopeBoundaryApplies,
    meaning: 'Opener has extra values, but competition has removed the selected deterministic ' +
             'descriptive route.',
    guidance: [
      'Responder has shown a natural four-card-or-longer suit with at least 6 HCP; without ' +
      'advancer intervening, this response would force opener for one round after the takeout ' +
      'Double.',
      'Pass may be right, and bidding on may also be right.  The decision depends on playing ' +
      'strength, fit, honor location, vulnerability, and how high the opponents have pushed the ' +
      'auction.  The trainer stops rather than assign false precision to that judgment.',
    ],
    certainty: 'high',
  },
  //
  // A support cuebid and Jordan 2NT are both artificial limit-or-better raises.  The forcing
  // responder can continue over opener's minimum rebid, so opener need only distinguish a clear
  // minimum from values that guarantee game opposite the treatment's minimum support strength.
  // For minor fits this selected family stops after the minimum 3m description; choosing 3NT or
  // five of the minor with extra values remains more judgment-dependent.
  {
    id: 'opener-rebid-three-of-suit-after-support-cuebid-minimum',
    kind: 'openerRebid',
    title: 'Show a minimum after responder cuebids with support',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'suit',
      interference: 'suitOvercall', responderCall: { kind: 'newSuit', opponentSuit: true },
    },
    calls: ['3C', '3D', '3H', '3S'],
    callRefinement: (calls: Call[], context: RuleEvalContext): CallRefinementResult =>
      refineOpenerOpeningSuitToLevel(calls, context, 3),
    callCategory: ['natural'],
    appliesWhen: { totalPoints: { min: 12, max: 13, valuation: 'shortage' } },
    meaning: 'Minimum opener rebids the agreed suit; responder can continue with stronger values.',
    certainty: 'high',
  },
  {
    id: 'opener-rebid-game-major-after-support-cuebid',
    kind: 'openerRebid',
    title: 'Bid major-suit game with enough values opposite the support cuebid',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'major',
      interference: 'suitOvercall', responderCall: { kind: 'newSuit', opponentSuit: true },
    },
    calls: ['4H', '4S'],
    callRefinement: (calls: Call[], context: RuleEvalContext): CallRefinementResult =>
      refineOpenerOpeningSuitToLevel(calls, context, 4),
    callCategory: ['signoff', 'natural'],
    appliesWhen: { totalPoints: { min: 14, valuation: 'shortage' } },
    meaning: 'Responder promised 11+ support points, so 14+ opener points reach game values.',
    certainty: 'high',
  },
  {
    id: 'opener-rebid-three-of-suit-after-jordan-2nt-minimum',
    kind: 'openerRebid',
    title: 'Show a minimum after Jordan 2NT',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'suit',
      interference: 'takeoutDouble', responderCall: { kind: 'notrump', level: 2 },
    },
    calls: ['3C', '3D', '3H', '3S'],
    callRefinement: (calls: Call[], context: RuleEvalContext): CallRefinementResult =>
      refineOpenerOpeningSuitToLevel(calls, context, 3),
    callCategory: ['natural'],
    appliesWhen: { totalPoints: { min: 12, max: 14, valuation: 'shortage' } },
    meaning: 'Minimum opener rebids the agreed suit; responder can continue with stronger values.',
    certainty: 'high',
  },
  {
    id: 'opener-rebid-game-major-after-jordan-2nt',
    kind: 'openerRebid',
    title: 'Bid major-suit game with enough values opposite Jordan 2NT',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'major',
      interference: 'takeoutDouble', responderCall: { kind: 'notrump', level: 2 },
    },
    calls: ['4H', '4S'],
    callRefinement: (calls: Call[], context: RuleEvalContext): CallRefinementResult =>
      refineOpenerOpeningSuitToLevel(calls, context, 4),
    callCategory: ['signoff', 'natural'],
    appliesWhen: { totalPoints: { min: 15, valuation: 'shortage' } },
    meaning: 'Jordan promises 10+ support points, so 15+ opener points reach game values.',
    certainty: 'high',
  },
  //
  // Natural notrump responses after a suit overcall keep their stated balanced/stopped meaning;
  // they are not forcing 1NT, Jacoby 2NT, or another uncontested convention.  This selected
  // continuation keeps the clearest partscore/game decisions and stops explicitly when extra
  // shape or slam interest makes the next action judgment-heavy.
  {
    id: 'opener-rebid-pass-after-overcall-natural-1nt-minimum',
    kind: 'openerRebid',
    title: 'Pass responder\'s natural 1NT after an overcall with a minimum',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'suit',
      interference: 'suitOvercall', responderCall: { kind: 'notrump', level: 1 },
    },
    calls: ['Pass'],
    callCategory: ['signoff'],
    appliesWhen: { hcp: { min: 12, max: 14 }, shape: { balancedOrSemiBalanced: true } },
    meaning: 'Responder showed 6-10 HCP, balanced shape, and a stopper; a minimum opener may stop.',
    certainty: 'high',
  },
  {
    id: 'opener-rebid-repeat-suit-after-overcall-natural-1nt',
    kind: 'openerRebid',
    title: 'Repeat a six-card opening suit after responder\'s natural 1NT',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'suit',
      interference: 'suitOvercall', responderCall: { kind: 'notrump', level: 1 },
    },
    calls: ['2C', '2D', '2H', '2S'],
    callRefinement: (calls: Call[], context: RuleEvalContext): CallRefinementResult =>
      refineOpenerOpeningSuitToLevel(calls, context, 2),
    callCategory: ['natural'],
    appliesWhen: { totalPoints: { min: 12, max: 16 }, suitLengths: [{ min: 6 }] },
    meaning: 'Show a six-card or longer opening suit rather than play 1NT with a shapely minimum.',
    certainty: 'high',
  },
  {
    id: 'opener-rebid-2nt-after-overcall-natural-1nt',
    kind: 'openerRebid',
    title: 'Invite with 2NT after responder\'s natural 1NT over an overcall',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'suit',
      interference: 'suitOvercall', responderCall: { kind: 'notrump', level: 1 },
    },
    calls: ['2NT'],
    callCategory: ['invitational', 'natural'],
    appliesWhen: { hcp: { min: 18, max: 19 }, shape: { balancedOrSemiBalanced: true } },
    meaning: 'Natural 18-19 HCP invitation opposite responder\'s 6-10 HCP natural 1NT.',
    certainty: 'high',
  },
  {
    id: 'opener-rebid-3nt-after-overcall-natural-1nt',
    kind: 'openerRebid',
    title: 'Bid game with a 20-21 HCP semi-balanced opener after natural 1NT',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'suit',
      interference: 'suitOvercall', responderCall: { kind: 'notrump', level: 1 },
    },
    calls: ['3NT'],
    callCategory: ['signoff', 'natural'],
    appliesWhen: { hcp: { min: 20, max: 21 },
                   shape: { balanced: false, balancedOrSemiBalanced: true } },
    meaning: 'Responder\'s minimum still supplies game values opposite a 20-21 HCP semi-balanced hand.',
    certainty: 'high',
  },
  {
    id: 'opener-rebid-scope-boundary-after-overcall-natural-1nt',
    kind: 'scopeBoundary',
    title: 'Shape judgment after responder\'s natural 1NT over an overcall',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'suit',
      interference: 'suitOvercall', responderCall: { kind: 'notrump', level: 1 },
    },
    meaning: 'Responder has described a balanced 6-10 HCP hand with a stopper, but opener has no ' +
             'selected deterministic continuation in this treatment.',
    guidance: [
      'A second suit, another opening-suit rebid, or a notrump continuation may be right depending ' +
      'on opener\'s exact shape and playing strength.  The trainer stops rather than force the ' +
      'uncontested 1NT-response structure onto this competitive auction.',
    ],
    certainty: 'high',
  },
  {
    id: 'opener-rebid-pass-after-overcall-natural-2nt',
    kind: 'openerRebid',
    title: 'Decline responder\'s natural 2NT invitation after an overcall',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'suit',
      interference: 'suitOvercall', responderCall: { kind: 'notrump', level: 2 },
    },
    calls: ['Pass'],
    callCategory: ['signoff'],
    appliesWhen: { hcp: { min: 12, max: 13 } },
    meaning: 'Responder showed 11-12 HCP and a stopper; a minimum opener declines game.',
    certainty: 'high',
  },
  {
    id: 'opener-rebid-3nt-after-overcall-natural-2nt',
    kind: 'openerRebid',
    title: 'Accept responder\'s natural 2NT invitation after an overcall',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'suit',
      interference: 'suitOvercall', responderCall: { kind: 'notrump', level: 2 },
    },
    calls: ['3NT'],
    callCategory: ['signoff', 'natural'],
    appliesWhen: { hcp: { min: 14, max: 18 } },
    meaning: 'Fourteen or more HCP reaches normal game strength opposite responder\'s 11-12 HCP.',
    certainty: 'high',
  },
  {
    id: 'opener-rebid-scope-boundary-after-overcall-natural-2nt',
    kind: 'scopeBoundary',
    title: 'Slam and strain judgment after responder\'s natural 2NT invitation',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'suit',
      interference: 'suitOvercall', responderCall: { kind: 'notrump', level: 2 },
    },
    meaning: 'A 19-21 HCP opener opposite 11-12 HCP has more than an ordinary game decision.',
    guidance: [
      'Game is secure, but deciding whether to explore slam or choose a suit contract depends on ' +
      'shape, controls, fit, and working honors.  This competitive family stops rather than add a ' +
      'low-value slam tree.',
    ],
    certainty: 'high',
  },
  {
    id: 'opener-rebid-pass-after-overcall-natural-3nt',
    kind: 'openerRebid',
    title: 'Pass responder\'s natural 3NT game response after an overcall',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'suit',
      interference: 'suitOvercall', responderCall: { kind: 'notrump', level: 3 },
    },
    calls: ['Pass'],
    callCategory: ['signoff'],
    appliesWhen: { hcp: { min: 12, max: 17 } },
    meaning: 'Responder showed 13-15 HCP, balanced shape, and a stopper; ordinary game values Pass.',
    certainty: 'high',
  },
  {
    id: 'opener-rebid-scope-boundary-after-overcall-natural-3nt',
    kind: 'scopeBoundary',
    title: 'Slam judgment after responder\'s natural 3NT game response',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'suit',
      interference: 'suitOvercall', responderCall: { kind: 'notrump', level: 3 },
    },
    meaning: 'With 18+ HCP opposite responder\'s 13-15 HCP, opener has legitimate slam interest.',
    guidance: [
      'Pass at 3NT can still be right, while quantitative or suit-oriented slam exploration may ' +
      'also be appropriate.  The trainer does not model that control-and-fit judgment here.',
    ],
    certainty: 'high',
  },
  //
  // A9: advancer's cheapest cuebid of opener's suit is artificial, after responder's simple
  // raise. A minimum can defend; game with extras is selected only when clearly justified.
  {
    id: 'opener-rebid-pass-after-advancer-support-cuebid',
    kind: 'openerRebid',
    title: 'Defend after advancer cuebids our agreed suit with a minimum',
    auctionContext: { stage: 'openerRebid', openerLevel: 1, openerStrain: 'suit',
      openerRebidAfterInterference: true,
      responderCall: { kind: 'raise', level: 2 }, advancerCall: { kind: 'cuebid' } },
    calls: ['Pass'],
    callCategory: ['natural'],
    appliesWhen: openerSupportCuebidPassApplies,
    meaning: "Pass over the opponents' artificial cuebid with minimum values; the bid does not " +
             'show their willingness to play our suit.',
    certainty: 'high',
  },
  {
    id: 'opener-rebid-game-after-advancer-support-cuebid',
    kind: 'openerRebid',
    title: 'Bid a suitable game after the opponents cuebid our agreed suit',
    auctionContext: { stage: 'openerRebid', openerLevel: 1, openerStrain: 'suit',
      openerRebidAfterInterference: true,
      responderCall: { kind: 'raise', level: 2 }, advancerCall: { kind: 'cuebid' } },
    calls: ['3NT', '4H', '4S'],
    callCategory: ['signoff', 'natural'],
    priority: { rank: 20 },
    appliesWhen: openerSupportCuebidGameApplies,
    meaning: 'Maximum values opposite a known fit justify major game or a stopped 3NT ' +
             'with a minor fit.',
    certainty: 'high',
  },
  {
    id: 'opener-rebid-scope-boundary-after-advancer-support-cuebid',
    kind: 'scopeBoundary',
    title: 'Competitive judgment after an artificial opposing support cuebid',
    auctionContext: { stage: 'openerRebid', openerLevel: 1, openerStrain: 'suit',
      openerRebidAfterInterference: true,
      responderCall: { kind: 'raise', level: 2 }, advancerCall: { kind: 'cuebid' } },
    scopeBoundaryWhen: openerSupportCuebidScopeBoundaryApplies,
    meaning: 'Advancer used our suit artificially to show strength/support for their overcall or ' +
             'takeout Double; this is not a natural suit contract.',
    guidance: ['Minimum values often favor defending. With extras, competing or bidding game ' +
               'requires the known fit, reliable stoppers, and playing-strength judgment.'],
    certainty: 'high',
  },
  //
  // A competitive three-level natural new suit is explicitly game forcing.  Preserve the two
  // clearest destinations: a known major fit or 3NT when opener has the shape and stopper(s).
  {
    id: 'opener-rebid-game-major-after-overcall-three-level-forcing-response',
    kind: 'openerRebid',
    title: 'Raise responder\'s game-forcing three-level major to game',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'suit',
      interference: 'suitOvercall',
      responderCall: { kind: 'newSuit', level: 3, opponentSuit: false },
    },
    calls: ['4H', '4S'],
    callRefinement: (calls: Call[], context: RuleEvalContext, system: BiddingSystem) =>
      refineOpenerResponderSuitToGame(calls, context, system, 3),
    callCategory: ['signoff', 'natural'],
    appliesWhen: { supportLength: { min: 3 } },
    meaning: 'Responder promised five or more cards and game-going values; three-card major support ' +
             'is enough to place the partnership in game.',
    certainty: 'high',
  },
  {
    id: 'opener-rebid-own-major-game-after-overcall-three-level-forcing-competition',
    kind: 'openerRebid',
    title: 'Bid game in a self-supporting opening major after further competition',
    auctionContext: { stage: 'openerRebid', openerLevel: 1, openerStrain: 'major',
      interference: 'suitOvercall',
      responderCall: { kind: 'newSuit', level: 3, opponentSuit: false },
      advancerCall: { kind: ['raise', 'preemptiveRaise'] } },
    calls: ['4H', '4S'],
    callCategory: ['signoff', 'natural'],
    appliesWhen: openerThreeLevelForcingResponseOpeningMajorGameApplies,
    meaning: 'Responder promised game-going values; a strong six-card opening major can ' +
             "provide the game contract even without a fit in responder's minor.",
    certainty: 'high',
  },
  {
    id: 'opener-rebid-3nt-after-overcall-three-level-forcing-response',
    kind: 'openerRebid',
    title: 'Bid 3NT after a game-forcing three-level response with the right shape and stopper',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'suit',
      interference: 'suitOvercall',
      responderCall: { kind: 'newSuit', level: 3, opponentSuit: false },
    },
    calls: ['3NT'],
    callCategory: ['signoff', 'natural'],
    appliesWhen: openerThreeLevelForcingResponseThreeNtApplies,
    meaning: 'Use 3NT without a known major fit when opener is balanced/semi-balanced and stops ' +
             'the opponent suit.',
    certainty: 'high',
  },
  {
    id: 'opener-rebid-scope-boundary-after-overcall-three-level-forcing-response',
    kind: 'scopeBoundary',
    title: 'Game placement after a competitive three-level forcing response',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'suit',
      interference: 'suitOvercall',
      responderCall: { kind: 'newSuit', level: 3, opponentSuit: false },
    },
    meaning: 'Responder has shown a five-card-or-longer natural suit and game-going values, but ' +
             'the selected major-fit and 3NT routes do not resolve the strain.',
    guidance: [
      'The partnership must still reach game.  Choosing among repeating opener\'s suit, supporting ' +
      'a minor, 3NT without the selected shape/stoppers, or another game contract depends on fit, ' +
      'playing strength, and stopper quality beyond this trainer\'s deterministic treatment.',
    ],
    certainty: 'high',
  },
  //
  // Competitive jump raises are weak/preemptive, not uncontested limit raises.  A minimum opener
  // normally leaves the three-level preempt in place; extras require judgment because responder's
  // range is intentionally wide on the weak side.
  {
    id: 'opener-rebid-pass-after-overcall-preemptive-three-level-raise',
    kind: 'openerRebid',
    title: 'Pass responder\'s preemptive three-level raise with a minimum',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'suit',
      interference: 'suitOvercall', responderCall: { kind: 'raise', level: 3 },
    },
    calls: ['Pass'],
    callCategory: ['signoff'],
    appliesWhen: { totalPoints: { min: 12, max: 15, valuation: 'shortage' } },
    meaning: 'Responder made a weak preemptive raise, so a minimum opener does not treat 3M/3m ' +
             'as an invitational limit raise.',
    certainty: 'high',
  },
  {
    id: 'opener-rebid-scope-boundary-after-overcall-preemptive-three-level-raise',
    kind: 'scopeBoundary',
    title: 'Game judgment after responder\'s preemptive three-level raise',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'suit',
      interference: 'suitOvercall', responderCall: { kind: 'raise', level: 3 },
    },
    meaning: 'Opener has extras opposite a weak preemptive raise, but responder did not promise ' +
             'enough strength to make game automatic.',
    guidance: [
      'Pass may be right and bidding game may be right.  The decision depends heavily on playing ' +
      'strength, trump quality, fit, honor location, and vulnerability, which this trainer does ' +
      'not model at this competitive level.',
    ],
    certainty: 'high',
  },
  {
    id: 'opener-rebid-scope-boundary-after-minor-support-cuebid-extras',
    kind: 'scopeBoundary',
    title: 'Game placement with extra values after a minor-suit support cuebid',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'minor',
      interference: 'suitOvercall', responderCall: { kind: 'newSuit', opponentSuit: true },
    },
    meaning: 'Responder has shown limit-or-better support for opener\'s minor, and opener has more ' +
             'than the selected minimum 3m rebid.',
    guidance: [
      'Choosing among 3NT, further minor bidding, or another descriptive call depends heavily on ' +
      'stoppers, shape, and playing strength.  The trainer stops here rather than force a minor ' +
      'game or notrump contract from support points alone.',
    ],
    certainty: 'high',
  },
  {
    id: 'opener-rebid-scope-boundary-after-suit-overcall-responder-pass',
    kind: 'scopeBoundary',
    title: 'Reopening judgment after responder Passes a suit overcall',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'suit',
      interference: 'suitOvercall', responderCall: { kind: 'pass' },
      advancerCall: { kind: 'pass' },
    },
    meaning: 'Responder has declined to act and the opponents have not raised, so opener is in ' +
             'the pass-out/reopening seat.',
    guidance: [
      'Pass may end the auction, while reopening with extra shape or strength can also be right.  ' +
      'This is the separate balancing/reopening judgment family rather than an ordinary opener ' +
      'rebid inferred from responder\'s Pass.',
    ],
    certainty: 'high',
  },
  //
  // Responder's strength Redouble can lead to a weak advancer runout.  Whether opener should
  // Double for penalties, Pass, or continue constructively is deliberately outside the project's
  // penalty-oriented model.  Responder Pass followed by advancer Pass is the analogous runout/
  // stand-the-double decision before the opponents have found a strain.
  {
    id: 'opener-rebid-scope-boundary-after-strength-redouble-runout',
    kind: 'scopeBoundary',
    title: 'Penalty/runout judgment after responder Redoubles and advancer escapes',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'suit',
      interference: 'takeoutDouble', responderCall: { kind: 'redouble' },
      advancerCall: { kind: 'newSuit' },
    },
    meaning: 'Responder showed 10+ HCP and advancer has made the selected weak suit escape.',
    guidance: [
      'Doubling the escape for penalties, passing, or pursuing the partnership\'s own contract ' +
      'depends on defensive prospects and penalty judgment that this trainer deliberately does ' +
      'not model.',
    ],
    certainty: 'high',
  },
  {
    id: 'opener-rebid-scope-boundary-after-takeout-double-pass-pass',
    kind: 'scopeBoundary',
    title: 'Runout judgment after responder Passes a takeout Double',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'suit',
      interference: 'takeoutDouble', responderCall: { kind: 'pass' },
      advancerCall: { kind: 'pass' },
    },
    meaning: 'The auction is about to end in opener\'s doubled contract unless opener acts.',
    guidance: [
      'Standing the Double or running to another strain depends on opener\'s shape, playing ' +
      'strength, and doubled-contract judgment.  Those penalty/runout decisions are outside the ' +
      'trainer\'s selected takeout-Double treatment.',
    ],
    certainty: 'high',
  },
  //
  // After an opposing natural 1NT overcall, responder's two-level suit and jump raise are weak,
  // nonforcing actions.  Keep a clear minimum Pass; stronger hands are explicitly judgmental
  // rather than inheriting uncontested 2/1 or limit-raise meanings.
  {
    id: 'opener-rebid-pass-after-opponent-1nt-weak-new-suit',
    kind: 'openerRebid',
    title: 'Pass responder\'s weak natural suit after an opposing 1NT overcall',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'suit',
      interference: 'notrumpOvercall', responderCall: { kind: 'newSuit', level: 2 },
    },
    calls: ['Pass'],
    callCategory: ['signoff'],
    appliesWhen: (_call, context): AppliesWhenResult => {
      const hcp = context.handFacts.hcp;
      const lengthPoints = context.handFacts.totalPointsWLength;
      // Our ordinary one-level opening may have fewer than 12 HCP when length supplies
      // opening values. Do not strand that legitimate minimum opener in the extras boundary.
      const minimum = (hcp >= 12 && hcp <= 15) ||
        (hcp < 12 && lengthPoints >= 12 && lengthPoints <= 15);
      return { success: minimum, telemetryLines: [
        `${minimum ? 'PASS' : 'FAIL'}: minimum opener has ${hcp} HCP and ` +
        `${lengthPoints} length-adjusted points.`,
      ] };
    },
    meaning: 'Responder showed a good six-card suit with only 5-9 HCP; an ordinary or ' +
             'length-qualified minimum opener may stop.',
    certainty: 'high',
  },
  {
    id: 'opener-rebid-scope-boundary-after-opponent-1nt-weak-new-suit',
    kind: 'scopeBoundary',
    title: 'Extra-value judgment after responder\'s weak suit over an opposing 1NT',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'suit',
      interference: 'notrumpOvercall', responderCall: { kind: 'newSuit', level: 2 },
    },
    meaning: 'Opener has extras, but responder\'s natural suit was explicitly weak and nonforcing.',
    guidance: [
      'A fit, a long opening suit, or unusual playing strength can justify continuing, while Pass ' +
      'may still be right.  The trainer does not turn this weak competitive response into a ' +
      'forcing auction merely because opener has extras.',
    ],
    certainty: 'high',
  },
  {
    id: 'opener-rebid-pass-after-opponent-1nt-preemptive-raise',
    kind: 'openerRebid',
    title: 'Pass responder\'s preemptive jump raise after an opposing 1NT',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'suit',
      interference: 'notrumpOvercall', responderCall: { kind: 'raise', level: 3 },
    },
    calls: ['Pass'],
    callCategory: ['signoff'],
    appliesWhen: { totalPoints: { min: 12, max: 15, valuation: 'shortage' } },
    meaning: 'Responder made a weak preemptive raise, so a minimum opener normally leaves it there.',
    certainty: 'high',
  },
  {
    id: 'opener-rebid-scope-boundary-after-opponent-1nt-preemptive-raise',
    kind: 'scopeBoundary',
    title: 'Game judgment after a preemptive raise over an opposing 1NT',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'suit',
      interference: 'notrumpOvercall', responderCall: { kind: 'raise', level: 3 },
    },
    meaning: 'Opener has extras opposite a weak preemptive raise, but game is not automatic.',
    guidance: [
      'Pass versus bidding on depends on fit, playing strength, trump texture, and vulnerability.  ' +
      'The trainer stops rather than reinterpret the weak raise as an invitation.',
    ],
    certainty: 'high',
  },
  {
    id: 'opener-rebid-scope-boundary-after-opponent-1nt-responder-pass',
    kind: 'scopeBoundary',
    title: 'Reopening judgment after responder Passes an opposing 1NT overcall',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'suit',
      interference: 'notrumpOvercall', responderCall: { kind: 'pass' },
      advancerCall: { kind: 'pass' },
    },
    meaning: 'Responder has declined to act over the natural 1NT overcall and the auction can end.',
    guidance: [
      'Passing, competing again, or doubling can depend on opener\'s shape, strength, and penalty ' +
      'prospects.  That reopening decision is not inferred from responder\'s Pass in this trainer.',
    ],
    certainty: 'high',
  },
  //
  // Weak two-/three-level new suits, weak jump raises, and natural 1NT after a takeout Double are
  // explicitly nonforcing.  A clear minimum opener may therefore Pass rather than manufacture a
  // continuation; stronger hands remain available for later, more specific treatment.
  {
    id: 'opener-rebid-pass-after-double-natural-1nt-minimum',
    kind: 'openerRebid',
    title: 'Pass a natural 1NT response after a takeout Double with a minimum',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'suit',
      interference: 'takeoutDouble', responderCall: { kind: 'notrump', level: 1 },
    },
    calls: ['Pass'],
    callCategory: ['signoff'],
    appliesWhen: { hcp: { min: 12, max: 14 } },
    meaning: 'Responder made a natural nonforcing 1NT bid; a minimum opener may play there.',
    certainty: 'high',
  },
  {
    id: 'opener-rebid-pass-after-double-weak-two-level-new-suit',
    kind: 'openerRebid',
    title: 'Pass a weak two-level new-suit response after a takeout Double',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'suit',
      interference: 'takeoutDouble', responderCall: { kind: 'newSuit', level: 2 },
    },
    calls: ['Pass'],
    callCategory: ['signoff'],
    appliesWhen: { hcp: { min: 12, max: 14 } },
    meaning: "Responder's two-level new suit is weak and nonforcing; a minimum opener may Pass.",
    certainty: 'high',
  },
  {
    id: 'opener-rebid-pass-after-double-weak-three-level-new-suit',
    kind: 'openerRebid',
    title: 'Pass a weak jump shift after a takeout Double',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'suit',
      interference: 'takeoutDouble', responderCall: { kind: 'newSuit', level: 3 },
    },
    calls: ['Pass'],
    callCategory: ['signoff'],
    appliesWhen: { hcp: { min: 12, max: 14 } },
    meaning: "Responder's jump shift is weak and nonforcing; a minimum opener may Pass.",
    certainty: 'high',
  },
  {
    id: 'opener-rebid-pass-after-double-weak-jump-raise',
    kind: 'openerRebid',
    title: 'Pass a weak jump raise after a takeout Double',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'suit',
      interference: 'takeoutDouble', responderCall: { kind: 'raise', level: 3 },
    },
    calls: ['Pass'],
    callCategory: ['signoff'],
    appliesWhen: { hcp: { min: 12, max: 14 } },
    meaning: "Responder's three-level raise is preemptive and nonforcing; a minimum opener may Pass.",
    certainty: 'high',
  },
  //
  //
  // The following rules are opener rebids after a one-level minor opening and 1NT response.
  //
  {
    // Use length total points when opener is not supporting responder's suit.
    id: 'opener-rebid-pass-after-minor-1nt',
    kind: 'openerRebid',
    title: 'Pass 1NT with a minimum balanced or semi-balanced hand',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'minor',
      responderCall: { kind: 'notrump', level: 1 },
    },
    calls: ['Pass'],
    callCategory: ['signoff'],
    appliesWhen: { totalPoints: { min: 12, max: 14 }, shape: { balancedOrSemiBalanced: true } },
    meaning: "Minimum balanced or semi-balanced opener accepts responder's 1NT contract.",
    certainty: 'high',
  },
  //
  {
    id: 'opener-rebid-repeat-minor-after-minor-1nt',
    kind: 'openerRebid',
    title: 'Rebid a six-card opening minor at the two level',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'minor',
      responderCall: { kind: 'notrump', level: 1 },
    },
    calls: ['2C', '2D'],
    // determines which minor is appropriate
    callRefinement: (calls: Call[], context: RuleEvalContext) : CallRefinementResult => {
      return refineOpenerOpeningSuitToLevel(calls, context, 2);
    },
    appliesWhen: { totalPoints: { min: 12, max: 16 }, suitLengths: [{ min: 6 }] },
    meaning: 'Minimum opener shows a six-card or longer opening minor.',
    certainty: 'high',
  },
  //
  {
    id: 'opener-rebid-lower-second-suit-after-minor-1nt',
    kind: 'openerRebid',
    title: 'Show a lower-ranking four-card second suit without reversing',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'minor',
      responderCall: { kind: 'notrump', level: 1 },
    },
    calls: ['2C', '2D', '2H', '2S'],
    callRefinement: refineOpenerLowerRankingSecondSuitRebid,
    // applies when there are ordinary 12-18 total-point range, five or more cards in the opening
    // minor, and four or more cards in the lower-ranking second suit.
    appliesWhen: (call: Call, context: RuleEvalContext) : AppliesWhenResult => {
      return openerSecondSuitApplies(call, context, 12, 18, 'lower-ranking second suit');
    },
    meaning: 'Show a lower-ranking second suit while staying at a safe level.',
    certainty: 'high',
  },
  //
  {
    id: 'opener-rebid-reverse-after-minor-1nt',
    kind: 'openerRebid',
    title: 'Reverse into a higher-ranking second suit with extra strength',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'minor',
      responderCall: { kind: 'notrump', level: 1 },
    },
    calls: ['2D', '2H', '2S'],
    callRefinement: refineOpenerReverseRebid,
    callCategory: ['forcing'],
    // applies when extra strength exists for reverse bid (a new suit higher in rank than previous).
    appliesWhen: (call: Call, context: RuleEvalContext) : AppliesWhenResult => {
      return openerSecondSuitApplies(call, context, 17, 21, 'reverse');
    },
    meaning: 'A reverse shows a second suit and enough extra strength to force responder higher.',
    guidance: ['This treatment uses 17+ total points for a reverse in this non-game-forcing auction.'],
    certainty: 'high',
  },
  //
  {
    id: 'opener-rebid-jump-repeat-minor-after-minor-1nt',
    kind: 'openerRebid',
    title: 'Jump rebid a six-card opening minor with medium values',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'minor',
      responderCall: { kind: 'notrump', level: 1 },
    },
    calls: ['3C', '3D'],
    callRefinement: (calls: Call[], context: RuleEvalContext) : CallRefinementResult => {
      return refineOpenerOpeningSuitToLevel(calls, context, 3);
    },
    callCategory: ['invitational'],
    appliesWhen: { totalPoints: { min: 17, max: 18 }, suitLengths: [{ min: 6 }] },
    meaning: 'Jump rebid the long opening minor to show medium strength.',
    guidance: ['Prefer a good six-card or longer suit for the jump rebid.'],
    certainty: 'high',
  },
  //
  {
    // Natural 2NT rebid range is HCP; do not promote 17 HCP with a length point into this range.
    id: 'opener-rebid-2nt-after-minor-1nt',
    kind: 'openerRebid',
    title: 'Rebid 2NT with 18-19 HCP and balanced or semi-balanced shape',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'minor',
      responderCall: { kind: 'notrump', level: 1 },
    },
    calls: ['2NT'],
    callCategory: ['invitational', 'natural'],
    appliesWhen: { hcp: { min: 18, max: 19 }, shape: { balancedOrSemiBalanced: true } },
    meaning: 'Invite game while showing 18-19 HCP and a balanced or semi-balanced hand.',
    certainty: 'high',
  },
  //
  {
    id: 'opener-rebid-jump-shift-lower-suit-after-minor-1nt',
    kind: 'openerRebid',
    title: 'Jump shift into a lower-ranking second suit with maximum values',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'minor',
      responderCall: { kind: 'notrump', level: 1 },
    },
    calls: ['3C'],
    callRefinement: (calls: Call[], context: RuleEvalContext) : CallRefinementResult => {
      return refineOpenerNewSuitByExtraLevels(calls, context, 1, 'lower', 'jump-shift');
    },
    callCategory: ['gameForcing', 'natural'],
    appliesWhen: (call: Call, context: RuleEvalContext) : AppliesWhenResult => {
      return openerSecondSuitApplies(call, context, 19, 21, 'jump shift');
    },
    meaning: 'A natural jump shift shows a second suit and maximum opening strength.',
    certainty: 'high',
  },
  //
  {
    // This is the 20-21 HCP semi-balanced hand that could not use the strict-balanced 2NT opening.
    id: 'opener-rebid-3nt-after-minor-1nt',
    kind: 'openerRebid',
    title: 'Rebid 3NT with 20-21 HCP and semi-balanced shape',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'minor',
      responderCall: { kind: 'notrump', level: 1 },
    },
    calls: ['3NT'],
    callCategory: ['signoff', 'natural'],
    appliesWhen: { hcp: { min: 20, max: 21 },
                   shape: { balanced: false, balancedOrSemiBalanced: true } },
    meaning: 'Show 20-21 HCP with a 5-4-2-2 or 6-3-2-2 hand that did not open 2NT.',
    certainty: 'high',
  },
  //
  {
    id: 'opener-rebid-game-minor-after-minor-1nt',
    kind: 'openerRebid',
    title: 'Jump to game with a strong seven-card opening minor',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'minor',
      responderCall: { kind: 'notrump', level: 1 },
    },
    calls: ['5C', '5D'],
    callRefinement: (calls: Call[], context: RuleEvalContext) : CallRefinementResult => {
      return refineOpenerOpeningSuitToLevel(calls, context, 5);
    },
    callCategory: ['signoff', 'natural'],
    appliesWhen: { totalPoints: { min: 19, max: 21 }, suitLengths: [{ min: 7 }] },
    meaning: 'Bid game with maximum values and a good seven-card or longer opening minor.',
    certainty: 'high',
  },
  //
  // The following rules are opener rebids after a minor opening and one-level new-suit response.
  //
  {
    id: 'opener-rebid-second-suit-after-minor-one-level-new-suit',
    kind: 'openerRebid',
    title: 'Show an economical four-card second suit with minimum or medium values',
    auctionContext: {
      stage: 'openerRebid', openerRebidAfterInterference: true, openerLevel: 1,
      openerStrain: 'minor',
      responderCall: { kind: 'newSuit', level: 1, jump: 0 },
    },
    calls: ['1D', '1H', '1S', '2C', '2D', '2H', '2S'],
    callRefinement: (calls: Call[], context: RuleEvalContext) : CallRefinementResult => {
      return refineOpenerNonReverseNewSuitRebid(calls, context);
    },
    callCategory: ['natural'],
    appliesWhen: { totalPoints: { min: 12, max: 18 }, suitLengths: [{ min: 4 }] },
    meaning: 'Show a natural four-card or longer second suit without forcing partner higher.',
    guidance: ['A one-level second-suit rebid does not require a five-card opening minor.'],
    certainty: 'high',
  },
  //
  {
    id: 'opener-rebid-1nt-after-minor-one-level-new-suit',
    kind: 'openerRebid',
    title: 'Rebid 1NT with 12-14 HCP and balanced shape',
    auctionContext: {
      stage: 'openerRebid', openerRebidAfterInterference: true, openerLevel: 1,
      openerStrain: 'minor',
      responderCall: { kind: 'newSuit', level: 1, jump: 0 },
    },
    calls: ['1NT'],
    callCategory: ['natural'],
    appliesWhen: openerMinorOneLevelOneNtApplies,
    meaning: 'Natural minimum balanced rebid without four-card support or a new suit to show at one.',
    certainty: 'high',
  },
  //
  {
    id: 'opener-rebid-simple-raise-after-minor-one-level-new-suit',
    kind: 'openerRebid',
    title: "Raise responder's suit cheaply with minimum values",
    auctionContext: {
      stage: 'openerRebid', openerRebidAfterInterference: true, openerLevel: 1,
      openerStrain: 'minor',
      responderCall: { kind: 'newSuit', level: 1, jump: 0 },
    },
    calls: ['2D', '2H', '2S'],
    callRefinement: (calls: Call[], context: RuleEvalContext) : CallRefinementResult => {
      return refineOpenerRaiseResponderSuitToLevel(calls, context, 2);
    },
    callCategory: ['natural'],
    appliesWhen: { totalPoints: { min: 12, max: 16, valuation: 'shortage' },
                   supportLength: { min: 4 } },
    meaning: "Show four-card or longer support for responder's suit with minimum values.",
    guidance: ['A good three-card raise is an occasional judgment exception, not an automatic ' +
               'trainer rule.'],
    certainty: 'high',
  },
  //
  {
    id: 'opener-rebid-repeat-minor-after-minor-one-level-new-suit',
    kind: 'openerRebid',
    title: 'Rebid a six-card opening minor cheaply with minimum values',
    auctionContext: {
      stage: 'openerRebid', openerRebidAfterInterference: true, openerLevel: 1,
      openerStrain: 'minor',
      responderCall: { kind: 'newSuit', level: 1, jump: 0 },
    },
    calls: ['2C', '2D'],
    callRefinement: (calls: Call[], context: RuleEvalContext) : CallRefinementResult => {
      return refineOpenerOpeningSuitToLevel(calls, context, 2);
    },
    callCategory: ['natural'],
    appliesWhen: { totalPoints: { min: 12, max: 16 }, suitLengths: [{ min: 6 }] },
    meaning: 'Show a six-card or longer opening minor with minimum values.',
    certainty: 'high',
  },
  //
  {
    id: 'opener-rebid-reverse-after-minor-one-level-new-suit',
    kind: 'openerRebid',
    title: 'Reverse into a second suit with extra strength',
    auctionContext: {
      stage: 'openerRebid', openerRebidAfterInterference: true, openerLevel: 1,
      openerStrain: 'minor',
      responderCall: { kind: 'newSuit', level: 1, jump: 0 },
    },
    calls: ['2D', '2H', '2S'],
    callRefinement: refineOpenerReverseRebid,
    callCategory: ['forcing', 'natural'],
    appliesWhen: (call: Call, context: RuleEvalContext) : AppliesWhenResult => {
      return openerSecondSuitApplies(call, context, 17, 21, 'reverse');
    },
    meaning: 'A reverse shows a second suit and enough extra strength to force responder higher.',
    guidance: ['This treatment uses 17+ total points for a reverse in this non-game-forcing auction.'],
    certainty: 'high',
  },
  //
  {
    id: 'opener-rebid-jump-repeat-minor-after-minor-one-level-new-suit',
    kind: 'openerRebid',
    title: 'Jump rebid a six-card opening minor with medium values',
    auctionContext: {
      stage: 'openerRebid', openerRebidAfterInterference: true, openerLevel: 1,
      openerStrain: 'minor',
      responderCall: { kind: 'newSuit', level: 1, jump: 0 },
    },
    calls: ['3C', '3D'],
    callRefinement: (calls: Call[], context: RuleEvalContext) : CallRefinementResult => {
      return refineOpenerOpeningSuitToLevel(calls, context, 3);
    },
    callCategory: ['invitational', 'natural'],
    appliesWhen: { totalPoints: { min: 17, max: 18 }, suitLengths: [{ min: 6 }] },
    meaning: 'Show medium values and a good six-card or longer opening minor.',
    certainty: 'high',
  },
  //
  {
    id: 'opener-rebid-jump-raise-after-minor-one-level-new-suit',
    kind: 'openerRebid',
    title: "Jump raise responder's suit with medium values",
    auctionContext: {
      stage: 'openerRebid', openerRebidAfterInterference: true, openerLevel: 1,
      openerStrain: 'minor',
      responderCall: { kind: 'newSuit', level: 1, jump: 0 },
    },
    calls: ['3D', '3H', '3S'],
    callRefinement: (calls: Call[], context: RuleEvalContext) : CallRefinementResult => {
      return refineOpenerRaiseResponderSuitToLevel(calls, context, 3);
    },
    callCategory: ['invitational', 'natural'],
    appliesWhen: { totalPoints: { min: 17, max: 18, valuation: 'shortage' },
                   supportLength: { min: 4 } },
    meaning: "Show medium values and four-card or longer support for responder's suit.",
    certainty: 'high',
  },
  //
  {
    id: 'opener-rebid-2nt-after-minor-one-level-new-suit',
    kind: 'openerRebid',
    title: 'Jump to 2NT with 18-19 HCP and balanced shape',
    auctionContext: {
      stage: 'openerRebid', openerRebidAfterInterference: true, openerLevel: 1,
      openerStrain: 'minor',
      responderCall: { kind: 'newSuit', level: 1, jump: 0 },
    },
    calls: ['2NT'],
    callCategory: ['invitational', 'natural'],
    appliesWhen: { hcp: { min: 18, max: 19 }, shape: { balanced: true },
                   supportLength: { max: 3 } },
    meaning: 'Natural 18-19 HCP balanced rebid without four-card support for responder.',
    certainty: 'high',
  },
  //
  {
    id: 'opener-rebid-jump-shift-after-minor-one-level-new-suit',
    kind: 'openerRebid',
    title: 'Jump shift into a second suit with maximum values',
    auctionContext: {
      stage: 'openerRebid', openerRebidAfterInterference: true, openerLevel: 1,
      openerStrain: 'minor',
      responderCall: { kind: 'newSuit', level: 1, jump: 0 },
    },
    calls: ['2D', '2H', '2S', '3C', '3D', '3H', '3S'],
    callRefinement: (calls: Call[], context: RuleEvalContext) : CallRefinementResult => {
      return refineOpenerNaturalJumpShiftRebid(calls, context);
    },
    callCategory: ['gameForcing', 'natural'],
    appliesWhen: (call: Call, context: RuleEvalContext) : AppliesWhenResult => {
      return openerSecondSuitApplies(call, context, 19, 21, 'jump shift');
    },
    meaning: 'A natural jump shift shows a second suit and maximum opening strength.',
    guidance: ['Do not use a jump in a suit whose non-jump rebid is already a strength-showing ' +
               'reverse; that higher call is left to partnership agreement.'],
    certainty: 'high',
  },
  //
  {
    id: 'opener-rebid-game-raise-after-minor-one-level-new-suit',
    kind: 'openerRebid',
    title: "Raise responder's suit to game with maximum values",
    auctionContext: {
      stage: 'openerRebid', openerRebidAfterInterference: true, openerLevel: 1,
      openerStrain: 'minor',
      responderCall: { kind: 'newSuit', level: 1, jump: 0 },
    },
    calls: ['4H', '4S', '5D'],
    callRefinement: refineOpenerResponderSuitToGame,
    callCategory: ['signoff', 'natural'],
    appliesWhen: { totalPoints: { min: 19, max: 21, valuation: 'shortage' },
                   supportLength: { min: 4 } },
    meaning: "Bid game with maximum values and four-card or longer support for responder's suit.",
    certainty: 'high',
  },
  //
  {
    id: 'opener-rebid-game-in-minor-after-minor-one-level-new-suit',
    kind: 'openerRebid',
    title: 'Jump to game in a strong seven-card opening minor',
    auctionContext: {
      stage: 'openerRebid', openerRebidAfterInterference: true, openerLevel: 1,
      openerStrain: 'minor',
      responderCall: { kind: 'newSuit', level: 1, jump: 0 },
    },
    calls: ['5C', '5D'],
    callRefinement: (calls: Call[], context: RuleEvalContext) : CallRefinementResult => {
      return refineOpenerOpeningSuitToLevel(calls, context, 5);
    },
    callCategory: ['signoff', 'natural'],
    appliesWhen: { totalPoints: { min: 19, max: 21 }, suitLengths: [{ min: 7 }] },
    meaning: 'Bid game with maximum values and a good seven-card or longer opening minor.',
    certainty: 'high',
  },
  //
  {
    id: 'opener-rebid-splinter-after-minor-one-level-new-suit',
    kind: 'openerRebid',
    title: "Optional splinter agreeing responder's suit",
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'minor',
      responderCall: { kind: 'newSuit', level: 1, jump: 0 },
    },
    calls: ['3C', '3D', '3H', '3S', '4C', '4D', '4H', '4S'],
    callRefinement: (calls: Call[], context: RuleEvalContext) : CallRefinementResult => {
      return refineOpenerNewSuitByExtraLevels(calls, context, 2, 'any', 'opener splinter');
    },
    callCategory: ['gameForcing', 'conventional'],
    agreement: { setting: 'splinters', value: true,
                 note: 'Opener-side splinter: support for responder plus singleton/void.' },
    priority: { rank: -100, note: 'Specialized partnership treatment; deliberately present last.' },
    appliesWhen: { totalPoints: { min: 19, max: 21, valuation: 'shortage' },
                   supportLength: { min: 4 }, suitLengths: [{ max: 1 }] },
    meaning: "Artificial double jump showing support for responder's suit and shortness in the bid suit.",
    guidance: ['This is an optional partnership treatment rather than the ordinary natural rebid.'],
    certainty: 'high',
  },
  //
  // The following rules are opener rebids after 1D-2C.  Standard treats the response as forcing
  // one round; 2/1 is already game forcing, so opener describes shape economically.
  //
  {
    id: 'opener-rebid-repeat-diamonds-after-minor-standard-two-level-new-suit',
    kind: 'openerRebid',
    title: 'Rebid diamonds cheaply after a Standard 1D-2C response',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'minor',
      responderCall: { kind: 'newSuit', level: 2, jump: 0 },
    },
    calls: ['2D'],
    agreement: { setting: 'twoLevelNewSuitResponse', value: 'standard',
                 note: 'Standard 1D-2C is forcing one round, but not forcing to game.' },
    callCategory: ['natural'],
    appliesWhen: { totalPoints: { min: 12, max: 16 }, suitLengths: [{ suit: 'D', min: 5 }] },
    meaning: 'Show a five-card or longer diamond suit without enough strength for a stronger rebid.',
    guidance: ['This rebid normally shows six diamonds.  Five diamonds are allowed when opener ' +
               'has no better minimum rebid, especially when a four-card major would require a reverse.'],
    certainty: 'high',
  },
  //
  {
    id: 'opener-rebid-reverse-after-minor-standard-two-level-new-suit',
    kind: 'openerRebid',
    title: 'Reverse into a four-card major after Standard 1D-2C',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'minor',
      responderCall: { kind: 'newSuit', level: 2, jump: 0 },
    },
    calls: ['2H', '2S'],
    callRefinement: refineOpenerFourCardMajorUpTheLine,
    agreement: { setting: 'twoLevelNewSuitResponse', value: 'standard' },
    callCategory: ['forcing', 'natural'],
    appliesWhen: (call: Call, context: RuleEvalContext) : AppliesWhenResult => {
      return openerSecondSuitApplies(call, context, 17, 21, 'reverse');
    },
    meaning: 'Show a four-card major with reverse strength; this auction is not already forced to game.',
    guidance: ['With both four-card majors, show hearts before spades.'],
    certainty: 'high',
  },
  //
  {
    id: 'opener-rebid-2nt-after-minor-standard-two-level-new-suit',
    kind: 'openerRebid',
    title: 'Rebid 2NT with 12-14 HCP after Standard 1D-2C',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'minor',
      responderCall: { kind: 'newSuit', level: 2, jump: 0 },
    },
    calls: ['2NT'],
    agreement: { setting: 'twoLevelNewSuitResponse', value: 'standard' },
    callCategory: ['natural'],
    appliesWhen: { hcp: { min: 12, max: 14 }, shape: { balanced: true } },
    meaning: 'Describe a minimum balanced hand; a four-card major may be concealed because showing it would reverse.',
    certainty: 'high',
  },
  //
  {
    id: 'opener-rebid-simple-raise-after-minor-standard-two-level-new-suit',
    kind: 'openerRebid',
    title: 'Raise clubs cheaply with minimum values after Standard 1D-2C',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'minor',
      responderCall: { kind: 'newSuit', level: 2, jump: 0 },
    },
    calls: ['3C'],
    callRefinement: (calls: Call[], context: RuleEvalContext) : CallRefinementResult => {
      return refineOpenerRaiseResponderSuitToLevel(calls, context, 3);
    },
    agreement: { setting: 'twoLevelNewSuitResponse', value: 'standard' },
    callCategory: ['natural'],
    appliesWhen: { totalPoints: { min: 12, max: 16, valuation: 'shortage' },
                   supportLength: { min: 3 } },
    meaning: 'Show an eight-card-or-longer club fit with minimum values.',
    guidance: ['Responder promised five or more clubs, so three-card opener support is enough.'],
    certainty: 'high',
  },
  //
  {
    id: 'opener-rebid-jump-repeat-diamonds-after-minor-standard-two-level-new-suit',
    kind: 'openerRebid',
    title: 'Jump rebid a good six-card diamond suit with medium values',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'minor',
      responderCall: { kind: 'newSuit', level: 2, jump: 0 },
    },
    calls: ['3D'],
    agreement: { setting: 'twoLevelNewSuitResponse', value: 'standard' },
    callCategory: ['invitational', 'natural'],
    appliesWhen: { totalPoints: { min: 17, max: 18 }, suitLengths: [{ suit: 'D', min: 6 }] },
    meaning: 'Show medium values and a good six-card or longer diamond suit.',
    certainty: 'high',
  },
  //
  {
    id: 'opener-rebid-3nt-after-minor-standard-two-level-new-suit',
    kind: 'openerRebid',
    title: 'Rebid 3NT with 18-19 HCP after Standard 1D-2C',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'minor',
      responderCall: { kind: 'newSuit', level: 2, jump: 0 },
    },
    calls: ['3NT'],
    agreement: { setting: 'twoLevelNewSuitResponse', value: 'standard' },
    callCategory: ['signoff', 'natural'],
    appliesWhen: { hcp: { min: 18, max: 19 }, shape: { balanced: true } },
    meaning: 'Describe a strong balanced hand and place the partnership in game.',
    certainty: 'high',
  },
  //
  {
    id: 'opener-rebid-jump-raise-after-minor-standard-two-level-new-suit',
    kind: 'openerRebid',
    title: 'Jump raise clubs with medium values after Standard 1D-2C',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'minor',
      responderCall: { kind: 'newSuit', level: 2, jump: 0 },
    },
    calls: ['4C'],
    callRefinement: (calls: Call[], context: RuleEvalContext) : CallRefinementResult => {
      return refineOpenerRaiseResponderSuitToLevel(calls, context, 4);
    },
    agreement: { setting: 'twoLevelNewSuitResponse', value: 'standard' },
    callCategory: ['invitational', 'natural'],
    appliesWhen: { totalPoints: { min: 17, max: 18, valuation: 'shortage' },
                   supportLength: { min: 3 } },
    meaning: 'Show medium values and club support while inviting the minor-suit game.',
    certainty: 'high',
  },
  //
  {
    id: 'opener-rebid-game-raise-after-minor-standard-two-level-new-suit',
    kind: 'openerRebid',
    title: 'Raise clubs to game with maximum values after Standard 1D-2C',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'minor',
      responderCall: { kind: 'newSuit', level: 2, jump: 0 },
    },
    calls: ['5C'],
    callRefinement: (calls: Call[], context: RuleEvalContext) : CallRefinementResult => {
      return refineOpenerRaiseResponderSuitToLevel(calls, context, 5);
    },
    agreement: { setting: 'twoLevelNewSuitResponse', value: 'standard' },
    callCategory: ['signoff', 'natural'],
    appliesWhen: { totalPoints: { min: 19, max: 21, valuation: 'shortage' },
                   supportLength: { min: 3 } },
    meaning: 'Bid the club game with maximum values and a known eight-card-or-longer fit.',
    certainty: 'high',
  },
  //
  {
    id: 'opener-rebid-game-in-diamonds-after-minor-standard-two-level-new-suit',
    kind: 'openerRebid',
    title: 'Jump to game in a strong seven-card diamond suit after Standard 1D-2C',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'minor',
      responderCall: { kind: 'newSuit', level: 2, jump: 0 },
    },
    calls: ['5D'],
    agreement: { setting: 'twoLevelNewSuitResponse', value: 'standard' },
    callCategory: ['signoff', 'natural'],
    appliesWhen: { totalPoints: { min: 19, max: 21 }, suitLengths: [{ suit: 'D', min: 7 }] },
    meaning: 'Bid game with maximum values and a good seven-card or longer diamond suit.',
    certainty: 'high',
  },

  //
  // In the 2/1 version of 1D-2C, game is already forced.  Follow the chosen natural treatment:
  // rebid 2D with five or more diamonds; otherwise show a four-card major up the line; otherwise
  // usually rebid 2NT, with 3C available when notrump is unattractive.
  //
  {
    id: 'opener-rebid-repeat-diamonds-after-minor-two-over-one-new-suit',
    kind: 'openerRebid',
    title: 'Rebid 2D with five or more diamonds in a 2/1 game force',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'minor',
      responderCall: { kind: 'newSuit', level: 2, jump: 0 },
    },
    calls: ['2D'],
    agreement: { setting: 'twoLevelNewSuitResponse', value: 'twoOverOne',
                 note: '2/1 1D-2C is already forcing to game.' },
    callCategory: ['gameForcing', 'natural'],
    appliesWhen: { suitLengths: [{ suit: 'D', min: 5 }] },
    meaning: 'Describe five or more diamonds without implying extra strength.',
    guidance: ['With five or more diamonds, rebid 2D before showing a four-card major.',
               'A specialized jump to 3D with a solid six-card suit remains guidance-only.'],
    certainty: 'high',
  },
  //
  {
    id: 'opener-rebid-major-after-minor-two-over-one-new-suit',
    kind: 'openerRebid',
    title: 'Show a four-card major up the line after 2/1 1D-2C',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'minor',
      responderCall: { kind: 'newSuit', level: 2, jump: 0 },
    },
    calls: ['2H', '2S'],
    callRefinement: refineOpenerFourCardMajorUpTheLine,
    agreement: { setting: 'twoLevelNewSuitResponse', value: 'twoOverOne' },
    callCategory: ['gameForcing', 'natural'],
    appliesWhen: { suitLengths: [{ suit: 'D', max: 4 }, { min: 4 }] },
    meaning: 'With fewer than five diamonds, show a natural four-card major without promising extras.',
    guidance: ['With both four-card majors, show hearts before spades.'],
    certainty: 'high',
  },
  //
  {
    id: 'opener-rebid-2nt-after-minor-two-over-one-new-suit',
    kind: 'openerRebid',
    title: 'Rebid 2NT when no five-card diamond suit or four-card major is available',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'minor',
      responderCall: { kind: 'newSuit', level: 2, jump: 0 },
    },
    calls: ['2NT'],
    agreement: { setting: 'twoLevelNewSuitResponse', value: 'twoOverOne' },
    callCategory: ['gameForcing', 'natural'],
    priority: { rank: 20 },
    appliesWhen: { suitLengths: [{ suit: 'D', max: 4 }, { suit: 'H', max: 3 },
                                 { suit: 'S', max: 3 }],
                   shape: { balancedOrSemiBalanced: true } },
    meaning: 'Describe balanced or semi-balanced shape economically; the auction is already game forcing.',
    guidance: ['This is the usual rebid after denying five diamonds and a four-card major.'],
    certainty: 'high',
  },
  //
  {
    id: 'opener-rebid-simple-raise-after-minor-two-over-one-new-suit',
    kind: 'openerRebid',
    title: 'Raise clubs naturally when 2NT is unattractive in a 2/1 game force',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'minor',
      responderCall: { kind: 'newSuit', level: 2, jump: 0 },
    },
    calls: ['3C'],
    callRefinement: (calls: Call[], context: RuleEvalContext) : CallRefinementResult => {
      return refineOpenerRaiseResponderSuitToLevel(calls, context, 3);
    },
    agreement: { setting: 'twoLevelNewSuitResponse', value: 'twoOverOne' },
    callCategory: ['gameForcing', 'natural'],
    priority: { rank: 10 },
    appliesWhen: { supportLength: { min: 4 },
                   suitLengths: [{ suit: 'D', max: 4 }, { suit: 'H', max: 3 },
                                 { suit: 'S', max: 3 }] },
    meaning: 'Confirm a club fit when a natural notrump rebid is unattractive.',
    guidance: ['Responder promised five or more clubs; this chosen 2/1 treatment normally uses ' +
               'four-card opener support for the club raise.'],
    certainty: 'high',
  },
  //
  // The following rules are opener rebids after a major opening and 1NT response.
  //
  {
    id: 'opener-rebid-pass-after-major-1nt-nonforcing',
    kind: 'openerRebid',
    title: 'Pass a non-forcing 1NT response with a flat minimum',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'major',
      responderCall: { kind: 'notrump', level: 1 },
    },
    calls: ['Pass'],
    agreement: { setting: 'majorOneNtResponse', value: 'nonForcing',
                 note: 'Standard non-forcing, or the semi-forcing combination when playing 2/1.' },
    callCategory: ['signoff'],
    appliesWhen: { hcp: { min: 12, max: 13 }, shape: { balanced: true } },
    meaning: 'A flat minimum may accept 1NT as the final contract when the response is not forcing.',
    guidance: ['A 14-HCP hand or a flat-ish 5-4-2-2 hand can be a judgment case; this executable ' +
               'pass rule deliberately uses the conservative 12-13 HCP, 5-3-3-2 case.'],
    certainty: 'high',
  },
  //
  {
    id: 'opener-rebid-repeat-major-after-major-1nt',
    kind: 'openerRebid',
    title: 'Rebid a six-card opening major at the two level',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'major',
      responderCall: { kind: 'notrump', level: 1 },
    },
    calls: ['2H', '2S'],
    callRefinement: (calls: Call[], context: RuleEvalContext) : CallRefinementResult => {
      return refineOpenerOpeningSuitToLevel(calls, context, 2);
    },
    callCategory: ['natural'],
    appliesWhen: { totalPoints: { min: 12, max: 16 }, suitLengths: [{ min: 6 }] },
    meaning: 'Show a six-card or longer opening major with minimum values.',
    certainty: 'high',
  },
  //
  {
    id: 'opener-rebid-lower-second-suit-after-major-1nt',
    kind: 'openerRebid',
    title: 'Show a lower-ranking four-card second suit after 1NT',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'major',
      responderCall: { kind: 'notrump', level: 1 },
    },
    calls: ['2C', '2D', '2H'],
    callRefinement: refineOpenerLowerRankingSecondSuitRebid,
    callCategory: ['natural'],
    appliesWhen: (call: Call, context: RuleEvalContext) : AppliesWhenResult => {
      return openerSecondSuitApplies(call, context, 12, 18, 'lower-ranking second suit');
    },
    meaning: 'Show a natural four-card or longer lower-ranking second suit.',
    certainty: 'high',
  },
  //
  {
    id: 'opener-rebid-reverse-after-major-1nt',
    kind: 'openerRebid',
    title: 'Reverse after 1NT with extra strength',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'major',
      responderCall: { kind: 'notrump', level: 1 },
    },
    calls: ['2S'],
    callRefinement: refineOpenerReverseRebid,
    callCategory: ['forcing', 'natural'],
    appliesWhen: (call: Call, context: RuleEvalContext) : AppliesWhenResult => {
      return openerSecondSuitApplies(call, context, 17, 21, 'reverse');
    },
    meaning: 'A higher-ranking second suit at the two level is a reverse and shows extra strength.',
    certainty: 'high',
  },
  //
  {
    id: 'opener-rebid-minor-fallback-after-major-1nt-forcing',
    kind: 'openerRebid',
    title: 'Manufacture a minor rebid when a forcing 1NT leaves no natural rebid',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'major',
      responderCall: { kind: 'notrump', level: 1 },
    },
    calls: ['2C', '2D'],
    callRefinement: refineForcingOneNtMinorFallback,
    agreement: { setting: 'majorOneNtResponse', value: 'forcing',
                 note: 'A completely forcing 1NT may require opener to manufacture a minor rebid.' },
    appliesWhen: { totalPoints: { min: 12, max: 18 }, suitLengths: [{ min: 3 }] },
    meaning: 'This minor can be only three cards; opener is keeping the forcing auction alive.',
    guidance: ['Prefer an ordinary natural rebid whenever one exists.  A three-card minor is the ' +
               'fallback for an awkward minimum or medium hand.'],
    certainty: 'high',
  },
  //
  {
    id: 'opener-rebid-jump-repeat-major-after-major-1nt',
    kind: 'openerRebid',
    title: 'Jump rebid a six-card opening major with medium values',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'major',
      responderCall: { kind: 'notrump', level: 1 },
    },
    calls: ['3H', '3S'],
    callRefinement: (calls: Call[], context: RuleEvalContext) : CallRefinementResult => {
      return refineOpenerOpeningSuitToLevel(calls, context, 3);
    },
    callCategory: ['invitational', 'natural'],
    appliesWhen: { totalPoints: { min: 17, max: 18 }, suitLengths: [{ min: 6 }] },
    meaning: 'Show medium values and a good six-card or longer opening major.',
    guidance: ['Prefer a good six-card or longer suit for the jump rebid.'],
    certainty: 'high',
  },
  //
  {
    id: 'opener-rebid-2nt-after-major-1nt',
    kind: 'openerRebid',
    title: 'Rebid 2NT with 18-19 HCP and balanced or semi-balanced shape',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'major',
      responderCall: { kind: 'notrump', level: 1 },
    },
    calls: ['2NT'],
    callCategory: ['invitational', 'natural'],
    appliesWhen: { hcp: { min: 18, max: 19 }, shape: { balancedOrSemiBalanced: true } },
    meaning: 'Natural 18-19 HCP notrump rebid after the 1NT response.',
    certainty: 'high',
  },
  //
  {
    id: 'opener-rebid-jump-shift-lower-suit-after-major-1nt',
    kind: 'openerRebid',
    title: 'Jump shift into a lower-ranking second suit with maximum values',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'major',
      responderCall: { kind: 'notrump', level: 1 },
    },
    calls: ['3C', '3D', '3H'],
    callRefinement: (calls: Call[], context: RuleEvalContext) : CallRefinementResult => {
      return refineOpenerNewSuitByExtraLevels(calls, context, 1, 'lower', 'jump-shift');
    },
    callCategory: ['forcing', 'natural'],
    appliesWhen: { totalPoints: { min: 19, max: 21 }, suitLengths: [{ min: 4 }] },
    meaning: 'A jump shift shows a natural second suit and maximum opening strength.',
    certainty: 'high',
  },
  //
  {
    id: 'opener-rebid-game-same-major-after-major-1nt',
    kind: 'openerRebid',
    title: 'Jump to game with a strong seven-card opening major',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'major',
      responderCall: { kind: 'notrump', level: 1 },
    },
    calls: ['4H', '4S'],
    callRefinement: (calls: Call[], context: RuleEvalContext) : CallRefinementResult => {
      return refineOpenerOpeningSuitToLevel(calls, context, 4);
    },
    callCategory: ['signoff', 'natural'],
    appliesWhen: { totalPoints: { min: 19, max: 21 }, suitLengths: [{ min: 7 }] },
    meaning: 'Bid game with maximum values and a good seven-card or longer opening major.',
    certainty: 'high',
  },
  //
  // The following rules are opener rebids after a major opening and one-level new-suit response.
  // For five-card majors this family is 1H-1S.
  //
  {
    id: 'opener-rebid-1nt-after-major-one-level-new-suit',
    kind: 'openerRebid',
    title: 'Rebid 1NT with 12-14 HCP and balanced shape',
    auctionContext: {
      stage: 'openerRebid', openerRebidAfterInterference: true, openerLevel: 1,
      openerStrain: 'major',
      responderCall: { kind: 'newSuit', level: 1, jump: 0 },
    },
    calls: ['1NT'],
    callCategory: ['natural'],
    appliesWhen: { hcp: { min: 12, max: 14 }, shape: { balanced: true },
                   supportLength: { max: 3 } },
    meaning: 'Natural minimum balanced rebid without normal four-card support for responder.',
    guidance: ['A raise normally needs four-card support here.  With three good spades and a hand ' +
               'that is unattractive for notrump, an occasional three-card raise can be safer; ' +
               'that judgment exception is guidance-only in this trainer.'],
    certainty: 'high',
  },
  //
  {
    id: 'opener-rebid-simple-raise-after-major-one-level-new-suit',
    kind: 'openerRebid',
    title: "Raise responder's suit cheaply with minimum values",
    auctionContext: {
      stage: 'openerRebid', openerRebidAfterInterference: true, openerLevel: 1,
      openerStrain: 'major',
      responderCall: { kind: 'newSuit', level: 1, jump: 0 },
    },
    calls: ['2S'],
    callRefinement: (calls: Call[], context: RuleEvalContext) : CallRefinementResult => {
      return refineOpenerRaiseResponderSuitToLevel(calls, context, 2);
    },
    callCategory: ['natural'],
    appliesWhen: { totalPoints: { min: 12, max: 16, valuation: 'shortage' },
                   supportLength: { min: 4 } },
    meaning: "Show four-card or longer support for responder's suit with minimum values.",
    guidance: ['A good three-card raise is an occasional judgment exception, not an automatic ' +
               'trainer rule.'],
    certainty: 'high',
  },
  //
  {
    id: 'opener-rebid-repeat-major-after-major-one-level-new-suit',
    kind: 'openerRebid',
    title: 'Rebid a six-card opening major cheaply with minimum values',
    auctionContext: {
      stage: 'openerRebid', openerRebidAfterInterference: true, openerLevel: 1,
      openerStrain: 'major',
      responderCall: { kind: 'newSuit', level: 1, jump: 0 },
    },
    calls: ['2H'],
    callRefinement: (calls: Call[], context: RuleEvalContext) : CallRefinementResult => {
      return refineOpenerOpeningSuitToLevel(calls, context, 2);
    },
    callCategory: ['natural'],
    appliesWhen: { totalPoints: { min: 12, max: 16 }, suitLengths: [{ min: 6 }] },
    meaning: 'Show a six-card or longer opening major with minimum values.',
    certainty: 'high',
  },
  //
  {
    id: 'opener-rebid-second-suit-after-major-one-level-new-suit',
    kind: 'openerRebid',
    title: 'Show a lower-ranking four-card second suit at the cheapest level',
    auctionContext: {
      stage: 'openerRebid', openerRebidAfterInterference: true, openerLevel: 1,
      openerStrain: 'major',
      responderCall: { kind: 'newSuit', level: 1, jump: 0 },
    },
    calls: ['2C', '2D'],
    callRefinement: refineOpenerLowerRankingSecondSuitRebid,
    callCategory: ['natural'],
    appliesWhen: (call: Call, context: RuleEvalContext) : AppliesWhenResult => {
      return openerSecondSuitApplies(call, context, 12, 18, 'lower-ranking second suit');
    },
    meaning: 'Show a natural four-card or longer second suit with minimum or medium values.',
    certainty: 'high',
  },
  //
  {
    id: 'opener-rebid-jump-repeat-major-after-major-one-level-new-suit',
    kind: 'openerRebid',
    title: 'Jump rebid a six-card opening major with medium values',
    auctionContext: {
      stage: 'openerRebid', openerRebidAfterInterference: true, openerLevel: 1,
      openerStrain: 'major',
      responderCall: { kind: 'newSuit', level: 1, jump: 0 },
    },
    calls: ['3H'],
    callRefinement: (calls: Call[], context: RuleEvalContext) : CallRefinementResult => {
      return refineOpenerOpeningSuitToLevel(calls, context, 3);
    },
    callCategory: ['invitational', 'natural'],
    appliesWhen: { totalPoints: { min: 17, max: 18 }, suitLengths: [{ min: 6 }] },
    meaning: 'Show medium values and a good six-card or longer opening major.',
    certainty: 'high',
  },
  //
  {
    id: 'opener-rebid-jump-raise-after-major-one-level-new-suit',
    kind: 'openerRebid',
    title: "Jump raise responder's suit with medium values",
    auctionContext: {
      stage: 'openerRebid', openerRebidAfterInterference: true, openerLevel: 1,
      openerStrain: 'major',
      responderCall: { kind: 'newSuit', level: 1, jump: 0 },
    },
    calls: ['3S'],
    callRefinement: (calls: Call[], context: RuleEvalContext) : CallRefinementResult => {
      return refineOpenerRaiseResponderSuitToLevel(calls, context, 3);
    },
    callCategory: ['invitational', 'natural'],
    appliesWhen: { totalPoints: { min: 17, max: 18, valuation: 'shortage' },
                   supportLength: { min: 4 } },
    meaning: "Show medium values and four-card or longer support for responder's suit.",
    certainty: 'high',
  },
  //
  {
    id: 'opener-rebid-2nt-after-major-one-level-new-suit',
    kind: 'openerRebid',
    title: 'Jump to 2NT with 18-19 HCP and balanced shape',
    auctionContext: {
      stage: 'openerRebid', openerRebidAfterInterference: true, openerLevel: 1,
      openerStrain: 'major',
      responderCall: { kind: 'newSuit', level: 1, jump: 0 },
    },
    calls: ['2NT'],
    callCategory: ['invitational', 'natural'],
    appliesWhen: { hcp: { min: 18, max: 19 }, shape: { balanced: true },
                   supportLength: { max: 3 } },
    meaning: 'Natural 18-19 HCP balanced rebid without four-card support for responder.',
    certainty: 'high',
  },
  //
  {
    id: 'opener-rebid-jump-shift-after-major-one-level-new-suit',
    kind: 'openerRebid',
    title: 'Jump shift into a lower-ranking second suit with maximum values',
    auctionContext: {
      stage: 'openerRebid', openerRebidAfterInterference: true, openerLevel: 1,
      openerStrain: 'major',
      responderCall: { kind: 'newSuit', level: 1, jump: 0 },
    },
    calls: ['3C', '3D'],
    callRefinement: (calls: Call[], context: RuleEvalContext) : CallRefinementResult => {
      return refineOpenerNewSuitByExtraLevels(calls, context, 1, 'lower', 'jump-shift');
    },
    callCategory: ['gameForcing', 'natural'],
    appliesWhen: { totalPoints: { min: 19, max: 21 }, suitLengths: [{ min: 4 }] },
    meaning: 'A natural jump shift shows a second suit and maximum opening strength.',
    certainty: 'high',
  },
  //
  {
    id: 'opener-rebid-game-raise-after-major-one-level-new-suit',
    kind: 'openerRebid',
    title: "Raise responder's suit to game with maximum values",
    auctionContext: {
      stage: 'openerRebid', openerRebidAfterInterference: true, openerLevel: 1,
      openerStrain: 'major',
      responderCall: { kind: 'newSuit', level: 1, jump: 0 },
    },
    calls: ['4S'],
    callRefinement: (calls: Call[], context: RuleEvalContext) : CallRefinementResult => {
      return refineOpenerRaiseResponderSuitToLevel(calls, context, 4);
    },
    callCategory: ['signoff', 'natural'],
    appliesWhen: { totalPoints: { min: 19, max: 21, valuation: 'shortage' },
                   supportLength: { min: 4 } },
    meaning: "Bid game with maximum values and four-card or longer support for responder's suit.",
    certainty: 'high',
  },
  //
  {
    id: 'opener-rebid-game-same-major-after-major-one-level-new-suit',
    kind: 'openerRebid',
    title: 'Jump to game in a strong seven-card opening major',
    auctionContext: {
      stage: 'openerRebid', openerRebidAfterInterference: true, openerLevel: 1,
      openerStrain: 'major',
      responderCall: { kind: 'newSuit', level: 1, jump: 0 },
    },
    calls: ['4H'],
    callRefinement: (calls: Call[], context: RuleEvalContext) : CallRefinementResult => {
      return refineOpenerOpeningSuitToLevel(calls, context, 4);
    },
    callCategory: ['signoff', 'natural'],
    appliesWhen: { totalPoints: { min: 19, max: 21 }, suitLengths: [{ min: 7 }] },
    meaning: 'Bid game with maximum values and a good seven-card or longer opening major.',
    certainty: 'high',
  },
  //
  {
    id: 'opener-rebid-splinter-after-major-one-level-new-suit',
    kind: 'openerRebid',
    title: "Optional splinter agreeing responder's suit",
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'major',
      responderCall: { kind: 'newSuit', level: 1, jump: 0 },
    },
    calls: ['4C', '4D', '4H', '4S'],
    callRefinement: (calls: Call[], context: RuleEvalContext) : CallRefinementResult => {
      return refineOpenerNewSuitByExtraLevels(calls, context, 2, 'any', 'opener splinter');
    },
    callCategory: ['gameForcing', 'conventional'],
    agreement: { setting: 'splinters', value: true,
                 note: 'Opener-side splinter: support for responder plus singleton/void.' },
    priority: { rank: -100, note: 'Specialized partnership treatment; deliberately present last.' },
    appliesWhen: { totalPoints: { min: 19, max: 21, valuation: 'shortage' },
                   supportLength: { min: 4 }, suitLengths: [{ max: 1 }] },
    meaning: "Artificial jump showing support for responder's suit and shortness in the bid suit.",
    guidance: ['This is an optional partnership treatment rather than the ordinary natural rebid.'],
    certainty: 'high',
  },
  //
  // The following rules are opener rebids after a major opening and Standard two-level new-suit
  // response.  Responder has forced one round but has not forced to game.
  //
  {
    id: 'opener-rebid-simple-raise-after-major-standard-two-level-new-suit',
    kind: 'openerRebid',
    title: "Raise responder's suit cheaply with minimum values",
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'major',
      responderCall: { kind: 'newSuit', level: 2, jump: 0 },
    },
    calls: ['3C', '3D', '3H', '3S'],
    callRefinement: (calls: Call[], context: RuleEvalContext) : CallRefinementResult => {
      return refineOpenerRaiseResponderSuitToLevel(calls, context, 3);
    },
    agreement: { setting: 'twoLevelNewSuitResponse', value: 'standard',
                 note: 'Standard two-level new-suit response is forcing one round, not to game.' },
    callCategory: ['natural'],
    appliesWhen: { totalPoints: { min: 12, max: 16, valuation: 'shortage' },
                   supportLength: { min: 3 } },
    meaning: "Show minimum values and normal support for responder's natural suit.",
    guidance: ['Three-card support is sufficient after 1S-2H because responder promised five ' +
               'hearts; a minor-suit response normally needs four-card opener support.'],
    certainty: 'high',
  },
  //
  {
    id: 'opener-rebid-repeat-major-after-major-standard-two-level-new-suit',
    kind: 'openerRebid',
    title: 'Rebid a six-card opening major cheaply with minimum values',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'major',
      responderCall: { kind: 'newSuit', level: 2, jump: 0 },
    },
    calls: ['2H', '2S'],
    callRefinement: (calls: Call[], context: RuleEvalContext) : CallRefinementResult => {
      return refineOpenerOpeningSuitToLevel(calls, context, 2);
    },
    agreement: { setting: 'twoLevelNewSuitResponse', value: 'standard' },
    callCategory: ['natural'],
    appliesWhen: { totalPoints: { min: 12, max: 16 }, suitLengths: [{ min: 6 }] },
    meaning: 'Show a six-card or longer opening major with minimum values.',
    certainty: 'high',
  },
  //
  {
    id: 'opener-rebid-five-card-major-fallback-after-major-standard-two-level-new-suit',
    kind: 'openerRebid',
    title: 'Repeat a five-card major only when a minimum hand has no descriptive rebid',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'major',
      responderCall: { kind: 'newSuit', level: 2, jump: 0 },
    },
    calls: ['2H', '2S'],
    callRefinement: refineOpenerFiveCardMajorFallback,
    agreement: { setting: 'twoLevelNewSuitResponse', value: 'standard' },
    callCategory: ['natural'],
    appliesWhen: { totalPoints: { min: 12, max: 16 } },
    meaning: 'A minimum opener may repeat exactly five cards in the opening major when the one-round force leaves no normal rebid.',
    guidance: ['Normally a repeat promises six cards. This is an explicitly limited fallback, ' +
               'not an invitation to conceal a suitable second suit, fit, or balanced NT rebid.'],
    certainty: 'high',
  },
  //
  {
    id: 'opener-rebid-second-suit-after-major-standard-two-level-new-suit',
    kind: 'openerRebid',
    title: 'Show an economical second suit without reversing',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'major',
      responderCall: { kind: 'newSuit', level: 2, jump: 0 },
    },
    calls: ['2D', '2H', '2S', '3C', '3D', '3H'],
    callRefinement: refineOpenerNonReverseNewSuitRebid,
    agreement: { setting: 'twoLevelNewSuitResponse', value: 'standard' },
    callCategory: ['natural'],
    appliesWhen: { totalPoints: { min: 12, max: 18 }, suitLengths: [{ min: 4 }] },
    meaning: 'Show a natural four-card or longer second suit without promising reverse strength.',
    certainty: 'high',
  },
  //
  {
    id: 'opener-rebid-reverse-after-major-standard-two-level-new-suit',
    kind: 'openerRebid',
    title: 'Reverse into a second suit with extra strength',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'major',
      responderCall: { kind: 'newSuit', level: 2, jump: 0 },
    },
    calls: ['2S', '3S', '3C', '3D'],
    callRefinement: refineOpenerReverseRebid,
    agreement: { setting: 'twoLevelNewSuitResponse', value: 'standard' },
    callCategory: ['forcing', 'natural'],
    appliesWhen: { totalPoints: { min: 17, max: 21 }, suitLengths: [{ min: 4 }] },
    meaning: 'A reverse, including a three-level lower suit that forces partner higher, shows 17+ total points in Standard.',
    certainty: 'high',
  },
  //
  {
    id: 'opener-rebid-2nt-after-major-standard-two-level-new-suit',
    kind: 'openerRebid',
    title: 'Rebid 2NT with 12-14 HCP and balanced shape',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'major',
      responderCall: { kind: 'newSuit', level: 2, jump: 0 },
    },
    calls: ['2NT'],
    agreement: { setting: 'twoLevelNewSuitResponse', value: 'standard' },
    callCategory: ['natural'],
    appliesWhen: { hcp: { min: 12, max: 14 }, shape: { balanced: true } },
    meaning: 'Natural minimum balanced rebid after a Standard two-level response.',
    certainty: 'high',
  },
  //
  {
    id: 'opener-rebid-jump-repeat-major-after-major-standard-two-level-new-suit',
    kind: 'openerRebid',
    title: 'Jump rebid a six-card opening major with medium values',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'major',
      responderCall: { kind: 'newSuit', level: 2, jump: 0 },
    },
    calls: ['3H', '3S'],
    callRefinement: (calls: Call[], context: RuleEvalContext) : CallRefinementResult => {
      return refineOpenerOpeningSuitToLevel(calls, context, 3);
    },
    agreement: { setting: 'twoLevelNewSuitResponse', value: 'standard' },
    callCategory: ['forcing', 'natural'],
    appliesWhen: { totalPoints: { min: 17, max: 18 }, suitLengths: [{ min: 6 }] },
    meaning: 'Show medium values and a good six-card or longer opening major.',
    certainty: 'high',
  },
  //
  {
    id: 'opener-rebid-jump-raise-after-major-standard-two-level-new-suit',
    kind: 'openerRebid',
    title: "Jump raise responder's suit with medium values",
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'major',
      responderCall: { kind: 'newSuit', level: 2, jump: 0 },
    },
    calls: ['4C', '4D', '4H', '4S'],
    callRefinement: (calls: Call[], context: RuleEvalContext) : CallRefinementResult => {
      return refineOpenerRaiseResponderSuitToLevel(calls, context, 4);
    },
    agreement: { setting: 'twoLevelNewSuitResponse', value: 'standard' },
    callCategory: ['invitational', 'natural'],
    appliesWhen: { totalPoints: { min: 17, max: 18, valuation: 'shortage' },
                   supportLength: { min: 3 } },
    meaning: "Show medium values and normal support for responder's natural suit.",
    certainty: 'high',
  },
  //
  {
    id: 'opener-rebid-3nt-after-major-standard-two-level-new-suit',
    kind: 'openerRebid',
    title: 'Jump to 3NT with 18-19 HCP and balanced shape',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'major',
      responderCall: { kind: 'newSuit', level: 2, jump: 0 },
    },
    calls: ['3NT'],
    agreement: { setting: 'twoLevelNewSuitResponse', value: 'standard' },
    callCategory: ['signoff', 'natural'],
    appliesWhen: { hcp: { min: 18, max: 19 }, shape: { balanced: true } },
    meaning: 'Natural 18-19 HCP balanced rebid after the Standard two-level response.',
    certainty: 'high',
  },
  //
  {
    id: 'opener-rebid-jump-shift-after-major-standard-two-level-new-suit',
    kind: 'openerRebid',
    title: 'Jump shift into a lower-ranking second suit with maximum values',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'major',
      responderCall: { kind: 'newSuit', level: 2, jump: 0 },
    },
    calls: ['3D', '3H', '4C', '4D', '4H'],
    callRefinement: (calls: Call[], context: RuleEvalContext) : CallRefinementResult => {
      return refineOpenerNewSuitByExtraLevels(calls, context, 1, 'lower', 'jump-shift');
    },
    agreement: { setting: 'twoLevelNewSuitResponse', value: 'standard' },
    callCategory: ['gameForcing', 'natural'],
    appliesWhen: { totalPoints: { min: 19, max: 21 }, suitLengths: [{ min: 4 }] },
    meaning: 'A natural jump shift shows a second suit and maximum opening strength.',
    certainty: 'high',
  },
  //
  {
    id: 'opener-rebid-game-same-major-after-major-standard-two-level-new-suit',
    kind: 'openerRebid',
    title: 'Jump to game in a strong seven-card opening major',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'major',
      responderCall: { kind: 'newSuit', level: 2, jump: 0 },
    },
    calls: ['4H', '4S'],
    callRefinement: (calls: Call[], context: RuleEvalContext) : CallRefinementResult => {
      return refineOpenerOpeningSuitToLevel(calls, context, 4);
    },
    agreement: { setting: 'twoLevelNewSuitResponse', value: 'standard' },
    callCategory: ['signoff', 'natural'],
    appliesWhen: { totalPoints: { min: 19, max: 21 }, suitLengths: [{ min: 7 }] },
    meaning: 'Bid game with maximum values and a good seven-card or longer opening major.',
    certainty: 'high',
  },
  //
  {
    id: 'opener-rebid-game-raise-after-major-standard-two-level-new-suit',
    kind: 'openerRebid',
    title: "Raise responder's suit to game with maximum values",
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'major',
      responderCall: { kind: 'newSuit', level: 2, jump: 0 },
    },
    calls: ['4H', '4S', '5C', '5D'],
    callRefinement: refineOpenerResponderSuitToGame,
    agreement: { setting: 'twoLevelNewSuitResponse', value: 'standard' },
    callCategory: ['signoff', 'natural'],
    appliesWhen: { totalPoints: { min: 19, max: 21, valuation: 'shortage' },
                   supportLength: { min: 3 } },
    meaning: "Bid game with maximum values and normal support for responder's suit.",
    certainty: 'high',
  },
  //
  // The following rules are opener rebids after a major opening and 2/1 game-forcing new-suit
  // response.  Game is already forced, so opener describes shape economically and can show extra
  // strength later rather than jumping merely to advertise strength.
  //
  {
    id: 'opener-rebid-simple-raise-after-major-two-over-one-new-suit',
    kind: 'openerRebid',
    title: "Support responder's suit at the cheapest level in a 2/1 game force",
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'major',
      responderCall: { kind: 'newSuit', level: 2, jump: 0 },
    },
    calls: ['3C', '3D', '3H', '3S'],
    callRefinement: (calls: Call[], context: RuleEvalContext) : CallRefinementResult => {
      return refineOpenerRaiseResponderSuitToLevel(calls, context, 3);
    },
    agreement: { setting: 'twoLevelNewSuitResponse', value: 'twoOverOne',
                 note: '2/1 response is already game forcing.' },
    callCategory: ['gameForcing', 'natural'],
    priority: { rank: 20 },
    appliesWhen: { supportLength: { min: 3 } },
    meaning: "Confirm a fit in responder's natural suit without consuming extra bidding room.",
    guidance: ['Three-card support is sufficient after 1S-2H because responder promised five ' +
               'hearts; a minor-suit response normally needs four-card opener support.'],
    certainty: 'high',
  },
  //
  {
    id: 'opener-rebid-repeat-major-after-major-two-over-one-new-suit',
    kind: 'openerRebid',
    title: 'Rebid a six-card opening major cheaply in a 2/1 game force',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'major',
      responderCall: { kind: 'newSuit', level: 2, jump: 0 },
    },
    calls: ['2H', '2S'],
    callRefinement: (calls: Call[], context: RuleEvalContext) : CallRefinementResult => {
      return refineOpenerOpeningSuitToLevel(calls, context, 2);
    },
    agreement: { setting: 'twoLevelNewSuitResponse', value: 'twoOverOne' },
    callCategory: ['gameForcing', 'natural'],
    appliesWhen: { suitLengths: [{ min: 6 }] },
    meaning: 'Show a six-card or longer opening major; the auction is already game forcing.',
    certainty: 'high',
  },
  //
  {
    id: 'opener-rebid-second-suit-after-major-two-over-one-new-suit',
    kind: 'openerRebid',
    title: 'Show a four-card second suit cheaply in a 2/1 game force',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'major',
      responderCall: { kind: 'newSuit', level: 2, jump: 0 },
    },
    calls: ['2D', '2H', '2S', '3C', '3D', '3H', '3S'],
    callRefinement: (calls: Call[], context: RuleEvalContext) : CallRefinementResult => {
      return refineOpenerNewSuitAtCheapestLevel(calls, context);
    },
    agreement: { setting: 'twoLevelNewSuitResponse', value: 'twoOverOne' },
    callCategory: ['gameForcing', 'natural'],
    appliesWhen: { suitLengths: [{ min: 4 }] },
    meaning: 'Describe a natural second suit economically; reverse (higher new suit) does not ' +
             'require traditional 17+ strength once game is already forced.',
    certainty: 'high',
  },
  //
  {
    id: 'opener-rebid-2nt-after-major-two-over-one-new-suit',
    kind: 'openerRebid',
    title: 'Rebid 2NT with balanced or semi-balanced shape in a 2/1 game force',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'major',
      responderCall: { kind: 'newSuit', level: 2, jump: 0 },
    },
    calls: ['2NT'],
    agreement: { setting: 'twoLevelNewSuitResponse', value: 'twoOverOne' },
    callCategory: ['gameForcing', 'natural'],
    appliesWhen: { shape: { balancedOrSemiBalanced: true } },
    meaning: 'Describe balanced or semi-balanced shape economically; game is already forced.',
    guidance: ['Do not jump merely to show extra strength.  This project leaves specialized ' +
               'higher-notrump strength treatments to partnership agreement; extra strength can ' +
               'be shown later.',
               'With a weak doubleton in an unbid suit or a clear natural suit/fit rebid, prefer ' +
               'describing the suit when judgment says notrump is unattractive; this rule keeps ' +
               '2NT available rather than encoding stopper quality.'],
    certainty: 'high',
  },
  //
  // The following rules are opener rebids after responder raises a minor opening.
  // Standard natural raises are used here: a single raise is minimum, and a jump raise is
  // invitational.  Inverted minors and their stopper-showing continuations are not modeled.
  //
  {
    id: 'opener-rebid-pass-after-minor-simple-raise',
    kind: 'openerRebid',
    title: 'Pass a simple minor raise with minimum values',
    auctionContext: {
      stage: 'openerRebid', openerRebidAfterInterference: true, openerLevel: 1, openerStrain: 'minor',
      responderCall: { kind: 'raise', level: 2, jump: 0 },
      advancerCall: { kind: ['pass', 'raise', 'preemptiveRaise', 'newSuit', 'responsiveDouble'] },
    },
    calls: ['Pass'],
    callCategory: ['signoff'],
    appliesWhen: { totalPoints: { min: 12, max: 16 } },
    meaning: 'With minimum values after a non-forcing minor raise, stop in the partscore.',
    certainty: 'high',
  },
  //
  {
    id: 'opener-rebid-raise-to-three-after-minor-simple-raise',
    kind: 'openerRebid',
    title: 'Raise the minor to three with medium values',
    auctionContext: {
      stage: 'openerRebid', openerRebidAfterInterference: true, openerLevel: 1, openerStrain: 'minor',
      responderCall: { kind: 'raise', level: 2, jump: 0 },
      advancerCall: { kind: ['pass', 'raise'] },
    },
    calls: ['3C', '3D'],
    callRefinement: (calls: Call[], context: RuleEvalContext) : CallRefinementResult => {
      return refineOpenerOpeningSuitToLevel(calls, context, 3);
    },
    callCategory: ['invitational', 'natural'],
    appliesWhen: { totalPoints: { min: 17, max: 18 } },
    meaning: 'Invite game by raising the agreed minor with medium values.',
    guidance: ['If game is eventually reached after a minor-suit fit, 3NT is usually preferred ' +
               'to five of the minor when notrump is suitable.'],
    certainty: 'high',
  },
  //
  {
    id: 'opener-rebid-3nt-after-minor-simple-raise',
    kind: 'openerRebid',
    title: 'Usually bid 3NT with maximum values after a simple minor raise',
    auctionContext: {
      stage: 'openerRebid', openerRebidAfterInterference: true, openerLevel: 1, openerStrain: 'minor',
      responderCall: { kind: 'raise', level: 2, jump: 0 },
      advancerCall: { kind: ['pass', 'raise', 'preemptiveRaise', 'newSuit', 'responsiveDouble'] },
    },
    calls: ['3NT'],
    callCategory: ['signoff', 'natural'],
    priority: { rank: 20, note: '3NT is the usual game target after a minor-suit fit.' },
    appliesWhen: { hcp: { max: 21 }, totalPoints: { min: 19 } },
    meaning: 'With maximum values, usually place the contract in 3NT rather than five of the minor.',
    guidance: ['Outside-suit weakness is a reason for caution.  In an uncontested auction this ' +
               'rule does not require opener personally to hold a full stopper in every outside ' +
               'suit; when reused after a suit overcall, the shared competitive filter does require ' +
               "a stopper in the opponent's suit.",
               'For human judgment, a conservative full stopper is A, Kx or longer, or Qxx or ' +
               'longer.  Partial holdings such as Qx or Jxx, or holdings whose effectiveness ' +
               'depends on which hand declares and who leads the suit, may still be adequate in ' +
               'practice as a judgment call.'],
    certainty: 'high',
  },
  //
  {
    id: 'opener-rebid-game-minor-after-minor-simple-raise',
    kind: 'openerRebid',
    title: 'Consider five of the minor with a very long, unbalanced maximum',
    auctionContext: {
      stage: 'openerRebid', openerRebidAfterInterference: true, openerLevel: 1, openerStrain: 'minor',
      responderCall: { kind: 'raise', level: 2, jump: 0 },
      advancerCall: { kind: ['pass', 'raise', 'preemptiveRaise', 'newSuit', 'responsiveDouble'] },
    },
    calls: ['5C', '5D'],
    callRefinement: (calls: Call[], context: RuleEvalContext) : CallRefinementResult => {
      return refineOpenerOpeningSuitToLevel(calls, context, 5);
    },
    callCategory: ['signoff', 'natural'],
    priority: { rank: 10, note: 'Judgment alternative to the usual 3NT game.' },
    appliesWhen: { hcp: { max: 21 }, totalPoints: { min: 19 },
                   suitLengths: [{ min: 7 }], shape: { balancedOrSemiBalanced: false } },
    meaning: 'A very long minor and strongly unbalanced shape can make the minor-suit game preferable.',
    guidance: ['3NT remains the usual game target; this is a conservative executable case for ' +
               'choosing five of the minor when notrump is clearly less attractive.'],
    certainty: 'medium',
  },
  //
  {
    id: 'opener-rebid-pass-after-minor-limit-raise',
    kind: 'openerRebid',
    title: 'Pass a minor limit raise with a bad minimum',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'minor',
      responderCall: { kind: 'raise', level: 3, jump: 1 },
    },
    calls: ['Pass'],
    callCategory: ['signoff'],
    appliesWhen: { totalPoints: { min: 12, max: 13 } },
    meaning: 'Responder has invited game; a bad minimum opener may decline at three of the minor.',
    certainty: 'high',
  },
  //
  {
    id: 'opener-rebid-3nt-after-minor-limit-raise',
    kind: 'openerRebid',
    title: 'Accept a minor limit raise with 3NT when game values are present',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'minor',
      responderCall: { kind: 'raise', level: 3, jump: 1 },
    },
    calls: ['3NT'],
    callCategory: ['signoff', 'natural'],
    priority: { rank: 20, note: '3NT is the usual game target after a minor-suit fit.' },
    appliesWhen: { hcp: { max: 21 }, totalPoints: { min: 14 } },
    meaning: 'Accept the invitation in the usual minor-suit game target, 3NT.',
    guidance: ['Responder has shown about 11-12 HCP, so a useful 14+ total-point opener has ' +
               'enough combined strength to consider game.',
               'Outside-suit weakness is a reason for caution, but this uncontested rule does not ' +
               'require opener personally to hold a full stopper in every outside suit.',
               'For human judgment, a conservative full stopper is A, Kx or longer, or Qxx or ' +
               'longer.  Partial holdings such as Qx or Jxx, or holdings whose effectiveness ' +
               'depends on which hand declares and who leads the suit, may still be adequate in ' +
               'practice as a judgment call.'],
    certainty: 'high',
  },
  //
  {
    id: 'opener-rebid-game-minor-after-minor-limit-raise',
    kind: 'openerRebid',
    title: 'Consider five of the minor with extra values and extreme distribution',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'minor',
      responderCall: { kind: 'raise', level: 3, jump: 1 },
    },
    calls: ['5C', '5D'],
    callRefinement: (calls: Call[], context: RuleEvalContext) : CallRefinementResult => {
      return refineOpenerOpeningSuitToLevel(calls, context, 5);
    },
    callCategory: ['signoff', 'natural'],
    priority: { rank: 10, note: 'Judgment alternative to the usual 3NT game.' },
    appliesWhen: { hcp: { max: 21 }, totalPoints: { min: 17 },
                   suitLengths: [{ min: 7 }], shape: { balancedOrSemiBalanced: false } },
    meaning: 'A very long agreed minor and extreme shape can make five of the minor preferable to 3NT.',
    guidance: ['Keep 3NT available as the usual game; the lower-ranked five-minor candidate marks ' +
               'a distributional judgment case rather than a mandatory choice.'],
    certainty: 'medium',
  },
  //
  // The following rules are opener rebids after a natural invitational 2NT response to a minor.
  // Responder has shown 11-12 HCP, balanced shape, and no four-card major.
  //
  {
    id: 'opener-rebid-pass-after-minor-2nt',
    kind: 'openerRebid',
    title: 'Decline an invitational 2NT response with a minimum',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'minor',
      responderCall: { kind: 'notrump', level: 2 },
    },
    calls: ['Pass'],
    callCategory: ['signoff'],
    appliesWhen: { hcp: { min: 12, max: 13 } },
    meaning: 'Decline responder\'s natural game invitation and play 2NT with a minimum opener.',
    guidance: ['With 12 HCP, Pass.  A 13-HCP hand is a judgment case, so both Pass and 3NT remain ' +
               'available in the trainer.'],
    certainty: 'high',
  },
  //
  {
    id: 'opener-rebid-3nt-after-minor-2nt',
    kind: 'openerRebid',
    title: 'Accept an invitational 2NT response with game-going values',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'minor',
      responderCall: { kind: 'notrump', level: 2 },
    },
    calls: ['3NT'],
    callCategory: ['signoff', 'natural'],
    appliesWhen: { hcp: { min: 13, max: 21 } },
    meaning: 'Accept responder\'s natural game invitation and bid 3NT.',
    guidance: ['With 14+ HCP, accept the 11-12 HCP invitation.  With 13 HCP, hand texture, working ' +
               'honors, and likely sources of tricks make acceptance a judgment call.',
               'Outside-suit weakness can make notrump less attractive, but this uncontested rule ' +
               'does not require opener personally to hold a full stopper in every outside suit.',
               'For human judgment, a conservative full stopper is A, Kx or longer, or Qxx or ' +
               'longer.  Partial holdings such as Qx or Jxx, or holdings whose effectiveness ' +
               'depends on which hand declares and who leads the suit, may still be adequate in ' +
               'practice as a judgment call.',
               'More detailed shape-showing continuations after 1m-2NT are partnership treatment ' +
               'and are not executable in this natural invitation model.'],
    certainty: 'high',
  },
  //
  // The following rules are opener rebids after an artificial Jacoby 2NT game-forcing raise.
  // Distribution is described before generic strength: three-level new suits show shortness,
  // four-level new suits show a good five-card-or-longer side suit, and otherwise opener uses
  // 4M / 3NT / 3M for minimum / medium / strong hands.
  //
  {
    id: 'opener-rebid-shortness-after-major-jacoby-2nt',
    kind: 'openerRebid',
    title: 'Show singleton or void after Jacoby 2NT',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'major',
      responderCall: { kind: 'notrump', level: 2 },
    },
    calls: ['3C', '3D', '3H', '3S'],
    callRefinement: (calls: Call[], context: RuleEvalContext) : CallRefinementResult => {
      return refineOpenerNewSuitAtCheapestLevel(calls, context);
    },
    callCategory: ['gameForcing', 'conventional'],
    agreement: { setting: 'majorGameForceWithSupport', value: 'jacoby2NT',
                 note: 'Jacoby 2NT: a three-level new suit shows singleton or void.' },
    priority: { rank: 40, note: 'Prefer shortness description before a good side-suit alternative.' },
    appliesWhen: { suitLengths: [{ max: 1 }] },
    meaning: 'Show singleton or void in the bid side suit after the Jacoby 2NT game force.',
    guidance: ['Responder can use the shortness information when judging game versus slam.'],
    certainty: 'high',
  },
  //
  {
    id: 'opener-rebid-side-suit-after-major-jacoby-2nt',
    kind: 'openerRebid',
    title: 'Show a good five-card side suit after Jacoby 2NT',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'major',
      responderCall: { kind: 'notrump', level: 2 },
    },
    calls: ['4C', '4D', '4H', '4S'],
    callRefinement: (calls: Call[], context: RuleEvalContext) : CallRefinementResult => {
      return refineOpenerNewSuitByExtraLevels(calls, context, 1, 'any',
                                              'Jacoby good side-suit rebid');
    },
    callCategory: ['gameForcing', 'conventional'],
    agreement: { setting: 'majorGameForceWithSupport', value: 'jacoby2NT',
                 note: 'Jacoby 2NT: a four-level new suit shows a good five-card-or-longer suit.' },
    priority: { rank: 30, note: 'Keep behind a three-level shortness description when both apply.' },
    appliesWhen: openerJacobyGoodSideSuitApplies,
    meaning: 'Show a good five-card-or-longer side suit after the Jacoby 2NT game force.',
    guidance: ['This project uses at least two of A/K/Q/J as the executable suit-quality threshold.',
               'When both shortness and a good side suit can be described, shortness is presented ' +
               'first while this bid remains visible as a reasonable partnership judgment.'],
    certainty: 'high',
  },
  //
  {
    id: 'opener-rebid-game-in-opening-major-after-major-jacoby-2nt',
    kind: 'openerRebid',
    title: 'Jump to game with a minimum Jacoby 2NT opener',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'major',
      responderCall: { kind: 'notrump', level: 2 },
    },
    calls: ['4H', '4S'],
    callRefinement: (calls: Call[], context: RuleEvalContext) : CallRefinementResult => {
      return refineOpenerOpeningSuitToLevel(calls, context, 4);
    },
    callCategory: ['signoff', 'natural'],
    agreement: { setting: 'majorGameForceWithSupport', value: 'jacoby2NT' },
    appliesWhen: { hcp: { max: 13 }, shape: { noVoid: true, noSingleton: true } },
    meaning: 'With no shortness to show, a minimum opener signs off in game in the agreed major.',
    guidance: ['This range includes an unusually light Rule-of-20 opener; the auction is already ' +
               'forced to game.'],
    certainty: 'high',
  },
  //
  {
    id: 'opener-rebid-3nt-after-major-jacoby-2nt',
    kind: 'openerRebid',
    title: 'Show medium strength after Jacoby 2NT',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'major',
      responderCall: { kind: 'notrump', level: 2 },
    },
    calls: ['3NT'],
    callCategory: ['gameForcing', 'conventional'],
    agreement: { setting: 'majorGameForceWithSupport', value: 'jacoby2NT' },
    appliesWhen: { hcp: { min: 14, max: 15 }, shape: { noVoid: true, noSingleton: true } },
    meaning: 'With no shortness to show, 3NT conventionally shows a medium 14-15 HCP opener.',
    guidance: ['The agreed major remains trump; 3NT is a strength message rather than a proposal ' +
               'to play notrump.'],
    certainty: 'high',
  },
  //
  {
    id: 'opener-rebid-strong-3-major-after-major-jacoby-2nt',
    kind: 'openerRebid',
    title: 'Show strong slam-interest values after Jacoby 2NT',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'major',
      responderCall: { kind: 'notrump', level: 2 },
    },
    calls: ['3H', '3S'],
    callRefinement: (calls: Call[], context: RuleEvalContext) : CallRefinementResult => {
      return refineOpenerOpeningSuitToLevel(calls, context, 3);
    },
    callCategory: ['gameForcing', 'conventional'],
    agreement: { setting: 'majorGameForceWithSupport', value: 'jacoby2NT' },
    appliesWhen: { hcp: { min: 16, max: 21 }, shape: { noVoid: true, noSingleton: true } },
    meaning: 'With no shortness to show, three of the agreed major shows a strong opener and slam interest.',
    guidance: ['Responder continues the game-forcing auction with the knowledge that opener has ' +
               'substantial extra strength.  Later control bids and keycard methods are not modeled here.'],
    certainty: 'high',
  },
  //
  // The following rules are opener continuations after responder makes a double-jump splinter.
  // Responder has shown 4+ major support, 13-15 support points, and singleton/void in the bid suit.
  // Four of the agreed major always remains available.  With enough working high-card strength,
  // opener can instead show the cheapest available side-suit control below game as a slam try.
  //
  {
    id: 'opener-rebid-game-in-opening-major-after-major-splinter',
    kind: 'openerRebid',
    title: 'Keep game in the agreed major available after a splinter',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'major',
      responderCall: { kind: 'newSuit', jump: 2 },
    },
    calls: ['4H', '4S'],
    callRefinement: (calls: Call[], context: RuleEvalContext) : CallRefinementResult => {
      return refineOpenerOpeningSuitToLevel(calls, context, 4);
    },
    callCategory: ['signoff', 'natural'],
    agreement: { setting: 'splinters', value: true },
    priority: { rank: 20, note: 'Keep game visible even when a higher-ranked control bid qualifies.' },
    meaning: 'Stop in game in the agreed major rather than pursue slam after responder\'s splinter.',
    guidance: ['Responder has already shown game-forcing support and shortness in the splinter suit.',
               'High cards opposite responder\'s singleton or void can be wasted.  When opener has ' +
               'enough working strength outside that suit, a higher-ranked control bid may also ' +
               'appear as a slam-interest alternative; four of the major remains available as a ' +
               'judgment choice.'],
    certainty: 'high',
  },
  //
  {
    id: 'opener-rebid-control-after-major-splinter',
    kind: 'openerRebid',
    title: 'Show a side-suit control with slam interest after a splinter',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'major',
      responderCall: { kind: 'newSuit', jump: 2 },
    },
    calls: ['3C', '3D', '3H', '3S', '4C', '4D', '4H', '4S'],
    callRefinement: refineOpenerSplinterControlBid,
    callCategory: ['gameForcing', 'conventional'],
    agreement: { setting: 'splinters', value: true,
                 note: 'After a splinter, the cheapest available side-suit control below game ' +
                       'shows slam interest.' },
    priority: { rank: 30, note: 'Present the slam-interest control ahead of the game signoff.' },
    meaning: 'Show slam interest and first- or second-round control in the bid side suit.',
    guidance: ['This project uses 15+ working HCP as the executable slam-interest threshold, ' +
               'discounting K/Q/J held in responder\'s splinter suit.',
               'Because the splinter does not distinguish singleton from void, an ace in the ' +
               'splinter suit remains counted in this approximation.',
               'A control is an ace, king, singleton, or void.  Bid the cheapest available control ' +
               'below four of the agreed major; the control bid is exploratory, not a commitment ' +
               'to reach slam.',
               'If no modeled control bid is available below game, four of the major remains the ' +
               'modeled continuation; later keycard or higher-level slam methods are deferred.'],
    certainty: 'medium',
  },
  //
  // The following rules are opener continuations after responder makes a single-jump new-suit
  // response.  Under the weak agreement the bid is preemptive and normally ends the auction.
  // Under the classic strong agreement game is already forced, so opener describes fit and shape
  // economically rather than jumping again merely to advertise strength.
  //
  {
    id: 'opener-rebid-pass-after-weak-jump-shift',
    kind: 'openerRebid',
    title: 'Pass a weak jump shift',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'suit',
      responderCall: { kind: 'newSuit', jump: 1 },
    },
    calls: ['Pass'],
    agreement: { setting: 'jumpShift', value: 'weak',
                 note: 'Modern weak jump shifts are non-forcing and preemptive.' },
    callCategory: ['signoff'],
    meaning: 'Responder has made a weak, preemptive, passable jump shift; opener normally stops.',
    guidance: ['An unusually strong opener with an exceptional fit may continue by partnership ' +
               'judgment, but those exceptional continuations are not modeled here.'],
    certainty: 'high',
  },
  //
  {
    id: 'opener-rebid-raise-after-strong-jump-shift',
    kind: 'openerRebid',
    title: "Raise responder's strong jump-shift suit economically",
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'suit',
      responderCall: { kind: 'newSuit', jump: 1 },
    },
    calls: ['3C', '3D', '3H', '3S', '4C', '4D', '4H', '4S'],
    callRefinement: refineOpenerRaiseResponderSuitOneLevel, // cheapest raise of responder's 5+ suit
    agreement: { setting: 'jumpShift', value: 'strong',
                 note: 'Classic strong jump shift is already game forcing.' },
    callCategory: ['gameForcing', 'natural'],
    priority: { rank: 20, note: 'Support for responder is opener\'s first descriptive priority.' },
    appliesWhen: { supportLength: { min: 3 } },
    meaning: "Confirm the fit in responder's five-card-or-longer suit while preserving bidding room.",
    guidance: ['Three-card support is enough because the strong jump shift promises 5+ cards.'],
    certainty: 'high',
  },
  //
  {
    id: 'opener-rebid-repeat-opening-suit-after-strong-jump-shift',
    kind: 'openerRebid',
    title: 'Repeat a six-card opening suit after a strong jump shift',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'suit',
      responderCall: { kind: 'newSuit', jump: 1 },
    },
    calls: ['3C', '3D', '3H', '3S'],
    callRefinement: refineOpenerOpeningSuitAtCheapestLevel, // cheapest legal repeat after response
    agreement: { setting: 'jumpShift', value: 'strong' },
    callCategory: ['gameForcing', 'natural'],
    appliesWhen: { suitLengths: [{ min: 6 }] },
    meaning: 'Show a six-card-or-longer opening suit; responder has already forced the auction to game.',
    certainty: 'high',
  },
  //
  {
    id: 'opener-rebid-new-suit-after-strong-jump-shift',
    kind: 'openerRebid',
    title: 'Show a four-card second suit after a strong jump shift',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'suit',
      responderCall: { kind: 'newSuit', jump: 1 },
    },
    calls: ['2C', '2D', '2H', '2S', '3C', '3D', '3H', '3S', '4C', '4D'],
    callRefinement: (calls: Call[], context: RuleEvalContext) : CallRefinementResult => {
      return refineOpenerNewSuitAtCheapestLevel(calls, context);
    }, // cheapest natural second-suit call
    agreement: { setting: 'jumpShift', value: 'strong' },
    callCategory: ['gameForcing', 'natural'],
    appliesWhen: { suitLengths: [{ min: 4 }] },
    meaning: 'Describe a natural four-card-or-longer second suit economically in the game force.',
    guidance: ['Traditional reverse-strength restrictions are unnecessary because responder has ' +
               'already forced the auction to game.'],
    certainty: 'high',
  },
  //
  {
    id: 'opener-rebid-notrump-after-strong-jump-shift',
    kind: 'openerRebid',
    title: 'Rebid notrump economically after a strong jump shift',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'suit',
      responderCall: { kind: 'newSuit', jump: 1 },
    },
    calls: ['2NT', '3NT'],
    callRefinement: refineOpenerNotrumpAtCheapestLevel, // cheapest legal NT rebid after response
    agreement: { setting: 'jumpShift', value: 'strong' },
    callCategory: ['gameForcing', 'natural'],
    appliesWhen: { shape: { balancedOrSemiBalanced: true } },
    meaning: 'Describe a balanced or semi-balanced opener economically; the auction remains game forcing.',
    guidance: ['Do not jump merely to show extra strength.  Prefer a clear fit or natural suit ' +
               'description when one is more informative.'],
    certainty: 'high',
  },
  //
  // The following rules are opener continuations after responder places the contract in game.
  // Direct 3NT responses are natural signoffs; Pass remains visible even when a strong opener can
  // make a quantitative slam try.  The direct major 3NT treatment already promises three-card
  // support, so four of opener's major is also a natural game choice.
  //
  {
    id: 'opener-rebid-pass-after-minor-3nt',
    kind: 'openerRebid',
    title: 'Pass a natural 3NT game response after a minor opening',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'minor',
      responderCall: { kind: 'notrump', level: 3 },
    },
    calls: ['Pass'],
    callCategory: ['signoff'],
    appliesWhen: { hcp: { max: 21 } },
    meaning: 'Responder has placed the contract in 3NT with balanced game-going values.',
    guidance: ['Pass remains the ordinary practical choice.  With 18-21 HCP, quantitative 4NT is ' +
               'also available as a judgment-based slam invitation.'],
    certainty: 'high',
  },
  //
  {
    id: 'opener-rebid-pass-after-major-3nt',
    kind: 'openerRebid',
    title: 'Keep 3NT available after a direct flat game response to a major',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'major',
      responderCall: { kind: 'notrump', level: 3 },
    },
    calls: ['Pass'],
    callCategory: ['signoff'],
    appliesWhen: { hcp: { max: 21 } },
    meaning: 'Responder has offered 3NT with a very flat 13-15 HCP hand and three-card major support.',
    guidance: ['Pass remains a judgment alternative even though the known eight-card major fit ' +
               'also makes four of the major available.'],
    certainty: 'high',
  },
  //
  {
    id: 'opener-rebid-game-in-opening-major-after-major-3nt',
    kind: 'openerRebid',
    title: 'Return to the known major fit after a direct 3NT response',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'major',
      responderCall: { kind: 'notrump', level: 3 },
    },
    calls: ['4H', '4S'],
    callRefinement: (calls: Call[], context: RuleEvalContext) : CallRefinementResult => {
      return refineOpenerOpeningSuitToLevel(calls, context, 4);
    },
    callCategory: ['signoff', 'natural'],
    priority: { rank: 30, note: 'Prefer the known eight-card major fit while retaining 3NT.' },
    appliesWhen: { suitLengths: [{ min: 5 }] },
    meaning: 'Responder\'s direct 3NT treatment promises exactly three-card support, so opener has ' +
             'at least an eight-card major fit.',
    guidance: ['Four of the major is presented ahead of 3NT, but Pass remains visible because the ' +
               'relative merits of the two games can still depend on the actual cards.'],
    certainty: 'high',
  },
  //
  {
    id: 'opener-rebid-4nt-quantitative-after-suit-3nt',
    kind: 'openerRebid',
    title: 'Invite small slam quantitatively after a natural 3NT response',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'suit',
      responderCall: { kind: 'notrump', level: 3 },
    },
    calls: ['4NT'],
    callCategory: ['invitational', 'natural'],
    priority: { rank: 20, note: 'Slam invitation remains behind a known major-suit game.' },
    appliesWhen: openerSuitThreeNtQuantitativeApplies,
    meaning: 'Natural quantitative invitation to 6NT with an 18-21 HCP one-level suit opener.',
    guidance: ['This is quantitative, not Blackwood: responder may Pass with a minimum or ' +
               'unsuitable 13-15 HCP hand and continue toward 6NT with a maximum/useful hand.',
               'Pass at 3NT remains available because accepting the slam try is a judgment decision.',
               'After a major opening, this project still treats 4NT as quantitative in this ' +
               'specific direct-3NT family; four of the known major fit remains available ahead of it.'],
    certainty: 'high',
  },
  //
  {
    id: 'opener-rebid-pass-after-major-preemptive-game-raise',
    kind: 'openerRebid',
    title: 'Pass responder\'s preemptive game raise',
    auctionContext: {
      stage: 'openerRebid', openerRebidAfterInterference: true, openerLevel: 1,
      openerStrain: 'major',
      responderCall: { kind: 'raise', level: 4, jump: 2 },
    },
    calls: ['Pass'],
    callCategory: ['signoff'],
    meaning: 'Responder\'s direct four-of-the-major raise is weak, preemptive, and non-forcing.',
    guidance: ['Exceptional slam-oriented hands can explore further in actual play; those control ' +
               'bids or ace-asking continuations are not modeled in this rule family.'],
    certainty: 'high',
  },

  //
  // The following rules are opener rebids after responder makes a four-card limit raise of a major.
  // Responder has shown 11-12 support points, so 13 support points is deliberately a judgment case.
  //
  {
    id: 'opener-rebid-pass-after-major-limit-raise',
    kind: 'openerRebid',
    title: 'Decline a major-suit limit raise with minimum values',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'major',
      responderCall: { kind: 'raise', level: 3, jump: 1 },
    },
    calls: ['Pass'],
    callCategory: ['signoff'],
    appliesWhen: { totalPoints: { min: 12, max: 13, valuation: 'shortage' } },
    meaning: 'Decline responder\'s invitational raise and play three of the agreed major.',
    guidance: ['With 12 support points, Pass.  A 13-support-point hand is a judgment case, so ' +
               'both Pass and game remain available in the trainer.'],
    certainty: 'high',
  },
  //
  {
    id: 'opener-rebid-game-raise-after-major-limit-raise',
    kind: 'openerRebid',
    title: 'Accept a major-suit limit raise with game-going values',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'major',
      responderCall: { kind: 'raise', level: 3, jump: 1 },
    },
    calls: ['4H', '4S'],
    callRefinement: (calls: Call[], context: RuleEvalContext) : CallRefinementResult => {
      return refineOpenerOpeningSuitToLevel(calls, context, 4);
    },
    callCategory: ['signoff', 'natural'],
    appliesWhen: { totalPoints: { min: 13, valuation: 'shortage' } },
    meaning: 'Accept responder\'s limit raise and bid game in the agreed major.',
    guidance: ['With 14+ support points, accept the 11-12-point invitation.  With 13 support ' +
               'points, hand texture and working honors make acceptance a judgment call.',
               'Because the major-suit fit is known, revalue with shortage points rather than ' +
               'using HCP alone.',
               'With substantial extra strength and useful controls, slam exploration may be ' +
               'appropriate in actual play; those continuations are not modeled in this rule family.'],
    certainty: 'high',
  },

  //
  // The following rules are opener rebids after responder raises a major opening to two.
  //
  {
    id: 'opener-rebid-pass-after-major-simple-raise',
    kind: 'openerRebid',
    title: 'Pass a simple major raise with minimum values',
    auctionContext: {
      stage: 'openerRebid', openerRebidAfterInterference: true, openerLevel: 1, openerStrain: 'major',
      responderCall: { kind: 'raise', level: 2, jump: 0 },
      advancerCall: { kind: ['pass', 'raise', 'preemptiveRaise', 'newSuit', 'responsiveDouble'] },
    },
    calls: ['Pass'],
    callCategory: ['signoff'],
    appliesWhen: { totalPoints: { min: 12, max: 16, valuation: 'shortage' } },
    meaning: 'With the major fit established and minimum values, game is unlikely.',
    certainty: 'high',
  },
  //
  {
    id: 'opener-rebid-competitive-three-after-major-simple-raise',
    kind: 'openerRebid',
    title: 'Compete to three of the major with six-card trump length',
    auctionContext: {
      stage: 'openerRebid', openerRebidAfterInterference: true, openerLevel: 1, openerStrain: 'major',
      responderCall: { kind: 'raise', level: 2, jump: 0 },
      advancerCall: { kind: ['pass', 'raise', 'preemptiveRaise', 'newSuit', 'responsiveDouble'] },
    },
    calls: ['3H', '3S'],
    callRefinement: (calls: Call[], context: RuleEvalContext) : CallRefinementResult => {
      return refineOpenerOpeningSuitToLevel(calls, context, 3);
    },
    callCategory: ['natural'],
    priority: { rank: 10,
                note: 'More specific than the generic minimum Pass; Pass remains visible.' },
    appliesWhen: { totalPoints: { min: 12, max: 16, valuation: 'shortage' },
                   supportLength: { min: 6 } },
    meaning: 'Modern competitive/obstructive raise with six or more trumps; not a game try.',
    guidance: ['Responder should not treat 3M as an invitation to game in this treatment.'],
    certainty: 'high',
  },
  //
  {
    id: 'opener-rebid-help-suit-game-try-after-major-simple-raise',
    kind: 'openerRebid',
    title: 'Make a natural help-suit game try with medium values',
    auctionContext: {
      stage: 'openerRebid', openerRebidAfterInterference: true, openerLevel: 1, openerStrain: 'major',
      responderCall: { kind: 'raise', level: 2, jump: 0 },
      advancerCall: { kind: ['pass', 'raise'] },
    },
    calls: ['2C', '2D', '2H', '2S', '3C', '3D', '3H', '3S'],
    callRefinement: (calls: Call[], context: RuleEvalContext) : CallRefinementResult => {
      return refineOpenerNewSuitAtCheapestLevel(calls, context);
    },
    callCategory: ['forcing', 'invitational', 'natural'],
    priority: { rank: 10 },
    appliesWhen: { totalPoints: { min: 17, max: 18, valuation: 'shortage' },
                   suitLengths: [{ min: 3 }] },
    meaning: 'Ask responder for useful high cards or shortness in the side suit before deciding game.',
    guidance: ['This project uses the natural help-suit treatment: the game-try suit has at least ' +
               'three cards.  Some partnerships instead use short-suit or artificial game tries.'],
    certainty: 'high',
  },
  //
  {
    id: 'opener-rebid-2nt-game-try-after-major-simple-raise',
    kind: 'openerRebid',
    title: 'Use 2NT as a balanced game try with medium values',
    auctionContext: {
      stage: 'openerRebid', openerRebidAfterInterference: true, openerLevel: 1, openerStrain: 'major',
      responderCall: { kind: 'raise', level: 2, jump: 0 },
      advancerCall: { kind: ['pass', 'raise'] },
    },
    calls: ['2NT'],
    callCategory: ['forcing', 'invitational', 'natural'],
    priority: { rank: 20,
                note: 'Prefer the balanced game try while leaving natural help-suit tries visible.' },
    appliesWhen: { hcp: { min: 17, max: 18 }, shape: { balanced: true } },
    meaning: 'Balanced game try after the major-suit fit is already known.',
    guidance: ['Use high-card points for this natural notrump-oriented invitation rather than ' +
               'promoting the hand with shortage points.  Responder decides whether to stop below ' +
               'game or accept the invitation; the final strain can still be the major or notrump.'],
    certainty: 'high',
  },
  //
  {
    id: 'opener-rebid-game-raise-after-major-simple-raise',
    kind: 'openerRebid',
    title: 'Raise the agreed major to game with maximum values',
    auctionContext: {
      stage: 'openerRebid', openerRebidAfterInterference: true, openerLevel: 1, openerStrain: 'major',
      responderCall: { kind: 'raise', level: 2, jump: 0 },
      advancerCall: { kind: ['pass', 'raise', 'preemptiveRaise', 'newSuit', 'responsiveDouble'] },
    },
    calls: ['4H', '4S'],
    callRefinement: (calls: Call[], context: RuleEvalContext) : CallRefinementResult => {
      return refineOpenerOpeningSuitToLevel(calls, context, 4);
    },
    callCategory: ['signoff', 'natural'],
    appliesWhen: { totalPoints: { min: 19, max: 21, valuation: 'shortage' } },
    meaning: 'Game is likely after revaluing the known major-suit fit.',
    certainty: 'high',
  },
  //
  // Once advancer makes a new natural suit, a preemptive raise, or a responsive Double,
  // medium 17-18-point hands no longer have a deterministic version of the ordinary game try.
  // Keep the auction teachable by stopping with hand-specific guidance rather than inventing a bid.
  {
    id: 'opener-rebid-scope-boundary-after-simple-raise-continued-competition',
    kind: 'scopeBoundary',
    title: 'Competitive judgment after a simple raise and further advancer action',
    auctionContext: {
      stage: 'openerRebid', openerRebidAfterInterference: true, openerLevel: 1,
      openerStrain: 'suit', responderCall: { kind: 'raise', level: 2, jump: 0 },
      advancerCall: { kind: ['preemptiveRaise', 'newSuit', 'responsiveDouble'] },
    },
    scopeBoundaryWhen: openerSimpleRaiseContinuedCompetitionScopeBoundaryApplies,
    meaning: 'Medium opener values are sufficient to consider continuing, but no single action is ' +
             'deterministic in this competitive position.',
    guidance: [
      'Pass may be right, and bidding on may also be right.  The decision depends heavily on ' +
      'shape, trump texture, honor location, vulnerability, and how high the opponents have pushed ' +
      'the auction.',
      'The trainer stops here rather than turn an uncontested game try into false precision after ' +
      'the opponents have changed the available bidding space.',
    ],
    certainty: 'high',
  },
  //
  {
    id: 'opener-rebid-splinter-after-major-simple-raise',
    kind: 'openerRebid',
    title: 'Optional splinter after a simple major raise',
    auctionContext: {
      stage: 'openerRebid', openerLevel: 1, openerStrain: 'major',
      responderCall: { kind: 'raise', level: 2, jump: 0 },
    },
    calls: ['3S', '4C', '4D', '4H'],
    callRefinement: (calls: Call[], context: RuleEvalContext) : CallRefinementResult => {
      return refineOpenerNewSuitByExtraLevels(calls, context, 1, 'any', 'opener splinter');
    },
    callCategory: ['gameForcing', 'conventional'],
    agreement: { setting: 'splinters', value: true,
                 note: 'Opener-side splinter after a simple raise: shortness plus the agreed fit.' },
    priority: { rank: -100, note: 'Specialized partnership treatment; deliberately present last.' },
    appliesWhen: { totalPoints: { min: 19, max: 21, valuation: 'shortage' },
                   supportLength: { min: 5 }, suitLengths: [{ max: 1 }] },
    meaning: 'Artificial jump showing singleton/void in the bid suit with the major fit already agreed.',
    guidance: ['This is an optional partnership treatment rather than the ordinary game raise.'],
    certainty: 'high',
  },
];
