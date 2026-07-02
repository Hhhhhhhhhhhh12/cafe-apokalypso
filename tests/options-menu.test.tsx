/**
 * Display & Accessibility options menu (#67 scaffold, #68 colourblind toggle).
 *
 * Tests: disclosure button in header, panel structure, colourblind checkbox present
 * and properly labelled. localStorage persistence is hand-tested (renderToStaticMarkup
 * doesn't support effects/storage).
 */
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { App } from "../src/app/App";
import { OptionsMenu } from "../src/ui/components/OptionsMenu";

describe("options menu (#67, #68)", () => {
  it("renders a collapsed, labelled disclosure button in the app header", () => {
    const markup = renderToStaticMarkup(<App />);
    expect(markup).toContain("options-menu__button");
    expect(markup).toContain('aria-expanded="false"');
    expect(markup).toContain('aria-controls=');
    expect(markup).toContain("Display &amp; access.");
  });

  it("keeps the panel closed until opened", () => {
    const markup = renderToStaticMarkup(<OptionsMenu />);
    expect(markup).not.toContain("options-menu__panel");
  });

  it("opens to show interactive + planned options with proper status tags", () => {
    const markup = renderToStaticMarkup(<OptionsMenu defaultOpen />);
    expect(markup).toContain("options-menu__panel");
    expect(markup).toContain('role="group"');
    expect(markup).toContain('aria-label="Display and accessibility options"');
  });

  it("renders colourblind-friendly palette as an interactive checkbox", () => {
    const markup = renderToStaticMarkup(<OptionsMenu defaultOpen />);
    expect(markup).toContain("Colourblind-friendly palette");
    expect(markup).toContain("options-menu__toggle");
    expect(markup).toContain("options-menu__toggle-input");
    expect(markup).toContain('type="checkbox"');
  });

  it("lists reduced motion as already respected", () => {
    const markup = renderToStaticMarkup(<OptionsMenu defaultOpen />);
    expect(markup).toContain("Reduced motion");
    expect(markup).toContain("Respected");
  });

  it("previews future options as coming soon", () => {
    const markup = renderToStaticMarkup(<OptionsMenu defaultOpen />);
    expect(markup).toContain("Text size");
    expect(markup).toContain("Coming soon");
  });
});
