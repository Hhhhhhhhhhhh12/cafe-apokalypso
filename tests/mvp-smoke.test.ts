/**
 * AUFGABE 2 — MVP Smoke Test (state/data checks, no browser integration)
 *
 * Verifies the game-flow invariants described in docs/QUALITY_CHECKLIST.md
 * §"MVP Smoke Test" using state and data checks only.
 */
import { describe, expect, it } from "vitest";
import {
  createInitialGameState,
  CURRENT_GAME_STATE_VERSION
} from "../src/game/engine/gameState";
import { gameReducer } from "../src/game/engine/reducer";
import {
  getCurrentDayDefinition,
  getCurrentDayEvents,
  getVisibleDaySevenLetter,
  getVisibleKassandraMessages,
  getVisibleStaffOptions
} from "../src/game/engine/selectors";
import {
  weekOneDays,
  weekOneEvents,
  weekOneGuests,
  weekOneStaffOptions,
  weekOneAdvertisingCampaigns
} from "../src/game/data";
import type { DayNumber } from "../src/game/types/content";
import type { GameState } from "../src/game/types/game";

// ---------------------------------------------------------------------------
// Helper: matches the canonical pattern in tests/management-tradeoff.test.ts
// ---------------------------------------------------------------------------
function createDayStartState(day: DayNumber): GameState {
  return {
    ...createInitialGameState(),
    day,
    dayPhase: "day_start",
    phaseLabel: `Day ${day}`,
    unlocks: {
      pricing: day >= 3,
      advertising: day >= 4,
      staff: day >= 3,
      kassandra: day >= 6,
      apocalypseOperations: false
    },
    kassandraInstalled: day >= 6
  };
}

