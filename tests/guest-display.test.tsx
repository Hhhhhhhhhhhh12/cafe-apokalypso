import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { createInitialGameState } from "../src/game/engine/gameState";
import { gameReducer } from "../src/game/engine/reducer";
import { getDioramaGuestVisibility, getGuestForCustomer, getNextGuestPreview } from "../src/game/engine/selectors";
import { CafeScene } from "../src/ui/cafe/CafeScene";
import { CafePlaceholder } from "../src/ui/cafe/CafePlaceholder";
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
  it("keeps the closed-shift letter free of live recovery feedback", () => {
    const state = stateFor(7);
    state.dayPhase = "day_end";
    state.dayManagement.heartsRestored = 3;
    const markup = renderToStaticMarkup(<CafePlaceholder gameState={state} />);
    expect(markup).not.toContain('class="cafe-recovery-feedback"');
    state.dayPhase = "open";
    expect(renderToStaticMarkup(<CafePlaceholder gameState={state} />)).toContain('class="cafe-recovery-feedback"');
  });
  it.each([1, 2, 3, 4, 5, 6, 7] as DayNumber[])("uses the approved compact room on day %i", (day) => {
    const markup = renderToStaticMarkup(<CafePlaceholder gameState={stateFor(day)} />);
    expect(markup).toContain("placeholder-cafe-background-v12-isometric-day1-windows.png");
    expect(markup).toContain("cafe-diorama--compact-week");
    expect(markup).not.toContain("background-v07");
  });
  it("preserves each approved guest on their fixed chair", () => {
    const state = stateFor(2);
    state.dayPhase = "day_end";
    state.equipment.seating = 1;
    state.dayManagement.customersServed = 4;
    state.dayManagement.servedGuestIds = ["laptop-lukas", "pendler-kemal", "pendlerin-fatou", "cappuccino-christa"];
    const markup = renderToStaticMarkup(<CafePlaceholder gameState={state} />);
    expect(markup).toContain('data-seat="right-front" data-service-table="right"');
    expect(markup).toContain('data-seat="back-front" data-service-table="back"');
    expect(markup).toContain('data-seat="left-front" data-service-table="left"');
    expect(markup).toContain("placeholder-guest-christa-seated-v04-outfit-review.png");
    expect(markup).not.toContain("placeholder-guest-christa-seated.png");
    state.equipment.seating = 0;
    expect(renderToStaticMarkup(<CafePlaceholder gameState={state} />)).not.toContain('data-seated-guest=');
  });

  it("marks only the actual clean recovery table and hides the bonus when unavailable", () => {
    const state = stateFor(2);
    state.dayPhase = "open";
    state.equipment.seating = 1;
    state.resources.cleanliness = 80;
    state.dayManagement.customersServed = 2;
    state.dayManagement.actionPointsRemaining = 3;
    state.dayManagement.dirtyTableIds = [];
    const live = () => renderToStaticMarkup(<CafePlaceholder gameState={state} />);
    expect(live()).toContain('data-recovery-table="left"');
    expect(live()).not.toContain('data-recovery-table="back"');
    state.dayManagement.dirtyTableIds = ["left"];
    expect(live()).not.toContain('data-recovery-table=');
    state.dayManagement.dirtyTableIds = [];
    state.resources.cleanliness = 49;
    expect(live()).not.toContain('data-recovery-table=');
    state.resources.cleanliness = 80;
    state.dayPhase = "day_end";
    expect(live()).not.toContain('data-recovery-table=');
  });

  it("shows only served characters as seated in the live café", () => {
    const base = stateFor(1);
    base.equipment.seating = 1;
    const live = (state: ReturnType<typeof stateFor>) =>
      renderToStaticMarkup(<CafePlaceholder gameState={state} />);
    const firstServe = serve(base);
    const active = live(firstServe);
    expect(active).not.toContain('data-guest="fatou"');
    expect(active).not.toContain('data-guest="cem"');
    expect(active).not.toContain("placeholder-guest-normal-02");
    expect(live(serve(serve(firstServe)))).toContain('data-guest="fatou"');
    expect(live({ ...firstServe, dayPhase: "day_end" })).not.toContain('data-guest-id=');
  });

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
    const expected: GuestId[] = ["pendler-kemal", "freelancerin-nele", "laptop-lukas", "lieferfahrer-cem", "cappuccino-christa", "herr-bohn", "pendlerin-fatou", "nachbarin-mira"];
    for (const id of expected) {
      const guest = getGuestForCustomer(state, state.dayManagement.customersServed);
      expect(guest?.id).toBe(id);
      expect(getNextGuestPreview(state)?.name).toBe(guest?.name);
      expect(render(state)).toContain(`data-guest-id="${id}"`);
      state = serve(state);
      expect(state.dayManagement.servedGuestIds?.[state.dayManagement.customersServed - 1]).toBe(id);
    }
    expect(getDioramaGuestVisibility(state).nele).toBe(true);
  });

  it("does not seat walked-out guests and advances the queue on a walkout", () => {
    let state = stateFor(2);
    // Kemal and Nele leave; Lukas is the next engine customer.
    state.dayManagement.guestsLost = 2;
    expect(render(state)).toContain('data-guest-id="laptop-lukas"');
    state = serve(state);
    expect(state.dayManagement.servedGuestIds).toEqual(["laptop-lukas"]);
    expect(getDioramaGuestVisibility(state).lukas).toBe(true);
    expect(getDioramaGuestVisibility(state).cem).toBe(false);
    expect(render(state)).toContain('data-guest-id="lieferfahrer-cem"');
    expect(renderToStaticMarkup(<CafePlaceholder gameState={state} />)).toContain('data-service-table="left"');
  });

  it("seats the third served hero at the same left table used for recovery", () => {
    const state = stateFor(2);
    state.equipment.seating = 1;
    state.dayManagement.customersServed = 3;
    state.dayManagement.servedGuestIds = ["pendler-kemal", "pendlerin-paula", "laptop-lukas"];
    expect(renderToStaticMarkup(<CafePlaceholder gameState={state} />)).toContain('data-seat="left-front" data-service-table="left"');
  });

  it("records both orders in a helper serve", () => {
    const state = stateFor(2);
    state.dayManagement.helperExtraOrdersRemaining = 1;
    const next = serve(state);
    expect(next.dayManagement.servedGuestIds).toEqual(["pendler-kemal", "freelancerin-nele"]);
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
    expect(next.dayManagement.servedGuestIds).toEqual(["pendler-kemal", "freelancerin-nele", "laptop-lukas"]);
  });

  it("resets seated identities when opening the next day", () => {
    const base = stateFor(2);
    base.dayManagement.servedGuestIds = ["freelancerin-nele"];
    const next = gameReducer({ ...base, dayPhase: "day_end" }, { type: "confirm_supply_purchase" });
    expect(next.dayManagement.servedGuestIds).toEqual([]);
    expect(getDioramaGuestVisibility(next).nele).toBe(false);
  });
});
