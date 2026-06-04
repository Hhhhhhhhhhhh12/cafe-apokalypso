import type { GuestDefinition } from "../types/content";

export const weekOneGuests = [
  {
    id: "pendlerin-paula",
    name: "Pendlerin Paula",
    category: "normal",
    firstDay: 1,
    behaviorTags: ["fast", "practical", "low-seat-time"],
    summary: "Quick coffee customer who wants to survive Monday.",
    sampleLines: ["Just coffee. The train already took the rest of my patience."],
    serveLine: "She takes the coffee without slowing down. The train was already late."
  },
  {
    id: "laptop-lukas",
    name: "Laptop-Lukas",
    category: "normal",
    firstDay: 2,
    behaviorTags: ["low-spend", "long-seat-time", "remote-work"],
    summary: "Spends little, sits for a long time, and blocks tables.",
    sampleLines: ["I only need one small table and the emotional support of Wi-Fi."],
    serveLine: "He nods and opens another browser tab. He will be here for a while."
  },
  {
    id: "lieferfahrer-cem",
    name: "Lieferfahrer Cem",
    category: "normal",
    firstDay: 2,
    behaviorTags: ["impatient", "low-spend", "quick-service"],
    summary: "Impatient, efficient, and not interested in latte philosophy.",
    sampleLines: ["Espresso. Fast. I am parked in a place where optimism ends."],
    serveLine: "He is out the door before you finish the sentence. The invoice is correct."
  },
  {
    id: "cappuccino-christa",
    name: "Cappuccino-Christa",
    category: "normal",
    firstDay: 2,
    behaviorTags: ["quality-expectations", "higher-spend", "foam-precision"],
    summary: "Pays better and has precise expectations for cappuccino foam.",
    sampleLines: ["The foam was good yesterday. Today I am open to evidence."],
    serveLine:
      "She holds the cup at a slight angle. After a moment, she nods. This counts as approval.",
    appreciatedProductIds: ["cappuccino"],
    delightLine: "The foam holds. She actually smiles — word of this will travel. Ruf +2.",
    letdownLine: "She drinks it, but the angle of her eyebrow files a quiet complaint."
  },
  {
    id: "herr-bohn",
    name: "Herr Bohn",
    category: "normal",
    firstDay: 2,
    behaviorTags: ["regular", "patient", "memory-hints"],
    summary: "Older regular with strange memories of the building.",
    sampleLines: ["This corner used to be quieter. Before it remembered things."],
    serveLine:
      "He thanks you as though this has happened many times in many versions of this café.",
    appreciatedProductIds: ["filterkaffee"],
    delightLine:
      "\"My usual,\" he says, though you never agreed on one. He seems steadier for it. Ruf +1.",
    letdownLine: "He accepts it kindly, but you sense this was not the version he remembered."
  },
  {
    id: "freelancerin-nele",
    name: "Freelancerin Nele",
    category: "normal",
    firstDay: 1,
    behaviorTags: ["dry-humor", "observant", "freelancer", "persistent"],
    summary:
      "Dry, observant recurring guest and early tone anchor. Persists across runs. She is not Meda. KASSANDRA does not classify her.",
    sampleLines: [
      "The café is authentic. I am not sure whether that is good.",
      "The light is good. Slightly existential, but good."
    ],
    serveLine:
      "She accepts it without looking up. 'Authentic,' she says. You are still not sure if that is good."
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
    ],
    serveLine:
      "He pays and thanks you. The coin does not match any denomination you can identify.",
    appreciatedProductIds: ["handfilter"],
    delightLine:
      "He tastes the pour-over slowly. \"This is the one with the long shadow,\" he says, approving. Ruf +2.",
    letdownLine:
      "He drinks it without complaint, but you sense he was hoping for something brewed more deliberately."
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
    ],
    serveLine:
      "She accepts the order quietly and asks you not to mention she was here."
  },
  {
    id: "meda",
    name: "Meda",
    category: "subtly_strange",
    firstDay: 5,
    behaviorTags: ["calm", "still", "mythological-hint"],
    summary:
      "The first clearer mythological hint. Meda is separate from Nele and must not be merged.",
    sampleLines: [
      "An espresso. And please, look at the counter when you bring it.",
      "I prefer the corner seat. People look at me less from there."
    ],
    serveLine:
      "She takes the cup without looking at you. The table beside her grows briefly still.",
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
