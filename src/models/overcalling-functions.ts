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
