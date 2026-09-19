/// User input and given a hand, auction context, user call, and rules, explain which rules apply 
/// and whether the user call is accepted by any of them.
///
import { strainOrder, type AuctionContext, type BidRule, type Call, type HandConstraint,
         type PointRange, type TotalPointsRange, type SuitLengthConstraint, type Strain,
         type SuitBid, type BiddingSystem, type BiddingAgreement, type HandShapeConstraint,
         type RuleEvalContext, type AppliesWhenResult, type BidStage,
         type ResponderCallContext } from './bidding-types';
import { getHandFacts, type Board, type HandFacts, type Seat, type Suit } from './cards';
import { AdvanceRules, OpeningBidRules, OpenerRebidRules, OvercallRules, ResponseBidRules }
  from './bidding-rules';


/// user input -> normalize to Call -> build RuleEvalContext
///   -> filter rules by auction context applicability -> filter rules for finer-grain applicability
///   -> expand each rule into candidate calls -> evaluate appliesWhen constraints for each call
///   -> report:
///        handMatchingRules
///        userCallMatchingRules
///        candidate calls
///        telemetry

///
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

/// isContractBid takes a Call and returns whether it is 1C..7NT and further declares the call
/// is also a SuitBid (not pass, double, etc.).
///
export function isContractBid (call: Call): call is SuitBid {
  if (call.length !== 2 && call.length !== 3) {
    return false;
  }
  const levelText = call.substring(0, 1);
  const suitText = call.substring(1);
  const level = Number(levelText);
  // test isInteger due to user input, quick and dirty safety check
  if (! Number.isInteger(level) || level < 1 || level > 7) {
    return false;
  }
  return suitText === 'C' || suitText === 'D' || suitText === 'H' || suitText === 'S' || suitText === 'NT';
}

export function getStrainFromSuitBid (call: SuitBid): Strain {
  return call.substring(1) as Strain;
}

///
//// Public Evaluation API
///

/// BidEvalResult is the result type for evaluateUserCall, and it represents the bid
/// relative to rules and hand, not the best-bid judgment.
/// 
export interface BidEvalResult {
  normalizedCall: Call | null;
  userCallMatchingRules: BidRule[]; // Subset of handMatchingRules that match user's bid
  handMatchingRules: BidRule[]; // Rules that match the hand, ruleResults elt.ruleApplies is true
  // ruleResults has one element for each considered rule when the auction context and hand facts
  // satisfied constraints
  ruleResults: RuleEvalResult[];
  telemetryLines: string[];
}

/// Represents (possibly) multiple call candidates from a matching rule because a rule can contain
/// several calls.
///
export interface RuleEvalResult {
  rule: BidRule;
  candidates: CandidateCallMatch[]; // Each possible call from the rule and whether it applies.
  ruleApplies: boolean;
  telemetryLines: string[];
}

/// A candidate is one possible call from one rule in an evaluation result.
export interface CandidateCallMatch {
  rule: BidRule;
  call: Call;
  ruleApplies: boolean;
  telemetryLines: string[];
}


/// getApplicableCandidateCalls is an entry point for the bidding panel in the GUI.  It maps the
/// user's bid evaluation result to concrete calls allowed by rules that apply to the current 
/// hand/context.
///
export function getApplicableCandidateCalls (result: BidEvalResult): CandidateCallMatch[] {
  const candidates: CandidateCallMatch[] = [];
  for (const ruleResult of result.ruleResults) {
    for (const candidate of ruleResult.candidates) {
      if (candidate.ruleApplies) {
        candidates.push(candidate);
      }
    }
  }
  return candidates;
}


