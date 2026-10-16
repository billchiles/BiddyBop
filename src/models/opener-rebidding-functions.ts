/// Opener-Rebid Functions: refiners, applicability checks, and related helpers.

import {
  STRAIN_ORDER, type AdvancerCallKind, type AppliesWhenResult, type BiddingSystem, type Call,
  type CallRefinementResult, type RuleEvalContext, type SuitBid
} from './bidding-types';
import { getCardsForSuit, hasSolidWeakTwoSuit, SUITS, type Suit } from './cards';
import {
  cheapestBidInStrainAfter, cheapestNewSuitBid, compareSuitBids,
  getAdvancerCallKindForOpenerRebid, getInterferenceAfterOpening, getOpeningCallInfo,
  getOpponentNaturallyBidSuitsForOpenerRebid, getResponderCall, isCallAvailableInAuction,
  openerRebidIsReverse, parseSuitBid, responderPreviouslyPassed, type ParsedSuitBid
} from './auction';
import { getNegativeDoubleImpliedSuits, getOpenerOpeningBid, getResponderBid,
         getWeakTwoOpeningBid, hasBasicSuitStopper, orderMajorSuitCandidates }
  from './common-rule-helpers';



/// The first four physical calls identify the selected A7 continuation after an opposing
/// natural two-level suit overcall of opener's 1NT. The fourth call can also be a simple
/// opposing raise following responder's takeout Double.
interface OneNtInterferenceContinuation {
  opposingSuit: Suit;
  response: Call;
  advance: Call;
  naturalSuit: Suit | null;
  naturalLevel: number | null;
}

function getOneNtInterferenceContinuation (context: RuleEvalContext):
    OneNtInterferenceContinuation | null {
  const opening = getOpeningCallInfo(context.dealer, context.auction);
  if (opening === null || opening.call !== '1NT' ||
      context.auction.length !== opening.index + 4) return null;
  const overcall = parseSuitBid(context.auction[opening.index + 1] ?? 'Pass');
  const response = context.auction[opening.index + 2];
  const advance = context.auction[opening.index + 3];
  if (overcall === null || overcall.level !== 2 || overcall.strain === 'NT' ||
      response === undefined || advance === undefined) return null;
  const responseBid = parseSuitBid(response);
  const naturalSuit = responseBid !== null && responseBid.strain !== 'NT' &&
    responseBid.strain !== overcall.strain ? responseBid.strain as Suit : null;
  const responseIsSupported = response === 'Double' ||
    (naturalSuit !== null && (responseBid?.level === 2 || responseBid?.level === 3) &&
     cheapestBidInStrainAfter(overcall, naturalSuit) === response);
  if (! responseIsSupported) return null;
  if (advance !== 'Pass' &&
      ! (response === 'Double' && advance === `3${overcall.strain}`)) return null;
  return { opposingSuit: overcall.strain as Suit, response, advance, naturalSuit,
    naturalLevel: naturalSuit === null ? null : responseBid!.level };
}

/// A takeout-oriented Double shows both majors after minor interference, the unbid
/// major after major interference, or both minors after spade interference.
/// Show an eight-card fit with a four-card suit, choosing the cheapest fit up the line.
function getOneNtDoubleFit (context: RuleEvalContext, opposingSuit: Suit): Suit | null {
  const candidates: Suit[] = opposingSuit === 'S' ? ['C', 'D'] :
    opposingSuit === 'H' ? ['S'] : ['H', 'S'];
  return candidates.find((suit) => context.handFacts.lengths[suit] >= 4) ?? null;
}

export function refineOneNtInterferenceDoubleFit (calls: Call[], context: RuleEvalContext):
    CallRefinementResult {
  const info = getOneNtInterferenceContinuation(context);
  if (info === null || info.response !== 'Double') return { calls: [], telemetryLines: [] };
  const fit = getOneNtDoubleFit(context, info.opposingSuit);
  // Only the economical 3S action over a competing 3H is modeled after an
  // opposing raise. Other raised auctions belong to the boundary treatment.
  const bid = fit === null ? null : info.advance === 'Pass' ?
    cheapestBidInStrainAfter({ level: 2, strain: info.opposingSuit }, fit) :
    info.opposingSuit === 'H' && fit === 'S' ? '3S' : null;
  const wanted = bid as Call | null;
  return { calls: wanted === null ? [] : calls.filter((call) => call === wanted &&
    isCallAvailableInAuction(call, context.auction)), telemetryLines: [
      fit === null ? 'No four-card fit for responder\'s takeout Double.' :
      `Show the available four-card ${fit} fit at ${wanted}.`,
  ] };
}

export function oneNtInterferenceDoubleNtApplies (call: Call, context: RuleEvalContext,
                                                   system: BiddingSystem): AppliesWhenResult {
  const info = getOneNtInterferenceContinuation(context);
  const min = system.oneNtOpening === '15-17' ? 15 : 16;
  const hcp = context.handFacts.hcp;
  const fit = info === null ? null : getOneNtDoubleFit(context, info.opposingSuit);
  const stopped = info !== null && hasBasicSuitStopper(context, info.opposingSuit);
  const success = info !== null && info.response === 'Double' && info.advance === 'Pass' &&
    fit === null && stopped && ((call === '2NT' && hcp <= min + 1) ||
                               (call === '3NT' && hcp >= min + 2));
  return { success, telemetryLines: [
    `${success ? 'PASS' : 'FAIL'}: no four-card takeout fit, stopper, and ` +
    `${call === '2NT' ? 'minimum/middle' : 'maximum'} NT opening strength.`,
  ] };
}

export function oneNtInterferenceNaturalPassApplies (_call: Call, context: RuleEvalContext,
                                                      system: BiddingSystem): AppliesWhenResult {
  const info = getOneNtInterferenceContinuation(context);
  const min = system.oneNtOpening === '15-17' ? 15 : 16;
  const suit = info?.naturalSuit;
  const hcp = context.handFacts.hcp;
  const support = suit === null || suit === undefined ? 0 : context.handFacts.lengths[suit];
  const isTwo = info?.naturalLevel === 2;
  const strengthFits = isTwo && (support <= 2 ||
    (suit !== 'H' && suit !== 'S') || (hcp === min && support === 3));
  const success = info !== null && info.advance === 'Pass' && suit !== null &&
    strengthFits;
  return { success, telemetryLines: [
    `${success ? 'PASS' : 'FAIL'}: nonforcing natural suit, ` +
    `${hcp} HCP and ${support}-card support; Pass only where no modeled improvement fits.`,
  ] };
}

export function oneNtInterferenceNaturalMajorRaiseApplies (call: Call,
    context: RuleEvalContext, system: BiddingSystem): AppliesWhenResult {
  const info = getOneNtInterferenceContinuation(context);
  const suit = info?.naturalSuit;
  const min = system.oneNtOpening === '15-17' ? 15 : 16;
  const hcp = context.handFacts.hcp;
  const support = suit === 'H' || suit === 'S' ? context.handFacts.lengths[suit] : 0;
  const isInviting = call === `3${suit}` && info?.naturalLevel === 2 &&
    support >= 3 && ((hcp === min && support >= 4) || hcp === min + 1 ||
                     (hcp === min + 2 && support === 3));
  const isGame = call === `4${suit}` && support >= 3 &&
    ((info?.naturalLevel === 2 && hcp === min + 2 && support >= 4) ||
     info?.naturalLevel === 3);
  const success = info !== null && info.advance === 'Pass' && (isInviting || isGame);
  return { success, telemetryLines: [
    `${success ? 'PASS' : 'FAIL'}: natural major support with ${support} trumps, ` +
    `${hcp} HCP, and responder's ${info?.naturalLevel ?? '?'}-level action.`,
  ] };
}

export function oneNtInterferenceNaturalThreeNtApplies (_call: Call,
    context: RuleEvalContext): AppliesWhenResult {
  const info = getOneNtInterferenceContinuation(context);
  const suit = info?.naturalSuit;
  const majorFit = (suit === 'H' || suit === 'S') && context.handFacts.lengths[suit] >= 3;
  const success = info !== null && info.advance === 'Pass' && info.naturalLevel === 3 &&
    ! majorFit && hasBasicSuitStopper(context, info.opposingSuit);
  return { success, telemetryLines: [
    `${success ? 'PASS' : 'FAIL'}: constructive three-level natural response; ` +
    'prefer 3NT when the opposing suit is stopped and no major fit is present.',
  ] };
}

export function oneNtInterferenceScopeBoundaryApplies (context: RuleEvalContext,
    _system: BiddingSystem): AppliesWhenResult {
  const info = getOneNtInterferenceContinuation(context);
  if (info === null) return { success: false, telemetryLines: [] };
  const fit = info.response === 'Double' ? getOneNtDoubleFit(context, info.opposingSuit) : null;
  let success = false;
  if (info.response === 'Double') {
    // After the opponents raise, bidding higher without a defined fit is judgment heavy.
    success = info.advance !== 'Pass' ?
      ! (info.opposingSuit === 'H' && fit === 'S') :
      fit === null && ! hasBasicSuitStopper(context, info.opposingSuit);
  } else if (info.naturalLevel === 3 && info.naturalSuit !== null) {
    const majorFit = (info.naturalSuit === 'H' || info.naturalSuit === 'S') &&
      context.handFacts.lengths[info.naturalSuit] >= 3;
    success = ! majorFit && ! hasBasicSuitStopper(context, info.opposingSuit);
  }
  return { success, telemetryLines: [success ? 'No deterministic natural strain or stopper.' :
    'A selected Pass, suit fit, or notrump description remains available.'] };
}


///
//// Opener Rebids After Notrump Openings
///

/// Selected A8 opener continuations after a natural jump overcall and advancer Pass.
/// The physical auction is checked here as well as in getNextBiddingRuleStage: do not infer these
/// meanings from a compact partnership auction that hides interference.
interface JumpOvercallContinuation {
  opening: ParsedSuitBid;
  overcall: ParsedSuitBid;
  response: Call;
  responseBid: ParsedSuitBid | null;
  kind: 'raise' | 'newSuitTwo' | 'newSuitThree' | 'negativeDouble' |
        'supportCuebid' | 'notrumpTwo' | 'notrumpThree' | 'majorGame';
}

function getJumpOvercallContinuation (context: RuleEvalContext): JumpOvercallContinuation | null {
  const first = getOpeningCallInfo(context.dealer, context.auction);
  if (first === null || context.auction.length !== first.index + 4 ||
      getInterferenceAfterOpening(context.dealer, context.auction) !== 'jumpSuitOvercall' ||
      context.auction[first.index + 3] !== 'Pass') return null;
  const opening = parseSuitBid(first.call);
  const overcall = parseSuitBid(context.auction[first.index + 1] ?? 'Pass');
  const response = context.auction[first.index + 2];
  if (opening === null || opening.level !== 1 || opening.strain === 'NT' ||
      overcall === null || overcall.strain === 'NT' || response === undefined) return null;
  const responseBid = parseSuitBid(response);
  if (response === 'Double') {
    return { opening, overcall, response, responseBid, kind: 'negativeDouble' };
  }
  if (responseBid === null) return null;
  let kind: JumpOvercallContinuation['kind'];
  if (response === '2NT') kind = 'notrumpTwo';
  else if (response === '3NT') kind = 'notrumpThree';
  else if (responseBid.strain === opening.strain && responseBid.level === 3) kind = 'raise';
  else if (responseBid.strain === opening.strain && responseBid.level === 4 &&
           (opening.strain === 'H' || opening.strain === 'S')) kind = 'majorGame';
  else if (responseBid.strain === overcall.strain && overcall.level === 2 &&
           (opening.strain === 'H' || opening.strain === 'S')) kind = 'supportCuebid';
  else if (responseBid.strain !== opening.strain &&
           responseBid.strain !== overcall.strain && responseBid.level === 2) kind = 'newSuitTwo';
  else if (responseBid.strain !== opening.strain &&
           responseBid.strain !== overcall.strain && responseBid.level === 3) kind = 'newSuitThree';
  else return null;
  return { opening, overcall, response, responseBid, kind };
}

