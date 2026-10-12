import type { ReactNode } from "react";

import {
  getIngredientLabel,
  getRestockPreview
} from "../../game/engine/selectors";
import type { GameState, IngredientKey } from "../../game/types/game";

const restockIngredients: IngredientKey[] = ["coffee", "milk", "pastries"];

export interface SupplyPurchaseControlsProps {
  gameState: GameState;
  onSetSupplyPurchase: (ingredient: IngredientKey, quantity: number) => void;
  onConfirmSupplyPurchase: () => void;
  children?: ReactNode;
}

export function SupplyPurchaseControls({
  gameState,
  onSetSupplyPurchase,
  onConfirmSupplyPurchase,
  children
}: SupplyPurchaseControlsProps) {
  const preview = getRestockPreview(gameState);

  if (gameState.demoComplete) {
    return (
      <div className="restock-panel" aria-label="Demo complete">
        <p>The Day-7 letter has arrived. Restock is locked for the demo ending.</p>
      </div>
    );
  }

  const nothingToBuy = restockIngredients.every(
    (ingredient) => gameState.pendingSupplyPurchase[ingredient] === 0
  );

  return (
    <div className="restock-panel" aria-label="Buy supplies for tomorrow">
      <h3>Restock</h3>
      {restockIngredients.map((ingredient) => {
        const qty = gameState.pendingSupplyPurchase[ingredient];
        const stock = gameState.supplies[ingredient];
        const cap = preview.maxPurchase[ingredient];
        return (
          <div className="restock-row" key={ingredient}>
            <span className="restock-row__label">
              {getIngredientLabel(ingredient)}
              <span className="restock-row__stock">{stock} in stock</span>
            </span>
            <div className="stepper">
              <button
                type="button"
                aria-label={`Buy one fewer ${getIngredientLabel(ingredient)}`}
                disabled={qty <= 0}
                onClick={() => onSetSupplyPurchase(ingredient, qty - 1)}
              >
                −
              </button>
              <output aria-label={`${getIngredientLabel(ingredient)} units to buy`}>
                {qty > 0 ? `+${qty}` : "—"}
              </output>
              <button
                type="button"
                aria-label={`Buy one more ${getIngredientLabel(ingredient)}`}
                disabled={qty >= cap}
                onClick={() => onSetSupplyPurchase(ingredient, qty + 1)}
              >
                +
              </button>
            </div>
          </div>
        );
      })}
      <button
        type="button"
        className="restock-confirm"
        disabled={!nothingToBuy && !preview.canAfford}
        onClick={onConfirmSupplyPurchase}
      >
        {nothingToBuy
          ? "Open tomorrow without restocking"
          : `Restock · €${preview.totalCost} → €${preview.balanceAfter} left`}
      </button>

      {children}
    </div>
  );
}
