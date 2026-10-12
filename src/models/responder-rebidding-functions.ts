/// Natural responder-rebid refinements and selected suit-quality checks.
import type { AppliesWhenResult, Call, CallRefinementResult, RuleEvalContext } from './bidding-types';
import { hasPreemptSuitQuality } from './cards';
import { cheapestBidInStrainAfter, getOpeningCallInfo, getOpeningPartnershipCalls,
         getResponderCall, isContractBid, getStrainFromSuitBid, openerRebidIsReverse, parseSuitBid } from './auction';
import { hasBasicSuitStopper } from './common-rule-helpers';
import type { Suit } from './cards';

/// Repeat only the natural suit responder actually showed at the one level.
export function refineResponderOriginalOneLevelSuit (calls: Call[], context: RuleEvalContext):
    CallRefinementResult {
  const response = getResponderCall(context.dealer, context.auction);
  const suit = response !== null && /^1[CDHS]$/.test(response) ? response[1] : null;
  return {
    calls: suit === null ? [] : calls.filter((call) => call.endsWith(suit)),
    telemetryLines: [suit === null ? 'No original one-level suit response.' :
      `Only the original ${suit} suit may be repeated naturally.`],
  };
}

/// Seven spades require an independently playable suit for game without promised support.
export function responderSevenSpadeGameApplies (_call: Call, context: RuleEvalContext):
    AppliesWhenResult {
  const length = context.handFacts.lengths.S;
  const points = context.handFacts.totalPointsWLength;
  const quality = hasPreemptSuitQuality(context.hand, 'S');
  const success = length >= 7 && points >= 13 && points <= 16 && quality;
  return { success, telemetryLines: [
    `${success ? 'PASS' : 'FAIL'}: 4S requires 7+ spades, 13-16 length-adjusted points, ` +
    `and concentrated spade honors; length ${length}, points ${points}, quality ${quality}.`,
  ] };
}

/// Minimum responder prefers opener's six-card suit when their own suit is not long enough
/// to rebid.  A minor preference requires two cards; one heart can be acceptable opposite
/// a known six-card major in this selected natural treatment.
export function responderMinimumRepeatedSuitPassApplies (_call: Call, context: RuleEvalContext):
    AppliesWhenResult {
  const opening = getOpeningCallInfo(context.dealer, context.auction)?.call;
  const response = getResponderCall(context.dealer, context.auction);
  const openerSuit = opening !== undefined && isContractBid(opening)
    ? getStrainFromSuitBid(opening) : 'NT';
  const responseSuit = response !== null && isContractBid(response)
    ? getStrainFromSuitBid(response) : 'NT';
  const lengths = context.handFacts.lengths;
  const fitMinimum = openerSuit === 'H' || openerSuit === 'S' ? 1 : 2;
  const success = openerSuit !== 'NT' && responseSuit !== 'NT' &&
    lengths[openerSuit] >= fitMinimum && lengths[responseSuit] >= 4 &&
    lengths[responseSuit] <= 5 && context.handFacts.totalPointsWLength >= 6 &&
    context.handFacts.totalPointsWLength <= 10;
  return { success, telemetryLines: [
    `${success ? 'PASS' : 'FAIL'}: minimum preference for opener's repeated suit; ` +
    `opener suit ${openerSuit}, response suit ${responseSuit}, ` +
    `length points ${context.handFacts.totalPointsWLength}.`,
  ] };
}

/// Notrump game after a minimum repeat is most reliable with balanced values and without
/// an established eight-card major fit.  A long minor remains compatible with 3NT.
export function responderRepeatedSuitThreeNtApplies (_call: Call, context: RuleEvalContext):
    AppliesWhenResult {
  const opening = getOpeningCallInfo(context.dealer, context.auction)?.call;
  const response = getResponderCall(context.dealer, context.auction);
  const openerSuit = opening !== undefined && isContractBid(opening)
    ? getStrainFromSuitBid(opening) : 'NT';
  const responseSuit = response !== null && isContractBid(response)
    ? getStrainFromSuitBid(response) : 'NT';
  const facts = context.handFacts;
  const success = openerSuit !== 'NT' && responseSuit !== 'NT' && facts.balanced &&
    facts.hcp >= 13 && facts.hcp <= 16 && facts.lengths[responseSuit] >= 4 &&
    facts.lengths[responseSuit] <= 5 &&
    (openerSuit === 'C' || openerSuit === 'D' || facts.lengths[openerSuit] <= 2);
  return { success, telemetryLines: [
    `${success ? 'PASS' : 'FAIL'}: balanced 13-16 HCP notrump game after a ` +
    `minimum repeat; opening ${openerSuit}, response ${responseSuit}.`,
  ] };
}

//// Responder after opener's strong balanced 2NT rebid

