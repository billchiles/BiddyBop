/// Responding after overcall test deals, kept separate from the bucket registry.

/// `import type` is erased by TypeScript when JavaScript is emitted. Although
/// test-deals-registry.ts imports these values, this type import creates no runtime cycle.
///
import type { RuleTestDeal } from './test-deals-registry';

/// Responder after a opponent non-jump natural suit overcall.  North opens, East overcalls,
/// and South practices the response.  All three hands are fixed so the overcall is plausible.
///
export const RESPONDER_AFTER_SUIT_OVERCALL_TEST_DEALS: RuleTestDeal[] = [
  {
    description: '1D-(1S)-Double: with four hearts and sufficient points, use a negative double.',
    practiceAuction: ['1D', '1S', 'Double'],
    expectedResponseCalls: [{ call: 'Double', ruleIds: ['respond-over-suit-negative-double'] }],
    rejectedResponseCalls: ['2H'],
    north: { S: 'K72', H: 'A43', D: 'AQJ74', C: '83' },
    east: { S: 'AQJ86', H: '762', D: '8', C: 'K964' },
    south: { S: '93', H: 'KJ85', D: 'K96', C: 'QJT5' },
    west: { S: 'T54', H: 'QT9', D: 'T532', C: 'A72' },
  },
  {
    description: '1H-(1S)-2S: bid opponent spades artificially to show strong heart support.',
    practiceAuction: ['1H', '1S', '2S'],
    expectedResponseCalls: [{ call: '2S', ruleIds: ['respond-over-suit-support-cuebid'] }],
    north: { S: 'K72', H: 'AKT94', D: 'QJ3', C: '83' },
    east: { S: 'AQJ86', H: '762', D: '8', C: 'K964' },
    south: { S: 'T93', H: 'QJ85', D: 'AT97', C: 'AQ' },
    west: { S: '54', H: '3', D: 'K6542', C: 'JT752' },
  },
  {
    description: '1H-(2D)-2H: economical simple raise survives an ordinary two-level overcall.',
    practiceAuction: ['1H', '2D', '2H'],
    expectedResponseCalls: [
      { call: '2H', ruleIds: ['respond-to-major-w/-support-simple-raise'] },
    ],
    north: { S: 'K83', H: 'AQJ74', D: 'AT4', C: '95' },
    east: { S: 'AQT', H: '62', D: 'KQJ985', C: '73' },
    south: { S: 'J976', H: 'KT9', D: '763', C: 'A82' },
    west: { S: '542', H: '853', D: '2', C: 'KQJT64' },
  },
  {
    description: '1S-(2H)-3S: four spades, weak preemptive true jump raise, not a limit raise.',
    practiceAuction: ['1S', '2H', '3S'],
    expectedResponseCalls: [
      { call: '3S', ruleIds: ['respond-over-suit-preemptive-jump-raise'] },
    ],
    north: { S: 'AKJ74', H: 'K82', D: 'Q93', C: '65' },
    east: { S: 'Q3', H: 'AQJ965', D: 'K86', C: '72' },
    south: { S: 'T986', H: 'T74', D: 'JT5', C: 'A84' },
    west: { S: '52', H: '3', D: 'A742', C: 'KQJT93' },
  },
  {
    description: '1C-(1D)-1H: four hearts suffice for an economical one-level major response.',
    practiceAuction: ['1C', '1D', '1H'],
    expectedResponseCalls: [
      { call: '1H', ruleIds: ['respond-over-suit-new-suit-one-level'] },
    ],
    north: { S: 'AK64', H: '2', D: '963', C: 'KQ972' },
    east: { S: 'T2', H: 'KQ', D: 'AKQT872', C: 'J3' },
    south: { S: 'J873', H: 'AT96', D: '54', C: 'A84' },
    west: { S: 'Q95', H: 'J87543', D: 'J', C: 'T65' },
  },
  {
    description: '1C-(1D)-2D: artificial cuebid showing limit-or-better club support.',
    practiceAuction: ['1C', '1D', '2D'],
    expectedResponseCalls: [
      { call: '2D', ruleIds: ['respond-over-suit-support-cuebid'] },
    ],
    north: { S: 'AK64', H: '2', D: '963', C: 'KQ972' },
    east: { S: 'T2', H: 'KQ', D: 'AKQT872', C: 'J3' },
    south: { S: 'QJ8', H: 'AJ85', D: '54', C: 'AT86' },
    west: { S: '9753', H: 'T97643', D: 'J', C: '54' },
  },
  {
    description: '1D-(1S)-1NT: natural balanced values and Kxx stopping opponent spades.',
    practiceAuction: ['1D', '1S', '1NT'],
    expectedResponseCalls: [
      { call: '1NT', ruleIds: ['respond-over-suit-natural-notrump'] },
    ],
    north: { S: '872', H: 'A43', D: 'AKJ74', C: 'Q3' },
    east: { S: 'AQJ96', H: '762', D: '8', C: 'K964' },
    south: { S: 'KT5', H: 'QJ8', D: 'Q95', C: 'JT85' },
    west: { S: '43', H: 'KT95', D: 'T632', C: 'A72' },
  },
  {
    description: '1H-(1S)-2C: natural five clubs and 10+ HCP, only one-round forcing.',
    practiceAuction: ['1H', '1S', '2C'],
    expectedResponseCalls: [
      { call: '2C', ruleIds: ['respond-over-suit-new-suit-two-level'] },
    ],
    north: { S: 'K72', H: 'AKT94', D: 'QJ3', C: '83' },
    east: { S: 'AQJ86', H: '762', D: '8', C: 'K964' },
    south: { S: 'T9', H: 'QJ', D: 'AT97', C: 'AQJT5' },
    west: { S: '543', H: '853', D: 'K6542', C: '72' },
  },
  {
    description: '1H-(2D)-3C: five clubs, game-going strength, cheapest club bid at three.',
    practiceAuction: ['1H', '2D', '3C'],
    expectedResponseCalls: [
      { call: '3C', ruleIds: ['respond-over-suit-new-suit-three-level'] },
    ],
    north: { S: 'K83', H: 'AJ974', D: 'AT4', C: '95' },
    east: { S: 'AQT', H: '62', D: 'KQJ985', C: '73' },
    south: { S: '976', H: 'KT', D: '632', C: 'AKQJ8' },
    west: { S: 'J542', H: 'Q853', D: '7', C: 'T642' },
  },
];

