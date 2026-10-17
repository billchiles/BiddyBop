/// Selected natural responder rebids after a minimum balanced 1NT rebid.
import type { RuleTestDeal } from './test-deals-registry';

export const RESPONDER_REBID_AFTER_MINIMUM_1NT_TEST_DEALS: RuleTestDeal[] = [
  {
    description: 'After 1C-1H-1NT, weak balanced responder accepts notrump.',
    practiceAuction: ['1C', 'Pass', '1H', 'Pass', '1NT', 'Pass', 'Pass'],
    north: { S: 'AK2', H: 'Q42', D: 'K72', C: 'J852' },
    south: { S: '83', H: 'KJ76', D: 'Q854', C: '963' },
    east: { S: 'T7654', H: 'T83', D: 'AT', C: 'AQ7' },
    west: { S: 'QJ9', H: 'A95', D: 'J963', C: 'KT4' },
    expectedResponderRebidCalls: [{ call: 'Pass', ruleIds: [
      'responder-rebid-pass-after-minimum-1nt',
    ] }],
    rejectedResponderRebidCalls: ['2H', '2NT'],
  },
  {
    description: 'With six hearts and low values, sign off in 2H rather than 1NT.',
    practiceAuction: ['1C', 'Pass', '1H', 'Pass', '1NT', 'Pass', '2H'],
    north: { S: 'AK2', H: 'Q42', D: 'K72', C: 'J852' },
    south: { S: 'Q5', H: 'KJT987', D: 'J83', C: 'T7' },
    east: { S: 'JT73', H: '65', D: 'A96', C: 'KQ63' },
    west: { S: '9864', H: 'A3', D: 'QT54', C: 'A94' },
    expectedResponderRebidCalls: [{ call: '2H', ruleIds: [
      'responder-rebid-two-major-after-minimum-1nt',
    ] }],
    rejectedResponderRebidCalls: ['Pass', '3H'],
  },
  {
    description: 'Ten HCP with six hearts remains a nonforcing 2H signoff, not an invitation.',
    practiceAuction: ['1C', 'Pass', '1H', 'Pass', '1NT', 'Pass', '2H'],
    north: { S: 'AK2', H: 'Q42', D: 'K72', C: 'J852' },
    south: { S: 'QJ', H: 'KJT987', D: 'QJ3', C: 'T7' },
    east: { S: '875', H: 'A6', D: '9865', C: 'KQ63' },
    west: { S: 'T9643', H: '53', D: 'AT4', C: 'A94' },
    expectedResponderRebidCalls: [{ call: '2H', ruleIds: [
      'responder-rebid-two-major-after-minimum-1nt',
    ] }],
    rejectedResponderRebidCalls: ['3H', '2NT'],
  },
  {
    description: 'Balanced 11 HCP invites notrump game after opener shows 12-14.',
    practiceGuidance: [{ auctionIndex: 3, seat: 'W', text: 'West has 11 HCP and a ' +
      'five-card diamond suit headed by A-T. Competing with 2D is a judgment choice, ' +
      'but the hand falls below the trainer\'s usual two-level overcall strength. ' +
      'This practice auction records Pass.' }],
    practiceAuction: ['1C', 'Pass', '1H', 'Pass', '1NT', 'Pass', '2NT'],
    north: { S: 'AK2', H: 'Q42', D: 'K72', C: 'J852' },
    south: { S: '963', H: 'AJT9', D: 'QJ3', C: 'K64' },
    east: { S: 'JT754', H: '8653', D: '85', C: 'AT' },
    west: { S: 'Q8', H: 'K7', D: 'AT964', C: 'Q973' },
    expectedResponderRebidCalls: [{ call: '2NT', ruleIds: [
      'responder-rebid-2nt-after-minimum-1nt',
    ] }],
    rejectedResponderRebidCalls: ['Pass', '3NT'],
  },
  {
    description: 'Six spades and invitational values invite a major game at 3S.',
    practiceAuction: ['1H', 'Pass', '1S', 'Pass', '1NT', 'Pass', '3S'],
    north: { S: 'A82', H: 'AQJ85', D: 'K72', C: '85' },
    south: { S: 'KQJT97', H: 'K3', D: 'Q93', C: 'J7' },
    east: { S: '63', H: 'T74', D: 'A65', C: 'K9643' },
    west: { S: '54', H: '962', D: 'JT84', C: 'AQT2' },
    expectedResponderRebidCalls: [{ call: '3S', ruleIds: [
      'responder-rebid-three-major-after-minimum-1nt',
    ] }],
    rejectedResponderRebidCalls: ['2S', '4S'],
  },
  {
    description: 'Balanced 16 HCP still places the contract in 3NT opposite a 12-14 rebid.',
    practiceAuction: ['1C', 'Pass', '1H', 'Pass', '1NT', 'Pass', '3NT'],
    north: { S: 'AK2', H: 'Q42', D: 'K72', C: 'J852' },
    south: { S: 'Q63', H: 'AKJT', D: 'QJ3', C: 'K64' },
    east: { S: '54', H: '9763', D: 'AT965', C: 'T3' },
    west: { S: 'JT987', H: '85', D: '84', C: 'AQ97' },
    expectedResponderRebidCalls: [{ call: '3NT', ruleIds: [
      'responder-rebid-3nt-after-minimum-1nt',
    ] }],
    rejectedResponderRebidCalls: ['2NT', '4H'],
  },
  {
    description: 'A six-card spade suit and game strength favor 4S over 3NT.',
    practiceAuction: ['1H', 'Pass', '1S', 'Pass', '1NT', 'Pass', '4S'],
    north: { S: 'A82', H: 'AQJ85', D: 'K72', C: '85' },
    south: { S: 'KQJT97', H: 'K3', D: 'A93', C: 'J7' },
    east: { S: '4', H: 'T64', D: 'JT8', C: 'KQT932' },
    west: { S: '653', H: '972', D: 'Q654', C: 'A64' },
    expectedResponderRebidCalls: [{ call: '4S', ruleIds: [
      'responder-rebid-four-major-after-minimum-1nt',
    ] }],
    rejectedResponderRebidCalls: ['3S', '3NT'],
  },
];

