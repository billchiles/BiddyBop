/// Deterministic rule-practice deals, grouped in the same order as the executable opener-rebid
/// rule families.  An expected call/rule pairs are assertions of what we should see.
/// 
import type { BiddingSystem, Call } from './bidding-types';
import type { Suit } from './cards';

export interface RuleTestDeal {
  description: string;
  // actual auction (including opponent passes) for manual practice.
  practiceAuction: Call[];
  // An expected call/rule pairs are assertions of what we should see.
  requiredSystem?: Partial<BiddingSystem>;
  expectedOpeningCalls?: RuleTestExpectedCall[];
  expectedResponseCalls?: RuleTestExpectedCall[];
  expectedOpenerRebidCalls?: RuleTestExpectedCall[];
  north: Record<Suit, string>;
  south: Record<Suit, string>;
}

export interface RuleTestExpectedCall {
  call: Call;
  ruleIds: string[];
}

///
//// Opener rebids after a minor opening and 1NT response
///
export const OPENER_REBID_AFTER_MINOR_1NT_TEST_DEALS: RuleTestDeal[] = [
  {
    description: "1C-1NT-Pass: minimum balanced opener with no more descriptive rebid accepts responder's 1NT.",
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
    description: '1D-1NT-2D: 14 HCP / 16 total with six diamonds; repeat the long opening suit descriptively.',
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
    description: '1D-1NT-2C: 15 HCP / 16 total, 5D-4C; show the lower-ranking second suit economically without reversing.',
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
    description: "1D-1NT-2H: 16 HCP / 17 total, 5D-4H; the length point reaches this treatment's reverse threshold.",
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
    description: '1D-1NT-3D: 16 HCP / 18 total with six diamonds; length points reach the 17-18 total-point jump-repeat range.',
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
    description: '1D-1NT-2NT: 18 HCP balanced; this 18-19 notrump rebid range is based on HCP, not length points.',
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
    description: '1D-1NT-3C: 18 HCP / 19 total, 5D-4C; maximum values make the lower second suit a natural jump shift.',
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
    description: '1D-1NT-3NT: 20 HCP, 6-3-2-2; semi-balanced rather than strict balanced, so show the 20-21 range now.',
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
    description: '1D-1NT: 12 HCP / 14 total, 6-3-2-2; both Pass and 2D remain reasonable modeled choices.',
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
    description: '1D-1NT: 20 HCP, 5-4-2-2; both a 2H reverse and 3NT remain reasonable modeled choices.',
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
    description: '1D-1NT-5D: 16 HCP / 19 total with seven diamonds; maximum long-minor values justify bidding game.',
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
    description: '1C-1H-1S: opener has only three clubs; show an economical four-card second suit at the one level.',
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
    north: { S: 'AQJ2', H: 'Q42', D: 'K72', C: 'J85' },
    south: { S: '83', H: 'KJ76', D: 'Q854', C: '963' },
  },
  {
    description: '1C-1H-1NT: 13 HCP balanced, with neither four-card heart support nor another suit available at the one level.',
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
    description: '1C-1H-2H: minimum values with four-card heart support; make the ordinary simple raise.',
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
    description: '1C-1H-2D: 17 HCP / 18 total, 5C-4D; this is a reverse because responder must bid 3C to return to clubs.',
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
    description: '1C-1H-3H: 15 HCP becomes 17 shortage points with two doubletons; jump raise with medium support values.',
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
    description: '1C-1H-2S: 19 HCP / 20 total, 5C-4S; 1S was economical, so 2S is the natural maximum jump shift.',
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
    description: '1C-1H-4H: 17 HCP becomes 19 shortage points with heart support; raise responder to game.',
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
    description: '1C-1H-4D: 16 HCP becomes 19 shortage points with the diamond singleton; both 4H and optional 4D splinter remain candidates.',
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
    description: '1D-1H: 12 HCP / 14 total, 6D-4C; both 2D and economical 2C are reasonable descriptive rebids.',
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
    description: '1C-1H-3C: 16 HCP / 18 total with six clubs; length points reach the medium jump-repeat range.',
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
    description: '1C-1H-2NT: 18 HCP balanced with five clubs; the 18-19 NT rebid is based on HCP, not length points.',
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
    description: '1D-1H-5D: 16 HCP / 19 total with seven diamonds; maximum long-minor values justify bidding game.',
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
    description: '1D-2C-2D Standard: 14 HCP / 15 total, 5D-4H; Standard is forcing only one round, so the minimum hand repeats diamonds rather than reverse.',
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
    north: { S: 'A4', H: 'KJ42', D: 'KQJ92', C: '82' },
    south: { S: 'K72', H: 'Q83', D: 'A5', C: 'Q9653' },
  },
  {
    description: '1D-2C-2H Standard: 18 HCP / 19 total, 5D-4H; extra strength now supports the reverse that the minimum hand could not make.',
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
    description: '1D-2C-2NT Standard: 14 HCP balanced, 4D-4S-3H-2C; show the minimum balanced hand even though that conceals the four-card spade suit.',
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
    description: '1D-2C-3C Standard: 12 HCP / 15 shortage points with three clubs; responder promised 5+, so the eight-card fit is known and both 3C and 2D remain candidates.',
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
    description: '1D-2C Standard: 15 HCP gives 17 total points with six diamonds and 18 shortage points with club support; both 3D and 4C describe the medium hand.',
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
    description: '1D-2C-3NT Standard: 19 HCP balanced, 4D-4S-3H-2C; the strong balanced rebid reaches game without inventing reverse strength or club support.',
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
    description: '1D-2C Standard: 16 HCP becomes 19 total points with seven diamonds and 20 shortage points with club support; both 5D and 5C are modeled game choices.',
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
    description: '1D-2C-2D 2/1: 13 HCP, 5D-4H; with five or more diamonds, repeat diamonds first without implying extra strength.',
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
    description: '1D-2C 2/1: 13 HCP, 4D-4H-4S; with fewer than five diamonds, show a four-card major without reverse strength, hearts up the line before spades.',
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
    description: '1D-2C 2/1: 13 HCP, 4D-4C-3H-2S; 2NT is the usual economical description, while 3C remains available when notrump is unattractive.',
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
    description: '1S-1NT-2C, forcing: the same flat 13-HCP hand cannot pass, so manufacture the three-card club fallback.',
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
    description: '1S-1NT: 11 HCP / 13 total, 6S-4H and Guideline of 20; 2S emphasizes the six-card major while 2H searches for the heart fit.',
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
    description: '1H-1NT-2S: 16 HCP / 17 total, 5H-4S; showing the higher-ranking second suit is a strength-qualified reverse.',
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
    description: '1S-1NT-3S: 16 HCP / 18 total with six spades; medium values move the major-repeat ladder from 2S to 3S.',
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
    description: '1S-1NT-3H: 20 HCP / 21 total, 5S-4H; maximum values turn the natural lower second suit into a jump shift.',
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
    description: '1S-1NT-4S: 16 HCP / 19 total with seven spades; maximum long-major values complete the repeat ladder at game.',
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
export const OPENER_REBID_AFTER_MAJOR_STANDARD_TWO_LEVEL_NEW_SUIT_TEST_DEALS: RuleTestDeal[] = [];

///
//// Opener rebids after a major opening and 2/1 game-forcing new-suit response
///
export const OPENER_REBID_AFTER_MAJOR_TWO_OVER_ONE_NEW_SUIT_TEST_DEALS: RuleTestDeal[] = [];

///
//// Opener rebids after responder's simple raise of a major
///
export const OPENER_REBID_AFTER_MAJOR_SIMPLE_RAISE_TEST_DEALS: RuleTestDeal[] = [];

/// The dropdown uses this registry's order.  All simply concatenates the compatible deals.
export const RULE_TEST_DEAL_BUCKETS = [
  { id: 'minor-1nt', label: 'Minor - 1NT response', deals: OPENER_REBID_AFTER_MINOR_1NT_TEST_DEALS },
  { id: 'minor-one-level-new-suit', label: 'Minor - one-level new suit',
    deals: OPENER_REBID_AFTER_MINOR_ONE_LEVEL_NEW_SUIT_TEST_DEALS },
  { id: 'minor-standard-two-level-new-suit', label: 'Minor - Standard two-level new suit',
    deals: OPENER_REBID_AFTER_MINOR_STANDARD_TWO_LEVEL_NEW_SUIT_TEST_DEALS },
  { id: 'minor-two-over-one-new-suit', label: 'Minor - 2/1 two-level new suit',
    deals: OPENER_REBID_AFTER_MINOR_TWO_OVER_ONE_NEW_SUIT_TEST_DEALS },
  { id: 'major-1nt', label: 'Major - 1NT response', deals: OPENER_REBID_AFTER_MAJOR_1NT_TEST_DEALS },
  { id: 'major-one-level-new-suit', label: 'Major - one-level new suit',
    deals: OPENER_REBID_AFTER_MAJOR_ONE_LEVEL_NEW_SUIT_TEST_DEALS },
  { id: 'major-standard-two-level-new-suit', label: 'Major - Standard two-level new suit',
    deals: OPENER_REBID_AFTER_MAJOR_STANDARD_TWO_LEVEL_NEW_SUIT_TEST_DEALS },
  { id: 'major-two-over-one-new-suit', label: 'Major - 2/1 two-level new suit',
    deals: OPENER_REBID_AFTER_MAJOR_TWO_OVER_ONE_NEW_SUIT_TEST_DEALS },
  { id: 'major-simple-raise', label: 'Major - simple raise',
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
