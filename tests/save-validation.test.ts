import { describe, expect, it } from "vitest";
import {
  createFreshRunState,
  createInitialGameState,
  CURRENT_GAME_STATE_VERSION,
  isValidGameState
} from "../src/game/engine/gameState";
import { loadGameState, SAVE_KEY, type StorageLike } from "../src/game/engine/save";

function loadRaw(raw: string) {
  const storage: StorageLike = {
    getItem: (key) => key === SAVE_KEY ? raw : null,
    setItem: () => {},
    removeItem: () => {}
  };
  return loadGameState(storage);
}

function expectRejected(candidate: unknown) {
  expect(isValidGameState(candidate)).toBe(false);
  expect(loadRaw(JSON.stringify(candidate))).toEqual(createFreshRunState());
}

describe("save validation: management counters", () => {
  const counterFields = ["actionsWithoutServing", "helperAutonomousActions"] as const;
  const invalidCounters = [undefined, null, "1", -1, 0.5, NaN, Infinity, -Infinity];

  it.each(counterFields.flatMap((field) => invalidCounters.map((value) => [field, value] as const)))(
    "rejects current saves with %s = %s",
    (field, value) => {
      const state = createInitialGameState();
      expectRejected({
        ...state,
        day: 4,
        dayManagement: { ...state.dayManagement, [field]: value }
      });
    }
  );

  it.each([15, 16])("migrates missing counters from schema %i without losing progress", (version) => {
    const state = createInitialGameState();
    const dayManagement: Record<string, unknown> = { ...state.dayManagement };
    if (version === 15) delete dayManagement.actionsWithoutServing;
    delete dayManagement.helperAutonomousActions;

    const loaded = loadRaw(JSON.stringify({ ...state, version, day: 4, dayManagement }));
    expect(loaded.version).toBe(CURRENT_GAME_STATE_VERSION);
    expect(loaded.day).toBe(4);
    expect(loaded.dayManagement.actionsWithoutServing).toBe(0);
    expect(loaded.dayManagement.helperAutonomousActions).toBe(0);
  });

  it("preserves valid legacy counters and budgets above a day's base allowance", () => {
    const state = createInitialGameState();
    const dayManagement = {
      ...state.dayManagement,
      actionsWithoutServing: 6,
      helperAutonomousActions: 8,
      actionPointsRemaining: 10
    };
    const loaded = loadRaw(JSON.stringify({ ...state, version: 16, dayManagement }));
    expect(loaded.dayManagement).toEqual(dayManagement);
  });

  it.each([
    { actionPointsRemaining: -1 },
    { customersServed: 0.5 },
    { moneyEarned: Infinity },
    { reputationAtStart: 101 },
    { currentGuestPatience: 75, currentGuestPatienceMax: 50 }
  ])("rejects invalid management values %j", (patch) => {
    const state = createInitialGameState();
    expectRejected({ ...state, dayManagement: { ...state.dayManagement, ...patch } });
  });
});

describe("save validation: numeric resources", () => {
  it.each([
    { money: -0.01 }, { money: NaN }, { money: Infinity },
    { reputation: -1 }, { reputation: 101 },
    { cleanliness: -1 }, { cleanliness: Infinity },
    { stress: 101 }, { stress: -Infinity }
  ])("rejects invalid resources %j", (patch) => {
    const state = createInitialGameState();
    expectRejected({ ...state, resources: { ...state.resources, ...patch } });
  });

  it("rejects numeric overflow in actual JSON rather than just null from stringify", () => {
    const state = createInitialGameState();
    const raw = JSON.stringify({ ...state, resources: { ...state.resources, money: "overflow" } })
      .replace('"overflow"', "1e309");
    expect(loadRaw(raw)).toEqual(createFreshRunState());
  });

  it("preserves decimal money above 100 and both meter boundaries", () => {
    const state = {
      ...createInitialGameState(),
      resources: { money: 1234.56, reputation: 0, cleanliness: 100, stress: 100, mood: "strained" }
    };
    expect(isValidGameState(state)).toBe(true);
    expect(loadRaw(JSON.stringify(state))).toEqual(state);
  });

  it.each([{ hiddenWeirdness: Infinity }, { hiddenWeirdness: -1 }, { reputationZeroStreak: 0.5 }])(
    "rejects invalid top-level progress %j",
    (patch) => expectRejected({ ...createInitialGameState(), ...patch })
  );
});

describe("save validation: helpers and summaries", () => {
  const helper = {
    helperId: "jana", taskId: "cleaning", locked: true,
    dailyCost: 14, flavorLine: "Watching the floor.", autonomyLevel: "learning"
  };

  it.each(["toString", "constructor", "__proto__"])("rejects prototype helper name %s without throwing", (helperId) => {
    expectRejected({ ...createInitialGameState(), helperAssignment: { ...helper, helperId } });
  });

  it.each([-1, Infinity])("rejects invalid helper cost %s", (dailyCost) => {
    expectRejected({ ...createInitialGameState(), helperAssignment: { ...helper, dailyCost } });
  });

  const summary = {
    day: 4, rating: "Busy Shift", moneyEarned: 12.34, moneySpent: 2.5, dailyOverhead: 6,
    customersServed: 3, guestsLost: 1, bestServeStreak: 2,
    suppliesUsed: { coffee: 3, milk: 1, pastries: 0 },
    suppliesRestocked: { coffee: 0, milk: 0, pastries: 0 },
    suppliesRemaining: { coffee: 9, milk: 7, pastries: 6 },
    cleanlinessLabel: "Tidy", stressLabel: "Busy", reputationDelta: -2,
    objectiveTitle: "Close the shift", objectiveCompleted: false,
    helperRecap: null, stressEvent: null, flavorLines: []
  };

  it.each([
    { day: 8 }, { moneySpent: -1 }, { dailyOverhead: Infinity },
    { reputationDelta: NaN }, { guestsLost: undefined }, { bestServeStreak: -1 },
    { helperAutonomyRecap: 42 }
  ])("rejects invalid summary values %j", (patch) => {
    expectRejected({ ...createInitialGameState(), daySummary: { ...summary, ...patch } });
  });

  it("preserves negative reputation deltas and usage totals above current shelf capacity", () => {
    const state = createInitialGameState();
    const suppliesUsed = { coffee: 25, milk: 22, pastries: 14 };
    const candidate = {
      ...state,
      dayManagement: { ...state.dayManagement, suppliesUsed },
      daySummary: { ...summary, suppliesUsed }
    };
    expect(isValidGameState(candidate)).toBe(true);
    expect(loadRaw(JSON.stringify(candidate))).toEqual(candidate);
  });
});
