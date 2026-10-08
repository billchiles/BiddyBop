/// Opener rebidding nt test deals, kept separate from the bucket registry.
///
/// This file's deals exercise sequences of opening, responding, and opener-rebidding decisions
/// together.  Grouping these longer sequences under opener rebids lets users practice the auction
/// across multiple participating seats rather than practicing each bid in isolation.
///

/// `import type` is erased by TypeScript when JavaScript is emitted. Although
/// test-deals-registry.ts imports these values, this type import creates no runtime cycle.
///
import type { RuleTestDeal } from './test-deals-registry';


export const OPENER_REBID_AFTER_1NT_OPENING_TEST_DEALS: RuleTestDeal[] = [
  {
    description: '1NT, 15-17 opener: 10-HCP balanced responder bids 3NT directly rather than inviting.',
    practiceAuction: ['1NT', 'Pass', '3NT', 'Pass', 'Pass'],
    requiredSystem: { oneNtOpening: '15-17' },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-15-17'] },
    ],
    expectedResponseCalls: [
      { call: '3NT', ruleIds: ['respond-to-1nt-w/-3nt-10-15-balanced'] },
    ],
    rejectedResponseCalls: ['2NT'],
    expectedOpenerRebidCalls: [
      { call: 'Pass', ruleIds: ['opener-rebid-pass-after-nt-natural-nt-signoff'] },
    ],
    north: { S: 'A532', H: 'KJ92', D: 'A7', C: 'QJT' },
    south: { S: 'Q7', H: 'Q64', D: 'QJ4', C: 'K8432' },
  },
  {
    description: '1NT: 12-HCP responder with four hearts asks for a four-card major using Stayman 2C.',
    practiceAuction: ['1NT', 'Pass', '2C', 'Pass', '2S'],
    requiredSystem: { oneNtOpening: '15-17', stayman: true },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-15-17'] },
    ],
    expectedResponseCalls: [
      { call: '2C', ruleIds: ['respond-to-1nt-w/-stayman'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '2S', ruleIds: ['opener-rebid-show-spades-after-nt-stayman'] },
    ],
    rejectedOpenerRebidCalls: ['2D', '2H'],
    north: { S: 'KQJ3', H: 'J4', D: 'K832', C: 'AQ6' },
    south: { S: 'AT5', H: 'AK76', D: '9', C: 'JT543' },
  },
  {
    description: '1NT: 8-HCP responder with five hearts and four spades uses Stayman 2C before a Jacoby transfer; both majors need exploration.',
    practiceAuction: ['1NT', 'Pass', '2C', 'Pass', '2H'],
    requiredSystem: { oneNtOpening: '15-17', stayman: true, jacobyTransfers: true },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-15-17'] },
    ],
    expectedResponseCalls: [
      { call: '2C', ruleIds: ['respond-to-1nt-w/-stayman'] },
    ],
    rejectedResponseCalls: ['2D', '2H'],
    expectedOpenerRebidCalls: [
      { call: '2H', ruleIds: ['opener-rebid-show-hearts-after-nt-stayman'] },
    ],
    rejectedOpenerRebidCalls: ['2D', '2S'],
    north: { S: 'AQJ3', H: 'JT65', D: 'AK', C: 'Q73' },
    south: { S: 'KT74', H: 'K9742', D: 'Q94', C: 'T' },
  },
  {
    description: '1NT: 6-HCP responder with five hearts transfers with 2D rather than passing 1NT.',
    practiceAuction: ['1NT', 'Pass', '2D', 'Pass', '2H'],
    requiredSystem: { oneNtOpening: '15-17', jacobyTransfers: true },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-15-17'] },
    ],
    expectedResponseCalls: [
      { call: '2D', ruleIds: ['respond-to-1nt-w/-transfer-to-hearts'] },
    ],
    rejectedResponseCalls: ['Pass'],
    expectedOpenerRebidCalls: [
      { call: '2H', ruleIds: ['opener-rebid-complete-jacoby-after-nt'] },
    ],
    rejectedOpenerRebidCalls: ['Pass'],
    north: { S: 'AT42', H: 'AK', D: 'KJ4', C: '9764' },
    south: { S: '6', H: 'T9763', D: 'Q532', C: 'KJ5' },
  },
  {
    description: '1NT: 2-HCP responder with five spades transfers with 2H rather than passing 1NT.',
    practiceAuction: ['1NT', 'Pass', '2H', 'Pass', '2S'],
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
    north: { S: 'AK8', H: 'AT2', D: 'K652', C: 'JT4' },
    south: { S: 'J7432', H: 'J94', D: 'T83', C: '75' },
  },
  {
    description: '1NT: 14 HCP, six hearts, no four-card spade suit; Texas 4D takes priority over ordinary Jacoby 2D.',
    practiceAuction: ['1NT', 'Pass', '4D', 'Pass', '4H'],
    requiredSystem: { oneNtOpening: '15-17', jacobyTransfers: true, texasTransfers: true },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-15-17'] },
    ],
    expectedResponseCalls: [
      { call: '4D', ruleIds: ['respond-to-1nt-w/-texas-transfer-to-hearts'] },
    ],
    rejectedResponseCalls: ['2D'],
    expectedOpenerRebidCalls: [
      { call: '4H', ruleIds: ['opener-rebid-complete-texas-after-nt'] },
    ],
    rejectedOpenerRebidCalls: ['Pass'],
    north: { S: 'KQJ8', H: 'J3', D: 'AT73', C: 'A93' },
    south: { S: 'A74', H: 'KQT752', D: 'KQ85', C: '' },
  },
  {
    description: '1NT: 12 HCP, six spades, no four-card heart suit; Texas 4H takes priority over ordinary Jacoby 2H.',
    practiceAuction: ['1NT', 'Pass', '4H', 'Pass', '4S'],
    requiredSystem: { oneNtOpening: '15-17', jacobyTransfers: true, texasTransfers: true },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-15-17'] },
    ],
    expectedResponseCalls: [
      { call: '4H', ruleIds: ['respond-to-1nt-w/-texas-transfer-to-spades'] },
    ],
    rejectedResponseCalls: ['2H'],
    expectedOpenerRebidCalls: [
      { call: '4S', ruleIds: ['opener-rebid-complete-texas-after-nt'] },
    ],
    rejectedOpenerRebidCalls: ['Pass'],
    north: { S: 'K5', H: 'AKJ8', D: 'A87', C: '9876' },
    south: { S: 'AJT942', H: 'Q6', D: 'QJ54', C: 'Q' },
  },
  {
    description: '1NT: with both Stayman and Jacoby off, 6 HCP and five hearts give a natural ' +
                 'weak 2H signoff, not an artificial 2D transfer.',
    practiceAuction: ['1NT', 'Pass', '2H', 'Pass', 'Pass'],
    requiredSystem: { oneNtOpening: '15-17', stayman: false, jacobyTransfers: false,
                      texasTransfers: false },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-15-17'] },
    ],
    expectedResponseCalls: [
      { call: '2H', ruleIds: ['respond-to-1nt-w/-2h-2s-natural-signoff'] },
    ],
    expectedOpenerRebidCalls: [
      { call: 'Pass', ruleIds: ['opener-rebid-pass-after-1nt-weak-natural-major'] },
    ],
    north: { S: 'AT42', H: 'AK', D: 'KJ4', C: '9764' },
    south: { S: '6', H: 'T9763', D: 'Q532', C: 'KJ5' },
  },
  {
    description: '1NT: 14 HCP and six hearts, with Texas off but Jacoby on: natural 4H ' +
                 'is the direct game route and suppresses the otherwise available 2D transfer.',
    practiceAuction: ['1NT', 'Pass', '4H', 'Pass', 'Pass'],
    requiredSystem: { oneNtOpening: '15-17', stayman: true, jacobyTransfers: true,
                      texasTransfers: false },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-15-17'] },
    ],
    expectedResponseCalls: [
      { call: '4H', ruleIds: ['respond-to-1nt-w/-4h-4s-natural-game'] },
    ],
    rejectedResponseCalls: ['2D', '4D'],
    expectedOpenerRebidCalls: [
      { call: 'Pass', ruleIds: ['opener-rebid-pass-after-nt-natural-major-game'] },
    ],
    rejectedOpenerRebidCalls: ['4S'],
    north: { S: 'KQJ8', H: 'J3', D: 'AT73', C: 'A93' },
    south: { S: 'A74', H: 'KQT752', D: 'KQ85', C: '' },
  },
  {
    description: '1NT: 9 HCP and six hearts plus four spades uses Stayman 2C first, ' +
                 'rather than Jacoby 2D or Texas 4D; explore a possible four-four spade fit.',
    practiceAuction: ['1NT', 'Pass', '2C', 'Pass', '2D'],
    requiredSystem: { oneNtOpening: '15-17', stayman: true, jacobyTransfers: true,
                      texasTransfers: true },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-15-17'] },
    ],
    expectedResponseCalls: [
      { call: '2C', ruleIds: ['respond-to-1nt-w/-stayman'] },
    ],
    rejectedResponseCalls: ['2D', '4D'],
    expectedOpenerRebidCalls: [
      { call: '2D', ruleIds: ['opener-rebid-deny-major-after-nt-stayman'] },
    ],
    rejectedOpenerRebidCalls: ['2H', '2S'],
    north: { S: 'T3', H: 'Q72', D: 'AJ4', C: 'AKJ83' },
    south: { S: 'K752', H: 'KT9843', D: 'K7', C: '4' },
  },
  {
    description: '1NT-2C-2H: opener has exactly four hearts and only three spades, ' +
                 'so answer Stayman with hearts.',
    practiceAuction: ['1NT', 'Pass', '2C', 'Pass', '2H'],
    requiredSystem: { oneNtOpening: '15-17', stayman: true },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-15-17'] },
    ],
    expectedResponseCalls: [
      { call: '2C', ruleIds: ['respond-to-1nt-w/-stayman'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '2H', ruleIds: ['opener-rebid-show-hearts-after-nt-stayman'] },
    ],
    rejectedOpenerRebidCalls: ['2D', '2S'],
    north: { S: 'A73', H: 'KQJ6', D: 'K85', C: 'Q94' },
    south: { S: 'K84', H: 'A982', D: 'QJT', C: 'J75' },
  },
  {
    description: '1NT: with neither Stayman nor Jacoby, an unbalanced 8-HCP hand with ' +
                 'five hearts and four spades uses the basic natural 2NT invitation. ' +
                 'This rule deliberately permits an unbalanced invitation when both are off.',
    practiceAuction: ['1NT', 'Pass', '2NT', 'Pass', '3NT'],
    requiredSystem: { oneNtOpening: '15-17', stayman: false, jacobyTransfers: false,
                      texasTransfers: false },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-15-17'] },
    ],
    expectedResponseCalls: [
      { call: '2NT', ruleIds: ['respond-to-1nt-w/-2nt-8-9-invitational'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '3NT', ruleIds: ['opener-rebid-3nt-after-1nt-2nt-invitation'] },
    ],
    rejectedOpenerRebidCalls: ['Pass'],
    north: { S: 'AQJ3', H: 'JT65', D: 'AK', C: 'Q73' },
    south: { S: 'KT74', H: 'K9742', D: 'Q94', C: 'T' },
  },
  {
    description: '1NT 15-17, maximum 17 HCP: accept the balanced 9-HCP 2NT invitation with 3NT.',
    practiceAuction: ['1NT', 'Pass', '2NT', 'Pass', '3NT'],
    requiredSystem: { oneNtOpening: '15-17' },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-15-17'] },
    ],
    expectedResponseCalls: [
      { call: '2NT', ruleIds: ['respond-to-1nt-w/-2nt-8-9-invitational'] },
    ],
    rejectedResponseCalls: ['3NT'],
    expectedOpenerRebidCalls: [
      { call: '3NT', ruleIds: ['opener-rebid-3nt-after-1nt-2nt-invitation'] },
    ],
    rejectedOpenerRebidCalls: ['Pass'],
    north: { S: 'AK63', H: 'QJ62', D: 'QT9', C: 'KQ' },
    south: { S: 'J82', H: 'AK7', D: 'J8542', C: '54' },
  },
  {
    description: '1NT 15-17, 16 HCP: a balanced 9-HCP 2NT invitation allows Pass or 3NT by judgment.',
    practiceAuction: ['1NT', 'Pass', '2NT', 'Pass', 'Pass'],
    requiredSystem: { oneNtOpening: "15-17" },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-15-17'] },
    ],
    expectedResponseCalls: [
      { call: '2NT', ruleIds: ['respond-to-1nt-w/-2nt-8-9-invitational'] },
    ],
    rejectedResponseCalls: ['3NT'],
    expectedOpenerRebidCalls: [
      { call: 'Pass', ruleIds: ['opener-rebid-pass-after-1nt-2nt-invitation'] },
      { call: '3NT', ruleIds: ['opener-rebid-3nt-after-1nt-2nt-invitation'] },
    ],
    north: { S: 'AKT', H: 'KJ63', D: '93', C: 'AJ93' },
    south: { S: 'Q64', H: 'A84', D: 'T876', C: 'K72' },
  },
  {
    description: '1NT 16-18, 17 HCP: retain Pass and 3NT against a balanced 7-HCP invitation.',
    practiceAuction: ['1NT', 'Pass', '2NT', 'Pass', 'Pass'],
    requiredSystem: { oneNtOpening: "16-18" },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-16-18'] },
    ],
    expectedResponseCalls: [
      { call: '2NT', ruleIds: ['respond-to-1nt-w/-2nt-8-9-invitational'] },
    ],
    rejectedResponseCalls: ['Pass', '3NT'],
    expectedOpenerRebidCalls: [
      { call: 'Pass', ruleIds: ['opener-rebid-pass-after-1nt-2nt-invitation'] },
      { call: '3NT', ruleIds: ['opener-rebid-3nt-after-1nt-2nt-invitation'] },
    ],
    north: { S: 'A52', H: 'K8532', D: 'KQ8', C: 'AJ' },
    south: { S: 'QT9', H: 'AJT', D: 'T763', C: '852' },
  },
  {
    description: '1NT 15-17, middle 16 HCP: Pass or 6NT are judgment options over quantitative 4NT.',
    practiceAuction: ['1NT', 'Pass', '4NT', 'Pass', 'Pass'],
    requiredSystem: { oneNtOpening: '15-17' },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-15-17'] },
    ],
    expectedResponseCalls: [
      { call: '4NT', ruleIds: ['respond-to-1nt-w/-4nt-16-17-balanced'] },
    ],
    rejectedResponseCalls: ['3NT'],
    expectedOpenerRebidCalls: [
      { call: 'Pass', ruleIds: ['opener-rebid-pass-after-nt-4nt-quantitative-invitation'] },
      { call: '6NT', ruleIds: ['opener-rebid-6nt-after-nt-4nt-quantitative-invitation'] },
    ],
    north: { S: '53', H: 'AQJ4', D: 'AKT6', C: 'QT3' },
    south: { S: 'AT9', H: 'K86', D: 'Q97', C: 'AK82' },
  },
  {
    description: '1NT 16-18, middle 17 HCP: Pass or 6NT are judgment options over quantitative 4NT.',
    practiceAuction: ['1NT', 'Pass', '4NT', 'Pass', 'Pass'],
    requiredSystem: { oneNtOpening: "16-18" },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-16-18'] },
    ],
    expectedResponseCalls: [
      { call: '4NT', ruleIds: ['respond-to-1nt-w/-4nt-16-17-balanced'] },
    ],
    rejectedResponseCalls: ['3NT'],
    expectedOpenerRebidCalls: [
      { call: 'Pass', ruleIds: ['opener-rebid-pass-after-nt-4nt-quantitative-invitation'] },
      { call: '6NT', ruleIds: ['opener-rebid-6nt-after-nt-4nt-quantitative-invitation'] },
    ],
    north: { S: 'AK7', H: 'K9762', D: 'KT2', C: 'A3' },
    south: { S: 'QT2', H: 'AJ8', D: 'AJ85', C: 'QJT' },
  },
  {
    description: '1NT 15-17, minimum 15 HCP: decline the 9-HCP 2NT game invitation.',
    practiceAuction: ['1NT', 'Pass', '2NT', 'Pass', 'Pass'],
    requiredSystem: { oneNtOpening: '15-17' },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-15-17'] },
    ],
    expectedResponseCalls: [
      { call: '2NT', ruleIds: ['respond-to-1nt-w/-2nt-8-9-invitational'] },
    ],
    expectedOpenerRebidCalls: [
      { call: 'Pass', ruleIds: ['opener-rebid-pass-after-1nt-2nt-invitation'] },
    ],
    rejectedOpenerRebidCalls: ['3NT'],
    north: { S: 'AK63', H: 'QJ62', D: 'QT9', C: 'QJ' },
    south: { S: 'J82', H: 'AK7', D: 'J8542', C: '54' },
  },
  {
    description: '1NT 16-18, minimum 16 HCP: decline the balanced 7-HCP 2NT invitation.',
    practiceAuction: ['1NT', 'Pass', '2NT', 'Pass', 'Pass'],
    requiredSystem: { oneNtOpening: '16-18' },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-16-18'] },
    ],
    expectedResponseCalls: [
      { call: '2NT', ruleIds: ['respond-to-1nt-w/-2nt-8-9-invitational'] },
    ],
    expectedOpenerRebidCalls: [
      { call: 'Pass', ruleIds: ['opener-rebid-pass-after-1nt-2nt-invitation'] },
    ],
    rejectedOpenerRebidCalls: ['3NT'],
    north: { S: 'A52', H: 'K8532', D: 'KQ8', C: 'AT' },
    south: { S: 'QT9', H: 'AJT', D: 'T763', C: '852' },
  },
  {
    description: '1NT 16-18, maximum 18 HCP: accept the balanced 7-HCP 2NT invitation.',
    practiceAuction: ['1NT', 'Pass', '2NT', 'Pass', '3NT'],
    requiredSystem: { oneNtOpening: '16-18' },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-16-18'] },
    ],
    expectedResponseCalls: [
      { call: '2NT', ruleIds: ['respond-to-1nt-w/-2nt-8-9-invitational'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '3NT', ruleIds: ['opener-rebid-3nt-after-1nt-2nt-invitation'] },
    ],
    rejectedOpenerRebidCalls: ['Pass'],
    north: { S: 'A52', H: 'K8532', D: 'KQ8', C: 'AQ' },
    south: { S: 'QT9', H: 'AJT', D: 'T763', C: '852' },
  },
  {
    description: '1NT 15-17, minimum 15 HCP: decline a balanced 16-HCP quantitative 4NT.',
    practiceAuction: ['1NT', 'Pass', '4NT', 'Pass', 'Pass'],
    requiredSystem: { oneNtOpening: '15-17' },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-15-17'] },
    ],
    expectedResponseCalls: [
      { call: '4NT', ruleIds: ['respond-to-1nt-w/-4nt-16-17-balanced'] },
    ],
    expectedOpenerRebidCalls: [
      { call: 'Pass', ruleIds: ['opener-rebid-pass-after-nt-4nt-quantitative-invitation'] },
    ],
    rejectedOpenerRebidCalls: ['6NT'],
    north: { S: '53', H: 'AQ94', D: 'AKT6', C: 'QT3' },
    south: { S: 'AT9', H: 'K86', D: 'Q97', C: 'AK82' },
  },
  {
    description: '1NT 15-17, maximum 17 HCP: accept a balanced 16-HCP quantitative 4NT.',
    practiceAuction: ['1NT', 'Pass', '4NT', 'Pass', '6NT'],
    requiredSystem: { oneNtOpening: '15-17' },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-15-17'] },
    ],
    expectedResponseCalls: [
      { call: '4NT', ruleIds: ['respond-to-1nt-w/-4nt-16-17-balanced'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '6NT', ruleIds: ['opener-rebid-6nt-after-nt-4nt-quantitative-invitation'] },
    ],
    rejectedOpenerRebidCalls: ['Pass'],
    north: { S: '53', H: 'AQJ4', D: 'AKT6', C: 'QJ3' },
    south: { S: 'AT9', H: 'K86', D: 'Q97', C: 'AK82' },
  },
  {
    description: '1NT 16-18, minimum 16 HCP: decline the balanced 15-HCP quantitative 4NT.',
    practiceAuction: ['1NT', 'Pass', '4NT', 'Pass', 'Pass'],
    requiredSystem: { oneNtOpening: '16-18' },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-16-18'] },
    ],
    expectedResponseCalls: [
      { call: '4NT', ruleIds: ['respond-to-1nt-w/-4nt-16-17-balanced'] },
    ],
    expectedOpenerRebidCalls: [
      { call: 'Pass', ruleIds: ['opener-rebid-pass-after-nt-4nt-quantitative-invitation'] },
    ],
    rejectedOpenerRebidCalls: ['6NT'],
    north: { S: 'AK7', H: 'Q9762', D: 'KT2', C: 'A3' },
    south: { S: 'QT2', H: 'AJ8', D: 'AJ85', C: 'QJT' },
  },
  {
    description: '1NT 16-18, maximum 18 HCP: accept the balanced 15-HCP quantitative 4NT.',
    practiceAuction: ['1NT', 'Pass', '4NT', 'Pass', '6NT'],
    requiredSystem: { oneNtOpening: '16-18' },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-16-18'] },
    ],
    expectedResponseCalls: [
      { call: '4NT', ruleIds: ['respond-to-1nt-w/-4nt-16-17-balanced'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '6NT', ruleIds: ['opener-rebid-6nt-after-nt-4nt-quantitative-invitation'] },
    ],
    rejectedOpenerRebidCalls: ['Pass'],
    north: { S: 'AKJ', H: 'K9762', D: 'KT2', C: 'A3' },
    south: { S: 'QT2', H: 'AJ8', D: 'AJ85', C: 'QJT' },
  },
  {
    description: '1NT-3C: responder has KQ and six clubs, but opener lacks A/K/Q in clubs; ' +
                 'decline the suit-running invitation with Pass.',
    practiceAuction: ['1NT', 'Pass', '3C', 'Pass', 'Pass'],
    requiredSystem: { oneNtOpening: '15-17' },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-15-17'] },
    ],
    expectedResponseCalls: [
      { call: '3C', ruleIds: ['respond-to-1nt-w/-3c-3d-natural-invitational'] },
    ],
    expectedOpenerRebidCalls: [
      { call: 'Pass', ruleIds: ['opener-rebid-pass-after-1nt-3-minor-invitation'] },
    ],
    rejectedOpenerRebidCalls: ['3NT'],
    north: { S: 'AQJ', H: 'KQ4', D: 'KJ87', C: '943' },
    south: { S: 'T8', H: 'J76', D: 'Q5', C: 'KQ8762' },
  },
  {
    description: '1NT-3D: opener holds the missing top diamond honor, so accept the good ' +
                 'six-card-minor invitation with 3NT.',
    practiceAuction: ['1NT', 'Pass', '3D', 'Pass', '3NT'],
    requiredSystem: { oneNtOpening: '15-17' },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-15-17'] },
    ],
    expectedResponseCalls: [
      { call: '3D', ruleIds: ['respond-to-1nt-w/-3c-3d-natural-invitational'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '3NT', ruleIds: ['opener-rebid-3nt-after-1nt-3-minor-invitation'] },
    ],
    rejectedOpenerRebidCalls: ['Pass'],
    north: { S: 'AQJ3', H: 'KQ4', D: 'K52', C: '943' },
    south: { S: 'T82', H: 'J76', D: 'AQ8764', C: 'J' },
  },
  {
    description: '1NT: an 8-HCP six-club hand with only one of A/K/Q is not good enough for ' +
                 'the natural 3C invitation; with conventions off, use the generic 2NT invite.',
    practiceAuction: ['1NT', 'Pass', '2NT', 'Pass', '3NT'],
    requiredSystem: { oneNtOpening: '15-17', stayman: false, jacobyTransfers: false,
                      texasTransfers: false },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-15-17'] },
    ],
    expectedResponseCalls: [
      { call: '2NT', ruleIds: ['respond-to-1nt-w/-2nt-8-9-invitational'] },
    ],
    rejectedResponseCalls: ['3C'],
    expectedOpenerRebidCalls: [
      { call: '3NT', ruleIds: ['opener-rebid-3nt-after-1nt-2nt-invitation'] },
    ],
    rejectedOpenerRebidCalls: ['Pass'],
    north: { S: 'QJ3', H: 'AK4', D: 'AQJ7', C: '854' },
    south: { S: 'A82', H: '76', D: '54', C: 'KJT963' },
  },
  {
    description: '1NT-3H without Jacoby: responder shows a natural five-card-or-longer major; ' +
                 'opener has exactly two hearts and chooses 3NT.',
    practiceAuction: ['1NT', 'Pass', '3H', 'Pass', '3NT'],
    requiredSystem: { oneNtOpening: '15-17', jacobyTransfers: false },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-15-17'] },
    ],
    expectedResponseCalls: [
      { call: '3H', ruleIds: ['respond-to-1nt-w/-3h-3s-natural-forcing'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '3NT', ruleIds: ['opener-rebid-3nt-after-nt-natural-3-major'] },
    ],
    rejectedOpenerRebidCalls: ['4H'],
    north: { S: 'AQJ3', H: 'K4', D: 'KJ72', C: 'Q65' },
    south: { S: 'K82', H: 'AQJ87', D: '65', C: '742' },
  },
  {
    description: '1NT-3H with Jacoby on is the direct slam-interest treatment. A middle 16-HCP ' +
                 'opener shows the cheapest side control, 3S, while 4H remains visible.',
    practiceAuction: ['1NT', 'Pass', '3H', 'Pass', '3S'],
    requiredSystem: { oneNtOpening: '15-17', jacobyTransfers: true },
    expectedOpeningCalls: [
      { call: '1NT', ruleIds: ['open-1nt-balanced-15-17'] },
    ],
    expectedResponseCalls: [
      { call: '3H', ruleIds: ['respond-to-1nt-w/-3h-3s-slam-interest'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '3S', ruleIds: ['opener-rebid-control-after-1nt-direct-3-major-slam-interest'] },
      { call: '4H', ruleIds: ['opener-rebid-game-after-1nt-direct-3-major-slam-interest'] },
    ],
    expectedOpenerRebidCallOrder: [['3S', '4H']],
    north: { S: 'AK63', H: '63', D: 'AQ65', C: 'K52' },
    south: { S: 'QT8', H: 'AKQJT8', D: 'JT', C: 'QJ' },
  },
];

