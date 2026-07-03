import type { DecorSlotId } from "../types/game";

export interface DecorTier {
  /** 1 = shabby day-one default; higher = nicer. */
  tier: number;
  name: string;
  /** Cost to upgrade INTO this tier (tier 1 is free / pre-owned). */
  cost: number;
  /** One-time reputation bump granted when this tier is first bought. */
  reputationBonus: number;
  /** Cleanliness added every morning when the day opens. */
  dailyCleanBonus: number;
  /** Reputation added every morning when the day opens. */
  dailyRepBonus: number;
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
 *
 * Daily bonuses apply every morning when the day opens:
 * - Tier 2: +2 cleanliness (the place looks cared-for)
 * - Tier 3: +2 cleanliness + +1 reputation (regulars notice the quality)
 */
export const decorSlots = [
  {
    id: "plant",
    label: "Plant",
    tiers: [
      { tier: 1, name: "Hanging Potted Plant", cost: 0, reputationBonus: 0, dailyCleanBonus: 0, dailyRepBonus: 0 },
      { tier: 2, name: "Lush Greens", cost: 12, reputationBonus: 1, dailyCleanBonus: 2, dailyRepBonus: 0 },
      { tier: 3, name: "Full Monstera", cost: 24, reputationBonus: 2, dailyCleanBonus: 2, dailyRepBonus: 1 }
    ]
  },
  {
    id: "plant2",
    label: "Counter Plant",
    tiers: [
      { tier: 1, name: "Sprig in a Jar", cost: 0, reputationBonus: 0, dailyCleanBonus: 0, dailyRepBonus: 0 },
      { tier: 2, name: "Potted Herb", cost: 10, reputationBonus: 1, dailyCleanBonus: 1, dailyRepBonus: 0 },
      { tier: 3, name: "Blooming Succulent", cost: 20, reputationBonus: 2, dailyCleanBonus: 1, dailyRepBonus: 1 }
    ]
  },
  {
    id: "shelf",
    label: "Shelf",
    tiers: [
      { tier: 1, name: "Wobbly Board Shelf", cost: 0, reputationBonus: 0, dailyCleanBonus: 0, dailyRepBonus: 0 },
      { tier: 2, name: "Solid Wood Shelf", cost: 14, reputationBonus: 1, dailyCleanBonus: 2, dailyRepBonus: 0 },
      { tier: 3, name: "Curated Wall Shelf", cost: 28, reputationBonus: 2, dailyCleanBonus: 2, dailyRepBonus: 1 }
    ]
  },
  {
    id: "clock",
    label: "Wall Clock",
    tiers: [
      { tier: 1, name: "Crooked Wall Clock", cost: 0, reputationBonus: 0, dailyCleanBonus: 0, dailyRepBonus: 0 },
      { tier: 2, name: "Wood Frame Clock", cost: 10, reputationBonus: 1, dailyCleanBonus: 2, dailyRepBonus: 0 },
      { tier: 3, name: "Brass Pendulum Clock", cost: 22, reputationBonus: 2, dailyCleanBonus: 2, dailyRepBonus: 1 }
    ]
  },
  {
    id: "lamp",
    label: "Wall Lamp",
    tiers: [
      { tier: 1, name: "Bare Bulb Bracket", cost: 0, reputationBonus: 0, dailyCleanBonus: 0, dailyRepBonus: 0 },
      { tier: 2, name: "Glass Shade Sconce", cost: 12, reputationBonus: 1, dailyCleanBonus: 2, dailyRepBonus: 0 },
      { tier: 3, name: "Brass Wall Lamp", cost: 26, reputationBonus: 2, dailyCleanBonus: 2, dailyRepBonus: 1 }
    ]
  },
  {
    id: "cups",
    label: "Counter Cups",
    tiers: [
      { tier: 1, name: "Mismatched Cups", cost: 0, reputationBonus: 0, dailyCleanBonus: 0, dailyRepBonus: 0 },
      { tier: 2, name: "Matching Set", cost: 8, reputationBonus: 1, dailyCleanBonus: 2, dailyRepBonus: 0 },
      { tier: 3, name: "Handcrafted Ceramics", cost: 18, reputationBonus: 1, dailyCleanBonus: 2, dailyRepBonus: 1 }
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

/** Total daily bonuses from all currently owned décor tiers. */
export function getDecorDailyBonuses(decor: Record<DecorSlotId, number>): { cleanliness: number; reputation: number } {
  let cleanliness = 0;
  let reputation = 0;
  for (const [slotId, tier] of Object.entries(decor) as [DecorSlotId, number][]) {
    const tierDef = getDecorTier(slotId, tier);
    if (tierDef) {
      cleanliness += tierDef.dailyCleanBonus;
      reputation += tierDef.dailyRepBonus;
    }
  }
  return { cleanliness, reputation };
}
