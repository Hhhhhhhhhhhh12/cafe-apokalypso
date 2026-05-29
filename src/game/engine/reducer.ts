import {
  addUniqueAchievementIds,
  addUniqueDayAction,
  addUniqueEventIds,
  addUniqueGuestIds,
  createInitialGameState
} from "./gameState";
import { weekOneAchievements } from "../data";
import { getCurrentDayDefinition } from "./selectors";
import { getObjectiveStatus } from "./objectives";
import {
  applyProductConsumption,
  clampMeter,
  clampResource,
  clampSupply,
  COMFORTABLE_CAPACITY_BY_DAY,
  createHelperAssignment,
  createInitialDayManagement,
  findSubstituteProduct,
  getDayShiftRating,
  getIngredientRequirement,
  getCleanlinessLabel,
  getDefaultProductForState,
  getHelperLabel,
  getMissingIngredients,
  getProductById,
  getStressLabel,
  MUNDANE_STRESS_EVENT_LINES,
  SUPPLY_CAPS,
  SUPPLY_UNIT_COSTS
} from "./management";
import type { DayNumber, ProductId, StaffOptionId } from "../types/content";
import type {
  GameAction,
  GameState,
  HelperTaskId,
  IngredientKey,
  ResourceState,
  SupplyState
} from "../types/game";

const ADVERTISING_ACTION_COST = 3;

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
      return serveProduct(state, getDefaultProductForState(state).id);

    case "serve_product":
      return serveProduct(state, action.productId);

    case "prepare_drink":
      return serveProduct(state, getDefaultProductForState(state).id);

    case "prepare_counter":
    case "check_supplies":
      return checkSupplies(state);

    case "clean_tables":
      return cleanTables(state);

    case "adjust_offer":
      return adjustOffer(state);

    case "run_advertising":
      return runAdvertising(state);

    case "consult_kassandra":
      return consultKassandra(state);

    case "select_helper":
      return selectHelper(state, action.helperId, action.taskId);

    case "open_day":
      return openDay(state);

    case "complete_day":
      return completeCurrentDay(state);

    case "set_supply_purchase":
      return setSupplyPurchase(state, action.ingredient, action.quantity);

    case "confirm_supply_purchase":
      return confirmSupplyPurchase(state);

    case "reset_game":
      return createInitialGameState();

    default:
      return state;
  }
}

function serveProduct(state: GameState, productId: ProductId): GameState {
  if (state.dayPhase !== "open") {
    return {
      ...state,
      statusMessage:
        state.dayPhase === "day_start"
          ? "Open the café before serving orders."
          : "Finish the day-end restock before serving more orders."
    };
  }

  const actionState = spendActionPoint(state, "serve another order");
  if (!actionState) {
    return noActionCapacityState(state);
  }

  const requestedProduct = getProductById(productId);
  const missingIngredients = getMissingIngredients(
    requestedProduct,
    actionState.supplies,
    actionState.helperAssignment
  );

  if (missingIngredients.length > 0) {
    const substitute = findSubstituteProduct(
      requestedProduct,
      state.supplies,
      state.helperAssignment
    );
    const stressedState = applyEmptySupplyStress(actionState, missingIngredients);
    const reputationPenaltyResources = {
      ...stressedState.resources,
      reputation: clampMeter(stressedState.resources.reputation - 1)
    };

    if (!substitute) {
      return {
        ...stressedState,
        resources: reputationPenaltyResources,
        completedActions: addUniqueDayAction(stressedState.completedActions, "take_order"),
        statusMessage: `${formatMissingSupply(missingIngredients)} The guest pauses, then orders nothing. Ruf -1.`
      };
    }

    const servedState = applySuccessfulServe(
      {
        ...stressedState,
        resources: reputationPenaltyResources
      },
      substitute
    );

    return {
      ...servedState,
      statusMessage: `${formatMissingSupply(
        missingIngredients
      )} ${requestedProduct.name} becomes ${substitute.name}. The guest accepts this. Ruf -1.`
    };
  }

  const servedState = applySuccessfulServe(actionState, requestedProduct);

  return {
    ...servedState,
    statusMessage: `${requestedProduct.name} served. Supplies, cleanliness, money, and stress have been updated.`
  };
}