/// Each selected family returns its descriptive bid, if one exists. A no-bid forcing
/// decision is handled by a scopeBoundary, never by a fabricated Pass.
function getJumpOvercallOpenerAction (context: RuleEvalContext): Call | null {
  const info = getJumpOvercallContinuation(context);
  if (info === null) return null;
  const { opening, overcall, responseBid, kind } = info;
  const openingSuit = opening.strain as Suit;
  const hcp = context.handFacts.hcp;
  const points = context.handFacts.totalPointsWShortage;
  const stopper = hasBasicSuitStopper(context, overcall.strain as Suit);
  const atMostThree = (suit: Suit): SuitBid | null => {
    const next = cheapestBidInStrainAfter(responseBid ?? overcall, suit);
    if (next === null) return null;
    const bid = parseSuitBid(next);
    return bid !== null && bid.level <= 3 && isCallAvailableInAuction(next, context.auction)
      ? next : null;
  };
  if (kind === 'raise') {
    if (points <= 15) return 'Pass';
    if ((openingSuit === 'H' || openingSuit === 'S') && points >= 17) {
      return `4${openingSuit}` as SuitBid;
    }
    return null;
  }
  // The existing preemptive major-game signoff already supplies Pass for this auction.
  if (kind === 'majorGame') return null;
  if (kind === 'notrumpThree') return hcp <= 17 ? 'Pass' : null;
  if (kind === 'notrumpTwo') return hcp <= 13 ? 'Pass' : hcp <= 18 ? '3NT' : null;
  if (kind === 'supportCuebid') return `4${openingSuit}` as SuitBid;
  if (kind === 'negativeDouble') {
    const implied = getNegativeDoubleImpliedSuits(opening, overcall);
    const fit = implied.find((suit) => context.handFacts.lengths[suit] >= 4);
    if (fit !== undefined) {
      const bid = cheapestBidInStrainAfter(overcall, fit);
      const parsed = bid === null ? null : parseSuitBid(bid);
      if (bid === null || parsed === null || parsed.level > 4) return null;
      return isCallAvailableInAuction(bid, context.auction) ? bid : null;
    }
    if (context.handFacts.lengths[openingSuit] >= 6) {
      const repeat = atMostThree(openingSuit);
      if (repeat !== null) return repeat;
    }
    return context.handFacts.balancedOrSemiBalanced && stopper && hcp >= 15 &&
      isCallAvailableInAuction('3NT', context.auction) ? '3NT' : null;
  }
  if (responseBid === null || responseBid.strain === 'NT') return null;
  const responseSuit = responseBid.strain as Suit;
  const support = context.handFacts.lengths[responseSuit];
  if (kind === 'newSuitThree') {
    if ((responseSuit === 'H' || responseSuit === 'S') && support >= 3) {
      return `4${responseSuit}` as SuitBid;
    }
    if (context.handFacts.balancedOrSemiBalanced && stopper &&
        isCallAvailableInAuction('3NT', context.auction)) return '3NT';
    if (responseSuit !== 'H' && responseSuit !== 'S' && support >= 4 &&
        !context.handFacts.balancedOrSemiBalanced && !stopper) {
      return `4${responseSuit}` as SuitBid;
    }
    return null;
  }
  // New suit at two is forcing for one round, but does not promise game values.
  if (support >= 3) {
    const raise = atMostThree(responseSuit);
    if (raise !== null) return raise;
  }
  if (context.handFacts.lengths[openingSuit] >= 6) {
    const repeat = atMostThree(openingSuit);
    if (repeat !== null) return repeat;
  }
  if (context.handFacts.balanced && stopper) {
    if (hcp >= 12 && hcp <= 14 && isCallAvailableInAuction('2NT', context.auction)) return '2NT';
    if (hcp >= 18 && hcp <= 19 && isCallAvailableInAuction('3NT', context.auction)) return '3NT';
  }
  const second = SUITS.filter((suit) => suit !== openingSuit && suit !== responseSuit &&
    suit !== overcall.strain && context.handFacts.lengths[suit] >= 4)
    .map((suit) => ({ suit, bid: atMostThree(suit) }))
    .filter((item) => {
      if (item.bid === null) return false;
      const bid = parseSuitBid(item.bid);
      return bid !== null && (bid.level <= 2 || hcp >= 17) &&
        (!openerRebidIsReverse(opening, responseBid, bid) || hcp >= 17);
    })
    .sort((a, b) => context.handFacts.lengths[b.suit] - context.handFacts.lengths[a.suit]);
  return second[0]?.bid ?? null;
}

export function refineJumpOvercallOpenerAction (calls: Call[], context: RuleEvalContext):
    CallRefinementResult {
  const wanted = getJumpOvercallOpenerAction(context);
  return { calls: wanted === null ? [] : calls.filter((call) => call === wanted),
    telemetryLines: [wanted === null
      ? 'No selected natural opener continuation; consult the auction-specific boundary.'
      : `Selected opener description after a jump overcall: ${wanted}.`] };
}

export function jumpOvercallOpenerContinuationApplies (call: Call, context: RuleEvalContext,
    _system: BiddingSystem): AppliesWhenResult {
  const wanted = getJumpOvercallOpenerAction(context);
  const success = wanted !== null && wanted === call;
  return { success, telemetryLines: [success
    ? `PASS: ${call} matches the selected response to partner's action over the jump overcall.`
    : 'FAIL: this action does not match the selected continuation for the current hand.'] };
}

export function jumpOvercallOpenerBoundaryApplies (context: RuleEvalContext,
    _system: BiddingSystem): AppliesWhenResult {
  const applies = getJumpOvercallContinuation(context) !== null;
  return { success: applies, telemetryLines: [applies
    ? 'PASS: selected jump-overcall auction needs guidance when no natural rebid qualifies.'
    : 'FAIL: not the selected jump-overcall continuation.'] };
}


/// refineNtStaymanReply selects the reply one level above a natural 1NT or 2NT opening.
/// Separate declarative rules decide whether opener has no four-card major, hearts, or spades.
export function refineNtStaymanReply (calls: Call[], context: RuleEvalContext): CallRefinementResult {
  const opening = getOpenerOpeningBid(context);
  const response = getResponderBid(context);
  if (opening === null || response === null || opening.strain !== 'NT' ||
      (opening.level !== 1 && opening.level !== 2) ||
      response.strain !== 'C' || response.level !== opening.level + 1) {
    return { calls: [], telemetryLines: ['This is not a 1NT/2NT Stayman auction.'] };
  }
  const level = opening.level + 1;
  return {
    calls: calls.filter((call) => parseSuitBid(call)?.level === level),
    telemetryLines: [`Stayman replies are at the ${level} level.`],
  };
}

/// Normal Jacoby completion is compulsory; this first treatment does not model superaccepts.
export function refineNtJacobyCompletion (calls: Call[], context: RuleEvalContext):
    CallRefinementResult {
  const opening = getOpenerOpeningBid(context);
  const response = getResponderBid(context);
  if (opening === null || response === null || opening.strain !== 'NT' ||
      (opening.level !== 1 && opening.level !== 2) ||
      response.level !== opening.level + 1) {
    return { calls: [], telemetryLines: ['This is not a 1NT/2NT Jacoby transfer.'] };
  }
  const target = response.strain === 'D' ? 'H' : response.strain === 'H' ? 'S' : null;
  const wanted = target === null ? null : `${response.level}${target}` as SuitBid;
  return {
    calls: wanted === null ? [] : calls.filter((call) => call === wanted),
    telemetryLines: wanted === null ? ['Not a Jacoby transfer call.']
      : [`Complete the Jacoby transfer with ${wanted}.`],
  };
}

/// Texas over either natural notrump opening always completes at the four level.
export function refineNtTexasCompletion (calls: Call[], context: RuleEvalContext):
    CallRefinementResult {
  const opening = getOpenerOpeningBid(context);
  const response = getResponderBid(context);
  if (opening === null || response === null || opening.strain !== 'NT' ||
      (opening.level !== 1 && opening.level !== 2) || response.level !== 4) {
    return { calls: [], telemetryLines: ['This is not a 1NT/2NT Texas transfer.'] };
  }
  const wanted: Call | null = response.strain === 'D' ? '4H'
    : response.strain === 'H' ? '4S' : null;
  return {
    calls: wanted === null ? [] : calls.filter((call) => call === wanted),
    telemetryLines: wanted === null ? ['Not a Texas transfer call.']
      : [`Complete the Texas transfer with ${wanted}.`],
  };
}

/// refineOpenerNtResponderMajorToGame keeps four of responder's natural three-level major
/// after a 1NT or 2NT opening.
export function refineOpenerNtResponderMajorToGame (calls: Call[], context: RuleEvalContext):
    CallRefinementResult {
  const opening = getOpenerOpeningBid(context);
  const response = getResponderBid(context);
  if (opening === null || response === null || opening.strain !== 'NT' ||
      (opening.level !== 1 && opening.level !== 2) || response.level !== 3 ||
      (response.strain !== 'H' && response.strain !== 'S')) {
    return { calls: [], telemetryLines: ['No natural 1NT/2NT-3M auction is available.'] };
  }
  const wanted = `4${response.strain}` as SuitBid;
  return {
    calls: calls.filter((call) => call === wanted),
    telemetryLines: [`Keep the major game ${wanted} after responder's natural 3${response.strain}.`],
  };
}

/// refineOpenerNtMajorSlamControlBid keeps the cheapest side-suit control below game after a
/// direct 1NT-3M slam-interest response.  The agreed major is responder's six-card-or-longer suit.
/// Because the notrump opener is strictly balanced, the executable controls here are aces or kings.
///
export function refineOpenerNtMajorSlamControlBid (calls: Call[], context: RuleEvalContext):
    CallRefinementResult {
  const opening = getOpenerOpeningBid(context);
  const response = getResponderBid(context);
  if (opening === null || response === null || opening.level !== 1 || opening.strain !== 'NT' ||
      response.level !== 3 || (response.strain !== 'H' && response.strain !== 'S')) {
    return { calls: [], telemetryLines: ['No direct 1NT-3M slam-interest auction is available.'] };
  }
  const game = parseSuitBid(`4${response.strain}` as SuitBid)!;
  const legalControls = calls.filter((call) => {
    const candidate = parseSuitBid(call);
    // The control must be a side suit, bid as cheaply as possible after responder's 3M, and
    // remain below four of the agreed major so that 4M is still available as the stopping place.
    if (candidate === null || candidate.strain === 'NT' || candidate.strain === response.strain ||
        cheapestBidInStrainAfter(response, candidate.strain) !== call ||
        compareSuitBids(candidate, game) >= 0) {
      return false;
    }
    const cards = getCardsForSuit(context.hand, candidate.strain as Suit);
    // A natural 1NT opener has no singleton or void, so A/K are the relevant side-suit controls.
    return cards.some((card) => card.rank === 'A' || card.rank === 'K');
  });
  // Control-bid upward from the cheapest available suit.
  legalControls.sort((a, b) => compareSuitBids(parseSuitBid(a)!, parseSuitBid(b)!));
  const cheapestControl = legalControls[0];
  return {
    calls: cheapestControl === undefined ? [] : [cheapestControl],
    telemetryLines: [cheapestControl === undefined
      ? `No modeled side-suit A/K control is available below 4${response.strain}.`
      : `Use the cheapest available side-suit A/K control below game: ${cheapestControl}.`],
  };
}

/// A natural 1NT-3m invitation asks whether opener holds one of A/K/Q in responder's good
/// six-card minor.  Holding the fitting top honor supports trying 3NT; otherwise play 3m.
export function openerNtMinorInvitationApplies (_call: Call, context: RuleEvalContext,
                                                accept: boolean): AppliesWhenResult {
  const opening = getOpenerOpeningBid(context);
  const response = getResponderBid(context);
  if (opening === null || response === null || opening.level !== 1 || opening.strain !== 'NT' ||
      response.level !== 3 || (response.strain !== 'C' && response.strain !== 'D')) {
    return { success: false, telemetryLines: ['FAIL: not a natural 1NT-3m invitation.'] };
  }
  const suit = response.strain as Suit;
  const hasTopHonor = getCardsForSuit(context.hand, suit).some((card) =>
    card.rank === 'A' || card.rank === 'K' || card.rank === 'Q');
  const success = accept ? hasTopHonor : ! hasTopHonor;
  return { success, telemetryLines: [
    `${success ? 'PASS' : 'FAIL'}: opener ${accept ? 'accepts' : 'declines'} 1NT-3${suit} ` +
    `based on ${hasTopHonor ? 'holding' : 'not holding'} A/K/Q in responder's minor.`,
  ] };
}

/// A natural 3m response after 2NT is available only when that call is not Stayman or a Jacoby
/// transfer under the active agreements.  Opener's basic continuation is natural 3NT.
export function openerNtNaturalThreeMinorApplies (_call: Call, context: RuleEvalContext,
                                                  system: BiddingSystem): AppliesWhenResult {
  const opening = getOpenerOpeningBid(context);
  const response = getResponderBid(context);
  if (opening === null || response === null || opening.level !== 2 || opening.strain !== 'NT') {
    return { success: false,
             telemetryLines: ['FAIL: responder has not made a natural forcing 3m response to 2NT.'] };
  }
  const naturalThreeClub = response.level === 3 && response.strain === 'C' && ! system.stayman;
  const naturalThreeDiamond = response.level === 3 && response.strain === 'D' &&
    ! system.jacobyTransfers;
  const success = naturalThreeClub || naturalThreeDiamond;
  return { success, telemetryLines: [success
    ? 'PASS: natural forcing 3m response to 2NT; 3NT is the basic continuation.'
    : 'FAIL: responder has not made a natural forcing 3m response to 2NT.'] };
}

/// Without Jacoby transfers, a direct 3H/3S response to 1NT or 2NT is natural and game forcing.
/// Opener chooses 3NT with exactly two-card support or four of responder's major with 3+ support.
export function openerNtNaturalThreeMajorApplies (_call: Call, context: RuleEvalContext,
                                                  minSupport: number, maxSupport?: number):
    AppliesWhenResult {
  const opening = getOpenerOpeningBid(context);
  const response = getResponderBid(context);
  if (opening === null || response === null || opening.strain !== 'NT' ||
      (opening.level !== 1 && opening.level !== 2) || response.level !== 3 ||
      (response.strain !== 'H' && response.strain !== 'S')) {
    return { success: false, telemetryLines: ['FAIL: not a natural 1NT/2NT-3M response.'] };
  }
  const support = context.handFacts.lengths[response.strain];
  const supportApplies = support >= minSupport && (maxSupport === undefined || support <= maxSupport);
  return { success: supportApplies, telemetryLines: [
    `${supportApplies ? 'PASS' : 'FAIL'}: opener has ${support} ${response.strain}; ` +
    `this continuation needs ${minSupport}${maxSupport === undefined ? '+' : `-${maxSupport}`} support.`,
  ] };
}

/// With Jacoby transfers available, direct 1NT-3M shows a six-card-or-longer major with slam
/// interest.  Four of the major always remains available; middle-or-better opener strength can
/// cooperate with a side-suit control while retaining 4M as the judgment alternative.
export function openerNtDirectMajorSlamInterestApplies (_call: Call, context: RuleEvalContext,
                                                        system: BiddingSystem, cooperate: boolean):
    AppliesWhenResult {
  const opening = getOpenerOpeningBid(context);
  const response = getResponderBid(context);
  const isDirectSlamTry = opening !== null && response !== null && opening.level === 1 &&
    opening.strain === 'NT' && response.level === 3 &&
    (response.strain === 'H' || response.strain === 'S');
  const minimum = system.oneNtOpening === '15-17' ? 15 : 16;
  const strengthApplies = ! cooperate || context.handFacts.hcp >= minimum + 1;
  const success = isDirectSlamTry && strengthApplies;
  return { success, telemetryLines: [
    `${success ? 'PASS' : 'FAIL'}: direct 1NT-3M slam interest; ` +
    `${cooperate ? `control cooperation needs ${minimum + 1}+ HCP` : '4M remains available'}.`,
  ] };
}

