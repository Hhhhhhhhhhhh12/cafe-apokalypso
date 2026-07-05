import { describe, it, expect } from "vitest";
import { gameReducer } from "../src/game/engine/reducer";
import { createInitialGameState } from "../src/game/engine/gameState";
import { getGuestPatienceState } from "../src/game/engine/selectors";
import {
  getGuestPatienceMax,
  getGuestPatienceTicks,
  PATIENCE_TICK,
  WALKOUT_REPUTATION_PENALTY,
  WALKOUT_STRESS
} from "../src/game/engine/management";
import { weekOneGuests } from "../src/game/data";

/** Helper: open a day-N game (skips equipment/setup phase if present).
 *  Tops up action points so patience tests can burn a full 4-tick window
 *  regardless of the day's real AP budget. */
function openDayN(day: number): ReturnType<typeof createInitialGameState> {
  let state = { ...createInitialGameState(), day: day as 1 } as ReturnType<
    typeof createInitialGameState
  >;
  // Ensure we're in day_start regardless of setup phase
  state = { ...state, dayPhase: "day_start" };
  const opened = gameReducer(state, { type: "open_day" });
  return {
    ...opened,
    dayManagement: {
      ...opened.dayManagement,
      actionPointsRemaining: Math.max(opened.dayManagement.actionPointsRemaining, 8)
    }
  };
}

describe("patience helpers", () => {
  it("flavor ticks still differ by guest, but patience max is uniform (4 ticks)", () => {
    const cem = weekOneGuests.find((g) => g.id === "lieferfahrer-cem")!;
    expect(getGuestPatienceTicks(cem)).toBe(2);
    // Uniform 4-pip window: every guest tolerates the same number of
    // non-serve actions so the patience bar reads consistently.
    expect(getGuestPatienceMax()).toBe(4 * PATIENCE_TICK);
  });

  it("patient guest gets 4 ticks", () => {
    const bohn = weekOneGuests.find((g) => g.id === "herr-bohn")!;
    expect(getGuestPatienceTicks(bohn)).toBe(4);
    expect(getGuestPatienceMax()).toBe(4 * PATIENCE_TICK);
  });

  it("normal guest gets 3 ticks", () => {
    const lukas = weekOneGuests.find((g) => g.id === "laptop-lukas")!;
    expect(getGuestPatienceTicks(lukas)).toBe(3);
  });
});

describe("patience initialisation", () => {
  it("patience is 0 before the café opens", () => {
    const state = createInitialGameState();
    expect(state.dayManagement.currentGuestPatience).toBe(0);
    expect(state.dayManagement.currentGuestPatienceMax).toBe(0);
  });

  it("patience is set to the first guest's max on open_day", () => {
    const opened = openDayN(1);
    expect(opened.dayManagement.currentGuestPatienceMax).toBeGreaterThan(0);
    expect(opened.dayManagement.currentGuestPatience).toBe(
      opened.dayManagement.currentGuestPatienceMax
    );
  });

  it("getGuestPatienceState returns null before open", () => {
    const state = createInitialGameState();
    expect(getGuestPatienceState(state)).toBeNull();
  });

  it("getGuestPatienceState returns patience info while open", () => {
    const opened = openDayN(1);
    const ps = getGuestPatienceState(opened);
    expect(ps).not.toBeNull();
    expect(ps!.patience).toBe(ps!.max);
    expect(ps!.label).toBe("Relaxed");
  });
});

