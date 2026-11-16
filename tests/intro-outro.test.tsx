import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { IntroSequence } from "../src/ui/components/IntroSequence";
import { App } from "../src/app/App";
import { createInitialGameState } from "../src/game/engine/gameState";
import { saveGameState, type StorageLike } from "../src/game/engine/save";

function visibleText(markup: string) {
  return markup.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

/** In-memory StorageLike, mirroring tests/save.test.ts, exposed as window.localStorage. */
function createMemoryStorage(): StorageLike {
  const values = new Map<string, string>();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => void values.set(key, value),
    removeItem: (key) => void values.delete(key)
  };
}

describe("Diegetic cinematic intro (IntroSequence)", () => {
  it("renders the cinematic overlay with a skip button", () => {
    const markup = renderToStaticMarkup(<IntroSequence onComplete={() => {}} />);

    expect(markup).toContain("intro-cinema");
    expect(markup).toContain('aria-label="Intro überspringen"');
    expect(visibleText(markup)).toBe("");
  });

  it("starts in the dark phase with the doorway closed", () => {
    const markup = renderToStaticMarkup(<IntroSequence onComplete={() => {}} />);

    expect(markup).toContain('data-phase="dark"');
    expect(markup).toMatch(/class="arcana-world\s*"/);
    expect(markup).toContain('class="arcana-door-lit-room"');
  });
});

describe("App intro/outro screens", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function renderAppWith(storage: StorageLike) {
    vi.stubGlobal("window", { localStorage: storage });
    return renderToStaticMarkup(<App />);
  }

  it("shows the cinematic intro on a fresh Day 1 run", () => {
    const markup = renderAppWith(createMemoryStorage());

    expect(markup).toContain("intro-cinema");
    expect(markup).toContain('aria-label="Intro überspringen"');
    // Gameplay must not be reachable behind the intro while the room is revealed.
    expect(markup).not.toContain("workspace-grid");
    expect(markup).toContain("intro-cinema__scene");
    expect(markup).toContain("inert");
  });

  it("keeps a fresh run playable when browser storage is unavailable", () => {
    vi.stubGlobal("window", {
      get localStorage() {
        throw new DOMException("Storage access denied", "SecurityError");
      }
    });

    const markup = renderToStaticMarkup(<App />);
    const text = visibleText(markup);

    expect(markup).toContain("intro-cinema");
    expect(text).toContain("Browser storage is unavailable");
    expect(text).toContain("keep playing");
    expect(text).toContain("will not survive a reload");
  });

  it.each([false, true])("renders only the café envelope for the letter (opened: %s)", (opened) => {
    const storage = createMemoryStorage();
    saveGameState(
      {
        ...createInitialGameState(),
        day: 7,
        dayPhase: "day_end",
        demoComplete: true,
        weirdnessVisible: true,
        ...(opened ? { daySevenLetterOpened: true } : {})
      },
      storage
    );

    const markup = renderAppWith(storage);
    const text = visibleText(markup);

    const envelopeLabel = opened ? "Read the letter again" : "Open the sealed letter";
    expect(markup.match(new RegExp(`aria-label="${envelopeLabel}"`, "g"))).toHaveLength(1);
    expect(text).not.toContain("Office for Extraordinary Operational Relevance");
    expect(text.includes("Replay week one")).toBe(opened);
    expect(markup).not.toContain("intro-cinema");
  });
});
