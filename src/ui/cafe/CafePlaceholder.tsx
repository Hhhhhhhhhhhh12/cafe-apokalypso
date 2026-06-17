import { useEffect, useRef, useState } from "react";
import type { GameState } from "../../game/types/game";
import type { ProductId } from "../../game/types/content";
import { getDioramaGuestVisibility } from "../../game/engine/selectors";
import stageBaseAsset from "../../../assets/backgrounds/placeholder-cafe-stage-base-v04-mid.png";
import coffeeMachineAsset from "../../../assets/sprites/props/placeholder-cafe-coffee-machine.png";
import kassandraRegisterAsset from "../../../assets/sprites/props/placeholder-kassandra-register.png";
import bohnGuestAsset from "../../../assets/sprites/guests/placeholder-guest-bohn.png";
import strangeGuestAsset from "../../../assets/sprites/guests/placeholder-guest-strange.png";
import cemGuestAsset from "../../../assets/sprites/guests/placeholder-guest-cem.png";
import miraGuestAsset from "../../../assets/sprites/guests/placeholder-guest-mira.png";
import lukasGuestAsset from "../../../assets/sprites/guests/placeholder-guest-lukas.png";
import christaGuestAsset from "../../../assets/sprites/guests/placeholder-guest-christa.png";

interface CafePlaceholderProps {
  gameState: GameState;
  onServeProduct?: (productId: ProductId) => void;
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

  const showQueueGuest = isOpen && actionPointsRemaining > 0;

  // Paula entrance phases
  const [paulaPhase, setPaulaPhase] = useState<
    "at-door" | "walking" | "idle" | "walking-to-counter" | "exiting-east"
  >("at-door");

