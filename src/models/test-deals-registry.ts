/// Rule-practice deal types, bucket registry, and exports.
/// Deal data lives in the stage/family `*-test-deals.ts` modules imported below.
/// 
/// Deal-data modules import RuleTestDeal using `import type`, which TypeScript erases
/// when emitting JavaScript. Their apparent imports back into this registry therefore
/// do not create runtime circular dependencies.
import type { BidStage, BiddingSystem, Call } from './bidding-types';
import type { Seat } from './cards';
import type { Suit } from './cards';
import { OPENING_BID_TEST_DEALS } from './opening-test-deals';
import { ADVANCER_AFTER_ONE_LEVEL_SUIT_OVERCALL_TEST_DEALS,
         ADVANCER_AFTER_TWO_LEVEL_SUIT_OVERCALL_TEST_DEALS,
         ADVANCER_AFTER_TAKEOUT_DOUBLE_TEST_DEALS,
         ADVANCER_AFTER_NATURAL_1NT_OVERCALL_TEST_DEALS,
         ADVANCER_AFTER_RESPONDER_RAISE_OVERCALL_TEST_DEALS,
         ADVANCER_AFTER_RESPONDER_RAISE_TAKEOUT_DOUBLE_TEST_DEALS,
         ADVANCER_AFTER_RESPONDER_NATURAL_ACTION_OVERCALL_TEST_DEALS,
         ADVANCER_AFTER_RESPONDER_NATURAL_ACTION_TAKEOUT_DOUBLE_TEST_DEALS,
         ADVANCER_AFTER_NEGATIVE_DOUBLE_TEST_DEALS,
         ADVANCER_AFTER_TAKEOUT_REDOUBLE_TEST_DEALS,
         ADVANCER_AFTER_JUMP_OVERCALL_TEST_DEALS } from './advancing-test-deals';
import { DONT_1NT_DEFENSE_TEST_DEALS, SIMPLE_OVERCALL_TEST_DEALS,
         TAKEOUT_DOUBLE_TEST_DEALS, WEAK_TWO_2NT_CONTINUATION_TEST_DEALS,
         WEAK_TWO_DEFENSE_TEST_DEALS,
         NATURAL_1NT_OVERCALL_TEST_DEALS, NATURAL_1NT_OVERCALL_REBID_TEST_DEALS,
         NATURAL_SUIT_OVERCALL_REBID_TEST_DEALS,
         PREEMPTIVE_JUMP_OVERCALL_TEST_DEALS } from './overcalling-test-deals';
import { RESPONSE_AFTER_MINOR_OPENING_TEST_DEALS,
         RESPONSE_AFTER_MAJOR_OPENING_TEST_DEALS,
         RESPONSE_AFTER_1NT_OPENING_TEST_DEALS,
         RESPONSE_AFTER_2NT_OPENING_TEST_DEALS,
         RESPONSE_TO_STRONG_2C_TEST_DEALS,
         RESPONSE_TO_WEAK_PREEMPT_TEST_DEALS } from './responding-test-deals';
import { RESPONDER_AFTER_SUIT_OVERCALL_TEST_DEALS,
         RESPONDER_AFTER_TAKEOUT_DOUBLE_TEST_DEALS,
         RESPONDER_AFTER_1NT_OVERCALL_TEST_DEALS,
         RESPONDER_AFTER_JUMP_OVERCALL_TEST_DEALS } from './responding-after-overcall-test-deals';
import { OPENER_REBID_AFTER_MINOR_1NT_TEST_DEALS,
         OPENER_REBID_AFTER_MINOR_ONE_LEVEL_NEW_SUIT_TEST_DEALS,
         OPENER_REBID_AFTER_MINOR_STANDARD_TWO_LEVEL_NEW_SUIT_TEST_DEALS,
         OPENER_REBID_AFTER_MINOR_TWO_OVER_ONE_NEW_SUIT_TEST_DEALS,
         OPENER_REBID_AFTER_MINOR_RAISE_TEST_DEALS,
         OPENER_REBID_AFTER_MINOR_2NT_TEST_DEALS,
         OPENER_REBID_AFTER_MINOR_3NT_TEST_DEALS } from './opener-rebidding-minor-test-deals';
