/// Overcall Bid Functions: refiners, applicability checks, and related helpers.

import {
  type AppliesWhenResult, type BiddingSystem, type Call, type CallRefinementResult,
  type RuleEvalContext
} from './bidding-types';
import { getCardsForSuit, hasPreemptSuitQuality, SUITS, type Suit } from './cards';
import { cheapestBidInStrainAfter, getOpeningCallInfo, parseSuitBid } from './auction';
import { hasBasicSuitStopper } from './common-rule-helpers';

///
//// Natural Suit Overcalls
///

/// refineSimpleSuitOvercall selects the cheapest available non-jump suit bid for the
/// overcaller. A five-card suit needs the shared good-suit test; six or more cards suffice.
export function refineSimpleSuitOvercall (calls: Call[], context: RuleEvalContext): CallRefinementResult {
  const opening = getOpeningCallInfo(context.dealer, context.auction)?.call;
  if (opening === undefined || opening.substring(1) === 'NT') {
    return { calls: [], telemetryLines: ['A one-level suit opening is required.'] };
  }
  const parsedOpening = parseSuitBid(opening);
  if (parsedOpening === null) {
    return { calls: [], telemetryLines: ['No contract opening was found.'] };
  }
  const qualifying = calls.filter((call) => {
    const bid = parseSuitBid(call);
    if (bid === null || bid.strain === 'NT' || bid.strain === parsedOpening.strain) {
      return false;
    }
    const cheapest = cheapestBidInStrainAfter(parsedOpening, bid.strain);
    if (cheapest !== call) {
      return false;
    }
    const suit = bid.strain as Suit;
    const length = context.handFacts.lengths[suit];
    return length >= 6 || (length === 5 && hasPreemptSuitQuality(context.hand, suit));
  });
  return { calls: qualifying, telemetryLines: [
    'Keep non-jump new suits with a good five-card suit or any six-card-or-longer suit.',
  ] };
}

/// refineWeakTwoSuitOvercall selects the cheapest natural suit overcall after an opposing weak two.
/// A two-level action needs a good 5+ card suit; a three-level action needs a good 6+ card suit.
export function refineWeakTwoSuitOvercall (calls: Call[], context: RuleEvalContext):
    CallRefinementResult {
  const opening = getOpeningCallInfo(context.dealer, context.auction)?.call;
  const parsedOpening = opening === undefined ? null : parseSuitBid(opening);
  if (opening === undefined || parsedOpening === null ||
      ! ['2D', '2H', '2S'].includes(opening)) {
    return { calls: [], telemetryLines: ['Requires an opposing weak-two opening.'] };
  }
  const qualifying = calls.filter((call) => {
    const bid = parseSuitBid(call);
    if (bid === null || bid.strain === 'NT' || bid.strain === parsedOpening.strain) {
      return false;
    }
    if (cheapestBidInStrainAfter(parsedOpening, bid.strain) !== call) {
      return false;
    }
    const suit = bid.strain as Suit;
    const minimumLength = bid.level === 2 ? 5 : bid.level === 3 ? 6 : null;
    return minimumLength !== null && context.handFacts.lengths[suit] >= minimumLength &&
      hasPreemptSuitQuality(context.hand, suit);
  });
  return { calls: qualifying, telemetryLines: [
    'Keep the cheapest natural suit overcall: good 5+ cards at level two, good 6+ at level three.',
  ] };
}

/// refinePreemptiveJumpOvercall selects a jump bid for the overcaller, with a good six-,
/// seven-, or eight-card suit at level 2, 3, or 4. The bid must exceed the cheapest bid in that suit.
export function refinePreemptiveJumpOvercall (calls: Call[], context: RuleEvalContext): CallRefinementResult {
  const opening = getOpeningCallInfo(context.dealer, context.auction)?.call;
  const parsedOpening = opening === undefined ? null : parseSuitBid(opening);
  if (parsedOpening === null || parsedOpening.level !== 1 || parsedOpening.strain === 'NT') {
    return { calls: [], telemetryLines: ['Requires a one-level suit opening.'] };
  }
  const qualifying = calls.filter((call) => {
    const bid = parseSuitBid(call);
    if (bid === null || bid.strain === 'NT' || bid.strain === parsedOpening.strain ||
        bid.level < 2 || bid.level > 4) {
      return false;
    }
    const cheapest = cheapestBidInStrainAfter(parsedOpening, bid.strain);
    const parsedCheapest = cheapest === null ? null : parseSuitBid(cheapest);
    if (parsedCheapest === null || bid.level <= parsedCheapest.level) {
      return false;
    }
    const suit = bid.strain as Suit;
    return context.handFacts.lengths[suit] === bid.level + 4 &&
      hasPreemptSuitQuality(context.hand, suit);
  });
  return { calls: qualifying, telemetryLines: [
    'Jump in a different suit: good six cards at two, seven at three, eight at four.',
  ] };
}

///
//// Natural Notrump Overcalls
///

/// naturalNotrumpOvercallApplies requires 15-18 HCP, balanced shape, and A, Kx, Qxx, or Jxxx
/// in opener's suit.  It supports natural 1NT over a one-level suit and 2NT over a weak two.
export function naturalNotrumpOvercallApplies (call: Call, context: RuleEvalContext):
    AppliesWhenResult {
  const opening = getOpeningCallInfo(context.dealer, context.auction)?.call;
  const parsed = opening === undefined ? null : parseSuitBid(opening);
  if (parsed === null || parsed.strain === 'NT' ||
      (call === '1NT' && parsed.level !== 1) ||
      (call === '2NT' && ! ['2D', '2H', '2S'].includes(opening ?? '')) ||
      (call !== '1NT' && call !== '2NT')) {
    return { success: false,
             telemetryLines: ['FAIL: unsupported natural notrump overcall context.'] };
  }
  const stopper = hasBasicSuitStopper(context, parsed.strain as Suit);
  const points = context.handFacts.hcp;
  const strength = points >= 15 && points <= 18;
  const balanced = context.handFacts.balanced;
  return {
    success: strength && balanced && stopper,
    telemetryLines: [
      `${strength ? 'PASS' : 'FAIL'}: ${call} overcall requires 15-18 HCP; hand has ${points}.`,
      `${balanced ? 'PASS' : 'FAIL'}: ${call} overcall needs balanced distribution.`,
      `${stopper ? 'PASS' : 'FAIL'}: ${call} overcall needs A, Kx, Qxx, or Jxxx in ` +
        `opener's ${parsed.strain} suit.`,
    ],
  };
}

