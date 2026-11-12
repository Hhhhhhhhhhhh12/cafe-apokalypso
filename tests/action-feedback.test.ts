import { describe, expect, it } from "vitest";
import { createInitialGameState } from "../src/game/engine/gameState";
import { createHelperAssignment, getProductById } from "../src/game/engine/management";
import { gameReducer } from "../src/game/engine/reducer";
import { getExpectedProductIncome } from "../src/game/engine/selectors";
import type { DayNumber } from "../src/game/types/content";
import type { GameState } from "../src/game/types/game";

function openDay(day: DayNumber = 1): GameState {
  return gameReducer({ ...createInitialGameState(), day, dayPhase: "day_start" }, { type: "open_day" });
}

describe("action consequence feedback", () => {
  it.each([1, 2, 3, 4, 5, 6, 7] as const)("shows serving versus cleaning consequences on Day %i", (day) => {
    const before = openDay(day);
    const served = gameReducer(before, { type: "serve_product", productId: "filterkaffee" });
    const cleaned = gameReducer(before, { type: "clean_tables" });

    expect(served.resources.money).toBeGreaterThan(before.resources.money);
    expect(served.resources.cleanliness).toBeLessThan(before.resources.cleanliness);
    expect(cleaned.resources.money).toBe(before.resources.money);
    expect(cleaned.resources.cleanliness).toBeGreaterThan(before.resources.cleanliness);
    expect(served.statusMessage).toContain("Cleanliness −2");
    expect(served.statusMessage).toContain("Coffee −1");
    expect(cleaned.statusMessage).toContain("Cleanliness +12");
    expect(served.statusMessage).toContain("Actions −1");
    expect(cleaned.statusMessage).toContain("Actions −1");
    expect(served.dayPhase).toBe("open");
    expect(cleaned.dayPhase).toBe("open");
  });

  it("reports capped cleaning and stress relief rather than nominal bonuses", () => {
    const before = openDay();
    before.resources.cleanliness = 98;
    before.resources.stress = 2;
    const after = gameReducer(before, { type: "clean_tables" });
    expect(after.statusMessage).toContain("This action: Cleanliness +2 · Stress −2 · Actions −1.");
  });

  it("reports the actual substitute income and milk shortage consequence", () => {
    const before = openDay();
    before.supplies.milk = 0;
    const after = gameReducer(before, { type: "serve_product", productId: "cappuccino" });
    expect(after.statusMessage).toContain("Cappuccino becomes");
    const income = (after.resources.money - before.resources.money).toFixed(2);
    expect(after.statusMessage).toContain(`This action: +€${income}`);
    expect(after.statusMessage).toContain("Stress +5");
    expect(after.statusMessage).toContain("Rep −1");
    expect(after.statusMessage).not.toContain("Milk −1");
  });

  it("reports no earnings when no substitute is possible", () => {
    const before = openDay();
    before.supplies = { coffee: 0, milk: 0, pastries: 0 };
    const after = gameReducer(before, { type: "serve_product", productId: "filterkaffee" });
    expect(after.statusMessage).toContain("orders nothing");
    expect(after.statusMessage).toContain("This action:");
    expect(after.statusMessage).not.toContain("+€");
    expect(after.statusMessage).not.toContain("Coffee −");
  });

  it("totals both helper orders and respects the cleaning-kit effect", () => {
    const before = openDay(5);
    before.helperAssignment = createHelperAssignment("jana", "service", 5);
    before.dayManagement.helperExtraOrdersRemaining = 1;
    before.purchasedUpgrades = ["cleaning-kit"];
    const after = gameReducer(before, { type: "serve_product", productId: "filterkaffee" });
    expect(after.dayManagement.customersServed - before.dayManagement.customersServed).toBe(2);
    expect(after.statusMessage).toContain("Coffee −2");
    expect(after.statusMessage).toContain("Cleanliness −2");
    expect(after.statusMessage).toContain(`+€${(after.resources.money - before.resources.money).toFixed(2)}`);
  });

  it("reports net stress when cleaning and a walkout happen together", () => {
    const before = openDay(4);
    before.resources.stress = 10;
    before.dayManagement.currentGuestPatience = 25;
    before.dayManagement.actionsWithoutServing = 3;
    const after = gameReducer(before, { type: "clean_tables" });
    expect(after.dayManagement.guestsLost).toBe(1);
    expect(after.resources.stress).toBe(13);
    expect(after.statusMessage).toContain("left without ordering");
    expect(after.statusMessage).toContain("This action: Cleanliness +12 · Stress +3 · Rep −1 · Actions −1.");
  });

  it.each([1, 2, 3] as const)("preserves soft onboarding on Day %i", (day) => {
    const before = openDay(day);
    before.dayManagement.currentGuestPatience = 25;
    before.dayManagement.actionsWithoutServing = 3;
    const after = gameReducer(before, { type: "clean_tables" });
    expect(after.dayManagement.guestsLost).toBe(0);
    expect(after.statusMessage).not.toContain("left without ordering");
  });

  it("does not claim a spent action when serving is blocked", () => {
    const before = openDay();
    before.dayManagement.actionPointsRemaining = 0;
    const after = gameReducer(before, { type: "serve_product", productId: "filterkaffee" });
    expect(after.statusMessage).not.toContain("This action:");
    expect(after.resources).toEqual(before.resources);
  });

  it.each([false, true])("estimates per-guest income with offerReviewed=%s", (offerReviewed) => {
    const before = openDay();
    before.dayManagement.offerReviewed = offerReviewed;
    const product = getProductById("filterkaffee");
    expect(getExpectedProductIncome(before, product)).toBe(offerReviewed ? 1.69 : 1.54);
    const after = gameReducer(before, { type: "serve_product", productId: product.id });
    expect(after.resources.money - before.resources.money).toBeCloseTo(getExpectedProductIncome(before, product));
  });
});
