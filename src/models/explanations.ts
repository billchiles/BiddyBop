/// Student-facing call explanations grounded in evidence produced by the bidding rules.
/// The qualification and selection decisions remain in their existing rule functions.

import type { CallEvidence, BidRule, Call } from './bidding-types';
import type { BidEvalResult, CandidateCallMatch } from './biddingEvaluation';

///
//// Opening bid explanations
///

const NATURAL_NT_AND_STRONG_TWO_CLUB_IDS = [
  'open-1nt-balanced-15-17', 'open-1nt-balanced-16-18',
  'open-1nt-five-card-length-upgrade', 'open-2nt-balanced-20-21',
  'open-2c-strong-artificial',
];

/// Return a short hand-specific line only for a qualifying rule that supplied evidence.
/// Rule meaning, guidance, and ID remain in the existing explanation builder.
export function getOpeningRequirementSupportLine(result: BidEvalResult, rule: BidRule): string | null {
  if (!NATURAL_NT_AND_STRONG_TWO_CLUB_IDS.includes(rule.id)) return null;
  const candidate = openingRequirementCandidate(result, rule.id);
  if (candidate?.ruleApplies !== true) return null;
  const checks = openingChecks(candidate);
  if (checks === null) return null;
  if (checks.fiveCardMajor !== undefined) {
    return `Your balanced hand has ${checks.hcp.actual} HCP and a five-card major, ` +
      'meeting the selected 5-card major 1NT upgrade.';
  }
  if (checks.balanced !== undefined) {
    return `Your hand has ${checks.hcp.actual} HCP (within ${hcpRangeText(checks.hcp)}) ` +
      'and is balanced.';
  }
  return `Your hand has ${checks.hcp.actual} HCP, meeting the ` +
    `${hcpRangeText(checks.hcp)} requirement.`;
}

/// Explain the specific requirements for an unsupported notrump or strong 2C opening. Do not infer
/// rejection from absent rules; only candidates actually checked by the evaluator are used.
export function getOpeningRequirementFailureLines(result: BidEvalResult): string[] {
  if (result.userCallMatchingRules.length !== 0) return [];
  const call: Call | null = result.normalizedCall;
  if (call !== '1NT' && call !== '2NT' && call !== '2C') return [];
  const lines: string[] = [];
  for (const { rule } of result.ruleDiagnostics) {
    if (!NATURAL_NT_AND_STRONG_TWO_CLUB_IDS.includes(rule.id)) continue;
    const candidate = openingRequirementCandidate(result, rule.id);
    if (candidate === undefined || candidate.ruleApplies) continue;
    const checks = openingChecks(candidate);
    if (checks === null) continue;
    const requirement = `${hcpRangeText(checks.hcp)}` +
      (checks.balanced !== undefined ? ' and balanced distribution' : '') +
      (checks.fiveCardMajor !== undefined ? ' and a five-card major' : '');
    const actual = `This hand has ${checks.hcp.actual} HCP` +
      (checks.balanced !== undefined ?
        (checks.balanced.actual ? ' and is balanced' : ' and is not balanced') : '') +
      (checks.fiveCardMajor !== undefined ?
        (checks.fiveCardMajor.actual ? ', with a five-card major' : ', without a five-card major') : '') +
      '.';
    const treatment = checks.fiveCardMajor !== undefined
      ? 'The optional 5-card major 1NT upgrade' : `${call} opening`;
    lines.push(`${treatment} requires ${requirement} [${rule.id}]. ${actual}`);
  }
  return lines;
}

function openingRequirementCandidate(result: BidEvalResult, ruleId: string): CandidateCallMatch | undefined {
  const diagnostic = result.ruleDiagnostics.find(({ rule }) => rule.id === ruleId);
  return diagnostic?.candidates.find(({ call }) => call === result.normalizedCall);
}

function openingChecks(candidate: CandidateCallMatch | undefined): {
  hcp: Extract<NonNullable<CallEvidence['requirements']>[number], { kind: 'hcp' }>;
  balanced: Extract<NonNullable<CallEvidence['requirements']>[number], { kind: 'balanced' }> | undefined;
  fiveCardMajor: Extract<NonNullable<CallEvidence['requirements']>[number], { kind: 'fiveCardMajor' }> | undefined;
} | null {
  const evidence = candidate?.callEvidence?.requirements;
  const hcp = evidence?.find((check) => check.kind === 'hcp');
  if (hcp?.kind !== 'hcp') return null;
  const balanced = evidence?.find((check) => check.kind === 'balanced');
  const fiveCardMajor = evidence?.find((check) => check.kind === 'fiveCardMajor');
  return {
    hcp,
    balanced: balanced?.kind === 'balanced' ? balanced : undefined,
    fiveCardMajor: fiveCardMajor?.kind === 'fiveCardMajor' ? fiveCardMajor : undefined,
  };
}

