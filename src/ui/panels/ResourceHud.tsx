import { useEffect, useRef, useState } from "react";
import { getManagementHudLabels } from "../../game/engine/selectors";
import { ACTION_BUDGET_BY_DAY } from "../../game/engine/management";
import type { GameState } from "../../game/types/game";

interface ResourceHudProps {
  gameState: GameState;
}

const LOW_SUPPLY_THRESHOLD = 3;

export function ResourceHud({ gameState }: ResourceHudProps) {
  const labels = getManagementHudLabels(gameState);
  const { cleanliness, stress, reputation } = gameState.resources;
  const actionsRemaining = gameState.dayManagement.actionPointsRemaining;
  const actionsTotal = ACTION_BUDGET_BY_DAY[gameState.day] ?? actionsRemaining;

  return (
    <section className="panel resource-panel" aria-label="Café resources">
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
          numericValue={cleanliness}
          meter={cleanliness}
          meterTone="positive"
          warn={cleanliness < 50}
          critical={cleanliness < 25}
        />
        <ResourceItem
          label="Stress"
          value={labels.stress}
          numericValue={stress}
          meter={stress}
          meterTone="negative"
          warn={stress >= 61}
          critical={stress >= 81}
        />
        <ResourceItem
          label="Reputation"
          value={labels.reputation}
          numericValue={reputation}
          meter={reputation}
          meterTone="positive"
          warn={reputation < 35}
          critical={reputation < 10}
        />
        <ResourceItem
          label="Actions"
          value={actionsRemaining}
          numericValue={actionsRemaining}
          sub={`/ ${actionsTotal}`}
          warn={actionsRemaining <= 2 && actionsRemaining > 0}
          critical={actionsRemaining === 0}
        />
      </dl>
    </section>
  );
}

interface ResourceItemProps {
  label: string;
  value: string | number;
  /** Raw number used to detect increase/decrease for the change-flash. */
  numericValue?: number;
  /** Small subscript shown after the value (e.g. "/ 12" for actions). */
  sub?: string;
  /** When true, the item is flagged as a low/empty supply. */
  low?: boolean;
  /** Amber warning state — moderate threshold crossed. */
  warn?: boolean;
  /** Red critical state — severe threshold crossed. */
  critical?: boolean;
  /** 0-100 meter value; renders a small bar when provided. */
  meter?: number;
  meterTone?: "positive" | "negative";
}

function ResourceItem({ label, value, numericValue, sub, low, warn, critical, meter, meterTone }: ResourceItemProps) {
  const flash = useChangeFlash(numericValue);
  const stateClass = critical ? " resource-item--critical" : warn ? " resource-item--warn" : low ? " resource-item--low" : "";

  return (
    <div className={`resource-item${stateClass}`}>
      <dt>{label}</dt>
      <dd>
        {/* key forces a remount on change so the flash animation replays */}
        <span key={`${value}-${flash.tick}`} className={`resource-value ${flash.className}`}>
          {value}
        </span>
        {sub ? <span className="resource-sub">{sub}</span> : null}
        {low && !warn && !critical ? <span className="resource-low-tag" role="status"> · low</span> : null}
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
