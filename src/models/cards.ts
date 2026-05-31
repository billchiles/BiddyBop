/// Representation for cards and hands.
////

import type { Call, Suit, SuitBid } from './bidding-convention-types';



const suits: Suit[] = ['S', 'H', 'D', 'C'];


/// Card rank order is display order, high to low.
const ranks = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'] as const;
export type Rank = typeof ranks[number];

/// Seat order is clockwise auction order.
const seats = ['N', 'E', 'S', 'W'] as const;
export type Seat = typeof seats[number];

/// A physical card in the generated deal.
export interface Card {
  suit: Suit;
  rank: Rank;
}

/// A bridge hand is exactly thirteen cards after deal generation.
export interface Hand {
  cards: Card[];
}

/// A deal always stores hands by seat after any rotation.
export interface Deal {
  N: Hand;
  E: Hand;
  S: Hand;
  W: Hand;
}

/// Facts are intentionally simple and evaluator-oriented for the first punch-through.
export interface HandFacts {
  hcp: number;
  totalPoints: number;
  distributionPoints: number;
  lengths: Record<Suit, number>;
  balanced: boolean;
  semiBalanced: boolean;
  voidCount: number;
  singletonCount: number;
  doubletonCount: number;
  hasFourCardMajor: boolean;
  hasFiveCardMajor: boolean;
}

/// Deal generation returns telemetry because the trainer UI is partly a rule-debugging UI.
export interface GeneratedDealResult {
  deal: Deal;
  telemetryLines: string[];
}

const maxDealAttempts = 100;

export function generateOpenableNorthDeal(): GeneratedDealResult {
  const telemetryLines: string[] = [];

  for (let attemptIndex = 1; attemptIndex <= maxDealAttempts; attemptIndex += 1) {
    const rawDeal = dealRandomHands();
    const rawHcpBySeat = getHcpBySeat(rawDeal);
    const firstOpenableSeat = findFirstOpenableSeat(rawHcpBySeat);

    telemetryLines.push(
      `Deal attempt ${attemptIndex}: HCP N=${rawHcpBySeat.N} E=${rawHcpBySeat.E} S=${rawHcpBySeat.S} W=${rawHcpBySeat.W}.`,
    );

    if (firstOpenableSeat !== null) {
      const deal = rotateDealToNorth(rawDeal, firstOpenableSeat);
      telemetryLines.push(`First 12+ HCP hand was ${firstOpenableSeat}; rotated it to North.`);
      return { deal, telemetryLines };
    }

    telemetryLines.push('No hand had 12+ HCP; redealing.');
  }

  const fallbackDeal = dealRandomHands();
  telemetryLines.push(`No 12+ HCP hand found after ${maxDealAttempts} attempts; using final random deal.`);
  return { deal: fallbackDeal, telemetryLines };
}

export function getHandFacts(hand: Hand): HandFacts {
  const lengths = getSuitLengths(hand);
  const hcp = getHighCardPoints(hand);
  const distributionPoints = getLengthDistributionPoints(lengths);
  const sortedLengths = suits.map((suit) => lengths[suit]).sort((a, b) => a - b);
  const voidCount = sortedLengths.filter((length) => length === 0).length;
  const singletonCount = sortedLengths.filter((length) => length === 1).length;
  const doubletonCount = sortedLengths.filter((length) => length === 2).length;
  const balanced = voidCount === 0 && singletonCount === 0 && doubletonCount <= 1;
  const semiBalanced = voidCount === 0 && singletonCount <= 1;
  const hasFourCardMajor = lengths.H >= 4 || lengths.S >= 4;
  const hasFiveCardMajor = lengths.H >= 5 || lengths.S >= 5;

  return {
    hcp,
    totalPoints: hcp + distributionPoints,
    distributionPoints,
    lengths,
    balanced,
    semiBalanced,
    voidCount,
    singletonCount,
    doubletonCount,
    hasFourCardMajor,
    hasFiveCardMajor,
  };
}

