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
    text: "Herr Bohn mentions that the corner used to be quieter. Before it remembered things.",
    relatedGuestIds: ["herr-bohn"]
  },
  {
    id: "day-2-rehearsed-rhythm",
    day: 2,
    title: "A Rehearsed Rhythm",
    tone: "anomaly",
    trigger: "Regulars begin to form and the daily rhythm settles.",
    text: "By mid-morning the regulars arrive in an order that feels lightly rehearsed. You did not arrange it. You suspect it will happen the same way tomorrow."
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
    id: "day-3-guest-checks-in",
    day: 3,
    title: "Just Passing Through",
    tone: "anomaly",
    trigger: "A quiet traveler stops in during the busier midweek.",
    text: "A quiet traveler asks to sit a while and \"not be anywhere in particular.\" They barely touch the coffee, then leave looking like they got further away than the door should allow."
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
    id: "day-4-poster-before-printed",
    day: 4,
    title: "The Poster, Earlier",
    tone: "anomaly",
    trigger: "Advertising begins influencing demand.",
    text: "A guest compliments the new poster by the door. You only print it that afternoon. You decide not to dwell on the order of events."
  },
  {
    id: "day-4-flyer-wrong-address",
    day: 4,
    title: "The Flyer Reaches Someone",
    tone: "anomaly",
    trigger: "First advertising run.",
    text: "Three people arrive from an address that does not appear in the neighborhood map. They seem glad the café is open. You do not ask how they found the flyer."
  },
  {
    id: "day-4-bohn-recognizes-coin",
    day: 4,
    title: "Herr Bohn, on Denominations",
    tone: "anomaly",
    trigger: "Herr Grau's coin from earlier.",
    text: "Herr Bohn sees the coin from Herr Grau on the counter. He says he recognizes the denomination. He does not say from where. He finishes his coffee and leaves before you can ask.",
    relatedGuestIds: ["herr-bohn", "herr-grau"]
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
    id: "day-5-receipt-printer-early",
    day: 5,
    title: "Receipt Before Order",
    tone: "anomaly",
    trigger: "Register begins foreshadowing KASSANDRA behavior one day early.",
    text: "The receipt printer issued a receipt four seconds before the order was placed. You timed it. It is consistent. The amounts are correct."
  },
  {
    id: "day-5-storage-smell",
    day: 5,
    title: "Storage Room",
    tone: "anomaly",
    trigger: "Escalating environmental weirdness on day 5.",
    text: "Your helper mentions the storage room smells different today. Not bad. Just as if something in there has been somewhere else recently."
  },
  {
    id: "day-6-kassandra-update",
    day: 6,
    title: "KASSANDRA Update",
    tone: "kassandra",
    trigger: "The cash register update installs.",
    text: "The register update is complete. KASSANDRA has filed an initial report. It was not asked to."
  },
  {
    id: "day-6-returning-guest",
    day: 6,
    title: "Returning Guest, Out of Sequence",
    tone: "kassandra",
    trigger: "KASSANDRA begins predicting demand.",
    text: "KASSANDRA flags a \"returning guest, 15:12, slightly out of sequence.\" At 15:12 someone thanks you warmly for last time. You are fairly sure there was no last time."
  },
  {
    id: "day-6-kassandra-complaint-queue",
    day: 6,
    title: "Pending Complaints",
    tone: "kassandra",
    trigger: "KASSANDRA surfaces bureaucratic anomaly.",
    text: "KASSANDRA has opened a complaint register. Zero complaints filed. Three complaints listed as pending from events that have not happened yet. Status: waiting."
  },
  {
    id: "day-6-disclaimer-receipt",
    day: 6,
    title: "Pre-Approved",
    tone: "kassandra",
    trigger: "KASSANDRA printer behavior escalation.",
    text: "The receipts now include a small footer line: \"This transaction has been pre-approved.\" KASSANDRA says this is a formatting update. You did not authorize a formatting update."
  },
  {
    id: "day-7-red-umbrella",
    day: 7,
    title: "Red Umbrella",
    tone: "anomaly",
    trigger: "Frau mit rotem Regenschirm appears on the busier Day 7.",
    text: "A woman arrives with a red umbrella although it is not raining. She asks not to be recognized.",
    relatedGuestIds: ["frau-roter-regenschirm"]
  },
  {
    id: "day-7-back-wall-doorway",
    day: 7,
    title: "The Back Wall, Briefly",
    tone: "anomaly",
    trigger: "Day 7: the busiest day, just before the letter.",
    text: "For one breath the back wall reads like a doorway to somewhere with different weather. Then it is a wall again. None of the regulars mention it, which is how you know they noticed too."
  },
  {
    id: "day-7-menu-bookmark",
    day: 7,
    title: "Bookmark",
    tone: "anomaly",
    trigger: "Escalating reality loosening on day 7.",
    text: "A guest leaves a bookmark inside the menu. It marks page 47. The menu is 12 pages long. Page 47 is not there, but the bookmark holds something open."
  },
  {
    id: "day-7-kassandra-threshold",
    day: 7,
    title: "THRESHOLD",
    tone: "kassandra",
    trigger: "Day 7 peak weirdness: KASSANDRA and the machine sync.",
    text: "The coffee machine and KASSANDRA displayed the same word for six seconds: THRESHOLD. A brief hardware alignment issue, probably. Both systems returned to normal without being asked."
  }
] as const satisfies readonly EventDefinition[];
