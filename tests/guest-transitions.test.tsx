// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createInitialGameState } from "../src/game/engine/gameState";
import { gameReducer } from "../src/game/engine/reducer";
import type { GameState } from "../src/game/types/game";
import { CafeScene } from "../src/ui/cafe/CafeScene";

let root: Root;
let container: HTMLDivElement;
let frames: Map<number, FrameRequestCallback>;
let reducedMotion: boolean;
let nextFrame: number;
const queue = () => container.querySelector<HTMLElement>("[data-queue-phase]");
const phase = () => queue()?.dataset.queuePhase;
const guest = () => queue()?.dataset.guestId;
function render(state: GameState) {
  act(() => root.render(<CafeScene gameState={state} />));
}
function frame() {
  const callbacks = [...frames.values()];
  frames.clear();
  act(() => callbacks.forEach((callback) => callback(0)));
}
function transition(propertyName: string) {
  act(() => {
    const event = new Event("transitionend", { bubbles: true });
    Object.defineProperty(event, "propertyName", { value: propertyName });
    queue()?.dispatchEvent(event);
  });
}
function arrive() {
  frame(); frame();
  expect(phase()).toBe("walking");
  transition("left");
  expect(phase()).toBe("idle");
}
function exit() {
  expect(phase()).toBe("walking-to-counter");
  transition("bottom");
  expect(phase()).toBe("exiting-east");
  transition("left");
}
function serve(state: GameState) {
  const next = gameReducer(state, { type: "serve_product", productId: "filterkaffee" });
  render(next);
  return next;
}
beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  reducedMotion = false;
  frames = new Map(); nextFrame = 0;
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    frames.set(++nextFrame, callback); return nextFrame;
  });
  vi.stubGlobal("cancelAnimationFrame", (id: number) => frames.delete(id));
  vi.stubGlobal("matchMedia", () => ({ matches: reducedMotion }));
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});

describe("guest entrance, departure and seat handover", () => {
  it("restarts Kemal's entrance after the first Day 1 order", () => {
    const state = createInitialGameState();
    render(state); arrive();
    serve(state);
    expect(guest()).toBe("pendler-kemal");
    exit(); arrive();
    expect(guest()).toBe("pendler-kemal");
    expect(container.querySelector(".placeholder-guest-seated")).toBeNull();
    expect(container.querySelector(".cafe-pilot-asset--cem-standing")).toBeNull();
  });

  it("preserves the outgoing identity, then seats Lukas after his exit", () => {
    let state: GameState = { ...createInitialGameState(), day: 2 };
    render(state); arrive();
    state = serve(state);
    expect(guest()).toBe("pendler-kemal");
    expect(container.querySelector(".cafe-guest-thought-bubble")).toBeNull();
    exit(); arrive();
    expect(guest()).toBe("laptop-lukas");
    serve(state);
    expect(guest()).toBe("laptop-lukas");
    expect(container.querySelector(".cafe-pilot-asset--lukas")).toBeNull();
    exit();
    expect(guest()).toBe("lieferfahrer-cem");
    expect(container.querySelector(".placeholder-guest-seated .cafe-pilot-asset--lukas")).not.toBeNull();
    arrive();
    expect(container.querySelector(".cafe-guest-thought-bubble")).not.toBeNull();
  });

  it("advances immediately with reduced motion and avoids standing/seated duplicates", () => {
    reducedMotion = true;
    let state: GameState = { ...createInitialGameState(), day: 2 };
    render(state);
    expect(phase()).toBe("idle");
    state = serve(state);
    expect(guest()).toBe("laptop-lukas");
    expect(phase()).toBe("idle");
    state = serve(state);
    expect(guest()).toBe("lieferfahrer-cem");
    expect(container.querySelector(".placeholder-guest-seated .cafe-pilot-asset--lukas")).not.toBeNull();
    state.dayManagement.guestsLost = 7; // queue cycles back to a previously served Lukas
    render({ ...state });
    expect(guest()).toBe("laptop-lukas");
    expect(container.querySelector(".cafe-pilot-asset--lukas")).toBeNull();
    expect(frames.size).toBe(0);
  });

  it("replaces a walked-out guest and resets on the next day", () => {
    const state = createInitialGameState();
    render({ ...state, day: 2 }); arrive();
    render({ ...state, day: 2, dayManagement: { ...state.dayManagement, guestsLost: 1 } });
    expect(guest()).toBe("laptop-lukas");
    arrive();
    render({ ...state, day: 3 });
    expect(guest()).toBe("pendler-kemal");
    expect(phase()).toBe("at-door");
  });

  it("does not leave a stale sprite after rapid serves during entrance or exit", () => {
    let state: GameState = { ...createInitialGameState(), day: 2 };
    state.dayManagement.actionPointsRemaining = 10;
    render(state);
    frame(); frame(); // still walking in
    state = serve(state);
    expect(guest()).toBe("laptop-lukas");
    arrive();
    state = serve(state);
    expect(phase()).toBe("walking-to-counter");
    serve(state); // another order before the prior exit finishes
    expect(guest()).toBe("cappuccino-christa");
    arrive();
  });

  it("finishes the final customer's exit when no actions remain", () => {
    let state = createInitialGameState();
    state.dayManagement.actionPointsRemaining = 1;
    render(state); arrive();
    state = serve(state);
    expect(state.dayManagement.actionPointsRemaining).toBe(0);
    exit();
    expect(queue()).toBeNull();
    expect(frames.size).toBe(0);
  });
});
