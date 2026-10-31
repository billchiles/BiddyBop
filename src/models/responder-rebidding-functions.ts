/// Natural responder-rebid refinements and selected suit-quality checks.
import type { AppliesWhenResult, Call, CallRefinementResult, RuleEvalContext, BiddingSystem, SuitBid } from './bidding-types';
import { oneNtResponseHcpShift } from './bidding-types';
import { hasPreemptSuitQuality } from './cards';
import { cheapestBidInStrainAfter, compareSuitBids, getOpeningCallInfo, getOpeningPartnershipCalls,
         getResponderCall, isCallAvailableInAuction, isContractBid, getStrainFromSuitBid, openerRebidIsReverse, parseSuitBid, responseJump,
         responderPreviouslyPassed } from './auction';
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

/// Minimum responder prefers opener's repeated suit when their own suit is not long enough
/// to rebid. A minor repeat can now be five cards in a forced awkward rebid, so require
/// three-card minor support for a guaranteed eight-card fit. A single card can still be
/// acceptable opposite a known six-card major in this selected natural treatment.
export function responderMinimumRepeatedSuitPassApplies (_call: Call, context: RuleEvalContext):
    AppliesWhenResult {
  const opening = getOpeningCallInfo(context.dealer, context.auction)?.call;
  const response = getResponderCall(context.dealer, context.auction);
  const openerSuit = opening !== undefined && isContractBid(opening)
    ? getStrainFromSuitBid(opening) : 'NT';
  const responseSuit = response !== null && isContractBid(response)
    ? getStrainFromSuitBid(response) : 'NT';
  const lengths = context.handFacts.lengths;
  const fitMinimum = openerSuit === 'H' || openerSuit === 'S' ? 1 : 3;
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
  ], callEvidence: { naturalResponderRebid: {
      family: 'economical', decision: decision, hcp: f.hcp,
      lengthPoints: f.totalPointsWLength,
      supportPoints: f.totalPointsWShortage,
      balanced: f.balanced,
      openingSuit: info.opening, responseSuit: info.response, rebidSuit: info.second,
      openingLength, responseLength, rebidLength: secondLength,
      success,
    } } };
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
  ], callEvidence: { naturalResponderRebid: {
    family: 'strongSecondSuit', decision: call === '3NT' ? 'gameNt' : 'majorGame',
    hcp: f.hcp, lengthPoints: f.totalPointsWLength, supportPoints: points,
    balanced: f.balanced, openingSuit: info.opening, responseSuit: info.response,
    rebidSuit: info.second, openingLength: f.lengths[info.opening],
    responseLength: f.lengths[info.response], rebidLength: f.lengths[info.second],
    forceKind: info.kind,
    missingStoppers: call === '3NT' ? (['C', 'D', 'H', 'S'] as Suit[])
      .filter((suit) => suit !== info.opening && suit !== info.response &&
        suit !== info.second && !hasBasicSuitStopper(context, suit)) : [],
    success,
  } } };
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

/// Stronger opener rebids after a major-opening 1NT response have different meanings
/// from an economical two-level suit rebid. Keep this classification separate so
/// ordinary signoffs and limit raises cannot leak into a reverse or jump shift.
export function getResponderAfterMajorOneNtStrong (context: RuleEvalContext):
    { opening: 'H' | 'S'; kind: 'reverse' | 'ntInvite' | 'jumpRepeat' | 'jumpShift' } | null {
  if (context.stage !== 'responderRebid') return null;
  const openingInfo = getOpeningCallInfo(context.dealer, context.auction);
  if (openingInfo === null) return null;
  const bids = getOpeningPartnershipCalls(context.dealer, context.auction, openingInfo.seat);
  if (bids.length !== 3 || (bids[0] !== '1H' && bids[0] !== '1S') ||
      bids[1] !== '1NT') return null;
  const opening = bids[0][1] as 'H' | 'S';
  const rebid = bids[2];
  const kind = opening === 'H' && rebid === '2S' ? 'reverse' :
    rebid === '2NT' ? 'ntInvite' :
    rebid === `3${opening}` ? 'jumpRepeat' :
    // Opener's maximum-strength jump shift is into a lower-ranking new suit.
    /^3[CDH]$/.test(rebid) && rebid[1] !== opening &&
      (opening === 'S' || rebid[1] === 'C' || rebid[1] === 'D') ? 'jumpShift' : null;
  return kind === null ? null : { opening, kind };
}

/// Name opener's major, not an unbid major, when an invitation is accepted in game.
export function refineResponderAfterMajorOneNtStrongGame (calls: Call[], context: RuleEvalContext,
    kind: 'ntInvite' | 'jumpRepeat'): CallRefinementResult {
  const info = getResponderAfterMajorOneNtStrong(context);
  const wanted = info?.kind === kind ? `4${info.opening}` : null;
  return { calls: calls.filter((call) => call === wanted),
    telemetryLines: [wanted === null ? 'Not this major-game invitation family.' :
      `Accept opener's invitation in ${wanted}.`] };
}

