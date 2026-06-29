import { describe, expect, it } from "vitest";
import { createFreshRunState, createInitialGameState } from "../src/game/engine/gameState";
import { gameReducer } from "../src/game/engine/reducer";
import { getDioramaGuestVisibility, getEquipmentShopOptions } from "../src/game/engine/selectors";
import { getEquipmentDailyBonuses } from "../src/game/data/equipment";

describe("createFreshRunState", () => {
  it("starts in setup phase with no machine/seating but the basic till already on the counter", () => {
    const state = createFreshRunState();
    expect(state.dayPhase).toBe("setup");
    expect(state.equipment.machine).toBe(0);
    expect(state.equipment.seating).toBe(0);
    // The register is never unowned — every café opens with the small till (tier 1).
    expect(state.equipment.register).toBe(1);
  });

  it("has the same starting money as createInitialGameState", () => {
    expect(createFreshRunState().resources.money).toBe(
      createInitialGameState().resources.money
    );
  });
});

describe("finish_setup action", () => {
  it("is blocked without a coffee machine", () => {
    const state = createFreshRunState();
    expect(state.equipment.machine).toBe(0);
    const next = gameReducer(state, { type: "finish_setup" });
    expect(next.dayPhase).toBe("setup");
    expect(next.statusMessage).toMatch(/coffee machine/i);
  });

  it("transitions to open after buying a machine", () => {
    let state = createFreshRunState();
    state = gameReducer(state, { type: "buy_equipment", slot: "machine" });
    expect(state.equipment.machine).toBe(1);
    state = gameReducer(state, { type: "finish_setup" });
    expect(state.dayPhase).toBe("open");
  });

  it("opens without seating and mentions standing room only", () => {
    let state = createFreshRunState();
    state = gameReducer(state, { type: "buy_equipment", slot: "machine" });
    state = gameReducer(state, { type: "finish_setup" });
    expect(state.dayPhase).toBe("open");
    expect(state.statusMessage).toMatch(/standing room/i);
  });

  it("opens with seating and shows a regular open message", () => {
    let state = createFreshRunState();
    state = gameReducer(state, { type: "buy_equipment", slot: "machine" });
    state = gameReducer(state, { type: "buy_equipment", slot: "seating" });
    state = gameReducer(state, { type: "finish_setup" });
    expect(state.dayPhase).toBe("open");
    expect(state.statusMessage).toMatch(/doors open/i);
  });

  it("is a no-op outside setup phase", () => {
    const state = createInitialGameState();
    expect(state.dayPhase).toBe("open");
    const next = gameReducer(state, { type: "finish_setup" });
    expect(next.dayPhase).toBe("open");
  });
});

describe("buy_equipment action", () => {
  it("deducts cost and increments tier", () => {
    const state = createFreshRunState();
    const moneyBefore = state.resources.money;
    const next = gameReducer(state, { type: "buy_equipment", slot: "machine" });
    expect(next.equipment.machine).toBe(1);
    expect(next.resources.money).toBeLessThan(moneyBefore);
  });

  it("grants a reputation bonus when the tier has one", () => {
    // Tier 2 machine has reputationBonus: 2 — need to own tier 1 first.
    let state = createInitialGameState(); // already in open, equipment 1/1
    // Give enough money to afford tier 2 (€34)
    state = { ...state, resources: { ...state.resources, money: 100 }, dayPhase: "day_end" as const };
    const repBefore = state.resources.reputation;
    const next = gameReducer(state, { type: "buy_equipment", slot: "machine" });
    expect(next.equipment.machine).toBe(2);
    expect(next.resources.reputation).toBe(repBefore + 2);
  });

  it("is blocked when the player cannot afford the next tier", () => {
    // Use €1 so the till-empty closure doesn't fire before buyEquipment runs.
    const state = { ...createFreshRunState(), resources: { ...createFreshRunState().resources, money: 1 } };
    const next = gameReducer(state, { type: "buy_equipment", slot: "machine" });
    expect(next.equipment.machine).toBe(0);
    expect(next.statusMessage).toMatch(/not enough money/i);
  });

  it("is blocked at max tier", () => {
    // Set machine to tier 3 manually
    const state = {
      ...createInitialGameState(),
      dayPhase: "day_end" as const,
      equipment: { machine: 3, seating: 1, register: 1 }
    };
    const next = gameReducer(state, { type: "buy_equipment", slot: "machine" });
    expect(next.equipment.machine).toBe(3);
  });

  it("is blocked outside setup and day_end phases", () => {
    const state = createInitialGameState(); // dayPhase: 'open', machine already at 1
    const next = gameReducer(state, { type: "buy_equipment", slot: "machine" });
    // machine was 1; the phase check fires before the tier bump
    expect(next.equipment.machine).toBe(1);
    expect(next.statusMessage).toMatch(/Equipment is bought|before opening|day-end/i);
  });
});

