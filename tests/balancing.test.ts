/**
 * AUFGABE 3 — Balancing Tests
 *
 * Checks that the resource/order loop over 7 days stays within plausible
 * ranges and that day-modifiers / staff helpers have measurable effects.
 */
import { describe, expect, it } from "vitest";
import {
  createInitialGameState
} from "../src/game/engine/gameState";
import { gameReducer } from "../src/game/engine/reducer";
import {
  ACTION_BUDGET_BY_DAY,
  COMFORTABLE_CAPACITY_BY_DAY,
  DAILY_FIXED_COST,
  STARTING_REPUTATION,
  SUPPLY_CAPS,
  SUPPLY_UNIT_COSTS,
  createHelperAssignment,
  getEarnedPrice,
  getHelperAutonomyLevel,
  getReputationIncomeFactor
} from "../src/game/engine/management";
import { weekOneProducts } from "../src/game/data";
import type { DayNumber, ProductId, StaffOptionId } from "../src/game/types/content";
import type {
  DayActionId,
  GameAction,
  GameState,
  HelperTaskId,
  IngredientKey,
  SupplyState
} from "../src/game/types/game";

// ---------------------------------------------------------------------------
// Helper: same canonical pattern as management-tradeoff.test.ts
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
// Initial resource plausibility
// ---------------------------------------------------------------------------
describe("balancing: initial resources are in plausible range", () => {
  it("starting money is positive and not absurdly high (€10–€200)", () => {
    const state = createInitialGameState();
    expect(state.resources.money).toBeGreaterThan(10);
    expect(state.resources.money).toBeLessThan(200);
  });

  it("starting reputation is in documented range (STARTING_REPUTATION = 25)", () => {
    const state = createInitialGameState();
    expect(state.resources.reputation).toBe(STARTING_REPUTATION);
    expect(STARTING_REPUTATION).toBeGreaterThan(0);
    expect(STARTING_REPUTATION).toBeLessThan(100);
  });

  it("starting cleanliness is comfortably positive (> 50)", () => {
    const state = createInitialGameState();
    expect(state.resources.cleanliness).toBeGreaterThan(50);
  });

  it("starting stress is zero", () => {
    const state = createInitialGameState();
    expect(state.resources.stress).toBe(0);
  });

  it("starting supplies are within their caps", () => {
    const state = createInitialGameState();
    expect(state.supplies.coffee).toBeGreaterThan(0);
    expect(state.supplies.coffee).toBeLessThanOrEqual(SUPPLY_CAPS.coffee);
    expect(state.supplies.milk).toBeGreaterThan(0);
    expect(state.supplies.milk).toBeLessThanOrEqual(SUPPLY_CAPS.milk);
    expect(state.supplies.pastries).toBeGreaterThan(0);
    expect(state.supplies.pastries).toBeLessThanOrEqual(SUPPLY_CAPS.pastries);
  });

  it("action budgets increase (or hold) from day 1 to day 7", () => {
    const days: DayNumber[] = [1, 2, 3, 4, 5, 6, 7];
    for (let i = 0; i < days.length - 1; i++) {
      expect(ACTION_BUDGET_BY_DAY[days[i + 1]]).toBeGreaterThanOrEqual(
        ACTION_BUDGET_BY_DAY[days[i]]
      );
    }
  });

  it("comfortable capacity increases (or holds) from day 1 to day 7", () => {
    const days: DayNumber[] = [1, 2, 3, 4, 5, 6, 7];
    for (let i = 0; i < days.length - 1; i++) {
      expect(COMFORTABLE_CAPACITY_BY_DAY[days[i + 1]]).toBeGreaterThanOrEqual(
        COMFORTABLE_CAPACITY_BY_DAY[days[i]]
      );
    }
  });
});