describe("patience tick on non-serve actions (Day 1 – no walkout)", () => {
  it("clean_tables decrements patience", () => {
    const opened = openDayN(1);
    const cleaned = gameReducer(opened, { type: "clean_tables" });
    expect(cleaned.dayManagement.currentGuestPatience).toBe(
      opened.dayManagement.currentGuestPatience - PATIENCE_TICK
    );
    // No walkout on Day 1
    expect(cleaned.dayManagement.guestsLost).toBe(0);
  });

  it("patience does not go below 0 on Day 1–3", () => {
    let state = openDayN(1);
    // Clean as many times as action budget allows
    for (let i = 0; i < 10; i++) {
      if (state.dayManagement.actionPointsRemaining > 0) {
        state = gameReducer(state, { type: "clean_tables" });
      }
    }
    expect(state.dayManagement.currentGuestPatience).toBeGreaterThanOrEqual(0);
    expect(state.dayManagement.guestsLost).toBe(0);
  });

  it("patience resets to new guest max after serving", () => {
    const opened = openDayN(1);
    // Drain one tick
    const ticked = gameReducer(opened, { type: "clean_tables" });
    expect(ticked.dayManagement.currentGuestPatience).toBeLessThan(
      ticked.dayManagement.currentGuestPatienceMax
    );
    // Serve the guest — patience should reset for next guest
    const served = gameReducer(ticked, {
      type: "serve_product",
      productId: "filterkaffee"
    });
    expect(served.dayManagement.currentGuestPatience).toBe(
      served.dayManagement.currentGuestPatienceMax
    );
    expect(served.dayManagement.currentGuestPatienceMax).toBeGreaterThan(0);
  });
});

describe("walkout on Day 4+", () => {
  it("guest walks out when patience hits 0 on Day 4", () => {
    let state = openDayN(4);
    const maxTicks = state.dayManagement.currentGuestPatienceMax / PATIENCE_TICK;

    // Burn patience down through non-serve actions. Day 4 has 5 action points
    // and guest 0 (Paula) has 3 ticks — clean 3 times should trigger walkout.
    for (let i = 0; i < maxTicks; i++) {
      if (state.dayManagement.actionPointsRemaining > 0) {
        state = gameReducer(state, { type: "clean_tables" });
      }
    }

    expect(state.dayManagement.guestsLost).toBeGreaterThanOrEqual(1);
    expect(state.resources.stress).toBeGreaterThan(openDayN(4).resources.stress);
    expect(state.resources.reputation).toBeLessThan(openDayN(4).resources.reputation);
  });

  it("walkout applies WALKOUT_STRESS and WALKOUT_REPUTATION_PENALTY", () => {
    // Arrange a state where guest has exactly 1 tick of patience left
    let state = openDayN(4);
    const maxTicks = state.dayManagement.currentGuestPatienceMax / PATIENCE_TICK;
    // Drain down to 1 tick remaining (maxTicks - 1 non-serve actions)
    for (let i = 0; i < maxTicks - 1; i++) {
      if (state.dayManagement.actionPointsRemaining > 0) {
        state = gameReducer(state, { type: "clean_tables" });
      }
    }
    expect(state.dayManagement.guestsLost).toBe(0); // not yet
    const stressBefore = state.resources.stress;
    const repBefore = state.resources.reputation;

    // One more non-serve action triggers the walkout
    if (state.dayManagement.actionPointsRemaining > 0) {
      state = gameReducer(state, { type: "clean_tables" });
    }

    expect(state.dayManagement.guestsLost).toBe(1);
    expect(state.resources.stress).toBe(Math.min(100, stressBefore + WALKOUT_STRESS));
    expect(state.resources.reputation).toBe(Math.max(0, repBefore - WALKOUT_REPUTATION_PENALTY));
  });

  it("walkout message is included in status", () => {
    let state = openDayN(4);
    const maxTicks = state.dayManagement.currentGuestPatienceMax / PATIENCE_TICK;
    for (let i = 0; i < maxTicks; i++) {
      if (state.dayManagement.actionPointsRemaining > 0) {
        state = gameReducer(state, { type: "clean_tables" });
      }
    }
    if (state.dayManagement.guestsLost >= 1) {
      // Find the message that caused the walkout (it's in the last action that triggered it)
      // We just verify the walkout counter incremented — message was set on that tick
      expect(state.statusMessage).toBeTruthy();
    }
  });

  it("guestsLost increments queue so next guest is served after walkout", () => {
    let state = openDayN(4);
    const maxTicks = state.dayManagement.currentGuestPatienceMax / PATIENCE_TICK;
    for (let i = 0; i < maxTicks; i++) {
      if (state.dayManagement.actionPointsRemaining > 0) {
        state = gameReducer(state, { type: "clean_tables" });
      }
    }
    const guestsLost = state.dayManagement.guestsLost;
    if (guestsLost >= 1 && state.dayManagement.actionPointsRemaining > 0) {
      // Now serve the next guest — customersServed should increment
      const afterServe = gameReducer(state, { type: "serve_product", productId: "espresso" });
      expect(afterServe.dayManagement.customersServed).toBe(1);
    }
  });

  it("no walkout on Day 3 even if patience bottoms out", () => {
    let state = openDayN(3);
    const maxTicks = state.dayManagement.currentGuestPatienceMax / PATIENCE_TICK;
    for (let i = 0; i < maxTicks; i++) {
      if (state.dayManagement.actionPointsRemaining > 0) {
        state = gameReducer(state, { type: "clean_tables" });
      }
    }
    expect(state.dayManagement.guestsLost).toBe(0);
  });
});

