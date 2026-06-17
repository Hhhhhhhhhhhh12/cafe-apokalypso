import type { DayDefinition } from "../types/content";

export const weekOneDays = [
  {
    day: 1,
    title: "New Opening",
    milestone: "Core order flow and first coffee-machine anomaly.",
    dayOpener:
      "The café opens for the first time. Everything is where it should be. The first customers will arrive when they decide to.",
    objective: {
      id: "day-1-first-shift",
      day: 1,
      title: "Close the first shift",
      description: "Serve the first two customers and leave the tables clean enough to lock up.",
      completionHint: "Serve 2 customers and clean the tables before closing."
    },
    unlocks: ["take order", "prepare coffee", "accept payment", "clean tables"],
    guestIds: ["pendler-kemal", "freelancerin-nele"],
    eventIds: ["day-1-opening-rhythm", "day-1-coffee-machine-flicker"]
  },
  {
    day: 2,
    title: "Regulars Begin to Form",
    milestone:
      "Guest behavior differences: patience, spend, seat time, and quality expectations.",
    dayOpener:
      "A few faces from yesterday have returned. Each of them seems to have a different idea about what coffee is for. The morning is developing something like a rhythm.",
    objective: {
      id: "day-2-regular-rhythm",
      day: 2,
      title: "Keep the regular rhythm",
      description: "Serve a small morning crowd without letting the room feel strained.",
      completionHint: "Serve 3 customers and finish with stress at Calm or Busy."
    },
    unlocks: ["guest behavior differences"],
    guestIds: [
      "pendler-kemal",
      "laptop-lukas",
      "lieferfahrer-cem",
      "cappuccino-christa",
      "herr-bohn",
      "freelancerin-nele"
    ],
    eventIds: ["day-2-herr-bohn-memory", "day-2-rehearsed-rhythm"]
  },
  {
    day: 3,
    title: "Prices and Supplies",
    milestone: "Ingredient purchasing, price adjustment, and daily offers.",
    dayOpener:
      "The offer board now has a slot for a daily suggestion. Supplies are being purchased in quantities that require actual accounting. The register has an opinion about prices, for what that is worth.",
    unlockMessage:
      "The offer board is active. Before opening, you can also hire one helper or keep the money for supplies.",
    objective: {
      id: "day-3-offer-board",
      day: 3,
      title: "Try the offer board",
      description: "Review the daily offer and still keep the counter moving.",
      completionHint: "Review the offer board and serve 2 customers."
    },
    unlocks: ["ingredient purchasing", "price adjustment", "daily offers"],
    guestIds: [
      "pendler-kemal",
      "laptop-lukas",
      "lieferfahrer-cem",
      "cappuccino-christa",
      "herr-bohn",
      "freelancerin-nele"
    ],
    eventIds: ["day-3-cash-register-suggestion", "day-3-supply-tally", "day-3-guest-checks-in"]
  },
  {
    day: 4,
    title: "Advertising",
    milestone: "Small ads begin influencing demand and guest types.",
    dayOpener:
      "A small stack of flyers is sitting on the counter. You printed them last night. The neighborhood has not heard from you yet.",
    unlockMessage:
      "A small advertising option is now open — the neighborhood has not heard from you yet.",
    objective: {
      id: "day-4-local-ad",
      day: 4,
      title: "Test a small ad",
      description: "Spend time and a little money on a local ad, then handle the extra attention.",
      completionHint: "Run one local ad and serve 3 customers."
    },
    unlocks: ["flyers", "student discount", "social media post"],
    guestIds: [
      "pendler-kemal",
      "laptop-lukas",
      "lieferfahrer-cem",
      "cappuccino-christa",
      "herr-bohn",
      "freelancerin-nele",
      "herr-grau"
    ],
    eventIds: ["day-4-herr-grau-coin", "day-4-poster-before-printed", "day-4-flyer-wrong-address", "day-4-bohn-recognizes-coin"]
  },
  {
    day: 5,
    title: "Delegation Pressure",
    milestone: "Helper choices start to matter more as the café gets busier.",
    dayOpener:
      "By now help is no longer a novelty. Each person on the staff board can solve one problem well, which leaves the other problems politely waiting. A table was wet this morning in a way that did not match any spill. You wipe it and move on.",
    unlockMessage:
      "Delegation is still narrow: one person, one task, one day at a time.",
    objective: {
      id: "day-5-helper-choice",
      day: 5,
      title: "Make the helper call",
      description: "Choose whether today needs help, then prove the shift still works.",
      completionHint: "Open the day after a helper decision and serve 3 customers."
    },
    unlocks: ["stronger delegation pressure", "staff-flavored narrative beat"],
    guestIds: [
      "pendler-kemal",
      "laptop-lukas",
      "lieferfahrer-cem",
      "cappuccino-christa",
      "herr-bohn",
      "freelancerin-nele",
      "herr-grau",
      "meda"
    ],
    eventIds: ["day-5-wet-table-jana", "day-5-meda-corner-seat", "day-5-receipt-printer-early", "day-5-second-table-hum", "day-5-storage-smell"]
  },
  {
    day: 6,
    title: "KASSANDRA",
    milestone: "Cash register update unlocks simulated demand prediction.",
    dayOpener:
      "The register update installed overnight without asking. It has issued its first customer analysis. The results are calm, confident, and slightly wrong.",
    unlockMessage:
      "KASSANDRA installed overnight and has completed its first customer assessment.",
    objective: {
      id: "day-6-kassandra-check",
      day: 6,
      title: "Read the register update",
      description: "Consult KASSANDRA's first update without letting the café stall.",
      completionHint: "Consult KASSANDRA and serve 3 customers."
    },
    unlocks: ["KASSANDRA update", "automatic audience targeting"],
    guestIds: [
      "pendler-kemal",
      "laptop-lukas",
      "lieferfahrer-cem",
      "cappuccino-christa",
      "herr-bohn",
      "freelancerin-nele",
      "herr-grau",
      "meda"
    ],
    eventIds: ["day-6-kassandra-update", "day-6-kassandra-forecast", "day-6-returning-guest", "day-6-kassandra-complaint-queue", "day-6-disclaimer-receipt"]
  },
  {
    day: 7,
    title: "The Letter",
    milestone:
      "Operational stress test, red umbrella guest, official apocalyptic letter.",
    dayOpener:
      "The café is more crowded than usual today. A few of the faces are unfamiliar in a specific way — not new, but as if they arrived from a slightly different version of here. The back wall has been a wall all morning. A letter may arrive.",
    objective: {
      id: "day-7-the-letter",
      day: 7,
      title: "Survive the inspection day",
      description: "Push through the busiest demo day and close cleanly enough to receive the letter.",
      completionHint: "Serve 4 customers, clean the café, and close Day 7."
    },
    unlocks: ["visible weirdness after hook", "apocalypse operations foreshadowing"],
    guestIds: [
      "pendler-kemal",
      "laptop-lukas",
      "lieferfahrer-cem",
      "cappuccino-christa",
      "herr-bohn",
      "freelancerin-nele",
      "herr-grau",
      "meda",
      "frau-roter-regenschirm"
    ],
    eventIds: ["day-7-red-umbrella", "day-7-back-wall-doorway", "day-7-menu-bookmark", "day-7-kassandra-threshold", "day-7-closing-count"]
  }
] as const satisfies readonly DayDefinition[];
