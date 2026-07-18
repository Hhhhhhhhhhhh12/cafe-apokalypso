import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import type { GameState } from "../../game/types/game";
import type { ProductId } from "../../game/types/content";
import { getDioramaGuestVisibility, getNextGuestPreview, getNarrativeEventCards } from "../../game/engine/selectors";
import { kassandraMessages } from "../../game/data/kassandra";
import {
  COUNTER_FRAME,
  DECOR_SPOTS,
  GUEST_SPOTS,
  PAULA_PATH,
  STAGE_DETAIL_SPOTS,
  TABLE_SPOTS,
  WEIRDNESS_SPOT,
  spotStyle,
} from "./scene";
import stageBaseAsset from "../../../assets/backgrounds/placeholder-cafe-stage-base-v06-pixellab.png";
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

const SEATED_GUESTS = [
  { key: "cem", asset: cemSeatedAsset, label: "Cem · Seated" },
  { key: "mira", asset: miraSeatedAsset, label: "Mira · Seated" },
  { key: "lukas", asset: lukasSeatedAsset, label: "Lukas · Seated" },
  { key: "christa", asset: christaSeatedAsset, label: "Christa · Seated" },
  { key: "bohn", asset: bohnGuestAsset, label: "Bohn · Seated" },
  { key: "strange", asset: strangeGuestAsset, label: "Seated" },
  { key: "nele", asset: neleSeatedAsset, label: "Nele · Seated" },
  { key: "meda", asset: medaGuestAsset, label: "Seated" },
  { key: "roterRegenschirm", asset: roterRegenschirmGuestAsset, label: "Seated", spriteClass: "roter-regenschirm" },
  { key: "fatou", asset: fatouSeatedAsset, label: "Fatou · Seated" },
] as const;

/** Window-safe reduced-motion check, callable during render. */
function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

interface CafeSceneProps {
  gameState: GameState;
  onServeProduct?: (productId: ProductId) => void;
  /** Fired when the player clicks a dirty table in the diorama (issue #130). */
  onCleanTables?: () => void;
}

/**
 * Datengetriebene Café-Szene: Alle Positionen kommen aus scene.ts (Stage-%),
 * alle Sprite-/Animations-Stile weiter aus den bestehenden CSS-Klassen.
 * Ersetzt die verschachtelten Positionierungs-Container (back-wall/side-wall/
 * floor/queue) des alten CafePlaceholder durch eine flache Sprite-Liste.
 */
