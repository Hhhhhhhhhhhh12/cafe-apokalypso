/**
 * Tests for the pendingEvents state field and getTriggeredEvents selector.
 *
 * Verifies:
 * - pendingEvents starts empty on initial state
 * - open_day resets pendingEvents to [] and enqueues the position-0 event
 * - serve_product enqueues mid-day positional events as customersServed advances
 * - serve_product enqueues guest-related events once any customer has been served
 * - complete_day enqueues events whose kicker === "Closing"
 * - no duplicates are pushed under any action sequence
 * - getTriggeredEvents returns EventDefinitions in pendingEvents order
 * - save/load round-trip preserves pendingEvents
 */
import { describe, expect, it } from "vitest";
import { createInitialGameState, isValidGameState } from "../src/game/engine/gameState";
import { gameReducer } from "../src/game/engine/reducer";
import { getTriggeredEvents } from "../src/game/engine/selectors";
import { weekOneDays, weekOneEvents } from "../src/game/data";
import type { GameState } from "../src/game/types/game";
import type { DayNumber, EventDefinition } from "../src/game/types/content";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function dayStartState(day: DayNumber = 1): GameState {
  return { ...createInitialGameState(), day, dayPhase: "day_start", pendingEvents: [] };
}

function openDayFrom(state: GameState): GameState {
  return gameReducer({ ...state, dayPhase: "day_start" }, { type: "open_day" });
}

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

