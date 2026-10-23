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
