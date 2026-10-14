import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { evaluateUserCall, getApplicableCandidateCalls, type BidEvalResult, normalizeCallInput }
  from '../models/biddingEvaluation';
import { auctionIsComplete, getBidStage, getNextSeat, getInterferenceAfterOpening, getRecordedPracticeCorrection, isPracticeSequenceComplete, isCallAvailableInAuction } from '../models/auction';
import { getTrainerCoverageState, type TrainerCoverageState } from '../models/trainer-coverage';
import { SEATS, SUITS, type Board, type Hand, type Seat } from '../models/cards';
import type { RuleTestDeal } from '../models/test-deals-registry';
import { type BidPosition, type BidRule, type BidStage, type BiddingSystem, type Call } from '../models/bidding-types';
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
  const [explanationLines, setExplanationLines] = useState<string[]>(() =>
    getInitialExplanationLines(board.dealer, testDeal, practiceStages));
  const explanationRef = useRef<HTMLPreElement | null>(null);
  const practiceComplete = isPracticeSequenceComplete(auction, testDeal?.practiceAuction);
  const coverage = useMemo(() => getTrainerCoverageState(board, auction, biddingSystem),
    [board, auction, biddingSystem]);
  const auctionComplete = coverage.kind === 'auctionComplete';
  const trainerCoverageComplete = coverage.kind === 'boundary' ||
    coverage.kind === 'uncovered' || coverage.kind === 'outsideCoverage';
  // Display why the input is disabled as soon as the last modeled call is committed.  This
  // guidance does not depend on an impossible submission through disabled HTML controls.
  const terminalGuidance = getTerminalGuidance(coverage, practiceComplete);
  const displayedExplanation = [...explanationLines, ...terminalGuidance];
  const terminalGuidanceText = terminalGuidance.join('\n');

  useEffect(() => {
    setBidText('');
    setAuction(setupPracticeAuction(board.dealer, [], testDeal, practiceStages));
    setExplanationLines(getInitialExplanationLines(board.dealer, testDeal, practiceStages));
  }, [board, biddingSystem, testDeal, practiceStages]);

  useEffect(() => {
    if (explanationRef.current === null) {
      return;
    }
    explanationRef.current.scrollTop = explanationRef.current.scrollHeight;
  }, [explanationLines, terminalGuidanceText]);

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (auctionComplete || practiceComplete || trainerCoverageComplete) {
      setExplanationLines((current) => [...current, '',
        'Bidding input is disabled. Select New Deal or Test Deal to continue.']);
      onTelemetry(['Bidding input is disabled. Select New Deal or Test Deal.']);
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

    // A recorded practice substitution must never bypass legality of the student's actual call.
    if (! isCallAvailableInAuction(normalizedCall, auction)) {
      const lines = [`${normalizedCall} is not available in this auction.`];
      setExplanationLines((current) => [...current, '', ...lines]);
      onTelemetry(lines);
      return;
    }
    // The intervening opponent turn has no bid rules.  Pass can return to a modeled decision;
    // any other legal action is recorded without a judgment and may end selected coverage.
    const recordedCall = getRecordedPracticeCorrection(
      auction, normalizedCall, testDeal?.practiceAuction);
    const useRecordedCall = recordedCall !== null;
    if (coverage.kind === 'opponentPassThrough') {
      const enteredAuction: Call[] = [...auction, recordedCall ?? normalizedCall];
      const nextAuction = setupPracticeAuction(board.dealer, enteredAuction, testDeal, practiceStages);
      setAuction(nextAuction);
      setBidText('');
      const lines = [
        `${getSeatLabel(seat)} intervening opponent turn: ${normalizedCall}.`,
        'This turn has no bidding rule bucket; the trainer does not judge this call.',
      ];
      if (recordedCall !== null) {
        lines.push(`Practice continuation uses the recorded ${recordedCall} instead.`);
      }
      lines.push(...getPracticeGuidanceLines(board.dealer, auction, nextAuction, testDeal));
      setExplanationLines((current) => [...current, '', ...lines]);
      onTelemetry(lines);
      return;
    }
    if (coverage.kind !== 'supported') {
      const lines = ["This bidding position is outside the trainer's active rule coverage. " +
        'Select New Deal or Test Deal to continue.'];
      setExplanationLines((current) => [...current, '', ...lines]);
      onTelemetry(lines);
      return;
    }
    // A selected exercise stays on its recorded path after evaluating the legal student's bid.
    const result = evaluateUserCall(normalizedCall, board, auction, biddingSystem);
    const enteredAuction: Call[] = [...auction, useRecordedCall ? recordedCall : normalizedCall];
    const nextAuction = setupPracticeAuction(board.dealer, enteredAuction, testDeal, practiceStages);
    setAuction(nextAuction);
    const practiceNotes = getPracticeGuidanceLines(board.dealer, auction, nextAuction, testDeal);
    const recordedResult = useRecordedCall && recordedCall !== null
      ? evaluateUserCall(recordedCall, board, auction, biddingSystem) : null;
    finishBidEntry(seat, stage, result, practiceNotes,
      recordedResult === null || recordedCall === null ? null : { call: recordedCall,
        result: recordedResult });
    if (nextAuction.length > enteredAuction.length) {
      const scripted = nextAuction.slice(enteredAuction.length);
      onTelemetry([`Practice setup added: ${scripted.join(', ')}.`]);
    }
  }

  function finishBidEntry(seat: Seat, stage: BidPosition, result: BidEvalResult,
                          practiceNotes: string[],
                          correction: { call: Call; result: BidEvalResult } | null): void {
    const title = `${getSeatLabel(seat)} ${getStageLabel(stage)}`;
    setBidText('');
    const explanation = buildExplanationLines(title, result);
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
    setExplanationLines((current) => [...current, '', ...explanation]);
    onTelemetry([`Evaluating ${title}.`, ...result.telemetryLines]);
  }

  function reportInvalidInput(seat: Seat, stage: BidPosition): void {
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

  const inputDisabled = auctionComplete || practiceComplete || trainerCoverageComplete;
  const activeSeat = inputDisabled ? null : getNextSeat(board.dealer, auction);
  const nextBidLabel = practiceComplete ? 'Practice sequence complete' :
    trainerCoverageComplete ? 'Trainer coverage complete' :
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
          <ExplanationPanel lines={displayedExplanation} explanationRef={explanationRef} />
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
    if (stage !== 'opponentPassThrough' && stage !== 'outsideCoverage' &&
        stage !== 'auctionComplete' && practiceStages.includes(stage)) {
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
    `Stage: ${stage}`,
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

/// Explanation is displayed immediately on entering a disabled state.  Preserve the last
/// evaluation above it so that a valid final bid's explanation is not lost.
function getTerminalGuidance(coverage: TrainerCoverageState, practiceComplete: boolean): string[] {
  const lines: string[] = [];
  if (practiceComplete) {
    lines.push('', 'Practice sequence complete. This is not necessarily the end of the ' +
      'real bridge auction. Select New Deal or Test Deal to continue.');
  }
  switch (coverage.kind) {
    case 'auctionComplete':
      lines.push('', 'Bridge auction complete. Select New Deal or Test Deal to continue.');
      break;
    case 'boundary':
      if (! practiceComplete) {
        lines.push('', 'The trainer has reached an explained scope boundary. ' +
          'Real bridge bidding may continue, but further calls are not evaluated here.');
        appendRuleExplanation(lines, coverage.rule);
        lines.push('Bidding input is disabled. Select New Deal or Test Deal to continue.');
      }
      break;
    case 'uncovered':
      if (! practiceComplete) {
        lines.push('', 'No bidding rule or scope boundary currently covers this ' +
          `${getStageLabel(coverage.stage)} decision. This is a trainer coverage gap, not a ` +
          'judgment that a legal bridge bid is wrong.');
        lines.push('Bidding input is disabled. Select New Deal or Test Deal to continue.');
      }
      break;
    case 'outsideCoverage':
      if (! practiceComplete) {
        lines.push('', "This auction has reached a stage outside the trainer's selected " +
          'bidding coverage. Real bridge bidding may continue.');
        lines.push('Bidding input is disabled. Select New Deal or Test Deal to continue.');
      }
      break;
    case 'opponentPassThrough':
    case 'supported':
      break;
  }
  return lines;
}

function getStageLabel(stage: BidPosition): string {
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
    case 'balancing':
      return 'fourth-seat balance';
    case 'overcallerRebid':
      return 'overcaller rebid';
    case 'advancing':
      return 'advance';
    case 'opponentPassThrough':
      return 'intervening opponent call';
    case 'outsideCoverage':
      return 'unsupported continuation';
    case 'auctionComplete':
      return 'completed auction';
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

function buildExplanationLines (title: string, result: BidEvalResult): string[] {
  const lines: string[] = [];
  const candidates = getApplicableCandidateCalls(result);
  lines.push(title);
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