export function CafeScene({ gameState, onCleanTables }: CafeSceneProps) {
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
  // opening and place Paula. With reduced motion she goes straight to idle.
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

  const [prevServedForFeedback, setPrevServedForFeedback] = useState(customersServed);
  if (prevServedForFeedback !== customersServed) {
    setPrevServedForFeedback(customersServed);
    if (customersServed > prevServedForFeedback) {
      const firstSentence = gameState.statusMessage?.split(/\.\s+/)[0]?.trim() ?? null;
      if (firstSentence) {
        setServeReaction(prev => ({ text: firstSentence, key: (prev?.key ?? 0) + 1 }));
      }
      if (customersServed % 3 === 0) {
        const idx = (Math.floor(customersServed / 3) - 1 + kassandraMessages.length) % kassandraMessages.length;
        setKassandraAside(prev => ({ text: kassandraMessages[idx].text, key: (prev?.key ?? 0) + 1 }));
      }
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

  // Expiry timers — one effect per bubble, keyed on the payload object.
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

  const tablesDirty =
    gameState.resources.cleanliness < 70 && (isOpen || isDayEnd) && customersServed >= 1;

  const showWeirdness = gameState.weirdnessVisible || gameState.day >= 7 || gameState.hiddenWeirdness >= 3;
  const kassandraAwake = gameState.kassandraInstalled || gameState.day >= 6;
  const isDusty = gameState.day <= 2;

  // Dev-Kalibrierung: Klick in die Szene loggt Stage-% (getBoundingClientRect
  // der world-Box ist bereits zoom-transformiert — keine Inverse nötig).
  const worldRef = useRef<HTMLDivElement>(null);
  const logStageSpot = useCallback((e: MouseEvent<HTMLDivElement>) => {
    if (!import.meta.env.DEV || !worldRef.current) return;
    const box = worldRef.current.getBoundingClientRect();
    const x = ((e.clientX - box.left) / box.width) * 100;
    const bottom = (1 - (e.clientY - box.top) / box.height) * 100;
    // eslint-disable-next-line no-console
    console.info(`[scene] left: ${x.toFixed(1)}%, bottom: ${bottom.toFixed(1)}%`);
  }, []);

  // Paula's inline position per phase; class transitions animate the change.
  const paulaSpot =
    paulaPhase === "at-door"
      ? { ...PAULA_PATH.atDoor, transition: "none" as const }
      : paulaPhase === "walking-to-counter"
        ? PAULA_PATH.toCounter
        : paulaPhase === "exiting-east"
          ? PAULA_PATH.exitEast
          : PAULA_PATH.queue;

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
        {serveReaction && (
          <span key={serveReaction.key} className="cafe-serve-reaction" aria-hidden="true">
            {serveReaction.text}
          </span>
        )}
        {ambientEvent && (
          <span key={ambientEvent.key} className="cafe-ambient-event" aria-hidden="true">
            {ambientEvent.text}
          </span>
        )}
        {kassandraAside && (
          <span key={kassandraAside.key} className="cafe-kassandra-aside" aria-hidden="true">
            {kassandraAside.text}
          </span>
        )}
        <div className="cafe-world" ref={worldRef} onClick={logStageSpot}>
          <img className="cafe-stage-base" src={stageBaseAsset} alt="" aria-hidden="true" />
          {/* Hochdichte Detail-Sprites über dem 400-px-Shell (Fenster/Tür) */}
          <div style={spotStyle(STAGE_DETAIL_SPOTS.windowL)} className="cafe-stage-detail cafe-stage-detail--window-l" aria-hidden="true" />
          <div style={spotStyle(STAGE_DETAIL_SPOTS.windowR)} className="cafe-stage-detail cafe-stage-detail--window-r" aria-hidden="true" />
          <div style={spotStyle(STAGE_DETAIL_SPOTS.door)} className="cafe-stage-detail cafe-stage-detail--door" aria-hidden="true" />
          {isDusty && <div className="cafe-dust" aria-hidden="true" />}

          {/* Décor props — Position aus scene.ts, Tier-Sprite aus der Klasse */}
          <div style={spotStyle(DECOR_SPOTS.clock)} className={`cafe-decor-clock cafe-decor--tier-${gameState.decor?.clock ?? 1}`} aria-hidden="true" />
          <div style={spotStyle(DECOR_SPOTS.lamp)} className={`cafe-decor-lamp cafe-decor--tier-${gameState.decor?.lamp ?? 1}`} aria-hidden="true" />
          <div style={spotStyle(DECOR_SPOTS.cups)} className={`cafe-decor-cups cafe-decor--tier-${gameState.decor?.cups ?? 1}`} aria-hidden="true" />
          <div style={spotStyle(DECOR_SPOTS.plant)} className={`cafe-plant cafe-decor-plant cafe-decor--tier-${gameState.decor?.plant ?? 1}`} aria-hidden="true" />
          <div style={spotStyle(DECOR_SPOTS.plant2)} className={`cafe-decor-plant2 cafe-decor--tier-${gameState.decor?.plant2 ?? 1}`} aria-hidden="true" />
          <div style={spotStyle(DECOR_SPOTS.shelf)} className={`cafe-storage cafe-decor--tier-${gameState.decor?.shelf ?? 1}`} aria-hidden="true">
            <span />
            <span />
            <span />
          </div>

          {/* Theke mit Sprite-Props (Kinder-Offsets bleiben CSS) */}
          <div style={spotStyle(COUNTER_FRAME)} className="cafe-counter" aria-hidden="true">
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

          {/* Tische — sichtbar ab seating tier 1; dreckige Tische sind klickbar (#130) */}
          {gameState.equipment.seating >= 1 && (
            <>
              {([
                { pos: "left", dirty: tablesDirty },
                { pos: "right", dirty: tablesDirty && visibleGuests.mira },
                { pos: "back", dirty: tablesDirty && visibleGuests.fatou }
              ] as const).map(({ pos, dirty }) => {
                const className = `cafe-table cafe-table--${pos} cafe-table--tier-${gameState.equipment.seating}`;
                const style = spotStyle(TABLE_SPOTS[pos]);
                const inner = dirty ? <span className="cafe-cup cafe-cup--dirty" /> : null;
                const clickable =
                  dirty && isOpen && gameState.dayManagement.actionPointsRemaining > 0 && !!onCleanTables;
                return clickable ? (
                  <button
                    key={pos}
                    type="button"
                    style={style}
                    className={`${className} cafe-table--clickable`}
                    onClick={onCleanTables}
                    aria-label="Dirty table — wipe it down (1 action)"
                    title="Wipe the tables (1 action)"
                  >
                    {inner}
                  </button>
                ) : (
                  <div key={pos} style={style} className={className} aria-hidden="true">
                    {inner}
                  </div>
                );
              })}
            </>
          )}

          {/* Warteschlange: Paula-Wegpunkte aus scene.ts, Übergänge aus CSS */}
          {showQueueGuest ||
          paulaPhase === "walking-to-counter" ||
          paulaPhase === "exiting-east" ? (
            <span
              style={{ ...spotStyle({ ...paulaSpot, z: PAULA_PATH.z, centered: true }), ...("transition" in paulaSpot ? { transition: paulaSpot.transition } : {}) }}
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
                  const upNext =
                    QUEUE_ROTATION[customersServed % QUEUE_ROTATION.length];
                  setQueueGuest(upNext);
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
          <span style={spotStyle(GUEST_SPOTS.waitingExtra)} className="placeholder-guest placeholder-guest-normal-02">
            <span className="guest-status guest-status--waiting">Waiting</span>
          </span>

          {/* Sitzende Gäste — Sichtbarkeit aus dem Selector, Platz aus scene.ts */}
          {SEATED_GUESTS.map(({ key, asset, label, ...guest }) =>
            visibleGuests[key] ? (
              <span
                key={key}
                style={spotStyle(GUEST_SPOTS[key])}
                className={`placeholder-guest placeholder-guest-seated ${GUEST_SPOTS[key].legacyClass}`}
                aria-hidden="true"
              >
                <img
                  className={`cafe-pilot-asset cafe-pilot-asset--guest cafe-pilot-asset--${"spriteClass" in guest ? guest.spriteClass : key}`}
                  src={asset}
                  alt=""
                  aria-hidden="true"
                />
                <span className="guest-status guest-status--seated">{label}</span>
              </span>
            ) : null
          )}

          {showWeirdness && (
            <div style={spotStyle(WEIRDNESS_SPOT)} className="cafe-weirdness-hint" aria-hidden="true">
              <span className="cafe-clock" />
              <span className="cafe-shadow-note" />
              <span className="cafe-envelope" />
            </div>
          )}
        </div>{/* /cafe-world */}
      </div>
    </section>
  );
}
