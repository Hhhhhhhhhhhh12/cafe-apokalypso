import { createFreshRunState, isValidGameState, migrateRawSave } from "./gameState";
import type { GameState } from "../types/game";

export const SAVE_KEY = "cafe-apokalypso.save.v4";
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
  | { status: "missing" | "load-failed" };

export function readGameSave(storage: StorageLike): GameLoadResult {
  try {
    const rawSave = storage.getItem(SAVE_KEY);

    if (rawSave === null) {
      return { status: "missing" };
    }

    const parsedSave: unknown = migrateRawSave(JSON.parse(rawSave));

    if (!isValidGameState(parsedSave)) {
      return { status: "load-failed" };
    }

    return { status: "loaded", state: parsedSave };
  } catch {
    return { status: "load-failed" };
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
  const failedKeys: string[] = [];

  for (const key of [SAVE_KEY, ...LEGACY_SAVE_KEYS]) {
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
