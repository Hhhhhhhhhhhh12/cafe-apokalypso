import { describe, expect, it } from "vitest";
import { createFreshRunState, createInitialGameState } from "../src/game/engine/gameState";
import { gameReducer } from "../src/game/engine/reducer";
import { getEmployeeLevel, getEmployeeLevelBonuses } from "../src/game/engine/management";
import {
  getCurrentDayModifier,
  getObjectiveStatus,
  getVisibleDaySevenLetter,
  getVisibleKassandraMessages
} from "../src/game/engine/selectors";
import type { GameState } from "../src/game/types/game";

describe("initial game state", () => {
  it("starts as a serializable day-one café state", () => {
    const state = createInitialGameState();

    expect(state.version).toBe(14);
    expect(state.decor).toEqual({ plant: 1, shelf: 1, clock: 1, lamp: 1, cups: 1 });
    expect(state.run.runNumber).toBe(1);
    expect(state.run.modifierIds).toHaveLength(7);
    expect(getCurrentDayModifier(state).id).toBe("soft-opening");
    expect(state.guestMemory).toEqual({});
    expect(state.contentCatalogVersion).toBe("week-one-v1");
    expect(state.day).toBe(1);
    expect(state.weirdnessVisible).toBe(false);
    expect(state.kassandraInstalled).toBe(false);
    expect(state.demoComplete).toBe(false);
    expect(state.cafeClosed).toBe(false);
    expect(state.closureReason).toBe(null);
    expect(state.reputationZeroStreak).toBe(0);
    expect(state.resources.reputation).toBe(25);
    expect(state.completedActions).toEqual([]);
    expect(state.objectiveResults).toEqual([]);
    expect(state.dayManagement.actionPointsRemaining).toBe(3);
    expect(getObjectiveStatus(state).objective.title).toBe("Close the first shift");
    expect(getObjectiveStatus(state).status).toBe("active");
    expect(state.unlocks).toEqual({
      pricing: false,
      advertising: false,
      staff: false,
      kassandra: false,
      apocalypseOperations: false
    });
    expect(state.guestHistory).toEqual([]);
    expect(state.eventHistory).toEqual([]);
    expect(state.unlockedAchievements).toEqual([]);
    expect(state.resources.money).toBe(42);
    expect(state.supplies).toEqual({ coffee: 12, milk: 8, pastries: 6 });
    expect(state.resources.cleanliness).toBe(80);
    expect(state.resources.stress).toBe(0);
    expect(state.statusMessage).toContain("Previous runs: [REDACTED]");
    expect(() => JSON.stringify(state)).not.toThrow();
  });

  it("applies management actions deterministically", () => {
    const state = createInitialGameState();
    const nextState = gameReducer(state, { type: "prepare_drink" });

    expect(nextState.supplies.coffee).toBe(state.supplies.coffee - 1);
    expect(nextState.resources.money).toBeGreaterThan(state.resources.money);
    expect(nextState.resources.cleanliness).toBe(state.resources.cleanliness - 2);
    expect(nextState.completedActions).toContain("take_order");
  });

  it("progresses from Day 1 through Day 7 and then stops", () => {
    let state = createInitialGameState();

    for (let expectedDay = 2; expectedDay <= 7; expectedDay += 1) {
      state = closeCurrentDay(state);
      expect(state.day).toBe(expectedDay);
      expect(state.demoComplete).toBe(false);
    }

    state = closeCurrentDay(state);

    expect(state.day).toBe(7);
    expect(state.demoComplete).toBe(true);
    expect(state.weirdnessVisible).toBe(true);
    expect(getVisibleDaySevenLetter(state)).toContain(
      "apocalyptically relevant caffeine infrastructure"
    );

    const afterExtraClose = gameReducer(state, { type: "complete_day" });
    expect(afterExtraClose.day).toBe(7);
    expect(afterExtraClose.demoComplete).toBe(true);
  });

  it("does not expose KASSANDRA messages before Day 6", () => {
    let state = createInitialGameState();

    expect(getVisibleKassandraMessages(state)).toHaveLength(0);

    state = closeCurrentDay(state);
    state = closeCurrentDay(state);
    state = closeCurrentDay(state);
    state = closeCurrentDay(state);

    expect(state.day).toBe(5);
    expect(getVisibleKassandraMessages(state)).toHaveLength(0);

    state = closeCurrentDay(state);

    expect(state.day).toBe(6);
    expect(state.kassandraInstalled).toBe(true);
    expect(getVisibleKassandraMessages(state).length).toBeGreaterThan(0);
  });

  it("resets the progression loop back to a fresh setup phase", () => {
    const progressedState = closeCurrentDay(closeCurrentDay(createInitialGameState()));
    const resetState = gameReducer(progressedState, { type: "reset_game" });

    expect(resetState).toEqual(createFreshRunState());
  });

  it("records soft-run memory fragments without ending the week", () => {
    const state = closeCurrentDay(createInitialGameState());

    expect(state.day).toBe(2);
    expect(state.run.memoryFragments).toContain("day-1-objective-completed");
    expect(state.run.memoryFragments).toContain("guest-preference-ledger");
    expect(state.demoComplete).toBe(false);
  });
});