/// Simple choices opposite a natural 18-19 HCP 2NT invitation or a six-card
/// major jump rebid. With a known three-card major fit after 2NT, the concealed
/// 11-12-point limit raise can place 4M rather than insist on notrump.
export function responderAfterMajorOneNtStrongApplies (call: Call, context: RuleEvalContext,
    choice: 'declineNt' | 'acceptNt' | 'gameMajorAfterNt' |
            'declineJumpMajor' | 'acceptJumpMajor'): AppliesWhenResult {
  const info = getResponderAfterMajorOneNtStrong(context);
  if (info === null) return { success: false, telemetryLines: ['Not a selected strong major-1NT continuation.'] };
  const f = context.handFacts;
  const length = f.lengths[info.opening];
  let success = false;
  switch (choice) {
    case 'declineNt':
      success = info.kind === 'ntInvite' && f.balanced && f.hcp >= 6 && f.hcp <= 7 &&
        length <= 2;
      break;
    case 'acceptNt':
      success = info.kind === 'ntInvite' && f.balanced && f.hcp >= 8 && f.hcp <= 12 &&
        length <= 2;
      break;
    case 'gameMajorAfterNt':
      success = info.kind === 'ntInvite' && call === `4${info.opening}` &&
        length === 3 && f.totalPointsWShortage >= 11 && f.totalPointsWShortage <= 12;
      break;
    case 'declineJumpMajor':
      success = info.kind === 'jumpRepeat' && f.hcp >= 6 && f.hcp <= 7 && length >= 2;
      break;
    case 'acceptJumpMajor':
      success = info.kind === 'jumpRepeat' && call === `4${info.opening}` &&
        f.hcp >= 8 && f.hcp <= 12 && length >= 2;
      break;
  }
  return { success, telemetryLines: [
    `${success ? 'PASS' : 'FAIL'}: ${choice} after major-1NT ${info.kind}; ` +
    `responder ${f.hcp} HCP, ${length} ${info.opening} cards.`,
  ] };
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
/// possibility of a two-card club or three-card diamond fallback under a forcing-1NT agreement.
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
        suitLength >= (info.rebid === 'H' || system.majorOneNtResponse === 'nonForcing' ||
                       responderPreviouslyPassed(context.dealer, context.auction) ? 4 :
                       info.rebid === 'C' ? 6 : 5);
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
  ], callEvidence: { naturalResponderRebid: {
      family: 'majorOneNt', decision: decision, hcp: facts.hcp,
      lengthPoints: facts.totalPointsWLength,
      supportPoints: facts.totalPointsWShortage,
      balanced: facts.balanced,
      openingSuit: info.opening, responseSuit: null, rebidSuit: info.rebid,
      openingLength: majorLength, responseLength: 0, rebidLength: suitLength,
      success,
    } } };
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
  ], callEvidence: { naturalResponderRebid: {
      family: 'minorOneNt', decision: choice, hcp: f.hcp,
      lengthPoints: f.totalPointsWLength,
      supportPoints: f.totalPointsWShortage,
      balanced: f.balanced,
      openingSuit: info.opening, responseSuit: null, rebidSuit: null,
      openingLength: f.lengths[info.opening], responseLength: 0, rebidLength: 0,
      success,
    } } };
}

//// Responder after opener jump-repeats a six-card minor following a one-level major response

/// Recognize exactly the uncontested 1m–1M–3m invitation.  Physical opponent Passes
/// matter: a superficially similar competitive auction has different meanings.  Passes
/// before the opening (including a non-dealer opener) are harmless.
export function getResponderAfterMinorJumpRepeat (context: RuleEvalContext):
    { opening: 'C' | 'D'; response: 'H' | 'S' } | null {
  if (context.stage !== 'responderRebid') return null;
  const opening = getOpeningCallInfo(context.dealer, context.auction);
  if (opening === null || (opening.call !== '1C' && opening.call !== '1D') ||
      context.auction.length !== opening.index + 6) return null;
  const start = opening.index;
  const response = context.auction[start + 2];
  if ((response !== '1H' && response !== '1S') ||
      context.auction[start + 1] !== 'Pass' ||
      context.auction[start + 3] !== 'Pass' ||
      context.auction[start + 4] !== `3${opening.call[1]}` ||
      context.auction[start + 5] !== 'Pass') return null;
  return { opening: opening.call[1] as 'C' | 'D', response: response[1] as 'H' | 'S' };
}

/// The 3m jump repeat is invitational, not forcing.  A minimum responder with an
/// eight-card minor fit may Pass; 3NT needs additional HCP, balance, and stoppers in
/// both suits neither partner bid.  Other choices need judgment and scope guidance.
export function responderAfterMinorJumpRepeatApplies (_call: Call, context: RuleEvalContext,
    choice: 'pass' | 'threeNt'): AppliesWhenResult {
  const info = getResponderAfterMinorJumpRepeat(context);
  if (info === null) return { success: false, telemetryLines: ['Not an uncontested 1m–1M–3m jump repeat.'] };
  const f = context.handFacts;
  const unbid = (['C', 'D', 'H', 'S'] as Suit[]).filter((suit) =>
    suit !== info.opening && suit !== info.response);
  const success = choice === 'pass'
    ? f.hcp >= 6 && f.hcp <= 9 && f.lengths[info.opening] >= 2 &&
      f.lengths[info.response] <= 5
    : f.hcp >= 11 && f.hcp <= 12 && f.balanced &&
      f.lengths[info.response] === 4 &&
      unbid.every((suit) => hasBasicSuitStopper(context, suit));
  return { success, telemetryLines: [
    `${success ? 'PASS' : 'FAIL'}: ${choice} after 1${info.opening}–1${info.response}–3${info.opening}; ` +
    `responder ${f.hcp} HCP, opening minor length ${f.lengths[info.opening]}, ` +
    `response major length ${f.lengths[info.response]}.`,
  ] };
}

//// Natural responder choices after a 2/1 game-forcing response

/// Identify the original game force by the first three partnership bids, not by the
/// particular suit letters or the opponents' intervening Passes. The original minor
/// might have been a three-card suit on the separate game-forcing major-support route.
export function getResponderTwoOverOne (context: RuleEvalContext):
    { opening: Suit; response: Suit; rebid: string;
      kind: 'repeatOpening' | 'raiseResponse' | 'secondSuit' | 'twoNt' | 'other';
      second: Suit | null } | null {
  if (context.stage !== 'responderRebid') return null;
  const openingInfo = getOpeningCallInfo(context.dealer, context.auction);
  if (openingInfo === null) return null;
  const bids = getOpeningPartnershipCalls(context.dealer, context.auction, openingInfo.seat);
  if (bids.length !== 3 || !/^1[DHS]$/.test(bids[0] ?? '') ||
      !/^2[CDH]$/.test(bids[1] ?? '') ||
      responseJump(bids[0] as `1${Suit}`, bids[1] as `2${Suit}`) !== 0 || bids[0][1] === bids[1][1]) return null;
  const opening = bids[0][1] as Suit;
  const response = bids[1][1] as Suit;
  if (responderPreviouslyPassed(context.dealer, context.auction)) return null;
  const rebid = bids[2];
  const suit = parseSuitBid(rebid);
  const repeat = suit !== null && suit.strain === opening && suit.level === 2;
  const raise = suit !== null && suit.strain === response && suit.level === 3;
  const second = suit !== null && suit.strain !== 'NT' &&
    suit.strain !== opening && suit.strain !== response ? suit.strain as Suit : null;
  return { opening, response, rebid,
           kind: repeat ? 'repeatOpening' : raise ? 'raiseResponse' :
             second !== null ? 'secondSuit' : rebid === '2NT' ? 'twoNt' : 'other', second };
}