//// After opener raises responder's one-level major
export const RESPONDER_REBID_AFTER_MAJOR_RAISE_TEST_DEALS: RuleTestDeal[] = [
  {
    description: 'A minimum heart responder stops after opener raises to 2H.',
    practiceAuction: ['1C', 'Pass', '1H', 'Pass', '2H', 'Pass', 'Pass'],
    north: { S: 'KQ3', H: 'A874', D: 'Q5', C: 'K973' },
    south: { S: 'J84', H: 'KQ62', D: 'T93', C: 'T84' },
    east: { S: 'A76', H: 'T53', D: 'K876', C: 'QJ2' },
    west: { S: 'T952', H: 'J9', D: 'AJ42', C: 'A65' },
    expectedResponderRebidCalls: [{ call: 'Pass', ruleIds: [
      'responder-rebid-pass-after-simple-major-raise',
    ] }],
    rejectedResponderRebidCalls: ['3H', '4H', '3S'],
  },
  {
    description: 'Ten support points after a simple heart raise still favor partscore.',
    practiceAuction: ['1C', 'Pass', '1H', 'Pass', '2H', 'Pass', 'Pass'],
    north: { S: 'KQ3', H: 'A874', D: 'Q5', C: 'KT73' },
    south: { S: 'J84', H: 'KQ62', D: 'T93', C: 'A84' },
    east: { S: 'A976', H: '53', D: 'J7642', C: 'QJ' },
    west: { S: 'T52', H: 'JT9', D: 'AK8', C: '9652' },
    expectedResponderRebidCalls: [{ call: 'Pass', ruleIds: [
      'responder-rebid-pass-after-simple-major-raise',
    ] }],
    rejectedResponderRebidCalls: ['3H', '4H'],
  },
  {
    description: 'Responder with an established heart fit and invitational values bids 3H.',
    practiceAuction: ['1C', 'Pass', '1H', 'Pass', '2H', 'Pass', '3H'],
    north: { S: 'KQ3', H: 'A874', D: 'Q5', C: 'K873' },
    south: { S: 'A8', H: 'KQ62', D: 'JT93', C: '964' },
    east: { S: '542', H: 'J53', D: 'K764', C: 'AJT' },
    west: { S: 'JT976', H: 'T9', D: 'A82', C: 'Q52' },
    expectedResponderRebidCalls: [{ call: '3H', ruleIds: [
      'responder-rebid-invite-after-simple-major-raise',
    ] }],
    rejectedResponderRebidCalls: ['Pass', '4H', '3S'],
  },
  {
    description: 'Game values and a confirmed heart fit justify 4H after a simple raise.',
    practiceAuction: ['1C', 'Pass', '1H', 'Pass', '2H', 'Pass', '4H'],
    north: { S: 'KQ3', H: 'A874', D: 'Q5', C: 'K732' },
    south: { S: 'A8', H: 'KQ62', D: 'AJ93', C: '964' },
    east: { S: 'JT742', H: '95', D: 'T7', C: 'AT85' },
    west: { S: '965', H: 'JT3', D: 'K8642', C: 'QJ' },
    expectedResponderRebidCalls: [{ call: '4H', ruleIds: [
      'responder-rebid-game-after-simple-major-raise',
    ] }],
    rejectedResponderRebidCalls: ['Pass', '3H', '4S'],
  },
  {
    description: 'Minimum responder declines opener\'s 3S invitation.',
    practiceAuction: ['1C', 'Pass', '1S', 'Pass', '3S', 'Pass', 'Pass'],
    north: { S: 'AJ84', H: 'Q5', D: 'K3', C: 'AQ753' },
    south: { S: 'KQ62', H: 'T83', D: 'T82', C: 'J94' },
    east: { S: 'T95', H: 'A764', D: 'AQ97', C: '62' },
    west: { S: '73', H: 'KJ92', D: 'J654', C: 'KT8' },
    expectedResponderRebidCalls: [{ call: 'Pass', ruleIds: [
      'responder-rebid-pass-after-jump-major-raise',
    ] }],
    rejectedResponderRebidCalls: ['4S', '4H'],
  },
  {
    description: 'After 1H-1S-3S, responder accepts the game invitation with 8 points.',
    practiceAuction: ['1H', 'Pass', '1S', 'Pass', '3S', 'Pass', '4S'],
    north: { S: 'AJ84', H: 'QJ875', D: 'KJ', C: 'A3' },
    south: { S: 'KQ62', H: 'K63', D: 'T82', C: 'T94' },
    east: { S: '7', H: 'AT2', D: 'Q753', C: 'QJ876' },
    west: { S: 'T953', H: '94', D: 'A964', C: 'K52' },
    expectedResponderRebidCalls: [{ call: '4S', ruleIds: [
      'responder-rebid-game-after-jump-major-raise',
    ] }],
    rejectedResponderRebidCalls: ['Pass', '4H'],
  },
  {
    description: 'Responder accepts opener\'s direct 4H signoff with ordinary values.',
    practiceAuction: ['1D', 'Pass', '1H', 'Pass', '4H', 'Pass', 'Pass'],
    north: { S: 'AQ3', H: 'AK84', D: 'AJ73', C: 'Q5' },
    south: { S: 'JT9', H: 'Q762', D: '842', C: 'K83' },
    east: { S: '654', H: '9', D: 'Q965', C: 'AJT64' },
    west: { S: 'K872', H: 'JT53', D: 'KT', C: '972' },
    expectedResponderRebidCalls: [{ call: 'Pass', ruleIds: [
      'responder-rebid-pass-after-game-major-raise',
    ] }],
    rejectedResponderRebidCalls: ['4S', '5H'],
  },
];

