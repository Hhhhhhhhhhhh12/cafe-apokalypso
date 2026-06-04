import { weekOneProducts, weekOneStaffOptions } from "../data";
import type { ProductDefinition, ProductId, StaffOptionId } from "../types/content";
import type {
  CleanlinessStateLabel,
  DayManagementState,
  DayShiftRating,
  GameState,
  HelperAssignment,
  HelperTaskId,
  IngredientKey,
  StressStateLabel,
  SupplyState
} from "../types/game";

/** Starting reputation for a new game. Higher than the old value (1) so a
 *  fresh café has a small buffer before the reputation fail-state. */
export const STARTING_REPUTATION = 25;

export const SUPPLY_CAPS: SupplyState = {
  coffee: 20,
  milk: 20,
  pastries: 12
};

/**
 * Income scales with reputation: a well-regarded café earns full price, a
 * struggling one earns less. Linear from 60% (reputation 0) to 100%
 * (reputation 100). Deterministic, rounded to cents by the caller.
 */
export function getReputationIncomeFactor(reputation: number): number {
  const clamped = clamp(reputation, 0, 100);
  return 0.6 + 0.4 * (clamped / 100);
}

/** Sale price actually earned, after the reputation income factor, in cents-rounded euros. */
export function getEarnedPrice(basePrice: number, reputation: number): number {
  return Math.round(basePrice * getReputationIncomeFactor(reputation) * 100) / 100;
}

/** Fixed daily overhead (rent, utilities) deducted every day at closing. */
export const DAILY_FIXED_COST = 6;

export const SUPPLY_UNIT_COSTS: Record<IngredientKey, number> = {
  coffee: 0.8,
  milk: 0.4,
  pastries: 1.2
};

export const COMFORTABLE_CAPACITY_BY_DAY: Record<GameState["day"], number> = {
  1: 5,
  2: 5,
  3: 6,
  4: 6,
  5: 7,
  6: 7,
  7: 8
};

export const ACTION_BUDGET_BY_DAY: Record<GameState["day"], number> = {
  1: 3,
  2: 4,
  3: 4,
  4: 5,
  5: 5,
  6: 5,
  7: 6
};

/**
 * Everyday end-of-day strain lines, shown when stress is high (>= 61).
 * Tone: dry, warm, understated — grounded café mishaps with one small,
 * deniable thing slightly off. Not horror, not obvious anomalies yet.
 * See docs/CONTENT_GUIDE.md.
 */
export const MUNDANE_STRESS_EVENT_LINES = [
  "The coffee machine made a sound it has not made before. You reset it. The manual stops one page short of explaining it.",
  "A guest asked for the bill three times before you noticed. You apologised. They tipped anyway — a little less, and a little kindly.",
  "You dropped a cup. Not your finest moment. Nobody said anything, which was somehow worse.",
  "The milk frother quit mid-cappuccino. You finished it by hand. The guest left a note: “Authentic.”",
  "A queue formed, then cleared. You handled all of it. You cannot quite reconstruct how.",
  "The register froze for eleven seconds, then carried on as if it hadn’t. It did not offer an explanation, and you did not ask."
] as const;

export function createInitialDayManagement(
  reputationAtStart: number,
  day: GameState["day"] = 1
): DayManagementState {
  return {
    actionPointsRemaining: ACTION_BUDGET_BY_DAY[day],
    actionPointsSpent: 0,
    customersServed: 0,
    moneyEarned: 0,
    moneySpent: 0,
    suppliesUsed: { coffee: 0, milk: 0, pastries: 0 },
    cleaningActions: 0,
    offerReviewed: false,
    advertisingRun: false,
    kassandraConsulted: false,
    helperDecisionMade: day < 3,
    reputationAtStart,
    cleanlinessStressApplied: false,
    noCleaningStressApplied: false,
    emptySupplyStressIngredients: [],
    slowCleaningStressReductionUsed: false,
    baristaReputationBonus: 0,
    helperExtraOrdersRemaining: 0,
    extraAdvertisingActions: 0,
    appreciationBonusesGiven: 0
  };
}

export function getCleanlinessLabel(value: number): CleanlinessStateLabel {
  if (value >= 75) {
    return "Sauber";
  }
  if (value >= 50) {
    return "Ordentlich";
  }
  if (value >= 25) {
    return "Unordentlich";
  }
  return "Chaotisch";
}

export function getStressLabel(value: number): StressStateLabel {
  if (value >= 81) {
    return "Überlastet";
  }
  if (value >= 61) {
    return "Angespannt";
  }
  if (value >= 41) {
    return "Geschäftig";
  }
  return "Ruhig";
}

export function getDayShiftRating(state: GameState): DayShiftRating {
  const { resources, dayManagement } = state;

  if (resources.stress >= 81 || resources.cleanliness < 25) {
    return "Barely Held Together";
  }

  if (dayManagement.moneyEarned >= 12 && resources.cleanliness < 50) {
    return "Messy but Profitable";
  }

  if (resources.stress >= 41 || dayManagement.customersServed >= 4) {
    return "Busy Shift";
  }

  return "Calm Shift";
}

export function clampSupply(ingredient: IngredientKey, value: number): number {
  return clamp(Math.floor(value), 0, SUPPLY_CAPS[ingredient]);
}

export function clampResource(value: number): number {
  return clamp(Math.round(value * 100) / 100, 0, Number.POSITIVE_INFINITY);
}

export function clampMeter(value: number): number {
  return clamp(Math.round(value), 0, 100);
}

