import { useState } from 'react';
import './App.css';
import { BidPanel } from './components/BidPanel';
import { TelemetryPanel } from './components/TelemetryPanel';
import { generateOpenableNorthDeal, type Deal } from './models/cards';

/// App is the first browser-only punch-through for deal generation and rule matching.
interface AppState {
  deal: Deal;
  telemetryLines: string[];
}

function createInitialState(): AppState {
  const result = generateOpenableNorthDeal();
  return {
    deal: result.deal,
    telemetryLines: ['Generated initial deal.', ...result.telemetryLines],
  };
}

export default function App() {
  const [state, setState] = useState<AppState>(() => createInitialState());

  function redeal(): void {
    const result = generateOpenableNorthDeal();
    setState({
      deal: result.deal,
      telemetryLines: ['Generated new deal.', ...result.telemetryLines],
    });
  }

  function appendTelemetry(lines: string[]): void {
    if (lines.length === 0) {
      return;
    }

    setState((current) => ({
      ...current,
      telemetryLines: [...current.telemetryLines, '', ...lines],
    }));
  }

  return (
    <main className="appShell">
      <header className="appHeader">
        <div>
          <h1>Bridge Trainer Punch-Through</h1>
          <p>Random deal, openable North, user bid matching, candidate rules, and evaluator telemetry.</p>
        </div>
        <button className="redealButton" type="button" onClick={redeal}>New Deal</button>
      </header>

      <BidPanel deal={state.deal} onTelemetry={appendTelemetry} />
      <TelemetryPanel lines={state.telemetryLines} />
    </main>
  );
}
