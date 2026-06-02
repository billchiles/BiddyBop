/// User input and given a hand, auction context, user call, and rules, explain which rules apply 
/// and whether the user call is accepted by any of them.
///
import type { AuctionContext, BidRule, Call, HandConstraint, PointRange,  
              SuitLengthConstraint, Strain, SuitBid, 
              HandShapeConstraint} from './bidding-convention-types';
import { type Hand, type HandFacts, type Suit } from './cards';


/// user input -> normalize to Call -> build RuleEvaluationContext
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

/// Rule evaluation context is the bridge state plus hand characterization facts used by the
/// first punch-through evaluator.  It only contains facts this evaluator can test mechanically.
///
export interface RuleEvaluationContext {
  role: 'opener' | 'responder';
  auction: Call[];
  hand: Hand;
  handFacts: HandFacts;
  partnerOpeningCall: Call | null;
}

/// UserBidEvaluationResult is the result type for evaluateUserCall, and it represents the bid
/// relative to rules and hand, not the best-bid judgment.
/// 
export interface UserBidEvaluationResult {
  normalizedCall: Call | null;
  userCallMatchingRules: BidRule[]; // Subset of handMatchingRules that match user's bid
  handMatchingRules: BidRule[]; // Rules that match the hand, ruleResults elt.ruleApplies is true
  ruleResults: RuleEvaluationResult[]; // one element for every rule in rule DB
  telemetryLines: string[];
}

