import {
  addUniqueAchievementIds,
  addUniqueDayAction,
  addUniqueEventIds,
  addUniqueGuestIds,
  createFreshRunState
} from "./gameState";
import { weekOneAchievements, weekOneDays, weekOneEvents, weekOneUpgrades } from "../data";
import { DAY_ONE_FATOU_SERVED_FRAGMENT } from "../data/days";
import { getDecorDailyBonuses, getDecorTier, getMaxDecorTier } from "../data/decor";
import {
  getEquipmentDailyBonuses,
  getEquipmentTier,
  getMaxEquipmentTier
} from "../data/equipment";
import {
  getAvailableProducts,
  getCurrentDayDefinition,
  getCurrentDayModifier,
  getGuestForCustomer,
  getGuestWantedProductId,
  getIngredientLabel,
  getKassandraConsultLine,
  getMoneyRecoveryWarning,
  getServedGuestIds,
  getServeLineForCustomer
} from "./selectors";
import { getObjectiveStatus } from "./objectives";
import { formatAsche, roundAscheEarnings } from "./currency";
import {
  getDayFiveHelperRecap,
  getHelperAutonomyRecapLine,
  applyProductConsumption,
  canJanaClearTable,
  clampMeter,
  clampResource,
  clampSupply,
  COMFORTABLE_CAPACITY_BY_DAY,
  createHelperAssignment,
  createInitialDayManagement,
  DAILY_FIXED_COST,
  FLYER_COST,
  SOCIAL_AD_COST,
  findSubstituteProduct,
  getDayShiftRating,
  getEmployeeLevel,
  getEmployeeLevelBonuses,
  getIngredientRequirement,
  getCleanlinessLabel,
  getDefaultProductForState,
  getEarnedPrice,
  getHelperLabel,
  getHelperDailyCost,
  getGuestPatienceMax,
  getMissingIngredients,
  getProductById,
  getStressLabel,
  guestsCanWalkOut,
  MUNDANE_STRESS_EVENT_LINES,
  PATIENCE_TICK,
  SUPPLY_CAPS,
  SUPPLY_UNIT_COSTS,
  WALKOUT_REPUTATION_PENALTY,
  WALKOUT_STRESS
} from "./management";
import type {
  AchievementId,
  DayNumber,
  EventDefinition,
  EventId,
  GuestDefinition,
  GuestId,
  ProductId,
  StaffOptionId,
  UpgradeId
} from "../types/content";
import type {
  DecorSlotId,
  EquipmentSlotId,
  GameAction,
  GameState,
  GuestMemoryEntry,
  HelperTaskId,
  IngredientKey,
  ResourceState,
  SupplyState,
  TableId
} from "../types/game";


/** Max guest-appreciation reputation points awarded per day (keeps it a light nudge). */
const APPRECIATION_DAILY_CAP = 4;

/** Max decor atmosphere reputation bonuses awarded per day. */
const DECOR_ATMOSPHERE_DAILY_CAP = 2;

/** Flow streak: a tip lands at each odd milestone from 5 up to this streak length (5, 7, 9, 11). */
const FLOW_TIP_MAX_STREAK = 11;
/** Cash tip handed over at each flow milestone — small, warm, never game-breaking. */
const FLOW_TIP = 1;

/**
 * Flavor for the "flow" streak — consecutive orders that matched the guest's
 * preference. Lines escalate; the tipped ones name the coin that just landed.
 */
function getFlowLine(streak: number, tip: number): string {
  if (streak === 3) {
    return "Three orders, no missteps — your hands find the rhythm before your head does.";
  }
  if (streak === 5) {
    return `Five in a row. Cup, machine, timing — one motion now. A regular slides a coin across the counter. Tip +${formatAsche(tip)}.`;
  }
  if (streak === 7) {
    return `Seven straight. For a moment the café runs itself and you are just part of it. Tip +${formatAsche(tip)}.`;
  }
  if (tip > 0) {
    return `${streak} in flow. The counter hums and the tips keep landing. Tip +${formatAsche(tip)}.`;
  }
  return `${streak} in flow. The morning has a current and you are riding it.`;
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  if (state.cafeClosed && action.type !== "reset_game") {
    return {
      ...state,
      statusMessage: "The café has closed. Reset to start over."
    };
  }

  const nextState = appendActionFeedback(state, applyAction(state, action), action);

  if (action.type === "reset_game") {
    return nextState;
  }

  // Spending the last money after closing uses that closed day as the warning
  // day, including restock confirmation that immediately starts the next shift.
  const recoveryState =
    (state.dayPhase === "day_end" || nextState.dayPhase === "day_end") &&
    nextState.resources.money <= 0 &&
    nextState.moneyZeroStreak === 0 &&
    !nextState.cafeClosed &&
    !nextState.demoComplete
      ? { ...nextState, moneyZeroStreak: 1 }
      : nextState;

  const previousWarning = getMoneyRecoveryWarning(state);
  const warning = getMoneyRecoveryWarning(recoveryState);
  const statusMessage = previousWarning
    ? recoveryState.statusMessage.replace(previousWarning, "").trim()
    : recoveryState.statusMessage;

  return {
    ...recoveryState,
    statusMessage: warning && !statusMessage.includes(warning)
      ? [statusMessage, warning].filter(Boolean).join(" ")
      : statusMessage
  };
}

