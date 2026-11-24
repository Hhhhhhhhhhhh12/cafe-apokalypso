import type { GameState } from "../types/game";

export const RUSH_GUESTS = 2;
export const RUSH_TIP = 4;
export const RUSH_REPUTATION_BONUS = 2;
export const NELE_RUSH_TIP_BONUS = 2;

export function getRushStart(day: GameState["day"]): number | null {
  if (day < 5) return null;
  return day === 7 ? 3 : 2;
}

export function isRushGuest(
  state: GameState,
  position = state.dayManagement.customersServed + state.dayManagement.guestsLost
): boolean {
  const start = getRushStart(state.day);
  return Boolean(state.dayManagement.rush) &&
    state.dayPhase === "open" && start !== null &&
    position >= start && position < start + RUSH_GUESTS;
}

export function getPendingRushGuests(state: GameState): number {
  const start = getRushStart(state.day);
  if (start === null || !isRushGuest(state)) return 0;
  return start + RUSH_GUESTS - state.dayManagement.customersServed - state.dayManagement.guestsLost;
}

export function getRushComplaintPenalty(state: GameState): number {
  return state.helperAssignment ? 1 : 2;
}
