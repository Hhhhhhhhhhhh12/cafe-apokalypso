import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { createInitialGameState } from "../src/game/engine/gameState";
import { createInitialDayManagement } from "../src/game/engine/management";
import { gameReducer } from "../src/game/engine/reducer";
import { loadGameState, saveGameState, type StorageLike } from "../src/game/engine/save";
import { getTriggeredEvents, hasSecondBrewGroup } from "../src/game/engine/selectors";
import type { GameState } from "../src/game/types/game";
import { GuestService } from "../src/ui/cafe/GuestService";
import { Noticeboard } from "../src/ui/cafe/ShiftStations";

const install = { type: "install_second_brew_group" } as const;
const double = { type: "serve_double_espresso" } as const;
const single = { type: "serve_product", productId: "espresso" } as const;
const discovery = "day-4-second-brew-group";

function openDayFour(): GameState {
  const state = createInitialGameState();
  return gameReducer({
    ...state,
    day: 4,
    dayPhase: "day_start",
    dayManagement: createInitialDayManagement(state.resources.reputation, 4),
    unlocks: { ...state.unlocks, advertising: true, staff: true, pricing: true }
  }, { type: "open_day" });
}

function reload(state: GameState): GameState {
  const items = new Map<string, string>();
  const storage: StorageLike = {
    getItem: (key) => items.get(key) ?? null,
    setItem: (key, value) => { items.set(key, value); },
    removeItem: (key) => { items.delete(key); }
  };
  expect(saveGameState(state, storage).ok).toBe(true);
  return loadGameState(storage);
}

describe("Day 4 second brew group", () => {
  it("only fits during an open shift from Day 4 onward and records the discovery once for free", () => {
    const state = openDayFour();
    for (const unavailable of [{ ...state, day: 3 as const }, { ...state, dayPhase: "day_start" as const }]) {
      expect(hasSecondBrewGroup(gameReducer(unavailable, install))).toBe(false);
    }

    const oldSave = reload(state);
    expect(hasSecondBrewGroup(oldSave)).toBe(false);
    const fitted = reload(gameReducer(oldSave, install));
    expect(fitted.resources).toEqual(state.resources);
    expect(fitted.dayManagement.actionPointsRemaining).toBe(5);
    expect(getTriggeredEvents(fitted).filter(event => event.id === discovery)).toHaveLength(1);
    expect(gameReducer(fitted, install).eventHistory.filter(id => id === discovery)).toHaveLength(1);
  });

  it("serves two actual guests for one action and preserves Jana's separate extra order", () => {
    const fitted = gameReducer(openDayFour(), install);
    const singles = gameReducer(gameReducer(fitted, single), single);
    const withJana = {
      ...fitted,
      dayManagement: { ...fitted.dayManagement, helperExtraOrdersRemaining: 1 }
    };
    const served = reload(gameReducer(withJana, double));
    expect(served.dayManagement.actionPointsRemaining).toBe(4);
    expect(served.dayManagement.customersServed).toBe(2);
    expect(served.dayManagement.servedGuestIds).toEqual(singles.dayManagement.servedGuestIds);
    expect(served.guestMemory).toEqual(singles.guestMemory);
    expect(served.resources).toEqual(singles.resources);
    expect(served.supplies.coffee).toBe(fitted.supplies.coffee - 2);
    expect(served.dayManagement.helperExtraOrdersRemaining).toBe(1);
    expect(gameReducer(served, double).dayManagement).toEqual(served.dayManagement);

    const closed = gameReducer(served, { type: "complete_day" });
    const morning = gameReducer(closed, { type: "confirm_supply_purchase", withoutRestocking: true });
    expect(morning.dayManagement.doubleEspressoServed).toBe(true);
    const next = gameReducer(morning, { type: "open_day" });
    expect(next.day).toBe(5);
    expect(hasSecondBrewGroup(next)).toBe(true);
    expect(next.dayManagement.doubleEspressoServed).toBe(false);
    expect(next.pendingEvents).not.toContain(discovery);
  });

  it("blocks a batch atomically if it lacks beans and displays the reason", () => {
    const fitted = gameReducer(openDayFour(), install);
    const low = { ...fitted, supplies: { ...fitted.supplies, coffee: 1 } };
    const attempted = gameReducer(low, double);
    expect(attempted.supplies).toEqual(low.supplies);
    expect(attempted.dayManagement).toEqual(low.dayManagement);
    const render = (state: GameState) => renderToStaticMarkup(
      <GuestService gameState={state} onServeProduct={() => {}} onServeDoubleEspresso={() => {}} />
    );
    expect(render(openDayFour())).not.toContain("Two espressos");
    expect(render(low)).toContain("Needs 2 coffee beans in stock.");
    expect(render(gameReducer(fitted, double))).toContain("Already used this shift.");
  });

  it("keeps the flyer goal achievable with both serving paths", () => {
    for (const expand of [false, true]) {
      const state = openDayFour();
      const served = expand
        ? gameReducer(gameReducer(state, install), double)
        : gameReducer(gameReducer(state, single), single);
      const advertised = gameReducer(served, { type: "run_advertising", adType: "flyer" });
      expect(advertised.resources.money).toBeCloseTo(served.resources.money - 2);
      expect(advertised.resources.reputation).toBe(served.resources.reputation + 2);
      expect(advertised.resources.stress).toBe(served.resources.stress);
      expect(gameReducer(advertised, { type: "complete_day" }).daySummary?.objectiveCompleted).toBe(true);
    }
  });

  it("warns on the flyer itself when it can cost the waiting guest", () => {
    const state = openDayFour();
    state.dayManagement.currentGuestPatience = 25;
    const render = () => renderToStaticMarkup(<Noticeboard gameState={state} onAction={() => {}} />);
    expect(render()).toContain("Posting the flyer now will make the waiting guest leave.");
    expect(render()).not.toContain("+2 stress");
    state.dayManagement.extraAdvertisingActions = 1;
    expect(render()).not.toContain("Posting the flyer now will make the waiting guest leave.");
  });
});
