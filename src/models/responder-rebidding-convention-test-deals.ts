/// Selected responder decisions after Stayman and completed Jacoby transfers.
/// All four seats have fixed hands; these seven-call auctions complement the shorter
/// convention-introduction deals without forcing mechanical repetitions.
import type { RuleTestDeal } from './test-deals-registry';

export const RESPONDER_AFTER_NT_CONVENTIONS_TEST_DEALS: RuleTestDeal[] = [
  {
    description: 'After 1NT-2C-2H, nine HCP with four hearts invite at 3H; opener is minimum and may decline.',
    practiceAuction: ['1NT', 'Pass', '2C', 'Pass', '2H', 'Pass', '3H'],
    requiredSystem: { oneNtOpening: '15-17', stayman: true },
    north: { S: 'A73', H: 'KQJ6', D: 'K85', C: 'Q94' },
    south: { S: 'K84', H: 'A982', D: 'JT9', C: 'J75' },
    east: { S: 'T2', H: 'T73', D: 'AQ63', C: 'KT62' },
    west: { S: 'QJ965', H: '54', D: '742', C: 'A83' },
    practiceGuidance: [{ auctionIndex: 6, seat: 'S', text: 'Opener showed four hearts, giving us an eight-card fit. With 9 HCP, invite at 3H; opener decides whether to accept.' }],
    expectedResponderRebidCalls: [{ call: '3H', ruleIds: ['responder-rebid-1nt-stayman-invite-major'] }],
  },
  {
    description: 'After Stayman discovers four hearts opposite four, 11 HCP bid 4H rather than invite.',
    practiceAuction: ['1NT', 'Pass', '2C', 'Pass', '2H', 'Pass', '4H'],
    requiredSystem: { oneNtOpening: '15-17', stayman: true },
    north: { S: 'A73', H: 'KQJ6', D: 'K85', C: 'Q94' },
    south: { S: 'K84', H: 'A982', D: 'QJT', C: 'J75' },
    east: { S: 'T2', H: 'T73', D: 'A963', C: 'KT62' },
    west: { S: 'QJ965', H: '54', D: '742', C: 'A83' },
    practiceGuidance: [{ auctionIndex: 6, seat: 'S', text: 'Stayman found an eight-card heart fit. With 11 HCP opposite 15–17, place the contract in 4H rather than merely inviting.' }],
    expectedResponderRebidCalls: [{ call: '4H', ruleIds: ['responder-rebid-1nt-stayman-game-major'] }],
  },
  {
    description: 'Stayman finds no heart fit after opener shows spades; balanced 10 HCP choose 3NT.',
    practiceAuction: ['1NT', 'Pass', '2C', 'Pass', '2S', 'Pass', '3NT'],
    requiredSystem: { oneNtOpening: '15-17', stayman: true },
    north: { S: 'KQJ3', H: 'J4', D: 'K832', C: 'AQ6' },
    south: { S: 'A75', H: 'KQ76', D: 'J94', C: 'T83' },
    east: { S: '986', H: 'AT85', D: 'A7', C: 'J542' },
    west: { S: 'T42', H: '932', D: 'QT65', C: 'K97' },
    practiceGuidance: [{ auctionIndex: 6, seat: 'S', text: 'Opener showed spades, but responder has only three; with four hearts and no eight-card major fit, balanced game values suggest 3NT.' }],
    expectedResponderRebidCalls: [{ call: '3NT', ruleIds: ['responder-rebid-1nt-stayman-game-3nt'] }],
  },
  {
    description: 'With only five hearts and balanced nine HCP, transfer then invite 3NT with 2NT; opener has only two hearts.',
    practiceAuction: ['1NT', 'Pass', '2D', 'Pass', '2H', 'Pass', '2NT'],
    requiredSystem: { oneNtOpening: '15-17', jacobyTransfers: true },
    north: { S: 'AT42', H: 'AK', D: 'KJ4', C: '9764' },
    south: { S: 'Q83', H: 'QT975', D: 'Q53', C: 'K2' },
    east: { S: 'K765', H: '862', D: 'T8', C: 'QJ85' },
    west: { S: 'J9', H: 'J43', D: 'A9762', C: 'AT3' },
    practiceGuidance: [{ auctionIndex: 6, seat: 'S', text: 'Five hearts do not guarantee an eight-card fit. With balanced invitational strength, 2NT lets opener judge whether to play notrump or hearts.' }],
    expectedResponderRebidCalls: [{ call: '2NT', ruleIds: ['responder-rebid-1nt-transfer-invite-2nt'] }],
  },
  {
    description: 'With six hearts and eight HCP, transfer then invite at 3H instead of 2NT.',
    practiceAuction: ['1NT', 'Pass', '2D', 'Pass', '2H', 'Pass', '3H'],
    requiredSystem: { oneNtOpening: '15-17', jacobyTransfers: true },
    north: { S: 'AT42', H: 'AK', D: 'KJ4', C: '9764' },
    south: { S: 'Q8', H: 'QJT975', D: 'Q53', C: 'J2' },
    east: { S: 'K96', H: '642', D: 'T982', C: 'AT5' },
    west: { S: 'J753', H: '83', D: 'A76', C: 'KQ83' },
    practiceGuidance: [{ auctionIndex: 6, seat: 'S', text: 'Six hearts guarantee an eight-card fit opposite a balanced 1NT opener. Show invitational values in hearts, not 2NT.' }],
    expectedResponderRebidCalls: [{ call: '3H', ruleIds: ['responder-rebid-1nt-transfer-invite-major'] }],
  },
  {
    description: 'After a Jacoby transfer to hearts, balanced 11 HCP and only five hearts offer 3NT, letting opener choose the major with extra support.',
    practiceAuction: ['1NT', 'Pass', '2D', 'Pass', '2H', 'Pass', '3NT'],
    requiredSystem: { oneNtOpening: '15-17', jacobyTransfers: true },
    north: { S: 'AT42', H: 'AK', D: 'KJ4', C: '9764' },
    south: { S: 'Q83', H: 'QT975', D: 'Q53', C: 'KQ' },
    east: { S: 'K765', H: '862', D: 'T8', C: 'J852' },
    west: { S: 'J9', H: 'J43', D: 'A9762', C: 'AT3' },
    practiceGuidance: [{ auctionIndex: 6, seat: 'S', text: 'Responder has five hearts, not six, and balanced game-going values. Offer 3NT rather than insist on hearts; opener has only two hearts on this board.' }],
    expectedResponderRebidCalls: [{ call: '3NT', ruleIds: ['responder-rebid-nt-transfer-game-3nt'] }],
  },
];

