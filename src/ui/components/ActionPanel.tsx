import {
  canCompleteCurrentDay,
  getAvailableProducts,
  getDayCoachHint,
  getDecorUpgradeOptions,
  getEquipmentShopOptions,
  getGuestPatienceState,
  getIngredientLabel,
  getMissingRequiredActions,
  getNextGuestPreview,
  getRestockPreview,
  getVisibleStaffOptions,
  hasActionCapacity,
  type DayCoachTarget
} from "../../game/engine/selectors";
import {
  getHelperTaskHint,
  getHelperTaskLabel,
  SUPPLY_CAPS,
  SUPPLY_UNIT_COSTS
} from "../../game/engine/management";
import type { ProductId, StaffOptionId } from "../../game/types/content";
import type {
  DecorSlotId,
  EquipmentSlotId,
  GameState,
  HelperTaskId,
  IngredientKey
} from "../../game/types/game";

interface ActionPanelProps {
  gameState: GameState;
  statusMessage: string;
  onServeProduct: (productId: ProductId) => void;
  onTakeOrder: () => void;
  onPrepareDrink: () => void;
  onCheckSupplies: () => void;
  onCleanTables: () => void;
  onAdjustOffer: () => void;
  onRunAdvertising: () => void;
  onRunSocialAd: () => void;
  onConsultKassandra: () => void;
  onSelectHelper: (helperId: StaffOptionId, taskId: HelperTaskId) => void;
  onOpenDay: () => void;
  onCompleteDay: () => void;
  onSetSupplyPurchase: (ingredient: IngredientKey, quantity: number) => void;
  onConfirmSupplyPurchase: () => void;
  onUpgradeDecor: (slot: DecorSlotId) => void;
  onBuyEquipment: (slot: EquipmentSlotId) => void;
  onFinishSetup: () => void;
  onResetGame: () => void;
}

const helperTasks: Record<StaffOptionId, HelperTaskId[]> = {
  jana: ["cleaning", "service"],
  nino: ["barista", "counter"],
  nele: ["marketing", "counter"]
};

const restockIngredients: IngredientKey[] = ["coffee", "milk", "pastries"];

export function ActionPanel({
  gameState,
  statusMessage,
  onServeProduct,
  onTakeOrder,
  onPrepareDrink,
  onCheckSupplies,
  onCleanTables,
  onAdjustOffer,
  onRunAdvertising,
  onRunSocialAd,
  onConsultKassandra,
  onSelectHelper,
  onOpenDay,
  onCompleteDay,
  onSetSupplyPurchase,
  onConfirmSupplyPurchase,
  onUpgradeDecor,
  onBuyEquipment,
  onFinishSetup,
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

      {gameState.dayPhase === "setup" ? (
        <SetupPanel
          gameState={gameState}
          onBuyEquipment={onBuyEquipment}
          onFinishSetup={onFinishSetup}
        />
      ) : null}

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
          onServeProduct={onServeProduct}
          onTakeOrder={onTakeOrder}
          onPrepareDrink={onPrepareDrink}
          onCheckSupplies={onCheckSupplies}
          onCleanTables={onCleanTables}
          onAdjustOffer={onAdjustOffer}
          onRunAdvertising={onRunAdvertising}
          onRunSocialAd={onRunSocialAd}
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
          onUpgradeDecor={onUpgradeDecor}
          onBuyEquipment={onBuyEquipment}
        />
      ) : null}

      <button
        type="button"
        className="secondary-button"
        onClick={() => {
          if (window.confirm("Start over from Day 1? This week's progress won't be saved.")) {
            onResetGame();
          }
        }}
      >
        Reset / New Game
      </button>

      <p id="close-day-requirements" className="action-hint">
        {gameState.demoComplete
          ? "Demo complete. Reset to replay the seven-day loop."
          : gameState.dayPhase === "day_start" || gameState.dayPhase === "setup"
            ? null
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

      <p key={statusMessage} className="status-message" role="status" aria-live="polite">
        {statusMessage}
      </p>
    </section>
  );
}

