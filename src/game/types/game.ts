import type {
  AchievementId,
  EventId,
  GuestId,
  ProductId,
  StaffOptionId
} from "./content";
import type { DayNumber } from "./content";

export type GameStateVersion = 6;

export type ContentCatalogVersion = "week-one-v1";

export type MoodLevel = "calm" | "busy" | "strained";
export type IngredientKey = "coffee" | "milk" | "pastries";
export type CleanlinessStateLabel = "Sauber" | "Ordentlich" | "Unordentlich" | "Chaotisch";
export type StressStateLabel = "Ruhig" | "Geschäftig" | "Angespannt" | "Überlastet";
export type DayPhase = "day_start" | "open" | "day_end";
export type ClosureReason = "money" | "reputation";
export type HelperTaskId = "cleaning" | "service" | "barista" | "counter" | "marketing";

export type DayActionId =
  | "take_order"
  | "prepare_drink"
  | "clean_tables"
  | "check_supplies"
  | "adjust_offer"
  | "run_advertising"
  | "consult_kassandra";

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
  actionPointsRemaining: number;
  actionPointsSpent: number;
  customersServed: number;
  moneyEarned: number;
  moneySpent: number;
  suppliesUsed: SupplyState;
  cleaningActions: number;
  offerReviewed: boolean;
  advertisingRun: boolean;
  kassandraConsulted: boolean;
  helperDecisionMade: boolean;
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
  rating: DayShiftRating;
  moneyEarned: number;
  moneySpent: number;
  customersServed: number;
  suppliesUsed: SupplyState;
  suppliesRestocked: SupplyState;
  suppliesRemaining: SupplyState;
  cleanlinessLabel: CleanlinessStateLabel;
  stressLabel: StressStateLabel;
  reputationDelta: number;
  objectiveTitle: string;
  objectiveCompleted: boolean;
  helperRecap: string | null;
  stressEvent: string | null;
  flavorLines: string[];
}

export type DayShiftRating =
  | "Calm Shift"
  | "Busy Shift"
  | "Messy but Profitable"
  | "Barely Held Together";

export type DayObjectiveStatus = "active" | "completed" | "missed";

export interface DayObjectiveResult {
  day: DayNumber;
  objectiveId: string;
  title: string;
  status: Exclude<DayObjectiveStatus, "active">;
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
  objectiveResults: DayObjectiveResult[];
  stressEventLog: string[];
  hiddenWeirdness: number;
  weirdnessVisible: boolean;
  kassandraInstalled: boolean;
  demoComplete: boolean;
  /** True once the café has permanently closed (money or reputation fail-state). */
  cafeClosed: boolean;
  /** Why the café closed, or null if still open. */
  closureReason: ClosureReason | null;
  /** Consecutive day-ends with reputation at 0 (drives the 2-day grace period). */
  reputationZeroStreak: number;
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
  | { type: "adjust_offer" }
  | { type: "run_advertising" }
  | { type: "consult_kassandra" }
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
