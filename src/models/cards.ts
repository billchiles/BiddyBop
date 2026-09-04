/// Representation for cards and hands.
///

//import type { Call, Strain, SuitBid } from './bidding-types';


/// These may not be used, but we distinguish suit from strain for now in case we need just suits.
const suits = ['S', 'H', 'D', 'C'] as const;
export type Suit = typeof suits[number];

/// Card rank order is display order, high to low.
const ranks = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'] as const;
export type Rank = typeof ranks[number];

/// Seat order is clockwise auction order.
const seats = ['N', 'E', 'S', 'W'] as const;
export type Seat = typeof seats[number];

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
  totalPointsWLength: number;
  lengthPoints: number;
  shortPoints: number;
  totalPointsWShortage: number;
  lengths: Record<Suit, number>;
  balanced: boolean;
  semiBalanced: boolean;
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
  const hcp = getHcp(hand);
  // Count long suits
  let lengthPoints = 0;
  for (const suit of suits) {
    const length = lengths[suit];
    if (length >= 5) {
      lengthPoints += length - 4;
    }
  }
  // Count short suits
  const sortedLengths = suits.map((suit) => lengths[suit]).sort((a, b) => a - b);
  const voidCount = sortedLengths.filter((length) => length === 0).length;
  const singletonCount = sortedLengths.filter((length) => length === 1).length;
  const doubletonCount = sortedLengths.filter((length) => length === 2).length;
  const shortPoints = voidCount * 5 + singletonCount * 3 + doubletonCount;
  // Characterize distribution
  const balanced = voidCount === 0 && singletonCount === 0 && doubletonCount <= 1;
  const semiBalanced = voidCount === 0 && singletonCount <= 1;
  const hasFourCardMajor = lengths.H >= 4 || lengths.S >= 4;
  const hasFiveCardMajor = lengths.H >= 5 || lengths.S >= 5;
  return {
    hcp,
    totalPointsWLength: hcp + lengthPoints,
    lengthPoints: lengthPoints,
    shortPoints: shortPoints,
    totalPointsWShortage: hcp + shortPoints,
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

/// Deal generation returns telemetry because the trainer UI is partly a rule-debugging UI.
export interface DealWTelemetry {
  deal: Deal;
  telemetryLines: string[];
}

/// maxDealAttempts is probably silly and will be removed eventually, but for now, let's make sure
/// openable hands come along within a couple of deals
const maxDealAttempts = 100;

export function generateOpenableNorthDeal (): DealWTelemetry {
  const telemetryLines: string[] = [];
  // This is only a deal-generation shortcut, not the bidding evaluator.  Include the common ways
  // the current opening rules can produce an opening so weak preempts and Rule-of-20 hands appear.
  for (let attemptIndex = 1; attemptIndex <= maxDealAttempts; attemptIndex += 1) {
    let deal = dealRandomHands();
    const firstOpenableSeat = seats.find((seat) => isPracticeOpeningHand(getHandFacts(deal[seat])));
    if (firstOpenableSeat !== undefined) {
      const hcpBySeat = getHcpBySeat(deal);
      telemetryLines.push(
        `Deal attempt ${attemptIndex}: HCP N=${hcpBySeat.N} E=${hcpBySeat.E} ` +
        `S=${hcpBySeat.S} W=${hcpBySeat.W}.`);
      if (firstOpenableSeat !== 'N') {
        deal = rotateOpeningToNorth(deal, firstOpenableSeat);
        telemetryLines.push(`First practice-opening hand was ${firstOpenableSeat}; rotated it to North.`);
      }
      return { deal, telemetryLines };
    }
  } // for
  const fallbackDeal = dealRandomHands();
  telemetryLines.push(
    `No practice-opening hand found after ${maxDealAttempts} attempts; using final random deal.`);
  return { deal: fallbackDeal, telemetryLines };
}

/// isPracticeOpeningHand keeps random deal generation from waiting only for a 12-HCP hand.  The
/// actual evaluator remains authoritative about which opening calls match.
function isPracticeOpeningHand (facts: HandFacts): boolean {
  if (facts.totalPointsWLength >= 12) {
    return true;
  }

  const twoLongestSuitLengths = Object.values(facts.lengths).sort((a, b) => b - a).slice(0, 2);
  const ruleOf20Value = facts.hcp + (twoLongestSuitLengths[0] ?? 0) + (twoLongestSuitLengths[1] ?? 0);
  if (ruleOf20Value >= 20) {
    return true;
  }

  if (facts.hcp >= 5 && facts.hcp <= 10 &&
      (facts.lengths.D >= 6 || facts.lengths.H >= 6 || facts.lengths.S >= 6)) {
    return true;
  }

  if (facts.hcp >= 5 && facts.hcp <= 12 &&
      Math.max(facts.lengths.C, facts.lengths.D, facts.lengths.H, facts.lengths.S) >= 7) {
    return true;
  }

  return false;
}

/// dealRandomHands returns a totally ordered hand for each seat.  Later there will likely be a
/// dealPracticeHands that chooses deals with hands that have judgment call point values or hand
/// characteristics.
///
function dealRandomHands (): Deal {
  // Make a deck
  const cards: Card[] = [];
  for (const suit of suits) {
    for (const rank of ranks) {
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
  const suitCompare = suits.indexOf(left.suit) - suits.indexOf(right.suit);
  return suitCompare !== 0 ? suitCompare : (ranks.indexOf(left.rank) - ranks.indexOf(right.rank));
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