describe("getDioramaGuestVisibility seating gate", () => {
  it("returns all false when seating is 0", () => {
    const state = createFreshRunState();
    expect(state.equipment.seating).toBe(0);
    const vis = getDioramaGuestVisibility(state);
    expect(Object.values(vis).every((v) => v === false)).toBe(true);
  });

  it("allows seated guests once seating >= 1", () => {
    // Use createInitialGameState which has seating 1 and serve enough customers
    const state = {
      ...createInitialGameState(),
      dayManagement: {
        ...createInitialGameState().dayManagement,
        customersServed: 3
      }
    };
    const vis = getDioramaGuestVisibility(state);
    expect(vis.cem).toBe(true);
    expect(vis.mira).toBe(true);
    expect(vis.lukas).toBe(true);
  });
});

describe("getEquipmentShopOptions", () => {
  it("marks machine as unowned when tier is 0", () => {
    const state = createFreshRunState();
    const options = getEquipmentShopOptions(state);
    const machine = options.find((o) => o.id === "machine");
    expect(machine?.unowned).toBe(true);
  });

  it("shows a next-tier option with affordability flag", () => {
    const state = createFreshRunState();
    const options = getEquipmentShopOptions(state);
    const machine = options.find((o) => o.id === "machine");
    expect(machine?.next).not.toBeNull();
    expect(typeof machine?.next?.affordable).toBe("boolean");
  });

  it("shows null next when at max tier", () => {
    const state = {
      ...createInitialGameState(),
      equipment: { machine: 3, seating: 3, register: 3 }
    };
    const options = getEquipmentShopOptions(state);
    expect(options.every((o) => o.next === null)).toBe(true);
  });

  it("hides the register from the setup shop (available after opening)", () => {
    const setupState = createFreshRunState();
    const setupOptions = getEquipmentShopOptions(setupState);
    expect(setupOptions.find((o) => o.id === "register")).toBeUndefined();
  });

  it("offers the register as an upgradable slot once the café is open", () => {
    const state = createInitialGameState();
    const options = getEquipmentShopOptions(state);
    const register = options.find((o) => o.id === "register");
    expect(register).toBeDefined();
    // Owned from the start (tier 1), so it is never flagged as unowned...
    expect(register?.unowned).toBe(false);
    // ...but a next tier (Card Terminal) is still purchasable.
    expect(register?.next?.name).toBe("Card Terminal");
  });
});

describe("register equipment upgrades", () => {
  it("buys the next register tier and grants its reputation bonus", () => {
    // Basic Till (tier 1) → Card Terminal (tier 2, reputationBonus 2).
    let state = createInitialGameState();
    state = {
      ...state,
      dayPhase: "day_end" as const,
      resources: { ...state.resources, money: 100 }
    };
    const repBefore = state.resources.reputation;
    state = gameReducer(state, { type: "buy_equipment", slot: "register" });
    expect(state.equipment.register).toBe(2);
    expect(state.resources.reputation).toBe(repBefore + 2);
  });

  it("feeds the register's daily reputation bonus into the morning open", () => {
    const bonuses = getEquipmentDailyBonuses({ machine: 1, seating: 1, register: 3 });
    // Pro POS (tier 3) gives dailyRepBonus 2; machine/seating tier 1 give 0.
    expect(bonuses.reputation).toBe(2);
  });
});
