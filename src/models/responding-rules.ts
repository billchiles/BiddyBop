/// ResponseBidRules: responding bidding rules with and w/o interference.

import {
  type BidRule, type Call, type RuleEvalContext, type CallRefinementResult, type AppliesWhenResult
} from './bidding-types';
import {
  guidelineOf17Applies, majorDirectThreeNtApplies, majorTwoLevelNewSuitApplies, minorRaiseApplies,
  minorSupportNewSuitApplies, oneNtNaturalMinorInvitationApplies, oneNtTwoNtInvitationApplies,
  refineMajorSupportNewSuitFirst, refineMajorTwoLevelNewSuitByLength,
  refineNaturalMajorGameOver2Nt, refineNewSuitByExtraLevels, refineOneLevelNewSuitAfterMinor,
  refineRaisePartnerSuitBy1, refineRaisePartnerSuitBy2, refineRaiseToLevel,
  refineResponderCuebidAfterJumpOvercall, refineResponderCuebidAfterOvercall,
  refineResponderNewSuitAfterJumpOvercall, refineResponderNewSuitAfterNotrumpOvercall,
  refineResponderNewSuitAfterOvercall, refineResponderPreemptiveMajorGameRaise,
  refineResponderRaiseAfterJumpOvercall, refineResponderRaiseAfterOvercall, refineStrongJumpShift,
  refineStrongTwoCPositiveSuitResponse, refineThreeCardLimitRaiseOneNtFallback,
  refineThreeCardMajorSupportNewSuitFirst, refineThreeLevelPreemptNewSuitResponse,
  refineToCheapestNewSuitBids, refineWeakJumpShift, refineWeakTwoNewSuitResponse,
  responderCuebidAfterJumpOvercallApplies, responderCuebidAfterOvercallApplies,
  responderJordanTwoNtAfterDoubleApplies, responderNegativeDoubleAfterJumpOvercallApplies,
  responderNegativeDoubleAfterOvercallApplies, responderNotrumpAfterJumpOvercallApplies,
  responderNotrumpAfterOvercallApplies, responderPassAfterJumpOvercallApplies,
  responderWeakJumpRaiseAfterInterferenceApplies, responderWeakTwoLevelNewSuitApplies,
  threeLevelPreemptPassApplies, threeLevelPreemptRaiseApplies, twoNtNaturalMinorForcingApplies,
  weakTwoFourLevelRaiseApplies, weakTwoPassApplies, weakTwoSimpleRaiseApplies
} from './responding-functions';


