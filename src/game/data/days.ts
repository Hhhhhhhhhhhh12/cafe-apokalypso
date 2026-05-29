import type { DayDefinition } from "../types/content";

export const weekOneDays = [
  {
    day: 1,
    title: "New Opening",
    milestone: "Core order flow and first coffee-machine anomaly.",
    unlocks: ["take order", "prepare coffee", "accept payment", "clean tables"],
    guestIds: ["pendlerin-paula"],
    eventIds: ["day-1-opening-rhythm", "day-1-coffee-machine-flicker"]
  },
  {
    day: 2,
    title: "Regulars Begin to Form",
    milestone:
      "Guest behavior differences: patience, spend, seat time, and quality expectations.",
    unlocks: ["guest behavior differences"],
    guestIds: [
      "pendlerin-paula",
      "laptop-lukas",
      "lieferfahrer-cem",
      "cappuccino-christa",
      "herr-bohn"
    ],
    eventIds: ["day-2-herr-bohn-memory"]
  },
  {
    day: 3,
    title: "Prices and Supplies",
    milestone: "Ingredient purchasing, price adjustment, and daily offers.",
    unlocks: ["ingredient purchasing", "price adjustment", "daily offers"],
    guestIds: [
      "pendlerin-paula",
      "laptop-lukas",
      "lieferfahrer-cem",
      "cappuccino-christa",
      "herr-bohn",
      "freelancerin-mira"
    ],
    eventIds: ["day-3-cash-register-suggestion"]
  },
  {
    day: 4,
    title: "Advertising",
    milestone: "Small ads begin influencing demand and guest types.",
    unlocks: ["flyers", "student discount", "social media post"],
    guestIds: [
      "pendlerin-paula",
      "laptop-lukas",
      "lieferfahrer-cem",
      "cappuccino-christa",
      "herr-bohn",
      "freelancerin-mira",
      "herr-grau"
    ],
    eventIds: ["day-4-herr-grau-coin"]
  },
  {
    day: 5,
    title: "First Temporary Help",
    milestone: "Jana, Nino, or Mira can help for one day.",
    unlocks: ["temporary help", "first delegation"],
    guestIds: [
      "pendlerin-paula",
      "laptop-lukas",
      "lieferfahrer-cem",
      "cappuccino-christa",
      "herr-bohn",
      "freelancerin-mira",
      "herr-grau",
      "meda"
    ],
    eventIds: ["day-5-wet-table-jana", "day-5-meda-corner-seat"]
  },
  {
    day: 6,
    title: "KASSANDRA",
    milestone: "Cash register update unlocks simulated demand prediction.",
    unlocks: ["KASSANDRA update", "automatic audience targeting"],
    guestIds: [
      "pendlerin-paula",
      "laptop-lukas",
      "lieferfahrer-cem",
      "cappuccino-christa",
      "herr-bohn",
      "freelancerin-mira",
      "herr-grau",
      "meda"
    ],
    eventIds: ["day-6-kassandra-update"]
  },
  {
    day: 7,
    title: "The Letter",
    milestone:
      "Operational stress test, red umbrella guest, official apocalyptic letter.",
    unlocks: ["visible weirdness after hook", "apocalypse operations foreshadowing"],
    guestIds: [
      "pendlerin-paula",
      "laptop-lukas",
      "lieferfahrer-cem",
      "cappuccino-christa",
      "herr-bohn",
      "freelancerin-mira",
      "herr-grau",
      "meda",
      "frau-roter-regenschirm"
    ],
    eventIds: ["day-7-red-umbrella"]
  }
] as const satisfies readonly DayDefinition[];
