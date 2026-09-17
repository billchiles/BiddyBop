import { useState } from 'react';
import './App.css';
import { BidPanel } from './components/BidPanel';
import { TelemetryPanel } from './components/TelemetryPanel';
import { generateOpenableNorthBoard, type Board } from './models/cards';

/// App is the first browser-only punch-through for deal generation and rule matching.
interface AppState {
  board: Board;
  telemetryLines: string[];
}

function createInitialState(): AppState {
  const result = generateOpenableNorthBoard();
  return {
    board: result.board,
    telemetryLines: ['Generated initial board.', ...result.telemetryLines],
  };
}

export default function App() {
  const [state, setState] = useState<AppState>(() => createInitialState());

  function redeal(): void {
    const result = generateOpenableNorthBoard();
    setState({
      board: result.board,
      telemetryLines: ['Generated new board.', ...result.telemetryLines],
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

      <BidPanel board={state.board} onTelemetry={appendTelemetry} />
      <TelemetryPanel lines={state.telemetryLines} />
    </main>
  );
}
