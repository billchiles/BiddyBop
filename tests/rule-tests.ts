/// Run saved practice deals through the production evaluator without changing bidding behavior.
/// Each stage tests the calls supported by specified rules and selected eliminations/orderings.
import { defaultBiddingSystem, type BidRule, type BiddingSystem, type Call, type SuitBid } from '../src/models/bidding-types';
import { compareSuitBids, getBidStage, getInterferenceAfterOpening, isCallAvailableInAuction, parseSuitBid, responseJump } from '../src/models/auction';
import { evaluateRules, evaluateUserCall, getApplicableCandidateCalls, makeRuleEvalContext,
         type CandidateCallMatch } from '../src/models/biddingEvaluation';
import { makeRuleTestBoard } from '../src/models/cards';
import { ADVANCER_AFTER_ONE_LEVEL_SUIT_OVERCALL_TEST_DEALS,
         ADVANCER_AFTER_TWO_LEVEL_SUIT_OVERCALL_TEST_DEALS,
         ADVANCER_AFTER_TAKEOUT_DOUBLE_TEST_DEALS,
         ADVANCER_AFTER_NATURAL_1NT_OVERCALL_TEST_DEALS,
         ADVANCER_AFTER_RESPONDER_RAISE_OVERCALL_TEST_DEALS,
         ADVANCER_AFTER_RESPONDER_RAISE_TAKEOUT_DOUBLE_TEST_DEALS,
         ADVANCER_AFTER_RESPONDER_NATURAL_ACTION_OVERCALL_TEST_DEALS,
         ADVANCER_AFTER_RESPONDER_NATURAL_ACTION_TAKEOUT_DOUBLE_TEST_DEALS,
         ADVANCER_AFTER_JUMP_OVERCALL_TEST_DEALS,
         RESPONDER_AFTER_SUIT_OVERCALL_TEST_DEALS, RESPONDER_AFTER_TAKEOUT_DOUBLE_TEST_DEALS,
         RESPONDER_AFTER_JUMP_OVERCALL_TEST_DEALS,
         RULE_TEST_DEAL_BUCKETS,
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
  console.log('  Verifies jump sizes (including zero) and correct suit-bid ordering.');
  console.log('  These are fundamental calculations used throughout the bidding rules.');
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
  console.log('  Verifies that mock rules match the correct opening level, suit, and auction');
  console.log('  sequence, without accidentally matching unrelated auctions.');
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
    { auction: ['1D', 'Double', 'Redouble', 'Pass'], expected: null },
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
  const interferenceCases: { auction: Call[]; expected: ReturnType<typeof getInterferenceAfterOpening> }[] = [
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
    if (getInterferenceAfterOpening('N', testCase.auction) !== testCase.expected) {
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
  // A three-level economical raise after a preemptive overcall requires 8-10 support points.
  // The old 11-12-point uncontested limit-raise meaning must not leak into this auction.
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
    console.error('FAIL three-level raise after a 2S jump must not be the old limit raise.');
  }
  // A four-level jump removes the newly modeled responder options and must not inherit the
  // shared weak major game-raise rule merely because four of the major is still legal.
  const { board: fourLevelJumpBoard } = makeRuleTestBoard({
    description: 'A four-level preempt blocks the shared weak game raise.',
    practiceAuction: ['1S', '4H', 'Pass'],
    north: { S: 'AKJ74', H: '82', D: 'AQ3', C: '965' },
    east: { S: '83', H: 'KQJT9765', D: '87', C: 'T' },
    south: { S: 'QT965', H: 'A3', D: 'T964', C: 'J2' },
  });
  const fourLevelCandidates = getApplicableCandidateCalls(
    evaluateUserCall('4S', fourLevelJumpBoard, ['1S', '4H'], defaultBiddingSystem));
  checks += 1;
  if (fourLevelCandidates.some(({ call }) => call === '4S')) {
    failures += 1;
    console.error('FAIL four-level jump-overcall response must not inherit a weak 4S raise.');
  }
  const redoubleCases: { auction: Call[]; expected: boolean }[] = [
    { auction: ['1H', 'Double'], expected: true },
    { auction: ['1H', 'Double', 'Pass'], expected: false },
    { auction: ['1H', 'Double', 'Pass', 'Pass'], expected: true },
    { auction: ['1H', 'Double', '1S'], expected: false },
    { auction: ['1H', 'Pass'], expected: false },
  ];
  for (const testCase of redoubleCases) {
    checks += 1;
    if (isCallAvailableInAuction('Redouble', testCase.auction) !== testCase.expected) {
      failures += 1;
      console.error(`FAIL Redouble availability after ${testCase.auction.join(' ')}.`);
    }
  }
  // Recorded competitive setups must themselves be plausible with the supplied hands;
  // neither the opening nor the opponent's overcall/takeout double is an arbitrary script.
  for (const deal of [...ADVANCER_AFTER_TWO_LEVEL_SUIT_OVERCALL_TEST_DEALS,
                      ...ADVANCER_AFTER_TAKEOUT_DOUBLE_TEST_DEALS,
                      ...RESPONDER_AFTER_SUIT_OVERCALL_TEST_DEALS,
                      ...RESPONDER_AFTER_TAKEOUT_DOUBLE_TEST_DEALS,
                      ...RESPONDER_AFTER_JUMP_OVERCALL_TEST_DEALS]) {
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
  console.log('  Checks bidding stages, legal calls, interference classifications, and');
  console.log('  eligibility of competitive bids, including calls pre-set in test deals.');
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
  console.log('  Runs practice deals through the production bidding evaluator, checking');
  console.log('  expected rules and calls, rejected alternatives, ranking, and auction calls.');
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
  console.log('  Replays eligible practice auctions under four representative convention');
  console.log('  configurations to ensure their recorded calls remain valid.');
  console.log();
  return failureCount;
}

/// This first advancer family must not leak into interfering or higher-level auctions.
/// The stopper boundary tests the hand rather than merely omitting an NT expectation.
function runAdvancingBoundaryTests (): number {
  const deal = ADVANCER_AFTER_ONE_LEVEL_SUIT_OVERCALL_TEST_DEALS[4];
  if (deal === undefined) {
    console.error('FAIL advancing boundaries require the 1NT advance fixture.');
    return 1;
  }
  const { board } = makeRuleTestBoard(deal);
  const excluded: Call[][] = [
    ['1D', '1S', '2S'], // An artificial responder cuebid is not a natural advance context.
    ['1D', '1S', 'Double'],
    ['1D', '2H', 'Pass'], // A preemptive jump overcall.
  ];
  let checks = 0;
  let failures = 0;
  for (const auction of excluded) {
    checks += 1;
    const candidates = getApplicableCandidateCalls(
      evaluateUserCall('Pass', board, auction, defaultBiddingSystem));
    if (candidates.length !== 0) {
      failures += 1;
      console.error(`FAIL advancing rules leaked into ${auction.join(' ')}: ` +
                    formatCandidates(candidates));
    }
  }
  // The two-level family must also stay inactive when East acts, or North jumps.
  for (const auction of [
    ['1D', '2C', '2D'], ['1D', '2C', 'Double'], ['1D', '3C', 'Pass'],
  ] as Call[][]) {
    checks += 1;
    const candidates = getApplicableCandidateCalls(
      evaluateUserCall('Pass', board, auction, defaultBiddingSystem));
    if (candidates.length !== 0) {
      failures += 1;
      console.error(`FAIL two-level advancing rules leaked into ${auction.join(' ')}: ` +
                    formatCandidates(candidates));
    }
  }
  const twoLevelNtDeal = ADVANCER_AFTER_TWO_LEVEL_SUIT_OVERCALL_TEST_DEALS[2];
  if (twoLevelNtDeal === undefined) {
    failures += 1;
    console.error('FAIL advancing boundaries require the two-level 2NT fixture.');
  } else {
    const { board: noTwoLevelStopperBoard } = makeRuleTestBoard({
      ...twoLevelNtDeal,
      south: { S: 'JT98', H: 'KQJ', D: 'T983', C: 'A4' }, // 11 HCP; no diamond stopper.
    });
    checks += 1;
    const ntCandidates = getApplicableCandidateCalls(evaluateUserCall(
      '2NT', noTwoLevelStopperBoard, ['1D', '2C', 'Pass'], defaultBiddingSystem));
    if (ntCandidates.some(({ call }) => call === '2NT')) {
      failures += 1;
      console.error('FAIL advancing 2NT requires a stopper in opener’s suit.');
    }
  }
  const threeLevelDeal = ADVANCER_AFTER_TWO_LEVEL_SUIT_OVERCALL_TEST_DEALS[7];
  if (threeLevelDeal === undefined) {
    failures += 1;
    console.error('FAIL advancing boundaries require the 3D fixture.');
  } else {
    const { board: insufficientHcpBoard } = makeRuleTestBoard({
      ...threeLevelDeal,
      south: { S: 'T9', H: 'T7', D: 'AJT54', C: 'KQJ9' }, // 11 HCP, despite good diamonds.
    });
    checks += 1;
    const newSuitCandidates = getApplicableCandidateCalls(evaluateUserCall(
      '3D', insufficientHcpBoard, ['1S', '2H', 'Pass'], defaultBiddingSystem));
    if (newSuitCandidates.some(({ call }) => call === '3D')) {
      failures += 1;
      console.error('FAIL three-level new-suit advance requires at least 12 HCP.');
    }
  }
  // Holding 12 HCP is not sufficient if an economical three-level new suit lacks quality.
  const { board: weakSuitBoard } = makeRuleTestBoard({
    description: '3D suit-quality rejection after a genuine 2H overcall.',
    dealer: 'W', practiceAuction: ['1S', '2H', 'Pass', '3D'],
    west: { S: 'KQJ74', H: 'K82', D: 'A93', C: '65' },
    north: { S: '3', H: 'AQJT96', D: 'K86', C: 'Q72' },
    south: { S: 'AT', H: '75', D: 'T7542', C: 'AKJ9' },
  });
  checks += 1;
  const weakSuitCandidates = getApplicableCandidateCalls(evaluateUserCall(
    '3D', weakSuitBoard, ['1S', '2H', 'Pass'], defaultBiddingSystem));
  if (weakSuitCandidates.some(({ call }) => call === '3D')) {
    failures += 1;
    console.error('FAIL three-level new-suit advance requires concentrated suit honors.');
  }
  const { board: noStopperBoard } = makeRuleTestBoard({
    ...deal,
    south: { ...deal.south, D: 'T953' }, // Swap K for T: 8 HCP and no diamond stopper.
  });
  checks += 1;
  const candidates = getApplicableCandidateCalls(evaluateUserCall(
    '1NT', noStopperBoard, ['1D', '1S', 'Pass'], defaultBiddingSystem));
  if (candidates.some((candidate) => candidate.call === '1NT')) {
    failures += 1;
    console.error('FAIL advancing 1NT requires a stopper in opener’s suit.');
  }
  console.log(`Advancing boundaries: ${checks} checks; ${failures} failures.`);
  console.log('  Prevents ordinary suit-overcall advances from appearing in unsupported');
  console.log('  auctions; checks stoppers, suit quality, and strength requirements.');
  return failures;
}

/// Guard takeout-double advances against unsupported auctions and check suit-length
/// fallback behavior independently from the representative practice deals.
function runTakeoutAdvanceBoundaryTests (): number {
  const zeroDeal = ADVANCER_AFTER_TAKEOUT_DOUBLE_TEST_DEALS[1];
  const jumpDeal = ADVANCER_AFTER_TAKEOUT_DOUBLE_TEST_DEALS[3];
  const notrumpDeal = ADVANCER_AFTER_TAKEOUT_DOUBLE_TEST_DEALS[6];
  if (zeroDeal === undefined || jumpDeal === undefined || notrumpDeal === undefined) {
    console.error('FAIL takeout-double boundaries require saved advancing fixtures.');
    return 1;
  }
  const { board } = makeRuleTestBoard(zeroDeal);
  let checks = 0;
  let failures = 0;
  for (const auction of [
    ['1NT', 'Double', 'Pass'], // No agreed takeout-double meaning over natural 1NT.
    ['2D', 'Double', 'Pass'], // Weak-two defenses are a separate future family.
    ['1D', '1S', 'Pass'], // A suit overcall is not a takeout double.
    ['1D', 'Pass', 'Pass'],
  ] as Call[][]) {
    checks += 1;
    const candidates = getApplicableCandidateCalls(evaluateUserCall(
      'Pass', board, auction, defaultBiddingSystem));
    if (candidates.some(({ rule }) => rule.id.startsWith('advance-takeout-double-'))) {
      failures += 1;
      console.error(`FAIL takeout advances leaked into ${auction.join(' ')}.`);
    }
  }
  // Zero HCP and no four-card unbid suit must allow a three-card suit.
  checks += 1;
  const rescue = getApplicableCandidateCalls(evaluateUserCall(
    '1H', board, ['1D', 'Double', 'Pass'], defaultBiddingSystem));
  if (! rescue.some(({ call, rule }) => call === '1H' &&
      rule.id === 'advance-takeout-double-minimum-suit')) {
    failures += 1;
    console.error('FAIL takeout double needs a weak three-card suit escape.');
  }
  // In contrast, a three-card unbid suit is not offered if a four-card option exists.
  const { board: fourCardBoard } = makeRuleTestBoard({
    ...jumpDeal,
    south: { S: 'QJ5', H: '762', D: 'T95', C: 'JT42' }, // 4 points and four clubs.
  });
  checks += 1;
  const fourCardChoices = getApplicableCandidateCalls(evaluateUserCall(
    '1H', fourCardBoard, ['1D', 'Double', 'Pass'], defaultBiddingSystem));
  if (fourCardChoices.some(({ call, rule }) => call === '1H' &&
      rule.id === 'advance-takeout-double-minimum-suit')) {
    failures += 1;
    console.error('FAIL three-card fallback activated when another unbid suit has four cards.');
  }
  const { board: notrumpBoard } = makeRuleTestBoard({
    ...notrumpDeal,
    south: { S: 'QJ5', H: 'T762', D: '83', C: 'AJ42' }, // 8 HCP, balanced, no D stopper.
  });
  checks += 1;
  const ntCandidates = getApplicableCandidateCalls(evaluateUserCall(
    '1NT', notrumpBoard, ['1D', 'Double', 'Pass'], defaultBiddingSystem));
  if (ntCandidates.some(({ call }) => call === '1NT')) {
    failures += 1;
    console.error('FAIL takeout double 1NT needs a stopper.');
  }
  console.log(`Takeout advancing boundaries: ${checks} checks; ${failures} failures.`);
  console.log('  Checks takeout-double auction eligibility, the exceptional three-card');
  console.log('  suit response, and stopper requirements for notrump advances.');
  return failures;
}

/// Check that shared 1NT declarations respect actual bidding roles and both range settings.
function runSharedOneNtAdvanceBoundaryTests (): number {
  const seed = ADVANCER_AFTER_NATURAL_1NT_OVERCALL_TEST_DEALS[1];
  if (seed === undefined) {
    console.error('FAIL natural 1NT advancing boundaries need a practice deal.');
    return 1;
  }
  const { board } = makeRuleTestBoard(seed);
  let checks = 0;
  let failures = 0;
  const cases: { auction: Call[]; shouldMatch: boolean }[] = [
    { auction: ['1D', '1NT', 'Pass'], shouldMatch: true },
    { auction: ['1D', '1NT', '2D'], shouldMatch: false },
    { auction: ['1NT', 'Double', 'Pass'], shouldMatch: false },
    { auction: ['2D', '2NT', 'Pass'], shouldMatch: false },
    { auction: ['1D', 'Double', 'Pass'], shouldMatch: false },
    { auction: ['1D', '1S', 'Pass'], shouldMatch: false },
    { auction: ['1D', 'Pass'], shouldMatch: false },
    { auction: ['Pass', '1D', '1NT', 'Pass'], shouldMatch: true },
  ];
  for (const testCase of cases) {
    checks += 1;
    const results = evaluateUserCall('2NT', board, testCase.auction, defaultBiddingSystem);
    const contextMatches = results.ruleResults.some(({ rule }) =>
      rule.id === 'respond-to-1nt-w/-2nt-8-9-invitational');
    if (contextMatches !== testCase.shouldMatch) {
      failures += 1;
      console.error(`FAIL shared 1NT context for ${testCase.auction.join(' ')}.`);
    }
  }
  // The same rule IDs and setting-dependent HCP ranges apply after an opening and an overcall.
  const sevenPointDeal = ADVANCER_AFTER_NATURAL_1NT_OVERCALL_TEST_DEALS[8];
  if (sevenPointDeal === undefined) {
    return failures + 1;
  }
  const { board: sevenPointBoard } = makeRuleTestBoard(sevenPointDeal);
  for (const range of ['15-17', '16-18'] as const) {
    const system = { ...defaultBiddingSystem, oneNtOpening: range };
    checks += 1;
    const bids = getApplicableCandidateCalls(evaluateUserCall(
      '2NT', sevenPointBoard, ['1D', '1NT', 'Pass'], system));
    const invites = bids.some(({ call, rule }) =>
      call === '2NT' && rule.id === 'respond-to-1nt-w/-2nt-8-9-invitational');
    if (invites !== (range === '16-18')) {
      failures += 1;
      console.error(`FAIL 1NT advance invitation under ${range} agreement.`);
    }
  }
  console.log(`Shared 1NT advancing boundaries: ${checks} checks; ${failures} failures.`);
  console.log('  Verifies that shared 1NT rules work after openings and overcalls,');
  console.log('  respect partnership range settings, and exclude unrelated auctions.');
  return failures;
}

/// Responder-raise advances apply only to a simple raise of opener's suit.  These checks
/// also keep responsive Double behind an obvious fit or a five-card natural suit.
function runResponderRaiseAdvanceBoundaryTests (): number {
  const overcallDoubleDeal = ADVANCER_AFTER_RESPONDER_RAISE_OVERCALL_TEST_DEALS[6];
  const takeoutDoubleDeal = ADVANCER_AFTER_RESPONDER_RAISE_TAKEOUT_DOUBLE_TEST_DEALS[3];
  if (overcallDoubleDeal === undefined || takeoutDoubleDeal === undefined) {
    console.error('FAIL responder-raise advancing boundaries need responsive-double fixtures.');
    return 1;
  }
  const { board: overcallBoard } = makeRuleTestBoard(overcallDoubleDeal);
  const { board: takeoutBoard } = makeRuleTestBoard(takeoutDoubleDeal);
  let checks = 0;
  let failures = 0;

  for (const auction of [
    ['1D', '1S', 'Pass'],
    ['1D', '1S', '1NT'],
    ['1D', '1S', '2C'],
    ['1D', '1S', '3D'],
    ['1D', '2H', '2D'],
  ] as Call[][]) {
    checks += 1;
    const candidates = getApplicableCandidateCalls(evaluateUserCall(
      'Double', overcallBoard, auction, defaultBiddingSystem));
    if (candidates.some(({ rule }) =>
      rule.id.startsWith('advance-one-level-suit-overcall-after-responder-raise-'))) {
      failures += 1;
      console.error(`FAIL overcall responder-raise rules leaked into ${auction.join(' ')}.`);
    }
  }

  for (const auction of [
    ['1H', 'Double', 'Pass'],
    ['1H', 'Double', '1NT'],
    ['1H', 'Double', '2C'],
    ['1H', 'Double', '3H'],
  ] as Call[][]) {
    checks += 1;
    const candidates = getApplicableCandidateCalls(evaluateUserCall(
      'Double', takeoutBoard, auction, defaultBiddingSystem));
    if (candidates.some(({ rule }) =>
      rule.id.startsWith('advance-takeout-double-after-responder-raise-'))) {
      failures += 1;
      console.error(`FAIL takeout responder-raise rules leaked into ${auction.join(' ')}.`);
    }
  }

  const fitBoard = makeRuleTestBoard({
    description: 'Responsive Double is suppressed by three-card support.',
    dealer: 'W', practiceAuction: ['1D', '1S', '2D', 'Double'],
    north: overcallDoubleDeal.north,
    south: { S: 'T95', H: 'KQJT', D: 'KT9', C: 'JT7' },
  }).board;
  checks += 1;
  const fitCandidates = getApplicableCandidateCalls(evaluateUserCall(
    'Double', fitBoard, ['1D', '1S', '2D'], defaultBiddingSystem));
  if (fitCandidates.some(({ rule }) =>
    rule.id === 'advance-one-level-suit-overcall-after-responder-raise-responsive-double')) {
    failures += 1;
    console.error('FAIL responsive Double survived with three-card support for partner.');
  }

  const longSuitBoard = makeRuleTestBoard({
    description: 'Responsive Double is suppressed by a five-card natural suit.',
    dealer: 'W', practiceAuction: ['1H', 'Double', '2H', 'Double'],
    north: takeoutDoubleDeal.north,
    south: { S: 'QJT65', H: 'QJ', D: 'AT9', C: 'T83' },
  }).board;
  checks += 1;
  const longSuitCandidates = getApplicableCandidateCalls(evaluateUserCall(
    'Double', longSuitBoard, ['1H', 'Double', '2H'], defaultBiddingSystem));
  if (longSuitCandidates.some(({ rule }) =>
    rule.id === 'advance-takeout-double-after-responder-raise-responsive-double')) {
    failures += 1;
    console.error('FAIL responsive Double survived with a clear five-card natural suit.');
  }

  const strongBoard = makeRuleTestBoard({
    description: 'Responsive Double gives way to the strong-hand cuebid.',
    dealer: 'W', practiceAuction: ['1H', 'Double', '2H', 'Double'],
    north: takeoutDoubleDeal.north,
    south: { S: 'QJT6', H: 'QJ', D: 'AT9', C: 'QT83' },
  }).board;
  checks += 1;
  const strongCandidates = getApplicableCandidateCalls(evaluateUserCall(
    'Double', strongBoard, ['1H', 'Double', '2H'], defaultBiddingSystem));
  if (strongCandidates.some(({ rule }) =>
    rule.id === 'advance-takeout-double-after-responder-raise-responsive-double')) {
    failures += 1;
    console.error('FAIL responsive Double exceeded the modeled 11-point maximum.');
  }

  console.log(`Responder-raise advancing boundaries: ${checks} checks; ${failures} failures.`);
  console.log('  Restricts the new rules to simple raises and keeps responsive Double behind');
  console.log('  a clear fit, a five-card natural suit, or the modeled strong-hand cuebid.');
  return failures;
}

/// Natural responder actions after a suit overcall or takeout double have their own
/// advancing family.  Keep those rules out of Pass, raise, artificial, and jump-response auctions.
function runResponderNaturalActionAdvanceBoundaryTests (): number {
  const overcallDeal = ADVANCER_AFTER_RESPONDER_NATURAL_ACTION_OVERCALL_TEST_DEALS[0];
  const takeoutDeal = ADVANCER_AFTER_RESPONDER_NATURAL_ACTION_TAKEOUT_DOUBLE_TEST_DEALS[0];
  if (overcallDeal === undefined || takeoutDeal === undefined) {
    console.error('FAIL responder-action advancing boundaries need saved practice fixtures.');
    return 1;
  }
  const { board: overcallBoard } = makeRuleTestBoard(overcallDeal);
  const { board: takeoutBoard } = makeRuleTestBoard(takeoutDeal);
  let checks = 0;
  let failures = 0;

  for (const auction of [
    ['1D', '1S', 'Pass'],
    ['1D', '1S', '2D'],
    ['1D', '1S', '2S'],
    ['1D', '1S', 'Double'],
    ['1H', '2D', '2NT'],
    ['1D', '2H', '2S'],
  ] as Call[][]) {
    checks += 1;
    const candidates = getApplicableCandidateCalls(evaluateUserCall(
      'Pass', overcallBoard, auction, defaultBiddingSystem));
    if (candidates.some(({ rule }) => rule.id.includes('responder-natural-action'))) {
      failures += 1;
      console.error(`FAIL suit-overcall responder-action rules leaked into ${auction.join(' ')}.`);
    }
  }

  for (const auction of [
    ['1H', 'Double', 'Pass'],
    ['1H', 'Double', '2H'],
    ['1H', 'Double', 'Redouble'],
    ['1H', 'Double', '2S'],
  ] as Call[][]) {
    checks += 1;
    const candidates = getApplicableCandidateCalls(evaluateUserCall(
      'Pass', takeoutBoard, auction, defaultBiddingSystem));
    if (candidates.some(({ rule }) => rule.id.includes('responder-natural-action'))) {
      failures += 1;
      console.error(`FAIL takeout responder-action rules leaked into ${auction.join(' ')}.`);
    }
  }

  checks += 1;
  const responderSuitCandidates = getApplicableCandidateCalls(evaluateUserCall(
    '2S', takeoutBoard, ['1H', 'Double', '1S'], defaultBiddingSystem));
  if (responderSuitCandidates.some(({ rule }) =>
    rule.id.includes('responder-natural-action-new-suit'))) {
    failures += 1;
    console.error('FAIL advancer treated responder’s newly bid suit as a natural new suit.');
  }

  checks += 1;
  const doubleCandidates = getApplicableCandidateCalls(evaluateUserCall(
    'Double', overcallBoard, ['1D', '1S', '1NT'], defaultBiddingSystem));
  if (doubleCandidates.some(({ call, rule }) =>
    call === 'Double' && rule.id.includes('responder-natural-action'))) {
    failures += 1;
    console.error('FAIL natural responder-action family introduced an unagreed Double.');
  }

  console.log(`Responder-action advancing boundaries: ${checks} checks; ${failures} failures.`);
  console.log('  Limits these advances to natural new-suit or 1NT responses and keeps');
  console.log('  artificial responder calls, jumps, and unrelated actions outside this family.');
  return failures;
}

/// Jump-overcall advances must require a real jump and responder's Pass. The
/// boundary fixtures separately exercise suit quality and the 12-HCP new-suit minimum.
function runJumpOvercallAdvanceBoundaryTests (): number {
  const weakJump = ADVANCER_AFTER_JUMP_OVERCALL_TEST_DEALS[0];
  const strongNewSuit = ADVANCER_AFTER_JUMP_OVERCALL_TEST_DEALS.find((deal) =>
    deal.practiceAuction[3] === '3D');
  if (weakJump === undefined || strongNewSuit === undefined) {
    console.error('FAIL jump-overcall advances require saved practice fixtures.');
    return 1;
  }
  const { board } = makeRuleTestBoard(weakJump);
  let checks = 0;
  let failures = 0;
  const unsupportedAuctions: Call[][] = [
    ['1D', '1H', 'Pass'], // Natural one-level overcall, not a jump.
    ['1S', '2H', 'Pass'], // Natural non-jump two-level overcall.
    ['1D', '2H', '2S'],   // Opponents' responder did not pass.
    ['1NT', '2H', 'Pass'], // Defense to 1NT is not yet supported.
    ['2D', '3H', 'Pass'], // Two-level opening is outside this family.
  ];
  for (const auction of unsupportedAuctions) {
    checks += 1;
    const candidates = getApplicableCandidateCalls(evaluateUserCall(
      'Pass', board, auction, defaultBiddingSystem));
    if (candidates.some(({ rule }) => rule.id.startsWith('advance-jump-overcall-') ||
        rule.id.startsWith('advance-two-level-jump-overcall-') ||
        rule.id.startsWith('advance-three-level-jump-overcall-'))) {
      failures += 1;
      console.error(`FAIL weak-jump advancing rules leaked into ${auction.join(' ')}.`);
    }
  }
  // 2NT inquiries and five-level raises are intentionally unsupported here.
  for (const call of ['2NT', '5H'] as Call[]) {
    checks += 1;
    const bids = getApplicableCandidateCalls(evaluateUserCall(
      call, board, ['1D', '2H', 'Pass'], defaultBiddingSystem));
    if (bids.some(({ call: candidateCall }) => candidateCall === call)) {
      failures += 1;
      console.error(`FAIL jump overcall unexpectedly admits ${call}.`);
    }
  }
  const weakSuitBoard = makeRuleTestBoard({
    ...strongNewSuit,
    south: { S: 'T8', H: 'QJ8', D: 'JT976', C: 'AKQ' },
  }).board;
  checks += 1;
  const qualityCandidates = getApplicableCandidateCalls(evaluateUserCall(
    '3D', weakSuitBoard, ['1H', '2S', 'Pass'], defaultBiddingSystem));
  if (qualityCandidates.some(({ call, rule }) =>
    call === '3D' && rule.id === 'advance-jump-overcall-forcing-new-suit')) {
    failures += 1;
    console.error('FAIL jump-overcall new suit needs concentrated honor quality.');
  }
  const weakHandBoard = makeRuleTestBoard({
    ...ADVANCER_AFTER_JUMP_OVERCALL_TEST_DEALS.find((deal) =>
      deal.practiceAuction[3] === '3C')!,
    south: { S: 'QJ6', H: 'T8', D: '932', C: 'AKJ76' }, // Good clubs, but only 11 HCP.
  }).board;
  checks += 1;
  const strengthCandidates = getApplicableCandidateCalls(evaluateUserCall(
    '3C', weakHandBoard, ['1D', '2H', 'Pass'], defaultBiddingSystem));
  if (strengthCandidates.some(({ call, rule }) =>
    call === '3C' && rule.id === 'advance-jump-overcall-forcing-new-suit')) {
    failures += 1;
    console.error('FAIL jump-overcall new suit requires at least 12 HCP.');
  }
  console.log(`Jump-overcall advancing boundaries: ${checks} checks; ${failures} failures.`);
  console.log('  Checks genuine jump overcalls, unsupported auctions and calls, and');
  console.log('  the strength and suit quality required for forcing new-suit advances.');
  return failures;
}

function getTestedStages (deal: RuleTestDeal): StageExpectations[] {
  return [
    { name: 'opening', auctionLength: 0, expected: deal.expectedOpeningCalls,
      rejected: deal.rejectedOpeningCalls, order: deal.expectedOpeningCallOrder },
    { name: 'overcall', auctionLength: 1, expected: deal.expectedOvercallCalls,
      rejected: deal.rejectedOvercallCalls, order: deal.expectedOvercallCallOrder },
    { name: 'advance', auctionLength: 3, expected: deal.expectedAdvanceCalls,
      rejected: deal.rejectedAdvanceCalls, order: deal.expectedAdvanceCallOrder },
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
  runCompetitionBoundaryTests() + runAdvancingBoundaryTests() +
  runTakeoutAdvanceBoundaryTests() + runSharedOneNtAdvanceBoundaryTests() +
  runResponderRaiseAdvanceBoundaryTests() + runResponderNaturalActionAdvanceBoundaryTests() +
  runJumpOvercallAdvanceBoundaryTests() +
  runRuleTests();
if (failureCount !== 0) {
  throw new Error(`${failureCount} rule-test failure${failureCount === 1 ? '' : 's'}.`);
}
