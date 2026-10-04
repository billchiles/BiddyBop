/// Functions for advancer after partner's overcall or takeout double.

import { type AppliesWhenResult, type Call, type CallRefinementResult,
         type RuleEvalContext } from './bidding-types';
import { cheapestBidInStrainAfter, getInterferenceAfterOpening, getOpeningCallInfo,
         parseSuitBid, type ParsedSuitBid } from './auction';
import { hasBasicSuitStopper } from './common-rule-helpers';
import { type Suit } from './cards';


/// First advancing family: opener bids one of a suit, partner makes a natural non-jump
/// one-level suit overcall, and the opponents' responder passes.  Other interventions,
/// including a two-level non-jump overcall, are deliberately outside this family.
///
function getOneLevelSuitOvercallForAdvancer (context: RuleEvalContext):
    { opening: ParsedSuitBid; overcall: ParsedSuitBid } | null {
  if (context.stage !== 'advancing' ||
      getInterferenceAfterOpening(context.dealer, context.auction) !== 'suitOvercall') {
    return null;
  }
  const openingInfo = getOpeningCallInfo(context.dealer, context.auction);
  if (openingInfo === null || context.auction.length !== openingInfo.index + 3 ||
      context.auction[openingInfo.index + 2] !== 'Pass') {
    return null;
  }
  const opening = parseSuitBid(openingInfo.call);
  const overcallCall = context.auction[openingInfo.index + 1];
  const overcall = overcallCall === undefined ? null : parseSuitBid(overcallCall);
  if (opening === null || opening.level !== 1 || opening.strain === 'NT' ||
      overcall === null || overcall.level !== 1 || overcall.strain === 'NT') {
    return null;
  }
  return { opening, overcall };
}

export function refineAdvancerRaise (calls: Call[], context: RuleEvalContext):
    CallRefinementResult {
  const info = getOneLevelSuitOvercallForAdvancer(context);
  return {
    calls: info === null ? [] : calls.filter((call) =>
      parseSuitBid(call)?.strain === info.overcall.strain),
    telemetryLines: [],
  };
}

export function refineAdvancerCuebid (calls: Call[], context: RuleEvalContext):
    CallRefinementResult {
  const info = getOneLevelSuitOvercallForAdvancer(context);
  return {
    calls: info === null ? [] : calls.filter((call) =>
      parseSuitBid(call)?.strain === info.opening.strain),
    telemetryLines: [],
  };
}

/// A natural new-suit advance is at the cheapest legal level for that suit.  In
/// particular, a 2-level call is not necessarily economical after every overcall.
export function refineAdvancerNewSuit (calls: Call[], context: RuleEvalContext):
    CallRefinementResult {
  const info = getOneLevelSuitOvercallForAdvancer(context);
  return {
    calls: info === null ? [] : calls.filter((call) => {
      const bid = parseSuitBid(call);
      return bid !== null && bid.strain !== 'NT' &&
        bid.strain !== info.opening.strain && bid.strain !== info.overcall.strain &&
        cheapestBidInStrainAfter(info.overcall, bid.strain) === call;
    }),
    telemetryLines: [],
  };
}

/// Natural notrump advances need an opener-suit stopper, balanced shape, and the
/// appropriate range; these are distinct from notrump responses to an opening bid.
export function naturalNotrumpAdvanceApplies (call: Call, context: RuleEvalContext):
    AppliesWhenResult {
  const info = getOneLevelSuitOvercallForAdvancer(context);
  const hcp = context.handFacts.hcp;
  const rangeMatches = call === '1NT' ? hcp >= 8 && hcp <= 11 :
    call === '2NT' && hcp >= 12 && hcp <= 14;
  const success = info !== null && rangeMatches && context.handFacts.balanced &&
    hasBasicSuitStopper(context, info.opening.strain as Suit);
  return {
    success,
    telemetryLines: [success ? 'PASS: natural NT advance with range, shape, and stopper.' :
      'FAIL: natural NT advance needs a passed responder, 1-level suit overcall, ' +
      'balanced shape, proper HCP, and opening-suit stopper.'],
  };
}
