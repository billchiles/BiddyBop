/// Natural responder-rebid refinements and selected suit-quality checks.
import type { AppliesWhenResult, Call, CallRefinementResult, RuleEvalContext, BiddingSystem } from './bidding-types';
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

//// Responder after a natural 1NT response to a major opening

/// A 1NT response can be forcing, nonforcing, or a three-card limit-raise route.
/// Classify opener's ordinary two-level rebid without claiming a manufactured minor
/// necessarily contains four cards. Reverses, jump rebids, and strong 2NT are separate.
export function getResponderAfterMajorOneNt (context: RuleEvalContext):
    { opening: Suit; rebid: Suit; kind: 'repeat' | 'second' } | null {
  if (context.stage !== 'responderRebid') return null;
  const openingInfo = getOpeningCallInfo(context.dealer, context.auction);
  if (openingInfo === null) return null;
  const partnership = getOpeningPartnershipCalls(context.dealer, context.auction, openingInfo.seat);
  if (partnership.length !== 3 || !/^1[HS]$/.test(partnership[0] ?? '') ||
      partnership[1] !== '1NT' || !/^2[CDHS]$/.test(partnership[2] ?? '')) return null;
  const opening = partnership[0][1] as Suit;
  const rebid = partnership[2][1] as Suit;
  if (rebid !== opening && cheapestBidInStrainAfter({ level: 1, strain: 'NT' }, rebid) !==
      partnership[2]) return null;
  // A 2S rebid over 1H-1NT is a strong reverse, not an economical second suit.
  if (rebid !== opening && rebid === 'S' && opening === 'H') return null;
  return { opening, rebid, kind: rebid === opening ? 'repeat' : 'second' };
}

/// Select the suit and level from opener's real auction, not a hardcoded major.
export function refineResponderAfterMajorOneNt (calls: Call[], context: RuleEvalContext,
    choice: 'twoMajor' | 'threeMajor' | 'ownMinor'): CallRefinementResult {
  const info = getResponderAfterMajorOneNt(context);
  if (info === null) return { calls: [], telemetryLines: ['Not a natural 1NT-major continuation.'] };
  if (choice === 'ownMinor') {
    const wanted = (['C', 'D'] as Suit[]).map((suit) =>
      cheapestBidInStrainAfter({ level: 2, strain: info.rebid }, suit));
    return { calls: calls.filter((call) => wanted.some((bid) => bid === call)),
      telemetryLines: ['Show a long unbid minor at its cheapest legal level.'] };
  }
  const wanted = `${choice === 'twoMajor' ? 2 : 3}${info.opening}`;
  return { calls: calls.filter((call) => call === wanted),
    telemetryLines: [`Show ${wanted}, referring to opener's original major.`] };
}

/// After opener has fulfilled a forcing 1NT response, these natural second calls
/// can be nonforcing. Requirements use the actual prior promises, including the
/// possibility of a three-card minor fallback under a forcing-1NT agreement.
export function responderAfterMajorOneNtApplies (call: Call, context: RuleEvalContext,
    system: BiddingSystem, decision: 'passMajor' | 'inviteMajor' | 'preferMajor' |
    'passSecond' | 'longMinor' | 'delayedLimitRaise' | 'inviteNt'): AppliesWhenResult {
  const info = getResponderAfterMajorOneNt(context);
  if (info === null) return { success: false, telemetryLines: ['Not a major-1NT continuation.'] };
  const facts = context.handFacts;
  const majorLength = facts.lengths[info.opening];
  const suitLength = facts.lengths[info.rebid];
  const minimum = facts.hcp >= 6 && facts.hcp <= 10;
  let success = false;
  switch (decision) {
    case 'passMajor':
      success = info.kind === 'repeat' && minimum && majorLength >= 2;
      break;
    case 'inviteMajor':
      success = info.kind === 'repeat' && majorLength >= 2 &&
        facts.totalPointsWShortage >= 11 && facts.totalPointsWShortage <= 12;
      break;
    case 'preferMajor':
      success = info.kind === 'second' && minimum && majorLength >= 2;
      break;
    case 'passSecond':
      success = info.kind === 'second' && minimum &&
        suitLength >= (info.rebid === 'H' || system.majorOneNtResponse === 'nonForcing' ? 4 : 5);
      break;
    case 'longMinor': {
      const suit = call[call.length - 1] as Suit;
      success = info.kind === 'second' && minimum &&
        (suit === 'C' || suit === 'D') && suit !== info.rebid &&
        facts.lengths[suit] >= 6;
      break;
    }
    case 'delayedLimitRaise':
      success = info.kind === 'second' && majorLength === 3 &&
        (info.opening !== 'H' || facts.lengths.S <= 3) &&
        facts.totalPointsWShortage >= 11 && facts.totalPointsWShortage <= 12;
      break;
    case 'inviteNt':
      success = info.kind === 'second' && facts.balanced && facts.hcp >= 10 &&
        facts.hcp <= 12 && majorLength <= 2;
      break;
  }
  return { success, telemetryLines: [
    `${success ? 'PASS' : 'FAIL'}: ${decision} after ${info.kind} of ${info.rebid}; ` +
    `HCP ${facts.hcp}, major length ${majorLength}, second length ${suitLength}, ` +
    `forcing 1NT ${system.majorOneNtResponse === 'forcing'}.`,
  ] };
}