function hcpRangeText(check: Extract<NonNullable<CallEvidence['requirements']>[number], { kind: 'hcp' }>): string {
  if (check.min !== undefined && check.max === check.min) return `${check.min} HCP`;
  if (check.min !== undefined && check.max !== undefined) return `${check.min}–${check.max} HCP`;
  if (check.min !== undefined) return `at least ${check.min} HCP`;
  if (check.max !== undefined) return `at most ${check.max} HCP`;
  return 'the required HCP range';
}

/// Opening selection and natural-notrump precedence are decisions, not failed hand tests.
/// Show the relevant decision only for the student's call, or for a competing opening.
export function getOpeningSelectionSupportLines(result: BidEvalResult, rule: BidRule): string[] {
  if (rule.id === 'open-five-card-major' || rule.id === 'open-convenient-minor') {
    const diagnostic = result.ruleDiagnostics.find(({ rule: item }) => item.id === rule.id);
    const selection = diagnostic?.callEvidence?.openingSelection;
    if (selection === undefined || selection.call !== result.normalizedCall) return [];
    return [openingSelectionText(selection) + ` [${rule.id}]`];
  }
  if (rule.id === 'open-1nt-balanced-15-17' || rule.id === 'open-1nt-balanced-16-18' ||
      rule.id === 'open-1nt-five-card-length-upgrade' || rule.id === 'open-2nt-balanced-20-21') {
    const minor = result.ruleDiagnostics.find(({ rule: item }) => item.id === 'open-convenient-minor');
    if (minor?.callEvidence?.suppressedBy !== result.normalizedCall ||
        minor.callEvidence.openingSelection === undefined) return [];
    return [
      `A convenient-minor opening was also possible: ` +
        `${openingSelectionText(minor.callEvidence.openingSelection)} [open-convenient-minor]`,
      `${result.normalizedCall} takes precedence because it describes both strength and ` +
        'balanced distribution more precisely.',
    ];
  }
  return [];
}

/// Only explain selection or qualifications when actual evaluated opening candidates establish
/// the alternative. An absent candidate alone is not evidence that the student's call is wrong.
export function getOpeningSelectionFailureLines(result: BidEvalResult): string[] {
  if (result.userCallMatchingRules.length > 0) return [];
  const entered = result.normalizedCall;
  if (entered === null) return [];
  for (const ruleId of ['open-five-card-major', 'open-convenient-minor']) {
    const diagnostic = result.ruleDiagnostics.find(({ rule }) => rule.id === ruleId);
    const selection = diagnostic?.callEvidence?.openingSelection;
    if (diagnostic === undefined || selection === undefined ||
        !diagnostic.rule.calls?.includes(entered)) continue;
    const qualified = diagnostic.candidates.find(({ call }) => call === selection.call);
    if (qualified === undefined) continue;
    if (qualified.ruleApplies && entered !== selection.call) {
      return [openingSelectionText(selection) + ` [${ruleId}]`];
    }
    const suppressedBy = qualified.callEvidence?.suppressedBy;
    if (suppressedBy !== undefined) {
      return [
        `${openingSelectionText(selection)} [${ruleId}]`,
        `${suppressedBy} takes precedence because it describes both strength and ` +
          'balanced distribution more precisely.',
      ];
    }
    if (ruleId === 'open-convenient-minor' && entered === selection.call) {
      const facts = qualified.callEvidence?.convenientMinor;
      if (facts === undefined) continue;
      if (facts.balanced && facts.hcp < 12 && facts.totalPoints >= 12) {
        return [`Your balanced hand has ${facts.hcp} HCP and ${facts.totalPoints} points with ` +
          'length included. A convenient-minor opening requires at least 12 HCP ' +
          `when balanced [${ruleId}].`];
      }
      if (facts.totalPoints < 12) {
        return [`A convenient-minor opening requires at least 12 points with length included; ` +
          `your hand has ${facts.totalPoints} [${ruleId}].`];
      }
      if (facts.hcp > 21) {
        return [`A convenient-minor opening in this treatment is limited to 21 HCP; ` +
          `your hand has ${facts.hcp} [${ruleId}].`];
      }
    }
  }
  return [];
}

