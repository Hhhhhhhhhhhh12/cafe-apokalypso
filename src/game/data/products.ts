import type { ProductDefinition } from "../types/content";

export const weekOneProducts = [
  {
    id: "filterkaffee",
    name: "Filterkaffee",
    category: "drink",
    firstDay: 1,
    basePrice: 2.2,
    ingredients: { coffee: 1 },
    summary: "The grounded first drink for the opening café loop."
  },
  {
    id: "espresso",
    name: "Espresso",
    category: "drink",
    firstDay: 1,
    basePrice: 2.4,
    ingredients: { coffee: 1 },
    summary: "Fast, simple, and useful for impatient guests."
  },
  {
    id: "cappuccino",
    name: "Cappuccino",
    category: "drink",
    firstDay: 1,
    basePrice: 3.4,
    ingredients: { coffee: 1, milk: 1 },
    summary: "A higher-expectation product for quality-sensitive guests."
  },
  {
    id: "croissant",
    name: "Croissant",
    category: "food",
    firstDay: 1,
    basePrice: 2.8,
    ingredients: { pastries: 1 },
    summary: "Basic pastry stock for the early café economy."
  },
  {
    id: "kaffee-croissant",
    name: "Kaffee + Croissant",
    category: "combo",
    firstDay: 3,
    basePrice: 4.6,
    ingredients: { coffee: 1, pastries: 1 },
    summary: "The first simple daily-offer style combo."
  }
] as const satisfies readonly ProductDefinition[];