///
//// Natural Suit Overcall -- Responses to Advancer's First Call
///
/// Model overcaller's second call only after a non-jump natural one- or two-level overcall of
/// an opposing one-level suit opening. Both players on the opening side must pass. The
/// initial advance is classified against the *actual* bidding space: a cuebid is artificial,
/// and a new suit is forcing here only when advancer had to bid at level two or three.
type SuitOvercallerAdvance = {
  opening: Suit;
  suit: Suit;
  level: 1 | 2;
  advance: Call;
  advanceKind: 'simpleRaise' | 'weakJumpRaise' | 'supportCuebid' |
    'nonforcingNewSuit' | 'forcingNewSuit' | 'oneNt' | 'twoNt' | 'threeNt';
  advanceSuit: Suit | null;
  advanceBid: NonNullable<ReturnType<typeof parseSuitBid>>;
};

function getSuitOvercallerAdvance (context: RuleEvalContext): SuitOvercallerAdvance | null {
  const info = getOpeningCallInfo(context.dealer, context.auction);
  if (context.stage !== 'overcallerRebid' || info === null ||
      context.auction.length !== info.index + 5 ||
      context.auction[info.index + 2] !== 'Pass' ||
      context.auction[info.index + 4] !== 'Pass') return null;
  const openingBid = parseSuitBid(info.call);
  const overcallCall = context.auction[info.index + 1] ?? 'Pass';
  const overcall = parseSuitBid(overcallCall);
  const advance = context.auction[info.index + 3] ?? 'Pass';
  const advanceBid = parseSuitBid(advance);
  if (openingBid === null || openingBid.level !== 1 || openingBid.strain === 'NT' ||
      overcall === null || overcall.strain === 'NT' ||
      (overcall.level !== 1 && overcall.level !== 2) ||
      cheapestBidInStrainAfter(openingBid, overcall.strain) !== overcallCall ||
      advanceBid === null) return null;
  const opening = openingBid.strain as Suit;
  const suit = overcall.strain as Suit;
  const level = overcall.level as 1 | 2;
  let advanceKind: SuitOvercallerAdvance['advanceKind'] | null = null;
  let advanceSuit: Suit | null = null;
  if (advanceBid.strain === 'NT') {
    if (advance === '1NT' && level === 1) advanceKind = 'oneNt';
    if (advance === '2NT') advanceKind = 'twoNt';
    if (advance === '3NT') advanceKind = 'threeNt';
  } else if (advanceBid.strain === suit) {
    if (advanceBid.level === level + 1) advanceKind = 'simpleRaise';
    if (level === 1 && advanceBid.level === 3) advanceKind = 'weakJumpRaise';
  } else if (advanceBid.strain === opening &&
             cheapestBidInStrainAfter(overcall, opening) === advance) {
    advanceKind = 'supportCuebid';
  } else if (advanceBid.strain !== opening && advanceBid.strain !== suit &&
             cheapestBidInStrainAfter(overcall, advanceBid.strain) === advance) {
    advanceKind = advanceBid.level === 1 && level === 1 ?
      'nonforcingNewSuit' : 'forcingNewSuit';
    advanceSuit = advanceBid.strain as Suit;
  }
  return advanceKind === null ? null :
    { opening, suit, level, advance, advanceKind, advanceSuit, advanceBid };
}

/// The shared bid selector below keeps one physical-auction definition for each continuation.
/// Each treatment retains a separate BidRule and user-facing meaning; boundaries apply only
/// when none of the selected descriptive actions can be recommended.
type NaturalSuitRebidTreatment = 'raise-pass' | 'raise-invite' | 'raise-game' |
  'cue-return' | 'cue-invite' | 'cue-game' | 'new-pass' | 'new-support' | 'new-repeat' |
  'new-nt' | 'new-second-suit' | 'nt-pass' | 'nt-invite' | 'nt-game';

