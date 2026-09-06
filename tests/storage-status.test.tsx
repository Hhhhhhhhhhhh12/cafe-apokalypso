import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { StorageStatusMessage } from "../src/ui/components/StorageStatusMessage";

describe("storage status message", () => {
  it("renders nothing when persistence is healthy", () => {
    expect(renderToStaticMarkup(<StorageStatusMessage status={null} />)).toBe("");
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
