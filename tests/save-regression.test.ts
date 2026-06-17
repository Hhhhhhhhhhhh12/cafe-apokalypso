/**
 * AUFGABE 1 — Save-System-Regression
 *
 * Comprehensive regression tests for the save/load pipeline:
 * - missing key, malformed JSON, version mismatches → clean new-game fallback
 * - fully serializable state (no circular refs, no functions, no class instances)
 * - save-load round-trip deep-equality
 */
import { describe, expect, it } from "vitest";
import {
  loadGameState,
  resetSavedGameState,
  SAVE_KEY,
  saveGameState,
  type StorageLike
} from "../src/game/engine/save";
import {
  createInitialGameState,
  CURRENT_GAME_STATE_VERSION,
  CURRENT_CONTENT_CATALOG_VERSION,
  isValidGameState
} from "../src/game/engine/gameState";
import { gameReducer } from "../src/game/engine/reducer";

// ---------------------------------------------------------------------------
// Helper: in-memory StorageLike
// ---------------------------------------------------------------------------
function createMemoryStorage(
  initialEntries: Record<string, string> = {}
): StorageLike {
  const store = new Map<string, string>(Object.entries(initialEntries));
  return {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => { store.set(key, value); },
    removeItem: (key) => { store.delete(key); }
  };
}

