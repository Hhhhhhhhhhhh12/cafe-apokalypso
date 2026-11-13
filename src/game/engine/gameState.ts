import { INITIAL_GRINDER_COST } from "../data/equipment";
import { weekOneDayModifiers } from "../data/dayModifiers";
import type { AchievementId, DayModifierId, EventId, GuestId } from "../types/content";
import type {
  DayManagementState,
  DayObjectiveResult,
  DayPhase,
  DaySummary,
  DayActionId,
  GameState,
  GuestMemoryEntry,
  HelperAssignment,
  HelperTaskId,
  IngredientKey,
  ResourceState,
  RunState,
  SupplyPurchaseState,
  SupplyState,
  TableId,
  UnlockState
} from "../types/game";
import { createInitialDayManagement, STARTING_REPUTATION, SUPPLY_CAPS } from "./management";

export const CURRENT_GAME_STATE_VERSION = 19;
export const CURRENT_CONTENT_CATALOG_VERSION = "week-one-v1";

const initialResources: ResourceState = {
  money: 42,
  reputation: STARTING_REPUTATION,
  cleanliness: 80,
  stress: 0,
  mood: "calm"
};

const initialSupplies: SupplyState = {
  coffee: 12,
  milk: 8,
  pastries: 6
};

const emptySupplyPurchase: SupplyPurchaseState = {
  coffee: 0,
  milk: 0,
  pastries: 0
};

const initialUnlocks: UnlockState = {
  pricing: false,
  advertising: false,
  staff: false,
  kassandra: false,
  apocalypseOperations: false
};

const initialRun: RunState = {
  runNumber: 1,
  seed: 101,
  modifierIds: weekOneDayModifiers.map((modifier) => modifier.id),
  memoryFragments: []
};

export function createInitialGameState(): GameState {
  return {
    version: CURRENT_GAME_STATE_VERSION,
    contentCatalogVersion: CURRENT_CONTENT_CATALOG_VERSION,
    day: 1,
    dayPhase: "open",
    phaseLabel: "Opening setup",
    resources: { ...initialResources },
    supplies: { ...initialSupplies },
    helperAssignment: null,
    pendingSupplyPurchase: { ...emptySupplyPurchase },
    dayManagement: createInitialDayManagement(initialResources.reputation, 1),
    daySummary: null,
    objectiveResults: [],
    stressEventLog: [],
    hiddenWeirdness: 1,
    weirdnessVisible: false,
    kassandraInstalled: false,
    demoComplete: false,
    cafeClosed: false,
    closureReason: null,
    moneyZeroStreak: 0,
    reputationZeroStreak: 0,
    decor: { plant: 1, plant2: 1, shelf: 1, clock: 1, lamp: 1, cups: 1 },
    equipment: { machine: 1, grinder: 1, clock: 1, seating: 1, register: 1 },
    run: { ...initialRun, modifierIds: [...initialRun.modifierIds], memoryFragments: [] },
    guestMemory: {},
    completedActions: [],
    unlocks: { ...initialUnlocks },
    staffXp: {},
    guestHistory: [],
    eventHistory: [],
    pendingEvents: [],
    unlockedAchievements: [],
    purchasedUpgrades: [],
    statusMessage:
      "The café opens. The guestbook quietly writes: Previous runs: [REDACTED]."
  };
}

/**
 * The real start of a fresh café week: Day 1 begins in the "setup" phase with
 * no equipment owned. The player buys a coffee machine and (optionally) used
 * furniture from the setup shop, then opens. Used by the app initializer and
 * reset_game; createInitialGameState() stays the already-open baseline that the
 * existing test suite builds on. See the "setup" phase and #setup.
 */
export function createFreshRunState(): GameState {
  return {
    ...createInitialGameState(),
    dayPhase: "setup",
    phaseLabel: "Before opening",
    resources: { ...initialResources, money: initialResources.money + INITIAL_GRINDER_COST },
    equipment: { machine: 0, grinder: 0, clock: 0, seating: 0, register: 1 },
    statusMessage:
      "An empty room and a small till. Buy a coffee machine and grinder to open the doors. Seating and a replacement clock are optional."
  };
}

