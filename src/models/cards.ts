/// Representation for cards and hands.
///

//import type { Call, Strain, SuitBid } from './bidding-types';


/// Canonical suit display order; Suit remains distinct from Strain because NT is not a suit.
export const SUITS = ['S', 'H', 'D', 'C'] as const;
export type Suit = typeof SUITS[number];

/// Card rank order is display order, high to low.
const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'] as const;
export type Rank = typeof RANKS[number];

/// Seat order is clockwise auction order.
export const SEATS = ['N', 'E', 'S', 'W'] as const;
export type Seat = typeof SEATS[number];

/// A physical card representation in the generated deal.
export interface Card {
  suit: Suit;
  rank: Rank;
}

///
//// Hands and Characteristics
///

export interface Hand {
  cards: Card[]; // Totally sorted S, H, D, C and by rank within suits.
}

/// HandFacts represent various attributes of a hand used for bidding.
export interface HandFacts {
  hcp: number;
  hcpBySuit: Record<Suit, number>;
  totalPointsWLength: number;
  lengthPoints: number;
  shortPoints: number;
  totalPointsWShortage: number;
  lengths: Record<Suit, number>;
  balanced: boolean;
  balancedOrSemiBalanced: boolean;
  voidCount: number;
  singletonCount: number;
  doubletonCount: number;
  hasFourCardMajor: boolean;
  hasFiveCardMajor: boolean;
}

export function getHandFacts (hand: Hand): HandFacts {
  // Count card lenghts
  const lengths: Record<Suit, number> = { C: 0, D: 0, H: 0, S: 0 };
  for (const card of hand.cards) { lengths[card.suit] += 1; }
  const hcpBySuit = getHcpBySuit(hand);
  const hcp = hcpBySuit.C + hcpBySuit.D + hcpBySuit.H + hcpBySuit.S;
  // Count long suits
  let lengthPoints = 0;
  for (const suit of SUITS) {
    const length = lengths[suit];
    if (length >= 5) {
      lengthPoints += length - 4;
    }
  }
  // Count short suits
  const sortedLengths = SUITS.map((suit) => lengths[suit]).sort((a, b) => a - b);
  const voidCount = sortedLengths.filter((length) => length === 0).length;
  const singletonCount = sortedLengths.filter((length) => length === 1).length;
  const doubletonCount = sortedLengths.filter((length) => length === 2).length;
  const shortPoints = voidCount * 5 + singletonCount * 3 + doubletonCount;
  // Characterize distribution
  const balanced = voidCount === 0 && singletonCount === 0 && doubletonCount <= 1;
  // Balanced or semi-balanced: at least two cards in every suit and at most two doubletons.
  const balancedOrSemiBalanced = lengths.C >= 2 && lengths.D >= 2 && lengths.H >= 2 && 
                                 lengths.S >= 2 && doubletonCount <= 2;
  const hasFourCardMajor = lengths.H >= 4 || lengths.S >= 4;
  const hasFiveCardMajor = lengths.H >= 5 || lengths.S >= 5;
  return {
    hcp,
    hcpBySuit,
    totalPointsWLength: hcp + lengthPoints,
    lengthPoints: lengthPoints,
    shortPoints: shortPoints,
    totalPointsWShortage: hcp + shortPoints,
    lengths,
    balanced,
    balancedOrSemiBalanced,
    voidCount,
    singletonCount,
    doubletonCount,
    hasFourCardMajor,
    hasFiveCardMajor,
  };
}

function getHcpBySuit (hand: Hand): Record<Suit, number> {
  const hcpBySuit: Record<Suit, number> = { C: 0, D: 0, H: 0, S: 0 };
  for (const card of hand.cards) {
    if (card.rank === 'A') {
      hcpBySuit[card.suit] += 4;
    } else if (card.rank === 'K') {
      hcpBySuit[card.suit] += 3;
    } else if (card.rank === 'Q') {
      hcpBySuit[card.suit] += 2;
    } else if (card.rank === 'J') {
      hcpBySuit[card.suit] += 1;
    }
  }
  return hcpBySuit;
}

