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
  it("renders the two required Day 1 guests and then optional Fatou", () => {
    const expected: GuestId[] = ["pendler-kemal", "pendlerin-paula", "pendlerin-fatou"];
    for (const seating of [0, 1]) {
      let state = stateFor(1);
      state.equipment.seating = seating;
      for (let served = 0; served <= 2; served++) {
        const guest = getGuestForCustomer(state, served);
        expect(guest?.id).toBe(expected[served]);
        expect(getNextGuestPreview(state)?.name).toBe(guest?.name);
        const markup = render(state);
        expect(markup).toContain(`data-guest-id="${expected[served]}"`);
        expect(markup).not.toMatch(/cafe-pilot-asset--(?:cem|nele)/);
        expect(Object.values(getDioramaGuestVisibility(state)).every((v) => !v)).toBe(true);
        if (served < 2) state = serve(state);
      }
      expect(state.dayManagement.servedGuestIds).toEqual(expected.slice(0, 2));
    }
  });

  it("matches Day 2 queue, preview and served identities in roster order", () => {
    let state = stateFor(2);
    state.dayManagement.actionPointsRemaining = 20;
    state.supplies = { coffee: 30, milk: 30, pastries: 30 };
    const expected: GuestId[] = ["pendler-kemal", "pendlerin-paula", "laptop-lukas", "lieferfahrer-cem", "cappuccino-christa", "herr-bohn", "pendlerin-fatou", "nachbarin-mira"];
    for (const id of expected) {
      const guest = getGuestForCustomer(state, state.dayManagement.customersServed);
      expect(guest?.id).toBe(id);
      expect(getNextGuestPreview(state)?.name).toBe(guest?.name);
      expect(render(state)).toContain(`data-guest-id="${id}"`);
      state = serve(state);
      expect(state.dayManagement.servedGuestIds?.[state.dayManagement.customersServed - 1]).toBe(id);
    }
    expect(getDioramaGuestVisibility(state).nele).toBe(false);
  });

  it("does not seat walked-out guests and advances the queue on a walkout", () => {
    let state = stateFor(2);
    // Kemal and Paula leave; Lukas is the next engine customer.
    state.dayManagement.guestsLost = 2;
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
    expect(next.dayManagement.servedGuestIds).toEqual(["pendler-kemal", "pendlerin-paula"]);
    expect(getDioramaGuestVisibility(next).lukas).toBe(false);
  });

  it("gates even recorded guests by the day roster and their first appearance", () => {
    const state = stateFor(1);
    state.dayManagement.customersServed = 8;
    state.dayManagement.servedGuestIds = ["lieferfahrer-cem", "freelancerin-nele", "pendlerin-fatou", "herr-grau"];
    expect(getDioramaGuestVisibility(state)).toMatchObject({ cem: false, nele: false, fatou: true, strange: false });
  });

  it("handles old saves conservatively without inventing who walked out", () => {
    const state = stateFor(2);
    delete state.dayManagement.servedGuestIds;
    state.dayManagement.customersServed = 3;
    expect(getDioramaGuestVisibility(state).lukas).toBe(true);
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
    expect(next.dayManagement.servedGuestIds).toEqual(["pendler-kemal", "pendlerin-paula", "laptop-lukas"]);
  });

  it("resets seated identities when opening the next day", () => {
    const base = stateFor(2);
    base.dayManagement.servedGuestIds = ["freelancerin-nele"];
    const next = gameReducer({ ...base, dayPhase: "day_end" }, { type: "confirm_supply_purchase" });
    expect(next.dayManagement.servedGuestIds).toEqual([]);
    expect(getDioramaGuestVisibility(next).nele).toBe(false);
  });
});
