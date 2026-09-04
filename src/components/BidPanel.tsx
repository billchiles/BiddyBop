import { useEffect, useRef, useMemo, useState, type FormEvent } from 'react';
import { evaluateUserCall, getApplicableCandidateCalls, type BidEvalResult,
         normalizeCallInput } from '../models/biddingEvaluation';
import { getHandFacts, type Deal } from '../models/cards';
import { type Call, defaultBiddingSystem, type RuleEvaluationContext } from '../models/bidding-types';
import { DealCompass } from './DealCompass';


/// BidPanel owns the visible auction practice area while App keeps telemetry separate.
export interface BidPanelProps {
  deal: Deal;
  onTelemetry: (lines: string[]) => void;
}

type BidSeat = 'N' | 'E' | 'S' | 'W';

interface AuctionCall {
  seat: BidSeat;
  call: Call;
}

export function BidPanel({ deal, onTelemetry }: BidPanelProps) {
  const [bidText, setBidText] = useState('');
  const [auctionCalls, setAuctionCalls] = useState<AuctionCall[]>([]);
  const [northResult, setNorthResult] = useState<BidEvalResult | null>(null);
  const [southResult, setSouthResult] = useState<BidEvalResult | null>(null);
  const [explanationLines, setExplanationLines] = useState<string[]>(['No evaluation yet.']);
  const explanationRef = useRef<HTMLPreElement | null>(null);

  const northContext = useMemo<RuleEvaluationContext>(() => {
    return {
      role: 'opener',
      auction: [],
      hand: deal.N,
      handFacts: getHandFacts(deal.N),
      partnerOpeningCall: null,
    };
  }, [deal]);

  useEffect(() => {
    setBidText('');
    setAuctionCalls([]);
    setNorthResult(null);
    setSouthResult(null);
    setExplanationLines(['No evaluation yet.']);
  }, [deal]);

  useEffect(() => {
    if (explanationRef.current === null) {
      return;
    }
    explanationRef.current.scrollTop = explanationRef.current.scrollHeight;
  }, [explanationLines]);

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (northResult === null) {
      evaluateNorthBid();
      return;
    }
    if (southResult === null) {
      evaluateSouthBid();
      return;
    }
    onTelemetry(['Only North opening and South response are evaluated in the first punch-through.']);
  }

  function evaluateNorthBid(): void {
    const normalizedCall = normalizeCallInput(bidText);
    if (normalizedCall === null) {
      const lines = [`Invalid North opening input: "${bidText}".`];
      setNorthResult(null);
      setSouthResult(null);
      setExplanationLines(lines);
      onTelemetry(lines);
      return;
    }
    const result = evaluateUserCall(normalizedCall, northContext, defaultBiddingSystem);
    const nextAuctionCalls: AuctionCall[] = [
      { seat: 'N', call: normalizedCall },
      { seat: 'E', call: 'Pass' },
    ];

    setNorthResult(result);
    setSouthResult(null);
    setAuctionCalls(nextAuctionCalls);
    setBidText('');
    setExplanationLines((current) => [...current, '',
                                      ...buildExplanationLines('North opening', result), ]);
    onTelemetry(['Evaluating North opening.', ...result.telemetryLines]);
  }

  function evaluateSouthBid(): void {
    const northCall = getNorthCall();
    const southCall = normalizeCallInput(bidText);

    if (northCall === null) {
      const lines = ['Cannot evaluate South response until North has a valid opening call.'];
      setSouthResult(null);
      setExplanationLines(lines);
      onTelemetry(lines);
      return;
    }

    if (southCall === null) {
      const lines = [`Invalid South response input: "${bidText}".`];
      setSouthResult(null);
      setExplanationLines(lines);
      onTelemetry(lines);
      return;
    }

    const southContext: RuleEvaluationContext = {
      role: 'responder',
      auction: [northCall],
      hand: deal.S,
      handFacts: getHandFacts(deal.S),
      partnerOpeningCall: northCall,
    };
    const result = evaluateUserCall(southCall, southContext, defaultBiddingSystem);
    const nextAuctionCalls: AuctionCall[] = [
      ...auctionCalls,
      { seat: 'S', call: southCall },
      { seat: 'W', call: 'Pass' },
    ];

    setSouthResult(result);
    setAuctionCalls(nextAuctionCalls);
    setBidText('');
    setExplanationLines((current) => [...current, '',
                                      ...buildExplanationLines('South response', result), ]);
    onTelemetry(['Evaluating South response.', ...result.telemetryLines]);
  }

  function getNorthCall(): Call | null {
    if (northResult === null) {
      return null;
    }
    return northResult.normalizedCall;
  }

  const nextBidLabel = getNextBidLabel(northResult, southResult);
  const auctionRows = buildAuctionRows(auctionCalls);

  return (
    <section className="bidPanel" aria-label="Bid evaluation">
      <section className="trainerWorkspace">
        <section className="trainerLeftColumn">
          <DealCompass deal={deal} />
          <form className="bidForm" onSubmit={handleSubmit}>
            <label className="bidLabel" htmlFor="bidInput">{nextBidLabel}</label>
            <input
              id="bidInput"
              className="bidInput"
              value={bidText}
              onChange={(event) => setBidText(event.target.value)}
              placeholder="1H, 1NT, Pass"
            />
            <button className="bidButton" type="submit">Commit</button>
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

function getNextBidLabel(northResult: BidEvalResult | null,
                         southResult: BidEvalResult | null): string {
  if (northResult === null) {
    return 'North:';
  }
  if (southResult === null) {
    return 'South:';
  }
  return 'West:';
}

function buildExplanationLines(title: string, result: BidEvalResult): string[] {
  const lines: string[] = [];
  const candidates = getApplicableCandidateCalls(result);

  lines.push(title);
  lines.push(`Normalized call: ${result.normalizedCall === null ? 'invalid or blank' : result.normalizedCall}`);

  if (result.userCallMatchingRules.length === 0) {
    lines.push('No rule satisfied by this call.');
  } else {
    lines.push('Rules satisfied by user call:');
    for (const rule of result.userCallMatchingRules) {
      lines.push(`- ${rule.id}: ${rule.title}`);
      if (rule.meaning !== undefined && rule.meaning !== '') {
        lines.push(`  Meaning: ${rule.meaning}`);
      }
      if (rule.guidance !== undefined && rule.guidance.length !== 0) {
        for (const guidanceLine of rule.guidance) {
          lines.push(`  ${guidanceLine}`);
        }
      }
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
}

function buildAuctionRows(auctionCalls: AuctionCall[]): AuctionCall[][] {
  const rows: AuctionCall[][] = [];
  let currentRow: AuctionCall[] = [];

  for (const auctionCall of auctionCalls) {
    currentRow.push(auctionCall);
    if (currentRow.length === 4) {
      rows.push(currentRow);
      currentRow = [];
    }
  }

  if (currentRow.length !== 0) {
    rows.push(currentRow);
  }

  if (rows.length === 0) {
    rows.push([]);
  }

  return rows;
}

function AuctionGrid({ rows }: { rows: AuctionCall[][] }) {
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
              <td>{getAuctionCell(row, 'N')}</td>
              <td>{getAuctionCell(row, 'E')}</td>
              <td>{getAuctionCell(row, 'S')}</td>
              <td>{getAuctionCell(row, 'W')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function getAuctionCell(row: AuctionCall[], seat: BidSeat): string {
  const matchingCall = row.find((auctionCall) => auctionCall.seat === seat);
  if (matchingCall === undefined) {
    return '';
  }
  return matchingCall.call;
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
