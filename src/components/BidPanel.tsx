import { useEffect, useLayoutEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { evaluateUserCall, getApplicableCandidateCalls, getBiddingTurnStatus, getUnmodeledContinuationForce, normalizeCallInput,
         type BidEvalResult, type BiddingTurnStatus, type UnmodeledContinuationForce } from '../models/biddingEvaluation';
import { auctionIsComplete, getNextBiddingRuleStage, getNextSeat, getInterferenceAfterOpening, getRecordedPracticeCorrection, isPracticeSequenceComplete, isCallAvailableInAuction } from '../models/auction';
import { getHandFacts, SEATS, SUITS, type Board, type Hand, type Seat } from '../models/cards';
import type { RuleTestDeal } from '../models/test-deals-registry';
import { type BidStage, type BiddingSystem, type Call } from '../models/bidding-types';
import { DealCompass } from './DealCompass';
import { getBidExplanationLines, getMatchedCallExplanationLines, getRuleExplanationLines }
  from '../models/explanations';

const MAX_EXPLANATION_LINES = 1200;

/// Human-readable locator captured when a practice exercise is selected, so changing
/// the dropdown later cannot change the identity shown in its Report.
export interface PracticeDealIdentification {
  selection: string;
  replay: string;
}


/// BidPanel evaluates the student's call for each seat. In a selected practice lesson,
/// the recorded call becomes the next physical auction call even when the student chose
/// another legal call, keeping the remaining exercise on its intended auction.
export interface BidPanelProps {
  board: Board;
  biddingSystem: BiddingSystem;
  onTelemetry: (lines: string[]) => void;
  telemetryLines: string[];
  testDeal?: RuleTestDeal;
  practiceDealIdentification?: PracticeDealIdentification;
  children?: ReactNode;
}

export function BidPanel({ board, biddingSystem, onTelemetry, telemetryLines, testDeal,
                           practiceDealIdentification, children }: BidPanelProps) {
  const [bidText, setBidText] = useState('');
  const [showAllHands, setShowAllHands] = useState(false);
  const bidInputRef = useRef<HTMLInputElement | null>(null);
  const [auction, setAuction] = useState<Call[]>([]);
  const [explanationLines, setExplanationLines] = useState<string[]>(() =>
    getInitialExplanationLines(testDeal, practiceDealIdentification));
  const [reportNotice, setReportNotice] = useState<{ text: string; version: number } | null>(null);
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
  // On an unjudged practice turn, use the known recorded auction to explain
  // its appropriate continuation without claiming we evaluated the alternatives.
  const practiceRecordedCall = testDeal?.practiceAuction[auction.length];
  const hasFollowingPracticeCall = testDeal !== undefined &&
    auction.length + 1 < testDeal.practiceAuction.length;
  const practiceStep = practiceRecordedCall === undefined ? null : {
    recordedCall: practiceRecordedCall,
    followingSeat: hasFollowingPracticeCall
      ? getNextSeat(board.dealer, [...auction, practiceRecordedCall]) : null,
    followingStage: hasFollowingPracticeCall
      ? getNextBiddingRuleStage(board.dealer, [...auction, practiceRecordedCall]) : null,
  };
  // The next-turn note is informational. It never blocks a legal auction continuation.
  const turnGuidance = getNextTurnGuidance(getNextSeat(board.dealer, auction),
    biddingTurnStatus, practiceComplete, outstandingForce, practiceStep);
  const displayedExplanation = [...explanationLines, ...turnGuidance,
    ...(reportNotice === null ? [] : ['', reportNotice.text])];
  // Scroll to the last *reviewed* call, not a preview of the next seat's turn.
  // Before the first call, keep the New Deal heading at the top.
  const reviewedHeadingIndex = explanationLines.findLastIndex((line) => line.startsWith('------------ '));

  useEffect(() => {
    setBidText('');
    setAuction([]);
    setExplanationLines(getInitialExplanationLines(testDeal, practiceDealIdentification));
    setReportNotice(null);
  }, [board, biddingSystem, testDeal, practiceDealIdentification]);

  // New deals and successful bids leave the next call ready for keyboard entry.
  useEffect(() => {
    if (!auctionComplete && !practiceComplete) bidInputRef.current?.focus();
  }, [board, auction, auctionComplete, practiceComplete]);

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setReportNotice(null);
    bidInputRef.current?.focus();
    if (auctionComplete || practiceComplete) {
      setExplanationLines((current) => appendExplanation(current, ['',
        'Bidding input is disabled. Select New Deal or Test Deal to continue.']));
      onTelemetry(['Bidding input is disabled. Select New Deal or Test Deal.']);
      return;
    }

    commitUserCall();
  }

  /// Evaluate each seat's entered call before using the recorded practice continuation, when
  /// needed, to preserve the remaining lesson. Never skip an unentered recorded call.
  function commitUserCall(): void {
    const seat = getNextSeat(board.dealer, auction);
    const normalizedCall = normalizeCallInput(bidText);
    if (normalizedCall === null) {
      reportInvalidInput(seat, getNextBiddingRuleStage(board.dealer, auction));
      return;
    }

    // A recorded practice substitution must never bypass legality of the student's actual call.
    if (! isCallAvailableInAuction(normalizedCall, auction)) {
      const lines = [`${normalizedCall} is not available in this auction, check that level ` +
                     `and suit are higher than previous suit call.`];
      setExplanationLines((current) => appendExplanation(current, ['', ...lines]));
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
    setAuction(enteredAuction);
    setBidText('');
    const notes = getPracticeGuidanceLines(board.dealer, auction, enteredAuction, testDeal);
    const recordedResult = result !== null && recordedCall !== null
      ? evaluateUserCall(recordedCall, board, auction, biddingSystem) : null;
    finishBidEntry(seat, normalizedCall, biddingTurnStatus, result, notes,
      recordedCall === null ? null : { call: recordedCall, result: recordedResult });
  }

  /// Explain a judged or unjudged legal call. Both paths use the same auction update above.
  /// An unjudged Pass is neither a rule failure nor a recommendation to Pass.
  function finishBidEntry(seat: Seat, call: Call, status: BiddingTurnStatus,
                          result: BidEvalResult | null, practiceNotes: string[],
                          correction: { call: Call; result: BidEvalResult | null } | null): void {
    const stage = status.kind === 'supported' || status.kind === 'scopeBoundary' ||
      status.kind === 'noApplicableRule' ? status.stage : null;
    const handFacts = getHandFacts(board.deal[seat]);
    const title = `------------ ${getSeatLabel(seat)} ${call} — ${getStageLabel(stage)} ------------`;
    // The next-seat preview already occupies this position in the visible transcript.
    // Commit its exact lines before recording the call, so they never jump between seats.
    const explanation = getBidExplanationLines({
      title, call, status, result, handFacts, auctionLength: auction.length,
      previewLines: turnGuidance, seatLabel: getSeatLabel(seat),
      recordedUnjudged: correction === null && testDeal !== undefined,
    });
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
        for (const rule of matched) {
          if (correction.result !== null) {
            explanation.push(...getMatchedCallExplanationLines(correction.result, rule,
              handFacts, auction.length));
          }
        }
      } else if (correction.result !== null && status.kind === 'supported') {
        explanation.push('This recorded continuation is not supported by an applicable rule ' +
          'under the current bidding configuration.');
      } else {
        explanation.push('The app does not evaluate the recorded call in this bidding context.');
      }
    }
    if (practiceNotes.length > 0) explanation.push('', ...practiceNotes);
    // A deal description may reveal its intended decision. Treat it as a lesson
    // takeaway, shown only after the student enters the final recorded call.
    if (testDeal !== undefined && isPracticeSequenceComplete(
          [...auction, correction?.call ?? call], testDeal.practiceAuction)) {
      explanation.push('', `Exercise takeaway: ${testDeal.description}`);
    }
    // Pre-call guidance was already visible after the prior lines. Keep its
    // exact prefix, including its leading blank, as the committed history.
    setExplanationLines((current) => appendExplanation(current,
      explanation[0] === '' ? explanation : ['', ...explanation]));
    onTelemetry(result === null ? [`Recorded unjudged ${getSeatLabel(seat)} ${call}.`] :
      [`Evaluating ${title}.`, ...result.telemetryLines]);
  }

  function reportInvalidInput(seat: Seat, stage: BidStage | null): void {
    const lines = [
      `Invalid ${getSeatLabel(seat)} ${getStageLabel(stage)} input: "${bidText}".`,
    ];
    setExplanationLines((current) => appendExplanation(current, ['', ...lines]));
    onTelemetry(lines);
  }

  function showReportNotice(text: string): void {
    setReportNotice((prior) => ({ text, version: (prior?.version ?? 0) + 1 }));
  }

  function reportState(includeTelemetry: boolean): void {
    // The confirmation belongs to the visible panel, not the copied report.
    const report = buildReportText(board, auction, [...explanationLines, ...turnGuidance],
      biddingSystem, testDeal, practiceDealIdentification,
      includeTelemetry ? telemetryLines : null);
    if (navigator.clipboard === undefined) {
      showReportNotice('Clipboard unavailable.');
      return;
    }
    navigator.clipboard.writeText(report)
      .then(() => showReportNotice('Report copied to clipboard.'))
      .catch(() => showReportNotice('Could not copy report. Check clipboard permissions.'));
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
          {children}
          <DealCompass deal={board.deal} activeSeat={activeSeat} showAllHands={showAllHands}>
            <label className="handDisplaySetting">
              <span>Show hands</span>
              <select value={showAllHands ? 'all' : 'bidding'}
                onChange={(event) => setShowAllHands(event.target.value === 'all')}>
                <option value="bidding">Bidding hand only</option>
                <option value="all">All hands always</option>
              </select>
            </label>
          </DealCompass>
          <form className="bidForm" onSubmit={handleSubmit}>
            <label className="bidLabel" htmlFor="bidInput">{nextBidLabel}</label>
            <input
              ref={bidInputRef}
              autoFocus
              id="bidInput"
              className="bidInput"
              value={bidText}
              onChange={(event) => setBidText(event.target.value)}
              placeholder="1H, 1NT, Pass"
              disabled={inputDisabled}
            />
            <button className="bidButton" type="submit" disabled={inputDisabled}>Commit</button>
            <button className="bidButton" type="button"
              title="Copy deal and explanations; Command-click to include telemetry"
              onClick={(event) => reportState(event.metaKey)}>Report</button>
          </form>
        </section>

        <section className="trainerRightColumn">
          <AuctionGrid rows={auctionRows} />
          <ExplanationPanel lines={displayedExplanation} board={board}
            focusHeadingIndex={Math.max(0, reviewedHeadingIndex)}
            reportNotice={reportNotice} />
        </section>
      </section>
    </section>
  );
}