import { OPENER_REBID_AFTER_MAJOR_1NT_TEST_DEALS,
         OPENER_REBID_AFTER_MAJOR_ONE_LEVEL_NEW_SUIT_TEST_DEALS,
         OPENER_REBID_AFTER_MAJOR_STANDARD_TWO_LEVEL_NEW_SUIT_TEST_DEALS,
         OPENER_REBID_AFTER_MAJOR_TWO_OVER_ONE_NEW_SUIT_TEST_DEALS,
         OPENER_REBID_AFTER_MAJOR_JACOBY_2NT_TEST_DEALS,
         OPENER_REBID_AFTER_MAJOR_SPLINTER_TEST_DEALS,
         OPENER_REBID_AFTER_JUMP_SHIFT_TEST_DEALS,
         OPENER_REBID_AFTER_MAJOR_GAME_RESPONSE_TEST_DEALS,
         OPENER_REBID_AFTER_MAJOR_LIMIT_RAISE_TEST_DEALS,
         OPENER_REBID_AFTER_MAJOR_SIMPLE_RAISE_TEST_DEALS } from './opener-rebidding-major-test-deals';
import { OPENER_REBID_AFTER_1NT_OPENING_TEST_DEALS,
         OPENER_REBID_AFTER_2NT_OPENING_TEST_DEALS } from './opener-rebidding-nt-test-deals';
import { OPENER_REBID_AFTER_INTERFERENCE_TEST_DEALS }
  from './opener-rebidding-after-interference-test-deals';

export interface RuleTestDeal {
  description: string;
  // Actual auction (including opponent passes) for manual practice.
  practiceAuction: Call[];
  // Sparse, chronologically ordered notes, revealed after the matching recorded call.
  // auctionIndex is zero-based in practiceAuction (including Passes); seat disambiguates
  // repeated turns by the same player. Notes do not change bidding eligibility.
  practiceGuidance?: { auctionIndex: number; seat: Seat; text: string }[];
  // Competitive practice may fix either or both opposing hands when the setup needs them.
  dealer?: Seat;
  west?: Record<Suit, string>;
  east?: Record<Suit, string>;
  // Explicitly recorded overcall expectations use the call at auction index 1.
  expectedOvercallCalls?: RuleTestExpectedCall[];
  rejectedOvercallCalls?: Call[];
  expectedOvercallCallOrder?: [Call, Call][];
  expectedAdvanceCalls?: RuleTestExpectedCall[];
  rejectedAdvanceCalls?: Call[];
  expectedAdvanceCallOrder?: [Call, Call][];
  expectedOvercallerRebidCalls?: RuleTestExpectedCall[];
  rejectedOvercallerRebidCalls?: Call[];
  expectedOvercallerRebidCallOrder?: [Call, Call][];
  // Each expected call/rule pair is an assertion of what we should see.
  requiredSystem?: Partial<BiddingSystem>;
  expectedOpeningCalls?: RuleTestExpectedCall[];
  expectedResponseCalls?: RuleTestExpectedCall[];
  expectedOpenerRebidCalls?: RuleTestExpectedCall[];
  // These calls must be absent from the final candidate list; they need not have been generated.
  rejectedOpeningCalls?: Call[];
  rejectedResponseCalls?: Call[];
  rejectedOpenerRebidCalls?: Call[];
  // Each pair requires both calls to survive, with the first appearing before the second.
  expectedOpeningCallOrder?: [Call, Call][];
  expectedResponseCallOrder?: [Call, Call][];
  expectedOpenerRebidCallOrder?: [Call, Call][];
  north: Record<Suit, string>;
  south: Record<Suit, string>;
}

export interface RuleTestExpectedCall {
  call: Call;
  ruleIds: string[];
}

