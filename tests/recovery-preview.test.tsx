import { canImproveRecoveryByCleaning, getNextGuestPreview } from "../src/game/engine/selectors";
import { gameReducer } from "../src/game/engine/reducer";
import { createHelperAssignment } from "../src/game/engine/management";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { createInitialGameState } from "../src/game/engine/gameState";
import { GuestService } from "../src/ui/cafe/GuestService";

function stateForLukas() {
  const state = createInitialGameState();
  state.day = 2;
  state.dayPhase = "open";
  state.equipment.seating = 1;
  state.resources.cleanliness = 80;
  state.dayManagement.customersServed = 2;
  state.dayManagement.actionPointsRemaining = 2;
  return state;
}
function service(state: ReturnType<typeof stateForLukas>) {
  return renderToStaticMarkup(<GuestService gameState={state} onServeProduct={() => {}} />);
}

describe("successful-service recovery forecast", () => {
  it("marks two forecast hearts for a clear seat, one for a dirty seat, and preserves the present heart", () => {
    const state = stateForLukas();
    const clean = service(state);
    expect(clean).toContain('Recovery with a served order: 1 to 3 hearts');
    expect(clean.match(/data-forecast="true"/g)).toHaveLength(2);
    expect(clean.match(/data-filled="true"/g)).toHaveLength(1);
    state.dayManagement.dirtyTableIds = ["left"];
    const dirty = service(state);
    expect(dirty).toContain('Recovery with a served order: 1 to 2 hearts');
    expect(dirty.match(/data-forecast="true"/g)).toHaveLength(1);
    expect(dirty.match(/data-filled="true"/g)).toHaveLength(1);
  });

  it("does not advertise healing without stock", () => {
    const state = stateForLukas();
    state.supplies = { coffee: 0, milk: 0, pastries: 0 };
    expect(service(state)).not.toContain('cafe-recovery-hearts');
  });

  it("does not introduce hero hearts on Day 1", () => {
    const state = stateForLukas();
    state.day = 1;
    expect(service(state)).not.toContain('cafe-recovery-hearts');
  });
});

// The cleaning cue must be actionable, not merely describe a theoretical bonus.
describe("actionable recovery cleaning", () => {
  it.each([
    [1, 100, 80, false],
    [2, 25, 80, false],
    [2, 100, 37, false],
    [2, 100, 38, true],
    [2, 100, 80, true]
  ])("with %i actions, %i patience and %i cleanliness: %s", (actions, patience, cleanliness, expected) => {
    const state = stateForLukas();
    state.day = 4;
    state.dayManagement.actionPointsRemaining = actions;
    state.dayManagement.currentGuestPatience = patience;
    state.dayManagement.currentGuestPatienceMax = 100;
    state.dayManagement.dirtyTableIds = ["left"];
    state.resources.cleanliness = cleanliness;
    expect(canImproveRecoveryByCleaning(state, "left")).toBe(expected);
    expect(service(state).includes("Clean café and clear table")).toBe(expected);
    if (expected) {
      const cleaned = gameReducer(state, { type: "clean_table", tableId: "left" });
      expect(getNextGuestPreview(cleaned)?.name).toBe(getNextGuestPreview(state)?.name);
      const served = gameReducer(cleaned, { type: "serve_product", productId: "filterkaffee" });
      expect(served.dayManagement.heartsRestored).toBe(2);
    }
  });

  it("does not advertise a clean or unrelated table, or healing without stock", () => {
    const state = stateForLukas();
    expect(canImproveRecoveryByCleaning(state, "left")).toBe(false);
    state.dayManagement.dirtyTableIds = ["left", "right"];
    expect(canImproveRecoveryByCleaning(state, "right")).toBe(false);
    state.supplies = { coffee: 0, milk: 0, pastries: 0 };
    expect(canImproveRecoveryByCleaning(state, "left")).toBe(false);
  });

  it("allows Jana's free wipe with one action and critical patience, but only if it earns the bonus", () => {
    const state = stateForLukas();
    state.day = 5;
    state.helperAssignment = createHelperAssignment("jana", "cleaning", 5);
    state.dayManagement.actionPointsRemaining = 1;
    state.dayManagement.currentGuestPatience = 25;
    state.dayManagement.currentGuestPatienceMax = 100;
    state.dayManagement.dirtyTableIds = ["left"];
    state.resources.cleanliness = 48;
    expect(canImproveRecoveryByCleaning(state, "left")).toBe(false);
    state.resources.cleanliness = 49;
    expect(canImproveRecoveryByCleaning(state, "left")).toBe(true);
    const cleaned = gameReducer(state, { type: "clean_table", tableId: "left" });
    expect(cleaned.dayManagement.actionPointsRemaining).toBe(1);
    expect(cleaned.dayManagement.currentGuestPatience).toBe(25);
    const served = gameReducer(cleaned, { type: "serve_product", productId: "filterkaffee" });
    expect(served.dayManagement.heartsRestored).toBe(2);
  });
});
