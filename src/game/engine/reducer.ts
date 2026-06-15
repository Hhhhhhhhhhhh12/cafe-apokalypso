import {
  addUniqueAchievementIds,
  addUniqueDayAction,
  addUniqueEventIds,
  addUniqueGuestIds,
  createInitialGameState
} from "./gameState";
import { weekOneAchievements } from "../data";
import { getDecorDailyBonuses, getDecorTier, getMaxDecorTier } from "../data/decor";
import {
  getCurrentDayDefinition,
  getCurrentDayModifier,
  getGuestForCustomer,
  getKassandraConsultLine,
  getServeLineForCustomer
} from "./selectors";
import { getObjectiveStatus } from "./objectives";
import {
  applyProductConsumption,
  clampMeter,
  clampResource,
  clampSupply,
  COMFORTABLE_CAPACITY_BY_DAY,
  createHelperAssignment,
  createInitialDayManagement,
  DAILY_FIXED_COST,
  findSubstituteProduct,
  getDayShiftRating,
  getEmployeeLevel,
  getEmployeeLevelBonuses,
  getIngredientRequirement,
  getCleanlinessLabel,
  getDefaultProductForState,
  getEarnedPrice,
  getHelperLabel,
  getMissingIngredients,
  getProductById,
  getStressLabel,
  MUNDANE_STRESS_EVENT_LINES,
  SUPPLY_CAPS,
  SUPPLY_UNIT_COSTS
} from "./management";
import type {
  AchievementId,
  DayNumber,
  GuestDefinition,
  GuestId,
  ProductId,
  StaffOptionId
} from "../types/content";
import type {
  DecorSlotId,
  GameAction,
  GameState,
  GuestMemoryEntry,
  HelperTaskId,
  IngredientKey,
  ResourceState,
  SupplyState
} from "../types/game";

const FLYER_COST = 2;
const SOCIAL_AD_COST = 5;

/** Max guest-appreciation reputation points awarded per day (keeps it a light nudge). */
const APPRECIATION_DAILY_CAP = 4;

export function gameReducer(state: GameState, action: GameAction): GameState {
  if (state.cafeClosed && action.type !== "reset_game") {
    return {
      ...state,
      statusMessage: "The café has closed. Reset to start over."
    };
  }

  const nextState = applyAction(state, action);

  if (action.type === "reset_game") {
    return nextState;
  }

  // Immediate fail-state: an empty till means the café can no longer operate.
  return applyImmediateClosure(nextState);
}

/**
 * Immediate (per-action) fail-state check. Money is clamped at 0, so "<= 0"
 * means the till has hit zero. Reputation uses a 2-day grace period handled at
 * day end (see completeCurrentDay), not here.
 */
function applyImmediateClosure(state: GameState): GameState {
  if (state.cafeClosed) {
    return state;
  }

  if (state.resources.money <= 0) {
    return {
      ...state,
      cafeClosed: true,
      closureReason: "money",
      statusMessage:
        "The till is empty. With no money to operate, the café closes its doors."
    };
  }

  return state;
}

