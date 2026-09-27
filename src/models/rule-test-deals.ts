/// Deterministic rule-practice deals, grouped by bidding stage and rebid family.
/// Expected call/rule pairs are assertions of what we should see.
/// 
import type { BiddingSystem, Call } from './bidding-types';
import type { Suit } from './cards';

export interface RuleTestDeal {
  description: string;
  // actual auction (including opponent passes) for manual practice.
  practiceAuction: Call[];
  // Each expected call/rule pair is an assertion of what we should see.
  requiredSystem?: Partial<BiddingSystem>;
  expectedOpeningCalls?: RuleTestExpectedCall[];
  expectedResponseCalls?: RuleTestExpectedCall[];
  expectedOpenerRebidCalls?: RuleTestExpectedCall[];
  // These calls must be absent from the final candidate list; they need not have been generated.
  rejectedOpeningCalls?: Call[];
  rejectedResponseCalls?: Call[];
  rejectedOpenerRebidCalls?: Call[];
  // Each pair requires both calls to survive, with the first appearing before the second.
  expectedOpeningCallOrder?: [Call, Call][];
  expectedResponseCallOrder?: [Call, Call][];
  expectedOpenerRebidCallOrder?: [Call, Call][];
  north: Record<Suit, string>;
  south: Record<Suit, string>;
}

export interface RuleTestExpectedCall {
  call: Call;
  ruleIds: string[];
}

///
//// Opening-bid selection variations
///

/// Supplementary opening-only cases. Ordinary 1NT/2NT and strong 2C openings will be exercised
/// alongside their responses, rather than duplicated here solely for opening-rule coverage.
export const OPENING_BID_TEST_DEALS: RuleTestDeal[] = [
  {
    description: '14 HCP, balanced 5-3-3-2 with five hearts: the optional one-point 1NT upgrade ' +
                 'puts 1NT ahead of the natural 1H opening, which remains available.',
    practiceAuction: ['1NT'],
    requiredSystem: { oneNtOpening: '15-17', oneNtFiveCardLengthUpgrade: true },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-five-card-length-upgrade'] },
      { call: '1H', ruleIds: ['open-five-card-major'] },
    ],
    expectedOpeningCallOrder: [['1NT', '1H']],
    north: { S: 'A72', H: 'KQJ85', D: 'K84', C: 'J9' },
    south: { S: 'KJ5', H: 'A42', D: 'QJ76', C: 'AQ5' },
  },
  {
    description: 'The same 14-HCP balanced hand with the five-card-major upgrade disabled: ' +
                 'open 1H; 1NT is below the standard 15-HCP minimum.',
    practiceAuction: ['1H'],
    requiredSystem: { oneNtOpening: '15-17', oneNtFiveCardLengthUpgrade: false },
    expectedOpeningCalls: [
      { call: '1H', ruleIds: ['open-five-card-major'] },
    ],
    rejectedOpeningCalls: ['1NT'],
    north: { S: 'A72', H: 'KQJ85', D: 'K84', C: 'J9' },
    south: { S: 'KJ5', H: 'A42', D: 'QJ76', C: 'AQ5' },
  },
  {
    description: '15 HCP, balanced 5-3-3-2 with five spades: under the alternate 16-18 ' +
                 'agreement, the optional upgrade puts 1NT ahead of natural 1S.',
    practiceAuction: ['1NT'],
    requiredSystem: { oneNtOpening: '16-18', oneNtFiveCardLengthUpgrade: true },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-five-card-length-upgrade'] },
      { call: '1S', ruleIds: ['open-five-card-major'] },
    ],
    expectedOpeningCallOrder: [['1NT', '1S']],
    north: { S: 'AQJ85', H: 'K74', D: 'A72', C: 'J8' },
    south: { S: 'K63', H: 'Q85', D: 'KJ64', C: 'K94' },
  },
  {
    description: 'The same 15-HCP hand under 16-18 with the optional upgrade disabled: ' +
                 'open 1S; 1NT is below the alternate 16-HCP minimum.',
    practiceAuction: ['1S'],
    requiredSystem: { oneNtOpening: '16-18', oneNtFiveCardLengthUpgrade: false },
    expectedOpeningCalls: [
      { call: '1S', ruleIds: ['open-five-card-major'] },
    ],
    rejectedOpeningCalls: ['1NT'],
    north: { S: 'AQJ85', H: 'K74', D: 'A72', C: 'J8' },
    south: { S: 'K63', H: 'Q85', D: 'KJ64', C: 'K94' },
  },
  {
    description: 'Exactly 10 HCP with five spades and five hearts: 10 + 5 + 5 = 20, so ' +
                 'both the five-card-major opening and Guideline of 20 support 1S. ' +
                 'With equal five-card majors, open spades rather than hearts.',
    practiceAuction: ['1S'],
    expectedOpeningCalls: [
      { call: '1S', ruleIds: ['open-five-card-major', 'open-guideline-of-20'] },
    ],
    rejectedOpeningCalls: ['1H'],
    north: { S: 'AQ972', H: 'KJ864', D: '53', C: '2' },
    south: { S: 'K63', H: 'AQ5', D: 'A642', C: 'KQ5' },
  },
];

