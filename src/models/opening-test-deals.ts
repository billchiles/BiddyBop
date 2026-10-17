/// Opening test deals, kept separate from the bucket registry.
///
/// This file's deals are opening-only deals.  Some files exercise sequences of openings with
/// responding, such as ordinary 1NT/2NT and strong 2C openings will be exercised alongside their
/// responses, rather than duplicated here solely for opening-rule coverage.  Some files exercise
/// sequences of opening, responding, and rebidding together.  Grouping these longer sequences under
/// opener rebids lets users practice the auction across multiple participating seats rather than
/// practicing each bid in isolation.
///

/// `import type` is erased by TypeScript when JavaScript is emitted. Although
/// test-deals-registry.ts imports these values, this type import creates no runtime cycle.
///
import type { RuleTestDeal } from './test-deals-registry';


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
    south: { S: 'Q63', H: 'A42', D: 'T76', C: '8542' },
    east: { S: 'T54', H: 'T976', D: 'AQ', C: 'KQ63' },
    west: { S: 'KJ98', H: '3', D: 'J9532', C: 'AT7' },
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
    south: { S: 'Q63', H: 'A42', D: 'T76', C: '8542' },
    east: { S: 'T54', H: 'T976', D: 'AQ', C: 'KQ63' },
    west: { S: 'KJ98', H: '3', D: 'J9532', C: 'AT7' },
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
    south: { S: 'T63', H: 'Q85', D: 'KJ64', C: '965' },
    east: { S: '974', H: 'A93', D: 'T8', C: 'AQT32' },
    west: { S: 'K2', H: 'JT62', D: 'Q953', C: 'K74' },
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
    south: { S: 'T63', H: 'Q85', D: 'KJ64', C: '965' },
    east: { S: '974', H: 'A93', D: 'T8', C: 'AQT32' },
    west: { S: 'K2', H: 'JT62', D: 'Q953', C: 'K74' },
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
    south: { S: 'K65', H: 'T53', D: 'QJ74', C: 'T86' },
    east: { S: 'T8', H: 'Q72', D: 'A62', C: 'KJ753' },
    west: { S: 'J43', H: 'A9', D: 'KT98', C: 'AQ94' },
  },
  {
    description: 'Seven hearts with 9 HCP and three length points reach ordinary one-level opening ' +
                 'values: open 1H rather than using either the six-card weak two or the weak three.',
    practiceAuction: ['1H'],
    practiceGuidance: [
      { auctionIndex: 0, seat: 'N', text: 'North has 9 HCP, but seven hearts add three length ' +
        'points, reaching 12 opening points. That makes 1H the system opening rather than ' +
        'a weak 3H preempt, even though the Rule of 20 total is only 19.' },
    ],
    expectedOpeningCalls: [
      { call: '1H', ruleIds: ['open-five-card-major'] },
    ],
    rejectedOpeningCalls: ['2H', '3H'],
    north: { S: 'K42', H: 'KQJ9876', D: '73', C: '5' },
    south: { S: 'T85', H: 'A54', D: 'QJ86', C: 'T87' },
    east: { S: 'AJ96', H: '2', D: 'K92', C: 'QJ963' },
    west: { S: 'Q73', H: 'T3', D: 'AT54', C: 'AK42' },
  },
];
