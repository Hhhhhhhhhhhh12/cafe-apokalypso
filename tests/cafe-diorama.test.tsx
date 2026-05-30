import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { App } from "../src/app/App";
import { createInitialGameState } from "../src/game/engine/gameState";
import { CafePlaceholder } from "../src/ui/cafe/CafePlaceholder";
import type { GameState } from "../src/game/types/game";

function renderCafe(state: GameState = createInitialGameState()) {
  return renderToStaticMarkup(<CafePlaceholder gameState={state} />);
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
    expect(text).toContain("Café HUD");
    expect(text).toContain("Heute im Café");
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
    expect(markup).toContain("cafe-weirdness-hint");
  });

  it("renders provisional pilot assets while preserving CSS fallbacks", () => {
    const markup = renderCafe();

    expect(markup).toContain("placeholder-cafe-coffee-machine.png");
    expect(markup).toContain("placeholder-kassandra-register.png");
    expect(markup).toContain("placeholder-guest-paula.png");
    expect(markup).toContain("cafe-coffee-machine");
    expect(markup).toContain("cafe-register");
    expect(markup).toContain("placeholder-guest-normal-01");
  });

  it("does not show debug or placeholder wording as player-facing text", () => {
    const text = visibleText(renderCafe()).toLowerCase();

    expect(text).toContain("heute im café");
    expect(text).not.toContain("debug");
    expect(text).not.toContain("placeholder");
    expect(text).not.toContain("wireframe");
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
