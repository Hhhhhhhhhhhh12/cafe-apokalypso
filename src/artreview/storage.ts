import type { ArtCandidate } from "./types";

export const ART_REVIEW_KEY = "cafe-apokalypso.artreview.v1";

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

export function loadCandidates(storage: StorageLike): ArtCandidate[] {
  try {
    const raw = storage.getItem(ART_REVIEW_KEY);
    if (!raw) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isValidCandidate);
  } catch {
    return [];
  }
}

export function saveCandidates(candidates: ArtCandidate[], storage: StorageLike): void {
  storage.setItem(ART_REVIEW_KEY, JSON.stringify(candidates));
}

function isValidCandidate(value: unknown): value is ArtCandidate {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.title === "string" &&
    typeof candidate.category === "string" &&
    typeof candidate.status === "string" &&
    typeof candidate.notes === "string" &&
    typeof candidate.priority === "number" &&
    typeof candidate.imageRef === "string" &&
    typeof candidate.createdAt === "string"
  );
}
