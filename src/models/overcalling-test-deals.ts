/// Overcalling test deals, kept separate from the bucket registry.

/// `import type` is erased by TypeScript when JavaScript is emitted. Although
/// test-deals-registry.ts imports these values, this type import creates no runtime cycle.
///
import type { RuleTestDeal } from './test-deals-registry';

/// Next seat natural overcalls: North opens, East overcalls.  With dealer North the recorded call
/// at index 1 is East's actual call; West's hand stays visible for subsequent experiments.
///
export const SIMPLE_OVERCALL_TEST_DEALS: RuleTestDeal[] = [
  {
    description: 'Ten HCP with no good five-card suit or takeout-Double strength: Pass over 1D.',
    dealer: 'N', practiceAuction: ['1D', 'Pass'],
    north: { S: 'K72', H: 'A43', D: 'AQJ74', C: '83' },
    east: { S: 'QJ86', H: 'K972', D: '85', C: 'A64' },
    west: { S: 'T954', H: 'QJT', D: 'KT9', C: 'QJ7' },
    south: { S: 'A3', H: '865', D: '632', C: 'KT952' },
    expectedOvercallCalls: [{ call: 'Pass', ruleIds: ['overcall-pass-no-qualifying-action'] }],
    rejectedOvercallCalls: ['1S', '1H', '1NT', 'Double'],
  },
  {
    description: 'Good five-card spades and 10 HCP: 1S over 1D.',
    dealer: 'N',
    practiceAuction: ['1D', '1S', 'Pass'],
    expectedOvercallCalls: [{ call: '1S', ruleIds: ['overcall-simple-suit-at-one-level'] }],
    east: { S: 'AQJ86', H: '762', D: '8', C: 'K964' },
    west: { S: 'T954', H: 'KQJ', D: 'T93', C: 'AJ7' },
    south: { S: '3', H: 'T985', D: 'K652', C: 'QT52' },
    north: { S: 'K72', H: 'A43', D: 'AQJ74', C: '83' },
  },
  {
    description: 'Good five-card hearts: one-level 1H over 1D.',
    dealer: 'N',
    practiceAuction: ['1D', '1H', 'Pass'],
    expectedOvercallCalls: [{ call: '1H', ruleIds: ['overcall-simple-suit-at-one-level'] }],
    east: { S: 'Q84', H: 'KQJ96', D: '65', C: 'A72' },
    west: { S: 'AJT9', H: 'T87', D: 'T93', C: 'KJ5' },
    south: { S: '653', H: '52', D: 'K82', C: 'QT964' },
    north: { S: 'K72', H: 'A43', D: 'AQJ74', C: '83' },
  },
  {
    description: 'Good six-card clubs and 13+ total points: non-jump 2C.',
    dealer: 'N',
    practiceAuction: ['1D', '2C', 'Pass'],
    expectedOvercallCalls: [{ call: '2C', ruleIds: ['overcall-simple-suit-at-two-level'] }],
    east: { S: 'AQ3', H: '82', D: '65', C: 'KQJ965' },
    west: { S: 'JT98', H: 'KQJ', D: 'T93', C: 'T72' },
    south: { S: '654', H: 'T9765', D: 'K82', C: 'A4' },
    north: { S: 'K72', H: 'A43', D: 'AQJ74', C: '83' },
  },
  {
    description: 'Six hearts with two-level strength: 2H over 1S.',
    dealer: 'N',
    practiceAuction: ['1S', '2H', 'Pass'],
    expectedOvercallCalls: [{ call: '2H', ruleIds: ['overcall-simple-suit-at-two-level'] }],
    east: { S: 'Q3', H: 'AQJ965', D: 'K86', C: '72' },
    west: { S: 'T986', H: 'T4', D: 'AJT', C: 'KQ83' },
    south: { S: '52', H: '73', D: '7542', C: 'AJT94' },
    north: { S: 'AKJ74', H: 'K82', D: 'Q93', C: '65' },
  },
  {
    description: 'Six diamonds with two-level strength: 2D over 1H.',
    dealer: 'N',
    practiceAuction: ['1H', '2D', 'Pass'],
    expectedOvercallCalls: [{ call: '2D', ruleIds: ['overcall-simple-suit-at-two-level'] }],
    east: { S: 'AQT', H: 'K2', D: 'KQJ985', C: '73' },
    west: { S: 'J976', H: 'T98', D: '763', C: 'AK2' },
    south: { S: '5432', H: '53', D: '2', C: 'QJT864' },
    north: { S: 'K8', H: 'AQJ764', D: 'AT4', C: '95' },
  },
  {
    description: '15 HCP, seven excellent diamonds (18 points with length): overcall 1D ' +
                 'over 1C; the 17-point overcall ceiling is HCP, not length-adjusted points.',
    dealer: 'N',
    practiceAuction: ['1C', '1D', 'Pass'],
    expectedOvercallCalls: [{ call: '1D', ruleIds: ['overcall-simple-suit-at-one-level'] }],
    rejectedOvercallCalls: ['Double'],
    east: { S: 'T2', H: 'KQ', D: 'AKQT872', C: 'J3' },
    west: { S: 'J873', H: 'AT96', D: '54', C: 'A84' },
    south: { S: 'Q95', H: 'J87543', D: 'J', C: 'T65' },
    north: { S: 'AK64', H: '2', D: '963', C: 'KQ972' },
  },
  {
    description: 'Spades good at one level; ordinary responder actions follow only if still available.',
    dealer: 'N',
    practiceAuction: ['1D', '1S', 'Pass'],
    expectedOvercallCalls: [{ call: '1S', ruleIds: ['overcall-simple-suit-at-one-level'] }],
    east: { S: 'AQJ86', H: 'K762', D: '8', C: '964' },
    west: { S: 'T954', H: 'QJT', D: 'KT9', C: 'AK7' },
    south: { S: '3', H: '985', D: '6532', C: 'QJT52' },
    north: { S: 'K72', H: 'A43', D: 'AQJ74', C: '83' },
  },
];

/// Next seat takeout doubles: North opens and East chooses the informational double.
/// Ordinary takeout doubles support every unbid suit; the strong exception does not require shape.
///
export const TAKEOUT_DOUBLE_TEST_DEALS: RuleTestDeal[] = [
  {
    description: '13 HCP, four cards in each unbid suit and a singleton heart: ' +
                 'ordinary takeout Double of 1H, using 16 points with shortage.',
    dealer: 'N',
    practiceAuction: ['1H', 'Double'],
    expectedOvercallCalls: [
      { call: 'Double', ruleIds: ['overcall-takeout-double-with-unbid-suit-support'] },
    ],
    rejectedOvercallCalls: ['1S', '2C', '2D'],
    east: { S: 'AQJ4', H: '2', D: 'K874', C: 'QJ86' },
    west: { S: 'T98', H: 'QJ5', D: 'AJ6', C: 'AT73' },
    south: { S: '653', H: '8743', D: 'T92', C: 'K92' },
    north: { S: 'K72', H: 'AKT96', D: 'Q53', C: '54' },
  },
  {
    description: 'Exactly 18 HCP and only two clubs: strong takeout Double of 1H, despite ' +
                 'lacking the ordinary three-card support requirement in every unbid suit.',
    dealer: 'N',
    practiceAuction: ['1H', 'Double'],
    expectedOvercallCalls: [
      { call: 'Double', ruleIds: ['overcall-takeout-double-strong-hand'] },
    ],
    rejectedOvercallCalls: ['1S', '2S'],
    east: { S: 'AKQJ87', H: 'K4', D: 'A97', C: 'J6' },
    west: { S: '964', H: 'T93', D: 'J864', C: 'AQT' },
    south: { S: 'T', H: '852', D: 'Q32', C: '987532' },
    north: { S: '532', H: 'AQJ76', D: 'KT5', C: 'K4' },
  },
];

/// Natural 1NT overcalls: the hand is balanced and has a stopper in opener's suit.
///
export const NATURAL_1NT_OVERCALL_TEST_DEALS: RuleTestDeal[] = [
  {
    description: '15 HCP and K83 in diamonds: natural 1NT over 1D with a stopper.',
    dealer: 'N',
    practiceAuction: ['1D', '1NT', 'Pass'],
    expectedOvercallCalls: [
      { call: '1NT', ruleIds: ['overcall-natural-1nt-with-stopper'] },
    ],
    east: { S: 'AQ4', H: 'KJ2', D: 'K83', C: 'QT95' },
    west: { S: 'T986', H: 'T876', D: 'T6', C: 'AKJ' },
    south: { S: 'J53', H: 'Q95', D: '952', C: '7642' },
    north: { S: 'K72', H: 'A43', D: 'AQJ74', C: '83' },
  },
  {
    description: '16 HCP with Kx in spades: natural 1NT over 1S with a stopper.',
    dealer: 'N',
    practiceAuction: ['1S', '1NT', 'Pass'],
    expectedOvercallCalls: [
      { call: '1NT', ruleIds: ['overcall-natural-1nt-with-stopper'] },
    ],
    east: { S: 'K8', H: 'AQ6', D: 'KJ84', C: 'QJT4' },
    west: { S: '963', H: 'T94', D: 'AT6', C: 'A872' },
    south: { S: 'T52', H: 'J753', D: '752', C: 'K93' },
    north: { S: 'AQJ74', H: 'K82', D: 'Q93', C: '65' },
  },
];

/// Preemptive jump overcalls use the source's six-/seven-/eight-card suit requirements.
/// Non-jump suits are left to the existing simple-overcall treatment.
///
export const PREEMPTIVE_JUMP_OVERCALL_TEST_DEALS: RuleTestDeal[] = [
  {
    description: 'Six good hearts, 10 HCP: preemptive jump 2H over 1D.',
    dealer: 'N',
    practiceAuction: ['1D', '2H', 'Pass'],
    expectedOvercallCalls: [
      { call: '2H', ruleIds: ['overcall-preemptive-jump-at-two-level'] },
    ],
    east: { S: 'A8', H: 'KQJ976', D: '65', C: 'T95' },
    west: { S: 'T964', H: '85', D: 'K83', C: 'AKJ2' },
    south: { S: 'QJ53', H: 'T2', D: 'T92', C: 'Q764' },
    north: { S: 'K72', H: 'A43', D: 'AQJ74', C: '83' },
  },
  {
    description: 'Six spades: 2S is a jump over 1H, not an economical two-level overcall.',
    dealer: 'N',
    practiceAuction: ['1H', '2S', 'Pass'],
    expectedOvercallCalls: [
      { call: '2S', ruleIds: ['overcall-preemptive-jump-at-two-level'] },
    ],
    east: { S: 'AQJ965', H: '43', D: '84', C: 'T96' },
    west: { S: 'T843', H: 'J82', D: 'AK6', C: 'A72' },
    south: { S: '2', H: '75', D: 'JT972', C: 'KQJ83' },
    north: { S: 'K7', H: 'AKQT96', D: 'Q53', C: '54' },
  },
  {
    description: 'Seven good clubs, 6 HCP: jump 3C over 1D.',
    dealer: 'N',
    practiceAuction: ['1D', '3C', 'Pass'],
    expectedOvercallCalls: [
      { call: '3C', ruleIds: ['overcall-preemptive-jump-at-three-level'] },
    ],
    east: { S: 'T4', H: '86', D: '52', C: 'KQJT976' },
    west: { S: 'A963', H: 'KT5', D: 'K83', C: 'A52' },
    south: { S: 'QJ85', H: 'QJ972', D: 'T96', C: '4' },
    north: { S: 'K72', H: 'A43', D: 'AQJ74', C: '83' },
  },
  {
    description: 'Eight good spades, fewer than 10 HCP: four-level preemptive jump.',
    dealer: 'N',
    practiceAuction: ['1C', '4S', 'Pass'],
    expectedOvercallCalls: [
      { call: '4S', ruleIds: ['overcall-preemptive-jump-at-four-level'] },
    ],
    east: { S: 'AQJT9876', H: '87', D: 'T6', C: '6' },
    west: { S: '52', H: 'QJ32', D: 'A954', C: 'AK3' },
    south: { S: '', H: 'T964', D: 'KJ832', C: 'QT97' },
    north: { S: 'K43', H: 'AK5', D: 'Q7', C: 'J8542' },
  },
];

