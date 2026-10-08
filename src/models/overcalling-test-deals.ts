/// Overcalling test deals, kept separate from the bucket registry.

/// `import type` is erased by TypeScript when JavaScript is emitted. Although
/// test-deals-registry.ts imports these values, this type import creates no runtime cycle.
///
import type { RuleTestDeal } from './test-deals-registry';

/// Next seat natural overcalls: West opens, North overcalls.  With dealer West the recorded call
/// at index 1 is North's actual call; South's hand stays visible for subsequent experiments.
///
export const SIMPLE_OVERCALL_TEST_DEALS: RuleTestDeal[] = [
  {
    description: 'Good five-card spades, 7–17 total points: 1S over 1D.',
    dealer: 'W',
    practiceAuction: ['1D', '1S', 'Pass'],
    expectedOvercallCalls: [{ call: '1S', ruleIds: ['overcall-simple-suit-at-one-level'] }],
    north: { S: 'AQJ86', H: '762', D: '8', C: 'K964' },
    south: { S: 'T954', H: 'KQJ', D: 'KT9', C: 'AQJ' },
    west: { S: 'K72', H: 'A43', D: 'AQJ74', C: '83' },
  },
  {
    description: 'Good five-card hearts: one-level 1H over 1D.',
    dealer: 'W',
    practiceAuction: ['1D', '1H', 'Pass'],
    expectedOvercallCalls: [{ call: '1H', ruleIds: ['overcall-simple-suit-at-one-level'] }],
    north: { S: 'Q84', H: 'KQJ96', D: '65', C: 'A72' },
    south: { S: 'AJT9', H: 'T87', D: 'KT9', C: 'KQJ' },
    west: { S: 'K72', H: 'A43', D: 'AQJ74', C: '83' },
  },
  {
    description: 'Good six-card clubs and 13+ total points: non-jump 2C.',
    dealer: 'W',
    practiceAuction: ['1D', '2C', 'Pass'],
    expectedOvercallCalls: [{ call: '2C', ruleIds: ['overcall-simple-suit-at-two-level'] }],
    north: { S: 'AQ3', H: '82', D: '65', C: 'KQJ965' },
    south: { S: 'JT98', H: 'KQJ', D: 'KT9', C: 'AT7' },
    west: { S: 'K72', H: 'A43', D: 'AQJ74', C: '83' },
  },
  {
    description: 'Six hearts with two-level strength: 2H over 1S.',
    dealer: 'W',
    practiceAuction: ['1S', '2H', 'Pass'],
    expectedOvercallCalls: [{ call: '2H', ruleIds: ['overcall-simple-suit-at-two-level'] }],
    north: { S: 'Q3', H: 'AQJ965', D: 'K86', C: '72' },
    south: { S: 'T986', H: 'T74', D: 'AJT', C: 'AKQ' },
    west: { S: 'AKJ74', H: 'K82', D: 'Q93', C: '65' },
  },
  {
    description: 'Six diamonds with two-level strength: 2D over 1H.',
    dealer: 'W',
    practiceAuction: ['1H', '2D', 'Pass'],
    expectedOvercallCalls: [{ call: '2D', ruleIds: ['overcall-simple-suit-at-two-level'] }],
    north: { S: 'AQT', H: '62', D: 'KQJ985', C: '73' },
    south: { S: 'J976', H: 'KT9', D: '763', C: 'AKQ' },
    west: { S: 'K83', H: 'AQJ74', D: 'AT4', C: '95' },
  },
  {
    description: '15 HCP, seven excellent diamonds (18 points with length): overcall 1D ' +
                 'over 1C; the 17-point overcall ceiling is HCP, not length-adjusted points.',
    dealer: 'W',
    practiceAuction: ['1C', '1D', 'Pass'],
    expectedOvercallCalls: [{ call: '1D', ruleIds: ['overcall-simple-suit-at-one-level'] }],
    rejectedOvercallCalls: ['Double'],
    north: { S: 'T2', H: 'KQ', D: 'AKQT872', C: 'J3' },
    south: { S: 'J873', H: 'AT96', D: '54', C: 'A84' },
    west: { S: 'AK64', H: '2', D: '963', C: 'KQ972' },
  },
  {
    description: 'Spades good at one level; ordinary responder actions follow only if still available.',
    dealer: 'W',
    practiceAuction: ['1D', '1S', 'Pass'],
    expectedOvercallCalls: [{ call: '1S', ruleIds: ['overcall-simple-suit-at-one-level'] }],
    north: { S: 'AQJ86', H: 'K762', D: '8', C: '964' },
    south: { S: 'T954', H: 'QJT', D: 'KT9', C: 'AKQ' },
    west: { S: 'K72', H: 'A43', D: 'AQJ74', C: '83' },
  },
];