export function getCardsForSuit (hand: Hand, suit: Suit): Card[] {
  return hand.cards.filter((card) => card.suit === suit);
    //.sort((a, b) => ranks.indexOf(a.rank) - ranks.indexOf(b.rank));
}

///
//// Dealing Hands
///

export interface Deal {
  N: Hand;
  E: Hand;
  S: Hand;
  W: Hand;
}

/// Board is the physical deal plus dealer.  Practice generation may deliberately rotate a useful
/// hand into a seat, but the bidding model sees an ordinary board and derives auction position from
/// dealer and calls.
export interface Board {
  deal: Deal;
  dealer: Seat;
}

/// Board generation returns telemetry because the trainer UI is partly a rule-debugging UI.
export interface BoardWTelemetry {
  board: Board;
  telemetryLines: string[];
}

/// maxDealAttempts is probably silly and will be removed eventually, but for now, let's make sure
/// openable hands come along within a couple of deals
const maxDealAttempts = 100;

/// Temporary deterministic opener-rebid exercise.  Flip this false to return to random practice.
const USE_OPENER_REBID_TEST_DEALS = false;
let openerRebidTestDealIndex = 0;

interface OpenerRebidTestDeal {
  target: string;
  north: Record<Suit, string>;
  south: Record<Suit, string>;
}

