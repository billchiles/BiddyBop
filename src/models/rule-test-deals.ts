/// Deterministic rule-practice deals, grouped in the same order as the executable opener-rebid
/// rule families.  An expected call/rule pair is a positive assertion, not an exact candidate set.
/// practiceAuction is the intended physical path (including opponent passes) for manual practice.
/// Selecting a deal does not change the partnership's bidding system.
///
import type { BiddingSystem, Call } from './bidding-types';
import type { Suit } from './cards';

export interface RuleTestDeal {
  description: string;
  practiceAuction: Call[];
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
    description: '1C-1NT-Pass: minimum balanced opener accepts 1NT.',
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
    description: '1D-1NT-2D: minimum hand repeats a six-card diamond suit.',
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
    description: '1D-1NT-2C: show a lower-ranking four-card second suit cheaply.',
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
    description: '1D-1NT-2H: reverse with five diamonds, four hearts, and extra strength.',
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
    description: '1D-1NT-3D: jump rebid a six-card diamond suit with medium values.',
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
    description: '1D-1NT-2NT: 18 HCP balanced opener invites in notrump.',
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
    description: '1D-1NT-3C: maximum natural jump shift into clubs.',
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
    description: '1D-1NT-3NT: 20 HCP, 6-3-2-2 semi-balanced hand that did not open 2NT.',
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
];

///
//// Opener rebids after a minor opening and one-level new-suit response
///
export const OPENER_REBID_AFTER_MINOR_ONE_LEVEL_NEW_SUIT_TEST_DEALS: RuleTestDeal[] = [
  {
    description: '1C-1H-1S: economical four-card second suit.',
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
    description: '1C-1H-1NT: minimum balanced hand with no four-card support or one-level second suit.',
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
    description: '1C-1H-2H: minimum simple raise with four-card heart support.',
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
    description: '1C-1H-2D: natural reverse with five clubs and four diamonds.',
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
    description: '1C-1H-3H: jump raise with medium support values.',
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
    description: '1C-1H-2S: maximum jump shift; 1S was the economical spade bid.',
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
    description: '1C-1H-4H: raise responder to game with maximum support values.',
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
    description: '1C-1H-4D: opener-side splinter; 4H should also remain a natural candidate.',
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
];

///
//// Opener rebids after 1D-2C in Standard
///
export const OPENER_REBID_AFTER_MINOR_STANDARD_TWO_LEVEL_NEW_SUIT_TEST_DEALS: RuleTestDeal[] = [
  {
    description: '1D-2C-2D Standard: minimum five diamonds; four hearts are not enough to reverse.',
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
    description: '1D-2C-2H Standard: reverse into hearts with extra strength.',
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
    description: '1D-2C-2NT Standard: minimum balanced hand can conceal a four-card major.',
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
    description: '1D-2C-3C Standard: three clubs are support because responder promised five; 2D may also qualify.',
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
];

/// These remaining buckets await positive deals and evaluator verification.
///
//// Opener rebids after 1D-2C in 2/1
///
export const OPENER_REBID_AFTER_MINOR_TWO_OVER_ONE_NEW_SUIT_TEST_DEALS: RuleTestDeal[] = [];

///
//// Opener rebids after a major opening and 1NT response
///
export const OPENER_REBID_AFTER_MAJOR_1NT_TEST_DEALS: RuleTestDeal[] = [];

///
//// Opener rebids after a major opening and one-level new-suit response
///
export const OPENER_REBID_AFTER_MAJOR_ONE_LEVEL_NEW_SUIT_TEST_DEALS: RuleTestDeal[] = [];

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

export type RuleTestDealBucketId = 'all' | typeof RULE_TEST_DEAL_BUCKETS[number]['id'];

/// Return the chosen bucket's deals (or all of them) that agree with the active system.  The
/// practice UI never changes system settings to make a test deal eligible.
export function getRuleTestDeals (bucketId: RuleTestDealBucketId,
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