function applySuccessfulServe(
  state: GameState,
  product: ReturnType<typeof getProductById>
): GameState {
  const servedWithHelper = state.dayManagement.helperExtraOrdersRemaining > 0 ? 2 : 1;
  let workingState = state;
  let supplies = { ...state.supplies };
  let resources = { ...state.resources };
  let management = { ...state.dayManagement };
  const flavorLines: string[] = [];

  for (let index = 0; index < servedWithHelper; index += 1) {
    const missingIngredients = getMissingIngredients(
      product,
      supplies,
      workingState.helperAssignment
    );

    if (missingIngredients.length > 0) {
      workingState = applyEmptySupplyStress(
        { ...workingState, supplies, resources, dayManagement: management },
        missingIngredients
      );
      supplies = workingState.supplies;
      resources = {
        ...workingState.resources,
        reputation: clampMeter(workingState.resources.reputation - 1)
      };
      management = { ...workingState.dayManagement };
      flavorLines.push(`${formatMissingSupply(missingIngredients)} The helper could not complete the extra order.`);
      break;
    }

    supplies = applyProductConsumption(product, supplies, workingState.helperAssignment);
    const suppliesUsed = getSuppliesUsedForProduct(product, workingState.helperAssignment);
    resources = {
      ...resources,
      money: clampResource(resources.money + product.basePrice),
      cleanliness: clampMeter(resources.cleanliness - 2),
      stress: applyCapacityStress(resources.stress, management.customersServed, workingState.day)
    };

    if (
      workingState.helperAssignment?.helperId === "jana" &&
      workingState.helperAssignment.taskId === "cleaning" &&
      resources.cleanliness < 45
    ) {
      resources = { ...resources, cleanliness: 45 };
    }

    management = {
      ...management,
      customersServed: management.customersServed + 1,
      moneyEarned: clampResource(management.moneyEarned + product.basePrice),
      suppliesUsed: addSupplies(management.suppliesUsed, suppliesUsed)
    };

    if (resources.cleanliness < 40 && !management.cleanlinessStressApplied) {
      resources = { ...resources, stress: clampMeter(resources.stress + 5) };
      management = { ...management, cleanlinessStressApplied: true };
    }

    const baristaBonusApplies =
      workingState.helperAssignment?.helperId === "nino" &&
      workingState.helperAssignment.taskId === "barista" &&
      (product.id === "espresso" || product.id === "cappuccino") &&
      management.baristaReputationBonus < 3;

    if (baristaBonusApplies) {
      resources = {
        ...resources,
        reputation: clampMeter(resources.reputation + 1)
      };
      management = {
        ...management,
        baristaReputationBonus: management.baristaReputationBonus + 1
      };
    }
  }

  if (management.helperExtraOrdersRemaining > 0) {
    management = {
      ...management,
      helperExtraOrdersRemaining: Math.max(0, management.helperExtraOrdersRemaining - 1)
    };
  }

  return {
    ...workingState,
    supplies,
    resources: {
      ...resources,
      mood: resources.stress >= 61 ? "strained" : resources.stress >= 41 ? "busy" : "calm"
    },
    dayManagement: management,
    completedActions: addUniqueDayAction(workingState.completedActions, "take_order"),
    statusMessage:
      flavorLines.length > 0 ? flavorLines.join(" ") : workingState.statusMessage
  };
}

