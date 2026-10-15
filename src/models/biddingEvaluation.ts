/// Bidding-rule selection, student-call feedback, and next-turn interaction status.
/// Rule evaluation is shared by the feedback and status operations; neither mutates the auction.

import { type AdvancerCallContext, type AuctionContext, type BidRule, type Call,
         type HandConstraint, type PointRange, type TotalPointsRange, type SuitLengthConstraint,
         type BiddingSystem, type BiddingAgreement, type HandShapeConstraint, type RuleEvalContext,
         type AppliesWhenResult, type BidStage, type ResponderCallContext, oneNtResponseHcpShift }
  from './bidding-types';
import { getHandFacts, type Board, type HandFacts, type Suit } from './cards';
import { auctionIsComplete, getNextBiddingRuleStage, getNextSeat, getOpeningCallInfo,
         getOpeningPartnershipCalls, getPartnerOpeningCall, getResponderCall,
         isUnjudgedInterveningTurn,
         getStrainFromSuitBid, isCallAvailableInAuction, isContractBid, parseSuitBid, responseJump,
         getAdvancerCallKindForOpenerRebid, getInterferenceAfterOpening,
         getOpponentNaturallyBidSuitsForOpenerRebid, getPartnerOneNtSuitInterference }
  from './auction';
import { AdvanceRules, OpeningBidRules, OpenerRebidRules, OvercallRules, ResponseBidRules,
         ResponderRebidRules }
  from './bidding-rules';
import { hasBasicSuitStopper } from './common-rule-helpers';


//// Bidding Input
///

export function normalizeCallInput (input: string): Call | null {
  const trimmed = input.trim().toUpperCase();
  if (trimmed === '') return null;
  if (trimmed === 'P' || trimmed === 'PASS') {
    return 'Pass';
  }
  if (trimmed === 'X' || trimmed === 'DOUBLE') {
    return 'Double';
  }
  if (trimmed === 'XX' || trimmed === 'REDOUBLE') {
    return 'Redouble';
  }
  if (isContractBid(trimmed as Call)) {
    return trimmed as Call;
  }
  return null;
}

///
//// Public Evaluation API
///

/// Rules selected and checked for the next bidder's hand, the actual auction, and agreements.
/// It includes successful rule matches and explanations for rules that did not qualify.
export interface CurrentContextRules {
  // Rules qualifying after agreement, auction context, candidate-call, hand, and suppression
  // checks. Includes applicable scope boundaries, which do not produce concrete calls.
  applicableRules: BidRule[];
  // Details of considered rules (including unsuccessful matches), their generated calls,
  // qualification flags, and per-rule explanations. Initial context-filter failures are excluded.
  ruleDiagnostics: RuleEvalResult[];
  // Human-readable trace for diagnostics, not a mutable global report.
  telemetryLines: string[];
}

/// Student-call assessment adds the actual submitted call and the rules whose qualifying
/// candidate calls match it. No single 'best bid' is imposed on the student.
export interface BidEvalResult extends CurrentContextRules {
  normalizedCall: Call | null;
  // Applicable concrete-call rules matching the submitted call; excludes scope boundaries.
  userCallMatchingRules: BidRule[];
}

/// Diagnostic outcome of one rule after agreement and auction-context filtering.
/// Each rule can refine into multiple concrete candidate calls, not all of which qualify.
export interface RuleEvalResult {
  rule: BidRule;
  // Each generated legal call and its hand-specific qualification result.
  candidates: CandidateCallMatch[];
  // True when at least one candidate qualifies, or a scopeBoundary's predicate succeeds.
  // Later cross-rule suppressions can turn this false even after an initial match.
  ruleApplies: boolean;
  // Detailed rule-specific trace, including unsuccessful candidate checks.
  telemetryLines: string[];
}

/// One candidate call generated from a rule, after auction-dependent refinement.
export interface CandidateCallMatch {
  rule: BidRule;
  call: Call;
  // Whether this call satisfies the rule for the current hand, after suppressions.
  ruleApplies: boolean;
  telemetryLines: string[];
}


/// Collect the actual legal calls that qualified in a rule-selection result. Scope boundaries
/// are intentionally excluded because they describe judgment limits rather than recommend calls.
export function getApplicableCandidateCalls (result: CurrentContextRules): CandidateCallMatch[] {
  const candidates: CandidateCallMatch[] = [];
  for (const ruleResult of result.ruleDiagnostics) {
    for (const candidate of ruleResult.candidates) {
      if (candidate.ruleApplies) {
        candidates.push(candidate);
      }
    }
  }
  return candidates;
}


/// Select and assess bidding rules for the next physical turn, without a student call.
/// "Current context" is the full auction, the hand of the next bidder, and the agreements.
///
/// Rule-selection flow:
///   1. Derive the next seat, hand, and modeled bidding-rule stage from the auction.
///   2. Select the rule bucket for that stage (empty when there is no modeled stage).
///   3. Filter rules by the partnership's selected bidding agreements.
///   4. Filter rules by auction-context conditions.
///   5. For every surviving rule, generate/refine candidate calls, check legal availability
///      and hand-specific appliesWhen requirements, and retain diagnostics for every candidate.
///   6. Apply cross-rule suppressions (convenient minors, Pass/NT fallbacks, conventions,
///      major responses, and scope boundaries) to reconcile overlapping rules.
///   7. Order the results by priority.rank for presentation, without dropping lower-ranked bids.
///
/// Returns applicableRules and ruleDiagnostics plus a human-readable trace. Neither auction
/// nor UI state changes. evaluateUserCall uses the same selection to assess student input;
/// getBiddingTurnStatus uses it to identify supported calls, boundaries, and missing treatments.
export function getRulesForCurrentContext (board: Board, auction: Call[],
                                           system: BiddingSystem): CurrentContextRules {
  const context = makeRuleEvalContext(board, auction);
  const telemetryLines: string[] = [];
  telemetryLines.push(`getRulesForCurrentContext: ${context.seat}; stage=${context.stage}.`);
  // Select the rule bucket from the model-derived bidding stage, then apply partnership agreements.
  const stageRules = getRulesForStage(context.stage);
  const activeRules = getActiveBiddingRules(stageRules, system);
  let ruleDiagnostics = evaluateRules(activeRules, context, system);
  // Opening rules have a few relationships that cannot be expressed by evaluating each rule
  // independently.
  if (context.stage === 'opening') {
    ruleDiagnostics = maybeSuppressConvenientMinor(ruleDiagnostics);
    ruleDiagnostics = maybeSuppressPassWithoutOtherAction(ruleDiagnostics,
      'open-pass-no-qualifying-action');
  }
  if (context.stage === 'overcalling') {
    ruleDiagnostics = maybeSuppressPassWithoutOtherAction(ruleDiagnostics,
      'overcall-pass-no-qualifying-action');
  }
  // When responding to a natural notrump opening, a preferred suit action makes direct Pass/notrump
  // only a fallback bid.  Derive partner's opening only for this response-stage behavior.
  const partnerOpeningCall = context.stage === 'responding'
    ? getPartnerOpeningCall(context.dealer, context.auction, context.seat)
    : null;
  const sharedOneNtResponse = ruleDiagnostics.some((result) =>
    result.rule.auctionContext?.partnerNaturalOneNt === true);
  const weakTwoTwoNtResponse = ruleDiagnostics.some((result) =>
    result.rule.auctionContext?.partnerNaturalTwoNtOverWeakTwo === true);
  if (sharedOneNtResponse || weakTwoTwoNtResponse || partnerOpeningCall === '2NT') {
    ruleDiagnostics = maybeSuppressTransfersForStayman(ruleDiagnostics); // jacoby vs stayman
    ruleDiagnostics = maybeSuppressOneFiveOrMoreMajorTransfer(ruleDiagnostics, context, system);
    ruleDiagnostics = maybeSuppressJacobyForDirectMajorSlam(ruleDiagnostics);
    ruleDiagnostics = maybeSuppressJacobyForMajorGame(ruleDiagnostics); // jacoby vs major game (and texas)
    // Order matters for this last call; declarations make the previous suppressors mutually clean.
    ruleDiagnostics = maybeSuppressNtResponseFallback(ruleDiagnostics); // fallback pass or NT
  }
  // Suppress 1NT when one of a major is better.
  if (context.stage === 'responding') {
    ruleDiagnostics = maybeSuppress1NTWhenMajorSupport(ruleDiagnostics);
    ruleDiagnostics = maybeSuppressPassWithoutOtherAction(ruleDiagnostics,
      'respond-over-1nt-pass-no-constructive-action');
  }
  ruleDiagnostics = maybeSuppressScopeBoundaryWhenBidApplies(ruleDiagnostics);
  // Higher rank means greater preference among qualifying rules.  Ranking changes presentation
  // order only; it does not eliminate lower-ranked qualifying rules.
  ruleDiagnostics.sort((left, right) =>
    (right.rule.priority?.rank ?? 0) - (left.rule.priority?.rank ?? 0));

  const applicableRules = ruleDiagnostics
    .filter((result) => result.ruleApplies)
    .map((result) => result.rule);
  for (const ruleResult of ruleDiagnostics) {
    telemetryLines.push(...ruleResult.telemetryLines);
  }
  telemetryLines.push(`Applicable rule count: ${applicableRules.length}.`);
  return { applicableRules, ruleDiagnostics, telemetryLines };
}

