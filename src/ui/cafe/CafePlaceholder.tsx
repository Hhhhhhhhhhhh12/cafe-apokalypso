import { useEffect, useRef, useState } from "react";
import type { GameState, TableId } from "../../game/types/game";
import type { ProductId } from "../../game/types/content";
import { getDioramaGuestVisibility, getNextGuestPreview, getNarrativeEventCards } from "../../game/engine/selectors";
import { kassandraMessages } from "../../game/data/kassandra";
import floorGrowthAsset from "../../../assets/backgrounds/placeholder-cafe-floor-growth-v01.png";
import stageShellAsset from "../../../assets/backgrounds/placeholder-cafe-stage-shell-v01.png";
import coffeeMachineAsset from "../../../assets/sprites/props/placeholder-cafe-coffee-machine.png";
import kassandraRegisterAsset from "../../../assets/sprites/props/placeholder-kassandra-register.png";
import bohnGuestAsset from "../../../assets/sprites/guests/placeholder-guest-bohn.png";
import strangeGuestAsset from "../../../assets/sprites/guests/placeholder-guest-strange.png";
import cemSeatedAsset from "../../../assets/sprites/guests/placeholder-guest-cem-seated.png";
import miraSeatedAsset from "../../../assets/sprites/guests/placeholder-guest-mira-seated.png";
import lukasSeatedAsset from "../../../assets/sprites/guests/placeholder-guest-lukas-seated.png";
import christaSeatedAsset from "../../../assets/sprites/guests/placeholder-guest-christa-seated.png";
import neleSeatedAsset from "../../../assets/sprites/guests/placeholder-guest-nele-seated.png";
import medaGuestAsset from "../../../assets/sprites/guests/placeholder-guest-meda.png";
import roterRegenschirmGuestAsset from "../../../assets/sprites/guests/placeholder-guest-roter-regenschirm.png";
import fatouSeatedAsset from "../../../assets/sprites/guests/placeholder-guest-fatou-seated.png";

const QUEUE_ROTATION = ["kemal", "cem", "mira", "lukas", "christa", "fatou"] as const;
type QueueGuest = (typeof QUEUE_ROTATION)[number];

/** Window-safe reduced-motion check, callable during render. */
function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

interface CafePlaceholderProps {
  gameState: GameState;
  onServeProduct?: (productId: ProductId) => void;
  /** Fired when the player selects a specific dirty table in the diorama (issue #73). */
  onCleanTable?: (tableId: TableId) => void;
}