function openingSelectionText(selection: NonNullable<CallEvidence['openingSelection']>): string {
  switch (selection.reason) {
    case 'only-major':
      return `Open your five-card or longer major, ${selection.call}.`;
    case 'longer-major':
      return `With two majors of at least five cards, open the longer one: ${selection.call}.`;
    case 'equal-majors':
      return `With equally long five-card or longer majors, open the higher-ranking suit: ${selection.call}.`;
    case 'longer-minor':
      return `With no five-card major, open the longer minor: ${selection.call}.`;
    case 'equal-four-minors':
      return `With four cards in each minor, open ${selection.call}.`;
    case 'equal-three-minors':
      return `With three cards in each minor, open ${selection.call}.`;
    case 'equal-long-minors':
      return `With equally long minors of at least five cards, open ${selection.call}.`;
  }
}

const PREEMPT_OPENING_IDS = [
  'open-weak-two', 'open-weak-three', 'open-four-level-preempt',
  'open-five-level-minor-preempt',
];
const PREEMPT_SUIT_QUALITY = 'at least two of A/K/Q or three of A/K/Q/J/10';
type Requirement = NonNullable<CallEvidence['requirements']>[number];

/// Explain one supported preempt from its evaluated strength, length, and suit-quality checks.
/// Other supported openings remain visible in the existing supported-calls list.
export function getPreemptOpeningSupportLine(result: BidEvalResult, rule: BidRule): string | null {
  if (!PREEMPT_OPENING_IDS.includes(rule.id)) return null;
  const diagnostic = result.ruleDiagnostics.find(({ rule: item }) => item.id === rule.id);
  const candidate = diagnostic?.candidates.find(({ call }) => call === result.normalizedCall);
  if (candidate?.ruleApplies !== true || result.normalizedCall === null) return null;
  const quality = diagnostic?.callEvidence?.preemptSuitQuality?.find(
    ({ call }) => call === result.normalizedCall);
  const checks = candidate.callEvidence?.requirements;
  const length = checks?.find((check) => check.kind === 'suitLength');
  const strength = checks?.find((check) => check.kind === 'hcp' || check.kind === 'totalPoints');
  if (quality?.passed !== true || length?.kind !== 'suitLength' ||
      strength === undefined || (strength.kind !== 'hcp' && strength.kind !== 'totalPoints')) {
    return null;
  }
  return `Your ${suitName(result.normalizedCall)} suit has ${length.actual} cards and meets ` +
    `the suit-quality requirement (${PREEMPT_SUIT_QUALITY}). ` +
    `With ${strengthValue(strength)}, your hand meets the ${strengthRange(strength)} ` +
    `requirement [${rule.id}].`;
}

/// Explain only the student's attempted preempt and only failures the evaluator actually checked.
/// A suit-quality failure removes the candidate before strength and length are tested.
export function getPreemptOpeningFailureLines(result: BidEvalResult): string[] {
  if (result.userCallMatchingRules.length !== 0 || result.normalizedCall === null) return [];
  const entered = result.normalizedCall;
  const lines: string[] = [];
  for (const diagnostic of result.ruleDiagnostics) {
    if (!PREEMPT_OPENING_IDS.includes(diagnostic.rule.id) ||
        diagnostic.rule.calls?.includes(entered) !== true) continue;
    const quality = diagnostic.callEvidence?.preemptSuitQuality?.find(
      ({ call }) => call === entered);
    if (quality === undefined) continue;
    if (!quality.passed) {
      lines.push(`A ${entered} preempt requires a suit with ${PREEMPT_SUIT_QUALITY}. ` +
        `Your ${suitName(entered)} suit does not meet that requirement [${diagnostic.rule.id}].`);
      continue;
    }
    const candidate = diagnostic.candidates.find(({ call }) => call === entered);
    if (candidate === undefined || candidate.ruleApplies) continue;
    for (const check of candidate.callEvidence?.requirements ?? []) {
      if (check.passed) continue;
      if (check.kind === 'suitLength') {
        const required = check.exact !== undefined ? `exactly ${check.exact}` :
          check.min !== undefined ? `at least ${check.min}` :
          check.max !== undefined ? `at most ${check.max}` : null;
        if (required !== null) {
          lines.push(`A ${entered} opening requires ${required} ${suitPlural(entered)}; ` +
            `your hand has ${check.actual} [${diagnostic.rule.id}].`);
        }
      } else if (check.kind === 'hcp' || check.kind === 'totalPoints') {
        lines.push(`A ${entered} preempt requires ${strengthRange(check)}; ` +
          `your hand has ${strengthValue(check)} [${diagnostic.rule.id}].`);
      }
    }
  }
  return lines;
}