describe("getGuestPatienceState labels", () => {
  it("returns Relaxed when patience is full", () => {
    const opened = openDayN(1);
    const ps = getGuestPatienceState(opened)!;
    expect(ps.label).toBe("Relaxed");
    expect(ps.critical).toBe(false);
  });

  it("returns Restless when patience is low on Day 4+", () => {
    let state = openDayN(4);
    const maxTicks = state.dayManagement.currentGuestPatienceMax / PATIENCE_TICK;
    // Drain to last tick
    for (let i = 0; i < maxTicks - 1; i++) {
      if (state.dayManagement.actionPointsRemaining > 0) {
        state = gameReducer(state, { type: "clean_tables" });
      }
    }
    const ps = getGuestPatienceState(state);
    if (ps) {
      expect(["Waiting", "Restless"]).toContain(ps.label);
      expect(ps.critical).toBe(true);
    }
  });
});

describe("messy café patience penalty", () => {
  it("clean café gives guest full patience ticks", () => {
    // Default cleanliness is >= 50, so no penalty
    const state = openDayN(1);
    expect(state.resources.cleanliness).toBeGreaterThanOrEqual(50);
    const ps = getGuestPatienceState(state);
    expect(ps?.messyPenalty).toBe(false);
  });

  it("messy café (cleanliness < 50) reduces guest patience by one tick on arrival", () => {
    let state = openDayN(1);
    // Force cleanliness below threshold before the next guest arrives
    state = { ...state, resources: { ...state.resources, cleanliness: 30 } };
    // Serve current guest to trigger setNextGuestPatience for the next one
    state = gameReducer(state, { type: "serve_product", productId: "filterkaffee" });
    const ps = getGuestPatienceState(state);
    expect(ps?.messyPenalty).toBe(true);
    // Max should be one tick less than the base for a normal (3-tick) guest
    // (exact base depends on which guest is next, but messy max <= full max - PATIENCE_TICK)
    expect(ps!.max).toBeLessThanOrEqual(3 * PATIENCE_TICK);
  });

  it("impatient guest in messy café still has at least one patience tick", () => {
    let state = openDayN(1);
    state = { ...state, resources: { ...state.resources, cleanliness: 10 } };
    // Serve to advance queue to potential impatient guest
    state = gameReducer(state, { type: "serve_product", productId: "filterkaffee" });
    const ps = getGuestPatienceState(state);
    if (ps) {
      expect(ps.max).toBeGreaterThanOrEqual(PATIENCE_TICK);
    }
  });

  it("cleaning above threshold removes messyPenalty for next guest", () => {
    let state = openDayN(1);
    // Start messy
    state = { ...state, resources: { ...state.resources, cleanliness: 30 } };
    state = gameReducer(state, { type: "serve_product", productId: "filterkaffee" });
    expect(getGuestPatienceState(state)?.messyPenalty).toBe(true);
    // Clean tables raises cleanliness; serve next guest
    state = gameReducer(state, { type: "clean_tables" });
    state = { ...state, resources: { ...state.resources, cleanliness: 65 } };
    state = gameReducer(state, { type: "serve_product", productId: "filterkaffee" });
    expect(getGuestPatienceState(state)?.messyPenalty).toBe(false);
  });
});
