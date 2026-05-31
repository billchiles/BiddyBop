import type { AuctionContext, BidRule, Call, HandConstraint, PointRange, Suit, SuitLengthConstraint } from './bidding-convention-types';
import { getSuitFromSuitBid, isSuitBid, type Hand, type HandFacts } from './cards';

/// Rule evaluation context carries only facts the first punch-through can evaluate.
export interface RuleEvaluationContext {
  role: 'opener' | 'responder';
  auction: Call[];
  hand: Hand;
  handFacts: HandFacts;
  partnerOpeningCall: Call | null;
}

/// A candidate is one possible call from one rule.
export interface CandidateCallMatch {
  rule: BidRule;
  call: Call;
  pass: boolean;
  telemetryLines: string[];
}

/// Rule evaluation returns per-call candidates because one rule can contain several calls.
export interface RuleEvaluationResult {
  rule: BidRule;
  candidates: CandidateCallMatch[];
  pass: boolean;
  telemetryLines: string[];
}

/// User bid evaluation is intentionally descriptive, not best-bid judgment.
export interface UserBidEvaluationResult {
  normalizedCall: Call | null;
  matchingRulesForUserCall: BidRule[];
  applicableRules: BidRule[];
  ruleResults: RuleEvaluationResult[];
  telemetryLines: string[];
}

export function evaluateUserCall(inputCall: Call | null, rules: BidRule[], context: RuleEvaluationContext): UserBidEvaluationResult {
  const ruleResults = evaluateRules(rules, context);
  const applicableRules = ruleResults.filter((result) => result.pass === true).map((result) => result.rule);
  const matchingRulesForUserCall: BidRule[] = [];
  const telemetryLines: string[] = [];

  if (inputCall === null) {
    telemetryLines.push('No valid user call entered yet.');
  } else {
    telemetryLines.push(`User call: ${inputCall}.`);
  }

  for (const ruleResult of ruleResults) {
    telemetryLines.push(...ruleResult.telemetryLines);

    if (inputCall !== null) {
      const matchingCandidate = ruleResult.candidates.find(
        (candidate) => candidate.pass === true && candidate.call === inputCall,
      );

      if (matchingCandidate !== undefined) {
        matchingRulesForUserCall.push(ruleResult.rule);
      }
    }
  }

  if (inputCall !== null && matchingRulesForUserCall.length === 0) {
    telemetryLines.push(`User call ${inputCall} did not satisfy any currently applicable rule.`);
  }

  if (inputCall !== null && matchingRulesForUserCall.length > 0) {
    telemetryLines.push(`User call ${inputCall} satisfied ${matchingRulesForUserCall.length} rule(s).`);
  }

  telemetryLines.push(`Applicable rule count: ${applicableRules.length}.`);

  return {
    normalizedCall: inputCall,
    matchingRulesForUserCall,
    applicableRules,
    ruleResults,
    telemetryLines,
  };
}

export function evaluateRules(rules: BidRule[], context: RuleEvaluationContext): RuleEvaluationResult[] {
  return rules
    .filter((rule) => rule.kind === 'openingBid' || rule.kind === 'responseBid')
    .filter((rule) => contextMatches(rule.context, context) === true)
    .map((rule) => evaluateRule(rule, context));
}

export function getApplicableCandidateCalls(result: UserBidEvaluationResult): CandidateCallMatch[] {
  const candidates: CandidateCallMatch[] = [];

  for (const ruleResult of result.ruleResults) {
    for (const candidate of ruleResult.candidates) {
      if (candidate.pass === true) {
        candidates.push(candidate);
      }
    }
  }

  return candidates;
}

function evaluateRule(rule: BidRule, context: RuleEvaluationContext): RuleEvaluationResult {
  const calls = getRuleCalls(rule);
  const telemetryLines: string[] = [];
  const candidates: CandidateCallMatch[] = [];

  telemetryLines.push(`Rule ${rule.id}: ${rule.title}.`);

  if (calls.length === 0) {
    telemetryLines.push('  FAIL: rule has no calls.');
    return { rule, candidates, pass: false, telemetryLines };
  }

  telemetryLines.push(`  Rule has ${calls.length} call(s): ${calls.join(', ')}.`);

  for (const call of calls) {
    const candidate = evaluateCandidateCall(rule, call, context);
    candidates.push(candidate);

    for (const line of candidate.telemetryLines) {
      telemetryLines.push(`  ${line}`);
    }
  }

  const pass = candidates.some((candidate) => candidate.pass === true);

  if (pass === true) {
    telemetryLines.push(`  PASS: at least one call candidate matched.`);
  } else {
    telemetryLines.push(`  FAIL: no call candidate matched.`);
  }

  return { rule, candidates, pass, telemetryLines };
}

