/// Responding test deals, kept separate from the bucket registry.

/// `import type` is erased by TypeScript when JavaScript is emitted. Although
/// test-deals-registry.ts imports these values, this type import creates no runtime cycle.
///
import type { RuleTestDeal } from './test-deals-registry';


//// Responses to one-level minor openings
/// This bucket adds response situations missing from the opener-rebid practice test deals; it is
/// not an exhaustive response quiz.  Those rebid buckets already exercise a one-level new-suit
/// response, both Standard and 2/1 1D-2C, balanced 1NT and invitational 2NT responses, and both
/// ordinary minor raises and the direct 3NT game response.  Their expectedResponseCalls still count
/// toward complete coverage.  The rare 4NT Blackwood response is intentionally left without a
/// dedicated practice deal.
///
export const RESPONSE_AFTER_MINOR_OPENING_TEST_DEALS: RuleTestDeal[] = [
  {
    description: '1D-Pass: 5 HCP with four diamonds; even a known minor fit does not overcome insufficient responding values.',
    practiceAuction: ['1D', 'Pass', 'Pass'],
    expectedOpeningCalls: [
      { call: '1D', ruleIds: ['open-convenient-minor'] },
    ],
    expectedResponseCalls: [
      { call: 'Pass', ruleIds: ['respond-to-minor-w/-pass-0-5'] },
    ],
    north: { S: 'K84', H: 'Q72', D: 'AJ92', C: 'K85' },
    south: { S: 'Q62', H: 'J94', D: 'T743', C: 'Q64' },
    east: { S: 'JT93', H: 'A86', D: '865', C: 'AJT' },
    west: { S: 'A75', H: 'KT53', D: 'KQ', C: '9732' },
  },
  {
    description: '1C-1D: 13 HCP with five-card club support and four diamonds; both the ordinary forcing 1D response and the strong-support new-suit-first rule apply.  Raise clubs later.',
    practiceAuction: ['1C', 'Pass', '1D'],
    expectedOpeningCalls: [
      { call: '1C', ruleIds: ['open-convenient-minor'] },
    ],
    expectedResponseCalls: [
      { call: '1D', ruleIds: ['respond-to-minor-w/-new-suit-one-level-priority',
                              'respond-to-minor-w/-13plus-start-new-suit'] },
    ],
    north: { S: 'K84', H: 'Q72', D: 'J93', C: 'AK86' },
    south: { S: 'J9', H: 'K6', D: 'AK72', C: 'QT975' },
    east: { S: 'A7632', H: '9843', D: '4', C: 'J43' },
    west: { S: 'QT5', H: 'AJT5', D: 'QT865', C: '2' },
  },
  {
    description: '1C: 6 HCP with six good hearts; under weak jump shifts, 2H outranks the ordinary 1H response without eliminating it.',
    practiceAuction: ['1C', 'Pass', '2H'],
    requiredSystem: { jumpShift: 'weak' },
    expectedOpeningCalls: [
      { call: '1C', ruleIds: ['open-convenient-minor'] },
    ],
    expectedResponseCalls: [
      { call: '2H', ruleIds: ['respond-to-minor-w/-weak-jump-shift-modern'] },
      { call: '1H', ruleIds: ['respond-to-minor-w/-new-suit-one-level-priority'] },
    ],
    expectedResponseCallOrder: [['2H', '1H']],
    north: { S: 'K84', H: 'Q72', D: 'A92', C: 'KJ85' },
    south: { S: 'Q63', H: 'KJT986', D: 'T4', C: 'T9' },
    east: { S: 'T752', H: 'A5', D: 'KQ3', C: 'Q743' },
    west: { S: 'AJ9', H: '43', D: 'J8765', C: 'A62' },
  },
  {
    description: '1C: 18 HCP with five strong hearts; under strong jump shifts, 2H outranks the ordinary forcing 1H response without eliminating it.',
    practiceAuction: ['1C', 'Pass', '2H'],
    requiredSystem: { jumpShift: 'strong' },
    expectedOpeningCalls: [
      { call: '1C', ruleIds: ['open-convenient-minor'] },
    ],
    expectedResponseCalls: [
      { call: '2H', ruleIds: ['respond-to-minor-w/-strong-jump-shift-classic'] },
      { call: '1H', ruleIds: ['respond-to-minor-w/-new-suit-one-level-priority'] },
    ],
    expectedResponseCallOrder: [['2H', '1H']],
    north: { S: 'K84', H: '742', D: 'AQ9', C: 'KQ85' },
    south: { S: 'AJ6', H: 'AKQ85', D: 'K7', C: 'J94' },
    east: { S: 'QT975', H: '3', D: 'JT542', C: 'T6' },
    west: { S: '32', H: 'JT96', D: '863', C: 'A732' },
  },
  {
    description: '1C: 8 HCP with four hearts and four spades; both one-level majors qualify. ' +
                 'With equally long four-card majors, bid up the line: 1H before 1S.',
    practiceAuction: ['1C', 'Pass', '1H'],
    expectedOpeningCalls: [
      { call: '1C', ruleIds: ['open-convenient-minor'] },
    ],
    expectedResponseCalls: [
      { call: '1H', ruleIds: ['respond-to-minor-w/-new-suit-one-level-priority'] },
      { call: '1S', ruleIds: ['respond-to-minor-w/-new-suit-one-level-priority'] },
    ],
    expectedResponseCallOrder: [['1H', '1S']],
    north: { S: 'K84', H: 'Q72', D: 'A92', C: 'KJ85' },
    south: { S: 'JT75', H: 'KJT6', D: 'JT4', C: 'Q9' },
    east: { S: '93', H: 'A43', D: '8763', C: 'A732' },
    west: { S: 'AQ62', H: '985', D: 'KQ5', C: 'T64' },
  },
  {
    description: '1C: 8 HCP with five hearts and five spades; both one-level majors qualify. ' +
                 'With equally long five-card majors, bid down the line: 1S before 1H.',
    practiceAuction: ['1C', 'Pass', '1S'],
    expectedOpeningCalls: [
      { call: '1C', ruleIds: ['open-convenient-minor'] },
    ],
    expectedResponseCalls: [
      { call: '1S', ruleIds: ['respond-to-minor-w/-new-suit-one-level-priority'] },
      { call: '1H', ruleIds: ['respond-to-minor-w/-new-suit-one-level-priority'] },
    ],
    expectedResponseCallOrder: [['1S', '1H']],
    north: { S: 'K84', H: 'Q72', D: 'A92', C: 'KJ85' },
    south: { S: 'QJT75', H: 'K9643', D: 'T3', C: 'Q' },
    east: { S: '93', H: 'A5', D: 'KQ4', C: 'T97643' },
    west: { S: 'A62', H: 'JT8', D: 'J8765', C: 'A2' },
  },
  {
    description: '1C: 8 HCP with five diamonds and four spades; prefer 1S to look for the ' +
                 'major fit, but retain the genuinely longer 1D as an alternative.',
    practiceAuction: ['1C', 'Pass', '1S'],
    expectedOpeningCalls: [
      { call: '1C', ruleIds: ['open-convenient-minor'] },
    ],
    expectedResponseCalls: [
      { call: '1S', ruleIds: ['respond-to-minor-w/-new-suit-one-level-priority'] },
      { call: '1D', ruleIds: ['respond-to-minor-w/-new-suit-one-level-priority'] },
    ],
    expectedResponseCallOrder: [['1S', '1D']],
    north: { S: 'K84', H: 'Q72', D: 'A92', C: 'KJ85' },
    south: { S: 'T965', H: 'J9', D: 'KQT63', C: 'QT' },
    east: { S: 'J73', H: 'AT43', D: 'J4', C: 'A742' },
    west: { S: 'AQ2', H: 'K865', D: '875', C: '963' },
  },
  {
    description: '1C: 12 HCP with five diamonds and four spades; show the major first. ' +
                 'The longer-diamond alternative is reserved for minimum 6-10 HCP responses.',
    practiceAuction: ['1C', 'Pass', '1S'],
    expectedOpeningCalls: [
      { call: '1C', ruleIds: ['open-convenient-minor'] },
    ],
    expectedResponseCalls: [
      { call: '1S', ruleIds: ['respond-to-minor-w/-new-suit-one-level-priority'] },
    ],
    rejectedResponseCalls: ['1D'],
    north: { S: 'K84', H: 'Q72', D: 'A92', C: 'KJ85' },
    south: { S: 'A963', H: 'A3', D: 'KJ543', C: '74' },
    east: { S: 'T72', H: 'T864', D: '876', C: 'A62' },
    west: { S: 'QJ5', H: 'KJ95', D: 'QT', C: 'QT93' },
  },
  {
    description: '1D: 8 HCP with four diamonds and four spades; showing a four-card major ' +
                 'takes priority over the otherwise available minimum diamond raise.',
    practiceAuction: ['1D', 'Pass', '1S'],
    expectedOpeningCalls: [
      { call: '1D', ruleIds: ['open-convenient-minor'] },
    ],
    expectedResponseCalls: [
      { call: '1S', ruleIds: ['respond-to-minor-w/-new-suit-one-level-priority'] },
    ],
    rejectedResponseCalls: ['2D'],
    north: { S: 'K84', H: 'Q72', D: 'AJ92', C: 'K85' },
    south: { S: '9763', H: 'JT4', D: 'Q864', C: 'AJ' },
    east: { S: 'AQT', H: 'A65', D: '753', C: 'T976' },
    west: { S: 'J52', H: 'K983', D: 'KT', C: 'Q432' },
  },
  {
    description: '1C: 8 HCP with five hearts and four spades; the longer heart suit ' +
                 'eliminates the shorter 1S response instead of merely ranking it second.',
    practiceAuction: ['1C', 'Pass', '1H'],
    expectedOpeningCalls: [
      { call: '1C', ruleIds: ['open-convenient-minor'] },
    ],
    expectedResponseCalls: [
      { call: '1H', ruleIds: ['respond-to-minor-w/-new-suit-one-level-priority'] },
    ],
    rejectedResponseCalls: ['1S'],
    north: { S: 'K84', H: 'Q72', D: 'A92', C: 'KJ85' },
    south: { S: 'A762', H: 'A9864', D: '43', C: '42' },
    east: { S: 'Q9', H: 'KJT3', D: 'K5', C: 'QT963' },
    west: { S: 'JT53', H: '5', D: 'QJT876', C: 'A7' },
  },
];