const OPENER_REBID_TEST_DEALS: OpenerRebidTestDeal[] = [
  {
    target: '1C-1NT-Pass: minimum balanced opener accepts 1NT.',
    north: { S: 'AK2', H: 'Q42', D: 'J96', C: 'KJ75' },
    south: { S: 'Q76', H: 'J85', D: 'K73', C: 'Q964' },
  },
  {
    target: '1D-1NT-2D: minimum hand repeats a six-card diamond suit.',
    north: { S: 'A42', H: 'K4', D: 'AQJT92', C: '85' },
    south: { S: 'Q76', H: 'J85', D: 'K73', C: 'Q964' },
  },
  {
    target: '1D-1NT-2C: show a lower-ranking four-card second suit cheaply.',
    north: { S: 'A4', H: 'K2', D: 'AQJ92', C: 'JT52' },
    south: { S: 'Q76', H: 'J85', D: 'K73', C: 'Q964' },
  },
  {
    target: '1D-1NT-2H: reverse with five diamonds, four hearts, and extra strength.',
    north: { S: 'AK', H: 'AQ42', D: 'QJ952', C: '85' },
    south: { S: 'Q76', H: 'J85', D: 'K73', C: 'Q964' },
  },
  {
    target: '1D-1NT-3D: jump rebid a six-card diamond suit with medium values.',
    north: { S: 'AK', H: 'Q4', D: 'AQJ982', C: '852' },
    south: { S: 'Q76', H: 'J85', D: 'K73', C: 'Q964' },
  },
  {
    target: '1D-1NT-2NT: 18 HCP balanced opener invites in notrump.',
    north: { S: 'AK2', H: 'KQ4', D: 'QJ92', C: 'K85' },
    south: { S: 'Q76', H: 'J85', D: 'K73', C: 'Q964' },
  },
  {
    target: '1D-1NT-3C: maximum natural jump shift into clubs.',
    north: { S: 'AK2', H: 'Q', D: 'AJ652', C: 'KJ85' },
    south: { S: 'Q76', H: 'J85', D: 'K73', C: 'Q964' },
  },
  {
    target: '1D-1NT-3NT: 20 HCP, 6-3-2-2 semi-balanced hand that did not open 2NT.',
    north: { S: 'AK', H: 'KQ', D: 'AQJ982', C: 'J85' },
    south: { S: 'Q76', H: 'J85', D: 'K73', C: 'Q964' },
  },
  {
    target: '1C-1H-1S: economical four-card second suit.',
    north: { S: 'AQJ2', H: 'Q42', D: 'K72', C: 'J85' },
    south: { S: '83', H: 'KJ76', D: 'Q854', C: '963' },
  },
  {
    target: '1C-1H-1NT: minimum balanced hand with no four-card support or one-level second suit.',
    north: { S: 'AK2', H: 'Q42', D: 'K72', C: 'J852' },
    south: { S: '83', H: 'KJ76', D: 'Q854', C: '963' },
  },
  {
    target: '1C-1H-2H: minimum simple raise with four-card heart support.',
    north: { S: 'AK2', H: 'Q942', D: 'K72', C: '852' },
    south: { S: '83', H: 'KJ76', D: 'Q854', C: '963' },
  },
  {
    target: '1C-1H-2D: natural reverse with five clubs and four diamonds.',
    north: { S: 'AK', H: 'Q2', D: 'AKJ2', C: 'T8752' },
    south: { S: '83', H: 'KJ76', D: 'Q854', C: '963' },
  },
  {
    target: '1C-1H-3H: jump raise with medium support values.',
    north: { S: 'AQ', H: 'AQ42', D: 'K2', C: 'T8752' },
    south: { S: '83', H: 'KJ76', D: 'Q854', C: '963' },
  },
  {
    target: '1C-1H-2S: maximum jump shift; 1S was the economical spade bid.',
    north: { S: 'AKQ2', H: 'Q2', D: 'A2', C: 'KJ852' },
    south: { S: '83', H: 'KJ76', D: 'Q854', C: '963' },
  },
  {
    target: '1C-1H-4H: raise responder to game with maximum support values.',
    north: { S: 'AK', H: 'AQ42', D: 'K2', C: 'J8752' },
    south: { S: '83', H: 'KJ76', D: 'Q854', C: '963' },
  },
  {
    target: '1C-1H-4D: opener-side splinter; 4H should also remain a natural candidate.',
    north: { S: 'AQ2', H: 'AQ42', D: 'K', C: 'J8752' },
    south: { S: '83', H: 'KJ76', D: 'Q854', C: '963' },
  },
  {
    target: '1D-2C-2D Standard: minimum five diamonds; four hearts are not enough to reverse.',
    north: { S: 'A4', H: 'KJ42', D: 'KQJ92', C: '82' },
    south: { S: 'K72', H: 'Q83', D: 'A5', C: 'Q9653' },
  },
  {
    target: '1D-2C-2H Standard: reverse into hearts with extra strength.',
    north: { S: 'A4', H: 'AKJ2', D: 'KQJ92', C: '82' },
    south: { S: 'K72', H: 'Q83', D: 'A5', C: 'Q9653' },
  },
  {
    target: '1D-2C-2NT Standard: minimum balanced hand can conceal a four-card major.',
    north: { S: 'AQJ4', H: 'KJ2', D: 'QJ92', C: '82' },
    south: { S: 'K72', H: 'Q83', D: 'A5', C: 'Q9653' },
  },
  {
    target: '1D-2C-3C Standard: three clubs are support because responder promised five; 2D may also qualify.',
    north: { S: 'A', H: 'KJ42', D: 'KJ972', C: 'T82' },
    south: { S: 'K72', H: 'Q83', D: 'A5', C: 'Q9653' },
  },
];

