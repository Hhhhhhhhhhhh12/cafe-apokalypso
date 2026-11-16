// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { RecoveryFeedback } from "../src/ui/cafe/RecoveryFeedback";

let root: Root;
let container: HTMLDivElement;
function show(day: number, total: number) {
  act(() => root.render(<RecoveryFeedback day={day} total={total} />));
}
beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  container = document.createElement("div");
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

it("does not replay saved hearts and shows only the newly earned amount", () => {
  show(2, 2);
  expect(container.textContent).toBe("");
  show(2, 3);
  expect(container.textContent).toContain("1 heart restored");
  expect(container.textContent).not.toContain("3 hearts");
  act(() => vi.advanceTimersByTime(2800));
  expect(container.textContent).toBe("");
});

it("uses the actual combined reward and renews its timer on consecutive service", () => {
  show(4, 0);
  show(4, 4);
  expect(container.textContent).toContain("4 hearts restored");
  act(() => vi.advanceTimersByTime(2000));
  show(4, 5);
  act(() => vi.advanceTimersByTime(1000));
  expect(container.textContent).toContain("1 heart restored");
  act(() => vi.advanceTimersByTime(1800));
  expect(container.textContent).toBe("");
});

it("clears a reward across day changes and never rewards reset or Day 1", () => {
  show(2, 0);
  show(2, 2);
  show(3, 0);
  expect(container.textContent).toBe("");
  show(3, 1);
  show(3, 0);
  expect(container.textContent).toBe("");
  show(1, 0);
  show(1, 2);
  expect(container.textContent).toBe("");
});
