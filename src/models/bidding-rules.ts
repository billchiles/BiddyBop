/// Bidding rules characterizations and bidding notes.  Not sure yet what is needed or how it will
/// be used, so iterating toward a design with some punch through code on bidding.

import type { BidRule, BiddingSystem, Call, CallRefinementResult, RuleEvaluationContext,
                   AppliesWhenResult, Strain, SuitBid } from './bidding-types';
import { strainOrder, } from './bidding-types';

///
//// Bidding Rules
///

export const OpeningBidRules: BidRule[] = [ 
  // Basic one bids
  //
  {
    id: 'open-1nt-balanced-15-17',
    // Normal 1NT, distinguished from 16-18 modern treamtment.
    kind: 'openingBid',
    title: 'Open 1NT with balanced 15-17',
    auctionContext: { role: 'opener', auction: [] },
    calls: ['1NT'],
    callCategory: ['natural'],
    agreement: { setting: 'oneNtOpening', value: '15-17', 
                 note: 'Standard 15-17 balanced 1NT range.' },
    priority: { rank: 100 },
    appliesWhen: { hcp: { min: 15, max: 17 }, shape: { balanced: true }, 
                   }, //suitLengths: [{ suit: 'H', max: 4 }, { suit: 'S', max: 4 }] },
    meaning: 'Balanced hand in the 1NT range.',
    guidance: ['You can bid 1NT with a 5-card major.'],
    certainty: 'high',
  },
  //
  {
    id: 'open-1nt-balanced-16-18',
    // Alternate natural 1NT opening for a balanced 16-18 HCP hand.
    kind: 'openingBid',
    title: 'Open 1NT with balanced 16-18',
    auctionContext: { role: 'opener', auction: [] },
    calls: ['1NT'],
    callCategory: ['natural'],
    agreement: { setting: 'oneNtOpening', value: '16-18', 
                 note: 'Alternate 16-18 balanced 1NT range.' },
    priority: { rank: 100 },
    appliesWhen: { hcp: { min: 16, max: 18 }, shape: { balanced: true } },
    meaning: 'Balanced hand in the 1NT range.',
    guidance: ['You can bid 1NT with a 5-card major.'],
    certainty: 'high',
  },
  //
  {
    id: 'open-1nt-five-card-length-upgrade',
    // Upgrades a balanced hand one HCP for five-card suit by agreement.
    kind: 'openingBid',
    title: 'Upgrade a balanced five-card-suit hand into the 1NT range',
    auctionContext: { role: 'opener', auction: [] },
    calls: ['1NT'],
    callCategory: ['natural'],
    agreement: { setting: 'oneNtFiveCardLengthUpgrade', value: true,
                 note: 'Optional one-point upgrade with a five-card suit; off by default.' },
    appliesWhen: oneNtFiveCardLengthUpgradeApplies,
    meaning: 'Optional length-point treatment permits one HCP below the normal 1NT minimum.',
    certainty: 'high',
  },
  //
  {
    id: 'open-five-card-major',
    // Basic 5-card majors, opening points.
    kind: 'openingBid',
    title: 'Open a five-card major',
    auctionContext: { role: 'opener', auction: [] },
    calls: ['1H', '1S'],
    callRefinement: refineOneLevelSuitOpening, // refines according to guidance below
    callCategory: ['natural'],
    priority: { rank: 90 },
    appliesWhen: { totalPoints: { min: 12, max: 21 }, suitLengths: [ { suit: 'major', min: 5 } ] },
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
    auctionContext: { role: 'opener', auction: [] },
    calls: ['1C', '1D'],
    callRefinement: refineOneLevelSuitOpening,  // refines according to guidance below
    callCategory: ['natural'],
    priority: { rank: 70 },
    appliesWhen: { totalPoints: { min: 12, max: 21 }, shape: { noFiveCardMajor: true }, 
                   suitLengths: [{ suit: 'major', max: 4 }]},
    meaning: 'Open 1C or 1D with nothing else to do. Open 1D with four cards in both minor suits; ' +
             'open 1C with three cards in both minor suits.',
    guidance: ['No balanced 15-17 1NT opening.', 'No five-card major.', 
               '1C may be three-card or longer.', 'Bid longer suit.', 
               'Bid 1D if both minors are four-card.'],
    certainty: 'high',
  },
  {
    id: 'open-guideline-of-20',
    // Modern rule of 20: if HCP plus two longest suits' lengths is 20+, open.
    kind: 'openingBid',
    title: 'Open a sub-12-HCP hand satisfying the Guideline of 20',
    auctionContext: { role: 'opener', auction: [] },
    calls: ['1C', '1D', '1H', '1S'],
    callRefinement: refineOneLevelSuitOpening, // can't declaratively say which to choose
    callCategory: ['natural'],
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
    auctionContext: { role: 'opener', auction: [] },
    calls: ['2NT'],
    callCategory: ['natural'],
    appliesWhen: { hcp: { min: 20, max: 21 }, shape: { balanced: true } },
    meaning: 'Strong balanced opening showing 20-21 points.',
    certainty: 'high',
  },
  //
  {
    id: 'open-2c-strong-artificial',
    // Artificial forcing 2C opening for very strong hands.
    kind: 'openingBid',
    title: 'Open 2C with strong artificial opening values',
    auctionContext: { role: 'opener', auction: [] },
    calls: ['2C'],
    callCategory: ['forcing', 'conventional'],
    appliesWhen: { hcp: { min: 22 } },
    guidance: ['Seeing nine or more tricks but fewer than 22 points is ok with any shape.'],
    meaning: 'Strong artificial opening, any shape.',
    certainty: 'high',
  },
  // Weak bids
  //
  {
    id: 'open-weak-two',
    // Preemptive 2D/2H/2S opening for a weak hand with a six-card suit.
    kind: 'openingBid',
    title: 'Open weak two bid',
    auctionContext: { role: 'opener', auction: [] },
    calls: ['2D', '2H', '2S'],
    appliesWhen: { hcp: { min: 5, max: 10 }, suitLengths: [{ min: 6 }] },
    // TODO: refine appliesWhen for guidance
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
    auctionContext: { role: 'opener', auction: [] },
    calls: ['3C', '3D', '3H', '3S'],
    appliesWhen: { hcp: { min: 5, max: 12 }, suitLengths: [{ min: 7 }] },
    // TODO: refine appliesWhen for guidance
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
    auctionContext: { role: 'opener', auction: [] },
    calls: ['4C', '4D', '4H', '4S'],
    appliesWhen: { hcp: { min: 5, max: 12 }, suitLengths: [{ min: 8 }] },
    // TODO: refine appliesWhen for guidance
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
    auctionContext: { role: 'opener', auction: [] },
    calls: ['5C', '5D'],
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
    auctionContext: { role: 'opener', auction: [] },
    calls: ['4NT'],
    callCategory: ['conventional'],
    appliesWhen: { hcp: { min: 25 } },
    meaning: 'Blackwood ace-asking opening; marked rare.',
    certainty: 'high',
  },
 ]; // OpeningBidRules