//// Responses to one-level major openings
/// Supplementary major-opening response coverage.  The opener-rebid buckets already exercise simple
/// raises, natural new-suit responses, both forcing and non-forcing 1NT responses, and the weak
/// preemptive game raise.  Their expectedResponseCalls count toward corpus coverage; rare Blackwood
/// is deferred.
///
export const RESPONSE_AFTER_MAJOR_OPENING_TEST_DEALS: RuleTestDeal[] = [
  {
    description: '1S-Pass: 4 HCP and only two spades; without enough strength to respond, pass.',
    practiceAuction: ['1S', 'Pass', 'Pass'],
    expectedOpeningCalls: [
      { call: '1S', ruleIds: ['open-five-card-major'] },
    ],
    expectedResponseCalls: [
      { call: 'Pass', ruleIds: ['respond-to-major-w/-pass-0-5'] },
    ],
    north: { S: 'AQJ72', H: 'K8', D: 'A982', C: 'T8' },
    south: { S: '65', H: '9542', D: 'JT43', C: 'K43' },
    east: { S: '983', H: 'AQJ7', D: 'Q7', C: 'J952' },
    west: { S: 'KT4', H: 'T63', D: 'K65', C: 'AQ76' },
  },
  {
    description: '1H-Pass: 4 HCP, three hearts and flat shape; support adds no shortage points, so pass.',
    practiceAuction: ['1H', 'Pass', 'Pass'],
    expectedOpeningCalls: [
      { call: '1H', ruleIds: ['open-five-card-major'] },
    ],
    rejectedOpeningCalls: ['1NT'],
    expectedResponseCalls: [
      { call: 'Pass', ruleIds: ['respond-to-major-w/-support-pass-0-5'] },
    ],
    north: { S: 'K8', H: 'AQJ72', D: 'AJ92', C: 'T8' },
    south: { S: 'Q53', H: '983', D: 'Q873', C: '973' },
    east: { S: 'J642', H: 'KT6', D: 'KT', C: 'KJ62' },
    west: { S: 'AT97', H: '54', D: '654', C: 'AQ54' },
  },
  {
    description: '1S-3S: 11 HCP plus one shortage point for a doubleton gives 12 support points; with four ' +
                 'spades, make a limit raise.',
    practiceAuction: ['1S', 'Pass', '3S'],
    expectedOpeningCalls: [
      { call: '1S', ruleIds: ['open-five-card-major'] },
    ],
    expectedResponseCalls: [
      { call: '3S', ruleIds: ['respond-to-major-w/-support-limit-raise-four-card'] },
    ],
    north: { S: 'AQJ72', H: 'K8', D: 'A982', C: 'T8' },
    south: { S: 'T954', H: 'Q43', D: 'KJ43', C: 'KQ' },
    east: { S: '863', H: 'J72', D: '65', C: 'AJ764' },
    west: { S: 'K', H: 'AT965', D: 'QT7', C: '9532' },
  },
  {
    description: '1H-3H: 11 HCP, six-card heart support and two doubletons give 13 support points. ' +
                 'With no suitable new suit for the agreed game-forcing sequence, a conservative ' +
                 'invitational raise is available rather than leaving the response unmodeled.',
    practiceAuction: ['1H', 'Pass', '3H'],
    requiredSystem: { majorGameForceWithSupport: 'newSuitThenRaise' },
    expectedOpeningCalls: [
      { call: '1H', ruleIds: ['open-five-card-major'] },
    ],
    expectedResponseCalls: [
      { call: '3H', ruleIds: ['respond-to-major-w/-support-long-fit-13-limit-raise-fallback'] },
    ],
    rejectedResponseCalls: ['4H', '2C', '2D', '1S'],
    north: { S: 'A6', H: 'AKQ932', D: '943', C: 'T6' },
    south: { S: 'QJ9', H: 'JT8654', D: 'K2', C: 'KJ' },
    east: { S: 'T753', H: '', D: 'AJT85', C: '8752' },
    west: { S: 'K842', H: '7', D: 'Q76', C: 'AQ943' },
  },
  {
    description: '1H-1S: 11 HCP plus one shortage point gives 12 support points with three hearts; show four ' +
                 'spades first, then make the invitational heart raise.',
    practiceAuction: ['1H', 'Pass', '1S'],
    expectedOpeningCalls: [
      { call: '1H', ruleIds: ['open-five-card-major'] },
    ],
    expectedResponseCalls: [
      { call: '1S', ruleIds: ['respond-to-major-w/-support-limit-raise-three-card-new-suit-first'] },
    ],
    // The four-card spade suit is available ahead of the 1NT limit-raise route.
    rejectedResponseCalls: ['1NT'],
    north: { S: 'K8', H: 'AQJ72', D: 'AJ92', C: 'T8' },
    south: { S: 'AQ74', H: 'K64', D: 'QT65', C: '95' },
    east: { S: 'J932', H: '53', D: 'K843', C: 'A64' },
    west: { S: 'T65', H: 'T98', D: '7', C: 'KQJ732' },
  },
  {
    description: '1S-1NT: 11 HCP plus one shortage point gives 12 support points with exactly three spades; ' +
                 'under forcing 1NT, invite with a later spade raise.',
    practiceAuction: ['1S', 'Pass', '1NT'],
    requiredSystem: { majorOneNtResponse: 'forcing' },
    expectedOpeningCalls: [
      { call: '1S', ruleIds: ['open-five-card-major'] },
    ],
    expectedResponseCalls: [
      { call: '1NT', ruleIds: ['respond-to-major-w/-support-limit-raise-three-card'] },
    ],
    north: { S: 'AQJ72', H: 'K8', D: 'A982', C: 'T8' },
    south: { S: 'K54', H: 'Q963', D: 'KJ65', C: 'Q7' },
    east: { S: '93', H: 'J72', D: 'Q4', C: 'K96432' },
    west: { S: 'T86', H: 'AT54', D: 'T73', C: 'AJ5' },
  },
  {
    description: '1H-1NT: 12 HCP and three hearts, but no four-card spade suit; non-forcing 1NT is the ' +
                 'limit-raise fallback. Opener may pass, so the later invitation is not guaranteed.',
    practiceAuction: ['1H', 'Pass', '1NT'],
    requiredSystem: { majorOneNtResponse: 'nonForcing' },
    expectedOpeningCalls: [
      { call: '1H', ruleIds: ['open-five-card-major'] },
    ],
    expectedResponseCalls: [
      { call: '1NT', ruleIds: ['respond-to-major-w/-support-limit-raise-three-card-nonforcing-1nt-fallback'] },
    ],
    north: { S: 'K8', H: 'AQJ72', D: 'AJ92', C: 'T8' },
    south: { S: 'J96', H: 'K93', D: 'KT63', C: 'KQ9' },
    east: { S: 'T7432', H: 'T6', D: '75', C: 'A654' },
    west: { S: 'AQ5', H: '854', D: 'Q84', C: 'J732' },
  },
  {
    description: '1S: 14 HCP, flat 4-3-3-3, three-card spade support and four diamonds; both game-forcing 2D ' +
                 'followed by a raise and direct 3NT qualify. Shortage adds no points.',
    practiceAuction: ['1S', 'Pass', '2D'],
    expectedOpeningCalls: [
      { call: '1S', ruleIds: ['open-five-card-major'] },
    ],
    expectedResponseCalls: [
      { call: '2D', ruleIds: ['respond-to-major-w/-three-card-support-13plus-bid-new-suit-then-raise'] },
      { call: '3NT', ruleIds: ['respond-to-major-w/-3nt-flat-13-15'] },
    ],
    north: { S: 'AQJ72', H: 'K8', D: 'A982', C: 'T8' },
    south: { S: 'K65', H: 'AT3', D: 'K763', C: 'A74' },
    east: { S: 'T94', H: '642', D: 'T4', C: 'Q9652' },
    west: { S: '83', H: 'QJ975', D: 'QJ5', C: 'KJ3' },
  },
  {
    description: '1H: 11 HCP plus three shortage points for a singleton club gives 14 support points with four ' +
                 'hearts; the 4C splinter ranks ahead of the valid 1S and 2D new-suit-first routes.',
    practiceAuction: ['1H', 'Pass', '4C'],
    requiredSystem: { majorGameForceWithSupport: 'newSuitThenRaise', splinters: true },
    expectedOpeningCalls: [
      { call: '1H', ruleIds: ['open-five-card-major'] },
    ],
    expectedResponseCalls: [
      { call: '4C', ruleIds: ['respond-to-major-w/-support-splinter'] },
      { call: '1S', ruleIds: ['respond-to-major-w/-four-card-support-13plus-bid-new-suit-then-raise'] },
      { call: '2D', ruleIds: ['respond-to-major-w/-four-card-support-13plus-bid-new-suit-then-raise'] },
    ],
    expectedResponseCallOrder: [['4C', '1S'], ['4C', '2D']],
    north: { S: 'K8', H: 'AQJ72', D: 'AJ92', C: 'T8' },
    south: { S: 'J962', H: 'K986', D: 'K763', C: 'A' },
    east: { S: 'Q753', H: '53', D: '54', C: 'KQJ96' },
    west: { S: 'AT4', H: 'T4', D: 'QT8', C: '75432' },
  },
  {
    description: '1S-2NT: 13 HCP plus one shortage point for a doubleton gives 14 support points with four ' +
                 'spades; Jacoby 2NT is the agreed game force.',
    practiceAuction: ['1S', 'Pass', '2NT'],
    requiredSystem: { majorGameForceWithSupport: 'jacoby2NT' },
    expectedOpeningCalls: [
      { call: '1S', ruleIds: ['open-five-card-major'] },
    ],
    expectedResponseCalls: [
      { call: '2NT', ruleIds: ['respond-to-major-w/-support-jacoby-2nt-agreement'] },
    ],
    north: { S: 'AQJ72', H: 'K8', D: 'A982', C: 'T8' },
    south: { S: 'K954', H: 'AT4', D: '6543', C: 'AQ' },
    east: { S: 'T', H: '9653', D: 'KJ', C: 'J76543' },
    west: { S: '863', H: 'QJ72', D: 'QT7', C: 'K92' },
  },
  {
    description: '1H: 6 HCP and six good spades; under weak jump shifts, 2S outranks the ordinary 1S response, ' +
                 'which remains visible.',
    practiceAuction: ['1H', 'Pass', '2S'],
    requiredSystem: { jumpShift: 'weak' },
    expectedOpeningCalls: [
      { call: '1H', ruleIds: ['open-five-card-major'] },
    ],
    expectedResponseCalls: [
      { call: '2S', ruleIds: ['respond-to-major-w-weak-jump-shift-modern'] },
      { call: '1S', ruleIds: ['respond-to-major-w/o-support-new-suit-one-level'] },
    ],
    expectedResponseCallOrder: [['2S', '1S']],
    north: { S: 'K8', H: 'AQJ72', D: 'AJ92', C: 'T8' },
    south: { S: 'AQ7642', H: '8', D: 'T54', C: '532' },
    east: { S: '95', H: 'KT94', D: '873', C: 'AK97' },
    west: { S: 'JT3', H: '653', D: 'KQ6', C: 'QJ64' },
  },
  {
    description: '1H: 18 HCP and five strong spades; under strong jump shifts, 2S outranks the ordinary 1S ' +
                 'response, which remains visible.',
    practiceAuction: ['1H', 'Pass', '2S'],
    requiredSystem: { jumpShift: 'strong' },
    expectedOpeningCalls: [
      { call: '1H', ruleIds: ['open-five-card-major'] },
    ],
    expectedResponseCalls: [
      { call: '2S', ruleIds: ['respond-to-major-w/-strong-jump-shift-classic'] },
      { call: '1S', ruleIds: ['respond-to-major-w/o-support-new-suit-one-level'] },
    ],
    north: { S: 'K8', H: 'AQJ72', D: 'AJ92', C: 'T8' },
    south: { S: 'AQJT9', H: 'K8', D: 'KQ7', C: 'K93' },
    east: { S: '654', H: 'T43', D: '85', C: 'QJ752' },
    west: { S: '732', H: '965', D: 'T643', C: 'A64' },
  },
  {
    description: '1S: 13 HCP with three spades, four hearts and only three cards in each ' +
                 'minor. Game-forcing support needs a new suit first: both 2C and 2D are ' +
                 'allowed three-card-minor fallbacks, while four hearts cannot support 2H.',
    practiceAuction: ['1S', 'Pass', '2C'],
    requiredSystem: { majorGameForceWithSupport: 'newSuitThenRaise' },
    expectedOpeningCalls: [
      { call: '1S', ruleIds: ['open-five-card-major'] },
    ],
    expectedResponseCalls: [
      { call: '2C', ruleIds: ['respond-to-major-w/-three-card-support-13plus-bid-new-suit-then-raise'] },
      { call: '2D', ruleIds: ['respond-to-major-w/-three-card-support-13plus-bid-new-suit-then-raise'] },
    ],
    rejectedResponseCalls: ['2H'],
    north: { S: 'AQJ72', H: 'K8', D: 'A982', C: 'T8' },
    south: { S: 'K98', H: 'A974', D: 'KJ7', C: 'Q94' },
    east: { S: '3', H: 'JT63', D: 'T654', C: 'AJ53' },
    west: { S: 'T654', H: 'Q52', D: 'Q3', C: 'K762' },
  },
];