export function CafePlaceholder({ gameState, onCleanTable }: CafePlaceholderProps) {
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
  const growthDayClass = `cafe-diorama--growth-day-${Math.min(7, Math.max(1, gameState.day))}`;
  const kassandraClass =
    gameState.kassandraInstalled || gameState.unlocks.kassandra || gameState.day >= 6
      ? "cafe-diorama--kassandra-awake"
      : "cafe-diorama--kassandra-quiet";
  const weirdnessClass = gameState.weirdnessVisible
    ? "cafe-diorama--weirdness-visible"
    : gameState.hiddenWeirdness >= 10
      ? "cafe-diorama--weirdness-deep cafe-diorama--weirdness-deniable"
      : gameState.hiddenWeirdness >= 3
        ? "cafe-diorama--weirdness-low cafe-diorama--weirdness-deniable"
        : "cafe-diorama--weirdness-deniable";

  // --- State-driven guest + prop visibility ---
  const { customersServed, actionPointsRemaining } = gameState.dayManagement;
  const isOpen = gameState.dayPhase === "open";
  const isDayEnd = gameState.dayPhase === "day_end";

  const showQueueGuest = isOpen && actionPointsRemaining > 0;

  // Patience signal — add impatient class when guest has < 30 % patience left
  const { currentGuestPatience, currentGuestPatienceMax } = gameState.dayManagement;
  const patienceRatio =
    isOpen && currentGuestPatienceMax > 0
      ? currentGuestPatience / currentGuestPatienceMax
      : 1;
  const guestIsImpatient = isOpen && showQueueGuest && patienceRatio < 0.3;

  // Paula entrance phases
  const [paulaPhase, setPaulaPhase] = useState<
    "at-door" | "walking" | "idle" | "walking-to-counter" | "exiting-east"
  >("at-door");

  const [queueGuest, setQueueGuest] = useState<QueueGuest>(
    () => QUEUE_ROTATION[customersServed % QUEUE_ROTATION.length]
  );

  // Adjust-during-render: when the queue toggles, snapshot the guest for this
  // opening and place Paula — reading customersServed directly instead of
  // smuggling it past the effect deps via a ref. With reduced motion she goes
  // straight to idle here; rAF timing can't be relied on (hidden tabs), and
  // there is no walk to stage anyway.
  const [prevShowQueueGuest, setPrevShowQueueGuest] = useState(showQueueGuest);
  if (prevShowQueueGuest !== showQueueGuest) {
    setPrevShowQueueGuest(showQueueGuest);
    if (showQueueGuest) {
      setQueueGuest(QUEUE_ROTATION[customersServed % QUEUE_ROTATION.length]);
      setPaulaPhase(prefersReducedMotion() ? "idle" : "at-door");
    } else {
      setPaulaPhase("at-door");
    }
  }

  // The walk itself stays in an effect: it needs a painted "at-door" frame
  // before flipping to "walking", so the set happens inside rAF callbacks.
  useEffect(() => {
    if (!showQueueGuest || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setPaulaPhase("walking"));
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [showQueueGuest]);

  // Adjust-during-render: a completed serve sends idle Paula to the counter.
  const [prevServed, setPrevServed] = useState(customersServed);
  if (prevServed !== customersServed) {
    setPrevServed(customersServed);
    if (customersServed > prevServed && paulaPhase === "idle" && !prefersReducedMotion()) {
      setPaulaPhase("walking-to-counter");
    }
  }

  // A2: Serve reaction bubble — first sentence of statusMessage, shown 2.5 s
  const [serveReaction, setServeReaction] = useState<{ text: string; key: number } | null>(null);

  // B2: Kassandra passive aside — every 3rd serve, shown 4 s
  const [kassandraAside, setKassandraAside] = useState<{ text: string; key: number } | null>(null);

  // B1: Ambient event overlay — "On the floor" events shown every 2nd serve, 3 s
  const [ambientEvent, setAmbientEvent] = useState<{ text: string; key: number } | null>(null);

  // Adjust-during-render: a serve increment spawns the feedback bubbles, reading
  // statusMessage and the narrative selectors straight from this render's props.
  const [prevServedForFeedback, setPrevServedForFeedback] = useState(customersServed);
  if (prevServedForFeedback !== customersServed) {
    setPrevServedForFeedback(customersServed);
    if (customersServed > prevServedForFeedback) {
      // A2: serve reaction
      const firstSentence = gameState.statusMessage?.split(/\.\s+/)[0]?.trim() ?? null;
      if (firstSentence) {
        setServeReaction(prev => ({ text: firstSentence, key: (prev?.key ?? 0) + 1 }));
      }
      // B2 — every 3rd serve
      if (customersServed % 3 === 0) {
        const idx = (Math.floor(customersServed / 3) - 1 + kassandraMessages.length) % kassandraMessages.length;
        setKassandraAside(prev => ({ text: kassandraMessages[idx].text, key: (prev?.key ?? 0) + 1 }));
      }
      // B1 — every 2nd serve, pick a floor event
      if (customersServed % 2 === 0) {
        const floorEvents = getNarrativeEventCards(gameState).filter(
          e => e.kicker === "On the floor"
        );
        if (floorEvents.length > 0) {
          const evt = floorEvents[Math.floor(customersServed / 2) % floorEvents.length];
          const text = evt.flavorLines?.[0] ?? evt.text;
          setAmbientEvent(prev => ({ text, key: (prev?.key ?? 0) + 1 }));
        }
      }
    }
  }

  // Expiry timers — one effect per bubble, keyed on the payload object, so a
  // fresh serve restarts the clock exactly like the old manual timer refs.
  useEffect(() => {
    if (!serveReaction) return;
    const timer = setTimeout(() => setServeReaction(null), 2500);
    return () => clearTimeout(timer);
  }, [serveReaction]);

  useEffect(() => {
    if (!kassandraAside) return;
    const timer = setTimeout(() => setKassandraAside(null), 4000);
    return () => clearTimeout(timer);
  }, [kassandraAside]);

  useEffect(() => {
    if (!ambientEvent) return;
    const timer = setTimeout(() => setAmbientEvent(null), 3500);
    return () => clearTimeout(timer);
  }, [ambientEvent]);

  // Coin tick: track money + rep deltas on each serve
  const prevMoneyEarnedRef = useRef(gameState.dayManagement.moneyEarned);
  const prevRepRef = useRef(gameState.resources.reputation);
  const [coinTick, setCoinTick] = useState<{ money: number; rep: number; key: number } | null>(null);

  // Snapshot baseline when the day phase changes; prevDayPhaseRef guards against running on
  // money/rep changes that share the same deps array.
  const prevDayPhaseRef = useRef(gameState.dayPhase);
  useEffect(() => {
    if (gameState.dayPhase === prevDayPhaseRef.current) return;
    prevDayPhaseRef.current = gameState.dayPhase;
    prevMoneyEarnedRef.current = gameState.dayManagement.moneyEarned;
    prevRepRef.current = gameState.resources.reputation;
  }, [gameState.dayPhase, gameState.dayManagement.moneyEarned, gameState.resources.reputation]);

  useEffect(() => {
    if (gameState.dayPhase !== "open") return;
    const moneyDelta = gameState.dayManagement.moneyEarned - prevMoneyEarnedRef.current;
    const repDelta = gameState.resources.reputation - prevRepRef.current;
    if (moneyDelta > 0) {
      setCoinTick(prev => ({ money: moneyDelta, rep: repDelta, key: (prev?.key ?? 0) + 1 }));
    }
    prevMoneyEarnedRef.current = gameState.dayManagement.moneyEarned;
    prevRepRef.current = gameState.resources.reputation;
  }, [gameState.dayManagement.customersServed, gameState.dayManagement.moneyEarned, gameState.dayPhase, gameState.resources.reputation]);

  const visibleGuests = getDioramaGuestVisibility(gameState);
  const nextGuest = getNextGuestPreview(gameState);

  const dirtyTableIds = new Set(gameState.dayManagement.dirtyTableIds);

  const showWeirdness = gameState.weirdnessVisible || gameState.day >= 7 || gameState.hiddenWeirdness >= 3;
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
          growthDayClass,
          kassandraClass,
          weirdnessClass,
        ].join(" ")}
        role="img"
        aria-label={`3/4 café room on Day ${gameState.day}: counter, coffee machine, register, queue, ${gameState.equipment.seating >= 1 ? "two tables, " : "standing room only, "}door, window, storage shelf, and menu board.`}
      >
        {coinTick && (
          <span key={`coin-${coinTick.key}`} className="cafe-coin-tick" aria-hidden="true">
            +€{coinTick.money.toFixed(2)}{coinTick.rep > 0 ? " ★" : ""}
          </span>
        )}
        {serveReaction && (
          <span key={`serve-${serveReaction.key}`} className="cafe-serve-reaction" aria-hidden="true">
            {serveReaction.text}
          </span>
        )}
        {ambientEvent && (
          <span key={`ambient-${ambientEvent.key}`} className="cafe-ambient-event" aria-hidden="true">
            {ambientEvent.text}
          </span>
        )}
        {kassandraAside && (
          <span key={`kassandra-${kassandraAside.key}`} className="cafe-kassandra-aside" aria-hidden="true">
            {kassandraAside.text}
          </span>
        )}
        <div className="cafe-world">
          <img className="cafe-floor-growth" src={floorGrowthAsset} alt="" aria-hidden="true" />
          <img className="cafe-stage-base" src={stageShellAsset} alt="" aria-hidden="true" />
          {isDusty && <div className="cafe-dust" aria-hidden="true" />}

          {/* Décor props — positioned absolute via CSS, tier drives sprite */}
          <div className={`cafe-decor-clock cafe-decor--tier-${gameState.decor?.clock ?? 1}`} aria-hidden="true" />
          <div className={`cafe-decor-lamp cafe-decor--tier-${gameState.decor?.lamp ?? 1}`} aria-hidden="true" />
          <div className={`cafe-decor-cups cafe-decor--tier-${gameState.decor?.cups ?? 1}`} aria-hidden="true" />
          <div className={`cafe-plant cafe-decor-plant cafe-decor--tier-${gameState.decor?.plant ?? 1}`} aria-hidden="true" />
          <div className={`cafe-decor-plant2 cafe-decor--tier-${gameState.decor?.plant2 ?? 1}`} aria-hidden="true" />
          <div className={`cafe-furniture-shelf cafe-decor--tier-${gameState.decor?.shelf ?? 1}`} aria-hidden="true" />

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

            {/* Tables — direct, table-by-table cleaning makes early floor work tangible (#73). */}
            {gameState.equipment.seating >= 1 && (
              <>
                {([
                  { pos: "left" },
                  { pos: "right" },
                  { pos: "back" }
                ] as const).map(({ pos }) => {
                  const dirty = dirtyTableIds.has(pos);
                  const className = `cafe-table cafe-table--${pos} cafe-table--tier-${gameState.equipment.seating}`;
                  const inner = (
                    <>
                      <span className="cafe-table__top" />
                      <span className="cafe-chair cafe-chair--front" />
                      <span className="cafe-chair cafe-chair--side" />
                      {dirty && <span className="cafe-cup cafe-cup--dirty" />}
                    </>
                  );
                  const clickable =
                    dirty && isOpen && gameState.dayManagement.actionPointsRemaining > 0 && !!onCleanTable;
                  return clickable ? (
                    <button
                      key={pos}
                      type="button"
                      className={`${className} cafe-table--clickable`}
                      onClick={() => onCleanTable(pos)}
                      aria-label={`Dirty ${pos} table — wipe it down (1 action)`}
                      title={`Wipe the ${pos} table (1 action)`}
                    >
                      {inner}
                    </button>
                  ) : (
                    <div key={pos} className={className} aria-hidden="true">
                      {inner}
                    </div>
                  );
                })}
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
                    guestIsImpatient && paulaPhase === "idle"
                      ? "cafe-guest--impatient"
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
                    className={`cafe-pilot-asset cafe-pilot-asset--standing cafe-pilot-asset--${queueGuest}-standing`}
                    aria-hidden="true"
                  />
                  {paulaPhase === "idle" && nextGuest?.wants && (
                    <span
                      className="cafe-guest-thought-bubble"
                      aria-label={`Guest wants: ${nextGuest.wants}`}
                    >
                      {nextGuest.wants}
                    </span>
                  )}
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
                  src={cemSeatedAsset}
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
                  src={miraSeatedAsset}
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
                  src={lukasSeatedAsset}
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
                  src={christaSeatedAsset}
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

            {visibleGuests.nele && (
              <span
                className="placeholder-guest placeholder-guest-seated placeholder-guest-normal-08"
                aria-hidden="true"
              >
                <img
                  className="cafe-pilot-asset cafe-pilot-asset--guest cafe-pilot-asset--nele"
                  src={neleSeatedAsset}
                  alt=""
                  aria-hidden="true"
                />
                <span className="guest-status guest-status--seated">Nele · Seated</span>
              </span>
            )}

            {visibleGuests.meda && (
              <span
                className="placeholder-guest placeholder-guest-seated placeholder-guest-strange-02"
                aria-hidden="true"
              >
                <img
                  className="cafe-pilot-asset cafe-pilot-asset--guest cafe-pilot-asset--meda"
                  src={medaGuestAsset}
                  alt=""
                  aria-hidden="true"
                />
                <span className="guest-status guest-status--seated">Seated</span>
              </span>
            )}

            {visibleGuests.roterRegenschirm && (
              <span
                className="placeholder-guest placeholder-guest-seated placeholder-guest-strange-03"
                aria-hidden="true"
              >
                <img
                  className="cafe-pilot-asset cafe-pilot-asset--guest cafe-pilot-asset--roter-regenschirm"
                  src={roterRegenschirmGuestAsset}
                  alt=""
                  aria-hidden="true"
                />
                <span className="guest-status guest-status--seated">Seated</span>
              </span>
            )}

            {visibleGuests.fatou && (
              <span
                className="placeholder-guest placeholder-guest-seated placeholder-guest-normal-09"
                aria-hidden="true"
              >
                <img
                  className="cafe-pilot-asset cafe-pilot-asset--guest cafe-pilot-asset--fatou"
                  src={fatouSeatedAsset}
                  alt=""
                  aria-hidden="true"
                />
                <span className="guest-status guest-status--seated">Fatou · Seated</span>
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