/// Direct defenses to opposing weak 2D/2H/2S openings.  This first batch stops after the
/// overcaller's action; advancer continuations are modeled separately.
///
export const WEAK_TWO_DEFENSE_TEST_DEALS: RuleTestDeal[] = [
  {
    description: 'Ten HCP without a good overcall suit or takeout-double strength: Pass over weak 2D.',
    dealer: 'N', practiceAuction: ['2D', 'Pass'],
    north: { S: '852', H: '73', D: 'KQJ987', C: 'T4' },
    east: { S: 'A64', H: 'K986', D: '42', C: 'QJ65' },
    west: { S: 'KT93', H: 'AT5', D: 'A53', C: '987' },
    south: { S: 'QJ7', H: 'QJ42', D: 'T6', C: 'AK32' },
    expectedOvercallCalls: [{ call: 'Pass', ruleIds: ['overcall-pass-no-qualifying-action'] }],
    rejectedOvercallCalls: ['2H', '2NT', '3C', 'Double'],
  },
  {
    description: 'Good five-card hearts and 15 points with length: natural 2H over weak 2D.',
    dealer: 'N',
    practiceAuction: ['2D', '2H', 'Pass'],
    expectedOvercallCalls: [
      { call: '2H', ruleIds: ['overcall-weak-two-natural-suit-at-two-level'] },
    ],
    east: { S: 'A6', H: 'AKT96', D: '42', C: 'QJ83' },
    west: { S: 'K743', H: '542', D: 'A53', C: 'A65' },
    south: { S: 'QJT9', H: 'QJ8', D: 'T6', C: 'K972' },
    north: { S: '852', H: '73', D: 'KQJ987', C: 'T4' },
  },
  {
    description: 'Good five-card spades and 16 points with length: natural 2S over weak 2H.',
    dealer: 'N',
    practiceAuction: ['2H', '2S', 'Pass'],
    expectedOvercallCalls: [
      { call: '2S', ruleIds: ['overcall-weak-two-natural-suit-at-two-level'] },
    ],
    east: { S: 'AKT96', H: '42', D: 'AQ65', C: 'Q8' },
    west: { S: 'QJ53', H: 'A53', D: '942', C: 'A64' },
    south: { S: '7', H: 'T6', D: 'KJT8', C: 'KJ9732' },
    north: { S: '842', H: 'KQJ987', D: '73', C: 'T5' },
  },
  {
    description: 'Good six-card hearts and 17 points with length: natural 3H over weak 2S.',
    dealer: 'N',
    practiceAuction: ['2S', '3H', 'Pass'],
    expectedOvercallCalls: [
      { call: '3H', ruleIds: ['overcall-weak-two-natural-suit-at-three-level'] },
    ],
    east: { S: 'A4', H: 'AQJT96', D: 'K6', C: 'J83' },
    west: { S: '653', H: 'K7', D: 'A842', C: 'A942' },
    south: { S: 'T2', H: '53', D: 'QJT95', C: 'KQ76' },
    north: { S: 'KQJ987', H: '842', D: '73', C: 'T5' },
  },
  {
    description: '15 HCP with four cards in each unbid suit: ordinary takeout Double of weak 2H.',
    dealer: 'N',
    practiceAuction: ['2H', 'Double', 'Pass'],
    expectedOvercallCalls: [
      { call: 'Double',
        ruleIds: ['overcall-weak-two-takeout-double-with-unbid-suit-support'] },
    ],
    east: { S: 'AQJ6', H: '2', D: 'AK86', C: 'J863' },
    west: { S: 'K97', H: '6543', D: 'Q92', C: 'Q42' },
    south: { S: 'T53', H: 'AT', D: 'JT54', C: 'A975' },
    north: { S: '842', H: 'KQJ987', D: '73', C: 'KT' },
  },
  {
    description: '19 HCP without three-card support everywhere: strong takeout Double of weak 2S.',
    dealer: 'N',
    practiceAuction: ['2S', 'Double', 'Pass'],
    expectedOvercallCalls: [
      { call: 'Double', ruleIds: ['overcall-weak-two-takeout-double-strong-hand'] },
    ],
    east: { S: 'A4', H: 'AKQJ7', D: 'A96', C: 'J62' },
    west: { S: '6532', H: '3', D: '8542', C: 'AQ43' },
    south: { S: 'T', H: 'T965', D: 'KQJT', C: 'K987' },
    north: { S: 'KQJ987', H: '842', D: '73', C: 'T5' },
  },
  {
    description: 'Balanced 15 HCP with the diamond ace: natural 2NT over weak 2D.',
    dealer: 'N',
    practiceAuction: ['2D', '2NT', 'Pass'],
    expectedOvercallCalls: [
      { call: '2NT', ruleIds: ['overcall-weak-two-natural-2nt-with-stopper'] },
    ],
    expectedOvercallCallOrder: [['2NT', 'Double']],
    east: { S: 'AKJ4', H: 'Q96', D: 'A54', C: 'J76' },
    west: { S: '973', H: 'A842', D: '32', C: 'AK82' },
    south: { S: 'QT6', H: 'KJT5', D: 'T6', C: 'Q953' },
    north: { S: '852', H: '73', D: 'KQJ987', C: 'T4' },
  },
];

/// Systems-on advances after a natural 2NT overcall of a weak two.  These deals cover the
/// ordinary game route plus Stayman, Jacoby, and Texas mechanics without adding slam continuations.
///
export const WEAK_TWO_2NT_CONTINUATION_TEST_DEALS: RuleTestDeal[] = [
  {
    description: 'Nine HCP and four hearts: use Stayman, then the 2NT overcaller shows hearts.',
    dealer: 'N',
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
    rejectedOvercallerRebidCalls: ['Pass'],
    east: { S: 'A84', H: 'AJ72', D: 'Q54', C: 'AQ6' },
    west: { S: 'K763', H: 'QT85', D: 'A32', C: '52' },
    south: { S: 'JT9', H: '964', D: '6', C: 'KJ9873' },
    north: { S: 'Q52', H: 'K3', D: 'KJT987', C: 'T4' },
  },
  {
    description: 'Weak five hearts: transfer with 3D and the 2NT overcaller completes 3H.',
    dealer: 'N',
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
    rejectedOvercallerRebidCalls: ['Pass'],
    east: { S: 'A54', H: 'KQ6', D: 'AJ84', C: 'QJ3' },
    west: { S: 'T32', H: 'JT975', D: 'K62', C: '84' },
    south: { S: '6', H: 'A83', D: 'QT95', C: 'A9765' },
    north: { S: 'KQJ987', H: '42', D: '73', C: 'KT2' },
  },
  {
    description: 'Six spades and game values: Texas 4H asks the 2NT overcaller to bid 4S.',
    dealer: 'N',
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
    rejectedOvercallerRebidCalls: ['Pass'],
    east: { S: 'KQ6', H: 'A54', D: 'AJ84', C: 'QJ3' },
    west: { S: 'AJT975', H: '32', D: 'Q62', C: 'K4' },
    south: { S: '3', H: 'T6', D: 'KT95', C: 'A98762' },
    north: { S: '842', H: 'KQJ987', D: '73', C: 'T5' },
  },
  {
    description: 'Nine balanced HCP with no four-card major: place the contract in 3NT.',
    dealer: 'N',
    practiceAuction: ['2D', '2NT', 'Pass', '3NT', 'Pass', 'Pass'],
    expectedOvercallCalls: [
      { call: '2NT', ruleIds: ['overcall-weak-two-natural-2nt-with-stopper'] },
    ],
    expectedAdvanceCalls: [
      { call: '3NT', ruleIds: ['advance-weak-two-2nt-3nt-8-15'] },
    ],
    rejectedAdvanceCalls: ['3C', '3D', '3H'],
    expectedOvercallerRebidCalls: [{ call: 'Pass', ruleIds: [
      'overcaller-rebid-weak-two-2nt-natural-signoff-pass',
    ] }],
    east: { S: 'A84', H: 'AJ72', D: 'Q54', C: 'AQ6' },
    west: { S: 'K76', H: 'QT8', D: 'A32', C: '9752' },
    south: { S: 'JT93', H: '9654', D: '6', C: 'KJ83' },
    north: { S: 'Q52', H: 'K3', D: 'KJT987', C: 'T4' },
  },
  {
    description: 'With transfers off, a weak five-card spade suit can sign off naturally in 3S.',
    dealer: 'N',
    practiceAuction: ['2H', '2NT', 'Pass', '3S', 'Pass', 'Pass'],
    requiredSystem: { jacobyTransfers: false },
    expectedOvercallCalls: [
      { call: '2NT', ruleIds: ['overcall-weak-two-natural-2nt-with-stopper'] },
    ],
    expectedAdvanceCalls: [
      { call: '3S', ruleIds: ['advance-weak-two-2nt-natural-major-signoff'] },
    ],
    expectedOvercallerRebidCalls: [{ call: 'Pass', ruleIds: [
      'overcaller-rebid-weak-two-2nt-natural-signoff-pass',
    ] }],
    east: { S: 'KQ6', H: 'A54', D: 'AJ84', C: 'QJ3' },
    west: { S: 'AJT97', H: '32', D: 'Q62', C: '864' },
    south: { S: '53', H: 'T6', D: 'KT95', C: 'A9752' },
    north: { S: '842', H: 'KQJ987', D: '73', C: 'KT' },
  },
  {
    description: 'When Texas is off, a six-card heart suit can place game naturally in 4H.',
    dealer: 'N', practiceAuction: ['2D', '2NT', 'Pass', '4H', 'Pass', 'Pass'],
    requiredSystem: { texasTransfers: false },
    north: { S: 'Q52', H: 'K3', D: 'KJT987', C: 'T4' },
    east: { S: 'A84', H: 'AJ72', D: 'Q54', C: 'AQ6' },
    west: { S: 'K76', H: 'QT9865', D: 'A63', C: 'K' },
    south: { S: 'JT93', H: '4', D: '2', C: 'J987532' },
    expectedAdvanceCalls: [{ call: '4H', ruleIds: [
      'advance-weak-two-2nt-natural-major-game',
    ] }],
    expectedOvercallerRebidCalls: [{ call: 'Pass', ruleIds: [
      'overcaller-rebid-weak-two-2nt-natural-signoff-pass',
    ] }],
  },
];