/// Responder to an opponent's takeout double of partner's one-level suit opening.
/// The double is backed by East's actual holding; no penalty scoring is exercised.
///
export const RESPONDER_AFTER_TAKEOUT_DOUBLE_TEST_DEALS: RuleTestDeal[] = [
  {
    description: '1H-(Double)-Redouble: 10+ HCP without any requirement to deny heart support; ' +
                 'Jordan 2NT is also available with three hearts and limit-or-better support.',
    practiceAuction: ['1H', 'Double', 'Redouble'],
    expectedResponseCalls: [
      { call: 'Redouble', ruleIds: ['respond-after-double-redouble-values'] },
      { call: '2NT', ruleIds: ['respond-after-double-jordan-2nt-support'] },
    ],
    expectedResponseCallOrder: [['2NT', 'Redouble']],
    rejectedResponseCalls: ['3H', '1NT'],
    north: { S: 'K72', H: 'AKT96', D: 'Q53', C: '54' },
    east: { S: 'AQJ4', H: '2', D: 'K874', C: 'QJ86' },
    south: { S: 'T98', H: 'QJ5', D: 'AJ6', C: 'K973' },
    west: { S: '653', H: '8743', D: 'T92', C: 'AT2' },
  },
  {
    description: '1H-(Double)-Redouble: 10+ HCP still qualifies with only one heart; ' +
                 'Jordan 2NT does require a fit.',
    practiceAuction: ['1H', 'Double', 'Redouble'],
    expectedResponseCalls: [
      { call: 'Redouble', ruleIds: ['respond-after-double-redouble-values'] },
      { call: '1S', ruleIds: ['respond-after-double-new-suit-one-level'] },
    ],
    rejectedResponseCalls: ['2NT'],
    north: { S: 'K72', H: 'AKT96', D: 'Q53', C: '54' },
    east: { S: 'AQJ4', H: '2', D: 'K874', C: 'QJ86' },
    south: { S: 'T9865', H: 'Q', D: 'AJT9', C: 'KT2' },
    west: { S: '3', H: 'J87543', D: '62', C: 'A973' },
  },
  {
    description: '1H-(Double)-3H: weak preemptive raise with four trumps, not a limit raise.',
    practiceAuction: ['1H', 'Double', '3H'],
    expectedResponseCalls: [
      { call: '3H', ruleIds: ['respond-after-double-weak-jump-raise'] },
    ],
    rejectedResponseCalls: ['2NT', 'Redouble'],
    north: { S: 'K72', H: 'AKT96', D: 'Q53', C: '54' },
    east: { S: 'AQJ4', H: '2', D: 'K874', C: 'QJ86' },
    south: { S: 'T98', H: 'J875', D: 'T96', C: '932' },
    west: { S: '653', H: 'Q43', D: 'AJ2', C: 'AKT7' },
  },
  {
    description: '1H-(Double)-2D: 6 diamonds with adequate suit texture, 5-9 HCP, nonforcing.',
    practiceAuction: ['1H', 'Double', '2D'],
    expectedResponseCalls: [
      { call: '2D', ruleIds: ['respond-after-double-new-suit-two-level'] },
    ],
    rejectedResponseCalls: ['2NT', 'Redouble'],
    north: { S: 'K72', H: 'AKT96', D: 'Q53', C: '54' },
    east: { S: 'AQJ4', H: '2', D: 'K874', C: 'QJ86' },
    south: { S: 'T98', H: 'J7', D: 'AJT962', C: '93' },
    west: { S: '653', H: 'Q8543', D: '', C: 'AKT72' },
  },
  {
    description: '1H-(Double)-1S: natural 4-card suit, forcing even when responder has 10+ HCP.',
    practiceAuction: ['1H', 'Double', '1S'],
    expectedResponseCalls: [
      { call: '1S', ruleIds: ['respond-after-double-new-suit-one-level'] },
      { call: 'Redouble', ruleIds: ['respond-after-double-redouble-values'] },
    ],
    north: { S: 'K72', H: 'AKT96', D: 'Q53', C: '54' },
    east: { S: 'AQJ4', H: '2', D: 'K874', C: 'QJ86' },
    south: { S: 'T986', H: 'QJ5', D: 'AJ6', C: 'A73' },
    west: { S: '53', H: '8743', D: 'T92', C: 'KT92' },
  },
  {
    description: '1H-(Double)-1NT: balanced 6-9 HCP, without a named opposing suit to stop.',
    practiceAuction: ['1H', 'Double', '1NT'],
    expectedResponseCalls: [
      { call: '1NT', ruleIds: ['respond-after-double-natural-1nt'] },
    ],
    rejectedResponseCalls: ['2NT', 'Redouble'],
    north: { S: 'K72', H: 'AKT96', D: 'Q53', C: '54' },
    east: { S: 'AQJ4', H: '2', D: 'K874', C: 'QJ86' },
    south: { S: 'T986', H: 'QJ5', D: 'A96', C: '973' },
    west: { S: '53', H: '8743', D: 'JT2', C: 'AKT2' },
  },
  {
    description: '1H-(Double)-2S: weak jump shift in a six-card suit, independent of jump-shift setting.',
    practiceAuction: ['1H', 'Double', '2S'],
    expectedResponseCalls: [
      { call: '2S', ruleIds: ['respond-after-double-weak-jump-shift'] },
    ],
    rejectedResponseCalls: ['2NT', 'Redouble'],
    north: { S: 'K72', H: 'AKT96', D: 'Q53', C: '54' },
    east: { S: 'AQJ4', H: '2', D: 'K874', C: 'QJ86' },
    south: { S: 'T98653', H: 'J7', D: 'AT9', C: '93' },
    west: { S: '', H: 'Q8543', D: 'J62', C: 'AKT72' },
  },
  {
    description: '1D-(Double)-2NT: Jordan with four diamonds and 10+ support points; ' +
                 'Redouble remains possible with 10+ HCP.',
    practiceAuction: ['1D', 'Double', '2NT'],
    expectedResponseCalls: [
      { call: '2NT', ruleIds: ['respond-after-double-jordan-2nt-support'] },
      { call: 'Redouble', ruleIds: ['respond-after-double-redouble-values'] },
    ],
    north: { S: 'K72', H: 'A43', D: 'AQJ74', C: '83' },
    east: { S: 'AQJ4', H: 'K762', D: '8', C: 'QJ96' },
    south: { S: 'T98', H: 'QJ5', D: 'KT96', C: 'AT2' },
    west: { S: '653', H: 'T98', D: '532', C: 'K754' },
  },
  {
    description: '1C-(Double)-2NT: Jordan after clubs explicitly needs five-card support.',
    practiceAuction: ['1C', 'Double', '2NT'],
    expectedResponseCalls: [
      { call: '2NT', ruleIds: ['respond-after-double-jordan-2nt-support'] },
    ],
    north: { S: 'K72', H: 'A43', D: '83', C: 'AQJ74' },
    east: { S: 'AQJ4', H: 'K762', D: 'QJ96', C: '8' },
    south: { S: 'T98', H: 'QJ5', D: 'AK', C: 'T9652' },
    west: { S: '653', H: 'T98', D: 'T7542', C: 'K3' },
  },
];

