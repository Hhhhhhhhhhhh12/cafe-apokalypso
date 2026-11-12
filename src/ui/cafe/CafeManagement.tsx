import { formatAsche } from "../../game/engine/currency";
import {
  getEquipmentShopOptions,
  getIngredientLabel,
  getRestockPreview,
  getVisibleStaffOptions
} from "../../game/engine/selectors";
import { getHelperDailyCost, getHelperTaskHint, getHelperTaskLabel, SUPPLY_UNIT_COSTS } from "../../game/engine/management";
import type { StaffOptionId } from "../../game/types/content";
import type { EquipmentSlotId, GameState, HelperTaskId, IngredientKey } from "../../game/types/game";

const helperTasks: Record<StaffOptionId, HelperTaskId[]> = {
  jana: ["cleaning", "service"],
  nino: ["barista", "counter"],
  nele: ["marketing", "counter"]
};

const restockIngredients: IngredientKey[] = ["coffee", "milk", "pastries"];

export function OpeningEquipment({
  gameState,
  onBuyEquipment,
  onGoToDoor
}: {
  gameState: GameState;
  onBuyEquipment: (slot: EquipmentSlotId) => void;
  onGoToDoor: () => void;
}) {
  const options = getEquipmentShopOptions(gameState);

  return (
    <>
      <p className="opening-till">In the till <strong>{formatAsche(gameState.resources.money)}</strong></p>
      <div className="opening-equipment">
        {options.map(({ id, label, currentTierName, unowned, next }) => (
          <div className="opening-equipment__item" key={id}>
            <div className="opening-equipment__label">
              <strong>{label}</strong>
              <small>{unowned ? (id === "machine" || id === "grinder") ? "Required to open" : "Optional" : currentTierName}</small>
            </div>
            {next && (unowned || next.affordable) ? (
              <button
                type="button"
                className="secondary-button"
                disabled={!next.affordable}
                onClick={() => onBuyEquipment(id)}
              >
                {next.name} · {formatAsche(next.cost)}
                {next.reputationBonus > 0 ? ` · +${next.reputationBonus} reputation` : null}
              </button>
            ) : null}
          </div>
        ))}
      </div>
      {gameState.equipment.machine >= 1 && gameState.equipment.grinder >= 1 ? (
        <button type="button" onClick={onGoToDoor}>Go to the door <span aria-hidden="true">→</span></button>
      ) : null}
    </>
  );
}

export function EquipmentShop({
  gameState,
  onBuyEquipment,
  heading
}: {
  gameState: GameState;
  onBuyEquipment: (slot: EquipmentSlotId) => void;
  heading: string;
}) {
  const options = getEquipmentShopOptions(gameState);

  return (
    <div className="decor-shop equipment-shop" aria-label="Buy café equipment">
      <h3>{heading}</h3>
      {options.map((option) => (
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
              onClick={() => onBuyEquipment(option.id)}
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
  );
}

export function HelperStartPanel({
  gameState,
  onSelectHelper,
  onClearHelper,
  onOpenDay
}: {
  gameState: GameState;
  onSelectHelper: (helperId: StaffOptionId, taskId: HelperTaskId) => void;
  onClearHelper: () => void;
  onOpenDay: () => void;
}) {
  const staffOptions = getVisibleStaffOptions(gameState);
  const soloPenaltyActive = gameState.day >= 4;
  const hasHelper = Boolean(gameState.helperAssignment);

  return (
    <div className="helper-picker" aria-label="Day-start helper assignment">
      <p className="helper-picker__intro">
        {gameState.day === 3
          ? "Pay for help this shift, or keep the money for supplies."
          : "Pick one task for a helper, or open alone."}
      </p>
      <p className="opening-till">In the till <strong>{formatAsche(gameState.resources.money)}</strong></p>
      {gameState.day === 3 ? (
        <p className="action-hint">
          In stock: coffee {gameState.supplies.coffee} · milk {gameState.supplies.milk} · pastries {gameState.supplies.pastries}
        </p>
      ) : null}
      {soloPenaltyActive ? (
        <p className="helper-picker__warn">
          The dilemma: a helper costs money up front, but opening alone from Day 4 wears
          on you — expect about <strong>+10 stress</strong> by closing.
        </p>
      ) : null}
      {staffOptions.map((staffOption) => {
        const cost = getHelperDailyCost(staffOption.id, staffOption.dailyCost, gameState.day);
        const canAfford = gameState.resources.money >= cost;
        const trial = gameState.day === 3 && staffOption.id === "jana";
        return <fieldset key={staffOption.id}>
          <legend>
            Hire {staffOption.name} · {formatAsche(cost)}
            {trial ? " trial shift" : ""}
            {!canAfford ? " · Can't afford" : ""}
          </legend>
          <div className="radio-row">
            {helperTasks[staffOption.id].map((taskId) => (
              <label key={taskId}>
                <input
                  type="radio"
                  name="helper-assignment"
                  disabled={!canAfford}
                  checked={
                    gameState.helperAssignment?.helperId === staffOption.id &&
                    gameState.helperAssignment.taskId === taskId
                  }
                  onChange={() => onSelectHelper(staffOption.id, taskId)}
                />
                <span className="helper-task">
                  <span className="helper-task__label">{getHelperTaskLabel(taskId)}</span>
                  <small className="helper-task__hint">{trial
                    ? taskId === "cleaning"
                      ? "Ask Jana to clear one dirty table. No action spent."
                      : "Serves one extra guest if supplies allow."
                    : getHelperTaskHint(taskId)}</small>
                </span>
              </label>
            ))}
          </div>
        </fieldset>;
      })}
      {hasHelper ? <button type="button" className="secondary-button" onClick={onClearHelper}>Work alone instead</button> : null}
      <button type="button" onClick={onOpenDay}>
        {hasHelper
          ? "Open with selected help"
          : soloPenaltyActive
            ? "Open without help (a harder solo day)"
            : gameState.day === 3 ? "Open alone · 0 Asche" : "Open without help"}
      </button>
    </div>
  );
}

export function RestockControls({
  gameState,
  onSetSupplyPurchase,
  onConfirmSupplyPurchase,
  onSkipRestocking
}: {
  gameState: GameState;
  onSetSupplyPurchase: (ingredient: IngredientKey, quantity: number) => void;
  onConfirmSupplyPurchase: () => void;
  onSkipRestocking: () => void;
}) {
  const preview = getRestockPreview(gameState);
  const nothingToBuy = restockIngredients.every(
    (i) => gameState.pendingSupplyPurchase[i] === 0
  );

  return (
    <div className="restock-panel" aria-label="Buy supplies for tomorrow">
      {restockIngredients.map((ingredient) => {
        const qty = gameState.pendingSupplyPurchase[ingredient];
        const stock = gameState.supplies[ingredient];
        const cap = preview.maxPurchase[ingredient];
        return (
          <div className="restock-row" key={ingredient}>
            <span className="restock-row__label">
              {getIngredientLabel(ingredient)}
              <span className="restock-row__stock">{stock} in stock · {formatAsche(SUPPLY_UNIT_COSTS[ingredient])} each</span>
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
          : `Restock · ${formatAsche(preview.totalCost)} → ${formatAsche(preview.balanceAfter)} left`}
      </button>
      {!preview.canAfford ? (
        <p className="action-hint">Reduce the quantities to stay within {formatAsche(gameState.resources.money)}.</p>
      ) : null}
      {!nothingToBuy ? (
        <button type="button" className="secondary-button" onClick={onSkipRestocking}>
          Open tomorrow without restocking
        </button>
      ) : null}
    </div>
  );
}
