/**
 * Screen-reader announcement structure (GitHub #70).
 *
 * Verifies the status line is a *persistent* aria-live region (so changes are
 * announced) and that secondary panels don't compete as extra live regions.
 * Rendered to static markup — we assert on the emitted ARIA attributes.
 */
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { GuestService } from "../src/ui/cafe/GuestService";
import { ActionPanel } from "../src/ui/components/ActionPanel";
import { createInitialGameState } from "../src/game/engine/gameState";
import type { GameState } from "../src/game/types/game";

const noop = () => {};

function renderActionPanel(state: GameState, statusMessage = "A test status beat.") {
  return renderToStaticMarkup(
    <ActionPanel
      gameState={state}
      statusMessage={statusMessage}
      onConsultKassandra={noop}
      onUpgradeDecor={noop}
      onBuyEquipment={noop}
      onBuyUpgrade={noop}
      onResetGame={noop}
    />
  );
}

function renderService(state: GameState) {
  return renderToStaticMarkup(<GuestService gameState={state} onServeProduct={noop} />);
}

/** Open state with a live flow streak so the flow-meter and next-guest render. */
function openWithStreak(): GameState {
  const base = createInitialGameState();
  return {
    ...base,
    dayPhase: "open",
    dayManagement: { ...base.dayManagement, serveStreak: 3, bestServeStreak: 3 }
  };
}

describe("screen-reader announcements (#70)", () => {
  it("renders the status line as a persistent live region with a keyed inner span", () => {
    const markup = renderActionPanel(openWithStreak(), "Served Kemal his filter coffee.");

    // The <p> itself is the live region — it carries the ARIA, not a remounting node.
    expect(markup).toContain('class="status-message"');
    expect(markup).toContain('role="status"');
    expect(markup).toContain('aria-live="polite"');
    expect(markup).toContain('aria-atomic="true"');
    // The animated text lives in an inner span so the region can stay mounted.
    expect(markup).toContain('class="status-message__text"');
    expect(markup).toContain("Served Kemal his filter coffee.");
  });

  it("keeps exactly one live region in an active open shift (no announcement pile-up)", () => {
    // Full action capacity + a streak: flow-meter and next-guest are visible but
    // must NOT be live regions, so only the status line announces.
    const markup = renderActionPanel(openWithStreak());
    const statusRegions = markup.match(/role="status"/g) ?? [];
    expect(statusRegions).toHaveLength(1);
  });

  it("keeps the flow meter visible and labelled but not a live region", () => {
    const markup = renderActionPanel(openWithStreak());
    const flowTag = markup.match(/<div class="flow-meter[^"]*"[^>]*>/)?.[0] ?? "";
    expect(flowTag).not.toBe("");
    expect(flowTag).toContain("aria-label=");
    expect(flowTag).not.toContain('role="status"');
  });

  it("keeps the guest order labelled without adding another live region", () => {
    const markup = renderService(openWithStreak());
    const nextGuestTag = markup.match(/<div class="next-guest"[^>]*>/)?.[0] ?? "";
    expect(nextGuestTag).not.toBe("");
    expect(nextGuestTag).toContain('aria-label="Next guest in line"');
    expect(nextGuestTag).not.toContain('role="status"');
  });

  it("labels expected income per guest and keeps the menu price as a detail", () => {
    const markup = renderService(openWithStreak());
    expect(markup).toContain("Est. 1.5 Asche");
    expect(markup).toContain('aria-label="Filter Coffee: estimated income 1.5 Asche per guest"');
    expect(markup).toContain("Menu price 2.2 Asche.");
  });

  it("warns only when another patience action can actually cause a walkout", () => {
    const state = openWithStreak();
    state.dayManagement.currentGuestPatienceMax = 100;
    state.dayManagement.currentGuestPatience = 25;
    state.dayManagement.actionsWithoutServing = 3;
    const warning = "One more action that uses patience and this guest leaves unserved.";
    expect(renderService(state)).not.toContain(warning);
    state.day = 4;
    expect(renderService(state)).toContain(warning);
    state.dayManagement.actionPointsRemaining = 0;
    expect(renderService(state)).not.toContain(warning);
  });

  it("also warns at the shorter patience window in a messy café", () => {
    const state = openWithStreak();
    state.day = 4;
    state.resources.cleanliness = 40;
    state.dayManagement.currentGuestPatienceMax = 75;
    state.dayManagement.currentGuestPatience = 25;
    state.dayManagement.actionsWithoutServing = 2;
    const markup = renderService(state);
    expect(markup).toContain("One more action that uses patience");
    expect(markup).not.toContain('role="status"');
  });
});
