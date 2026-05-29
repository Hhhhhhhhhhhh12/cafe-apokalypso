import { weekOneDays } from "../data";
import type { DayObjectiveDefinition } from "../types/content";
import type { DayObjectiveStatus, GameState } from "../types/game";

export interface ObjectiveStatusView {
  objective: DayObjectiveDefinition;
  status: DayObjectiveStatus;
  completed: boolean;
}

export function getCurrentObjective(state: GameState): DayObjectiveDefinition {
  return weekOneDays[state.day - 1].objective;
}

export function getObjectiveStatus(state: GameState): ObjectiveStatusView {
  const objective = getCurrentObjective(state);
  const completed = isObjectiveCompleted(state);
  const status: DayObjectiveStatus = completed
    ? "completed"
    : state.dayPhase === "day_end"
      ? "missed"
      : "active";

  return {
    objective,
    status,
    completed
  };
}

export function isObjectiveCompleted(state: GameState): boolean {
  const management = state.dayManagement;
  const cleaned =
    management.cleaningActions > 0 ||
    state.completedActions.includes("clean_tables") ||
    (state.helperAssignment?.helperId === "jana" &&
      state.helperAssignment.taskId === "cleaning");

  switch (state.day) {
    case 1:
      return management.customersServed >= 2 && cleaned;
    case 2:
      return management.customersServed >= 3 && state.resources.stress <= 60;
    case 3:
      return management.offerReviewed && management.customersServed >= 2;
    case 4:
      return management.advertisingRun && management.customersServed >= 3;
    case 5:
      return management.helperDecisionMade && management.customersServed >= 3;
    case 6:
      return management.kassandraConsulted && management.customersServed >= 3;
    case 7:
      return management.customersServed >= 4 && cleaned;
    default:
      return false;
  }
}