/// Selected weak-two defense rebids with complete real hands and partnership promises.
/// The test group intentionally contrasts nonforcing signoffs with forcing advances.
export const WEAK_TWO_REBID_TEST_DEALS: RuleTestDeal[] = [
  {
    description: 'Ordinary weak-two takeout Doubler Passes a forced minimum 2S advance.',
    dealer: 'N', practiceAuction: ['2H', 'Double', 'Pass', '2S', 'Pass', 'Pass'],
    north: { S: '842', H: 'KQJ987', D: '73', C: 'KT' },
    east: { S: 'AQJ6', H: '2', D: 'AK86', C: 'J863' },
    west: { S: 'K97', H: '6543', D: 'Q92', C: 'Q42' },
    south: { S: 'T53', H: 'AT', D: 'JT54', C: 'A975' },
    expectedOvercallCalls: [{ call: 'Double', ruleIds: [
      'overcall-weak-two-takeout-double-with-unbid-suit-support',
    ] }],
    expectedAdvanceCalls: [{ call: '2S', ruleIds: ['advance-takeout-double-minimum-suit'] }],
    expectedOvercallerRebidCalls: [{ call: 'Pass', ruleIds: [
      'overcaller-rebid-weak-two-double-minimum-pass',
    ] }],
    rejectedOvercallerRebidCalls: ['3S', '3NT'],
  },
  {
    description: 'Sixteen-HCP Doubler with four hearts accepts advancer’s 3H invitation at game.',
    dealer: 'N', practiceAuction: ['2D', 'Double', 'Pass', '3H', 'Pass', '4H'],
    north: { S: '852', H: '73', D: 'KQJ987', C: 'T4' },
    east: { S: 'AQJ4', H: 'KQ86', D: '2', C: 'KJ86' },
    west: { S: 'T976', H: 'AJ95', D: 'A63', C: '92' },
    south: { S: 'K3', H: 'T42', D: 'T54', C: 'AQ753' },
    expectedAdvanceCalls: [{ call: '3H', ruleIds: [
      'advance-takeout-double-invitational-jump',
    ] }],
    expectedOvercallerRebidCalls: [{ call: '4H', ruleIds: [
      'overcaller-rebid-weak-two-double-jump-game',
    ] }],
    rejectedOvercallerRebidCalls: ['Pass'],
  },
  {
    description: 'Strong 19-HCP weak-two takeout Doubler describes a good heart suit after 3C.',
    dealer: 'N', practiceAuction: ['2S', 'Double', 'Pass', '3C', 'Pass', '3H'],
    north: { S: 'KQJ987', H: '842', D: '73', C: 'T5' },
    east: { S: 'A4', H: 'AKQJ7', D: 'A96', C: 'J62' },
    west: { S: '653', H: '3', D: '8542', C: 'AQ743' },
    south: { S: 'T2', H: 'T965', D: 'KQJT', C: 'K98' },
    expectedOvercallCalls: [{ call: 'Double', ruleIds: [
      'overcall-weak-two-takeout-double-strong-hand',
    ] }],
    expectedAdvanceCalls: [{ call: '3C', ruleIds: ['advance-takeout-double-minimum-suit'] }],
    expectedOvercallerRebidCalls: [{ call: '3H', ruleIds: [
      'overcaller-rebid-weak-two-double-strong-suit',
    ] }],
    rejectedOvercallerRebidCalls: ['Pass'],
  },
  {
    description: 'Ordinary 13-HCP Doubler declines an 11-HCP natural 2NT invitation.',
    dealer: 'N', practiceAuction: ['2H', 'Double', 'Pass', '2NT', 'Pass', 'Pass'],
    north: { S: '842', H: 'KQJ987', D: '73', C: 'T5' },
    east: { S: 'AQJ6', H: '2', D: 'K864', C: 'QJ86' },
    west: { S: 'K95', H: 'A63', D: 'J52', C: 'K743' },
    south: { S: 'T73', H: 'T54', D: 'AQT9', C: 'A92' },
    expectedAdvanceCalls: [{ call: '2NT', ruleIds: [
      'advance-takeout-double-two-notrump',
    ] }],
    expectedOvercallerRebidCalls: [{ call: 'Pass', ruleIds: [
      'overcaller-rebid-weak-two-double-nt-pass',
    ] }],
    rejectedOvercallerRebidCalls: ['3NT'],
  },
  {
    description: 'A 16-HCP Doubler accepts the balanced, stopped 2NT invitation at 3NT.',
    dealer: 'N', practiceAuction: ['2H', 'Double', 'Pass', '2NT', 'Pass', '3NT'],
    north: { S: '842', H: 'KQJ987', D: '73', C: 'T5' },
    east: { S: 'AQJ6', H: '2', D: 'K864', C: 'KQJ8' },
    west: { S: 'K95', H: 'A63', D: 'J52', C: 'A743' },
    south: { S: 'T73', H: 'T54', D: 'AQT9', C: '962' },
    expectedAdvanceCalls: [{ call: '2NT', ruleIds: [
      'advance-takeout-double-two-notrump',
    ] }],
    expectedOvercallerRebidCalls: [{ call: '3NT', ruleIds: [
      'overcaller-rebid-weak-two-double-nt-game',
    ] }],
    rejectedOvercallerRebidCalls: ['Pass'],
  },
  {
    description: 'Forcing 3H cuebid after a weak-two Double requires a natural 3S answer.',
    dealer: 'N', practiceAuction: ['2H', 'Double', 'Pass', '3H', 'Pass', '3S'],
    north: { S: '842', H: 'KQJ987', D: '73', C: 'T5' },
    east: { S: 'AQJ6', H: '2', D: 'K864', C: 'QJ86' },
    west: { S: 'K975', H: 'A63', D: 'AQ5', C: 'A92' },
    south: { S: 'T3', H: 'T54', D: 'JT92', C: 'K743' },
    expectedAdvanceCalls: [{ call: '3H', ruleIds: [
      'advance-takeout-double-strong-cuebid',
    ] }],
    expectedOvercallerRebidCalls: [{ call: '3S', ruleIds: [
      'overcaller-rebid-weak-two-double-cue-suit',
    ] }],
    rejectedOvercallerRebidCalls: ['Pass'],
  },
  {
    description: 'After a weak-two takeout Double, a direct 4S is natural game and partner Passes.',
    dealer: 'N', practiceAuction: ['2H', 'Double', 'Pass', '4S', 'Pass', 'Pass'],
    north: { S: '842', H: 'KQJ987', D: '73', C: 'T5' },
    east: { S: 'AQJ6', H: '2', D: 'K864', C: 'QJ86' },
    west: { S: 'K9753', H: 'A63', D: 'AQ5', C: '92' },
    south: { S: 'T', H: 'T54', D: 'JT92', C: 'AK743' },
    expectedAdvanceCalls: [{ call: '4S', ruleIds: [
      'advance-weak-two-double-direct-major-game',
    ] }],
    expectedOvercallerRebidCalls: [{ call: 'Pass', ruleIds: [
      'overcaller-rebid-weak-two-double-game-pass',
    ] }],
  },
  {
    description: 'Ordinary two-level natural weak-two overcaller Passes a constructive 3H raise.',
    dealer: 'N', practiceAuction: ['2D', '2H', 'Pass', '3H', 'Pass', 'Pass'],
    north: { S: '852', H: '73', D: 'KQJ987', C: 'KT' },
    east: { S: 'A6', H: 'AKT96', D: '42', C: 'QJ83' },
    west: { S: 'J743', H: 'QJ2', D: 'A63', C: '652' },
    south: { S: 'KQT9', H: '854', D: 'T5', C: 'A974' },
    expectedAdvanceCalls: [{ call: '3H', ruleIds: [
      'advance-two-level-suit-overcall-simple-raise',
    ] }],
    expectedOvercallerRebidCalls: [{ call: 'Pass', ruleIds: [
      'overcaller-rebid-weak-two-suit-raise-pass',
    ] }],
    rejectedOvercallerRebidCalls: ['4H'],
  },
  {
    description: 'Upper-range six-card heart overcall accepts the constructive raise at game.',
    dealer: 'N', practiceAuction: ['2D', '2H', 'Pass', '3H', 'Pass', '4H'],
    north: { S: '852', H: '73', D: 'KQJ987', C: 'T4' },
    east: { S: 'A6', H: 'AKT965', D: '4', C: 'KQJ8' },
    west: { S: '9743', H: 'QJ2', D: 'A63', C: '652' },
    south: { S: 'KQJT', H: '84', D: 'T52', C: 'A973' },
    expectedOvercallerRebidCalls: [{ call: '4H', ruleIds: [
      'overcaller-rebid-weak-two-suit-raise-game',
    ] }],
    rejectedOvercallerRebidCalls: ['Pass'],
  },
  {
    description: 'Natural new-suit advance is forcing: overcaller supports five spades at 3S.',
    dealer: 'N', practiceAuction: ['2D', '2H', 'Pass', '2S', 'Pass', '3S'],
    north: { S: '852', H: '73', D: 'KQJ987', C: 'T4' },
    east: { S: 'AQ6', H: 'AKT96', D: '4', C: 'J873' },
    west: { S: 'KJ973', H: 'QJ2', D: 'A65', C: '65' },
    south: { S: 'T4', H: '854', D: 'T32', C: 'AKQ92' },
    expectedAdvanceCalls: [{ call: '2S', ruleIds: [
      'advance-two-level-suit-overcall-new-suit-at-two-level',
    ] }],
    expectedOvercallerRebidCalls: [{ call: '3S', ruleIds: [
      'overcaller-rebid-weak-two-suit-new-support',
    ] }],
    rejectedOvercallerRebidCalls: ['Pass'],
  },
  {
    description: 'Strong support cuebid after a natural weak-two overcall gets a minimum 3H return.',
    dealer: 'N', practiceAuction: ['2D', '2H', 'Pass', '3D', 'Pass', '3H'],
    north: { S: '852', H: '73', D: 'KQJ987', C: 'T4' },
    east: { S: 'A6', H: 'AKT96', D: '42', C: 'QJ83' },
    west: { S: 'K974', H: 'QJ2', D: 'A63', C: 'A62' },
    south: { S: 'QJT3', H: '854', D: 'T5', C: 'K975' },
    expectedAdvanceCalls: [{ call: '3D', ruleIds: [
      'advance-two-level-suit-overcall-support-cuebid',
    ] }],
    expectedOvercallerRebidCalls: [{ call: '3H', ruleIds: [
      'overcaller-rebid-weak-two-suit-cue-return',
    ] }],
    rejectedOvercallerRebidCalls: ['Pass'],
  },
];