/// Judge one submitted call against the rules selected for the next bidder's actual context.
/// Match the call against qualifying candidate calls (not merely a rule's declared calls),
/// retain alternative qualified bids and all diagnostics, and report why a call did not match.
/// Uses getRulesForCurrentContext, so student feedback and turn-status checks apply the same
/// agreement, auction-context, hand, and suppression decisions.
export function evaluateUserCall (inputCall: Call, board: Board, auction: Call[],
                                  system: BiddingSystem): BidEvalResult {
  const currentRules = getRulesForCurrentContext(board, auction, system);
  const matchingRulesForUserCall: BidRule[] = [];
  for (const ruleResult of currentRules.ruleDiagnostics) {
    if (ruleResult.candidates.some((candidate) =>
        candidate.ruleApplies && candidate.call === inputCall)) {
      matchingRulesForUserCall.push(ruleResult.rule);
    }
  }
  const boundary = currentRules.applicableRules.find((rule) => rule.kind === 'scopeBoundary');
  const telemetryLines = [
    `evaluateUserCall: ${inputCall}; stage=${getNextBiddingRuleStage(board.dealer, auction)}.`,
    ...currentRules.telemetryLines,
    matchingRulesForUserCall.length === 0
      ? boundary === undefined
        ? `User call ${inputCall} did not satisfy any currently applicable rule.`
        : `Scope boundary ${boundary.id} applies; ${inputCall} is not judged by a candidate rule.`
      : `User call ${inputCall} satisfied ${matchingRulesForUserCall.length} rule(s).`,
  ];
  return {
    ...currentRules,
    normalizedCall: inputCall,
    userCallMatchingRules: matchingRulesForUserCall,
    telemetryLines,
  };
}


//// Next bidding-turn status

/// Whether the trainer can judge the next turn, allow an unjudged intervening call, or stop.
/// This is derived from the actual auction and rules; it is not a persisted React state, a
/// bidding role, or an indication that the recorded practice exercise has ended.
export type BiddingTurnStatus =
  // Actual bridge auction ended (four opening Passes or three Passes after a contract).
  | { kind: 'auctionComplete' }
  // A modeled stage has at least one concrete candidate bid that qualifies for this hand.
  | { kind: 'supported'; stage: BidStage }
  // A rule explicitly explains why the trainer cannot select further calls here.
  | { kind: 'scopeBoundary'; stage: BidStage; rule: BidRule }
  // A modeled stage exists, but no concrete rule or explanatory boundary qualifies.
  // Treat this as a missing rule treatment, not successful termination.
  | { kind: 'noApplicableRule'; stage: BidStage }
  // No modeled bidding-rule stage exists for this physical turn.
  | { kind: 'noModeledStage' }
  // A specifically recognized intervening turn is entered legally but not judged. The current
  // system permits this only for two opponent turns in an uncontested opening partnership auction.
  | { kind: 'unjudgedTurn' };

/// Determine what interaction the trainer can offer for the next physical auction turn.
/// The bidder's stage comes from getNextBiddingRuleStage; a stage alone does not guarantee that
/// a rule qualifies for the hand. Distinguish a missing rule from an explicit scope boundary.
export function getBiddingTurnStatus (board: Board, auction: Call[],
                                      system: BiddingSystem): BiddingTurnStatus {
  if (auctionIsComplete(auction)) return { kind: 'auctionComplete' };
  const stage = getNextBiddingRuleStage(board.dealer, auction);
  if (stage === null) {
    return isUnjudgedInterveningTurn(board.dealer, auction)
      ? { kind: 'unjudgedTurn' }
      : { kind: 'noModeledStage' };
  }

  const currentRules = getRulesForCurrentContext(board, auction, system);
  if (getApplicableCandidateCalls(currentRules).length > 0) return { kind: 'supported', stage };
  const boundary = currentRules.applicableRules.find((rule) => rule.kind === 'scopeBoundary');
  if (boundary !== undefined) return { kind: 'scopeBoundary', stage, rule: boundary };
  return { kind: 'noApplicableRule', stage };
}


/// A forcing bid was just entered at the end of the trainer's modeled depth.
/// Its obligation remains real even though this app has no general opener-third-bid
/// or advancer-rebid stage.  Determined from a *qualifying* prior rule, not merely
/// from the level, bid label, or assumption that every legal call is correct.
export type UnmodeledContinuationForce = {
  kind: 'gameForce' | 'oneRoundForce';
  lastStage: 'responderRebid' | 'balancing';
};

/// Check the last actual call only when the next turn has no modeled rule stage.
/// This intentionally does not infer forcing meanings from unrelated past calls.
/// A bid after which game is already reached need not force any further action.
export function getUnmodeledContinuationForce (board: Board, auction: Call[],
                                              system: BiddingSystem): UnmodeledContinuationForce | null {
  if (auction.length === 0 || auctionIsComplete(auction) ||
      getNextBiddingRuleStage(board.dealer, auction) !== null) return null;
  const beforeLastCall = auction.slice(0, -1);
  const lastStage = getNextBiddingRuleStage(board.dealer, beforeLastCall);
  if (lastStage !== 'responderRebid' && lastStage !== 'balancing') return null;
  const lastCall = auction[auction.length - 1];
  if (lastCall === undefined) return null;
  const matchingRules = evaluateUserCall(lastCall, board, beforeLastCall, system)
    .userCallMatchingRules;
  // 'gameForcing' on the last call is meaningful only while game has not yet
  // been reached.  Standard game levels are 3NT, 4M, and 5m.
  const bid = parseSuitBid(lastCall);
  const atGame = bid !== null && (bid.strain === 'NT' ? bid.level >= 3 :
    bid.strain === 'H' || bid.strain === 'S' ? bid.level >= 4 : bid.level >= 5);
  if (! atGame && matchingRules.some((rule) => rule.callCategory?.includes('gameForcing'))) {
    return { kind: 'gameForce', lastStage };
  }
  if (matchingRules.some((rule) => rule.callCategory?.includes('forcing'))) {
    return { kind: 'oneRoundForce', lastStage };
  }
  return null;
}

//// Evaluation context and stage rule selection
/// makeRuleEvalContext derives rule inputs from the board and auction.  The caller supplies the
/// board and authoritative full auction; model code derives the acting seat, hand, and stage.
/// More specific auction facts are queried from auction.ts only by rules/evaluator code that needs
/// them rather than being precomputed into every RuleEvalContext.
///
export function makeRuleEvalContext (board: Board, auction: Call[]): RuleEvalContext {
  const seat = getNextSeat(board.dealer, auction);
  const hand = board.deal[seat];
  return {
    dealer: board.dealer,
    seat,
    stage: getNextBiddingRuleStage(board.dealer, auction),
    auction,
    hand,
    handFacts: getHandFacts(hand),
  };
}

/// getRulesForStage chooses the relevant rule bucket before hand evaluation. A missing stage
/// deliberately selects no rules; termination policy is handled separately.
export function getRulesForStage (stage: BidStage | null): BidRule[] {
  switch (stage) {
    case 'opening':
      return OpeningBidRules;
    case 'responding':
      return ResponseBidRules;
    case 'openerRebid':
      return OpenerRebidRules;
    case 'overcalling':
    case 'balancing':
    case 'overcallerRebid':
      return OvercallRules;
    case 'advancing':
      return AdvanceRules;
    case 'responderRebid':
      return ResponderRebidRules;
    case null:
      return [];
  }
}

