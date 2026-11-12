export type StorageStatusKind =
  | "unavailable"
  | "load-failed"
  | "save-failed"
  | "cleanup-failed"
  | "reset-failed"
  | "protected-reset-failed";

export function resolveStorageStatusAfterSave(
  currentStatus: StorageStatusKind | null,
  saveSucceeded: boolean
): StorageStatusKind | null {
  if (!saveSucceeded) {
    return "save-failed";
  }

  return currentStatus === "save-failed" ? null : currentStatus;
}
