import { formatAsche } from "../../game/engine/currency";
import { FLYER_COST, SOCIAL_AD_COST, SUPPLY_CAPS } from "../../game/engine/management";
import {
  getCurrentDayModifier,
  getGuestPatienceState,
  getIngredientLabel,
  hasActionCapacity
} from "../../game/engine/selectors";
import type { GameAction, GameState, IngredientKey } from "../../game/types/game";

const ingredients: IngredientKey[] = ["coffee", "milk", "pastries"];

interface ShiftStationProps {
  gameState: GameState;
  onAction: (action: GameAction) => void;
}

export function SupplyShelf({ gameState, onAction }: ShiftStationProps) {
  const canCheck = hasActionCapacity(gameState);
  const auditBonus = getCurrentDayModifier(gameState).id === "inventory-audit" &&
    !gameState.completedActions.includes("check_supplies") &&
    ingredients.every((ingredient) => gameState.supplies[ingredient] > 0);

  return (
    <>
      <dl className="shelf-inventory">
        {ingredients.map((ingredient) => {
          const quantity = gameState.supplies[ingredient];
          const capacity = SUPPLY_CAPS[ingredient];
          return (
            <div className="shelf-inventory__row" key={ingredient}>
              <dt>{getIngredientLabel(ingredient)}</dt>
              <dd>
                {quantity > 0 ? `${quantity} / ${capacity}` : "Out of stock"}
                <meter aria-hidden="true" min={0} max={capacity} value={quantity} />
              </dd>
            </div>
          );
        })}
      </dl>
      {!canCheck ? <p className="action-hint">No actions left this shift.</p> : null}
      {canCheck && auditBonus ? (
        <p className="action-hint">Inventory audit · +1 reputation for checking a stocked shelf.</p>
      ) : null}
      {canCheck ? <PatienceWarning gameState={gameState} /> : null}
      <button type="button" disabled={!canCheck} onClick={() => onAction({ type: "check_supplies" })}>
        Check supplies · 1 action
      </button>
    </>
  );
}

export function Noticeboard({ gameState, onAction }: ShiftStationProps) {
  const canAct = hasActionCapacity(gameState);
  const { offerReviewed } = gameState.dayManagement;
  const canReview = gameState.unlocks.pricing && gameState.day >= 3;
  const canAdvertise = gameState.unlocks.advertising && gameState.day >= 4;

  return (
    <>
      {canAct ? <PatienceWarning gameState={gameState} /> : null}
      {canReview ? (
        <div className="noticeboard-item">
          <h4>Daily offer</h4>
          <p>10% higher order prices for this shift · +1 reputation</p>
          <button
            type="button"
            disabled={!canAct || offerReviewed}
            onClick={() => onAction({ type: "adjust_offer" })}
          >
            {offerReviewed ? "Offer already posted" : "Review offer · 1 action"}
          </button>
          {!canAct && !offerReviewed ? <small>No actions left this shift.</small> : null}
        </div>
      ) : null}
      {canAdvertise ? <Campaign gameState={gameState} onAction={onAction} type="flyer" /> : null}
      {canAdvertise && gameState.day >= 5 ? (
        <Campaign gameState={gameState} onAction={onAction} type="social" />
      ) : null}
    </>
  );
}

function Campaign({
  gameState,
  onAction,
  type
}: ShiftStationProps & { type: "flyer" | "social" }) {
  const flyer = type === "flyer";
  const { advertisingRun, socialAdRun, extraAdvertisingActions } = gameState.dayManagement;
  const sent = flyer ? advertisingRun : socialAdRun;
  const cost = flyer ? FLYER_COST : SOCIAL_AD_COST;
  const usesBonus = flyer && extraAdvertisingActions > 0;
  const posterEcho = flyer && !sent && getCurrentDayModifier(gameState).id === "poster-echo";
  const canAfford = gameState.resources.money >= cost;
  const canAct = usesBonus || hasActionCapacity(gameState);
  const unavailable = sent ? "Already sent this shift."
    : !canAfford ? `${formatAsche(gameState.resources.money)} in the till.`
    : !canAct ? "No actions left this shift." : null;
  const label = flyer ? "Post flyer" : "Publish social post";

  return (
    <div className="noticeboard-item">
      <h4>{flyer ? "Neighbourhood flyer" : "Social post"}</h4>
      <p>
        +{flyer ? posterEcho ? 2 : 1 : 3} reputation
        {posterEcho ? " · +2 stress" : null}
      </p>
      <button
        type="button"
        className="secondary-button"
        disabled={Boolean(unavailable)}
        onClick={() => onAction({ type: "run_advertising", adType: type })}
      >
        {label} · {formatAsche(cost)} · {usesBonus ? "bonus slot" : "1 action"}
      </button>
      {unavailable ? <small>{unavailable}</small> : null}
    </div>
  );
}

function PatienceWarning({ gameState }: { gameState: GameState }) {
  return getGuestPatienceState(gameState)?.critical ? (
    <p className="cafe-interaction__feedback">An action that uses patience will make the waiting guest leave.</p>
  ) : null;
}
