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
  telemetryLines: string[];
  testDeal?: RuleTestDeal;
  practiceStages?: BidStage[];
}

export function BidPanel({ board, biddingSystem, onTelemetry, telemetryLines, testDeal, practiceStages }: BidPanelProps) {
  const [bidText, setBidText] = useState('');
  const [showAllHands, setShowAllHands] = useState(false);
  const [reportStatus, setReportStatus] = useState('');
  const [auction, setAuction] = useState<Call[]>(() =>
    setupPracticeAuction(board.dealer, [], testDeal, practiceStages));
  const [explanationLines, setExplanationLines] = useState<string[]>(() =>
    getInitialExplanationLines(board.dealer, testDeal, practiceStages));
  const practiceComplete = isPracticeSequenceComplete(auction, testDeal?.practiceAuction);
  // Rule feedback is independent of bridge legality and recorded practice completion.
  // An unsupported turn still accepts legal calls; later turns may be supported again.
  const biddingTurnStatus = useMemo(() => getBiddingTurnStatus(board, auction, biddingSystem),
    [board, auction, biddingSystem]);
  const auctionComplete = biddingTurnStatus.kind === 'auctionComplete';
  const outstandingForce = useMemo(() => biddingTurnStatus.kind === 'auctionComplete' ||
    (biddingTurnStatus.kind === 'supported' && !practiceComplete) ? null :
    getUnmodeledContinuationForce(board, auction, biddingSystem),
    [board, auction, biddingSystem, biddingTurnStatus, practiceComplete]);
  // The next-turn note is informational. It never blocks a legal auction continuation.
  const turnGuidance = getNextTurnGuidance(biddingTurnStatus, practiceComplete, outstandingForce);
  const displayedExplanation = [...explanationLines, ...turnGuidance];

  useEffect(() => {
    setBidText('');
    setAuction(setupPracticeAuction(board.dealer, [], testDeal, practiceStages));
    setExplanationLines(getInitialExplanationLines(board.dealer, testDeal, practiceStages));
    setReportStatus('');
  }, [board, biddingSystem, testDeal, practiceStages]);

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setReportStatus('');
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
    const title = `------------ ${getSeatLabel(seat)} ${call} — ${getStageLabel(stage)} ------------`;
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
    setExplanationLines((current) => [...current, '', ...lines]);
    onTelemetry(lines);
  }

  function reportState(): void {
    const report = buildReportText(board, auction, displayedExplanation,
      biddingSystem, testDeal, telemetryLines);
    if (navigator.clipboard === undefined) {
      setReportStatus('Clipboard unavailable.');
      return;
    }
    navigator.clipboard.writeText(report)
      .then(() => setReportStatus('Report copied to clipboard.'))
      .catch(() => setReportStatus('Could not copy report. Check clipboard permissions.'));
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
          <label className="handDisplaySetting">
            Show hands:
            <select value={showAllHands ? 'all' : 'bidding'}
              onChange={(event) => setShowAllHands(event.target.value === 'all')}>
              <option value="bidding">Bidding hand only</option>
              <option value="all">All hands always</option>
            </select>
          </label>
          <DealCompass deal={board.deal} activeSeat={activeSeat} showAllHands={showAllHands} />
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
            <button className="bidButton" type="button" onClick={reportState}>Report</button>
          </form>
          {reportStatus !== '' && <p className="reportStatus" role="status">{reportStatus}</p>}
        </section>

        <section className="trainerRightColumn">
          <AuctionGrid rows={auctionRows} />
          <ExplanationPanel lines={displayedExplanation} />
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
  const heading = `============== ${testDeal === undefined ? 'New Deal' : 'New Practice Deal'} ==============`;
  return notes.length === 0 ? [heading] : [heading, 'Recorded practice setup:', ...notes];
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

/// Report reuses the explanation displayed to the learner, including rule IDs, rather than
/// building and maintaining a second explanation/diagnostics stream.
function buildReportText(board: Board, auction: Call[], explanationLines: string[],
                         biddingSystem: BiddingSystem, testDeal: RuleTestDeal | undefined,
                         telemetryLines: string[]): string {
  const stage = getNextBiddingRuleStage(board.dealer, auction);
  return [
    'Bridge Bidding Trainer — Report',
    `Mode: ${testDeal === undefined ? 'New Deal' : 'Practice Deal'}`,
    ...(testDeal === undefined ? [] : [
      `Practice deal: ${testDeal.description}`,
      `Recorded practice auction: ${testDeal.practiceAuction.join(' ')}`,
    ]),
    `Bidding agreements: ${JSON.stringify(biddingSystem)}`,
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
    '',
    'Telemetry (latest retained lines):',
    ...telemetryLines,
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
  }
  if (!practiceComplete) {
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
  }
  // Completion ends the *lesson*, not the partnership commitment. Never invent
  // an unmodeled third bid or imply that a forcing call authorizes partner to Pass.
  if (outstandingForce !== null) {
    if (outstandingForce.lastStage === 'balancing') {
      lines.push('The balancing Double asks partner to act after the opponents have ' +
        'had their opportunity. Partner normally selects an unbid suit; ' +
        'passing for penalties requires exceptional defensive values. ' +
        'The app does not teach the later continuation.');
    } else if (outstandingForce.kind === 'gameForce') {
      lines.push('A game-forcing call commits the partnership to continue toward game, ' +
        'absent substantive opposing interference. The app does not teach every later ' +
        'continuation; a practice exercise ending does not cancel the game force.');
    } else {
      const bidder = outstandingForce.lastStage === 'opening' ||
        outstandingForce.lastStage === 'openerRebid' ? 'Opener' :
        outstandingForce.lastStage === 'responding' ||
        outstandingForce.lastStage === 'responderRebid' ? 'Responder' :
        outstandingForce.lastStage === 'advancing' ? 'Advancer' : 'Overcaller';
      lines.push(`${bidder}'s call is forcing for one round. Partner must act if the ` +
        'opponents do not interfere. The app does not teach every subsequent call.');
    }
  }
  return lines;
}

/// A legal call outside modeled rule feedback is recorded, not graded as wrong.  Pass may
/// be expected when the other partnership is describing its hands, but we do not infer that
/// it is the best call merely because the trainer has no applicable rule.
function buildUnjudgedCallExplanation(title: string, call: Call,
                                      status: BiddingTurnStatus): string[] {
  const lines = [title, `The trainer cannot evaluate ${call} at this turn.`];
  if (status.kind === 'scopeBoundary') {
    appendRuleExplanation(lines, status.rule);
    lines.push('The auction may continue; this scope boundary does not recommend Pass.');
  } else if (status.kind === 'noApplicableRule') {
    lines.push('The trainer has no recommendation for this hand and auction. ' +
      'That does not mean your call is wrong.');
  } else {
    lines.push('This part of the auction is not covered by the trainer. ' +
      'You may continue bidding, and later calls may be evaluated.');
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
  const scopeBoundary = result.applicableRules.find((rule) => rule.kind === 'scopeBoundary');
  if (scopeBoundary !== undefined && candidates.length === 0) {
    lines.push('Choosing a bid here requires additional judgment.');
    appendRuleExplanation(lines, scopeBoundary);
    lines.push('  The app cannot reliably recommend a particular bid here.');
  } else if (result.userCallMatchingRules.length === 0) {
    lines.push('This call does not match a recommendation for this hand and auction. ' +
      'It is not necessarily a wrong bridge call.');
    const preferredRule = result.applicableRules[0];
    if (preferredRule !== undefined) {
      lines.push('');
      lines.push('The trainer prefers:');
      appendRuleExplanation(lines, preferredRule);
    }
  } else {
    lines.push('Why this call fits:');
    for (const rule of result.userCallMatchingRules) {
      appendRuleExplanation(lines, rule);
    }
  }

  lines.push('');
  lines.push('Calls supported for this hand:');
  if (candidates.length === 0) {
    lines.push('- none');
  } else {
    for (const candidate of candidates) {
      lines.push(`- ${candidate.call}: ${candidate.rule.title} [${candidate.rule.id}]`);
    }
  }

  return lines;
} // buildExplanationLines()

function appendRuleExplanation (lines: string[], rule: BidRule): void {
  lines.push(`- ${rule.title} [${rule.id}]`);
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

/// Keep the newest response in view while showing a persistent cue when earlier explanations
/// have scrolled out of sight. The cue lives in the heading, never over the content.
function ExplanationPanel ({ lines }: { lines: string[] }) {
  const explanationRef = useRef<HTMLPreElement | null>(null);
  const [scrollPosition, setScrollPosition] = useState({ above: false, below: false });
  const text = lines.join('\n');

  useEffect(() => {
    const element = explanationRef.current;
    if (element === null) return;
    element.scrollTop = element.scrollHeight;
    setScrollPosition(measureExplanationScroll(element));
    const observer = new ResizeObserver(() => {
      setScrollPosition(measureExplanationScroll(element));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [text]);

  return (
    <section className="resultSummary" aria-label="Explanation and app output">
      <div className="explanationHeader">
        <h3>Explanation</h3>
        <span className="explanationScrollCue" aria-live="polite">
          {scrollPosition.above ? '↑ Earlier text above' : ''}
          {scrollPosition.above && scrollPosition.below ? ' · ' : ''}
          {scrollPosition.below ? '↓ More below' : ''}
        </span>
      </div>
      <pre ref={explanationRef} className="explanationText"
        onScroll={(event) => setScrollPosition(measureExplanationScroll(event.currentTarget))}>{text}</pre>
    </section>
  );
}

/// The scroll cue remains useful on macOS even when native overlay scrollbars are hidden.
function measureExplanationScroll(element: HTMLPreElement): { above: boolean; below: boolean } {
  return {
    above: element.scrollTop > 1,
    below: element.scrollTop + element.clientHeight < element.scrollHeight - 1,
  };
}
