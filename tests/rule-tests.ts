/// Run saved practice deals through the production evaluator without changing bidding behavior.
/// Each stage tests the calls supported by specified rules and selected eliminations/orderings.
import { getResponderStrongSecondSuit } from '../src/models/responder-rebidding-functions';
import { defaultBiddingSystem, type BidRule, type BiddingSystem, type Call, type SuitBid } from '../src/models/bidding-types';
import { compareSuitBids, getAdvancerCallKindForOpenerRebid, getNextBiddingRuleStage,
         getInterferenceAfterOpening, getRecordedPracticeCorrection, getNextSeat, getSeatForCallIndex, isPracticeSequenceComplete, isCallAvailableInAuction, auctionIsComplete, parseSuitBid, responseJump }
  from '../src/models/auction';
import { evaluateRules, evaluateUserCall, getApplicableCandidateCalls, makeRuleEvalContext, getBiddingTurnStatus, getUnmodeledContinuationForce, normalizeCallInput,
         type CandidateCallMatch } from '../src/models/biddingEvaluation';
import { getHandFacts, makeRuleTestBoard } from '../src/models/cards';
import { getOpeningRequirementFailureLines, getOpeningRequirementSupportLine,
         getNotrumpPartnerResponseLines, getNotrumpPartnerResponseFailureLines,
         getDontInitialSupportLine, getDontInitialFailureLines,
         getWeakTwoOvercallSupportLine, getWeakTwoOvercallFailureLines,
         getNaturalSuitOvercallerRebidLines, getNaturalSuitOvercallerRebidFailureLines,
         getNaturalResponderRebidLines, getNaturalResponderRebidFailureLines,
         getConventionalResponderRebidLines, getConventionalResponderRebidFailureLines,
         getContestedSuitOvercallerRebidLines, getContestedSuitOvercallerRebidFailureLines,
         getTakeoutDoublerRebidLines, getTakeoutDoublerRebidFailureLines,
         getOneNtOvercallerRebidLines, getOneNtOvercallerRebidFailureLines,
         getWeakTwoDefenseRebidLines, getWeakTwoDefenseRebidFailureLines,
         getOpenerArtificialSupportRebidLines, getOpenerArtificialSupportRebidFailureLines,
         getOpenerCompetitiveNaturalNtRebidLines, getOpenerCompetitiveNaturalNtRebidFailureLines,
         getOpenerOneNtInterferenceLines, getOpenerOneNtInterferenceFailureLines,
         getOpenerJumpOvercallRebidLines, getOpenerJumpOvercallRebidFailureLines,
         getOpenerWeakCompetitiveRebidLines, getOpenerWeakCompetitiveRebidFailureLines,
         getOpenerThreeLevelGameForceRebidLines, getOpenerThreeLevelGameForceRebidFailureLines }
  from '../src/models/explanations';
import { ResponseBidRules } from '../src/models/responding-rules';
import { OpenerRebidRules } from '../src/models/opener-rebidding-rules';
import { NATURAL_SUIT_OVERCALL_REBID_TEST_DEALS, CONTESTED_OVERCALL_REBID_TEST_DEALS,
         TAKEOUT_DOUBLER_REBID_TEST_DEALS, NATURAL_1NT_OVERCALL_REBID_TEST_DEALS,
         WEAK_TWO_REBID_TEST_DEALS }
  from '../src/models/overcalling-test-deals';
import { ADVANCER_AFTER_ONE_LEVEL_SUIT_OVERCALL_TEST_DEALS,
         ADVANCER_AFTER_TWO_LEVEL_SUIT_OVERCALL_TEST_DEALS,
         ADVANCER_AFTER_TAKEOUT_DOUBLE_TEST_DEALS,
         ADVANCER_AFTER_NATURAL_1NT_OVERCALL_TEST_DEALS,
         ADVANCER_AFTER_RESPONDER_RAISE_OVERCALL_TEST_DEALS,
         ADVANCER_AFTER_RESPONDER_RAISE_TAKEOUT_DOUBLE_TEST_DEALS,
         ADVANCER_AFTER_RESPONDER_NATURAL_ACTION_OVERCALL_TEST_DEALS,
         ADVANCER_AFTER_RESPONDER_NATURAL_ACTION_TAKEOUT_DOUBLE_TEST_DEALS,
         ADVANCER_AFTER_NEGATIVE_DOUBLE_TEST_DEALS,
         ADVANCER_AFTER_TAKEOUT_REDOUBLE_TEST_DEALS,
         ADVANCER_AFTER_JUMP_OVERCALL_TEST_DEALS, DONT_1NT_DEFENSE_TEST_DEALS,
         WEAK_TWO_2NT_CONTINUATION_TEST_DEALS, WEAK_TWO_DEFENSE_TEST_DEALS,
         RESPONSE_AFTER_1NT_OPENING_TEST_DEALS,
         RESPONSE_AFTER_2NT_OPENING_TEST_DEALS,
         RESPONSE_AFTER_MAJOR_OPENING_TEST_DEALS,
         RESPONSE_TO_STRONG_2C_TEST_DEALS,
         RESPONSE_TO_WEAK_PREEMPT_TEST_DEALS,
         RESPONDER_AFTER_SUIT_OVERCALL_TEST_DEALS,
         RESPONDER_AFTER_TAKEOUT_DOUBLE_TEST_DEALS,
         RESPONDER_AFTER_JUMP_OVERCALL_TEST_DEALS,
         OPENER_REBID_AFTER_INTERFERENCE_TEST_DEALS,
         RULE_TEST_DEAL_BUCKETS, getRulesBucketTestDeals, isPracticeDealCompatible, OPENING_BID_TEST_DEALS, BALANCING_TEST_DEALS,
         type RuleTestDeal, type RuleTestExpectedCall }
  from '../src/models/test-deals-registry';

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
  console.log(`${failureCount} ***FAILURES***. Auction helpers: ${cases.length} responseJump ` +
              `checks and ${comparisonCases.length} bid-order comparisons.`);
  console.log('  Verifies jump sizes (including zero) and correct suit-bid ordering.');
  console.log('  These are fundamental calculations used throughout the bidding rules.\n');
  return failureCount;
}

/// Opening fallback and position tests use direct evaluator checks instead of adding extra
/// practice deals solely to exercise all four seat positions.
function runOpeningPositionAndPassTests (): number {
  const ruleTwentyDeal = OPENING_BID_TEST_DEALS.find((deal) =>
    deal.expectedOpeningCalls?.some(({ ruleIds }) => ruleIds.includes('open-guideline-of-20')));
  if (ruleTwentyDeal === undefined) {
    console.error('FAIL missing representative Guideline-of-20 opening fixture.');
    return 1;
  }
  const { board: ruleTwentyBoard } = makeRuleTestBoard(ruleTwentyDeal);
  const { board: weakBoard } = makeRuleTestBoard({
    description: 'Balanced eight-HCP opening Pass fallback test hand.',
    practiceAuction: ['Pass'],
    north: { S: 'KJ74', H: 'Q82', D: 'J65', C: 'J94' },
    south: { S: 'A83', H: 'AK5', D: 'KQ4', C: 'A765' },
  });
  const positions: { dealer: typeof ruleTwentyBoard.dealer; auction: Call[] }[] = [
    { dealer: 'N', auction: [] },
    { dealer: 'W', auction: ['Pass'] },
    { dealer: 'S', auction: ['Pass', 'Pass'] },
    { dealer: 'E', auction: ['Pass', 'Pass', 'Pass'] },
  ];
  let checks = 0;
  let failures = 0;
  for (const [index, position] of positions.entries()) {
    const ruleTwentyCandidates = getApplicableCandidateCalls(evaluateUserCall('1S',
      { ...ruleTwentyBoard, dealer: position.dealer }, position.auction, defaultBiddingSystem));
    const ruleTwentyFound = ruleTwentyCandidates.some(({ call, rule }) =>
      call === '1S' && rule.id === 'open-guideline-of-20');
    const ordinaryOpeningFound = ruleTwentyCandidates.some(({ call, rule }) =>
      call === '1S' && rule.id === 'open-five-card-major');
    checks += 1;
    if (ruleTwentyFound !== (index < 2) || ! ordinaryOpeningFound ||
        ruleTwentyCandidates.some(({ call }) => call === 'Pass')) {
      failures += 1;
      console.error(`FAIL opening Rule of 20/Pass at position ${index + 1}.`);
      console.error(`  Surviving: ${formatCandidates(ruleTwentyCandidates)}`);
    }

    const weakCandidates = getApplicableCandidateCalls(evaluateUserCall('Pass',
      { ...weakBoard, dealer: position.dealer }, position.auction, defaultBiddingSystem));
    checks += 1;
    if (weakCandidates.length !== 1 || weakCandidates[0]?.call !== 'Pass' ||
        weakCandidates[0]?.rule.id !== 'open-pass-no-qualifying-action') {
      failures += 1;
      console.error(`FAIL opening Pass fallback at position ${index + 1}.`);
      console.error(`  Surviving: ${formatCandidates(weakCandidates)}`);
    }
  }

  // Eight hearts with AKJ and eight HCP: length points make 1H a regular opening, but an
  // aggressive 4H preempt is also available at a lower priority. Do not silently offer 3H.
  const { board: longHeartsBoard } = makeRuleTestBoard({
    description: 'Eight-card heart suit eligible for both an ordinary opening and a preempt.',
    practiceAuction: ['1H'],
    north: { S: '32', H: 'AKJ98765', D: 'T4', C: '2' },
    south: { S: 'AQJ', H: 'QT4', D: 'AK8', C: 'Q983' },
  });
  const heartCandidates = getApplicableCandidateCalls(evaluateUserCall('1H',
    longHeartsBoard, [], defaultBiddingSystem));
  checks += 1;
  const oneHeart = heartCandidates.findIndex(({ call }) => call === '1H');
  const fourHearts = heartCandidates.findIndex(({ call }) => call === '4H');
  if (oneHeart < 0 || fourHearts < 0 || oneHeart >= fourHearts ||
      heartCandidates.some(({ call }) => call === '3H')) {
    failures += 1;
    console.error('FAIL eight-heart hand should rank 1H ahead of 4H, without a modeled 3H.');
    console.error(`  Surviving: ${formatCandidates(heartCandidates)}`);
  }
  // A 6H/5S opening uses the longer major; existing practice deals cover 5-5 ties.
  const { board: sixFiveBoard } = makeRuleTestBoard({
    description: 'Longer heart major opening selection', practiceAuction: ['1H'],
    north: { S: 'KQJ95', H: 'AT9876', D: 'K', C: '2' },
    south: { S: 'A84', H: 'KQ5', D: 'J84', C: 'A763' },
  });
  const sixFive = evaluateUserCall('1H', sixFiveBoard, [], defaultBiddingSystem);
  const chosenMajor = sixFive.ruleDiagnostics.find(({ rule }) => rule.id === 'open-five-card-major');
  checks += 1;
  if (chosenMajor?.callEvidence?.openingSelection?.call !== '1H' ||
      !sixFive.userCallMatchingRules.some(({ id }) => id === 'open-five-card-major') ||
      getApplicableCandidateCalls(sixFive).some(({ call }) => call === '1S')) {
    failures += 1;
    console.error('FAIL 6H/5S opening should select hearts.');
  }
  // An eligible 1D convenient minor remains visible in diagnostics after 1NT displaces it.
  const { board: balancedNtBoard } = makeRuleTestBoard({
    description: 'Notrump displaces equal-four-card-minor opening', practiceAuction: ['1NT'],
    north: { S: 'Q8', H: 'KJ9', D: 'AJ84', C: 'KQ75' },
    south: { S: 'AJ7', H: 'Q73', D: 'KQ5', C: 'J842' },
  });
  const ntChoice = evaluateUserCall('1NT', balancedNtBoard, [], defaultBiddingSystem);
  const minor = ntChoice.ruleDiagnostics.find(({ rule }) => rule.id === 'open-convenient-minor');
  checks += 1;
  if (!ntChoice.userCallMatchingRules.some(({ id }) => id === 'open-1nt-balanced-15-17') ||
      minor?.callEvidence?.openingSelection?.call !== '1D' ||
      minor.callEvidence.suppressedBy !== '1NT' ||
      getApplicableCandidateCalls(ntChoice).some(({ call }) => call === '1D')) {
    failures += 1;
    console.error('FAIL notrump should suppress but retain the convenient-minor selection.');
  }
  console.log(`${failures} ***FAILURES***. Opening position, Pass, and preempt priority: ${checks} checks.`);
  console.log('  Tests first/second-seat Guideline of 20, opening Pass at all seats, and 1H vs 4H.\n');
  return failures;
}

