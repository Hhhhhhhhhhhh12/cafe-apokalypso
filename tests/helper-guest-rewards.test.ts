import { describe, expect, it } from "vitest";
import { createInitialGameState } from "../src/game/engine/gameState";
import { createInitialDayManagement } from "../src/game/engine/management";
import { gameReducer } from "../src/game/engine/reducer";
import { getGuestForCustomer } from "../src/game/engine/selectors";
import type { GameState } from "../src/game/types/game";

const pourOver = { type: "serve_product", productId: "handfilter" } as const;
function openWithJana(): GameState {
  const initial = createInitialGameState();
  const morning: GameState = { ...initial, day: 5, dayPhase: "day_start",
    resources: { ...initial.resources, money: 100, cleanliness: 49 },
    supplies: { coffee: 6, milk: 4, pastries: 2 },
    unlocks: { ...initial.unlocks, staff: true },
    dayManagement: createInitialDayManagement(initial.resources.reputation, 5) };
  return gameReducer(gameReducer(morning, { type: "select_helper", helperId: "jana", taskId: "service" }), { type: "open_day" });
}
function waitingForGrau(): GameState {
  let state = openWithJana();
  state = gameReducer(state, { type: "install_second_brew_group" });
  for (let i = 0; i < 3; i++) state = gameReducer(state, { type: "clean_tables" });
  state = gameReducer(state, { type: "serve_double_espresso" });
  expect(state.dayManagement.guestsLost).toBe(1);
  expect(state.dayManagement.customersServed).toBe(2);
  expect(state.dayManagement.helperExtraOrdersRemaining).toBe(1);
  expect(getGuestForCustomer(state, 3)?.id).toBe("herr-grau");
  return state;
}

describe("per-guest rewards in helper service", () => {
  it("awards Grau's premium preference before the helper serves Meda on the final action", () => {
    const before = waitingForGrau();
    expect(before.dayManagement.actionPointsRemaining).toBe(1);
    const after = gameReducer(before, pourOver);
    expect(after.dayManagement.customersServed).toBe(4);
    expect(after.resources.reputation).toBe(before.resources.reputation + 2);
    expect(after.dayManagement.appreciationBonusesGiven).toBe(2);
    expect(after.statusMessage).toContain("long shadow");
    expect(after.dayManagement.actionPointsRemaining).toBe(0);
    const reference: GameState = { ...before, dayManagement: { ...before.dayManagement, actionPointsRemaining: 2, helperExtraOrdersRemaining: 0 } };
    const singles = gameReducer(gameReducer(reference, pourOver), pourOver);
    expect(after.resources.money).toBe(singles.resources.money);
    expect(after.resources.reputation).toBe(singles.resources.reputation);
    expect(after.supplies).toEqual(singles.supplies);
  });

  it("respects the remaining daily appreciation cap", () => {
    const before = waitingForGrau();
    before.dayManagement.appreciationBonusesGiven = 3;
    const after = gameReducer(before, pourOver);
    expect(after.dayManagement.appreciationBonusesGiven).toBe(4);
    expect(after.resources.reputation).toBe(before.resources.reputation + 1);
    expect(after.statusMessage).toContain("Rep +1.");
    expect(after.statusMessage).not.toContain("Rep +2.");
  });

  it("does not promise reputation beyond the meter maximum", () => {
    const before = waitingForGrau();
    before.resources.reputation = 100;
    const after = gameReducer(before, pourOver);
    expect(after.resources.reputation).toBe(100);
    expect(after.statusMessage).toContain("Rep +0.");
  });

  it("keeps the first guest's earned reward when the extra recipe cannot be made", () => {
    const before = waitingForGrau();
    before.supplies.coffee = 2;
    const after = gameReducer(before, pourOver);
    expect(after.dayManagement.customersServed).toBe(3);
    expect(after.dayManagement.appreciationBonusesGiven).toBe(2);
    // Existing failed helper order costs one reputation; Grau still earns his two.
    expect(after.resources.reputation).toBe(before.resources.reputation + 1);
    expect(after.statusMessage).toContain("helper could not complete");
  });
});
