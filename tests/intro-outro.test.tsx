import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { KassandraBootScreen } from "../src/ui/components/KassandraBootScreen";
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

describe("KASSANDRA boot splash", () => {
  it("shows the [REDACTED] previous-runs line as the meta hook", () => {
    const markup = renderToStaticMarkup(
      <KassandraBootScreen onDismiss={() => {}} />
    );
    const text = visibleText(markup);

    expect(markup).toContain("kassandra-boot");
    expect(text).toContain("Previous runs: [REDACTED]");
    expect(text).toContain("Open the café");
  });

  it("is a modal dialog with an accessible label", () => {
    const markup = renderToStaticMarkup(
      <KassandraBootScreen onDismiss={() => {}} />
    );

    expect(markup).toContain('role="dialog"');
    expect(markup).toContain('aria-modal="true"');
    expect(markup).toContain('aria-labelledby="kassandra-boot-title"');
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

  it("shows the boot splash on a fresh Day 1 run", () => {
    const markup = renderAppWith(createMemoryStorage());

    expect(markup).toContain("kassandra-boot");
    expect(visibleText(markup)).toContain("Previous runs: [REDACTED]");
  });

  it("shows the demo-complete banner after Day 7 and hides the boot splash", () => {
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
    expect(markup).not.toContain("kassandra-boot");
  });
});