/// The first instructional-explanation batch covers only basic opening requirements.
/// Inspect the evidence actually returned by the evaluator, not a second HCP/shape evaluator.
function runBasicOpeningExplanationTests (): number {
  let failures = 0;
  let checks = 0;
  const make = (north: { S: string; H: string; D: string; C: string }) =>
    makeRuleTestBoard({ description: 'Basic opening explanation test', north,
      south: { S: 'T53', H: '954', D: 'T86', C: 'T853' },
      practiceAuction: [] }).board;
  const balanced16 = make({ S: 'AQ86', H: 'KJ7', D: 'A94', C: 'Q62' });
  const balanced20 = make({ S: 'AKQ4', H: 'AQ8', D: 'KJ5', C: 'J72' });
  const balanced22 = make({ S: 'AKQ4', H: 'AK8', D: 'KJ5', C: 'Q72' });
  const unbalanced16 = make({ S: 'AQJ972', H: 'KJ6', D: 'A3', C: 'J4' });
  const balanced14NoMajor = make({ S: 'AJ84', H: 'KJ7', D: 'Q94', C: 'K62' });
  const openingCases: { board: ReturnType<typeof make>; call: Call;
    system: BiddingSystem; expectedRule: string; expectedText: string }[] = [
    { board: balanced16, call: '1NT', system: defaultBiddingSystem,
      expectedRule: 'open-1nt-balanced-15-17', expectedText: '15–17 HCP' },
    { board: balanced16, call: '1NT', system: { ...defaultBiddingSystem, oneNtOpening: '16-18' },
      expectedRule: 'open-1nt-balanced-16-18', expectedText: '16–18 HCP' },
    { board: balanced20, call: '2NT', system: defaultBiddingSystem,
      expectedRule: 'open-2nt-balanced-20-21', expectedText: '20–21 HCP' },
    { board: balanced22, call: '2C', system: defaultBiddingSystem,
      expectedRule: 'open-2c-strong-artificial', expectedText: 'at least 22 HCP' },
  ];
  for (const test of openingCases) {
    const result = evaluateUserCall(test.call, test.board, [], test.system);
    const rule = result.userCallMatchingRules.find(({ id }) => id === test.expectedRule);
    const text = rule === undefined ? null : getOpeningRequirementSupportLine(result, rule);
    checks += 1;
    if (text === null || !text.includes(test.expectedText) ||
        getOpeningRequirementFailureLines(result).length !== 0) {
      failures += 1;
      console.error(`FAIL basic opening explanation: supported ${test.call} ${test.expectedRule}; ${text}`);
    }
  }

  const upgradeDeal = OPENING_BID_TEST_DEALS[0];
  if (upgradeDeal !== undefined) {
    const { board } = makeRuleTestBoard(upgradeDeal);
    const enabled = { ...defaultBiddingSystem, oneNtFiveCardLengthUpgrade: true };
    const disabled = { ...defaultBiddingSystem, oneNtFiveCardLengthUpgrade: false };
    const upgrade = evaluateUserCall('1NT', board, [], enabled);
    const upgradeRule = upgrade.userCallMatchingRules.find(({ id }) =>
      id === 'open-1nt-five-card-length-upgrade');
    const positive = upgradeRule === undefined ? null :
      getOpeningRequirementSupportLine(upgrade, upgradeRule);
    const rejected = evaluateUserCall('1NT', board, [], disabled);
    const negative = getOpeningRequirementFailureLines(rejected).join(' ');
    checks += 2;
    if (positive === null || !positive.includes('14 HCP') ||
        !positive.includes('five-card major')) {
      failures += 1;
      console.error('FAIL optional 1NT upgrade explanation did not include the actual hand facts.');
    }
    if (rejected.userCallMatchingRules.length !== 0 ||
        !negative.includes('15–17 HCP') || !negative.includes('14 HCP') ||
        negative.includes('upgrade')) {
      failures += 1;
      console.error(`FAIL disabled 1NT upgrade explanation: ${negative}`);
    }
  }

  const noMajorUpgrade = evaluateUserCall('1NT', balanced14NoMajor, [],
    { ...defaultBiddingSystem, oneNtFiveCardLengthUpgrade: true });
  const noMajorText = getOpeningRequirementFailureLines(noMajorUpgrade).join(' ');
  checks += 1;
  if (noMajorUpgrade.userCallMatchingRules.length !== 0 ||
      !noMajorText.includes('without a five-card major') ||
      !noMajorText.includes('open-1nt-five-card-length-upgrade')) {
    failures += 1;
    console.error(`FAIL 1NT upgrade excluded by missing five-card major: ${noMajorText}`);
  }
  const shapeResult = evaluateUserCall('1NT', unbalanced16, [], defaultBiddingSystem);
  const shapeText = getOpeningRequirementFailureLines(shapeResult).join(' ');
  checks += 1;
  if (shapeResult.userCallMatchingRules.length !== 0 ||
      !shapeText.includes('not balanced') || !shapeText.includes('16 HCP')) {
    failures += 1;
    console.error(`FAIL unbalanced 1NT explanation: ${shapeText}`);
  }
  const strong2CResult = evaluateUserCall('2C', balanced20, [], defaultBiddingSystem);
  const strong2CText = getOpeningRequirementFailureLines(strong2CResult).join(' ');
  checks += 1;
  if (!strong2CText.includes('at least 22 HCP') || !strong2CText.includes('20 HCP')) {
    failures += 1;
    console.error(`FAIL strong 2C opening explanation: ${strong2CText}`);
  }
  const overcall = evaluateUserCall('1NT', balanced16, ['1D'], defaultBiddingSystem);
  checks += 1;
  if (getOpeningRequirementFailureLines(overcall).length !== 0) {
    failures += 1;
    console.error('FAIL basic opening feedback leaked into overcalling.');
  }
  console.log(`${failures} ***FAILURES***. Basic opening evidence: ${checks} checks.\n`);
  return failures;
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
  console.log(`${failureCount} ***FAILURES***. Auction context: ${checkCount} semantic/literal matching checks.`);
  console.log('  Verifies that mock rules match the correct opening level, suit, and auction');
  console.log('  sequence, without accidentally matching unrelated auctions.\n');
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
  const stages: { auction: Call[]; expected: ReturnType<typeof getNextBiddingRuleStage> }[] = [
    { auction: ['1D'], expected: 'overcalling' },
    { auction: ['1D', 'Pass'], expected: 'responding' },
    { auction: ['1D', '1S'], expected: 'responding' },
    { auction: ['1D', '1S', 'Pass'], expected: 'advancing' },
    { auction: ['1D', '1S', '2D'], expected: 'advancing' },
    { auction: ['1D', 'Double'], expected: 'responding' },
    { auction: ['1D', 'Double', 'Pass'], expected: 'advancing' },
    { auction: ['1D', 'Double', '2D'], expected: 'advancing' },
    { auction: ['1D', 'Double', 'Pass', 'Pass'], expected: 'openerRebid' },
    { auction: ['1D', '1S', 'Double', 'Pass'], expected: 'openerRebid' },
    { auction: ['1D', '1S', '1H', 'Pass'], expected: 'openerRebid' },
    { auction: ['1H', 'Double', '1S', 'Pass'], expected: 'openerRebid' },
    { auction: ['1D', 'Double', 'Redouble', 'Pass'], expected: 'openerRebid' },
    { auction: ['1NT', '2H', '2NT', 'Pass'], expected: 'openerRebid' },
    { auction: ['1NT', '2H', '3NT', 'Pass'], expected: 'openerRebid' },
    { auction: ['1H', '1S', '2C', 'Pass'], expected: 'openerRebid' },
    { auction: ['1H', '1S', '2S', 'Pass'], expected: 'openerRebid' },
    { auction: ['1H', '2D', '2H', 'Pass'], expected: 'openerRebid' },
    { auction: ['1H', 'Double', '2H', 'Pass'], expected: 'openerRebid' },
    { auction: ['1H', 'Double', '1NT', 'Pass'], expected: 'openerRebid' },
    { auction: ['1H', 'Double', '2D', 'Pass'], expected: 'openerRebid' },
    { auction: ['1H', 'Double', '3H', 'Pass'], expected: 'openerRebid' },
    { auction: ['1H', 'Double', '2NT', 'Pass'], expected: 'openerRebid' },
    { auction: ['1H', 'Double', '1S', '2C'], expected: 'openerRebid' },
    { auction: ['1NT', '2H', '3C', 'Pass'], expected: 'openerRebid' },
    { auction: ['1D', '2S', 'Double', 'Pass'], expected: 'openerRebid' },
    { auction: ['1D', 'Pass', '1H', 'Pass'], expected: 'openerRebid' },
  ];
  for (const testCase of stages) {
    checks += 1;
    if (getNextBiddingRuleStage(board.dealer, testCase.auction) !== testCase.expected) {
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
  if (getNextBiddingRuleStage('W', ['1D', '1NT']) !== 'responding' ||
      getNextBiddingRuleStage('W', ['1D', '3C']) !== 'responding') {
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
  const doubleCases: { auction: Call[]; expected: boolean }[] = [
    { auction: ['1H'], expected: true },
    { auction: ['1H', 'Pass'], expected: false },
    { auction: ['1H', 'Pass', 'Pass'], expected: true },
    { auction: ['1H', 'Double'], expected: false },
    { auction: ['1H', 'Double', 'Redouble'], expected: false },
  ];
  for (const testCase of doubleCases) {
    checks += 1;
    if (isCallAvailableInAuction('Double', testCase.auction) !== testCase.expected) {
      failures += 1;
      console.error(`FAIL Double availability after ${testCase.auction.join(' ')}.`);
    }
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
  // Weak-two defenses retain the core suit-quality/length and stopper boundaries rather than
  // treating every legal higher call as a modeled overcall.
  const { board: weakTwoNoStopperBoard } = makeRuleTestBoard({
    description: 'Balanced 15 HCP without a diamond stopper after weak 2D.',
    dealer: 'W',
    practiceAuction: ['2D', '2NT', 'Pass'],
    north: { S: 'AKJ4', H: 'AQ6', D: '954', C: 'J83' },
    south: { S: '9763', H: '542', D: '632', C: '742' },
    west: { S: '852', H: '73', D: 'KQJT87', C: '65' },
  });
  const weakTwoNtCandidates = getApplicableCandidateCalls(
    evaluateUserCall('2NT', weakTwoNoStopperBoard, ['2D'], defaultBiddingSystem));
  checks += 1;
  if (weakTwoNtCandidates.some(({ call }) => call === '2NT')) {
    failures += 1;
    console.error('FAIL natural 2NT over a weak two requires a stopper in opener\'s suit.');
  }
  const { board: weakTwoShortSuitBoard } = makeRuleTestBoard({
    description: 'Only five hearts are insufficient for a three-level overcall of weak 2S.',
    dealer: 'W',
    practiceAuction: ['2S', '3H', 'Pass'],
    north: { S: 'A4', H: 'AQJT9', D: 'K65', C: 'J83' },
    south: { S: '6532', H: '653', D: '842', C: '642' },
    west: { S: 'KQJ987', H: '842', D: '73', C: 'T5' },
  });
  const weakTwoShortSuitCandidates = getApplicableCandidateCalls(
    evaluateUserCall('3H', weakTwoShortSuitBoard, ['2S'], defaultBiddingSystem));
  checks += 1;
  if (weakTwoShortSuitCandidates.some(({ call }) => call === '3H')) {
    failures += 1;
    console.error('FAIL three-level natural weak-two defense requires a good 6+ card suit.');
  }
  // Systems-on 2NT continuations require both opponents to pass through the modeled convention.
  const weakTwoTwoNtDeal = WEAK_TWO_2NT_CONTINUATION_TEST_DEALS[0];
  if (weakTwoTwoNtDeal !== undefined) {
    const { board: weakTwoTwoNtBoard } = makeRuleTestBoard(weakTwoTwoNtDeal);
    const responderCompetes = getApplicableCandidateCalls(evaluateUserCall(
      '3C', weakTwoTwoNtBoard, ['2D', '2NT', '2H'], defaultBiddingSystem));
    checks += 1;
    if (responderCompetes.some(({ rule }) => rule.id.startsWith('advance-weak-two-2nt-'))) {
      failures += 1;
      console.error('FAIL weak-two 2NT systems survived responder competition.');
    }
    const openerCompetes = getApplicableCandidateCalls(evaluateUserCall(
      '3H', weakTwoTwoNtBoard, ['2D', '2NT', 'Pass', '3C', '3D'], defaultBiddingSystem));
    checks += 1;
    if (openerCompetes.some(({ rule }) => rule.id.startsWith('overcaller-rebid-weak-two-2nt-'))) {
      failures += 1;
      console.error('FAIL weak-two 2NT convention reply survived opener competition.');
    }
  }
  // Recorded competitive setups must themselves be plausible with the supplied hands;
  // neither the opening nor the opponent's overcall/takeout double is an arbitrary script.
  for (const deal of [...ADVANCER_AFTER_TWO_LEVEL_SUIT_OVERCALL_TEST_DEALS,
                      ...ADVANCER_AFTER_TAKEOUT_DOUBLE_TEST_DEALS,
                      ...WEAK_TWO_2NT_CONTINUATION_TEST_DEALS,
                      ...WEAK_TWO_DEFENSE_TEST_DEALS,
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
  console.log(`${failures} ***FAILURES***. Competition boundaries: ${checks} checks.`);
  console.log('  Checks bidding stages, legal calls, interference classifications, and');
  console.log('  eligibility of competitive bids, including calls pre-set in test deals.\n');
  return failures;
}

/// These opening families deliberately stop when responder faces interference.  Some ordinary
/// calls may still be reasonable bridge, but the trainer must not imply that it models a complete
/// competitive treatment merely because compact partnership-auction matching still sees the
/// opening.
function runResponderInterferenceScopeBoundaryTests (): number {
  const twoNt = RESPONSE_AFTER_2NT_OPENING_TEST_DEALS[0];
  const strongTwoC = RESPONSE_TO_STRONG_2C_TEST_DEALS[0];
  const weakTwo = RESPONSE_TO_WEAK_PREEMPT_TEST_DEALS.find((deal) =>
    deal.practiceAuction[0] === '2H');
  const weakThree = RESPONSE_TO_WEAK_PREEMPT_TEST_DEALS.find((deal) =>
    deal.practiceAuction[0] === '3H');
  const weakMajorPass = RESPONSE_AFTER_MAJOR_OPENING_TEST_DEALS.find((deal) =>
    deal.expectedResponseCalls?.some(({ ruleIds }) =>
      ruleIds.includes('respond-to-major-w/-pass-0-5')));
  if (twoNt === undefined || strongTwoC === undefined || weakTwo === undefined ||
      weakThree === undefined || weakMajorPass === undefined) {
    console.error('FAIL responder interference scope checks need saved response fixtures.');
    return 1;
  }

  let checks = 0;
  let failures = 0;
  const omittedFamilies = [
    { name: '2NT', deal: twoNt, rulePrefix: 'respond-to-2nt-' },
    { name: 'strong 2C', deal: strongTwoC, rulePrefix: 'respond-to-2c-' },
    { name: 'weak two', deal: weakTwo, rulePrefix: 'respond-to-weak-two-' },
    { name: 'three-level preempt', deal: weakThree,
      rulePrefix: 'respond-to-three-level-preempt-' },
  ];
  for (const family of omittedFamilies) {
    const { board } = makeRuleTestBoard(family.deal);
    const opening = family.deal.practiceAuction[0]!;
    checks += 1;
    const results = evaluateRules(ResponseBidRules,
      makeRuleEvalContext(board, [opening, 'Double']), defaultBiddingSystem);
    if (results.some(({ rule }) => rule.id.startsWith(family.rulePrefix))) {
      failures += 1;
      console.error(`FAIL ordinary ${family.name} responses survived direct interference.`);
    }
  }

  // The ordinary weak Pass remains intentionally shared in modeled one-level competition, but it
  // must not become an accidental treatment for arbitrary 2NT interference or a four-level jump.
  const { board: weakPassBoard } = makeRuleTestBoard(weakMajorPass);
  checks += 1;
  const modeledCandidates = getApplicableCandidateCalls(evaluateUserCall(
    'Pass', weakPassBoard, ['1S', '2H'], defaultBiddingSystem));
  if (! modeledCandidates.some(({ rule }) => rule.id === 'respond-to-major-w/-pass-0-5')) {
    failures += 1;
    console.error('FAIL ordinary weak Pass disappeared from modeled suit-overcall competition.');
  }
  for (const auction of [['1S', '2NT'], ['1S', '4H']] as Call[][]) {
    checks += 1;
    const candidates = getApplicableCandidateCalls(evaluateUserCall(
      'Pass', weakPassBoard, auction, defaultBiddingSystem));
    if (candidates.some(({ rule }) => rule.id === 'respond-to-major-w/-pass-0-5')) {
      failures += 1;
      console.error(`FAIL ordinary weak Pass leaked into ${auction.join(' ')}.`);
    }
  }

  console.log(`${failures} ***FAILURES***. Responder interference scope: ${checks} checks.`);
  console.log('  Keeps omitted opening families outside competitive responder evaluation while');
  console.log('  preserving the intentionally shared weak Pass in supported one-level auctions.\n');
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
        // Student exercises start with North dealing and retain four explicitly authored hands.
        // Board construction also validates thirteen cards per hand and rejects duplicates.
        if (board.dealer !== 'N' || deal.east === undefined || deal.west === undefined) {
          failureCount += 1;
          console.error(`FAIL practice deal requires North dealer and four fixed hands\n${label}`);
        }
        for (const note of deal.practiceGuidance ?? []) {
          if (! Number.isInteger(note.auctionIndex) || note.auctionIndex < 0 ||
              note.auctionIndex >= deal.practiceAuction.length ||
              note.seat !== getSeatForCallIndex(board.dealer, note.auctionIndex)) {
            failureCount += 1;
            console.error(`FAIL practice guidance does not identify a recorded turn\n${label}`);
          }
        }
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
  console.log(`${failureCount} ***FAILURES***. Primary: ${dealCount} deals; ` +
              `${positiveCount} positive, ${eliminationCount} elimination, ` +
              `${callOrderCount} call-order, ${recordedCallCount} recorded-call checks.`);
  console.log('  Runs practice deals through the production bidding evaluator, checking');
  console.log('  expected rules and calls, rejected alternatives, ranking, and auction calls.\n');
  // Independently verify that practice calls also work in representative dropdown configurations.
  const compatibilityFailures = runConventionCompatibilityChecks();
  return failureCount + compatibilityFailures;
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
  console.log(`${failureCount} ***FAILURES***. Compatibility meta-check for the four ` +
              `Stayman/Jacoby/Texas setting combinations: ` +
              `${compatibleDeals} eligible deal/configuration runs, ` +
              `${recordedCalls} recorded practice-call checks.`);
  console.log('  Replays eligible practice auctions under four representative convention');
  console.log('  configurations to ensure their recorded calls remain valid.\n');
  console.log();
  return failureCount;
}

/// Competitive opener-rebid boundaries protect the deliberately selected advancer-Pass families.
/// Meaning-preserving natural calls may reuse opted-in descriptive rules, while repurposed calls
/// such as a support cuebid or Jordan 2NT use purpose-built competitive continuations.
function runCompetitiveOpenerRebidBoundaryTests (): number {
  let checks = 0;
  let failures = 0;

  // A 4m raise is below game, but 4M already reaches game. The split must not
  // change the medium-hand strength range or the required three-card support.
  const mediumMinor = OpenerRebidRules.find((rule) =>
    rule.id === 'opener-rebid-jump-raise-after-overcall-two-level-new-suit');
  const mediumMajor = OpenerRebidRules.find((rule) =>
    rule.id === 'opener-rebid-game-major-raise-after-overcall-two-level-new-suit-medium');
  const mediumRaiseCases: { rule: BidRule | undefined; calls: Call[];
      category: 'invitational' | 'signoff'; label: string }[] = [
    { rule: mediumMinor, calls: ['4C', '4D'], category: 'invitational', label: 'four-minor' },
    { rule: mediumMajor, calls: ['4H', '4S'], category: 'signoff', label: 'four-major' },
  ];
  for (const { rule, calls, category, label } of mediumRaiseCases) {
    checks += 1;
    const points = rule?.appliesWhen;
    const rangeCorrect = points !== undefined && typeof points !== 'function' &&
      points.totalPoints?.min === 17 && points.totalPoints?.max === 18 &&
      points.totalPoints?.valuation === 'shortage' && points.supportLength?.min === 3;
    if (rule === undefined || rule.calls?.join(',') !== calls.join(',') ||
        !rule.callCategory?.includes(category) || !rangeCorrect) {
      failures += 1;
      console.error(`FAIL competitive ${label} medium raise category or hand requirements.`);
    }
  }

  const { board: redoubleBoard } = makeRuleTestBoard(RESPONDER_AFTER_TAKEOUT_DOUBLE_TEST_DEALS[0]!);
  const redoubleCandidates = getApplicableCandidateCalls(evaluateUserCall(
    'Pass', redoubleBoard, ['1H', 'Double', 'Redouble', 'Pass'], defaultBiddingSystem));
  checks += 1;
  if (! redoubleCandidates.some(({ call, rule }) =>
      call === 'Pass' && rule.id === 'opener-rebid-pass-after-takeout-redouble')) {
    failures += 1;
    console.error('FAIL opener Pass did not survive after strength Redouble and advancer Pass.');
    console.error(`  Surviving: ${formatCandidates(redoubleCandidates)}`);
  }

  // Reusing a natural opener family after an overcall must not turn the opponent's suit into a
  // natural second suit.  In this hand diamonds are opener's only four-card side suit.
  const { board: cueBoard } = makeRuleTestBoard({
    description: 'Opponent-suit exclusion for a reused opener rebid.',
    practiceAuction: ['1C', '1D', '1H', 'Pass', 'Pass'],
    north: { S: 'A64', H: '2', D: 'KJ63', C: 'AQ972' },
    south: { S: 'QJT8', H: 'KQJ9', D: '854', C: '86' },
  });
  const cueCandidates = getApplicableCandidateCalls(evaluateUserCall(
    '2D', cueBoard, ['1C', '1D', '1H', 'Pass'], defaultBiddingSystem));
  checks += 1;
  if (cueCandidates.some(({ call, rule }) =>
      call === '2D' && rule.id === 'opener-rebid-second-suit-after-minor-one-level-new-suit')) {
    failures += 1;
    console.error('FAIL reused opener rule treated opponent diamonds as a natural second suit.');
  }

  // A reused natural notrump rebid after a suit overcall needs the same conservative stopper
  // used by the other natural NT families.  These hands differ only in the diamond holding that
  // supplies or denies a stopper.
  const noStopperDeal: RuleTestDeal = {
    description: 'Reused opener 1NT requires a stopper in the overcalled suit.',
    practiceAuction: ['1C', '1D', '1H', 'Pass', '1NT'],
    north: { S: 'A64', H: 'K2', D: '9863', C: 'AQT7' },
    south: { S: 'QJ8', H: 'AQ74', D: 'T52', C: 'K86' },
  };
  const { board: noStopperBoard } = makeRuleTestBoard(noStopperDeal);
  const noStopperCandidates = getApplicableCandidateCalls(evaluateUserCall(
    '1NT', noStopperBoard, ['1C', '1D', '1H', 'Pass'], defaultBiddingSystem));
  checks += 1;
  if (noStopperCandidates.some(({ call, rule }) =>
      call === '1NT' && rule.id === 'opener-rebid-1nt-after-minor-one-level-new-suit')) {
    failures += 1;
    console.error('FAIL reused opener 1NT survived without a stopper in the overcalled suit.');
  }

  const stopperDeal: RuleTestDeal = {
    ...noStopperDeal,
    description: 'Reused opener 1NT remains available with a stopper in the overcalled suit.',
    north: { S: 'A64', H: 'K2', D: 'J963', C: 'AQT7' },
    south: { S: 'QJ8', H: 'AQ74', D: 'T52', C: 'K86' },
  };
  const { board: stopperBoard } = makeRuleTestBoard(stopperDeal);
  const stopperCandidates = getApplicableCandidateCalls(evaluateUserCall(
    '1NT', stopperBoard, ['1C', '1D', '1H', 'Pass'], defaultBiddingSystem));
  checks += 1;
  if (! stopperCandidates.some(({ call, rule }) =>
      call === '1NT' && rule.id === 'opener-rebid-1nt-after-minor-one-level-new-suit')) {
    failures += 1;
    console.error('FAIL reused opener 1NT disappeared despite a stopper in the overcalled suit.');
    console.error(`  Surviving: ${formatCandidates(stopperCandidates)}`);
  }

  // A competitive two-level natural response keeps its one-round force but must not acquire
  // the partnership's uncontested 2/1 game-force meaning.  The opponent-suit discriminator also
  // keeps that family separate from the artificial support cuebid.
  const naturalTwoLevelDeal = RESPONDER_AFTER_SUIT_OVERCALL_TEST_DEALS[7]!;
  const { board: naturalTwoLevelBoard } = makeRuleTestBoard(naturalTwoLevelDeal);
  const naturalTwoLevelCandidates = getApplicableCandidateCalls(evaluateUserCall(
    '2NT', naturalTwoLevelBoard, ['1H', '1S', '2C', 'Pass'], defaultBiddingSystem));
  checks += 1;
  if (! naturalTwoLevelCandidates.some(({ call, rule }) =>
      call === '2NT' && rule.id === 'opener-rebid-2nt-after-overcall-two-level-new-suit') ||
      naturalTwoLevelCandidates.some(({ rule }) =>
        rule.id.includes('standard-two-level-new-suit') ||
        rule.id.includes('two-over-one-new-suit'))) {
    failures += 1;
    console.error('FAIL competitive two-level response did not keep its separate forcing family.');
    console.error(`  Surviving: ${formatCandidates(naturalTwoLevelCandidates)}`);
  }

  // Every competitive two-level response promises five or more cards.  Three-card opener support
  // is therefore enough even where the same-looking uncontested response would need four cards.
  const { board: threeCardSupportBoard } = makeRuleTestBoard({
    description: 'Three-card opener support after a forcing competitive 2C response.',
    practiceAuction: ['1H', '1S', '2C', 'Pass', '3C'],
    north: { S: 'K72', H: 'AKT94', D: 'QJ', C: '873' },
    east: { S: 'AQJ86', H: '762', D: '8', C: 'K964' },
    south: { S: 'T9', H: 'QJ', D: 'AT97', C: 'AQJT5' },
  });
  const threeCardSupportCandidates = getApplicableCandidateCalls(evaluateUserCall(
    '3C', threeCardSupportBoard, ['1H', '1S', '2C', 'Pass'], defaultBiddingSystem));
  checks += 1;
  if (! threeCardSupportCandidates.some(({ call, rule }) =>
      call === '3C' &&
      rule.id === 'opener-rebid-raise-after-overcall-two-level-new-suit-minimum')) {
    failures += 1;
    console.error("FAIL three-card support did not raise responder's promised five-card suit.");
    console.error(`  Surviving: ${formatCandidates(threeCardSupportCandidates)}`);
  }

  const supportCuebidDeal = RESPONDER_AFTER_SUIT_OVERCALL_TEST_DEALS[1]!;
  const { board: supportCuebidBoard } = makeRuleTestBoard(supportCuebidDeal);
  const supportCuebidResult = evaluateUserCall(
    '4H', supportCuebidBoard, ['1H', '1S', '2S', 'Pass'], defaultBiddingSystem);
  const supportCuebidCandidates = getApplicableCandidateCalls(supportCuebidResult);
  checks += 1;
  if (! supportCuebidCandidates.some(({ call, rule }) =>
      call === '4H' && rule.id === 'opener-rebid-game-major-after-support-cuebid') ||
      supportCuebidCandidates.some(({ rule }) =>
        rule.id.includes('overcall-two-level-new-suit'))) {
    failures += 1;
    console.error('FAIL support cuebid did not stay separate from natural two-level responses.');
    console.error(`  Surviving: ${formatCandidates(supportCuebidCandidates)}`);
  }
  const supportCuebidRule = supportCuebidResult.userCallMatchingRules.find((rule) =>
    rule.id === 'opener-rebid-game-major-after-support-cuebid');
  checks += 1;
  if (supportCuebidRule === undefined ||
      !getOpenerArtificialSupportRebidLines(supportCuebidResult,
        supportCuebidRule, getHandFacts(supportCuebidBoard.deal.N))
        .some((line) => line.includes('11+') && line.includes('cuebid'))) {
    failures += 1;
    console.error('FAIL support cuebid game lacked the 11+ artificial-support explanation.');
  }

  const { board: minimumCuebidBoard } = makeRuleTestBoard({
    description: 'Minimum opener after a limit-or-better support cuebid.',
    practiceAuction: ['1H', '1S', '2S', 'Pass', '3H'],
    north: { S: 'K72', H: 'AKT94', D: 'Q53', C: '83' },
    east: { S: 'AQJ86', H: '762', D: '8', C: 'K964' },
    south: { S: 'T93', H: 'QJ85', D: 'AT97', C: 'AQ' },
  });
  const minimumCuebidCandidates = getApplicableCandidateCalls(evaluateUserCall(
    '3H', minimumCuebidBoard, ['1H', '1S', '2S', 'Pass'], defaultBiddingSystem));
  checks += 1;
  if (! minimumCuebidCandidates.some(({ call, rule }) =>
      call === '3H' &&
      rule.id === 'opener-rebid-three-of-suit-after-support-cuebid-minimum')) {
    failures += 1;
    console.error('FAIL minimum opener did not sign off below game after support cuebid.');
    console.error(`  Surviving: ${formatCandidates(minimumCuebidCandidates)}`);
  }
  const minimumCuebidGameResult = evaluateUserCall(
    '4H', minimumCuebidBoard, ['1H', '1S', '2S', 'Pass'], defaultBiddingSystem);
  checks += 1;
  if (!getOpenerArtificialSupportRebidFailureLines(
      minimumCuebidGameResult, getHandFacts(minimumCuebidBoard.deal.N))
      .some((line) => line.includes('at least 14 support points'))) {
    failures += 1;
    console.error('FAIL unsupported cuebid game lacked its opener-strength reason.');
  }
  const cuebidPassResult = evaluateUserCall(
    'Pass', minimumCuebidBoard, ['1H', '1S', '2S', 'Pass'], defaultBiddingSystem);
  checks += 1;
  if (!getOpenerArtificialSupportRebidFailureLines(
      cuebidPassResult, getHandFacts(minimumCuebidBoard.deal.N))
      .some((line) => line.includes('artificial forcing raise'))) {
    failures += 1;
    console.error('FAIL Pass after a forcing support cuebid lacked its forcing explanation.');
  }

  const jordanDeal = RESPONDER_AFTER_TAKEOUT_DOUBLE_TEST_DEALS[0]!;
  const { board: jordanBoard } = makeRuleTestBoard(jordanDeal);
  const jordanResult = evaluateUserCall(
    '3H', jordanBoard, ['1H', 'Double', '2NT', 'Pass'], defaultBiddingSystem);
  const jordanCandidates = getApplicableCandidateCalls(jordanResult);
  checks += 1;
  if (! jordanCandidates.some(({ call, rule }) =>
      call === '3H' && rule.id === 'opener-rebid-three-of-suit-after-jordan-2nt-minimum') ||
      jordanCandidates.some(({ rule }) => rule.id.includes('jacoby'))) {
    failures += 1;
    console.error('FAIL Jordan 2NT continuation leaked into the Jacoby family.');
    console.error(`  Surviving: ${formatCandidates(jordanCandidates)}`);
  }
  const jordanRule = jordanResult.userCallMatchingRules.find((rule) =>
    rule.id === 'opener-rebid-three-of-suit-after-jordan-2nt-minimum');
  checks += 1;
  if (jordanRule === undefined ||
      !getOpenerArtificialSupportRebidLines(jordanResult, jordanRule,
        getHandFacts(jordanBoard.deal.N))
        .some((line) => line.includes('10+') && line.includes('Jordan'))) {
    failures += 1;
    console.error('FAIL Jordan minimum lacked its 10+ artificial-support explanation.');
  }

  const { board: jordanGameBoard } = makeRuleTestBoard({
    description: 'Game values opposite Jordan 2NT after a takeout Double.',
    practiceAuction: ['1H', 'Double', '2NT', 'Pass', '4H'],
    north: { S: 'K72', H: 'AKQ96', D: 'Q53', C: '54' },
    east: { S: 'AQJ4', H: '2', D: 'K874', C: 'QJ86' },
    south: { S: 'T98', H: 'J75', D: 'AJ6', C: 'AK73' },
  });
  const jordanGameCandidates = getApplicableCandidateCalls(evaluateUserCall(
    '4H', jordanGameBoard, ['1H', 'Double', '2NT', 'Pass'], defaultBiddingSystem));
  checks += 1;
  if (! jordanGameCandidates.some(({ call, rule }) =>
      call === '4H' && rule.id === 'opener-rebid-game-major-after-jordan-2nt')) {
    failures += 1;
    console.error('FAIL opener did not bid game with sufficient values opposite Jordan 2NT.');
    console.error(`  Surviving: ${formatCandidates(jordanGameCandidates)}`);
  }

  const weakTwoDeal = RESPONDER_AFTER_TAKEOUT_DOUBLE_TEST_DEALS[3]!;
  const { board: weakTwoBoard } = makeRuleTestBoard(weakTwoDeal);
  const weakTwoCandidates = getApplicableCandidateCalls(evaluateUserCall(
    'Pass', weakTwoBoard, ['1H', 'Double', '2D', 'Pass'], defaultBiddingSystem));
  checks += 1;
  if (! weakTwoCandidates.some(({ call, rule }) =>
      call === 'Pass' && rule.id === 'opener-rebid-pass-after-double-weak-two-level-new-suit')) {
    failures += 1;
    console.error("FAIL minimum opener could not Pass responder's weak nonforcing 2D.");
  }

  const weakRaiseDeal = RESPONDER_AFTER_TAKEOUT_DOUBLE_TEST_DEALS[2]!;
  const { board: weakRaiseBoard } = makeRuleTestBoard(weakRaiseDeal);
  const weakRaiseCandidates = getApplicableCandidateCalls(evaluateUserCall(
    'Pass', weakRaiseBoard, ['1H', 'Double', '3H', 'Pass'], defaultBiddingSystem));
  checks += 1;
  if (! weakRaiseCandidates.some(({ call, rule }) =>
      call === 'Pass' && rule.id === 'opener-rebid-pass-after-double-weak-jump-raise')) {
    failures += 1;
    console.error("FAIL minimum opener could not Pass responder's weak preemptive jump raise.");
  }

  // Minimum Passes after a Double recognize the same legitimate light one-level
  // openings as the opening evaluator; natural 1NT still requires suitable shape.
  const weakLight = { S: 'Q7', H: 'AKJ842', D: '853', C: '82' };
  const weakStrong = { S: 'Q72', H: 'AKJ85', D: 'J53', C: 'A7' };
  const weakUnbalanced = { S: 'Q7', H: 'AKJ8542', D: '853', C: '8' };
  const weakNtResponse = { S: 'KT5', H: 'T76', D: 'A96', C: 'Q964' };
  const weakDiamondResponse = { S: 'T95', H: '7', D: 'AQT964', C: 'QJ3' };
  const weakClubJumpResponse = { S: 'T9', H: '7', D: 'A964', C: 'QJT653' };
  const weakHeartRaise = { S: 'T95', H: 'Q973', D: '964', C: 'QJ3' };
  const weakPassCases: { label: string; response: Call; north: typeof weakLight;
    south: typeof weakLight; ruleId: string; expected: string }[] = [
    { label: 'natural 1NT', response: '1NT', north: weakLight,
      south: weakNtResponse, ruleId: 'opener-rebid-pass-after-double-natural-1nt-minimum',
      expected: '10 HCP + 2 length points = 12 opening points' },
    { label: 'weak two-level natural suit', response: '2D', north: weakLight,
      south: weakDiamondResponse, ruleId: 'opener-rebid-pass-after-double-weak-two-level-new-suit',
      expected: '5–9 HCP' },
    { label: 'weak three-level jump shift', response: '3C', north: weakLight,
      south: weakClubJumpResponse,
      ruleId: 'opener-rebid-pass-after-double-weak-three-level-new-suit',
      expected: '4–7 HCP' },
    { label: 'weak three-level raise', response: '3H', north: weakLight,
      south: weakHeartRaise, ruleId: 'opener-rebid-pass-after-double-weak-jump-raise',
      expected: 'preemptive raise' },
  ];
  for (const test of weakPassCases) {
    const { board } = makeRuleTestBoard({
      description: 'Light opener after takeout Double and ' + test.label,
      practiceAuction: ['1H', 'Double', test.response, 'Pass', 'Pass'],
      north: test.north, south: test.south,
    });
    const opening = getApplicableCandidateCalls(evaluateUserCall(
      '1H', board, [], defaultBiddingSystem));
    const result = evaluateUserCall('Pass', board,
      ['1H', 'Double', test.response, 'Pass'], defaultBiddingSystem);
    const rule = result.userCallMatchingRules.find((entry) => entry.id === test.ruleId);
    const reason = rule === undefined ? [] :
      getOpenerWeakCompetitiveRebidLines(result, rule, getHandFacts(board.deal.N));
    checks += 1;
    if (!opening.some(({ rule: candidateRule, call }) =>
        call === '1H' && candidateRule.id === 'open-five-card-major') ||
        rule === undefined || !reason.some((line) => line.includes(test.expected))) {
      failures += 1;
      console.error(`FAIL weak competitive light opening ${test.label}: ${reason.join(' | ')}.`);
    }
  }
  // A distributional light opener is not automatically left in responder's natural 1NT.
  const { board: weakUnbalancedBoard } = makeRuleTestBoard({
    description: 'Seven-card suit opener does not automatically Pass natural 1NT after Double',
    practiceAuction: ['1H', 'Double', '1NT', 'Pass'],
    north: weakUnbalanced, south: weakNtResponse,
  });
  const unbalancedStatus = getBiddingTurnStatus(weakUnbalancedBoard,
    ['1H', 'Double', '1NT', 'Pass'], defaultBiddingSystem);
  checks += 1;
  if (unbalancedStatus.kind !== 'scopeBoundary' ||
      unbalancedStatus.rule.id !== 'opener-rebid-scope-boundary-after-double-natural-1nt') {
    failures += 1;
    console.error('FAIL distributional light opener did not reach 1NT shape boundary.');
  }
  const strongWeakCases: { response: Call; south: typeof weakNtResponse;
    boundary: string }[] = [
    { response: '1NT', south: weakNtResponse,
      boundary: 'opener-rebid-scope-boundary-after-double-natural-1nt' },
    { response: '2D', south: weakDiamondResponse,
      boundary: 'opener-rebid-scope-boundary-after-double-weak-two-level-new-suit' },
    { response: '3C', south: weakClubJumpResponse,
      boundary: 'opener-rebid-scope-boundary-after-double-weak-three-level-new-suit' },
    { response: '3H', south: weakHeartRaise,
      boundary: 'opener-rebid-scope-boundary-after-double-weak-jump-raise' },
  ];
  for (const test of strongWeakCases) {
    const { board } = makeRuleTestBoard({
      description: 'Extra value opener after Double weak ' + test.response,
      practiceAuction: ['1H', 'Double', test.response, 'Pass'],
      north: weakStrong, south: test.south,
    });
    const auction: Call[] = ['1H', 'Double', test.response, 'Pass'];
    const status = getBiddingTurnStatus(board, auction, defaultBiddingSystem);
    const rejected = evaluateUserCall('Pass', board, auction, defaultBiddingSystem);
    checks += 1;
    if (status.kind !== 'scopeBoundary' || status.rule.id !== test.boundary ||
        !getOpenerWeakCompetitiveRebidFailureLines(
          rejected, getHandFacts(board.deal.N)).some((line) => line.includes('15 HCP'))) {
      failures += 1;
      console.error(`FAIL strong opener weak-response judgment after ${test.response}.`);
    }
  }

  // Advancer semantics are part of opener's context: the same contract text can be a natural
  // suit, raise, or cuebid depending on the earlier calls.  Keep these classifications explicit.
  const advancerKinds: [Call[], string][] = [
    [['1H', '1S', '2H', '3S'], 'preemptiveRaise'],
    [['1H', '1S', '2H', '3C'], 'newSuit'],
    [['1D', '1S', '2D', 'Double'], 'responsiveDouble'],
    [['1S', '2H', '2S', '3S'], 'cuebid'],
    [['1C', '1S', '2H', '3H'], 'cuebid'],
    [['1H', 'Double', '1S', '2S'], 'cuebid'],
  ];
  for (const [auction, expectedKind] of advancerKinds) {
    checks += 1;
    const actualKind = getAdvancerCallKindForOpenerRebid('N', auction);
    if (actualKind !== expectedKind) {
      failures += 1;
      console.error(`FAIL advancer call kind ${actualKind ?? 'null'} != ${expectedKind} for ` +
                    auction.join(' '));
    }
  }

  // A hand-specific scope boundary explains the judgment-heavy middle without inventing a fake
  // candidate bid.  If a concrete bid applies instead, the boundary must disappear.
  const boundaryDeal = ADVANCER_AFTER_RESPONDER_RAISE_OVERCALL_TEST_DEALS[2]!;
  // The practice fixture is now 18 HCP, so reconstruct the original 17-HCP
  // medium-opener scenario for this existing scope-boundary test.
  const { board: boundaryBoard } = makeRuleTestBoard({
    ...boundaryDeal,
    north: { ...boundaryDeal.north, C: 'T3' },
    west: { ...boundaryDeal.west!, C: 'J8' },
  });
  const boundaryResult = evaluateUserCall(
    'Pass', boundaryBoard, ['1D', '1S', '2D', '3S'], defaultBiddingSystem);
  checks += 1;
  if (! boundaryResult.applicableRules.some((rule) => rule.kind === 'scopeBoundary') ||
      getApplicableCandidateCalls(boundaryResult).length !== 0) {
    failures += 1;
    console.error('FAIL medium opener did not stop at a no-candidate scope boundary.');
  }

  const concreteDeal = ADVANCER_AFTER_RESPONDER_RAISE_OVERCALL_TEST_DEALS[6]!;
  const { board: concreteBoard } = makeRuleTestBoard(concreteDeal);
  const concreteResult = evaluateUserCall(
    'Pass', concreteBoard, ['1H', '1S', '2H', '3C'], defaultBiddingSystem);
  checks += 1;
  if (! getApplicableCandidateCalls(concreteResult).some(({ call, rule }) =>
      call === 'Pass' && rule.id === 'opener-rebid-pass-after-major-simple-raise') ||
      concreteResult.applicableRules.some((rule) => rule.kind === 'scopeBoundary')) {
    failures += 1;
    console.error('FAIL concrete minimum Pass did not suppress the scope boundary.');
  }

  const { board: forcingBoundaryBoard } = makeRuleTestBoard({
    description: 'Extra-value opener after a forcing 2C response and advancer raise.',
    practiceAuction: ['1H', '1S', '2C', '2S'],
    north: { S: 'K7', H: 'KQJ94', D: 'AQJ3', C: 'J8' },
    south: { S: 'AQT98', H: 'A76', D: 'K85', C: 'Q9' },
  });
  const forcingBoundaryResult = evaluateUserCall(
    'Pass', forcingBoundaryBoard, ['1H', '1S', '2C', '2S'], defaultBiddingSystem);
  checks += 1;
  if (! forcingBoundaryResult.applicableRules.some((rule) =>
      rule.id === 'opener-rebid-scope-boundary-after-overcall-two-level-forcing-response') ||
      getApplicableCandidateCalls(forcingBoundaryResult).length !== 0) {
    failures += 1;
    console.error('FAIL forcing-response competition did not stop at its scope boundary.');
  }

  const { board: negativeDoubleBoundaryBoard } = makeRuleTestBoard({
    description: 'Extra-value opener after a negative Double and preemptive advancer raise.',
    practiceAuction: ['1D', '1S', 'Double', '3S'],
    north: { S: '74', H: 'KQ3', D: 'AKJ86', C: 'A82' },
    south: { S: 'Q3', H: 'AJT8', D: 'Q93', C: 'KT74' },
  });
  const negativeDoubleBoundaryResult = evaluateUserCall(
    'Pass', negativeDoubleBoundaryBoard, ['1D', '1S', 'Double', '3S'], defaultBiddingSystem);
  checks += 1;
  if (! negativeDoubleBoundaryResult.applicableRules.some((rule) =>
      rule.id === 'opener-rebid-scope-boundary-after-negative-double-advancer-action') ||
      getApplicableCandidateCalls(negativeDoubleBoundaryResult).length !== 0) {
    failures += 1;
    console.error('FAIL negative-Double competition did not stop at its scope boundary.');
  }

  const { board: naturalTwoNtBoard } = makeRuleTestBoard({
    description: 'Natural 2NT response after a suit overcall reaches game with 14 HCP opener.',
    practiceAuction: ['1H', '1S', '2NT', 'Pass'],
    north: { S: 'K7', H: 'AQJ84', D: 'KJ3', C: '842' },
    south: { S: 'AQ4', H: 'K3', D: 'Q965', C: 'J753' },
  });
  const naturalTwoNtCandidates = getApplicableCandidateCalls(evaluateUserCall(
    '3NT', naturalTwoNtBoard, ['1H', '1S', '2NT', 'Pass'], defaultBiddingSystem));
  checks += 1;
  if (! naturalTwoNtCandidates.some(({ call, rule }) =>
      call === '3NT' && rule.id === 'opener-rebid-3nt-after-overcall-natural-2nt')) {
    failures += 1;
    console.error('FAIL opener did not accept the natural competitive 2NT invitation.');
  }

  // The competitive natural-NT family is distinct from Jordan, and a light opening
  // with length-adjusted 12+ opening points remains a valid minimum at every Pass level.
  const light = { S: 'Q72', H: 'AKJ84', D: 'J53', C: '82' };
  const lightSix = { S: 'Q7', H: 'AKJ842', D: '853', C: '82' };
  const normalThirteen = { S: 'Q72', H: 'AKJ84', D: 'K53', C: '82' };
  const normalFourteen = { S: 'Q72', H: 'AKJ84', D: 'K53', C: 'J2' };
  const inviteEighteen = { S: 'A7', H: 'AKJ84', D: 'KQ3', C: 'J82' };
  const gameTwenty = { S: 'A7', H: 'AKQJ84', D: 'K53', C: 'K2' };
  const gameSeventeen = { S: 'A72', H: 'AKJ84', D: 'K53', C: 'Q2' };
  const slamEighteen = { S: 'A72', H: 'AKJ84', D: 'K53', C: 'K2' };
  const oneNtResponder = { S: 'KT5', H: 'T76', D: 'A96', C: 'Q964' };
  const twoNtResponder = { S: 'KT5', H: 'T76', D: 'AQ9', C: 'K964' };
  const threeNtResponder = { S: 'KT5', H: 'T76', D: 'AQ9', C: 'AJ64' };
  const naturalNtCases: { name: string; auction: Call[]; north: typeof light;
    south: typeof light; call: Call; ruleId: string; expectedLine: string }[] = [
    { name: 'Light opening Pass after 1NT', auction: ['1H', '1S', '1NT', 'Pass'],
      north: light, south: oneNtResponder, call: 'Pass',
      ruleId: 'opener-rebid-pass-after-overcall-natural-1nt-minimum',
      expectedLine: '11 HCP + 1 length points = 12 opening points' },
    { name: 'After the opponents raise, Pass declines to compete',
      auction: ['1H', '1S', '1NT', '2S'], north: light, south: oneNtResponder, call: 'Pass',
      ruleId: 'opener-rebid-pass-after-overcall-natural-1nt-minimum',
      expectedLine: 'it does not leave partner playing 1NT' },
    { name: 'Ten HCP plus six-card length points repeat hearts',
      auction: ['1H', '1S', '1NT', 'Pass'], north: lightSix, south: oneNtResponder, call: '2H',
      ruleId: 'opener-rebid-repeat-suit-after-overcall-natural-1nt',
      expectedLine: '10 HCP + 2 length points = 12 total points' },
    { name: 'Eighteen HCP invite after natural 1NT',
      auction: ['1H', '1S', '1NT', 'Pass'], north: inviteEighteen,
      south: oneNtResponder, call: '2NT',
      ruleId: 'opener-rebid-2nt-after-overcall-natural-1nt',
      expectedLine: '18–19-HCP' },
    { name: 'Twenty HCP semi-balanced opener bids 3NT',
      auction: ['1H', '1S', '1NT', 'Pass'], north: gameTwenty,
      south: oneNtResponder, call: '3NT',
      ruleId: 'opener-rebid-3nt-after-overcall-natural-1nt',
      expectedLine: '20–21 HCP' },
    { name: 'Light opening declines natural 2NT invitation',
      auction: ['1H', '1S', '2NT', 'Pass'], north: light,
      south: twoNtResponder, call: 'Pass',
      ruleId: 'opener-rebid-pass-after-overcall-natural-2nt',
      expectedLine: 'not Jordan 2NT (an artificial limit-or-better raise' },
    { name: 'Thirteen HCP declines 2NT invitation',
      auction: ['1H', '1S', '2NT', 'Pass'], north: normalThirteen,
      south: twoNtResponder, call: 'Pass',
      ruleId: 'opener-rebid-pass-after-overcall-natural-2nt',
      expectedLine: 'acceptance starts at 14 HCP' },
    { name: 'Fourteen HCP accepts 2NT invitation',
      auction: ['1H', '1S', '2NT', 'Pass'], north: normalFourteen,
      south: twoNtResponder, call: '3NT',
      ruleId: 'opener-rebid-3nt-after-overcall-natural-2nt',
      expectedLine: '14–18 HCP' },
    { name: 'Light opening Passes natural 3NT game',
      auction: ['1H', '1S', '3NT', 'Pass'], north: light,
      south: threeNtResponder, call: 'Pass',
      ruleId: 'opener-rebid-pass-after-overcall-natural-3nt',
      expectedLine: '11 HCP + 1 length points = 12 opening points' },
    { name: 'Seventeen HCP passes natural 3NT game',
      auction: ['1H', '1S', '3NT', 'Pass'], north: gameSeventeen,
      south: threeNtResponder, call: 'Pass',
      ruleId: 'opener-rebid-pass-after-overcall-natural-3nt',
      expectedLine: '17 HCP' },
  ];
  for (const test of naturalNtCases) {
    const { board } = makeRuleTestBoard({
      description: test.name, practiceAuction: [...test.auction, test.call],
      north: test.north, south: test.south,
    });
    const result = evaluateUserCall(test.call, board, test.auction, defaultBiddingSystem);
    const matching = result.userCallMatchingRules.find((rule) => rule.id === test.ruleId);
    const lines = matching === undefined ? [] :
      getOpenerCompetitiveNaturalNtRebidLines(result, matching, getHandFacts(board.deal.N));
    checks += 1;
    if (matching === undefined || !lines.some((line) => line.includes(test.expectedLine))) {
      failures += 1;
      console.error(`FAIL competitive natural NT: ${test.name}; ${lines.join(' | ')}`);
    }
    if (test.north === light || test.north === lightSix) {
      checks += 1;
      const opening = getApplicableCandidateCalls(evaluateUserCall(
        '1H', board, [], defaultBiddingSystem));
      if (!opening.some(({ call, rule }) => call === '1H' &&
          rule.id === 'open-five-card-major')) {
        failures += 1;
        console.error(`FAIL light opening does not actually qualify: ${test.name}.`);
      }
    }
  }
  const { board: rejectedInvitationBoard } = makeRuleTestBoard({
    description: 'Thirteen HCP cannot automatically accept natural 2NT invitation.',
    practiceAuction: ['1H', '1S', '2NT', 'Pass', '3NT'],
    north: normalThirteen, south: twoNtResponder,
  });
  const rejectedInvitation = evaluateUserCall('3NT', rejectedInvitationBoard,
    ['1H', '1S', '2NT', 'Pass'], defaultBiddingSystem);
  checks += 1;
  if (!getOpenerCompetitiveNaturalNtRebidFailureLines(rejectedInvitation,
      getHandFacts(rejectedInvitationBoard.deal.N)).some((line) =>
        line.includes('14–18 HCP') && line.includes('13'))) {
    failures += 1;
    console.error('FAIL rejected natural 2NT invitation acceptance lacks HCP reason.');
  }
  const { board: strongGameBoard } = makeRuleTestBoard({
    description: 'Eighteen HCP after natural 3NT reaches slam judgment, not 3NT Pass.',
    practiceAuction: ['1H', '1S', '3NT', 'Pass'],
    north: slamEighteen, south: threeNtResponder,
  });
  const strongGameStatus = getBiddingTurnStatus(strongGameBoard,
    ['1H', '1S', '3NT', 'Pass'], defaultBiddingSystem);
  checks += 1;
  if (strongGameStatus.kind !== 'scopeBoundary' ||
      strongGameStatus.rule.id !== 'opener-rebid-scope-boundary-after-overcall-natural-3nt') {
    failures += 1;
    console.error('FAIL 18-HCP 3NT responder sequence did not reach slam boundary.');
  }

  // Game-going three-level natural response: 3NT needs the actual stopper and
  // shape; a further opposing raise can instead make the long opener major game
  // available. The high-level boundary does not invent a penalty decision.
  const forcingNtOpener = { S: 'K83', H: 'AJ874', D: 'AT4', C: '95' };
  const forcingNoStopper = { S: 'AK3', H: 'AQ874', D: 'T94', C: '95' };
  const forcingLongMajor = { S: 'A8', H: 'AKQ874', D: 'T94', C: '95' };
  const forcingClubResponder = { S: 'J97', H: 'KT', D: '632', C: 'AKQ84' };
  const forcingOtherResponder = { S: 'QJ7', H: '62', D: 'J32', C: 'AKQ84' };
  const forcingAuction: Call[] = ['1H', '2D', '3C', 'Pass'];
  const { board: forcingNtBoard } = makeRuleTestBoard({
    description: 'Three-level game force: natural 3NT requires a diamond stopper.',
    practiceAuction: [...forcingAuction, '3NT'],
    north: forcingNtOpener, south: forcingClubResponder,
  });
  const forcingNtResult = evaluateUserCall('3NT', forcingNtBoard,
    forcingAuction, defaultBiddingSystem);
  const forcingNtRule = forcingNtResult.userCallMatchingRules.find((rule) =>
    rule.id === 'opener-rebid-3nt-after-overcall-three-level-forcing-response');
  const forcingNtLines = forcingNtRule === undefined ? [] :
    getOpenerThreeLevelGameForceRebidLines(forcingNtResult,
      forcingNtRule, getHandFacts(forcingNtBoard.deal.N));
  checks += 1;
  if (forcingNtRule === undefined || !forcingNtLines.some((line) =>
      line.includes('13+ HCP') && line.includes('stopper'))) {
    failures += 1;
    console.error('FAIL stopped 3NT game-force explanation after natural 3C.');
  }
  const { board: noStopperForceBoard } = makeRuleTestBoard({
    description: 'Three-level game force: opener lacks a basic diamond stopper.',
    practiceAuction: [...forcingAuction, '3NT'],
    north: forcingNoStopper, south: forcingClubResponder,
  });
  const deniedThreeNt = evaluateUserCall('3NT', noStopperForceBoard,
    forcingAuction, defaultBiddingSystem);
  checks += 1;
  if (deniedThreeNt.userCallMatchingRules.some((rule) =>
      rule.id === 'opener-rebid-3nt-after-overcall-three-level-forcing-response') ||
      !getOpenerThreeLevelGameForceRebidFailureLines(deniedThreeNt).some((line) =>
        line.includes('basic stopper') && line.includes('diamonds'))) {
    failures += 1;
    console.error('FAIL missing diamond stopper did not explain rejected 3NT.');
  }
  const noStopBoundary = getBiddingTurnStatus(noStopperForceBoard,
    forcingAuction, defaultBiddingSystem);
  checks += 1;
  if (noStopBoundary.kind !== 'scopeBoundary' ||
      noStopBoundary.rule.id !== 'opener-rebid-scope-boundary-after-overcall-three-level-forcing-response') {
    failures += 1;
    console.error('FAIL unresolved three-level game force lacks judgment boundary.');
  }
  const forcingPass = evaluateUserCall('Pass', noStopperForceBoard,
    forcingAuction, defaultBiddingSystem);
  checks += 1;
  if (!getOpenerThreeLevelGameForceRebidFailureLines(forcingPass).some((line) =>
      line.includes('game forcing') && line.includes('advancer Passing'))) {
    failures += 1;
    console.error('FAIL Pass without further competition ignored the game force.');
  }
  const majorAuction: Call[] = ['1H', '2D', '3C', '3D'];
  const { board: forcingMajorBoard } = makeRuleTestBoard({
    description: 'Three-level game force: opener has six hearts after advancer raises.',
    practiceAuction: [...majorAuction, '4H'],
    north: forcingLongMajor, south: forcingOtherResponder,
  });
  const forcingMajorResult = evaluateUserCall('4H', forcingMajorBoard,
    majorAuction, defaultBiddingSystem);
  const forcingMajorRule = forcingMajorResult.userCallMatchingRules.find((rule) =>
    rule.id === 'opener-rebid-own-major-game-after-overcall-three-level-forcing-competition');
  const forcingMajorLines = forcingMajorRule === undefined ? [] :
    getOpenerThreeLevelGameForceRebidLines(forcingMajorResult,
      forcingMajorRule, getHandFacts(forcingMajorBoard.deal.N));
  checks += 1;
  if (forcingMajorRule === undefined || !forcingMajorLines.some((line) =>
      line.includes('15') && line.includes('six-card'))) {
    failures += 1;
    console.error('FAIL long opening-major game lacks 15-point explanation.');
  }
  const highCompetition: Call[] = ['1H', '2D', '3C', '4D'];
  const highForceStatus = getBiddingTurnStatus(noStopperForceBoard,
    highCompetition, defaultBiddingSystem);
  checks += 1;
  if (highForceStatus.kind !== 'scopeBoundary' ||
      highForceStatus.rule.id !== 'opener-rebid-scope-boundary-after-overcall-three-level-forcing-response') {
    failures += 1;
    console.error('FAIL game-force judgment boundary after high diamond raise.');
  }
  // These auctions are only meaningful if South's 3C itself qualifies for
  // the documented natural game-forcing response before opener decides.
  for (const board of [forcingNtBoard, noStopperForceBoard, forcingMajorBoard]) {
    checks += 1;
    const responseCandidates = getApplicableCandidateCalls(evaluateUserCall(
      '3C', board, ['1H', '2D'], defaultBiddingSystem));
    if (!responseCandidates.some(({ call, rule }) => call === '3C' &&
        rule.id === 'respond-over-suit-new-suit-three-level')) {
      failures += 1;
      console.error('FAIL natural 3C game-force test lacks a qualifying responder bid.');
    }
  }
  // Check source hands before deriving opponent hands: the three pairs must be disjoint
  // full 13-card hands so evaluation actually reaches the intended rule assertion.
  for (const [opener, responder] of [
    [forcingNtOpener, forcingClubResponder],
    [forcingNoStopper, forcingClubResponder],
    [forcingLongMajor, forcingOtherResponder],
  ]) {
    checks += 1;
    const suits: (keyof typeof forcingNtOpener)[] = ['S', 'H', 'D', 'C'];
    const overlap = suits.some((suit) =>
      [...opener[suit]].some((rank) => responder[suit].includes(rank)));
    if (overlap || suits.reduce((total, suit) => total + opener[suit].length, 0) !== 13 ||
        suits.reduce((total, suit) => total + responder[suit].length, 0) !== 13) {
      failures += 1;
      console.error('FAIL invalid North/South cards in three-level game-force test.');
    }
  }

  const { board: redoubleRunoutBoard } = makeRuleTestBoard({
    description: 'Responder Redoubles a takeout Double and weak advancer escapes to 1S.',
    practiceAuction: ['1H', 'Double', 'Redouble', '1S'],
    north: { S: '72', H: 'AKT96', D: 'QJ3', C: 'A54' },
    south: { S: 'T98', H: 'QJ5', D: 'AK6', C: 'KQ73' },
  });
  const redoubleRunoutResult = evaluateUserCall(
    'Pass', redoubleRunoutBoard, ['1H', 'Double', 'Redouble', '1S'], defaultBiddingSystem);
  checks += 1;
  if (! redoubleRunoutResult.applicableRules.some((rule) =>
      rule.id === 'opener-rebid-scope-boundary-after-strength-redouble-runout') ||
      getApplicableCandidateCalls(redoubleRunoutResult).length !== 0) {
    failures += 1;
    console.error('FAIL strength-Redouble runout did not stop at its penalty scope boundary.');
  }

  const { board: oneNtOvercallBoundaryBoard } = makeRuleTestBoard({
    description: 'Extra-value opener after opponent 1NT and responder weak natural 2D.',
    practiceAuction: ['1H', '1NT', '2D', 'Pass'],
    north: { S: 'K72', H: 'AKT96', D: 'Q53', C: 'A4' },
    south: { S: 'T83', H: '73', D: 'AJT962', C: 'T3' },
  });
  const oneNtOvercallBoundaryResult = evaluateUserCall(
    'Pass', oneNtOvercallBoundaryBoard, ['1H', '1NT', '2D', 'Pass'], defaultBiddingSystem);
  checks += 1;
  if (! oneNtOvercallBoundaryResult.applicableRules.some((rule) =>
      rule.id === 'opener-rebid-scope-boundary-after-opponent-1nt-weak-new-suit') ||
      getApplicableCandidateCalls(oneNtOvercallBoundaryResult).length !== 0) {
    failures += 1;
    console.error('FAIL weak suit over opposing 1NT did not reach its extra-value boundary.');
  }

  const { board: preemptiveRaiseBoundaryBoard } = makeRuleTestBoard({
    description: 'Extra-value opener after responder makes a weak competitive jump raise.',
    practiceAuction: ['1S', '2H', '3S', 'Pass'],
    north: { S: 'AKJ74', H: 'K2', D: 'AQ3', C: '762' },
    south: { S: 'T986', H: 'T74', D: 'JT5', C: 'A83' },
  });
  const preemptiveRaiseBoundaryResult = evaluateUserCall(
    'Pass', preemptiveRaiseBoundaryBoard, ['1S', '2H', '3S', 'Pass'], defaultBiddingSystem);
  checks += 1;
  if (! preemptiveRaiseBoundaryResult.applicableRules.some((rule) =>
      rule.id === 'opener-rebid-scope-boundary-after-overcall-preemptive-three-level-raise') ||
      getApplicableCandidateCalls(preemptiveRaiseBoundaryResult).length !== 0) {
    failures += 1;
    console.error('FAIL competitive preemptive raise did not reach its extra-value boundary.');
  }

  const { board: minorCuebidBoundaryBoard } = makeRuleTestBoard({
    description: 'Extra-value minor opener after responder makes a support cuebid.',
    practiceAuction: ['1C', '1D', '2D', 'Pass'],
    north: { S: 'AK6', H: 'Q3', D: '832', C: 'KQJ74' },
    south: { S: 'QJ8', H: 'AJ85', D: '54', C: 'AT86' },
  });
  const minorCuebidBoundaryResult = evaluateUserCall(
    'Pass', minorCuebidBoundaryBoard, ['1C', '1D', '2D', 'Pass'], defaultBiddingSystem);
  checks += 1;
  if (! minorCuebidBoundaryResult.applicableRules.some((rule) =>
      rule.id === 'opener-rebid-scope-boundary-after-minor-support-cuebid-extras') ||
      getApplicableCandidateCalls(minorCuebidBoundaryResult).length !== 0) {
    failures += 1;
    console.error('FAIL minor support cuebid extras did not reach the strain-placement boundary.');
  }

  const { board: doubledPassBoundaryBoard } = makeRuleTestBoard({
    description: 'Responder and advancer both Pass after an opponent takeout Double.',
    practiceAuction: ['1H', 'Double', 'Pass', 'Pass'],
    north: { S: 'K72', H: 'AKT96', D: 'Q53', C: '54' },
    south: { S: 'T98', H: 'QJ5', D: 'A96', C: '9732' },
  });
  const doubledPassBoundaryResult = evaluateUserCall(
    'Pass', doubledPassBoundaryBoard, ['1H', 'Double', 'Pass', 'Pass'], defaultBiddingSystem);
  checks += 1;
  if (! doubledPassBoundaryResult.applicableRules.some((rule) =>
      rule.id === 'opener-rebid-scope-boundary-after-takeout-double-pass-pass') ||
      getApplicableCandidateCalls(doubledPassBoundaryResult).length !== 0) {
    failures += 1;
    console.error('FAIL doubled-contract runout decision did not reach its scope boundary.');
  }

  const unsupported: Call[][] = [
    ['1NT', '2H', '3H', 'Pass'],      // Opponent-suit cuebid is not a modeled natural response.
    ['1C', '1S', '2H', '3H'],         // Advancer cuebids responder's natural suit.
    ['1H', 'Double', '1S', '2S'],     // Advancer cuebids responder's natural suit.
    ['1C', '1S', 'Double', '3D'],     // Negative-Double side suit is modeled only at level two.
    ['1D', '1S', 'Double', '4NT'],    // Higher NT is not the selected negative-Double advance.
  ];
  for (const auction of unsupported) {
    checks += 1;
    if (getNextBiddingRuleStage('N', auction) !== null) {
      failures += 1;
      console.error(
        `FAIL unsupported competitive opener turn reached a stage: ${auction.join(' ')}.`);
    }
  }

  console.log(`${failures} ***FAILURES***. Competitive opener-rebid boundaries: ${checks} checks.`);
  console.log('  Allows the selected advancer-Pass continuations while keeping repurposed');
  console.log('  responder meanings and advancer competition outside this selected family.\n');
  return failures;
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
  // The ordinary two-level family must stay inactive after an unsupported responder action
  // or a jump overcall.
  for (const auction of [
    ['1D', '2C', '3D'], ['1D', '3C', 'Pass'],
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
  // Reuse the opener and overcaller holdings in separately constructed West-dealt tests.
  const twoLevelNtDeal = ADVANCER_AFTER_TWO_LEVEL_SUIT_OVERCALL_TEST_DEALS[2];
  if (twoLevelNtDeal === undefined) {
    failures += 1;
    console.error('FAIL advancing boundaries require the two-level 2NT fixture.');
  } else {
    const { board: noTwoLevelStopperBoard } = makeRuleTestBoard({
      description: twoLevelNtDeal.description, dealer: 'W',
      practiceAuction: twoLevelNtDeal.practiceAuction,
      north: twoLevelNtDeal.east!,
      west: twoLevelNtDeal.north,
      // East receives the remaining cards after this constructed South holding.
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
      description: threeLevelDeal.description, dealer: 'W',
      practiceAuction: threeLevelDeal.practiceAuction,
      north: threeLevelDeal.east!,
      west: threeLevelDeal.north,
      // East receives the remaining cards after this constructed South holding.
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
    description: deal.description, dealer: 'W',
    practiceAuction: deal.practiceAuction,
    north: deal.east!,
    west: deal.north,
    // East receives the remaining cards after this constructed South holding.
    south: { ...deal.west!, D: 'T953' }, // Swap K for T: 8 HCP and no diamond stopper.
  });
  checks += 1;
  const candidates = getApplicableCandidateCalls(evaluateUserCall(
    '1NT', noStopperBoard, ['1D', '1S', 'Pass'], defaultBiddingSystem));
  if (candidates.some((candidate) => candidate.call === '1NT')) {
    failures += 1;
    console.error('FAIL advancing 1NT requires a stopper in opener’s suit.');
  }
  console.log(`${failures} ***FAILURES***. Advancing boundaries: ${checks} checks.`);
  console.log('  Prevents ordinary suit-overcall advances from appearing in unsupported');
  console.log('  auctions; checks stoppers, suit quality, and strength requirements.\n');
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
    ['3D', 'Double', 'Pass'], // Three-level preempt defenses are intentionally omitted.
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
    description: jumpDeal.description, dealer: 'W',
    practiceAuction: jumpDeal.practiceAuction,
    north: jumpDeal.east!,
    west: jumpDeal.north,
    // East receives the remaining cards after this constructed South holding.
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
    description: notrumpDeal.description, dealer: 'W',
    practiceAuction: notrumpDeal.practiceAuction,
    north: notrumpDeal.east!,
    west: notrumpDeal.north,
    // East receives the remaining cards after this constructed South holding.
    south: { S: 'QJ5', H: 'T762', D: '83', C: 'AJ42' }, // 8 HCP, balanced, no D stopper.
  });
  checks += 1;
  const ntCandidates = getApplicableCandidateCalls(evaluateUserCall(
    '1NT', notrumpBoard, ['1D', 'Double', 'Pass'], defaultBiddingSystem));
  if (ntCandidates.some(({ call }) => call === '1NT')) {
    failures += 1;
    console.error('FAIL takeout double 1NT needs a stopper.');
  }
  console.log(`${failures} ***FAILURES***. Takeout advancing boundaries: ${checks} checks.`);
  console.log('  Checks takeout-double auction eligibility, the exceptional three-card');
  console.log('  suit response, and stopper requirements for notrump advances.\n');
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
    const contextMatches = results.ruleDiagnostics.some(({ rule }) =>
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
  console.log(`${failures} ***FAILURES***. Shared 1NT advancing boundaries: ${checks} checks.`);
  console.log('  Verifies that shared 1NT rules work after openings and overcalls,');
  console.log('  respect partnership range settings, and exclude unrelated auctions.\n');
  return failures;
}

/// Responder-raise advances apply only to a simple raise of opener's suit.  These checks
/// also keep responsive Double behind an obvious fit or a five-card natural suit.
function runResponderRaiseAdvanceBoundaryTests (): number {
  const overcallDoubleDeal = ADVANCER_AFTER_RESPONDER_RAISE_OVERCALL_TEST_DEALS[6];
  const twoLevelDoubleDeal = ADVANCER_AFTER_RESPONDER_RAISE_OVERCALL_TEST_DEALS[11];
  const takeoutDoubleDeal = ADVANCER_AFTER_RESPONDER_RAISE_TAKEOUT_DOUBLE_TEST_DEALS[3];
  if (overcallDoubleDeal === undefined || twoLevelDoubleDeal === undefined ||
      takeoutDoubleDeal === undefined) {
    console.error('FAIL responder-raise advancing boundaries need responsive-double fixtures.');
    return 1;
  }
  const { board: overcallBoard } = makeRuleTestBoard(overcallDoubleDeal);
  const { board: twoLevelBoard } = makeRuleTestBoard(twoLevelDoubleDeal);
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
    ['1S', '2H', 'Pass'],
    ['1S', '2H', '3S'],
    ['1S', '3H', '3S'],
    ['1S', '1H', '2S'],
  ] as Call[][]) {
    checks += 1;
    const candidates = getApplicableCandidateCalls(evaluateUserCall(
      'Double', twoLevelBoard, auction, defaultBiddingSystem));
    if (candidates.some(({ rule }) =>
      rule.id.startsWith('advance-two-level-suit-overcall-after-responder-raise-'))) {
      failures += 1;
      console.error(`FAIL two-level responder-raise rules leaked into ${auction.join(' ')}.`);
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
    north: overcallDoubleDeal.east!,
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
    north: takeoutDoubleDeal.east!,
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

  const { board: lowTwoLevelDoubleBoard } = makeRuleTestBoard({
    description: 'Higher-level responsive Double needs nine length points.',
    dealer: 'W', practiceAuction: ['1S', '2H', '2S', 'Double'],
    west: twoLevelDoubleDeal.north,
    north: twoLevelDoubleDeal.east!,
    east: { S: '852', H: '43', D: 'JT2', C: 'AKJT4' },
    south: { S: 'T96', H: 'T7', D: 'A754', C: 'Q983' },
  });
  checks += 1;
  const lowTwoLevelDoubleCandidates = getApplicableCandidateCalls(evaluateUserCall(
    'Double', lowTwoLevelDoubleBoard, ['1S', '2H', '2S'], defaultBiddingSystem));
  if (lowTwoLevelDoubleCandidates.some(({ rule }) =>
    rule.id === 'advance-two-level-suit-overcall-after-responder-raise-responsive-double')) {
    failures += 1;
    console.error('FAIL higher-level responsive Double survived below nine length points.');
  }

  const strongBoard = makeRuleTestBoard({
    description: 'Responsive Double gives way to the strong-hand cuebid.',
    dealer: 'W', practiceAuction: ['1H', 'Double', '2H', 'Double'],
    north: takeoutDoubleDeal.east!,
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

  console.log(`${failures} ***FAILURES***. Responder-raise advancing boundaries: ${checks} checks.`);
  console.log('  Restricts the new rules to simple raises and keeps responsive Double behind');
  console.log('  a clear fit, a five-card natural suit, or the modeled strong-hand cuebid.\n');
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

  console.log(`${failures} ***FAILURES***. Responder-action advancing boundaries: ${checks} checks.`);
  console.log('  Limits these advances to natural new-suit or 1NT responses and keeps');
  console.log('  artificial responder calls, jumps, and unrelated actions outside this family.\n');
  return failures;
}

/// A natural 1NT advance cannot suppress Pass after responder has already bid 1NT.
/// The rule predicate must use real auction legality, not just HCP, shape and stoppers.
function runNaturalActionPassLegalityTests (): number {
  const responder = { S: '76', H: 'K984', D: 'Q75', C: 'A643' };
  const cases: { name: string; auction: Call[]; north: typeof responder; passRule: string }[] = [
    {
      name: 'natural overcall followed by responder 1NT',
      auction: ['1D', '1S', '1NT'],
      north: { S: 'AKQJ9', H: '72', D: '83', C: 'KJT2' },
      passRule: 'advance-suit-overcall-after-responder-natural-action-pass',
    },
    {
      name: 'takeout Double followed by responder 1NT',
      auction: ['1H', 'Double', '1NT'],
      north: { S: 'AKQJ', H: '7', D: '8326', C: 'KJT9' },
      passRule: 'advance-takeout-double-after-responder-natural-action-pass',
    },
  ];
  let failures = 0;
  for (const testCase of cases) {
    const { board } = makeRuleTestBoard({
      description: `Natural responder action / legal Pass: ${testCase.name}.`,
      dealer: 'W', practiceAuction: [...testCase.auction, 'Pass'],
      north: testCase.north, south: responder,
    });
    const result = evaluateUserCall('Pass', board, testCase.auction, defaultBiddingSystem);
    const supported = getApplicableCandidateCalls(result);
    if (!supported.some((item) => item.call === 'Pass' && item.rule.id === testCase.passRule)) {
      failures += 1;
      console.error(`FAIL ${testCase.name}: legal Pass was rejected because of a phantom 1NT.`);
    }
    if (supported.some((item) => item.call === '1NT')) {
      failures += 1;
      console.error(`FAIL ${testCase.name}: 1NT was offered after responder already bid 1NT.`);
    }
  }
  console.log(`${failures} ***FAILURES***. B19 responder-1NT Pass legality: ` +
    `${cases.length * 2} checks.`);
  console.log('  An illegal natural 1NT advance cannot remove a valid Pass.\n');
  return failures;
}

/// Artificial responder actions have deliberately narrow advancing meanings.  Negative-Double
/// rules must not leak into other responder actions, and a Redoubled takeout Double supports only
/// the weak economical escape modeled here.
function runResponderArtificialActionAdvanceBoundaryTests (): number {
  const negativeDoubleDeal = ADVANCER_AFTER_NEGATIVE_DOUBLE_TEST_DEALS[5];
  const takeoutRedoubleDeal = ADVANCER_AFTER_TAKEOUT_REDOUBLE_TEST_DEALS[0];
  if (negativeDoubleDeal === undefined || takeoutRedoubleDeal === undefined) {
    console.error('FAIL artificial-action advancing boundaries need saved practice fixtures.');
    return 1;
  }
  const { board: negativeDoubleBoard } = makeRuleTestBoard(negativeDoubleDeal);
  const { board: takeoutRedoubleBoard } = makeRuleTestBoard(takeoutRedoubleDeal);
  let checks = 0;
  let failures = 0;

  for (const auction of [
    ['1D', '1S', 'Pass'],
    ['1D', '1S', '2D'],
    ['1D', '1S', '1NT'],
    ['1D', '1S', '2C'],
  ] as Call[][]) {
    checks += 1;
    const candidates = getApplicableCandidateCalls(evaluateUserCall(
      'Redouble', negativeDoubleBoard, auction, defaultBiddingSystem));
    if (candidates.some(({ rule }) => rule.id.includes('after-negative-double'))) {
      failures += 1;
      console.error(`FAIL negative-Double advancing rules leaked into ${auction.join(' ')}.`);
    }
  }

  const sideSuitDeal = ADVANCER_AFTER_NEGATIVE_DOUBLE_TEST_DEALS[4];
  if (sideSuitDeal === undefined) {
    console.error('FAIL negative-Double boundaries need the side-suit fixture.');
    return failures + 1;
  }
  const { board: sideSuitBoard } = makeRuleTestBoard(sideSuitDeal);
  checks += 1;
  const impliedSuitCandidates = getApplicableCandidateCalls(evaluateUserCall(
    '2H', sideSuitBoard, ['1D', '1S', 'Double'], defaultBiddingSystem));
  if (impliedSuitCandidates.some(({ call, rule }) => call === '2H' &&
      rule.id === 'advance-suit-overcall-after-negative-double-new-suit-two-level')) {
    failures += 1;
    console.error('FAIL negative-Double side-suit rule admitted the major implied by Double.');
  }

  const weakRedoubleBoard = makeRuleTestBoard({
    description: 'Strength Redouble boundary at nine HCP.',
    dealer: 'W', practiceAuction: ['1D', '1S', 'Double', 'Redouble'],
    west: { S: 'KJ53', H: 'Q4', D: 'AQT3', C: 'Q97' },
    north: { S: 'AT9764', H: '32', D: '64', C: 'K85' },
    east: { S: 'Q', H: 'AT8765', D: '', C: 'AT6432' },
    south: { S: '82', H: 'KJ9', D: 'KJ98752', C: 'J' },
  }).board;
  checks += 1;
  const weakRedoubleCandidates = getApplicableCandidateCalls(evaluateUserCall(
    'Redouble', weakRedoubleBoard, ['1D', '1S', 'Double'], defaultBiddingSystem));
  if (weakRedoubleCandidates.some(({ rule }) =>
    rule.id === 'advance-suit-overcall-after-negative-double-redouble-values')) {
    failures += 1;
    console.error('FAIL strength-showing Redouble admitted fewer than 10 HCP.');
  }

  for (const auction of [
    ['1H', 'Double', 'Pass'],
    ['1H', 'Double', '2H'],
    ['1H', 'Double', '1NT'],
  ] as Call[][]) {
    checks += 1;
    const candidates = getApplicableCandidateCalls(evaluateUserCall(
      '2C', takeoutRedoubleBoard, auction, defaultBiddingSystem));
    if (candidates.some(({ rule }) => rule.id.includes('responder-redouble'))) {
      failures += 1;
      console.error(`FAIL takeout-Redouble escape leaked into ${auction.join(' ')}.`);
    }
  }

  checks += 1;
  const jumpCandidates = getApplicableCandidateCalls(evaluateUserCall(
    '3C', takeoutRedoubleBoard, ['1H', 'Double', 'Redouble'], defaultBiddingSystem));
  if (jumpCandidates.some(({ call, rule }) =>
    call === '3C' && rule.id.includes('responder-redouble'))) {
    failures += 1;
    console.error('FAIL Redoubled takeout escape admitted an invitational or preemptive jump.');
  }

  const strongEscapeBoard = makeRuleTestBoard({
    description: 'Redoubled takeout escape boundary above eight length points.',
    dealer: 'W', practiceAuction: ['1H', 'Double', 'Redouble', '2C'],
    west: { S: 'J', H: 'K98642', D: 'Q52', C: 'A74' },
    north: { S: 'AQ53', H: 'T3', D: 'KJ93', C: 'Q63' },
    east: { S: 'KT86', H: '', D: 'AT8764', C: 'K98' },
    south: { S: '9742', H: 'AQJ75', D: '', C: 'JT52' },
  }).board;
  checks += 1;
  const strongEscapeCandidates = getApplicableCandidateCalls(evaluateUserCall(
    '2C', strongEscapeBoard, ['1H', 'Double', 'Redouble'], defaultBiddingSystem));
  if (strongEscapeCandidates.some(({ rule }) =>
    rule.id === 'advance-takeout-double-after-responder-redouble-weak-suit-escape')) {
    failures += 1;
    console.error('FAIL weak Redouble escape exceeded the modeled eight-point maximum.');
  }

  console.log(`${failures} ***FAILURES***. Artificial responder-action advancing boundaries: ${checks} checks.`);
  console.log('  Keeps strength-showing Redouble and weak takeout-Double escapes in their');
  console.log('  exact auctions, excluding implied suits, jumps, and stronger runout decisions.\n');
  return failures;
}

/// Shared 1NT-interference rules must recognize both bidding roles without re-enabling the
/// uncontested convention rules or expanding beyond the supported two-level interference.
function runOneNtInterferencePartnerBoundaryTests (): number {
  const responseDeal = RESPONSE_AFTER_1NT_OPENING_TEST_DEALS.at(-1);
  const advanceDeal = ADVANCER_AFTER_NATURAL_1NT_OVERCALL_TEST_DEALS.at(-1);
  if (responseDeal === undefined || advanceDeal === undefined) {
    console.error('FAIL 1NT-interference boundaries require the new shared-rule fixtures.');
    return 1;
  }
  let checks = 0;
  let failures = 0;

  const { board: responseBoard } = makeRuleTestBoard(responseDeal);
  const responseResult = evaluateUserCall('2S', responseBoard, ['1NT', '2H'], defaultBiddingSystem);
  const responseCandidates = getApplicableCandidateCalls(responseResult);
  checks += 1;
  if (responseCandidates.some((candidate) =>
      candidate.rule.id === 'partner-of-1nt-after-interference-natural-suit-two-level')) {
    failures += 1;
    console.error('FAIL natural 2S response leaked into artificial DONT 2H showing both majors.');
  }
  // DONT 2H shows both majors, so neither 2S nor a natural-heart takeout
  // Double may inherit the rules for a one-suited natural 2H overcall.
  const doubleAfterDont = getApplicableCandidateCalls(evaluateUserCall(
    'Double', responseBoard, ['1NT', '2H'], defaultBiddingSystem));
  checks += 1;
  if (doubleAfterDont.some(({ rule }) =>
      rule.id === 'partner-of-1nt-after-interference-negative-double')) {
    failures += 1;
    console.error('FAIL natural-heart takeout Double was admitted over artificial DONT 2H.');
  }
  const naturalMinorAfterDont = getApplicableCandidateCalls(evaluateUserCall(
    '3D', responseBoard, ['1NT', '2H'], defaultBiddingSystem));
  checks += 1;
  if (! naturalMinorAfterDont.some(({ rule }) =>
      rule.id === 'respond-after-dont-majors-natural-minor')) {
    failures += 1;
    console.error('FAIL natural 3D was lost over DONT 2H showing both majors.');
  }
  const { board: noSpadeStopperBoard } = makeRuleTestBoard({
    ...responseDeal, east: undefined, west: undefined,
    south: { S: 'T94', H: 'JT98', D: 'K98', C: 'KJ7' },
  });
  const noSpadeStopperCalls = getApplicableCandidateCalls(evaluateUserCall(
    '2NT', noSpadeStopperBoard, ['1NT', '2H'], defaultBiddingSystem));
  checks += 1;
  if (noSpadeStopperCalls.some(({ rule }) => rule.id === 'respond-after-dont-majors-2nt')) {
    failures += 1;
    console.error('FAIL natural 2NT over DONT 2H without stoppers in both majors.');
  }
  checks += 1;
  if (responseResult.ruleDiagnostics.some((result) =>
      result.rule.auctionContext?.partnerNaturalOneNt === true)) {
    failures += 1;
    console.error('FAIL uncontested Stayman/transfer rules remained active after 1NT-(2H).');
  }

  // These boundary hands are independent of the practice deal's explicitly constructed East.
  // Preserve their original North/West setting when testing alternate South holdings.
  const boundaryDeal = {
    ...advanceDeal,
    dealer: 'W' as const,
    west: { S: 'K72', H: 'A43', D: 'QJ974', C: 'K8' },
    north: { S: 'A96', H: 'KJ8', D: 'K65', C: 'AT76' },
    east: undefined,
  };
  const { board: advanceBoard } = makeRuleTestBoard({
    ...boundaryDeal,
    south: { S: 'Q85', H: 'T72', D: 'A83', C: 'Q542' },
  });
  const noStopperCandidates = getApplicableCandidateCalls(
    evaluateUserCall('2NT', advanceBoard, ['1D', '1NT', '2H'], defaultBiddingSystem));
  checks += 1;
  if (noStopperCandidates.some((candidate) =>
      candidate.rule.id === 'partner-of-1nt-after-interference-2nt')) {
    failures += 1;
    console.error('FAIL natural 2NT survived without a stopper in the interference suit.');
  }

  const unsupportedResult = evaluateUserCall('Pass', responseBoard, ['1NT', '3H'], defaultBiddingSystem);
  checks += 1;
  if (unsupportedResult.ruleDiagnostics.some((result) =>
      result.rule.auctionContext?.partnerNaturalOneNtAfterSuitInterference === true)) {
    failures += 1;
    console.error('FAIL shared 1NT-interference rules leaked into three-level interference.');
  }

  const { board: doubleBoard } = makeRuleTestBoard({
    ...boundaryDeal,
    south: { S: 'QJ85', H: 'T72', D: 'A32', C: 'Q43' },
  });
  const doubleCandidates = getApplicableCandidateCalls(
    evaluateUserCall('Double', doubleBoard, ['1D', '1NT', '2H'], defaultBiddingSystem));
  checks += 1;
  if (! doubleCandidates.some((candidate) =>
      candidate.rule.id === 'partner-of-1nt-after-interference-negative-double')) {
    failures += 1;
    console.error('FAIL negative Double did not work in the advancer 1NT-overcall context.');
  }

  console.log(`${failures} ***FAILURES***. 1NT-interference partner boundaries: ${checks} checks.`);
  console.log('  Verifies shared responder/advancer context, convention shutoff, stopper');
  console.log('  enforcement, negative Double, and the current two-level interference boundary.\n');
  return failures;
}

/// Natural 1NT interference explanations must use the evaluated strength, shape,
/// suit quality, stopper, and requested suits without changing the shared bidding rules.
function runOneNtInterferenceExplanationTests (): number {
  let failures = 0;
  const prefix = 'partner-of-1nt-after-interference-';
  // These focused hands test the current decision, not the preceding players' calls.
  // The other fixed hand keeps all boards legal without defining another practice deal.
  const make = (north: { S: string; H: string; D: string; C: string }) =>
    makeRuleTestBoard({ description: 'Natural 1NT interference explanation', dealer: 'E', north,
      south: { S: '654', H: '654', D: '654', C: '6543' },
      practiceAuction: ['1D', '1NT', '2H'] }).board;
  const invitation = { S: 'QJ87', H: 'K98', D: 'J92', C: 'Q92' };
  const seven = { S: 'QJ87', H: 'K98', D: 'J92', C: 'T92' };
  const cases: {
    name: string; hand: typeof invitation; call: Call; suffix: string;
    auction?: Call[]; range?: '15-17' | '16-18';
    failed?: 'hcp' | 'balanced' | 'suitLength' | 'topThreeHonors' | 'stopper';
    requestedSuits?: string[];
  }[] = [
    { name: 'weak Pass', hand: seven, call: 'Pass', suffix: 'pass' },
    { name: 'natural invitation', hand: invitation, call: '2NT', suffix: '2nt' },
    { name: 'natural game', hand: { S: 'KQ98', H: 'K98', D: 'A92', C: 'QJ2' },
      call: '3NT', suffix: '3nt' },
    { name: 'nonforcing natural suit', hand: { S: 'KQJ87', H: 'T98', D: 'A92', C: 'J2' },
      call: '2S', suffix: 'natural-suit-two-level' },
    { name: 'natural suit at three', hand: { S: 'J8', H: 'T98', D: 'A92', C: 'AKQJ2' },
      call: '3C', suffix: 'natural-suit-three-level' },
    { name: 'takeout Double requests spades', hand: { S: 'QJ87', H: 'T98', D: 'A92', C: 'KJ2' },
      call: 'Double', suffix: 'negative-double', requestedSuits: ['S'] },
    { name: 'takeout Double requests both majors',
      hand: { S: 'QJ87', H: 'KJ98', D: 'T92', C: 'Q2' },
      call: 'Double', suffix: 'negative-double', auction: ['1D', '1NT', '2C'],
      requestedSuits: ['S', 'H'] },
    { name: 'takeout Double requests both minors',
      hand: { S: 'T9', H: 'J98', D: 'AQ92', C: 'KJ82' },
      call: 'Double', suffix: 'negative-double', auction: ['1H', '1NT', '2S'],
      requestedSuits: ['D', 'C'] },
    { name: 'invitation needs a stopper', hand: { S: 'QJ87', H: 'T98', D: 'K92', C: 'QJ2' },
      call: '2NT', suffix: '2nt', failed: 'stopper' },
    { name: 'invitation needs balanced shape', hand: { S: 'QJ872', H: 'K9', D: 'J9', C: 'QT82' },
      call: '2NT', suffix: '2nt', failed: 'balanced' },
    { name: 'natural suit needs five cards', hand: { S: 'KQJ8', H: 'T98', D: 'A92', C: 'J92' },
      call: '2S', suffix: 'natural-suit-two-level', failed: 'suitLength' },
    { name: 'natural suit needs two of A/K/Q', hand: { S: 'KJ987', H: 'T98', D: 'A92', C: 'Q2' },
      call: '2S', suffix: 'natural-suit-two-level', failed: 'topThreeHonors' },
    { name: 'takeout Double needs four spades', hand: { S: 'QJ8', H: 'T987', D: 'A92', C: 'KJ2' },
      call: 'Double', suffix: 'negative-double', failed: 'suitLength' },
    { name: 'seven HCP does not invite under 15-17', hand: seven,
      call: '2NT', suffix: '2nt', failed: 'hcp' },
    { name: 'seven HCP invites under 16-18', hand: seven,
      call: '2NT', suffix: '2nt', range: '16-18' },
    { name: 'seven HCP exceeds weak Pass under 16-18', hand: seven,
      call: 'Pass', suffix: 'pass', range: '16-18', failed: 'hcp' },
  ];
  for (const test of cases) {
    const board = make(test.hand);
    const system = { ...defaultBiddingSystem, oneNtOpening: test.range ?? '15-17' };
    const result = evaluateUserCall(test.call, board, test.auction ?? ['1D', '1NT', '2H'], system);
    const id = prefix + test.suffix;
    const candidate = result.ruleDiagnostics.find((item) => item.rule.id === id)
      ?.candidates.find((item) => item.call === test.call);
    const requirements = candidate?.callEvidence?.requirements ?? [];
    const rule = result.userCallMatchingRules.find((item) => item.id === id);
    const positive = rule === undefined ? [] : getNotrumpPartnerResponseLines(result, rule);
    const negative = getNotrumpPartnerResponseFailureLines(result);
    const requested = requirements.flatMap((item) => item.kind === 'suitLength' ? [item.suit] : []);
    if (candidate?.ruleApplies !== (test.failed === undefined) ||
        (test.failed === undefined
          ? positive.length === 0 || !positive.some((line) => line.includes(`[${id}]`)) ||
            negative.length !== 0
          : !requirements.some((item) => item.kind === test.failed && !item.passed) ||
            negative.length === 0 || !negative.some((line) => line.includes(`[${id}]`))) ||
        (test.requestedSuits !== undefined && requested.join(',') !== test.requestedSuits.join(','))) {
      failures += 1;
      console.error(`FAIL natural 1NT interference explanation: ${test.name}.`);
    }
  }
  // The shared response path receives the same instruction after a natural DONT 2S,
  // while artificial DONT 2H and higher interference must not inherit these explanations.
  const responseBoard = { ...make(invitation), dealer: 'S' as const };
  const response = evaluateUserCall('2NT', responseBoard, ['1NT', '2S'], defaultBiddingSystem);
  const responseRule = response.userCallMatchingRules.find((rule) => rule.id === prefix + '2nt');
  if (responseRule === undefined || getNotrumpPartnerResponseLines(response, responseRule).length === 0) {
    failures += 1;
    console.error('FAIL shared natural 1NT interference response explanation.');
  }
  for (const auction of [['1NT', '2H'], ['1NT', '3S']] as Call[][]) {
    const result = evaluateUserCall('2NT', responseBoard, auction, defaultBiddingSystem);
    if (getNotrumpPartnerResponseFailureLines(result).length !== 0 ||
        result.applicableRules.some((rule) => getNotrumpPartnerResponseLines(result, rule).length > 0)) {
      failures += 1;
      console.error(`FAIL natural interference explanation leaked into ${auction.join(' ')}.`);
    }
  }
  console.log(`${failures} ***FAILURES***. Natural 1NT interference explanations: ${cases.length + 3} checks.\n`);
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
    description: strongNewSuit.description, dealer: 'W',
    practiceAuction: strongNewSuit.practiceAuction,
    north: strongNewSuit.east!,
    west: strongNewSuit.north,
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
  const clubNewSuit = ADVANCER_AFTER_JUMP_OVERCALL_TEST_DEALS.find((deal) =>
    deal.practiceAuction[3] === '3C')!;
  const weakHandBoard = makeRuleTestBoard({
    description: clubNewSuit.description, dealer: 'W',
    practiceAuction: clubNewSuit.practiceAuction,
    north: clubNewSuit.east!,
    west: clubNewSuit.north,
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
  console.log(`${failures} ***FAILURES***. Jump-overcall advancing boundaries: ${checks} checks.`);
  console.log('  Checks genuine jump overcalls, unsupported auctions and calls, and');
  console.log('  the strength and suit quality required for forcing new-suit advances.\n');
  return failures;
}

/// B4: an economical forcing new-suit advance after a preemptive jump overcall
/// requires one overcaller reply.  Test both levels, suit-fit quality, and leakage
/// into nearby non-jump or competitively interrupted auction contexts.
function runJumpOvercallForcingAdvanceRebidTests (): number {
  const repeatId = 'overcaller-rebid-jump-new-suit-repeat';
  const supportId = 'overcaller-rebid-jump-new-suit-support';
  const boundaryId = 'overcaller-rebid-jump-new-suit-boundary';
  type HandShape = { S: string; H: string; D: string; C: string };
  const cases: { name: string; auction: Call[]; north: HandShape; south: HandShape;
    call?: Call; id?: string; boundary?: boolean }[] = [
    {
      name: '2H over 1D; three low clubs need 3H return, not 4C',
      auction: ['1D', '2H', 'Pass', '3C', 'Pass'],
      north: { S: 'A8', H: 'KQJ976', D: '65', C: 'T95' },
      south: { S: 'Q64', H: 'T5', D: 'T98', C: 'AKQJ2' },
      call: '3H', id: repeatId,
    },
    {
      name: '2H over 1D; a three-card spade raise at three',
      auction: ['1D', '2H', 'Pass', '2S', 'Pass'],
      north: { S: 'K82', H: 'KQJ976', D: '65', C: '74' },
      south: { S: 'AQJ76', H: 'T5', D: 'A84', C: 'K63' },
      call: '3S', id: supportId,
    },
    {
      name: '2H over 1D; Kxx permits four-level support',
      auction: ['1D', '2H', 'Pass', '3C', 'Pass'],
      north: { S: 'T8', H: 'KQJ976', D: '65', C: 'K95' },
      south: { S: 'AQ6', H: 'T5', D: 'A84', C: 'AQJ62' },
      call: '4C', id: supportId,
    },
    {
      name: '2H over 1D; four small clubs provide playing strength for four',
      auction: ['1D', '2H', 'Pass', '3C', 'Pass'],
      north: { S: '8', H: 'KQJ976', D: '65', C: 'T952' },
      south: { S: 'AQ6', H: 'T5', D: 'A84', C: 'AKQJ6' },
      call: '4C', id: supportId,
    },
    {
      name: '3C over 1D; return to seven-card clubs at four',
      auction: ['1D', '3C', 'Pass', '3H', 'Pass'],
      north: { S: 'T4', H: '86', D: '52', C: 'KQJT976' },
      south: { S: 'A963', H: 'AKQJ9', D: 'K83', C: 'A' },
      call: '4C', id: repeatId,
    },
    {
      name: '3C over 1D; three-card Axx hearts permit 4H',
      auction: ['1D', '3C', 'Pass', '3H', 'Pass'],
      north: { S: '4', H: 'A86', D: '52', C: 'KQT9876' },
      south: { S: 'K963', H: 'KQJT9', D: 'K83', C: 'A' },
      call: '4H', id: supportId,
    },
    {
      name: '2H over 1D; too few hearts for the described preempt',
      auction: ['1D', '2H', 'Pass', '3C', 'Pass'],
      north: { S: 'AQ8', H: 'KQJ97', D: '65', C: 'T95' },
      south: { S: 'T64', H: 'T5', D: 'T98', C: 'AKQJ2' },
      boundary: true,
    },
    {
      name: 'not a jump: 2H over 1S',
      auction: ['1S', '2H', 'Pass', '3C', 'Pass'],
      north: { S: 'A8', H: 'KQJ976', D: '65', C: 'T95' },
      south: { S: 'Q64', H: 'T5', D: 'T98', C: 'AKQJ2' },
    },
    {
      name: 'responder interfered instead of passing',
      auction: ['1D', '2H', '2S', '3C', 'Pass'],
      north: { S: 'A8', H: 'KQJ976', D: '65', C: 'T95' },
      south: { S: 'Q64', H: 'T5', D: 'T98', C: 'AKQJ2' },
    },
    {
      name: 'advancer jumped beyond the economical new suit',
      auction: ['1D', '2H', 'Pass', '4C', 'Pass'],
      north: { S: 'A8', H: 'KQJ976', D: '65', C: 'T95' },
      south: { S: 'Q64', H: 'T5', D: 'T98', C: 'AKQJ2' },
    },
    {
      name: 'advancer cuebid opener suit rather than a natural new suit',
      auction: ['1D', '2H', 'Pass', '3D', 'Pass'],
      north: { S: 'A8', H: 'KQJ976', D: '65', C: 'T95' },
      south: { S: 'Q64', H: 'T5', D: 'T98', C: 'AKQJ2' },
    },
    {
      name: 'four-level jump overcall not included in this family',
      auction: ['1C', '4S', 'Pass', '5D', 'Pass'],
      north: { S: 'KQJT9876', H: '86', D: '52', C: '4' },
      south: { S: 'A', H: 'AKQJ9', D: 'KQJ98', C: 'A7' },
    },
  ];
  let failures = 0;
  for (const test of cases) {
    const { board } = makeRuleTestBoard({ description: test.name, dealer: 'W',
      practiceAuction: test.auction, north: test.north, south: test.south });
    // The positive rebid examples must begin with an advance supported by the
    // original forcing-new-suit rule, not merely a syntactically plausible auction.
    if (test.call !== undefined) {
      const firstAdvance = test.auction[3];
      const advance = getApplicableCandidateCalls(evaluateUserCall(firstAdvance, board,
        test.auction.slice(0, 3), defaultBiddingSystem));
      if (!advance.some(({ call, rule }) => call === firstAdvance &&
          rule.id === 'advance-jump-overcall-forcing-new-suit')) {
        failures += 1;
        console.error(`FAIL B4 ${test.name}: forcing new-suit advance did not qualify.`);
      }
    }
    const result = evaluateUserCall(test.call ?? 'Pass', board, test.auction, defaultBiddingSystem);
    const matches = getApplicableCandidateCalls(result).filter(({ rule }) =>
      rule.id === repeatId || rule.id === supportId);
    const boundary = result.applicableRules.some(({ id }) => id === boundaryId);
    const correct = test.call === undefined ? matches.length === 0 :
      matches.length === 1 && matches[0]?.call === test.call && matches[0]?.rule.id === test.id;
    if (!correct || boundary !== (test.boundary === true)) {
      failures += 1;
      console.error(`FAIL B4 ${test.name}: expected ${test.call ?? '-'} (${test.id ?? '-'}), ` +
        `got ${formatCandidates(matches)}, boundary ${boundary}.`);
    }
    if (test.call !== undefined || test.boundary) {
      const status = getBiddingTurnStatus(board, test.auction, defaultBiddingSystem);
      const kind = test.boundary ? 'scopeBoundary' : 'supported';
      if (status.kind !== kind) {
        failures += 1;
        console.error(`FAIL B4 ${test.name}: expected status ${kind}, got ${status.kind}.`);
      }
      if (getApplicableCandidateCalls(result).some(({ call }) => call === 'Pass')) {
        failures += 1;
        console.error(`FAIL B4 ${test.name}: Pass cannot satisfy advancer's force.`);
      }
    }
  }
  console.log(`${failures} ***FAILURES***. B4 jump overcaller forcing-advance replies: ` +
              `${cases.length} constructed-hand and auction-context checks.\n`);
  return failures;
}

/// Test initial DONT instructional evidence for each supported treatment and representative
/// near misses. Use the saved hands without changing the original practice-deal corpus.
function runDontInitialExplanationTests (): number {
  let checks = 0;
  let failures = 0;
  const deals = DONT_1NT_DEFENSE_TEST_DEALS;
  for (const deal of deals) {
    const expected = deal.expectedOvercallCalls?.[0];
    if (expected === undefined || expected.call === 'Pass') continue;
    const board = makeRuleTestBoard(deal).board;
    const result = evaluateUserCall(expected.call, board, ['1NT'], defaultBiddingSystem);
    const rule = result.userCallMatchingRules.find((item) => expected.ruleIds.includes(item.id));
    const candidate = result.ruleDiagnostics.find(({ rule: item }) => item.id === rule?.id)
      ?.candidates.find(({ call }) => call === expected.call);
    const positive = rule === undefined ? null : getDontInitialSupportLine(result, rule);
    checks += 1;
    if (positive === null || candidate?.callEvidence?.dontInitial === undefined ||
        getDontInitialFailureLines(result).length !== 0) {
      failures += 1;
      console.error(`FAIL initial DONT qualifying explanation: ${deal.description}`);
    }
  }

  const mistaken: { dealIndex: number; call: Call }[] = [
    { dealIndex: 1, call: '2H' },
    { dealIndex: 2, call: 'Double' },
    { dealIndex: 4, call: '2C' },
    { dealIndex: 5, call: '2D' },
    { dealIndex: 6, call: 'Double' },
  ];
  for (const test of mistaken) {
    const deal = deals[test.dealIndex];
    if (deal === undefined) continue;
    const board = makeRuleTestBoard(deal).board;
    const result = evaluateUserCall(test.call, board, ['1NT'], defaultBiddingSystem);
    const negative = getDontInitialFailureLines(result);
    checks += 1;
    if (result.userCallMatchingRules.length > 0 || negative.length === 0) {
      failures += 1;
      console.error(`FAIL initial DONT mistaken ${test.call} with ${deal.description}`);
    }
  }

  const synthetic: { name: string; north: RuleTestDeal['north']; call: Call }[] = [
    { name: '6 HCP but good six-card hearts', call: 'Double',
      north: { S: '84', H: 'KQJT96', D: '852', C: '73' } },
    { name: '4-4 two-suit shape', call: '2C',
      north: { S: '82', H: 'KQJ9', D: '752', C: 'AT98' } },
    { name: 'Six hearts with inadequate honor quality', call: 'Double',
      north: { S: '84', H: '976432', D: 'AKQ', C: '73' } },
    { name: 'Five clubs and four hearts, weak club honors', call: '2C',
      north: { S: '84', H: 'A765', D: 'KQ', C: 'J9876' } },
  ];
  for (const test of synthetic) {
    // Construct a separate, non-overlapping second hand; these are synthetic tests,
    // not additional saved practice deals.
    const unused = (suit: 'S' | 'H' | 'D' | 'C', count: number): string =>
      'AKQJT98765432'.split('').filter((rank) => !test.north[suit].includes(rank))
        .slice(0, count).join('');
    const board = makeRuleTestBoard({
      description: test.name, dealer: 'W', practiceAuction: ['1NT', 'Pass'],
      north: test.north,
      south: { S: unused('S', 4), H: unused('H', 3),
               D: unused('D', 3), C: unused('C', 3) },
    }).board;
    const result = evaluateUserCall(test.call, board, ['1NT'], defaultBiddingSystem);
    const lines = getDontInitialFailureLines(result);
    checks += 1;
    if (result.userCallMatchingRules.length !== 0 || lines.length === 0) {
      failures += 1;
      console.error(`FAIL DONT initial explanation boundary: ${test.name}`);
    }
  }

  const sample = deals[1];
  if (sample !== undefined) {
    const board = makeRuleTestBoard(sample).board;
    const unrelated = evaluateUserCall('2H', board, ['1D'], defaultBiddingSystem);
    checks += 1;
    if (getDontInitialFailureLines(unrelated).length !== 0 ||
        unrelated.userCallMatchingRules.some((rule) =>
          getDontInitialSupportLine(unrelated, rule) !== null)) {
      failures += 1;
      console.error('FAIL initial DONT explanation leaked into natural suit defense.');
    }
  }
  console.log(`${failures} ***FAILURES***. DONT initial explanations: ${checks} checks.\n`);
  return failures;
}

/// Protect the hand-specific explanations for natural suit and 2NT defenses to weak twos.
/// What-if hands are separate from saved practice deals and have no duplicate cards.
function runWeakTwoOvercallExplanationTests (): number {
  let checks = 0;
  let failures = 0;
  const expected = WEAK_TWO_DEFENSE_TEST_DEALS;
  for (const index of [1, 2, 3, 6]) {
    const deal = expected[index];
    if (deal === undefined) continue;
    const recorded = deal.expectedOvercallCalls?.[0];
    if (recorded === undefined) continue;
    const result = evaluateUserCall(recorded.call, makeRuleTestBoard(deal).board,
      deal.practiceAuction.slice(0, 1), defaultBiddingSystem);
    const rule = result.userCallMatchingRules.find(({ id }) => recorded.ruleIds.includes(id));
    const line = rule === undefined ? null : getWeakTwoOvercallSupportLine(result, rule);
    checks += 1;
    if (line === null || line.length === 0 ||
        getWeakTwoOvercallFailureLines(result).length !== 0) {
      failures += 1;
      console.error(`FAIL weak-two overcall positive explanation: ${deal.description}`);
    }
  }

  const original = expected[1];
  const weakPass = expected[0];
  if (original !== undefined && weakPass !== undefined) {
    const hand = makeRuleTestBoard(original).board;
    const jump = evaluateUserCall('3H', hand, ['2D'], defaultBiddingSystem);
    const jumpLines = getWeakTwoOvercallFailureLines(jump);
    checks += 1;
    const economical = evaluateUserCall('2H', hand, ['2D'], defaultBiddingSystem);
    if (jumpLines.length === 0 || jump.userCallMatchingRules.length !== 0 ||
        !economical.userCallMatchingRules.some(({ id }) =>
          id === 'overcall-weak-two-natural-suit-at-two-level')) {
      failures++;
      console.error('FAIL weak-two jump explanation must mention qualified non-jump 2H.');
    }
    const missed = evaluateUserCall('2H', makeRuleTestBoard(weakPass).board,
      ['2D'], defaultBiddingSystem);
    checks += 1;
    if (missed.userCallMatchingRules.length !== 0 ||
        getWeakTwoOvercallFailureLines(missed).length === 0) {
      failures++;
      console.error('FAIL weak-two deficient-length explanation.');
    }
  }

  // Construct a valid complete board without introducing practice-deal edits.
  const build = (name: string, hand: { S: string; H: string; D: string; C: string }) => {
    const ranks = 'AKQJT98765432';
    const unused = (suit: 'S' | 'H' | 'D' | 'C', count: number): string =>
      [...ranks].filter((rank) => !hand[suit].includes(rank)).slice(0, count).join('');
    return makeRuleTestBoard({
      description: name, dealer: 'W', practiceAuction: ['2D', 'Pass'],
      north: hand,
      south: { S: unused('S', 4), H: unused('H', 3),
               D: unused('D', 3), C: unused('C', 3) },
    }).board;
  };
  const cases: { name: string; hand: { S: string; H: string; D: string; C: string };
                 auction: Call[]; bid: Call }[] = [
    { name: 'good hearts below 13 points', bid: '2H', auction: ['2D'],
      hand: { S: 'A7', H: 'KQJ98', D: '63', C: 'T976' } },
    { name: 'strong overcaller should double', bid: '2H', auction: ['2D'],
      hand: { S: 'AK', H: 'AKQJT', D: 'Q7', C: 'T982' } },
    { name: 'weak suit honors', bid: '2H', auction: ['2D'],
      hand: { S: 'AQ', H: 'J9876', D: 'K74', C: 'T52' } },
    { name: 'three-level suit too short', bid: '3H', auction: ['2S'],
      hand: { S: 'A4', H: 'AKJT9', D: 'Q76', C: '982' } },
    { name: 'natural 2NT lacks stopper', bid: '2NT', auction: ['2D'],
      hand: { S: 'AKJ4', H: 'Q96', D: '754', C: 'AJ6' } },
    { name: 'natural 2NT needs balanced distribution', bid: '2NT', auction: ['2D'],
      hand: { S: 'AKJ84', H: 'Q976', D: 'A4', C: 'J7' } },
    { name: 'natural 2NT below range', bid: '2NT', auction: ['2D'],
      hand: { S: 'KJ84', H: 'Q96', D: 'A54', C: 'J76' } },
  ];
  for (const c of cases) {
    const result = evaluateUserCall(c.bid, build(c.name, c.hand), c.auction,
      defaultBiddingSystem);
    const lines = getWeakTwoOvercallFailureLines(result);
    checks++;
    if (result.userCallMatchingRules.length !== 0 || lines.length === 0) {
      failures++;
      console.error(`FAIL weak-two overcall explanation: ${c.name}: ${lines.join(' ')}`);
    }
  }
  const unrelated = evaluateUserCall('2H',
    makeRuleTestBoard(expected[1]!).board, ['1S'], defaultBiddingSystem);
  checks++;
  if (getWeakTwoOvercallFailureLines(unrelated).length !== 0 ||
      unrelated.userCallMatchingRules.some((rule) =>
        getWeakTwoOvercallSupportLine(unrelated, rule) !== null)) {
    failures++;
    console.error('FAIL weak-two explanation leaked into one-level opening defenses.');
  }
  console.log(`${failures} ***FAILURES***. Weak-two direct-overcall explanations: ${checks} checks.\n`);
  return failures;
}

/// DONT checks protect the family boundary rather than duplicating every practice deal.
/// The convention is direct-seat only here, requires the modeled shape/strength, and stops when
/// responder or opener competes instead of passing through the basic relay.
function runDontBoundaryTests (): number {
  const seed = DONT_1NT_DEFENSE_TEST_DEALS[0];
  if (seed === undefined) {
    console.error('FAIL DONT boundaries need a practice deal.');
    return 1;
  }
  const { board } = makeRuleTestBoard(seed);
  let checks = 0;
  let failures = 0;

  checks += 1;
  if (getNextBiddingRuleStage(board.dealer, ['1NT', 'Double', 'Pass', '2C', 'Pass']) !==
      'overcallerRebid') {
    failures += 1;
    console.error('FAIL DONT relay should reach the overcaller-rebid stage.');
  }

  checks += 1;
  const suitOpeningCandidates = getApplicableCandidateCalls(evaluateUserCall(
    'Double', board, ['1D'], defaultBiddingSystem));
  if (suitOpeningCandidates.some(({ rule }) => rule.id.startsWith('overcall-dont-'))) {
    failures += 1;
    console.error('FAIL DONT direct rules leaked into a suit opening.');
  }

  const { board: weakBoard } = makeRuleTestBoard({
    description: 'Six-card DONT suit below the app strength floor.',
    dealer: 'W', practiceAuction: ['1NT', 'Pass'],
    north: { S: '84', H: 'KJT986', D: 'Q52', C: '73' },
    south: { S: 'T975', H: '753', D: '864', C: 'T65' },
  });
  checks += 1;
  const weakCandidates = getApplicableCandidateCalls(evaluateUserCall(
    'Double', weakBoard, ['1NT'], defaultBiddingSystem));
  if (weakCandidates.some(({ rule }) => rule.id === 'overcall-dont-single-suit-double')) {
    failures += 1;
    console.error('FAIL DONT one-suit Double survived below 7 HCP.');
  }

  const { board: fourFourBoard } = makeRuleTestBoard({
    description: 'Four-four shape is below the modeled DONT two-suit minimum.',
    dealer: 'W', practiceAuction: ['1NT', 'Pass'],
    north: { S: '82', H: 'KQJ9', D: '752', C: 'AT98' },
    south: { S: 'T975', H: '753', D: 'Q84', C: 'K65' },
  });
  checks += 1;
  const fourFourCandidates = getApplicableCandidateCalls(evaluateUserCall(
    '2C', fourFourBoard, ['1NT'], defaultBiddingSystem));
  if (fourFourCandidates.some(({ rule }) => rule.id === 'overcall-dont-clubs-plus-higher')) {
    failures += 1;
    console.error('FAIL DONT 2C survived with only 4-4 shape.');
  }

  checks += 1;
  const interferenceCandidates = getApplicableCandidateCalls(evaluateUserCall(
    '2C', board, ['1NT', 'Double', '2C'], defaultBiddingSystem));
  if (interferenceCandidates.some(({ rule }) => rule.id === 'advance-dont-pass-or-correct')) {
    failures += 1;
    console.error('FAIL DONT advance survived responder interference.');
  }

  checks += 1;
  const openerCompetes = getApplicableCandidateCalls(evaluateUserCall(
    '2H', board, ['1NT', 'Double', 'Pass', '2C', '2D'], defaultBiddingSystem));
  if (openerCompetes.some(({ rule }) => rule.id === 'overcaller-rebid-dont-pass-or-correct')) {
    failures += 1;
    console.error('FAIL DONT relay correction survived opener competition.');
  }

  console.log(`${failures} ***FAILURES***. DONT boundaries: ${checks} checks.`);
  console.log('  Keeps compact DONT in the direct strong-1NT auction, enforces the modeled');
  console.log('  shape/strength floor, and stops the pass-or-correct path after interference.\n');
  return failures;
}

/// Guard against future auction-matching changes leaking the natural 1NT responder-rebid rules
/// into minor responses, suit rebids, or artificial Stayman continuations.
function runResponderRebidContextTests (): number {
  const seed = RULE_TEST_DEAL_BUCKETS.find((bucket) => bucket.id === 'responder-rebid-after-1nt')
    ?.deals[0];
  if (seed === undefined) return 1;
  const { board } = makeRuleTestBoard(seed);
  const cases: { auction: Call[]; shouldOfferPass: boolean }[] = [
    { auction: ['1C', 'Pass', '1H', 'Pass', '1NT', 'Pass'], shouldOfferPass: true },
    { auction: ['1C', 'Pass', '1D', 'Pass', '1NT', 'Pass'], shouldOfferPass: false },
    { auction: ['1C', 'Pass', '1H', 'Pass', '2C', 'Pass'], shouldOfferPass: false },
    { auction: ['1NT', 'Pass', '2C', 'Pass', '2D', 'Pass'], shouldOfferPass: false },
  ];
  let failures = 0;
  for (const testCase of cases) {
    const candidates = getApplicableCandidateCalls(evaluateUserCall(
      'Pass', board, testCase.auction, defaultBiddingSystem));
    const offered = candidates.some(({call, rule}) =>
      call === 'Pass' && rule.id === 'responder-rebid-pass-after-minimum-1nt');
    if (offered !== testCase.shouldOfferPass ||
        (! testCase.shouldOfferPass && candidates.some(({rule}) =>
          rule.id.includes('after-minimum-1nt')))) {
      failures += 1;
      console.error(`FAIL responder rebid context: ${testCase.auction.join(' ')}`);
    }
  }
  console.log(`${failures} ***FAILURES***. Responder rebid context: ${cases.length} checks.`);
  console.log('  Keeps the natural 1NT-rebid rules out of minor responses,');
  console.log('  opener suit rebids, and artificial Stayman auctions.\n');
  return failures;
}

/// Ensure a student's different call follows the recorded lesson, not a divergent auction,
/// while matching calls need no correction and practice completion waits for the final call.
/// A natural raise must match responder's original one-level major, not merely be a bid at
/// the right level.  In particular, opener's new suit must not look like a raise.
function runResponderMajorRaiseContextTests (): number {
  const seed = RULE_TEST_DEAL_BUCKETS.find((bucket) => bucket.id ===
    'responder-rebid-after-major-raise')?.deals[0];
  if (seed === undefined) return 1;
  const { board } = makeRuleTestBoard(seed);
  const cases: { auction: Call[]; expected: boolean }[] = [
    { auction: ['1C', 'Pass', '1H', 'Pass', '2H', 'Pass'], expected: true },
    { auction: ['1C', 'Pass', '1H', 'Pass', '2S', 'Pass'], expected: false },
    { auction: ['1C', 'Pass', '1S', 'Pass', '2H', 'Pass'], expected: false },
    { auction: ['1C', 'Pass', '1H', 'Pass', '3H', 'Pass'], expected: false },
  ];
  let failures = 0;
  for (const testCase of cases) {
    const candidates = getApplicableCandidateCalls(evaluateUserCall(
      'Pass', board, testCase.auction, defaultBiddingSystem));
    const pass = candidates.some(({ call, rule }) => call === 'Pass' &&
      rule.id === 'responder-rebid-pass-after-simple-major-raise');
    if (pass !== testCase.expected) {
      failures += 1;
      console.error(`FAIL responder major raise context: ${testCase.auction.join(' ')}.`);
    }
  }
  // Avoid an automatic game or Pass when responder has enough strength to investigate slam.
  const slamInterestCases: { description: string; auction: Call[]; rejected: Call;
                             north: RuleTestDeal['north']; south: RuleTestDeal['south'] }[] = [
    {
      description: 'Fifteen support points after an invitational spade raise need slam guidance.',
      auction: ['1H', 'Pass', '1S', 'Pass', '3S', 'Pass'], rejected: '4S',
      north: { S: 'AJ84', H: 'QJ875', D: 'KJ', C: 'A3' },
      south: { S: 'KQ62', H: 'AK3', D: 'Q82', C: 'J94' },
    },
    {
      description: 'Thirteen support points after a direct heart game raise must not auto-Pass.',
      auction: ['1D', 'Pass', '1H', 'Pass', '4H', 'Pass'], rejected: 'Pass',
      north: { S: 'AQ3', H: 'AK84', D: 'AJ73', C: 'Q5' },
      south: { S: 'KJ9', H: 'QJ76', D: 'K82', C: 'K93' },
    },
  ];
  for (const testCase of slamInterestCases) {
    const { board: strongBoard } = makeRuleTestBoard({
      description: testCase.description, practiceAuction: testCase.auction,
      north: testCase.north, south: testCase.south,
    });
    const result = evaluateUserCall(testCase.rejected, strongBoard, testCase.auction,
                                    defaultBiddingSystem);
    if (getApplicableCandidateCalls(result).some(({ call }) => call === testCase.rejected) ||
        ! result.applicableRules.some((rule) => rule.kind === 'scopeBoundary')) {
      failures += 1;
      console.error(`FAIL responder major-raise slam guidance: ${testCase.description}`);
    }
  }
  console.log(`${failures} ***FAILURES***. Responder major-raise context: ${cases.length} context and ` +
              `${slamInterestCases.length} strong-hand checks.`);
  console.log('  Requires opener to raise responder\'s original major, not a new suit;');
  console.log('  keeps slam-oriented hands out of automatic game or Pass recommendations.\n');
  return failures;
}

/// A minimum repeated opening suit may follow a one-level natural new-suit response,
/// but not 1NT, a two-level forcing response, a new opener suit, or a jump rebid.
/// The original heart/spade example must still retain its ranked invitational alternatives.
function runResponderRepeatedSuitContextTests (): number {
  const seed = RULE_TEST_DEAL_BUCKETS.find((bucket) => bucket.id ===
    'responder-rebid-after-repeated-hearts')?.deals[3];
  if (seed === undefined) return 1;
  const { board } = makeRuleTestBoard(seed);
  const cases: { auction: Call[]; expected: boolean; heartAlternative?: boolean }[] = [
    { auction: ['1H', 'Pass', '1S', 'Pass', '2H', 'Pass'], expected: true,
      heartAlternative: true },
    { auction: ['1C', 'Pass', '1S', 'Pass', '2C', 'Pass'], expected: true },
    { auction: ['1D', 'Pass', '1S', 'Pass', '2D', 'Pass'], expected: true },
    { auction: ['1H', 'Pass', '1S', 'Pass', '2C', 'Pass'], expected: false },
    { auction: ['1H', 'Pass', '1S', 'Pass', '3H', 'Pass'], expected: false },
    { auction: ['1S', 'Pass', '1NT', 'Pass', '2S', 'Pass'], expected: false },
    { auction: ['1S', 'Pass', '2H', 'Pass', '2S', 'Pass'], expected: false },
    { auction: ['1H', 'Pass', '1S', 'Pass', '2H', 'Double'], expected: false },
  ];
  let failures = 0;
  for (const testCase of cases) {
    const candidates = getApplicableCandidateCalls(evaluateUserCall(
      '3S', board, testCase.auction, defaultBiddingSystem));
    const invitation = candidates.some(({ call, rule }) => call === '3S' &&
      rule.id === 'responder-rebid-three-original-suit-after-minimum-repeat');
    if (invitation !== testCase.expected) {
      failures += 1;
      console.error(`FAIL responder repeated suit context: ${testCase.auction.join(' ')}.`);
    }
    if (testCase.heartAlternative) {
      const spadeIndex = candidates.findIndex(({ call }) => call === '3S');
      const heartIndex = candidates.findIndex(({ call }) => call === '3H');
      if (spadeIndex < 0 || heartIndex < 0 || spadeIndex >= heartIndex) {
        failures += 1;
        console.error('FAIL repeated-heart invitations must retain the heart alternative.');
      }
    }
  }
  console.log(`${failures} ***FAILURES***. Responder repeated suit: ${cases.length} context checks and one ` +
              `alternative-order check.`);
  console.log('  Shares natural minimum suit repetitions across the one-level new-suit auctions,');
  console.log('  without admitting forcing responses, other rebids, or opponent interference.\n');
  return failures;
}

/// The same economical second-suit treatment must work for more than one printed auction,
/// but never after a reverse, jump, forcing response, suit repetition, or active interference.
function runResponderSecondSuitContextTests (): number {
  const seed = RULE_TEST_DEAL_BUCKETS.find((bucket) => bucket.id ===
    'responder-rebid-after-economical-second-suit')?.deals[0];
  if (seed === undefined) return 1;
  const { board } = makeRuleTestBoard(seed);
  const cases: { auction: Call[]; expected: boolean }[] = [
    { auction: ['1C', 'Pass', '1H', 'Pass', '1S', 'Pass'], expected: true },
    { auction: ['1H', 'Pass', '1S', 'Pass', '2C', 'Pass'], expected: true },
    { auction: ['1C', 'Pass', '1H', 'Pass', '2D', 'Pass'], expected: false },
    { auction: ['1C', 'Pass', '1H', 'Pass', '2S', 'Pass'], expected: false },
    { auction: ['1H', 'Pass', '1S', 'Pass', '2H', 'Pass'], expected: false },
    { auction: ['1H', 'Pass', '1NT', 'Pass', '2C', 'Pass'], expected: false },
    { auction: ['1H', 'Pass', '2C', 'Pass', '2D', 'Pass'], expected: false },
    { auction: ['1C', 'Pass', '1H', 'Double', '1S', 'Pass'], expected: false },
  ];
  let failures = 0;
  for (const testCase of cases) {
    const result = evaluateUserCall('Pass', board, testCase.auction, defaultBiddingSystem);
    const recognized = result.applicableRules.some((rule) =>
      rule.id === 'responder-rebid-boundary-after-economical-second-suit');
    const actual = recognized || getApplicableCandidateCalls(result).some(({ rule }) =>
      rule.id.startsWith('responder-rebid-economical-'));
    if (actual !== testCase.expected) {
      failures += 1;
      console.error(`FAIL economical second-suit context: ${testCase.auction.join(' ')}.`);
    }
  }
  console.log(`${failures} ***FAILURES***. Responder economical second suit: ${cases.length} context checks.`);
  console.log('  Shares genuine natural economical second suits while excluding reverses,');
  console.log('  jumps, forcing responses, repeated suits, and opponent competition.\n');
  return failures;
}

/// Strong opener second suits must remain separate from ordinary economical actions. A reverse
/// requires a response without promising game; a strong natural jump shift forces game.
function runResponderStrongSecondSuitContextTests (): number {
  const seed = RULE_TEST_DEAL_BUCKETS.find((bucket) => bucket.id ===
    'responder-rebid-after-strong-second-suit')?.deals[0];
  if (seed === undefined) return 1;
  const { board } = makeRuleTestBoard(seed);
  const cases: { auction: Call[]; expected: 'reverse' | 'jumpShift' | null }[] = [
    { auction: ['1C', 'Pass', '1S', 'Pass', '2H', 'Pass'], expected: 'reverse' },
    { auction: ['1C', 'Pass', '1H', 'Pass', '2S', 'Pass'], expected: 'jumpShift' },
    { auction: ['1H', 'Pass', '1S', 'Pass', '3C', 'Pass'], expected: 'jumpShift' },
    { auction: ['1H', 'Pass', '1S', 'Pass', '2C', 'Pass'], expected: null },
    { auction: ['1C', 'Pass', '1S', 'Pass', '3H', 'Pass'], expected: null },
    { auction: ['1S', 'Pass', '1NT', 'Pass', '2H', 'Pass'], expected: null },
    { auction: ['1S', 'Pass', '2C', 'Pass', '2H', 'Pass'], expected: null },
    { auction: ['1H', 'Pass', '1S', 'Pass', '2H', 'Pass'], expected: null },
    { auction: ['1C', 'Pass', '1S', 'Double', '2H', 'Pass'], expected: null },
  ];
  let failures = 0;
  for (const testCase of cases) {
    const context = makeRuleEvalContext(board, testCase.auction);
    const family = getResponderStrongSecondSuit(context)?.kind ?? null;
    const result = evaluateUserCall('Pass', board, testCase.auction, defaultBiddingSystem);
    const boundaries = result.applicableRules.filter((rule) =>
      rule.id === 'responder-rebid-boundary-after-reverse' ||
      rule.id === 'responder-rebid-boundary-after-strong-opener-jump-shift');
    const hasConcreteStrongCall = getApplicableCandidateCalls(result).some(({ rule }) =>
      rule.id === 'responder-rebid-strong-second-suit-major-game' ||
      rule.id === 'responder-rebid-strong-second-suit-3nt');
    const expectedBoundary = hasConcreteStrongCall ? null :
      testCase.expected === 'reverse' ? 'responder-rebid-boundary-after-reverse' :
      testCase.expected === 'jumpShift' ?
      'responder-rebid-boundary-after-strong-opener-jump-shift' : null;
    const passOffered = getApplicableCandidateCalls(result).some(({ call }) => call === 'Pass');
    if (family !== testCase.expected || (testCase.expected !== null && passOffered) ||
        (expectedBoundary === null ? boundaries.length !== 0 :
         boundaries.length !== 1 || boundaries[0].id !== expectedBoundary)) {
      failures += 1;
      console.error(`FAIL strong second suit context: ${testCase.auction.join(' ')}` +
                    ` family ${family} expected ${testCase.expected} pass ${passOffered} ` +
                    `boundaries ${boundaries.map((rule) => rule.id).join(',')}.`);
    }
  }
  // With no reliable game choice, retain the force and explain it instead of offering Pass.
  const weakHands: { auction: Call[]; expectedBoundary: string;
                     north: RuleTestDeal['north']; south: RuleTestDeal['south'] }[] = [
    { auction: ['1C', 'Pass', '1S', 'Pass', '2H', 'Pass'],
      expectedBoundary: 'responder-rebid-boundary-after-reverse',
      north: seed.north, south: { S: 'KJ74', H: '85', D: 'Q652', C: '985' } },
    { auction: ['1C', 'Pass', '1H', 'Pass', '2S', 'Pass'],
      expectedBoundary: 'responder-rebid-boundary-after-strong-opener-jump-shift',
      north: { S: 'AKJ7', H: '85', D: 'K9', C: 'AQJ64' },
      south: { S: '8', H: 'KQT76', D: 'Q632', C: '975' } },
  ];
  for (const testCase of weakHands) {
    const { board: weakBoard } = makeRuleTestBoard({
      description: 'Weak forcing-continuation context check', practiceAuction: testCase.auction,
      north: testCase.north, south: testCase.south,
    });
    const result = evaluateUserCall('Pass', weakBoard, testCase.auction, defaultBiddingSystem);
    if (getApplicableCandidateCalls(result).some(({ call }) => call === 'Pass') ||
        ! result.applicableRules.some(({ id }) => id === testCase.expectedBoundary)) {
      failures += 1;
      console.error(`FAIL weak forcing-continuation guidance: ${testCase.auction.join(' ')}.`);
    }
  }
  console.log(`${failures} ***FAILURES***. Responder strong second suit: ` +
              `${cases.length} context and ${weakHands.length} guidance checks.`);
  console.log('  Separates a one-round-forcing reverse from a game-forcing jump shift,');
  console.log('  excludes unrelated auctions, and never invents a Pass after either force.\n');
  return failures;
}

/// Strong 2NT continuations belong only after a natural one-level new-suit response.
/// A different initial response or active interference must not inherit these natural
/// signoffs; exceptional responder strength needs guidance rather than an automatic game.
function runResponderStrongTwoNtContextTests (): number {
  const seed = RULE_TEST_DEAL_BUCKETS.find((bucket) => bucket.id ===
    'responder-rebid-after-strong-2nt')?.deals[1];
  if (seed === undefined) return 1;
  const { board } = makeRuleTestBoard(seed);
  const cases: { auction: Call[]; expected: boolean }[] = [
    { auction: ['1C', 'Pass', '1H', 'Pass', '2NT', 'Pass'], expected: true },
    { auction: ['1C', 'Pass', '1D', 'Pass', '2NT', 'Pass'], expected: true },
    { auction: ['1C', 'Pass', '1NT', 'Pass', '2NT', 'Pass'], expected: false },
    { auction: ['1C', 'Pass', '2D', 'Pass', '2NT', 'Pass'], expected: false },
    { auction: ['1C', 'Pass', '1H', 'Pass', '1NT', 'Pass'], expected: false },
    { auction: ['1C', 'Pass', '1H', 'Double', '2NT', 'Pass'], expected: false },
  ];
  let failures = 0;
  for (const testCase of cases) {
    const result = evaluateUserCall('3NT', board, testCase.auction, defaultBiddingSystem);
    const recognized = getApplicableCandidateCalls(result).some(({ rule }) =>
      rule.id === 'responder-rebid-3nt-after-strong-2nt');
    if (recognized !== testCase.expected) {
      failures += 1;
      console.error(`FAIL responder strong 2NT context: ${testCase.auction.join(' ')}.`);
    }
  }
  const { board: strongBoard } = makeRuleTestBoard({
    description: 'Exceptional responder strength after opener rebids 2NT',
    practiceAuction: ['1C', 'Pass', '1H', 'Pass', '2NT', 'Pass'],
    north: seed.north,
    south: { S: 'KJ8', H: 'AQJT9', D: 'A72', C: 'K6' },
  });
  const strongAuction: Call[] = ['1C', 'Pass', '1H', 'Pass', '2NT', 'Pass'];
  const result = evaluateUserCall('3H', strongBoard, strongAuction, defaultBiddingSystem);
  const actualCandidates = getApplicableCandidateCalls(result).filter(({ rule }) =>
    rule.id.startsWith('responder-rebid-') && rule.id.endsWith('-strong-2nt'));
  const boundary = result.applicableRules.some(({ id }) =>
    id === 'responder-rebid-boundary-after-strong-2nt');
  if (actualCandidates.length !== 0 || ! boundary) {
    failures += 1;
    console.error('FAIL responder strong 2NT slam-oriented guidance and signoff exclusion.');
  }
  console.log(`${failures} ***FAILURES***. Responder strong 2NT: ${cases.length} context checks ` +
              'and one strong-hand guidance check.');
  console.log('  Distinguishes a natural one-level new-suit response from 1NT or a two-level');
  console.log('  response, excludes interference, and avoids automatic slam-interest signoffs.\n');
  return failures;
}

/// The new major-1NT family must not leak into unrelated responder rebids, and
/// forcing 1NT must not turn a three-card minor fallback into a guaranteed fit.
function runResponderMajorOneNtContextTests (): number {
  const bucket = RULE_TEST_DEAL_BUCKETS.find((item) => item.id === 'responder-rebid-after-major-1nt');
  const seed = bucket?.deals[2];
  const limitSeed = bucket?.deals[6];
  if (seed === undefined || limitSeed === undefined) return 1;
  const { board } = makeRuleTestBoard(seed);
  const cases: { auction: Call[]; recognized: boolean }[] = [
    { auction: ['1S', 'Pass', '1NT', 'Pass', '2C', 'Pass'], recognized: true },
    { auction: ['1S', 'Pass', '1NT', 'Pass', '2S', 'Pass'], recognized: true },
    { auction: ['1H', 'Pass', '1NT', 'Pass', '2S', 'Pass'], recognized: true },
    { auction: ['1S', 'Pass', '1NT', 'Pass', '3S', 'Pass'], recognized: true },
    { auction: ['1S', 'Pass', '1NT', 'Pass', '2NT', 'Pass'], recognized: true },
    { auction: ['1S', 'Pass', '1NT', 'Pass', '3C', 'Pass'], recognized: true },
    { auction: ['1D', 'Pass', '1NT', 'Pass', '2C', 'Pass'], recognized: false },
    { auction: ['1S', 'Pass', '2C', 'Pass', '2D', 'Pass'], recognized: false },
    { auction: ['1S', 'Pass', '1NT', 'Double', '2C', 'Pass'], recognized: false },
  ];
  let failures = 0;
  for (const testCase of cases) {
    const result = evaluateUserCall('Pass', board, testCase.auction, defaultBiddingSystem);
    const concrete = getApplicableCandidateCalls(result).some(({ rule }) =>
      rule.id.includes('major-1nt'));
    const boundary = result.applicableRules.some(({ id }) =>
      id === 'responder-rebid-boundary-after-major-1nt-natural' ||
      id === 'responder-rebid-boundary-after-major-1nt-strong-forcing' ||
      id === 'responder-rebid-boundary-after-major-1nt-invitation');
    if ((concrete || boundary) !== testCase.recognized) {
      failures += 1;
      console.error(`FAIL major-1NT responder context: ${testCase.auction.join(' ')}.`);
    }
  }
  const { board: fourClubsBoard } = makeRuleTestBoard({
    description: 'Four clubs do not guarantee fit opposite a manufactured minor',
    practiceAuction: ['1S', 'Pass', '1NT', 'Pass', '2C', 'Pass'],
    north: seed.north,
    south: { S: 'Q2', H: 'J87', D: 'Q985', C: 'K842' },
  });
  const auction: Call[] = ['1S', 'Pass', '1NT', 'Pass', '2C', 'Pass'];
  const forcing = evaluateUserCall('Pass', fourClubsBoard, auction,
    { ...defaultBiddingSystem, majorOneNtResponse: 'forcing' });
  const nonForcing = evaluateUserCall('Pass', fourClubsBoard, auction,
    { ...defaultBiddingSystem, majorOneNtResponse: 'nonForcing' });
  const hasSecondSuitPass = (result: ReturnType<typeof evaluateUserCall>) =>
    getApplicableCandidateCalls(result).some(({ rule }) =>
      rule.id === 'responder-rebid-pass-second-suit-after-major-1nt');
  if (hasSecondSuitPass(forcing) || ! hasSecondSuitPass(nonForcing)) {
    failures += 1;
    console.error('FAIL manufactured-minor four-card support distinction.');
  }
  const { board: limitBoard } = makeRuleTestBoard(limitSeed);
  for (const majorOneNtResponse of ['forcing', 'nonForcing'] as const) {
    const result = evaluateUserCall('3S', limitBoard, limitSeed.practiceAuction.slice(0, 6),
      { ...defaultBiddingSystem, majorOneNtResponse });
    if (! getApplicableCandidateCalls(result).some(({ rule }) =>
      rule.id === 'responder-rebid-delayed-limit-after-major-1nt')) {
      failures += 1;
      console.error(`FAIL delayed three-card limit raise with ${majorOneNtResponse} 1NT.`);
    }
  }
  console.log(`${failures} ***FAILURES***. Responder after major 1NT: ${cases.length} context ` +
              'checks, one manufactured-minor comparison, and two limit-raise checks.');
  console.log('  Keeps the nonforcing decisions out of reverses and other auction families;');
  console.log('  protects the fallback-minor length promise and both limit-raise routes.\n');
  return failures;
}

/// The minor-1NT rebids must stay out of other response families and forcing auctions.
/// Previously passed responder 1NT is nonforcing even with forcing-1NT configured.
/// Keep opener's stronger rebids after a major-opening 1NT response distinct from
/// economical two-level suit rebids. Use both major suits and both 1NT agreements.
function runResponderMajorOneNtStrongTests (): number {
  const make = (north: { S: string; H: string; D: string; C: string },
                south: { S: string; H: string; D: string; C: string }) =>
    makeRuleTestBoard({ description: 'Major-opening 1NT strong rebid continuation',
      practiceAuction: ['1S', 'Pass', '1NT', 'Pass', '2NT', 'Pass'], north, south }).board;
  const spadeNtOpener = { S: 'AKJ84', H: 'Q65', D: 'AQ3', C: 'K4' }; // 19 balanced HCP
  const spadeJumpOpener = { S: 'AKJ843', H: 'Q65', D: 'K73', C: 'K' }; // 18 with length points
  const lowSpade = { S: 'Q5', H: 'K87', D: 'J864', C: '9732' }; // 6 HCP
  const highSpade = { S: 'Q5', H: 'KJ7', D: 'J864', C: 'Q932' }; // 9 HCP
  const limitSpade = { S: 'Q65', H: 'KJ7', D: 'J864', C: 'A93' }; // 11 HCP, three spades
  const heartJumpOpener = { S: 'Q65', H: 'AKJ843', D: 'K73', C: 'K' };
  const lowHeart = { S: 'K87', H: 'Q5', D: 'J864', C: '9732' };
  const highHeart = { S: 'KJ7', H: 'Q5', D: 'J864', C: 'Q932' };
  const checks: { name: string; board: ReturnType<typeof make>; auction: Call[];
                  include: string; exclude?: string }[] = [
    { name: 'decline 2NT with six', board: make(spadeNtOpener, lowSpade),
      auction: ['1S', 'Pass', '1NT', 'Pass', '2NT', 'Pass'],
      include: 'responder-rebid-pass-after-major-1nt-2nt-invite',
      exclude: 'responder-rebid-3nt-after-major-1nt-2nt-invite' },
    { name: 'accept 2NT with nine', board: make(spadeNtOpener, highSpade),
      auction: ['1S', 'Pass', '1NT', 'Pass', '2NT', 'Pass'],
      include: 'responder-rebid-3nt-after-major-1nt-2nt-invite',
      exclude: 'responder-rebid-pass-after-major-1nt-2nt-invite' },
    { name: 'concealed limit raise after 2NT', board: make(spadeNtOpener, limitSpade),
      auction: ['1S', 'Pass', '1NT', 'Pass', '2NT', 'Pass'],
      include: 'responder-rebid-major-game-after-major-1nt-2nt-invite',
      exclude: 'responder-rebid-3nt-after-major-1nt-2nt-invite' },
    { name: 'decline spade jump', board: make(spadeJumpOpener, lowSpade),
      auction: ['1S', 'Pass', '1NT', 'Pass', '3S', 'Pass'],
      include: 'responder-rebid-pass-after-major-1nt-jump-repeat',
      exclude: 'responder-rebid-major-game-after-major-1nt-jump-repeat' },
    { name: 'accept spade jump', board: make(spadeJumpOpener, highSpade),
      auction: ['1S', 'Pass', '1NT', 'Pass', '3S', 'Pass'],
      include: 'responder-rebid-major-game-after-major-1nt-jump-repeat',
      exclude: 'responder-rebid-pass-after-major-1nt-jump-repeat' },
    { name: 'decline heart jump', board: make(heartJumpOpener, lowHeart),
      auction: ['1H', 'Pass', '1NT', 'Pass', '3H', 'Pass'],
      include: 'responder-rebid-pass-after-major-1nt-jump-repeat',
      exclude: 'responder-rebid-major-game-after-major-1nt-jump-repeat' },
    { name: 'accept heart jump', board: make(heartJumpOpener, highHeart),
      auction: ['1H', 'Pass', '1NT', 'Pass', '3H', 'Pass'],
      include: 'responder-rebid-major-game-after-major-1nt-jump-repeat',
      exclude: 'responder-rebid-pass-after-major-1nt-jump-repeat' },
  ];
  let failures = 0;
  for (const agreement of ['forcing', 'nonForcing'] as const) {
    const system = { ...defaultBiddingSystem, majorOneNtResponse: agreement };
    for (const check of checks) {
      const result = evaluateUserCall('Pass', check.board, check.auction, system);
      const ids = getApplicableCandidateCalls(result).map(({ rule }) => rule.id);
      if (! ids.includes(check.include) || (check.exclude !== undefined && ids.includes(check.exclude))) {
        failures += 1;
        console.error(`FAIL major-1NT ${check.name} (${agreement}): ${ids.join(', ')}.`);
      }
      // The ordinary economical-family boundary should never describe an invitation.
      if (result.applicableRules.some(({ id }) =>
        id === 'responder-rebid-boundary-after-major-1nt-natural')) {
        failures += 1;
        console.error(`FAIL economical major-1NT boundary leaked into ${check.name}.`);
      }
    }
  }
  const reverseBoard = make({ S: 'KQ65', H: 'AKJ84', D: 'A73', C: 'K' },
                            { S: 'A87', H: 'Q5', D: 'J864', C: '9732' });
  for (const finalCall of ['2S', '3C'] as Call[]) {
    const openerBid = finalCall === '2S' ? '1H' : '1S';
    const board = finalCall === '2S' ? reverseBoard : make(spadeNtOpener, lowSpade);
    const auction: Call[] = [openerBid, 'Pass', '1NT', 'Pass', finalCall, 'Pass'];
    const result = evaluateUserCall('Pass', board, auction, defaultBiddingSystem);
    if (! result.applicableRules.some(({ id }) =>
      id === 'responder-rebid-boundary-after-major-1nt-strong-forcing') ||
      getApplicableCandidateCalls(result).some(({ call }) => call === 'Pass')) {
      failures += 1;
      console.error(`FAIL strong major-1NT ${finalCall} must remain forcing with guidance.`);
    }
  }
  console.log(`${failures} ***FAILURES***. Major-1NT strong continuations: ` +
              `${checks.length * 2} agreement cases, two forcing boundaries.`);
  console.log('  Tests 2NT and six-card-major invitations, concealed fit, reverse/jump-shift obligations.\n');
  return failures;
}

function runResponderMinorOneNtAndPassedHandTests (): number {
  let failures = 0;
  const seed = RULE_TEST_DEAL_BUCKETS.find((item) => item.id === 'responder-rebid-after-minor-1nt')
    ?.deals[0];
  if (seed === undefined) return 1;
  const { board } = makeRuleTestBoard(seed);
  const cases: { auction: Call[]; applicable: boolean }[] = [
    { auction: ['1D', 'Pass', '1NT', 'Pass', '2D', 'Pass'], applicable: true },
    { auction: ['1D', 'Pass', '1NT', 'Pass', '2H', 'Pass'], applicable: false },
    { auction: ['1D', 'Pass', '1H', 'Pass', '2D', 'Pass'], applicable: false },
    { auction: ['1S', 'Pass', '1NT', 'Pass', '2S', 'Pass'], applicable: false },
    { auction: ['1D', 'Pass', '1NT', 'Double', '2D', 'Pass'], applicable: false },
  ];
  for (const testCase of cases) {
    const result = evaluateUserCall('Pass', board, testCase.auction, defaultBiddingSystem);
    const active = getApplicableCandidateCalls(result).some(({ rule }) =>
      rule.id === 'responder-rebid-pass-after-minor-1nt-repeat');
    if (active !== testCase.applicable) {
      failures += 1;
      console.error(`FAIL minor-1NT responder context: ${testCase.auction.join(' ')}.`);
    }
  }
  const { board: passedBoard } = makeRuleTestBoard({
    description: 'The responder Passed before partner opened, making 1NT nonforcing',
    dealer: 'N', practiceAuction: ['Pass', 'Pass', '1S', 'Pass', '1NT', 'Pass', 'Pass'],
    north: { S: 'Q2', H: 'J872', D: 'K985', C: 'T84' },
    south: { S: 'AKJ74', H: 'Q63', D: 'Q4', C: 'J63' },
  });
  const forcing = { ...defaultBiddingSystem, majorOneNtResponse: 'forcing' as const };
  const priorResponse = evaluateUserCall('1NT', passedBoard,
    ['Pass', 'Pass', '1S', 'Pass'], forcing);
  const responseRules = getApplicableCandidateCalls(priorResponse).map(({ rule }) => rule.id);
  if (!responseRules.includes('respond-to-major-w/o-support-1nt-passed-hand') ||
      responseRules.includes('respond-to-major-w/o-support-1nt-twooverone')) {
    failures += 1;
    console.error('FAIL previously passed responder still treated as forcing 1NT.');
  }
  const openerRebid = evaluateUserCall('Pass', passedBoard,
    ['Pass', 'Pass', '1S', 'Pass', '1NT', 'Pass'], forcing);
  const openerRules = getApplicableCandidateCalls(openerRebid).map(({ rule }) => rule.id);
  if (!openerRules.includes('opener-rebid-pass-after-major-1nt-passed-hand') ||
      openerRules.includes('opener-rebid-minor-fallback-after-major-1nt-forcing')) {
    failures += 1;
    console.error('FAIL passed-hand 1NT did not allow opener Pass or suppress forced fallback.');
  }
  const seedMajor = RULE_TEST_DEAL_BUCKETS.find((item) =>
    item.id === 'responder-rebid-after-major-1nt')?.deals[2];
  if (seedMajor === undefined) return failures + 1;
  const { board: unpassedBoard } = makeRuleTestBoard(seedMajor);
  const unpassedResponse = getApplicableCandidateCalls(evaluateUserCall('1NT', unpassedBoard,
    ['1S', 'Pass'], forcing));
  if (!unpassedResponse.some(({rule}) => rule.id === 'respond-to-major-w/o-support-1nt-twooverone')) {
    failures += 1;
    console.error('FAIL ordinary unpassed forcing 1NT was lost.');
  }
  console.log(`${failures} ***FAILURES***. Minor-1NT responder and passed-hand: ` +
              `${cases.length} context checks and 3 forcing-1NT checks.`);
  console.log('  Excludes reverse and competitive cases; keeps 1NT forcing only for unpassed');
  console.log('  responder and does not manufacture a minor after the passed-hand response.\n');
  return failures;
}

/// These checks protect the Standard/2-over-1 distinction on an identical printed auction:
/// Standard may stop after opener answers the one-round force, while 2/1 may not.
function runResponderStandardTwoLevelContextTests (): number {
  const bucket = RULE_TEST_DEAL_BUCKETS.find((item) =>
    item.id === 'responder-rebid-after-standard-two-level');
  if (bucket === undefined || bucket.deals.length === 0) return 1;
  const { board } = makeRuleTestBoard(bucket.deals[1]);
  const prefix: Call[] = ['1D', 'Pass', '2C', 'Pass', '3C', 'Pass'];
  const standard = { ...defaultBiddingSystem, twoLevelNewSuitResponse: 'standard' as const };
  const twoOverOne = { ...defaultBiddingSystem, twoLevelNewSuitResponse: 'twoOverOne' as const };
  const relevant = (system: BiddingSystem, auction: Call[]) =>
    getApplicableCandidateCalls(evaluateUserCall('Pass', board, auction, system))
      .filter(({ rule }) => rule.id.startsWith('responder-rebid-standard-two-level-'));
  let failures = 0;
  if (! relevant(standard, prefix).some(({ call, rule }) =>
    call === 'Pass' && rule.id === 'responder-rebid-standard-two-level-pass-raise')) {
    failures += 1;
    console.error('FAIL Standard one-round force did not permit the natural Pass after a raise.');
  }
  if (relevant(twoOverOne, prefix).length !== 0) {
    failures += 1;
    console.error('FAIL Standard Pass leaked into the 2/1 game-forcing auction.');
  }
  const boundary = (system: BiddingSystem) => {
    const evaluation = evaluateUserCall('Pass', board, prefix, system);
    return evaluation.applicableRules.some((rule) =>
      rule.id === 'responder-rebid-boundary-after-standard-two-level');
  };
  if (!boundary(standard) && relevant(standard, prefix).length === 0) {
    failures += 1;
    console.error('FAIL Standard response neither supplies a bid nor explanatory guidance.');
  }
  if (boundary(twoOverOne)) {
    failures += 1;
    console.error('FAIL Standard explanatory boundary leaked into 2/1.');
  }
  if (relevant(standard, ['1D', 'Pass', '2C', 'Pass', '2H', 'Pass']).length !== 0) {
    failures += 1;
    console.error('FAIL minimum Standard signoff appeared after an opener reverse.');
  }
  // The Standard 2NT continuation permits a balanced 12-count to decline game, while 2/1
  // cannot Pass below game. This is a single constructed hand, not an extra practice deal.
  const seedNt = bucket.deals[3];
  const { board: twelveHcpBoard } = makeRuleTestBoard({
    ...seedNt,
    south: { ...seedNt.south!, C: 'QJ653' }, // South's club nine becomes the jack: 11 -> 12 HCP.
    west: { ...seedNt.west!, C: '97' }, // Return the nine to West to preserve the complete fixed deal.
  });
  const ntPrefix: Call[] = ['1D', 'Pass', '2C', 'Pass', '2NT', 'Pass'];
  const twelveHcp = makeRuleEvalContext(twelveHcpBoard, ntPrefix).handFacts.hcp;
  const ntPassCandidates = (system: BiddingSystem) =>
    getApplicableCandidateCalls(evaluateUserCall('Pass', twelveHcpBoard, ntPrefix, system));
  if (twelveHcp !== 12 || ! ntPassCandidates(standard).some(({ call, rule }) =>
    call === 'Pass' && rule.id === 'responder-rebid-standard-two-level-pass-2nt')) {
    failures += 1;
    console.error('FAIL a balanced 12-HCP Standard responder must be able to Pass 2NT.');
  }
  if (ntPassCandidates(twoOverOne).some(({ call }) => call === 'Pass')) {
    failures += 1;
    console.error('FAIL the Standard 12-HCP Pass leaked into 2/1 below game.');
  }
  console.log(`${failures} ***FAILURES***. Standard two-level responder rebids: 7 checks.`);
  console.log('  Protects the one-round-force versus game-force distinction, including 12-HCP Pass.');
  console.log('  Also excludes minimum signoffs immediately after an opener reverse.\n');
  return failures;
}

/// 2/1 continuations must retain the game force, but the same natural auction in
/// Standard may have completed a one-round force. The support check also distinguishes
/// three-card heart support from an insufficient three-card minor fit.
function runResponderTwoOverOneContextTests (): number {
  const bucket = RULE_TEST_DEAL_BUCKETS.find((item) =>
    item.id === 'responder-rebid-after-two-over-one');
  if (bucket === undefined || bucket.deals.length < 6) return 1;
  const standard = { ...defaultBiddingSystem, twoLevelNewSuitResponse: 'standard' as const };
  const twoOverOne = { ...defaultBiddingSystem, twoLevelNewSuitResponse: 'twoOverOne' as const };
  let failures = 0;
  const selected = (dealIndex: number, call: Call, system: BiddingSystem) => {
    const deal = bucket.deals[dealIndex];
    const { board } = makeRuleTestBoard(deal);
    return getApplicableCandidateCalls(evaluateUserCall(call, board,
      deal.practiceAuction.slice(0, 6), system));
  };
  if (!selected(0, '4S', twoOverOne).some(({ rule, call }) =>
    rule.id === 'responder-rebid-two-over-one-opening-major-game' && call === '4S')) {
    failures += 1;
    console.error('FAIL 2/1 direct major game with two cards opposite six.');
  }
  if (!selected(1, '3S', twoOverOne).some(({ rule, call }) =>
    rule.id === 'responder-rebid-two-over-one-slow-major-raise' && call === '3S')) {
    failures += 1;
    console.error('FAIL 2/1 slower three-card major raise.');
  }
  if (selected(0, '4S', standard).some(({ rule }) =>
      rule.id.startsWith('responder-rebid-two-over-one-')) ||
      selected(1, '3S', standard).some(({ rule }) =>
        rule.id.startsWith('responder-rebid-two-over-one-'))) {
    failures += 1;
    console.error('FAIL 2/1 responder rules leaked into Standard agreement.');
  }
  const { board } = makeRuleTestBoard(bucket.deals[3]);
  const prefix: Call[] = ['1S', 'Pass', '2C', 'Pass', '3C', 'Pass'];
  const forcingResult = evaluateUserCall('Pass', board, prefix, twoOverOne);
  if (getApplicableCandidateCalls(forcingResult).some(({ call }) => call === 'Pass')) {
    failures += 1;
    console.error('FAIL a below-game Pass was recommended in the 2/1 game force.');
  }
  if (!forcingResult.applicableRules.some(({ id }) =>
    id === 'responder-rebid-boundary-after-two-over-one')) {
    failures += 1;
    console.error('FAIL unresolved 2/1 game force had no explanatory boundary.');
  }
  const { board: supportBoard } = makeRuleTestBoard({
    description: 'Five hearts need only three-card support but a minor normally needs four',
    practiceAuction: ['1S', 'Pass', '2H', 'Pass', '3H'],
    north: { S: 'AKJ74', H: 'K83', D: 'QT4', C: 'Q6' },
    south: { S: 'Q5', H: 'AQJ92', D: 'A86', C: 'KJ4' },
  });
  const openerCandidates = (response: Call, candidate: Call, system: BiddingSystem) =>
    getApplicableCandidateCalls(evaluateUserCall(candidate, supportBoard,
      ['1S', 'Pass', response, 'Pass'], system));
  if (!openerCandidates('2H', '3H', standard).some(({ rule }) =>
    rule.id === 'opener-rebid-simple-raise-after-major-standard-two-level-new-suit')) {
    failures += 1;
    console.error('FAIL Standard 1S-2H correctly raising hearts with three-card support.');
  }
  if (!openerCandidates('2H', '3H', twoOverOne).some(({ rule }) =>
    rule.id === 'opener-rebid-simple-raise-after-major-two-over-one-new-suit')) {
    failures += 1;
    console.error('FAIL 2/1 1S-2H correctly raising hearts with three-card support.');
  }
  if (openerCandidates('2C', '3C', standard).some(({ rule }) =>
      rule.id === 'opener-rebid-simple-raise-after-major-standard-two-level-new-suit') ||
      openerCandidates('2C', '3C', twoOverOne).some(({ rule }) =>
        rule.id === 'opener-rebid-simple-raise-after-major-two-over-one-new-suit')) {
    failures += 1;
    console.error('FAIL opener raised a minor with only three-card support.');
  }
  // A game force expires at game. Test the ordinary 3NT, 4M and 5m placements without
  // extending the practice corpus or modeling opener's later decisions.
  const { board: ntGameBoard } = makeRuleTestBoard(bucket.deals[2]);
  const { board: spadeGameBoard } = makeRuleTestBoard(bucket.deals[0]);
  const { board: heartFitGameBoard } = makeRuleTestBoard({
    description: 'Responder accepts opener raising the two-level heart response to game.',
    practiceAuction: ['1S', 'Pass', '2H', 'Pass', '4H', 'Pass'],
    north: { S: 'AKJ74', H: 'K83', D: 'QT4', C: 'Q6' },
    south: { S: 'Q5', H: 'AQJ92', D: 'J86', C: 'K74' },
  });
  const { board: minorGameBoard } = makeRuleTestBoard({
    description: "Responder accepts opener's natural five-club game after 2/1.",
    practiceAuction: ['1D', 'Pass', '2C', 'Pass', '5C', 'Pass'],
    north: { S: 'A3', H: 'K84', D: 'AQ86', C: 'K972' },
    south: { S: 'KQ8', H: 'Q76', D: 'K5', C: 'AJT83' },
  });
  const gameCases: { name: string; auction: Call[]; board: typeof board }[] = [
    { name: '3NT game', auction: ['1H', 'Pass', '2C', 'Pass', '3NT', 'Pass'], board: ntGameBoard },
    { name: '4H game in opening suit', auction: ['1H', 'Pass', '2C', 'Pass', '4H', 'Pass'], board: ntGameBoard },
    { name: '4H game in response suit', auction: ['1S', 'Pass', '2H', 'Pass', '4H', 'Pass'], board: heartFitGameBoard },
    { name: '4S game', auction: ['1S', 'Pass', '2C', 'Pass', '4S', 'Pass'], board: spadeGameBoard },
    { name: '5C game', auction: ['1D', 'Pass', '2C', 'Pass', '5C', 'Pass'], board: minorGameBoard },
  ];
  for (const game of gameCases) {
    const accepted = getApplicableCandidateCalls(evaluateUserCall('Pass', game.board,
      game.auction, twoOverOne));
    if (! accepted.some(({ call, rule }) => call === 'Pass' &&
        rule.id === 'responder-rebid-two-over-one-pass-reached-game')) {
      failures += 1;
      console.error(`FAIL 2/1 responder could not accept ${game.name} with Pass.`);
    }
  }
  for (const lastRebid of ['2NT', '3H', '4S', '4NT'] as Call[]) {
    const auction: Call[] = ['1H', 'Pass', '2C', 'Pass', lastRebid, 'Pass'];
    const candidates = getApplicableCandidateCalls(evaluateUserCall('Pass', ntGameBoard,
      auction, twoOverOne));
    if (candidates.some(({ call }) => call === 'Pass')) {
      failures += 1;
      console.error(`FAIL 2/1 Pass appeared after ${lastRebid}, before an established natural game.`);
    }
  }
  const standardGameCandidates = getApplicableCandidateCalls(evaluateUserCall('Pass',
    ntGameBoard, ['1H', 'Pass', '2C', 'Pass', '3NT', 'Pass'], standard));
  if (standardGameCandidates.some(({ rule }) =>
    rule.id === 'responder-rebid-two-over-one-pass-reached-game')) {
    failures += 1;
    console.error('FAIL 2/1 reached-game Pass leaked into Standard.');
  }
  console.log(`${failures} ***FAILURES***. 2/1 responder and opener support: 18 checks.`);
  console.log('  Preserves game forcing below game, allows natural game Pass, and protects agreements.\n');
  return failures;
}

function runPracticeContinuationTests (): number {
  const recorded: Call[] = ['1C', 'Pass', '1H', 'Pass', '1NT', 'Pass', '2NT'];
  const prefix = recorded.slice(0, 6);
  let failures = 0;
  if (getRecordedPracticeCorrection(prefix, 'Pass', recorded) !== '2NT') failures += 1;
  if (getRecordedPracticeCorrection(prefix, '2NT', recorded) !== null) failures += 1;
  if (getRecordedPracticeCorrection(['1C', '1S'], 'Pass', recorded) !== null) failures += 1;
  if (getRecordedPracticeCorrection([], 'Double', recorded) !== null) failures += 1;
  if (isPracticeSequenceComplete(prefix, recorded) ||
      ! isPracticeSequenceComplete(recorded, recorded)) failures += 1;
  // A practice exercise progresses exactly one recorded call for each entered legal
  // action, including opponent Passes, regardless of which seat is the dealer.
  const allSeatRecorded: Call[] = ['1C', 'Pass', '1H', 'Pass', '1NT'];
  const allSeatEntered: Call[] = ['1D', '2C', '2H', 'Pass', '2NT'];
  const allSeatOrder = ['W', 'N', 'E', 'S', 'W'];
  const progressed: Call[] = [];
  for (let index = 0; index < allSeatRecorded.length; index += 1) {
    const entered = allSeatEntered[index]!;
    const expected = allSeatRecorded[index]!;
    if (getNextSeat('W', progressed) !== allSeatOrder[index] ||
        ! isCallAvailableInAuction(entered, progressed) ||
        isPracticeSequenceComplete(progressed, allSeatRecorded)) {
      failures += 1;
      break;
    }
    progressed.push(getRecordedPracticeCorrection(progressed, entered, allSeatRecorded) ?? entered);
    if (progressed[index] !== expected) {
      failures += 1;
      break;
    }
  }
  if (! isPracticeSequenceComplete(progressed, allSeatRecorded)) failures += 1;
  // Active lessons obey the very same agreement requirements as the bucket selector.
  // Changing the setting can clear an incompatible exercise instead of allowing it
  // to continue with recorded bids that no longer match its convention.
  const stayman = RULE_TEST_DEAL_BUCKETS.flatMap((bucket) => bucket.deals)
    .find((deal) => deal.requiredSystem?.stayman === true);
  const noStayman = { ...defaultBiddingSystem, stayman: false };
  if (stayman === undefined || ! isPracticeDealCompatible(stayman, defaultBiddingSystem) ||
      isPracticeDealCompatible(stayman, noStayman) ||
      getRulesBucketTestDeals('all', noStayman).includes(stayman)) failures += 1;
  console.log(`${failures} ***FAILURES***. Practice continuation and settings compatibility: 12 checks.`);
  console.log('  Preserves the recorded exercise after a different bid, but never corrects');
  console.log('  matching calls or diverged auctions; stops only at the recorded endpoint.\n');
  return failures;
}

function getTestedStages (deal: RuleTestDeal): StageExpectations[] {
  return [
    { name: 'opening', auctionLength: 0, expected: deal.expectedOpeningCalls,
      rejected: deal.rejectedOpeningCalls, order: deal.expectedOpeningCallOrder },
    { name: 'overcall', auctionLength: 1, expected: deal.expectedOvercallCalls,
      rejected: deal.rejectedOvercallCalls, order: deal.expectedOvercallCallOrder },
    { name: 'balancing', auctionLength: 3, expected: deal.expectedBalancingCalls,
      rejected: deal.rejectedBalancingCalls, order: undefined },
    { name: 'advance', auctionLength: 3, expected: deal.expectedAdvanceCalls,
      rejected: deal.rejectedAdvanceCalls, order: deal.expectedAdvanceCallOrder },
    { name: 'overcaller rebid', auctionLength: 5, expected: deal.expectedOvercallerRebidCalls,
      rejected: deal.rejectedOvercallerRebidCalls, order: deal.expectedOvercallerRebidCallOrder },
    { name: 'response', auctionLength: 2, expected: deal.expectedResponseCalls,
      rejected: deal.rejectedResponseCalls, order: deal.expectedResponseCallOrder },
    { name: 'opener rebid', auctionLength: 4, expected: deal.expectedOpenerRebidCalls,
      rejected: deal.rejectedOpenerRebidCalls, order: deal.expectedOpenerRebidCallOrder },
    { name: 'responder rebid', auctionLength: 6, expected: deal.expectedResponderRebidCalls,
      rejected: deal.rejectedResponderRebidCalls, order: undefined },
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

/// Selected, meaningful convention-completion checks, not a new practice-deal bucket.
/// Exercise the physical three-bid pattern, denomination, agreement shifts, and
/// the important Texas distinction when a Jacoby transfer is followed by a jump.
function runResponderNtConventionTests (): number {
  const oneNt = { S: 'AK72', H: 'QJ65', D: 'K97', C: 'Q5' }; // 15 HCP, both majors
  const oneNtSpades = { S: 'AK72', H: 'QJ6', D: 'K974', C: 'Q5' }; // 15 HCP, spades only
  const oneNtNoMajor = { S: 'AK7', H: 'QJ6', D: 'K974', C: 'A63' }; // 17 HCP, no major
  const twoNt = { S: 'AKQ2', H: 'KJ65', D: 'AQ7', C: 'J5' }; // 20 HCP
  const twoNtSpades = { S: 'AKQ2', H: 'K65', D: 'AQ73', C: 'K5' }; // 21 HCP, spades only
  const make = (north: typeof oneNt, south: typeof oneNt) =>
    makeRuleTestBoard({ description: 'NT convention rebid rule test',
      north, south, practiceAuction: ['1NT'] }).board;
  const cases: { name: string; board: ReturnType<typeof make>; auction: Call[];
    expected: Call | null; ruleId?: string; config?: Partial<BiddingSystem>;
    boundary?: 'stayman' | 'jacoby' }[] = [
    { name: '1NT Stayman major invitation', board: make(oneNtSpades,
      { S: 'J865', H: 'A43', D: 'Q85', C: 'J84' }),
      auction: ['1NT', 'Pass', '2C', 'Pass', '2S', 'Pass'], expected: '3S',
      ruleId: 'responder-rebid-1nt-stayman-invite-major' },
    { name: '1NT Stayman major game', board: make(oneNt,
      { S: 'J85', H: 'AT43', D: 'Q85', C: 'KJ4' }),
      auction: ['1NT', 'Pass', '2C', 'Pass', '2H', 'Pass'], expected: '4H',
      ruleId: 'responder-rebid-1nt-stayman-game-major' },
    { name: '1NT Stayman no-major invitation', board: make(oneNtNoMajor,
      { S: 'J85', H: 'A843', D: 'Q85', C: 'J84' }),
      auction: ['1NT', 'Pass', '2C', 'Pass', '2D', 'Pass'], expected: '2NT',
      ruleId: 'responder-rebid-1nt-stayman-invite-2nt' },
    { name: '1NT Stayman other-major no fit', board: make(oneNtSpades,
      { S: 'J85', H: 'A843', D: 'Q85', C: 'J84' }),
      auction: ['1NT', 'Pass', '2C', 'Pass', '2S', 'Pass'], expected: '2NT',
      ruleId: 'responder-rebid-1nt-stayman-invite-2nt' },
    { name: '1NT Stayman 3NT', board: make(oneNtNoMajor,
      { S: 'J85', H: 'AT43', D: 'Q85', C: 'KJ4' }),
      auction: ['1NT', 'Pass', '2C', 'Pass', '2D', 'Pass'], expected: '3NT',
      ruleId: 'responder-rebid-1nt-stayman-game-3nt' },
    { name: '1NT Stayman HCP shift', board: make(oneNtNoMajor,
      { S: 'J85', H: 'A843', D: 'Q85', C: '984' }),
      auction: ['1NT', 'Pass', '2C', 'Pass', '2D', 'Pass'], expected: '2NT',
      config: { oneNtOpening: '16-18' }, ruleId: 'responder-rebid-1nt-stayman-invite-2nt' },
    { name: '1NT weak spade transfer signoff', board: make(oneNt,
      { S: 'J9864', H: 'T74', D: 'J85', C: '83' }),
      auction: ['1NT', 'Pass', '2H', 'Pass', '2S', 'Pass'], expected: 'Pass',
      ruleId: 'responder-rebid-nt-transfer-pass-weak' },
    { name: '1NT five-spade invitation', board: make(oneNt,
      { S: 'QJ864', H: 'A74', D: 'Q85', C: '83' }),
      auction: ['1NT', 'Pass', '2H', 'Pass', '2S', 'Pass'], expected: '2NT',
      ruleId: 'responder-rebid-1nt-transfer-invite-2nt' },
    { name: '1NT six-heart invitation', board: make(oneNt,
      { S: 'T3', H: 'AT9874', D: 'QJ5', C: 'J8' }),
      auction: ['1NT', 'Pass', '2D', 'Pass', '2H', 'Pass'], expected: '3H',
      ruleId: 'responder-rebid-1nt-transfer-invite-major' },
    { name: '1NT transferred spades to 3NT', board: make(oneNt,
      { S: 'QJ864', H: 'A74', D: 'Q85', C: 'K3' }),
      auction: ['1NT', 'Pass', '2H', 'Pass', '2S', 'Pass'], expected: '3NT',
      ruleId: 'responder-rebid-nt-transfer-game-3nt' },
    { name: '1NT six spades game without Texas', board: make(oneNt,
      { S: 'QJT986', H: 'A43', D: 'Q8', C: 'K8' }),
      auction: ['1NT', 'Pass', '2H', 'Pass', '2S', 'Pass'], expected: '4S',
      config: { texasTransfers: false }, ruleId: 'responder-rebid-nt-transfer-game-major-no-texas' },
    { name: '1NT six spades Texas boundary', board: make(oneNt,
      { S: 'QJT986', H: 'A43', D: 'Q8', C: 'K8' }),
      auction: ['1NT', 'Pass', '2H', 'Pass', '2S', 'Pass'], expected: null,
      boundary: 'jacoby' },
    { name: '2NT Stayman spade game', board: make(twoNtSpades,
      { S: 'JT86', H: 'A843', D: 'T85', C: '64' }),
      auction: ['2NT', 'Pass', '3C', 'Pass', '3S', 'Pass'], expected: '4S',
      ruleId: 'responder-rebid-2nt-stayman-game-major' },
    { name: '2NT Stayman other-major 3NT', board: make(twoNtSpades,
      { S: 'T86', H: 'AT84', D: 'T865', C: '64' }),
      auction: ['2NT', 'Pass', '3C', 'Pass', '3S', 'Pass'], expected: '3NT',
      ruleId: 'responder-rebid-2nt-stayman-game-3nt' },
    { name: '2NT weak heart transfer', board: make(twoNt,
      { S: 'J86', H: 'T9874', D: 'T85', C: '64' }),
      auction: ['2NT', 'Pass', '3D', 'Pass', '3H', 'Pass'], expected: 'Pass',
      ruleId: 'responder-rebid-nt-transfer-pass-weak' },
    { name: '2NT five-spade transfer to 3NT', board: make(twoNt,
      { S: 'JT986', H: 'A84', D: 'T85', C: '64' }),
      auction: ['2NT', 'Pass', '3H', 'Pass', '3S', 'Pass'], expected: '3NT',
      ruleId: 'responder-rebid-nt-transfer-game-3nt' },
    { name: '2NT six-spade game without Texas', board: make(twoNt,
      { S: 'JT9864', H: 'A84', D: 'T8', C: '64' }),
      auction: ['2NT', 'Pass', '3H', 'Pass', '3S', 'Pass'], expected: '4S',
      config: { texasTransfers: false }, ruleId: 'responder-rebid-nt-transfer-game-major-no-texas' },
    { name: '2NT six-spade Texas boundary', board: make(twoNt,
      { S: 'JT9864', H: 'A84', D: 'T8', C: '64' }),
      auction: ['2NT', 'Pass', '3H', 'Pass', '3S', 'Pass'], expected: null,
      boundary: 'jacoby' },
  ];
  let failures = 0;
  for (const test of cases) {
    const system = { ...defaultBiddingSystem, ...test.config };
    const result = evaluateUserCall(test.expected ?? 'Pass', test.board, test.auction, system);
    const calls = getApplicableCandidateCalls(result);
    const chosen = test.expected === null ? null : calls.find(({ call, rule }) =>
      call === test.expected && rule.id === test.ruleId);
    const wrongMajor = calls.some(({ call }) =>
      (call === '3H' || call === '3S' || call === '4H' || call === '4S') &&
      (test.expected === null || call !== test.expected));
    const boundaryId = test.boundary === 'stayman'
      ? 'responder-rebid-boundary-after-nt-stayman'
      : 'responder-rebid-boundary-after-nt-transfer';
    const hasBoundary = result.applicableRules.some(({ id }) => id === boundaryId);
    if ((test.expected !== null && chosen === undefined) || wrongMajor ||
        (test.expected === null && (calls.length > 0 || !hasBoundary))) {
      failures += 1;
      console.error(`FAIL NT convention ${test.name}: candidates ${formatCandidates(calls)}, ` +
                    `boundary ${hasBoundary}.`);
    }
  }
  // Convention-off variants must not silently reinterpret a natural responder call.
  const offBoard = make(oneNt, { S: 'J85', H: 'A843', D: 'Q85', C: 'J84' });
  for (const [auction, config, forbidden] of [
    [['1NT', 'Pass', '2C', 'Pass', '2D', 'Pass'], { stayman: false }, 'stayman'],
    [['1NT', 'Pass', '2H', 'Pass', '2S', 'Pass'], { jacobyTransfers: false }, 'transfer'],
  ] as const) {
    const result = evaluateUserCall('Pass', offBoard, [...auction],
      { ...defaultBiddingSystem, ...config });
    if (getApplicableCandidateCalls(result).some(({ rule }) => rule.id.includes('nt-' + forbidden)) ||
        result.applicableRules.some(({ id }) => id.includes('nt-' + forbidden))) {
      failures += 1;
      console.error(`FAIL ${forbidden} rules available with convention off.`);
    }
  }
  // A natural one-level-suit opener's 1NT rebid is not a completed transfer or Stayman.
  const unrelated = evaluateUserCall('Pass', offBoard,
    ['1C', 'Pass', '1H', 'Pass', '1NT', 'Pass'], defaultBiddingSystem);
  if (getApplicableCandidateCalls(unrelated).some(({ rule }) =>
      rule.id.startsWith('responder-rebid-nt-transfer') || rule.id.includes('nt-stayman'))) {
    failures += 1;
    console.error('FAIL NT convention rules leaked into a natural suit-opening sequence.');
  }
  console.log(`${failures} ***FAILURES***. Responder NT conventions: ${cases.length} ` +
              'representative continuations, two convention-off guards, and one stage guard.\n');
  return failures;
}


/// Hand-level checks for a small number of significant conventional continuations.
/// These verify forcing boundaries and real contract placement without creating
/// artificial four-hand practice deals simply to exercise the evaluator.
function runResponderStrongAndSupportConventionTests (): number {
  type Test = { name: string; north: Record<'S' | 'H' | 'D' | 'C', string>;
    south: Record<'S' | 'H' | 'D' | 'C', string>; auction: Call[];
    expectedCall?: Call; expectedRule?: string; boundary?: string;
    config?: Partial<BiddingSystem>; forbidden?: string[] };
  const strong = { S: 'AKQ4', H: 'KJ3', D: 'AQ2', C: 'K87' }; // 22 balanced HCP
  const oneNt = { S: 'AK72', H: 'QJ65', D: 'K97', C: 'Q5' };
  const minS = { S: 'AKT74', H: 'QJ3', D: 'A52', C: '98' }; // 14 HCP
  const minH = { S: 'QJ3', H: 'AKT74', D: 'A52', C: '98' }; // 14 HCP
  const gameS = { S: 'AKT74', H: 'KJ3', D: '852', C: 'Q8' }; // 13 HCP
  const gameH = { S: 'KJ3', H: 'AKT74', D: '852', C: 'Q8' }; // 13 HCP
  const fitS = { S: 'QJ86', H: 'A74', D: 'K6', C: 'K532' }; // 14 support points
  const fitH = { S: 'A74', H: 'QJ86', D: 'K6', C: 'K532' }; // 14 support points
  const splS = { S: 'QJ86', H: 'Q74', D: 'AK963', C: '3' }; // 15 support points
  const splH = { S: '2', H: 'QJ86', D: 'A9634', C: 'K74' }; // 13 support points
  const cases: Test[] = [
    { name: '2C waiting to 2NT: weak Pass', north: strong,
      south: { S: 'T865', H: '976', D: '843', C: 'T62' },
      auction: ['2C', 'Pass', '2D', 'Pass', '2NT', 'Pass'], expectedCall: 'Pass',
      expectedRule: 'responder-rebid-strong-2c-waiting-pass-2nt' },
    { name: '2C waiting to 2NT: 3NT game', north: strong,
      south: { S: 'J865', H: 'A76', D: '843', C: 'T62' },
      auction: ['2C', 'Pass', '2D', 'Pass', '2NT', 'Pass'], expectedCall: '3NT',
      expectedRule: 'responder-rebid-strong-2c-waiting-game-3nt' },
    { name: '2C waiting to 2NT: borderline 3 HCP guidance', north: strong,
      south: { S: 'T865', H: 'T76', D: 'K43', C: 'T62' },
      auction: ['2C', 'Pass', '2D', 'Pass', '2NT', 'Pass'],
      boundary: 'responder-rebid-boundary-after-strong-2c', forbidden: ['Pass', '3NT'] },
    { name: '2C waiting to 3NT: Pass reached game', north: strong,
      south: { S: 'J865', H: 'A76', D: '843', C: 'T62' },
      auction: ['2C', 'Pass', '2D', 'Pass', '3NT', 'Pass'], expectedCall: 'Pass',
      expectedRule: 'responder-rebid-strong-2c-waiting-pass-3nt' },
    { name: '2C waiting to 2H: forcing boundary', north: strong,
      south: { S: 'T865', H: '976', D: '843', C: 'T62' },
      auction: ['2C', 'Pass', '2D', 'Pass', '2H', 'Pass'],
      boundary: 'responder-rebid-boundary-after-strong-2c', forbidden: ['Pass'] },
    { name: '2C positive heart and raise: major game', north: strong,
      south: { S: 'J8', H: 'AQ987', D: 'J73', C: 'T64' },
      auction: ['2C', 'Pass', '2H', 'Pass', '3H', 'Pass'], expectedCall: '4H',
      expectedRule: 'responder-rebid-strong-2c-positive-major-game' },
    { name: '2C positive spade and raise: major game', north: strong,
      south: { S: 'JT987', H: 'A8', D: 'K73', C: 'T64' },
      auction: ['2C', 'Pass', '2S', 'Pass', '3S', 'Pass'], expectedCall: '4S',
      expectedRule: 'responder-rebid-strong-2c-positive-major-game' },
    { name: '2C balanced positive and 3NT: Pass', north: strong,
      south: { S: 'JT65', H: 'A76', D: 'K43', C: 'T62' },
      auction: ['2C', 'Pass', '2NT', 'Pass', '3NT', 'Pass'], expectedCall: 'Pass',
      expectedRule: 'responder-rebid-strong-2c-positive-pass-3nt' },
    { name: '2C positive suit to 2NT: game force boundary', north: strong,
      south: { S: 'J8', H: 'AQ987', D: 'J73', C: 'T64' },
      auction: ['2C', 'Pass', '2H', 'Pass', '2NT', 'Pass'],
      boundary: 'responder-rebid-boundary-after-strong-2c', forbidden: ['Pass'] },
    { name: '1S Jacoby 2NT medium 3NT: 4S not Pass', north: minS, south: fitS,
      auction: ['1S', 'Pass', '2NT', 'Pass', '3NT', 'Pass'], expectedCall: '4S',
      expectedRule: 'responder-rebid-jacoby-2nt-major-game', forbidden: ['Pass', '3NT'] },
    { name: '1H Jacoby 2NT medium 3NT: 4H', north: minH, south: fitH,
      auction: ['1H', 'Pass', '2NT', 'Pass', '3NT', 'Pass'], expectedCall: '4H',
      expectedRule: 'responder-rebid-jacoby-2nt-major-game' },
    { name: '1S Jacoby 2NT to 4S: Pass', north: gameS, south: fitS,
      auction: ['1S', 'Pass', '2NT', 'Pass', '4S', 'Pass'], expectedCall: 'Pass',
      expectedRule: 'responder-rebid-jacoby-2nt-pass-major-game' },
    { name: '1H Jacoby 2NT to 4H: Pass', north: gameH, south: fitH,
      auction: ['1H', 'Pass', '2NT', 'Pass', '4H', 'Pass'], expectedCall: 'Pass',
      expectedRule: 'responder-rebid-jacoby-2nt-pass-major-game' },
    { name: '1S Jacoby 2NT side-suit show: 4S', north: minS, south: fitS,
      auction: ['1S', 'Pass', '2NT', 'Pass', '3H', 'Pass'], expectedCall: '4S',
      expectedRule: 'responder-rebid-jacoby-2nt-major-game' },
    { name: '1H Jacoby 2NT side-suit above 4H: boundary', north: minH, south: fitH,
      auction: ['1H', 'Pass', '2NT', 'Pass', '4S', 'Pass'],
      boundary: 'responder-rebid-boundary-after-jacoby-2nt', forbidden: ['4H', 'Pass'] },
    { name: 'Jacoby 2NT agreement off: no Jacoby rules', north: minS, south: fitS,
      auction: ['1S', 'Pass', '2NT', 'Pass', '3NT', 'Pass'],
      config: { majorGameForceWithSupport: 'newSuitThenRaise' },
      forbidden: ['4S', 'Pass', '3NT'] },
    { name: '1S splinter to 4S: Pass', north: gameS, south: splS,
      auction: ['1S', 'Pass', '4C', 'Pass', '4S', 'Pass'], expectedCall: 'Pass',
      expectedRule: 'responder-rebid-splinter-pass-major-game' },
    { name: '1H splinter to 4H: Pass', north: gameH, south: splH,
      auction: ['1H', 'Pass', '3S', 'Pass', '4H', 'Pass'], expectedCall: 'Pass',
      expectedRule: 'responder-rebid-splinter-pass-major-game' },
    { name: '1S splinter to 4D control: 4S', north: gameS, south: splS,
      auction: ['1S', 'Pass', '4C', 'Pass', '4D', 'Pass'], expectedCall: '4S',
      expectedRule: 'responder-rebid-splinter-major-game' },
    { name: '1H splinter to 4C control: 4H', north: gameH, south: splH,
      auction: ['1H', 'Pass', '3S', 'Pass', '4C', 'Pass'], expectedCall: '4H',
      expectedRule: 'responder-rebid-splinter-major-game' },
    { name: 'splinter agreement off: no splinter rules', north: gameS, south: splS,
      auction: ['1S', 'Pass', '4C', 'Pass', '4S', 'Pass'],
      config: { splinters: false }, forbidden: ['Pass'] },
  ];
  let failures = 0;
  let checks = 0;
  for (const test of cases) {
    const { board } = makeRuleTestBoard({ description: test.name, north: test.north,
      south: test.south, practiceAuction: test.auction });
    const result = evaluateUserCall(test.expectedCall ?? 'Pass', board, test.auction,
      { ...defaultBiddingSystem, ...(test.name.includes('Jacoby 2NT') ?
        { majorGameForceWithSupport: 'jacoby2NT' as const } : {}), ...test.config });
    const calls = getApplicableCandidateCalls(result);
    const matched = test.expectedCall !== undefined && calls.some(({ call, rule }) =>
      call === test.expectedCall && rule.id === test.expectedRule);
    const boundary = test.boundary !== undefined && result.applicableRules.some(({ id }) =>
      id === test.boundary);
    checks++;
    if (test.expectedCall !== undefined ? !matched : test.boundary !== undefined && !boundary) {
      failures++;
      console.error(`FAIL ${test.name}: expected ${test.expectedRule ?? test.boundary}; ` +
                    `candidates ${formatCandidates(calls)}; boundaries ${result.applicableRules.filter(({kind})=>kind==='scopeBoundary').map(({id})=>id).join(',')}`);
    }
    for (const forbidden of test.forbidden ?? []) {
      checks++;
      if (calls.some(({ call }) => call === forbidden)) {
        failures++;
        console.error(`FAIL ${test.name}: forbidden ${forbidden}, candidates ${formatCandidates(calls)}`);
      }
    }
    if (test.config?.majorGameForceWithSupport === 'newSuitThenRaise' ||
        test.config?.splinters === false) {
      checks++;
      if (result.applicableRules.some(({ id }) =>
        (test.config?.splinters === false ? id.includes('-splinter-') : id.includes('-jacoby-2nt-')))) {
        failures++;
        console.error(`FAIL ${test.name}: convention rules active with agreement off.`);
      }
    }
  }
  // These are explanatory boundaries only; never present an invented ace reply or Pass.
  const slamCases: { name: string; opener: Call; response: Call; boundary?: string }[] = [
    { name: 'Gerber over 1NT', opener: '1NT', response: '4C',
      boundary: 'opener-rebid-boundary-after-direct-gerber' },
    { name: 'Gerber over 2NT', opener: '2NT', response: '4C',
      boundary: 'opener-rebid-boundary-after-direct-gerber' },
    { name: 'Blackwood after 1H', opener: '1H', response: '4NT',
      boundary: 'opener-rebid-boundary-after-direct-blackwood' },
    { name: 'Blackwood after 1D', opener: '1D', response: '4NT',
      boundary: 'opener-rebid-boundary-after-direct-blackwood' },
    { name: 'Quantitative NT is not Gerber or Blackwood', opener: '1NT', response: '4NT' },
  ];
  for (const test of slamCases) {
    const { board } = makeRuleTestBoard({ description: test.name,
      north: oneNt, south: { S: 'QJ86', H: 'A74', D: 'A53', C: 'K42' }, practiceAuction: [test.opener] });
    const auction = [test.opener, 'Pass', test.response, 'Pass'] as Call[];
    const result = evaluateUserCall('Pass', board, auction, defaultBiddingSystem);
    const calls = getApplicableCandidateCalls(result);
    const boundaries = result.applicableRules.filter(({ kind }) => kind === 'scopeBoundary');
    checks++;
    if ((test.boundary !== undefined && calls.length > 0) || (test.boundary !== undefined
        ? !boundaries.some(({ id }) => id === test.boundary)
        : boundaries.some(({ id }) => id.includes('gerber') || id.includes('blackwood')))) {
      failures++;
      console.error(`FAIL ${test.name}: candidates ${formatCandidates(calls)}, ` +
                    `boundaries ${boundaries.map(({ id }) => id).join(', ')}`);
    }
  }
  console.log(`${failures} ***FAILURES***. Strong 2C, Jacoby 2NT, splinters and slam boundaries: ` +
              `${checks} focused checks.\n`);
  return failures;
}

/// Keep fourth-seat practice honest: BOTH intervening Passes must be sound according
/// to the current rules, not merely preloaded calls to reach the balancing lesson.
function runBalancingAuctionAndDealTests (): number {
  let failures = 0;
  let checks = 0;
  for (const deal of BALANCING_TEST_DEALS) {
    const { board } = makeRuleTestBoard(deal);
    const system = { ...defaultBiddingSystem, ...deal.requiredSystem };
    const opening = deal.practiceAuction[0]!;
    const openingCandidates = getApplicableCandidateCalls(evaluateUserCall(opening, board,
      [], system));
    checks += 1;
    if (openingCandidates[0]?.call !== opening) {
      failures += 1;
      console.error(`FAIL balancing deal opening ${deal.description}: ` +
        `${formatCandidates(openingCandidates)}`);
    }
    for (const prefix of [[opening], [opening, 'Pass']] as Call[][]) {
      const candidates = getApplicableCandidateCalls(evaluateUserCall('Pass', board,
        prefix, system));
      checks += 1;
      if (candidates.length !== 1 || candidates[0]?.call !== 'Pass') {
        failures += 1;
        console.error(`FAIL balancing deal unsupported intervening Pass: ${deal.description}, ` +
          `${prefix.join(' ')} -> ${formatCandidates(candidates)}`);
      }
    }
    const decision = evaluateUserCall(deal.practiceAuction[3]!, board,
      deal.practiceAuction.slice(0, 3), system);
    const calls = getApplicableCandidateCalls(decision);
    checks += 1;
    if (getNextBiddingRuleStage(board.dealer, deal.practiceAuction.slice(0, 3)) !== 'balancing' ||
        !calls.some(({ call }) => call === deal.practiceAuction[3]) ||
        calls.some(({ rule }) => rule.id.startsWith('overcall-'))) {
      failures += 1;
      console.error(`FAIL balancing stage/direct-seat isolation: ${deal.description}, ` +
        `${formatCandidates(calls)}`);
    }
  }
  // Only an opposing one-level SUIT opening and exactly two intervening Passes qualify.
  const seatCases: { auction: Call[]; expected: ReturnType<typeof getNextBiddingRuleStage> }[] = [
    { auction: ['1H', 'Pass', 'Pass'], expected: 'balancing' },
    { auction: ['Pass', '1D', 'Pass', 'Pass'], expected: 'balancing' },
    { auction: ['1H'], expected: 'overcalling' },
    { auction: ['1H', 'Pass', '2H'], expected: null },
    { auction: ['1NT', 'Pass', 'Pass'], expected: null },
    { auction: ['2H', 'Pass', 'Pass'], expected: null },
    { auction: ['1H', 'Pass', 'Pass', 'Pass'], expected: null },
    { auction: ['1H', 'Double', 'Pass'], expected: 'advancing' },
  ];
  for (const { auction, expected } of seatCases) {
    checks += 1;
    if (getNextBiddingRuleStage('W', auction) !== expected) {
      failures += 1;
      console.error(`FAIL balancing stage for ${auction.join(' ')}: ` +
        `expected ${expected}, got ${getNextBiddingRuleStage('W', auction)}.`);
    }
  }
  const ntDeal = BALANCING_TEST_DEALS.find((deal) => deal.practiceAuction[3] === '1NT')!;
  const ntCandidates = getApplicableCandidateCalls(evaluateUserCall('1NT',
    makeRuleTestBoard(ntDeal).board, ntDeal.practiceAuction.slice(0, 3), defaultBiddingSystem));
  checks += 1;
  if (!ntCandidates.some(({ call }) => call === 'Pass') ||
      !ntCandidates.some(({ call, rule }) => call === '1NT' &&
        rule.id === 'balance-natural-1nt')) {
    failures += 1;
    console.error('FAIL balancing 1NT and defensive Pass should coexist on a borderline hand.');
  }
  console.log(`${failures} ***FAILURES***. Balancing seat and complete deal plausibility: ` +
    `${checks} checks (including both intervening Passes in all six complete hands).\n`);
  return failures;
}

/// B1: after responder's simple major raise, answer opener's natural help-suit or balanced
/// game try.  Check the actual context and alternative bids, not just a recorded practice call.
function runResponderAfterMajorGameTryTests (): number {
  const spadeOpener = { S: 'AQJ85', H: 'K74', D: 'A72', C: 'K8' };
  const heartOpener = { S: 'K74', H: 'AQJ85', D: 'A72', C: 'K8' };
  const cases: {
    name: string; north: typeof spadeOpener; south: typeof spadeOpener;
    auction: Call[]; expected: Call[]; boundary?: boolean;
  }[] = [
    { name: 'Six points decline 3D help-suit try in spades', north: spadeOpener,
      south: { S: 'K63', H: 'Q85', D: 'J64', C: 'T942' },
      auction: ['1S', 'Pass', '2S', 'Pass', '3D', 'Pass'], expected: ['3S'] },
    { name: 'Eight points with diamond king accept the help-suit try', north: spadeOpener,
      south: { S: 'K63', H: 'Q85', D: 'K64', C: 'T942' },
      auction: ['1S', 'Pass', '2S', 'Pass', '3D', 'Pass'], expected: ['4S'] },
    { name: 'Eight points without diamond help decline the help-suit try', north: spadeOpener,
      south: { S: 'K63', H: 'Q85', D: 'J64', C: 'Q942' },
      auction: ['1S', 'Pass', '2S', 'Pass', '3D', 'Pass'], expected: ['3S'] },
    { name: 'Nine support points accept regardless of diamond help', north: spadeOpener,
      south: { S: 'K63', H: 'A85', D: 'Q64', C: 'T942' },
      auction: ['1S', 'Pass', '2S', 'Pass', '3D', 'Pass'], expected: ['4S'] },
    { name: 'Balanced 2NT try admits two decisions at eight points', north: spadeOpener,
      south: { S: 'K63', H: 'Q85', D: 'J64', C: 'Q942' },
      auction: ['1S', 'Pass', '2S', 'Pass', '2NT', 'Pass'], expected: ['3S', '4S'] },
    { name: 'Heart opener help-suit spade try declines at minimum', north: heartOpener,
      south: { S: 'Q85', H: 'K63', D: 'J64', C: 'T942' },
      auction: ['1H', 'Pass', '2H', 'Pass', '2S', 'Pass'], expected: ['3H'] },
    { name: 'Heart opener spade try accepts with ace in spades', north: heartOpener,
      south: { S: 'A85', H: 'K63', D: 'J64', C: 'T942' },
      auction: ['1H', 'Pass', '2H', 'Pass', '2S', 'Pass'], expected: ['4H'] },
    { name: 'Heart opener spade try declines without help', north: heartOpener,
      south: { S: 'J85', H: 'K63', D: 'Q64', C: 'Q942' },
      auction: ['1H', 'Pass', '2H', 'Pass', '2S', 'Pass'], expected: ['3H'] },
    { name: 'Unusually strong simple raiser receives explanation, not a forced signoff', north: spadeOpener,
      south: { S: 'K63', H: 'A85', D: 'K64', C: 'J942' },
      auction: ['1S', 'Pass', '2S', 'Pass', '3D', 'Pass'], expected: [], boundary: true },
    { name: 'Opener 3S raise is NOT a new-suit game try', north: spadeOpener,
      south: { S: 'K63', H: 'Q85', D: 'J64', C: 'T942' },
      auction: ['1S', 'Pass', '2S', 'Pass', '3S', 'Pass'], expected: [] },
    { name: 'A jump 3S over a heart fit is NOT the cheapest side-suit game try', north: heartOpener,
      south: { S: 'Q85', H: 'K63', D: 'J64', C: 'T942' },
      auction: ['1H', 'Pass', '2H', 'Pass', '3S', 'Pass'], expected: [] },
  ];
  let failures = 0;
  const gameTryIds = [
    'responder-rebid-decline-game-try-after-major-simple-raise',
    'responder-rebid-accept-game-try-after-major-simple-raise',
  ];
  for (const test of cases) {
    const { board } = makeRuleTestBoard({ description: test.name,
      north: test.north, south: test.south, practiceAuction: test.auction });
    const evaluation = evaluateUserCall('Pass', board, test.auction, defaultBiddingSystem);
    const found = getApplicableCandidateCalls(evaluation)
      .filter(({ rule }) => gameTryIds.includes(rule.id)).map(({ call }) => call);
    const boundaryFound = evaluation.applicableRules.some(({ id }) =>
      id === 'responder-rebid-boundary-after-major-simple-raise-game-try');
    if (found.length !== test.expected.length ||
        test.expected.some((call) => ! found.includes(call)) ||
        boundaryFound !== (test.boundary === true)) {
      failures += 1;
      console.error(`FAIL B1 ${test.name}: expected ${test.expected.join(', ') || '-'}, ` +
        `found ${found.join(', ') || '-'}, boundary=${boundaryFound}.`);
    }
    // A supported candidate should be available before input; unusual strength should stop
    // at a scope boundary.  No invented Pass is acceptable after opener's forcing game try.
    if (test.expected.length && getBiddingTurnStatus(board, test.auction, defaultBiddingSystem).kind !== 'supported') {
      failures += 1;
      console.error(`FAIL B1 ${test.name}: correct reply should have supported turn status.`);
    }
    if (test.expected.length && getApplicableCandidateCalls(evaluation)
        .some(({ call }) => call === 'Pass')) {
      failures += 1;
      console.error(`FAIL B1 ${test.name}: Pass must not satisfy a game-try reply rule.`);
    }
  }
  console.log(`${failures} ***FAILURES***. Responder answers to major game tries: ` +
    `${cases.length} targeted auction/hand checks.\n`);
  return failures;
}

/// B2: opener's optional splinter shows a fit and forces to game.  Responder must
/// distinguish it from an ordinary jump shift and from responder's *own* earlier
/// splinter.  Check both 1m/1M–1new-suit and 1M–2M auctions, including the minor fit.
function runResponderAfterOpenerSplinterTests (): number {
  const majorAfterHeart = { S: 'AQ52', H: 'AKJ85', D: 'K74', C: '6' };
  const minorOpener = { S: 'A74', H: 'KQ85', D: '6', C: 'AKJ52' };
  const simpleSpadeOpener = { S: 'AQJ85', H: '6', D: 'AK74', C: 'K82' };
  const simpleHeartOpener = { S: '6', H: 'AQJ85', D: 'AK74', C: 'K82' };
  const minorSupportOpener = { S: 'A74', H: '6', D: 'KQ85', C: 'AKJ52' };
  const cases: { name: string; north: { S: string; H: string; D: string; C: string };
    south: { S: string; H: string; D: string; C: string }; auction: Call[];
    expected: Call[]; boundary?: boolean; splinters?: boolean }[] = [
    { name: 'Heart opener splinters clubs for spades, minimum responder bids 4S',
      north: majorAfterHeart, south: { S: 'KJ83', H: '63', D: 'Q85', C: 'T942' },
      auction: ['1H', 'Pass', '1S', 'Pass', '4C', 'Pass'], expected: ['4S'] },
    { name: 'Heart opener splinters clubs for spades, stronger responder needs slam judgment',
      north: majorAfterHeart, south: { S: 'KJ83', H: '63', D: 'AQ5', C: 'KQ42' },
      auction: ['1H', 'Pass', '1S', 'Pass', '4C', 'Pass'], expected: [], boundary: true },
    { name: 'Minor opener splinters diamonds for hearts, responder bids 4H',
      north: minorOpener, south: { S: 'K63', H: 'AJ74', D: '985', C: 'T43' },
      auction: ['1C', 'Pass', '1H', 'Pass', '4D', 'Pass'], expected: ['4H'] },
    { name: 'Spade opener splinters hearts after 2S support raise',
      north: simpleSpadeOpener, south: { S: 'K63', H: 'K85', D: 'Q65', C: 'T943' },
      auction: ['1S', 'Pass', '2S', 'Pass', '4H', 'Pass'], expected: ['4S'] },
    { name: 'Heart opener splinters spades after 2H support raise',
      north: simpleHeartOpener, south: { S: 'K85', H: 'K63', D: 'Q65', C: 'T943' },
      auction: ['1H', 'Pass', '2H', 'Pass', '3S', 'Pass'], expected: ['4H'] },
    { name: 'Minor responder fit receives guidance rather than invented notrump game',
      north: minorSupportOpener, south: { S: 'K63', H: '985', D: 'AJ74', C: 'T43' },
      auction: ['1C', 'Pass', '1D', 'Pass', '3H', 'Pass'], expected: [], boundary: true },
    { name: 'Splinters disabled: opener new-suit jump is not treated as a splinter',
      north: majorAfterHeart, south: { S: 'KJ83', H: '63', D: 'Q85', C: 'T942' },
      auction: ['1H', 'Pass', '1S', 'Pass', '4C', 'Pass'], expected: [], splinters: false },
    { name: 'Natural second suit is not a splinter',
      north: majorAfterHeart, south: { S: 'KJ83', H: '63', D: 'Q85', C: 'T942' },
      auction: ['1H', 'Pass', '1S', 'Pass', '2C', 'Pass'], expected: [] },
    { name: 'Single jump shift is not a double-jump splinter',
      north: majorAfterHeart, south: { S: 'KJ83', H: '63', D: 'Q85', C: 'T942' },
      auction: ['1H', 'Pass', '1S', 'Pass', '3C', 'Pass'], expected: [] },
    { name: 'Uncontested game placement does not bleed into competition',
      north: majorAfterHeart, south: { S: 'KJ83', H: '63', D: 'Q85', C: 'T942' },
      auction: ['1H', 'Pass', '1S', '2D', '4C', 'Pass'], expected: [] },
  ];
  let failures = 0;
  const gameId = 'responder-rebid-game-after-opener-splinter';
  const boundaryIds = ['responder-rebid-boundary-after-opener-major-splinter',
    'responder-rebid-boundary-after-opener-minor-splinter'];
  for (const test of cases) {
    const { board } = makeRuleTestBoard({ description: test.name,
      north: test.north, south: test.south, practiceAuction: test.auction });
    const system = { ...defaultBiddingSystem, splinters: test.splinters ?? true };
    const evaluation = evaluateUserCall('Pass', board, test.auction, system);
    const actual = getApplicableCandidateCalls(evaluation)
      .filter(({ rule }) => rule.id === gameId).map(({ call }) => call);
    const boundary = evaluation.applicableRules.some(({ id }) => boundaryIds.includes(id));
    if (actual.length !== test.expected.length ||
        test.expected.some((call) => ! actual.includes(call)) || boundary !== (test.boundary === true)) {
      failures += 1;
      console.error(`FAIL B2 ${test.name}: expected ${test.expected.join(', ') || '-'}, ` +
        `got ${actual.join(', ') || '-'}, boundary=${boundary}.`);
    }
    // Any qualified response to the splinter must be 4M, never Pass or the short suit.
    const status = getBiddingTurnStatus(board, test.auction, system);
    if ((test.expected.length > 0 && status.kind !== 'supported') ||
        (test.boundary && status.kind !== 'scopeBoundary')) {
      failures += 1;
      console.error(`FAIL B2 ${test.name}: expected supported/scopeBoundary, got ${status.kind}.`);
    }
  }
  console.log(`${failures} ***FAILURES***. Responder after opener splinter: ` +
              `${cases.length} targeted auction/hand checks.\n`);
  return failures;
}

/// B3: responder's original classic strong jump shift (17+ HCP) is game forcing.
/// Distinguish it from opener's strong second suit, permit Pass only at game,
/// and leave uncertain strain or exceptional slam values at an explicit boundary.
function runResponderAfterStrongJumpShiftTests (): number {
  const clubOpener = { S: 'KT76', H: 'Q42', D: 'AJ5', C: 'K83' };
  const strongHearts = { S: 'AQ5', H: 'AKJ98', D: 'K74', C: 'T6' };
  const heartOpener = { S: 'Q42', H: 'KT764', D: 'AJ5', C: 'K8' };
  const heartRepeatOpener = { S: 'Q42', H: 'KT9764', D: 'AJ', C: 'K8' };
  const strongSpades = { S: 'AKJ98', H: 'AQ5', D: 'K74', C: 'T6' };
  const spadeOpener = { S: 'KT976', H: 'Q42', D: 'AJ5', C: 'K8' };
  const strongSpadeNtOpener = { S: 'KT976', H: 'Q2', D: 'AJ5', C: 'K83' };
  const strongHeartNtResponder = { S: 'AQ', H: 'AKJ98', D: 'K74', C: 'T96' };
  const extraStrongHearts = { S: 'AQ5', H: 'AKQ98', D: 'K74', C: 'J6' };
  const extraStrongClubOpener = { S: 'KJT6', H: 'T42', D: 'AJ5', C: 'K83' };
  const cases: { name: string; north: typeof clubOpener; south: typeof clubOpener;
    auction: Call[]; expected: Call[]; boundary?: boolean; weak?: boolean }[] = [
    { name: 'Raise responder hearts: 4H reaches game', north: clubOpener,
      south: strongHearts, auction: ['1C', 'Pass', '2H', 'Pass', '3H', 'Pass'],
      expected: ['4H'] },
    { name: 'Raise responder spades: 4S reaches game', north: heartOpener,
      south: strongSpades, auction: ['1H', 'Pass', '2S', 'Pass', '3S', 'Pass'],
      expected: ['4S'] },
    { name: 'Opener repeats six hearts, responder raises 4H with a fit',
      north: heartRepeatOpener, south: strongSpades,
      auction: ['1H', 'Pass', '2S', 'Pass', '3H', 'Pass'], expected: ['4H'] },
    { name: 'Opener minimum 2NT, balanced responder raises 3NT',
      north: clubOpener, south: strongHearts,
      auction: ['1C', 'Pass', '2H', 'Pass', '2NT', 'Pass'], expected: ['3NT'] },
    { name: 'Opener raises directly to 4H: Pass is now permitted',
      north: spadeOpener, south: strongHearts,
      auction: ['1S', 'Pass', '3H', 'Pass', '4H', 'Pass'], expected: ['Pass'] },
    { name: 'Opener 3NT already reaches game: balanced responder may Pass',
      north: strongSpadeNtOpener, south: strongHeartNtResponder,
      auction: ['1S', 'Pass', '3H', 'Pass', '3NT', 'Pass'], expected: ['Pass'] },
    { name: 'Second-suit rebid without an established fit gets forcing guidance',
      north: clubOpener, south: strongHearts,
      auction: ['1C', 'Pass', '2H', 'Pass', '2S', 'Pass'],
      expected: [], boundary: true },
    { name: 'Nineteen HCP needs slam judgment even after a major raise',
      north: extraStrongClubOpener, south: extraStrongHearts,
      auction: ['1C', 'Pass', '2H', 'Pass', '3H', 'Pass'],
      expected: [], boundary: true },
    { name: 'Weak jump-shift agreement excludes strong continuations',
      north: clubOpener, south: strongHearts,
      auction: ['1C', 'Pass', '2H', 'Pass', '3H', 'Pass'],
      expected: [], weak: true },
    { name: 'Ordinary one-level response is not a strong jump shift',
      north: clubOpener, south: strongHearts,
      auction: ['1C', 'Pass', '1H', 'Pass', '2H', 'Pass'], expected: [] },
    { name: 'Opener strong jump shift after 1H response is a different family',
      north: clubOpener, south: strongHearts,
      auction: ['1C', 'Pass', '1H', 'Pass', '2S', 'Pass'], expected: [] },
    { name: 'Double jump is not a classic single strong jump shift',
      north: clubOpener, south: strongHearts,
      auction: ['1C', 'Pass', '3H', 'Pass', '4H', 'Pass'], expected: [] },
    { name: 'Competitor intervened: do not inherit uncontested response meaning',
      north: clubOpener, south: strongHearts,
      auction: ['1C', 'Pass', '2H', 'Double', '3H', 'Pass'], expected: [] },
  ];
  const gameId = 'responder-rebid-game-after-strong-responder-jump-shift';
  const boundaryId = 'responder-rebid-boundary-after-strong-responder-jump-shift';
  let failures = 0;
  for (const test of cases) {
    const { board } = makeRuleTestBoard({ description: test.name, north: test.north,
      south: test.south, practiceAuction: test.auction });
    const system = { ...defaultBiddingSystem, jumpShift: test.weak ? 'weak' as const : 'strong' as const };
    const result = evaluateUserCall('Pass', board, test.auction, system);
    const actual = getApplicableCandidateCalls(result)
      .filter(({ rule }) => rule.id === gameId).map(({ call }) => call);
    const boundary = result.applicableRules.some(({ id }) => id === boundaryId);
    if (actual.length !== test.expected.length ||
        test.expected.some((call) => !actual.includes(call)) ||
        boundary !== (test.boundary === true)) {
      failures += 1;
      console.error(`FAIL B3 ${test.name}: expected ${test.expected.join(', ') || '-'}, ` +
        `got ${actual.join(', ') || '-'}, boundary ${boundary}.`);
    }
    if (test.expected.length || test.boundary) {
      const status = getBiddingTurnStatus(board, test.auction, system);
      const expectedKind = test.expected.length ? 'supported' : 'scopeBoundary';
      if (status.kind !== expectedKind) {
        failures += 1;
        console.error(`FAIL B3 ${test.name}: expected ${expectedKind} status, got ${status.kind}.`);
      }
      const passIsAllowed = getApplicableCandidateCalls(result).some(({ call }) => call === 'Pass');
      if (test.auction[4] !== '3NT' && test.auction[4] !== '4H' &&
          test.auction[4] !== '4S' && passIsAllowed) {
        failures += 1;
        console.error(`FAIL B3 ${test.name}: Pass below game cannot satisfy a game force.`);
      }
    }
  }
  console.log(`${failures} ***FAILURES***. B3 responder after strong jump shift: ` +
              `${cases.length} constructed auction/hand checks.\n`);
  return failures;
}

/// Turn status is derived independently of recorded practice length; an unjudged intervening
/// call is not mistaken for the end of modeled bidding.
/// B5: stronger minor-opening hands after artificial Jordan 2NT or a support cuebid
/// require a truthful boundary rather than an invented 3NT/minor game.  Confirm that the
/// underlying response was itself a qualifying artificial support bid, and that a minimum
/// opener still has the existing concrete 3m continuation.
function runStrongMinorArtificialSupportTests (): number {
  type HandShape = { S: string; H: string; D: string; C: string };
  const minD: HandShape = { S: 'K72', H: 'A43', D: 'ATJ74', C: '83' }; // 13 support points
  const middleD: HandShape = { S: 'K72', H: 'A43', D: 'AQT74', C: '83' }; // 14 support points
  const extraD: HandShape = { S: 'K72', H: 'A43', D: 'AQJ74', C: '83' }; // 15 support points
  const minC: HandShape = { S: 'K72', H: 'A43', D: '83', C: 'ATJ74' };
  const middleC: HandShape = { S: 'K72', H: 'A43', D: '83', C: 'AQT74' };
  const extraC: HandShape = { S: 'K72', H: 'A43', D: '83', C: 'AQJ74' };
  const southD: HandShape = { S: 'T98', H: 'QJ5', D: 'K986', C: 'AKT' };
  const southC: HandShape = { S: 'AJ8', H: 'KJ5', D: '96', C: 'K9865' };
  const cases: { name: string; auction: Call[]; north: HandShape; south: HandShape;
    firstResponse: Call; responseRuleId: string; minCall?: Call; expectedBoundary?: string }[] = [
    { name: 'Jordan diamond minimum rebids 3D', auction: ['1D', 'Double', '2NT', 'Pass'],
      north: minD, south: southD, firstResponse: '2NT',
      responseRuleId: 'respond-after-double-jordan-2nt-support', minCall: '3D' },
    { name: 'Jordan diamond extras stop with scope guidance',
      auction: ['1D', 'Double', '2NT', 'Pass'], north: extraD, south: southD,
      firstResponse: '2NT', responseRuleId: 'respond-after-double-jordan-2nt-support',
      expectedBoundary: 'opener-rebid-scope-boundary-after-minor-jordan-2nt-extras' },
    { name: 'Jordan diamond 14-point hand still rebids 3D',
      auction: ['1D', 'Double', '2NT', 'Pass'], north: middleD, south: southD,
      firstResponse: '2NT', responseRuleId: 'respond-after-double-jordan-2nt-support',
      minCall: '3D' },
    { name: 'Jordan club minimum rebids 3C', auction: ['1C', 'Double', '2NT', 'Pass'],
      north: minC, south: southC, firstResponse: '2NT',
      responseRuleId: 'respond-after-double-jordan-2nt-support', minCall: '3C' },
    { name: 'Jordan club extras stop with scope guidance',
      auction: ['1C', 'Double', '2NT', 'Pass'], north: extraC, south: southC,
      firstResponse: '2NT', responseRuleId: 'respond-after-double-jordan-2nt-support',
      expectedBoundary: 'opener-rebid-scope-boundary-after-minor-jordan-2nt-extras' },
    { name: 'Cuebid diamond minimum rebids 3D', auction: ['1D', '1H', '2H', 'Pass'],
      north: minD, south: southD, firstResponse: '2H',
      responseRuleId: 'respond-over-suit-support-cuebid', minCall: '3D' },
    { name: 'Cuebid diamond extras retain existing scope guidance',
      auction: ['1D', '1H', '2H', 'Pass'], north: extraD, south: southD,
      firstResponse: '2H', responseRuleId: 'respond-over-suit-support-cuebid',
      expectedBoundary: 'opener-rebid-scope-boundary-after-minor-support-cuebid-extras' },
    { name: 'Cuebid diamond 14-point hand reaches boundary',
      auction: ['1D', '1H', '2H', 'Pass'], north: middleD, south: southD,
      firstResponse: '2H', responseRuleId: 'respond-over-suit-support-cuebid',
      expectedBoundary: 'opener-rebid-scope-boundary-after-minor-support-cuebid-extras' },
    { name: 'Cuebid club minimum rebids 3C', auction: ['1C', '1H', '2H', 'Pass'],
      north: minC, south: southC, firstResponse: '2H',
      responseRuleId: 'respond-over-suit-support-cuebid', minCall: '3C' },
    { name: 'Cuebid club 14-point hand reaches boundary',
      auction: ['1C', '1H', '2H', 'Pass'], north: middleC, south: southC,
      firstResponse: '2H', responseRuleId: 'respond-over-suit-support-cuebid',
      expectedBoundary: 'opener-rebid-scope-boundary-after-minor-support-cuebid-extras' },
    { name: 'Cuebid club extras retain existing scope guidance',
      auction: ['1C', '1H', '2H', 'Pass'], north: extraC, south: southC,
      firstResponse: '2H', responseRuleId: 'respond-over-suit-support-cuebid',
      expectedBoundary: 'opener-rebid-scope-boundary-after-minor-support-cuebid-extras' },
  ];
  let failures = 0;
  for (const test of cases) {
    const { board } = makeRuleTestBoard({ description: test.name, practiceAuction: test.auction,
      north: test.north, south: test.south });
    const response = getApplicableCandidateCalls(evaluateUserCall(test.firstResponse, board,
      test.auction.slice(0, 2), defaultBiddingSystem));
    if (!response.some(({ rule, call }) => call === test.firstResponse &&
        rule.id === test.responseRuleId)) {
      failures++;
      console.error(`FAIL B5 ${test.name}: responder's artificial support bid did not qualify.`);
    }
    const result = evaluateUserCall(test.minCall ?? 'Pass', board, test.auction,
      defaultBiddingSystem);
    const options = getApplicableCandidateCalls(result);
    const status = getBiddingTurnStatus(board, test.auction, defaultBiddingSystem);
    if (test.minCall !== undefined) {
      const ruleId = test.firstResponse === '2NT'
        ? 'opener-rebid-three-of-suit-after-jordan-2nt-minimum'
        : 'opener-rebid-three-of-suit-after-support-cuebid-minimum';
      if (!options.some(({ call, rule }) => call === test.minCall && rule.id === ruleId) ||
          status.kind !== 'supported') {
        failures++;
        console.error(`FAIL B5 ${test.name}: expected ${test.minCall} and supported status, ` +
          `got ${formatCandidates(options)} / ${status.kind}.`);
      }
    } else if (status.kind !== 'scopeBoundary' ||
               status.rule.id !== test.expectedBoundary || options.length > 0) {
      failures++;
      console.error(`FAIL B5 ${test.name}: expected boundary ${test.expectedBoundary}, got ` +
        `${status.kind}, ${status.kind === 'scopeBoundary' ? status.rule.id : '-'}, ` +
        `${formatCandidates(options)}.`);
    }
  }
  // Similar-looking auctions must not pick up the artificial minor support boundary.
  const { board: nonJordanBoard } = makeRuleTestBoard({
    description: 'Natural 2NT is not Jordan without a takeout Double',
    practiceAuction: ['1D', 'Pass', '2NT', 'Pass'], north: extraD, south: southD,
  });
  const notJordan = evaluateUserCall('Pass', nonJordanBoard,
    ['1D', 'Pass', '2NT', 'Pass'], defaultBiddingSystem);
  if (notJordan.applicableRules.some(({ id }) =>
      id === 'opener-rebid-scope-boundary-after-minor-jordan-2nt-extras')) {
    failures++;
    console.error('FAIL B5: uncontested 2NT acquired the artificial Jordan boundary.');
  }
  const { board: majorBoard } = makeRuleTestBoard({
    description: 'Jordan major game still has concrete rebid',
    practiceAuction: ['1H', 'Double', '2NT', 'Pass'],
    north: { S: 'K72', H: 'AKQ96', D: 'Q53', C: '54' },
    south: { S: 'T98', H: 'J75', D: 'K986', C: 'AKT' },
  });
  const majorResult = evaluateUserCall('4H', majorBoard,
    ['1H', 'Double', '2NT', 'Pass'], defaultBiddingSystem);
  if (majorResult.applicableRules.some(({ id }) =>
      id === 'opener-rebid-scope-boundary-after-minor-jordan-2nt-extras')) {
    failures++;
    console.error('FAIL B5: major-suit Jordan acquired minor-suit scope boundary.');
  }
  console.log(`${failures} ***FAILURES***. B5 strong minor artificial-support continuations: ` +
              `${cases.length + 2} targeted checks.\n`);
  return failures;
}

/// B6/B7: slam-control replies require explicit stopping guidance, while an accepted
/// forcing responder rebid (or balancing Double) must not appear to end real bidding.
/// Check the preceding actual call against the production evaluator before inferring a force.
function runLaterStageTerminationGuidanceTests (): number {
  let failures = 0;
  let checks = 0;
  const ntCases = [
    { name: '1NT-3H slam try followed by 3S control',
      auction: ['1NT', 'Pass', '3H', 'Pass', '3S', 'Pass'] as Call[],
      north: { S: 'KQ4', H: 'A74', D: 'A96', C: 'KJ82' },
      south: { S: 'AJ6', H: 'KQJT96', D: 'KQ5', C: '7' } },
    { name: '1NT-3S slam try followed by 4C control',
      auction: ['1NT', 'Pass', '3S', 'Pass', '4C', 'Pass'] as Call[],
      north: { S: 'A64', H: 'KJ7', D: 'A96', C: 'KQ82' },
      south: { S: 'KQJT95', H: 'AQ4', D: 'KJ5', C: '7' } },
  ];
  const boundaryId = 'responder-rebid-boundary-after-1nt-direct-major-slam-control';
  for (const test of ntCases) {
    const { board } = makeRuleTestBoard({ description: test.name, north: test.north,
      south: test.south, practiceAuction: test.auction });
    checks++;
    const response = test.auction[2]!;
    const openerControl = test.auction[4]!;
    const responderMatches = evaluateUserCall(response, board,
      test.auction.slice(0, 2), defaultBiddingSystem).userCallMatchingRules;
    const openerMatches = evaluateUserCall(openerControl, board,
      test.auction.slice(0, 4), defaultBiddingSystem).userCallMatchingRules;
    const status = getBiddingTurnStatus(board, test.auction, defaultBiddingSystem);
    if (! responderMatches.some(({ id }) => id === 'respond-to-1nt-w/-3h-3s-slam-interest') ||
        ! openerMatches.some(({ id }) =>
          id === 'opener-rebid-control-after-1nt-direct-3-major-slam-interest') ||
        status.kind !== 'scopeBoundary' ||
        (status.kind === 'scopeBoundary' && status.rule.id !== boundaryId)) {
      failures++;
      console.error(`FAIL B6 ${test.name}: response ${responderMatches.map(r=>r.id)}, ` +
        `control ${openerMatches.map(r=>r.id)}, status ${status.kind}.`);
    }
    checks++;
    const noTransfer = { ...defaultBiddingSystem, jacobyTransfers: false };
    if (getBiddingTurnStatus(board, test.auction, noTransfer).kind === 'scopeBoundary' &&
        evaluateUserCall('Pass', board, test.auction, noTransfer).applicableRules
          .some(({ id }) => id === boundaryId)) {
      failures++;
      console.error(`FAIL B6 ${test.name}: direct slam-control boundary leaked with Jacoby off.`);
    }
  }
  const { board: ntBoard } = makeRuleTestBoard({ description: 'B6 unrelated NT rebid',
    north: ntCases[0]!.north, south: ntCases[0]!.south,
    practiceAuction: ['1NT', 'Pass', '3H', 'Pass', '4H', 'Pass'] });
  for (const auction of [
    ['1NT', 'Pass', '3H', 'Pass', '4H', 'Pass'],
    ['1NT', 'Pass', '3H', 'Double', '3S', 'Pass'],
    ['2NT', 'Pass', '3H', 'Pass', '3S', 'Pass'],
  ] as Call[][]) {
    checks++;
    if (evaluateUserCall('Pass', ntBoard, auction, defaultBiddingSystem).applicableRules
      .some(({ id }) => id === boundaryId)) {
      failures++;
      console.error(`FAIL B6 scope boundary leaked after ${auction.join(' ')}.`);
    }
  }
  const forceCases = [
    { name: '2/1 slow major raise game force',
      auction: ['1S','Pass','2D','Pass','2H','Pass','3S'] as Call[],
      north: { S: 'AQJ85', H: 'K74', D: 'A72', C: 'K8' },
      south: { S: 'KT6', H: 'Q852', D: 'KQJ64', C: 'A' },
      system: { ...defaultBiddingSystem, twoLevelNewSuitResponse: 'twoOverOne' as const },
      expected: 'gameForce' as const },
    { name: 'five-card responder major after strong 2NT',
      auction: ['1C','Pass','1H','Pass','2NT','Pass','3H'] as Call[],
      north: { S: 'KQ4', H: 'A73', D: 'KJ7', C: 'AQ82' },
      south: { S: 'T65', H: 'KQJ98', D: 'QT4', C: '54' },
      system: defaultBiddingSystem, expected: 'gameForce' as const },
    { name: 'nonforcing game signoff must not carry game force',
      auction: ['1C','Pass','1H','Pass','2NT','Pass','3NT'] as Call[],
      north: { S: 'KQ4', H: 'A73', D: 'KJ7', C: 'AQ82' },
      south: { S: 'T65', H: 'KQ98', D: 'QT4', C: '654' },
      system: defaultBiddingSystem, expected: null },
  ];
  for (const test of forceCases) {
    checks++;
    const { board } = makeRuleTestBoard({ description: test.name, north: test.north,
      south: test.south, practiceAuction: test.auction });
    const last = test.auction[test.auction.length - 1]!;
    const previous = test.auction.slice(0,-1);
    const matches = evaluateUserCall(last, board, previous, test.system).userCallMatchingRules;
    const status = getBiddingTurnStatus(board, test.auction, test.system);
    const obligation = getUnmodeledContinuationForce(board, test.auction, test.system);
    if (matches.length === 0 || status.kind !== 'noModeledStage' ||
        (obligation?.kind ?? null) !== test.expected) {
      failures++;
      console.error(`FAIL B7 ${test.name}: matches ${matches.map(r=>r.id)}, ` +
        `status ${status.kind}, obligation ${obligation?.kind ?? '-'} expected ${test.expected}.`);
    }
  }
  // Cover forcing endpoints from each partnership role, not only responder's rebid.
  // Each auction is taken from an existing fully specified practice fixture.
  const endpointExamples: { auction: Call[]; stage: string; kind: string }[] = [
    { auction: ['1D', 'Pass', '1NT', 'Pass', '2H'],
      stage: 'openerRebid', kind: 'oneRoundForce' },
    { auction: ['1D', 'Pass', '1NT', 'Pass', '3C'],
      stage: 'openerRebid', kind: 'gameForce' },
    { auction: ['1D', '1S', '2D', '3D', 'Pass'],
      stage: 'advancing', kind: 'oneRoundForce' },
    { auction: ['1H', 'Double'],
      stage: 'overcalling', kind: 'oneRoundForce' },
    { auction: ['1S', 'Pass', '2H'],
      stage: 'responding', kind: 'oneRoundForce' },
  ];
  const allDeals = [...new Set(RULE_TEST_DEAL_BUCKETS.flatMap((bucket) => bucket.deals))];
  for (const test of endpointExamples) {
    checks++;
    const example = allDeals.find((deal) =>
      deal.practiceAuction.join(' ') === test.auction.join(' '));
    if (example === undefined) {
      failures++;
      console.error(`FAIL forcing endpoint fixture absent: ${test.auction.join(' ')}.`);
      continue;
    }
    const { board } = makeRuleTestBoard(example);
    const force = getUnmodeledContinuationForce(board, test.auction,
      { ...defaultBiddingSystem, ...example.requiredSystem });
    if (force?.kind !== test.kind || force.lastStage !== test.stage) {
      failures++;
      console.error(`FAIL forcing ${test.auction.join(' ')}: ` +
        `${force?.lastStage ?? '-'} ${force?.kind ?? '-'} versus ${test.stage} ${test.kind}.`);
    }
  }
  // The 2/1 game force persists through opener's nonforcing descriptive rebid, but
  // not after the partnership has reached game or the opponents have intervened.
  const original = forceCases[0]!;
  const { board: gameBoard } = makeRuleTestBoard({ description: 'Persistent 2/1 force',
    north: original.north, south: original.south, practiceAuction: original.auction });
  const gameSystem = original.system;
  const prefixes: { auction: Call[]; expected: string | null }[] = [
    { auction: ['1S','Pass','2D','Pass','2H'], expected: 'gameForce' },
    { auction: ['1S','Pass','2D','Pass','2H','Pass'], expected: 'gameForce' },
    { auction: ['1S','Pass','2D','Pass','2H','Double'], expected: null },
    { auction: ['1S','Pass','2D','Pass','2H','Pass','4S'], expected: null },
  ];
  for (const test of prefixes) {
    checks++;
    const kind = getUnmodeledContinuationForce(gameBoard, test.auction, gameSystem)?.kind ?? null;
    if (kind !== test.expected) {
      failures++;
      console.error(`FAIL continuing 2/1 game force after ${test.auction.join(' ')}: ` +
        `${kind ?? '-'}, expected ${test.expected ?? '-'}.`);
    }
  }
  const balancing = BALANCING_TEST_DEALS.find((deal) =>
    deal.expectedBalancingCalls?.some((expected) => expected.ruleIds.includes('balance-takeout-double')))!;
  const { board: balancingBoard } = makeRuleTestBoard(balancing);
  checks++;
  const balancingForce = getUnmodeledContinuationForce(balancingBoard,
    balancing.practiceAuction, defaultBiddingSystem);
  if (balancingForce?.kind !== 'oneRoundForce' || balancingForce.lastStage !== 'balancing') {
    failures++;
    console.error(`FAIL B7 balancing Double: ${JSON.stringify(balancingForce)}.`);
  }
  console.log(`${failures} ***FAILURES***. B6/B7 further-slam and forcing-endpoint checks: ` +
    `${checks} targeted cases.\n`);
  return failures;
}

/// C3: a missing direct-seat defense is an explicit explanatory boundary, not an
/// automatic Pass.  The ordinary fallback Pass and actual DONT/overcall actions retain priority.
function runUnmodeledDirectDefenseBoundaryTests (): number {
  const weak = { S: '987', H: 'J876', D: '963', C: '854' };
  const strongBalanced = { S: 'AK7', H: 'KQ4', D: 'AJ6', C: 'Q742' }; // 19 HCP
  const strongDont = { S: 'AK7', H: 'KQJ987', D: 'AJ', C: 'Q4' }; // 20 HCP, six good hearts
  const naturalOvercall = { S: 'AKQJ6', H: '84', D: 'J963', C: '85' };
  // Construct the other seats from the unused deck, so every diagnostic case has
  // a legal 52-card deal without asserting unrealistic prior bidding for the opponents.
  const makeBoard = (name: string, east: typeof weak, auction: Call[], dealer: 'N' | 'W' = 'N') => {
    const suits = ['S', 'H', 'D', 'C'] as const;
    const remaining = suits.flatMap((suit) => [...'AKQJT98765432'].map((rank) =>
      [suit, rank] as const).filter(([, rank]) => !east[suit].includes(rank)));
    const toHand = (cards: typeof remaining) => {
      const hand = { S: '', H: '', D: '', C: '' };
      for (const [suit, rank] of cards) hand[suit] += rank;
      return hand;
    };
    return makeRuleTestBoard({ description: name, dealer, practiceAuction: auction,
      east, north: toHand(remaining.slice(0, 13)), south: toHand(remaining.slice(13, 26)) });
  };
  const cases: {
    name: string;
    auction: Call[];
    east: typeof weak;
    expectedStatus: ReturnType<typeof getBiddingTurnStatus>['kind'];
    expectedBoundary?: string;
    expectedCall?: Call;
    expectedRule?: string;
    dealer?: 'N' | 'W';
  }[] = [
    { name: 'ordinary weak direct seat', auction: ['1D'], east: weak,
      expectedStatus: 'supported', expectedCall: 'Pass',
      expectedRule: 'overcall-pass-no-qualifying-action' },
    { name: 'ordinary constructive action suppresses Pass', auction: ['1D'],
      east: naturalOvercall, expectedStatus: 'supported', expectedCall: '1S',
      expectedRule: 'overcall-simple-suit-at-one-level' },
    { name: 'ordinary 1NT defense Pass', auction: ['1NT'], east: weak,
      expectedStatus: 'supported', expectedCall: 'Pass',
      expectedRule: 'overcall-pass-no-qualifying-action' },
    { name: '19 HCP balanced after opposing 1NT', auction: ['1NT'], east: strongBalanced,
      expectedStatus: 'scopeBoundary', expectedBoundary: 'overcall-boundary-strong-hand-vs-1nt' },
    { name: '20 HCP strong DONT eligible', auction: ['1NT'], east: strongDont,
      expectedStatus: 'supported', expectedCall: 'Double',
      expectedRule: 'overcall-dont-single-suit-double' },
    { name: '19 HCP after 1NT with nondealer opening', auction: ['Pass', '1NT'],
      east: strongBalanced, expectedStatus: 'scopeBoundary',
      expectedBoundary: 'overcall-boundary-strong-hand-vs-1nt', dealer: 'W' },
    { name: 'strong artificial 2C defense', auction: ['2C'], east: weak,
      expectedStatus: 'scopeBoundary', expectedBoundary: 'overcall-boundary-strong-2c-opening' },
    { name: 'strong 2NT defense', auction: ['2NT'], east: strongBalanced,
      expectedStatus: 'scopeBoundary', expectedBoundary: 'overcall-boundary-strong-2nt-opening' },
    { name: 'three-level preempt 3C', auction: ['3C'], east: weak,
      expectedStatus: 'scopeBoundary', expectedBoundary: 'overcall-boundary-three-level-preempt' },
    { name: 'three-level preempt 3S', auction: ['3S'], east: strongBalanced,
      expectedStatus: 'scopeBoundary', expectedBoundary: 'overcall-boundary-three-level-preempt' },
    { name: 'high-level opening 3NT', auction: ['3NT'], east: weak,
      expectedStatus: 'scopeBoundary', expectedBoundary: 'overcall-boundary-very-high-opening' },
    { name: 'high-level opening 4H', auction: ['4H'], east: weak,
      expectedStatus: 'scopeBoundary', expectedBoundary: 'overcall-boundary-very-high-opening' },
    { name: 'high-level opening 5D', auction: ['5D'], east: strongBalanced,
      expectedStatus: 'scopeBoundary', expectedBoundary: 'overcall-boundary-very-high-opening' },
    { name: 'high-level opening 7NT', auction: ['7NT'], east: weak,
      expectedStatus: 'scopeBoundary', expectedBoundary: 'overcall-boundary-very-high-opening' },
    { name: 'ordinary weak-two Pass remains', auction: ['2H'], east: weak,
      expectedStatus: 'supported', expectedCall: 'Pass',
      expectedRule: 'overcall-pass-no-qualifying-action' },
  ];
  let failures = 0;
  for (const test of cases) {
    const { board } = makeBoard(test.name, test.east, test.auction, test.dealer ?? 'N');
    const status = getBiddingTurnStatus(board, test.auction, defaultBiddingSystem);
    const candidates = getApplicableCandidateCalls(evaluateUserCall('Pass', board,
      test.auction, defaultBiddingSystem));
    const boundary = status.kind === 'scopeBoundary' ? status.rule.id : null;
    const expectedAction = candidates.some(({ call, rule }) =>
      call === test.expectedCall && rule.id === test.expectedRule);
    const hasFallbackPass = candidates.some(({ rule }) =>
      rule.id === 'overcall-pass-no-qualifying-action');
    const good = status.kind === test.expectedStatus &&
      (test.expectedBoundary === undefined
        ? expectedAction && (test.expectedCall === 'Pass' || !hasFallbackPass)
        : boundary === test.expectedBoundary && candidates.length === 0);
    if (!good) {
      failures++;
      console.error(`FAIL C3 ${test.name}: status ${status.kind}, boundary ${boundary ?? '-'}, ` +
        `candidates ${candidates.map(({ call, rule }) => `${call}:${rule.id}`).join(', ')}.`);
    }
  }
  // A natural fourth-seat balancing decision must not be mistaken for a direct defense boundary.
  const { board: balancingBoard } = makeBoard('C3 balancing stays separate',
    strongBalanced, ['1H', 'Pass', 'Pass']);
  const balancing = getBiddingTurnStatus(balancingBoard,
    ['1H', 'Pass', 'Pass'], defaultBiddingSystem);
  if (balancing.kind === 'scopeBoundary' &&
      balancing.rule.id.startsWith('overcall-boundary-')) {
    failures++;
    console.error('FAIL C3: direct-seat defense boundary leaked into fourth-seat balancing.');
  }
  console.log(`${failures} ***FAILURES***. C3 omitted direct defenses: ` +
    `${cases.length + 1} targeted checks.\n`);
  return failures;
}

function runBiddingTurnStatusTests (): number {
  const { board } = makeRuleTestBoard({ description: 'Bidding-turn status smoke checks',
    north: { S: 'AQJ85', H: 'K74', D: 'A72', C: 'K8' },
    south: { S: 'K63', H: 'Q85', D: 'J64', C: 'T942' },
    practiceAuction: ['1S', 'Pass', '2S', 'Pass', '3D', 'Pass'] });
  let failures = 0;
  const examples: { auction: Call[]; kind: ReturnType<typeof getBiddingTurnStatus>['kind'] }[] = [
    { auction: [], kind: 'supported' },
    { auction: ['1S', 'Pass', '2S'], kind: 'noModeledStage' },
    { auction: ['1S', 'Pass', '2S', 'Pass'], kind: 'supported' },
    { auction: ['1S', 'Pass', '2S', 'Pass', '4S', 'Pass', 'Pass'], kind: 'noModeledStage' },
    { auction: ['1S', 'Pass', '2S', 'Pass', '4S', 'Pass', 'Pass', 'Pass'], kind: 'auctionComplete' },
  ];
  for (const { auction, kind } of examples) {
    const actual = getBiddingTurnStatus(board, auction, defaultBiddingSystem);
    if (actual.kind !== kind) {
      failures += 1;
      console.error(`FAIL coverage ${auction.join(' ')} expected ${kind}, got ${actual.kind}.`);
    }
  }
  const { board: boundaryBoard } = makeRuleTestBoard({
    description: 'Scope boundary at opener return after takeout Double',
    north: { S: 'K72', H: 'AKT96', D: 'Q53', C: '54' },
    south: { S: 'T98', H: 'QJ5', D: 'A96', C: '9732' },
    practiceAuction: ['1H', 'Double', 'Pass', 'Pass'] });
  // These have no modeled rule stage; auction entry no longer needs an intervening-turn exception.
  // Any legal call may be recorded, and stage selection uses the resulting actual auction.
  const intervening: { auction: Call[]; kind: ReturnType<typeof getBiddingTurnStatus>['kind'] }[] = [
    { auction: ['Pass', '1S', 'Pass', '2S'], kind: 'noModeledStage' },
    { auction: ['1S', 'Pass', '2S', 'Pass', '3C'], kind: 'noModeledStage' },
    { auction: ['1S', 'Pass', '2S', '2D'], kind: 'noModeledStage' },
    { auction: ['1S', 'Pass', '2S', 'Pass', '3C', '2D'], kind: 'noModeledStage' },
  ];
  for (const { auction, kind } of intervening) {
    const status = getBiddingTurnStatus(board, auction, defaultBiddingSystem);
    if (status.kind !== kind) {
      failures += 1;
      console.error(`FAIL unjudged turn ${auction.join(' ')}: expected ${kind}, got ${status.kind}.`);
    }
  }
  const boundary = getBiddingTurnStatus(boundaryBoard,
    ['1H', 'Double', 'Pass', 'Pass'], defaultBiddingSystem);
  if (boundary.kind !== 'scopeBoundary' ||
      boundary.rule.id !== 'opener-rebid-scope-boundary-after-takeout-double-pass-pass') {
    failures += 1;
    console.error(`FAIL existing scope boundary was not recognized: ${boundary.kind}.`);
  }
  console.log(`${failures} ***FAILURES***. Bidding-turn statuses: ${examples.length + intervening.length + 1} checks.\n`);
  return failures;
}


/// Regression for the former premature-termination bug: unsupported turns and explicit
/// boundaries do not prevent a legal physical auction from reaching later modeled decisions.
/// These check the evaluator/state path and mechanical auction legality; BidPanel is separately
/// responsible for disabling entry only when the auction or recorded practice is complete.
function runContinuousAuctionFeedbackTests (): number {
  const { board } = makeRuleTestBoard({
    description: 'Unjudged intermediate call progression',
    north: { S: 'AQJ85', H: 'K74', D: 'A72', C: 'K8' },
    south: { S: 'K63', H: 'Q85', D: 'J64', C: 'T942' },
    practiceAuction: ['1S', 'Pass', '2S', 'Pass', '3D', 'Pass'],
  });
  const sequences: { name: string; calls: Call[] }[] = [
    { name: 'DONT Double asking sequence', calls: ['1NT', 'Double', 'Pass', '2C', 'Pass', '2H'] },
    { name: 'DONT two-suited sequence', calls: ['1NT', '2C', 'Pass', '2D', 'Pass', '2H'] },
    { name: 'strong 2NT Stayman', calls: ['2NT', 'Pass', '3C', 'Pass', '3S'] },
    { name: 'strong 2C waiting', calls: ['2C', 'Pass', '2D', 'Pass', '2H'] },
    { name: 'weak two natural defense', calls: ['2D', '2H', 'Pass', 'Pass'] },
    { name: 'competitive opener rebid', calls: ['1NT', '2H', 'Double', 'Pass', '2S'] },
    { name: 'unexpected fourth-seat competition', calls: ['1S', 'Pass', '2S', '3D', 'Pass'] },
    { name: 'uncontested raiser game try', calls: ['1S', 'Pass', '2S', 'Pass', '3D', 'Pass'] },
    { name: 'boundary does not end auction', calls: ['2NT', 'Pass', '3C', 'Pass', '3H', 'Pass', 'Pass', 'Pass'] },
  ];
  let failures = 0;
  let checked = 0;
  for (const test of sequences) {
    const auction: Call[] = [];
    for (const call of test.calls) {
      const status = getBiddingTurnStatus(board, auction, defaultBiddingSystem);
      checked++;
      if (status.kind === 'auctionComplete' || !isCallAvailableInAuction(call, auction)) {
        failures++;
        console.error(`FAIL continuous ${test.name}: ${call} unavailable after ${auction.join(' ')}.`);
        break;
      }
      auction.push(call);
    }
    if (test.name === 'boundary does not end auction' && !auctionIsComplete(auction)) {
      failures++;
      console.error('FAIL continuous: legal Passes did not complete the auction.');
    }
  }
  // Use the actual DONT and 2NT-Stayman fixture hands to verify feedback resumes after
  // intervening Passes, including a turn with no rule and one with an explicit scope boundary.
  const dontDeal = DONT_1NT_DEFENSE_TEST_DEALS.find((deal) =>
    deal.practiceAuction.join(' ') === '1NT Double Pass 2C Pass 2H');
  const ntDeal = RESPONSE_AFTER_2NT_OPENING_TEST_DEALS.find((deal) =>
    deal.practiceAuction.join(' ') === '2NT Pass 3C');
  const expected: { deal: RuleTestDeal | undefined; stages: ReturnType<typeof getBiddingTurnStatus>['kind'][] }[] = [
    { deal: dontDeal,
      stages: ['supported', 'supported', 'noApplicableRule', 'supported',
        'noModeledStage', 'supported'] },
    { deal: ntDeal, stages: ['supported', 'scopeBoundary', 'supported'] },
  ];
  for (const test of expected) {
    if (test.deal === undefined) { failures++; continue; }
    const { board: fixtureBoard } = makeRuleTestBoard(test.deal);
    const auction: Call[] = [];
    for (const kind of test.stages) {
      const status = getBiddingTurnStatus(fixtureBoard, auction, defaultBiddingSystem);
      checked++;
      if (status.kind !== kind) {
        failures++;
        console.error(`FAIL continuous fixture ${test.deal.description}: ` +
          `${auction.join(' ')} expected ${kind}, got ${status.kind}.`);
      }
      const call = test.deal.practiceAuction[auction.length];
      if (call === undefined || !isCallAvailableInAuction(call, auction)) {
        failures++;
        console.error(`FAIL continuous fixture: call ${call} illegal after ${auction.join(' ')}.`);
        break;
      }
      auction.push(call);
    }
  }
  // Non-dealer opening and a scope boundary retain their status but cannot block Pass.
  for (const auction of [['Pass', '1S', 'Pass', '2S'], ['2NT'], ['1NT', 'Double']] as Call[][]) {
    checked++;
    const status = getBiddingTurnStatus(board, auction, defaultBiddingSystem);
    if (status.kind === 'auctionComplete' || !isCallAvailableInAuction('Pass', auction)) {
      failures++;
      console.error(`FAIL continuous: Pass blocked after ${auction.join(' ')}.`);
    }
  }
  // Continuing freely does not waive ordinary bridge legality or the 7NT maximum.
  for (const { input, auction } of [
    { input: '20H', auction: [] as Call[] },
    { input: '120NT', auction: [] as Call[] },
    { input: '1C', auction: ['1S'] as Call[] },
    { input: 'Double', auction: [] as Call[] },
  ]) {
    checked++;
    const call = normalizeCallInput(input);
    if (call !== null && isCallAvailableInAuction(call, auction)) {
      failures++;
      console.error(`FAIL continuous: illegal input ${input} accepted after ${auction.join(' ')}.`);
    }
  }
  // Forcing source should still be identified with one opponent Pass after it, but not after
  // another call has been made by the forced bidder.
  const forceAuction: Call[] = ['1S','Pass','2D','Pass','2H','Pass','3S'];
  const { board: forcingBoard } = makeRuleTestBoard({
    description: 'Forcing rebid across opponent Pass',
    north: { S: 'AQJ85', H: 'K74', D: 'A72', C: 'K8' },
    south: { S: 'KT6', H: 'Q852', D: 'KQJ64', C: 'A' },
    practiceAuction: forceAuction,
  });
  const system = { ...defaultBiddingSystem, twoLevelNewSuitResponse: 'twoOverOne' as const };
  const forceNow = getUnmodeledContinuationForce(forcingBoard, forceAuction, system);
  const forceAfterPass = getUnmodeledContinuationForce(forcingBoard, [...forceAuction, 'Pass'], system);
  const forceAfterReply = getUnmodeledContinuationForce(forcingBoard, [...forceAuction, 'Pass', '4S'], system);
  checked += 3;
  if (forceNow?.kind !== 'gameForce' || forceAfterPass?.kind !== 'gameForce' ||
      forceAfterReply !== null) {
    failures++;
    console.error(`FAIL continuous forcing: ${forceNow?.kind}, ${forceAfterPass?.kind}, ${forceAfterReply?.kind}.`);
  }
  console.log(`${failures} ***FAILURES***. Continuous legal auctions: ${checked} checks.\n`);
  return failures;
}

/// R1 regression: an optional 2D waiting response must not strand a strong 4-4-4-1 opener.
/// A similar hand with a five-card suit must retain the existing natural suit rebid instead.
function runStrongTwoCFourFourFourOneBoundaryTests (): number {
  const south = { S: '976', H: 'QT9', D: 'KJT98', C: 'K6' };
  const auction: Call[] = ['2C', 'Pass', '2D', 'Pass'];
  const cases = [
    { name: 'strong 2C waiting: 4-4-4-1 guidance',
      north: { S: 'AKQ4', H: 'AKJ7', D: 'AQ76', C: '5' },
      expectedBoundary: true },
    { name: 'strong 2C waiting: five-card spade rebid unaffected',
      north: { S: 'AKQ4T', H: 'AKJ', D: 'AQ76', C: '5' },
      expectedBoundary: false },
  ];
  let failures = 0;
  for (const test of cases) {
    const { board } = makeRuleTestBoard({ description: test.name, north: test.north,
      south, practiceAuction: auction });
    const result = evaluateUserCall('2S', board, auction, defaultBiddingSystem);
    const boundary = result.applicableRules.some(({ id }) =>
      id === 'opener-rebid-boundary-strong-2c-waiting-4441');
    const naturalRebid = getApplicableCandidateCalls(result).some(({ call, rule }) =>
      call === '2S' && rule.id === 'opener-rebid-longest-suit-after-2c-2d');
    const status = getBiddingTurnStatus(board, auction, defaultBiddingSystem);
    if (boundary !== test.expectedBoundary || naturalRebid === test.expectedBoundary ||
        status.kind !== (test.expectedBoundary ? 'scopeBoundary' : 'supported')) {
      failures++;
      console.error(`FAIL R1 ${test.name}: boundary=${boundary}, 2S=${naturalRebid}, ` +
                    `status=${status.kind}.`);
    }
  }
  console.log(`${failures} ***FAILURES***. Strong 2C 4-4-4-1 boundary: 2 focused cases.\n`);
  return failures;
}

/// R2 regression: a major opener stronger than the old 21-support-point ceiling must still
/// be able to bid game, with a short-suit splinter available only under that agreement.
function runStrongOpenerAfterMajorSimpleRaiseTests (): number {
  const auction: Call[] = ['1H', 'Pass', '2H', 'Pass'];
  const { board } = makeRuleTestBoard({
    description: '19 HCP, 23 support points after a simple heart raise',
    practiceAuction: auction,
    north: { S: '2', H: 'AKQ87', D: 'K3', C: 'AQJ64' },
    south: { S: 'KJ94', H: 'T62', D: 'Q876', C: 'K8' },
  });
  let failures = 0;
  for (const splinters of [false, true]) {
    const system = { ...defaultBiddingSystem, splinters };
    const candidates = getApplicableCandidateCalls(
      evaluateUserCall('4H', board, auction, system));
    const game = candidates.some(({ call, rule }) =>
      call === '4H' && rule.id === 'opener-rebid-game-raise-after-major-simple-raise');
    const splinter = candidates.some(({ call, rule }) =>
      call === '3S' && rule.id === 'opener-rebid-splinter-after-major-simple-raise');
    if (!game || splinter !== splinters) {
      failures++;
      console.error(`FAIL R2 high-strength major raise (splinters=${splinters}): ` +
        `game=${game}, 3S splinter=${splinter}.`);
    }
  }
  console.log(`${failures} ***FAILURES***. Strong opener after simple major raise: ` +
              '2 agreement contexts on one boundary hand.\n');
  return failures;
}

/// R3 regression: opener normally Passes a nonforcing raise of the original weak preempt.
/// Reuse the existing response fixtures, and guard against leaking into a forcing 2NT inquiry.
function runOpenerPassAfterPreemptRaiseTests (): number {
  const cases: { auction: Call[]; label: string }[] = [
    { auction: ['2S', 'Pass', '3S'], label: 'weak-two three-level raise' },
    { auction: ['3S', 'Pass', '4S'], label: 'three-level preempt raised to four' },
  ];
  let failures = 0;
  for (const test of cases) {
    const deal = RESPONSE_TO_WEAK_PREEMPT_TEST_DEALS.find((candidate) =>
      candidate.practiceAuction.join(' ') === test.auction.join(' '));
    if (deal === undefined) {
      failures++;
      console.error(`FAIL R3: no recorded fixture for ${test.label}.`);
      continue;
    }
    const { board } = makeRuleTestBoard(deal);
    const auction: Call[] = [...test.auction, 'Pass'];
    const pass = getApplicableCandidateCalls(
      evaluateUserCall('Pass', board, auction, defaultBiddingSystem)).some(({ call, rule }) =>
      call === 'Pass' && rule.id === 'opener-rebid-pass-after-preempt-raise');
    if (!pass) {
      failures++;
      console.error(`FAIL R3: opener Pass not supported after ${test.label}.`);
    }
    if (test.auction[0] === '2S') {
      const inquiry: Call[] = ['2S', 'Pass', '2NT', 'Pass'];
      const falsePass = getApplicableCandidateCalls(
        evaluateUserCall('Pass', board, inquiry, defaultBiddingSystem)).some(({ rule }) =>
        rule.id === 'opener-rebid-pass-after-preempt-raise');
      if (falsePass) {
        failures++;
        console.error('FAIL R3: Pass rule leaked into forcing weak-two 2NT inquiry.');
      }
    }
  }
  console.log(`${failures} ***FAILURES***. Opener after preempt raise: 2 focused fixtures.\n`);
  return failures;
}

/// R4 regression: a nonforcing 3m jump repeat after 1m–1M needs a minimum signoff,
/// a carefully stopped 3NT option, and judgment guidance without leaking into other rebids.
function runResponderAfterMinorJumpRepeatTests (): number {
  const minAuction: Call[] = ['1C', 'Pass', '1H', 'Pass', '3C', 'Pass'];
  const { board: minimumBoard } = makeRuleTestBoard({
    description: 'R4: minimum responder after an invitational club jump repeat',
    practiceAuction: minAuction,
    north: { S: 'AQ2', H: 'Q4', D: 'K2', C: 'AJT852' },
    south: { S: '83', H: 'KJ76', D: 'Q854', C: '963' },
  });
  const minResult = evaluateUserCall('Pass', minimumBoard, minAuction, defaultBiddingSystem);
  const pass = getApplicableCandidateCalls(minResult).some(({ call, rule }) =>
    call === 'Pass' && rule.id === 'responder-rebid-pass-after-minor-jump-repeat');

  const gameAuction: Call[] = ['1D', 'Pass', '1S', 'Pass', '3D', 'Pass'];
  const opener = { S: 'AQ2', H: 'K4', D: 'AQJ965', C: '84' };
  const gameResponder = { S: 'KJ87', H: 'Q83', D: 'K72', C: 'Q93' };
  const { board: gameBoard } = makeRuleTestBoard({
    description: 'R4: balanced 11 HCP responder with both unbid suits stopped',
    practiceAuction: gameAuction, north: opener, south: gameResponder,
  });
  const gameResult = evaluateUserCall('3NT', gameBoard, gameAuction, defaultBiddingSystem);
  const game = getApplicableCandidateCalls(gameResult).some(({ call, rule }) =>
    call === '3NT' && rule.id === 'responder-rebid-3nt-after-minor-jump-repeat');
  const originalResponse = getApplicableCandidateCalls(evaluateUserCall('1S', gameBoard,
    gameAuction.slice(0, 2), defaultBiddingSystem)).some(({ call }) => call === '1S');
  const openerJump = getApplicableCandidateCalls(evaluateUserCall('3D', gameBoard,
    gameAuction.slice(0, 4), defaultBiddingSystem)).some(({ call, rule }) =>
    call === '3D' && rule.id === 'opener-rebid-jump-repeat-minor-after-minor-one-level-new-suit');

  // Removing the heart stopper and reducing strength to 10 HCP means neither
  // the minimum Pass nor the conservative 3NT rule can decide this auction.
  const { board: borderlineBoard } = makeRuleTestBoard({
    description: 'R4: borderline responder with an unprotected outside suit',
    practiceAuction: gameAuction, north: opener,
    south: { S: 'KJ87', H: 'J83', D: 'K72', C: 'Q93' },
  });
  const borderlineResult = evaluateUserCall('3NT', borderlineBoard, gameAuction, defaultBiddingSystem);
  const boundary = borderlineResult.applicableRules.some(({ id }) =>
    id === 'responder-rebid-boundary-after-minor-jump-repeat');
  const noGame = !getApplicableCandidateCalls(borderlineResult).some(({ rule }) =>
    rule.id === 'responder-rebid-3nt-after-minor-jump-repeat');

  // A simple 2m repeat or a strong responder jump shift has a different meaning.
  const unrelatedAuctions: Call[][] = [
    ['1C', 'Pass', '1H', 'Pass', '2C', 'Pass'],
    ['1C', 'Pass', '2H', 'Pass', '3C', 'Pass'],
  ];
  const excluded = unrelatedAuctions.every((auction) => {
    const result = evaluateUserCall('Pass', minimumBoard, auction, defaultBiddingSystem);
    return !result.applicableRules.some(({ id }) => id.includes('after-minor-jump-repeat'));
  });
  const failures = Number(!pass) + Number(!game || !originalResponse || !openerJump) +
    Number(!boundary || !noGame) + Number(!excluded);
  if (!pass) console.error('FAIL R4: minimum Pass missing after 1C-1H-3C.');
  if (!game || !originalResponse || !openerJump)
    console.error('FAIL R4: 3NT or its prerequisite 1S/3D bids do not qualify.');
  if (!boundary || !noGame) console.error('FAIL R4: borderline auction lacks scope guidance or incorrectly recommends 3NT.');
  if (!excluded) console.error('FAIL R4: jump-repeat rules leaked into a different responder auction.');
  console.log(`${failures} ***FAILURES***. Responder after minor jump repeat: four distinct regression conditions.\n`);
  return failures;
}


/// Third-audit edge treatments: protect the new general meanings rather than
/// constructing a large set of one-off practice deals.
function runThirdAuditRebidTests (): number {
  let failures = 0;
  const supports = (board: ReturnType<typeof makeRuleTestBoard>['board'],
                    auction: Call[], call: Call, ruleId: string,
                    system: BiddingSystem = defaultBiddingSystem) =>
    getApplicableCandidateCalls(evaluateUserCall(call, board, auction, system))
      .some(({ call: candidate, rule }) => candidate === call && rule.id === ruleId);

  // A forcing 1NT over a 5-4-2-2 heart opener needs the general two-card club
  // fallback, not a reverse to spades or a false six-card heart repeat.
  const { board: heartBoard } = makeRuleTestBoard({
    description: 'Third audit: forcing 1NT manufactured two-card club rebid',
    north: { S: 'QJ76', H: 'AK982', D: '43', C: 'J5' },
    south: { S: '83', H: 'Q5', D: 'T92', C: 'AK9748' },
    practiceAuction: ['1H', 'Pass', '1NT', 'Pass'],
  });
  const forcing = { ...defaultBiddingSystem, majorOneNtResponse: 'forcing' as const };
  const nonForcing = { ...defaultBiddingSystem, majorOneNtResponse: 'nonForcing' as const };
  const majorNtAuction: Call[] = ['1H', 'Pass', '1NT', 'Pass'];
  if (! supports(heartBoard, majorNtAuction, '2C',
                 'opener-rebid-minor-fallback-after-major-1nt-forcing', forcing) ||
      supports(heartBoard, majorNtAuction, '2C',
               'opener-rebid-minor-fallback-after-major-1nt-forcing', nonForcing) ||
      getApplicableCandidateCalls(evaluateUserCall('Pass', heartBoard, majorNtAuction, forcing))
        .some(({ call }) => call === 'Pass')) {
    failures++;
    console.error('FAIL third audit: forcing 1NT two-club fallback and agreement isolation.');
  }
  const clubRebidAuction: Call[] = [...majorNtAuction, '2C', 'Pass'];
  const { board: fiveClubBoard } = makeRuleTestBoard({
    description: 'Third audit: five clubs do not guarantee a fit with two-card 2C',
    north: { S: 'QJ76', H: 'AK982', D: '43', C: 'J5' },
    south: { S: '843', H: 'Q5', D: 'T92', C: 'AK974' },
    practiceAuction: clubRebidAuction,
  });
  if (! supports(heartBoard, clubRebidAuction, 'Pass',
                 'responder-rebid-pass-second-suit-after-major-1nt', forcing) ||
      supports(fiveClubBoard, clubRebidAuction, 'Pass',
               'responder-rebid-pass-second-suit-after-major-1nt', forcing)) {
    failures++;
    console.error('FAIL third audit: six versus five clubs after forcing-1NT manufactured 2C.');
  }

  // Strong six-card minor: preserve the forcing obligation and explain judgment;
  // do not expand a 17-18-point invitational jump repeat to cover 21 HCP.
  const strongMinorAuction: Call[] = ['1C', 'Pass', '1H', 'Pass'];
  const { board: strongMinorBoard } = makeRuleTestBoard({
    description: 'Third audit: exceptional strong six-card minor without a descriptive rebid',
    north: { S: '42', H: 'AK', D: 'A76', C: 'AKQJ98' },
    south: { S: 'QJ87', H: 'Q987', D: 'K42', C: 'T5' },
    practiceAuction: strongMinorAuction,
  });
  const strongStatus = getBiddingTurnStatus(strongMinorBoard, strongMinorAuction,
    defaultBiddingSystem);
  if (strongStatus.kind !== 'scopeBoundary' ||
      strongStatus.rule.id !== 'opener-rebid-boundary-exceptional-strong-minor-after-one-level-new-suit' ||
      supports(strongMinorBoard, strongMinorAuction, '3C',
               'opener-rebid-jump-repeat-minor-after-minor-one-level-new-suit')) {
    failures++;
    console.error('FAIL third audit: exceptional strong-minor guidance versus invitational 3C.');
  }

  // Eleven HCP plus one club-length point does not open a balanced convenient
  // minor; a 12-HCP balanced hand and an 11-HCP distributional club hand still do.
  const south = { S: 'K876', H: 'AQ82', D: 'AT6', C: 'Q6' };
  const openingCases = [
    { north: { S: '32', H: 'J95', D: 'Q84', C: 'AKJ87' }, expectsClub: false },
    { north: { S: '32', H: 'J95', D: 'K84', C: 'AKJ87' }, expectsClub: true },
    { north: { S: 'Q3', H: 'J976', D: '2', C: 'AKJ985' }, expectsClub: true },
  ];
  for (const testCase of openingCases) {
    const { board } = makeRuleTestBoard({ description: 'Third audit: marginal club opening',
      north: testCase.north, south, practiceAuction: [] });
    if (supports(board, [], '1C', 'open-convenient-minor') !== testCase.expectsClub) {
      failures++;
      console.error(`FAIL third audit: marginal convenient minor (expected ${testCase.expectsClub}).`);
    }
  }

  // The five-card minor repeat must be a last resort after a one-round force;
  // preserve the ordinary six-card rule and do not promise six on a fallback.
  const minorAuction: Call[] = ['1C', 'Pass', '1S', 'Pass'];
  const { board: awkwardMinorBoard } = makeRuleTestBoard({
    description: 'Third audit: awkward five-card club minimum',
    north: { S: 'KJ2', H: 'KQ76', D: '4', C: 'KJ962' },
    south: { S: 'A9876', H: '43', D: 'QJ2', C: 'T75' },
    practiceAuction: minorAuction,
  });
  const { board: sixMinorBoard } = makeRuleTestBoard({
    description: 'Third audit: ordinary six-card club minimum',
    north: { S: 'KJ2', H: 'KQ7', D: '4', C: 'KJ9628' },
    south: { S: 'A9876', H: '43', D: 'QJ2', C: 'T75' },
    practiceAuction: minorAuction,
  });
  if (! supports(awkwardMinorBoard, minorAuction, '2C',
                 'opener-rebid-five-card-minor-fallback-after-minor-one-level-new-suit') ||
      supports(sixMinorBoard, minorAuction, '2C',
               'opener-rebid-five-card-minor-fallback-after-minor-one-level-new-suit') ||
      ! supports(sixMinorBoard, minorAuction, '2C',
                  'opener-rebid-repeat-minor-after-minor-one-level-new-suit') ||
      supports(awkwardMinorBoard, ['1C', 'Pass', '1H', 'Pass'], '2C',
               'opener-rebid-five-card-minor-fallback-after-minor-one-level-new-suit')) {
    failures++;
    console.error('FAIL third audit: five-card minor fallback displaces a better rebid.');
  }
  const { board: twoClubBoard } = makeRuleTestBoard({
    description: 'Third audit: two clubs do not establish fit with five-card minor repeat',
    north: { S: 'KJ2', H: 'KQ76', D: '4', C: 'KJ962' },
    south: { S: 'A9876', H: '43', D: 'QJ72', C: 'T7' },
    practiceAuction: [...minorAuction, '2C', 'Pass'],
  });
  const repeatedAuction: Call[] = [...minorAuction, '2C', 'Pass'];
  if (! supports(awkwardMinorBoard, repeatedAuction, 'Pass',
                 'responder-rebid-pass-after-minimum-suit-repeat') ||
      supports(twoClubBoard, repeatedAuction, 'Pass',
               'responder-rebid-pass-after-minimum-suit-repeat')) {
    failures++;
    console.error('FAIL third audit: support length after possible five-card minor repeat.');
  }
  console.log(`${failures} ***FAILURES***. Third audit: forcing 1NT, strong minor guidance, ` +
              'marginal openings, and five-card minor repeats.\n');
  return failures;
}


/// Guard the two semantic B12 fixes without testing explanation wording: the nonforcing 1NT
/// range follows Standard vs 2/1, and a passed responder cannot establish a 2/1 game force.
function runMajorNoSupportAgreementTests (): number {
  const opening = { S: 'AKQ96', H: 'A43', D: '972', C: '54' };
  const base = { S: '43', H: 'KQ87', D: 'AQ65', C: '762' };
  const hands = [
    { hcp: 11, south: base },
    { hcp: 12, south: { ...base, C: 'J62' } },
    { hcp: 13, south: { ...base, D: 'AKJ5' } },
  ];
  const standard = { ...defaultBiddingSystem, twoLevelNewSuitResponse: 'standard' as const,
    majorOneNtResponse: 'nonForcing' as const };
  const semiForcing = { ...defaultBiddingSystem, twoLevelNewSuitResponse: 'twoOverOne' as const,
    majorOneNtResponse: 'nonForcing' as const };
  const forcing = { ...semiForcing, majorOneNtResponse: 'forcing' as const };
  const supports = (call: Call, board: ReturnType<typeof makeRuleTestBoard>['board'],
                    auction: Call[], system: BiddingSystem, ruleId: string): boolean =>
    evaluateUserCall(call, board, auction, system).userCallMatchingRules.some((rule) =>
      rule.id === ruleId);
  let failures = 0;
  let checks = 0;
  for (const { hcp, south } of hands) {
    const { board } = makeRuleTestBoard({ description: 'B12 strength and prior Pass.',
      north: opening, south, practiceAuction: ['1S', 'Pass', '1NT'] });
    const actual = makeRuleEvalContext(board, ['1S', 'Pass']).handFacts.hcp;
    if (actual !== hcp) {
      failures += 1;
      console.error(`FAIL B12 fixture: wanted ${hcp} HCP, got ${actual}.`);
    }
    const unpassed: Call[] = ['1S', 'Pass'];
    const passed: Call[] = ['Pass', 'Pass', '1S', 'Pass'];
    // Use South as dealer for the passed auction: South Passed, North then opened,
    // and South responds. This preserves the same tested responder's cards.
    const cases = [
      { call: '1NT' as Call, auction: unpassed, system: standard,
        rule: 'respond-to-major-w/o-support-1nt-standard', wanted: false },
      { call: '1NT' as Call, auction: unpassed, system: semiForcing,
        rule: 'respond-to-major-w/o-support-1nt-standard', wanted: hcp <= 12 },
      { call: '1NT' as Call, auction: unpassed, system: forcing,
        rule: 'respond-to-major-w/o-support-1nt-twooverone', wanted: hcp <= 12 },
      { call: '2D' as Call, auction: unpassed, system: standard,
        rule: 'respond-to-major-w/o-support-new-suit-two-level-standard', wanted: true },
      { call: '2D' as Call, auction: unpassed, system: semiForcing,
        rule: 'respond-to-major-w/o-support-new-suit-two-level-two-over-one', wanted: hcp >= 13 },
      { call: '2D' as Call, auction: passed, system: semiForcing,
        rule: 'respond-to-major-w/o-support-new-suit-two-level-two-over-one', wanted: false },
    ];
    for (const item of cases) {
      checks += 1;
      const actualBoard = item.auction === passed ? { ...board, dealer: 'S' as const } : board;
      if (supports(item.call, actualBoard, item.auction, item.system, item.rule) !== item.wanted) {
        failures += 1;
        console.error(`FAIL B12 ${hcp}-HCP ${item.call} after ${item.auction.join(' ')} ` +
          `in ${item.rule}: expected ${item.wanted}.`);
      }
    }
  }
  const { board: spadesBoard } = makeRuleTestBoard({
    description: 'B12 show four spades rather than fallback 1NT after a heart opening.',
    north: { S: 'A43', H: 'AKJT5', D: '972', C: '54' },
    south: { S: 'KQ87', H: '93', D: 'AQ65', C: '762' },
    practiceAuction: ['1H', 'Pass', '1S'],
  });
  const spades = ['1H', 'Pass'] as Call[];
  checks += 2;
  if (!supports('1S', spadesBoard, spades, forcing,
      'respond-to-major-w/o-support-new-suit-one-level')) {
    failures += 1;
    console.error('FAIL B12 four-card spade response after 1H not supported.');
  }
  if (supports('1NT', spadesBoard, spades, forcing,
      'respond-to-major-w/o-support-1nt-twooverone')) {
    failures += 1;
    console.error('FAIL B12 1NT was not suppressed by available 1S.');
  }
  console.log(`${failures} ***FAILURES***. Major-no-support agreements: ${checks} behavioral checks.`);
  console.log('  Protects 11-12 HCP semi-forcing 1NT, passed-hand 2/1, and preferred 1S.\n');
  return failures;
}

/// Protect hand-specific natural overcaller-rebid explanations without freezing their prose.
/// Check that the existing recorded cases produce evidence for the matching decision, and
/// that rejected bids and other overcaller families do not borrow the wrong explanation.
function runNaturalSuitOvercallerRebidExplanationTests (): number {
  let failures = 0;
  let checks = 0;
  for (const deal of NATURAL_SUIT_OVERCALL_REBID_TEST_DEALS) {
    const board = makeRuleTestBoard(deal).board;
    const auction = deal.practiceAuction.slice(0, -1);
    const expected = deal.expectedOvercallerRebidCalls?.[0];
    if (expected === undefined) continue;
    const result = evaluateUserCall(expected.call, board, auction, defaultBiddingSystem);
    const matching = result.userCallMatchingRules.find((rule) =>
      expected.ruleIds.includes(rule.id));
    const lines = matching === undefined ? [] : getNaturalSuitOvercallerRebidLines(result, matching);
    const candidate = result.ruleDiagnostics.find(({ rule }) => rule.id === matching?.id)
      ?.candidates.find(({ call }) => call === expected.call);
    checks += 1;
    if (lines.length !== 1 || candidate?.callEvidence?.naturalSuitOvercallerRebid === undefined ||
        getNaturalSuitOvercallerRebidFailureLines(result).length !== 0) {
      failures += 1;
      console.error(`FAIL natural overcaller-rebid explanation: ${deal.description}`);
    }
  }
  const minimum = NATURAL_SUIT_OVERCALL_REBID_TEST_DEALS[0];
  if (minimum !== undefined) {
    const board = makeRuleTestBoard(minimum).board;
    const auction = minimum.practiceAuction.slice(0, -1);
    const weakGame = evaluateUserCall('4S', board, auction, defaultBiddingSystem);
    const failureLines = getNaturalSuitOvercallerRebidFailureLines(weakGame);
    checks += 1;
    if (failureLines.length !== 1 ||
        getNaturalSuitOvercallerRebidFailureLines(
          evaluateUserCall('Pass', board, auction, defaultBiddingSystem)).length !== 0) {
      failures += 1;
      console.error('FAIL natural overcaller-rebid game-strength rejection evidence.');
    }
  }
  const forcing = NATURAL_SUIT_OVERCALL_REBID_TEST_DEALS.find((deal) =>
    deal.expectedOvercallerRebidCalls?.[0]?.ruleIds.includes('overcaller-rebid-new-suit-support'));
  if (forcing !== undefined) {
    const board = makeRuleTestBoard(forcing).board;
    const auction = forcing.practiceAuction.slice(0, -1);
    const repeat = evaluateUserCall('2S', board, auction, defaultBiddingSystem);
    const negative = getNaturalSuitOvercallerRebidFailureLines(repeat);
    checks += 1;
    if (negative.length !== 1) {
      failures += 1;
      console.error('FAIL natural overcaller-rebid six-card repeat rejection evidence.');
    }
  }
  // What-if auctions on existing complete boards cover additional qualifying branches,
  // without modifying any saved practice hand or its recorded auction.
  const fifteen = makeRuleTestBoard(NATURAL_SUIT_OVERCALL_REBID_TEST_DEALS[10]).board;
  const sixteenSixSpades = makeRuleTestBoard(NATURAL_SUIT_OVERCALL_REBID_TEST_DEALS[1]).board;
  const otherPaths: { board: typeof fifteen; auction: Call[]; call: Call; ruleId: string }[] = [
    { board: fifteen, auction: ['1D', '1S', 'Pass', '2S', 'Pass'], call: '3S',
      ruleId: 'overcaller-rebid-suit-raise-invite' },
    { board: fifteen, auction: ['1D', '1S', 'Pass', '2D', 'Pass'], call: '3S',
      ruleId: 'overcaller-rebid-cuebid-invite' },
    { board: sixteenSixSpades, auction: ['1D', '1S', 'Pass', '2D', 'Pass'], call: '4S',
      ruleId: 'overcaller-rebid-cuebid-game' },
    { board: fifteen, auction: ['1D', '1S', 'Pass', '1NT', 'Pass'], call: '2NT',
      ruleId: 'overcaller-rebid-nt-invite' },
  ];
  const syntheticNorth = { S: 'K72', H: 'A43', D: 'AQJ74', C: '83' };
  const syntheticSouth = { S: 'T95', H: 'JT986', D: '632', C: 'T2' };
  const rebidAuction: Call[] = ['1D', '1S', 'Pass', '2H', 'Pass'];
  const notrumpHand = makeRuleTestBoard({
    description: 'What-if natural overcaller notrump rebid', dealer: 'N',
    practiceAuction: [...rebidAuction, '2NT'], north: syntheticNorth, south: syntheticSouth,
    east: { S: 'AQJ86', H: 'K7', D: 'K85', C: 'Q74' },
  }).board;
  const secondSuitHand = makeRuleTestBoard({
    description: 'What-if natural overcaller second suit', dealer: 'N',
    practiceAuction: [...rebidAuction, '3C'], north: syntheticNorth, south: syntheticSouth,
    east: { S: 'AQJ86', H: 'K7', D: '8', C: 'KQJ96' },
  }).board;
  otherPaths.push(
    { board: notrumpHand, auction: rebidAuction, call: '2NT',
      ruleId: 'overcaller-rebid-new-suit-nt' },
    { board: secondSuitHand, auction: rebidAuction, call: '3C',
      ruleId: 'overcaller-rebid-new-suit-second' },
  );
  for (const item of otherPaths) {
    const result = evaluateUserCall(item.call, item.board, item.auction, defaultBiddingSystem);
    const matching = result.userCallMatchingRules.find((rule) => rule.id === item.ruleId);
    checks += 1;
    if (matching === undefined || getNaturalSuitOvercallerRebidLines(result, matching).length !== 1) {
      failures += 1;
      console.error(`FAIL natural overcaller-rebid what-if explanation: ${item.ruleId}.`);
    }
  }
  const unrelated = makeRuleTestBoard(NATURAL_SUIT_OVERCALL_REBID_TEST_DEALS[0]);
  const firstOvercall = evaluateUserCall('1S', unrelated.board, ['1D'], defaultBiddingSystem);
  checks += 1;
  if (getNaturalSuitOvercallerRebidFailureLines(firstOvercall).length !== 0 ||
      firstOvercall.userCallMatchingRules.some((rule) =>
        getNaturalSuitOvercallerRebidLines(firstOvercall, rule).length !== 0)) {
    failures += 1;
    console.error('FAIL natural overcaller-rebid explanations leaked to initial overcall.');
  }
  console.log(`${failures} ***FAILURES***. Natural suit overcaller-rebid explanations: ${checks} checks.\n`);
  return failures;
}

/// Verify the actual maximum-raise distinction without freezing any explanation wording.
function runTakeoutDoublerRebidExplanationTests (): number {
  let failures = 0;
  let checks = 0;
  const invitations = TAKEOUT_DOUBLER_REBID_TEST_DEALS.filter((deal) =>
    deal.expectedOvercallerRebidCalls?.some(({ call, ruleIds }) =>
      call === '3S' && ruleIds.includes('overcaller-rebid-takeout-maximum-raise')));
  for (const deal of invitations) {
    const board = makeRuleTestBoard(deal).board;
    const auction = deal.practiceAuction.slice(0, -1);
    const accepted = evaluateUserCall('3S', board, auction, defaultBiddingSystem);
    const match = accepted.userCallMatchingRules.find(({ id }) =>
      id === 'overcaller-rebid-takeout-maximum-raise');
    const positive = match === undefined ? [] : getTakeoutDoublerRebidLines(accepted, match);
    const evidence = accepted.ruleDiagnostics.find(({ rule }) => rule.id === match?.id)
      ?.candidates.find(({ call }) => call === '3S')?.callEvidence?.takeoutDoublerRebid;
    checks++;
    if (match === undefined || evidence === undefined || evidence.support < 4 ||
        evidence.supportPoints < 19 || positive.length === 0 ||
        getTakeoutDoublerRebidFailureLines(accepted).length !== 0) {
      failures++;
      console.error(`FAIL takeout-Doubler strong invitation: ${deal.description}`);
    }
    const prematureGame = evaluateUserCall('4S', board, auction, defaultBiddingSystem);
    const negative = getTakeoutDoublerRebidFailureLines(prematureGame);
    checks++;
    if (prematureGame.userCallMatchingRules.length !== 0 || negative.length === 0) {
      failures++;
      console.error(`FAIL takeout-Doubler premature game should not qualify: ${deal.description}`);
    }
  }
  if (invitations.length < 2) {
    failures++;
    console.error('FAIL missing ordinary and strong takeout-Doubler invitation practice deals.');
  }
  console.log(`${failures} ***FAILURES***. Takeout-Doubler rebid teaching: ${checks} checks.\n`);
  return failures;
}

/// Verify the selected competitive overcaller rebids and their explanations,
/// including the up-the-line response to a responsive Double and five-card cuebid game.
function runContestedSuitOvercallerRebidExplanationTests (): number {
  let failures = 0;
  let checks = 0;
  for (const deal of CONTESTED_OVERCALL_REBID_TEST_DEALS) {
    const expected = deal.expectedOvercallerRebidCalls?.[0];
    if (expected === undefined || !expected.ruleIds[0]?.startsWith('overcaller-rebid-contested-suit-')) {
      continue;
    }
    const board = makeRuleTestBoard(deal).board;
    const result = evaluateUserCall(expected.call, board,
      deal.practiceAuction.slice(0, -1), defaultBiddingSystem);
    const rule = result.userCallMatchingRules.find(({ id }) => expected.ruleIds.includes(id));
    const evidence = result.ruleDiagnostics.find(({ rule: item }) => item.id === rule?.id)
      ?.candidates.find(({ call }) => call === expected.call)?.callEvidence
      ?.contestedSuitOvercallerRebid;
    checks++;
    if (rule === undefined || evidence === undefined ||
        getContestedSuitOvercallerRebidLines(result, rule).length === 0 ||
        getContestedSuitOvercallerRebidFailureLines(result).length !== 0) {
      failures++;
      console.error(`FAIL contested overcaller rebid explanation: ${deal.description}`);
    }
  }
  // Synthetic what-if boards fix the relevant three hands and fill the fourth.
  // Do not corrupt any saved four-hand practice deal to test the equal-suit decision.
  const responsive = makeRuleTestBoard({
    description: 'Equal four-card minors after responsive Double', dealer: 'N',
    practiceAuction: ['1H', '1S', '2H', 'Double', 'Pass', '3C'],
    east: { S: 'AQJ86', H: '', D: 'K765', C: 'AT93' },
    north: { S: 'K72', H: 'AKT96', D: 'Q32', C: '54' },
    south: { S: 'T95', H: 'QJ875', D: 'AJ8', C: 'QJ' },
  }).board;
  const afterResponsive: Call[] = ['1H', '1S', '2H', 'Double', 'Pass'];
  const clubs = evaluateUserCall('3C', responsive, afterResponsive, defaultBiddingSystem);
  const diamonds = evaluateUserCall('3D', responsive, afterResponsive, defaultBiddingSystem);
  const clubsRule = clubs.userCallMatchingRules.find(({ id }) =>
    id === 'overcaller-rebid-contested-suit-responsive-suit');
  checks += 2;
  if (clubsRule === undefined ||
      getContestedSuitOvercallerRebidLines(clubs, clubsRule).length === 0) {
    failures++;
    console.error('FAIL responsive Double should permit 3C first with both four-card minors.');
  }
  if (diamonds.userCallMatchingRules.some(({ id }) =>
        id === 'overcaller-rebid-contested-suit-responsive-suit') ||
      getContestedSuitOvercallerRebidFailureLines(diamonds).length === 0) {
    failures++;
    console.error('FAIL responsive Double should prefer 3C over 3D with equal four-card minors.');
  }
  const strongFive = makeRuleTestBoard({
    description: 'Strong five-card spade overcall opposite support cuebid', dealer: 'N',
    practiceAuction: ['1D', '1S', '2D', '3D', 'Pass', '4S'],
    east: { S: 'AKQJ9', H: 'A76', D: '8', C: 'K964' },
    north: { S: 'T72', H: 'Q53', D: 'AKQJ7', C: '82' },
    south: { S: '864', H: 'KJ82', D: 'T965', C: 'A5' },
  }).board;
  const auctions: Call[][] = [
    ['1D', '1S', 'Pass', '2D', 'Pass'],
    ['1D', '1S', '2D', '3D', 'Pass'],
  ];
  const gameRules = ['overcaller-rebid-cuebid-game', 'overcaller-rebid-contested-suit-cue-game'];
  for (const [index, auction] of auctions.entries()) {
    const result = evaluateUserCall('4S', strongFive, auction, defaultBiddingSystem);
    const rule = result.userCallMatchingRules.find(({ id }) => id === gameRules[index]);
    checks++;
    if (rule === undefined || (index === 0 ?
      getNaturalSuitOvercallerRebidLines(result, rule) :
      getContestedSuitOvercallerRebidLines(result, rule)).length === 0) {
      failures++;
      console.error(`FAIL five-card strong cuebid major game: ${gameRules[index]}`);
    }
  }
  const weakFive = makeRuleTestBoard({
    description: 'Five-card suit without enough strength for game after support cuebid',
    dealer: 'N', practiceAuction: ['1D', '1S', '2D', '3D', 'Pass', '4S'],
    east: { S: 'AQJ86', H: '762', D: '8', C: 'K964' },
    north: { S: 'T72', H: 'Q53', D: 'AKQJ7', C: '82' },
    south: { S: 'K43', H: 'AJT8', D: 'T965', C: 'A5' },
  }).board;
  const weakGame = evaluateUserCall('4S', weakFive, auctions[1]!, defaultBiddingSystem);
  checks++;
  if (weakGame.userCallMatchingRules.some(({ id }) => id === gameRules[1]) ||
      getContestedSuitOvercallerRebidFailureLines(weakGame).length === 0) {
    failures++;
    console.error('FAIL competitive support cuebid game must still meet the HCP threshold.');
  }
  console.log(`${failures} ***FAILURES***. Competitive overcaller rebid teaching: ${checks} checks.\n`);
  return failures;
}

/// Verify the revised 1NT-overcaller Pass and weak-two five-card major game
/// alongside selected existing practice-deal rebid explanation families.
function runOneNtAndWeakTwoRebidExplanationTests (): number {
  let failures = 0;
  let checks = 0;
  for (const deal of [...NATURAL_1NT_OVERCALL_REBID_TEST_DEALS, ...WEAK_TWO_REBID_TEST_DEALS]) {
    const expected = deal.expectedOvercallerRebidCalls?.[0];
    if (expected === undefined) continue;
    const board = makeRuleTestBoard(deal).board;
    const result = evaluateUserCall(expected.call, board,
      deal.practiceAuction.slice(0, -1),
      { ...defaultBiddingSystem, ...deal.requiredSystem });
    const rule = result.userCallMatchingRules.find(({ id }) => expected.ruleIds.includes(id));
    const conventional = expected.ruleIds.some((id) =>
      id.includes('stayman') || id.includes('jacoby') || id.includes('texas') ||
      id.includes('natural-signoff'));
    const lines = rule === undefined ? [] :
      [...getOneNtOvercallerRebidLines(result, rule), ...getWeakTwoDefenseRebidLines(result, rule)];
    checks++;
    if (rule === undefined || (!conventional && lines.length === 0)) {
      failures++;
      console.error(`FAIL 1NT/weak-two rebid explanation: ${deal.description}`);
    }
  }
  const strongNt = makeRuleTestBoard({
    description: '18-HCP 1NT overcaller may Pass when responder interferes and advancer Passes',
    dealer: 'N', practiceAuction: ['1D', '1NT', '2H', 'Pass', 'Pass', 'Pass'],
    east: { S: 'AKJ6', H: 'K8', D: 'K65', C: 'AT76' },
    north: { S: 'Q72', H: 'AQJ76', D: 'AQJ94', C: '' },
    south: { S: 'T985', H: 'T954', D: 'T32', C: 'QJ' },
  }).board;
  const competition: Call[] = ['1D', '1NT', '2H', 'Pass', 'Pass'];
  for (const system of [defaultBiddingSystem,
    { ...defaultBiddingSystem, oneNtOpening: '16-18' as const }]) {
    const result = evaluateUserCall('Pass', strongNt, competition, system);
    const rule = result.userCallMatchingRules.find(({ id }) =>
      id === 'overcaller-rebid-interfered-1nt-pass');
    checks++;
    if (rule === undefined || getOneNtOvercallerRebidLines(result, rule).length === 0) {
      failures++;
      console.error('FAIL maximum 1NT overcaller should Pass noninviting competition.');
    }
  }
  const knownHands = {
    north: { S: '852', H: '73', D: 'KQJ987', C: 'T4' },
    south: { S: 'T963', H: 'T854', D: 'T65', C: 'J8' },
  };
  const afterCue: Call[] = ['2D', '2H', 'Pass', '3D', 'Pass'];
  const strong = makeRuleTestBoard({
    description: '16-HCP good five-card major after strong weak-two support cuebid',
    dealer: 'N', practiceAuction: [...afterCue, '4H'],
    ...knownHands,
    east: { S: 'A4', H: 'AKQJ9', D: '32', C: 'Q976' },
  }).board;
  const accepted = evaluateUserCall('4H', strong, afterCue, defaultBiddingSystem);
  const game = accepted.userCallMatchingRules.find(({ id }) =>
    id === 'overcaller-rebid-weak-two-suit-cue-game');
  checks++;
  if (game === undefined || getWeakTwoDefenseRebidLines(accepted, game).length === 0) {
    failures++;
    console.error('FAIL strong five-card major should accept cuebid with 4H.');
  }
  const weaker = makeRuleTestBoard({
    description: '14-HCP five-card major does not accept weak-two support cuebid at game',
    dealer: 'N', practiceAuction: [...afterCue, '4H'],
    north: { S: '852', H: '73', D: 'KQJ987', C: 'Q4' },
    south: knownHands.south,
    east: { S: 'A4', H: 'AKQJ9', D: '32', C: 'T976' },
  }).board;
  const rejected = evaluateUserCall('4H', weaker, afterCue, defaultBiddingSystem);
  checks++;
  if (rejected.userCallMatchingRules.some(({ id }) =>
        id === 'overcaller-rebid-weak-two-suit-cue-game') ||
      getWeakTwoDefenseRebidFailureLines(rejected).length === 0) {
    failures++;
    console.error('FAIL minimum five-card weak-two overcall must not bid game.');
  }
  console.log(`${failures} ***FAILURES***. 1NT and weak-two rebid explanations: ${checks} checks.\n`);
  return failures;
}

/// Ensure the 2/1 forcing 2NT treatment does not invent an unbid-suit stopper
/// requirement, while 3NT retains that requirement. These are synthetic what-if
/// hands; no stored practice deal is changed.
function runNaturalResponderRebidTeachingTests (): number {
  let failures = 0;
  let checks = 0;
  const system: BiddingSystem = { ...defaultBiddingSystem,
    twoLevelNewSuitResponse: 'twoOverOne' };
  const board = makeRuleTestBoard({
    description: 'Balanced 2/1 responder with 14 HCP but no heart stopper',
    dealer: 'N', practiceAuction: ['1S', 'Pass', '2C', 'Pass', '2D', 'Pass', '2NT'],
    north: { S: 'AKJ74', H: 'Q64', D: 'QJ93', C: '2' },
    south: { S: '83', H: 'J85', D: 'K65', C: 'AKQJ9' },
  }).board;
  const auction: Call[] = ['1S', 'Pass', '2C', 'Pass', '2D', 'Pass'];
  const invite = evaluateUserCall('2NT', board, auction, system);
  const rule = invite.userCallMatchingRules.find(({ id }) =>
    id === 'responder-rebid-two-over-one-forcing-2nt');
  checks++;
  if (rule === undefined || getNaturalResponderRebidLines(invite, rule,
      getHandFacts(board.deal.S)).length === 0 ||
      getNaturalResponderRebidFailureLines(invite).length > 0) {
    failures++;
    console.error('FAIL 2/1 forcing 2NT should not require an unbid-suit stopper.');
  }
  const threeNt = evaluateUserCall('3NT', board, auction, system);
  const reason = getNaturalResponderRebidFailureLines(threeNt);
  checks++;
  if (threeNt.userCallMatchingRules.some(({ id }) =>
        id === 'responder-rebid-two-over-one-game-3nt') || reason.length === 0) {
    failures++;
    console.error('FAIL 2/1 3NT should still require the missing heart stopper.');
  }
  const checkback = makeRuleTestBoard({
    description: 'Five-card heart major after opener rebids natural 1NT',
    dealer: 'N', practiceAuction: ['1D', 'Pass', '1H', 'Pass', '1NT', 'Pass', '2NT'],
    north: { S: 'A94', H: 'Q76', D: 'QJ84', C: 'Q83' },
    south: { S: 'Q73', H: 'KJ984', D: 'K65', C: 'K2' },
  }).board;
  const afterOneNt: Call[] = ['1D', 'Pass', '1H', 'Pass', '1NT', 'Pass'];
  const result = evaluateUserCall('2NT', checkback, afterOneNt, defaultBiddingSystem);
  const natural = result.userCallMatchingRules.find(({ id }) =>
    id === 'responder-rebid-2nt-after-minimum-1nt');
  checks++;
  if (natural === undefined || !getNaturalResponderRebidLines(result, natural,
      getHandFacts(checkback.deal.S)).some((line) => line.includes('New Minor Forcing'))) {
    failures++;
    console.error('FAIL missing explanatory New Minor Forcing alternative after a five-card major.');
  }
  // A Standard club repeat stops after one round, unlike the identical 2/1 auction.
  const standardDeal = makeRuleTestBoard({
    description: 'Standard six-card club repeat', dealer: 'N',
    practiceAuction: ['1D', 'Pass', '2C', 'Pass', '2D', 'Pass', '3C'],
    north: { S: 'A4', H: 'KJ42', D: 'KQJ92', C: '82' },
    south: { S: 'K72', H: 'Q8', D: 'A5', C: 'QJ9653' },
  }).board;
  const standardAuction: Call[] = ['1D', 'Pass', '2C', 'Pass', '2D', 'Pass'];
  const standardResult = evaluateUserCall('3C', standardDeal, standardAuction,
    { ...defaultBiddingSystem, twoLevelNewSuitResponse: 'standard' });
  const standardRule = standardResult.userCallMatchingRules.find(({ id }) =>
    id === 'responder-rebid-standard-two-level-repeat-response');
  checks++;
  if (standardRule === undefined || !getNaturalResponderRebidLines(standardResult, standardRule,
      getHandFacts(standardDeal.deal.S)).some((line) => line.includes('nonforcing'))) {
    failures++;
    console.error('FAIL Standard three-level club repeat should explain its nonforcing meaning.');
  }
  const forcingDeal = makeRuleTestBoard({
    description: '2/1 six-card club repeat', dealer: 'N',
    practiceAuction: ['1S', 'Pass', '2C', 'Pass', '2S', 'Pass', '3C'],
    north: { S: 'AKQ986', H: 'K74', D: 'Q5', C: 'T2' },
    south: { S: '4', H: 'AQ5', D: 'K32', C: 'KQJ987' },
  }).board;
  const forcingAuction: Call[] = ['1S', 'Pass', '2C', 'Pass', '2S', 'Pass'];
  const standardAsTwoOverOne = evaluateUserCall('3C', forcingDeal, forcingAuction, system);
  const twoOverOneRule = standardAsTwoOverOne.userCallMatchingRules.find(({ id }) =>
    id === 'responder-rebid-two-over-one-repeat-long-suit');
  checks++;
  if (twoOverOneRule === undefined || !getNaturalResponderRebidLines(standardAsTwoOverOne,
      twoOverOneRule, getHandFacts(forcingDeal.deal.S)).some((line) =>
        line.includes('game forcing'))) {
    failures++;
    console.error('FAIL 2/1 six-card repeat should retain and explain game force.');
  }
  // A previously passed responder cannot retrospectively establish a 2/1 game force.
  const passedAuction: Call[] = [
    'Pass', 'Pass', 'Pass', '1D', 'Pass', '2C', 'Pass', '2D', 'Pass',
  ];
  const previouslyPassed = makeRuleTestBoard({
    description: 'Responder passed before the opening', dealer: 'E',
    practiceAuction: [...passedAuction, '3C'],
    north: { S: 'A4', H: 'KJ42', D: 'KQJ92', C: '82' },
    south: { S: 'K72', H: 'Q8', D: 'A5', C: 'QJ9653' },
  }).board;
  const passedResult = evaluateUserCall('3C', previouslyPassed, passedAuction, system);
  checks++;
  if (passedResult.userCallMatchingRules.some(({ id }) =>
      id === 'responder-rebid-two-over-one-repeat-long-suit') ||
      passedResult.applicableRules.some(({ id }) => id === 'responder-rebid-boundary-after-two-over-one')) {
    failures++;
    console.error('FAIL a previously passed responder was treated as establishing a 2/1 game force.');
  }
  console.log(`${failures} ***FAILURES***. Natural responder rebid teaching: ${checks} checks.\n`);
  return failures;
}

/// Check moved practice exercises and selected R3 evidence through the production evaluator.
function runConventionalResponderTeachingTests (): number {
  let failures = 0;
  let checks = 0;
  const cases = [
    { bucket: 'responder-rebid-after-nt-conventions', auction: '1NT Pass 2H Pass 2S Pass Pass' },
    { bucket: 'responder-rebid-after-strong-2c-and-jacoby-2nt', auction: '2C Pass 2D Pass 2NT Pass Pass' },
    { bucket: 'responder-rebid-after-strong-2c-and-jacoby-2nt', auction: '1H Pass 2NT Pass 4H Pass Pass' },
    { bucket: 'responder-rebid-after-major-game-try', auction: '1S Pass 2S Pass 2NT Pass 3S' },
    { bucket: 'responder-rebid-after-splinters', auction: '1S Pass 4D Pass 4H Pass 4S' },
    { bucket: 'responder-rebid-after-splinters', auction: '1C Pass 1H Pass 4D Pass 4H' },
  ];
  for (const test of cases) {
    const buckets = RULE_TEST_DEAL_BUCKETS.filter((bucket) =>
      bucket.deals.some((deal) => deal.practiceAuction.join(' ') === test.auction));
    checks++;
    if (buckets.length !== 1 || buckets[0]?.id !== test.bucket) {
      failures++;
      console.error(`FAIL R3 moved practice auction bucket: ${test.auction}, ` +
        `found ${buckets.map((bucket) => bucket.id).join(', ')}.`);
    }
    const deal = buckets[0]?.deals.find((item) =>
      item.practiceAuction.join(' ') === test.auction);
    if (deal === undefined) continue;
    const { board } = makeRuleTestBoard(deal);
    const auction = deal.practiceAuction.slice(0, 6);
    const call = deal.practiceAuction[6]!;
    const system = { ...defaultBiddingSystem, ...deal.requiredSystem };
    const evaluation = evaluateUserCall(call, board, auction, system);
    const rule = evaluation.userCallMatchingRules.find(({ id }) =>
      deal.expectedResponderRebidCalls?.some((expected) =>
        expected.call === call && expected.ruleIds.includes(id)));
    checks++;
    if (rule === undefined || getConventionalResponderRebidLines(evaluation, rule).length === 0) {
      failures++;
      console.error(`FAIL R3 accepted responder decision lacks teaching evidence: ${test.auction}.`);
    }
  }
  const jacoby = RULE_TEST_DEAL_BUCKETS.flatMap((bucket) => bucket.deals).find((deal) =>
    deal.practiceAuction.join(' ') === '1S Pass 2NT Pass 3NT Pass 4S');
  if (jacoby !== undefined) {
    const rejection = evaluateUserCall('Pass', makeRuleTestBoard(jacoby).board,
      jacoby.practiceAuction.slice(0, 6),
      { ...defaultBiddingSystem, ...jacoby.requiredSystem });
    checks++;
    if (rejection.userCallMatchingRules.length > 0 ||
        getConventionalResponderRebidFailureLines(rejection).length === 0) {
      failures++;
      console.error('FAIL R3 Jacoby artificial 3NT Pass should receive forcing guidance.');
    }
  }
  console.log(`${failures} ***FAILURES***. Conventional responder teaching: ${checks} checks.\n`);
  return failures;
}

/// Verify the remaining opener interference teaching without changing any bid thresholds.
function runOpenerInterferenceTeachingTests (): number {
  let failures = 0;
  let checks = 0;
  // A DONT 2H shows both majors, so a heart stopper alone is not enough.
  const { board } = makeRuleTestBoard({
    description: 'DONT two-major stopper: hearts stopped but spades unstopped',
    practiceAuction: ['1NT', '2H', '3C', 'Pass', '3NT'],
    north: { S: 'T74', H: 'AK4', D: 'AQ7', C: 'K983' },
    south: { S: 'Q85', H: 'T72', D: 'K8', C: 'AQJ74' },
  });
  const auction: Call[] = ['1NT', '2H', '3C', 'Pass'];
  const failed = evaluateUserCall('3NT', board, auction, defaultBiddingSystem);
  const status = getBiddingTurnStatus(board, auction, defaultBiddingSystem);
  checks++;
  if (failed.userCallMatchingRules.some(({ id }) =>
        id === 'opener-rebid-3nt-after-1nt-interference-natural-suit') ||
      status.kind !== 'scopeBoundary' ||
      (status.kind === 'scopeBoundary' &&
        status.rule.id !== 'opener-rebid-scope-boundary-after-1nt-interference') ||
      !getOpenerOneNtInterferenceFailureLines(failed).some((line) =>
        line.includes('spades'))) {
    failures++;
    console.error('FAIL DONT two-major stopper gap and judgment boundary.');
  }
  const goodNt = OPENER_REBID_AFTER_INTERFERENCE_TEST_DEALS.find((deal) =>
    deal.practiceAuction.join(' ') === '1NT 2H 3C Pass 3NT');
  checks++;
  if (goodNt === undefined) {
    failures++;
    console.error('FAIL no existing DONT natural 3C to 3NT practice example.');
  } else {
    const accepted = evaluateUserCall('3NT', makeRuleTestBoard(goodNt).board,
      goodNt.practiceAuction.slice(0, 4), defaultBiddingSystem);
    const rule = accepted.userCallMatchingRules.find(({ id }) =>
      id === 'opener-rebid-3nt-after-1nt-interference-natural-suit');
    if (rule === undefined ||
        !getOpenerOneNtInterferenceLines(accepted, rule).some((line) =>
          line.includes('hearts and spades'))) {
      failures++;
      console.error('FAIL qualifying DONT continuation lacks two-major explanation.');
    }
  }
  const auctions: { sequence: string; ruleId: string; rejected?: Call }[] = [
    { sequence: '1H 2S 3H Pass Pass',
      ruleId: 'opener-rebid-after-jump-overcall-nonforcing-pass' },
    { sequence: '1C 2D 2S Pass 3S',
      ruleId: 'opener-rebid-after-jump-overcall-natural-suit', rejected: 'Pass' },
    { sequence: '1H 2S 3S Pass 4H',
      ruleId: 'opener-rebid-after-jump-overcall-major-game', rejected: 'Pass' },
    { sequence: '1H 2S 3C Pass 3NT',
      ruleId: 'opener-rebid-after-jump-overcall-natural-nt', rejected: 'Pass' },
    { sequence: '1S 3H Double Pass 3S',
      ruleId: 'opener-rebid-after-jump-overcall-natural-suit', rejected: 'Pass' },
  ];
  for (const test of auctions) {
    const deal = OPENER_REBID_AFTER_INTERFERENCE_TEST_DEALS.find((item) =>
      item.practiceAuction.join(' ') === test.sequence);
    checks++;
    if (deal === undefined) {
      failures++;
      console.error(`FAIL missing jump-overcall practice ${test.sequence}.`);
      continue;
    }
    const { board: jumpBoard } = makeRuleTestBoard(deal);
    const prefix = deal.practiceAuction.slice(0, 4);
    const call = deal.practiceAuction[4]!;
    const accepted = evaluateUserCall(call, jumpBoard, prefix, defaultBiddingSystem);
    const rule = accepted.userCallMatchingRules.find(({ id }) => id === test.ruleId);
    if (rule === undefined || getOpenerJumpOvercallRebidLines(accepted, rule).length === 0) {
      failures++;
      console.error(`FAIL jump-overcall explanation ${test.sequence}.`);
    }
    if (test.rejected !== undefined) {
      const rejection = evaluateUserCall(test.rejected, jumpBoard, prefix, defaultBiddingSystem);
      checks++;
      if (rejection.userCallMatchingRules.length > 0 ||
          getOpenerJumpOvercallRebidFailureLines(rejection).length === 0) {
        failures++;
        console.error(`FAIL forcing rejection after ${test.sequence}.`);
      }
    }
  }
  console.log(`${failures} ***FAILURES***. Opener interference teaching: ${checks} checks.\n`);
  return failures;
}

/// Continue running independent test groups after an unexpected exception. Individual
/// assertion failures are already counted within their groups; preserve those counts.
const testGroups: (() => number)[] = [
  runMajorNoSupportAgreementTests,
  runBasicOpeningExplanationTests,
  runThirdAuditRebidTests,
  runResponderAfterMinorJumpRepeatTests,
  runOpenerPassAfterPreemptRaiseTests,
  runStrongOpenerAfterMajorSimpleRaiseTests,
  runStrongTwoCFourFourFourOneBoundaryTests,
  runResponderStrongAndSupportConventionTests,
  runAuctionHelperTests,
  runResponderNtConventionTests,
  runOpeningPositionAndPassTests,
  runAuctionContextTests,
  runCompetitionBoundaryTests,
  runResponderInterferenceScopeBoundaryTests,
  runCompetitiveOpenerRebidBoundaryTests,
  runAdvancingBoundaryTests,
  runTakeoutAdvanceBoundaryTests,
  runSharedOneNtAdvanceBoundaryTests,
  runResponderRaiseAdvanceBoundaryTests,
  runResponderNaturalActionAdvanceBoundaryTests,
  runNaturalActionPassLegalityTests,
  runResponderArtificialActionAdvanceBoundaryTests,
  runOneNtInterferencePartnerBoundaryTests,
  runOneNtInterferenceExplanationTests,
  runNaturalSuitOvercallerRebidExplanationTests,
  runNaturalResponderRebidTeachingTests,
  runConventionalResponderTeachingTests,
  runOpenerInterferenceTeachingTests,
  runContestedSuitOvercallerRebidExplanationTests,
  runTakeoutDoublerRebidExplanationTests,
  runOneNtAndWeakTwoRebidExplanationTests,
  runJumpOvercallAdvanceBoundaryTests,
  runJumpOvercallForcingAdvanceRebidTests,
  runWeakTwoOvercallExplanationTests,
  runDontInitialExplanationTests,
  runDontBoundaryTests,
  runResponderRebidContextTests,
  runResponderMajorRaiseContextTests,
  runResponderRepeatedSuitContextTests,
  runResponderSecondSuitContextTests,
  runResponderStrongSecondSuitContextTests,
  runResponderStrongTwoNtContextTests,
  runResponderMajorOneNtContextTests,
  runResponderMajorOneNtStrongTests,
  runResponderMinorOneNtAndPassedHandTests,
  runResponderStandardTwoLevelContextTests,
  runResponderTwoOverOneContextTests,
  runPracticeContinuationTests,
  runResponderAfterMajorGameTryTests,
  runResponderAfterOpenerSplinterTests,
  runResponderAfterStrongJumpShiftTests,
  runBiddingTurnStatusTests,
  runContinuousAuctionFeedbackTests,
  runUnmodeledDirectDefenseBoundaryTests,
  runLaterStageTerminationGuidanceTests,
  runStrongMinorArtificialSupportTests,
  runBalancingAuctionAndDealTests,
  runRuleTests,
];
let failureCount = 0;
for (const run of testGroups) {
  try {
    failureCount += run();
  } catch (error) {
    failureCount += 1;
    console.error(`FAIL test group ${run.name}: ${String(error)}`);
  }
}
console.log(failureCount === 0 ? 'ZERO errors in all tests.' :
  `${failureCount} error${failureCount === 1 ? '' : 's'} in tests.`);
if (failureCount !== 0) {
  throw new Error(`${failureCount} rule-test failure${failureCount === 1 ? '' : 's'}.`);
}
