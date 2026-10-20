/// HandView renders compact bridge hand text with styled suit glyph presentation only.

import { getCardsForSuit, getHandFacts, type Hand, type Seat,
         type Suit } from '../models/cards';


/// HandViewProps is the return type of the HandView rendering function.
export interface HandViewProps {
  seat: Seat;
  hand: Hand;
  concealed?: boolean;
}

interface SuitDisplay {
  suit: Suit;
  glyph: string;
  colorClassName: string;
}

const suitDisplays: SuitDisplay[] = [
  { suit: 'S', glyph: '♠', colorClassName: 'suitGlyphBlack' },
  { suit: 'H', glyph: '♥', colorClassName: 'suitGlyphRed' },
  { suit: 'D', glyph: '♦', colorClassName: 'suitGlyphRed' },
  { suit: 'C', glyph: '♣', colorClassName: 'suitGlyphBlack' },
];

const seatNames: Record<Seat, string> = {
  N: 'North',
  E: 'East',
  S: 'South',
  W: 'West',
};

export function HandView ({ seat, hand, concealed = false }: HandViewProps) {
  const facts = concealed ? null : getHandFacts(hand);
  return (
    <section className="handCard" aria-label={`${seatNames[seat]} hand${concealed ? ' concealed' : ''}`}>
      <h2 className="handTitle">
        {seatNames[seat]}{facts === null ? '' : ` (${facts.hcp} HCP)`}
      </h2>
      <div className="handRows" aria-hidden={concealed}>
        {suitDisplays.map((suitDisplay) => {
          const cards = concealed ? [] : getCardsForSuit(hand, suitDisplay.suit);
          const ranksText = cards.map((card) => card.rank).join(' ');
          const shownRanksText = ranksText === '' ? '—' : ranksText;
          return (
            <div className="suitRow" key={suitDisplay.suit}>
              <span className={`suitGlyph ${suitDisplay.colorClassName}`}>{suitDisplay.glyph}</span>
              <span className="suitColon">:</span>
              <span className="rankText">{shownRanksText}</span>
            </div>
          );
        })}
      </div>
      {concealed && <div className="handConcealment">Hand hidden</div>}
    </section>
  );
}