export function isValidGameState(value: unknown): value is GameState {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<GameState>;

  return (
    candidate.version === CURRENT_GAME_STATE_VERSION &&
    candidate.contentCatalogVersion === CURRENT_CONTENT_CATALOG_VERSION &&
    typeof candidate.day === "number" &&
    Number.isInteger(candidate.day) &&
    candidate.day >= 1 &&
    candidate.day <= 7 &&
    isValidDayPhase(candidate.dayPhase) &&
    typeof candidate.phaseLabel === "string" &&
    typeof candidate.statusMessage === "string" &&
    isNonNegativeNumber(candidate.hiddenWeirdness) &&
    typeof candidate.weirdnessVisible === "boolean" &&
    typeof candidate.kassandraInstalled === "boolean" &&
    typeof candidate.demoComplete === "boolean" &&
    typeof candidate.cafeClosed === "boolean" &&
    (candidate.closureReason === null ||
      candidate.closureReason === "money" ||
      candidate.closureReason === "reputation") &&
    typeof candidate.moneyZeroStreak === "number" &&
    Number.isInteger(candidate.moneyZeroStreak) &&
    candidate.moneyZeroStreak >= 0 &&
    candidate.moneyZeroStreak <= 2 &&
    isCounter(candidate.reputationZeroStreak) &&
    isValidDecor(candidate.decor) &&
    isValidEquipment(candidate.equipment) &&
    isValidRun(candidate.run) &&
    isValidGuestMemory(candidate.guestMemory) &&
    isValidResources(candidate.resources) &&
    isValidSupplies(candidate.supplies) &&
    isValidSupplyPurchase(candidate.pendingSupplyPurchase) &&
    isValidDayManagement(candidate.dayManagement) &&
    isValidHelperAssignment(candidate.helperAssignment) &&
    isValidDaySummary(candidate.daySummary) &&
    isValidObjectiveResults(candidate.objectiveResults) &&
    isValidUnlocks(candidate.unlocks) &&
    isStringArray(candidate.stressEventLog) &&
    isStringArray(candidate.completedActions) &&
    isStringArray(candidate.guestHistory) &&
    isStringArray(candidate.eventHistory) &&
    isStringArray(candidate.pendingEvents) &&
    isStringArray(candidate.unlockedAchievements) &&
    isStringArray(candidate.purchasedUpgrades) &&
    isValidStaffXp(candidate.staffXp)
  );
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isNonNegativeNumber(value: unknown): value is number {
  return isFiniteNumber(value) && value >= 0;
}

function isCounter(value: unknown): value is number {
  return isNonNegativeNumber(value) && Number.isInteger(value);
}

function isMeter(value: unknown): value is number {
  return isNonNegativeNumber(value) && value <= 100;
}

function isValidResources(value: unknown): value is ResourceState {
  if (!value || typeof value !== "object") {
    return false;
  }

  const resources = value as Partial<ResourceState>;
  const validMoodValues: ResourceState["mood"][] = ["calm", "busy", "strained"];

  return (
    isNonNegativeNumber(resources.money) &&
    isMeter(resources.reputation) &&
    isMeter(resources.cleanliness) &&
    isMeter(resources.stress) &&
    typeof resources.mood === "string" &&
    validMoodValues.includes(resources.mood)
  );
}

function isValidSupplies(value: unknown): value is SupplyState {
  if (!value || typeof value !== "object") {
    return false;
  }

  const supplies = value as Partial<SupplyState>;

  return (Object.keys(SUPPLY_CAPS) as IngredientKey[]).every(
    (ingredient) =>
      typeof supplies[ingredient] === "number" &&
      Number.isFinite(supplies[ingredient] ?? Number.NaN) &&
      (supplies[ingredient] ?? -1) >= 0 &&
      (supplies[ingredient] ?? Number.POSITIVE_INFINITY) <= SUPPLY_CAPS[ingredient]
  );
}

function isValidSupplyPurchase(value: unknown): value is SupplyPurchaseState {
  return isValidSupplies(value);
}

/** Consumption is a cumulative total, not stock limited by shelf capacity. */
function isValidSupplyUsage(value: unknown): value is SupplyState {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const supplies = value as Partial<SupplyState>;
  return (Object.keys(SUPPLY_CAPS) as IngredientKey[]).every(
    (ingredient) => isNonNegativeNumber(supplies[ingredient])
  );
}

function isValidDayManagement(value: unknown): value is DayManagementState {
  if (!value || typeof value !== "object") {
    return false;
  }

  const management = value as Partial<DayManagementState>;
  const impact = management.dayFiveHelperImpact;
  const observations = management.dayThreeObservations;

  return (
    isCounter(management.actionPointsRemaining) &&
    isCounter(management.actionPointsSpent) &&
    isCounter(management.customersServed) &&
    isNonNegativeNumber(management.moneyEarned) &&
    isNonNegativeNumber(management.moneySpent) &&
    isValidSupplyUsage(management.suppliesUsed) &&
    isCounter(management.cleaningActions) &&
    isValidTableIdArray(management.dirtyTableIds) &&
    (management.servedGuestIds === undefined ||
      (Array.isArray(management.servedGuestIds) &&
        management.servedGuestIds.every((id) => typeof id === "string"))) &&
    typeof management.offerReviewed === "boolean" &&
    typeof management.advertisingRun === "boolean" &&
    typeof management.socialAdRun === "boolean" &&
    typeof management.kassandraConsulted === "boolean" &&
    typeof management.helperDecisionMade === "boolean" &&
    isMeter(management.reputationAtStart) &&
    typeof management.cleanlinessStressApplied === "boolean" &&
    typeof management.noCleaningStressApplied === "boolean" &&
    isIngredientArray(management.emptySupplyStressIngredients) &&
    typeof management.slowCleaningStressReductionUsed === "boolean" &&
    isCounter(management.baristaReputationBonus) &&
    isCounter(management.helperExtraOrdersRemaining) &&
    isCounter(management.extraAdvertisingActions) &&
    isCounter(management.appreciationBonusesGiven) &&
    isCounter(management.decorBonusesGiven) &&
    isMeter(management.currentGuestPatience) &&
    isMeter(management.currentGuestPatienceMax) &&
    management.currentGuestPatience <= management.currentGuestPatienceMax &&
    isCounter(management.guestsLost) &&
    isCounter(management.serveStreak) &&
    isCounter(management.bestServeStreak) &&
    isCounter(management.actionsWithoutServing) &&
    isCounter(management.helperAutonomousActions) &&
    (management.doubleEspressoServed === undefined || typeof management.doubleEspressoServed === "boolean") &&
    (observations === undefined ||
      (observations !== null && typeof observations === "object" && !Array.isArray(observations) &&
        typeof observations.janaServed === "boolean" &&
        isIngredientArray(observations.missingIngredients))) &&
    (impact === undefined ||
      (impact !== null && typeof impact === "object" && !Array.isArray(impact) &&
        isMeter(impact.openingStressReduction) &&
        isCounter(impact.extraOrders) &&
        isNonNegativeNumber(impact.cleanlinessRestored) &&
        isNonNegativeNumber(impact.reputationGained) &&
        isCounter(impact.milkSaved)))
  );
}

function isValidTableIdArray(value: unknown): value is TableId[] {
  return (
    Array.isArray(value) &&
    value.every((tableId) => typeof tableId === "string" && ["left", "right", "back"].includes(tableId)) &&
    new Set(value).size === value.length
  );
}

function isValidHelperAssignment(value: unknown): value is HelperAssignment | null {
  if (value === null) {
    return true;
  }

  if (!value || typeof value !== "object") {
    return false;
  }

  const assignment = value as Partial<HelperAssignment>;

  return (
    typeof assignment.helperId === "string" &&
    typeof assignment.taskId === "string" &&
    isValidHelperTaskPair(assignment.helperId, assignment.taskId) &&
    typeof assignment.locked === "boolean" &&
    isNonNegativeNumber(assignment.dailyCost) &&
    typeof assignment.flavorLine === "string" &&
    typeof assignment.autonomyLevel === "string" &&
    ["micromanagement", "learning", "autonomous"].includes(assignment.autonomyLevel)
  );
}

function isValidHelperTaskPair(helperId: unknown, taskId: unknown): boolean {
  if (typeof helperId !== "string" || typeof taskId !== "string") {
    return false;
  }

  const validTasks: Record<HelperAssignment["helperId"], readonly HelperTaskId[]> = {
    jana: ["cleaning", "service"],
    nino: ["barista", "counter"],
    nele: ["marketing", "counter"]
  };

  return (
    Object.prototype.hasOwnProperty.call(validTasks, helperId) &&
    validTasks[helperId as HelperAssignment["helperId"]].includes(taskId as HelperTaskId)
  );
}

function isValidDaySummary(value: unknown): value is DaySummary | null {
  if (value === null) {
    return true;
  }

  if (!value || typeof value !== "object") {
    return false;
  }

  const summary = value as Partial<DaySummary>;

  return (
    isCounter(summary.day) && summary.day >= 1 && summary.day <= 7 &&
    typeof summary.rating === "string" &&
    isNonNegativeNumber(summary.moneyEarned) &&
    isNonNegativeNumber(summary.moneySpent) &&
    isCounter(summary.customersServed) &&
    isCounter(summary.guestsLost) &&
    isCounter(summary.bestServeStreak) &&
    isValidSupplyUsage(summary.suppliesUsed) &&
    isValidSupplies(summary.suppliesRestocked) &&
    isValidSupplies(summary.suppliesRemaining) &&
    typeof summary.cleanlinessLabel === "string" &&
    typeof summary.stressLabel === "string" &&
    isFiniteNumber(summary.reputationDelta) &&
    typeof summary.objectiveTitle === "string" &&
    typeof summary.objectiveCompleted === "boolean" &&
    isNonNegativeNumber(summary.dailyOverhead) &&
    (summary.helperRecap === null || typeof summary.helperRecap === "string") &&
    (summary.helperAutonomyRecap === undefined ||
      summary.helperAutonomyRecap === null || typeof summary.helperAutonomyRecap === "string") &&
    (summary.stressEvent === null || typeof summary.stressEvent === "string") &&
    isStringArray(summary.flavorLines)
  );
}

function isValidObjectiveResults(value: unknown): value is DayObjectiveResult[] {
  return (
    Array.isArray(value) &&
    value.every((entry) => {
      if (!entry || typeof entry !== "object") {
        return false;
      }

      const result = entry as Partial<DayObjectiveResult>;

      return (
        typeof result.day === "number" &&
        Number.isInteger(result.day) &&
        result.day >= 1 &&
        result.day <= 7 &&
        typeof result.objectiveId === "string" &&
        typeof result.title === "string" &&
        (result.status === "completed" || result.status === "missed")
      );
    })
  );
}

function isValidDayPhase(value: unknown): value is DayPhase {
  return (
    typeof value === "string" &&
    ["setup", "day_start", "open", "day_end"].includes(value)
  );
}

/** All equipment slot keys that must exist in a valid save (tier >= 0). */
const EQUIPMENT_SLOT_KEYS = ["machine", "grinder", "clock", "seating", "register"] as const;

function isValidEquipment(
  value: unknown
): value is Record<typeof EQUIPMENT_SLOT_KEYS[number], number> {
  if (!value || typeof value !== "object") {
    return false;
  }
  const equipment = value as Record<string, unknown>;
  return EQUIPMENT_SLOT_KEYS.every(
    (slot) =>
      typeof equipment[slot] === "number" &&
      Number.isInteger(equipment[slot]) &&
      (equipment[slot] as number) >= 0
  );
}

function isValidUnlocks(value: unknown): value is UnlockState {
  if (!value || typeof value !== "object") {
    return false;
  }

  const unlocks = value as Partial<UnlockState>;

  return (
    typeof unlocks.pricing === "boolean" &&
    typeof unlocks.advertising === "boolean" &&
    typeof unlocks.staff === "boolean" &&
    typeof unlocks.kassandra === "boolean" &&
    typeof unlocks.apocalypseOperations === "boolean"
  );
}

/** All décor slot keys that must exist in a valid save. */
const DECOR_SLOT_KEYS = ["plant", "plant2", "shelf", "clock", "lamp", "cups"] as const;

function isValidDecor(value: unknown): value is Record<typeof DECOR_SLOT_KEYS[number], number> {
  if (!value || typeof value !== "object") {
    return false;
  }
  const decor = value as Record<string, unknown>;
  return DECOR_SLOT_KEYS.every(
    (slot) => typeof decor[slot] === "number" && Number.isInteger(decor[slot]) && (decor[slot] as number) >= 1
  );
}

const DAY_MODIFIER_IDS = [
  "soft-opening",
  "commuter-wave",
  "inventory-audit",
  "poster-echo",
  "short-staffed",
  "forecast-static",
  "inspection-pressure"
] as const satisfies readonly DayModifierId[];

function isValidRun(value: unknown): value is RunState {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const run = value as Partial<RunState>;

  return (
    typeof run.runNumber === "number" &&
    Number.isInteger(run.runNumber) &&
    run.runNumber >= 1 &&
    typeof run.seed === "number" &&
    Number.isInteger(run.seed) &&
    Array.isArray(run.modifierIds) &&
    run.modifierIds.length === 7 &&
    run.modifierIds.every((id) =>
      DAY_MODIFIER_IDS.includes(id as (typeof DAY_MODIFIER_IDS)[number])
    ) &&
    isStringArray(run.memoryFragments)
  );
}

const PRODUCT_IDS = [
  "filterkaffee",
  "espresso",
  "cappuccino",
  "croissant",
  "kaffee-croissant",
  "handfilter"
] as const;

const GUEST_IDS = [
  "pendler-kemal",
  "pendlerin-paula",
  "pendlerin-fatou",
  "laptop-lukas",
  "lieferfahrer-cem",
  "cappuccino-christa",
  "herr-bohn",
  "freelancerin-nele",
  "herr-grau",
  "frau-roter-regenschirm",
  "meda",
  "nachbarin-mira"
] as const;

function isValidGuestMemory(value: unknown): value is Partial<Record<GuestId, GuestMemoryEntry>> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const memory = value as Record<string, unknown>;

  return Object.entries(memory).every(([guestId, entry]) => {
    if (!GUEST_IDS.includes(guestId as (typeof GUEST_IDS)[number])) {
      return false;
    }

    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      return false;
    }

    const guestMemory = entry as Partial<GuestMemoryEntry>;
    const lastProductValid =
      guestMemory.lastServedProductId === undefined ||
      PRODUCT_IDS.includes(guestMemory.lastServedProductId as (typeof PRODUCT_IDS)[number]);
    const knownPreferenceValid =
      guestMemory.knownPreferenceId === undefined ||
      PRODUCT_IDS.includes(guestMemory.knownPreferenceId as (typeof PRODUCT_IDS)[number]);

    return (
      typeof guestMemory.visits === "number" &&
      Number.isInteger(guestMemory.visits) &&
      guestMemory.visits >= 0 &&
      typeof guestMemory.matchedPreferences === "number" &&
      Number.isInteger(guestMemory.matchedPreferences) &&
      guestMemory.matchedPreferences >= 0 &&
      lastProductValid &&
      knownPreferenceValid
    );
  });
}

