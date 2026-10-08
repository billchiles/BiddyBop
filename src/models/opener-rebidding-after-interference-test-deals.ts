/// Opener rebidding after selected opponent interference test deals.
///
/// `import type` is erased by TypeScript when JavaScript is emitted. Although
/// test-deals-registry.ts imports these values, this type import creates no runtime cycle.
///
import type { RuleTestDeal } from './test-deals-registry';

/// These deals exercise selected opener continuations after interference: reviewed natural
/// responses, artificial competitive calls, and the first advancer-action families.  Advancer
/// competition is included only where opener's continuation has been explicitly modeled.
export const OPENER_REBID_AFTER_INTERFERENCE_TEST_DEALS: RuleTestDeal[] = [
  {
    description: '1C-(1D)-1H-(Pass)-1S: responder kept a natural forcing one-level meaning, so ' +
                 'opener can still show four spades economically.',
    practiceAuction: ['1C', '1D', '1H', 'Pass', '1S'],
    expectedOpeningCalls: [
      { call: '1C', ruleIds: ['open-convenient-minor'] },
    ],
    expectedOvercallCalls: [
      { call: '1D', ruleIds: ['overcall-simple-suit-at-one-level'] },
    ],
    expectedResponseCalls: [
      { call: '1H', ruleIds: ['respond-over-suit-new-suit-one-level'] },
    ],
    expectedAdvanceCalls: [
      { call: 'Pass', ruleIds: ['advance-suit-overcall-after-responder-natural-action-pass'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '1S', ruleIds: ['opener-rebid-second-suit-after-minor-one-level-new-suit'] },
    ],
    north: { S: 'AK64', H: '2', D: '963', C: 'KQ972' },
    east: { S: 'T2', H: 'KQ', D: 'AKQT872', C: 'J3' },
    south: { S: 'J873', H: 'AT96', D: '54', C: 'A84' },
    west: { S: 'Q95', H: 'J87543', D: 'J', C: 'T65' },
  },
  {
    description: '1H-(Double)-1S-(Pass)-1NT: the forcing natural one-level response keeps its ' +
                 'ordinary meaning, so a minimum balanced opener can still rebid 1NT.',
    dealer: 'W',
    practiceAuction: ['1H', 'Double', '1S', 'Pass', '1NT'],
    expectedOpeningCalls: [
      { call: '1H', ruleIds: ['open-five-card-major'] },
    ],
    expectedOvercallCalls: [
      { call: 'Double', ruleIds: ['overcall-takeout-double-with-unbid-suit-support'] },
    ],
    expectedResponseCalls: [
      { call: '1S', ruleIds: ['respond-after-double-new-suit-one-level'] },
    ],
    expectedAdvanceCalls: [
      { call: 'Pass', ruleIds: ['advance-takeout-double-after-responder-natural-action-pass'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '1NT', ruleIds: ['opener-rebid-1nt-after-major-one-level-new-suit'] },
    ],
    west: { S: 'K72', H: 'AKT96', D: 'Q53', C: '54' },
    north: { S: 'AQJ4', H: '2', D: 'K874', C: 'QJ86' },
    east: { S: 'T986', H: 'QJ5', D: 'AJ6', C: 'A73' },
    south: { S: '53', H: '8743', D: 'T92', C: 'KT92' },
  },
  {
    description: '1D-(1S)-Double-(Pass)-2H: minimum opener shows four hearts economically after ' +
                 'responder’s negative Double.',
    practiceAuction: ['1D', '1S', 'Double', 'Pass', '2H'],
    expectedOpeningCalls: [{ call: '1D', ruleIds: ['open-convenient-minor'] }],
    expectedOvercallCalls: [{ call: '1S', ruleIds: ['overcall-simple-suit-at-one-level'] }],
    expectedResponseCalls: [{ call: 'Double', ruleIds: ['respond-over-suit-negative-double'] }],
    expectedAdvanceCalls: [
      { call: 'Pass', ruleIds: ['advance-suit-overcall-after-negative-double-pass'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '2H', ruleIds: ['opener-rebid-major-after-negative-double-minimum'] },
    ],
    north: { S: '943', H: 'KQ84', D: 'AJ74', C: 'A8' },
    east: { S: 'AQJT86', H: '32', D: '5', C: 'KQJ6' },
    south: { S: '75', H: 'AJT6', D: 'Q93', C: 'T954' },
    west: { S: 'K2', H: '975', D: 'KT862', C: '732' },
  },
  {
    description: '1D-(1S)-Double-(Pass)-3H: medium opener jumps one level in responder’s implied ' +
                 'major after the negative Double.',
    practiceAuction: ['1D', '1S', 'Double', 'Pass', '3H'],
    expectedOpeningCalls: [{ call: '1D', ruleIds: ['open-convenient-minor'] }],
    expectedOvercallCalls: [{ call: '1S', ruleIds: ['overcall-simple-suit-at-one-level'] }],
    expectedResponseCalls: [{ call: 'Double', ruleIds: ['respond-over-suit-negative-double'] }],
    expectedAdvanceCalls: [
      { call: 'Pass', ruleIds: ['advance-suit-overcall-after-negative-double-pass'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '3H', ruleIds: ['opener-rebid-jump-major-after-negative-double-medium'] },
    ],
    north: { S: 'K43', H: 'AQJ8', D: 'A8742', C: '9' },
    east: { S: 'AQJT86', H: '32', D: '5', C: 'KQJ6' },
    south: { S: '75', H: 'KT76', D: 'Q93', C: 'AT54' },
    west: { S: '92', H: '954', D: 'KJT6', C: '8732' },
  },
  {
    description: '1D-(1S)-Double-(Pass)-4H: maximum opener bids game with the implied heart fit.',
    practiceAuction: ['1D', '1S', 'Double', 'Pass', '4H'],
    expectedOpeningCalls: [{ call: '1D', ruleIds: ['open-convenient-minor'] }],
    expectedOvercallCalls: [{ call: '1S', ruleIds: ['overcall-simple-suit-at-one-level'] }],
    expectedResponseCalls: [{ call: 'Double', ruleIds: ['respond-over-suit-negative-double'] }],
    expectedAdvanceCalls: [
      { call: 'Pass', ruleIds: ['advance-suit-overcall-after-negative-double-pass'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '4H', ruleIds: ['opener-rebid-game-major-after-negative-double-maximum'] },
    ],
    north: { S: 'K43', H: 'AKQ8', D: 'AK742', C: 'Q' },
    east: { S: 'AQJT86', H: '63', D: '5', C: 'KJ76' },
    south: { S: '75', H: 'JT75', D: 'Q93', C: 'AT54' },
    west: { S: '92', H: '942', D: 'JT86', C: '9832' },
  },
  {
    description: '1NT-(2H)-2NT-(Pass)-3NT: a maximum 1NT opener accepts responder’s natural ' +
                 'stopped invitation after interference.',
    practiceAuction: ['1NT', '2H', '2NT', 'Pass', '3NT'],
    expectedOpeningCalls: [{ call: '1NT', ruleIds: ['open-1nt-balanced-15-17'] }],
    expectedResponseCalls: [
      { call: '2NT', ruleIds: ['partner-of-1nt-after-interference-2nt'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '3NT', ruleIds: ['opener-rebid-3nt-after-1nt-2nt-invitation'] },
    ],
    north: { S: '762', H: 'AKQ', D: 'KJ4', C: 'A853' },
    south: { S: 'KQ4', H: 'JT98', D: 'Q52', C: '976' },
  },
  {
    description: '1NT-(2H)-3NT-(Pass)-Pass: responder’s natural game signoff keeps its ordinary ' +
                 'meaning after the selected interference.',
    practiceAuction: ['1NT', '2H', '3NT', 'Pass', 'Pass'],
    expectedOpeningCalls: [{ call: '1NT', ruleIds: ['open-1nt-balanced-15-17'] }],
    expectedResponseCalls: [
      { call: '3NT', ruleIds: ['partner-of-1nt-after-interference-3nt'] },
    ],
    expectedOpenerRebidCalls: [
      { call: 'Pass', ruleIds: ['opener-rebid-pass-after-nt-natural-nt-signoff'] },
    ],
    north: { S: '762', H: 'AKQ', D: 'KJ4', C: 'A853' },
    south: { S: 'KQ4', H: 'JT98', D: 'A52', C: '976' },
  },
  {
    description: '1H-(2D)-2H-(Pass)-Pass: the ordinary simple raise keeps its meaning after a ' +
                 'natural overcall, so a minimum opener can still stop at two hearts.',
    practiceAuction: ['1H', '2D', '2H', 'Pass', 'Pass'],
    expectedOpeningCalls: [{ call: '1H', ruleIds: ['open-five-card-major'] }],
    expectedOvercallCalls: [{ call: '2D', ruleIds: ['overcall-simple-suit-at-two-level'] }],
    expectedResponseCalls: [
      { call: '2H', ruleIds: ['respond-to-major-w/-support-simple-raise'] },
    ],
    expectedAdvanceCalls: [
      { call: 'Pass', ruleIds: ['advance-two-level-suit-overcall-after-responder-raise-pass'] },
    ],
    expectedOpenerRebidCalls: [
      { call: 'Pass', ruleIds: ['opener-rebid-pass-after-major-simple-raise'] },
    ],
    north: { S: 'K83', H: 'AQJ74', D: 'AT4', C: '95' },
    east: { S: 'AQT', H: '62', D: 'KQJ985', C: '73' },
    south: { S: 'J976', H: 'KT9', D: '763', C: 'A82' },
  },
  {
    description: '1H-(1S)-2C-(Pass)-2NT: responder’s competitive 2C is forcing one round but ' +
                 'not game forcing; a minimum balanced opener with a spade stopper rebids 2NT.',
    practiceAuction: ['1H', '1S', '2C', 'Pass', '2NT'],
    expectedOpeningCalls: [{ call: '1H', ruleIds: ['open-five-card-major'] }],
    expectedOvercallCalls: [{ call: '1S', ruleIds: ['overcall-simple-suit-at-one-level'] }],
    expectedResponseCalls: [
      { call: '2C', ruleIds: ['respond-over-suit-new-suit-two-level'] },
    ],
    expectedAdvanceCalls: [
      { call: 'Pass', ruleIds: ['advance-suit-overcall-after-responder-natural-action-pass'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '2NT', ruleIds: ['opener-rebid-2nt-after-overcall-two-level-new-suit'] },
    ],
    north: { S: 'K72', H: 'AKT94', D: 'QJ3', C: '83' },
    east: { S: 'AQJ86', H: '762', D: '8', C: 'K964' },
    south: { S: 'T9', H: 'QJ', D: 'AT97', C: 'AQJT5' },
  },
  {
    description: '1H-(Double)-2H-(Pass)-Pass: a simple raise keeps its ordinary 6-10 meaning ' +
                 'after a takeout Double, so a minimum opener may Pass.',
    practiceAuction: ['1H', 'Double', '2H', 'Pass', 'Pass'],
    expectedOpeningCalls: [{ call: '1H', ruleIds: ['open-five-card-major'] }],
    expectedOvercallCalls: [
      { call: 'Double', ruleIds: ['overcall-takeout-double-with-unbid-suit-support'] },
    ],
    expectedResponseCalls: [
      { call: '2H', ruleIds: ['respond-to-major-w/-support-simple-raise'] },
    ],
    expectedAdvanceCalls: [
      { call: 'Pass', ruleIds: ['advance-takeout-double-after-responder-raise-pass'] },
    ],
    expectedOpenerRebidCalls: [
      { call: 'Pass', ruleIds: ['opener-rebid-pass-after-major-simple-raise'] },
    ],
    north: { S: 'K72', H: 'AKT96', D: 'Q53', C: '54' },
    east: { S: 'AQJ4', H: '2', D: 'K874', C: 'QJ86' },
    south: { S: 'T986', H: 'QJ5', D: 'A96', C: '973' },
  },
  {
    description: '1H-(Double)-1NT-(Pass)-Pass: responder’s 1NT is natural and nonforcing, so ' +
                 'a minimum opener does not manufacture another bid.',
    practiceAuction: ['1H', 'Double', '1NT', 'Pass', 'Pass'],
    expectedOpeningCalls: [{ call: '1H', ruleIds: ['open-five-card-major'] }],
    expectedOvercallCalls: [
      { call: 'Double', ruleIds: ['overcall-takeout-double-with-unbid-suit-support'] },
    ],
    expectedResponseCalls: [
      { call: '1NT', ruleIds: ['respond-after-double-natural-1nt'] },
    ],
    expectedAdvanceCalls: [
      { call: 'Pass', ruleIds: ['advance-takeout-double-after-responder-natural-action-pass'] },
    ],
    expectedOpenerRebidCalls: [
      { call: 'Pass', ruleIds: ['opener-rebid-pass-after-double-natural-1nt-minimum'] },
    ],
    north: { S: 'K72', H: 'AKT96', D: 'Q53', C: '54' },
    east: { S: 'AQJ4', H: '2', D: 'K874', C: 'QJ86' },
    south: { S: 'T986', H: 'QJ5', D: 'A96', C: '973' },
  },
  {
    description: '1S-(2H)-2S-(3H)-Pass: after both sides find fits, a minimum opener can defend ' +
                 'rather than manufacture another spade bid.',
    dealer: 'W',
    practiceAuction: ['1S', '2H', '2S', '3H', 'Pass'],
    expectedOpeningCalls: [{ call: '1S', ruleIds: ['open-five-card-major'] }],
    expectedOvercallCalls: [{ call: '2H', ruleIds: ['overcall-simple-suit-at-two-level'] }],
    expectedResponseCalls: [
      { call: '2S', ruleIds: ['respond-to-major-w/-support-simple-raise'] },
    ],
    expectedAdvanceCalls: [
      { call: '3H', ruleIds: ['advance-two-level-suit-overcall-after-responder-raise-simple-raise'] },
    ],
    expectedOpenerRebidCalls: [
      { call: 'Pass', ruleIds: ['opener-rebid-pass-after-major-simple-raise'] },
    ],
    west: { S: 'AKJ74', H: 'K82', D: 'Q93', C: '65' },
    north: { S: 'Q3', H: 'AQJ965', D: 'K86', C: '72' },
    east: { S: '852', H: '3', D: 'T742', C: 'AKT84' },
    south: { S: 'T96', H: 'T74', D: 'AJ5', C: 'QJ93' },
  },
  {
    description: '1H-(Double)-2H-(2S)-Pass: advancer’s natural spade competition does not make ' +
                 'responder’s simple heart raise forcing.',
    dealer: 'W',
    practiceAuction: ['1H', 'Double', '2H', '2S', 'Pass'],
    expectedOpeningCalls: [{ call: '1H', ruleIds: ['open-five-card-major'] }],
    expectedOvercallCalls: [
      { call: 'Double', ruleIds: ['overcall-takeout-double-with-unbid-suit-support'] },
    ],
    expectedResponseCalls: [
      { call: '2H', ruleIds: ['respond-to-major-w/-support-simple-raise'] },
    ],
    expectedAdvanceCalls: [
      { call: '2S', ruleIds: ['advance-takeout-double-after-responder-raise-new-suit-two-level'] },
    ],
    expectedOpenerRebidCalls: [
      { call: 'Pass', ruleIds: ['opener-rebid-pass-after-major-simple-raise'] },
    ],
    west: { S: 'K72', H: 'AKT96', D: 'Q53', C: '54' },
    north: { S: 'A984', H: '2', D: 'KJ82', C: 'K976' },
    east: { S: '3', H: '87543', D: '764', C: 'AQJ2' },
    south: { S: 'QJT65', H: 'QJ', D: 'AT9', C: 'T83' },
  },
  {
    description: '1D-(1S)-Double-(2S)-Pass: after advancer raises, a minimum opener without a ' +
                 'clear continuation can Pass and leave responder another turn.',
    dealer: 'W',
    practiceAuction: ['1D', '1S', 'Double', '2S', 'Pass'],
    expectedOpeningCalls: [{ call: '1D', ruleIds: ['open-convenient-minor'] }],
    expectedOvercallCalls: [{ call: '1S', ruleIds: ['overcall-simple-suit-at-one-level'] }],
    expectedResponseCalls: [{ call: 'Double', ruleIds: ['respond-over-suit-negative-double'] }],
    expectedAdvanceCalls: [
      { call: '2S', ruleIds: ['advance-one-level-suit-overcall-after-negative-double-simple-raise'] },
    ],
    expectedOpenerRebidCalls: [
      { call: 'Pass', ruleIds: ['opener-rebid-pass-after-negative-double-advancer-raise-minimum'] },
    ],
    west: { S: 'A97', H: '87', D: 'QJ9865', C: 'K3' },
    north: { S: 'KQJ52', H: 'AJT96', D: 'A2', C: '7' },
    east: { S: '86', H: 'KQ42', D: '4', C: 'QJ9852' },
    south: { S: 'T43', H: '53', D: 'KT73', C: 'AT64' },
  },
  {
    description: '1D-(1S)-Double-(2S)-3H: medium opener keeps competing in responder’s implied ' +
                 'major, but the opponent raise has consumed the old jump step.',
    dealer: 'W',
    practiceAuction: ['1D', '1S', 'Double', '2S', '3H'],
    expectedOpeningCalls: [{ call: '1D', ruleIds: ['open-convenient-minor'] }],
    expectedOvercallCalls: [{ call: '1S', ruleIds: ['overcall-simple-suit-at-one-level'] }],
    expectedResponseCalls: [{ call: 'Double', ruleIds: ['respond-over-suit-negative-double'] }],
    expectedAdvanceCalls: [
      { call: '2S', ruleIds: ['advance-one-level-suit-overcall-after-negative-double-simple-raise'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '3H', ruleIds: ['opener-rebid-major-after-negative-double-advancer-raise-medium'] },
    ],
    rejectedOpenerRebidCalls: ['4H'],
    west: { S: 'Q4', H: 'AK25', D: 'AQJT8', C: '52' },
    north: { S: 'KJT63', H: '84', D: '542', C: 'AK8' },
    east: { S: 'A87', H: 'T763', D: 'K6', C: 'T964' },
    south: { S: '925', H: 'QJ9', D: '973', C: 'QJ73' },
  },
  {
    description: '1D-(1S)-Double-(2S)-4H: maximum opener still drives to game after advancer ' +
                 'raises the overcall.',
    dealer: 'W',
    practiceAuction: ['1D', '1S', 'Double', '2S', '4H'],
    expectedOpeningCalls: [{ call: '1D', ruleIds: ['open-convenient-minor'] }],
    expectedOvercallCalls: [{ call: '1S', ruleIds: ['overcall-simple-suit-at-one-level'] }],
    expectedResponseCalls: [{ call: 'Double', ruleIds: ['respond-over-suit-negative-double'] }],
    expectedAdvanceCalls: [
      { call: '2S', ruleIds: ['advance-one-level-suit-overcall-after-negative-double-simple-raise'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '4H', ruleIds: ['opener-rebid-game-major-after-negative-double-maximum'] },
    ],
    rejectedOpenerRebidCalls: ['3H'],
    west: { S: 'Q4', H: 'AK25', D: 'AQJT86', C: '2' },
    north: { S: 'KJT63', H: '84', D: '542', C: 'AK8' },
    east: { S: 'A87', H: 'T763', D: 'K', C: 'T9654' },
    south: { S: '925', H: 'QJ9', D: '973', C: 'QJ73' },
  },
];
