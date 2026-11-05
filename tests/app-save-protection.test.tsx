// @vitest-environment jsdom
import { act, StrictMode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "../src/app/App";
import { createFreshRunState } from "../src/game/engine/gameState";
import { SAVE_KEY } from "../src/game/engine/save";

let root: Root;
let container: HTMLDivElement;

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  localStorage.setItem("cafe-apokalypso.booted.v1", "1");
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  localStorage.clear();
});

function renderApp() {
  act(() => root.render(<StrictMode><App /></StrictMode>));
}

function clickButton(label: string) {
  const button = Array.from(container.querySelectorAll("button"))
    .find((item) => item.textContent?.trim() === label);
  if (!button) throw new Error(`Missing button: ${label}`);
  act(() => button.click());
}

describe("protecting a save that failed to load", () => {
  it.each(["", "{broken json", '{"version":999}'])(
    "preserves rejected data %j through startup and only replaces it on confirmed reset",
    (originalSave) => {
      localStorage.setItem(SAVE_KEY, originalSave);
      renderApp();

      expect(container.textContent).toContain("could not be loaded");
      expect(localStorage.getItem(SAVE_KEY)).toBe(originalSave);

      const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
      clickButton("Reset / New Game");
      expect(localStorage.getItem(SAVE_KEY)).toBe(originalSave);

      confirm.mockReturnValue(true);
      clickButton("Reset / New Game");
      expect(container.textContent).not.toContain("could not be loaded");
      expect(JSON.parse(localStorage.getItem(SAVE_KEY)!)).toEqual(createFreshRunState());
    }
  );

  it("blocks writes for the session if reading a valid save throws", () => {
    const originalSave = JSON.stringify(createFreshRunState(), null, 2);
    localStorage.setItem(SAVE_KEY, originalSave);
    const read = Storage.prototype.getItem;
    const readSpy = vi.spyOn(Storage.prototype, "getItem").mockImplementation(function (
      this: Storage,
      key
    ) {
      if (key === SAVE_KEY) throw new DOMException("Cannot read save", "SecurityError");
      return read.call(this, key);
    });

    renderApp();
    readSpy.mockRestore();
    expect(container.textContent).toContain("could not be loaded");

    const purchase = container.querySelector<HTMLButtonElement>(".equipment-shop button");
    if (!purchase) throw new Error("Missing equipment purchase button");
    act(() => purchase.click());

    expect(container.textContent).toContain("Open with standing room only");
    expect(localStorage.getItem(SAVE_KEY)).toBe(originalSave);
  });

  it("starts autosaving normally when no save exists", () => {
    renderApp();
    expect(container.textContent).not.toContain("could not be loaded");
    expect(JSON.parse(localStorage.getItem(SAVE_KEY)!)).toEqual(createFreshRunState());
  });
});