export function getCardsForSuit(hand: Hand, suit: Suit): Card[] {
  return hand.cards
    .filter((card) => card.suit === suit)
    .sort((a, b) => ranks.indexOf(a.rank) - ranks.indexOf(b.rank));
}

export function normalizeCallInput(input: string): Call | null {
  const trimmed = input.trim().toUpperCase();

  if (trimmed === '') {
    return null;
  }

  if (trimmed === 'P' || trimmed === 'PASS') {
    return 'Pass';
  }

  if (trimmed === 'X' || trimmed === 'DOUBLE') {
    return 'Double';
  }

  if (trimmed === 'XX' || trimmed === 'REDOUBLE') {
    return 'Redouble';
  }

  if (isSuitBid(trimmed as Call)) {
    return trimmed as Call;
  }

  return null;
}

export function isSuitBid(call: Call): call is SuitBid {
  if (call.length !== 2 && call.length !== 3) {
    return false;
  }

  const levelText = call.substring(0, 1);
  const suitText = call.substring(1);
  const level = Number(levelText);

  if (Number.isInteger(level) !== true || level < 1 || level > 7) {
    return false;
  }

  return suitText === 'C' || suitText === 'D' || suitText === 'H' || suitText === 'S' || suitText === 'NT';
}

export function getSuitFromSuitBid(call: SuitBid): Suit {
  const suitText = call.substring(1);

  if (suitText === 'C' || suitText === 'D' || suitText === 'H' || suitText === 'S' || suitText === 'NT') {
    return suitText;
  }

  throw new Error(`Invalid suit bid suit: ${call}`);
}

function dealRandomHands(): Deal {
  const deck = buildDeck();
  shuffleCards(deck);

  return {
    N: { cards: deck.slice(0, 13) },
    E: { cards: deck.slice(13, 26) },
    S: { cards: deck.slice(26, 39) },
    W: { cards: deck.slice(39, 52) },
  };
}

function buildDeck(): Card[] {
  const cards: Card[] = [];

  for (const suit of suits) {
    for (const rank of ranks) {
      cards.push({ suit, rank });
    }
  }

  return cards;
}

function shuffleCards(cards: Card[]): void {
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
}

function getHcpBySeat(deal: Deal): Record<Seat, number> {
  return {
    N: getHighCardPoints(deal.N),
    E: getHighCardPoints(deal.E),
    S: getHighCardPoints(deal.S),
    W: getHighCardPoints(deal.W),
  };
}

function findFirstOpenableSeat(hcpBySeat: Record<Seat, number>): Seat | null {
  for (const seat of seats) {
    if (hcpBySeat[seat] >= 12) {
      return seat;
    }
  }

  return null;
}

function rotateDealToNorth(deal: Deal, firstOpenableSeat: Seat): Deal {
  const openableIndex = seats.indexOf(firstOpenableSeat);

  if (openableIndex < 0) {
    throw new Error(`Unknown seat: ${firstOpenableSeat}`);
  }

  return {
    N: deal[seats[openableIndex]],
    E: deal[seats[(openableIndex + 1) % seats.length]],
    S: deal[seats[(openableIndex + 2) % seats.length]],
    W: deal[seats[(openableIndex + 3) % seats.length]],
  };
}

function getHighCardPoints(hand: Hand): number {
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

function getSuitLengths(hand: Hand): Record<Suit, number> {
  const lengths: Record<Suit, number> = { C: 0, D: 0, H: 0, S: 0, NT: 0 };

  for (const card of hand.cards) {
    lengths[card.suit] += 1;
  }

  return lengths;
}

function getLengthDistributionPoints(lengths: Record<Suit, number>): number {
  let total = 0;

  for (const suit of suits) {
    const length = lengths[suit];

    if (length >= 5) {
      total += length - 4;
    }
  }

  return total;
}
