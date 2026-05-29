import { describe, expect, it } from "vitest";
import {
  loadGameState,
  resetSavedGameState,
  SAVE_KEY,
  saveGameState,
  type StorageLike
} from "../src/game/engine/save";
import { createInitialGameState } from "../src/game/engine/gameState";

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
      version: 1,
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
});