export const RESPONDER_AFTER_MAJOR_GAME_TRY_TEST_DEALS: RuleTestDeal[] = [
  {
    description: 'After 1H-2H-2S, six support points without spade help decline by returning to 3H.',
    practiceAuction: ['1H', 'Pass', '2H', 'Pass', '2S', 'Pass', '3H'],
    north: { S: 'KQ74', H: 'AQJ85', D: 'A7', C: '85' },
    south: { S: 'T83', H: 'K63', D: 'J64', C: 'Q942' },
    east: { S: 'J2', H: 'T942', D: 'K53', C: 'AJ63' },
    west: { S: 'A965', H: '7', D: 'QT982', C: 'KT7' },
    practiceGuidance: [{ auctionIndex: 6, seat: 'S', text: 'Opener asked for help in spades. With only six support points and no working spade honors or shortness, return to 3H.' }],
    expectedResponderRebidCalls: [{ call: '3H', ruleIds: ['responder-rebid-decline-game-try-after-major-simple-raise'] }],
  },
  {
    description: 'After 1H-2H-2S, ten support points including the spade ace accept the help-suit invitation at 4H.',
    practiceAuction: ['1H', 'Pass', '2H', 'Pass', '2S', 'Pass', '4H'],
    north: { S: 'KQ74', H: 'AQJ85', D: 'A7', C: '85' },
    south: { S: 'A83', H: 'K63', D: 'J64', C: 'Q942' },
    east: { S: 'J2', H: 'T942', D: 'K53', C: 'AJ63' },
    west: { S: 'T965', H: '7', D: 'QT982', C: 'KT7' },
    practiceGuidance: [{ auctionIndex: 6, seat: 'S', text: 'The spade ace is useful opposite opener’s spade game try, and responder has ten support points. Accept with 4H.' }],
    expectedResponderRebidCalls: [{ call: '4H', ruleIds: ['responder-rebid-accept-game-try-after-major-simple-raise'] }],
  },
];

/// Continue established artificial sequences to responder's actual contract decision.
/// These complement, rather than replace, the shorter response/opener-rebid examples.
export const RESPONDER_AFTER_STRONG_2C_AND_JACOBY_2NT_TEST_DEALS: RuleTestDeal[] = [
  {
    description: '2C-2D-2NT: opener has 23 balanced HCP, and responder has a balanced six-count; choose 3NT rather than stop in 2NT.',
    practiceAuction: ['2C', 'Pass', '2D', 'Pass', '2NT', 'Pass', '3NT'],
    north: { S: 'AQJ4', H: 'AK3', D: 'KQ4', C: 'KJ3' },
    south: { S: '876', H: 'Q876', D: 'A765', C: '76' },
    east: { S: 'KT532', H: '942', D: '2', C: 'QT95' },
    west: { S: '9', H: 'JT5', D: '8JT93', C: 'A842' },
    practiceGuidance: [{ auctionIndex: 6, seat: 'S', text: 'The 2D waiting response did not deny useful values. With a balanced six-count opposite 22–24 HCP, bid 3NT; a very weak responder could instead Pass 2NT.' }],
    expectedResponderRebidCalls: [{ call: '3NT', ruleIds: ['responder-rebid-strong-2c-waiting-game-3nt'] }],
  },
  {
    description: 'After a Jacoby 2NT game-force raise, opener’s 3NT shows medium strength conventionally; return to the agreed spade game.',
    practiceAuction: ['1S', 'Pass', '2NT', 'Pass', '3NT', 'Pass', '4S'],
    requiredSystem: { majorGameForceWithSupport: 'jacoby2NT' },
    north: { S: 'AQJ85', H: 'K74', D: 'A72', C: '85' },
    south: { S: 'K964', H: 'AQ3', D: 'K83', C: 'J72' },
    east: { S: '32', H: 'T952', D: 'QT654', C: 'A4' },
    west: { S: 'T7', H: 'J86', D: 'J9', C: 'KQT963' },
    practiceGuidance: [{ auctionIndex: 6, seat: 'S', text: 'Jacoby 2NT agreed spades and forced game. Opener’s 3NT is an artificial medium-strength description, not a contract proposal. With an ordinary minimum game-force raise, bid 4S.' }],
    expectedResponderRebidCalls: [{ call: '4S', ruleIds: ['responder-rebid-jacoby-2nt-major-game'] }],
  },
];