/// Selected natural 1NT overcaller rebids. Advancer uses the shared 1NT response system;
/// these examples complete the immediate convention or natural invitation without extending
/// into advancer's second bid or general competitive slam exploration.
///
export const NATURAL_1NT_OVERCALL_REBID_TEST_DEALS: RuleTestDeal[] = [
  {
    description: 'After Stayman, the 1NT overcaller denies a four-card major with 2D.',
    dealer: 'N', practiceAuction: ['1D', '1NT', 'Pass', '2C', 'Pass', '2D'],
    requiredSystem: { stayman: true },
    north: { S: 'K72', H: 'A43', D: 'QJ974', C: 'K8' },
    east: { S: 'A96', H: 'KJ8', D: 'K65', C: 'AT76' },
    west: { S: 'QJ85', H: 'Q72', D: 'A83', C: '954' },
    south: { S: 'T43', H: 'T965', D: 'T2', C: 'QJ32' },
    expectedAdvanceCalls: [{ call: '2C', ruleIds: ['respond-to-1nt-w/-stayman'] }],
    expectedOvercallerRebidCalls: [{ call: '2D', ruleIds: ['overcaller-rebid-1nt-stayman'] }],
    rejectedOvercallerRebidCalls: ['2H', '2S', 'Pass'],
  },
  {
    description: 'Four hearts: 1NT overcaller answers Stayman with 2H.',
    dealer: 'N', practiceAuction: ['1D', '1NT', 'Pass', '2C', 'Pass', '2H'],
    requiredSystem: { stayman: true },
    north: { S: 'K72', H: 'A43', D: 'QJ974', C: 'K8' },
    east: { S: 'A9', H: 'KJ86', D: 'K65', C: 'AT76' },
    west: { S: 'QJ85', H: 'Q72', D: 'A83', C: '954' },
    south: { S: 'T643', H: 'T95', D: 'T2', C: 'QJ32' },
    expectedOvercallerRebidCalls: [{ call: '2H', ruleIds: ['overcaller-rebid-1nt-stayman'] }],
    rejectedOvercallerRebidCalls: ['2D', '2S', 'Pass'],
  },
  {
    description: 'Complete advancer’s artificial 2D Jacoby transfer with 2H.',
    dealer: 'N', practiceAuction: ['1D', '1NT', 'Pass', '2D', 'Pass', '2H'],
    requiredSystem: { jacobyTransfers: true },
    north: { S: 'K72', H: 'A43', D: 'QJ974', C: 'K8' },
    east: { S: 'A96', H: 'KJ8', D: 'K65', C: 'AT76' },
    west: { S: 'Q85', H: 'QT975', D: 'T83', C: '54' },
    south: { S: 'JT43', H: '62', D: 'A2', C: 'QJ932' },
    expectedAdvanceCalls: [{ call: '2D', ruleIds: ['respond-to-1nt-w/-transfer-to-hearts'] }],
    expectedOvercallerRebidCalls: [{ call: '2H', ruleIds: ['overcaller-rebid-1nt-jacoby'] }],
    rejectedOvercallerRebidCalls: ['Pass', '2S'],
  },
  {
    description: 'Texas 4D requires the natural 1NT overcaller to bid 4H.',
    dealer: 'N', practiceAuction: ['1D', '1NT', 'Pass', '4D', 'Pass', '4H'],
    requiredSystem: { texasTransfers: true },
    north: { S: 'K72', H: 'A43', D: 'QJ974', C: 'K8' },
    east: { S: 'A96', H: 'KJ8', D: 'K65', C: 'AT76' },
    west: { S: 'QJ', H: 'QT9752', D: 'A83', C: 'Q9' },
    south: { S: 'T8543', H: '6', D: 'T2', C: 'J5432' },
    expectedOvercallerRebidCalls: [{ call: '4H', ruleIds: ['overcaller-rebid-1nt-texas'] }],
    rejectedOvercallerRebidCalls: ['Pass', '4S'],
  },
  {
    description: 'Minimum natural 1NT overcaller declines an 8-HCP 2NT invitation.',
    dealer: 'N', practiceAuction: ['1D', '1NT', 'Pass', '2NT', 'Pass', 'Pass'],
    north: { S: 'K72', H: 'A43', D: 'QJ974', C: 'K8' },
    east: { S: 'A96', H: 'KJ8', D: 'K65', C: 'AT76' },
    west: { S: 'Q85', H: 'Q72', D: 'A83', C: '9542' },
    south: { S: 'JT43', H: 'T965', D: 'T2', C: 'QJ3' },
    expectedAdvanceCalls: [{ call: '2NT', ruleIds: ['respond-to-1nt-w/-2nt-8-9-invitational'] }],
    expectedOvercallerRebidCalls: [{ call: 'Pass', ruleIds: [
      'overcaller-rebid-1nt-decline-2nt-invitation',
    ] }],
    rejectedOvercallerRebidCalls: ['4NT'],
  },
  {
    description: 'Maximum natural 1NT overcaller accepts an 8-HCP 2NT invitation.',
    dealer: 'N', practiceAuction: ['1D', '1NT', 'Pass', '2NT', 'Pass', '3NT'],
    north: { S: 'K72', H: 'A43', D: 'QJ974', C: 'K8' },
    east: { S: 'A96', H: 'KJ8', D: 'K65', C: 'AQ76' },
    west: { S: 'Q85', H: 'Q72', D: 'A83', C: '9542' },
    south: { S: 'JT43', H: 'T965', D: 'T2', C: 'JT3' },
    expectedOvercallerRebidCalls: [{ call: '3NT', ruleIds: [
      'overcaller-rebid-1nt-accept-2nt-invitation',
    ] }],
  },
  {
    description: 'Pass advancer’s natural 3NT game signoff after a 1NT overcall.',
    dealer: 'N', practiceAuction: ['1D', '1NT', 'Pass', '3NT', 'Pass', 'Pass'],
    north: { S: 'K72', H: 'A43', D: 'QJ974', C: 'K8' },
    east: { S: 'A96', H: 'KJ8', D: 'K65', C: 'AT76' },
    west: { S: 'QJ8', H: 'Q72', D: 'A83', C: 'J954' },
    south: { S: 'T543', H: 'T965', D: 'T2', C: 'Q32' },
    expectedAdvanceCalls: [{ call: '3NT', ruleIds: ['respond-to-1nt-w/-3nt-10-15-balanced'] }],
    expectedOvercallerRebidCalls: [{ call: 'Pass', ruleIds: [
      'overcaller-rebid-1nt-pass-natural-signoff',
    ] }],
  },
  {
    description: 'A fitting club ace accepts advancer’s good six-card-club invitation with 3NT.',
    dealer: 'N', practiceAuction: ['1D', '1NT', 'Pass', '3C', 'Pass', '3NT'],
    north: { S: 'K72', H: 'A43', D: 'AQJ97', C: '83' },
    east: { S: 'A96', H: 'KJ8', D: 'K65', C: 'AT76' },
    west: { S: 'Q8', H: 'T5', D: '842', C: 'KQJ942' },
    south: { S: 'JT543', H: 'Q9762', D: 'T3', C: '5' },
    expectedAdvanceCalls: [{ call: '3C', ruleIds: [
      'respond-to-1nt-w/-3c-3d-natural-invitational',
    ] }],
    expectedOvercallerRebidCalls: [{ call: '3NT', ruleIds: [
      'overcaller-rebid-1nt-accept-3minor-invitation',
    ] }],
    rejectedOvercallerRebidCalls: ['Pass'],
  },
  {
    description: 'With no club A/K/Q, play three clubs rather than accepting the invitation.',
    dealer: 'N', practiceAuction: ['1D', '1NT', 'Pass', '3C', 'Pass', 'Pass'],
    north: { S: 'K72', H: 'A43', D: 'AJ974', C: '83' },
    east: { S: 'AQ9', H: 'KQJ', D: 'K65', C: 'T765' },
    west: { S: 'J8', H: 'T5', D: 'Q82', C: 'KQJ942' },
    south: { S: 'T6543', H: '98762', D: 'T3', C: 'A' },
    expectedOvercallerRebidCalls: [{ call: 'Pass', ruleIds: [
      'overcaller-rebid-1nt-decline-3minor-invitation',
    ] }],
    rejectedOvercallerRebidCalls: ['3NT'],
  },
  {
    description: 'With Jacoby off, advancer’s forcing 3S is natural and three spades support 4S.',
    dealer: 'N', practiceAuction: ['1D', '1NT', 'Pass', '3S', 'Pass', '4S'],
    requiredSystem: { jacobyTransfers: false },
    north: { S: 'K72', H: 'A43', D: 'QJ974', C: 'K8' },
    east: { S: 'A96', H: 'KJ8', D: 'K65', C: 'AT76' },
    west: { S: 'QJT85', H: 'Q72', D: 'A83', C: 'Q4' },
    south: { S: '43', H: 'T965', D: 'T2', C: 'J9532' },
    expectedAdvanceCalls: [{ call: '3S', ruleIds: [
      'respond-to-1nt-w/-3h-3s-natural-forcing',
    ] }],
    expectedOvercallerRebidCalls: [{ call: '4S', ruleIds: [
      'overcaller-rebid-1nt-3major-continuation',
    ] }],
    rejectedOvercallerRebidCalls: ['3NT', 'Pass'],
  },
  {
    description: 'Without Jacoby, natural 2S is a weak signoff; overcaller Passes.',
    dealer: 'N', practiceAuction: ['1D', '1NT', 'Pass', '2S', 'Pass', 'Pass'],
    requiredSystem: { jacobyTransfers: false },
    north: { S: 'K72', H: 'A43', D: 'QJ974', C: 'K8' },
    east: { S: 'A96', H: 'KJ8', D: 'K65', C: 'AT76' },
    west: { S: 'QJT85', H: 'T72', D: 'T83', C: '54' },
    south: { S: '43', H: 'Q965', D: 'A2', C: 'QJ932' },
    expectedOvercallerRebidCalls: [{ call: 'Pass', ruleIds: [
      'overcaller-rebid-1nt-pass-natural-signoff',
    ] }],
  },
];

