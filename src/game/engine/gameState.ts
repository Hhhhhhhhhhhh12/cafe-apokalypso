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
  IngredientKey,
  ResourceState,
  RunState,
  SupplyPurchaseState,
  SupplyState,
  UnlockState
} from "../types/game";
import { createInitialDayManagement, STARTING_REPUTATION, SUPPLY_CAPS } from "./management";

export const CURRENT_GAME_STATE_VERSION = 13;
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
    reputationZeroStreak: 0,
    decor: { plant: 1, shelf: 1, clock: 1, lamp: 1, cups: 1 },
    equipment: { machine: 1, seating: 1 },
    run: { ...initialRun, modifierIds: [...initialRun.modifierIds], memoryFragments: [] },
    guestMemory: {},
    completedActions: [],
    unlocks: { ...initialUnlocks },
    staffXp: {},
    guestHistory: [],
    eventHistory: [],
    unlockedAchievements: [],
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
    equipment: { machine: 0, seating: 0 },
    statusMessage:
      "An empty room and a small till. Buy a coffee machine and some furniture, then open the doors."
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
    typeof candidate.hiddenWeirdness === "number" &&
    typeof candidate.weirdnessVisible === "boolean" &&
    typeof candidate.kassandraInstalled === "boolean" &&
    typeof candidate.demoComplete === "boolean" &&
    typeof candidate.cafeClosed === "boolean" &&
    (candidate.closureReason === null ||
      candidate.closureReason === "money" ||
      candidate.closureReason === "reputation") &&
    typeof candidate.reputationZeroStreak === "number" &&
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
    isStringArray(candidate.unlockedAchievements) &&
    isValidStaffXp(candidate.staffXp)
  );
}

function isValidResources(value: unknown): value is ResourceState {
  if (!value || typeof value !== "object") {
    return false;
  }

  const resources = value as Partial<ResourceState>;
  const validMoodValues: ResourceState["mood"][] = ["calm", "busy", "strained"];

  return (
    typeof resources.money === "number" &&
    typeof resources.reputation === "number" &&
    typeof resources.cleanliness === "number" &&
    typeof resources.stress === "number" &&
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

function isValidDayManagement(value: unknown): value is DayManagementState {
  if (!value || typeof value !== "object") {
    return false;
  }

  const management = value as Partial<DayManagementState>;

  return (
    typeof management.actionPointsRemaining === "number" &&
    typeof management.actionPointsSpent === "number" &&
    typeof management.customersServed === "number" &&
    typeof management.moneyEarned === "number" &&
    typeof management.moneySpent === "number" &&
    isValidSupplies(management.suppliesUsed) &&
    typeof management.cleaningActions === "number" &&
    typeof management.offerReviewed === "boolean" &&
    typeof management.advertisingRun === "boolean" &&
    typeof management.socialAdRun === "boolean" &&
    typeof management.kassandraConsulted === "boolean" &&
    typeof management.helperDecisionMade === "boolean" &&
    typeof management.reputationAtStart === "number" &&
    typeof management.cleanlinessStressApplied === "boolean" &&
    typeof management.noCleaningStressApplied === "boolean" &&
    isIngredientArray(management.emptySupplyStressIngredients) &&
    typeof management.slowCleaningStressReductionUsed === "boolean" &&
    typeof management.baristaReputationBonus === "number" &&
    typeof management.helperExtraOrdersRemaining === "number" &&
    typeof management.extraAdvertisingActions === "number" &&
    typeof management.appreciationBonusesGiven === "number" &&
    typeof management.currentGuestPatience === "number" &&
    typeof management.currentGuestPatienceMax === "number" &&
    typeof management.guestsLost === "number"
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
    ["jana", "nino", "nele"].includes(assignment.helperId) &&
    typeof assignment.taskId === "string" &&
    ["cleaning", "service", "barista", "counter", "marketing"].includes(
      assignment.taskId
    ) &&
    typeof assignment.locked === "boolean" &&
    typeof assignment.dailyCost === "number" &&
    typeof assignment.flavorLine === "string"
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
    typeof summary.day === "number" &&
    typeof summary.rating === "string" &&
    typeof summary.moneyEarned === "number" &&
    typeof summary.moneySpent === "number" &&
    typeof summary.customersServed === "number" &&
    isValidSupplies(summary.suppliesUsed) &&
    isValidSupplies(summary.suppliesRestocked) &&
    isValidSupplies(summary.suppliesRemaining) &&
    typeof summary.cleanlinessLabel === "string" &&
    typeof summary.stressLabel === "string" &&
    typeof summary.reputationDelta === "number" &&
    typeof summary.objectiveTitle === "string" &&
    typeof summary.objectiveCompleted === "boolean" &&
    typeof summary.dailyOverhead === "number" &&
    (summary.helperRecap === null || typeof summary.helperRecap === "string") &&
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
const EQUIPMENT_SLOT_KEYS = ["machine", "seating"] as const;

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
const DECOR_SLOT_KEYS = ["plant", "shelf", "clock", "lamp", "cups"] as const;

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
  "pendlerin-paula",
  "laptop-lukas",
  "lieferfahrer-cem",
  "cappuccino-christa",
  "herr-bohn",
  "freelancerin-nele",
  "herr-grau",
  "frau-roter-regenschirm",
  "meda"
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
        obj.helperAssignment = { ...a, helperId: "nele" };
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
      obj.dayManagement = dm;
    }

    if (obj.daySummary && typeof obj.daySummary === "object" && !Array.isArray(obj.daySummary)) {
      const s = obj.daySummary as Record<string, unknown>;
      if (typeof s.guestsLost !== "number") {
        obj.daySummary = { ...s, guestsLost: 0 };
      }
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
    for (const slot of EQUIPMENT_SLOT_KEYS) {
      if (typeof equipment[slot] !== "number") {
        equipment[slot] = 1;
        patched = true;
      }
    }
    obj.equipment = equipment;
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