export function generateOpenableNorthBoard (): BoardWTelemetry {
  if (USE_OPENER_REBID_TEST_DEALS) {
    const testIndex = openerRebidTestDealIndex % OPENER_REBID_TEST_DEALS.length;
    const testDeal = OPENER_REBID_TEST_DEALS[testIndex]!;
    openerRebidTestDealIndex += 1;
    return {
      board: { deal: makeOpenerRebidTestDeal(testDeal), dealer: 'N' },
      telemetryLines: [
        `Opener-rebid test deal ${testIndex + 1}/${OPENER_REBID_TEST_DEALS.length}.`,
        `Target: ${testDeal.target}`,
      ],
    };
  }
  const telemetryLines: string[] = [];
  // This is only a deal-generation shortcut, not the bidding evaluator.  Include the common ways
  // the current opening rules can produce an opening so weak preempts and Rule-of-20 hands appear.
  for (let attemptIndex = 1; attemptIndex <= maxDealAttempts; attemptIndex += 1) {
    let deal = dealRandomHands();
    const firstOpenableSeat = SEATS.find((seat) => isPracticeOpeningHand(deal[seat]));
    if (firstOpenableSeat !== undefined) {
      const hcpBySeat = getHcpBySeat(deal);
      telemetryLines.push(
        `Deal attempt ${attemptIndex}: HCP N=${hcpBySeat.N} E=${hcpBySeat.E} ` +
        `S=${hcpBySeat.S} W=${hcpBySeat.W}.`);
      if (firstOpenableSeat !== 'N') {
        deal = rotateOpeningToNorth(deal, firstOpenableSeat);
        telemetryLines.push(`First practice-opening hand was ${firstOpenableSeat}; rotated it to North.`);
      }
      return { board: { deal, dealer: 'N' }, telemetryLines };
    }
  } // for
  const fallbackDeal = dealRandomHands();
  telemetryLines.push(
    `No practice-opening hand found after ${maxDealAttempts} attempts; using final random deal.`);
  return { board: { deal: fallbackDeal, dealer: 'N' }, telemetryLines };
}

/// isPracticeOpeningHand keeps random deal generation from waiting only for a 12-HCP hand.  The
/// actual evaluator remains authoritative about which opening calls match.
function isPracticeOpeningHand (hand: Hand): boolean {
  const facts = getHandFacts(hand);
  if (facts.totalPointsWLength >= 12) {
    return true;
  }

  const twoLongestSuitLengths = Object.values(facts.lengths).sort((a, b) => b - a).slice(0, 2);
  const ruleOf20Value = facts.hcp + (twoLongestSuitLengths[0] ?? 0) + (twoLongestSuitLengths[1] ?? 0);
  if (ruleOf20Value >= 20) {
    return true;
  }

  if (facts.hcp >= 5 && facts.hcp <= 10 &&
      ((facts.lengths.D >= 6 && hasPreemptSuitQuality(hand, 'D')) ||
       (facts.lengths.H >= 6 && hasPreemptSuitQuality(hand, 'H')) ||
       (facts.lengths.S >= 6 && hasPreemptSuitQuality(hand, 'S')))) {
    return true;
  }

  if (facts.hcp >= 5 && facts.hcp <= 12 &&
      SUITS.some((suit) => facts.lengths[suit] >= 7 && hasPreemptSuitQuality(hand, suit))) {
    return true;
  }

  return false;
}

/// hasPreemptSuitQuality tests the honor concentration used by the current preempt rules.
export function hasPreemptSuitQuality (hand: Hand, suit: Suit): boolean {
  const cards = getCardsForSuit(hand, suit);
  const topThreeCount = cards.filter((card) =>
    card.rank === 'A' || card.rank === 'K' || card.rank === 'Q').length;
  let topFiveCount = cards.filter((card) => card.rank === 'J' || card.rank === 'T').length;
  topFiveCount += topThreeCount;
  return topThreeCount >= 2 || topFiveCount >= 3;
}

