/// Bidding rules characterizations and bidding notes.  Not sure yet what is needed or how it will
/// be used, so iterating toward a design with some punch through code on bidding.

import type { BidRule, Call, RuleEvalContext, CallRefinementResult, AppliesWhenResult } from './bidding-types';
import { guidelineOf20Applies, majorDirectThreeNtApplies, minorRaiseApplies,
         minorSupportNewSuitApplies,
         oneNtFiveCardLengthUpgradeApplies, majorTwoLevelNewSuitApplies,
         openerMinorOneLevelOneNtApplies, openerSecondSuitApplies, oneNtTwoNtInvitationApplies,
         refineForcingOneNtMinorFallback, refineJumpNewSuit, refineMajorSupportNewSuitFirst,
         refineNaturalMajorGameOver2Nt, refineNewSuitByExtraLevels,
         refineOneLevelNewSuitAfterMinor, refineOneLevelSuitOpening,
         refineOpenerFiveCardMajorFallback, refineOpenerFourCardMajorUpTheLine,
         refineOpenerNonReverseNewSuitRebid,
         refineOpenerLowerRankingSecondSuitRebid, refineOpenerNaturalJumpShiftRebid,
         refineOpenerNewSuitAtCheapestLevel,
         refineOpenerNewSuitByExtraLevels, refineOpenerOpeningSuitToLevel,
         refineOpenerRaiseResponderSuitToLevel, refineOpenerResponderSuitToGame,
         refineOpenerReverseRebid, refinePreemptSuitQuality, refineRaisePartnerSuitBy1,
         refineRaisePartnerSuitBy2, refineRaiseToLevel, refineThreeCardLimitRaiseOneNtFallback,
         refineThreeCardMajorSupportNewSuitFirst,
         refineToCheapestNewSuitBids,}
  from './bidding-rule-functions';

///
//// Opening Bidding Rules
///

