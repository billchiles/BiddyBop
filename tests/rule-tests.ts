/// Run saved practice deals through the production evaluator without changing bidding behavior.
/// Each stage tests the calls supported by specified rules and selected eliminations/orderings.
import { defaultBiddingSystem, type BidRule, type BiddingSystem, type Call, type SuitBid } from '../src/models/bidding-types';
import { compareSuitBids, getBidStage, getDirectInterference, isCallAvailableInAuction, parseSuitBid, responseJump } from '../src/models/auction';
import { evaluateRules, evaluateUserCall, getApplicableCandidateCalls, makeRuleEvalContext,
         type CandidateCallMatch } from '../src/models/biddingEvaluation';
import { makeRuleTestBoard } from '../src/models/cards';
import { RESPONDER_AFTER_SUIT_OVERCALL_TEST_DEALS, RULE_TEST_DEAL_BUCKETS,
         type RuleTestDeal, type RuleTestExpectedCall }
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

/// AuctionContext fields are explicit constraints: semantic opener fields can generalize an opening,
/// while auction remains literal and openerCalls can enumerate a small exact opening set.
function runAuctionContextTests (): number {
  const seedDeal = RULE_TEST_DEAL_BUCKETS[0]?.deals[0];
  if (seedDeal === undefined) {
    console.error('FAIL auction-context tests need at least one rule-test deal to build a board.');
    return 1;
  }
  const { board } = makeRuleTestBoard(seedDeal);
  const rules: BidRule[] = [
    {
      id: 'test-context-one-level-minor', kind: 'responseBid', title: 'test one-level minor context',
      auctionContext: { stage: 'responding', openerLevel: 1, openerStrain: 'minor' },
      calls: ['Pass'], certainty: 'high',
    },
    {
      id: 'test-context-one-level-major', kind: 'responseBid', title: 'test one-level major context',
      auctionContext: { stage: 'responding', openerLevel: 1, openerStrain: 'major' },
      calls: ['Pass'], certainty: 'high',
    },
    {
      id: 'test-context-weak-two-set', kind: 'responseBid', title: 'test weak-two opening set',
      auctionContext: { stage: 'responding', openerCalls: ['2D', '2H', '2S'] },
      calls: ['Pass'], certainty: 'high',
    },
    {
      id: 'test-context-strong-two-clubs', kind: 'responseBid', title: 'test strong 2C opening',
      auctionContext: { stage: 'responding', openerCalls: ['2C'] },
      calls: ['Pass'], certainty: 'high',
    },
    {
      id: 'test-context-literal-auction', kind: 'responseBid', title: 'test literal auction context',
      auctionContext: { stage: 'responding', auction: ['1C'], openerStrain: 'minor' },
      calls: ['Pass'], certainty: 'high',
    },
  ];
  const cases: { auction: Call[]; expected: string[]; rejected: string[] }[] = [
    { auction: ['1C', 'Pass'],
      expected: ['test-context-one-level-minor', 'test-context-literal-auction'],
      rejected: ['test-context-one-level-major', 'test-context-weak-two-set',
                 'test-context-strong-two-clubs'] },
    { auction: ['1D', 'Pass'], expected: ['test-context-one-level-minor'],
      rejected: ['test-context-literal-auction', 'test-context-one-level-major'] },
    { auction: ['1H', 'Pass'], expected: ['test-context-one-level-major'],
      rejected: ['test-context-one-level-minor'] },
    { auction: ['1S', 'Pass'], expected: ['test-context-one-level-major'],
      rejected: ['test-context-one-level-minor'] },
    { auction: ['2C', 'Pass'], expected: ['test-context-strong-two-clubs'],
      rejected: ['test-context-one-level-minor', 'test-context-one-level-major',
                 'test-context-weak-two-set', 'test-context-literal-auction'] },
    { auction: ['2D', 'Pass'], expected: ['test-context-weak-two-set'],
      rejected: ['test-context-strong-two-clubs', 'test-context-one-level-minor'] },
    { auction: ['2H', 'Pass'], expected: ['test-context-weak-two-set'],
      rejected: ['test-context-one-level-major'] },
    { auction: ['2S', 'Pass'], expected: ['test-context-weak-two-set'],
      rejected: ['test-context-one-level-major'] },
  ];
  let checkCount = 0;
  let failureCount = 0;
  for (const testCase of cases) {
    const context = makeRuleEvalContext(board, testCase.auction);
    const matched = new Set(evaluateRules(rules, context, defaultBiddingSystem)
      .map((result) => result.rule.id));
    for (const ruleId of testCase.expected) {
      checkCount += 1;
      if (! matched.has(ruleId)) {
        failureCount += 1;
        console.error(`FAIL auction context ${testCase.auction.join(' ')} should match ${ruleId}.`);
      }
    }
    for (const ruleId of testCase.rejected) {
      checkCount += 1;
      if (matched.has(ruleId)) {
        failureCount += 1;
        console.error(`FAIL auction context ${testCase.auction.join(' ')} should reject ${ruleId}.`);
      }
    }
  }
  console.log(`Auction context: ${checkCount} semantic/literal matching checks; ${failureCount} failures.`);
  return failureCount;
}

