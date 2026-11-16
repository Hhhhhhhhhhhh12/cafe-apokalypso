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
