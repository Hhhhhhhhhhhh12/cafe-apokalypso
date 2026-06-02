import {
  canCompleteCurrentDay,
  getAvailableProducts,
  getIngredientLabel,
  getMissingRequiredActions,
  getNextGuestPreview,
  getRestockPreview,
  getVisibleStaffOptions,
  hasActionCapacity
} from "../../game/engine/selectors";
import {
  getHelperTaskHint,
  getHelperTaskLabel,
  SUPPLY_CAPS,
  SUPPLY_UNIT_COSTS
} from "../../game/engine/management";
import type { ProductId, StaffOptionId } from "../../game/types/content";
import type { GameState, HelperTaskId, IngredientKey } from "../../game/types/game";

interface ActionPanelProps {
  gameState: GameState;
  statusMessage: string;
  onTakeOrder: () => void;
  onServeProduct: (productId: ProductId) => void;
  onPrepareDrink: () => void;
  onCheckSupplies: () => void;
  onCleanTables: () => void;
  onAdjustOffer: () => void;
  onRunAdvertising: () => void;
  onConsultKassandra: () => void;
  onSelectHelper: (helperId: StaffOptionId, taskId: HelperTaskId) => void;
  onOpenDay: () => void;
  onCompleteDay: () => void;
  onSetSupplyPurchase: (ingredient: IngredientKey, quantity: number) => void;
  onConfirmSupplyPurchase: () => void;
  onResetGame: () => void;
}

const helperTasks: Record<StaffOptionId, HelperTaskId[]> = {
  jana: ["cleaning", "service"],
  nino: ["barista", "counter"],
  mira: ["marketing", "counter"]
};

const restockIngredients: IngredientKey[] = ["coffee", "milk", "pastries"];

export function ActionPanel({
  gameState,
  statusMessage,
  onTakeOrder,
  onServeProduct,
  onPrepareDrink,
  onCheckSupplies,
  onCleanTables,
  onAdjustOffer,
  onRunAdvertising,
  onConsultKassandra,
  onSelectHelper,
  onOpenDay,
  onCompleteDay,
  onSetSupplyPurchase,
  onConfirmSupplyPurchase,
  onResetGame
}: ActionPanelProps) {
  const canCloseDay = canCompleteCurrentDay(gameState);
  const missingActions = getMissingRequiredActions(gameState);

  return (
    <section className="panel action-panel" aria-labelledby="actions-title">
      <div className="panel-heading">
        <p className="eyebrow">Shift</p>
        <h2 id="actions-title">Actions</h2>
      </div>

      {gameState.dayPhase === "day_start" ? (
        <HelperStartPanel
          gameState={gameState}
          onSelectHelper={onSelectHelper}
          onOpenDay={onOpenDay}
        />
      ) : null}

      {gameState.dayPhase === "open" ? (
        <OpenDayControls
          gameState={gameState}
          onTakeOrder={onTakeOrder}
          onServeProduct={onServeProduct}
          onPrepareDrink={onPrepareDrink}
          onCheckSupplies={onCheckSupplies}
          onCleanTables={onCleanTables}
          onAdjustOffer={onAdjustOffer}
          onRunAdvertising={onRunAdvertising}
          onConsultKassandra={onConsultKassandra}
          onCompleteDay={onCompleteDay}
          canCloseDay={canCloseDay}
        />
      ) : null}

      {gameState.dayPhase === "day_end" ? (
        <RestockPanel
          gameState={gameState}
          onSetSupplyPurchase={onSetSupplyPurchase}
          onConfirmSupplyPurchase={onConfirmSupplyPurchase}
        />
      ) : null}

      <button type="button" className="secondary-button" onClick={onResetGame}>
        Reset / New Game
      </button>

      <p id="close-day-requirements" className="action-hint">
        {gameState.demoComplete
          ? "Demo complete. Reset to replay the seven-day loop."
          : gameState.dayPhase === "day_start"
            ? "Choose one helper task or open without help. The choice locks when the day opens."
            : !canCloseDay
              ? `Before closing: ${formatMissingActions(missingActions)}.`
              : gameState.dayManagement.customersServed === 0
                ? "No customers served today — closing will cost reputation."
                : !gameState.completedActions.includes("clean_tables") &&
                  !(gameState.helperAssignment?.helperId === "jana" &&
                    gameState.helperAssignment.taskId === "cleaning")
                  ? "Tables not cleaned — closing now will cost cleanliness and reputation."
                  : "Core café tasks complete. The day can be closed."}
      </p>

      <p className="status-message" role="status" aria-live="polite">
        {statusMessage}
      </p>
    </section>
  );
}