/// Compact DONT against an opposing strong 1NT.  These deals practice the direct convention,
/// advancer's basic pass-or-correct action, and the selected overcaller correction when needed.
/// Responder interference, 2NT game inquiries, and balancing-seat DONT remain outside this family.
///
export const DONT_1NT_DEFENSE_TEST_DEALS: RuleTestDeal[] = [
  {
    description: 'No DONT one- or two-suited shape: Pass after an opposing 1NT opening.',
    dealer: 'N', practiceAuction: ['1NT', 'Pass'],
    north: { S: 'AQ4', H: 'KJ2', D: 'K83', C: 'QT95' },
    east: { S: '8763', H: 'T974', D: 'AJ', C: 'K64' },
    west: { S: 'JT95', H: 'A863', D: 'Q76', C: 'J7' },
    south: { S: 'K2', H: 'Q5', D: 'T9542', C: 'A832' },
    expectedOvercallCalls: [{ call: 'Pass', ruleIds: ['overcall-pass-no-qualifying-action'] }],
    rejectedOvercallCalls: ['Double', '2C', '2D', '2H', '2S'],
  },
  {
    description: 'One-suited hearts: DONT Double, 2C relay, then reveal 2H.',
    dealer: 'N',
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
    east: { S: '84', H: 'KQJT96', D: 'A52', C: '73' },
    west: { S: 'T975', H: '75', D: 'Q84', C: 'AT65' },
    south: { S: '632', H: '32', D: 'K763', C: 'KQ42' },
    north: { S: 'AKQJ', H: 'A84', D: 'JT9', C: 'J98' },
  },
  {
    description: 'Clubs plus hearts: 2C, 2D asks for the higher suit, then 2H.',
    dealer: 'N',
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
    east: { S: '84', H: 'T976', D: '72', C: 'AQJ65' },
    west: { S: 'KQJ9', H: '854', D: 'QJ98', C: 'K9' },
    south: { S: '532', H: 'J32', D: 'A543', C: '432' },
    north: { S: 'AT76', H: 'AKQ', D: 'KT6', C: 'T87' },
  },
  {
    description: 'Clubs plus spades: advancer has three clubs and accepts 2C.',
    dealer: 'N',
    practiceAuction: ['1NT', '2C', 'Pass', 'Pass'],
    expectedOvercallCalls: [
      { call: '2C', ruleIds: ['overcall-dont-clubs-plus-higher'] },
    ],
    expectedAdvanceCalls: [
      { call: 'Pass', ruleIds: ['advance-dont-pass-or-correct'] },
    ],
    east: { S: 'KJ97', H: '63', D: '72', C: 'AQ965' },
    west: { S: 'T85', H: 'Q752', D: 'Q84', C: 'K72' },
    south: { S: '32', H: 'T984', D: 'AK653', C: '43' },
    north: { S: 'AQ64', H: 'AKJ', D: 'JT9', C: 'JT8' },
  },
  {
    description: 'Diamonds plus spades: 2H asks for the major, then partner corrects to 2S.',
    dealer: 'N',
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
    east: { S: 'A987', H: '63', D: 'KQJ65', C: '72' },
    west: { S: 'T54', H: 'QJ98', D: 'A8', C: 'T986' },
    south: { S: '32', H: '7542', D: '432', C: 'AQJ3' },
    north: { S: 'KQJ6', H: 'AKT', D: 'T97', C: 'K54' },
  },
  {
    description: 'Both majors: advancer prefers spades and the DONT bidder accepts 2S.',
    dealer: 'N',
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
    east: { S: 'K987', H: 'AQJ65', D: '84', C: '72' },
    west: { S: 'AQJT', H: '98', D: 'J965', C: 'T96' },
    south: { S: '2', H: '432', D: 'KQ32', C: 'J8543' },
    north: { S: '6543', H: 'KT7', D: 'AT7', C: 'AKQ' },
  },
  {
    description: 'One-suited spades: direct natural DONT 2S and advancer Pass.',
    dealer: 'N',
    practiceAuction: ['1NT', '2S', 'Pass', 'Pass'],
    expectedOvercallCalls: [
      { call: '2S', ruleIds: ['overcall-dont-natural-spades'] },
    ],
    expectedAdvanceCalls: [
      { call: 'Pass', ruleIds: ['advance-dont-pass-or-correct'] },
    ],
    east: { S: 'AQJT96', H: '63', D: 'K52', C: 'A7' },
    west: { S: '85', H: 'Q752', D: 'Q84', C: 'JT65' },
    south: { S: '2', H: 'T984', D: '9763', C: 'KQ32' },
    north: { S: 'K743', H: 'AKJ', D: 'AJT', C: '984' },
  },
];


//// Natural suit-overcaller rebids after advancer's first action
/// Practice complete six-call sequences. Opponents pass after the natural overcall and advance;
/// the exercises teach overcaller's next decision, without extending into later competition.
export const NATURAL_SUIT_OVERCALL_REBID_TEST_DEALS: RuleTestDeal[] = [
  {
    description: 'Minimum one-level spade overcall: Pass advancer’s nonforcing 2S raise.',
    dealer: 'N', practiceAuction: ['1D', '1S', 'Pass', '2S', 'Pass', 'Pass'],
    north: { S: 'K72', H: 'A43', D: 'AQJ74', C: '83' },
    east: { S: 'AQJ86', H: 'K62', D: '8', C: 'K964' },
    west: { S: '943', H: 'QT', D: 'T92', C: 'AQJ75' },
    south: { S: 'T5', H: 'J9875', D: 'K653', C: 'T2' },
    expectedOvercallerRebidCalls: [{ call: 'Pass', ruleIds: ['overcaller-rebid-suit-raise-pass'] }],
    rejectedOvercallerRebidCalls: ['3S', '4S'],
  },
  {
    description: 'Strong six-card spade overcall with a constructive raise: bid 4S game.',
    dealer: 'N', practiceAuction: ['1D', '1S', 'Pass', '2S', 'Pass', '4S'],
    north: { S: 'K72', H: 'A43', D: 'AQJ74', C: 'T6' },
    east: { S: 'AQJT96', H: 'K7', D: '6', C: 'AK85' },
    west: { S: '543', H: 'QJ8', D: 'T98', C: 'QJ72' },
    south: { S: '8', H: 'T9652', D: 'K532', C: '943' },
    expectedOvercallerRebidCalls: [{ call: '4S', ruleIds: ['overcaller-rebid-suit-raise-game'] }],
    rejectedOvercallerRebidCalls: ['Pass', '3S'],
  },
  {
    description: 'Weak four-trump jump raise remains preemptive: overcaller Passes 3S.',
    dealer: 'N', practiceAuction: ['1D', '1S', 'Pass', '3S', 'Pass', 'Pass'],
    north: { S: 'K7', H: 'AQ4', D: 'AQJ764', C: '83' },
    east: { S: 'AQJ86', H: '76', D: '82', C: 'AK64' },
    west: { S: 'T543', H: '952', D: 'KT5', C: 'QJT' },
    south: { S: '92', H: 'KJT83', D: '93', C: '9752' },
    expectedOvercallerRebidCalls: [{ call: 'Pass', ruleIds: ['overcaller-rebid-suit-raise-pass'] }],
  },
  {
    description: 'Advancer’s 2D cuebid promises spade support and forces East to return to 2S.',
    dealer: 'N', practiceAuction: ['1D', '1S', 'Pass', '2D', 'Pass', '2S'],
    north: { S: 'K72', H: 'A43', D: 'AQJ74', C: '83' },
    east: { S: 'AQJ86', H: '762', D: '8', C: 'K964' },
    west: { S: '943', H: 'KQT5', D: '53', C: 'AQT2' },
    south: { S: 'T5', H: 'J98', D: 'KT962', C: 'J75' },
    expectedOvercallerRebidCalls: [{ call: '2S', ruleIds: ['overcaller-rebid-cuebid-return'] }],
    rejectedOvercallerRebidCalls: ['Pass', '3S'],
    practiceGuidance: [
      { auctionIndex: 5, seat: 'E', text: 'West’s 2D is a forcing support cuebid, not diamonds; 2S describes a minimum overcall.' },
    ],
  },
  {
    description: 'Nonforcing one-level spade advance can be passed after a minimum heart overcall.',
    dealer: 'N', practiceAuction: ['1D', '1H', 'Pass', '1S', 'Pass', 'Pass'],
    north: { S: 'K72', H: 'A43', D: 'AQJ74', C: '83' },
    east: { S: 'Q84', H: 'KQJ96', D: '65', C: 'A72' },
    west: { S: 'AJ953', H: 'T', D: 'KT932', C: 'K6' },
    south: { S: 'T6', H: '8752', D: '8', C: 'QJT954' },
    expectedOvercallerRebidCalls: [{ call: 'Pass', ruleIds: ['overcaller-rebid-new-suit-pass'] }],
  },
  {
    description: 'Advancer’s forcing 2H shows five hearts; three-card support makes a 3H rebid.',
    dealer: 'N', practiceAuction: ['1D', '1S', 'Pass', '2H', 'Pass', '3H'],
    north: { S: 'K72', H: 'A43', D: 'AQJ74', C: '83' },
    east: { S: 'AQJ86', H: '762', D: '8', C: 'K964' },
    west: { S: '53', H: 'KJT98', D: 'K9', C: 'AQ52' },
    south: { S: 'T94', H: 'Q5', D: 'T6532', C: 'JT7' },
    expectedOvercallerRebidCalls: [{ call: '3H', ruleIds: ['overcaller-rebid-new-suit-support'] }],
    rejectedOvercallerRebidCalls: ['Pass', '2S'],
  },
  {
    description: 'Advancer’s forcing 2H finds no heart fit; repeat a good six-card spade overcall.',
    dealer: 'N', practiceAuction: ['1D', '1S', 'Pass', '2H', 'Pass', '2S'],
    north: { S: 'K72', H: 'A43', D: 'KQT74', C: 'T6' },
    east: { S: 'AQJT96', H: 'K7', D: '6', C: 'AK85' },
    west: { S: '54', H: 'QJT98', D: 'A9', C: 'QJ72' },
    south: { S: '83', H: '652', D: 'J8532', C: '943' },
    expectedOvercallerRebidCalls: [{ call: '2S', ruleIds: ['overcaller-rebid-new-suit-repeat'] }],
    rejectedOvercallerRebidCalls: ['Pass', '3H'],
  },
  {
    description: 'Two-level heart overcall: Pass the nonforcing 3H raise.',
    dealer: 'N', practiceAuction: ['1S', '2H', 'Pass', '3H', 'Pass', 'Pass'],
    north: { S: 'AKJ74', H: 'K82', D: 'Q93', C: '65' },
    east: { S: 'Q3', H: 'AQJ965', D: 'K86', C: '72' },
    west: { S: 'T986', H: 'T74', D: 'AJ', C: 'Q983' },
    south: { S: '52', H: '3', D: 'T7542', C: 'AKJT4' },
    expectedOvercallerRebidCalls: [{ call: 'Pass', ruleIds: ['overcaller-rebid-suit-raise-pass'] }],
  },
  {
    description: 'Two-level heart overcall: a forcing 2S cuebid gets a minimum 3H return.',
    dealer: 'N', practiceAuction: ['1S', '2H', 'Pass', '2S', 'Pass', '3H'],
    north: { S: 'AKJ874', H: 'K8', D: 'Q93', C: '65' },
    east: { S: 'Q3', H: 'AQJ965', D: 'K86', C: '72' },
    west: { S: 'T96', H: 'T74', D: 'AJ5', C: 'AQ98' },
    south: { S: '52', H: '32', D: 'T742', C: 'KJT43' },
    expectedOvercallerRebidCalls: [{ call: '3H', ruleIds: ['overcaller-rebid-cuebid-return'] }],
    rejectedOvercallerRebidCalls: ['Pass'],
  },
  {
    description: 'Decline natural 2NT invitation after a minimum one-level suit overcall.',
    dealer: 'N', practiceAuction: ['1D', '1S', 'Pass', '2NT', 'Pass', 'Pass'],
    north: { S: 'K72', H: 'A43', D: 'AQJ74', C: '83' },
    east: { S: 'AQJ86', H: '762', D: '8', C: 'K964' },
    west: { S: 'T3', H: 'KT9', D: 'K632', C: 'AQT2' },
    south: { S: '954', H: 'QJ85', D: 'T95', C: 'J75' },
    expectedOvercallerRebidCalls: [{ call: 'Pass', ruleIds: ['overcaller-rebid-nt-pass'] }],
    rejectedOvercallerRebidCalls: ['3NT'],
  },
  {
    description: 'Accept a natural 2NT invitation with 15 HCP, a secure diamond stopper in ' +
                 'advancer, and no eight-card spade fit after a one-level overcall.',
    dealer: 'N', practiceAuction: ['1D', '1S', 'Pass', '2NT', 'Pass', '3NT'],
    north: { S: 'T72', H: 'AQ', D: 'KQJ743', C: '83' },
    east: { S: 'AQJ86', H: 'K72', D: '8', C: 'KQ64' },
    west: { S: 'K9', H: 'J85', D: 'A962', C: 'A952' },
    south: { S: '543', H: 'T9643', D: 'T5', C: 'JT7' },
    expectedOvercallerRebidCalls: [{ call: '3NT', ruleIds: ['overcaller-rebid-nt-game'] }],
    rejectedOvercallerRebidCalls: ['Pass'],
  },
  {
    description: 'Natural direct 3NT is a game signoff; the overcaller Passes.',
    dealer: 'N', practiceAuction: ['1D', '1S', 'Pass', '3NT', 'Pass', 'Pass'],
    north: { S: 'K72', H: 'A43', D: 'AQJ74', C: '83' },
    east: { S: 'AQJ86', H: '762', D: '8', C: 'K964' },
    west: { S: 'T9', H: 'KQJ', D: 'K9653', C: 'AQJ' },
    south: { S: '543', H: 'T985', D: 'T2', C: 'T752' },
    expectedOvercallerRebidCalls: [{ call: 'Pass', ruleIds: ['overcaller-rebid-nt-pass'] }],
  },
];

