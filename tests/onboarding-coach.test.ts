import { describe, expect, it } from "vitest";
import { createInitialGameState } from "../src/game/engine/gameState";
import { getDayCoachHint } from "../src/game/engine/selectors";
import type { DayNumber } from "../src/game/types/content";
import type { GameState } from "../src/game/types/game";

function openDay(day: DayNumber, overrides: Partial<GameState> = {}): GameState {
  const base = createInitialGameState();
  return {
    ...base,
    day,
    dayPhase: "open",
    unlocks: { ...base.unlocks, pricing: day >= 3 },
    dayManagement: {
      ...base.dayManagement,
      actionPointsRemaining: 10
    },
    ...overrides
  };
}

describe("first-week onboarding coach (#PHASE3)", () => {
  it("points a fresh Day 1 player at the first order", () => {
    const hint = getDayCoachHint(openDay(1));
    expect(hint?.target).toBe("serve");
    expect(hint?.text).toMatch(/first order/i);
  });

  it("nudges Day 1 toward cleaning once two guests are served", () => {
    const state = openDay(1, {
      dayManagement: {
        ...createInitialGameState().dayManagement,
        actionPointsRemaining: 10,
        customersServed: 2
      }
    });
    const hint = getDayCoachHint(state);
    expect(hint?.target).toBe("clean");
  });

  it("treats a cleaning helper as already caring for the room", () => {
    const state = openDay(1, {
      helperAssignment: {
        helperId: "jana",
        taskId: "cleaning",
        dailyCost: 0,
        flavorLine: "",
        locked: true,
        autonomyLevel: "learning"
      },
      dayManagement: {
        ...createInitialGameState().dayManagement,
        actionPointsRemaining: 10,
        customersServed: 2
      }
    });
    expect(getDayCoachHint(state)?.target).toBe(null);
  });

  it("highlights the daily offer first thing on Day 3", () => {
    const hint = getDayCoachHint(openDay(3));
    expect(hint?.target).toBe("offer");
  });

  it("stops coaching after the first three days", () => {
    expect(getDayCoachHint(openDay(4))).toBeNull();
  });

  it("stays silent when the café is not open or has no actions left", () => {
    expect(getDayCoachHint({ ...createInitialGameState(), dayPhase: "day_start" })).toBeNull();
    expect(getDayCoachHint({ ...createInitialGameState(), dayPhase: "day_end" })).toBeNull();
    const spent = openDay(1, {
      dayManagement: {
        ...createInitialGameState().dayManagement,
        actionPointsRemaining: 0
      }
    });
    expect(getDayCoachHint(spent)).toBeNull();
  });
});