function evaluateCandidateCall(rule: BidRule, call: Call, context: RuleEvaluationContext): CandidateCallMatch {
  const telemetryLines: string[] = [];
  const constraint = rule.appliesWhen;

  telemetryLines.push(`Candidate ${call}.`);

  if (constraint === undefined) {
    telemetryLines.push('PASS: no appliesWhen constraint.');
    return { rule, call, pass: true, telemetryLines };
  }

  const constraintResult = evaluateHandConstraint(constraint, call, context);
  telemetryLines.push(...constraintResult.telemetryLines);

  if (constraintResult.pass === true) {
    telemetryLines.push(`PASS: ${call} satisfies appliesWhen.`);
  } else {
    telemetryLines.push(`FAIL: ${call} does not satisfy appliesWhen.`);
  }

  return { rule, call, pass: constraintResult.pass, telemetryLines };
}

function evaluateHandConstraint(constraint: HandConstraint, call: Call, context: RuleEvaluationContext): { pass: boolean; telemetryLines: string[] } {
  const telemetryLines: string[] = [];
  let pass = true;

  if (constraint.hcp !== undefined) {
    const result = pointRangeMatches(context.handFacts.hcp, constraint.hcp, 'HCP');
    telemetryLines.push(result.telemetryLine);
    pass = pass && result.pass;
  }

  if (constraint.totalPoints !== undefined) {
    const result = pointRangeMatches(context.handFacts.totalPoints, constraint.totalPoints, 'total points');
    telemetryLines.push(result.telemetryLine);
    pass = pass && result.pass;
  }

  if (constraint.distributionPoints !== undefined) {
    const result = pointRangeMatches(context.handFacts.distributionPoints, constraint.distributionPoints, 'distribution points');
    telemetryLines.push(result.telemetryLine);
    pass = pass && result.pass;
  }

  if (constraint.dummyPoints !== undefined) {
    telemetryLines.push('UNSUPPORTED: dummyPoints is not evaluated in the first punch-through.');
    pass = false;
  }

  if (constraint.suitLengths !== undefined) {
    for (const suitLength of constraint.suitLengths) {
      const result = suitLengthMatches(suitLength, call, context.handFacts);
      telemetryLines.push(result.telemetryLine);
      pass = pass && result.pass;
    }
  }

  if (constraint.anySuitLength !== undefined) {
    telemetryLines.push('UNSUPPORTED: anySuitLength is not evaluated in the first punch-through.');
    pass = false;
  }

  if (constraint.shape !== undefined) {
    const result = shapeMatches(constraint.shape, call, context.handFacts);
    telemetryLines.push(...result.telemetryLines);
    pass = pass && result.pass;
  }

  if (constraint.supportFor !== undefined || constraint.supportLength !== undefined) {
    const result = supportMatches(constraint.supportFor, constraint.supportLength, context);
    telemetryLines.push(result.telemetryLine);
    pass = pass && result.pass;
  }

  if (constraint.stoppers !== undefined) {
    telemetryLines.push('UNSUPPORTED: stoppers is not evaluated in the first punch-through.');
    pass = false;
  }

  return { pass, telemetryLines };
}

function pointRangeMatches(value: number, range: PointRange, label: string): { pass: boolean; telemetryLine: string } {
  if (range.min !== undefined && value < range.min) {
    return { pass: false, telemetryLine: `FAIL: ${label} ${value} < minimum ${range.min}.` };
  }

  if (range.max !== undefined && value > range.max) {
    return { pass: false, telemetryLine: `FAIL: ${label} ${value} > maximum ${range.max}.` };
  }

  return { pass: true, telemetryLine: `PASS: ${label} ${value} is in range.` };
}

