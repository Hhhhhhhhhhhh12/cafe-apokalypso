import type { AchievementDefinition } from "../types/content";

export const weekOneAchievements = [
  {
    id: "first-order",
    name: "First Order",
    unlockDay: 1,
    requirement: "Serve the first guest.",
    description: "The café begins as a café."
  },
  {
    id: "clean-counter",
    name: "Clean Counter",
    unlockDay: 1,
    requirement: "Clean tables during the opening day.",
    description: "A small victory over entropy."
  },
  {
    id: "regular-recognized",
    name: "Regular Recognized",
    unlockDay: 2,
    requirement: "Meet an early regular.",
    description: "The café starts remembering faces."
  },
  {
    id: "first-ad",
    name: "First Ad",
    unlockDay: 4,
    requirement: "Run a grounded advertising action.",
    description: "People now know where to find the coffee."
  },
  {
    id: "first-helper",
    name: "First Helper",
    unlockDay: 3,
    requirement: "Hire temporary help for one day.",
    description: "Delegation begins carefully."
  },
  {
    id: "kassandra-installed",
    name: "KASSANDRA Installed",
    unlockDay: 6,
    requirement: "Install the cash register update.",
    description: "Business analytics become slightly too confident."
  },
  {
    id: "week-one-letter",
    name: "The Letter",
    unlockDay: 7,
    requirement: "Receive the official Day-7 hook letter.",
    description: "The café is now administratively harder to ignore."
  }
] as const satisfies readonly AchievementDefinition[];