/// Represents (possibly) multiple call candidates from a matching rule because a rule can contain
/// several calls.
///
export interface RuleEvaluationResult {
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
export function getApplicableCandidateCalls (result: UserBidEvaluationResult): CandidateCallMatch[] {
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
/// This does not choose the best bid.  It reports which rules apply to the hand/context
/// and which of those rules, if any, match the user's call.
///
export function evaluateUserCall (inputCall: Call, rules: BidRule[], 
                                  context: RuleEvaluationContext): UserBidEvaluationResult {
  const telemetryLines: string[] = [];
  telemetryLines.push(`evaluateUserCall: User call is ${inputCall}.`);
  // Find applicable bidding rules
  const ruleResults = evaluateRules(rules, context);
  const applicableRules = ruleResults.filter((result) => result.ruleApplies).map((result) => result.rule);
  const matchingRulesForUserCall: BidRule[] = [];
  // Report rule eval telemetry and collect matching candidate calls
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

/// evaluateRules filters all opening/responding rules to matching rules in the current auction 
/// context, then evaluates each remaining rule against the current hand.
///
export function evaluateRules (rules: BidRule[], context: RuleEvaluationContext): RuleEvaluationResult[] {
  return rules
    .filter((rule) => rule.kind === 'openingBid' || rule.kind === 'responseBid')
    .filter((rule) => auctionContextMatches(rule.auctionContext, context))
    .map((rule) => evaluateRule(rule, context));
}

function evaluateRule (rule: BidRule, context: RuleEvaluationContext): RuleEvaluationResult {
  const calls = getRuleCalls(rule);
  const telemetryLines: string[] = [];
  const candidates: CandidateCallMatch[] = [];

  telemetryLines.push(`Rule ${rule.id}: ${rule.title}.`);

  if (calls.length === 0) {
    telemetryLines.push('  FAIL: rule has no calls.');
    return { rule, candidates, ruleApplies: false, telemetryLines };
  }

  telemetryLines.push(`  Rule has ${calls.length} call(s): ${calls.join(', ')}.`);

  for (const call of calls) {
    const candidate = evaluateCandidateCall(rule, call, context);
    candidates.push(candidate);

    for (const line of candidate.telemetryLines) {
      telemetryLines.push(`  ${line}`);
    }
  }

  const pass = candidates.some((candidate) => candidate.ruleApplies);

  if (pass) {
    telemetryLines.push(`  PASS: at least one call candidate matched.`);
  } else {
    telemetryLines.push(`  FAIL: no call candidate matched.`);
  }

  return { rule, candidates, ruleApplies: pass, telemetryLines };
}

/// evaluateCandidateCall evaluates one concrete call from one rule.  If no appliesWhen:, then the
/// rule applies at any point in an auction.
///
function evaluateCandidateCall (rule: BidRule, call: Call, 
                                context: RuleEvaluationContext): CandidateCallMatch {
  const telemetryLines: string[] = [];
  telemetryLines.push(`evaluateCandidateCall: Candidate ${call}.`);
  const constraint = rule.appliesWhen;
  if (constraint === undefined) {
    telemetryLines.push('PASS: no appliesWhen constraint.');
    return { rule, call, ruleApplies: true, telemetryLines };
  }
  // check appliesWhen
  const constraintResult = evaluateHandConstraint(constraint, call, context);
  telemetryLines.push(...constraintResult.telemetryLines);
  if (constraintResult.pass) {
    telemetryLines.push(`PASS: ${call} satisfies appliesWhen.`);
  } else {
    telemetryLines.push(`FAIL: ${call} does not satisfy appliesWhen.`);
  }
  return { rule, call, ruleApplies: constraintResult.pass, telemetryLines };
}

///
//// Evaluate Hand Constraints against Calls
///

/// evaluateHandConstraint evaluates rule.appliesWhen's HandConstraint against a call.
/// Fields not supported by the first punch-through fail closed so unsupported
/// rule data does not silently produce advice.
///
function evaluateHandConstraint (constraint: HandConstraint, call: Call, 
                                 context: RuleEvaluationContext)
                                : { pass: boolean; telemetryLines: string[] } {
  const telemetryLines: string[] = [];
  let pass = true;
  if (constraint.hcp !== undefined) {
    const result = testPointRange(context.handFacts.hcp, constraint.hcp, 'HCP');
    telemetryLines.push(result.telemetryLine);
    pass = pass && result.pass;
  }
  if (constraint.pointsWLen !== undefined) {
    const result = testPointRange(context.handFacts.totalPointsWLength, constraint.pointsWLen, 
                                  'total points');
    telemetryLines.push(result.telemetryLine);
    pass = pass && result.pass;
  }
  if (constraint.pointsWShorts !== undefined) {
    const result = testPointRange(context.handFacts.lengthPoints, constraint.pointsWShorts, 
                                  'distribution points');
    telemetryLines.push(result.telemetryLine);
    pass = pass && result.pass;
  }
  if (constraint.dummyPoints !== undefined) {
    telemetryLines.push('UNSUPPORTED: dummyPoints is not evaluated in the first punch-through.');
    pass = false;
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
  if (constraint.supportFor !== undefined || constraint.supportLength !== undefined) {
    const result = testSupportFor(constraint.supportFor, constraint.supportLength, context);
    telemetryLines.push(result.telemetryLine);
    pass = pass && result.pass;
  }
  if (constraint.stoppers !== undefined) {
    telemetryLines.push('UNSUPPORTED: stoppers is not evaluated in the first punch-through.');
    pass = false;
  }
  return { pass, telemetryLines };
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

/// testSuitLengths takes a suit constraint length for a bidding rule and compares it to the
/// partner's call and the bidder's hand.  NOTE, if their are no targets suits, then no suit was
/// specified, and partners call was NT.
///
function testSuitLengths (constraint: SuitLengthConstraint, call: Call, handFacts: HandFacts)
                         : { pass: boolean; telemetryLine: string } {
  const targetSuits = getSuitsForLengthTesting(constraint, call);
  if (targetSuits.length === 0) {
    return { pass: false, telemetryLine: `FAIL: no target suit for suit length constraint on call ${call}.` };
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
    return { pass: true, telemetryLine: `PASS: ${suit} length ${length} satisfies suit length constraint.` };
  }
  return { pass: false, telemetryLine: `FAIL: no target suit satisfied suit length constraint for call ${call}.` };
}

/// Returns the suit(s) that a suit-length constraint applies to.  If the rule specifies a specific 
/// suit, use that suit.  If the rule omits the suit, apply the constraint to the candidate call's 
/// suit.  This is usually used for a response rule, so the suit length constraint is about the
/// partner's suit.  There an anySuitLength rule property for those semantics.
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

/// testHandShapeMatches checks the handFacts against the shape constraints -- balanced, lengths, etc.
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
  if (shape.semiBalanced !== undefined) {
    const thisPass = handFacts.semiBalanced === shape.semiBalanced;
    telemetryLines.push(`${thisPass ? 'PASS' : 'FAIL'}: semiBalanced is ${handFacts.semiBalanced}.`);
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

// function noFourCardOtherMajorMatches (call: Call, handFacts: HandFacts): boolean {
//   if (! isContractBid(call)) {
//     return handFacts.hasFourCardMajor === false;
//   }
//   const callSuit = getStrainFromSuitBid(call);
//   if (callSuit === 'H') {
//     return handFacts.lengths.S < 4;
//   }
//   if (callSuit === 'S') {
//     return handFacts.lengths.H < 4;
//   }
//   return handFacts.hasFourCardMajor === false;
// }

/// supportMatches determines whether the responder satisfies a support requirement from a bidding  
/// rule.  A rule may require support for opener's suit and may require a minimum support length.
/// supportLength may be undefined because it comes from a declared rule that may omit the property.
///
function testSupportFor (supportFor: HandConstraint['supportFor'], 
                         supportLength: PointRange | undefined, 
                         context: RuleEvaluationContext): { pass: boolean; telemetryLine: string } {
  // Use suit, NT-oriented rules should use shape or balanced-hand constraints instead.
  const supportSuit = getSupportSuit(supportFor, context.partnerOpeningCall);
  if (supportSuit === null) { // support Strain was NT or undefined
    return { pass: false, telemetryLine: 'supportFor hand constraint undefined or NT.' };
  }
  if (supportLength === undefined) {
    return { pass: true, telemetryLine: `PASS: support suit ${supportSuit} is available.` };
  }
  const length = context.handFacts.lengths[supportSuit];
  const result = testPointRange(length, supportLength, `${supportSuit} support length`);
  return { pass: result.pass, telemetryLine: result.telemetryLine };
}

/// getSupportSuit resolves a rule support target to a specific suit.  This returns null for NT 
/// so callers can distinguish.  
///
function getSupportSuit (supportFor: HandConstraint['supportFor'], 
                         partnerOpeningCall: Call | null): Suit | null {
  if (supportFor === undefined) { // no required suit constraint
    return null;
  }
  if (supportFor !== 'partnersOpenedSuit') {
    if (supportFor === 'NT') return null;
    return supportFor;
  }
  if (partnerOpeningCall === null || ! isContractBid(partnerOpeningCall)) {
    // If partner bid doesn't exist or is not a contract bid, then no suit to support.
    return null;
  }
  const partnerOpeningStrain = getStrainFromSuitBid(partnerOpeningCall);
  if (partnerOpeningStrain === 'NT') {
    return null;
  }
  return partnerOpeningStrain;
}

///
//// Rule Testing Utilities -- interpreting rule declarations in context of actual hands, etc.
///

/// BETTERNAME
function auctionContextMatches (ruleContext: AuctionContext | undefined, 
                         evaluationContext: RuleEvaluationContext): boolean {
  if (ruleContext === undefined) {
    return true;
  }

  if (ruleContext.role !== evaluationContext.role) {
    return false;
  }

  if (ruleContext.auction.length !== evaluationContext.auction.length) {
    return false;
  }

  for (let index = 0; index < ruleContext.auction.length; index += 1) {
    const ruleCall = ruleContext.auction[index];
    const actualCall = evaluationContext.auction[index];

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

  return true;
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

function getRuleCalls(rule: BidRule): Call[] {
  if (rule.calls === undefined) {
    return [];
  }

  return rule.calls;
}