/// Only natural games in a previously shown partnership suit (or 3NT) complete this
/// 2/1 obligation here. A jump to game in an unbid suit could be artificial, and 4NT
/// can be ace-asking; neither is treated as a routine Pass without further agreements.
export function responderTwoOverOneReachedGame (context: RuleEvalContext): boolean {
  const info = getResponderTwoOverOne(context);
  if (info === null) return false;
  return info.rebid === '3NT' ||
    ((info.opening === 'H' || info.opening === 'S') && info.rebid === `4${info.opening}`) ||
    (info.response === 'H' && info.rebid === '4H') ||
    ((info.opening === 'C' || info.opening === 'D') && info.rebid === `5${info.opening}`) ||
    ((info.response === 'C' || info.response === 'D') && info.rebid === `5${info.response}`);
}

/// Only the suit known from the auction may be chosen. A direct 4M may use two-card
/// support when opener has repeated a six-card major; a slower 3M shows three-card
/// support and extra strength, preserving bidding space for possible slam interest.
export function refineResponderTwoOverOneSuit (calls: Call[], context: RuleEvalContext,
    choice: 'openingGame' | 'openingSlowRaise' | 'secondMajorGame' | 'repeatResponse'):
    CallRefinementResult {
  const info = getResponderTwoOverOne(context);
  const wanted = info === null ? null : choice === 'openingGame' ? `4${info.opening}` :
    choice === 'openingSlowRaise' ? `3${info.opening}` :
    choice === 'secondMajorGame' && info.second !== null ? `4${info.second}` :
    choice === 'repeatResponse' ? `3${info.response}` : null;
  return { calls: wanted === null ? [] : calls.filter((call) => call === wanted),
           telemetryLines: [wanted === null ? 'No qualifying 2/1 natural suit.' :
             `Keep the ${wanted} continuation of the established 2/1 game force.`] };
}

/// Require the game force to remain active. A direct game needs a known fit or a
/// sound notrump strain; economical descriptions are forcing, not final contracts.
export function responderTwoOverOneApplies (call: Call, context: RuleEvalContext,
    choice: 'openingGame' | 'openingSlowRaise' | 'secondMajorGame' |
            'repeatResponse' | 'gameNt' | 'forcingNt' | 'passReachedGame'): AppliesWhenResult {
  const info = getResponderTwoOverOne(context);
  if (info === null) return { success: false, telemetryLines: ['Not a natural 2/1 game-force auction.'] };
  const f = context.handFacts;
  const ordinary = f.hcp >= 13 && f.hcp <= 16;
  const supportPoints = f.totalPointsWShortage;
  const openingMajor = info.opening === 'H' || info.opening === 'S';
  const newMajor = info.second === 'H' || info.second === 'S';
  const knownOpeningFit = openingMajor && info.kind === 'repeatOpening' &&
    f.lengths[info.opening] >= 2;
  const knownMajorFit = openingMajor && f.lengths[info.opening] >= 3;
  let success = false;
  switch (choice) {
    case 'passReachedGame': {
      // Responder may accept a game in notrump, or a natural suit game with some fit.
      // Stronger/slam-going hands and unsuitable game contracts retain boundary guidance.
      success = ordinary && responderTwoOverOneReachedGame(context) &&
        (info.rebid === '3NT' || f.lengths[info.rebid[1] as Suit] >= 2);
      break;
    }
    case 'openingGame':
      success = ordinary && knownOpeningFit && call === `4${info.opening}` &&
        supportPoints <= 17; break;
    case 'openingSlowRaise':
      success = openingMajor && f.lengths[info.opening] >= 3 &&
        supportPoints >= 17 && supportPoints <= 21 && call === `3${info.opening}` &&
        (info.kind === 'repeatOpening' || info.kind === 'secondSuit' || info.kind === 'twoNt'); break;
    case 'secondMajorGame':
      success = ordinary && newMajor && f.lengths[info.second!] >= 4 &&
        supportPoints <= 17 && call === `4${info.second}`; break;
    case 'repeatResponse':
      success = ordinary && f.lengths[info.response] >= 6 &&
        (info.kind === 'repeatOpening' || info.kind === 'secondSuit' || info.kind === 'twoNt') &&
        call === `3${info.response}`; break;
    case 'gameNt': {
      const unbid = (['C', 'D', 'H', 'S'] as Suit[]).filter((suit) =>
        suit !== info.opening && suit !== info.response && suit !== info.second);
      success = call === '3NT' && ordinary && f.balanced && ! knownOpeningFit &&
        !(newMajor && f.lengths[info.second!] >= 4) &&
        (info.kind === 'twoNt' || info.kind === 'repeatOpening' || info.kind === 'secondSuit') &&
        unbid.every((suit) => hasBasicSuitStopper(context, suit));
      break;
    }
    case 'forcingNt': {
      success = call === '2NT' && ordinary && f.balanced &&
        (info.kind === 'repeatOpening' || info.kind === 'secondSuit') &&
        ! knownOpeningFit && !(newMajor && f.lengths[info.second!] >= 4);
      // Responder remains game forcing: unbid-suit stoppers are not prerequisites
      // for a descriptive 2NT. The separate 3NT rule retains its stopper tests.
      break;
    }
  }
  return { success, telemetryLines: [
    `${success ? 'PASS' : 'FAIL'}: 2/1 ${choice} after ${info.opening}/${info.response}/${info.rebid}; ` +
    `HCP ${f.hcp}, support points ${supportPoints}, original/response lengths ` +
    `${f.lengths[info.opening]}/${f.lengths[info.response]}.`,
  ], callEvidence: { naturalResponderRebid: {
      family: 'twoOverOne', decision: choice, hcp: f.hcp,
      lengthPoints: f.totalPointsWLength,
      supportPoints: f.totalPointsWShortage,
      balanced: f.balanced,
      openingSuit: info.opening, responseSuit: info.response, rebidSuit: info.second,
      openingLength: f.lengths[info.opening], responseLength: f.lengths[info.response],
      rebidLength: info.second === null ? 0 : f.lengths[info.second],
      missingStoppers: choice === 'gameNt' ? (['C', 'D', 'H', 'S'] as Suit[])
        .filter((suit) => suit !== info.opening && suit !== info.response &&
          suit !== info.second && !hasBasicSuitStopper(context, suit)) : [],
      knownMajorFit,
      openerRebid: info.rebid,
      success,
    } } };
}