export function naturalSuitOvercallerRebidApplies (
    call: Call, context: RuleEvalContext, treatment: NaturalSuitRebidTreatment): AppliesWhenResult {
  const info = getSuitOvercallerAdvance(context);
  if (info === null) return { success: false, telemetryLines: [
    'FAIL: requires a natural non-jump suit overcall, modeled advance, and opposing Passes.',
  ] };
  const hcp = context.handFacts.hcp;
  const ownLength = context.handFacts.lengths[info.suit];
  const other = info.advanceSuit;
  const support = other === null ? 0 : context.handFacts.lengths[other];
  const cheapest = (suit: Suit): Call | null =>
    cheapestBidInStrainAfter(info.advanceBid, suit);
  const major = info.suit === 'H' || info.suit === 'S';
  const stopped = hasBasicSuitStopper(context, info.opening);
  const balanced = context.handFacts.balancedOrSemiBalanced;
  let success = false;
  switch (treatment) {
    case 'raise-pass':
      success = (info.advanceKind === 'simpleRaise' &&
                   (hcp <= (info.level === 1 ? 13 : 15) || ! major)) ||
        (info.advanceKind === 'weakJumpRaise' && hcp <= 15);
      success = success && call === 'Pass';
      break;
    case 'raise-invite':
      success = info.advanceKind === 'simpleRaise' && info.level === 1 && major &&
        hcp >= 14 && hcp <= 15 && ownLength >= 5 && call === cheapest(info.suit);
      break;
    case 'raise-game':
      success = info.advanceKind === 'simpleRaise' && major && ownLength >= 6 &&
        hcp >= 16 && call === `4${info.suit}`;
      break;
    case 'cue-return':
      success = info.advanceKind === 'supportCuebid' &&
        (hcp <= (info.level === 1 ? 13 : 15) || ! major) &&
        call === cheapest(info.suit);
      break;
    case 'cue-invite':
      success = info.advanceKind === 'supportCuebid' && info.level === 1 && major &&
        hcp >= 14 && hcp <= 15 && call === `3${info.suit}` &&
        cheapest(info.suit) === `2${info.suit}`;
      break;
    case 'cue-game':
      success = info.advanceKind === 'supportCuebid' && major && ownLength >= 6 &&
        hcp >= 16 && call === `4${info.suit}`;
      break;
    case 'new-pass':
      success = info.advanceKind === 'nonforcingNewSuit' && hcp <= 12 && call === 'Pass';
      break;
    case 'new-support':
      success = (info.advanceKind === 'nonforcingNewSuit' && hcp >= 13 ||
                 info.advanceKind === 'forcingNewSuit') && support >= 3 &&
        other !== null && call === cheapest(other) &&
        (other === 'H' || other === 'S' ||
         parseSuitBid(call)?.level !== undefined && parseSuitBid(call)!.level <= 3);
      break;
    case 'new-repeat':
      success = (info.advanceKind === 'forcingNewSuit' ||
                 info.advanceKind === 'nonforcingNewSuit' && hcp >= 14) &&
        support < 3 && ownLength >= 6 && call === cheapest(info.suit);
      break;
    case 'new-nt':
      success = info.advanceKind === 'forcingNewSuit' && support < 3 &&
        ownLength < 6 && balanced && stopped &&
        ((call === '2NT' && hcp >= 13 && hcp <= 15 &&
          cheapestBidInStrainAfter(info.advanceBid, 'NT') === '2NT') ||
         (call === '3NT' && hcp >= 16 &&
          (cheapestBidInStrainAfter(info.advanceBid, 'NT') === '2NT' ||
           cheapestBidInStrainAfter(info.advanceBid, 'NT') === '3NT')));
      break;
    case 'new-second-suit':
      success = info.advanceKind === 'forcingNewSuit' && support < 3 && ownLength < 6 &&
        hcp >= 15 && SUITS.some((suit) => suit !== info.suit && suit !== info.opening &&
          suit !== other && context.handFacts.lengths[suit] >= 5 &&
          call === cheapest(suit) && (parseSuitBid(call)?.level ?? 8) <= 3);
      break;
    case 'nt-pass':
      success = call === 'Pass' && (info.advanceKind === 'threeNt' ||
        info.advanceKind === 'oneNt' && hcp <= 14 ||
        info.advanceKind === 'twoNt' && hcp <= (info.level === 1 ? 13 : 14));
      break;
    case 'nt-invite':
      success = info.advanceKind === 'oneNt' && hcp >= 15 && hcp <= 16 && call === '2NT';
      break;
    case 'nt-game':
      success = ((info.advanceKind === 'oneNt' && hcp >= 17) ||
        (info.advanceKind === 'twoNt' && hcp >= (info.level === 1 ? 14 : 15))) &&
        call === '3NT';
      break;
  }
  return { success, telemetryLines: [success ?
    `PASS: selected ${treatment} continuation after advancer's ${info.advanceKind}.` :
    `FAIL: ${treatment} does not qualify with ${hcp} HCP and ${ownLength} ${info.suit}.`] };
}

export function naturalSuitOvercallerRebidBoundaryApplies (
    context: RuleEvalContext, kind: 'supportCuebid' | 'forcingNewSuit' | 'nonforcing'):
    AppliesWhenResult {
  const info = getSuitOvercallerAdvance(context);
  const success = info !== null && (kind === 'nonforcing' ?
    ['simpleRaise', 'weakJumpRaise', 'nonforcingNewSuit', 'oneNt', 'twoNt']
      .includes(info.advanceKind) : info.advanceKind === kind);
  return { success, telemetryLines: [success ?
    `No selected ${kind} continuation; further judgment is outside this modeled branch.` :
    `No ${kind} boundary in this natural suit-overcall auction.`] };
}

///
//// Natural suit overcall -- Advancer after responder acts
///
/// A second competitive context, separate from the responder-Pass family above. Distinguish
/// responder's simple raise, natural new suit/NT, and negative Double. Advancer's cuebid
/// shows support, while a responsive Double requests a choice of unbid suits.
type ContestedSuitAdvance = {
  opening: Suit;
  suit: Suit;
  level: 1 | 2;
  responderKind: 'raise' | 'natural' | 'negativeDouble';
  responderSuit: Suit | null;
  advanceKind: 'simpleRaise' | 'weakJumpRaise' | 'supportCuebid' |
    'nonforcingNewSuit' | 'forcingNewSuit' | 'responsiveDouble' |
    'oneNt' | 'twoNt' | 'threeNt' | 'strengthRedouble';
  advanceSuit: Suit | null;
  lastBid: NonNullable<ReturnType<typeof parseSuitBid>>;
};

