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
  {
    description: '1NT–2H–2S: with two HCP, responder Passes the completed spade transfer.',
    practiceAuction: ['1NT', 'Pass', '2H', 'Pass', '2S', 'Pass', 'Pass'],
    requiredSystem: { oneNtOpening: '15-17', jacobyTransfers: true },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-15-17'] },
    ],
    expectedResponseCalls: [
      { call: '2H', ruleIds: ['respond-to-1nt-w/-transfer-to-spades'] },
    ],
    rejectedResponseCalls: ['Pass'],
    expectedOpenerRebidCalls: [
      { call: '2S', ruleIds: ['opener-rebid-complete-jacoby-after-nt'] },
    ],
    rejectedOpenerRebidCalls: ['Pass'],
    practiceGuidance: [{ auctionIndex: 6, seat: 'S', text: 'The 2H transfer asked opener to bid spades. With only two HCP, Pass the completion and play 2S.' }],
    expectedResponderRebidCalls: [{ call: 'Pass', ruleIds: ['responder-rebid-nt-transfer-pass-weak'] }],
    north: { S: 'AK8', H: 'AT2', D: 'K652', C: 'JT4' },
    south: { S: 'J7432', H: 'J94', D: 'T83', C: '75' },
    east: { S: '65', H: 'K876', D: 'Q74', C: 'AK93' },
    west: { S: 'QT9', H: 'Q53', D: 'AJ9', C: 'Q862' },
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
  {
    description: '1S–2S–2NT: opener makes a balanced game try with 18 HCP; six-support-point responder declines in 3S.',
    requiredSystem: { oneNtOpening: '15-17' },
    practiceAuction: ['1S', 'Pass', '2S', 'Pass', '2NT', 'Pass', '3S'],
    expectedOpeningCalls: [
      { call: '1S', ruleIds: ['open-five-card-major'] },
    ],
    expectedResponseCalls: [
      { call: '2S', ruleIds: ['respond-to-major-w/-support-simple-raise'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '2NT', ruleIds: ['opener-rebid-2nt-game-try-after-major-simple-raise'] },
      { call: '4S', ruleIds: ['opener-rebid-game-raise-after-major-simple-raise'] },
    ],
    expectedOpenerRebidCallOrder: [['2NT', '4S']],
    practiceGuidance: [{ auctionIndex: 6, seat: 'S', text: 'The balanced 2NT game try invited 4S, not 3NT. With six support points, decline by returning to 3S.' }],
    expectedResponderRebidCalls: [{ call: '3S', ruleIds: ['responder-rebid-decline-game-try-after-major-simple-raise'] }],
    north: { S: 'AQJ85', H: 'KJ4', D: 'A72', C: 'K8' },
    south: { S: 'K63', H: 'Q85', D: 'J64', C: 'T942' },
    east: { S: 'T42', H: 'AT2', D: '985', C: 'QJ63' },
    west: { S: '97', H: '7963', D: 'KQT3', C: 'A75' },
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
  {
    description: '2C–2D–2NT: a 23-HCP balanced opener rebid can be Passed by a two-HCP responder.',
    practiceAuction: ['2C', 'Pass', '2D', 'Pass', '2NT', 'Pass', 'Pass'],
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
    practiceGuidance: [{ auctionIndex: 6, seat: 'S', text: 'Opener shows 22–24 balanced HCP, but 2NT is not forcing. With two HCP, Pass is permitted.' }],
    expectedResponderRebidCalls: [{ call: 'Pass', ruleIds: ['responder-rebid-strong-2c-waiting-pass-2nt'] }],
    north: { S: 'AQJ4', H: 'AK3', D: 'KQ4', C: 'KJ3' },
    south: { S: '876', H: 'Q876', D: '8765', C: '76' },
    east: { S: 'KT532', H: '942', D: '2', C: 'QT95' },
    west: { S: '9', H: 'JT5', D: 'AJT93', C: 'A842' },
  },
  {
    description: '1H–2NT–4H: Jacoby 2NT forced to game; responder Passes opener\'s minimum fast-arrival 4H.',
    practiceAuction: ['1H', 'Pass', '2NT', 'Pass', '4H', 'Pass', 'Pass'],
    requiredSystem: { majorGameForceWithSupport: 'jacoby2NT' },
    expectedOpeningCalls: [
      { call: '1H', ruleIds: ['open-five-card-major'] },
    ],
    expectedResponseCalls: [
      { call: '2NT', ruleIds: ['respond-to-major-w/-support-jacoby-2nt-agreement'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '4H', ruleIds: ['opener-rebid-game-in-opening-major-after-major-jacoby-2nt'] },
    ],
    rejectedOpenerRebidCalls: ['3NT', '3H'],
    practiceGuidance: [{ auctionIndex: 6, seat: 'S', text: 'Jacoby 2NT forced to game. Opener has bid 4H, so the game force is satisfied and ordinary responder values can Pass.' }],
    expectedResponderRebidCalls: [{ call: 'Pass', ruleIds: ['responder-rebid-jacoby-2nt-pass-major-game'] }],
    north: { S: 'K74', H: 'AQJ85', D: 'Q72', C: '85' },
    south: { S: 'A83', H: 'K976', D: 'K64', C: 'QJ2' },
    east: { S: 'Q52', H: '4', D: 'A985', C: 'K9743' },
    west: { S: 'JT96', H: 'T32', D: 'JT3', C: 'AT6' },
  },
];

/// Selected responder game decisions after a splinter by either partner.
export const RESPONDER_AFTER_SPLINTERS_TEST_DEALS: RuleTestDeal[] = [
  {
    description: '1S–4D–4H: responder\'s diamond splinter and opener\'s heart control lead to 4S game.',
    practiceAuction: ['1S', 'Pass', '4D', 'Pass', '4H', 'Pass', '4S'],
    requiredSystem: { splinters: true },
    expectedOpeningCalls: [
      { call: '1S', ruleIds: ['open-five-card-major'] },
    ],
    expectedResponseCalls: [
      { call: '4D', ruleIds: ['respond-to-major-w/-support-splinter'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '4H', ruleIds: ['opener-rebid-control-after-major-splinter'] },
      { call: '4S', ruleIds: ['opener-rebid-game-in-opening-major-after-major-splinter'] },
    ],
    expectedOpenerRebidCallOrder: [['4H', '4S']],
    practiceGuidance: [{ auctionIndex: 6, seat: 'S', text: 'The diamond splinter already agreed spades and forced game. Opener\'s heart control is not a signoff; choose 4S with ordinary game-going values.' }],
    expectedResponderRebidCalls: [{ call: '4S', ruleIds: ['responder-rebid-splinter-major-game'] }],
    north: { S: 'AKJ85', H: 'A742', D: '85', C: 'K9' },
    south: { S: 'Q976', H: 'K83', D: '4', C: 'AQJ72' },
    east: { S: 'T4', H: '965', D: 'KQJT3', C: 'T63' },
    west: { S: '32', H: 'QJT', D: 'A9762', C: '854' },
  },
  {
    description: '1C–1H–4D: opener splinters with diamond shortness and heart support; responder chooses 4H.',
    practiceAuction: ['1C', 'Pass', '1H', 'Pass', '4D', 'Pass', '4H'],
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
    practiceGuidance: [{ auctionIndex: 6, seat: 'S', text: 'Opener\'s diamond shortness agrees hearts and forces game. With a minimum response, return to 4H; diamond honors may be wasted.' }],
    expectedResponderRebidCalls: [{ call: '4H', ruleIds: ['responder-rebid-game-after-opener-splinter'] }],
    north: { S: 'AQ2', H: 'AQ42', D: 'K', C: 'J8752' },
    south: { S: '83', H: 'KJ76', D: 'Q854', C: '963' },
    east: { S: 'K954', H: 'T5', D: 'T7632', C: 'A4' },
    west: { S: 'JT76', H: '983', D: 'AJ9', C: 'KQT' },
  },
];