//// Standard two-level new-suit responder continuations

/// The first two partnership bids establish a one-round force. Only ordinary natural
/// Standard responses qualify; the same printed auction under 2/1 is game forcing.
/// An opener repeat at the two level may be a restricted five-card major fallback.
export function getResponderStandardTwoLevel (context: RuleEvalContext):
    { opening: Suit; response: Suit; rebid: string;
      kind: 'repeat' | 'raise' | 'minorRepeat' | 'minimumNt' | 'gameNt' | 'other' } | null {
  if (context.stage !== 'responderRebid') return null;
  const openingInfo = getOpeningCallInfo(context.dealer, context.auction);
  if (openingInfo === null) return null;
  const bids = getOpeningPartnershipCalls(context.dealer, context.auction, openingInfo.seat);
  if (bids.length !== 3 || !/^1[DHS]$/.test(bids[0] ?? '') ||
      !/^2[CDH]$/.test(bids[1] ?? '')) return null;
  const opening = bids[0] as `1${Suit}`;
  const response = bids[1] as `2${Suit}`;
  if (opening[1] === response[1] || responseJump(opening, response) !== 0) return null;
  const rebid = bids[2];
  const repeated = rebid === `2${opening[1]}`;
  const raised = rebid === `3${response[1]}`;
  const kind = repeated ? (opening === '1D' ? 'minorRepeat' : 'repeat') :
    raised ? 'raise' : rebid === '2NT' ? 'minimumNt' :
    rebid === '3NT' ? 'gameNt' : 'other';
  return { opening: opening[1] as Suit, response: response[1] as Suit, rebid, kind };
}

/// The bid chosen must follow from opener's actual rebid, not merely the opening suit.
export function refineResponderStandardTwoLevel (calls: Call[], context: RuleEvalContext,
    choice: 'repeatResponse' | 'majorGame'): CallRefinementResult {
  const info = getResponderStandardTwoLevel(context);
  if (info === null) return { calls: [], telemetryLines: ['Not a Standard two-level new-suit auction.'] };
  const wanted = choice === 'repeatResponse' ? `3${info.response}` : `4${info.response}`;
  return { calls: calls.filter((call) => call === wanted),
           telemetryLines: [`Choose ${wanted} using the natural preceding suit promises.`] };
}

/// Select only straightforward nonforcing signoffs and game placements. The original
/// one-round force has been satisfied, but responder's 11+ HCP is not an upper bound.
export function responderStandardTwoLevelApplies (_call: Call, context: RuleEvalContext,
    choice: 'repeatResponse' | 'passRaise' | 'preferDiamonds' | 'passNt' |
            'gameNt' | 'majorGame' | 'passGame'): AppliesWhenResult {
  const info = getResponderStandardTwoLevel(context);
  if (info === null) return { success: false, telemetryLines: ['Not a Standard two-level new-suit auction.'] };
  const f = context.handFacts;
  const minimum = f.hcp >= 11 && f.hcp <= 12;
  let success = false;
  switch (choice) {
    case 'repeatResponse': success = (info.kind === 'repeat' || info.kind === 'minorRepeat') &&
      minimum && f.lengths[info.response] >= 6; break;
    case 'passRaise': success = info.kind === 'raise' && minimum &&
      f.totalPointsWShortage <= 12; break;
    case 'preferDiamonds': success = info.opening === 'D' && info.response === 'C' &&
      info.kind === 'minorRepeat' && minimum && f.lengths.D >= 3; break;
    case 'passNt': success = info.kind === 'minimumNt' && minimum && f.balanced; break;
    case 'gameNt': success = info.kind === 'minimumNt' && f.balanced &&
      f.hcp >= 13 && f.hcp <= 16; break;
    case 'majorGame': success = info.kind === 'raise' && info.response === 'H' &&
      f.totalPointsWShortage >= 13 && f.totalPointsWShortage <= 16; break;
    case 'passGame': success = info.kind === 'gameNt' && f.hcp >= 11 && f.hcp <= 12; break;
  }
  return { success, telemetryLines: [
    `${success ? 'PASS' : 'FAIL'}: Standard two-level ${choice}; ` +
    `${info.opening}-${info.response}-${info.rebid}, ${f.hcp} HCP.`,
  ], callEvidence: { naturalResponderRebid: {
    family: 'standardTwoLevel', decision: choice, hcp: f.hcp,
    lengthPoints: f.totalPointsWLength, supportPoints: f.totalPointsWShortage,
    balanced: f.balanced, openingSuit: info.opening, responseSuit: info.response,
    rebidSuit: null, openingLength: f.lengths[info.opening],
    responseLength: f.lengths[info.response], rebidLength: 0,
    openerRebid: info.rebid, success,
  } } };
}

//// Responder after a direct 1NT-3M slam try and opener's side-control reply

/// Recognize the selected uncontested 1NT-3M-control auction, not a Jacoby transfer
/// completion or an ordinary three-level major response.  The prior control bid must
/// name a different suit economically below four of the agreed major; the opener's
/// rule already determined which A/K control to show.  We do not introduce slam replies.
export function responderAfterOneNtMajorSlamControl (context: RuleEvalContext): boolean {
  if (context.stage !== 'responderRebid') return false;
  const opening = getOpeningCallInfo(context.dealer, context.auction);
  if (opening === null || opening.call !== '1NT' ||
      context.auction.length !== opening.index + 6) return false;
  const responseCall = context.auction[opening.index + 2];
  const controlCall = context.auction[opening.index + 4];
  if (context.auction[opening.index + 1] !== 'Pass' ||
      context.auction[opening.index + 3] !== 'Pass' ||
      context.auction[opening.index + 5] !== 'Pass' ||
      (responseCall !== '3H' && responseCall !== '3S') ||
      controlCall === undefined) return false;
  const response = parseSuitBid(responseCall);
  const control = parseSuitBid(controlCall);
  const game = parseSuitBid(`4${responseCall[1]}` as SuitBid);
  return response !== null && control !== null && game !== null &&
    control.strain !== 'NT' && control.strain !== response.strain &&
    cheapestBidInStrainAfter(response, control.strain) === controlCall &&
    compareSuitBids(control, game) < 0;
}

//// Responder's continuation after a notrump-opening convention

