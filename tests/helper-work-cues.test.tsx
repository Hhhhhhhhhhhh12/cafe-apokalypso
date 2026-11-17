// @vitest-environment jsdom
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { createInitialGameState } from "../src/game/engine/gameState";
import { createHelperAssignment } from "../src/game/engine/management";
import { CafeShiftHelper } from "../src/ui/cafe/CafeShiftHelper";
import type { StaffOptionId } from "../src/game/types/content";
import type { HelperTaskId } from "../src/game/types/game";

function fixture(helper: StaffOptionId, task: HelperTaskId) {
  const state = createInitialGameState();
  state.day = 5;
  state.dayPhase = "open";
  state.helperAssignment = { ...createHelperAssignment(helper, task, 5)!, locked: true };
  state.dayManagement.dayFiveHelperImpact = {
    openingStressReduction: 0, extraOrders: 0, cleanlinessRestored: 0,
    reputationGained: 0, milkSaved: 0,
  };
  return state;
}
function show(state: ReturnType<typeof fixture>) {
  const container = document.createElement("div");
  container.innerHTML = renderToStaticMarkup(<CafeShiftHelper gameState={state} />);
  return container;
}

describe("compact helper contribution cues", () => {
  it("shows actual cleaning progress, without the long visible sentence", () => {
    const state = fixture("jana", "cleaning");
    state.dayManagement.helperAutonomousActions = 2;
    const dom = show(state);
    expect(dom.querySelector('[data-icon="broom"][data-phase="done"]')?.textContent).toBe("2✓");
    expect(dom.querySelector(".cafe-shift-helper__cues")?.textContent).not.toContain("tables");
    expect(dom.querySelector('button')?.getAttribute("aria-label")).toContain("2 tables cleared");
  });

  it("distinguishes ready extra orders from completed service at the same time", () => {
    const state = fixture("jana", "service");
    state.dayManagement.helperExtraOrdersRemaining = 1;
    state.dayManagement.dayFiveHelperImpact!.extraOrders = 2;
    const dom = show(state);
    expect(dom.querySelector('[data-icon="cup"][data-phase="done"]')?.textContent).toBe("2✓");
    expect(dom.querySelector('[data-icon="cup"][data-phase="ready"]')?.textContent).toBe("1");
    expect(dom.querySelector('button')?.getAttribute("aria-label")).toContain("ready if stock allows");
  });

  it("retains Nino's earned reputation and milk savings after his bonus is exhausted", () => {
    const state = fixture("nino", "barista");
    state.dayManagement.baristaReputationBonus = 3;
    state.dayManagement.dayFiveHelperImpact!.reputationGained = 3;
    state.dayManagement.dayFiveHelperImpact!.milkSaved = 2;
    const dom = show(state);
    expect(dom.querySelector('[data-icon="star"][data-phase="done"]')?.textContent).toBe("+3✓");
    expect(dom.querySelector('[data-icon="milk"][data-phase="done"]')?.textContent).toBe("2✓");
    expect(dom.querySelector('[data-phase="ready"]')).toBeNull();
  });

  it("keeps Nele's marketing extra order visible beside her flyer", () => {
    const state = fixture("nele", "marketing");
    state.dayManagement.extraAdvertisingActions = 1;
    state.dayManagement.helperExtraOrdersRemaining = 1;
    const dom = show(state);
    expect(dom.querySelector('[data-icon="flyer"][data-phase="ready"]')?.textContent).toBe("0 AP");
    expect(dom.querySelector('[data-icon="cup"][data-phase="ready"]')).not.toBeNull();
    state.dayManagement.extraAdvertisingActions = 0;
    state.dayManagement.advertisingRun = true;
    expect(show(state).querySelector('[data-icon="flyer"][data-phase="done"]')?.textContent).toBe("✓");
  });

  it("keeps counter stress reduction separate and preserves unknown old-save results", () => {
    const state = fixture("nele", "counter");
    state.dayManagement.dayFiveHelperImpact!.openingStressReduction = 10;
    expect(show(state).querySelector('[data-icon="calm"][data-phase="done"]')?.textContent).toBe("−10✓");
    delete state.dayManagement.dayFiveHelperImpact;
    const dom = show(state);
    expect(dom.querySelector('[data-phase="done"]')).toBeNull();
    expect(dom.querySelector('button')?.getAttribute("aria-label")).toContain("not recorded");
    expect(dom.querySelector('button')?.getAttribute("aria-expanded")).toBe("false");
  });
});
