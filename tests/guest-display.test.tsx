import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { createInitialGameState } from "../src/game/engine/gameState";
import { gameReducer } from "../src/game/engine/reducer";
import { getDioramaGuestVisibility, getGuestForCustomer, getNextGuestPreview } from "../src/game/engine/selectors";
import { CafeScene } from "../src/ui/cafe/CafeScene";
import type { DayNumber, GuestId } from "../src/game/types/content";

function stateFor(day: DayNumber) {
  return { ...createInitialGameState(), day };
}
function serve(state: ReturnType<typeof stateFor>) {
  return gameReducer(state, { type: "serve_product", productId: "filterkaffee" });
}
function render(state: ReturnType<typeof stateFor>) {
  return renderToStaticMarkup(<CafeScene gameState={state} />);
}

describe("engine-driven guest display", () => {
  it("serves and renders only Kemal throughout Day 1, with or without seats", () => {
    for (const seating of [0, 1]) {
      let state = stateFor(1);
      state.equipment.seating = seating;
      for (let served = 0; served <= 2; served++) {
        expect(getGuestForCustomer(state, served)?.id).toBe("pendler-kemal");
        expect(getNextGuestPreview(state)?.name).toBe("Pendler Kemal");
        const markup = render(state);
        expect(markup).toContain('data-guest-id="pendler-kemal"');
        expect(markup).not.toMatch(/cafe-pilot-asset--(?:cem|nele|paula)/);
        expect(Object.values(getDioramaGuestVisibility(state)).every((v) => !v)).toBe(true);
        if (served < 2) state = serve(state);
      }
      expect(state.dayManagement.servedGuestIds).toEqual(["pendler-kemal", "pendler-kemal"]);
    }
  });

  it("matches Day 2 queue, preview and served identities in roster order", () => {
    let state = stateFor(2);
    state.dayManagement.actionPointsRemaining = 20;
    state.supplies = { coffee: 30, milk: 30, pastries: 30 };
    const expected: GuestId[] = ["pendler-kemal", "laptop-lukas", "lieferfahrer-cem", "cappuccino-christa", "herr-bohn", "freelancerin-nele", "pendlerin-fatou", "nachbarin-mira"];
    for (const id of expected) {
      const guest = getGuestForCustomer(state, state.dayManagement.customersServed);
      expect(guest?.id).toBe(id);
      expect(getNextGuestPreview(state)?.name).toBe(guest?.name);
      expect(render(state)).toContain(`data-guest-id="${id}"`);
      if (id === "freelancerin-nele") expect(getDioramaGuestVisibility(state).nele).toBe(false);
      state = serve(state);
      expect(state.dayManagement.servedGuestIds?.[state.dayManagement.customersServed - 1]).toBe(id);
    }
    expect(getDioramaGuestVisibility(state).nele).toBe(true);
    expect(render(state)).not.toContain("cafe-pilot-asset--paula");
  });

  it("does not seat walked-out guests and advances the queue on a walkout", () => {
    let state = stateFor(2);
    // Kemal leaves; Lukas is the next engine customer.
    state.dayManagement.guestsLost = 1;
    expect(render(state)).toContain('data-guest-id="laptop-lukas"');
    state = serve(state);
    expect(state.dayManagement.servedGuestIds).toEqual(["laptop-lukas"]);
    expect(getDioramaGuestVisibility(state).lukas).toBe(true);
    expect(getDioramaGuestVisibility(state).cem).toBe(false);
    expect(render(state)).toContain('data-guest-id="lieferfahrer-cem"');
  });

  it("records both orders in a helper serve", () => {
    const state = stateFor(2);
    state.dayManagement.helperExtraOrdersRemaining = 1;
    const next = serve(state);
    expect(next.dayManagement.servedGuestIds).toEqual(["pendler-kemal", "laptop-lukas"]);
    expect(getDioramaGuestVisibility(next).lukas).toBe(true);
  });

  it("gates even recorded guests by the day roster and their first appearance", () => {
    const state = stateFor(1);
    state.dayManagement.customersServed = 8;
    state.dayManagement.servedGuestIds = ["lieferfahrer-cem", "freelancerin-nele", "pendlerin-fatou", "herr-grau"];
    expect(Object.values(getDioramaGuestVisibility(state)).every((v) => !v)).toBe(true);
  });

  it("handles old saves conservatively without inventing who walked out", () => {
    const state = stateFor(2);
    delete state.dayManagement.servedGuestIds;
    state.dayManagement.customersServed = 3;
    expect(getDioramaGuestVisibility(state).cem).toBe(true);
    state.dayManagement.guestsLost = 1;
    expect(Object.values(getDioramaGuestVisibility(state)).every((v) => !v)).toBe(true);
  });
});

describe("daily guest history compatibility", () => {
  it("retains the recoverable prefix when resuming an older save", () => {
    const state = stateFor(2);
    delete state.dayManagement.servedGuestIds;
    state.dayManagement.customersServed = 2;
    const next = serve(state);
    expect(next.dayManagement.servedGuestIds).toEqual(["pendler-kemal", "laptop-lukas", "lieferfahrer-cem"]);
  });

  it("resets seated identities when opening the next day", () => {
    const base = stateFor(2);
    base.dayManagement.servedGuestIds = ["freelancerin-nele"];
    const next = gameReducer({ ...base, dayPhase: "day_end" }, { type: "confirm_supply_purchase" });
    expect(next.dayManagement.servedGuestIds).toEqual([]);
    expect(getDioramaGuestVisibility(next).nele).toBe(false);
  });
});
