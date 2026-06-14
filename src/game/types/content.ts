export type DayNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type GuestCategory = "normal" | "subtly_strange";

export type DayModifierId =
  | "soft-opening"
  | "commuter-wave"
  | "inventory-audit"
  | "poster-echo"
  | "short-staffed"
  | "forecast-static"
  | "inspection-pressure";

export type GuestId =
  | "pendlerin-paula"
  | "laptop-lukas"
  | "lieferfahrer-cem"
  | "cappuccino-christa"
  | "herr-bohn"
  | "freelancerin-nele"
  | "herr-grau"
  | "frau-roter-regenschirm"
  | "meda";

export type ProductId =
  | "filterkaffee"
  | "espresso"
  | "cappuccino"
  | "croissant"
  | "kaffee-croissant"
  | "handfilter";

export type StaffOptionId = "jana" | "nino" | "nele";

export type AdvertisingCampaignId =
  | "flyer-nachbarschaft"
  | "studentenrabatt"
  | "social-media-post"
  | "automatische-zielgruppenoptimierung";

export type UpgradeId =
  | "menu-board"
  | "storage-shelf"
  | "better-beans"
  | "second-table"
  | "cleaning-kit"
  | "cash-register-update"
  | "weatherproof-umbrella-stand";

export type EventId =
  | "day-1-opening-rhythm"
  | "day-1-coffee-machine-flicker"
  | "day-2-herr-bohn-memory"
  | "day-2-rehearsed-rhythm"
  | "day-3-cash-register-suggestion"
  | "day-3-guest-checks-in"
  | "day-4-herr-grau-coin"
  | "day-4-poster-before-printed"
  | "day-4-flyer-wrong-address"
  | "day-4-bohn-recognizes-coin"
  | "day-5-wet-table-jana"
  | "day-5-meda-corner-seat"
  | "day-5-receipt-printer-early"
  | "day-5-storage-smell"
  | "day-6-kassandra-update"
  | "day-6-returning-guest"
  | "day-6-kassandra-complaint-queue"
  | "day-6-disclaimer-receipt"
  | "day-7-red-umbrella"
  | "day-7-back-wall-doorway"
  | "day-7-menu-bookmark"
  | "day-7-kassandra-threshold";

export type AchievementId =
  | "first-order"
  | "clean-counter"
  | "regular-recognized"
  | "first-ad"
  | "first-helper"
  | "kassandra-installed"
  | "week-one-letter";

export type DayObjectiveId =
  | "day-1-first-shift"
  | "day-2-regular-rhythm"
  | "day-3-offer-board"
  | "day-4-local-ad"
  | "day-5-helper-choice"
  | "day-6-kassandra-check"
  | "day-7-the-letter";

export interface GuestDefinition {
  id: GuestId;
  name: string;
  category: GuestCategory;
  firstDay: DayNumber;
  behaviorTags: readonly string[];
  summary: string;
  sampleLines: readonly string[];
  /** Spoken or observed line shown before serving, used as in-world learning. */
  orderLine?: string;
  /** Small behavioral cue shown with the next guest instead of a separate tutorial. */
  learningCue?: string;
  /** Product this guest visibly tends to want; may be softer than a reputation bonus. */
  preferredProductId?: ProductId;
  /**
   * Player-facing line shown after this guest is successfully served.
   * Distinct from sampleLines (which are authoring/reference lines).
   */
  serveLine: string;
  /** Shown after serving the guest's soft preference when no reputation bonus applies. */
  matchedPreferenceLine?: string;
  /** Shown after missing the guest's soft preference when no penalty applies. */
  missedPreferenceLine?: string;
  visualNotes?: string;
  /**
   * Products this guest particularly values. Serving one grants a small
   * reputation bonus (capped per day) — a light, slice-level hint of the
   * long-term coffee-appreciation system (see GitHub #56). Optional.
   */
  appreciatedProductIds?: readonly ProductId[];
  /** Shown after serving an appreciated product. */
  delightLine?: string;
  /** Shown when this guest (who has preferences) is served something they do not value. */
  letdownLine?: string;
}

export interface ProductDefinition {
  id: ProductId;
  name: string;
  category: "drink" | "food" | "combo";
  firstDay: DayNumber;
  basePrice: number;
  ingredients: Partial<Record<"coffee" | "milk" | "pastries", number>>;
  summary: string;
  /**
   * Craft quality tier: 1 = standard, 2 = good, 3 = premium. Higher tiers earn
   * more reputation from guests who appreciate them (see #56). Defaults to 1.
   */
  qualityTier?: number;
}

export interface StaffOptionDefinition {
  id: StaffOptionId;
  name: string;
  role: "service_cleaning" | "barista" | "marketing_counter";
  unlockDay: DayNumber;
  dailyCost: number;
  linkedGuestId?: GuestId;
  effects: readonly string[];
  flavorLine: string;
}

export interface AdvertisingCampaignDefinition {
  id: AdvertisingCampaignId;
  name: string;
  unlockDay: DayNumber;
  cost: number;
  effects: readonly string[];
  summary: string;
}

export interface UpgradeDefinition {
  id: UpgradeId;
  name: string;
  unlockDay: DayNumber;
  cost: number;
  effects: readonly string[];
  summary: string;
}

export interface EventDefinition {
  id: EventId;
  day: DayNumber;
  title: string;
  tone: "normal" | "anomaly" | "kassandra" | "bureaucratic";
  trigger: string;
  text: string;
  relatedGuestIds?: readonly GuestId[];
}

export interface AchievementDefinition {
  id: AchievementId;
  name: string;
  unlockDay: DayNumber;
  requirement: string;
  description: string;
}

export interface DayDefinition {
  day: DayNumber;
  title: string;
  milestone: string;
  /** Short scene-setting paragraph shown at the top of the day. */
  dayOpener: string;
  /**
   * One-sentence narrative note shown on the day a new system first unlocks.
   * Present for Days 3–6; omitted on days with no new unlock.
   */
  unlockMessage?: string;
  objective: DayObjectiveDefinition;
  unlocks: readonly string[];
  guestIds: readonly GuestId[];
  eventIds: readonly EventId[];
}

export interface DayModifierDefinition {
  id: DayModifierId;
  day: DayNumber;
  title: string;
  summary: string;
  /** A player-learnable rule written as in-world operational advice. */
  learningHint: string;
  /** Short authored notes for tests/docs; actual effects live in the engine. */
  effects: readonly string[];
}

export interface DayObjectiveDefinition {
  id: DayObjectiveId;
  day: DayNumber;
  title: string;
  description: string;
  completionHint: string;
}

export interface KassandraMessageDefinition {
  id: string;
  day: DayNumber;
  text: string;
  source: "authored_static";
  simulated: true;
}

export interface DaySevenHookLetter {
  id: "office-extraordinary-operational-relevance";
  day: 7;
  title: string;
  sender: string;
  department: string;
  body: string;
}
