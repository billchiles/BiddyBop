import { useEffect, useRef, useState, type FormEvent } from 'react';
import { evaluateUserCall, getApplicableCandidateCalls, type BidEvalResult, normalizeCallInput }
  from '../models/biddingEvaluation';
import { auctionIsComplete, getBidStage, getNextSeat, getDirectInterference, isCallAvailableInAuction } from '../models/auction';
import { SEATS, SUITS, type Board, type Hand, type Seat } from '../models/cards';
import type { RuleTestDeal } from '../models/rule-test-deals';
import { type BidRule, type BidStage, type BiddingSystem, type Call } from '../models/bidding-types';
import { DealCompass } from './DealCompass';


/// BidPanel lets the user bid every seat.  In targeted practice, recorded setup calls establish
/// the designated bidding stage without pretending to be an opponent autobidder.
export interface BidPanelProps {
  board: Board;
  biddingSystem: BiddingSystem;
  onTelemetry: (lines: string[]) => void;
  testDeal?: RuleTestDeal;
  practiceStages?: BidStage[];
}

export function BidPanel({ board, biddingSystem, onTelemetry, testDeal, practiceStages }: BidPanelProps) {
  const [bidText, setBidText] = useState('');
  const [auction, setAuction] = useState<Call[]>(() =>
    setupPracticeAuction(board.dealer, [], testDeal, practiceStages));
  const [auctionComplete, setAuctionComplete] = useState(false);
  const [explanationLines, setExplanationLines] = useState<string[]>(['No evaluation yet.']);
  const explanationRef = useRef<HTMLPreElement | null>(null);

  useEffect(() => {
    setBidText('');
    setAuction(setupPracticeAuction(board.dealer, [], testDeal, practiceStages));
    setAuctionComplete(false);
    setExplanationLines(['No evaluation yet.']);
  }, [board, biddingSystem, testDeal, practiceStages]);

  useEffect(() => {
    if (explanationRef.current === null) {
      return;
    }
    explanationRef.current.scrollTop = explanationRef.current.scrollHeight;
  }, [explanationLines]);

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (auctionComplete || auctionIsComplete(auction)) {
      onTelemetry(['Auction is complete.']);
      return;
    }

    commitUserCall();
  }

  /// commitUserCall records the acting seat's choice.  If it follows the practice script,
  /// non-practice setup calls are inserted until the next practiced stage.
  function commitUserCall(): void {
    const stage = getBidStage(board.dealer, auction);
    const seat = getNextSeat(board.dealer, auction);
    const normalizedCall = normalizeCallInput(bidText);
    if (normalizedCall === null) {
      reportInvalidInput(seat, stage);
      return;
    }

    if (! isCallAvailableInAuction(normalizedCall, auction)) {
      onTelemetry([`${normalizedCall} does not outrank the current contract.`]);
      return;
    }
    const result = evaluateUserCall(normalizedCall, board, auction, biddingSystem);
    const enteredAuction: Call[] = [...auction, normalizedCall];
    const nextAuction = setupPracticeAuction(board.dealer, enteredAuction, testDeal, practiceStages);
    setAuction(nextAuction);
    if (auctionIsComplete(nextAuction)) {
      setAuctionComplete(true);
    }
    finishBidEntry(seat, stage, result);
    if (nextAuction.length > enteredAuction.length) {
      const scripted = nextAuction.slice(enteredAuction.length);
      onTelemetry([`Practice setup added: ${scripted.join(', ')}.`]);
    }
  }

  function finishBidEntry(seat: Seat, stage: BidStage | null, result: BidEvalResult): void {
    const title = `${getSeatLabel(seat)} ${getStageLabel(stage)}`;
    setBidText('');
    const explanation = buildExplanationLines(title, result, stage === null);
    const intervention = getDirectInterference(board.dealer, auction);
    if (stage === 'responding' && intervention !== 'none' &&
        getApplicableCandidateCalls(result).length === 0) {
      explanation.push(intervention === 'suitOvercall'
        ? 'No modeled response qualifies after this natural suit overcall. Pass is available, ' +
          'but the app does not automatically infer Pass as the best action.'
        : 'Responder treatments after this intervention are incomplete. Pass is available, ' +
          'but no recommendation is established from the empty candidate list.');
    }
    setExplanationLines((current) => [...current, '', ...explanation]);
    onTelemetry([`Evaluating ${title}.`, ...result.telemetryLines]);
  }

  function reportInvalidInput(seat: Seat, stage: BidStage | null): void {
    const lines = [
      `Invalid ${getSeatLabel(seat)} ${getStageLabel(stage)} input: "${bidText}".`,
    ];
    setExplanationLines(lines);
    onTelemetry(lines);
  }

  function dumpState(): void {
    const dump = buildDumpText(board, auction, explanationLines);
    if (navigator.clipboard === undefined) {
      onTelemetry(['Clipboard unavailable; dump follows:', dump]);
      return;
    }
    navigator.clipboard.writeText(dump)
      .then(() => onTelemetry(['Dump copied to clipboard.']))
      .catch(() => onTelemetry(['Clipboard unavailable; dump follows:', dump]));
  }

  const inputDisabled = auctionComplete || auctionIsComplete(auction);
  const nextBidLabel = getNextBidLabel(board.dealer, auction, auctionComplete);
  const auctionRows = buildAuctionRows(auction, board.dealer);

  return (
    <section className="bidPanel" aria-label="Bid evaluation">
      <section className="trainerWorkspace">
        <section className="trainerLeftColumn">
          <DealCompass deal={board.deal} />
          <form className="bidForm" onSubmit={handleSubmit}>
            <label className="bidLabel" htmlFor="bidInput">{nextBidLabel}</label>
            <input
              id="bidInput"
              className="bidInput"
              value={bidText}
              onChange={(event) => setBidText(event.target.value)}
              placeholder="1H, 1NT, Pass"
              disabled={inputDisabled}
            />
            <button className="bidButton" type="submit" disabled={inputDisabled}>Commit</button>
            <button className="bidButton" type="button" onClick={dumpState}>Dump</button>
          </form>
        </section>

        <section className="trainerRightColumn">
          <AuctionGrid rows={auctionRows} />
          <ExplanationPanel lines={explanationLines} explanationRef={explanationRef} />
        </section>
      </section>
    </section>
  );
}

