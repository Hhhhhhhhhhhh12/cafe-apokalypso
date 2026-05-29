import { describe, expect, it } from "vitest";
import { createInitialGameState } from "../src/game/engine/gameState";
import { gameReducer } from "../src/game/engine/reducer";
import {
  getVisibleDaySevenLetter,
  getVisibleKassandraMessages
} from "../src/game/engine/selectors";
import type { GameState } from "../src/game/types/game";

describe("initial game state", () => {
  it("starts as a serializable day-one placeholder shell", () => {
    const state = createInitialGameState();

    expect(state.version).toBe(3);
    expect(state.contentCatalogVersion).toBe("week-one-v1");
    expect(state.day).toBe(1);
    expect(state.weirdnessVisible).toBe(false);
    expect(state.kassandraInstalled).toBe(false);
    expect(state.demoComplete).toBe(false);
    expect(state.completedActions).toEqual([]);
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
    expect(() => JSON.stringify(state)).not.toThrow();
  });

  it("applies placeholder actions deterministically", () => {
    const state = createInitialGameState();
    const nextState = gameReducer(state, { type: "prepare_drink" });

    expect(nextState.resources.coffee).toBe(state.resources.coffee - 1);
    expect(nextState.resources.stress).toBe(state.resources.stress + 1);
    expect(nextState.completedActions).toContain("prepare_drink");
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
  let workingState = gameReducer(state, { type: "take_order" });
  workingState = gameReducer(workingState, { type: "prepare_drink" });
  workingState = gameReducer(workingState, { type: "clean_tables" });

  return gameReducer(workingState, { type: "complete_day" });
}