/// Next seat takeout doubles: West opens and North chooses the informational double.
/// Ordinary takeout doubles support every unbid suit; the strong exception does not require shape.
///
export const TAKEOUT_DOUBLE_TEST_DEALS: RuleTestDeal[] = [
  {
    description: '13 HCP, four cards in each unbid suit and a singleton heart: ' +
                 'ordinary takeout Double of 1H, using 16 points with shortage.',
    dealer: 'W',
    practiceAuction: ['1H', 'Double', 'Pass'],
    expectedOvercallCalls: [
      { call: 'Double', ruleIds: ['overcall-takeout-double-with-unbid-suit-support'] },
    ],
    rejectedOvercallCalls: ['1S', '2C', '2D'],
    north: { S: 'AQJ4', H: '2', D: 'K874', C: 'QJ86' },
    south: { S: 'T98', H: 'QJ5', D: 'AJ6', C: 'AK73' },
    west: { S: 'K72', H: 'AKT96', D: 'Q53', C: '54' },
  },
  {
    description: 'Exactly 18 HCP and only two clubs: strong takeout Double of 1H, despite ' +
                 'lacking the ordinary three-card support requirement in every unbid suit.',
    dealer: 'W',
    practiceAuction: ['1H', 'Double', 'Pass'],
    expectedOvercallCalls: [
      { call: 'Double', ruleIds: ['overcall-takeout-double-strong-hand'] },
    ],
    rejectedOvercallCalls: ['1S', '2S'],
    north: { S: 'AKQJ87', H: 'K4', D: 'A97', C: 'J6' },
    south: { S: '964', H: 'T93', D: 'J864', C: 'AQT' },
    west: { S: '532', H: 'AQJ76', D: 'KT5', C: 'K4' },
  },
];

/// Natural 1NT overcalls: the hand is balanced and has a stopper in opener's suit.
///
export const NATURAL_1NT_OVERCALL_TEST_DEALS: RuleTestDeal[] = [
  {
    description: '15 HCP and K83 in diamonds: natural 1NT over 1D with a stopper.',
    dealer: 'W',
    practiceAuction: ['1D', '1NT', 'Pass'],
    expectedOvercallCalls: [
      { call: '1NT', ruleIds: ['overcall-natural-1nt-with-stopper'] },
    ],
    north: { S: 'AQ4', H: 'KJ2', D: 'K83', C: 'QT95' },
    south: { S: 'T986', H: 'T876', D: 'T6', C: 'AKJ' },
    west: { S: 'K72', H: 'A43', D: 'AQJ74', C: '83' },
  },
  {
    description: '16 HCP with Kx in spades: natural 1NT over 1S with a stopper.',
    dealer: 'W',
    practiceAuction: ['1S', '1NT', 'Pass'],
    expectedOvercallCalls: [
      { call: '1NT', ruleIds: ['overcall-natural-1nt-with-stopper'] },
    ],
    north: { S: 'K8', H: 'AQ6', D: 'KJ84', C: 'QJT4' },
    south: { S: '963', H: 'T94', D: 'AT6', C: 'AK87' },
    west: { S: 'AQJ74', H: 'K82', D: 'Q93', C: '65' },
  },
];

