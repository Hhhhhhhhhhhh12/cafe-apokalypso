import { weekOneProducts, weekOneStaffOptions } from "../data";
import type {
  GuestDefinition,
  ProductDefinition,
  ProductId,
  StaffOptionId
} from "../types/content";
import type {
  CleanlinessStateLabel,
  DayManagementState,
  DayShiftRating,
  EmployeeLevel,
  GameState,
  HelperAssignment,
  HelperAutonomyLevel,
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

/** XP thresholds for each employee level. Level 1 = new hire (0+ XP), L2 = 5+, L3 = 10+. */
export const XP_LEVEL_THRESHOLDS: Record<EmployeeLevel, number> = { 1: 0, 2: 5, 3: 10 };

export function getEmployeeLevel(xp: number): EmployeeLevel {
  if (xp >= XP_LEVEL_THRESHOLDS[3]) return 3;
  if (xp >= XP_LEVEL_THRESHOLDS[2]) return 2;
  return 1;
}

/** Returns the per-day bonuses granted by a given employee level. */
export function getEmployeeLevelBonuses(level: EmployeeLevel): { extraAP: number; tipBonus: number } {
  return {
    extraAP: level >= 2 ? 1 : 0,
    tipBonus: level >= 3 ? 0.05 : 0
  };
}

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
 * Guest patience & queue (#PATIENCE). The guest at the counter advances through
 * four states as the player spends action points on things other than serving:
 *   actionsWithoutServing 0 → Relaxed
 *   actionsWithoutServing 1 → Waiting
 *   actionsWithoutServing 2 → Restless
 *   actionsWithoutServing 3 → Leaving   (danger zone — serve next or they walk)
 *   actionsWithoutServing 4 → Walkout   (guest leaves unserved)
 *
 * The pip bar uses currentGuestPatience / currentGuestPatienceMax, which are
 * kept in sync with actionsWithoutServing (4 fixed pips, one drains per action).
 */
export const PATIENCE_TICK = 25;

/** Total pip slots in the patience bar — always 4, one per state. */
export const PATIENCE_TICKS_MAX = 4;

/** Walkouts only bite from Day 4 on; Days 1–3 keep the cozy onboarding window —
 *  the patience bar still ticks down (teaching the mechanic) but nobody leaves. */
export const WALKOUT_FROM_DAY = 4;

/** actionsWithoutServing threshold at which a guest walks out. */
export const WALKOUT_THRESHOLD = 4;

/** Stress added when a guest gives up and walks out. */
export const WALKOUT_STRESS = 8;
export const WALKOUT_REPUTATION_PENALTY = 1;

/**
 * Flavor tag helper — kept for guest characterisation (orderLine choices, etc.)
 * but no longer controls walkout timing (all guests share the same 4-tick window).
 */
export function getGuestPatienceTicks(guest: GuestDefinition): number {
  const tags = guest.behaviorTags;
  if (tags.some((tag) => tag === "impatient" || tag === "quick-service")) {
    return 2;
  }
  if (
    tags.some(
      (tag) => tag === "patient" || tag === "regular" || tag === "calm" || tag === "still"
    )
  ) {
    return 4;
  }
  return 3;
}

/**
 * Full patience value (0..max) for a guest at the moment they reach the counter.
 * Always PATIENCE_TICKS_MAX * PATIENCE_TICK (100) — uniform across all guests so
 * the 4-pip bar reads cleanly: each pip = one non-serve action of tolerance.
 * The messy-café penalty still deducts one tick on arrival (see setNextGuestPatience).
 */
export function getGuestPatienceMax(): number {
  return PATIENCE_TICKS_MAX * PATIENCE_TICK;
}

export function guestsCanWalkOut(day: GameState["day"]): boolean {
  return day >= WALKOUT_FROM_DAY;
}

export type GuestPatienceLabel = "Relaxed" | "Waiting" | "Restless" | "Leaving";

/**
 * Derives the patience label from actionsWithoutServing.
 * The old percentage-based overload is kept for backward compat with the pip bar
 * — callers that already have (value, max) from currentGuestPatience can still use
 * it, but the canonical path goes through actionsWithoutServing.
 */
export function getGuestPatienceLabel(value: number, max: number): GuestPatienceLabel {
  if (max <= 0 || value >= max * 0.66) {
    return "Relaxed";
  }
  if (value >= max * 0.33) {
    return "Waiting";
  }
  if (value > 0) {
    return "Restless";
  }
  return "Leaving";
}

/**
 * Derives the patience label directly from the actionsWithoutServing counter.
 * This is the canonical source used by the reducer and selectors.
 *
 * totalTicks is the guest's actual tick budget (PATIENCE_TICKS_MAX, or one
 * less on a messy-café day — see setNextGuestPatience). Labelling off ticks
 * *remaining* rather than a fixed actionsWithoutServing threshold keeps
 * "Leaving" anchored to "one more non-serve action walks them out" even when
 * the messy penalty shrinks the budget to 3 ticks instead of 4.
 */
export function getPatienceLabelFromCounter(
  actionsWithoutServing: number,
  totalTicks: number = PATIENCE_TICKS_MAX
): GuestPatienceLabel {
  if (actionsWithoutServing <= 0) return "Relaxed";
  const remaining = totalTicks - actionsWithoutServing;
  if (remaining <= 1) return "Leaving";
  if (remaining === 2) return "Restless";
  return "Waiting";
}

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
    dirtyTableIds: [],
    offerReviewed: false,
    advertisingRun: false,
    socialAdRun: false,
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
    appreciationBonusesGiven: 0,
    decorBonusesGiven: 0,
    currentGuestPatience: 0,
    currentGuestPatienceMax: 0,
    guestsLost: 0,
    serveStreak: 0,
    bestServeStreak: 0,
    actionsWithoutServing: 0,
    helperAutonomousActions: 0
  };
}

