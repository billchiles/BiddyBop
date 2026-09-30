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
//// Opener rebids after responder raises a minor opening
///
export const OPENER_REBID_AFTER_MINOR_RAISE_TEST_DEALS: RuleTestDeal[] = [
  {
    description: '1D-2D-Pass: a 13-total-point opener declines responder\'s minimum minor raise.',
    practiceAuction: ['1D', 'Pass', '2D', 'Pass', 'Pass'],
    expectedOpeningCalls: [
      { call: '1D', ruleIds: ['open-convenient-minor'] },
    ],
    expectedResponseCalls: [
      { call: '2D', ruleIds: ['respond-to-minor-w/-raise-to-two'] },
    ],
    expectedOpenerRebidCalls: [
      { call: 'Pass', ruleIds: ['opener-rebid-pass-after-minor-simple-raise'] },
    ],
    rejectedOpenerRebidCalls: ['3D', '3NT', '5D'],
    north: { S: 'K84', H: 'Q72', D: 'AJ92', C: 'K85' },
    south: { S: 'J6', H: '63', D: 'KQ74', C: 'QT943' },
  },
  {
    description: '1C-2C-3C: 16 HCP plus one club length point gives the medium 17-total-point ' +
                 'range, so opener invites game by raising the agreed minor.',
    practiceAuction: ['1C', 'Pass', '2C', 'Pass', '3C'],
    expectedOpeningCalls: [
      { call: '1C', ruleIds: ['open-convenient-minor'] },
    ],
    expectedResponseCalls: [
      { call: '2C', ruleIds: ['respond-to-minor-w/-raise-to-two'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '3C', ruleIds: ['opener-rebid-raise-to-three-after-minor-simple-raise'] },
    ],
    rejectedOpenerRebidCalls: ['Pass', '3NT', '5C'],
    north: { S: 'AQ74', H: 'K72', D: '6', C: 'AQJ85' },
    south: { S: 'J82', H: '84', D: 'K72', C: 'KT974' },
  },
  {
    description: '1D-2D-3NT: a 19-HCP balanced maximum usually chooses notrump game after ' +
                 'responder\'s minimum diamond raise.',
    practiceAuction: ['1D', 'Pass', '2D', 'Pass', '3NT'],
    expectedOpeningCalls: [
      { call: '1D', ruleIds: ['open-convenient-minor'] },
    ],
    expectedResponseCalls: [
      { call: '2D', ruleIds: ['respond-to-minor-w/-raise-to-two'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '3NT', ruleIds: ['opener-rebid-3nt-after-minor-simple-raise'] },
    ],
    rejectedOpenerRebidCalls: ['Pass', '3D', '5D'],
    north: { S: 'AQ3', H: 'K7', D: 'AQ84', C: 'KJ72' },
    south: { S: '865', H: '942', D: 'KJ63', C: 'Q85' },
  },
  {
    description: '1C-2C-3NT: a seven-card club suit and extreme 3-2-1-7 shape keep five clubs ' +
                 'as a modeled judgment alternative behind the usual 3NT game.',
    practiceAuction: ['1C', 'Pass', '2C', 'Pass', '3NT'],
    expectedOpeningCalls: [
      { call: '1C', ruleIds: ['open-convenient-minor'] },
    ],
    expectedResponseCalls: [
      { call: '2C', ruleIds: ['respond-to-minor-w/-raise-to-two'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '3NT', ruleIds: ['opener-rebid-3nt-after-minor-simple-raise'] },
      { call: '5C', ruleIds: ['opener-rebid-game-minor-after-minor-simple-raise'] },
    ],
    expectedOpenerRebidCallOrder: [['3NT', '5C']],
    rejectedOpenerRebidCalls: ['Pass', '3C'],
    north: { S: 'AQ4', H: 'K3', D: '6', C: 'AKJ9864' },
    south: { S: 'J82', H: 'Q74', D: 'K2', C: 'Q7532' },
  },
  {
    description: '1C-3C-Pass: a 12-total-point opener declines the 11-HCP minor limit raise.',
    practiceAuction: ['1C', 'Pass', '3C', 'Pass', 'Pass'],
    expectedOpeningCalls: [
      { call: '1C', ruleIds: ['open-convenient-minor'] },
    ],
    expectedResponseCalls: [
      { call: '3C', ruleIds: ['respond-to-minor-w/-limit-raise'] },
      { call: '2NT', ruleIds: ['respond-to-minor-w/-2nt'] },
    ],
    expectedOpenerRebidCalls: [
      { call: 'Pass', ruleIds: ['opener-rebid-pass-after-minor-limit-raise'] },
    ],
    rejectedOpenerRebidCalls: ['3NT', '5C'],
    north: { S: 'K84', H: 'J72', D: 'A92', C: 'KJ85' },
    south: { S: '962', H: 'AQ8', D: 'K7', C: 'QT974' },
  },
  {
    description: '1D-3D-3NT: a useful 14-HCP opener accepts the diamond limit raise in the usual ' +
                 'notrump game.',
    practiceAuction: ['1D', 'Pass', '3D', 'Pass', '3NT'],
    expectedOpeningCalls: [
      { call: '1D', ruleIds: ['open-convenient-minor'] },
    ],
    expectedResponseCalls: [
      { call: '3D', ruleIds: ['respond-to-minor-w/-limit-raise'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '3NT', ruleIds: ['opener-rebid-3nt-after-minor-limit-raise'] },
    ],
    rejectedOpenerRebidCalls: ['Pass', '5D'],
    north: { S: 'K84', H: 'A72', D: 'AQJ92', C: '85' },
    south: { S: 'Q62', H: 'KJ4', D: 'K8743', C: 'Q9' },
  },
  {
    description: '1D-3D-3NT: a seven-card diamond suit and extreme distribution keep five diamonds ' +
                 'as a natural judgment alternative behind the usual 3NT acceptance.',
    practiceAuction: ['1D', 'Pass', '3D', 'Pass', '3NT'],
    expectedOpeningCalls: [
      { call: '1D', ruleIds: ['open-convenient-minor'] },
    ],
    expectedResponseCalls: [
      { call: '3D', ruleIds: ['respond-to-minor-w/-limit-raise'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '3NT', ruleIds: ['opener-rebid-3nt-after-minor-limit-raise'] },
      { call: '5D', ruleIds: ['opener-rebid-game-minor-after-minor-limit-raise'] },
    ],
    expectedOpenerRebidCallOrder: [['3NT', '5D']],
    rejectedOpenerRebidCalls: ['Pass'],
    north: { S: 'AQ4', H: 'K3', D: 'AKJ9864', C: '6' },
    south: { S: 'K82', H: 'Q74', D: 'QT753', C: 'KJ' },
  },
];

///
//// Opener rebids after a natural invitational 2NT response to a minor opening
///
export const OPENER_REBID_AFTER_MINOR_2NT_TEST_DEALS: RuleTestDeal[] = [
  {
    description: '1C-2NT-Pass: a 12-HCP opener declines responder\'s natural 11-HCP game invitation.',
    practiceAuction: ['1C', 'Pass', '2NT', 'Pass', 'Pass'],
    expectedOpeningCalls: [
      { call: '1C', ruleIds: ['open-convenient-minor'] },
    ],
    expectedResponseCalls: [
      { call: '2NT', ruleIds: ['respond-to-minor-w/-2nt'] },
    ],
    expectedOpenerRebidCalls: [
      { call: 'Pass', ruleIds: ['opener-rebid-pass-after-minor-2nt'] },
    ],
    rejectedOpenerRebidCalls: ['3NT'],
    north: { S: 'K83', H: 'Q72', D: 'A92', C: 'QJ85' },
    south: { S: 'AQ6', H: 'J84', D: 'KJ7', C: 'T964' },
  },
  {
    description: '1D-2NT-3NT: at 13 HCP the invitation is a judgment case, so both Pass and 3NT ' +
                 'remain modeled choices.',
    practiceAuction: ['1D', 'Pass', '2NT', 'Pass', '3NT'],
    expectedOpeningCalls: [
      { call: '1D', ruleIds: ['open-convenient-minor'] },
    ],
    expectedResponseCalls: [
      { call: '2NT', ruleIds: ['respond-to-minor-w/-2nt'] },
    ],
    expectedOpenerRebidCalls: [
      { call: 'Pass', ruleIds: ['opener-rebid-pass-after-minor-2nt'] },
      { call: '3NT', ruleIds: ['opener-rebid-3nt-after-minor-2nt'] },
    ],
    north: { S: 'K84', H: 'A72', D: 'KQ92', C: 'J85' },
    south: { S: 'AQ6', H: 'J84', D: 'J73', C: 'K964' },
  },
  {
    description: '1C-2NT-3NT: a 14-HCP opener accepts responder\'s natural invitation to game.',
    practiceAuction: ['1C', 'Pass', '2NT', 'Pass', '3NT'],
    expectedOpeningCalls: [
      { call: '1C', ruleIds: ['open-convenient-minor'] },
    ],
    expectedResponseCalls: [
      { call: '2NT', ruleIds: ['respond-to-minor-w/-2nt'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '3NT', ruleIds: ['opener-rebid-3nt-after-minor-2nt'] },
    ],
    rejectedOpenerRebidCalls: ['Pass'],
    north: { S: 'K84', H: 'A72', D: 'Q92', C: 'KQ85' },
    south: { S: 'AQ6', H: 'KJ4', D: 'JT73', C: 'T96' },
  },
  {
    description: '1C-2NT-3NT: a 16-HCP 3-2-2-6 opener accepts even though opener is not balanced; ' +
                 'this natural invitation decision is based on strength, not a hard shape test.',
    practiceAuction: ['1C', 'Pass', '2NT', 'Pass', '3NT'],
    expectedOpeningCalls: [
      { call: '1C', ruleIds: ['open-convenient-minor'] },
    ],
    expectedResponseCalls: [
      { call: '2NT', ruleIds: ['respond-to-minor-w/-2nt'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '3NT', ruleIds: ['opener-rebid-3nt-after-minor-2nt'] },
    ],
    rejectedOpenerRebidCalls: ['Pass'],
    north: { S: 'AK3', H: 'Q7', D: 'A9', C: 'QJ9864' },
    south: { S: 'QJ5', H: 'A84', D: 'KJ73', C: 'T52' },
  },
];


///
//// Opener rebids after responder places game in 3NT after a minor opening
///
export const OPENER_REBID_AFTER_MINOR_3NT_TEST_DEALS: RuleTestDeal[] = [
  {
    description: '1C-3NT-Pass: 14-HCP balanced responder places the contract in notrump game; ' +
                 'an ordinary 13-HCP opener respects the signoff.',
    practiceAuction: ['1C', 'Pass', '3NT', 'Pass', 'Pass'],
    expectedOpeningCalls: [
      { call: '1C', ruleIds: ['open-convenient-minor'] },
    ],
    expectedResponseCalls: [
      { call: '3NT', ruleIds: ['respond-to-minor-w/-3nt'] },
    ],
    expectedOpenerRebidCalls: [
      { call: 'Pass', ruleIds: ['opener-rebid-pass-after-minor-3nt'] },
    ],
    rejectedOpenerRebidCalls: ['4NT'],
    north: { S: 'K84', H: 'Q72', D: 'A92', C: 'KJ85' },
    south: { S: 'AQ6', H: 'KJ4', D: 'KJ7', C: 'T964' },
  },
  {
    description: '1D-3NT: an 18-HCP 5-4-2-2 opener can either take the sure game or invite slam ' +
                 'quantitatively with 4NT; the slam try is presented ahead of Pass.',
    practiceAuction: ['1D', 'Pass', '3NT', 'Pass', '4NT'],
    expectedOpeningCalls: [
      { call: '1D', ruleIds: ['open-convenient-minor'] },
    ],
    expectedResponseCalls: [
      { call: '3NT', ruleIds: ['respond-to-minor-w/-3nt'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '4NT', ruleIds: ['opener-rebid-4nt-quantitative-after-suit-3nt'] },
      { call: 'Pass', ruleIds: ['opener-rebid-pass-after-minor-3nt'] },
    ],
    expectedOpenerRebidCallOrder: [['4NT', 'Pass']],
    north: { S: 'AQ', H: 'KJ', D: 'AQJ84', C: 'J762' },
    south: { S: 'K73', H: 'AQ4', D: 'K62', C: 'Q853' },
  },
];


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
//// Opener rebids after an artificial Jacoby 2NT game-forcing raise
///
export const OPENER_REBID_AFTER_MAJOR_JACOBY_2NT_TEST_DEALS: RuleTestDeal[] = [
  {
    description: '1S-2NT-3D: a 14-HCP opener shows the diamond singleton before generic strength.',
    practiceAuction: ['1S', 'Pass', '2NT', 'Pass', '3D'],
    requiredSystem: { majorGameForceWithSupport: 'jacoby2NT' },
    expectedOpeningCalls: [
      { call: '1S', ruleIds: ['open-five-card-major'] },
    ],
    expectedResponseCalls: [
      { call: '2NT', ruleIds: ['respond-to-major-w/-support-jacoby-2nt-agreement'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '3D', ruleIds: ['opener-rebid-shortness-after-major-jacoby-2nt'] },
    ],
    rejectedOpenerRebidCalls: ['3NT'],
    north: { S: 'AQJ85', H: 'K74', D: '5', C: 'A982' },
    south: { S: 'K964', H: 'AQ3', D: 'K83', C: 'JT7' },
  },
  {
    description: '1H-2NT-4H: 12 HCP with no singleton or void is the minimum fast-arrival rebid.',
    practiceAuction: ['1H', 'Pass', '2NT', 'Pass', '4H'],
    requiredSystem: { majorGameForceWithSupport: 'jacoby2NT' },
    expectedOpeningCalls: [
      { call: '1H', ruleIds: ['open-five-card-major'] },
    ],
    expectedResponseCalls: [
      { call: '2NT', ruleIds: ['respond-to-major-w/-support-jacoby-2nt-agreement'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '4H', ruleIds: ['opener-rebid-game-in-opening-major-after-major-jacoby-2nt'] },
    ],
    rejectedOpenerRebidCalls: ['3NT', '3H'],
    north: { S: 'K74', H: 'AQJ85', D: 'Q72', C: '85' },
    south: { S: 'A83', H: 'K976', D: 'K64', C: 'QJ2' },
  },
  {
    description: '1S-2NT-3NT: 14 HCP with no singleton or void shows the medium Jacoby range.',
    practiceAuction: ['1S', 'Pass', '2NT', 'Pass', '3NT'],
    requiredSystem: { majorGameForceWithSupport: 'jacoby2NT' },
    expectedOpeningCalls: [
      { call: '1S', ruleIds: ['open-five-card-major'] },
    ],
    expectedResponseCalls: [
      { call: '2NT', ruleIds: ['respond-to-major-w/-support-jacoby-2nt-agreement'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '3NT', ruleIds: ['opener-rebid-3nt-after-major-jacoby-2nt'] },
    ],
    rejectedOpenerRebidCalls: ['4S', '3S'],
    north: { S: 'AQJ85', H: 'K74', D: 'A72', C: '85' },
    south: { S: 'K964', H: 'AQ3', D: 'K83', C: 'J72' },
  },
  {
    description: '1H-2NT-3H: 17 HCP with no singleton or void shows the strong slam-interest range.',
    practiceAuction: ['1H', 'Pass', '2NT', 'Pass', '3H'],
    requiredSystem: { majorGameForceWithSupport: 'jacoby2NT' },
    expectedOpeningCalls: [
      { call: '1H', ruleIds: ['open-five-card-major'] },
    ],
    expectedResponseCalls: [
      { call: '2NT', ruleIds: ['respond-to-major-w/-support-jacoby-2nt-agreement'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '3H', ruleIds: ['opener-rebid-strong-3-major-after-major-jacoby-2nt'] },
    ],
    rejectedOpenerRebidCalls: ['4H', '3NT'],
    north: { S: 'AQ4', H: 'AKJ85', D: 'K72', C: '85' },
    south: { S: 'K83', H: 'Q976', D: 'A64', C: 'KJ2' },
  },
  {
    description: '1S-2NT: 14 HCP with a club singleton and good five-card diamonds; 3C shortness ' +
                 'ranks ahead of the 4D side-suit description, while both remain visible.',
    practiceAuction: ['1S', 'Pass', '2NT', 'Pass', '3C'],
    requiredSystem: { majorGameForceWithSupport: 'jacoby2NT' },
    expectedOpeningCalls: [
      { call: '1S', ruleIds: ['open-five-card-major'] },
    ],
    expectedResponseCalls: [
      { call: '2NT', ruleIds: ['respond-to-major-w/-support-jacoby-2nt-agreement'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '3C', ruleIds: ['opener-rebid-shortness-after-major-jacoby-2nt'] },
      { call: '4D', ruleIds: ['opener-rebid-side-suit-after-major-jacoby-2nt'] },
    ],
    expectedOpenerRebidCallOrder: [['3C', '4D']],
    rejectedOpenerRebidCalls: ['3NT'],
    north: { S: 'AKJ85', H: '82', D: 'KQJ74', C: '5' },
    south: { S: 'Q976', H: 'AK3', D: 'A62', C: 'T83' },
  },
];

///
//// Opener rebids after responder's major-suit splinter
///
export const OPENER_REBID_AFTER_MAJOR_SPLINTER_TEST_DEALS: RuleTestDeal[] = [
  {
    description: '1H-3S-4H: 18 raw HCP fall to 12 working HCP after discounting KQJ opposite ' +
                 'responder\'s spade shortness, so opener stops in game rather than control-bid 4D.',
    practiceAuction: ['1H', 'Pass', '3S', 'Pass', '4H'],
    requiredSystem: { splinters: true },
    expectedOpeningCalls: [
      { call: '1H', ruleIds: ['open-five-card-major'] },
    ],
    expectedResponseCalls: [
      { call: '3S', ruleIds: ['respond-to-major-w/-support-splinter'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '4H', ruleIds: ['opener-rebid-game-in-opening-major-after-major-splinter'] },
    ],
    rejectedOpenerRebidCalls: ['4D'],
    north: { S: 'KQJ', H: 'AKJ85', D: 'A72', C: '85' },
    south: { S: '4', H: 'Q976', D: 'K83', C: 'AQJ72' },
  },
  {
    description: '1S-4C-4D: 15 working HCP and controls in both diamonds and hearts make 4D the ' +
                 'cheapest slam-interest control; 4S remains visible as the judgment alternative.',
    practiceAuction: ['1S', 'Pass', '4C', 'Pass', '4D'],
    requiredSystem: { splinters: true },
    expectedOpeningCalls: [
      { call: '1S', ruleIds: ['open-five-card-major'] },
    ],
    expectedResponseCalls: [
      { call: '4C', ruleIds: ['respond-to-major-w/-support-splinter'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '4D', ruleIds: ['opener-rebid-control-after-major-splinter'] },
      { call: '4S', ruleIds: ['opener-rebid-game-in-opening-major-after-major-splinter'] },
    ],
    expectedOpenerRebidCallOrder: [['4D', '4S']],
    rejectedOpenerRebidCalls: ['4H'],
    north: { S: 'AKJ85', H: 'K65', D: 'A72', C: '85' },
    south: { S: 'Q976', H: 'AQJ72', D: 'K83', C: '4' },
  },
  {
    description: '1S-4D-4H: a heart control can be the slam-interest bid after a splinter; ' +
                 '4S still survives below it as the practical game choice.',
    practiceAuction: ['1S', 'Pass', '4D', 'Pass', '4H'],
    requiredSystem: { splinters: true },
    expectedOpeningCalls: [
      { call: '1S', ruleIds: ['open-five-card-major'] },
    ],
    expectedResponseCalls: [
      { call: '4D', ruleIds: ['respond-to-major-w/-support-splinter'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '4H', ruleIds: ['opener-rebid-control-after-major-splinter'] },
      { call: '4S', ruleIds: ['opener-rebid-game-in-opening-major-after-major-splinter'] },
    ],
    expectedOpenerRebidCallOrder: [['4H', '4S']],
    north: { S: 'AKJ85', H: 'A74', D: '85', C: 'K96' },
    south: { S: 'Q976', H: 'K83', D: '4', C: 'AQJ72' },
  },
];

///
//// Opener rebids after responder's weak or strong jump shift
///
export const OPENER_REBID_AFTER_JUMP_SHIFT_TEST_DEALS: RuleTestDeal[] = [
  {
    description: '1C-2H-Pass: a 6-HCP six-heart weak jump shift is preemptive and passable; ' +
                 'opener normally stops rather than inventing a game try.',
    practiceAuction: ['1C', 'Pass', '2H', 'Pass', 'Pass'],
    requiredSystem: { jumpShift: 'weak' },
    expectedOpeningCalls: [
      { call: '1C', ruleIds: ['open-convenient-minor'] },
    ],
    expectedResponseCalls: [
      { call: '2H', ruleIds: ['respond-to-minor-w/-weak-jump-shift-modern'] },
      { call: '1H', ruleIds: ['respond-to-minor-w/-new-suit-one-level-priority'] },
    ],
    expectedOpenerRebidCalls: [
      { call: 'Pass', ruleIds: ['opener-rebid-pass-after-weak-jump-shift'] },
    ],
    north: { S: 'K874', H: 'Q72', D: 'A', C: 'KQJ85' },
    south: { S: 'Q63', H: 'KJT986', D: 'T4', C: '92' },
  },
  {
    description: '1C-2H-3H: after a classic strong jump shift, opener has three hearts and four ' +
                 'spades; supporting responder is the first descriptive priority, while 2S and ' +
                 '2NT remain available.',
    practiceAuction: ['1C', 'Pass', '2H', 'Pass', '3H'],
    requiredSystem: { jumpShift: 'strong' },
    expectedOpeningCalls: [
      { call: '1C', ruleIds: ['open-convenient-minor'] },
    ],
    expectedResponseCalls: [
      { call: '2H', ruleIds: ['respond-to-minor-w/-strong-jump-shift-classic'] },
      { call: '1H', ruleIds: ['respond-to-minor-w/-new-suit-one-level-priority'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '3H', ruleIds: ['opener-rebid-raise-after-strong-jump-shift'] },
      { call: '2S', ruleIds: ['opener-rebid-new-suit-after-strong-jump-shift'] },
      { call: '2NT', ruleIds: ['opener-rebid-notrump-after-strong-jump-shift'] },
    ],
    expectedOpenerRebidCallOrder: [['3H', '2S'], ['3H', '2NT']],
    north: { S: 'KQJ4', H: 'A73', D: 'A85', C: 'KQ4' },
    south: { S: 'A62', H: 'KQJ85', D: 'KQ7', C: 'A9' },
  },
  {
    description: '1H-2S-3H: responder has made a strong jump shift, and opener has six hearts ' +
                 'without spade support, another four-card suit, or notrump shape; repeat hearts ' +
                 'at the cheapest legal level.',
    practiceAuction: ['1H', 'Pass', '2S', 'Pass', '3H'],
    requiredSystem: { jumpShift: 'strong' },
    expectedOpeningCalls: [
      { call: '1H', ruleIds: ['open-five-card-major'] },
    ],
    expectedResponseCalls: [
      { call: '2S', ruleIds: ['respond-to-major-w/-strong-jump-shift-classic'] },
      { call: '1S', ruleIds: ['respond-to-major-w/o-support-new-suit-one-level'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '3H', ruleIds: ['opener-rebid-repeat-opening-suit-after-strong-jump-shift'] },
    ],
    north: { S: '5', H: 'AKQ865', D: 'A84', C: 'K72' },
    south: { S: 'AKQJ9', H: '72', D: 'KQ6', C: 'QJ8' },
  },
  {
    description: '1D-2H-2S: after a strong heart jump shift, opener has a natural four-card ' +
                 'spade suit and no heart fit, six-card diamonds, or notrump shape; show spades ' +
                 'economically.',
    practiceAuction: ['1D', 'Pass', '2H', 'Pass', '2S'],
    requiredSystem: { jumpShift: 'strong' },
    expectedOpeningCalls: [
      { call: '1D', ruleIds: ['open-convenient-minor'] },
    ],
    expectedResponseCalls: [
      { call: '2H', ruleIds: ['respond-to-minor-w/-strong-jump-shift-classic'] },
      { call: '1H', ruleIds: ['respond-to-minor-w/-new-suit-one-level-priority'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '2S', ruleIds: ['opener-rebid-new-suit-after-strong-jump-shift'] },
    ],
    north: { S: 'KQJ4', H: '7', D: 'AKJ85', C: 'Q72' },
    south: { S: 'A63', H: 'AKQJ8', D: '42', C: 'KJ9' },
  },
  {
    description: '1H-2S-2NT: opener is 5-3-3-2 with only two spades, no six-card heart suit, ' +
                 'and no four-card second suit; describe the balanced hand economically.',
    practiceAuction: ['1H', 'Pass', '2S', 'Pass', '2NT'],
    requiredSystem: { jumpShift: 'strong' },
    expectedOpeningCalls: [
      { call: '1H', ruleIds: ['open-five-card-major'] },
    ],
    expectedResponseCalls: [
      { call: '2S', ruleIds: ['respond-to-major-w/-strong-jump-shift-classic'] },
      { call: '1S', ruleIds: ['respond-to-major-w/o-support-new-suit-one-level'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '2NT', ruleIds: ['opener-rebid-notrump-after-strong-jump-shift'] },
    ],
    north: { S: 'K7', H: 'AQJ85', D: 'K84', C: 'J92' },
    south: { S: 'AQJT9', H: 'K6', D: 'AQ7', C: 'K83' },
  },
  {
    description: '1S with a strong 5-5 heart-diamond two-suiter: classic strong jump shifts are ' +
                 'reserved for a one-suited hand, so respond naturally in the higher-ranking ' +
                 'heart suit and plan to show diamonds later.',
    practiceAuction: ['1S', 'Pass', '2H'],
    requiredSystem: { jumpShift: 'strong', twoLevelNewSuitResponse: 'standard' },
    expectedOpeningCalls: [
      { call: '1S', ruleIds: ['open-five-card-major'] },
    ],
    expectedResponseCalls: [
      { call: '2H', ruleIds: ['respond-to-major-w/o-support-new-suit-two-level-standard'] },
      { call: '2D', ruleIds: ['respond-to-major-w/o-support-new-suit-two-level-standard'] },
    ],
    rejectedResponseCalls: ['3H', '3D'],
    expectedResponseCallOrder: [['2H', '2D']],
    north: { S: 'AQJ72', H: '53', D: 'J92', C: 'AQ3' },
    south: { S: 'K6', H: 'KQJ98', D: 'AKQ76', C: '4' },
  },
  {
    description: '1C with 18 HCP but only the heart ace in a five-card heart suit: the classic ' +
                 'strong jump shift needs at least 5 HCP in its suit, so responder uses natural ' +
                 '1H and 2H is excluded.',
    practiceAuction: ['1C', 'Pass', '1H'],
    requiredSystem: { jumpShift: 'strong' },
    expectedOpeningCalls: [
      { call: '1C', ruleIds: ['open-convenient-minor'] },
    ],
    expectedResponseCalls: [
      { call: '1H', ruleIds: ['respond-to-minor-w/-new-suit-one-level-priority'] },
    ],
    rejectedResponseCalls: ['2H'],
    north: { S: 'A842', H: 'KQ2', D: 'A', C: 'QJ853' },
    south: { S: 'KQJ', H: 'A9876', D: 'KQ7', C: 'K9' },
  },
  {
    description: '1H with 8 support points and six spades: three-card heart support takes ' +
                 'priority over a weak jump shift, so responder raises hearts and 2S is excluded.',
    practiceAuction: ['1H', 'Pass', '2H'],
    requiredSystem: { jumpShift: 'weak' },
    expectedOpeningCalls: [
      { call: '1H', ruleIds: ['open-five-card-major'] },
    ],
    expectedResponseCalls: [
      { call: '2H', ruleIds: ['respond-to-major-w/-support-simple-raise'] },
    ],
    rejectedResponseCalls: ['2S'],
    north: { S: 'K8', H: 'AQJ72', D: 'AJ92', C: 'T8' },
    south: { S: 'QJT976', H: 'K65', D: '43', C: '72' },
  },
];

///
//// Opener rebids after responder places game after a major opening
///
export const OPENER_REBID_AFTER_MAJOR_GAME_RESPONSE_TEST_DEALS: RuleTestDeal[] = [
  {
    description: '1S-3NT: responder\'s flat 14-HCP treatment promises exactly three spades; the ' +
                 'known eight-card fit makes 4S the preferred game while Pass remains visible.',
    practiceAuction: ['1S', 'Pass', '3NT', 'Pass', '4S'],
    expectedOpeningCalls: [
      { call: '1S', ruleIds: ['open-five-card-major'] },
    ],
    expectedResponseCalls: [
      { call: '3NT', ruleIds: ['respond-to-major-w/-3nt-flat-13-15'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '4S', ruleIds: ['opener-rebid-game-in-opening-major-after-major-3nt'] },
      { call: 'Pass', ruleIds: ['opener-rebid-pass-after-major-3nt'] },
    ],
    expectedOpenerRebidCallOrder: [['4S', 'Pass']],
    rejectedOpenerRebidCalls: ['4NT'],
    north: { S: 'AQJ72', H: 'K8', D: 'A982', C: 'T8' },
    south: { S: 'K65', H: 'AT3', D: 'K763', C: 'A74' },
  },
  {
    description: '1H-3NT: an 18-HCP 5-4-2-2 opener sees the known eight-card heart fit and also ' +
                 'has quantitative slam interest; 4H ranks ahead of 4NT, and Pass remains visible.',
    practiceAuction: ['1H', 'Pass', '3NT', 'Pass', '4H'],
    expectedOpeningCalls: [
      { call: '1H', ruleIds: ['open-five-card-major'] },
    ],
    expectedResponseCalls: [
      { call: '3NT', ruleIds: ['respond-to-major-w/-3nt-flat-13-15'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '4H', ruleIds: ['opener-rebid-game-in-opening-major-after-major-3nt'] },
      { call: '4NT', ruleIds: ['opener-rebid-4nt-quantitative-after-suit-3nt'] },
      { call: 'Pass', ruleIds: ['opener-rebid-pass-after-major-3nt'] },
    ],
    expectedOpenerRebidCallOrder: [['4H', '4NT'], ['4NT', 'Pass']],
    north: { S: 'AQ', H: 'AKJ84', D: 'KJ72', C: '62' },
    south: { S: 'K73', H: 'Q65', D: 'A83', C: 'AQ94' },
  },
  {
    description: '1H-4H-Pass: 7 HCP plus a doubleton gives responder eight support points and ' +
                 'five hearts; the direct game raise is weak, preemptive, and passable.',
    practiceAuction: ['1H', 'Pass', '4H', 'Pass', 'Pass'],
    expectedOpeningCalls: [
      { call: '1H', ruleIds: ['open-five-card-major'] },
    ],
    expectedResponseCalls: [
      { call: '2H', ruleIds: ['respond-to-major-w/-support-simple-raise'] },
      { call: '4H', ruleIds: ['respond-to-major-w/-support-preemptive-game-raise'] },
    ],
    expectedOpenerRebidCalls: [
      { call: 'Pass', ruleIds: ['opener-rebid-pass-after-major-preemptive-game-raise'] },
    ],
    north: { S: 'K8', H: 'AQJ72', D: 'AJ92', C: 'T8' },
    south: { S: 'T5', H: 'K9543', D: '863', C: 'A93' },
  },
];

///
//// Opener rebids after responder's four-card limit raise of a major
///
export const OPENER_REBID_AFTER_MAJOR_LIMIT_RAISE_TEST_DEALS: RuleTestDeal[] = [
  {
    description: '1S-3S-Pass: 11 HCP plus the five-card-suit length point open 1S, but only 12 ' +
                 'support points after the fit is known; opener declines the limit raise.',
    practiceAuction: ['1S', 'Pass', '3S', 'Pass', 'Pass'],
    expectedOpeningCalls: [
      { call: '1S', ruleIds: ['open-five-card-major'] },
    ],
    expectedResponseCalls: [
      { call: '3S', ruleIds: ['respond-to-major-w/-support-limit-raise-four-card'] },
    ],
    expectedOpenerRebidCalls: [
      { call: 'Pass', ruleIds: ['opener-rebid-pass-after-major-limit-raise'] },
    ],
    rejectedOpenerRebidCalls: ['4S'],
    north: { S: 'AJ985', H: 'K74', D: 'Q72', C: 'J5' },
    south: { S: 'KQ76', H: 'AJ3', D: 'J64', C: 'T42' },
  },
  {
    description: '1H-3H: 12 HCP and one doubleton give 13 support points; both Pass and 4H remain ' +
                 'available as the limit-raise judgment boundary.',
    practiceAuction: ['1H', 'Pass', '3H', 'Pass', '4H'],
    expectedOpeningCalls: [
      { call: '1H', ruleIds: ['open-five-card-major'] },
    ],
    expectedResponseCalls: [
      { call: '3H', ruleIds: ['respond-to-major-w/-support-limit-raise-four-card'] },
    ],
    expectedOpenerRebidCalls: [
      { call: 'Pass', ruleIds: ['opener-rebid-pass-after-major-limit-raise'] },
      { call: '4H', ruleIds: ['opener-rebid-game-raise-after-major-limit-raise'] },
    ],
    north: { S: 'K74', H: 'AQJ85', D: 'Q72', C: '85' },
    south: { S: 'A83', H: 'K976', D: 'K64', C: 'J42' },
  },
  {
    description: '1S-3S-4S: 14 HCP / 15 support points clearly accept responder\'s limit raise.',
    practiceAuction: ['1S', 'Pass', '3S', 'Pass', '4S'],
    expectedOpeningCalls: [
      { call: '1S', ruleIds: ['open-five-card-major'] },
    ],
    expectedResponseCalls: [
      { call: '3S', ruleIds: ['respond-to-major-w/-support-limit-raise-four-card'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '4S', ruleIds: ['opener-rebid-game-raise-after-major-limit-raise'] },
    ],
    rejectedOpenerRebidCalls: ['Pass'],
    north: { S: 'AQJ85', H: 'K74', D: 'A72', C: '85' },
    south: { S: 'K976', H: 'A83', D: 'K64', C: 'J42' },
  },
  {
    description: '1H-3H-4H: only 11 HCP, but a singleton club raises opener to 14 support points; ' +
                 'the known fit makes shortage valuation, not HCP alone, the relevant measure.',
    practiceAuction: ['1H', 'Pass', '3H', 'Pass', '4H'],
    expectedOpeningCalls: [
      { call: '1H', ruleIds: ['open-five-card-major'] },
    ],
    expectedResponseCalls: [
      { call: '3H', ruleIds: ['respond-to-major-w/-support-limit-raise-four-card'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '4H', ruleIds: ['opener-rebid-game-raise-after-major-limit-raise'] },
    ],
    rejectedOpenerRebidCalls: ['Pass'],
    north: { S: 'KQ74', H: 'AJ985', D: 'J72', C: '5' },
    south: { S: 'A83', H: 'KQ76', D: 'Q64', C: 'T42' },
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
/// response, both Standard and 2/1 1D-2C, balanced 1NT and invitational 2NT responses, and
/// both ordinary minor raises and the direct 3NT game response.  Their expectedResponseCalls
/// still count toward whole-corpus coverage.  The rare 4NT
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
/// simple raises, natural new-suit responses, both forcing and non-forcing 1NT responses,
/// and the weak preemptive game raise. Their expectedResponseCalls count toward corpus coverage;
/// rare Blackwood is deferred.
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

///
//// Responses to 1NT opening
///

/// Supplementary 1NT response cases also assert the ordinary 15-17 opening rule.
/// Natural minor-invitation hands require 6+ cards and at least two of A/K/Q.
export const RESPONSE_AFTER_1NT_OPENING_TEST_DEALS: RuleTestDeal[] = [
  {
    description: '1NT, 15-17 opener: 6-HCP balanced responder without a four-card major passes rather than inviting.',
    practiceAuction: ['1NT', 'Pass', 'Pass'],
    requiredSystem: { oneNtOpening: '15-17' },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-15-17'] },
    ],
    expectedResponseCalls: [
      { call: 'Pass', ruleIds: ['respond-to-1nt-w/-pass-0-7-balanced'] },
    ],
    rejectedResponseCalls: ['2NT'],
    north: { S: 'AQ93', H: 'AK4', D: '842', C: 'A72' },
    south: { S: 'T62', H: 'Q87', D: '96', C: 'KJT83' },
  },
  {
    description: '1NT: 6 HCP and five cards in each major; both 2D and 2H Jacoby transfers remain legitimate alternatives.',
    practiceAuction: ['1NT', 'Pass', '2D'],
    requiredSystem: { oneNtOpening: '15-17', jacobyTransfers: true },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-15-17'] },
    ],
    expectedResponseCalls: [
      { call: '2D', ruleIds: ['respond-to-1nt-w/-transfer-to-hearts'] },
      { call: '2H', ruleIds: ['respond-to-1nt-w/-transfer-to-spades'] },
    ],
    north: { S: 'AKT2', H: 'KQ9', D: 'QJ5', C: '953' },
    south: { S: '98764', H: 'AJT84', D: '32', C: 'J' },
  },
  {
    description: '1NT: 9 HCP and five cards in each major; transfer to hearts with 2D to preserve the invitational route.',
    practiceAuction: ['1NT', 'Pass', '2D'],
    requiredSystem: { oneNtOpening: '15-17', jacobyTransfers: true },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-15-17'] },
    ],
    expectedResponseCalls: [
      { call: '2D', ruleIds: ['respond-to-1nt-w/-transfer-to-hearts'] },
    ],
    rejectedResponseCalls: ['2H'],
    north: { S: 'JT8', H: 'A98', D: 'AKQJ3', C: 'Q2' },
    south: { S: 'A9632', H: 'QT732', D: '82', C: 'K' },
  },
  {
    description: '1NT: 11 HCP and five cards in each major; transfer to spades with 2H to preserve the game-forcing continuation.',
    practiceAuction: ['1NT', 'Pass', '2H'],
    requiredSystem: { oneNtOpening: '15-17', jacobyTransfers: true },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-15-17'] },
    ],
    expectedResponseCalls: [
      { call: '2H', ruleIds: ['respond-to-1nt-w/-transfer-to-spades'] },
    ],
    rejectedResponseCalls: ['2D'],
    north: { S: 'AJ7', H: 'J9', D: 'K9654', C: 'AQT' },
    south: { S: 'KT653', H: 'AT842', D: 'J2', C: 'K' },
  },
  {
    description: '1NT: 8 HCP and six clubs headed by KQ; natural 3C invites, with good suit quality illustrated by the hand but not checked by the current rule.',
    practiceAuction: ['1NT', 'Pass', '3C'],
    requiredSystem: { oneNtOpening: '15-17' },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-15-17'] },
    ],
    expectedResponseCalls: [
      { call: '3C', ruleIds: ['respond-to-1nt-w/-3c-3d-natural-invitational'] },
    ],
    north: { S: 'K653', H: 'J53', D: 'AK4', C: 'A87' },
    south: { S: '94', H: 'Q2', D: 'J62', C: 'KQ6432' },
  },
  {
    description: '1NT: 9 HCP and six diamonds headed by AK; natural 3D invites, with suit quality illustrated rather than evaluated.',
    practiceAuction: ['1NT', 'Pass', '3D'],
    requiredSystem: { oneNtOpening: '15-17' },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-15-17'] },
    ],
    expectedResponseCalls: [
      { call: '3D', ruleIds: ['respond-to-1nt-w/-3c-3d-natural-invitational'] },
    ],
    north: { S: 'K63', H: 'AJ7', D: 'QJ6', C: 'KJT3' },
    south: { S: '2', H: '98', D: 'AKT874', C: 'Q987' },
  },
  {
    description: '1NT: without Stayman or transfers, 2 HCP and five spades give a natural ' +
                 'weak 2S signoff instead of passing a balanced weak hand.',
    practiceAuction: ['1NT', 'Pass', '2S'],
    requiredSystem: { oneNtOpening: '15-17', stayman: false, jacobyTransfers: false,
                      texasTransfers: false },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-15-17'] },
    ],
    expectedResponseCalls: [
      { call: '2S', ruleIds: ['respond-to-1nt-w/-2h-2s-natural-signoff'] },
    ],
    rejectedResponseCalls: ['Pass'],
    north: { S: 'AK8', H: 'AT2', D: 'K652', C: 'JT4' },
    south: { S: 'J7432', H: 'J94', D: 'T83', C: '75' },
  },
  {
    description: '1NT: without Stayman or transfers, 12 HCP and exactly five spades ' +
                 'qualify for natural, forcing 3S; the balanced 3NT fallback is eliminated.',
    practiceAuction: ['1NT', 'Pass', '3S'],
    requiredSystem: { oneNtOpening: '15-17', stayman: false, jacobyTransfers: false,
                      texasTransfers: false },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-15-17'] },
    ],
    expectedResponseCalls: [
      { call: '3S', ruleIds: ['respond-to-1nt-w/-3h-3s-natural-forcing'] },
    ],
    rejectedResponseCalls: ['3NT'],
    north: { S: 'JT53', H: 'AKJ3', D: 'AT8', C: 'Q9' },
    south: { S: 'AK842', H: '76', D: 'Q54', C: 'K74' },
  },
  {
    description: '1NT: 12 HCP and six spades, with Texas off but Jacoby on: natural 4S ' +
                 'is the direct game route and suppresses the otherwise available 2H transfer.',
    practiceAuction: ['1NT', 'Pass', '4S'],
    requiredSystem: { oneNtOpening: '15-17', stayman: true, jacobyTransfers: true,
                      texasTransfers: false },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-15-17'] },
    ],
    expectedResponseCalls: [
      { call: '4S', ruleIds: ['respond-to-1nt-w/-4h-4s-natural-game'] },
    ],
    rejectedResponseCalls: ['2H', '4H'],
    north: { S: 'K5', H: 'AKJ8', D: 'A87', C: '9876' },
    south: { S: 'AJT942', H: 'Q6', D: 'QJ54', C: 'Q' },
  },
  {
    description: '1NT: 16 HCP and six hearts without another four-card major: direct, ' +
                 'forcing 3H shows slam interest instead of an ordinary Jacoby 2D transfer.',
    practiceAuction: ['1NT', 'Pass', '3H'],
    requiredSystem: { oneNtOpening: '15-17', jacobyTransfers: true },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-15-17'] },
    ],
    expectedResponseCalls: [
      { call: '3H', ruleIds: ['respond-to-1nt-w/-3h-3s-slam-interest'] },
    ],
    rejectedResponseCalls: ['2D'],
    north: { S: 'QJT8', H: 'J4', D: 'AK87', C: 'AJ8' },
    south: { S: 'A67', H: 'KQ9753', D: 'QT', C: 'KQ' },
  },
  {
    description: '1NT, 16-18: balanced 6 HCP without a four-card major passes; 7 HCP starts the invitation.',
    practiceAuction: ['1NT', 'Pass', 'Pass'],
    requiredSystem: { oneNtOpening: "16-18" },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-16-18'] },
    ],
    expectedResponseCalls: [
      { call: 'Pass', ruleIds: ['respond-to-1nt-w/-pass-0-7-balanced'] },
    ],
    rejectedResponseCalls: ['2NT'],
    north: { S: 'AK5', H: 'KQ9', D: '932', C: 'A754' },
    south: { S: 'J92', H: '832', D: 'K876', C: 'Q83' },
  },
  {
    description: 'The same balanced 7-HCP hand over 15-17 passes rather than inviting with 2NT.',
    practiceAuction: ['1NT', 'Pass', 'Pass'],
    requiredSystem: { oneNtOpening: "15-17" },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-15-17'] },
    ],
    expectedResponseCalls: [
      { call: 'Pass', ruleIds: ['respond-to-1nt-w/-pass-0-7-balanced'] },
    ],
    rejectedResponseCalls: ['2NT'],
    north: { S: 'A52', H: 'K8532', D: 'KQ8', C: 'AJ' },
    south: { S: 'QT9', H: 'AJT', D: 'T763', C: '852' },
  },
  {
    description: '1NT, 16-18: balanced 9 HCP bids 3NT directly; the same hand invites over 15-17.',
    practiceAuction: ['1NT', 'Pass', '3NT'],
    requiredSystem: { oneNtOpening: "16-18" },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-16-18'] },
    ],
    expectedResponseCalls: [
      { call: '3NT', ruleIds: ['respond-to-1nt-w/-3nt-10-15-balanced'] },
    ],
    rejectedResponseCalls: ['2NT'],
    north: { S: 'AKT', H: 'KJ63', D: '93', C: 'AJ93' },
    south: { S: 'Q64', H: 'A84', D: 'T876', C: 'K72' },
  },
  {
    description: '1NT, 16-18: 7 HCP and four hearts qualify for Stayman instead of a weak Pass.',
    practiceAuction: ['1NT', 'Pass', '2C'],
    requiredSystem: { oneNtOpening: "16-18", stayman: true },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-16-18'] },
    ],
    expectedResponseCalls: [
      { call: '2C', ruleIds: ['respond-to-1nt-w/-stayman'] },
    ],
    rejectedResponseCalls: ['Pass'],
    north: { S: 'AQ532', H: '876', D: 'A6', C: 'AKT' },
    south: { S: 'J74', H: 'AJ43', D: 'T53', C: 'J43' },
  },
  {
    description: 'The same balanced 7-HCP, four-heart hand over 15-17 is below the normal Stayman threshold.',
    practiceAuction: ['1NT', 'Pass', 'Pass'],
    requiredSystem: { oneNtOpening: "15-17", stayman: true },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-15-17'] },
    ],
    expectedResponseCalls: [
      { call: 'Pass', ruleIds: ['respond-to-1nt-w/-pass-0-7-balanced'] },
    ],
    rejectedResponseCalls: ['2C'],
    north: { S: 'AQ532', H: '876', D: 'A6', C: 'AKT' },
    south: { S: 'J74', H: 'AJ43', D: 'T53', C: 'J43' },
  },
  {
    description: '1NT, 16-18: 8 HCP with both majors five cards; transfer to hearts first for the invitational route.',
    practiceAuction: ['1NT', 'Pass', '2D'],
    requiredSystem: { oneNtOpening: "16-18", jacobyTransfers: true },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-16-18'] },
    ],
    expectedResponseCalls: [
      { call: '2D', ruleIds: ['respond-to-1nt-w/-transfer-to-hearts'] },
    ],
    rejectedResponseCalls: ['2H'],
    north: { S: 'Q84', H: 'A6', D: 'AQ9', C: 'A7643' },
    south: { S: 'AJT62', H: 'KT975', D: '74', C: '2' },
  },
  {
    description: '1NT, 16-18: 9 HCP with two five-card majors; transfer to spades first for the game-force route.',
    practiceAuction: ['1NT', 'Pass', '2H'],
    requiredSystem: { oneNtOpening: "16-18", jacobyTransfers: true },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-16-18'] },
    ],
    expectedResponseCalls: [
      { call: '2H', ruleIds: ['respond-to-1nt-w/-transfer-to-spades'] },
    ],
    rejectedResponseCalls: ['2D'],
    north: { S: 'Q92', H: '864', D: 'AK8', C: 'AKJ4' },
    south: { S: 'AT864', H: 'AJT73', D: '54', C: '5' },
  },
  {
    description: '1NT, 16-18: 9 HCP and six hearts give Texas 4D; the same hand uses Jacoby over 15-17.',
    practiceAuction: ['1NT', 'Pass', '4D'],
    requiredSystem: { oneNtOpening: "16-18", stayman: true, jacobyTransfers: true, texasTransfers: true },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-16-18'] },
    ],
    expectedResponseCalls: [
      { call: '4D', ruleIds: ['respond-to-1nt-w/-texas-transfer-to-hearts'] },
    ],
    rejectedResponseCalls: ['2D'],
    north: { S: '84', H: 'AQ5', D: 'AQ753', C: 'KQ2' },
    south: { S: 'T62', H: 'KT7643', D: 'J2', C: 'AJ' },
  },
  {
    description: 'The same 9-HCP six-heart hand over 16-18 bids natural 4H with Texas off; Jacoby stays suppressed.',
    practiceAuction: ['1NT', 'Pass', '4H'],
    requiredSystem: { oneNtOpening: "16-18", stayman: true, jacobyTransfers: true, texasTransfers: false },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-16-18'] },
    ],
    expectedResponseCalls: [
      { call: '4H', ruleIds: ['respond-to-1nt-w/-4h-4s-natural-game'] },
    ],
    rejectedResponseCalls: ['2D', '4D'],
    north: { S: '84', H: 'AQ5', D: 'AQ753', C: 'KQ2' },
    south: { S: 'T62', H: 'KT7643', D: 'J2', C: 'AJ' },
  },
  {
    description: 'The same 9-HCP six-heart hand over 15-17 starts with Jacoby 2D, below the Texas game-only range.',
    practiceAuction: ['1NT', 'Pass', '2D'],
    requiredSystem: { oneNtOpening: "15-17", stayman: true, jacobyTransfers: true, texasTransfers: true },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-15-17'] },
    ],
    expectedResponseCalls: [
      { call: '2D', ruleIds: ['respond-to-1nt-w/-transfer-to-hearts'] },
    ],
    rejectedResponseCalls: ['4D'],
    north: { S: '84', H: 'AQ5', D: 'AQ753', C: 'KQ2' },
    south: { S: 'T62', H: 'KT7643', D: 'J2', C: 'AJ' },
  },
  {
    description: '1NT, 16-18: 7 HCP and six clubs headed by KQ invite naturally with 3C; quality is illustrative.',
    practiceAuction: ['1NT', 'Pass', '3C'],
    requiredSystem: { oneNtOpening: "16-18" },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-16-18'] },
    ],
    expectedResponseCalls: [
      { call: '3C', ruleIds: ['respond-to-1nt-w/-3c-3d-natural-invitational'] },
    ],
    north: { S: 'KQT3', H: 'AQ9', D: 'AJ74', C: 'J7' },
    south: { S: 'J9', H: 'JT3', D: '63', C: 'KQT652' },
  },
  {
    description: 'The same balanced 15-HCP hand over 15-17 places the contract in 3NT, not quantitative 4NT.',
    practiceAuction: ['1NT', 'Pass', '3NT'],
    requiredSystem: { oneNtOpening: "15-17" },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-15-17'] },
    ],
    expectedResponseCalls: [
      { call: '3NT', ruleIds: ['respond-to-1nt-w/-3nt-10-15-balanced'] },
    ],
    rejectedResponseCalls: ['4NT'],
    north: { S: 'AK7', H: 'K9762', D: 'KT2', C: 'A3' },
    south: { S: 'QT2', H: 'AJ8', D: 'AJ85', C: 'QJT' },
  },
  {
    description: '1NT, 16-18: balanced 17 HCP bids 6NT directly under the adjusted small-slam range.',
    practiceAuction: ['1NT', 'Pass', '6NT'],
    requiredSystem: { oneNtOpening: "16-18" },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-16-18'] },
    ],
    expectedResponseCalls: [
      { call: '6NT', ruleIds: ['respond-to-1nt-w/-6nt-18-19-balanced'] },
    ],
    rejectedResponseCalls: ['4NT'],
    north: { S: 'AK9', H: 'A986', D: 'KQ8', C: 'T43' },
    south: { S: 'Q63', H: 'KQ5', D: 'AJ65', C: 'AJ6' },
  },
  {
    description: '1NT, 16-18: 15 HCP with six hearts bids direct 3H for slam interest; Jacoby and Texas yield.',
    practiceAuction: ['1NT', 'Pass', '3H'],
    requiredSystem: { oneNtOpening: "16-18", jacobyTransfers: true, texasTransfers: true },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-16-18'] },
    ],
    expectedResponseCalls: [
      { call: '3H', ruleIds: ['respond-to-1nt-w/-3h-3s-slam-interest'] },
    ],
    rejectedResponseCalls: ['2D', '4D'],
    north: { S: 'AK63', H: '63', D: 'AQ65', C: 'K52' },
    south: { S: 'QT8', H: 'AKQJT8', D: 'T8', C: 'QJ' },
  },
  {
    description: 'The same six-heart, 15-HCP hand over 15-17 takes the Texas game route instead of direct 3H.',
    practiceAuction: ['1NT', 'Pass', '4D'],
    requiredSystem: { oneNtOpening: "15-17", jacobyTransfers: true, texasTransfers: true },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-15-17'] },
    ],
    expectedResponseCalls: [
      { call: '4D', ruleIds: ['respond-to-1nt-w/-texas-transfer-to-hearts'] },
    ],
    rejectedResponseCalls: ['2D', '3H'],
    north: { S: 'AK63', H: '63', D: 'AQ65', C: 'K52' },
    south: { S: 'QT8', H: 'AKQJT8', D: 'T8', C: 'QJ' },
  },
];

/// Selected 2NT-response deals also assert the ordinary 20-21 HCP balanced opening.
/// Conventional deals declare their required settings; the same hand is reused where a
/// deliberately changed agreement produces a different response.
export const RESPONSE_AFTER_2NT_OPENING_TEST_DEALS: RuleTestDeal[] = [
  {
    description: '2NT: a balanced 3-HCP responder signs off with Pass; 3NT needs at least 4 ' +
                 'HCP.',
    practiceAuction: ['2NT', 'Pass', 'Pass'],
    expectedOpeningCalls: [
      { call: '2NT', ruleIds: ['open-2nt-balanced-20-21'] },
    ],
    expectedResponseCalls: [
      { call: 'Pass', ruleIds: ['respond-to-2nt-w/-pass-0-3'] },
    ],
    rejectedResponseCalls: ['3NT'],
    north: { S: 'AK4', H: 'AQ2', D: 'KJ', C: 'QJ753' },
    south: { S: 'QJ2', H: 'T93', D: '943', C: 'T642' },
  },
  {
    description: '2NT: 0 HCP and six clubs with no useful major-suit convention still permit ' +
                 'Pass; balanced shape is not required.',
    practiceAuction: ['2NT', 'Pass', 'Pass'],
    expectedOpeningCalls: [
      { call: '2NT', ruleIds: ['open-2nt-balanced-20-21'] },
    ],
    expectedResponseCalls: [
      { call: 'Pass', ruleIds: ['respond-to-2nt-w/-pass-0-3'] },
    ],
    rejectedResponseCalls: ['3NT'],
    rejectedOpeningCalls: ['1C', '1D'],
    north: { S: 'AQ43', H: 'KQJ2', D: 'AK3', C: 'Q9' },
    south: { S: '75', H: '76', D: '986', C: 'T65432' },
  },
  {
    description: '2NT: the same 0-HCP six-heart hand may Pass with Jacoby and Texas off; no ' +
                 'forcing natural 3H qualifies.',
    practiceAuction: ['2NT', 'Pass', 'Pass'],
    requiredSystem: { jacobyTransfers: false, texasTransfers: false },
    expectedOpeningCalls: [
      { call: '2NT', ruleIds: ['open-2nt-balanced-20-21'] },
    ],
    expectedResponseCalls: [
      { call: 'Pass', ruleIds: ['respond-to-2nt-w/-pass-0-3'] },
    ],
    rejectedResponseCalls: ['3H'],
    north: { S: 'AK3', H: 'AQ2', D: 'KJ4', C: 'QJ76' },
    south: { S: '85', H: 'T87543', D: '532', C: '92' },
  },
  {
    description: '2NT: with six hearts and four spades, use Stayman first rather than a heart ' +
                 'transfer; look for the possible spade fit.',
    practiceAuction: ['2NT', 'Pass', '3C'],
    requiredSystem: { stayman: true, jacobyTransfers: true },
    expectedOpeningCalls: [
      { call: '2NT', ruleIds: ['open-2nt-balanced-20-21'] },
    ],
    expectedResponseCalls: [
      { call: '3C', ruleIds: ['respond-to-2nt-w/-stayman'] },
    ],
    rejectedResponseCalls: ['3D'],
    north: { S: 'AQ43', H: 'KQJ2', D: 'AK3', C: 'Q9' },
    south: { S: 'J765', H: '987643', D: 'QJ', C: 'K' },
  },
  {
    description: '2NT: with 3 HCP and two five-card majors, both Jacoby transfers remain ' +
                 'available; the weak Pass fallback disappears.',
    practiceAuction: ['2NT', 'Pass', '3D'],
    requiredSystem: { jacobyTransfers: true },
    expectedOpeningCalls: [
      { call: '2NT', ruleIds: ['open-2nt-balanced-20-21'] },
    ],
    expectedResponseCalls: [
      { call: '3D', ruleIds: ['respond-to-2nt-w/-transfer-to-hearts'] },
      { call: '3H', ruleIds: ['respond-to-2nt-w/-transfer-to-spades'] },
    ],
    rejectedResponseCalls: ['Pass'],
    north: { S: 'AK3', H: 'AQ2', D: 'KJ4', C: 'QJ76' },
    south: { S: 'QJT86', H: 'T9763', D: 'T9', C: 'T' },
  },
  {
    description: '2NT: with 4 HCP and two five-card majors, transfer to hearts with 3D first; ' +
                 'the 3H spade transfer is removed.',
    practiceAuction: ['2NT', 'Pass', '3D'],
    requiredSystem: { jacobyTransfers: true },
    expectedOpeningCalls: [
      { call: '2NT', ruleIds: ['open-2nt-balanced-20-21'] },
    ],
    expectedResponseCalls: [
      { call: '3D', ruleIds: ['respond-to-2nt-w/-transfer-to-hearts'] },
    ],
    rejectedResponseCalls: ['3H'],
    north: { S: 'AK3', H: 'AQ2', D: 'KJ4', C: 'QJ76' },
    south: { S: 'T9754', H: 'J8654', D: '83', C: 'K' },
  },
  {
    description: '2NT: the same six-heart hand bids natural 4H for game when Texas is off; the ' +
                 'slower Jacoby route is suppressed.',
    practiceAuction: ['2NT', 'Pass', '4H'],
    requiredSystem: { jacobyTransfers: true, texasTransfers: false },
    expectedOpeningCalls: [
      { call: '2NT', ruleIds: ['open-2nt-balanced-20-21'] },
    ],
    expectedResponseCalls: [
      { call: '4H', ruleIds: ['respond-to-2nt-w/-4h-4s-natural-game'] },
    ],
    rejectedResponseCalls: ['3D'],
    north: { S: 'AK4', H: 'AQ2', D: 'KJ', C: 'QJ753' },
    south: { S: 'Q9', H: 'J98643', D: 'Q63', C: '64' },
  },
  {
    description: '2NT: with 10 HCP and six hearts, Texas 4D still places the game without ' +
                 'advertising slam interest.',
    practiceAuction: ['2NT', 'Pass', '4D'],
    requiredSystem: { jacobyTransfers: true, texasTransfers: true },
    expectedOpeningCalls: [
      { call: '2NT', ruleIds: ['open-2nt-balanced-20-21'] },
    ],
    expectedResponseCalls: [
      { call: '4D', ruleIds: ['respond-to-2nt-w/-texas-transfer-to-hearts'] },
    ],
    rejectedResponseCalls: ['3D'],
    north: { S: 'AK3', H: 'AQ2', D: 'KJ4', C: 'QJ76' },
    south: { S: 'QT', H: 'KJT984', D: '532', C: 'A3' },
  },
  {
    description: '2NT: with 11 HCP and six hearts, start with Jacoby 3D to preserve ' +
                 'slam-bidding room; Texas 4D is unavailable.',
    practiceAuction: ['2NT', 'Pass', '3D'],
    requiredSystem: { jacobyTransfers: true, texasTransfers: true },
    expectedOpeningCalls: [
      { call: '2NT', ruleIds: ['open-2nt-balanced-20-21'] },
    ],
    expectedResponseCalls: [
      { call: '3D', ruleIds: ['respond-to-2nt-w/-transfer-to-hearts'] },
    ],
    rejectedResponseCalls: ['4D'],
    north: { S: 'AK3', H: 'AQ2', D: 'KJ4', C: 'QJ76' },
    south: { S: 'Q4', H: 'KT9875', D: 'Q62', C: 'A5' },
  },
  {
    description: '2NT: without Jacoby, a five-heart, 4-HCP unbalanced hand can bid natural ' +
                 'forcing 3H; do not confuse it with an artificial transfer.',
    practiceAuction: ['2NT', 'Pass', '3H'],
    requiredSystem: { jacobyTransfers: false, texasTransfers: false },
    expectedOpeningCalls: [
      { call: '2NT', ruleIds: ['open-2nt-balanced-20-21'] },
    ],
    expectedResponseCalls: [
      { call: '3H', ruleIds: ['respond-to-2nt-w/-3h-3s-natural-forcing'] },
    ],
    north: { S: 'AK3', H: 'AQ2', D: 'KJ4', C: 'QJ76' },
    south: { S: 'J5', H: 'KT986', D: 'T732', C: '54' },
  },
];

/// Existing response-practice deals extended through opener's first notrump continuation.
/// Moving them here avoids duplicate physical boards in both dropdown groups.
export const OPENER_REBID_AFTER_1NT_OPENING_TEST_DEALS: RuleTestDeal[] = [
  {
    description: '1NT, 15-17 opener: 10-HCP balanced responder bids 3NT directly rather than inviting.',
    practiceAuction: ['1NT', 'Pass', '3NT', 'Pass', 'Pass'],
    requiredSystem: { oneNtOpening: '15-17' },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-15-17'] },
    ],
    expectedResponseCalls: [
      { call: '3NT', ruleIds: ['respond-to-1nt-w/-3nt-10-15-balanced'] },
    ],
    rejectedResponseCalls: ['2NT'],
    expectedOpenerRebidCalls: [
      { call: 'Pass', ruleIds: ['opener-rebid-pass-after-nt-natural-nt-signoff'] },
    ],
    north: { S: 'A532', H: 'KJ92', D: 'A7', C: 'QJT' },
    south: { S: 'Q7', H: 'Q64', D: 'QJ4', C: 'K8432' },
  },
  {
    description: '1NT: 12-HCP responder with four hearts asks for a four-card major using Stayman 2C.',
    practiceAuction: ['1NT', 'Pass', '2C', 'Pass', '2S'],
    requiredSystem: { oneNtOpening: '15-17', stayman: true },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-15-17'] },
    ],
    expectedResponseCalls: [
      { call: '2C', ruleIds: ['respond-to-1nt-w/-stayman'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '2S', ruleIds: ['opener-rebid-show-spades-after-nt-stayman'] },
    ],
    rejectedOpenerRebidCalls: ['2D', '2H'],
    north: { S: 'KQJ3', H: 'J4', D: 'K832', C: 'AQ6' },
    south: { S: 'AT5', H: 'AK76', D: '9', C: 'JT543' },
  },
  {
    description: '1NT: 8-HCP responder with five hearts and four spades uses Stayman 2C before a Jacoby transfer; both majors need exploration.',
    practiceAuction: ['1NT', 'Pass', '2C', 'Pass', '2H'],
    requiredSystem: { oneNtOpening: '15-17', stayman: true, jacobyTransfers: true },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-15-17'] },
    ],
    expectedResponseCalls: [
      { call: '2C', ruleIds: ['respond-to-1nt-w/-stayman'] },
    ],
    rejectedResponseCalls: ['2D', '2H'],
    expectedOpenerRebidCalls: [
      { call: '2H', ruleIds: ['opener-rebid-show-hearts-after-nt-stayman'] },
    ],
    rejectedOpenerRebidCalls: ['2D', '2S'],
    north: { S: 'AQJ3', H: 'JT65', D: 'AK', C: 'Q73' },
    south: { S: 'KT74', H: 'K9742', D: 'Q94', C: 'T' },
  },
  {
    description: '1NT: 6-HCP responder with five hearts transfers with 2D rather than passing 1NT.',
    practiceAuction: ['1NT', 'Pass', '2D', 'Pass', '2H'],
    requiredSystem: { oneNtOpening: '15-17', jacobyTransfers: true },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-15-17'] },
    ],
    expectedResponseCalls: [
      { call: '2D', ruleIds: ['respond-to-1nt-w/-transfer-to-hearts'] },
    ],
    rejectedResponseCalls: ['Pass'],
    expectedOpenerRebidCalls: [
      { call: '2H', ruleIds: ['opener-rebid-complete-jacoby-after-nt'] },
    ],
    rejectedOpenerRebidCalls: ['Pass'],
    north: { S: 'AT42', H: 'AK', D: 'KJ4', C: '9764' },
    south: { S: '6', H: 'T9763', D: 'Q532', C: 'KJ5' },
  },
  {
    description: '1NT: 2-HCP responder with five spades transfers with 2H rather than passing 1NT.',
    practiceAuction: ['1NT', 'Pass', '2H', 'Pass', '2S'],
    requiredSystem: { oneNtOpening: '15-17', jacobyTransfers: true },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-15-17'] },
    ],
    expectedResponseCalls: [
      { call: '2H', ruleIds: ['respond-to-1nt-w/-transfer-to-spades'] },
    ],
    rejectedResponseCalls: ['Pass'],
    expectedOpenerRebidCalls: [
      { call: '2S', ruleIds: ['opener-rebid-complete-jacoby-after-nt'] },
    ],
    rejectedOpenerRebidCalls: ['Pass'],
    north: { S: 'AK8', H: 'AT2', D: 'K652', C: 'JT4' },
    south: { S: 'J7432', H: 'J94', D: 'T83', C: '75' },
  },
  {
    description: '1NT: 14 HCP, six hearts, no four-card spade suit; Texas 4D takes priority over ordinary Jacoby 2D.',
    practiceAuction: ['1NT', 'Pass', '4D', 'Pass', '4H'],
    requiredSystem: { oneNtOpening: '15-17', jacobyTransfers: true, texasTransfers: true },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-15-17'] },
    ],
    expectedResponseCalls: [
      { call: '4D', ruleIds: ['respond-to-1nt-w/-texas-transfer-to-hearts'] },
    ],
    rejectedResponseCalls: ['2D'],
    expectedOpenerRebidCalls: [
      { call: '4H', ruleIds: ['opener-rebid-complete-texas-after-nt'] },
    ],
    rejectedOpenerRebidCalls: ['Pass'],
    north: { S: 'KQJ8', H: 'J3', D: 'AT73', C: 'A93' },
    south: { S: 'A74', H: 'KQT752', D: 'KQ85', C: '' },
  },
  {
    description: '1NT: 12 HCP, six spades, no four-card heart suit; Texas 4H takes priority over ordinary Jacoby 2H.',
    practiceAuction: ['1NT', 'Pass', '4H', 'Pass', '4S'],
    requiredSystem: { oneNtOpening: '15-17', jacobyTransfers: true, texasTransfers: true },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-15-17'] },
    ],
    expectedResponseCalls: [
      { call: '4H', ruleIds: ['respond-to-1nt-w/-texas-transfer-to-spades'] },
    ],
    rejectedResponseCalls: ['2H'],
    expectedOpenerRebidCalls: [
      { call: '4S', ruleIds: ['opener-rebid-complete-texas-after-nt'] },
    ],
    rejectedOpenerRebidCalls: ['Pass'],
    north: { S: 'K5', H: 'AKJ8', D: 'A87', C: '9876' },
    south: { S: 'AJT942', H: 'Q6', D: 'QJ54', C: 'Q' },
  },
  {
    description: '1NT: with both Stayman and Jacoby off, 6 HCP and five hearts give a natural ' +
                 'weak 2H signoff, not an artificial 2D transfer.',
    practiceAuction: ['1NT', 'Pass', '2H', 'Pass', 'Pass'],
    requiredSystem: { oneNtOpening: '15-17', stayman: false, jacobyTransfers: false,
                      texasTransfers: false },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-15-17'] },
    ],
    expectedResponseCalls: [
      { call: '2H', ruleIds: ['respond-to-1nt-w/-2h-2s-natural-signoff'] },
    ],
    expectedOpenerRebidCalls: [
      { call: 'Pass', ruleIds: ['opener-rebid-pass-after-1nt-weak-natural-major'] },
    ],
    north: { S: 'AT42', H: 'AK', D: 'KJ4', C: '9764' },
    south: { S: '6', H: 'T9763', D: 'Q532', C: 'KJ5' },
  },
  {
    description: '1NT: 14 HCP and six hearts, with Texas off but Jacoby on: natural 4H ' +
                 'is the direct game route and suppresses the otherwise available 2D transfer.',
    practiceAuction: ['1NT', 'Pass', '4H', 'Pass', 'Pass'],
    requiredSystem: { oneNtOpening: '15-17', stayman: true, jacobyTransfers: true,
                      texasTransfers: false },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-15-17'] },
    ],
    expectedResponseCalls: [
      { call: '4H', ruleIds: ['respond-to-1nt-w/-4h-4s-natural-game'] },
    ],
    rejectedResponseCalls: ['2D', '4D'],
    expectedOpenerRebidCalls: [
      { call: 'Pass', ruleIds: ['opener-rebid-pass-after-nt-natural-major-game'] },
    ],
    rejectedOpenerRebidCalls: ['4S'],
    north: { S: 'KQJ8', H: 'J3', D: 'AT73', C: 'A93' },
    south: { S: 'A74', H: 'KQT752', D: 'KQ85', C: '' },
  },
  {
    description: '1NT: 9 HCP and six hearts plus four spades uses Stayman 2C first, ' +
                 'rather than Jacoby 2D or Texas 4D; explore a possible four-four spade fit.',
    practiceAuction: ['1NT', 'Pass', '2C', 'Pass', '2D'],
    requiredSystem: { oneNtOpening: '15-17', stayman: true, jacobyTransfers: true,
                      texasTransfers: true },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-15-17'] },
    ],
    expectedResponseCalls: [
      { call: '2C', ruleIds: ['respond-to-1nt-w/-stayman'] },
    ],
    rejectedResponseCalls: ['2D', '4D'],
    expectedOpenerRebidCalls: [
      { call: '2D', ruleIds: ['opener-rebid-deny-major-after-nt-stayman'] },
    ],
    rejectedOpenerRebidCalls: ['2H', '2S'],
    north: { S: 'T3', H: 'Q72', D: 'AJ4', C: 'AKJ83' },
    south: { S: 'K752', H: 'KT9843', D: 'K7', C: '4' },
  },
  {
    description: '1NT-2C-2H: opener has exactly four hearts and only three spades, ' +
                 'so answer Stayman with hearts.',
    practiceAuction: ['1NT', 'Pass', '2C', 'Pass', '2H'],
    requiredSystem: { oneNtOpening: '15-17', stayman: true },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-15-17'] },
    ],
    expectedResponseCalls: [
      { call: '2C', ruleIds: ['respond-to-1nt-w/-stayman'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '2H', ruleIds: ['opener-rebid-show-hearts-after-nt-stayman'] },
    ],
    rejectedOpenerRebidCalls: ['2D', '2S'],
    north: { S: 'A73', H: 'KQJ6', D: 'K85', C: 'Q94' },
    south: { S: 'K84', H: 'A982', D: 'QJT', C: 'J75' },
  },
  {
    description: '1NT: with neither Stayman nor Jacoby, an unbalanced 8-HCP hand with ' +
                 'five hearts and four spades uses the basic natural 2NT invitation. ' +
                 'This rule deliberately permits an unbalanced invitation when both are off.',
    practiceAuction: ['1NT', 'Pass', '2NT', 'Pass', '3NT'],
    requiredSystem: { oneNtOpening: '15-17', stayman: false, jacobyTransfers: false,
                      texasTransfers: false },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-15-17'] },
    ],
    expectedResponseCalls: [
      { call: '2NT', ruleIds: ['respond-to-1nt-w/-2nt-8-9-invitational'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '3NT', ruleIds: ['opener-rebid-3nt-after-1nt-2nt-invitation'] },
    ],
    rejectedOpenerRebidCalls: ['Pass'],
    north: { S: 'AQJ3', H: 'JT65', D: 'AK', C: 'Q73' },
    south: { S: 'KT74', H: 'K9742', D: 'Q94', C: 'T' },
  },
  {
    description: '1NT 15-17, maximum 17 HCP: accept the balanced 9-HCP 2NT invitation with 3NT.',
    practiceAuction: ['1NT', 'Pass', '2NT', 'Pass', '3NT'],
    requiredSystem: { oneNtOpening: '15-17' },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-15-17'] },
    ],
    expectedResponseCalls: [
      { call: '2NT', ruleIds: ['respond-to-1nt-w/-2nt-8-9-invitational'] },
    ],
    rejectedResponseCalls: ['3NT'],
    expectedOpenerRebidCalls: [
      { call: '3NT', ruleIds: ['opener-rebid-3nt-after-1nt-2nt-invitation'] },
    ],
    rejectedOpenerRebidCalls: ['Pass'],
    north: { S: 'AK63', H: 'QJ62', D: 'QT9', C: 'KQ' },
    south: { S: 'J82', H: 'AK7', D: 'J8542', C: '54' },
  },
  {
    description: '1NT 15-17, 16 HCP: a balanced 9-HCP 2NT invitation allows Pass or 3NT by judgment.',
    practiceAuction: ['1NT', 'Pass', '2NT', 'Pass', 'Pass'],
    requiredSystem: { oneNtOpening: "15-17" },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-15-17'] },
    ],
    expectedResponseCalls: [
      { call: '2NT', ruleIds: ['respond-to-1nt-w/-2nt-8-9-invitational'] },
    ],
    rejectedResponseCalls: ['3NT'],
    expectedOpenerRebidCalls: [
      { call: 'Pass', ruleIds: ['opener-rebid-pass-after-1nt-2nt-invitation'] },
      { call: '3NT', ruleIds: ['opener-rebid-3nt-after-1nt-2nt-invitation'] },
    ],
    north: { S: 'AKT', H: 'KJ63', D: '93', C: 'AJ93' },
    south: { S: 'Q64', H: 'A84', D: 'T876', C: 'K72' },
  },
  {
    description: '1NT 16-18, 17 HCP: retain Pass and 3NT against a balanced 7-HCP invitation.',
    practiceAuction: ['1NT', 'Pass', '2NT', 'Pass', 'Pass'],
    requiredSystem: { oneNtOpening: "16-18" },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-16-18'] },
    ],
    expectedResponseCalls: [
      { call: '2NT', ruleIds: ['respond-to-1nt-w/-2nt-8-9-invitational'] },
    ],
    rejectedResponseCalls: ['Pass', '3NT'],
    expectedOpenerRebidCalls: [
      { call: 'Pass', ruleIds: ['opener-rebid-pass-after-1nt-2nt-invitation'] },
      { call: '3NT', ruleIds: ['opener-rebid-3nt-after-1nt-2nt-invitation'] },
    ],
    north: { S: 'A52', H: 'K8532', D: 'KQ8', C: 'AJ' },
    south: { S: 'QT9', H: 'AJT', D: 'T763', C: '852' },
  },
  {
    description: '1NT 15-17, middle 16 HCP: Pass or 6NT are judgment options over quantitative 4NT.',
    practiceAuction: ['1NT', 'Pass', '4NT', 'Pass', 'Pass'],
    requiredSystem: { oneNtOpening: '15-17' },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-15-17'] },
    ],
    expectedResponseCalls: [
      { call: '4NT', ruleIds: ['respond-to-1nt-w/-4nt-16-17-balanced'] },
    ],
    rejectedResponseCalls: ['3NT'],
    expectedOpenerRebidCalls: [
      { call: 'Pass', ruleIds: ['opener-rebid-pass-after-nt-4nt-quantitative-invitation'] },
      { call: '6NT', ruleIds: ['opener-rebid-6nt-after-nt-4nt-quantitative-invitation'] },
    ],
    north: { S: '53', H: 'AQJ4', D: 'AKT6', C: 'QT3' },
    south: { S: 'AT9', H: 'K86', D: 'Q97', C: 'AK82' },
  },
  {
    description: '1NT 16-18, middle 17 HCP: Pass or 6NT are judgment options over quantitative 4NT.',
    practiceAuction: ['1NT', 'Pass', '4NT', 'Pass', 'Pass'],
    requiredSystem: { oneNtOpening: "16-18" },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-16-18'] },
    ],
    expectedResponseCalls: [
      { call: '4NT', ruleIds: ['respond-to-1nt-w/-4nt-16-17-balanced'] },
    ],
    rejectedResponseCalls: ['3NT'],
    expectedOpenerRebidCalls: [
      { call: 'Pass', ruleIds: ['opener-rebid-pass-after-nt-4nt-quantitative-invitation'] },
      { call: '6NT', ruleIds: ['opener-rebid-6nt-after-nt-4nt-quantitative-invitation'] },
    ],
    north: { S: 'AK7', H: 'K9762', D: 'KT2', C: 'A3' },
    south: { S: 'QT2', H: 'AJ8', D: 'AJ85', C: 'QJT' },
  },
  {
    description: '1NT 15-17, minimum 15 HCP: decline the 9-HCP 2NT game invitation.',
    practiceAuction: ['1NT', 'Pass', '2NT', 'Pass', 'Pass'],
    requiredSystem: { oneNtOpening: '15-17' },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-15-17'] },
    ],
    expectedResponseCalls: [
      { call: '2NT', ruleIds: ['respond-to-1nt-w/-2nt-8-9-invitational'] },
    ],
    expectedOpenerRebidCalls: [
      { call: 'Pass', ruleIds: ['opener-rebid-pass-after-1nt-2nt-invitation'] },
    ],
    rejectedOpenerRebidCalls: ['3NT'],
    north: { S: 'AK63', H: 'QJ62', D: 'QT9', C: 'QJ' },
    south: { S: 'J82', H: 'AK7', D: 'J8542', C: '54' },
  },
  {
    description: '1NT 16-18, minimum 16 HCP: decline the balanced 7-HCP 2NT invitation.',
    practiceAuction: ['1NT', 'Pass', '2NT', 'Pass', 'Pass'],
    requiredSystem: { oneNtOpening: '16-18' },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-16-18'] },
    ],
    expectedResponseCalls: [
      { call: '2NT', ruleIds: ['respond-to-1nt-w/-2nt-8-9-invitational'] },
    ],
    expectedOpenerRebidCalls: [
      { call: 'Pass', ruleIds: ['opener-rebid-pass-after-1nt-2nt-invitation'] },
    ],
    rejectedOpenerRebidCalls: ['3NT'],
    north: { S: 'A52', H: 'K8532', D: 'KQ8', C: 'AT' },
    south: { S: 'QT9', H: 'AJT', D: 'T763', C: '852' },
  },
  {
    description: '1NT 16-18, maximum 18 HCP: accept the balanced 7-HCP 2NT invitation.',
    practiceAuction: ['1NT', 'Pass', '2NT', 'Pass', '3NT'],
    requiredSystem: { oneNtOpening: '16-18' },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-16-18'] },
    ],
    expectedResponseCalls: [
      { call: '2NT', ruleIds: ['respond-to-1nt-w/-2nt-8-9-invitational'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '3NT', ruleIds: ['opener-rebid-3nt-after-1nt-2nt-invitation'] },
    ],
    rejectedOpenerRebidCalls: ['Pass'],
    north: { S: 'A52', H: 'K8532', D: 'KQ8', C: 'AQ' },
    south: { S: 'QT9', H: 'AJT', D: 'T763', C: '852' },
  },
  {
    description: '1NT 15-17, minimum 15 HCP: decline a balanced 16-HCP quantitative 4NT.',
    practiceAuction: ['1NT', 'Pass', '4NT', 'Pass', 'Pass'],
    requiredSystem: { oneNtOpening: '15-17' },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-15-17'] },
    ],
    expectedResponseCalls: [
      { call: '4NT', ruleIds: ['respond-to-1nt-w/-4nt-16-17-balanced'] },
    ],
    expectedOpenerRebidCalls: [
      { call: 'Pass', ruleIds: ['opener-rebid-pass-after-nt-4nt-quantitative-invitation'] },
    ],
    rejectedOpenerRebidCalls: ['6NT'],
    north: { S: '53', H: 'AQ94', D: 'AKT6', C: 'QT3' },
    south: { S: 'AT9', H: 'K86', D: 'Q97', C: 'AK82' },
  },
  {
    description: '1NT 15-17, maximum 17 HCP: accept a balanced 16-HCP quantitative 4NT.',
    practiceAuction: ['1NT', 'Pass', '4NT', 'Pass', '6NT'],
    requiredSystem: { oneNtOpening: '15-17' },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-15-17'] },
    ],
    expectedResponseCalls: [
      { call: '4NT', ruleIds: ['respond-to-1nt-w/-4nt-16-17-balanced'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '6NT', ruleIds: ['opener-rebid-6nt-after-nt-4nt-quantitative-invitation'] },
    ],
    rejectedOpenerRebidCalls: ['Pass'],
    north: { S: '53', H: 'AQJ4', D: 'AKT6', C: 'QJ3' },
    south: { S: 'AT9', H: 'K86', D: 'Q97', C: 'AK82' },
  },
  {
    description: '1NT 16-18, minimum 16 HCP: decline the balanced 15-HCP quantitative 4NT.',
    practiceAuction: ['1NT', 'Pass', '4NT', 'Pass', 'Pass'],
    requiredSystem: { oneNtOpening: '16-18' },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-16-18'] },
    ],
    expectedResponseCalls: [
      { call: '4NT', ruleIds: ['respond-to-1nt-w/-4nt-16-17-balanced'] },
    ],
    expectedOpenerRebidCalls: [
      { call: 'Pass', ruleIds: ['opener-rebid-pass-after-nt-4nt-quantitative-invitation'] },
    ],
    rejectedOpenerRebidCalls: ['6NT'],
    north: { S: 'AK7', H: 'Q9762', D: 'KT2', C: 'A3' },
    south: { S: 'QT2', H: 'AJ8', D: 'AJ85', C: 'QJT' },
  },
  {
    description: '1NT 16-18, maximum 18 HCP: accept the balanced 15-HCP quantitative 4NT.',
    practiceAuction: ['1NT', 'Pass', '4NT', 'Pass', '6NT'],
    requiredSystem: { oneNtOpening: '16-18' },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-16-18'] },
    ],
    expectedResponseCalls: [
      { call: '4NT', ruleIds: ['respond-to-1nt-w/-4nt-16-17-balanced'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '6NT', ruleIds: ['opener-rebid-6nt-after-nt-4nt-quantitative-invitation'] },
    ],
    rejectedOpenerRebidCalls: ['Pass'],
    north: { S: 'AKJ', H: 'K9762', D: 'KT2', C: 'A3' },
    south: { S: 'QT2', H: 'AJ8', D: 'AJ85', C: 'QJT' },
  },
  {
    description: '1NT-3C: responder has KQ and six clubs, but opener lacks A/K/Q in clubs; ' +
                 'decline the suit-running invitation with Pass.',
    practiceAuction: ['1NT', 'Pass', '3C', 'Pass', 'Pass'],
    requiredSystem: { oneNtOpening: '15-17' },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-15-17'] },
    ],
    expectedResponseCalls: [
      { call: '3C', ruleIds: ['respond-to-1nt-w/-3c-3d-natural-invitational'] },
    ],
    expectedOpenerRebidCalls: [
      { call: 'Pass', ruleIds: ['opener-rebid-pass-after-1nt-3-minor-invitation'] },
    ],
    rejectedOpenerRebidCalls: ['3NT'],
    north: { S: 'AQJ', H: 'KQ4', D: 'KJ87', C: '943' },
    south: { S: 'T8', H: 'J76', D: 'Q5', C: 'KQ8762' },
  },
  {
    description: '1NT-3D: opener holds the missing top diamond honor, so accept the good ' +
                 'six-card-minor invitation with 3NT.',
    practiceAuction: ['1NT', 'Pass', '3D', 'Pass', '3NT'],
    requiredSystem: { oneNtOpening: '15-17' },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-15-17'] },
    ],
    expectedResponseCalls: [
      { call: '3D', ruleIds: ['respond-to-1nt-w/-3c-3d-natural-invitational'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '3NT', ruleIds: ['opener-rebid-3nt-after-1nt-3-minor-invitation'] },
    ],
    rejectedOpenerRebidCalls: ['Pass'],
    north: { S: 'AQJ3', H: 'KQ4', D: 'K52', C: '943' },
    south: { S: 'T82', H: 'J76', D: 'AQ8764', C: 'J' },
  },
  {
    description: '1NT: an 8-HCP six-club hand with only one of A/K/Q is not good enough for ' +
                 'the natural 3C invitation; with conventions off, use the generic 2NT invite.',
    practiceAuction: ['1NT', 'Pass', '2NT', 'Pass', '3NT'],
    requiredSystem: { oneNtOpening: '15-17', stayman: false, jacobyTransfers: false,
                      texasTransfers: false },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-15-17'] },
    ],
    expectedResponseCalls: [
      { call: '2NT', ruleIds: ['respond-to-1nt-w/-2nt-8-9-invitational'] },
    ],
    rejectedResponseCalls: ['3C'],
    expectedOpenerRebidCalls: [
      { call: '3NT', ruleIds: ['opener-rebid-3nt-after-1nt-2nt-invitation'] },
    ],
    rejectedOpenerRebidCalls: ['Pass'],
    north: { S: 'QJ3', H: 'AK4', D: 'AQJ7', C: '854' },
    south: { S: 'A82', H: '76', D: '54', C: 'KJT963' },
  },
  {
    description: '1NT-3H without Jacoby: responder shows a natural five-card-or-longer major; ' +
                 'opener has exactly two hearts and chooses 3NT.',
    practiceAuction: ['1NT', 'Pass', '3H', 'Pass', '3NT'],
    requiredSystem: { oneNtOpening: '15-17', jacobyTransfers: false },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-15-17'] },
    ],
    expectedResponseCalls: [
      { call: '3H', ruleIds: ['respond-to-1nt-w/-3h-3s-natural-forcing'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '3NT', ruleIds: ['opener-rebid-3nt-after-nt-natural-3-major'] },
    ],
    rejectedOpenerRebidCalls: ['4H'],
    north: { S: 'AQJ3', H: 'K4', D: 'KJ72', C: 'Q65' },
    south: { S: 'K82', H: 'AQJ87', D: '65', C: '742' },
  },
  {
    description: '1NT-3H with Jacoby on is the direct slam-interest treatment. A middle 16-HCP ' +
                 'opener shows the cheapest side control, 3S, while 4H remains visible.',
    practiceAuction: ['1NT', 'Pass', '3H', 'Pass', '3S'],
    requiredSystem: { oneNtOpening: '15-17', jacobyTransfers: true },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-15-17'] },
    ],
    expectedResponseCalls: [
      { call: '3H', ruleIds: ['respond-to-1nt-w/-3h-3s-slam-interest'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '3S', ruleIds: ['opener-rebid-control-after-1nt-direct-3-major-slam-interest'] },
      { call: '4H', ruleIds: ['opener-rebid-game-after-1nt-direct-3-major-slam-interest'] },
    ],
    expectedOpenerRebidCallOrder: [['3S', '4H']],
    north: { S: 'AK63', H: '63', D: 'AQ65', C: 'K52' },
    south: { S: 'QT8', H: 'AKQJT8', D: 'JT', C: 'QJ' },
  },
];

