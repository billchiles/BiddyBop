/// Public bidding rule arrays and shared teaching notes.
/// Stage-specific rule declarations and refiners are in their corresponding modules.

import type { BidRule } from './bidding-types';

export { OpeningBidRules } from './opening-rules';
export { ResponseBidRules } from './responding-rules';
export { OpenerRebidRules } from './opener-rebidding-rules';
export { ResponderRebidRules } from './responder-rebidding-rules';
export { OvercallRules } from './overcalling-rules';
export { AdvanceRules } from './advancing-rules';
///
//// Bidding Notes
///

export const BiddingNotes: BidRule[] = [
  {
    id: 'opening-position-valuation-options',
    // Opening-hand valuation can change by seat, including Rule of 20, lighter third-seat openings,
    // and Rule of 15.
    kind: 'footnote',
    title: 'Opening valuation can vary by seat',
    meaning: 'Guideline of 20 is an alternate first/second-seat valuation; ' +
             'third seat may open lighter; fourth seat may use the Guideline of 15.',
    certainty: 'high',
  },
  //
  {
    id: 'garbage-stayman-note',
    // Weak escape form of Stayman; kept as a teaching note until we decide whether to model it.
    kind: 'footnote',
    title: 'Weak escape use of Stayman',
    auctionContext: { stage: 'responding', auction: ['1NT'], openerStrain: 'NT' },
    meaning: 'With 0-7 points and short clubs, Stayman can be used as an escape, planning to ' +
             'pass opener\'s rebid.',
    guidance: ['Some bidding methods use garbage or crawling Stayman with suitable weak ' +
               'two-major hands.  Weak hands with a five-card major may instead use a transfer ' +
               'and pass.'],
    certainty: 'high',
  },
  //
  {
    id: 'minor-relay-over-1nt-note',
    // Teaching note for the optional 2S relay to 3C used to escape into a long minor.
    kind: 'footnote',
    title: 'Optional 2S relay to 3C over 1NT',
    auctionContext: { stage: 'responding', auction: ['1NT'], openerStrain: 'NT' },
    meaning: 'Some partnerships use 2S as a relay asking opener to bid 3C with a long minor; ' +
             'responder can pass clubs or correct to diamonds.',
    certainty: 'high',
  },
  //
  {
    id: 'gambling-3nt-note',
    // Teaching note for the optional Gambling 3NT opening treatment with a solid long minor.
    kind: 'footnote',
    title: 'Gambling 3NT is an optional opening treatment',
    meaning: 'Some partnerships use a 3NT opening with a solid long minor rather than the ' +
             'ordinary opening structure.',
    certainty: 'high',
  },
  //
  {
    id: 'pass-usually-no-message',
    // Teaching note that Pass usually does not describe a specific hand and does not prevent later
    // bidding.
    kind: 'concept',
    title: 'Pass usually carries no special bidding message',
    meaning: 'A pass usually does not promise a specific hand type; either partner may bid ' +
             'later as the auction develops.',
    certainty: 'high',
  },
  //
  // {
  //   id: 'valuation-high-card-points',
  //   kind: 'valuation',
  //   title: 'High card point scale',
  //   meaning: 'Ace=4, King=3, Queen=2, Jack=1.',
  //   certainty: 'high',
  // },
  //
  // {
  //   id: 'valuation-distribution-points',
  //   kind: 'valuation',
  //   title: 'Length-based distribution points',
  //   meaning: 'Add distribution points for long suits: five-card suit=1, six-card suit=2, seven-card suit=3, eight-card suit=4.',
  //   certainty: 'high',
  // },
  //
  // {
  //   id: 'opening-one-level-point-range',
  //   kind: 'openingBid',
  //   title: 'Open at the one level with opening values',
  //   auctionContext: { stage: 'opening', auction: [] },
  //   calls: ['1C', '1D', '1H', '1S', '1NT'],
  //   appliesWhen: { totalPoints: { min: 12, max: 21 } },
  //   meaning: 'Open at the one level with about 12-21 total points after adding high-card and distribution points.',
  //   guidance: ['In first or second position, the Guideline of 20 may be an alternative hand-valuation method.', 'Third-position openings may be lighter.', 'Fourth-position openings may use the Guideline of 15.'],
  //   certainty: 'high',
  // },
  //
  // {
  //   id: 'balanced-hand-definition',
  //   kind: 'concept',
  //   title: 'Balanced hand definition',
  //   meaning: 'A balanced hand has no void, no singleton, and at most one doubleton. The listed balanced patterns are 4-3-3-3, 4-4-3-2, and 5-3-3-2.',
  //   certainty: 'high',
  // },
  //
  {
    id: 'minor-response-objective',
    // Teaching priority after a minor opening: look first for a major fit, then notrump, before settling in a minor.
    kind: 'priority',
    title: 'Responder objective after 1C or 1D',
    auctionContext: { stage: 'responding', openerLevel: 1, openerStrain: 'minor' },
    meaning: 'Responder first looks for an eight-card or longer major-suit fit. Major-suit ' +
             'contracts are preferred over minor-suit contracts. Without a major fit, responder ' +
             'next considers notrump. Notrump is generally preferred to minor-suit contracts ' +
             'because 3NT needs fewer tricks than 5C or 5D.',
    certainty: 'high',
  },
  //
  {
    id: 'respond-nt-two-decisions',
    // Teaching note: responder to a notrump opening decides both the final level and the denomination.
    kind: 'concept',
    title: 'Responder decisions over 1NT or 2NT',
    auctionContext: { stage: 'responding', auction: ['1NT'], openerStrain: 'NT' },
    meaning: 'Responder decides how high to bid and where to play: clubs, diamonds, hearts, ' +
             'spades, or notrump.',
    guidance: ['Opener has shown a narrow strength range and a balanced or semi-balanced hand ' +
               'with at least two cards in every suit.'],
    certainty: 'high',
  },
  //
  {
    id: 'nt-opener-rebid-guidance',
    // Teaching note for opener's rebid after a notrump response: respect signoffs, judge
    // invitations by range, and answer forcing bids descriptively.
    kind: 'rebidGuidance',
    title: 'Opener rebid after responder bid over notrump',
    auctionContext: { stage: 'openerRebid', auction: ['1NT'] },
    meaning: 'If responder makes a signoff bid, opener passes. If responder makes an ' +
             'invitational bid, opener passes with a minimum and accepts with a maximum.  If ' +
             'responder makes a forcing bid, opener makes a descriptive rebid.',
    guidance: ['Example: after 1NT-2NT, opener passes with 15-16 and bids 3NT with 17 or a good 16.'],
    certainty: 'high',
  },
];