//// Responses to 1NT openings
/// Supplementary 1NT response cases also assert the ordinary 15-17 opening rule.  Natural
/// minor-invitation hands require 6+ cards and at least two of A/K/Q.
///
export const RESPONSE_AFTER_1NT_OPENING_TEST_DEALS: RuleTestDeal[] = [
  {
    description: '1NT, 15-17 opener: 6-HCP balanced responder without a four-card major passes rather than inviting.',
    practiceAuction: ['1NT', 'Pass', 'Pass'],
    requiredSystem: { oneNtOpening: '15-17' },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-15-17'] },
    ],
    expectedResponseCalls: [
      { call: 'Pass', ruleIds: ['respond-to-1nt-w/-pass-0-7-balanced'] },
    ],
    rejectedResponseCalls: ['2NT'],
    north: { S: 'AQ93', H: 'AK4', D: '842', C: 'A72' },
    south: { S: 'T62', H: 'Q87', D: '96', C: 'KJT83' },
    east: { S: 'K75', H: 'JT932', D: 'KQT', C: 'Q9' },
    west: { S: 'J84', H: '65', D: 'AJ753', C: '654' },
  },
  {
    description: '1NT: 6 HCP and five cards in each major; both 2D and 2H Jacoby transfers remain legitimate alternatives.',
    practiceAuction: ['1NT', 'Pass', '2D'],
    requiredSystem: { oneNtOpening: '15-17', jacobyTransfers: true },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-15-17'] },
    ],
    expectedResponseCalls: [
      { call: '2D', ruleIds: ['respond-to-1nt-w/-transfer-to-hearts'] },
      { call: '2H', ruleIds: ['respond-to-1nt-w/-transfer-to-spades'] },
    ],
    north: { S: 'AKT2', H: 'KQ9', D: 'QJ5', C: '953' },
    south: { S: '98764', H: 'AJT84', D: '32', C: 'J' },
    east: { S: 'Q5', H: '65', D: 'T9874', C: 'AK74' },
    west: { S: 'J3', H: '732', D: 'AK6', C: 'QT862' },
  },
  {
    description: '1NT: 9 HCP and five cards in each major; transfer to hearts with 2D to preserve the invitational route.',
    practiceAuction: ['1NT', 'Pass', '2D'],
    requiredSystem: { oneNtOpening: '15-17', jacobyTransfers: true },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-15-17'] },
    ],
    expectedResponseCalls: [
      { call: '2D', ruleIds: ['respond-to-1nt-w/-transfer-to-hearts'] },
    ],
    rejectedResponseCalls: ['2H'],
    north: { S: 'JT8', H: 'A98', D: 'AKQJ3', C: 'Q2' },
    south: { S: 'A9632', H: 'QT732', D: '82', C: 'K' },
    east: { S: 'KQ75', H: 'K6', D: '64', C: 'JT875' },
    west: { S: '4', H: 'J54', D: 'T975', C: 'A9643' },
  },
  {
    description: '1NT: 11 HCP and five cards in each major; transfer to spades with 2H to preserve the game-forcing continuation.',
    practiceAuction: ['1NT', 'Pass', '2H'],
    requiredSystem: { oneNtOpening: '15-17', jacobyTransfers: true },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-15-17'] },
    ],
    expectedResponseCalls: [
      { call: '2H', ruleIds: ['respond-to-1nt-w/-transfer-to-spades'] },
    ],
    rejectedResponseCalls: ['2D'],
    north: { S: 'AJ7', H: 'J9', D: 'K9654', C: 'AQT' },
    south: { S: 'KT653', H: 'AT842', D: 'J2', C: 'K' },
    east: { S: 'Q92', H: 'Q7', D: 'T83', C: 'J7432' },
    west: { S: '84', H: 'K653', D: 'AQ7', C: '9865' },
  },
  {
    description: '1NT: 8 HCP and six clubs headed by KQ; natural 3C invites, with suit quality satisfying the tested honor requirement.',
    practiceAuction: ['1NT', 'Pass', '3C'],
    requiredSystem: { oneNtOpening: '15-17' },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-15-17'] },
    ],
    expectedResponseCalls: [
      { call: '3C', ruleIds: ['respond-to-1nt-w/-3c-3d-natural-invitational'] },
    ],
    north: { S: 'K653', H: 'J53', D: 'AK4', C: 'A87' },
    south: { S: '94', H: 'Q2', D: 'J62', C: 'KQ6432' },
    east: { S: 'QJT72', H: 'AT6', D: 'T97', C: '95' },
    west: { S: 'A8', H: 'K9874', D: 'Q853', C: 'JT' },
  },
  {
    description: '1NT: 9 HCP and six diamonds headed by AK; natural 3D invites, with suit quality satisfying the tested honor requirement.',
    practiceAuction: ['1NT', 'Pass', '3D'],
    requiredSystem: { oneNtOpening: '15-17' },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-15-17'] },
    ],
    expectedResponseCalls: [
      { call: '3D', ruleIds: ['respond-to-1nt-w/-3c-3d-natural-invitational'] },
    ],
    north: { S: 'K63', H: 'AJ7', D: 'QJ6', C: 'KJT3' },
    south: { S: '2', H: '98', D: 'AKT874', C: 'Q987' },
    east: { S: 'Q9754', H: 'KQT2', D: '53', C: '65' },
    west: { S: 'AJT8', H: '6543', D: '92', C: 'A42' },
  },
  {
    description: '1NT: without Stayman or transfers, 2 HCP and five spades give a natural ' +
                 'weak 2S signoff instead of passing a balanced weak hand.',
    practiceAuction: ['1NT', 'Pass', '2S'],
    requiredSystem: { oneNtOpening: '15-17', stayman: false, jacobyTransfers: false,
                      texasTransfers: false },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-15-17'] },
    ],
    expectedResponseCalls: [
      { call: '2S', ruleIds: ['respond-to-1nt-w/-2h-2s-natural-signoff'] },
    ],
    rejectedResponseCalls: ['Pass'],
    north: { S: 'AK8', H: 'AT2', D: 'K652', C: 'JT4' },
    south: { S: 'J7432', H: 'J94', D: 'T83', C: '75' },
    east: { S: 'Q96', H: '873', D: 'A94', C: 'AQ32' },
    west: { S: 'T5', H: 'KQ65', D: 'QJ7', C: 'K986' },
  },
  {
    description: '1NT: without Stayman or transfers, 12 HCP and exactly five spades ' +
                 'qualify for natural, forcing 3S; the balanced 3NT fallback is eliminated.',
    practiceAuction: ['1NT', 'Pass', '3S'],
    requiredSystem: { oneNtOpening: '15-17', stayman: false, jacobyTransfers: false,
                      texasTransfers: false },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-15-17'] },
    ],
    expectedResponseCalls: [
      { call: '3S', ruleIds: ['respond-to-1nt-w/-3h-3s-natural-forcing'] },
    ],
    rejectedResponseCalls: ['3NT'],
    north: { S: 'JT53', H: 'AKJ3', D: 'AT8', C: 'Q9' },
    south: { S: 'AK842', H: '76', D: 'Q54', C: 'K74' },
    east: { S: 'Q76', H: 'QT2', D: '732', C: 'A532' },
    west: { S: '9', H: '9854', D: 'KJ96', C: 'JT86' },
  },
  {
    description: '1NT: 12 HCP and six spades, with Texas off but Jacoby on: natural 4S ' +
                 'is the direct game route and suppresses the otherwise available 2H transfer.',
    practiceAuction: ['1NT', 'Pass', '4S'],
    requiredSystem: { oneNtOpening: '15-17', stayman: true, jacobyTransfers: true,
                      texasTransfers: false },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-15-17'] },
    ],
    expectedResponseCalls: [
      { call: '4S', ruleIds: ['respond-to-1nt-w/-4h-4s-natural-game'] },
    ],
    rejectedResponseCalls: ['2H', '4H'],
    north: { S: 'K5', H: 'AKJ8', D: 'A87', C: '9876' },
    south: { S: 'AJT942', H: 'Q6', D: 'QJ54', C: 'Q' },
    east: { S: '63', H: 'T9753', D: 'K6', C: 'AKT2' },
    west: { S: 'Q87', H: '42', D: 'T932', C: 'J543' },
  },
  {
    description: '1NT: 16 HCP and six hearts without another four-card major: direct, ' +
                 'forcing 3H shows slam interest instead of an ordinary Jacoby 2D transfer.',
    practiceAuction: ['1NT', 'Pass', '3H'],
    requiredSystem: { oneNtOpening: '15-17', jacobyTransfers: true },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-15-17'] },
    ],
    expectedResponseCalls: [
      { call: '3H', ruleIds: ['respond-to-1nt-w/-3h-3s-slam-interest'] },
    ],
    rejectedResponseCalls: ['2D'],
    north: { S: 'QJT8', H: 'J4', D: 'AK87', C: 'AJ8' },
    south: { S: 'A67', H: 'KQ9753', D: 'QT', C: 'KQ' },
    east: { S: 'K2', H: 'T82', D: 'J642', C: 'T743' },
    west: { S: '9543', H: 'A6', D: '953', C: '9652' },
  },
  {
    description: '1NT, 16-18: balanced 6 HCP without a four-card major passes; 7 HCP starts the invitation.',
    practiceAuction: ['1NT', 'Pass', 'Pass'],
    requiredSystem: { oneNtOpening: "16-18" },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-16-18'] },
    ],
    expectedResponseCalls: [
      { call: 'Pass', ruleIds: ['respond-to-1nt-w/-pass-0-7-balanced'] },
    ],
    rejectedResponseCalls: ['2NT'],
    north: { S: 'AK5', H: 'KQ9', D: '932', C: 'A754' },
    south: { S: 'J92', H: '832', D: 'K876', C: 'Q83' },
    east: { S: 'Q643', H: 'JT65', D: 'AQ', C: 'J62' },
    west: { S: 'T87', H: 'A74', D: 'JT54', C: 'KT9' },
  },
  {
    description: 'The same balanced 7-HCP hand over 15-17 passes rather than inviting with 2NT.',
    practiceAuction: ['1NT', 'Pass', 'Pass'],
    requiredSystem: { oneNtOpening: "15-17" },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-15-17'] },
    ],
    expectedResponseCalls: [
      { call: 'Pass', ruleIds: ['respond-to-1nt-w/-pass-0-7-balanced'] },
    ],
    rejectedResponseCalls: ['2NT'],
    north: { S: 'A52', H: 'K8532', D: 'KQ8', C: 'AJ' },
    south: { S: 'QT9', H: 'AJT', D: 'T763', C: '852' },
    east: { S: 'KJ764', H: 'Q9', D: 'J95', C: 'T73' },
    west: { S: '83', H: '764', D: 'A42', C: 'KQ964' },
  },
  {
    description: '1NT, 16-18: balanced 9 HCP bids 3NT directly; the same hand invites over 15-17.',
    practiceAuction: ['1NT', 'Pass', '3NT'],
    requiredSystem: { oneNtOpening: "16-18" },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-16-18'] },
    ],
    expectedResponseCalls: [
      { call: '3NT', ruleIds: ['respond-to-1nt-w/-3nt-10-15-balanced'] },
    ],
    rejectedResponseCalls: ['2NT'],
    north: { S: 'AKT', H: 'KJ63', D: '93', C: 'AJ93' },
    south: { S: 'Q64', H: 'A84', D: 'T876', C: 'K72' },
    east: { S: '73', H: '752', D: 'KJ54', C: '8654' },
    west: { S: 'J9852', H: 'QT9', D: 'AQ2', C: 'QT' },
  },
  {
    description: '1NT, 16-18: 7 HCP and four hearts qualify for Stayman instead of a weak Pass.',
    practiceAuction: ['1NT', 'Pass', '2C'],
    requiredSystem: { oneNtOpening: "16-18", stayman: true },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-16-18'] },
    ],
    expectedResponseCalls: [
      { call: '2C', ruleIds: ['respond-to-1nt-w/-stayman'] },
    ],
    rejectedResponseCalls: ['Pass'],
    north: { S: 'AQ532', H: '876', D: 'A6', C: 'AKT' },
    south: { S: 'J74', H: 'AJ43', D: 'T53', C: 'J43' },
    east: { S: 'KT86', H: 'KQT', D: '842', C: 'Q87' },
    west: { S: '9', H: '952', D: 'KQJ97', C: '9652' },
  },
  {
    description: 'The same balanced 7-HCP, four-heart hand over 15-17 is below the normal Stayman threshold.',
    practiceAuction: ['1NT', 'Pass', 'Pass'],
    requiredSystem: { oneNtOpening: "15-17", stayman: true },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-15-17'] },
    ],
    expectedResponseCalls: [
      { call: 'Pass', ruleIds: ['respond-to-1nt-w/-pass-0-7-balanced'] },
    ],
    rejectedResponseCalls: ['2C'],
    north: { S: 'AQ532', H: '876', D: 'A6', C: 'AKT' },
    south: { S: 'J74', H: 'AJ43', D: 'T53', C: 'J43' },
    east: { S: 'KT86', H: 'KQT', D: '842', C: 'Q87' },
    west: { S: '9', H: '952', D: 'KQJ97', C: '9652' },
  },
  {
    description: '1NT, 16-18: 8 HCP with both majors five cards; transfer to hearts first for the invitational route.',
    practiceAuction: ['1NT', 'Pass', '2D'],
    requiredSystem: { oneNtOpening: "16-18", jacobyTransfers: true },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-16-18'] },
    ],
    expectedResponseCalls: [
      { call: '2D', ruleIds: ['respond-to-1nt-w/-transfer-to-hearts'] },
    ],
    rejectedResponseCalls: ['2H'],
    north: { S: 'Q84', H: 'A6', D: 'AQ9', C: 'A7643' },
    south: { S: 'AJT62', H: 'KT975', D: '74', C: '2' },
    east: { S: 'K75', H: 'QJ83', D: 'T32', C: 'KT5' },
    west: { S: '93', H: '42', D: 'KJ865', C: 'QJ98' },
  },
  {
    description: '1NT, 16-18: 9 HCP with two five-card majors; transfer to spades first for the game-force route.',
    practiceAuction: ['1NT', 'Pass', '2H'],
    requiredSystem: { oneNtOpening: "16-18", jacobyTransfers: true },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-16-18'] },
    ],
    expectedResponseCalls: [
      { call: '2H', ruleIds: ['respond-to-1nt-w/-transfer-to-spades'] },
    ],
    rejectedResponseCalls: ['2D'],
    north: { S: 'Q92', H: '864', D: 'AK8', C: 'AKJ4' },
    south: { S: 'AT864', H: 'AJT73', D: '54', C: '5' },
    east: { S: 'J53', H: '52', D: 'QT976', C: '973' },
    west: { S: 'K7', H: 'KQ9', D: 'J32', C: 'QT862' },
  },
  {
    description: '1NT, 16-18: 9 HCP and six hearts give Texas 4D; the same hand uses Jacoby over 15-17.',
    practiceAuction: ['1NT', 'Pass', '4D'],
    requiredSystem: { oneNtOpening: "16-18", stayman: true, jacobyTransfers: true, texasTransfers: true },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-16-18'] },
    ],
    expectedResponseCalls: [
      { call: '4D', ruleIds: ['respond-to-1nt-w/-texas-transfer-to-hearts'] },
    ],
    rejectedResponseCalls: ['2D'],
    north: { S: '84', H: 'AQ5', D: 'AQ753', C: 'KQ2' },
    south: { S: 'T62', H: 'KT7643', D: 'J2', C: 'AJ' },
    east: { S: 'K953', H: 'J98', D: 'K84', C: '964' },
    west: { S: 'AQJ7', H: '2', D: 'T96', C: 'T8753' },
  },
  {
    description: 'The same 9-HCP six-heart hand over 16-18 bids natural 4H with Texas off; Jacoby stays suppressed.',
    practiceAuction: ['1NT', 'Pass', '4H'],
    requiredSystem: { oneNtOpening: "16-18", stayman: true, jacobyTransfers: true, texasTransfers: false },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-16-18'] },
    ],
    expectedResponseCalls: [
      { call: '4H', ruleIds: ['respond-to-1nt-w/-4h-4s-natural-game'] },
    ],
    rejectedResponseCalls: ['2D', '4D'],
    north: { S: '84', H: 'AQ5', D: 'AQ753', C: 'KQ2' },
    south: { S: 'T62', H: 'KT7643', D: 'J2', C: 'AJ' },
    east: { S: 'K953', H: 'J98', D: 'K84', C: '964' },
    west: { S: 'AQJ7', H: '2', D: 'T96', C: 'T8753' },
  },
  {
    description: 'The same 9-HCP six-heart hand over 15-17 starts with Jacoby 2D, below the Texas game-only range.',
    practiceAuction: ['1NT', 'Pass', '2D'],
    requiredSystem: { oneNtOpening: "15-17", stayman: true, jacobyTransfers: true, texasTransfers: true },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-15-17'] },
    ],
    expectedResponseCalls: [
      { call: '2D', ruleIds: ['respond-to-1nt-w/-transfer-to-hearts'] },
    ],
    rejectedResponseCalls: ['4D'],
    north: { S: '84', H: 'AQ5', D: 'AQ753', C: 'KQ2' },
    south: { S: 'T62', H: 'KT7643', D: 'J2', C: 'AJ' },
    east: { S: 'K953', H: 'J98', D: 'K84', C: '964' },
    west: { S: 'AQJ7', H: '2', D: 'T96', C: 'T8753' },
  },
  {
    description: '1NT, 16-18: 7 HCP and six clubs headed by KQ invite naturally with 3C; suit quality meets the tested honor requirement.',
    practiceAuction: ['1NT', 'Pass', '3C'],
    requiredSystem: { oneNtOpening: "16-18" },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-16-18'] },
    ],
    expectedResponseCalls: [
      { call: '3C', ruleIds: ['respond-to-1nt-w/-3c-3d-natural-invitational'] },
    ],
    north: { S: 'KQT3', H: 'AQ9', D: 'AJ74', C: 'J7' },
    south: { S: 'J9', H: 'JT3', D: '63', C: 'KQT652' },
    east: { S: 'A875', H: 'K754', D: 'KT2', C: '83' },
    west: { S: '642', H: '862', D: 'Q985', C: 'A94' },
  },
  {
    description: 'The same balanced 15-HCP hand over 15-17 places the contract in 3NT, not quantitative 4NT.',
    practiceAuction: ['1NT', 'Pass', '3NT'],
    requiredSystem: { oneNtOpening: "15-17" },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-15-17'] },
    ],
    expectedResponseCalls: [
      { call: '3NT', ruleIds: ['respond-to-1nt-w/-3nt-10-15-balanced'] },
    ],
    rejectedResponseCalls: ['4NT'],
    north: { S: 'AK7', H: 'K9762', D: 'KT2', C: 'A3' },
    south: { S: 'QT2', H: 'AJ8', D: 'AJ85', C: 'QJT' },
    east: { S: 'J9864', H: 'Q5', D: '96', C: 'K874' },
    west: { S: '53', H: 'T43', D: 'Q743', C: '9652' },
  },
  {
    description: '1NT, 16-18: balanced 17 HCP bids 6NT directly under the adjusted small-slam range.',
    practiceAuction: ['1NT', 'Pass', '6NT'],
    requiredSystem: { oneNtOpening: "16-18" },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-16-18'] },
    ],
    expectedResponseCalls: [
      { call: '6NT', ruleIds: ['respond-to-1nt-w/-6nt-18-19-balanced'] },
    ],
    rejectedResponseCalls: ['4NT'],
    north: { S: 'AK9', H: 'A986', D: 'KQ8', C: 'T43' },
    south: { S: 'Q63', H: 'KQ5', D: 'AJ65', C: 'AJ6' },
    east: { S: 'J54', H: 'JT72', D: '94', C: 'KQ97' },
    west: { S: 'T872', H: '43', D: 'T732', C: '852' },
  },
  {
    description: '1NT, 16-18: 15 HCP with six hearts bids direct 3H for slam interest; Jacoby and Texas yield.',
    practiceAuction: ['1NT', 'Pass', '3H'],
    requiredSystem: { oneNtOpening: "16-18", jacobyTransfers: true, texasTransfers: true },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-16-18'] },
    ],
    expectedResponseCalls: [
      { call: '3H', ruleIds: ['respond-to-1nt-w/-3h-3s-slam-interest'] },
    ],
    rejectedResponseCalls: ['2D', '4D'],
    north: { S: 'AK63', H: '63', D: 'AQ65', C: 'K52' },
    south: { S: 'QT8', H: 'AKQJT8', D: 'T8', C: 'QJ' },
    east: { S: 'J92', H: '754', D: '742', C: 'AT64' },
    west: { S: '754', H: '92', D: 'KJ93', C: '9873' },
  },
  {
    description: 'The same six-heart, 15-HCP hand over 15-17 takes the Texas game route instead of direct 3H.',
    practiceAuction: ['1NT', 'Pass', '4D'],
    requiredSystem: { oneNtOpening: "15-17", jacobyTransfers: true, texasTransfers: true },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-15-17'] },
    ],
    expectedResponseCalls: [
      { call: '4D', ruleIds: ['respond-to-1nt-w/-texas-transfer-to-hearts'] },
    ],
    rejectedResponseCalls: ['2D', '3H'],
    north: { S: 'AK63', H: '63', D: 'AQ65', C: 'K52' },
    south: { S: 'QT8', H: 'AKQJT8', D: 'T8', C: 'QJ' },
    east: { S: 'J92', H: '754', D: '742', C: 'AT64' },
    west: { S: '754', H: '92', D: 'KJ93', C: '9873' },
  },
  {
    description: 'After 1NT-(DONT 2H showing both majors), a good long club suit ' +
                 'with 10+ HCP permits a natural 3C response.',
    practiceAuction: ['1NT', '2H', '3C'],
    expectedOvercallCalls: [{ call: '2H', ruleIds: ['overcall-dont-majors'] }],
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-15-17'] },
    ],
    expectedResponseCalls: [
      { call: '3C', ruleIds: ['respond-after-dont-majors-natural-minor'] },
    ],
    rejectedResponseCalls: ['2NT'],
    north: { S: 'A62', H: 'K53', D: 'AQ4', C: 'A853' },
    east: { S: 'J874', H: 'AQJT9', D: 'JT9', C: '2' },
    south: { S: 'QT5', H: '72', D: 'K3', C: 'KQT974' },
    west: { S: 'K93', H: '864', D: '87652', C: 'J6' },
  },
  {
    description: 'After 1NT-(DONT 2H), 3D is a natural good five-card minor; ' +
                 "2S is a bid of an opponent's suit, not a natural spade response.",
    practiceAuction: ['1NT', '2H', '3D'],
    expectedOvercallCalls: [{ call: '2H', ruleIds: ['overcall-dont-majors'] }],
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-15-17'] },
    ],
    expectedResponseCalls: [
      { call: '3D', ruleIds: ['respond-after-dont-majors-natural-minor'] },
    ],
    north: { S: 'A853', H: 'K53', D: 'A62', C: 'AQ4' },
    east: { S: 'QJT9', H: 'AQJT8', D: '4', C: '985' },
    south: { S: 'K64', H: '94', D: 'KQJT8', C: 'J76' },
    west: { S: '72', H: '762', D: '9753', C: 'KT32' },
  },
];