/// Natural NT game and slam signoffs require Pass, never acceptance of an invitation.
export function openerNtNotrumpSignoffApplies (_call: Call, context: RuleEvalContext):
    AppliesWhenResult {
  const opening = getOpenerOpeningBid(context);
  const response = getResponderCall(context.dealer, context.auction);
  const success = opening !== null && opening.strain === 'NT' &&
    (opening.level === 1 || opening.level === 2) &&
    (response === '3NT' || response === '6NT' || response === '7NT');
  return { success, telemetryLines: [success ? 'PASS: natural NT signoff.'
    : 'FAIL: responder has not made a natural NT signoff.'] };
}

/// A direct 4H/4S is a natural game signoff only when Texas is disabled.
export function openerNtNaturalMajorGameApplies (_call: Call, context: RuleEvalContext):
    AppliesWhenResult {
  const opening = getOpenerOpeningBid(context);
  const response = getResponderCall(context.dealer, context.auction);
  const success = opening !== null && opening.strain === 'NT' &&
    (opening.level === 1 || opening.level === 2) &&
    (response === '4H' || response === '4S');
  return { success, telemetryLines: [success ? 'PASS: natural major game signoff.'
    : 'FAIL: not a natural major game signoff.'] };
}

/// Without Jacoby, a natural weak major response to 1NT ends the auction at 2H/2S.
export function openerNtWeakMajorSignoffApplies (_call: Call, context: RuleEvalContext):
    AppliesWhenResult {
  const opening = getOpenerOpeningBid(context);
  const response = getResponderCall(context.dealer, context.auction);
  const success = opening !== null && opening.level === 1 && opening.strain === 'NT' &&
    (response === '2H' || response === '2S');
  return { success, telemetryLines: [success ? 'PASS: natural weak major signoff.'
    : 'FAIL: not a weak major signoff over 1NT.'] };
}

/// A natural 2NT response invites game after 1NT. The middle HCP is a judgment case:
/// keep both Pass and 3NT instead of forcing either choice on every balanced opener.
export function openerNtGameInvitationApplies (_call: Call, context: RuleEvalContext,
                                               system: BiddingSystem, accept: boolean):
    AppliesWhenResult {
  const opening = getOpenerOpeningBid(context);
  const response = getResponderCall(context.dealer, context.auction);
  const isInvitation = opening?.level === 1 && opening.strain === 'NT' && response === '2NT';
  const minimum = system.oneNtOpening === '15-17' ? 15 : 16;
  const hcp = context.handFacts.hcp;
  // At the middle value either action can be reasonable; upgrades below the range decline.
  const strengthApplies = accept ? hcp >= minimum + 1 : hcp <= minimum + 1;
  const success = isInvitation && strengthApplies;
  return { success, telemetryLines: [
    `${success ? 'PASS' : 'FAIL'}: 1NT-2NT invitation: ${accept ? 'accept' : 'decline'} ` +
    `with ${hcp} HCP under the ${system.oneNtOpening} agreement.`,
  ] };
}

/// Quantitative 4NT invites a small slam, not Blackwood. A 21-HCP 2NT opener may
/// decline: opposite responder's 11-12 HCP, slam remains a judgment call.
export function openerNtQuantitativeInvitationApplies (_call: Call, context: RuleEvalContext,
                                                       system: BiddingSystem, accept: boolean):
    AppliesWhenResult {
  const opening = getOpenerOpeningBid(context);
  const response = getResponderCall(context.dealer, context.auction);
  const openingLevel = opening?.strain === 'NT' ? opening.level : null;
  if (response !== '4NT' || (openingLevel !== 1 && openingLevel !== 2)) {
    return { success: false, telemetryLines: ['FAIL: not a quantitative 4NT response to 1NT/2NT.'] };
  }
  const minimum = system.oneNtOpening === '15-17' ? 15 : 16;
  const hcp = context.handFacts.hcp;
  const strengthApplies = openingLevel === 1
    ? (accept ? hcp >= minimum + 1 : hcp <= minimum + 1)
    : (accept ? hcp >= 21 : hcp <= 21);
  return { success: strengthApplies, telemetryLines: [
    `${strengthApplies ? 'PASS' : 'FAIL'}: quantitative 4NT ${accept ? 'acceptance' : 'decline'} ` +
    `with a ${hcp}-HCP ${openingLevel}NT opener.`,
  ] };
}

///
//// Opener Rebids After One-Level Suit Openings
///


/// getOpenerNegativeDoubleInfo keeps the full competitive meaning of responder's negative Double
/// together for opener's second turn.  The implied suits come from the opening and overcall;
/// advancerKind records whether fourth hand Passed, supported the overcaller, described another
/// strain, or made one of the artificial actions already modeled by the advancing rules.
interface OpenerNegativeDoubleInfo {
  opening: ParsedSuitBid;
  overcall: ParsedSuitBid;
  impliedSuits: Suit[];
  advancerKind: AdvancerCallKind;
}

function getOpenerNegativeDoubleInfo (context: RuleEvalContext): OpenerNegativeDoubleInfo | null {
  if (context.stage !== 'openerRebid' ||
      getInterferenceAfterOpening(context.dealer, context.auction) !== 'suitOvercall') {
    return null;
  }
  const openingInfo = getOpeningCallInfo(context.dealer, context.auction);
  if (openingInfo === null || context.auction.length !== openingInfo.index + 4 ||
      context.auction[openingInfo.index + 2] !== 'Double') {
    return null;
  }
  const opening = parseSuitBid(openingInfo.call);
  const overcallCall = context.auction[openingInfo.index + 1];
  const overcall = overcallCall === undefined ? null : parseSuitBid(overcallCall);
  const advancerKind = getAdvancerCallKindForOpenerRebid(context.dealer, context.auction);
  if (opening === null || opening.level !== 1 || opening.strain === 'NT' ||
      overcall === null || overcall.strain === 'NT' || advancerKind === null ||
      advancerKind === 'responsiveDouble' || advancerKind === 'other') {
    return null;
  }
  return {
    opening,
    overcall,
    impliedSuits: getNegativeDoubleImpliedSuits(opening, overcall),
    advancerKind,
  };
}

/// getOpenerNegativeDoubleFitSuits returns the implied suits in which opener actually has the
/// four-card fit responder's Double asked opener to look for.  Prefer a longer fit; equal majors
/// use the existing major ordering, while equal minors are presented up the line.
function getOpenerNegativeDoubleFitSuits (
    context: RuleEvalContext, info: OpenerNegativeDoubleInfo): Suit[] {
  const fits = info.impliedSuits.map((suit) => ({ suit, length: context.handFacts.lengths[suit] }))
    .filter(({ length }) => length >= 4);
  if (fits.length > 1 && fits.every(({ suit }) => suit === 'H' || suit === 'S')) {
    return orderMajorSuitCandidates(fits).map(({ suit }) => suit);
  }
  fits.sort((left, right) => right.length - left.length ||
    STRAIN_ORDER.indexOf(left.suit) - STRAIN_ORDER.indexOf(right.suit));
  return fits.map(({ suit }) => suit);
}

/// getCheapestAvailableSuitBidForOpener finds the lowest legal bid in a particular strain from
/// opener's actual competitive position rather than measuring from responder's compact call.
function getCheapestAvailableSuitBidForOpener (
    context: RuleEvalContext, suit: Suit, maximumLevel: number): SuitBid | null {
  for (let level = 1; level <= maximumLevel; level += 1) {
    const call = `${level}${suit}` as SuitBid;
    if (isCallAvailableInAuction(call, context.auction)) return call;
  }
  return null;
}

/// getOpenerNegativeDoubleImpliedSuitCall implements the selected strength ladder for a known
/// implied-suit fit.  With advancer Pass, minimum opens the fit economically and medium jumps one
/// level.  Once advancer acts, minimum/medium hands use only a still-economical bid through the
/// three level; competition must not turn a vanished descriptive call into an automatic game.
/// Maximum values place an implied major in game.  With an implied minor and advancer Pass, a
/// strong jump below the four level describes the extra values without pretending five of a minor
/// is automatic.
function getOpenerNegativeDoubleImpliedSuitCall (
    context: RuleEvalContext, strength: 'minimum' | 'medium' | 'maximum'): SuitBid | null {
  const info = getOpenerNegativeDoubleInfo(context);
  if (info === null) return null;
  for (const suit of getOpenerNegativeDoubleFitSuits(context, info)) {
    if (strength === 'maximum') {
      if (suit === 'H' || suit === 'S') {
        const game = `4${suit}` as SuitBid;
        if (isCallAvailableInAuction(game, context.auction)) return game;
        continue;
      }
      if (info.advancerKind !== 'pass') continue;
      const cheapest = getCheapestAvailableSuitBidForOpener(context, suit, 3);
      const parsed = cheapest === null ? null : parseSuitBid(cheapest);
      if (parsed !== null && parsed.level + 1 <= 3) {
        return `${parsed.level + 1}${suit}` as SuitBid;
      }
      continue;
    }

    if (info.advancerKind !== 'pass') {
      const competitive = getCheapestAvailableSuitBidForOpener(context, suit, 3);
      if (competitive !== null) return competitive;
      continue;
    }

    const cheapest = getCheapestAvailableSuitBidForOpener(context, suit, 4);
    const parsed = cheapest === null ? null : parseSuitBid(cheapest);
    if (parsed === null) continue;
    if (strength === 'minimum') {
      if (parsed.level <= 3) return cheapest;
      continue;
    }
    const jumpLevel = parsed.level + 1;
    if (jumpLevel <= 3 || ((suit === 'H' || suit === 'S') && jumpLevel === 4)) {
      return `${jumpLevel}${suit}` as SuitBid;
    }
  }
  return null;
}

export function refineOpenerNegativeDoubleImpliedSuitRebid (
    calls: Call[], context: RuleEvalContext, strength: 'minimum' | 'medium' | 'maximum'):
    CallRefinementResult {
  const wanted = getOpenerNegativeDoubleImpliedSuitCall(context, strength);
  return {
    calls: wanted === null ? [] : calls.filter((call) => call === wanted),
    telemetryLines: wanted === null ? [
      `No selected ${strength} implied-suit rebid is available after the negative Double.`,
    ] : [
      `Negative-Double implied-suit fit: ${strength} opener selects ${wanted}.`,
    ],
  };
}

/// getOpenerNegativeDoubleOpeningSuitCall keeps the ordinary six-card fallback only when opener
/// lacks a four-card implied-suit fit.  Competition may move that repeat upward, but this selected
/// treatment stops once repeating opener's suit would require the four level.
function getOpenerNegativeDoubleOpeningSuitCall (context: RuleEvalContext): SuitBid | null {
  const info = getOpenerNegativeDoubleInfo(context);
  if (info === null || getOpenerNegativeDoubleFitSuits(context, info).length > 0 ||
      context.handFacts.lengths[info.opening.strain as Suit] < 6) {
    return null;
  }
  return getCheapestAvailableSuitBidForOpener(context, info.opening.strain as Suit, 3);
}

export function refineOpenerNegativeDoubleOpeningSuitRebid (
    calls: Call[], context: RuleEvalContext): CallRefinementResult {
  const wanted = getOpenerNegativeDoubleOpeningSuitCall(context);
  return {
    calls: wanted === null ? [] : calls.filter((call) => call === wanted),
    telemetryLines: wanted === null
      ? ['No selected six-card opening-suit repeat is available after the negative Double.']
      : [`Repeat opener's six-card suit economically with ${wanted}.`],
  };
}

/// getOpenerNegativeDoubleNtCall retains only the normal 12-14 1NT or 18-19 2NT description.
/// Do not promote an unavailable NT level after competition.  Opener also needs stoppers in every
/// suit the opponents have bid naturally, and NT is a fallback only without an implied-suit fit or
/// six-card opening-suit repeat.
function getOpenerNegativeDoubleNtCall (context: RuleEvalContext): SuitBid | null {
  const info = getOpenerNegativeDoubleInfo(context);
  if (info === null || ! context.handFacts.balanced ||
      getOpenerNegativeDoubleFitSuits(context, info).length > 0 ||
      context.handFacts.lengths[info.opening.strain as Suit] >= 6) {
    return null;
  }
  const opponentSuits = getOpponentNaturallyBidSuitsForOpenerRebid(context.dealer, context.auction);
  if (! opponentSuits.every((suit) => hasBasicSuitStopper(context, suit))) return null;
  const hcp = context.handFacts.hcp;
  const wanted = hcp >= 12 && hcp <= 14 ? '1NT' : hcp >= 18 && hcp <= 19 ? '2NT' : null;
  return wanted !== null && isCallAvailableInAuction(wanted, context.auction) ? wanted : null;
}

export function openerNegativeDoubleNtApplies (
    call: Call, context: RuleEvalContext, _system: BiddingSystem): AppliesWhenResult {
  const wanted = getOpenerNegativeDoubleNtCall(context);
  const success = wanted !== null && call === wanted;
  return {
    success,
    telemetryLines: [success
      ? `PASS: ${wanted} keeps the ordinary balanced range with all opponent suits stopped.`
      : 'FAIL: no selected natural NT rebid applies after the negative Double.'],
  };
}

/// openerNegativeDoubleCompetitionPassApplies keeps Pass as a real minimum action only after
/// advancer intervenes and no selected fit, six-card repeat, or natural NT description survives.
/// Responder still has another turn; this is not a conversion of the negative Double to penalty.
export function openerNegativeDoubleCompetitionPassApplies (
    _call: Call, context: RuleEvalContext, _system: BiddingSystem): AppliesWhenResult {
  const info = getOpenerNegativeDoubleInfo(context);
  const points = context.handFacts.totalPointsWShortage;
  const noDescriptiveCall = info !== null && info.advancerKind !== 'pass' &&
    points >= 12 && points <= 16 &&
    getOpenerNegativeDoubleImpliedSuitCall(context, 'minimum') === null &&
    getOpenerNegativeDoubleOpeningSuitCall(context) === null &&
    getOpenerNegativeDoubleNtCall(context) === null;
  return {
    success: noDescriptiveCall,
    telemetryLines: [noDescriptiveCall
      ? 'PASS: advancer intervened and no selected minimum descriptive rebid remains.'
      : 'FAIL: Pass is not the selected negative-Double continuation for this hand.'],
  };
}