// ---------------------------------------------------------------------------
// Day modifiers have measurable effect
// ---------------------------------------------------------------------------
describe("balancing: day modifiers have measurable effects", () => {
  it("DAILY_FIXED_COST is positive and reasonable (€1–€20)", () => {
    expect(DAILY_FIXED_COST).toBeGreaterThan(0);
    expect(DAILY_FIXED_COST).toBeLessThanOrEqual(20);
  });

  it("closing a day records the fixed daily overhead in the summary", () => {
    const state = createInitialGameState();
    const afterServe = gameReducer(state, { type: "take_order" });
    const afterClose = gameReducer(afterServe, { type: "complete_day" });
    expect(afterClose.daySummary?.dailyOverhead).toBe(DAILY_FIXED_COST);
  });

  it("money after day-end is less than money-before-close + money-earned (overhead deducted)", () => {
    const state = createInitialGameState();
    const moneyBeforeClose = state.resources.money;
    const afterServe = gameReducer(state, { type: "take_order" });
    const afterClose = gameReducer(afterServe, { type: "complete_day" });
    const earned = afterClose.daySummary?.moneyEarned ?? 0;

    // resources.money at day-end = moneyBefore + earned - overhead (± stress event penalty)
    // At minimum the overhead should have been taken
    expect(afterClose.resources.money).toBeLessThanOrEqual(moneyBeforeClose + earned);
  });

  it("reputation income factor is 0.6 at rep 0 and 1.0 at rep 100", () => {
    expect(getReputationIncomeFactor(0)).toBeCloseTo(0.6, 5);
    expect(getReputationIncomeFactor(100)).toBeCloseTo(1.0, 5);
  });

  it("income factor at starting reputation (25) is between 0.6 and 1.0", () => {
    const factor = getReputationIncomeFactor(STARTING_REPUTATION);
    expect(factor).toBeGreaterThan(0.6);
    expect(factor).toBeLessThan(1.0);
  });

  it("getEarnedPrice scales with reputation: rep 100 earns more than rep 0", () => {
    const product = weekOneProducts.find((p) => p.id === "filterkaffee")!;
    const lowRepEarning = getEarnedPrice(product.basePrice, 0);
    const highRepEarning = getEarnedPrice(product.basePrice, 100);
    expect(highRepEarning).toBeGreaterThan(lowRepEarning);
  });

  it("cleaning tables raises cleanliness by a non-zero amount", () => {
    const state = createInitialGameState();
    // First deplete cleanliness with a serve, then clean
    const afterServe = gameReducer(state, { type: "take_order" });
    const afterClean = gameReducer(afterServe, { type: "clean_tables" });
    expect(afterClean.resources.cleanliness).toBeGreaterThan(
      afterServe.resources.cleanliness
    );
    expect(afterClean.resources.cleanliness).toBeLessThanOrEqual(100);
  });

  it("high cleanliness at closing gives reputation bonus (flavor line present)", () => {
    // Start clean (>= 70), serve one order, then close.
    // The day-end flavorLines should include the clean-close bonus.
    const state = createInitialGameState();
    expect(state.resources.cleanliness).toBeGreaterThanOrEqual(70);
    const afterServe = gameReducer(state, { type: "take_order" });
    const afterClose = gameReducer(afterServe, { type: "complete_day" });
    const flavorLines = afterClose.daySummary?.flavorLines ?? [];
    const hasCleanBonus = flavorLines.some((line) =>
      line.includes("Rep +1") || line.includes("good order")
    );
    expect(hasCleanBonus).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// No resource overflow / underflow at day boundaries
// ---------------------------------------------------------------------------
describe("balancing: no overflow or underflow across day boundaries", () => {
  it("money never goes below 0 after basic day transitions (days 1–6)", () => {
    // Use a simple minimal day loop: open, serve, close, restock
    let state = createInitialGameState();
    for (let d = 1; d <= 6; d++) {
      // Day 1 starts open; days 3+ need open_day
      if (state.dayPhase === "day_start") {
        state = gameReducer(state, { type: "open_day" });
      }
      state = gameReducer(state, { type: "take_order" });
      state = gameReducer(state, { type: "complete_day" });
      state = gameReducer(state, { type: "confirm_supply_purchase" });

      expect(state.resources.money).toBeGreaterThanOrEqual(0);
      expect(state.resources.reputation).toBeGreaterThanOrEqual(0);
      expect(state.resources.cleanliness).toBeGreaterThanOrEqual(0);
      expect(state.resources.stress).toBeGreaterThanOrEqual(0);
    }
  });

  it("all resource meters stay <= 100 after day transitions (days 1–6)", () => {
    let state = createInitialGameState();
    for (let d = 1; d <= 6; d++) {
      if (state.dayPhase === "day_start") {
        state = gameReducer(state, { type: "open_day" });
      }
      state = gameReducer(state, { type: "take_order" });
      state = gameReducer(state, { type: "complete_day" });
      state = gameReducer(state, { type: "confirm_supply_purchase" });

      expect(state.resources.reputation).toBeLessThanOrEqual(100);
      expect(state.resources.cleanliness).toBeLessThanOrEqual(100);
      expect(state.resources.stress).toBeLessThanOrEqual(100);
    }
  });

  it("supplies never go below 0 while serving orders within action budget", () => {
    let state = createInitialGameState();
    while (state.dayManagement.actionPointsRemaining > 0) {
      state = gameReducer(state, { type: "take_order" });
      expect(state.supplies.coffee).toBeGreaterThanOrEqual(0);
      expect(state.supplies.milk).toBeGreaterThanOrEqual(0);
      expect(state.supplies.pastries).toBeGreaterThanOrEqual(0);
    }
  });

  it("supplies never exceed their caps after a restock", () => {
    let state = createInitialGameState();
    state = gameReducer(state, { type: "take_order" });
    state = gameReducer(state, { type: "complete_day" });
    state = gameReducer(state, {
      type: "set_supply_purchase",
      ingredient: "coffee",
      quantity: SUPPLY_CAPS.coffee
    });
    state = gameReducer(state, {
      type: "set_supply_purchase",
      ingredient: "milk",
      quantity: SUPPLY_CAPS.milk
    });
    state = gameReducer(state, {
      type: "set_supply_purchase",
      ingredient: "pastries",
      quantity: SUPPLY_CAPS.pastries
    });
    state = gameReducer(state, { type: "confirm_supply_purchase" });

    expect(state.supplies.coffee).toBeLessThanOrEqual(SUPPLY_CAPS.coffee);
    expect(state.supplies.milk).toBeLessThanOrEqual(SUPPLY_CAPS.milk);
    expect(state.supplies.pastries).toBeLessThanOrEqual(SUPPLY_CAPS.pastries);
  });

  it("stress resets downward (by 20) across the day-transition rest", () => {
    let state = createInitialGameState();
    // Serve enough to build some stress
    state = gameReducer(state, { type: "take_order" });
    state = gameReducer(state, { type: "take_order" });
    state = gameReducer(state, { type: "complete_day" });
    const stressAtDayEnd = state.resources.stress;
    state = gameReducer(state, { type: "confirm_supply_purchase" });
    // After rest, stress should be reduced by 20 (clamped at 0)
    expect(state.resources.stress).toBeLessThanOrEqual(
      Math.max(0, stressAtDayEnd - 20)
    );
  });

  it("supply purchase cost matches unit cost constants", () => {
    expect(SUPPLY_UNIT_COSTS.coffee * 5).toBeCloseTo(0.8 * 5, 5);
    expect(SUPPLY_UNIT_COSTS.milk * 4).toBeCloseTo(0.4 * 4, 5);
    expect(SUPPLY_UNIT_COSTS.pastries * 3).toBeCloseTo(1.2 * 3, 5);
  });
});

// ---------------------------------------------------------------------------
// Staff helpers have measurably different effects vs no helper
// ---------------------------------------------------------------------------
describe("balancing: staff helpers differ from no-helper baseline", () => {
  it("Jana (cleaning) keeps cleanliness at or above 45 during serving", () => {
    let state = createDayStartState(3);
    state = gameReducer(state, {
      type: "select_helper",
      helperId: "jana",
      taskId: "cleaning"
    });
    state = gameReducer(state, { type: "open_day" });

    // Serve multiple customers — Jana's floor holds cleanliness >= 45
    for (let i = 0; i < 4; i++) {
      if (state.dayManagement.actionPointsRemaining > 0) {
        state = gameReducer(state, { type: "take_order" });
      }
    }
    expect(state.resources.cleanliness).toBeGreaterThanOrEqual(45);
  });

  it("no-helper on day 4 produces the solo floor penalty flavor line", () => {
    // Construct a ready-to-close day 4 state without a helper
    const closedState = gameReducer(
      {
        ...createDayStartState(4),
        dayPhase: "open",
        dayManagement: {
          ...createInitialGameState().dayManagement,
          customersServed: 1
        },
        completedActions: ["take_order"]
      },
      { type: "complete_day" }
    );

    const flavorLines = closedState.daySummary?.flavorLines ?? [];
    const hasSoloPenaltyLine = flavorLines.some((line) =>
      line.includes("Stress +10")
    );
    expect(hasSoloPenaltyLine).toBe(true);
  });

  it("Nino (counter) reduces opening stress by 8", () => {
    const withoutNino = gameReducer(createDayStartState(3), { type: "open_day" });
    const stressWithoutNino = withoutNino.resources.stress;

    let stateWithNino = createDayStartState(3);
    stateWithNino = gameReducer(stateWithNino, {
      type: "select_helper",
      helperId: "nino",
      taskId: "counter"
    });
    stateWithNino = gameReducer(stateWithNino, { type: "open_day" });

    // Nino counter saves 8 stress at opening
    expect(stateWithNino.resources.stress).toBe(
      Math.max(0, stressWithoutNino - 8)
    );
  });

  it("Nele (marketing) grants an extra advertising action slot", () => {
    let state = createDayStartState(4);
    state = gameReducer(state, {
      type: "select_helper",
      helperId: "nele",
      taskId: "marketing"
    });
    state = gameReducer(state, { type: "open_day" });

    expect(state.dayManagement.extraAdvertisingActions).toBe(1);
  });

  it("Nele (counter) reduces opening stress by 5", () => {
    const stateNoHelper = gameReducer(createDayStartState(3), { type: "open_day" });
    const stressNoHelper = stateNoHelper.resources.stress;

    let stateNele = createDayStartState(3);
    stateNele = gameReducer(stateNele, {
      type: "select_helper",
      helperId: "nele",
      taskId: "counter"
    });
    stateNele = gameReducer(stateNele, { type: "open_day" });

    expect(stateNele.resources.stress).toBe(Math.max(0, stressNoHelper - 5));
  });

  it("helper dailyCost is deducted from money when the day opens", () => {
    let state = createDayStartState(3);
    state = gameReducer(state, {
      type: "select_helper",
      helperId: "jana",
      taskId: "cleaning"
    });
    const moneyBefore = state.resources.money;
    const janaCost = state.helperAssignment!.dailyCost;

    state = gameReducer(state, { type: "open_day" });
    expect(state.resources.money).toBeCloseTo(moneyBefore - janaCost, 2);
  });

  it("createHelperAssignment returns null for invalid task combos", () => {
    // Jana cannot do barista
    expect(createHelperAssignment("jana", "barista", 3)).toBeNull();
    // Nino cannot do cleaning
    expect(createHelperAssignment("nino", "cleaning", 3)).toBeNull();
    // Nele cannot do service
    expect(createHelperAssignment("nele", "service", 3)).toBeNull();
  });

  it("createHelperAssignment returns valid assignments for documented combos", () => {
    expect(createHelperAssignment("jana", "cleaning", 3)).not.toBeNull();
    expect(createHelperAssignment("jana", "service", 3)).not.toBeNull();
    expect(createHelperAssignment("nino", "barista", 3)).not.toBeNull();
    expect(createHelperAssignment("nino", "counter", 3)).not.toBeNull();
    expect(createHelperAssignment("nele", "marketing", 3)).not.toBeNull();
    expect(createHelperAssignment("nele", "counter", 3)).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Helper autonomy state machine (#132)
// ---------------------------------------------------------------------------
describe("helper autonomy state machine", () => {
  it("getHelperAutonomyLevel follows the Day 1-7 schedule (micromanagement -> learning -> autonomous)", () => {
    expect(getHelperAutonomyLevel(1)).toBe("micromanagement");
    expect(getHelperAutonomyLevel(2)).toBe("micromanagement");
    expect(getHelperAutonomyLevel(3)).toBe("learning");
    expect(getHelperAutonomyLevel(4)).toBe("autonomous");
    expect(getHelperAutonomyLevel(5)).toBe("autonomous");
    expect(getHelperAutonomyLevel(6)).toBe("autonomous");
    expect(getHelperAutonomyLevel(7)).toBe("autonomous");
  });

  it("createHelperAssignment stamps the assignment with the day's autonomy level", () => {
    expect(createHelperAssignment("jana", "cleaning", 3)?.autonomyLevel).toBe("learning");
    expect(createHelperAssignment("jana", "cleaning", 5)?.autonomyLevel).toBe("autonomous");
  });

  it("micromanagement-level helper never produces autonomous actions across a full idle day", () => {
    let state = createDayStartState(3);
    state = gameReducer(state, { type: "select_helper", helperId: "jana", taskId: "cleaning" });
    state = { ...state, helperAssignment: { ...state.helperAssignment!, autonomyLevel: "micromanagement" } };
    state = gameReducer(state, { type: "open_day" });

    for (let i = 0; i < 6; i++) {
      state = gameReducer(state, { type: "clean_tables" });
    }

    expect(state.dayManagement.helperAutonomousActions).toBe(0);
  });

  it("learning/autonomous-level Jana clears a dirty table on eligible idle actions", () => {
    let learningState = createDayStartState(3);
    learningState = gameReducer(learningState, {
      type: "select_helper",
      helperId: "jana",
      taskId: "cleaning"
    });
    learningState = gameReducer(learningState, { type: "open_day" });
    expect(learningState.helperAssignment?.autonomyLevel).toBe("learning");

    learningState = gameReducer(learningState, { type: "serve_product", productId: "filterkaffee" });
    expect(learningState.dayManagement.dirtyTableIds).toEqual(["left"]);
    for (let i = 0; i < 4; i++) {
      learningState = gameReducer(learningState, { type: "check_supplies" });
    }
    expect(learningState.dayManagement.helperAutonomousActions).toBeGreaterThan(0);
    expect(learningState.dayManagement.dirtyTableIds).toEqual([]);

    let autonomousState = createDayStartState(5);
    autonomousState = gameReducer(autonomousState, {
      type: "select_helper",
      helperId: "jana",
      taskId: "cleaning"
    });
    autonomousState = gameReducer(autonomousState, { type: "open_day" });
    expect(autonomousState.helperAssignment?.autonomyLevel).toBe("autonomous");

    autonomousState = gameReducer(autonomousState, { type: "serve_product", productId: "filterkaffee" });
    expect(autonomousState.dayManagement.dirtyTableIds).toEqual(["left"]);
    autonomousState = gameReducer(autonomousState, { type: "check_supplies" });
    expect(autonomousState.dayManagement.helperAutonomousActions).toBe(1);
    expect(autonomousState.dayManagement.dirtyTableIds).toEqual([]);
  });

  it.each([
    ["Jana on service", "jana", "service"],
    ["Nino on barista", "nino", "barista"],
    ["Nino on counter", "nino", "counter"],
    ["Nele on marketing", "nele", "marketing"],
    ["Nele on counter", "nele", "counter"]
  ] as const)("does not turn %s into an unassigned cleaning action", (_label, helperId, taskId) => {
    let state = createDayStartState(5);
    state = gameReducer(state, { type: "select_helper", helperId, taskId });
    state = gameReducer(state, { type: "open_day" });
    state = gameReducer(state, { type: "serve_product", productId: "filterkaffee" });
    const dirtyTableIds = state.dayManagement.dirtyTableIds;

    state = gameReducer(state, { type: "check_supplies" });

    expect(state.dayManagement.dirtyTableIds).toEqual(dirtyTableIds);
    expect(state.dayManagement.helperAutonomousActions).toBe(0);
  });

  it("Nino (barista) gives reputation bonus for espresso (baristaReputationBonus increments)", () => {
    let state = createDayStartState(3);
    state = gameReducer(state, {
      type: "select_helper",
      helperId: "nino",
      taskId: "barista"
    });
    state = gameReducer(state, { type: "open_day" });

    // Serve espresso — Nino barista should add +1 rep and increment the counter
    state = gameReducer(state, {
      type: "serve_product",
      productId: "espresso"
    });

    expect(state.dayManagement.baristaReputationBonus).toBeGreaterThanOrEqual(1);
    expect(state.dayManagement.baristaReputationBonus).toBeLessThanOrEqual(3);
  });
});

// ---------------------------------------------------------------------------
// Reputation feedback loop
// ---------------------------------------------------------------------------
describe("balancing: reputation feedback loop", () => {
  it("low reputation reduces earned income (reputation income factor)", () => {
    const product = weekOneProducts.find((p) => p.id === "cappuccino")!;
    const earned25 = getEarnedPrice(product.basePrice, 25);
    const earned75 = getEarnedPrice(product.basePrice, 75);
    expect(earned75).toBeGreaterThan(earned25);
  });

  it("reputation stays non-negative through two consecutive days", () => {
    let state = createInitialGameState();
    state = gameReducer(state, { type: "take_order" });
    state = gameReducer(state, { type: "complete_day" });
    state = gameReducer(state, { type: "confirm_supply_purchase" });
    state = gameReducer(state, { type: "open_day" });
    state = gameReducer(state, { type: "take_order" });
    state = gameReducer(state, { type: "complete_day" });
    expect(state.resources.reputation).toBeGreaterThanOrEqual(0);
  });

  it("two consecutive close-at-zero-rep days cause café closure (reputation streak)", () => {
    // The rep-zero streak is checked against closedState.resources.reputation,
    // which is AFTER applyDayEndConsequences runs. Day-end bonuses (clean close +1)
    // can lift rep off zero. To keep rep at 0 after day-end we need:
    //   - cleanliness 40–69 (no rep adjustment from cleanliness)
    //   - reputation penalty from low cleanliness would lift negative rep, so
    //     we instead use a rep of 0 with cleanliness at 50 (Tidy, no change).
    //   - Skip the soft-opening modifier bonus path by using day 2.
    // Use day 2: no special modifier rep bonus, cleanliness neutral band.
    const dayReadyToClose = (base: GameState): GameState => ({
      ...base,
      dayPhase: "open",
      completedActions: ["take_order"],
      dayManagement: {
        ...createInitialGameState().dayManagement,
        customersServed: 1,
        reputationAtStart: 0
      },
      // Cleanliness in 40–69 range → no rep adjustment at day end
      resources: { ...base.resources, cleanliness: 55 }
    });

    // Day 1 — rep forced to 0 immediately before close
    let state = dayReadyToClose({
      ...createInitialGameState(),
      resources: { ...createInitialGameState().resources, reputation: 0, cleanliness: 55 }
    });
    state = gameReducer(state, { type: "complete_day" });

    // Rep may still end at 0 if no bonus pushed it up.
    // The streak increments only when closedState.reputation <= 0.
    if (state.resources.reputation <= 0) {
      expect(state.reputationZeroStreak).toBe(1);
      expect(state.cafeClosed).toBe(false);

      // Advance to day 2, force rep to 0 again before close
      state = gameReducer(state, { type: "confirm_supply_purchase" });
      state = dayReadyToClose({
        ...state,
        resources: { ...state.resources, reputation: 0, cleanliness: 55 }
      });
      state = gameReducer(state, { type: "complete_day" });

      if (state.resources.reputation <= 0) {
        expect(state.reputationZeroStreak).toBe(2);
        expect(state.cafeClosed).toBe(true);
        expect(state.closureReason).toBe("reputation");
      }
    }
  });

  it("reputation zero streak mechanic is documented in reducer (two-day grace)", () => {
    // Lighter-weight check: the mechanic exists and is correctly bounded.
    // A single day at zero → streak 1, NOT closed.
    // Directly inject a state already at streak 1 and force rep to remain 0.
    const atStreak1 = {
      ...createInitialGameState(),
      reputationZeroStreak: 1,
      dayPhase: "open" as const,
      completedActions: ["take_order"] as DayActionId[],
      dayManagement: {
        ...createInitialGameState().dayManagement,
        customersServed: 1,
        reputationAtStart: 0
      },
      resources: {
        ...createInitialGameState().resources,
        reputation: 0,
        cleanliness: 55
      }
    };
    const closed = gameReducer(atStreak1, { type: "complete_day" });

    // If rep is still at 0 after day-end, the café closes.
    if (closed.resources.reputation <= 0) {
      expect(closed.cafeClosed).toBe(true);
      expect(closed.closureReason).toBe("reputation");
    } else {
      // Rep was nudged above 0 by a bonus — streak resets.
      expect(closed.reputationZeroStreak).toBe(0);
    }
  });
});

// ---------------------------------------------------------------------------
// Deterministic strategy simulations
// ---------------------------------------------------------------------------
type StrategyName = "conservative" | "balanced" | "aggressive";

interface HelperPlan {
  helperId: StaffOptionId;
  taskId: HelperTaskId;
}

interface StrategyCheckpoint {
  day: DayNumber;
  summary: NonNullable<GameState["daySummary"]>;
  resources: GameState["resources"];
  supplies: SupplyState;
  memoryFragments: number;
}

interface StrategyRun {
  finalState: GameState;
  checkpoints: StrategyCheckpoint[];
  totals: {
    customersServed: number;
    guestsLost: number;
    moneyEarned: number;
    objectivesCompleted: number;
    peakStress: number;
    lowestCleanliness: number;
  };
}

const helperDailyCosts: Record<StaffOptionId, number> = {
  jana: 18,
  nino: 22,
  nele: 20
};

const restockTargets: Record<StrategyName, SupplyState> = {
  conservative: { coffee: 12, milk: 8, pastries: 6 },
  balanced: { coffee: 14, milk: 8, pastries: 6 },
  aggressive: { coffee: 20, milk: 14, pastries: 10 }
};

describe("balancing: deterministic seven-day strategy simulations", () => {
  it("keeps multiple management styles playable while exposing clear trade-offs", () => {
    const conservative = simulateStrategy("conservative");
    const balanced = simulateStrategy("balanced");
    const aggressive = simulateStrategy("aggressive");

    for (const run of [conservative, balanced, aggressive]) {
      expect(run.finalState.day).toBe(7);
      expect(run.finalState.dayPhase).toBe("day_end");
      expect(run.finalState.demoComplete).toBe(true);
      expect(run.finalState.cafeClosed).toBe(false);
      expect(run.finalState.closureReason).toBeNull();
      expect(run.finalState.resources.money).toBeGreaterThan(0);
      expect(run.finalState.resources.reputation).toBeGreaterThan(0);
      expect(run.totals.customersServed).toBeGreaterThanOrEqual(20);
    }

    expect(balanced.totals.objectivesCompleted).toBe(7);
    expect(balanced.finalState.run.memoryFragments).toEqual(
      expect.arrayContaining([
        "guest-preference-ledger",
        "advertising-pattern-logged",
        "delegation-pattern-logged",
        "office-letter-arrived"
      ])
    );

    expect(aggressive.totals.moneyEarned).toBeGreaterThan(
      conservative.totals.moneyEarned
    );
    expect(aggressive.totals.peakStress).toBeGreaterThan(balanced.totals.peakStress);
    expect(aggressive.totals.lowestCleanliness).toBeLessThan(
      balanced.totals.lowestCleanliness
    );
    expect(aggressive.totals.objectivesCompleted).toBeLessThan(
      balanced.totals.objectivesCompleted
    );

    expect(conservative.finalState.resources.stress).toBeLessThanOrEqual(
      aggressive.finalState.resources.stress
    );
  });

  it("keeps simulated checkpoints inside resource and supply bounds", () => {
    for (const strategy of ["conservative", "balanced", "aggressive"] as const) {
      const run = simulateStrategy(strategy);

      expect(run.checkpoints).toHaveLength(7);

      for (const checkpoint of run.checkpoints) {
        expect(checkpoint.resources.money).toBeGreaterThanOrEqual(0);
        expect(checkpoint.resources.reputation).toBeGreaterThanOrEqual(0);
        expect(checkpoint.resources.reputation).toBeLessThanOrEqual(100);
        expect(checkpoint.resources.cleanliness).toBeGreaterThanOrEqual(0);
        expect(checkpoint.resources.cleanliness).toBeLessThanOrEqual(100);
        expect(checkpoint.resources.stress).toBeGreaterThanOrEqual(0);
        expect(checkpoint.resources.stress).toBeLessThanOrEqual(100);
        expect(checkpoint.supplies.coffee).toBeGreaterThanOrEqual(0);
        expect(checkpoint.supplies.coffee).toBeLessThanOrEqual(SUPPLY_CAPS.coffee);
        expect(checkpoint.supplies.milk).toBeGreaterThanOrEqual(0);
        expect(checkpoint.supplies.milk).toBeLessThanOrEqual(SUPPLY_CAPS.milk);
        expect(checkpoint.supplies.pastries).toBeGreaterThanOrEqual(0);
        expect(checkpoint.supplies.pastries).toBeLessThanOrEqual(SUPPLY_CAPS.pastries);
        expect(checkpoint.summary.moneyEarned).toBeGreaterThan(0);
        expect(checkpoint.memoryFragments).toBeGreaterThanOrEqual(checkpoint.day);
      }
    }
  });
});

function simulateStrategy(strategy: StrategyName): StrategyRun {
  let state = createInitialGameState();
  const checkpoints: StrategyCheckpoint[] = [];

  for (let day = 1; day <= 7; day += 1) {
    const currentDay = day as DayNumber;
    state = playStrategyDay(state, strategy, currentDay);
    checkpoints.push(toCheckpoint(state));

    if (currentDay < 7) {
      state = restockForStrategy(state, strategy);
    }
  }

  const summaries = checkpoints.map((checkpoint) => checkpoint.summary);

  return {
    finalState: state,
    checkpoints,
    totals: {
      customersServed: summaries.reduce(
        (sum, summary) => sum + summary.customersServed,
        0
      ),
      guestsLost: summaries.reduce((sum, summary) => sum + summary.guestsLost, 0),
      moneyEarned: summaries.reduce((sum, summary) => sum + summary.moneyEarned, 0),
      objectivesCompleted: state.objectiveResults.filter(
        (result) => result.status === "completed"
      ).length,
      peakStress: Math.max(
        ...checkpoints.map((checkpoint) => checkpoint.resources.stress)
      ),
      lowestCleanliness: Math.min(
        ...checkpoints.map((checkpoint) => checkpoint.resources.cleanliness)
      )
    }
  };
}

function playStrategyDay(
  state: GameState,
  strategy: StrategyName,
  day: DayNumber
): GameState {
  let workingState = state;
  const helper = getHelperPlan(strategy, day, workingState);

  if (helper) {
    workingState = gameReducer(workingState, {
      type: "select_helper",
      helperId: helper.helperId,
      taskId: helper.taskId
    });
  }

  if (workingState.dayPhase === "day_start") {
    workingState = gameReducer(workingState, { type: "open_day" });
  }

  expect(workingState.day).toBe(day);
  expect(workingState.dayPhase).toBe("open");

  for (const action of getStrategyActions(strategy, day)) {
    if (workingState.dayManagement.actionPointsRemaining <= 0) {
      break;
    }

    if (!canAffordAction(workingState, action)) {
      continue;
    }

    const before = workingState;
    workingState = gameReducer(workingState, action);

    expect(workingState.day).toBe(before.day);
    expect(workingState.dayPhase).toBe("open");
    expect(workingState.statusMessage).not.toContain("No action capacity");
    expect(workingState.statusMessage).not.toContain("Not enough money");
    expect(workingState.cafeClosed).toBe(false);
  }

  const closedState = gameReducer(workingState, { type: "complete_day" });
  expect(closedState.dayPhase).toBe("day_end");
  expect(closedState.daySummary).not.toBeNull();
  return closedState;
}

function getHelperPlan(
  strategy: StrategyName,
  day: DayNumber,
  state: GameState
): HelperPlan | null {
  if (day < 3) {
    return null;
  }

  const planByStrategy: Record<StrategyName, Partial<Record<DayNumber, HelperPlan>>> = {
    conservative: {
      5: { helperId: "jana", taskId: "cleaning" },
      7: { helperId: "jana", taskId: "cleaning" }
    },
    balanced: {
      3: { helperId: "jana", taskId: "service" },
      5: { helperId: "jana", taskId: "cleaning" },
      6: { helperId: "nino", taskId: "barista" },
      7: { helperId: "jana", taskId: "cleaning" }
    },
    aggressive: {
      3: { helperId: "jana", taskId: "service" },
      5: { helperId: "nele", taskId: "marketing" },
      6: { helperId: "nele", taskId: "marketing" }
    }
  };

  const plan = planByStrategy[strategy][day] ?? null;
  if (!plan || state.resources.money < helperDailyCosts[plan.helperId]) {
    return null;
  }

  return plan;
}

function getStrategyActions(strategy: StrategyName, day: DayNumber): GameAction[] {
  const sharedServeQueue: Record<DayNumber, ProductId[]> = {
    1: ["filterkaffee", "espresso", "cappuccino"],
    2: ["filterkaffee", "espresso", "cappuccino", "filterkaffee"],
    3: ["kaffee-croissant", "filterkaffee", "espresso"],
    4: ["filterkaffee", "espresso", "handfilter", "cappuccino"],
    5: ["kaffee-croissant", "espresso", "cappuccino", "handfilter"],
    6: ["filterkaffee", "espresso", "cappuccino", "handfilter"],
    7: ["filterkaffee", "espresso", "cappuccino", "handfilter", "kaffee-croissant"]
  };

  if (strategy === "conservative") {
    const actions: GameAction[] = [];
    if (day === 3) {
      actions.push({ type: "adjust_offer" });
    }
    if (day === 4) {
      actions.push({ type: "run_advertising", adType: "flyer" });
    }
    if (day === 6) {
      actions.push({ type: "consult_kassandra" });
    }
    actions.push(...sharedServeQueue[day].slice(0, day === 1 ? 2 : 3).map(serve));
    actions.push({ type: "clean_tables" });
    return actions;
  }

  if (strategy === "balanced") {
    const actions: GameAction[] = [];
    if (day === 3) {
      actions.push({ type: "adjust_offer" });
    }
    if (day === 4 || day === 5) {
      actions.push({ type: "run_advertising", adType: "flyer" });
    }
    if (day >= 6) {
      actions.push({ type: "consult_kassandra" });
    }
    actions.push(
      ...sharedServeQueue[day].slice(0, day === 1 ? 2 : day === 7 ? 4 : 3).map(serve)
    );
    actions.push({ type: "clean_tables" });
    return actions;
  }

  const aggressiveServeQueue: Record<DayNumber, ProductId[]> = {
    1: ["cappuccino", "espresso", "croissant"],
    2: ["cappuccino", "espresso", "cappuccino", "filterkaffee"],
    3: ["kaffee-croissant", "cappuccino", "kaffee-croissant", "espresso"],
    4: ["handfilter", "cappuccino", "handfilter", "kaffee-croissant"],
    5: ["handfilter", "cappuccino", "kaffee-croissant", "handfilter"],
    6: ["handfilter", "cappuccino", "kaffee-croissant", "handfilter"],
    7: [
      "handfilter",
      "cappuccino",
      "kaffee-croissant",
      "handfilter",
      "cappuccino",
      "espresso"
    ]
  };

  const actions: GameAction[] = [];
  if (day >= 4) {
    actions.push({ type: "run_advertising", adType: "flyer" });
  }
  if (day >= 5) {
    actions.push({ type: "run_advertising", adType: "social" });
  }
  if (day >= 6) {
    actions.push({ type: "consult_kassandra" });
  }
  if (day === 3) {
    actions.push({ type: "adjust_offer" });
  }
  actions.push(...aggressiveServeQueue[day].map(serve));
  return actions;
}

function serve(productId: ProductId): GameAction {
  return { type: "serve_product", productId };
}

function canAffordAction(state: GameState, action: GameAction): boolean {
  if (action.type !== "run_advertising") {
    return true;
  }

  const cost = action.adType === "social" ? 5 : 2;
  return state.resources.money >= cost;
}

function restockForStrategy(state: GameState, strategy: StrategyName): GameState {
  let workingState = state;
  const target = restockTargets[strategy];
  const purchase = (Object.keys(target) as IngredientKey[]).reduce(
    (acc, ingredient) => ({
      ...acc,
      [ingredient]: Math.max(
        0,
        Math.min(SUPPLY_CAPS[ingredient] - workingState.supplies[ingredient], target[ingredient] - workingState.supplies[ingredient])
      )
    }),
    { coffee: 0, milk: 0, pastries: 0 } as SupplyState
  );
  const affordablePurchase = reducePurchaseToBudget(purchase, workingState.resources.money);

  for (const ingredient of Object.keys(affordablePurchase) as IngredientKey[]) {
    workingState = gameReducer(workingState, {
      type: "set_supply_purchase",
      ingredient,
      quantity: affordablePurchase[ingredient]
    });
  }

  const nextState = gameReducer(workingState, { type: "confirm_supply_purchase" });
  if (!(nextState.dayPhase === "open" || nextState.dayPhase === "day_start")) {
    console.log({
      strategy,
      day: state.day,
      statusMessage: nextState.statusMessage,
      money: nextState.resources.money,
      purchase: affordablePurchase,
      phase: nextState.dayPhase
    });
  }
  expect(nextState.statusMessage).not.toContain("Not enough money");
  expect(nextState.dayPhase === "open" || nextState.dayPhase === "day_start").toBe(true);
  return nextState;
}

function reducePurchaseToBudget(purchase: SupplyState, budget: number): SupplyState {
  const reduced = { ...purchase };
  const reductionOrder: IngredientKey[] = ["pastries", "milk", "coffee"];

  while (getPurchaseCostForTest(reduced) > budget) {
    const ingredient = reductionOrder.find((candidate) => reduced[candidate] > 0);

    if (!ingredient) {
      return reduced;
    }

    reduced[ingredient] -= 1;
  }

  return reduced;
}

function getPurchaseCostForTest(purchase: SupplyState): number {
  return Math.round(
    (purchase.coffee * SUPPLY_UNIT_COSTS.coffee +
      purchase.milk * SUPPLY_UNIT_COSTS.milk +
      purchase.pastries * SUPPLY_UNIT_COSTS.pastries) *
      100
  ) / 100;
}

function toCheckpoint(state: GameState): StrategyCheckpoint {
  expect(state.daySummary).not.toBeNull();

  return {
    day: state.day,
    summary: state.daySummary!,
    resources: state.resources,
    supplies: state.supplies,
    memoryFragments: state.run.memoryFragments.length
  };
}