export const ResponseBidRules: BidRule[] = [
  //
  // One-level minor response rules match level 1 + minor; refiners resolve strain-dependent calls.
  //
  {
    id: 'respond-to-minor-w/-new-suit-one-level-priority',
    kind: 'responseBid',
    title: 'After 1C or 1D, bid a new suit at the one level first',
    auctionContext: { stage: 'responding', interference: 'none', openerLevel: 1, openerStrain: 'minor' },
    calls: ['1D', '1H', '1S'],
    // After 1C or 1D, prefer 4+ card major.  After 1C or 1D, choose among 4+ one-level new suits.
    // Candidate suit length is owned by the refiner because it must compare the actual suit lengths
    // to choose and order the surviving calls.
    callRefinement: refineOneLevelNewSuitAfterMinor, // chooses according to guidance below
    callCategory: ['forcing'],
    priority: { rank: 100, note: 'Responder priority with 6+ points.' },
    appliesWhen: { hcp: { min: 6 }, }, // suitLengths: [{ min: 4 }]}, don't need this due to refiner
    meaning: 'New suit at the one level; forcing.',
    guidance: ['Bid the longest suit.',
               'With a choice of five-card or six-card suits, bid the higher-ranking suit.',
               'With a choice of four-card suits, bid the lowest-ranking suit, bidding up the line.',
               'After 1C with about 6-10 points some prefer to bypass a 4+ diamond suit to bid ' +
                  'a four-card major.'],
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-1d-w/-2c-standard',
    // Natural 2C response to 1D say 5+-card club suit with enough strength for two-level.
    kind: 'responseBid',
    title: 'After 1D, respond 2C with Standard two-level new-suit values',
    auctionContext: { stage: 'responding', interference: 'none', auction: ['1D'] },
    calls: ['2C'],
    callCategory: ['forcing'],
    agreement: { setting: 'twoLevelNewSuitResponse', value: 'standard',
                 note: 'Standard: 11+ and forcing, but not forcing to game.' },
    appliesWhen: { hcp: { min: 11 }, suitLengths: [{ suit: 'C', min: 5 }] },
    meaning: 'Natural club response at the two level, forcing but not game forcing.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-1d-w/-2c-two-over-one',
    // 2/1 version of 1D-2C: natural clubs with game-forcing strength.  More points than classic.
    kind: 'responseBid',
    title: 'After 1D, respond 2C as a 2/1 game force',
    auctionContext: { stage: 'responding', interference: 'none', auction: ['1D'] },
    calls: ['2C'],
    callCategory: ['gameForcing'],
    agreement: { setting: 'twoLevelNewSuitResponse', value: 'twoOverOne',
                 note: '2/1 treatment: 13+ and game forcing.' },
    appliesWhen: { hcp: { min: 13 }, suitLengths: [{ suit: 'C', min: 5 }] },
    meaning: 'Natural club response at the two level, forcing to game.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-minor-w/-1nt',
    // Use 1NT after a minor opening with minimum balanced values and no four-card major.
    kind: 'responseBid',
    title: 'After 1C or 1D, respond 1NT with minimum balanced values and no four-card major',
    auctionContext: { stage: 'responding', interference: 'none', openerLevel: 1, openerStrain: 'minor' },
    calls: ['1NT'],
    callCategory: ['invitational'],
    priority: { rank: 60 },
    appliesWhen: { hcp: { min: 6, max: 10 }, shape: { balanced: true, noFourCardMajor: true } },
    meaning: 'Balanced non-forcing response with no four-card major; opener may pass or continue.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-minor-w/-2nt',
    // Use 2NT after a minor opening with invitational balanced values and no four-card major.
    kind: 'responseBid',
    title: 'After 1C or 1D, respond 2NT with invitational balanced values and no four-card major',
    auctionContext: { stage: 'responding', interference: 'none', openerLevel: 1, openerStrain: 'minor' },
    calls: ['2NT'],
    callCategory: ['invitational'],
    priority: { rank: 65 },
    appliesWhen: { hcp: { min: 11, max: 12 }, shape: { balanced: true, noFourCardMajor: true } },
    meaning: 'Balanced invitational response with no four-card major.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-minor-w/-3nt',
    // Place the contract in 3NT with game balanced values and no four-card major.
    kind: 'responseBid',
    title: 'After 1C or 1D, respond 3NT with game-going balanced values and no four-card major',
    auctionContext: { stage: 'responding', interference: 'none', openerLevel: 1, openerStrain: 'minor' },
    calls: ['3NT'],
    callCategory: ['signoff', 'natural'],
    priority: { rank: 70 },
    appliesWhen: { hcp: { min: 13, max: 15 }, shape: { balanced: true, noFourCardMajor: true } },
    meaning: 'Balanced game response with no four-card major; opener may pass or continue.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-minor-w/-raise-to-two',
    // Make a minimum single raise of opener's minor with 6-10 HCP, long support, and no four-card
    // major.
    kind: 'responseBid',
    title: 'Raise opener minor to two with 6-10 and support',
    auctionContext: { stage: 'responding', openerLevel: 1, openerStrain: 'minor' },
    calls: ['2C', '2D'],
    callRefinement: refineRaisePartnerSuitBy1, // need to choose based on actual auction
    callCategory: ['invitational'],
    priority: { rank: 40 },
    appliesWhen: (call: Call, context: RuleEvalContext): AppliesWhenResult => {
      return minorRaiseApplies(call, context, 6, 10, 'minimum minor raise');
    },
    guidance: ['Use five-card support after 1C, where opener may hold only three clubs.',
               'Four-card support is enough after 1D.'],
    meaning: 'Non-forcing minimum raise of opener minor with normal support and no four-card major; ' +
             'opener may pass or continue.',
    certainty: 'medium',
  },
  //
  {
    id: 'respond-to-minor-w/-limit-raise',
    // Make a limit raise to three of opener's minor with 11-12 HCP, long support, and no four-card
    // major.  Opener may pass with a minimum or continue with extra values.
    kind: 'responseBid',
    title: 'Raise opener minor to three with 11-12 and support',
    auctionContext: { stage: 'responding', interference: 'none', openerLevel: 1, openerStrain: 'minor' },
    calls: ['3C', '3D'],
    callRefinement: refineRaisePartnerSuitBy2, // chooses the right suit from actual auction
    callCategory: ['invitational'],
    priority: { rank: 45 },
    appliesWhen: (call: Call, context: RuleEvalContext): AppliesWhenResult => {
      return minorRaiseApplies(call, context, 11, 12, 'minor limit raise');
    },
    meaning: 'Invitational limit raise of opener minor; opener may pass or continue with extra values.',
    guidance: ['Use five-card support after 1C and four-card support after 1D.',
               'Some play inverted minors, where single raise is strong, and jump is weak.'],
    certainty: 'medium',
  },
  //
  {
    id: 'respond-to-minor-w/-13plus-start-new-suit',
    // With strong hand and support for opener's minor, first bid a new suit and show support later.
    kind: 'responseBid',
    title: 'With 13+ and minor support, start with a new suit',
    auctionContext: { stage: 'responding', interference: 'none', openerLevel: 1, openerStrain: 'minor' },
    calls: ['1D', '1H', '1S', '2C'],
    callRefinement: refineToCheapestNewSuitBids, // chooses best suit for minimum response
    callCategory: ['forcing'],
    priority: { rank: 95 },
    appliesWhen: minorSupportNewSuitApplies,
    guidance: ['Five clubs support 1C; four diamonds support 1D.',
               'The new-suit response is forcing absent interference.', 'Plan to raise later.'],
    meaning: 'Start with a forcing new-suit response and plan to show the minor support later.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-minor-w/-weak-jump-shift-modern',
    // Modern weak jump shift after a minor opening: jump in a long new suit with a weak hand.
    kind: 'responseBid',
    title: 'Modern weak jump shift after one of a minor',
    auctionContext: { stage: 'responding', interference: 'none', openerLevel: 1, openerStrain: 'minor' },
    calls: ['2D', '2H', '2S', '3C'],
    callRefinement: refineWeakJumpShift, // choose longest 6+ jump suit; ties higher-ranking
    callCategory: ['signoff', 'natural'],
    agreement: { setting: 'jumpShift', value: 'weak',
                 note: 'Modern weak jump-shift treatment.' },
    priority: { rank: 110, note: 'Configured jump-shift treatment outranks the generic response.' },
    appliesWhen: { hcp: { min: 4, max: 7 } },
    guidance: ['With two equally long 6+ suits, use the higher-ranking suit for a deterministic ' +
               'preemptive choice.'],
    meaning: 'Weak, non-forcing jump shift with a six-card suit; preemptive and passable.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-minor-w/-strong-jump-shift-classic',
    // Classic strong jump shift after a minor opening: jump in long new suit to show points.
    kind: 'responseBid',
    title: 'Classic strong jump shift after one of a minor',
    auctionContext: { stage: 'responding', interference: 'none', openerLevel: 1, openerStrain: 'minor' },
    calls: ['2D', '2H', '2S', '3C'],
    callRefinement: refineStrongJumpShift, // only a good one-suited 5+ hand; not a 5-5 two-suiter
    callCategory: ['gameForcing', 'natural'],
    agreement: { setting: 'jumpShift', value: 'strong',
                 note: 'Classic Standard strong jump-shift treatment.' },
    priority: { rank: 110, note: 'Configured jump-shift treatment outranks the generic response.' },
    appliesWhen: { hcp: { min: 17 } },
    guidance: ['Use a good five-card or longer suit with at least 5 HCP in the suit.',
               'With two 5+ new suits, respond naturally in the higher-ranking suit first and ' +
               'plan to show the lower-ranking suit later.'],
    meaning: 'Classic strong jump shift: game-forcing with a good long suit and slam interest.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-minor-w/-4nt-blackwood',
    // Use 4NT as Blackwood after a minor-suit opening when responder has strong slam values.
    kind: 'responseBid',
    title: 'Use Blackwood with strong slam-going values after a minor opening',
    auctionContext: { stage: 'responding', interference: 'none', openerLevel: 1, openerStrain: 'minor' },
    calls: ['4NT'],
    callCategory: ['forcing', 'conventional'],
    priority: { rank: -100, note: 'Specialized ace asking; deliberately present last.' },
    appliesWhen: { hcp: { min: 20 } },
    guidance: ['Rare and specialized: Blackwood is not a general slam try.',
               'Use it only when the partnership already has enough playing strength to consider ' +
               'slam and ace count is the specific remaining information needed to choose the ' +
               'final contract.'],
    meaning: 'Blackwood is artificial and forcing, asking partner to show aces.',
    certainty: 'high',
  },
  //
  // One-level major response rules match level 1 + major; refiners resolve strain-dependent calls.
  //
  {
    id: 'respond-to-major-w/-support-pass-0-5',
    // Pass a major opening when responder has support but no more than five total points.
    kind: 'responseBid',
    title: 'Pass with support and 0-5',
    auctionContext: { stage: 'responding', openerLevel: 1, openerStrain: 'major' },
    calls: ['Pass'],
    appliesWhen: { totalPoints: { max: 5, valuation: 'shortage' }, supportLength: { min: 3 } },
    meaning: 'Game is unlikely.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-major-w/-pass-0-5',
    // General pass option after a major opening when responder has only 0-5 HCP.
    kind: 'responseBid',
    title: 'Pass one of a major with 0-5',
    auctionContext: { stage: 'responding', openerLevel: 1, openerStrain: 'major' },
    calls: ['Pass'],
    appliesWhen: { hcp: { max: 5 }, supportLength: { max: 2 }, },
    meaning: 'Responder has too few points to bid.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-minor-w/-pass-0-5',
    // Pass a minor opening when responder has only 0-5 HCP.
    kind: 'responseBid',
    title: 'Pass one of a minor with 0-5',
    auctionContext: { stage: 'responding', openerLevel: 1, openerStrain: 'minor' },
    calls: ['Pass'],
    callCategory: ['signoff'],
    appliesWhen: { hcp: { max: 5 } },
    meaning: 'Responder has too few points to bid.',
    certainty: 'high',
  },
  //
  //
  {
    id: 'respond-to-major-w/-support-simple-raise',
    // Min hand with 3-card support, raise partner's major one level with 6-10 total points.
    kind: 'responseBid',
    title: 'Simple raise with 6-10 and major support',
    auctionContext: { stage: 'responding', openerLevel: 1, openerStrain: 'major' },
    calls: ['2H', '2S'],
    callRefinement: refineRaisePartnerSuitBy1, // choose opener's suit
    callCategory: ['invitational'],
    appliesWhen: { totalPoints: { min: 6, max: 10, valuation: 'shortage' },
                   supportLength: { min: 3 } },
    meaning: 'Non-forcing simple raise of partner major; opener may pass or continue.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-major-w/-support-limit-raise-four-card',
    // Jump raise partner's major to the three level with 11-12 support points and 4+-card support.
    kind: 'responseBid',
    title: 'Limit raise with four-card support and 11-12',
    auctionContext: { stage: 'responding', interference: 'none', openerLevel: 1, openerStrain: 'major' },
    calls: ['3H', '3S'],
    callRefinement: refineRaisePartnerSuitBy2, // chooses opener's suit
    callCategory: ['invitational'],
    appliesWhen: { totalPoints: { min: 11, max: 12, valuation: 'shortage' },
                   supportLength: { min: 4 } },
    meaning: 'Invitational jump raise with four-card or longer support; ' +
             'opener bids game with extra values.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-major-w/-support-limit-raise-three-card',
    // Exactly three-card support and 11-12 support points.  With forcing 1NT, use 1NT unless a
    // one-level new suit is available first; later make the invitational raise.
    kind: 'responseBid',
    title: 'Three-card support, 11-12: bid forcing 1NT then raise',
    auctionContext: { stage: 'responding', interference: 'none', openerLevel: 1, openerStrain: 'major' },
    calls: ['1NT'],
    callRefinement: refineThreeCardLimitRaiseOneNtFallback,
    callCategory: ['forcing'],
    agreement: { setting: 'majorOneNtResponse', value: 'forcing',
                 note: 'Forcing 1NT guarantees responder another turn to show the limit raise.' },
    appliesWhen: { totalPoints: { min: 11, max: 12, valuation: 'shortage' },
                   supportLength: { min: 3, max: 3 } },
    guidance: ['After 1H, show four or more spades with 1S before raising hearts later.',
               'Otherwise use 1NT, then make an invitational raise to the three level.'],
    meaning: 'With exactly three-card support and limit-raise values, use forcing 1NT when no ' +
             'one-level new suit takes priority, then raise invitationally.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-major-w/-support-limit-raise-three-card-nonforcing-1nt-fallback',
    // Under the non-forcing/semi-forcing treatment, 1NT remains the catch-all when no one-level new
    // suit can start the three-card limit raise.  Opener may occasionally pass a flat minimum.
    kind: 'responseBid',
    title: 'Three-card support, 11-12: use non-forcing 1NT as the fallback',
    auctionContext: { stage: 'responding', interference: 'none', openerLevel: 1, openerStrain: 'major' },
    calls: ['1NT'],
    callRefinement: refineThreeCardLimitRaiseOneNtFallback,
    callCategory: ['invitational'],
    agreement: { setting: 'majorOneNtResponse', value: 'nonForcing',
                 note: 'Semi-forcing fallback: opener may pass a flat minimum.' },
    appliesWhen: { totalPoints: { min: 11, max: 12, valuation: 'shortage' },
                   supportLength: { min: 3, max: 3 } },
    guidance: ['After 1H, show four or more spades with 1S before raising hearts later.',
               'Otherwise use 1NT as the catch-all; opener may occasionally pass.'],
    meaning: 'With exactly three-card support and limit-raise values, use 1NT when no one-level ' +
             'new suit is available, then invite later if opener continues.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-major-w/-support-limit-raise-three-card-new-suit-first',
    // Exactly three-card support and 11-12 support points: if a one-level new suit is available,
    // show it before making the invitational raise regardless of the partnership's 1NT treatment.
    kind: 'responseBid',
    title: 'Three-card major support, 11-12: bid a one-level new suit then raise',
    auctionContext: { stage: 'responding', interference: 'none', openerLevel: 1, openerStrain: 'major' },
    calls: ['1S'],
    callRefinement: refineThreeCardMajorSupportNewSuitFirst,
    callCategory: ['forcing'],
    appliesWhen: { totalPoints: { min: 11, max: 12, valuation: 'shortage' },
                   supportLength: { min: 3, max: 3 } },
    guidance: ["After 1H, show four or more spades with 1S and later raise opener's hearts."],
    meaning: 'With exactly three-card support and limit-raise values, show an available one-level ' +
             'new suit first, then make the invitational raise.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-major-w/-three-card-support-13plus-bid-new-suit-then-raise',
    // Exactly three-card support and 13+ total points, bid a new suit and later raise to game.
    kind: 'responseBid',
    title: 'With 13+ and three-card major support, bid a new suit then raise to game',
    auctionContext: { stage: 'responding', interference: 'none', openerLevel: 1, openerStrain: 'major' },
    calls: ['1S', '2C', '2D', '2H'],
    callRefinement: refineMajorSupportNewSuitFirst, // makes 3 choices, see below
    callCategory: ['gameForcing'],
    // supportLength: [{ min: 4 }] almost captures normal cases declaratively, but it cannot also
    // express the 5+ heart requirement for 1S-2H and the sometimes three-card-minor fallback when
    // no good 4 or 5 card suit can be bid.  The call refiner therefore owns the candidate-suit
    // length requirements.
    appliesWhen: { totalPoints: { min: 13, valuation: 'shortage' },
                   supportLength: { min: 3, max: 3 } },
    guidance: ['Bid a new suit and then raise to at least game.'],
    meaning: 'Game-forcing support path with three-card support.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-major-w/-four-card-support-13plus-bid-new-suit-then-raise',
    // By agreement, show 4+ major support and 13+ support points by forcing in a new suit first.
    kind: 'responseBid',
    title: 'With 13+ and four-card major support, bid a new suit then raise to game',
    auctionContext: { stage: 'responding', interference: 'none', openerLevel: 1, openerStrain: 'major' },
    calls: ['1S', '2C', '2D', '2H'],
    callRefinement: refineMajorSupportNewSuitFirst, // makes 3 choices, see below
    callCategory: ['gameForcing'],
    agreement: { setting: 'majorGameForceWithSupport', value: 'newSuitThenRaise',
                 note: 'Show game-forcing support by bidding a new suit first, then raising.' },
    // Call refiner checks call candidate suit lengths, possibly falling back to the exceptional
    // three-card-minor fallback.  appliesWhen can't quite express all that.
    appliesWhen: { totalPoints: { min: 13, valuation: 'shortage' },
                   supportLength: { min: 4 } },
    priority: { rank: 80 }, // relative to rule 'respond-to-major-w/-support-splinter' at 95
    guidance: ['Bid a new suit and then raise to at least game.'],
    meaning: 'Game-forcing support path when not using Jacoby 2NT.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-major-w/-support-jacoby-2nt-agreement',
    // Jacoby 2NT agreement: 2NT shows game-forcing values with 4+ support for opener's major.
    kind: 'responseBid',
    title: 'Jacoby 2NT partnership agreement',
    auctionContext: { stage: 'responding', interference: 'none', openerLevel: 1, openerStrain: 'major' },
    calls: ['2NT'],
    callCategory: ['gameForcing', 'conventional'],
    agreement: { setting: 'majorGameForceWithSupport', value: 'jacoby2NT',
                 note: 'Jacoby 2NT is an artificial game-forcing raise with 4+ major support.' },
    appliesWhen: { totalPoints: { min: 13, valuation: 'shortage' }, supportLength: { min: 4 } },
    meaning: 'Jacoby 2NT is an artificial game force showing four-card or longer major support ' +
             'and 13+ points.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-major-w/-support-splinter',
    // splinter: double-jump in short new suit to show 4+ support, game-forcing, and shortness.
    kind: 'responseBid',
    title: 'Show game-forcing major support with a splinter',
    auctionContext: { stage: 'responding', interference: 'none', openerLevel: 1, openerStrain: 'major' },
    calls: ['3S', '4C', '4D', '4H'],
    callRefinement: (calls: Call[], context: RuleEvalContext) : CallRefinementResult => {
      // resolve which declared double jumps are legal over the actual 1H or 1S opening.
      return refineNewSuitByExtraLevels(calls, context, 2, 'double-jump');
    },
    callCategory: ['gameForcing', 'conventional'],
    agreement: { setting: 'splinters', value: true,
                 note: 'Double-jump new suit: 4+ support plus singleton/void in the bid suit.' },
    appliesWhen: { totalPoints: { min: 13, max: 15, valuation: 'shortage' },
                   supportLength: { min: 4 }, suitLengths: [{ max: 1 }] },
    // relative to rule 'respond-to-major-w/-four-card-support-13plus-bid-new-suit-then-raise' at 80
    priority: { rank: 95 },
    meaning: 'Artificial game-forcing double jump showing major support and shortness ' +
             'in the bid suit.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-major-w/-support-preemptive-game-raise',
    // With 5+ card support and fewer than 10 total points, jump to game as a preemptive raise.
    kind: 'responseBid',
    title: 'Preemptively raise partner major to game with five-card support',
    auctionContext: { stage: 'responding', openerLevel: 1, openerStrain: 'major' },
    calls: ['4H', '4S'],
    callRefinement: refineResponderPreemptiveMajorGameRaise,
    callCategory: ['signoff', 'natural'],
    appliesWhen: { totalPoints: { max: 9, valuation: 'shortage' }, supportLength: { min: 5 } },
    meaning: 'Non-forcing preemptive raise to game w/ long support and fewer than 10 total points.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-major-w/o-support-new-suit-one-level',
    // Without support for opener's major, bid an available 4+ card new suit at the one
    // level.
    kind: 'responseBid',
    title: 'Without support, bid a new suit at the one level with 6+',
    auctionContext: { stage: 'responding', interference: 'none', auction: ['1H'], },
    calls: ['1S'],
    callCategory: ['forcing'],
    priority: { rank: 100 },
    appliesWhen: { hcp: { min: 6 }, supportLength: { max: 2 },
                   suitLengths: [{ suit: 'S', min: 4 }] },
    guidance: ["Use a new suit at the one level to show no support for partner's major.",
               'The new-suit response is forcing absent opponent interference.'],
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-major-w/o-support-new-suit-two-level-standard',
    // Natural non-jump new-suit response at the two level after a major opening.
    kind: 'responseBid',
    title: 'Standard new-suit response at the two level',
    auctionContext: { stage: 'responding', interference: 'none', openerLevel: 1, openerStrain: 'major' },
    calls: ['2C', '2D', '2H', ],
    callRefinement: refineMajorTwoLevelNewSuitByLength, // order natural two-level suit choices
    callCategory: ['forcing'],
    agreement: { setting: 'twoLevelNewSuitResponse', value: 'standard',
                 note: 'Standard: 11+ and forcing, but not forcing to game.' },
    priority: { rank: 90 },
    appliesWhen: (call: Call, context: RuleEvalContext): AppliesWhenResult => {
      // Standard treatment: test this candidate suit using the 11+ HCP non-game-forcing threshold.
      return majorTwoLevelNewSuitApplies(call, context, 11, 'Standard');
    },
    meaning: 'Standard two-level new-suit response: forcing, but not forcing to game.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-major-w/o-support-new-suit-two-level-two-over-one',
    // 2/1 treatment for a non-jump two-level new-suit response: natural and game forcing.
    kind: 'responseBid',
    title: '2/1 game-forcing new-suit response at the two level',
    auctionContext: { stage: 'responding', interference: 'none', openerLevel: 1, openerStrain: 'major' },
    calls: ['2C', '2D', '2H', ],
    callRefinement: refineMajorTwoLevelNewSuitByLength, // order natural two-level suit choices
    callCategory: ['gameForcing'],
    agreement: { setting: 'twoLevelNewSuitResponse', value: 'twoOverOne',
                 note: '2/1 treatment: 13+ and game forcing.' },
    priority: { rank: 90 },
    appliesWhen: (call: Call, context: RuleEvalContext): AppliesWhenResult => {
      // 2/1 treatment: use the same candidate-suit checks but require 13+ HCP for a game force.
      return majorTwoLevelNewSuitApplies(call, context, 13, '2/1');
    },
    meaning: 'Two-over-one game force after partner opens a major.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-major-w/o-support-1nt-twooverone',
    // Forcing/semi-forcing 1NT response to a major when responder lacks support and has new-suit.
    kind: 'responseBid',
    title: 'Without support, respond 1NT with 6-12',
    auctionContext: { stage: 'responding', interference: 'none', openerLevel: 1, openerStrain: 'major' },
    calls: ['1NT'],
    callCategory: ['forcing'],
    agreement: { setting: 'majorOneNtResponse', value: 'forcing',
                 note: 'Forcing/semi-forcing 1NT response, commonly paired with 2/1 methods.' },
    appliesWhen: { hcp: { min: 6, max: 12 }, supportLength: { max: 2 } },
    guidance: ['No available preferred suit response.',
               'Forcing if responder has not passed and opponents have not interfered.'],
    meaning: '1NT response to a major in 2/1 style.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-major-w/o-support-1nt-standard',
    // Standard non-forcing 1NT response to a major with 6-10 HCP and no support.
    kind: 'responseBid',
    title: 'Standard style 1NT response to a major',
    auctionContext: { stage: 'responding', interference: 'none', openerLevel: 1, openerStrain: 'major' },
    calls: ['1NT'],
    callCategory: ['invitational'],
    agreement: { setting: 'majorOneNtResponse', value: 'nonForcing',
                 note: 'Standard non-forcing 1NT response to a major.' },
    appliesWhen: { hcp: { min: 6, max: 10 }, supportLength: { max: 2 } },
    meaning: 'Playing Standard, 1NT over a major shows 6-10 and is non-forcing.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-major-w/-3nt-flat-13-15',
    // Partnership treatment: direct 3NT shows a very flat 13-15 HCP hand, normally 4-3-3-3 with
    // exactly three-card support and no four-card other major.
    kind: 'responseBid',
    title: 'Respond 3NT with a very flat 13-15 HCP hand',
    auctionContext: { stage: 'responding', interference: 'none', openerLevel: 1, openerStrain: 'major' },
    calls: ['3NT'],
    callCategory: ['signoff', 'natural'],
    appliesWhen: majorDirectThreeNtApplies,
    guidance: ['This is a partnership treatment for very flat game-going values.',
               'With more control-rich values, starting a forcing support route may be preferable.'],
    meaning: 'Very flat 13-15 HCP game response, normally with three-card support; opener may pass ' +
             'or continue.',
    certainty: 'medium',
  },
  //
  {
    id: 'respond-to-major-w-weak-jump-shift-modern',
    // Modern weak jump shift after a major opening: jump in a 6+ card new suit with 4-7 HCP.
    kind: 'responseBid',
    title: 'Modern weak jump shift after one of a major',
    auctionContext: { stage: 'responding', interference: 'none', openerLevel: 1, openerStrain: 'major' },
    calls: ['2S', '3C', '3D', '3H'],
    callRefinement: refineWeakJumpShift, // choose longest 6+ jump suit; ties higher-ranking
    callCategory: ['signoff', 'natural'],
    agreement: { setting: 'jumpShift', value: 'weak',
                 note: 'Modern weak jump-shift treatment.' },
    priority: { rank: 110, note: 'Configured jump-shift treatment outranks the generic response.' },
    appliesWhen: { hcp: { min: 4, max: 7 }, supportLength: { max: 2 } },
    guidance: ["With three-card or longer support, raise opener's major instead of making a weak " +
               'jump shift.'],
    meaning: 'Weak, non-forcing jump shift with a six-card suit; preemptive and passable.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-major-w/-strong-jump-shift-classic',
    // Classic strong jump shift a good 5+ card new suit with strong values.
    kind: 'responseBid',
    title: 'Classic strong jump shift after one of a major',
    auctionContext: { stage: 'responding', interference: 'none', openerLevel: 1, openerStrain: 'major' },
    calls: ['2S', '3C', '3D', '3H'],
    callRefinement: refineStrongJumpShift, // only a good one-suited 5+ hand; not a 5-5 two-suiter
    callCategory: ['gameForcing', 'natural'],
    agreement: { setting: 'jumpShift', value: 'strong',
                 note: 'Classic Standard strong jump-shift treatment.' },
    priority: { rank: 110, note: 'Configured jump-shift treatment outranks the generic response.' },
    appliesWhen: { hcp: { min: 17 } },
    guidance: ['Use a good five-card or longer suit with at least 5 HCP in the suit.',
               'With two 5+ new suits, respond naturally in the higher-ranking suit first and ' +
               'plan to show the lower-ranking suit later.'],
    meaning: 'Game-forcing strong jump shift showing a good long suit and slam interest.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-major-w/-4nt-blackwood',
    // Use 4NT as Blackwood after a major-suit opening when responder has strong slam-going values.
    kind: 'responseBid',
    title: 'Use Blackwood with strong slam-going values after a major opening',
    auctionContext: { stage: 'responding', interference: 'none', openerLevel: 1, openerStrain: 'major' },
    calls: ['4NT'],
    callCategory: ['forcing', 'conventional'],
    priority: { rank: -100, note: 'Specialized ace asking; deliberately present last.' },
    appliesWhen: { hcp: { min: 20 } },
    guidance: ['Rare and specialized: Blackwood is not a general slam try.',
               'Use it only when the partnership already has enough playing strength to consider ' +
               'slam and ace count is the specific remaining information needed to choose the ' +
               'final contract.'],
    meaning: 'Blackwood is artificial and forcing, asks partner for aces.',
    certainty: 'high',
  },
  //
  // Responding to notrump
  //
  {
    id: 'respond-to-1nt-w/-pass-0-7-balanced',
    // Pass a 1NT opening with a weak balanced hand.
    kind: 'responseBid',
    title: 'Pass 1NT with 0-7 balanced',
    auctionContext: { stage: 'responding', auction: ['1NT'] },
    calls: ['Pass'],
    callCategory: ['signoff'],
    appliesWhen: { hcp: { min: 0, max: 7 }, hcpRelativeToOneNtOpening: true,
                   shape: { balanced: true } },
    guidance: ['15-17: 0-7 HCP; 16-18: 0-6 HCP.'],
    meaning: 'Sign off in 1NT; opener is expected to leave the contract there if no interference.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-1nt-w/-2nt-8-9-invitational',
    // Raise 1NT to 2NT with 8-9 HCP to invite game.  Normally this is a balanced-hand bid;
    // without Stayman or Jacoby transfers, it is the basic natural invitation regardless of shape.
    // See appliesWhen function for explanation of bidding reasoning.
    kind: 'responseBid',
    title: 'Invite game over 1NT with 8-9 HCP',
    auctionContext: { stage: 'responding', auction: ['1NT'] },
    calls: ['2NT'],
    callCategory: ['invitational'],
    appliesWhen: oneNtTwoNtInvitationApplies, // see function for bidding explanation
    guidance: ['15-17: 8-9 HCP; 16-18: 7-8 HCP.'],
    meaning: 'Invitational raise to 2NT.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-1nt-w/-3nt-10-15-balanced',
    // Raise 1NT directly to 3NT with 10-15 balanced HCP to place the contract in game.
    kind: 'responseBid',
    title: 'Bid game over 1NT with 10-15 balanced',
    auctionContext: { stage: 'responding', auction: ['1NT'] },
    calls: ['3NT'],
    callCategory: ['signoff'],
    appliesWhen: { hcp: { min: 10, max: 15 }, hcpRelativeToOneNtOpening: true,
                   shape: { balanced: true } },
    guidance: ['15-17: 10-15 HCP; 16-18: 9-14 HCP.'],
    meaning: 'Place the contract in game.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-1nt-w/-4nt-16-17-balanced',
    // Use quantitative 4NT with 16-17 balanced HCP to invite a small slam; this is not Blackwood.
    kind: 'responseBid',
    title: 'Invite small slam over 1NT with 16-17 balanced',
    auctionContext: { stage: 'responding', auction: ['1NT'] },
    calls: ['4NT'],
    callCategory: ['invitational'],
    appliesWhen: { hcp: { min: 16, max: 17 }, hcpRelativeToOneNtOpening: true,
                   shape: { balanced: true } },
    guidance: ['15-17: 16-17 HCP; 16-18: 15-16 HCP.'],
    meaning: 'Quantitative invitation to small slam.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-1nt-w/-6nt-18-19-balanced',
    // Bid 6NT directly with 18-19 balanced HCP.
    kind: 'responseBid',
    title: 'Bid small slam over 1NT with 18-19 balanced',
    auctionContext: { stage: 'responding', auction: ['1NT'] },
    calls: ['6NT'],
    callCategory: ['signoff'],
    appliesWhen: { hcp: { min: 18, max: 19 }, hcpRelativeToOneNtOpening: true,
                   shape: { balanced: true } },
    guidance: ['15-17: 18-19 HCP; 16-18: 17-18 HCP.'],
    meaning: 'Place the contract in small slam.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-1nt-w/-5nt-20-21-balanced',
    // Use forcing 5NT with 20-21 balanced HCP to invite a grand slam.
    kind: 'responseBid',
    title: 'Invite grand slam over 1NT with 20-21 balanced',
    auctionContext: { stage: 'responding', auction: ['1NT'] },
    calls: ['5NT'],
    callCategory: ['forcing'],
    appliesWhen: { hcp: { min: 20, max: 21 }, hcpRelativeToOneNtOpening: true,
                   shape: { balanced: true } },
    guidance: ['15-17: 20-21 HCP; 16-18: 19-20 HCP.'],
    meaning: 'Forces at least a small slam while inviting opener to bid grand slam with extra values.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-1nt-w/-7nt-22plus-balanced',
    // Bid 7NT directly with 22+ balanced HCP.
    kind: 'responseBid',
    title: 'Bid grand slam over 1NT with 22+ balanced',
    auctionContext: { stage: 'responding', auction: ['1NT'] },
    calls: ['7NT'],
    callCategory: ['signoff'],
    appliesWhen: { hcp: { min: 22 }, hcpRelativeToOneNtOpening: true,
                   shape: { balanced: true } },
    guidance: ['15-17: 22+ HCP; 16-18: 21+ HCP.'],
    meaning: 'Place the contract in grand slam.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-1nt-w/-stayman',
    // Stayman 2C with four-card major to ask opener for a major.
    kind: 'responseBid',
    title: 'Stayman over 1NT',
    auctionContext: { stage: 'responding', auction: ['1NT'] },
    calls: ['2C'],
    agreement: { setting: 'stayman', value: true,
                 note: 'Stayman asks a notrump opener for a four-card major.' },
    callCategory: ['forcing', 'conventional'],
    appliesWhen: { hcp: { min: 8 }, hcpRelativeToOneNtOpening: true,
                   suitLengths: [{ suit: 'major', exact: 4 } ] },
    guidance: ['15-17: 8+ HCP; 16-18: 7+ HCP for ordinary Stayman.',
               'Stayman is artificial and forcing if no intervening bid; opener must respond.',
               'Stayman asks opener for a four-card major.',
               'Can be used even if short in clubs.'],
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-1nt-w/-transfer-to-hearts',
    // Use the 2D Jacoby transfer with a 5+ card heart suit, asking opener to bid 2H.
    kind: 'responseBid',
    title: 'Transfer to hearts over 1NT',
    auctionContext: { stage: 'responding', auction: ['1NT'] },
    calls: ['2D'],
    agreement: { setting: 'jacobyTransfers', value: true,
                 note: 'Jacoby transfer to responder major.' },
    callCategory: ['forcing', 'conventional'],
    appliesWhen: { hcp: { min: 0 }, suitLengths: [{ suit: 'H', min: 5 }] },
    guidance: ['The transfer is artificial and forcing w/o intervening bid; opener normally ' +
               'completes the transfer.',
               'Use transfers to have the partner with the concealed points bid the contract.',
               'With 0-7 HCP over 15-17, or 0-6 over 16-18, transfer with a five-card or ' +
               'longer major and then pass rather ' +
               'than automatically passing 1NT; the major-suit contract may play better.'],
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-1nt-w/-transfer-to-spades',
    // Use the 2H Jacoby transfer with a 5+ card spade suit, asking opener to bid 2S.
    kind: 'responseBid',
    title: 'Transfer to spades over 1NT',
    auctionContext: { stage: 'responding', auction: ['1NT'] },
    calls: ['2H'],
    agreement: { setting: 'jacobyTransfers', value: true,
                 note: 'Jacoby transfer to responder major.' },
    callCategory: ['forcing', 'conventional'],
    appliesWhen: { hcp: { min: 0 }, suitLengths: [{ suit: 'S', min: 5 }] },
    guidance: ['The transfer is artificial and forcing w/o intervening bid; opener normally ' +
               'completes the transfer.',
               'Use transfers to have the partner with the concealed points bid the contract.',
               'With 0-7 HCP over 15-17, or 0-6 over 16-18, transfer with a five-card or ' +
               'longer major and then pass rather ' +
               'than automatically passing 1NT; the major-suit contract may play better.'],
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-1nt-w/-2h-2s-natural-signoff',
    // Without Jacoby transfers, bid a five-card or longer major naturally at the two level to play.
    kind: 'responseBid',
    title: 'Bid two of a major naturally over 1NT with a weak hand',
    auctionContext: { stage: 'responding', auction: ['1NT'] },
    calls: ['2H', '2S'],
    agreement: { setting: 'jacobyTransfers', value: false,
                 note: 'Without Jacoby transfers, 2H and 2S are natural weak signoffs.' },
    callCategory: ['signoff'],
    appliesWhen: { hcp: { min: 0, max: 7 }, hcpRelativeToOneNtOpening: true,
                   suitLengths: [{ min: 5 }] },
    meaning: 'Natural weak signoff in a five-card or longer major.',
    guidance: ['15-17: 0-7 HCP; 16-18: 0-6 HCP.',
               'With a weak hand and a five-card or longer major, prefer the major-suit ' +
               'signoff to automatically passing 1NT.'],
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-1nt-w/-3c-3d-natural-invitational',
    // Bid 3C or 3D naturally with invitational values and a good six-card minor.
    kind: 'responseBid',
    title: '3C or 3D over 1NT with a good six-card minor and invitational values',
    auctionContext: { stage: 'responding', auction: ['1NT'] },
    calls: ['3C', '3D'],
    callCategory: ['invitational', 'natural'],
    priority: { rank: 20, note: 'Prefer the descriptive good minor to the generic 2NT invitation.' },
    appliesWhen: oneNtNaturalMinorInvitationApplies,
    guidance: ['15-17: 8-9 HCP; 16-18: 7-8 HCP.',
               'Good means six or more cards with at least two of A/K/Q.'],
    meaning: 'Invitational natural minor-suit bid asking whether opener has a fitting top honor.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-1nt-w/-4h-4s-natural-game',
    // Without Texas transfers, bid 4H or 4S directly with game values, a 6+ card major, and
    // no four-card other major.  With 6-4 majors, use Stayman first to look for the 4-4 fit.
    kind: 'responseBid',
    title: 'Bid four of a major naturally over 1NT with game values',
    auctionContext: { stage: 'responding', auction: ['1NT'] },
    calls: ['4H', '4S'],
    agreement: { setting: 'texasTransfers', value: false,
                 note: 'Without Texas transfers, bid the long major naturally at game.' },
    callCategory: ['signoff'],
    appliesWhen: { hcp: { min: 10, max: 15 }, hcpRelativeToOneNtOpening: true,
                   suitLengths: [{ min: 6 }],
                   shape: { noFourCardOtherMajor: true } },
    guidance: ['15-17: 10-15 HCP; 16-18: 9-14 HCP.'],
    meaning: 'Natural game signoff with a six-card or longer major.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-1nt-w/-texas-transfer-to-hearts',
    // Texas is the fast game-only route with 6+ hearts when no other major needs exploration.
    // With 6-4 majors start with Stayman; with two 5+ majors use the lower-level transfer route.
    kind: 'responseBid',
    title: 'Texas transfer to hearts over 1NT',
    auctionContext: { stage: 'responding', auction: ['1NT'] },
    calls: ['4D'],
    callCategory: ['gameForcing', 'conventional'],
    agreement: { setting: 'texasTransfers', value: true,
                 note: '4D asks opener to bid 4H.' },
    appliesWhen: { hcp: { min: 10, max: 15 }, hcpRelativeToOneNtOpening: true,
                   // can't use noFourCardOtherMajor because 4D is not 4H which maps to four spades
                   suitLengths: [{ suit: 'H', min: 6 }, { suit: 'S', max: 3 }] },
    guidance: ['15-17: 10-15 HCP; 16-18: 9-14 HCP.'],
    meaning: 'Texas transfer asks opener to bid 4H.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-1nt-w/-texas-transfer-to-spades',
    // Texas is the fast game-only route with 6+ spades when no other major needs exploration.
    // With 6-4 majors start with Stayman; with two 5+ majors use the lower-level transfer route.
    kind: 'responseBid',
    title: 'Texas transfer to spades over 1NT',
    auctionContext: { stage: 'responding', auction: ['1NT'] },
    calls: ['4H'],
    callCategory: ['gameForcing', 'conventional'],
    agreement: { setting: 'texasTransfers', value: true,
                 note: '4H asks opener to bid 4S.' },
    appliesWhen: { hcp: { min: 10, max: 15 }, hcpRelativeToOneNtOpening: true,
                   // can't use noFourCardOtherMajor because artificial 4H would check spades
                   suitLengths: [{ suit: 'S', min: 6 }, { suit: 'H', max: 3 }] },
    guidance: ['15-17: 10-15 HCP; 16-18: 9-14 HCP.'],
    meaning: 'Texas transfer asks opener to bid 4S.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-1nt-w/-3h-3s-natural-forcing',
    // Without Jacoby transfers, bid a five-card or longer major naturally at the three level
    // with game-forcing values.
    kind: 'responseBid',
    title: 'Bid three of a major naturally over 1NT with game-forcing values',
    auctionContext: { stage: 'responding', auction: ['1NT'] },
    calls: ['3H', '3S'],
    agreement: { setting: 'jacobyTransfers', value: false,
                 note: 'Without Jacoby transfers, a direct 3H or 3S is natural and game forcing.' },
    callCategory: ['gameForcing'],
    appliesWhen: { hcp: { min: 10 }, hcpRelativeToOneNtOpening: true,
                   suitLengths: [{ min: 5 }] },
    guidance: ['15-17: 10+ HCP; 16-18: 9+ HCP.'],
    meaning: 'Natural game-forcing major-suit response.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-1nt-w/-3h-3s-slam-interest',
    // With Jacoby transfers available, reserve a direct 3H or 3S for slam interest with a
    // 6+ card major and no four-card other major.  With 6-4 majors, use Stayman first to
    // look for the possible 4-4 fit.
    kind: 'responseBid',
    title: '3H or 3S over 1NT with slam interest',
    auctionContext: { stage: 'responding', auction: ['1NT'] },
    calls: ['3H', '3S'],
    agreement: { setting: 'jacobyTransfers', value: true,
                 note: 'With transfers available, direct 3H and 3S retain the strong treatment.' },
    callCategory: ['gameForcing'],
    appliesWhen: { hcp: { min: 16 }, hcpRelativeToOneNtOpening: true,
                   suitLengths: [{ min: 6 }],
                   // important to leave open 4 card major, might be better than 6 card major
                   shape: { noFourCardOtherMajor: true } },
    guidance: ['15-17: 16+ HCP; 16-18: 15+ HCP.'],
    meaning: 'Natural game-forcing major-suit bid with slam interest.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-1nt-w/-4c-gerber',
    // Use 4C as Gerber after 1NT to ask opener for aces with slam-going values.
    kind: 'responseBid',
    title: 'Gerber over 1NT',
    auctionContext: { stage: 'responding', auction: ['1NT'] },
    calls: ['4C'],
    callCategory: ['forcing', 'conventional'],
    priority: { rank: -100, note: 'Specialized ace asking; deliberately present last.' },
    appliesWhen: { hcp: { min: 18 } },
    guidance: ['18+ HCP remains a specialized indicative threshold under either 1NT range.',
               'Rare and specialized: Gerber is not a general slam try.',
               'Use it only when the partnership already has enough playing strength to consider ' +
               'slam and ace count is the specific remaining information needed to choose the ' +
               'final contract.'],
    meaning: 'Gerber is artificial and forcing, asking the notrump opener to show aces.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-2nt-w/-pass-0-3',
    // Pass a 2NT opening with 0-3 HCP when no useful conventional response takes precedence.
    kind: 'responseBid',
    title: 'Pass 2NT with 0-3 HCP',
    auctionContext: { stage: 'responding', auction: ['2NT'] },
    calls: ['Pass'],
    callCategory: ['signoff'],
    appliesWhen: { hcp: { min: 0, max: 3 } },
    guidance: ['Distribution alone does not rule out Pass with 0-3 HCP.',
               'When a preferred Jacoby transfer qualifies, it takes precedence over Pass.'],
    meaning: 'Sign off in 2NT; opener is expected to leave the contract there absent interference.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-2nt-w/-3nt-4-10',
    // With 4-10 HCP, 3NT is the ordinary game destination when no preferred suit response applies.
    kind: 'responseBid',
    title: 'Bid 3NT over 2NT with ordinary game values',
    auctionContext: { stage: 'responding', auction: ['2NT'] },
    calls: ['3NT'],
    callCategory: ['signoff', 'natural'],
    appliesWhen: { hcp: { min: 4, max: 10 } },
    guidance: ['A qualifying Stayman, transfer, natural major, or strong natural minor route ' +
               'takes precedence over this notrump fallback.'],
    meaning: 'Place the contract in 3NT when no preferred suit response is available.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-2nt-w/-3c-natural-forcing',
    // With Stayman disabled, 3C can recover a natural descriptive meaning for a strong long club suit.
    kind: 'responseBid',
    title: 'Bid 3C naturally over 2NT with a strong unbalanced club hand',
    auctionContext: { stage: 'responding', auction: ['2NT'] },
    calls: ['3C'],
    agreement: { setting: 'stayman', value: false,
                 note: 'Without Stayman, 3C is available as a natural forcing club response.' },
    callCategory: ['gameForcing', 'natural'],
    priority: { rank: 25 },
    appliesWhen: twoNtNaturalMinorForcingApplies,
    meaning: 'Natural 5+ clubs with 10+ HCP and an unbalanced hand; forcing to game.',
    guidance: ['Use the normal notrump ladder with a balanced hand, and prefer an available ' +
               'major-suit route before describing the minor.'],
    certainty: 'medium',
  },
  //
  {
    id: 'respond-to-2nt-w/-3d-natural-forcing',
    // With Jacoby transfers disabled, 3D can recover a natural descriptive meaning for diamonds.
    kind: 'responseBid',
    title: 'Bid 3D naturally over 2NT with a strong unbalanced diamond hand',
    auctionContext: { stage: 'responding', auction: ['2NT'] },
    calls: ['3D'],
    agreement: { setting: 'jacobyTransfers', value: false,
                 note: 'Without Jacoby transfers, 3D is available as a natural forcing diamond response.' },
    callCategory: ['gameForcing', 'natural'],
    priority: { rank: 25 },
    appliesWhen: twoNtNaturalMinorForcingApplies,
    meaning: 'Natural 5+ diamonds with 10+ HCP and an unbalanced hand; forcing to game.',
    guidance: ['Use the normal notrump ladder with a balanced hand, and prefer an available ' +
               'major-suit route before describing the minor.'],
    certainty: 'medium',
  },
  //
  {
    id: 'respond-to-2nt-w/-4h-4s-natural-game',
    // Without Texas transfers, bid 4H or 4S directly with game values, a 6+ card major, and
    // no four-card other major.  With 6-4 majors, use Stayman first to look for the 4-4 fit.
    kind: 'responseBid',
    title: 'Bid four of a major naturally over 2NT with game values',
    auctionContext: { stage: 'responding', auction: ['2NT'] },
    calls: ['4H', '4S'],
    callRefinement: refineNaturalMajorGameOver2Nt,
    agreement: { setting: 'texasTransfers', value: false,
                 note: 'Without Texas transfers, bid the long major naturally at game.' },
    callCategory: ['signoff'],
    appliesWhen: { hcp: { min: 4, max: 10 }, suitLengths: [{ suit: 'major', min: 6 }],
                   shape: { noFourCardOtherMajor: true } },
    meaning: 'Natural game signoff with a six-card or longer major.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-2nt-w/-texas-transfer-to-hearts',
    // Texas is the fast game-only route with 6+ hearts when no other major needs exploration.
    // With 6-4 majors start with Stayman; with two 5+ majors use the lower-level transfer route.
    kind: 'responseBid',
    title: 'Texas transfer to hearts over 2NT',
    auctionContext: { stage: 'responding', auction: ['2NT'] },
    calls: ['4D'],
    callCategory: ['gameForcing', 'conventional'],
    agreement: { setting: 'texasTransfers', value: true,
                 note: '4D asks opener to bid 4H.' },
    appliesWhen: { hcp: { min: 4, max: 10 },
                   // can't use noFourCardOtherMajor because 4D is not 4H which maps to four spades
                   suitLengths: [{ suit: 'H', min: 6 }, { suit: 'S', max: 3 }] },
    meaning: 'Texas transfer asks opener to bid 4H.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-2nt-w/-texas-transfer-to-spades',
    // Texas is the fast game-only route with 6+ hearts when no other major needs exploration.
    // With 6-4 majors start with Stayman; with two 5+ majors use the lower-level transfer route.
    kind: 'responseBid',
    title: 'Texas transfer to spades over 2NT',
    auctionContext: { stage: 'responding', auction: ['2NT'] },
    calls: ['4H'],
    callCategory: ['gameForcing', 'conventional'],
    agreement: { setting: 'texasTransfers', value: true,
                 note: '4H asks opener to bid 4S.' },
    appliesWhen: { hcp: { min: 4, max: 10 },
                   // can't use noFourCardOtherMajor because artificial 4H would check spades
                   suitLengths: [{ suit: 'S', min: 6 }, { suit: 'H', max: 3 }] },
    meaning: 'Texas transfer asks opener to bid 4S.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-2nt-w/-4c-gerber',
    // Use 4C as Gerber after 2NT to ask opener for aces with 13+ HCP.
    kind: 'responseBid',
    title: 'Gerber over 2NT',
    auctionContext: { stage: 'responding', auction: ['2NT'] },
    calls: ['4C'],
    callCategory: ['forcing', 'conventional'],
    priority: { rank: -100, note: 'Specialized ace asking; deliberately present last.' },
    appliesWhen: { hcp: { min: 13 } },
    guidance: ['Rare and specialized: Gerber is not a general slam try.',
               'Use it only when the partnership already has enough playing strength to consider ' +
               'slam and ace count is the specific remaining information needed to choose the ' +
               'final contract.'],
    meaning: 'Gerber is artificial and forcing, asking the notrump opener to show aces.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-2nt-w/-4nt-11-12-balanced',
    // Use quantitative 4NT over 2NT with 11-12 balanced HCP to invite a small slam.
    kind: 'responseBid',
    title: 'Invite slam over 2NT with 11-12 balanced',
    auctionContext: { stage: 'responding', auction: ['2NT'] },
    calls: ['4NT'],
    callCategory: ['invitational'],
    appliesWhen: { hcp: { min: 11, max: 12 }, shape: { balanced: true } },
    meaning: 'Invite opener to bid slam.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-2nt-w/-6nt-13-15-balanced',
    // Bid 6NT directly over 2NT with 13-15 balanced HCP.
    kind: 'responseBid',
    title: 'Bid 6NT over 2NT with 13-15 balanced',
    auctionContext: { stage: 'responding', auction: ['2NT'] },
    calls: ['6NT'],
    callCategory: ['signoff'],
    appliesWhen: { hcp: { min: 13, max: 15 }, shape: { balanced: true } },
    meaning: 'Small slam in notrump.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-2nt-w/-5nt-16-balanced',
    // Use forcing 5NT over 2NT with exactly 16 balanced HCP to invite a grand slam.
    kind: 'responseBid',
    title: 'Invite grand slam over 2NT with 16 balanced',
    auctionContext: { stage: 'responding', auction: ['2NT'] },
    calls: ['5NT'],
    callCategory: ['forcing'],
    appliesWhen: { hcp: { min: 16, max: 16 }, shape: { balanced: true } },
    meaning: 'Forces at least a small slam while inviting grand slam if opener has extra values.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-2nt-w/-7nt-17plus-balanced',
    // Bid 7NT directly over 2NT with 17+ balanced HCP.
    kind: 'responseBid',
    title: 'Bid grand slam over 2NT with 17+ balanced',
    auctionContext: { stage: 'responding', auction: ['2NT'] },
    calls: ['7NT'],
    callCategory: ['signoff'],
    appliesWhen: { hcp: { min: 17 }, shape: { balanced: true } },
    meaning: 'Place the contract in grand slam.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-2nt-w/-stayman',
    // Use 3C Stayman over 2NT with 4+ HCP and at least one four-card major.
    kind: 'responseBid',
    title: 'Stayman over 2NT',
    auctionContext: { stage: 'responding', auction: ['2NT'] },
    calls: ['3C'],
    agreement: { setting: 'stayman', value: true,
                 note: 'Stayman asks a notrump opener for a four-card major.' },
    callCategory: ['forcing', 'conventional'],
    appliesWhen: { hcp: { min: 4 }, suitLengths: [{ suit: 'major', exact: 4 }] },
    guidance: ['Stayman is artificial and forcing absent interference; opener must respond.'],
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-2nt-w/-transfer-to-hearts',
    // Use 3D as a Jacoby transfer over 2NT with a 5+ card heart suit.
    kind: 'responseBid',
    title: 'Transfer to hearts over 2NT',
    auctionContext: { stage: 'responding', auction: ['2NT'] },
    calls: ['3D'],
    agreement: { setting: 'jacobyTransfers', value: true,
                 note: 'Jacoby transfer to responder major.' },
    callCategory: ['forcing', 'conventional'],
    appliesWhen: { hcp: { min: 0 }, suitLengths: [{ suit: 'H', min: 5 }] },
    guidance: ['The transfer is artificial and forcing absent interference; opener normally ' +
               'completes the transfer.',
               'Use transfers to have the partner with the concealed points bid the contract.'],
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-2nt-w/-transfer-to-spades',
    // Use 3H as a Jacoby transfer over 2NT with a 5+ card spade suit.
    kind: 'responseBid',
    title: 'Transfer to spades over 2NT',
    auctionContext: { stage: 'responding', auction: ['2NT'] },
    calls: ['3H'],
    agreement: { setting: 'jacobyTransfers', value: true,
                 note: 'Jacoby transfer to responder major.' },
    callCategory: ['forcing', 'conventional'],
    appliesWhen: { hcp: { min: 0 }, suitLengths: [{ suit: 'S', min: 5 }] },
    guidance: ['The transfer is artificial and forcing absent interference; opener normally ' +
               'completes the transfer.',
               'Use transfers to have the partner with the concealed points bid the contract.'],
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-2nt-w/-3h-3s-natural-forcing',
    // Without Jacoby transfers, bid a five-card or longer major naturally at the three level
    // with enough strength to force to game opposite a 20-21 HCP 2NT opening.
    kind: 'responseBid',
    title: 'Bid three of a major naturally over 2NT with game-forcing values',
    auctionContext: { stage: 'responding', auction: ['2NT'] },
    calls: ['3H', '3S'],
    agreement: { setting: 'jacobyTransfers', value: false,
                 note: 'Without Jacoby transfers, a direct 3H or 3S is natural and game forcing.' },
    callCategory: ['gameForcing'],
    appliesWhen: { hcp: { min: 4 }, suitLengths: [{ min: 5 }] },
    meaning: 'Natural game-forcing major-suit response.',
    certainty: 'high',
  },
  //
  // Responses to the artificial strong 2C opening.  2D is a waiting response; immediate positive
  // responses show about 8+ HCP and either a good 5+ suit or a balanced hand.
  //
  {
    id: 'respond-to-2c-w/-2d-waiting',
    kind: 'responseBid',
    title: 'Respond 2D as the artificial waiting bid after strong 2C',
    auctionContext: { stage: 'responding', openerCalls: ['2C'] },
    calls: ['2D'],
    callCategory: ['forcing', 'conventional'],
    priority: { rank: -10, note: 'Waiting remains available behind more descriptive positive responses.' },
    appliesWhen: { hcp: { min: 0 } },
    meaning: 'Artificial waiting response; responder can describe strength and distribution later.',
    guidance: ['2D does not show weakness; it is available with any responder strength or shape.',
               'With about 8+ HCP, a good 5+ suit or a balanced 2NT response can describe the hand ' +
               'immediately instead.'],
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-2c-w/-positive-suit',
    kind: 'responseBid',
    title: 'Make an immediate positive suit response after strong 2C',
    auctionContext: { stage: 'responding', openerCalls: ['2C'] },
    calls: ['2H', '2S', '3C', '3D'],
    callRefinement: refineStrongTwoCPositiveSuitResponse,
    callCategory: ['gameForcing', 'natural'],
    priority: { rank: 20, note: 'Prefer a descriptive positive suit response to the waiting bid.' },
    appliesWhen: { hcp: { min: 8 } },
    meaning: 'Positive natural response showing about 8+ HCP and a good five-card-or-longer suit.',
    guidance: ["Good suit uses the app's shared executable quality test: at least two of A/K/Q " +
               'or at least three of A/K/Q/J/T.',
               'An immediate positive response commits the partnership to game.'],
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-2c-w/-2nt-positive-balanced',
    kind: 'responseBid',
    title: 'Respond 2NT positively after strong 2C with a balanced hand',
    auctionContext: { stage: 'responding', openerCalls: ['2C'] },
    calls: ['2NT'],
    callCategory: ['gameForcing', 'natural'],
    priority: { rank: 10, note: 'The source labels this positive balanced response as relatively rare.' },
    appliesWhen: { hcp: { min: 8 }, shape: { balanced: true } },
    meaning: 'Positive balanced response showing about 8+ HCP.',
    guidance: ["Balanced means the app's ordinary 4-3-3-3, 4-4-3-2, or 5-3-3-2 shapes; no " +
               'additional qualification is imposed.'],
    certainty: 'high',
  },
  //
  // Responses to weak preemptive openings.  The app models the structural parts of the chosen
  // treatment and leaves direct game placement that depends only on playing-trick judgment in
  // guidance rather than inventing an HCP threshold.
  //
  {
    id: 'respond-to-weak-two-w/-pass',
    kind: 'responseBid',
    title: 'Pass a weak two without game interest or a fit',
    auctionContext: { stage: 'responding', openerCalls: ['2D', '2H', '2S'] },
    calls: ['Pass'],
    callCategory: ['signoff'],
    appliesWhen: weakTwoPassApplies, // Guideline of 17 below 17 and at most two trumps
    meaning: 'No game investigation and no useful fit; leave the weak two in place.',
    guidance: ['The Guideline of 17 is only a rough check; actual playing tricks can override it.'],
    certainty: 'high',
  },
  {
    id: 'respond-to-weak-two-w/-raise-to-three',
    kind: 'responseBid',
    title: 'Further a weak two to the three level with three-card support',
    auctionContext: { stage: 'responding', openerCalls: ['2D', '2H', '2S'] },
    calls: ['3D', '3H', '3S'],
    callRefinement: (calls, context) => refineRaiseToLevel(calls, context, 3),
    callCategory: ['signoff', 'natural'],
    appliesWhen: weakTwoSimpleRaiseApplies, // exactly three trumps, no Rule-of-17 game interest
    meaning: 'Preemptive raise based on nine combined trumps; opener is expected to pass.',
    guidance: ['Raises of a weak two are non-forcing; 2NT and new-suit responses are forcing.'],
    certainty: 'high',
  },
  {
    id: 'respond-to-weak-two-w/-raise-to-four',
    kind: 'responseBid',
    title: 'Raise a weak two to the four level with four-card-or-longer support',
    auctionContext: { stage: 'responding', openerCalls: ['2D', '2H', '2S'] },
    calls: ['4D', '4H', '4S'],
    callRefinement: (calls, context) => refineRaiseToLevel(calls, context, 4),
    callCategory: ['signoff', 'natural'],
    appliesWhen: weakTwoFourLevelRaiseApplies, // 4+ support gives at least ten combined trumps
    meaning: 'Further the preempt to the four level; in a major this may also be the game contract.',
    guidance: ['This call can be based on the known ten-card fit or on an expectation of making game.',
               'The app does not estimate playing tricks for direct game placement.'],
    certainty: 'high',
  },
  {
    id: 'respond-to-weak-two-w/-2nt-inquiry',
    kind: 'responseBid',
    title: 'Ask for more information with forcing 2NT after a weak two',
    auctionContext: { stage: 'responding', openerCalls: ['2D', '2H', '2S'] },
    calls: ['2NT'],
    callCategory: ['forcing', 'conventional'],
    appliesWhen: guidelineOf17Applies, // HCP + cards in opener's suit >= 17 is the rough game-interest test
    meaning: 'Artificial inquiry asking opener to describe minimum/maximum strength and features.',
    guidance: ['The Guideline of 17 is a rough trigger for investigating game, not a playing-trick ' +
               'calculator.  Controls, fit, honor location, and vulnerability still matter.'],
    certainty: 'high',
  },
  {
    id: 'respond-to-weak-two-w/-new-suit-forcing',
    kind: 'responseBid',
    title: 'Bid a good new suit forcing after a weak two',
    auctionContext: { stage: 'responding', openerCalls: ['2D', '2H', '2S'] },
    calls: ['2H', '2S', '3C', '3D', '3H', '3S'],
    callRefinement: refineWeakTwoNewSuitResponse, // good 5+ suit at the cheapest legal level
    callCategory: ['forcing', 'natural'],
    appliesWhen: guidelineOf17Applies, // use the same rough game-interest check as the 2NT inquiry
    meaning: 'Natural new suit, forcing one round, showing a good five-card-or-longer suit.',
    guidance: ['Use only with game interest; the Guideline of 17 is a rough executable guide rather ' +
               'than an estimate of actual playing tricks.'],
    certainty: 'high',
  },
  {
    id: 'respond-to-three-level-preempt-w/-pass',
    kind: 'responseBid',
    title: 'Pass a three-level preempt without a fit when game is not expected',
    auctionContext: { stage: 'responding', openerLevel: 3, openerStrain: 'suit' },
    calls: ['Pass'],
    callCategory: ['signoff'],
    appliesWhen: threeLevelPreemptPassApplies, // structural check only; playing tricks remain judgment
    meaning: 'With two or fewer trumps and no judged game, leave opener at the three level.',
    guidance: ['The app does not estimate playing tricks.  Direct 3NT or another game can be right ' +
               'when you judge that the partnership can take the required tricks.'],
    certainty: 'medium',
  },
  {
    id: 'respond-to-three-level-preempt-w/-raise-to-four',
    kind: 'responseBid',
    title: 'Further a three-level preempt with three-card-or-longer support',
    auctionContext: { stage: 'responding', openerLevel: 3, openerStrain: 'suit' },
    calls: ['4C', '4D', '4H', '4S'],
    callRefinement: (calls, context) => refineRaiseToLevel(calls, context, 4),
    callCategory: ['signoff', 'natural'],
    appliesWhen: threeLevelPreemptRaiseApplies, // 3+ support gives at least ten combined trumps
    meaning: 'Raise to the four level on the known ten-card-or-longer fit.',
    guidance: ['In a major this can also be a game contract; playing-trick judgment can justify ' +
               'game even without the trump-count rationale.'],
    certainty: 'high',
  },
  {
    id: 'respond-to-three-level-preempt-w/-new-suit-forcing',
    kind: 'responseBid',
    title: 'Bid a long new suit below game after a three-level preempt',
    auctionContext: { stage: 'responding', openerLevel: 3, openerStrain: 'suit' },
    calls: ['3D', '3H', '3S', '4C', '4D'],
    callRefinement: refineThreeLevelPreemptNewSuitResponse, // cheapest good 5+/6+ suit below game
    callCategory: ['forcing', 'natural'],
    meaning: 'Natural new suit below game, forcing one round and showing game interest.',
    guidance: ['The app checks suit length and quality but does not estimate the playing tricks ' +
               'needed to decide whether the hand truly has game interest.'],
    certainty: 'medium',
  },
  //
  // Respond after interference
  // Direct responses after a natural, non-jump opponent suit overcall.  These meanings are
  // independent of the uncontested 2/1, jump-shift, Jacoby 2NT, and support-route agreements.
  //
  {
    id: 'respond-over-suit-negative-double',
    kind: 'responseBid',
    title: 'Negative double with values and unbid-major holdings',
    auctionContext: { stage: 'responding', openerLevel: 1, openerStrain: 'suit',
                      interference: 'suitOvercall' },
    calls: ['Double'],
    callCategory: ['forcing', 'conventional'],
    appliesWhen: responderNegativeDoubleAfterOvercallApplies,
    priority: { rank: 100 },
    meaning: 'Informational negative double: strength to compete and suitable unbid suits.',
    guidance: ['This is a negative (takeout-oriented) double, never a penalty-double rule.',
               'Modeled after non-jump suit overcalls at levels one and two; jump preempts follow later.'],
    certainty: 'high',
  },
  //
  {
    id: 'respond-over-suit-new-suit-one-level',
    kind: 'responseBid',
    title: 'Natural forcing one-level new suit after an overcall',
    auctionContext: { stage: 'responding', openerLevel: 1, openerStrain: 'suit',
                      interference: 'suitOvercall' },
    calls: ['1D', '1H', '1S'],
    callRefinement: refineResponderNewSuitAfterOvercall,
    callCategory: ['forcing', 'natural'],
    appliesWhen: { hcp: { min: 6 } },
    priority: { rank: 90 },
    meaning: 'Natural one-level new suit, forcing one round: normally five cards, except after ' +
             'a minor opening and a 1D overcall, where four cards in a major suffice.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-over-suit-new-suit-two-level',
    kind: 'responseBid',
    title: 'Natural forcing two-level new suit after a suit overcall',
    auctionContext: { stage: 'responding', openerLevel: 1, openerStrain: 'suit',
                      interference: 'suitOvercall' },
    calls: ['2C', '2D', '2H', '2S'],
    callRefinement: refineResponderNewSuitAfterOvercall,
    callCategory: ['forcing', 'natural'],
    appliesWhen: { hcp: { min: 10 } },
    priority: { rank: 85 },
    meaning: 'Five-card or longer new suit with 10+ HCP; forcing one round, not automatically ' +
             'forcing to game even when playing a 2/1 system.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-over-suit-new-suit-three-level',
    kind: 'responseBid',
    title: 'Natural game-forcing three-level new suit after a two-level overcall',
    auctionContext: { stage: 'responding', openerLevel: 1, openerStrain: 'suit',
                      interference: 'suitOvercall' },
    calls: ['3C', '3D', '3H', '3S'],
    callRefinement: refineResponderNewSuitAfterOvercall,
    callCategory: ['gameForcing', 'natural'],
    appliesWhen: { hcp: { min: 13 } },
    meaning: 'Five-card or longer new suit at three level, when that is the cheapest available ' +
             'bid in the strain, showing game-going values.',
    certainty: 'medium',
  },
  //
  {
    id: 'respond-over-suit-preemptive-jump-raise',
    kind: 'responseBid',
    title: 'Preemptively jump-raise partner suit after interference',
    auctionContext: { stage: 'responding', openerLevel: 1, openerStrain: 'suit',
                      interference: 'suitOvercall' },
    calls: ['3C', '3D', '3H', '3S'],
    callRefinement: (calls: Call[], context: RuleEvalContext): CallRefinementResult =>
      refineResponderRaiseAfterOvercall(calls, context, 3, true),
    callCategory: ['natural', 'signoff'],
    appliesWhen: { totalPoints: { max: 9, valuation: 'shortage' },
                   supportLength: { min: 4 } },
    meaning: 'Preemptive jump raise with at least four-card support and fewer than 10 ' +
             'shortage-adjusted points; not an invitational limit raise.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-over-suit-support-cuebid',
    kind: 'responseBid',
    title: 'Cuebid opponent suit to show invitational-or-better support',
    auctionContext: { stage: 'responding', openerLevel: 1, openerStrain: 'suit',
                      interference: 'suitOvercall' },
    calls: ['2C', '2D', '2H', '2S', '3C', '3D', '3H', '3S'],
    callRefinement: refineResponderCuebidAfterOvercall,
    callCategory: ['forcing', 'conventional'],
    appliesWhen: responderCuebidAfterOvercallApplies,
    priority: { rank: 100 },
    meaning: 'Artificial cuebid in opponent suit shows a limit raise or stronger support.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-over-suit-natural-notrump',
    kind: 'responseBid',
    title: 'Natural balanced notrump response with stopper in opponent suit',
    auctionContext: { stage: 'responding', openerLevel: 1, openerStrain: 'suit',
                      interference: 'suitOvercall' },
    calls: ['1NT', '2NT', '3NT'],
    callCategory: ['natural'],
    appliesWhen: responderNotrumpAfterOvercallApplies,
    meaning: 'Natural balanced 1NT (6-10), 2NT (11-12), or 3NT (13-15), with a stopper ' +
             'in the opponent suit.  Not Jacoby or forcing 1NT.',
    certainty: 'high',
  },
  //
  // After a takeout double, one-level new suits remain forcing, but ordinary two-level
  // new suits and jump shifts are weak/nonforcing. Jordan 2NT is not Jacoby or natural NT.
  //
  {
    id: 'respond-after-double-redouble-values',
    kind: 'responseBid',
    title: 'Redouble to show 10+ HCP after an opponent takeout double',
    auctionContext: { stage: 'responding', openerLevel: 1, openerStrain: 'suit',
                      interference: 'takeoutDouble' },
    calls: ['Redouble'],
    callCategory: ['conventional'],
    appliesWhen: { hcp: { min: 10 } },
    priority: { rank: 70 },
    meaning: 'Strength-showing Redouble with 10+ HCP; it neither promises nor denies support ' +
             'for opener, and does not require opener to rebid.',
    guidance: ['A descriptive one-level new suit or Jordan 2NT may also qualify.',
               'Some Jordan partnerships treat Redouble as denying three-card major support; ' +
               'this trainer deliberately keeps both strength-showing options available.',
               'Later penalty-double decisions are outside the trainer; this first response ' +
               'only teaches the strength meaning.'],
    certainty: 'high',
  },
  //
  {
    id: 'respond-after-double-jordan-2nt-support',
    kind: 'responseBid',
    title: 'Jordan 2NT: limit raise or better after a takeout double',
    auctionContext: { stage: 'responding', openerLevel: 1, openerStrain: 'suit',
                      interference: 'takeoutDouble' },
    calls: ['2NT'],
    callCategory: ['forcing', 'conventional'],
    appliesWhen: responderJordanTwoNtAfterDoubleApplies,
    priority: { rank: 95 },
    meaning: 'Artificial Jordan 2NT, showing limit-raise-or-better support: 10+ shortage-adjusted ' +
             'points and 3+ major, 4+ diamond, or 5+ club support.',
    guidance: ['The minor-suit treatment and exact point floor are partnership agreements. ' +
               'This trainer uses the specified support lengths and 10+ support points.',
               'Support points combine HCP with appropriate shortage points. A hand may qualify ' +
               'with fewer than 10 HCP when its shortage-adjusted total reaches 10.',
               'Redouble remains visible with 10+ HCP; Jordan is not the only strength-showing call.'],
    certainty: 'medium',
  },
  //
  {
    id: 'respond-after-double-new-suit-one-level',
    kind: 'responseBid',
    title: 'Natural forcing new suit at one level after a takeout double',
    auctionContext: { stage: 'responding', openerLevel: 1, openerStrain: 'suit',
                      interference: 'takeoutDouble' },
    calls: ['1D', '1H', '1S'],
    callRefinement: refineToCheapestNewSuitBids,
    callCategory: ['forcing', 'natural'],
    appliesWhen: { hcp: { min: 6 }, suitLengths: [{ min: 4 }] },
    priority: { rank: 100 },
    meaning: 'A natural four-card-or-longer new suit at the one level, forcing one round; ' +
             'does not deny 10+ HCP.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-after-double-new-suit-two-level',
    kind: 'responseBid',
    title: 'Natural nonforcing two-level new suit after a takeout double',
    auctionContext: { stage: 'responding', openerLevel: 1, openerStrain: 'suit',
                      interference: 'takeoutDouble' },
    calls: ['2C', '2D', '2H', '2S'],
    callRefinement: refineToCheapestNewSuitBids,
    callCategory: ['natural'],
    appliesWhen: responderWeakTwoLevelNewSuitApplies,
    priority: { rank: 65 },
    meaning: 'Nonforcing new suit at two level: 5-9 HCP and a good six-card suit, ' +
             'rather than uncontested 2/1 forcing values.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-after-double-weak-jump-shift',
    kind: 'responseBid',
    title: 'Weak jump shift after a takeout double',
    auctionContext: { stage: 'responding', openerLevel: 1, openerStrain: 'suit',
                      interference: 'takeoutDouble' },
    calls: ['2D', '2H', '2S', '3C', '3D', '3H', '3S'],
    callRefinement: refineWeakJumpShift,
    callCategory: ['signoff', 'natural'],
    appliesWhen: { hcp: { min: 4, max: 7 } },
    priority: { rank: 60 },
    meaning: 'Weak, nonforcing jump into a six-card-or-longer new suit; not the ' +
             'uncontested strong-jump-shift agreement.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-after-double-weak-jump-raise',
    kind: 'responseBid',
    title: 'Weak preemptive jump raise after a takeout double',
    auctionContext: { stage: 'responding', openerLevel: 1, openerStrain: 'suit',
                      interference: 'takeoutDouble' },
    calls: ['3C', '3D', '3H', '3S'],
    callRefinement: refineRaisePartnerSuitBy2,
    callCategory: ['signoff', 'natural'],
    appliesWhen: responderWeakJumpRaiseAfterInterferenceApplies,
    priority: { rank: 55 },
    meaning: 'Weak preemptive jump raise with 0-6 HCP and 4+ major/diamond or 5+ club ' +
             'support, not an invitational limit raise.',
    certainty: 'medium',
  },
  //
  {
    id: 'respond-after-double-natural-1nt',
    kind: 'responseBid',
    title: 'Natural 1NT response after a takeout double',
    auctionContext: { stage: 'responding', openerLevel: 1, openerStrain: 'suit',
                      interference: 'takeoutDouble' },
    calls: ['1NT'],
    callCategory: ['natural'],
    appliesWhen: { hcp: { min: 6, max: 9 }, shape: { balanced: true } },
    priority: { rank: 45 },
    meaning: 'Natural 1NT with 6-9 HCP and balanced shape; no opponent-suit stopper is required ' +
             'because the opponent doubled rather than naming a suit.',
    certainty: 'high',
  },
  //
  // After a natural opposing 1NT overcall, constructive two-level new suits are nonforcing.
  // The simple raise and weak Pass keep their ordinary shared meanings. Double is for penalties
  // in common methods and remains outside this trainer, as does an unagreed 2NT response.
  //
  {
    id: 'respond-over-1nt-new-suit-two-level',
    kind: 'responseBid',
    title: 'Natural nonforcing new suit after opponent overcalls 1NT',
    auctionContext: { stage: 'responding', openerLevel: 1, openerStrain: 'suit',
                      interference: 'notrumpOvercall' },
    calls: ['2C', '2D', '2H', '2S'],
    callRefinement: refineResponderNewSuitAfterNotrumpOvercall,
    callCategory: ['natural'],
    appliesWhen: responderWeakTwoLevelNewSuitApplies,
    priority: { rank: 65 },
    meaning: 'Natural nonforcing new suit with a good six-card-or-longer suit and 5-9 HCP. ' +
             'The usual uncontested two-level strength requirement does not apply.',
    guidance: ['This is a conservative partnership treatment; strong hands that would normally ' +
               'double for penalties are deliberately not assigned a weaker response.'],
    certainty: 'high',
  },
  //
  {
    id: 'respond-over-1nt-preemptive-jump-raise',
    kind: 'responseBid',
    title: 'Preemptively jump-raise partner after opponent overcalls 1NT',
    auctionContext: { stage: 'responding', openerLevel: 1, openerStrain: 'suit',
                      interference: 'notrumpOvercall' },
    calls: ['3C', '3D', '3H', '3S'],
    callRefinement: refineRaisePartnerSuitBy2,
    callCategory: ['signoff', 'natural'],
    appliesWhen: responderWeakJumpRaiseAfterInterferenceApplies,
    priority: { rank: 55 },
    meaning: 'Weak, preemptive jump raise with 0-6 HCP, at most nine support points, ' +
             'and 4+ major/diamond or 5+ club support; not an invitational limit raise.',
    certainty: 'medium',
  },
  //
  // After an opponent's preemptive jump overcall, the actual contract determines which
  // raises and new suits remain economical. This treatment stops at three-level interference.
  // Four-level jump overcalls and penalty-oriented doubles remain outside the model.
  //
  {
    id: 'respond-over-jump-pass-limited',
    kind: 'responseBid',
    title: 'Pass after a jump overcall without values for a constructive action',
    auctionContext: { stage: 'responding', openerLevel: 1, openerStrain: 'suit',
                      interference: 'jumpSuitOvercall' },
    calls: ['Pass'],
    callCategory: ['signoff'],
    appliesWhen: responderPassAfterJumpOvercallApplies,
    priority: { rank: 10 },
    meaning: 'With 6-9 HCP and no qualifying competitive raise, Pass may be right after a preempt.',
    guidance: ['The opponent has consumed bidding room; 6+ HCP does not oblige a response.',
               'This is a limited Pass treatment, not the general inferred-Pass mechanism.'],
    certainty: 'high',
  },
  //
  {
    id: 'respond-over-jump-raise-cheapest-to-three',
    kind: 'responseBid',
    title: 'Raise opener at the cheapest three level after a jump overcall',
    auctionContext: { stage: 'responding', openerLevel: 1, openerStrain: 'suit',
                      interference: 'jumpSuitOvercall' },
    calls: ['3C', '3D', '3H', '3S'],
    callRefinement: (calls, context) => refineResponderRaiseAfterJumpOvercall(calls, context, 3),
    callCategory: ['natural'],
    appliesWhen: { totalPoints: { min: 8, max: 10, valuation: 'shortage' },
                   supportLength: { min: 3 } },
    priority: { rank: 70 },
    meaning: 'Nonforcing, economical three-level raise with 8-10 support points; not a jump raise.',
    guidance: ['For a minor opening, prefer four-card diamond or five-card club support; ' +
               'these additional minimums are enforced by the raise refiner.'],
    certainty: 'medium',
  },
  //
  {
    id: 'respond-over-jump-new-suit-two-level',
    kind: 'responseBid',
    title: 'Bid a natural forcing two-level suit after a jump overcall',
    auctionContext: { stage: 'responding', openerLevel: 1, openerStrain: 'suit',
                      interference: 'jumpSuitOvercall' },
    calls: ['2H', '2S'],
    callRefinement: refineResponderNewSuitAfterJumpOvercall,
    callCategory: ['forcing', 'natural'],
    appliesWhen: { hcp: { min: 10 }, suitLengths: [{ min: 5 }] },
    priority: { rank: 80 },
    meaning: 'Natural five-card-or-longer new suit with 10+ HCP, forcing one round.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-over-jump-new-suit-three-level',
    kind: 'responseBid',
    title: 'Bid a natural game-forcing three-level suit after a jump overcall',
    auctionContext: { stage: 'responding', openerLevel: 1, openerStrain: 'suit',
                      interference: 'jumpSuitOvercall' },
    calls: ['3C', '3D', '3H', '3S'],
    callRefinement: refineResponderNewSuitAfterJumpOvercall,
    callCategory: ['gameForcing', 'natural'],
    appliesWhen: { hcp: { min: 13 }, suitLengths: [{ min: 5 }] },
    priority: { rank: 85 },
    meaning: 'Natural five-card-or-longer new suit with 13+ HCP, forcing to game; ' +
             'the cheapest available new suit must actually be at the three level.',
    certainty: 'medium',
  },
  //
  {
    id: 'respond-over-jump-negative-double',
    kind: 'responseBid',
    title: 'Make an informational negative double after a jump overcall',
    auctionContext: { stage: 'responding', openerLevel: 1, openerStrain: 'suit',
                      interference: 'jumpSuitOvercall' },
    calls: ['Double'],
    callCategory: ['forcing', 'conventional'],
    appliesWhen: responderNegativeDoubleAfterJumpOvercallApplies,
    priority: { rank: 100 },
    meaning: 'Negative double with 10+ HCP over a two-level jump or 12+ HCP over a ' +
             'three-level jump, plus suitable unbid-suit holdings.',
    guidance: ['Four cards in each unbid major (or each unbid minor when no major remains) ' +
               'is the conservative modeled subset; this is never a penalty double.'],
    certainty: 'medium',
  },
  //
  {
    id: 'respond-over-jump-support-cuebid-major',
    kind: 'responseBid',
    title: 'Cuebid a two-level jump overcall to show game-going major support',
    auctionContext: { stage: 'responding', openerLevel: 1, openerStrain: 'major',
                      interference: 'jumpSuitOvercall' },
    calls: ['3C', '3D', '3H', '3S'],
    callRefinement: refineResponderCuebidAfterJumpOvercall,
    callCategory: ['forcing', 'conventional'],
    appliesWhen: responderCuebidAfterJumpOvercallApplies,
    priority: { rank: 95 },
    meaning: 'Artificial cuebid in the opponent suit showing 3+ major support and 13+ ' +
             'shortage-adjusted support points, with game-going intent.',
    guidance: ['Only cuebids of two-level jump overcalls after a major opening are modeled; ' +
               'a minor-opening cuebid can instead ask about a stopper and is deferred.'],
    certainty: 'medium',
  },
  //
  {
    id: 'respond-over-jump-natural-notrump',
    kind: 'responseBid',
    title: 'Bid natural notrump with a stopper after a jump overcall',
    auctionContext: { stage: 'responding', openerLevel: 1, openerStrain: 'suit',
                      interference: 'jumpSuitOvercall' },
    calls: ['2NT', '3NT'],
    callCategory: ['natural'],
    appliesWhen: responderNotrumpAfterJumpOvercallApplies,
    priority: { rank: 65 },
    meaning: 'Natural balanced 2NT with 11-12 HCP or 3NT with 13-15 HCP, with a stopper ' +
             'in the opponent long suit; 2NT is unavailable over a three-level preempt.',
    certainty: 'medium',
  },
  //
  {
    id: 'respond-over-jump-major-game-constructive',
    kind: 'responseBid',
    title: 'Bid game in opener major with constructive support after a jump overcall',
    auctionContext: { stage: 'responding', openerLevel: 1, openerStrain: 'major',
                      interference: 'jumpSuitOvercall' },
    calls: ['4H', '4S'],
    callRefinement: (calls, context) => refineRaiseToLevel(calls, context, 4),
    callCategory: ['natural'],
    appliesWhen: { totalPoints: { min: 13, valuation: 'shortage' },
                   supportLength: { min: 3 } },
    priority: { rank: 75 },
    meaning: 'Constructive major-suit game bid with 13+ shortage-adjusted support points and 3+ trumps.',
    guidance: ['The already modeled weak raise to game with 5+ support remains a separate ' +
               'preemptive alternative; this rule does not calculate playing tricks.'],
    certainty: 'medium',
  },
 ];
