export type DayNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type GuestCategory = "normal" | "subtly_strange";

export type GuestId =
  | "pendlerin-paula"
  | "laptop-lukas"
  | "lieferfahrer-cem"
  | "cappuccino-christa"
  | "herr-bohn"
  | "freelancerin-mira"
  | "herr-grau"
  | "frau-roter-regenschirm"
  | "meda";

export type ProductId =
  | "filterkaffee"
  | "espresso"
  | "cappuccino"
  | "croissant"
  | "kaffee-croissant";

export type StaffOptionId = "jana" | "nino" | "mira";

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
  | "day-3-cash-register-suggestion"
  | "day-4-herr-grau-coin"
  | "day-5-wet-table-jana"
  | "day-5-meda-corner-seat"
  | "day-6-kassandra-update"
  | "day-7-red-umbrella";

export type AchievementId =
  | "first-order"
  | "clean-counter"
  | "regular-recognized"
  | "first-ad"
  | "first-helper"
  | "kassandra-installed"
  | "week-one-letter";

export interface GuestDefinition {
  id: GuestId;
  name: string;
  category: GuestCategory;
  firstDay: DayNumber;
  behaviorTags: readonly string[];
  summary: string;
  sampleLines: readonly string[];
  visualNotes?: string;
}

export interface ProductDefinition {
  id: ProductId;
  name: string;
  category: "drink" | "food" | "combo";
  firstDay: DayNumber;
  basePrice: number;
  ingredients: Partial<Record<"coffee" | "milk" | "pastries", number>>;
  summary: string;
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
  unlocks: readonly string[];
  guestIds: readonly GuestId[];
  eventIds: readonly EventId[];
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