function getContestedSuitAdvance (context: RuleEvalContext): ContestedSuitAdvance | null {
  const info = getOpeningCallInfo(context.dealer, context.auction);
  if (context.stage !== 'overcallerRebid' || info === null ||
      context.auction.length !== info.index + 5) return null;
  const openingBid = parseSuitBid(info.call);
  const overcallCall = context.auction[info.index + 1] ?? 'Pass';
  const overcall = parseSuitBid(overcallCall);
  if (openingBid === null || openingBid.level !== 1 || openingBid.strain === 'NT' ||
      overcall === null || overcall.strain === 'NT' ||
      (overcall.level !== 1 && overcall.level !== 2) ||
      cheapestBidInStrainAfter(openingBid, overcall.strain) !== overcallCall) return null;
  const responderCall = context.auction[info.index + 2] ?? 'Pass';
  const responderBid = parseSuitBid(responderCall);
  const opening = openingBid.strain as Suit;
  const suit = overcall.strain as Suit;
  const level = overcall.level as 1 | 2;
  let responderKind: ContestedSuitAdvance['responderKind'];
  let responderSuit: Suit | null = null;
  if (responderCall === 'Double') {
    responderKind = 'negativeDouble';
  } else if (responderBid !== null && responderBid.strain === opening &&
             cheapestBidInStrainAfter(overcall, opening) === responderCall) {
    responderKind = 'raise';
  } else if (responderBid !== null && (responderBid.strain === 'NT' ||
             responderBid.strain !== suit && responderBid.strain !== opening) &&
             (responderBid.strain === 'NT' ||
              cheapestBidInStrainAfter(overcall, responderBid.strain) === responderCall)) {
    responderKind = 'natural';
    responderSuit = responderBid.strain === 'NT' ? null : responderBid.strain as Suit;
  } else return null;
  const advanceCall = context.auction[info.index + 3] ?? 'Pass';
  const lastBid = responderBid ?? overcall;
  const advanceBid = parseSuitBid(advanceCall);
  let advanceKind: ContestedSuitAdvance['advanceKind'] | null = null;
  let advanceSuit: Suit | null = null;
  if (advanceBid !== null && advanceBid.strain === suit) {
    const cheapest = cheapestBidInStrainAfter(lastBid, suit);
    const cheapestParsed = cheapest === null ? null : parseSuitBid(cheapest);
    if (advanceCall === cheapest) advanceKind = 'simpleRaise';
    if (level === 1 && cheapestParsed !== null &&
        advanceBid.level === cheapestParsed.level + 1) advanceKind = 'weakJumpRaise';
  } else if (advanceBid !== null && advanceBid.strain === opening &&
             advanceCall === cheapestBidInStrainAfter(lastBid, opening)) {
    advanceKind = 'supportCuebid';
  } else if (advanceBid !== null && advanceBid.strain === 'NT') {
    if (advanceCall === '1NT') advanceKind = 'oneNt';
    if (advanceCall === '2NT') advanceKind = 'twoNt';
    if (advanceCall === '3NT') advanceKind = 'threeNt';
  } else if (advanceBid !== null && advanceBid.strain !== opening &&
             advanceBid.strain !== suit && advanceBid.strain !== responderSuit &&
             advanceCall === cheapestBidInStrainAfter(lastBid, advanceBid.strain)) {
    advanceKind = advanceBid.level === 1 ? 'nonforcingNewSuit' : 'forcingNewSuit';
    advanceSuit = advanceBid.strain as Suit;
  } else if (advanceCall === 'Double' && responderKind === 'raise') {
    advanceKind = 'responsiveDouble';
  } else if (advanceCall === 'Redouble' && responderKind === 'negativeDouble') {
    advanceKind = 'strengthRedouble';
  }
  if (advanceKind === null) return null;
  return { opening, suit, level, responderKind, responderSuit, advanceKind,
           advanceSuit, lastBid: advanceBid ?? lastBid };
}

type ContestedSuitTreatment = 'raise-pass' | 'raise-invite' | 'raise-game' |
  'cue-return' | 'cue-game' | 'new-pass' | 'new-support' | 'new-repeat' |
  'new-nt' | 'new-second-suit' | 'responsive-suit' | 'responsive-repeat' |
  'nt-pass' | 'nt-invite' | 'nt-game';