//// Responder after a natural 1NT response to a minor opening

/// The response denied a four-card major and was nonforcing. Distinguish the natural
/// minimum descriptions and invitations from reverse/jump-shift forcing obligations.
export function getResponderAfterMinorOneNt (context: RuleEvalContext):
    { opening: 'C' | 'D'; kind: 'repeat' | 'second' | 'jumpRepeat' | 'ntInvite' |
                           'gameNt' | 'gameMinor' } | null {
  if (context.stage !== 'responderRebid') return null;
  const openingInfo = getOpeningCallInfo(context.dealer, context.auction);
  if (openingInfo === null) return null;
  const bids = getOpeningPartnershipCalls(context.dealer, context.auction, openingInfo.seat);
  if (bids.length !== 3 || (bids[0] !== '1C' && bids[0] !== '1D') ||
      bids[1] !== '1NT') return null;
  const opening = bids[0][1] as 'C' | 'D';
  const rebid = bids[2];
  const kind = rebid === `2${opening}` ? 'repeat' :
    opening === 'D' && rebid === '2C' ? 'second' :
    rebid === `3${opening}` ? 'jumpRepeat' :
    rebid === '2NT' ? 'ntInvite' :
    rebid === '3NT' ? 'gameNt' :
    rebid === `5${opening}` ? 'gameMinor' : null;
  return kind === null ? null : { opening, kind };
}

/// Minimum suit selections and a natural 2NT invitation answer use the actual opening
/// minor and responder's balanced 6-10 HCP promise. Strong and forcing rebids are excluded.
export function responderAfterMinorOneNtApplies (_call: Call, context: RuleEvalContext,
    choice: 'passRepeat' | 'passSecond' | 'preferOpening' | 'decline2Nt' |
            'accept2Nt' | 'declineJump' | 'passGame'): AppliesWhenResult {
  const info = getResponderAfterMinorOneNt(context);
  if (info === null) return { success: false, telemetryLines: ['Not a natural minor-1NT continuation.'] };
  const f = context.handFacts;
  let success = false;
  switch (choice) {
    case 'passRepeat': success = info.kind === 'repeat' && f.hcp >= 6 && f.hcp <= 10 &&
      f.lengths[info.opening] >= 2; break;
    case 'passSecond': success = info.kind === 'second' && f.hcp >= 6 && f.hcp <= 10 &&
      f.lengths.C >= 4; break;
    case 'preferOpening': success = info.kind === 'second' && f.hcp >= 6 && f.hcp <= 10 &&
      f.lengths.D >= 3 && f.lengths.C <= 3; break;
    case 'decline2Nt': success = info.kind === 'ntInvite' && f.balanced && f.hcp === 6; break;
    case 'accept2Nt': success = info.kind === 'ntInvite' && f.balanced && f.hcp >= 7 &&
      f.hcp <= 10; break;
    case 'declineJump': success = info.kind === 'jumpRepeat' && f.hcp >= 6 &&
      f.hcp <= 7 && f.lengths[info.opening] >= 2; break;
    case 'passGame': success = (info.kind === 'gameNt' || info.kind === 'gameMinor') &&
      f.hcp >= 6 && f.hcp <= 10; break;
  }
  return { success, telemetryLines: [
    `${success ? 'PASS' : 'FAIL'}: natural minor-1NT ${choice}; opener ${info.opening}, ` +
    `rebid ${info.kind}, responder ${f.hcp} HCP.`,
  ] };
}
