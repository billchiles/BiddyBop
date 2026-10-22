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
//// Preemptive Jump Overcall -- After Advancer's Forcing New Suit
///

/// The forcing-new-suit advance is economical (not a jump), no higher than three,
/// and distinct from both opener's suit and the preempt suit.  Both intervening
/// opponents passed.  This is separate from the non-jump overcaller-rebid family.
type JumpOvercallForcingAdvance = {
  suit: Suit;
  advanceSuit: Suit;
  overcallLevel: 2 | 3;
  advanceBid: NonNullable<ReturnType<typeof parseSuitBid>>;
};

function getJumpOvercallForcingAdvance (context: RuleEvalContext):
    JumpOvercallForcingAdvance | null {
  const opening = getOpeningCallInfo(context.dealer, context.auction);
  if (context.stage !== 'overcallerRebid' || opening === null ||
      context.auction.length !== opening.index + 5 ||
      context.auction[opening.index + 2] !== 'Pass' ||
      context.auction[opening.index + 4] !== 'Pass') return null;
  const openingBid = parseSuitBid(opening.call);
  const overcallCall = context.auction[opening.index + 1];
  const overcallBid = overcallCall === undefined ? null : parseSuitBid(overcallCall);
  const advanceCall = context.auction[opening.index + 3];
  const advanceBid = advanceCall === undefined ? null : parseSuitBid(advanceCall);
  if (openingBid === null || openingBid.level !== 1 || openingBid.strain === 'NT' ||
      overcallBid === null || overcallBid.strain === 'NT' ||
      overcallBid.strain === openingBid.strain ||
      (overcallBid.level !== 2 && overcallBid.level !== 3) ||
      advanceBid === null || advanceBid.strain === 'NT' || advanceBid.level > 3 ||
      advanceBid.strain === overcallBid.strain ||
      advanceBid.strain === openingBid.strain) return null;
  const cheapestOvercall = cheapestBidInStrainAfter(openingBid, overcallBid.strain);
  const cheapestOvercallBid = cheapestOvercall === null ? null : parseSuitBid(cheapestOvercall);
  if (cheapestOvercallBid === null || overcallBid.level <= cheapestOvercallBid.level ||
      cheapestBidInStrainAfter(overcallBid, advanceBid.strain) !== advanceCall) return null;
  return { suit: overcallBid.strain as Suit, advanceSuit: advanceBid.strain as Suit,
           overcallLevel: overcallBid.level as 2 | 3, advanceBid };
}

/// A three-level raise describes an eight-card fit.  At the four level, require
/// better fit/playing strength: four trumps, A/K, or QJ in advancer's suit.
/// Three small cards alone must not drive the weak preempter to four of a new suit.
function usefulJumpOvercallAdvanceSupport (context: RuleEvalContext,
                                          info: JumpOvercallForcingAdvance,
                                          raise: Call | null): boolean {
  if (raise === null) return false;
  const bid = parseSuitBid(raise);
  const length = context.handFacts.lengths[info.advanceSuit];
  if (bid === null || bid.level > 4 || length < 3) return false;
  if (bid.level <= 3) return true;
  const honors = getCardsForSuit(context.hand, info.advanceSuit).map((card) => card.rank);
  return length >= 4 || honors.includes('A') || honors.includes('K') ||
    (honors.includes('Q') && honors.includes('J'));
}

/// After a weak jump overcall, the new suit forces one more call but does not
/// promise game.  Raise a known fit when economical/safe; otherwise repeat the
/// preempt suit at its cheapest level.  NT, second suits, and unusual high-level
/// choices remain outside this limited treatment.
export function jumpOvercallForcingAdvanceRebidApplies (
    call: Call, context: RuleEvalContext, treatment: 'support' | 'repeat'): AppliesWhenResult {
  const info = getJumpOvercallForcingAdvance(context);
  if (info === null) return { success: false, telemetryLines: [
    'FAIL: requires a genuine two-/three-level jump overcall, a non-jump forcing new ' +
    'suit advance no higher than three, and both intervening opponents passing.',
  ] };
  const ownLength = context.handFacts.lengths[info.suit];
  const hcp = context.handFacts.hcp;
  const preemptive = ownLength === info.overcallLevel + 4 &&
    (info.overcallLevel !== 2 || hcp >= 5) && hcp <= (info.overcallLevel === 2 ? 11 : 9) &&
    hasPreemptSuitQuality(context.hand, info.suit);
  const raise = cheapestBidInStrainAfter(info.advanceBid, info.advanceSuit);
  const support = usefulJumpOvercallAdvanceSupport(context, info, raise);
  const repeat = cheapestBidInStrainAfter(info.advanceBid, info.suit);
  const success = preemptive && (treatment === 'support' ?
    support && call === raise : !support && call === repeat &&
    (parseSuitBid(repeat!)?.level ?? 8) <= 4);
  return { success, telemetryLines: [
    `${preemptive ? 'PASS' : 'FAIL'}: original preempt needs a good ` +
      `${info.overcallLevel + 4}-card suit and limited HCP.`,
    `${support ? 'PASS' : 'FAIL'}: support for advancer's forcing suit ` +
      'meets the required strength for the cheapest raise.',
    `${success ? 'PASS' : 'FAIL'}: ${treatment === 'support' ? 'raise' : 'return to'} ` +
      'the suit at the cheapest legal level; do not Pass the one-round force.',
  ] };
}