//// After opener repeats six or more hearts following a one-level spade response
export const RESPONDER_REBID_AFTER_REPEATED_HEARTS_TEST_DEALS: RuleTestDeal[] = [
  {
    description: 'A minimum responder with four spades accepts opener\'s six hearts.',
    practiceAuction: ['1H', 'Pass', '1S', 'Pass', '2H', 'Pass', 'Pass'],
    north: { S: 'Q8', H: 'AKJT83', D: 'K74', C: '65' },
    south: { S: 'KJ74', H: 'Q5', D: 'J92', C: 'T984' },
    east: { S: 'A92', H: '942', D: 'T63', C: 'KQJ2' },
    west: { S: 'T653', H: '76', D: 'AQ85', C: 'A73' },
    expectedResponderRebidCalls: [{ call: 'Pass', ruleIds: [
      'responder-rebid-pass-after-minimum-suit-repeat',
    ] }],
    rejectedResponderRebidCalls: ['2S', '2NT', '4H'],
  },
  {
    description: 'Six spades and minimum values favor a nonforcing 2S signoff.',
    practiceAuction: ['1H', 'Pass', '1S', 'Pass', '2H', 'Pass', '2S'],
    north: { S: 'Q8', H: 'AKJT83', D: 'K74', C: '65' },
    south: { S: 'KJT965', H: 'Q5', D: 'Q92', C: 'T4' },
    east: { S: '72', H: '97', D: 'J865', C: 'AK973' },
    west: { S: 'A43', H: '642', D: 'AT3', C: 'QJ82' },
    expectedResponderRebidCalls: [{ call: '2S', ruleIds: [
      'responder-rebid-two-original-suit-after-minimum-repeat',
    ] }],
    rejectedResponderRebidCalls: ['Pass', '3S', '4S'],
  },
  {
    description: 'Balanced invitation in 2NT with a heart-fit invitation also possible.',
    practiceAuction: ['1H', 'Pass', '1S', 'Pass', '2H', 'Pass', '2NT'],
    north: { S: 'Q8', H: 'AKJT83', D: 'K74', C: '65' },
    south: { S: 'AK64', H: 'Q5', D: 'Q92', C: 'T983' },
    east: { S: 'T32', H: '964', D: 'AJT6', C: 'A74' },
    west: { S: 'J975', H: '72', D: '853', C: 'KQJ2' },
    expectedResponderRebidCalls: [
      { call: '2NT', ruleIds: ['responder-rebid-2nt-after-minimum-suit-repeat'] },
      { call: '3H', ruleIds: ['responder-rebid-three-hearts-after-repeated-hearts'] },
    ],
    rejectedResponderRebidCalls: ['3S', '3NT'],
  },
  {
    description: 'Invite with six spades while recognizing the alternative heart invitation.',
    practiceAuction: ['1H', 'Pass', '1S', 'Pass', '2H', 'Pass', '3S'],
    north: { S: 'Q8', H: 'AKJT83', D: 'K74', C: '65' },
    south: { S: 'KJT964', H: 'Q5', D: 'J92', C: 'K4' },
    east: { S: '73', H: '642', D: 'QT83', C: 'AQJ7' },
    west: { S: 'A52', H: '97', D: 'A65', C: 'T9832' },
    expectedResponderRebidCalls: [
      { call: '3S', ruleIds: ['responder-rebid-three-original-suit-after-minimum-repeat'] },
      { call: '3H', ruleIds: ['responder-rebid-three-hearts-after-repeated-hearts'] },
    ],
    rejectedResponderRebidCalls: ['2S', '4S'],
  },
  {
    description: 'Balanced game values allow 3NT, while the eight-card heart fit is preferred.',
    practiceGuidance: [{ auctionIndex: 6, seat: 'S', text: '3NT is a reasonable ' +
      'game choice with balanced values, but opener has shown six hearts and ' +
      'responder holds two, giving an eight-card heart fit. 4H is generally ' +
      'preferred; this deal follows the modeled 3NT alternative.' }],
    practiceAuction: ['1H', 'Pass', '1S', 'Pass', '2H', 'Pass', '3NT'],
    north: { S: 'Q8', H: 'AKJT83', D: 'K74', C: '65' },
    south: { S: 'AK64', H: 'Q5', D: 'AQ2', C: 'T983' },
    east: { S: '9752', H: '6', D: 'T863', C: 'KQJ2' },
    west: { S: 'JT3', H: '9742', D: 'J95', C: 'A74' },
    expectedResponderRebidCalls: [
      { call: '3NT', ruleIds: ['responder-rebid-3nt-after-minimum-suit-repeat'] },
      { call: '4H', ruleIds: ['responder-rebid-four-hearts-after-repeated-hearts'] },
    ],
    rejectedResponderRebidCalls: ['2NT', '4S'],
  },
  {
    description: 'With three hearts and game values, responder chooses the known major fit.',
    practiceAuction: ['1H', 'Pass', '1S', 'Pass', '2H', 'Pass', '4H'],
    north: { S: 'Q8', H: 'AKJT83', D: 'K74', C: '65' },
    south: { S: 'KJ96', H: 'Q52', D: 'AQ2', C: 'K43' },
    east: { S: 'A73', H: '76', D: 'T986', C: 'A972' },
    west: { S: 'T542', H: '94', D: 'J53', C: 'QJT8' },
    expectedResponderRebidCalls: [{ call: '4H', ruleIds: [
      'responder-rebid-four-hearts-after-repeated-hearts',
    ] }],
    rejectedResponderRebidCalls: ['3H', '3NT', '4S'],
  },
  {
    description: 'Seven strong spades support natural spade game without promised support.',
    practiceAuction: ['1H', 'Pass', '1S', 'Pass', '2H', 'Pass', '4S'],
    north: { S: 'Q8', H: 'AKJT83', D: 'K74', C: '65' },
    south: { S: 'AKJ9764', H: 'Q', D: 'QJ2', C: 'T4' },
    east: { S: '532', H: '952', D: 'AT9', C: 'AQ32' },
    west: { S: 'T', H: '764', D: '8653', C: 'KJ987' },
    expectedResponderRebidCalls: [{ call: '4S', ruleIds: [
      'responder-rebid-four-spades-after-repeated-hearts',
    ] }],
    rejectedResponderRebidCalls: ['3S', '3NT', '4H'],
  },
];

//// Natural responder continuations after opener repeats a minor (normally six, rarely five)
export const RESPONDER_REBID_AFTER_REPEATED_MINOR_TEST_DEALS: RuleTestDeal[] = [
  {
    description: 'Minimum responder has a guaranteed eight-card fit opposite a possible five-card diamond repeat.',
    practiceAuction: ['1D', 'Pass', '1S', 'Pass', '2D', 'Pass', 'Pass'],
    north: { S: 'A2', H: 'AJ5', D: 'AJT986', C: '82' },
    south: { S: 'KJ76', H: 'Q72', D: 'Q43', C: 'T94' },
    east: { S: 'T943', H: 'K6', D: '752', C: 'AJ73' },
    west: { S: 'Q85', H: 'T9843', D: 'K', C: 'KQ65' },
    expectedResponderRebidCalls: [{ call: 'Pass', ruleIds: [
      'responder-rebid-pass-after-minimum-suit-repeat',
    ] }],
    rejectedResponderRebidCalls: ['2S', '2NT', '3S'],
  },
  {
    description: 'A minimum responder repeats a six-card heart suit after opener rebids clubs.',
    practiceAuction: ['1C', 'Pass', '1H', 'Pass', '2C', 'Pass', '2H'],
    north: { S: 'Q2', H: 'J5', D: 'K83', C: 'AKT976' },
    south: { S: 'J8', H: 'KQT986', D: 'Q92', C: '43' },
    east: { S: 'T9765', H: 'A43', D: 'A54', C: 'Q2' },
    west: { S: 'AK43', H: '72', D: 'JT76', C: 'J85' },
    expectedResponderRebidCalls: [{ call: '2H', ruleIds: [
      'responder-rebid-two-original-suit-after-minimum-repeat',
    ] }],
    rejectedResponderRebidCalls: ['Pass', '3H'],
  },
  {
    description: 'Balanced 11 HCP invites notrump after opener repeats six clubs.',
    practiceAuction: ['1C', 'Pass', '1D', 'Pass', '2C', 'Pass', '2NT'],
    north: { S: 'AQ2', H: 'J5', D: 'K8', C: 'KJT986' },
    south: { S: 'K64', H: 'KQ3', D: 'QJT5', C: '732' },
    east: { S: 'JT75', H: 'T8', D: 'A732', C: 'AQ5' },
    west: { S: '983', H: 'A97642', D: '964', C: '4' },
    expectedResponderRebidCalls: [{ call: '2NT', ruleIds: [
      'responder-rebid-2nt-after-minimum-suit-repeat',
    ] }],
    rejectedResponderRebidCalls: ['Pass', '3NT'],
  },
  {
    description: 'A six-card diamond response with 11 length points invites in diamonds.',
    practiceAuction: ['1C', 'Pass', '1D', 'Pass', '2C', 'Pass', '3D'],
    north: { S: 'A52', H: 'J5', D: 'Q2', C: 'KJT986' },
    south: { S: 'K4', H: 'Q3', D: 'KJT987', C: '753' },
    east: { S: 'QT76', H: 'K7642', D: '53', C: 'A2' },
    west: { S: 'J983', H: 'AT98', D: 'A64', C: 'Q4' },
    expectedResponderRebidCalls: [{ call: '3D', ruleIds: [
      'responder-rebid-three-original-suit-after-minimum-repeat',
    ] }],
    rejectedResponderRebidCalls: ['2D', '2NT'],
  },
  {
    description: 'Balanced game values select 3NT after a minimum diamond repetition.',
    practiceAuction: ['1D', 'Pass', '1H', 'Pass', '2D', 'Pass', '3NT'],
    north: { S: 'K2', H: 'Q5', D: 'AKJT96', C: 'T82' },
    south: { S: 'AQ4', H: 'KJ74', D: 'Q3', C: 'KJ73' },
    east: { S: 'T73', H: '9632', D: '4', C: 'A9654' },
    west: { S: 'J9865', H: 'AT8', D: '8752', C: 'Q' },
    expectedResponderRebidCalls: [{ call: '3NT', ruleIds: [
      'responder-rebid-3nt-after-minimum-suit-repeat',
    ] }],
    rejectedResponderRebidCalls: ['2NT', '3H'],
  },
];