function OpenDayControls({
  gameState,
  onServeProduct,
  onTakeOrder,
  onPrepareDrink,
  onCheckSupplies,
  onCleanTables,
  onAdjustOffer,
  onRunAdvertising,
  onRunSocialAd,
  onConsultKassandra,
  onCompleteDay,
  canCloseDay
}: {
  gameState: GameState;
  onServeProduct: (productId: ProductId) => void;
  onTakeOrder: () => void;
  onPrepareDrink: () => void;
  onCheckSupplies: () => void;
  onCleanTables: () => void;
  onAdjustOffer: () => void;
  onRunAdvertising: () => void;
  onRunSocialAd: () => void;
  onConsultKassandra: () => void;
  onCompleteDay: () => void;
  canCloseDay: boolean;
}) {
  const nextGuest = getNextGuestPreview(gameState);
  const patienceState = getGuestPatienceState(gameState);
  const canAct = hasActionCapacity(gameState);
  const products = getAvailableProducts(gameState);
  const advertisingCanUseBonus = gameState.dayManagement.extraAdvertisingActions > 0;
  const canUseAdvertisingAction = canAct || advertisingCanUseBonus;
  const actionLockReason = canAct
    ? undefined
    : "No actions left today.";
  const coach = getDayCoachHint(gameState);
  const coachClass = (target: DayCoachTarget, base?: string) =>
    coach?.target === target
      ? [base, "cafe-coach-pulse"].filter(Boolean).join(" ")
      : base;

  return (
    <>
      {products.length > 0 && (
        <div className="serve-menu" aria-label="Serve a product">
          <p className="serve-menu__label">Serve</p>
          <div className="serve-menu__items">
            {products.map((product) => (
              <button
                key={product.id}
                type="button"
                className="serve-menu__item"
                onClick={() => onServeProduct(product.id)}
                disabled={!canAct}
                title={!canAct ? "No actions left this shift." : undefined}
              >
                <span className="serve-menu__name">{product.name}</span>
                <span className="serve-menu__price">€{product.basePrice}</span>
              </button>
            ))}
          </div>
        </div>
      )}

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

      {gameState.helperAssignment ? (
        <div className="helper-slot" aria-label="Current helper assignment">
          {gameState.helperAssignment.flavorLine}
        </div>
      ) : null}

      {coach ? (
        <p key={coach.text} className="cafe-coach" role="status">
          <span className="cafe-coach__icon" aria-hidden="true">☞</span>
          {coach.text}
        </p>
      ) : null}

      <div className="button-row">
        <button
          type="button"
          className={coachClass("serve")}
          onClick={onTakeOrder}
          disabled={!canAct}
          title={actionLockReason}
        >
          Take next order
        </button>
        <button
          type="button"
          onClick={onPrepareDrink}
          disabled={!canAct}
          title={actionLockReason}
        >
          Brew for next guest
        </button>
        <button
          type="button"
          className={coachClass("clean")}
          onClick={onCleanTables}
          disabled={!canAct}
          title={actionLockReason}
        >
          Clean tables
        </button>
        <button type="button" onClick={onCheckSupplies} disabled={!canAct} title={actionLockReason}>
          Check supplies
        </button>
        {gameState.unlocks.pricing ? (
          <button
            type="button"
            className={coachClass("offer", "secondary-button")}
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
                ? "A flyer has already gone out today."
                : canUseAdvertisingAction
                  ? "€2 · +1 reputation"
                  : actionLockReason
            }
          >
            Run flyer (€2)
          </button>
        ) : null}
        {gameState.unlocks.advertising && gameState.day >= 5 ? (
          <button
            type="button"
            className="secondary-button"
            onClick={onRunSocialAd}
            disabled={!canAct || gameState.dayManagement.socialAdRun}
            title={
              gameState.dayManagement.socialAdRun
                ? "A social post has already gone out today."
                : canAct
                  ? "€5 · +3 reputation"
                  : actionLockReason
            }
          >
            Social post (€5)
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
          <span>
            Next in line: <strong>{nextGuest.name}</strong>
          </span>
          {patienceState ? (
            <span
              className={`next-guest__patience${patienceState.critical ? " next-guest__patience--critical" : ""}`}
              aria-label={`Guest patience: ${patienceState.label}`}
            >
              <span className="next-guest__patience-label">{patienceState.label}</span>
              <span className="next-guest__patience-bar" aria-hidden="true">
                {Array.from({ length: patienceState.max / 25 }, (_, i) => (
                  <span
                    key={i}
                    className={`next-guest__patience-pip${
                      i * 25 < patienceState.patience ? " next-guest__patience-pip--filled" : ""
                    }`}
                  />
                ))}
              </span>
            </span>
          ) : null}
          {nextGuest.orderLine ? (
            <span className="next-guest__order">Says: "{nextGuest.orderLine}"</span>
          ) : null}
          {nextGuest.learningCue ? (
            <span className="next-guest__cue">You notice: {nextGuest.learningCue}</span>
          ) : null}
          {nextGuest.wants ? (
            <span className="next-guest__fit">Likely order: {nextGuest.wants}.</span>
          ) : null}
        </p>
      ) : null}

      {!canAct ? (
        <p className="action-capacity-warn" role="status">
          No actions left for this shift.
        </p>
      ) : null}
    </>
  );
}

function EquipmentShop({
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
              {option.next.name} · €{option.next.cost}
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

function SetupPanel({
  gameState,
  onBuyEquipment,
  onFinishSetup
}: {
  gameState: GameState;
  onBuyEquipment: (slot: EquipmentSlotId) => void;
  onFinishSetup: () => void;
}) {
  const hasMachine = gameState.equipment.machine >= 1;
  const hasSeating = gameState.equipment.seating >= 1;

  return (
    <div className="setup-panel" aria-label="Set up the café before opening">
      <p className="setup-panel__intro">
        Before you open, kit out the café. The till is small — expect the cheapest
        used machine and second-hand furniture. A coffee machine is required; you
        can open without seating, but guests will order at the counter and stand.
      </p>

      <EquipmentShop
        gameState={gameState}
        onBuyEquipment={onBuyEquipment}
        heading="Equipment"
      />

      <p className="action-hint">Till: €{gameState.resources.money}</p>

      <button type="button" onClick={onFinishSetup} disabled={!hasMachine}>
        {hasMachine
          ? hasSeating
            ? "Open the café"
            : "Open with standing room only"
          : "Buy a coffee machine to open"}
      </button>
    </div>
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
            {gameState.resources.money < staffOption.dailyCost ? " · Can't afford" : ""}
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
  onConfirmSupplyPurchase,
  onUpgradeDecor,
  onBuyEquipment
}: {
  gameState: GameState;
  onSetSupplyPurchase: (ingredient: IngredientKey, quantity: number) => void;
  onConfirmSupplyPurchase: () => void;
  onUpgradeDecor: (slot: DecorSlotId) => void;
  onBuyEquipment: (slot: EquipmentSlotId) => void;
}) {
  const preview = getRestockPreview(gameState);
  const decorOptions = getDecorUpgradeOptions(gameState);

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
                {option.next.name} · €{option.next.cost}
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