function cleanTables(state: GameState): GameState {
  if (state.dayPhase !== "open") {
    return {
      ...state,
      statusMessage: "Cleaning belongs to the open café day."
    };
  }

  const actionState = spendActionPoint(state, "clean the tables");
  if (!actionState) {
    return noActionCapacityState(state);
  }

  const capacity = COMFORTABLE_CAPACITY_BY_DAY[actionState.day];
  const slowWindowReduction =
    actionState.dayManagement.customersServed < capacity &&
    !actionState.dayManagement.slowCleaningStressReductionUsed
      ? 5
      : 0;

  return {
    ...actionState,
    completedActions: addUniqueDayAction(actionState.completedActions, "clean_tables"),
    resources: {
      ...actionState.resources,
      cleanliness: clampMeter(actionState.resources.cleanliness + 12),
      stress: clampMeter(actionState.resources.stress - slowWindowReduction),
      mood: "calm"
    },
    dayManagement: {
      ...actionState.dayManagement,
      cleaningActions: actionState.dayManagement.cleaningActions + 1,
      slowCleaningStressReductionUsed:
        actionState.dayManagement.slowCleaningStressReductionUsed || slowWindowReduction > 0
    },
    statusMessage:
      slowWindowReduction > 0
        ? "Tables cleaned during a quiet window. Cleanliness rises and stress drops slightly."
        : "Tables cleaned. Cleanliness rises."
  };
}

function checkSupplies(state: GameState): GameState {
  if (state.dayPhase !== "open") {
    return {
      ...state,
      statusMessage: "Supply checks belong to the open café day."
    };
  }

  const actionState = spendActionPoint(state, "check supplies");
  if (!actionState) {
    return noActionCapacityState(state);
  }

  return {
    ...actionState,
    completedActions: addUniqueDayAction(
      actionState.completedActions,
      "check_supplies"
    ),
    statusMessage: `Supply check: coffee ${actionState.supplies.coffee}/${SUPPLY_CAPS.coffee}, milk ${actionState.supplies.milk}/${SUPPLY_CAPS.milk}, pastries ${actionState.supplies.pastries}/${SUPPLY_CAPS.pastries}.`
  };
}

function adjustOffer(state: GameState): GameState {
  if (!state.unlocks.pricing || state.day < 3) {
    return {
      ...state,
      statusMessage: "Offer and pricing choices unlock on Day 3."
    };
  }

  if (state.dayPhase !== "open") {
    return {
      ...state,
      statusMessage: "Review the offer board during the open café day."
    };
  }

  const actionState = spendActionPoint(state, "review the offer board");
  if (!actionState) {
    return noActionCapacityState(state);
  }

  return {
    ...actionState,
    completedActions: addUniqueDayAction(actionState.completedActions, "adjust_offer"),
    dayManagement: {
      ...actionState.dayManagement,
      offerReviewed: true
    },
    statusMessage:
      "Offer board reviewed. The register recommends being normal in a slightly more profitable way."
  };
}

function runAdvertising(state: GameState): GameState {
  if (!state.unlocks.advertising || state.day < 4) {
    return {
      ...state,
      statusMessage: "Local advertising unlocks on Day 4."
    };
  }

  if (state.dayPhase !== "open") {
    return {
      ...state,
      statusMessage: "Advertising choices belong to the open café day."
    };
  }

  if (state.resources.money < ADVERTISING_ACTION_COST) {
    return {
      ...state,
      statusMessage: "The café cannot afford a small ad today."
    };
  }

  const hasBonusAdvertisingAction = state.dayManagement.extraAdvertisingActions > 0;
  const actionState = hasBonusAdvertisingAction
    ? {
        ...state,
        dayManagement: {
          ...state.dayManagement,
          extraAdvertisingActions: state.dayManagement.extraAdvertisingActions - 1
        }
      }
    : spendActionPoint(state, "run a local ad");

  if (!actionState) {
    return noActionCapacityState(state);
  }

  return {
    ...actionState,
    completedActions: addUniqueDayAction(
      actionState.completedActions,
      "run_advertising"
    ),
    resources: {
      ...actionState.resources,
      money: clampResource(actionState.resources.money - ADVERTISING_ACTION_COST),
      reputation: clampMeter(actionState.resources.reputation + 1)
    },
    dayManagement: {
      ...actionState.dayManagement,
      moneySpent: clampResource(
        actionState.dayManagement.moneySpent + ADVERTISING_ACTION_COST
      ),
      advertisingRun: true
    },
    statusMessage:
      "A local ad goes out. It costs €3, improves reputation by 1, and may make the counter feel smaller."
  };
}

