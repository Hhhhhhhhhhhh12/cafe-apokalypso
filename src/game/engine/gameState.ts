import type { GameState, ResourceState } from "../types/game";

export const CURRENT_GAME_STATE_VERSION = 1;

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

export function createInitialGameState(): GameState {
  return {
    version: CURRENT_GAME_STATE_VERSION,
    day: 1,
    phaseLabel: "Opening setup",
    resources: { ...initialResources },
    hiddenWeirdness: 1,
    weirdnessVisible: false,
    kassandraInstalled: false,
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
    candidate.day === 1 &&
    typeof candidate.phaseLabel === "string" &&
    typeof candidate.statusMessage === "string" &&
    typeof candidate.hiddenWeirdness === "number" &&
    typeof candidate.weirdnessVisible === "boolean" &&
    typeof candidate.kassandraInstalled === "boolean" &&
    isValidResources(candidate.resources)
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
