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
  //// Natural 1NT overcall -- Minimum opener rebid
  {
    description: '1H-(1NT)-2D-(Pass)-Pass: nine HCP plus three heart length points give ' +
                 'a legitimate 1H opening, but this is still a minimum after the weak 2D response.',
    practiceAuction: ['1H', '1NT', '2D', 'Pass', 'Pass'],
    practiceGuidance: [{ auctionIndex: 0, seat: 'N', text: 'Nine HCP and a seven-card heart ' +
      'suit give twelve opening points including length; this is not a strong opener.' }],
    expectedOpeningCalls: [{ call: '1H', ruleIds: ['open-five-card-major'] }],
    expectedOvercallCalls: [{ call: '1NT', ruleIds: ['overcall-natural-1nt-with-stopper'] }],
    expectedResponseCalls: [{ call: '2D', ruleIds: ['respond-over-1nt-new-suit-two-level'] }],
    expectedOpenerRebidCalls: [{ call: 'Pass', ruleIds: [
      'opener-rebid-pass-after-opponent-1nt-weak-new-suit',
    ] }],
    north: { S: 'K42', H: 'KQJ9876', D: '73', C: '5' },
    east: { S: 'AQ96', H: 'A53', D: 'K54', C: 'KJ9' },
    south: { S: 'T83', H: '2', D: 'AJT962', C: 'QT2' },
    west: { S: 'J75', H: 'T4', D: 'Q8', C: 'A87643' },
  },
  //// Additional competition after responder acts
  // Opener must account for advancer acting after responder has already bid.
  {
    description: '1H-(2D)-3C-(3D)-3NT: responder\'s 3C remains game-forcing when the opponents ' +
                 'raise diamonds; opener has a genuine diamond stopper and no major fit.',
    practiceAuction: ['1H', '2D', '3C', '3D', '3NT'],
    expectedOpeningCalls: [{ call: '1H', ruleIds: ['open-five-card-major'] }],
    expectedOvercallCalls: [{ call: '2D', ruleIds: ['overcall-simple-suit-at-two-level'] }],
    expectedResponseCalls: [{ call: '3C', ruleIds: ['respond-over-suit-new-suit-three-level'] }],
    expectedAdvanceCalls: [{ call: '3D', ruleIds: [
      'advance-two-level-suit-overcall-after-responder-natural-action-simple-raise',
    ] }],
    expectedOpenerRebidCalls: [{ call: '3NT', ruleIds: [
      'opener-rebid-3nt-after-overcall-three-level-forcing-response',
    ] }],
    north: { S: 'Q83', H: 'A8754', D: 'AQ', C: '952' },
    east: { S: 'AK64', H: '2', D: 'KJT987', C: '64' },
    south: { S: 'J52', H: 'KT', D: '2', C: 'AKQT873' },
    west: { S: 'T97', H: 'QJ963', D: '6543', C: 'J' },
  },
  {
    description: '1D-(1S)-2D-(3D)-Pass: advancer cuebids diamonds artificially to show strong ' +
                 'spade support. A minimum diamond opener can defend rather than bid again.',
    dealer: 'W', practiceAuction: ['1D', '1S', '2D', '3D', 'Pass'],
    practiceGuidance: [{ auctionIndex: 4, seat: 'W', text: 'South\'s 3D is an artificial spade ' +
      'support cuebid, not a natural contract. Minimum opener need not bid again.' }],
    expectedOpeningCalls: [{ call: '1D', ruleIds: ['open-convenient-minor'] }],
    expectedOvercallCalls: [{ call: '1S', ruleIds: ['overcall-simple-suit-at-one-level'] }],
    expectedResponseCalls: [{ call: '2D', ruleIds: ['respond-to-minor-w/-raise-to-two'] }],
    expectedAdvanceCalls: [{ call: '3D', ruleIds: [
      'advance-one-level-suit-overcall-after-responder-raise-support-cuebid',
    ] }],
    expectedOpenerRebidCalls: [{ call: 'Pass', ruleIds: [
      'opener-rebid-pass-after-advancer-support-cuebid',
    ] }],
    west: { S: 'K72', H: 'A43', D: 'AQJ74', C: '83' },
    north: { S: 'AQJ86', H: '762', D: '8', C: 'K964' },
    east: { S: '43', H: '985', D: '96532', C: 'AQ2' },
    south: { S: 'T95', H: 'KQJT', D: 'KT', C: 'JT75' },
  },
  {
    description: '1H-(Double)-2H-(3H)-Pass: advancer cuebids opener\'s suit artificially ' +
                 'after a takeout Double, not to play hearts. Minimum opener can defend.',
    dealer: 'W', practiceAuction: ['1H', 'Double', '2H', '3H', 'Pass'],
    practiceGuidance: [{ auctionIndex: 2, seat: 'E', text: 'Five low hearts support ' +
      'a simple, nonforcing 2H. A weak preemptive 3H is also a competitive option, ' +
      'but is not a stronger limit raise; weigh vulnerability and outside tricks.' }],
    expectedOpeningCalls: [{ call: '1H', ruleIds: ['open-five-card-major'] }],
    expectedOvercallCalls: [{ call: 'Double', ruleIds: [
      'overcall-takeout-double-with-unbid-suit-support',
    ] }],
    expectedResponseCalls: [{ call: '2H', ruleIds: ['respond-to-major-w/-support-simple-raise'] }],
    expectedAdvanceCalls: [{ call: '3H', ruleIds: [
      'advance-takeout-double-after-responder-raise-strong-cuebid',
    ] }],
    expectedOpenerRebidCalls: [{ call: 'Pass', ruleIds: [
      'opener-rebid-pass-after-advancer-support-cuebid',
    ] }],
    west: { S: 'K72', H: 'AKT96', D: 'Q53', C: '54' },
    north: { S: 'A984', H: '2', D: 'KJ82', C: 'K976' },
    east: { S: '53', H: '87543', D: '764', C: 'AJ2' },
    south: { S: 'QJT6', H: 'QJ', D: 'AT9', C: 'QT83' },
  },
  {
    description: '1D-(1S)-1NT-(2S)-Pass: after a natural 1NT response and an opposing spade ' +
                 'raise, a minimum semi-balanced opener can defend rather than overbid.',
    dealer: 'W', practiceAuction: ['1D', '1S', '1NT', '2S', 'Pass'],
    expectedOpeningCalls: [{ call: '1D', ruleIds: ['open-convenient-minor'] }],
    expectedOvercallCalls: [{ call: '1S', ruleIds: ['overcall-simple-suit-at-one-level'] }],
    expectedResponseCalls: [{ call: '1NT', ruleIds: ['respond-over-suit-natural-notrump'] }],
    expectedAdvanceCalls: [{ call: '2S', ruleIds: [
      'advance-one-level-suit-overcall-after-responder-natural-action-simple-raise',
    ] }],
    expectedOpenerRebidCalls: [{ call: 'Pass', ruleIds: [
      'opener-rebid-pass-after-overcall-natural-1nt-minimum',
    ] }],
    west: { S: '82', H: 'A435', D: 'AKJ74', C: 'Q3' },
    north: { S: 'AQJ96', H: '762', D: '82', C: 'K96' },
    east: { S: 'KT7', H: 'QJ8', D: 'T93', C: 'T724' },
    south: { S: '543', H: 'KT9', D: 'Q65', C: 'AJ85' },
  },
  //// Natural forcing one-level response after interference
  {
    description: '1C-(1D)-1H-(Pass)-1S: responder kept a natural forcing one-level meaning, so ' +
                 'opener can still show four spades economically.',
    practiceAuction: ['1C', '1D', '1H', 'Pass', '1S'],
    practiceGuidance: [
      { auctionIndex: 0, seat: 'N', text: 'North opens the five-card club suit; ' +
        'four spades are not sufficient to open 1S.' },
      { auctionIndex: 1, seat: 'E', text: 'East has seven diamonds but enough honor strength ' +
        'and outside values for a natural overcall rather than a weak jump.' },
      { auctionIndex: 4, seat: 'N', text: 'East’s interference did not cancel South’s forcing ' +
        'one-level 1H response. North can now show four spades at the cheapest level.' },
    ],
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
  //// Negative Double -- Opener shows responder's implied suit
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
      { call: '2H', ruleIds: ['opener-rebid-implied-suit-after-negative-double-minimum'] },
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
      { call: '3H', ruleIds: ['opener-rebid-jump-implied-suit-after-negative-double-medium'] },
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
  //// 1NT opening -- Opener after responder bids over interference
  {
    description: '1NT-(DONT 2H)-2NT-(Pass)-3NT: a maximum 1NT opener accepts responder’s natural ' +
                 'invitation with both DONT majors stopped.',
    practiceAuction: ['1NT', '2H', '2NT', 'Pass', '3NT'],
    expectedOvercallCalls: [{ call: '2H', ruleIds: ['overcall-dont-majors'] }],
    expectedOpeningCalls: [{ call: '1NT', ruleIds: ['open-1nt-balanced-15-17'] }],
    expectedResponseCalls: [
      { call: '2NT', ruleIds: ['respond-after-dont-majors-2nt'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '3NT', ruleIds: ['opener-rebid-3nt-after-1nt-2nt-invitation'] },
    ],
    north: { S: 'A62', H: 'K43', D: 'AQ4', C: 'A853' },
    east: { S: 'T953', H: 'AQ765', D: 'T98', C: 'K' },
    south: { S: 'KQ4', H: 'JT98', D: 'J52', C: 'J76' },
    west: { S: 'J87', H: '2', D: 'K763', C: 'QT942' },
  },
  {
    description: '1NT-(DONT 2H)-3NT-(Pass)-Pass: responder’s natural game signoff keeps its ordinary ' +
                 'meaning after the selected interference.',
    practiceAuction: ['1NT', '2H', '3NT', 'Pass', 'Pass'],
    expectedOvercallCalls: [{ call: '2H', ruleIds: ['overcall-dont-majors'] }],
    expectedOpeningCalls: [{ call: '1NT', ruleIds: ['open-1nt-balanced-15-17'] }],
    expectedResponseCalls: [
      { call: '3NT', ruleIds: ['respond-after-dont-majors-3nt'] },
    ],
    expectedOpenerRebidCalls: [
      { call: 'Pass', ruleIds: ['opener-rebid-pass-after-nt-natural-nt-signoff'] },
    ],
    north: { S: 'A62', H: 'K43', D: 'AQ4', C: 'A853' },
    east: { S: 'T953', H: 'AQ765', D: 'T98', C: 'K' },
    south: { S: 'KQ4', H: 'JT98', D: 'K52', C: 'J76' },
    west: { S: 'J87', H: '2', D: 'J763', C: 'QT942' },
  },
  //// One-level suit opening -- Opener after responder acts in competition
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
    west: { S: '542', H: '853', D: '2', C: 'KQJT64' },
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
    west: { S: '543', H: '853', D: 'K6542', C: '72' },
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
    west: { S: '53', H: '8743', D: 'JT2', C: 'AKT2' },
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
    west: { S: '53', H: '8743', D: 'JT2', C: 'AKT2' },
  },
  //// Opener after advancer raises or bids naturally
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
    description: '1D-(1S)-Double-(2S)-3D: after advancer raises, a minimum opener without the ' +
                 'implied heart fit can still describe a six-card diamond suit.',
    dealer: 'W',
    practiceAuction: ['1D', '1S', 'Double', '2S', '3D'],
    expectedOpeningCalls: [{ call: '1D', ruleIds: ['open-convenient-minor'] }],
    expectedOvercallCalls: [{ call: '1S', ruleIds: ['overcall-simple-suit-at-one-level'] }],
    expectedResponseCalls: [{ call: 'Double', ruleIds: ['respond-over-suit-negative-double'] }],
    expectedAdvanceCalls: [
      { call: '2S', ruleIds: ['advance-one-level-suit-overcall-after-negative-double-simple-raise'] },
    ],
    expectedOpenerRebidCalls: [
      { call: '3D', ruleIds: ['opener-rebid-repeat-opening-suit-after-negative-double'] },
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
      { call: '3H', ruleIds: ['opener-rebid-implied-suit-after-negative-double-competition-medium'] },
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
  {
    description: '1H-(1S)-2H-(3C)-Pass: advancer introduces a natural suit, but a minimum opener ' +
                 'can still defend rather than manufacture another heart bid.',
    dealer: 'W',
    practiceAuction: ['1H', '1S', '2H', '3C', 'Pass'],
    expectedOpeningCalls: [{ call: '1H', ruleIds: ['open-five-card-major'] }],
    expectedOvercallCalls: [{ call: '1S', ruleIds: ['overcall-simple-suit-at-one-level'] }],
    expectedResponseCalls: [
      { call: '2H', ruleIds: ['respond-to-major-w/-support-simple-raise'] },
    ],
    expectedAdvanceCalls: [{ call: '3C', ruleIds: [
      'advance-one-level-suit-overcall-after-responder-raise-new-suit-three-level',
    ] }],
    expectedOpenerRebidCalls: [
      { call: 'Pass', ruleIds: ['opener-rebid-pass-after-major-simple-raise'] },
    ],
    west: { S: 'K72', H: 'AQ964', D: 'K53', C: '83' },
    north: { S: 'QJT86', H: 'J72', D: '8', C: 'A964' },
    east: { S: '543', H: '853', D: 'Q7642', C: 'K2' },
    south: { S: 'A9', H: 'KT', D: 'AJT9', C: 'QJT75' },
  },
  {
    description: '1D-(1S)-2D-(Double)-Pass: a responsive Double does not force a minimum opener ' +
                 'to compete again.',
    dealer: 'W',
    practiceAuction: ['1D', '1S', '2D', 'Double', 'Pass'],
    expectedOpeningCalls: [{ call: '1D', ruleIds: ['open-convenient-minor'] }],
    expectedOvercallCalls: [{ call: '1S', ruleIds: ['overcall-simple-suit-at-one-level'] }],
    expectedResponseCalls: [{ call: '2D', ruleIds: ['respond-to-minor-w/-raise-to-two'] }],
    expectedAdvanceCalls: [{ call: 'Double', ruleIds: [
      'advance-one-level-suit-overcall-after-responder-raise-responsive-double',
    ] }],
    expectedOpenerRebidCalls: [
      { call: 'Pass', ruleIds: ['opener-rebid-pass-after-minor-simple-raise'] },
    ],
    west: { S: 'K72', H: 'A43', D: 'AQJ74', C: '83' },
    north: { S: 'AQJ86', H: '762', D: '8', C: 'K964' },
    east: { S: '543', H: '985', D: '6532', C: 'AQ2' },
    south: { S: 'T9', H: 'KQJT', D: 'KT9', C: 'JT75' },
  },
  {
    description: '1H-(Double)-2H-(Double)-Pass: 2H remains a defensible cautious raise ' +
                 'with six weak trumps after the takeout Double; advancer’s responsive ' +
                 'Double asks for a strain, and minimum opener Passes.',
    dealer: 'W',
    practiceAuction: ['1H', 'Double', '2H', 'Double', 'Pass'],
    practiceGuidance: [{ auctionIndex: 2, seat: 'E', text: '3H would be a WEAK ' +
      'preemptive jump raise in this competitive auction, not a strong limit raise. ' +
      'With six low hearts but limited tricks outside trumps, a cautious 2H is also ' +
      'defensible; vulnerability and playing strength affect the judgment.' }],
    expectedOpeningCalls: [{ call: '1H', ruleIds: ['open-five-card-major'] }],
    expectedOvercallCalls: [{ call: 'Double', ruleIds: [
      'overcall-takeout-double-with-unbid-suit-support',
    ] }],
    expectedResponseCalls: [
      { call: '2H', ruleIds: ['respond-to-major-w/-support-simple-raise'] },
    ],
    expectedAdvanceCalls: [{ call: 'Double', ruleIds: [
      'advance-takeout-double-after-responder-raise-responsive-double',
    ] }],
    expectedOpenerRebidCalls: [
      { call: 'Pass', ruleIds: ['opener-rebid-pass-after-major-simple-raise'] },
    ],
    west: { S: 'K72', H: 'AKT96', D: 'Q53', C: '54' },
    north: { S: 'A984', H: '2', D: 'KJ82', C: 'K976' },
    east: { S: '53', H: 'J87543', D: '64', C: 'AJ2' },
    south: { S: 'QJT6', H: 'Q', D: 'AT97', C: 'QT83' },
  },
  //// Forcing natural response with further advancer competition
  {
    description: '1C-(1D)-1H-(1S)-Pass: responder’s one-level heart bid was forcing, but ' +
                 'advancer’s natural spade bid removes the obligation to manufacture a rebid ' +
                 'when a minimum opener has no selected descriptive continuation.',
    dealer: 'W', practiceAuction: ['1C', '1D', '1H', '1S', 'Pass'],
    expectedOpeningCalls: [{ call: '1C', ruleIds: ['open-convenient-minor'] }],
    expectedOvercallCalls: [{ call: '1D', ruleIds: ['overcall-simple-suit-at-one-level'] }],
    expectedResponseCalls: [{ call: '1H', ruleIds: ['respond-over-suit-new-suit-one-level'] }],
    expectedAdvanceCalls: [{ call: '1S', ruleIds: [
      'advance-suit-overcall-after-responder-natural-action-new-suit-one-level',
    ] }],
    expectedOpenerRebidCalls: [{ call: 'Pass', ruleIds: [
      'opener-rebid-pass-after-forcing-response-advancer-competition-minimum',
    ] }],
    west: { S: '9753', H: 'A7', D: 'AJ', C: 'AJ943' },
    north: { S: 'KQ', H: '843', D: 'KT8754', C: '72' },
    east: { S: 'T', H: 'KJT95', D: 'Q932', C: 'K86' },
    south: { S: 'AJ8642', H: 'Q62', D: '6', C: 'QT5' },
  },
  {
    description: '1H-(1S)-2C-(2D)-3C: responder’s competitive 2C promises five or more clubs, ' +
                 'so three-card opener support is enough to raise naturally after advancer bids.',
    dealer: 'W', practiceAuction: ['1H', '1S', '2C', '2D', '3C'],
    expectedOpeningCalls: [{ call: '1H', ruleIds: ['open-five-card-major'] }],
    expectedOvercallCalls: [{ call: '1S', ruleIds: ['overcall-simple-suit-at-one-level'] }],
    expectedResponseCalls: [{ call: '2C', ruleIds: ['respond-over-suit-new-suit-two-level'] }],
    expectedAdvanceCalls: [{ call: '2D', ruleIds: [
      'advance-suit-overcall-after-responder-natural-action-new-suit-two-level',
    ] }],
    expectedOpenerRebidCalls: [{ call: '3C', ruleIds: [
      'opener-rebid-support-after-forcing-response-advancer-competition',
    ] }],
    west: { S: 'T', H: 'AJ854', D: 'QJ52', C: 'KT6' },
    north: { S: 'KQJ96', H: '9732', D: 'K86', C: '2' },
    east: { S: '8432', H: 'KQ6', D: 'A', C: 'J9874' },
    south: { S: 'A75', H: 'T', D: 'T9743', C: 'AQ53' },
  },
  {
    description: '1H-(2D)-2S-(3D)-3S: responder’s forcing 2S promises five or more spades, so ' +
                 'opener can support with three cards at the cheapest level advancer leaves.',
    dealer: 'W', practiceAuction: ['1H', '2D', '2S', '3D', '3S'],
    expectedOpeningCalls: [{ call: '1H', ruleIds: ['open-five-card-major'] }],
    expectedOvercallCalls: [{ call: '2D', ruleIds: ['overcall-simple-suit-at-two-level'] }],
    expectedResponseCalls: [{ call: '2S', ruleIds: ['respond-over-suit-new-suit-two-level'] }],
    expectedAdvanceCalls: [{ call: '3D', ruleIds: [
      'advance-two-level-suit-overcall-after-responder-natural-action-simple-raise',
    ] }],
    expectedOpenerRebidCalls: [{ call: '3S', ruleIds: [
      'opener-rebid-support-after-forcing-response-advancer-competition',
    ] }],
    west: { S: 'K832', H: 'AQJ74', D: 'AT', C: '95' },
    north: { S: 'AQT', H: '62', D: 'KQJ985', C: '73' },
    east: { S: 'J9764', H: '85', D: '4', C: 'AKQ64' },
    south: { S: '5', H: 'KT93', D: '7632', C: 'JT82' },
  },
  {
    description: '1C-(Double)-1H-(1S)-1NT: the one-level heart response remains forcing, and a ' +
                 'minimum balanced opener can still make the original natural 1NT rebid when ' +
                 'the opponents’ natural spade suit is stopped.',
    dealer: 'W', practiceAuction: ['1C', 'Double', '1H', '1S', '1NT'],
    expectedOpeningCalls: [{ call: '1C', ruleIds: ['open-convenient-minor'] }],
    expectedOvercallCalls: [{ call: 'Double', ruleIds: [
      'overcall-takeout-double-with-unbid-suit-support',
    ] }],
    expectedResponseCalls: [{ call: '1H', ruleIds: ['respond-after-double-new-suit-one-level'] }],
    expectedAdvanceCalls: [{ call: '1S', ruleIds: [
      'advance-takeout-double-after-responder-natural-action-new-suit-one-level',
    ] }],
    expectedOpenerRebidCalls: [{ call: '1NT', ruleIds: [
      'opener-rebid-nt-after-forcing-response-advancer-competition',
    ] }],
    west: { S: 'AK', H: 'T96', D: 'KT4', C: 'A9874' },
    north: { S: 'QT8', H: 'A54', D: 'A9876', C: 'Q2' },
    east: { S: 'J3', H: 'Q8732', D: 'QJ', C: 'KJ65' },
    south: { S: '976542', H: 'KJ', D: '532', C: 'T3' },
  },
  //// Negative Double with additional competitive contexts
  {
    description: '1H-(1S)-Double-(Pass)-2C: with both majors already named, responder’s negative ' +
                 'Double implies the minors and opener shows a four-card club fit economically.',
    dealer: 'W', practiceAuction: ['1H', '1S', 'Double', 'Pass', '2C'],
    expectedOpeningCalls: [{ call: '1H', ruleIds: ['open-five-card-major'] }],
    expectedOvercallCalls: [{ call: '1S', ruleIds: ['overcall-simple-suit-at-one-level'] }],
    expectedResponseCalls: [{ call: 'Double', ruleIds: ['respond-over-suit-negative-double'] }],
    expectedAdvanceCalls: [{ call: 'Pass', ruleIds: [
      'advance-suit-overcall-after-negative-double-pass',
    ] }],
    expectedOpenerRebidCalls: [{ call: '2C', ruleIds: [
      'opener-rebid-implied-suit-after-negative-double-minimum',
    ] }],
    west: { S: '2', H: 'AKJ84', D: 'K73', C: 'Q862' },
    north: { S: 'AQT965', H: '732', D: 'A8', C: 'J5' },
    east: { S: '874', H: 'Q6', D: 'QJ95', C: 'AKT4' },
    south: { S: 'KJ3', H: 'T95', D: 'T642', C: '973' },
  },
  {
    description: '1D-(1S)-Double-(2D)-2H: advancer’s strong support cuebid does not erase the ' +
                 'cheap heart fit responder’s negative Double already showed.',
    dealer: 'W', practiceAuction: ['1D', '1S', 'Double', '2D', '2H'],
    expectedOpeningCalls: [{ call: '1D', ruleIds: ['open-convenient-minor'] }],
    expectedOvercallCalls: [{ call: '1S', ruleIds: ['overcall-simple-suit-at-one-level'] }],
    expectedResponseCalls: [{ call: 'Double', ruleIds: ['respond-over-suit-negative-double'] }],
    expectedAdvanceCalls: [{ call: '2D', ruleIds: [
      'advance-suit-overcall-after-negative-double-support-cuebid',
    ] }],
    expectedOpenerRebidCalls: [{ call: '2H', ruleIds: [
      'opener-rebid-implied-suit-after-negative-double-competition-minimum',
    ] }],
    west: { S: '43', H: 'AQ84', D: 'AJ742', C: 'Q8' },
    north: { S: 'AKJT86', H: '32', D: 'T5', C: 'J76' },
    east: { S: '75', H: 'JT96', D: 'Q93', C: 'KT95' },
    south: { S: 'Q92', H: 'K75', D: 'K86', C: 'A432' },
  },
  {
    description: '1C-(1S)-Double-(2D)-2H: advancer can introduce a natural side suit, while ' +
                 'opener still shows responder’s implied four-card heart fit economically.',
    dealer: 'W', practiceAuction: ['1C', '1S', 'Double', '2D', '2H'],
    expectedOpeningCalls: [{ call: '1C', ruleIds: ['open-convenient-minor'] }],
    expectedOvercallCalls: [{ call: '1S', ruleIds: ['overcall-simple-suit-at-one-level'] }],
    expectedResponseCalls: [{ call: 'Double', ruleIds: ['respond-over-suit-negative-double'] }],
    expectedAdvanceCalls: [{ call: '2D', ruleIds: [
      'advance-suit-overcall-after-negative-double-new-suit-two-level',
    ] }],
    expectedOpenerRebidCalls: [{ call: '2H', ruleIds: [
      'opener-rebid-implied-suit-after-negative-double-competition-minimum',
    ] }],
    west: { S: '43', H: 'KQ84', D: 'Q3', C: 'AJ742' },
    north: { S: 'AKJT86', H: '932', D: '752', C: '6' },
    east: { S: '75', H: 'AJT6', D: 'J94', C: 'KT95' },
    south: { S: 'Q92', H: '75', D: 'AKT86', C: 'Q83' },
  },
  {
    description: '1D-(1S)-Double-(3S)-Pass: advancer’s preemptive raise consumes the cheap ' +
                 'continuations, so a minimum opener without an implied fit or other selected ' +
                 'description can Pass and leave responder another turn.',
    dealer: 'W', practiceAuction: ['1D', '1S', 'Double', '3S', 'Pass'],
    expectedOpeningCalls: [{ call: '1D', ruleIds: ['open-convenient-minor'] }],
    expectedOvercallCalls: [{ call: '1S', ruleIds: ['overcall-simple-suit-at-one-level'] }],
    expectedResponseCalls: [{ call: 'Double', ruleIds: ['respond-over-suit-negative-double'] }],
    expectedAdvanceCalls: [{ call: '3S', ruleIds: [
      'advance-one-level-suit-overcall-after-negative-double-preemptive-raise',
    ] }],
    expectedOpenerRebidCalls: [{ call: 'Pass', ruleIds: [
      'opener-rebid-pass-after-negative-double-competition-minimum',
    ] }],
    west: { S: '74', H: 'KQ3', D: 'AJT86', C: 'Q82' },
    north: { S: 'AKJT9', H: '76', D: 'K4', C: 'J965' },
    east: { S: 'Q3', H: 'AJT8', D: 'Q93', C: 'KT74' },
    south: { S: '8652', H: '9542', D: '752', C: 'A3' },
  },
  //// Natural notrump response -- Selected opener continuation
  {
    description: '1D-(1S)-1NT-(Pass)-Pass: responder’s 1NT is natural, balanced, and stopped; ' +
                 'a minimum semi-balanced opener can leave the contract there.',
    practiceAuction: ['1D', '1S', '1NT', 'Pass', 'Pass'],
    expectedOpeningCalls: [{ call: '1D', ruleIds: ['open-convenient-minor'] }],
    expectedOvercallCalls: [{ call: '1S', ruleIds: ['overcall-simple-suit-at-one-level'] }],
    expectedResponseCalls: [{ call: '1NT', ruleIds: ['respond-over-suit-natural-notrump'] }],
    expectedAdvanceCalls: [{ call: 'Pass', ruleIds: [
      'advance-suit-overcall-after-responder-natural-action-pass',
    ] }],
    expectedOpenerRebidCalls: [{ call: 'Pass', ruleIds: [
      'opener-rebid-pass-after-overcall-natural-1nt-minimum',
    ] }],
    north: { S: '872', H: 'A43', D: 'AKJ74', C: 'Q3' },
    east: { S: 'AQJ96', H: '762', D: '8', C: 'K964' },
    south: { S: 'KT5', H: 'QJ8', D: 'Q95', C: 'JT85' },
    west: { S: '43', H: 'KT95', D: 'T632', C: 'A72' },
  },
  //// Game-forcing three-level response after a suit overcall
  {
    description: '1H-(2D)-3C-(Pass)-3NT: responder’s three-level club bid is game forcing, ' +
                 'and a balanced opener with the diamond stopper can place the contract in 3NT.',
    practiceAuction: ['1H', '2D', '3C', 'Pass', '3NT'],
    expectedOpeningCalls: [{ call: '1H', ruleIds: ['open-five-card-major'] }],
    expectedOvercallCalls: [{ call: '2D', ruleIds: ['overcall-simple-suit-at-two-level'] }],
    expectedResponseCalls: [{ call: '3C', ruleIds: [
      'respond-over-suit-new-suit-three-level',
    ] }],
    expectedAdvanceCalls: [{ call: 'Pass', ruleIds: [
      'advance-suit-overcall-after-responder-natural-action-pass',
    ] }],
    expectedOpenerRebidCalls: [{ call: '3NT', ruleIds: [
      'opener-rebid-3nt-after-overcall-three-level-forcing-response',
    ] }],
    north: { S: 'K83', H: 'AJ874', D: 'AT4', C: '95' },
    east: { S: 'AQT', H: '62', D: 'KQJ985', C: '73' },
    south: { S: 'J97', H: 'KT', D: '632', C: 'AKQ84' },
    west: { S: '6542', H: 'Q953', D: '7', C: 'JT62' },
  },
  //// 1NT opening -- Selected responses after DONT (2H shows both majors).
  // Natural minor responses and stopped notrump are selected; an unagreed Double
  // or spade cuebid does not masquerade as a natural takeout action.
  {
    description: '1NT-(DONT 2H)-3C-(Pass)-3NT: a constructive club suit, not a ' +
                 'spade takeout Double, leads opener to game with both major stoppers.',
    practiceAuction: ['1NT', '2H', '3C', 'Pass', '3NT'],
    expectedOvercallCalls: [{ call: '2H', ruleIds: ['overcall-dont-majors'] }],
    expectedOpeningCalls: [{ call: '1NT', ruleIds: ['open-1nt-balanced-15-17'] }],
    expectedResponseCalls: [{ call: '3C', ruleIds: [
      'respond-after-dont-majors-natural-minor',
    ] }],
    expectedOpenerRebidCalls: [{ call: '3NT', ruleIds: [
      'opener-rebid-3nt-after-1nt-interference-natural-suit',
    ] }],
    north: { S: 'AK62', H: 'K53', D: 'AQ4', C: '853' },
    east: { S: 'JT74', H: 'AQJT9', D: 'JT9', C: '2' },
    south: { S: 'Q85', H: '72', D: 'K83', C: 'KQ974' },
    west: { S: '93', H: '864', D: '7652', C: 'AJT6' },
  },
  {
    description: '1NT-(DONT 2H)-3D-(Pass)-3NT: a good long minor and 10+ HCP ' +
                 'allow a constructive natural response; opener stops both majors.',
    practiceAuction: ['1NT', '2H', '3D', 'Pass', '3NT'],
    expectedOvercallCalls: [{ call: '2H', ruleIds: ['overcall-dont-majors'] }],
    expectedOpeningCalls: [{ call: '1NT', ruleIds: ['open-1nt-balanced-15-17'] }],
    expectedResponseCalls: [{ call: '3D', ruleIds: [
      'respond-after-dont-majors-natural-minor',
    ] }],
    expectedOpenerRebidCalls: [{ call: '3NT', ruleIds: [
      'opener-rebid-3nt-after-1nt-interference-natural-suit',
    ] }],
    north: { S: 'A62', H: 'K53', D: 'A853', C: 'AQ4' },
    east: { S: 'J874', H: 'AQJT9', D: '2', C: 'JT9' },
    south: { S: 'QT5', H: '72', D: 'KQT974', C: 'K3' },
    west: { S: 'K93', H: '864', D: 'J6', C: '87652' },
  },
  {
    description: '1NT-(DONT 2H)-3C-(Pass)-Pass: constructive natural clubs ' +
                 'can be passed by a minimum opener missing the heart stopper.',
    practiceAuction: ['1NT', '2H', '3C', 'Pass', 'Pass'],
    expectedOvercallCalls: [{ call: '2H', ruleIds: ['overcall-dont-majors'] }],
    expectedOpeningCalls: [{ call: '1NT', ruleIds: ['open-1nt-balanced-15-17'] }],
    expectedResponseCalls: [{ call: '3C', ruleIds: [
      'respond-after-dont-majors-natural-minor',
    ] }],
    expectedOpenerRebidCalls: [{ call: 'Pass', ruleIds: [
      'opener-rebid-pass-after-1nt-interference-natural-suit',
    ] }],
    north: { S: 'AK853', H: '53', D: 'A42', C: 'A62' },
    east: { S: 'QJT9', H: 'AQJT8', D: '985', C: '4' },
    south: { S: '64', H: 'K94', D: 'Q76', C: 'KQJT8' },
    west: { S: '72', H: '762', D: 'KJT3', C: '9753' },
  },
  {
    description: '1NT-(DONT 2H)-3D-(Pass)-3NT: a maximum opener ' +
                 'with both major stoppers chooses game after a good natural minor.',
    practiceAuction: ['1NT', '2H', '3D', 'Pass', '3NT'],
    expectedOvercallCalls: [{ call: '2H', ruleIds: ['overcall-dont-majors'] }],
    expectedOpeningCalls: [{ call: '1NT', ruleIds: ['open-1nt-balanced-15-17'] }],
    expectedResponseCalls: [{ call: '3D', ruleIds: [
      'respond-after-dont-majors-natural-minor',
    ] }],
    expectedOpenerRebidCalls: [{ call: '3NT', ruleIds: [
      'opener-rebid-3nt-after-1nt-interference-natural-suit',
    ] }],
    north: { S: 'A853', H: 'K53', D: 'A62', C: 'AQ4' },
    east: { S: 'QJT9', H: 'AQJT8', D: '4', C: '985' },
    south: { S: 'K64', H: '94', D: 'KQJT8', C: 'J76' },
    west: { S: '72', H: '762', D: '9753', C: 'KT32' },
  },
  {
    description: '1NT-(DONT 2H)-3C-(Pass)-3NT: responder is constructive with good clubs ' +
                 'and 10+ HCP, and opener has the stoppers in both DONT majors.',
    practiceAuction: ['1NT', '2H', '3C', 'Pass', '3NT'],
    expectedOvercallCalls: [{ call: '2H', ruleIds: ['overcall-dont-majors'] }],
    expectedOpeningCalls: [{ call: '1NT', ruleIds: ['open-1nt-balanced-15-17'] }],
    expectedResponseCalls: [{ call: '3C', ruleIds: [
      'respond-after-dont-majors-natural-minor',
    ] }],
    expectedOpenerRebidCalls: [{ call: '3NT', ruleIds: [
      'opener-rebid-3nt-after-1nt-interference-natural-suit',
    ] }],
    north: { S: 'A62', H: 'K53', D: 'AQ4', C: 'A853' },
    east: { S: 'J953', H: 'AQJT9', D: 'JT9', C: 'T' },
    south: { S: 'K84', H: '72', D: 'K86', C: 'KQJ76' },
    west: { S: 'QT7', H: '864', D: '7532', C: '942' },
  },

  //// After a preemptive jump overcall -- Selected opener rebids
  // Responder acts over a jump overcall; opener makes the first selected continuation.
  {
    description: '1H-(2S)-3H-(Pass)-Pass: a minimum opener accepts responder\'s nonforcing ' +
                 'three-level raise rather than pushing to game.',
    practiceAuction: ['1H', '2S', '3H', 'Pass', 'Pass'],
    expectedResponseCalls: [{ call: '3H', ruleIds: ['respond-over-jump-raise-cheapest-to-three'] }],
    expectedOpenerRebidCalls: [{ call: 'Pass', ruleIds: [
      'opener-rebid-after-jump-overcall-nonforcing-pass',
    ] }],
    north: { S: '872', H: 'AKT96', D: 'AQ3', C: '54' },
    east: { S: 'AQJ965', H: '43', D: '84', C: 'T97' },
    south: { S: 'T4', H: '752', D: 'KJ952', C: 'A62' },
    west: { S: 'K3', H: 'QJ8', D: 'T76', C: 'KQJ83' },
  },
  {
    description: '1C-(2D)-2S-(Pass)-3S: responder\'s forcing five-card spade suit ' +
                 'needs only three-card opener support to establish a fit.',
    practiceAuction: ['1C', '2D', '2S', 'Pass', '3S'],
    expectedResponseCalls: [{ call: '2S', ruleIds: ['respond-over-jump-new-suit-two-level'] }],
    expectedOpenerRebidCalls: [{ call: '3S', ruleIds: [
      'opener-rebid-after-jump-overcall-natural-suit',
    ] }],
    north: { S: 'K72', H: 'A43', D: '83', C: 'AQJ74' },
    east: { S: '84', H: 'T65', D: 'KQJT97', C: '92' },
    south: { S: 'AJ963', H: 'K87', D: '42', C: 'K86' },
    west: { S: 'QT5', H: 'QJ92', D: 'A65', C: 'T53' },
  },
  {
    description: '1S-(3H)-Double-(Pass)-3S: without a four-card minor fit, opener ' +
                 'can repeat six spades instead of inventing a negative-Double fit.',
    practiceAuction: ['1S', '3H', 'Double', 'Pass', '3S'],
    expectedResponseCalls: [{ call: 'Double', ruleIds: ['respond-over-jump-negative-double'] }],
    expectedOpenerRebidCalls: [{ call: '3S', ruleIds: [
      'opener-rebid-after-jump-overcall-natural-suit',
    ] }],
    north: { S: 'AKJ754', H: '82', D: 'AQ3', C: '65' },
    east: { S: '83', H: 'QJT9765', D: '87', C: 'A2' },
    south: { S: '6', H: 'A43', D: 'KT942', C: 'KQ43' },
    west: { S: 'QT92', H: 'K', D: 'J65', C: 'JT987' },
  },
  {
    description: '1H-(2S)-3S-(Pass)-4H: the support cuebid shows hearts, not ' +
                 'spades; opener returns directly to major game.',
    practiceAuction: ['1H', '2S', '3S', 'Pass', '4H'],
    expectedResponseCalls: [{ call: '3S', ruleIds: [
      'respond-over-jump-support-cuebid-major',
    ] }],
    expectedOpenerRebidCalls: [{ call: '4H', ruleIds: [
      'opener-rebid-after-jump-overcall-major-game',
    ] }],
    practiceGuidance: [{ auctionIndex: 4, seat: 'N',
      text: 'South cuebid East\'s spades artificially to promise heart support. ' +
            'North places the partnership in the agreed heart game.' }],
    north: { S: '872', H: 'AKT96', D: 'AQ3', C: '54' },
    east: { S: 'AQJ965', H: '43', D: '84', C: 'T97' },
    south: { S: '4', H: 'Q752', D: 'KJ92', C: 'AKQJ' },
    west: { S: 'KT3', H: 'J8', D: 'T765', C: '8632' },
  },
  {
    description: '1H-(2S)-2NT-(Pass)-Pass: responder has 11 balanced HCP, no heart fit, ' +
                 'a spade stopper, and no qualifying negative Double; minimum opener declines the invitation.',
    practiceAuction: ['1H', '2S', '2NT', 'Pass', 'Pass'],
    expectedResponseCalls: [{ call: '2NT', ruleIds: [
      'respond-over-jump-natural-notrump',
    ] }],
    expectedOpenerRebidCalls: [{ call: 'Pass', ruleIds: [
      'opener-rebid-after-jump-overcall-nonforcing-pass',
    ] }],
    north: { S: '872', H: 'AKT96', D: 'AQ3', C: '54' },
    east: { S: 'AQJ965', H: '43', D: '4', C: 'JT97' },
    south: { S: 'KT4', H: 'Q2', D: 'K9768', C: 'K62' },
    west: { S: '3', H: 'J758', D: 'JT52', C: 'AQ83' },
  },
  {
    description: '1H-(2S)-3C-(Pass)-3NT: game-forcing natural clubs opposite a ' +
                 'balanced opener with a spade stopper make 3NT a descriptive game.',
    practiceAuction: ['1H', '2S', '3C', 'Pass', '3NT'],
    expectedResponseCalls: [{ call: '3C', ruleIds: [
      'respond-over-jump-new-suit-three-level',
    ] }],
    expectedOpenerRebidCalls: [{ call: '3NT', ruleIds: [
      'opener-rebid-after-jump-overcall-natural-nt',
    ] }],
    north: { S: 'A3', H: 'AKT96', D: 'Q84', C: '754' },
    east: { S: 'KQJ965', H: '43', D: 'K6', C: 'T86' },
    south: { S: 'T7', H: 'Q7', D: 'AJ92', C: 'KQJ93' },
    west: { S: '842', H: 'J852', D: 'T753', C: 'A2' },
  },
  {
    description: '1S-(3H)-Double-(Pass)-4C: opener has four clubs, so the negative ' +
                 'Double finds an economical minor fit even though the call is at level four.',
    practiceAuction: ['1S', '3H', 'Double', 'Pass', '4C'],
    expectedResponseCalls: [{ call: 'Double', ruleIds: ['respond-over-jump-negative-double'] }],
    expectedOpenerRebidCalls: [{ call: '4C', ruleIds: [
      'opener-rebid-after-jump-overcall-natural-suit',
    ] }],
    north: { S: 'AKJ75', H: '82', D: '63', C: 'KQ72' },
    east: { S: '83', H: 'QJT9765', D: 'K7', C: 'T4' },
    south: { S: 'Q64', H: 'A3', D: 'AQT4', C: 'AJ93' },
    west: { S: 'T92', H: 'K4', D: 'J9852', C: '865' },
  },
];
