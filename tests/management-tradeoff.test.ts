import { describe, expect, it } from "vitest";
import { createInitialGameState } from "../src/game/engine/gameState";
import { gameReducer } from "../src/game/engine/reducer";
import {
  getCurrentDayModifier,
  getDayEndRecapLine,
  getDecorUpgradeOptions,
  getGuestForCustomer,
  getKassandraConsultLine,
  getNextGuestPreview,
  getObjectiveStatus,
  getVisibleDaySevenLetter,
  getVisibleKassandraMessages,
  getVisibleStaffOptions
} from "../src/game/engine/selectors";
import { weekOneDays } from "../src/game/data";
import {
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
    // is 0.7, so a €3.40 cappuccino earns €2.38.
    expect(nextState.resources.money).toBe(state.resources.money + 2.38);
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
        customersServed: 2
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

    expect(state.dayManagement.actionPointsRemaining).toBe(0);

    const blockedState = gameReducer(state, {
      type: "serve_product",
      productId: "filterkaffee"
    });

    expect(blockedState.dayManagement.actionPointsRemaining).toBe(0);
    expect(blockedState.dayManagement.actionPointsSpent).toBe(3);
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

  it("makes the Day-4 poster echo stronger but more stressful", () => {
    const dayFour: GameState = {
      ...createDayStartState(4),
      dayPhase: "open"
    };
    const advertised = gameReducer(dayFour, { type: "run_advertising" });

    expect(advertised.resources.money).toBe(40);
    expect(advertised.resources.reputation).toBe(27);
    expect(advertised.resources.stress).toBe(2);
    expect(advertised.statusMessage).toContain("Rep +2");
    expect(advertised.statusMessage).toContain("Stress +2");
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

    expect(openedState.resources.money).toBe(24);
    expect(openedState.helperAssignment?.locked).toBe(true);
    expect(changedState.helperAssignment?.helperId).toBe("jana");
  });

  it("makes Day-3 helper and Day-6 KASSANDRA unlocks visible at the right time", () => {
    expect(getVisibleStaffOptions(createDayStartState(2))).toHaveLength(0);
    expect(getVisibleStaffOptions(createDayStartState(3))).toHaveLength(3);

    expect(getVisibleKassandraMessages(createDayStartState(5))).toHaveLength(0);
    const daySixState: GameState = {
      ...createDayStartState(6),
      kassandraInstalled: true
    };
    expect(getVisibleKassandraMessages(daySixState).length).toBeGreaterThan(0);
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
    expect(loadGameState(malformedStorage)).toEqual(createInitialGameState());

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
    expect(progressedState.dayManagement.actionPointsRemaining).toBe(3);
    expect(progressedState.dayManagement.actionPointsSpent).toBe(0);
    expect(getObjectiveStatus(progressedState).status).toBe("active");
  });
});

describe("fail-state and reputation-scaled income", () => {
  it("scales income with reputation (60% at 0, 100% at 100)", () => {
    expect(getReputationIncomeFactor(0)).toBeCloseTo(0.6);
    expect(getReputationIncomeFactor(100)).toBeCloseTo(1.0);
    expect(getReputationIncomeFactor(25)).toBeCloseTo(0.7);
    expect(getEarnedPrice(3.4, 25)).toBe(2.38);
  });

  it("closes the café immediately when the till hits zero", () => {
    const dayEndState: GameState = {
      ...createInitialGameState(),
      dayPhase: "day_end",
      resources: { ...createInitialGameState().resources, money: 0.8 },
      pendingSupplyPurchase: { coffee: 1, milk: 0, pastries: 0 }
    };
    const nextState = gameReducer(dayEndState, { type: "confirm_supply_purchase" });

    expect(nextState.resources.money).toBe(0);
    expect(nextState.cafeClosed).toBe(true);
    expect(nextState.closureReason).toBe("money");
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
    expect(preview?.name).toBe("Pendlerin Paula");
    expect(preview?.orderLine).toContain("Just coffee");
    expect(preview?.learningCue).toContain("never looks at the pastry shelf");
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

    expect(learned.guestMemory["pendlerin-paula"]?.visits).toBe(1);
    expect(learned.guestMemory["pendlerin-paula"]?.knownPreferenceId).toBe(
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

  it("adds a solo-floor stress penalty from Day 4 without a helper", () => {
    const soloDayFour = completePreparedDay({
      ...createInitialGameState(),
      day: 4,
      helperAssignment: null
    });

    expect(
      soloDayFour.daySummary?.flavorLines.some((line) => line.includes("alone"))
    ).toBe(true);
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