///
//// Opener rebids after a minor opening and 1NT response
///
export const OPENER_REBID_AFTER_MINOR_1NT_TEST_DEALS: RuleTestDeal[] = [
  {
    description: "1C-1NT-Pass: minimum balanced opener with no more descriptive rebid accepts " +
                 "responder's 1NT.",
    practiceAuction: ['1C', 'Pass', '1NT', 'Pass', 'Pass'],
    expectedOpeningCalls: [
      { call: '1C', ruleIds: ['open-convenient-minor'] },
    ],
    expectedResponseCalls: [
      { call: '1NT', ruleIds: ['respond-to-minor-w/-1nt'] },
    ],
    expectedOpenerRebidCalls: [
      { call: 'Pass', ruleIds: ['opener-rebid-pass-after-minor-1nt'] },
    ],
    north: { S: 'AK2', H: 'Q42', D: 'J96', C: 'KJ75' },
    south: { S: 'Q76', H: 'J85', D: 'K73', C: 'Q964' },
  },
  {
    description: '1D-1NT-2D: 14 HCP / 16 total with six diamonds; repeat the long opening suit ' +
                 'descriptively.',
    practiceAuction: ['1D', 'Pass', '1NT', 'Pass', '2D'],
    expectedOpeningCalls: [
      { call: '1D', ruleIds: ['open-convenient-minor'] },
    ],
    expectedResponseCalls: [
      { call: '1NT', ruleIds: ['respond-to-minor-w/-1nt'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '2D', ruleIds: ['opener-rebid-repeat-minor-after-minor-1nt'] },
    ],
    north: { S: 'A42', H: 'K4', D: 'AQJT92', C: '85' },
    south: { S: 'Q76', H: 'J85', D: 'K73', C: 'Q964' },
  },
  {
    description: '1D-1NT-2C: 15 HCP / 16 total, 5D-4C; show the lower-ranking second suit ' +
                 'economically without reversing.',
    practiceAuction: ['1D', 'Pass', '1NT', 'Pass', '2C'],
    expectedOpeningCalls: [
      { call: '1D', ruleIds: ['open-convenient-minor'] },
    ],
    expectedResponseCalls: [
      { call: '1NT', ruleIds: ['respond-to-minor-w/-1nt'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '2C', ruleIds: ['opener-rebid-lower-second-suit-after-minor-1nt'] },
    ],
    north: { S: 'A4', H: 'K2', D: 'AQJ92', C: 'JT52' },
    south: { S: 'Q76', H: 'J85', D: 'K73', C: 'Q964' },
  },
  {
    description: "1D-1NT-2H: 16 HCP / 17 total, 5D-4H; the length point reaches this " +
                 "treatment's reverse threshold.",
    practiceAuction: ['1D', 'Pass', '1NT', 'Pass', '2H'],
    expectedOpeningCalls: [
      { call: '1D', ruleIds: ['open-convenient-minor'] },
    ],
    expectedResponseCalls: [
      { call: '1NT', ruleIds: ['respond-to-minor-w/-1nt'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '2H', ruleIds: ['opener-rebid-reverse-after-minor-1nt'] },
    ],
    north: { S: 'AK', H: 'AQ42', D: 'QJ952', C: '85' },
    south: { S: 'Q76', H: 'J85', D: 'K73', C: 'Q964' },
  },
  {
    description: '1D-1NT-3D: 16 HCP / 18 total with six diamonds; length points reach the ' +
                 '17-18 total-point jump-repeat range.',
    practiceAuction: ['1D', 'Pass', '1NT', 'Pass', '3D'],
    expectedOpeningCalls: [
      { call: '1D', ruleIds: ['open-convenient-minor'] },
    ],
    expectedResponseCalls: [
      { call: '1NT', ruleIds: ['respond-to-minor-w/-1nt'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '3D', ruleIds: ['opener-rebid-jump-repeat-minor-after-minor-1nt'] },
    ],
    north: { S: 'AK', H: 'Q4', D: 'AQJ982', C: '852' },
    south: { S: 'Q76', H: 'J85', D: 'K73', C: 'Q964' },
  },
  {
    description: '1D-1NT-2NT: 18 HCP balanced; this 18-19 notrump rebid range is based on HCP, ' + 
                 'not length points.',
    practiceAuction: ['1D', 'Pass', '1NT', 'Pass', '2NT'],
    requiredSystem: { oneNtOpening: '15-17' },
    expectedOpeningCalls: [
      { call: '1D', ruleIds: ['open-convenient-minor'] },
    ],
    expectedResponseCalls: [
      { call: '1NT', ruleIds: ['respond-to-minor-w/-1nt'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '2NT', ruleIds: ['opener-rebid-2nt-after-minor-1nt'] },
    ],
    north: { S: 'AK2', H: 'KQ4', D: 'QJ92', C: 'K85' },
    south: { S: 'Q76', H: 'J85', D: 'K73', C: 'Q964' },
  },
  {
    description: '1D-1NT-3C: 18 HCP / 19 total, 5D-4C; maximum values make the lower second ' + 
                 'suit a natural jump shift.',
    practiceAuction: ['1D', 'Pass', '1NT', 'Pass', '3C'],
    expectedOpeningCalls: [
      { call: '1D', ruleIds: ['open-convenient-minor'] },
    ],
    expectedResponseCalls: [
      { call: '1NT', ruleIds: ['respond-to-minor-w/-1nt'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '3C', ruleIds: ['opener-rebid-jump-shift-lower-suit-after-minor-1nt'] },
    ],
    north: { S: 'AK2', H: 'Q', D: 'AJ652', C: 'KJ85' },
    south: { S: 'Q76', H: 'J85', D: 'K73', C: 'Q964' },
  },
  {
    description: '1D-1NT-3NT: 20 HCP, 6-3-2-2; semi-balanced rather than strict balanced, so ' +
                 'show the 20-21 range now.',
    practiceAuction: ['1D', 'Pass', '1NT', 'Pass', '3NT'],
    expectedOpeningCalls: [
      { call: '1D', ruleIds: ['open-convenient-minor'] },
    ],
    expectedResponseCalls: [
      { call: '1NT', ruleIds: ['respond-to-minor-w/-1nt'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '3NT', ruleIds: ['opener-rebid-3nt-after-minor-1nt'] },
    ],
    north: { S: 'AK', H: 'KQ', D: 'AQJ982', C: 'J85' },
    south: { S: 'Q76', H: 'J85', D: 'K73', C: 'Q964' },
  },
  {
    description: '1D-1NT: 12 HCP / 14 total, 6-3-2-2; both Pass and 2D remain reasonable ' +
                 'modeled choices.',
    practiceAuction: ['1D', 'Pass', '1NT', 'Pass', '2D'],
    expectedOpeningCalls: [
      { call: '1D', ruleIds: ['open-convenient-minor'] },
    ],
    expectedResponseCalls: [
      { call: '1NT', ruleIds: ['respond-to-minor-w/-1nt'] },
    ],
    expectedOpenerRebidCalls: [
      { call: 'Pass', ruleIds: ['opener-rebid-pass-after-minor-1nt'] },
      { call: '2D', ruleIds: ['opener-rebid-repeat-minor-after-minor-1nt'] },
    ],
    north: { S: 'A42', H: 'J4', D: 'KQT982', C: 'Q5' },
    south: { S: 'Q76', H: 'K85', D: '743', C: 'J964' },
  },
  {
    description: '1D-1NT: 20 HCP, 5-4-2-2; both a 2H reverse and 3NT remain reasonable ' +
                 'modeled choices.',
    practiceAuction: ['1D', 'Pass', '1NT', 'Pass', '2H'],
    expectedOpeningCalls: [
      { call: '1D', ruleIds: ['open-convenient-minor'] },
    ],
    expectedResponseCalls: [
      { call: '1NT', ruleIds: ['respond-to-minor-w/-1nt'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '2H', ruleIds: ['opener-rebid-reverse-after-minor-1nt'] },
      { call: '3NT', ruleIds: ['opener-rebid-3nt-after-minor-1nt'] },
    ],
    north: { S: 'A2', H: 'KQJ2', D: 'AKQJ9', C: '85' },
    south: { S: 'K76', H: '985', D: '743', C: 'QJ64' },
  },
  {
    description: '1D-1NT-5D: 16 HCP / 19 total with seven diamonds; maximum long-minor values ' +
                 'justify bidding game.',
    practiceAuction: ['1D', 'Pass', '1NT', 'Pass', '5D'],
    expectedOpeningCalls: [
      { call: '1D', ruleIds: ['open-convenient-minor'] },
    ],
    expectedResponseCalls: [
      { call: '1NT', ruleIds: ['respond-to-minor-w/-1nt'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '5D', ruleIds: ['opener-rebid-game-minor-after-minor-1nt'] },
    ],
    north: { S: 'AK2', H: 'Q2', D: 'AQJ9876', C: '5' },
    south: { S: 'Q76', H: 'J85', D: 'K43', C: 'K964' },
  },
];

///
//// Opener rebids after a minor opening and one-level new-suit response
///
export const OPENER_REBID_AFTER_MINOR_ONE_LEVEL_NEW_SUIT_TEST_DEALS: RuleTestDeal[] = [
  {
    description: '1C-1H-1S: opener has only three clubs; show an economical four-card second ' +
                 'suit at the one level.',
    practiceAuction: ['1C', 'Pass', '1H', 'Pass', '1S'],
    expectedOpeningCalls: [
      { call: '1C', ruleIds: ['open-convenient-minor'] },
    ],
    expectedResponseCalls: [
      { call: '1H', ruleIds: ['respond-to-minor-w/-new-suit-one-level-priority'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '1S', ruleIds: ['opener-rebid-second-suit-after-minor-one-level-new-suit'] },
    ],
    // Show the available one-level second suit instead of falling back to 1NT.
    rejectedOpenerRebidCalls: ['1NT'],
    rejectedOpeningCalls: ['1D'],
    north: { S: 'AQJ2', H: 'Q42', D: 'K72', C: 'J85' },
    south: { S: '83', H: 'KJ76', D: 'Q854', C: '963' },
  },
  {
    description: '1C-1H-1NT: 13 HCP balanced, with neither four-card heart support nor another ' +
                 'suit available at the one level.',
    practiceAuction: ['1C', 'Pass', '1H', 'Pass', '1NT'],
    expectedOpeningCalls: [
      { call: '1C', ruleIds: ['open-convenient-minor'] },
    ],
    expectedResponseCalls: [
      { call: '1H', ruleIds: ['respond-to-minor-w/-new-suit-one-level-priority'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '1NT', ruleIds: ['opener-rebid-1nt-after-minor-one-level-new-suit'] },
    ],
    north: { S: 'AK2', H: 'Q42', D: 'K72', C: 'J852' },
    south: { S: '83', H: 'KJ76', D: 'Q854', C: '963' },
  },
  {
    description: '1C-1H-2H: minimum values with four-card heart support; make the ordinary ' +
                 'simple raise.',
    practiceAuction: ['1C', 'Pass', '1H', 'Pass', '2H'],
    expectedOpeningCalls: [
      { call: '1C', ruleIds: ['open-convenient-minor'] },
    ],
    expectedResponseCalls: [
      { call: '1H', ruleIds: ['respond-to-minor-w/-new-suit-one-level-priority'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '2H', ruleIds: ['opener-rebid-simple-raise-after-minor-one-level-new-suit'] },
    ],
    north: { S: 'AK2', H: 'Q942', D: 'K72', C: '852' },
    south: { S: '83', H: 'KJ76', D: 'Q854', C: '963' },
  },
  {
    description: '1C-1H-2D: 17 HCP / 18 total, 5C-4D; this is a reverse because responder ' +
                 'must bid 3C to return to clubs.',
    practiceAuction: ['1C', 'Pass', '1H', 'Pass', '2D'],
    expectedOpeningCalls: [
      { call: '1C', ruleIds: ['open-convenient-minor'] },
    ],
    expectedResponseCalls: [
      { call: '1H', ruleIds: ['respond-to-minor-w/-new-suit-one-level-priority'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '2D', ruleIds: ['opener-rebid-reverse-after-minor-one-level-new-suit'] },
    ],
    north: { S: 'AK', H: 'Q2', D: 'AKJ2', C: 'T8752' },
    south: { S: '83', H: 'KJ76', D: 'Q854', C: '963' },
  },
  {
    description: '1C-1H-3H: 15 HCP becomes 17 shortage points with two doubletons; jump raise ' +
                 'with medium support values.',
    practiceAuction: ['1C', 'Pass', '1H', 'Pass', '3H'],
    expectedOpeningCalls: [
      { call: '1C', ruleIds: ['open-convenient-minor'] },
    ],
    expectedResponseCalls: [
      { call: '1H', ruleIds: ['respond-to-minor-w/-new-suit-one-level-priority'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '3H', ruleIds: ['opener-rebid-jump-raise-after-minor-one-level-new-suit'] },
    ],
    north: { S: 'AQ', H: 'AQ42', D: 'K2', C: 'T8752' },
    south: { S: '83', H: 'KJ76', D: 'Q854', C: '963' },
  },
  {
    description: '1C-1H-2S: 19 HCP / 20 total, 5C-4S; 1S was economical, so 2S is the natural ' +
                 'maximum jump shift.',
    practiceAuction: ['1C', 'Pass', '1H', 'Pass', '2S'],
    expectedOpeningCalls: [
      { call: '1C', ruleIds: ['open-convenient-minor'] },
    ],
    expectedResponseCalls: [
      { call: '1H', ruleIds: ['respond-to-minor-w/-new-suit-one-level-priority'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '2S', ruleIds: ['opener-rebid-jump-shift-after-minor-one-level-new-suit'] },
    ],
    north: { S: 'AKQ2', H: 'Q2', D: 'A2', C: 'KJ852' },
    south: { S: '83', H: 'KJ76', D: 'Q854', C: '963' },
  },
  {
    description: '1C-1H-4H: 17 HCP becomes 19 shortage points with heart support; raise ' +
                 'responder to game.',
    practiceAuction: ['1C', 'Pass', '1H', 'Pass', '4H'],
    expectedOpeningCalls: [
      { call: '1C', ruleIds: ['open-convenient-minor'] },
    ],
    expectedResponseCalls: [
      { call: '1H', ruleIds: ['respond-to-minor-w/-new-suit-one-level-priority'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '4H', ruleIds: ['opener-rebid-game-raise-after-minor-one-level-new-suit'] },
    ],
    north: { S: 'AK', H: 'AQ42', D: 'K2', C: 'J8752' },
    south: { S: '83', H: 'KJ76', D: 'Q854', C: '963' },
  },
  {
    description: '1C-1H-4D: 16 HCP becomes 19 shortage points with the diamond singleton; both ' +
                 '4H and optional 4D splinter remain candidates.',
    practiceAuction: ['1C', 'Pass', '1H', 'Pass', '4D'],
    requiredSystem: { splinters: true },
    expectedOpeningCalls: [
      { call: '1C', ruleIds: ['open-convenient-minor'] },
    ],
    expectedResponseCalls: [
      { call: '1H', ruleIds: ['respond-to-minor-w/-new-suit-one-level-priority'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '4H', ruleIds: ['opener-rebid-game-raise-after-minor-one-level-new-suit'] },
      { call: '4D', ruleIds: ['opener-rebid-splinter-after-minor-one-level-new-suit'] },
    ],
    north: { S: 'AQ2', H: 'AQ42', D: 'K', C: 'J8752' },
    south: { S: '83', H: 'KJ76', D: 'Q854', C: '963' },
  },
  {
    description: '1D-1H: 12 HCP / 14 total, 6D-4C; both 2D and economical 2C are reasonable ' +
                 'descriptive rebids.',
    practiceAuction: ['1D', 'Pass', '1H', 'Pass', '2C'],
    expectedOpeningCalls: [
      { call: '1D', ruleIds: ['open-convenient-minor'] },
    ],
    expectedResponseCalls: [
      { call: '1H', ruleIds: ['respond-to-minor-w/-new-suit-one-level-priority'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '2C', ruleIds: ['opener-rebid-second-suit-after-minor-one-level-new-suit'] },
      { call: '2D', ruleIds: ['opener-rebid-repeat-minor-after-minor-one-level-new-suit'] },
    ],
    north: { S: 'Q2', H: '4', D: 'KJT972', C: 'AQ85' },
    south: { S: '83', H: 'KJ76', D: 'Q854', C: '963' },
  },
  {
    description: '1C-1H-3C: 16 HCP / 18 total with six clubs; length points reach the medium ' +
                 'jump-repeat range.',
    practiceAuction: ['1C', 'Pass', '1H', 'Pass', '3C'],
    expectedOpeningCalls: [
      { call: '1C', ruleIds: ['open-convenient-minor'] },
    ],
    expectedResponseCalls: [
      { call: '1H', ruleIds: ['respond-to-minor-w/-new-suit-one-level-priority'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '3C', ruleIds: ['opener-rebid-jump-repeat-minor-after-minor-one-level-new-suit'] },
    ],
    north: { S: 'AQ2', H: 'Q4', D: 'K2', C: 'AJT852' },
    south: { S: '83', H: 'KJ76', D: 'Q854', C: '963' },
  },
  {
    description: '1C-1H-2NT: 18 HCP balanced with five clubs; the 18-19 NT rebid is based on ' +
                 'HCP, not length points.',
    practiceAuction: ['1C', 'Pass', '1H', 'Pass', '2NT'],
    requiredSystem: { oneNtOpening: '15-17' },
    expectedOpeningCalls: [
      { call: '1C', ruleIds: ['open-convenient-minor'] },
    ],
    expectedResponseCalls: [
      { call: '1H', ruleIds: ['respond-to-minor-w/-new-suit-one-level-priority'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '2NT', ruleIds: ['opener-rebid-2nt-after-minor-one-level-new-suit'] },
    ],
    north: { S: 'AK2', H: 'Q4', D: 'KJ2', C: 'KQ852' },
    south: { S: '83', H: 'KJ76', D: 'Q854', C: '963' },
  },
  {
    description: '1D-1H-5D: 16 HCP / 19 total with seven diamonds; maximum long-minor values ' +
                 'justify bidding game.',
    practiceAuction: ['1D', 'Pass', '1H', 'Pass', '5D'],
    expectedOpeningCalls: [
      { call: '1D', ruleIds: ['open-convenient-minor'] },
    ],
    expectedResponseCalls: [
      { call: '1H', ruleIds: ['respond-to-minor-w/-new-suit-one-level-priority'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '5D', ruleIds: ['opener-rebid-game-in-minor-after-minor-one-level-new-suit'] },
    ],
    north: { S: 'AK', H: 'Q2', D: 'AQJ9876', C: '85' },
    south: { S: 'Q76', H: 'KJ85', D: '43', C: 'Q964' },
  },
];

///
//// Opener rebids after 1D-2C in Standard
///
export const OPENER_REBID_AFTER_MINOR_STANDARD_TWO_LEVEL_NEW_SUIT_TEST_DEALS: RuleTestDeal[] = [
  {
    description: '1D-2C-2D Standard: 14 HCP / 15 total, 5D-4H; Standard is forcing only one ' +
                 'round, so the minimum hand repeats diamonds rather than reverse.',
    practiceAuction: ['1D', 'Pass', '2C', 'Pass', '2D'],
    requiredSystem: { twoLevelNewSuitResponse: 'standard' },
    expectedOpeningCalls: [
      { call: '1D', ruleIds: ['open-convenient-minor'] },
    ],
    expectedResponseCalls: [
      { call: '2NT', ruleIds: ['respond-to-minor-w/-2nt'] },
      { call: '2C', ruleIds: ['respond-to-1d-w/-2c-standard'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '2D', ruleIds: ['opener-rebid-repeat-diamonds-after-minor-standard-two-level-new-suit'] },
    ],
    // This minimum must not make a Standard high reverse.
    rejectedOpenerRebidCalls: ['2H'],
    north: { S: 'A4', H: 'KJ42', D: 'KQJ92', C: '82' },
    south: { S: 'K72', H: 'Q83', D: 'A5', C: 'Q9653' },
  },
  {
    description: '1D-2C-2H Standard: 18 HCP / 19 total, 5D-4H; extra strength now supports the ' +
                 'reverse that the minimum hand could not make.',
    practiceAuction: ['1D', 'Pass', '2C', 'Pass', '2H'],
    requiredSystem: { twoLevelNewSuitResponse: 'standard' },
    expectedOpeningCalls: [
      { call: '1D', ruleIds: ['open-convenient-minor'] },
    ],
    expectedResponseCalls: [
      { call: '2NT', ruleIds: ['respond-to-minor-w/-2nt'] },
      { call: '2C', ruleIds: ['respond-to-1d-w/-2c-standard'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '2H', ruleIds: ['opener-rebid-reverse-after-minor-standard-two-level-new-suit'] },
    ],
    north: { S: 'A4', H: 'AKJ2', D: 'KQJ92', C: '82' },
    south: { S: 'K72', H: 'Q83', D: 'A5', C: 'Q9653' },
  },
  {
    description: '1D-2C-2NT Standard: 14 HCP balanced, 4D-4S-3H-2C; show the minimum balanced ' +
                 'hand even though that conceals the four-card spade suit.',
    practiceAuction: ['1D', 'Pass', '2C', 'Pass', '2NT'],
    requiredSystem: { twoLevelNewSuitResponse: 'standard' },
    expectedOpeningCalls: [
      { call: '1D', ruleIds: ['open-convenient-minor'] },
    ],
    expectedResponseCalls: [
      { call: '2NT', ruleIds: ['respond-to-minor-w/-2nt'] },
      { call: '2C', ruleIds: ['respond-to-1d-w/-2c-standard'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '2NT', ruleIds: ['opener-rebid-2nt-after-minor-standard-two-level-new-suit'] },
    ],
    north: { S: 'AQJ4', H: 'KJ2', D: 'QJ92', C: '82' },
    south: { S: 'K72', H: 'Q83', D: 'A5', C: 'Q9653' },
  },
  {
    description: '1D-2C-3C Standard: 12 HCP / 15 shortage points with three clubs; responder ' +
                 'promised 5+, so the eight-card fit is known and both 3C and 2D remain candidates.',
    practiceAuction: ['1D', 'Pass', '2C', 'Pass', '3C'],
    requiredSystem: { twoLevelNewSuitResponse: 'standard' },
    expectedOpeningCalls: [
      { call: '1D', ruleIds: ['open-convenient-minor'] },
    ],
    expectedResponseCalls: [
      { call: '2NT', ruleIds: ['respond-to-minor-w/-2nt'] },
      { call: '2C', ruleIds: ['respond-to-1d-w/-2c-standard'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '2D', ruleIds: ['opener-rebid-repeat-diamonds-after-minor-standard-two-level-new-suit'] },
      { call: '3C', ruleIds: ['opener-rebid-simple-raise-after-minor-standard-two-level-new-suit'] },
    ],
    north: { S: 'A', H: 'KJ42', D: 'KJ972', C: 'T82' },
    south: { S: 'K72', H: 'Q83', D: 'A5', C: 'Q9653' },
  },
  {
    description: '1D-2C Standard: 15 HCP gives 17 total points with six diamonds and 18 ' +
                 'shortage points with club support; both 3D and 4C describe the medium hand.',
    practiceAuction: ['1D', 'Pass', '2C', 'Pass', '3D'],
    requiredSystem: { twoLevelNewSuitResponse: 'standard' },
    expectedOpeningCalls: [
      { call: '1D', ruleIds: ['open-convenient-minor'] },
    ],
    expectedResponseCalls: [
      { call: '2NT', ruleIds: ['respond-to-minor-w/-2nt'] },
      { call: '2C', ruleIds: ['respond-to-1d-w/-2c-standard'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '3D', ruleIds: ['opener-rebid-jump-repeat-diamonds-after-minor-standard-two-level-new-suit'] },
      { call: '4C', ruleIds: ['opener-rebid-jump-raise-after-minor-standard-two-level-new-suit'] },
    ],
    north: { S: 'AQ4', H: '4', D: 'KQJ972', C: 'K82' },
    south: { S: 'K72', H: 'Q83', D: 'A5', C: 'Q9653' },
  },
  {
    description: '1D-2C-3NT Standard: 19 HCP balanced, 4D-4S-3H-2C; the strong balanced rebid ' +
                 'reaches game without inventing reverse strength or club support.',
    practiceAuction: ['1D', 'Pass', '2C', 'Pass', '3NT'],
    requiredSystem: { twoLevelNewSuitResponse: 'standard' },
    expectedOpeningCalls: [
      { call: '1D', ruleIds: ['open-convenient-minor'] },
    ],
    expectedResponseCalls: [
      { call: '2NT', ruleIds: ['respond-to-minor-w/-2nt'] },
      { call: '2C', ruleIds: ['respond-to-1d-w/-2c-standard'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '3NT', ruleIds: ['opener-rebid-3nt-after-minor-standard-two-level-new-suit'] },
    ],
    north: { S: 'AQJ4', H: 'KJ2', D: 'KJ92', C: 'A8' },
    south: { S: 'K72', H: 'Q83', D: 'A5', C: 'Q9653' },
  },
  {
    description: '1D-2C Standard: 16 HCP becomes 19 total points with seven diamonds and 20 ' +
                 'shortage points with club support; both 5D and 5C are modeled game choices.',
    practiceAuction: ['1D', 'Pass', '2C', 'Pass', '5D'],
    requiredSystem: { twoLevelNewSuitResponse: 'standard' },
    expectedOpeningCalls: [
      { call: '1D', ruleIds: ['open-convenient-minor'] },
    ],
    expectedResponseCalls: [
      { call: '2NT', ruleIds: ['respond-to-minor-w/-2nt'] },
      { call: '2C', ruleIds: ['respond-to-1d-w/-2c-standard'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '5C', ruleIds: ['opener-rebid-game-raise-after-minor-standard-two-level-new-suit'] },
      { call: '5D', ruleIds: ['opener-rebid-game-in-diamonds-after-minor-standard-two-level-new-suit'] },
    ],
    north: { S: 'A4', H: 'K', D: 'KQJ9876', C: 'K84' },
    south: { S: 'K72', H: 'Q83', D: 'A5', C: 'Q9653' },
  },
];

///
//// Opener rebids after 1D-2C in 2/1
///
export const OPENER_REBID_AFTER_MINOR_TWO_OVER_ONE_NEW_SUIT_TEST_DEALS: RuleTestDeal[] = [
  {
    description: '1D-2C-2D 2/1: 13 HCP, 5D-4H; with five or more diamonds, repeat diamonds ' +
                 'first without implying extra strength.',
    practiceAuction: ['1D', 'Pass', '2C', 'Pass', '2D'],
    requiredSystem: { twoLevelNewSuitResponse: 'twoOverOne' },
    expectedOpeningCalls: [
      { call: '1D', ruleIds: ['open-convenient-minor'] },
    ],
    expectedResponseCalls: [
      { call: '2C', ruleIds: ['respond-to-1d-w/-2c-two-over-one'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '2D', ruleIds: ['opener-rebid-repeat-diamonds-after-minor-two-over-one-new-suit'] },
    ],
    north: { S: 'A82', H: 'KJ84', D: 'KQT95', C: '6' },
    south: { S: 'K63', H: 'Q72', D: 'J', C: 'AQJ952' },
  },
  {
    description: '1D-2C 2/1: 13 HCP, 4D-4H-4S; with fewer than five diamonds, show a four-card ' +
                 'major without reverse strength, hearts up the line before spades.',
    practiceAuction: ['1D', 'Pass', '2C', 'Pass', '2H'],
    requiredSystem: { twoLevelNewSuitResponse: 'twoOverOne' },
    expectedOpeningCalls: [
      { call: '1D', ruleIds: ['open-convenient-minor'] },
    ],
    expectedResponseCalls: [
      { call: '2C', ruleIds: ['respond-to-1d-w/-2c-two-over-one'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '2H', ruleIds: ['opener-rebid-major-after-minor-two-over-one-new-suit'] },
      { call: '2S', ruleIds: ['opener-rebid-major-after-minor-two-over-one-new-suit'] },
    ],
    north: { S: 'AQ84', H: 'KJ85', D: 'K742', C: '6' },
    south: { S: 'K63', H: 'Q72', D: 'J', C: 'AQJ952' },
  },
  {
    description: '1D-2C 2/1: 13 HCP, 4D-4C-3H-2S; 2NT is the usual economical description, ' +
                 'while 3C remains available when notrump is unattractive.',
    practiceAuction: ['1D', 'Pass', '2C', 'Pass', '2NT'],
    requiredSystem: { twoLevelNewSuitResponse: 'twoOverOne' },
    expectedOpeningCalls: [
      { call: '1D', ruleIds: ['open-convenient-minor'] },
    ],
    expectedResponseCalls: [
      { call: '2C', ruleIds: ['respond-to-1d-w/-2c-two-over-one'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '2NT', ruleIds: ['opener-rebid-2nt-after-minor-two-over-one-new-suit'] },
      { call: '3C', ruleIds: ['opener-rebid-simple-raise-after-minor-two-over-one-new-suit'] },
    ],
    rejectedOpeningCalls: ['1C'],
    north: { S: '82', H: 'AKJ', D: 'KQ84', C: 'T843' },
    south: { S: 'K63', H: 'Q72', D: 'J', C: 'AQJ952' },
  },
];

/// Major-opening buckets are filled incrementally as positive deals are evaluator-verified.

///
//// Opener rebids after a major opening and 1NT response
///
export const OPENER_REBID_AFTER_MAJOR_1NT_TEST_DEALS: RuleTestDeal[] = [
  {
    description: '1S-1NT-Pass, non-forcing: a flat 13-HCP minimum may accept 1NT as the final contract.',
    practiceAuction: ['1S', 'Pass', '1NT', 'Pass', 'Pass'],
    requiredSystem: { majorOneNtResponse: 'nonForcing' },
    expectedOpeningCalls: [
      { call: '1S', ruleIds: ['open-five-card-major'] },
    ],
    expectedResponseCalls: [
      { call: '1NT', ruleIds: ['respond-to-major-w/o-support-1nt-standard'] },
    ],
    expectedOpenerRebidCalls: [
      { call: 'Pass', ruleIds: ['opener-rebid-pass-after-major-1nt-nonforcing'] },
    ],
    north: { S: 'KQJ85', H: 'A74', D: '82', C: 'QJ3' },
    south: { S: '72', H: 'QJ6', D: 'K753', C: 'T842' },
  },
  {
    description: '1S-1NT-2C, forcing: the same flat 13-HCP hand cannot pass, so manufacture ' +
                 'the three-card club fallback.',
    practiceAuction: ['1S', 'Pass', '1NT', 'Pass', '2C'],
    requiredSystem: { majorOneNtResponse: 'forcing' },
    expectedOpeningCalls: [
      { call: '1S', ruleIds: ['open-five-card-major'] },
    ],
    expectedResponseCalls: [
      { call: '1NT', ruleIds: ['respond-to-major-w/o-support-1nt-twooverone'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '2C', ruleIds: ['opener-rebid-minor-fallback-after-major-1nt-forcing'] },
    ],
    north: { S: 'KQJ85', H: 'A74', D: '82', C: 'QJ3' },
    south: { S: '72', H: 'QJ6', D: 'K753', C: 'T842' },
  },
  {
    description: '1S-1NT: 11 HCP / 13 total, 6S-4H and Guideline of 20; 2S emphasizes the ' +
                 'six-card major while 2H searches for the heart fit.',
    practiceAuction: ['1S', 'Pass', '1NT', 'Pass', '2H'],
    requiredSystem: { majorOneNtResponse: 'nonForcing' },
    expectedOpeningCalls: [
      { call: '1S', ruleIds: ['open-five-card-major', 'open-guideline-of-20'] },
    ],
    expectedResponseCalls: [
      { call: '1NT', ruleIds: ['respond-to-major-w/o-support-1nt-standard'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '2S', ruleIds: ['opener-rebid-repeat-major-after-major-1nt'] },
      { call: '2H', ruleIds: ['opener-rebid-lower-second-suit-after-major-1nt'] },
    ],
    north: { S: 'AQ8765', H: 'KQ65', D: '43', C: '2' },
    south: { S: 'K3', H: 'J82', D: '9752', C: 'QJ84' },
  },
  {
    description: '1H-1NT-2S: 16 HCP / 17 total, 5H-4S; showing the higher-ranking second suit ' +
                 'is a strength-qualified reverse.',
    practiceAuction: ['1H', 'Pass', '1NT', 'Pass', '2S'],
    requiredSystem: { majorOneNtResponse: 'nonForcing' },
    expectedOpeningCalls: [
      { call: '1H', ruleIds: ['open-five-card-major'] },
    ],
    expectedResponseCalls: [
      { call: '1NT', ruleIds: ['respond-to-major-w/o-support-1nt-standard'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '2S', ruleIds: ['opener-rebid-reverse-after-major-1nt'] },
    ],
    north: { S: 'AQ94', H: 'KJ985', D: 'AQ', C: '76' },
    south: { S: 'K63', H: 'Q2', D: 'J753', C: 'T842' },
  },
  {
    description: '1S-1NT-3S: 16 HCP / 18 total with six spades; medium values move the ' +
                 'major-repeat ladder from 2S to 3S.',
    practiceAuction: ['1S', 'Pass', '1NT', 'Pass', '3S'],
    requiredSystem: { majorOneNtResponse: 'nonForcing' },
    expectedOpeningCalls: [
      { call: '1S', ruleIds: ['open-five-card-major'] },
    ],
    expectedResponseCalls: [
      { call: '1NT', ruleIds: ['respond-to-major-w/o-support-1nt-standard'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '3S', ruleIds: ['opener-rebid-jump-repeat-major-after-major-1nt'] },
    ],
    north: { S: 'AQJ986', H: 'KQ7', D: 'A2', C: '85' },
    south: { S: 'K3', H: 'J82', D: '9753', C: 'QJ64' },
  },
  {
    description: '1S-1NT-2NT: 19 HCP, 5-3-3-2 balanced; show the natural 18-19 HCP notrump rebid range.',
    practiceAuction: ['1S', 'Pass', '1NT', 'Pass', '2NT'],
    requiredSystem: { majorOneNtResponse: 'nonForcing' },
    expectedOpeningCalls: [
      { call: '1S', ruleIds: ['open-five-card-major'] },
    ],
    expectedResponseCalls: [
      { call: '1NT', ruleIds: ['respond-to-major-w/o-support-1nt-standard'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '2NT', ruleIds: ['opener-rebid-2nt-after-major-1nt'] },
    ],
    north: { S: 'AKQJ8', H: 'AQ4', D: 'K72', C: '85' },
    south: { S: '72', H: 'J86', D: 'Q954', C: 'KJ64' },
  },
  {
    description: '1S-1NT-3H: 20 HCP / 21 total, 5S-4H; maximum values turn the natural lower ' +
                 'second suit into a jump shift.',
    practiceAuction: ['1S', 'Pass', '1NT', 'Pass', '3H'],
    requiredSystem: { majorOneNtResponse: 'nonForcing' },
    expectedOpeningCalls: [
      { call: '1S', ruleIds: ['open-five-card-major'] },
    ],
    expectedResponseCalls: [
      { call: '1NT', ruleIds: ['respond-to-major-w/o-support-1nt-standard'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '3H', ruleIds: ['opener-rebid-jump-shift-lower-suit-after-major-1nt'] },
    ],
    north: { S: 'AKQJ8', H: 'AQJ4', D: 'K72', C: '5' },
    south: { S: '76', H: 'K65', D: 'Q954', C: 'J842' },
  },
  {
    description: '1S-1NT-4S: 16 HCP / 19 total with seven spades; maximum long-major values ' +
                 'complete the repeat ladder at game.',
    practiceAuction: ['1S', 'Pass', '1NT', 'Pass', '4S'],
    requiredSystem: { majorOneNtResponse: 'nonForcing' },
    expectedOpeningCalls: [
      { call: '1S', ruleIds: ['open-five-card-major'] },
    ],
    expectedResponseCalls: [
      { call: '1NT', ruleIds: ['respond-to-major-w/o-support-1nt-standard'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '4S', ruleIds: ['opener-rebid-game-same-major-after-major-1nt'] },
    ],
    north: { S: 'AKQJ987', H: 'AQ', D: '32', C: '54' },
    south: { S: '65', H: 'KJ4', D: 'Q876', C: 'J832' },
  },
  {
    description: '1S-1NT, forcing: 13 HCP with five spades, two hearts and exactly three cards ' +
                 'in each minor. No natural rebid qualifies, so manufacture 2C rather than 2D ' +
                 'on equal minor lengths.',
    practiceAuction: ['1S', 'Pass', '1NT', 'Pass', '2C'],
    requiredSystem: { majorOneNtResponse: 'forcing' },
    expectedOpeningCalls: [
      { call: '1S', ruleIds: ['open-five-card-major'] },
    ],
    expectedResponseCalls: [
      { call: '1NT', ruleIds: ['respond-to-major-w/o-support-1nt-twooverone'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '2C', ruleIds: ['opener-rebid-minor-fallback-after-major-1nt-forcing'] },
    ],
    rejectedOpenerRebidCalls: ['2D'],
    north: { S: 'KQJ85', H: 'A7', D: '982', C: 'QJ3' },
    south: { S: '72', H: 'QJ6', D: 'K753', C: 'T842' },
  },
];

///
//// Opener rebids after a major opening and one-level new-suit response
///
export const OPENER_REBID_AFTER_MAJOR_ONE_LEVEL_NEW_SUIT_TEST_DEALS: RuleTestDeal[] = [
  {
    description: '1H-1S-1NT: 14 HCP, 5-3-3-2 balanced with just three spades; show minimum NT values instead of raising responder.',
    practiceAuction: ['1H', 'Pass', '1S', 'Pass', '1NT'],
    expectedOpeningCalls: [
      { call: '1H', ruleIds: ['open-five-card-major'] },
    ],
    expectedResponseCalls: [
      { call: '1S', ruleIds: ['respond-to-major-w/o-support-new-suit-one-level'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '1NT', ruleIds: ['opener-rebid-1nt-after-major-one-level-new-suit'] },
    ],
    // A valid one-level spade response displaces the 1NT fallback.
    rejectedResponseCalls: ['1NT'],
    north: { S: 'A82', H: 'AQJ85', D: 'K72', C: '85' },
    south: { S: 'KJ74', H: '63', D: 'Q85', C: 'T942' },
  },
  {
    description: '1H-1S-2S: 13 HCP / 15 shortage points, 5H-4S; ordinary simple raise requires four-card support.',
    practiceAuction: ['1H', 'Pass', '1S', 'Pass', '2S'],
    expectedOpeningCalls: [
      { call: '1H', ruleIds: ['open-five-card-major'] },
    ],
    expectedResponseCalls: [
      { call: '1S', ruleIds: ['respond-to-major-w/o-support-new-suit-one-level'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '2S', ruleIds: ['opener-rebid-simple-raise-after-major-one-level-new-suit'] },
    ],
    north: { S: 'A852', H: 'KQJ85', D: 'K7', C: '85' },
    south: { S: 'KJ74', H: '63', D: 'Q85', C: 'T942' },
  },
  {
    description: '1H-1S: minimum 13 HCP / 15 total, 6H-4D; 2H emphasizes the six-card major while 2D shows the lower second suit. Neither is a reverse.',
    practiceAuction: ['1H', 'Pass', '1S', 'Pass', '2D'],
    expectedOpeningCalls: [
      { call: '1H', ruleIds: ['open-five-card-major'] },
    ],
    expectedResponseCalls: [
      { call: '1S', ruleIds: ['respond-to-major-w/o-support-new-suit-one-level'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '2H', ruleIds: ['opener-rebid-repeat-major-after-major-one-level-new-suit'] },
      { call: '2D', ruleIds: ['opener-rebid-second-suit-after-major-one-level-new-suit'] },
    ],
    north: { S: 'A82', H: 'KQJ985', D: 'K764', C: '' },
    south: { S: 'KJ74', H: '63', D: 'Q85', C: 'T942' },
  },
  {
    description: '1H-1S-3H: 15 HCP / 17 total with six hearts; medium values turn the economical 2H repeat into a jump repeat.',
    practiceAuction: ['1H', 'Pass', '1S', 'Pass', '3H'],
    expectedOpeningCalls: [
      { call: '1H', ruleIds: ['open-five-card-major'] },
    ],
    expectedResponseCalls: [
      { call: '1S', ruleIds: ['respond-to-major-w/o-support-new-suit-one-level'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '3H', ruleIds: ['opener-rebid-jump-repeat-major-after-major-one-level-new-suit'] },
    ],
    north: { S: 'Q82', H: 'KQJ985', D: 'A7', C: 'K5' },
    south: { S: 'KJ74', H: '63', D: 'Q85', C: 'T942' },
  },
  {
    description: '1H-1S-3S: 15 HCP / 17 shortage points with 5H-4S; four-card support and distribution justify the medium jump raise.',
    practiceAuction: ['1H', 'Pass', '1S', 'Pass', '3S'],
    expectedOpeningCalls: [
      { call: '1H', ruleIds: ['open-five-card-major'] },
    ],
    expectedResponseCalls: [
      { call: '1S', ruleIds: ['respond-to-major-w/o-support-new-suit-one-level'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '3S', ruleIds: ['opener-rebid-jump-raise-after-major-one-level-new-suit'] },
    ],
    north: { S: 'AQ52', H: 'KQJ85', D: 'K7', C: '85' },
    south: { S: 'KJ74', H: '63', D: 'Q85', C: 'T942' },
  },
  {
    description: '1H-1S-2NT: 19 HCP, 5-3-3-2 balanced with just three spades; the 18-19 NT rebid is based on HCP, not length points.',
    practiceAuction: ['1H', 'Pass', '1S', 'Pass', '2NT'],
    expectedOpeningCalls: [
      { call: '1H', ruleIds: ['open-five-card-major'] },
    ],
    expectedResponseCalls: [
      { call: '1S', ruleIds: ['respond-to-major-w/o-support-new-suit-one-level'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '2NT', ruleIds: ['opener-rebid-2nt-after-major-one-level-new-suit'] },
    ],
    north: { S: 'A82', H: 'AKQ85', D: 'KJ7', C: 'Q5' },
    south: { S: 'KJ74', H: '63', D: 'Q85', C: 'T942' },
  },
  {
    description: '1H-1S-3D: 19 HCP / 20 total, 5H-4D; maximum values justify a natural jump shift rather than the economical 2D second suit.',
    practiceAuction: ['1H', 'Pass', '1S', 'Pass', '3D'],
    expectedOpeningCalls: [
      { call: '1H', ruleIds: ['open-five-card-major'] },
    ],
    expectedResponseCalls: [
      { call: '1S', ruleIds: ['respond-to-major-w/o-support-new-suit-one-level'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '3D', ruleIds: ['opener-rebid-jump-shift-after-major-one-level-new-suit'] },
    ],
    north: { S: 'A82', H: 'AKQ85', D: 'KQJ7', C: '5' },
    south: { S: 'KJ74', H: '63', D: '985', C: 'A942' },
  },
  {
    description: '1H-1S: 17 HCP / 20 shortage points with 5H-4S and singleton club; natural 4S and the optional 4C splinter both show the spade fit.',
    practiceAuction: ['1H', 'Pass', '1S', 'Pass', '4S'],
    requiredSystem: { splinters: true },
    expectedOpeningCalls: [
      { call: '1H', ruleIds: ['open-five-card-major'] },
    ],
    expectedResponseCalls: [
      { call: '1S', ruleIds: ['respond-to-major-w/o-support-new-suit-one-level'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '4S', ruleIds: ['opener-rebid-game-raise-after-major-one-level-new-suit'] },
      { call: '4C', ruleIds: ['opener-rebid-splinter-after-major-one-level-new-suit'] },
    ],
    north: { S: 'AQ52', H: 'AKJ85', D: 'K74', C: '6' },
    south: { S: 'KJ74', H: '63', D: 'Q85', C: 'T942' },
  },
  {
    description: '1H-1S-4H: 17 HCP / 20 total with seven hearts; a strong long major supports the direct game rebid rather than a smaller repeat.',
    practiceAuction: ['1H', 'Pass', '1S', 'Pass', '4H'],
    expectedOpeningCalls: [
      { call: '1H', ruleIds: ['open-five-card-major'] },
    ],
    expectedResponseCalls: [
      { call: '1S', ruleIds: ['respond-to-major-w/o-support-new-suit-one-level'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '4H', ruleIds: ['opener-rebid-game-same-major-after-major-one-level-new-suit'] },
    ],
    north: { S: 'A82', H: 'AKQJ987', D: 'K4', C: '5' },
    south: { S: 'KJ74', H: '63', D: 'Q85', C: 'T942' },
  },
];

///
//// Opener rebids after a major opening and Standard two-level new-suit response
///
export const OPENER_REBID_AFTER_MAJOR_STANDARD_TWO_LEVEL_NEW_SUIT_TEST_DEALS: RuleTestDeal[] = [
  {
    description: "1H-2C-2NT: 14 HCP, 5-3-3-2 balanced and no club fit; the minimum 2NT rebid is based on HCP, not length points.",
    practiceAuction: ['1H', 'Pass', '2C', 'Pass', '2NT'],
    requiredSystem: { twoLevelNewSuitResponse: 'standard' },
    expectedOpeningCalls: [
      { call: '1H', ruleIds: ['open-five-card-major'] },
    ],
    expectedResponseCalls: [
      { call: '2C', ruleIds: ['respond-to-major-w/o-support-new-suit-two-level-standard'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '2NT', ruleIds: ['opener-rebid-2nt-after-major-standard-two-level-new-suit'] },
    ],
    north: { S: 'A82', H: 'AQJ85', D: 'K72', C: '85' },
    south: { S: 'K95', H: '3', D: '953', C: 'AKQJ72' },
  },
  {
    description: "1S-2H: 12 HCP / 14 total with six spades and three hearts; 2S describes length, while 3H supports responder's promised five hearts.",
    practiceAuction: ['1S', 'Pass', '2H', 'Pass', '3H'],
    requiredSystem: { twoLevelNewSuitResponse: 'standard' },
    expectedOpeningCalls: [
      { call: '1S', ruleIds: ['open-five-card-major'] },
    ],
    expectedResponseCalls: [
      { call: '2H', ruleIds: ['respond-to-major-w/o-support-new-suit-two-level-standard'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '3H', ruleIds: ['opener-rebid-simple-raise-after-major-standard-two-level-new-suit'] },
      { call: '2S', ruleIds: ['opener-rebid-repeat-major-after-major-standard-two-level-new-suit'] },
    ],
    north: { S: 'KQJ985', H: 'A74', D: '82', C: 'Q3' },
    south: { S: 'A4', H: 'J9852', D: 'QJ3', C: 'K65' },
  },
  {
    description: "1S-2C-2D: minimum 5S-4D hand shows diamonds economically at the two level; responder can return to 2S, so this is not a reverse.",
    practiceAuction: ['1S', 'Pass', '2C', 'Pass', '2D'],
    requiredSystem: { twoLevelNewSuitResponse: 'standard' },
    expectedOpeningCalls: [
      { call: '1S', ruleIds: ['open-five-card-major'] },
    ],
    expectedResponseCalls: [
      { call: '2C', ruleIds: ['respond-to-major-w/o-support-new-suit-two-level-standard'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '2D', ruleIds: ['opener-rebid-second-suit-after-major-standard-two-level-new-suit'] },
    ],
    north: { S: 'AKJ85', H: '72', D: 'KQ94', C: '63' },
    south: { S: '63', H: 'AQT3', D: 'A75', C: 'QJ82' },
  },
  {
    description: "1H-2C-2S: 16 HCP / 17 total, 5H-4S; the reverse forces responder above 2H to return to hearts and therefore needs extra strength.",
    practiceAuction: ['1H', 'Pass', '2C', 'Pass', '2S'],
    requiredSystem: { twoLevelNewSuitResponse: 'standard' },
    expectedOpeningCalls: [
      { call: '1H', ruleIds: ['open-five-card-major'] },
    ],
    expectedResponseCalls: [
      { call: '2C', ruleIds: ['respond-to-major-w/o-support-new-suit-two-level-standard'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '2S', ruleIds: ['opener-rebid-reverse-after-major-standard-two-level-new-suit'] },
    ],
    north: { S: 'AQ94', H: 'KJ985', D: 'AQ', C: '76' },
    south: { S: '752', H: 'QT', D: 'J', C: 'AKJT832' },
  },
  {
    description: "1S-2H: 15 HCP / 17 total and 18 shortage points, 6S-3H with a singleton; 3S shows the longer major while 4H supports responder's known five hearts.",
    practiceAuction: ['1S', 'Pass', '2H', 'Pass', '3S'],
    requiredSystem: { twoLevelNewSuitResponse: 'standard' },
    expectedOpeningCalls: [
      { call: '1S', ruleIds: ['open-five-card-major'] },
    ],
    expectedResponseCalls: [
      { call: '2H', ruleIds: ['respond-to-major-w/o-support-new-suit-two-level-standard'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '3S', ruleIds: ['opener-rebid-jump-repeat-major-after-major-standard-two-level-new-suit'] },
      { call: '4H', ruleIds: ['opener-rebid-jump-raise-after-major-standard-two-level-new-suit'] },
    ],
    north: { S: 'AQJ985', H: 'KQ4', D: 'K82', C: '6' },
    south: { S: '42', H: 'AJT63', D: 'AQ9', C: 'J43' },
  },
  {
    description: "1H-2D-3NT: 19 HCP balanced; this strong NT rebid uses HCP rather than opener's 20 total points.",
    practiceAuction: ['1H', 'Pass', '2D', 'Pass', '3NT'],
    requiredSystem: { twoLevelNewSuitResponse: 'standard' },
    expectedOpeningCalls: [
      { call: '1H', ruleIds: ['open-five-card-major'] },
    ],
    expectedResponseCalls: [
      { call: '2D', ruleIds: ['respond-to-major-w/o-support-new-suit-two-level-standard'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '3NT', ruleIds: ['opener-rebid-3nt-after-major-standard-two-level-new-suit'] },
    ],
    north: { S: 'A82', H: 'AKQ85', D: 'KJ7', C: 'Q5' },
    south: { S: '3', H: 'T6', D: 'AQT9832', C: 'AJT' },
  },
  {
    description: "1S-2C-3D: 19 HCP / 20 total, 5S-4D; the extra strength justifies jumping beyond the economical 2D second-suit bid.",
    practiceAuction: ['1S', 'Pass', '2C', 'Pass', '3D'],
    requiredSystem: { twoLevelNewSuitResponse: 'standard' },
    expectedOpeningCalls: [
      { call: '1S', ruleIds: ['open-five-card-major'] },
    ],
    expectedResponseCalls: [
      { call: '2C', ruleIds: ['respond-to-major-w/o-support-new-suit-two-level-standard'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '3D', ruleIds: ['opener-rebid-jump-shift-after-major-standard-two-level-new-suit'] },
    ],
    north: { S: 'AKQJ8', H: '73', D: 'AKQ9', C: '52' },
    south: { S: 'T5', H: 'KJ5', D: '76', C: 'AQJT86' },
  },
  {
    description: "1S-2H: 16 HCP / 19 total and 20 shortage points, seven powerful spades and three hearts; either 4S or 4H is a modeled game choice.",
    practiceAuction: ['1S', 'Pass', '2H', 'Pass', '4S'],
    requiredSystem: { twoLevelNewSuitResponse: 'standard' },
    expectedOpeningCalls: [
      { call: '1S', ruleIds: ['open-five-card-major'] },
    ],
    expectedResponseCalls: [
      { call: '2H', ruleIds: ['respond-to-major-w/o-support-new-suit-two-level-standard'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '4S', ruleIds: ['opener-rebid-game-same-major-after-major-standard-two-level-new-suit'] },
      { call: '4H', ruleIds: ['opener-rebid-game-raise-after-major-standard-two-level-new-suit'] },
    ],
    north: { S: 'AKQJ987', H: 'AQ4', D: '2', C: '65' },
    south: { S: 'T3', H: 'KJ9875', D: 'AQ3', C: 'J4' },
  },
  {
    description: "1H-2C-3C: minimum 5H-4C with four-card club support; a minor response does not promise five cards, unlike 2H after 1S.",
    practiceAuction: ['1H', 'Pass', '2C', 'Pass', '3C'],
    requiredSystem: { twoLevelNewSuitResponse: 'standard' },
    expectedOpeningCalls: [
      { call: '1H', ruleIds: ['open-five-card-major'] },
    ],
    expectedResponseCalls: [
      { call: '2C', ruleIds: ['respond-to-major-w/o-support-new-suit-two-level-standard'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '3C', ruleIds: ['opener-rebid-simple-raise-after-major-standard-two-level-new-suit'] },
    ],
    north: { S: '72', H: 'AQJ85', D: 'K3', C: 'K964' },
    south: { S: 'K93', H: 'K7', D: 'JT7', C: 'A8753' },
  },
  {
    description: "1S-2H-3C: 17 HCP / 18 total, 5S-4C; this three-level lower-suit rebid is a high reverse because responder must bid 3S to return to spades.",
    practiceAuction: ['1S', 'Pass', '2H', 'Pass', '3C'],
    requiredSystem: { twoLevelNewSuitResponse: 'standard' },
    expectedOpeningCalls: [
      { call: '1S', ruleIds: ['open-five-card-major'] },
    ],
    expectedResponseCalls: [
      { call: '2H', ruleIds: ['respond-to-major-w/o-support-new-suit-two-level-standard'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '3C', ruleIds: ['opener-rebid-reverse-after-major-standard-two-level-new-suit'] },
    ],
    north: { S: 'AQJ85', H: '73', D: 'K7', C: 'AK94' },
    south: { S: 'T9', H: 'AKJT852', D: 'J52', C: 'Q' },
  },
  {
    description: "1S-2H-2S: 13 HCP / 14 total, five spades and four clubs but only two hearts; minimum values rule out the high reverse 3C, so 2S is an explicit five-card fallback.",
    practiceAuction: ['1S', 'Pass', '2H', 'Pass', '2S'],
    requiredSystem: { twoLevelNewSuitResponse: 'standard' },
    expectedOpeningCalls: [
      { call: '1S', ruleIds: ['open-five-card-major'] },
    ],
    expectedResponseCalls: [
      { call: '2H', ruleIds: ['respond-to-major-w/o-support-new-suit-two-level-standard'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '2S', ruleIds: ['opener-rebid-five-card-major-fallback-after-major-standard-two-level-new-suit'] },
    ],
    north: { S: 'AKJ85', H: '72', D: '63', C: 'KQ94' },
    south: { S: '96', H: 'AKQJT5', D: 'KT8', C: 'T2' },
  },
  {
    description: "1H-2C-2H: 12 HCP / 13 total, 5H-4S but no club fit; without reverse strength for 2S or another economical rebid, repeat five hearts as a fallback.",
    practiceAuction: ['1H', 'Pass', '2C', 'Pass', '2H'],
    requiredSystem: { twoLevelNewSuitResponse: 'standard' },
    expectedOpeningCalls: [
      { call: '1H', ruleIds: ['open-five-card-major'] },
    ],
    expectedResponseCalls: [
      { call: '2C', ruleIds: ['respond-to-major-w/o-support-new-suit-two-level-standard'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '2H', ruleIds: ['opener-rebid-five-card-major-fallback-after-major-standard-two-level-new-suit'] },
    ],
    north: { S: 'AK84', H: 'KQ875', D: '962', C: '3' },
    south: { S: 'QT2', H: 'A4', D: 'KQ8', C: 'T9865' },
  },
];

///
//// Opener rebids after a major opening and 2/1 game-forcing new-suit response
///
export const OPENER_REBID_AFTER_MAJOR_TWO_OVER_ONE_NEW_SUIT_TEST_DEALS: RuleTestDeal[] = [
  {
    description: '1H-2C-2S in 2/1: minimum 13 HCP, 5H-4S; game is already forced, so showing spades does not require Standard reverse strength.',
    practiceAuction: ['1H', 'Pass', '2C', 'Pass', '2S'],
    requiredSystem: { twoLevelNewSuitResponse: 'twoOverOne' },
    expectedOpeningCalls: [
      { call: '1H', ruleIds: ['open-five-card-major'] },
    ],
    expectedResponseCalls: [
      { call: '2C', ruleIds: ['respond-to-major-w/o-support-new-suit-two-level-two-over-one'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '2S', ruleIds: ['opener-rebid-second-suit-after-major-two-over-one-new-suit'] },
    ],
    north: { S: 'AQ84', H: 'KJ985', D: 'K72', C: '3' },
    south: { S: 'K63', H: 'Q7', D: 'J4', C: 'AQJ952' },
  },
  {
    description: '1S-2H-3C in 2/1: minimum 15 HCP, 5S-4C; a natural three-level second suit does not promise the extra strength required by the same high reverse in Standard.',
    practiceAuction: ['1S', 'Pass', '2H', 'Pass', '3C'],
    requiredSystem: { twoLevelNewSuitResponse: 'twoOverOne' },
    expectedOpeningCalls: [
      { call: '1S', ruleIds: ['open-five-card-major'] },
    ],
    expectedResponseCalls: [
      { call: '2H', ruleIds: ['respond-to-major-w/o-support-new-suit-two-level-two-over-one'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '3C', ruleIds: ['opener-rebid-second-suit-after-major-two-over-one-new-suit'] },
    ],
    north: { S: 'AQJ85', H: '7', D: 'Q32', C: 'AQ94' },
    south: { S: 'K6', H: 'AKJ85', D: 'K74', C: '852' },
  },
  {
    description: "1S-2H in 2/1: 12 HCP / 14 total with six spades and three hearts; 2S describes opener's long major while 3H confirms the known eight-card heart fit.",
    practiceAuction: ['1S', 'Pass', '2H', 'Pass', '3H'],
    requiredSystem: { twoLevelNewSuitResponse: 'twoOverOne' },
    expectedOpeningCalls: [
      { call: '1S', ruleIds: ['open-five-card-major'] },
    ],
    expectedResponseCalls: [
      { call: '2H', ruleIds: ['respond-to-major-w/o-support-new-suit-two-level-two-over-one'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '3H', ruleIds: ['opener-rebid-simple-raise-after-major-two-over-one-new-suit'] },
      { call: '2S', ruleIds: ['opener-rebid-repeat-major-after-major-two-over-one-new-suit'] },
    ],
    north: { S: 'KQJ985', H: 'A74', D: 'Q82', C: '6' },
    south: { S: 'A4', H: 'KJ852', D: 'AK3', C: 'J52' },
  },
  {
    description: '1H-2C-2NT in 2/1: 14 HCP, 5-3-3-2 balanced with no club fit; describe the flat shape economically because game is already forced.',
    practiceAuction: ['1H', 'Pass', '2C', 'Pass', '2NT'],
    requiredSystem: { twoLevelNewSuitResponse: 'twoOverOne' },
    expectedOpeningCalls: [
      { call: '1H', ruleIds: ['open-five-card-major'] },
    ],
    expectedResponseCalls: [
      { call: '2C', ruleIds: ['respond-to-major-w/o-support-new-suit-two-level-two-over-one'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '2NT', ruleIds: ['opener-rebid-2nt-after-major-two-over-one-new-suit'] },
    ],
    north: { S: 'A82', H: 'AQJ85', D: 'K72', C: '85' },
    south: { S: 'KQ3', H: 'K6', D: '94', C: 'AQJ742' },
  },
  {
    description: "1H-2C-3C in 2/1: minimum 13 HCP, 5H-4C; a minor response needs four-card opener support, unlike the three hearts sufficient after 1S-2H.",
    practiceAuction: ['1H', 'Pass', '2C', 'Pass', '3C'],
    requiredSystem: { twoLevelNewSuitResponse: 'twoOverOne' },
    expectedOpeningCalls: [
      { call: '1H', ruleIds: ['open-five-card-major'] },
    ],
    expectedResponseCalls: [
      { call: '2C', ruleIds: ['respond-to-major-w/o-support-new-suit-two-level-two-over-one'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '3C', ruleIds: ['opener-rebid-simple-raise-after-major-two-over-one-new-suit'] },
    ],
    north: { S: 'K82', H: 'AQJ85', D: '3', C: 'QJ94' },
    south: { S: 'AQ3', H: 'K6', D: 'K74', C: 'A8765' },
  },
];

///
//// Opener rebids after responder's simple raise of a major
///
export const OPENER_REBID_AFTER_MAJOR_SIMPLE_RAISE_TEST_DEALS: RuleTestDeal[] = [
  {
    description: '1S-2S-Pass: 12 HCP / 13 shortage points with an ordinary five-card major; minimum values and no extra trump length give no reason to continue.',
    practiceAuction: ['1S', 'Pass', '2S', 'Pass', 'Pass'],
    expectedOpeningCalls: [
      { call: '1S', ruleIds: ['open-five-card-major'] },
    ],
    expectedResponseCalls: [
      { call: '2S', ruleIds: ['respond-to-major-w/-support-simple-raise'] },
    ],
    expectedOpenerRebidCalls: [
      { call: 'Pass', ruleIds: ['opener-rebid-pass-after-major-simple-raise'] },
    ],
    north: { S: 'AQJ85', H: 'K74', D: 'Q72', C: '85' },
    south: { S: 'K63', H: 'T83', D: 'J64', C: 'Q942' },
  },
  {
    description: '1S-2S: minimum 12 HCP / 15 shortage points with six spades; Pass remains sound, while 3S uses the extra trump length competitively and is not a game invitation.',
    practiceAuction: ['1S', 'Pass', '2S', 'Pass', '3S'],
    expectedOpeningCalls: [
      { call: '1S', ruleIds: ['open-five-card-major'] },
    ],
    expectedResponseCalls: [
      { call: '2S', ruleIds: ['respond-to-major-w/-support-simple-raise'] },
    ],
    expectedOpenerRebidCalls: [
      { call: 'Pass', ruleIds: ['opener-rebid-pass-after-major-simple-raise'] },
      { call: '3S', ruleIds: ['opener-rebid-competitive-three-after-major-simple-raise'] },
    ],
    north: { S: 'AQJ985', H: 'K74', D: 'Q72', C: '8' },
    south: { S: 'K63', H: 'T83', D: 'J64', C: 'Q942' },
  },
  {
    description: '1H-2H-2S: 16 HCP / 18 shortage points with 5H-4S; a natural spade help-suit game try asks whether responder has useful values or shortness there.',
    practiceAuction: ['1H', 'Pass', '2H', 'Pass', '2S'],
    expectedOpeningCalls: [
      { call: '1H', ruleIds: ['open-five-card-major'] },
    ],
    expectedResponseCalls: [
      { call: '2H', ruleIds: ['respond-to-major-w/-support-simple-raise'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '2S', ruleIds: ['opener-rebid-help-suit-game-try-after-major-simple-raise'] },
    ],
    north: { S: 'KQ74', H: 'AQJ85', D: 'A7', C: '85' },
    south: { S: 'T83', H: 'K63', D: 'J64', C: 'Q942' },
  },
  {
    description: '1S-2S: 17 HCP balanced 5-3-3-2; 2NT is the natural balanced game try based on HCP, while 3D and 3H remain available as natural help-suit tries.  The hand could also have opened 1NT.',
    practiceAuction: ['1S', 'Pass', '2S', 'Pass', '2NT'],
    expectedOpeningCalls: [
      { call: '1S', ruleIds: ['open-five-card-major'] },
    ],
    expectedResponseCalls: [
      { call: '2S', ruleIds: ['respond-to-major-w/-support-simple-raise'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '2NT', ruleIds: ['opener-rebid-2nt-game-try-after-major-simple-raise'] },
      { call: '3D', ruleIds: ['opener-rebid-help-suit-game-try-after-major-simple-raise'] },
      { call: '3H', ruleIds: ['opener-rebid-help-suit-game-try-after-major-simple-raise'] },
    ],
    north: { S: 'AQJ85', H: 'K74', D: 'A72', C: 'K8' },
    south: { S: 'K63', H: 'Q85', D: 'J64', C: 'T942' },
  },
  {
    description: '1H-2H: 18 HCP / 21 shortage points with singleton spade; the natural 4H game raise and optional 3S splinter both describe a maximum hand with the known heart fit.',
    practiceAuction: ['1H', 'Pass', '2H', 'Pass', '4H'],
    requiredSystem: { splinters: true },
    expectedOpeningCalls: [
      { call: '1H', ruleIds: ['open-five-card-major'] },
    ],
    expectedResponseCalls: [
      { call: '2H', ruleIds: ['respond-to-major-w/-support-simple-raise'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '4H', ruleIds: ['opener-rebid-game-raise-after-major-simple-raise'] },
      { call: '3S', ruleIds: ['opener-rebid-splinter-after-major-simple-raise'] },
    ],
    north: { S: '5', H: 'AKQ85', D: 'AQ84', C: 'K72' },
    south: { S: 'J763', H: 'T96', D: 'K52', C: 'Q94' },
  },
];

///
//// Responses to 1-level minor openings
///

/// This bucket adds response situations missing from the opener-rebid practice corpus; it is not
/// an exhaustive response quiz.  Those rebid buckets already exercise a one-level new-suit
/// response, both Standard and 2/1 1D-2C, and balanced 1NT and invitational 2NT responses.
/// Their expectedResponseCalls still count toward whole-corpus coverage.  The rare 4NT
/// Blackwood response is intentionally left without a dedicated practice deal.
export const RESPONSE_AFTER_MINOR_OPENING_TEST_DEALS: RuleTestDeal[] = [
  {
    description: '1D-Pass: 5 HCP with four diamonds; even a known minor fit does not overcome insufficient responding values.',
    practiceAuction: ['1D', 'Pass', 'Pass'],
    expectedOpeningCalls: [
      { call: '1D', ruleIds: ['open-convenient-minor'] },
    ],
    expectedResponseCalls: [
      { call: 'Pass', ruleIds: ['respond-to-minor-w/-pass-0-5'] },
    ],
    north: { S: 'K84', H: 'Q72', D: 'AJ92', C: 'K85' },
    south: { S: 'Q62', H: 'J94', D: 'T743', C: 'Q64' },
  },
  {
    description: '1D-2D: minimum 8 HCP with exactly four diamonds and no four-card major; four-card support is sufficient after 1D.',
    practiceAuction: ['1D', 'Pass', '2D'],
    expectedOpeningCalls: [
      { call: '1D', ruleIds: ['open-convenient-minor'] },
    ],
    expectedResponseCalls: [
      { call: '2D', ruleIds: ['respond-to-minor-w/-raise-to-two'] },
    ],
    north: { S: 'K84', H: 'Q72', D: 'AJ92', C: 'K85' },
    south: { S: 'J6', H: '63', D: 'KQ74', C: 'QT943' },
  },
  {
    description: '1C: 11 HCP, five clubs and balanced 5-3-3-2; the 3C limit raise and invitational 2NT are both modeled responses.',
    practiceAuction: ['1C', 'Pass', '3C'],
    expectedOpeningCalls: [
      { call: '1C', ruleIds: ['open-convenient-minor'] },
    ],
    expectedResponseCalls: [
      { call: '3C', ruleIds: ['respond-to-minor-w/-limit-raise'] },
      { call: '2NT', ruleIds: ['respond-to-minor-w/-2nt'] },
    ],
    north: { S: 'K84', H: 'J72', D: 'A92', C: 'KJ85' },
    south: { S: '962', H: 'AQ8', D: 'K7', C: 'QT974' },
  },
  {
    description: '1C-3NT: 14 HCP, balanced 4-3-3-3 with no four-card major or five-card club fit; place the contract in notrump game.',
    practiceAuction: ['1C', 'Pass', '3NT'],
    expectedOpeningCalls: [
      { call: '1C', ruleIds: ['open-convenient-minor'] },
    ],
    expectedResponseCalls: [
      { call: '3NT', ruleIds: ['respond-to-minor-w/-3nt'] },
    ],
    north: { S: 'K84', H: 'Q72', D: 'A92', C: 'KJ85' },
    south: { S: 'AQ6', H: 'KJ4', D: 'KJ7', C: 'T964' },
  },
  {
    description: '1C-1D: 13 HCP with five-card club support and four diamonds; both the ordinary forcing 1D response and the strong-support new-suit-first rule apply.  Raise clubs later.',
    practiceAuction: ['1C', 'Pass', '1D'],
    expectedOpeningCalls: [
      { call: '1C', ruleIds: ['open-convenient-minor'] },
    ],
    expectedResponseCalls: [
      { call: '1D', ruleIds: ['respond-to-minor-w/-new-suit-one-level-priority',
                              'respond-to-minor-w/-13plus-start-new-suit'] },
    ],
    north: { S: 'K84', H: 'Q72', D: 'J93', C: 'AK86' },
    south: { S: 'J9', H: 'K6', D: 'AK72', C: 'QT975' },
  },
  {
    description: '1C: 6 HCP with six good hearts; under weak jump shifts, 2H outranks the ordinary 1H response without eliminating it.',
    practiceAuction: ['1C', 'Pass', '2H'],
    requiredSystem: { jumpShift: 'weak' },
    expectedOpeningCalls: [
      { call: '1C', ruleIds: ['open-convenient-minor'] },
    ],
    expectedResponseCalls: [
      { call: '2H', ruleIds: ['respond-to-minor-w/-weak-jump-shift-modern'] },
      { call: '1H', ruleIds: ['respond-to-minor-w/-new-suit-one-level-priority'] },
    ],
    expectedResponseCallOrder: [['2H', '1H']],
    north: { S: 'K84', H: 'Q72', D: 'A92', C: 'KJ85' },
    south: { S: 'Q63', H: 'KJT986', D: 'T4', C: 'T9' },
  },
  {
    description: '1C: 18 HCP with five strong hearts; under strong jump shifts, 2H outranks the ordinary forcing 1H response without eliminating it.',
    practiceAuction: ['1C', 'Pass', '2H'],
    requiredSystem: { jumpShift: 'strong' },
    expectedOpeningCalls: [
      { call: '1C', ruleIds: ['open-convenient-minor'] },
    ],
    expectedResponseCalls: [
      { call: '2H', ruleIds: ['respond-to-minor-w/-strong-jump-shift-classic'] },
      { call: '1H', ruleIds: ['respond-to-minor-w/-new-suit-one-level-priority'] },
    ],
    expectedResponseCallOrder: [['2H', '1H']],
    north: { S: 'K84', H: '742', D: 'AQ9', C: 'KQ85' },
    south: { S: 'AJ6', H: 'AKQ85', D: 'K7', C: 'J94' },
  },
  {
    description: '1C: 8 HCP with four hearts and four spades; both one-level majors qualify. ' +
                 'With equally long four-card majors, bid up the line: 1H before 1S.',
    practiceAuction: ['1C', 'Pass', '1H'],
    expectedOpeningCalls: [
      { call: '1C', ruleIds: ['open-convenient-minor'] },
    ],
    expectedResponseCalls: [
      { call: '1H', ruleIds: ['respond-to-minor-w/-new-suit-one-level-priority'] },
      { call: '1S', ruleIds: ['respond-to-minor-w/-new-suit-one-level-priority'] },
    ],
    expectedResponseCallOrder: [['1H', '1S']],
    north: { S: 'K84', H: 'Q72', D: 'A92', C: 'KJ85' },
    south: { S: 'JT75', H: 'KJT6', D: 'JT4', C: 'Q9' },
  },
  {
    description: '1C: 8 HCP with five hearts and five spades; both one-level majors qualify. ' +
                 'With equally long five-card majors, bid down the line: 1S before 1H.',
    practiceAuction: ['1C', 'Pass', '1S'],
    expectedOpeningCalls: [
      { call: '1C', ruleIds: ['open-convenient-minor'] },
    ],
    expectedResponseCalls: [
      { call: '1S', ruleIds: ['respond-to-minor-w/-new-suit-one-level-priority'] },
      { call: '1H', ruleIds: ['respond-to-minor-w/-new-suit-one-level-priority'] },
    ],
    expectedResponseCallOrder: [['1S', '1H']],
    north: { S: 'K84', H: 'Q72', D: 'A92', C: 'KJ85' },
    south: { S: 'QJT75', H: 'K9643', D: 'T3', C: 'Q' },
  },
  {
    description: '1C: 8 HCP with five diamonds and four spades; prefer 1S to look for the ' +
                 'major fit, but retain the genuinely longer 1D as an alternative.',
    practiceAuction: ['1C', 'Pass', '1S'],
    expectedOpeningCalls: [
      { call: '1C', ruleIds: ['open-convenient-minor'] },
    ],
    expectedResponseCalls: [
      { call: '1S', ruleIds: ['respond-to-minor-w/-new-suit-one-level-priority'] },
      { call: '1D', ruleIds: ['respond-to-minor-w/-new-suit-one-level-priority'] },
    ],
    expectedResponseCallOrder: [['1S', '1D']],
    north: { S: 'K84', H: 'Q72', D: 'A92', C: 'KJ85' },
    south: { S: 'T965', H: 'J9', D: 'KQT63', C: 'QT' },
  },
  {
    description: '1C: 12 HCP with five diamonds and four spades; show the major first. ' +
                 'The longer-diamond alternative is reserved for minimum 6-10 HCP responses.',
    practiceAuction: ['1C', 'Pass', '1S'],
    expectedOpeningCalls: [
      { call: '1C', ruleIds: ['open-convenient-minor'] },
    ],
    expectedResponseCalls: [
      { call: '1S', ruleIds: ['respond-to-minor-w/-new-suit-one-level-priority'] },
    ],
    rejectedResponseCalls: ['1D'],
    north: { S: 'K84', H: 'Q72', D: 'A92', C: 'KJ85' },
    south: { S: 'A963', H: 'A3', D: 'KJ543', C: '74' },
  },
  {
    description: '1D: 8 HCP with four diamonds and four spades; showing a four-card major ' +
                 'takes priority over the otherwise available minimum diamond raise.',
    practiceAuction: ['1D', 'Pass', '1S'],
    expectedOpeningCalls: [
      { call: '1D', ruleIds: ['open-convenient-minor'] },
    ],
    expectedResponseCalls: [
      { call: '1S', ruleIds: ['respond-to-minor-w/-new-suit-one-level-priority'] },
    ],
    rejectedResponseCalls: ['2D'],
    north: { S: 'K84', H: 'Q72', D: 'AJ92', C: 'K85' },
    south: { S: '9763', H: 'JT4', D: 'Q864', C: 'AJ' },
  },
  {
    description: '1C: 8 HCP with five hearts and four spades; the longer heart suit ' +
                 'eliminates the shorter 1S response instead of merely ranking it second.',
    practiceAuction: ['1C', 'Pass', '1H'],
    expectedOpeningCalls: [
      { call: '1C', ruleIds: ['open-convenient-minor'] },
    ],
    expectedResponseCalls: [
      { call: '1H', ruleIds: ['respond-to-minor-w/-new-suit-one-level-priority'] },
    ],
    rejectedResponseCalls: ['1S'],
    north: { S: 'K84', H: 'Q72', D: 'A92', C: 'KJ85' },
    south: { S: 'A762', H: 'A9864', D: '43', C: '42' },
  },
];

/// Supplementary major-opening response coverage.  The opener-rebid buckets already exercise
/// simple raises, natural new-suit responses, and both forcing and non-forcing 1NT responses.
/// Their expectedResponseCalls count toward corpus coverage; rare Blackwood is deferred.
export const RESPONSE_AFTER_MAJOR_OPENING_TEST_DEALS: RuleTestDeal[] = [
  {
    description: '1S-Pass: 4 HCP and only two spades; without enough strength to respond, pass.',
    practiceAuction: ['1S', 'Pass', 'Pass'],
    expectedOpeningCalls: [
      { call: '1S', ruleIds: ['open-five-card-major'] },
    ],
    expectedResponseCalls: [
      { call: 'Pass', ruleIds: ['respond-to-major-w/-pass-0-5'] },
    ],
    north: { S: 'AQJ72', H: 'K8', D: 'A982', C: 'T8' },
    south: { S: '65', H: '9542', D: 'JT43', C: 'K43' },
  },
  {
    description: '1H-Pass: 4 HCP, three hearts and flat shape; support adds no shortage points, so pass.',
    practiceAuction: ['1H', 'Pass', 'Pass'],
    expectedOpeningCalls: [
      { call: '1H', ruleIds: ['open-five-card-major'] },
    ],
    rejectedOpeningCalls: ['1NT'],
    expectedResponseCalls: [
      { call: 'Pass', ruleIds: ['respond-to-major-w/-support-pass-0-5'] },
    ],
    north: { S: 'K8', H: 'AQJ72', D: 'AJ92', C: 'T8' },
    south: { S: 'Q53', H: '983', D: 'Q873', C: '973' },
  },
  {
    description: '1S-3S: 11 HCP plus one shortage point for a doubleton gives 12 support points; with four ' +
                 'spades, make a limit raise.',
    practiceAuction: ['1S', 'Pass', '3S'],
    expectedOpeningCalls: [
      { call: '1S', ruleIds: ['open-five-card-major'] },
    ],
    expectedResponseCalls: [
      { call: '3S', ruleIds: ['respond-to-major-w/-support-limit-raise-four-card'] },
    ],
    north: { S: 'AQJ72', H: 'K8', D: 'A982', C: 'T8' },
    south: { S: 'T954', H: 'Q43', D: 'KJ43', C: 'KQ' },
  },
  {
    description: '1H-1S: 11 HCP plus one shortage point gives 12 support points with three hearts; show four ' +
                 'spades first, then make the invitational heart raise.',
    practiceAuction: ['1H', 'Pass', '1S'],
    expectedOpeningCalls: [
      { call: '1H', ruleIds: ['open-five-card-major'] },
    ],
    expectedResponseCalls: [
      { call: '1S', ruleIds: ['respond-to-major-w/-support-limit-raise-three-card-new-suit-first'] },
    ],
    // The four-card spade suit is available ahead of the 1NT limit-raise route.
    rejectedResponseCalls: ['1NT'],
    north: { S: 'K8', H: 'AQJ72', D: 'AJ92', C: 'T8' },
    south: { S: 'AQ74', H: 'K64', D: 'QT65', C: '95' },
  },
  {
    description: '1S-1NT: 11 HCP plus one shortage point gives 12 support points with exactly three spades; ' +
                 'under forcing 1NT, invite with a later spade raise.',
    practiceAuction: ['1S', 'Pass', '1NT'],
    requiredSystem: { majorOneNtResponse: 'forcing' },
    expectedOpeningCalls: [
      { call: '1S', ruleIds: ['open-five-card-major'] },
    ],
    expectedResponseCalls: [
      { call: '1NT', ruleIds: ['respond-to-major-w/-support-limit-raise-three-card'] },
    ],
    north: { S: 'AQJ72', H: 'K8', D: 'A982', C: 'T8' },
    south: { S: 'K54', H: 'Q963', D: 'KJ65', C: 'Q7' },
  },
  {
    description: '1H-1NT: 12 HCP and three hearts, but no four-card spade suit; non-forcing 1NT is the ' +
                 'limit-raise fallback. Opener may pass, so the later invitation is not guaranteed.',
    practiceAuction: ['1H', 'Pass', '1NT'],
    requiredSystem: { majorOneNtResponse: 'nonForcing' },
    expectedOpeningCalls: [
      { call: '1H', ruleIds: ['open-five-card-major'] },
    ],
    expectedResponseCalls: [
      { call: '1NT', ruleIds: ['respond-to-major-w/-support-limit-raise-three-card-nonforcing-1nt-fallback'] },
    ],
    north: { S: 'K8', H: 'AQJ72', D: 'AJ92', C: 'T8' },
    south: { S: 'J96', H: 'K93', D: 'KT63', C: 'KQ9' },
  },
  {
    description: '1S: 14 HCP, flat 4-3-3-3, three-card spade support and four diamonds; both game-forcing 2D ' +
                 'followed by a raise and direct 3NT qualify. Shortage adds no points.',
    practiceAuction: ['1S', 'Pass', '2D'],
    expectedOpeningCalls: [
      { call: '1S', ruleIds: ['open-five-card-major'] },
    ],
    expectedResponseCalls: [
      { call: '2D', ruleIds: ['respond-to-major-w/-three-card-support-13plus-bid-new-suit-then-raise'] },
      { call: '3NT', ruleIds: ['respond-to-major-w/-3nt-flat-13-15'] },
    ],
    north: { S: 'AQJ72', H: 'K8', D: 'A982', C: 'T8' },
    south: { S: 'K65', H: 'AT3', D: 'K763', C: 'A74' },
  },
  {
    description: '1H: 11 HCP plus three shortage points for a singleton club gives 14 support points with four ' +
                 'hearts; the 4C splinter ranks ahead of the valid 1S and 2D new-suit-first routes.',
    practiceAuction: ['1H', 'Pass', '4C'],
    requiredSystem: { majorGameForceWithSupport: 'newSuitThenRaise', splinters: true },
    expectedOpeningCalls: [
      { call: '1H', ruleIds: ['open-five-card-major'] },
    ],
    expectedResponseCalls: [
      { call: '4C', ruleIds: ['respond-to-major-w/-support-splinter'] },
      { call: '1S', ruleIds: ['respond-to-major-w/-four-card-support-13plus-bid-new-suit-then-raise'] },
      { call: '2D', ruleIds: ['respond-to-major-w/-four-card-support-13plus-bid-new-suit-then-raise'] },
    ],
    expectedResponseCallOrder: [['4C', '1S'], ['4C', '2D']],
    north: { S: 'K8', H: 'AQJ72', D: 'AJ92', C: 'T8' },
    south: { S: 'J962', H: 'K986', D: 'K763', C: 'A' },
  },
  {
    description: '1S-2NT: 13 HCP plus one shortage point for a doubleton gives 14 support points with four ' +
                 'spades; Jacoby 2NT is the agreed game force.',
    practiceAuction: ['1S', 'Pass', '2NT'],
    requiredSystem: { majorGameForceWithSupport: 'jacoby2NT' },
    expectedOpeningCalls: [
      { call: '1S', ruleIds: ['open-five-card-major'] },
    ],
    expectedResponseCalls: [
      { call: '2NT', ruleIds: ['respond-to-major-w/-support-jacoby-2nt-agreement'] },
    ],
    north: { S: 'AQJ72', H: 'K8', D: 'A982', C: 'T8' },
    south: { S: 'K954', H: 'AT4', D: '6543', C: 'AQ' },
  },
  {
    description: '1H: 7 HCP plus one shortage point for a doubleton gives 8 support points with five hearts; ' +
                 'both the ordinary 2H raise and preemptive 4H qualify.',
    practiceAuction: ['1H', 'Pass', '4H'],
    expectedOpeningCalls: [
      { call: '1H', ruleIds: ['open-five-card-major'] },
    ],
    expectedResponseCalls: [
      { call: '2H', ruleIds: ['respond-to-major-w/-support-simple-raise'] },
      { call: '4H', ruleIds: ['respond-to-major-w/-support-preemptive-game-raise'] },
    ],
    north: { S: 'K8', H: 'AQJ72', D: 'AJ92', C: 'T8' },
    south: { S: 'T5', H: 'K9543', D: '863', C: 'A93' },
  },
  {
    description: '1H: 6 HCP and six good spades; under weak jump shifts, 2S outranks the ordinary 1S response, ' +
                 'which remains visible.',
    practiceAuction: ['1H', 'Pass', '2S'],
    requiredSystem: { jumpShift: 'weak' },
    expectedOpeningCalls: [
      { call: '1H', ruleIds: ['open-five-card-major'] },
    ],
    expectedResponseCalls: [
      { call: '2S', ruleIds: ['respond-to-major-w-weak-jump-shift-modern'] },
      { call: '1S', ruleIds: ['respond-to-major-w/o-support-new-suit-one-level'] },
    ],
    expectedResponseCallOrder: [['2S', '1S']],
    north: { S: 'K8', H: 'AQJ72', D: 'AJ92', C: 'T8' },
    south: { S: 'AQ7642', H: '8', D: 'T54', C: '532' },
  },
  {
    description: '1H: 18 HCP and five strong spades; under strong jump shifts, 2S outranks the ordinary 1S ' +
                 'response, which remains visible.',
    practiceAuction: ['1H', 'Pass', '2S'],
    requiredSystem: { jumpShift: 'strong' },
    expectedOpeningCalls: [
      { call: '1H', ruleIds: ['open-five-card-major'] },
    ],
    expectedResponseCalls: [
      { call: '2S', ruleIds: ['respond-to-major-w/-strong-jump-shift-classic'] },
      { call: '1S', ruleIds: ['respond-to-major-w/o-support-new-suit-one-level'] },
    ],
    north: { S: 'K8', H: 'AQJ72', D: 'AJ92', C: 'T8' },
    south: { S: 'AQJT9', H: 'K8', D: 'KQ7', C: 'K93' },
  },
  {
    description: '1S: 13 HCP with three spades, four hearts and only three cards in each ' +
                 'minor. Game-forcing support needs a new suit first: both 2C and 2D are ' +
                 'allowed three-card-minor fallbacks, while four hearts cannot support 2H.',
    practiceAuction: ['1S', 'Pass', '2C'],
    requiredSystem: { majorGameForceWithSupport: 'newSuitThenRaise' },
    expectedOpeningCalls: [
      { call: '1S', ruleIds: ['open-five-card-major'] },
    ],
    expectedResponseCalls: [
      { call: '2C', ruleIds: ['respond-to-major-w/-three-card-support-13plus-bid-new-suit-then-raise'] },
      { call: '2D', ruleIds: ['respond-to-major-w/-three-card-support-13plus-bid-new-suit-then-raise'] },
    ],
    rejectedResponseCalls: ['2H'],
    north: { S: 'AQJ72', H: 'K8', D: 'A982', C: 'T8' },
    south: { S: 'K98', H: 'A974', D: 'KJ7', C: 'Q94' },
  },
];

/// The dropdown follows bidding order: opening bids, responses, then opener rebids.
/// 'all' concatenates compatible deals in the same order.
export const RULE_TEST_DEAL_BUCKETS = [
  { id: 'opening-bids', group: 'Opening bids', label: 'Opening selection',
    deals: OPENING_BID_TEST_DEALS },
  { id: 'response-minor-opening', group: 'Responses to 1-level opening', label: 'Minor opening',
    deals: RESPONSE_AFTER_MINOR_OPENING_TEST_DEALS },
  { id: 'response-major-opening', group: 'Responses to 1-level opening', label: 'Major opening',
    deals: RESPONSE_AFTER_MAJOR_OPENING_TEST_DEALS },
  { id: 'minor-1nt', group: 'Opener rebids', label: 'Minor - 1NT response',
    deals: OPENER_REBID_AFTER_MINOR_1NT_TEST_DEALS },
  { id: 'minor-one-level-new-suit', group: 'Opener rebids', label: 'Minor - one-level new suit',
    deals: OPENER_REBID_AFTER_MINOR_ONE_LEVEL_NEW_SUIT_TEST_DEALS },
  { id: 'minor-standard-two-level-new-suit', group: 'Opener rebids',
    label: 'Minor - Standard two-level new suit',
    deals: OPENER_REBID_AFTER_MINOR_STANDARD_TWO_LEVEL_NEW_SUIT_TEST_DEALS },
  { id: 'minor-two-over-one-new-suit', group: 'Opener rebids',
    label: 'Minor - 2/1 two-level new suit',
    deals: OPENER_REBID_AFTER_MINOR_TWO_OVER_ONE_NEW_SUIT_TEST_DEALS },
  { id: 'major-1nt', group: 'Opener rebids', label: 'Major - 1NT response',
    deals: OPENER_REBID_AFTER_MAJOR_1NT_TEST_DEALS },
  { id: 'major-one-level-new-suit', group: 'Opener rebids', label: 'Major - one-level new suit',
    deals: OPENER_REBID_AFTER_MAJOR_ONE_LEVEL_NEW_SUIT_TEST_DEALS },
  { id: 'major-standard-two-level-new-suit', group: 'Opener rebids',
    label: 'Major - Standard two-level new suit',
    deals: OPENER_REBID_AFTER_MAJOR_STANDARD_TWO_LEVEL_NEW_SUIT_TEST_DEALS },
  { id: 'major-two-over-one-new-suit', group: 'Opener rebids',
    label: 'Major - 2/1 two-level new suit',
    deals: OPENER_REBID_AFTER_MAJOR_TWO_OVER_ONE_NEW_SUIT_TEST_DEALS },
  { id: 'major-simple-raise', group: 'Opener rebids', label: 'Major - simple raise',
    deals: OPENER_REBID_AFTER_MAJOR_SIMPLE_RAISE_TEST_DEALS },
] as const;

/// RuleTestDealBucketId is 'all' plus every id declared in RULE_TEST_DEAL_BUCKETS.
/// In `typeof RULE_TEST_DEAL_BUCKETS[number]['id']`, `number` means any numeric array index,
/// so TypeScript considers every possible bucket element; `['id']` is an indexed property access
/// that extracts each element's `id` property.  `id` is not a TypeScript keyword: if the bucket
/// property were named `foo`, this expression would use `['foo']`.  Adding a bucket therefore
/// automatically adds its id to this type without maintaining a second list.
export type RuleTestDealBucketId = 'all' | typeof RULE_TEST_DEAL_BUCKETS[number]['id'];

/// Bidding rules are grouped into logical buckets, such as opener rebids after a minor opening
/// and 1NT response or opener rebids after a major opening and simple raise.  Each bucket owns an
/// array of test deals chosen to exercise the rules in that group.  'all' means the test deals
/// from all buckets that are compatible with the active bidding system; it does not mean every
/// test deal regardless of its required system settings.
export function getRulesBucketTestDeals (bucketId: RuleTestDealBucketId,
                                         system: BiddingSystem): RuleTestDeal[] {
  const buckets = bucketId === 'all'
    ? RULE_TEST_DEAL_BUCKETS
    : RULE_TEST_DEAL_BUCKETS.filter((bucket) => bucket.id === bucketId);
  return buckets.flatMap((bucket) => bucket.deals.filter((deal) => dealIsCompatible(deal, system)));
}

function dealIsCompatible (deal: RuleTestDeal, system: BiddingSystem): boolean {
  const requiredSystem = deal.requiredSystem;
  if (requiredSystem === undefined) {
    return true;
  }
  return (Object.keys(requiredSystem) as (keyof BiddingSystem)[])
    .every((setting) => system[setting] === requiredSystem[setting]);
}
