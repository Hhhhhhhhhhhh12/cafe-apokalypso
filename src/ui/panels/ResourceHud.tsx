import { useEffect, useRef, useState } from "react";
import { getManagementHudLabels } from "../../game/engine/selectors";
import type { GameState } from "../../game/types/game";

interface ResourceHudProps {
  gameState: GameState;
}

const LOW_SUPPLY_THRESHOLD = 3;

export function ResourceHud({ gameState }: ResourceHudProps) {
  const labels = getManagementHudLabels(gameState);

  return (
    <section className="panel resource-panel" aria-labelledby="resources-title">
      <div className="panel-heading">
        <h2 id="resources-title">Café HUD</h2>
      </div>

      <dl className="resource-list">
        <ResourceItem label="Cash" value={`€${gameState.resources.money}`} numericValue={gameState.resources.money} />
        <ResourceItem
          label="Coffee"
          value={gameState.supplies.coffee}
          numericValue={gameState.supplies.coffee}
          low={gameState.supplies.coffee <= LOW_SUPPLY_THRESHOLD}
        />
        <ResourceItem
          label="Milk"
          value={gameState.supplies.milk}
          numericValue={gameState.supplies.milk}
          low={gameState.supplies.milk <= LOW_SUPPLY_THRESHOLD}
        />
        <ResourceItem
          label="Pastries"
          value={gameState.supplies.pastries}
          numericValue={gameState.supplies.pastries}
          low={gameState.supplies.pastries <= LOW_SUPPLY_THRESHOLD}
        />
        <ResourceItem
          label="Cleanliness"
          value={labels.cleanliness}
          numericValue={gameState.resources.cleanliness}
          meter={gameState.resources.cleanliness}
          meterTone="positive"
        />
        <ResourceItem
          label="Stress"
          value={labels.stress}
          numericValue={gameState.resources.stress}
          meter={gameState.resources.stress}
          meterTone="negative"
        />
        <ResourceItem
          label="Reputation"
          value={gameState.resources.reputation}
          numericValue={gameState.resources.reputation}
          meter={gameState.resources.reputation}
          meterTone="positive"
        />
        <ResourceItem label="Actions" value={labels.actionCapacity} />
      </dl>
    </section>
  );
}

interface ResourceItemProps {
  label: string;
  value: string | number;
  /** Raw number used to detect increase/decrease for the change-flash. */
  numericValue?: number;
  /** When true, the item is flagged as a low/empty supply. */
  low?: boolean;
  /** 0-100 meter value; renders a small bar when provided. */
  meter?: number;
  meterTone?: "positive" | "negative";
}

function ResourceItem({ label, value, numericValue, low, meter, meterTone }: ResourceItemProps) {
  const flash = useChangeFlash(numericValue);

  return (
    <div className={`resource-item${low ? " resource-item--low" : ""}`}>
      <dt>{label}</dt>
      <dd>
        {/* key forces a remount on change so the flash animation replays */}
        <span key={`${value}-${flash.tick}`} className={`resource-value ${flash.className}`}>
          {value}
        </span>
        {low ? <span className="resource-low-tag" role="status"> · low</span> : null}
        {typeof meter === "number" ? (
          <span
            className={`resource-meter resource-meter--${meterTone ?? "positive"}`}
            aria-hidden="true"
          >
            <span
              className="resource-meter__fill"
              style={{ width: `${Math.max(0, Math.min(100, meter))}%` }}
            />
          </span>
        ) : null}
      </dd>
    </div>
  );
}

/**
 * Detects whether a numeric value went up or down since the last render and
 * returns a one-shot flash className plus a tick that changes on each update
 * (used as a React key to replay the CSS animation). Deterministic, no timers.
 */
function useChangeFlash(value: number | undefined): { className: string; tick: number } {
  const previous = useRef<number | undefined>(value);
  const [tick, setTick] = useState(0);
  const [className, setClassName] = useState("");

  useEffect(() => {
    if (value === undefined || previous.current === undefined) {
      previous.current = value;
      return;
    }
    if (value > previous.current) {
      setClassName("resource-value--up");
      setTick((t) => t + 1);
    } else if (value < previous.current) {
      setClassName("resource-value--down");
      setTick((t) => t + 1);
    }
    previous.current = value;
  }, [value]);

  return { className, tick };
}