/// Preemptive jump overcalls use the source's six-/seven-/eight-card suit requirements.
/// Non-jump suits are left to the existing simple-overcall treatment.
///
export const PREEMPTIVE_JUMP_OVERCALL_TEST_DEALS: RuleTestDeal[] = [
  {
    description: 'Six good hearts, 10 HCP: preemptive jump 2H over 1D.',
    dealer: 'W',
    practiceAuction: ['1D', '2H', 'Pass'],
    expectedOvercallCalls: [
      { call: '2H', ruleIds: ['overcall-preemptive-jump-at-two-level'] },
    ],
    north: { S: 'A8', H: 'KQJ976', D: '65', C: 'T95' },
    south: { S: 'T964', H: '85', D: 'K83', C: 'AKJ2' },
    west: { S: 'K72', H: 'A43', D: 'AQJ74', C: '83' },
  },
  {
    description: 'Six spades: 2S is a jump over 1H, not an economical two-level overcall.',
    dealer: 'W',
    practiceAuction: ['1H', '2S', 'Pass'],
    expectedOvercallCalls: [
      { call: '2S', ruleIds: ['overcall-preemptive-jump-at-two-level'] },
    ],
    north: { S: 'AQJ965', H: '43', D: '84', C: 'T96' },
    south: { S: 'T843', H: 'J82', D: 'AK6', C: 'A72' },
    west: { S: 'K72', H: 'AKT96', D: 'Q53', C: '54' },
  },
  {
    description: 'Seven good clubs, 6 HCP: jump 3C over 1D.',
    dealer: 'W',
    practiceAuction: ['1D', '3C', 'Pass'],
    expectedOvercallCalls: [
      { call: '3C', ruleIds: ['overcall-preemptive-jump-at-three-level'] },
    ],
    north: { S: 'T4', H: '86', D: '52', C: 'KQJT976' },
    south: { S: 'A963', H: 'KQT', D: 'K83', C: 'A52' },
    west: { S: 'K72', H: 'A43', D: 'AQJ74', C: '83' },
  },
  {
    description: 'Eight good spades, fewer than 10 HCP: four-level preemptive jump.',
    dealer: 'W',
    practiceAuction: ['1C', '4S', 'Pass'],
    expectedOvercallCalls: [
      { call: '4S', ruleIds: ['overcall-preemptive-jump-at-four-level'] },
    ],
    north: { S: 'AQJT9876', H: '87', D: 'T6', C: '6' },
    south: { S: '52', H: 'QJ32', D: 'A954', C: 'AK3' },
    west: { S: 'K43', H: 'AK5', D: 'Q7', C: 'J8542' },
  },
];