export const ResponseBidRules: BidRule[] = [ 
  // With openerStrain:'minor', auction:['1C'] is a representative declaration for either 1C or 1D.
  // callRefinement resolves calls whose exact denomination depends on the actual opening.
  //
  {
    id: 'respond-to-minor-w/-new-suit-one-level-priority',
    // After 1C or 1D, prefer 4+ card major.
    kind: 'responseBid',
    title: 'After 1C or 1D, bid a new suit at the one level first',
    auctionContext: { role: 'responder', auction: ['1C'], openerStrain: 'minor' },
    calls: ['1D', '1H', '1S'],
    callRefinement: refineNewSuitAtOneLevel, // chooses according to guidance below
    callCategory: ['forcing'],
    priority: { rank: 100, note: 'Responder priority with 6+ points.' },
    appliesWhen: { hcp: { min: 6 }, suitLengths: [{ min: 4 }]},
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
    auctionContext: { role: 'responder', auction: ['1D'] },
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
    auctionContext: { role: 'responder', auction: ['1D'] },
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
    auctionContext: { role: 'responder', auction: ['1C'], openerStrain: 'minor' },
    calls: ['1NT'],
    callCategory: ['signoff'],
    priority: { rank: 60 },
    appliesWhen: { hcp: { min: 6, max: 10 }, shape: { balanced: true, noFourCardMajor: true } },
    meaning: 'Balanced minimum response with no four-card major.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-minor-w/-2nt',
    // Use 2NT after a minor opening with invitational balanced values and no four-card major.
    kind: 'responseBid',
    title: 'After 1C or 1D, respond 2NT with invitational balanced values and no four-card major',
    auctionContext: { role: 'responder', auction: ['1C'], openerStrain: 'minor' },
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
    auctionContext: { role: 'responder', auction: ['1C'], openerStrain: 'minor' },
    calls: ['3NT'],
    callCategory: ['signoff'],
    priority: { rank: 70 },
    appliesWhen: { hcp: { min: 13, max: 15 }, shape: { balanced: true, noFourCardMajor: true } },
    meaning: 'Balanced game response with no four-card major.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-minor-w/-raise-to-two',
    // Make a minimum single raise of opener's minor with 6-10 HCP, long support, and no four-card
    // major.
    kind: 'responseBid',
    title: 'Raise opener minor to two with 6-10 and support',
    auctionContext: { role: 'responder', auction: ['1C'], openerStrain: 'minor' },
    calls: ['2C', '2D'],
    callRefinement: refineRaisePartnerSuitBy1, // need to choose based on actual auction
    priority: { rank: 40 },
    appliesWhen: { hcp: { min: 6, max: 10 }, supportFor: 'partnersOpenedSuit', 
                   supportLength: { min: 5 }, shape: { noFourCardMajor: true } },
    guidance: ['Usually this means five-card support if convenient minor has three cards.'],
    meaning: 'Minimum raise of opener minor, usually with five-card or longer support and no ' +
             'four-card major.',
    certainty: 'medium',
  },
  //
  {
    id: 'respond-to-minor-w/-limit-raise',
    // Make a limit raise to three of opener's minor with 11-12 HCP, long support, and no four-card
    // major.  Opener should pass.
    kind: 'responseBid',
    title: 'Raise opener minor to three with 11-12 and support',
    auctionContext: { role: 'responder', auction: ['1C'], openerStrain: 'minor' },
    calls: ['3C', '3D'],
    callRefinement: refineRaisePartnerSuitBy2, // chooses the right suit from actual auction
    callCategory: ['invitational'],
    priority: { rank: 45 },
    appliesWhen: { hcp: { min: 11, max: 12 }, supportFor: 'partnersOpenedSuit', 
                   supportLength: { min: 5 }, shape: { noFourCardMajor: true } },
    meaning: 'Limit raise of opener minor.',
    guidance: ['Some play inverted minors, where single raise is strong, and jump is weak.'],
    certainty: 'medium',
  },
  //
  {
    id: 'respond-to-minor-w/-13plus-start-new-suit',
    // With strong hand and support for opener's minor, first bid a new suit and show support later.
    kind: 'responseBid',
    title: 'With 13+ and minor support, start with a new suit',
    auctionContext: { role: 'responder', auction: ['1C'], openerStrain: 'minor' },
    calls: ['1D', '1H', '1S', '2C'],
    callRefinement: refineToCheapestNewSuitBids, // chooses best suit for minimum response
    callCategory: ['forcing'],
    priority: { rank: 95 },
    appliesWhen: { hcp: { min: 13 }, supportFor: 'partnersOpenedSuit', suitLengths: [{ min: 4 }] },
    guidance: ['Plan to raise later.'],
    meaning: 'Start with a new suit and plan to show the minor support later.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-minor-w/-weak-jump-shift-modern',
    // Modern weak jump shift after a minor opening: jump in a long new suit with a weak hand.
    kind: 'responseBid',
    title: 'Modern weak jump shift after one of a minor',
    auctionContext: { role: 'responder', auction: ['1C'], openerStrain: 'minor' },
    calls: ['2D', '2H', '2S', '3C', '3D'],
    callRefinement: refineJumpNewSuit,  // chooses long suit for minium response
    agreement: { setting: 'jumpShift', value: 'weak',
                 note: 'Modern weak jump-shift treatment.' },
    appliesWhen: { hcp: { min: 4, max: 7 }, suitLengths: [{ min: 6 }] },
    meaning: 'Weak hand with a six-card suit, preemptive.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-minor-w/-strong-jump-shift-classic',
    // Classic strong jump shift after a minor opening: jump in long new suit to show points.
    kind: 'responseBid',
    title: 'Classic strong jump shift after one of a minor',
    auctionContext: { role: 'responder', auction: ['1C'], openerStrain: 'minor' },
    calls: ['2D', '2H', '2S', '3C', '3D'],
    callRefinement: refineJumpNewSuit, // chooses longest best minium suit response
    callCategory: ['gameForcing'],
    agreement: { setting: 'jumpShift', value: 'strong',
                 note: 'Classic Standard strong jump-shift treatment.' },
    appliesWhen: { hcp: { min: 17 }, suitLengths: [{ min: 5 }] },
    guidance: ['With a good five-card or longer suit and 18-19 points, jump-shift to new suit.'],
    meaning: 'Classic Standard treats jump shifts as strong.',
    certainty: 'high',
  },
  {
    id: 'respond-to-minor-w/-4nt-blackwood',
    // Use 4NT as Blackwood after a minor-suit opening when responder has strong slam values.
    kind: 'responseBid',
    title: 'Use Blackwood with strong slam-going values after a minor opening',
    auctionContext: { role: 'responder', auction: ['1C'], openerStrain: 'minor' },
    calls: ['4NT'],
    callCategory: ['conventional'],
    appliesWhen: { hcp: { min: 20 } },
    meaning: 'Blackwood asks partner for aces.',
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
    auctionContext: { role: 'responder', auction: ['1H'], openerStrain: 'major' },
    calls: ['Pass'],
    callCategory: ['signoff'],
    appliesWhen: { totalPoints: { min: 0, max: 5 }, supportFor: 'partnersOpenedSuit', 
                   supportLength: { min: 3 } },
    meaning: 'Game is unlikely.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-major-w/-pass-0-5',
    // General pass option after a major opening when responder has only 0-5 HCP.
    kind: 'responseBid',
    title: 'Pass one of a major with 0-5',
    auctionContext: { role: 'responder', auction: ['1H'], openerStrain: 'major' },
    calls: ['Pass'],
    callCategory: ['signoff'],
    appliesWhen: { hcp: { min: 0, max: 5 } },
    meaning: 'Responder has too few points to bid.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-minor-w/-pass-0-5',
    // Pass a minor opening when responder has only 0-5 HCP.
    kind: 'responseBid',
    title: 'Pass one of a minor with 0-5',
    auctionContext: { role: 'responder', auction: ['1D'], openerStrain: 'minor' },
    calls: ['Pass'],
    callCategory: ['signoff'],
    appliesWhen: { hcp: { min: 0, max: 5 } },
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
    auctionContext: { role: 'responder', auction: ['1H'], openerStrain: 'major' },
    calls: ['2H', '2S'],
    callRefinement: refineRaisePartnerSuitBy1, // choose opener's suit
    appliesWhen: { totalPoints: { min: 6, max: 10 }, supportFor: 'partnersOpenedSuit', 
                   supportLength: { min: 3 } },
    meaning: 'Raise partner major to the two level.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-major-w/-support-limit-raise-four-card',
    // Jump raise partner's major to the three level with 11-12 support points and 4+-card support.
    kind: 'responseBid',
    title: 'Limit raise with four-card support and 11-12',
    auctionContext: { role: 'responder', auction: ['1H'], openerStrain: 'major' },
    calls: ['3H', '3S'],
    callRefinement: refineRaisePartnerSuitBy2, // chooses opener's suit
    callCategory: ['invitational'],
    appliesWhen: { totalPoints: { min: 11, max: 12 }, supportFor: 'partnersOpenedSuit', 
                   supportLength: { min: 4 } },
    meaning: 'Jump to the three level as a limit raise with four-card or longer support.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-major-w/-support-limit-raise-three-card',
    // Exactly three-card support and 11-12 support points, use forcing 1NT first and raise later.
    kind: 'responseBid',
    title: 'Three-card support, 11-12: bid 1NT then raise',
    auctionContext: { role: 'responder', auction: ['1H'], openerStrain: 'major' },
    calls: ['1NT'],
    callCategory: ['forcing'],
    agreement: { setting: 'majorOneNtResponse', value: 'forcing',
                 note: 'This 1NT-then-raise route relies on a forcing/semi-forcing 1NT response.' },
    appliesWhen: { totalPoints: { min: 11, max: 12 }, supportFor: 'partnersOpenedSuit', 
                   supportLength: { min: 3, max: 3 } },
    meaning: 'With exactly three-card support and limit-raise values, bid 1NT first and then ' +
             'raise to the three level.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-major-w/-three-card-support-13plus-bid-new-suit-then-raise',
    // Exactly three-card support and 13+ total points, bid a new suit and later raise to game.
    kind: 'responseBid',
    title: 'With 13+ and three-card major support, bid a new suit then raise to game',
    auctionContext: { role: 'responder', auction: ['1H'], openerStrain: 'major' },
    calls: ['1S', '2C', '2D', '2H'],
    callRefinement: refineToCheapestNewSuitBids, // chooses min longest suit response
    callCategory: ['forcing'],
    // TODO: needs agreement?
    appliesWhen: { totalPoints: { min: 13 }, supportFor: 'partnersOpenedSuit',
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
    auctionContext: { role: 'responder', auction: ['1H'], openerStrain: 'major' },
    calls: ['1S', '2C', '2D', '2H'],
    callRefinement: refineToCheapestNewSuitBids, // chooses min longest suit response
    callCategory: ['forcing'],
    agreement: { setting: 'majorGameForceWithSupport', value: 'newSuitThenRaise',
                 note: 'Show game-forcing support by bidding a new suit first, then raising.' },
    appliesWhen: { totalPoints: { min: 13 }, supportFor: 'partnersOpenedSuit',
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
    auctionContext: { role: 'responder', auction: ['1H'], openerStrain: 'major' },
    calls: ['2NT'],
    callCategory: ['conventional'],
    agreement: { setting: 'majorGameForceWithSupport', value: 'jacoby2NT',
                 note: 'Jacoby 2NT is an artificial game-forcing raise with 4+ major support.' },
    appliesWhen: { hcp: { min: 13 }, supportFor: 'partnersOpenedSuit', supportLength: { min: 4 } },
    meaning: 'Some partnerships use 2NT as artificial Jacoby 2NT, showing four-card or longer ' +
             'support and 13+ points.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-major-w/-support-splinter',
    // splinter: double-jump in short new suit to show 4+ support, game-forcing, and shortness.
    kind: 'responseBid',
    title: 'Show game-forcing major support with a splinter',
    auctionContext: { role: 'responder', auction: ['1H'], openerStrain: 'major' },
    calls: ['3S', '4C', '4D', '4H'],
    callRefinement: (calls: Call[], context: RuleEvaluationContext) : CallRefinementResult => {
      // resolve which declared double jumps are legal over the actual 1H or 1S opening.
      return refineNewSuitByExtraLevels(calls, context, 2, 'double-jump');
    },
    callCategory: ['gameForcing', 'conventional'],
    agreement: { setting: 'splinters', value: true,
                 note: 'Double-jump new suit: 4+ support plus singleton/void in the bid suit.' },
    appliesWhen: { totalPoints: { min: 13, max: 15 }, supportFor: 'partnersOpenedSuit',
                   supportLength: { min: 4 }, suitLengths: [{ max: 1 }] },
    // relative to rule 'respond-to-major-w/-four-card-support-13plus-bid-new-suit-then-raise' at 80
    priority: { rank: 95 }, 
    meaning: 'Artificial double jump showing major support and shortness in the bid suit.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-major-w/-support-preemptive-game-raise',
    // With 5+ card support and fewer than 10 total points, jump to game as a preemptive raise.
    kind: 'responseBid',
    title: 'Preemptively raise partner major to game with five-card support',
    auctionContext: { role: 'responder', auction: ['1H'], openerStrain: 'major' },
    calls: ['4H', '4S'],
    callRefinement: (calls: Call[], context: RuleEvaluationContext): CallRefinementResult => {
      // The broad declaration contains both 4H and 4S; keep only four of partner's actual major.
      return refineRaiseToLevel(calls, context, 4);
    },
    appliesWhen: { totalPoints: { max: 9 }, supportFor: 'partnersOpenedSuit', supportLength: { min: 5 } },
    meaning: 'Preemptive raise to game with long support and fewer than 10 support points.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-major-w/o-support-new-suit-one-level',
    // Without support for opener's major, bid an available 4+ card new suit at the one
    // level.
    kind: 'responseBid',
    title: 'Without support, bid a new suit at the one level with 6+',
    auctionContext: { role: 'responder', auction: ['1H'], },
    calls: ['1S'],
    callCategory: ['forcing'],
    priority: { rank: 100 },
    appliesWhen: { hcp: { min: 6 }, supportLength: { max: 2 }, 
                   suitLengths: [{ suit: 'S', min: 4 }] },
    guidance: ["Use a new suit at the one level to show no support for partner's major."],
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-major-w/o-support-new-suit-two-level-standard',
    // Natural non-jump new-suit response at the two level after a major opening.
    kind: 'responseBid',
    title: 'Standard new-suit response at the two level',
    auctionContext: { role: 'responder', auction: ['1H'], openerStrain: 'major' },
    calls: ['2C', '2D', '2H', ],
    callRefinement: refineToCheapestNewSuitBids, // chooses longest new suit at lowest level
    callCategory: ['forcing'],
    agreement: { setting: 'twoLevelNewSuitResponse', value: 'standard',
                 note: 'Standard: 11+ and forcing, but not forcing to game.' },
    priority: { rank: 90 },
    appliesWhen: (call: Call, context: RuleEvaluationContext): AppliesWhenResult => {
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
    auctionContext: { role: 'responder', auction: ['1H'], openerStrain: 'major' },
    calls: ['2C', '2D', '2H', ],
    callRefinement: refineToCheapestNewSuitBids, // chooses longest new suit at lowest level
    callCategory: ['gameForcing'],
    agreement: { setting: 'twoLevelNewSuitResponse', value: 'twoOverOne',
                 note: '2/1 treatment: 13+ and game forcing.' },
    priority: { rank: 90 },
    appliesWhen: (call: Call, context: RuleEvaluationContext): AppliesWhenResult => {
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
    auctionContext: { role: 'responder', auction: ['1H'], openerStrain: 'major' },
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
    auctionContext: { role: 'responder', auction: ['1H'], openerStrain: 'major' },
    calls: ['1NT'],
    callCategory: ['signoff'],
    agreement: { setting: 'majorOneNtResponse', value: 'nonForcing',
                 note: 'Standard non-forcing 1NT response to a major.' },
    appliesWhen: { hcp: { min: 6, max: 10 }, supportLength: { max: 2 } },
    meaning: 'Playing Standard, 1NT over a major shows 6-10 and is non-forcing.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-major-w/o-support-3nt',
    // Bid 3NT with 13-15 balanced HCP, no support for opener's major, and no four-card other major.
    kind: 'responseBid',
    title: 'Without support, respond 3NT with 13-15 balanced',
    auctionContext: { role: 'responder', auction: ['1H'], openerStrain: 'major' },
    calls: ['3NT'],
    callCategory: ['signoff'],
    appliesWhen: { hcp: { min: 13, max: 15 }, supportLength: { max: 2 }, shape: { balanced: true, noFourCardOtherMajor: true } },
    meaning: 'Balanced game response without support.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-major-w-weak-jump-shift-modern',
    // Modern weak jump shift after a major opening: jump in a 6+ card new suit with 4-7 HCP.
    kind: 'responseBid',
    title: 'Modern weak jump shift after one of a major',
    auctionContext: { role: 'responder', auction: ['1H'], openerStrain: 'major' },
    calls: ['2S', '3C', '3D', '3H'],
    callRefinement: refineJumpNewSuit, // chooses 6+ card suit
    agreement: { setting: 'jumpShift', value: 'weak',
                 note: 'Modern weak jump-shift treatment.' },
    appliesWhen: { hcp: { min: 4, max: 7 }, suitLengths: [{ min: 6 }] },
    meaning: 'Weak hand with a six-card suit, preemptive.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-major-w/-strong-jump-shift-classic',
    // Classic strong jump shift a good 5+ card new suit with strong values.
    kind: 'responseBid',
    title: 'Classic strong jump shift after one of a major',
    auctionContext: { role: 'responder', auction: ['1H'], openerStrain: 'major' },
    calls: ['2S', '3C', '3D', '3H'],
    callRefinement: refineJumpNewSuit, // chooses long suit to jump to
    callCategory: ['gameForcing'],
    agreement: { setting: 'jumpShift', value: 'strong',
                 note: 'Classic Standard strong jump-shift treatment.' },
    appliesWhen: { hcp: { min: 17 }, suitLengths: [{ min: 5 }] },
    meaning: 'Strong jump shift showing a good long suit and slam interest.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-major-w/-4nt-blackwood',
    // Use 4NT as Blackwood after a major-suit opening when responder has strong slam-going values.
    kind: 'responseBid',
    title: 'Use Blackwood with strong slam-going values after a major opening',
    auctionContext: { role: 'responder', auction: ['1H'], openerStrain: 'major' },
    calls: ['4NT'],
    callCategory: ['conventional'],
    appliesWhen: { hcp: { min: 20 } },
    meaning: 'Blackwood asks partner for aces.',
    certainty: 'high',
  },
  // Responding to notrump
  //
  {
    id: 'respond-to-1nt-w/-pass-0-7-balanced',
    // Pass a 1NT opening with a weak balanced hand.
    kind: 'responseBid',
    title: 'Pass 1NT with 0-7 balanced',
    auctionContext: { role: 'responder', auction: ['1NT'] },
    calls: ['Pass'],
    callCategory: ['signoff'],
    appliesWhen: { hcp: { min: 0, max: 7 }, shape: { balanced: true } },
    meaning: 'Partscore decision.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-1nt-w/-2nt-8-9-balanced',
    // Raise 1NT to 2NT with 8-9 balanced HCP to invite game.
    kind: 'responseBid',
    title: 'Invite game over 1NT with 8-9 balanced',
    auctionContext: { role: 'responder', auction: ['1NT'] },
    calls: ['2NT'],
    callCategory: ['invitational'],
    appliesWhen: { hcp: { min: 8, max: 9 }, shape: { balanced: true } },
    meaning: 'Invitational raise to 2NT.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-1nt-w/-3nt-10-15-balanced',
    // Raise 1NT directly to 3NT with 10-15 balanced HCP to place the contract in game.
    kind: 'responseBid',
    title: 'Bid game over 1NT with 10-15 balanced',
    auctionContext: { role: 'responder', auction: ['1NT'] },
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
    auctionContext: { role: 'responder', auction: ['1NT'] },
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
    auctionContext: { role: 'responder', auction: ['1NT'] },
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
    auctionContext: { role: 'responder', auction: ['1NT'] },
    calls: ['5NT'],
    callCategory: ['forcing'],
    appliesWhen: { hcp: { min: 20, max: 21 }, shape: { balanced: true } },
    meaning: 'Grand slam invitation.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-1nt-w/-7nt-22plus-balanced',
    // Bid 7NT directly with 22+ balanced HCP.
    kind: 'responseBid',
    title: 'Bid grand slam over 1NT with 22+ balanced',
    auctionContext: { role: 'responder', auction: ['1NT'] },
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
    auctionContext: { role: 'responder', auction: ['1NT'] },
    calls: ['2C'],
    agreement: { setting: 'stayman', value: true, 
                 note: 'Stayman asks a notrump opener for a four-card major.' },
    callCategory: ['forcing', 'conventional'],
    appliesWhen: { hcp: { min: 8 }, suitLengths: [{ suit: 'major', min: 4 } ] },
    guidance: ['Stayman asks opener for a four-card major.', 'Can be used even if short in clubs.'],
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-1nt-w/-transfer-to-hearts',
    // Use the 2D Jacoby transfer with a 5+ card heart suit, asking opener to bid 2H.
    kind: 'responseBid',
    title: 'Transfer to hearts over 1NT',
    auctionContext: { role: 'responder', auction: ['1NT'] },
    calls: ['2D'],
    agreement: { setting: 'jacobyTransfers', value: true, 
                 note: 'Jacoby transfer to responder major.' },
    callCategory: ['conventional'],
    appliesWhen: { hcp: { min: 0 }, suitLengths: [{ suit: 'H', min: 5 }] },
    guidance: ['Use transfers to have the partner with the concealed points bid the contract.'],
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-1nt-w/-transfer-to-spades',
    // Use the 2H Jacoby transfer with a 5+ card spade suit, asking opener to bid 2S.
    kind: 'responseBid',
    title: 'Transfer to spades over 1NT',
    auctionContext: { role: 'responder', auction: ['1NT'] },
    calls: ['2H'],
    agreement: { setting: 'jacobyTransfers', value: true, 
                 note: 'Jacoby transfer to responder major.' },
    callCategory: ['conventional'],
    appliesWhen: { hcp: { min: 0 }, suitLengths: [{ suit: 'S', min: 5 }] },
    guidance: ['Use transfers to have the partner with the concealed points bid the contract.'],
    certainty: 'high',
  },
  //
  //
  {
    id: 'respond-to-1nt-w/-3c-3d-natural-invitational',
    // Bid 3C or 3D naturally with 8-9 HCP and a good six-card minor to invite further action.
    kind: 'responseBid',
    title: '3C or 3D over 1NT with a good six-card minor and 8-9',
    auctionContext: { role: 'responder', auction: ['1NT'] },
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
    // Bid 4H or 4S naturally with game values and a 6+ card major.
    kind: 'responseBid',
    title: 'Bid four of a major naturally over 1NT with game values',
    auctionContext: { role: 'responder', auction: ['1NT'] },
    calls: ['4H', '4S'],
    callCategory: ['signoff'],
    appliesWhen: { hcp: { min: 10, max: 15 }, suitLengths: [{ min: 6 }] },
    meaning: 'Natural game signoff with a six-card or longer major.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-1nt-w/-texas-transfer-to-hearts',
    // Texas transfer: bid 4D with a long heart suit, forcing opener to 4H.
    kind: 'responseBid',
    title: 'Texas transfer to hearts over 1NT',
    auctionContext: { role: 'responder', auction: ['1NT'] },
    calls: ['4D'],
    callCategory: ['forcing', 'conventional'],
    agreement: { setting: 'texasTransfers', value: true,
                 note: '4D asks opener to bid 4H.' },
    appliesWhen: { hcp: { min: 10, max: 15 }, suitLengths: [{ suit: 'H', min: 6 }] },
    meaning: 'Texas transfer asks opener to bid 4H.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-1nt-w/-texas-transfer-to-spades',
    // Texas transfer: bid 4H with a long spade suit, forcing opener to 4S.
    kind: 'responseBid',
    title: 'Texas transfer to spades over 1NT',
    auctionContext: { role: 'responder', auction: ['1NT'] },
    calls: ['4H'],
    callCategory: ['forcing', 'conventional'],
    agreement: { setting: 'texasTransfers', value: true,
                 note: '4H asks opener to bid 4S.' },
    appliesWhen: { hcp: { min: 10, max: 15 }, suitLengths: [{ suit: 'S', min: 6 }] },
    meaning: 'Texas transfer asks opener to bid 4S.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-1nt-w/-3h-3s-slam-interest',
    // Bid 3H or 3S naturally with a 6+ card major and slam-interest strength.
    kind: 'responseBid',
    title: '3H or 3S over 1NT with slam interest',
    auctionContext: { role: 'responder', auction: ['1NT'] },
    calls: ['3H', '3S'],
    callCategory: ['forcing'],
    appliesWhen: { hcp: { min: 16 }, suitLengths: [{ min: 6 }]},
    meaning: 'Natural major-suit bid with slam interest.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-1nt-w/-4c-gerber',
    // Use 4C as Gerber after 1NT to ask opener for aces with slam-going values.
    kind: 'responseBid',
    title: 'Gerber over 1NT',
    auctionContext: { role: 'responder', auction: ['1NT'] },
    calls: ['4C'],
    callCategory: ['conventional'],
    appliesWhen: { hcp: { min: 18 } },
    meaning: 'Gerber asks partner for aces after a notrump opening.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-2nt-w/-pass-0-3-balanced',
    // Pass a 2NT opening with a balanced 0-3 HCP hand.
    kind: 'responseBid',
    title: 'Pass 2NT with 0-3 balanced',
    auctionContext: { role: 'responder', auction: ['2NT'] },
    calls: ['Pass'],
    callCategory: ['signoff'],
    appliesWhen: { hcp: { min: 0, max: 3 }, shape: { balanced: true } },
    meaning: 'Partscore decision over 20-21 balanced opener.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-2nt-w/-3nt-4-10-balanced',
    // Raise 2NT to 3NT with 4-10 balanced HCP to play game.
    kind: 'responseBid',
    title: 'Bid 3NT over 2NT with 4-10 balanced',
    auctionContext: { role: 'responder', auction: ['2NT'] },
    calls: ['3NT'],
    callCategory: ['signoff'],
    appliesWhen: { hcp: { min: 4, max: 10 }, shape: { balanced: true } },
    meaning: 'Game in notrump.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-2nt-w/-4h-4s-natural-game',
    // Bid 4H or 4S naturally over 2NT with 4-10 HCP and a 6+ card major.
    kind: 'responseBid',
    title: 'Bid four of a major naturally over 2NT with game values',
    auctionContext: { role: 'responder', auction: ['2NT'] },
    calls: ['4H', '4S'],
    // TODO: call refiner for which is 6 long
    callCategory: ['signoff'],
    appliesWhen: { hcp: { min: 4, max: 10 }, suitLengths: [{ suit: 'major', min: 6 }] },
    meaning: 'Natural game signoff with a six-card or longer major.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-2nt-w/-texas-transfer-to-hearts',
    // Optional Texas transfer over 2NT: bid 4D with a long heart suit, asking opener to bid 4H.
    kind: 'responseBid',
    title: 'Texas transfer to hearts over 2NT',
    auctionContext: { role: 'responder', auction: ['2NT'] },
    calls: ['4D'],
    callCategory: ['forcing', 'conventional'],
    agreement: { setting: 'texasTransfers', value: true,
                 note: '4D asks opener to bid 4H.' },
    appliesWhen: { hcp: { min: 4, max: 10 }, suitLengths: [{ suit: 'H', min: 6 }] },
    meaning: 'Texas transfer asks opener to bid 4H.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-2nt-w/-texas-transfer-to-spades',
    // Optional Texas transfer over 2NT: bid 4H with a long spade suit, asking opener to bid 4S.
    kind: 'responseBid',
    title: 'Texas transfer to spades over 2NT',
    auctionContext: { role: 'responder', auction: ['2NT'] },
    calls: ['4H'],
    callCategory: ['forcing', 'conventional'],
    agreement: { setting: 'texasTransfers', value: true,
                 note: '4H asks opener to bid 4S.' },
    appliesWhen: { hcp: { min: 4, max: 10 }, suitLengths: [{ suit: 'S', min: 6 }] },
    meaning: 'Texas transfer asks opener to bid 4S.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-2nt-w/-4c-gerber',
    // Use 4C as Gerber after 2NT to ask opener for aces with 13+ HCP.
    kind: 'responseBid',
    title: 'Gerber over 2NT',
    auctionContext: { role: 'responder', auction: ['2NT'] },
    calls: ['4C'],
    callCategory: ['conventional'],
    appliesWhen: { hcp: { min: 13 } },
    meaning: 'Gerber asks partner for aces after a notrump opening.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-2nt-w/-4nt-11-12-balanced',
    // Use quantitative 4NT over 2NT with 11-12 balanced HCP to invite a small slam.
    kind: 'responseBid',
    title: 'Invite slam over 2NT with 11-12 balanced',
    auctionContext: { role: 'responder', auction: ['2NT'] },
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
    auctionContext: { role: 'responder', auction: ['2NT'] },
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
    auctionContext: { role: 'responder', auction: ['2NT'] },
    calls: ['5NT'],
    callCategory: ['forcing'],
    appliesWhen: { hcp: { min: 16, max: 16 }, shape: { balanced: true } },
    meaning: 'Grand slam invitation.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-2nt-w/-stayman',
    // Use 3C Stayman over 2NT with 4+ HCP and at least one four-card major.
    kind: 'responseBid',
    title: 'Stayman over 2NT',
    auctionContext: { role: 'responder', auction: ['2NT'] },
    calls: ['3C'],
    agreement: { setting: 'stayman', value: true, 
                 note: 'Stayman asks a notrump opener for a four-card major.' },
    callCategory: ['forcing', 'conventional'],
    appliesWhen: { hcp: { min: 4 }, suitLengths: [{ suit: 'major', min: 4 }] },
    meaning: 'Stayman asking for a major suit.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-2nt-w/-transfer-to-hearts',
    // Use 3D as a Jacoby transfer over 2NT with a 5+ card heart suit.
    kind: 'responseBid',
    title: 'Transfer to hearts over 2NT',
    auctionContext: { role: 'responder', auction: ['2NT'] },
    calls: ['3D'],
    agreement: { setting: 'jacobyTransfers', value: true, 
                 note: 'Jacoby transfer to responder major.' },
    callCategory: ['conventional'],
    appliesWhen: { hcp: { min: 0 }, suitLengths: [{ suit: 'H', min: 5 }] },
    guidance: ['Use transfers to have the partner with the concealed points bid the contract.'],
    certainty: 'high',
  },
  //
  {
    id: 'respond-to-2nt-w/-transfer-to-spades',
    // Use 3H as a Jacoby transfer over 2NT with a 5+ card spade suit.
    kind: 'responseBid',
    title: 'Transfer to spades over 2NT',
    auctionContext: { role: 'responder', auction: ['2NT'] },
    calls: ['3H'],
    agreement: { setting: 'jacobyTransfers', value: true, 
                 note: 'Jacoby transfer to responder major.' },
    callCategory: ['conventional'],
    appliesWhen: { hcp: { min: 0 }, suitLengths: [{ suit: 'S', min: 5 }] },
    guidance: ['Use transfers to have the partner with the concealed points bid the contract.'],
    certainty: 'high',
  },
 ];

export const OvercallRules: BidRule[] = [  ];
export const AdvanceRules: BidRule[] = [  ];
export const OpenerRebidRules: BidRule[] = [  ];

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
    // Weak escape form of Stayman; kept as note until decide how to incorporate it if I do.
    kind: 'footnote',
    title: 'Weak escape use of Stayman',
    auctionContext: { role: 'responder', auction: ['1NT'], openerStrain: 'NT' },
    meaning: 'With 0-7 points and short clubs, Stayman can be used as an escape, planning to ' +
             'pass opener\'s rebid.',
    guidance: ['Kept as a teaching note for now rather than an executable rule until the ' +
               'desired shape constraints are settled.'],
    certainty: 'high',
  },
  //
  {
    id: 'minor-relay-over-1nt-note',
    // Teaching note for the optional 2S relay to 3C used to escape into a long minor.
    kind: 'footnote',
    title: 'Optional 2S relay to 3C over 1NT',
    auctionContext: { role: 'responder', auction: ['1NT'], openerStrain: 'NT' },
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
  //   context: { role: 'opener', auction: [] },
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
    auctionContext: { role: 'responder', auction: ['1C'], openerStrain: 'minor' },
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
    auctionContext: { role: 'responder', auction: ['1NT'], openerStrain: 'NT' },
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
    auctionContext: { role: 'opener', auction: ['1NT'] },
    meaning: 'If responder makes a signoff bid, opener passes. If responder makes an ' +
             'invitational bid, opener passes with a minimum and accepts with a maximum.  If ' +
             'responder makes a forcing bid, opener makes a descriptive rebid.',
    guidance: ['Example: after 1NT-2NT, opener passes with 15-16 and bids 3NT with 17 or a good 16.'],
    certainty: 'high',
  },
];

///
//// Bidding Rule Bid Refinements
///

/// refineSimpleRaise returns a simple raise one level above opening in the same suit.  Resolve the
/// 2H/2S or 2C/2D declaration to the one call matching the actual opening.
///
function refineRaisePartnerSuitBy1 (calls: Call[], context: RuleEvaluationContext)
    : CallRefinementResult {
  const opening = getPartnerOpeningBid(context);
  if (opening === null) {
    return { calls: [], telemetryLines: ['No opening bid is available for a simple raise.'] };
  }
  return refineRaiseToLevel(calls, context, opening.level + 1);
}

/// refineLimitRaise chooses a bid two levels above partner's one-level suit opening.  Resolve
/// the several declared raise calls to the suit the partner actually opened.
///
function refineRaisePartnerSuitBy2 (calls: Call[], context: RuleEvaluationContext)
    : CallRefinementResult {
  const opening = getPartnerOpeningBid(context);
  if (opening === null) {
    return { calls: [], telemetryLines: ['No opening bid is available for a limit raise.'] };
  }
  return refineRaiseToLevel(calls, context, opening.level + 2);
}

/// refineRaiseToLevel chooses the call that raises partner's bid suit to targetLevel.  This is the
/// shared mechanism used by simple, jump, and direct game raises.
///
function refineRaiseToLevel (calls: Call[], context: RuleEvaluationContext,
                             targetLevel: number): CallRefinementResult {
  const opening = getPartnerOpeningBid(context);
  if (opening === null || opening.strain === 'NT') {
    return { calls: [], telemetryLines: ['No suit opening is available to raise.'] };
  }
  const wantedCall = `${targetLevel}${opening.strain}` as SuitBid;
  const refined = calls.filter((call) => call === wantedCall);
  return {calls: refined, 
          telemetryLines: [`Raise partner's ${opening.strain} to ${targetLevel}${opening.strain}.`] };
}

/// refineNewSuitAtOneLevel chooses non-jump new-suit candidates, then chooses only those at the one
/// level.  Used when the rule specifically gives one-level new-suit responses priority.
///
function refineNewSuitAtOneLevel (calls: Call[], context: RuleEvaluationContext): CallRefinementResult {
  const result = refineToCheapestNewSuitBids(calls, context);
  const refined = result.calls.filter((call) => parseSuitBid(call)?.level === 1);
  return {calls: refined,
          telemetryLines: ['Keep only one-level new-suit calls legal over the actual opening.'] };
}

/// refineToCheapestNewSuitBids chooses the cheapest legal call in a new suit over partner's actual
/// opening suit, thereby emoving raises and jump shifts.  This does not yet choose among multiple
/// eligible suits by hand length or up-the-line/down-the-line preference; candidate hand
/// constraints do that only partially.
///
function refineToCheapestNewSuitBids (calls: Call[], context: RuleEvaluationContext)
    : CallRefinementResult {
  const opening = getPartnerOpeningBid(context);
  if (opening === null) {
    return { calls: [], telemetryLines: ['No opening bid is available for a new-suit response.'] };
  }
  const refined = calls.filter((call) => {
      const candidate = parseSuitBid(call);
      // This refiner is specifically for a new suit, never NT, and while all current rules have no
      // NT call candidates, this is defensive for future rules.
      if (candidate === null || candidate.strain === 'NT') {
        return false;
      }
      return cheapestNewSuitBid(opening, candidate.strain) === call;
    });
  return {calls: refined,
          telemetryLines: ['Keep only non-jump new-suit calls legal over the actual opening.'] };
}

/// refineJumpNewSuit chooses a jump to a new suit that is the cheapest legal bid in each suit.
/// This is a one liner so that it can be used in rule declaration to satisfy refineCandidates.
///
function refineJumpNewSuit (calls: Call[], context: RuleEvaluationContext): CallRefinementResult {
  return refineNewSuitByExtraLevels(calls, context, 1, 'single-jump');
}

/// refineNewSuitByExtraLevels chooses new-suit calls that are extraLevels above the cheapest legal
/// bid in that suit.  A value of one represents a jump shift; two represents a double-jump
/// splinter.
function refineNewSuitByExtraLevels (calls: Call[], context: RuleEvaluationContext,
                                     extraLevels: number, label: string): CallRefinementResult {
  const opening = getPartnerOpeningBid(context);
  if (opening === null) {
    return {calls: [], 
            telemetryLines: [`No opening bid is available for a ${label} new-suit response.`]};
  }
  const refined = calls.filter((call) => {
    const candidate = parseSuitBid(call);
    // Probably excessively defensive, but make sure NT is not in candidates list
    if (candidate === null || candidate.strain === 'NT') {
      return false;
    }
    const cheapest = cheapestNewSuitBid(opening, candidate.strain);
    if (cheapest === null) {
      return false;
    }
    const cheapestParsed = parseSuitBid(cheapest);
    if (cheapestParsed === null) { // almost certainly excessively defensive
      return false;
    }
    return candidate.level === cheapestParsed.level + extraLevels;
  });
  return {calls: refined, 
          telemetryLines:[`Keep only ${label} new-suit calls over the actual opening.`]};
}

/// cheapestNewSuitBid returns the cheapest legal contract bid in a different strain after opening.
/// Callers that mean "new suit" reject NT candidates before calling this function.  If opening is
/// NT, any suit must be bid at the next level because NT outranks every suit at the current level.
///
function cheapestNewSuitBid (opening: { level: number; strain: Strain }, strain: Strain): SuitBid | null {
  if (strain === opening.strain) {
    return null;
  }
  // let level = opening.level;
  // if (getBidRank(level, strain) <= getBidRank(opening.level, opening.strain)) {
  //   level += 1;
  // }
  const level = opening.strain === 'NT' ||
                strainOrder.indexOf(strain) < strainOrder.indexOf(opening.strain)
                ? opening.level + 1 : opening.level;
  if (level > 7) {
    return null;
  }
  return `${level}${strain}` as SuitBid;
}

/// getBidRank returns an absolute index into a virtual table of all possible bids.  If the table
/// had rows 1C..1NT, 2C..2NT, etc., then this function returns the row major index of the bid.
///
// function getBidRank (level: number, strain: Strain): number {
//   return (level - 1) * strainOrder.length + strainOrder.indexOf(strain);
// }


/// refineOneLevelSuitOpening chooses the one-level suit opening implied by five-card-major and
/// convenient-minor priorities.  Branch order is significant: with two 5+ majors choose the
/// higher-ranking spade suit; otherwise use the longer minor, breaking a 4-4 minor tie with 1D and
/// a 3-3 tie with 1C.
///
function refineOneLevelSuitOpening (calls: Call[], context: RuleEvaluationContext): CallRefinementResult {
  const lengths = context.handFacts.lengths;
  let wantedCall: Call;
  if (lengths.S >= 5) {
    wantedCall = '1S';
  } else if (lengths.H >= 5) {
    wantedCall = '1H';
  } else if (lengths.D > lengths.C) {
    wantedCall = '1D';
  } else if (lengths.C > lengths.D) {
    wantedCall = '1C';
  } else if (lengths.D >= 4) {
    wantedCall = '1D';
  } else {
    wantedCall = '1C';
  }
  return { calls: calls.filter((call) => call === wantedCall),
           telemetryLines: [`One-level suit opening resolves to ${wantedCall} ` +
                            `by five-card-major/convenient-minor priorities.`]};
}

///
//// Bidding Rule When Applies Functions
///

/// guidelineOf20Applies tests the Rule of 20 for a hand below the normal 12-HCP opening.  If HCP
/// + the lengths of the two longest suits >= 20 -> open.
///
function guidelineOf20Applies (_call: Call, context: RuleEvaluationContext): AppliesWhenResult {
  const lengths = Object.values(context.handFacts.lengths).sort((a, b) => b - a);
  const value = context.handFacts.hcp + (lengths[0] ?? 0) + (lengths[1] ?? 0);
  const pass = context.handFacts.hcp < 12 && value >= 20;
  return {
    success: pass,
    telemetryLines: [
      `${pass ? 'APPLIES' : 'FAIL'}: Guideline of 20 for a sub-12-HCP hand = ' +
      'HCP ${context.handFacts.hcp} + ` + `${lengths[0] ?? 0} + ${lengths[1] ?? 0} = ${value}.`, ],
  };
}

/// oneNtFiveCardLengthUpgradeApplies tests the optional 1NT open when there is a 5+ card major,
/// adding one point for that length.  
///
function oneNtFiveCardLengthUpgradeApplies (_call: Call, context: RuleEvaluationContext,
                                            system: BiddingSystem): AppliesWhenResult {
  const normalMinimum = system.oneNtOpening === '15-17' ? 15 : 16;
  const longestSuit = Math.max(...Object.values(context.handFacts.lengths));
  const success = context.handFacts.balanced && context.handFacts.hcp === normalMinimum - 1 && 
               longestSuit >= 5;
  return {
    success: success,
    telemetryLines: [
      `${success ? 'APPLIES' : 'FAIL'}: 1NT five-card length upgrade needs balanced, ` +
      `${normalMinimum - 1} HCP, and a five-card suit; HCP=${context.handFacts.hcp}, longest=${longestSuit}.`,
    ],
  };
}

/// majorTwoLevelNewSuitApplies tests a non-jump two-level new-suit response to a major opening.
/// The responder must meet the configured HCP threshold, have no major support, and have enough
/// length in the bid suit; 2H over 1S requires five hearts while minor-suit responses require four.
///
function majorTwoLevelNewSuitApplies (call: Call, context: RuleEvaluationContext,
                                      minHcp: number, label: string): AppliesWhenResult {
  // The responder must first have enough strength for this response.
  if (context.handFacts.hcp < minHcp) {
    return { success: false,
             telemetryLines: [
               `FAIL: ${label} two-level new-suit response requires ${minHcp}+ HCP; ` +
               `responder has ${context.handFacts.hcp}.`, ], };
  }
  const candidate = parseSuitBid(call);
  const opening = getPartnerOpeningBid(context);
  if (candidate === null || opening === null || candidate.strain === 'NT' || opening.strain === 'NT') {
    return { success: false, telemetryLines: [`FAIL: ${label} two-level new-suit rule needs suit bids.`] };
  }
  const supportLength = context.handFacts.lengths[opening.strain as 'C' | 'D' | 'H' | 'S'];
  const candidateLength = context.handFacts.lengths[candidate.strain as 'C' | 'D' | 'H' | 'S'];
  const minSuitLength = candidate.strain === 'H' && opening.strain === 'S' ? 5 : 4;
  const success = supportLength <= 2 && candidateLength >= minSuitLength;
  return {
    success: success,
    telemetryLines: [
      `${success ? 'APPLIES' : 'FAIL'}: ${label} two-level new-suit response requires ${minHcp}+ HCP, ` +
      `no major support, and ${minSuitLength}+ cards in ${candidate.strain}.`,
    ],
  };
}

/// getPartnerOpeningBid parses partnerOpeningCall when the current rule needs the exact
/// level/strain partner opened.  Return null for a missing opening or a non-contract call.
///
function getPartnerOpeningBid (context: RuleEvaluationContext): { level: number; strain: Strain } | null {
  if (context.partnerOpeningCall === null) {
    return null;
  }
  return parseSuitBid(context.partnerOpeningCall);
}

/// parseSuitBid parses a contract Call into numeric level and Strain for candidate refinement
/// functions and appliesWhen test functions.  Pass, Double, and Redouble are not contract bids and
/// return null.
///
function parseSuitBid (call: Call): { level: number; strain: Strain } | null {
  if (call === 'Pass' || call === 'Double' || call === 'Redouble') {
    return null;
  }
  const level = Number(call.substring(0, 1));
  const strain = call.substring(1) as Strain;
  return { level, strain };
}
