import type { StaffOptionDefinition, StaffOptionId } from "../types/content";

export const staffTraining = {
  jana: {
    name: "Recovery care",
    cost: 3,
    effect: "+5 cleanliness each time Jana clears a table."
  },
  nino: {
    name: "Barista drills",
    cost: 4,
    effect: "+1 action each shift Nino works as barista."
  },
  nele: {
    name: "Guest relations",
    cost: 4,
    effect: "+2 Asche for a successful rush when Nele works."
  }
} as const satisfies Record<StaffOptionId, { name: string; cost: number; effect: string }>;

export const weekOneStaffOptions = [
  {
    id: "jana",
    name: "Jana",
    role: "service_cleaning",
    unlockDay: 3,
    dailyCost: 7,
    effects: ["Improves table turnover", "Reduces cleaning pressure"],
    flavorLine: "I can help with service. The wet table was already wet."
  },
  {
    id: "nino",
    name: "Nino",
    role: "barista",
    unlockDay: 3,
    dailyCost: 10,
    effects: ["Improves drink preparation", "Reduces barista stress"],
    flavorLine: "I make coffee quickly. Philosophy costs extra."
  },
  {
    id: "nele",
    name: "Nele",
    role: "marketing_counter",
    unlockDay: 3,
    dailyCost: 9,
    linkedGuestId: "freelancerin-nele",
    effects: ["Improves counter flow", "Supports small marketing choices"],
    flavorLine:
      "I posted a photo. It got 14 likes and one comment in a language Google says does not exist."
  }
] as const satisfies readonly StaffOptionDefinition[];
