import {
  getAvailableProducts,
  getGuestPatienceState,
  getNextGuestPreview,
  hasActionCapacity
} from "../../game/engine/selectors";
import { PATIENCE_TICK } from "../../game/engine/management";
import type { ProductId } from "../../game/types/content";
import type { GameState } from "../../game/types/game";

export interface GuestOrderControlsProps {
  gameState: GameState;
  onServeProduct: (productId: ProductId) => void;
}

export function GuestOrderControls({
  gameState,
  onServeProduct
}: GuestOrderControlsProps) {
  const nextGuest = getNextGuestPreview(gameState);
  const patienceState = getGuestPatienceState(gameState);
  const canAct = hasActionCapacity(gameState);
  const products = getAvailableProducts(gameState);

  return (
    <>
      {nextGuest ? (
        // Not a live region: the next-guest preview updates on every serve, so
        // announcing it would pile up on the status line. It stays a labelled,
        // navigable block instead. See GitHub #70.
        <div className="next-guest" aria-label="Next guest in line">
          <div className="next-guest__header">
            <span className="next-guest__label">Next in line:</span>
            {/* Guest names are German proper nouns/titles (Pendler, Herr, Frau mit rotem
                Regenschirm…) in an otherwise-English UI; mark them so screen readers
                pronounce them in German. See GitHub #71. */}
            <strong lang="de">{nextGuest.name}</strong>
          </div>
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
          {nextGuest.orderLine ? (
            <span className="next-guest__order">"{nextGuest.orderLine}"</span>
          ) : null}
          {nextGuest.learningCue ? (
            <span className="next-guest__cue">{nextGuest.learningCue}</span>
          ) : null}
          {nextGuest.wants ? (
            <span className="next-guest__fit">Likely order: {nextGuest.wants}.</span>
          ) : null}
        </div>
      ) : null}

      {products.length > 0 && (
        <div className="serve-menu" aria-label="Serve a product">
          <p className="serve-menu__label">Serve</p>
          <div className="serve-menu__items">
            {products.map((product) => (
              <button
                key={product.id}
                type="button"
                className={`serve-menu__item${product.name === nextGuest?.wants ? " serve-menu__item--suggested" : ""}`}
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
    </>
  );
}
