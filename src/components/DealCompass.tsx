import type { Deal } from '../models/cards';
import { HandView } from './HandView';

/// DealCompass puts the four bridge hands into their natural table orientation.
export interface DealCompassProps {
  deal: Deal;
}

export function DealCompass({ deal }: DealCompassProps) {
  return (
    <section className="dealCompass" aria-label="Current deal">
      <div className="northSeat">
        <HandView seat="N" hand={deal.N} />
      </div>
      <div className="westSeat">
        <HandView seat="W" hand={deal.W} />
      </div>
      <div className="eastSeat">
        <HandView seat="E" hand={deal.E} />
      </div>
      <div className="southSeat">
        <HandView seat="S" hand={deal.S} />
      </div>
    </section>
  );
}