//// Natural responder decisions after opener shows an economical second suit
export const RESPONDER_REBID_AFTER_ECONOMICAL_SECOND_SUIT_TEST_DEALS: RuleTestDeal[] = [
  {
    description: '1C-1H-1S: four-four spade fit permits a minimum responder to raise to 2S.',
    practiceAuction: ['1C', 'Pass', '1H', 'Pass', '1S', 'Pass', '2S'],
    north: { S: 'AQJ2', H: 'Q42', D: 'K72', C: 'J85' },
    south: { S: 'KT98', H: 'KJ76', D: 'Q85', C: '96' },
    east: { S: '753', H: 'A5', D: 'JT94', C: 'AT73' },
    west: { S: '64', H: 'T983', D: 'A63', C: 'KQ42' },
    expectedResponderRebidCalls: [{ call: '2S', ruleIds: [
      'responder-rebid-economical-delayed-major-partscore',
    ] }],
    rejectedResponderRebidCalls: ['4S', '2NT'],
  },
  {
    description: 'After the delayed spade fit, 11 support points invite game.',
    practiceAuction: ['1C', 'Pass', '1H', 'Pass', '1S', 'Pass', '3S'],
    north: { S: 'AQJ2', H: 'Q42', D: 'K72', C: 'J85' },
    south: { S: 'KT98', H: 'AJ76', D: 'Q84', C: '93' },
    east: { S: '743', H: '985', D: 'T93', C: 'AKQ6' },
    west: { S: '65', H: 'KT3', D: 'AJ65', C: 'T742' },
    expectedResponderRebidCalls: [{ call: '3S', ruleIds: [
      'responder-rebid-economical-delayed-major-invite',
    ] }],
    rejectedResponderRebidCalls: ['4S'],
  },
  {
    description: 'After the delayed spade fit, game values choose 4S.',
    practiceAuction: ['1C', 'Pass', '1H', 'Pass', '1S', 'Pass', '4S'],
    north: { S: 'AQJ2', H: 'Q42', D: 'K72', C: 'J85' },
    south: { S: 'KT98', H: 'AK76', D: 'QJ4', C: '93' },
    east: { S: '63', H: 'JT85', D: 'T53', C: 'A642' },
    west: { S: '754', H: '93', D: 'A986', C: 'KQT7' },
    expectedResponderRebidCalls: [{ call: '4S', ruleIds: [
      'responder-rebid-economical-delayed-major-game',
    ] }],
    rejectedResponderRebidCalls: ['2S', '3S'],
  },
  {
    description: '1H-1S-2C: weak responder prefers opener’s five-card hearts with three hearts.',
    practiceAuction: ['1H', 'Pass', '1S', 'Pass', '2C', 'Pass', '2H'],
    north: { S: '72', H: 'AKQ85', D: 'K3', C: 'Q964' },
    south: { S: 'KJ96', H: 'J74', D: 'Q85', C: '872' },
    east: { S: 'A43', H: 'T92', D: 'JT764', C: 'AJ' },
    west: { S: 'QT85', H: '63', D: 'A92', C: 'KT53' },
    expectedResponderRebidCalls: [{ call: '2H', ruleIds: [
      'responder-rebid-economical-prefer-opening',
    ] }],
    rejectedResponderRebidCalls: ['Pass', '3H', '2NT'],
  },
  {
    description: '1H-1S-2C: weak responder with four clubs accepts opener’s second suit.',
    practiceAuction: ['1H', 'Pass', '1S', 'Pass', '2C', 'Pass', 'Pass'],
    north: { S: '72', H: 'AKQ85', D: 'K3', C: 'Q964' },
    south: { S: 'KJ95', H: '74', D: 'Q85', C: 'K873' },
    east: { S: 'A43', H: '62', D: 'JT964', C: 'AT5' },
    west: { S: 'QT86', H: 'JT93', D: 'A72', C: 'J2' },
    expectedResponderRebidCalls: [{ call: 'Pass', ruleIds: [
      'responder-rebid-economical-pass-second',
    ] }],
    rejectedResponderRebidCalls: ['2NT'],
  },
  {
    description: '1D-1S-2C: balanced ten HCP can invite opposite opener’s wider 12-18 range.',
    practiceAuction: ['1D', 'Pass', '1S', 'Pass', '2C', 'Pass', '2NT'],
    north: { S: '72', H: 'K3', D: 'KQJT9', C: 'AQ76' },
    south: { S: 'AK86', H: 'Q84', D: '852', C: 'J32' },
    east: { S: 'JT5', H: 'T652', D: 'A73', C: '854' },
    west: { S: 'Q943', H: 'AJ97', D: '64', C: 'KT9' },
    expectedResponderRebidCalls: [{ call: '2NT', ruleIds: [
      'responder-rebid-economical-invite-notrump',
    ] }],
    rejectedResponderRebidCalls: ['3NT'],
  },
  {
    description: '1D-1S-2C: game-going balanced hand with a heart stopper chooses 3NT.',
    practiceAuction: ['1D', 'Pass', '1S', 'Pass', '2C', 'Pass', '3NT'],
    north: { S: '72', H: 'K3', D: 'KQJT9', C: 'AQ76' },
    south: { S: 'KJ86', H: 'AQ4', D: '852', C: 'K32' },
    east: { S: 'AQ', H: 'J852', D: '743', C: 'J854' },
    west: { S: 'T9543', H: 'T976', D: 'A6', C: 'T9' },
    expectedResponderRebidCalls: [{ call: '3NT', ruleIds: [
      'responder-rebid-economical-game-notrump',
    ] }],
    rejectedResponderRebidCalls: ['2NT'],
  },
  {
    description: '1H-1S-2C: invitational responder can raise opener’s four-card club suit.',
    practiceAuction: ['1H', 'Pass', '1S', 'Pass', '2C', 'Pass', '3C'],
    north: { S: '72', H: 'AKQ85', D: 'K3', C: 'Q964' },
    south: { S: 'KJ98', H: '74', D: 'Q85', C: 'KJ83' },
    east: { S: 'AQ3', H: 'JT96', D: 'J62', C: 'T52' },
    west: { S: 'T654', H: '32', D: 'AT974', C: 'A7' },
    expectedResponderRebidCalls: [{ call: '3C', ruleIds: [
      'responder-rebid-economical-invite-second',
    ] }],
  },
  {
    description: '1H-1S-2C: invitational responder with three hearts can invite opener in 3H.',
    practiceAuction: ['1H', 'Pass', '1S', 'Pass', '2C', 'Pass', '3H'],
    north: { S: '72', H: 'AKQ85', D: 'K3', C: 'Q964' },
    south: { S: 'KJ98', H: 'J74', D: 'Q85', C: 'K83' },
    east: { S: 'AQ6', H: '632', D: '976', C: 'AJT7' },
    west: { S: 'T543', H: 'T9', D: 'AJT42', C: '52' },
    expectedResponderRebidCalls: [{ call: '3H', ruleIds: [
      'responder-rebid-economical-invite-opening',
    ] }],
  },
];

