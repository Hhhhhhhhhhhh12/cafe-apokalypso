import type {
  AchievementId,
  DayModifierId,
  EventId,
  GuestId,
  ProductId,
  StaffOptionId,
  UpgradeId
} from "./content";
import type { DayNumber } from "./content";

export type GameStateVersion = 17;

export type ContentCatalogVersion = "week-one-v1";

export type MoodLevel = "calm" | "busy" | "strained";
export type IngredientKey = "coffee" | "milk" | "pastries";
export type CleanlinessStateLabel = "Clean" | "Tidy" | "Messy" | "Chaotic";
export type StressStateLabel = "Calm" | "Busy" | "Tense" | "Overloaded";
export type DayPhase = "setup" | "day_start" | "open" | "day_end";
export type HelperAutonomyLevel = "micromanagement" | "learning" | "autonomous";
export type ClosureReason = "money" | "reputation";
export type DecorSlotId = "plant" | "plant2" | "shelf" | "clock" | "lamp" | "cups";
export type EquipmentSlotId = "machine" | "seating" | "register";
export type HelperTaskId = "cleaning" | "service" | "barista" | "counter" | "marketing";
export type EmployeeLevel = 1 | 2 | 3;

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
  /** How independently the helper acts, derived from the current day. See getHelperAutonomyLevel. */
  autonomyLevel: HelperAutonomyLevel;
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
  socialAdRun: boolean;
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
  /** Per-day count of guest-appreciation reputation bonuses already awarded (capped). */
  appreciationBonusesGiven: number;
  /** Per-day count of decor atmosphere reputation bonuses already awarded (capped). */
  decorBonusesGiven: number;
  /** Remaining patience (0..max) of the guest currently at the counter. 0 while the café is not open. */
  currentGuestPatience: number;
  /** Full patience of the current guest when they reached the counter (0 while not open). */
  currentGuestPatienceMax: number;
  /** Guests who walked out unserved today. Advances the queue without counting as served. */
  guestsLost: number;
  /** Consecutive orders that matched the guest's preference — the current "flow" streak. Resets on a miss. */
  serveStreak: number;
  /** Highest flow streak reached today. Surfaced in the day-end recap. */
  bestServeStreak: number;
  /**
   * Number of open-day actions taken since the last serve (or since opening).
   * Drives the 4-state patience label: 0 = Relaxed, 1 = Waiting, 2 = Restless,
   * 3 = Leaving. At 4 the guest walks out. Resets to 0 on every successful serve
   * and whenever a new guest steps up to the counter.
   */
  actionsWithoutServing: number;
  /** Count of autonomous helper actions today (learning/autonomous autonomyLevel only). Surfaced in the day-end recap. */
  helperAutonomousActions: number;
}

export interface GuestMemoryEntry {
  visits: number;
  matchedPreferences: number;
  lastServedProductId?: ProductId;
  knownPreferenceId?: ProductId;
}

export interface RunState {
  runNumber: number;
  seed: number;
  modifierIds: DayModifierId[];
  memoryFragments: string[];
}

export interface DaySummary {
  day: DayNumber;
  rating: DayShiftRating;
  moneyEarned: number;
  moneySpent: number;
  /** Fixed daily overhead (rent, utilities) deducted at day end. */
  dailyOverhead: number;
  customersServed: number;
  /** Guests who walked out unserved during the day (patience ran out). */
  guestsLost: number;
  /** Highest flow streak (consecutive matched orders) reached during the day. */
  bestServeStreak: number;
  suppliesUsed: SupplyState;
  suppliesRestocked: SupplyState;
  suppliesRemaining: SupplyState;
  cleanlinessLabel: CleanlinessStateLabel;
  stressLabel: StressStateLabel;
  reputationDelta: number;
  objectiveTitle: string;
  objectiveCompleted: boolean;
  helperRecap: string | null;
  /**
   * Narrative one-liner describing what the helper did on their own today
   * (#131). Optional: absent on summaries written before this field existed.
   */
  helperAutonomyRecap?: string | null;
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
  /** Current owned tier per décor slot (1 = shabby default). See #57. */
  decor: Record<DecorSlotId, number>;
  /** Current owned tier per core equipment slot (0 = not yet bought). See #setup. */
  equipment: Record<EquipmentSlotId, number>;
  /** Soft-run structure: deterministic week modifiers plus KASSANDRA memory fragments. */
  run: RunState;
  /** Guest preferences learned by play, used to teach without a separate tutorial. */
  guestMemory: Partial<Record<GuestId, GuestMemoryEntry>>;
  completedActions: DayActionId[];
  unlocks: UnlockState;
  /** Accumulated XP per hired helper (key = StaffOptionId). XP = customers served on days they worked. */
  staffXp: Partial<Record<StaffOptionId, number>>;
  guestHistory: GuestId[];
  eventHistory: EventId[];
  /** Events triggered during the current open day, in the order they fired. Reset on open_day. */
  pendingEvents: EventId[];
  unlockedAchievements: AchievementId[];
  /** Upgrades bought from the day-end shop. Each id appears at most once. */
  purchasedUpgrades: UpgradeId[];
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
  | { type: "run_advertising"; adType?: "flyer" | "social" }
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
  | { type: "upgrade_decor"; slot: DecorSlotId }
  | { type: "buy_equipment"; slot: EquipmentSlotId }
  | { type: "buy_upgrade"; upgradeId: UpgradeId }
  | { type: "finish_setup" }
  | { type: "reset_game" };
