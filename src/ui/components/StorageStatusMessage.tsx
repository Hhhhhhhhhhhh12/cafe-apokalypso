export type StorageStatusKind =
  | "unavailable"
  | "save-failed"
  | "cleanup-failed"
  | "reset-failed";

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
  if (!status) {
    return null;
  }

  return (
    <p className="status-message" role="status" aria-live="polite" aria-atomic="true">
      <span key={status} className="status-message__text">
        {STORAGE_STATUS_MESSAGES[status]}
      </span>
    </p>
  );
}
