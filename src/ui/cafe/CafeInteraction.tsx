import { formatAsche } from "../../game/engine/currency";
import type { Ref } from "react";
import {
  canCompleteCurrentDay,
  getDayEndRecapLine,
  getIngredientLabel,
  getNextGuestPreview,
  getObjectiveStatus
} from "../../game/engine/selectors";
import { DAILY_FIXED_COST } from "../../game/engine/management";
import type { GameAction, GameState } from "../../game/types/game";
import { HelperStartPanel, OpeningEquipment, RestockControls } from "./CafeManagement";
import { GuestService } from "./GuestService";
import { Noticeboard, SupplyShelf } from "./ShiftStations";

export type CafeStation = "setup" | "service" | "door" | "stock" | "board";

interface CafeInteractionProps {
  station: CafeStation;
  gameState: GameState;
  feedback: string | null;
  backRef: Ref<HTMLButtonElement>;
  onBack: () => void;
  onGoToDoor: () => void;
  onAction: (action: GameAction) => void;
}

export function CafeInteraction({
  station,
  gameState,
  feedback,
  backRef,
  onBack,
  onGoToDoor,
  onAction
}: CafeInteractionProps) {
  const guest = station === "service" ? getNextGuestPreview(gameState) : null;
  const summary = gameState.daySummary;
  const shortages = [...new Set([
    ...gameState.dayManagement.emptySupplyStressIngredients,
    ...(gameState.dayManagement.dayThreeObservations?.missingIngredients ?? [])
  ])];
  const isClosing = gameState.dayPhase === "open";
  const title = {
    setup: "Equip the counter",
    service: guest?.name ?? "At the counter",
    door: isClosing ? "Close the café" : "Open the café",
    stock: isClosing ? "Supply shelf" : `Day ${gameState.day} closed`,
    board: "Noticeboard"
  }[station];

  const isEntry = station === "setup" || (station === "door" && gameState.dayPhase === "setup");
  const heading = <h3 id="cafe-interaction-title" lang={guest ? "de" : undefined}>{title}</h3>;
  const backButton = isEntry ? (
    <button type="button" className="cafe-interaction__back" ref={backRef} onClick={onBack}
      aria-label="Back to café">
      <span aria-hidden="true">×</span>
    </button>
  ) : (
    <button type="button" className="cafe-interaction__back" ref={backRef} onClick={onBack}>
      <span aria-hidden="true">←</span> Back to café
    </button>
  );

  return (
    <section className={`cafe-interaction${isEntry ? " cafe-interaction--entry" : ""}`}
      id="cafe-interaction" aria-labelledby="cafe-interaction-title">
      {isEntry ? <header className="cafe-interaction__heading">{heading}{backButton}</header> : <>{backButton}{heading}</>}
      {feedback ? <p className="cafe-interaction__feedback">{feedback}</p> : null}
      {station === "setup" ? (
        <OpeningEquipment
          gameState={gameState}
          onBuyEquipment={(slot) => onAction({ type: "buy_equipment", slot })}
          onGoToDoor={onGoToDoor}
        />
      ) : null}
      {station === "service" ? (
        <GuestService
          gameState={gameState}
          onServeProduct={(productId) => onAction({ type: "serve_product", productId })}
        />
      ) : null}
      {station === "door" ? <DoorControls gameState={gameState} onAction={onAction} /> : null}
      {station === "board" ? <Noticeboard gameState={gameState} onAction={onAction} /> : null}
      {station === "stock" && isClosing ? <SupplyShelf gameState={gameState} onAction={onAction} /> : null}
      {station === "stock" && !isClosing ? (
        <>
          {summary ? (
            <div className="cafe-interaction__receipt">
              <p><strong>{summary.rating}</strong> · {summary.customersServed} served
                {summary.guestsLost > 0 ? ` · ${summary.guestsLost} walked out` : ""}</p>
              <p>{summary.objectiveCompleted ? "Goal met" : "Goal missed"} · {summary.objectiveTitle}</p>
              <p>Sales {formatAsche(summary.moneyEarned)} · Overhead {formatAsche(summary.dailyOverhead)}
                {summary.moneySpent > 0 ? ` · Shift spending ${formatAsche(summary.moneySpent)}` : ""}</p>
              <p><strong>{formatAsche(gameState.resources.money)} in the till</strong></p>
              {gameState.day === 3 ? (
                <>
                  <p>{summary.helperAutonomyRecap ?? summary.helperRecap}</p>
                  {shortages.length > 0 ? <p>Missing at the counter: {shortages.map(getIngredientLabel).join(", ")}.</p> : null}
                  {gameState.dayManagement.dirtyTableIds.length > 0 ? (
                    <p>Tables left to clear: {gameState.dayManagement.dirtyTableIds.length}.</p>
                  ) : null}
                </>
              ) : null}
              <details>
                <summary>Shift details</summary>
                <p>{getDayEndRecapLine(gameState)}</p>
                {summary.flavorLines.map((line) => <p key={line}>{line}</p>)}
              </details>
            </div>
          ) : null}
          {!gameState.cafeClosed && !gameState.demoComplete ? <>
          <h4>Restock for tomorrow</h4>
          <RestockControls
            gameState={gameState}
            onSetSupplyPurchase={(ingredient, quantity) =>
              onAction({ type: "set_supply_purchase", ingredient, quantity })
            }
            onConfirmSupplyPurchase={() => onAction({ type: "confirm_supply_purchase" })}
            onSkipRestocking={() => onAction({ type: "confirm_supply_purchase", withoutRestocking: true })}
          />
          </> : null}
        </>
      ) : null}
    </section>
  );
}

