import { describe, expect, it } from "vitest";
import { createFreshRunState, createInitialGameState } from "../src/game/engine/gameState";
import { gameReducer } from "../src/game/engine/reducer";
import {
  canCompleteCurrentDay,
  getCurrentDayModifier,
  getDayEndRecapLine,
  getDecorUpgradeOptions,
  getGuestForCustomer,
  getKassandraConsultLine,
  getMoneyRecoveryWarning,
  getNextGuestPreview,
  getObjectiveStatus,
  getVisibleDaySevenLetter,
  getVisibleKassandraMessages,
  getVisibleStaffOptions
} from "../src/game/engine/selectors";
import { weekOneDays } from "../src/game/data";
import {
  createInitialDayManagement,
  getEarnedPrice,
  getReputationIncomeFactor,
  MUNDANE_STRESS_EVENT_LINES
} from "../src/game/engine/management";
import {
  loadGameState,
  SAVE_KEY,
  saveGameState,
  type StorageLike
} from "../src/game/engine/save";
import type { DayNumber } from "../src/game/types/content";
import type { GameState } from "../src/game/types/game";

describe("management tradeoff system", () => {
  it("defines one visible objective for each week-one day", () => {
    expect(weekOneDays).toHaveLength(7);

    for (const dayDefinition of weekOneDays) {
      expect(dayDefinition.objective.day).toBe(dayDefinition.day);
      expect(dayDefinition.objective.title.length).toBeGreaterThan(0);
      expect(dayDefinition.objective.completionHint.length).toBeGreaterThan(0);
    }
  });

  it("selects deterministic day modifiers for the week-one run", () => {
    expect(getCurrentDayModifier(createInitialGameState()).id).toBe("soft-opening");
    expect(getCurrentDayModifier(createDayStartState(4)).id).toBe("poster-echo");
    expect(getCurrentDayModifier(createDayStartState(7)).id).toBe(
      "inspection-pressure"
    );
  });

  it("consumes the documented supplies for cappuccino orders", () => {
    const state = createInitialGameState();
    const nextState = gameReducer(state, {
      type: "serve_product",
      productId: "cappuccino"
    });

    expect(nextState.supplies.coffee).toBe(state.supplies.coffee - 1);
    expect(nextState.supplies.milk).toBe(state.supplies.milk - 1);
    // Income scales with reputation: at the starting reputation (25) the factor
    // is 0.7, so a 3.4 Asche cappuccino earns 2.4 Asche.
    expect(nextState.resources.money).toBe(state.resources.money + 2.4);
  });

  it("substitutes or blocks unavailable products with a reputation penalty", () => {
    const state: GameState = {
      ...createInitialGameState(),
      supplies: { coffee: 3, milk: 0, pastries: 3 }
    };
    const nextState = gameReducer(state, {
      type: "serve_product",
      productId: "cappuccino"
    });

    expect(nextState.supplies.coffee).toBe(2);
    expect(nextState.supplies.milk).toBe(0);
    // Starting reputation (25) minus the -1 missing-ingredient penalty.
    expect(nextState.resources.reputation).toBe(24);
    expect(nextState.statusMessage).toContain("No milk");
  });

  it("caps supply purchases and blocks purchases beyond the available balance", () => {
    const dayEndState: GameState = {
      ...createInitialGameState(),
      dayPhase: "day_end",
      supplies: { coffee: 19, milk: 20, pastries: 11 },
      resources: { ...createInitialGameState().resources, money: 1 }
    };

    const cappedState = gameReducer(dayEndState, {
      type: "set_supply_purchase",
      ingredient: "coffee",
      quantity: 8
    });
    const tooExpensiveState = gameReducer(cappedState, {
      type: "set_supply_purchase",
      ingredient: "pastries",
      quantity: 1
    });
    const blockedState = gameReducer(tooExpensiveState, {
      type: "confirm_supply_purchase"
    });

    expect(cappedState.pendingSupplyPurchase.coffee).toBe(1);
    expect(tooExpensiveState.pendingSupplyPurchase.pastries).toBe(1);
    expect(blockedState.day).toBe(1);
    expect(blockedState.statusMessage).toContain("Not enough money");
  });

  it("applies affordable end-of-day restocking at the start of the next day", () => {
    const dayEndState: GameState = {
      ...createInitialGameState(),
      dayPhase: "day_end",
      supplies: { coffee: 10, milk: 10, pastries: 10 },
      pendingSupplyPurchase: { coffee: 2, milk: 1, pastries: 1 }
    };
    const nextState = gameReducer(dayEndState, {
      type: "confirm_supply_purchase"
    });

    expect(nextState.day).toBe(2);
    expect(nextState.supplies).toEqual({ coffee: 12, milk: 11, pastries: 11 });
    expect(nextState.resources.money).toBe(38.8);
  });

  it("rewards the Day-3 inventory audit when supplies are checked before anything is empty", () => {
    const dayThree: GameState = {
      ...createDayStartState(3),
      dayPhase: "open"
    };
    const checked = gameReducer(dayThree, { type: "check_supplies" });

    expect(checked.resources.reputation).toBe(dayThree.resources.reputation + 1);
    expect(checked.statusMessage).toContain("Rep +1");
  });

  it("decreases cleanliness from serving and increases it through cleaning", () => {
    const servedState = gameReducer(createInitialGameState(), {
      type: "serve_product",
      productId: "filterkaffee"
    });
    const cleanedState = gameReducer(servedState, { type: "clean_tables" });

    expect(servedState.resources.cleanliness).toBe(78);
    expect(cleanedState.resources.cleanliness).toBe(90);
  });

  it("tracks and cleans individual tables", () => {
    let state = createInitialGameState();
    state = gameReducer(state, { type: "serve_product", productId: "filterkaffee" });
    state = gameReducer(state, { type: "serve_product", productId: "filterkaffee" });

    expect(state.dayManagement.dirtyTableIds).toEqual(["left", "right"]);

    const cleanedRight = gameReducer(state, { type: "clean_table", tableId: "right" });
    expect(cleanedRight.dayManagement.dirtyTableIds).toEqual(["left"]);
    expect(cleanedRight.resources.cleanliness).toBe(state.resources.cleanliness + 12);

    const alreadyTidy = gameReducer(cleanedRight, { type: "clean_table", tableId: "back" });
    expect(alreadyTidy).toEqual({
      ...cleanedRight,
      statusMessage: "The back table is already tidy."
    });
  });

  it("applies cleanliness reputation effects at day end", () => {
    const messyState = completePreparedDay({
      ...createInitialGameState(),
      resources: { ...createInitialGameState().resources, cleanliness: 35 }
    });
    const cleanState = completePreparedDay({
      ...createInitialGameState(),
      resources: {
        ...createInitialGameState().resources,
        cleanliness: 75,
        reputation: 10
      },
      dayManagement: {
        ...createInitialGameState().dayManagement,
        reputationAtStart: 10
      }
    });

    // Starting reputation (25) minus the -1 messy-room penalty (cleanliness 35).
    expect(messyState.resources.reputation).toBe(24);
    expect(cleanState.resources.reputation).toBe(11);
  });

  it("adds stress only beyond the comfortable capacity", () => {
    let state: GameState = {
      ...createInitialGameState(),
      dayManagement: {
        ...createInitialGameState().dayManagement,
        actionPointsRemaining: 10
      }
    };

    for (let index = 0; index < 5; index += 1) {
      state = gameReducer(state, { type: "serve_product", productId: "filterkaffee" });
    }
    expect(state.resources.stress).toBe(0);

    state = gameReducer(state, { type: "serve_product", productId: "filterkaffee" });
    expect(state.resources.stress).toBe(8);
  });

  it("applies commuter-wave stress changes from obvious guest preferences", () => {
    const cemNext: GameState = {
      ...createInitialGameState(),
      day: 2,
      resources: { ...createInitialGameState().resources, stress: 10 },
      dayManagement: {
        ...createInitialGameState().dayManagement,
        actionPointsRemaining: 5,
        customersServed: 3
      }
    };

    const fastServe = gameReducer(cemNext, {
      type: "serve_product",
      productId: "espresso"
    });
    const wrongServe = gameReducer(cemNext, {
      type: "serve_product",
      productId: "cappuccino"
    });

    expect(fastServe.resources.stress).toBe(8);
    expect(fastServe.statusMessage).toContain("Stress -2");
    expect(wrongServe.resources.stress).toBe(12);
    expect(wrongServe.statusMessage).toContain("Stress +2");
  });

  it("prevents the action budget from going below zero", () => {
    let state = createInitialGameState();

    state = gameReducer(state, { type: "serve_product", productId: "filterkaffee" });
    state = gameReducer(state, { type: "clean_tables" });
    state = gameReducer(state, { type: "check_supplies" });
    state = gameReducer(state, { type: "serve_product", productId: "filterkaffee" });

    expect(state.dayManagement.actionPointsRemaining).toBe(0);

    const blockedState = gameReducer(state, {
      type: "serve_product",
      productId: "filterkaffee"
    });

    expect(blockedState.dayManagement.actionPointsRemaining).toBe(0);
    expect(blockedState.dayManagement.actionPointsSpent).toBe(4);
    expect(blockedState.statusMessage).toContain("No action capacity");
  });

  it("adds cleanliness and empty-supply stress only once per condition", () => {
    let state: GameState = {
      ...createInitialGameState(),
      resources: { ...createInitialGameState().resources, cleanliness: 41 },
      supplies: { coffee: 1, milk: 0, pastries: 2 }
    };

    state = gameReducer(state, { type: "serve_product", productId: "cappuccino" });
    state = gameReducer(state, { type: "serve_product", productId: "cappuccino" });

    expect(state.dayManagement.cleanlinessStressApplied).toBe(true);
    expect(state.dayManagement.emptySupplyStressIngredients).toEqual([
      "milk",
      "coffee"
    ]);
    expect(state.resources.stress).toBe(15);
  });

  it("reduces stress overnight without resetting it to zero", () => {
    const dayEndState: GameState = {
      ...createInitialGameState(),
      dayPhase: "day_end",
      resources: { ...createInitialGameState().resources, stress: 50 }
    };
    const nextState = gameReducer(dayEndState, { type: "confirm_supply_purchase" });

    expect(nextState.resources.stress).toBe(30);
  });

  it("creates mundane stress events at the documented thresholds", () => {
    const stressedState = completePreparedDay({
      ...createInitialGameState(),
      resources: { ...createInitialGameState().resources, stress: 91 }
    });

    // A real mundane stress line is shown (no leftover placeholder text)
    expect(stressedState.daySummary?.stressEvent).toBeTruthy();
    expect(stressedState.daySummary?.stressEvent).not.toMatch(/placeholder/i);
    expect(MUNDANE_STRESS_EVENT_LINES).toContain(stressedState.daySummary?.stressEvent);
    // Tone stays grounded — no overt weirdness/myth/apocalypse wording yet
    expect(stressedState.daySummary?.stressEvent).not.toMatch(/weirdness|myth|apocalypse/i);
    expect(stressedState.resources.money).toBeLessThan(42);
  });

  it("evaluates objective completion and missed states deterministically", () => {
    const completedState = completePreparedDay({
      ...createInitialGameState(),
      dayManagement: {
        ...createInitialGameState().dayManagement,
        customersServed: 2
      },
      completedActions: ["take_order", "clean_tables"]
    });
    const missedState = completePreparedDay({
      ...createInitialGameState(),
      dayManagement: {
        ...createInitialGameState().dayManagement,
        customersServed: 1
      },
      completedActions: ["take_order", "clean_tables"]
    });

    expect(completedState.daySummary?.objectiveCompleted).toBe(true);
    expect(completedState.objectiveResults[0].status).toBe("completed");
    expect(getObjectiveStatus(completedState).status).toBe("completed");
    expect(missedState.daySummary?.objectiveCompleted).toBe(false);
    expect(missedState.objectiveResults[0].status).toBe("missed");
    expect(getObjectiveStatus(missedState).status).toBe("missed");
  });

  it("creates deterministic day-end ratings and management summary fields", () => {
    const baseState: GameState = {
      ...createInitialGameState(),
      resources: { ...createInitialGameState().resources, stress: 45 },
      dayManagement: {
        ...createInitialGameState().dayManagement,
        customersServed: 4,
        moneyEarned: 12,
        suppliesUsed: { coffee: 4, milk: 1, pastries: 1 }
      }
    };

    const firstSummary = completePreparedDay(baseState).daySummary;
    const secondSummary = completePreparedDay(baseState).daySummary;

    expect(firstSummary?.rating).toBe(secondSummary?.rating);
    expect(firstSummary?.moneyEarned).toBe(12);
    expect(firstSummary?.suppliesUsed).toEqual({ coffee: 4, milk: 1, pastries: 1 });
    expect(firstSummary?.suppliesRestocked).toEqual({
      coffee: 0,
      milk: 0,
      pastries: 0
    });
    expect(firstSummary?.cleanlinessLabel).toBeTruthy();
    expect(firstSummary?.stressLabel).toBeTruthy();
    expect(firstSummary?.objectiveTitle).toBe("Close the first shift");
  });

  it("unlocks opening achievements from actual order and cleaning actions", () => {
    const firstOrderOnly = completePreparedDay({
      ...createInitialGameState(),
      completedActions: ["take_order"]
    });
    const cleanedOpening = completePreparedDay({
      ...createInitialGameState(),
      completedActions: ["take_order", "clean_tables"]
    });

    expect(firstOrderOnly.unlockedAchievements).toContain("first-order");
    expect(firstOrderOnly.unlockedAchievements).not.toContain("clean-counter");
    expect(cleanedOpening.unlockedAchievements).toContain("first-order");
    expect(cleanedOpening.unlockedAchievements).toContain("clean-counter");
  });

  it("unlocks system achievements only when their actions happened", () => {
    const dayFourNoAd = completePreparedDay({
      ...createDayStartState(4),
      dayPhase: "open",
      completedActions: ["take_order"],
      dayManagement: {
        ...createInitialGameState().dayManagement,
        customersServed: 3,
        advertisingRun: false
      }
    });
    const dayFourWithAd = completePreparedDay({
      ...dayFourNoAd,
      dayManagement: {
        ...dayFourNoAd.dayManagement,
        advertisingRun: true
      }
    });

    let helperDay = gameReducer(createDayStartState(3), {
      type: "select_helper",
      helperId: "jana",
      taskId: "service"
    });
    helperDay = gameReducer(helperDay, { type: "open_day" });
    const helperClosed = completePreparedDay(helperDay);

    const soloDayFive = completePreparedDay({
      ...createDayStartState(5),
      dayPhase: "open",
      completedActions: ["take_order"]
    });

    expect(dayFourNoAd.unlockedAchievements).not.toContain("first-ad");
    expect(dayFourWithAd.unlockedAchievements).toContain("first-ad");
    expect(helperClosed.unlockedAchievements).toContain("first-helper");
    expect(soloDayFive.unlockedAchievements).not.toContain("first-helper");
  });

  it("keeps the Day-4 poster echo's cost and reputation gain without extra stress", () => {
    const dayFour = gameReducer(
      {
        ...createDayStartState(4),
        resources: { ...createInitialGameState().resources, stress: 12 },
        dayManagement: createInitialDayManagement(25, 4)
      },
      { type: "open_day" }
    );
    const advertised = gameReducer(dayFour, { type: "run_advertising" });

    expect(advertised.resources.money).toBe(40);
    expect(advertised.resources.reputation).toBe(27);
    expect(advertised.resources.stress).toBe(12);
    expect(advertised.dayManagement.moneySpent).toBe(2);
    expect(advertised.dayManagement.actionPointsRemaining).toBe(4);
    expect(advertised.dayManagement.actionPointsSpent).toBe(1);
    expect(advertised.dayManagement.actionsWithoutServing).toBe(1);
    expect(advertised.statusMessage).toContain("Rep +2");
    expect(advertised.statusMessage).not.toContain("Stress +2");
    expect(advertised.statusMessage).not.toContain("foot traffic");
  });

  it("completes the Day-4 objective at exactly two guests only after advertising", () => {
    const twoGuestsWithAd: GameState = {
      ...createDayStartState(4),
      dayPhase: "open",
      dayManagement: {
        ...createInitialDayManagement(25, 4),
        customersServed: 2,
        advertisingRun: true
      }
    };

    expect(getObjectiveStatus(twoGuestsWithAd).completed).toBe(true);
    expect(
      getObjectiveStatus({
        ...twoGuestsWithAd,
        dayManagement: { ...twoGuestsWithAd.dayManagement, customersServed: 1 }
      }).completed
    ).toBe(false);
    expect(
      getObjectiveStatus({
        ...twoGuestsWithAd,
        dayManagement: { ...twoGuestsWithAd.dayManagement, advertisingRun: false }
      }).completed
    ).toBe(false);
  });

  it("unlocks KASSANDRA and letter achievements from actual late-week state", () => {
    const daySixWithoutKassandra = completePreparedDay({
      ...createDayStartState(6),
      dayPhase: "open",
      kassandraInstalled: false,
      unlocks: {
        ...createDayStartState(6).unlocks,
        kassandra: false
      },
      completedActions: ["take_order"]
    });
    const daySixWithKassandra = completePreparedDay({
      ...createDayStartState(6),
      dayPhase: "open",
      kassandraInstalled: true,
      completedActions: ["take_order"]
    });
    const daySevenClosed = completePreparedDay({
      ...createInitialGameState(),
      day: 7,
      completedActions: ["take_order"]
    });

    expect(daySixWithoutKassandra.unlockedAchievements).not.toContain(
      "kassandra-installed"
    );
    expect(daySixWithKassandra.unlockedAchievements).toContain(
      "kassandra-installed"
    );
    expect(daySevenClosed.unlockedAchievements).toContain("week-one-letter");
  });

  it("keeps helpers unavailable before Day 3 and locks the day-start assignment", () => {
    const earlyState = gameReducer(createInitialGameState(), {
      type: "select_helper",
      helperId: "jana",
      taskId: "cleaning"
    });
    expect(earlyState.helperAssignment).toBeNull();

    const dayFiveState = createDayStartState(5);
    const selectedState = gameReducer(dayFiveState, {
      type: "select_helper",
      helperId: "jana",
      taskId: "cleaning"
    });
    const openedState = gameReducer(selectedState, { type: "open_day" });
    const changedState = gameReducer(openedState, {
      type: "select_helper",
      helperId: "nino",
      taskId: "counter"
    });

    expect(openedState.resources.money).toBe(
      dayFiveState.resources.money - selectedState.helperAssignment!.dailyCost
    );
    expect(openedState.helperAssignment?.locked).toBe(true);
    expect(changedState.helperAssignment?.helperId).toBe("jana");
  });

  it.each([[3, 2], [4, 14]] as const)("charges Jana's Day %i opening fee of %i Asche", (day, fee) => {
    const before = createDayStartState(day);
    const selected = gameReducer(before, { type: "select_helper", helperId: "jana", taskId: "service" });
    expect(selected.helperAssignment?.dailyCost).toBe(fee);
    // An older save can already have selected Jana at the regular price.
    const opened = gameReducer({
      ...selected, helperAssignment: { ...selected.helperAssignment!, dailyCost: 14 }
    }, { type: "open_day" });
    expect(opened.helperAssignment?.dailyCost).toBe(fee);
    expect(opened.resources.money).toBe(before.resources.money - fee);
    expect(opened.dayManagement.moneySpent).toBe(fee);
  });

  it("makes Day-3 helper and Day-6 KASSANDRA unlocks visible at the right time", () => {
    expect(getVisibleStaffOptions(createDayStartState(2))).toHaveLength(0);
    expect(getVisibleStaffOptions(createDayStartState(3)).map((staff) => staff.id)).toEqual(["jana"]);
    expect(getVisibleStaffOptions(createDayStartState(4))).toHaveLength(3);

    expect(getVisibleKassandraMessages(createDayStartState(5))).toHaveLength(0);
    const daySixState: GameState = {
      ...createDayStartState(6),
      kassandraInstalled: true
    };
    expect(getVisibleKassandraMessages(daySixState).length).toBeGreaterThan(0);
  });

  it("lets Jana clear one dirty table on Day 3 and reports a shortage even when the guest gets an available drink", () => {
    const ready = { ...createDayStartState(3), supplies: { coffee: 5, milk: 0, pastries: 1 } };
    const assigned = gameReducer(ready, { type: "select_helper", helperId: "jana", taskId: "cleaning" });
    let state = gameReducer(assigned, { type: "open_day" });
    state = gameReducer(state, { type: "serve_product", productId: "filterkaffee" });
    const dirty = state.dayManagement.dirtyTableIds[0]!;
    expect(dirty).toBeDefined();
    const actions = state.dayManagement.actionPointsRemaining;
    state = gameReducer(state, { type: "clean_table", tableId: dirty });
    expect(state.dayManagement.dirtyTableIds).not.toContain(dirty);
    expect(state.dayManagement.actionPointsRemaining).toBe(actions);

    for (let i = 0; i < 2; i++) {
      state = gameReducer(state, { type: "serve_product", productId: "filterkaffee" });
    }
    const nextDirty = state.dayManagement.dirtyTableIds[0]!;
    const beforeCleaning = state.dayManagement.actionPointsRemaining;
    state = gameReducer(state, { type: "clean_table", tableId: nextDirty });
    expect(state.dayManagement.actionPointsRemaining).toBe(beforeCleaning - 1);
    expect(state.dayManagement.emptySupplyStressIngredients).toEqual([]);

    const storage = createMemoryStorage();
    expect(saveGameState(state, storage).ok).toBe(true);
    const closed = gameReducer(loadGameState(storage), { type: "complete_day" });
    expect(closed.daySummary?.objectiveCompleted).toBe(true);
    expect(closed.daySummary?.helperAutonomyRecap).toBe("Jana cleared a table without using one of your actions.");
    expect(closed.daySummary?.flavorLines).toContain("Missing at the counter: Milk.");
    expect(closed.daySummary?.flavorLines).toContain("1 table still needed clearing at closing.");
  });

  it.each([1, 2])("reports whether Jana served an extra guest on Day 3 with %i coffee", (coffee) => {
    const ready = { ...createDayStartState(3), supplies: { coffee, milk: 0, pastries: 0 } };
    const assigned = gameReducer(ready, { type: "select_helper", helperId: "jana", taskId: "service" });
    const opened = gameReducer(assigned, { type: "open_day" });
    const served = gameReducer(opened, { type: "serve_product", productId: "filterkaffee" });
    const report = gameReducer(served, { type: "complete_day" }).daySummary;
    expect(report?.customersServed).toBe(coffee);
    expect(report?.objectiveCompleted).toBe(coffee === 2);
    expect(report?.helperAutonomyRecap).toBe(coffee === 2
      ? "Jana served one extra guest without using another action."
      : "Jana was assigned to service. No extra guest was served.");
  });

  it("lets an unaffordable selected helper be cleared before opening without a fee or action", () => {
    const selected = gameReducer(createDayStartState(3), {
      type: "select_helper", helperId: "jana", taskId: "service"
    });
    const poor = { ...selected, resources: { ...selected.resources, money: 1 } };
    const blocked = gameReducer(poor, { type: "open_day" });
    expect(blocked.dayPhase).toBe("day_start");

    const cleared = gameReducer(blocked, { type: "clear_helper" });
    expect(cleared.helperAssignment).toBeNull();
    expect(cleared.resources).toEqual(blocked.resources);
    expect(cleared.dayManagement).toEqual(blocked.dayManagement);
    expect(cleared.staffXp).toEqual(blocked.staffXp);
    expect(cleared.completedActions).toEqual(blocked.completedActions);

    const opened = gameReducer(cleared, { type: "open_day" });
    expect(opened.dayPhase).toBe("open");
    expect(opened.helperAssignment).toBeNull();
    expect(opened.resources.money).toBe(1);
    expect(opened.dayManagement.moneySpent).toBe(cleared.dayManagement.moneySpent);
    expect(opened.dayManagement.actionPointsSpent).toBe(cleared.dayManagement.actionPointsSpent);
  });

  it("preserves solo opening penalties instead of retaining the cleared helper's bonuses", () => {
    const base = { ...createDayStartState(5), staffXp: { jana: 5 } };
    const selected = gameReducer(base, { type: "select_helper", helperId: "jana", taskId: "service" });
    const cleared = gameReducer(selected, { type: "clear_helper" });
    const opened = gameReducer(cleared, { type: "open_day" });
    const openedAlone = gameReducer(base, { type: "open_day" });
    expect(opened.dayManagement).toEqual(openedAlone.dayManagement);
    expect(opened.resources).toEqual(openedAlone.resources);
    expect(opened.dayManagement.helperExtraOrdersRemaining).toBe(0);

    const closed = gameReducer(gameReducer(opened, { type: "take_order" }), { type: "complete_day" });
    const closedAlone = gameReducer(gameReducer(openedAlone, { type: "take_order" }), { type: "complete_day" });
    expect(closed.resources).toEqual(closedAlone.resources);
    expect(closed.staffXp).toEqual(base.staffXp);
  });

  it("locks helper removal after opening and leaves the paid assignment intact", () => {
    const selected = gameReducer(createDayStartState(5), {
      type: "select_helper", helperId: "nino", taskId: "counter"
    });
    const opened = gameReducer(selected, { type: "open_day" });
    for (const dayPhase of ["open", "day_end"] as const) {
      const state = { ...opened, dayPhase };
      const attempted = gameReducer(state, { type: "clear_helper" });
      expect({ ...attempted, statusMessage: state.statusMessage }).toEqual(state);
      expect(attempted.statusMessage).toContain("final once the day has opened");
    }
    const inconsistent = { ...opened, dayPhase: "day_start" as const };
    const attempted = gameReducer(inconsistent, { type: "clear_helper" });
    expect(attempted.helperAssignment).toEqual(inconsistent.helperAssignment);
  });

  it("saves the cleared assignment and allows a fresh selection after reloading", () => {
    const selected = gameReducer(createDayStartState(3), {
      type: "select_helper", helperId: "jana", taskId: "cleaning"
    });
    const cleared = gameReducer(selected, { type: "clear_helper" });
    const storage = createMemoryStorage();
    expect(saveGameState(cleared, storage)).toEqual({ ok: true });
    const restored = loadGameState(storage);
    expect(restored).toEqual(cleared);
    const reselected = gameReducer(restored, { type: "select_helper", helperId: "jana", taskId: "service" });
    expect(reselected.helperAssignment?.taskId).toBe("service");
    expect(reselected.resources).toEqual(restored.resources);
  });

  it("allows only one offer review per day, including after saving", () => {
    const opened = gameReducer(createDayStartState(3), { type: "open_day" });
    const reviewed = gameReducer(opened, { type: "adjust_offer" });
    expect(reviewed.dayManagement.offerReviewed).toBe(true);
    expect(reviewed.resources.reputation).toBe(opened.resources.reputation + 1);
    expect(reviewed.statusMessage).toContain("Remaining orders earn 10 % more today");
    const storage = createMemoryStorage();
    expect(saveGameState(reviewed, storage)).toEqual({ ok: true });
    const restored = loadGameState(storage);
    expect(restored).toEqual(reviewed);
    const duplicate = gameReducer(restored, { type: "adjust_offer" });
    expect({ ...duplicate, statusMessage: restored.statusMessage }).toEqual(restored);
    expect(duplicate.statusMessage).toContain("already been reviewed today");

    const served = gameReducer(duplicate, { type: "take_order" });
    const closed = gameReducer(served, { type: "complete_day" });
    const nextDay = gameReducer(closed, { type: "confirm_supply_purchase" });
    expect(nextDay.day).toBe(4);
    expect(nextDay.dayManagement.offerReviewed).toBe(false);
    const nextOpen = gameReducer(nextDay, { type: "open_day" });
    const nextReview = gameReducer(nextOpen, { type: "adjust_offer" });
    expect(nextReview.dayManagement.offerReviewed).toBe(true);
    expect(nextReview.dayManagement.actionPointsRemaining).toBe(nextOpen.dayManagement.actionPointsRemaining - 1);
  });

  it.each(["setup", "day_start", "open"] as const)("keeps upgrades unavailable during %s without spending cash", (dayPhase) => {
    const state = { ...createDayStartState(5), dayPhase };
    const attempted = gameReducer(state, { type: "buy_upgrade", upgradeId: "cleaning-kit" });
    expect({ ...attempted, statusMessage: state.statusMessage }).toEqual(state);
    expect(attempted.statusMessage).toContain("after closing, before the next day starts");
  });

  it("buys upgrades after closing, while retaining unlock, affordability and one-time limits", () => {
    const state = { ...createDayStartState(5), dayPhase: "day_end" as const };
    const early = { ...state, day: 4 as const };
    const locked = gameReducer(early, { type: "buy_upgrade", upgradeId: "cleaning-kit" });
    expect({ ...locked, statusMessage: early.statusMessage }).toEqual(early);
    const poor = { ...state, resources: { ...state.resources, money: 1 } };
    const unaffordable = gameReducer(poor, { type: "buy_upgrade", upgradeId: "cleaning-kit" });
    expect({ ...unaffordable, statusMessage: poor.statusMessage }).toEqual(poor);
    const bought = gameReducer(state, { type: "buy_upgrade", upgradeId: "cleaning-kit" });
    expect(bought.purchasedUpgrades).toContain("cleaning-kit");
    expect(bought.resources.money).toBe(state.resources.money - 14);
    expect(bought.dayManagement.moneySpent).toBe(state.dayManagement.moneySpent + 14);
    expect(bought.dayManagement.actionPointsRemaining).toBe(state.dayManagement.actionPointsRemaining);
    const duplicate = gameReducer(bought, { type: "buy_upgrade", upgradeId: "cleaning-kit" });
    expect({ ...duplicate, statusMessage: bought.statusMessage }).toEqual(bought);
  });

  it.each([
    { upgradeId: "menu-board", day: 3 },
    { upgradeId: "storage-shelf", day: 3 },
    { upgradeId: "weatherproof-umbrella-stand", day: 7 },
    { upgradeId: "cash-register-update", day: 6 }
  ] as const)("does not charge for an unsupported or automatic upgrade ($upgradeId)", ({ upgradeId, day }) => {
    const state = { ...createDayStartState(day), dayPhase: "day_end" as const };
    const attempted = gameReducer(state, { type: "buy_upgrade", upgradeId });
    expect({ ...attempted, statusMessage: state.statusMessage }).toEqual(state);
    expect(attempted.statusMessage).toContain("not available to buy in this demo");
  });

  it("blocks helper hiring when money is insufficient", () => {
    const poorDayFive = {
      ...createDayStartState(5),
      resources: { ...createDayStartState(5).resources, money: 1 }
    };
    const selectedState = gameReducer(poorDayFive, {
      type: "select_helper",
      helperId: "nele",
      taskId: "counter"
    });
    const blockedState = gameReducer(selectedState, { type: "open_day" });

    expect(blockedState.dayPhase).toBe("day_start");
    expect(blockedState.statusMessage).toContain("Not enough money");
  });

  it("applies representative Jana, Nino, and Nele helper effects", () => {
    const janaState = completePreparedDay({
      ...createOpenHelperState("jana", "cleaning"),
      resources: { ...createInitialGameState().resources, cleanliness: 20 },
      dayManagement: {
        ...createInitialGameState().dayManagement,
        customersServed: 1,
        reputationAtStart: 1
      },
      completedActions: ["take_order"]
    });
    expect(janaState.resources.cleanliness).toBe(45);

    const ninoBaristaState = gameReducer(
      createOpenHelperState("nino", "barista"),
      { type: "serve_product", productId: "cappuccino" }
    );
    // Starting reputation (25) plus the +1 barista bonus on a cappuccino.
    expect(ninoBaristaState.resources.reputation).toBe(26);
    expect(ninoBaristaState.supplies.milk).toBe(7);

    const ninoCounterState = gameReducer(
      {
        ...createDayStartState(5),
        resources: { ...createInitialGameState().resources, stress: 20 }
      },
      { type: "select_helper", helperId: "nino", taskId: "counter" }
    );
    expect(gameReducer(ninoCounterState, { type: "open_day" }).resources.stress).toBe(
      12
    );

    const neleMarketingState = gameReducer(
      createOpenHelperState("nele", "marketing"),
      { type: "serve_product", productId: "filterkaffee" }
    );
    expect(neleMarketingState.dayManagement.extraAdvertisingActions).toBe(1);
    expect(neleMarketingState.dayManagement.customersServed).toBe(2);
  });

  it("keeps weirdness hidden through Days 1-6 and shows it only after the Day-7 hook", () => {
    let state = createInitialGameState();

    for (let day = 1; day <= 6; day += 1) {
      expect(state.day).toBe(day);
      expect(state.weirdnessVisible).toBe(false);
      state = closePlayableDay(state);
    }

    expect(state.day).toBe(7);
    expect(state.weirdnessVisible).toBe(false);

    state = closePlayableDay(state);
    expect(state.demoComplete).toBe(true);
    expect(state.weirdnessVisible).toBe(true);
    expect(getVisibleDaySevenLetter(state)).toContain("apocalyptically relevant");
  });

  it("falls back from malformed saves and persists new management fields", () => {
    const malformedStorage = createMemoryStorage("{nope");
    expect(loadGameState(malformedStorage)).toEqual(createFreshRunState());

    const storage = createMemoryStorage();
    const savedState = gameReducer(createOpenHelperState("nele", "counter"), {
      type: "serve_product",
      productId: "filterkaffee"
    });

    saveGameState(savedState, storage);
    const loadedState = loadGameState(storage);

    expect(loadedState.supplies).toEqual(savedState.supplies);
    expect(loadedState.helperAssignment).toEqual(savedState.helperAssignment);
    expect(loadedState.stressEventLog).toEqual(savedState.stressEventLog);
    expect(loadedState.dayManagement.customersServed).toBe(2);
    expect(loadedState.dayManagement.actionPointsRemaining).toBe(
      savedState.dayManagement.actionPointsRemaining
    );
  });

  it("resets to Day 1 with clean objective and action state", () => {
    const progressedState = gameReducer(
      completePreparedDay({
        ...createInitialGameState(),
        dayManagement: {
          ...createInitialGameState().dayManagement,
          customersServed: 2,
          actionPointsRemaining: 1,
          actionPointsSpent: 2
        }
      }),
      { type: "reset_game" }
    );

    expect(progressedState.day).toBe(1);
    expect(progressedState.objectiveResults).toEqual([]);
    expect(progressedState.dayManagement.actionPointsRemaining).toBe(4);
    expect(progressedState.dayManagement.actionPointsSpent).toBe(0);
    expect(getObjectiveStatus(progressedState).status).toBe("active");
  });
});

