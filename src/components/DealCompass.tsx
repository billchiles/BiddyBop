import type { Deal, Seat } from '../models/cards';
import { HandView } from './HandView';

/// DealCompass puts the four bridge hands into their natural table orientation.
export interface DealCompassProps {
  deal: Deal;
  activeSeat: Seat | null;
}

export function DealCompass({ deal, activeSeat }: DealCompassProps) {
  return (
    <section className="dealCompass" aria-label="Current deal">
      <div className={activeSeat === 'N' ? 'northSeat activeSeat' : 'northSeat'}>
        <HandView seat="N" hand={deal.N} />
      </div>
      <div className={activeSeat === 'W' ? 'westSeat activeSeat' : 'westSeat'}>
        <HandView seat="W" hand={deal.W} />
      </div>
      <div className={activeSeat === 'E' ? 'eastSeat activeSeat' : 'eastSeat'}>
        <HandView seat="E" hand={deal.E} />
      </div>
      <div className={activeSeat === 'S' ? 'southSeat activeSeat' : 'southSeat'}>
        <HandView seat="S" hand={deal.S} />
      </div>
    </section>
  );
}
