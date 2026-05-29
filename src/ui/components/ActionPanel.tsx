import {
  canCompleteCurrentDay,
  getAvailableProducts,
  getIngredientLabel,
  getMissingRequiredActions,
  getRestockPreview,
  getVisibleStaffOptions
} from "../../game/engine/selectors";
import {
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
        <p className="eyebrow">Controls</p>
        <h2 id="actions-title">Action panel</h2>
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

function OpenDayControls({
  gameState,
  onTakeOrder,
  onServeProduct,
  onPrepareDrink,
  onCheckSupplies,
  onCleanTables,
  onCompleteDay,
  canCloseDay
}: {
  gameState: GameState;
  onTakeOrder: () => void;
  onServeProduct: (productId: ProductId) => void;
  onPrepareDrink: () => void;
  onCheckSupplies: () => void;
  onCleanTables: () => void;
  onCompleteDay: () => void;
  canCloseDay: boolean;
}) {
  const products = getAvailableProducts(gameState);

  return (
    <>
      {gameState.helperAssignment ? (
        <div className="helper-slot" aria-label="Current helper assignment">
          {gameState.helperAssignment.flavorLine}
        </div>
      ) : null}

      <div className="button-row">
        <button type="button" onClick={onTakeOrder}>
          Take next order
        </button>
        <button type="button" onClick={onPrepareDrink}>
          Prepare suggested product
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
      </div>

      <div className="product-grid" aria-label="Serve a specific product">
        {products.map((product) => (
          <button
            type="button"
            className="secondary-button"
            key={product.id}
            onClick={() => onServeProduct(product.id)}
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

  return (
    <div className="helper-picker" aria-label="Day-start helper assignment">
      {staffOptions.map((staffOption) => (
        <fieldset key={staffOption.id}>
          <legend>
            Hire {staffOption.name} · €{staffOption.dailyCost}
            {gameState.resources.money < staffOption.dailyCost ? " · Nicht genug" : ""}
          </legend>
          <div className="radio-row">
            {helperTasks[staffOption.id].map((taskId) => (
              <label key={taskId}>
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
                {getHelperTaskLabel(taskId)}
              </label>
            ))}
          </div>
        </fieldset>
      ))}
      <button type="button" onClick={onOpenDay}>
        {gameState.helperAssignment ? "Open with selected help" : "Open without help"}
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