/// The corresponding immediate opener continuations after a natural 20-21 2NT opening.
export const OPENER_REBID_AFTER_2NT_OPENING_TEST_DEALS: RuleTestDeal[] = [
  {
    description: '2NT: 4 balanced HCP bid 3NT even opposite a minimum 20-HCP opener; our ' +
                 'source uses this threshold, not a rigid 25 combined HCP.',
    practiceAuction: ['2NT', 'Pass', '3NT', 'Pass', 'Pass'],
    expectedOpeningCalls: [
      { call: '2NT', ruleIds: ['open-2nt-balanced-20-21'] },
    ],
    expectedResponseCalls: [
      { call: '3NT', ruleIds: ['respond-to-2nt-w/-3nt-4-10'] },
    ],
    rejectedResponseCalls: ['Pass', '4NT'],
    rejectedOpeningCalls: ['1C', '1D'],
    expectedOpenerRebidCalls: [
      { call: 'Pass', ruleIds: ['opener-rebid-pass-after-nt-natural-nt-signoff'] },
    ],
    north: { S: 'AK3', H: 'AQ2', D: 'KJ4', C: 'QJ76' },
    south: { S: 'T76', H: '753', D: 'T86', C: 'AT92' },
  },
  {
    description: '2NT: with 0 HCP and six hearts, transfer with 3D when Jacoby is on; the ' +
                 'natural Pass fallback is suppressed.',
    practiceAuction: ['2NT', 'Pass', '3D', 'Pass', '3H'],
    requiredSystem: { jacobyTransfers: true },
    expectedOpeningCalls: [
      { call: '2NT', ruleIds: ['open-2nt-balanced-20-21'] },
    ],
    expectedResponseCalls: [
      { call: '3D', ruleIds: ['respond-to-2nt-w/-transfer-to-hearts'] },
    ],
    rejectedResponseCalls: ['Pass'],
    expectedOpenerRebidCalls: [
      { call: '3H', ruleIds: ['opener-rebid-complete-jacoby-after-nt'] },
    ],
    rejectedOpenerRebidCalls: ['Pass'],
    north: { S: 'AK3', H: 'AQ2', D: 'KJ4', C: 'QJ76' },
    south: { S: '85', H: 'T87543', D: '532', C: '92' },
  },
  {
    description: '2NT: 2 HCP and five spades transfer with 3H rather than passing a weak ' +
                 'balanced hand.',
    practiceAuction: ['2NT', 'Pass', '3H', 'Pass', '3S'],
    requiredSystem: { jacobyTransfers: true },
    expectedOpeningCalls: [
      { call: '2NT', ruleIds: ['open-2nt-balanced-20-21'] },
    ],
    expectedResponseCalls: [
      { call: '3H', ruleIds: ['respond-to-2nt-w/-transfer-to-spades'] },
    ],
    rejectedResponseCalls: ['Pass'],
    expectedOpenerRebidCalls: [
      { call: '3S', ruleIds: ['opener-rebid-complete-jacoby-after-nt'] },
    ],
    rejectedOpenerRebidCalls: ['Pass'],
    north: { S: 'AK4', H: 'AQ2', D: 'KJ', C: 'QJ753' },
    south: { S: '87532', H: '975', D: 'Q86', C: '42' },
  },
  {
    description: '2NT: 4 HCP and four hearts use 3C Stayman to look for a 4-4 fit; direct 3NT ' +
                 'is suppressed.',
    practiceAuction: ['2NT', 'Pass', '3C', 'Pass', '3H'],
    requiredSystem: { stayman: true },
    expectedOpeningCalls: [
      { call: '2NT', ruleIds: ['open-2nt-balanced-20-21'] },
    ],
    expectedResponseCalls: [
      { call: '3C', ruleIds: ['respond-to-2nt-w/-stayman'] },
    ],
    rejectedResponseCalls: ['3NT'],
    rejectedOpeningCalls: ['1C', '1D'],
    expectedOpenerRebidCalls: [
      { call: '3H', ruleIds: ['opener-rebid-show-hearts-after-nt-stayman'] },
    ],
    rejectedOpenerRebidCalls: ['3D', '3S'],
    north: { S: 'AQ43', H: 'KQJ2', D: 'AK3', C: 'Q9' },
    south: { S: 'KJ6', H: 'T975', D: '752', C: '542' },
  },
  {
    description: '2NT: 5 HCP and six hearts take the fast Texas 4D game route; ordinary 3D ' +
                 'Jacoby is suppressed.',
    practiceAuction: ['2NT', 'Pass', '4D', 'Pass', '4H'],
    requiredSystem: { jacobyTransfers: true, texasTransfers: true },
    expectedOpeningCalls: [
      { call: '2NT', ruleIds: ['open-2nt-balanced-20-21'] },
    ],
    expectedResponseCalls: [
      { call: '4D', ruleIds: ['respond-to-2nt-w/-texas-transfer-to-hearts'] },
    ],
    rejectedResponseCalls: ['3D'],
    expectedOpenerRebidCalls: [
      { call: '4H', ruleIds: ['opener-rebid-complete-texas-after-nt'] },
    ],
    rejectedOpenerRebidCalls: ['Pass'],
    north: { S: 'AK4', H: 'AQ2', D: 'KJ', C: 'QJ753' },
    south: { S: 'Q9', H: 'J98643', D: 'Q63', C: '64' },
  },
  {
    description: '2NT: 5 HCP and six spades take the fast Texas 4H route to 4S when the ' +
                 'convention is enabled.',
    practiceAuction: ['2NT', 'Pass', '4H', 'Pass', '4S'],
    requiredSystem: { jacobyTransfers: true, texasTransfers: true },
    expectedOpeningCalls: [
      { call: '2NT', ruleIds: ['open-2nt-balanced-20-21'] },
    ],
    expectedResponseCalls: [
      { call: '4H', ruleIds: ['respond-to-2nt-w/-texas-transfer-to-spades'] },
    ],
    rejectedResponseCalls: ['3H'],
    expectedOpenerRebidCalls: [
      { call: '4S', ruleIds: ['opener-rebid-complete-texas-after-nt'] },
    ],
    rejectedOpenerRebidCalls: ['Pass'],
    north: { S: 'AQ43', H: 'KQJ2', D: 'AK3', C: 'Q9' },
    south: { S: '987652', H: '87', D: 'Q74', C: 'K6' },
  },
  {
    description: '2NT: the same six-spade hand responds natural 4S when Texas is disabled; ' +
                 'ordinary 3H Jacoby is suppressed.',
    practiceAuction: ['2NT', 'Pass', '4S', 'Pass', 'Pass'],
    requiredSystem: { jacobyTransfers: true, texasTransfers: false },
    expectedOpeningCalls: [
      { call: '2NT', ruleIds: ['open-2nt-balanced-20-21'] },
    ],
    expectedResponseCalls: [
      { call: '4S', ruleIds: ['respond-to-2nt-w/-4h-4s-natural-game'] },
    ],
    rejectedResponseCalls: ['3H'],
    expectedOpenerRebidCalls: [
      { call: 'Pass', ruleIds: ['opener-rebid-pass-after-nt-natural-major-game'] },
    ],
    north: { S: 'AQ43', H: 'KQJ2', D: 'AK3', C: 'Q9' },
    south: { S: '987652', H: '87', D: 'Q74', C: 'K6' },
  },
  {
    description: '2NT: with 13 balanced HCP, bid 6NT directly. Rare Gerber may also appear, ' +
                 'but is not a general slam try.',
    practiceAuction: ['2NT', 'Pass', '6NT', 'Pass', 'Pass'],
    expectedOpeningCalls: [
      { call: '2NT', ruleIds: ['open-2nt-balanced-20-21'] },
    ],
    expectedResponseCalls: [
      { call: '6NT', ruleIds: ['respond-to-2nt-w/-6nt-13-15-balanced'] },
    ],
    rejectedResponseCalls: ['4NT'],
    expectedOpenerRebidCalls: [
      { call: 'Pass', ruleIds: ['opener-rebid-pass-after-nt-natural-nt-signoff'] },
    ],
    north: { S: 'AQ43', H: 'KQJ2', D: 'AK3', C: 'Q9' },
    south: { S: 'KJ5', H: 'AT7', D: '986', C: 'AJ73' },
  },
  {
    description: '2NT-3C-3D: opener has no four-card major, so deny a major ' +
                 'rather than show a three-card suit.',
    practiceAuction: ['2NT', 'Pass', '3C', 'Pass', '3D'],
    requiredSystem: { stayman: true },
    expectedOpeningCalls: [
      { call: '2NT', ruleIds: ['open-2nt-balanced-20-21'] },
    ],
    expectedResponseCalls: [
      { call: '3C', ruleIds: ['respond-to-2nt-w/-stayman'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '3D', ruleIds: ['opener-rebid-deny-major-after-nt-stayman'] },
    ],
    rejectedOpenerRebidCalls: ['3H', '3S'],
    north: { S: 'AK3', H: 'AQ2', D: 'KJ4', C: 'QJ76' },
    south: { S: 'J86', H: 'T975', D: '752', C: 'K42' },
  },
  {
    description: '2NT-3C-3S: opener has four spades but only three hearts; ' +
                 'the Stayman response must show spades.',
    practiceAuction: ['2NT', 'Pass', '3C', 'Pass', '3S'],
    requiredSystem: { stayman: true },
    expectedOpeningCalls: [
      { call: '2NT', ruleIds: ['open-2nt-balanced-20-21'] },
    ],
    expectedResponseCalls: [
      { call: '3C', ruleIds: ['respond-to-2nt-w/-stayman'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '3S', ruleIds: ['opener-rebid-show-spades-after-nt-stayman'] },
    ],
    rejectedOpenerRebidCalls: ['3D', '3H'],
    north: { S: 'AQ43', H: 'KQJ', D: 'AK83', C: 'Q9' },
    south: { S: 'KJ6', H: 'T975', D: '752', C: '542' },
  },
  {
    description: '2NT 20 HCP: decline the balanced 11-HCP quantitative 4NT with Pass.',
    practiceAuction: ['2NT', 'Pass', '4NT', 'Pass', 'Pass'],
    expectedOpeningCalls: [
      { call: '2NT', ruleIds: ['open-2nt-balanced-20-21'] },
    ],
    expectedResponseCalls: [
      { call: '4NT', ruleIds: ['respond-to-2nt-w/-4nt-11-12-balanced'] },
    ],
    rejectedResponseCalls: ['3NT'],
    expectedOpenerRebidCalls: [
      { call: 'Pass', ruleIds: ['opener-rebid-pass-after-nt-4nt-quantitative-invitation'] },
    ],
    rejectedOpenerRebidCalls: ['6NT'],
    north: { S: 'AK4', H: 'AQ2', D: 'KJ', C: 'QJ753' },
    south: { S: 'QJ2', H: 'KJ5', D: '987', C: 'AT84' },
  },
  {
    description: '2NT 21 HCP: even at the maximum, Pass is possible over quantitative 4NT; 6NT needs favorable trick-taking prospects.',
    practiceAuction: ['2NT', 'Pass', '4NT', 'Pass', 'Pass'],
    expectedOpeningCalls: [
      { call: '2NT', ruleIds: ['open-2nt-balanced-20-21'] },
    ],
    expectedResponseCalls: [
      { call: '4NT', ruleIds: ['respond-to-2nt-w/-4nt-11-12-balanced'] },
    ],
    expectedOpenerRebidCalls: [
      { call: 'Pass', ruleIds: ['opener-rebid-pass-after-nt-4nt-quantitative-invitation'] },
      { call: '6NT', ruleIds: ['opener-rebid-6nt-after-nt-4nt-quantitative-invitation'] },
    ],
    expectedOpenerRebidCallOrder: [['Pass', '6NT']],
    north: { S: 'AK4', H: 'AQ2', D: 'KQ', C: 'QJ753' },
    south: { S: 'QJ2', H: 'KJ5', D: '987', C: 'AT84' },
  },
  {
    description: '2NT: with conventions off, a 5-HCP unbalanced six-club hand has enough ' +
                 'game values to use the ordinary 3NT fallback rather than falling through.',
    practiceAuction: ['2NT', 'Pass', '3NT', 'Pass', 'Pass'],
    requiredSystem: { stayman: false, jacobyTransfers: false },
    expectedOpeningCalls: [
      { call: '2NT', ruleIds: ['open-2nt-balanced-20-21'] },
    ],
    expectedResponseCalls: [
      { call: '3NT', ruleIds: ['respond-to-2nt-w/-3nt-4-10'] },
    ],
    rejectedResponseCalls: ['Pass', '3C'],
    expectedOpenerRebidCalls: [
      { call: 'Pass', ruleIds: ['opener-rebid-pass-after-nt-natural-nt-signoff'] },
    ],
    north: { S: 'KQJ', H: 'AQ2', D: 'KJ4', C: 'A876' },
    south: { S: '85', H: 'T76', D: '52', C: 'KQT953' },
  },
  {
    description: '2NT-3C with Stayman off: a 10-HCP unbalanced six-club hand uses natural ' +
                 'forcing 3C instead of the generic 3NT fallback; opener returns to 3NT.',
    practiceAuction: ['2NT', 'Pass', '3C', 'Pass', '3NT'],
    requiredSystem: { stayman: false },
    expectedOpeningCalls: [
      { call: '2NT', ruleIds: ['open-2nt-balanced-20-21'] },
    ],
    expectedResponseCalls: [
      { call: '3C', ruleIds: ['respond-to-2nt-w/-3c-natural-forcing'] },
    ],
    rejectedResponseCalls: ['3NT'],
    expectedOpenerRebidCalls: [
      { call: '3NT', ruleIds: ['opener-rebid-3nt-after-2nt-natural-3-minor'] },
    ],
    north: { S: 'AK3', H: 'AQ2', D: 'KJ5', C: 'QJ83' },
    south: { S: '82', H: 'J76', D: 'Q4', C: 'AKT765' },
  },
  {
    description: '2NT-3D with Jacoby off: Stayman may remain enabled, but with no four-card ' +
                 'major a 10-HCP unbalanced six-diamond hand can bid natural forcing 3D.',
    practiceAuction: ['2NT', 'Pass', '3D', 'Pass', '3NT'],
    requiredSystem: { stayman: true, jacobyTransfers: false },
    expectedOpeningCalls: [
      { call: '2NT', ruleIds: ['open-2nt-balanced-20-21'] },
    ],
    expectedResponseCalls: [
      { call: '3D', ruleIds: ['respond-to-2nt-w/-3d-natural-forcing'] },
    ],
    rejectedResponseCalls: ['3NT'],
    expectedOpenerRebidCalls: [
      { call: '3NT', ruleIds: ['opener-rebid-3nt-after-2nt-natural-3-minor'] },
    ],
    north: { S: 'AK3', H: 'AQ2', D: 'QJ4', C: 'A873' },
    south: { S: '982', H: '76', D: 'AKT765', C: 'QJ' },
  },
  {
    description: '2NT-3S without Jacoby: responder shows a natural five-card-or-longer major; ' +
                 'opener has three spades and chooses the known major fit in 4S.',
    practiceAuction: ['2NT', 'Pass', '3S', 'Pass', '4S'],
    requiredSystem: { jacobyTransfers: false },
    expectedOpeningCalls: [
      { call: '2NT', ruleIds: ['open-2nt-balanced-20-21'] },
    ],
    expectedResponseCalls: [
      { call: '3S', ruleIds: ['respond-to-2nt-w/-3h-3s-natural-forcing'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '4S', ruleIds: ['opener-rebid-game-in-responder-major-after-nt-natural-3-major'] },
    ],
    rejectedOpenerRebidCalls: ['3NT'],
    north: { S: 'AK3', H: 'AQ2', D: 'KJ4', C: 'QJ76' },
    south: { S: 'QJT86', H: 'K76', D: '852', C: '54' },
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
  { id: 'response-1nt-opening', group: 'Responses to NT opening', label: '1NT opening',
    deals: RESPONSE_AFTER_1NT_OPENING_TEST_DEALS },
  { id: 'response-2nt-opening', group: 'Responses to NT opening', label: '2NT opening',
    deals: RESPONSE_AFTER_2NT_OPENING_TEST_DEALS },
  { id: 'nt-1nt', group: 'Opener rebids', label: '1NT opening - continuations',
    deals: OPENER_REBID_AFTER_1NT_OPENING_TEST_DEALS },
  { id: 'nt-2nt', group: 'Opener rebids', label: '2NT opening - continuations',
    deals: OPENER_REBID_AFTER_2NT_OPENING_TEST_DEALS },
  { id: 'minor-raise', group: 'Opener rebids', label: 'Minor - raise',
    deals: OPENER_REBID_AFTER_MINOR_RAISE_TEST_DEALS },
  { id: 'minor-2nt', group: 'Opener rebids', label: 'Minor - 2NT response',
    deals: OPENER_REBID_AFTER_MINOR_2NT_TEST_DEALS },
  { id: 'minor-3nt', group: 'Opener rebids', label: 'Minor - 3NT response',
    deals: OPENER_REBID_AFTER_MINOR_3NT_TEST_DEALS },
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
  { id: 'major-jacoby-2nt', group: 'Opener rebids', label: 'Major - Jacoby 2NT',
    deals: OPENER_REBID_AFTER_MAJOR_JACOBY_2NT_TEST_DEALS },
  { id: 'major-splinter', group: 'Opener rebids', label: 'Major - splinter',
    deals: OPENER_REBID_AFTER_MAJOR_SPLINTER_TEST_DEALS },
  { id: 'jump-shift', group: 'Opener rebids', label: 'Jump shifts',
    deals: OPENER_REBID_AFTER_JUMP_SHIFT_TEST_DEALS },
  { id: 'major-simple-raise', group: 'Opener rebids', label: 'Major - simple raise',
    deals: OPENER_REBID_AFTER_MAJOR_SIMPLE_RAISE_TEST_DEALS },
  { id: 'major-limit-raise', group: 'Opener rebids', label: 'Major - limit raise',
    deals: OPENER_REBID_AFTER_MAJOR_LIMIT_RAISE_TEST_DEALS },
  { id: 'major-game-response', group: 'Opener rebids', label: 'Major - game response',
    deals: OPENER_REBID_AFTER_MAJOR_GAME_RESPONSE_TEST_DEALS },
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