function suitName(call: Call): string {
  switch (call[1]) {
    case 'C': return 'club';
    case 'D': return 'diamond';
    case 'H': return 'heart';
    case 'S': return 'spade';
    default: return 'bid';
  }
}

function suitPlural(call: Call): string {
  switch (call[1]) {
    case 'C': return 'clubs';
    case 'D': return 'diamonds';
    case 'H': return 'hearts';
    case 'S': return 'spades';
    default: return 'suit cards';
  }
}

function strengthValue(check: Extract<Requirement, { kind: 'hcp' | 'totalPoints' }>): string {
  return `${check.actual} ${check.kind === 'hcp' ? 'HCP' : 'total points'}`;
}

function strengthRange(check: Extract<Requirement, { kind: 'hcp' | 'totalPoints' }>): string {
  const units = check.kind === 'hcp' ? 'HCP' : 'total points';
  if (check.min !== undefined && check.max !== undefined) {
    return `${check.min}–${check.max} ${units}`;
  }
  if (check.min !== undefined) return `at least ${check.min} ${units}`;
  if (check.max !== undefined) return `at most ${check.max} ${units}`;
  return `the required ${units}`;
}

///
//// Takeout Double explanations
///

const ORDINARY_IDS = [
  'overcall-takeout-double-with-unbid-suit-support',
  'overcall-weak-two-takeout-double-with-unbid-suit-support',
];
const STRONG_IDS = [
  'overcall-takeout-double-strong-hand',
  'overcall-weak-two-takeout-double-strong-hand',
];

/// Give actual hand evidence for the qualifying treatment, without reporting failures of
/// another takeout-Double rule when this one succeeds.
export function getTakeoutDoubleSupportLine(result: BidEvalResult, rule: BidRule): string | null {
  if (result.normalizedCall !== 'Double') return null;
  const candidate = doubleCandidate(result, rule.id);
  if (candidate?.ruleApplies !== true) return null;
  const requirements = candidate.callEvidence?.requirements ?? [];
  if (ORDINARY_IDS.includes(rule.id)) {
    const points = requirements.find((item) => item.kind === 'totalPoints');
    const hcp = requirements.find((item) => item.kind === 'hcp');
    const support = requirements.find((item) => item.kind === 'unbidSuitSupport');
    if (points?.kind !== 'totalPoints' || hcp?.kind !== 'hcp' ||
        support?.kind !== 'unbidSuitSupport' || !points.passed || !support.passed) return null;
    const shortage = points.actual - hcp.actual;
    const valuation = shortage > 0
      ? `You have ${hcp.actual} HCP plus ${shortage} shortage points, for ${points.actual} points.`
      : `You have ${points.actual} points including shortage valuation.`;
    return `${valuation} That meets the 13-point requirement. You have at least ` +
      `three cards in each unbid suit [${rule.id}].`;
  }
  if (STRONG_IDS.includes(rule.id)) {
    const hcp = requirements.find((item) => item.kind === 'hcp');
    if (hcp?.kind !== 'hcp' || !hcp.passed) return null;
    return `With ${hcp.actual} HCP, your hand meets the 18+ HCP strong-hand takeout ` +
      `Double requirement. This treatment does not require support for every unbid suit ` +
      `[${rule.id}].`;
  }
  return null;
}