//// Responses to 2NT openings
/// Selected 2NT-response deals also assert the ordinary 20-21 HCP balanced opening.  Conventional
/// deals declare their required settings; the same hand is reused where a deliberately changed
/// agreement produces a different response.
///
export const RESPONSE_AFTER_2NT_OPENING_TEST_DEALS: RuleTestDeal[] = [
  {
    description: '2NT: a balanced 3-HCP responder signs off with Pass; 3NT needs at least 4 ' +
                 'HCP.',
    practiceAuction: ['2NT', 'Pass', 'Pass'],
    expectedOpeningCalls: [
      { call: '2NT', ruleIds: ['open-2nt-balanced-20-21'] },
    ],
    expectedResponseCalls: [
      { call: 'Pass', ruleIds: ['respond-to-2nt-w/-pass-0-3'] },
    ],
    rejectedResponseCalls: ['3NT'],
    north: { S: 'AK4', H: 'AQ2', D: 'KJ', C: 'QJ753' },
    south: { S: 'QJ2', H: 'T93', D: '943', C: 'T642' },
    east: { S: '9765', H: 'K86', D: 'A87', C: 'AK9' },
    west: { S: 'T83', H: 'J754', D: 'QT652', C: '8' },
  },
  {
    description: '2NT: 0 HCP and six clubs with no useful major-suit convention still permit ' +
                 'Pass; balanced shape is not required.',
    practiceAuction: ['2NT', 'Pass', 'Pass'],
    expectedOpeningCalls: [
      { call: '2NT', ruleIds: ['open-2nt-balanced-20-21'] },
    ],
    expectedResponseCalls: [
      { call: 'Pass', ruleIds: ['respond-to-2nt-w/-pass-0-3'] },
    ],
    rejectedResponseCalls: ['3NT'],
    rejectedOpeningCalls: ['1C', '1D'],
    north: { S: 'AQ43', H: 'KQJ2', D: 'AK3', C: 'Q9' },
    south: { S: '75', H: '76', D: '986', C: 'T65432' },
    east: { S: 'T962', H: '954', D: 'JT42', C: 'A8' },
    west: { S: 'KJ8', H: 'AT83', D: 'Q75', C: 'KJ7' },
  },
  {
    description: '2NT: the same 0-HCP six-heart hand may Pass with Jacoby and Texas off; no ' +
                 'forcing natural 3H qualifies.',
    practiceAuction: ['2NT', 'Pass', 'Pass'],
    requiredSystem: { jacobyTransfers: false, texasTransfers: false },
    expectedOpeningCalls: [
      { call: '2NT', ruleIds: ['open-2nt-balanced-20-21'] },
    ],
    expectedResponseCalls: [
      { call: 'Pass', ruleIds: ['respond-to-2nt-w/-pass-0-3'] },
    ],
    rejectedResponseCalls: ['3H'],
    north: { S: 'AK3', H: 'AQ2', D: 'KJ4', C: 'QJ76' },
    south: { S: '85', H: 'T87543', D: '532', C: '92' },
    east: { S: 'QJ92', H: '96', D: 'A7', C: 'AK543' },
    west: { S: 'T764', H: 'KJ', D: 'QT986', C: 'T8' },
  },
  {
    description: '2NT: with six hearts and four spades, use Stayman first rather than a heart ' +
                 'transfer; look for the possible spade fit.',
    practiceAuction: ['2NT', 'Pass', '3C'],
    requiredSystem: { stayman: true, jacobyTransfers: true },
    expectedOpeningCalls: [
      { call: '2NT', ruleIds: ['open-2nt-balanced-20-21'] },
    ],
    expectedResponseCalls: [
      { call: '3C', ruleIds: ['respond-to-2nt-w/-stayman'] },
    ],
    rejectedResponseCalls: ['3D'],
    north: { S: 'AQ43', H: 'KQJ2', D: 'AK3', C: 'Q9' },
    south: { S: 'J765', H: '987643', D: 'QJ', C: 'K' },
    east: { S: 'T98', H: 'A', D: '8742', C: 'A8532' },
    west: { S: 'K2', H: 'T5', D: 'T965', C: 'JT764' },
  },
  {
    description: '2NT: with 3 HCP and two five-card majors, both Jacoby transfers remain ' +
                 'available; the weak Pass fallback disappears.',
    practiceAuction: ['2NT', 'Pass', '3D'],
    requiredSystem: { jacobyTransfers: true },
    expectedOpeningCalls: [
      { call: '2NT', ruleIds: ['open-2nt-balanced-20-21'] },
    ],
    expectedResponseCalls: [
      { call: '3D', ruleIds: ['respond-to-2nt-w/-transfer-to-hearts'] },
      { call: '3H', ruleIds: ['respond-to-2nt-w/-transfer-to-spades'] },
    ],
    rejectedResponseCalls: ['Pass'],
    north: { S: 'AK3', H: 'AQ2', D: 'KJ4', C: 'QJ76' },
    south: { S: 'QJT86', H: 'T9763', D: 'T9', C: 'T' },
    east: { S: '542', H: 'J4', D: 'Q863', C: 'K985' },
    west: { S: '97', H: 'K85', D: 'A752', C: 'A432' },
  },
  {
    description: '2NT: with 4 HCP and two five-card majors, transfer to hearts with 3D first; ' +
                 'the 3H spade transfer is removed.',
    practiceAuction: ['2NT', 'Pass', '3D'],
    requiredSystem: { jacobyTransfers: true },
    expectedOpeningCalls: [
      { call: '2NT', ruleIds: ['open-2nt-balanced-20-21'] },
    ],
    expectedResponseCalls: [
      { call: '3D', ruleIds: ['respond-to-2nt-w/-transfer-to-hearts'] },
    ],
    rejectedResponseCalls: ['3H'],
    north: { S: 'AK3', H: 'AQ2', D: 'KJ4', C: 'QJ76' },
    south: { S: 'T9754', H: 'J8654', D: '83', C: 'K' },
    east: { S: 'J62', H: 'K93', D: 'AT76', C: '982' },
    west: { S: 'Q8', H: 'T7', D: 'Q952', C: 'AT543' },
  },
  {
    description: '2NT: the same six-heart hand bids natural 4H for game when Texas is off; the ' +
                 'slower Jacoby route is suppressed.',
    practiceAuction: ['2NT', 'Pass', '4H'],
    requiredSystem: { jacobyTransfers: true, texasTransfers: false },
    expectedOpeningCalls: [
      { call: '2NT', ruleIds: ['open-2nt-balanced-20-21'] },
    ],
    expectedResponseCalls: [
      { call: '4H', ruleIds: ['respond-to-2nt-w/-4h-4s-natural-game'] },
    ],
    rejectedResponseCalls: ['3D'],
    north: { S: 'AK4', H: 'AQ2', D: 'KJ', C: 'QJ753' },
    south: { S: 'Q9', H: 'J98643', D: 'Q63', C: '64' },
    east: { S: 'T73', H: '7', D: 'A9542', C: 'AT98' },
    west: { S: 'J8652', H: 'KT5', D: 'T87', C: 'K2' },
  },
  {
    description: '2NT: with 10 HCP and six hearts, Texas 4D still places the game without ' +
                 'advertising slam interest.',
    practiceAuction: ['2NT', 'Pass', '4D'],
    requiredSystem: { jacobyTransfers: true, texasTransfers: true },
    expectedOpeningCalls: [
      { call: '2NT', ruleIds: ['open-2nt-balanced-20-21'] },
    ],
    expectedResponseCalls: [
      { call: '4D', ruleIds: ['respond-to-2nt-w/-texas-transfer-to-hearts'] },
    ],
    rejectedResponseCalls: ['3D'],
    north: { S: 'AK3', H: 'AQ2', D: 'KJ4', C: 'QJ76' },
    south: { S: 'QT', H: 'KJT984', D: '532', C: 'A3' },
    east: { S: 'J8742', H: '6', D: '76', C: 'KT984' },
    west: { S: '965', H: '753', D: 'AQT98', C: '52' },
  },
  {
    description: '2NT: with 11 HCP and six hearts, start with Jacoby 3D to preserve ' +
                 'slam-bidding room; Texas 4D is unavailable.',
    practiceAuction: ['2NT', 'Pass', '3D'],
    requiredSystem: { jacobyTransfers: true, texasTransfers: true },
    expectedOpeningCalls: [
      { call: '2NT', ruleIds: ['open-2nt-balanced-20-21'] },
    ],
    expectedResponseCalls: [
      { call: '3D', ruleIds: ['respond-to-2nt-w/-transfer-to-hearts'] },
    ],
    rejectedResponseCalls: ['4D'],
    north: { S: 'AK3', H: 'AQ2', D: 'KJ4', C: 'QJ76' },
    south: { S: 'Q4', H: 'KT9875', D: 'Q62', C: 'A5' },
    east: { S: 'J8762', H: 'J3', D: 'AT3', C: 'KT8' },
    west: { S: 'T95', H: '64', D: '9875', C: '9432' },
  },
  {
    description: '2NT: without Jacoby, a five-heart, 4-HCP unbalanced hand can bid natural ' +
                 'forcing 3H; do not confuse it with an artificial transfer.',
    practiceAuction: ['2NT', 'Pass', '3H'],
    requiredSystem: { jacobyTransfers: false, texasTransfers: false },
    expectedOpeningCalls: [
      { call: '2NT', ruleIds: ['open-2nt-balanced-20-21'] },
    ],
    expectedResponseCalls: [
      { call: '3H', ruleIds: ['respond-to-2nt-w/-3h-3s-natural-forcing'] },
    ],
    north: { S: 'AK3', H: 'AQ2', D: 'KJ4', C: 'QJ76' },
    south: { S: 'J5', H: 'KT986', D: 'T732', C: '54' },
    east: { S: 'Q972', H: '7', D: 'A85', C: 'AT982' },
    west: { S: 'T864', H: 'J543', D: 'Q96', C: 'K3' },
  },
];