//// Individual rule and candidate evaluation
/// evaluateRules filters the already-selected stage rules by auction context and evaluates the rule
/// against the hand.
///
export function evaluateRules (rules: BidRule[], context: RuleEvalContext,
                               system: BiddingSystem): RuleEvalResult[] {
  return rules
    .filter((rule) => auctionContextMatches(rule.auctionContext, context))
    .map((rule) => evaluateRule(rule, context, system));
}

function evaluateRule (rule: BidRule, context: RuleEvalContext,
                       system: BiddingSystem): RuleEvalResult {
  const telemetryLines: string[] = [];
  const candidates: CandidateCallMatch[] = [];
  telemetryLines.push(`Rule ${rule.id}: ${rule.title}.`);
  if (rule.kind === 'scopeBoundary') {
    const result = rule.scopeBoundaryWhen === undefined
      ? { success: true, telemetryLines: ['Scope boundary applies to this auction context.'] }
      : rule.scopeBoundaryWhen(context, system);
    telemetryLines.push(...result.telemetryLines.map((line) => `  ${line}`));
    telemetryLines.push(result.success
      ? '  PASS: scope boundary reached; no candidate call is created.'
      : '  FAIL: scope boundary does not apply to this hand.');
    return { rule, candidates, ruleApplies: result.success, telemetryLines };
  }
  const callResult = getRuleCalls(rule, context, system);
  const calls = callResult.calls;
  telemetryLines.push(...callResult.telemetryLines.map((line) => `  ${line}`));
  if (calls.length === 0) {
    telemetryLines.push('  FAIL: rule has no calls after call refinement.');
    return { rule, candidates, ruleApplies: false, telemetryLines };
  }
  telemetryLines.push(`  Rule has ${calls.length} candidate call(s): ${calls.join(', ')}.`);
  for (const call of calls) {
    const candidate = evaluateCandidateCall(rule, call, context, system);
    candidates.push(candidate);

    for (const line of candidate.telemetryLines) {
      telemetryLines.push(`  ${line}`);
    }
  }
  const pass = candidates.some((candidate) => candidate.ruleApplies);
  if (pass) {
    telemetryLines.push('  PASS: at least one call candidate matched.');
  } else {
    telemetryLines.push('  FAIL: no call candidate matched.');
  }
  return { rule, candidates, ruleApplies: pass, telemetryLines };
}


//// Agreement filtering
/// Returns the rules enabled by the current bidding agreements.  Rules without an agreement are
/// always enabled.  The bidding evaluator should receive this active rule set rather than decide
/// between agreement variants while evaluating a hand.
///
export function getActiveBiddingRules (rules: BidRule[], system: BiddingSystem): BidRule[] {
  return rules.filter((rule) => ruleIsEnabled(rule, system));
}

function ruleIsEnabled (rule: BidRule, system: BiddingSystem): boolean {
  if (rule.agreement === undefined) {
    return true;
  }
  return agreementMatchesSystem(rule.agreement, system);
}

function agreementMatchesSystem (agreement: BiddingAgreement, system: BiddingSystem): boolean {
  switch (agreement.setting) {
    case 'oneNtOpening':
      return system.oneNtOpening === agreement.value;
    case 'oneNtFiveCardLengthUpgrade':
      return system.oneNtFiveCardLengthUpgrade === agreement.value;
    case 'jumpShift':
      return system.jumpShift === agreement.value;
    case 'twoLevelNewSuitResponse':
      return system.twoLevelNewSuitResponse === agreement.value;
    case 'majorOneNtResponse':
      return system.majorOneNtResponse === agreement.value;
    case 'majorGameForceWithSupport':
      return system.majorGameForceWithSupport === agreement.value;
    case 'stayman':
      return system.stayman === agreement.value;
    case 'jacobyTransfers':
      return system.jacobyTransfers === agreement.value;
    case 'splinters':
      return system.splinters === agreement.value;
    case 'texasTransfers':
      return system.texasTransfers === agreement.value;
  }
}


//// Individual candidate qualification
/// evaluateCandidateCall evaluates one concrete call from one already auction-matched rule.  If
/// there is no appliesWhen, the call has no additional hand constraint.
///
function evaluateCandidateCall (rule: BidRule, call: Call, context: RuleEvalContext,
                                system: BiddingSystem): CandidateCallMatch {
  const telemetryLines: string[] = [];
  telemetryLines.push(`evaluateCandidateCall: Candidate ${call}.`);
  const appliesWhen = rule.appliesWhen;
  if (appliesWhen === undefined) {
    telemetryLines.push('PASS: no appliesWhen constraint.');
    return { rule, call, ruleApplies: true, telemetryLines };
  }

  let result: AppliesWhenResult;
  if (typeof appliesWhen === 'function') {
    result = appliesWhen(call, context, system);
  } else {
    result = evaluateHandConstraint(appliesWhen, call, context, system);
  }
  telemetryLines.push(...result.telemetryLines);
  if (result.success) {
    telemetryLines.push(`PASS: ${call} satisfies appliesWhen.`);
  } else {
    telemetryLines.push(`FAIL: ${call} does not satisfy appliesWhen.`);
  }
  return { rule, call, ruleApplies: result.success, telemetryLines };
}


//// Cross-rule suppression -- Pass and scope boundaries
/// A stage-specific Pass fallback must not compete with an already evaluated constructive call.
/// This avoids duplicating the suit, support, and convention requirements in each Pass rule.
function maybeSuppressPassWithoutOtherAction (ruleDiagnostics: RuleEvalResult[],
                                              passRuleId: string): RuleEvalResult[] {
  const passResult = ruleDiagnostics.find((result) =>
    result.rule.id === passRuleId && result.ruleApplies);
  if (passResult === undefined) return ruleDiagnostics;
  const competingCall = ruleDiagnostics.flatMap((result) => result.candidates)
    .find((candidate) => candidate.ruleApplies && candidate.call !== 'Pass');
  if (competingCall === undefined) return ruleDiagnostics;
  const suppressionLine = `SUPPRESSED: ${competingCall.call} qualifies instead of fallback Pass.`;
  for (const candidate of passResult.candidates) {
    if (candidate.ruleApplies) {
      candidate.ruleApplies = false;
      candidate.telemetryLines.push(suppressionLine);
    }
  }
  passResult.ruleApplies = false;
  passResult.telemetryLines.push(`  ${suppressionLine}`);
  return ruleDiagnostics;
}

/// A scope boundary is explanatory fallback, not a competing bid rule.  If any concrete modeled
/// call applies to the hand, suppress the boundary so normal bidding guidance wins.
function maybeSuppressScopeBoundaryWhenBidApplies (ruleDiagnostics: RuleEvalResult[]): RuleEvalResult[] {
  const concreteRuleApplies = ruleDiagnostics.some((result) =>
    result.rule.kind !== 'scopeBoundary' && result.ruleApplies &&
    result.candidates.some((candidate) => candidate.ruleApplies));
  if (! concreteRuleApplies) return ruleDiagnostics;
  for (const result of ruleDiagnostics) {
    if (result.rule.kind === 'scopeBoundary' && result.ruleApplies) {
      result.ruleApplies = false;
      result.telemetryLines.push('  SUPPRESSED: a concrete modeled call applies to this hand.');
    }
  }
  return ruleDiagnostics;
}

