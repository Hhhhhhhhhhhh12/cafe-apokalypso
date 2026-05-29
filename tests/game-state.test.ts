import { describe, expect, it } from "vitest";
import { createInitialGameState } from "../src/game/engine/gameState";
import { gameReducer } from "../src/game/engine/reducer";

describe("initial game state", () => {
  it("starts as a serializable day-one placeholder shell", () => {
    const state = createInitialGameState();

    expect(state.day).toBe(1);
    expect(state.weirdnessVisible).toBe(false);
    expect(state.kassandraInstalled).toBe(false);
    expect(state.resources.money).toBe(42);
    expect(() => JSON.stringify(state)).not.toThrow();
  });

  it("applies placeholder actions deterministically", () => {
    const state = createInitialGameState();
    const nextState = gameReducer(state, { type: "prepare_counter" });

    expect(nextState.resources.coffee).toBe(state.resources.coffee + 2);
    expect(nextState.resources.milk).toBe(state.resources.milk + 1);
    expect(nextState.resources.stress).toBe(state.resources.stress - 1);
  });
});
