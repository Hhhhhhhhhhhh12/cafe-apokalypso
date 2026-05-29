import {
  canCompleteCurrentDay,
  getMissingRequiredActions
} from "../../game/engine/selectors";
import type { GameState } from "../../game/types/game";

interface ActionPanelProps {
  gameState: GameState;
  statusMessage: string;
  onTakeOrder: () => void;
  onPrepareDrink: () => void;
  onCheckSupplies: () => void;
  onCleanTables: () => void;
  onCompleteDay: () => void;
  onResetGame: () => void;
}

export function ActionPanel({
  gameState,
  statusMessage,
  onTakeOrder,
  onPrepareDrink,
  onCheckSupplies,
  onCleanTables,
  onCompleteDay,
  onResetGame
}: ActionPanelProps) {
  const canCloseDay = canCompleteCurrentDay(gameState);
  const missingActions = getMissingRequiredActions(gameState);

  return (
    <section className="panel action-panel" aria-labelledby="actions-title">
      <div className="panel-heading">
        <p className="eyebrow">Controls</p>
        <h2 id="actions-title">Action panel</h2>
      </div>

      <div className="button-row">
        <button type="button" onClick={onTakeOrder}>
          Take order
        </button>
        <button type="button" onClick={onPrepareDrink}>
          Prepare drink
        </button>
        <button type="button" onClick={onCleanTables}>
          Clean tables
        </button>
        <button type="button" onClick={onCheckSupplies}>
          Check supplies
        </button>
        <button
          type="button"
          onClick={onCompleteDay}
          disabled={!canCloseDay}
          aria-describedby="close-day-requirements"
        >
          {gameState.day === 7 ? "Finish Day 7" : "Close day"}
        </button>
        <button type="button" className="secondary-button" onClick={onResetGame}>
          Reset / New Game
        </button>
      </div>

      <p id="close-day-requirements" className="action-hint">
        {gameState.demoComplete
          ? "Demo complete. Reset to replay the seven-day loop."
          : canCloseDay
            ? "Core café tasks complete. The day can be closed."
            : `Before closing: ${formatMissingActions(missingActions)}.`}
      </p>

      <p className="status-message" role="status" aria-live="polite">
        {statusMessage}
      </p>
    </section>
  );
}

function formatMissingActions(actions: readonly string[]): string {
  const labels: Record<string, string> = {
    take_order: "take an order",
    prepare_drink: "prepare a drink",
    clean_tables: "clean tables"
  };

  return actions.map((action) => labels[action] ?? action).join(", ");
}