/// The corresponding immediate opener continuations after a natural 20-21 2NT opening.
export const OPENER_REBID_AFTER_2NT_OPENING_TEST_DEALS: RuleTestDeal[] = [
  {
    description: '2NT: 4 balanced HCP bid 3NT even opposite a minimum 20-HCP opener; our ' +
                 'source uses this threshold, not a rigid 25 combined HCP.',
    practiceAuction: ['2NT', 'Pass', '3NT', 'Pass', 'Pass'],
    expectedOpeningCalls: [
      { call: '2NT', ruleIds: ['open-2nt-balanced-20-21'] },
    ],
    expectedResponseCalls: [
      { call: '3NT', ruleIds: ['respond-to-2nt-w/-3nt-4-10'] },
    ],
    rejectedResponseCalls: ['Pass', '4NT'],
    rejectedOpeningCalls: ['1C', '1D'],
    expectedOpenerRebidCalls: [
      { call: 'Pass', ruleIds: ['opener-rebid-pass-after-nt-natural-nt-signoff'] },
    ],
    north: { S: 'AK3', H: 'AQ2', D: 'KJ4', C: 'QJ76' },
    south: { S: 'T76', H: '753', D: 'T86', C: 'AT92' },
  },
  {
    description: '2NT: with 0 HCP and six hearts, transfer with 3D when Jacoby is on; the ' +
                 'natural Pass fallback is suppressed.',
    practiceAuction: ['2NT', 'Pass', '3D', 'Pass', '3H'],
    requiredSystem: { jacobyTransfers: true },
    expectedOpeningCalls: [
      { call: '2NT', ruleIds: ['open-2nt-balanced-20-21'] },
    ],
    expectedResponseCalls: [
      { call: '3D', ruleIds: ['respond-to-2nt-w/-transfer-to-hearts'] },
    ],
    rejectedResponseCalls: ['Pass'],
    expectedOpenerRebidCalls: [
      { call: '3H', ruleIds: ['opener-rebid-complete-jacoby-after-nt'] },
    ],
    rejectedOpenerRebidCalls: ['Pass'],
    north: { S: 'AK3', H: 'AQ2', D: 'KJ4', C: 'QJ76' },
    south: { S: '85', H: 'T87543', D: '532', C: '92' },
  },
  {
    description: '2NT: 2 HCP and five spades transfer with 3H rather than passing a weak ' +
                 'balanced hand.',
    practiceAuction: ['2NT', 'Pass', '3H', 'Pass', '3S'],
    requiredSystem: { jacobyTransfers: true },
    expectedOpeningCalls: [
      { call: '2NT', ruleIds: ['open-2nt-balanced-20-21'] },
    ],
    expectedResponseCalls: [
      { call: '3H', ruleIds: ['respond-to-2nt-w/-transfer-to-spades'] },
    ],
    rejectedResponseCalls: ['Pass'],
    expectedOpenerRebidCalls: [
      { call: '3S', ruleIds: ['opener-rebid-complete-jacoby-after-nt'] },
    ],
    rejectedOpenerRebidCalls: ['Pass'],
    north: { S: 'AK4', H: 'AQ2', D: 'KJ', C: 'QJ753' },
    south: { S: '87532', H: '975', D: 'Q86', C: '42' },
  },
  {
    description: '2NT: 4 HCP and four hearts use 3C Stayman to look for a 4-4 fit; direct 3NT ' +
                 'is suppressed.',
    practiceAuction: ['2NT', 'Pass', '3C', 'Pass', '3H'],
    requiredSystem: { stayman: true },
    expectedOpeningCalls: [
      { call: '2NT', ruleIds: ['open-2nt-balanced-20-21'] },
    ],
    expectedResponseCalls: [
      { call: '3C', ruleIds: ['respond-to-2nt-w/-stayman'] },
    ],
    rejectedResponseCalls: ['3NT'],
    rejectedOpeningCalls: ['1C', '1D'],
    expectedOpenerRebidCalls: [
      { call: '3H', ruleIds: ['opener-rebid-show-hearts-after-nt-stayman'] },
    ],
    rejectedOpenerRebidCalls: ['3D', '3S'],
    north: { S: 'AQ43', H: 'KQJ2', D: 'AK3', C: 'Q9' },
    south: { S: 'KJ6', H: 'T975', D: '752', C: '542' },
  },
  {
    description: '2NT: 5 HCP and six hearts take the fast Texas 4D game route; ordinary 3D ' +
                 'Jacoby is suppressed.',
    practiceAuction: ['2NT', 'Pass', '4D', 'Pass', '4H'],
    requiredSystem: { jacobyTransfers: true, texasTransfers: true },
    expectedOpeningCalls: [
      { call: '2NT', ruleIds: ['open-2nt-balanced-20-21'] },
    ],
    expectedResponseCalls: [
      { call: '4D', ruleIds: ['respond-to-2nt-w/-texas-transfer-to-hearts'] },
    ],
    rejectedResponseCalls: ['3D'],
    expectedOpenerRebidCalls: [
      { call: '4H', ruleIds: ['opener-rebid-complete-texas-after-nt'] },
    ],
    rejectedOpenerRebidCalls: ['Pass'],
    north: { S: 'AK4', H: 'AQ2', D: 'KJ', C: 'QJ753' },
    south: { S: 'Q9', H: 'J98643', D: 'Q63', C: '64' },
  },
  {
    description: '2NT: 5 HCP and six spades take the fast Texas 4H route to 4S when the ' +
                 'convention is enabled.',
    practiceAuction: ['2NT', 'Pass', '4H', 'Pass', '4S'],
    requiredSystem: { jacobyTransfers: true, texasTransfers: true },
    expectedOpeningCalls: [
      { call: '2NT', ruleIds: ['open-2nt-balanced-20-21'] },
    ],
    expectedResponseCalls: [
      { call: '4H', ruleIds: ['respond-to-2nt-w/-texas-transfer-to-spades'] },
    ],
    rejectedResponseCalls: ['3H'],
    expectedOpenerRebidCalls: [
      { call: '4S', ruleIds: ['opener-rebid-complete-texas-after-nt'] },
    ],
    rejectedOpenerRebidCalls: ['Pass'],
    north: { S: 'AQ43', H: 'KQJ2', D: 'AK3', C: 'Q9' },
    south: { S: '987652', H: '87', D: 'Q74', C: 'K6' },
  },
  {
    description: '2NT: the same six-spade hand responds natural 4S when Texas is disabled; ' +
                 'ordinary 3H Jacoby is suppressed.',
    practiceAuction: ['2NT', 'Pass', '4S', 'Pass', 'Pass'],
    requiredSystem: { jacobyTransfers: true, texasTransfers: false },
    expectedOpeningCalls: [
      { call: '2NT', ruleIds: ['open-2nt-balanced-20-21'] },
    ],
    expectedResponseCalls: [
      { call: '4S', ruleIds: ['respond-to-2nt-w/-4h-4s-natural-game'] },
    ],
    rejectedResponseCalls: ['3H'],
    expectedOpenerRebidCalls: [
      { call: 'Pass', ruleIds: ['opener-rebid-pass-after-nt-natural-major-game'] },
    ],
    north: { S: 'AQ43', H: 'KQJ2', D: 'AK3', C: 'Q9' },
    south: { S: '987652', H: '87', D: 'Q74', C: 'K6' },
  },
  {
    description: '2NT: with 13 balanced HCP, bid 6NT directly. Rare Gerber may also appear, ' +
                 'but is not a general slam try.',
    practiceAuction: ['2NT', 'Pass', '6NT', 'Pass', 'Pass'],
    expectedOpeningCalls: [
      { call: '2NT', ruleIds: ['open-2nt-balanced-20-21'] },
    ],
    expectedResponseCalls: [
      { call: '6NT', ruleIds: ['respond-to-2nt-w/-6nt-13-15-balanced'] },
    ],
    rejectedResponseCalls: ['4NT'],
    expectedOpenerRebidCalls: [
      { call: 'Pass', ruleIds: ['opener-rebid-pass-after-nt-natural-nt-signoff'] },
    ],
    north: { S: 'AQ43', H: 'KQJ2', D: 'AK3', C: 'Q9' },
    south: { S: 'KJ5', H: 'AT7', D: '986', C: 'AJ73' },
  },
  {
    description: '2NT-3C-3D: opener has no four-card major, so deny a major ' +
                 'rather than show a three-card suit.',
    practiceAuction: ['2NT', 'Pass', '3C', 'Pass', '3D'],
    requiredSystem: { stayman: true },
    expectedOpeningCalls: [
      { call: '2NT', ruleIds: ['open-2nt-balanced-20-21'] },
    ],
    expectedResponseCalls: [
      { call: '3C', ruleIds: ['respond-to-2nt-w/-stayman'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '3D', ruleIds: ['opener-rebid-deny-major-after-nt-stayman'] },
    ],
    rejectedOpenerRebidCalls: ['3H', '3S'],
    north: { S: 'AK3', H: 'AQ2', D: 'KJ4', C: 'QJ76' },
    south: { S: 'J86', H: 'T975', D: '752', C: 'K42' },
  },
  {
    description: '2NT-3C-3S: opener has four spades but only three hearts; ' +
                 'the Stayman response must show spades.',
    practiceAuction: ['2NT', 'Pass', '3C', 'Pass', '3S'],
    requiredSystem: { stayman: true },
    expectedOpeningCalls: [
      { call: '2NT', ruleIds: ['open-2nt-balanced-20-21'] },
    ],
    expectedResponseCalls: [
      { call: '3C', ruleIds: ['respond-to-2nt-w/-stayman'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '3S', ruleIds: ['opener-rebid-show-spades-after-nt-stayman'] },
    ],
    rejectedOpenerRebidCalls: ['3D', '3H'],
    north: { S: 'AQ43', H: 'KQJ', D: 'AK83', C: 'Q9' },
    south: { S: 'KJ6', H: 'T975', D: '752', C: '542' },
  },
  {
    description: '2NT 20 HCP: decline the balanced 11-HCP quantitative 4NT with Pass.',
    practiceAuction: ['2NT', 'Pass', '4NT', 'Pass', 'Pass'],
    expectedOpeningCalls: [
      { call: '2NT', ruleIds: ['open-2nt-balanced-20-21'] },
    ],
    expectedResponseCalls: [
      { call: '4NT', ruleIds: ['respond-to-2nt-w/-4nt-11-12-balanced'] },
    ],
    rejectedResponseCalls: ['3NT'],
    expectedOpenerRebidCalls: [
      { call: 'Pass', ruleIds: ['opener-rebid-pass-after-nt-4nt-quantitative-invitation'] },
    ],
    rejectedOpenerRebidCalls: ['6NT'],
    north: { S: 'AK4', H: 'AQ2', D: 'KJ', C: 'QJ753' },
    south: { S: 'QJ2', H: 'KJ5', D: '987', C: 'AT84' },
  },
  {
    description: '2NT 21 HCP: even at the maximum, Pass is possible over quantitative 4NT; ' +
                 '6NT needs favorable trick-taking prospects.',
    practiceAuction: ['2NT', 'Pass', '4NT', 'Pass', 'Pass'],
    expectedOpeningCalls: [
      { call: '2NT', ruleIds: ['open-2nt-balanced-20-21'] },
    ],
    expectedResponseCalls: [
      { call: '4NT', ruleIds: ['respond-to-2nt-w/-4nt-11-12-balanced'] },
    ],
    expectedOpenerRebidCalls: [
      { call: 'Pass', ruleIds: ['opener-rebid-pass-after-nt-4nt-quantitative-invitation'] },
      { call: '6NT', ruleIds: ['opener-rebid-6nt-after-nt-4nt-quantitative-invitation'] },
    ],
    expectedOpenerRebidCallOrder: [['Pass', '6NT']],
    north: { S: 'AK4', H: 'AQ2', D: 'KQ', C: 'QJ753' },
    south: { S: 'QJ2', H: 'KJ5', D: '987', C: 'AT84' },
  },
  {
    description: '2NT: with conventions off, a 5-HCP unbalanced six-club hand has enough ' +
                 'game values to use the ordinary 3NT fallback rather than falling through.',
    practiceAuction: ['2NT', 'Pass', '3NT', 'Pass', 'Pass'],
    requiredSystem: { stayman: false, jacobyTransfers: false },
    expectedOpeningCalls: [
      { call: '2NT', ruleIds: ['open-2nt-balanced-20-21'] },
    ],
    expectedResponseCalls: [
      { call: '3NT', ruleIds: ['respond-to-2nt-w/-3nt-4-10'] },
    ],
    rejectedResponseCalls: ['Pass', '3C'],
    expectedOpenerRebidCalls: [
      { call: 'Pass', ruleIds: ['opener-rebid-pass-after-nt-natural-nt-signoff'] },
    ],
    north: { S: 'KQJ', H: 'AQ2', D: 'KJ4', C: 'A876' },
    south: { S: '85', H: 'T76', D: '52', C: 'KQT953' },
  },
  {
    description: '2NT-3C with Stayman off: a 10-HCP unbalanced six-club hand uses natural ' +
                 'forcing 3C instead of the generic 3NT fallback; opener returns to 3NT.',
    practiceAuction: ['2NT', 'Pass', '3C', 'Pass', '3NT'],
    requiredSystem: { stayman: false },
    expectedOpeningCalls: [
      { call: '2NT', ruleIds: ['open-2nt-balanced-20-21'] },
    ],
    expectedResponseCalls: [
      { call: '3C', ruleIds: ['respond-to-2nt-w/-3c-natural-forcing'] },
    ],
    rejectedResponseCalls: ['3NT'],
    expectedOpenerRebidCalls: [
      { call: '3NT', ruleIds: ['opener-rebid-3nt-after-2nt-natural-3-minor'] },
    ],
    north: { S: 'AK3', H: 'AQ2', D: 'KJ5', C: 'QJ83' },
    south: { S: '82', H: 'J76', D: 'Q4', C: 'AKT765' },
  },
  {
    description: '2NT-3D with Jacoby off: Stayman may remain enabled, but with no four-card ' +
                 'major a 10-HCP unbalanced six-diamond hand can bid natural forcing 3D.',
    practiceAuction: ['2NT', 'Pass', '3D', 'Pass', '3NT'],
    requiredSystem: { stayman: true, jacobyTransfers: false },
    expectedOpeningCalls: [
      { call: '2NT', ruleIds: ['open-2nt-balanced-20-21'] },
    ],
    expectedResponseCalls: [
      { call: '3D', ruleIds: ['respond-to-2nt-w/-3d-natural-forcing'] },
    ],
    rejectedResponseCalls: ['3NT'],
    expectedOpenerRebidCalls: [
      { call: '3NT', ruleIds: ['opener-rebid-3nt-after-2nt-natural-3-minor'] },
    ],
    north: { S: 'AK3', H: 'AQ2', D: 'QJ4', C: 'A873' },
    south: { S: '982', H: '76', D: 'AKT765', C: 'QJ' },
  },
  {
    description: '2NT-3S without Jacoby: responder shows a natural five-card-or-longer major; ' +
                 'opener has three spades and chooses the known major fit in 4S.',
    practiceAuction: ['2NT', 'Pass', '3S', 'Pass', '4S'],
    requiredSystem: { jacobyTransfers: false },
    expectedOpeningCalls: [
      { call: '2NT', ruleIds: ['open-2nt-balanced-20-21'] },
    ],
    expectedResponseCalls: [
      { call: '3S', ruleIds: ['respond-to-2nt-w/-3h-3s-natural-forcing'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '4S', ruleIds: ['opener-rebid-game-in-responder-major-after-nt-natural-3-major'] },
    ],
    rejectedOpenerRebidCalls: ['3NT'],
    north: { S: 'AK3', H: 'AQ2', D: 'KJ4', C: 'QJ76' },
    south: { S: 'QJT86', H: 'K76', D: '852', C: '54' },
  },
];
