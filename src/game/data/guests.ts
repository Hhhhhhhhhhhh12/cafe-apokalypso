import type { GuestDefinition } from "../types/content";

export const weekOneGuests = [
  {
    id: "pendler-kemal",
    name: "Pendler Kemal",
    category: "normal",
    firstDay: 1,
    behaviorTags: ["fast", "practical", "low-seat-time"],
    summary: "Fast commuter who treats the café like a pit stop.",
    sampleLines: ["Filter coffee, please. And quickly — the S-Bahn does not wait."],
    orderLine: "Filter coffee, please. And quickly — the S-Bahn does not wait.",
    learningCue: "Kemal keeps his jacket on and glances at the door before the order is finished.",
    preferredProductId: "filterkaffee",
    serveLine: "He takes the cup mid-stride and is already halfway to the door.",
    matchedPreferenceLine: "Filter coffee. Exactly what he came for, no detour required.",
    missedPreferenceLine:
      "He takes it, but the extra step shows in the way he checks his watch twice."
  },
  {
    id: "pendlerin-fatou",
    name: "Pendlerin Fatou",
    category: "normal",
    firstDay: 2,
    behaviorTags: ["steady", "practical", "patient"],
    summary: "Calm commuter who comes in without fuss and leaves without lingering.",
    sampleLines: ["Filter coffee, and maybe something to read if you have it."],
    orderLine: "Filter coffee, please. Whatever is freshest.",
    learningCue: "Fatou waits without looking at the door. She is in no hurry, but she is watching.",
    preferredProductId: "filterkaffee",
    serveLine: "She thanks you, takes the cup with both hands, and finds a table without checking if one is free.",
    matchedPreferenceLine: "Filter coffee. The right call. She settles in without comment.",
    missedPreferenceLine: "She accepts it without complaint, which somehow makes it harder to forget."
  },
  {
    id: "nachbarin-mira",
    name: "Nachbarin Mira",
    category: "normal",
    firstDay: 2,
    behaviorTags: ["calm", "local", "regular"],
    summary: "Neighbour from the building upstairs who turns up when the kitchen feels too quiet.",
    sampleLines: ["Filter coffee, please."],
    orderLine: "Filter coffee, please. I only came down because the kitchen was too quiet.",
    learningCue: "She does not look for a table. She already knows which one she wants.",
    preferredProductId: "filterkaffee",
    serveLine: "She takes the cup and finds her corner without asking if it is free.",
    matchedPreferenceLine: "Filter coffee. She nods once, already moving toward her table.",
    missedPreferenceLine: "She accepts it politely. She will remember the correct order anyway.",
    decorAtmosphereBonus: { minAvgTier: 2 },
    decorAtmosphereLine: "She sets down the cup and looks around. \"It feels more settled in here than it used to.\" Rep +1."
  },
  {
    id: "laptop-lukas",
    name: "Laptop-Lukas",
    category: "normal",
    firstDay: 2,
    behaviorTags: ["low-spend", "long-seat-time", "remote-work"],
    summary: "Spends little, sits for a long time, and blocks tables.",
    sampleLines: ["I only need one small table and the emotional support of Wi-Fi."],
    orderLine: "Small coffee, please. I only need the table for one quick call.",
    learningCue:
      "Lukas spends carefully, opens the laptop early, and settles in before paying.",
    preferredProductId: "filterkaffee",
    serveLine: "He nods and opens another browser tab. He will be here for a while.",
    matchedPreferenceLine:
      "A simple coffee keeps the table occupied without making the order complicated.",
    missedPreferenceLine:
      "He accepts it, but the order now costs more attention than he planned to spend."
  },
  {
    id: "lieferfahrer-cem",
    name: "Lieferfahrer Cem",
    category: "normal",
    firstDay: 2,
    behaviorTags: ["impatient", "low-spend", "quick-service"],
    summary: "Impatient, efficient, and not interested in latte philosophy.",
    sampleLines: ["Espresso. Fast. I am parked in a place where optimism ends."],
    orderLine: "Espresso. Fast. I am parked in a place where optimism ends.",
    learningCue: "Cem checks the street twice before he checks the menu.",
    preferredProductId: "espresso",
    serveLine: "He is out the door before you finish the sentence. The invoice is correct.",
    matchedPreferenceLine: "Espresso matches the visit: short, direct, already over.",
    missedPreferenceLine:
      "He waits politely, which somehow makes the order feel slower."
  },
  {
    id: "cappuccino-christa",
    name: "Cappuccino-Christa",
    category: "normal",
    firstDay: 2,
    behaviorTags: ["quality-expectations", "higher-spend", "foam-precision"],
    summary: "Pays better and has precise expectations for cappuccino foam.",
    sampleLines: ["The foam was good yesterday. Today I am open to evidence."],
    orderLine: "Cappuccino, please. The foam was good yesterday. Today I am open to evidence.",
    learningCue: "Christa studies the cup before she studies the price.",
    preferredProductId: "cappuccino",
    serveLine:
      "She holds the cup at a slight angle. After a moment, she nods. This counts as approval.",
    appreciatedProductIds: ["cappuccino"],
    delightLine: "The foam holds. She actually smiles — word of this will travel. Rep +2.",
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
    orderLine: "Filter coffee, if that is still what I usually have.",
    learningCue: "Herr Bohn asks like the answer has existed longer than the café.",
    preferredProductId: "filterkaffee",
    serveLine:
      "He thanks you as though this has happened many times in many versions of this café.",
    appreciatedProductIds: ["filterkaffee"],
    delightLine:
      "\"My usual,\" he says, though you never agreed on one. He seems steadier for it. Rep +1.",
    letdownLine: "He accepts it kindly, but you sense this was not the version he remembered.",
    decorAtmosphereBonus: { minAvgTier: 2 },
    decorAtmosphereLine:
      "He glances around the café slowly. \"It still feels like a place that remembers itself.\" Rep +1."
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
    orderLine: "Whatever tastes least like a decision.",
    learningCue: "Nele watches the café more than the menu.",
    preferredProductId: "espresso",
    serveLine:
      "She accepts it without looking up. 'Authentic,' she says. You are still not sure if that is good.",
    matchedPreferenceLine:
      "Espresso gives her fewer variables to review. This appears to be mercy.",
    missedPreferenceLine:
      "She accepts the choice as evidence, which is not the same as approval.",
    decorAtmosphereBonus: { minAvgTier: 2 },
    decorAtmosphereLine:
      "She lowers her notebook. \"The light is better in here than it used to be.\" Rep +1."
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
    orderLine: "Pour-over, if you have the time. Black is enough; hurried is not.",
    learningCue:
      "Herr Grau waits without impatience. He notices deliberate preparation more than speed.",
    preferredProductId: "handfilter",
    serveLine:
      "He pays and thanks you. The coin does not match any denomination you can identify.",
    appreciatedProductIds: ["handfilter"],
    delightLine:
      "He tastes the pour-over slowly. \"This is the one with the long shadow,\" he says, approving. Rep +2.",
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
    orderLine: "A cappuccino. Very light. I do not want to be recognized today.",
    learningCue:
      "She keeps the umbrella close and asks for softness without asking for comfort.",
    preferredProductId: "cappuccino",
    serveLine:
      "She accepts the order quietly and asks you not to mention she was here.",
    decorAtmosphereBonus: { minAvgTier: 2 },
    decorAtmosphereLine:
      "She sets the umbrella beside the chair and breathes out slowly. The space is right today. Rep +1."
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
    orderLine: "An espresso. And please, look at the counter when you bring it.",
    learningCue:
      "Meda asks for the shortest drink and the least eye contact.",
    preferredProductId: "espresso",
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
