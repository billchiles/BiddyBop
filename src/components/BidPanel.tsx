import { useEffect, useRef, useState, type FormEvent } from 'react';
import { evaluateUserCall, getApplicableCandidateCalls, type BidEvalResult, normalizeCallInput }
  from '../models/biddingEvaluation';
import { auctionIsComplete, getBidStage, getNextSeat, getInterferenceAfterOpening, getRecordedPracticeCorrection, isPracticeSequenceComplete, isCallAvailableInAuction } from '../models/auction';
import { SEATS, SUITS, type Board, type Hand, type Seat } from '../models/cards';
import type { RuleTestDeal } from '../models/test-deals-registry';
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
  const [explanationLines, setExplanationLines] = useState<string[]>(() =>
    getInitialExplanationLines(board.dealer, testDeal, practiceStages));
  const explanationRef = useRef<HTMLPreElement | null>(null);
  const practiceComplete = isPracticeSequenceComplete(auction, testDeal?.practiceAuction);

  useEffect(() => {
    setBidText('');
    setAuction(setupPracticeAuction(board.dealer, [], testDeal, practiceStages));
    setAuctionComplete(false);
    setExplanationLines(getInitialExplanationLines(board.dealer, testDeal, practiceStages));
  }, [board, biddingSystem, testDeal, practiceStages]);

  useEffect(() => {
    if (explanationRef.current === null) {
      return;
    }
    explanationRef.current.scrollTop = explanationRef.current.scrollHeight;
  }, [explanationLines]);

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (auctionComplete || auctionIsComplete(auction) || practiceComplete) {
      onTelemetry([practiceComplete ? 'Practice sequence complete.' : 'Auction is complete.']);
      return;
    }

    commitUserCall();
  }

  /// commitUserCall evaluates the student's choice. In a selected lesson, a different bid is
  /// explained but replaced by the recorded continuation before inserting later setup calls.
  function commitUserCall(): void {
    const stage = getBidStage(board.dealer, auction);
    const seat = getNextSeat(board.dealer, auction);
    const normalizedCall = normalizeCallInput(bidText);
    if (normalizedCall === null) {
      reportInvalidInput(seat, stage);
      return;
    }

    // Keep a selected exercise on its recorded path without pretending that its scripted bid
    // is always the only reasonable bridge choice. Normal non-practice bidding is unchanged.
    const recordedCall = getRecordedPracticeCorrection(
      auction, normalizedCall, testDeal?.practiceAuction);
    const useRecordedCall = recordedCall !== null;
    if (! isCallAvailableInAuction(normalizedCall, auction) && ! useRecordedCall) {
      onTelemetry([`${normalizedCall} is not available in this auction.`]);
      return;
    }
    const result = evaluateUserCall(normalizedCall, board, auction, biddingSystem);
    const enteredAuction: Call[] = [...auction, useRecordedCall ? recordedCall : normalizedCall];
    const nextAuction = setupPracticeAuction(board.dealer, enteredAuction, testDeal, practiceStages);
    setAuction(nextAuction);
    if (auctionIsComplete(nextAuction)) {
      setAuctionComplete(true);
    }
    const practiceNotes = getPracticeGuidanceLines(board.dealer, auction, nextAuction, testDeal);
    const recordedResult = useRecordedCall && recordedCall !== null
      ? evaluateUserCall(recordedCall, board, auction, biddingSystem) : null;
    const exerciseDone = isPracticeSequenceComplete(nextAuction, testDeal?.practiceAuction);
    finishBidEntry(seat, stage, result, practiceNotes,
      recordedResult === null || recordedCall === null ? null : { call: recordedCall,
        result: recordedResult }, exerciseDone);
    if (nextAuction.length > enteredAuction.length) {
      const scripted = nextAuction.slice(enteredAuction.length);
      onTelemetry([`Practice setup added: ${scripted.join(', ')}.`]);
    }
  }

  function finishBidEntry(seat: Seat, stage: BidStage | null, result: BidEvalResult,
                          practiceNotes: string[],
                          correction: { call: Call; result: BidEvalResult } | null,
                          exerciseDone: boolean): void {
    const title = `${getSeatLabel(seat)} ${getStageLabel(stage)}`;
    setBidText('');
    const explanation = buildExplanationLines(title, result, stage === null);
    const intervention = getInterferenceAfterOpening(board.dealer, auction);
    if (stage === 'responding' && intervention !== 'none' &&
        getApplicableCandidateCalls(result).length === 0) {
      explanation.push(intervention === 'suitOvercall'
        ? 'No modeled response qualifies after this natural suit overcall. Pass is available, ' +
          'but the app does not automatically infer Pass as the best action.'
        : 'Responder treatments after this intervention may be incomplete. Pass is available, ' +
          'but no recommendation is established from the empty candidate list.');
    }
    if (correction !== null) {
      explanation.push('', `Practice continuation: You entered ${result.normalizedCall}, but ` +
        `this exercise records ${correction.call}. The auction uses ${correction.call} so ` +
        'you can continue the lesson. The recorded call is not necessarily the only sound bid.');
      const matched = correction.result.userCallMatchingRules;
      if (matched.length > 0) {
        explanation.push('Reason for the recorded call:');
        for (const rule of matched) {
          appendRuleExplanation(explanation, rule);
        }
      } else {
        explanation.push('This recorded continuation is not supported by an applicable rule ' +
          'under the current bidding configuration.');
      }
    }
    if (practiceNotes.length > 0) {
      explanation.push('', ...practiceNotes);
    }
    if (exerciseDone) {
      explanation.push('', 'Practice sequence complete. Later calls are outside this exercise; ' +
        'this does not mean further bidding would be inappropriate.');
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

  const inputDisabled = auctionComplete || auctionIsComplete(auction) || practiceComplete;
  const activeSeat = inputDisabled ? null : getNextSeat(board.dealer, auction);
  const nextBidLabel = practiceComplete ? 'Practice sequence complete' :
    getNextBidLabel(board.dealer, auction, auctionComplete);
  const auctionRows = buildAuctionRows(auction, board.dealer);

  return (
    <section className="bidPanel" aria-label="Bid evaluation">
      <section className="trainerWorkspace">
        <section className="trainerLeftColumn">
          <DealCompass deal={board.deal} activeSeat={activeSeat} />
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

/// Insert recorded setup calls until the next practiced stage. A mismatched prefix still stops
/// automatic setup, though selected practice normally restores the recorded call first.
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

/// For recorded setup calls already shown when a deal loads, reveal only the notes for those
/// past calls. Future decisions must remain unrevealed until the user reaches them.
function getInitialExplanationLines (dealer: Seat, testDeal?: RuleTestDeal,
                                     practiceStages?: BidStage[]): string[] {
  const recorded = setupPracticeAuction(dealer, [], testDeal, practiceStages);
  const notes = getPracticeGuidanceLines(dealer, [], recorded, testDeal);
  return notes.length === 0 ? ['No evaluation yet.'] : ['Recorded practice setup:', ...notes];
}

/// Reveal only notes for calls just entered or inserted from the exact recorded practice auction.
/// Indexing by physical auction position, rather than seat or stage, supports repeated North turns.
function getPracticeGuidanceLines (dealer: Seat, previous: Call[], current: Call[],
                                   testDeal?: RuleTestDeal): string[] {
  if (testDeal?.practiceGuidance === undefined || testDeal.practiceGuidance.length === 0) {
    return [];
  }
  const notes: string[] = [];
  for (let index = previous.length; index < current.length; index += 1) {
    // No deal-specific coaching after a user deviates from the recorded practice auction.
    if (current.slice(0, index + 1).some((call, position) =>
        call !== testDeal.practiceAuction[position])) {
      break;
    }
    const seat = SEATS[(SEATS.indexOf(dealer) + index) % SEATS.length];
    const call = current[index];
    if (seat === undefined || call === undefined) {
      continue;
    }
    for (const note of testDeal.practiceGuidance) {
      if (note.auctionIndex === index && note.seat === seat && note.text !== '') {
        notes.push(`Practice guidance — ${getSeatLabel(seat)} ${call}: ${note.text}`);
      }
    }
  }
  return notes;
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
    case 'overcallerRebid':
      return 'overcaller rebid';
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
  const scopeBoundary = result.handMatchingRules.find((rule) => rule.kind === 'scopeBoundary');
  if (scopeBoundary !== undefined && candidates.length === 0) {
    lines.push('Further bidding needs additional judgment.');
    appendRuleExplanation(lines, scopeBoundary);
    lines.push('  The app cannot reliably recommend a particular bid here.');
  } else if (result.userCallMatchingRules.length === 0) {
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