/// Recognize only the exact three partnership calls of an uncontested Stayman or
/// Jacoby-transfer sequence. The 1NT opening/overcall distinction matters: an opponent's
/// suit opening followed by our natural 1NT overcall is not an NT *opening* here.
/// Agreement filtering of the rules separately protects natural 2C/3C or 2D/3D uses when
/// the relevant convention is disabled.
export function getResponderNtConvention (context: RuleEvalContext):
    { opening: '1NT' | '2NT'; convention: 'stayman' | 'jacoby'; reply: Call;
      major: 'H' | 'S' | null; matched: boolean } | null {
  if (context.stage !== 'responderRebid') return null;
  const opening = getOpeningCallInfo(context.dealer, context.auction);
  if (opening === null || (opening.call !== '1NT' && opening.call !== '2NT')) return null;
  const bids = getOpeningPartnershipCalls(context.dealer, context.auction, opening.seat);
  if (bids.length !== 3 || bids[0] !== opening.call) return null;
  const [ , response, reply ] = bids;
  const base = opening.call === '1NT' ? 2 : 3;
  const stayman = `${base}C`;
  if (response === stayman &&
      (reply === `${base}D` || reply === `${base}H` || reply === `${base}S`)) {
    const major = reply === `${base}H` ? 'H' : reply === `${base}S` ? 'S' : null;
    return { opening: opening.call, convention: 'stayman', reply,
             major, matched: major !== null && context.handFacts.lengths[major] >= 4 };
  }
  if (response === `${base}D` && reply === `${base}H`) {
    return { opening: opening.call, convention: 'jacoby', reply, major: 'H', matched: true };
  }
  if (response === `${base}H` && reply === `${base}S`) {
    return { opening: opening.call, convention: 'jacoby', reply, major: 'S', matched: true };
  }
  return null;
}

/// A shown Stayman major is the only suit to raise; a Jacoby completion is the only
/// major in which responder may rebid naturally. Prevent a fixed 3H/3S/4H/4S rule
/// from qualifying in the wrong denomination.
export function refineResponderNtConventionalMajor (calls: Call[], context: RuleEvalContext,
    level: 3 | 4): CallRefinementResult {
  const info = getResponderNtConvention(context);
  const wanted = info?.major === null || info === null ? null : `${level}${info.major}`;
  return { calls: wanted === null ? [] : calls.filter((call) => call === wanted),
           telemetryLines: [wanted === null ? 'No shown convention major.' :
             `Only ${wanted} describes the major established by this auction.`] };
}

/// Exact, deliberately limited continuations; high slam values and unusual 5-4 / 6-4
/// decisions retain the appropriate auction-specific boundary instead of a fake bid.
/// One-NT HCP windows track the already-selected 15-17 vs 16-18 response agreement.
/// A Jacoby-then-4M jump is treated as natural game placement only with Texas disabled;
/// when Texas is enabled, the fast game route is the *direct* Texas transfer.
export function responderNtConventionApplies (call: Call, context: RuleEvalContext,
    system: BiddingSystem, choice:
    'staymanInviteNt' | 'staymanGameNt' | 'staymanInviteMajor' | 'staymanGameMajor' |
    'stayman2NtGameNt' | 'stayman2NtGameMajor' |
    'transferPass' | 'transferInviteNt' | 'transferInviteMajor' | 'transferGameNt' |
    'transferGameMajor'): AppliesWhenResult {
  const info = getResponderNtConvention(context);
  if (info === null) return { success: false, telemetryLines: ['Not a completed NT convention.'] };
  const f = context.handFacts;
  const first = info.opening === '1NT';
  const shift = first ? oneNtResponseHcpShift(system) : 0;
  const invite = first && f.hcp >= 8 - shift && f.hcp <= 9 - shift;
  const game = first && f.hcp >= 10 - shift && f.hcp <= 15 - shift;
  const twoNtGame = !first && f.hcp >= 4 && f.hcp <= 10;
  const askedWithFourMajor = f.lengths.H === 4 || f.lengths.S === 4;
  const suitLength = info.major === null ? 0 : f.lengths[info.major];
  const otherMajor = info.major === 'H' ? 'S' : 'H';
  const noOtherFour = f.lengths[otherMajor] <= 3;
  let success = false;
  switch (choice) {
    case 'staymanInviteNt': success = info.convention === 'stayman' && askedWithFourMajor && invite &&
      !info.matched && f.balanced && call === '2NT'; break;
    case 'staymanGameNt': success = info.convention === 'stayman' && askedWithFourMajor && game &&
      !info.matched && f.balanced && call === '3NT'; break;
    case 'staymanInviteMajor': success = info.convention === 'stayman' && askedWithFourMajor && invite &&
      info.matched && call === `3${info.major}`; break;
    case 'staymanGameMajor': success = info.convention === 'stayman' && askedWithFourMajor && game &&
      info.matched && call === `4${info.major}`; break;
    case 'stayman2NtGameNt': success = info.convention === 'stayman' && askedWithFourMajor && twoNtGame &&
      !info.matched && call === '3NT'; break;
    case 'stayman2NtGameMajor': success = info.convention === 'stayman' && askedWithFourMajor && twoNtGame &&
      info.matched && call === `4${info.major}`; break;
    case 'transferPass': success = info.convention === 'jacoby' && call === 'Pass' &&
      suitLength >= 5 &&
      (first ? f.hcp <= 7 - shift : f.hcp <= 3); break;
    case 'transferInviteNt': success = info.convention === 'jacoby' && invite &&
      suitLength === 5 && noOtherFour && f.balanced && call === '2NT'; break;
    case 'transferInviteMajor': success = info.convention === 'jacoby' && invite &&
      suitLength >= 6 && call === `3${info.major}`; break;
    case 'transferGameNt': success = info.convention === 'jacoby' &&
      (first ? game : twoNtGame) && suitLength === 5 && noOtherFour &&
      f.balanced && call === '3NT'; break;
    case 'transferGameMajor': success = info.convention === 'jacoby' &&
      (first ? game : twoNtGame) && suitLength >= 6 && noOtherFour &&
      !system.texasTransfers && call === `4${info.major}`; break;
  }
  return { success, telemetryLines: [
    `${success ? 'PASS' : 'FAIL'}: ${info.opening} ${info.convention} ${choice} ` +
    `after ${info.reply}; HCP ${f.hcp}, major length ${suitLength}, ` +
    `Texas ${system.texasTransfers}.`,
  ] };
}