/// evaluateUserCall evaluates one user-entered call against the currently relevant bidding rules.
/// This does not choose the best bid like an auto-bidder, but rule refiners and suppressors invoked
/// here will eliminate bids and order bids according to bidding books and sources.  It reports in
/// BidEvalResult which rules apply to the hand/context and which of those rules, if any, match the
/// user's entered call.
///
/// Evaluator flow:
///    1. Pick the bidding stage
///       responder after one opening bid → ResponseBidRules
///    2. Apply agreement settings
///       e.g. Jacoby on removes the Jacoby-off rules
///    3. Filter those rules by auction context
///       e.g. after 1NT, only response rules whose context matches 1NT remain
///    4. Evaluate EVERY remaining rule
///       - run its callRefinement first, if any
///       - evaluate every surviving candidate call against appliesWhen
///       - set candidate.ruleApplies
///       - set ruleResult.ruleApplies = true if ANY candidate applies
///    5. After all rules have been evaluated:
///       run cross-rule suppression logic
///       - convenient-minor suppression
///       - our proposed NT-response fallback suppression
///       - existing major-response 1NT suppression
///    6. Sort by priority.rank for presentation
///
export function evaluateUserCall (inputCall: Call, board: Board, auction: Call[],
                                  system: BiddingSystem): BidEvalResult {
  const context = makeRuleEvalContext(board, auction);
  const telemetryLines: string[] = [];
  telemetryLines.push(
    `evaluateUserCall: ${context.seat} call ${inputCall}; stage=${context.stage ?? 'unresolved'}.`);
  // Select the rule bucket from the model-derived bidding stage, then apply partnership agreements.
  const stageRules = getRulesForStage(context.stage);
  const activeRules = getActiveBiddingRules(stageRules, system);
  let ruleResults = evaluateRules(activeRules, context, system);
  // Opening rules have a few relationships that cannot be expressed by evaluating each rule
  // independently.
  if (context.stage === 'opening') {
    ruleResults = maybeSuppressConvenientMinor(ruleResults);
  }
  // When responding to a natural notrump opening, a major-oriented bid makes direct Pass/notrump
  // call only a fallback bid.
  if (context.stage === 'responding' &&
      (context.partnerOpeningCall === '1NT' || context.partnerOpeningCall === '2NT')) {
    ruleResults = maybeSuppressTransfersForStayman(ruleResults); // jacoby vs stayman
    ruleResults = maybeSuppressOneFiveOrMoreMajorTransfer(ruleResults, context);
    ruleResults = maybeSuppressJacobyForDirectMajorSlam(ruleResults);
    ruleResults = maybeSuppressJacobyForMajorGame(ruleResults); // jacoby vs major game (and texas)
    // Order matters for this last call; declarations make the previous suppressors mutually clean.
    ruleResults = maybeSuppressNtResponseFallback(ruleResults); // fallback pass or NT
  }
  // Suppress 1NT when one of a major is better.
  if (context.stage === 'responding') {
    ruleResults = maybeSuppress1NTWhenMajorSupport(ruleResults);
  }
  // Higher rank means greater preference among qualifying rules.  Ranking changes presentation
  // order only; it does not eliminate lower-ranked qualifying rules.
  ruleResults.sort((left, right) =>
    (right.rule.priority?.rank ?? 0) - (left.rule.priority?.rank ?? 0));

  const applicableRules = ruleResults
    .filter((result) => result.ruleApplies)
    .map((result) => result.rule);
  const matchingRulesForUserCall: BidRule[] = [];
  // Report rule eval telemetry and collect matching candidate calls.
  for (const ruleResult of ruleResults) {
    telemetryLines.push(...ruleResult.telemetryLines);
    const matchingCandidate = ruleResult.candidates.find(
      (candidate) => candidate.ruleApplies && candidate.call === inputCall);
    if (matchingCandidate !== undefined) {
      matchingRulesForUserCall.push(ruleResult.rule);
    }
  }
  if (matchingRulesForUserCall.length === 0) {
    telemetryLines.push(`User call ${inputCall} did not satisfy any currently applicable rule.`);
  } else {
    telemetryLines.push(`User call ${inputCall} satisfied ${matchingRulesForUserCall.length} rule(s).`);
  }
  telemetryLines.push(`Applicable rule count: ${applicableRules.length}.`);
  return {
    normalizedCall: inputCall,
    userCallMatchingRules: matchingRulesForUserCall,
    handMatchingRules: applicableRules,
    ruleResults,
    telemetryLines,
  };
} //evaluateUserCall()


