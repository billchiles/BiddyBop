/// Run saved practice deals through the production evaluator without changing bidding behavior.
/// Each stage tests the calls supported by specified rules and selected eliminations/orderings.
import { defaultBiddingSystem, type BiddingSystem, type Call, type SuitBid } from '../src/models/bidding-types';
import { compareSuitBids, parseSuitBid, responseJump } from '../src/models/auction';
import { evaluateUserCall, getApplicableCandidateCalls, type CandidateCallMatch }
  from '../src/models/biddingEvaluation';
import { makeRuleTestBoard } from '../src/models/cards';
import { RULE_TEST_DEAL_BUCKETS, type RuleTestDeal, type RuleTestExpectedCall }
  from '../src/models/rule-test-deals';

interface StageExpectations {
  name: string;
  auctionLength: number;
  expected: RuleTestExpectedCall[] | undefined;
  rejected: Call[] | undefined;
  order: [Call, Call][] | undefined;
}

type ConventionSetting = 'stayman' | 'jacobyTransfers' | 'texasTransfers';
type ConventionValues = Pick<BiddingSystem, ConventionSetting>;

/// Representative agreements for checking whether the UI can safely offer each practice deal.
/// These are compatibility checks, not an exhaustive test of every convention combination.
const CONVENTION_CONFIGURATIONS: { name: string; settings: ConventionValues }[] = [
  { name: 'modern with Texas', settings: { stayman: true, jacobyTransfers: true, texasTransfers: true } },
  { name: 'modern without Texas', settings: { stayman: true, jacobyTransfers: true, texasTransfers: false } },
  { name: 'Stayman only', settings: { stayman: true, jacobyTransfers: false, texasTransfers: false } },
  { name: 'basic natural', settings: { stayman: false, jacobyTransfers: false, texasTransfers: false } },
];
const CONVENTION_SETTINGS: ConventionSetting[] = ['stayman', 'jacobyTransfers', 'texasTransfers'];

/// responseJump keeps the exact jump size instead of collapsing it to a boolean.  Test zero
/// explicitly so later code does not accidentally depend on numeric truthiness.
function runAuctionHelperTests (): number {
  const cases: { opening: SuitBid; response: SuitBid; expected: number }[] = [
    { opening: '1H', response: '1S', expected: 0 },
    { opening: '1S', response: '2H', expected: 0 },
    { opening: '1S', response: '3H', expected: 1 },
    { opening: '1H', response: '3S', expected: 2 },
  ];
  let failureCount = 0;
  for (const testCase of cases) {
    const actual = responseJump(testCase.opening, testCase.response);
    if (actual !== testCase.expected) {
      failureCount += 1;
      console.error(`FAIL responseJump(${testCase.opening}, ${testCase.response}) = ${actual}; ` +
                    `expected ${testCase.expected}.`);
    }
  }
  const comparisonCases: { lower: SuitBid; higher: SuitBid }[] = [
    { lower: '4D', higher: '4H' },
    { lower: '3S', higher: '4C' },
  ];
  for (const testCase of comparisonCases) {
    const lowerBid = parseSuitBid(testCase.lower)!;
    const higherBid = parseSuitBid(testCase.higher)!;
    if (compareSuitBids(lowerBid, higherBid) >= 0 || compareSuitBids(higherBid, lowerBid) <= 0 ||
        compareSuitBids(lowerBid, lowerBid) !== 0) {
      failureCount += 1;
      console.error(`FAIL compareSuitBids ordering for ${testCase.lower} and ${testCase.higher}.`);
    }
  }
  console.log(`Auction helpers: ${cases.length} responseJump checks and ${comparisonCases.length} ` +
              `bid-order comparisons; ${failureCount} failures.`);
  return failureCount;
}