describe("fail-state and reputation-scaled income", () => {
  it("scales income with reputation (60% at 0, 100% at 100)", () => {
    expect(getReputationIncomeFactor(0)).toBeCloseTo(0.6);
    expect(getReputationIncomeFactor(100)).toBeCloseTo(1.0);
    expect(getReputationIncomeFactor(25)).toBeCloseTo(0.7);
    expect(getEarnedPrice(3.4, 25)).toBe(2.4);
  });

  it("keeps serving possible when restocking spends the last money", () => {
    const dayEndState: GameState = {
      ...createInitialGameState(),
      dayPhase: "day_end",
      resources: { ...createInitialGameState().resources, money: 0.8 },
      pendingSupplyPurchase: { coffee: 1, milk: 0, pastries: 0 }
    };
    const nextState = gameReducer(dayEndState, { type: "confirm_supply_purchase" });

    expect(nextState.resources.money).toBe(0);
    expect(nextState.cafeClosed).toBe(false);
    expect(nextState.closureReason).toBeNull();
    expect(nextState.moneyZeroStreak).toBe(1);
    expect(nextState.statusMessage).toContain("rescue shift");

    const served = gameReducer(nextState, {
      type: "serve_product",
      productId: "cappuccino"
    });
    expect(served.resources.money).toBeGreaterThan(0);
    expect(served.dayManagement.customersServed).toBe(1);
    expect(served.moneyZeroStreak).toBe(1);
    expect(served.cafeClosed).toBe(false);
    expect(getMoneyRecoveryWarning(served)).toContain("This is your rescue shift");
    expect(served.statusMessage).toContain("This is your rescue shift");
    expect(served.statusMessage).not.toContain("The till is empty.");
  });

  it("allows empty-stock shifts to close at zero and grants exactly one rescue shift", () => {
    const emptyShift: GameState = {
      ...createInitialGameState(),
      resources: { ...createInitialGameState().resources, money: 0 },
      supplies: { coffee: 0, milk: 0, pastries: 0 }
    };
    expect(canCompleteCurrentDay(emptyShift)).toBe(true);
    expect(canCompleteCurrentDay({
      ...emptyShift,
      resources: { ...emptyShift.resources, money: 1 }
    })).toBe(false);

    const firstClose = gameReducer(emptyShift, { type: "complete_day" });
    expect(firstClose.dayPhase).toBe("day_end");
    expect(firstClose.dayManagement.customersServed).toBe(0);
    expect(firstClose.moneyZeroStreak).toBe(1);
    expect(firstClose.cafeClosed).toBe(false);
    expect(firstClose.statusMessage).toContain("Tomorrow is your rescue shift");
    expect(gameReducer(firstClose, { type: "complete_day" }).moneyZeroStreak).toBe(1);

    const rescueShift = gameReducer(firstClose, { type: "confirm_supply_purchase" });
    expect(rescueShift.day).toBe(2);
    expect(rescueShift.dayManagement.actionPointsRemaining).toBe(4);
    expect(rescueShift.moneyZeroStreak).toBe(1);
    expect(rescueShift.supplies).toEqual(emptyShift.supplies);
    expect(canCompleteCurrentDay(rescueShift)).toBe(true);

    const secondClose = gameReducer(rescueShift, { type: "complete_day" });
    expect(secondClose.moneyZeroStreak).toBe(2);
    expect(secondClose.cafeClosed).toBe(true);
    expect(secondClose.closureReason).toBe("money");
    expect(canCompleteCurrentDay(secondClose)).toBe(false);
    expect(getMoneyRecoveryWarning(secondClose)).toBeNull();
  });

  it("resets the money streak only when the rescue shift closes with money after costs", () => {
    const initial = createInitialGameState();
    const rescueShift: GameState = {
      ...initial,
      day: 2,
      resources: { ...initial.resources, money: 0 },
      moneyZeroStreak: 1,
      dayManagement: createInitialDayManagement(initial.resources.reputation, 2)
    };
    let served = gameReducer(rescueShift, {
      type: "serve_product",
      productId: "cappuccino"
    });
    expect(served.resources.money).toBeGreaterThan(0);
    expect(served.moneyZeroStreak).toBe(1);
    expect(getMoneyRecoveryWarning(served)).toContain("This is your rescue shift");
    expect(getMoneyRecoveryWarning(served)).not.toContain("The till is empty.");
    expect(getMoneyRecoveryWarning({ ...served, day: 7 })).not.toMatch(/tomorrow/i);

    const insufficientClose = gameReducer(served, { type: "complete_day" });
    expect(insufficientClose.resources.money).toBe(0);
    expect(insufficientClose.cafeClosed).toBe(true);

    served = gameReducer(served, { type: "serve_product", productId: "cappuccino" });
    served = gameReducer(served, { type: "serve_product", productId: "cappuccino" });
    const recovered = gameReducer(served, { type: "complete_day" });
    expect(recovered.resources.money).toBeGreaterThan(0);
    expect(recovered.moneyZeroStreak).toBe(0);
    expect(recovered.cafeClosed).toBe(false);
    expect(recovered.closureReason).toBeNull();
    expect(getMoneyRecoveryWarning(recovered)).toBeNull();
    expect(recovered.statusMessage).not.toContain("rescue shift");
  });

  it("does not grant another extra shift when a day-end upgrade empties the till", () => {
    const initial = createInitialGameState();
    const dayEnd: GameState = {
      ...initial,
      dayPhase: "day_end",
      resources: { ...initial.resources, money: 12 }
    };
    const spent = gameReducer(dayEnd, { type: "upgrade_decor", slot: "plant" });
    expect(spent.resources.money).toBe(0);
    expect(spent.moneyZeroStreak).toBe(1);
    expect(spent.cafeClosed).toBe(false);
    const purchasePlan = gameReducer(spent, {
      type: "set_supply_purchase",
      ingredient: "coffee",
      quantity: 0
    });
    expect(purchasePlan.statusMessage).toBe(spent.statusMessage);
    expect(purchasePlan.statusMessage.split("The till is empty.")).toHaveLength(2);

    const rescueShift = gameReducer(purchasePlan, { type: "confirm_supply_purchase" });
    expect(rescueShift.moneyZeroStreak).toBe(1);
    expect(rescueShift.statusMessage).not.toContain("Tomorrow is your rescue shift");
    expect(rescueShift.statusMessage.split("The till is empty.")).toHaveLength(2);
    const failedRescue = gameReducer(rescueShift, { type: "complete_day" });
    expect(failedRescue.cafeClosed).toBe(true);
    expect(failedRescue.closureReason).toBe("money");
  });

  it("preserves affordability failures without repeating the empty-till warning", () => {
    const initial = createDayStartState(4);
    const emptyTill: GameState = {
      ...initial,
      dayPhase: "open",
      resources: { ...initial.resources, money: 0 },
      dayManagement: createInitialDayManagement(initial.resources.reputation, 4)
    };
    const blocked = gameReducer(emptyTill, { type: "run_advertising" });
    const repeated = gameReducer(blocked, { type: "run_advertising" });

    expect(repeated.statusMessage).toContain("cannot afford a flyer");
    expect(repeated.statusMessage).toBe(blocked.statusMessage);
    expect(repeated.statusMessage.split("The till is empty.")).toHaveLength(2);
    expect(repeated.dayManagement.actionPointsRemaining).toBe(5);
    expect(repeated.moneyZeroStreak).toBe(0);
  });

  it("prioritizes money closure while recording both zero streaks", () => {
    const initial = createInitialGameState();
    const closed = gameReducer({
      ...initial,
      moneyZeroStreak: 1,
      reputationZeroStreak: 1,
      resources: { ...initial.resources, money: 0, reputation: 1, cleanliness: 20 }
    }, { type: "complete_day" });

    expect(closed.moneyZeroStreak).toBe(2);
    expect(closed.reputationZeroStreak).toBe(2);
    expect(closed.cafeClosed).toBe(true);
    expect(closed.closureReason).toBe("money");
  });

  it.each([0, 1, 2])("ends Day 7 with its letter at zero money (prior streak %i)", (moneyZeroStreak) => {
    const initial = createDayStartState(7);
    const closed = gameReducer({
      ...initial,
      dayPhase: "open",
      moneyZeroStreak,
      resources: { ...initial.resources, money: 0 }
    }, { type: "complete_day" });

    expect(closed.day).toBe(7);
    expect(closed.demoComplete).toBe(true);
    expect(getVisibleDaySevenLetter(closed)).toBeTruthy();
    expect(closed.moneyZeroStreak).toBe(Math.min(2, moneyZeroStreak + 1));
    expect(closed.cafeClosed).toBe(moneyZeroStreak > 0);
    expect(closed.closureReason).toBe(moneyZeroStreak > 0 ? "money" : null);
    expect(closed.statusMessage).toContain("An official letter has arrived");
    expect(closed.statusMessage).not.toMatch(/tomorrow|next shift|Day 8/i);
    expect(getMoneyRecoveryWarning(closed)).toBeNull();
    expect(canCompleteCurrentDay(closed)).toBe(false);
    expect(gameReducer(closed, { type: "confirm_supply_purchase" }).day).toBe(7);
  });

  it("blocks all further actions once the café is closed", () => {
    const closedState: GameState = {
      ...createInitialGameState(),
      cafeClosed: true,
      closureReason: "money"
    };
    const afterAction = gameReducer(closedState, { type: "take_order" });

    expect(afterAction.cafeClosed).toBe(true);
    expect(afterAction.dayManagement.customersServed).toBe(0);
    expect(afterAction.statusMessage).toContain("closed");
  });

  it("gives reputation a 2-day grace period before closing", () => {
    // Day 1 at zero reputation: a warning, not a closure.
    const firstZeroDay = completePreparedDay({
      ...createInitialGameState(),
      resources: { ...createInitialGameState().resources, reputation: 1, cleanliness: 20 }
    });
    expect(firstZeroDay.resources.reputation).toBe(0);
    expect(firstZeroDay.reputationZeroStreak).toBe(1);
    expect(firstZeroDay.cafeClosed).toBe(false);

    // Second consecutive zero-reputation day: the café closes.
    const secondZeroDay = completePreparedDay({
      ...createInitialGameState(),
      reputationZeroStreak: 1,
      resources: { ...createInitialGameState().resources, reputation: 1, cleanliness: 20 }
    });
    expect(secondZeroDay.reputationZeroStreak).toBe(2);
    expect(secondZeroDay.cafeClosed).toBe(true);
    expect(secondZeroDay.closureReason).toBe("reputation");
  });

  it("makes helpers available from Day 3", () => {
    expect(getVisibleStaffOptions(createDayStartState(3)).length).toBeGreaterThan(0);
    expect(getVisibleStaffOptions(createInitialGameState()).length).toBe(0);
  });

  it("rewards reputation when an appreciated product is served, with a daily cap", () => {
    // Find a (day, customerIndex) where Cappuccino-Christa is the served guest.
    let found: { day: number; index: number } | null = null;
    for (let day = 2; day <= 7 && !found; day += 1) {
      for (let index = 0; index < 8; index += 1) {
        const probe: GameState = { ...createInitialGameState(), day: day as DayNumber };
        if (getGuestForCustomer(probe, index)?.id === "cappuccino-christa") {
          found = { day, index };
          break;
        }
      }
    }
    expect(found).not.toBeNull();
    const { day, index } = found!;

    const base: GameState = {
      ...createInitialGameState(),
      day: day as DayNumber,
      dayPhase: "open",
      dayManagement: {
        ...createInitialGameState().dayManagement,
        actionPointsRemaining: 10,
        customersServed: index
      }
    };

    // Serving Christa her appreciated cappuccino (premium, tier 3): +2 reputation.
    const delighted = gameReducer(base, { type: "serve_product", productId: "cappuccino" });
    expect(delighted.resources.reputation).toBe(base.resources.reputation + 2);
    expect(delighted.dayManagement.appreciationBonusesGiven).toBe(2);
    expect(delighted.statusMessage).toContain("Rep +2");

    // Serving her something she does not value: no reputation gain.
    const letdown = gameReducer(base, { type: "serve_product", productId: "filterkaffee" });
    expect(letdown.resources.reputation).toBe(base.resources.reputation);
    expect(letdown.dayManagement.appreciationBonusesGiven).toBe(0);
  });

  it("scales appreciation reputation by product quality tier (premium earns more)", () => {
    // Herr Grau (Day 4+) appreciates the premium pour-over (tier 3 -> +2).
    let target: { day: number; index: number } | null = null;
    for (let day = 4; day <= 7 && !target; day += 1) {
      for (let index = 0; index < 8; index += 1) {
        const probe: GameState = { ...createInitialGameState(), day: day as DayNumber };
        if (getGuestForCustomer(probe, index)?.id === "herr-grau") {
          target = { day, index };
          break;
        }
      }
    }
    expect(target).not.toBeNull();

    const base: GameState = {
      ...createInitialGameState(),
      day: target!.day as DayNumber,
      dayPhase: "open",
      dayManagement: {
        ...createInitialGameState().dayManagement,
        actionPointsRemaining: 10,
        customersServed: target!.index
      }
    };

    const premium = gameReducer(base, { type: "serve_product", productId: "handfilter" });
    expect(premium.resources.reputation).toBe(base.resources.reputation + 2);
    expect(premium.statusMessage).toContain("Rep +2");
  });

  it("previews the next guest (and a wants-hint) only while the café is open", () => {
    const open = createInitialGameState();
    const preview = getNextGuestPreview(open);
    expect(preview?.name).toBe("Pendler Kemal");
    expect(preview?.orderLine).toContain("Filter coffee");
    expect(preview?.learningCue).toContain("glances at the door before the order");
    expect(preview?.wants).toBe("Filter Coffee");

    // No preview once the day's actions are spent.
    const spent: GameState = {
      ...open,
      dayManagement: { ...open.dayManagement, actionPointsRemaining: 0 }
    };
    expect(getNextGuestPreview(spent)).toBeNull();

    // When Cappuccino-Christa is next, her wants-hint names the cappuccino.
    let target: { day: number; index: number } | null = null;
    for (let day = 2; day <= 7 && !target; day += 1) {
      for (let index = 0; index < 8; index += 1) {
        const probe: GameState = { ...createInitialGameState(), day: day as DayNumber };
        if (getGuestForCustomer(probe, index)?.id === "cappuccino-christa") {
          target = { day, index };
          break;
        }
      }
    }
    expect(target).not.toBeNull();
    const christaNext: GameState = {
      ...createInitialGameState(),
      day: target!.day as DayNumber,
      dayPhase: "open",
      dayManagement: {
        ...createInitialGameState().dayManagement,
        actionPointsRemaining: 5,
        customersServed: target!.index
      }
    };
    expect(getNextGuestPreview(christaNext)?.name).toBe("Cappuccino-Christa");
    expect(getNextGuestPreview(christaNext)?.wants).toBe("Cappuccino");
  });

  it("learns guest preferences through serving instead of a tutorial", () => {
    const learned = gameReducer(createInitialGameState(), {
      type: "serve_product",
      productId: "filterkaffee"
    });
    const rememberedPaula: GameState = {
      ...createInitialGameState(),
      guestMemory: learned.guestMemory
    };
    const preview = getNextGuestPreview(rememberedPaula);

    expect(learned.guestMemory["pendler-kemal"]?.visits).toBe(1);
    expect(learned.guestMemory["pendler-kemal"]?.knownPreferenceId).toBe(
      "filterkaffee"
    );
    expect(learned.statusMessage).toContain("You write it down");
    expect(preview?.learningCue).toContain("You remember");
    expect(preview?.wants).toBe("Filter Coffee");
  });

  it("composes a narrative day-end recap, heavier on Day 7", () => {
    expect(getDayEndRecapLine(createInitialGameState())).toBe("");

    const calmClose = completePreparedDay(createInitialGameState());
    const recap = getDayEndRecapLine(calmClose);
    expect(recap.length).toBeGreaterThan(0);
    expect(recap).toContain("ledger");

    const daySevenClose = completePreparedDay({
      ...createInitialGameState(),
      day: 7
    });
    expect(getDayEndRecapLine(daySevenClose)).toContain("heavier");
  });

  it("voices KASSANDRA with day-scaled, deterministic consult lines", () => {
    const daySix: GameState = {
      ...createInitialGameState(),
      day: 6,
      dayPhase: "open",
      kassandraInstalled: true,
      unlocks: { ...createInitialGameState().unlocks, kassandra: true }
    };
    const daySeven: GameState = { ...daySix, day: 7 };

    // A real, non-empty line is drawn from the unlocked pool.
    expect(getKassandraConsultLine(daySix).length).toBeGreaterThan(0);
    // Day 7 unlocks strictly more lines than Day 6 (escalation).
    const poolSix = getVisibleKassandraMessages(daySix).length;
    const poolSeven = getVisibleKassandraMessages(daySeven).length;
    expect(poolSeven).toBeGreaterThan(poolSix);

    // Consulting surfaces a voiced KASSANDRA line.
    const consulted = gameReducer(daySix, { type: "consult_kassandra" });
    expect(consulted.statusMessage.startsWith("KASSANDRA:")).toBe(true);
    expect(consulted.statusMessage).toContain("Action refunded");
    expect(consulted.dayManagement.kassandraConsulted).toBe(true);
    expect(consulted.dayManagement.actionPointsRemaining).toBe(
      daySix.dayManagement.actionPointsRemaining
    );
  });

  it.each([6, 7] as const)("rejects duplicate KASSANDRA consultations without consuming actions or patience on Day %i", (day) => {
    const opened = gameReducer({ ...createDayStartState(day), kassandraInstalled: true }, { type: "open_day" });
    for (const customersServed of [0, 1]) {
      const before = { ...opened, dayManagement: { ...opened.dayManagement, customersServed } };
      const first = gameReducer(before, { type: "consult_kassandra" });
      expect(first.dayManagement.kassandraConsulted).toBe(true);
      const duplicate = gameReducer(first, { type: "consult_kassandra" });
      expect({ ...duplicate, statusMessage: first.statusMessage }).toEqual(first);
      expect(duplicate.statusMessage).toContain("already been consulted today");
    }
  });

  it("keeps the KASSANDRA daily lock after saving, even with no actions remaining", () => {
    const opened = gameReducer({ ...createDayStartState(6), kassandraInstalled: true }, { type: "open_day" });
    const consulted = gameReducer(opened, { type: "consult_kassandra" });
    const noActions = { ...consulted, dayManagement: { ...consulted.dayManagement, actionPointsRemaining: 0 } };
    const storage = createMemoryStorage();
    expect(saveGameState(noActions, storage)).toEqual({ ok: true });
    const restored = loadGameState(storage);
    expect(restored).toEqual(noActions);
    const duplicate = gameReducer(restored, { type: "consult_kassandra" });
    expect({ ...duplicate, statusMessage: restored.statusMessage }).toEqual(restored);
    expect(duplicate.statusMessage).toContain("already been consulted today");
  });

  it("resets KASSANDRA availability when the next café day actually starts", () => {
    const opened = gameReducer({ ...createDayStartState(6), kassandraInstalled: true }, { type: "open_day" });
    const consulted = gameReducer(opened, { type: "consult_kassandra" });
    const served = gameReducer(consulted, { type: "serve_product", productId: "filterkaffee" });
    const closed = gameReducer(served, { type: "complete_day" });
    expect(closed.dayPhase).toBe("day_end");
    const nextDay = gameReducer(closed, { type: "confirm_supply_purchase" });
    expect(nextDay.day).toBe(7);
    expect(nextDay.dayManagement.kassandraConsulted).toBe(false);
    const nextOpen = gameReducer(nextDay, { type: "open_day" });
    const nextConsultation = gameReducer(nextOpen, { type: "consult_kassandra" });
    expect(nextConsultation.dayManagement.kassandraConsulted).toBe(true);
    expect(nextConsultation.statusMessage).toContain("KASSANDRA:");
    expect(nextConsultation.dayManagement.actionPointsRemaining).toBe(nextOpen.dayManagement.actionPointsRemaining - 1);
  });

  it("upgrades décor at day end: cost, tier, one-time reputation, and caps", () => {
    const dayEnd: GameState = {
      ...createInitialGameState(),
      dayPhase: "day_end",
      resources: { ...createInitialGameState().resources, money: 42, reputation: 25 }
    };

    // Plant tier 1 -> 2 costs €12 and grants +1 reputation, once.
    const upgraded = gameReducer(dayEnd, { type: "upgrade_decor", slot: "plant" });
    expect(upgraded.decor.plant).toBe(2);
    expect(upgraded.resources.money).toBe(30);
    expect(upgraded.resources.reputation).toBe(26);

    // The second plant is its own purchasable counter slot, with its own price.
    const counterPlant = gameReducer(dayEnd, { type: "upgrade_decor", slot: "plant2" });
    expect(counterPlant.decor.plant2).toBe(2);
    expect(counterPlant.resources.money).toBe(32);
    expect(counterPlant.resources.reputation).toBe(26);

    // Not enough money is blocked.
    const broke: GameState = {
      ...dayEnd,
      resources: { ...dayEnd.resources, money: 1 }
    };
    const blocked = gameReducer(broke, { type: "upgrade_decor", slot: "plant" });
    expect(blocked.decor.plant).toBe(1);
    expect(blocked.statusMessage).toContain("Not enough money");

    // Décor cannot be upgraded outside the day-end review.
    const openState: GameState = { ...dayEnd, dayPhase: "open" };
    const notNow = gameReducer(openState, { type: "upgrade_decor", slot: "plant" });
    expect(notNow.decor.plant).toBe(1);

    // Maxed slot is reported as having no next upgrade.
    const maxed: GameState = {
      ...dayEnd,
      decor: { ...dayEnd.decor, plant: 3 }
    };
    const plantOption = getDecorUpgradeOptions(maxed).find((o) => o.id === "plant");
    expect(plantOption?.next).toBeNull();
  });

  it("adds the solo-floor stress penalty from Day 5, leaving Day 4 free of it", () => {
    const soloDayFour: GameState = {
      ...createInitialGameState(),
      day: 4,
      helperAssignment: null,
      resources: { ...createInitialGameState().resources, stress: 25 },
      dayManagement: {
        ...createInitialDayManagement(25, 4),
        customersServed: 4,
        cleaningActions: 1
      }
    };
    const closedDayFour = completePreparedDay(soloDayFour);
    const closedDayFive = completePreparedDay({ ...soloDayFour, day: 5 });

    expect(closedDayFour.resources.stress).toBe(25);
    expect(
      closedDayFour.daySummary?.flavorLines.some((line) => line.includes("Stress +10"))
    ).toBe(false);
    expect(closedDayFive.resources.stress).toBe(35);
    expect(closedDayFive.daySummary?.helperAutonomyRecap).toContain("+10 stress at closing");
  });

  it("makes Day-7 inspection pressure reward clean closing and punish messy closing", () => {
    const cleanInspection = completePreparedDay({
      ...createInitialGameState(),
      day: 7,
      resources: { ...createInitialGameState().resources, reputation: 25, cleanliness: 80 },
      dayManagement: {
        ...createInitialGameState().dayManagement,
        reputationAtStart: 25
      }
    });
    const messyInspection = completePreparedDay({
      ...createInitialGameState(),
      day: 7,
      resources: { ...createInitialGameState().resources, reputation: 25, cleanliness: 30 },
      dayManagement: {
        ...createInitialGameState().dayManagement,
        reputationAtStart: 25
      }
    });

    expect(cleanInspection.resources.reputation).toBe(27);
    expect(cleanInspection.daySummary?.flavorLines).toContain(
      "Inspection day: clean closing rewarded. Rep +1."
    );
    expect(messyInspection.resources.reputation).toBe(23);
    expect(messyInspection.daySummary?.flavorLines).toContain(
      "Inspection day: the neglected corners were noted. Rep -1."
    );
  });
});

