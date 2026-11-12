// @vitest-environment jsdom
import { act, StrictMode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "../src/app/App";
import * as gameState from "../src/game/engine/gameState";
import { createFreshRunState, createInitialGameState } from "../src/game/engine/gameState";
import { PREVIOUS_SAVE_KEY, SAVE_KEY } from "../src/game/engine/save";
import type { GameState } from "../src/game/types/game";

const BOOT_KEY = "cafe-apokalypso.booted.v1";
const LEGACY_KEY = "cafe-apokalypso.save.v3";

const scrollIntoViewDescriptor = Object.getOwnPropertyDescriptor(Element.prototype, "scrollIntoView");

let root: Root;
let container: HTMLDivElement;

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  Object.defineProperty(Element.prototype, "scrollIntoView", { configurable: true, value: vi.fn() });
  localStorage.setItem(BOOT_KEY, "1");
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  if (scrollIntoViewDescriptor) {
    Object.defineProperty(Element.prototype, "scrollIntoView", scrollIntoViewDescriptor);
  } else {
    Reflect.deleteProperty(Element.prototype, "scrollIntoView");
  }
  localStorage.clear();
});

function renderApp() {
  act(() => root.render(<StrictMode><App /></StrictMode>));
}

function remountApp() {
  act(() => root.unmount());
  root = createRoot(container);
  renderApp();
}

