/// Recompute bidding rule, practice corpus, and explanation-reach statistics.
/// This report is informational. It neither changes bidding behavior nor test results.
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { OpeningBidRules, ResponseBidRules, OvercallRules, AdvanceRules,
         OpenerRebidRules, ResponderRebidRules } from '../src/models/bidding-rules';
import type { BidRule, Call } from '../src/models/bidding-types';
import { defaultBiddingSystem } from '../src/models/bidding-types';
import { RULE_TEST_DEAL_BUCKETS, type RuleTestDeal } from '../src/models/test-deals-registry';
import { getBiddingTurnStatus, evaluateUserCall, getApplicableCandidateCalls }
  from '../src/models/biddingEvaluation';
import { getSeatForCallIndex } from '../src/models/auction';
import { makeRuleTestBoard, getHandFacts } from '../src/models/cards';
import { getBidExplanationLines } from '../src/models/explanations';

const groups: { name: string; rules: BidRule[] }[] = [
  { name: 'Opening', rules: OpeningBidRules },
  { name: 'Responding', rules: ResponseBidRules },
  { name: 'Overcalling / overcaller rebids', rules: OvercallRules },
  { name: 'Advancing', rules: AdvanceRules },
  { name: 'Opener rebids', rules: OpenerRebidRules },
  { name: 'Responder rebids', rules: ResponderRebidRules },
];
const executable = new Map<string, BidRule>();
const boundaries = new Map<string, BidRule>();
for (const group of groups) {
  for (const rule of group.rules) {
    if (rule.kind === 'scopeBoundary') boundaries.set(rule.id, rule);
    else executable.set(rule.id, rule);
  }
}

/// The eight primary test assertion positions, with the same auction prefixes
/// as runRuleTests in rule-tests.ts; an assertion is counted only if a stage has
/// at least one declared expectation/rejection/order check.
function assertionFields(deal: RuleTestDeal) {
  return [
    { length: 0, expected: deal.expectedOpeningCalls,
      rejected: deal.rejectedOpeningCalls, order: deal.expectedOpeningCallOrder },
    { length: 1, expected: deal.expectedOvercallCalls,
      rejected: deal.rejectedOvercallCalls, order: deal.expectedOvercallCallOrder },
    { length: 3, expected: deal.expectedBalancingCalls,
      rejected: deal.rejectedBalancingCalls, order: undefined },
    { length: 3, expected: deal.expectedAdvanceCalls,
      rejected: deal.rejectedAdvanceCalls, order: deal.expectedAdvanceCallOrder },
    { length: 5, expected: deal.expectedOvercallerRebidCalls,
      rejected: deal.rejectedOvercallerRebidCalls, order: deal.expectedOvercallerRebidCallOrder },
    { length: 2, expected: deal.expectedResponseCalls,
      rejected: deal.rejectedResponseCalls, order: deal.expectedResponseCallOrder },
    { length: 4, expected: deal.expectedOpenerRebidCalls,
      rejected: deal.rejectedOpenerRebidCalls, order: deal.expectedOpenerRebidCallOrder },
    { length: 6, expected: deal.expectedResponderRebidCalls,
      rejected: deal.rejectedResponderRebidCalls, order: undefined },
  ];
}

const recorded = new Set<string>();
const alternatives = new Set<string>();
const considered = new Set<string>();
const cited = new Set<string>();
const citedOther = new Set<string>();
let selections = 0;
let calls = 0;
let supported = 0;
let notes = 0;
let primaryPositive = 0;
let primaryEliminated = 0;
let primaryOrder = 0;
let primaryRecorded = 0;
const distinctDeals = new Set<RuleTestDeal>();

