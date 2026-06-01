import type { StaffOptionDefinition } from "../types/content";

export const weekOneStaffOptions = [
  {
    id: "jana",
    name: "Jana",
    role: "service_cleaning",
    unlockDay: 3,
    dailyCost: 18,
    effects: ["Improves table turnover", "Reduces cleaning pressure"],
    flavorLine: "I can help with service. The wet table was already wet."
  },
  {
    id: "nino",
    name: "Nino",
    role: "barista",
    unlockDay: 3,
    dailyCost: 22,
    effects: ["Improves drink preparation", "Reduces barista stress"],
    flavorLine: "I make coffee quickly. Philosophy costs extra."
  },
  {
    id: "mira",
    name: "Mira",
    role: "marketing_counter",
    unlockDay: 3,
    dailyCost: 20,
    linkedGuestId: "freelancerin-mira",
    effects: ["Improves counter flow", "Supports small marketing choices"],
    flavorLine:
      "I posted a photo. It got 14 likes and one comment in a language Google says does not exist."
  }
] as const satisfies readonly StaffOptionDefinition[];