/// Responder after a natural opposing 1NT overcall: two-level new suits are weak and nonforcing,
/// ordinary simple raises remain available, and jump raises are preemptive rather than invitational.
///
export const RESPONDER_AFTER_1NT_OVERCALL_TEST_DEALS: RuleTestDeal[] = [
  {
    description: '1H-(1NT)-Pass: eight HCP but no heart support or good six-card suit; ' +
                 'ordinary Pass remains available rather than forcing a weak response.',
    practiceAuction: ['1H', '1NT', 'Pass'],
    expectedResponseCalls: [{ call: 'Pass', ruleIds: [
      'respond-over-1nt-pass-no-constructive-action',
    ] }],
    rejectedResponseCalls: ['2D', '2H', '2NT', 'Double'],
    north: { S: 'K72', H: 'AKT96', D: 'Q53', C: '54' },
    east: { S: 'AQ4', H: 'QJ8', D: 'K874', C: 'KJ9' },
    south: { S: 'J965', H: '74', D: 'AJ62', C: 'Q86' },
    west: { S: 'T83', H: '532', D: 'T9', C: 'AT732' },
  },
  {
    description: '1H-(1NT)-2D: five HCP and good six-card diamonds, nonforcing at two level.',
    practiceAuction: ['1H', '1NT', '2D'],
    expectedResponseCalls: [
      { call: '2D', ruleIds: ['respond-over-1nt-new-suit-two-level'] },
    ],
    rejectedResponseCalls: ['2NT', 'Double', '3H'],
    north: { S: 'K72', H: 'AKT96', D: 'Q53', C: '54' },
    east: { S: 'AQ4', H: 'QJ8', D: 'K874', C: 'KQ9' },
    south: { S: 'T83', H: '73', D: 'AJT962', C: 'T3' },
    west: { S: 'J965', H: '542', D: '', C: 'AJ8762' },
  },
  {
    description: '1C-(1NT)-2D: measure the new-suit bid above opposing 1NT, not opener 1C.',
    practiceAuction: ['1C', '1NT', '2D'],
    expectedResponseCalls: [
      { call: '2D', ruleIds: ['respond-over-1nt-new-suit-two-level'] },
    ],
    rejectedResponseCalls: ['2NT', 'Double'],
    north: { S: 'K72', H: 'A43', D: '83', C: 'AQJ74' },
    east: { S: 'AQ4', H: 'KJ8', D: 'Q76', C: 'K962' },
    south: { S: 'T83', H: 'Q75', D: 'AJT952', C: 'T' },
    west: { S: 'J965', H: 'T962', D: 'K4', C: '853' },
  },
  {
    description: '1H-(1NT)-2H: shared simple raise with three hearts and eight HCP.',
    practiceAuction: ['1H', '1NT', '2H'],
    expectedResponseCalls: [
      { call: '2H', ruleIds: ['respond-to-major-w/-support-simple-raise'] },
    ],
    rejectedResponseCalls: ['Pass', '2D', '3H', '2NT', 'Double'],
    north: { S: 'K72', H: 'AKT96', D: 'Q53', C: '54' },
    east: { S: 'AQ4', H: 'QJ8', D: 'K874', C: 'KQ9' },
    south: { S: 'T83', H: '754', D: 'AT9', C: 'A832' },
    west: { S: 'J965', H: '32', D: 'J62', C: 'JT76' },
  },
  {
    description: '1S-(1NT)-3S: weak four-card support makes a preemptive jump raise.',
    practiceAuction: ['1S', '1NT', '3S'],
    expectedResponseCalls: [
      { call: '3S', ruleIds: ['respond-over-1nt-preemptive-jump-raise'] },
    ],
    rejectedResponseCalls: ['2S', '2NT', 'Double'],
    north: { S: 'AKJ74', H: 'K82', D: 'Q93', C: '65' },
    east: { S: 'Q85', H: 'AQ3', D: 'KJ72', C: 'KQ9' },
    south: { S: 'T963', H: 'J75', D: 'T86', C: 'A42' },
    west: { S: '2', H: 'T964', D: 'A54', C: 'JT873' },
  },
];

