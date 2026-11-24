import { describe, expect, it } from "vitest";
import { createFreshRunState, createInitialGameState } from "../src/game/engine/gameState";
import { createInitialDayManagement, getProductById } from "../src/game/engine/management";
import { gameReducer } from "../src/game/engine/reducer";
import { getPendingRushGuests } from "../src/game/engine/rush";
import { readGameSave } from "../src/game/engine/save";
import { getExpectedProductIncome, getGuestForCustomer, getGuestWantedProductId } from "../src/game/engine/selectors";
import type { DayNumber } from "../src/game/types/content";
import type { GameState } from "../src/game/types/game";

function beforeOpening(day: DayNumber): GameState {
  const state = createInitialGameState();
  return {
    ...state,
    day,
    dayPhase: "day_start",
    dayManagement: createInitialDayManagement(state.resources.reputation, day),
    unlocks: { ...state.unlocks, staff: day >= 3, advertising: day >= 4 }
  };
}

function serveWanted(state: GameState): GameState {
  const { customersServed, guestsLost } = state.dayManagement;
  const guest = getGuestForCustomer(state, customersServed + guestsLost)!;
  const productId = getGuestWantedProductId(state, guest)!;
  return gameReducer(state, { type: "serve_product", productId });
}

function reload(state: GameState): GameState {
  const storage = { getItem: () => JSON.stringify(state), setItem() {}, removeItem() {} };
  const save = readGameSave(storage);
  if (save.status !== "loaded") throw new Error("Expected playable save");
  return save.state;
}

describe("Research and staff training", () => {
  it("gives double Research for a manual wipe that enables full recovery", () => {
    const opened = gameReducer(beforeOpening(2), { type: "open_day" });
    const beforeWipe = serveWanted(serveWanted(opened));
    const wipe = { type: "clean_table", tableId: "left" } as const;
    const wiped = gameReducer(beforeWipe, wipe);

    expect(wiped.research).toBe(2);
    expect(wiped.resources.money).toBe(beforeWipe.resources.money);
    expect(gameReducer(wiped, wipe).research).toBe(2);
    const rested = serveWanted(wiped);
    expect(rested.dayManagement.heartsRestored).toBe(2);
    const sale = getExpectedProductIncome(wiped, getProductById("filterkaffee"));
    expect(rested.resources.money - wiped.resources.money).toBeCloseTo(sale + 2);
  });

  it("spends only Research, preserves training on reload, and gives no Research for a delegated wipe", () => {
    const state = beforeOpening(3);
    const action = { type: "train_helper", helperId: "jana" } as const;
    expect(gameReducer(state, action).trainedStaff).toEqual([]);
    const trained = reload(gameReducer({ ...state, research: 3 }, action));
    expect(trained.research).toBe(0);
    expect(trained.resources.money).toBe(state.resources.money);
    expect(gameReducer({ ...trained, research: 3 }, action).research).toBe(3);

    const assigned = gameReducer(trained, { type: "select_helper", helperId: "jana", taskId: "cleaning" });
    const served = serveWanted(gameReducer(assigned, { type: "open_day" }));
    const wiped = gameReducer(served, { type: "clean_table", tableId: "left" });
    expect(wiped.research).toBe(0);
    expect(wiped.resources.cleanliness).toBe(served.resources.cleanliness + 6);
    expect(wiped.dayManagement.actionPointsRemaining).toBe(served.dayManagement.actionPointsRemaining);
  });

  it("keeps autonomous clearing on a different table while the player earns Research", () => {
    const assigned = gameReducer(beforeOpening(4), { type: "select_helper", helperId: "jana", taskId: "cleaning" });
    const served = serveWanted(serveWanted(gameReducer(assigned, { type: "open_day" })));
    expect(served.dayManagement.dirtyTableIds).toEqual(["left", "right"]);

    const wiped = gameReducer(served, { type: "clean_table", tableId: "right" });
    expect(wiped.research).toBe(1);
    expect(wiped.dayManagement.dirtyTableIds).toEqual([]);
    expect(wiped.dayManagement.helperAutonomousActions).toBe(1);
    expect(wiped.dayManagement.cleaningActions).toBe(1);
  });

  it("gives trained Nino a prep action on barista shifts", () => {
    const state = { ...beforeOpening(4), research: 4 };
    const trained = gameReducer(state, { type: "train_helper", helperId: "nino" });
    const assignBarista = { type: "select_helper", helperId: "nino", taskId: "barista" } as const;
    const open = { type: "open_day" } as const;
    const untrainedShift = gameReducer(gameReducer(state, assignBarista), open);
    const trainedShift = gameReducer(gameReducer(trained, assignBarista), open);
    expect(trainedShift.dayManagement.actionPointsRemaining).toBe(untrainedShift.dayManagement.actionPointsRemaining + 1);
  });
});