///
//// Responses and opener rebids after the artificial strong 2C opening
///

export const RESPONSE_TO_STRONG_2C_TEST_DEALS: RuleTestDeal[] = [
  {
    description: '2C-2D-2NT: a 23-HCP 4-3-3-3 opener uses the artificial waiting response to ' +
                 'show the 22-24 balanced range.',
    practiceAuction: ['2C', 'Pass', '2D', 'Pass', '2NT'],
    expectedOpeningCalls: [
      { call: '2C', ruleIds: ['open-2c-strong-artificial'] },
    ],
    expectedResponseCalls: [
      { call: '2D', ruleIds: ['respond-to-2c-w/-2d-waiting'] },
    ],
    rejectedResponseCalls: ['Pass'],
    expectedOpenerRebidCalls: [
      { call: '2NT', ruleIds: ['opener-rebid-2nt-after-2c-2d'] },
    ],
    north: { S: 'AQJ4', H: 'AK3', D: 'KQ4', C: 'KJ3' },
    south: { S: '876', H: 'Q876', D: '8765', C: '76' },
    east: { S: 'KT532', H: '942', D: '2', C: 'QT95' },
    west: { S: '9', H: 'JT5', D: 'AJT93', C: 'A842' },
  },
  {
    description: "2C-2D-3NT: a 26-HCP balanced opener shows the source's 25-27 range directly, " +
                 'with no additional shape qualification beyond being balanced.',
    practiceAuction: ['2C', 'Pass', '2D', 'Pass', '3NT'],
    expectedOpeningCalls: [
      { call: '2C', ruleIds: ['open-2c-strong-artificial'] },
    ],
    expectedResponseCalls: [
      { call: '2D', ruleIds: ['respond-to-2c-w/-2d-waiting'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '3NT', ruleIds: ['opener-rebid-3nt-after-2c-2d'] },
    ],
    rejectedOpenerRebidCalls: ['2NT'],
    north: { S: 'AKQ4', H: 'AQ3', D: 'KQ4', C: 'AQ3' },
    south: { S: '876', H: 'K876', D: '8765', C: '76' },
    east: { S: '9532', H: 'J42', D: 'T2', C: 'JT52' },
    west: { S: 'JT', H: 'T95', D: 'AJ93', C: 'K984' },
  },
  {
    description: '2C-2D-4NT: a 29-HCP 4-3-3-3 opener uses the natural 28-30 balanced rebid; ' +
                 '4NT here is a strength-showing notrump rebid, not Blackwood.',
    practiceAuction: ['2C', 'Pass', '2D', 'Pass', '4NT'],
    expectedOpeningCalls: [
      { call: '2C', ruleIds: ['open-2c-strong-artificial'] },
    ],
    expectedResponseCalls: [
      { call: '2D', ruleIds: ['respond-to-2c-w/-2d-waiting'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '4NT', ruleIds: ['opener-rebid-4nt-after-2c-2d'] },
    ],
    rejectedOpenerRebidCalls: ['2NT', '3NT'],
    north: { S: 'AKQJ', H: 'AKQ', D: 'AKQ', C: 'J32' },
    south: { S: '876', H: 'J876', D: 'J876', C: 'Q7' },
    east: { S: '9542', H: '9542', D: 'T9', C: '986' },
    west: { S: 'T3', H: 'T3', D: '5432', C: 'AKT54' },
  },
  {
    description: '2C-2D-2S: a 23-HCP unbalanced opener with six spades shows the longest natural ' +
                 'five-card-or-longer suit at the cheapest level.',
    practiceAuction: ['2C', 'Pass', '2D', 'Pass', '2S'],
    expectedOpeningCalls: [
      { call: '2C', ruleIds: ['open-2c-strong-artificial'] },
    ],
    expectedResponseCalls: [
      { call: '2D', ruleIds: ['respond-to-2c-w/-2d-waiting'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '2S', ruleIds: ['opener-rebid-longest-suit-after-2c-2d'] },
    ],
    north: { S: 'AKQJ87', H: 'AK3', D: 'AQ3', C: '5' },
    south: { S: '954', H: 'Q876', D: '876', C: 'J76' },
    east: { S: '62', H: 'J92', D: 'KT94', C: 'AQ94' },
    west: { S: 'T3', H: 'T54', D: 'J52', C: 'KT832' },
  },
  {
    description: '2C-2D-3C: with six clubs and five spades, the unbalanced strong opener shows ' +
                 'the longer clubs even though 2S would be a cheaper bid.',
    practiceAuction: ['2C', 'Pass', '2D', 'Pass', '3C'],
    expectedOpeningCalls: [
      { call: '2C', ruleIds: ['open-2c-strong-artificial'] },
    ],
    expectedResponseCalls: [
      { call: '2D', ruleIds: ['respond-to-2c-w/-2d-waiting'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '3C', ruleIds: ['opener-rebid-longest-suit-after-2c-2d'] },
    ],
    rejectedOpenerRebidCalls: ['2S'],
    north: { S: 'AKQJ9', H: 'A', D: '5', C: 'AKQJ87' },
    south: { S: '876', H: 'Q876', D: 'K876', C: 'T5' },
    east: { S: 'T3', H: 'KJT43', D: 'AJT3', C: '92' },
    west: { S: '542', H: '952', D: 'Q942', C: '643' },
  },
  {
    description: '2C-2D-2S: with equal five-card spade and heart suits, the unbalanced strong ' +
                 'opener shows the higher-ranking spades first.',
    practiceAuction: ['2C', 'Pass', '2D', 'Pass', '2S'],
    expectedOpeningCalls: [
      { call: '2C', ruleIds: ['open-2c-strong-artificial'] },
    ],
    expectedResponseCalls: [
      { call: '2D', ruleIds: ['respond-to-2c-w/-2d-waiting'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '2S', ruleIds: ['opener-rebid-longest-suit-after-2c-2d'] },
    ],
    rejectedOpenerRebidCalls: ['2H'],
    north: { S: 'AKQJ8', H: 'AKQJ7', D: 'A2', C: '5' },
    south: { S: '976', H: '986', D: 'K876', C: 'Q76' },
    east: { S: 'T2', H: '542', D: 'JT3', C: 'AT942' },
    west: { S: '543', H: 'T3', D: 'Q954', C: 'KJ83' },
  },
  {
    description: '2C-2H: with 10 HCP and a good five-card heart suit, responder can make the ' +
                 'immediate positive response; the artificial 2D waiting bid remains available ' +
                 'but is presented behind the more descriptive call.',
    practiceAuction: ['2C', 'Pass', '2H', 'Pass', '3H'],
    expectedOpeningCalls: [
      { call: '2C', ruleIds: ['open-2c-strong-artificial'] },
    ],
    expectedResponseCalls: [
      { call: '2H', ruleIds: ['respond-to-2c-w/-positive-suit'] },
      { call: '2D', ruleIds: ['respond-to-2c-w/-2d-waiting'] },
    ],
    expectedResponseCallOrder: [['2H', '2D']],
    practiceGuidance: [{ auctionIndex: 4, seat: 'N', text: 'South showed five or more hearts ' +
      'and game-forcing values; North has three hearts, so 3H confirms an eight-card fit ' +
      'and leaves room to explore game or slam.' }],
    expectedOpenerRebidCalls: [{ call: '3H', ruleIds: ['opener-rebid-support-positive-major-after-2c'] }],
    rejectedOpenerRebidCalls: ['2NT'],
    north: { S: 'AQJ4', H: 'AK3', D: 'KQ4', C: 'KJ3' },
    south: { S: 'K765', H: 'QJT98', D: 'A75', C: '6' },
    east: { S: '932', H: '52', D: '9632', C: 'AQT7' },
    west: { S: 'T8', H: '764', D: 'JT8', C: '98542' },
  },
  {
    description: '2C-3C: 12 HCP and a good five-card club suit qualify for an immediate positive ' +
                 'minor response; the lower-ranked 2D waiting response also remains valid.',
    practiceAuction: ['2C', 'Pass', '3C', 'Pass', '3NT'],
    expectedOpeningCalls: [
      { call: '2C', ruleIds: ['open-2c-strong-artificial'] },
    ],
    expectedResponseCalls: [
      { call: '3C', ruleIds: ['respond-to-2c-w/-positive-suit'] },
      { call: '2D', ruleIds: ['respond-to-2c-w/-2d-waiting'] },
    ],
    expectedResponseCallOrder: [['3C', '2D']],
    expectedOpenerRebidCalls: [{ call: '3NT', ruleIds: ['opener-rebid-natural-nt-after-2c-positive'] }],
    rejectedOpenerRebidCalls: ['4C'],
    north: { S: 'AQJ4', H: 'AK3', D: 'KQ4', C: 'KJ3' },
    south: { S: '6', H: 'Q76', D: 'A765', C: 'AQT98' },
    east: { S: 'T73', H: 'J9542', D: '32', C: '754' },
    west: { S: 'K9852', H: 'T8', D: 'JT98', C: '62' },
  },
  {
    description: '2C-2NT: an 11-HCP 4-3-3-3 responder qualifies for the positive balanced ' +
                 'response with no extra requirement beyond 8+ HCP and balanced shape.',
    practiceAuction: ['2C', 'Pass', '2NT', 'Pass', '3NT'],
    expectedOpeningCalls: [
      { call: '2C', ruleIds: ['open-2c-strong-artificial'] },
    ],
    expectedResponseCalls: [
      { call: '2NT', ruleIds: ['respond-to-2c-w/-2nt-positive-balanced'] },
      { call: '2D', ruleIds: ['respond-to-2c-w/-2d-waiting'] },
    ],
    expectedResponseCallOrder: [['2NT', '2D']],
    expectedOpenerRebidCalls: [{ call: '3NT', ruleIds: ['opener-rebid-natural-nt-after-2c-positive'] }],
    north: { S: 'AQJ4', H: 'AK3', D: 'KQ4', C: 'KJ3' },
    south: { S: 'K765', H: 'Q76', D: 'A75', C: 'Q76' },
    east: { S: '8', H: 'JT9852', D: 'JT963', C: '8' },
    west: { S: 'T932', H: '4', D: '82', C: 'AT9542' },
  },
  {
    description: '2C-2H-2S: without heart support, the unbalanced opener describes a long spade ' +
                 'suit economically rather than inventing a notrump rebid.',
    practiceAuction: ['2C', 'Pass', '2H', 'Pass', '2S'],
    expectedOpeningCalls: [{ call: '2C', ruleIds: ['open-2c-strong-artificial'] }],
    expectedResponseCalls: [{ call: '2H', ruleIds: ['respond-to-2c-w/-positive-suit'] }],
    expectedOpenerRebidCalls: [{ call: '2S', ruleIds: ['opener-rebid-longest-suit-after-2c-positive'] }],
    rejectedOpenerRebidCalls: ['2NT', '3H'],
    north: { S: 'AKQJT8', H: '2', D: 'AK4', C: 'AQ7' },
    south: { S: '76', H: 'KQJ98', D: 'Q75', C: 'J42' },
    east: { S: '32', H: '753', D: 'T983', C: 'KT65' },
    west: { S: '954', H: 'AT64', D: 'J62', C: '983' },
  },
  {
    description: '2C-2H-2NT: 23 balanced HCP and only two hearts; describe the balanced hand ' +
                 'rather than raise responder\'s five-card major without a fit.',
    practiceAuction: ['2C', 'Pass', '2H', 'Pass', '2NT'],
    expectedOpeningCalls: [{ call: '2C', ruleIds: ['open-2c-strong-artificial'] }],
    expectedResponseCalls: [{ call: '2H', ruleIds: ['respond-to-2c-w/-positive-suit'] }],
    expectedOpenerRebidCalls: [{ call: '2NT', ruleIds: ['opener-rebid-natural-nt-after-2c-positive'] }],
    rejectedOpenerRebidCalls: ['3H'],
    north: { S: 'AKQ4', H: 'K3', D: 'AKJ2', C: 'QJT' },
    south: { S: '765', H: 'AQJT9', D: 'Q76', C: '92' },
    east: { S: 'J93', H: '752', D: 'T943', C: '853' },
    west: { S: 'T82', H: '864', D: '85', C: 'AK764' },
  },
  {
    description: '2C-3D-4D: an unbalanced opener with four diamonds and no long side suit ' +
                 'can agree responder\'s positive minor, intentionally bypassing 3NT.',
    practiceAuction: ['2C', 'Pass', '3D', 'Pass', '4D'],
    expectedOpeningCalls: [{ call: '2C', ruleIds: ['open-2c-strong-artificial'] }],
    expectedResponseCalls: [{ call: '3D', ruleIds: ['respond-to-2c-w/-positive-suit'] }],
    expectedOpenerRebidCalls: [{ call: '4D', ruleIds: ['opener-rebid-support-positive-minor-after-2c'] }],
    rejectedOpenerRebidCalls: ['3NT'],
    north: { S: 'AKQ4', H: 'AKJ7', D: 'AQ76', C: '5' },
    south: { S: '976', H: 'QT9', D: 'KJT98', C: 'K6' },
    east: { S: 'JT5', H: '863', D: '3', C: 'AQT983' },
    west: { S: '832', H: '542', D: '542', C: 'J742' },
  },
  {
    description: '2C-2NT-3S: a positive balanced response does not prevent an unbalanced ' +
                 'opener from showing a six-card spade suit.',
    practiceAuction: ['2C', 'Pass', '2NT', 'Pass', '3S'],
    expectedOpeningCalls: [{ call: '2C', ruleIds: ['open-2c-strong-artificial'] }],
    expectedResponseCalls: [{ call: '2NT', ruleIds: ['respond-to-2c-w/-2nt-positive-balanced'] }],
    expectedOpenerRebidCalls: [{ call: '3S', ruleIds: ['opener-rebid-longest-suit-after-2c-positive'] }],
    rejectedOpenerRebidCalls: ['3NT'],
    north: { S: 'AKQJT8', H: '2', D: 'AK4', C: 'AQ7' },
    south: { S: '765', H: 'K97', D: 'Q98', C: 'KJ92' },
    east: { S: '432', H: 'AQJT', D: 'JT7', C: 'T86' },
    west: { S: '9', H: '86543', D: '6532', C: '543' },
  },
  {
    description: '2C-2D: a 10-HCP 4-4-4-1 responder has enough strength for a positive response ' +
                 'but is neither balanced nor equipped with a good 5+ suit, so the waiting bid is ' +
                 'the modeled descriptive route.',
    practiceAuction: ['2C', 'Pass', '2D'],
    expectedOpeningCalls: [
      { call: '2C', ruleIds: ['open-2c-strong-artificial'] },
    ],
    expectedResponseCalls: [
      { call: '2D', ruleIds: ['respond-to-2c-w/-2d-waiting'] },
    ],
    rejectedResponseCalls: ['2H', '2S', '2NT', '3C', '3D'],
    north: { S: 'AQJ4', H: 'AK3', D: 'KQ4', C: 'KJ3' },
    south: { S: 'K765', H: 'QJ76', D: 'A765', C: '6' },
    east: { S: 'T983', H: 'T82', D: '832', C: 'AQ9' },
    west: { S: '2', H: '954', D: 'JT9', C: 'T87542' },
  },
];

//// Responses to weak-two and three-level preempt openings
/// Responses to weak preemptive openings
///
/// One compact bucket covers the preempt opening, responder's action, and the opener rebid when the
/// response is forcing.  Playing-trick-only game placement remains guidance rather than a fake HCP
/// calculation.
///
export const RESPONSE_TO_WEAK_PREEMPT_TEST_DEALS: RuleTestDeal[] = [
  {
    description: '2H-Pass: a good six-card 6-HCP heart suit qualifies for the weak two; responder ' +
                 'has only two hearts and Guideline of 17 = 7, so Pass is the modeled action.',
    practiceAuction: ['2H', 'Pass', 'Pass'],
    expectedOpeningCalls: [
      { call: '2H', ruleIds: ['open-weak-two'] },
    ],
    expectedResponseCalls: [
      { call: 'Pass', ruleIds: ['respond-to-weak-two-w/-pass'] },
    ],
    rejectedResponseCalls: ['3H', '2NT'],
    north: { S: '852', H: 'KQJ987', D: '73', C: 'T5' },
    south: { S: 'A73', H: '42', D: 'J864', C: '9764' },
    east: { S: 'QJT9', H: 'T65', D: 'A92', C: 'K32' },
    west: { S: 'K64', H: 'A3', D: 'KQT5', C: 'AQJ8' },
  },
  {
    description: '2S-3S: exactly three spades give nine combined trumps; with Guideline of 17 ' +
                 'well below 17, responder furthers the preempt one level rather than inviting game.',
    practiceAuction: ['2S', 'Pass', '3S'],
    expectedOpeningCalls: [
      { call: '2S', ruleIds: ['open-weak-two'] },
    ],
    expectedResponseCalls: [
      { call: '3S', ruleIds: ['respond-to-weak-two-w/-raise-to-three'] },
    ],
    rejectedResponseCalls: ['Pass', '2NT', '4S'],
    north: { S: 'KQJ987', H: '842', D: '73', C: 'T5' },
    south: { S: 'A43', H: 'Q76', D: '852', C: '9642' },
    east: { S: 'T65', H: 'KJ95', D: 'AJT', C: 'J87' },
    west: { S: '2', H: 'AT3', D: 'KQ964', C: 'AKQ3' },
  },
  {
    description: '2D-4D: four-card diamond support gives at least ten combined trumps, so responder ' +
                 'can further the preempt to the four level without treating the call as an invite.',
    practiceAuction: ['2D', 'Pass', '4D'],
    expectedOpeningCalls: [
      { call: '2D', ruleIds: ['open-weak-two'] },
    ],
    expectedResponseCalls: [
      { call: '4D', ruleIds: ['respond-to-weak-two-w/-raise-to-four'] },
    ],
    rejectedResponseCalls: ['Pass', '3D'],
    north: { S: '842', H: '73', D: 'KQJ987', C: 'T5' },
    south: { S: '765', H: 'Q86', D: 'A432', C: '964' },
    east: { S: 'KJ3', H: 'JT92', D: 'T5', C: 'KQ73' },
    west: { S: 'AQT9', H: 'AK54', D: '6', C: 'AJ82' },
  },
  {
    description: '2H-2NT-3H: responder reaches Guideline of 17 exactly; forcing 2NT asks for more ' +
                 'information, and the 7-HCP minimum opener repeats hearts at the three level.',
    practiceAuction: ['2H', 'Pass', '2NT', 'Pass', '3H'],
    expectedOpeningCalls: [
      { call: '2H', ruleIds: ['open-weak-two'] },
    ],
    expectedResponseCalls: [
      { call: '2NT', ruleIds: ['respond-to-weak-two-w/-2nt-inquiry'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '3H', ruleIds: ['opener-rebid-repeat-after-weak-two-2nt-inquiry'] },
    ],
    rejectedOpenerRebidCalls: ['3NT'],
    north: { S: '842', H: 'AQJ987', D: '73', C: '65' },
    south: { S: 'KQ5', H: 'K2', D: 'A64', C: 'QJ832' },
    east: { S: 'A973', H: 'T64', D: 'J852', C: 'K4' },
    west: { S: 'JT6', H: '53', D: 'KQT9', C: 'AT97' },
  },
  {
    description: '2S-2NT-3C: a 9-HCP maximum has the club king as a side feature; opener shows the ' +
                 'cheapest side ace-or-king feature rather than simply repeating spades.',
    practiceAuction: ['2S', 'Pass', '2NT', 'Pass', '3C'],
    expectedOpeningCalls: [
      { call: '2S', ruleIds: ['open-weak-two'] },
    ],
    expectedResponseCalls: [
      { call: '2NT', ruleIds: ['respond-to-weak-two-w/-2nt-inquiry'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '3C', ruleIds: ['opener-rebid-feature-after-weak-two-2nt-inquiry'] },
    ],
    rejectedOpenerRebidCalls: ['3S', '3NT'],
    north: { S: 'KQJ987', H: '842', D: '73', C: 'K5' },
    south: { S: 'A3', H: 'AK5', D: 'QJ64', C: 'QJ82' },
    east: { S: '64', H: 'J73', D: '982', C: 'AT976' },
    west: { S: 'T52', H: 'QT96', D: 'AKT5', C: '43' },
  },
  {
    description: '2D-2NT-3NT: the exceptional 10-HCP solid AKQJ98 diamond suit qualifies for ' +
                 'the weak two and the specific maximum-hand 3NT rebid; 1D also qualifies ' +
                 'under length-point valuation, so the opening is a judgment choice.',
    practiceAuction: ['2D', 'Pass', '2NT', 'Pass', '3NT'],
    practiceGuidance: [{ auctionIndex: 0, seat: 'N', text: 'AKQJ98 with no outside honors ' +
      'can be opened 2D to describe a solid, suit-oriented hand.  A one-level opening also ' +
      'qualifies on length points; this exercise is a judgment example, not a unique opening.' }],
    expectedOpeningCalls: [
      { call: '2D', ruleIds: ['open-weak-two'] },
    ],
    expectedResponseCalls: [
      { call: '2NT', ruleIds: ['respond-to-weak-two-w/-2nt-inquiry'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '3NT', ruleIds: ['opener-rebid-3nt-after-weak-two-2nt-inquiry'] },
    ],
    rejectedOpenerRebidCalls: ['3D'],
    north: { S: '842', H: '73', D: 'AKQJ98', C: '65' },
    south: { S: 'KQ5', H: 'AQ4', D: 'T2', C: 'KJ832' },
    east: { S: 'A73', H: 'T952', D: '64', C: 'QT97' },
    west: { S: 'JT96', H: 'KJ86', D: '753', C: 'A4' },
  },
  {
    description: '2D-2S-3S: responder has a good five-card spade suit and enough strength for ' +
                 'Guideline of 17; the natural new suit is forcing and opener raises with three.',
    practiceAuction: ['2D', 'Pass', '2S', 'Pass', '3S'],
    expectedOpeningCalls: [
      { call: '2D', ruleIds: ['open-weak-two'] },
    ],
    expectedResponseCalls: [
      { call: '2S', ruleIds: ['respond-to-weak-two-w/-new-suit-forcing'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '3S', ruleIds: ['opener-rebid-raise-after-preempt-new-suit'] },
    ],
    north: { S: 'T42', H: '83', D: 'KQJ987', C: '65' },
    south: { S: 'AKQJ9', H: 'A74', D: '2', C: 'QJ84' },
    east: { S: '853', H: 'T952', D: 'A3', C: 'A932' },
    west: { S: '76', H: 'KQJ6', D: 'T654', C: 'KT7' },
  },
  {
    description: '3H-Pass: a good seven-card heart suit with only 9 total points is a three-level ' +
                 'preempt, not a weak two; responder has two hearts and no modeled structural action.',
    practiceAuction: ['3H', 'Pass', 'Pass'],
    expectedOpeningCalls: [
      { call: '3H', ruleIds: ['open-weak-three'] },
    ],
    rejectedOpeningCalls: ['2H'],
    expectedResponseCalls: [
      { call: 'Pass', ruleIds: ['respond-to-three-level-preempt-w/-pass'] },
    ],
    north: { S: '842', H: 'KQJ9876', D: '73', C: '5' },
    south: { S: 'Q75', H: 'A2', D: 'A64', C: '98742' },
    east: { S: '96', H: 'T54', D: 'KJT98', C: 'AJ3' },
    west: { S: 'AKJT3', H: '3', D: 'Q52', C: 'KQT6' },
  },
  {
    description: '3S-4S: opener promises seven spades; responder has three-card support, producing ' +
                 'the ten-card fit used to further the preempt to the four level.',
    practiceAuction: ['3S', 'Pass', '4S'],
    expectedOpeningCalls: [
      { call: '3S', ruleIds: ['open-weak-three'] },
    ],
    expectedResponseCalls: [
      { call: '4S', ruleIds: ['respond-to-three-level-preempt-w/-raise-to-four'] },
    ],
    rejectedResponseCalls: ['Pass'],
    north: { S: 'KQJ9876', H: '842', D: '73', C: '5' },
    south: { S: 'A43', H: 'Q76', D: 'A52', C: '9642' },
    east: { S: '52', H: 'JT95', D: 'KT86', C: 'K73' },
    west: { S: 'T', H: 'AK3', D: 'QJ94', C: 'AQJT8' },
  },
  {
    description: '3H-3S-4H: a good five-card spade suit can be bid at the cheapest level below ' +
                 'game as a forcing response; without three spades opener returns to hearts.',
    practiceAuction: ['3H', 'Pass', '3S', 'Pass', '4H'],
    expectedOpeningCalls: [
      { call: '3H', ruleIds: ['open-weak-three'] },
    ],
    expectedResponseCalls: [
      { call: '3S', ruleIds: ['respond-to-three-level-preempt-w/-new-suit-forcing'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '4H', ruleIds: ['opener-rebid-repeat-after-preempt-new-suit'] },
    ],
    north: { S: '82', H: 'KQJ9876', D: '73', C: '65' },
    south: { S: 'AKQJ9', H: 'A2', D: 'A64', C: 'T84' },
    east: { S: '7643', H: '3', D: 'QT52', C: 'KQ92' },
    west: { S: 'T5', H: 'T54', D: 'KJ98', C: 'AJ73' },
  },
  {
    description: '4H-Pass: natural eight-card heart preempt. The trainer models the opening ' +
                 'but intentionally teaches no further high-level response system.',
    practiceAuction: ['4H', 'Pass', 'Pass'],
    expectedOpeningCalls: [
      { call: '4H', ruleIds: ['open-four-level-preempt'] },
    ],
    expectedResponseCalls: [
      { call: 'Pass', ruleIds: ['respond-to-high-level-preempt-w/-pass'] },
    ],
    north: { S: '43', H: 'KQJT9876', D: '42', C: '2' },
    south: { S: 'A72', H: '53', D: 'KQ65', C: 'J874' },
    east: { S: 'K965', H: 'A4', D: '973', C: 'KT96' },
    west: { S: 'QJT8', H: '2', D: 'AJT8', C: 'AQ53' },
  },
  {
    description: '5D-Pass: a good nine-card diamond suit is a rare five-level natural preempt. ' +
                 'Responder passes; further bidding is outside the chosen training depth.',
    practiceAuction: ['5D', 'Pass', 'Pass'],
    expectedOpeningCalls: [
      { call: '5D', ruleIds: ['open-five-level-minor-preempt'] },
    ],
    expectedResponseCalls: [
      { call: 'Pass', ruleIds: ['respond-to-high-level-preempt-w/-pass'] },
    ],
    north: { S: '2', H: '43', D: 'KQJT98765', C: '7' },
    south: { S: 'AK83', H: 'QJ76', D: '2', C: 'T964' },
    east: { S: 'QT6', H: 'KT952', D: '3', C: 'A532' },
    west: { S: 'J9754', H: 'A8', D: 'A4', C: 'KQJ8' },
  },
];