function applyAction(state: GameState, action: GameAction): GameState {
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
      return runAdvertising(state, action.adType ?? "flyer");

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

    case "upgrade_decor":
      return upgradeDecor(state, action.slot);

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
        statusMessage: `${formatMissingSupply(missingIngredients)} The guest pauses, then orders nothing. Rep −1.`
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
      )} ${requestedProduct.name} becomes ${substitute.name}. The guest accepts this. Rep −1.`
    };
  }

  // applySuccessfulServe already sets the status message to the served guest's
  // narrative serve line (plus any helper flavor note).
  return applySuccessfulServe(actionState, requestedProduct);
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
  let guestMemory = { ...state.guestMemory };
  const flavorLines: string[] = [];

  for (let index = 0; index < servedWithHelper; index += 1) {
    const servedGuest = getGuestForCustomer(workingState, management.customersServed);
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
    // Income scales with reputation; offer review adds a 10 % daily boost.
    const offerMultiplier = workingState.dayManagement.offerReviewed ? 1.1 : 1;
    const earned = getEarnedPrice(product.basePrice * offerMultiplier, resources.reputation);
    resources = {
      ...resources,
      money: clampResource(resources.money + earned),
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
      moneyEarned: clampResource(management.moneyEarned + earned),
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

    const modifierResult = applyServeModifier(
      workingState,
      servedGuest,
      product,
      resources
    );
    resources = modifierResult.resources;
    if (modifierResult.line) {
      flavorLines.push(modifierResult.line);
    }

    const memoryResult = rememberServedGuest(guestMemory, servedGuest, product);
    guestMemory = memoryResult.guestMemory;
    if (memoryResult.line) {
      flavorLines.push(memoryResult.line);
    }
  }

  if (management.helperExtraOrdersRemaining > 0) {
    management = {
      ...management,
      helperExtraOrdersRemaining: Math.max(0, management.helperExtraOrdersRemaining - 1)
    };
  }

  const servedCustomerIndex = Math.max(0, management.customersServed - 1);
  const serveLine = getServeLineForCustomer(workingState, servedCustomerIndex);

  // Guest appreciation (#56): a guest who values the product just served gives a
  // reputation bump that scales with the product's craft quality — a premium
  // (tier-3) drink earns more than a standard one. The bonus is capped per day.
  // A wrong choice for a picky guest only adds a gentle letdown line — no penalty.
  const servedGuest = getGuestForCustomer(workingState, servedCustomerIndex);
  const guestPreferences = servedGuest?.appreciatedProductIds ?? [];
  const appreciates = guestPreferences.includes(product.id);
  const matchesSoftPreference = servedGuest?.preferredProductId === product.id;
  let appreciationLine = "";

  if (appreciates) {
    const qualityTier = product.qualityTier ?? 1;
    const fullBonus = 1 + Math.max(0, qualityTier - 2); // standard/good +1, premium +2
    const remainingCap = APPRECIATION_DAILY_CAP - management.appreciationBonusesGiven;
    const bonus = Math.min(fullBonus, Math.max(0, remainingCap));

    if (bonus > 0) {
      resources = { ...resources, reputation: clampMeter(resources.reputation + bonus) };
      management = {
        ...management,
        appreciationBonusesGiven: management.appreciationBonusesGiven + bonus
      };
      appreciationLine = servedGuest?.delightLine ?? "";
    }
  } else if (matchesSoftPreference) {
    appreciationLine = servedGuest?.matchedPreferenceLine ?? "";
  } else if (guestPreferences.length > 0) {
    appreciationLine = servedGuest?.letdownLine ?? "";
  } else if (servedGuest?.preferredProductId) {
    appreciationLine = servedGuest.missedPreferenceLine ?? "";
  }

  const statusParts = [serveLine, appreciationLine, ...flavorLines].filter(
    (part) => part.length > 0
  );

  return {
    ...workingState,
    supplies,
    resources: {
      ...resources,
      mood: resources.stress >= 61 ? "strained" : resources.stress >= 41 ? "busy" : "calm"
    },
    guestMemory,
    dayManagement: management,
    completedActions: addUniqueDayAction(workingState.completedActions, "take_order"),
    statusMessage: statusParts.join(" ")
  };
}

function applyServeModifier(
  state: GameState,
  guest: GuestDefinition | undefined,
  product: ReturnType<typeof getProductById>,
  resources: ResourceState
): { resources: ResourceState; line: string | null } {
  const modifier = getCurrentDayModifier(state);

  if (modifier.id !== "commuter-wave" || !guest) {
    return { resources, line: null };
  }

  const isFastGuest = guest.behaviorTags.some((tag) =>
    ["fast", "impatient", "quick-service", "low-seat-time"].includes(tag)
  );
  const expectedProductId = guest.preferredProductId ?? guest.appreciatedProductIds?.[0];

  if (!isFastGuest || !expectedProductId) {
    return { resources, line: null };
  }

  if (product.id === expectedProductId) {
    return {
      resources: { ...resources, stress: clampMeter(resources.stress - 2) },
      line: "The commuter rhythm clicks into place. Stress -2."
    };
  }

  return {
    resources: { ...resources, stress: clampMeter(resources.stress + 2) },
    line: "The order is fine, but the queue loses a little rhythm. Stress +2."
  };
}

function rememberServedGuest(
  guestMemory: Partial<Record<GuestId, GuestMemoryEntry>>,
  guest: GuestDefinition | undefined,
  product: ReturnType<typeof getProductById>
): {
  guestMemory: Partial<Record<GuestId, GuestMemoryEntry>>;
  line: string | null;
} {
  if (!guest) {
    return { guestMemory, line: null };
  }

  const previous = guestMemory[guest.id] ?? {
    visits: 0,
    matchedPreferences: 0
  };
  const appreciatedProductIds = guest.appreciatedProductIds ?? [];
  const matchedPreference =
    guest.preferredProductId === product.id || appreciatedProductIds.includes(product.id);
  const knownPreferenceId =
    previous.knownPreferenceId ?? (matchedPreference ? product.id : undefined);
  const nextMemory: GuestMemoryEntry = {
    visits: previous.visits + 1,
    matchedPreferences: previous.matchedPreferences + (matchedPreference ? 1 : 0),
    lastServedProductId: product.id,
    knownPreferenceId
  };
  const learnedLine =
    matchedPreference && !previous.knownPreferenceId
      ? `You write it down: ${guest.name} tends toward ${product.name}.`
      : null;

  return {
    guestMemory: {
      ...guestMemory,
      [guest.id]: nextMemory
    },
    line: learnedLine
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

  const modifier = getCurrentDayModifier(actionState);
  const firstSupplyCheck = !state.completedActions.includes("check_supplies");
  const allSuppliesAvailable = (Object.keys(SUPPLY_CAPS) as IngredientKey[]).every(
    (ingredient) => actionState.supplies[ingredient] > 0
  );
  const auditBonusApplies =
    modifier.id === "inventory-audit" && firstSupplyCheck && allSuppliesAvailable;

  return {
    ...actionState,
    completedActions: addUniqueDayAction(
      actionState.completedActions,
      "check_supplies"
    ),
    resources: auditBonusApplies
      ? {
          ...actionState.resources,
          reputation: clampMeter(actionState.resources.reputation + 1)
        }
      : actionState.resources,
    statusMessage: `Supply check: coffee ${actionState.supplies.coffee}/${SUPPLY_CAPS.coffee}, milk ${actionState.supplies.milk}/${SUPPLY_CAPS.milk}, pastries ${actionState.supplies.pastries}/${SUPPLY_CAPS.pastries}.`
      + (auditBonusApplies ? " The tidy shelf calms the offer board. Ruf +1." : "")
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
    resources: {
      ...actionState.resources,
      reputation: clampMeter(actionState.resources.reputation + 1)
    },
    dayManagement: {
      ...actionState.dayManagement,
      offerReviewed: true
    },
    statusMessage:
      "Offer board reviewed. All orders today earn 10 % more than base price. Rep +1."
  };
}

function runAdvertising(state: GameState, adType: "flyer" | "social"): GameState {
  if (!state.unlocks.advertising || state.day < 4) {
    return { ...state, statusMessage: "Local advertising unlocks on Day 4." };
  }

  if (adType === "social" && state.day < 5) {
    return { ...state, statusMessage: "Social media posts unlock on Day 5." };
  }

  if (adType === "flyer" && state.dayManagement.advertisingRun) {
    return { ...state, statusMessage: "A flyer has already gone out today." };
  }

  if (adType === "social" && state.dayManagement.socialAdRun) {
    return { ...state, statusMessage: "A social post has already gone out today." };
  }

  if (state.dayPhase !== "open") {
    return { ...state, statusMessage: "Advertising choices belong to the open café day." };
  }

  const cost = adType === "social" ? SOCIAL_AD_COST : FLYER_COST;

  if (state.resources.money < cost) {
    return {
      ...state,
      statusMessage:
        adType === "social"
          ? `Not enough money for a social post (€${SOCIAL_AD_COST}).`
          : "The café cannot afford a flyer today."
    };
  }

  const hasBonusAdvertisingAction = adType === "flyer" && state.dayManagement.extraAdvertisingActions > 0;
  const actionState = hasBonusAdvertisingAction
    ? {
        ...state,
        dayManagement: {
          ...state.dayManagement,
          extraAdvertisingActions: state.dayManagement.extraAdvertisingActions - 1
        }
      }
    : spendActionPoint(state, adType === "social" ? "post on social media" : "run a local flyer");

  if (!actionState) {
    return noActionCapacityState(state);
  }

  const posterEchoApplies =
    adType === "flyer" &&
    getCurrentDayModifier(actionState).id === "poster-echo" &&
    !state.dayManagement.advertisingRun;

  const baseRepGain = adType === "social" ? 3 : 1;
  const reputationGain = posterEchoApplies ? baseRepGain + 1 : baseRepGain;
  const stressGain = posterEchoApplies ? 2 : 0;

  return {
    ...actionState,
    completedActions: addUniqueDayAction(actionState.completedActions, "run_advertising"),
    resources: {
      ...actionState.resources,
      money: clampResource(actionState.resources.money - cost),
      reputation: clampMeter(actionState.resources.reputation + reputationGain),
      stress: clampMeter(actionState.resources.stress + stressGain),
      mood: getMoodForStress(clampMeter(actionState.resources.stress + stressGain))
    },
    dayManagement: {
      ...actionState.dayManagement,
      moneySpent: clampResource(actionState.dayManagement.moneySpent + cost),
      advertisingRun: adType === "flyer" ? true : actionState.dayManagement.advertisingRun,
      socialAdRun: adType === "social" ? true : actionState.dayManagement.socialAdRun
    },
    statusMessage:
      adType === "social"
        ? `Social post out. €${SOCIAL_AD_COST} spent — wider reach, stronger signal. Rep +3. Guests who find you this way may linger longer.`
        : posterEchoApplies
          ? `Flyer out, and today's modifier makes it land harder than usual. €${FLYER_COST} spent. Rep +2. The extra attention adds a little pressure. Stress +2.`
          : `Flyer out in the neighbourhood. €${FLYER_COST} spent. Rep +1. Expect a modest uptick in foot traffic.`
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

  const earlyForecastRefund =
    getCurrentDayModifier(actionState).id === "forecast-static" &&
    !state.dayManagement.kassandraConsulted &&
    state.dayManagement.customersServed === 0;

  return {
    ...actionState,
    completedActions: addUniqueDayAction(
      actionState.completedActions,
      "consult_kassandra"
    ),
    dayManagement: {
      ...actionState.dayManagement,
      actionPointsRemaining: earlyForecastRefund
        ? actionState.dayManagement.actionPointsRemaining + 1
        : actionState.dayManagement.actionPointsRemaining,
      actionPointsSpent: earlyForecastRefund
        ? Math.max(0, actionState.dayManagement.actionPointsSpent - 1)
        : actionState.dayManagement.actionPointsSpent,
      kassandraConsulted: true
    },
    statusMessage: `KASSANDRA: ${getKassandraConsultLine(actionState)}${
      earlyForecastRefund ? " Early forecast logged. Action refunded." : ""
    }`
  };
}

