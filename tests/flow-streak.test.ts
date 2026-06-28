import { describe, expect, it } from "vitest";
import { createInitialGameState } from "../src/game/engine/gameState";
import { gameReducer } from "../src/game/engine/reducer";
import { getGuestForCustomer } from "../src/game/engine/selectors";
import type { DayNumber, ProductId } from "../src/game/types/content";
import type { GameState } from "../src/game/types/game";

function openState(day: DayNumber): GameState {
  const base = createInitialGameState();
  return {
    ...base,
    day,
    dayPhase: "open",
    supplies: { coffee: 200, milk: 200, pastries: 200 },
    dayManagement: {
      ...base.dayManagement,
      actionPointsRemaining: 50
    }
  };
}

function queuePos(state: GameState): number {
  return state.dayManagement.customersServed + state.dayManagement.guestsLost;
}

function preferredProductFor(state: GameState): ProductId {
  const guest = getGuestForCustomer(state, queuePos(state));
  return (guest?.preferredProductId ?? "filterkaffee") as ProductId;
}

function servePreferred(state: GameState): GameState {
  return gameReducer(state, {
    type: "serve_product",
    productId: preferredProductFor(state)
  });
}

describe("flow streak system", () => {
  it("builds a streak when consecutive guests get their preferred drink", () => {
    let state = openState(2);
    expect(state.dayManagement.serveStreak).toBe(0);

    state = servePreferred(state);
    expect(state.dayManagement.serveStreak).toBe(1);
    state = servePreferred(state);
    expect(state.dayManagement.serveStreak).toBe(2);
    state = servePreferred(state);
    expect(state.dayManagement.serveStreak).toBe(3);

    expect(state.dayManagement.bestServeStreak).toBe(3);
  });

  it("surfaces a rhythm line at the third matched order", () => {
    let state = openState(2);
    state = servePreferred(state);
    state = servePreferred(state);
    const third = servePreferred(state);
    expect(third.statusMessage.toLowerCase()).toContain("rhythm");
  });

  it("drops a cash tip at the fifth matched order", () => {
    let state = openState(2);
    for (let i = 0; i < 4; i += 1) {
      state = servePreferred(state);
    }
    // Earnings have grown money; capture the balance just before the milestone.
    const beforeFifth = state.resources.money;
    const moneyEarnedBefore = state.dayManagement.moneyEarned;
    state = servePreferred(state);

    expect(state.dayManagement.serveStreak).toBe(5);
    // The €1 flow tip is added on top of the order's normal earnings.
    expect(state.resources.money).toBeGreaterThan(beforeFifth);
    expect(state.dayManagement.moneyEarned - moneyEarnedBefore).toBeGreaterThan(0);
    expect(state.statusMessage.toLowerCase()).toContain("tip");
  });

  it("breaks the flow when a guest with a preference gets the wrong drink", () => {
    let state = openState(2);
    for (let i = 0; i < 3; i += 1) {
      state = servePreferred(state);
    }
    expect(state.dayManagement.serveStreak).toBe(3);

    // A pastry is never any guest's preferred or appreciated product — a clear miss.
    const broken = gameReducer(state, {
      type: "serve_product",
      productId: "croissant"
    });
    expect(broken.dayManagement.serveStreak).toBe(0);
    expect(broken.dayManagement.bestServeStreak).toBe(3);
    expect(broken.statusMessage.toLowerCase()).toContain("breaks");
  });

  it("records the best streak of the day in the closing summary", () => {
    let state = openState(2);
    for (let i = 0; i < 6; i += 1) {
      state = servePreferred(state);
    }
    expect(state.dayManagement.bestServeStreak).toBe(6);

    const closed = gameReducer(state, { type: "complete_day" });
    expect(closed.daySummary?.bestServeStreak).toBe(6);
    expect(
      closed.daySummary?.flavorLines.some((line) => line.includes("Best flow today"))
    ).toBe(true);
  });
});
