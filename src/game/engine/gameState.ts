import type { AchievementId, EventId, GuestId } from "../types/content";
import type {
  DayManagementState,
  DayPhase,
  DaySummary,
  DayActionId,
  GameState,
  HelperAssignment,
  IngredientKey,
  ResourceState,
  SupplyPurchaseState,
  SupplyState,
  UnlockState
} from "../types/game";
import { createInitialDayManagement, SUPPLY_CAPS } from "./management";

export const CURRENT_GAME_STATE_VERSION = 4;
export const CURRENT_CONTENT_CATALOG_VERSION = "week-one-v1";

const initialResources: ResourceState = {
  money: 42,
  reputation: 1,
  cleanliness: 80,
  stress: 0,
  mood: "calm"
};

const initialSupplies: SupplyState = {
  coffee: 12,
  milk: 8,
  pastries: 6
};

const emptySupplyPurchase: SupplyPurchaseState = {
  coffee: 0,
  milk: 0,
  pastries: 0
};

const initialUnlocks: UnlockState = {
  pricing: false,
  advertising: false,
  staff: false,
  kassandra: false,
  apocalypseOperations: false
};

export function createInitialGameState(): GameState {
  return {
    version: CURRENT_GAME_STATE_VERSION,
    contentCatalogVersion: CURRENT_CONTENT_CATALOG_VERSION,
    day: 1,
    dayPhase: "open",
    phaseLabel: "Opening setup",
    resources: { ...initialResources },
    supplies: { ...initialSupplies },
    helperAssignment: null,
    pendingSupplyPurchase: { ...emptySupplyPurchase },
    dayManagement: createInitialDayManagement(initialResources.reputation),
    daySummary: null,
    stressEventLog: [],
    hiddenWeirdness: 1,
    weirdnessVisible: false,
    kassandraInstalled: false,
    demoComplete: false,
    completedActions: [],
    unlocks: { ...initialUnlocks },
    guestHistory: [],
    eventHistory: [],
    unlockedAchievements: [],
    statusMessage:
      "The café is not open yet. This shell only proves layout, state, save safety, and reset flow."
  };
}

export function isValidGameState(value: unknown): value is GameState {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<GameState>;

  return (
    candidate.version === CURRENT_GAME_STATE_VERSION &&
    candidate.contentCatalogVersion === CURRENT_CONTENT_CATALOG_VERSION &&
    typeof candidate.day === "number" &&
    Number.isInteger(candidate.day) &&
    candidate.day >= 1 &&
    candidate.day <= 7 &&
    isValidDayPhase(candidate.dayPhase) &&
    typeof candidate.phaseLabel === "string" &&
    typeof candidate.statusMessage === "string" &&
    typeof candidate.hiddenWeirdness === "number" &&
    typeof candidate.weirdnessVisible === "boolean" &&
    typeof candidate.kassandraInstalled === "boolean" &&
    typeof candidate.demoComplete === "boolean" &&
    isValidResources(candidate.resources) &&
    isValidSupplies(candidate.supplies) &&
    isValidSupplyPurchase(candidate.pendingSupplyPurchase) &&
    isValidDayManagement(candidate.dayManagement) &&
    isValidHelperAssignment(candidate.helperAssignment) &&
    isValidDaySummary(candidate.daySummary) &&
    isValidUnlocks(candidate.unlocks) &&
    isStringArray(candidate.stressEventLog) &&
    isStringArray(candidate.completedActions) &&
    isStringArray(candidate.guestHistory) &&
    isStringArray(candidate.eventHistory) &&
    isStringArray(candidate.unlockedAchievements)
  );
}

function isValidResources(value: unknown): value is ResourceState {
  if (!value || typeof value !== "object") {
    return false;
  }

  const resources = value as Partial<ResourceState>;
  const validMoodValues: ResourceState["mood"][] = ["calm", "busy", "strained"];

  return (
    typeof resources.money === "number" &&
    typeof resources.reputation === "number" &&
    typeof resources.cleanliness === "number" &&
    typeof resources.stress === "number" &&
    typeof resources.mood === "string" &&
    validMoodValues.includes(resources.mood)
  );
}

function isValidSupplies(value: unknown): value is SupplyState {
  if (!value || typeof value !== "object") {
    return false;
  }

  const supplies = value as Partial<SupplyState>;

  return (Object.keys(SUPPLY_CAPS) as IngredientKey[]).every(
    (ingredient) =>
      typeof supplies[ingredient] === "number" &&
      Number.isFinite(supplies[ingredient] ?? Number.NaN) &&
      (supplies[ingredient] ?? -1) >= 0 &&
      (supplies[ingredient] ?? Number.POSITIVE_INFINITY) <= SUPPLY_CAPS[ingredient]
  );
}

