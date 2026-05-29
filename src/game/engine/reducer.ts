import { createInitialGameState } from "./gameState";
import type { GameAction, GameState } from "../types/game";

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "prepare_counter":
      return {
        ...state,
        resources: {
          ...state.resources,
          coffee: state.resources.coffee + 2,
          milk: state.resources.milk + 1,
          pastries: state.resources.pastries + 1,
          stress: Math.max(0, state.resources.stress - 1),
          mood: "busy"
        },
        statusMessage:
          "Counter prepared. This is a deterministic placeholder action, not the final order loop."
      };

    case "clean_tables":
      return {
        ...state,
        resources: {
          ...state.resources,
          cleanliness: Math.min(100, state.resources.cleanliness + 6),
          stress: Math.max(0, state.resources.stress - 1),
          mood: "calm"
        },
        statusMessage:
          "Tables cleaned. The future game loop will replace this with real guest and order effects."
      };

    case "reset_game":
      return createInitialGameState();

    default:
      return state;
  }
}