export function getProductById(productId: ProductId): ProductDefinition {
  const product = weekOneProducts.find((candidate) => candidate.id === productId);

  if (!product) {
    return weekOneProducts[0];
  }

  return product;
}

export function getDefaultProductForState(state: GameState): ProductDefinition {
  const availableProducts = weekOneProducts.filter(
    (product) => product.firstDay <= state.day
  );
  const index = state.dayManagement.customersServed % availableProducts.length;

  return availableProducts[index] ?? weekOneProducts[0];
}

export function getMissingIngredients(
  product: ProductDefinition,
  supplies: SupplyState,
  assignment: HelperAssignment | null
): IngredientKey[] {
  const missingIngredients: IngredientKey[] = [];

  for (const ingredient of Object.keys(SUPPLY_CAPS) as IngredientKey[]) {
    const required = getIngredientRequirement(product, ingredient, assignment);

    if (required > 0 && supplies[ingredient] < required) {
      missingIngredients.push(ingredient);
    }
  }

  return missingIngredients;
}

export function findSubstituteProduct(
  product: ProductDefinition,
  supplies: SupplyState,
  assignment: HelperAssignment | null
): ProductDefinition | null {
  const substituteIds: ProductId[] =
    product.id === "cappuccino"
      ? ["espresso", "filterkaffee"]
      : product.id === "kaffee-croissant"
        ? ["filterkaffee", "espresso", "croissant"]
        : product.id === "croissant"
          ? []
          : [];

  for (const substituteId of substituteIds) {
    const substitute = getProductById(substituteId);
    if (getMissingIngredients(substitute, supplies, assignment).length === 0) {
      return substitute;
    }
  }

  return null;
}

export function applyProductConsumption(
  product: ProductDefinition,
  supplies: SupplyState,
  assignment: HelperAssignment | null
): SupplyState {
  const nextSupplies = { ...supplies };

  for (const ingredient of Object.keys(SUPPLY_CAPS) as IngredientKey[]) {
    const required = getIngredientRequirement(product, ingredient, assignment);
    nextSupplies[ingredient] = clampSupply(ingredient, nextSupplies[ingredient] - required);
  }

  return nextSupplies;
}

export function getIngredientRequirement(
  product: ProductDefinition,
  ingredient: IngredientKey,
  assignment: HelperAssignment | null
): number {
  const baseRequirement = product.ingredients[ingredient] ?? 0;

  if (
    ingredient === "milk" &&
    baseRequirement > 0 &&
    assignment?.helperId === "nino" &&
    assignment.taskId === "barista"
  ) {
    return Math.floor(baseRequirement * 0.9);
  }

  return baseRequirement;
}

export function createHelperAssignment(
  helperId: StaffOptionId,
  taskId: HelperTaskId
): HelperAssignment | null {
  const staffOption = weekOneStaffOptions.find((candidate) => candidate.id === helperId);

  if (!staffOption || !isValidHelperTask(helperId, taskId)) {
    return null;
  }

  return {
    helperId,
    taskId,
    locked: false,
    dailyCost: staffOption.dailyCost,
    flavorLine: getHelperFlavorLine(helperId, taskId)
  };
}

export function getHelperLabel(assignment: HelperAssignment | null): string {
  if (!assignment) {
    return "No helper assigned";
  }

  const staffOption = weekOneStaffOptions.find(
    (candidate) => candidate.id === assignment.helperId
  );

  return `${staffOption?.name ?? assignment.helperId}: ${getHelperTaskLabel(
    assignment.taskId
  )}`;
}

export function getHelperTaskLabel(taskId: HelperTaskId): string {
  const labels: Record<HelperTaskId, string> = {
    cleaning: "Cleaning",
    service: "Service",
    barista: "Barista",
    counter: "Counter",
    marketing: "Marketing"
  };

  return labels[taskId];
}

export function getHelperTaskHint(taskId: HelperTaskId): string {
  const hints: Record<HelperTaskId, string> = {
    cleaning: "Keeps the tables tidy — cleanliness stays above 45 without spending an action.",
    service: "Serves a second guest on each order — more income, faster shift.",
    barista: "Espresso and cappuccino earn a little extra reputation (up to 3×).",
    counter: "Steady hands at the till — smooths the shift.",
    marketing: "Adds an extra advertising action today."
  };

  return hints[taskId];
}

export function getHelperFlavorLine(
  helperId: StaffOptionId,
  taskId: HelperTaskId
): string {
  if (helperId === "jana" && taskId === "cleaning") {
    return "Jana cleaned everything. You are not sure when.";
  }
  if (helperId === "jana" && taskId === "service") {
    return "Jana took three orders. She looks mildly confused about the menu but nobody complained.";
  }
  if (helperId === "nino" && taskId === "barista") {
    return "Nino made a latte art. It was a bird. Or possibly a bureaucratic stamp.";
  }
  if (helperId === "nino" && taskId === "counter") {
    return "Nino handled the counter. The queue moved. Stress dropped slightly.";
  }
  if (helperId === "nele" && taskId === "marketing") {
    return "Nele posted something. It got 14 likes and one comment in a language Google says does not exist.";
  }

  return "Nele called the café 'charmingly precarious.' She meant it as a compliment. Probably.";
}

function isValidHelperTask(helperId: StaffOptionId, taskId: HelperTaskId): boolean {
  const validTasks: Record<StaffOptionId, HelperTaskId[]> = {
    jana: ["cleaning", "service"],
    nino: ["barista", "counter"],
    nele: ["marketing", "counter"]
  };

  return validTasks[helperId].includes(taskId);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