/// Start each deal with an empty transcript; recorded practice calls and their
/// coaching notes become visible only after the student enters that physical turn.
function getInitialExplanationLines(testDeal?: RuleTestDeal,
                                    identification?: PracticeDealIdentification): string[] {
  if (testDeal === undefined) return ['============== New Deal =============='];
  return [
    '============== New Practice Deal ==============',
    ...(identification === undefined ? [] : [
      `Practice selection: ${identification.selection}`,
    ]),
  ];
}

/// Reveal only the notes for the recorded practice call just entered.
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

/// Explanation is scoped to the current deal (reset on redeal). A simple line cap prevents
/// long auctions or repeated invalid entries from growing an unbounded browser transcript.
function appendExplanation(current: string[], added: string[]): string[] {
  const updated = [...current, ...added];
  if (updated.length <= MAX_EXPLANATION_LINES) return updated;
  return ['Earlier explanation from this deal omitted (history limit).',
    ...updated.slice(-(MAX_EXPLANATION_LINES - 1))];
}

/// Report reuses the explanation displayed to the learner, including rule IDs, rather than
/// building and maintaining a second explanation/diagnostics stream.
function buildReportText(board: Board, auction: Call[], explanationLines: string[],
                         biddingSystem: BiddingSystem, testDeal: RuleTestDeal | undefined,
                         identification: PracticeDealIdentification | undefined,
                         telemetryLines: string[] | null): string {
  const stage = getNextBiddingRuleStage(board.dealer, auction);
  return [
    'Bridge Bidding Trainer — Report',
    `Mode: ${testDeal === undefined ? 'New Deal' : 'Practice Deal'}`,
    ...(testDeal === undefined ? [] : [
      `Practice deal: ${testDeal.description}`,
      ...(identification === undefined ? [] : [
        `Practice selection: ${identification.selection}`,
        `To replay: ${identification.replay}`,
      ]),
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
    ...(telemetryLines === null ? [] : [
      'Telemetry (latest retained lines):',
      ...telemetryLines,
    ]),
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
function getNextTurnGuidance(seat: Seat, status: BiddingTurnStatus, practiceComplete: boolean,
                             outstandingForce: UnmodeledContinuationForce | null,
                             practiceStep: { recordedCall: Call; followingSeat: Seat | null;
                                             followingStage: BidStage | null } | null): string[] {
  const lines: string[] = [];
  if (practiceComplete) {
    lines.push('', 'Practice sequence complete.  This is not necessarily the end of the ' +
      'real bridge auction.  Select New Deal or Test Deal to continue.');
  }
  if (!practiceComplete) {
    if (practiceStep !== null && status.kind !== 'supported' &&
        status.kind !== 'auctionComplete') {
      const next = practiceStep.followingSeat === null
        ? 'finish this practice exercise'
        : `continue to ${getSeatLabel(practiceStep.followingSeat)}'s ` +
          (practiceStep.followingStage === null ? 'next call' :
            getStageLabel(practiceStep.followingStage));
      lines.push('', `------------ ${getSeatLabel(seat)} to call — practice continuation ------------`,
        `The recorded ${practiceStep.recordedCall} is appropriate for this reviewed practice ` +
        'auction, but this turn is included for continuity rather than as a separate ' +
        'evaluated bidding decision.',
        `Enter ${practiceStep.recordedCall} to ${next}. If you enter a different legal ` +
        `call, the lesson will still continue with ${practiceStep.recordedCall}.`);
      if (status.kind === 'scopeBoundary') {
        lines.push('Why this turn is not evaluated:');
        lines.push(...getRuleExplanationLines(status.rule));
      }
    } else {
      switch (status.kind) {
      case 'auctionComplete':
        lines.push('', 'Bridge auction complete.  Select New Deal or Test Deal to continue.');
        return lines;
      case 'scopeBoundary':
        lines.push('', `------------ ${getSeatLabel(seat)} to call — ` +
          `${getStageLabel(status.stage)} ------------`,
          `The trainer cannot reliably evaluate ${getSeatLabel(seat)}'s decision in ` +
          'this auction. The following treatment explains why:');
        lines.push(...getRuleExplanationLines(status.rule));
        lines.push('This does not recommend Pass or any other particular call.');
        break;
      case 'noApplicableRule':
        lines.push('', `------------ ${getSeatLabel(seat)} to call — ` +
          `${getStageLabel(status.stage)} ------------`,
          'No reliable recommendation applies to this hand at this point in the auction. ' +
          'You may choose any legal call; an unsupported call is not necessarily incorrect.');
        break;
      case 'noModeledStage':
        lines.push('', `------------ ${getSeatLabel(seat)} to call — unmodeled turn ------------`,
          `The trainer cannot reliably evaluate ${getSeatLabel(seat)}'s decision in ` +
          'this auction. Later bids through overcaller rebids might have reliable feedback.');
        break;
      case 'supported':
        break;
      }
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

/// Align the last reviewed call at the top, even if the next seat's preview follows it.
/// No parallel transcript or call-history indexes are maintained.
function ExplanationPanel ({ lines, board, focusHeadingIndex, reportNotice }: {
  lines: string[]; board: Board; focusHeadingIndex: number;
  reportNotice: { text: string; version: number } | null;
}) {
  const explanationRef = useRef<HTMLPreElement | null>(null);
  const lastHeadingRef = useRef(-1);
  const lastBoardRef = useRef<Board | null>(null);
  const [scrollPosition, setScrollPosition] = useState({ above: false, below: false });
  const text = lines.join('\n');

  useLayoutEffect(() => {
    const element = explanationRef.current;
    if (element === null) return;
    const heading = element.children.item(focusHeadingIndex);
    const headingTop = heading instanceof HTMLElement ? heading.offsetTop : 0;
    const newReview = board !== lastBoardRef.current || focusHeadingIndex !== lastHeadingRef.current;
    const oldScrollTop = element.scrollTop;
    // A short explanation needs trailing scroll space to put its heading at
    // the viewport top. Recompute it from actual content height each time.
    element.style.paddingBottom = '0px';
    element.style.paddingBottom = `${Math.max(0,
      headingTop + element.clientHeight - element.scrollHeight)}px`;
    element.scrollTop = newReview ? headingTop : oldScrollTop;
    lastBoardRef.current = board;
    lastHeadingRef.current = focusHeadingIndex;
    setScrollPosition(measureExplanationScroll(element));
  }, [board, text, focusHeadingIndex]);

  // Show a newly copied report confirmation at the end of the same explanation panel.
  useLayoutEffect(() => {
    if (reportNotice === null) return;
    const element = explanationRef.current;
    if (element === null) return;
    element.scrollTop = element.scrollHeight;
    setScrollPosition(measureExplanationScroll(element));
  }, [reportNotice]);

  useEffect(() => {
    const element = explanationRef.current;
    if (element === null) return;
    const observer = new ResizeObserver(() => {
      setScrollPosition(measureExplanationScroll(element));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

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
        onScroll={(event) => setScrollPosition(measureExplanationScroll(event.currentTarget))}>
        {lines.map((line, index) => (
          <span className="explanationLine" key={index}>{line === '' ? '\u00a0' : line}</span>
        ))}
      </pre>
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