/// openerNegativeDoubleScopeBoundaryApplies marks a reviewed negative-Double continuation as a
/// fallback boundary.  The evaluator suppresses it whenever one of the concrete fit, long-suit,
/// NT, game, or minimum-Pass calls applies, so this reaches only the remaining judgment-heavy hand.
export function openerNegativeDoubleScopeBoundaryApplies (
    context: RuleEvalContext, _system: BiddingSystem): AppliesWhenResult {
  const success = getOpenerNegativeDoubleInfo(context) !== null;
  return {
    success,
    telemetryLines: [success
      ? 'PASS: reviewed negative-Double auction can use a scope boundary if no bid applies.'
      : 'FAIL: not a reviewed negative-Double opener continuation.'],
  };
}

/// openerSimpleRaiseContinuedCompetitionScopeBoundaryApplies identifies the medium-strength
/// simple-raise hands for which further competition has removed the trainer's ordinary game-try
/// structure.  These hands are strong enough to consider bidding again, but Pass versus competing
/// depends on shape, trump texture, honor location, vulnerability, and the level already reached.
export function openerSimpleRaiseContinuedCompetitionScopeBoundaryApplies (
    context: RuleEvalContext, _system: BiddingSystem): AppliesWhenResult {
  const opening = getOpenerOpeningBid(context);
  if (opening === null || opening.strain === 'NT') {
    return { success: false, telemetryLines: ['FAIL: no one-level suit opening for this boundary.'] };
  }
  const majorFit = opening.strain === 'H' || opening.strain === 'S';
  const points = majorFit
    ? context.handFacts.totalPointsWShortage
    : context.handFacts.totalPointsWLength;
  const success = points >= 17 && points <= 18;
  const label = majorFit ? 'shortage-adjusted' : 'length-adjusted';
  return {
    success,
    telemetryLines: [
      `${success ? 'PASS' : 'FAIL'}: ${points} ${label} points; boundary range is 17-18.`,
    ],
  };
}

/// refineOpenerLowerRankingSecondSuitRebid keeps only a natural lower-ranking second suit.
/// After 1C there is no lower-ranking suit; after 1D this resolves to 2C.  Higher-ranking
/// two-level calls are reverses and are deliberately left for the separate reverse rule.
///
/// getOpenerForcingResponseCompetitionInfo recognizes the reviewed continuation where responder
/// introduced a natural forcing suit and advancer then competed naturally.  The response meaning
/// comes from the interference family: one-level natural responses are forcing after either a suit
/// overcall or takeout Double, while a non-jump two-level response after a suit overcall is also
/// forcing one round and promises five or more cards.
function getOpenerForcingResponseCompetitionInfo (context: RuleEvalContext):
    { opening: ParsedSuitBid; response: ParsedSuitBid; advance: ParsedSuitBid;
      minimumSupport: number } | null {
  if (context.stage !== 'openerRebid') return null;
  const openingInfo = getOpeningCallInfo(context.dealer, context.auction);
  if (openingInfo === null || context.auction.length !== openingInfo.index + 4) return null;
  const opening = parseSuitBid(openingInfo.call);
  const overcallCall = context.auction[openingInfo.index + 1];
  const responseCall = context.auction[openingInfo.index + 2];
  const advanceCall = context.auction[openingInfo.index + 3];
  const response = responseCall === undefined ? null : parseSuitBid(responseCall);
  const advance = advanceCall === undefined ? null : parseSuitBid(advanceCall);
  if (opening === null || opening.level !== 1 || opening.strain === 'NT' ||
      response === null || response.strain === 'NT' || advance === null ||
      response.strain === opening.strain) {
    return null;
  }
  const advancerKind = getAdvancerCallKindForOpenerRebid(context.dealer, context.auction);
  const interference = getInterferenceAfterOpening(context.dealer, context.auction);
  if (interference === 'suitOvercall') {
    const overcall = overcallCall === undefined ? null : parseSuitBid(overcallCall);
    if (overcall === null || overcall.strain === 'NT' || response.strain === overcall.strain ||
        (response.level !== 1 && response.level !== 2) ||
        cheapestBidInStrainAfter(overcall, response.strain) !== responseCall ||
        (advancerKind !== 'raise' && advancerKind !== 'preemptiveRaise' &&
         advancerKind !== 'newSuit')) {
      return null;
    }
    return { opening, response, advance, minimumSupport: response.level === 2 ? 3 : 4 };
  }
  if (interference === 'takeoutDouble') {
    if (response.level !== 1 || cheapestBidInStrainAfter(opening, response.strain) !== responseCall ||
        advancerKind !== 'newSuit') {
      return null;
    }
    return { opening, response, advance, minimumSupport: 4 };
  }
  return null;
}

/// refineOpenerForcingResponseCompetitionSupport keeps a natural raise of responder's forcing suit
/// only through the three level.  Competition may make the old cheap raise unavailable, but moving
/// one level higher remains descriptive when it is still below game; a forced game-level decision
/// is left to the separate maximum rule or scope-boundary guidance.
export function refineOpenerForcingResponseCompetitionSupport (
    calls: Call[], context: RuleEvalContext): CallRefinementResult {
  const info = getOpenerForcingResponseCompetitionInfo(context);
  if (info === null || context.handFacts.lengths[info.response.strain as Suit] < info.minimumSupport) {
    return { calls: [], telemetryLines: ['No supported forcing-response fit is available.'] };
  }
  const wanted = cheapestBidInStrainAfter(info.advance, info.response.strain);
  const parsed = wanted === null ? null : parseSuitBid(wanted);
  if (parsed === null || parsed.level > 3) {
    return { calls: [], telemetryLines: ['Competition has pushed the natural raise to game level.'] };
  }
  return {
    calls: calls.filter((call) => call === wanted),
    telemetryLines: [`Support responder at the cheapest available level with ${wanted}.`],
  };
}

/// refineOpenerForcingResponseCompetitionRepeat keeps a six-card opening suit at the cheapest
/// available level through three.  It deliberately does not promote a blocked partscore rebid into
/// a game-level decision merely because advancer consumed bidding space.
export function refineOpenerForcingResponseCompetitionRepeat (
    calls: Call[], context: RuleEvalContext): CallRefinementResult {
  const info = getOpenerForcingResponseCompetitionInfo(context);
  if (info === null || context.handFacts.lengths[info.opening.strain as Suit] < 6) {
    return { calls: [], telemetryLines: ['No six-card opening suit is available to repeat.'] };
  }
  const wanted = cheapestBidInStrainAfter(info.advance, info.opening.strain);
  const parsed = wanted === null ? null : parseSuitBid(wanted);
  if (parsed === null || parsed.level > 3) {
    return { calls: [], telemetryLines: ['Competition has pushed the opening-suit rebid too high.'] };
  }
  return {
    calls: calls.filter((call) => call === wanted),
    telemetryLines: [`Repeat the six-card opening suit economically with ${wanted}.`],
  };
}

/// refineOpenerForcingResponseCompetitionGameRaise keeps only game in responder's natural suit
/// when opener has maximum values and the support promised by this competitive response family.
export function refineOpenerForcingResponseCompetitionGameRaise (
    calls: Call[], context: RuleEvalContext): CallRefinementResult {
  const info = getOpenerForcingResponseCompetitionInfo(context);
  if (info === null || context.handFacts.lengths[info.response.strain as Suit] < info.minimumSupport) {
    return { calls: [], telemetryLines: ['No maximum forcing-response fit is available.'] };
  }
  const targetLevel = info.response.strain === 'H' || info.response.strain === 'S' ? 4 : 5;
  const wanted = `${targetLevel}${info.response.strain}` as SuitBid;
  return {
    calls: calls.filter((call) => call === wanted),
    telemetryLines: [`Maximum opener places the supported responder suit in game at ${wanted}.`],
  };
}

/// openerForcingResponseCompetitionNtApplies retains only the ordinary balanced notrump ranges
/// whose original contract level is still available after advancer acts.  The evaluator's shared
/// competitive filter separately requires stoppers in every suit the opponents bid naturally.
export function openerForcingResponseCompetitionNtApplies (
    call: Call, context: RuleEvalContext, _system: BiddingSystem): AppliesWhenResult {
  const info = getOpenerForcingResponseCompetitionInfo(context);
  if (info === null || ! context.handFacts.balanced ||
      context.handFacts.lengths[info.response.strain as Suit] >= info.minimumSupport) {
    return { success: false, telemetryLines: ['FAIL: no balanced forcing-response NT rebid.'] };
  }
  const hcp = context.handFacts.hcp;
  let wanted: SuitBid | null = null;
  if (hcp >= 12 && hcp <= 14) {
    wanted = info.response.level === 1 ? '1NT' : '2NT';
  } else if (hcp >= 18 && hcp <= 19) {
    wanted = info.response.level === 1 ? '2NT' : '3NT';
  }
  const success = wanted !== null && call === wanted &&
    isCallAvailableInAuction(wanted, context.auction);
  return {
    success,
    telemetryLines: [success
      ? `PASS: ${wanted} retains the natural balanced range after advancer competes.`
      : 'FAIL: no available natural notrump rebid matches this strength and response level.'],
  };
}

/// openerForcingResponseCompetitionPassApplies keeps a genuine minimum Pass only when competition
/// has removed the selected descriptive continuations.  Responder still has another turn; this is
/// not a claim that the original forcing response was weak or that opener would Pass without the
/// intervening call.
export function openerForcingResponseCompetitionPassApplies (
    _call: Call, context: RuleEvalContext, _system: BiddingSystem): AppliesWhenResult {
  const info = getOpenerForcingResponseCompetitionInfo(context);
  if (info === null) {
    return { success: false, telemetryLines: ['FAIL: not a reviewed forcing-response competition.'] };
  }
  const hasFit = context.handFacts.lengths[info.response.strain as Suit] >= info.minimumSupport;
  const points = hasFit
    ? context.handFacts.totalPointsWShortage
    : context.handFacts.totalPointsWLength;
  if (points < 12 || points > 16) {
    return { success: false, telemetryLines: [`FAIL: minimum Pass range is 12-16; hand has ${points}.`] };
  }
  const clearContinuation = hasClearForcingResponseCompetitionContinuation(context, info);
  return {
    success: ! clearContinuation,
    telemetryLines: [clearContinuation
      ? 'FAIL: a selected natural descriptive continuation remains available.'
      : 'PASS: competition removed the selected descriptive rebids; minimum opener may Pass.'],
  };
}

/// openerForcingResponseCompetitionScopeBoundaryApplies identifies extra-value hands after a
/// natural forcing responder suit where no concrete modeled action survives.  A concrete rule, if
/// one applies, suppresses this explanatory fallback in the evaluator.
export function openerForcingResponseCompetitionScopeBoundaryApplies (
    context: RuleEvalContext, _system: BiddingSystem): AppliesWhenResult {
  const info = getOpenerForcingResponseCompetitionInfo(context);
  if (info === null) {
    return { success: false, telemetryLines: ['FAIL: not a reviewed forcing-response competition.'] };
  }
  const hasFit = context.handFacts.lengths[info.response.strain as Suit] >= info.minimumSupport;
  const points = hasFit
    ? context.handFacts.totalPointsWShortage
    : context.handFacts.totalPointsWLength;
  const success = points >= 17;
  return {
    success,
    telemetryLines: [
      `${success ? 'PASS' : 'FAIL'}: extra-value boundary starts at 17; hand has ${points}.`,
    ],
  };
}

/// A9's cuebid is advancer's artificial bid in opener's known suit after responder's
/// nonforcing simple raise.  This is not a natural contract in opener's suit.
function openerAfterAdvancerSupportCuebid (context: RuleEvalContext): boolean {
  if (context.stage !== 'openerRebid') return false;
  const openingInfo = getOpeningCallInfo(context.dealer, context.auction);
  if (openingInfo === null || context.auction.length !== openingInfo.index + 4) return false;
  const opening = parseSuitBid(openingInfo.call);
  const response = parseSuitBid(context.auction[openingInfo.index + 2] ?? 'Pass');
  const advance = context.auction[openingInfo.index + 3];
  const interference = getInterferenceAfterOpening(context.dealer, context.auction);
  return opening !== null && opening.level === 1 && opening.strain !== 'NT' &&
    response !== null && response.strain === opening.strain && response.level === 2 &&
    (interference === 'suitOvercall' || interference === 'takeoutDouble') &&
    getAdvancerCallKindForOpenerRebid(context.dealer, context.auction) === 'cuebid' &&
    cheapestBidInStrainAfter(response, opening.strain) === advance;
}

/// Only a minimum, nonforcing raise admits this defensive Pass. Passing an artificial
/// opponent cuebid does not suggest that our partnership will play in that suit.
export function openerSupportCuebidPassApplies (
    _call: Call, context: RuleEvalContext, _system: BiddingSystem): AppliesWhenResult {
  const selected = openerAfterAdvancerSupportCuebid(context);
  const points = context.handFacts.totalPointsWShortage;
  return { success: selected && points >= 12 && points <= 16,
    telemetryLines: [selected
      ? `Opener has ${points} support points after opponent's artificial support cuebid.`
      : 'Not the selected simple-raise / artificial-advancer-cuebid auction.'] };
}

export function openerSupportCuebidGameApplies (
    call: Call, context: RuleEvalContext, _system: BiddingSystem): AppliesWhenResult {
  const opening = getOpenerOpeningBid(context);
  const selected = openerAfterAdvancerSupportCuebid(context);
  const points = context.handFacts.totalPointsWShortage;
  const suit = opening?.strain;
  const correctGame = suit === 'H' || suit === 'S' ? call === `4${suit}` : call === '3NT';
  const opponentSuits = getOpponentNaturallyBidSuitsForOpenerRebid(context.dealer, context.auction);
  const stopped = opponentSuits.every((named) => hasBasicSuitStopper(context, named));
  const success = selected && correctGame && points >= 19 &&
    (suit === 'H' || suit === 'S' || (context.handFacts.balancedOrSemiBalanced && stopped));
  return { success, telemetryLines: [success
    ? 'Maximum opener can bid game after partner established a fit.'
    : 'No selected major game or stopped minor-fit 3NT continuation.'] };
}

export function openerSupportCuebidScopeBoundaryApplies (
    context: RuleEvalContext, _system: BiddingSystem): AppliesWhenResult {
  return { success: openerAfterAdvancerSupportCuebid(context), telemetryLines: [
    'Artificial advancer cuebid after our simple raise: further bidding depends on fit, ' +
    'game prospects, and defensive judgment.'] };
}

