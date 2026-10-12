/// Selected natural responder rebids after a minimum balanced 1NT rebid.
import type { RuleTestDeal } from './test-deals-registry';

export const RESPONDER_REBID_AFTER_MINIMUM_1NT_TEST_DEALS: RuleTestDeal[] = [
  {
    description: 'After 1C-1H-1NT, weak balanced responder accepts notrump.',
    practiceAuction: ['1C', 'Pass', '1H', 'Pass', '1NT', 'Pass', 'Pass'],
    north: { S: 'AK2', H: 'Q42', D: 'K72', C: 'J852' },
    south: { S: '83', H: 'KJ76', D: 'Q854', C: '963' },
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
    expectedResponderRebidCalls: [{ call: '2H', ruleIds: [
      'responder-rebid-two-major-after-minimum-1nt',
    ] }],
    rejectedResponderRebidCalls: ['Pass', '3H'],
  },
  {
    description: 'Balanced 11 HCP invites notrump game after opener shows 12-14.',
    practiceAuction: ['1C', 'Pass', '1H', 'Pass', '1NT', 'Pass', '2NT'],
    north: { S: 'AK2', H: 'Q42', D: 'K72', C: 'J852' },
    south: { S: '963', H: 'AJT9', D: 'QJ3', C: 'K64' },
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
    expectedResponderRebidCalls: [{ call: '3S', ruleIds: [
      'responder-rebid-three-major-after-minimum-1nt',
    ] }],
    rejectedResponderRebidCalls: ['2S', '4S'],
  },
  {
    description: 'With balanced game strength, responder places the contract in 3NT.',
    practiceAuction: ['1C', 'Pass', '1H', 'Pass', '1NT', 'Pass', '3NT'],
    north: { S: 'AK2', H: 'Q42', D: 'K72', C: 'J852' },
    south: { S: 'Q63', H: 'AJT9', D: 'QJ3', C: 'K64' },
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
    north: { S: 'KQ3', H: 'A874', D: 'Q5', C: 'KJ73' },
    south: { S: 'J84', H: 'KQ62', D: 'T93', C: 'T84' },
    expectedResponderRebidCalls: [{ call: 'Pass', ruleIds: [
      'responder-rebid-pass-after-simple-major-raise',
    ] }],
    rejectedResponderRebidCalls: ['3H', '4H', '3S'],
  },
  {
    description: 'Responder with an established heart fit and invitational values bids 3H.',
    practiceAuction: ['1C', 'Pass', '1H', 'Pass', '2H', 'Pass', '3H'],
    north: { S: 'KQ3', H: 'A874', D: 'Q5', C: 'KJ73' },
    south: { S: 'A8', H: 'KQ62', D: 'JT93', C: '964' },
    expectedResponderRebidCalls: [{ call: '3H', ruleIds: [
      'responder-rebid-invite-after-simple-major-raise',
    ] }],
    rejectedResponderRebidCalls: ['Pass', '4H', '3S'],
  },
  {
    description: 'Game values and a confirmed heart fit justify 4H after a simple raise.',
    practiceAuction: ['1C', 'Pass', '1H', 'Pass', '2H', 'Pass', '4H'],
    north: { S: 'KQ3', H: 'A874', D: 'Q5', C: 'KJ73' },
    south: { S: 'A8', H: 'KQ62', D: 'AJ93', C: '964' },
    expectedResponderRebidCalls: [{ call: '4H', ruleIds: [
      'responder-rebid-game-after-simple-major-raise',
    ] }],
    rejectedResponderRebidCalls: ['Pass', '3H', '4S'],
  },
  {
    description: 'Minimum responder declines opener\'s 3S invitation.',
    practiceAuction: ['1C', 'Pass', '1S', 'Pass', '3S', 'Pass', 'Pass'],
    north: { S: 'AJ84', H: 'Q5', D: 'KJ3', C: 'AQ73' },
    south: { S: 'KQ62', H: 'T83', D: 'T82', C: 'J94' },
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
    expectedResponderRebidCalls: [{ call: 'Pass', ruleIds: [
      'responder-rebid-pass-after-game-major-raise',
    ] }],
    rejectedResponderRebidCalls: ['4S', '5H'],
  },
];