//// Cross-rule suppression -- Opening and 1NT response choices
/// maybeSuppressConvenientMinor takes all applicable rules for current auction and responder's hand
/// and removes a declarative qualifying convenient-minor opening when an already-evaluated natural
/// 1NT or 2NT opening applies.  We can't cause this mutual exclusion declaratively only, while some
/// better bids do naturally eliminate the fallback convenient minor.  Both the rule-level and
/// candidate-level applicability flags are changed so downstream code sees the convenient-minor
/// rule consistently as no longer applicable.
///
function maybeSuppressConvenientMinor (ruleDiagnostics: RuleEvalResult[]): RuleEvalResult[] {
  const convenientMinorResult = ruleDiagnostics.find((result) =>
    result.rule.id === 'open-convenient-minor' && result.ruleApplies);
  if (convenientMinorResult === undefined) {
    return ruleDiagnostics;
  }
  // We have a convenient minor, so see if there's a NT that trumps the minor rule :-).
  let naturalNtCall: Call | null = null;
  for (const result of ruleDiagnostics) {
    if (! result.rule.callCategory?.includes('natural')) {
      continue;
    }
    const ntCandidate = result.candidates.find((candidate) =>
      candidate.ruleApplies && (candidate.call === '1NT' || candidate.call === '2NT'));
    if (ntCandidate !== undefined) {
      naturalNtCall = ntCandidate.call;
      break;
    }
  }
  if (naturalNtCall === null) {
    return ruleDiagnostics;
  }
  // Telemetry
  const suppressionLine =
    `SUPPRESSED: ${naturalNtCall} applies to this hand, so do not use a convenient minor.`;
  // Supress convenient minor
  convenientMinorResult.ruleApplies = false;
  convenientMinorResult.telemetryLines.push(`  ${suppressionLine}`);
  for (const candidate of convenientMinorResult.candidates) {
    if (candidate.ruleApplies) {
      candidate.ruleApplies = false;
      candidate.telemetryLines.push(suppressionLine);
    }
  }
  return ruleDiagnostics;
} // maybeSuppressConvenientMinor()

/// The complete natural-1NT response-family routing map lives with the declarations in
/// natural-1nt-partner-calls.ts.  The suppressors below each own only one cross-rule overlap.
///
/// maybeSuppressTransfersForStayman resolves the 5-4-major overlap between ordinary Stayman and a
/// Jacoby transfer.  With enough strength and 5-4 majors, the replying hand uses Stayman first to
/// look for the four-card-major fit rather than forcing it.  With 5-3 or 5-5 majors, Stayman does
/// not qualify without a four-card major, so the transfer remains available.
///
/// agreement.setting === 'jacobyTransfers' by itself does not mean a rule is a Jacoby transfer;
/// it only means that rule's meaning depends on whether Jacoby transfers are enabled.  For example,
/// the direct strong 3H/3S rule also uses that setting.  A Jacoby transfer is therefore identified
/// here by the enabled jacobyTransfers agreement plus the conventional call category.
///
function maybeSuppressTransfersForStayman (ruleDiagnostics: RuleEvalResult[]):
    RuleEvalResult[] {
  const staymanResult = ruleDiagnostics.find((result) =>
    result.ruleApplies && result.rule.agreement?.setting === 'stayman' &&
    result.rule.agreement.value);
  if (staymanResult === undefined) {
    return ruleDiagnostics;
  }
  const staymanCandidate = staymanResult.candidates.find((candidate) => candidate.ruleApplies)!;

  for (const result of ruleDiagnostics) {
    const isJacobyTransfer =
      result.rule.agreement?.setting === 'jacobyTransfers' && result.rule.agreement.value &&
      result.rule.callCategory?.includes('conventional');
    if (! result.ruleApplies || ! isJacobyTransfer) {
      continue;
    }
    const suppressionLine =
      `SUPPRESSED: ${staymanCandidate.call} Stayman is preferred with 5-4 majors, ` +
      'so do not use the Jacoby transfer.';
    result.ruleApplies = false;
    result.telemetryLines.push(`  ${suppressionLine}`);
    for (const candidate of result.candidates) {
      if (candidate.ruleApplies) {
        candidate.ruleApplies = false;
        candidate.telemetryLines.push(suppressionLine);
      }
    }
  }
  return ruleDiagnostics;
} // maybeSuppressTransfersForStayman()

/// maybeSuppressOneFiveOrMoreMajorTransfer removes one Jacoby transfer when the replying hand has
/// 5+ cards in each major and the bidding sequence gives one transfer a preferred meaning for this
/// strength.
///
/// This transfer ordering is separate from ordinary natural-suit ordering.  When only natural suit
/// bids are available by partnership agreement, bidding guidelines commonly use up-the-line choices
/// with four-card suits and down-the-line preferences with five-card suits.  With transfers,
/// however, the first artificial bid can instead be chosen to preserve a particular rebid level and
/// thereby communicate strength.
///
/// After 1NT, 8-9 HCP (7-8 with 16-18) starts with the heart transfer so the replying hand
/// can bid 2S invitationally; 10+ (9+ with 16-18) starts with the spade transfer
/// so a later 3H is game forcing.  After 2NT, 4+ HCP is already
/// game going, so start with the heart transfer and preserve 3S to show the second major.
///
/// Weak 5-5 hands are intentionally left unresolved.  Modern transfer methods commonly use a
/// five-card-major response even with fewer than eight points because the major may play better
/// than leaving the contract in 1NT.  Some bidding
/// methods instead use garbage/crawling Stayman with suitable weak two-major shapes.  For now,
/// don't compare the two major-suit qualities, and both weak transfer choices remain available.
///
function maybeSuppressOneFiveOrMoreMajorTransfer (ruleDiagnostics: RuleEvalResult[],
                                                context: RuleEvalContext, system: BiddingSystem):
    RuleEvalResult[] {
  if (context.handFacts.lengths.H < 5 || context.handFacts.lengths.S < 5) {
    return ruleDiagnostics;
  }
  // A 5-card major exists; the transfer ordering depends on partner's actual NT opening.
  const partnerOpeningCall = getPartnerOpeningCall(context.dealer, context.auction, context.seat);
  let preferredTransfer: Call | null = null;
  if (partnerOpeningCall === '1NT') {
    const shift = oneNtResponseHcpShift(system);
    if (context.handFacts.hcp >= 8 - shift && context.handFacts.hcp <= 9 - shift) {
      preferredTransfer = '2D'; // Transfer to hearts, then show spades at the two level.
    } else if (context.handFacts.hcp >= 10 - shift) {
      preferredTransfer = '2H'; // Transfer to spades, then show hearts at the three level.
    }
  } else if (partnerOpeningCall === '2NT' && context.handFacts.hcp >= 4) {
    preferredTransfer = '3D'; // Transfer to hearts, then 3S shows the second major below 3NT.
  }
  if (preferredTransfer === null) {
    return ruleDiagnostics;
  }
  // and one is a preferred suit by bidding instructional materials
  const jacobyResults = ruleDiagnostics.filter((result) =>
    result.ruleApplies && result.rule.agreement?.setting === 'jacobyTransfers' &&
    result.rule.agreement.value && result.rule.callCategory?.includes('conventional'));
  const preferredExists = jacobyResults.some((result) =>
    result.candidates.some((candidate) =>
      candidate.ruleApplies && candidate.call === preferredTransfer));
  if (! preferredExists) {
    return ruleDiagnostics;
  }

  for (const result of jacobyResults) {
    let suppressed = false;
    for (const candidate of result.candidates) {
      if (! candidate.ruleApplies || candidate.call === preferredTransfer) {
        continue;
      }
      const suppressionLine =
        `SUPPRESSED: with 5-5 majors, ${preferredTransfer} is the preferred first transfer ` +
        'for this strength.';
      candidate.ruleApplies = false;
      candidate.telemetryLines.push(suppressionLine);
      result.telemetryLines.push(`  ${suppressionLine}`);
      suppressed = true;
    }
    if (suppressed) {
      result.ruleApplies = result.candidates.some((candidate) => candidate.ruleApplies);
    }
  }
  return ruleDiagnostics;
} // maybeSuppressOneFiveOrMoreMajorTransfer()

