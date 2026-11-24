import { RecoveryHearts } from "./RecoveryHearts";
import { formatAsche } from "../../game/engine/currency";
import {
  getAvailableProducts,
  canImproveRecoveryByCleaning,
  canImproveRecoveryByTidying,
  canServeFromStock,
  getDoubleEspressoOption,
  getExpectedProductIncome,
  getGuestPatienceState,
  getIngredientLabel,
  getNextGuestPreview,
  hasActionCapacity,
  hasSecondBrewGroup
} from "../../game/engine/selectors";
import { CLEAN_TABLE_RECOVERY_TIP, findSubstituteProduct, getMissingIngredients, PATIENCE_TICK } from "../../game/engine/management";
import { getRushComplaintPenalty, isRushGuest } from "../../game/engine/rush";
import type { ProductId } from "../../game/types/content";
import type { GameState } from "../../game/types/game";

export function GuestService({
  gameState,
  onServeProduct,
  onServeDoubleEspresso,
  onGoToDoor
}: {
  gameState: GameState;
  onServeProduct: (productId: ProductId) => void;
  onServeDoubleEspresso?: () => void;
  onGoToDoor?: () => void;
}) {
  const nextGuest = getNextGuestPreview(gameState);
  const patienceState = getGuestPatienceState(gameState);
  const canAct = hasActionCapacity(gameState);
  const products = getAvailableProducts(gameState);
  const doubleEspresso = onServeDoubleEspresso && hasSecondBrewGroup(gameState)
    ? getDoubleEspressoOption(gameState)
    : null;
  const helper = gameState.day === 5 && gameState.helperAssignment?.locked
    ? gameState.helperAssignment
    : null;
  const extraOrder = Boolean(helper && gameState.dayManagement.helperExtraOrdersRemaining > 0);
  const baristaBonus = helper?.taskId === "barista" && gameState.dayManagement.baristaReputationBonus < 3;

  if (canAct && !canServeFromStock(gameState)) {
    return (
      <>
        <p className="action-hint">Nothing on the menu can be made with the stock left.</p>
        {onGoToDoor && <button type="button" onClick={onGoToDoor}>Go to closing</button>}
      </>
    );
  }

  return (
    <>
      {nextGuest ? (
        <div className="next-guest" aria-label="Next guest in line">
          {nextGuest.orderLine ? (
            <q className="next-guest__order">{nextGuest.orderLine}</q>
          ) : null}
          {nextGuest.recovery && (
            <div className="guest-recovery">
              <RecoveryHearts {...nextGuest.recovery} />
              {nextGuest.recovery.restored === 2 && <small>Clean table bonus · {formatAsche(CLEAN_TABLE_RECOVERY_TIP)} tip</small>}
              {(canImproveRecoveryByTidying(gameState) || gameState.dayManagement.dirtyTableIds.some(id => canImproveRecoveryByCleaning(gameState, id))) &&
                <small>Clean café and clear table · +1 extra</small>}
            </div>
          )}
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
              {isRushGuest(gameState) &&
                ` The wait already risks ${getRushComplaintPenalty(gameState)} reputation if you serve now.`}
            </span>
          ) : null}
        </div>
      ) : null}

      {!canAct ? <p className="action-hint">No actions left this shift.</p> : null}

      {products.length > 0 && (
        <div className="serve-menu" aria-label="Serve a product">
          <h4 className="serve-menu__label">Serve <span>· 1 action</span></h4>
          <div className="serve-menu__items">
            {products.map((product) => {
              const missing = getMissingIngredients(product, gameState.supplies, gameState.helperAssignment);
              const servedProduct = missing.length > 0
                ? findSubstituteProduct(product, gameState.supplies, gameState.helperAssignment)
                : product;
              const income = servedProduct ? getExpectedProductIncome(gameState, servedProduct,
                Math.max(0, gameState.resources.reputation - (missing.length > 0 ? 1 : 0))) : 0;
              const outcome = missing.length > 0
                ? `${servedProduct ? `→ ${servedProduct.name}` : "No sale"} · −1 reputation`
                : null;
              const priceDetail = servedProduct
                ? `Menu price ${formatAsche(servedProduct.basePrice)}. Estimate per guest includes reputation and today's offer; excludes tips and helper orders.`
                : "Uses one action without serving a guest.";
              const missingLabel = missing.length > 0
                ? `Short on ${missing.map(getIngredientLabel).join(", ")}`
                : null;
              const helperLabel = baristaBonus && (servedProduct?.id === "espresso" || servedProduct?.id === "cappuccino")
                ? "Nino · +1 reputation"
                : extraOrder ? "Extra guest if stock allows" : null;
              return (
                <button
                  key={product.id}
                  type="button"
                  className={`serve-menu__item${missing.length === 0 && product.name === nextGuest?.wants ? " serve-menu__item--suggested" : ""}`}
                  onClick={() => onServeProduct(product.id)}
                  disabled={!canAct}
                  title={!canAct ? "No actions left this shift." : priceDetail}
                  aria-label={`${product.name}: ${servedProduct ? `estimated income ${formatAsche(income)} per guest` : "no sale"}`}
                  aria-description={[missingLabel, outcome, servedProduct ? helperLabel : null, priceDetail].filter(Boolean).join(". ")}
                >
                  <span className="serve-menu__icon" data-product={servedProduct?.id ?? product.id} aria-hidden="true" />
                  <span className="serve-menu__copy">
                    <span className="serve-menu__name">{product.name}</span>
                    {missingLabel ? <small className="serve-menu__shortage">{missingLabel}</small> : null}
                    {outcome ? <small className="serve-menu__shortage">{outcome}</small> : null}
                    {!missingLabel && helperLabel ? <small>{helperLabel}</small> : null}
                  </span>
                  <span className="serve-menu__price">{servedProduct ? `Est. ${formatAsche(income)}` : "—"}</span>
                </button>
              );
            })}
            {doubleEspresso ? (
              <button
                type="button"
                className="serve-menu__item serve-menu__item--double"
                onClick={onServeDoubleEspresso}
                disabled={Boolean(doubleEspresso.unavailable)}
              >
                <span className="serve-menu__icon" data-product="double-espresso" aria-hidden="true" />
                <span className="serve-menu__copy">
                  <span className="serve-menu__name">Two espressos · {doubleEspresso.beans} beans</span>
                  <small>
                    {doubleEspresso.unavailable ??
                      `1 action · Next: ${doubleEspresso.followingGuest}${doubleEspresso.followingOrder ? ` wants ${doubleEspresso.followingOrder}` : ""}`}
                  </small>
                </span>
              </button>
            ) : null}
          </div>
        </div>
      )}
      {nextGuest?.learningCue && gameState.day !== 7 && (
        <details className="cafe-station-note">
          <summary>Guest hint</summary>
          <p>{nextGuest.learningCue}</p>
        </details>
      )}
    </>
  );
}