/// Responder's game-forcing three-level suit survives a further opposing raise. With a
/// self-supporting six-card opening major, game in that major is a selected natural route.
export function openerThreeLevelForcingResponseOpeningMajorGameApplies (
    call: Call, context: RuleEvalContext, _system: BiddingSystem): AppliesWhenResult {
  const opening = getOpenerOpeningBid(context);
  const response = getResponderBid(context);
  const openingInfo = getOpeningCallInfo(context.dealer, context.auction);
  const advanceKind = getAdvancerCallKindForOpenerRebid(context.dealer, context.auction);
  const selected = context.stage === 'openerRebid' && openingInfo !== null &&
    context.auction.length === openingInfo.index + 4 &&
    getInterferenceAfterOpening(context.dealer, context.auction) === 'suitOvercall' &&
    (advanceKind === 'raise' || advanceKind === 'preemptiveRaise') &&
    opening !== null && (opening.strain === 'H' || opening.strain === 'S') &&
    response !== null && response.level === 3 && response.strain !== 'NT' &&
    response.strain !== opening.strain && call === `4${opening.strain}`;
  const goodLongMajor = selected && opening !== null &&
    context.handFacts.lengths[opening.strain as Suit] >= 6 &&
    context.handFacts.totalPointsWLength >= 15;
  return { success: goodLongMajor, telemetryLines: [goodLongMajor
    ? 'A strong six-card opening major provides a natural game destination after competition.'
    : 'Not a selected self-supporting major game after a three-level game force.'] };
}

/// openerThreeLevelForcingResponseThreeNtApplies keeps a natural 3NT rebid after responder makes
/// the selected game-forcing three-level new-suit response to a two-level overcall.  Prefer a
/// known major fit; otherwise opener needs a balanced/semi-balanced hand and a stopper in every
/// naturally bid opponent suit.
export function openerThreeLevelForcingResponseThreeNtApplies (
    call: Call, context: RuleEvalContext, _system: BiddingSystem): AppliesWhenResult {
  const response = getResponderBid(context);
  if (call !== '3NT' || response === null || response.level !== 3 || response.strain === 'NT') {
    return { success: false, telemetryLines: ['FAIL: not the selected three-level forcing response.'] };
  }
  const majorFit = (response.strain === 'H' || response.strain === 'S') &&
    context.handFacts.lengths[response.strain as Suit] >= 3;
  const opponentSuits = getOpponentNaturallyBidSuitsForOpenerRebid(
    context.dealer, context.auction);
  const stopped = opponentSuits.every((suit) => hasBasicSuitStopper(context, suit));
  const shapeOkay = context.handFacts.balancedOrSemiBalanced;
  const success = ! majorFit && shapeOkay && stopped;
  return {
    success,
    telemetryLines: [
      `${majorFit ? 'FAIL' : 'PASS'}: prefer the known major fit when opener has three-card support.`,
      `${shapeOkay ? 'PASS' : 'FAIL'}: 3NT needs balanced or semi-balanced shape.`,
      `${stopped ? 'PASS' : 'FAIL'}: 3NT needs every naturally bid opponent suit stopped.`,
    ],
  };
}

/// hasClearForcingResponseCompetitionContinuation mirrors only the concrete minimum continuations
/// declared for this family.  It is intentionally narrower than general bridge judgment: support,
/// a six-card opening suit, an unchanged economical second suit, or a natural balanced NT rebid.
function hasClearForcingResponseCompetitionContinuation (
    context: RuleEvalContext,
    info: { opening: ParsedSuitBid; response: ParsedSuitBid; advance: ParsedSuitBid;
            minimumSupport: number }): boolean {
  const responseSuit = info.response.strain as Suit;
  if (context.handFacts.lengths[responseSuit] >= info.minimumSupport) {
    const raise = cheapestBidInStrainAfter(info.advance, responseSuit);
    const parsedRaise = raise === null ? null : parseSuitBid(raise);
    if (parsedRaise !== null && parsedRaise.level <= 3) return true;
  }
  const openingSuit = info.opening.strain as Suit;
  if (context.handFacts.lengths[openingSuit] >= 6) {
    const repeat = cheapestBidInStrainAfter(info.advance, openingSuit);
    const parsedRepeat = repeat === null ? null : parseSuitBid(repeat);
    if (parsedRepeat !== null && parsedRepeat.level <= 3) return true;
  }
  const opponentSuits = getOpponentNaturallyBidSuitsForOpenerRebid(
    context.dealer, context.auction);
  for (const suit of SUITS) {
    if (suit === openingSuit || suit === responseSuit || opponentSuits.includes(suit) ||
        context.handFacts.lengths[suit] < 4) {
      continue;
    }
    const cheapest = cheapestBidInStrainAfter(info.response, suit);
    const candidate = cheapest === null ? null : parseSuitBid(cheapest);
    if (cheapest !== null && candidate !== null &&
        ! openerRebidIsReverse(info.opening, info.response, candidate) &&
        isCallAvailableInAuction(cheapest, context.auction)) {
      return true;
    }
  }
  if (! context.handFacts.balanced || context.handFacts.hcp < 12 || context.handFacts.hcp > 14 ||
      context.handFacts.lengths[responseSuit] >= info.minimumSupport) {
    return false;
  }
  const ntCall = (info.response.level === 1 ? '1NT' : '2NT') as SuitBid;
  return isCallAvailableInAuction(ntCall, context.auction) &&
    opponentSuits.every((suit) => hasBasicSuitStopper(context, suit));
}

export function refineOpenerLowerRankingSecondSuitRebid (calls: Call[], context: RuleEvalContext):
    CallRefinementResult {
  const opening = getOpenerOpeningBid(context);
  if (opening === null || opening.strain === 'NT') {
    return { calls: [], telemetryLines: ['No suit opening is available for a second-suit rebid.'] };
  }
  const openingIndex = STRAIN_ORDER.indexOf(opening.strain);
  const refined = calls.filter((call) => {
    const candidate = parseSuitBid(call);
    if (candidate === null || candidate.strain === 'NT' || candidate.strain === opening.strain) {
      return false;
    }
    return STRAIN_ORDER.indexOf(candidate.strain) < openingIndex &&
           cheapestNewSuitBid(opening, candidate.strain) === call;
  });
  return {
    calls: refined,
    telemetryLines: ['Keep only a cheapest lower-ranking second-suit rebid; exclude reverses.'],
  };
}

/// refineOpenerSplinterControlBid keeps the cheapest available side-suit control below four of the
/// agreed major when opener has slam-interest working values.  Working HCP discounts K/Q/J in
/// responder's splinter suit; the ace remains counted because the splinter does not distinguish a
/// singleton from a void, and an ace may not be a wasted high card against a void.  A control is A,
/// K, singleton, or void.
///
export function refineOpenerSplinterControlBid (calls: Call[], context: RuleEvalContext):
    CallRefinementResult {
  const opening = getOpenerOpeningBid(context);
  const response = getResponderBid(context);
  if (opening === null || response === null ||
      (opening.strain !== 'H' && opening.strain !== 'S') || response.strain === 'NT' ||
      response.strain === opening.strain) {
    return { calls: [], telemetryLines: ['No major-opening splinter auction is available.'] };
  }
  // Discount K/Q/J held opposite responder's announced shortness; keep the ace counted in this
  // deliberately simple approximation because the splinter does not distinguish singleton/void.
  const splinterSuit = response.strain as Suit;
  const wastedHcp = getCardsForSuit(context.hand, splinterSuit).reduce((total, card) => {
    if (card.rank === 'K') return total + 3;
    if (card.rank === 'Q') return total + 2;
    if (card.rank === 'J') return total + 1;
    return total;
  }, 0);
  const workingHcp = context.handFacts.hcp - wastedHcp;
  if (workingHcp < 15) {
    return { calls: [], telemetryLines: [
      `No splinter control bid: ${context.handFacts.hcp} HCP - ${wastedHcp} wasted K/Q/J points ` +
      `in ${splinterSuit} = ${workingHcp} working HCP; 15+ is the slam-interest threshold.`,
    ] };
  }
  // A control bid must be a side suit below game in the agreed major.  Exclude both the trump
  // suit and responder's already-announced splinter suit before examining opener's side suits.
  const game = parseSuitBid(`4${opening.strain}` as SuitBid)!;
  const legalControls = calls.filter((call) => {
    const candidate = parseSuitBid(call);
    if (candidate === null || candidate.strain === 'NT' || candidate.strain === opening.strain ||
        candidate.strain === response.strain) {
      return false;
    }
    if (cheapestBidInStrainAfter(response, candidate.strain) !== call ||
        compareSuitBids(candidate, game) >= 0) {
      return false;
    }
    const suit = candidate.strain as Suit;
    const cards = getCardsForSuit(context.hand, suit);
    // In opener's candidate side suit, A/K is a high-card control and singleton/void is a
    // shortness control.  The responder's splinter suit was excluded above.
    return cards.length <= 1 || cards.some((card) => card.rank === 'A' || card.rank === 'K');
  });
  // Control-bid upward from the cheapest available suit.
  legalControls.sort((a, b) => compareSuitBids(parseSuitBid(a)!, parseSuitBid(b)!));
  const cheapestControl = legalControls[0];
  return {
    calls: cheapestControl === undefined ? [] : [cheapestControl],
    telemetryLines: [
      `${workingHcp} working HCP after discounting K/Q/J in responder's ${splinterSuit} splinter.`,
      cheapestControl === undefined
        ? `No modeled side-suit control is available below 4${opening.strain}.`
        : `Use the cheapest available A/K/singleton/void control below game: ${cheapestControl}.`,
    ],
  };
}

/// refineOpenerReverseRebid keeps cheapest new-suit rebids that force responder above two of
/// opener's first suit to give simple preference.  The rule's appliesWhen separately enforces the
/// strength promised by the configured treatment.
///
export function refineOpenerReverseRebid (calls: Call[], context: RuleEvalContext):
    CallRefinementResult {
  const opening = getOpenerOpeningBid(context);
  const response = getResponderBid(context);
  if (opening === null || response === null || opening.strain === 'NT') {
    return { calls: [], telemetryLines: ['No suit opening and response are available for a reverse.'] };
  }
  const refined = calls.filter((call) => {
    const candidate = parseSuitBid(call);
    return candidate !== null && openerRebidIsReverse(opening, response, candidate);
  });
  return {
    calls: refined,
    telemetryLines: [
      "Keep only cheapest new-suit rebids that force responder above two of opener's first suit.",
    ],
  };
}

/// refineOpenerFiveCardMajorFallback allows a minimum Standard opener to repeat exactly five
/// cards only when a forcing two-level response leaves no descriptive rebid.  In particular,
/// a three-level lower second suit after 1S-2H is a strength-showing high reverse, not an
/// economical alternative for a minimum hand.
///
export function refineOpenerFiveCardMajorFallback (calls: Call[], context: RuleEvalContext):
    CallRefinementResult {
  const opening = getOpenerOpeningBid(context);
  const response = getResponderBid(context);
  if (opening === null || response === null ||
      (opening.strain !== 'S' && opening.strain !== 'H') ||
      response.level !== 2 || response.strain === 'NT' ||
      context.handFacts.lengths[opening.strain] !== 5) {
    return { calls: [], telemetryLines: ['Five-card fallback requires a major opening and natural two-level response.'] };
  }
  // A known fit or an ordinary minimum balanced NT rebid takes precedence over the fallback.
  const responderSuit = response.strain as Suit;
  const minSupport = opening.strain === 'S' && responderSuit === 'H' ? 3 : 4;
  if (context.handFacts.lengths[responderSuit] >= minSupport ||
      (context.handFacts.balanced && context.handFacts.hcp >= 12 &&
       context.handFacts.hcp <= 14)) {
    return { calls: [], telemetryLines: ['Responder support or a minimum balanced 2NT rebid is available.'] };
  }
  // An economical natural second suit is available only if it does not force preference higher.
  const hasEconomicalSecondSuit = SUITS.some((suit) => {
    if (suit === opening.strain || suit === responderSuit ||
        context.handFacts.lengths[suit] < 4) {
      return false;
    }
    const cheapest = cheapestBidInStrainAfter(response, suit);
    const candidate = cheapest === null ? null : parseSuitBid(cheapest);
    return candidate !== null && ! openerRebidIsReverse(opening, response, candidate);
  });
  if (hasEconomicalSecondSuit) {
    return { calls: [], telemetryLines: ['An economical natural four-card second suit is available.'] };
  }
  // With no descriptive call, show the five-card major rather than promise reverse strength.
  const wantedCall = `2${opening.strain}` as SuitBid;
  return {
    calls: calls.filter((call) => call === wantedCall),
    telemetryLines: ['Minimum Standard fallback: five-card major repeat because no natural rebid fits.'],
  };
}

/// refineOpenerNonReverseNewSuitRebid keeps the cheapest natural new-suit rebids that are
/// not reverses.  Unlike a rank-only test, this correctly keeps 1C-1H-1S while rejecting
/// 1C-1H-2D, and it can also keep a lower-ranking two-level suit such as 1D-1H-2C.
///
export function refineOpenerNonReverseNewSuitRebid (calls: Call[], context: RuleEvalContext):
    CallRefinementResult {
  const opening = getOpenerOpeningBid(context);
  const response = getResponderBid(context);
  if (opening === null || response === null || opening.strain === 'NT') {
    return { calls: [], telemetryLines: ['No suit opening and response are available for rebid.'] };
  }
  const refined = calls.filter((call) => {
    const candidate = parseSuitBid(call);
    if (candidate === null || candidate.strain === 'NT' || candidate.strain === opening.strain ||
        candidate.strain === response.strain) {
      return false;
    }
    return cheapestBidInStrainAfter(response, candidate.strain) === call &&
           ! openerRebidIsReverse(opening, response, candidate);
  });
  return {
    calls: refined,
    telemetryLines: ['Keep cheapest natural second-suit rebids that are not reverses.'],
  };
}

