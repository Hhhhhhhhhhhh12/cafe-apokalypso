import type { DayDefinition } from "../types/content";

export const DAY_ONE_FATOU_SERVED_FRAGMENT = "day-1-fatou-served";
const dayTwoMorning = "Several new customers seem to have different ideas about what coffee is for. The morning is developing something like a rhythm.";
export const dayTwoOpenerWithFatou = `Kemal and Fatou are back, with very different ideas about being on time. ${dayTwoMorning}`;

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
      description: "Get the café running on your first shift. Fatou, the third guest, is optional.",
      completionHint: "Serve at least 2 customers and clean the café before closing."
    },
    unlocks: ["take order", "prepare coffee", "accept payment", "clean tables"],
    guestIds: ["pendler-kemal", "pendlerin-paula", "pendlerin-fatou"],
    eventIds: ["day-1-opening-rhythm", "day-1-first-cup", "day-1-coffee-machine-flicker"]
  },
  {
    day: 2,
    title: "Regulars Begin to Form",
    milestone:
      "Regular guests, order preferences, and the cost of keeping the café calm.",
    dayOpener: `Kemal is back. ${dayTwoMorning}`,
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
      "pendlerin-paula",
      "laptop-lukas",
      "lieferfahrer-cem",
      "cappuccino-christa",
      "herr-bohn",
      "pendlerin-fatou",
      "nachbarin-mira"
    ],
    eventIds: ["day-2-herr-bohn-memory", "day-2-rehearsed-rhythm"]
  },
  {
    day: 3,
    title: "Keep the Café Moving",
    milestone: "Choose where Jana can help and buy what the café needs for tomorrow.",
    dayOpener:
      "Nele walks in as though she already knows where everything is. Jana is here for a trial shift. There's time to count the stock before you turn the sign.",
    unlockMessage:
      "Check the stock, then put Jana on service or clearing tables. You can also open alone and keep the Asche for supplies.",
    objective: {
      id: "day-3-keep-the-cafe-moving",
      day: 3,
      title: "Keep the café moving",
      description: "Serve two guests and see where the shift needs help.",
      completionHint: "Serve 2 customers, then close and review tomorrow's supplies."
    },
    unlocks: ["ingredient purchasing", "price adjustment", "daily offers"],
    guestIds: [
      "pendler-kemal",
      "pendlerin-paula",
      "cappuccino-christa",
      "laptop-lukas",
      "lieferfahrer-cem",
      "herr-bohn",
      "freelancerin-nele",
      "pendlerin-fatou",
      "nachbarin-mira"
    ],
    eventIds: ["day-3-cash-register-suggestion", "day-3-supply-tally", "day-3-guest-checks-in"]
  },
  {
    day: 4,
    title: "A Little Breathing Room",
    milestone: "A short breather to try local advertising and prepare for busier days.",
    dayOpener:
      "A small stack of flyers is sitting on the counter. Today's modest goal leaves room to clean up, check the supplies, and prepare before the café gets busier again.",
    unlockMessage:
      "Small local ads are now available. Try one today and use the remaining time to catch up.",
    objective: {
      id: "day-4-local-ad",
      day: 4,
      title: "Test a small ad",
      description: "Try a small local ad and serve two customers, leaving room for cleaning or preparation.",
      completionHint: "Run one local ad and serve 2 customers."
    },
    unlocks: ["flyers", "student discount", "social media post"],
    guestIds: [
      "pendler-kemal",
      "pendlerin-paula",
      "laptop-lukas",
      "lieferfahrer-cem",
      "cappuccino-christa",
      "herr-bohn",
      "freelancerin-nele",
      "pendlerin-fatou",
      "nachbarin-mira",
      "herr-grau"
    ],
    eventIds: ["day-4-herr-grau-coin", "day-4-bohn-recognizes-coin"]
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
      "pendlerin-paula",
      "laptop-lukas",
      "lieferfahrer-cem",
      "cappuccino-christa",
      "herr-bohn",
      "freelancerin-nele",
      "pendlerin-fatou",
      "nachbarin-mira",
      "herr-grau",
      "meda"
    ],
    eventIds: ["day-5-wet-table-jana", "day-5-meda-corner-seat", "day-5-receipt-printer-early", "day-5-second-table-hum", "day-5-storage-smell"]
  },
  {
    day: 6,
    title: "KASSANDRA",
    milestone: "Read KASSANDRA's register messages and consult its daily analysis.",
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
      "pendlerin-paula",
      "laptop-lukas",
      "lieferfahrer-cem",
      "cappuccino-christa",
      "herr-bohn",
      "freelancerin-nele",
      "pendlerin-fatou",
      "nachbarin-mira",
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
      description: "Keep up with the busiest shift of the week and leave the café in good order for the inspection.",
      completionHint: "Serve 4 customers, clean the café, and close Day 7."
    },
    unlocks: ["visible weirdness after hook", "apocalypse operations foreshadowing"],
    guestIds: [
      "pendler-kemal",
      "pendlerin-paula",
      "laptop-lukas",
      "lieferfahrer-cem",
      "cappuccino-christa",
      "herr-bohn",
      "freelancerin-nele",
      "pendlerin-fatou",
      "nachbarin-mira",
      "herr-grau",
      "meda",
      "frau-roter-regenschirm"
    ],
    eventIds: ["day-7-red-umbrella", "day-7-back-wall-doorway", "day-7-menu-bookmark", "day-7-kassandra-threshold", "day-7-closing-count"]
  }
] as const satisfies readonly DayDefinition[];