function clickButton(label: string) {
  const button = Array.from(container.querySelectorAll("button"))
    .find((item) => item.textContent?.trim() === label);
  if (!button || button.disabled) throw new Error(`Missing or disabled button: ${label}`);
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

describe("restarting a week safely", () => {
  it.each([
    { label: "Reset / New Game", action: null, state: createFreshRunState() },
    {
      label: "Start a new café",
      action: "Check supplies",
      state: { ...createInitialGameState(), resources: { ...createInitialGameState().resources, money: 0 } }
    },
    {
      label: "Replay week one",
      action: "Finish Day 7",
      state: {
        ...createInitialGameState(),
        day: 7,
        completedActions: ["take_order"],
        dayManagement: { ...createInitialGameState().dayManagement, customersServed: 1 }
      } satisfies GameState
    }
  ])("protects the save until $label is confirmed and stored", ({ label, action, state }) => {
    localStorage.setItem(SAVE_KEY, "{broken json");
    localStorage.setItem(LEGACY_KEY, "old save");
    // Start close to each terminal state, then reach the banner through the real UI and reducer.
    const freshState = vi.spyOn(gameState, "createFreshRunState").mockReturnValue(state);
    renderApp();
    freshState.mockRestore();
    if (action) clickButton(action);

    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    const write = Storage.prototype.setItem;
    const setItem = vi.spyOn(Storage.prototype, "setItem");
    const removeItem = vi.spyOn(Storage.prototype, "removeItem");

    clickButton(label);
    expect(confirm).toHaveBeenCalledWith(expect.stringContaining("replaces the browser save used by this version"));
    expect(setItem).not.toHaveBeenCalled();
    expect(removeItem).not.toHaveBeenCalled();
    expect(container.textContent).toContain("could not be loaded");

    confirm.mockReturnValue(true);
    setItem.mockImplementationOnce(function (this: Storage, key: string, value: string) {
      expect(key).toBe(SAVE_KEY);
      expect(localStorage.getItem(LEGACY_KEY)).toBe("old save");
      expect(localStorage.getItem(BOOT_KEY)).toBe("1");
      if (action) expect(container.textContent).toContain(label);
      write.call(this, key, value);
    });

    clickButton(label);
    expect(setItem).toHaveBeenCalledTimes(1);
    expect(removeItem).not.toHaveBeenCalledWith(SAVE_KEY);
    expect(localStorage.getItem(LEGACY_KEY)).toBeNull();
    expect(localStorage.getItem(BOOT_KEY)).toBeNull();
    expect(JSON.parse(localStorage.getItem(SAVE_KEY)!)).toEqual(createFreshRunState());

    remountApp();
    expect(container.textContent).toContain("Before opening");
    expect(container.textContent).not.toContain("could not be loaded");
  });

  it("keeps the protected week and its save when a confirmed reset fails, then allows retry", () => {
    const raw = "{broken json";
    localStorage.setItem(SAVE_KEY, raw);
    localStorage.setItem(LEGACY_KEY, "old save");
    renderApp();

    const confirm = vi.spyOn(window, "confirm").mockReturnValue(true);
    const write = Storage.prototype.setItem;
    const setItem = vi.spyOn(Storage.prototype, "setItem").mockImplementationOnce(() => {
      throw new DOMException("Cannot save new week", "QuotaExceededError");
    });
    const removeItem = vi.spyOn(Storage.prototype, "removeItem");

    clickButton("Reset / New Game");
    expect(container.textContent).toContain("autosave is still paused");
    expect(removeItem).not.toHaveBeenCalled();
    expect(localStorage.getItem(SAVE_KEY)).toBe(raw);
    expect(localStorage.getItem(LEGACY_KEY)).toBe("old save");
    expect(localStorage.getItem(BOOT_KEY)).toBe("1");

    const purchase = container.querySelector<HTMLButtonElement>(".equipment-shop button");
    if (!purchase) throw new Error("Missing equipment purchase button");
    act(() => purchase.click());
    expect(container.textContent).toContain("Open with standing room only");
    expect(setItem).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem(SAVE_KEY)).toBe(raw);

    setItem.mockImplementation(write);
    clickButton("Reset / New Game");
    expect(confirm).toHaveBeenCalledTimes(2);
    expect(JSON.parse(localStorage.getItem(SAVE_KEY)!)).toEqual(createFreshRunState());
  });

  it("leaves a valid active save and its week in place if reset cannot save", () => {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ ...createInitialGameState(), day: 3 }));
    renderApp();
    const raw = localStorage.getItem(SAVE_KEY);
    vi.spyOn(window, "confirm").mockReturnValue(true);
    vi.spyOn(Storage.prototype, "setItem").mockImplementationOnce(() => {
      throw new DOMException("Cannot save new week", "QuotaExceededError");
    });

    clickButton("Reset / New Game");
    expect(container.textContent).toContain("keep playing the current week");
    expect(container.querySelector('[aria-label="Current status: Day 3"]')).not.toBeNull();
    expect(localStorage.getItem(SAVE_KEY)).toBe(raw);
  });

  it("allows a confirmed restart in memory when browser storage is unavailable", () => {
    vi.spyOn(window, "localStorage", "get").mockImplementation(() => {
      throw new DOMException("Storage is unavailable", "SecurityError");
    });
    renderApp();
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(true);
    const setItem = vi.spyOn(Storage.prototype, "setItem");
    const purchase = container.querySelector<HTMLButtonElement>(".equipment-shop button");
    if (!purchase) throw new Error("Missing equipment purchase button");
    act(() => purchase.click());
    expect(container.textContent).toContain("Open with standing room only");

    clickButton("Reset / New Game");
    expect(confirm).toHaveBeenCalledWith(expect.stringContaining("Browser storage is unavailable"));
    expect(container.textContent).toContain("Buy a coffee machine to open");
    expect(container.textContent).toContain("Browser storage is unavailable");
    expect(setItem).not.toHaveBeenCalled();
  });

  it("keeps a successfully saved restart when legacy cleanup fails", () => {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ ...createInitialGameState(), day: 3 }));
    localStorage.setItem(LEGACY_KEY, "old save");
    renderApp();

    vi.spyOn(window, "confirm").mockReturnValue(true);
    const remove = Storage.prototype.removeItem;
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(function (this: Storage, key) {
      if (key === LEGACY_KEY) throw new DOMException("Cannot remove legacy save", "SecurityError");
      remove.call(this, key);
    });

    clickButton("Reset / New Game");
    expect(container.textContent).toContain("some older browser data could not be cleared");
    expect(localStorage.getItem(LEGACY_KEY)).toBe("old save");
    expect(JSON.parse(localStorage.getItem(SAVE_KEY)!)).toEqual(createFreshRunState());
  });
});