/// maybeSuppressJacobyForDirectMajorSlam resolves the overlap between an ordinary Jacoby transfer
/// and our direct 3H/3S slam-interest treatment.  With Jacoby transfers enabled, a direct 3M shows
/// 16+ HCP, a 6+ card major, and no four-card other major.  When that stronger treatment applies,
/// do not also present the ordinary lower-level Jacoby transfer as an equal first action.
///
/// agreement.setting === 'jacobyTransfers' alone does not identify a Jacoby transfer: the direct
/// 3H/3S rule also depends on that agreement.  The transfer rule is the conventional one; the
/// direct 3M slam-interest rule is natural and game forcing.
///
function maybeSuppressJacobyForDirectMajorSlam (ruleDiagnostics: RuleEvalResult[]) :
      RuleEvalResult[] {
  const majorSlamResult = ruleDiagnostics.find((result) =>
    result.ruleApplies && result.rule.agreement?.setting === 'jacobyTransfers' &&
    result.rule.agreement.value && result.rule.callCategory?.includes('gameForcing') &&
    ! result.rule.callCategory?.includes('conventional') &&
    result.candidates.some((candidate) =>
      candidate.ruleApplies && (candidate.call === '3H' || candidate.call === '3S')));
  if (majorSlamResult === undefined) {
    return ruleDiagnostics;
  }
  // found game forcing direct major
  const majorSlamCandidate = majorSlamResult.candidates.find((candidate) =>
    candidate.ruleApplies && (candidate.call === '3H' || candidate.call === '3S'));
  // if (majorSlamCandidate === undefined) {
  //   return ruleDiagnostics;
  // }
  // we know we have a direct slam candidate, so see if there's a jacoby to suppress
  for (const result of ruleDiagnostics) {
    const isJacobyTransfer = result.rule.agreement?.setting === 'jacobyTransfers' &&
                             result.rule.agreement.value && 
                             result.rule.callCategory?.includes('conventional');
    if (! result.ruleApplies || ! isJacobyTransfer) {
      continue;
    }
    // got the jacoby rule
    const suppressionLine =
      `SUPPRESSED: ${majorSlamCandidate!.call} is the preferred direct major slam-interest ` +
      'response, so do not use the ordinary Jacoby transfer.';
    for (const candidate of result.candidates) {
      if (candidate.ruleApplies) {
        candidate.ruleApplies = false;
        candidate.telemetryLines.push(suppressionLine);
      }
    }
    result.ruleApplies = result.candidates.some((candidate) => candidate.ruleApplies);
    result.telemetryLines.push(`  ${suppressionLine}`);
  }
  return ruleDiagnostics;
} // maybeSuppressJacobyForDirectMajorSlam()



/// maybeSuppressJacobyForMajorGame resolves the game-only overlap between Jacoby and the system's
/// direct 6+ major game route.  With Texas enabled, that route is a four-level Texas transfer.
/// Without Texas, 4H/4S are natural game signoffs instead.  In either treatment, a game-only hand
/// uses the direct game route rather than first making the lower-level Jacoby transfer.
///
/// The major-game rules themselves exclude another four-card or longer major: 6-4 hands start with
/// Stayman, while two 5+ card majors use a lower-level transfer sequence to describe both suits.
/// Jacoby remains available for weaker/invitational hands and stronger hands needing bidding room.
/// See natural-1nt-partner-calls.ts for the full major-shape routing map.
///
function maybeSuppressJacobyForMajorGame (ruleDiagnostics: RuleEvalResult[]):
    RuleEvalResult[] {
  // do any results specify a texas transfer result ...  if texas is true, and one applies, then
  // suppress jacoby, and if texas is off for an applicable rule, and a natural 4M applies, then
  // suppress jacoby
  const majorGameResult = ruleDiagnostics.find((result) =>
    result.ruleApplies && result.rule.agreement?.setting === 'texasTransfers'); //&&
    // result.rule.agreement.value && result.rule.callCategory?.includes('conventional'));
  if (majorGameResult === undefined) {
    return ruleDiagnostics;
  }
  const majorGameCandidate = majorGameResult.candidates.find((candidate) => candidate.ruleApplies)!;
  // if (majorGameCandidate === undefined) {
  //   return ruleDiagnostics;
  // }
  // We have the system's direct major-game route, so see if a competing Jacoby transfer applies.
  for (const result of ruleDiagnostics) {
    const isJacobyTransfer = result.rule.agreement?.setting === 'jacobyTransfers' &&
                             result.rule.agreement.value && 
                             result.rule.callCategory?.includes('conventional');
    if (! result.ruleApplies || ! isJacobyTransfer) {
      continue;
    }
    const suppressionLine =
      `SUPPRESSED: ${majorGameCandidate.call} is the preferred direct major-game route, ` +
      'so do not use the Jacoby transfer.';
    for (const candidate of result.candidates) {
      if (candidate.ruleApplies) {
        candidate.ruleApplies = false;
        candidate.telemetryLines.push(suppressionLine);
      }
    }
    // update rule defensively based on any candidates still apply
    result.ruleApplies = result.candidates.some((candidate) => candidate.ruleApplies);
    result.telemetryLines.push(`  ${suppressionLine}`);
  }
  return ruleDiagnostics;
} // maybeSuppressJacobyForMajorGame()



/// maybeSuppressNtResponseFallback takes all applicable rules for the current auction and replying
/// hand and removes a direct Pass or natural notrump response when a preferred suit response
/// should come first.  This keeps the point-range NT ladder declarative while resolving Stayman,
/// transfer, natural-major, and no-convention natural-minor choices.
///
/// With Jacoby transfers available, the replying hand first shows a five-card-or-longer major and
/// then describes strength:
///   0-7 + 5-card major -> transfer, then pass
///   8-9 + 5-card major -> transfer, then bid 2NT
///   10+ + 5-card major -> transfer, then bid 3NT or otherwise describe the hand
///
/// The following examples assume the standard 15-17 opening agreement. Using rule
/// agreements rather than testing IDs gives a clean result consistent with bidding books:
///    Jacoby ON:
///       1NT + 5 HCP + 5S-3-3-2  -> 2H transfer      (Pass removed)
///       1NT + 8 HCP + 5S-3-3-2  -> 2H transfer      (2NT removed)
///       1NT + 10 HCP + 5S-3-3-2 -> 2H transfer      (3NT removed)
///       1NT + 16 HCP + 5S-3-3-2 -> 2H transfer      (4NT removed)
///    Jacoby OFF:
///       1NT + 5 HCP + 5S-3-3-2  -> 2S natural       (Pass removed)
///       1NT + 8 HCP + 5S-3-3-2  -> 2NT              (correctly remains)
///       1NT + 10 HCP + 5S-3-3-2 -> 3S natural       (3NT removed)
///
/// See natural-1nt-partner-calls.ts for the complete response-family routing map; this function
/// owns only the Pass/notrump fallback suppression.
///
function maybeSuppressNtResponseFallback (ruleDiagnostics: RuleEvalResult[]) :
    RuleEvalResult[] {
  // Find the first applicable suit-response treatment controlled by Stayman, Jacoby, or Texas.
  // This also includes the natural 3C/3D meanings recovered when Stayman/Jacoby are disabled.
  const suitActionResult = ruleDiagnostics.find((result) => {
    if (! result.ruleApplies) {
      return false;
    }
    const setting = result.rule.agreement?.setting;
    return setting === 'stayman' || setting === 'jacobyTransfers' || setting === 'texasTransfers';
  });
  if (suitActionResult === undefined) {
    return ruleDiagnostics;
  }
  const suitCandidate = suitActionResult.candidates.find((candidate) => candidate.ruleApplies)!;
  // A preferred suit action makes Pass or a direct notrump response only a fallback.
  for (const result of ruleDiagnostics) {
    let suppressed = false;
    for (const candidate of result.candidates) {
      const isNtFallback = candidate.call === 'Pass' ||
        (isContractBid(candidate.call) && getStrainFromSuitBid(candidate.call) === 'NT');
      if (! candidate.ruleApplies || ! isNtFallback) {
        continue;
      }
      const suppressionLine =
        `SUPPRESSED: ${suitCandidate.call} is a preferred suit response, ` +
        `so do not use direct ${candidate.call}.`;
      candidate.ruleApplies = false;
      candidate.telemetryLines.push(suppressionLine);
      result.telemetryLines.push(`  ${suppressionLine}`);
      suppressed = true;
    }
    // if we suppressed anything, the rule applies only if it has surviving calls after supporession
    if (suppressed) {
      result.ruleApplies = result.candidates.some((candidate) => candidate.ruleApplies);
    }
  }
  return ruleDiagnostics;
} // maybeSuppressNtResponseFallback()