describe("late-week rush", () => {
  it("rewards a timely, healing rush once, including after a mid-rush reload", () => {
    const opened = gameReducer(beforeOpening(5), { type: "open_day" });
    const rush = serveWanted(serveWanted(opened));
    expect(getPendingRushGuests(rush)).toBe(2);
    expect(rush.statusMessage).toContain("Rush begins");

    const afterFirst = reload(serveWanted(rush));
    expect(afterFirst.dayManagement.rush?.satisfied).toBe(1);
    const finished = serveWanted(afterFirst);
    expect(finished.dayManagement.rush).toMatchObject({ satisfied: 2, tip: 4, reputationGained: 2 });
    expect(finished.dayManagement.rush?.heartsRestored).toBeGreaterThan(0);
    expect(finished.statusMessage).toContain("Rush tip +4 Asche");

    const closed = gameReducer(finished, { type: "complete_day" });
    expect(closed.resources.money).toBe(finished.resources.money - 6);
    expect(closed.daySummary?.flavorLines.some((line) => line.includes("Rush handled"))).toBe(true);
  });

  it.each([false, true])("charges complaints and unserved arrivals according to staffing (helper: %s)", (withHelper) => {
    let state = beforeOpening(5);
    if (withHelper) {
      state = gameReducer(state, { type: "select_helper", helperId: "jana", taskId: "cleaning" });
    }
    const rush = serveWanted(serveWanted(gameReducer(state, { type: "open_day" })));
    expect(rush.dayManagement.currentGuestPatience).toBe(withHelper ? 100 : 75);

    const complained = gameReducer(rush, { type: "serve_product", productId: "croissant" });
    const penalty = withHelper ? 1 : 2;
    expect(complained.resources.reputation).toBe(rush.resources.reputation - penalty);
    expect(getPendingRushGuests(complained)).toBe(1);
    const closed = gameReducer(complained, { type: "complete_day" });
    expect(closed.dayManagement.rush?.reputationLost).toBe(2 * penalty);
    expect(closed.dayManagement.rush?.tip).toBe(0);
  });

  it("opens an old in-progress save without charging it for a rush it never started", () => {
    const opened = gameReducer(beforeOpening(5), { type: "open_day" });
    const old = serveWanted(serveWanted(opened));
    delete old.research;
    delete old.trainedStaff;
    delete old.dayManagement.rush;
    const loaded = reload(old);
    expect(getPendingRushGuests(loaded)).toBe(0);
    const closed = gameReducer(loaded, { type: "complete_day" });
    expect(closed.dayManagement.rush).toBeUndefined();
  });

  it("adds Nele's training tip on top of a successful rush", () => {
    const trained = gameReducer({ ...beforeOpening(5), research: 4 }, { type: "train_helper", helperId: "nele" });
    const assigned = gameReducer(trained, { type: "select_helper", helperId: "nele", taskId: "marketing" });
    const rush = serveWanted(gameReducer(assigned, { type: "open_day" }));
    expect(getPendingRushGuests(rush)).toBe(2);
    expect(serveWanted(serveWanted(rush)).dayManagement.rush?.tip).toBe(6);
  });
});

it("funds a furnished setup while keeping the first décor upgrade out of reach after a quiet opening", () => {
  let state = createFreshRunState();
  for (const slot of ["machine", "grinder", "seating"] as const) {
    state = gameReducer(state, { type: "buy_equipment", slot });
  }
  state = gameReducer(state, { type: "finish_setup" });
  state = serveWanted(serveWanted(state));
  state = gameReducer(state, { type: "clean_tables" });
  state = serveWanted(state);
  const closed = gameReducer(state, { type: "complete_day" });
  expect(closed.daySummary?.objectiveCompleted).toBe(true);
  const attempted = gameReducer(closed, { type: "upgrade_decor", slot: "cups" });
  expect(attempted.decor.cups).toBe(closed.decor.cups);
  expect(attempted.resources.money).toBe(closed.resources.money);
});