/**
 * Helper autonomy schedule (issue #73/#132): helpers only exist from Day 3
 * onward (see selectHelper's day-3 gate in reducer.ts), so "micromanagement"
 * covers Days 1-2 as a vacuous default — Day 3 is the helper's first, closely
 * directed day ("learning"), Day 4+ is fully autonomous.
 */
export function getHelperAutonomyLevel(day: GameState["day"]): HelperAutonomyLevel {
  if (day < 3) {
    return "micromanagement";
  }
  if (day === 3) {
    return "learning";
  }
  return "autonomous";
}

export function getCleanlinessLabel(value: number): CleanlinessStateLabel {
  if (value >= 75) {
    return "Clean";
  }
  if (value >= 50) {
    return "Tidy";
  }
  if (value >= 25) {
    return "Messy";
  }
  return "Chaotic";
}

export function getStressLabel(value: number): StressStateLabel {
  if (value >= 81) {
    return "Overloaded";
  }
  if (value >= 61) {
    return "Tense";
  }
  if (value >= 41) {
    return "Busy";
  }
  return "Calm";
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
    return Math.max(1, Math.floor(baseRequirement * 0.9));
  }

  return baseRequirement;
}

export function createHelperAssignment(
  helperId: StaffOptionId,
  taskId: HelperTaskId,
  day: GameState["day"]
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
    flavorLine: getHelperFlavorLine(helperId, taskId),
    autonomyLevel: getHelperAutonomyLevel(day)
  };
}

/**
 * Day-end helper recap (#131): a narrative line reinforcing the autonomy ramp.
 * Days 1-2 the player did everything; Day 3 the helper shows first initiative;
 * Days 4-7 the numbers climb. Uses dayManagement.helperAutonomousActions.
 */
export function getHelperAutonomyRecapLine(
  assignment: HelperAssignment | null,
  autonomousActions: number
): string {
  if (!assignment) {
    return "You handled everything today.";
  }

  const name =
    weekOneStaffOptions.find((candidate) => candidate.id === assignment.helperId)?.name ??
    assignment.helperId;

  if (assignment.autonomyLevel === "micromanagement") {
    return `You handled everything today. ${name} watched closely — and took notes.`;
  }

  if (assignment.taskId !== "cleaning") {
    const taskRecaps: Record<Exclude<HelperTaskId, "cleaning">, string> = {
      service: `${name} kept service moving through the shift.`,
      barista: `${name} stayed on the coffee machine and watched the quality.`,
      counter: `${name} kept the counter steady from opening.`,
      marketing: `${name}'s promotion was ready when you needed it.`
    };
    return taskRecaps[assignment.taskId];
  }

  if (assignment.autonomyLevel === "learning") {
    if (autonomousActions === 0) {
      return `${name} waited for instructions today. Tomorrow, maybe more.`;
    }
    return `${name}: "I noticed the cup was empty and cleared it." (${autonomousActions} small ${
      autonomousActions === 1 ? "thing" : "things"
    } done unasked)`;
  }

  if (autonomousActions === 0) {
    return `${name} was ready to take over, but the day never gave them the chance.`;
  }
  return `${name} cleared ${autonomousActions} ${
    autonomousActions === 1 ? "table" : "tables"
  } without being asked.${autonomousActions >= 4 ? " The café is starting to run itself." : ""}`;
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
    cleaning: "Keeps the floor tidy — Jana can clear a specific marked table without spending your action. Each serve still drops cleanliness by 2; she also keeps it above 45.",
    service: "Serves a second guest on each order — doubles income per action point while the extra-orders pool lasts.",
    barista: "Espresso and cappuccino earn +1 Rep each (up to 3 times today). Nino also uses slightly less milk on milk drinks.",
    counter: "Steady hands at the till reduce opening stress — Nino saves 8 Stress on arrival, Nele saves 5.",
    marketing: "Adds a free advertising action today. Nele's post can reach further than a standard flyer."
  };

  return hints[taskId];
}

export function getHelperFlavorLine(
  helperId: StaffOptionId,
  taskId: HelperTaskId
): string {
  // Jana — service/cleaning
  if (helperId === "jana" && taskId === "cleaning") {
    return "Jana kept an eye on the floor. When a marked table needed it, she took it without waiting. Cleanliness held above 45 all shift.";
  }
  if (helperId === "jana" && taskId === "service") {
    return "Jana took orders alongside you. Each action served an extra guest — income roughly doubled per round. She remained calm about the menu gaps.";
  }
  // Nino — barista/counter
  if (helperId === "nino" && taskId === "barista") {
    return "Nino ran the espresso machine. Each espresso or cappuccino earned +1 Rep (up to three times today). He used slightly less milk. The latte art was a bird. Or a bureaucratic stamp.";
  }
  if (helperId === "nino" && taskId === "counter") {
    return "Nino handled the till. The queue moved without incident. Opening stress was 8 lower than it would have been.";
  }
  // Nele — marketing/counter
  if (helperId === "nele" && taskId === "marketing") {
    return "Nele posted something. It got 14 likes and one comment in a language Google says does not exist. The extra advertising slot is available today.";
  }
  if (helperId === "nele" && taskId === "counter") {
    return "Nele held the counter. She called the setup 'charmingly precarious.' Opening stress was 5 lower. She meant it as a compliment. Probably.";
  }

  return "The helper was here. Things went.";
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
