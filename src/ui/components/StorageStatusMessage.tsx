import type { StorageStatusKind } from "./storageStatus";

const STORAGE_STATUS_MESSAGES: Record<StorageStatusKind, string> = {
  unavailable:
    "Browser storage is unavailable. You can keep playing, but this session will not survive a reload.",
  "load-failed":
    "The existing save could not be loaded and was left untouched. You can play this week without saving. Reset / New Game replaces the old save and turns saving back on.",
  "previous-save-unprotected":
    "The older save could not be loaded or copied. Autosave is paused. An older tab may still overwrite the original save.",
  "save-failed":
    "Progress continues in this session, but it could not be saved. A reload may not preserve this session.",
  "cleanup-failed":
    "A fresh week started, but some older browser data could not be cleared.",
  "reset-failed":
    "The new week could not be saved. You can keep playing the current week or try the reset again.",
  "protected-reset-failed":
    "The new week could not be saved and autosave is still paused. You can try the reset again."
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