/// Insert only recorded setup calls, stopping at the next practiced stage or a divergent call.
/// A deviation from the practice auction returns control to the user for all subsequent seats.
function setupPracticeAuction (dealer: Seat, auction: Call[], testDeal?: RuleTestDeal,
                               practiceStages?: BidStage[]): Call[] {
  if (testDeal === undefined || practiceStages === undefined || practiceStages.length === 0) {
    return auction;
  }
  const next = [...auction];
  while (next.length < testDeal.practiceAuction.length && ! auctionIsComplete(next)) {
    if (next.some((call, index) => call !== testDeal.practiceAuction[index])) {
      break;
    }
    const stage = getBidStage(dealer, next);
    if (stage !== null && practiceStages.includes(stage)) {
      break;
    }
    const call = testDeal.practiceAuction[next.length];
    if (call === undefined || ! isCallAvailableInAuction(call, next)) {
      break;
    }
    next.push(call);
  }
  return next;
}

function buildDumpText(board: Board, auction: Call[], explanationLines: string[]): string {
  const stage = getBidStage(board.dealer, auction);
  return [
    `Dealer: ${board.dealer}`,
    `North: ${formatHand(board.deal.N)}`,
    `East: ${formatHand(board.deal.E)}`,
    `South: ${formatHand(board.deal.S)}`,
    `West: ${formatHand(board.deal.W)}`,
    `Auction: ${auction.length === 0 ? '(empty)' : auction.join(' ')}`,
    `Next seat: ${getSeatLabel(getNextSeat(board.dealer, auction))}`,
    `Stage: ${stage ?? 'unresolved'}`,
    '',
    'Explanation:',
    ...explanationLines,
  ].join('\n');
}

function formatHand(hand: Hand): string {
  return SUITS.map((suit) => {
    const ranks = hand.cards.filter((card) => card.suit === suit).map((card) => card.rank);
    return `${suit}: ${ranks.length === 0 ? '-' : ranks.join(',')}`;
  }).join('; ');
}