/// When no selected natural description applies, explain the outstanding one-round
/// force instead of using a generic Pass or treating lack of a bid as agreement to stop.
export function jumpOvercallForcingAdvanceBoundaryApplies (context: RuleEvalContext):
    AppliesWhenResult {
  const success = getJumpOvercallForcingAdvance(context) !== null;
  return { success, telemetryLines: [success ?
    'PASS: forcing advance after a preemptive jump overcall may need judgment beyond ' +
      'the selected natural replies.' :
    'FAIL: not a forcing new-suit advance after a preemptive jump overcall.'] };
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
  // The natural overcall still shows 15-18 HCP.  The selected 1NT response agreement
  // changes what advancer promises with 2NT, so the borderline acceptance strength shifts.
  // The selected limited Pass continuation retains the same strength cutoff.
  const responseStrengthCutoffHcp = system.oneNtOpening === '15-17' ? 16 : 17;
  const hcp = context.handFacts.hcp;
  const success = treatment === 'pass' ? advance === 'Pass' && call === 'Pass' &&
    hcp <= responseStrengthCutoffHcp :
    treatment === 'invite-decline' ? advance === '2NT' && call === 'Pass' &&
      hcp <= responseStrengthCutoffHcp :
    advance === '2NT' && call === '3NT' && hcp >= responseStrengthCutoffHcp;
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

/// A natural 1NT overcall always shows 15-18 HCP, but advancer uses the selected 1NT
/// opening-response agreement.  Its 2NT/4NT invitations therefore promise different strength
/// under the 15-17 and 16-18 settings.  At the corresponding borderline overcaller strength,
/// both accepting and declining the invitation qualify.
export function naturalOneNtOvercallerInvitationApplies (
  _call: Call, context: RuleEvalContext, system: BiddingSystem,
  invitation: '2NT' | '4NT', accept: boolean): AppliesWhenResult {
  const advance = getNaturalOneNtOvercallAdvance(context);
  // This is the borderline for an invitation under advancer's configured response ranges,
  // not the minimum HCP of the natural 1NT overcall (which remains 15-18 in either system).
  const invitationBorderlineHcp = system.oneNtOpening === '15-17' ? 16 : 17;
  const hcp = context.handFacts.hcp;
  const strengthApplies = accept ? hcp >= invitationBorderlineHcp :
    hcp <= invitationBorderlineHcp;
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

/// getWeakTwoTwoNtConventionCall identifies advancer's call after partner's natural 2NT
/// overcall of a weak two, provided responder and opener both pass as expected.
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

/// A natural game or partscore chosen by advancer is a signoff, not a Stayman,
/// Jacoby, or Texas request. Inspect the agreement so identical calls cannot be
/// treated as both artificial transfers and natural signoffs.
export function weakTwoTwoNtNaturalSignoffApplies (
    call: Call, context: RuleEvalContext, system: BiddingSystem): AppliesWhenResult {
  const advance = getWeakTwoTwoNtConventionCall(context);
  const natural = advance === '3NT' ||
    (! system.jacobyTransfers && (advance === '3H' || advance === '3S')) ||
    (! system.texasTransfers && (advance === '4H' || advance === '4S'));
  const success = call === 'Pass' && natural;
  return { success, telemetryLines: [success ?
    `PASS: ${advance} is a natural signoff after 2NT under these agreements.` :
    'FAIL: not a natural signoff, or advancer made a conventional request.'] };
}

///
//// Selected Rebids after Defending a Weak Two
///

/// The opening side must pass twice. Keep these classifications separate from
/// one-level defenses: the opening level changes the meaning of economical advances.
type WeakTwoDefenseAdvance = {
  opening: Suit;
  defense: 'Double' | 'suit';
  overcallSuit: Suit | null;
  kind: 'minimumSuit' | 'jumpSuit' | 'cuebid' | 'twoNt' | 'threeNt' |
    'majorGame' | 'simpleRaise' | 'forcingNewSuit';
  advanceSuit: Suit | null;
  lastBid: NonNullable<ReturnType<typeof parseSuitBid>>;
};

function getWeakTwoDefenseAdvance (context: RuleEvalContext): WeakTwoDefenseAdvance | null {
  const info = getOpeningCallInfo(context.dealer, context.auction);
  if (context.stage !== 'overcallerRebid' || info === null ||
      ! ['2D', '2H', '2S'].includes(info.call) ||
      context.auction.length !== info.index + 5 ||
      context.auction[info.index + 2] !== 'Pass' ||
      context.auction[info.index + 4] !== 'Pass') return null;
  const opening = parseSuitBid(info.call)!;
  const defenseCall = context.auction[info.index + 1] ?? 'Pass';
  const defenseBid = parseSuitBid(defenseCall);
  const advance = context.auction[info.index + 3] ?? 'Pass';
  const bid = parseSuitBid(advance);
  if (bid === null) return null;
  const doubled = defenseCall === 'Double';
  if (! doubled && (defenseBid === null || defenseBid.level !== 2 ||
      defenseBid.strain === 'NT' ||
      cheapestBidInStrainAfter(opening, defenseBid.strain) !== defenseCall)) return null;
  const openingSuit = opening.strain as Suit;
  const overcallSuit = doubled ? null : defenseBid!.strain as Suit;
  let kind: WeakTwoDefenseAdvance['kind'] | null = null;
  let advanceSuit: Suit | null = null;
  if (advance === '2NT') kind = 'twoNt';
  if (advance === '3NT') kind = 'threeNt';
  if (bid.strain !== 'NT') {
    const suit = bid.strain as Suit;
    if (doubled) {
      if (suit === openingSuit &&
          cheapestBidInStrainAfter(opening, suit) === advance) kind = 'cuebid';
      if (suit !== openingSuit) {
        const cheapest = cheapestBidInStrainAfter(opening, suit);
        const cheapestLevel = cheapest === null ? null : parseSuitBid(cheapest)?.level;
        if (advance === cheapest) kind = 'minimumSuit';
        if (cheapestLevel !== undefined && cheapestLevel !== null &&
            bid.level === cheapestLevel + 1 && bid.level <= 3) kind = 'jumpSuit';
        if (bid.level === 4 && (suit === 'H' || suit === 'S')) kind = 'majorGame';
        advanceSuit = suit;
      }
    } else if (suit === overcallSuit && bid.level === 3) {
      kind = 'simpleRaise';
      advanceSuit = suit;
    } else if (suit === openingSuit &&
               cheapestBidInStrainAfter(defenseBid!, suit) === advance) {
      kind = 'cuebid';
    } else if (suit !== openingSuit && suit !== overcallSuit &&
               cheapestBidInStrainAfter(defenseBid!, suit) === advance) {
      kind = 'forcingNewSuit';
      advanceSuit = suit;
    }
  }
  return kind === null ? null : { opening: openingSuit,
    defense: doubled ? 'Double' : 'suit', overcallSuit,
    kind, advanceSuit, lastBid: bid };
}

/// Weak-two Double rebids distinguish the involuntary minimum suit response from
/// constructive jumps, natural notrump, and forcing cuebids. In particular an
/// 18+ HCP Double is never silently passed after a weak minimum advance.
type WeakTwoDoublerAction = 'minimum-pass' | 'jump-pass' | 'jump-game' | 'minimum-raise' |
  'nt-pass' | 'nt-game' | 'game-pass' | 'cue-suit' | 'cue-nt' |
  'strong-suit' | 'strong-nt';

export function weakTwoDoublerRebidApplies (
    call: Call, context: RuleEvalContext, action: WeakTwoDoublerAction): AppliesWhenResult {
  const info = getWeakTwoDefenseAdvance(context);
  if (info === null || info.defense !== 'Double') return { success: false, telemetryLines: [
    'FAIL: requires a weak-two takeout Double, supported advance, and opposing Passes.',
  ] };
  const hcp = context.handFacts.hcp;
  const ordinary = hcp < 18 && context.handFacts.totalPointsWShortage >= 13 &&
    SUITS.filter((suit) => suit !== info.opening).every((suit) =>
      context.handFacts.lengths[suit] >= 3);
  const strong = hcp >= 18;
  const suit = info.advanceSuit;
  const support = suit === null ? 0 : context.handFacts.lengths[suit];
  const cheapest = (strain: Suit | 'NT') => cheapestBidInStrainAfter(info.lastBid, strain);
  const suitRebid = suit === null ? null : cheapest(suit);
  const unbid = SUITS.filter((candidate) => candidate !== info.opening);
  const strongSuit = unbid.some((candidate) =>
    context.handFacts.lengths[candidate] >= 5 &&
    (context.handFacts.lengths[candidate] >= 6 || hasPreemptSuitQuality(context.hand, candidate)) &&
    cheapest(candidate) === call && (parseSuitBid(call)?.level ?? 8) <= 3);
  const stopper = hasBasicSuitStopper(context, info.opening);
  let success = false;
  if (ordinary || strong) switch (action) {
    case 'minimum-pass':
      success = ordinary && info.kind === 'minimumSuit' && call === 'Pass';
      break;
    case 'jump-pass':
      success = ordinary && info.kind === 'jumpSuit' && hcp <= 15 && call === 'Pass';
      break;
    case 'jump-game':
      success = info.kind === 'jumpSuit' && suit !== null && support >= 4 &&
        (suit === 'H' || suit === 'S') && (strong || ordinary && hcp >= 16) &&
        call === `4${suit}`;
      break;
    case 'minimum-raise':
      success = info.kind === 'minimumSuit' && strong && support >= 4 &&
        (suit === 'H' || suit === 'S') && suitRebid === call &&
        (parseSuitBid(call)?.level ?? 8) <= 3;
      break;
    case 'nt-pass':
      success = info.kind === 'twoNt' && ordinary && hcp <= 14 && call === 'Pass';
      break;
    case 'nt-game':
      success = info.kind === 'twoNt' && (strong || ordinary && hcp >= 15) &&
        call === '3NT';
      break;
    case 'game-pass':
      success = (info.kind === 'threeNt' || info.kind === 'majorGame') && call === 'Pass';
      break;
    case 'cue-suit':
      success = info.kind === 'cuebid' && unbid.some((candidate) =>
        context.handFacts.lengths[candidate] >= 4 && cheapest(candidate) === call &&
        (parseSuitBid(call)?.level ?? 8) <= 3);
      break;
    case 'cue-nt':
      success = info.kind === 'cuebid' && call === '3NT' &&
        context.handFacts.balancedOrSemiBalanced && stopper && hcp >= 14;
      break;
    case 'strong-suit':
      success = strong && (info.kind === 'minimumSuit' || info.kind === 'jumpSuit') && strongSuit;
      break;
    case 'strong-nt':
      success = strong && (info.kind === 'minimumSuit' || info.kind === 'jumpSuit') &&
        context.handFacts.balanced && stopper &&
        ((call === '2NT' && hcp >= 18 && hcp <= 21 && cheapest('NT') === '2NT') ||
         (call === '3NT' && hcp >= 21 && cheapest('NT') !== null &&
          (parseSuitBid(cheapest('NT')!)?.level ?? 8) <= 3));
      break;
  }
  return { success, telemetryLines: [success ?
    `PASS: ${action} after a ${ordinary ? 'support-oriented' : 'strong'} weak-two Double.` :
    `FAIL: ${action} does not fit this weak-two Double and advance.`] };
}

/// The two-level overcall is natural and not forcing. A simple raise or 3NT may
/// be accepted, while a cuebid or a forcing new suit requires a real response.
type WeakTwoSuitAction = 'raise-pass' | 'raise-game' | 'nt-pass' | 'nt-game' |
  'game-pass' | 'cue-return' | 'cue-game' |
  'new-support' | 'new-repeat' | 'new-nt';

export function weakTwoSuitOvercallerRebidApplies (
    call: Call, context: RuleEvalContext, action: WeakTwoSuitAction): AppliesWhenResult {
  const info = getWeakTwoDefenseAdvance(context);
  if (info === null || info.defense !== 'suit' || info.overcallSuit === null) {
    return { success: false, telemetryLines: [
      'FAIL: requires a natural two-level overcall of a weak two and opposing Passes.',
    ] };
  }
  const ownSuit = info.overcallSuit;
  const ownLength = context.handFacts.lengths[ownSuit];
  const hcp = context.handFacts.hcp;
  const support = info.advanceSuit === null ? 0 : context.handFacts.lengths[info.advanceSuit];
  const cheapest = (suit: Suit | 'NT') => cheapestBidInStrainAfter(info.lastBid, suit);
  let success = false;
  switch (action) {
    case 'raise-pass':
      success = info.kind === 'simpleRaise' && call === 'Pass' &&
        (hcp <= 15 || ownLength < 6);
      break;
    case 'raise-game':
      success = info.kind === 'simpleRaise' && hcp >= 16 && ownLength >= 6 &&
        (ownSuit === 'H' || ownSuit === 'S') && call === `4${ownSuit}`;
      break;
    case 'nt-pass':
      success = info.kind === 'twoNt' && hcp <= 14 && call === 'Pass';
      break;
    case 'nt-game':
      success = info.kind === 'twoNt' && hcp >= 15 &&
        context.handFacts.balancedOrSemiBalanced && call === '3NT';
      break;
    case 'game-pass':
      success = info.kind === 'threeNt' && call === 'Pass';
      break;
    case 'cue-return':
      success = info.kind === 'cuebid' && hcp <= 15 &&
        cheapest(ownSuit) === call && (parseSuitBid(call)?.level ?? 8) <= 3;
      break;
    case 'cue-game':
      success = info.kind === 'cuebid' && hcp >= 16 && ownLength >= 6 &&
        (ownSuit === 'H' || ownSuit === 'S') && call === `4${ownSuit}`;
      break;
    case 'new-support':
      success = info.kind === 'forcingNewSuit' && support >= 3 &&
        info.advanceSuit !== null && cheapest(info.advanceSuit) === call &&
        (parseSuitBid(call)?.level ?? 8) <= 3;
      break;
    case 'new-repeat':
      success = info.kind === 'forcingNewSuit' && ownLength >= 6 &&
        cheapest(ownSuit) === call && (parseSuitBid(call)?.level ?? 8) <= 3;
      break;
    case 'new-nt':
      success = info.kind === 'forcingNewSuit' && hcp >= 15 &&
        context.handFacts.balancedOrSemiBalanced &&
        hasBasicSuitStopper(context, info.opening) && call === '3NT';
      break;
  }
  return { success, telemetryLines: [success ?
    `PASS: selected ${action} after a natural weak-two-defense overcall.` :
    `FAIL: no selected ${action} in this weak-two-defense auction.`] };
}

/// Boundaries at the selected rebid depth are explicit when the available space
/// or partner's forcing call prevents a reliable natural continuation.
export function weakTwoDefenseBoundaryApplies (
    context: RuleEvalContext, defense: 'Double' | 'suit', forcing: boolean): AppliesWhenResult {
  const info = getWeakTwoDefenseAdvance(context);
  const isForcing = defense === 'Double' ? info?.kind === 'cuebid' :
    info?.kind === 'cuebid' || info?.kind === 'forcingNewSuit';
  const success = info !== null && info.defense === defense && isForcing === forcing;
  return { success, telemetryLines: [success ?
    'This next choice depends on playing strength, fit, and available bidding room.' :
    'No matching weak-two defensive continuation boundary.'] };
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
//// Takeout Double -- Doubler's Second Call
///
/// Distinguish an ordinary takeout hand from an 18+ HCP strong Double. The original
/// Double does not encode a rule ID in the auction; its hand requirements must be checked
/// again before choosing an ordinary Pass or a stronger description. Weak-two defenses
/// and later rounds of competition are reviewed separately.
type DoublerAdvance = {
  opening: Suit;
  kind: 'minimumSuit' | 'jumpSuit' | 'cuebid' | 'oneNt' | 'twoNt' |
    'threeNt' | 'majorGame' | 'competitiveSuit' | 'responsiveDouble' | 'escape';
  suit: Suit | null;
  lastBid: NonNullable<ReturnType<typeof parseSuitBid>>;
  responderActed: boolean;
};

function getDoublerAdvance (context: RuleEvalContext): DoublerAdvance | null {
  const info = getOpeningCallInfo(context.dealer, context.auction);
  if (context.stage !== 'overcallerRebid' || info === null ||
      context.auction.length !== info.index + 5 ||
      context.auction[info.index + 1] !== 'Double' ||
      context.auction[info.index + 4] !== 'Pass') return null;
  const opening = parseSuitBid(info.call);
  if (opening === null || opening.level !== 1 || opening.strain === 'NT') return null;
  const response = context.auction[info.index + 2] ?? 'Pass';
  const responseBid = parseSuitBid(response);
  const advance = context.auction[info.index + 3] ?? 'Pass';
  const bid = parseSuitBid(advance);
  const last = responseBid ?? opening;
  const openingSuit = opening.strain as Suit;
  const responderActed = response !== 'Pass';
  let kind: DoublerAdvance['kind'] | null = null;
  let suit: Suit | null = null;

  if (response === 'Pass') {
    if (bid !== null && bid.strain === 'NT') {
      if (advance === '1NT') kind = 'oneNt';
      if (advance === '2NT') kind = 'twoNt';
      if (advance === '3NT') kind = 'threeNt';
    } else if (bid !== null && bid.strain === opening.strain &&
               cheapestBidInStrainAfter(opening, bid.strain) === advance) {
      kind = 'cuebid';
    } else if (bid !== null && bid.strain !== 'NT' && bid.strain !== opening.strain) {
      suit = bid.strain as Suit;
      const cheapest = cheapestBidInStrainAfter(opening, bid.strain);
      const parsedCheapest = cheapest === null ? null : parseSuitBid(cheapest);
      if (advance === cheapest) kind = 'minimumSuit';
      if (parsedCheapest !== null && bid.level === parsedCheapest.level + 1 &&
          bid.level <= 3) kind = 'jumpSuit';
      if (bid.level === 4 && (suit === 'H' || suit === 'S')) kind = 'majorGame';
    }
  } else if (response === 'Redouble') {
    if (bid !== null && bid.strain !== 'NT' && bid.strain !== opening.strain &&
        cheapestBidInStrainAfter(opening, bid.strain) === advance) {
      kind = 'escape';
      suit = bid.strain as Suit;
    }
  } else if (responseBid !== null &&
             (responseBid.strain === opening.strain || responseBid.strain === 'NT' ||
              cheapestBidInStrainAfter(opening, responseBid.strain) === response)) {
    if (advance === 'Double' && responseBid.strain === opening.strain) {
      kind = 'responsiveDouble';
    } else if (bid !== null && bid.strain === opening.strain &&
               cheapestBidInStrainAfter(responseBid, opening.strain) === advance) {
      kind = 'cuebid';
    } else if (bid !== null && bid.strain !== 'NT' &&
               bid.strain !== opening.strain &&
               bid.strain !== responseBid.strain &&
               cheapestBidInStrainAfter(responseBid, bid.strain) === advance) {
      kind = 'competitiveSuit';
      suit = bid.strain as Suit;
    }
  }
  return kind === null ? null : {
    opening: openingSuit, kind, suit, lastBid: bid ?? last,
    responderActed,
  };
}

type DoublerRebidTreatment = 'minimum-pass' | 'minimum-raise' | 'maximum-raise' |
  'jump-pass' | 'jump-game' | 'cue-suit' | 'cue-nt' |
  'nt-pass' | 'nt-invite' | 'nt-game' | 'game-pass' |
  'strong-suit' | 'strong-nt' | 'strong-fit' |
  'competitive-pass' | 'competitive-raise' | 'responsive-suit' | 'escape-pass';

export function takeoutDoublerRebidApplies (
    call: Call, context: RuleEvalContext, treatment: DoublerRebidTreatment): AppliesWhenResult {
  const info = getDoublerAdvance(context);
  if (info === null) return { success: false, telemetryLines: [
    'FAIL: not a supported one-level takeout Double followed by a modeled advance and Pass.',
  ] };
  const hcp = context.handFacts.hcp;
  const ordinary = hcp < 18 && context.handFacts.totalPointsWShortage >= 13 &&
    SUITS.filter((suit) => suit !== info.opening).every((suit) =>
      context.handFacts.lengths[suit] >= 3);
  const strong = hcp >= 18;
  if (! ordinary && ! strong) return { success: false, telemetryLines: [
    'FAIL: the hand does not meet the ordinary or strong takeout-Double requirements.',
  ] };
  const points = context.handFacts.totalPointsWShortage;
  const support = info.suit === null ? 0 : context.handFacts.lengths[info.suit];
  const unbid = SUITS.filter((suit) => suit !== info.opening);
  const cheapest = (suit: Suit | 'NT') => cheapestBidInStrainAfter(info.lastBid, suit);
  const suitBid = info.suit === null ? null : cheapest(info.suit);
  const suitLevel = suitBid === null ? 8 : parseSuitBid(suitBid)?.level ?? 8;
  const major = info.suit === 'H' || info.suit === 'S';
  const bestFit = [...unbid].sort((a, b) =>
    context.handFacts.lengths[b] - context.handFacts.lengths[a] ||
    (a === 'H' && b === 'S' ? -1 : a === 'S' && b === 'H' ? 1 : 0))[0];
  const fitCall = bestFit === undefined ? null : cheapest(bestFit);
  const naturalSuit = unbid.find((suit) =>
    context.handFacts.lengths[suit] >= 5 &&
    (context.handFacts.lengths[suit] >= 6 || hasPreemptSuitQuality(context.hand, suit)) &&
    cheapest(suit) === call);
  const stopped = hasBasicSuitStopper(context, info.opening);
  let success = false;
  switch (treatment) {
    case 'minimum-pass':
      success = info.kind === 'minimumSuit' && ordinary && points <= 15 && call === 'Pass';
      break;
    case 'minimum-raise':
      success = info.kind === 'minimumSuit' && ordinary && points >= 16 && points <= 18 &&
        support >= 4 && suitLevel <= 3 && call === suitBid;
      break;
    case 'maximum-raise':
      success = info.kind === 'minimumSuit' && ordinary && points >= 19 && support >= 4 &&
        major && call === `4${info.suit}` && suitLevel <= 4;
      break;
    case 'jump-pass':
      success = info.kind === 'jumpSuit' && ordinary && points <= 16 && call === 'Pass';
      break;
    case 'jump-game':
      success = info.kind === 'jumpSuit' && major && support >= 4 &&
        (strong || ordinary && points >= 17) && suitLevel <= 4 &&
        call === `4${info.suit}`;
      break;
    case 'cue-suit':
      success = info.kind === 'cuebid' && fitCall === call && bestFit !== undefined &&
        context.handFacts.lengths[bestFit] >= 4 &&
        (parseSuitBid(call)?.level ?? 8) <= 3;
      break;
    case 'cue-nt':
      success = info.kind === 'cuebid' &&
        ! unbid.some((suit) => context.handFacts.lengths[suit] >= 4) &&
        context.handFacts.balancedOrSemiBalanced && stopped &&
        ((call === '2NT' && hcp <= 16 && cheapest('NT') === '2NT') ||
         (call === '3NT' && hcp >= 17 && cheapest('NT') !== null &&
          (parseSuitBid(cheapest('NT')!)?.level ?? 8) <= 3));
      break;
    case 'nt-pass':
      success = ordinary && call === 'Pass' &&
        (info.kind === 'oneNt' && hcp <= 14 ||
         info.kind === 'twoNt' && hcp <= 14);
      break;
    case 'nt-invite':
      success = ordinary && info.kind === 'oneNt' && hcp >= 15 && hcp <= 16 &&
        call === '2NT' && cheapest('NT') === '2NT';
      break;
    case 'nt-game':
      success = info.kind === 'oneNt' && (strong || ordinary && hcp >= 17) &&
        call === '3NT' || info.kind === 'twoNt' &&
        (strong || ordinary && hcp >= 15) && call === '3NT';
      break;
    case 'game-pass':
      success = (info.kind === 'threeNt' || info.kind === 'majorGame') &&
        call === 'Pass';
      break;
    case 'strong-suit':
      success = strong && ! info.responderActed &&
        (info.kind === 'minimumSuit' || info.kind === 'jumpSuit') &&
        naturalSuit !== undefined &&
        (info.suit === null || support < 3 || info.responderActed) &&
        (parseSuitBid(call)?.level ?? 8) <= 3;
      break;
    case 'strong-nt':
      success = strong && ! info.responderActed &&
        (info.kind === 'minimumSuit' || info.kind === 'jumpSuit') &&
        context.handFacts.balanced && stopped &&
        ((call === '1NT' && hcp >= 19 && hcp <= 20 && cheapest('NT') === '1NT') ||
         (call === '2NT' && hcp >= 21 && hcp <= 22 && cheapest('NT') !== null &&
          (parseSuitBid(cheapest('NT')!)?.level ?? 8) <= 2) ||
         (call === '3NT' && hcp >= 23 && cheapest('NT') !== null &&
          (parseSuitBid(cheapest('NT')!)?.level ?? 8) <= 3));
      break;
    case 'strong-fit':
      success = strong && (info.kind === 'minimumSuit' || info.kind === 'jumpSuit') &&
        support >= 4 && major && suitLevel <= 4 && call === `4${info.suit}`;
      break;
    case 'competitive-pass':
      success = info.responderActed && info.kind === 'competitiveSuit' && ordinary &&
        points <= 16 && call === 'Pass';
      break;
    case 'competitive-raise':
      success = info.responderActed && info.kind === 'competitiveSuit' &&
        info.suit !== null && support >= 4 && major && hcp >= 16 &&
        suitLevel <= 4 && call === `4${info.suit}`;
      break;
    case 'responsive-suit':
      success = info.kind === 'responsiveDouble' && fitCall === call &&
        bestFit !== undefined && context.handFacts.lengths[bestFit] >= 3 &&
        (parseSuitBid(call)?.level ?? 8) <= 3;
      break;
    case 'escape-pass':
      success = info.kind === 'escape' && ordinary && call === 'Pass';
      break;
  }
  return { success, telemetryLines: [success ?
    `PASS: ${treatment} after a ${ordinary ? 'support-oriented' : 'strong'} takeout Double.` :
    `FAIL: ${treatment} does not fit the Double, advance, and hand strength/shape.`] };
}

export function takeoutDoublerBoundaryApplies (
    context: RuleEvalContext, kind: 'forcing' | 'strong' | 'ordinary'): AppliesWhenResult {
  const info = getDoublerAdvance(context);
  const forcing = info?.kind === 'cuebid' || info?.kind === 'responsiveDouble';
  const success = info !== null && (kind === 'forcing' ? forcing :
    ! forcing && (kind === 'strong' ? context.handFacts.hcp >= 18 :
                  context.handFacts.hcp < 18));
  return { success, telemetryLines: [success ?
    `No selected ${kind} rebid; further fit, strength, or strain judgment is required.` :
    `Not a ${kind} takeout-Doubler boundary.`] };
}

/// The opponents may compete again after advancer's action. No generic higher-level
/// Doubler action is safe here, especially when advancer's call was forcing.
export function takeoutDoublerFurtherCompetitionBoundaryApplies (
    context: RuleEvalContext): AppliesWhenResult {
  const info = getOpeningCallInfo(context.dealer, context.auction);
  const opening = info === null ? null : parseSuitBid(info.call);
  const last = info === null ? null : context.auction[info.index + 4];
  const success = context.stage === 'overcallerRebid' && info !== null &&
    context.auction.length === info.index + 5 && opening !== null &&
    opening.level === 1 && opening.strain !== 'NT' &&
    context.auction[info.index + 1] === 'Double' &&
    context.auction[info.index + 3] !== 'Pass' && last !== null &&
    last !== undefined && last !== 'Pass' && (parseSuitBid(last) !== null || last === 'Double');
  return { success, telemetryLines: [success ?
    'Further opponent competition after the takeout Double needs separate judgment.' :
    'No additional opposing competition in this Doubler-rebid auction.'] };
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
  const shortSuits = unbid.filter((suit) => context.handFacts.lengths[suit] < 3);
  const support = shortSuits.length === 0;
  const points = context.handFacts.totalPointsWShortage;
  const hcp = context.handFacts.hcp;
  return {
    success: support && points >= 13 && hcp < 18,
    telemetryLines: [
      `${points >= 13 ? 'PASS' : 'FAIL'}: ${points} points with shortage; need at least 13.`,
      `${support ? 'PASS' : 'FAIL'}: need three cards in each unbid suit (${unbid.map((suit) =>
        `${suit}=${context.handFacts.lengths[suit]}`).join(', ')}).`,
      `${hcp < 18 ? 'PASS' : 'FAIL'}: 18+ HCP uses the strong-double rule.`,
    ],
    callEvidence: { requirements: [
      { kind: 'totalPoints', actual: points, min: 13, passed: points >= 13 },
      { kind: 'unbidSuitSupport', min: 3, shortSuits, passed: support },
      { kind: 'hcp', actual: hcp, max: 17, passed: hcp < 18 },
    ] },
  };
}

///
//// Fourth-seat balancing after one-level suit opening, Pass, Pass
/// The stage is identified by the physical auction in getNextBiddingRuleStage.  These helpers never
/// reuse direct-seat jump meanings or impose direct-seat opening strength.

function getBalancingOpeningSuit (context: RuleEvalContext): Suit | null {
  if (context.stage !== 'balancing') return null;
  const opening = getOpeningCallInfo(context.dealer, context.auction);
  const bid = opening === null ? null : parseSuitBid(opening.call);
  if (opening === null || bid === null || bid.level !== 1 || bid.strain === 'NT' ||
      context.auction.length !== opening.index + 3 ||
      context.auction[opening.index + 1] !== 'Pass' ||
      context.auction[opening.index + 2] !== 'Pass') return null;
  return bid.strain;
}

/// Cheapest non-jump suit only.  At level one a six-card suit may compensate for
/// modest honor quality; bidding at level two always requires a good five-plus-card suit.
export function refineBalancingSuitBid (calls: Call[], context: RuleEvalContext):
    CallRefinementResult {
  const openingSuit = getBalancingOpeningSuit(context);
  if (openingSuit === null) return { calls: [], telemetryLines: ['Not a suit balancing auction.'] };
  const opening = { level: 1, strain: openingSuit };
  const qualifying = calls.filter((call) => {
    const bid = parseSuitBid(call);
    if (bid === null || bid.strain === 'NT' || bid.strain === openingSuit ||
        cheapestBidInStrainAfter(opening, bid.strain) !== call) return false;
    const suit = bid.strain as Suit;
    const length = context.handFacts.lengths[suit];
    const good = hasPreemptSuitQuality(context.hand, suit);
    return bid.level === 1 ? length >= 6 || (length >= 5 && good) : length >= 5 && good;
  });
  return { calls: qualifying, telemetryLines: [
    'Only the cheapest new-suit call; good five cards or six at level one, ' +
    'and good five-plus cards at level two.',
  ] };
}

export function balancingOneNtApplies (call: Call, context: RuleEvalContext):
    AppliesWhenResult {
  const suit = getBalancingOpeningSuit(context);
  const { hcp, balanced } = context.handFacts;
  const stopper = suit !== null && hasBasicSuitStopper(context, suit);
  const success = call === '1NT' && suit !== null && hcp >= 12 && hcp <= 15 &&
    balanced && stopper;
  return { success, telemetryLines: [
    `${hcp >= 12 && hcp <= 15 ? 'PASS' : 'FAIL'}: balancing 1NT needs 12–15 HCP; has ${hcp}.`,
    `${balanced ? 'PASS' : 'FAIL'}: natural balancing 1NT requires a balanced hand.`,
    `${stopper ? 'PASS' : 'FAIL'}: must hold a stopper in opener's suit.`,
  ] };
}

export function balancingTakeoutDoubleApplies (call: Call, context: RuleEvalContext):
    AppliesWhenResult {
  const suit = getBalancingOpeningSuit(context);
  if (call !== 'Double' || suit === null) return { success: false, telemetryLines: ['Not a balancing Double.'] };
  const { hcp, lengths, totalPointsWShortage } = context.handFacts;
  const shortSuits = SUITS.filter((unbid) => unbid !== suit && lengths[unbid] < 3);
  const support = shortSuits.length === 0;
  const short = lengths[suit] <= 2;
  const eligible = hcp >= 8 && hcp < 16 && totalPointsWShortage >= 10;
  return { success: support && short && eligible, telemetryLines: [
    `${eligible ? 'PASS' : 'FAIL'}: 8–15 HCP, at least 10 shortage points; ` +
      `${hcp} HCP, ${totalPointsWShortage} shortage points.`,
    `${short ? 'PASS' : 'FAIL'}: at most two cards in opener's suit.`,
    `${support ? 'PASS' : 'FAIL'}: at least three cards in each unbid suit.`,
  ], callEvidence: { requirements: [
    { kind: 'hcp', actual: hcp, min: 8, max: 15, passed: hcp >= 8 && hcp < 16 },
    { kind: 'totalPoints', actual: totalPointsWShortage, min: 10,
      passed: totalPointsWShortage >= 10 },
    { kind: 'openerSuitLength', actual: lengths[suit], max: 2, passed: short },
    { kind: 'unbidSuitSupport', min: 3, shortSuits, passed: support },
  ] } };
}

export function balancingStrongDoubleApplies (call: Call, context: RuleEvalContext):
    AppliesWhenResult {
  const suit = getBalancingOpeningSuit(context);
  if (call !== 'Double' || suit === null) return { success: false, telemetryLines: ['Not a balancing Double.'] };
  const { hcp, lengths } = context.handFacts;
  // Strong Double is flexible but not an automatic penalty-style double with a long
  // holding in opener's suit. Strong defensive hands with four-plus there need judgment.
  const eligible = hcp >= 16 && lengths[suit] <= 3;
  return { success: eligible, telemetryLines: [
    `${hcp >= 16 ? 'PASS' : 'FAIL'}: strong balancing Double requires 16+ HCP.`,
    `${lengths[suit] <= 3 ? 'PASS' : 'FAIL'}: opener-suit length must be at most three.`,
  ], callEvidence: { requirements: [
    { kind: 'hcp', actual: hcp, min: 16, passed: hcp >= 16 },
    { kind: 'openerSuitLength', actual: lengths[suit], max: 3, passed: lengths[suit] <= 3 },
  ] } };
}

export function balancingPassApplies (call: Call, context: RuleEvalContext):
    AppliesWhenResult {
  const suit = getBalancingOpeningSuit(context);
  if (call !== 'Pass' || suit === null) return { success: false, telemetryLines: ['Not a balancing Pass.'] };
  const { hcp, lengths } = context.handFacts;
  const count = lengths[suit];
  // Pass intentionally coexists with marginal competing calls, unlike a pure fallback.
  // Better defensive holdings in opener's suit widen the eligible Pass range.
  const eligible = hcp <= 9 || (hcp <= 12 && count >= 3) ||
    (hcp <= 14 && count >= 4);
  return { success: eligible, telemetryLines: [
    `${eligible ? 'PASS' : 'FAIL'}: ${hcp} HCP, ${count} card(s) in opener's suit; ` +
      'Pass remains a reasonable defensive or weak-hand choice.',
  ] };
}