/// Responder after two- and three-level preemptive jump overcalls.  Positive and negative
/// expectations distinguish cheapest raises, new suits, stoppers, support cuebids, and Doubles.
///
export const RESPONDER_AFTER_JUMP_OVERCALL_TEST_DEALS: RuleTestDeal[] = [
  {
    description: '1H-(2S)-Pass: eight HCP without an economical raise; Pass after preemptive interference.',
    practiceAuction: ['1H', '2S', 'Pass'],
    expectedResponseCalls: [
      { call: 'Pass', ruleIds: ['respond-over-jump-pass-limited'] },
    ],
    rejectedResponseCalls: ['3H', 'Double', '2NT', '3NT'],
    north: { S: '872', H: 'AKT96', D: 'AQ3', C: '54' },
    east: { S: 'AQJ965', H: '43', D: '84', C: 'T97' },
    south: { S: 'T43', H: '8', D: 'T52', C: 'AKJ863' },
    west: { S: 'K', H: 'QJ752', D: 'KJ976', C: 'Q2' },
  },
  {
    description: '1H-(2S)-3H: three-card support and nine adjusted points; three hearts is the cheapest raise.',
    practiceAuction: ['1H', '2S', '3H'],
    expectedResponseCalls: [
      { call: '3H', ruleIds: ['respond-over-jump-raise-cheapest-to-three'] },
    ],
    rejectedResponseCalls: ['Double', '3S', '2NT'],
    north: { S: '872', H: 'AKT96', D: 'AQ3', C: '54' },
    east: { S: 'AQJ965', H: '43', D: '84', C: 'T97' },
    south: { S: 'T4', H: '752', D: 'KJ952', C: 'A62' },
    west: { S: 'K3', H: 'QJ8', D: 'T76', C: 'KQJ83' },
  },
  {
    description: '1C-(2D)-2S: eleven HCP and five spades; forcing nonjump two-level new suit.',
    practiceAuction: ['1C', '2D', '2S'],
    expectedResponseCalls: [
      { call: '2S', ruleIds: ['respond-over-jump-new-suit-two-level'] },
    ],
    rejectedResponseCalls: ['2D', '2NT', 'Double'],
    north: { S: 'K72', H: 'A43', D: '83', C: 'AQJ74' },
    east: { S: '84', H: 'T65', D: 'KQJT97', C: '92' },
    south: { S: 'AJ963', H: 'K87', D: '42', C: 'K86' },
    west: { S: 'QT5', H: 'QJ92', D: 'A65', C: 'T53' },
  },
  {
    description: '1H-(2S)-3C: a long club suit and game values; separate support cuebid and game routes remain visible.',
    practiceAuction: ['1H', '2S', '3C'],
    expectedResponseCalls: [
      { call: '3C', ruleIds: ['respond-over-jump-new-suit-three-level'] },
      { call: '3S', ruleIds: ['respond-over-jump-support-cuebid-major'] },
      { call: '4H', ruleIds: ['respond-over-jump-major-game-constructive'] },
    ],
    north: { S: '872', H: 'AKT96', D: 'AQ3', C: '54' },
    east: { S: 'AQJ965', H: '43', D: '84', C: 'T97' },
    south: { S: '', H: 'Q75', D: 'KJ2', C: 'AKQJ632' },
    west: { S: 'KT43', H: 'J82', D: 'T9765', C: '8' },
  },
  {
    description: '1H-(2S)-2NT: 12 balanced HCP with a spade stopper; informational Double also qualifies.',
    practiceAuction: ['1H', '2S', '2NT'],
    expectedResponseCalls: [
      { call: '2NT', ruleIds: ['respond-over-jump-natural-notrump'] },
      { call: 'Double', ruleIds: ['respond-over-jump-negative-double'] },
      { call: '3S', ruleIds: ['respond-over-jump-support-cuebid-major'] },
    ],
    rejectedResponseCalls: ['3NT', '3C'],
    north: { S: '872', H: 'AKT96', D: 'AQ3', C: '54' },
    east: { S: 'AQJ965', H: '43', D: '84', C: 'T97' },
    south: { S: 'KT', H: 'Q82', D: 'K976', C: 'KJ62' },
    west: { S: '43', H: 'J75', D: 'JT52', C: 'AQ83' },
  },
  {
    description: '1S-(3H)-3NT: 15 balanced HCP and a heart stopper; 4S is a constructive alternative.',
    practiceAuction: ['1S', '3H', '3NT'],
    expectedResponseCalls: [
      { call: '3NT', ruleIds: ['respond-over-jump-natural-notrump'] },
      { call: '4S', ruleIds: ['respond-over-jump-major-game-constructive'] },
    ],
    rejectedResponseCalls: ['2NT', 'Double', '3H'],
    north: { S: 'AKJ754', H: '82', D: 'AQ3', C: '65' },
    east: { S: '83', H: 'QJT9765', D: '87', C: 'T2' },
    south: { S: 'T96', H: 'AK3', D: 'J5', C: 'AK843' },
    west: { S: 'Q2', H: '4', D: 'KT9642', C: 'QJ97' },
  },
  {
    description: '1S-(3H)-Double: 12 HCP and four cards in both unbid minors after a three-level jump.',
    practiceAuction: ['1S', '3H', 'Double'],
    expectedResponseCalls: [
      { call: 'Double', ruleIds: ['respond-over-jump-negative-double'] },
    ],
    rejectedResponseCalls: ['3NT', '4S'],
    north: { S: 'AKJ754', H: '82', D: 'AQ3', C: '65' },
    east: { S: '83', H: 'QJT9765', D: '87', C: 'T2' },
    south: { S: '6', H: 'A43', D: 'KT942', C: 'KQ43' },
    west: { S: 'QT92', H: 'K', D: 'J65', C: 'AJ987' },
  },
  {
    description: '1S-(3H)-3S: cheapest raise stays available at three, with just nine support points.',
    practiceAuction: ['1S', '3H', '3S'],
    expectedResponseCalls: [
      { call: '3S', ruleIds: ['respond-over-jump-raise-cheapest-to-three'] },
    ],
    rejectedResponseCalls: ['2NT', 'Double', '4S'],
    north: { S: 'AKJ754', H: '82', D: 'AQ3', C: '65' },
    east: { S: '83', H: 'QJT9765', D: '87', C: 'T2' },
    south: { S: 'T92', H: 'K3', D: 'KT65', C: 'Q874' },
    west: { S: 'Q6', H: 'A4', D: 'J942', C: 'AKJ93' },
  },
  {
    description: '1H-(3S)-4H: constructive major game over a three-level preempt with adequate support.',
    practiceAuction: ['1H', '3S', '4H'],
    expectedResponseCalls: [
      { call: '4H', ruleIds: ['respond-over-jump-major-game-constructive'] },
    ],
    rejectedResponseCalls: ['3NT', 'Double'],
    north: { S: '872', H: 'AKT96', D: 'AQ3', C: '54' },
    east: { S: 'AQJT965', H: '43', D: '84', C: 'T9' },
    south: { S: 'K43', H: 'QJ8', D: 'KT9', C: 'AK83' },
    west: { S: '', H: '752', D: 'J7652', C: 'QJ762' },
  },
];