/// maybeSuppress1NTWhenMajorSupport takes all applicable rules for current auction and responder's
/// hand and removes the no-support 1NT response when responder already has a qualifying one-level
/// new-suit response.  After 1H, four or more spades are shown with 1S; the 1NT response is the
/// fallback when that preferred one-level response is unavailable.
///
function maybeSuppress1NTWhenMajorSupport (ruleDiagnostics: RuleEvalResult[]) :
      RuleEvalResult[] {
  const newSuitResult = ruleDiagnostics.find((result) =>
    result.rule.id === 'respond-to-major-w/o-support-new-suit-one-level' &&
    result.ruleApplies);
  if (newSuitResult === undefined) { // don't suppress anything, no valid one suit bid found
    return ruleDiagnostics;
  }
  const newSuitCandidate = newSuitResult.candidates.find(
    (candidate) => candidate.ruleApplies)!;
  const oneNtResult = ruleDiagnostics.find((result) =>
    (result.rule.id === 'respond-to-major-w/o-support-1nt-twooverone' ||
     result.rule.id === 'respond-to-major-w/o-support-1nt-standard') &&
    result.ruleApplies);
  if (oneNtResult === undefined) {
    return ruleDiagnostics;
  }
  const suppressionLine = // telemetry, not user facing
    `SUPPRESSED: ${newSuitCandidate.call} is the preferred one-level new-suit response, ` +
    'so do not use fallback 1NT.';
  oneNtResult.ruleApplies = false;
  oneNtResult.telemetryLines.push(`  ${suppressionLine}`);
  for (const candidate of oneNtResult.candidates) {
    if (candidate.ruleApplies) {
      candidate.ruleApplies = false;
      candidate.telemetryLines.push(suppressionLine);
    }
  }
  return ruleDiagnostics;
} // maybeSuppress1NTWhenMajorSupport()


///
//// Evaluate Hand Constraints against Calls
///

/// evaluateHandConstraint evaluates rule.appliesWhen's declarative hand constraints against a call.
///
function evaluateHandConstraint (constraint: HandConstraint, call: Call, 
                                 context: RuleEvalContext, system: BiddingSystem)
                                : AppliesWhenResult {
  const telemetryLines: string[] = [];
  let pass = true;
  if (constraint.hcp !== undefined) {
    const shift = constraint.hcpRelativeToOneNtOpening
      ? oneNtResponseHcpShift(system) : 0;
    const range = { min: constraint.hcp.min === undefined ? undefined : constraint.hcp.min - shift,
                    max: constraint.hcp.max === undefined ? undefined : constraint.hcp.max - shift };
    const result = testPointRange(context.handFacts.hcp, range, 'HCP');
    telemetryLines.push(result.telemetryLine);
    pass = pass && result.pass;
  }
  if (constraint.totalPoints !== undefined) {
    const result = testTotalPointsRange(context, constraint.totalPoints);
    telemetryLines.push(...result.telemetryLines);
    pass = pass && result.pass;
  }
  if (constraint.suitLengths !== undefined) {
    for (const suitLength of constraint.suitLengths) {
      const result = testSuitLengths(suitLength, call, context.handFacts);
      telemetryLines.push(result.telemetryLine);
      pass = pass && result.pass;
    }
  }
  if (constraint.shape !== undefined) {
    const result = testHandShape(constraint.shape, call, context.handFacts);
    telemetryLines.push(...result.telemetryLines);
    pass = pass && result.pass;
  }
  if (constraint.supportLength !== undefined) {
    const result = testSupportLength(constraint.supportLength, context);
    telemetryLines.push(result.telemetryLine);
    pass = pass && result.pass;
  }
  return { success: pass, telemetryLines };
} //evaluateHandConstraint()

function testPointRange (value: number, range: PointRange, label: string)
                           : { pass: boolean; telemetryLine: string } {
  if (range.min !== undefined && value < range.min) {
    return { pass: false, telemetryLine: `FAIL: ${label} ${value} < minimum ${range.min}.` };
  }
  if (range.max !== undefined && value > range.max) {
    return { pass: false, telemetryLine: `FAIL: ${label} ${value} > maximum ${range.max}.` };
  }
  return { pass: true, telemetryLine: `PASS: ${label} ${value} is in range.` };
}

function testTotalPointsRange (context: RuleEvalContext, range: TotalPointsRange) :
     { pass: boolean; telemetryLines: string[] } {
  const useShortage = range.valuation === 'shortage';
  const value = useShortage ? context.handFacts.totalPointsWShortage
                            : context.handFacts.totalPointsWLength;
  const label = useShortage ? 'total points with shortage' : 'total points with length';
  const result = testPointRange(value, range, label);
  return { pass: result.pass, telemetryLines: [result.telemetryLine] };
}

/// testSuitLengths compares one declared suit-length constraint with the bidder's hand.  When the
/// constraint omits a suit, getSuitsForLengthTesting binds it to the candidate call's suit.
///
function testSuitLengths (constraint: SuitLengthConstraint, call: Call, handFacts: HandFacts)
                         : { pass: boolean; telemetryLine: string } {
  const targetSuits = getSuitsForLengthTesting(constraint, call);
  if (targetSuits.length === 0) {
    return { pass: false, 
             telemetryLine: `FAIL: no target suit for suit length constraint on call ${call}.` };
  }
  // See if hand has length is listed suits
  for (const suit of targetSuits) {
    const length = handFacts.lengths[suit];
    if (constraint.exact !== undefined && length !== constraint.exact) {
      continue;
    }
    if (constraint.min !== undefined && length < constraint.min) {
      continue;
    }
    if (constraint.max !== undefined && length > constraint.max) {
      continue;
    }
    return { pass: true, 
             telemetryLine: `PASS: ${suit} length ${length} satisfies suit length constraint.` };
  }
  return { pass: false, 
           telemetryLine: `FAIL: no target suit satisfied suit length constraint for call ${call}.` };
}

/// getSuitsForLengthTesting returns the suit(s) tested by one suit-length constraint.  A named
/// suit/major/minor is explicit; an omitted suit means the candidate call's suit.
///
function getSuitsForLengthTesting (constraint: SuitLengthConstraint, call: Call): Suit[] {
  if (constraint.suit === 'major') return ['H', 'S'];
  if (constraint.suit === 'minor') return ['C', 'D'];
  if (constraint.suit !== undefined) { // there is a specified suit
    if (constraint.suit === 'NT') return []; // probably an erroneous rule
    return [constraint.suit];
  }
  if (isContractBid(call)) {
    const callSuit = getStrainFromSuitBid(call);
    if (callSuit !== 'NT') { // Can't specify lengths for NT, so likely erroneous rule
      return [callSuit];
    }
  }
  return [];
}

/// testHandShape checks handFacts against the rule's balanced/distribution-shape constraints.
///
function testHandShape (shape: HandShapeConstraint, call: Call, 
                        handFacts: HandFacts): { pass: boolean; telemetryLines: string[] } {
  const telemetryLines: string[] = [];
  let pass = true;
  if (shape.balanced !== undefined) {
    const thisPass = handFacts.balanced === shape.balanced;
    telemetryLines.push(`${thisPass ? 'PASS' : 'FAIL'}: balanced is ${handFacts.balanced}.`);
    pass = pass && thisPass;
  }
  if (shape.balancedOrSemiBalanced !== undefined) {
    const thisPass = handFacts.balancedOrSemiBalanced === shape.balancedOrSemiBalanced;
    telemetryLines.push(`${thisPass ? 'PASS' : 'FAIL'}: balancedOrSemiBalanced is ` +
                        `${handFacts.balancedOrSemiBalanced}.`);
    pass = pass && thisPass;
  }
  if (shape.noVoid !== undefined) {
    const thisPass = shape.noVoid ? handFacts.voidCount === 0 : true;
    telemetryLines.push(`${thisPass ? 'PASS' : 'FAIL'}: void count is ${handFacts.voidCount}.`);
    pass = pass && thisPass;
  }
  if (shape.noSingleton !== undefined) {
    const thisPass = shape.noSingleton ? handFacts.singletonCount === 0 : true;
    telemetryLines.push(`${thisPass ? 'PASS' : 'FAIL'}: singleton count is ${handFacts.singletonCount}.`);
    pass = pass && thisPass;
  }
  if (shape.maxDoubletons !== undefined) {
    const thisPass = handFacts.doubletonCount <= shape.maxDoubletons;
    telemetryLines.push(`${thisPass ? 'PASS' : 'FAIL'}: doubleton count is ${handFacts.doubletonCount}.`);
    pass = pass && thisPass;
  }
  if (shape.noFourCardMajor !== undefined) {
    const thisPass = shape.noFourCardMajor ? ! handFacts.hasFourCardMajor : true;
    telemetryLines.push(`${thisPass ? 'PASS' : 'FAIL'}: hasFourCardMajor is ${handFacts.hasFourCardMajor}.`);
    pass = pass && thisPass;
  }
  if (shape.noFourCardOtherMajor !== undefined) {
    let noOther = ! handFacts.hasFourCardMajor;
    if (isContractBid(call)) {
      const callSuit = getStrainFromSuitBid(call); // isContractBid propagates call is SuitBid
      if (callSuit === 'H') {
        noOther = handFacts.lengths.S < 4;
      } else if (callSuit === 'S') {
        noOther = handFacts.lengths.H < 4;
      }
    }
    const thisPass = noOther;
    // const thisPass = noFourCardOtherMajorMatches(call, handFacts);
    telemetryLines.push(`${thisPass ? 'PASS' : 'FAIL'}: noFourCardOtherMajor for ${call}.`);
    pass = pass && thisPass;
  }
  if (shape.noFiveCardMajor !== undefined) {
    const thisPass = shape.noFiveCardMajor ? ! handFacts.hasFiveCardMajor : true;
    telemetryLines.push(`${thisPass ? 'PASS' : 'FAIL'}: hasFiveCardMajor is ${handFacts.hasFiveCardMajor}.`);
    pass = pass && thisPass;
  }
  return { pass, telemetryLines };
} //testHandShape()