/**
 * Migrate a raw parsed save written by an older release so it passes
 * isValidGameState. Called by loadGameState before validation so existing
 * localStorage saves are not wiped. Only runs if the raw value looks like
 * an object; does nothing otherwise.
 *
 * v8 -> v9: day summaries gained `dailyOverhead`; helper "mira" renamed to "nele".
 * v9 -> v10: `staffXp` object added (defaults to empty {}).
 * v10 -> v11: soft-run metadata and guest memory added.
 * v11 -> v12: `socialAdRun` added to dayManagement.
 * v12 -> v13: core `equipment` slots added. Old saves were already-open cafés
 *   with tables, so they migrate to machine 1 / seating 1.
 * v13 -> v14: `purchasedUpgrades` array added (defaults to []).
 * v16 -> v17: `helperAssignment.autonomyLevel` and `dayManagement.helperAutonomousActions`
 *   added (helper autonomy state machine, #132). Default to "micromanagement" / 0.
 * v18 -> v19: `moneyZeroStreak` added for the rescue shift. An open café already
 *   at a 0 Asche day-end starts at 1; other missing counters start at 0. Closures stay closed.
 * Older versions may also lack décor slots added after the save was written
 * (clock/lamp/cups).
 */
export function migrateRawSave(raw: unknown): unknown {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return raw;
  }
  const obj = { ...(raw as Record<string, unknown>) };
  let patched = false;

  if (obj.version === 8) {
    obj.version = 9;
    patched = true;

    const summary = obj.daySummary;
    if (summary && typeof summary === "object" && !Array.isArray(summary)) {
      const s = summary as Record<string, unknown>;
      if (typeof s.dailyOverhead !== "number") {
        obj.daySummary = { ...s, dailyOverhead: 0 };
      }
    }

    const assignment = obj.helperAssignment;
    if (assignment && typeof assignment === "object" && !Array.isArray(assignment)) {
      const a = assignment as Record<string, unknown>;
      if (a.helperId === "mira") {
        obj.helperAssignment = {
          ...a,
          helperId: "nele",
          taskId: isValidHelperTaskPair("nele", a.taskId) ? a.taskId : "counter"
        };
      }
    }
  }

  if (obj.version === 9) {
    obj.version = 10;
    patched = true;

    if (!obj.staffXp || typeof obj.staffXp !== "object" || Array.isArray(obj.staffXp)) {
      obj.staffXp = {};
    }
  }

  if (obj.version === 10) {
    obj.version = 11;
    patched = true;

    if (!obj.run || typeof obj.run !== "object" || Array.isArray(obj.run)) {
      obj.run = {
        ...initialRun,
        modifierIds: [...initialRun.modifierIds],
        memoryFragments: []
      };
    }

    if (
      !obj.guestMemory ||
      typeof obj.guestMemory !== "object" ||
      Array.isArray(obj.guestMemory)
    ) {
      obj.guestMemory = {};
    }
  }

  if (obj.version === 11) {
    obj.version = 12;
    patched = true;

    if (obj.dayManagement && typeof obj.dayManagement === "object" && !Array.isArray(obj.dayManagement)) {
      const dm = obj.dayManagement as Record<string, unknown>;
      if (typeof dm.socialAdRun !== "boolean") {
        obj.dayManagement = { ...dm, socialAdRun: false };
      }
    }
  }

  if (obj.version === 12) {
    obj.version = 13;
    patched = true;

    if (
      !obj.equipment ||
      typeof obj.equipment !== "object" ||
      Array.isArray(obj.equipment)
    ) {
      // Pre-equipment saves were already-open cafés with tables in the room.
      obj.equipment = { machine: 1, seating: 1 };
    }

    if (obj.dayManagement && typeof obj.dayManagement === "object" && !Array.isArray(obj.dayManagement)) {
      const dm = obj.dayManagement as Record<string, unknown>;
      if (typeof dm.currentGuestPatience !== "number") {
        dm.currentGuestPatience = 0;
      }
      if (typeof dm.currentGuestPatienceMax !== "number") {
        dm.currentGuestPatienceMax = 0;
      }
      if (typeof dm.guestsLost !== "number") {
        dm.guestsLost = 0;
      }
      if (typeof dm.serveStreak !== "number") {
        dm.serveStreak = 0;
      }
      if (typeof dm.bestServeStreak !== "number") {
        dm.bestServeStreak = 0;
      }
      obj.dayManagement = dm;
    }

    if (obj.daySummary && typeof obj.daySummary === "object" && !Array.isArray(obj.daySummary)) {
      const s = obj.daySummary as Record<string, unknown>;
      const patchedSummary: Record<string, unknown> = { ...s };
      let summaryPatched = false;
      if (typeof s.guestsLost !== "number") {
        patchedSummary.guestsLost = 0;
        summaryPatched = true;
      }
      if (typeof s.bestServeStreak !== "number") {
        patchedSummary.bestServeStreak = 0;
        summaryPatched = true;
      }
      if (summaryPatched) {
        obj.daySummary = patchedSummary;
      }
    }
  }

  if (obj.version === 13) {
    obj.version = 14;
    patched = true;

    if (!Array.isArray(obj.purchasedUpgrades)) {
      obj.purchasedUpgrades = [];
    }
  }

  if (obj.version === 14) {
    obj.version = 15;
    patched = true;

    if (obj.decor && typeof obj.decor === "object" && !Array.isArray(obj.decor)) {
      const dm = obj.decor as Record<string, unknown>;
      if (typeof dm.plant2 !== "number") {
        obj.decor = { ...dm, plant2: 1 };
      }
    }
  }

  if (obj.version === 15) {
    obj.version = 16;
    patched = true;

    if (obj.dayManagement && typeof obj.dayManagement === "object" && !Array.isArray(obj.dayManagement)) {
      const dm = obj.dayManagement as Record<string, unknown>;
      if (typeof dm.actionsWithoutServing !== "number") {
        obj.dayManagement = { ...dm, actionsWithoutServing: 0 };
      }
    }
  }

  if (obj.version === 16) {
    obj.version = 17;
    patched = true;

    if (obj.dayManagement && typeof obj.dayManagement === "object" && !Array.isArray(obj.dayManagement)) {
      const dm = obj.dayManagement as Record<string, unknown>;
      if (typeof dm.helperAutonomousActions !== "number") {
        obj.dayManagement = { ...dm, helperAutonomousActions: 0 };
      }
    }

    const assignment = obj.helperAssignment;
    if (assignment && typeof assignment === "object" && !Array.isArray(assignment)) {
      const a = assignment as Record<string, unknown>;
      if (typeof a.autonomyLevel !== "string") {
        obj.helperAssignment = { ...a, autonomyLevel: "micromanagement" };
      }
    }
  }

  if (obj.version === 17) {
    obj.version = 18;
    patched = true;

    if (obj.dayManagement && typeof obj.dayManagement === "object" && !Array.isArray(obj.dayManagement)) {
      const dm = obj.dayManagement as Record<string, unknown>;
      if (!Array.isArray(dm.dirtyTableIds)) {
        obj.dayManagement = { ...dm, dirtyTableIds: [] };
      }
    }
  }

  if (obj.version === 18) {
    obj.version = 19;
    patched = true;

    if (obj.moneyZeroStreak === undefined) {
      const resources = obj.resources;
      const hasZeroBalance =
        resources !== null &&
        typeof resources === "object" &&
        !Array.isArray(resources) &&
        (resources as Record<string, unknown>).money === 0;
      obj.moneyZeroStreak =
        obj.cafeClosed === false && obj.dayPhase === "day_end" && hasZeroBalance ? 1 : 0;
    }
  }

  if (obj.decor && typeof obj.decor === "object" && !Array.isArray(obj.decor)) {
    const decor = { ...(obj.decor as Record<string, unknown>) };
    for (const slot of DECOR_SLOT_KEYS) {
      if (typeof decor[slot] !== "number") {
        decor[slot] = 1;
        patched = true;
      }
    }
    obj.decor = decor;
  }

  if (obj.equipment && typeof obj.equipment === "object" && !Array.isArray(obj.equipment)) {
    const equipment = { ...(obj.equipment as Record<string, unknown>) };
    // A pre-Arcana setup without a machine still needs the new grinder.
    // Preserve its spending power once, as part of the equipment migration.
    if (obj.dayPhase === "setup" && equipment.machine === 0 &&
        typeof equipment.grinder !== "number" && obj.resources && typeof obj.resources === "object") {
      const resources = obj.resources as Record<string, unknown>;
      if (typeof resources.money === "number") {
        obj.resources = { ...resources, money: resources.money + INITIAL_GRINDER_COST };
      }
    }

    for (const slot of EQUIPMENT_SLOT_KEYS) {
      if (typeof equipment[slot] !== "number") {
        equipment[slot] = slot === "grinder" && equipment.machine === 0 ? 0 : 1;
        patched = true;
      }
    }
    obj.equipment = equipment;
  }

  if (!Array.isArray(obj.pendingEvents)) {
    obj.pendingEvents = [];
    patched = true;
  }

  // Stale v13 saves written before the serve-flow streak was introduced are
  // missing these two fields. Patch them unconditionally so they pass validation.
  if (obj.dayManagement && typeof obj.dayManagement === "object" && !Array.isArray(obj.dayManagement)) {
    const dm = obj.dayManagement as Record<string, unknown>;
    if (typeof dm.serveStreak !== "number" || typeof dm.bestServeStreak !== "number") {
      obj.dayManagement = {
        ...dm,
        ...(typeof dm.serveStreak !== "number" ? { serveStreak: 0 } : {}),
        ...(typeof dm.bestServeStreak !== "number" ? { bestServeStreak: 0 } : {})
      };
      patched = true;
    }
  }

  if (obj.run && typeof obj.run === "object" && !Array.isArray(obj.run)) {
    const run = { ...(obj.run as Record<string, unknown>) };
    if (!Array.isArray(run.modifierIds) || run.modifierIds.length !== 7) {
      run.modifierIds = [...initialRun.modifierIds];
      patched = true;
    }
    if (!Array.isArray(run.memoryFragments)) {
      run.memoryFragments = [];
      patched = true;
    }
    if (typeof run.runNumber !== "number") {
      run.runNumber = 1;
      patched = true;
    }
    if (typeof run.seed !== "number") {
      run.seed = initialRun.seed;
      patched = true;
    }
    obj.run = run;
  }

  return patched ? obj : raw;
}