/// After a natural one-level major response, a five-card suit should be described to let
/// opener choose between three notrump and major game. Without that question, a balanced
/// responder can place the game directly in notrump.
export function responderStrongTwoNtThreeNtApplies (_call: Call, context: RuleEvalContext):
    AppliesWhenResult {
  const response = getResponderCall(context.dealer, context.auction);
  const suit = response !== null && /^1[HS]$/.test(response) ? response[1] as Suit : null;
  const facts = context.handFacts;
  const success = facts.balanced && facts.hcp >= 7 && facts.hcp <= 12 &&
    (suit === null || facts.lengths[suit] <= 4);
  return { success, telemetryLines: [
    `${success ? 'PASS' : 'FAIL'}: 3NT opposite 18-19 balanced HCP requires 7-12 HCP ` +
    `and suitable balance without an unresolved five-card responder major; ` +
    `response ${response}, HCP ${facts.hcp}.`,
  ] };
}

//// Natural responder decisions after opener shows an economical second suit

/// This identifies the *meaning* of the first three partnership bids, not a printed example
/// auction. Reverses, jumps, one-notrump responses and two-level forcing responses need their
/// own treatments; an economical second suit can show 12-18 points and only four cards in it.
export function getResponderEconomicalSecondSuit (context: RuleEvalContext):
    { opening: Suit; response: Suit; second: Suit; secondLevel: number } | null {
  if (context.stage !== 'responderRebid') return null;
  const openingInfo = getOpeningCallInfo(context.dealer, context.auction);
  if (openingInfo === null) return null;
  const partnership = getOpeningPartnershipCalls(context.dealer, context.auction, openingInfo.seat);
  if (partnership.length !== 3 || !/^1[CDHS]$/.test(partnership[0] ?? '') ||
      !/^1[CDHS]$/.test(partnership[1] ?? '')) return null;
  const opening = parseSuitBid(partnership[0]);
  const response = parseSuitBid(partnership[1]);
  const rebid = parseSuitBid(partnership[2]);
  if (opening === null || response === null || rebid === null || rebid.strain === 'NT' ||
      response.strain === opening.strain || rebid.strain === opening.strain ||
      rebid.strain === response.strain ||
      cheapestBidInStrainAfter(response, rebid.strain) !== partnership[2] ||
      openerRebidIsReverse(opening, response, rebid)) return null;
  return { opening: opening.strain as Suit, response: response.strain as Suit,
           second: rebid.strain as Suit, secondLevel: rebid.level };
}

/// Keep the natural suit and level implied by the preceding auction. In particular, prefer
/// opener's *first* suit only with a credible fit; a convenient club opening may be three cards.
export function refineResponderEconomicalSuit (calls: Call[], context: RuleEvalContext,
    role: 'opening' | 'response' | 'second', level: 2 | 3 | 4): CallRefinementResult {
  const info = getResponderEconomicalSecondSuit(context);
  if (info === null) return { calls: [], telemetryLines: ['Not an economical second-suit auction.'] };
  const wanted = `${level}${info[role]}`;
  return { calls: calls.filter((call) => call === wanted),
           telemetryLines: [`Keep ${wanted}, the natural ${role}-suit continuation.`] };
}

/// Fit, hand range and strain choices use information opener has actually promised. An
/// opening major shows five cards, but a minor may be only three after a one-level second suit.
export function responderEconomicalDecisionApplies (_call: Call, context: RuleEvalContext,
    decision: 'passSecond' | 'preferOpening' | 'repeatResponse' | 'inviteNt' | 'gameNt' |
              'inviteOpening' | 'inviteSecond' | 'majorSecondGame' | 'majorSecondPartscore' | 'majorSecondInvite'): AppliesWhenResult {
  const info = getResponderEconomicalSecondSuit(context);
  if (info === null) return { success: false, telemetryLines: ['Not an economical second-suit rebid.'] };
  const f = context.handFacts;
  const openingLength = f.lengths[info.opening];
  const responseLength = f.lengths[info.response];
  const secondLength = f.lengths[info.second];
  const lengthPoints = f.totalPointsWLength;
  const fitPoints = f.totalPointsWShortage;
  const low = lengthPoints >= 6 && lengthPoints <= 10;
  const invite = fitPoints >= 10 && fitPoints <= 12;
  const game = fitPoints >= 13 && fitPoints <= 16;
  const minorSecond = info.second === 'C' || info.second === 'D';
  const isDiscoveredMajor = info.second === 'S' && info.response === 'H' &&
    (info.opening === 'C' || info.opening === 'D') && info.secondLevel === 1;
  let success = false;
  switch (decision) {
    case 'passSecond': success = low && secondLength >= 4; break;
    case 'preferOpening': success = low &&
      openingLength >= (info.opening === 'H' || info.opening === 'S' ? 2 :
                       info.secondLevel === 1 ? 5 : 4); break;
    case 'repeatResponse': success = low && responseLength >= 6; break;
    case 'inviteNt': success = f.balanced && f.hcp >= 10 && f.hcp <= 12; break;
    case 'gameNt': {
      const unbid = (['C', 'D', 'H', 'S'] as Suit[]).find((suit) =>
        suit !== info.opening && suit !== info.response && suit !== info.second);
      success = f.balanced && f.hcp >= 13 && f.hcp <= 16 && unbid !== undefined &&
        hasBasicSuitStopper(context, unbid);
      break;
    }
    case 'inviteOpening': success = invite && info.secondLevel === 2 &&
      openingLength >= (info.opening === 'H' || info.opening === 'S' ? 3 : 4); break;
    case 'inviteSecond': success = invite && minorSecond && secondLength >= 4; break;
    case 'majorSecondPartscore': success = low && isDiscoveredMajor && secondLength >= 4; break;
    case 'majorSecondInvite': success = invite && isDiscoveredMajor && secondLength >= 4; break;
    case 'majorSecondGame': success = game && isDiscoveredMajor && secondLength >= 4; break;
  }
  return { success, telemetryLines: [
    `${success ? 'PASS' : 'FAIL'}: economical second suit ${info.second}, ${decision}; ` +
    `opening ${info.opening}, response ${info.response}, lengths ${openingLength}/${responseLength}/${secondLength}, ` +
    `length points ${lengthPoints}, support points ${fitPoints}, HCP ${f.hcp}.`,
  ] };
}