export function contestedSuitOvercallerRebidApplies (
    call: Call, context: RuleEvalContext, treatment: ContestedSuitTreatment): AppliesWhenResult {
  const info = getContestedSuitAdvance(context);
  if (info === null || context.auction[context.auction.length - 1] !== 'Pass') {
    return { success: false, telemetryLines: [
      'FAIL: requires a modeled competitive advance followed by opener Pass.',
    ] };
  }
  const hcp = context.handFacts.hcp;
  const ownLength = context.handFacts.lengths[info.suit];
  const support = info.advanceSuit === null ? 0 : context.handFacts.lengths[info.advanceSuit];
  const cheapest = (suit: Suit | 'NT'): Call | null => cheapestBidInStrainAfter(info.lastBid, suit);
  const major = info.suit === 'H' || info.suit === 'S';
  const game = `4${info.suit}`;
  const stopped = hasBasicSuitStopper(context, info.opening) &&
    (info.responderSuit === null || hasBasicSuitStopper(context, info.responderSuit));
  let success = false;
  switch (treatment) {
    case 'raise-pass':
      success = call === 'Pass' && (info.advanceKind === 'simpleRaise' &&
        (hcp <= (info.level === 1 ? 13 : 15) || ! major) ||
        info.advanceKind === 'weakJumpRaise' && hcp <= 15);
      break;
    case 'raise-invite':
      success = info.advanceKind === 'simpleRaise' && info.level === 1 && major &&
        hcp >= 14 && hcp <= 15 && ownLength >= 5 &&
        cheapest(info.suit) === `3${info.suit}` && call === `3${info.suit}`;
      break;
    case 'raise-game':
      success = info.advanceKind === 'simpleRaise' && major && ownLength >= 6 &&
        hcp >= 16 && call === game && cheapest(info.suit) !== null &&
        (parseSuitBid(cheapest(info.suit)!)?.level ?? 8) <= 4;
      break;
    case 'cue-return':
      success = info.advanceKind === 'supportCuebid' &&
        (hcp <= (info.level === 1 ? 13 : 15) || ! major ||
         hcp <= 15 && (parseSuitBid(cheapest(info.suit)!)?.level ?? 8) >= 3) &&
        call === cheapest(info.suit);
      break;
    case 'cue-game':
      success = info.advanceKind === 'supportCuebid' && major && ownLength >= 6 &&
        hcp >= 16 && call === game && (parseSuitBid(cheapest(info.suit)!)?.level ?? 8) <= 4;
      break;
    case 'new-pass':
      success = info.advanceKind === 'nonforcingNewSuit' && hcp <= 12 && call === 'Pass';
      break;
    case 'new-support':
      success = (info.advanceKind === 'forcingNewSuit' ||
        info.advanceKind === 'nonforcingNewSuit' && hcp >= 13) &&
        info.advanceSuit !== null && support >= 3 &&
        call === cheapest(info.advanceSuit) &&
        (info.advanceSuit === 'H' || info.advanceSuit === 'S' ||
         (parseSuitBid(call)?.level ?? 8) <= 3);
      break;
    case 'new-repeat':
      success = (info.advanceKind === 'forcingNewSuit' ||
        info.advanceKind === 'nonforcingNewSuit' && hcp >= 14) &&
        support < 3 && ownLength >= 6 && call === cheapest(info.suit);
      break;
    case 'new-nt':
      success = info.advanceKind === 'forcingNewSuit' && support < 3 &&
        ownLength < 6 && context.handFacts.balancedOrSemiBalanced && stopped &&
        ((call === '2NT' && hcp >= 13 && hcp <= 15 && cheapest('NT') === '2NT') ||
         (call === '3NT' && hcp >= 16 &&
          (cheapest('NT') === '2NT' || cheapest('NT') === '3NT')));
      break;
    case 'new-second-suit':
      success = info.advanceKind === 'forcingNewSuit' && support < 3 &&
        ownLength < 6 && hcp >= 15 && SUITS.some((suit) =>
          suit !== info.opening && suit !== info.suit &&
          suit !== info.advanceSuit && suit !== info.responderSuit &&
          context.handFacts.lengths[suit] >= 5 && call === cheapest(suit) &&
          (parseSuitBid(call)?.level ?? 8) <= 3);
      break;
    case 'responsive-suit': {
      const unbid = SUITS.filter((suit) => suit !== info.opening && suit !== info.suit);
      const eligible = unbid.filter((suit) => context.handFacts.lengths[suit] >= 4);
      const options = eligible.map((suit) => cheapest(suit)).filter((bid) => bid !== null);
      success = info.advanceKind === 'responsiveDouble' && options.length > 0 &&
        call === options.sort((a, b) => {
          const first = parseSuitBid(a)!;
          const second = parseSuitBid(b)!;
          return first.level - second.level || SUITS.indexOf(second.strain as Suit) -
            SUITS.indexOf(first.strain as Suit);
        })[0];
      break;
    }
    case 'responsive-repeat':
      success = info.advanceKind === 'responsiveDouble' && ownLength >= 6 &&
        ! SUITS.some((suit) => suit !== info.opening && suit !== info.suit &&
          context.handFacts.lengths[suit] >= 4) && call === cheapest(info.suit);
      break;
    case 'nt-pass':
      success = call === 'Pass' && (info.advanceKind === 'threeNt' ||
        info.advanceKind === 'oneNt' && hcp <= 14 ||
        info.advanceKind === 'twoNt' && hcp <= (info.level === 1 ? 13 : 14));
      break;
    case 'nt-invite':
      success = info.advanceKind === 'oneNt' && hcp >= 15 && hcp <= 16 &&
        call === '2NT' && cheapest('NT') === '2NT';
      break;
    case 'nt-game':
      success = call === '3NT' && ((info.advanceKind === 'oneNt' && hcp >= 17) ||
        (info.advanceKind === 'twoNt' && hcp >= (info.level === 1 ? 14 : 15)));
      break;
  }
  return { success, telemetryLines: [success ?
    `PASS: selected ${treatment} after responder's ${info.responderKind} and advancer's ${info.advanceKind}.` :
    `FAIL: ${treatment} is not supported with ${hcp} HCP in this auction.`] };
}

export function contestedSuitOvercallerBoundaryApplies (
    context: RuleEvalContext, kind: 'forcing' | 'redouble' | 'nonforcing' | 'furtherCompetition'):
    AppliesWhenResult {
  const info = getContestedSuitAdvance(context);
  const finalPass = context.auction[context.auction.length - 1] === 'Pass';
  const success = info !== null && (kind === 'furtherCompetition' ? ! finalPass : finalPass &&
    (kind === 'forcing' ? ['supportCuebid', 'forcingNewSuit', 'responsiveDouble']
      .includes(info.advanceKind) : kind === 'redouble' ?
      info.advanceKind === 'strengthRedouble' :
      ['simpleRaise', 'weakJumpRaise', 'nonforcingNewSuit', 'oneNt', 'twoNt']
        .includes(info.advanceKind)));
  return { success, telemetryLines: [success ?
    `Further ${kind} decisions are not reliably determined by the selected competitive rules.` :
    'Not a selected competitive overcaller judgment boundary.'] };
}

///
//// Natural 1NT overcall -- Responder interferes naturally
///
/// These limited signoffs and invitations do not re-enable Stayman or transfers after
/// responder has introduced a natural suit.
export function contestedOneNtOvercallerRebidApplies (
    call: Call, context: RuleEvalContext, system: BiddingSystem,
    treatment: 'pass' | 'invite-accept' | 'invite-decline'): AppliesWhenResult {
  const info = getOpeningCallInfo(context.dealer, context.auction);
  if (context.stage !== 'overcallerRebid' || info === null ||
      context.auction.length !== info.index + 5 ||
      context.auction[info.index + 1] !== '1NT' ||
      context.auction[info.index + 4] !== 'Pass') {
    return { success: false, telemetryLines: [] };
  }
  const opening = parseSuitBid(info.call);
  const response = parseSuitBid(context.auction[info.index + 2] ?? 'Pass');
  const advance = context.auction[info.index + 3];
  if (opening === null || opening.level !== 1 || opening.strain === 'NT' ||
      response === null || response.level !== 2 || response.strain === 'NT' ||
      response.strain === opening.strain ||
      cheapestBidInStrainAfter({ level: 1, strain: 'NT' }, response.strain) !==
        context.auction[info.index + 2] ||
      (advance !== 'Pass' && advance !== '2NT')) {
    return { success: false, telemetryLines: [] };
  }
  const minimum = system.oneNtOpening === '15-17' ? 15 : 16;
  const hcp = context.handFacts.hcp;
  const success = treatment === 'pass' ? advance === 'Pass' && call === 'Pass' &&
    hcp <= minimum + 1 :
    treatment === 'invite-decline' ? advance === '2NT' && call === 'Pass' &&
      hcp <= minimum + 1 :
    advance === '2NT' && call === '3NT' && hcp >= minimum + 1;
  return { success, telemetryLines: [success ?
    'PASS: limited natural continuation after interference over our 1NT overcall.' :
    'FAIL: no modeled natural continuation or missing stopper/strength.'] };
}

