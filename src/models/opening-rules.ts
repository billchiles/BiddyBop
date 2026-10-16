/// OpeningBidRules: opening bidding rules.

import { type BidRule } from './bidding-types';
import {
  guidelineOf20Applies, oneNtFiveCardLengthUpgradeApplies, convenientMinorOpeningValuesApply,
  refineOneLevelSuitOpening,
  refinePreemptSuitQuality
} from './opening-functions';


export const OpeningBidRules: BidRule[] = [
  //
  // Opening Pass (fallback only when no opening bid qualifies)
  //
  {
    id: 'open-pass-no-qualifying-action',
    kind: 'openingBid',
    title: 'Pass without a qualifying opening bid',
    auctionContext: { stage: 'opening', auction: [] },
    calls: ['Pass'],
    callCategory: ['signoff'],
    meaning: 'No opening bid qualifies under the chosen opening agreements.',
    guidance: ['Pass rather than manufacture an opening when the hand lacks sufficient ' +
               'strength, distribution, or preemptive suit quality.',
               'Passing now does not prevent bidding on a later turn.'],
    certainty: 'high',
  },
  //
  // Basic one bids
  //
  {
    id: 'open-1nt-balanced-15-17',
    // Normal 1NT, distinguished from 16-18 modern treamtment.
    kind: 'openingBid',
    title: 'Open 1NT with balanced 15-17',
    auctionContext: { stage: 'opening', auction: [] },
    calls: ['1NT'],
    // natural is sentinal: maybeSuppressConvenientMinor() looks for this
    callCategory: ['invitational', 'natural'],
    agreement: { setting: 'oneNtOpening', value: '15-17',
                 note: 'Standard 15-17 balanced 1NT range.' },
    priority: { rank: 100 },
    appliesWhen: { hcp: { min: 15, max: 17 }, shape: { balanced: true },
                   }, //suitLengths: [{ suit: 'H', max: 4 }, { suit: 'S', max: 4 }] },
    meaning: 'Balanced hand in the 1NT range.',
    guidance: ['You can bid 1NT with a 5-card major.',
               'Do not consider a convenient minor when the hand fits a natural 1NT opening; ' +
                  '1NT describes both strength and shape more precisely.', ],
    certainty: 'high',
  },
  //
  {
    id: 'open-1nt-balanced-16-18',
    // Alternate natural 1NT opening for a balanced 16-18 HCP hand.
    kind: 'openingBid',
    title: 'Open 1NT with balanced 16-18',
    auctionContext: { stage: 'opening', auction: [] },
    calls: ['1NT'],
    // natural is sentinal: maybeSuppressConvenientMinor() looks for this
    callCategory: ['invitational', 'natural'],
    agreement: { setting: 'oneNtOpening', value: '16-18',
                 note: 'Alternate 16-18 balanced 1NT range.' },
    priority: { rank: 100 },
    appliesWhen: { hcp: { min: 16, max: 18 }, shape: { balanced: true } },
    meaning: 'Balanced hand in the 1NT range.',
    guidance: ['You can bid 1NT with a 5-card major.',
               'Do not consider a convenient minor when the hand fits a natural 1NT opening; ' +
                  '1NT describes both strength and shape more precisely.', ],
    certainty: 'high',
  },
  //
  {
    id: 'open-1nt-five-card-length-upgrade',
    // Upgrades a balanced hand one HCP with a five-card major by agreement.
    kind: 'openingBid',
    title: 'Upgrade a balanced five-card-major hand into the 1NT range',
    auctionContext: { stage: 'opening', auction: [] },
    calls: ['1NT'],
    // natural is sentinal: maybeSuppressConvenientMinor() looks for this
    callCategory: ['invitational', 'natural'],
    agreement: { setting: 'oneNtFiveCardLengthUpgrade', value: true,
                 note: 'Optional one-point upgrade with a five-card major; off by default.' },
    priority: { rank: 100 },
    appliesWhen: oneNtFiveCardLengthUpgradeApplies,
    meaning: 'Optional five-card-major treatment permits one HCP below the normal 1NT minimum.',
    certainty: 'high',
  },
  //
  {
    id: 'open-five-card-major',
    // Basic 5-card majors, opening points.
    kind: 'openingBid',
    title: 'Open a five-card major',
    auctionContext: { stage: 'opening', auction: [] },
    calls: ['1H', '1S'],
    callRefinement: refineOneLevelSuitOpening, // refines according to guidance below
    callCategory: ['natural'],
    priority: { rank: 90 },
    appliesWhen: { hcp: { max: 21 }, totalPoints: { min: 12 },
                   suitLengths: [ { suit: 'major', min: 5 } ] },
    meaning: 'Open 1H or 1S with a five-card or longer major suit and opening values.',
    guidance: ['With two five-card or longer suits, open the higher-ranking suit.',
               'An eight-card major with ordinary opening values can still be opened at the ' +
                 'one level; do not jump automatically to a four-level preempt.'],
    certainty: 'high',
  },
  //
  {
    id: 'open-convenient-minor',
    // Basic convenient minors for no 1NT and no 5-card major with opening points.
    kind: 'openingBid',
    title: 'Open a convenient minor when no other one-level opening fits',
    auctionContext: { stage: 'opening', auction: [] },
    calls: ['1C', '1D'],
    callRefinement: refineOneLevelSuitOpening,  // refines according to guidance below
    callCategory: ['invitational'],
    priority: { rank: 70 },
    appliesWhen: convenientMinorOpeningValuesApply,
    meaning: 'Open 1C or 1D with nothing else to do. Open 1D with four cards in both minor suits; ' +
             'open 1C with three cards in both minor suits.',
    guidance: ['No natural NT opening.', 'No five-card major.',
               '1C may be three-card or longer.', 'Bid longer suit.',
               'Bid 1D if both minors are four-card.'],
    certainty: 'high',
  },
  //
  {
    id: 'open-guideline-of-20',
    // Guideline of 20 is retained for useful marginal-hand explanation. Under this system's
    // 12-total-point opening treatment (HCP plus length points), every Rule-of-20 hand already
    // qualifies for an ordinary one-level opening: this rule does not uniquely permit any bid.
    // It is a distinct first/second-seat valuation perspective, not a looser third-seat rule.
    kind: 'openingBid',
    title: 'Open a sub-12-HCP hand satisfying the Guideline of 20',
    auctionContext: { stage: 'opening', auction: [] },
    calls: ['1C', '1D', '1H', '1S'],
    callRefinement: refineOneLevelSuitOpening, // can't declaratively say which to choose
    callCategory: ['invitational'], // can't be natural because of convenient minors
    appliesWhen: guidelineOf20Applies,
    meaning: 'HCP plus the lengths of the two longest suits is at least 20.',
    guidance: ['Use as an alternate opening-hand valuation in first or second seat.'],
    certainty: 'high',
  },
  //
  // Strong bids
  //
  {
    id: 'open-2nt-balanced-20-21',
    // Natural strong 2NT opening for a balanced 20-21 HCP hand.
    kind: 'openingBid',
    title: 'Open 2NT with balanced 20-21',
    auctionContext: { stage: 'opening', auction: [] },
    calls: ['2NT'],
    // natural is sentinal: maybeSuppressConvenientMinor() looks for this
    callCategory: ['invitational', 'natural'],
    priority: { rank: 100 },
    appliesWhen: { hcp: { min: 20, max: 21 }, shape: { balanced: true } },
    guidance: ['Do not consider a convenient minor when the hand fits the natural 2NT opening; ' +
                  '2NT describes both strength and shape more precisely.', ],
    meaning: 'Strong balanced opening showing 20-21 points.',
    certainty: 'high',
  },
  //
  {
    id: 'open-2c-strong-artificial',
    // Artificial forcing 2C opening for very strong hands.
    kind: 'openingBid',
    title: 'Open 2C with strong artificial opening values',
    auctionContext: { stage: 'opening', auction: [] },
    calls: ['2C'],
    callCategory: ['forcing', 'conventional'],
    appliesWhen: { hcp: { min: 22 } },
    guidance: ['Use 22+ HCP for the artificial strong 2C opening.  Highly distributional hands ' +
               'can be awkward to describe later and can lead to a less suitable final contract.  ' +
               'This app does not lower the 2C HCP threshold by counting playing tricks.'],
    meaning: 'Strong artificial and forcing opening; absent interference, partner must respond.',
    certainty: 'high',
  },
  //
  // Weak bids
  //
  {
    id: 'open-weak-two',
    // Preemptive 2D/2H/2S opening for a weak hand with a six-card suit.
    kind: 'openingBid',
    title: 'Open weak two bid',
    auctionContext: { stage: 'opening', auction: [] },
    calls: ['2D', '2H', '2S'],
    callRefinement: refinePreemptSuitQuality,
    callCategory: ['natural'],
    appliesWhen: { hcp: { min: 5, max: 10 }, suitLengths: [{ exact: 6 }] },
    guidance: ['A good suit has at least two of A/K/Q or at least three of A/K/Q/J/T.',
               'Think in playing tricks as well as HCP: roughly five playing tricks is a useful ' +
                 'non-vulnerable target; vulnerable preempts should generally be sounder.',
               'Going down vulnerable can give the opponents enough penalty points that the ' +
                 'sacrifice is not worthwhile; vulnerability is guidance-only in this app.'],
    meaning: 'Descriptive and obstructive weak two-bid with exactly six cards in the suit.',
    certainty: 'high',
  },
  //
  {
    id: 'open-weak-three',
    // Three-level preempt with a seven-card suit and less than normal one-level opening strength.
    kind: 'openingBid',
    title: 'Open at the three level with a preemptive hand',
    auctionContext: { stage: 'opening', auction: [] },
    calls: ['3C', '3D', '3H', '3S'],
    callRefinement: refinePreemptSuitQuality,
    callCategory: ['natural'],
    appliesWhen: { totalPoints: { max: 11 }, suitLengths: [{ exact: 7 }] },
    guidance: ['A good suit has at least two of A/K/Q or at least three of A/K/Q/J/T.',
               'Use a three-level preempt below ordinary one-level opening values; these bidding ' +
                 'guidelines describe roughly six playing tricks non-vulnerable and a sounder hand vulnerable.',
               'Going down vulnerable can give the opponents enough penalty points that the ' +
                 'sacrifice is not worthwhile; vulnerability is guidance-only in this app.'],
    meaning: 'Preemptive opening with a good seven-card suit and less than one-level opening values.',
    certainty: 'high',
  },
  //
  {
    id: 'open-four-level-preempt',
    // Four-level preempt with an eight-card suit and less than normal one-level opening strength.
    kind: 'openingBid',
    title: 'Open at the four level with a preemptive hand',
    auctionContext: { stage: 'opening', auction: [] },
    calls: ['4C', '4D', '4H', '4S'],
    callRefinement: refinePreemptSuitQuality,
    callCategory: ['natural'],
    appliesWhen: { hcp: { min: 5, max: 12 }, suitLengths: [{ min: 8 }] },
    guidance: ['An eight-card suit with concentrated honors is a candidate for a four-level ' +
                 'preempt, not an automatic four-level opening. Consider offensive playing ' +
                 'tricks, defensive strength, vulnerability, and the risk of going down.',
               'With ordinary one-level opening values, prefer describing the hand at the one ' +
                 'level. With weaker values, a more cautious three-level preempt can sometimes ' +
                 'be reasonable, though this app models three-level preempts with exactly ' +
                 'seven cards; it does not automatically generate that alternative.',
               'Vulnerability and table judgment are explanatory rather than executable ' +
                 'opening constraints in this trainer.'],
    meaning: 'Preemptive opening with a good eight-card suit.',
    certainty: 'high',
  },
  //
  {
    id: 'open-five-level-minor-preempt',
    // Rare five-level minor preempt for an exceptional nine-card club or diamond suit.
    kind: 'openingBid',
    title: 'Open five of a minor with an exceptional preemptive hand',
    auctionContext: { stage: 'opening', auction: [] },
    calls: ['5C', '5D'],
    callRefinement: refinePreemptSuitQuality,
    callCategory: ['natural'],
    appliesWhen: { hcp: { min: 5, max: 12 }, suitLengths: [{ min: 9 }] },
    guidance: ['Rare: good nine-card minor with about eight playing tricks.'],
    meaning: 'Very high-level descriptive and obstructive preempt.',
    certainty: 'medium',
  },
 ];
