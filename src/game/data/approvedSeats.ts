import type { GuestId } from "../types/content";
import type { TableId } from "../types/game";

/** Fixed chair assignments from the approved compact-room review (9d59d10). */
export const approvedSeats = {
  "meda": { table: "left", chair: "back", contact: [590, 790] },
  "laptop-lukas": { table: "left", chair: "front", contact: [730, 800] },
  "nachbarin-mira": { table: "right", chair: "back", contact: [590, 830] },
  "cappuccino-christa": { table: "right", chair: "front", contact: [760, 823] },
  "freelancerin-nele": { table: "back", chair: "back", contact: [590, 830] },
  "pendlerin-fatou": { table: "back", chair: "front", contact: [760, 823] }
} as const satisfies Partial<Record<GuestId, { table: TableId; chair: "back" | "front"; contact: readonly [number, number] }>>;

export type SeatedGuestId = keyof typeof approvedSeats;