/// Direct defenses to opposing weak 2D/2H/2S openings.  This first batch stops after the
/// overcaller's action; advancer continuations are modeled separately.
///
export const WEAK_TWO_DEFENSE_TEST_DEALS: RuleTestDeal[] = [
  {
    description: 'Good five-card hearts and 15 points with length: natural 2H over weak 2D.',
    dealer: 'W',
    practiceAuction: ['2D', '2H', 'Pass'],
    expectedOvercallCalls: [
      { call: '2H', ruleIds: ['overcall-weak-two-natural-suit-at-two-level'] },
    ],
    north: { S: 'A6', H: 'AKT96', D: '42', C: 'QJ83' },
    south: { S: '9743', H: '542', D: '653', C: '652' },
    west: { S: '852', H: '73', D: 'KQJ987', C: 'T4' },
  },
  {
    description: 'Good five-card spades and 16 points with length: natural 2S over weak 2H.',
    dealer: 'W',
    practiceAuction: ['2H', '2S', 'Pass'],
    expectedOvercallCalls: [
      { call: '2S', ruleIds: ['overcall-weak-two-natural-suit-at-two-level'] },
    ],
    north: { S: 'AKT96', H: '42', D: 'AQ65', C: 'Q8' },
    south: { S: 'J753', H: '653', D: '942', C: '642' },
    west: { S: '842', H: 'KQJ987', D: '73', C: 'T5' },
  },
  {
    description: 'Good six-card hearts and 17 points with length: natural 3H over weak 2S.',
    dealer: 'W',
    practiceAuction: ['2S', '3H', 'Pass'],
    expectedOvercallCalls: [
      { call: '3H', ruleIds: ['overcall-weak-two-natural-suit-at-three-level'] },
    ],
    north: { S: 'A4', H: 'AQJT96', D: 'K6', C: 'J83' },
    south: { S: '6532', H: '753', D: '542', C: '642' },
    west: { S: 'KQJ987', H: '842', D: '73', C: 'T5' },
  },
  {
    description: '13 HCP with 3+ cards in every unbid suit: ordinary takeout Double of weak 2H.',
    dealer: 'W',
    practiceAuction: ['2H', 'Double', 'Pass'],
    expectedOvercallCalls: [
      { call: 'Double',
        ruleIds: ['overcall-weak-two-takeout-double-with-unbid-suit-support'] },
    ],
    north: { S: 'AQJ6', H: '2', D: 'K864', C: 'QJ86' },
    south: { S: '9753', H: '543', D: '952', C: '432' },
    west: { S: '842', H: 'KQJ987', D: '73', C: 'T5' },
  },
  {
    description: '19 HCP without three-card support everywhere: strong takeout Double of weak 2S.',
    dealer: 'W',
    practiceAuction: ['2S', 'Double', 'Pass'],
    expectedOvercallCalls: [
      { call: 'Double', ruleIds: ['overcall-weak-two-takeout-double-strong-hand'] },
    ],
    north: { S: 'A4', H: 'AKQJ7', D: 'A96', C: 'J62' },
    south: { S: '6532', H: '653', D: '542', C: '743' },
    west: { S: 'KQJ987', H: '842', D: '73', C: 'T5' },
  },
  {
    description: 'Balanced 15 HCP with the diamond ace: natural 2NT over weak 2D.',
    dealer: 'W',
    practiceAuction: ['2D', '2NT', 'Pass'],
    expectedOvercallCalls: [
      { call: '2NT', ruleIds: ['overcall-weak-two-natural-2nt-with-stopper'] },
    ],
    expectedOvercallCallOrder: [['2NT', 'Double']],
    north: { S: 'AKJ4', H: 'Q96', D: 'A54', C: 'J76' },
    south: { S: '9763', H: '542', D: '632', C: '532' },
    west: { S: '852', H: '73', D: 'KQJ987', C: 'T4' },
  },
];