function OpenDayControls({
  gameState,
  onTakeOrder,
  onServeProduct,
  onPrepareDrink,
  onCheckSupplies,
  onCleanTables,
  onAdjustOffer,
  onRunAdvertising,
  onConsultKassandra,
  onCompleteDay,
  canCloseDay
}: {
  gameState: GameState;
  onTakeOrder: () => void;
  onServeProduct: (productId: ProductId) => void;
  onPrepareDrink: () => void;
  onCheckSupplies: () => void;
  onCleanTables: () => void;
  onAdjustOffer: () => void;
  onRunAdvertising: () => void;
  onConsultKassandra: () => void;
  onCompleteDay: () => void;
  canCloseDay: boolean;
}) {
  const products = getAvailableProducts(gameState);
  const nextGuest = getNextGuestPreview(gameState);
  const canAct = hasActionCapacity(gameState);
  const advertisingCanUseBonus = gameState.dayManagement.extraAdvertisingActions > 0;
  const canUseAdvertisingAction = canAct || advertisingCanUseBonus;
  const actionLockReason = canAct
    ? undefined
    : "No daily action capacity remains for this shift.";

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
          Serving, cleaning, supply checks, offers, ads, and KASSANDRA checks all
          compete for the shift.
        </small>
      </div>

      {gameState.helperAssignment ? (
        <div className="helper-slot" aria-label="Current helper assignment">
          {gameState.helperAssignment.flavorLine}
        </div>
      ) : null}

      <div className="button-row">
        <button type="button" onClick={onTakeOrder} disabled={!canAct} title={actionLockReason}>
          Take next order
        </button>
        <button
          type="button"
          onClick={onPrepareDrink}
          disabled={!canAct}
          title={actionLockReason}
        >
          Prepare suggested product
        </button>
        <button type="button" onClick={onCleanTables} disabled={!canAct} title={actionLockReason}>
          Clean tables
        </button>
        <button type="button" onClick={onCheckSupplies} disabled={!canAct} title={actionLockReason}>
          Check supplies
        </button>
        {gameState.unlocks.pricing ? (
          <button
            type="button"
            className="secondary-button"
            onClick={onAdjustOffer}
            disabled={!canAct || gameState.dayManagement.offerReviewed}
            title={
              gameState.dayManagement.offerReviewed
                ? "The offer board has already been reviewed today."
                : actionLockReason
            }
          >
            Review offer board
          </button>
        ) : null}
        {gameState.unlocks.advertising ? (
          <button
            type="button"
            className="secondary-button"
            onClick={onRunAdvertising}
            disabled={!canUseAdvertisingAction || gameState.dayManagement.advertisingRun}
            title={
              gameState.dayManagement.advertisingRun
                ? "One small ad has already run today."
                : canUseAdvertisingAction
                  ? undefined
                  : actionLockReason
            }
          >
            Run local ad
          </button>
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
        <button
          type="button"
          onClick={onCompleteDay}
          disabled={!canCloseDay}
          aria-describedby="close-day-requirements"
        >
          {gameState.day === 7 ? "Finish Day 7" : "Close day"}
        </button>
      </div>

      {nextGuest ? (
        <p className="next-guest" role="status">
          Next in line: <strong>{nextGuest.name}</strong>
          {nextGuest.wants ? <span> · seems to be hoping for a proper {nextGuest.wants}.</span> : null}
        </p>
      ) : null}

      <div className="product-grid" aria-label="Serve a specific product">
        {products.map((product) => (
          <button
            type="button"
            className="secondary-button"
            key={product.id}
            onClick={() => onServeProduct(product.id)}
            disabled={!canAct}
            title={actionLockReason}
          >
            {product.name} · €{product.basePrice}
          </button>
        ))}
      </div>
    </>
  );
}

function HelperStartPanel({
  gameState,
  onSelectHelper,
  onOpenDay
}: {
  gameState: GameState;
  onSelectHelper: (helperId: StaffOptionId, taskId: HelperTaskId) => void;
  onOpenDay: () => void;
}) {
  const staffOptions = getVisibleStaffOptions(gameState);
  const soloPenaltyActive = gameState.day >= 4;
  const hasHelper = Boolean(gameState.helperAssignment);

  return (
    <div className="helper-picker" aria-label="Day-start helper assignment">
      <p className="helper-picker__intro">
        From Day 3 you can hire one helper for the day, or open alone. Pick a single
        task below — the choice locks when the day opens.
      </p>
      {soloPenaltyActive ? (
        <p className="helper-picker__warn">
          The dilemma: a helper costs money up front, but opening alone from Day 4 wears
          on you — expect about <strong>+10 stress</strong> by closing.
        </p>
      ) : null}
      {staffOptions.map((staffOption) => (
        <fieldset key={staffOption.id}>
          <legend>
            Hire {staffOption.name} · €{staffOption.dailyCost}
            {gameState.resources.money < staffOption.dailyCost ? " · Nicht genug" : ""}
          </legend>
          <div className="radio-row">
            {helperTasks[staffOption.id].map((taskId) => (
              <label key={taskId} title={getHelperTaskHint(taskId)}>
                <input
                  type="radio"
                  name="helper-assignment"
                  disabled={gameState.resources.money < staffOption.dailyCost}
                  checked={
                    gameState.helperAssignment?.helperId === staffOption.id &&
                    gameState.helperAssignment.taskId === taskId
                  }
                  onChange={() => onSelectHelper(staffOption.id, taskId)}
                />
                <span className="helper-task">
                  <span className="helper-task__label">{getHelperTaskLabel(taskId)}</span>
                  <small className="helper-task__hint">{getHelperTaskHint(taskId)}</small>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      ))}
      <button type="button" onClick={onOpenDay}>
        {hasHelper
          ? "Open with selected help"
          : soloPenaltyActive
            ? "Open without help (a harder solo day)"
            : "Open without help"}
      </button>
    </div>
  );
}

function RestockPanel({
  gameState,
  onSetSupplyPurchase,
  onConfirmSupplyPurchase
}: {
  gameState: GameState;
  onSetSupplyPurchase: (ingredient: IngredientKey, quantity: number) => void;
  onConfirmSupplyPurchase: () => void;
}) {
  const preview = getRestockPreview(gameState);

  if (gameState.demoComplete) {
    return (
      <div className="restock-panel" aria-label="Demo complete">
        <p>The Day-7 letter has arrived. Restock is locked for the demo ending.</p>
      </div>
    );
  }

  return (
    <div className="restock-panel" aria-label="Buy supplies for tomorrow">
      <h3>Buy for tomorrow</h3>
      {restockIngredients.map((ingredient) => (
        <div className="restock-row" key={ingredient}>
          <span>
            {getIngredientLabel(ingredient)}: {gameState.supplies[ingredient]} /{" "}
            {SUPPLY_CAPS[ingredient]} @ €{SUPPLY_UNIT_COSTS[ingredient]}
          </span>
          <div className="stepper">
            <button
              type="button"
              aria-label={`Buy one fewer ${getIngredientLabel(ingredient)}`}
              onClick={() =>
                onSetSupplyPurchase(
                  ingredient,
                  gameState.pendingSupplyPurchase[ingredient] - 1
                )
              }
            >
              -
            </button>
            <output aria-label={`${getIngredientLabel(ingredient)} units to buy`}>
              {gameState.pendingSupplyPurchase[ingredient]}
            </output>
            <button
              type="button"
              aria-label={`Buy one more ${getIngredientLabel(ingredient)}`}
              disabled={
                gameState.pendingSupplyPurchase[ingredient] >=
                preview.maxPurchase[ingredient]
              }
              onClick={() =>
                onSetSupplyPurchase(
                  ingredient,
                  gameState.pendingSupplyPurchase[ingredient] + 1
                )
              }
            >
              +
            </button>
          </div>
        </div>
      ))}
      <p className="action-hint">
        Total cost: €{preview.totalCost}. Balance after: €{preview.balanceAfter}.
      </p>
      <button
        type="button"
        disabled={!preview.canAfford}
        onClick={onConfirmSupplyPurchase}
      >
        Confirm purchases
      </button>
    </div>
  );
}

function formatMissingActions(actions: readonly string[]): string {
  const labels: Record<string, string> = {
    take_order: "serve an order",
    prepare_drink: "prepare a drink",
    clean_tables: "clean tables"
  };

  return actions.map((action) => labels[action] ?? action).join(", ");
}
