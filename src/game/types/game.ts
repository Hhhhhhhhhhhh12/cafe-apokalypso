export type GameStateVersion = 1;

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

export interface GameState {
  version: GameStateVersion;
  day: number;
  phaseLabel: string;
  resources: ResourceState;
  hiddenWeirdness: number;
  weirdnessVisible: boolean;
  kassandraInstalled: boolean;
  statusMessage: string;
}

export type GameAction =
  | { type: "prepare_counter" }
  | { type: "clean_tables" }
  | { type: "reset_game" };
