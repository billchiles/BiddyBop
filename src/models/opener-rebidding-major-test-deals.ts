/// Opener rebidding major test deals, kept separate from the bucket registry.
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
    east: { S: 'AT63', H: '832', D: 'QJT', C: 'A75' },
    west: { S: '94', H: 'KT95', D: 'A964', C: 'K96' },
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
    east: { S: 'AT63', H: '832', D: 'QJT', C: 'A75' },
    west: { S: '94', H: 'KT95', D: 'A964', C: 'K96' },
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
    east: { S: 'T94', H: 'AT', D: 'KJT6', C: 'K763' },
    west: { S: 'J2', H: '9743', D: 'AQ8', C: 'AT95' },
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
    east: { S: 'JT872', H: 'A43', D: 'T9', C: 'A53' },
    west: { S: '5', H: 'T76', D: 'K8642', C: 'KQJ9' },
  },
  {
    description: '1S-1NT-3S: 16 HCP / 18 total with six spades; medium values move the ' +
                 'major-repeat ladder from 2S to 3S.',
    practiceGuidance: [{ auctionIndex: 1, seat: 'E', text: 'East has 10 HCP and six clubs ' +
      'headed by A-K. Some players would overcall 2C, but 12 points including length fall ' +
      'short of this trainer\'s usual 13-point requirement for a natural two-level ' +
      'overcall. Pass is a reasonable conservative choice for this exercise.' }],
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
    east: { S: '5', H: 'T54', D: 'QJ4', C: 'AKT932' },
    west: { S: 'T742', H: 'A963', D: 'KT86', C: '7' },
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
    east: { S: 'T654', H: '972', D: 'A8', C: 'AT93' },
    west: { S: '93', H: 'KT53', D: 'JT63', C: 'Q72' },
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
    east: { S: 'T532', H: '8732', D: 'T', C: 'AK76' },
    west: { S: '94', H: 'T9', D: 'AJ863', C: 'QT93' },
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
    east: { S: 'T42', H: 'T932', D: 'AJ5', C: 'K96' },
    west: { S: '3', H: '8765', D: 'KT94', C: 'AQT7' },
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
    east: { S: '9643', H: 'T93', D: 'AQJ', C: 'A97' },
    west: { S: 'AT', H: 'K8542', D: 'T64', C: 'K65' },
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
    east: { S: 'QT6', H: 'K42', D: 'JT96', C: 'KQ3' },
    west: { S: '953', H: 'T97', D: 'A43', C: 'AJ76' },
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
    east: { S: 'Q3', H: 'A974', D: '9632', C: 'AJ7' },
    west: { S: 'T96', H: 'T2', D: 'AJT4', C: 'KQ63' },
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
    east: { S: 'QT95', H: 'A42', D: '32', C: 'AJ65' },
    west: { S: '63', H: 'T7', D: 'AJT9', C: 'KQ873' },
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
    east: { S: 'AT', H: 'T74', D: 'KT932', C: 'QJ3' },
    west: { S: '9653', H: 'A2', D: 'J64', C: 'A876' },
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
    east: { S: '98', H: 'T42', D: 'JT964', C: 'AK3' },
    west: { S: 'T63', H: 'A97', D: 'A32', C: 'QJ76' },
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
    east: { S: '53', H: 'JT97', D: '9643', C: 'K73' },
    west: { S: 'QT96', H: '42', D: 'AT2', C: 'AJ86' },
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
    east: { S: 'Q653', H: 'T92', D: 'T42', C: 'K63' },
    west: { S: 'T9', H: 'J74', D: 'A63', C: 'QJT87' },
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
    east: { S: '986', H: 'Q92', D: 'A632', C: 'KQ8' },
    west: { S: 'T3', H: 'T74', D: 'JT9', C: 'AJ753' },
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
    east: { S: '96', H: '42', D: 'JT962', C: 'KQJ6' },
    west: { S: 'QT53', H: 'T5', D: 'A73', C: 'A873' },
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
    east: { S: '74', H: 'KT76', D: 'A84', C: 'T963' },
    west: { S: 'QJT63', H: '942', D: 'QJT6', C: '4' },
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
    east: { S: '63', H: 'QT3', D: 'AKT9', C: '9742' },
    west: { S: 'T72', H: 'K6', D: '7654', C: 'AJT8' },
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
    east: { S: 'Q7', H: 'J964', D: '832', C: 'T954' },
    west: { S: 'T942', H: 'K85', D: 'JT6', C: 'AK7' },
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
    east: { S: '863', H: 'A43', D: 'KT765', C: '94' },
    west: { S: 'KJT', H: '762', D: '98432', C: 'Q5' },
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
    east: { S: 'K76', H: '972', D: '73', C: 'KQT98' },
    west: { S: 'T3', H: '85', D: 'JT654', C: 'A752' },
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
    east: { S: 'T7654', H: '943', D: '65', C: 'K83' },
    west: { S: 'KQJ9', H: 'J72', D: '4', C: '97642' },
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
    east: { S: '74', H: 'AT984', D: 'T432', C: '94' },
    west: { S: '9632', H: 'Q62', D: 'J85', C: 'K73' },
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
    east: { S: '42', H: '32', D: 'KJ865', C: 'KQ82' },
    west: { S: '65', H: 'T6', D: 'T974', C: 'AT973' },
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
    east: { S: 'AT64', H: '964', D: 'A642', C: 'JT' },
    west: { S: 'QJ85', H: 'T32', D: 'Q985', C: 'Q2' },
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
    east: { S: '763', H: 'Q94', D: 'AQ643', C: 'J5' },
    west: { S: 'K42', H: '6', D: 'T98', C: 'T87632' },
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
    east: { S: 'Q74', H: '63', D: '9752', C: 'J753' },
    west: { S: 'T32', H: '984', D: 'AQJ4', C: 'A86' },
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
    east: { S: 'J975', H: 'J32', D: 'J43', C: 'K74' },
    west: { S: '63', H: 'T96', D: 'AT75', C: 'AQJ2' },
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
    north: { S: 'QJT4', H: 'A73', D: '985', C: 'KQ4' },
    south: { S: 'A62', H: 'KQT85', D: 'KQ7', C: 'A9' },
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
    north: { S: '5', H: 'AKQ865', D: '984', C: 'K72' },
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
    north: { S: 'KQJ4', H: '7', D: 'KJT85', C: 'Q72' },
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
    north: { S: 'K7', H: 'AJ985', D: 'K84', C: 'J92' },
    south: { S: 'AQT98', H: 'K6', D: 'AQ7', C: 'K83' },
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
    north: { S: 'AJT72', H: '53', D: 'J92', C: 'AQ3' },
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
    north: { S: 'A842', H: 'KQ2', D: 'T', C: 'QJ853' },
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
