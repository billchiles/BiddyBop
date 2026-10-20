import type { ReactNode } from 'react';
import type { Deal, Seat } from '../models/cards';
import { HandView } from './HandView';

/// DealCompass puts the four bridge hands into their natural table orientation.
export interface DealCompassProps {
  deal: Deal;
  activeSeat: Seat | null;
  showAllHands: boolean;
  children?: ReactNode;
}

export function DealCompass({ deal, activeSeat, showAllHands, children }: DealCompassProps) {
  return (
    <section className="dealCompass" aria-label="Current deal">
      <div className={activeSeat === 'N' ? 'northSeat activeSeat' : 'northSeat'}>
        <HandView seat="N" hand={deal.N} concealed={! showAllHands && activeSeat !== null && activeSeat !== 'N'} />
      </div>
      <div className={activeSeat === 'W' ? 'westSeat activeSeat' : 'westSeat'}>
        <HandView seat="W" hand={deal.W} concealed={! showAllHands && activeSeat !== null && activeSeat !== 'W'} />
      </div>
      <div className={activeSeat === 'E' ? 'eastSeat activeSeat' : 'eastSeat'}>
        <HandView seat="E" hand={deal.E} concealed={! showAllHands && activeSeat !== null && activeSeat !== 'E'} />
      </div>
      <div className="compassControls">{children}</div>
      <div className={activeSeat === 'S' ? 'southSeat activeSeat' : 'southSeat'}>
        <HandView seat="S" hand={deal.S} concealed={! showAllHands && activeSeat !== null && activeSeat !== 'S'} />
      </div>
    </section>
  );
}
