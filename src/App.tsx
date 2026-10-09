import { useState } from 'react';
import './App.css';
import { BidPanel } from './components/BidPanel';
import { BiddingSystemControls } from './components/BiddingSystemControls';
import { TelemetryPanel } from './components/TelemetryPanel';
import { generateBoard, makeRuleTestBoard, type Board, type Seat } from './models/cards';
import { defaultBiddingSystem, type BidStage, type BiddingSystem } from './models/bidding-types';
import { getRulesBucketTestDeals, RULE_TEST_DEAL_BUCKETS, type RuleTestDeal, type RuleTestDealBucketId }
  from './models/test-deals-registry';

/// App owns browser-level practice controls and the board currently displayed.
const PRACTICE_DEALER: Seat = 'N';

interface AppState {
  board: Board;
  testDeal?: RuleTestDeal;
  practiceStages?: BidStage[];
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
  const [testBucketId, setTestBucketId] = useState<RuleTestDealBucketId>(RULE_TEST_DEAL_BUCKETS[0].id);
  const [testDealCount, setTestDealCount] = useState(0);
  const testDeals = getRulesBucketTestDeals(testBucketId, biddingSystem);
  const testBucketGroups = [...new Set(RULE_TEST_DEAL_BUCKETS.map((bucket) => bucket.group))];
  // Ordinary redeals do not change test-bucket progress.
  function redeal(): void {
    const result = generateBoard({ dealer: PRACTICE_DEALER, requireDealerOpening: true });
    setState({
      board: result.board,
      testDeal: undefined,
      practiceStages: undefined,
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
    // For All, find the owning bucket so overcall exercises still use their own practiced stages.
    const selectedBucket = RULE_TEST_DEAL_BUCKETS.find((bucket) => bucket.deals.includes(testDeal));
    const practiceStages: BidStage[] = selectedBucket !== undefined &&
      'practiceStages' in selectedBucket
      ? [...selectedBucket.practiceStages] : ['opening', 'responding', 'openerRebid'];
    setState({
      board: result.board,
      testDeal,
      practiceStages,
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
      telemetryLines: [...current.telemetryLines, '', ...lines],
    }));
  }
  // The controls follow their use order: bidding system, random deal, bucket, test deal, progress.
  return (
    <main className="appShell">
      <header className="appHeader">
        <div>
          <h1>Bridge Bidding Trainer</h1>
          <p>Random and rule-practice deals, bid matching, candidate rules, and evaluator telemetry.</p>
        </div>
        <div className="dealControls">
          <BiddingSystemControls biddingSystem={biddingSystem} onChange={setBiddingSystem} />
          <button className="redealButton" type="button" onClick={redeal}>New Deal</button>
          <select className="testBucketSelect" aria-label="Rule test deal bucket"
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
      </header>

      <BidPanel board={state.board} biddingSystem={biddingSystem} onTelemetry={appendTelemetry}
        testDeal={state.testDeal} practiceStages={state.practiceStages} />
      <TelemetryPanel lines={state.telemetryLines} />
    </main>
  );
}
