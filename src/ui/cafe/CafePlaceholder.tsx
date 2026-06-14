import { useEffect, useRef, useState } from "react";
import type { GameState } from "../../game/types/game";
import { getDioramaGuestVisibility } from "../../game/engine/selectors";
import stageBaseAsset from "../../../assets/backgrounds/placeholder-cafe-stage-base-v03.png";
import coffeeMachineAsset from "../../../assets/sprites/props/placeholder-cafe-coffee-machine.png";
import kassandraRegisterAsset from "../../../assets/sprites/props/placeholder-kassandra-register.png";
import bohnGuestAsset from "../../../assets/sprites/guests/placeholder-guest-bohn.png";
import strangeGuestAsset from "../../../assets/sprites/guests/placeholder-guest-strange.png";

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
  // "at-door" → "walking" (entrance, SE walk sheet + CSS left/bottom transition)
  // → "idle" (queue spot, idle sheet) → "walking-to-counter" (north walk sheet +
  // bottom transition toward counter) → "at-door" (reset, triggers next entrance).
  const [paulaPhase, setPaulaPhase] = useState<"at-door" | "walking" | "idle" | "walking-to-counter" | "exiting-east">(
    "at-door"
  );

  // Queue guest rotates through characters: Paula → Cem → Mira → Lukas → Christa → Paula…
  const QUEUE_ROTATION = ["paula", "cem", "mira", "lukas", "christa"] as const;
  type QueueGuest = (typeof QUEUE_ROTATION)[number];
  const [queueGuest, setQueueGuest] = useState<QueueGuest>("paula");

  // Entrance effect: fires when the queue slot opens or is re-activated.
  useEffect(() => {
    if (!showQueueGuest) {
      setPaulaPhase("at-door");
      return;
    }
    setQueueGuest(QUEUE_ROTATION[customersServed % QUEUE_ROTATION.length]);
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

  // When an order is served, the waiting guest walks toward the counter.
  // Skipped entirely for reduced-motion — transitionend never fires without CSS transitions.
  const prevServedRef = useRef(customersServed);
  useEffect(() => {
    if (customersServed > prevServedRef.current) {
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setPaulaPhase(prev => prev === "idle" ? "walking-to-counter" : prev);
      }
    }
    prevServedRef.current = customersServed;
  }, [customersServed]);

  const visibleGuests = getDioramaGuestVisibility(gameState);

  // Cups on tables appear when cleanliness drops below clean threshold
  const tablesDirty =
    gameState.resources.cleanliness < 70 && (isOpen || isDayEnd) && customersServed >= 1;

  // Weirdness overlays become visible day 7 / weirdnessVisible flag
  const showWeirdness = gameState.weirdnessVisible || gameState.day >= 7;

  // KASSANDRA screen glows when installed / awake
  const kassandraAwake = gameState.kassandraInstalled || gameState.day >= 6;

  // Days 1-2 show dust motes (cafe-dust overlay). Background is always the
  // high-res stage base — v04-px.png is too small (223×177) for the zoom level.
  const isDusty = gameState.day <= 2;
  const stageBase = stageBaseAsset;

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
        {/* Scrollable / zoomable world — scale via --cafe-zoom, pan via --cafe-pan-x */}
        <div className="cafe-world">
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
            {tablesDirty && visibleGuests.mira && (
              <span className="cafe-cup cafe-cup--dirty" />
            )}
          </div>

          {/* Queue — customer waiting visible when day is open + actions remain */}
          <div className="cafe-queue" aria-hidden="true">
            {showQueueGuest || paulaPhase === "walking-to-counter" || paulaPhase === "exiting-east" ? (
              <span
                className={[
                  "placeholder-guest",
                  "placeholder-guest-normal-01",
                  paulaPhase === "at-door" ? "placeholder-guest--at-door" : "",
                  paulaPhase === "walking-to-counter" ? "placeholder-guest--walking-to-counter" :
                  paulaPhase === "exiting-east" ? "placeholder-guest--exiting-east" : ""
                ].filter(Boolean).join(" ")}
                onTransitionEnd={(e) => {
                  // Entrance: left transition completes → guest is at queue
                  if (e.propertyName === "left" && paulaPhase === "walking") {
                    setPaulaPhase("idle");
                  }
                  // Exit: bottom transition completes → guest reached counter, now exits east
                  if (e.propertyName === "bottom" && paulaPhase === "walking-to-counter") {
                    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                      setPaulaPhase("exiting-east");
                    } else if (showQueueGuest) {
                      setPaulaPhase("idle");
                    } else {
                      setPaulaPhase("at-door");
                    }
                  }
                  // East exit: left transition completes → guest has left, pick next and reset
                  if (e.propertyName === "left" && paulaPhase === "exiting-east") {
                    const nextGuest = QUEUE_ROTATION[customersServed % QUEUE_ROTATION.length];
                    setQueueGuest(nextGuest);
                    if (showQueueGuest && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                      setPaulaPhase("at-door");
                      requestAnimationFrame(() => {
                        requestAnimationFrame(() => setPaulaPhase("walking"));
                      });
                    } else if (showQueueGuest) {
                      setPaulaPhase("idle");
                    } else {
                      setPaulaPhase("at-door");
                    }
                  }
                }}
              >
                {/* Sprite sheet: idle when waiting, SE walk on entrance, N walk to counter.
                    Frame 0 of each sheet is the original static sprite (reduced-motion fallback). */}
                <span
                  className={[
                    "cafe-pilot-asset",
                    queueGuest === "paula"
                      ? "cafe-pilot-asset--paula"
                      : `cafe-pilot-asset--${queueGuest}-standing`,
                    paulaPhase === "walking" && queueGuest === "paula"
                      ? "cafe-pilot-asset--paula-walking" : "",
                    paulaPhase === "walking-to-counter" && queueGuest === "paula"
                      ? "cafe-pilot-asset--paula-walking-north" : "",
                    paulaPhase === "exiting-east" && queueGuest === "paula"
                      ? "cafe-pilot-asset--paula-walking-east" : ""
                  ].filter(Boolean).join(" ")}
                  aria-hidden="true"
                />
              </span>
            ) : null}
            {/* Second queue slot — empty placeholder kept for layout */}
            <span className="placeholder-guest placeholder-guest-normal-02" />
          </div>

          {/* Seated guest 1 — Cem, appears after first customer served */}
          {visibleGuests.cem && (
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
          {visibleGuests.mira && (
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
          {visibleGuests.lukas && (
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
          {visibleGuests.christa && (
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
          {visibleGuests.bohn && (
            <span
              className="placeholder-guest placeholder-guest-seated placeholder-guest-normal-07"
              aria-hidden="true"
            >
              <img
                className="cafe-pilot-asset cafe-pilot-asset--guest cafe-pilot-asset--bohn"
                src={bohnGuestAsset}
                alt=""
                aria-hidden="true"
              />
            </span>
          )}

          {/* Strange guest — day 4+, after 3 customers served */}
          {visibleGuests.strange && (
            <span
              className="placeholder-guest placeholder-guest-seated placeholder-guest-strange-01"
              aria-hidden="true"
            >
              <img
                className="cafe-pilot-asset cafe-pilot-asset--guest cafe-pilot-asset--strange"
                src={strangeGuestAsset}
                alt=""
                aria-hidden="true"
              />
            </span>
          )}

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
        <div className={`cafe-decor-plant cafe-plant cafe-decor--tier-${gameState.decor?.plant ?? 1}`} aria-hidden="true">
          <span />
        </div>
        <div className={`cafe-decor-clock cafe-decor--tier-${gameState.decor?.clock ?? 1}`} aria-hidden="true" />
        <div className={`cafe-decor-lamp cafe-decor--tier-${gameState.decor?.lamp ?? 1}`} aria-hidden="true" />
        <div className={`cafe-decor-cups cafe-decor--tier-${gameState.decor?.cups ?? 1}`} aria-hidden="true" />
        <div className={`cafe-decor-shelf cafe-decor--tier-${gameState.decor?.shelf ?? 1}`} aria-hidden="true" />
        </div>{/* /cafe-world */}
      </div>
    </section>
  );
}