/// Explain a Double only when the ordinary and strong treatments have actually been checked
/// in the current auction. An unsupported Double in some other context is not this treatment.
export function getTakeoutDoubleFailureLines(result: BidEvalResult): string[] {
  if (result.normalizedCall !== 'Double' || result.userCallMatchingRules.length !== 0) return [];
  const ordinary = ORDINARY_IDS.map((id) => doubleCandidate(result, id))
    .find((candidate) => candidate !== undefined);
  const strong = STRONG_IDS.map((id) => doubleCandidate(result, id))
    .find((candidate) => candidate !== undefined);
  if (ordinary === undefined || strong === undefined ||
      ordinary.ruleApplies || strong.ruleApplies) return [];
  const checks = ordinary.callEvidence?.requirements ?? [];
  const points = checks.find((item) => item.kind === 'totalPoints');
  const support = checks.find((item) => item.kind === 'unbidSuitSupport');
  const strongHcp = strong.callEvidence?.requirements?.find((item) => item.kind === 'hcp');
  if (points?.kind !== 'totalPoints' || support?.kind !== 'unbidSuitSupport' ||
      strongHcp?.kind !== 'hcp') return [];
  const lines: string[] = [];
  if (!points.passed) {
    lines.push(`An ordinary takeout Double requires at least 13 points including shortage; ` +
      `your hand has ${points.actual} [${ordinary.rule.id}].`);
  }
  if (!support.passed) {
    lines.push(`An ordinary takeout Double requires at least three cards in each unbid suit; ` +
      `your hand is short in ${suitNames(support.shortSuits)} [${ordinary.rule.id}].`);
    if (points.passed && !strongHcp.passed) {
      lines.push(`The strong-hand exception does not require this distribution, but needs ` +
        `at least 18 HCP; your hand has ${strongHcp.actual} [${strong.rule.id}].`);
    }
  }
  return lines;
}

function doubleCandidate(result: BidEvalResult, ruleId: string): CandidateCallMatch | undefined {
  return result.ruleDiagnostics.find(({ rule }) => rule.id === ruleId)
    ?.candidates.find(({ call }) => call === 'Double');
}

function suitNames(suits: Extract<Requirement, { kind: 'unbidSuitSupport' }>['shortSuits']): string {
  const names = suits.map((suit) => {
    switch (suit) {
      case 'C': return 'clubs';
      case 'D': return 'diamonds';
      case 'H': return 'hearts';
      case 'S': return 'spades';
    }
  });
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return names.join(', ');
}

///
//// Balancing Double explanations
///

const BALANCING_ORDINARY_ID = 'balance-takeout-double';
const BALANCING_STRONG_ID = 'balance-strong-double';

/// Explain the balancing treatment that qualified, rather than failures of the other
/// Double treatment. The separate balancing tests use different strength thresholds.
export function getBalancingDoubleSupportLine(result: BidEvalResult, rule: BidRule): string | null {
  if (result.normalizedCall !== 'Double') return null;
  const candidate = doubleCandidate(result, rule.id);
  if (candidate?.ruleApplies !== true) return null;
  const checks = candidate.callEvidence?.requirements ?? [];
  const hcp = checks.find((item) => item.kind === 'hcp');
  const opener = checks.find((item) => item.kind === 'openerSuitLength');
  if (hcp?.kind !== 'hcp' || opener?.kind !== 'openerSuitLength' ||
      !hcp.passed || !opener.passed) return null;
  if (rule.id === BALANCING_ORDINARY_ID) {
    const points = checks.find((item) => item.kind === 'totalPoints');
    const support = checks.find((item) => item.kind === 'unbidSuitSupport');
    if (points?.kind !== 'totalPoints' || support?.kind !== 'unbidSuitSupport' ||
        !points.passed || !support.passed) return null;
    const shortage = points.actual - hcp.actual;
    const valuation = shortage > 0
      ? `${hcp.actual} HCP plus ${shortage} shortage point${shortage === 1 ? '' : 's'} ` +
        `gives ${points.actual} points`
      : `${hcp.actual} HCP gives ${points.actual} points including shortage valuation`;
    return `Your ${valuation}. A balancing takeout Double requires 8–15 HCP and ` +
      `at least 10 points including shortage. You have at most two cards in opener's suit ` +
      `and at least three cards in each unbid suit. Compared with a Double in the seat ` +
      `immediately after opener, the balancing seat can act with less strength [${rule.id}].`;
  }
  if (rule.id === BALANCING_STRONG_ID) {
    return `Your ${hcp.actual} HCP meets the 16+ HCP requirement for a strong balancing ` +
      `Double, and you have at most three cards in opener's suit. This treatment does ` +
      `not require support for every unbid suit [${rule.id}].`;
  }
  return null;
}