describe("reopening with an existing save", () => {
  it("imports the previous key and keeps the reset even if an older tab saves afterward", () => {
    const oldState = { ...createInitialGameState(), day: 3 };
    const raw = JSON.stringify(oldState);
    localStorage.setItem(PREVIOUS_SAVE_KEY, raw);
    renderApp();
    expect(JSON.parse(localStorage.getItem(SAVE_KEY)!)).toEqual(oldState);

    vi.spyOn(window, "confirm").mockReturnValue(true);
    clickButton("Reset / New Game");
    expect(localStorage.getItem(PREVIOUS_SAVE_KEY)).toBe(raw);
    localStorage.setItem(PREVIOUS_SAVE_KEY, JSON.stringify({ ...oldState, day: 4 }));

    remountApp();
    expect(JSON.parse(localStorage.getItem(SAVE_KEY)!)).toEqual(createFreshRunState());
  });

  it.each(["", "{broken json", '{"version":999}'])("preserves rejected previous-key data %j across reload", (raw) => {
    localStorage.setItem(PREVIOUS_SAVE_KEY, raw);
    renderApp();
    expect(container.textContent).toContain("could not be loaded");
    expect(localStorage.getItem(SAVE_KEY)).toBe(raw);
    expect(localStorage.getItem(PREVIOUS_SAVE_KEY)).toBe(raw);
    localStorage.setItem(PREVIOUS_SAVE_KEY, JSON.stringify(createInitialGameState()));

    remountApp();
    expect(container.textContent).toContain("could not be loaded");
    expect(localStorage.getItem(SAVE_KEY)).toBe(raw);
  });

  it.each(["read", "copy"])("keeps autosave paused if the previous save cannot be %s", async (operation) => {
    const raw = "{broken json";
    localStorage.setItem(PREVIOUS_SAVE_KEY, raw);
    const read = Storage.prototype.getItem;
    if (operation === "read") {
      vi.spyOn(Storage.prototype, "getItem").mockImplementation(function (this: Storage, key) {
        if (key === PREVIOUS_SAVE_KEY) throw new DOMException("Cannot read previous save", "SecurityError");
        return read.call(this, key);
      });
    } else {
      vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new DOMException("Cannot copy previous save", "QuotaExceededError");
      });
    }
    await act(async () => { root.render(<StrictMode><App /></StrictMode>); });
    vi.restoreAllMocks();
    expect(container.textContent).toContain("An older tab may still overwrite the original save");
    const purchase = container.querySelector<HTMLButtonElement>(".equipment-shop button");
    if (!purchase) throw new Error("Missing equipment purchase button");
    act(() => purchase.click());
    expect(localStorage.getItem(SAVE_KEY)).toBeNull();
    expect(localStorage.getItem(PREVIOUS_SAVE_KEY)).toBe(raw);
  });

  it.each(["{broken json", '{"version":999}'])("keeps rejected bytes across mounts", (raw) => {
    localStorage.setItem(SAVE_KEY, raw);
    renderApp();
    remountApp();
    expect(container.textContent).toContain("could not be loaded");
    expect(localStorage.getItem(SAVE_KEY)).toBe(raw);
  });

  it("loads the old progress on reopening when the storage read recovers", () => {
    const state = { ...createInitialGameState(), day: 3 };
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    const read = Storage.prototype.getItem;
    const readSpy = vi.spyOn(Storage.prototype, "getItem").mockImplementation(function (this: Storage, key) {
      if (key === SAVE_KEY) throw new DOMException("Cannot read save", "SecurityError");
      return read.call(this, key);
    });
    renderApp();
    expect(container.textContent).toContain("could not be loaded");

    readSpy.mockRestore();
    remountApp();
    expect(container.querySelector('[aria-label="Current status: Day 3"]')).not.toBeNull();
    expect(JSON.parse(localStorage.getItem(SAVE_KEY)!)).toEqual(state);
  });
});