function getStageLabel(stage: BidStage | null): string {
  switch (stage) {
    case 'opening':
      return 'opening';
    case 'responding':
      return 'response';
    case 'openerRebid':
      return 'opener rebid';
    case 'responderRebid':
      return 'responder rebid';
    case 'overcalling':
      return 'overcall';
    case 'advancing':
      return 'advance';
    case null:
      return 'bid';
  }
}

function getSeatLabel(seat: Seat): string {
  switch (seat) {
    case 'N':
      return 'North';
    case 'E':
      return 'East';
    case 'S':
      return 'South';
    case 'W':
      return 'West';
  }
}

function getNextBidLabel(dealer: Seat, auction: Call[], auctionComplete: boolean): string {
  if (auctionComplete || auctionIsComplete(auction)) {
    return 'Auction complete';
  }
  return `${getSeatLabel(getNextSeat(dealer, auction))}:`;
}

function buildExplanationLines (title: string, result: BidEvalResult, unmodeledStage: boolean): string[] {
  const lines: string[] = [];
  const candidates = getApplicableCandidateCalls(result);
  lines.push(title);
  if (unmodeledStage) {
    lines.push('This auction position has no modeled rule family yet.');
  }
  lines.push(`Normalized call: ${result.normalizedCall === null ? 'invalid or blank' : result.normalizedCall}`);
  if (result.userCallMatchingRules.length === 0) {
    lines.push('No rule satisfied by this call.');
    const preferredRule = result.handMatchingRules[0];
    if (preferredRule !== undefined) {
      lines.push('');
      lines.push('Highest-priority applicable rule:');
      appendRuleExplanation(lines, preferredRule);
    }
  } else {
    lines.push('Rules satisfied by user call:');
    for (const rule of result.userCallMatchingRules) {
      appendRuleExplanation(lines, rule);
    }
  }

  lines.push('');
  lines.push('All applicable candidate calls:');
  if (candidates.length === 0) {
    lines.push('- none');
  } else {
    for (const candidate of candidates) {
      lines.push(`- ${candidate.call}: ${candidate.rule.id}`);
    }
  }

  return lines;
} // buildExplanationLines()

function appendRuleExplanation (lines: string[], rule: BidRule): void {
  lines.push(`- ${rule.id}: ${rule.title}`);
  if (rule.meaning !== undefined && rule.meaning !== '') {
    lines.push(`  Meaning: ${rule.meaning}`);
  }
  if (rule.guidance !== undefined) {
    for (const guidanceLine of rule.guidance) {
      lines.push(`  ${guidanceLine}`);
    }
  }
}

interface AuctionRow {
  N?: Call;
  E?: Call;
  S?: Call;
  W?: Call;
}

function buildAuctionRows(auction: Call[], dealer: Seat): AuctionRow[] {
  const dealerIndex = SEATS.indexOf(dealer);
  const rows: AuctionRow[] = [];

  for (let index = 0; index < auction.length; index += 1) {
    const absoluteSlot = dealerIndex + index;
    const rowIndex = Math.floor(absoluteSlot / SEATS.length);
    const seat = SEATS[absoluteSlot % SEATS.length];
    const call = auction[index];
    if (seat === undefined || call === undefined) {
      continue;
    }
    const row = rows[rowIndex] ?? {};
    row[seat] = call;
    rows[rowIndex] = row;
  }

  if (rows.length === 0) {
    rows.push({});
  }
  return rows;
}

function AuctionGrid({ rows }: { rows: AuctionRow[] }) {
  return (
    <section className="auctionPanel" aria-label="Auction">
      <h3>Auction</h3>
      <table className="auctionGrid">
        <thead>
          <tr>
            <th>N</th>
            <th>E</th>
            <th>S</th>
            <th>W</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              <td>{row.N ?? ''}</td>
              <td>{row.E ?? ''}</td>
              <td>{row.S ?? ''}</td>
              <td>{row.W ?? ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function ExplanationPanel ({ lines, explanationRef }:
                          {lines: string[]; explanationRef: React.RefObject<HTMLPreElement | null>;}) {
    return (
    <section className="resultSummary" aria-label="Explanation and app output">
      <h3>Explanation</h3>
      <pre ref={explanationRef} className="explanationText">{lines.join('\n')}</pre>
    </section>
  );
}