//// Responder after opener reverses or makes a strong natural jump shift
export const RESPONDER_REBID_AFTER_STRONG_SECOND_SUIT_TEST_DEALS: RuleTestDeal[] = [
  {
    description: "After a reverse, support for opener's new major and game values favor 4H.",
    practiceAuction: ['1C', 'Pass', '1S', 'Pass', '2H', 'Pass', '4H'],
    north: { S: '8', H: 'AQJ4', D: 'K93', C: 'AKQ76' },
    south: { S: 'KJ974', H: 'K865', D: 'J72', C: '9' },
    east: { S: 'AT63', H: 'T7', D: '84', C: '85432' },
    west: { S: 'Q52', H: '932', D: 'AQT65', C: 'JT' },
    expectedResponderRebidCalls: [{ call: '4H', ruleIds: [
      'responder-rebid-strong-second-suit-major-game',
    ] }],
    rejectedResponderRebidCalls: ['Pass', '2NT'],
  },
  {
    description: 'Balanced game values and an unbid-club stopper select 3NT after a reverse.',
    practiceAuction: ['1D', 'Pass', '1S', 'Pass', '2H', 'Pass', '3NT'],
    north: { S: '8', H: 'AKJ4', D: 'AKQ76', C: 'T93' },
    south: { S: 'KJ74', H: 'Q62', D: '93', C: 'KJ85' },
    east: { S: 'AQT9', H: '875', D: '82', C: 'Q764' },
    west: { S: '6532', H: 'T93', D: 'JT54', C: 'A2' },
    expectedResponderRebidCalls: [{ call: '3NT', ruleIds: [
      'responder-rebid-strong-second-suit-3nt',
    ] }],
    rejectedResponderRebidCalls: ['Pass', '2NT'],
  },
  {
    description: 'After a game-forcing jump shift, a four-card spade fit selects 4S.',
    practiceAuction: ['1C', 'Pass', '1H', 'Pass', '2S', 'Pass', '4S'],
    north: { S: 'AKJ7', H: '85', D: 'K9', C: 'AQJ64' },
    south: { S: 'Q986', H: 'QJ74', D: 'Q62', C: 'T8' },
    east: { S: 'T53', H: 'KT2', D: 'AT854', C: '53' },
    west: { S: '42', H: 'A963', D: 'J73', C: 'K972' },
    expectedResponderRebidCalls: [{ call: '4S', ruleIds: [
      'responder-rebid-strong-second-suit-major-game',
    ] }],
    rejectedResponderRebidCalls: ['Pass', '2NT'],
  },
  {
    description: "A jump shift into clubs still permits game in opener's five-card hearts.",
    practiceAuction: ['1H', 'Pass', '1S', 'Pass', '3C', 'Pass', '4H'],
    north: { S: '2', H: 'AKQ87', D: 'K3', C: 'AQJ64' },
    south: { S: 'KJ74', H: 'J65', D: 'QJ62', C: '98' },
    east: { S: 'AQ86', H: '943', D: '985', C: 'K52' },
    west: { S: 'T953', H: 'T2', D: 'AT74', C: 'T73' },
    expectedResponderRebidCalls: [
      { call: '4H', ruleIds: ['responder-rebid-strong-second-suit-major-game'] },
      { call: '3NT', ruleIds: ['responder-rebid-strong-second-suit-3nt'] },
    ],
    rejectedResponderRebidCalls: ['Pass', '2NT'],
  },
];

//// Responder after opener's strong natural 2NT rebid
export const RESPONDER_REBID_AFTER_STRONG_2NT_TEST_DEALS: RuleTestDeal[] = [
  {
    description: "Six balanced HCP accept opener's natural 18-19 HCP 2NT invitation.",
    practiceAuction: ['1C', 'Pass', '1H', 'Pass', '2NT', 'Pass', 'Pass'],
    north: { S: 'AQ3', H: 'K2', D: 'KQ4', C: 'AJT85' },
    south: { S: 'J86', H: 'QJ74', D: 'T872', C: 'Q6' },
    expectedResponderRebidCalls: [{ call: 'Pass', ruleIds: [
      'responder-rebid-pass-after-strong-2nt',
    ] }],
    rejectedResponderRebidCalls: ['3NT', '3H', '4H'],
  },
  {
    description: "Seven balanced HCP bid 3NT opposite opener's 18-19 HCP.",
    practiceAuction: ['1C', 'Pass', '1H', 'Pass', '2NT', 'Pass', '3NT'],
    north: { S: 'AQ3', H: 'K2', D: 'KQ4', C: 'AJT85' },
    south: { S: 'J86', H: 'QJ74', D: 'T872', C: 'K6' },
    expectedResponderRebidCalls: [{ call: '3NT', ruleIds: [
      'responder-rebid-3nt-after-strong-2nt',
    ] }],
    rejectedResponderRebidCalls: ['Pass', '3H'],
  },
  {
    description: 'A one-level diamond response can also select natural 3NT after strong 2NT.',
    practiceAuction: ['1C', 'Pass', '1D', 'Pass', '2NT', 'Pass', '3NT'],
    north: { S: 'AQ3', H: 'K2', D: 'KQ4', C: 'AJT85' },
    south: { S: 'J86', H: 'Q74', D: 'JT876', C: 'K6' },
    expectedResponderRebidCalls: [{ call: '3NT', ruleIds: [
      'responder-rebid-3nt-after-strong-2nt',
    ] }],
    rejectedResponderRebidCalls: ['Pass', '3H'],
  },
  {
    description: 'Five hearts ask opener to select 3NT or 4H rather than guess the fit.',
    practiceAuction: ['1C', 'Pass', '1H', 'Pass', '2NT', 'Pass', '3H'],
    north: { S: 'AQ3', H: 'K2', D: 'KQ4', C: 'AJT85' },
    south: { S: 'T86', H: 'AQJT9', D: '872', C: 'K6' },
    expectedResponderRebidCalls: [{ call: '3H', ruleIds: [
      'responder-rebid-three-major-after-strong-2nt',
    ] }],
    rejectedResponderRebidCalls: ['Pass', '3NT', '4H'],
  },
  {
    description: 'Six spades establish a major fit opposite a balanced 2NT rebid.',
    practiceAuction: ['1H', 'Pass', '1S', 'Pass', '2NT', 'Pass', '4S'],
    north: { S: 'K3', H: 'AQJ85', D: 'KQ4', C: 'A72' },
    south: { S: 'AQJT97', H: 'T6', D: 'J72', C: 'T4' },
    expectedResponderRebidCalls: [{ call: '4S', ruleIds: [
      'responder-rebid-four-major-after-strong-2nt',
    ] }],
    rejectedResponderRebidCalls: ['Pass', '3S', '3NT'],
  },
];

