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
  ACTION_BUDGET_BY_DAY,
  getCleanlinessLabel,
  getHelperLabel,
  getStressLabel,
  SUPPLY_CAPS,
  SUPPLY_UNIT_COSTS
} from "./management";
import { getCurrentObjective, getObjectiveStatus } from "./objectives";
import type {
  DayDefinition,
  EventDefinition,
  GuestDefinition,
  GuestId,
  KassandraMessageDefinition,
  ProductDefinition,
  StaffOptionDefinition
} from "../types/content";
import type { DayActionId, GameState, IngredientKey, SupplyState } from "../types/game";

export { getCurrentObjective, getObjectiveStatus };

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

/**
 * Player-facing narrative event cards for the current day.
 * Process/structural beats (tone "normal", e.g. day-1-opening-rhythm) are
 * intentionally excluded — they are authoring metadata, not story moments.
 */
export function getNarrativeEventCards(
  state: GameState
): readonly EventDefinition[] {
  return getCurrentDayEvents(state).filter((event) => event.tone !== "normal");
}

/**
 * Deterministically selects the serve line for the customer at the given
 * zero-based index within the current day. Strange guests are preferred once
 * three customers have already been served (customerIndex >= 3), so the
 * subtly-strange regulars reliably get a serve-line moment on their days.
 * No randomness is used.
 */
export function getServeLineForCustomer(
  state: GameState,
  customerIndex: number
): string {
  const guest = getGuestForCustomer(state, customerIndex);

  return guest?.serveLine ?? "The order is served.";
}

export function getGuestForCustomer(
  state: GameState,
  customerIndex: number
): GuestDefinition | undefined {
  const index = Math.max(0, Math.floor(customerIndex));
  const currentDay = getCurrentDayDefinition(state);
  const guestsById = new Map<GuestId, GuestDefinition>(
    weekOneGuests.map((guest) => [guest.id, guest] as [GuestId, GuestDefinition])
  );
  const dayGuests = currentDay.guestIds
    .map((id) => guestsById.get(id))
    .filter((guest): guest is GuestDefinition => Boolean(guest));

  if (dayGuests.length === 0) {
    return undefined;
  }

  const normalPool = dayGuests.filter((guest) => guest.category === "normal");
  const strangePool = dayGuests.filter(
    (guest) => guest.category === "subtly_strange"
  );

  if (index >= 3 && strangePool.length > 0) {
    return strangePool[(index - 3) % strangePool.length];
  }

  if (normalPool.length > 0) {
    return normalPool[index % normalPool.length];
  }

  return dayGuests[index % dayGuests.length];
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
  if (!state.unlocks.staff || state.day < 3) {
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

  // When all action points are spent, the day can always be closed —
  // this prevents soft-locks (no supplies, no cleaning, etc.).
  // Any missing tasks (cleaning, serving) apply penalties in applyDayEndConsequences.
  if (state.dayManagement.actionPointsRemaining <= 0) {
    return true;
  }

  // While actions remain, require at least one served customer before closing.
  return (
    state.dayManagement.customersServed > 0 &&
    state.completedActions.includes("take_order")
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

  // clean_tables is no longer a hard requirement — skipping it applies a penalty at day end.

  return missingActions;
}

export function getManagementHudLabels(state: GameState) {
  return {
    cleanliness: getCleanlinessLabel(state.resources.cleanliness),
    stress: getStressLabel(state.resources.stress),
    reputation: getReputationLabel(state.resources.reputation),
    helper: getHelperLabel(state.helperAssignment),
    actionCapacity: `${state.dayManagement.actionPointsRemaining}/${ACTION_BUDGET_BY_DAY[state.day]} actions left`
  };
}

export function hasActionCapacity(state: GameState): boolean {
  return state.dayManagement.actionPointsRemaining > 0;
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
