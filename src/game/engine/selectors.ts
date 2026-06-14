import {
  daySevenHookLetter,
  weekOneDayModifiers,
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
  getProductById,
  getStressLabel,
  SUPPLY_CAPS,
  SUPPLY_UNIT_COSTS
} from "./management";
import { decorSlots, getDecorTier, getMaxDecorTier } from "../data/decor";
import { getCurrentObjective, getObjectiveStatus } from "./objectives";
import type {
  DayDefinition,
  DayModifierDefinition,
  EventDefinition,
  GuestDefinition,
  GuestId,
  KassandraMessageDefinition,
  ProductDefinition,
  StaffOptionDefinition
} from "../types/content";
import type {
  DayActionId,
  DayShiftRating,
  DecorSlotId,
  GameState,
  IngredientKey,
  SupplyState
} from "../types/game";

export { getCurrentObjective, getObjectiveStatus };

export const requiredDayActionIds: readonly DayActionId[] = [
  "take_order",
  "prepare_drink",
  "clean_tables"
];

export function getCurrentDayDefinition(state: GameState): DayDefinition {
  return weekOneDays[state.day - 1];
}

export function getCurrentDayModifier(state: GameState): DayModifierDefinition {
  const modifierId = state.run.modifierIds[state.day - 1];
  const modifier =
    weekOneDayModifiers.find((candidate) => candidate.id === modifierId) ??
    weekOneDayModifiers.find((candidate) => candidate.day === state.day);

  return modifier ?? weekOneDayModifiers[0];
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

export interface NextGuestPreview {
  name: string;
  /** In-world order or remark shown before serving. */
  orderLine: string;
  /** Behavioral cue that teaches preference without a tutorial panel. */
  learningCue: string | null;
  /** Name of a product this guest particularly values, if any (a light hint). */
  wants: string | null;
}

/**
 * A subtle preview of the next guest the queue will serve, so the player can
 * choose a drink with some foresight. Deterministic — uses the same guest
 * selection as the serve flow. Returns null when the café is not actively open.
 */
export function getNextGuestPreview(state: GameState): NextGuestPreview | null {
  if (state.dayPhase !== "open" || state.dayManagement.actionPointsRemaining <= 0) {
    return null;
  }

  const guest = getGuestForCustomer(state, state.dayManagement.customersServed);
  if (!guest) {
    return null;
  }

  const wantedProductId = guest.preferredProductId ?? guest.appreciatedProductIds?.[0];
  const knownPreferenceId = state.guestMemory[guest.id]?.knownPreferenceId;
  const knownProductName = knownPreferenceId ? getProductById(knownPreferenceId).name : null;

  return {
    name: guest.name,
    orderLine: guest.orderLine ?? guest.sampleLines[0] ?? "",
    learningCue: knownProductName
      ? `You remember: ${guest.name} tends toward ${knownProductName}.`
      : guest.learningCue ?? getCurrentDayModifier(state).learningHint,
    wants: knownProductName ?? (wantedProductId ? getProductById(wantedProductId).name : null)
  };
}

/**
 * The line KASSANDRA speaks when consulted. Deterministically drawn from the
 * messages unlocked by the current day, varied by how far into the day it is,
 * so repeated days surface different (and, by Day 7, more ominous) lines.
 */
export function getKassandraConsultLine(state: GameState): string {
  const pool = kassandraMessages.filter((message) => message.day <= state.day);
  if (pool.length === 0) {
    return "KASSANDRA hums, then says nothing it is willing to put in writing.";
  }
  const index = state.dayManagement.customersServed % pool.length;
  return pool[index].text;
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

export interface DioramaGuestVisibility {
  cem: boolean;
  mira: boolean;
  lukas: boolean;
  christa: boolean;
  bohn: boolean;
  strange: boolean;
}

export function getDioramaGuestVisibility(
  state: GameState
): DioramaGuestVisibility {
  const { customersServed } = state.dayManagement;

  return {
    cem: customersServed >= 1,
    mira: customersServed >= 2,
    lukas: customersServed >= 3,
    christa: state.day >= 2 && customersServed >= 2,
    bohn: state.day >= 3 && customersServed >= 1,
    strange: state.day >= 4 && customersServed >= 3
  };
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

/**
 * A short, cozy narrative recap of the closed day, composed deterministically
 * from the day summary. Voice over numbers (the figures sit in the list below).
 * Carries a light "the ledger remembers" save-point hint (see #55); Day 7 reads
 * a touch heavier. Returns "" when there is no day summary.
 */
export function getDayEndRecapLine(state: GameState): string {
  const summary = state.daySummary;
  if (!summary) {
    return "";
  }

  const ratingSentence: Record<DayShiftRating, string> = {
    "Calm Shift":
      "A quiet day. The regulars came, drank, and went back to wherever regulars go.",
    "Busy Shift":
      "A full day. You kept up — mostly. The queue thinned out before the light did.",
    "Messy but Profitable":
      "The till is heavier than the café is tidy. The tables can wait until tomorrow. Probably.",
    "Barely Held Together":
      "You held the day together with both hands and a damp cloth. It mostly worked."
  };

  const reputationClause =
    summary.reputationDelta > 0
      ? "Word of the café travelled a little further."
      : summary.reputationDelta < 0
        ? "The café's standing took a small dent."
        : "";

  const ledgerClause =
    state.day >= 7
      ? "You close the ledger. For a moment the pages feel heavier than one week should weigh."
      : "You close the ledger; the café remembers the day so you don't have to.";

  return [ratingSentence[summary.rating], reputationClause, ledgerClause]
    .filter((part) => part.length > 0)
    .join(" ");
}

export interface DecorUpgradeOption {
  id: DecorSlotId;
  label: string;
  currentTierName: string;
  /** The next purchasable tier, or null when the slot is maxed. */
  next: {
    name: string;
    cost: number;
    reputationBonus: number;
    affordable: boolean;
  } | null;
}

/** Décor shop rows for the day-end review: current look + the next upgrade. */
export function getDecorUpgradeOptions(state: GameState): DecorUpgradeOption[] {
  return decorSlots.map((slot) => {
    const currentTier = state.decor[slot.id];
    const currentTierName =
      getDecorTier(slot.id, currentTier)?.name ?? slot.tiers[0].name;
    const nextTierDef = getDecorTier(slot.id, currentTier + 1);

    return {
      id: slot.id,
      label: slot.label,
      currentTierName,
      next:
        nextTierDef && currentTier < getMaxDecorTier(slot.id)
          ? {
              name: nextTierDef.name,
              cost: nextTierDef.cost,
              reputationBonus: nextTierDef.reputationBonus,
              affordable: nextTierDef.cost <= state.resources.money
            }
          : null
    };
  });
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
