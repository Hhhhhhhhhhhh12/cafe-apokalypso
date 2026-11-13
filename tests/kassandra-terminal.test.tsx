import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { createInitialGameState, isValidGameState } from "../src/game/engine/gameState";
import { createInitialDayManagement, PATIENCE_TICK } from "../src/game/engine/management";
import { gameReducer } from "../src/game/engine/reducer";
import { KassandraTerminal } from "../src/ui/cafe/KassandraTerminal";

const consult = { type: "consult_kassandra" } as const;

function openDaySix() {
  const state = createInitialGameState();
  return gameReducer({
    ...state,
    day: 6,
    dayPhase: "day_start",
    kassandraInstalled: true,
    unlocks: { ...state.unlocks, kassandra: true },
    dayManagement: createInitialDayManagement(state.resources.reputation, 6)
  }, { type: "open_day" });
}

const render = (gameState: ReturnType<typeof openDaySix>) =>
  renderToStaticMarkup(<KassandraTerminal gameState={gameState} onConsult={() => {}} />);

describe("KASSANDRA at the register", () => {
  it("previews the early refund and saves the forecast, while still spending patience", () => {
    const state = openDaySix();
    state.supplies.coffee = 1;
    expect(render(state)).toContain("Print forecast · 0 actions");
    expect(render(state)).toContain("loses one patience step");
    const next = gameReducer(state, consult);
    expect(next.dayManagement.actionPointsRemaining).toBe(state.dayManagement.actionPointsRemaining);
    expect(next.dayManagement.currentGuestPatience).toBe(state.dayManagement.currentGuestPatience - PATIENCE_TICK);
    expect(next.dayManagement.kassandraReceipt?.[0]).toMatch(/^Next orders: .* → /);
    expect(next.dayManagement.kassandraReceipt).toContain("Short on: Coffee beans");
    const restored: unknown = JSON.parse(JSON.stringify(next));
    expect(isValidGameState(restored)).toBe(true);
    if (isValidGameState(restored)) {
      expect(render(restored)).toContain("Short on: Coffee beans");
      expect(render(restored)).not.toContain("Print forecast ·");
      expect(gameReducer(restored, consult).dayManagement).toEqual(restored.dayManagement);
    }
  });

  it("charges one action after service and forecasts from the queue after a walkout", () => {
    const state = gameReducer(openDaySix(), { type: "serve_product", productId: "espresso" });
    state.dayManagement.currentGuestPatience = PATIENCE_TICK;
    expect(render(state)).toContain("Print forecast · 1 action");
    expect(render(state)).toContain("The waiting guest will leave.");
    const next = gameReducer(state, consult);
    expect(next.dayManagement.guestsLost).toBe(state.dayManagement.guestsLost + 1);
    expect(next.dayManagement.actionPointsRemaining).toBe(state.dayManagement.actionPointsRemaining - 1);
    expect(next.dayManagement.kassandraReceipt?.[0]).not.toBe(gameReducer({
      ...state, dayManagement: { ...state.dayManagement, currentGuestPatience: 2 * PATIENCE_TICK }
    }, consult).dayManagement.kassandraReceipt?.[0]);
  });

  it("keeps the message readable when no action is available", () => {
    const state = openDaySix();
    state.dayManagement.actionPointsRemaining = 0;
    expect(render(state)).toContain("Requires an available action.");
    expect(render(state)).toContain("Register message");
    expect(gameReducer(state, consult).dayManagement.kassandraReceipt).toBeUndefined();
  });
});