/// makeOpenerRebidTestDeal builds a complete physical deal from the two hands that matter to the
/// current North-South punch-through.  East and West get the remaining cards deterministically.
///
function makeOpenerRebidTestDeal (testDeal: OpenerRebidTestDeal): Deal {
  const north = makeTestHand(testDeal.north);
  const south = makeTestHand(testDeal.south);
  const usedCards = new Set([...north.cards, ...south.cards].map(cardKey));
  if (usedCards.size !== 26) {
    throw new Error(`Duplicate card in opener-rebid test deal: ${testDeal.target}`);
  }
  // Fill the opponents from the unused deck; their cards do not affect the current auto-pass UI.
  const remainingCards: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      const card = { suit, rank };
      if (! usedCards.has(cardKey(card))) {
        remainingCards.push(card);
      }
    }
  }
  return {
    N: north,
    E: { cards: remainingCards.slice(0, 13).sort(compareCards) },
    S: south,
    W: { cards: remainingCards.slice(13, 26).sort(compareCards) },
  };
}

function makeTestHand (suits: Record<Suit, string>): Hand {
  const cards: Card[] = [];
  for (const suit of SUITS) {
    for (const rankText of suits[suit]) {
      if (! RANKS.includes(rankText as Rank)) {
        throw new Error(`Unknown rank ${rankText} in opener-rebid test hand.`);
      }
      cards.push({ suit, rank: rankText as Rank });
    }
  }
  if (cards.length !== 13) {
    throw new Error(`Opener-rebid test hand has ${cards.length} cards instead of 13.`);
  }
  return { cards: cards.sort(compareCards) };
}

function cardKey (card: Card): string {
  return `${card.suit}${card.rank}`;
}

/// dealRandomHands returns a totally ordered hand for each seat.  Later there will likely be a
/// dealPracticeHands that chooses deals with hands that have judgment call point values or hand
/// characteristics.
///
function dealRandomHands (): Deal {
  // Make a deck
  const cards: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      cards.push({ suit, rank });
    }
  }
  // Shuffle
  for (let index = cards.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const originalCard = cards[index];
    const swapCard = cards[swapIndex];
    if (originalCard === undefined || swapCard === undefined) {
      throw new Error('Shuffle attempted to access a missing card.');
    }
    cards[index] = swapCard;
    cards[swapIndex] = originalCard;
  }
  return {
    N: { cards: cards.slice(0, 13).sort(compareCards) },
    E: { cards: cards.slice(13, 26).sort(compareCards) },
    S: { cards: cards.slice(26, 39).sort(compareCards) },
    W: { cards: cards.slice(39, 52).sort(compareCards) },
  };
}

/// compareCards used with array.sort to totally order hands.
///
function compareCards (left: Card, right: Card): number {
  const suitCompare = SUITS.indexOf(left.suit) - SUITS.indexOf(right.suit);
  return suitCompare !== 0 ? suitCompare : (RANKS.indexOf(left.rank) - RANKS.indexOf(right.rank));
}

function getHcpBySeat(deal: Deal): Record<Seat, number> {
  return {
    N: getHcp(deal.N),
    E: getHcp(deal.E),
    S: getHcp(deal.S),
    W: getHcp(deal.W),
  };
}

function getHcp (hand: Hand): number {
  let total = 0;
  for (const card of hand.cards) {
    if (card.rank === 'A') {
      total += 4;
    } else if (card.rank === 'K') {
      total += 3;
    } else if (card.rank === 'Q') {
      total += 2;
    } else if (card.rank === 'J') {
      total += 1;
    }
  }
  return total;
}

/// rotateOpeningToNorth might be useful indefinitely, but for not it is just for the initial
/// punch throughs to try out bidding logic and rules data.
///
function rotateOpeningToNorth (deal: Deal, firstOpenableSeat: Seat): Deal {
  const openableIndex = SEATS.indexOf(firstOpenableSeat);
  if (openableIndex < 0) {
    throw new Error(`Unknown seat: ${firstOpenableSeat}`);
  }
  return {
    N: deal[SEATS[openableIndex]],
    E: deal[SEATS[(openableIndex + 1) % SEATS.length]],
    S: deal[SEATS[(openableIndex + 2) % SEATS.length]],
    W: deal[SEATS[(openableIndex + 3) % SEATS.length]],
  };
}