export function contestedOneNtOvercallerBoundaryApplies (context: RuleEvalContext):
    AppliesWhenResult {
  const info = getOpeningCallInfo(context.dealer, context.auction);
  const opening = info === null ? null : parseSuitBid(info.call);
  const responder = info === null ? null : parseSuitBid(context.auction[info.index + 2] ?? 'Pass');
  const advance = info === null ? null : context.auction[info.index + 3];
  const success = context.stage === 'overcallerRebid' && info !== null &&
    context.auction.length === info.index + 5 && opening !== null &&
    opening.level === 1 && opening.strain !== 'NT' &&
    context.auction[info.index + 1] === '1NT' && responder !== null &&
    responder.level === 2 && responder.strain !== 'NT' &&
    (advance === 'Pass' || advance === '2NT');
  return { success, telemetryLines: [success ?
    'Additional competitive 1NT-overcall bidding needs partnership judgment.' :
    'Not a modeled natural 1NT competition.'] };
}

///
//// Natural 1NT Overcall -- Advancer's Systems-On Responses
///

/// A natural 1NT overcall after a one-level suit opening uses the same response agreements as
/// a 1NT opening. This is overcaller's first rebid, with the opening side having passed twice.
/// Do not let these conventions survive further competition or an opposing 1NT opening (DONT).
function getNaturalOneNtOvercallAdvance (context: RuleEvalContext): Call | null {
  const opening = getOpeningCallInfo(context.dealer, context.auction);
  const bid = opening === null ? null : parseSuitBid(opening.call);
  if (context.stage !== 'overcallerRebid' || opening === null || bid === null ||
      bid.level !== 1 || bid.strain === 'NT' ||
      context.auction.length !== opening.index + 5 ||
      context.auction[opening.index + 1] !== '1NT' ||
      context.auction[opening.index + 2] !== 'Pass' ||
      context.auction[opening.index + 4] !== 'Pass') {
    return null;
  }
  return context.auction[opening.index + 3] ?? null;
}

/// The compulsory Stayman answer is the same as for a 1NT opening: hearts first with both majors.
export function refineNaturalOneNtOvercallStayman (calls: Call[], context: RuleEvalContext):
    CallRefinementResult {
  if (getNaturalOneNtOvercallAdvance(context) !== '2C') {
    return { calls: [], telemetryLines: [] };
  }
  const wanted: Call = context.handFacts.lengths.H >= 4 ? '2H' :
    context.handFacts.lengths.S >= 4 ? '2S' : '2D';
  return { calls: calls.filter((call) => call === wanted), telemetryLines: [] };
}

/// Transfers are compulsory regardless of the overcaller's strength; superaccepts are not modeled.
export function refineNaturalOneNtOvercallJacoby (calls: Call[], context: RuleEvalContext):
    CallRefinementResult {
  const advance = getNaturalOneNtOvercallAdvance(context);
  const wanted: Call | null = advance === '2D' ? '2H' : advance === '2H' ? '2S' : null;
  return { calls: wanted === null ? [] : calls.filter((call) => call === wanted),
           telemetryLines: [] };
}

export function refineNaturalOneNtOvercallTexas (calls: Call[], context: RuleEvalContext):
    CallRefinementResult {
  const advance = getNaturalOneNtOvercallAdvance(context);
  const wanted: Call | null = advance === '4D' ? '4H' : advance === '4H' ? '4S' : null;
  return { calls: wanted === null ? [] : calls.filter((call) => call === wanted),
           telemetryLines: [] };
}

/// Natural 1NT advances share the configured 15-17/16-18 thresholds, even though a natural
/// 1NT overcall itself permits 15-18 HCP. At the middle value, both invitation decisions survive.
export function naturalOneNtOvercallerInvitationApplies (
  _call: Call, context: RuleEvalContext, system: BiddingSystem,
  invitation: '2NT' | '4NT', accept: boolean): AppliesWhenResult {
  const advance = getNaturalOneNtOvercallAdvance(context);
  const minimum = system.oneNtOpening === '15-17' ? 15 : 16;
  const hcp = context.handFacts.hcp;
  const strengthApplies = accept ? hcp >= minimum + 1 : hcp <= minimum + 1;
  const success = advance === invitation && strengthApplies;
  return { success, telemetryLines: [success ?
    `PASS: ${hcp} HCP permits ${accept ? 'accepting' : 'declining'} the ${invitation} invitation.` :
    `FAIL: ${invitation} ${accept ? 'acceptance' : 'decline'} does not qualify at ${hcp} HCP.`] };
}

/// A good six-card minor invitation is accepted only with a fitting top honor in that minor.
export function naturalOneNtOvercallerMinorInvitationApplies (
  _call: Call, context: RuleEvalContext, accept: boolean): AppliesWhenResult {
  const advance = getNaturalOneNtOvercallAdvance(context);
  const minor: Suit | null = advance === '3C' ? 'C' : advance === '3D' ? 'D' : null;
  const topHonor = minor !== null && getCardsForSuit(context.hand, minor).some((card) =>
    card.rank === 'A' || card.rank === 'K' || card.rank === 'Q');
  const success = minor !== null && (accept ? topHonor : ! topHonor);
  return { success, telemetryLines: [success ?
    `PASS: ${accept ? 'accept' : 'decline'} 3${minor} with${topHonor ? '' : 'out'} a fitting A/K/Q.` :
    'FAIL: the natural minor invitation or required fitting-honor condition is absent.'] };
}

