import { describe, expect, it } from "vitest";
import { createInitialGameState } from "../src/game/engine/gameState";
import { gameReducer } from "../src/game/engine/reducer";
import { getGuestForCustomer } from "../src/game/engine/selectors";
import type { DayNumber } from "../src/game/types/content";
import type { GameState } from "../src/game/types/game";

/** Find a (day, customerIndex) where the given guest is the one at the counter. */
function locateGuest(guestId: string, fromDay: DayNumber): { day: DayNumber; index: number } {
  for (let day = fromDay; day <= 7; day += 1) {
    for (let index = 0; index < 9; index += 1) {
      const probe: GameState = { ...createInitialGameState(), day: day as DayNumber };
      if (getGuestForCustomer(probe, index)?.id === guestId) {
        return { day: day as DayNumber, index };
      }
    }
  }
  throw new Error(`guest ${guestId} not found from day ${fromDay}`);
}

function openStateAt(day: DayNumber, customersServed: number): GameState {
  const base = createInitialGameState();
  return {
    ...base,
    day,
    dayPhase: "open",
    supplies: { coffee: 200, milk: 200, pastries: 200 },
    dayManagement: {
      ...base.dayManagement,
      actionPointsRemaining: 10,
      customersServed
    }
  };
}

describe("coffee variety mild-waste (#56)", () => {
  it("flags a wasted premium when a simple-taste guest is over-served", () => {
    // Pendler Kemal prefers filter coffee (tier 1). Pouring him the premium
    // pour-over (tier 3) is over-serving: no reputation, but a waste line.
    const { day, index } = locateGuest("pendler-kemal", 4);
    const base = openStateAt(day, index);

    const overServed = gameReducer(base, {
      type: "serve_product",
      productId: "handfilter"
    });

    expect(overServed.resources.reputation).toBe(base.resources.reputation);
    expect(overServed.statusMessage.toLowerCase()).toContain("without ceremony");
    expect(overServed.statusMessage.toLowerCase()).toContain("pour-over special");
    expect(overServed.statusMessage.toLowerCase()).toContain("filter coffee");
  });

  it("does not flag waste when the same guest gets their simple preference", () => {
    const { day, index } = locateGuest("pendler-kemal", 4);
    const base = openStateAt(day, index);

    const matched = gameReducer(base, {
      type: "serve_product",
      productId: "filterkaffee"
    });

    expect(matched.statusMessage.toLowerCase()).not.toContain("without ceremony");
  });

  it("does not flag waste when an appreciator gets their valued premium", () => {
    // Cappuccino-Christa values the cappuccino (tier 3) — that is a delight,
    // never a waste, even though it is a premium drink.
    const { day, index } = locateGuest("cappuccino-christa", 2);
    const base = openStateAt(day, index);

    const delighted = gameReducer(base, {
      type: "serve_product",
      productId: "cappuccino"
    });

    expect(delighted.resources.reputation).toBeGreaterThan(base.resources.reputation);
    expect(delighted.statusMessage.toLowerCase()).not.toContain("without ceremony");
  });

  it("does not flag waste when a picky guest is served a different same-tier premium", () => {
    // Christa wants a cappuccino (tier 3); a pour-over (tier 3) is a letdown,
    // not an over-serve — both are premium, so nothing is "wasted" downward.
    const { day, index } = locateGuest("cappuccino-christa", 2);
    const base = openStateAt(day, index);

    const letdown = gameReducer(base, {
      type: "serve_product",
      productId: "handfilter"
    });

    expect(letdown.statusMessage.toLowerCase()).not.toContain("without ceremony");
  });
});
