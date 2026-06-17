import { createFreshRunState, createInitialGameState, isValidGameState, migrateRawSave } from "./gameState";
import type { GameState } from "../types/game";

export const SAVE_KEY = "cafe-apokalypso.save.v4";
const LEGACY_SAVE_KEYS = [
  "cafe-apokalypso.save.v1",
  "cafe-apokalypso.save.v2",
  "cafe-apokalypso.save.v3"
];

export type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export function getBrowserStorage(): StorageLike | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function loadGameState(storage: StorageLike): GameState {
  try {
    const rawSave = storage.getItem(SAVE_KEY);

    if (!rawSave) {
      return createFreshRunState();
    }

    const parsedSave: unknown = migrateRawSave(JSON.parse(rawSave));

    if (!isValidGameState(parsedSave)) {
      return createFreshRunState();
    }

    return parsedSave;
  } catch {
    return createFreshRunState();
  }
}

export function saveGameState(state: GameState, storage: StorageLike): void {
  storage.setItem(SAVE_KEY, JSON.stringify(state));
}

export function resetSavedGameState(storage: StorageLike): void {
  storage.removeItem(SAVE_KEY);
  for (const legacyKey of LEGACY_SAVE_KEYS) {
    storage.removeItem(legacyKey);
  }
}
