/**
 * Display & Accessibility options scaffold (GitHub #67).
 *
 * Static-markup checks: the header exposes a labelled, collapsed disclosure
 * affordance, and the planned options are previewed truthfully (reduced motion
 * respected; the rest "coming soon"). Toggle logic is out of scope (#68 etc.).
 */
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { App } from "../src/app/App";
import { OptionsMenu } from "../src/ui/components/OptionsMenu";

describe("options menu scaffold (#67)", () => {
  it("renders a collapsed, labelled disclosure button in the app header", () => {
    const markup = renderToStaticMarkup(<App />);
    expect(markup).toContain("options-menu__button");
    // Disclosure starts collapsed.
    expect(markup).toContain('aria-expanded="false"');
    expect(markup).toContain('aria-controls=');
    expect(markup).toContain("Display &amp; access.");
  });

  it("keeps the panel closed until opened (no preview list on first paint)", () => {
    const markup = renderToStaticMarkup(<OptionsMenu />);
    expect(markup).not.toContain("options-menu__panel");
    expect(markup).not.toContain("Coming soon");
  });

  it("previews the planned options with honest status tags when open", () => {
    const markup = renderToStaticMarkup(<OptionsMenu defaultOpen />);
    expect(markup).toContain("options-menu__panel");
    expect(markup).toContain('role="group"');
    expect(markup).toContain('aria-label="Display and accessibility options"');
    // Reduced motion is already honoured today — must not be mislabelled.
    expect(markup).toContain("Reduced motion");
    expect(markup).toContain("Respected");
    // The rest are previews.
    expect(markup).toContain("Colourblind-friendly palette");
    expect(markup).toContain("Text size");
    expect(markup).toContain("Coming soon");
  });
});