/// Preserve existing array exports for the test runner and other consumers.
export {
  OPENING_BID_TEST_DEALS,
  ADVANCER_AFTER_ONE_LEVEL_SUIT_OVERCALL_TEST_DEALS,
  ADVANCER_AFTER_TWO_LEVEL_SUIT_OVERCALL_TEST_DEALS,
  ADVANCER_AFTER_TAKEOUT_DOUBLE_TEST_DEALS,
  ADVANCER_AFTER_NATURAL_1NT_OVERCALL_TEST_DEALS,
  ADVANCER_AFTER_RESPONDER_RAISE_OVERCALL_TEST_DEALS,
  ADVANCER_AFTER_RESPONDER_RAISE_TAKEOUT_DOUBLE_TEST_DEALS,
  ADVANCER_AFTER_RESPONDER_NATURAL_ACTION_OVERCALL_TEST_DEALS,
  ADVANCER_AFTER_RESPONDER_NATURAL_ACTION_TAKEOUT_DOUBLE_TEST_DEALS,
  ADVANCER_AFTER_NEGATIVE_DOUBLE_TEST_DEALS,
  ADVANCER_AFTER_TAKEOUT_REDOUBLE_TEST_DEALS,
  ADVANCER_AFTER_JUMP_OVERCALL_TEST_DEALS,
  DONT_1NT_DEFENSE_TEST_DEALS,
  SIMPLE_OVERCALL_TEST_DEALS,
  TAKEOUT_DOUBLE_TEST_DEALS,
  WEAK_TWO_2NT_CONTINUATION_TEST_DEALS,
  WEAK_TWO_DEFENSE_TEST_DEALS,
  NATURAL_1NT_OVERCALL_TEST_DEALS, NATURAL_1NT_OVERCALL_REBID_TEST_DEALS,
  NATURAL_SUIT_OVERCALL_REBID_TEST_DEALS,
  PREEMPTIVE_JUMP_OVERCALL_TEST_DEALS,
  RESPONSE_AFTER_MINOR_OPENING_TEST_DEALS,
  RESPONSE_AFTER_MAJOR_OPENING_TEST_DEALS,
  RESPONSE_AFTER_1NT_OPENING_TEST_DEALS,
  RESPONSE_AFTER_2NT_OPENING_TEST_DEALS,
  RESPONSE_TO_STRONG_2C_TEST_DEALS,
  RESPONSE_TO_WEAK_PREEMPT_TEST_DEALS,
  RESPONDER_AFTER_SUIT_OVERCALL_TEST_DEALS,
  RESPONDER_AFTER_TAKEOUT_DOUBLE_TEST_DEALS,
  RESPONDER_AFTER_1NT_OVERCALL_TEST_DEALS,
  RESPONDER_AFTER_JUMP_OVERCALL_TEST_DEALS,
  OPENER_REBID_AFTER_MINOR_1NT_TEST_DEALS,
  OPENER_REBID_AFTER_MINOR_ONE_LEVEL_NEW_SUIT_TEST_DEALS,
  OPENER_REBID_AFTER_MINOR_STANDARD_TWO_LEVEL_NEW_SUIT_TEST_DEALS,
  OPENER_REBID_AFTER_MINOR_TWO_OVER_ONE_NEW_SUIT_TEST_DEALS,
  OPENER_REBID_AFTER_MINOR_RAISE_TEST_DEALS,
  OPENER_REBID_AFTER_MINOR_2NT_TEST_DEALS,
  OPENER_REBID_AFTER_MINOR_3NT_TEST_DEALS,
  OPENER_REBID_AFTER_MAJOR_1NT_TEST_DEALS,
  OPENER_REBID_AFTER_MAJOR_ONE_LEVEL_NEW_SUIT_TEST_DEALS,
  OPENER_REBID_AFTER_MAJOR_STANDARD_TWO_LEVEL_NEW_SUIT_TEST_DEALS,
  OPENER_REBID_AFTER_MAJOR_TWO_OVER_ONE_NEW_SUIT_TEST_DEALS,
  OPENER_REBID_AFTER_MAJOR_JACOBY_2NT_TEST_DEALS,
  OPENER_REBID_AFTER_MAJOR_SPLINTER_TEST_DEALS,
  OPENER_REBID_AFTER_JUMP_SHIFT_TEST_DEALS,
  OPENER_REBID_AFTER_MAJOR_GAME_RESPONSE_TEST_DEALS,
  OPENER_REBID_AFTER_MAJOR_LIMIT_RAISE_TEST_DEALS,
  OPENER_REBID_AFTER_MAJOR_SIMPLE_RAISE_TEST_DEALS,
  OPENER_REBID_AFTER_1NT_OPENING_TEST_DEALS,
  OPENER_REBID_AFTER_2NT_OPENING_TEST_DEALS,
  OPENER_REBID_AFTER_INTERFERENCE_TEST_DEALS,
};