//// Shared uncontested opener–responder–opener sequence
/// Read the first three partnership calls only when all three intervening opponents Passed.
/// This prevents competitive auctions from inheriting uncontested game-try or convention meanings.
function getUncontestedThreeCallContinuation (context: RuleEvalContext):
    { opening: Call; response: Call; rebid: Call } | null {
  if (context.stage !== 'responderRebid') return null;
  const opening = getOpeningCallInfo(context.dealer, context.auction);
  if (opening === null) return null;
  const i = opening.index;
  if (context.auction.length !== i + 6 ||
      context.auction[i + 1] !== 'Pass' ||
      context.auction[i + 3] !== 'Pass' ||
      context.auction[i + 5] !== 'Pass') return null;
  const partnership = getOpeningPartnershipCalls(context.dealer, context.auction, opening.seat);
  if (partnership.length !== 3) return null;
  return { opening: partnership[0], response: partnership[1], rebid: partnership[2] };
}

//// Responder after opener makes a game try following a simple major raise

/// An uncontested 1M–2M–(help suit or 2NT) auction is an invitation, not opener's
/// competitive 3M with a six-card suit.  Require the actual cheapest side-suit bid so
/// a jump or an unrelated natural rebid cannot accidentally inherit game-try meaning.
export function getResponderAfterMajorGameTry (context: RuleEvalContext):
    { major: 'H' | 'S'; kind: 'helpSuit' | 'balanced'; helpSuit: Suit | null } | null {
  const seq = getUncontestedThreeCallContinuation(context);
  if (seq === null || (seq.opening !== '1H' && seq.opening !== '1S')) return null;
  const major = seq.opening[1] as 'H' | 'S';
  if (seq.response !== `2${major}` || context.handFacts.lengths[major] < 3) return null;
  if (seq.rebid === '2NT') return { major, kind: 'balanced', helpSuit: null };
  const rebid = parseSuitBid(seq.rebid);
  const raise = parseSuitBid(seq.response);
  if (rebid === null || raise === null || rebid.strain === 'NT' ||
      rebid.strain === major ||
      cheapestBidInStrainAfter(raise, rebid.strain) !== seq.rebid ||
      // A genuine invitation must leave a legal 3M decline available.
      !isCallAvailableInAuction(`3${major}` as Call, context.auction)) {
    return null;
  }
  return { major, kind: 'helpSuit', helpSuit: rebid.strain as Suit };
}

/// The invitation belongs to the already established major fit, even when opener
/// used 2NT or a side suit to ask about game.
export function refineResponderMajorGameTry (calls: Call[], context: RuleEvalContext):
    CallRefinementResult {
  const info = getResponderAfterMajorGameTry(context);
  return { calls: info === null ? [] : calls.filter((call) =>
    call === `3${info.major}` || call === `4${info.major}`),
    telemetryLines: [info === null ? 'No qualifying major-fit game try.' :
      `The agreed suit is ${info.major}; responder may stop at three or accept at four.`] };
}

/// A help-suit game try asks for working values in the named suit, or useful
/// shortness for ruffing.  At an eight-point borderline, count A/K, a QJ
/// combination, or a singleton/void as useful assistance; a lone J or Q does
/// not by itself promise the help opener is looking for.
function hasGameTrySuitHelp (context: RuleEvalContext, suit: Suit): boolean {
  const cards = context.hand.cards.filter((card) => card.suit === suit);
  return cards.length <= 1 || cards.some((card) => card.rank === 'A' || card.rank === 'K') ||
    (cards.some((card) => card.rank === 'Q') && cards.some((card) => card.rank === 'J'));
}

/// Responder's simple raise originally showed 6–10 *support* points.  With 9–10,
/// accept the 17–18-point opener invitation; with 6–7, decline. At eight points,
/// use help-suit working honors/shortness; without a named suit, either game or
/// partscore can be a sound judgment call. The inviting side suit is never trump.
export function responderMajorGameTryApplies (call: Call, context: RuleEvalContext):
    AppliesWhenResult {
  const info = getResponderAfterMajorGameTry(context);
  const points = context.handFacts.totalPointsWShortage;
  const helped = info?.helpSuit !== null && info?.helpSuit !== undefined &&
    hasGameTrySuitHelp(context, info.helpSuit);
  const accept = points >= 9 || (points === 8 && (info?.kind === 'balanced' || helped));
  const decline = points <= 7 || (points === 8 && (info?.kind === 'balanced' || !helped));
  const success = info !== null && points >= 6 && points <= 10 &&
    (call === `4${info.major}` ? accept : call === `3${info.major}` && decline);
  return { success, telemetryLines: [
    `${success ? 'PASS' : 'FAIL'}: ${info?.kind ?? 'no'} game try, ` +
    `agreed ${info?.major ?? '-'}, help suit ${info?.helpSuit ?? '-'}, ` +
    `responder ${points} support points, help=${helped}, call=${call}.`,
  ] };
}

//// Responder after opener makes a splinter agreeing responder's suit

/// Recognize only the opener-side splinters the opener-rebid rules actually describe:
///   - 1m/1M – 1new-suit – double-jump into a different short suit, or
///   - 1M – 2M – single-jump into a different short suit.
/// In both cases the opening bidder promises four-card support for responder's new suit
/// (five-card trump support after the simple raise).  This helper recognizes the actual
/// auction, not the student's strength or any unannounced shortness in their hand.
export function getResponderAfterOpenerSplinter (context: RuleEvalContext):
    { agreedSuit: Suit; shortSuit: Suit; responseKind: 'newSuit' | 'simpleMajorRaise' } | null {
  const seq = getUncontestedThreeCallContinuation(context);
  if (seq === null || ! /^1[CDHS]$/.test(seq.opening)) return null;
  const openingSuit = seq.opening[1] as Suit;
  const response = parseSuitBid(seq.response);
  const rebid = parseSuitBid(seq.rebid);
  if (response === null || rebid === null || response.strain === 'NT' ||
      rebid.strain === 'NT' || rebid.strain === openingSuit ||
      rebid.strain === response.strain) return null;
  const simpleMajorRaise = (openingSuit === 'H' || openingSuit === 'S') &&
    seq.response === `2${openingSuit}`;
  const newSuit = response.level === 1 && response.strain !== openingSuit &&
    responseJump(seq.opening as SuitBid, seq.response as SuitBid) === 0;
  if (!simpleMajorRaise && !newSuit) return null;
  const cheapest = cheapestBidInStrainAfter(response, rebid.strain);
  if (cheapest === null || rebid.level !== parseSuitBid(cheapest)!.level +
      (simpleMajorRaise ? 1 : 2)) return null;
  return { agreedSuit: (simpleMajorRaise ? openingSuit : response.strain) as Suit,
    shortSuit: rebid.strain as Suit,
    responseKind: simpleMajorRaise ? 'simpleMajorRaise' : 'newSuit' };
}