/// makeRuleEvalContext is the React/model boundary for bidding evaluation.  React supplies the
/// board and authoritative full auction; model code derives acting seat, hand, stage, and partner
/// opening information.
///
export function makeRuleEvalContext (board: Board, auction: Call[]): RuleEvalContext {
  const seat = getNextSeat(board.dealer, auction);
  const hand = board.deal[seat];
  const opening = getOpeningCallInfo(board.dealer, auction);
  const partnerOpeningCall = opening !== null && opening.seat === getPartnerSeat(seat)
    ? opening.call
    : null;
  return {
    dealer: board.dealer,
    seat,
    stage: getBidStage(board, auction),
    auction,
    hand,
    handFacts: getHandFacts(hand),
    partnerOpeningCall,
  };
}

/// getNextSeat returns the seat whose turn it is after the calls already in the auction.
/// It is not looking up the seat after dealer, that's just the starting seat for the rotation.
///
export function getNextSeat (dealer: Seat, auction: Call[]): Seat {
  return getSeatForCallIndex(dealer, auction.length);
}

/// getBidStage derives the current uncontested bidding stage from the real auction.  Competitive
/// stages will be filled in as their rule families are added; opponent non-pass calls currently
/// leave the stage unresolved rather than guessing.
export function getBidStage (board: Board, auction: Call[]): BidStage | null {
  // Silly punch through code, needs to be just three passes test
  if (auctionIsComplete(auction)) {
    return null;
  }
  const opening = getOpeningCallInfo(board.dealer, auction);
  if (opening === null) {
    return 'opening';
  }
  // getNextSeat read weird (not seat after dealer), it is next seat to bid given this auction.
  const nextSeat = getNextSeat(board.dealer, auction); 
  const openerPartner = getPartnerSeat(opening.seat);
  const openingPartnership = new Set<Seat>([opening.seat, openerPartner]);
  for (let index = opening.index + 1; index < auction.length; index += 1) {
    const call = auction[index];
    const seat = getSeatForCallIndex(board.dealer, index);
    if (! openingPartnership.has(seat) && call !== 'Pass') {
      return null;
    }
  }

  const partnershipCalls = getOpeningPartnershipCalls(board.dealer, auction, opening.seat);
  if (nextSeat === openerPartner && partnershipCalls.length === 1) {
    return 'responding';
  }
  if (nextSeat === opening.seat && partnershipCalls.length === 2) {
    return 'openerRebid';
  }
  if (nextSeat === openerPartner && partnershipCalls.length === 3) {
    return 'responderRebid';
  }
  return null;
}

/// getRulesForStage chooses the relevant rule family before hand evaluation.
export function getRulesForStage (stage: BidStage | null): BidRule[] {
  switch (stage) {
    case 'opening':
      return OpeningBidRules;
    case 'responding':
      return ResponseBidRules;
    case 'openerRebid':
      return OpenerRebidRules;
    case 'overcalling':
      return OvercallRules;
    case 'advancing':
      return AdvanceRules;
    case 'responderRebid':
    case null:
      return [];
  }
}

interface OpeningCallInfo {
  index: number;
  seat: Seat;
  call: SuitBid;
}

function getOpeningCallInfo (dealer: Seat, auction: Call[]): OpeningCallInfo | null {
  for (let index = 0; index < auction.length; index += 1) {
    const call = auction[index];
    if (call !== undefined && isContractBid(call)) {
      return { index, seat: getSeatForCallIndex(dealer, index), call };
    }
  }
  return null;
}

function getOpeningPartnershipCalls (dealer: Seat, auction: Call[], openingSeat: Seat): Call[] {
  const partner = getPartnerSeat(openingSeat);
  const calls: Call[] = [];
  for (let index = 0; index < auction.length; index += 1) {
    const seat = getSeatForCallIndex(dealer, index);
    const call = auction[index];
    if ((seat === openingSeat || seat === partner) && call !== undefined && call !== 'Pass') {
      calls.push(call);
    }
  }
  return calls;
}

