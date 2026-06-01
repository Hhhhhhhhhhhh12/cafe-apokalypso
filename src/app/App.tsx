import { useEffect, useMemo, useReducer, useRef } from "react";
import { gameReducer } from "../game/engine/reducer";
import { createInitialGameState } from "../game/engine/gameState";
import {
  getBrowserStorage,
  loadGameState,
  resetSavedGameState,
  saveGameState
} from "../game/engine/save";
import { ActionPanel } from "../ui/components/ActionPanel";
import { CafePlaceholder } from "../ui/cafe/CafePlaceholder";
import { DayProgressPanel } from "../ui/panels/DayProgressPanel";
import { ResourceHud } from "../ui/panels/ResourceHud";

export function App() {
  const storage = useMemo(() => getBrowserStorage(), []);
  const [gameState, dispatch] = useReducer(
    gameReducer,
    storage,
    (availableStorage) =>
      availableStorage ? loadGameState(availableStorage) : createInitialGameState()
  );

  useEffect(() => {
    if (storage) {
      saveGameState(gameState, storage);
    }
  }, [gameState, storage]);

  // Move focus to the closure banner when the café closes, so keyboard and
  // screen-reader users are not stranded on a now-disabled control.
  const closureHeadingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (gameState.cafeClosed) {
      closureHeadingRef.current?.focus();
    }
  }, [gameState.cafeClosed]);

  function handleReset() {
    if (storage) {
      resetSavedGameState(storage);
    }
    dispatch({ type: "reset_game" });
  }

  return (
    <main className="app-shell">
      <header className="hero-bar" aria-labelledby="app-title">
        <div>
          <h1 id="app-title">Café Apokalypso</h1>
          <p className="intro">
            A cozy café. Seven days. Something is not quite right.
          </p>
        </div>
        <div className="day-card" aria-label={`Aktueller Status: Tag ${gameState.day}`}>
          <span className="day-card__label">Current day</span>
          <strong>Day {gameState.day}</strong>
          <span>{gameState.phaseLabel}</span>
        </div>
      </header>

      {gameState.cafeClosed ? (
        <section className="cafe-closed-banner" role="alert" aria-labelledby="cafe-closed-title">
          <p className="eyebrow">Café closed</p>
          <h2 id="cafe-closed-title" ref={closureHeadingRef} tabIndex={-1}>
            {gameState.closureReason === "money"
              ? "Out of money"
              : "Out of standing"}
          </h2>
          <p>
            {gameState.closureReason === "money"
              ? "The till ran dry and the café could no longer cover its day. This run is over."
              : "Reputation stayed at rock bottom for two days running, and the regulars stopped coming. This run is over."}
          </p>
          <button type="button" onClick={handleReset}>
            Start a new café
          </button>
        </section>
      ) : null}

      <section className="workspace-grid" aria-label="Game shell workspace">
        <ResourceHud gameState={gameState} />
        <CafePlaceholder gameState={gameState} />
        <ActionPanel
          gameState={gameState}
          statusMessage={gameState.statusMessage}
          onTakeOrder={() => dispatch({ type: "take_order" })}
          onServeProduct={(productId) => dispatch({ type: "serve_product", productId })}
          onPrepareDrink={() => dispatch({ type: "prepare_drink" })}
          onCheckSupplies={() => dispatch({ type: "check_supplies" })}
          onCleanTables={() => dispatch({ type: "clean_tables" })}
          onAdjustOffer={() => dispatch({ type: "adjust_offer" })}
          onRunAdvertising={() => dispatch({ type: "run_advertising" })}
          onConsultKassandra={() => dispatch({ type: "consult_kassandra" })}
          onSelectHelper={(helperId, taskId) =>
            dispatch({ type: "select_helper", helperId, taskId })
          }
          onOpenDay={() => dispatch({ type: "open_day" })}
          onCompleteDay={() => dispatch({ type: "complete_day" })}
          onSetSupplyPurchase={(ingredient, quantity) =>
            dispatch({ type: "set_supply_purchase", ingredient, quantity })
          }
          onConfirmSupplyPurchase={() => dispatch({ type: "confirm_supply_purchase" })}
          onResetGame={handleReset}
        />
        <DayProgressPanel gameState={gameState} />
      </section>
    </main>
  );
}