//// Hand constraints -- Partner support
/// testSupportLength compares the bidder's holding in partner's relevant naturally bid suit with
/// the declared range.  While responding this is opener's suit; on opener's rebid it is responder's
/// suit.  supportLength does not choose how total points are valued.
///
function testSupportLength (supportLength: PointRange, context: RuleEvalContext) :
      { pass: boolean; telemetryLine: string } {
  const supportSuit = getSupportSuitForStage(context);
  if (supportSuit === null) {
    return {pass: false,
            telemetryLine: 'FAIL: no partner suit is available for supportLength constraint.',};
  }
  return testPointRange(context.handFacts.lengths[supportSuit], supportLength,
                        `${supportSuit} support length`);
}

function getSupportSuitForStage (context: RuleEvalContext): Suit | null {
  if (context.stage === 'responding') {
    const opening = getPartnerOpeningCall(context.dealer, context.auction, context.seat);
    if (opening === null) {
      return null;
    }
    const strain = getStrainFromSuitBid(opening);
    return strain === 'NT' ? null : strain;
  }

  if (context.stage === 'openerRebid') {
    const responderCall = getResponderCall(context.dealer, context.auction);
    if (responderCall === null || ! isContractBid(responderCall)) {
      return null;
    }
    const strain = getStrainFromSuitBid(responderCall);
    return strain === 'NT' ? null : strain;
  }

  if (context.stage === 'advancing') {
    const opening = getOpeningCallInfo(context.dealer, context.auction);
    const overcall = opening === null ? undefined : context.auction[opening.index + 1];
    if (overcall === undefined || ! isContractBid(overcall)) {
      return null;
    }
    const strain = getStrainFromSuitBid(overcall);
    return strain === 'NT' ? null : strain;
  }

  return null;
}

///
//// Rule Testing Utilities -- interpreting rule declarations in context of actual hands, etc.
///

/// auctionContextMatches decides only whether a rule belongs to the current auction; hand qualification and call refinement are separate responsibilities.
/// Exact auction declarations stay literal, while opener/responder fields provide explicit semantic constraints.
///
function auctionContextMatches (ruleContext: AuctionContext | undefined,
                               evalContext: RuleEvalContext): boolean {
  if (ruleContext === undefined) {
    return true;
  }
  if (ruleContext.partnerNaturalOneNt === true) {
    return matchesPartnerNaturalOneNt(evalContext);
  }
  if (ruleContext.partnerNaturalOneNtAfterSuitInterference === true) {
    return getPartnerOneNtSuitInterference(evalContext.dealer, evalContext.auction) !== null;
  }
  if (ruleContext.partnerNaturalTwoNtOverWeakTwo === true) {
    return matchesPartnerNaturalTwoNtOverWeakTwo(evalContext);
  }
  if (ruleContext.stage !== evalContext.stage) {
    return false;
  }

  const interference = getInterferenceAfterOpening(evalContext.dealer, evalContext.auction);
  // getNextBiddingRuleStage admits only reviewed physical competitive opener turns.  Keep ordinary opener
  // rules isolated as a second line of defense: reuse must be explicit, while a rule that declares
  // interference is already a purpose-built competitive treatment.
  if (evalContext.stage === 'openerRebid' && interference !== 'none' &&
      ruleContext.openerRebidAfterInterference !== true &&
      ruleContext.interference === undefined) {
    return false;
  }
  // Reused uncontested meanings need a second explicit opt-in once advancer actually acts.
  // Purpose-built competitive rules can keep using their interference context and refiners.
  const advancerKind = evalContext.stage === 'openerRebid'
    ? getAdvancerCallKindForOpenerRebid(evalContext.dealer, evalContext.auction) : null;
  if (evalContext.stage === 'openerRebid' && interference !== 'none' &&
      ruleContext.openerRebidAfterInterference === true && advancerKind !== null &&
      advancerKind !== 'pass' && ruleContext.advancerCall === undefined) {
    return false;
  }
  if (ruleContext.interference !== undefined && ruleContext.interference !== interference) {
    return false;
  }

  const actualAuction = getRuleAuction(evalContext);
  const actualOpening = actualAuction[0];
  if (ruleContext.openerRebidCall !== undefined &&
      (evalContext.stage !== 'responderRebid' ||
       actualAuction[2] !== ruleContext.openerRebidCall)) {
    return false;
  }
  if (ruleContext.openerRepeatedOpeningSuitAtTwo === true &&
      (evalContext.stage !== 'responderRebid' || actualAuction.length !== 3 ||
       actualOpening === undefined || ! isContractBid(actualOpening) ||
       ! /^1[CDHS]$/.test(actualOpening) ||
       actualAuction[2] !== `2${actualOpening.substring(1)}`)) {
    return false;
  }
  if (ruleContext.openerRaiseResponderMajorTo !== undefined) {
    const originalResponse = getResponderCall(evalContext.dealer, evalContext.auction);
    const raise = actualAuction[2];
    if (evalContext.stage !== 'responderRebid' ||
        (originalResponse !== '1H' && originalResponse !== '1S') ||
        raise !== `${ruleContext.openerRaiseResponderMajorTo}${originalResponse.substring(1)}`) {
      return false;
    }
  }
  if (ruleContext.openerCalls !== undefined &&
      (actualOpening === undefined || ! ruleContext.openerCalls.includes(actualOpening))) {
    return false;
  }
  if (ruleContext.openerStrain !== undefined &&
      (actualOpening === undefined ||
       ! openerStrainMatches(ruleContext.openerStrain, actualOpening))) {
    return false;
  }
  if (ruleContext.openerLevel !== undefined) {
    if (actualOpening === undefined || ! isContractBid(actualOpening) ||
        Number(actualOpening.substring(0, 1)) !== ruleContext.openerLevel) {
      return false;
    }
  }

  if (ruleContext.auction !== undefined) {
    if (ruleContext.auction.length !== actualAuction.length) {
      return false;
    }

    for (let index = 0; index < ruleContext.auction.length; index += 1) {
      const ruleCall = ruleContext.auction[index];
      const actualCall = actualAuction[index];
      if (ruleCall === undefined || actualCall === undefined) {
        return false;
      }
      if (ruleCall !== actualCall) {
        return false;
      }
    }
  }

  if (ruleContext.responderCall !== undefined) {
    // responderCall describes responder's physical first action, including Pass.  The compact
    // partnership auction intentionally omits Passes, so use the physical-auction helper here
    // rather than assuming actualAuction[1] exists.
    const actualResponse = getResponderCall(evalContext.dealer, evalContext.auction);
    if (actualOpening === undefined || actualResponse === null ||
        ! responderCallMatches(ruleContext.responderCall, actualOpening, actualResponse, evalContext)) {
      return false;
    }
  }
  if (ruleContext.advancerCall !== undefined &&
      ! advancerCallMatches(ruleContext.advancerCall, evalContext)) {
    return false;
  }

  return true;
}