function consultKassandra(state: GameState): GameState {
  if (!state.kassandraInstalled || !state.unlocks.kassandra || state.day < 6) {
    return {
      ...state,
      statusMessage: "KASSANDRA is still just a quiet cash register."
    };
  }

  if (state.dayPhase !== "open") {
    return {
      ...state,
      statusMessage: "KASSANDRA updates are reviewed during the open café day."
    };
  }

  const actionState = spendActionPoint(state, "consult KASSANDRA");
  if (!actionState) {
    return noActionCapacityState(state);
  }

  return {
    ...actionState,
    completedActions: addUniqueDayAction(
      actionState.completedActions,
      "consult_kassandra"
    ),
    dayManagement: {
      ...actionState.dayManagement,
      kassandraConsulted: true
    },
    statusMessage:
      "KASSANDRA update reviewed. Demand forecast: medium. Emotional volatility: locally elevated."
  };
}

function selectHelper(
  state: GameState,
  helperId: StaffOptionId,
  taskId: HelperTaskId
): GameState {
  if (state.day < 5 || !state.unlocks.staff) {
    return {
      ...state,
      statusMessage: "Temporary help starts on Day 5."
    };
  }

  if (state.dayPhase !== "day_start") {
    return {
      ...state,
      statusMessage: "Helper assignment is final once the day has opened."
    };
  }

  const assignment = createHelperAssignment(helperId, taskId);

  if (!assignment) {
    return {
      ...state,
      statusMessage: "That helper task is not available in Week 1."
    };
  }

  if (state.resources.money < assignment.dailyCost) {
    return {
      ...state,
      helperAssignment: assignment,
      statusMessage: `${getHelperLabel(assignment)} selected, but the café cannot afford this helper yet.`
    };
  }

  return {
    ...state,
    helperAssignment: assignment,
    statusMessage: `${getHelperLabel(assignment)} selected for today. Confirm opening to make it final.`
  };
}

function openDay(state: GameState): GameState {
  if (state.dayPhase !== "day_start") {
    return {
      ...state,
      statusMessage: "The café is already open."
    };
  }

  if (state.helperAssignment && state.resources.money < state.helperAssignment.dailyCost) {
    return {
      ...state,
      statusMessage: "Not enough money to hire that helper. Open without help or choose another option."
    };
  }

  let resources: ResourceState = { ...state.resources };
  let management = {
    ...state.dayManagement,
    moneySpent: state.dayManagement.moneySpent + (state.helperAssignment?.dailyCost ?? 0),
    helperExtraOrdersRemaining: getHelperExtraOrders(state),
    extraAdvertisingActions:
      state.helperAssignment?.helperId === "mira" &&
      state.helperAssignment.taskId === "marketing"
        ? 1
        : 0,
    helperDecisionMade: true
  };

  if (state.helperAssignment) {
    resources = {
      ...resources,
      money: clampResource(resources.money - state.helperAssignment.dailyCost)
    };

    if (state.helperAssignment.helperId === "nino" && state.helperAssignment.taskId === "counter") {
      resources = { ...resources, stress: clampMeter(resources.stress - 8) };
    }
    if (state.helperAssignment.helperId === "mira" && state.helperAssignment.taskId === "counter") {
      resources = { ...resources, stress: clampMeter(resources.stress - 5) };
    }
  }

  return {
    ...state,
    dayPhase: "open",
    resources,
    helperAssignment: state.helperAssignment
      ? { ...state.helperAssignment, locked: true }
      : null,
    dayManagement: management,
    statusMessage: state.helperAssignment
      ? `Day opened with ${getHelperLabel(state.helperAssignment)}. ${state.helperAssignment.flavorLine}`
      : "Day opened without temporary help."
  };
}