/// refineOpenerNaturalJumpShiftRebid keeps a one-level jump in a new suit only when the
/// corresponding non-jump bid is not already a reverse.  For example 1C-1H-2S is a natural
/// maximum jump shift, while 1C-1H-3D is left to partnership agreement because 2D is a reverse.
///
export function refineOpenerNaturalJumpShiftRebid (calls: Call[], context: RuleEvalContext):
    CallRefinementResult {
  const opening = getOpenerOpeningBid(context);
  const response = getResponderBid(context);
  if (opening === null || response === null || opening.strain === 'NT') {
    return { calls: [], telemetryLines: ['No suit opening and response are available for a jump shift.'] };
  }
  const refined = calls.filter((call) => {
    const candidate = parseSuitBid(call);
    if (candidate === null || candidate.strain === 'NT' || candidate.strain === opening.strain ||
        candidate.strain === response.strain) {
      return false;
    }
    const cheapest = cheapestBidInStrainAfter(response, candidate.strain);
    if (cheapest === null) {
      return false;
    }
    const cheapestParsed = parseSuitBid(cheapest)!;
    return candidate.level === cheapestParsed.level + 1 &&
           ! openerRebidIsReverse(opening, response, cheapestParsed);
  });
  return {
    calls: refined,
    telemetryLines: ['Keep natural jump shifts whose non-jump new-suit bid is not a reverse.'],
  };
}

export function refineOpenerOpeningSuitToLevel (calls: Call[], context: RuleEvalContext,
                                                targetLevel: number): CallRefinementResult {
  const opening = getOpenerOpeningBid(context);
  if (opening === null || opening.strain === 'NT') {
    return { calls: [], telemetryLines: ['No suit opening is available to rebid.'] };
  }
  const wantedCall = `${targetLevel}${opening.strain}` as SuitBid;
  return {
    calls: calls.filter((call) => call === wantedCall),
    telemetryLines: [`Keep opener's ${wantedCall} rebid.`],
  };
}

/// refineOpenerOpeningSuitAtCheapestLevel repeats opener's suit at its cheapest legal level after
/// responder's actual call.
///
export function refineOpenerOpeningSuitAtCheapestLevel (
    calls: Call[], context: RuleEvalContext): CallRefinementResult {
  const opening = getOpenerOpeningBid(context);
  const response = getResponderBid(context);
  if (opening === null || response === null || opening.strain === 'NT') {
    return { calls: [], telemetryLines: ['No suit opening and response are available to repeat.'] };
  }
  const wantedCall = cheapestBidInStrainAfter(response, opening.strain);
  return {
    calls: wantedCall === null ? [] : calls.filter((call) => call === wantedCall),
    telemetryLines: wantedCall === null
      ? ["Opener's suit cannot be rebid legally after responder's call."]
      : [`Repeat opener's ${opening.strain} at the cheapest legal level: ${wantedCall}.`],
  };
}

/// refineOpenerNotrumpAtCheapestLevel keeps the cheapest legal notrump rebid after responder.
///
export function refineOpenerNotrumpAtCheapestLevel (
    calls: Call[], context: RuleEvalContext): CallRefinementResult {
  const response = getResponderBid(context);
  if (response === null) {
    return { calls: [], telemetryLines: ['No responder bid is available for a notrump rebid.'] };
  }
  const wantedCall = cheapestBidInStrainAfter(response, 'NT');
  return {
    calls: wantedCall === null ? [] : calls.filter((call) => call === wantedCall),
    telemetryLines: wantedCall === null
      ? ['No legal notrump rebid is available.']
      : [`Use the cheapest legal notrump rebid: ${wantedCall}.`],
  };
}

/// refineOpenerResponderSuitToGame raises responder's natural suit to its normal game level.
///
export function refineOpenerResponderSuitToGame (calls: Call[], context: RuleEvalContext,
                                                   _system: BiddingSystem,
                                                   minimumSupport?: number):
    CallRefinementResult {
  const response = getResponderBid(context);
  if (response === null || response.strain === 'NT') {
    return { calls: [], telemetryLines: ['No responder suit is available to raise to game.'] };
  }
  const targetLevel = response.strain === 'H' || response.strain === 'S' ? 4 : 5;
  return refineOpenerRaiseResponderSuitToLevel(calls, context, targetLevel, minimumSupport);
}

/// A five-card natural two-level response needs only three-card support; a four-card
/// minor response needs four. The independent new-suit-then-raise support path may use
/// a three-card minor, so a minor raise there is descriptive, not always an eight-card fit.
export function openerTwoLevelRaiseApplies (_call: Call, context: RuleEvalContext,
    minPoints?: number, maxPoints?: number): AppliesWhenResult {
  const opening = getOpenerOpeningBid(context);
  const response = getResponderBid(context);
  const responseFive = opening !== null && response !== null && response.level === 2 &&
    ((opening.strain === 'S' && response.strain === 'H') ||
     (opening.strain === 'D' && response.strain === 'C'));
  const required = responseFive ? 3 : 4;
  const support = response?.strain === undefined || response.strain === 'NT' ? 0 :
    context.handFacts.lengths[response.strain];
  const points = context.handFacts.totalPointsWShortage;
  const success = opening !== null && response !== null && response.level === 2 &&
    support >= required && (minPoints === undefined || points >= minPoints) &&
    (maxPoints === undefined || points <= maxPoints);
  return { success, telemetryLines: [
    `${success ? 'PASS' : 'FAIL'}: ${required}-card opener support required after the ` +
    `natural two-level response; actual support ${support}, shortage points ${points}.`,
  ] };
}

/// refineOpenerRaiseResponderSuitToLevel keeps the raise of responder's natural suit to the
/// requested level.  Three-card support is enough when responder's bid promised five cards:
/// non-jump 2H over 1S, or 2C over 1D in the current uncontested treatments.  Competitive callers
/// can pass an explicit minimum when the response itself promises five or more cards.
///
export function refineOpenerRaiseResponderSuitToLevel (calls: Call[], context: RuleEvalContext,
                                                       targetLevel: number,
                                                       minimumSupport?: number):
    CallRefinementResult {
  const opening = getOpenerOpeningBid(context);
  const response = getResponderBid(context);
  if (opening === null || response === null || opening.strain === 'NT' ||
      response.strain === 'NT' || response.strain === opening.strain) {
    return { calls: [], telemetryLines: ['No responder new suit is available to raise.'] };
  }
  const responseSuit = response.strain as Suit;
  const responsePromisesFive = response.level === 2 &&
    ((opening.strain === 'S' && response.strain === 'H') ||
     (opening.strain === 'D' && response.strain === 'C'));
  const minSupport = minimumSupport ?? (responsePromisesFive ? 3 : 4);
  if (context.handFacts.lengths[responseSuit] < minSupport) {
    return {calls: [],
            telemetryLines: [
              `Responder's ${responseSuit} needs ${minSupport}+ cards of opener support; ` +
              `opener has ${context.handFacts.lengths[responseSuit]}.`,
            ],
    };
  }
  const wantedCall = `${targetLevel}${responseSuit}` as SuitBid;
  return {calls: calls.filter((call) => call === wantedCall),
          telemetryLines: [`Raise responder's ${responseSuit} to ${wantedCall}.`],
  };
}// refineOpenerRaiseResponderSuitToLevel()

/// refineOpenerRaiseResponderSuitOneLevel supports responder's natural forcing suit one level
/// above the actual response, preserving bidding room while satisfying the force economically.
///
export function refineOpenerRaiseResponderSuitOneLevel (
    calls: Call[], context: RuleEvalContext): CallRefinementResult {
  const response = getResponderBid(context);
  if (response === null || response.strain === 'NT') {
    return { calls: [], telemetryLines: ['No responder suit is available for a one-level raise.'] };
  }
  const responseSuit = response.strain as Suit;
  if (context.handFacts.lengths[responseSuit] < 3) {
    return { calls: [], telemetryLines: [
      `Responder's natural forcing suit needs three-card opener support; opener has ` +
        `${context.handFacts.lengths[responseSuit]}.`,
    ] };
  }
  const wantedCall = `${response.level + 1}${response.strain}` as SuitBid;
  return {
    calls: calls.filter((call) => call === wantedCall),
    telemetryLines: [`Raise responder's ${response.strain} one level to ${wantedCall}.`],
  };
}

/// refineOpenerFourCardMajorUpTheLine keeps opener's cheapest four-card major rebids and orders
/// equal-length majors up the line.  This is the shared major-choice refinement for the Standard
/// and 2/1 continuations after 1D-2C; the rules separately decide whether the bid promises extra
/// strength or first denies five diamonds.
///
export function refineOpenerFourCardMajorUpTheLine (calls: Call[], context: RuleEvalContext):
    CallRefinementResult {
  const legalResult = refineOpenerNewSuitAtCheapestLevel(calls, context);
  let majors = legalResult.calls
    .map((call) => {
      const candidate = parseSuitBid(call)!;
      const suit = candidate.strain as Suit;
      return { call, suit, length: context.handFacts.lengths[suit] };
    })
    .filter((candidate) =>
      (candidate.suit === 'H' || candidate.suit === 'S') && candidate.length >= 4);
  if (majors.length > 1) {
    majors = orderMajorSuitCandidates(majors);
  }
  return {
    calls: majors.map((candidate) => candidate.call),
    telemetryLines: [
      ...legalResult.telemetryLines,
      'Keep four-card major rebids; with equal four-card majors, bid hearts before spades.',
    ],
  };
}

/// refineOpenerNewSuitAtCheapestLevel keeps opener's cheapest legal second-suit calls after
/// responder's actual call.  suitOrder can restrict the second suit to lower- or higher-ranking
/// than opener's first suit; higher is the reverse case (17+ points) in the current uncontested
/// rules.
///
export function refineOpenerNewSuitAtCheapestLevel (
    calls: Call[], context: RuleEvalContext, suitOrder: 'any' | 'lower' | 'higher' = 'any'):
    CallRefinementResult {
  const opening = getOpenerOpeningBid(context);
  const response = getResponderBid(context);
  if (opening === null || response === null || opening.strain === 'NT') {
    return { calls: [], telemetryLines: ['No suit opening and response are available for rebid.'] };
  }
  const openingIndex = STRAIN_ORDER.indexOf(opening.strain);
  const refined = calls.filter((call) => {
    const candidate = parseSuitBid(call);
    if (candidate === null || candidate.strain === 'NT' || candidate.strain === opening.strain ||
        candidate.strain === response.strain) {
      return false;
    }
    const candidateIndex = STRAIN_ORDER.indexOf(candidate.strain);
    if (suitOrder === 'lower' && candidateIndex >= openingIndex) {
      return false;
    }
    if (suitOrder === 'higher' && candidateIndex <= openingIndex) {
      return false;
    }
    return cheapestBidInStrainAfter(response, candidate.strain) === call;
  });
  return {
    calls: refined,
    telemetryLines: [`Keep cheapest ${suitOrder} new-suit rebids after responder's call.`],
  };
}

/// refineOpenerNewSuitByExtraLevels keeps opener new-suit calls a fixed number of levels above the
/// cheapest legal call after responder.  This covers strong jump shifts and opener-side splinters.
///
export function refineOpenerNewSuitByExtraLevels (
    calls: Call[], context: RuleEvalContext, extraLevels: number,
    suitOrder: 'any' | 'lower' | 'higher', label: string): CallRefinementResult {
  const opening = getOpenerOpeningBid(context);
  const response = getResponderBid(context);
  if (opening === null || response === null || opening.strain === 'NT') {
    return { calls: [],
             telemetryLines: [`No suit opening and response are available for ${label}.`] };
  }
  const openingIndex = STRAIN_ORDER.indexOf(opening.strain);
  const refined = calls.filter((call) => {
    const candidate = parseSuitBid(call);
    if (candidate === null || candidate.strain === 'NT' || candidate.strain === opening.strain ||
        candidate.strain === response.strain) {
      return false;
    }
    const candidateIndex = STRAIN_ORDER.indexOf(candidate.strain);
    if (suitOrder === 'lower' && candidateIndex >= openingIndex) {
      return false;
    }
    if (suitOrder === 'higher' && candidateIndex <= openingIndex) {
      return false;
    }
    const cheapest = cheapestBidInStrainAfter(response, candidate.strain);
    if (cheapest === null) {
      return false;
    }
    const cheapestParsed = parseSuitBid(cheapest)!;
    return candidate.level === cheapestParsed.level + extraLevels;
  });
  return { calls: refined, telemetryLines: [`Keep only ${label} calls after responder's bid.`] };
}

