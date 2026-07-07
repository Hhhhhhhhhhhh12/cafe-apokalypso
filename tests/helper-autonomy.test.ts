import { describe, expect, it } from "vitest";
import { gameReducer } from "../src/game/engine/reducer";
import {
  createInitialGameState,
  migrateRawSave,
  CURRENT_GAME_STATE_VERSION
} from "../src/game/engine/gameState";
import { getHelperAutonomyLevel, createInitialDayManagement } from "../src/game/engine/management";
import { getHelperAutonomyInfo } from "../src/game/engine/selectors";
import type { GameState } from "../src/game/types/game";

/** Day-N open state with staff unlocked and generous AP/supplies. */
function openDayWithHelper(day: number, withHelper: boolean): GameState {
  let state: GameState = {
    ...createInitialGameState(),
    day: day as GameState["day"],
    dayPhase: "day_start",
    supplies: { coffee: 12, milk: 8, pastries: 6 },
    unlocks: {
      pricing: true,
      advertising: true,
      staff: true,
      kassandra: false,
      apocalypseOperations: false
    },
    dayManagement: {
      ...createInitialDayManagement(25, day as GameState["day"]),
      actionPointsRemaining: 8,
      helperDecisionMade: !withHelper
    }
  };
  if (withHelper) {
    state = gameReducer(state, { type: "select_helper", helperId: "jana", taskId: "cleaning" });
  }
  return gameReducer(state, { type: "open_day" });
}

describe("autonomy schedule (#132)", () => {
  it("advances micromanagement → learning → autonomous by day", () => {
    expect(getHelperAutonomyLevel(1)).toBe("micromanagement");
    expect(getHelperAutonomyLevel(2)).toBe("micromanagement");
    expect(getHelperAutonomyLevel(3)).toBe("learning");
    expect(getHelperAutonomyLevel(4)).toBe("autonomous");
    expect(getHelperAutonomyLevel(7)).toBe("autonomous");
  });

  it("stamps the level onto each new day's management state", () => {
    expect(createInitialDayManagement(25, 1).autonomyLevel).toBe("micromanagement");
    expect(createInitialDayManagement(25, 3).autonomyLevel).toBe("learning");
    expect(createInitialDayManagement(25, 5).autonomyLevel).toBe("autonomous");
  });

  it("starts each day with zeroed helper counters", () => {
    const dm = createInitialDayManagement(25, 4);
    expect(dm.helperCupsCleared).toBe(0);
    expect(dm.helperAutonomousServes).toBe(0);
  });
});

describe("learning helper (Day 3)", () => {
  it("clears a cup after each serve: +1 cleanliness vs. no helper", () => {
    const withHelper = gameReducer(openDayWithHelper(3, true), {
      type: "serve_product",
      productId: "filterkaffee"
    });
    const withoutHelper = gameReducer(openDayWithHelper(3, false), {
      type: "serve_product",
      productId: "filterkaffee"
    });

    expect(withHelper.resources.cleanliness).toBe(withoutHelper.resources.cleanliness + 1);
    expect(withHelper.dayManagement.helperCupsCleared).toBe(1);
    expect(withoutHelper.dayManagement.helperCupsCleared).toBe(0);
  });

  it("announces the first initiative once", () => {
    const first = gameReducer(openDayWithHelper(3, true), {
      type: "serve_product",
      productId: "filterkaffee"
    });
    expect(first.statusMessage).toContain("I noticed the cup was empty and cleared it.");

    const second = gameReducer(first, { type: "serve_product", productId: "filterkaffee" });
    expect(second.statusMessage).not.toContain("I noticed the cup was empty");
    expect(second.dayManagement.helperCupsCleared).toBe(2);
  });

  it("does not serve guests on its own while learning", () => {
    let state = openDayWithHelper(3, true);
    state = gameReducer(state, { type: "serve_product", productId: "filterkaffee" });
    state = gameReducer(state, { type: "serve_product", productId: "filterkaffee" });
    state = gameReducer(state, { type: "serve_product", productId: "filterkaffee" });
    expect(state.dayManagement.helperAutonomousServes).toBe(0);
  });
});

describe("autonomous helper (Day 4+)", () => {
  it("serves one regular unprompted after the player's second serve", () => {
    let state = openDayWithHelper(4, true);
    state = gameReducer(state, { type: "serve_product", productId: "filterkaffee" });
    expect(state.dayManagement.helperAutonomousServes).toBe(0);

    const coffeeBefore = state.supplies.coffee;
    const moneyBefore = state.resources.money;
    state = gameReducer(state, { type: "serve_product", productId: "filterkaffee" });

    expect(state.dayManagement.helperAutonomousServes).toBe(1);
    // player serve + helper serve both advanced the queue
    expect(state.dayManagement.customersServed).toBe(3);
    // player serve + helper serve each used one coffee
    expect(state.supplies.coffee).toBe(coffeeBefore - 2);
    expect(state.resources.money).toBeGreaterThan(moneyBefore);
    expect(state.statusMessage).toContain("hands a filter coffee across the counter");
  });

  it("only serves autonomously once per day", () => {
    let state = openDayWithHelper(4, true);
    for (let i = 0; i < 4; i += 1) {
      state = gameReducer(state, { type: "serve_product", productId: "filterkaffee" });
    }
    expect(state.dayManagement.helperAutonomousServes).toBe(1);
  });

  it("clears cups faster than a learning helper (+2 cleanliness)", () => {
    const withHelper = gameReducer(openDayWithHelper(4, true), {
      type: "serve_product",
      productId: "filterkaffee"
    });
    const withoutHelper = gameReducer(openDayWithHelper(4, false), {
      type: "serve_product",
      productId: "filterkaffee"
    });
    expect(withHelper.resources.cleanliness).toBe(withoutHelper.resources.cleanliness + 2);
  });

  it("stays idle without an assigned helper", () => {
    let state = openDayWithHelper(4, false);
    state = gameReducer(state, { type: "serve_product", productId: "filterkaffee" });
    state = gameReducer(state, { type: "serve_product", productId: "filterkaffee" });
    expect(state.dayManagement.helperCupsCleared).toBe(0);
    expect(state.dayManagement.helperAutonomousServes).toBe(0);
  });
});

describe("selector + migration", () => {
  it("getHelperAutonomyInfo exposes level, assignment, and counters", () => {
    const state = openDayWithHelper(4, true);
    const info = getHelperAutonomyInfo(state);
    expect(info.level).toBe("autonomous");
    expect(info.helperAssigned).toBe(true);
    expect(info.cupsCleared).toBe(0);
    expect(info.autonomousServes).toBe(0);
  });

  it("migrates a v16 save: backfills level from day and zeroes counters", () => {
    const raw = { ...createInitialGameState(), version: 16, day: 4 } as Record<string, unknown>;
    const dm = { ...(raw.dayManagement as Record<string, unknown>) };
    delete dm.autonomyLevel;
    delete dm.helperCupsCleared;
    delete dm.helperAutonomousServes;
    raw.dayManagement = dm;

    const migrated = migrateRawSave(raw) as {
      version: number;
      dayManagement: { autonomyLevel: string; helperCupsCleared: number; helperAutonomousServes: number };
    };
    expect(migrated.version).toBe(CURRENT_GAME_STATE_VERSION);
    expect(migrated.dayManagement.autonomyLevel).toBe("autonomous");
    expect(migrated.dayManagement.helperCupsCleared).toBe(0);
    expect(migrated.dayManagement.helperAutonomousServes).toBe(0);
  });
});
