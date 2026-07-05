import { describe, expect, it } from "vitest";
import {
  daySevenHookLetter,
  kassandraMessages,
  weekOneAchievements,
  weekOneAdvertisingCampaigns,
  weekOneDayModifiers,
  weekOneDays,
  weekOneEvents,
  weekOneGuests,
  weekOneProducts,
  weekOneStaffOptions,
  weekOneUpgrades
} from "../src/game/data";
import type { DayDefinition } from "../src/game/types/content";

const requiredNormalGuests = [
  "Pendler Kemal",
  "Pendlerin Fatou",
  "Nachbarin Mira",
  "Laptop-Lukas",
  "Lieferfahrer Cem",
  "Cappuccino-Christa",
  "Herr Bohn",
  "Freelancerin Nele"
];

const requiredStrangeGuests = [
  "Herr Grau",
  "Frau mit rotem Regenschirm",
  "Meda"
];

const requiredProducts = [
  "Filter Coffee",
  "Espresso",
  "Cappuccino",
  "Croissant",
  "Coffee + Croissant",
  "Pour-Over Special"
];

describe("week-one content data", () => {
  it("contains all required guests with the documented normal/strange split", () => {
    const normalGuests = weekOneGuests.filter((guest) => guest.category === "normal");
    const strangeGuests = weekOneGuests.filter(
      (guest) => guest.category === "subtly_strange"
    );

    expect(normalGuests).toHaveLength(8);
    expect(strangeGuests).toHaveLength(3);
    expect(normalGuests.map((guest) => guest.name)).toEqual(requiredNormalGuests);
    expect(strangeGuests.map((guest) => guest.name)).toEqual(requiredStrangeGuests);
  });

  it("keeps Nele and Meda as separate entities", () => {
    const nele = weekOneGuests.find((guest) => guest.id === "freelancerin-nele");
    const meda = weekOneGuests.find((guest) => guest.id === "meda");

    expect(nele).toBeDefined();
    expect(meda).toBeDefined();
    expect(nele?.id).not.toBe(meda?.id);
    expect(nele?.category).toBe("normal");
    expect(meda?.category).toBe("subtly_strange");
    expect(weekOneStaffOptions.find((staff) => staff.id === "nele")?.linkedGuestId).toBe(
      "freelancerin-nele"
    );
  });

  it("contains all required products and week-one content counts", () => {
    expect(weekOneProducts.map((product) => product.name)).toEqual(requiredProducts);
    expect(weekOneStaffOptions.map((staff) => staff.name)).toEqual([
      "Jana",
      "Nino",
      "Nele"
    ]);
    expect(weekOneAdvertisingCampaigns).toHaveLength(4);
    expect(weekOneUpgrades).toHaveLength(7);
    expect(weekOneAchievements).toHaveLength(7);
    expect(weekOneEvents).toHaveLength(28);
    expect(weekOneDayModifiers).toHaveLength(7);
    expect(weekOneDays).toHaveLength(7);
  });

  it("defines one deterministic day modifier for each week-one day", () => {
    const modifierDays = weekOneDayModifiers.map((modifier) => modifier.day);

    expect(modifierDays).toEqual([1, 2, 3, 4, 5, 6, 7]);
    for (const modifier of weekOneDayModifiers) {
      expect(modifier.title.length).toBeGreaterThan(0);
      expect(modifier.learningHint.length).toBeGreaterThan(0);
      expect(modifier.effects.length).toBeGreaterThan(0);
    }
  });

  it("defines day milestones and only references existing guest and event IDs", () => {
    const guestIds = new Set(weekOneGuests.map((guest) => guest.id));
    const eventIds = new Set(weekOneEvents.map((event) => event.id));

    for (const dayDefinition of weekOneDays) {
      expect(dayDefinition.milestone.length).toBeGreaterThan(0);
      expect(dayDefinition.unlocks.length).toBeGreaterThan(0);
      expectAllIdsExist(dayDefinition.guestIds, guestIds, dayDefinition);
      expectAllIdsExist(dayDefinition.eventIds, eventIds, dayDefinition);
    }

    for (const eventDefinition of weekOneEvents) {
      const relatedGuestIds =
        "relatedGuestIds" in eventDefinition ? eventDefinition.relatedGuestIds : [];

      expectAllIdsExist(
        relatedGuestIds,
        guestIds,
        weekOneDays[eventDefinition.day - 1]
      );
    }
  });

  it("gives every day at least one visible narrative beat (non-normal tone)", () => {
    for (let day = 1; day <= 7; day += 1) {
      const visibleBeats = weekOneEvents.filter(
        (event) => event.day === day && event.tone !== "normal"
      );
      expect(visibleBeats.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("contains the documented Day-7 hook letter", () => {
    expect(daySevenHookLetter.day).toBe(7);
    expect(daySevenHookLetter.sender).toBe(
      "Office for Extraordinary Operational Relevance"
    );
    expect(daySevenHookLetter.department).toBe(
      "Caffeine, Threshold Sites, and Minor End Times"
    );
    expect(daySevenHookLetter.body).toContain(
      "apocalyptically relevant caffeine infrastructure"
    );
    expect(daySevenHookLetter.body).toContain(
      "Minimum supplies during imminent reality thinning."
    );
  });

  it("keeps KASSANDRA messages authored, static, and simulated", () => {
    expect(kassandraMessages.length).toBeGreaterThanOrEqual(4);

    for (const message of kassandraMessages) {
      // KASSANDRA unlocks on Day 6; escalation lines arrive on Day 7.
      expect([6, 7]).toContain(message.day);
      expect(message.source).toBe("authored_static");
      expect(message.simulated).toBe(true);
      expect(message.text).not.toMatch(/api|endpoint|model/i);
    }
  });
});

function expectAllIdsExist(
  ids: readonly string[],
  validIds: ReadonlySet<string>,
  dayDefinition: DayDefinition
) {
  for (const id of ids) {
    expect(validIds.has(id), `Missing reference ${id} on Day ${dayDefinition.day}`).toBe(
      true
    );
  }
}
