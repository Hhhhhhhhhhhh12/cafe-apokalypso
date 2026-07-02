import type { EquipmentSlotId } from "../types/game";

export interface EquipmentTier {
  /** 0 = not yet owned (must be bought in setup); higher = nicer. */
  tier: number;
  name: string;
  /** Cost to buy INTO this tier. Tier 0 has no cost (it is "nothing yet"). */
  cost: number;
  /** One-time reputation bump granted when this tier is first bought. */
  reputationBonus: number;
  /** Reputation added every morning the day opens (seating gets a small bump from tier 2). */
  dailyRepBonus: number;
}

export interface EquipmentSlotDefinition {
  id: EquipmentSlotId;
  label: string;
  /** Short line shown in the setup shop while the slot is still unowned (tier 0). */
  emptyHint: string;
  tiers: readonly EquipmentTier[];
}

/**
 * Core café equipment bought before opening (see the "setup" day phase): the
 * coffee machine and the seating furniture. Unlike décor, these start at tier 0
 * (= nothing owned). The starting till (€42) covers exactly the cheapest used
 * machine + used furniture (€18 + €14 = €32), so the player opens bare and
 * upgrades later from the day-end shop. See GAME_DESIGN.md and #setup.
 *
 * The machine is required to open (no machine, no café). Seating is optional —
 * with seating tier 0 guests order at the counter and stand / take away; tables
 * and seated guests only appear once furniture is owned.
 *
 * The register (the till) is the third slot. Unlike machine/seating it is never
 * unowned: every café opens with the basic till already on the counter (tier 1),
 * so it costs nothing at setup and never strains the opening budget. Players only
 * UPGRADE it (card terminal → pro POS) for atmosphere reputation. This is the
 * physical hardware and is distinct from the KASSANDRA *software* update, a Day-6
 * narrative beat that layers onto whatever till is present (see weekOneUpgrades).
 */
export const equipmentSlots = [
  {
    id: "machine",
    label: "Coffee Machine",
    emptyHint: "No machine yet — you can't brew without one.",
    tiers: [
      { tier: 0, name: "No Machine", cost: 0, reputationBonus: 0, dailyRepBonus: 0 },
      { tier: 1, name: "Used Single-Group Machine", cost: 18, reputationBonus: 0, dailyRepBonus: 0 },
      { tier: 2, name: "Refurbished Two-Group", cost: 34, reputationBonus: 2, dailyRepBonus: 0 },
      { tier: 3, name: "Gleaming Espresso Tower", cost: 60, reputationBonus: 4, dailyRepBonus: 1 }
    ]
  },
  {
    id: "seating",
    label: "Seating",
    emptyHint: "No furniture — guests order at the counter and stand.",
    tiers: [
      { tier: 0, name: "Standing Room Only", cost: 0, reputationBonus: 0, dailyRepBonus: 0 },
      { tier: 1, name: "Second-hand Tables & Chairs", cost: 14, reputationBonus: 0, dailyRepBonus: 0 },
      { tier: 2, name: "Matched Café Set", cost: 30, reputationBonus: 2, dailyRepBonus: 1 },
      { tier: 3, name: "Cosy Lounge Corner", cost: 52, reputationBonus: 4, dailyRepBonus: 2 }
    ]
  },
  {
    id: "register",
    label: "Register",
    emptyHint: "Just a cash box — slow and easy to miscount.",
    tiers: [
      { tier: 0, name: "Cash Box Only", cost: 0, reputationBonus: 0, dailyRepBonus: 0 },
      { tier: 1, name: "Basic Till", cost: 10, reputationBonus: 0, dailyRepBonus: 0 },
      { tier: 2, name: "Card Terminal", cost: 26, reputationBonus: 2, dailyRepBonus: 1 },
      { tier: 3, name: "Pro POS with Customer Display", cost: 46, reputationBonus: 4, dailyRepBonus: 2 }
    ]
  }
] as const satisfies readonly EquipmentSlotDefinition[];

export function getEquipmentSlot(id: EquipmentSlotId): EquipmentSlotDefinition {
  return equipmentSlots.find((slot) => slot.id === id) ?? equipmentSlots[0];
}

export function getEquipmentTier(id: EquipmentSlotId, tier: number): EquipmentTier | undefined {
  return getEquipmentSlot(id).tiers.find((entry) => entry.tier === tier);
}

export function getMaxEquipmentTier(id: EquipmentSlotId): number {
  return getEquipmentSlot(id).tiers.reduce((max, entry) => Math.max(max, entry.tier), 0);
}

/** Total daily reputation bonus from all currently owned equipment tiers. */
export function getEquipmentDailyBonuses(
  equipment: Record<EquipmentSlotId, number>
): { reputation: number } {
  let reputation = 0;
  for (const [slotId, tier] of Object.entries(equipment) as [EquipmentSlotId, number][]) {
    const tierDef = getEquipmentTier(slotId, tier);
    if (tierDef) {
      reputation += tierDef.dailyRepBonus;
    }
  }
  return { reputation };
}