/// With a normal response, opener's splinter has already forced the partnership to
/// game in the agreed major.  Return to 4M; stronger responder hands may merit slam
/// investigation, which this trainer leaves to the following scope boundary.
export function responderOpenerSplinterMajorGameApplies (call: Call, context: RuleEvalContext):
    AppliesWhenResult {
  const info = getResponderAfterOpenerSplinter(context);
  const isMajor = info?.agreedSuit === 'H' || info?.agreedSuit === 'S';
  const support = info === null ? 0 : context.handFacts.lengths[info.agreedSuit];
  const supportMinimum = info?.responseKind === 'simpleMajorRaise' ? 3 : 4;
  const points = context.handFacts.totalPointsWShortage;
  const maximum = info?.responseKind === 'simpleMajorRaise' ? 10 : 12;
  const success = isMajor && support >= supportMinimum && points >= 6 && points <= maximum &&
    call === `4${info?.agreedSuit}`;
  return { success, telemetryLines: [
    `${success ? 'PASS' : 'FAIL'}: opener splinter agreeing ${info?.agreedSuit ?? '-'}, ` +
    `short suit ${info?.shortSuit ?? '-'}, response ${info?.responseKind ?? '-'}, ` +
    `support ${support}, support points ${points} (normal 6-${maximum}).`,
  ] };
}

/// A splinter in support of responder's *major* always returns to that major for
/// ordinary game placement; do not bid opener's short side suit as a natural contract.
export function refineResponderOpenerSplinterMajorGame (calls: Call[], context: RuleEvalContext):
    CallRefinementResult {
  const info = getResponderAfterOpenerSplinter(context);
  const game = info !== null && (info.agreedSuit === 'H' || info.agreedSuit === 'S')
    ? `4${info.agreedSuit}` : null;
  return { calls: game === null ? [] : calls.filter((call) => call === game),
    telemetryLines: [game === null ? 'No major agreed by an opener-side splinter.' :
      `Return to ${game} after opener's splinter in ${info!.shortSuit}.`] };
}

//// Responder after a classic strong jump-shift response

/// Recognize responder's *original* single-jump new-suit response, not opener's later
/// jump shift.  The opener rebid must be one of the natural continuations modeled for
/// this forcing response: an economical raise, repeat, second suit, or notrump rebid.
/// All intervening opponent calls must have been Pass.  The agreement setting is
/// checked by the rules that use this helper.
export function getResponderAfterStrongJumpShift (context: RuleEvalContext):
    { opening: Suit; response: Suit; rebid: Call; kind: 'raise' | 'repeat' | 'secondSuit' | 'notrump' } | null {
  const seq = getUncontestedThreeCallContinuation(context);
  if (seq === null || ! /^1[CDHS]$/.test(seq.opening)) return null;
  const response = parseSuitBid(seq.response);
  const rebid = parseSuitBid(seq.rebid);
  if (response === null || rebid === null || response.strain === 'NT' ||
      response.strain === seq.opening[1] ||
      responseJump(seq.opening as SuitBid, seq.response as SuitBid) !== 1) return null;
  const opening = seq.opening[1] as Suit;
  const responseSuit = response.strain as Suit;
  let kind: 'raise' | 'repeat' | 'secondSuit' | 'notrump';
  if (rebid.strain === responseSuit && rebid.level === response.level + 1) {
    kind = 'raise';
  } else if (cheapestBidInStrainAfter(response, rebid.strain) === seq.rebid) {
    kind = rebid.strain === 'NT' ? 'notrump' :
      rebid.strain === opening ? 'repeat' : 'secondSuit';
  } else {
    return null;
  }
  return { opening, response: responseSuit, rebid: seq.rebid, kind };
}

/// The jump shift already established a game force and expresses slam interest.
/// For a minimum strong jump shifter (17–18 HCP), support an obvious major-suit
/// contract or balanced notrump game; leave stronger hands and unclear strain or
/// slam choices to the explicit boundary.  Pass is permitted only *at* game,
/// never below it.  A raise by opener confirms at least three-card support for
/// responder's five-card suit; a repeat of an opening major shows six cards.
export function responderAfterStrongJumpShiftGameApplies (call: Call, context: RuleEvalContext):
    AppliesWhenResult {
  const info = getResponderAfterStrongJumpShift(context);
  const f = context.handFacts;
  let success = false;
  if (info !== null && f.hcp >= 17 && f.hcp <= 18) {
    const responseIsMajor = info.response === 'H' || info.response === 'S';
    const openingIsMajor = info.opening === 'H' || info.opening === 'S';
    const establishedResponderFit = info.kind === 'raise' && responseIsMajor &&
      f.lengths[info.response] >= 5;
    const establishedOpenerFit = info.kind === 'repeat' && openingIsMajor &&
      f.lengths[info.opening] >= 2;
    const majorGame = establishedResponderFit ? `4${info.response}` :
      establishedOpenerFit ? `4${info.opening}` : null;
    const openerNtGame = info.kind === 'notrump' && info.rebid === '3NT';
    const openerBelowGameNt = info.kind === 'notrump' && info.rebid === '2NT';
    // A known 5–3 (or longer) major fit takes precedence over the flat NT placement.
    const noOpenerMajorFit = !openingIsMajor || f.lengths[info.opening] < 3;
    if (majorGame !== null && call === majorGame) {
      // If opener has already bid the major game, responder's ordinary choice is Pass.
      success = info.rebid !== majorGame;
    } else if (establishedResponderFit && info.rebid === `4${info.response}` && call === 'Pass') {
      success = true;
    } else if (info.kind === 'notrump' && f.balanced && noOpenerMajorFit) {
      success = (openerNtGame && call === 'Pass') ||
        (openerBelowGameNt && call === '3NT');
    }
  }
  return { success, telemetryLines: [
    `${success ? 'PASS' : 'FAIL'}: responder strong jump shift ${info?.opening ?? '-'} / ` +
    `${info?.response ?? '-'}, opener ${info?.rebid ?? '-'} (${info?.kind ?? '-'}); ` +
    `responder HCP ${f.hcp}, choice ${call}.`,
  ], callEvidence: info === null ? undefined : { naturalResponderRebid: {
    family: 'strongJumpShift', decision: call === 'Pass' ? 'passGame' :
      call === '3NT' ? 'gameNt' : 'majorGame',
    hcp: f.hcp, lengthPoints: f.totalPointsWLength, supportPoints: f.totalPointsWShortage,
    balanced: f.balanced, openingSuit: info.opening, responseSuit: info.response,
    rebidSuit: null, openingLength: f.lengths[info.opening],
    responseLength: f.lengths[info.response], rebidLength: 0,
    openerRebid: info.rebid, success,
  } } };
}

