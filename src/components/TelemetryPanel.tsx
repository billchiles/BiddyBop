/// TelemetryPanel is deliberately copy/paste friendly while the evaluator is still exploratory.
export interface TelemetryPanelProps {
  lines: string[];
}

export function TelemetryPanel({ lines }: TelemetryPanelProps) {
  const text = lines.join('\n');

  return (
    <section className="telemetryPanel" aria-label="Telemetry">
      <h2>Telemetry</h2>
      <textarea className="telemetryText" value={text} readOnly />
    </section>
  );
}
