import type { GuestDefinition } from "../types/content";

export const weekOneGuests = [
  {
    id: "pendlerin-paula",
    name: "Pendlerin Paula",
    category: "normal",
    firstDay: 1,
    behaviorTags: ["fast", "practical", "low-seat-time"],
    summary: "Quick coffee customer who wants to survive Monday.",
    sampleLines: ["Just coffee. The train already took the rest of my patience."]
  },
  {
    id: "laptop-lukas",
    name: "Laptop-Lukas",
    category: "normal",
    firstDay: 2,
    behaviorTags: ["low-spend", "long-seat-time", "remote-work"],
    summary: "Spends little, sits for a long time, and blocks tables.",
    sampleLines: ["I only need one small table and the emotional support of Wi-Fi."]
  },
  {
    id: "lieferfahrer-cem",
    name: "Lieferfahrer Cem",
    category: "normal",
    firstDay: 2,
    behaviorTags: ["impatient", "low-spend", "quick-service"],
    summary: "Impatient, efficient, and not interested in latte philosophy.",
    sampleLines: ["Espresso. Fast. I am parked in a place where optimism ends."]
  },
  {
    id: "cappuccino-christa",
    name: "Cappuccino-Christa",
    category: "normal",
    firstDay: 2,
    behaviorTags: ["quality-expectations", "higher-spend", "foam-precision"],
    summary: "Pays better and has precise expectations for cappuccino foam.",
    sampleLines: ["The foam was good yesterday. Today I am open to evidence."]
  },
  {
    id: "herr-bohn",
    name: "Herr Bohn",
    category: "normal",
    firstDay: 2,
    behaviorTags: ["regular", "patient", "memory-hints"],
    summary: "Older regular with strange memories of the building.",
    sampleLines: ["This corner used to be quieter. Before it remembered things."]
  },
  {
    id: "freelancerin-mira",
    name: "Freelancerin Mira",
    category: "normal",
    firstDay: 3,
    behaviorTags: ["dry-humor", "observant", "freelancer"],
    summary:
      "Dry, observant recurring guest and early tone anchor. She is not Meda.",
    sampleLines: [
      "The café is authentic. I am not sure whether that is good.",
      "The light is good. Slightly existential, but good."
    ]
  },
  {
    id: "herr-grau",
    name: "Herr Grau",
    category: "subtly_strange",
    firstDay: 4,
    behaviorTags: ["polite", "quiet", "accounting-anomaly"],
    summary:
      "Polite and quiet guest who pays with a coin that does not fit any accounting category.",
    sampleLines: [
      "Black. No sugar. I am only passing through.",
      "Your opening hours are pleasantly mortal."
    ]
  },
  {
    id: "frau-roter-regenschirm",
    name: "Frau mit rotem Regenschirm",
    category: "subtly_strange",
    firstDay: 7,
    behaviorTags: ["evasive", "elegant", "late-week-anomaly"],
    summary:
      "Appears with a red umbrella although it is not raining and asks not to be recognized.",
    sampleLines: [
      "A cappuccino. Very light. I do not want to be recognized today.",
      "No receipt, please. Paper remembers too well."
    ]
  },
  {
    id: "meda",
    name: "Meda",
    category: "subtly_strange",
    firstDay: 5,
    behaviorTags: ["calm", "still", "mythological-hint"],
    summary:
      "The first clearer mythological hint. Meda is separate from Mira and must not be merged.",
    sampleLines: [
      "An espresso. And please, look at the counter when you bring it.",
      "I prefer the corner seat. People look at me less from there."
    ],
    visualNotes:
      "Sunglasses indoors, subtle snake-like hair silhouette, careful about direct eye contact."
  }
] as const satisfies readonly GuestDefinition[];

export const normalWeekOneGuests = weekOneGuests.filter(
  (guest) => guest.category === "normal"
);

export const subtlyStrangeWeekOneGuests = weekOneGuests.filter(
  (guest) => guest.category === "subtly_strange"
);
