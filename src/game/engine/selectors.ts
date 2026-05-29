import {
  daySevenHookLetter,
  kassandraMessages,
  weekOneDays,
  weekOneEvents,
  weekOneGuests,
  weekOneProducts,
  weekOneStaffOptions
} from "../data";
import type {
  DayDefinition,
  EventDefinition,
  GuestDefinition,
  KassandraMessageDefinition,
  ProductDefinition,
  StaffOptionDefinition
} from "../types/content";
import type { DayActionId, GameState } from "../types/game";

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
  if (!state.unlocks.staff) {
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
  if (state.demoComplete) {
    return false;
  }

  return requiredDayActionIds.every((actionId) =>
    state.completedActions.includes(actionId)
  );
}

export function getMissingRequiredActions(state: GameState): readonly DayActionId[] {
  return requiredDayActionIds.filter(
    (actionId) => !state.completedActions.includes(actionId)
  );
}
