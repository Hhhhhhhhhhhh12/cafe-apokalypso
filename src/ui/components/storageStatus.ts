export type StorageStatusKind =
  | "unavailable"
  | "save-failed"
  | "cleanup-failed"
  | "reset-failed";

export interface PendingResetStorageStatus {
  currentSaveRemovalFailed: boolean;
  cleanupFailed: boolean;
}

export function resolveStorageStatusAfterSave(
  currentStatus: StorageStatusKind | null,
  saveSucceeded: boolean,
  pendingReset: PendingResetStorageStatus | null
): StorageStatusKind | null {
  if (!saveSucceeded) {
    return pendingReset?.currentSaveRemovalFailed ? "reset-failed" : "save-failed";
  }

  if (pendingReset) {
    return pendingReset.cleanupFailed ? "cleanup-failed" : null;
  }

  return currentStatus === "save-failed" ? null : currentStatus;
}