//// After a natural 1NT response to a major opening
export const RESPONDER_REBID_AFTER_MAJOR_1NT_TEST_DEALS: RuleTestDeal[] = [
  {
    description: 'After opener repeats six hearts, minimum responder accepts the eight-card fit.',
    practiceAuction: ['1H', 'Pass', '1NT', 'Pass', '2H', 'Pass', 'Pass'],
    north: { S: 'Q2', H: 'AKJ874', D: 'K73', C: '86' },
    south: { S: 'KJ3', H: 'Q2', D: 'T985', C: 'J943' },
    expectedResponderRebidCalls: [{ call: 'Pass', ruleIds: [
      'responder-rebid-pass-after-major-1nt-repeat',
    ] }],
    rejectedResponderRebidCalls: ['3H', '2NT'],
  },
  {
    description: 'Constructive values and doubleton heart honor invite over six hearts.',
    practiceAuction: ['1H', 'Pass', '1NT', 'Pass', '2H', 'Pass', '3H'],
    north: { S: 'Q2', H: 'AKJ874', D: 'K73', C: '86' },
    south: { S: 'AJ3', H: 'Q2', D: 'Q985', C: 'J943' },
    expectedResponderRebidCalls: [{ call: '3H', ruleIds: [
      'responder-rebid-invite-after-major-1nt-repeat',
    ] }],
    rejectedResponderRebidCalls: ['2NT'],
  },
  {
    description: 'After a manufactured three-card club rebid, return to the five-card major.',
    practiceAuction: ['1S', 'Pass', '1NT', 'Pass', '2C', 'Pass', '2S'],
    requiredSystem: { majorOneNtResponse: 'forcing' },
    north: { S: 'AKJ74', H: 'Q63', D: 'K4', C: 'J63' },
    south: { S: 'Q2', H: 'J872', D: 'Q985', C: 'K84' },
    expectedResponderRebidCalls: [{ call: '2S', ruleIds: [
      'responder-rebid-prefer-major-after-major-1nt',
    ] }],
    rejectedResponderRebidCalls: ['Pass', '3S'],
  },
  {
    description: "With a genuine diamond fit, accept opener's natural second suit.",
    practiceAuction: ['1S', 'Pass', '1NT', 'Pass', '2D', 'Pass', 'Pass'],
    requiredSystem: { majorOneNtResponse: 'nonForcing' },
    north: { S: 'AKQ85', H: '83', D: 'KJ74', C: '96' },
    south: { S: 'J3', H: 'K94', D: 'A986', C: 'T853' },
    expectedResponderRebidCalls: [{ call: 'Pass', ruleIds: [
      'responder-rebid-pass-second-suit-after-major-1nt',
    ] }],
    rejectedResponderRebidCalls: ['3S', '2NT'],
  },
  {
    description: 'Six clubs guarantee an eight-card fit even if forcing 1NT manufactured only two.',
    practiceAuction: ['1S', 'Pass', '1NT', 'Pass', '2C', 'Pass', 'Pass'],
    requiredSystem: { majorOneNtResponse: 'forcing' },
    north: { S: 'AKJ74', H: 'Q63', D: 'K4', C: 'J63' },
    south: { S: 'Q2', H: 'T87', D: '98', C: 'AK9748' },
    expectedResponderRebidCalls: [{ call: 'Pass', ruleIds: [
      'responder-rebid-pass-second-suit-after-major-1nt',
    ] }],
    rejectedResponderRebidCalls: ['3S', '2NT'],
  },
  {
    description: 'After 1NT, responder can sign off in an independently long club suit.',
    practiceAuction: ['1S', 'Pass', '1NT', 'Pass', '2D', 'Pass', '3C'],
    north: { S: 'AKQ85', H: '83', D: 'KJ74', C: '96' },
    south: { S: 'J2', H: 'QJ4', D: 'T8', C: 'KQ8753' },
    expectedResponderRebidCalls: [{ call: '3C', ruleIds: [
      'responder-rebid-long-minor-after-major-1nt',
    ] }],
    rejectedResponderRebidCalls: ['3S', '2NT'],
  },
  {
    description: 'Three spades and 12 support points complete the 1NT limit-raise route.',
    practiceAuction: ['1S', 'Pass', '1NT', 'Pass', '2C', 'Pass', '3S'],
    requiredSystem: { majorOneNtResponse: 'nonForcing' },
    north: { S: 'AKQ85', H: 'J3', D: 'K7', C: 'QJ84' },
    south: { S: 'J74', H: 'KQ8', D: 'AQ83', C: 'T92' },
    expectedResponderRebidCalls: [{ call: '3S', ruleIds: [
      'responder-rebid-delayed-limit-after-major-1nt',
    ] }],
    rejectedResponderRebidCalls: ['Pass', '2S', '2NT'],
  },
  {
    description: 'Ten balanced HCP invite notrump game after opener shows clubs.',
    practiceAuction: ['1S', 'Pass', '1NT', 'Pass', '2C', 'Pass', '2NT'],
    north: { S: 'AKQ85', H: 'J3', D: 'K7', C: 'QJ84' },
    south: { S: 'J2', H: 'KQ8', D: 'A863', C: 'T963' },
    expectedResponderRebidCalls: [{ call: '2NT', ruleIds: [
      'responder-rebid-2nt-after-major-1nt-second-suit',
    ] }],
    rejectedResponderRebidCalls: ['3S'],
  },
];

