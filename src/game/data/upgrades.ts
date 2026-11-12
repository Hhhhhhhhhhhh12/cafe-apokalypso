import type { UpgradeDefinition } from "../types/content";

export const weekOneUpgrades = [
  {
    id: "menu-board",
    name: "Small Offer Board",
    unlockDay: 3,
    cost: 16,
    purchasable: false,
    effects: ["Supports daily offers"],
    summary: "Makes the first simple offer choices visible."
  },
  {
    id: "storage-shelf",
    name: "Extra Storage Shelf",
    unlockDay: 3,
    cost: 24,
    purchasable: false,
    effects: ["Supports ingredient purchasing"],
    summary: "A grounded operational upgrade for early supplies."
  },
  {
    id: "better-beans",
    name: "Better Beans",
    unlockDay: 3,
    cost: 20,
    purchasable: true,
    effects: ["Supports quality-sensitive guests"],
    summary: "Serving a guest with quality expectations grants +1 reputation."
  },
  {
    id: "second-table",
    name: "Second Small Table",
    unlockDay: 4,
    cost: 28,
    purchasable: true,
    effects: ["Supports higher guest traffic"],
    summary: "+1 action each day from the next café opening."
  },
  {
    id: "cleaning-kit",
    name: "Cleaning Kit",
    unlockDay: 5,
    cost: 14,
    purchasable: true,
    effects: ["Supports table cleaning"],
    summary: "Each served customer costs 1 cleanliness instead of 2."
  },
  {
    id: "cash-register-update",
    name: "Register Update KASSANDRA",
    unlockDay: 6,
    cost: 0,
    purchasable: false,
    effects: ["Unlocks simulated demand prediction"],
    summary: "Introduces KASSANDRA as a cash register update, not a real AI."
  },
  {
    id: "weatherproof-umbrella-stand",
    name: "Umbrella Stand",
    unlockDay: 7,
    cost: 10,
    purchasable: false,
    effects: ["Supports the red-umbrella day beat"],
    summary: "A mundane prop for a late-week anomaly."
  }
] as const satisfies readonly UpgradeDefinition[];
