import type { GameState } from "../../game/types/game";
import coffeeMachineAsset from "../../../assets/sprites/props/placeholder-cafe-coffee-machine.png";
import kassandraRegisterAsset from "../../../assets/sprites/props/placeholder-kassandra-register.png";
import paulaGuestAsset from "../../../assets/sprites/guests/placeholder-guest-paula.png";

interface CafePlaceholderProps {
  gameState: GameState;
}

export function CafePlaceholder({ gameState }: CafePlaceholderProps) {
  const cleanlinessClass =
    gameState.resources.cleanliness >= 70
      ? "cafe-diorama--clean"
      : gameState.resources.cleanliness >= 40
        ? "cafe-diorama--used"
        : "cafe-diorama--messy";
  const stressClass =
    gameState.resources.stress >= 61 || gameState.day >= 7
      ? "cafe-diorama--strained"
      : gameState.resources.stress >= 35 || gameState.day >= 4
        ? "cafe-diorama--busy"
        : "cafe-diorama--calm";
  const dayClass =
    gameState.day >= 7
      ? "cafe-diorama--day-seven"
      : gameState.day >= 4
        ? "cafe-diorama--day-four"
        : "cafe-diorama--day-one";
  const kassandraClass =
    gameState.kassandraInstalled || gameState.unlocks.kassandra || gameState.day >= 6
      ? "cafe-diorama--kassandra-awake"
      : "cafe-diorama--kassandra-quiet";
  const weirdnessClass = gameState.weirdnessVisible
    ? "cafe-diorama--weirdness-visible"
    : "cafe-diorama--weirdness-deniable";

  return (
    <section
      className="panel cafe-panel cafe-stage"
      aria-labelledby="cafe-diorama-title"
    >
      <div className="panel-heading">
        <p className="eyebrow">Café stage</p>
        <h2 id="cafe-diorama-title">Heute im Café</h2>
      </div>

      <div
        className={[
          "placeholder-cafe-diorama",
          "cafe-diorama",
          cleanlinessClass,
          stressClass,
          dayClass,
          kassandraClass,
          weirdnessClass
        ].join(" ")}
        role="img"
        aria-label={`3/4 café room on Day ${gameState.day}: counter, coffee machine, register, queue, two tables, door, window, storage shelf, menu board, and environmental details.`}
      >
        <div className="cafe-back-wall" aria-hidden="true">
          <div className="cafe-window">
            <span className="cafe-window__light" />
          </div>
          <div className="cafe-menu-board">
            <span />
            <span />
            <span />
          </div>
          <div className="cafe-storage">
            <span />
            <span />
            <span />
          </div>
        </div>

        <div className="cafe-side-wall" aria-hidden="true">
          <div className="cafe-door">
            <span />
          </div>
        </div>

        <div className="cafe-floor">
          <div className="cafe-floor__tiles" aria-hidden="true" />
          <div className="cafe-room-shadow" aria-hidden="true" />

          <div className="cafe-counter" aria-hidden="true">
            <div className="cafe-counter__front" />
            <div className="cafe-counter__ledge" />
            <div className="cafe-coffee-machine">
              <img
                className="cafe-pilot-asset cafe-pilot-asset--coffee-machine"
                src={coffeeMachineAsset}
                alt=""
                aria-hidden="true"
              />
              <span className="cafe-coffee-machine__screen" />
              <span className="cafe-coffee-machine__steam" />
              <span className="cafe-coffee-machine__steam cafe-coffee-machine__steam--soft" />
            </div>
            <div className="cafe-register placeholder-kassandra-ui">
              <img
                className="cafe-pilot-asset cafe-pilot-asset--kassandra-register"
                src={kassandraRegisterAsset}
                alt=""
                aria-hidden="true"
              />
              <span className="cafe-register__screen" />
              <span className="cafe-register__receipt" />
            </div>
            <div className="cafe-counter-props">
              <span />
              <span />
              <span />
            </div>
            <div className="cafe-service-mat" />
          </div>

          <div className="cafe-table cafe-table--left" aria-hidden="true">
            <span className="cafe-table__top" />
            <span className="cafe-chair cafe-chair--front" />
            <span className="cafe-chair cafe-chair--side" />
            <span className="cafe-cup" />
          </div>
          <div className="cafe-table cafe-table--right" aria-hidden="true">
            <span className="cafe-table__top" />
            <span className="cafe-chair cafe-chair--front" />
            <span className="cafe-chair cafe-chair--side" />
            <span className="cafe-cup" />
          </div>

          <div className="cafe-queue" aria-hidden="true">
            <span className="placeholder-guest placeholder-guest-normal-01">
              <img
                className="cafe-pilot-asset cafe-pilot-asset--paula"
                src={paulaGuestAsset}
                alt=""
                aria-hidden="true"
              />
            </span>
            <span className="placeholder-guest placeholder-guest-normal-02" />
            <span className="placeholder-guest placeholder-guest-strange-01" />
          </div>

          <div className="cafe-plant" aria-hidden="true">
            <span />
          </div>

          <span
            className="placeholder-guest placeholder-guest-seated placeholder-guest-normal-03"
            aria-hidden="true"
          />
          <span
            className="placeholder-guest placeholder-guest-seated placeholder-guest-strange-02"
            aria-hidden="true"
          />

          <div className="cafe-weirdness-hint" aria-hidden="true">
            <span className="cafe-clock" />
            <span className="cafe-shadow-note" />
            <span className="cafe-envelope" />
          </div>
        </div>
      </div>
    </section>
  );
}