/** Describe actual totals, including caps, helper effects and substitutions. */
function appendActionFeedback(before: GameState, after: GameState, action: GameAction): GameState {
  const showsFeedback = action.type === "serve_product" || action.type === "take_order" ||
    action.type === "prepare_drink" || action.type === "clean_tables" || action.type === "clean_table";
  const actionsSpent = after.dayManagement.actionPointsSpent - before.dayManagement.actionPointsSpent;
  if (!showsFeedback || before.dayPhase !== "open" || actionsSpent <= 0) {
    return after;
  }

  const changes: string[] = [];
  const moneyDelta = Math.round((after.resources.money - before.resources.money) * 100) / 100;
  if (moneyDelta !== 0) {
    changes.push(`${moneyDelta > 0 ? "+" : "−"}${formatAsche(Math.abs(moneyDelta))}`);
  }
  for (const [key, label] of [
    ["cleanliness", "Cleanliness"], ["stress", "Stress"], ["reputation", "Rep"]
  ] as const) {
    const delta = after.resources[key] - before.resources[key];
    if (delta !== 0) changes.push(`${label} ${delta > 0 ? "+" : "−"}${Math.abs(delta)}`);
  }
  for (const [key, label] of [
    ["coffee", "Coffee"], ["milk", "Milk"], ["pastries", "Pastries"]
  ] as const) {
    const delta = after.supplies[key] - before.supplies[key];
    if (delta !== 0) changes.push(`${label} ${delta > 0 ? "+" : "−"}${Math.abs(delta)}`);
  }
  changes.push(`Actions −${actionsSpent}`);
  return { ...after, statusMessage: `${after.statusMessage} This action: ${changes.join(" · ")}.` };
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

    case "clean_table":
      return cleanTable(state, action.tableId);

    case "adjust_offer":
      return adjustOffer(state);

    case "run_advertising":
      return runAdvertising(state, action.adType ?? "flyer");

    case "consult_kassandra":
      return consultKassandra(state);

    case "select_helper":
      return selectHelper(state, action.helperId, action.taskId);

    case "clear_helper":
      return clearHelper(state);

    case "open_day":
      return openDay(state);

    case "complete_day":
      return completeCurrentDay(state);

    case "set_supply_purchase":
      return setSupplyPurchase(state, action.ingredient, action.quantity);

    case "confirm_supply_purchase":
      return confirmSupplyPurchase(state, action.withoutRestocking);

    case "upgrade_decor":
      return upgradeDecor(state, action.slot);

    case "buy_equipment":
      return buyEquipment(state, action.slot);

    case "buy_upgrade":
      return buyUpgrade(state, action.upgradeId);

    case "finish_setup":
      return finishSetup(state);

    case "reset_game":
      return action.freshState ?? createFreshRunState();

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
  const helperImpact = management.dayFiveHelperImpact && { ...management.dayFiveHelperImpact };

  for (let index = 0; index < servedWithHelper; index += 1) {
    const servedGuest = getGuestForCustomer(workingState, management.customersServed + management.guestsLost);
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

    if (management.dayThreeObservations) {
      const wanted = servedGuest && getGuestWantedProductId(workingState, servedGuest);
      const wantedProduct = wanted && getAvailableProducts(workingState).find((entry) => entry.id === wanted);
      const unavailable = wantedProduct
        ? getMissingIngredients(wantedProduct, supplies, workingState.helperAssignment)
        : [];
      management.dayThreeObservations = {
        janaServed: management.dayThreeObservations.janaServed ||
          (index > 0 && workingState.helperAssignment?.helperId === "jana"),
        missingIngredients: [...new Set([...management.dayThreeObservations.missingIngredients, ...unavailable])]
      };
    }

    supplies = applyProductConsumption(product, supplies, workingState.helperAssignment);
    const suppliesUsed = getSuppliesUsedForProduct(product, workingState.helperAssignment);
    if (helperImpact) {
      if (index > 0) helperImpact.extraOrders += 1;
      helperImpact.milkSaved += getIngredientRequirement(product, "milk", null) - suppliesUsed.milk;
    }
    // Income scales with reputation; offer review adds a 10 % daily boost.
    const offerMultiplier = workingState.dayManagement.offerReviewed ? 1.1 : 1;
    const earned = getEarnedPrice(product.basePrice * offerMultiplier, resources.reputation);
    // cleaning-kit upgrade halves the cleanliness cost per serve (2 → 1).
    const cleanlinessDrop = workingState.purchasedUpgrades.includes("cleaning-kit") ? 1 : 2;
    resources = {
      ...resources,
      money: clampResource(resources.money + earned),
      cleanliness: clampMeter(resources.cleanliness - cleanlinessDrop),
      stress: applyCapacityStress(resources.stress, management.customersServed, workingState.day)
    };

    if (
      workingState.helperAssignment?.helperId === "jana" &&
      workingState.helperAssignment.taskId === "cleaning" &&
      resources.cleanliness < 45
    ) {
      if (helperImpact) helperImpact.cleanlinessRestored += 45 - resources.cleanliness;
      resources = { ...resources, cleanliness: 45 };
    }

    management = {
      ...management,
      customersServed: management.customersServed + 1,
      servedGuestIds: servedGuest
        ? [...getServedGuestIds({ ...workingState, dayManagement: management }), servedGuest.id]
        : management.servedGuestIds,
      moneyEarned: clampResource(management.moneyEarned + earned),
      suppliesUsed: addSupplies(management.suppliesUsed, suppliesUsed)
    };

    const tableToClear = getTableForServedCustomer(workingState, management.customersServed);
    if (tableToClear && !management.dirtyTableIds.includes(tableToClear)) {
      management = {
        ...management,
        dirtyTableIds: [...management.dirtyTableIds, tableToClear]
      };
    }

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
      const reputation = clampMeter(resources.reputation + 1);
      if (helperImpact) helperImpact.reputationGained += reputation - resources.reputation;
      resources = {
        ...resources,
        reputation
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

    // Flow streak: runs per served guest so helper double-serves both count.
    const loopGuestPreferences = servedGuest?.appreciatedProductIds ?? [];
    const loopGuestHadPreference =
      loopGuestPreferences.length > 0 || Boolean(servedGuest?.preferredProductId);
    const loopServedWell =
      loopGuestPreferences.includes(product.id) ||
      servedGuest?.preferredProductId === product.id;
    if (loopServedWell) {
      const newStreak = management.serveStreak + 1;
      management = {
        ...management,
        serveStreak: newStreak,
        bestServeStreak: Math.max(management.bestServeStreak, newStreak)
      };
      if (newStreak >= 3 && newStreak % 2 === 1) {
        const tip = newStreak >= 5 && newStreak <= FLOW_TIP_MAX_STREAK ? FLOW_TIP : 0;
        if (tip > 0) {
          resources = { ...resources, money: clampResource(resources.money + tip) };
          management = { ...management, moneyEarned: clampResource(management.moneyEarned + tip) };
        }
        flavorLines.push(getFlowLine(newStreak, tip));
      }
    } else if (loopGuestHadPreference) {
      if (management.serveStreak >= 3) {
        flavorLines.push("The rhythm breaks — this order pulls you out of the flow.");
      }
      management = { ...management, serveStreak: 0 };
    }
  }

  if (management.helperExtraOrdersRemaining > 0) {
    management = {
      ...management,
      helperExtraOrdersRemaining: Math.max(0, management.helperExtraOrdersRemaining - 1)
    };
  }

  const servedCustomerIndex = Math.max(0, management.customersServed + management.guestsLost - 1);
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
    } else {
      appreciationLine = servedGuest?.matchedPreferenceLine ?? "";
    }
  } else if (matchesSoftPreference) {
    appreciationLine = servedGuest?.matchedPreferenceLine ?? "";
  } else if (guestPreferences.length > 0) {
    appreciationLine = servedGuest?.letdownLine ?? "";
  } else if (servedGuest?.preferredProductId) {
    appreciationLine = servedGuest.missedPreferenceLine ?? "";
  }

  // Mild waste (#56): the craft of a premium drink is lost on a guest who neither
  // values it nor reached for it, and whose own taste runs simpler. No reputation
  // penalty — the cost is the wasted beans and effort — but the line makes the
  // over-serve legible, so "give everyone the fanciest cup" is not a free strategy.
  let wasteLine = "";
  const servedTier = product.qualityTier ?? 1;
  const preferredProduct = servedGuest?.preferredProductId
    ? getProductById(servedGuest.preferredProductId)
    : undefined;
  const preferredTier = preferredProduct?.qualityTier ?? 1;
  const overServedPremium =
    servedGuest != null &&
    servedTier >= 3 &&
    !appreciates &&
    !matchesSoftPreference &&
    preferredProduct != null &&
    servedTier > preferredTier;
  if (overServedPremium) {
    wasteLine = `${servedGuest.name} drinks the ${product.name.toLowerCase()} without ceremony. The slow craft — and the extra supplies — are lost on someone who only wanted a ${preferredProduct.name.toLowerCase()}.`;
  }

  // Decor atmosphere bonus: atmosphere-sensitive guests notice a well-maintained café.
  let decorAtmosphereLine = "";
  const decorBonusDef = servedGuest?.decorAtmosphereBonus;
  if (decorBonusDef && management.decorBonusesGiven < DECOR_ATMOSPHERE_DAILY_CAP) {
    const decorTiers = Object.values(workingState.decor) as number[];
    const avgDecorTier = decorTiers.reduce((a, b) => a + b, 0) / decorTiers.length;
    if (avgDecorTier >= decorBonusDef.minAvgTier) {
      resources = { ...resources, reputation: clampMeter(resources.reputation + 1) };
      management = { ...management, decorBonusesGiven: management.decorBonusesGiven + 1 };
      decorAtmosphereLine = servedGuest?.decorAtmosphereLine ?? "";
    }
  }

  // better-beans upgrade: quality-sensitive guests notice the improved roast — +1 rep,
  // stacks with the appreciation bonus. Capped at the existing meter max.
  let betterBeansLine = "";
  if (
    workingState.purchasedUpgrades.includes("better-beans") &&
    servedGuest?.behaviorTags.includes("quality-expectations")
  ) {
    resources = { ...resources, reputation: clampMeter(resources.reputation + 1) };
    betterBeansLine = "The beans speak for themselves. Rep +1.";
  }

  const statusParts = [serveLine, appreciationLine, decorAtmosphereLine, betterBeansLine, wasteLine, ...flavorLines].filter(
    (part) => part.length > 0
  );

  const servedStateBase: GameState = {
    ...workingState,
    supplies,
    resources: {
      ...resources,
      mood: resources.stress >= 61 ? "strained" : resources.stress >= 41 ? "busy" : "calm"
    },
    guestMemory,
    dayManagement: helperImpact ? { ...management, dayFiveHelperImpact: helperImpact } : management,
    completedActions: addUniqueDayAction(workingState.completedActions, "take_order"),
    statusMessage: statusParts.join(" ")
  };

  // Enqueue any mid-day or guest-related events now that customersServed has advanced.
  const serveEventIds = getEventsToQueue(servedStateBase, "serve_product", (product.ingredients.coffee ?? 0) > 0);
  const servedState: GameState = {
    ...servedStateBase,
    pendingEvents: serveEventIds.reduce(
      (acc, id) => enqueuePendingEvent(acc, id),
      servedStateBase.pendingEvents
    )
  };
  return setNextGuestPatience(servedState);
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
  return cleanTable(state, state.dayManagement.dirtyTableIds[0]);
}