/// refineForcingOneNtMinorFallback supplies the awkward rebid required by a completely forcing
/// 1NT response when opener has no normal descriptive rebid. Prefer the longer three-card-or-
/// longer minor, choosing clubs when equal. If neither minor has three cards, a two-card 2C
/// is permitted rather than passing a forcing response or falsely repeating a five-card major.
///
export function refineForcingOneNtMinorFallback (calls: Call[], context: RuleEvalContext):
    CallRefinementResult {
  const opening = getOpenerOpeningBid(context);
  const response = getResponderBid(context);
  // A passed responder's 1NT is nonforcing, regardless of the configured agreement.
  if (responderPreviouslyPassed(context.dealer, context.auction)) {
    return { calls: [], telemetryLines: ['Passed-hand 1NT does not require a manufactured rebid.'] };
  }
  // Ensure our situation is suit opening followed by 1NT ...
  if (opening === null || response === null || opening.strain === 'NT' || response.strain !== 'NT') {
    return { calls: [], telemetryLines: ['Forcing-1NT minor fallback needs a major opening and 1NT.'] };
  }
  // if there are natural bids in this situation, don't look for rare minor bid ...
  const openingSuit = opening.strain as Suit;
  if (context.handFacts.lengths[openingSuit] >= 6) {
    return { calls: [], telemetryLines: ['Six-card opening major supplies a normal rebid.'] };
  }
  if (context.handFacts.hcp >= 18 && context.handFacts.hcp <= 19 &&
      context.handFacts.balancedOrSemiBalanced) {
    return { calls: [], telemetryLines: ['18-19 balanced/semi-balanced hand can rebid 2NT.'] };
  }
  // if a 4+ card suit ranked below the opening major, can bid it 2 level, so stop trying minor.
  const openingIndex = STRAIN_ORDER.indexOf(opening.strain);
  const hasNaturalLowerSecondSuit = SUITS.some((suit) =>
    suit !== openingSuit && STRAIN_ORDER.indexOf(suit) < openingIndex &&
    context.handFacts.lengths[suit] >= 4);
  if (hasNaturalLowerSecondSuit) {
    return { calls: [], telemetryLines: ['A natural lower-ranking four-card second suit is available.'] };
  }
  // If have points to reverse, and have reverse suit to bid, stop looking for minor
  const hasStrengthForReverse = context.handFacts.totalPointsWLength >= 17;
  const hasHigherSecondSuit = SUITS.some((suit) =>
    suit !== openingSuit && STRAIN_ORDER.indexOf(suit) > openingIndex &&
    context.handFacts.lengths[suit] >= 4);
  if (hasStrengthForReverse && hasHigherSecondSuit) {
    return { calls: [], telemetryLines: ['A strength-qualified reverse is available.'] };
  }
  // No descriptive rebid: use a three-card minor where one exists.
  const minorCandidates = calls.filter((call) => {
    const candidate = parseSuitBid(call);
    return candidate !== null && candidate.level === 2 &&
           (candidate.strain === 'C' || candidate.strain === 'D') &&
           context.handFacts.lengths[candidate.strain] >= 3;
  });
  if (minorCandidates.length === 0) {
    const twoCardClubs = context.handFacts.lengths.C >= 2 && calls.includes('2C');
    return { calls: twoCardClubs ? ['2C'] : [], telemetryLines: [twoCardClubs
      ? 'Neither minor has three cards; the forcing-1NT fallback is 2C on two clubs.'
      : 'No eligible minor is available for the forcing-1NT fallback.'] };
  }
  // With only one available minor, use it.  With both minors available, bid the longer one;
  let refined = minorCandidates;
  if (minorCandidates.length === 2) {
    if (context.handFacts.lengths.C > context.handFacts.lengths.D) {
      refined = ['2C'];
    } else if (context.handFacts.lengths.D > context.handFacts.lengths.C) {
      refined = ['2D'];
    } else {
      refined = ['2C']; // if equal len, convention is bid clubs
    }
  }
  return {
    calls: refined,
    telemetryLines: ['No normal rebid is available; manufacture the best three-card minor rebid.'],
  };
}

/// A one-level new-suit response is forcing for one round. With exactly five cards in
/// the opening minor, a minimum opener may repeat it only when the ordinary descriptive
/// rebids are unavailable. This does not change the normal six-card repeat promise.
export function refineOpenerFiveCardMinorFallback (calls: Call[], context: RuleEvalContext):
    CallRefinementResult {
  const opening = getOpenerOpeningBid(context);
  const response = getResponderBid(context);
  if (opening === null || response === null || opening.level !== 1 ||
      (opening.strain !== 'C' && opening.strain !== 'D') || response.level !== 1 ||
      response.strain === 'NT' || response.strain === opening.strain ||
      context.handFacts.lengths[opening.strain] !== 5) {
    return { calls: [], telemetryLines: ['Five-card minor fallback needs a minor opening and one-level new-suit response.'] };
  }
  const responderSuit = response.strain as Suit;
  if (context.handFacts.lengths[responderSuit] >= 4 ||
      (context.handFacts.balanced && context.handFacts.hcp >= 12 &&
       context.handFacts.hcp <= 14)) {
    return { calls: [], telemetryLines: ['Four-card responder support or a normal 1NT rebid is available.'] };
  }
  const anotherSuitAvailable = SUITS.some((suit) => {
    if (suit === opening.strain || suit === responderSuit ||
        context.handFacts.lengths[suit] < 4) return false;
    const cheapest = cheapestBidInStrainAfter(response, suit);
    const candidate = cheapest === null ? null : parseSuitBid(cheapest);
    return candidate !== null && ! openerRebidIsReverse(opening, response, candidate);
  });
  if (anotherSuitAvailable) {
    return { calls: [], telemetryLines: ['A natural economical four-card second suit is available.'] };
  }
  const wanted = `2${opening.strain}`;
  return { calls: calls.filter((call) => call === wanted), telemetryLines: [
    `One-round force with no normal minimum rebid: repeat five-card ${opening.strain}.`,
  ] };
}

/// A very strong six-card-minor opener may have no accurate natural rebid after a
/// forcing one-level major response. Explain the judgment rather than treating an
/// invitational 3m as an unrestricted maximum-strength recommendation.
export function openerExceptionalStrongMinorRebidBoundaryApplies (context: RuleEvalContext):
    AppliesWhenResult {
  const opening = getOpenerOpeningBid(context);
  const response = getResponderBid(context);
  const success = opening !== null && response !== null && opening.level === 1 &&
    (opening.strain === 'C' || opening.strain === 'D') &&
    (response.strain === 'H' || response.strain === 'S') && response.level === 1 &&
    context.handFacts.hcp >= 19 && context.handFacts.lengths[opening.strain] >= 6;
  return { success, telemetryLines: [success
    ? 'Very strong opener with a long minor and a forcing one-level major response; natural strength descriptions may not fit.'
    : 'Not the exceptional strong-minor judgment situation.'] };
}

/// openerMinorOneLevelOneNtApplies uses the 12-14 HCP balanced rebid after a one-level new-suit
/// response.  Opener normally raises four-card support and shows another four-card suit at the one
/// level rather than hiding either feature in 1NT.
///
export function openerMinorOneLevelOneNtApplies (_call: Call, context: RuleEvalContext):
    AppliesWhenResult {
  const opening = getOpenerOpeningBid(context);
  const response = getResponderBid(context);
  if (opening === null || response === null || opening.strain === 'NT' || response.strain === 'NT') {
    return { success: false,
             telemetryLines: ['FAIL: 1NT rebid needs a minor opening and suit response.'] };
  }
  // Check the normal strength, shape, and responder-support limits first.
  const hcpApplies = context.handFacts.hcp >= 12 && context.handFacts.hcp <= 14;
  const balancedApplies = context.handFacts.balanced;
  const responseSuit = response.strain as Suit;
  const supportApplies = context.handFacts.lengths[responseSuit] < 4;
  // Do not hide a four-card second suit that opener can still show at the one level.
  const openingSuit = opening.strain as Suit;
  const hasOneLevelSecondSuit = SUITS.some((suit) => {
    if (suit === openingSuit || suit === responseSuit || context.handFacts.lengths[suit] < 4) {
      return false;
    }
    const cheapest = cheapestBidInStrainAfter(response, suit);
    const parsed = cheapest === null ? null : parseSuitBid(cheapest);
    return parsed !== null && parsed.level === 1;
  });
  const success = hcpApplies && balancedApplies && supportApplies && ! hasOneLevelSecondSuit;
  return {
    success,
    telemetryLines: [
      `${hcpApplies ? 'PASS' : 'FAIL'}: 1NT rebid needs 12-14 HCP; opener has ` +
        `${context.handFacts.hcp}.`,
      `${balancedApplies ? 'PASS' : 'FAIL'}: 1NT rebid needs a balanced hand.`,
      `${supportApplies ? 'PASS' : 'FAIL'}: responder's ${responseSuit} needs fewer than ` +
        'four-card support.',
      `${! hasOneLevelSecondSuit ? 'PASS' : 'FAIL'}: no four-card second suit is available at ` +
        'the one level.',],};
}

/// openerLowerRankingSecondSuitApplies requires the ordinary 12-18 total-point range,
/// five or more cards in the opening minor, and four or more cards in the lower-ranking second suit.
export function openerLowerRankingSecondSuitApplies (call: Call, context: RuleEvalContext):
    AppliesWhenResult {
  return openerSecondSuitApplies(call, context, 12, 18, 'lower-ranking second suit');
}

/// openerReverseApplies requires extra strength for a structurally reverse rebid.
export function openerReverseApplies (call: Call, context: RuleEvalContext): AppliesWhenResult {
  return openerSecondSuitApplies(call, context, 17, 21, 'reverse');
}

export function openerSecondSuitApplies (call: Call, context: RuleEvalContext, minPoints: number,
                                         maxPoints: number, label: string): AppliesWhenResult {
  const opening = getOpenerOpeningBid(context);
  const candidate = parseSuitBid(call);
  if (opening === null || opening.strain === 'NT' || candidate === null ||
      candidate.strain === 'NT' || candidate.strain === opening.strain) {
    return { success: false, telemetryLines: [`FAIL: ${label} needs two different suit bids.`] };
  }
  const openingSuit = opening.strain as Suit;
  const candidateSuit = candidate.strain as Suit;
  const points = context.handFacts.totalPointsWLength;
  const pointsApply = points >= minPoints && points <= maxPoints;
  const openingLengthApplies = context.handFacts.lengths[openingSuit] >= 5;
  const secondSuitLengthApplies = context.handFacts.lengths[candidateSuit] >= 4;
  const success = pointsApply && openingLengthApplies && secondSuitLengthApplies;
  return {
    success,
    telemetryLines: [
      `${pointsApply ? 'PASS' : 'FAIL'}: ${label} needs ${minPoints}-${maxPoints} total points; ` +
        `opener has ${points}.`,
      `${openingLengthApplies ? 'PASS' : 'FAIL'}: opening ${openingSuit} needs 5+ cards; ` +
        `opener has ${context.handFacts.lengths[openingSuit]}.`,
      `${secondSuitLengthApplies ? 'PASS' : 'FAIL'}: rebid ${candidateSuit} needs 4+ cards; ` +
        `opener has ${context.handFacts.lengths[candidateSuit]}.`,
    ],
  };
}

/// After a natural 3NT response to a one-level suit opening, a strong opener can invite slam
/// with quantitative 4NT.  This chosen treatment keeps Pass available as the practical game
/// decision; 4NT is not Blackwood in this auction family.
export function openerSuitThreeNtQuantitativeApplies (_call: Call, context: RuleEvalContext):
    AppliesWhenResult {
  const opening = getOpenerOpeningBid(context);
  const response = getResponderCall(context.dealer, context.auction);
  const isSuitThreeNt = opening !== null && opening.level === 1 && opening.strain !== 'NT' &&
    response === '3NT';
  const hcp = context.handFacts.hcp;
  const success = isSuitThreeNt && hcp >= 18 && hcp <= 21;
  return { success, telemetryLines: [
    `${success ? 'APPLIES' : 'FAIL'}: quantitative 4NT after a one-level suit opening and ` +
    `natural 3NT response requires an 18-21 HCP opener.`,
  ] };
}

/// A Jacoby 2NT four-level side-suit rebid shows a good five-card-or-longer suit.  This chosen
/// executable threshold is at least two of A/K/Q/J in the bid suit.
export function openerJacobyGoodSideSuitApplies (call: Call, context: RuleEvalContext):
    AppliesWhenResult {
  const opening = getOpenerOpeningBid(context);
  const response = getResponderCall(context.dealer, context.auction);
  const candidate = parseSuitBid(call);
  if (opening === null || (opening.strain !== 'H' && opening.strain !== 'S') ||
      response !== '2NT' || candidate === null || candidate.strain === 'NT' ||
      candidate.strain === opening.strain) {
    return { success: false, telemetryLines: ['FAIL: not a Jacoby 2NT side-suit rebid.'] };
  }
  const suit = candidate.strain as Suit;
  const cards = getCardsForSuit(context.hand, suit);
  const honorCount = cards.filter((card) =>
    card.rank === 'A' || card.rank === 'K' || card.rank === 'Q' || card.rank === 'J').length;
  const success = cards.length >= 5 && honorCount >= 2;
  return { success, telemetryLines: [
    `${success ? 'PASS' : 'FAIL'}: ${suit} has ${cards.length} cards and ${honorCount} of A/K/Q/J; ` +
    'Jacoby side-suit rebid needs 5+ cards and at least two top-four honors.',
  ] };
}

///
//// Opener Rebids After a Strong Two-Club Opening
///

/// refineStrongTwoCUnbalancedSuitRebid chooses opener's longest five-card-or-longer suit after
/// 2C-2D.  Balanced hands use the separate notrump rebids.  Equal-length suits use the
/// higher-ranking suit, as in the chosen treatment.
export function refineStrongTwoCUnbalancedSuitRebid (calls: Call[], context: RuleEvalContext):
    CallRefinementResult {
  const opening = getOpenerOpeningBid(context);
  const response = getResponderBid(context);
  if (opening === null || response === null || opening.level !== 2 || opening.strain !== 'C' ||
      response.level !== 2 || response.strain !== 'D' || context.handFacts.balanced) {
    return {
      calls: [],
      telemetryLines: ['A natural strong-2C suit rebid needs 2C-2D and an unbalanced opener.'],
    };
  }

  const candidates: { call: Call; suit: Suit; length: number }[] = [];
  for (const call of calls) {
    const candidate = parseSuitBid(call);
    if (candidate === null || candidate.strain === 'NT' ||
        cheapestBidInStrainAfter(response, candidate.strain) !== call) {
      continue;
    }
    const suit = candidate.strain as Suit;
    const length = context.handFacts.lengths[suit];
    if (length >= 5) {
      candidates.push({ call, suit, length });
    }
  }
  if (candidates.length === 0) {
    return { calls: [], telemetryLines: ['No five-card-or-longer natural suit is available.'] };
  }

  const longest = Math.max(...candidates.map((candidate) => candidate.length));
  const best = candidates.filter((candidate) => candidate.length === longest);
  best.sort((left, right) => STRAIN_ORDER.indexOf(right.suit) - STRAIN_ORDER.indexOf(left.suit));
  return {
    calls: [best[0]!.call],
    telemetryLines: [
      `Show opener's longest 5+ suit; equal lengths use the higher-ranking suit: ${best[0]!.call}.`,
    ],
  };
}

/// The positive strong-2C responses are 2H/2S, 3C/3D, or balanced 2NT. A response of
/// 2D is waiting and retains its separate rebid treatment. Interference is excluded by the rules.
function getStrongTwoCPositiveResponse (context: RuleEvalContext): ParsedSuitBid | null {
  const opening = getOpenerOpeningBid(context);
  const response = getResponderBid(context);
  if (opening?.level !== 2 || opening.strain !== 'C' || response === null) return null;
  if ((response.level === 2 && (response.strain === 'H' || response.strain === 'S' ||
       response.strain === 'NT')) ||
      (response.level === 3 && (response.strain === 'C' || response.strain === 'D'))) {
    return response;
  }
  return null;
}

