import { describe, expect, it } from "vitest";

import {
  getManagementHudLabels,
  getNarrativeEventCards,
  getNextGuestPreview,
  getServeLineForCustomer,
  getVisibleDaySevenLetter
} from "../src/game/engine/selectors";
import { gameReducer } from "../src/game/engine/reducer";
import { createInitialGameState } from "../src/game/engine/gameState";
import { weekOneDays, weekOneEvents, weekOneGuests } from "../src/game/data";
import type { DayDefinition, DayNumber, GuestDefinition } from "../src/game/types/content";
import type { GameState } from "../src/game/types/game";

function stateForDay(day: DayNumber, overrides: Partial<GameState> = {}): GameState {
  return { ...createInitialGameState(), day, ...overrides };
}

describe("guest serve lines", () => {
  it("returns the served guest's narrative serve line, not developer copy", () => {
    const line = getServeLineForCustomer(stateForDay(1), 0);
    const paula = weekOneGuests.find((guest) => guest.id === "pendlerin-paula");

    expect(line).toBe(paula?.serveLine);
    expect(line).not.toContain("Supplies, cleanliness, money, and stress");
  });

  it("every week-one guest has a serve line distinct from its sample lines", () => {
    for (const guest of weekOneGuests) {
      expect(guest.serveLine.length).toBeGreaterThan(0);
      expect(guest.sampleLines).not.toContain(guest.serveLine);
    }
  });

  it("gives every week-one guest in-world order and learning cues", () => {
    for (const guest of weekOneGuests as readonly GuestDefinition[]) {
      expect(guest.orderLine?.length ?? 0).toBeGreaterThan(0);
      expect(guest.learningCue?.length ?? 0).toBeGreaterThan(0);
    }

    const preview = getNextGuestPreview(stateForDay(1));
    expect(preview?.orderLine).toContain("Just coffee");
    expect(preview?.learningCue).toContain("Paula");
    expect(preview?.wants).toBe("Filter Coffee");
  });

  it("prefers strange guests once three customers have been served", () => {
    const dayFour = stateForDay(4);
    const herrGrau = weekOneGuests.find((guest) => guest.id === "herr-grau");

    // First three customers stay in the normal pool.
    expect(getServeLineForCustomer(dayFour, 0)).not.toBe(herrGrau?.serveLine);
    expect(getServeLineForCustomer(dayFour, 1)).not.toBe(herrGrau?.serveLine);
    expect(getServeLineForCustomer(dayFour, 2)).not.toBe(herrGrau?.serveLine);

    // The fourth served customer (index 3) prefers the strange subset.
    expect(getServeLineForCustomer(dayFour, 3)).toBe(herrGrau?.serveLine);
  });

  it("stays in the normal pool when no strange guests are present that day", () => {
    const dayOne = stateForDay(1);
    // Day 1 has only normal guests (Paula, Nele), so even index >= 3 stays normal.
    const dayOneNormalLines = weekOneGuests
      .filter((g) => g.category === "normal" && ["pendlerin-paula", "freelancerin-nele"].includes(g.id))
      .map((g) => g.serveLine);

    expect(dayOneNormalLines).toContain(getServeLineForCustomer(dayOne, 5));
  });
});

describe("serve flow status message", () => {
  it("sets the status message to the served guest's serve line", () => {
    const next = gameReducer(stateForDay(1), { type: "take_order" });
    const paula = weekOneGuests.find((guest) => guest.id === "pendlerin-paula");

    expect(next.statusMessage).toContain(paula?.serveLine ?? "__missing__");
    expect(next.statusMessage).not.toContain(
      "Supplies, cleanliness, money, and stress have been updated"
    );
  });
});

describe("day openers and unlock messages", () => {
  it("provides a non-empty day opener for every day 1-7", () => {
    for (const day of weekOneDays) {
      expect(day.dayOpener.trim().length).toBeGreaterThan(0);
    }
  });

  it("provides unlock messages for days 3-6 only", () => {
    const withUnlock = (weekOneDays as readonly DayDefinition[])
      .filter((day) => Boolean(day.unlockMessage))
      .map((day) => day.day);

    expect(withUnlock).toEqual([3, 4, 5, 6]);
  });
});

describe("narrative event cards", () => {
  it("excludes the structural day-1-opening-rhythm beat", () => {
    const cards = getNarrativeEventCards(stateForDay(1));
    const ids = cards.map((event) => event.id);

    expect(ids).not.toContain("day-1-opening-rhythm");
    expect(ids).toContain("day-1-coffee-machine-flicker");
  });

  it("never includes tone:'normal' events for any day", () => {
    for (const day of weekOneDays) {
      const cards = getNarrativeEventCards(stateForDay(day.day));
      expect(cards.every((event) => event.tone !== "normal")).toBe(true);
    }
  });

  it("uses the approved replacement event texts", () => {
    const byId = new Map(weekOneEvents.map((event) => [event.id, event.text]));

    expect(byId.get("day-2-herr-bohn-memory")).toBe(
      "Herr Bohn mentions that the corner used to be quieter. Before it remembered things."
    );
    expect(byId.get("day-6-kassandra-update")).toBe(
      "The register update is complete. KASSANDRA has filed an initial report. It was not asked to."
    );
    expect(byId.get("day-7-red-umbrella")).toBe(
      "A woman arrives with a red umbrella although it is not raining. She asks not to be recognized."
    );
  });
});

describe("resource HUD labels", () => {
  it("exposes cleanliness and stress as text labels without raw numbers", () => {
    const labels = getManagementHudLabels(createInitialGameState());

    expect(labels.cleanliness).not.toMatch(/\d/);
    expect(labels.stress).not.toMatch(/\d/);
  });
});

describe("day-7 letter", () => {
  it("returns the letter body without the debug weirdness line once revealed", () => {
    const revealed = stateForDay(7, {
      demoComplete: true,
      weirdnessVisible: true
    });
    const letter = getVisibleDaySevenLetter(revealed);

    expect(letter).toContain("Office for Extraordinary Operational Relevance");
    expect(letter).not.toContain("Visible weirdness");
    expect(letter).not.toContain("apocalypse operations remain locked");
  });

  it("stays hidden before the day-7 hook fires", () => {
    expect(getVisibleDaySevenLetter(stateForDay(7))).toBeNull();
  });
});
