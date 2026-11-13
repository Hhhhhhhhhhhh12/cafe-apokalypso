import { formatAsche } from "../../game/engine/currency";
import {
  getDayCoachHint,
  getDecorUpgradeOptions,
  hasActionCapacity
} from "../../game/engine/selectors";
import { weekOneEvents } from "../../game/data/events";
import type { EventDefinition, UpgradeId } from "../../game/types/content";
import type {
  DecorSlotId,
  EquipmentSlotId,
  GameState
} from "../../game/types/game";
import { weekOneUpgrades } from "../../game/data/upgrades";
import { EquipmentShop } from "../cafe/CafeManagement";

interface ActionPanelProps {
  gameState: GameState;
  statusMessage: string;
  onConsultKassandra: () => void;
  onUpgradeDecor: (slot: DecorSlotId) => void;
  onBuyEquipment: (slot: EquipmentSlotId) => void;
  onBuyUpgrade: (upgradeId: UpgradeId) => void;
  onResetGame: () => void;
}

function resolveFloorLogEvents(gameState: GameState): EventDefinition[] {
  const pending = gameState.pendingEvents;
  if (!pending || pending.length === 0) return [];
  return weekOneEvents.filter((e) => pending.includes(e.id)) as EventDefinition[];
}

function FloorLog({ events }: { events: EventDefinition[] }) {
  if (events.length === 0) return null;
  return (
    <div className="floor-log" aria-label="Floor log">
      {events.map((event) => (
        <div
          key={event.id}
          className={`floor-log-card${event.tone === "anomaly" ? " floor-log-card--anomaly" : ""}`}
        >
          {event.kicker ? (
            <span className="floor-log-card__kicker">{event.kicker}</span>
          ) : null}
          <span className="floor-log-card__text">{event.text}</span>
          {event.flavorLines && event.flavorLines.length > 0 ? (
            <span className="floor-log-card__flavor">{event.flavorLines[0]}</span>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function ActionPanel({
  gameState,
  statusMessage,
  onConsultKassandra,
  onUpgradeDecor,
  onBuyEquipment,
  onBuyUpgrade,
  onResetGame
}: ActionPanelProps) {
  return (
    <section className="panel action-panel" aria-labelledby="actions-title">
      <div className="panel-heading">
        <p className="eyebrow">Shift</p>
        <h2 id="actions-title">Actions</h2>
      </div>

      {gameState.dayPhase === "open" && !gameState.cafeClosed ? (
        <OpenDayControls
          gameState={gameState}
          onConsultKassandra={onConsultKassandra}
        />
      ) : null}

      {gameState.dayPhase === "day_end" ? (
        <UpgradePanel
          gameState={gameState}
          onUpgradeDecor={onUpgradeDecor}
          onBuyEquipment={onBuyEquipment}
          onBuyUpgrade={onBuyUpgrade}
        />
      ) : null}

      {(gameState.dayPhase === "open" || gameState.dayPhase === "day_end") ? (
        <FloorLog events={resolveFloorLogEvents(gameState)} />
      ) : null}

      <button
        type="button"
        className="secondary-button"
        onClick={onResetGame}
      >
        Reset / New Game
      </button>

      {/* Persistent live region: the <p> stays mounted so screen readers
          announce every status change (serve lines, KASSANDRA, supply warnings).
          The inner span remounts via key to replay the slide-in animation for
          sighted users without disturbing the live region. See GitHub #70. */}
      <p className="status-message" role="status" aria-live="polite" aria-atomic="true">
        <span key={statusMessage} className="status-message__text">
          {statusMessage}
        </span>
      </p>
    </section>
  );
}

function OpenDayControls({
  gameState,
  onConsultKassandra,
}: {
  gameState: GameState;
  onConsultKassandra: () => void;
}) {
  const canAct = hasActionCapacity(gameState);
  const actionLockReason = canAct
    ? undefined
    : "No actions left today.";
  const coach = getDayCoachHint(gameState);
  return (
    <>
      <div className="action-budget" aria-label="Daily action capacity">
        <span>Actions left</span>
        <strong>
          {gameState.dayManagement.actionPointsRemaining} /{" "}
          {gameState.dayManagement.actionPointsRemaining +
            gameState.dayManagement.actionPointsSpent}
        </strong>
        <small>
          Each action uses one daily slot.
        </small>
      </div>

      {gameState.dayManagement.serveStreak >= 2 ? (
        <div
          className={`flow-meter${gameState.dayManagement.serveStreak >= 5 ? " flow-meter--hot" : ""}`}
          aria-label={`Flow streak: ${gameState.dayManagement.serveStreak} matched orders in a row`}
        >
          <span className="flow-meter__icon" aria-hidden="true">≈</span>
          <span className="flow-meter__label">Flow</span>
          <span className="flow-meter__count">×{gameState.dayManagement.serveStreak}</span>
        </div>
      ) : null}

      {gameState.helperAssignment && gameState.day !== 5 ? (
        <div className="helper-slot" aria-label="Current helper assignment">
          {gameState.helperAssignment.flavorLine}
        </div>
      ) : null}

      {coach ? (
        // Coaching hint, not a beat — kept visible but out of the live region so
        // it doesn't compete with the status line for announcements. See #70.
        <p key={coach.text} className="cafe-coach">
          <span className="cafe-coach__icon" aria-hidden="true">☞</span>
          {coach.text}
        </p>
      ) : null}

      {gameState.unlocks.kassandra ? (
        <button
          type="button"
          className="secondary-button"
          onClick={onConsultKassandra}
          disabled={!canAct || gameState.dayManagement.kassandraConsulted}
          title={
            gameState.dayManagement.kassandraConsulted
              ? "KASSANDRA has already been consulted today."
              : actionLockReason
          }
        >
          Consult KASSANDRA
        </button>
      ) : null}

      {!canAct ? (
        <p className="action-capacity-warn" role="status">
          No actions left for this shift.
        </p>
      ) : null}
    </>
  );
}

function UpgradePanel({
  gameState,
  onUpgradeDecor,
  onBuyEquipment,
  onBuyUpgrade
}: {
  gameState: GameState;
  onUpgradeDecor: (slot: DecorSlotId) => void;
  onBuyEquipment: (slot: EquipmentSlotId) => void;
  onBuyUpgrade: (upgradeId: UpgradeId) => void;
}) {
  const decorOptions = getDecorUpgradeOptions(gameState);
  if (gameState.demoComplete || gameState.cafeClosed) return null;

  return (
    <div className="restock-panel" aria-label="Café upgrades">
      <div className="decor-shop" aria-label="Upgrade café décor">
        <h3>Décor</h3>
        {decorOptions.map((option) => (
          <div className="decor-row" key={option.id}>
            <span className="decor-row__label">
              <strong>{option.label}</strong>
              <em>{option.currentTierName}</em>
            </span>
            {option.next ? (
              <button
                type="button"
                className="secondary-button"
                disabled={!option.next.affordable}
                onClick={() => onUpgradeDecor(option.id)}
                title={option.next.reputationBonus > 0 ? `Rep +${option.next.reputationBonus}` : undefined}
              >
                {option.next.name} · {formatAsche(option.next.cost)}
                {option.next.reputationBonus > 0 ? ` · ★${option.next.reputationBonus}` : ""}
              </button>
            ) : (
              <span className="decor-row__maxed">Best available</span>
            )}
          </div>
        ))}
      </div>

      <EquipmentShop
        gameState={gameState}
        onBuyEquipment={onBuyEquipment}
        heading="Equipment upgrades"
      />

      <UpgradeShop gameState={gameState} onBuyUpgrade={onBuyUpgrade} />
    </div>
  );
}

function UpgradeShop({
  gameState,
  onBuyUpgrade
}: {
  gameState: GameState;
  onBuyUpgrade: (upgradeId: UpgradeId) => void;
}) {
  const available = weekOneUpgrades.filter(
    (upgrade) =>
      upgrade.cost > 0 &&
      upgrade.unlockDay <= gameState.day + 1 &&
      !gameState.purchasedUpgrades.includes(upgrade.id)
  );

  if (available.length === 0) {
    return null;
  }

  return (
    <div className="decor-shop upgrade-shop" aria-label="Buy café upgrades">
      <h3>Upgrades</h3>
      <p className="action-hint">Invest before tomorrow's opening.</p>
      {available.map((upgrade) => {
        const affordable = upgrade.cost <= gameState.resources.money;
        return (
          <div className="decor-row" key={upgrade.id}>
            <span className="decor-row__label">
              <strong>{upgrade.name}</strong>
              <em>{upgrade.summary}</em>
            </span>
            <button
              type="button"
              className="secondary-button"
              disabled={!affordable}
              onClick={() => onBuyUpgrade(upgrade.id)}
              title={!affordable ? `${formatAsche(upgrade.cost)} needed` : upgrade.summary}
            >
              Buy: {upgrade.name} · {formatAsche(upgrade.cost)}
            </button>
          </div>
        );
      })}
    </div>
  );
}