/// Raise a positive major economically; responder has promised a five-card suit and game values.
export function strongTwoCPositiveMajorSupportApplies (_call: Call, context: RuleEvalContext):
    AppliesWhenResult {
  const response = getStrongTwoCPositiveResponse(context);
  const success = response !== null && response.level === 2 &&
    (response.strain === 'H' || response.strain === 'S') &&
    context.handFacts.lengths[response.strain] >= 3 && context.handFacts.hcp >= 22;
  return { success, telemetryLines: [success
    ? 'Positive five-card major plus three-card opener support establishes a game-forcing fit.'
    : 'No positive major with at least three-card opener support.'] };
}

/// With a positive minor, a four-card fit and unbalanced shape justify selected minor support.
/// Avoid automatically raising a balanced hand past 3NT or hiding opener's own five-card suit.
export function strongTwoCPositiveMinorSupportApplies (_call: Call, context: RuleEvalContext):
    AppliesWhenResult {
  const response = getStrongTwoCPositiveResponse(context);
  const otherLongSuit = response !== null && SUITS.some((suit) =>
    suit !== response.strain && context.handFacts.lengths[suit] >= 5);
  const success = response !== null && response.level === 3 &&
    (response.strain === 'C' || response.strain === 'D') &&
    !context.handFacts.balanced && !otherLongSuit &&
    context.handFacts.lengths[response.strain] >= 4 && context.handFacts.hcp >= 22;
  return { success, telemetryLines: [success
    ? 'An unbalanced opener with four-card minor support and no longer side suit can raise.'
    : 'Minor support needs four cards, unbalanced shape, and no five-card side suit.'] };
}

/// Natural 5+ suit descriptions remain available after positive responses, but only through the
/// three level. Do not invent a four-level new suit which bypasses the convenient 3NT contract.
/// With a major fit, support responder instead of obscuring the agreed trump suit.
export function refineStrongTwoCPositiveNewSuitRebid (calls: Call[], context: RuleEvalContext):
    CallRefinementResult {
  const response = getStrongTwoCPositiveResponse(context);
  if (response === null || context.handFacts.balanced ||
      ((response.strain === 'H' || response.strain === 'S') &&
       context.handFacts.lengths[response.strain] >= 3)) {
    return { calls: [], telemetryLines: ['No unbalanced positive-response new-suit description.'] };
  }
  const available = calls.flatMap((call) => {
    const bid = parseSuitBid(call);
    if (bid === null || bid.strain === 'NT' || bid.strain === response.strain ||
        bid.level > 3 || cheapestBidInStrainAfter(response, bid.strain) !== call) return [];
    const suit = bid.strain as Suit;
    const length = context.handFacts.lengths[suit];
    return length >= 5 ? [{ call, suit, length }] : [];
  });
  if (available.length === 0) {
    return { calls: [], telemetryLines: ['No natural five-card suit can be shown through 3S.'] };
  }
  const longest = Math.max(...available.map((item) => item.length));
  const choices = available.filter((item) => item.length === longest);
  choices.sort((left, right) => STRAIN_ORDER.indexOf(right.suit) - STRAIN_ORDER.indexOf(left.suit));
  return { calls: [choices[0]!.call], telemetryLines: [
    `Show the longest available five-card suit economically: ${choices[0]!.call}.`,
  ] };
}

/// Only a minimum-range balanced strong opener makes a natural NT description after a positive
/// response. Extra balanced strength is genuine slam judgment, not an automatic higher NT bid.
export function strongTwoCPositiveBalancedNtApplies (call: Call, context: RuleEvalContext):
    AppliesWhenResult {
  const response = getStrongTwoCPositiveResponse(context);
  const major = response?.strain === 'H' || response?.strain === 'S';
  const majorFit = major && context.handFacts.lengths[response.strain as Suit] >= 3;
  const success = response !== null && context.handFacts.balanced &&
    context.handFacts.hcp >= 22 && context.handFacts.hcp <= 24 && !majorFit &&
    (major ? call === '2NT' : call === '3NT');
  return { success, telemetryLines: [success
    ? 'Minimum 22-24 balanced strong opening with no preferred positive-major fit.'
    : 'Not the economical 22-24 balanced NT description for this positive response.'] };
}

/// With a game-forcing positive response, a hand outside these chosen natural descriptions
/// needs judgment about strain, controls, and slam prospects; the boundary is suppressed when
/// one of the modeled concrete rebids is available.
export function strongTwoCPositiveScopeBoundaryApplies (context: RuleEvalContext):
    AppliesWhenResult {
  const success = getStrongTwoCPositiveResponse(context) !== null;
  return { success, telemetryLines: [success
    ? 'Positive strong-2C response: describe naturally where modeled, otherwise assess slam and strain.'
    : 'Not a positive strong-2C response.'] };
}

///
//// Opener Rebids After Weak Preemptive Openings
///

/// refineWeakTwoFeatureRebid shows opener's cheapest side ace or king after responder's artificial
/// 2NT inquiry.  The bid is a feature message, not a promise of natural length in the side suit.
export function refineWeakTwoFeatureRebid (calls: Call[], context: RuleEvalContext):
    CallRefinementResult {
  const opening = getWeakTwoOpeningBid(context);
  const response = getResponderBid(context);
  if (opening === null || response === null || response.level !== 2 || response.strain !== 'NT') {
    return { calls: [], telemetryLines: ['No weak-two 2NT inquiry is available for a feature rebid.'] };
  }

  const features = calls.filter((call) => {
    const candidate = parseSuitBid(call);
    if (candidate === null || candidate.strain === 'NT' || candidate.strain === opening.strain ||
        cheapestBidInStrainAfter(response, candidate.strain) !== call) {
      return false;
    }
    const suit = candidate.strain as Suit;
    return getCardsForSuit(context.hand, suit).some((card) => card.rank === 'A' || card.rank === 'K');
  });
  features.sort((left, right) => compareSuitBids(parseSuitBid(left)!, parseSuitBid(right)!));
  const feature = features[0];
  return {
    calls: feature === undefined ? [] : [feature],
    telemetryLines: [
      feature === undefined
        ? 'No side ace or king is available to show after the 2NT inquiry.'
        : `Show the cheapest side ace-or-king feature: ${feature}.`,
    ],
  };
}

/// weakTwoRepeatAfterInquiryApplies rebids the opening suit after 2NT with a 5-7 minimum, or as the
/// conservative fallback for an 8-10 maximum with neither a side A/K feature nor a solid suit.
export function weakTwoRepeatAfterInquiryApplies (_call: Call, context: RuleEvalContext):
    AppliesWhenResult {
  const opening = getWeakTwoOpeningBid(context);
  if (opening === null || opening.strain === 'NT') {
    return { success: false, telemetryLines: ['FAIL: Weak-two repeat needs a weak-two opening.'] };
  }
  const suit = opening.strain as Suit;
  const minimum = context.handFacts.hcp >= 5 && context.handFacts.hcp <= 7;
  const maximum = context.handFacts.hcp >= 8 && context.handFacts.hcp <= 10;
  const solid = hasSolidWeakTwoSuit(context.hand, suit);
  const hasFeature = hasSideAceOrKing(context, suit);
  const maximumFallback = maximum && ! solid && ! hasFeature;
  const success = minimum || maximumFallback;
  return { success, telemetryLines: [
    `${success ? 'APPLIES' : 'FAIL'}: repeat the preempt with a 5-7 minimum or an 8-10 ` +
      `maximum lacking both a side A/K feature and the solid-suit 3NT message; HCP=` +
      `${context.handFacts.hcp}, side feature=${hasFeature}, solid=${solid}.`,
  ] };
}

/// weakTwoFeatureAfterInquiryApplies uses an 8-10 maximum with a side ace or king after 2NT.
export function weakTwoFeatureAfterInquiryApplies (_call: Call, context: RuleEvalContext):
    AppliesWhenResult {
  const opening = getWeakTwoOpeningBid(context);
  if (opening === null || opening.strain === 'NT') {
    return { success: false, telemetryLines: ['FAIL: Feature rebid needs a weak-two opening.'] };
  }
  const suit = opening.strain as Suit;
  const maximum = context.handFacts.hcp >= 8 && context.handFacts.hcp <= 10;
  const solid = hasSolidWeakTwoSuit(context.hand, suit);
  const hasFeature = hasSideAceOrKing(context, suit);
  const success = maximum && ! solid && hasFeature;
  return { success, telemetryLines: [
    `${success ? 'APPLIES' : 'FAIL'}: feature rebid needs 8-10 HCP, a side ace or king, and ` +
      `no solid-suit 3NT message; HCP=${context.handFacts.hcp}, side feature=${hasFeature}, ` +
      `solid=${solid}.`,
  ] };
}

/// weakTwoSolidThreeNtApplies uses AKQJ in the six-card preempt suit as the executable
/// approximation for the chosen special solid-suit 3NT rebid after the forcing 2NT inquiry.
export function weakTwoSolidThreeNtApplies (_call: Call, context: RuleEvalContext):
    AppliesWhenResult {
  const opening = getWeakTwoOpeningBid(context);
  if (opening === null || opening.strain === 'NT') {
    return { success: false, telemetryLines: ['FAIL: Solid-suit 3NT needs a weak-two opening.'] };
  }
  const suit = opening.strain as Suit;
  const solid = hasSolidWeakTwoSuit(context.hand, suit);
  const success = context.handFacts.hcp >= 8 && context.handFacts.hcp <= 10 && solid;
  return { success, telemetryLines: [
    `${success ? 'APPLIES' : 'FAIL'}: 3NT after the inquiry needs an 8-10 HCP maximum and ` +
      `AKQJ in the six-card ${suit} suit; HCP=${context.handFacts.hcp}, solid=${solid}.`,
  ] };
}

/// openerPreemptRaisePassApplies accepts responder's nonforcing raise of the original preempt
/// suit, after both opponents Pass.  Only the selected three-/four-level raises are passable:
/// neither a 2NT inquiry nor a forcing new suit qualifies.
export function openerPreemptRaisePassApplies (_call: Call, context: RuleEvalContext):
    AppliesWhenResult {
  const opening = getOpeningCallInfo(context.dealer, context.auction);
  const openingBid = opening === null ? null : parseSuitBid(opening.call);
  const response = getResponderCall(context.dealer, context.auction);
  const responseBid = response === null ? null : parseSuitBid(response);
  const weakTwo = opening !== null && ['2D', '2H', '2S'].includes(opening.call);
  const threeLevelPreempt = opening !== null && ['3C', '3D', '3H', '3S'].includes(opening.call);
  const supportedRaise = responseBid !== null && openingBid !== null &&
    responseBid.strain === openingBid.strain &&
    ((weakTwo && (responseBid.level === 3 || responseBid.level === 4)) ||
     (threeLevelPreempt && responseBid.level === 4));
  const success = opening !== null && context.auction.length === opening.index + 4 &&
    context.auction[opening.index + 1] === 'Pass' &&
    context.auction[opening.index + 3] === 'Pass' && supportedRaise;
  return { success, telemetryLines: [
    `${success ? 'APPLIES' : 'FAIL'}: Pass after responder's nonforcing raise of the ` +
      'original weak-two or three-level preempt suit, with both opponents passing.',
  ] };
}

/// openerPreemptNewSuitRaiseApplies raises responder's forcing new suit with 3+ support.
export function openerPreemptNewSuitRaiseApplies (_call: Call, context: RuleEvalContext):
    AppliesWhenResult {
  const response = getResponderBid(context);
  const forcingResponse = preemptNewSuitResponseIsForcing(context);
  const support = response === null || response.strain === 'NT'
    ? 0 : context.handFacts.lengths[response.strain as Suit];
  const success = forcingResponse && support >= 3;
  return { success, telemetryLines: [
    `${success ? 'APPLIES' : 'FAIL'}: raise responder's forcing new suit with 3+ support; ` +
      `opener has ${support}.`,
  ] };
}

/// openerPreemptNewSuitRepeatApplies returns to opener's preempt suit when a forcing new-suit
/// response does not find three-card support.
export function openerPreemptNewSuitRepeatApplies (_call: Call, context: RuleEvalContext):
    AppliesWhenResult {
  const response = getResponderBid(context);
  const forcingResponse = preemptNewSuitResponseIsForcing(context);
  const support = response === null || response.strain === 'NT'
    ? 0 : context.handFacts.lengths[response.strain as Suit];
  const success = forcingResponse && support <= 2;
  return { success, telemetryLines: [
    `${success ? 'APPLIES' : 'FAIL'}: with fewer than three cards in responder's forcing new suit, ` +
      `return to opener's preempt suit; support=${support}.`,
  ] };
}

function hasSideAceOrKing (context: RuleEvalContext, openingSuit: Suit): boolean {
  return SUITS.some((suit) => suit !== openingSuit &&
    getCardsForSuit(context.hand, suit).some((card) => card.rank === 'A' || card.rank === 'K'));
}

/// preemptNewSuitResponseIsForcing recognizes only the natural new-suit responses modeled in this
/// file: through the three level after a weak two, or below game in the new suit after a three-level
/// preempt.  This keeps opener's forcing rebids from leaking into unrelated auctions.
function preemptNewSuitResponseIsForcing (context: RuleEvalContext): boolean {
  const opening = getOpenerOpeningBid(context);
  const responseCall = getResponderCall(context.dealer, context.auction);
  const response = responseCall === null ? null : parseSuitBid(responseCall);
  if (opening === null || response === null || response.strain === 'NT' ||
      response.strain === opening.strain ||
      cheapestBidInStrainAfter(opening, response.strain) !== responseCall) {
    return false;
  }
  if (opening.level === 2 && opening.strain !== 'C' && opening.strain !== 'NT') {
    return response.level <= 3;
  }
  if (opening.level === 3 && opening.strain !== 'NT') {
    const gameLevel = response.strain === 'H' || response.strain === 'S' ? 4 : 5;
    return response.level < gameLevel;
  }
  return false;
}
