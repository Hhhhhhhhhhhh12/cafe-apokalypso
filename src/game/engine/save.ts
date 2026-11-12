import { createFreshRunState, isValidGameState, migrateRawSave } from "./gameState";
import type { GameState } from "../types/game";

export const SAVE_KEY = "cafe-apokalypso.save.v5";
export const PREVIOUS_SAVE_KEY = "cafe-apokalypso.save.v4";
const LEGACY_SAVE_KEYS = [
  "cafe-apokalypso.save.v1",
  "cafe-apokalypso.save.v2",
  "cafe-apokalypso.save.v3"
];

export type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export type StorageMutationResult =
  | { ok: true }
  | { ok: false; failedKeys: readonly string[] };

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

export type GameLoadResult =
  | { status: "loaded"; state: GameState }
  | { status: "missing" }
  | { status: "load-failed"; rejectedPreviousSave?: string; previousSaveReadFailed?: true };

export function readGameSave(storage: StorageLike): GameLoadResult {
  let rawSave: string | null;
  let fromPreviousKey = false;
  try {
    rawSave = storage.getItem(SAVE_KEY);
    if (rawSave === null) {
      fromPreviousKey = true;
      rawSave = storage.getItem(PREVIOUS_SAVE_KEY);
    }
  } catch {
    return fromPreviousKey
      ? { status: "load-failed", previousSaveReadFailed: true }
      : { status: "load-failed" };
  }

  if (rawSave === null) return { status: "missing" };
  try {
    const parsedSave: unknown = migrateRawSave(JSON.parse(rawSave));
    if (isValidGameState(parsedSave)) {
      return { status: "loaded", state: parsedSave };
    }
  } catch {
    // Keep rejected bytes available for recovery.
  }

  return fromPreviousKey
    ? { status: "load-failed", rejectedPreviousSave: rawSave }
    : { status: "load-failed" };
}

export function preserveRejectedPreviousSave(storage: StorageLike, rawSave: string): boolean {
  try {
    const current = storage.getItem(SAVE_KEY);
    if (current !== null) return current === rawSave;
    storage.setItem(SAVE_KEY, rawSave);
    return true;
  } catch {
    return false;
  }
}

export function loadGameState(storage: StorageLike): GameState {
  const result = readGameSave(storage);
  return result.status === "loaded" ? result.state : createFreshRunState();
}

export function saveGameState(
  state: GameState,
  storage: StorageLike
): StorageMutationResult {
  try {
    storage.setItem(SAVE_KEY, JSON.stringify(state));
    return { ok: true };
  } catch {
    return { ok: false, failedKeys: [SAVE_KEY] };
  }
}

export function resetSavedGameState(storage: StorageLike): StorageMutationResult {
  return removeSaveKeys(storage, [SAVE_KEY, PREVIOUS_SAVE_KEY, ...LEGACY_SAVE_KEYS]);
}

export function clearLegacySaves(storage: StorageLike): StorageMutationResult {
  return removeSaveKeys(storage, LEGACY_SAVE_KEYS);
}

function removeSaveKeys(storage: StorageLike, keys: readonly string[]): StorageMutationResult {
  const failedKeys: string[] = [];

  for (const key of keys) {
    try {
      storage.removeItem(key);
    } catch {
      failedKeys.push(key);
    }
  }

  return failedKeys.length === 0
    ? { ok: true }
    : { ok: false, failedKeys };
}
