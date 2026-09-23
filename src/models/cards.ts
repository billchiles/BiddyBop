/// Representation for cards and hands.
///

import type { RuleTestDeal, RuleTestExpectedCall } from './rule-test-deals';


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

export function generateOpenableNorthBoard (): BoardWTelemetry {
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

/// Build a deterministic rule-practice board without changing the active bidding system.  The
/// intended auction and positive candidate expectations are displayed in telemetry, not auto-bid.
export function makeRuleTestBoard (testDeal: RuleTestDeal): BoardWTelemetry {
  const telemetryLines = [
    `Rule test: ${testDeal.description}`,
    `Practice auction: ${testDeal.practiceAuction.join(' ')}`,
  ];
  if (testDeal.requiredSystem !== undefined) {
    const settings = Object.entries(testDeal.requiredSystem)
      .map(([name, value]) => `${name}=${value}`).join(', ');
    telemetryLines.push(`Required system: ${settings}.`);
  }
  // Report each stage's positive assertions so manual practice can check the candidate set.
  if (testDeal.expectedOpeningCalls !== undefined) {
    telemetryLines.push(`Expected opening: ${formatExpectedCalls(testDeal.expectedOpeningCalls)}.`);
  }
  if (testDeal.expectedResponseCalls !== undefined) {
    telemetryLines.push(`Expected response: ${formatExpectedCalls(testDeal.expectedResponseCalls)}.`);
  }
  if (testDeal.expectedOpenerRebidCalls !== undefined) {
    telemetryLines.push(`Expected opener rebid: ${formatExpectedCalls(testDeal.expectedOpenerRebidCalls)}.`);
  }
  return { board: { deal: makeRuleTestDeal(testDeal), dealer: 'N' }, telemetryLines };
}

function formatExpectedCalls (expectedCalls: RuleTestExpectedCall[]): string {
  return expectedCalls.map(({ call, ruleIds }) => `${call} (${ruleIds.join(', ')})`).join('; ');
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

/// makeRuleTestDeal builds a complete physical deal from the two hands that matter to the
/// current North-South punch-through.  East and West get the remaining cards deterministically.
///
function makeRuleTestDeal (testDeal: RuleTestDeal): Deal {
  const north = makeTestHand(testDeal.north);
  const south = makeTestHand(testDeal.south);
  const usedCards = new Set([...north.cards, ...south.cards].map(cardKey));
  if (usedCards.size !== 26) {
    throw new Error(`Duplicate card in rule-test deal: ${testDeal.description}`);
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
        throw new Error(`Unknown rank ${rankText} in rule-test hand.`);
      }
      cards.push({ suit, rank: rankText as Rank });
    }
  }
  if (cards.length !== 13) {
    throw new Error(`Rule-test hand has ${cards.length} cards instead of 13.`);
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


