// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createInitialGameState } from "../src/game/engine/gameState";
import type { GameState } from "../src/game/types/game";
import { CafeScene } from "../src/ui/cafe/CafeScene";

let container: HTMLDivElement;
let root: Root;
let hidden: boolean;
let observeVisibility: (visible: boolean) => void;
let saved: Map<string, string>;

const storage = {
  getItem: (key: string) => saved.get(key) ?? null,
  setItem: (key: string, value: string) => { saved.set(key, value); },
  removeItem: (key: string) => { saved.delete(key); },
};

function render(state: GameState, occluder: HTMLElement | null = null) {
  act(() => root.render(<CafeScene gameState={state} bohnStorage={storage} bohnOccluder={occluder} />));
}

function seatedState() {
  const state = createInitialGameState();
  state.day = 2;
  state.equipment.seating = 1;
  state.dayManagement.customersServed = 5;
  state.dayManagement.actionPointsRemaining = 0;
  state.dayManagement.servedGuestIds = ["herr-bohn"];
  return state;
}

const seatedSprite = () => container.querySelector<HTMLImageElement>(".cafe-pilot-asset--bohn");

function bounds(x: number, y: number, size: number): DOMRect {
  return { x, y, width: size, height: size, top: y, left: x, right: x + size, bottom: y + size, toJSON: () => ({ x, y, size }) };
}

function see(visible: boolean) {
  act(() => observeVisibility(visible));
}

function setDocumentHidden(value: boolean) {
  hidden = value;
  act(() => document.dispatchEvent(new Event("visibilitychange")));
}

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("matchMedia", () => ({ matches: true }));
  hidden = false;
  vi.spyOn(document, "hidden", "get").mockImplementation(() => hidden);
  vi.stubGlobal("IntersectionObserver", class {
    constructor(callback: IntersectionObserverCallback) {
      observeVisibility = (isIntersecting) => callback(
        [{ isIntersecting } as IntersectionObserverEntry],
        this as unknown as IntersectionObserver,
      );
    }
    observe() {}
    disconnect() {}
  });
  saved = new Map();
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("Bohn's appearance", () => {
  it("keeps the same age between waiting and sitting while in view", () => {
    const queued = seatedState();
    queued.dayManagement.customersServed = 5;
    queued.dayManagement.actionPointsRemaining = 1;
    queued.dayManagement.servedGuestIds = [];
    render(queued);
    see(true);
    expect(container.querySelector<HTMLElement>(".cafe-pilot-asset--bohn-standing")?.style.backgroundImage)
      .toContain("bohn-oldest-standing");
    render(seatedState());
    see(true);
    expect(seatedSprite()?.src).toContain("bohn-oldest-seated");
  });

  it("advances once when scroll and a hidden tab overlap, then resumes at a different age after reload", () => {
    const state = seatedState();
    render(state);
    see(true);
    see(false);
    setDocumentHidden(true);
    setDocumentHidden(false);
    see(true);
    expect(seatedSprite()?.src).toContain("bohn-grey-temples-seated");
    act(() => root.unmount());
    root = createRoot(container);
    render(state);
    see(true);
    expect(seatedSprite()?.src).toContain("bohn-silver-seated");
  });

  it("changes after full cover and absence, and keeps the age during partial cover", () => {
    const state = seatedState();
    render(state);
    see(true);
    vi.spyOn(seatedSprite()!, "getBoundingClientRect").mockReturnValue(bounds(20, 20, 50));
    const occluder = document.createElement("div");
    const cover = vi.spyOn(occluder, "getBoundingClientRect").mockReturnValue(bounds(30, 10, 70));
    render(state, occluder);
    see(true);
    expect(seatedSprite()?.src).toContain("bohn-oldest-seated");
    cover.mockReturnValue(bounds(10, 10, 70));
    act(() => window.dispatchEvent(new Event("resize")));
    render(state);
    see(true);
    expect(seatedSprite()?.src).toContain("bohn-grey-temples-seated");
    render(createInitialGameState());
    expect(seatedSprite()).toBeNull();
    render(state);
    see(true);
    expect(seatedSprite()?.src).toContain("bohn-silver-seated");
  });
});