//// Responder after a natural 1NT response to a minor opening
export const RESPONDER_REBID_AFTER_MINOR_1NT_TEST_DEALS: RuleTestDeal[] = [
  {
    description: 'With an eight-card diamond fit and minimum values, Pass opener\'s 2D.',
    practiceAuction: ['1D', 'Pass', '1NT', 'Pass', '2D', 'Pass', 'Pass'],
    north: { S: 'A42', H: 'K4', D: 'AQJT92', C: '85' },
    south: { S: 'Q76', H: 'J85', D: 'K73', C: 'Q964' },
    expectedResponderRebidCalls: [{ call: 'Pass', ruleIds: ['responder-rebid-pass-after-minor-1nt-repeat'] }],
    rejectedResponderRebidCalls: ['2NT', '3NT'],
  },
  {
    description: 'Four clubs support opener\'s natural second suit after 1D-1NT-2C.',
    practiceAuction: ['1D', 'Pass', '1NT', 'Pass', '2C', 'Pass', 'Pass'],
    north: { S: 'A4', H: 'K2', D: 'AQJ92', C: 'JT52' },
    south: { S: 'Q76', H: 'J85', D: 'K73', C: 'Q964' },
    expectedResponderRebidCalls: [{ call: 'Pass', ruleIds: ['responder-rebid-pass-second-minor-after-1nt'] }],
    rejectedResponderRebidCalls: ['3NT'],
  },
  {
    description: 'Three clubs are insufficient for a fit; prefer the known five-card diamonds.',
    practiceAuction: ['1D', 'Pass', '1NT', 'Pass', '2C', 'Pass', '2D'],
    north: { S: 'A4', H: 'K2', D: 'AQJ92', C: 'JT52' },
    south: { S: 'Q76', H: 'J85', D: 'K754', C: 'Q96' },
    expectedResponderRebidCalls: [{ call: '2D', ruleIds: ['responder-rebid-prefer-diamonds-after-minor-1nt'] }],
    rejectedResponderRebidCalls: ['Pass', '3NT'],
  },
  {
    description: 'Six balanced HCP decline opener\'s 18-19 HCP 2NT invitation.',
    practiceAuction: ['1D', 'Pass', '1NT', 'Pass', '2NT', 'Pass', 'Pass'],
    requiredSystem: { oneNtOpening: '15-17' },
    north: { S: 'AK2', H: 'KQ4', D: 'QJ92', C: 'K85' },
    south: { S: 'Q76', H: 'T95', D: 'K73', C: 'J964' },
    expectedResponderRebidCalls: [{ call: 'Pass', ruleIds: ['responder-rebid-pass-after-minor-1nt-2nt'] }],
    rejectedResponderRebidCalls: ['3NT'],
  },
  {
    description: 'Eight balanced HCP accept opener\'s 18-19 HCP 2NT invitation.',
    practiceAuction: ['1D', 'Pass', '1NT', 'Pass', '2NT', 'Pass', '3NT'],
    requiredSystem: { oneNtOpening: '15-17' },
    north: { S: 'AK2', H: 'KQ4', D: 'QJ92', C: 'K85' },
    south: { S: 'Q76', H: 'J85', D: 'K73', C: 'Q964' },
    expectedResponderRebidCalls: [{ call: '3NT', ruleIds: ['responder-rebid-3nt-after-minor-1nt-2nt'] }],
    rejectedResponderRebidCalls: ['Pass'],
  },
  {
    description: 'Minimum responder with diamond tolerance declines opener\'s jump-rebid invitation.',
    practiceAuction: ['1D', 'Pass', '1NT', 'Pass', '3D', 'Pass', 'Pass'],
    north: { S: 'AK', H: 'Q4', D: 'AQJ982', C: '852' },
    south: { S: 'T76', H: 'J85', D: 'K73', C: 'Q964' },
    expectedResponderRebidCalls: [{ call: 'Pass', ruleIds: ['responder-rebid-pass-after-minor-1nt-jump-repeat'] }],
    rejectedResponderRebidCalls: ['3NT'],
  },
  {
    description: 'Responder accepts opener\'s natural 3NT game without launching a new auction.',
    practiceAuction: ['1D', 'Pass', '1NT', 'Pass', '3NT', 'Pass', 'Pass'],
    north: { S: 'AK', H: 'KQ', D: 'AQJ982', C: 'J85' },
    south: { S: 'Q76', H: 'J85', D: 'K73', C: 'Q964' },
    expectedResponderRebidCalls: [{ call: 'Pass', ruleIds: ['responder-rebid-pass-after-minor-1nt-game'] }],
  },
];

//// After a Standard one-round-forcing two-level new-suit response

export const RESPONDER_REBID_AFTER_STANDARD_TWO_LEVEL_TEST_DEALS: RuleTestDeal[] = [
  {
    description: 'After the one-round force is answered with 2D, a six-card club suit can be rebid nonforcing.',
    practiceAuction: ['1D', 'Pass', '2C', 'Pass', '2D', 'Pass', '3C'],
    requiredSystem: { twoLevelNewSuitResponse: 'standard' },
    north: { S: 'A4', H: 'KJ42', D: 'KQJ92', C: '82' },
    east: { S: 'T53', H: 'T975', D: 'T63', C: 'AK7' },
    south: { S: 'K72', H: 'Q8', D: 'A5', C: 'QJ9653' },
    expectedResponderRebidCalls: [{ call: '3C', ruleIds: [
      'responder-rebid-standard-two-level-repeat-response',
    ] }],
    rejectedResponderRebidCalls: ['Pass', '3NT'],
  },
  {
    description: "After the Standard 1D-2C response, a minimum responder can Pass opener's 3C raise.",
    practiceAuction: ['1D', 'Pass', '2C', 'Pass', '3C', 'Pass', 'Pass'],
    requiredSystem: { twoLevelNewSuitResponse: 'standard' },
    north: { S: 'A', H: 'KJ42', D: 'KJ972', C: 'T82' },
    east: { S: 'Q94', H: 'T965', D: 'QT84', C: 'J7' },
    south: { S: 'K72', H: 'Q83', D: 'A5', C: 'Q9653' },
    expectedResponderRebidCalls: [{ call: 'Pass', ruleIds: [
      'responder-rebid-standard-two-level-pass-raise',
    ] }],
    rejectedResponderRebidCalls: ['3NT', '5C'],
  },
  {
    description: 'After 1D-2C-2D, a minimum responder with three diamonds can prefer 3D.',
    practiceAuction: ['1D', 'Pass', '2C', 'Pass', '2D', 'Pass', '3D'],
    requiredSystem: { twoLevelNewSuitResponse: 'standard' },
    north: { S: 'A4', H: 'KJ42', D: 'KQJ92', C: '82' },
    east: { S: 'JT63', H: 'AT65', D: 'T76', C: 'KT' },
    south: { S: 'K7', H: 'Q83', D: 'A53', C: 'Q9653' },
    expectedResponderRebidCalls: [{ call: '3D', ruleIds: [
      'responder-rebid-standard-two-level-prefer-diamonds',
    ] }],
    rejectedResponderRebidCalls: ['Pass', '3NT'],
  },
  {
    description: 'Minimum balanced responder can stop in 2NT after Standard 1D-2C.',
    practiceAuction: ['1D', 'Pass', '2C', 'Pass', '2NT', 'Pass', 'Pass'],
    requiredSystem: { twoLevelNewSuitResponse: 'standard' },
    north: { S: 'AQJ4', H: 'KJ2', D: 'QJ92', C: '82' },
    east: { S: '985', H: 'T94', D: 'T73', C: 'AKT4' },
    south: { S: 'K72', H: 'Q83', D: 'A5', C: 'Q9653' },
    expectedResponderRebidCalls: [{ call: 'Pass', ruleIds: [
      'responder-rebid-standard-two-level-pass-2nt',
    ] }],
    rejectedResponderRebidCalls: ['3NT'],
  },
  {
    description: 'Game-going balanced responder chooses 3NT after the minimum Standard 2NT rebid.',
    practiceAuction: ['1H', 'Pass', '2C', 'Pass', '2NT', 'Pass', '3NT'],
    requiredSystem: { twoLevelNewSuitResponse: 'standard' },
    north: { S: 'A82', H: 'AQJ85', D: 'K72', C: '85' },
    east: { S: 'J943', H: 'T97', D: 'J4', C: 'AT94' },
    south: { S: 'KQ5', H: '63', D: 'A95', C: 'KQJ72' },
    expectedResponderRebidCalls: [{ call: '3NT', ruleIds: [
      'responder-rebid-standard-two-level-game-3nt',
    ] }],
    rejectedResponderRebidCalls: ['Pass'],
  },
  {
    description: "With a known eight-card heart fit and game values, accept opener's 3H raise.",
    practiceAuction: ['1S', 'Pass', '2H', 'Pass', '3H', 'Pass', '4H'],
    requiredSystem: { twoLevelNewSuitResponse: 'standard' },
    north: { S: 'KQJ985', H: 'A74', D: '82', C: 'Q3' },
    east: { S: '762', H: 'QT', D: 'K654', C: 'J974' },
    south: { S: 'A4', H: 'J9852', D: 'QJ3', C: 'A65' },
    expectedResponderRebidCalls: [{ call: '4H', ruleIds: [
      'responder-rebid-standard-two-level-game-major-raise',
    ] }],
    rejectedResponderRebidCalls: ['Pass', '3NT'],
  },
  {
    description: 'A Standard 3NT rebid places game, so minimum responder ordinarily Passes.',
    practiceAuction: ['1D', 'Pass', '2C', 'Pass', '3NT', 'Pass', 'Pass'],
    requiredSystem: { twoLevelNewSuitResponse: 'standard' },
    north: { S: 'AQJ4', H: 'AK2', D: 'KJ92', C: '82' },
    east: { S: 'T653', H: 'JT64', D: '76', C: 'AK4' },
    south: { S: 'K72', H: 'Q83', D: 'A5', C: 'Q9653' },
    expectedResponderRebidCalls: [{ call: 'Pass', ruleIds: [
      'responder-rebid-standard-two-level-pass-game',
    ] }],
  },
];

