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
    const comparison = rule.id === 'overcall-takeout-double-strong-hand'
      ? 'A direct suit overcall would understate your strength, while a jump overcall ' +
        'would promise a weak preemptive hand. '
      : 'A natural suit overcall would understate your strength. ';
    return `With ${hcp.actual} HCP, your hand meets the 18+ HCP strong-hand takeout ` +
      `Double requirement. This treatment does not require support for every unbid suit. ` +
      comparison + `Double first, then show your suit on a later turn [${rule.id}].`;
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

///
//// Natural suit and 1NT overcall explanations
///

const NATURAL_SUIT_OVERCALL_IDS = [
  'overcall-simple-suit-at-one-level', 'overcall-simple-suit-at-two-level',
];
const NATURAL_ONE_NT_OVERCALL_ID = 'overcall-natural-1nt-with-stopper';
const SIMPLE_OVERCALL_SUIT_QUALITY = 'two of A/K/Q or three of A/K/Q/J/10';

function naturalSuitOvercallEvidence(result: BidEvalResult, ruleId: string) {
  const diagnostic = result.ruleDiagnostics.find(({ rule }) => rule.id === ruleId);
  const check = diagnostic?.callEvidence?.naturalOvercallSuit?.find(
    (item) => item.call === result.normalizedCall);
  const candidate = diagnostic?.candidates.find(({ call }) => call === result.normalizedCall);
  return { check, candidate, strength: candidate?.callEvidence?.naturalOvercallStrength };
}