/// matchesPartnerNaturalOneNt recognizes the two genuine auctions that use shared 1NT calls.
/// It requires the opening side's responder to pass after a direct 1NT overcall.
///
function matchesPartnerNaturalOneNt (context: RuleEvalContext): boolean {
  const opening = getOpeningCallInfo(context.dealer, context.auction);
  if (opening === null) {
    return false;
  }
  if (context.stage === 'responding') {
    return opening.call === '1NT' &&
      context.auction.length === opening.index + 2 &&
      context.auction[opening.index + 1] === 'Pass';
  }
  if (context.stage !== 'advancing' || context.auction.length !== opening.index + 3) {
    return false;
  }
  const openerBid = getStrainFromSuitBid(opening.call);
  return opening.call.startsWith('1') && openerBid !== 'NT' &&
    context.auction[opening.index + 1] === '1NT' &&
    context.auction[opening.index + 2] === 'Pass';
}

/// matchesPartnerNaturalTwoNtOverWeakTwo identifies the compact systems-on context after a
/// natural 2NT overcall of an opposing weak 2D/2H/2S opening and responder's Pass.
function matchesPartnerNaturalTwoNtOverWeakTwo (context: RuleEvalContext): boolean {
  const opening = getOpeningCallInfo(context.dealer, context.auction);
  return context.stage === 'advancing' && opening !== null &&
    ['2D', '2H', '2S'].includes(opening.call) &&
    context.auction.length === opening.index + 3 &&
    context.auction[opening.index + 1] === '2NT' &&
    context.auction[opening.index + 2] === 'Pass';
}

function responderCallMatches (constraint: ResponderCallContext, openingCall: Call,
                               responseCall: Call, context: RuleEvalContext): boolean {
  if (! isContractBid(openingCall)) {
    return false;
  }
  if (responseCall === 'Pass') {
    return constraint.kind === 'pass' && constraint.level === undefined &&
      constraint.jump === undefined && constraint.opponentSuit === undefined;
  }
  if (responseCall === 'Double' || responseCall === 'Redouble') {
    const kind = responseCall === 'Double' ? 'double' : 'redouble';
    return (constraint.kind === undefined || constraint.kind === kind) &&
      constraint.level === undefined && constraint.jump === undefined &&
      constraint.opponentSuit === undefined;
  }
  if (! isContractBid(responseCall)) {
    return false;
  }

  const openingStrain = getStrainFromSuitBid(openingCall);
  const responseStrain = getStrainFromSuitBid(responseCall);
  const responseLevel = Number(responseCall.substring(0, 1));
  const kind = responseStrain === 'NT' ? 'notrump'
    : responseStrain === openingStrain ? 'raise' : 'newSuit';

  if (constraint.kind !== undefined && constraint.kind !== kind) {
    return false;
  }
  if (constraint.strain !== undefined) {
    if (constraint.strain === 'major' && responseStrain !== 'H' && responseStrain !== 'S') {
      return false;
    }
    if (constraint.strain === 'minor' && responseStrain !== 'C' && responseStrain !== 'D') {
      return false;
    }
    if (constraint.strain !== 'major' && constraint.strain !== 'minor' &&
        constraint.strain !== responseStrain) {
      return false;
    }
  }
  if (constraint.level !== undefined && constraint.level !== responseLevel) {
    return false;
  }
  if (constraint.jump !== undefined &&
      constraint.jump !== responseJump(openingCall, responseCall)) {
    return false;
  }
  if (constraint.opponentSuit !== undefined) {
    const opening = getOpeningCallInfo(context.dealer, context.auction);
    const opponentCall = opening === null ? undefined : context.auction[opening.index + 1];
    const opponentBid = opponentCall === undefined ? null : parseSuitBid(opponentCall);
    const matchesOpponentSuit = opponentBid !== null && opponentBid.strain !== 'NT' &&
      responseStrain === opponentBid.strain;
    if (constraint.opponentSuit !== matchesOpponentSuit) {
      return false;
    }
  }
  return true;
}

function advancerCallMatches (constraint: AdvancerCallContext,
                              context: RuleEvalContext): boolean {
  const kind = getAdvancerCallKindForOpenerRebid(context.dealer, context.auction);
  if (kind === null) return false;
  if (constraint.kind !== undefined) {
    const kinds = Array.isArray(constraint.kind) ? constraint.kind : [constraint.kind];
    if (! kinds.includes(kind)) return false;
  }
  if (constraint.level !== undefined) {
    const opening = getOpeningCallInfo(context.dealer, context.auction);
    const advanceCall = opening === null ? undefined : context.auction[opening.index + 3];
    const advance = advanceCall === undefined ? null : parseSuitBid(advanceCall);
    if (advance === null || advance.level !== constraint.level) return false;
  }
  return true;
}

/// getRuleAuction derives the compact uncontested partnership auction from the authoritative physical auction.
/// Opponent passes stay in context.auction; an AuctionContext.auction declaration matches this compact sequence literally.
///
function getRuleAuction (context: RuleEvalContext): Call[] {
  if (context.stage === 'opening') {
    return [];
  }
  const opening = getOpeningCallInfo(context.dealer, context.auction);
  if (opening === null) {
    return [];
  }
  return getOpeningPartnershipCalls(context.dealer, context.auction, opening.seat);
}

function openerStrainMatches(openerStrain: AuctionContext['openerStrain'], call: Call): boolean {
  if (openerStrain === undefined) {
    return false;
  }

  if (isContractBid(call) !== true) {
    return false;
  }

  const callSuit = getStrainFromSuitBid(call);

  if (openerStrain === 'suit') {
    return callSuit !== 'NT';
  }

  if (openerStrain === 'major') {
    return callSuit === 'H' || callSuit === 'S';
  }

  if (openerStrain === 'minor') {
    return callSuit === 'C' || callSuit === 'D';
  }

  return callSuit === openerStrain;
}


/// filterReusedOpenerRebidCalls protects meanings that change when ordinary natural opener
/// rules are reused in competition.  A natural opponent suit is now a cuebid rather than opener's
/// second/help suit, and a natural notrump rebid requires a basic stopper in that suit.
function filterReusedOpenerRebidCalls (rule: BidRule, calls: Call[],
                                       context: RuleEvalContext): Call[] {
  if (context.stage !== 'openerRebid' ||
      rule.auctionContext?.openerRebidAfterInterference !== true) {
    return calls;
  }
  const opponentSuits = getOpponentNaturallyBidSuitsForOpenerRebid(context.dealer, context.auction);
  if (opponentSuits.length === 0) {
    return calls;
  }
  return calls.filter((call) => {
    const bid = parseSuitBid(call);
    if (bid === null) return true;
    if (bid.strain !== 'NT' && opponentSuits.includes(bid.strain)) return false;
    return bid.strain !== 'NT' || opponentSuits.every((suit) => hasBasicSuitStopper(context, suit));
  });
}

//// Candidate call filtering and refinement
/// getRuleCalls first removes mechanically unavailable calls and context-level reuse exclusions,
/// then refines the remaining candidates.  Refiners never have to select an illegal or
/// semantically repurposed call before alternative calls are considered.
///
function getRuleCalls (rule: BidRule, context: RuleEvalContext,
                       system: BiddingSystem): { calls: Call[]; telemetryLines: string[] } {
  if (rule.calls === undefined) {
    return { calls: [], telemetryLines: [] };
  }
  const mechanicallyAvailable = rule.calls.filter((call) =>
    isCallAvailableInAuction(call, context.auction));
  const removed = rule.calls.filter((call) => ! mechanicallyAvailable.includes(call));
  const telemetryLines = removed.length === 0 ? [] :
    [`Unavailable in this auction: ${removed.join(', ')}.`];
  const available = filterReusedOpenerRebidCalls(rule, mechanicallyAvailable, context);
  if (rule.callRefinement === undefined || available.length === 0) {
    return { calls: available, telemetryLines };
  }
  const refined = rule.callRefinement(available, context, system);
  // A refiner should select from the offered candidates, not introduce new or illegal calls.
  return {
    calls: refined.calls.filter((call) => available.includes(call)),
    telemetryLines: [...telemetryLines, ...refined.telemetryLines],
  };
}
