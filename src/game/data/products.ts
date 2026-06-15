import type { ProductDefinition } from "../types/content";

export const weekOneProducts = [
  {
    id: "filterkaffee",
    name: "Filter Coffee",
    category: "drink",
    firstDay: 1,
    basePrice: 2.2,
    ingredients: { coffee: 1 },
    qualityTier: 1,
    summary: "The grounded first drink for the opening café loop."
  },
  {
    id: "espresso",
    name: "Espresso",
    category: "drink",
    firstDay: 1,
    basePrice: 2.4,
    ingredients: { coffee: 1 },
    qualityTier: 2,
    summary: "Fast, simple, and useful for impatient guests."
  },
  {
    id: "cappuccino",
    name: "Cappuccino",
    category: "drink",
    firstDay: 1,
    basePrice: 3.4,
    ingredients: { coffee: 1, milk: 1 },
    qualityTier: 3,
    summary: "A higher-expectation product for quality-sensitive guests."
  },
  {
    id: "croissant",
    name: "Croissant",
    category: "food",
    firstDay: 1,
    basePrice: 2.8,
    ingredients: { pastries: 1 },
    qualityTier: 1,
    summary: "Basic pastry stock for the early café economy."
  },
  {
    id: "kaffee-croissant",
    name: "Coffee + Croissant",
    category: "combo",
    firstDay: 3,
    basePrice: 4.6,
    ingredients: { coffee: 1, pastries: 1 },
    qualityTier: 2,
    summary: "The first simple daily-offer style combo."
  },
  {
    id: "handfilter",
    name: "Pour-Over Special",
    category: "drink",
    firstDay: 4,
    basePrice: 4.2,
    ingredients: { coffee: 2 },
    qualityTier: 3,
    summary:
      "A slow pour-over premium black coffee. Uses more beans; connoisseurs notice."
  }
] as const satisfies readonly ProductDefinition[];
