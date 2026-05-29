import { describe, expect, it } from "vitest";
import {
  loadGameState,
  resetSavedGameState,
  SAVE_KEY,
  saveGameState,
  type StorageLike
} from "../src/game/engine/save";
import { createInitialGameState } from "../src/game/engine/gameState";
import { gameReducer } from "../src/game/engine/reducer";

function createMemoryStorage(initialValue?: string): StorageLike {
  const values = new Map<string, string>();

  if (initialValue !== undefined) {
    values.set(SAVE_KEY, initialValue);
  }

  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value);
    },
    removeItem: (key) => {
      values.delete(key);
    }
  };
}

describe("save safety", () => {
  it("falls back to a new game when save data is missing", () => {
    const state = loadGameState(createMemoryStorage());

    expect(state).toEqual(createInitialGameState());
  });

  it("falls back to a new game when save data is malformed", () => {
    const state = loadGameState(createMemoryStorage("{broken-json"));

    expect(state).toEqual(createInitialGameState());
  });

  it("falls back to a new game when save data uses an unsupported schema", () => {
    const outdatedSave = JSON.stringify({
      version: 2,
      day: 1,
      phaseLabel: "Opening setup",
      resources: {
        money: 42,
        coffee: 12,
        milk: 8,
        pastries: 6,
        reputation: 1,
        cleanliness: 82,
        stress: 6,
        mood: "calm"
      },
      hiddenWeirdness: 1,
      weirdnessVisible: false,
      kassandraInstalled: false,
      unlocks: {
        pricing: false,
        advertising: false,
        staff: false,
        kassandra: false,
        apocalypseOperations: false
      },
      guestHistory: [],
      eventHistory: [],
      unlockedAchievements: [],
      statusMessage: "Old shell save"
    });

    const state = loadGameState(createMemoryStorage(outdatedSave));

    expect(state).toEqual(createInitialGameState());
  });

  it("can save and reset the current shell state", () => {
    const storage = createMemoryStorage();
    const state = createInitialGameState();

    saveGameState(state, storage);
    expect(loadGameState(storage)).toEqual(state);

    resetSavedGameState(storage);
    expect(loadGameState(storage)).toEqual(createInitialGameState());
  });

  it("preserves valid progress through reload-style save/load", () => {
    const storage = createMemoryStorage();
    let state = createInitialGameState();

    state = gameReducer(state, { type: "take_order" });
    state = gameReducer(state, { type: "prepare_drink" });
    state = gameReducer(state, { type: "clean_tables" });
    state = gameReducer(state, { type: "complete_day" });
    state = gameReducer(state, { type: "confirm_supply_purchase" });

    expect(state.day).toBe(2);
    expect(state.supplies.coffee).toBeGreaterThanOrEqual(0);

    saveGameState(state, storage);

    expect(loadGameState(storage)).toEqual(state);
  });
});
