import type { AchievementId, EventId, GuestId } from "./content";
import type { DayNumber } from "./content";

export type GameStateVersion = 3;

export type ContentCatalogVersion = "week-one-v1";

export type MoodLevel = "calm" | "busy" | "strained";

export type DayActionId =
  | "take_order"
  | "prepare_drink"
  | "clean_tables"
  | "check_supplies";

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
  day: DayNumber;
  phaseLabel: string;
  resources: ResourceState;
  hiddenWeirdness: number;
  weirdnessVisible: boolean;
  kassandraInstalled: boolean;
  demoComplete: boolean;
  completedActions: DayActionId[];
  unlocks: UnlockState;
  guestHistory: GuestId[];
  eventHistory: EventId[];
  unlockedAchievements: AchievementId[];
  statusMessage: string;
}

export type GameAction =
  | { type: "take_order" }
  | { type: "prepare_drink" }
  | { type: "prepare_counter" }
  | { type: "check_supplies" }
  | { type: "clean_tables" }
  | { type: "complete_day" }
  | { type: "reset_game" };