/// Competitive smoke checks cover the newly shared stage and call-availability boundaries.
/// The eight-point responder hand has a negative double and natural 1NT available when
/// a spade overcall removes its four-card heart response, but not a natural 2H.
function runCompetitionBoundaryTests (): number {
  const openingHand = { S: 'K72', H: 'A43', D: 'AQJ74', C: '83' };
  const responderHand = { S: 'Q53', H: 'KQJ87', D: '82', C: 'T94' };
  const { board } = makeRuleTestBoard({
    description: 'Responder with eight HCP and five hearts after 1D-1S.',
    practiceAuction: ['1D', '1S', 'Pass'],
    north: openingHand, south: responderHand,
  });
  let checks = 0;
  let failures = 0;
  const stages: { auction: Call[]; expected: ReturnType<typeof getBidStage> }[] = [
    { auction: ['1D'], expected: 'overcalling' },
    { auction: ['1D', 'Pass'], expected: 'responding' },
    { auction: ['1D', '1S'], expected: 'responding' },
    { auction: ['1D', '1S', 'Pass'], expected: 'advancing' },
    { auction: ['1D', '1S', '2D'], expected: 'advancing' },
    { auction: ['1D', 'Double'], expected: 'responding' },
    { auction: ['1D', 'Double', 'Pass'], expected: 'advancing' },
    { auction: ['1D', 'Double', '2D'], expected: 'advancing' },
    { auction: ['1D', 'Double', 'Pass', 'Pass'], expected: null },
    { auction: ['1D', 'Pass', '1H', 'Pass'], expected: 'openerRebid' },
  ];
  for (const testCase of stages) {
    checks += 1;
    if (getBidStage(board.dealer, testCase.auction) !== testCase.expected) {
      failures += 1;
      console.error(`FAIL competitive stage for ${testCase.auction.join(' ')}.`);
    }
  }
  checks += 1;
  if (isCallAvailableInAuction('1H', ['1D', '1S']) ||
      ! isCallAvailableInAuction('2H', ['1D', '1S'])) {
    failures += 1;
    console.error('FAIL contract call availability after 1D-1S.');
  }
  const result = evaluateUserCall('Pass', board, ['1D', '1S'], defaultBiddingSystem);
  const candidates = getApplicableCandidateCalls(result);
  checks += 1;
  if (candidates.some(({ call }) => call === '1H' || call === '2H') ||
      ! candidates.some(({ call, rule }) => call === 'Double' &&
        rule.id === 'respond-over-suit-negative-double') ||
      ! candidates.some(({ call, rule }) => call === '1NT' &&
        rule.id === 'respond-over-suit-natural-notrump')) {
    failures += 1;
    console.error('FAIL 8-HCP response after 1S: Double and stopped 1NT should survive.');
    console.error(`  Surviving: ${formatCandidates(candidates)}`);
  }
  // A balanced 18-HCP hand without a diamond stopper cannot overcall natural 1NT.
  const { board: noStopperBoard } = makeRuleTestBoard({
    description: '18 balanced HCP, but no diamond stopper for an overcall of 1D.',
    dealer: 'W', practiceAuction: ['1D', 'Double', 'Pass'],
    west: openingHand,
    north: { S: 'AQ9', H: 'KQ8', D: '965', C: 'AKT6' },
    south: { S: 'T864', H: 'JT7', D: 'K83', C: 'QJ9' },
  });
  const noStopperCandidates = getApplicableCandidateCalls(
    evaluateUserCall('1NT', noStopperBoard, ['1D'], defaultBiddingSystem));
  checks += 1;
  if (noStopperCandidates.some(({ call }) => call === '1NT')) {
    failures += 1;
    console.error('FAIL natural 1NT overcall should require an opening-suit stopper.');
  }
  // The same six-club, 10-HCP hand may not use the preemptive 2C rule after 1D:
  // 2C is the cheapest club overcall, not a jump.
  const { board: nonJumpBoard } = makeRuleTestBoard({
    description: 'Six good clubs, but 2C over 1D does not jump.',
    dealer: 'W', practiceAuction: ['1D', 'Pass', 'Pass'],
    west: openingHand,
    north: { S: 'A8', H: 'T72', D: '65', C: 'KQJ965' },
    south: { S: 'T964', H: 'KQ8', D: 'K83', C: 'A72' },
  });
  const nonJumpCandidates = getApplicableCandidateCalls(
    evaluateUserCall('2C', nonJumpBoard, ['1D'], defaultBiddingSystem));
  checks += 1;
  if (nonJumpCandidates.some(({ call, rule }) =>
      call === '2C' && rule.id === 'overcall-preemptive-jump-at-two-level')) {
    failures += 1;
    console.error('FAIL 2C over 1D is not a preemptive jump overcall.');
  }
  // Direct 1NT and jump overcalls still count as intervention when deriving responder's stage.
  checks += 1;
  if (getBidStage('W', ['1D', '1NT']) !== 'responding' ||
      getBidStage('W', ['1D', '3C']) !== 'responding') {
    failures += 1;
    console.error('FAIL responder stage after direct 1NT or jump overcall.');
  }
  // A non-jump 2C over 1D is distinct from a jump 2H over 1D.  A later responder
  // patch must not expose uncontested treatments after either intervention by accident.
  const interferenceCases: { auction: Call[]; expected: ReturnType<typeof getDirectInterference> }[] = [
    { auction: ['1D', 'Pass'], expected: 'none' },
    { auction: ['1C', '1D'], expected: 'suitOvercall' },
    { auction: ['1D', '2C'], expected: 'suitOvercall' },
    { auction: ['1H', '2D'], expected: 'suitOvercall' },
    { auction: ['1H', '2S'], expected: 'jumpSuitOvercall' },
    { auction: ['1C', '2H'], expected: 'jumpSuitOvercall' },
    { auction: ['1D', 'Double'], expected: 'takeoutDouble' },
    { auction: ['1D', '1NT'], expected: 'notrumpOvercall' },
  ];
  for (const testCase of interferenceCases) {
    checks += 1;
    if (getDirectInterference('N', testCase.auction) !== testCase.expected) {
      failures += 1;
      console.error(`FAIL intervention classification: ${testCase.auction.join(' ')}.`);
    }
  }
  // A strong raise cuebid is never simultaneously a natural jump shift, even under the
  // configurable classic-strong jump-shift treatment.
  const { board: cueBoard } = makeRuleTestBoard({
    description: 'Strong heart support after 1H-(1S): 2S is only an artificial cuebid.',
    practiceAuction: ['1H', '1S', '2S'],
    east: { S: 'AQJ86', H: '762', D: '8', C: 'K964' },
    north: { S: 'K72', H: 'AKT94', D: 'QJ3', C: '83' },
    south: { S: 'T93', H: 'QJ85', D: 'AT97', C: 'AQ' },
  });
  const cueCandidates = getApplicableCandidateCalls(
    evaluateUserCall('2S', cueBoard, ['1H', '1S'], defaultBiddingSystem));
  checks += 1;
  if (! cueCandidates.some(({call, rule}) => call === '2S' &&
      rule.id === 'respond-over-suit-support-cuebid') ||
      cueCandidates.some(({call, rule}) => call === '2S' &&
        rule.id !== 'respond-over-suit-support-cuebid')) {
    failures += 1;
    console.error('FAIL opponent-suit 2S must be a support cuebid, never a natural jump shift.');
  }
  // A stopper is mandatory for a natural responder NT bid, even with balanced 6-10 HCP.
  const { board: noResponseStopper } = makeRuleTestBoard({
    description: 'Balanced 6 HCP without stopper after 1D-(1S) may not bid 1NT.',
    practiceAuction: ['1D', '1S', 'Pass'],
    north: { S: '872', H: 'A43', D: 'AKJ74', C: 'Q3' },
    east: { S: 'AQJ96', H: '762', D: '8', C: 'K964' },
    south: { S: 'T54', H: 'QJ8', D: 'Q95', C: 'JT85' },
  });
  const ntCandidates = getApplicableCandidateCalls(
    evaluateUserCall('1NT', noResponseStopper, ['1D', '1S'], defaultBiddingSystem));
  checks += 1;
  if (ntCandidates.some(({ call }) => call === '1NT')) {
    failures += 1;
    console.error('FAIL competitive natural 1NT requires a stopper in spades.');
  }
  // A weak jump after a suit opening has a different response treatment; this first
  // patch deliberately leaves it unmodeled rather than importing uncontested rules.
  const { board: jumpedBoard } = makeRuleTestBoard({
    description: 'Responder after a preemptive 2S jump over 1H.',
    practiceAuction: ['1H', '2S', '3H'],
    north: { S: 'K72', H: 'AKT96', D: 'Q53', C: '54' },
    east: { S: 'AQJ965', H: '43', D: '84', C: 'T96' },
    south: { S: 'T843', H: 'J82', D: 'AK6', C: 'A72' },
  });
  const jumpedCandidates = getApplicableCandidateCalls(
    evaluateUserCall('3H', jumpedBoard, ['1H', '2S'], defaultBiddingSystem));
  checks += 1;
  if (jumpedCandidates.some(({ call }) => call === '3H')) {
    failures += 1;
    console.error('FAIL raised 3H after preemptive 2S is deferred, not ordinary limit raise.');
  }
  // Every recorded competitive response setup must itself be a legitimate opening and
  // natural overcall with the supplied physical hands, not merely an injected auction string.
  for (const deal of RESPONDER_AFTER_SUIT_OVERCALL_TEST_DEALS) {
    const { board: practiceBoard } = makeRuleTestBoard(deal);
    for (const index of [0, 1]) {
      const call = deal.practiceAuction[index];
      if (call === undefined) {
        failures += 1;
        console.error(`FAIL missing setup call: ${deal.description}`);
        continue;
      }
      checks += 1;
      const candidates = getApplicableCandidateCalls(
        evaluateUserCall(call, practiceBoard, deal.practiceAuction.slice(0, index),
                         defaultBiddingSystem));
      if (! candidates.some((candidate) => candidate.call === call)) {
        failures += 1;
        console.error(`FAIL physical setup call ${call}: ${deal.description}`);
      }
    }
  }
  console.log(`Competition boundaries: ${checks} checks; ${failures} failures.`);
  return failures;
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
    { name: 'overcall', auctionLength: 1, expected: deal.expectedOvercallCalls,
      rejected: deal.rejectedOvercallCalls, order: deal.expectedOvercallCallOrder },
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

const failureCount = runAuctionHelperTests() + runAuctionContextTests() +
  runCompetitionBoundaryTests() + runRuleTests();
if (failureCount !== 0) {
  throw new Error(`${failureCount} rule-test failure${failureCount === 1 ? '' : 's'}.`);
}
