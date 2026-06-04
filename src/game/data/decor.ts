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
    label: "Pflanze",
    tiers: [
      { tier: 1, name: "Hängendes Topfgewächs", cost: 0, reputationBonus: 0 },
      { tier: 2, name: "Kräftiges Grün", cost: 12, reputationBonus: 1 },
      { tier: 3, name: "Üppige Monstera", cost: 24, reputationBonus: 2 }
    ]
  },
  {
    id: "shelf",
    label: "Regal",
    tiers: [
      { tier: 1, name: "Wackeliges Brettregal", cost: 0, reputationBonus: 0 },
      { tier: 2, name: "Solides Holzregal", cost: 14, reputationBonus: 1 },
      { tier: 3, name: "Kuratiertes Wandregal", cost: 28, reputationBonus: 2 }
    ]
  },
  {
    id: "clock",
    label: "Wanduhr",
    tiers: [
      { tier: 1, name: "Schiefe Wanduhr", cost: 0, reputationBonus: 0 },
      { tier: 2, name: "Holzrahmenuhr", cost: 10, reputationBonus: 1 },
      { tier: 3, name: "Messingpendel-Uhr", cost: 22, reputationBonus: 2 }
    ]
  },
  {
    id: "lamp",
    label: "Stehlampe",
    tiers: [
      { tier: 1, name: "Glühbirne am Stab", cost: 0, reputationBonus: 0 },
      { tier: 2, name: "Stoffschirmlampe", cost: 12, reputationBonus: 1 },
      { tier: 3, name: "Warme Bogenlampe", cost: 26, reputationBonus: 2 }
    ]
  },
  {
    id: "cups",
    label: "Thekentassen",
    tiers: [
      { tier: 1, name: "Zusammengewürfelte Tassen", cost: 0, reputationBonus: 0 },
      { tier: 2, name: "Passendes Set", cost: 8, reputationBonus: 1 },
      { tier: 3, name: "Handgefertigte Keramik", cost: 18, reputationBonus: 1 }
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