function suitLengthMatches(constraint: SuitLengthConstraint, call: Call, handFacts: HandFacts): { pass: boolean; telemetryLine: string } {
  const targetSuits = getTargetSuitsForLengthConstraint(constraint, call);

  if (targetSuits.length === 0) {
    return { pass: false, telemetryLine: `FAIL: no target suit for suit length constraint on call ${call}.` };
  }

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

function getTargetSuitsForLengthConstraint(constraint: SuitLengthConstraint, call: Call): Suit[] {
  if (constraint.suit === 'major') {
    if (isSuitBid(call) === true) {
      const callSuit = getSuitFromSuitBid(call);

      if (callSuit === 'H' || callSuit === 'S') {
        return [callSuit];
      }
    }

    return ['H', 'S'];
  }

  if (constraint.suit === 'minor') {
    if (isSuitBid(call) === true) {
      const callSuit = getSuitFromSuitBid(call);

      if (callSuit === 'C' || callSuit === 'D') {
        return [callSuit];
      }
    }

    return ['C', 'D'];
  }

  if (constraint.suit !== undefined) {
    return [constraint.suit];
  }

  if (isSuitBid(call) === true) {
    const callSuit = getSuitFromSuitBid(call);

    if (callSuit !== 'NT') {
      return [callSuit];
    }
  }

  return [];
}

function shapeMatches(shape: NonNullable<HandConstraint['shape']>, call: Call, handFacts: HandFacts): { pass: boolean; telemetryLines: string[] } {
  const telemetryLines: string[] = [];
  let pass = true;

  if (shape.balanced !== undefined) {
    const thisPass = handFacts.balanced === shape.balanced;
    telemetryLines.push(`${thisPass === true ? 'PASS' : 'FAIL'}: balanced is ${handFacts.balanced}.`);
    pass = pass && thisPass;
  }

  if (shape.semiBalanced !== undefined) {
    const thisPass = handFacts.semiBalanced === shape.semiBalanced;
    telemetryLines.push(`${thisPass === true ? 'PASS' : 'FAIL'}: semiBalanced is ${handFacts.semiBalanced}.`);
    pass = pass && thisPass;
  }

  if (shape.noVoid !== undefined) {
    const thisPass = shape.noVoid === true ? handFacts.voidCount === 0 : true;
    telemetryLines.push(`${thisPass === true ? 'PASS' : 'FAIL'}: void count is ${handFacts.voidCount}.`);
    pass = pass && thisPass;
  }

  if (shape.noSingleton !== undefined) {
    const thisPass = shape.noSingleton === true ? handFacts.singletonCount === 0 : true;
    telemetryLines.push(`${thisPass === true ? 'PASS' : 'FAIL'}: singleton count is ${handFacts.singletonCount}.`);
    pass = pass && thisPass;
  }

  if (shape.maxDoubletons !== undefined) {
    const thisPass = handFacts.doubletonCount <= shape.maxDoubletons;
    telemetryLines.push(`${thisPass === true ? 'PASS' : 'FAIL'}: doubleton count is ${handFacts.doubletonCount}.`);
    pass = pass && thisPass;
  }

  if (shape.noFourCardMajor !== undefined) {
    const thisPass = shape.noFourCardMajor === true ? handFacts.hasFourCardMajor === false : true;
    telemetryLines.push(`${thisPass === true ? 'PASS' : 'FAIL'}: hasFourCardMajor is ${handFacts.hasFourCardMajor}.`);
    pass = pass && thisPass;
  }

  if (shape.noFourCardOtherMajor !== undefined) {
    const thisPass = noFourCardOtherMajorMatches(call, handFacts);
    telemetryLines.push(`${thisPass === true ? 'PASS' : 'FAIL'}: noFourCardOtherMajor for ${call}.`);
    pass = pass && thisPass;
  }

  if (shape.noFiveCardMajor !== undefined) {
    const thisPass = shape.noFiveCardMajor === true ? handFacts.hasFiveCardMajor === false : true;
    telemetryLines.push(`${thisPass === true ? 'PASS' : 'FAIL'}: hasFiveCardMajor is ${handFacts.hasFiveCardMajor}.`);
    pass = pass && thisPass;
  }

  if (shape.text !== undefined && shape.text !== '') {
    telemetryLines.push('UNSUPPORTED: shape.text is not evaluated in the first punch-through.');
    pass = false;
  }

  return { pass, telemetryLines };
}

function noFourCardOtherMajorMatches(call: Call, handFacts: HandFacts): boolean {
  if (isSuitBid(call) !== true) {
    return handFacts.hasFourCardMajor === false;
  }

  const callSuit = getSuitFromSuitBid(call);

  if (callSuit === 'H') {
    return handFacts.lengths.S < 4;
  }

  if (callSuit === 'S') {
    return handFacts.lengths.H < 4;
  }

  return handFacts.hasFourCardMajor === false;
}

function supportMatches(supportFor: HandConstraint['supportFor'], supportLength: PointRange | undefined, context: RuleEvaluationContext): { pass: boolean; telemetryLine: string } {
  const supportSuit = getSupportSuit(supportFor, context.partnerOpeningCall);

  if (supportSuit === null) {
    return { pass: false, telemetryLine: 'FAIL: could not determine support suit.' };
  }

  if (supportLength === undefined) {
    return { pass: true, telemetryLine: `PASS: support suit ${supportSuit} is available.` };
  }

  const length = context.handFacts.lengths[supportSuit];
  const result = pointRangeMatches(length, supportLength, `${supportSuit} support length`);
  return { pass: result.pass, telemetryLine: result.telemetryLine };
}

function getSupportSuit(supportFor: HandConstraint['supportFor'], partnerOpeningCall: Call | null): Suit | null {
  if (supportFor === undefined) {
    return null;
  }

  if (supportFor !== 'partnersOpenedSuit') {
    return supportFor;
  }

  if (partnerOpeningCall === null) {
    return null;
  }

  if (isSuitBid(partnerOpeningCall) !== true) {
    return null;
  }

  return getSuitFromSuitBid(partnerOpeningCall);
}

function contextMatches(ruleContext: AuctionContext | undefined, evaluationContext: RuleEvaluationContext): boolean {
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

    if (index === 0 && ruleContext.openerStrain !== undefined && openerStrainMatches(ruleContext.openerStrain, actualCall) === true) {
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

  if (isSuitBid(call) !== true) {
    return false;
  }

  const callSuit = getSuitFromSuitBid(call);

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
