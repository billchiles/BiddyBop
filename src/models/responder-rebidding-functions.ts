/// Natural responder rebids after opener shows a minimum balanced hand.
import type { Call, CallRefinementResult, RuleEvalContext } from './bidding-types';
import { getResponderCall } from './auction';

/// Restrict major repetitions to the suit responder actually showed at the one level.
export function refineResponderOriginalMajor (calls: Call[], context: RuleEvalContext):
    CallRefinementResult {
  const response = getResponderCall(context.dealer, context.auction);
  const major = response === '1H' ? 'H' : response === '1S' ? 'S' : null;
  return {
    calls: major === null ? [] : calls.filter((call) => call.endsWith(major)),
    telemetryLines: [major === null ? 'No original one-level major response.' :
      `Only the original ${major} suit may be repeated naturally.`],
  };
}