describe("employee XP system", () => {
  it("getEmployeeLevel maps XP to correct levels", () => {
    expect(getEmployeeLevel(0)).toBe(1);
    expect(getEmployeeLevel(4)).toBe(1);
    expect(getEmployeeLevel(5)).toBe(2);
    expect(getEmployeeLevel(9)).toBe(2);
    expect(getEmployeeLevel(10)).toBe(3);
    expect(getEmployeeLevel(99)).toBe(3);
  });

  it("getEmployeeLevelBonuses returns correct bonuses per level", () => {
    expect(getEmployeeLevelBonuses(1)).toEqual({ extraAP: 0, tipBonus: 0 });
    expect(getEmployeeLevelBonuses(2)).toEqual({ extraAP: 1, tipBonus: 0 });
    expect(getEmployeeLevelBonuses(3)).toEqual({ extraAP: 1, tipBonus: 0.05 });
  });

  it("staffXp starts empty", () => {
    const state = createInitialGameState();
    expect(state.staffXp).toEqual({});
  });

  it("awards XP to helper equal to customers served after day close", () => {
    let state: GameState = {
      ...createInitialGameState(),
      day: 3,
      dayPhase: "day_start",
      unlocks: { pricing: true, advertising: false, staff: true, kassandra: false, apocalypseOperations: false },
      dayManagement: {
        ...createInitialGameState().dayManagement,
        actionPointsRemaining: 5,
        helperDecisionMade: false
      }
    };

    state = gameReducer(state, { type: "select_helper", helperId: "jana", taskId: "service" });
    state = gameReducer(state, { type: "open_day" });
    state = gameReducer(state, { type: "take_order" });
    state = gameReducer(state, { type: "take_order" });
    state = gameReducer(state, { type: "complete_day" });

    expect(state.staffXp["jana"]).toBeGreaterThan(0);
  });

  it("level-2 helper grants +1 AP when opening the day", () => {
    const baseAP = 4; // day-2 budget
    let state: GameState = {
      ...createInitialGameState(),
      day: 3,
      dayPhase: "day_start",
      staffXp: { jana: 5 }, // level 2
      unlocks: { pricing: true, advertising: false, staff: true, kassandra: false, apocalypseOperations: false },
      dayManagement: {
        ...createInitialGameState().dayManagement,
        actionPointsRemaining: baseAP,
        helperDecisionMade: false
      }
    };

    state = gameReducer(state, { type: "select_helper", helperId: "jana", taskId: "service" });
    state = gameReducer(state, { type: "open_day" });

    expect(state.dayManagement.actionPointsRemaining).toBe(baseAP + 1);
  });

  it("level-1 helper does not grant extra AP", () => {
    const baseAP = 4;
    let state: GameState = {
      ...createInitialGameState(),
      day: 3,
      dayPhase: "day_start",
      staffXp: { jana: 0 }, // level 1
      unlocks: { pricing: true, advertising: false, staff: true, kassandra: false, apocalypseOperations: false },
      dayManagement: {
        ...createInitialGameState().dayManagement,
        actionPointsRemaining: baseAP,
        helperDecisionMade: false
      }
    };

    state = gameReducer(state, { type: "select_helper", helperId: "jana", taskId: "service" });
    state = gameReducer(state, { type: "open_day" });

    expect(state.dayManagement.actionPointsRemaining).toBe(baseAP);
  });
});

function closeCurrentDay(state: GameState): GameState {
  let workingState = state;

  if (workingState.dayPhase === "day_start") {
    workingState = gameReducer(workingState, { type: "open_day" });
  }

  workingState = gameReducer(workingState, { type: "take_order" });
  workingState = gameReducer(workingState, { type: "prepare_drink" });
  workingState = gameReducer(workingState, { type: "clean_tables" });
  workingState = gameReducer(workingState, { type: "check_supplies" });
  workingState = gameReducer(workingState, { type: "complete_day" });

  if (!workingState.demoComplete) {
    workingState = gameReducer(workingState, {
      type: "set_supply_purchase",
      ingredient: "coffee",
      quantity: 2
    });
    workingState = gameReducer(workingState, {
      type: "set_supply_purchase",
      ingredient: "milk",
      quantity: 1
    });
    workingState = gameReducer(workingState, {
      type: "set_supply_purchase",
      ingredient: "pastries",
      quantity: 1
    });
    workingState = gameReducer(workingState, { type: "confirm_supply_purchase" });
  }

  return workingState;
}