// ---------------------------------------------------------------------------
// Missing key
// ---------------------------------------------------------------------------
describe("save-regression: missing key", () => {
  it("returns a valid initial state when no key exists in storage", () => {
    const state = loadGameState(createMemoryStorage());
    expect(state).toEqual(createInitialGameState());
  });

  it("returns day 1 and phase 'open' for a fresh game", () => {
    const state = loadGameState(createMemoryStorage());
    expect(state.day).toBe(1);
    expect(state.dayPhase).toBe("open");
  });

  it("does not throw when the key is absent", () => {
    expect(() => loadGameState(createMemoryStorage())).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// Malformed / null / undefined JSON
// ---------------------------------------------------------------------------
describe("save-regression: malformed JSON", () => {
  it("falls back to new-game state for broken JSON", () => {
    const state = loadGameState(createMemoryStorage({ [SAVE_KEY]: "{not json" }));
    expect(state).toEqual(createInitialGameState());
  });

  it("falls back to new-game state for null JSON value", () => {
    const state = loadGameState(createMemoryStorage({ [SAVE_KEY]: "null" }));
    expect(state).toEqual(createInitialGameState());
  });

  it("falls back to new-game state for JSON number", () => {
    const state = loadGameState(createMemoryStorage({ [SAVE_KEY]: "42" }));
    expect(state).toEqual(createInitialGameState());
  });

  it("falls back to new-game state for JSON array", () => {
    const state = loadGameState(createMemoryStorage({ [SAVE_KEY]: "[]" }));
    expect(state).toEqual(createInitialGameState());
  });

  it("falls back to new-game state for empty string value", () => {
    const state = loadGameState(createMemoryStorage({ [SAVE_KEY]: "" }));
    expect(state).toEqual(createInitialGameState());
  });

  it("falls back to new-game state for JSON string (not an object)", () => {
    const state = loadGameState(
      createMemoryStorage({ [SAVE_KEY]: JSON.stringify("just a string") })
    );
    expect(state).toEqual(createInitialGameState());
  });

  it("does not throw for any of the malformed inputs", () => {
    const badInputs = ["{", "undefined", "NaN", "true", "false", ""];
    for (const raw of badInputs) {
      expect(() =>
        loadGameState(createMemoryStorage({ [SAVE_KEY]: raw }))
      ).not.toThrow();
    }
  });
});

// ---------------------------------------------------------------------------
// Version mismatch (wrong tag / legacy key)
// ---------------------------------------------------------------------------
describe("save-regression: version mismatch", () => {
  it("resets to new-game state for a completely wrong version number", () => {
    const badSave = JSON.stringify({
      ...createInitialGameState(),
      version: 999
    });
    const state = loadGameState(createMemoryStorage({ [SAVE_KEY]: badSave }));
    expect(state).toEqual(createInitialGameState());
  });

  it("resets to new-game state for version 0", () => {
    const badSave = JSON.stringify({
      ...createInitialGameState(),
      version: 0
    });
    const state = loadGameState(createMemoryStorage({ [SAVE_KEY]: badSave }));
    expect(state).toEqual(createInitialGameState());
  });

  it("resets to new-game state for wrong contentCatalogVersion", () => {
    const badSave = JSON.stringify({
      ...createInitialGameState(),
      contentCatalogVersion: "week-zero-v0"
    });
    const state = loadGameState(createMemoryStorage({ [SAVE_KEY]: badSave }));
    expect(state).toEqual(createInitialGameState());
  });

  it("resets to new-game state when save is stored under a legacy v1 key", () => {
    // Legacy keys are NOT SAVE_KEY — loadGameState only reads SAVE_KEY.
    const legacyKey = "cafe-apokalypso.save.v1";
    const storage = createMemoryStorage({
      [legacyKey]: JSON.stringify({ ...createInitialGameState(), day: 5 })
    });
    const state = loadGameState(storage);
    expect(state).toEqual(createInitialGameState());
  });

  it("resets to new-game state when save is under v2 key", () => {
    const legacyKey = "cafe-apokalypso.save.v2";
    const storage = createMemoryStorage({
      [legacyKey]: JSON.stringify({ ...createInitialGameState(), day: 3 })
    });
    const state = loadGameState(storage);
    expect(state).toEqual(createInitialGameState());
  });

  it("resets to new-game state when save is under v3 key", () => {
    const legacyKey = "cafe-apokalypso.save.v3";
    const storage = createMemoryStorage({
      [legacyKey]: JSON.stringify({ ...createInitialGameState(), day: 7 })
    });
    const state = loadGameState(storage);
    expect(state).toEqual(createInitialGameState());
  });

  it("resetSavedGameState clears SAVE_KEY and all legacy keys", () => {
    const allKeys = [
      SAVE_KEY,
      "cafe-apokalypso.save.v1",
      "cafe-apokalypso.save.v2",
      "cafe-apokalypso.save.v3"
    ];
    const entries: Record<string, string> = {};
    for (const k of allKeys) {
      entries[k] = JSON.stringify({ day: 5 });
    }
    const storage = createMemoryStorage(entries);

    resetSavedGameState(storage);

    // After reset, loadGameState must produce a fresh game
    const state = loadGameState(storage);
    expect(state).toEqual(createInitialGameState());
  });
});

// ---------------------------------------------------------------------------
// Serialisierbarkeit (no circular refs, no functions, no class instances)
// ---------------------------------------------------------------------------
describe("save-regression: state serializability", () => {
  it("JSON.stringify does not throw on the initial game state", () => {
    expect(() => JSON.stringify(createInitialGameState())).not.toThrow();
  });

  it("serialized state is a valid JSON string", () => {
    const raw = JSON.stringify(createInitialGameState());
    expect(typeof raw).toBe("string");
    expect(() => JSON.parse(raw)).not.toThrow();
  });

  it("deserialized initial state passes isValidGameState", () => {
    const raw = JSON.stringify(createInitialGameState());
    const parsed = JSON.parse(raw) as unknown;
    expect(isValidGameState(parsed)).toBe(true);
  });

  it("state after several actions is still fully serializable", () => {
    let state = createInitialGameState();
    state = gameReducer(state, { type: "take_order" });
    state = gameReducer(state, { type: "clean_tables" });
    state = gameReducer(state, { type: "complete_day" });
    state = gameReducer(state, { type: "confirm_supply_purchase" });

    expect(() => JSON.stringify(state)).not.toThrow();
    const parsed = JSON.parse(JSON.stringify(state)) as unknown;
    expect(isValidGameState(parsed)).toBe(true);
  });

  it("state contains no function-valued properties at the top level", () => {
    const state = createInitialGameState();
    for (const value of Object.values(state)) {
      expect(typeof value).not.toBe("function");
    }
  });

  it("state values are plain JSON types (no class instances, no undefined)", () => {
    const raw = JSON.stringify(createInitialGameState());
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    // JSON round-trip drops undefined fields; nothing should be lost for valid state
    expect(isValidGameState(parsed)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Save-load round-trip
// ---------------------------------------------------------------------------
describe("save-regression: round-trip", () => {
  it("save then load yields deep-equal state for the initial game", () => {
    const storage = createMemoryStorage();
    const initial = createInitialGameState();
    saveGameState(initial, storage);
    expect(loadGameState(storage)).toEqual(initial);
  });

  it("save then load yields deep-equal state after mid-day actions", () => {
    const storage = createMemoryStorage();
    let state = createInitialGameState();
    state = gameReducer(state, { type: "take_order" });
    state = gameReducer(state, { type: "clean_tables" });

    saveGameState(state, storage);
    expect(loadGameState(storage)).toEqual(state);
  });

  it("save then load yields deep-equal state after day 2 restock", () => {
    const storage = createMemoryStorage();
    let state = createInitialGameState();
    state = gameReducer(state, { type: "take_order" });
    state = gameReducer(state, { type: "complete_day" });
    state = gameReducer(state, { type: "confirm_supply_purchase" });

    expect(state.day).toBe(2);
    saveGameState(state, storage);
    expect(loadGameState(storage)).toEqual(state);
  });

  it("overwriting an existing save with a new state loads the newer state", () => {
    const storage = createMemoryStorage();
    const initial = createInitialGameState();
    saveGameState(initial, storage);

    let advanced = createInitialGameState();
    advanced = gameReducer(advanced, { type: "take_order" });
    advanced = gameReducer(advanced, { type: "complete_day" });
    advanced = gameReducer(advanced, { type: "confirm_supply_purchase" });
    saveGameState(advanced, storage);

    const loaded = loadGameState(storage);
    expect(loaded.day).toBe(2);
    expect(loaded).toEqual(advanced);
  });

  it("version and contentCatalogVersion survive the round-trip unchanged", () => {
    const storage = createMemoryStorage();
    const initial = createInitialGameState();
    saveGameState(initial, storage);
    const loaded = loadGameState(storage);
    expect(loaded.version).toBe(CURRENT_GAME_STATE_VERSION);
    expect(loaded.contentCatalogVersion).toBe(CURRENT_CONTENT_CATALOG_VERSION);
  });

  it("guestMemory entries survive a round-trip after serving guests", () => {
    const storage = createMemoryStorage();
    let state = createInitialGameState();
    // Serve a few orders to populate guestMemory
    state = gameReducer(state, { type: "take_order" });
    state = gameReducer(state, { type: "take_order" });

    saveGameState(state, storage);
    const loaded = loadGameState(storage);
    expect(loaded.guestMemory).toEqual(state.guestMemory);
  });
});