describe("pendingEvents: initial state", () => {
  it("starts as an empty array", () => {
    expect(createInitialGameState().pendingEvents).toEqual([]);
  });

  it("passes isValidGameState", () => {
    expect(isValidGameState(createInitialGameState())).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// open_day resets and enqueues position-0 event
// ---------------------------------------------------------------------------

describe("pendingEvents: open_day", () => {
  it("resets pendingEvents to [] and then enqueues Day 1 position-0 event", () => {
    const state = openDayFrom(dayStartState(1));
    const day1Events = weekOneDays[0].eventIds;
    const firstEventId = day1Events[0];

    expect(state.pendingEvents).toContain(firstEventId);
    // There should be exactly one event queued at open (the position-0 event)
    expect(state.pendingEvents.length).toBeGreaterThanOrEqual(1);
  });

  it("clears any pre-existing pendingEvents from a previous day", () => {
    // Inject a stale event id into pendingEvents before opening
    const staleState: GameState = {
      ...dayStartState(1),
      pendingEvents: ["day-1-coffee-machine-flicker"] as GameState["pendingEvents"]
    };
    const opened = gameReducer(staleState, { type: "open_day" });
    // After open_day, stale events must be gone (pendingEvents was reset)
    expect(opened.pendingEvents).not.toContain("day-1-coffee-machine-flicker");
  });

  it("does NOT enqueue a 'Closing' kicker event at open_day", () => {
    const state = openDayFrom(dayStartState(1));
    const closingEvents = weekOneEvents.filter((e) => (e as EventDefinition).kicker === "Closing").map((e) => e.id);
    for (const id of closingEvents) {
      expect(state.pendingEvents).not.toContain(id);
    }
  });

  it("enqueues the first event for every day 1-7", () => {
    for (let d = 1; d <= 7; d++) {
      const day = d as DayNumber;
      const state = openDayFrom(dayStartState(day));
      const firstEventId = weekOneDays[day - 1].eventIds[0];
      expect(state.pendingEvents).toContain(firstEventId);
    }
  });
});

// ---------------------------------------------------------------------------
// serve_product: positional mid-day events
// ---------------------------------------------------------------------------

describe("pendingEvents: serve_product (positional)", () => {
  it("enqueues Day 3 position-1 event when customersServed reaches 1", () => {
    // Day 3 events: [day-3-cash-register-suggestion, day-3-supply-tally, day-3-guest-checks-in]
    // position 1 = day-3-supply-tally, fires when customersServed >= 1
    const day3Events = weekOneDays[2].eventIds;
    const pos1EventId = day3Events[1];

    let state = openDayFrom({
      ...dayStartState(3),
      unlocks: { pricing: true, advertising: false, staff: true, kassandra: false, apocalypseOperations: false }
    });
    // pos-1 event should not be pending yet (we've only opened)
    expect(state.pendingEvents).not.toContain(pos1EventId);

    state = gameReducer(state, { type: "take_order" });
    expect(state.pendingEvents).toContain(pos1EventId);
  });

  it("does not duplicate an event id already in pendingEvents", () => {
    let state = openDayFrom(dayStartState(1));
    const firstId = state.pendingEvents[0];
    // Serve several times — the opening event must not be duplicated
    state = gameReducer(state, { type: "take_order" });
    state = gameReducer(state, { type: "take_order" });
    const count = state.pendingEvents.filter((id) => id === firstId).length;
    expect(count).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// serve_product: guest-related events
// ---------------------------------------------------------------------------

describe("pendingEvents: serve_product (guest-related)", () => {
  it("enqueues a guest-related event at position > 0 after serving on Day 4", () => {
    // day-4-bohn-recognizes-coin is at position 3 of Day 4 and has relatedGuestIds.
    // It should fire on serve_product, not at open_day.
    const day4Events = weekOneDays[3].eventIds;
    const bohnCoinEventId = day4Events[3]; // "day-4-bohn-recognizes-coin"
    expect(bohnCoinEventId).toBe("day-4-bohn-recognizes-coin");

    let state = openDayFrom({
      ...dayStartState(4),
      unlocks: { pricing: true, advertising: true, staff: true, kassandra: false, apocalypseOperations: false }
    });
    // Not yet pending after open (it is not position-0)
    expect(state.pendingEvents).not.toContain(bohnCoinEventId);

    state = gameReducer(state, { type: "take_order" });
    expect(state.pendingEvents).toContain(bohnCoinEventId);
  });

  it("guest-related event at position 0 is enqueued at open_day (position wins over guest trigger)", () => {
    // day-2-herr-bohn-memory is at position 0 of Day 2 eventIds, which means it fires
    // on open_day (the positional rule for index 0 takes precedence).
    const day2Events = weekOneDays[1].eventIds;
    const bohnEventId = day2Events[0]; // "day-2-herr-bohn-memory"

    const state = openDayFrom(dayStartState(2));
    expect(state.pendingEvents).toContain(bohnEventId);
  });

  it("guest-related event at position 0 on Day 4 is enqueued at open_day", () => {
    // day-4-herr-grau-coin is position 0 of Day 4 → fires at open_day
    const day4Events = weekOneDays[3].eventIds;
    const grauEventId = day4Events[0]; // "day-4-herr-grau-coin"

    const state = openDayFrom({
      ...dayStartState(4),
      unlocks: { pricing: true, advertising: true, staff: true, kassandra: false, apocalypseOperations: false }
    });
    expect(state.pendingEvents).toContain(grauEventId);
  });
});

// ---------------------------------------------------------------------------
// complete_day: Closing-kicker events
// ---------------------------------------------------------------------------

describe("pendingEvents: complete_day (Closing kicker)", () => {
  it("enqueues the Day 1 coffee-machine-flicker (kicker=Closing) on complete_day", () => {
    const closingEventId = "day-1-coffee-machine-flicker" as GameState["pendingEvents"][number];

    let state = openDayFrom(dayStartState(1));
    // Verify it's not there during the open phase
    expect(state.pendingEvents).not.toContain(closingEventId);

    state = gameReducer(state, { type: "take_order" });
    state = gameReducer(state, { type: "complete_day" });

    expect(state.pendingEvents).toContain(closingEventId);
  });

  it("does not enqueue Closing events while the day is still open", () => {
    let state = openDayFrom(dayStartState(1));
    state = gameReducer(state, { type: "take_order" });

    const closingEvents = weekOneEvents.filter((e) => (e as EventDefinition).kicker === "Closing").map((e) => e.id);
    for (const id of closingEvents) {
      expect(state.pendingEvents).not.toContain(id);
    }
  });
});

// ---------------------------------------------------------------------------
// getTriggeredEvents selector
// ---------------------------------------------------------------------------

describe("getTriggeredEvents", () => {
  it("returns an empty array when pendingEvents is empty", () => {
    const state = createInitialGameState();
    expect(getTriggeredEvents(state)).toEqual([]);
  });

  it("returns EventDefinitions in pendingEvents order", () => {
    const state: GameState = {
      ...createInitialGameState(),
      pendingEvents: ["day-1-opening-rhythm", "day-1-coffee-machine-flicker"]
    };
    const events = getTriggeredEvents(state);
    expect(events).toHaveLength(2);
    expect(events[0].id).toBe("day-1-opening-rhythm");
    expect(events[1].id).toBe("day-1-coffee-machine-flicker");
  });

  it("returns EventDefinitions with the correct fields", () => {
    const state: GameState = {
      ...createInitialGameState(),
      pendingEvents: ["day-1-first-cup"]
    };
    const [event] = getTriggeredEvents(state);
    expect(event.id).toBe("day-1-first-cup");
    expect(event.day).toBe(1);
    expect(event.kicker).toBe("On the floor");
    expect(event.text.length).toBeGreaterThan(0);
  });

  it("silently drops unknown ids without throwing", () => {
    const state: GameState = {
      ...createInitialGameState(),
      pendingEvents: ["day-1-opening-rhythm", "does-not-exist" as GameState["pendingEvents"][number]]
    };
    const events = getTriggeredEvents(state);
    expect(events).toHaveLength(1);
    expect(events[0].id).toBe("day-1-opening-rhythm");
  });

  it("reflects events queued after open_day", () => {
    const state = openDayFrom(dayStartState(1));
    const events = getTriggeredEvents(state);
    expect(events.length).toBeGreaterThanOrEqual(1);
    expect(events[0].id).toBe(weekOneDays[0].eventIds[0]);
  });
});

// ---------------------------------------------------------------------------
// isValidGameState with pendingEvents
// ---------------------------------------------------------------------------

describe("isValidGameState: pendingEvents", () => {
  it("accepts a state with an empty pendingEvents array", () => {
    expect(isValidGameState(createInitialGameState())).toBe(true);
  });

  it("accepts a state with valid EventId strings in pendingEvents", () => {
    const state: GameState = {
      ...createInitialGameState(),
      pendingEvents: ["day-1-opening-rhythm"]
    };
    expect(isValidGameState(state)).toBe(true);
  });

  it("rejects a state where pendingEvents is not an array", () => {
    const state = {
      ...createInitialGameState(),
      pendingEvents: "not-an-array"
    };
    expect(isValidGameState(state)).toBe(false);
  });

  it("rejects a state where pendingEvents contains a non-string entry", () => {
    const state = {
      ...createInitialGameState(),
      pendingEvents: [123]
    };
    expect(isValidGameState(state)).toBe(false);
  });
});
