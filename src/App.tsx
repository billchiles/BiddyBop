import { useState } from 'react';
import './App.css';
import { BidPanel, type PracticeDealIdentification } from './components/BidPanel';
import { BiddingSystemControls } from './components/BiddingSystemControls';
import { generateBoard, makeRuleTestBoard, type Board, type Seat } from './models/cards';
import { defaultBiddingSystem, type BiddingSystem } from './models/bidding-types';
import { getRulesBucketTestDeals, isPracticeDealCompatible, RULE_TEST_DEAL_BUCKETS, type RuleTestDeal, type RuleTestDealBucketId }
  from './models/test-deals-registry';

/// App owns browser-level practice controls and the board currently displayed.
const PRACTICE_DEALER: Seat = 'N';
const MAX_TELEMETRY_LINES = 400;

interface AppState {
  board: Board;
  testDeal?: RuleTestDeal;
  practiceDealIdentification?: PracticeDealIdentification;
  telemetryLines: string[];
}

function createInitialState(): AppState {
  const result = generateBoard({ dealer: PRACTICE_DEALER, requireDealerOpening: true });
  return {
    board: result.board,
    telemetryLines: ['Generated initial board.', ...result.telemetryLines],
  };
}

export default function App() {
  const [state, setState] = useState<AppState>(() => createInitialState());
  const [biddingSystem, setBiddingSystem] = useState<BiddingSystem>(() => ({ ...defaultBiddingSystem }));
  const [requireDealerOpening, setRequireDealerOpening] = useState(true);
  const [testBucketId, setTestBucketId] = useState<RuleTestDealBucketId>(RULE_TEST_DEAL_BUCKETS[0].id);
  const [testDealCount, setTestDealCount] = useState(0);
  const testDeals = getRulesBucketTestDeals(testBucketId, biddingSystem);
  const testBucketGroups = [...new Set(RULE_TEST_DEAL_BUCKETS.map((bucket) => bucket.group))];
  // A settings change restarts bucket progress. A selected practice exercise must not keep
  // running under agreements that violate its requiredSystem; ordinary deals are retained.
  function changeBiddingSystem(next: BiddingSystem): void {
    setBiddingSystem(next);
    setTestDealCount(0);
    setState((current) => {
      if (current.testDeal === undefined || isPracticeDealCompatible(current.testDeal, next)) {
        return current;
      }
      return {
        ...current,
        testDeal: undefined,
        practiceDealIdentification: undefined,
        telemetryLines: [...current.telemetryLines, '',
          'Practice exercise cleared: its required bidding agreements are no longer selected. ' +
          'Choose Test Deal for a compatible exercise.'],
      };
    });
  }
  // Ordinary redeals do not change test-bucket progress.
  function redeal(): void {
    const result = generateBoard({ dealer: PRACTICE_DEALER, requireDealerOpening });
    setState({
      board: result.board,
      testDeal: undefined,
      telemetryLines: ['Generated new board.', ...result.telemetryLines],
    });
  }
  // Switching buckets starts its cycle at the first deal.
  function selectTestBucket(bucketId: RuleTestDealBucketId): void {
    setTestBucketId(bucketId);
    setTestDealCount(0);
  }
  // Each click advances through compatible deals and wraps after the last one.
  function nextTestDeal(): void {
    if (testDeals.length === 0) {
      return;
    }
    const index = testDealCount % testDeals.length;
    const testDeal = testDeals[index];
    if (testDeal === undefined) {
      return;
    }
    const result = makeRuleTestBoard(testDeal);
    // Preserve both the chosen selector position and a shorter replay route when
    // the exercise was reached through All. Use bucket order, not deal identity:
    // a fixture may legitimately appear in more than one grouped collection.
    const buckets = testBucketId === 'all' ? RULE_TEST_DEAL_BUCKETS :
      RULE_TEST_DEAL_BUCKETS.filter((bucket) => bucket.id === testBucketId);
    let remainingIndex = index;
    let sourceBucket: typeof RULE_TEST_DEAL_BUCKETS[number] | undefined;
    let sourceIndex = 0;
    let sourceTotal = 0;
    for (const bucket of buckets) {
      const compatibleDeals = bucket.deals.filter((deal) => isPracticeDealCompatible(deal, biddingSystem));
      if (remainingIndex < compatibleDeals.length) {
        sourceBucket = bucket;
        sourceIndex = remainingIndex;
        sourceTotal = compatibleDeals.length;
        break;
      }
      remainingIndex -= compatibleDeals.length;
    }
    const chosenBucket = testBucketId === 'all' ? 'All' :
      (buckets[0]?.label ?? testBucketId);
    const practiceDealIdentification: PracticeDealIdentification = {
      selection: `${chosenBucket} [${testBucketId}], deal ${index + 1} of ${testDeals.length}`,
      replay: sourceBucket === undefined ?
        `Select ${chosenBucket} and click Test Deal ${index + 1} times.` :
        `Select ${sourceBucket.label} [${sourceBucket.id}] and click Test Deal ${sourceIndex + 1} ` +
        `times (${sourceIndex + 1} of ${sourceTotal}), using the same bidding agreements.`,
    };
    setState({
      board: result.board,
      testDeal,
      practiceDealIdentification,
      telemetryLines: [`Test deal ${index + 1} of ${testDeals.length}.`, ...result.telemetryLines],
    });
    setTestDealCount(index + 1);
  }
  // Preserve evaluator telemetry for the board currently displayed.
  function appendTelemetry(lines: string[]): void {
    if (lines.length === 0) {
      return;
    }
    setState((current) => ({
      ...current,
      telemetryLines: [...current.telemetryLines, '', ...lines].slice(-MAX_TELEMETRY_LINES),
    }));
  }
  // Keep the title compact; the deal controls sit above the compass.
  return (
    <main className="appShell">
      <header className="appHeader">
        <div className="toolbarTitleGroup"><h1>Biddy Bop</h1></div>
      </header>
      <BidPanel board={state.board} biddingSystem={biddingSystem} onTelemetry={appendTelemetry}
        telemetryLines={state.telemetryLines}
        testDeal={state.testDeal} practiceDealIdentification={state.practiceDealIdentification}>
        <div className="dealControlRows" aria-label="Deal controls">
          <div className="dealControlNewRow">
            <div className="toolbarSettingsGroup">
              <BiddingSystemControls biddingSystem={biddingSystem} onChange={changeBiddingSystem} />
            </div>
            <div className="toolbarDealGroup">
              <button className="redealButton" type="button" onClick={redeal}>New Deal</button>
              <label className="dealerOpeningSetting">
                <input type="checkbox" checked={requireDealerOpening}
                  onChange={(event) => setRequireDealerOpening(event.target.checked)} />
                North Opens
              </label>
            </div>
          </div>
          <div className="toolbarPracticeGroup">
            <select className="testBucketSelect" aria-label="Practice deal bucket"
              title="Practice deal bucket"
              value={testBucketId}
              onChange={(event) => selectTestBucket(event.target.value as RuleTestDealBucketId)}>
              <option value="all">All</option>
              {testBucketGroups.map((group) => (
                <optgroup key={group} label={group}>
                  {RULE_TEST_DEAL_BUCKETS.filter((bucket) => bucket.group === group).map((bucket) => (
                    <option key={bucket.id} value={bucket.id}>{bucket.label}</option>
                  ))}
                </optgroup>
              ))}
            </select>
            <button className="redealButton" type="button" onClick={nextTestDeal}
              disabled={testDeals.length === 0}>Test Deal</button>
            <span className="testDealProgress" aria-live="polite">
              {testDealCount} of {testDeals.length}
            </span>
          </div>
        </div>
      </BidPanel>
    </main>
  );
}
