/// Overcalling test deals, kept separate from the bucket registry.

/// `import type` is erased by TypeScript when JavaScript is emitted. Although
/// rule-test-deals.ts imports these values, this type import creates no runtime cycle.
///
import type { RuleTestDeal } from './rule-test-deals';

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