/// With natural 3M (Jacoby off), select 3NT on doubleton support or major game with 3+ support.
/// With Jacoby on, direct 3M shows slam interest; four of that major is the bounded next call.
export function naturalOneNtOvercallerThreeMajorApplies (
  call: Call, context: RuleEvalContext, system: BiddingSystem): AppliesWhenResult {
  const advance = getNaturalOneNtOvercallAdvance(context);
  const suit: Suit | null = advance === '3H' ? 'H' : advance === '3S' ? 'S' : null;
  const support = suit === null ? 0 : context.handFacts.lengths[suit];
  const success = suit !== null && (system.jacobyTransfers
    ? call === `4${suit}` :
    (support === 2 && call === '3NT') || (support >= 3 && call === `4${suit}`));
  return { success, telemetryLines: [success ?
    `PASS: natural 3${suit} continuation with ${support}-card support.` :
    'FAIL: no matching selected three-major continuation.'] };
}

export function naturalOneNtOvercallerSignoffApplies (
  _call: Call, context: RuleEvalContext, system: BiddingSystem): AppliesWhenResult {
  const advance = getNaturalOneNtOvercallAdvance(context);
  const success = advance === '3NT' || advance === '6NT' || advance === '7NT' ||
    (! system.jacobyTransfers && (advance === '2H' || advance === '2S')) ||
    (! system.texasTransfers && (advance === '4H' || advance === '4S'));
  return { success, telemetryLines: [success ?
    `PASS: ${advance} is a natural signoff under these agreements.` :
    'FAIL: no matching natural signoff, or the call has an artificial meaning.'] };
}

/// Gerber and forcing 5NT require further ace or slam responses outside the chosen depth.
export function naturalOneNtOvercallerSlamBoundaryApplies (
  context: RuleEvalContext): AppliesWhenResult {
  const advance = getNaturalOneNtOvercallAdvance(context);
  const success = advance === '4C' || advance === '5NT';
  return { success, telemetryLines: [success ?
    'This artificial slam continuation is outside the modeled response family.' :
    'No unsupported ace inquiry or forcing 5NT response in this auction.'] };
}

/// getWeakTwoTwoNtConventionCall returns advancer's forcing conventional call after partner's
/// natural 2NT overcall of a weak two, provided responder and opener both pass as expected.
function getWeakTwoTwoNtConventionCall (context: RuleEvalContext): Call | null {
  const opening = getOpeningCallInfo(context.dealer, context.auction);
  if (context.stage !== 'overcallerRebid' || opening === null ||
      ! ['2D', '2H', '2S'].includes(opening.call) ||
      context.auction.length !== opening.index + 5 ||
      context.auction[opening.index + 1] !== '2NT' ||
      context.auction[opening.index + 2] !== 'Pass' ||
      context.auction[opening.index + 4] !== 'Pass') {
    return null;
  }
  return context.auction[opening.index + 3] ?? null;
}

/// Stayman after the natural 2NT overcall uses ordinary 3D/3H/3S replies, showing hearts first
/// when the overcaller holds both four-card majors.
export function refineWeakTwoTwoNtStaymanReply (calls: Call[], context: RuleEvalContext):
    CallRefinementResult {
  if (getWeakTwoTwoNtConventionCall(context) !== '3C') {
    return { calls: [], telemetryLines: [] };
  }
  const wanted: Call = context.handFacts.lengths.H >= 4 ? '3H'
    : context.handFacts.lengths.S >= 4 ? '3S' : '3D';
  return { calls: calls.filter((call) => call === wanted), telemetryLines: [] };
}

/// Complete the basic 3D/3H Jacoby transfer after a natural 2NT overcall of a weak two.
export function refineWeakTwoTwoNtJacobyCompletion (calls: Call[], context: RuleEvalContext):
    CallRefinementResult {
  const response = getWeakTwoTwoNtConventionCall(context);
  const wanted: Call | null = response === '3D' ? '3H' : response === '3H' ? '3S' : null;
  return { calls: wanted === null ? [] : calls.filter((call) => call === wanted),
           telemetryLines: [] };
}

/// Complete the basic 4D/4H Texas transfer after a natural 2NT overcall of a weak two.
export function refineWeakTwoTwoNtTexasCompletion (calls: Call[], context: RuleEvalContext):
    CallRefinementResult {
  const response = getWeakTwoTwoNtConventionCall(context);
  const wanted: Call | null = response === '4D' ? '4H' : response === '4H' ? '4S' : null;
  return { calls: wanted === null ? [] : calls.filter((call) => call === wanted),
           telemetryLines: [] };
}

///
//// DONT over a Strong 1NT
///

/// The compact DONT treatment in this app uses shape and suit quality rather than trying to
/// model vulnerability.  A one-suited hand has exactly one 6+ card suit and no second 4-card suit.
function getDontSingleSuit (context: RuleEvalContext): Suit | null {
  const longSuits = SUITS.filter((suit) => context.handFacts.lengths[suit] >= 6);
  if (longSuits.length !== 1) return null;
  const suit = longSuits[0]!;
  if (SUITS.some((other) => other !== suit && context.handFacts.lengths[other] >= 4) ||
      ! hasPreemptSuitQuality(context.hand, suit)) {
    return null;
  }
  return suit;
}

