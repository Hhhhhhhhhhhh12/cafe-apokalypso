import {
  addUniqueAchievementIds,
  addUniqueDayAction,
  addUniqueEventIds,
  addUniqueGuestIds,
  createInitialGameState
} from "./gameState";
import { weekOneAchievements, weekOneEvents } from "../data";
import { getCurrentDayDefinition } from "./selectors";
import type { DayNumber } from "../types/content";
import type { GameAction, GameState } from "../types/game";

export function gameReducer(state: GameState, action: GameAction): GameState {
  if (state.demoComplete && action.type !== "reset_game") {
    return {
      ...state,
      statusMessage:
        "The Day 7 letter has arrived. The demo is complete; reset to start again."
    };
  }

  switch (action.type) {
    case "take_order":
      return {
        ...state,
        completedActions: addUniqueDayAction(state.completedActions, "take_order"),
        resources: {
          ...state.resources,
          money: state.resources.money + 3,
          reputation: state.resources.reputation + 1,
          stress: state.resources.stress + 1,
          mood: "busy"
        },
        statusMessage:
          "Order taken. The customer seems willing to exchange money for coffee."
      };

    case "prepare_drink":
      return {
        ...state,
        completedActions: addUniqueDayAction(state.completedActions, "prepare_drink"),
        resources: {
          ...state.resources,
          coffee: Math.max(0, state.resources.coffee - 1),
          milk: Math.max(0, state.resources.milk - (state.day >= 3 ? 1 : 0)),
          stress: state.resources.stress + 1,
          mood: "busy"
        },
        statusMessage:
          "Drink prepared. The machine sounds normal enough for now."
      };

    case "prepare_counter":
    case "check_supplies":
      return {
        ...state,
        completedActions: addUniqueDayAction(state.completedActions, "check_supplies"),
        resources: {
          ...state.resources,
          coffee: state.resources.coffee + 2,
          milk: state.resources.milk + 1,
          pastries: state.resources.pastries + 1,
          stress: Math.max(0, state.resources.stress - 1),
          mood: "busy"
        },
        statusMessage:
          "Supplies checked. The café remains small, stocked, and mostly accountable."
      };

    case "clean_tables":
      return {
        ...state,
        completedActions: addUniqueDayAction(state.completedActions, "clean_tables"),
        resources: {
          ...state.resources,
          cleanliness: Math.min(100, state.resources.cleanliness + 6),
          stress: Math.max(0, state.resources.stress - 1),
          mood: "calm"
        },
        statusMessage:
          "Tables cleaned. No critical information is conveyed by shine alone."
      };

    case "complete_day":
      return completeCurrentDay(state);

    case "reset_game":
      return createInitialGameState();

    default:
      return state;
  }
}

function completeCurrentDay(state: GameState): GameState {
  if (!hasRequiredActions(state)) {
    return {
      ...state,
      statusMessage:
        "Finish one order, one drink, and one cleaning action before closing the day."
    };
  }

  const currentDay = getCurrentDayDefinition(state);
  const nextHistoryState = {
    guestHistory: addUniqueGuestIds(state.guestHistory, currentDay.guestIds),
    eventHistory: addUniqueEventIds(state.eventHistory, currentDay.eventIds),
    unlockedAchievements: addUniqueAchievementIds(
      state.unlockedAchievements,
      getAchievementIdsForDay(state.day)
    )
  };

  if (state.day === 7) {
    return {
      ...state,
      ...nextHistoryState,
      demoComplete: true,
      weirdnessVisible: true,
      hiddenWeirdness: state.hiddenWeirdness + 7,
      resources: {
        ...state.resources,
        reputation: state.resources.reputation + 2,
        stress: state.resources.stress + 2,
        mood: "strained"
      },
      statusMessage:
        "Day 7 closed. An official letter has arrived. Something is wrong with this café."
    };
  }

  const nextDay = (state.day + 1) as DayNumber;
  const nextDayDefinition = getCurrentDayDefinition({ ...state, day: nextDay });

  return {
    ...state,
    ...nextHistoryState,
    day: nextDay,
    phaseLabel: nextDayDefinition.title,
    completedActions: [],
    hiddenWeirdness: state.hiddenWeirdness + state.day,
    weirdnessVisible: false,
    kassandraInstalled: nextDay >= 6,
    unlocks: getUnlocksForDay(nextDay),
    resources: {
      ...state.resources,
      cleanliness: Math.max(0, state.resources.cleanliness - 3),
      stress: state.resources.stress + 1,
      mood: nextDay >= 6 ? "strained" : "calm"
    },
    statusMessage: `Day ${state.day} closed. ${getClosingBeatSummary(currentDay.eventIds)} Day ${nextDay} begins: ${nextDayDefinition.milestone}`
  };
}

function hasRequiredActions(state: GameState): boolean {
  return (
    state.completedActions.includes("take_order") &&
    state.completedActions.includes("prepare_drink") &&
    state.completedActions.includes("clean_tables")
  );
}

function getUnlocksForDay(day: DayNumber) {
  return {
    pricing: day >= 3,
    advertising: day >= 4,
    staff: day >= 5,
    kassandra: day >= 6,
    apocalypseOperations: false
  };
}

function getAchievementIdsForDay(day: DayNumber) {
  return weekOneAchievements
    .filter((achievement) => achievement.unlockDay === day)
    .map((achievement) => achievement.id);
}

function getClosingBeatSummary(eventIds: readonly string[]): string {
  const eventTexts: string[] = [];

  for (const eventId of eventIds) {
    const eventText = weekOneEvents.find((event) => event.id === eventId)?.text;

    if (eventText) {
      eventTexts.push(eventText);
    }
  }

  return eventTexts.length > 0 ? `Closing beat: ${eventTexts.join(" ")}` : "";
}