//// Responder after strong 2C, Jacoby 2NT and splinter continuations
export function getResponderStrongTwoC (context: RuleEvalContext):
    { response: Call; rebid: Call; positive: boolean } | null {
  const seq = getUncontestedThreeCallContinuation(context);
  if (seq === null || seq.opening !== '2C' ||
      !['2D', '2H', '2S', '3C', '3D', '2NT'].includes(seq.response)) return null;
  return { response: seq.response, rebid: seq.rebid, positive: seq.response !== '2D' };
}

/// The minimum 2NT rebid after a waiting 2D is nonforcing, but a suit rebid is
/// forcing. After a positive response game is already forced. We implement only
/// obvious game placement, not a universal strong-two-clubs continuation system.
export function responderStrongTwoCDecisionApplies (_call: Call, context: RuleEvalContext,
    decision: 'passMinimumNt' | 'gameMinimumNt' | 'passGameNt' |
              'positiveGameNt' | 'positiveMajorGame'): AppliesWhenResult {
  const info = getResponderStrongTwoC(context);
  const f = context.handFacts;
  let success = false;
  if (info !== null) {
    switch (decision) {
      case 'passMinimumNt':
        success = !info.positive && info.rebid === '2NT' && f.hcp <= 2; break;
      case 'gameMinimumNt':
        success = !info.positive && info.rebid === '2NT' &&
          f.hcp >= 4 && f.hcp <= 9 && f.balanced; break;
      case 'passGameNt':
        success = !info.positive && info.rebid === '3NT' && f.hcp <= 7; break;
      case 'positiveGameNt':
        success = info.positive && info.rebid === '3NT' &&
          f.hcp >= 8 && f.hcp <= 10 && f.balanced; break;
      case 'positiveMajorGame':
        success = info.positive && (info.response === '2H' || info.response === '2S') &&
          info.rebid === `3${info.response[1]}` && f.hcp >= 8 && f.hcp <= 11 &&
          f.lengths[info.response[1] as Suit] >= 5; break;
    }
  }
  return { success, telemetryLines: [
    `${success ? 'PASS' : 'FAIL'}: strong 2C responder ${decision}; ` +
    `response ${info?.response ?? '-'}, rebid ${info?.rebid ?? '-'}, HCP ${f.hcp}.`,
  ] };
}

export function refineResponderStrongTwoCMajorGame (calls: Call[], context: RuleEvalContext):
    CallRefinementResult {
  const info = getResponderStrongTwoC(context);
  const suit = info !== null && (info.response === '2H' || info.response === '2S')
    ? info.response[1] : null;
  return { calls: suit === null ? [] : calls.filter((call) => call === `4${suit}`),
    telemetryLines: [suit === null ? 'No positive major-suit response.' :
      `Keep four of the positive ${suit} major.`] };
}

export function getResponderMajorSupportConvention (context: RuleEvalContext,
    system: BiddingSystem):
    { kind: 'jacoby2NT' | 'splinter'; major: Suit; rebid: Call } | null {
  const seq = getUncontestedThreeCallContinuation(context);
  if (seq === null || (seq.opening !== '1H' && seq.opening !== '1S')) return null;
  const major = seq.opening[1] as Suit;
  if (seq.response === '2NT' && system.majorGameForceWithSupport === 'jacoby2NT' &&
      /^3([CDHS]|NT)$|^4[CDHS]$/.test(seq.rebid)) {
    return { kind: 'jacoby2NT', major, rebid: seq.rebid };
  }
  const response = parseSuitBid(seq.response);
  if (system.splinters && response !== null && response.strain !== 'NT' &&
      response.strain !== major && responseJump(seq.opening as '1H' | '1S', seq.response as SuitBid) === 2 &&
      /^([34])([CDHS])$/.test(seq.rebid)) {
    return { kind: 'splinter', major, rebid: seq.rebid };
  }
  return null;
}

export function responderMajorSupportConventionApplies (call: Call, context: RuleEvalContext,
    system: BiddingSystem, decision: 'passGame' | 'returnToGame',
    kind: 'jacoby2NT' | 'splinter'): AppliesWhenResult {
  const info = getResponderMajorSupportConvention(context, system);
  const fitPoints = context.handFacts.totalPointsWShortage;
  const game = info === null ? null : `4${info.major}`;
  const atGame = info !== null && info.rebid === game;
  const majorFit = info !== null && context.handFacts.lengths[info.major] >= 4;
  const success = majorFit && info?.kind === kind && fitPoints >= 13 && fitPoints <= 15 &&
    (decision === 'passGame' ? atGame && call === 'Pass' :
     !atGame && call === game);
  return { success, telemetryLines: [
    `${success ? 'PASS' : 'FAIL'}: ${decision} after ${info?.kind ?? '-'}, ` +
    `opener ${info?.rebid ?? '-'}, major ${info?.major ?? '-'}, support points ${fitPoints}.`,
  ] };
}

export function refineResponderSupportMajorGame (calls: Call[], context: RuleEvalContext,
    system: BiddingSystem): CallRefinementResult {
  const info = getResponderMajorSupportConvention(context, system);
  return { calls: info === null ? [] : calls.filter((call) => call === `4${info.major}`),
    telemetryLines: [info === null ? 'No established Jacoby/splinter major fit.' :
      `Only game in the agreed ${info.major} major is considered.`] };
}