for (const bucket of RULE_TEST_DEAL_BUCKETS) {
  for (const deal of bucket.deals) {
    selections++;
    distinctDeals.add(deal);
    notes += deal.practiceGuidance?.length ?? 0;
    const { board } = makeRuleTestBoard(deal);
    const system = { ...defaultBiddingSystem, ...deal.requiredSystem };
    for (const assertion of assertionFields(deal)) {
      if ((assertion.expected?.length ?? 0) + (assertion.rejected?.length ?? 0) +
          (assertion.order?.length ?? 0) === 0) continue;
      if (assertion.length >= deal.practiceAuction.length) {
        throw new Error('Invalid practice assertion position: ' + deal.description);
      }
      primaryRecorded++;
      primaryPositive += assertion.expected?.reduce((sum, entry) => sum + entry.ruleIds.length, 0) ?? 0;
      primaryEliminated += assertion.rejected?.length ?? 0;
      primaryOrder += assertion.order?.length ?? 0;
    }
    for (let index = 0; index < deal.practiceAuction.length; index++) {
      calls++;
      const auction = deal.practiceAuction.slice(0, index);
      const call: Call = deal.practiceAuction[index]!;
      const status = getBiddingTurnStatus(board, auction, system);
      if (status.kind === 'supported') supported++;
      const result = status.kind === 'noModeledStage' ? null :
        evaluateUserCall(call, board, auction, system);
      if (result !== null) {
        for (const rule of result.userCallMatchingRules) recorded.add(rule.id);
        for (const candidate of getApplicableCandidateCalls(result)) {
          if (candidate.call !== call) alternatives.add(candidate.rule.id);
        }
        for (const item of result.ruleDiagnostics) considered.add(item.rule.id);
      }
      const seat = getSeatForCallIndex(board.dealer, index);
      const explanation = getBidExplanationLines({
        title: 'Recorded', call, status, result,
        handFacts: getHandFacts(board.deal[seat]), auctionLength: index,
        previewLines: [], seatLabel: seat, recordedUnjudged: false,
      });
      const ids = new Set(explanation.join(' ').match(/\[([a-z][a-z0-9/_-]+)\]/g)?.map(
        (value) => value.slice(1, -1)) ?? []);
      for (const id of ids) {
        if (! executable.has(id) && ! boundaries.has(id)) continue;
        cited.add(id);
        if (result === null || ! result.userCallMatchingRules.some((rule) => rule.id === id)) {
          citedOther.add(id);
        }
      }
    }
  }
}
const reached = new Set([...recorded, ...alternatives]);
const count = (ids: Set<string>, rules: BidRule[]) =>
  rules.filter((rule) => ids.has(rule.id)).length;
const uniqueCount = (ids: Set<string>, inMap: Map<string, BidRule>) =>
  [...ids].filter((id) => inMap.has(id)).length;