/// A DONT two-suiter has exactly two suits of at least four cards, at least nine cards between
/// them, and useful honor concentration in a five-card-or-longer member of the pair.
function getDontTwoSuits (context: RuleEvalContext, lowerSuit: Suit,
                          higherSuits: readonly Suit[]): [Suit, Suit] | null {
  const fourCardSuits = SUITS.filter((suit) => context.handFacts.lengths[suit] >= 4);
  if (fourCardSuits.length !== 2 || ! fourCardSuits.includes(lowerSuit)) return null;
  const higherSuit = fourCardSuits.find((suit) => higherSuits.includes(suit));
  if (higherSuit === undefined ||
      context.handFacts.lengths[lowerSuit] + context.handFacts.lengths[higherSuit] < 9) {
    return null;
  }
  const quality = [lowerSuit, higherSuit].some((suit) =>
    context.handFacts.lengths[suit] >= 5 && hasPreemptSuitQuality(context.hand, suit));
  return quality ? [lowerSuit, higherSuit] : null;
}

/// In this compact DONT treatment, Double shows a good one-suited club, diamond, or heart hand.
/// Direct 2S handles the ordinary one-suited spade hand; stronger spade distinctions are deferred.
export function dontSingleSuitDoubleApplies (_call: Call, context: RuleEvalContext):
    AppliesWhenResult {
  const suit = getDontSingleSuit(context);
  const success = context.handFacts.hcp >= 7 && suit !== null && suit !== 'S';
  return { success, telemetryLines: [success ?
    `PASS: DONT Double shows the one-suited ${suit} hand.` :
    'FAIL: DONT Double needs 7+ HCP and one good 6+ card non-spade suit.'] };
}

/// 2C/2D/2H show the named lower suit plus exactly one higher suit, normally at least 5-4.
export function dontTwoSuitOvercallApplies (call: Call, context: RuleEvalContext):
    AppliesWhenResult {
  const shape = call === '2C' ? getDontTwoSuits(context, 'C', ['D', 'H', 'S']) :
    call === '2D' ? getDontTwoSuits(context, 'D', ['H', 'S']) :
    call === '2H' ? getDontTwoSuits(context, 'H', ['S']) : null;
  const success = context.handFacts.hcp >= 7 && shape !== null;
  return { success, telemetryLines: [success ?
    `PASS: DONT ${call} shows ${shape[0]} plus ${shape[1]}.` :
    `FAIL: DONT ${call} needs 7+ HCP and the modeled 5-4-or-better two-suit shape.`] };
}

/// Direct 2S is the app's ordinary one-suited spade action: 7+ HCP and a good 6+ card suit.
export function dontSpadeOvercallApplies (_call: Call, context: RuleEvalContext):
    AppliesWhenResult {
  const success = context.handFacts.hcp >= 7 && getDontSingleSuit(context) === 'S';
  return { success, telemetryLines: [success ?
    'PASS: direct 2S shows the ordinary one-suited spade DONT hand.' :
    'FAIL: direct DONT 2S needs 7+ HCP and one good 6+ card spade suit.'] };
}

/// After advancer makes the basic DONT relay/pass-or-correct call and opener passes, the
/// overcaller either accepts that strain or names the concealed suit.  Game-inquiry continuations
/// and responder interference are intentionally outside this compact treatment.
export function refineDontOvercallerCorrection (calls: Call[], context: RuleEvalContext):
    CallRefinementResult {
  const opening = getOpeningCallInfo(context.dealer, context.auction);
  if (context.stage !== 'overcallerRebid' || opening === null || opening.call !== '1NT' ||
      context.auction.length !== opening.index + 5 ||
      context.auction[opening.index + 2] !== 'Pass' ||
      context.auction[opening.index + 4] !== 'Pass') {
    return { calls: [], telemetryLines: [] };
  }
  const overcall = context.auction[opening.index + 1];
  const advance = context.auction[opening.index + 3];
  let target: Call | null = null;
  if (overcall === 'Double' && advance === '2C') {
    const suit = getDontSingleSuit(context);
    target = suit === null ? null : suit === 'C' ? 'Pass' : `2${suit}` as Call;
  } else if (overcall === '2C' && advance === '2D') {
    const shape = getDontTwoSuits(context, 'C', ['D', 'H', 'S']);
    const higher = shape?.[1];
    target = higher === undefined ? null : higher === 'D' ? 'Pass' : `2${higher}` as Call;
  } else if (overcall === '2D' && advance === '2H') {
    const shape = getDontTwoSuits(context, 'D', ['H', 'S']);
    const higher = shape?.[1];
    target = higher === undefined ? null : higher === 'H' ? 'Pass' : '2S';
  } else if (overcall === '2H' && advance === '2S') {
    target = getDontTwoSuits(context, 'H', ['S']) === null ? null : 'Pass';
  }
  return { calls: target === null ? [] : calls.filter((call) => call === target),
           telemetryLines: [] };
}

///
//// Takeout Doubles
///

/// ordinaryTakeoutDoubleApplies checks the ordinary takeout double (not the strong-hand
/// exception): 13+ shortage-adjusted points, fewer than 18 HCP, and 3+ cards in each unbid suit.
///
export function ordinaryTakeoutDoubleApplies (_call: Call, context: RuleEvalContext):
     AppliesWhenResult {
  const opening = getOpeningCallInfo(context.dealer, context.auction)?.call;
  const parsed = opening === undefined ? null : parseSuitBid(opening);
  if (parsed === null || parsed.strain === 'NT') {
    return { success: false, telemetryLines: ['FAIL: requires a natural suit opening.'] };
  }
  const unbid = SUITS.filter((suit) => suit !== parsed.strain);
  const support = unbid.every((suit) => context.handFacts.lengths[suit] >= 3);
  const points = context.handFacts.totalPointsWShortage;
  return {
    success: support && points >= 13 && context.handFacts.hcp < 18,
    telemetryLines: [
      `${points >= 13 ? 'PASS' : 'FAIL'}: ${points} points with shortage; need at least 13.`,
      `${support ? 'PASS' : 'FAIL'}: need three cards in each unbid suit (${unbid.map((suit) =>
        `${suit}=${context.handFacts.lengths[suit]}`).join(', ')}).`,
      `${context.handFacts.hcp < 18 ? 'PASS' : 'FAIL'}: 18+ HCP uses the strong-double rule.`,
    ],
  };
}
