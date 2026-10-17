/// Opener rebidding minor test deals, kept separate from the bucket registry.
///
/// This file's deals exercise sequences of opening, responding, and opener-rebidding decisions
/// together.  Grouping these longer sequences under opener rebids lets users practice the auction
/// across multiple participating seats rather than practicing each bid in isolation.
///

/// `import type` is erased by TypeScript when JavaScript is emitted. Although
/// test-deals-registry.ts imports these values, this type import creates no runtime cycle.
///
import type { RuleTestDeal } from './test-deals-registry';

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
    east: { S: 'J985', H: 'K763', D: 'QT2', C: 'A2' },
    west: { S: 'T43', H: 'AT9', D: 'A854', C: 'T83' },
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
    east: { S: 'JT83', H: 'A762', D: '65', C: 'A72' },
    west: { S: 'K95', H: 'QT93', D: '84', C: 'KJT3' },
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
    east: { S: 'K852', H: 'A743', D: 'T85', C: '87' },
    west: { S: 'JT93', H: 'QT96', D: '64', C: 'AK3' },
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
    east: { S: 'J852', H: '973', D: 'A4', C: 'KT73' },
    west: { S: 'T943', H: 'KT6', D: 'T86', C: 'AJ2' },
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
    east: { S: 'JT84', H: 'AT76', D: '54', C: 'KJT' },
    west: { S: '9532', H: 'K932', D: 'T6', C: 'A73' },
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
    east: { S: 'JT93', H: '32', D: 'AT854', C: 'A2' },
    west: { S: '854', H: 'AT976', D: '6', C: 'JT73' },
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
    east: { S: 'J54', H: 'K7432', D: '84', C: 'T32' },
    west: { S: 'T983', H: 'AT96', D: 'QT9', C: 'A7' },
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
    east: { S: 'JT53', H: 'AT63', D: 'T6', C: 'AT2' },
    west: { S: '9842', H: '9742', D: '54', C: 'K73' },
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
    east: { S: 'K983', H: 'T9732', D: 'AJ', C: 'K7' },
    west: { S: 'JT5', H: 'AQ6', D: '65', C: 'AT832' },
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
    east: { S: 'T9543', H: 'A76', D: '6', C: 'K972' },
    west: { S: 'QJ8', H: 'T43', D: 'T852', C: 'AT3' },
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
    east: { S: 'JT53', H: 'T964', D: 'T5', C: 'AJ7' },
    west: { S: '984', H: 'AK73', D: '2', C: 'QT832' },
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
    east: { S: 'AT95', H: 'JT94', D: 'T8', C: 'A76' },
    west: { S: 'Q732', H: 'AK85', D: '653', C: 'J2' },
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
    east: { S: '953', H: 'QJ95', D: 'AQ83', C: '32' },
    west: { S: 'KT6', H: 'AT63', D: 'JT954', C: '6' },
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
    east: { S: 'KT74', H: 'A653', D: 'T97', C: 'T4' },
    west: { S: 'J92', H: 'QJT8', D: '52', C: 'A963' },
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
    south: { S: 'J82', H: 'Q74', D: 'A2', C: 'Q7532' },
    east: { S: 'T95', H: 'AJ98', D: 'Q9543', C: 'T' },
    west: { S: 'K763', H: 'T652', D: 'KJT87', C: '' },
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
    east: { S: 'AJ53', H: '93', D: 'JT643', C: '62' },
    west: { S: 'QT7', H: 'KT654', D: 'Q85', C: 'A3' },
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
    north: { S: 'K84', H: 'A72', D: 'QJ92', C: 'A85' },
    south: { S: 'Q62', H: 'KJ4', D: 'K8743', C: 'Q9' },
    east: { S: 'AJ97', H: '986', D: 'AT5', C: 'J73' },
    west: { S: 'T53', H: 'QT53', D: '6', C: 'KT642' },
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
    south: { S: 'T82', H: 'Q74', D: 'QT753', C: 'AK' },
    east: { S: 'J73', H: 'A986', D: '', C: 'J97543' },
    west: { S: 'K965', H: 'JT52', D: '2', C: 'QT82' },
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
