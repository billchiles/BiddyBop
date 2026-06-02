import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { BiddingRules } from '../models/bidding-rules';
import { evaluateUserCall, getApplicableCandidateCalls, type RuleEvaluationContext, 
         type UserBidEvaluationResult, normalizeCallInput,  } from '../models/biddingEvaluation';
import { getHandFacts, type Deal } from '../models/cards';

/// BidPanel evaluates the user's North opening, then optionally South's response.
export interface BidPanelProps {
  deal: Deal;
  onTelemetry: (lines: string[]) => void;
}

export function BidPanel({ deal, onTelemetry }: BidPanelProps) {
  const [northBidText, setNorthBidText] = useState('');
  const [southBidText, setSouthBidText] = useState('');
  const [northResult, setNorthResult] = useState<UserBidEvaluationResult | null>(null);
  const [southResult, setSouthResult] = useState<UserBidEvaluationResult | null>(null);

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
    setNorthBidText('');
    setSouthBidText('');
    setNorthResult(null);
    setSouthResult(null);
  }, [deal]);

  function evaluateNorthBid(): void {
    const normalizedCall = normalizeCallInput(northBidText);
    if (normalizedCall === null) {
      setNorthResult(null);
      setSouthResult(null);
      onTelemetry([`Invalid North opening input: "${northBidText}".`]);
      return;
    }
    const result = evaluateUserCall(normalizedCall, BiddingRules, northContext);

    setNorthResult(result);
    setSouthResult(null);
    onTelemetry(['Evaluating North opening.', ...result.telemetryLines]);
  }

  function evaluateSouthBid(): void {
    const northCall = normalizeCallInput(northBidText);
    const southCall = normalizeCallInput(southBidText);

    if (northCall === null) {
      const lines = ['Cannot evaluate South response until North has a valid opening call.'];
      setSouthResult(null);
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

    if (southCall === null) {
      const lines = [`Invalid South response input: "${southBidText}".`];
      setSouthResult(null);
      onTelemetry(lines);
      return;
    }

    const result = evaluateUserCall(southCall, BiddingRules, southContext);

    setSouthResult(result);
    onTelemetry(['Evaluating South response.', ...result.telemetryLines]);
  }

  function handleNorthSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    evaluateNorthBid();
  }

  function handleSouthSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    evaluateSouthBid();
  }

  const northCandidates = northResult === null ? [] : getApplicableCandidateCalls(northResult);
  const southCandidates = southResult === null ? [] : getApplicableCandidateCalls(southResult);

  return (
    <section className="bidPanel" aria-label="Bid evaluation">
      <form className="bidForm" onSubmit={handleNorthSubmit}>
        <label className="bidLabel" htmlFor="northBidInput">North opening</label>
        <input
          id="northBidInput"
          className="bidInput"
          value={northBidText}
          onChange={(event) => setNorthBidText(event.target.value)}
          placeholder="1H, 1NT, Pass"
        />
        <button className="bidButton" type="submit">Evaluate North</button>
      </form>

      <ResultSummary title="North result" result={northResult} candidates={northCandidates} />

      <form className="bidForm" onSubmit={handleSouthSubmit}>
        <label className="bidLabel" htmlFor="southBidInput">South response</label>
        <input
          id="southBidInput"
          className="bidInput"
          value={southBidText}
          onChange={(event) => setSouthBidText(event.target.value)}
          placeholder="2H, 1NT, Pass"
        />
        <button className="bidButton" type="submit">Evaluate South</button>
      </form>

      <ResultSummary title="South result" result={southResult} candidates={southCandidates} />
    </section>
  );
}

interface ResultSummaryProps {
  title: string;
  result: UserBidEvaluationResult | null;
  candidates: ReturnType<typeof getApplicableCandidateCalls>;
}

function ResultSummary({ title, result, candidates }: ResultSummaryProps) {
  if (result === null) {
    return (
      <section className="resultSummary">
        <h3>{title}</h3>
        <p>No evaluation yet.</p>
      </section>
    );
  }

  return (
    <section className="resultSummary">
      <h3>{title}</h3>
      <p>Normalized call: {result.normalizedCall === null ? 'invalid or blank' : result.normalizedCall}</p>
      <h4>Rules satisfied by user call</h4>
      <RuleList ruleIds={result.userCallMatchingRules.map((rule) => rule.id)} emptyText="No rule satisfied by this call." />
      <h4>All applicable candidate rules</h4>
      {candidates.length === 0 ? (
        <p>No applicable candidate calls.</p>
      ) : (
        <ul>
          {candidates.map((candidate) => (
            <li key={`${candidate.rule.id}-${candidate.call}`}>
              <strong>{candidate.call}</strong>: {candidate.rule.id}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function RuleList({ ruleIds, emptyText }: { ruleIds: string[]; emptyText: string }) {
  if (ruleIds.length === 0) {
    return <p>{emptyText}</p>;
  }

  return (
    <ul>
      {ruleIds.map((ruleId) => (
        <li key={ruleId}>{ruleId}</li>
      ))}
    </ul>
  );
}