export function getPartnerSeat (seat: Seat): Seat {
  if (seat === 'N') return 'S';
  if (seat === 'E') return 'W';
  if (seat === 'S') return 'N';
  return 'E';
}

/// getSeatForCallIndex derives the physical bidder from dealer and zero-based auction index.
///
export function getSeatForCallIndex (dealer: Seat, callIndex: number): Seat {
  const seats: Seat[] = ['N', 'E', 'S', 'W'];
  const dealerIndex = seats.indexOf(dealer);
  const seat = seats[(dealerIndex + callIndex) % seats.length];
  if (seat === undefined) {
    throw new Error(`Cannot derive seat for dealer ${dealer} and call index ${callIndex}.`);
  }
  return seat;
}


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
  const callResult = getRuleCalls(rule, context, system);
  const calls = callResult.calls;
  const telemetryLines: string[] = [];
  const candidates: CandidateCallMatch[] = [];
  telemetryLines.push(`Rule ${rule.id}: ${rule.title}.`);
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
    result = evaluateHandConstraint(appliesWhen, call, context);
  }
  telemetryLines.push(...result.telemetryLines);
  if (result.success) {
    telemetryLines.push(`PASS: ${call} satisfies appliesWhen.`);
  } else {
    telemetryLines.push(`FAIL: ${call} does not satisfy appliesWhen.`);
  }
  return { rule, call, ruleApplies: result.success, telemetryLines };
}