/// Systems-on advances after a natural 2NT overcall of a weak two.  These deals cover the
/// ordinary game route plus Stayman, Jacoby, and Texas mechanics without adding slam continuations.
///
export const WEAK_TWO_2NT_CONTINUATION_TEST_DEALS: RuleTestDeal[] = [
  {
    description: 'Nine HCP and four hearts: use Stayman, then the 2NT overcaller shows hearts.',
    dealer: 'W',
    practiceAuction: ['2D', '2NT', 'Pass', '3C', 'Pass', '3H'],
    requiredSystem: { stayman: true },
    expectedOvercallCalls: [
      { call: '2NT', ruleIds: ['overcall-weak-two-natural-2nt-with-stopper'] },
    ],
    expectedAdvanceCalls: [
      { call: '3C', ruleIds: ['advance-weak-two-2nt-stayman'] },
    ],
    expectedOvercallerRebidCalls: [
      { call: '3H', ruleIds: ['overcaller-rebid-weak-two-2nt-stayman'] },
    ],
    north: { S: 'A84', H: 'KJ72', D: 'Q54', C: 'AQ6' },
    south: { S: 'K763', H: 'QT85', D: 'A32', C: '52' },
    west: { S: 'Q52', H: 'A3', D: 'KJT987', C: 'T4' },
  },
  {
    description: 'Weak five hearts: transfer with 3D and the 2NT overcaller completes 3H.',
    dealer: 'W',
    practiceAuction: ['2S', '2NT', 'Pass', '3D', 'Pass', '3H'],
    requiredSystem: { jacobyTransfers: true },
    expectedOvercallCalls: [
      { call: '2NT', ruleIds: ['overcall-weak-two-natural-2nt-with-stopper'] },
    ],
    expectedAdvanceCalls: [
      { call: '3D', ruleIds: ['advance-weak-two-2nt-transfer-to-hearts'] },
    ],
    expectedOvercallerRebidCalls: [
      { call: '3H', ruleIds: ['overcaller-rebid-weak-two-2nt-jacoby'] },
    ],
    north: { S: 'A54', H: 'KQ6', D: 'AJ84', C: 'QJ3' },
    south: { S: 'T32', H: 'JT975', D: 'K62', C: '84' },
    west: { S: 'KQJ987', H: '842', D: '73', C: 'T5' },
  },
  {
    description: 'Six spades and game values: Texas 4H asks the 2NT overcaller to bid 4S.',
    dealer: 'W',
    practiceAuction: ['2H', '2NT', 'Pass', '4H', 'Pass', '4S'],
    requiredSystem: { texasTransfers: true },
    expectedOvercallCalls: [
      { call: '2NT', ruleIds: ['overcall-weak-two-natural-2nt-with-stopper'] },
    ],
    expectedAdvanceCalls: [
      { call: '4H', ruleIds: ['advance-weak-two-2nt-texas-to-spades'] },
    ],
    expectedOvercallerRebidCalls: [
      { call: '4S', ruleIds: ['overcaller-rebid-weak-two-2nt-texas'] },
    ],
    north: { S: 'KQ6', H: 'A54', D: 'AJ84', C: 'QJ3' },
    south: { S: 'AJT975', H: '32', D: 'Q62', C: 'K4' },
    west: { S: '842', H: 'KQJ987', D: '73', C: 'T5' },
  },
  {
    description: 'Nine balanced HCP with no four-card major: place the contract in 3NT.',
    dealer: 'W',
    practiceAuction: ['2D', '2NT', 'Pass', '3NT'],
    expectedOvercallCalls: [
      { call: '2NT', ruleIds: ['overcall-weak-two-natural-2nt-with-stopper'] },
    ],
    expectedAdvanceCalls: [
      { call: '3NT', ruleIds: ['advance-weak-two-2nt-3nt-8-15'] },
    ],
    rejectedAdvanceCalls: ['3C', '3D', '3H'],
    north: { S: 'A84', H: 'KJ72', D: 'Q54', C: 'AQ6' },
    south: { S: 'K76', H: 'QT8', D: 'A32', C: '9752' },
    west: { S: 'Q52', H: 'A3', D: 'KJT987', C: 'T4' },
  },
  {
    description: 'With transfers off, a weak five-card spade suit can sign off naturally in 3S.',
    dealer: 'W',
    practiceAuction: ['2H', '2NT', 'Pass', '3S'],
    requiredSystem: { jacobyTransfers: false },
    expectedOvercallCalls: [
      { call: '2NT', ruleIds: ['overcall-weak-two-natural-2nt-with-stopper'] },
    ],
    expectedAdvanceCalls: [
      { call: '3S', ruleIds: ['advance-weak-two-2nt-natural-major-signoff'] },
    ],
    north: { S: 'KQ6', H: 'A54', D: 'AJ84', C: 'QJ3' },
    south: { S: 'AJT97', H: '32', D: 'Q62', C: '864' },
    west: { S: '842', H: 'KQJ987', D: '73', C: 'T5' },
  },
];