//// After a 2/1 game-forcing two-level new-suit response

export const RESPONDER_REBID_AFTER_TWO_OVER_ONE_TEST_DEALS: RuleTestDeal[] = [
  {
    description: 'After six spades are shown, two spades in responder establish major game.',
    practiceAuction: ['1S', 'Pass', '2C', 'Pass', '2S', 'Pass', '4S'],
    requiredSystem: { twoLevelNewSuitResponse: 'twoOverOne' },
    north: { S: 'KQJ985', H: 'A72', D: 'K4', C: '82' },
    east: { S: 'T7', H: 'QJ94', D: 'T985', C: 'J64' },
    south: { S: 'A4', H: 'K63', D: 'QJ6', C: 'KQ973' },
    expectedResponderRebidCalls: [{ call: '4S', ruleIds: [
      'responder-rebid-two-over-one-opening-major-game',
    ] }],
    rejectedResponderRebidCalls: ['Pass', '3S'],
  },
  {
    description: 'With three-card spade support and extra values, raise slowly to 3S.',
    practiceAuction: ['1S', 'Pass', '2D', 'Pass', '2H', 'Pass', '3S'],
    requiredSystem: { twoLevelNewSuitResponse: 'twoOverOne' },
    north: { S: 'KQJ98', H: 'AQ72', D: '62', C: 'K9' },
    east: { S: 'T6', H: 'T965', D: 'T987', C: 'JT2' },
    south: { S: 'A75', H: '4', D: 'AKQJ5', C: 'Q853' },
    expectedResponderRebidCalls: [{ call: '3S', ruleIds: [
      'responder-rebid-two-over-one-slow-major-raise',
    ] }],
    rejectedResponderRebidCalls: ['Pass', '4S'],
  },
  {
    description: 'Balanced responder with unbid-suit stoppers can choose 3NT after 2/1 2NT.',
    practiceAuction: ['1H', 'Pass', '2C', 'Pass', '2NT', 'Pass', '3NT'],
    requiredSystem: { twoLevelNewSuitResponse: 'twoOverOne' },
    north: { S: 'KQ7', H: 'AJT84', D: 'A94', C: '75' },
    east: { S: 'T63', H: '976', D: 'T652', C: 'A64' },
    south: { S: 'A84', H: 'K5', D: 'QJ8', C: 'KQJ93' },
    expectedResponderRebidCalls: [{ call: '3NT', ruleIds: [
      'responder-rebid-two-over-one-game-3nt',
    ] }],
    rejectedResponderRebidCalls: ['Pass'],
  },
  {
    description: 'Repeat a six-card club suit naturally, retaining the 2/1 game force.',
    practiceAuction: ['1S', 'Pass', '2C', 'Pass', '2S', 'Pass', '3C'],
    requiredSystem: { twoLevelNewSuitResponse: 'twoOverOne' },
    north: { S: 'AKQ986', H: 'K74', D: 'Q5', C: 'T2' },
    east: { S: 'T7', H: 'T983', D: 'T987', C: '543' },
    south: { S: '4', H: 'AQ5', D: 'K32', C: 'KQJ987' },
    expectedResponderRebidCalls: [{ call: '3C', ruleIds: [
      'responder-rebid-two-over-one-repeat-long-suit',
    ] }],
    rejectedResponderRebidCalls: ['Pass', '4S'],
  },
  {
    description: 'Four hearts opposite a natural 2H rebid after 1D-2C establish major game.',
    practiceAuction: ['1D', 'Pass', '2C', 'Pass', '2H', 'Pass', '4H'],
    requiredSystem: { twoLevelNewSuitResponse: 'twoOverOne' },
    north: { S: 'KQ7', H: 'KJ84', D: 'AQ86', C: '82' },
    east: { S: 'T985', H: 'T92', D: 'J973', C: 'T5' },
    south: { S: 'A3', H: 'Q765', D: 'K5', C: 'KQJ97' },
    expectedResponderRebidCalls: [{ call: '4H', ruleIds: [
      'responder-rebid-two-over-one-discovered-major-game',
    ] }],
    rejectedResponderRebidCalls: ['Pass'],
  },
  {
    description: 'A balanced responder can make natural forcing 2NT after opener shows diamonds.',
    practiceAuction: ['1S', 'Pass', '2C', 'Pass', '2D', 'Pass', '2NT'],
    requiredSystem: { twoLevelNewSuitResponse: 'twoOverOne' },
    north: { S: 'AK874', H: '54', D: 'KQ72', C: '92' },
    east: { S: 'T63', H: 'JT96', D: 'T94', C: 'T76' },
    south: { S: 'Q5', H: 'AQ7', D: 'A86', C: 'KJ843' },
    expectedResponderRebidCalls: [{ call: '2NT', ruleIds: [
      'responder-rebid-two-over-one-forcing-2nt',
    ] }],
    rejectedResponderRebidCalls: ['Pass'],
  },
];