//// Responder after opener's strong natural second suit

/// Classify the first three partnership bids by their established meanings. A reverse is a
/// cheapest forcing new suit; a strong jump shift jumps one level beyond an economical new suit.
/// Neither the printed suit combination nor the opponent's intervening Passes define the family.
export function getResponderStrongSecondSuit (context: RuleEvalContext):
    { kind: 'reverse' | 'jumpShift'; opening: Suit; response: Suit; second: Suit } | null {
  if (context.stage !== 'responderRebid') return null;
  const openingInfo = getOpeningCallInfo(context.dealer, context.auction);
  if (openingInfo === null) return null;
  const partnership = getOpeningPartnershipCalls(context.dealer, context.auction, openingInfo.seat);
  if (partnership.length !== 3 || !/^1[CDHS]$/.test(partnership[0] ?? '') ||
      !/^1[CDHS]$/.test(partnership[1] ?? '')) return null;
  const opening = parseSuitBid(partnership[0]);
  const response = parseSuitBid(partnership[1]);
  const rebid = parseSuitBid(partnership[2]);
  if (opening === null || response === null || rebid === null || rebid.strain === 'NT' ||
      opening.strain === response.strain || rebid.strain === opening.strain ||
      rebid.strain === response.strain) return null;
  const cheapest = cheapestBidInStrainAfter(response, rebid.strain);
  const cheapestParsed = cheapest === null ? null : parseSuitBid(cheapest);
  if (cheapestParsed === null) return null;
  const reverse = rebid.level === cheapestParsed.level &&
    openerRebidIsReverse(opening, response, rebid);
  const jumpShift = rebid.level === cheapestParsed.level + 1 &&
    ! openerRebidIsReverse(opening, response, cheapestParsed);
  if (!reverse && !jumpShift) return null;
  return { kind: reverse ? 'reverse' : 'jumpShift', opening: opening.strain as Suit,
           response: response.strain as Suit, second: rebid.strain as Suit };
}

/// Natural games can be chosen when their strain and existing force are both sufficiently clear.
/// A game-force does not automatically license 3NT without a stopper or major game without
/// a fit. Exceptional combined strength is left to slam-oriented judgment.
export function responderStrongSecondSuitGameApplies (call: Call, context: RuleEvalContext):
    AppliesWhenResult {
  const info = getResponderStrongSecondSuit(context);
  if (info === null) return { success: false, telemetryLines: ['Not a selected strong second-suit auction.'] };
  const f = context.handFacts;
  const lower = info.kind === 'reverse' ? 9 : 6;
  const upper = info.kind === 'reverse' ? 11 : 10;
  const points = f.totalPointsWShortage;
  let success = false;
  if (call === '3NT') {
    const unbid = (['C', 'D', 'H', 'S'] as Suit[]).find((suit) =>
      suit !== info.opening && suit !== info.response && suit !== info.second);
    success = f.balanced && f.hcp >= lower && f.hcp <= upper &&
      unbid !== undefined && hasBasicSuitStopper(context, unbid);
  } else {
    const major = call === '4H' ? 'H' : call === '4S' ? 'S' : null;
    const secondFit = major !== null && major === info.second && f.lengths[major] >= 4;
    const originalFit = info.kind === 'jumpShift' && major !== null &&
      major === info.opening && f.lengths[major] >= 3;
    success = points >= lower && points <= upper && (secondFit || originalFit);
  }
  return { success, telemetryLines: [
    `${success ? 'PASS' : 'FAIL'}: ${info.kind} after ${info.opening}/${info.response}/${info.second}; ` +
    `game ${call}, HCP ${f.hcp}, support points ${points}.`,
  ] };
}
