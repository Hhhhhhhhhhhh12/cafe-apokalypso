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
"Minimum supplies during imminent reality thinning."

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
    id: "day-1-first-cup",
    day: 1,
    title: "The First Cup",
    tone: "anomaly",
    kicker: "On the floor",
    trigger: "The first coffee of the café's existence is poured.",
    text: "The first cup pours exactly to the line, without you watching it. You decide that is just a steady hand.",
    flavorLines: [
      "The crema settles into a shape, then thinks better of it.",
      "You check the machine's calibration. It has not been calibrated."
    ]
  },
  {
    id: "day-1-coffee-machine-flicker",
    day: 1,
    title: "Coffee Machine Flicker",
    tone: "anomaly",
    kicker: "Closing",
    trigger: "After closing on Day 1.",
    text: "The coffee machine briefly displays \"Good morning.\" It is 14:07.",
    flavorLines: [
      "You unplug it for a moment. When it wakes, it shows the time. The correct time.",
      "The manual's troubleshooting section ends with: \"If the display says something pleasant, this is normal.\""
    ]
  },
  {
    id: "day-2-herr-bohn-memory",
    day: 2,
    title: "Herr Bohn Remembers",
    tone: "anomaly",
    kicker: "On the floor",
    trigger: "Herr Bohn visits after guest behavior differences are introduced.",
    text: "Herr Bohn mentions that the corner used to be quieter. Before it remembered things.",
    flavorLines: [
      "He says it the way one mentions the weather, and orders the same as yesterday.",
      "You do not ask what the corner remembers. He does not appear to expect you to."
    ],
    relatedGuestIds: ["herr-bohn"]
  },
  {
    id: "day-2-kemal-fast-order",
    day: 2,
    title: "Kemal, On Schedule",
    tone: "anomaly",
    kicker: "On the floor",
    trigger: "Pendler Kemal's quick morning order on Day 2.",
    text: "Kemal orders before he reaches the counter, pays in exact change, and is through the door before the cup is warm. The change was exact for a price you have not set yet.",
    flavorLines: [
      "He did not look at the menu. You have not put the menu out yet."
    ],
    relatedGuestIds: ["pendler-kemal"]
  },
  {
    id: "day-2-rehearsed-rhythm",
    day: 2,
    title: "A Rehearsed Rhythm",
    tone: "anomaly",
    kicker: "On the floor",
    trigger: "Regulars begin to form and the daily rhythm settles.",
    text: "By mid-morning the regulars arrive in an order that feels lightly rehearsed. You did not arrange it. You suspect it will happen the same way tomorrow.",
    flavorLines: [
      "Nobody consults the others. The timing is simply convenient for everyone simultaneously."
    ]
  },
  {
    id: "day-3-cash-register-suggestion",
    day: 3,
    title: "Strange Cash-Register Suggestion",
    tone: "anomaly",
    kicker: "From the register",
    trigger: "Prices, supplies, and daily offers become available.",
    text: "The cash register recommends not accepting prophecies as payment today.",
    flavorLines: [
      "This option does not appear in the register's official documentation.",
      "You mark it as noted and move on. The register accepts this without comment."
    ]
  },
  {
    id: "day-3-supply-tally",
    day: 3,
    title: "Inventory Observation",
    tone: "anomaly",
    kicker: "Stockroom",
    trigger: "First inventory audit after supplies become trackable.",
    text: "The supply shelf has one more bag of coffee than you purchased. The count is consistent across three recounts. You log it as a rounding benefit.",
    flavorLines: [
      "The bag is sealed. The roast date is last Tuesday. You opened Tuesday at 8:00.",
      "You add it to the inventory. The register accepts the entry without flagging it."
    ]
  },
  {
    id: "day-3-guest-checks-in",
    day: 3,
    title: "Just Passing Through",
    tone: "anomaly",
    kicker: "On the floor",
    trigger: "A quiet traveler stops in during the busier midweek.",
    text: "A quiet traveler asks to sit a while and \"not be anywhere in particular.\" They barely touch the coffee, then leave looking like they got further away than the door should allow.",
    flavorLines: [
      "Their bag is heavy. They do not say what is in it. You do not ask.",
      "The table they left is clean. You did not clean it."
    ]
  },
  {
    id: "day-4-herr-grau-coin",
    day: 4,
    title: "Herr Grau's Coin",
    tone: "anomaly",
    kicker: "At the counter",
    trigger: "Advertising unlocks and Herr Grau can appear.",
    text: "Herr Grau gives a tip and a coin that smells faintly of cellar.",
    flavorLines: [
      "The coin is correct denomination. It does not match any currency you recognise, but it weighs what it should.",
      "The register accepts it. It closes the transaction without a category."
    ],
    relatedGuestIds: ["herr-grau"]
  },
  {
    id: "day-4-poster-before-printed",
    day: 4,
    title: "The Poster, Earlier",
    tone: "anomaly",
    kicker: "On the floor",
    trigger: "Advertising begins influencing demand.",
    text: "A guest compliments the new poster by the door. You only print it that afternoon. You decide not to dwell on the order of events.",
    flavorLines: [
      "The guest describes it accurately. Colour, font, the small bird in the corner.",
      "You did not plan a bird. You add one anyway."
    ]
  },
  {
    id: "day-4-flyer-wrong-address",
    day: 4,
    title: "The Flyer Reaches Someone",
    tone: "anomaly",
    kicker: "On the floor",
    trigger: "First advertising run.",
    text: "Three people arrive from an address that does not appear in the neighborhood map. They seem glad the café is open. You do not ask how they found the flyer.",
    flavorLines: [
      "They pay normally. They tip well. One of them leaves a hat that was not there before they arrived."
    ]
  },
  {
    id: "day-4-bohn-recognizes-coin",
    day: 4,
    title: "Herr Bohn, on Denominations",
    tone: "anomaly",
    kicker: "On the floor",
    trigger: "Herr Grau's coin from earlier.",
    text: "Herr Bohn sees the coin from Herr Grau on the counter. He says he recognises the denomination. He does not say from where. He finishes his coffee and leaves before you can ask.",
    flavorLines: [
      "He paid for the coffee without looking at the price. The amount was exact."
    ],
    relatedGuestIds: ["herr-bohn", "herr-grau"]
  },
  {
    id: "day-5-wet-table-jana",
    day: 5,
    title: "Wet Table",
    tone: "anomaly",
    kicker: "On the floor",
    trigger: "Temporary help is available; Jana can work service and cleaning.",
    text: "A table is wet in a way that does not match any visible spill.",
    flavorLines: [
      "Jana wiped it twice. It is still damp. She has stopped mentioning it.",
      "The guests at the table noticed and moved to another one without saying anything."
    ]
  },
  {
    id: "day-5-meda-corner-seat",
    day: 5,
    title: "Meda Chooses the Corner",
    tone: "anomaly",
    kicker: "On the floor",
    trigger: "First possible Meda appearance.",
    text: "Meda prefers the corner seat. People look at her less from there.",
    flavorLines: [
      "She orders an espresso and asks, calmly, that you look at the counter when you bring it.",
      "The guest nearest to her forgets what they were saying. They do not seem upset about it."
    ],
    relatedGuestIds: ["meda"]
  },
  {
    id: "day-5-receipt-printer-early",
    day: 5,
    title: "Receipt Before Order",
    tone: "anomaly",
    kicker: "From the register",
    trigger: "Register begins foreshadowing KASSANDRA behavior one day early.",
    text: "The receipt printer issued a receipt four seconds before the order was placed. You timed it. It is consistent. The amounts are correct.",
    flavorLines: [
      "The paper is warm, as if it has been waiting.",
      "The item name on the receipt says \"the usual.\" The guest ordered the usual."
    ]
  },
  {
    id: "day-5-second-table-hum",
    day: 5,
    title: "The Second Table",
    tone: "anomaly",
    kicker: "Closing",
    trigger: "Environmental detail on Day 5 as the café gets more lived-in.",
    text: "After the last guest leaves, the second table makes a low sound for approximately three seconds. Not a creak. More like an acknowledgement.",
    flavorLines: [
      "You check the floor beneath it. The floor is level.",
      "It does not do it again while you watch."
    ]
  },
  {
    id: "day-5-storage-smell",
    day: 5,
    title: "Storage Room",
    tone: "anomaly",
    kicker: "Stockroom",
    trigger: "Escalating environmental weirdness on day 5.",
    text: "Your helper mentions the storage room smells different today. Not bad. Just as if something in there has been somewhere else recently.",
    flavorLines: [
      "The coffee bags are where you left them. The smell is a little like rain, which is unusual for a dry room.",
      "You prop the door open. The smell fades. You close it again. It comes back slowly."
    ]
  },
  {
    id: "day-6-kassandra-update",
    day: 6,
    title: "KASSANDRA Update",
    tone: "kassandra",
    kicker: "From the register",
    trigger: "The cash register update installs.",
    text: "The register update is complete. KASSANDRA has filed an initial report. It was not asked to.",
    flavorLines: [
      "The report is 4 pages. Page 3 is addressed to someone who has not arrived yet.",
      "KASSANDRA classified the café as: operational. Status: unresolved. It did not explain the status."
    ]
  },
  {
    id: "day-6-kassandra-forecast",
    day: 6,
    title: "Demand Forecast Filed",
    tone: "kassandra",
    kicker: "From the register",
    trigger: "KASSANDRA issues its first unsolicited demand prediction.",
    text: "KASSANDRA has filed a demand forecast for today. It reads: \"Expected guests: the usual, plus two who should not be here yet, and one who has been here before in a different week.\" Confidence: high.",
    flavorLines: [
      "The forecast was accurate on all three counts, in the order listed.",
      "KASSANDRA logged the event as routine."
    ]
  },
  {
    id: "day-6-returning-guest",
    day: 6,
    title: "Returning Guest, Out of Sequence",
    tone: "kassandra",
    kicker: "On the floor",
    trigger: "KASSANDRA begins predicting demand.",
    text: "KASSANDRA flags a \"returning guest, 15:12, slightly out of sequence.\" At 15:12 someone thanks you warmly for last time. You are fairly sure there was no last time.",
    flavorLines: [
      "They order something you do not have on the menu yet. You make it from memory."
    ]
  },
  {
    id: "day-6-kassandra-complaint-queue",
    day: 6,
    title: "Pending Complaints",
    tone: "kassandra",
    kicker: "From the register",
    trigger: "KASSANDRA surfaces bureaucratic anomaly.",
    text: "KASSANDRA has opened a complaint register. Zero complaints filed. Three complaints listed as pending from events that have not happened yet. Status: waiting.",
    flavorLines: [
      "You mark the complaints as reviewed. KASSANDRA notes the review and does not close the queue.",
      "One complaint is about the music. There is no music."
    ]
  },
  {
    id: "day-6-disclaimer-receipt",
    day: 6,
    title: "Pre-Approved",
    tone: "kassandra",
    kicker: "From the register",
    trigger: "KASSANDRA printer behavior escalation.",
    text: "The receipts now include a small footer line: \"This transaction has been pre-approved.\" KASSANDRA says this is a formatting update. You did not authorize a formatting update.",
    flavorLines: [
      "Pre-approved by whom is not stated. The field is present but blank.",
      "A guest reads the footer aloud and nods, as if this clarifies something."
    ]
  },
  {
    id: "day-7-red-umbrella",
    day: 7,
    title: "Red Umbrella",
    tone: "anomaly",
    kicker: "On the floor",
    trigger: "Frau mit rotem Regenschirm appears on the busier Day 7.",
    text: "A woman arrives with a red umbrella although it is not raining. She asks not to be recognized.",
    flavorLines: [
      "You say you will not recognize her. She seems to find this reassuring.",
      "She orders a cappuccino. Very light. She leaves a 20% tip and no name."
    ],
    relatedGuestIds: ["frau-roter-regenschirm"]
  },
  {
    id: "day-7-back-wall-doorway",
    day: 7,
    title: "The Back Wall, Briefly",
    tone: "anomaly",
    kicker: "On the floor",
    trigger: "Day 7: the busiest day, just before the letter.",
    text: "For one breath the back wall reads like a doorway to somewhere with different weather. Then it is a wall again. None of the regulars mention it, which is how you know they noticed too.",
    flavorLines: [
      "The weather beyond it, briefly, was autumn. It is not autumn.",
      "The table nearest the wall has a faint ring on it from a cup that was never there."
    ]
  },
  {
    id: "day-7-menu-bookmark",
    day: 7,
    title: "Bookmark",
    tone: "anomaly",
    kicker: "On the floor",
    trigger: "Escalating reality loosening on day 7.",
    text: "A guest leaves a bookmark inside the menu. It marks page 47. The menu is 12 pages long. Page 47 is not there, but the bookmark holds something open.",
    flavorLines: [
      "You cannot close the menu fully while the bookmark is in. You remove the bookmark. You close the menu.",
      "The bookmark is dry. It smells faintly of a library that does not exist nearby."
    ]
  },
  {
    id: "day-7-kassandra-threshold",
    day: 7,
    title: "THRESHOLD",
    tone: "kassandra",
    kicker: "From the register",
    trigger: "Day 7 peak weirdness: KASSANDRA and the machine sync.",
    text: "The coffee machine and KASSANDRA displayed the same word for six seconds: THRESHOLD. A brief hardware alignment issue, probably. Both systems returned to normal without being asked.",
    flavorLines: [
      "KASSANDRA's log entry for the incident reads: \"alignment confirmed.\"",
      "The word was in the same font on both displays. Neither display uses that font."
    ]
  },
  {
    id: "day-7-closing-count",
    day: 7,
    title: "Final Count",
    tone: "kassandra",
    kicker: "Closing",
    trigger: "Day 7 closes; the letter has arrived.",
    text: "KASSANDRA's closing summary lists: guests served, supplies consumed, money received, and one field marked \"unresolved presences (see letter).\" The letter has already arrived.",
    flavorLines: [
      "The number in the unresolved field is 1. It does not match any guest from today.",
      "KASSANDRA closes the day file and marks the week as: complete, pending further guidance."
    ]
  }
] as const satisfies readonly EventDefinition[];
