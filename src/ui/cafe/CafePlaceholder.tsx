import { useEffect, useState } from "react";
import type { GameState } from "../../game/types/game";
import stageBaseAsset from "../../../assets/backgrounds/placeholder-cafe-stage-base-v03-px.png";
import stageBaseDustyAsset from "../../../assets/backgrounds/placeholder-cafe-stage-base-v04-px.png";
import coffeeMachineAsset from "../../../assets/sprites/props/placeholder-cafe-coffee-machine.png";
import kassandraRegisterAsset from "../../../assets/sprites/props/placeholder-kassandra-register.png";
import bohnGuestAsset from "../../../assets/sprites/guests/placeholder-guest-bohn.png";
import grauGuestAsset from "../../../assets/sprites/guests/placeholder-guest-grau.png";

interface CafePlaceholderProps {
  gameState: GameState;
}

export function CafePlaceholder({ gameState }: CafePlaceholderProps) {
  // --- Visual state classes ---
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

  // --- State-driven guest + prop visibility ---
  const { customersServed, actionPointsRemaining } = gameState.dayManagement;
  const isOpen = gameState.dayPhase === "open";
  const isDayEnd = gameState.dayPhase === "day_end";

  // A customer is waiting in queue when the day is open and there are actions left
  const showQueueGuest = isOpen && actionPointsRemaining > 0;

  // Paula enters through the door and walks to the queue spot. Phases:
  // "at-door" (start position, one paint) → "walking" (CSS transition moves
  // the wrapper, walk sheet plays) → "idle" (queue spot, idle sheet plays).
  const [paulaPhase, setPaulaPhase] = useState<"at-door" | "walking" | "idle">(
    "at-door"
  );
  useEffect(() => {
    if (!showQueueGuest) {
      setPaulaPhase("at-door");
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPaulaPhase("idle");
      return;
    }
    setPaulaPhase("at-door");
    // Double rAF so the door position is painted before the transition starts
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setPaulaPhase("walking"));
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [showQueueGuest]);

  // Seated guests accumulate as customers are served during the day
  const showSeated1 = customersServed >= 1;
  const showSeated2 = customersServed >= 2;
  const showSeated3 = customersServed >= 3;

  // Christa — regular, appears from day 2 once the second customer is served
  const showChrista = gameState.day >= 2 && customersServed >= 2;

  // Herr Bohn — regular, appears from day 3 once the café gets going
  const showBohn = gameState.day >= 3 && customersServed >= 1;

  // Strange guest appears day 4+, after 3 customers have been served
  const showStrangeGuest = gameState.day >= 4 && customersServed >= 3;

  // Cups on tables appear when cleanliness drops below clean threshold
  const tablesDirty =
    gameState.resources.cleanliness < 70 && (isOpen || isDayEnd) && customersServed >= 1;

  // Weirdness overlays become visible day 7 / weirdnessVisible flag
  const showWeirdness = gameState.weirdnessVisible || gameState.day >= 7;

  // KASSANDRA screen glows when installed / awake
  const kassandraAwake = gameState.kassandraInstalled || gameState.day >= 6;

  // Days 1-2 use the dusty, slightly enchanted stage base (v04) — the café has
  // been closed for a long time. From day 3 the warmer lived-in v03 takes over.
  const isDusty = gameState.day <= 2;
  const stageBase = isDusty ? stageBaseDustyAsset : stageBaseAsset;

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
        {/* Stage base background image */}
        <img
          className="cafe-stage-base"
          src={stageBase}
          alt=""
          aria-hidden="true"
        />

        {/* Drifting dust motes — only while the café still feels long-closed */}
        {isDusty && <div className="cafe-dust" aria-hidden="true" />}

        {/* CSS wall fallbacks — mostly transparent when stage base is present */}
        <div className="cafe-back-wall" aria-hidden="true">
          <div className="cafe-window">
            <span className="cafe-window__light" />
          </div>
          <div className="cafe-menu-board">
            <span />
            <span />
            <span />
          </div>
          <div className={`cafe-storage cafe-decor--tier-${gameState.decor?.shelf ?? 1}`}>
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

          {/* Counter with pilot-asset props */}
          <div className="cafe-counter" aria-hidden="true">
            <div className="cafe-counter__front" />
            <div className="cafe-counter__ledge" />

            {/* Coffee machine — reacts to day/weirdness */}
            <div className="cafe-coffee-machine">
              <img
                className="cafe-pilot-asset cafe-pilot-asset--coffee-machine"
                src={coffeeMachineAsset}
                alt=""
                aria-hidden="true"
              />
              <span className="cafe-coffee-machine__screen" />
              {/* Steam visible when stressed / busy */}
              {gameState.resources.stress >= 35 && (
                <span className="cafe-coffee-machine__steam" />
              )}
              {gameState.resources.stress >= 55 && (
                <span className="cafe-coffee-machine__steam cafe-coffee-machine__steam--soft" />
              )}
            </div>

            {/* KASSANDRA register — screen activates day 6+ */}
            <div className={`cafe-register placeholder-kassandra-ui${kassandraAwake ? " cafe-register--awake" : ""}`}>
              <img
                className="cafe-pilot-asset cafe-pilot-asset--kassandra-register"
                src={kassandraRegisterAsset}
                alt=""
                aria-hidden="true"
              />
              <span className={`cafe-register__screen${kassandraAwake ? " cafe-register__screen--active" : ""}`} />
              {/* Receipt tail appears on day 7 */}
              {gameState.day >= 7 && (
                <span className="cafe-register__receipt cafe-register__receipt--long" />
              )}
            </div>

            <div className="cafe-counter-props">
              <span />
              <span />
              <span />
            </div>
            <div className="cafe-service-mat" />
          </div>

          {/* Left table — cups appear when dirty */}
          <div className="cafe-table cafe-table--left" aria-hidden="true">
            <span className="cafe-table__top" />
            <span className="cafe-chair cafe-chair--front" />
            <span className="cafe-chair cafe-chair--side" />
            {tablesDirty && <span className="cafe-cup cafe-cup--dirty" />}
          </div>

          {/* Right table — second cup when very dirty */}
          <div className="cafe-table cafe-table--right" aria-hidden="true">
            <span className="cafe-table__top" />
            <span className="cafe-chair cafe-chair--front" />
            <span className="cafe-chair cafe-chair--side" />
            {tablesDirty && showSeated2 && (
              <span className="cafe-cup cafe-cup--dirty" />
            )}
          </div>

          {/* Queue — customer waiting visible when day is open + actions remain */}
          <div className="cafe-queue" aria-hidden="true">
            {showQueueGuest ? (
              <span
                className={`placeholder-guest placeholder-guest-normal-01${
                  paulaPhase === "at-door" ? " placeholder-guest--at-door" : ""
                }`}
                onTransitionEnd={(e) => {
                  if (e.propertyName === "left") setPaulaPhase("idle");
                }}
              >
                {/* Sprite-sheet idle (5 frames); frame 0 is the original
                    static Paula sprite, so reduced-motion users see her too.
                    While entering, the 6-frame walk sheet plays instead. */}
                <span
                  className={`cafe-pilot-asset cafe-pilot-asset--paula${
                    paulaPhase !== "idle" ? " cafe-pilot-asset--paula-walking" : ""
                  }`}
                  aria-hidden="true"
                />
              </span>
            ) : null}
            {/* Second queue slot — empty placeholder kept for layout */}
            <span className="placeholder-guest placeholder-guest-normal-02" />
          </div>

          {/* Seated guest 1 — Cem, appears after first customer served */}
          {showSeated1 && (
            <span
              className="placeholder-guest placeholder-guest-seated placeholder-guest-normal-03"
              aria-hidden="true"
            >
              {/* 2-frame blink sheet; frame 0 is the original static sprite */}
              <span
                className="cafe-pilot-asset cafe-pilot-asset--guest cafe-pilot-asset--cem"
                aria-hidden="true"
              />
            </span>
          )}

          {/* Seated guest 2 — Nele, appears after second customer served */}
          {showSeated2 && (
            <span
              className="placeholder-guest placeholder-guest-seated placeholder-guest-normal-04"
              aria-hidden="true"
            >
              {/* 2-frame blink sheet; frame 0 is the original static sprite */}
              <span
                className="cafe-pilot-asset cafe-pilot-asset--guest cafe-pilot-asset--mira"
                aria-hidden="true"
              />
            </span>
          )}

          {/* Seated guest 3 — Lukas, appears after third customer served */}
          {showSeated3 && (
            <span
              className="placeholder-guest placeholder-guest-seated placeholder-guest-normal-05"
              aria-hidden="true"
            >
              {/* 2-frame blink sheet; frame 0 is the original static sprite */}
              <span
                className="cafe-pilot-asset cafe-pilot-asset--guest cafe-pilot-asset--lukas"
                aria-hidden="true"
              />
            </span>
          )}

          {/* Christa — day 2+, right table area */}
          {showChrista && (
            <span
              className="placeholder-guest placeholder-guest-seated placeholder-guest-normal-06"
              aria-hidden="true"
            >
              {/* 2-frame blink sheet; frame 0 is the original static sprite */}
              <span
                className="cafe-pilot-asset cafe-pilot-asset--guest cafe-pilot-asset--christa"
                aria-hidden="true"
              />
            </span>
          )}

          {/* Herr Bohn — day 3+, mid-back near storage */}
          {showBohn && (
            <span
              className="placeholder-guest placeholder-guest-seated placeholder-guest-normal-07"
              aria-hidden="true"
            >
              <img
                className="cafe-pilot-asset cafe-pilot-asset--guest"
                src={bohnGuestAsset}
                alt=""
                aria-hidden="true"
              />
            </span>
          )}

          {/* Strange guest — day 4+, after 3 customers served */}
          {showStrangeGuest && (
            <span
              className="placeholder-guest placeholder-guest-seated placeholder-guest-strange-01"
              aria-hidden="true"
            >
              <img
                className="cafe-pilot-asset cafe-pilot-asset--guest"
                src={grauGuestAsset}
                alt=""
                aria-hidden="true"
              />
            </span>
          )}

          <div className={`cafe-plant cafe-decor--tier-${gameState.decor?.plant ?? 1}`} aria-hidden="true">
            <span />
          </div>

          {/* Weirdness overlays — day 7 / weirdness flag */}
          {showWeirdness && (
            <div className="cafe-weirdness-hint" aria-hidden="true">
              <span className="cafe-clock" />
              <span className="cafe-shadow-note" />
              <span className="cafe-envelope" />
            </div>
          )}
        </div>

        {/* ── Décor props ──────────────────────────────────────────────────
            Positioned relative to .cafe-diorama (not .cafe-floor) so they
            can sit on the back wall and ceiling of the painted room image,
            which are above the .cafe-floor div's coordinate space.        */}
        <div className={`cafe-decor-clock cafe-decor--tier-${gameState.decor?.clock ?? 1}`} aria-hidden="true" />
        <div className={`cafe-decor-lamp cafe-decor--tier-${gameState.decor?.lamp ?? 1}`} aria-hidden="true" />
        <div className={`cafe-decor-cups cafe-decor--tier-${gameState.decor?.cups ?? 1}`} aria-hidden="true" />
        <div className={`cafe-decor-shelf cafe-decor--tier-${gameState.decor?.shelf ?? 1}`} aria-hidden="true" />
      </div>
    </section>
  );
}
