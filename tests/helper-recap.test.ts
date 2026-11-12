import { describe, expect, it } from "vitest";
import { gameReducer } from "../src/game/engine/reducer";
import { createInitialGameState } from "../src/game/engine/gameState";
import {
  createInitialDayManagement,
  getHelperAutonomyRecapLine
} from "../src/game/engine/management";
import type { GameState, HelperAssignment } from "../src/game/types/game";

function assignment(level: HelperAssignment["autonomyLevel"]): HelperAssignment {
  return {
    helperId: "jana",
    taskId: "cleaning",
    locked: true,
    dailyCost: 10,
    flavorLine: "",
    autonomyLevel: level
  };
}

function assignmentForTask(
  helperId: HelperAssignment["helperId"],
  taskId: HelperAssignment["taskId"]
): HelperAssignment {
  return {
    ...assignment("autonomous"),
    helperId,
    taskId
  };
}

describe("getHelperAutonomyRecapLine (#131)", () => {
  it("credits the player when no helper was assigned", () => {
    expect(getHelperAutonomyRecapLine(null, 0)).toBe("You handled everything today.");
  });

  it("micromanagement: helper only watches", () => {
    const line = getHelperAutonomyRecapLine(assignment("micromanagement"), 0);
    expect(line).toContain("You handled everything today.");
    expect(line).toContain("Jana");
  });

  it("learning: first-initiative line with the unasked-things count", () => {
    const line = getHelperAutonomyRecapLine(assignment("learning"), 1);
    expect(line).toContain("I noticed the cup was empty and cleared it.");
    expect(line).toContain("1 small thing done unasked");
  });

  it("learning with zero actions: quiet day", () => {
    expect(getHelperAutonomyRecapLine(assignment("learning"), 0)).toContain(
      "waited for instructions"
    );
  });

  it("autonomous: numbers climb and big days get the extra beat", () => {
    expect(getHelperAutonomyRecapLine(assignment("autonomous"), 3)).toBe(
      "Jana cleared 3 tables without being asked."
    );
    expect(getHelperAutonomyRecapLine(assignment("autonomous"), 5)).toContain(
      "The café is starting to run itself."
    );
  });

  it("keeps non-cleaning helper recaps task-specific", () => {
    const line = getHelperAutonomyRecapLine(assignmentForTask("nino", "barista"), 3);
    expect(line).toContain("Nino");
    expect(line).toContain("coffee machine");
    expect(line).not.toContain("cleared");
  });
});

describe("day-end summary integration", () => {
  it("writes the recap into daySummary on complete_day (no helper, Day 1)", () => {
    let state = createInitialGameState();
    state = gameReducer(state, { type: "take_order" });
    state = gameReducer(state, { type: "prepare_drink" });
    state = gameReducer(state, { type: "clean_tables" });
    state = gameReducer(state, { type: "complete_day" });

    expect(state.daySummary?.helperAutonomyRecap).toBe("You handled everything today.");
  });

  it("reflects autonomous helper actions in the Day-4 recap", () => {
    let state: GameState = {
      ...createInitialGameState(),
      day: 4,
      dayPhase: "day_start",
      unlocks: {
        pricing: true,
        advertising: true,
        staff: true,
        kassandra: false,
        apocalypseOperations: false
      },
      dayManagement: {
        ...createInitialDayManagement(25, 4),
        actionPointsRemaining: 8,
        helperDecisionMade: false
      }
    };
    state = gameReducer(state, { type: "select_helper", helperId: "jana", taskId: "cleaning" });
    state = gameReducer(state, { type: "open_day" });
    state = gameReducer(state, { type: "serve_product", productId: "filterkaffee" });
    expect(state.dayManagement.dirtyTableIds).toEqual(["left"]);

    // An autonomous cleaner picks up the specific marked table during a non-serve action.
    state = gameReducer(state, { type: "check_supplies" });
    const actions = state.dayManagement.helperAutonomousActions;
    expect(actions).toBeGreaterThan(0);
    expect(state.dayManagement.dirtyTableIds).toEqual([]);

    state = gameReducer(state, { type: "complete_day" });
    expect(state.daySummary?.helperAutonomyRecap).toContain("without being asked");
    expect(state.daySummary?.helperAutonomyRecap).toContain(String(actions));
  });
});
