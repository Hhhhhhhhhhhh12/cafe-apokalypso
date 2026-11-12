import { formatAsche } from "../../game/engine/currency";
import {
  getAvailableProducts,
  getExpectedProductIncome,
  getGuestPatienceState,
  getIngredientLabel,
  getNextGuestPreview,
  hasActionCapacity
} from "../../game/engine/selectors";
import { getMissingIngredients, PATIENCE_TICK } from "../../game/engine/management";
import type { ProductId } from "../../game/types/content";
import type { GameState } from "../../game/types/game";

export function GuestService({
  gameState,
  onServeProduct
}: {
  gameState: GameState;
  onServeProduct: (productId: ProductId) => void;
}) {
  const nextGuest = getNextGuestPreview(gameState);
  const patienceState = getGuestPatienceState(gameState);
  const canAct = hasActionCapacity(gameState);
  const products = getAvailableProducts(gameState);

  return (
    <>
      {nextGuest ? (
        <div className="next-guest" aria-label="Next guest in line">
          {nextGuest.orderLine ? (
            <q className="next-guest__order">{nextGuest.orderLine}</q>
          ) : null}
          {patienceState ? (
            <span
              className={`next-guest__patience next-guest__patience--${patienceState.label.toLowerCase()}${patienceState.critical ? " next-guest__patience--critical" : ""}`}
              aria-label={`Guest patience: ${patienceState.label}`}
            >
              <span className="next-guest__patience-label">{patienceState.label}</span>
              <span className="next-guest__patience-bar" aria-hidden="true">
                {Array.from({ length: patienceState.max / PATIENCE_TICK }, (_, i) => (
                  <span
                    key={i}
                    className={`next-guest__patience-pip${
                      i * PATIENCE_TICK < patienceState.patience ? " next-guest__patience-pip--filled" : ""
                    }`}
                  />
                ))}
              </span>
              {patienceState.messyPenalty ? (
                <span className="next-guest__patience-messy" aria-label="Messy tables reduced patience">
                  messy tables
                </span>
              ) : null}
            </span>
          ) : null}
          {patienceState?.critical && canAct ? (
            <span className="next-guest__cue">
              One more action that uses patience and this guest leaves unserved.
            </span>
          ) : null}
          {nextGuest.learningCue ? (
            <span className="next-guest__cue">{nextGuest.learningCue}</span>
          ) : null}
        </div>
      ) : null}

      {!canAct ? <p className="action-hint">No actions left this shift.</p> : null}

      {products.length > 0 && (
        <div className="serve-menu" aria-label="Serve a product">
          <h4 className="serve-menu__label">Serve <span>· 1 action</span></h4>
          <div className="serve-menu__items">
            {products.map((product) => {
              const income = getExpectedProductIncome(gameState, product).toFixed(2);
              const priceDetail = `Menu price ${formatAsche(product.basePrice)}. Estimate per guest includes reputation and today's offer; excludes tips, helper orders and substitutions.`;
              const missing = getMissingIngredients(product, gameState.supplies, gameState.helperAssignment);
              const missingLabel = missing.length > 0
                ? `Short on ${missing.map(getIngredientLabel).join(", ")}`
                : null;
              return (
                <button
                  key={product.id}
                  type="button"
                  className={`serve-menu__item${product.name === nextGuest?.wants ? " serve-menu__item--suggested" : ""}`}
                  onClick={() => onServeProduct(product.id)}
                  disabled={!canAct}
                  title={!canAct ? "No actions left this shift." : priceDetail}
                  aria-label={`${product.name}: estimated income ${formatAsche(Number(income))} per guest`}
                  aria-description={[missingLabel, priceDetail].filter(Boolean).join(". ")}
                >
                  <span>
                    <span className="serve-menu__name">{product.name}</span>
                    {missingLabel ? <small className="serve-menu__shortage">{missingLabel}</small> : null}
                  </span>
                  <span className="serve-menu__price">Est. {formatAsche(Number(income))}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