function completeCurrentDay(state: GameState): GameState {
  if (state.dayPhase !== "open") {
    return {
      ...state,
      statusMessage:
        state.dayPhase === "day_start"
          ? "Open the café before closing the day."
          : "This day is already closed. Confirm purchases to continue."
    };
  }

  if (!hasRequiredActions(state)) {
    return {
      ...state,
      statusMessage:
        "Finish at least one served order and one cleaning action before closing the day."
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
  const closedState = applyDayEndConsequences({ ...state, ...nextHistoryState });
  const daySevenClose = state.day === 7;
  const objectiveStatus = getObjectiveStatus({
    ...closedState,
    dayPhase: "day_end"
  });
  const objectiveResult = {
    day: state.day,
    objectiveId: objectiveStatus.objective.id,
    title: objectiveStatus.objective.title,
    status: objectiveStatus.completed ? "completed" : "missed"
  } as const;

  return {
    ...closedState,
    dayPhase: "day_end",
    daySummary: closedState.daySummary
      ? {
          ...closedState.daySummary,
          objectiveTitle: objectiveStatus.objective.title,
          objectiveCompleted: objectiveStatus.completed
        }
      : closedState.daySummary,
    objectiveResults: [
      ...closedState.objectiveResults.filter((result) => result.day !== state.day),
      objectiveResult
    ],
    demoComplete: daySevenClose,
    weirdnessVisible: daySevenClose ? true : false,
    hiddenWeirdness: daySevenClose
      ? closedState.hiddenWeirdness + 7
      : closedState.hiddenWeirdness + closedState.day,
    statusMessage: daySevenClose
      ? "Day 7 closed. An official letter has arrived. Something is wrong with this café."
      : `Day ${state.day} closed. Review the summary, then buy supplies for tomorrow.`
  };
}

function applyDayEndConsequences(state: GameState): GameState {
  let resources = { ...state.resources };
  let management = { ...state.dayManagement };
  const flavorLines: string[] = [];

  const janaMaintainsCleaning =
    state.helperAssignment?.helperId === "jana" &&
    state.helperAssignment.taskId === "cleaning";

  if (
    management.cleaningActions === 0 &&
    management.customersServed >= 4 &&
    !janaMaintainsCleaning
  ) {
    resources = { ...resources, stress: clampMeter(resources.stress + 3) };
    management = { ...management, noCleaningStressApplied: true };
  }

  if (resources.cleanliness >= 70) {
    resources = { ...resources, reputation: clampMeter(resources.reputation + 1) };
    flavorLines.push("The café closed with a cozy impression. Ruf +1.");
  } else if (resources.cleanliness < 25) {
    resources = { ...resources, reputation: clampMeter(resources.reputation - 2) };
    flavorLines.push("A guest mentioned the tables with professional restraint. Ruf -2.");
  } else if (resources.cleanliness < 40) {
    resources = { ...resources, reputation: clampMeter(resources.reputation - 1) };
    flavorLines.push("The room felt a little neglected by closing time. Ruf -1.");
  }

  if (management.customersServed < 4) {
    resources = { ...resources, stress: clampMeter(resources.stress - 10) };
    flavorLines.push("Slow day. The quiet helped. Stress -10.");
  }

  if (
    state.helperAssignment?.helperId === "jana" &&
    state.helperAssignment.taskId === "cleaning" &&
    resources.cleanliness < 45
  ) {
    resources = { ...resources, cleanliness: 45 };
    flavorLines.push(state.helperAssignment.flavorLine);
  } else if (state.helperAssignment) {
    flavorLines.push(state.helperAssignment.flavorLine);
  }

  const stressEvent = getStressEvent(resources.stress, state.stressEventLog.length);

  if (stressEvent && resources.stress >= 81) {
    resources = { ...resources, money: clampResource(resources.money - 5) };
    management = { ...management, moneySpent: clampResource(management.moneySpent + 5) };
  }

  if (stressEvent) {
    flavorLines.push(stressEvent);
  }

  return {
    ...state,
    resources: {
      ...resources,
      mood: resources.stress >= 61 ? "strained" : resources.stress >= 41 ? "busy" : "calm"
    },
    dayManagement: management,
    daySummary: {
      day: state.day,
      rating: getDayShiftRating({ ...state, resources, dayManagement: management }),
      moneyEarned: management.moneyEarned,
      moneySpent: management.moneySpent,
      customersServed: management.customersServed,
      suppliesUsed: { ...management.suppliesUsed },
      suppliesRestocked: { coffee: 0, milk: 0, pastries: 0 },
      suppliesRemaining: { ...state.supplies },
      cleanlinessLabel: getCleanlinessLabel(resources.cleanliness),
      stressLabel: getStressLabel(resources.stress),
      reputationDelta: resources.reputation - management.reputationAtStart,
      objectiveTitle: getObjectiveStatus(state).objective.title,
      objectiveCompleted: false,
      helperRecap: state.helperAssignment ? getHelperLabel(state.helperAssignment) : null,
      stressEvent,
      flavorLines
    },
    stressEventLog: stressEvent
      ? [...state.stressEventLog, stressEvent]
      : [...state.stressEventLog]
  };
}

function setSupplyPurchase(
  state: GameState,
  ingredient: IngredientKey,
  quantity: number
): GameState {
  if (state.dayPhase !== "day_end" || state.demoComplete) {
    return {
      ...state,
      statusMessage: "Supply purchases are available after closing, before tomorrow starts."
    };
  }

  const maxAllowed = SUPPLY_CAPS[ingredient] - state.supplies[ingredient];

  return {
    ...state,
    pendingSupplyPurchase: {
      ...state.pendingSupplyPurchase,
      [ingredient]: Math.min(maxAllowed, Math.max(0, Math.floor(quantity)))
    }
  };
}

function confirmSupplyPurchase(state: GameState): GameState {
  if (state.dayPhase !== "day_end") {
    return {
      ...state,
      statusMessage: "There are no day-end purchases to confirm right now."
    };
  }

  if (state.demoComplete) {
    return state;
  }

  const purchaseCost = getPurchaseCost(state.pendingSupplyPurchase);

  if (purchaseCost > state.resources.money) {
    return {
      ...state,
      statusMessage: "Not enough money for that restock plan. Reduce the quantities first."
    };
  }

  const nextDay = (state.day + 1) as DayNumber;
  const nextDayDefinition = getCurrentDayDefinition({ ...state, day: nextDay });
  const supplies = applySupplyPurchase(state.supplies, state.pendingSupplyPurchase);
  const restedStress = clampMeter(state.resources.stress - 20);
  const nextResources = {
    ...state.resources,
    money: clampResource(state.resources.money - purchaseCost),
    stress: restedStress,
    mood: getMoodForStress(restedStress)
  };

  return {
    ...state,
    day: nextDay,
    dayPhase: nextDay >= 5 ? "day_start" : "open",
    phaseLabel: nextDayDefinition.title,
    completedActions: [],
    supplies,
    pendingSupplyPurchase: { coffee: 0, milk: 0, pastries: 0 },
    helperAssignment: null,
    dayManagement: createInitialDayManagement(nextResources.reputation, nextDay),
    daySummary: null,
    kassandraInstalled: nextDay >= 6,
    unlocks: getUnlocksForDay(nextDay),
    resources: nextResources,
    statusMessage:
      nextDay >= 5
        ? `Restock confirmed. Day ${nextDay} begins with helper choices available.`
        : `Restock confirmed. Day ${nextDay} begins: ${nextDayDefinition.milestone}`
  };
}

function applyEmptySupplyStress(
  state: GameState,
  missingIngredients: readonly IngredientKey[]
): GameState {
  let resources = { ...state.resources };
  let emptySupplyStressIngredients = [
    ...state.dayManagement.emptySupplyStressIngredients
  ];

  for (const ingredient of missingIngredients) {
    if (!emptySupplyStressIngredients.includes(ingredient)) {
      resources = { ...resources, stress: clampMeter(resources.stress + 5) };
      emptySupplyStressIngredients = [...emptySupplyStressIngredients, ingredient];
    }
  }

  return {
    ...state,
    resources,
    dayManagement: {
      ...state.dayManagement,
      emptySupplyStressIngredients
    }
  };
}

function hasRequiredActions(state: GameState): boolean {
  return (
    state.dayManagement.customersServed > 0 &&
    state.completedActions.includes("take_order") &&
    (state.completedActions.includes("clean_tables") ||
      (state.helperAssignment?.helperId === "jana" &&
        state.helperAssignment.taskId === "cleaning"))
  );
}

function spendActionPoint(state: GameState, actionLabel: string): GameState | null {
  if (state.dayManagement.actionPointsRemaining <= 0) {
    return null;
  }

  return {
    ...state,
    dayManagement: {
      ...state.dayManagement,
      actionPointsRemaining: Math.max(
        0,
        state.dayManagement.actionPointsRemaining - 1
      ),
      actionPointsSpent: state.dayManagement.actionPointsSpent + 1
    },
    statusMessage: `Action used to ${actionLabel}.`
  };
}

function noActionCapacityState(state: GameState): GameState {
  return {
    ...state,
    dayManagement: {
      ...state.dayManagement,
      actionPointsRemaining: Math.max(0, state.dayManagement.actionPointsRemaining)
    },
    statusMessage:
      "No action capacity left today. Close the café or reset if you want to try the day differently."
  };
}

function applyCapacityStress(stress: number, customersServedBeforeOrder: number, day: DayNumber): number {
  const capacity = COMFORTABLE_CAPACITY_BY_DAY[day];

  return customersServedBeforeOrder >= capacity ? clampMeter(stress + 8) : stress;
}

function getMoodForStress(stress: number): ResourceState["mood"] {
  return stress >= 61 ? "strained" : stress >= 41 ? "busy" : "calm";
}

function getHelperExtraOrders(state: GameState): number {
  if (!state.helperAssignment) {
    return 0;
  }

  if (state.helperAssignment.taskId === "service" || state.helperAssignment.taskId === "counter") {
    return 1;
  }

  if (state.helperAssignment.helperId === "mira" && state.helperAssignment.taskId === "marketing") {
    return 1;
  }

  return 0;
}

function getStressEvent(stress: number, eventCount: number): string | null {
  if (stress < 61) {
    return null;
  }

  return MUNDANE_STRESS_EVENT_LINES[eventCount % MUNDANE_STRESS_EVENT_LINES.length];
}

function getPurchaseCost(purchase: SupplyState): number {
  return clampResource(
    purchase.coffee * SUPPLY_UNIT_COSTS.coffee +
      purchase.milk * SUPPLY_UNIT_COSTS.milk +
      purchase.pastries * SUPPLY_UNIT_COSTS.pastries
  );
}

function applySupplyPurchase(supplies: SupplyState, purchase: SupplyState): SupplyState {
  return {
    coffee: clampSupply("coffee", supplies.coffee + purchase.coffee),
    milk: clampSupply("milk", supplies.milk + purchase.milk),
    pastries: clampSupply("pastries", supplies.pastries + purchase.pastries)
  };
}

function getSuppliesUsedForProduct(
  product: ReturnType<typeof getProductById>,
  assignment: GameState["helperAssignment"]
): SupplyState {
  return {
    coffee: getIngredientRequirement(product, "coffee", assignment),
    milk: getIngredientRequirement(product, "milk", assignment),
    pastries: getIngredientRequirement(product, "pastries", assignment)
  };
}

function addSupplies(current: SupplyState, added: SupplyState): SupplyState {
  return {
    coffee: current.coffee + added.coffee,
    milk: current.milk + added.milk,
    pastries: current.pastries + added.pastries
  };
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

function formatMissingSupply(ingredients: readonly IngredientKey[]): string {
  const labels: Record<IngredientKey, string> = {
    coffee: "No coffee",
    milk: "No milk",
    pastries: "No pastries"
  };

  return ingredients.map((ingredient) => labels[ingredient]).join(". ") + ".";
}
