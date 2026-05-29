import type { AchievementId, EventId, GuestId } from "../types/content";
import type {
  DayActionId,
  GameState,
  ResourceState,
  UnlockState
} from "../types/game";

export const CURRENT_GAME_STATE_VERSION = 3;
export const CURRENT_CONTENT_CATALOG_VERSION = "week-one-v1";

const initialResources: ResourceState = {
  money: 42,
  coffee: 12,
  milk: 8,
  pastries: 6,
  reputation: 1,
  cleanliness: 82,
  stress: 6,
  mood: "calm"
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
    phaseLabel: "Opening setup",
    resources: { ...initialResources },
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
    typeof candidate.phaseLabel === "string" &&
    typeof candidate.statusMessage === "string" &&
    typeof candidate.hiddenWeirdness === "number" &&
    typeof candidate.weirdnessVisible === "boolean" &&
    typeof candidate.kassandraInstalled === "boolean" &&
    typeof candidate.demoComplete === "boolean" &&
    isValidResources(candidate.resources) &&
    isValidUnlocks(candidate.unlocks) &&
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
    typeof resources.coffee === "number" &&
    typeof resources.milk === "number" &&
    typeof resources.pastries === "number" &&
    typeof resources.reputation === "number" &&
    typeof resources.cleanliness === "number" &&
    typeof resources.stress === "number" &&
    typeof resources.mood === "string" &&
    validMoodValues.includes(resources.mood)
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
