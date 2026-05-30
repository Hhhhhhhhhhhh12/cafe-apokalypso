import { useEffect, useMemo, useReducer } from "react";
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

      <section className="workspace-grid" aria-label="Game shell workspace">
        <ResourceHud gameState={gameState} />
        <CafePlaceholder />
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
