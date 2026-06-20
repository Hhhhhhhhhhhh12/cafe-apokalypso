import { describe, expect, it } from "vitest";

import { createInitialGameState } from "../src/game/engine/gameState";
import { gameReducer } from "../src/game/engine/reducer";
import type { ProductId } from "../src/game/types/content";
import type {
  GameAction,
  GameState,
  HelperTaskId
} from "../src/game/types/game";
import type { StaffOptionId } from "../src/game/types/content";

type DayPlan = {
  helper?: {
    helperId: StaffOptionId;
    taskId: HelperTaskId;
  };
  actions: GameAction[];
  restock?: {
    coffee?: number;
    milk?: number;
    pastries?: number;
  };
};

describe("week-one balance simulation", () => {
  it("plays a reasonable deterministic run through the Day-7 letter", () => {
    let state = createInitialGameState();
    const checkpoints: GameState[] = [];
    const plans: Record<number, DayPlan> = {
      1: {
        actions: [
          serve("filterkaffee"),
          serve("espresso"),
          { type: "clean_tables" }
        ],
        restock: { coffee: 3 }
      },
      2: {
        actions: [
          serve("filterkaffee"),
          serve("espresso"),
          serve("cappuccino"),
          { type: "clean_tables" }
        ],
        restock: { coffee: 3 }
      },
      3: {
        helper: { helperId: "jana", taskId: "service" },
        actions: [
          { type: "adjust_offer" },
          serve("kaffee-croissant"),
          serve("filterkaffee"),
          { type: "clean_tables" }
        ],
        restock: { coffee: 2 }
      },
      4: {
        actions: [
          { type: "run_advertising", adType: "flyer" },
          serve("filterkaffee"),
          serve("filterkaffee"),
          serve("espresso"),
          { type: "clean_tables" }
        ],
        restock: { coffee: 2 }
      },
      5: {
        actions: [
          serve("filterkaffee"),
          serve("espresso"),
          serve("cappuccino"),
          { type: "clean_tables" }
        ],
        restock: { coffee: 2 }
      },
      6: {
        actions: [
          { type: "consult_kassandra" },
          serve("filterkaffee"),
          serve("espresso"),
          serve("cappuccino"),
          { type: "clean_tables" }
        ],
        restock: { coffee: 2 }
      },
      7: {
        actions: [
          serve("filterkaffee"),
          serve("espresso"),
          serve("cappuccino"),
          serve("handfilter"),
          { type: "clean_tables" }
        ]
      }
    };

    for (let day = 1; day <= 7; day += 1) {
      state = playReasonableDay(state, plans[day]);
      checkpoints.push(state);

      expect(state.day).toBe(day);
      expect(state.dayPhase).toBe("day_end");
      expect(state.daySummary).not.toBeNull();
      expect(state.cafeClosed).toBe(false);
      expect(state.closureReason).toBeNull();
      expect(state.resources.money).toBeGreaterThan(0);
      expect(state.resources.reputation).toBeGreaterThanOrEqual(10);
      expect(state.resources.reputation).toBeLessThanOrEqual(100);
      expect(state.resources.stress).toBeLessThanOrEqual(70);
      expect(state.resources.cleanliness).toBeGreaterThanOrEqual(45);
      expect(state.supplies.coffee).toBeGreaterThanOrEqual(0);
      expect(state.supplies.milk).toBeGreaterThanOrEqual(0);
      expect(state.supplies.pastries).toBeGreaterThanOrEqual(0);
      expect(state.daySummary?.guestsLost).toBe(0);

      if (day < 7) {
        state = restockForTomorrow(state, plans[day].restock ?? {});
        expect(state.day).toBe(day + 1);
        expect(state.dayPhase === "open" || state.dayPhase === "day_start").toBe(true);
      }
    }

    const dayThree = checkpoints[2];
    const dayFour = checkpoints[3];
    const daySix = checkpoints[5];
    const daySeven = checkpoints[6];

    expect(dayThree.daySummary?.helperRecap).toContain("Jana");
    expect(dayThree.staffXp.jana).toBeGreaterThan(0);
    expect(dayFour.dayManagement.advertisingRun).toBe(true);
    expect(daySix.dayManagement.kassandraConsulted).toBe(true);
    expect(daySeven.demoComplete).toBe(true);
    expect(daySeven.weirdnessVisible).toBe(true);
    expect(daySeven.objectiveResults).toHaveLength(7);
    expect(daySeven.objectiveResults.every((result) => result.status === "completed")).toBe(
      true
    );
    expect(daySeven.unlockedAchievements).toEqual(
      expect.arrayContaining([
        "first-order",
        "clean-counter",
        "regular-recognized",
        "first-ad",
        "first-helper",
        "kassandra-installed",
        "week-one-letter"
      ])
    );
    expect(daySeven.run.memoryFragments).toEqual(
      expect.arrayContaining([
        "guest-preference-ledger",
        "advertising-pattern-logged",
        "delegation-pattern-logged",
        "office-letter-arrived"
      ])
    );
  });
});

function serve(productId: ProductId): GameAction {
  return { type: "serve_product", productId };
}

function playReasonableDay(state: GameState, plan: DayPlan): GameState {
  let workingState = state;

  if (plan.helper) {
    workingState = gameReducer(workingState, {
      type: "select_helper",
      helperId: plan.helper.helperId,
      taskId: plan.helper.taskId
    });
  }

  if (workingState.dayPhase === "day_start") {
    workingState = gameReducer(workingState, { type: "open_day" });
  }

  expect(workingState.dayPhase).toBe("open");

  for (const action of plan.actions) {
    const before = workingState;
    workingState = gameReducer(workingState, action);
    expect(workingState.statusMessage).not.toContain("No action capacity");
    expect(workingState.cafeClosed).toBe(false);
    expect(workingState.day).toBe(before.day);
  }

  return gameReducer(workingState, { type: "complete_day" });
}

function restockForTomorrow(
  state: GameState,
  restock: NonNullable<DayPlan["restock"]>
): GameState {
  let workingState = state;
  const entries = Object.entries(restock) as Array<
    [keyof NonNullable<DayPlan["restock"]>, number]
  >;

  for (const [ingredient, quantity] of entries) {
    workingState = gameReducer(workingState, {
      type: "set_supply_purchase",
      ingredient,
      quantity
    });
  }

  const afterPurchase = gameReducer(workingState, { type: "confirm_supply_purchase" });
  expect(afterPurchase.statusMessage).not.toContain("Not enough money");
  expect(afterPurchase.cafeClosed).toBe(false);
  return afterPurchase;
}