const STAFF_OPTION_IDS = ["jana", "nino", "nele"] as const;

function isValidStaffXp(value: unknown): boolean {
  if (value === null || value === undefined) {
    return false;
  }
  if (typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const obj = value as Record<string, unknown>;
  for (const key of Object.keys(obj)) {
    if (!STAFF_OPTION_IDS.includes(key as (typeof STAFF_OPTION_IDS)[number])) {
      return false;
    }
    if (typeof obj[key] !== "number" || !Number.isFinite(obj[key] as number) || (obj[key] as number) < 0) {
      return false;
    }
  }
  return true;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === "string");
}

function isIngredientArray(value: unknown): value is IngredientKey[] {
  return (
    Array.isArray(value) &&
    value.every((entry) => ["coffee", "milk", "pastries"].includes(entry))
  );
}

export function addUniqueDayAction(
  actions: readonly DayActionId[],
  action: DayActionId
): DayActionId[] {
  return actions.includes(action) ? [...actions] : [...actions, action];
}

export function addUniqueGuestIds(
  currentIds: readonly GuestId[],
  idsToAdd: readonly GuestId[]
): GuestId[] {
  return addUniqueIds(currentIds, idsToAdd);
}

export function addUniqueEventIds(
  currentIds: readonly EventId[],
  idsToAdd: readonly EventId[]
): EventId[] {
  return addUniqueIds(currentIds, idsToAdd);
}

export function addUniqueAchievementIds(
  currentIds: readonly AchievementId[],
  idsToAdd: readonly AchievementId[]
): AchievementId[] {
  return addUniqueIds(currentIds, idsToAdd);
}

function addUniqueIds<T extends string>(currentIds: readonly T[], idsToAdd: readonly T[]): T[] {
  const result = [...currentIds];

  for (const id of idsToAdd) {
    if (!result.includes(id)) {
      result.push(id);
    }
  }

  return result;
}
