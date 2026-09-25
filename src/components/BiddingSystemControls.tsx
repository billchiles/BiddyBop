import { useEffect, useRef } from 'react';
import type { BiddingSystem } from '../models/bidding-types';


export interface BiddingSystemControlsProps {
  biddingSystem: BiddingSystem;
  onChange: (biddingSystem: BiddingSystem) => void;
}

/// BiddingSystemControls edits the partnership agreements used throughout the current practice
/// session.  These are ordinary app settings; rule-test deals only filter against them.
export function BiddingSystemControls({ biddingSystem, onChange }: BiddingSystemControlsProps) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  // Give the disclosure normal popover-style light-dismiss behavior.
  useEffect(() => {
    function closeIfOutside(event: PointerEvent): void {
      const details = detailsRef.current;
      if (details === null || !details.open) {
        return;
      }
      if (event.target instanceof Node && details.contains(event.target)) {
        return;
      }
      details.open = false;
    }
    function closeOnEscape(event: KeyboardEvent): void {
      if (event.key === 'Escape' && detailsRef.current !== null) {
        detailsRef.current.open = false;
      }
    }
    document.addEventListener('pointerdown', closeIfOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeIfOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, []);
  return (
    <details ref={detailsRef} className="biddingSystemDetails">
      <summary className="biddingSystemSummary">Bidding System</summary>
      <div className="biddingSystemPanel">
        <label className="biddingSystemField">
          <span>1NT opening</span>
          <select className="biddingSystemSelect" value={biddingSystem.oneNtOpening}
            onChange={(event) => onChange({
              ...biddingSystem,
              oneNtOpening: event.target.value as BiddingSystem['oneNtOpening'],
            })}>
            <option value="15-17">15-17</option>
            <option value="16-18">16-18</option>
          </select>
        </label>
        <label className="biddingSystemField">
          <span>5-card major 1NT upgrade</span>
          <input type="checkbox" checked={biddingSystem.oneNtFiveCardLengthUpgrade}
            onChange={(event) => onChange({
              ...biddingSystem,
              oneNtFiveCardLengthUpgrade: event.target.checked,
            })} />
        </label>
        <label className="biddingSystemField">
          <span>Jump shifts</span>
          <select className="biddingSystemSelect" value={biddingSystem.jumpShift}
            onChange={(event) => onChange({
              ...biddingSystem,
              jumpShift: event.target.value as BiddingSystem['jumpShift'],
            })}>
            <option value="strong">Strong</option>
            <option value="weak">Weak</option>
          </select>
        </label>
        <label className="biddingSystemField">
          <span>2-level new-suit response</span>
          <select className="biddingSystemSelect" value={biddingSystem.twoLevelNewSuitResponse}
            onChange={(event) => onChange({
              ...biddingSystem,
              twoLevelNewSuitResponse: event.target.value as BiddingSystem['twoLevelNewSuitResponse'],
            })}>
            <option value="standard">Standard</option>
            <option value="twoOverOne">2/1 game forcing</option>
          </select>
        </label>
        <label className="biddingSystemField">
          <span>1NT response to major</span>
          <select className="biddingSystemSelect" value={biddingSystem.majorOneNtResponse}
            onChange={(event) => onChange({
              ...biddingSystem,
              majorOneNtResponse: event.target.value as BiddingSystem['majorOneNtResponse'],
            })}>
            <option value="nonForcing">Non-forcing</option>
            <option value="forcing">Forcing</option>
          </select>
        </label>
        <label className="biddingSystemField">
          <span>Major game force w/support</span>
          <select className="biddingSystemSelect" value={biddingSystem.majorGameForceWithSupport}
            onChange={(event) => onChange({
              ...biddingSystem,
              majorGameForceWithSupport: event.target.value as BiddingSystem['majorGameForceWithSupport'],
            })}>
            <option value="newSuitThenRaise">New suit then raise</option>
            <option value="jacoby2NT">Jacoby 2NT</option>
          </select>
        </label>
        <label className="biddingSystemField">
          <span>Stayman</span>
          <input type="checkbox" checked={biddingSystem.stayman}
            onChange={(event) => onChange({ ...biddingSystem, stayman: event.target.checked })} />
        </label>
        <label className="biddingSystemField">
          <span>Jacoby transfers</span>
          <input type="checkbox" checked={biddingSystem.jacobyTransfers}
            onChange={(event) => onChange({ ...biddingSystem, jacobyTransfers: event.target.checked })} />
        </label>
        <label className="biddingSystemField">
          <span>Splinters</span>
          <input type="checkbox" checked={biddingSystem.splinters}
            onChange={(event) => onChange({ ...biddingSystem, splinters: event.target.checked })} />
        </label>
        <label className="biddingSystemField">
          <span>Texas transfers</span>
          <input type="checkbox" checked={biddingSystem.texasTransfers}
            onChange={(event) => onChange({ ...biddingSystem, texasTransfers: event.target.checked })} />
        </label>
      </div>
    </details>
  );
}
