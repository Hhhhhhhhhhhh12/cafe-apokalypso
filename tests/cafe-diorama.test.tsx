import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { App } from "../src/app/App";
import { createInitialGameState } from "../src/game/engine/gameState";
import { getDioramaGuestVisibility } from "../src/game/engine/selectors";
import { CafePlaceholder } from "../src/ui/cafe/CafePlaceholder";
import type { DayNumber } from "../src/game/types/content";
import type { GameState } from "../src/game/types/game";

function renderCafe(
  state: GameState = createInitialGameState(),
  onCleanTables?: () => void
) {
  return renderToStaticMarkup(<CafePlaceholder gameState={state} onCleanTables={onCleanTables} />);
}

function visibleText(markup: string) {
  return markup.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

describe("café diorama view", () => {
  it("renders the main screen as stage, HUD, actions, and today regions", () => {
    const markup = renderToStaticMarkup(<App />);
    const text = visibleText(markup);

    expect(markup).toContain("workspace-grid");
    expect(markup).toContain("resource-panel");
    expect(markup).toContain("cafe-stage");
    expect(markup).toContain("action-panel");
    expect(markup).toContain("day-progress-panel");
    expect(markup).toContain("aria-label=\"Café resources\"");
    expect(text).toContain("The Café");
    expect(text).toContain("Actions");
    expect(text).toContain("Day 1:");
  });

  it("renders the café view with the key room zones", () => {
    const markup = renderCafe();

    expect(markup).toContain("cafe-stage");
    expect(markup).toContain("cafe-diorama");
    expect(markup).toContain("cafe-floor");
    expect(markup).toContain("cafe-counter");
    expect(markup).toContain("cafe-coffee-machine");
    expect(markup).toContain("cafe-register");
    expect(markup).toContain("cafe-table");
    expect(markup).toContain("cafe-door");
    expect(markup).toContain("cafe-window");
    expect(markup).toContain("cafe-storage");
    expect(markup).toContain("cafe-menu-board");
    expect(markup).toContain("cafe-plant");
    // Weirdness hint is conditionally rendered — absent on Day 1
    expect(markup).not.toContain("cafe-weirdness-hint");
  });

  it("renders provisional pilot assets while preserving CSS fallbacks", () => {
    const markup = renderCafe();

    expect(markup).toContain("placeholder-cafe-coffee-machine.png");
    expect(markup).toContain("placeholder-kassandra-register.png");
    // Paula renders via CSS sprite-sheet background, identified by class
    expect(markup).toContain("cafe-pilot-asset--kemal-standing");
    expect(markup).toContain("cafe-coffee-machine");
    expect(markup).toContain("cafe-register");
    expect(markup).toContain("placeholder-guest-normal-01");
  });

  it("does not show debug or placeholder wording as player-facing text", () => {
    const text = visibleText(renderCafe()).toLowerCase();

    expect(text).toContain("the café");
    expect(text).not.toContain("debug");
    expect(text).not.toContain("placeholder");
    expect(text).not.toContain("wireframe");
  });

  it("shows weirdness-hint on day 7 and hides it on day 1", () => {
    const day1 = renderCafe(createInitialGameState());
    const day7 = renderCafe({ ...createInitialGameState(), day: 7, weirdnessVisible: true });

    expect(day1).not.toContain("cafe-weirdness-hint");
    expect(day7).toContain("cafe-weirdness-hint");
  });

  it("shows queue guest when day is open with actions, hides when closed", () => {
    const base = createInitialGameState();
    const openWithActions = renderCafe({ ...base, dayPhase: "open" });
    const dayEnd = renderCafe({ ...base, dayPhase: "day_end" });

    expect(openWithActions).toContain("placeholder-guest-normal-01");
    expect(openWithActions).toContain("cafe-pilot-asset--kemal-standing");
    expect(dayEnd).not.toContain("cafe-pilot-asset--kemal-standing");
  });

  it("shows seated guests based on customersServed count", () => {
    const base = createInitialGameState();
    const none = renderCafe({ ...base, dayPhase: "open", dayManagement: { ...base.dayManagement, customersServed: 0 } });
    const one = renderCafe({ ...base, dayPhase: "open", dayManagement: { ...base.dayManagement, customersServed: 1 } });
    const two = renderCafe({ ...base, dayPhase: "open", dayManagement: { ...base.dayManagement, customersServed: 2 } });

    expect(none).not.toContain("placeholder-guest-normal-03");
    expect(one).toContain("placeholder-guest-normal-03");
    expect(one).not.toContain("placeholder-guest-normal-04");
    expect(two).toContain("placeholder-guest-normal-04");
  });

  it("renders dirty tables as clickable clean-table buttons (#130)", () => {
    const base = createInitialGameState();
    const dirtyOpen: GameState = {
      ...base,
      dayPhase: "open",
      resources: { ...base.resources, cleanliness: 40 },
      equipment: { ...base.equipment, seating: 1 },
      dayManagement: { ...base.dayManagement, customersServed: 2, actionPointsRemaining: 2 }
    };

    const clickable = renderCafe(dirtyOpen, () => {});
    expect(clickable).toContain("cafe-table--clickable");
    expect(clickable).toContain("Dirty table — wipe it down (1 action)");

    // Without a handler the tables stay decorative
    expect(renderCafe(dirtyOpen)).not.toContain("cafe-table--clickable");

    // Clean café → nothing to wipe, no button
    const cleanOpen: GameState = {
      ...dirtyOpen,
      resources: { ...dirtyOpen.resources, cleanliness: 90 }
    };
    expect(renderCafe(cleanOpen, () => {})).not.toContain("cafe-table--clickable");

    // No action points left → not clickable either
    const noAp: GameState = {
      ...dirtyOpen,
      dayManagement: { ...dirtyOpen.dayManagement, actionPointsRemaining: 0 }
    };
    expect(renderCafe(noAp, () => {})).not.toContain("cafe-table--clickable");
  });

  it("emits décor tier classes for every prop slot", () => {
    const base = createInitialGameState();
    const markup = renderCafe({
      ...base,
      decor: { plant: 2, plant2: 1, shelf: 3, clock: 1, lamp: 2, cups: 3 }
    });

    expect(markup).toMatch(/cafe-decor-plant[^"]*cafe-decor--tier-2/);
    expect(markup).toMatch(/cafe-decor-plant2[^"]*cafe-decor--tier-1/);
    expect(markup).toMatch(/cafe-storage[^"]*cafe-decor--tier-3/);
    expect(markup).toMatch(/cafe-decor-clock[^"]*cafe-decor--tier-1/);
    expect(markup).toMatch(/cafe-decor-lamp[^"]*cafe-decor--tier-2/);
    expect(markup).toMatch(/cafe-decor-cups[^"]*cafe-decor--tier-3/);
  });

  it("uses day and served-count thresholds for Bohn and the first strange guest", () => {
    expect(getDioramaGuestVisibility(cafeStateFor(2, 3)).bohn).toBe(false);
    expect(getDioramaGuestVisibility(cafeStateFor(3, 0)).bohn).toBe(false);
    expect(getDioramaGuestVisibility(cafeStateFor(3, 1)).bohn).toBe(true);

    expect(getDioramaGuestVisibility(cafeStateFor(3, 3)).strange).toBe(false);
    expect(getDioramaGuestVisibility(cafeStateFor(4, 2)).strange).toBe(false);
    expect(getDioramaGuestVisibility(cafeStateFor(4, 3)).strange).toBe(true);
  });

  it("renders Bohn and the first strange guest sprites when thresholds are met", () => {
    const markup = renderCafe(cafeStateFor(4, 3));

    expect(markup).toContain("placeholder-guest-bohn.png");
    expect(markup).toContain("placeholder-guest-strange.png");
    expect(markup).toContain("cafe-pilot-asset--bohn");
    expect(markup).toContain("cafe-pilot-asset--strange");
  });

  it("keeps the explicit weirdness cue behind the visibility gate", () => {
    const daySevenBeforeHook = renderCafe({
      ...createInitialGameState(),
      day: 7,
      weirdnessVisible: false
    });
    const daySevenAfterHook = renderCafe({
      ...createInitialGameState(),
      day: 7,
      weirdnessVisible: true
    });

    expect(daySevenBeforeHook).toContain("cafe-diorama--weirdness-deniable");
    expect(daySevenBeforeHook).not.toContain("cafe-diorama--weirdness-visible");
    expect(daySevenAfterHook).toContain("cafe-diorama--weirdness-visible");
  });

  it("adds visual state classes from existing game state", () => {
    const markup = renderCafe({
      ...createInitialGameState(),
      day: 6,
      kassandraInstalled: true,
      resources: {
        ...createInitialGameState().resources,
        cleanliness: 30,
        stress: 70
      }
    });

    expect(markup).toContain("cafe-diorama--messy");
    expect(markup).toContain("cafe-diorama--strained");
    expect(markup).toContain("cafe-diorama--kassandra-awake");
  });
});

function cafeStateFor(day: DayNumber, customersServed: number): GameState {
  const base = createInitialGameState();

  return {
    ...base,
    day,
    dayPhase: "open",
    dayManagement: {
      ...base.dayManagement,
      customersServed
    }
  };
}