function completePreparedDay(state: GameState): GameState {
  return gameReducer(
    {
      ...state,
      dayPhase: "open",
      completedActions: state.completedActions.includes("take_order")
        ? state.completedActions
        : ["take_order", "clean_tables"],
      dayManagement: {
        ...state.dayManagement,
        customersServed: Math.max(1, state.dayManagement.customersServed)
      }
    },
    { type: "complete_day" }
  );
}

function closePlayableDay(state: GameState): GameState {
  let workingState = state.dayPhase === "day_start" ? gameReducer(state, { type: "open_day" }) : state;
  workingState = gameReducer(workingState, {
    type: "serve_product",
    productId: "filterkaffee"
  });
  workingState = gameReducer(workingState, { type: "clean_tables" });
  workingState = gameReducer(workingState, { type: "complete_day" });

  if (!workingState.demoComplete) {
    workingState = gameReducer(workingState, {
      type: "set_supply_purchase",
      ingredient: "coffee",
      quantity: 1
    });
    workingState = gameReducer(workingState, { type: "confirm_supply_purchase" });
  }

  return workingState;
}

function createDayStartState(day: DayNumber): GameState {
  return {
    ...createInitialGameState(),
    day,
    dayPhase: "day_start",
    phaseLabel: `Day ${day}`,
    unlocks: {
      pricing: day >= 3,
      advertising: day >= 4,
      staff: day >= 3,
      kassandra: day >= 6,
      apocalypseOperations: false
    }
  };
}

function createOpenHelperState(
  helperId: "jana" | "nino" | "nele",
  taskId: "cleaning" | "service" | "barista" | "counter" | "marketing"
): GameState {
  const selectedState = gameReducer(createDayStartState(5), {
    type: "select_helper",
    helperId,
    taskId
  });

  return gameReducer(selectedState, { type: "open_day" });
}

function createMemoryStorage(initialValue?: string): StorageLike {
  const values = new Map<string, string>();

  if (initialValue !== undefined) {
    values.set(SAVE_KEY, initialValue);
  }

  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value);
    },
    removeItem: (key) => {
      values.delete(key);
    }
  };
}