function DoorControls({
  gameState,
  onAction
}: {
  gameState: GameState;
  onAction: (action: GameAction) => void;
}) {
  if (gameState.dayPhase === "day_start") {
    return (
      <HelperStartPanel
        gameState={gameState}
        onSelectHelper={(helperId, taskId) => onAction({ type: "select_helper", helperId, taskId })}
        onClearHelper={() => onAction({ type: "clear_helper" })}
        onOpenDay={() => onAction({ type: "open_day" })}
      />
    );
  }

  if (gameState.dayPhase === "setup") {
    const canOpen = gameState.equipment.machine >= 1 && gameState.equipment.grinder >= 1;
    return (
      <>
        <p id="cafe-door-hint">
          {canOpen
            ? "The counter is ready. Open the door for your first guest."
            : "Buy a coffee machine and grinder at the counter before opening."}
        </p>
        <button
          type="button"
          disabled={!canOpen}
          aria-describedby="cafe-door-hint"
          onClick={() => onAction({ type: "finish_setup" })}
        >
          {gameState.equipment.seating >= 1 ? "Open the café" : "Open with standing room only"}
        </button>
      </>
    );
  }

  const canClose = canCompleteCurrentDay(gameState);
  const objective = getObjectiveStatus(gameState);
  return (
    <>
      <div id="cafe-door-hint" className="cafe-interaction__receipt">
        {!canClose ? <p>Serve at least one guest before closing.</p> : null}
        {canClose && !objective.completed ? <p>Daily objective still open · {objective.objective.title}</p> : null}
        <p>Rent and utilities cost {formatAsche(DAILY_FIXED_COST)} at closing.</p>
        {gameState.resources.money <= DAILY_FIXED_COST ? <p>Closing now will empty the till.</p> : null}
        {gameState.resources.cleanliness < 40 ? <p>A messy room costs reputation at closing.</p> : null}
      </div>
      <button
        type="button"
        disabled={!canClose}
        aria-describedby="cafe-door-hint"
        onClick={() => onAction({ type: "complete_day" })}
      >
        {gameState.day === 7 ? "Finish Day 7" : "Close day"}
      </button>
    </>
  );
}
