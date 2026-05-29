import type { AchievementId, EventId, GuestId } from "./content";

export type GameStateVersion = 2;

export type ContentCatalogVersion = "week-one-v1";

export type MoodLevel = "calm" | "busy" | "strained";

export interface ResourceState {
  money: number;
  coffee: number;
  milk: number;
  pastries: number;
  reputation: number;
  cleanliness: number;
  stress: number;
  mood: MoodLevel;
}

export interface UnlockState {
  pricing: boolean;
  advertising: boolean;
  staff: boolean;
  kassandra: boolean;
  apocalypseOperations: boolean;
}

export interface GameState {
  version: GameStateVersion;
  contentCatalogVersion: ContentCatalogVersion;
  day: number;
  phaseLabel: string;
  resources: ResourceState;
  hiddenWeirdness: number;
  weirdnessVisible: boolean;
  kassandraInstalled: boolean;
  unlocks: UnlockState;
  guestHistory: GuestId[];
  eventHistory: EventId[];
  unlockedAchievements: AchievementId[];
  statusMessage: string;
}

export type GameAction =
  | { type: "prepare_counter" }
  | { type: "clean_tables" }
  | { type: "reset_game" };
