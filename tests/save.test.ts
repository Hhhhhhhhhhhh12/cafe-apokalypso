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
  migrateRawSave,
  CURRENT_GAME_STATE_VERSION,
  CURRENT_CONTENT_CATALOG_VERSION
} from "../src/game/engine/gameState";
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

describe("save migration", () => {
  /** A save as the v8 release actually wrote it: version 8, two décor
      slots, no dailyOverhead in summaries, helper still named "mira". */
  function makeRealV8Save(day = 1, extra: Record<string, unknown> = {}) {
    return JSON.stringify({
      ...createInitialGameState(),
      version: 8,
      contentCatalogVersion: CURRENT_CONTENT_CATALOG_VERSION,
      day,
      decor: { plant: 1, shelf: 1 }, // old save: missing clock / lamp / cups
      ...extra
    });
  }

  it("migrateRawSave fills in missing décor slots with tier 1", () => {
    const raw = JSON.parse(makeRealV8Save());
    const migrated = migrateRawSave(raw) as { decor: Record<string, number> };

    expect(migrated.decor.plant).toBe(1);
    expect(migrated.decor.shelf).toBe(1);
    expect(migrated.decor.clock).toBe(1);
    expect(migrated.decor.lamp).toBe(1);
    expect(migrated.decor.cups).toBe(1);
  });

  it("migrateRawSave does not overwrite existing décor values", () => {
    const raw = JSON.parse(makeRealV8Save());
    (raw as Record<string, unknown>).decor = { plant: 2, shelf: 3, clock: 2 };
    const migrated = migrateRawSave(raw) as { decor: Record<string, number> };

    expect(migrated.decor.plant).toBe(2);
    expect(migrated.decor.shelf).toBe(3);
    expect(migrated.decor.clock).toBe(2);
    expect(migrated.decor.lamp).toBe(1);  // patched
    expect(migrated.decor.cups).toBe(1);  // patched
  });

  it("migrateRawSave upgrades version 8 to the current schema", () => {
    const migrated = migrateRawSave(JSON.parse(makeRealV8Save())) as {
      version: number;
    };
    expect(migrated.version).toBe(CURRENT_GAME_STATE_VERSION);
  });

  it("loadGameState migrates a real v8 save instead of resetting to a new game", () => {
    const storage = createMemoryStorage(makeRealV8Save(3));
    const state = loadGameState(storage);

    // Should have kept day 3, not reset to day 1 fresh game
    expect(state.day).toBe(3);
    expect(state.version).toBe(CURRENT_GAME_STATE_VERSION);
    expect(state.decor).toEqual({ plant: 1, shelf: 1, clock: 1, lamp: 1, cups: 1 });
  });

  it("loadGameState keeps a v8 day-end save lacking dailyOverhead", () => {
    const summary = {
      day: 2,
      rating: "Solide",
      moneyEarned: 30,
      moneySpent: 12,
      customersServed: 4,
      suppliesUsed: { coffee: 4, milk: 3, pastries: 2 },
      suppliesRestocked: { coffee: 0, milk: 0, pastries: 0 },
      suppliesRemaining: { coffee: 8, milk: 5, pastries: 4 },
      cleanlinessLabel: "Clean",
      stressLabel: "Calm",
      reputationDelta: 1,
      objectiveTitle: "Test",
      objectiveCompleted: true,
      helperRecap: null,
      stressEvent: null,
      flavorLines: []
      // no dailyOverhead — the field did not exist in v8
    };
    const storage = createMemoryStorage(
      makeRealV8Save(2, { dayPhase: "day_end", daySummary: summary })
    );
    const state = loadGameState(storage);

    expect(state.day).toBe(2);
    expect(state.daySummary?.dailyOverhead).toBe(0);
  });

  it("loadGameState renames the v8 helper 'mira' to 'nele'", () => {
    const helperAssignment = {
      helperId: "mira",
      taskId: "service",
      locked: false,
      dailyCost: 10,
      flavorLine: "Hilft aus."
    };
    const storage = createMemoryStorage(makeRealV8Save(4, { helperAssignment }));
    const state = loadGameState(storage);

    expect(state.day).toBe(4);
    expect(state.helperAssignment?.helperId).toBe("nele");
  });

  it("migrateRawSave adds staffXp: {} to a v9 save", () => {
    const raw = { ...createInitialGameState(), version: 9 } as Record<string, unknown>;
    delete raw.staffXp;
    const migrated = migrateRawSave(raw) as { version: number; staffXp: unknown };
    expect(migrated.version).toBe(CURRENT_GAME_STATE_VERSION);
    expect(migrated.staffXp).toEqual({});
  });

  it("migrateRawSave adds run metadata and guest memory to a v10 save", () => {
    const raw = { ...createInitialGameState(), version: 10 } as Record<string, unknown>;
    delete raw.run;
    delete raw.guestMemory;
    const migrated = migrateRawSave(raw) as {
      version: number;
      run: { modifierIds: unknown[]; memoryFragments: unknown[] };
      guestMemory: unknown;
    };

    expect(migrated.version).toBe(CURRENT_GAME_STATE_VERSION);
    expect(migrated.run.modifierIds).toHaveLength(7);
    expect(migrated.run.memoryFragments).toEqual([]);
    expect(migrated.guestMemory).toEqual({});
  });

  it("migrateRawSave chains v8 → v9 → v10 → v11 in one pass", () => {
    const raw = JSON.parse(makeRealV8Save()) as Record<string, unknown>;
    delete raw.staffXp;
    delete raw.run;
    delete raw.guestMemory;
    const migrated = migrateRawSave(raw) as { version: number; staffXp: unknown };
    expect(migrated.version).toBe(CURRENT_GAME_STATE_VERSION);
    expect(migrated.staffXp).toEqual({});
  });

  it("migrateRawSave is a no-op for non-objects", () => {
    expect(migrateRawSave(null)).toBeNull();
    expect(migrateRawSave("string")).toBe("string");
    expect(migrateRawSave(42)).toBe(42);
  });

  it("migrateRawSave v12 → v13: adds equipment {machine:1, seating:1} to an old open-café save", () => {
    const raw = { ...createInitialGameState(), version: 12 } as Record<string, unknown>;
    delete (raw as Record<string, unknown>).equipment;
    const migrated = migrateRawSave(raw) as {
      version: number;
      equipment: Record<string, number>;
    };
    expect(migrated.version).toBe(CURRENT_GAME_STATE_VERSION);
    expect(migrated.equipment).toEqual({ machine: 1, seating: 1 });
  });

  it("migrateRawSave v12 → v13: does not overwrite equipment that already exists", () => {
    const raw = {
      ...createInitialGameState(),
      version: 12,
      equipment: { machine: 2, seating: 0 }
    } as Record<string, unknown>;
    const migrated = migrateRawSave(raw) as { equipment: Record<string, number> };
    expect(migrated.equipment).toEqual({ machine: 2, seating: 0 });
  });
});