/// Bucket order is the display order, within and across groups. Keep the ordinary opener-rebid
/// exercises first so the selector begins with useful connected bidding practice. The 'all'
/// selection concatenates compatible deals in this same order.
export const RULE_TEST_DEAL_BUCKETS = [
  { id: 'minor-1nt', group: 'Rebidding', label: 'Minor - 1NT response',
    deals: OPENER_REBID_AFTER_MINOR_1NT_TEST_DEALS },
  { id: 'opener-after-interference', group: 'Rebidding',
    label: 'After interference - selected', practiceStages: ['openerRebid'] as BidStage[],
    deals: OPENER_REBID_AFTER_INTERFERENCE_TEST_DEALS },
  { id: 'nt-1nt', group: 'Rebidding', label: '1NT opening - continuations',
    deals: OPENER_REBID_AFTER_1NT_OPENING_TEST_DEALS },
  { id: 'nt-2nt', group: 'Rebidding', label: '2NT opening - continuations',
    deals: OPENER_REBID_AFTER_2NT_OPENING_TEST_DEALS },
  { id: 'minor-raise', group: 'Rebidding', label: 'Minor - raise',
    deals: OPENER_REBID_AFTER_MINOR_RAISE_TEST_DEALS },
  { id: 'minor-2nt', group: 'Rebidding', label: 'Minor - 2NT response',
    deals: OPENER_REBID_AFTER_MINOR_2NT_TEST_DEALS },
  { id: 'minor-3nt', group: 'Rebidding', label: 'Minor - 3NT response',
    deals: OPENER_REBID_AFTER_MINOR_3NT_TEST_DEALS },
  { id: 'minor-one-level-new-suit', group: 'Rebidding', label: 'Minor - one-level new suit',
    deals: OPENER_REBID_AFTER_MINOR_ONE_LEVEL_NEW_SUIT_TEST_DEALS },
  { id: 'minor-standard-two-level-new-suit', group: 'Rebidding',
    label: 'Minor - Standard two-level new suit',
    deals: OPENER_REBID_AFTER_MINOR_STANDARD_TWO_LEVEL_NEW_SUIT_TEST_DEALS },
  { id: 'minor-two-over-one-new-suit', group: 'Rebidding',
    label: 'Minor - 2/1 two-level new suit',
    deals: OPENER_REBID_AFTER_MINOR_TWO_OVER_ONE_NEW_SUIT_TEST_DEALS },
  { id: 'major-1nt', group: 'Rebidding', label: 'Major - 1NT response',
    deals: OPENER_REBID_AFTER_MAJOR_1NT_TEST_DEALS },
  { id: 'major-one-level-new-suit', group: 'Rebidding', label: 'Major - one-level new suit',
    deals: OPENER_REBID_AFTER_MAJOR_ONE_LEVEL_NEW_SUIT_TEST_DEALS },
  { id: 'major-standard-two-level-new-suit', group: 'Rebidding',
    label: 'Major - Standard two-level new suit',
    deals: OPENER_REBID_AFTER_MAJOR_STANDARD_TWO_LEVEL_NEW_SUIT_TEST_DEALS },
  { id: 'major-two-over-one-new-suit', group: 'Rebidding',
    label: 'Major - 2/1 two-level new suit',
    deals: OPENER_REBID_AFTER_MAJOR_TWO_OVER_ONE_NEW_SUIT_TEST_DEALS },
  { id: 'major-jacoby-2nt', group: 'Rebidding', label: 'Major - Jacoby 2NT',
    deals: OPENER_REBID_AFTER_MAJOR_JACOBY_2NT_TEST_DEALS },
  { id: 'major-splinter', group: 'Rebidding', label: 'Major - splinter',
    deals: OPENER_REBID_AFTER_MAJOR_SPLINTER_TEST_DEALS },
  { id: 'jump-shift', group: 'Rebidding', label: 'Jump shifts',
    deals: OPENER_REBID_AFTER_JUMP_SHIFT_TEST_DEALS },
  { id: 'major-simple-raise', group: 'Rebidding', label: 'Major - simple raise',
    deals: OPENER_REBID_AFTER_MAJOR_SIMPLE_RAISE_TEST_DEALS },
  { id: 'major-limit-raise', group: 'Rebidding', label: 'Major - limit raise',
    deals: OPENER_REBID_AFTER_MAJOR_LIMIT_RAISE_TEST_DEALS },
  { id: 'major-game-response', group: 'Rebidding', label: 'Major - game response',
    deals: OPENER_REBID_AFTER_MAJOR_GAME_RESPONSE_TEST_DEALS },
  { id: 'opening-bids', group: 'Opening', label: 'Opening selection',
    deals: OPENING_BID_TEST_DEALS },
  { id: 'response-after-suit-overcall', group: 'Responding',
    label: 'After natural suit overcall', practiceStages: ['responding'] as BidStage[],
    deals: RESPONDER_AFTER_SUIT_OVERCALL_TEST_DEALS },
  { id: 'response-after-takeout-double', group: 'Responding',
    label: 'After takeout double', practiceStages: ['responding'] as BidStage[],
    deals: RESPONDER_AFTER_TAKEOUT_DOUBLE_TEST_DEALS },
  { id: 'response-after-1nt-overcall', group: 'Responding',
    label: 'After natural 1NT overcall', practiceStages: ['responding'] as BidStage[],
    deals: RESPONDER_AFTER_1NT_OVERCALL_TEST_DEALS },
  { id: 'response-after-jump-overcall', group: 'Responding',
    label: 'After preemptive jump overcall', practiceStages: ['responding'] as BidStage[],
    deals: RESPONDER_AFTER_JUMP_OVERCALL_TEST_DEALS },
  { id: 'response-minor-opening', group: 'Responding', label: 'Minor opening',
    deals: RESPONSE_AFTER_MINOR_OPENING_TEST_DEALS },
  { id: 'response-major-opening', group: 'Responding', label: 'Major opening',
    deals: RESPONSE_AFTER_MAJOR_OPENING_TEST_DEALS },
  { id: 'response-1nt-opening', group: 'Responding', label: '1NT opening',
    deals: RESPONSE_AFTER_1NT_OPENING_TEST_DEALS },
  { id: 'response-2nt-opening', group: 'Responding', label: '2NT opening',
    deals: RESPONSE_AFTER_2NT_OPENING_TEST_DEALS },
  { id: 'response-strong-2c', group: 'Responding', label: 'Strong 2C',
    deals: RESPONSE_TO_STRONG_2C_TEST_DEALS },
  { id: 'response-weak-preempt', group: 'Responding', label: 'Weak preempts',
    deals: RESPONSE_TO_WEAK_PREEMPT_TEST_DEALS },
  { id: 'overcall-dont-1nt', group: 'Overcalling', label: 'DONT over strong 1NT',
    practiceStages: ['overcalling', 'advancing', 'overcallerRebid'] as BidStage[],
    deals: DONT_1NT_DEFENSE_TEST_DEALS },
  { id: 'overcall-simple', group: 'Overcalling', label: 'Simple suit overcalls',
    practiceStages: ['overcalling'] as BidStage[], deals: SIMPLE_OVERCALL_TEST_DEALS },
  { id: 'overcall-takeout-double', group: 'Overcalling', label: 'Takeout doubles',
    practiceStages: ['overcalling'] as BidStage[], deals: TAKEOUT_DOUBLE_TEST_DEALS },
  { id: 'overcall-weak-two-defense', group: 'Overcalling', label: 'Defense to weak two openings',
    practiceStages: ['overcalling'] as BidStage[], deals: WEAK_TWO_DEFENSE_TEST_DEALS },
  { id: 'overcall-weak-two-2nt', group: 'Overcalling', label: '2NT over weak two — systems on',
    practiceStages: ['overcalling', 'advancing', 'overcallerRebid'] as BidStage[],
    deals: WEAK_TWO_2NT_CONTINUATION_TEST_DEALS },
  { id: 'overcall-1nt', group: 'Overcalling', label: 'Natural 1NT',
    practiceStages: ['overcalling'] as BidStage[], deals: NATURAL_1NT_OVERCALL_TEST_DEALS },
  { id: 'overcall-1nt-rebid', group: 'Overcalling', label: 'Natural 1NT continuations',
    practiceStages: ['overcalling', 'advancing', 'overcallerRebid'] as BidStage[],
    deals: NATURAL_1NT_OVERCALL_REBID_TEST_DEALS },
  { id: 'overcall-suit-rebid', group: 'Overcalling', label: 'Natural suit continuations',
    practiceStages: ['overcalling', 'advancing', 'overcallerRebid'] as BidStage[],
    deals: NATURAL_SUIT_OVERCALL_REBID_TEST_DEALS },
  { id: 'overcall-preemptive-jump', group: 'Overcalling', label: 'Preemptive jump overcalls',
    practiceStages: ['overcalling'] as BidStage[], deals: PREEMPTIVE_JUMP_OVERCALL_TEST_DEALS },
  { id: 'advance-one-level-suit-overcall', group: 'Advancing',
    label: 'After natural one-level suit overcall', practiceStages: ['advancing'] as BidStage[],
    deals: ADVANCER_AFTER_ONE_LEVEL_SUIT_OVERCALL_TEST_DEALS },
  { id: 'advance-two-level-suit-overcall', group: 'Advancing',
    label: 'After natural two-level suit overcall', practiceStages: ['advancing'] as BidStage[],
    deals: ADVANCER_AFTER_TWO_LEVEL_SUIT_OVERCALL_TEST_DEALS },
  { id: 'advance-takeout-double', group: 'Advancing',
    label: 'After takeout double', practiceStages: ['advancing'] as BidStage[],
    deals: ADVANCER_AFTER_TAKEOUT_DOUBLE_TEST_DEALS },
  { id: 'advance-natural-1nt-overcall', group: 'Advancing',
    label: 'After natural 1NT overcall', practiceStages: ['advancing'] as BidStage[],
    deals: ADVANCER_AFTER_NATURAL_1NT_OVERCALL_TEST_DEALS },
  { id: 'advance-after-responder-raise-overcall', group: 'Advancing',
    label: 'After responder raises — suit overcall', practiceStages: ['advancing'] as BidStage[],
    deals: ADVANCER_AFTER_RESPONDER_RAISE_OVERCALL_TEST_DEALS },
  { id: 'advance-after-responder-raise-double', group: 'Advancing',
    label: 'After responder raises — takeout double', practiceStages: ['advancing'] as BidStage[],
    deals: ADVANCER_AFTER_RESPONDER_RAISE_TAKEOUT_DOUBLE_TEST_DEALS },
  { id: 'advance-after-responder-action-overcall', group: 'Advancing',
    label: 'After responder new suit/1NT — suit overcall',
    practiceStages: ['advancing'] as BidStage[],
    deals: ADVANCER_AFTER_RESPONDER_NATURAL_ACTION_OVERCALL_TEST_DEALS },
  { id: 'advance-after-responder-action-double', group: 'Advancing',
    label: 'After responder new suit/1NT — takeout double',
    practiceStages: ['advancing'] as BidStage[],
    deals: ADVANCER_AFTER_RESPONDER_NATURAL_ACTION_TAKEOUT_DOUBLE_TEST_DEALS },
  { id: 'advance-after-negative-double', group: 'Advancing',
    label: 'After responder negative Double', practiceStages: ['advancing'] as BidStage[],
    deals: ADVANCER_AFTER_NEGATIVE_DOUBLE_TEST_DEALS },
  { id: 'advance-after-takeout-redouble', group: 'Advancing',
    label: 'After responder Redouble', practiceStages: ['advancing'] as BidStage[],
    deals: ADVANCER_AFTER_TAKEOUT_REDOUBLE_TEST_DEALS },
  { id: 'advance-jump-overcall', group: 'Advancing',
    label: 'After preemptive jump overcall', practiceStages: ['advancing'] as BidStage[],
    deals: ADVANCER_AFTER_JUMP_OVERCALL_TEST_DEALS },
] as const;