function cleanTable(state: GameState, tableId: TableId | undefined): GameState {
  if (state.dayPhase !== "open") {
    return {
      ...state,
      statusMessage: "Cleaning belongs to the open café day."
    };
  }

  if (tableId && !state.dayManagement.dirtyTableIds.includes(tableId)) {
    return {
      ...state,
      statusMessage: `The ${tableId} table is already tidy.`
    };
  }

  if (tableId && canJanaClearTable(state)) {
    return {
      ...state,
      completedActions: addUniqueDayAction(state.completedActions, "clean_tables"),
      resources: { ...state.resources, cleanliness: clampMeter(state.resources.cleanliness + 1) },
      dayManagement: {
        ...state.dayManagement,
        dirtyTableIds: state.dayManagement.dirtyTableIds.filter((dirtyTableId) => dirtyTableId !== tableId),
        helperAutonomousActions: 1
      },
      statusMessage: `Jana cleared the ${tableId} table. No action spent.`
    };
  }

  const actionState = spendActionPoint(state, "clean the tables");
  if (!actionState) {
    return noActionCapacityState(state);
  }

  const { state: tickedState, walkoutLine } = applyPatienceTick(actionState);
  const capacity = COMFORTABLE_CAPACITY_BY_DAY[tickedState.day];
  const slowWindowReduction =
    tickedState.dayManagement.customersServed < capacity &&
    !tickedState.dayManagement.slowCleaningStressReductionUsed
      ? 5
      : 0;

  const cleanMessage =
    slowWindowReduction > 0
      ? `The ${tableId ?? "next"} table is cleaned during a quiet window. Cleanliness rises and stress drops slightly.`
      : `The ${tableId ?? "next"} table is cleaned. Cleanliness rises.`;

  return {
    ...tickedState,
    completedActions: addUniqueDayAction(tickedState.completedActions, "clean_tables"),
    resources: {
      ...tickedState.resources,
      cleanliness: clampMeter(tickedState.resources.cleanliness + 12),
      stress: clampMeter(tickedState.resources.stress - slowWindowReduction),
      mood: "calm"
    },
    dayManagement: {
      ...tickedState.dayManagement,
      cleaningActions: tickedState.dayManagement.cleaningActions + 1,
      dirtyTableIds: tableId
        ? tickedState.dayManagement.dirtyTableIds.filter((dirtyTableId) => dirtyTableId !== tableId)
        : tickedState.dayManagement.dirtyTableIds,
      slowCleaningStressReductionUsed:
        tickedState.dayManagement.slowCleaningStressReductionUsed || slowWindowReduction > 0
    },
    statusMessage: [cleanMessage, walkoutLine].filter(Boolean).join(" ")
  };
}

