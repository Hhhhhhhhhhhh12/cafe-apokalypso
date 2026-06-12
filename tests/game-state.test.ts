import { describe, expect, it } from "vitest";
import { createInitialGameState } from "../src/game/engine/gameState";
import { gameReducer } from "../src/game/engine/reducer";
import {
  getObjectiveStatus,
  getVisibleDaySevenLetter,
  getVisibleKassandraMessages
} from "../src/game/engine/selectors";
import type { GameState } from "../src/game/types/game";

describe("initial game state", () => {
  it("starts as a serializable day-one café state", () => {
    const state = createInitialGameState();

    expect(state.version).toBe(9);
    expect(state.decor).toEqual({ plant: 1, shelf: 1, clock: 1, lamp: 1, cups: 1 });
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

  it("resets the progression loop back to Day 1", () => {
    const progressedState = closeCurrentDay(closeCurrentDay(createInitialGameState()));
    const resetState = gameReducer(progressedState, { type: "reset_game" });

    expect(resetState).toEqual(createInitialGameState());
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