/// RuleTestDealBucketId is 'all' plus every id declared in RULE_TEST_DEAL_BUCKETS.
/// In `typeof RULE_TEST_DEAL_BUCKETS[number]['id']`, `number` means any numeric array index,
/// so TypeScript considers every possible bucket element; `['id']` is an indexed property access
/// that extracts each element's `id` property.  `id` is not a TypeScript keyword: if the bucket
/// property were named `foo`, this expression would use `['foo']`.  Adding a bucket therefore
/// automatically adds its id to this type without maintaining a second list.
export type RuleTestDealBucketId = 'all' | typeof RULE_TEST_DEAL_BUCKETS[number]['id'];

/// Bidding rules are grouped into logical buckets, such as opener rebids after a minor opening
/// and 1NT response or opener rebids after a major opening and simple raise.  Each bucket owns an
/// array of test deals chosen to exercise the rules in that group.  'all' means the test deals
/// from all buckets that are compatible with the active bidding system; it does not mean every
/// test deal regardless of its required system settings.
export function getRulesBucketTestDeals (bucketId: RuleTestDealBucketId,
                                         system: BiddingSystem): RuleTestDeal[] {
  const buckets = bucketId === 'all'
    ? RULE_TEST_DEAL_BUCKETS
    : RULE_TEST_DEAL_BUCKETS.filter((bucket) => bucket.id === bucketId);
  return buckets.flatMap((bucket) => bucket.deals.filter((deal) => dealIsCompatible(deal, system)));
}

function dealIsCompatible (deal: RuleTestDeal, system: BiddingSystem): boolean {
  const requiredSystem = deal.requiredSystem;
  if (requiredSystem === undefined) {
    return true;
  }
  return (Object.keys(requiredSystem) as (keyof BiddingSystem)[])
    .every((setting) => system[setting] === requiredSystem[setting]);
}