/// Explain only requirements actually tested for this Double. No balancing diagnostics
/// are used to judge Doubles in the seat immediately after opener or other auctions.
export function getBalancingDoubleFailureLines(result: BidEvalResult): string[] {
  if (result.normalizedCall !== 'Double' || result.userCallMatchingRules.length !== 0) return [];
  const ordinary = doubleCandidate(result, BALANCING_ORDINARY_ID);
  const strong = doubleCandidate(result, BALANCING_STRONG_ID);
  if (ordinary === undefined || strong === undefined ||
      ordinary.ruleApplies || strong.ruleApplies) return [];
  const checks = ordinary.callEvidence?.requirements ?? [];
  const hcp = checks.find((item) => item.kind === 'hcp');
  const points = checks.find((item) => item.kind === 'totalPoints');
  const opener = checks.find((item) => item.kind === 'openerSuitLength');
  const support = checks.find((item) => item.kind === 'unbidSuitSupport');
  const strongOpener = strong.callEvidence?.requirements?.find(
    (item) => item.kind === 'openerSuitLength');
  if (hcp?.kind !== 'hcp' || points?.kind !== 'totalPoints' ||
      opener?.kind !== 'openerSuitLength' || support?.kind !== 'unbidSuitSupport' ||
      strongOpener?.kind !== 'openerSuitLength') return [];
  const lines: string[] = [];
  if (!hcp.passed || !points.passed) {
    lines.push(`An ordinary balancing Double requires 8–15 HCP and at least 10 points ` +
      `including shortage; your hand has ${hcp.actual} HCP and ${points.actual} points ` +
      `[${ordinary.rule.id}].`);
  }
  if (!opener.passed) {
    lines.push(`An ordinary balancing Double allows at most two cards in opener's suit; ` +
      `your hand has ${opener.actual} [${ordinary.rule.id}].`);
  }
  if (!support.passed) {
    lines.push(`An ordinary balancing Double requires at least three cards in every unbid ` +
      `suit; your hand has fewer than three ${suitNames(support.shortSuits)} ` +
      `[${ordinary.rule.id}].`);
  }
  // When ordinary strength suffices, a separate reminder about the 16-HCP exception
  // adds little. Mention the strong treatment only when the hand is actually strong.
  if (hcp.actual >= 16 && !strongOpener.passed) {
    lines.push(`A strong balancing Double requires no more than three cards in opener's ` +
      `suit; your hand has ${strongOpener.actual} [${strong.rule.id}].`);
  }
  return lines;
}

///
//// Balancing natural suit, 1NT, and Pass explanations
///

const BALANCING_SUIT_IDS = ['balance-natural-one-level-suit', 'balance-natural-two-level-suit'];
const BALANCING_NT_ID = 'balance-natural-1nt';
const BALANCING_PASS_ID = 'balance-pass-defend';

/// The refiner records each considered natural suit call, including those it removed.
/// Qualification strength is checked separately on surviving calls.
function balancingSuitEvidence(result: BidEvalResult, ruleId: string) {
  const diagnostic = result.ruleDiagnostics.find(({ rule }) => rule.id === ruleId);
  const check = diagnostic?.callEvidence?.balancingSuit?.find(
    (item) => item.call === result.normalizedCall);
  const candidate = diagnostic?.candidates.find(({ call }) => call === result.normalizedCall);
  const hcp = candidate?.callEvidence?.requirements?.find((item) => item.kind === 'hcp');
  return { check, candidate, hcp: hcp?.kind === 'hcp' ? hcp : undefined };
}

function balancingNtEvidence(result: BidEvalResult) {
  const candidate = result.ruleDiagnostics.find(({ rule }) => rule.id === BALANCING_NT_ID)
    ?.candidates.find(({ call }) => call === '1NT');
  const checks = candidate?.callEvidence?.requirements;
  const hcp = checks?.find((item) => item.kind === 'hcp');
  const balanced = checks?.find((item) => item.kind === 'balanced');
  const stopper = checks?.find((item) => item.kind === 'stopper');
  return {
    candidate,
    hcp: hcp?.kind === 'hcp' ? hcp : undefined,
    balanced: balanced?.kind === 'balanced' ? balanced : undefined,
    stopper: stopper?.kind === 'stopper' ? stopper : undefined,
  };
}

