import type { DaySevenHookLetter, EventDefinition } from "../types/content";

export const daySevenHookLetter: DaySevenHookLetter = {
  id: "office-extraordinary-operational-relevance",
  day: 7,
  title: "Official notice: Extraordinary Operational Relevance",
  sender: "Office for Extraordinary Operational Relevance",
  department: "Caffeine, Threshold Sites, and Minor End Times",
  body: `Office for Extraordinary Operational Relevance
Department: Caffeine, Threshold Sites, and Minor End Times

Dear management,

Your café has been mistakenly pre-registered as apocalyptically relevant caffeine infrastructure.

Please ignore this letter if you are fully mortal.

If you are not fully mortal, please refer to Appendix 7b:
“Minimum supplies during imminent reality thinning.”

Kind regards,
on behalf of: illegible`
};

export const weekOneEvents = [
  {
    id: "day-1-opening-rhythm",
    day: 1,
    title: "New Opening",
    tone: "normal",
    trigger: "Opening day core flow.",
    text: "The café opens with orders, coffee preparation, payment, and table cleaning."
  },
  {
    id: "day-1-coffee-machine-flicker",
    day: 1,
    title: "Coffee Machine Flicker",
    tone: "anomaly",
    trigger: "After closing on Day 1.",
    text: "The coffee machine briefly displays \"Good morning.\" It is 14:07."
  },
  {
    id: "day-2-herr-bohn-memory",
    day: 2,
    title: "Herr Bohn Remembers",
    tone: "anomaly",
    trigger: "Herr Bohn visits after guest behavior differences are introduced.",
    text: "Herr Bohn says the corner used to be quieter before it remembered things.",
    relatedGuestIds: ["herr-bohn"]
  },
  {
    id: "day-3-cash-register-suggestion",
    day: 3,
    title: "Strange Cash-Register Suggestion",
    tone: "anomaly",
    trigger: "Prices, supplies, and daily offers become available.",
    text: "The cash register recommends not accepting prophecies as payment today."
  },
  {
    id: "day-4-herr-grau-coin",
    day: 4,
    title: "Herr Grau's Coin",
    tone: "anomaly",
    trigger: "Advertising unlocks and Herr Grau can appear.",
    text: "Herr Grau gives a tip and a coin that smells faintly of cellar.",
    relatedGuestIds: ["herr-grau"]
  },
  {
    id: "day-5-wet-table-jana",
    day: 5,
    title: "Wet Table",
    tone: "anomaly",
    trigger: "Temporary help is available; Jana can work service and cleaning.",
    text: "A table is wet in a way that does not match any visible spill."
  },
  {
    id: "day-5-meda-corner-seat",
    day: 5,
    title: "Meda Chooses the Corner",
    tone: "anomaly",
    trigger: "First possible Meda appearance.",
    text: "Meda prefers the corner seat. People look at her less from there.",
    relatedGuestIds: ["meda"]
  },
  {
    id: "day-6-kassandra-update",
    day: 6,
    title: "KASSANDRA Update",
    tone: "kassandra",
    trigger: "The cash register update installs.",
    text: "KASSANDRA begins with demand prediction and calm customer classification."
  },
  {
    id: "day-7-red-umbrella",
    day: 7,
    title: "Red Umbrella",
    tone: "anomaly",
    trigger: "Frau mit rotem Regenschirm appears on the busier Day 7.",
    text: "A woman arrives with a red umbrella although it is not raining.",
    relatedGuestIds: ["frau-roter-regenschirm"]
  }
] as const satisfies readonly EventDefinition[];
