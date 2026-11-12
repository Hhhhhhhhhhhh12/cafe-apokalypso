import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { StorageStatusMessage } from "../src/ui/components/StorageStatusMessage";
import { resolveStorageStatusAfterSave } from "../src/ui/components/storageStatus";

describe("storage status message", () => {
  it("keeps an unstyled live region mounted when persistence is healthy", () => {
    const markup = renderToStaticMarkup(<StorageStatusMessage status={null} />);

    expect(markup).toContain('role="status"');
    expect(markup).not.toContain("status-message");
  });

  it("explains that a failed reset leaves the current week running", () => {
    const markup = renderToStaticMarkup(
      <StorageStatusMessage status="reset-failed" />
    );

    expect(markup).toContain('role="status"');
    expect(markup).toContain("The new week could not be saved");
    expect(markup).toContain("keep playing the current week");
  });

  it("distinguishes a legacy cleanup failure from a current-save failure", () => {
    const markup = renderToStaticMarkup(
      <StorageStatusMessage status="cleanup-failed" />
    );

    expect(markup).toContain("some older browser data could not be cleared");
  });
});

describe("storage status transitions", () => {
  it("clears an autosave warning after saving succeeds", () => {
    expect(resolveStorageStatusAfterSave("save-failed", true)).toBeNull();
  });

  it("keeps the cleanup warning after saving succeeds", () => {
    expect(resolveStorageStatusAfterSave("cleanup-failed", true)).toBe("cleanup-failed");
  });

  it("reports a failed autosave", () => {
    expect(resolveStorageStatusAfterSave(null, false)).toBe("save-failed");
  });
});