///
//// Natural suit and 1NT overcaller continuations -- Responder also acts
///
export const CONTESTED_OVERCALL_REBID_TEST_DEALS: RuleTestDeal[] = [
  {
    description: "After responder acts, 1D-(1S)-2D: three spades and 10 support points compete with 2S.",
    dealer: "N",
    practiceAuction: ["1D", "1S", "2D", "2S", "Pass", "Pass"],
    east: { S: "AQJ86", H: "762", D: "8", C: "K964" },
    south: { S: "43", H: "985", D: "6532", C: "AQ52" },
    west: { S: "T95", H: "KQJT", D: "KT9", C: "JT7" },
    north: { S: "K72", H: "A43", D: "AQJ74", C: "83" },
    expectedOvercallCalls: [{ call: "1S", ruleIds: ["overcall-simple-suit-at-one-level"] }],
    expectedAdvanceCalls: [{ call: "2S", ruleIds: ["advance-one-level-suit-overcall-after-responder-raise-simple-raise"] }],
    expectedOvercallerRebidCalls: [{ call: "Pass", ruleIds: ["overcaller-rebid-contested-suit-raise-pass"] }],
  },
  {
    description: "After responder acts, 1D-(1S)-2D: 11 support points cuebid 3D as a strong spade raise.",
    dealer: "N",
    practiceAuction: ["1D", "1S", "2D", "3D", "Pass", "3S"],
    east: { S: "AQJ86", H: "762", D: "8", C: "K964" },
    south: { S: "43", H: "985", D: "96532", C: "AQ2" },
    west: { S: "T95", H: "KQJT", D: "KT", C: "JT75" },
    north: { S: "K72", H: "A43", D: "AQJ74", C: "83" },
    expectedOvercallCalls: [{ call: "1S", ruleIds: ["overcall-simple-suit-at-one-level"] }],
    expectedAdvanceCalls: [{ call: "3D", ruleIds: ["advance-one-level-suit-overcall-after-responder-raise-support-cuebid"] }],
    expectedOvercallerRebidCalls: [{ call: "3S", ruleIds: ["overcaller-rebid-contested-suit-cue-return"] }],
  },
  {
    description: "After responder acts, 1D-(1S)-2D: a five-card heart suit and 10 HCP bid natural forcing 2H.",
    dealer: "N",
    practiceAuction: ["1D", "1S", "2D", "2H", "Pass", "3H"],
    east: { S: "AQJ86", H: "762", D: "8", C: "K964" },
    south: { S: "543", H: "85", D: "6532", C: "AQ52" },
    west: { S: "T9", H: "KQJT9", D: "KT9", C: "JT7" },
    north: { S: "K72", H: "A43", D: "AQJ74", C: "83" },
    expectedOvercallCalls: [{ call: "1S", ruleIds: ["overcall-simple-suit-at-one-level"] }],
    expectedAdvanceCalls: [{ call: "2H", ruleIds: ["advance-one-level-suit-overcall-after-responder-raise-new-suit-two-level"] }],
    expectedOvercallerRebidCalls: [{ call: "3H", ruleIds: ["overcaller-rebid-contested-suit-new-support"] }],
  },
  {
    description: "After responder acts, 1D-(1S)-2D: 4-4 in hearts and clubs uses a responsive Double.",
    dealer: "N",
    practiceAuction: ["1D", "1S", "2D", "Double", "Pass", "3C"],
    east: { S: "AQJ86", H: "762", D: "8", C: "K964" },
    south: { S: "543", H: "985", D: "6532", C: "AQ2" },
    west: { S: "T9", H: "KQJT", D: "KT9", C: "JT75" },
    north: { S: "K72", H: "A43", D: "AQJ74", C: "83" },
    expectedOvercallCalls: [{ call: "1S", ruleIds: ["overcall-simple-suit-at-one-level"] }],
    expectedAdvanceCalls: [{ call: "Double", ruleIds: ["advance-one-level-suit-overcall-after-responder-raise-responsive-double"] }],
    expectedOvercallerRebidCalls: [{ call: "3C", ruleIds: ["overcaller-rebid-contested-suit-responsive-suit"] }],
  },
  {
    description: "After responder acts, 1S-(2H)-2S: three hearts and seven support points compete with 3H.",
    dealer: "N",
    practiceAuction: ["1S", "2H", "2S", "3H", "Pass", "Pass"],
    east: { S: "Q3", H: "AQJ965", D: "K86", C: "72" },
    south: { S: "852", H: "3", D: "T742", C: "AKT84" },
    west: { S: "T96", H: "T74", D: "AJ5", C: "QJ93" },
    north: { S: "AKJ74", H: "K82", D: "Q93", C: "65" },
    expectedOvercallCalls: [{ call: "2H", ruleIds: ["overcall-simple-suit-at-two-level"] }],
    expectedAdvanceCalls: [{ call: "3H", ruleIds: ["advance-two-level-suit-overcall-after-responder-raise-simple-raise"] }],
    expectedOvercallerRebidCalls: [{ call: "Pass", ruleIds: ["overcaller-rebid-contested-suit-raise-pass"] }],
  },
  {
    description: "After responder acts, 1S-(2H)-2S: 11 support points cuebid 3S as a strong heart raise.",
    dealer: "N",
    practiceAuction: ["1S", "2H", "2S", "3S", "Pass", "4H"],
    east: { S: "Q3", H: "AQJ965", D: "K86", C: "72" },
    south: { S: "852", H: "3", D: "T742", C: "KJT84" },
    west: { S: "T96", H: "T74", D: "AJ5", C: "AQ93" },
    north: { S: "AKJ74", H: "K82", D: "Q93", C: "65" },
    expectedOvercallCalls: [{ call: "2H", ruleIds: ["overcall-simple-suit-at-two-level"] }],
    expectedAdvanceCalls: [{ call: "3S", ruleIds: ["advance-two-level-suit-overcall-after-responder-raise-support-cuebid"] }],
    expectedOvercallerRebidCalls: [{ call: "4H", ruleIds: ["overcaller-rebid-contested-suit-cue-return"] }],
  },
  {
    description: "After responder acts, 1S-(2H)-2S: good five clubs and 12 HCP bid forcing 3C.",
    dealer: "N",
    practiceAuction: ["1S", "2H", "2S", "3C", "Pass", "3H"],
    east: { S: "Q3", H: "AQJ965", D: "K86", C: "72" },
    south: { S: "8652", H: "", D: "JT542", C: "QT94" },
    west: { S: "T9", H: "T743", D: "A7", C: "AKJ83" },
    north: { S: "AKJ74", H: "K82", D: "Q93", C: "65" },
    expectedOvercallCalls: [{ call: "2H", ruleIds: ["overcall-simple-suit-at-two-level"] }],
    expectedAdvanceCalls: [{ call: "3C", ruleIds: ["advance-two-level-suit-overcall-after-responder-raise-new-suit-three-level"] }],
    expectedOvercallerRebidCalls: [{ call: "3H", ruleIds: ["overcaller-rebid-contested-suit-new-repeat"] }],
  },
  {
    description: "After responder acts, 1D-(1S)-1NT: three spades and 10 support points make a simple 2S raise.",
    dealer: "N",
    practiceAuction: ["1D", "1S", "1NT", "2S", "Pass", "Pass"],
    east: { S: "AQJ96", H: "762", D: "82", C: "K96" },
    south: { S: "KT7", H: "QJ8", D: "T93", C: "T724" },
    west: { S: "543", H: "KT9", D: "Q65", C: "AJ85" },
    north: { S: "82", H: "A435", D: "AKJ74", C: "Q3" },
    expectedOvercallCalls: [{ call: "1S", ruleIds: ["overcall-simple-suit-at-one-level"] }],
    expectedAdvanceCalls: [{ call: "2S", ruleIds: ["advance-one-level-suit-overcall-after-responder-natural-action-simple-raise"] }],
    expectedOvercallerRebidCalls: [{ call: "Pass", ruleIds: ["overcaller-rebid-contested-suit-raise-pass"] }],
  },
  {
    description: "After responder acts, 1C-(1D)-1H: a six-card spade suit and nine HCP compete naturally with 1S.",
    dealer: "N",
    practiceAuction: ["1C", "1D", "1H", "1S", "Pass", "Pass"],
    east: { S: "KQ", H: "843", D: "KT87542", C: "7" },
    south: { S: "T", H: "KJT95", D: "Q93", C: "K862" },
    west: { S: "AJ8642", H: "Q62", D: "6", C: "QT5" },
    north: { S: "9753", H: "A7", D: "AJ", C: "AJ943" },
    expectedOvercallCalls: [{ call: "1D", ruleIds: ["overcall-simple-suit-at-one-level"] }],
    expectedAdvanceCalls: [{ call: "1S", ruleIds: ["advance-suit-overcall-after-responder-natural-action-new-suit-one-level"] }],
    expectedOvercallerRebidCalls: [{ call: "Pass", ruleIds: ["overcaller-rebid-contested-suit-new-pass"] }],
  },
  {
    description: "After responder acts, 1D-(1S)-Double: strong spade support uses the 2D support cuebid, not Redouble.",
    dealer: "N",
    practiceAuction: ["1D", "1S", "Double", "2D", "Pass", "2S"],
    east: { S: "KQJ97", H: "A87", D: "872", C: "T6" },
    south: { S: '83', H: 'KT96', D: 'A95', C: '9432' },
    west: { S: '642', H: '432', D: 'J4', C: 'AKQJ8' },
    north: { S: "AT5", H: "QJ5", D: "KQT63", C: "75" },
    expectedOvercallCalls: [{ call: "1S", ruleIds: ["overcall-simple-suit-at-one-level"] }],
    expectedAdvanceCalls: [{ call: "2D", ruleIds: ["advance-suit-overcall-after-negative-double-support-cuebid"] }],
    expectedOvercallerRebidCalls: [{ call: "2S", ruleIds: ["overcaller-rebid-contested-suit-cue-return"] }],
  },
  {
    description: "After responder acts, 1D-(1S)-Double: balanced 10 HCP, two spades, and a diamond stopper favor natural 1NT over a spade raise.",
    dealer: "N",
    practiceAuction: ["1D", "1S", "Double", "1NT", "Pass", "Pass"],
    east: { S: "AK943", H: "KT6", D: "4", C: "QT74" },
    south: { S: "527", H: "QJ53", D: "QJ85", C: "26" },
    west: { S: "QJ", H: "987", D: "AK32", C: "8953" },
    north: { S: "T86", H: "A42", D: "T976", C: "AKJ" },
    expectedOvercallCalls: [{ call: "1S", ruleIds: ["overcall-simple-suit-at-one-level"] }],
    expectedAdvanceCalls: [{ call: "1NT", ruleIds: ["advance-suit-overcall-after-negative-double-natural-notrump"] }],
    expectedOvercallerRebidCalls: [{ call: "Pass", ruleIds: ["overcaller-rebid-contested-suit-nt-pass"] }],
  },
  {
    description: "After responder acts, after 1D-(1NT)-2H, a weak advancer can Pass; South has good six hearts.",
    dealer: "N",
    practiceAuction: ["1D", "1NT", "2H", "Pass", "Pass", "Pass"],
    east: { S: "AQ96", H: "K8", D: "K65", C: "AT76" },
    south: { S: "J5", H: "QJT965", D: "A2", C: "532" },
    west: { S: "T843", H: "72", D: "T83", C: "QJ94" },
    north: { S: "K72", H: "A43", D: "QJ974", C: "K8" },
    expectedOvercallCalls: [{ call: "1NT", ruleIds: ["overcall-natural-1nt-with-stopper"] }],
    expectedAdvanceCalls: [{ call: "Pass", ruleIds: ["partner-of-1nt-after-interference-pass"] }],
    expectedOvercallerRebidCalls: [{ call: "Pass", ruleIds: ["overcaller-rebid-interfered-1nt-pass"] }],
  },
];

