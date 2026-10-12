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
