import type { UpgradeDefinition } from "../types/content";

export const weekOneUpgrades = [
  {
    id: "menu-board",
    name: "Kleine Angebotstafel",
    unlockDay: 3,
    cost: 16,
    effects: ["Supports daily offers"],
    summary: "Makes the first simple offer choices visible."
  },
  {
    id: "storage-shelf",
    name: "Zusätzliches Vorratsregal",
    unlockDay: 3,
    cost: 24,
    effects: ["Supports ingredient purchasing"],
    summary: "A grounded operational upgrade for early supplies."
  },
  {
    id: "better-beans",
    name: "Bessere Bohnen",
    unlockDay: 3,
    cost: 20,
    effects: ["Supports quality-sensitive guests"],
    summary: "Helps quality expectations without changing the product list."
  },
  {
    id: "second-table",
    name: "Zweiter kleiner Tisch",
    unlockDay: 4,
    cost: 28,
    effects: ["Supports higher guest traffic"],
    summary: "A modest café-capacity upgrade."
  },
  {
    id: "cleaning-kit",
    name: "Reinigungsset",
    unlockDay: 5,
    cost: 14,
    effects: ["Supports table cleaning"],
    summary: "Keeps early stress and cleanliness manageable."
  },
  {
    id: "cash-register-update",
    name: "Kassen-Update KASSANDRA",
    unlockDay: 6,
    cost: 0,
    effects: ["Unlocks simulated demand prediction"],
    summary: "Introduces KASSANDRA as a cash register update, not a real AI."
  },
  {
    id: "weatherproof-umbrella-stand",
    name: "Schirmständer",
    unlockDay: 7,
    cost: 10,
    effects: ["Supports the red-umbrella day beat"],
    summary: "A mundane prop for a late-week anomaly."
  }
] as const satisfies readonly UpgradeDefinition[];
