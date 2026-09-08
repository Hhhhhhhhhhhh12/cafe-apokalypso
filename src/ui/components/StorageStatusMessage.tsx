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

const STORAGE_STATUS_MESSAGES: Record<StorageStatusKind, string> = {
  unavailable:
    "Browser storage is unavailable. You can keep playing, but this session will not survive a reload.",
  "save-failed":
    "Progress continues in this session, but it could not be saved. A reload may not preserve this session.",
  "cleanup-failed":
    "A fresh week started, but some older browser data could not be cleared.",
  "reset-failed":
    "A fresh week started in this session, but browser data could not be fully cleared. If storage stays unavailable, an old save may return after reload."
};

export function StorageStatusMessage({
  status
}: {
  status: StorageStatusKind | null;
}) {
  return (
    <div role="status" aria-live="polite" aria-atomic="true">
      {status ? (
        <p className="status-message">
          <span key={status} className="status-message__text">
            {STORAGE_STATUS_MESSAGES[status]}
          </span>
        </p>
      ) : null}
    </div>
  );
}