function isValidSupplyPurchase(value: unknown): value is SupplyPurchaseState {
  return isValidSupplies(value);
}

function isValidDayManagement(value: unknown): value is DayManagementState {
  if (!value || typeof value !== "object") {
    return false;
  }

  const management = value as Partial<DayManagementState>;

  return (
    typeof management.customersServed === "number" &&
    typeof management.moneyEarned === "number" &&
    typeof management.moneySpent === "number" &&
    typeof management.cleaningActions === "number" &&
    typeof management.reputationAtStart === "number" &&
    typeof management.cleanlinessStressApplied === "boolean" &&
    typeof management.noCleaningStressApplied === "boolean" &&
    isIngredientArray(management.emptySupplyStressIngredients) &&
    typeof management.slowCleaningStressReductionUsed === "boolean" &&
    typeof management.baristaReputationBonus === "number" &&
    typeof management.helperExtraOrdersRemaining === "number" &&
    typeof management.extraAdvertisingActions === "number"
  );
}

function isValidHelperAssignment(value: unknown): value is HelperAssignment | null {
  if (value === null) {
    return true;
  }

  if (!value || typeof value !== "object") {
    return false;
  }

  const assignment = value as Partial<HelperAssignment>;

  return (
    typeof assignment.helperId === "string" &&
    ["jana", "nino", "mira"].includes(assignment.helperId) &&
    typeof assignment.taskId === "string" &&
    ["cleaning", "service", "barista", "counter", "marketing"].includes(
      assignment.taskId
    ) &&
    typeof assignment.locked === "boolean" &&
    typeof assignment.dailyCost === "number" &&
    typeof assignment.flavorLine === "string"
  );
}

function isValidDaySummary(value: unknown): value is DaySummary | null {
  if (value === null) {
    return true;
  }

  if (!value || typeof value !== "object") {
    return false;
  }

  const summary = value as Partial<DaySummary>;

  return (
    typeof summary.day === "number" &&
    typeof summary.moneyEarned === "number" &&
    typeof summary.moneySpent === "number" &&
    typeof summary.customersServed === "number" &&
    isValidSupplies(summary.suppliesRemaining) &&
    typeof summary.cleanlinessLabel === "string" &&
    typeof summary.stressLabel === "string" &&
    typeof summary.reputationDelta === "number" &&
    (summary.helperRecap === null || typeof summary.helperRecap === "string") &&
    (summary.stressEvent === null || typeof summary.stressEvent === "string") &&
    isStringArray(summary.flavorLines)
  );
}

function isValidDayPhase(value: unknown): value is DayPhase {
  return (
    typeof value === "string" && ["day_start", "open", "day_end"].includes(value)
  );
}

function isValidUnlocks(value: unknown): value is UnlockState {
  if (!value || typeof value !== "object") {
    return false;
  }

  const unlocks = value as Partial<UnlockState>;

  return (
    typeof unlocks.pricing === "boolean" &&
    typeof unlocks.advertising === "boolean" &&
    typeof unlocks.staff === "boolean" &&
    typeof unlocks.kassandra === "boolean" &&
    typeof unlocks.apocalypseOperations === "boolean"
  );
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === "string");
}

function isIngredientArray(value: unknown): value is IngredientKey[] {
  return (
    Array.isArray(value) &&
    value.every((entry) => ["coffee", "milk", "pastries"].includes(entry))
  );
}

export function addUniqueDayAction(
  actions: readonly DayActionId[],
  action: DayActionId
): DayActionId[] {
  return actions.includes(action) ? [...actions] : [...actions, action];
}

export function addUniqueGuestIds(
  currentIds: readonly GuestId[],
  idsToAdd: readonly GuestId[]
): GuestId[] {
  return addUniqueIds(currentIds, idsToAdd);
}

export function addUniqueEventIds(
  currentIds: readonly EventId[],
  idsToAdd: readonly EventId[]
): EventId[] {
  return addUniqueIds(currentIds, idsToAdd);
}

export function addUniqueAchievementIds(
  currentIds: readonly AchievementId[],
  idsToAdd: readonly AchievementId[]
): AchievementId[] {
  return addUniqueIds(currentIds, idsToAdd);
}

function addUniqueIds<T extends string>(currentIds: readonly T[], idsToAdd: readonly T[]): T[] {
  const result = [...currentIds];

  for (const id of idsToAdd) {
    if (!result.includes(id)) {
      result.push(id);
    }
  }

  return result;
}