  const QUEUE_ROTATION = ["kemal", "cem", "mira", "lukas", "christa"] as const;
  type QueueGuest = (typeof QUEUE_ROTATION)[number];
  const [queueGuest, setQueueGuest] = useState<QueueGuest>("kemal");

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
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setPaulaPhase("walking"));
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [showQueueGuest]);

  const prevServedRef = useRef(customersServed);
  useEffect(() => {
    if (customersServed > prevServedRef.current) {
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setPaulaPhase(prev => (prev === "idle" ? "walking-to-counter" : prev));
      }
    }
    prevServedRef.current = customersServed;
  }, [customersServed]);

  // Coin tick: track money + rep deltas on each serve
  const prevMoneyEarnedRef = useRef(gameState.dayManagement.moneyEarned);
  const prevRepRef = useRef(gameState.resources.reputation);
  const [coinTick, setCoinTick] = useState<{ money: number; rep: number; key: number } | null>(null);

  useEffect(() => {
    prevMoneyEarnedRef.current = gameState.dayManagement.moneyEarned;
    prevRepRef.current = gameState.resources.reputation;
  }, [gameState.dayPhase]);

  useEffect(() => {
    if (gameState.dayPhase !== "open") return;
    const moneyDelta = gameState.dayManagement.moneyEarned - prevMoneyEarnedRef.current;
    const repDelta = gameState.resources.reputation - prevRepRef.current;
    if (moneyDelta > 0) {
      setCoinTick(prev => ({ money: moneyDelta, rep: repDelta, key: (prev?.key ?? 0) + 1 }));
    }
    prevMoneyEarnedRef.current = gameState.dayManagement.moneyEarned;
    prevRepRef.current = gameState.resources.reputation;
  }, [gameState.dayManagement.customersServed]);

  const visibleGuests = getDioramaGuestVisibility(gameState);

  const tablesDirty =
    gameState.resources.cleanliness < 70 && (isOpen || isDayEnd) && customersServed >= 1;

  const showWeirdness = gameState.weirdnessVisible || gameState.day >= 7;
  const kassandraAwake = gameState.kassandraInstalled || gameState.day >= 6;
  const isDusty = gameState.day <= 2;

  return (
    <section
      className="panel cafe-panel cafe-stage"
      aria-labelledby="cafe-diorama-title"
    >
      <div className="panel-heading">
        <h2 id="cafe-diorama-title">The Café</h2>
      </div>

      <div
        className={[
          "placeholder-cafe-diorama",
          "cafe-diorama",
          cleanlinessClass,
          stressClass,
          dayClass,
          kassandraClass,
          weirdnessClass,
        ].join(" ")}
        role="img"
        aria-label={`3/4 café room on Day ${gameState.day}: counter, coffee machine, register, queue, ${gameState.equipment.seating >= 1 ? "two tables, " : "standing room only, "}door, window, storage shelf, and menu board.`}
      >
        {coinTick && (
          <span key={coinTick.key} className="cafe-coin-tick" aria-hidden="true">
            +€{coinTick.money.toFixed(2)}{coinTick.rep > 0 ? " ★" : ""}
          </span>
        )}
        <div className="cafe-world">
          <img className="cafe-stage-base" src={stageBaseAsset} alt="" aria-hidden="true" />
          {isDusty && <div className="cafe-dust" aria-hidden="true" />}

          {/* Décor props — positioned absolute via CSS, tier drives sprite */}
          <div className={`cafe-decor-clock cafe-decor--tier-${gameState.decor?.clock ?? 1}`} aria-hidden="true" />
          <div className={`cafe-decor-lamp cafe-decor--tier-${gameState.decor?.lamp ?? 1}`} aria-hidden="true" />
          <div className={`cafe-decor-cups cafe-decor--tier-${gameState.decor?.cups ?? 1}`} aria-hidden="true" />
          <div className={`cafe-plant cafe-decor-plant cafe-decor--tier-${gameState.decor?.plant ?? 1}`} aria-hidden="true" />

          {/* CSS back wall — window, menu board, storage shelf */}
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

          {/* CSS side wall — door */}
          <div className="cafe-side-wall" aria-hidden="true">
            <div className="cafe-door">
              <span />
            </div>
          </div>

          <div className="cafe-floor">
            <div className="cafe-floor__tiles" aria-hidden="true" />
            <div className="cafe-room-shadow" aria-hidden="true" />

            {/* Counter with sprite props */}
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
                {gameState.resources.stress >= 35 && (
                  <span className="cafe-coffee-machine__steam" />
                )}
                {gameState.resources.stress >= 55 && (
                  <span className="cafe-coffee-machine__steam cafe-coffee-machine__steam--soft" />
                )}
              </div>

              <div
                className={`cafe-register placeholder-kassandra-ui${kassandraAwake ? " cafe-register--awake" : ""}`}
              >
                <img
                  className="cafe-pilot-asset cafe-pilot-asset--kassandra-register"
                  src={kassandraRegisterAsset}
                  alt=""
                  aria-hidden="true"
                />
                <span
                  className={`cafe-register__screen${kassandraAwake ? " cafe-register__screen--active" : ""}`}
                />
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

            {/* Tables — only visible once furniture is owned (seating tier >= 1) */}
            {gameState.equipment.seating >= 1 && (
              <>
                <div className="cafe-table cafe-table--left" aria-hidden="true">
                  <span className="cafe-table__top" />
                  <span className="cafe-chair cafe-chair--front" />
                  <span className="cafe-chair cafe-chair--side" />
                  {tablesDirty && <span className="cafe-cup cafe-cup--dirty" />}
                </div>

                <div className="cafe-table cafe-table--right" aria-hidden="true">
                  <span className="cafe-table__top" />
                  <span className="cafe-chair cafe-chair--front" />
                  <span className="cafe-chair cafe-chair--side" />
                  {tablesDirty && visibleGuests.mira && (
                    <span className="cafe-cup cafe-cup--dirty" />
                  )}
                </div>
              </>
            )}

            {/* Queue */}
            <div className="cafe-queue" aria-hidden="true">
              {showQueueGuest ||
              paulaPhase === "walking-to-counter" ||
              paulaPhase === "exiting-east" ? (
                <span
                  className={[
                    "placeholder-guest",
                    "placeholder-guest-normal-01",
                    paulaPhase === "at-door" ? "placeholder-guest--at-door" : "",
                    paulaPhase === "walking-to-counter"
                      ? "placeholder-guest--walking-to-counter"
                      : paulaPhase === "exiting-east"
                        ? "placeholder-guest--exiting-east"
                        : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onTransitionEnd={(e) => {
                    if (e.propertyName === "left" && paulaPhase === "walking") {
                      setPaulaPhase("idle");
                    }
                    if (
                      e.propertyName === "bottom" &&
                      paulaPhase === "walking-to-counter"
                    ) {
                      if (
                        !window.matchMedia("(prefers-reduced-motion: reduce)").matches
                      ) {
                        setPaulaPhase("exiting-east");
                      } else if (showQueueGuest) {
                        setPaulaPhase("idle");
                      } else {
                        setPaulaPhase("at-door");
                      }
                    }
                    if (e.propertyName === "left" && paulaPhase === "exiting-east") {
                      const nextGuest =
                        QUEUE_ROTATION[customersServed % QUEUE_ROTATION.length];
                      setQueueGuest(nextGuest);
                      if (
                        showQueueGuest &&
                        !window.matchMedia("(prefers-reduced-motion: reduce)").matches
                      ) {
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
                  <span
                    className={`cafe-pilot-asset cafe-pilot-asset--${queueGuest}-standing`}
                    aria-hidden="true"
                  />
                  {paulaPhase === "idle" && (
                    <span className="guest-status guest-status--waiting">Waiting</span>
                  )}
                </span>
              ) : null}
              <span className="placeholder-guest placeholder-guest-normal-02">
                <span className="guest-status guest-status--waiting">Waiting</span>
              </span>
            </div>

            {/* Seated guests */}
            {visibleGuests.cem && (
              <span
                className="placeholder-guest placeholder-guest-seated placeholder-guest-normal-03"
                aria-hidden="true"
              >
                <img
                  className="cafe-pilot-asset cafe-pilot-asset--guest cafe-pilot-asset--cem"
                  src={cemGuestAsset}
                  aria-hidden="true"
                  alt=""
                />
                <span className="guest-status guest-status--seated">Cem · Seated</span>
              </span>
            )}

            {visibleGuests.mira && (
              <span
                className="placeholder-guest placeholder-guest-seated placeholder-guest-normal-04"
                aria-hidden="true"
              >
                <img
                  className="cafe-pilot-asset cafe-pilot-asset--guest cafe-pilot-asset--mira"
                  src={miraGuestAsset}
                  aria-hidden="true"
                  alt=""
                />
                <span className="guest-status guest-status--seated">Mira · Seated</span>
              </span>
            )}

            {visibleGuests.lukas && (
              <span
                className="placeholder-guest placeholder-guest-seated placeholder-guest-normal-05"
                aria-hidden="true"
              >
                <img
                  className="cafe-pilot-asset cafe-pilot-asset--guest cafe-pilot-asset--lukas"
                  src={lukasGuestAsset}
                  aria-hidden="true"
                  alt=""
                />
                <span className="guest-status guest-status--seated">Lukas · Seated</span>
              </span>
            )}

            {visibleGuests.christa && (
              <span
                className="placeholder-guest placeholder-guest-seated placeholder-guest-normal-06"
                aria-hidden="true"
              >
                <img
                  className="cafe-pilot-asset cafe-pilot-asset--guest cafe-pilot-asset--christa"
                  src={christaGuestAsset}
                  aria-hidden="true"
                  alt=""
                />
                <span className="guest-status guest-status--seated">Christa · Seated</span>
              </span>
            )}

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
                <span className="guest-status guest-status--seated">Bohn · Seated</span>
              </span>
            )}

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
                <span className="guest-status guest-status--seated">Seated</span>
              </span>
            )}

            {showWeirdness && (
              <div className="cafe-weirdness-hint" aria-hidden="true">
                <span className="cafe-clock" />
                <span className="cafe-shadow-note" />
                <span className="cafe-envelope" />
              </div>
            )}
          </div>
        </div>{/* /cafe-world */}
      </div>
    </section>
  );
}