/// Give the hand-specific justification for the matched balancing treatment.
export function getBalancingCallSupportLine(result: BidEvalResult, rule: BidRule): string | null {
  if (BALANCING_SUIT_IDS.includes(rule.id)) {
    const { check, candidate, hcp } = balancingSuitEvidence(result, rule.id);
    if (check === undefined || candidate?.ruleApplies !== true || hcp === undefined) return null;
    const suit = result.normalizedCall;
    if (check.level === 1) {
      return `Your ${hcp.actual} HCP and ${check.length}-card suit qualify for ${suit}. ` +
        (check.good ? 'The suit meets the honor-quality requirement. ' :
          'With six or more cards, this one-level balance does not require the usual honor quality. ') +
        'Balancing may be lighter than overcalling in the seat immediately after opener. ' +
        'The balancing bidder’s partner should expect that lighter strength ' +
        `[${rule.id}].`;
    }
    return `Your ${hcp.actual} HCP and good ${check.length}-card suit qualify for ${suit}. ` +
      'A two-level balancing suit bid requires at least 8 HCP and a good suit of five or ' +
      `more cards [${rule.id}].`;
  }
  if (rule.id === BALANCING_NT_ID) {
    const { candidate, hcp, balanced, stopper } = balancingNtEvidence(result);
    if (candidate?.ruleApplies !== true || hcp === undefined ||
        balanced?.passed !== true || stopper?.passed !== true) return null;
    return `Your ${hcp.actual} HCP and balanced distribution qualify for natural balancing 1NT. ` +
      `You have a stopper in opener's suit. Balancing 1NT shows 12–15 HCP, less than ` +
      `a natural 1NT overcall in the seat immediately after opener [${rule.id}].`;
  }
  if (rule.id === BALANCING_PASS_ID) {
    const candidate = result.ruleDiagnostics.find(({ rule: item }) => item.id === rule.id)
      ?.candidates.find(({ call }) => call === 'Pass');
    const pass = candidate?.callEvidence?.balancingPass;
    if (candidate?.ruleApplies !== true || pass === undefined || pass.reason === null) return null;
    if (pass.reason === 'weak') {
      return `With ${pass.hcp} HCP, Pass is supported rather than reopening the auction ` +
        `[${rule.id}].`;
    }
    return `With ${pass.hcp} HCP and ${pass.openerSuitLength} cards in opener's suit, ` +
      `Pass is a supported defensive choice. Reopening may help the opponents ` +
      `find a better contract [${rule.id}].`;
  }
  return null;
}

/// Explain only the attempted balancing call. An untested call or absent refinement is not
/// evidence that the student's bid is wrong.
export function getBalancingCallFailureLines(result: BidEvalResult): string[] {
  if (result.userCallMatchingRules.length > 0 || result.normalizedCall === null) return [];
  const entered = result.normalizedCall;
  if (entered === '1NT') {
    const { candidate, hcp, balanced, stopper } = balancingNtEvidence(result);
    if (candidate === undefined || candidate.ruleApplies || hcp === undefined ||
        balanced === undefined || stopper === undefined) return [];
    const lines: string[] = [];
    if (!hcp.passed) lines.push(`Balancing 1NT requires 12–15 HCP; you have ${hcp.actual} ` +
      `[${BALANCING_NT_ID}].`);
    if (!balanced.passed) lines.push(`Balancing 1NT requires a balanced hand ` +
      `[${BALANCING_NT_ID}].`);
    if (!stopper.passed) lines.push(`Balancing 1NT requires a stopper in opener's suit ` +
      `[${BALANCING_NT_ID}].`);
    return lines;
  }
  if (entered === 'Pass') return [];
  for (const ruleId of BALANCING_SUIT_IDS) {
    const diagnostic = result.ruleDiagnostics.find(({ rule }) => rule.id === ruleId);
    if (diagnostic === undefined || !diagnostic.rule.calls?.includes(entered)) continue;
    const { check, candidate, hcp } = balancingSuitEvidence(result, ruleId);
    if (check === undefined) continue;
    const lines: string[] = [];
    if (!check.passed) {
      lines.push(check.level === 1
        ? `A one-level balancing suit bid needs a good five-card suit or any six-card suit ` +
          `[${ruleId}].`
        : `A two-level balancing suit bid needs a good suit of at least five cards ` +
          `[${ruleId}].`);
    }
    if (candidate?.ruleApplies === false && hcp !== undefined && !hcp.passed) {
      lines.push(`A ${check.level}-level balancing suit bid requires ${check.level === 1 ?
        '6–14' : '8–14'} HCP; you have ${hcp.actual} [${ruleId}].`);
    }
    return lines;
  }
  return [];
}