// ---------------------------------------------------------------------------
// Day 1 — order-flow events and core actions
// ---------------------------------------------------------------------------
describe("mvp-smoke: Day 1 initial state", () => {
  it("starts at day 1 in open phase", () => {
    const state = createInitialGameState();
    expect(state.day).toBe(1);
    expect(state.dayPhase).toBe("open");
  });

  it("has the core order-flow event 'day-1-opening-rhythm'", () => {
    const state = createInitialGameState();
    const events = getCurrentDayEvents(state);
    const ids = events.map((e) => e.id);
    expect(ids).toContain("day-1-opening-rhythm");
  });

  it("has the coffee-machine-flicker anomaly event on day 1", () => {
    const state = createInitialGameState();
    const events = getCurrentDayEvents(state);
    const ids = events.map((e) => e.id);
    expect(ids).toContain("day-1-coffee-machine-flicker");
  });

  it("unlocks the four core actions on day 1", () => {
    const dayDef = weekOneDays.find((d) => d.day === 1)!;
    expect(dayDef.unlocks).toContain("take order");
    expect(dayDef.unlocks).toContain("prepare coffee");
    expect(dayDef.unlocks).toContain("accept payment");
    expect(dayDef.unlocks).toContain("clean tables");
  });

  it("can take an order on day 1 without errors", () => {
    const state = createInitialGameState();
    const next = gameReducer(state, { type: "take_order" });
    expect(next.dayManagement.customersServed).toBe(1);
  });

  it("does not expose weirdness on day 1", () => {
    const state = createInitialGameState();
    expect(state.weirdnessVisible).toBe(false);
    expect(getVisibleDaySevenLetter(state)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Day 4 — advertising unlocks and Herr Grau
// ---------------------------------------------------------------------------
describe("mvp-smoke: Day 4 advertising", () => {
  it("unlocks advertising flag on day 4", () => {
    const state = createDayStartState(4);
    expect(state.unlocks.advertising).toBe(true);
  });

  it("advertising campaigns include at least one campaign available from day 4", () => {
    const day4Campaigns = weekOneAdvertisingCampaigns.filter((c) => c.unlockDay <= 4);
    expect(day4Campaigns.length).toBeGreaterThanOrEqual(1);
  });

  it("day 4 advertising campaigns include 'flyer-nachbarschaft'", () => {
    const day4Campaigns = weekOneAdvertisingCampaigns.filter((c) => c.unlockDay <= 4);
    const ids = day4Campaigns.map((c) => c.id);
    expect(ids).toContain("flyer-nachbarschaft");
  });

  it("Herr Grau (firstDay 4) appears in day 4 guest list", () => {
    const state = createDayStartState(4);
    const dayDef = getCurrentDayDefinition(state);
    expect(dayDef.guestIds).toContain("herr-grau");
  });

  it("Herr Grau guest data has firstDay === 4", () => {
    const herrGrau = weekOneGuests.find((g) => g.id === "herr-grau");
    expect(herrGrau).toBeDefined();
    expect(herrGrau!.firstDay).toBe(4);
  });

  it("day 4 has advertising-related events (herr-grau-coin, flyer-wrong-address)", () => {
    const state = createDayStartState(4);
    const events = getCurrentDayEvents(state);
    const ids = events.map((e) => e.id);
    expect(ids).toContain("day-4-herr-grau-coin");
    expect(ids).toContain("day-4-flyer-wrong-address");
  });

  it("flyer advertising costs money and increases reputation on day 4", () => {
    let state = createDayStartState(4);
    // Open the day (day 4 starts in day_start phase)
    state = gameReducer(state, { type: "open_day" });
    const moneyBefore = state.resources.money;
    const repBefore = state.resources.reputation;

    const next = gameReducer(state, { type: "run_advertising", adType: "flyer" });
    expect(next.resources.money).toBeLessThan(moneyBefore);
    expect(next.resources.reputation).toBeGreaterThan(repBefore);
  });

  it("weirdness is still hidden on day 4", () => {
    const state = createDayStartState(4);
    expect(state.weirdnessVisible).toBe(false);
    expect(getVisibleDaySevenLetter(state)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Day 5 — staff options
// ---------------------------------------------------------------------------
describe("mvp-smoke: Day 5 staff options", () => {
  it("unlocks the staff flag on day 5", () => {
    const state = createDayStartState(5);
    expect(state.unlocks.staff).toBe(true);
  });

  it("getVisibleStaffOptions returns at least one option on day 5", () => {
    const state = createDayStartState(5);
    const options = getVisibleStaffOptions(state);
    expect(options.length).toBeGreaterThanOrEqual(1);
  });

  it("all three staff options (Jana, Nino, Nele) are visible on day 5", () => {
    const state = createDayStartState(5);
    const options = getVisibleStaffOptions(state);
    const ids = options.map((o) => o.id);
    expect(ids).toContain("jana");
    expect(ids).toContain("nino");
    expect(ids).toContain("nele");
  });

  it("all week-one staff options have unlockDay <= 3 (available from day 3)", () => {
    for (const opt of weekOneStaffOptions) {
      expect(opt.unlockDay).toBeLessThanOrEqual(3);
    }
  });

  it("day 5 includes Meda as a guest", () => {
    const state = createDayStartState(5);
    const dayDef = getCurrentDayDefinition(state);
    expect(dayDef.guestIds).toContain("meda");
  });

  it("day 5 has staff-delegation narrative events", () => {
    const state = createDayStartState(5);
    const events = getCurrentDayEvents(state);
    const ids = events.map((e) => e.id);
    expect(ids.some((id) => id.startsWith("day-5-"))).toBe(true);
  });

  it("weirdness remains invisible on day 5", () => {
    const state = createDayStartState(5);
    expect(state.weirdnessVisible).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Day 6 — KASSANDRA update
// ---------------------------------------------------------------------------
describe("mvp-smoke: Day 6 KASSANDRA", () => {
  it("KASSANDRA is installed on day 6", () => {
    const state = createDayStartState(6);
    expect(state.kassandraInstalled).toBe(true);
  });

  it("kassandra unlock flag is set on day 6", () => {
    const state = createDayStartState(6);
    expect(state.unlocks.kassandra).toBe(true);
  });

  it("getVisibleKassandraMessages returns at least one message on day 6", () => {
    const state = createDayStartState(6);
    const messages = getVisibleKassandraMessages(state);
    expect(messages.length).toBeGreaterThanOrEqual(1);
  });

  it("day 6 includes the KASSANDRA-update event", () => {
    const state = createDayStartState(6);
    const events = getCurrentDayEvents(state);
    const ids = events.map((e) => e.id);
    expect(ids).toContain("day-6-kassandra-update");
  });

  it("day 6 KASSANDRA-update event has 'kassandra' tone", () => {
    const kassandraUpdateEvent = weekOneEvents.find(
      (e) => e.id === "day-6-kassandra-update"
    );
    expect(kassandraUpdateEvent).toBeDefined();
    expect(kassandraUpdateEvent!.tone).toBe("kassandra");
  });

  it("KASSANDRA update event references the register update text", () => {
    const kassandraUpdateEvent = weekOneEvents.find(
      (e) => e.id === "day-6-kassandra-update"
    );
    expect(kassandraUpdateEvent!.text.toLowerCase()).toContain("kassandra");
  });

  it("getVisibleKassandraMessages returns empty before day 6", () => {
    // kassandraInstalled is false at day 4 (before day 6)
    const state = createDayStartState(4);
    const messages = getVisibleKassandraMessages(state);
    expect(messages).toHaveLength(0);
  });

  it("weirdness is still hidden on day 6 (only visible after day-7 close)", () => {
    const state = createDayStartState(6);
    expect(state.weirdnessVisible).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Day 7 — cliffhanger and letter
// ---------------------------------------------------------------------------
describe("mvp-smoke: Day 7 cliffhanger and letter", () => {
  it("day 7 definition exists and has the letter objective", () => {
    const day7 = weekOneDays.find((d) => d.day === 7);
    expect(day7).toBeDefined();
    expect(day7!.objective.id).toBe("day-7-the-letter");
  });

  it("day 7 includes the 'frau-roter-regenschirm' guest (firstDay 7)", () => {
    const state = createDayStartState(7);
    const dayDef = getCurrentDayDefinition(state);
    expect(dayDef.guestIds).toContain("frau-roter-regenschirm");
  });

  it("Frau mit rotem Regenschirm has firstDay === 7", () => {
    const frau = weekOneGuests.find((g) => g.id === "frau-roter-regenschirm");
    expect(frau).toBeDefined();
    expect(frau!.firstDay).toBe(7);
  });

  it("day 7 events include the kassandra-threshold and closing-count events", () => {
    const state = createDayStartState(7);
    const events = getCurrentDayEvents(state);
    const ids = events.map((e) => e.id);
    expect(ids).toContain("day-7-kassandra-threshold");
    expect(ids).toContain("day-7-closing-count");
  });

  it("weirdness is still hidden before day 7 is closed", () => {
    const state = createDayStartState(7);
    expect(state.weirdnessVisible).toBe(false);
    expect(getVisibleDaySevenLetter(state)).toBeNull();
  });

  it("weirdnessVisible becomes true and letter is delivered after day 7 close", () => {
    let state = createDayStartState(7);
    state = gameReducer(state, { type: "open_day" });
    state = gameReducer(state, { type: "take_order" });
    state = gameReducer(state, { type: "complete_day" });

    expect(state.demoComplete).toBe(true);
    expect(state.weirdnessVisible).toBe(true);
    expect(getVisibleDaySevenLetter(state)).not.toBeNull();
  });

  it("the letter body mentions the 'Office for Extraordinary Operational Relevance'", () => {
    let state = createDayStartState(7);
    state = gameReducer(state, { type: "open_day" });
    state = gameReducer(state, { type: "take_order" });
    state = gameReducer(state, { type: "complete_day" });

    const letter = getVisibleDaySevenLetter(state);
    expect(letter).not.toBeNull();
    expect(letter).toContain("Office for Extraordinary Operational Relevance");
  });

  it("hiddenWeirdness is never in weirdnessVisible state before day-7 close", () => {
    for (let d = 1; d <= 6; d++) {
      const state = createDayStartState(d as DayNumber);
      expect(state.weirdnessVisible).toBe(false);
    }
  });
});

// ---------------------------------------------------------------------------
// Cross-day invariants
// ---------------------------------------------------------------------------
describe("mvp-smoke: cross-day invariants", () => {
  it("every day definition has exactly one objective", () => {
    for (const dayDef of weekOneDays) {
      expect(dayDef.objective).toBeDefined();
      expect(typeof dayDef.objective.id).toBe("string");
    }
  });

  it("all 7 days have at least one event defined", () => {
    for (const dayDef of weekOneDays) {
      expect(dayDef.eventIds.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("version stays consistent across all 7 day states", () => {
    for (let d = 1; d <= 7; d++) {
      const state = d === 1
        ? createInitialGameState()
        : createDayStartState(d as DayNumber);
      expect(state.version).toBe(CURRENT_GAME_STATE_VERSION);
    }
  });

  it("KASSANDRA not installed before day 6", () => {
    for (let d = 1; d <= 5; d++) {
      const state = d === 1
        ? createInitialGameState()
        : createDayStartState(d as DayNumber);
      expect(state.kassandraInstalled).toBe(false);
    }
  });

  it("advertising does not unlock before day 4", () => {
    for (let d = 1; d <= 3; d++) {
      const state = d === 1
        ? createInitialGameState()
        : createDayStartState(d as DayNumber);
      expect(state.unlocks.advertising).toBe(false);
    }
  });

  it("staff does not unlock before day 3", () => {
    for (let d = 1; d <= 2; d++) {
      const state = d === 1
        ? createInitialGameState()
        : createDayStartState(d as DayNumber);
      expect(state.unlocks.staff).toBe(false);
    }
  });
});