const number = (value: number) => value.toLocaleString('en-US');
const tableRow = (label: string, value: number) => `| ${label} | **${number(value)}** |`;
const byGroup = groups.map(({ name, rules }) => {
  const working = rules.filter((rule) => rule.kind !== 'scopeBoundary');
  return `| ${name} | ${working.length} | ${rules.length - working.length} | ` +
    `${count(recorded, working)} | ${count(reached, working)} | ` +
    `${working.filter((rule) => ! reached.has(rule.id)).length} | ` +
    `${count(considered, working)} |`;
});
const unseen = [...executable.keys()].filter((id) => ! reached.has(id));
const output = `# BiddyBop by the Numbers

Regenerate this statistical snapshot with \`npm run stats:bidding\`. The command
reads the current source declarations and practice corpus, writes this document,
and prints a short summary. It is not part of the normal build or test commands.

## Counting definitions

- **Rule declaration**: one entry in a rule collection. A distinct ID may appear in more than one collection.
- **Executable rule**: a rule that can qualify a call, excluding \`scopeBoundary\` declarations.
- **Practice selection**: one bucket entry; the same deal may appear in two buckets.
- **Matched recorded call**: rule that qualified the authored call at its exact auction position.
- **Qualifying alternative**: a different call that qualified at that recorded position.
- **Considered in diagnostics**: the evaluator assessed the rule as a candidate at a recorded position. The rule may have failed; being considered is **not** evidence that its bid qualified or that an explanation was displayed.
- **Cited in core feedback**: a bracketed rule ID emitted by the shared explanation assembler during replay. It does not include practice-specific interface notes and does not by itself prove the explanation was useful.

## Rule inventory

| Measurement | Count |
|---|---:|
${[
  tableRow('Executable rule declarations', groups.reduce((n, g) => n + g.rules.filter((r) => r.kind !== 'scopeBoundary').length, 0)),
  tableRow('Distinct executable rule IDs', executable.size),
  tableRow('Extra executable declarations from reused IDs', groups.reduce((n, g) => n + g.rules.filter((r) => r.kind !== 'scopeBoundary').length, 0) - executable.size),
  tableRow('Scope-boundary declarations', groups.reduce((n, g) => n + g.rules.filter((r) => r.kind === 'scopeBoundary').length, 0)),
  tableRow('Distinct scope-boundary IDs', boundaries.size),
  tableRow('Combined executable plus scope declarations', groups.reduce((n, g) => n + g.rules.length, 0)),
  tableRow('Distinct IDs including scope boundaries', new Set([...executable.keys(), ...boundaries.keys()]).size),
  tableRow('Distinct IDs with a nonempty meaning', new Set(groups.flatMap((g) => g.rules.filter((r) => r.meaning?.trim()).map((r) => r.id))).size),
  tableRow('Distinct IDs with nonempty guidance', new Set(groups.flatMap((g) => g.rules.filter((r) => r.guidance?.some((line) => line.trim())).map((r) => r.id))).size),
].join('\n')}

The difference between executable declarations and distinct executable IDs comes
from rules reused in more than one collection, principally responding and
advancing. Those declarations represent different stage placements of a shared
rule ID, not necessarily independent bidding treatments. The six collections
exclude non-executable \`BiddingNotes\`.

## Practice corpus and primary test assertions

| Measurement | Count |
|---|---:|
${[
  tableRow('Practice buckets', RULE_TEST_DEAL_BUCKETS.length),
  tableRow('Distinct practice-deal definitions', distinctDeals.size),
  tableRow('Practice selections', selections),
  tableRow('Recorded auction calls across practice selections', calls),
  tableRow('Calls at supported evaluator stages', supported),
  tableRow('Calls without a supported-stage classification', calls - supported),
  tableRow('Practice-guidance notes across selections', notes),
  tableRow('Primary positive call/rule assertions', primaryPositive),
  tableRow('Primary elimination assertions', primaryEliminated),
  tableRow('Primary call-order assertions', primaryOrder),
  tableRow('Primary recorded-call checks', primaryRecorded),
].join('\n')}

Primary assertion counts use the declared expected calls and rule IDs,
rejected calls, ordering pairs, and tested auction positions from the practice
corpus. These are not the same as replaying every auction call, which includes
opponent actions and deliberately unjudged turns. The full rule-test suite
also runs separate regression and agreement-compatibility checks.

## Rule reach during recorded-auction replay

| Distinct executable rule IDs | Count |
|---|---:|
${[
  tableRow('Qualified a recorded call', uniqueCount(recorded, executable)),
  tableRow('Qualified recorded call or a different alternative', uniqueCount(reached, executable)),
  tableRow('Considered in evaluator diagnostics', uniqueCount(considered, executable)),
  tableRow('Cited in generated core feedback', uniqueCount(cited, executable)),
  tableRow('Cited when not qualifying the entered call', uniqueCount(citedOther, executable)),
  tableRow('Not represented by a qualifying call or alternative', unseen.length),
].join('\n')}

Unrepresented executable IDs are distinct from the separate scope boundaries.
A rule considered in diagnostics may have failed an eligibility requirement;
a rule cited in feedback may only appear in an automatically generated list.
Neither statistic alone establishes the instructional quality of a rule.

### By rule collection

| Collection | Executable declarations | Scope boundaries | Matched recorded call | Matched recorded or alternative | Unreached | Considered in diagnostics |
|---|---:|---:|---:|---:|---:|---:|
${byGroup.join('\n')}

**Considered in diagnostics** means that during replay of a recorded decision,
the evaluator included the rule among those it examined. The rule could have
failed its strength, suit, shape, auction, or other requirements. The number
is **not** a count of qualified bids or explanations actually displayed.
**Column caution:** An ID may be declared in multiple collections (especially
responding and advancing). The reach columns therefore overlap; their totals
cannot be added to obtain the distinct-ID counts above.

### Interpretation of unreached executable IDs

The ${number(unseen.length)} distinct executable IDs not reached by a qualifying
call are **not** scope-boundary declarations. A source review on 5 November 2026
classified the 111 IDs as follows:

| Reviewed classification | Distinct IDs |
|---|---:|
| Specialized slam treatments that are not a practice priority | 9 |
| Unreached choices with an exercised sibling in the same bidding family | 53 |
| Other uncovered choices and continuations | 49 |
| **Total** | **111** |

These categories do not reduce the **measured** total of 111 unreached rules.
A sibling rule qualifying on a practice hand does not test the unreached
rule's own eligibility or explanation. The categories are human-reviewed
interpretations retained here as static text, not automatically inferred from
rule names. Revisit them if the corpus or rule set changes materially.

**Overcalling / overcaller rebids:** All 35 unreached IDs in this collection
belong to **overcaller rebids**, not initial direct overcalls. Of these,
25 have qualifying sibling treatments, two concern specialized slam choices,
and eight are other uncovered decisions. This is less concerning than the raw
35 suggests because many underlying bidding situations are exercised, but it
is not equivalent to testing all 35 rules. No extra practice deals are needed
merely to raise coverage counts.
`;
const destination = resolve('docs/by-the-numbers.md');
writeFileSync(destination, output, 'utf8');
console.log(`Updated ${destination}`);
console.log(`Rules: ${number(executable.size)} distinct executable IDs; ` +
  `${number(reached.size)} qualified as recorded calls or alternatives; ` +
  `${number(unseen.length)} not reached.`);
console.log(`Practice: ${number(selections)} selections, ${number(calls)} recorded calls; ` +
  `primary tests: ${number(primaryPositive)} positive, ${number(primaryEliminated)} eliminated, ` +
  `${number(primaryOrder)} ordered, ${number(primaryRecorded)} recorded-call checks.`);