/// Run all deals, including those requiring non-default partnership agreements.
/// Continue after individual failures so one run reports all recoverable regressions.
function runRuleTests (): number {
  let dealCount = 0;
  let positiveCount = 0;
  let eliminationCount = 0;
  let callOrderCount = 0;
  let recordedCallCount = 0;
  let failureCount = 0;
  for (const bucket of RULE_TEST_DEAL_BUCKETS) {
    for (const [index, deal] of bucket.deals.entries()) {
      dealCount += 1;
      let dealAssertionCount = 0;
      const failuresBeforeDeal = failureCount;
      const label = `${bucket.id} #${index + 1}: ${deal.description}`;
      const system: BiddingSystem = { ...defaultBiddingSystem, ...deal.requiredSystem };
      try {
        const { board } = makeRuleTestBoard(deal);
        const stages = getTestedStages(deal);
        for (const stage of stages) {
          // An undeclared stage is normal: a response-only deal has no opener-rebid expectations.
          if (stage.expected === undefined && stage.rejected === undefined &&
              stage.order === undefined) {
            continue;
          }
          // Explicitly empty fields indicate incomplete test data, not an intentional omission.
          for (const [name, assertions] of [
            ['expected', stage.expected], ['rejected', stage.rejected], ['order', stage.order],
          ] as const) {
            if (assertions !== undefined && assertions.length === 0) {
              failureCount += 1;
              console.error(`FAIL malformed ${stage.name}: ${name} is explicitly empty\n${label}`);
            }
          }
          if ((stage.expected?.length ?? 0) + (stage.rejected?.length ?? 0) +
              (stage.order?.length ?? 0) === 0) {
            continue;
          }
          if (deal.practiceAuction.length <= stage.auctionLength) {
            failureCount += 1;
            console.error(`FAIL no recorded ${stage.name} call in practiceAuction\n${label}`);
            continue;
          }
          const auction = deal.practiceAuction.slice(0, stage.auctionLength);
          const inputCall = deal.practiceAuction[stage.auctionLength]!;
          const context = `${label}\n  ${stage.name}: ${auction.join(' ') || '(opening)'} -> ` +
                          `${inputCall}; system=${JSON.stringify(system)}`;
          try {
            const result = evaluateUserCall(inputCall, board, auction, system);
            const candidates = getApplicableCandidateCalls(result);
            // Practice calls must themselves qualify, even when other alternatives are expected.
            recordedCallCount += 1;
            if (! candidates.some((candidate) => candidate.call === inputCall)) {
              failureCount += 1;
              console.error(`FAIL recorded practice call ${inputCall} does not qualify\n${context}`);
              console.error(`  Surviving: ${formatCandidates(candidates)}`);
            }
            for (const expected of stage.expected ?? []) {
              if (! Array.isArray(expected.ruleIds) || expected.ruleIds.length === 0) {
                failureCount += 1;
                console.error(`FAIL malformed ${stage.name}: ${expected.call} has no rule IDs\n${context}`);
                continue;
              }
              for (const ruleId of expected.ruleIds) {
                positiveCount += 1;
                dealAssertionCount += 1;
                if (! candidates.some((c) => c.call === expected.call && c.rule.id === ruleId)) {
                  failureCount += 1;
                  console.error(`FAIL expected ${expected.call} under ${ruleId}\n${context}`);
                  console.error(`  Surviving: ${formatCandidates(candidates)}`);
                }
              }
            }
            for (const call of stage.rejected ?? []) {
              eliminationCount += 1;
              dealAssertionCount += 1;
              if (candidates.some((candidate) => candidate.call === call)) {
                failureCount += 1;
                console.error(`FAIL rejected ${call} survived\n${context}`);
                console.error(`  Surviving: ${formatCandidates(candidates)}`);
              }
            }
            for (const [before, after] of stage.order ?? []) {
              callOrderCount += 1;
              dealAssertionCount += 1;
              const beforeIndex = candidates.findIndex((candidate) => candidate.call === before);
              const afterIndex = candidates.findIndex((candidate) => candidate.call === after);
              if (beforeIndex < 0 || afterIndex < 0 || beforeIndex >= afterIndex) {
                failureCount += 1;
                console.error(`FAIL call order: expected ${before} before ${after}\n${context}`);
                console.error(`  Surviving in order: ${formatCandidates(candidates)}`);
              }
            }
          } catch (error) {
            failureCount += 1;
            console.error(`FAIL could not evaluate ${stage.name}\n${context}\n  ${String(error)}`);
          }
        }
        if (dealAssertionCount === 0 && failureCount === failuresBeforeDeal) {
          failureCount += 1;
          console.error(`FAIL deal has no executable expectations\n${label}`);
        }
      } catch (error) {
        failureCount += 1;
        console.error(`FAIL could not construct ${label}: ${String(error)}`);
      }
    }
  }
  console.log(`Primary: ${dealCount} deals; ${positiveCount} positive, ${eliminationCount} elimination, ` +
              `${callOrderCount} call-order, ${recordedCallCount} recorded-call checks; ` +
              `${failureCount} failures.`);
  // Independently verify that practice calls also work in representative dropdown configurations.
  const compatibilityFailures = runConventionCompatibilityChecks();
  return failureCount + compatibilityFailures === 0 ? 0 : 1;
}