//// Takeout-Doubler continuations -- Ordinary, strong, and selected competitive rebids
/// All four seats are fixed where the opponent's decision matters.
export const TAKEOUT_DOUBLER_REBID_TEST_DEALS: RuleTestDeal[] = [
  {
    description: 'Ordinary takeout Double with 14 support points: Pass a weak 1S advance.',
    dealer: 'N',
    practiceAuction: ['1H', 'Double', 'Pass', '1S', 'Pass', 'Pass'],
    north: { S: 'K72', H: 'AKJ76', D: 'KA5', C: '93' },
    east: { S: 'AQJ4', H: 'Q9', D: 'Q86', C: 'K762' },
    west: { S: 'T986', H: 'T42', D: 'J93', C: 'A54' },
    expectedOvercallerRebidCalls: [{ call: 'Pass', ruleIds: ['overcaller-rebid-takeout-minimum-pass'] }],
    south: { S: '53', H: '853', D: 'T742', C: 'QJT8' },
  },
  {
    description: 'With 17 HCP and four-card spade support, raise a weak forced 1S to 2S.',
    dealer: 'N',
    practiceAuction: ['1H', 'Double', 'Pass', '1S', 'Pass', '2S'],
    north: { S: 'K72', H: 'AKT768', D: 'QA5', C: '9' },
    east: { S: 'AQJ4', H: 'Q9', D: 'K86', C: 'KQ72' },
    south: { S: '53', H: '53', D: 'T742', C: 'JT863' },
    west: { S: 'T986', H: 'J42', D: 'J93', C: 'A54' },
    expectedOvercallCalls: [{ call: 'Double', ruleIds: [
      'overcall-takeout-double-with-unbid-suit-support',
    ] }],
    expectedAdvanceCalls: [{ call: '1S', ruleIds: [
      'advance-takeout-double-minimum-suit',
    ] }],
    expectedOvercallerRebidCalls: [{ call: '2S', ruleIds: [
      'overcaller-rebid-takeout-minimum-raise',
    ] }],
  },
  {
    description: 'An ordinary minimum takeout Doubler declines a 2S invitational jump.',
    dealer: 'N',
    practiceAuction: ['1H', 'Double', 'Pass', '2S', 'Pass', 'Pass'],
    north: { S: 'K72', H: 'AKT768', D: 'QA5', C: '9' },
    east: { S: 'AQ84', H: 'Q9', D: '986', C: 'KQ72' },
    south: { S: '53', H: '53', D: 'T742', C: 'JT863' },
    west: { S: 'TJ96', H: 'J42', D: 'JK3', C: 'A54' },
    expectedOvercallCalls: [{ call: 'Double', ruleIds: [
      'overcall-takeout-double-with-unbid-suit-support',
    ] }],
    expectedAdvanceCalls: [{ call: '2S', ruleIds: [
      'advance-takeout-double-invitational-jump',
    ] }],
    expectedOvercallerRebidCalls: [{ call: 'Pass', ruleIds: [
      'overcaller-rebid-takeout-jump-pass',
    ] }],
  },
  {
    description: 'An ordinary stronger takeout Doubler accepts the same 2S invitation with 4S.',
    dealer: 'N',
    practiceAuction: ['1H', 'Double', 'Pass', '2S', 'Pass', '4S'],
    north: { S: 'K72', H: 'KJT768', D: 'QA5', C: '9' },
    east: { S: 'AQJ4', H: 'Q9', D: 'K86', C: 'KQ72' },
    south: { S: '53', H: '53', D: 'T742', C: 'JT863' },
    west: { S: 'T986', H: 'A42', D: 'J93', C: 'A54' },
    expectedOvercallCalls: [{ call: 'Double', ruleIds: [
      'overcall-takeout-double-with-unbid-suit-support',
    ] }],
    expectedAdvanceCalls: [{ call: '2S', ruleIds: [
      'advance-takeout-double-invitational-jump',
    ] }],
    expectedOvercallerRebidCalls: [{ call: '4S', ruleIds: [
      'overcaller-rebid-takeout-jump-game',
    ] }],
  },
  {
    description: 'Twelve+ length points: 2D cuebid is strong, without a suit-fit promise.',
    dealer: 'N',
    practiceAuction: ['1D', 'Double', 'Pass', '2D', 'Pass', '2H'],
    north: { S: 'K72', H: 'Q43', D: 'AQJ74', C: '83' },
    east: { S: 'A984', H: 'KJ85', D: '6', C: 'K976' },
    south: { S: 'JT63', H: 'AT2', D: '9853', C: 'T5' },
    west: { S: 'Q5', H: '976', D: 'KT2', C: 'AQJ42' },
    expectedOvercallCalls: [{ call: 'Double', ruleIds: ['overcall-takeout-double-with-unbid-suit-support'] }],
    expectedAdvanceCalls: [{ call: '2D', ruleIds: ['advance-takeout-double-strong-cuebid'] }],
    expectedOvercallerRebidCalls: [{ call: '2H', ruleIds: ['overcaller-rebid-takeout-cue-suit'] }],
  },
  {
    description: 'Balanced 12 HCP with diamond stopper: invitational 2NT.',
    dealer: 'N',
    practiceAuction: ['1D', 'Double', 'Pass', '2NT', 'Pass', 'Pass'],
    north: { S: 'K72', H: 'Q43', D: 'AQJ74', C: '83' },
    east: { S: 'A984', H: 'KJ85', D: '6', C: 'K976' },
    south: { S: 'JT63', H: 'AT2', D: '9853', C: 'T5' },
    west: { S: 'Q5', H: '976', D: 'KT2', C: 'AQJ42' },
    expectedOvercallCalls: [{ call: 'Double', ruleIds: ['overcall-takeout-double-with-unbid-suit-support'] }],
    expectedAdvanceCalls: [{ call: '2NT', ruleIds: ['advance-takeout-double-two-notrump'] }],
    expectedOvercallerRebidCalls: [{ call: 'Pass', ruleIds: ['overcaller-rebid-takeout-nt-pass'] }],
  },
  {
    description: 'Balanced 15 HCP with diamond stopper: natural 3NT game.',
    dealer: 'N',
    practiceAuction: ['1D', 'Double', 'Pass', '3NT', 'Pass', 'Pass'],
    north: { S: 'K72', H: 'Q43', D: 'AQJ74', C: '83' },
    east: { S: 'A984', H: 'KJ85', D: '6', C: 'K976' },
    south: { S: 'T53', H: 'T962', D: '932', C: 'Q42' },
    west: { S: 'QJ6', H: 'A7', D: 'KT85', C: 'AJT5' },
    expectedOvercallCalls: [{ call: 'Double', ruleIds: ['overcall-takeout-double-with-unbid-suit-support'] }],
    expectedAdvanceCalls: [{ call: '3NT', ruleIds: ['advance-takeout-double-three-notrump'] }],
    expectedOvercallerRebidCalls: [{ call: 'Pass', ruleIds: ['overcaller-rebid-takeout-game-pass'] }],
  },
  {
    description: '1H-(Double)-2H: five spades and 11 length points compete naturally with 2S.',
    dealer: 'N',
    practiceAuction: ['1H', 'Double', '2H', '2S', 'Pass', 'Pass'],
    north: { S: 'K72', H: 'AKT96', D: 'Q53', C: '54' },
    east: { S: 'A984', H: '2', D: 'KJ82', C: 'K976' },
    south: { S: '3', H: '87543', D: '764', C: 'AQJ2' },
    west: { S: 'QJT65', H: 'QJ', D: 'AT9', C: 'T83' },
    expectedOvercallCalls: [{ call: 'Double', ruleIds: ['overcall-takeout-double-with-unbid-suit-support'] }],
    expectedAdvanceCalls: [{ call: '2S', ruleIds: ['advance-takeout-double-after-responder-raise-new-suit-two-level'] }],
    expectedOvercallerRebidCalls: [{ call: 'Pass', ruleIds: ['overcaller-rebid-takeout-competitive-pass'] }],
  },
  {
    description: 'With 16 HCP and a known spade fit, the doubler bids game after responder competes.',
    dealer: 'N',
    practiceAuction: ['1H', 'Double', '2H', '2S', 'Pass', '4S'],
    practiceGuidance: [{ auctionIndex: 2, seat: 'S', text: 'Three hearts and ' +
      'modest support values make 2H a routine simple raise. The weak preemptive ' +
      '3H jump after Double requires at least four-card support here.' }],
    north: { S: 'K72', H: 'AKT964', D: 'Q5', C: '54' },
    east: { S: 'A984', H: 'Q5', D: 'KJ2', C: 'KQJ6' },
    south: { S: '3', H: '873', D: '87643', C: 'A972' },
    west: { S: 'QJT65', H: 'J2', D: 'AT9', C: 'T83' },
    expectedOvercallCalls: [{ call: 'Double', ruleIds: [
      'overcall-takeout-double-with-unbid-suit-support',
    ] }],
    expectedAdvanceCalls: [{ call: '2S', ruleIds: [
      'advance-takeout-double-after-responder-raise-new-suit-two-level',
    ] }],
    expectedOvercallerRebidCalls: [{ call: '4S', ruleIds: [
      'overcaller-rebid-takeout-competitive-raise',
    ] }],
  },
  {
    description: '1H-(Double)-2H: three four-card unbid suits use a responsive Double.',
    dealer: 'N',
    practiceAuction: ['1H', 'Double', '2H', 'Double', 'Pass', '2S'],
    north: { S: 'K72', H: 'AKT96', D: 'Q53', C: '54' },
    east: { S: 'A984', H: '2', D: 'KJ82', C: 'K976' },
    south: { S: '53', H: 'J87543', D: '64', C: 'AJ2' },
    west: { S: 'QJT6', H: 'Q', D: 'AT97', C: 'QT83' },
    expectedOvercallCalls: [{ call: 'Double', ruleIds: ['overcall-takeout-double-with-unbid-suit-support'] }],
    expectedAdvanceCalls: [{ call: 'Double', ruleIds: ['advance-takeout-double-after-responder-raise-responsive-double'] }],
    expectedOvercallerRebidCalls: [{ call: '2S', ruleIds: ['overcaller-rebid-takeout-responsive-suit'] }],
  },
  {
    description: '1H-(Double)-2H: 12 length points cuebid 3H as a strong force.',
    dealer: 'N',
    practiceAuction: ['1H', 'Double', '2H', '3H', 'Pass', '3S'],
    north: { S: 'K72', H: 'AKT96', D: 'Q53', C: '54' },
    east: { S: 'A984', H: '2', D: 'KJ82', C: 'K976' },
    south: { S: '53', H: '87543', D: '764', C: 'AJ2' },
    west: { S: 'QJT6', H: 'QJ', D: 'AT9', C: 'QT83' },
    expectedOvercallCalls: [{ call: 'Double', ruleIds: ['overcall-takeout-double-with-unbid-suit-support'] }],
    expectedAdvanceCalls: [{ call: '3H', ruleIds: ['advance-takeout-double-after-responder-raise-strong-cuebid'] }],
    expectedOvercallerRebidCalls: [{ call: '3S', ruleIds: ['overcaller-rebid-takeout-cue-suit'] }],
  },
  {
    description: 'Strong off-shape doubler shows a good five-card spade suit after forced 2D.',
    dealer: 'N',
    practiceAuction: ['1H', 'Double', 'Pass', '2D', 'Pass', '2S'],
    north: { S: 'K72', H: 'AQ976', D: 'K85', C: '93' },
    east: { S: 'AQJ84', H: 'KJ3', D: 'AQ', C: 'KQT' },
    south: { S: '93', H: '85', D: 'T762', C: 'A7642' },
    west: { S: 'T65', H: 'T42', D: 'J943', C: 'J85' },
    expectedOvercallerRebidCalls: [{ call: '2S', ruleIds: ['overcaller-rebid-takeout-strong-suit'] }],
  },
  {
    description: 'A balanced 20 HCP strong doubler describes the hand with 1NT.',
    dealer: 'N',
    practiceAuction: ['1H', 'Double', 'Pass', '1S', 'Pass', '1NT'],
    north: { S: 'K72', H: 'AQ976', D: 'K85', C: '93' },
    east: { S: 'AQ4', H: 'KJ3', D: 'AQ6', C: 'KJ72' },
    south: { S: 'T3', H: '85', D: 'T742', C: 'QT864' },
    west: { S: 'J9865', H: 'T42', D: 'J93', C: 'A5' },
    expectedOvercallerRebidCalls: [{ call: '1NT', ruleIds: ['overcaller-rebid-takeout-strong-nt'] }],
  },
  {
    description: 'With 22 balanced HCP and a heart stopper, Double then 2NT describes extra strength.',
    dealer: 'N',
    practiceAuction: ['1H', 'Double', 'Pass', '1S', 'Pass', '2NT'],
    north: { S: 'K72', H: 'AQ976', D: 'K85', C: '93' },
    east: { S: 'AQ4', H: 'KJ3', D: 'AQ6', C: 'KJQ2' },
    south: { S: 'T3', H: '85', D: 'T742', C: 'AT764' },
    west: { S: 'J9865', H: 'T42', D: 'J93', C: '85' },
    expectedOvercallCalls: [{ call: 'Double', ruleIds: [
      'overcall-takeout-double-strong-hand',
    ] }],
    expectedAdvanceCalls: [{ call: '1S', ruleIds: [
      'advance-takeout-double-minimum-suit',
    ] }],
    expectedOvercallerRebidCalls: [{ call: '2NT', ruleIds: [
      'overcaller-rebid-takeout-strong-nt',
    ] }],
  },
  {
    description: 'A strong 20 HCP doubler with four spades bids game over a weak spade advance.',
    dealer: 'N',
    practiceAuction: ['1H', 'Double', 'Pass', '1S', 'Pass', '4S'],
    north: { S: 'K72', H: 'AQ976', D: 'K85', C: '93' },
    east: { S: 'AQJ4', H: 'KJ3', D: 'AQ6', C: 'K72' },
    south: { S: '35', H: '85', D: 'T742', C: 'QJT86' },
    west: { S: 'T986', H: 'T42', D: 'J93', C: 'A54' },
    expectedOvercallerRebidCalls: [{ call: '4S', ruleIds: ['overcaller-rebid-takeout-strong-fit'] }],
  },
];