export const OpeningBidRules: BidRule[] = [ 
  // Basic one bids
  //
  {
    id: 'open-1nt-balanced-15-17',
    // Normal 1NT, distinguished from 16-18 modern treamtment.
    kind: 'openingBid',
    title: 'Open 1NT with balanced 15-17',
    auctionContext: { stage: 'opening', auction: [] },
    calls: ['1NT'],
    // natural is sentinal: maybeSuppressConvenientMinor() looks for this
    callCategory: ['invitational', 'natural'], 
    agreement: { setting: 'oneNtOpening', value: '15-17', 
                 note: 'Standard 15-17 balanced 1NT range.' },
    priority: { rank: 100 },
    appliesWhen: { hcp: { min: 15, max: 17 }, shape: { balanced: true }, 
                   }, //suitLengths: [{ suit: 'H', max: 4 }, { suit: 'S', max: 4 }] },
    meaning: 'Balanced hand in the 1NT range.',
    guidance: ['You can bid 1NT with a 5-card major.',
               'Do not consider a convenient minor when the hand fits a natural 1NT opening; ' +
                  '1NT describes both strength and shape more precisely.', ],
    certainty: 'high',
  },
  //
  {
    id: 'open-1nt-balanced-16-18',
    // Alternate natural 1NT opening for a balanced 16-18 HCP hand.
    kind: 'openingBid',
    title: 'Open 1NT with balanced 16-18',
    auctionContext: { stage: 'opening', auction: [] },
    calls: ['1NT'],
    // natural is sentinal: maybeSuppressConvenientMinor() looks for this
    callCategory: ['invitational', 'natural'], 
    agreement: { setting: 'oneNtOpening', value: '16-18', 
                 note: 'Alternate 16-18 balanced 1NT range.' },
    priority: { rank: 100 },
    appliesWhen: { hcp: { min: 16, max: 18 }, shape: { balanced: true } },
    meaning: 'Balanced hand in the 1NT range.',
    guidance: ['You can bid 1NT with a 5-card major.',
               'Do not consider a convenient minor when the hand fits a natural 1NT opening; ' +
                  '1NT describes both strength and shape more precisely.', ],
    certainty: 'high',
  },
  //
  {
    id: 'open-1nt-five-card-length-upgrade',
    // Upgrades a balanced hand one HCP with a five-card major by agreement.
    kind: 'openingBid',
    title: 'Upgrade a balanced five-card-major hand into the 1NT range',
    auctionContext: { stage: 'opening', auction: [] },
    calls: ['1NT'],
    // natural is sentinal: maybeSuppressConvenientMinor() looks for this
    callCategory: ['invitational', 'natural'], 
    agreement: { setting: 'oneNtFiveCardLengthUpgrade', value: true,
                 note: 'Optional one-point upgrade with a five-card major; off by default.' },
    priority: { rank: 100 },
    appliesWhen: oneNtFiveCardLengthUpgradeApplies,
    meaning: 'Optional five-card-major treatment permits one HCP below the normal 1NT minimum.',
    certainty: 'high',
  },
  //
  {
    id: 'open-five-card-major',
    // Basic 5-card majors, opening points.
    kind: 'openingBid',
    title: 'Open a five-card major',
    auctionContext: { stage: 'opening', auction: [] },
    calls: ['1H', '1S'],
    callRefinement: refineOneLevelSuitOpening, // refines according to guidance below
    callCategory: ['natural'],
    priority: { rank: 90 },
    appliesWhen: { hcp: { max: 21 }, totalPoints: { min: 12 },
                   suitLengths: [ { suit: 'major', min: 5 } ] },
    meaning: 'Open 1H or 1S with a five-card or longer major suit and opening values.',
    guidance: ['With two five-card or longer suits, open the higher-ranking suit.'],
    certainty: 'high',
  },
  //
  {
    id: 'open-convenient-minor',
    // Basic convenient minors for no 1NT and no 5-card major with opening points.
    kind: 'openingBid',
    title: 'Open a convenient minor when no other one-level opening fits',
    auctionContext: { stage: 'opening', auction: [] },
    calls: ['1C', '1D'],
    callRefinement: refineOneLevelSuitOpening,  // refines according to guidance below
    callCategory: ['invitational'],
    priority: { rank: 70 },
    appliesWhen: { hcp: { max: 21 }, totalPoints: { min: 12 }, shape: { noFiveCardMajor: true }, 
                   suitLengths: [{ suit: 'major', max: 4 }]},
    meaning: 'Open 1C or 1D with nothing else to do. Open 1D with four cards in both minor suits; ' +
             'open 1C with three cards in both minor suits.',
    guidance: ['No natural NT opening.', 'No five-card major.', 
               '1C may be three-card or longer.', 'Bid longer suit.', 
               'Bid 1D if both minors are four-card.'],
    certainty: 'high',
  },
  {
    id: 'open-guideline-of-20',
    // Modern rule of 20: if HCP plus two longest suits' lengths is 20+, open.
    kind: 'openingBid',
    title: 'Open a sub-12-HCP hand satisfying the Guideline of 20',
    auctionContext: { stage: 'opening', auction: [] },
    calls: ['1C', '1D', '1H', '1S'],
    callRefinement: refineOneLevelSuitOpening, // can't declaratively say which to choose
    callCategory: ['invitational'], // can't be natural because of convenient minors
    appliesWhen: guidelineOf20Applies,
    meaning: 'HCP plus the lengths of the two longest suits is at least 20.',
    guidance: ['Use as an alternate opening-hand valuation in first or second seat.'],
    certainty: 'high',
  },
  // Strong bids
  //
  {
    id: 'open-2nt-balanced-20-21',
    // Natural strong 2NT opening for a balanced 20-21 HCP hand.
    kind: 'openingBid',
    title: 'Open 2NT with balanced 20-21',
    auctionContext: { stage: 'opening', auction: [] },
    calls: ['2NT'],
    // natural is sentinal: maybeSuppressConvenientMinor() looks for this
    callCategory: ['invitational', 'natural'], 
    priority: { rank: 100 },
    appliesWhen: { hcp: { min: 20, max: 21 }, shape: { balanced: true } },
    guidance: ['Do not consider a convenient minor when the hand fits the natural 2NT opening; ' +
                  '2NT describes both strength and shape more precisely.', ],
    meaning: 'Strong balanced opening showing 20-21 points.',
    certainty: 'high',
  },
  //
  {
    id: 'open-2c-strong-artificial',
    // Artificial forcing 2C opening for very strong hands.
    kind: 'openingBid',
    title: 'Open 2C with strong artificial opening values',
    auctionContext: { stage: 'opening', auction: [] },
    calls: ['2C'],
    callCategory: ['forcing', 'conventional'],
    appliesWhen: { hcp: { min: 22 } },
    guidance: ['The strong 2C bid is simplest with 22+ points and any shape, but bidding texts ' +
               'suggest a 4-4-4-1 distribution might be better opened on the 1 level.  Texts ' +
               'also mention with nine or more tricks(required experience), fewer than 22 points ' +
               'is ok.'],
    meaning: 'Strong artificial and forcing opening; absent interference, partner must respond.',
    certainty: 'high',
  },
  // Weak bids
  //
  {
    id: 'open-weak-two',
    // Preemptive 2D/2H/2S opening for a weak hand with a six-card suit.
    kind: 'openingBid',
    title: 'Open weak two bid',
    auctionContext: { stage: 'opening', auction: [] },
    calls: ['2D', '2H', '2S'],
    callRefinement: refinePreemptSuitQuality,
    callCategory: ['invitational'],
    appliesWhen: { hcp: { min: 5, max: 10 }, suitLengths: [{ min: 6 }] },
    guidance: ['Good suit with 5 playing tricks and 2 of top 3 honors or 3 of top 5 honors, ' +
               'such as, A-Q-xxxx or Q-J-10-xxx'],
    meaning: 'Descriptive and obstructive weak two-bid.',
    certainty: 'high',
  },
  //
  {
    id: 'open-weak-three',
    // Three-level preempt with a seven-card suit and less than normal one-level opening strength.
    kind: 'openingBid',
    title: 'Open at the three level with a preemptive hand',
    auctionContext: { stage: 'opening', auction: [] },
    calls: ['3C', '3D', '3H', '3S'],
    callRefinement: refinePreemptSuitQuality,
    callCategory: ['invitational'],
    appliesWhen: { hcp: { min: 5, max: 12 }, suitLengths: [{ min: 7 }] },
    guidance: ['Good suit with 6 playing tricks and 2 of top 3 honors or 3 of top 5 honors, ' +
               'such as, A-Q-xxxx or Q-J-10-xxx'],
    meaning: 'Preemptive opening with a good seven-card suit.',
    certainty: 'high',
  },
  //
  {
    id: 'open-four-level-preempt',
    // Four-level preempt with an eight-card suit and less than normal one-level opening strength.
    kind: 'openingBid',
    title: 'Open at the four level with a preemptive hand',
    auctionContext: { stage: 'opening', auction: [] },
    calls: ['4C', '4D', '4H', '4S'],
    callRefinement: refinePreemptSuitQuality,
    callCategory: ['invitational'],
    appliesWhen: { hcp: { min: 5, max: 12 }, suitLengths: [{ min: 8 }] },
    guidance: ['Good suit with 7 playing tricks and 2 of top 3 honors or 3 of top 5 honors, ' +
               'such as, A-Q-xxxx or Q-J-10-xxx'],
    meaning: 'Preemptive opening with a good eight-card suit.',
    certainty: 'high',
  },
  //
  {
    id: 'open-five-level-minor-preempt',
    // Rare five-level minor preempt for an exceptional nine-card club or diamond suit.
    kind: 'openingBid',
    title: 'Open five of a minor with an exceptional preemptive hand',
    auctionContext: { stage: 'opening', auction: [] },
    calls: ['5C', '5D'],
    callRefinement: refinePreemptSuitQuality,
    callCategory: ['invitational'],
    appliesWhen: { hcp: { min: 5, max: 12 }, suitLengths: [{ min: 9 }] },
    guidance: ['Rare: good nine-card minor with about eight playing tricks.'],
    meaning: 'Very high-level descriptive and obstructive preempt.',
    certainty: 'medium',
  },
  //
  {
    id: 'open-4nt-blackwood-rare',
    // Rare direct 4NT opening treatment that uses Blackwood to ask for aces.
    kind: 'openingBid',
    title: 'Rare 4NT opening as Blackwood',
    auctionContext: { stage: 'opening', auction: [] },
    calls: ['4NT'],
    priority: { rank: -100, note: 'Specialized ace asking; deliberately present last.' },
    callCategory: ['forcing', 'conventional'],
    appliesWhen: { hcp: { min: 25 } },
    guidance: ['Extremely rare and specialized: Blackwood is not a general slam try.',
               'Use only when the hand is powerful enough that ace count, rather than ordinary ' +
               'hand description, is the specific remaining information needed.'],
    meaning: 'Artificial Blackwood ace-asking opening; absent interference, partner must respond.',
    certainty: 'high',
  },
 ]; // OpeningBidRules