/// Meta-test for requiredSystem: a deal offered by the dropdown must have a valid recorded call.
/// We re-evaluate recorded calls, not alternative/rejected/order assertions, which can vary by agreement.
function runConventionCompatibilityChecks (): number {
  let compatibleDeals = 0;
  let recordedCalls = 0;
  let failureCount = 0;
  for (const bucket of RULE_TEST_DEAL_BUCKETS) {
    for (const [index, deal] of bucket.deals.entries()) {
      const label = `${bucket.id} #${index + 1}: ${deal.description}`;
      try {
        const { board } = makeRuleTestBoard(deal);
        const stages = getTestedStages(deal);
        for (const configuration of CONVENTION_CONFIGURATIONS) {
          // Only test configurations in which this deal's requiredSystem permits it to appear.
          if (! matchesRequiredConventions(deal.requiredSystem, configuration.settings)) {
            continue;
          }
          compatibleDeals += 1;
          const system: BiddingSystem = {
            ...defaultBiddingSystem, ...deal.requiredSystem, ...configuration.settings,
          };
          for (const stage of stages) {
            if (stage.expected === undefined && stage.rejected === undefined &&
                stage.order === undefined) {
              continue;
            }
            if (deal.practiceAuction.length <= stage.auctionLength) {
              failureCount += 1;
              console.error(`FAIL compatibility: missing recorded ${stage.name} call\n${label}` +
                            `\n  configuration=${configuration.name}; system=${JSON.stringify(system)}`);
              continue;
            }
            const auction = deal.practiceAuction.slice(0, stage.auctionLength);
            const recordedCall = deal.practiceAuction[stage.auctionLength]!;
            const context = `${label}\n  ${stage.name}: ${auction.join(' ') || '(opening)'} -> ` +
                            `${recordedCall}; configuration=${configuration.name}; ` +
                            `system=${JSON.stringify(system)}`;
            try {
              const result = evaluateUserCall(recordedCall, board, auction, system);
              const candidates = getApplicableCandidateCalls(result);
              recordedCalls += 1;
              if (! candidates.some((candidate) => candidate.call === recordedCall)) {
                failureCount += 1;
                console.error(`FAIL compatibility: recorded ${recordedCall} does not qualify\n${context}`);
                console.error(`  Surviving: ${formatCandidates(candidates)}`);
              }
            } catch (error) {
              failureCount += 1;
              console.error(`FAIL compatibility: could not evaluate ${stage.name}\n${context}` +
                            `\n  ${String(error)}`);
            }
          }
        }
      } catch (error) {
        failureCount += 1;
        console.error(`FAIL compatibility: could not construct ${label}: ${String(error)}`);
      }
    }
  }
  console.log('Compatibility meta-check for the four Stayman/Jacoby/Texas setting combinations: ' +
              `${compatibleDeals} eligible deal/configuration runs, ` +
              `${recordedCalls} recorded practice-call checks; ${failureCount} failures.`);
  return failureCount;
}

function getTestedStages (deal: RuleTestDeal): StageExpectations[] {
  return [
    { name: 'opening', auctionLength: 0, expected: deal.expectedOpeningCalls,
      rejected: deal.rejectedOpeningCalls, order: deal.expectedOpeningCallOrder },
    { name: 'response', auctionLength: 2, expected: deal.expectedResponseCalls,
      rejected: deal.rejectedResponseCalls, order: deal.expectedResponseCallOrder },
    { name: 'opener rebid', auctionLength: 4, expected: deal.expectedOpenerRebidCalls,
      rejected: deal.rejectedOpenerRebidCalls, order: deal.expectedOpenerRebidCallOrder },
  ];
}

function matchesRequiredConventions (required: Partial<BiddingSystem> | undefined,
                                     settings: ConventionValues): boolean {
  return required === undefined || CONVENTION_SETTINGS.every((setting) =>
    required[setting] === undefined || required[setting] === settings[setting]);
}

function formatCandidates (candidates: CandidateCallMatch[]): string {
  return candidates.map((candidate) => `${candidate.call} [${candidate.rule.id}, ` +
    `rank ${candidate.rule.priority?.rank ?? 0}]`).join('; ') || '(none)';
}

const failureCount = runAuctionHelperTests() + runRuleTests();
if (failureCount !== 0) {
  throw new Error(`${failureCount} rule-test failure${failureCount === 1 ? '' : 's'}.`);
}
