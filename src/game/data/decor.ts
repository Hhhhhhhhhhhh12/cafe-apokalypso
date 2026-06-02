import type { DecorSlotId } from "../types/game";

export interface DecorTier {
  /** 1 = shabby day-one default; higher = nicer. */
  tier: number;
  name: string;
  /** Cost to upgrade INTO this tier (tier 1 is free / pre-owned). */
  cost: number;
  /** One-time reputation bump granted when this tier is first bought. */
  reputationBonus: number;
}

export interface DecorSlotDefinition {
  id: DecorSlotId;
  label: string;
  tiers: readonly DecorTier[];
}

/**
 * Décor slots start at their shabby tier (1) and can be upgraded with cash.
 * Cosmetic (the diorama swaps a CSS tier class; real sprites later) plus a
 * small one-time reputation bump per upgrade. See #57 and GAME_DESIGN.md
 * "Décor economy: shabby start → paid upgrades".
 */
export const decorSlots = [
  {
    id: "plant",
    label: "Plant",
    tiers: [
      { tier: 1, name: "Wilting pot plant", cost: 0, reputationBonus: 0 },
      { tier: 2, name: "Healthy greenery", cost: 12, reputationBonus: 1 },
      { tier: 3, name: "Lush monstera", cost: 24, reputationBonus: 2 }
    ]
  },
  {
    id: "shelf",
    label: "Shelf",
    tiers: [
      { tier: 1, name: "Wobbly shelf", cost: 0, reputationBonus: 0 },
      { tier: 2, name: "Solid wood shelf", cost: 14, reputationBonus: 1 },
      { tier: 3, name: "Curated display", cost: 28, reputationBonus: 2 }
    ]
  }
] as const satisfies readonly DecorSlotDefinition[];

export function getDecorSlot(id: DecorSlotId): DecorSlotDefinition {
  return decorSlots.find((slot) => slot.id === id) ?? decorSlots[0];
}

export function getDecorTier(id: DecorSlotId, tier: number): DecorTier | undefined {
  return getDecorSlot(id).tiers.find((entry) => entry.tier === tier);
}

export function getMaxDecorTier(id: DecorSlotId): number {
  return getDecorSlot(id).tiers.reduce((max, entry) => Math.max(max, entry.tier), 1);
}