///
//// Response to Opening Bidding Rules
///

export const ResponseBidRules: BidRule[] = [ 
  // With openerStrain:'minor', auction:['1C'] is a representative declaration for either 1C or 1D.
  // callRefinement resolves calls whose exact denomination depends on the actual opening.
  //
  {
    id: 'respond-to-minor-w/-new-suit-one-level-priority',
    kind: 'responseBid',
    title: 'After 1C or 1D, bid a new suit at the one level first',
    auctionContext: { stage: 'responding', auction: ['1C'], openerStrain: 'minor' },
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
    auctionContext: { stage: 'responding', auction: ['1D'] },
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
    auctionContext: { stage: 'responding', auction: ['1D'] },
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
    auctionContext: { stage: 'responding', auction: ['1C'], openerStrain: 'minor' },
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
    auctionContext: { stage: 'responding', auction: ['1C'], openerStrain: 'minor' },
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
    auctionContext: { stage: 'responding', auction: ['1C'], openerStrain: 'minor' },
    calls: ['3NT'],
    callCategory: ['invitational'],
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
    auctionContext: { stage: 'responding', auction: ['1C'], openerStrain: 'minor' },
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
    auctionContext: { stage: 'responding', auction: ['1C'], openerStrain: 'minor' },
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
    auctionContext: { stage: 'responding', auction: ['1C'], openerStrain: 'minor' },
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
    auctionContext: { stage: 'responding', auction: ['1C'], openerStrain: 'minor' },
    calls: ['2D', '2H', '2S', '3C'],
    callRefinement: refineJumpNewSuit,  // chooses long suit for minium response
    callCategory: ['invitational'],
    agreement: { setting: 'jumpShift', value: 'weak',
                 note: 'Modern weak jump-shift treatment.' },
    priority: { rank: 110, note: 'Configured jump-shift treatment outranks the generic response.' },
    appliesWhen: { hcp: { min: 4, max: 7 }, suitLengths: [{ min: 6 }] },
    meaning: 'Weak, non-forcing jump shift with a six-card suit; preemptive and passable.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-minor-w/-strong-jump-shift-classic',
    // Classic strong jump shift after a minor opening: jump in long new suit to show points.
    kind: 'responseBid',
    title: 'Classic strong jump shift after one of a minor',
    auctionContext: { stage: 'responding', auction: ['1C'], openerStrain: 'minor' },
    calls: ['2D', '2H', '2S', '3C'],
    callRefinement: refineJumpNewSuit, // chooses longest best minium suit response
    callCategory: ['gameForcing'],
    agreement: { setting: 'jumpShift', value: 'strong',
                 note: 'Classic Standard strong jump-shift treatment.' },
    priority: { rank: 110, note: 'Configured jump-shift treatment outranks the generic response.' },
    appliesWhen: { hcp: { min: 17 }, suitLengths: [{ min: 5 }] },
    guidance: ['With a good five-card or longer suit and 18-19 points, jump-shift to new suit.'],
    meaning: 'Classic strong jump shift: game-forcing with a good long suit and slam interest.',
    certainty: 'high',
  },
  {
    id: 'respond-to-minor-w/-4nt-blackwood',
    // Use 4NT as Blackwood after a minor-suit opening when responder has strong slam values.
    kind: 'responseBid',
    title: 'Use Blackwood with strong slam-going values after a minor opening',
    auctionContext: { stage: 'responding', auction: ['1C'], openerStrain: 'minor' },
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
  // With openerStrain:'major', auction:['1H'] is a representative declaration for either 1H or 1S.
  // callRefinement resolves raises/new suits against the actual opening major.
  //
  {
    id: 'respond-to-major-w/-support-pass-0-5',
    // Pass a major opening when responder has support but no more than five total points.
    kind: 'responseBid',
    title: 'Pass with support and 0-5',
    auctionContext: { stage: 'responding', auction: ['1H'], openerStrain: 'major' },
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
    auctionContext: { stage: 'responding', auction: ['1H'], openerStrain: 'major' },
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
    auctionContext: { stage: 'responding', auction: ['1D'], openerStrain: 'minor' },
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
    auctionContext: { stage: 'responding', auction: ['1H'], openerStrain: 'major' },
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
    auctionContext: { stage: 'responding', auction: ['1H'], openerStrain: 'major' },
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
    auctionContext: { stage: 'responding', auction: ['1H'], openerStrain: 'major' },
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
    auctionContext: { stage: 'responding', auction: ['1H'], openerStrain: 'major' },
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
    auctionContext: { stage: 'responding', auction: ['1H'], openerStrain: 'major' },
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
    auctionContext: { stage: 'responding', auction: ['1H'], openerStrain: 'major' },
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
    auctionContext: { stage: 'responding', auction: ['1H'], openerStrain: 'major' },
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
    auctionContext: { stage: 'responding', auction: ['1H'], openerStrain: 'major' },
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
    auctionContext: { stage: 'responding', auction: ['1H'], openerStrain: 'major' },
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
    auctionContext: { stage: 'responding', auction: ['1H'], openerStrain: 'major' },
    calls: ['4H', '4S'],
    callRefinement: (calls: Call[], context: RuleEvalContext): CallRefinementResult => {
      // The broad declaration contains both 4H and 4S; keep only four of partner's actual major.
      return refineRaiseToLevel(calls, context, 4);
    },
    callCategory: ['invitational'],
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
    auctionContext: { stage: 'responding', auction: ['1H'], },
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
    auctionContext: { stage: 'responding', auction: ['1H'], openerStrain: 'major' },
    calls: ['2C', '2D', '2H', ],
    callRefinement: refineToCheapestNewSuitBids, // chooses longest new suit at lowest level
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
    auctionContext: { stage: 'responding', auction: ['1H'], openerStrain: 'major' },
    calls: ['2C', '2D', '2H', ],
    callRefinement: refineToCheapestNewSuitBids, // chooses longest new suit at lowest level
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
    auctionContext: { stage: 'responding', auction: ['1H'], openerStrain: 'major' },
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
    auctionContext: { stage: 'responding', auction: ['1H'], openerStrain: 'major' },
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
    auctionContext: { stage: 'responding', auction: ['1H'], openerStrain: 'major' },
    calls: ['3NT'],
    callCategory: ['invitational'],
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
    auctionContext: { stage: 'responding', auction: ['1H'], openerStrain: 'major' },
    calls: ['2S', '3C', '3D', '3H'],
    callRefinement: refineJumpNewSuit, // chooses 6+ card suit
    callCategory: ['invitational'], 
    agreement: { setting: 'jumpShift', value: 'weak',
                 note: 'Modern weak jump-shift treatment.' },
    priority: { rank: 110, note: 'Configured jump-shift treatment outranks the generic response.' },
    appliesWhen: { hcp: { min: 4, max: 7 }, suitLengths: [{ min: 6 }] },
    meaning: 'Weak, non-forcing jump shift with a six-card suit; preemptive and passable.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-major-w/-strong-jump-shift-classic',
    // Classic strong jump shift a good 5+ card new suit with strong values.
    kind: 'responseBid',
    title: 'Classic strong jump shift after one of a major',
    auctionContext: { stage: 'responding', auction: ['1H'], openerStrain: 'major' },
    calls: ['2S', '3C', '3D', '3H'],
    callRefinement: refineJumpNewSuit, // chooses long suit to jump to
    callCategory: ['gameForcing'],
    agreement: { setting: 'jumpShift', value: 'strong',
                 note: 'Classic Standard strong jump-shift treatment.' },
    priority: { rank: 110, note: 'Configured jump-shift treatment outranks the generic response.' },
    appliesWhen: { hcp: { min: 17 }, suitLengths: [{ min: 5 }] },
    meaning: 'Game-forcing strong jump shift showing a good long suit and slam interest.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-major-w/-4nt-blackwood',
    // Use 4NT as Blackwood after a major-suit opening when responder has strong slam-going values.
    kind: 'responseBid',
    title: 'Use Blackwood with strong slam-going values after a major opening',
    auctionContext: { stage: 'responding', auction: ['1H'], openerStrain: 'major' },
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
    appliesWhen: { hcp: { min: 0, max: 7 }, shape: { balanced: true } },
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
    appliesWhen: { hcp: { min: 10, max: 15 }, shape: { balanced: true } },
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
    appliesWhen: { hcp: { min: 16, max: 17 }, shape: { balanced: true } },
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
    appliesWhen: { hcp: { min: 18, max: 19 }, shape: { balanced: true } },
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
    appliesWhen: { hcp: { min: 20, max: 21 }, shape: { balanced: true } },
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
    appliesWhen: { hcp: { min: 22 }, shape: { balanced: true } },
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
    appliesWhen: { hcp: { min: 8 }, suitLengths: [{ suit: 'major', exact: 4 } ] },
    guidance: ['Stayman is artificial and forcing if no intervening bid; opener must respond.',
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
               'With 0-7 HCP and a five-card or longer major, transfer and then pass rather ' +
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
               'With 0-7 HCP and a five-card or longer major, transfer and then pass rather ' +
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
    appliesWhen: { hcp: { min: 0, max: 7 }, suitLengths: [{ min: 5 }] },
    meaning: 'Natural weak signoff in a five-card or longer major.',
    guidance: ['With a weak hand and a five-card or longer major, prefer the major-suit ' +
               'signoff to automatically passing 1NT.'],
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-1nt-w/-3c-3d-natural-invitational',
    // Bid 3C or 3D naturally with 8-9 HCP and a good six-card minor to invite further action.
    kind: 'responseBid',
    title: '3C or 3D over 1NT with a good six-card minor and 8-9',
    auctionContext: { stage: 'responding', auction: ['1NT'] },
    calls: ['3C', '3D'],
    callCategory: ['invitational'],
    appliesWhen: { hcp: { min: 8, max: 9 }, suitLengths: [{ min: 6 }]},
    guidance: ['Good six-card minor suit.'],
    meaning: 'Invitational natural minor-suit bid.',
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
    appliesWhen: { hcp: { min: 10, max: 15 }, suitLengths: [{ min: 6 }],
                   shape: { noFourCardOtherMajor: true } },
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
    appliesWhen: { hcp: { min: 10, max: 15 },
                   // can't use noFourCardOtherMajor because 4D is not 4H which maps to four spades
                   suitLengths: [{ suit: 'H', min: 6 }, { suit: 'S', max: 3 }] },
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
    appliesWhen: { hcp: { min: 10, max: 15 },
                   // can't use noFourCardOtherMajor because artificial 4H would check spades
                   suitLengths: [{ suit: 'S', min: 6 }, { suit: 'H', max: 3 }] },
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
    appliesWhen: { hcp: { min: 10 }, suitLengths: [{ min: 5 }] },
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
    appliesWhen: { hcp: { min: 16 }, suitLengths: [{ min: 6 }],
                   // important to leave open 4 card major, might be better than 6 card major
                   shape: { noFourCardOtherMajor: true } }, 
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
    guidance: ['Rare and specialized: Gerber is not a general slam try.',
               'Use it only when the partnership already has enough playing strength to consider ' +
               'slam and ace count is the specific remaining information needed to choose the ' +
               'final contract.'],
    meaning: 'Gerber is artificial and forcing, asking the notrump opener to show aces.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-2nt-w/-pass-0-3-balanced',
    // Pass a 2NT opening with a balanced 0-3 HCP hand.
    kind: 'responseBid',
    title: 'Pass 2NT with 0-3 balanced',
    auctionContext: { stage: 'responding', auction: ['2NT'] },
    calls: ['Pass'],
    callCategory: ['signoff'],
    appliesWhen: { hcp: { min: 0, max: 3 }, shape: { balanced: true } },
    meaning: 'Sign off in 2NT; opener is expected to leave the contract there absent interference.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-2nt-w/-3nt-4-10-balanced',
    // Raise 2NT to 3NT with 4-10 balanced HCP to play game.
    kind: 'responseBid',
    title: 'Bid 3NT over 2NT with 4-10 balanced',
    auctionContext: { stage: 'responding', auction: ['2NT'] },
    calls: ['3NT'],
    callCategory: ['signoff'],
    appliesWhen: { hcp: { min: 4, max: 10 }, shape: { balanced: true } },
    meaning: 'Game in notrump.',
    certainty: 'high',
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
 ]; // ResponseBiddingRules

///
//// Opener Rebid Bidding Rules
///

export const OpenerRebidRules: BidRule[] = [
  //
  // The following rules are opener rebids after a one-level minor opening and 1NT response.
  //
  {
    // Use length total points when opener is not supporting responder's suit.
    id: 'opener-rebid-pass-after-minor-1nt',
    kind: 'openerRebid',
    title: 'Pass 1NT with a minimum balanced or semi-balanced hand',
    auctionContext: {
      stage: 'openerRebid', openerStrain: 'minor',
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
      stage: 'openerRebid', openerStrain: 'minor',
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
      stage: 'openerRebid', openerStrain: 'minor',
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
      stage: 'openerRebid', openerStrain: 'minor',
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
      stage: 'openerRebid', openerStrain: 'minor',
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
      stage: 'openerRebid', openerStrain: 'minor',
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
      stage: 'openerRebid', openerStrain: 'minor',
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
      stage: 'openerRebid', openerStrain: 'minor',
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
      stage: 'openerRebid', openerStrain: 'minor',
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
      stage: 'openerRebid', openerStrain: 'minor',
      responderCall: { kind: 'newSuit', level: 1, jump: false },
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
      stage: 'openerRebid', openerStrain: 'minor',
      responderCall: { kind: 'newSuit', level: 1, jump: false },
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
      stage: 'openerRebid', openerStrain: 'minor',
      responderCall: { kind: 'newSuit', level: 1, jump: false },
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
      stage: 'openerRebid', openerStrain: 'minor',
      responderCall: { kind: 'newSuit', level: 1, jump: false },
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
      stage: 'openerRebid', openerStrain: 'minor',
      responderCall: { kind: 'newSuit', level: 1, jump: false },
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
      stage: 'openerRebid', openerStrain: 'minor',
      responderCall: { kind: 'newSuit', level: 1, jump: false },
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
      stage: 'openerRebid', openerStrain: 'minor',
      responderCall: { kind: 'newSuit', level: 1, jump: false },
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
      stage: 'openerRebid', openerStrain: 'minor',
      responderCall: { kind: 'newSuit', level: 1, jump: false },
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
      stage: 'openerRebid', openerStrain: 'minor',
      responderCall: { kind: 'newSuit', level: 1, jump: false },
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
      stage: 'openerRebid', openerStrain: 'minor',
      responderCall: { kind: 'newSuit', level: 1, jump: false },
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
      stage: 'openerRebid', openerStrain: 'minor',
      responderCall: { kind: 'newSuit', level: 1, jump: false },
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
      stage: 'openerRebid', openerStrain: 'minor',
      responderCall: { kind: 'newSuit', level: 1, jump: false },
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
      stage: 'openerRebid', openerStrain: 'minor',
      responderCall: { kind: 'newSuit', level: 2, jump: false },
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
      stage: 'openerRebid', openerStrain: 'minor',
      responderCall: { kind: 'newSuit', level: 2, jump: false },
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
      stage: 'openerRebid', openerStrain: 'minor',
      responderCall: { kind: 'newSuit', level: 2, jump: false },
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
      stage: 'openerRebid', openerStrain: 'minor',
      responderCall: { kind: 'newSuit', level: 2, jump: false },
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
      stage: 'openerRebid', openerStrain: 'minor',
      responderCall: { kind: 'newSuit', level: 2, jump: false },
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
      stage: 'openerRebid', openerStrain: 'minor',
      responderCall: { kind: 'newSuit', level: 2, jump: false },
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
      stage: 'openerRebid', openerStrain: 'minor',
      responderCall: { kind: 'newSuit', level: 2, jump: false },
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
      stage: 'openerRebid', openerStrain: 'minor',
      responderCall: { kind: 'newSuit', level: 2, jump: false },
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
      stage: 'openerRebid', openerStrain: 'minor',
      responderCall: { kind: 'newSuit', level: 2, jump: false },
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
      stage: 'openerRebid', openerStrain: 'minor',
      responderCall: { kind: 'newSuit', level: 2, jump: false },
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
      stage: 'openerRebid', openerStrain: 'minor',
      responderCall: { kind: 'newSuit', level: 2, jump: false },
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
      stage: 'openerRebid', openerStrain: 'minor',
      responderCall: { kind: 'newSuit', level: 2, jump: false },
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
      stage: 'openerRebid', openerStrain: 'minor',
      responderCall: { kind: 'newSuit', level: 2, jump: false },
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
      stage: 'openerRebid', openerStrain: 'major',
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
      stage: 'openerRebid', openerStrain: 'major',
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
      stage: 'openerRebid', openerStrain: 'major',
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
      stage: 'openerRebid', openerStrain: 'major',
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
      stage: 'openerRebid', openerStrain: 'major',
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
      stage: 'openerRebid', openerStrain: 'major',
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
      stage: 'openerRebid', openerStrain: 'major',
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
      stage: 'openerRebid', openerStrain: 'major',
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
      stage: 'openerRebid', openerStrain: 'major',
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
      stage: 'openerRebid', openerStrain: 'major',
      responderCall: { kind: 'newSuit', level: 1, jump: false },
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
      stage: 'openerRebid', openerStrain: 'major',
      responderCall: { kind: 'newSuit', level: 1, jump: false },
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
      stage: 'openerRebid', openerStrain: 'major',
      responderCall: { kind: 'newSuit', level: 1, jump: false },
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
      stage: 'openerRebid', openerStrain: 'major',
      responderCall: { kind: 'newSuit', level: 1, jump: false },
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
      stage: 'openerRebid', openerStrain: 'major',
      responderCall: { kind: 'newSuit', level: 1, jump: false },
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
      stage: 'openerRebid', openerStrain: 'major',
      responderCall: { kind: 'newSuit', level: 1, jump: false },
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
      stage: 'openerRebid', openerStrain: 'major',
      responderCall: { kind: 'newSuit', level: 1, jump: false },
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
      stage: 'openerRebid', openerStrain: 'major',
      responderCall: { kind: 'newSuit', level: 1, jump: false },
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
      stage: 'openerRebid', openerStrain: 'major',
      responderCall: { kind: 'newSuit', level: 1, jump: false },
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
      stage: 'openerRebid', openerStrain: 'major',
      responderCall: { kind: 'newSuit', level: 1, jump: false },
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
      stage: 'openerRebid', openerStrain: 'major',
      responderCall: { kind: 'newSuit', level: 1, jump: false },
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
      stage: 'openerRebid', openerStrain: 'major',
      responderCall: { kind: 'newSuit', level: 2, jump: false },
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
      stage: 'openerRebid', openerStrain: 'major',
      responderCall: { kind: 'newSuit', level: 2, jump: false },
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
      stage: 'openerRebid', openerStrain: 'major',
      responderCall: { kind: 'newSuit', level: 2, jump: false },
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
      stage: 'openerRebid', openerStrain: 'major',
      responderCall: { kind: 'newSuit', level: 2, jump: false },
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
      stage: 'openerRebid', openerStrain: 'major',
      responderCall: { kind: 'newSuit', level: 2, jump: false },
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
      stage: 'openerRebid', openerStrain: 'major',
      responderCall: { kind: 'newSuit', level: 2, jump: false },
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
      stage: 'openerRebid', openerStrain: 'major',
      responderCall: { kind: 'newSuit', level: 2, jump: false },
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
      stage: 'openerRebid', openerStrain: 'major',
      responderCall: { kind: 'newSuit', level: 2, jump: false },
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
      stage: 'openerRebid', openerStrain: 'major',
      responderCall: { kind: 'newSuit', level: 2, jump: false },
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
      stage: 'openerRebid', openerStrain: 'major',
      responderCall: { kind: 'newSuit', level: 2, jump: false },
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
      stage: 'openerRebid', openerStrain: 'major',
      responderCall: { kind: 'newSuit', level: 2, jump: false },
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
      stage: 'openerRebid', openerStrain: 'major',
      responderCall: { kind: 'newSuit', level: 2, jump: false },
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
      stage: 'openerRebid', openerStrain: 'major',
      responderCall: { kind: 'newSuit', level: 2, jump: false },
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
      stage: 'openerRebid', openerStrain: 'major',
      responderCall: { kind: 'newSuit', level: 2, jump: false },
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
      stage: 'openerRebid', openerStrain: 'major',
      responderCall: { kind: 'newSuit', level: 2, jump: false },
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
      stage: 'openerRebid', openerStrain: 'major',
      responderCall: { kind: 'newSuit', level: 2, jump: false },
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
  // The following rules are opener rebids after responder raises a major opening to two.
  //
  {
    id: 'opener-rebid-pass-after-major-simple-raise',
    kind: 'openerRebid',
    title: 'Pass a simple major raise with minimum values',
    auctionContext: {
      stage: 'openerRebid', openerStrain: 'major',
      responderCall: { kind: 'raise', level: 2, jump: false },
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
      stage: 'openerRebid', openerStrain: 'major',
      responderCall: { kind: 'raise', level: 2, jump: false },
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
      stage: 'openerRebid', openerStrain: 'major',
      responderCall: { kind: 'raise', level: 2, jump: false },
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
      stage: 'openerRebid', openerStrain: 'major',
      responderCall: { kind: 'raise', level: 2, jump: false },
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
      stage: 'openerRebid', openerStrain: 'major',
      responderCall: { kind: 'raise', level: 2, jump: false },
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
  {
    id: 'opener-rebid-splinter-after-major-simple-raise',
    kind: 'openerRebid',
    title: 'Optional splinter after a simple major raise',
    auctionContext: {
      stage: 'openerRebid', openerStrain: 'major',
      responderCall: { kind: 'raise', level: 2, jump: false },
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
]; //OpenerRebidrules

///
//// Overcall Bidding Rules
/// 

export const OvercallRules: BidRule[] = [  ];

///
//// Advancing Overcalls and Competitive Bidding
///

export const AdvanceRules: BidRule[] = [  ];


///
//// Bidding Notes
///

export const BiddingNotes: BidRule[] = [
  {
    id: 'opening-position-valuation-options',
    // Opening-hand valuation can change by seat, including Rule of 20, lighter third-seat openings, 
    // and Rule of 15.
    kind: 'footnote',
    title: 'Opening valuation can vary by seat',
    meaning: 'Guideline of 20 is an alternate first/second-seat valuation; ' + 
             'third seat may open lighter; fourth seat may use the Guideline of 15.',
    certainty: 'high',
  },
  //
  {
    id: 'garbage-stayman-note',
    // Weak escape form of Stayman; kept as a teaching note until we decide whether to model it.
    kind: 'footnote',
    title: 'Weak escape use of Stayman',
    auctionContext: { stage: 'responding', auction: ['1NT'], openerStrain: 'NT' },
    meaning: 'With 0-7 points and short clubs, Stayman can be used as an escape, planning to ' +
             'pass opener\'s rebid.',
    guidance: ['Some bidding methods use garbage or crawling Stayman with suitable weak ' +
               'two-major hands.  Weak hands with a five-card major may instead use a transfer ' +
               'and pass.'],
    certainty: 'high',
  },
  //
  {
    id: 'minor-relay-over-1nt-note',
    // Teaching note for the optional 2S relay to 3C used to escape into a long minor.
    kind: 'footnote',
    title: 'Optional 2S relay to 3C over 1NT',
    auctionContext: { stage: 'responding', auction: ['1NT'], openerStrain: 'NT' },
    meaning: 'Some partnerships use 2S as a relay asking opener to bid 3C with a long minor; ' +
             'responder can pass clubs or correct to diamonds.',
    certainty: 'high',
  },
  //
  {
    id: 'gambling-3nt-note',
    // Teaching note for the optional Gambling 3NT opening treatment with a solid long minor.
    kind: 'footnote',
    title: 'Gambling 3NT is an optional opening treatment',
    meaning: 'Some partnerships use a 3NT opening with a solid long minor rather than the ' +
             'ordinary opening structure.',
    certainty: 'high',
  },
  //
  {
    id: 'pass-usually-no-message',
    // Teaching note that Pass usually does not describe a specific hand and does not prevent later
    // bidding.
    kind: 'concept',
    title: 'Pass usually carries no special bidding message',
    meaning: 'A pass usually does not promise a specific hand type; either partner may bid ' +
             'later as the auction develops.',
    certainty: 'high',
  },
  //
  // {
  //   id: 'valuation-high-card-points',
  //   kind: 'valuation',
  //   title: 'High card point scale',
  //   meaning: 'Ace=4, King=3, Queen=2, Jack=1.',
  //   certainty: 'high',
  // },
  //
  // {
  //   id: 'valuation-distribution-points',
  //   kind: 'valuation',
  //   title: 'Length-based distribution points',
  //   meaning: 'Add distribution points for long suits: five-card suit=1, six-card suit=2, seven-card suit=3, eight-card suit=4.',
  //   certainty: 'high',
  // },
  //
  // {
  //   id: 'opening-one-level-point-range',
  //   kind: 'openingBid',
  //   title: 'Open at the one level with opening values',
  //   auctionContext: { stage: 'opening', auction: [] },
  //   calls: ['1C', '1D', '1H', '1S', '1NT'],
  //   appliesWhen: { totalPoints: { min: 12, max: 21 } },
  //   meaning: 'Open at the one level with about 12-21 total points after adding high-card and distribution points.',
  //   guidance: ['In first or second position, the Guideline of 20 may be an alternative hand-valuation method.', 'Third-position openings may be lighter.', 'Fourth-position openings may use the Guideline of 15.'],
  //   certainty: 'high',
  // },
  //
  // {
  //   id: 'balanced-hand-definition',
  //   kind: 'concept',
  //   title: 'Balanced hand definition',
  //   meaning: 'A balanced hand has no void, no singleton, and at most one doubleton. The listed balanced patterns are 4-3-3-3, 4-4-3-2, and 5-3-3-2.',
  //   certainty: 'high',
  // },
  //
  {
    id: 'minor-response-objective',
    // Teaching priority after a minor opening: look first for a major fit, then notrump, before settling in a minor.
    kind: 'priority',
    title: 'Responder objective after 1C or 1D',
    auctionContext: { stage: 'responding', auction: ['1C'], openerStrain: 'minor' },
    meaning: 'Responder first looks for an eight-card or longer major-suit fit. Major-suit ' +
             'contracts are preferred over minor-suit contracts. Without a major fit, responder ' +
             'next considers notrump. Notrump is generally preferred to minor-suit contracts ' +
             'because 3NT needs fewer tricks than 5C or 5D.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-nt-two-decisions',
    // Teaching note: responder to a notrump opening decides both the final level and the denomination.
    kind: 'concept',
    title: 'Responder decisions over 1NT or 2NT',
    auctionContext: { stage: 'responding', auction: ['1NT'], openerStrain: 'NT' },
    meaning: 'Responder decides how high to bid and where to play: clubs, diamonds, hearts, ' +
             'spades, or notrump.',
    guidance: ['Opener has shown a narrow strength range and a balanced or semi-balanced hand ' +
               'with at least two cards in every suit.'],
    certainty: 'high',
  },
  //
  {
    id: 'nt-opener-rebid-guidance',
    // Teaching note for opener's rebid after a notrump response: respect signoffs, judge
    // invitations by range, and answer forcing bids descriptively.
    kind: 'rebidGuidance',
    title: 'Opener rebid after responder bid over notrump',
    auctionContext: { stage: 'openerRebid', auction: ['1NT'] },
    meaning: 'If responder makes a signoff bid, opener passes. If responder makes an ' +
             'invitational bid, opener passes with a minimum and accepts with a maximum.  If ' +
             'responder makes a forcing bid, opener makes a descriptive rebid.',
    guidance: ['Example: after 1NT-2NT, opener passes with 15-16 and bids 3NT with 17 or a good 16.'],
    certainty: 'high',
  },
];
