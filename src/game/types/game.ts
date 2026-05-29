import type {
  AchievementId,
  EventId,
  GuestId,
  ProductId,
  StaffOptionId
} from "./content";
import type { DayNumber } from "./content";

export type GameStateVersion = 4;

export type ContentCatalogVersion = "week-one-v1";

export type MoodLevel = "calm" | "busy" | "strained";
export type IngredientKey = "coffee" | "milk" | "pastries";
export type CleanlinessStateLabel = "Sauber" | "Ordentlich" | "Unordentlich" | "Chaotisch";
export type StressStateLabel = "Ruhig" | "Geschäftig" | "Angespannt" | "Überlastet";
export type DayPhase = "day_start" | "open" | "day_end";
export type HelperTaskId = "cleaning" | "service" | "barista" | "counter" | "marketing";

export type DayActionId =
  | "take_order"
  | "prepare_drink"
  | "clean_tables"
  | "check_supplies";

export interface ResourceState {
  money: number;
  reputation: number;
  cleanliness: number;
  stress: number;
  mood: MoodLevel;
}

export type SupplyState = Record<IngredientKey, number>;

export interface HelperAssignment {
  helperId: StaffOptionId;
  taskId: HelperTaskId;
  locked: boolean;
  dailyCost: number;
  flavorLine: string;
}

export type SupplyPurchaseState = SupplyState;

export interface DayManagementState {
  customersServed: number;
  moneyEarned: number;
  moneySpent: number;
  cleaningActions: number;
  reputationAtStart: number;
  cleanlinessStressApplied: boolean;
  noCleaningStressApplied: boolean;
  emptySupplyStressIngredients: IngredientKey[];
  slowCleaningStressReductionUsed: boolean;
  baristaReputationBonus: number;
  helperExtraOrdersRemaining: number;
  extraAdvertisingActions: number;
}

export interface DaySummary {
  day: DayNumber;
  moneyEarned: number;
  moneySpent: number;
  customersServed: number;
  suppliesRemaining: SupplyState;
  cleanlinessLabel: CleanlinessStateLabel;
  stressLabel: StressStateLabel;
  reputationDelta: number;
  helperRecap: string | null;
  stressEvent: string | null;
  flavorLines: string[];
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
  dayPhase: DayPhase;
  phaseLabel: string;
  resources: ResourceState;
  supplies: SupplyState;
  helperAssignment: HelperAssignment | null;
  pendingSupplyPurchase: SupplyPurchaseState;
  dayManagement: DayManagementState;
  daySummary: DaySummary | null;
  stressEventLog: string[];
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
  | { type: "serve_product"; productId: ProductId }
  | { type: "prepare_drink" }
  | { type: "prepare_counter" }
  | { type: "check_supplies" }
  | { type: "clean_tables" }
  | {
      type: "select_helper";
      helperId: StaffOptionId;
      taskId: HelperTaskId;
    }
  | { type: "open_day" }
  | { type: "complete_day" }
  | { type: "set_supply_purchase"; ingredient: IngredientKey; quantity: number }
  | { type: "confirm_supply_purchase" }
  | { type: "reset_game" };