function getTableForServedCustomer(state: GameState, customersServed: number): TableId | null {
  if (state.equipment.seating < 1) {
    return null;
  }

  const tables: readonly TableId[] = ["left", "right", "back"];
  return tables[(customersServed - 1) % tables.length];
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

  const { state: tickedState, walkoutLine } = applyPatienceTick(actionState);
  const modifier = getCurrentDayModifier(tickedState);
  const firstSupplyCheck = !state.completedActions.includes("check_supplies");
  const allSuppliesAvailable = (Object.keys(SUPPLY_CAPS) as IngredientKey[]).every(
    (ingredient) => tickedState.supplies[ingredient] > 0
  );
  const auditBonusApplies =
    modifier.id === "inventory-audit" && firstSupplyCheck && allSuppliesAvailable;

  const supplyMessage =
    `Supply check: coffee ${tickedState.supplies.coffee}/${SUPPLY_CAPS.coffee}, milk ${tickedState.supplies.milk}/${SUPPLY_CAPS.milk}, pastries ${tickedState.supplies.pastries}/${SUPPLY_CAPS.pastries}.` +
    (auditBonusApplies ? " The tidy shelf calms the offer board. Rep +1." : "");

  return {
    ...tickedState,
    completedActions: addUniqueDayAction(tickedState.completedActions, "check_supplies"),
    resources: auditBonusApplies
      ? {
          ...tickedState.resources,
          reputation: clampMeter(tickedState.resources.reputation + 1)
        }
      : tickedState.resources,
    statusMessage: [supplyMessage, walkoutLine].filter(Boolean).join(" ")
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

  if (state.dayManagement.offerReviewed) {
    return {
      ...state,
      statusMessage: "The offer board has already been reviewed today."
    };
  }

  const actionState = spendActionPoint(state, "review the offer board");
  if (!actionState) {
    return noActionCapacityState(state);
  }

  const { state: tickedState, walkoutLine } = applyPatienceTick(actionState);

  return {
    ...tickedState,
    completedActions: addUniqueDayAction(tickedState.completedActions, "adjust_offer"),
    resources: {
      ...tickedState.resources,
      reputation: clampMeter(tickedState.resources.reputation + 1)
    },
    dayManagement: {
      ...tickedState.dayManagement,
      offerReviewed: true
    },
    statusMessage: [
      "Offer board reviewed. Remaining orders earn 10 % more today. Rep +1.",
      walkoutLine
    ].filter(Boolean).join(" ")
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
          ? `Not enough money for a social post (${formatAsche(SOCIAL_AD_COST)}).`
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

  // Patience only ticks when a real action point was spent (not a free bonus slot)
  const { state: tickedState, walkoutLine } = hasBonusAdvertisingAction
    ? { state: actionState, walkoutLine: "" }
    : applyPatienceTick(actionState);

  const posterEchoApplies =
    adType === "flyer" &&
    getCurrentDayModifier(tickedState).id === "poster-echo" &&
    !state.dayManagement.advertisingRun;

  const baseRepGain = adType === "social" ? 3 : 1;
  const reputationGain = posterEchoApplies ? baseRepGain + 1 : baseRepGain;
  const newStress = clampMeter(tickedState.resources.stress);

  const adMessage =
    adType === "social"
      ? `Social post out. ${formatAsche(SOCIAL_AD_COST)} spent. Rep +3.`
      : posterEchoApplies
        ? `Flyer out in the neighbourhood. ${formatAsche(FLYER_COST)} spent. Rep +2.`
        : `Flyer out in the neighbourhood. ${formatAsche(FLYER_COST)} spent. Rep +1.`;

  return {
    ...tickedState,
    completedActions: addUniqueDayAction(tickedState.completedActions, "run_advertising"),
    resources: {
      ...tickedState.resources,
      money: clampResource(tickedState.resources.money - cost),
      reputation: clampMeter(tickedState.resources.reputation + reputationGain),
      stress: newStress,
      mood: getMoodForStress(newStress)
    },
    dayManagement: {
      ...tickedState.dayManagement,
      moneySpent: clampResource(tickedState.dayManagement.moneySpent + cost),
      advertisingRun: adType === "flyer" ? true : tickedState.dayManagement.advertisingRun,
      socialAdRun: adType === "social" ? true : tickedState.dayManagement.socialAdRun
    },
    statusMessage: [adMessage, walkoutLine].filter(Boolean).join(" ")
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

  if (state.dayManagement.kassandraConsulted) {
    return {
      ...state,
      statusMessage: "KASSANDRA has already been consulted today."
    };
  }

  const actionState = spendActionPoint(state, "consult KASSANDRA");
  if (!actionState) {
    return noActionCapacityState(state);
  }

  const { state: tickedState, walkoutLine } = applyPatienceTick(actionState);

  const earlyForecastRefund =
    getCurrentDayModifier(tickedState).id === "forecast-static" &&
    !state.dayManagement.kassandraConsulted &&
    state.dayManagement.customersServed === 0;

  const kassandraMessage = `KASSANDRA: ${getKassandraConsultLine(tickedState)}${
    earlyForecastRefund ? " Early forecast logged. Action refunded." : ""
  }`;

  return {
    ...tickedState,
    completedActions: addUniqueDayAction(tickedState.completedActions, "consult_kassandra"),
    dayManagement: {
      ...tickedState.dayManagement,
      actionPointsRemaining: earlyForecastRefund
        ? tickedState.dayManagement.actionPointsRemaining + 1
        : tickedState.dayManagement.actionPointsRemaining,
      actionPointsSpent: earlyForecastRefund
        ? Math.max(0, tickedState.dayManagement.actionPointsSpent - 1)
        : tickedState.dayManagement.actionPointsSpent,
      kassandraConsulted: true
    },
    statusMessage: [kassandraMessage, walkoutLine].filter(Boolean).join(" ")
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

  if (state.day === 3 && helperId !== "jana" && helperId !== state.helperAssignment?.helperId) {
    return { ...state, statusMessage: "Jana is the only helper available for the Day 3 trial." };
  }

  const assignment = createHelperAssignment(helperId, taskId, state.day);

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

function clearHelper(state: GameState): GameState {
  if (state.day < 3 || !state.unlocks.staff) {
    return {
      ...state,
      statusMessage: "Temporary help starts on Day 3."
    };
  }

  if (state.dayPhase !== "day_start" || state.helperAssignment?.locked) {
    return {
      ...state,
      statusMessage: "Helper assignment is final once the day has opened."
    };
  }

  return {
    ...state,
    helperAssignment: null,
    statusMessage: "No helper selected. Open alone or choose help before opening."
  };
}

function applyMorningBonuses(resources: ResourceState, state: GameState): ResourceState {
  const decorBonuses = getDecorDailyBonuses(state.decor);
  const equipmentBonuses = getEquipmentDailyBonuses(state.equipment);
  const repGain = decorBonuses.reputation + equipmentBonuses.reputation;
  if (decorBonuses.cleanliness === 0 && repGain === 0) {
    return resources;
  }
  return {
    ...resources,
    cleanliness: clampMeter(resources.cleanliness + decorBonuses.cleanliness),
    reputation: clampMeter(resources.reputation + repGain)
  };
}

function openDay(state: GameState): GameState {
  if (state.dayPhase !== "day_start") {
    return {
      ...state,
      statusMessage: "The café is already open."
    };
  }

  const assignment = state.helperAssignment;
  const helperFee = assignment ? getHelperDailyCost(assignment.helperId, assignment.dailyCost, state.day) : 0;
  if (assignment && state.resources.money < helperFee) {
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
  const modifier = getCurrentDayModifier(state);
  const shortStaffedPenalty = modifier.id === "short-staffed" && !state.helperAssignment ? 1 : 0;
  const management: GameState["dayManagement"] = {
    ...state.dayManagement,
    moneySpent: clampResource(state.dayManagement.moneySpent + helperFee),
    helperExtraOrdersRemaining: getHelperExtraOrders(state),
    extraAdvertisingActions:
      state.helperAssignment?.helperId === "nele" &&
      state.helperAssignment.taskId === "marketing"
        ? 1
        : 0,
    helperDecisionMade: true,
    // second-table upgrade: the extra seating enables one additional order per shift.
    actionPointsRemaining:
      state.dayManagement.actionPointsRemaining +
      levelBonuses.extraAP -
      shortStaffedPenalty +
      (state.purchasedUpgrades.includes("second-table") ? 1 : 0)
  };

  if (state.helperAssignment) {
    resources = {
      ...resources,
      money: clampResource(resources.money - helperFee)
    };

    if (state.helperAssignment.helperId === "nino" && state.helperAssignment.taskId === "counter") {
      resources = { ...resources, stress: clampMeter(resources.stress - 8) };
    }
    if (state.helperAssignment.helperId === "nele" && state.helperAssignment.taskId === "counter") {
      resources = { ...resources, stress: clampMeter(resources.stress - 5) };
    }
    if (state.day === 5) {
      management.dayFiveHelperImpact = {
        openingStressReduction: state.resources.stress - resources.stress,
        extraOrders: 0,
        cleanlinessRestored: 0,
        reputationGained: 0,
        milkSaved: 0
      };
    }
  }

  if (state.day === 3) {
    management.dayThreeObservations = { janaServed: false, missingIngredients: [] };
  }

  resources = applyMorningBonuses(resources, state);

  const openedStateBase: GameState = {
    ...state,
    dayPhase: "open",
    resources,
    helperAssignment: assignment
      ? { ...assignment, dailyCost: helperFee, locked: true }
      : null,
    dayManagement: management,
    statusMessage: [
      state.helperAssignment
        ? state.day === 3
          ? `Day opened with ${getHelperLabel(state.helperAssignment)}.`
          : `Day opened with ${getHelperLabel(state.helperAssignment)}. ${state.helperAssignment.flavorLine}`
        : shortStaffedPenalty > 0
          ? "Day 5 opens short-staffed — one fewer action point today."
          : "Day opened without temporary help.",
      modifier.learningHint
    ].join(" ")
  };

  return setNextGuestPatience(queueOpeningEvents(openedStateBase));
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

  // Only a positive balance at closing completes a financial recovery.
  const moneyAtZero = closedState.resources.money <= 0;
  const moneyZeroStreak = moneyAtZero ? Math.min(2, state.moneyZeroStreak + 1) : 0;
  const closeForMoney = moneyZeroStreak >= 2;

  // Reputation fail-state with a 2-day grace period: one day at zero is a
  // warning; a second consecutive day at zero closes the café.
  const reputationAtZero = closedState.resources.reputation <= 0;
  const reputationZeroStreak = reputationAtZero ? state.reputationZeroStreak + 1 : 0;
  const closeForReputation = reputationZeroStreak >= 2;

  const daySevenMessage = "Day 7 closed. An official letter has arrived. Something is wrong with this café.";
  const closingMessage = [
    closeForMoney
      ? "A second consecutive day closed with an empty till. The rescue shift could not cover costs; the café closes."
      : closeForReputation
        ? "A second day with no standing left in the neighbourhood. The café quietly closes."
        : daySevenClose
          ? daySevenMessage
          : reputationAtZero
            ? `Day ${state.day} closed. Reputation has bottomed out — one more day like this and the café closes.`
            : moneyAtZero
              ? `Day ${state.day} closed. Review the summary before the next shift.`
              : `Day ${state.day} closed. Review the summary, then buy supplies for tomorrow.`,
    daySevenClose && (closeForMoney || closeForReputation) ? daySevenMessage : null,
    daySevenClose && moneyAtZero && !closeForMoney ? "The week ends with an empty till." : null
  ].filter(Boolean).join(" ");

  const closedPhaseLabel = daySevenClose
    ? "End of week"
    : `Day ${state.day} closed`;

  // Enqueue Closing-kicker events now that the day is ending.
  const closingEventIds = getEventsToQueue(closedState, "complete_day");
  const pendingEventsAfterClose = closingEventIds.reduce(
    (acc, id) => enqueuePendingEvent(acc, id),
    closedState.pendingEvents
  );

  return {
    ...closedState,
    dayPhase: "day_end",
    phaseLabel: closedPhaseLabel,
    pendingEvents: pendingEventsAfterClose,
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
    unlocks: daySevenClose
      ? { ...closedState.unlocks, apocalypseOperations: true }
      : closedState.unlocks,
    reputationZeroStreak,
    moneyZeroStreak,
    cafeClosed: closeForMoney || closeForReputation,
    closureReason: closeForMoney
      ? "money"
      : closeForReputation
        ? "reputation"
        : closedState.closureReason,
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
  let soloStressRecap: string | undefined;

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

  // From Day 5, running the floor without a hired helper is noticeably harder.
  // Helpers can be hired from Day 3 (and cost money) — skipping them trades
  // money saved for a steeper end-of-day stress hit.
  if (state.day >= 5 && !state.helperAssignment) {
    const stress = clampMeter(resources.stress + 10);
    if (state.day === 5) {
      const added = Number((stress - resources.stress).toFixed(2));
      soloStressRecap = added === 10
        ? "Solo shift: +10 stress at closing, before other closing effects."
        : `Solo shift: +${added} stress at closing (limited by the stress cap).`;
    } else {
      flavorLines.push("You ran the whole floor alone again. Helpers unlock Day 3 — hiring one trades daily cost for less end-of-day strain. Stress +10.");
    }
    resources = { ...resources, stress };
  }

  if (resources.cleanliness >= 70) {
    resources = { ...resources, reputation: clampMeter(resources.reputation + 1) };
    flavorLines.push("The café closed in good order. Guests noticed. Rep +1.");
  } else if (resources.cleanliness < 25) {
    resources = { ...resources, reputation: clampMeter(resources.reputation - 2) };
    flavorLines.push("A guest mentioned the tables with professional restraint. Clean during the shift to stay above 25. Rep -2.");
  } else if (resources.cleanliness < 40) {
    resources = { ...resources, reputation: clampMeter(resources.reputation - 1) };
    flavorLines.push("The room felt a little neglected by closing time. Rep -1.");
  }

  if (getCurrentDayModifier(state).id === "inspection-pressure") {
    if (resources.cleanliness >= 70) {
      resources = { ...resources, reputation: clampMeter(resources.reputation + 1) };
      flavorLines.push("Inspection day: clean closing rewarded. Rep +1.");
    } else if (resources.cleanliness < 40) {
      resources = { ...resources, reputation: clampMeter(resources.reputation - 1) };
      flavorLines.push("Inspection day: the neglected corners were noted. Rep -1.");
    }
  }

  if (management.customersServed < 4) {
    resources = { ...resources, stress: clampMeter(resources.stress - 10) };
    flavorLines.push("Quiet day — fewer than four customers. The slower pace kept stress down. Stress -10.");
  }

  if (janaMaintainsCleaning && resources.cleanliness < 45) {
    if (management.dayFiveHelperImpact) {
      management.dayFiveHelperImpact = {
        ...management.dayFiveHelperImpact,
        cleanlinessRestored: management.dayFiveHelperImpact.cleanlinessRestored + 45 - resources.cleanliness
      };
    }
    resources = { ...resources, cleanliness: 45 };
  }
  if (state.helperAssignment && state.day !== 3 && state.day !== 5) {
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
      const tipBonus = roundAscheEarnings(management.moneyEarned * tipBonusRate);
      resources = { ...resources, money: clampResource(resources.money + tipBonus) };
      management = { ...management, moneyEarned: clampResource(management.moneyEarned + tipBonus) };
      flavorLines.push(`Tip bonus (Level 3, 5 % of earnings): +${formatAsche(tipBonus)}.`);
    }
  }

  // Fixed daily overhead — rent, utilities, baseline costs every café day.
  resources = { ...resources, money: clampResource(resources.money - DAILY_FIXED_COST) };
  flavorLines.push(`Daily costs (rent, utilities): −${formatAsche(DAILY_FIXED_COST)}.`);

  if (management.bestServeStreak >= 5) {
    flavorLines.push(
      `Best flow today: ${management.bestServeStreak} orders in a row without a missed preference.`
    );
  }

  const stressEvent = getStressEvent(resources.stress, state.stressEventLog.length);

  if (stressEvent && resources.stress >= 81) {
    resources = { ...resources, money: clampResource(resources.money - 5) };
    management = { ...management, moneySpent: clampResource(management.moneySpent + 5) };
  }

  if (stressEvent) {
    flavorLines.push(stressEvent);
  }

  const dailyOverhead = DAILY_FIXED_COST;
  if (state.day === 3) {
    const missing = [...new Set([
      ...management.emptySupplyStressIngredients,
      ...(management.dayThreeObservations?.missingIngredients ?? [])
    ])];
    if (missing.length > 0) {
      flavorLines.push(`Missing at the counter: ${missing.map(getIngredientLabel).join(", ")}.`);
    }
    const dirtyTables = management.dirtyTableIds.length;
    if (dirtyTables > 0) {
      flavorLines.push(`${dirtyTables} ${dirtyTables === 1 ? "table still needed" : "tables still needed"} clearing at closing.`);
    }
  }


  const suggestedRestock = {
    coffee: Math.min(management.suppliesUsed.coffee, SUPPLY_CAPS.coffee - state.supplies.coffee),
    milk: Math.min(management.suppliesUsed.milk, SUPPLY_CAPS.milk - state.supplies.milk),
    pastries: Math.min(management.suppliesUsed.pastries, SUPPLY_CAPS.pastries - state.supplies.pastries),
  };

  return {
    ...state,
    staffXp,
    pendingSupplyPurchase: suggestedRestock,
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
      guestsLost: management.guestsLost,
      bestServeStreak: management.bestServeStreak,
      suppliesUsed: { ...management.suppliesUsed },
      suppliesRestocked: { coffee: 0, milk: 0, pastries: 0 },
      suppliesRemaining: { ...state.supplies },
      cleanlinessLabel: getCleanlinessLabel(resources.cleanliness),
      stressLabel: getStressLabel(resources.stress),
      reputationDelta: resources.reputation - management.reputationAtStart,
      objectiveTitle: getObjectiveStatus(state).objective.title,
      objectiveCompleted: false,
      helperRecap: state.helperAssignment ? getHelperLabel(state.helperAssignment) : null,
      helperAutonomyRecap: state.day === 3
        ? getDayThreeHelperRecap(state, management)
        : state.day === 5 && state.helperAssignment
          ? getDayFiveHelperRecap(state.helperAssignment, management)
          : soloStressRecap ?? getHelperAutonomyRecapLine(state.helperAssignment, management.helperAutonomousActions),
      stressEvent,
      flavorLines
    },
    stressEventLog: stressEvent
      ? [...state.stressEventLog, stressEvent]
      : [...state.stressEventLog]
  };
}

function getDayThreeHelperRecap(state: GameState, management: GameState["dayManagement"]): string | null {
  if (!state.helperAssignment) return "You opened alone and paid no helper fee.";
  if (state.helperAssignment.helperId !== "jana") {
    return getHelperAutonomyRecapLine(state.helperAssignment, management.helperAutonomousActions);
  }
  if (state.helperAssignment.taskId === "cleaning") {
    return management.helperAutonomousActions > 0
      ? "Jana cleared a table without using one of your actions."
      : "Jana was assigned to clearing. She did not clear a table this shift.";
  }
  if (!management.dayThreeObservations) return null;
  return management.dayThreeObservations.janaServed
    ? "Jana served one extra guest without using another action."
    : "Jana was assigned to service. No extra guest was served.";
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

function confirmSupplyPurchase(state: GameState, withoutRestocking = false): GameState {
  if (state.dayPhase !== "day_end") {
    return {
      ...state,
      statusMessage: "There are no day-end purchases to confirm right now."
    };
  }

  if (state.demoComplete) {
    return state;
  }

  const purchaseCost = withoutRestocking ? 0 : getPurchaseCost(state.pendingSupplyPurchase);

  if (purchaseCost > state.resources.money) {
    return {
      ...state,
      statusMessage: "Not enough money for that restock plan. Reduce the quantities first."
    };
  }

  const nextDay = (state.day + 1) as DayNumber;
  const nextDayDefinition = getCurrentDayDefinition({ ...state, day: nextDay });
  const supplies = withoutRestocking ? state.supplies : applySupplyPurchase(state.supplies, state.pendingSupplyPurchase);
  const restedStress = clampMeter(state.resources.stress - 20);
  const nextResources = {
    ...state.resources,
    money: clampResource(state.resources.money - purchaseCost),
    stress: restedStress,
    mood: getMoodForStress(restedStress)
  };

  const nextDayState: GameState = {
    ...state,
    day: nextDay,
    dayPhase: nextDay >= 3 ? "day_start" : "open",
    phaseLabel: nextDayDefinition.title,
    completedActions: [],
    supplies,
    pendingSupplyPurchase: { coffee: 0, milk: 0, pastries: 0 },
    helperAssignment: null,
    dayManagement: createInitialDayManagement(nextResources.reputation, nextDay),
    pendingEvents: [],
    daySummary: null,
    run: nextDay === 2 && (state.guestMemory["pendlerin-fatou"]?.visits ?? 0) > 0
      ? { ...state.run, memoryFragments: addUniqueStrings(state.run.memoryFragments, [DAY_ONE_FATOU_SERVED_FRAGMENT]) }
      : state.run,
    kassandraInstalled: nextDay >= 6,
    unlocks: getUnlocksForDay(nextDay),
    resources: nextResources,
    statusMessage: withoutRestocking
      ? `Day ${nextDay} begins without a supply purchase.`
      : nextDay >= 3
        ? `Restock confirmed. Day ${nextDay} begins with helper choices available.`
        : nextDay === 2
          ? `Restock confirmed. Day 2 begins: ${nextDayDefinition.milestone} Daily overhead (${formatAsche(DAILY_FIXED_COST)}) deducts at closing.`
          : `Restock confirmed. Day ${nextDay} begins: ${nextDayDefinition.milestone}`
  };
  if (nextDay >= 3) {
    return nextDayState;
  }

  // Day 2 opens automatically, but owned upgrades still grant their morning bonuses.
  const openedDayState: GameState = {
    ...nextDayState,
    resources: applyMorningBonuses(nextResources, nextDayState)
  };
  return setNextGuestPatience(queueOpeningEvents(openedDayState));
}

function upgradeDecor(state: GameState, slot: DecorSlotId): GameState {
  if (slot === "clock" && state.equipment.clock < 1) {
    return { ...state, statusMessage: "Buy a replacement wall clock in Equipment first." };
  }

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
      statusMessage: `Not enough money for ${tierDefinition.name} (${formatAsche(tierDefinition.cost)}).`
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

/**
 * Buy the next tier of a core equipment slot (coffee machine or seating).
 * Mirrors upgradeDecor: spends cash, bumps the tier, grants a one-time
 * reputation bonus. Allowed during the pre-opening "setup" phase and during the
 * day-end review (so the player can upgrade used gear later).
 */
function buyEquipment(state: GameState, slot: EquipmentSlotId): GameState {
  if (state.demoComplete) {
    return state;
  }

  if (state.dayPhase !== "setup" && state.dayPhase !== "day_end") {
    return {
      ...state,
      statusMessage: "Equipment is bought before opening or during the day-end review."
    };
  }

  if (state.dayPhase === "setup" && slot === "register") {
    return {
      ...state,
      statusMessage: "Register upgrades are available after opening."
    };
  }

  const nextTier = state.equipment[slot] + 1;
  const tierDefinition = getEquipmentTier(slot, nextTier);

  if (!tierDefinition || state.equipment[slot] >= getMaxEquipmentTier(slot)) {
    return {
      ...state,
      statusMessage: "That is already the best equipment you can buy."
    };
  }

  if (tierDefinition.cost > state.resources.money) {
    return {
      ...state,
      statusMessage: `Not enough money for ${tierDefinition.name} (${formatAsche(tierDefinition.cost)}).`
    };
  }

  return {
    ...state,
    equipment: { ...state.equipment, [slot]: nextTier },
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
        ? `Bought: ${tierDefinition.name}. Rep +${tierDefinition.reputationBonus}.`
        : `Bought: ${tierDefinition.name}.`
  };
}

/**
 * Buy a one-time upgrade from the day-end shop. Upgrades have passive gameplay
 * effects that activate in other action handlers once purchased.
 *   cleaning-kit  → reduces cleanliness drop per serve (2 → 1)
 *   better-beans  → grants +1 rep when a quality-expectations guest is served
 *   second-table  → adds +1 action point at the next open_day
 */
function buyUpgrade(state: GameState, upgradeId: UpgradeId): GameState {
  if (state.demoComplete) {
    return state;
  }

  if (state.dayPhase !== "day_end") {
    return {
      ...state,
      statusMessage: "Café upgrades are bought after closing, before the next day starts."
    };
  }

  const upgrade = weekOneUpgrades.find((u) => u.id === upgradeId);
  if (!upgrade) {
    return state;
  }

  if (!upgrade.purchasable) {
    return { ...state, statusMessage: "That upgrade is not available to buy in this demo." };
  }

  if (state.purchasedUpgrades.includes(upgradeId)) {
    return { ...state, statusMessage: "Already purchased." };
  }

  if (state.day < upgrade.unlockDay) {
    return { ...state, statusMessage: "Not available yet." };
  }

  if (upgrade.cost > state.resources.money) {
    return {
      ...state,
      statusMessage: `Not enough money (${formatAsche(upgrade.cost)} needed).`
    };
  }

  return {
    ...state,
    purchasedUpgrades: [...state.purchasedUpgrades, upgradeId],
    resources: {
      ...state.resources,
      money: clampResource(state.resources.money - upgrade.cost)
    },
    dayManagement: {
      ...state.dayManagement,
      moneySpent: clampResource(state.dayManagement.moneySpent + upgrade.cost)
    },
    statusMessage: `${upgrade.name} — added to the café.`
  };
}

/**
 * Leave the pre-opening "setup" phase and open Day 1. Requires a coffee machine
 * (no machine, no café); seating is optional — opening bare means guests order
 * at the counter and stand. Applies the same morning décor/equipment bonuses as
 * openDay so a furnished room already feels a touch warmer on opening.
 */
function finishSetup(state: GameState): GameState {
  if (state.dayPhase !== "setup") {
    return {
      ...state,
      statusMessage: "The café is already set up."
    };
  }

  if (state.equipment.machine < 1) {
    return {
      ...state,
      statusMessage: "You need at least a used coffee machine before you can open."
    };
  }

  if (state.equipment.grinder < 1) {
    return { ...state, statusMessage: "You need a coffee grinder before you can open." };
  }

  const resources = applyMorningBonuses({ ...state.resources }, state);

  const openedState: GameState = {
    ...state,
    dayPhase: "open",
    phaseLabel: "First shift open",
    resources,
    statusMessage: [
      state.equipment.seating >= 1
        ? `Doors open. The room is bare but the machine hisses and the first guest is already at the counter. Daily overhead (${formatAsche(DAILY_FIXED_COST)}) will be deducted at closing.`
        : `Doors open with standing room only — guests order at the counter and take their coffee to go. Daily overhead (${formatAsche(DAILY_FIXED_COST)}) will be deducted at closing.`,
      getCurrentDayModifier(state).learningHint
    ].join(" ")
  };
  return setNextGuestPatience(queueOpeningEvents(openedState));
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
  // No stock and no cash must still allow the rescue shift to end.
  if (state.dayManagement.actionPointsRemaining <= 0 || state.resources.money <= 0) {
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

/**
 * Push eventId into pendingEvents if it is not already present.
 * Returns a new array (does not mutate).
 */
function enqueuePendingEvent(pending: readonly EventId[], id: EventId): EventId[] {
  if (pending.includes(id)) {
    return [...pending];
  }
  return [...pending, id];
}

/** Start today's event log for every opening route, including Days 1 and 2. */
function queueOpeningEvents(state: GameState): GameState {
  const openedState: GameState = { ...state, pendingEvents: [] };
  return {
    ...openedState,
    pendingEvents: getEventsToQueue(openedState, "open_day")
  };
}

/**
 * Determine which events for the current day should fire given the current
 * game state and an action context ("open_day", "serve_product", "complete_day").
 *
 * Trigger rules (deterministic, positional):
 * - Position 0 in the day's eventIds → fires on "open_day"
 * - Events with kicker === "Closing" → fire on "complete_day" (regardless of position)
 * - Events with relatedGuestIds → fire on "serve_product" if any id appears in
 *   state.guestHistory (cross-day memory) or state.dayManagement.customersServed > 0
 * - Middle positions 1..N-2 (not first, not Closing) → fire on "serve_product"
 *   when customersServed >= position
 *
 * Returns only ids not already in pendingEvents (no duplicates).
 */
function getEventsToQueue(
  state: GameState,
  context: "open_day" | "serve_product" | "complete_day",
  servedCoffee = false
): EventId[] {
  const currentDay = weekOneDays[state.day - 1];
  const eventIds = currentDay.eventIds as readonly EventId[];
  const N = eventIds.length;
  const result: EventId[] = [];

  for (let i = 0; i < N; i++) {
    const id = eventIds[i];
    if (state.pendingEvents.includes(id)) {
      continue;
    }

    const eventDef = weekOneEvents.find((e) => e.id === id);
    if (!eventDef) {
      continue;
    }

    const def = eventDef as EventDefinition;
    const isClosing = def.kicker === "Closing";
    const hasGuestIds = Boolean(def.relatedGuestIds?.length);

    if (context === "open_day" && i === 0 && !isClosing) {
      result.push(id);
      continue;
    }

    if (context === "complete_day" && isClosing) {
      result.push(id);
      continue;
    }

    if (context === "serve_product" && !isClosing) {
      if (id === "day-1-first-cup") {
        if (servedCoffee) result.push(id);
        continue;
      }

      // Guest-related events: fire as soon as we have any served guest today
      // or the guest appears in the cross-day guestHistory
      if (hasGuestIds) {
        const guestIds = def.relatedGuestIds as readonly GuestId[];
        const guestKnown =
          state.dayManagement.customersServed > 0 ||
          guestIds.some((gid) => state.guestHistory.includes(gid));
        if (guestKnown) {
          result.push(id);
          continue;
        }
      }

      // Middle positional events (i > 0, not closing, not already fired)
      if (i > 0 && i < N - 1 && !hasGuestIds) {
        if (state.dayManagement.customersServed >= i) {
          result.push(id);
          continue;
        }
      }

      // Last event (N-1) that is not Closing and has no guest ids
      if (i === N - 1 && !hasGuestIds && N > 1) {
        if (state.dayManagement.customersServed >= i) {
          result.push(id);
          continue;
        }
      }
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

/**
 * Set patience for whichever guest is now at the counter.
 * Queue position = customersServed + guestsLost (served + walked out).
 * Called after openDay, after a successful serve, and after a walkout.
 */
function setNextGuestPatience(state: GameState): GameState {
  const queuePos = state.dayManagement.customersServed + state.dayManagement.guestsLost;
  const guest = getGuestForCustomer(state, queuePos);
  const baseMax = guest ? getGuestPatienceMax() : 0;
  // Messy café (cleanliness < 50) costs every arriving guest one patience tick —
  // they're already irritated before they even order.
  const messyPenalty = baseMax > 0 && state.resources.cleanliness < 50 ? PATIENCE_TICK : 0;
  const max = baseMax > 0 ? Math.max(PATIENCE_TICK, baseMax - messyPenalty) : 0;
  return {
    ...state,
    dayManagement: {
      ...state.dayManagement,
      currentGuestPatience: max,
      currentGuestPatienceMax: max,
      actionsWithoutServing: 0
    }
  };
}

/**
 * Applies one autonomous helper action when the assigned task can actually
 * perform one. In the current slice, only Jana on cleaning has an ambient
 * floor task: she clears one specific dirty table. Service, barista, counter,
 * and marketing keep their explicit serve/open-day effects instead of being
 * misreported as table cleaning.
 *
 * "micromanagement" never acts, "learning" acts on every other idle action,
 * and "autonomous" acts on every one. The counter only tracks work that was
 * actually completed, so the day-end recap stays truthful.
 */
function applyHelperAutonomy(state: GameState, actionsWithoutServing: number): GameState {
  const assignment = state.helperAssignment;
  const level = assignment?.autonomyLevel;

  if (
    state.day === 3 ||
    !assignment ||
    assignment.helperId !== "jana" ||
    assignment.taskId !== "cleaning" ||
    !level ||
    level === "micromanagement"
  ) {
    return state;
  }

  if (level === "learning" && actionsWithoutServing % 2 !== 0) {
    return state;
  }

  const [tableId, ...remainingDirtyTableIds] = state.dayManagement.dirtyTableIds;
  if (!tableId) {
    return state;
  }

  return {
    ...state,
    resources: {
      ...state.resources,
      cleanliness: clampMeter(state.resources.cleanliness + 1)
    },
    dayManagement: {
      ...state.dayManagement,
      dirtyTableIds: remainingDirtyTableIds,
      helperAutonomousActions: state.dayManagement.helperAutonomousActions + 1
    }
  };
}

/**
 * Decrement patience by one tick for a non-serve action.
 * Returns the updated state and an optional walkout narrative line.
 * On Day 1–3 patience still drains (teaching the mechanic) but no one leaves.
 */
function applyPatienceTick(state: GameState): { state: GameState; walkoutLine: string } {
  const { dayManagement: management } = state;
  if (management.currentGuestPatienceMax === 0) {
    return { state, walkoutLine: "" };
  }

  const newPatience = Math.max(0, management.currentGuestPatience - PATIENCE_TICK);
  const newActionsWithoutServing = management.actionsWithoutServing + 1;

  if (newPatience > 0 || !guestsCanWalkOut(state.day)) {
    const tickedState: GameState = {
      ...state,
      dayManagement: {
        ...management,
        currentGuestPatience: newPatience,
        actionsWithoutServing: newActionsWithoutServing
      }
    };

    return {
      state: applyHelperAutonomy(tickedState, newActionsWithoutServing),
      walkoutLine: ""
    };
  }

  // Patience exhausted and walkouts are active
  const queuePos = management.customersServed + management.guestsLost;
  const guest = getGuestForCustomer(state, queuePos);
  const guestName = guest?.name ?? "The guest";

  const afterWalkout: GameState = {
    ...state,
    resources: {
      ...state.resources,
      stress: clampMeter(state.resources.stress + WALKOUT_STRESS),
      reputation: clampMeter(state.resources.reputation - WALKOUT_REPUTATION_PENALTY)
    },
    dayManagement: {
      ...management,
      currentGuestPatience: 0,
      actionsWithoutServing: newActionsWithoutServing,
      guestsLost: management.guestsLost + 1,
      serveStreak: 0
    }
  };

  return {
    state: setNextGuestPatience(afterWalkout),
    walkoutLine: `${guestName} ran out of patience and left without ordering. Stress +${WALKOUT_STRESS}, Rep −1.`
  };
}