/// Compact DONT against an opposing strong 1NT.  These deals practice the direct convention,
/// advancer's basic pass-or-correct action, and the selected overcaller correction when needed.
/// Responder interference, 2NT game inquiries, and balancing-seat DONT remain outside this family.
///
export const DONT_1NT_DEFENSE_TEST_DEALS: RuleTestDeal[] = [
  {
    description: 'One-suited hearts: DONT Double, 2C relay, then reveal 2H.',
    dealer: 'W',
    practiceAuction: ['1NT', 'Double', 'Pass', '2C', 'Pass', '2H'],
    expectedOvercallCalls: [
      { call: 'Double', ruleIds: ['overcall-dont-single-suit-double'] },
    ],
    expectedAdvanceCalls: [
      { call: '2C', ruleIds: ['advance-dont-pass-or-correct'] },
    ],
    expectedOvercallerRebidCalls: [
      { call: '2H', ruleIds: ['overcaller-rebid-dont-pass-or-correct'] },
    ],
    north: { S: '84', H: 'KQJT96', D: 'A52', C: '73' },
    south: { S: 'T975', H: '753', D: 'Q84', C: 'T65' },
    west: { S: 'AKQJ', H: 'A84', D: 'JT9', C: 'J98' },
  },
  {
    description: 'Clubs plus hearts: 2C, 2D asks for the higher suit, then 2H.',
    dealer: 'W',
    practiceAuction: ['1NT', '2C', 'Pass', '2D', 'Pass', '2H'],
    expectedOvercallCalls: [
      { call: '2C', ruleIds: ['overcall-dont-clubs-plus-higher'] },
    ],
    expectedAdvanceCalls: [
      { call: '2D', ruleIds: ['advance-dont-pass-or-correct'] },
    ],
    expectedOvercallerRebidCalls: [
      { call: '2H', ruleIds: ['overcaller-rebid-dont-pass-or-correct'] },
    ],
    north: { S: '84', H: 'T976', D: '72', C: 'AQJ65' },
    south: { S: 'KQJ9', H: '854', D: 'QJ98', C: 'K9' },
    west: { S: 'AT76', H: 'AKQ', D: 'KT6', C: 'T87' },
  },
  {
    description: 'Clubs plus spades: advancer has three clubs and accepts 2C.',
    dealer: 'W',
    practiceAuction: ['1NT', '2C', 'Pass', 'Pass'],
    expectedOvercallCalls: [
      { call: '2C', ruleIds: ['overcall-dont-clubs-plus-higher'] },
    ],
    expectedAdvanceCalls: [
      { call: 'Pass', ruleIds: ['advance-dont-pass-or-correct'] },
    ],
    north: { S: 'KJ97', H: '63', D: '72', C: 'AQ965' },
    south: { S: 'T85', H: 'Q752', D: 'Q84', C: 'K72' },
    west: { S: 'AQ64', H: 'AKJ', D: 'JT9', C: 'JT8' },
  },
  {
    description: 'Diamonds plus spades: 2H asks for the major, then partner corrects to 2S.',
    dealer: 'W',
    practiceAuction: ['1NT', '2D', 'Pass', '2H', 'Pass', '2S'],
    expectedOvercallCalls: [
      { call: '2D', ruleIds: ['overcall-dont-diamonds-plus-major'] },
    ],
    expectedAdvanceCalls: [
      { call: '2H', ruleIds: ['advance-dont-pass-or-correct'] },
    ],
    expectedOvercallerRebidCalls: [
      { call: '2S', ruleIds: ['overcaller-rebid-dont-pass-or-correct'] },
    ],
    north: { S: 'A987', H: '63', D: 'KQJ65', C: '72' },
    south: { S: 'T54', H: 'QJ98', D: 'A8', C: 'T986' },
    west: { S: 'KQJ6', H: 'AKT', D: 'T97', C: 'K54' },
  },
  {
    description: 'Both majors: advancer prefers spades and the DONT bidder accepts 2S.',
    dealer: 'W',
    practiceAuction: ['1NT', '2H', 'Pass', '2S', 'Pass', 'Pass'],
    expectedOvercallCalls: [
      { call: '2H', ruleIds: ['overcall-dont-majors'] },
    ],
    expectedAdvanceCalls: [
      { call: '2S', ruleIds: ['advance-dont-pass-or-correct'] },
    ],
    expectedOvercallerRebidCalls: [
      { call: 'Pass', ruleIds: ['overcaller-rebid-dont-pass-or-correct'] },
    ],
    north: { S: 'K987', H: 'AQJ65', D: '84', C: '72' },
    south: { S: 'AQJT', H: '98', D: 'KQJ9', C: 'T96' },
    west: { S: '6543', H: 'KT7', D: 'AT7', C: 'AKQ' },
  },
  {
    description: 'One-suited spades: direct natural DONT 2S and advancer Pass.',
    dealer: 'W',
    practiceAuction: ['1NT', '2S', 'Pass', 'Pass'],
    expectedOvercallCalls: [
      { call: '2S', ruleIds: ['overcall-dont-natural-spades'] },
    ],
    expectedAdvanceCalls: [
      { call: 'Pass', ruleIds: ['advance-dont-pass-or-correct'] },
    ],
    north: { S: 'AQJT96', H: '63', D: 'K52', C: '73' },
    south: { S: '85', H: 'Q752', D: 'Q84', C: 'JT65' },
    west: { S: 'K743', H: 'AKJ', D: 'AJT', C: '984' },
  },
];