function selectHelper(
  state: GameState,
  helperId: StaffOptionId,
  taskId: HelperTaskId
): GameState {
  if (state.day < 3 || !state.unlocks.staff) {
    return {
      ...state,
      statusMessage: "Temporary help starts on Day 3."
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
  const helperXp = state.helperAssignment
    ? (state.staffXp[state.helperAssignment.helperId] ?? 0)
    : 0;
  const helperLevel = state.helperAssignment ? getEmployeeLevel(helperXp) : 1;
  const levelBonuses = state.helperAssignment ? getEmployeeLevelBonuses(helperLevel) : { extraAP: 0, tipBonus: 0 };
  const management = {
    ...state.dayManagement,
    moneySpent: state.dayManagement.moneySpent + (state.helperAssignment?.dailyCost ?? 0),
    helperExtraOrdersRemaining: getHelperExtraOrders(state),
    extraAdvertisingActions:
      state.helperAssignment?.helperId === "nele" &&
      state.helperAssignment.taskId === "marketing"
        ? 1
        : 0,
    helperDecisionMade: true,
    actionPointsRemaining: state.dayManagement.actionPointsRemaining + levelBonuses.extraAP
  };

  if (state.helperAssignment) {
    resources = {
      ...resources,
      money: clampResource(resources.money - state.helperAssignment.dailyCost)
    };

    if (state.helperAssignment.helperId === "nino" && state.helperAssignment.taskId === "counter") {
      resources = { ...resources, stress: clampMeter(resources.stress - 8) };
    }
    if (state.helperAssignment.helperId === "nele" && state.helperAssignment.taskId === "counter") {
      resources = { ...resources, stress: clampMeter(resources.stress - 5) };
    }
  }

  // Décor daily bonuses: nicer furniture keeps the place feeling cared-for.
  const decorBonuses = getDecorDailyBonuses(state.decor);
  if (decorBonuses.cleanliness > 0 || decorBonuses.reputation > 0) {
    resources = {
      ...resources,
      cleanliness: clampMeter(resources.cleanliness + decorBonuses.cleanliness),
      reputation: clampMeter(resources.reputation + decorBonuses.reputation)
    };
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
        "Serve at least one customer before closing the day."
    };
  }

  const currentDay = getCurrentDayDefinition(state);
  const nextHistoryState = {
    guestHistory: addUniqueGuestIds(state.guestHistory, currentDay.guestIds),
    eventHistory: addUniqueEventIds(state.eventHistory, currentDay.eventIds),
    unlockedAchievements: addUniqueAchievementIds(
      state.unlockedAchievements,
      getAchievementIdsForState(state)
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
  const memoryFragments = getRunMemoryFragments(closedState, objectiveResult.status);

  // Reputation fail-state with a 2-day grace period: one day at zero is a
  // warning; a second consecutive day at zero closes the café.
  const reputationAtZero = closedState.resources.reputation <= 0;
  const reputationZeroStreak = reputationAtZero ? state.reputationZeroStreak + 1 : 0;
  const closeForReputation = reputationZeroStreak >= 2;

  const closingMessage = closeForReputation
    ? "A second day with no standing left in the neighbourhood. The café quietly closes."
    : daySevenClose
      ? "Day 7 closed. An official letter has arrived. Something is wrong with this café."
      : reputationAtZero
        ? `Day ${state.day} closed. Reputation has bottomed out — one more day like this and the café closes.`
        : `Day ${state.day} closed. Review the summary, then buy supplies for tomorrow.`;

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
    run: {
      ...closedState.run,
      memoryFragments: addUniqueStrings(closedState.run.memoryFragments, memoryFragments)
    },
    demoComplete: daySevenClose,
    weirdnessVisible: daySevenClose ? true : false,
    reputationZeroStreak,
    cafeClosed: closeForReputation,
    closureReason: closeForReputation ? "reputation" : closedState.closureReason,
    hiddenWeirdness: daySevenClose
      ? closedState.hiddenWeirdness + 7
      : closedState.hiddenWeirdness + closedState.day,
    statusMessage: closingMessage
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

  // From Day 4, running the floor without a hired helper is noticeably harder.
  // Helpers can be hired from Day 3 (and cost money) — skipping them trades
  // money saved for a steeper end-of-day stress hit.
  if (state.day >= 4 && !state.helperAssignment) {
    resources = { ...resources, stress: clampMeter(resources.stress + 10) };
    flavorLines.push("You ran the whole floor alone again. Helpers unlock Day 3 — hiring one trades daily cost for less end-of-day strain. Stress +10.");
  }

  if (resources.cleanliness >= 70) {
    resources = { ...resources, reputation: clampMeter(resources.reputation + 1) };
    flavorLines.push("The café closed in good order. Guests noticed. Ruf +1.");
  } else if (resources.cleanliness < 25) {
    resources = { ...resources, reputation: clampMeter(resources.reputation - 2) };
    flavorLines.push("A guest mentioned the tables with professional restraint. Clean during the shift to stay above 25. Ruf -2.");
  } else if (resources.cleanliness < 40) {
    resources = { ...resources, reputation: clampMeter(resources.reputation - 1) };
    flavorLines.push("The room felt a little neglected by closing time. Ruf -1.");
  }

  if (getCurrentDayModifier(state).id === "inspection-pressure") {
    if (resources.cleanliness >= 70) {
      resources = { ...resources, reputation: clampMeter(resources.reputation + 1) };
      flavorLines.push("Inspection day: clean closing rewarded. Ruf +1.");
    } else if (resources.cleanliness < 40) {
      resources = { ...resources, reputation: clampMeter(resources.reputation - 1) };
      flavorLines.push("Inspection day: the neglected corners were noted. Ruf -1.");
    }
  }

  if (management.customersServed < 4) {
    resources = { ...resources, stress: clampMeter(resources.stress - 10) };
    flavorLines.push("Quiet day — fewer than four customers. The slower pace kept stress down. Stress -10.");
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

  // Employee XP and level bonuses.
  let staffXp = { ...state.staffXp };
  if (state.helperAssignment && management.customersServed > 0) {
    const helperId = state.helperAssignment.helperId;
    const prevXp = staffXp[helperId] ?? 0;
    const xpGained = management.customersServed;
    const newXp = prevXp + xpGained;
    staffXp = { ...staffXp, [helperId]: newXp };

    const prevLevel = getEmployeeLevel(prevXp);
    const newLevel = getEmployeeLevel(newXp);
    if (newLevel > prevLevel) {
      const helperName = state.helperAssignment.helperId.charAt(0).toUpperCase() + state.helperAssignment.helperId.slice(1);
      const levelBenefits: Record<number, string> = {
        2: "unlocks +1 action point per day",
        3: "unlocks tip bonus (5 % of daily earnings)"
      };
      const benefit = levelBenefits[newLevel] ?? "new level";
      flavorLines.push(`${helperName} reached Level ${newLevel} — ${benefit}.`);
    }

    const tipBonusRate = getEmployeeLevelBonuses(getEmployeeLevel(prevXp)).tipBonus;
    if (tipBonusRate > 0) {
      const tipBonus = clampResource(management.moneyEarned * tipBonusRate);
      resources = { ...resources, money: clampResource(resources.money + tipBonus) };
      management = { ...management, moneyEarned: clampResource(management.moneyEarned + tipBonus) };
      flavorLines.push(`Tip bonus (Level 3, 5 % of earnings): +€${tipBonus.toFixed(2)}.`);
    }
  }

  // Fixed daily overhead — rent, utilities, baseline costs every café day.
  resources = { ...resources, money: clampResource(resources.money - DAILY_FIXED_COST) };
  flavorLines.push(`Tageskosten (Miete, Betrieb): -€${DAILY_FIXED_COST}.`);

  const stressEvent = getStressEvent(resources.stress, state.stressEventLog.length);

  if (stressEvent && resources.stress >= 81) {
    resources = { ...resources, money: clampResource(resources.money - 5) };
    management = { ...management, moneySpent: clampResource(management.moneySpent + 5) };
  }

  if (stressEvent) {
    flavorLines.push(stressEvent);
  }

  const dailyOverhead = DAILY_FIXED_COST;

  return {
    ...state,
    staffXp,
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
      dailyOverhead,
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
    dayPhase: nextDay >= 3 ? "day_start" : "open",
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
      nextDay >= 3
        ? `Restock confirmed. Day ${nextDay} begins with helper choices available.`
        : `Restock confirmed. Day ${nextDay} begins: ${nextDayDefinition.milestone}`
  };
}

function upgradeDecor(state: GameState, slot: DecorSlotId): GameState {
  if (state.demoComplete) {
    return state;
  }

  if (state.dayPhase !== "day_end") {
    return {
      ...state,
      statusMessage: "Café upgrades are chosen after closing, while reviewing the day."
    };
  }

  const nextTier = state.decor[slot] + 1;
  const tierDefinition = getDecorTier(slot, nextTier);

  if (!tierDefinition || state.decor[slot] >= getMaxDecorTier(slot)) {
    return {
      ...state,
      statusMessage: "That corner of the café is already as nice as it gets."
    };
  }

  if (tierDefinition.cost > state.resources.money) {
    return {
      ...state,
      statusMessage: `Not enough money for ${tierDefinition.name} (€${tierDefinition.cost}).`
    };
  }

  return {
    ...state,
    decor: { ...state.decor, [slot]: nextTier },
    resources: {
      ...state.resources,
      money: clampResource(state.resources.money - tierDefinition.cost),
      reputation: clampMeter(state.resources.reputation + tierDefinition.reputationBonus)
    },
    dayManagement: {
      ...state.dayManagement,
      moneySpent: clampResource(state.dayManagement.moneySpent + tierDefinition.cost)
    },
    statusMessage:
      tierDefinition.reputationBonus > 0
        ? `New look: ${tierDefinition.name}. The café feels a little warmer. Rep +${tierDefinition.reputationBonus}.`
        : `New look: ${tierDefinition.name}.`
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
  // When all action points are spent, the day can always be closed — prevents soft-locks
  // (depleted supplies, no cleaning, etc.). Missing tasks apply penalties at day end.
  if (state.dayManagement.actionPointsRemaining <= 0) {
    return true;
  }
  // While actions remain, require at least one served customer.
  return (
    state.dayManagement.customersServed > 0 &&
    state.completedActions.includes("take_order")
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

  if (state.helperAssignment.helperId === "nele" && state.helperAssignment.taskId === "marketing") {
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
    staff: day >= 3,
    kassandra: day >= 6,
    apocalypseOperations: false
  };
}

function getAchievementIdsForState(state: GameState): AchievementId[] {
  return weekOneAchievements
    .filter(
      (achievement) =>
        achievement.unlockDay <= state.day && isAchievementEarned(achievement.id, state)
    )
    .map((achievement) => achievement.id);
}

function isAchievementEarned(id: AchievementId, state: GameState): boolean {
  switch (id) {
    case "first-order":
      return state.dayManagement.customersServed > 0;
    case "clean-counter":
      return (
        state.day === 1 &&
        (state.completedActions.includes("clean_tables") ||
          state.dayManagement.cleaningActions > 0)
      );
    case "regular-recognized":
      return state.day >= 2 && state.dayManagement.customersServed > 0;
    case "first-ad":
      return state.dayManagement.advertisingRun;
    case "first-helper":
      return Boolean(state.helperAssignment);
    case "kassandra-installed":
      return state.kassandraInstalled || state.unlocks.kassandra;
    case "week-one-letter":
      return state.day === 7;
    default:
      return false;
  }
}

function getRunMemoryFragments(
  state: GameState,
  objectiveStatus: "completed" | "missed"
): string[] {
  const fragments = [`day-${state.day}-objective-${objectiveStatus}`];
  const knownPreferenceCount = Object.values(state.guestMemory).filter(
    (entry) => entry?.knownPreferenceId
  ).length;

  if (knownPreferenceCount >= 2) {
    fragments.push("guest-preference-ledger");
  }

  if (state.dayManagement.advertisingRun) {
    fragments.push("advertising-pattern-logged");
  }

  if (state.helperAssignment) {
    fragments.push("delegation-pattern-logged");
  }

  if (state.day === 7) {
    fragments.push("office-letter-arrived");
  }

  return fragments;
}

function addUniqueStrings(current: readonly string[], additions: readonly string[]): string[] {
  const result = [...current];

  for (const addition of additions) {
    if (!result.includes(addition)) {
      result.push(addition);
    }
  }

  return result;
}

function formatMissingSupply(ingredients: readonly IngredientKey[]): string {
  const labels: Record<IngredientKey, string> = {
    coffee: "No coffee",
    milk: "No milk",
    pastries: "No pastries"
  };

  return ingredients.map((ingredient) => labels[ingredient]).join(". ") + ".";
}
