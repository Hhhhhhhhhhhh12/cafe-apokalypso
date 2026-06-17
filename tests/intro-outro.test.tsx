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
    expect(visibleText(markup)).toContain("Skip");
  });

  it("opens fully dark — veil starts at opacity 1", () => {
    const markup = renderToStaticMarkup(<IntroSequence onComplete={() => {}} />);

    // The veil div gets an inline opacity:1 on the first beat (full black).
    expect(markup).toContain("opacity:1");
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
    expect(visibleText(markup)).toContain("Skip");
  });

  it("shows the demo-complete banner after Day 7 and hides the intro", () => {
    const storage = createMemoryStorage();
    saveGameState(
      {
        ...createInitialGameState(),
        day: 7,
        dayPhase: "day_end",
        demoComplete: true,
        weirdnessVisible: true
      },
      storage
    );

    const markup = renderAppWith(storage);
    const text = visibleText(markup);

    expect(markup).toContain("demo-complete-banner");
    expect(text).toContain("The first café week is over");
    expect(text).toContain("Start the next café week");
    expect(markup).not.toContain("intro-cinema");
  });
});
