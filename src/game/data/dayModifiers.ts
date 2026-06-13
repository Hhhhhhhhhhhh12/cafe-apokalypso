import type { DayModifierDefinition } from "../types/content";

export const weekOneDayModifiers = [
  {
    id: "soft-opening",
    day: 1,
    title: "Soft Opening",
    summary: "The first day is forgiving enough to let the player learn by serving.",
    learningHint:
      "Simple orders are safest while the café is still teaching you its rhythm.",
    effects: ["No extra mechanical pressure; establishes the order-clean-close loop."]
  },
  {
    id: "commuter-wave",
    day: 2,
    title: "Commuter Wave",
    summary: "Fast guests are easier to keep calm when their obvious order lands quickly.",
    learningHint:
      "Guests who watch the door or the street usually want speed more than ceremony.",
    effects: [
      "Fast or impatient guests served their preference reduce stress by 2.",
      "Missing that obvious preference adds 2 stress."
    ]
  },
  {
    id: "inventory-audit",
    day: 3,
    title: "Inventory Audit",
    summary: "The offer board and stock shelf start to matter as one connected choice.",
    learningHint:
      "A supply check before the café runs dry is worth more than a heroic apology later.",
    effects: ["The first supply check on Day 3 adds one reputation if nothing is empty."]
  },
  {
    id: "poster-echo",
    day: 4,
    title: "Poster Echo",
    summary: "Advertising works, but it also makes the room feel busier.",
    learningHint:
      "A flyer brings attention. Attention brings customers. Customers bring queue pressure.",
    effects: ["The first ad grants +2 reputation instead of +1, but adds 2 stress."]
  },
  {
    id: "short-staffed",
    day: 5,
    title: "Short Staffed",
    summary: "Delegation pressure is no longer theoretical.",
    learningHint:
      "Skipping help saves money today and usually spends calm instead.",
    effects: ["The existing solo-floor penalty remains the Day-5 management lesson."]
  },
  {
    id: "forecast-static",
    day: 6,
    title: "Forecast Static",
    summary: "KASSANDRA can help, but only if consulted before the rush proves it right.",
    learningHint:
      "Forecasts are strongest before the day has already explained itself.",
    effects: ["The first early KASSANDRA consult refunds its action point."]
  },
  {
    id: "inspection-pressure",
    day: 7,
    title: "Inspection Pressure",
    summary: "Clean closing matters more when the week is about to be judged.",
    learningHint:
      "On inspection day, a tidy café protects reputation better than one more rushed order.",
    effects: [
      "Clean Day-7 close grants one extra reputation.",
      "Messy Day-7 close costs one extra reputation."
    ]
  }
] as const satisfies readonly DayModifierDefinition[];