///
//// Fourth-seat balancing practice: North opens; East and South each have a credible Pass.
/// Every deal fixes all four hands. The rule tests check the *actual* Pass-only candidate
/// set for both intervening seats, not merely the balancing decision in West.
export const BALANCING_TEST_DEALS: RuleTestDeal[] = [
  {
    description: 'One-level balance: 1S over 1D, after genuine Passes by both intervening seats.',
    dealer: 'N',
    practiceAuction: ['1D', 'Pass', 'Pass', '1S'],
    expectedBalancingCalls: [{ call: '1S', ruleIds: ['balance-natural-one-level-suit'] }],
    rejectedBalancingCalls: ['2S', '1NT'],
    north: { S: 'K73', H: 'QJ93', D: 'J843', C: 'AQ' },
    east: { S: 'JT5', H: 'AK5', D: '962', C: 'J942' },
    south: { S: '94', H: '62', D: 'QT75', C: 'KT765' },
    west: { S: 'AQ862', H: 'T874', D: 'AK', C: '83' },
  },
  {
    description: 'Two-level balance: good five-card diamonds and 14 HCP justify 2D over 1H.',
    dealer: 'N',
    practiceAuction: ['1H', 'Pass', 'Pass', '2D'],
    expectedBalancingCalls: [{ call: '2D', ruleIds: ['balance-natural-two-level-suit'] }],
    rejectedBalancingCalls: ['1D', '2S', '2H'],
    north: { S: 'AK84', H: 'AKQT3', D: '64', C: 'K7' },
    east: { S: 'QT', H: '75', D: 'J9875', C: 'QT95' },
    south: { S: 'J7632', H: '9642', D: '3', C: 'J43' },
    west: { S: '95', H: 'J8', D: 'AKQT2', C: 'A862' },
  },
  {
    description: 'Balanced 12 HCP with spade stopper: natural balancing 1NT, not direct 1NT.',
    dealer: 'N',
    practiceAuction: ['1S', 'Pass', 'Pass', '1NT'],
    expectedBalancingCalls: [{ call: '1NT', ruleIds: ['balance-natural-1nt'] }],
    rejectedBalancingCalls: ['Double', '2S'],
    north: { S: 'KQ953', H: 'AKT94', D: 'K76', C: '' },
    east: { S: 'J72', H: 'QJ6', D: 'AJ', C: 'JT754' },
    south: { S: 'T4', H: '872', D: '9853', C: 'K983' },
    west: { S: 'A86', H: '53', D: 'QT42', C: 'AQ62' },
  },
  {
    description: 'Takeout Double with 11 HCP, short hearts and unbid-suit support.',
    dealer: 'N',
    practiceAuction: ['1H', 'Pass', 'Pass', 'Double'],
    expectedBalancingCalls: [{ call: 'Double', ruleIds: ['balance-takeout-double'] }],
    north: { S: 'Q82', H: 'AKJ93', D: 'A6', C: 'KJ5' },
    east: { S: 'J643', H: 'QT64', D: 'KT7', C: '84' },
    south: { S: 'T9', H: '87', D: 'QJ842', C: 'QT92' },
    west: { S: 'AK75', H: '52', D: '953', C: 'A763' },
  },
  {
    description: 'Strong balancing Double with 16 HCP after 1C; later description is guidance only.',
    dealer: 'N',
    practiceAuction: ['1C', 'Pass', 'Pass', 'Double'],
    expectedBalancingCalls: [{ call: 'Double', ruleIds: ['balance-strong-double'] }],
    north: { S: 'AQT3', H: '983', D: 'A82', C: 'KJT' },
    east: { S: '987', H: 'K754', D: 'Q76', C: '954' },
    south: { S: '542', H: 'T62', D: 'J54', C: 'A763' },
    west: { S: 'KJ6', H: 'AQJ', D: 'KT93', C: 'Q82' },
  },
  {
    description: 'Defensive Pass with 11 HCP and KQ-fourth of the opening heart suit.',
    dealer: 'N',
    practiceAuction: ['1H', 'Pass', 'Pass', 'Pass'],
    expectedBalancingCalls: [{ call: 'Pass', ruleIds: ['balance-pass-defend'] }],
    rejectedBalancingCalls: ['Double', '1S', '1NT', '2D'],
    north: { S: 'AQ87', H: 'AJ9753', D: 'A4', C: '4' },
    east: { S: 'J4', H: 'T6', D: 'QJ82', C: 'KQJ98' },
    south: { S: 'T63', H: '2', D: 'T976', C: 'AT765' },
    west: { S: 'K952', H: 'KQ84', D: 'K53', C: '32' },
  },
];