/// maybeSuppressConvenientMinor takes all applicable rules for current auction and responder's hand
/// and removes a declarative qualifying convenient-minor opening when an already-evaluated natural
/// 1NT or 2NT opening applies.  We can't cause this mutual exclusion declaratively only, while some
/// better bids do naturally eliminate the fallback convenient minor.  Both the rule-level and
/// candidate-level applicability flags are changed so downstream code sees the convenient-minor
/// rule consistently as no longer applicable.
///
function maybeSuppressConvenientMinor (ruleResults: RuleEvalResult[]): RuleEvalResult[] {
  const convenientMinorResult = ruleResults.find((result) =>
    result.rule.id === 'open-convenient-minor' && result.ruleApplies);
  if (convenientMinorResult === undefined) {
    return ruleResults;
  }
  // We have a convenient minor, so see if there's a NT that trumps the minor rule :-).
  let naturalNtCall: Call | null = null;
  for (const result of ruleResults) {
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
    return ruleResults;
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
  return ruleResults;
} // maybeSuppressConvenientMinor()

/// maybeSuppressJacobyWhenForStayman resolves the 5-4-major overlap between ordinary Stayman and a
/// Jacoby transfer.  With enough strength and 5-4 majors, responder uses Stayman first to look for
/// the four-card-major fit rather than forcing it.  With 5-3 or 5-5 majors, Stayman does not
/// qualify without 4-card major, so transfer remains available.
///
/// agreement.setting === 'jacobyTransfers' by itself does not mean a rule is a Jacoby transfer;
/// it only means that rule's meaning depends on whether Jacoby transfers are enabled.  For example,
/// the direct strong 3H/3S rule also uses that setting.  A Jacoby transfer is therefore identified
/// here by the enabled jacobyTransfers agreement plus the conventional call category.
///
function maybeSuppressTransfersForStayman (ruleResults: RuleEvalResult[]):
    RuleEvalResult[] {
  const staymanResult = ruleResults.find((result) =>
    result.ruleApplies && result.rule.agreement?.setting === 'stayman' &&
    result.rule.agreement.value);
  if (staymanResult === undefined) {
    return ruleResults;
  }
  const staymanCandidate = staymanResult.candidates.find((candidate) => candidate.ruleApplies)!;

  for (const result of ruleResults) {
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
  return ruleResults;
} // maybeSuppressJacobyWhenForStayman()

/// maybeSuppressOneFiveFiveMajorTransfer removes one of the two Jacoby transfers when responder has
/// exactly five cards in each major and the bidding sequence gives one transfer a preferred meaning
/// for this strength.
///
/// This transfer ordering is separate from ordinary natural-suit ordering.  When only natural suit
/// bids are available by partnership agreement, bidding guidelines commonly use up-the-line choices
/// with four-card suits and down-the-line preferences with five-card suits.  With transfers,
/// however, the first artificial bid can instead be chosen to preserve a particular rebid level and
/// thereby communicate strength.
///
/// After 1NT, 8-9 HCP starts with the heart transfer so responder can bid 2S invitationally; 10+
/// HCP starts with the spade transfer so a later 3H is game forcing.  After 2NT, 4+ HCP is already
/// game going, so start with the heart transfer and preserve 3S to show the second major.
///
/// Weak 5-5 hands are intentionally left unresolved.  Modern transfer methods commonly respond with
/// a five-card major even with fewer than eight points rather than automatically passing 1NT,
/// because playing in the major may be better than leaving the contract in NT.  Some bidding
/// methods instead use garbage/crawling Stayman with suitable weak two-major shapes.  For now,
/// don't compares the two major suit qualities, and both weak transfer choices remain available.
///
function maybeSuppressOneFiveOrMoreMajorTransfer (ruleResults: RuleEvalResult[],
                                                context: RuleEvalContext):
    RuleEvalResult[] {
  if (context.handFacts.lengths.H < 5 || context.handFacts.lengths.S < 5) {
    return ruleResults;
  }
  // a 5-card major exists
  let preferredTransfer: Call | null = null;
  if (context.partnerOpeningCall === '1NT') {
    if (context.handFacts.hcp >= 8 && context.handFacts.hcp <= 9) {
      preferredTransfer = '2D'; // Transfer to hearts, then show spades at the two level.
    } else if (context.handFacts.hcp >= 10) {
      preferredTransfer = '2H'; // Transfer to spades, then show hearts at the three level.
    }
  } else if (context.partnerOpeningCall === '2NT' && context.handFacts.hcp >= 4) {
    preferredTransfer = '3D'; // Transfer to hearts, then 3S shows the second major below 3NT.
  }
  if (preferredTransfer === null) {
    return ruleResults;
  }
  // and one is a preferred suit by bidding instructional materials
  const jacobyResults = ruleResults.filter((result) =>
    result.ruleApplies && result.rule.agreement?.setting === 'jacobyTransfers' &&
    result.rule.agreement.value && result.rule.callCategory?.includes('conventional'));
  const preferredExists = jacobyResults.some((result) =>
    result.candidates.some((candidate) =>
      candidate.ruleApplies && candidate.call === preferredTransfer));
  if (! preferredExists) {
    return ruleResults;
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
  return ruleResults;
} // maybeSuppressOneFiveFiveMajorTransfer()

/// maybeSuppressJacobyForDirectMajorSlam resolves the overlap between an ordinary Jacoby transfer
/// and our direct 3H/3S slam-interest treatment.  With Jacoby transfers enabled, a direct 3M shows
/// 16+ HCP, a 6+ card major, and no four-card other major.  When that stronger treatment applies,
/// do not also present the ordinary lower-level Jacoby transfer as an equal first action.
///
/// agreement.setting === 'jacobyTransfers' alone does not identify a Jacoby transfer: the direct
/// 3H/3S rule also depends on that agreement.  The transfer rule is the conventional one; the
/// direct 3M slam-interest rule is natural and game forcing.
///
function maybeSuppressJacobyForDirectMajorSlam (ruleResults: RuleEvalResult[]) :
      RuleEvalResult[] {
  const majorSlamResult = ruleResults.find((result) =>
    result.ruleApplies && result.rule.agreement?.setting === 'jacobyTransfers' &&
    result.rule.agreement.value && result.rule.callCategory?.includes('gameForcing') &&
    ! result.rule.callCategory?.includes('conventional') &&
    result.candidates.some((candidate) =>
      candidate.ruleApplies && (candidate.call === '3H' || candidate.call === '3S')));
  if (majorSlamResult === undefined) {
    return ruleResults;
  }
  // found game forcing direct major
  const majorSlamCandidate = majorSlamResult.candidates.find((candidate) =>
    candidate.ruleApplies && (candidate.call === '3H' || candidate.call === '3S'));
  // if (majorSlamCandidate === undefined) {
  //   return ruleResults;
  // }
  // we know we have a direct slam candidate, so see if there's a jacoby to suppress
  for (const result of ruleResults) {
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
  return ruleResults;
} // maybeSuppressJacobyForDirectMajorSlam()



/// maybeSuppressJacobyForMajorGame resolves the game-only overlap between Jacoby and the system's
/// direct 6+ major game route.  With Texas enabled, that route is a four-level Texas transfer.
/// Without Texas, 4H/4S are natural game signoffs instead.  In either treatment, a game-only hand
/// uses the direct game route rather than first making the lower-level Jacoby transfer.
///
/// The major-game rules themselves exclude another four-card or longer major: 6-4 hands start with
/// Stayman, while two 5+ card majors use a lower-level transfer sequence to describe both suits.
/// Jacoby remains available for weaker/invitational hands and stronger hands needing bidding room.
///
/// 5-3 major shape                 -> Jacoby
/// 5-4 / 6-4 + Stayman strength   -> Stayman
/// 5-5 / 6-5                       -> lower-level transfer route
/// 6-3 + game-only values         -> Texas
/// 6-3 + weaker/invitational      -> Jacoby
/// 6-3 + slam interest            -> slower strong treatment, not Texas
///
function maybeSuppressJacobyForMajorGame (ruleResults: RuleEvalResult[]):
    RuleEvalResult[] {
  // do any results specify a texas transfer result ...  if texas is true, and one applies, then
  // suppress jacoby, and if texas is off for an applicable rule, and a natural 4M applies, then
  // suppress jacoby
  const majorGameResult = ruleResults.find((result) =>
    result.ruleApplies && result.rule.agreement?.setting === 'texasTransfers'); //&&
    // result.rule.agreement.value && result.rule.callCategory?.includes('conventional'));
  if (majorGameResult === undefined) {
    return ruleResults;
  }
  const majorGameCandidate = majorGameResult.candidates.find((candidate) => candidate.ruleApplies)!;
  // if (majorGameCandidate === undefined) {
  //   return ruleResults;
  // }
  // We have the system's direct major-game route, so see if a competing Jacoby transfer applies.
  for (const result of ruleResults) {
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
  return ruleResults;
} // maybeSuppressJacobyForMajorGame()



/// maybeSuppressNtResponseFallback takes all applicable rules for current auction and responder's
/// hand and removes a direct Pass or natural notrump response to a 1NT opening when an
/// major-oriented response should come first.  This keeps the point-range NT ladder declarative in
/// bidding rules while resolving choice with major-suit bids.
///
/// With Jacoby transfers available, responder first shows a five-card-or-longer major and then
/// describes strength:
///   0-7 + 5-card major -> transfer, then pass
///   8-9 + 5-card major -> transfer, then bid 2NT
///   10+ + 5-card major -> transfer, then bid 3NT or otherwise describe the hand
///
/// Using rule agreements rather than testing IDs give a clean result consistent with bidding books:
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
function maybeSuppressNtResponseFallback (ruleResults: RuleEvalResult[]) :
    RuleEvalResult[] {
  // Find first response rule associated with one of our major-oriented NT-response treatments: for
  // example, with transfers on, find rules like respond-to-1nt-w/-stayman and
  // respond-to-1nt-w/-transfer-to-hearts, but with transfers off (those rules aren't in result
  // set), find things like respond-to-1nt-w/-2h-2s-natural-signoff and
  // respond-to-1nt-w/-3h-3s-natural-forcing.
  const majorActionResult = ruleResults.find((result) => {
    if (! result.ruleApplies) {
      return false;
    }
    const setting = result.rule.agreement?.setting;
    return setting === 'stayman' || setting === 'jacobyTransfers' || setting === 'texasTransfers';
  });
  if (majorActionResult === undefined) {
    return ruleResults;
  }
  const majorCandidate = majorActionResult.candidates.find((candidate) => candidate.ruleApplies)!;
  // if (majorCandidate === undefined) {
  //   return ruleResults;
  // }
  // Since we have a major bid, look for NT bids we should suppress since we prefer majors
  for (const result of ruleResults) {
    let suppressed = false;
    for (const candidate of result.candidates) {
      const isNtFallback = candidate.call === 'Pass' ||
        (isContractBid(candidate.call) && getStrainFromSuitBid(candidate.call) === 'NT');
      if (! candidate.ruleApplies || ! isNtFallback) {
        continue;
      }
      const suppressionLine =
        `SUPPRESSED: ${majorCandidate.call} is a preferred major-oriented response, ` +
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
  return ruleResults;
} // maybeSuppressNtResponseFallback()

/// maybeSuppressMajorOneNtResponse takes all applicable rules for current auction and responder's
/// hand and removes the no-support 1NT response when responder already has a qualifying one-level
/// new-suit response.  After 1H, four or more spades are shown with 1S; the 1NT response is the
/// fallback when that preferred one-level response is unavailable.
///
function maybeSuppress1NTWhenMajorSupport (ruleResults: RuleEvalResult[]) :
      RuleEvalResult[] {
  const newSuitResult = ruleResults.find((result) =>
    result.rule.id === 'respond-to-major-w/o-support-new-suit-one-level' &&
    result.ruleApplies);
  if (newSuitResult === undefined) { // don't suppress anything, no valid one suit bid found
    return ruleResults;
  }
  const newSuitCandidate = newSuitResult.candidates.find(
    (candidate) => candidate.ruleApplies)!;
  const oneNtResult = ruleResults.find((result) =>
    (result.rule.id === 'respond-to-major-w/o-support-1nt-twooverone' ||
     result.rule.id === 'respond-to-major-w/o-support-1nt-standard') &&
    result.ruleApplies);
  if (oneNtResult === undefined) {
    return ruleResults;
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
  return ruleResults;
} // maybeSuppressMajorOneNtResponse()


export function auctionIsComplete (auction: Call[]): boolean {
  return auction.length >= 4 &&
    auction.slice(-3).every((call) => call === 'Pass');
}


///
//// Evaluate Hand Constraints against Calls
///

/// evaluateHandConstraint evaluates rule.appliesWhen's HandConstraint against a call.  Fields not
/// supported by the first punch-through fail closed so unsupported rule data does not silently
/// produce advice.
///
function evaluateHandConstraint (constraint: HandConstraint, call: Call, 
                                 context: RuleEvalContext)
                                : AppliesWhenResult {
  const telemetryLines: string[] = [];
  let pass = true;
  if (constraint.hcp !== undefined) {
    const result = testPointRange(context.handFacts.hcp, constraint.hcp, 'HCP');
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
  if (constraint.anySuitLength !== undefined) {
    telemetryLines.push('UNSUPPORTED: anySuitLength is not evaluated in the first punch-through.');
    pass = false;
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
  if (constraint.stoppers !== undefined) {
    telemetryLines.push('UNSUPPORTED: stoppers is not evaluated in the first punch-through.');
    pass = false;
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
/// suit/major/minor is explicit; an omitted suit means the candidate call's suit.  anySuitLength is
/// reserved for the different semantics of asking whether some arbitrary suit in the hand meets a
/// condition.
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
  if (shape.text !== undefined && shape.text !== '') {
    telemetryLines.push('UNSUPPORTED: shape.text is not evaluated in the first punch-through.');
    pass = false;
  }
  return { pass, telemetryLines };
} //testHandShape()

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
    const opening = context.partnerOpeningCall;
    if (opening === null || !isContractBid(opening)) {
      return null;
    }
    const strain = getStrainFromSuitBid(opening);
    return strain === 'NT' ? null : strain;
  }

  if (context.stage === 'openerRebid') {
    const responderCall = getRuleAuction(context)[1];
    if (responderCall === undefined || !isContractBid(responderCall)) {
      return null;
    }
    const strain = getStrainFromSuitBid(responderCall);
    return strain === 'NT' ? null : strain;
  }

  return null;
}

///
//// Rule Testing Utilities -- interpreting rule declarations in context of actual hands, etc.
///

/// auctionContextMatches tests whether a rule's stage and declared auction constraints match the
/// actual evaluation context before any hand constraints are considered.  Older/exact rules may
/// use a representative compact auction; newer rebid rules can describe responder's call by its
/// semantic properties instead of enumerating every suit permutation.
///
function auctionContextMatches (ruleContext: AuctionContext | undefined,
                               evalContext: RuleEvalContext): boolean {
  if (ruleContext === undefined) {
    return true;
  }
  if (ruleContext.stage !== evalContext.stage) {
    return false;
  }

  const actualAuction = getRuleAuction(evalContext);
  const actualOpening = actualAuction[0];
  if (ruleContext.openerStrain !== undefined &&
      (actualOpening === undefined ||
       ! openerStrainMatches(ruleContext.openerStrain, actualOpening))) {
    return false;
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
      if (ruleCall === actualCall) {
        continue;
      }
      if (index === 0 && ruleContext.openerStrain !== undefined &&
          openerStrainMatches(ruleContext.openerStrain, actualCall)) {
        continue;
      }
      return false;
    }
  }

  if (ruleContext.responderCall !== undefined) {
    const actualResponse = actualAuction[1];
    if (actualOpening === undefined || actualResponse === undefined ||
        ! responderCallMatches(ruleContext.responderCall, actualOpening, actualResponse)) {
      return false;
    }
  }

  return true;
}

function responderCallMatches (constraint: ResponderCallContext, openingCall: Call,
                               responseCall: Call): boolean {
  if (! isContractBid(openingCall) || ! isContractBid(responseCall)) {
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
  if (constraint.level !== undefined && constraint.level !== responseLevel) {
    return false;
  }
  if (constraint.jump !== undefined &&
      constraint.jump !== responseIsJump(openingCall, responseCall)) {
    return false;
  }
  return true;
}

function responseIsJump (openingCall: SuitBid, responseCall: SuitBid): boolean {
  const responseStrain = getStrainFromSuitBid(responseCall);
  let cheapestLevel = Number(openingCall.substring(0, 1));
  const openingRank = contractBidRank(openingCall);
  const sameLevelCall = `${cheapestLevel}${responseStrain}` as SuitBid;
  if (contractBidRank(sameLevelCall) <= openingRank) {
    cheapestLevel += 1;
  }
  return Number(responseCall.substring(0, 1)) > cheapestLevel;
}

function contractBidRank (call: SuitBid): number {
  const level = Number(call.substring(0, 1));
  const strain = getStrainFromSuitBid(call);
  return (level - 1) * strainOrder.length + strainOrder.indexOf(strain);
}

/// getRuleAuction derives the compact uncontested partnership auction used by current rule
/// declarations from the authoritative physical auction.  Opponent passes remain in context.auction
/// and are not duplicated in every rule declaration.  
///
/// THIS IS SUSPICIOUS CODE, and need to decide best rectification of bid rule auction
/// representation, whether rules need an abstract represenation, whether eval/refiner/applies
/// functions should match a full auction to a bid rule auction represenatation so that rules that
/// still apply regardless of intervening bids or passes don't need a rule for each permutation.
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

  if (openerStrain === 'major') {
    return callSuit === 'H' || callSuit === 'S';
  }

  if (openerStrain === 'minor') {
    return callSuit === 'C' || callSuit === 'D';
  }

  return callSuit === openerStrain;
}

/// getRuleCalls returns a rule's declared calls, or lets callRefinement narrow them for the actual
/// auction.
///
function getRuleCalls (rule: BidRule, context: RuleEvalContext,
                       system: BiddingSystem): { calls: Call[]; telemetryLines: string[] } {
  if (rule.calls === undefined) {
    return { calls: [], telemetryLines: [] };
  }
  if (rule.callRefinement === undefined) {
    return { calls: rule.calls, telemetryLines: [] };
  }
  return rule.callRefinement(rule.calls, context, system);
}