function naturalOneNtOvercallEvidence(result: BidEvalResult) {
  const candidate = result.ruleDiagnostics.find(({ rule }) => rule.id === NATURAL_ONE_NT_OVERCALL_ID)
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

/// Explain only the matching natural-overcall rule, never a different meaning of the same call.
export function getNaturalOvercallSupportLine(result: BidEvalResult, rule: BidRule): string | null {
  if (NATURAL_SUIT_OVERCALL_IDS.includes(rule.id)) {
    const { check, candidate, strength } = naturalSuitOvercallEvidence(result, rule.id);
    if (check === undefined || candidate?.ruleApplies !== true) return null;
    if (check.level === 1 && strength !== undefined) {
      const strengthText = strength.exceptionalSeven
        ? `Your ${strength.hcp} HCP qualify under the excellent-suit exception to the normal 8–17 ` +
          'HCP range. '
        : `Your ${strength.hcp} HCP meet the normal 8–17 HCP range. `;
      return strengthText + `Your ${check.length}-card ${suitName(result.normalizedCall ?? check.call)} ` +
        `suit qualifies${check.good ? ' by honor quality' : ' by having at least six cards'}. ` +
        `A one-level overcall does not promise opening strength [${rule.id}].`;
    }
    if (check.level === 2 && strength?.passed === true) {
      return `Your ${strength.hcp} HCP and good ${check.length}-card ` +
        `${suitName(result.normalizedCall ?? check.call)} suit meet the ${strength.min}–17 HCP ` +
        `requirement for this natural two-level overcall [${rule.id}].`;
    }
    return null;
  }
  if (rule.id === NATURAL_ONE_NT_OVERCALL_ID) {
    const { candidate, hcp, balanced, stopper } = naturalOneNtOvercallEvidence(result);
    if (candidate?.ruleApplies !== true || hcp === undefined ||
        balanced?.passed !== true || stopper?.passed !== true) return null;
    return `Your ${hcp.actual} HCP and balanced distribution meet the 15–18 HCP ` +
      `requirement for a natural 1NT overcall. You have a stopper in opener's suit ` +
      `[${rule.id}].`;
  }
  return null;
}

/// Only describe checks actually made for the entered natural non-jump overcall.
/// Refined-out jump bids belong to other rules and must not inherit these requirements.
export function getNaturalOvercallFailureLines(result: BidEvalResult): string[] {
  if (result.userCallMatchingRules.length > 0 || result.normalizedCall === null) return [];
  const entered = result.normalizedCall;
  if (entered === '1NT') {
    const { candidate, hcp, balanced, stopper } = naturalOneNtOvercallEvidence(result);
    if (candidate === undefined || candidate.ruleApplies || hcp === undefined ||
        balanced === undefined || stopper === undefined) return [];
    const lines: string[] = [];
    if (!hcp.passed) lines.push(`A natural 1NT overcall requires 15–18 HCP; your hand has ` +
      `${hcp.actual} [${NATURAL_ONE_NT_OVERCALL_ID}].`);
    if (!balanced.passed) lines.push(`A natural 1NT overcall requires balanced distribution ` +
      `[${NATURAL_ONE_NT_OVERCALL_ID}].`);
    if (!stopper.passed) lines.push(`A natural 1NT overcall requires a stopper in opener's suit ` +
      `[${NATURAL_ONE_NT_OVERCALL_ID}].`);
    return lines;
  }
  for (const ruleId of NATURAL_SUIT_OVERCALL_IDS) {
    const diagnostic = result.ruleDiagnostics.find(({ rule }) => rule.id === ruleId);
    if (diagnostic?.rule.calls?.includes(entered) !== true) continue;
    const { check, candidate, strength } = naturalSuitOvercallEvidence(result, ruleId);
    if (check === undefined) continue;
    const lines: string[] = [];
    if (!check.passed) {
      lines.push(check.level === 1
        ? `A natural one-level overcall requires a good five-card suit (${SIMPLE_OVERCALL_SUIT_QUALITY}) ` +
          `or any suit of six or more cards [${ruleId}].`
        : `A natural two-level overcall requires a good five-card-or-longer suit ` +
          `(${SIMPLE_OVERCALL_SUIT_QUALITY}) [${ruleId}].`);
    }
    if (candidate?.ruleApplies === false && check.level === 1 &&
        strength?.passed === false) {
      lines.push(`A natural one-level overcall normally requires 8–17 HCP; you have ` +
        `${strength.hcp}. At 7 HCP the trainer permits an unusually good suit with at least ` +
        `two of A/K/Q and the 10 [${ruleId}].`);
    }
    if (candidate?.ruleApplies === false && check.level === 2 &&
        strength?.passed === false) {
      lines.push(`A natural two-level overcall with this ${check.length}-card suit requires ` +
        `${strength.min}–17 HCP; you have ${strength.hcp} [${ruleId}].`);
    }
    return lines;
  }
  return [];
}

///
//// Preemptive jump-overcall explanations
///

const JUMP_OVERCALL_IDS = [
  'overcall-preemptive-jump-at-two-level',
  'overcall-preemptive-jump-at-three-level',
  'overcall-preemptive-jump-at-four-level',
];
const JUMP_OVERCALL_HONORS = 'at least two of the top three honors (A/K/Q) or ' +
  'three of the top five (A/K/Q/J/10)';

function jumpOvercallEvidence(result: BidEvalResult, ruleId: string) {
  const diagnostic = result.ruleDiagnostics.find(({ rule }) => rule.id === ruleId);
  const check = diagnostic?.callEvidence?.jumpOvercallSuit?.find(
    ({ call }) => call === result.normalizedCall);
  const candidate = diagnostic?.candidates.find(({ call }) => call === result.normalizedCall);
  const hcp = candidate?.callEvidence?.requirements?.find((item) => item.kind === 'hcp');
  return { check, candidate, hcp: hcp?.kind === 'hcp' ? hcp : undefined };
}

/// Explain an actual qualifying jump, not an economical natural overcall at the same level.
export function getJumpOvercallSupportLine(result: BidEvalResult, rule: BidRule): string | null {
  if (!JUMP_OVERCALL_IDS.includes(rule.id) || result.normalizedCall === null) return null;
  const { check, candidate, hcp } = jumpOvercallEvidence(result, rule.id);
  if (check?.passed !== true || candidate?.ruleApplies !== true || hcp?.passed !== true) {
    return null;
  }
  const range = strengthRange(hcp);
  return `${result.normalizedCall} is a jump overcall: a cheaper bid in that suit was available. ` +
    `Your ${check.requiredLength}-card ${suitName(result.normalizedCall)} suit has ` +
    `${JUMP_OVERCALL_HONORS}, and your ${hcp.actual} HCP meet the ${range} ` +
    `requirement. This jump is preemptive, showing limited strength and taking away ` +
    `bidding room from the opponents [${rule.id}].`;
}

/// A refinement failure can establish suit length or quality; HCP is explained only if the
/// call survived refinement and the ordinary requirement test actually ran.
export function getJumpOvercallFailureLines(result: BidEvalResult): string[] {
  if (result.userCallMatchingRules.length > 0 || result.normalizedCall === null) return [];
  const entered = result.normalizedCall;
  for (const ruleId of JUMP_OVERCALL_IDS) {
    const diagnostic = result.ruleDiagnostics.find(({ rule }) => rule.id === ruleId);
    if (diagnostic?.rule.calls?.includes(entered) !== true) continue;
    const { check, candidate, hcp } = jumpOvercallEvidence(result, ruleId);
    // A non-jump never reaches the jump-specific suitability checks.
    if (check === undefined) continue;
    if (check.length !== check.requiredLength) {
      return [`A weak ${entered} jump overcall requires exactly ${check.requiredLength} ` +
        `${suitPlural(entered)}; your hand has ${check.length} [${ruleId}].`];
    }
    if (!check.good) {
      return [`A weak ${entered} jump overcall requires ${JUMP_OVERCALL_HONORS} ` +
        `in the suit. Your ${suitName(entered)} suit does not meet that requirement [${ruleId}].`];
    }
    if (candidate?.ruleApplies === false && hcp?.passed === false) {
      return [`A weak ${entered} jump overcall requires ${strengthRange(hcp)}; ` +
        `your hand has ${hcp.actual} HCP [${ruleId}].`];
    }
  }
  return [];
}

///
//// Responses to one-level minor openings
///

const MINOR_NEW_SUIT_ID = 'respond-to-minor-w/-new-suit-one-level-priority';
const MINOR_STRONG_SUPPORT_ID = 'respond-to-minor-w/-13plus-start-new-suit';
const MINOR_RAISE_IDS = [
  'respond-to-minor-w/-raise-to-two', 'respond-to-minor-w/-limit-raise',
];
const MINOR_NT_IDS = [
  'respond-to-minor-w/-1nt', 'respond-to-minor-w/-2nt', 'respond-to-minor-w/-3nt',
];
const MINOR_TWO_CLUB_IDS = [
  'respond-to-1d-w/-2c-standard', 'respond-to-1d-w/-2c-two-over-one',
];

/// Supply actual hand facts and the relevant selection principle, leaving the full partnership
/// meaning and forcing obligation to the matching rule's existing meaning and guidance.
export function getMinorResponseSupportLines(result: BidEvalResult, rule: BidRule): string[] {
  if (result.normalizedCall === null) return [];
  const diagnostic = result.ruleDiagnostics.find(({ rule: item }) => item.id === rule.id);
  const candidate = diagnostic?.candidates.find(({ call }) => call === result.normalizedCall);
  if (candidate?.ruleApplies !== true) return [];
  const hcp = minorRequirement(candidate, 'hcp');
  if (rule.id === MINOR_NEW_SUIT_ID) {
    const lines: string[] = [];
    if (hcp !== undefined) {
      lines.push(`Your ${hcp.actual} HCP meet the 6-HCP minimum for a one-level new-suit response ` +
        `[${rule.id}].`);
    }
    const selection = diagnostic?.callEvidence?.minorResponseSelection;
    if (selection !== undefined) {
      lines.push(minorSuitSelectionText(selection, result.normalizedCall) + ` [${rule.id}]`);
    }
    return lines;
  }
  if (MINOR_NT_IDS.includes(rule.id) && hcp !== undefined) {
    return [`Your ${hcp.actual} HCP and balanced hand with no four-card major meet the ` +
      `${strengthRange(hcp)} requirements for ${result.normalizedCall} after a minor opening ` +
      `[${rule.id}].`];
  }
  if (MINOR_TWO_CLUB_IDS.includes(rule.id) && hcp !== undefined) {
    return [`Your ${hcp.actual} HCP and five-card-or-longer clubs meet the ${strengthRange(hcp)} ` +
      `requirement for 2C under the selected ${rule.id.endsWith('two-over-one') ?
        'two-over-one game-forcing' : 'Standard forcing'} treatment [${rule.id}].`];
  }
  if (MINOR_RAISE_IDS.includes(rule.id) && hcp !== undefined) {
    const support = minorRequirement(candidate, 'minorSupport');
    if (support !== undefined) {
      return [`Your ${hcp.actual} HCP and ${support.actual}-card ` +
        `${support.suit === 'C' ? 'club' : 'diamond'} support qualify for this ` +
        `${rule.id === MINOR_RAISE_IDS[0] ? 'minimum' : 'invitational'} minor raise. ` +
        `The treatment requires no four-card major [${rule.id}].`];
    }
  }
  if (rule.id === MINOR_STRONG_SUPPORT_ID && hcp !== undefined) {
    const support = minorRequirement(candidate, 'minorSupport');
    const newSuit = minorRequirement(candidate, 'suitLength');
    if (support !== undefined && newSuit !== undefined) {
      return [`With ${hcp.actual} HCP, ${support.actual}-card support for partner's ` +
        `${support.suit === 'C' ? 'clubs' : 'diamonds'}, and a ${newSuit.actual}-card new suit, ` +
        `start with a forcing ${result.normalizedCall} response and show the minor support later ` +
        `[${rule.id}].`];
    }
  }
  if (rule.id === 'respond-to-minor-w/-pass-0-5' && hcp !== undefined) {
    return [`With ${hcp.actual} HCP, you are below the 6-HCP minimum for an ordinary ` +
      `response to a minor opening [${rule.id}].`];
  }
  return [];
}

/// Describe only the attempted response and its actual evaluated requirements or refinement.
/// An eliminated suit isn't assigned an HCP failure when it never reached that check.
export function getMinorResponseFailureLines(result: BidEvalResult): string[] {
  if (result.userCallMatchingRules.length > 0 || result.normalizedCall === null) return [];
  const entered = result.normalizedCall;
  const lines: string[] = [];
  const newSuit = result.ruleDiagnostics.find(({ rule }) => rule.id === MINOR_NEW_SUIT_ID);
  const selection = newSuit?.callEvidence?.minorResponseSelection;
  if (selection !== undefined && newSuit?.rule.calls?.includes(entered)) {
    const considered = selection.considered.find(({ call }) => call === entered);
    if (considered !== undefined && considered.length < 4) {
      lines.push(`A one-level new-suit response requires at least four cards in the bid suit; ` +
        `you have ${considered.length} [${MINOR_NEW_SUIT_ID}].`);
    } else if (considered !== undefined && !selection.retainedCalls.includes(entered) &&
               selection.preferredCall !== null) {
      const selected = newSuit.candidates.find(({ call }) => call === selection.preferredCall);
      if (selected?.ruleApplies === true) {
        lines.push(minorSuitSelectionText(selection, entered) + ` [${MINOR_NEW_SUIT_ID}]`);
      }
    } else {
      const candidate = newSuit.candidates.find(({ call }) => call === entered);
      const hcp = candidate === undefined ? undefined : minorRequirement(candidate, 'hcp');
      if (hcp?.passed === false) {
        lines.push(`A one-level new-suit response requires at least 6 HCP; ` +
          `you have ${hcp.actual} [${MINOR_NEW_SUIT_ID}].`);
      }
    }
  }
  const relevantIds = [...MINOR_NT_IDS, ...MINOR_TWO_CLUB_IDS, ...MINOR_RAISE_IDS,
    'respond-to-minor-w/-pass-0-5'];
  for (const ruleId of relevantIds) {
    const diagnostic = result.ruleDiagnostics.find(({ rule }) => rule.id === ruleId);
    const candidate = diagnostic?.candidates.find(({ call }) => call === entered);
    if (candidate?.ruleApplies !== false) continue;
    const hcp = minorRequirement(candidate, 'hcp');
    const support = minorRequirement(candidate, 'minorSupport');
    const noMajor = minorRequirement(candidate, 'noFourCardMajor');
    const balanced = minorRequirement(candidate, 'balanced');
    const suitLength = minorRequirement(candidate, 'suitLength');
    if (hcp?.passed === false) {
      lines.push(`${entered} under this treatment requires ${strengthRange(hcp)}; ` +
        `you have ${hcp.actual} HCP [${ruleId}].`);
    }
    if (support?.passed === false) {
      lines.push(`Raising partner's ${support.suit === 'C' ? 'clubs' : 'diamonds'} here requires ` +
        `at least ${support.min}-card support; you have ${support.actual} [${ruleId}].`);
    }
    if (noMajor?.passed === false) {
      lines.push(`With a four-card major, respond in that major before choosing ` +
        `${MINOR_RAISE_IDS.includes(ruleId) ? 'a minor raise' : 'notrump'} [${ruleId}].`);
    }
    if (balanced?.passed === false) {
      lines.push(`${entered} as a natural notrump response requires a balanced hand ` +
        `[${ruleId}].`);
    }
    if (suitLength?.passed === false && MINOR_TWO_CLUB_IDS.includes(ruleId)) {
      lines.push(`A natural 2C response to 1D requires at least five clubs [${ruleId}].`);
    }
  }
  return lines;
}

function minorRequirement<K extends Requirement['kind']>(candidate: CandidateCallMatch,
                                                         kind: K): Extract<Requirement, { kind: K }> | undefined {
  return candidate.callEvidence?.requirements?.find(
    (item): item is Extract<Requirement, { kind: K }> => item.kind === kind);
}

function minorSuitSelectionText(
  selection: NonNullable<CallEvidence['minorResponseSelection']>, entered: Call): string {
  const preferred = selection.preferredCall;
  if (preferred === null) return 'No four-card new suit is available at the one level.';
  if (selection.reason === 'equal-four-majors') {
    return `With two four-card majors, respond up the line: 1H before 1S. ` +
      `${entered === preferred ? 'Both are supported.' : 'Your 1S is supported, but 1H comes first.'}`;
  }
  if (selection.reason === 'equal-long-majors') {
    return `With equally long majors of at least five cards, bid the higher-ranking suit ` +
      `first: ${preferred}.`;
  }
  if (selection.reason === 'longer-major') {
    return `With both majors at least four cards, bid the longer major first: ${preferred}.`;
  }
  if (selection.reason === 'major-first') {
    if (selection.longerDiamondAlternative && entered === '1D') {
      return `A longer diamond suit also permits 1D as an alternative with minimum responding ` +
        `values, but ${preferred} is preferred to search for a major-suit fit.`;
    }
    return `Show a four-card-or-longer major first to look for a major-suit fit: ${preferred}.` +
      (selection.longerDiamondAlternative ? ' A longer 1D is also supported as an alternative.' : '');
  }
  return `Respond in a longest available new suit of at least four cards: ${preferred}.`;
}

///
//// Strong support for partner's one-level major (B11)
///

const STRONG_MAJOR_NEW_SUIT_IDS = [
  'respond-to-major-w/-three-card-support-13plus-bid-new-suit-then-raise',
  'respond-to-major-w/-four-card-support-13plus-bid-new-suit-then-raise',
];
const STRONG_MAJOR_JACOBY_ID = 'respond-to-major-w/-support-jacoby-2nt-agreement';
const STRONG_MAJOR_SPLINTER_ID = 'respond-to-major-w/-support-splinter';
const STRONG_MAJOR_PREEMPT_ID = 'respond-to-major-w/-support-preemptive-game-raise';
const STRONG_MAJOR_LIMIT_FALLBACK_ID = 'respond-to-major-w/-support-long-fit-13-limit-raise-fallback';
const STRONG_MAJOR_IDS = [
  ...STRONG_MAJOR_NEW_SUIT_IDS, STRONG_MAJOR_JACOBY_ID, STRONG_MAJOR_SPLINTER_ID,
  STRONG_MAJOR_PREEMPT_ID, STRONG_MAJOR_LIMIT_FALLBACK_ID,
];

function majorSuitName(suit: 'H' | 'S'): string {
  return suit === 'H' ? 'hearts' : 'spades';
}

function majorOpeningForResponse(result: BidEvalResult): '1H' | '1S' | null {
  const check = result.ruleDiagnostics
    .filter(({ rule }) => STRONG_MAJOR_IDS.includes(rule.id))
    .flatMap(({ candidates }) => candidates)
    .flatMap(({ callEvidence }) => callEvidence?.requirements ?? [])
    .find((item) => item.kind === 'partnerSupport' &&
      (item.suit === 'H' || item.suit === 'S'));
  if (check?.kind !== 'partnerSupport' || check.suit === undefined) return null;
  return check.suit === 'H' ? '1H' : '1S';
}

/// Return additional instruction only when the actual call qualified under its strong-support rule.
function strongMajorSupportLines(result: BidEvalResult, rule: BidRule): string[] {
  if (!STRONG_MAJOR_IDS.includes(rule.id)) return [];
  const { diagnostic, candidate } = majorSupportCandidate(result, rule.id);
  if (candidate?.ruleApplies !== true) return [];
  const points = minorRequirement(candidate, 'totalPoints');
  const support = minorRequirement(candidate, 'partnerSupport');
  if (points === undefined || support === undefined) return [];
  const opener = majorOpeningForResponse(result);
  if (opener === null) return [];
  const major = majorSuitName(opener[1] as 'H' | 'S');
  const call = result.normalizedCall;
  if (call === null) return [];
  const value = supportPointText(points);
  if (STRONG_MAJOR_NEW_SUIT_IDS.includes(rule.id)) {
    const route = diagnostic?.callEvidence?.majorGameForceNewSuit;
    const selected = route?.considered.find((item) => item.call === call);
    if (selected === undefined || !route?.retainedCalls.includes(call)) return [];
    const first = `${call} begins the game-forcing support sequence; later raise partner's ` +
      `${major} to at least game. Your initial new-suit bid does not yet show the major fit.`;
    if (route.reason === 'three-card-minor-fallback') {
      return [`With ${value} and ${support.actual} ${major}, no new suit meets the normal ` +
        `response-length requirements. The ${call} response on just three ` +
        `${call[1] === 'C' ? 'clubs' : 'diamonds'} is a rare fallback, not a routine ` +
        `promise of four cards. ${first} The trainer includes this judgment-dependent ` +
        `option for educational value; it cannot guarantee this is the right choice. ` +
        `Use it only if you judge that this hand and auction merit it [${rule.id}].`];
    }
    return [`With ${value} and ${support.actual} ${major}, your ${selected.length}-card ` +
      `new suit qualifies for ${call} (at least ${selected.requiredLength} cards). ${first} ` +
      `[${rule.id}].`];
  }
  if (rule.id === STRONG_MAJOR_JACOBY_ID) {
    const splinter = result.ruleDiagnostics.find(({ rule: otherRule }) =>
      otherRule.id === STRONG_MAJOR_SPLINTER_ID);
    const splinterCall = splinter?.candidates.find((item) => item.ruleApplies)?.call;
    return [`With ${value} and ${support.actual} ${major}, ${call} is the agreed ` +
      `Jacoby 2NT response: an artificial game-forcing raise, not an offer to play in ` +
      `notrump. It promises at least four trumps and asks opener to describe their hand ` +
      `before choosing the final contract.` +
      (splinterCall === undefined ? '' : ` ${splinterCall} is also supported and ranked ahead ` +
        `of Jacoby 2NT because the splinter immediately shows shortness.`) + ` [${rule.id}].`];
  }
  if (rule.id === STRONG_MAJOR_SPLINTER_ID) {
    const short = minorRequirement(candidate, 'suitLength');
    if (short === undefined) return [];
    const shortSuit = ({ C: 'clubs', D: 'diamonds', H: 'hearts', S: 'spades' } as const)[
      call[1] as 'C' | 'D' | 'H' | 'S'];
    if (shortSuit === undefined) return [];
    const alternative = result.ruleDiagnostics.some(({ rule: otherRule, candidates }) =>
      (STRONG_MAJOR_NEW_SUIT_IDS.includes(otherRule.id) ||
       otherRule.id === STRONG_MAJOR_JACOBY_ID) &&
      candidates.some((item) => item.ruleApplies));
    return [`With ${value}, ${support.actual} ${major}, and ` +
      `${short.actual === 0 ? `a void in ${shortSuit}` : `a singleton in ${shortSuit}`}, ` +
      `${call} is a splinter: an artificial double jump showing game-forcing ${major} ` +
      `support and shortness in ${shortSuit}, not a ${shortSuit} suit. ` +
      (alternative ? 'It takes preference over another qualifying game-force route ' +
        'because it describes your shortness immediately. ' : '') + `[${rule.id}].`];
  }
  if (rule.id === STRONG_MAJOR_PREEMPT_ID) {
    return [`With ${value} and ${support.actual} ${major}, a direct ${call} is a weak, ` +
      `nonforcing preemptive raise to game. Your long trump fit makes it harder for ` +
      `the opponents to compete; this bid does not promise game-forcing strength ` +
      `[${rule.id}].`];
  }
  if (rule.id === STRONG_MAJOR_LIMIT_FALLBACK_ID) {
    if (diagnostic?.callEvidence?.longMajorLimitFallback?.reason !== 'qualified') return [];
    return [`With ${value} and ${support.actual} ${major}, you have game-going support ` +
      `values, but no suitable new-suit response to start the agreed game-forcing ` +
      `sequence. The usual limit raise (${opener}–${call}) shows 11–12 support points; ` +
      `this exceptional ${call} is a conservative, nonforcing invitation with 13. ` +
      `Opener may Pass or accept with extra values [${rule.id}].`];
  }
  return [];
}

/// Diagnose only the attempted B11 treatment. An agreement-disabled rule cannot establish a
/// failure, and a refiner's excluded call is not misreported as having failed a hand constraint.
function strongMajorSupportFailureLines(result: BidEvalResult): string[] {
  if (result.normalizedCall === null || result.userCallMatchingRules.length > 0) return [];
  const entered = result.normalizedCall;
  const lines: string[] = [];
  const opener = majorOpeningForResponse(result);
  if (entered === '2NT' && opener !== null &&
      result.ruleDiagnostics.some(({ rule }) => rule.id === STRONG_MAJOR_NEW_SUIT_IDS[1]) &&
      !result.ruleDiagnostics.some(({ rule }) => rule.id === STRONG_MAJOR_JACOBY_ID)) {
    lines.push(`Jacoby 2NT is not the selected strong-major-support agreement. ` +
      `With game-forcing support, the agreed route is to bid a qualifying new suit ` +
      `and later raise opener's ${majorSuitName(opener[1] as 'H' | 'S')} to game ` +
      `[${STRONG_MAJOR_NEW_SUIT_IDS[1]}].`);
  }
  for (const ruleId of STRONG_MAJOR_IDS) {
    const { diagnostic, candidate } = majorSupportCandidate(result, ruleId);
    if (diagnostic === undefined || !diagnostic.rule.calls?.includes(entered)) continue;
    // The narrow 13-point fallback only describes direct 3M, never an unrelated 3M splinter.
    if (ruleId === STRONG_MAJOR_LIMIT_FALLBACK_ID &&
        (opener === null || entered !== `3${opener[1]}`)) continue;
    const points = candidate === undefined ? undefined : minorRequirement(candidate, 'totalPoints');
    const support = candidate === undefined ? undefined : minorRequirement(candidate, 'partnerSupport');
    const short = candidate === undefined ? undefined : minorRequirement(candidate, 'suitLength');
    if (ruleId === STRONG_MAJOR_LIMIT_FALLBACK_ID) {
      const fallback = diagnostic.callEvidence?.longMajorLimitFallback;
      // Only identify an available game force when the special fallback's 13-point, 6+ support
      // requirements were actually established by a companion evaluated response.
      const ordinary = majorSupportCandidate(result, 'respond-to-major-w/-support-limit-raise-four-card');
      const ordinaryPoints = ordinary.candidate === undefined ? undefined :
        minorRequirement(ordinary.candidate, 'totalPoints');
      const ordinarySupport = ordinary.candidate === undefined ? undefined :
        minorRequirement(ordinary.candidate, 'partnerSupport');
      if (fallback?.reason === 'new-suit-available' && ordinaryPoints?.actual === 13 &&
          ordinarySupport !== undefined && ordinarySupport.actual >= 6) {
        const alternative = fallback.alternativeCalls.join(' or ');
        lines.push(`The ordinary 11–12-support-point limit raise (${opener}–${entered}) ` +
          `invites game and lets opener Pass. With 13 support points, the selected ` +
          `treatment instead offers ${alternative} to start a game-forcing sequence.` +
          (fallback.alternativeIsRareThreeCardMinor
            ? ` This is a rare three-card-minor fallback, exposed for judgment and learning; ` +
              `the trainer cannot guarantee it is the best practical choice.`
            : ` That makes the direct invitation too conservative under this treatment.`) +
          ` [${ruleId}].`);
      } else if (fallback?.reason === 'shortness' && ordinaryPoints?.actual === 13 &&
                 ordinarySupport !== undefined && ordinarySupport.actual >= 6) {
        lines.push(`The exceptional 13-point ${entered} limit-raise fallback does not ` +
          `apply with an outside singleton or void; that shortness calls for separate ` +
          `game-going judgment [${ruleId}].`);
      }
      if (candidate?.ruleApplies === false && points?.passed === false &&
          support?.passed !== false) {
        lines.push(`This exceptional ${entered} limit raise requires exactly 13 support ` +
          `points; you have ${points.actual} [${ruleId}].`);
      }
      continue;
    }
    if (STRONG_MAJOR_NEW_SUIT_IDS.includes(ruleId)) {
      const route = diagnostic.callEvidence?.majorGameForceNewSuit;
      const considered = route?.considered.find(({ call }) => call === entered);
      if (considered !== undefined && !route?.retainedCalls.includes(entered)) {
        if (considered.length < considered.requiredLength) {
          const alternative = route?.retainedCalls.join(' or ');
          const otherRoute = alternative === undefined || alternative === '' ? '' :
            route?.reason === 'three-card-minor-fallback'
              ? ` The exceptional three-card-minor response (${alternative}) is offered ` +
                `for judgment, not guaranteed as the best choice.`
              : ` A normally qualifying new-suit response (${alternative}) is available instead.`;
          lines.push(`${entered} normally needs at least ${considered.requiredLength} cards in ` +
            `the new suit; you have ${considered.length}.${otherRoute} [${ruleId}].`);
        }
        continue;
      }
    }
    if (candidate?.ruleApplies !== false) continue;
    if (support?.passed === false) {
      const amount = STRONG_MAJOR_NEW_SUIT_IDS.includes(ruleId) &&
        ruleId === STRONG_MAJOR_NEW_SUIT_IDS[0] ? 'exactly three trumps' :
        ruleId === STRONG_MAJOR_PREEMPT_ID ? 'at least five trumps' : 'at least four trumps';
      lines.push(`${entered} under this support treatment requires ${amount}; ` +
        `you have ${support.actual} [${ruleId}].`);
    } else if (points?.passed === false) {
      const amount = ruleId === STRONG_MAJOR_PREEMPT_ID ? 'at most 9' :
        ruleId === STRONG_MAJOR_SPLINTER_ID ? '13–15' : 'at least 13';
      lines.push(`${entered} under this treatment requires ${amount} support points; ` +
        `you have ${points.actual} [${ruleId}].`);
    } else if (short?.passed === false && ruleId === STRONG_MAJOR_SPLINTER_ID) {
      lines.push(`A ${entered} splinter requires a singleton or void in the bid suit; ` +
        `you have ${short.actual} cards there [${ruleId}].`);
    }
  }
  return lines;
}

///
//// Responses supporting partner's one-level major
///

const BASIC_MAJOR_SUPPORT_IDS = [
  'respond-to-major-w/-support-pass-0-5',
  'respond-to-major-w/-pass-0-5',
  'respond-to-major-w/-support-simple-raise',
  'respond-to-major-w/-support-limit-raise-four-card',
  'respond-to-major-w/-support-limit-raise-three-card',
  'respond-to-major-w/-support-limit-raise-three-card-nonforcing-1nt-fallback',
  'respond-to-major-w/-support-limit-raise-three-card-new-suit-first',
];
const THREE_CARD_MAJOR_ROUTE_IDS = [
  'respond-to-major-w/-support-limit-raise-three-card',
  'respond-to-major-w/-support-limit-raise-three-card-nonforcing-1nt-fallback',
  'respond-to-major-w/-support-limit-raise-three-card-new-suit-first',
];

function majorSupportCandidate(result: BidEvalResult, ruleId: string) {
  const diagnostic = result.ruleDiagnostics.find(({ rule }) => rule.id === ruleId);
  const candidate = diagnostic?.candidates.find(({ call }) => call === result.normalizedCall);
  return { diagnostic, candidate };
}

function supportPointText(points: Extract<Requirement, { kind: 'totalPoints' }>): string {
  if (points.hcp === undefined) return `${points.actual} support points`;
  const shortage = points.actual - points.hcp;
  if (shortage === 0) return `${points.hcp} HCP, giving ${points.actual} support points`;
  return `${points.hcp} HCP plus ${shortage} shortage ${shortage === 1 ? 'point' : 'points'}, ` +
    `giving ${points.actual} support points`;
}

/// Explain the actual successful support route; keep its full meaning and forcing status in the
/// rule declaration rather than inferring them from a generic call category.
export function getMajorSupportLines(result: BidEvalResult, rule: BidRule): string[] {
  if (STRONG_MAJOR_IDS.includes(rule.id)) return strongMajorSupportLines(result, rule);
  if (!BASIC_MAJOR_SUPPORT_IDS.includes(rule.id)) return [];
  const { candidate, diagnostic } = majorSupportCandidate(result, rule.id);
  if (candidate?.ruleApplies !== true) return [];
  const points = minorRequirement(candidate, 'totalPoints');
  const support = minorRequirement(candidate, 'partnerSupport');
  const hcp = minorRequirement(candidate, 'hcp');
  if (rule.id === 'respond-to-major-w/-pass-0-5' && hcp !== undefined) {
    return [`With ${hcp.actual} HCP and fewer than three trumps, you lack the 6 HCP ` +
      `for an ordinary response [${rule.id}].`];
  }
  if (points === undefined || support === undefined) return [];
  if (rule.id === 'respond-to-major-w/-support-pass-0-5') {
    return [`With ${supportPointText(points)} and ${support.actual} trumps, ` +
      `Pass is supported because you have no more than 5 support points [${rule.id}].`];
  }
  if (rule.id === 'respond-to-major-w/-support-simple-raise') {
    return [`Your hand has ${supportPointText(points)} and ${support.actual} trumps, qualifying ` +
      `for the 6–10-point simple raise. Opener may Pass this nonforcing response [${rule.id}].`];
  }
  if (rule.id === 'respond-to-major-w/-support-limit-raise-four-card') {
    return [`Your hand has ${supportPointText(points)} and ${support.actual} trumps, qualifying ` +
      `for the 11–12-point invitational limit raise. Opener may Pass with minimum values ` +
      `or bid game with extras [${rule.id}].`];
  }
  if (!THREE_CARD_MAJOR_ROUTE_IDS.includes(rule.id)) return [];
  const route = diagnostic?.callEvidence?.majorSupportRoute;
  if (route?.reason === 'spades-first' && result.normalizedCall === '1S') {
    return [`With ${supportPointText(points)} and exactly three hearts, you have ` +
      `invitational heart support. Show your ${route.spadeLength}-card spade suit with ` +
      `forcing 1S first, then invite in hearts after opener rebids [${rule.id}].`];
  }
  if (route?.reason === 'one-nt-fallback' && result.normalizedCall === '1NT') {
    const forcing = rule.id === 'respond-to-major-w/-support-limit-raise-three-card';
    return [`With ${supportPointText(points)} and exactly three trumps, use 1NT before ` +
      `showing invitational support. ${forcing
        ? 'Under the forcing 1NT agreement, opener must bid again if there is no interference.'
        : 'Under the nonforcing 1NT agreement, opener may Pass; if opener continues, you can invite later.'} ` +
      `[${rule.id}].`];
  }
  return [];
}

/// Diagnose only the entered simple/limit major raise or a modeled three-card support route.
/// An excluded 1NT route is not called a failed hand requirement; the spade-first selection is
/// recorded by its refiner and the alternative supported 1S is shown separately.
export function getMajorSupportFailureLines(result: BidEvalResult): string[] {
  if (result.userCallMatchingRules.length > 0 || result.normalizedCall === null) return [];
  const entered = result.normalizedCall;
  const lines: string[] = strongMajorSupportFailureLines(result);
  for (const ruleId of BASIC_MAJOR_SUPPORT_IDS) {
    const { candidate, diagnostic } = majorSupportCandidate(result, ruleId);
    if (candidate?.ruleApplies !== false) continue;
    const points = minorRequirement(candidate, 'totalPoints');
    const support = minorRequirement(candidate, 'partnerSupport');
    const hcp = minorRequirement(candidate, 'hcp');
    if (points?.passed === false) {
      const fallback = result.ruleDiagnostics.find(({ rule }) =>
        rule.id === STRONG_MAJOR_LIMIT_FALLBACK_ID)?.callEvidence?.longMajorLimitFallback;
      const specialized13PointExplanation = ruleId === 'respond-to-major-w/-support-limit-raise-four-card' &&
        points.actual === 13 && support !== undefined && support.actual >= 6 &&
        (fallback?.reason === 'new-suit-available' || fallback?.reason === 'shortness');
      if (!specialized13PointExplanation) {
        lines.push(`${entered} under this treatment requires ${strengthRange(points).replace('total points',
          'support points')}; your hand has ${points.actual} support points [${ruleId}].`);
      }
    }
    if (support?.passed === false) {
      const range = support.min === support.max ? `exactly ${support.min}` :
        support.max !== undefined ? `${support.min ?? 0}–${support.max}` :
        `at least ${support.min}`;
      lines.push(`${entered} under this treatment requires ${range} cards in partner's major; ` +
        `you have ${support.actual} [${ruleId}].`);
    }
    if (hcp?.passed === false) {
      lines.push(`Pass under this weak-response treatment requires at most 5 HCP; ` +
        `your hand has ${hcp.actual} [${ruleId}].`);
    }
    // A 1NT fallback filtered out because 1S is available has no hand check to report.
    if (candidate === undefined && entered === '1NT' &&
        diagnostic?.callEvidence?.majorSupportRoute?.reason === 'spades-first') {
      // A separate supported response rule may still cover 1NT; in that case this
      // function was already short-circuited by userCallMatchingRules above.
      lines.push(`With four or more spades after partner opens 1H, respond 1S first ` +
        `and plan an invitational heart raise later [${ruleId}].`);
    }
  }
  return lines;
}

///
//// Responses to a major opening without support (B12)
///

const MAJOR_NO_SUPPORT_IDS = [
  'respond-to-major-w/o-support-new-suit-one-level',
  'respond-to-major-w/o-support-new-suit-two-level-standard',
  'respond-to-major-w/o-support-new-suit-two-level-two-over-one',
  'respond-to-major-w/o-support-1nt-twooverone',
  'respond-to-major-w/o-support-1nt-passed-hand',
  'respond-to-major-w/o-support-1nt-standard',
];

function noSupportDiagnostic(result: BidEvalResult, ruleId: string) {
  const diagnostic = result.ruleDiagnostics.find(({ rule }) => rule.id === ruleId);
  const candidate = diagnostic?.candidates.find(({ call }) => call === result.normalizedCall);
  return { diagnostic, candidate };
}

/// A refiner orders legitimate two-level suit candidates without rejecting the others. Report
/// that decision only after the evaluator confirms which candidate calls actually qualified.
function twoLevelNewSuitPreference(result: BidEvalResult, ruleId: string): string | null {
  const { diagnostic } = noSupportDiagnostic(result, ruleId);
  const selection = diagnostic?.callEvidence?.majorNoSupportNewSuit;
  if (selection === undefined) return null;
  const qualified = selection.orderedCalls.filter((call) =>
    diagnostic?.candidates.some((item) => item.call === call && item.ruleApplies));
  if (qualified.length < 2) return null;
  const preferred = qualified[0];
  const chosen = result.normalizedCall;
  const preferredLength = selection.considered.find(({ call }) => call === preferred)?.length;
  const other = chosen === preferred ? qualified[1] : chosen;
  const otherLength = selection.considered.find(({ call }) => call === other)?.length;
  if (preferredLength === undefined || otherLength === undefined) return null;
  if (preferredLength > otherLength) {
    return `Both ${preferred} and ${other} qualify. The longer new suit (${preferred}) ` +
      `comes first; ${other} remains a supported alternative.`;
  }
  if (preferredLength >= 5) {
    return `Both ${preferred} and ${other} qualify with equal length of at least five cards. ` +
      `Bid the higher-ranking suit (${preferred}) first; ${other} remains supported.`;
  }
  return `Both ${preferred} and ${other} qualify as four-card new suits. ` +
    `Bid up the line (${preferred} first); ${other} remains supported.`;
}

/// Give positive explanations for actual qualifying B12 calls, including the selected forcing
/// obligation. Do not infer a game force from a Standard new-suit response.
export function getMajorNoSupportLines(result: BidEvalResult, rule: BidRule): string[] {
  if (!MAJOR_NO_SUPPORT_IDS.includes(rule.id)) return [];
  const { candidate } = noSupportDiagnostic(result, rule.id);
  if (candidate?.ruleApplies !== true) return [];
  const hcp = minorRequirement(candidate, 'hcp');
  const support = minorRequirement(candidate, 'partnerSupport');
  if (hcp === undefined || support === undefined) return [];
  const entered = result.normalizedCall;
  if (rule.id === MAJOR_NO_SUPPORT_IDS[0]) {
    const suit = minorRequirement(candidate, 'suitLength');
    if (suit === undefined) return [];
    const suppressedOneNt = result.ruleDiagnostics.find((item) =>
      (item.rule.id === MAJOR_NO_SUPPORT_IDS[3] || item.rule.id === MAJOR_NO_SUPPORT_IDS[5]) &&
      item.callEvidence?.suppressedBy === entered);
    return [`With ${hcp.actual} HCP, ${suit.actual} spades, and no heart fit, ` +
      `respond 1S. This natural new-suit response is forcing for one round, not to game. ` +
      `Opener must bid again without interference.` +
      (suppressedOneNt === undefined ? '' : ' Show the four-card-or-longer spade suit before using 1NT.') +
      ` [${rule.id}].`];
  }
  if (rule.id === MAJOR_NO_SUPPORT_IDS[1] || rule.id === MAJOR_NO_SUPPORT_IDS[2]) {
    const suit = minorRequirement(candidate, 'suitLength');
    if (suit === undefined) return [];
    const gameForce = rule.id === MAJOR_NO_SUPPORT_IDS[2];
    const lines = [`With ${hcp.actual} HCP, ${suit.actual} cards in your new suit, ` +
      `and no fit for opener's major, ${entered} meets the ` +
      `${gameForce ? '2/1 game-forcing' : 'Standard'} natural two-level response requirements. ` +
      (gameForce
        ? 'The partnership is committed to bidding at least game.'
        : 'Opener must bid again without interference, but the partnership is not committed to game.') +
      ` [${rule.id}].`];
    const preference = twoLevelNewSuitPreference(result, rule.id);
    if (preference !== null) lines.push(`${preference} [${rule.id}].`);
    return lines;
  }
  const passedHand = rule.id === MAJOR_NO_SUPPORT_IDS[4];
  const forcing = rule.id === MAJOR_NO_SUPPORT_IDS[3];
  const semiForcing = rule.id === MAJOR_NO_SUPPORT_IDS[5] && hcp.max === 12;
  const treatment = passedHand ? 'previously passed hand' : forcing ? 'forcing 1NT' :
    semiForcing ? '2/1 semi-forcing 1NT' : 'Standard nonforcing 1NT';
  const obligation = forcing
    ? 'Opener must bid again if the opponents do not interfere.'
    : semiForcing
      ? 'Opener may Pass with a suitable balanced minimum; otherwise opener can describe their hand.'
      : 'Opener may Pass.';
  return [`With ${hcp.actual} HCP and no major-suit fit, 1NT qualifies under the ` +
    `${treatment} treatment (${hcp.min}–${hcp.max} HCP). ${obligation} ` +
    `1NT does not necessarily promise a balanced hand. [${rule.id}].`];
}

/// Explain only the attempted no-support treatment, using evaluated requirements rather than
/// repeating the rule logic. Support-based routes (B10/B11) retain their own explanations.
export function getMajorNoSupportFailureLines(result: BidEvalResult): string[] {
  if (result.normalizedCall === null || result.userCallMatchingRules.length > 0) return [];
  const entered = result.normalizedCall;
  const lines: string[] = [];
  for (const ruleId of MAJOR_NO_SUPPORT_IDS) {
    const { diagnostic, candidate } = noSupportDiagnostic(result, ruleId);
    if (diagnostic === undefined) continue;
    if (entered === '1NT' && diagnostic.callEvidence?.suppressedBy !== undefined) {
      lines.push(`After partner opens 1H, a qualifying ${diagnostic.callEvidence.suppressedBy} ` +
        `response shows your spades before the fallback 1NT. [${ruleId}].`);
      continue;
    }
    if (candidate?.ruleApplies !== false) continue;
    const hcp = minorRequirement(candidate, 'hcp');
    const support = minorRequirement(candidate, 'partnerSupport');
    const suit = minorRequirement(candidate, 'suitLength');
    const unpassed = minorRequirement(candidate, 'responderPreviouslyPassed');
    // Three or more trumps belongs to the separate major-support response families.
    if (support !== undefined && support.actual > 2) continue;
    if (ruleId === MAJOR_NO_SUPPORT_IDS[4] && unpassed?.passed === false) continue;
    if (unpassed?.passed === false) {
      lines.push(ruleId === MAJOR_NO_SUPPORT_IDS[2]
        ? `A previously passed responder cannot establish a 2/1 game force with ${entered}. ` +
          `That natural response needs a different passed-hand judgment [${ruleId}].`
        : `Because you Passed before partner opened, 1NT is not forcing. ` +
          `Use the modeled passed-hand treatment when it qualifies [${ruleId}].`);
      continue;
    }
    if (suit?.passed === false) {
      lines.push(`${entered} under this natural new-suit treatment requires at least ` +
        `${suit.min} cards in the bid suit; you have ${suit.actual} [${ruleId}].`);
    } else if (hcp?.passed === false) {
      const range = hcp.max === undefined ? `${hcp.min}+` : `${hcp.min}–${hcp.max}`;
      const alternative = ruleId === MAJOR_NO_SUPPORT_IDS[2] && hcp.actual >= 6 &&
        hcp.actual <= 12
        ? ' A qualifying 1NT response may describe this lower-strength hand under the selected agreement.'
        : '';
      lines.push(`${entered} under this treatment requires ${range} HCP; ` +
        `you have ${hcp.actual}.${alternative} [${ruleId}].`);
    }
  }
  return lines;
}


///
//// Weak and strong responder jump shifts (B13)
///

const RESPONDER_JUMP_SHIFT_IDS = [
  'respond-to-minor-w/-weak-jump-shift-modern',
  'respond-to-major-w-weak-jump-shift-modern',
  'respond-to-minor-w/-strong-jump-shift-classic',
  'respond-to-major-w/-strong-jump-shift-classic',
];

/// Explain a qualifying jump shift using the evaluator's refinement and strength decisions.
/// The chosen agreement defines whether the jump is preemptive or a game force.
export function getResponderJumpShiftLines(result: BidEvalResult, rule: BidRule): string[] {
  if (!RESPONDER_JUMP_SHIFT_IDS.includes(rule.id) || result.normalizedCall === null) return [];
  const { selection, candidate, hcp, suit } = jumpShiftDiagnostic(result, rule.id);
  if (selection?.selectedCall !== result.normalizedCall || candidate?.ruleApplies !== true ||
      hcp?.passed !== true || suit === undefined) return [];
  const call = result.normalizedCall;
  const ordinary = selection.ordinaryCall;
  const ordinaryQualifies = ordinary !== undefined && result.ruleDiagnostics.some((diagnostic) =>
    diagnostic.candidates.some((item) => item.call === ordinary && item.ruleApplies));
  if (selection.treatment === 'weak') {
    const lines = [`With ${hcp.actual} HCP and ${suit.length} ${suitPlural(call)}, ` +
      `${call} qualifies as a weak jump shift under the selected agreement. The jump ` +
      `immediately shows limited strength and a long suit; it is preemptive and ` +
      `nonforcing, so opener may Pass [${rule.id}].`];
    if (ordinaryQualifies) {
      lines.push(`A natural ${ordinary} response also qualifies, but the jump shows your ` +
        `weak long-suit hand immediately [${rule.id}].`);
    }
    const alternatives = selection.considered.filter((item) =>
      item.call !== call && item.length >= 6);
    if (alternatives.length > 0) {
      const shorter = alternatives.some((item) => item.length < suit.length);
      lines.push(shorter
        ? `More than one six-card-or-longer new suit is available. ${call} shows the longest first ` +
          `[${rule.id}].`
        : `With equally long qualifying new suits, ${call} is the higher-ranking choice ` +
          `[${rule.id}].`);
    }
    return lines;
  }
  const lines = [`With ${hcp.actual} HCP, ${suit.length} ${suitPlural(call)}, and ` +
    `${suit.suitHcp} HCP in the bid suit, ${call} qualifies as a classic strong jump shift. ` +
    `It promises a strong suit (at least 5 HCP in that suit), establishes a game force, ` +
    `and expresses slam interest. Neither partner should Pass below game [${rule.id}].`];
  if (ordinaryQualifies) {
    lines.push(`A natural ${ordinary} response also qualifies, but the jump immediately ` +
      `communicates the exceptional strength and game commitment [${rule.id}].`);
  }
  return lines;
}

/// Diagnose only an actually attempted single jump covered by the selected agreement.
/// When refinement discarded the call, rely on its recorded reason rather than retesting hands.
export function getResponderJumpShiftFailureLines(result: BidEvalResult): string[] {
  if (result.normalizedCall === null || result.userCallMatchingRules.length > 0) return [];
  const entered = result.normalizedCall;
  for (const ruleId of RESPONDER_JUMP_SHIFT_IDS) {
    const { selection, candidate, hcp, support, suit } = jumpShiftDiagnostic(result, ruleId);
    if (selection === undefined || suit === undefined) continue;
    const weak = selection.treatment === 'weak';
    const kind = weak ? 'weak' : 'classic strong';
    const minLength = weak ? 6 : 5;
    // A candidate's HCP requirement was actually evaluated only after refinement retained it.
    if (hcp?.passed === false) {
      const range = weak ? '4–7' : 'at least 17';
      return [`A ${kind} jump shift to ${entered} requires ${range} HCP; ` +
        `you have ${hcp.actual} [${ruleId}].`];
    }
    if (support?.passed === false) {
      return [`A weak ${entered} jump shift after a major opening is reserved for hands ` +
        `with at most two cards in opener's major; you have ${support.actual}. ` +
        `With three-card or longer support, consider a qualifying raise instead [${ruleId}].`];
    }
    if (suit.length < minLength) {
      return [`A ${kind} jump shift to ${entered} requires at least ${minLength} ` +
        `${suitPlural(entered)}; you have ${suit.length} [${ruleId}].`];
    }
    if (!weak && selection.reason === 'two-long-suits') {
      return [`With two five-card-or-longer new suits, the selected classic strong ` +
        `jump-shift treatment calls for a natural response first, normally in the ` +
        `higher-ranking suit, so both suits can be described later [${ruleId}].`];
    }
    if (!weak && selection.reason === 'insufficient-suit-hcp' && suit.suitHcp < 5) {
      return [`Classic strong jump shifts require at least 17 HCP overall and at least ` +
        `5 HCP in the bid suit. Your hand has ${selection.hcp} HCP overall and ` +
        `${suit.suitHcp} in ${suitName(entered)} [${ruleId}].`];
    }
    if (selection.selectedCall !== null && selection.selectedCall !== entered) {
      const preferred = selection.considered.find(({ call }) => call === selection.selectedCall);
      if (preferred !== undefined) {
        const reason = preferred.length > suit.length
          ? `the longer qualifying suit (${preferred.length} cards versus ${suit.length})`
          : 'the higher-ranking of equally long qualifying suits';
        return [`Both ${entered} and ${selection.selectedCall} have sufficient suit length ` +
          `for the weak jump-shift treatment, but the evaluator selects ` +
          `${selection.selectedCall}: ${reason} [${ruleId}].`];
      }
    }
    if (candidate?.ruleApplies === false) continue;
  }
  return [];
}

function jumpShiftDiagnostic(result: BidEvalResult, ruleId: string) {
  const diagnostic = result.ruleDiagnostics.find(({ rule }) => rule.id === ruleId);
  const selection = diagnostic?.callEvidence?.jumpShift;
  const candidate = diagnostic?.candidates.find(({ call }) => call === result.normalizedCall);
  const hcp = candidate === undefined ? undefined : minorRequirement(candidate, 'hcp');
  const support = candidate === undefined ? undefined : minorRequirement(candidate, 'partnerSupport');
  const suit = selection?.considered.find(({ call }) => call === result.normalizedCall);
  return { diagnostic, selection, candidate, hcp, support, suit };
}


///
//// Advancing natural suit overcalls after responder Pass (B14)
///

const NATURAL_ADVANCE_RULES = [
  'advance-one-level-suit-overcall-pass',
  'advance-one-level-suit-overcall-simple-raise',
  'advance-one-level-suit-overcall-preemptive-raise',
  'advance-one-level-suit-overcall-support-cuebid',
  'advance-one-level-suit-overcall-one-notrump',
  'advance-one-level-suit-overcall-two-notrump',
  'advance-one-level-suit-overcall-new-suit-at-one-level',
  'advance-one-level-suit-overcall-new-suit-at-two-level',
  'advance-one-level-suit-overcall-three-notrump',
  'advance-two-level-suit-overcall-pass',
  'advance-two-level-suit-overcall-simple-raise',
  'advance-two-level-suit-overcall-support-cuebid',
  'advance-two-level-suit-overcall-two-notrump',
  'advance-two-level-suit-overcall-new-suit-at-two-level',
  'advance-two-level-suit-overcall-new-suit-at-three-level',
  'advance-two-level-suit-overcall-three-notrump',
];

function naturalAdvanceDiagnostic(result: BidEvalResult, ruleId: string) {
  const diagnostic = result.ruleDiagnostics.find(({ rule }) => rule.id === ruleId);
  const candidate = diagnostic?.candidates.find(({ call }) => call === result.normalizedCall);
  return { diagnostic, candidate };
}

/// Use the exact qualifying candidate and its evaluated requirements to explain the
/// particular advance.  Rule meaning/guidance still follows in the ordinary UI path.
export function getNaturalAdvanceLines(result: BidEvalResult, rule: BidRule): string[] {
  if (!NATURAL_ADVANCE_RULES.includes(rule.id) || result.normalizedCall === null) return [];
  const { candidate } = naturalAdvanceDiagnostic(result, rule.id);
  if (candidate?.ruleApplies !== true) return [];
  const call = result.normalizedCall;
  const id = `[${rule.id}]`;
  const hcp = minorRequirement(candidate, 'hcp');
  const points = minorRequirement(candidate, 'totalPoints');
  const support = minorRequirement(candidate, 'partnerSupport');
  const length = minorRequirement(candidate, 'suitLength');
  const balanced = minorRequirement(candidate, 'balanced');
  const stopper = minorRequirement(candidate, 'stopper');
  if (rule.id.endsWith('-pass')) {
    const decision = candidate.callEvidence?.advancePass;
    if (decision === undefined) return [];
    return [`Partner's natural suit overcall is nonforcing. With ${decision.hcp} HCP ` +
      'and no qualifying constructive advance under this treatment, Pass is reasonable ' + id + '.'];
  }
  if (points !== undefined && support !== undefined) {
    const suit = support.suit === undefined ? 'partner’s suit' :
      ({ C: 'clubs', D: 'diamonds', H: 'hearts', S: 'spades' }[support.suit]);
    const base = `With ${points.actual} support points and ${support.actual} ${suit}, `;
    if (rule.id.includes('support-cuebid')) {
      return [base + `${call} qualifies as an artificial strong raise of partner's overcall. ` +
        `You are bidding opener's suit, not promising that suit; the cuebid shows ` +
        `invitational-or-better support and forces partner to bid again ${id}.`];
    }
    if (rule.id.includes('preemptive-raise')) {
      const simple = result.ruleDiagnostics.some(({ rule: item, candidates }) =>
        item.id === 'advance-one-level-suit-overcall-simple-raise' &&
        candidates.some((bid) => bid.ruleApplies));
      return [base + `${call} is a weak preemptive jump raise. Four or more trumps ` +
        `let you take away bidding room; the jump does not promise extra strength ${id}.` +
        (simple ? ' A simple raise also qualifies, but conveys less preemptive pressure.' : '')];
    }
    if (rule.id.includes('simple-raise')) {
      return [base + `${call} qualifies as a constructive, nonforcing raise. ` +
        `Partner may Pass; this is ${call[0] === '3' ? 'a single raise of a two-level overcall' :
          'not the stronger forcing cuebid'} ${id}.`];
    }
  }
  if (hcp !== undefined && balanced?.passed === true && stopper?.passed === true) {
    const openerSuit = stopper.suit === undefined ? 'opener’s suit' :
      ({ C: 'clubs', D: 'diamonds', H: 'hearts', S: 'spades' }[stopper.suit]);
    const intent = call === '3NT' ? 'bids game' : call === '2NT' ? 'invites game' :
      'is a natural, nonforcing advance';
    return [`With ${hcp.actual} HCP, balanced distribution, and a stopper in ${openerSuit}, ` +
      `${call} ${intent}. The stopper matters because the opponents opened that suit ${id}.`];
  }
  if (hcp !== undefined && length !== undefined) {
    const forcing = rule.callCategory?.includes('forcing') === true;
    const quality = rule.id.endsWith('-new-suit-at-three-level')
      ? ` Your suit also satisfies the required honor quality (${PREEMPT_SUIT_QUALITY}).` : '';
    return [`With ${hcp.actual} HCP and ${length.actual} ${suitPlural(call)}, ${call} ` +
      `qualifies as an economical natural new-suit advance. It is ` +
      `${forcing ? 'forcing for one round: partner must bid again' :
        'nonforcing: partner may Pass'}.${quality} ${id}`];
  }
  return [];
}

/// Report only a check the evaluator actually failed for the student's entered
/// call. Do not manufacture a rejection from an untested, filtered-out rule.
export function getNaturalAdvanceFailureLines(result: BidEvalResult): string[] {
  if (result.normalizedCall === null || result.userCallMatchingRules.length > 0) return [];
  const entered = result.normalizedCall;
  for (const ruleId of NATURAL_ADVANCE_RULES) {
    const { diagnostic, candidate } = naturalAdvanceDiagnostic(result, ruleId);
    if (diagnostic === undefined) continue;
    if (entered === 'Pass' && ruleId.endsWith('-pass') && candidate?.ruleApplies === false) {
      const decision = candidate.callEvidence?.advancePass;
      if (decision === undefined) continue;
      const alternative = result.ruleDiagnostics.flatMap(({ candidates }) => candidates)
        .find((item) => item.ruleApplies && item.call !== 'Pass');
      if (alternative !== undefined) {
        return [`Although partner's natural overcall is nonforcing, the trainer supports ` +
          `${alternative.call} as a constructive advance for this hand, rather than a weak Pass ` +
          `[${ruleId}].`];
      }
      if (decision.hcp > 10) {
        return [`The weak Pass treatment is limited to at most 10 HCP; you have ` +
          `${decision.hcp}. That does not, by itself, establish another recommended call ` +
          `[${ruleId}].`];
      }
      continue;
    }
    if (ruleId.endsWith('-new-suit-at-three-level') && candidate === undefined) {
      const checked = diagnostic.callEvidence?.advanceNewSuitQuality?.considered.find(
        (item) => item.call === entered);
      if (checked?.economical === true && checked.length < 5) {
        return [`An economical three-level new-suit advance to ${entered} requires ` +
          `at least five ${suitPlural(entered)}; you have ${checked.length} [${ruleId}].`];
      }
      if (checked?.economical === true && !checked.qualityPassed) {
        return [`An economical three-level advance of ${entered} needs a suit containing ` +
          `${PREEMPT_SUIT_QUALITY}. Your ${suitPlural(entered)} do not meet that ` +
          `honor requirement [${ruleId}].`];
      }
    }
    if (candidate === undefined || candidate.ruleApplies) continue;
    const checks = candidate.callEvidence?.requirements ?? [];
    const support = checks.find((check) => check.kind === 'partnerSupport');
    const points = checks.find((check) => check.kind === 'totalPoints');
    const length = checks.find((check) => check.kind === 'suitLength');
    const hcp = checks.find((check) => check.kind === 'hcp');
    const balanced = checks.find((check) => check.kind === 'balanced');
    const stopper = checks.find((check) => check.kind === 'stopper');
    if (support?.kind === 'partnerSupport' && !support.passed) {
      return [`${entered} under this raise treatment requires at least ${support.min} ` +
        `trumps in partner's suit; you have ${support.actual} [${ruleId}].`];
    }
    if (points?.kind === 'totalPoints' && !points.passed) {
      return [`${entered} under this raise treatment requires ` +
        `${strengthRange(points).replace('total points', 'support points')}; ` +
        `you have ${points.actual} support points [${ruleId}].`];
    }
    if (length?.kind === 'suitLength' && !length.passed) {
      return [`The natural ${entered} advance requires at least ${length.min} ` +
        `${suitPlural(entered)}; you have ${length.actual} [${ruleId}].`];
    }
    if (hcp?.kind === 'hcp' && !hcp.passed) {
      return [`${entered} under this treatment requires ${hcpRangeText(hcp)}; ` +
        `your hand has ${hcp.actual} HCP [${ruleId}].`];
    }
    if (balanced?.kind === 'balanced' && !balanced.passed) {
      return [`A natural ${entered} advance requires balanced distribution; ` +
        `this hand is not balanced [${ruleId}].`];
    }
    if (stopper?.kind === 'stopper' && !stopper.passed) {
      const suit = stopper.suit === undefined ? 'opener’s suit' :
        ({ C: 'clubs', D: 'diamonds', H: 'hearts', S: 'spades' }[stopper.suit]);
      return [`A natural ${entered} advance requires a stopper in ${suit}, ` +
        `which this hand lacks [${ruleId}].`];
    }
  }
  return [];
}


///
//// Advancing takeout Doubles after responder Pass (B15)
///

const TAKEOUT_ADVANCE_RULES = [
  'advance-takeout-double-minimum-suit',
  'advance-takeout-double-invitational-jump',
  'advance-takeout-double-strong-cuebid',
  'advance-takeout-double-one-notrump',
  'advance-takeout-double-two-notrump',
  'advance-takeout-double-three-notrump',
  'advance-takeout-double-major-game',
  'advance-weak-two-double-direct-major-game',
];

function takeoutAdvanceDiagnostic(result: BidEvalResult, ruleId: string) {
  const diagnostic = result.ruleDiagnostics.find(({ rule }) => rule.id === ruleId);
  const candidate = diagnostic?.candidates.find(({ call }) => call === result.normalizedCall);
  return { diagnostic, candidate };
}

/// Convey the meaning of the selected treatment and its actual evaluated qualification.
/// The refiner and hand predicate, not this function, determine which calls survive.
export function getTakeoutAdvanceLines(result: BidEvalResult, rule: BidRule): string[] {
  if (!TAKEOUT_ADVANCE_RULES.includes(rule.id) || result.normalizedCall === null) return [];
  const { diagnostic, candidate } = takeoutAdvanceDiagnostic(result, rule.id);
  if (candidate?.ruleApplies !== true) return [];
  const call = result.normalizedCall;
  const id = `[${rule.id}]`;
  const points = minorRequirement(candidate, 'totalPoints');
  const length = minorRequirement(candidate, 'suitLength');
  const hcp = minorRequirement(candidate, 'hcp');
  const balanced = minorRequirement(candidate, 'balanced');
  const stopper = minorRequirement(candidate, 'stopper');
  const choice = diagnostic?.callEvidence?.takeoutSuitSelection;
  if (rule.id.endsWith('-minimum-suit')) {
    if (points === undefined || choice === undefined) return [];
    const selected = choice.considered.find((item) => item.call === call);
    if (selected === undefined) return [];
    const fallback = selected.length === 3 && !choice.hasFourCardUnbidSuit;
    const forcedThree = choice.openingLevel === 2 && call[0] === '3';
    const base = `Partner's takeout Double normally asks you to choose a suit, even with ` +
      `no HCP. With ${points.actual} length-adjusted points and ${selected.length} ` +
      `${suitPlural(call)}, ${call} is a natural, nonforcing response at the cheapest level; ` +
      `partner may Pass ${id}.`;
    const special = fallback
      ? ' No four-card unbid suit is available, so this three-card suit is a necessary fallback, ' +
        'not a promise of four cards.'
      : forcedThree
        ? ' After the weak-two opening, bidding space forces this cheapest suit response to ' +
          `the three level; it can show as many as ${points.max} length-adjusted points ` +
          'without becoming an invitation.'
        : '';
    const first = choice.retainedCalls[0];
    const preference = first !== undefined && first !== call &&
      choice.retainedCalls.includes(call) ?
      ` ${first} is also supported and is preferred by the selected suit-length/tie-breaking order.` : '';
    return [base + special + preference];
  }
  if (rule.id.endsWith('-invitational-jump')) {
    const selected = choice?.considered.find((item) => item.call === call);
    if (points === undefined || selected === undefined) return [];
    return [`With ${points.actual} length-adjusted points and ${selected.length} ` +
      `${suitPlural(call)}, ${call} is an invitational jump above the cheapest ` +
      `${selected.cheapest ?? 'available'} response in that suit. It shows more strength ` +
      `than the minimum response but is not forcing: partner may Pass ${id}.`];
  }
  if (rule.id.endsWith('-strong-cuebid')) {
    if (points === undefined) return [];
    return [`With ${points.actual} length-adjusted points, ${call} qualifies as a strong ` +
      `artificial cuebid of opener's suit. It does not promise that suit or support for any ` +
      `one unbid suit. Partner must bid again, but the cuebid alone does not force to game ${id}.`];
  }
  if (call.endsWith('NT') && hcp !== undefined && balanced?.passed === true &&
      stopper?.passed === true) {
    const openingSuit = stopper.suit === undefined ? 'opener’s suit' :
      ({ C: 'clubs', D: 'diamonds', H: 'hearts', S: 'spades' }[stopper.suit]);
    const meaning = call === '1NT' ? 'natural and nonforcing' :
      call === '2NT' ? 'natural and invitational; partner may Pass or bid game' :
      'a natural game bid, not a request for partner to bid again';
    return [`With ${hcp.actual} HCP, a balanced hand, and a stopper in ${openingSuit}, ` +
      `${call} is ${meaning}. The stopper protects against a lead in opener's suit ${id}.`];
  }
  if ((rule.id.endsWith('-major-game') || rule.id.endsWith('-direct-major-game')) &&
      points !== undefined) {
    const selected = diagnostic?.callEvidence?.takeoutMajorGame?.considered.find(
      (item) => item.call === call);
    const actualLength = length?.actual ?? selected?.length;
    if (actualLength === undefined) return [];
    return [`With ${points.actual} length-adjusted points and ${actualLength} ` +
      `${suitPlural(call)}, ${call} is a natural game signoff, not a forcing request ` +
      `to describe your hand further. It assumes partner has the normal takeout-Double ` +
      `support for unbid suits; a strong off-shape Double may require judgment ${id}.`];
  }
  return [];
}

/// When an unsupported call was actually evaluated, explain the decisive failed check.
/// Filtered-out suit bids use selection evidence instead of invented hand requirements.
export function getTakeoutAdvanceFailureLines(result: BidEvalResult): string[] {
  if (result.normalizedCall === null || result.userCallMatchingRules.length > 0) return [];
  const entered = result.normalizedCall;
  const takeoutRules = result.ruleDiagnostics.filter(({ rule }) =>
    TAKEOUT_ADVANCE_RULES.includes(rule.id));
  if (takeoutRules.length === 0) return [];
  if (entered === 'Pass') {
    const minimum = takeoutRules.find(({ rule }) =>
      rule.id === 'advance-takeout-double-minimum-suit');
    if (minimum === undefined) return [];
    return [`After partner's takeout Double and the opponent's Pass, you normally must ` +
      `choose an unbid suit, even with zero HCP. Passing instead leaves the opponent ` +
      `playing a doubled contract, a penalty-conversion judgment that this treatment ` +
      `does not model [advance-takeout-double-minimum-suit].`];
  }
  // Prefer evaluated strength, shape, and stopper failures over another rule's
  // refiner excluding the same call for being a different kind of bid.
  for (const { rule } of takeoutRules) {
    if (rule.calls?.includes(entered) !== true) continue;
    const { candidate } = takeoutAdvanceDiagnostic(result, rule.id);
    if (candidate === undefined || candidate.ruleApplies) continue;
    const requirements = candidate.callEvidence?.requirements ?? [];
    const points = requirements.find((item) => item.kind === 'totalPoints');
    const hcp = requirements.find((item) => item.kind === 'hcp');
    const balanced = requirements.find((item) => item.kind === 'balanced');
    const stopper = requirements.find((item) => item.kind === 'stopper');
    if (points?.kind === 'totalPoints' && !points.passed) {
      return [`${entered} under this treatment requires ` +
        `${strengthRange(points).replace('total points', 'length-adjusted points')}; ` +
        `you have ${points.actual} [${rule.id}].`];
    }
    if (hcp?.kind === 'hcp' && !hcp.passed) {
      return [`Natural ${entered} after partner's Double requires ${hcpRangeText(hcp)}; ` +
        `your hand has ${hcp.actual} HCP [${rule.id}].`];
    }
    if (balanced?.kind === 'balanced' && !balanced.passed) {
      return [`Natural ${entered} requires a balanced hand, but this hand is not ` +
        `balanced [${rule.id}].`];
    }
    if (stopper?.kind === 'stopper' && !stopper.passed) {
      const suit = stopper.suit === undefined ? 'opener’s suit' :
        ({ C: 'clubs', D: 'diamonds', H: 'hearts', S: 'spades' }[stopper.suit]);
      return [`Natural ${entered} requires a stopper in ${suit}; this hand lacks one ` +
        `[${rule.id}].`];
    }
  }
  // A candidate may have been removed as a non-economical or non-single-jump
  // call. Explain a jump in its own terms before considering minimum-bid rules.
  const jumpRule = takeoutRules.find(({ rule }) =>
    rule.id === 'advance-takeout-double-invitational-jump');
  const jumpChoice = jumpRule?.callEvidence?.takeoutSuitSelection;
  const jumpConsidered = jumpChoice?.considered.find((item) => item.call === entered);
  if (jumpConsidered !== undefined && !jumpConsidered.eligible &&
      jumpConsidered.cheapest !== null && jumpConsidered.cheapest !== entered) {
    if (jumpConsidered.length < 4) {
      return [`An invitational jump in ${suitPlural(entered)} requires at least four cards; ` +
        `you have ${jumpConsidered.length} [advance-takeout-double-invitational-jump].`];
    }
    return [`${entered} is not the modeled single-jump invitation in ` +
      `${suitPlural(entered)}. That bid is one level above the cheapest ` +
      `${jumpConsidered.cheapest} response [advance-takeout-double-invitational-jump].`];
  }
  for (const { rule } of takeoutRules) {
    if (rule.calls?.includes(entered) !== true) continue;
    const { diagnostic } = takeoutAdvanceDiagnostic(result, rule.id);
    const selection = diagnostic?.callEvidence?.takeoutSuitSelection;
    const considered: NonNullable<CallEvidence['takeoutSuitSelection']>['considered'][number] |
      undefined = selection?.considered.find((item) => item.call === entered);
    if (considered !== undefined && !considered.eligible) {
      if (considered.cheapest === null) continue;
      if (considered.length < 4 && selection?.jump === 1) {
        return [`The invitational ${entered} jump requires at least four ` +
          `${suitPlural(entered)}; you have ${considered.length} [${rule.id}].`];
      }
      if (considered.length < 4 && selection?.jump === 0) {
        return [`A cheapest-level response to partner's takeout Double normally uses ` +
          `four or more cards in the suit. A three-card fallback is permitted only when ` +
          `there is no four-card unbid suit [${rule.id}].`];
      }
      if (selection !== undefined && selection.jump === 0 &&
          considered.cheapest !== entered) {
        return [`The natural minimum response in ${suitPlural(entered)} is ` +
          `${considered.cheapest}, not ${entered} [${rule.id}].`];
      }
      if (selection !== undefined && selection.jump === 1 &&
          considered.cheapest !== null) {
        return [`An invitational jump is one level above the cheapest ` +
          `${considered.cheapest} bid in that suit; ${entered} is not that jump [${rule.id}].`];
      }
    }
    if (rule.id.endsWith('-major-game') || rule.id.endsWith('-direct-major-game')) {
      const major = diagnostic?.callEvidence?.takeoutMajorGame?.considered.find(
        (item) => item.call === entered);
      if (major !== undefined && !major.eligible && major.length < 5) {
        return [`A direct ${entered} game after partner's Double requires at least ` +
          `five ${suitPlural(entered)}; you have ${major.length} [${rule.id}].`];
      }
    }
  }
  return [];
}

///
//// Natural notrump partner responses and advances (B16)
///

function notrumpPartnerDiagnostic(result: BidEvalResult, ruleId: string) {
  const diagnostic = result.ruleDiagnostics.find(({ rule }) => rule.id === ruleId);
  const candidate = diagnostic?.candidates.find(({ call }) => call === result.normalizedCall);
  return { diagnostic, candidate };
}

function notrumpHcpText(check: Extract<NonNullable<CallEvidence['requirements']>[number],
                                  { kind: 'hcp' }>): string {
  return hcpRangeText(check);
}

function notrumpTargetSuit(ruleId: string, call: Call): 'hearts' | 'spades' | null {
  if (ruleId.includes('to-hearts')) return 'hearts';
  if (ruleId.includes('to-spades')) return 'spades';
  if (ruleId.includes('transfer')) return null;
  return call.endsWith('H') ? 'hearts' : call.endsWith('S') ? 'spades' : null;
}

/// The same 1NT treatments explain opening responses and advances after a natural 1NT
/// overcall. Describe the actual selected meaning without assuming how partner reached 1NT.
export function getNotrumpPartnerResponseLines(result: BidEvalResult, rule: BidRule): string[] {
  const isOneNt = rule.id.startsWith('respond-to-1nt-w/-');
  const isTwoNt = rule.id.startsWith('advance-weak-two-2nt-');
  if ((!isOneNt && !isTwoNt) || result.normalizedCall === null) return [];
  const { candidate } = notrumpPartnerDiagnostic(result, rule.id);
  if (candidate?.ruleApplies !== true) return [];
  const call = result.normalizedCall;
  const id = `[${rule.id}]`;
  const hcp = minorRequirement(candidate, 'hcp');
  const balanced = minorRequirement(candidate, 'balanced');
  const fourCardMajor = minorRequirement(candidate, 'fourCardMajor');
  const lengths = candidate.callEvidence?.requirements?.filter((item) => item.kind === 'suitLength') ?? [];
  const heldSuitLength = lengths.find((item) => item.min !== undefined)?.actual;
  const points = hcp === undefined ? '' : `With ${hcp.actual} HCP, `;
  const ntLevel = isOneNt ? '1NT' : '2NT';
  if (rule.id.includes('-stayman')) {
    if (fourCardMajor?.passed !== true) return [];
    return [`${points}your four-card major qualifies for ${call} Stayman. This artificial ` +
      `inquiry asks partner to show a four-card major; partner must answer ${id}.`];
  }
  if (rule.id.includes('transfer-to-') || rule.id.includes('texas-to-')) {
    const suit = notrumpTargetSuit(rule.id, call);
    if (suit === null || heldSuitLength === undefined) return [];
    const destination = rule.id.includes('texas') ? `4${suit === 'hearts' ? 'H' : 'S'}` :
      `${isOneNt ? '2' : '3'}${suit === 'hearts' ? 'H' : 'S'}`;
    const convention = rule.id.includes('texas') ? 'Texas' : 'Jacoby';
    return [`${points}your ${heldSuitLength}-card ${suit} suit qualifies for the ${convention} ` +
      `transfer ${call}. This call is artificial: it asks partner to bid ${destination}, ` +
      `rather than describing the suit bid. Partner must complete the transfer ${id}.`];
  }
  if (rule.id.includes('3c-3d-natural-invitational')) {
    if (hcp === undefined || heldSuitLength === undefined) return [];
    return [`With ${hcp.actual} HCP and ${heldSuitLength} ${suitPlural(call)}, ${call} is a ` +
      `natural invitation. The suit has at least two of A/K/Q, providing enough quality ` +
      `to describe the long minor instead of simply inviting with 2NT ${id}.`];
  }
  if (rule.id.includes('-pass-')) {
    return [`${points}${balanced?.actual === true ? 'your balanced hand' : 'your hand'} ` +
      `qualifies for Pass of partner's natural ${ntLevel}. This is a weak signoff; ` +
      `a qualifying major-suit convention may describe some weak hands better ${id}.`];
  }
  if (call === '2NT' && isOneNt) {
    const shape = balanced?.actual === false
      ? ' Under the selected agreements, the natural invitation remains available even without balanced shape.'
      : '';
    return [`With ${hcp?.actual} HCP (in the selected ${hcp === undefined ? '' : hcpRangeText(hcp)} ` +
      `range), ${call} is a natural invitation to 3NT, not a game force. ` +
      `Partner can Pass with a minimum or bid game with extra values.${shape} ${id}`];
  }
  if (call === '3NT') {
    const context = isTwoNt
      ? 'After partner’s 2NT overcall, there is no lower natural notrump invitation; this treatment bids game directly.'
      : 'This places the partnership in game, rather than inviting partner to decide.';
    return [`With ${hcp?.actual} HCP, within ${hcp === undefined ? 'the required range' : hcpRangeText(hcp)}, ` +
      `and balanced distribution, 3NT is a natural game ` +
      `response to partner's ${ntLevel}. ${context} ${id}`];
  }
  if (call === '4NT') {
    return [`With ${hcp?.actual} HCP and balanced distribution, 4NT is a quantitative ` +
      `small-slam invitation, not Blackwood. Partner may Pass or continue with extra values ${id}.`];
  }
  if (call === '5NT') {
    return [`With ${hcp?.actual} HCP and balanced distribution, 5NT invites grand slam ` +
      `while forcing at least a small slam. Partner must continue ${id}.`];
  }
  if (call === '6NT' || call === '7NT') {
    return [`With ${hcp?.actual} HCP and balanced distribution, ${call} is a direct ` +
      `${call === '6NT' ? 'small' : 'grand'}-slam signoff ${id}.`];
  }
  if (rule.id.endsWith('-4c-gerber')) {
    return [`With ${hcp?.actual} HCP, 4♣ is the specialized Gerber ace inquiry, not ` +
      `a natural club bid. Use it when ace information is the remaining slam decision ${id}.`];
  }
  if (call.endsWith('H') || call.endsWith('S')) {
    const suit = notrumpTargetSuit(rule.id, call);
    if (suit === null) return [];
    const length = heldSuitLength === undefined ? '' : `${heldSuitLength}-card `;
    if (rule.id.includes('slam-interest')) {
      return [`${points}your ${length}${suit} suit qualifies for a direct ${call} with slam ` +
        `interest. With transfers available, this is a stronger action than the routine transfer ${id}.`];
    }
    if (rule.id.includes('natural-forcing')) {
      return [`${points}your ${length}${suit} suit qualifies for natural ${call}. With ` +
        `Jacoby transfers off, this is a game-forcing new-suit response ${id}.`];
    }
    if (rule.id.includes('natural-major-game') || rule.id.includes('natural-game') ||
        rule.id.includes('-4h-4s-natural-game')) {
      return [`${points}your ${length}${suit} suit qualifies for natural ${call}, a game ` +
        `signoff under the selected treatment without Texas transfers ${id}.`];
    }
    return [`${points}your ${length}${suit} suit qualifies for natural ${call}, a weak ` +
      `nonforcing signoff with Jacoby transfers disabled ${id}.`];
  }
  return [];
}

/// Report the tested requirement most useful to the entered call. A call suppressed by a
/// better descriptive route is not treated as having failed a hand requirement.
export function getNotrumpPartnerResponseFailureLines(result: BidEvalResult): string[] {
  if (result.normalizedCall === null || result.userCallMatchingRules.length > 0) return [];
  const entered = result.normalizedCall;
  for (const { rule, candidates } of result.ruleDiagnostics) {
    if (!rule.id.startsWith('respond-to-1nt-w/-') &&
        !rule.id.startsWith('advance-weak-two-2nt-')) continue;
    const candidate = candidates.find(({ call }) => call === entered);
    if (candidate === undefined || candidate.ruleApplies) continue;
    const checks = candidate.callEvidence?.requirements;
    if (checks === undefined) continue;
    const id = `[${rule.id}]`;
    const hcp = checks.find((item) => item.kind === 'hcp');
    if (hcp?.kind === 'hcp' && !hcp.passed) {
      return [`Under this notrump-response treatment, ${entered} requires ` +
        `${notrumpHcpText(hcp)}; you have ${hcp.actual} HCP ${id}.`];
    }
    const fourCard = checks.find((item) => item.kind === 'fourCardMajor');
    if (fourCard?.kind === 'fourCardMajor' && !fourCard.passed) {
      return [`Stayman ${entered} asks for a four-card major; your hand has no ` +
        `four-card major ${id}.`];
    }
    const length = checks.find((item) => item.kind === 'suitLength' && !item.passed);
    if (length?.kind === 'suitLength') {
      const suit = length.suit === undefined ? 'the required suit' :
        ({ C: 'clubs', D: 'diamonds', H: 'hearts', S: 'spades' }[length.suit]);
      const amount = length.exact !== undefined ? `exactly ${length.exact}` :
        length.min !== undefined ? `at least ${length.min}` :
        length.max !== undefined ? `at most ${length.max}` : 'the required number of';
      return [`${entered} requires ${amount} ${suit} under this selected treatment; ` +
        `you have ${length.actual} ${id}.`];
    }
    const quality = checks.find((item) => item.kind === 'topThreeHonors');
    if (quality?.kind === 'topThreeHonors' && !quality.passed) {
      return [`The natural ${entered} minor-suit invitation requires at least two ` +
        `of A/K/Q in the bid minor ${id}.`];
    }
    const balance = checks.find((item) => item.kind === 'balanced');
    if (balance?.kind === 'balanced' && !balance.passed) {
      return [`The natural ${entered} response requires balanced distribution ` +
        `under the selected treatment; your hand is not balanced ${id}.`];
    }
  }
  return [];
}

///
//// DONT and preemptive jump-overcall advances (B17)
///

const DONT_ADVANCE_ID = 'advance-dont-pass-or-correct';
const JUMP_ADVANCE_RULES = [
  'advance-jump-overcall-pass',
  'advance-two-level-jump-overcall-raise',
  'advance-three-level-jump-overcall-minor-raise',
  'advance-jump-overcall-major-game',
  'advance-jump-overcall-forcing-new-suit',
];

function dontAdvanceExplanation(choice: NonNullable<CallEvidence['dontAdvance']>): string {
  switch (choice.reason) {
    case 'single-suit-relay':
      return 'Partner’s DONT Double shows one long, undisclosed suit. 2♣ is an artificial ' +
        'relay asking partner to name that suit; it does not promise clubs.';
    case 'club-fit':
      return `Partner's DONT 2♣ shows clubs and a higher-ranking suit. With ` +
        `${choice.clubLength} clubs, Pass accepts the known club suit.`;
    case 'ask-higher-suit':
      return `Partner's DONT 2♣ shows clubs and a higher-ranking suit. With only ` +
        `${choice.clubLength} clubs, 2♦ is the artificial pass-or-correct request for ` +
        `partner's other suit; it does not promise diamonds.`;
    case 'diamond-fit':
      return `Partner's DONT 2♦ shows diamonds and a major. With ${choice.diamondLength} ` +
        `diamonds, Pass accepts diamonds under this treatment.`;
    case 'ask-major':
      return `Partner's DONT 2♦ shows diamonds and a major. With ${choice.diamondLength} ` +
        `diamonds and your major-suit holdings (${choice.heartLength} hearts and ` +
        `${choice.spadeLength} spades), 2♥ asks partner to Pass with hearts or correct ` +
        `to 2♠ with spades; 2♥ does not necessarily promise hearts.`;
    case 'heart-preference':
      return `Partner's DONT 2♥ shows both majors. With ${choice.heartLength} hearts and ` +
        `${choice.spadeLength} spades, Pass prefers hearts under this treatment.`;
    case 'spade-preference':
      return `Partner's DONT 2♥ shows both majors. With ${choice.spadeLength} spades and ` +
        `${choice.heartLength} hearts, 2♠ prefers spades; partner has already shown spades.`;
    case 'natural-spades':
      return `Partner's direct DONT 2♠ is natural, showing a one-suited spade hand. ` +
        `Pass leaves that nonforcing contract in place.`;
  }
}

/// The refiner's result, not a second DONT decision tree, establishes the action.
export function getDontAdvanceLines(result: BidEvalResult, rule: BidRule): string[] {
  if (rule.id !== DONT_ADVANCE_ID || result.normalizedCall === null) return [];
  const diagnostic = result.ruleDiagnostics.find((item) => item.rule.id === rule.id);
  const choice = diagnostic?.callEvidence?.dontAdvance;
  const candidate = diagnostic?.candidates.find((item) => item.call === result.normalizedCall);
  if (choice === undefined || candidate?.ruleApplies !== true ||
      choice.selectedCall !== result.normalizedCall) return [];
  return [dontAdvanceExplanation(choice) + ` [${rule.id}]`];
}

export function getDontAdvanceFailureLines(result: BidEvalResult): string[] {
  if (result.normalizedCall === null || result.userCallMatchingRules.length > 0) return [];
  const diagnostic = result.ruleDiagnostics.find((item) => item.rule.id === DONT_ADVANCE_ID);
  const choice = diagnostic?.callEvidence?.dontAdvance;
  if (choice === undefined || result.normalizedCall === choice.selectedCall ||
      !['Pass', '2C', '2D', '2H', '2S'].includes(result.normalizedCall)) return [];
  return [`After partner's ${choice.partnerCall} DONT call, the selected basic ` +
    `pass-or-correct treatment chooses ${choice.selectedCall} instead of ` +
    `${result.normalizedCall}. ${dontAdvanceExplanation(choice)} [${DONT_ADVANCE_ID}]`];
}

function jumpAdvanceDiagnostic(result: BidEvalResult, ruleId: string) {
  const diagnostic = result.ruleDiagnostics.find((item) => item.rule.id === ruleId);
  const candidate = diagnostic?.candidates.find((item) => item.call === result.normalizedCall);
  const evidence = candidate?.callEvidence?.jumpAdvance ?? diagnostic?.callEvidence?.jumpAdvance;
  const considered = evidence?.considered?.find((item) => item.call === result.normalizedCall);
  return { diagnostic, candidate, evidence, considered };
}

/// Positive instructions use the checks and retained choices on the actual selected rule.
export function getJumpAdvanceLines(result: BidEvalResult, rule: BidRule): string[] {
  if (!JUMP_ADVANCE_RULES.includes(rule.id) || result.normalizedCall === null) return [];
  const { candidate, evidence, considered } = jumpAdvanceDiagnostic(result, rule.id);
  if (candidate?.ruleApplies !== true || evidence === undefined) return [];
  const call = result.normalizedCall;
  const id = `[${rule.id}]`;
  const points = minorRequirement(candidate, 'totalPoints');
  const hcp = minorRequirement(candidate, 'hcp');
  if (rule.id.endsWith('-pass')) {
    if (evidence.passReason === 'four-level') {
      return [`Partner's four-level jump overcall is already a high preempt. ` +
        `Pass is the normal signoff under this treatment, even with ${evidence.hcp} HCP ${id}.`];
    }
    if (evidence.passReason === 'limited-no-fit') {
      return [`Partner's preemptive ${evidence.overcallLevel}${evidence.trumpSuit} ` +
        `is nonforcing. With ${evidence.hcp} HCP and ${evidence.support} trumps, ` +
        `Pass leaves partner's long-suit preempt in place ${id}.`];
    }
    return [];
  }
  if (rule.id.endsWith('-forcing-new-suit')) {
    if (hcp === undefined || considered === undefined || !considered.qualityPassed) return [];
    return [`With ${hcp.actual} HCP and ${considered.length} ${suitPlural(call)}, ` +
      `${call} qualifies as an economical new-suit advance. The suit satisfies the honor ` +
      `requirement (${PREEMPT_SUIT_QUALITY}). It forces partner to bid again; this is not ` +
      `a weak preference after a preempt ${id}.`];
  }
  if (points === undefined || considered === undefined) return [];
  if (rule.id.endsWith('-major-game')) {
    const partnerLength = evidence.overcallLevel === 2 ? 6 : 7;
    return [`With ${points.actual} support points and ${evidence.support} ${suitPlural(call)}, ` +
      `${call} bids natural game. Partner's preempt typically shows ${partnerLength} trumps, ` +
      `so the combined fit is substantial. This is a game signoff, not a slam invitation ${id}.`];
  }
  const combined = evidence.overcallLevel === 2 ? 6 + evidence.support : 7 + evidence.support;
  return [`With ${points.actual} support points and ${evidence.support} ${suitPlural(call)}, ` +
    `${call} raises partner's weak preempt competitively. Your partnership expects about ` +
    `${combined} trumps; the raise takes away opponents' bidding room rather than inviting ` +
    `game. Partner may Pass ${id}.`];
}

/// Explain a tested strength/length failure, or a filtered-out suit/quality decision.
/// Never infer that a mechanically unavailable call failed a hand requirement.
export function getJumpAdvanceFailureLines(result: BidEvalResult): string[] {
  if (result.normalizedCall === null || result.userCallMatchingRules.length > 0) return [];
  const entered = result.normalizedCall;
  for (const ruleId of JUMP_ADVANCE_RULES) {
    const { diagnostic, candidate, evidence, considered } = jumpAdvanceDiagnostic(result, ruleId);
    if (diagnostic === undefined || evidence === undefined) continue;
    const id = `[${ruleId}]`;
    if (ruleId.endsWith('-pass') && entered === 'Pass' &&
        evidence.passReason === null) {
      return [`Partner's preempt is nonforcing, but this limited-hand Pass treatment ` +
        `does not qualify with ${evidence.hcp} HCP and ${evidence.support} trumps ${id}.`];
    }
    if (considered === undefined) continue;
    if (considered.requiredLength !== undefined &&
        considered.length < considered.requiredLength) {
      return [`${entered} requires at least ${considered.requiredLength} trumps in ` +
        `partner's preemptive suit; you have ${considered.length} ${id}.`];
    }
    if (candidate?.ruleApplies === false) {
      const points = minorRequirement(candidate, 'totalPoints');
      if (points !== undefined && !points.passed) {
        return [`${entered} under this treatment requires ` +
          `${strengthRange(points).replace('total points', 'support points')}; ` +
          `you have ${points.actual} support points ${id}.`];
      }
      const hcp = minorRequirement(candidate, 'hcp');
      if (hcp !== undefined && !hcp.passed) {
        return [`A forcing new-suit advance of ${entered} requires ${hcpRangeText(hcp)}; ` +
          `you have ${hcp.actual} HCP ${id}.`];
      }
      const length = minorRequirement(candidate, 'suitLength');
      if (length !== undefined && !length.passed) {
        return [`The new-suit ${entered} advance requires at least ${length.min} ` +
          `${suitPlural(entered)}; you have ${length.actual} ${id}.`];
      }
    }
    if (considered.economical === false) {
      return [`${entered} is not an economical non-jump new-suit advance at or below ` +
        `the three level after partner's preempt ${id}.`];
    }
    if (considered.qualityPassed === false) {
      return [`A forcing new-suit advance of ${entered} requires ` +
        `${PREEMPT_SUIT_QUALITY}; your ${suitPlural(entered)} do not meet this ` +
        `honor-quality requirement ${id}.`];
    }
  }
  return [];
}

///
//// Competitive advances after responder raises opener (B18)
///

const COMPETITIVE_RAISE_PREFIXES = [
  'advance-one-level-suit-overcall-after-responder-raise-',
  'advance-two-level-suit-overcall-after-responder-raise-',
  'advance-takeout-double-after-responder-raise-',
];
const COMPETITIVE_NT_ID = 'advance-after-responder-action-natural-notrump';

function competitiveRaiseRule(ruleId: string): boolean {
  return COMPETITIVE_RAISE_PREFIXES.some((prefix) => ruleId.startsWith(prefix));
}

function competitiveRaiseDiagnostic(result: BidEvalResult, ruleId: string) {
  const diagnostic = result.ruleDiagnostics.find((item) => item.rule.id === ruleId);
  const candidate = diagnostic?.candidates.find((item) => item.call === result.normalizedCall);
  return { diagnostic, candidate };
}

/// Explain only the selected rule and facts evaluated for this particular call.
export function getCompetitiveRaiseAdvanceLines(result: BidEvalResult, rule: BidRule): string[] {
  if ((!competitiveRaiseRule(rule.id) && rule.id !== COMPETITIVE_NT_ID) ||
      result.normalizedCall === null) return [];
  const { candidate } = competitiveRaiseDiagnostic(result, rule.id);
  if (candidate?.ruleApplies !== true) return [];
  const id = `[${rule.id}]`;
  const call = result.normalizedCall;
  const checks = candidate.callEvidence?.requirements ?? [];
  const points = checks.find((item) => item.kind === 'totalPoints');
  const support = checks.find((item) => item.kind === 'partnerSupport');
  const hcp = checks.find((item) => item.kind === 'hcp');
  const length = checks.find((item) => item.kind === 'suitLength');
  if (rule.id.endsWith('-pass')) {
    const decision = candidate.callEvidence?.competitiveRaisePass;
    if (decision === undefined) return [];
    const opening = decision.partnerAction === 'takeoutDouble' ?
      `Responder's raise removes the ordinary obligation to bid after partner's takeout Double.` :
      `Partner's natural overcall is nonforcing, and responder has raised opener.`;
    return [`${opening} With ${decision.hcp} HCP and no qualifying competitive ` +
      `raise, natural new suit, or responsive Double under this treatment, Pass is reasonable ${id}.`];
  }
  if (rule.id.endsWith('-responsive-double')) {
    const choice = candidate.callEvidence?.responsiveDouble;
    if (choice === undefined) return [];
    const suits = choice.unbidSuits.filter((item) => item.length >= 4)
      .map((item) => ({ C: 'clubs', D: 'diamonds', H: 'hearts', S: 'spades' })[item.suit]);
    const suitText = suits.length === 2 ? suits.join(' and ') :
      suits.slice(0, -1).join(', ') + ', and ' + suits[suits.length - 1];
    const supportText = choice.partnerSupport === undefined ? '' :
      ` and only ${choice.partnerSupport} cards in partner's overcalled suit`;
    return [`With ${choice.points} length-adjusted points, four or more cards in ` +
      `${suitText}${supportText}, your Double is responsive, not a penalty Double. ` +
      `It asks partner to help choose a suitable unbid suit rather than guessing one ${id}.`];
  }
  if (rule.id === COMPETITIVE_NT_ID) {
    if (hcp === undefined || candidate.callEvidence?.competitiveNotrump?.levelAllowed !== true) return [];
    const stopped = checks.flatMap((item) => item.kind === 'stopper' && item.passed ?
      [item.suit === undefined ? 'opener’s suit' :
        ({ C: 'clubs', D: 'diamonds', H: 'hearts', S: 'spades' })[item.suit]] : []);
    const message = call === '3NT' ? 'a natural game bid' :
      call === '2NT' ? 'a natural game invitation' : 'a natural, nonforcing advance';
    return [`With ${hcp.actual} HCP, balanced shape, and ${stopped.length === 1 ? 'a stopper' : 'stoppers'} ` +
      `in ${stopped.join(' and ')}, ${call} qualifies as ${message}. The stoppers protect ` +
      `against leads in the opponents' naturally bid suits ${id}.`];
  }
  if (rule.id.endsWith('-support-cuebid') || rule.id.endsWith('-strong-cuebid')) {
    if (points === undefined) return [];
    if (support !== undefined) {
      return [`With ${points.actual} support points and ${support.actual} cards in partner's ` +
        `overcalled suit, ${call} is an artificial strong raise, not a natural bid in opener's suit. ` +
        `It forces partner to bid again ${id}.`];
    }
    return [`With ${points.actual} length-adjusted points, ${call} is a strong artificial ` +
      `cuebid of opener's suit after partner's takeout Double. It does not promise a ` +
      `particular trump fit; partner must bid again ${id}.`];
  }
  if (rule.id.endsWith('-simple-raise') || rule.id.endsWith('-preemptive-raise')) {
    if (points === undefined || support === undefined) return [];
    if (rule.id.endsWith('-preemptive-raise')) {
      return [`With ${points.actual} support points and ${support.actual} trumps, ${call} ` +
        `is a weak preemptive jump raise. It takes away bidding room rather than ` +
        `inviting game; the jump does not promise extra strength ${id}.`];
    }
    return [`With ${points.actual} support points and ${support.actual} trumps, ${call} ` +
      `is a constructive, nonforcing raise of partner's overcall. Partner may Pass; ` +
      `this is not the stronger artificial cuebid ${id}.`];
  }
  if (rule.id.includes('-new-suit-')) {
    if (length === undefined) return [];
    const strength = hcp !== undefined ? `${hcp.actual} HCP` : points !== undefined ?
      `${points.actual} length-adjusted points` : null;
    if (strength === null) return [];
    const forcing = rule.callCategory?.includes('forcing') === true;
    const quality = rule.id.endsWith('-three-level') ?
      ` The suit meets the honor requirement (${PREEMPT_SUIT_QUALITY}).` : '';
    return [`With ${strength} and ${length.actual} ${suitPlural(call)}, ${call} ` +
      `qualifies as an economical natural new-suit advance.${quality} ` +
      (forcing ? `It forces partner to bid again` : `It is nonforcing: partner may Pass`) +
      ` ${id}.`];
  }
  return [];
}

/// Failure messages come from the exact evaluated candidate or a decision retained by
/// its refiner. Do not treat a filtered-out rule as a tested strength failure.
export function getCompetitiveRaiseAdvanceFailureLines(result: BidEvalResult): string[] {
  if (result.normalizedCall === null || result.userCallMatchingRules.length > 0) return [];
  const entered = result.normalizedCall;
  for (const diagnostic of result.ruleDiagnostics) {
    const ruleId = diagnostic.rule.id;
    if (!competitiveRaiseRule(ruleId) && ruleId !== COMPETITIVE_NT_ID) continue;
    const candidate = diagnostic.candidates.find((item) => item.call === entered);
    if (candidate?.ruleApplies === true) continue;
    if (entered === 'Pass' && ruleId.endsWith('-pass') && candidate !== undefined) {
      const decision = candidate.callEvidence?.competitiveRaisePass;
      if (decision === undefined) continue;
      const alternative = result.ruleDiagnostics.flatMap((item) => item.candidates)
        .find((item) => item.ruleApplies && item.call !== 'Pass');
      if (alternative !== undefined) {
        return [`Responder's raise permits Pass, but ${alternative.call} is a supported ` +
          `competitive action for this hand. Passing would leave that descriptive ` +
          `opportunity unused [${ruleId}].`];
      }
      if (decision.partnerAction === 'overcall' && decision.hcp > 10) {
        return [`The weak Pass treatment after a natural overcall is limited to 10 HCP; ` +
          `you have ${decision.hcp}. That alone does not establish another supported ` +
          `bid [${ruleId}].`];
      }
      continue;
    }
    if (entered === 'Double' && ruleId.endsWith('-responsive-double') && candidate !== undefined) {
      const check = candidate.callEvidence?.responsiveDouble;
      if (check === undefined) continue;
      if (check.points < check.min || (check.max !== undefined && check.points > check.max)) {
        return [`A responsive Double under this treatment requires ` +
          `${check.max === undefined ? `at least ${check.min}` : `${check.min}–${check.max}`} ` +
          `length-adjusted points; you have ${check.points} [${ruleId}].`];
      }
      if (check.partnerSupport !== undefined && check.partnerSupport >= 3) {
        return [`This responsive Double requires fewer than three cards in partner's ` +
          `overcalled suit; you have ${check.partnerSupport}. A Double would incorrectly ` +
          `ask partner to select an unbid suit [${ruleId}].`];
      }
      const five = check.unbidSuits.find((item) => item.length >= 5);
      if (five !== undefined) {
        const alternative = result.ruleDiagnostics.flatMap((item) => item.candidates)
          .find((item) => item.ruleApplies && item.call[1] === five.suit &&
            item.rule.id.includes('-new-suit-'));
        if (alternative !== undefined) {
          return [`Your five-card ${suitName(alternative.call)} suit supports the natural ` +
            `${alternative.call} advance instead of a responsive Double under the selected ` +
            `treatment [${ruleId}].`];
        }
        return [`The selected responsive-Double treatment excludes hands with a five-card ` +
          `unbid suit. You have ${five.length} cards in that suit [${ruleId}].`];
      }
      const short = check.unbidSuits.filter((item) => item.length < 4);
      if (short.length > 0) {
        return [`A responsive Double requires at least two unbid suits with four or more ` +
          `cards under this treatment; your hand does not have that shape [${ruleId}].`];
      }
    }
    if (ruleId.endsWith('-new-suit-three-level') && candidate === undefined) {
      const checked = diagnostic.callEvidence?.competitiveRaiseNewSuit?.considered
        .find((item) => item.call === entered);
      if (checked?.economical === true && checked.length < 5) {
        return [`An economical three-level ${entered} advance requires five or more ` +
          `${suitPlural(entered)}; you have ${checked.length} [${ruleId}].`];
      }
      if (checked?.economical === true && !checked.qualityPassed) {
        return [`A three-level new-suit advance to ${entered} requires ` +
          `${PREEMPT_SUIT_QUALITY}; your ${suitPlural(entered)} do not satisfy that ` +
          `honor test [${ruleId}].`];
      }
    }
    if (candidate === undefined) continue;
    if (ruleId === COMPETITIVE_NT_ID) {
      const evidence = candidate.callEvidence;
      if (evidence?.competitiveNotrump?.levelAllowed === false) {
        return [`The modeled natural ${entered} advance is not available at this level ` +
          `of the opponents' auction [${ruleId}].`];
      }
      const failed = evidence?.requirements?.find((item) => !item.passed);
      if (failed?.kind === 'hcp') {
        return [`Natural ${entered} requires ${hcpRangeText(failed)}; ` +
          `you have ${failed.actual} HCP [${ruleId}].`];
      }
      if (failed?.kind === 'balanced') {
        return [`Natural ${entered} requires a balanced hand, which you do not have ` +
          `[${ruleId}].`];
      }
      if (failed?.kind === 'stopper') {
        const suit = failed.suit === undefined ? 'the opponents’ suit' :
          ({ C: 'clubs', D: 'diamonds', H: 'hearts', S: 'spades' })[failed.suit];
        return [`Natural ${entered} requires a stopper in ${suit}, which your hand ` +
          `lacks [${ruleId}].`];
      }
      continue;
    }
    const checks = candidate.callEvidence?.requirements ?? [];
    const support = checks.find((item) => item.kind === 'partnerSupport' && !item.passed);
    const strength = checks.find((item) =>
      (item.kind === 'hcp' || item.kind === 'totalPoints') && !item.passed);
    const length = checks.find((item) => item.kind === 'suitLength' && !item.passed);
    if (support?.kind === 'partnerSupport') {
      return [`${entered} needs at least ${support.min} cards in partner's overcalled ` +
        `suit; you have ${support.actual} [${ruleId}].`];
    }
    if (strength?.kind === 'hcp') {
      return [`${entered} requires ${hcpRangeText(strength)}; ` +
        `your hand has ${strength.actual} HCP [${ruleId}].`];
    }
    if (strength?.kind === 'totalPoints') {
      const kind = ruleId.includes('takeout-double') ? 'length-adjusted' : 'support';
      return [`${entered} requires ${strengthRange(strength).replace('total points', kind + ' points')}; ` +
        `you have ${strength.actual} ${kind} points [${ruleId}].`];
    }
    if (length?.kind === 'suitLength') {
      return [`${entered} requires at least ${length.min} ${suitPlural(entered)}; ` +
        `you have ${length.actual} [${ruleId}].`];
    }
  }
  return [];
}


///
//// Competitive advances after responder bids naturally (B19)
///

const COMPETITIVE_NATURAL_PREFIXES = [
  'advance-suit-overcall-after-responder-natural-action-',
  'advance-one-level-suit-overcall-after-responder-natural-action-',
  'advance-two-level-suit-overcall-after-responder-natural-action-',
  'advance-takeout-double-after-responder-natural-action-',
];

function competitiveNaturalRule(ruleId: string): boolean {
  return COMPETITIVE_NATURAL_PREFIXES.some((prefix) => ruleId.startsWith(prefix));
}

/// Positive messages rely on the evaluated rule, not independent hand checks.
export function getCompetitiveNaturalAdvanceLines(result: BidEvalResult, rule: BidRule): string[] {
  if (!competitiveNaturalRule(rule.id) || result.normalizedCall === null) return [];
  const candidate = result.ruleDiagnostics.find((item) => item.rule.id === rule.id)
    ?.candidates.find((item) => item.call === result.normalizedCall);
  if (candidate?.ruleApplies !== true) return [];
  const checks = candidate.callEvidence?.requirements ?? [];
  const points = checks.find((item) => item.kind === 'totalPoints');
  const support = checks.find((item) => item.kind === 'partnerSupport');
  const hcp = checks.find((item) => item.kind === 'hcp');
  const length = checks.find((item) => item.kind === 'suitLength');
  const call = result.normalizedCall;
  const id = `[${rule.id}]`;
  if (rule.id.endsWith('-pass')) {
    const choice = candidate.callEvidence?.competitiveNaturalPass;
    if (choice === undefined) return [];
    const context = choice.partnerAction === 'takeoutDouble' ?
      `Responder's natural bid removes the usual obligation to answer partner's takeout Double.` :
      `Partner's natural suit overcall is nonforcing, and responder has bid naturally.`;
    const alternatives = choice.partnerAction === 'overcall' ?
      'raise, natural new-suit, or notrump advance' :
      'natural new-suit or notrump advance';
    return [`${context} With ${choice.hcp} HCP and no qualifying ${alternatives}, ` +
      `Pass is reasonable under this treatment ${id}.`];
  }
  if (rule.id.endsWith('-support-cuebid') || rule.id.endsWith('-strong-cuebid')) {
    if (points === undefined) return [];
    if (support !== undefined) {
      return [`With ${points.actual} support points and ${support.actual} cards in partner's ` +
        `overcalled suit, ${call} is an artificial strong raise, forcing for one round. ` +
        `You are not showing ${suitPlural(call)} because that is the opponents' opening suit ${id}.`];
    }
    return [`With ${points.actual} length-adjusted points, ${call} is a strong artificial ` +
      `cuebid of opener's suit. It does not show that suit or promise one particular ` +
      `unbid-suit fit; partner must bid again ${id}.`];
  }
  if (rule.id.endsWith('-simple-raise') || rule.id.endsWith('-preemptive-raise')) {
    if (points === undefined || support === undefined) return [];
    if (rule.id.endsWith('-preemptive-raise')) {
      return [`With ${points.actual} support points and ${support.actual} trumps, ${call} ` +
        `is a weak preemptive jump raise. The purpose is to consume bidding room, ` +
        `not to invite game ${id}.`];
    }
    return [`With ${points.actual} support points and ${support.actual} trumps, ${call} ` +
      `is a constructive, nonforcing raise of partner's suit overcall. ` +
      `Partner may Pass ${id}.`];
  }
  if (rule.id.includes('-new-suit-') && length !== undefined) {
    const strength = hcp !== undefined ? `${hcp.actual} HCP` :
      points !== undefined ? `${points.actual} length-adjusted points` : null;
    if (strength === null) return [];
    const quality = rule.id.endsWith('-three-level') ?
      ` The suit meets the honor requirement (${PREEMPT_SUIT_QUALITY}).` : '';
    const forcing = rule.callCategory?.includes('forcing') === true;
    return [`With ${strength} and ${length.actual} ${suitPlural(call)}, ${call} ` +
      `is an economical natural new-suit advance.${quality} ` +
      (forcing ? `It forces partner to bid again` : `It is nonforcing: partner may Pass`) +
      ` ${id}.`];
  }
  return [];
}

/// On an unsupported call, discuss only the applicable rule that actually tested it.
/// Refiner exclusions use preserved suit-choice evidence rather than recalculated rules.
export function getCompetitiveNaturalAdvanceFailureLines(result: BidEvalResult): string[] {
  if (result.normalizedCall === null || result.userCallMatchingRules.length > 0) return [];
  const entered = result.normalizedCall;
  for (const diagnostic of result.ruleDiagnostics) {
    const ruleId = diagnostic.rule.id;
    if (!competitiveNaturalRule(ruleId)) continue;
    const candidate = diagnostic.candidates.find((item) => item.call === entered);
    if (candidate?.ruleApplies === true) continue;
    if (entered === 'Pass' && ruleId.endsWith('-pass') && candidate !== undefined) {
      const choice = candidate.callEvidence?.competitiveNaturalPass;
      if (choice === undefined) continue;
      const alternative = result.ruleDiagnostics.flatMap((item) => item.candidates)
        .find((item) => item.ruleApplies === true && item.call !== 'Pass');
      if (alternative !== undefined) {
        return [`Responder's natural bid allows you to Pass, but ${alternative.call} ` +
          `is a qualifying constructive advance for this hand. Pass would leave ` +
          `that opportunity unused [${ruleId}].`];
      }
      if (choice.partnerAction === 'overcall' && choice.hcp > 10) {
        return [`The limited Pass treatment after a natural overcall allows at most ` +
          `10 HCP; you have ${choice.hcp}. This does not by itself establish ` +
          `another supported call [${ruleId}].`];
      }
      if (choice.partnerAction === 'takeoutDouble' && choice.lengthPoints > 11) {
        return [`The limited Pass treatment after partner's takeout Double allows ` +
          `at most 11 length-adjusted points; you have ${choice.lengthPoints}. ` +
          `That alone does not establish another supported bid [${ruleId}].`];
      }
      continue;
    }
    if (ruleId.endsWith('-new-suit-three-level') && candidate === undefined) {
      const considered = diagnostic.callEvidence?.competitiveNaturalNewSuit?.considered
        .find((item) => item.call === entered);
      if (considered?.economical !== true) continue;
      if (considered.length < 5) {
        return [`An economical three-level ${entered} new-suit advance requires ` +
          `at least five ${suitPlural(entered)}; you have ${considered.length} [${ruleId}].`];
      }
      if (considered.qualityPassed === false) {
        return [`A three-level new-suit advance of ${entered} requires ` +
          `${PREEMPT_SUIT_QUALITY}; your ${suitPlural(entered)} do not meet ` +
          `that requirement [${ruleId}].`];
      }
      continue;
    }
    if (candidate === undefined) continue;
    const checks = candidate.callEvidence?.requirements ?? [];
    const support = checks.find((item) => item.kind === 'partnerSupport' && !item.passed);
    const strength = checks.find((item) =>
      (item.kind === 'hcp' || item.kind === 'totalPoints') && !item.passed);
    const length = checks.find((item) => item.kind === 'suitLength' && !item.passed);
    if (support?.kind === 'partnerSupport') {
      return [`${entered} requires at least ${support.min} cards in partner's ` +
        `overcalled suit; you have ${support.actual} [${ruleId}].`];
    }
    if (strength?.kind === 'hcp') {
      return [`${entered} requires ${hcpRangeText(strength)}; ` +
        `you have ${strength.actual} HCP [${ruleId}].`];
    }
    if (strength?.kind === 'totalPoints') {
      const valuation = ruleId.includes('takeout-double') ? 'length-adjusted' : 'support';
      return [`${entered} requires ${strengthRange(strength).replace('total points',
        valuation + ' points')}; you have ${strength.actual} ${valuation} points [${ruleId}].`];
    }
    if (length?.kind === 'suitLength') {
      return [`${entered} requires at least ${length.min} ${suitPlural(entered)}; ` +
        `you have ${length.actual} [${ruleId}].`];
    }
  }
  return [];
}

///
//// Competitive advances after negative Doubles and Redoubles (B20)
///

const REDOUBLED_TAKEOUT_ESCAPE_ID =
  'advance-takeout-double-after-responder-redouble-weak-suit-escape';

function negativeDoubleAdvanceRule(ruleId: string): boolean {
  return ruleId.includes('-after-negative-double-') && (
    ruleId.startsWith('advance-suit-overcall-') ||
    ruleId.startsWith('advance-one-level-suit-overcall-') ||
    ruleId.startsWith('advance-two-level-suit-overcall-'));
}

function negativeDoubleAdvanceDiagnostic(result: BidEvalResult, ruleId: string) {
  const diagnostic = result.ruleDiagnostics.find((item) => item.rule.id === ruleId);
  const candidate = diagnostic?.candidates.find((item) => item.call === result.normalizedCall);
  return { diagnostic, candidate };
}

/// Explain the actual qualifying B20 treatment, not every alternative that was considered.
export function getNegativeDoubleAdvanceLines(result: BidEvalResult, rule: BidRule): string[] {
  if ((!negativeDoubleAdvanceRule(rule.id) &&
       rule.id !== REDOUBLED_TAKEOUT_ESCAPE_ID) || result.normalizedCall === null) return [];
  const { diagnostic, candidate } = negativeDoubleAdvanceDiagnostic(result, rule.id);
  if (candidate?.ruleApplies !== true) return [];
  const call = result.normalizedCall;
  const id = `[${rule.id}]`;
  const hcp = minorRequirement(candidate, 'hcp');
  const points = minorRequirement(candidate, 'totalPoints');
  const support = minorRequirement(candidate, 'partnerSupport');
  const length = minorRequirement(candidate, 'suitLength');

  if (rule.id === REDOUBLED_TAKEOUT_ESCAPE_ID) {
    const escape = diagnostic?.callEvidence?.redoubledTakeoutEscape;
    const considered = escape?.considered.find((item) => item.call === call);
    if (escape === undefined || considered === undefined || points === undefined) return [];
    const fallback = considered.length === 3 ?
      `With no four-card unbid suit, this three-card ${suitPlural(call)} response is ` +
        `the fallback; it does not promise four cards.` :
      `Your ${considered.length} ${suitPlural(call)} provide a possible contract strain.`;
    return [`Responder's Redouble shows strength for the opponents. With ` +
      `${points.actual} length-adjusted points, ${call} is a weak, natural escape ` +
      `at the cheapest level. ${fallback} It is not an invitation to game ${id}.`];
  }
  if (rule.id.endsWith('-pass')) {
    const pass = candidate.callEvidence?.negativeDoublePass;
    if (pass === undefined) return [];
    return [`Responder's negative Double is artificial and does not oblige you to bid ` +
      `after partner's natural overcall. With ${pass.hcp} HCP and no qualifying ` +
      `constructive raise, natural new suit, or notrump advance, Pass is reasonable ${id}.`];
  }
  if (rule.id.endsWith('-simple-raise') || rule.id.endsWith('-preemptive-raise')) {
    if (points === undefined || support === undefined) return [];
    if (rule.id.endsWith('-preemptive-raise')) {
      return [`With ${points.actual} support points and ${support.actual} trumps, ${call} ` +
        `is a weak preemptive jump raise. It takes bidding space away from the opponents ` +
        `rather than inviting game; partner may Pass ${id}.`];
    }
    return [`With ${points.actual} support points and ${support.actual} trumps, ${call} ` +
      `is a constructive, nonforcing raise of partner's overcall. Partner may Pass ${id}.`];
  }
  if (rule.id.endsWith('-support-cuebid')) {
    if (points === undefined || support === undefined) return [];
    return [`With ${points.actual} support points and ${support.actual} trumps, ${call} ` +
      `is an artificial strong raise of partner's suit. It bids the opponents' opening ` +
      `suit, not a natural suit of your own, and forces partner to bid again. ` +
      `It describes your fit more precisely than a general strength-showing Redouble ${id}.`];
  }
  if (rule.id.endsWith('-natural-notrump')) {
    const stopper = candidate.callEvidence?.requirements?.find((check) =>
      check.kind === 'stopper');
    if (hcp === undefined || stopper?.kind !== 'stopper' || !stopper.passed) return [];
    const meaning = call === '2NT' ? 'a natural game invitation' :
      'a natural, nonforcing notrump advance';
    return [`With ${hcp.actual} HCP, balanced distribution, and a stopper in opener's ` +
      `${stopper.suit === undefined ? 'suit' : suitPlural(`1${stopper.suit}`)}, ` +
      `${call} qualifies as ${meaning}. This gives partner more information ` +
      `than a general strength-showing Redouble ${id}.`];
  }
  if (rule.id.endsWith('-new-suit-two-level')) {
    if (hcp === undefined || length === undefined) return [];
    return [`With ${hcp.actual} HCP and ${length.actual} ${suitPlural(call)}, ` +
      `${call} is a natural economical new-suit advance, forcing partner to bid again. ` +
      `It avoids the suit suggested by responder's negative Double ${id}.`];
  }
  if (rule.id.endsWith('-redouble-values')) {
    const decision = candidate.callEvidence?.negativeDoubleRedouble;
    if (decision === undefined) return [];
    return [`With ${decision.hcp} HCP and no more descriptive qualifying support ` +
      `cuebid, natural notrump, or side-suit advance, Redouble shows general values. ` +
      `It does not promise a specific suit or a fit and is not a penalty Double ${id}.`];
  }
  return [];
}

/// Use evaluated failures and the refining decisions that actually removed a call.
/// A legal Pass after the opponents Redouble is not automatically a bad bridge judgment.
export function getNegativeDoubleAdvanceFailureLines(result: BidEvalResult): string[] {
  if (result.normalizedCall === null || result.userCallMatchingRules.length > 0) return [];
  const entered = result.normalizedCall;
  const escape = result.ruleDiagnostics.find((item) => item.rule.id === REDOUBLED_TAKEOUT_ESCAPE_ID);
  const escapeDecision = escape?.callEvidence?.redoubledTakeoutEscape;
  if (entered === 'Pass' && escapeDecision !== undefined) {
    return [`Pass may be a good bid after the opponents Redouble partner's takeout ` +
      `Double, but that decision depends on defensive and other judgment factors the ` +
      `trainer cannot confirm here. A weak economical suit escape may also be available ` +
      `[${REDOUBLED_TAKEOUT_ESCAPE_ID}].`];
  }
  if (escapeDecision !== undefined && entered !== 'Pass') {
    const considered = escapeDecision.considered.find((item) => item.call === entered);
    if (considered !== undefined && !considered.eligible) {
      if (considered.length < 4 &&
          (escapeDecision.hasFourCardUnbidSuit || considered.length < 3)) {
        return [`The weak escape to ${entered} requires at least four cards in that suit, ` +
          `or three when no four-card unbid suit exists. You have ${considered.length} ` +
          `${suitPlural(entered)} [${REDOUBLED_TAKEOUT_ESCAPE_ID}].`];
      }
      if (considered.cheapest !== entered) {
        return [`A weak suit escape must be made at the cheapest legal level in that suit; ` +
          `${entered} is not the economical call [${REDOUBLED_TAKEOUT_ESCAPE_ID}].`];
      }
    }
    const candidate = escape?.candidates.find((item) => item.call === entered);
    const points = candidate === undefined ? undefined : minorRequirement(candidate, 'totalPoints');
    if (points !== undefined && !points.passed) {
      return [`The weak suit escape allows at most eight length-adjusted points; ` +
        `your hand has ${points.actual}. Stronger decisions require additional judgment ` +
        `[${REDOUBLED_TAKEOUT_ESCAPE_ID}].`];
    }
  }
  for (const diagnostic of result.ruleDiagnostics) {
    if (!negativeDoubleAdvanceRule(diagnostic.rule.id)) continue;
    const id = `[${diagnostic.rule.id}]`;
    const candidate = diagnostic.candidates.find((item) => item.call === entered);
    if (candidate?.ruleApplies === true) continue;
    if (entered === 'Pass' && diagnostic.rule.id.endsWith('-pass') && candidate !== undefined) {
      const pass = candidate.callEvidence?.negativeDoublePass;
      if (pass === undefined) continue;
      const alternative = result.ruleDiagnostics.flatMap((item) => item.candidates)
        .find((item) => item.ruleApplies && item.call !== 'Pass');
      if (alternative !== undefined) {
        return [`Partner's natural overcall is nonforcing, but ${alternative.call} ` +
          `qualifies as a more constructive advance for this hand ${id}.`];
      }
      if (pass.hcp >= 10) {
        return [`The limited Pass treatment after responder's negative Double calls ` +
          `for fewer than 10 HCP; you have ${pass.hcp}. This does not necessarily ` +
          `establish a better modeled call ${id}.`];
      }
      continue;
    }
    if (entered === 'Redouble' && diagnostic.rule.id.endsWith('-redouble-values') &&
        candidate !== undefined) {
      const decision = candidate.callEvidence?.negativeDoubleRedouble;
      if (decision === undefined) continue;
      if (decision.hcp < 10) {
        return [`A strength-showing Redouble requires at least 10 HCP; you have ` +
          `${decision.hcp} ${id}.`];
      }
      const alternative = result.ruleDiagnostics.flatMap((item) => item.candidates)
        .find((item) => item.ruleApplies && item.call !== 'Redouble');
      if (alternative !== undefined) {
        return [`You have the strength to Redouble, but ${alternative.call} qualifies ` +
          `as a more descriptive advance under the selected treatment ${id}.`];
      }
      return [`Redouble with ${decision.hcp} HCP is reserved for hands without a ` +
        `more descriptive support, notrump, or new-suit action ${id}.`];
    }
    if (diagnostic.rule.id.endsWith('-new-suit-two-level') && candidate === undefined) {
      const decision = diagnostic.callEvidence?.negativeDoubleNewSuit;
      const considered = decision?.considered.find((item) => item.call === entered);
      if (considered !== undefined && considered.impliedByDouble) {
        return [`Responder's negative Double suggests ${suitPlural(entered)} in ` +
          `this auction. The selected natural new-suit advance does not use that suit ` +
          `${id}.`];
      }
      continue;
    }
    if (candidate === undefined) continue;
    const support = minorRequirement(candidate, 'partnerSupport');
    if (support !== undefined && !support.passed) {
      return [`${entered} requires at least ${support.min} cards in partner's ` +
        `overcalled suit; you have ${support.actual} ${id}.`];
    }
    const hcp = minorRequirement(candidate, 'hcp');
    if (hcp !== undefined && !hcp.passed) {
      return [`${entered} requires ${hcpRangeText(hcp)}; you have ${hcp.actual} HCP ${id}.`];
    }
    const points = minorRequirement(candidate, 'totalPoints');
    if (points !== undefined && !points.passed) {
      return [`${entered} requires ${strengthRange(points).replace('total points',
        'support points')}; you have ${points.actual} support points ${id}.`];
    }
    const length = minorRequirement(candidate, 'suitLength');
    if (length !== undefined && !length.passed) {
      return [`${entered} requires at least ${length.min} ${suitPlural(entered)}; ` +
        `you have ${length.actual} ${id}.`];
    }
    if (diagnostic.rule.id.endsWith('-natural-notrump')) {
      const checks = candidate.callEvidence?.requirements ?? [];
      const shape = checks.find((check) => check.kind === 'balanced');
      const stopper = checks.find((check) => check.kind === 'stopper');
      if (shape?.kind === 'balanced' && !shape.passed) {
        return [`A natural notrump advance requires balanced distribution; ` +
          `your hand is not balanced ${id}.`];
      }
      if (stopper?.kind === 'stopper' && !stopper.passed) {
        return [`A natural notrump advance requires a stopper in opener's suit, ` +
          `which your hand lacks ${id}.`];
      }
    }
  }
  return [];
}
