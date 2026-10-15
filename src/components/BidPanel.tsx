import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { evaluateUserCall, getApplicableCandidateCalls, getBiddingTurnStatus, getUnmodeledContinuationForce, normalizeCallInput,
         type BidEvalResult, type BiddingTurnStatus, type UnmodeledContinuationForce } from '../models/biddingEvaluation';
import { auctionIsComplete, getNextBiddingRuleStage, getNextSeat, getInterferenceAfterOpening, getRecordedPracticeCorrection, isPracticeSequenceComplete, isCallAvailableInAuction } from '../models/auction';
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
  const [explanationLines, setExplanationLines] = useState<string[]>(() =>
    getInitialExplanationLines(board.dealer, testDeal, practiceStages));
  const explanationRef = useRef<HTMLPreElement | null>(null);
  const practiceComplete = isPracticeSequenceComplete(auction, testDeal?.practiceAuction);
  // Rule feedback is independent of bridge legality and recorded practice completion.
  // An unsupported turn still accepts legal calls; later turns may be supported again.
  const biddingTurnStatus = useMemo(() => getBiddingTurnStatus(board, auction, biddingSystem),
    [board, auction, biddingSystem]);
  const auctionComplete = biddingTurnStatus.kind === 'auctionComplete';
  const outstandingForce = useMemo(() => biddingTurnStatus.kind === 'supported' ||
    biddingTurnStatus.kind === 'auctionComplete' ? null :
    getUnmodeledContinuationForce(board, auction, biddingSystem),
    [board, auction, biddingSystem, biddingTurnStatus]);
  // The next-turn note is informational. It never blocks a legal auction continuation.
  const turnGuidance = getNextTurnGuidance(biddingTurnStatus, practiceComplete, outstandingForce);
  const displayedExplanation = [...explanationLines, ...turnGuidance];
  const turnGuidanceText = turnGuidance.join('\n');

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
  }, [explanationLines, turnGuidanceText]);

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (auctionComplete || practiceComplete) {
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
    const seat = getNextSeat(board.dealer, auction);
    const normalizedCall = normalizeCallInput(bidText);
    if (normalizedCall === null) {
      reportInvalidInput(seat, getNextBiddingRuleStage(board.dealer, auction));
      return;
    }

    // A recorded practice substitution must never bypass legality of the student's actual call.
    if (! isCallAvailableInAuction(normalizedCall, auction)) {
      const lines = [`${normalizedCall} is not available in this auction.`];
      setExplanationLines((current) => [...current, '', ...lines]);
      onTelemetry(lines);
      return;
    }
    // All legal calls advance the physical auction, even when no rule evaluates this turn.
    // Practice mode substitutes the recorded call after evaluating the student's legal choice.
    const recordedCall = getRecordedPracticeCorrection(
      auction, normalizedCall, testDeal?.practiceAuction);
    const result = biddingTurnStatus.kind === 'noModeledStage' ? null :
      evaluateUserCall(normalizedCall, board, auction, biddingSystem);
    const enteredAuction: Call[] = [...auction, recordedCall ?? normalizedCall];
    const nextAuction = setupPracticeAuction(board.dealer, enteredAuction, testDeal, practiceStages);
    setAuction(nextAuction);
    setBidText('');
    const notes = getPracticeGuidanceLines(board.dealer, auction, nextAuction, testDeal);
    const recordedResult = result !== null && recordedCall !== null
      ? evaluateUserCall(recordedCall, board, auction, biddingSystem) : null;
    finishBidEntry(seat, normalizedCall, biddingTurnStatus, result, notes,
      recordedCall === null ? null : { call: recordedCall, result: recordedResult });
    if (nextAuction.length > enteredAuction.length) {
      const scripted = nextAuction.slice(enteredAuction.length);
      onTelemetry([`Practice setup added: ${scripted.join(', ')}.`]);
    }
  }

  /// Explain a judged or unjudged legal call. Both paths use the same auction update above.
  /// An unjudged Pass is neither a rule failure nor a recommendation to Pass.
  function finishBidEntry(seat: Seat, call: Call, status: BiddingTurnStatus,
                          result: BidEvalResult | null, practiceNotes: string[],
                          correction: { call: Call; result: BidEvalResult | null } | null): void {
    const stage = status.kind === 'supported' || status.kind === 'scopeBoundary' ||
      status.kind === 'noApplicableRule' ? status.stage : null;
    const title = `${getSeatLabel(seat)} ${getStageLabel(stage)}`;
    const explanation = status.kind === 'supported' && result !== null
      ? buildExplanationLines(title, result)
      : buildUnjudgedCallExplanation(title, call, status);
    if (status.kind === 'supported' && result !== null) {
      const intervention = getInterferenceAfterOpening(board.dealer, auction);
      if (stage === 'responding' && intervention !== 'none' &&
          getApplicableCandidateCalls(result).length === 0) {
        explanation.push(intervention === 'suitOvercall'
          ? 'No modeled response qualifies after this natural suit overcall.  Pass is available, ' +
            'but the app does not automatically infer Pass as the best action.'
          : 'Responder treatments after this intervention may be incomplete.  Pass is available, ' +
            'but no recommendation is established from the empty candidate list.');
      }
    }
    if (correction !== null) {
      explanation.push('', `Practice continuation: You entered ${call}, but ` +
        `this exercise records ${correction.call}.  The auction uses ${correction.call} so ` +
        'you can continue the lesson.  The recorded call is not necessarily the only sound bid.');
      const matched = correction.result?.userCallMatchingRules ?? [];
      if (matched.length > 0) {
        explanation.push('Reason for the recorded call:');
        for (const rule of matched) appendRuleExplanation(explanation, rule);
      } else if (correction.result !== null && status.kind === 'supported') {
        explanation.push('This recorded continuation is not supported by an applicable rule ' +
          'under the current bidding configuration.');
      } else {
        explanation.push('The app does not evaluate the recorded call in this bidding context.');
      }
    }
    if (practiceNotes.length > 0) explanation.push('', ...practiceNotes);
    setExplanationLines((current) => [...current, '', ...explanation]);
    onTelemetry(result === null ? [`Recorded unjudged ${getSeatLabel(seat)} ${call}.`] :
      [`Evaluating ${title}.`, ...result.telemetryLines]);
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

  const inputDisabled = auctionComplete || practiceComplete;
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
    const stage = getNextBiddingRuleStage(dealer, next);
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
  const stage = getNextBiddingRuleStage(board.dealer, auction);
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

/// Show useful scope guidance before the next call, without treating it as auction completion.
/// Only a completed real auction or recorded practice sequence disables the bidding controls.
function getNextTurnGuidance(status: BiddingTurnStatus, practiceComplete: boolean,
                             outstandingForce: UnmodeledContinuationForce | null): string[] {
  const lines: string[] = [];
  if (practiceComplete) {
    lines.push('', 'Practice sequence complete.  This is not necessarily the end of the ' +
      'real bridge auction.  Select New Deal or Test Deal to continue.');
    return lines;
  }
  switch (status.kind) {
    case 'auctionComplete':
      lines.push('', 'Bridge auction complete.  Select New Deal or Test Deal to continue.');
      return lines;
    case 'scopeBoundary':
      lines.push('', 'The app cannot reliably recommend a bid at this point because of the ' +
        'nuances and judgment experienced players use.  You may continue entering legal ' +
        'calls, but the app may not be able to evaluate them.');
      appendRuleExplanation(lines, status.rule);
      break;
    case 'noApplicableRule':
      lines.push('', 'The app cannot give reliable feedback at this ' +
        `${getStageLabel(status.stage)} stage in the current auction.  ` +
        'This limitation does not mean Pass or another legal call is incorrect.  ' +
        'You may continue bidding.');
      break;
    case 'noModeledStage':
      lines.push('', 'The app does not have bidding rules for this turn.  ' +
        'You may continue entering legal calls.  Feedback will resume if a later ' +
        'auction context matches supported bidding rules.');
      break;
    case 'supported':
      break;
  }
  // A forcing call remains binding when one opposing Pass intervenes before partner acts.
  if (outstandingForce !== null && status.kind !== 'supported') {
    if (outstandingForce.lastStage === 'balancing') {
      lines.push('The balancing Double asks partner to act after the opponents have ' +
        'had their opportunity.  Partner normally selects an unbid suit; ' +
        'passing for penalties requires exceptional defensive values.  ' +
        'The app does not teach the later continuation.');
    } else if (outstandingForce.kind === 'gameForce') {
      lines.push("Responder's forcing bid still obliges opener to continue toward game.  " +
        "The app does not teach opener's third bid.");
    } else {
      lines.push("Responder's bid is forcing for one round.  Opener must continue in an " +
        "uncontested auction; the app does not teach opener's third bid.");
    }
  }
  return lines;
}

/// A legal call outside modeled rule feedback is recorded, not graded as wrong.  Pass may
/// be expected when the other partnership is describing its hands, but we do not infer that
/// it is the best call merely because the trainer has no applicable rule.
function buildUnjudgedCallExplanation(title: string, call: Call,
                                      status: BiddingTurnStatus): string[] {
  const lines = [title, `Recorded call: ${call}.  The app did not evaluate this call.`];
  if (status.kind === 'scopeBoundary') {
    appendRuleExplanation(lines, status.rule);
    lines.push('The auction may continue; this scope boundary does not recommend Pass.');
  } else if (status.kind === 'noApplicableRule') {
    lines.push('No bidding rule or explanatory boundary qualifies for this hand and auction.  ' +
      'This is a limitation of the app, not a judgment that the call is incorrect.');
  } else {
    lines.push('There is no modeled bidding-rule stage for this turn.  ' +
      'The app may be able to evaluate later calls as the auction develops.');
  }
  if (call === 'Pass') {
    lines.push('Pass may be entirely appropriate or expected here, especially while the ' +
      'opponents continue bidding.  The app cannot determine whether Pass is best for this hand.');
  }
  return lines;
}

function getStageLabel(stage: BidStage | null): string {
  switch (stage) {
    case null:
      return 'unmodeled turn';
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
  const scopeBoundary = result.applicableRules.find((rule) => rule.kind === 'scopeBoundary');
  if (scopeBoundary !== undefined && candidates.length === 0) {
    lines.push('Further bidding needs additional judgment.');
    appendRuleExplanation(lines, scopeBoundary);
    lines.push('  The app cannot reliably recommend a particular bid here.');
  } else if (result.userCallMatchingRules.length === 0) {
    lines.push('No applicable rule supports this call for the current hand, auction, and ' +
      'bidding agreements.  This does not necessarily mean the bid is an incorrect bid ' +
      'for the situation.');
    const preferredRule = result.applicableRules[0];
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
