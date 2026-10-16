import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  resolveStorageStatusAfterSave,
  StorageStatusMessage
} from "../src/ui/components/StorageStatusMessage";

describe("storage status message", () => {
  it("keeps an unstyled live region mounted when persistence is healthy", () => {
    const markup = renderToStaticMarkup(<StorageStatusMessage status={null} />);

    expect(markup).toContain('role="status"');
    expect(markup).not.toContain("status-message");
  });

  it("explains that reset only cleared the in-memory run after a removal failure", () => {
    const markup = renderToStaticMarkup(
      <StorageStatusMessage status="reset-failed" />
    );

    expect(markup).toContain('role="status"');
    expect(markup).toContain("A fresh week started in this session");
    expect(markup).toContain("an old save may return after reload");
  });

  it("distinguishes a legacy cleanup failure from a current-save failure", () => {
    const markup = renderToStaticMarkup(
      <StorageStatusMessage status="cleanup-failed" />
    );

    expect(markup).toContain("some older browser data could not be cleared");
    expect(markup).not.toContain("an old save may return");
  });
});

describe("storage status transitions", () => {
  it("clears the reset warning after the fresh state is saved", () => {
    expect(
      resolveStorageStatusAfterSave("reset-failed", true, {
        currentSaveRemovalFailed: true,
        cleanupFailed: false
      })
    ).toBeNull();
  });

  it("keeps only the cleanup warning after a successful fresh save", () => {
    expect(
      resolveStorageStatusAfterSave("reset-failed", true, {
        currentSaveRemovalFailed: true,
        cleanupFailed: true
      })
    ).toBe("cleanup-failed");
  });

  it("keeps the reset warning while rewriting the fresh state still fails", () => {
    expect(
      resolveStorageStatusAfterSave("reset-failed", false, {
        currentSaveRemovalFailed: true,
        cleanupFailed: false
      })
    ).toBe("reset-failed");
  });
});
