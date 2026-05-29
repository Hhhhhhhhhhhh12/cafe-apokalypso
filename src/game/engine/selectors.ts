import {
  daySevenHookLetter,
  kassandraMessages,
  weekOneDays,
  weekOneEvents,
  weekOneGuests,
  weekOneProducts,
  weekOneStaffOptions
} from "../data";
import {
  getCleanlinessLabel,
  getHelperLabel,
  getStressLabel,
  SUPPLY_CAPS,
  SUPPLY_UNIT_COSTS
} from "./management";
import type {
  DayDefinition,
  EventDefinition,
  GuestDefinition,
  KassandraMessageDefinition,
  ProductDefinition,
  StaffOptionDefinition
} from "../types/content";
import type { DayActionId, GameState, IngredientKey, SupplyState } from "../types/game";

export const requiredDayActionIds: readonly DayActionId[] = [
  "take_order",
  "prepare_drink",
  "clean_tables"
];

export function getCurrentDayDefinition(state: GameState): DayDefinition {
  return weekOneDays[state.day - 1];
}

export function getAvailableProducts(state: GameState): readonly ProductDefinition[] {
  return weekOneProducts.filter((product) => product.firstDay <= state.day);
}

export function getAvailableGuests(state: GameState): readonly GuestDefinition[] {
  const currentDay = getCurrentDayDefinition(state);
  const guestIds = new Set(currentDay.guestIds);

  return weekOneGuests.filter((guest) => guestIds.has(guest.id));
}

export function getCurrentDayEvents(state: GameState): readonly EventDefinition[] {
  const currentDay = getCurrentDayDefinition(state);
  const eventIds = new Set(currentDay.eventIds);

  return weekOneEvents.filter((event) => eventIds.has(event.id));
}

export function getVisibleKassandraMessages(
  state: GameState
): readonly KassandraMessageDefinition[] {
  if (!state.kassandraInstalled || state.day < 6) {
    return [];
  }

  return kassandraMessages.filter((message) => message.day <= state.day);
}

export function getVisibleStaffOptions(
  state: GameState
): readonly StaffOptionDefinition[] {
  if (!state.unlocks.staff || state.day < 5) {
    return [];
  }

  return weekOneStaffOptions.filter((staffOption) => staffOption.unlockDay <= state.day);
}

export function getVisibleDaySevenLetter(state: GameState): string | null {
  if (!state.demoComplete || !state.weirdnessVisible) {
    return null;
  }

  return daySevenHookLetter.body;
}

export function canCompleteCurrentDay(state: GameState): boolean {
  if (state.demoComplete || state.dayPhase !== "open") {
    return false;
  }

  return (
    state.dayManagement.customersServed > 0 &&
    state.completedActions.includes("take_order") &&
    (state.completedActions.includes("clean_tables") ||
      (state.helperAssignment?.helperId === "jana" &&
        state.helperAssignment.taskId === "cleaning"))
  );
}

export function getMissingRequiredActions(state: GameState): readonly DayActionId[] {
  const missingActions: DayActionId[] = [];

  if (
    state.dayManagement.customersServed <= 0 ||
    !state.completedActions.includes("take_order")
  ) {
    missingActions.push("take_order");
  }

  if (
    !state.completedActions.includes("clean_tables") &&
    !(
      state.helperAssignment?.helperId === "jana" &&
      state.helperAssignment.taskId === "cleaning"
    )
  ) {
    missingActions.push("clean_tables");
  }

  return missingActions;
}

export function getManagementHudLabels(state: GameState) {
  return {
    cleanliness: getCleanlinessLabel(state.resources.cleanliness),
    stress: getStressLabel(state.resources.stress),
    reputation: getReputationLabel(state.resources.reputation),
    helper: getHelperLabel(state.helperAssignment)
  };
}

export function getRestockPreview(state: GameState) {
  const totalCost = getSupplyPurchaseCost(state.pendingSupplyPurchase);

  return {
    totalCost,
    balanceAfter: Math.round((state.resources.money - totalCost) * 100) / 100,
    canAfford: totalCost <= state.resources.money,
    maxPurchase: {
      coffee: SUPPLY_CAPS.coffee - state.supplies.coffee,
      milk: SUPPLY_CAPS.milk - state.supplies.milk,
      pastries: SUPPLY_CAPS.pastries - state.supplies.pastries
    } satisfies SupplyState
  };
}

export function getSupplyPurchaseCost(purchase: SupplyState): number {
  return Math.round(
    (purchase.coffee * SUPPLY_UNIT_COSTS.coffee +
      purchase.milk * SUPPLY_UNIT_COSTS.milk +
      purchase.pastries * SUPPLY_UNIT_COSTS.pastries) *
      100
  ) / 100;
}

export function getIngredientLabel(ingredient: IngredientKey): string {
  const labels: Record<IngredientKey, string> = {
    coffee: "Coffee beans",
    milk: "Milk",
    pastries: "Pastries"
  };

  return labels[ingredient];
}

function getReputationLabel(reputation: number): string {
  if (reputation >= 75) {
    return "excellent";
  }
  if (reputation >= 35) {
    return "stable";
  }
  if (reputation >= 10) {
    return "building";
  }
  return "fragile";
}
