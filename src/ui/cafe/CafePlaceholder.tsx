import { formatAsche } from "../../game/engine/currency";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { GameAction, GameState, TableId } from "../../game/types/game";
import type { GuestId } from "../../game/types/content";
import {
  canAccessBrewGroup,
  getDayCoachHint,
  getEarlySceneGuestVisibility,
  getGuestForCustomer,
  getGuestPatienceState,
  getNarrativeEventCards,
  getNextGuestPreview,
  hasSecondBrewGroup
} from "../../game/engine/selectors";
import "./firstCup.css";
import { useBohnAppearance } from "./bohnAppearance";
import { DayOneVines } from "./DayOneVines";
import type { StorageLike } from "../../game/engine/save";
import { canJanaClearTable } from "../../game/engine/management";
import { CafeInteraction, type CafeStation } from "./CafeInteraction";
import { kassandraMessages } from "../../game/data/kassandra";
import stageDay1Asset from "../../../assets/backgrounds/placeholder-cafe-stage-v07-day-1.png";
import stageDay2Asset from "../../../assets/backgrounds/placeholder-cafe-stage-v07-day-2.png";
import stageDay3Asset from "../../../assets/backgrounds/placeholder-cafe-stage-v07-day-3.png";
import stageDay4Asset from "../../../assets/backgrounds/placeholder-cafe-stage-v07-day-4.png";
import stageDay5Asset from "../../../assets/backgrounds/placeholder-cafe-stage-v07-day-5.png";
import stageDay6Asset from "../../../assets/backgrounds/placeholder-cafe-stage-v07-day-6.png";
import stageDay7Asset from "../../../assets/backgrounds/placeholder-cafe-stage-v07-day-7.png";
import approvedDay1StageAsset from "../../../assets/backgrounds/placeholder-cafe-background-v12-isometric-day1-windows.png";
import coffeeMachineAsset from "../../../assets/sprites/props/placeholder-cafe-coffee-machine-v06-redesign.png";
import kassandraRegisterAsset from "../../../assets/sprites/props/placeholder-kassandra-register-v06-redesign.png";
import approvedCoffeeMachineAsset from "../../../assets/sprites/props/placeholder-cafe-espresso-machine-v01-target-reference.png";
import approvedCoffeeGrinderAsset from "../../../assets/sprites/props/placeholder-cafe-coffee-grinder-v01-target-reference.png";
import approvedKassandraRegisterAsset from "../../../assets/sprites/props/placeholder-cafe-cash-register-v01-target-reference.png";
import approvedTableLampAsset from "../../../assets/sprites/props/placeholder-cafe-table-lamp-v01-target-reference.png";
import approvedCupAsset from "../../../assets/sprites/props/placeholder-cafe-cup-v01-target-reference.png";
import approvedWallShelfAsset from "../../../assets/sprites/props/placeholder-cafe-wall-shelf-v01-target-reference.png";
import approvedWallClockAsset from "../../../assets/sprites/props/placeholder-cafe-wall-clock-v01-target-reference.png";
import approvedFloorPlantAsset from "../../../assets/sprites/props/placeholder-cafe-floor-plant-v02-target-reference.png";
import strangeGuestAsset from "../../../assets/sprites/guests/placeholder-guest-strange.png";
import cemSeatedAsset from "../../../assets/sprites/guests/placeholder-guest-cem-seated.png";
import miraSeatedAsset from "../../../assets/sprites/guests/placeholder-guest-mira-seated.png";
import lukasSeatedAsset from "../../../assets/sprites/guests/placeholder-guest-lukas-seated.png";
import christaSeatedAsset from "../../../assets/sprites/guests/placeholder-guest-christa-seated.png";
import neleSeatedAsset from "../../../assets/sprites/guests/placeholder-guest-nele-seated.png";
import medaGuestAsset from "../../../assets/sprites/guests/placeholder-guest-meda.png";
import roterRegenschirmGuestAsset from "../../../assets/sprites/guests/placeholder-guest-roter-regenschirm.png";
import approvedFatouSeatedAsset from "../../../assets/sprites/guests/placeholder-guest-fatou-seated-v02-front-candidate.png";
import fatouSeatedAsset from "../../../assets/sprites/guests/placeholder-guest-fatou-seated.png";

const QUEUE_SPRITES = {
  "pendler-kemal": "kemal",
  "pendlerin-paula": "paula",
  "pendlerin-fatou": "fatou",
  "nachbarin-mira": "mira",
  "laptop-lukas": "lukas",
  "lieferfahrer-cem": "cem",
  "cappuccino-christa": "christa",
  "herr-bohn": "bohn",
  "freelancerin-nele": "nele",
  "herr-grau": "grau",
  "frau-roter-regenschirm": "roter-regenschirm",
  "meda": "meda",
} as const satisfies Record<GuestId, string>;
const DAILY_STAGE_ASSETS = [
  stageDay1Asset,
  stageDay2Asset,
  stageDay3Asset,
  stageDay4Asset,
  stageDay5Asset,
  stageDay6Asset,
  stageDay7Asset,
] as const;

/** Window-safe reduced-motion check, callable during render. */
function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true
  );
}

interface CafePlaceholderProps {
  gameState: GameState;
  onAction?: (action: GameAction) => void;
  introActive?: boolean;
  bohnStorage?: StorageLike | null;
  bohnOccluder?: HTMLElement | null;
  /** Fired when the player selects a specific dirty table in the diorama (issue #73). */
  onCleanTable?: (tableId: TableId) => void;
}

interface SceneLine {
  text: string;
  key: number;
  day: GameState["day"];
}

interface StationSelection {
  station: CafeStation;
  day: GameState["day"];
  phase: GameState["dayPhase"];
  queuePosition: number;
  initialStatus: string;
}

export function CafePlaceholder({
  gameState,
  onAction,
  introActive = false,
  onCleanTable,
  bohnStorage = null,
  bohnOccluder = null
}: CafePlaceholderProps) {
  const { standing: bohnStanding, seated: bohnSeated, spriteRef: bohnRef } = useBohnAppearance(bohnStorage, bohnOccluder);
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
  const queuePosition = customersServed + gameState.dayManagement.guestsLost;
  const incomingGuestId = getGuestForCustomer(gameState, queuePosition)?.id ?? "pendler-kemal";
  const isOpen = gameState.dayPhase === "open";
  const isDayEnd = gameState.dayPhase === "day_end";
  const usesApprovedDayOneScene = gameState.day === 1;

  const shiftOver = gameState.cafeClosed || gameState.demoComplete;
  const showQueueGuest = isOpen && actionPointsRemaining > 0 && !shiftOver;
  const canInteract = Boolean(onAction) && !shiftOver && !introActive;
  const machineIsInteractive = canInteract && canAccessBrewGroup(gameState);
  const secondBrewGroup = hasSecondBrewGroup(gameState);
  const machineSprite = (
    <img
      className="cafe-pilot-asset cafe-pilot-asset--coffee-machine"
      src={usesApprovedDayOneScene ? approvedCoffeeMachineAsset : coffeeMachineAsset}
      alt=""
    />
  );
  const [selection, setSelection] = useState<StationSelection | null>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const entryRef = useRef<{ button: HTMLButtonElement; phase: GameState["dayPhase"] } | null>(null);
  const doorRef = useRef<HTMLButtonElement>(null);
  const backRef = useRef<HTMLButtonElement>(null);

  let activeStation: CafeStation | null = null;
  if (canInteract && selection?.day === gameState.day) {
    if (selection.station === "door" && selection.phase === "open" && isDayEnd) {
      activeStation = "stock";
    } else if (
      selection.phase === gameState.dayPhase &&
      (selection.station !== "service" || selection.queuePosition === queuePosition)
    ) {
      activeStation = selection.station;
    }
  }
  if (selection && !activeStation) setSelection(null);

  useLayoutEffect(() => {
    if (activeStation) {
      backRef.current?.focus();
    } else if (entryRef.current) {
      const entry = entryRef.current;
      entryRef.current = null;
      if (shiftOver || introActive) return;

      const scene = sceneRef.current;
      const firstGuest = entry.phase === "setup" && isOpen
        ? scene?.querySelector<HTMLButtonElement>(".cafe-order-bubble")
        : null;
      const next = firstGuest ?? (entry.button.isConnected
        ? entry.button
        : scene?.querySelector<HTMLButtonElement>("[data-cafe-entry]") ?? headingRef.current);
      next?.focus();
    }
  }, [activeStation, introActive, isOpen, shiftOver]);

  function openStation(station: CafeStation, source: HTMLButtonElement) {
    entryRef.current = { button: source, phase: gameState.dayPhase };
    setSelection({
      station,
      day: gameState.day,
      phase: gameState.dayPhase,
      queuePosition,
      initialStatus: gameState.statusMessage
    });
  }

  // Patience signal — add impatient class when guest has < 30 % patience left
  const { currentGuestPatience, currentGuestPatienceMax } = gameState.dayManagement;
  const patienceRatio =
    isOpen && currentGuestPatienceMax > 0
      ? currentGuestPatience / currentGuestPatienceMax
      : 1;
  const guestIsImpatient = isOpen && showQueueGuest && patienceRatio < 0.3;

  // Paula entrance phases
  const [paulaPhase, setPaulaPhase] = useState<
    "at-door" | "walking" | "idle" | "walking-to-counter" | "walking-to-door"
  >(() => prefersReducedMotion() ? "idle" : "at-door");

  const [queueGuest, setQueueGuest] = useState<GuestId>(incomingGuestId);

  // Adjust-during-render: when the queue toggles, snapshot the guest for this
  // opening and place Paula — reading customersServed directly instead of
  // smuggling it past the effect deps via a ref. With reduced motion she goes
  // straight to idle here; rAF timing can't be relied on (hidden tabs), and
  // there is no walk to stage anyway.
  const [prevShowQueueGuest, setPrevShowQueueGuest] = useState(showQueueGuest);
  if (prevShowQueueGuest !== showQueueGuest) {
    setPrevShowQueueGuest(showQueueGuest);
    if (showQueueGuest) {
      setQueueGuest(incomingGuestId);
      setPaulaPhase(prefersReducedMotion() ? "idle" : "at-door");
    } else if (!isOpen || shiftOver) {
      setPaulaPhase("at-door");
    }
  }

  // The walk itself stays in an effect: it needs a painted "at-door" frame
  // before flipping to "walking", so the set happens inside rAF callbacks.
  useEffect(() => {
    if (!showQueueGuest || paulaPhase !== "at-door" || prefersReducedMotion()) {
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
  }, [paulaPhase, showQueueGuest]);

  // A serve sends the current guest to the counter before the queue advances.
  const [prevServed, setPrevServed] = useState(customersServed);
  const [prevQueuePosition, setPrevQueuePosition] = useState(queuePosition);
  if (prevQueuePosition !== queuePosition) {
    setPrevQueuePosition(queuePosition);
    setPrevServed(customersServed);
    if (
      customersServed > prevServed && isOpen && !shiftOver &&
      (paulaPhase === "idle" || paulaPhase === "walking") && !prefersReducedMotion()
    ) {
      setPaulaPhase("walking-to-counter");
    } else if (paulaPhase !== "walking-to-counter" && paulaPhase !== "walking-to-door") {
      // Lost guests and reduced-motion serves advance the visible identity
      // immediately. An exiting guest keeps its sprite until the exit ends.
      setQueueGuest(incomingGuestId);
    }
  }

  // If an animation is interrupted, restore a selectable guest.
  useEffect(() => {
    if (paulaPhase === "walking") {
      const timer = setTimeout(() => setPaulaPhase("idle"), 1350);
      return () => clearTimeout(timer);
    }
    if (paulaPhase !== "walking-to-counter" && paulaPhase !== "walking-to-door") return;
    const timer = setTimeout(() => {
      setQueueGuest(incomingGuestId);
      setPaulaPhase(prefersReducedMotion() ? "idle" : "at-door");
    }, paulaPhase === "walking-to-counter" ? 850 : 1550);
    return () => clearTimeout(timer);
  }, [incomingGuestId, paulaPhase]);

  // A2: Serve reaction bubble — first sentence of statusMessage, shown 2.5 s
  const [serveReaction, setServeReaction] = useState<SceneLine | null>(null);

  // B2: Kassandra passive aside — every 3rd serve, shown 4 s
  const [kassandraAside, setKassandraAside] = useState<SceneLine | null>(null);

  // B1: Ambient event overlay — "On the floor" events shown every 2nd serve, 3 s
  const [ambientEvent, setAmbientEvent] = useState<SceneLine | null>(null);

  // Adjust-during-render: a serve increment spawns the feedback bubbles, reading
  // statusMessage and the narrative selectors straight from this render's props.
  const [prevServedForFeedback, setPrevServedForFeedback] = useState(customersServed);
  if (prevServedForFeedback !== customersServed) {
    setPrevServedForFeedback(customersServed);
    if (customersServed > prevServedForFeedback) {
      // A2: serve reaction
      const firstSentence = gameState.statusMessage?.split(/\.\s+/)[0]?.trim() ?? null;
      if (gameState.day > 3 && firstSentence) {
        setServeReaction(prev => ({ text: firstSentence, key: (prev?.key ?? 0) + 1, day: gameState.day }));
      }
      // B2 — every 3rd serve
      if (gameState.kassandraInstalled && customersServed % 3 === 0) {
        const idx = (Math.floor(customersServed / 3) - 1 + kassandraMessages.length) % kassandraMessages.length;
        setKassandraAside(prev => ({ text: kassandraMessages[idx].text, key: (prev?.key ?? 0) + 1, day: gameState.day }));
      }
      // B1 — every 2nd serve, pick a floor event
      if (gameState.day > 3 && customersServed % 2 === 0) {
        const floorEvents = getNarrativeEventCards(gameState).filter(
          e => e.kicker === "On the floor"
        );
        if (floorEvents.length > 0) {
          const evt = floorEvents[Math.floor(customersServed / 2) % floorEvents.length];
          const text = evt.flavorLines?.[0] ?? evt.text;
          setAmbientEvent(prev => ({ text, key: (prev?.key ?? 0) + 1, day: gameState.day }));
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

  const showNino = isOpen && gameState.day >= 3 && !gameState.cafeClosed && !gameState.demoComplete &&
    gameState.helperAssignment?.helperId === "nino" && gameState.helperAssignment.locked;
  const firstCupServed = isOpen && gameState.day === 1 &&
    gameState.pendingEvents.includes("day-1-first-cup");
  const [previousFirstCupServed, setPreviousFirstCupServed] = useState(firstCupServed);
  const [firstCupOrder, setFirstCupOrder] = useState<number | null>(null);
  if (firstCupServed !== previousFirstCupServed) {
    setPreviousFirstCupServed(firstCupServed);
    setFirstCupOrder(firstCupServed ? customersServed : null);
  }
  useEffect(() => {
    if (firstCupOrder === null) return;
    const timer = setTimeout(() => setFirstCupOrder(null), 4800);
    return () => clearTimeout(timer);
  }, [firstCupOrder]);

  const playFirstCup = firstCupOrder === customersServed && !activeStation;

  // Coin tick: track money + rep deltas on each serve
  const prevMoneyEarnedRef = useRef(gameState.dayManagement.moneyEarned);
  const prevRepRef = useRef(gameState.resources.reputation);
  const [coinTick, setCoinTick] = useState<{ money: number; rep: number; key: number; day: GameState["day"] } | null>(null);

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
      setCoinTick(prev => ({ money: moneyDelta, rep: repDelta, key: (prev?.key ?? 0) + 1, day: gameState.day }));
    }
    prevMoneyEarnedRef.current = gameState.dayManagement.moneyEarned;
    prevRepRef.current = gameState.resources.reputation;
  }, [gameState.day, gameState.dayManagement.customersServed, gameState.dayManagement.moneyEarned, gameState.dayPhase, gameState.resources.reputation]);

  const visibleGuests = getEarlySceneGuestVisibility(gameState);
  const earlyV07 = gameState.day === 2 || gameState.day === 3;
  const guestInQueue = showQueueGuest || paulaPhase === "walking-to-counter" ||
    paulaPhase === "walking-to-door" ? queueGuest : null;
  const lukasHasSeat = visibleGuests.lukas && guestInQueue !== "laptop-lukas";
  const nextGuest = getNextGuestPreview(gameState);
  const patience = getGuestPatienceState(gameState);
  const canTakeOrder =
    canInteract && showQueueGuest && queueGuest === incomingGuestId &&
    paulaPhase === "idle";

  const dirtyTableIds = new Set(gameState.dayManagement.dirtyTableIds);

  const showWeirdness = gameState.weirdnessVisible || gameState.day >= 7 || gameState.hiddenWeirdness >= 3;
  const kassandraAwake = gameState.kassandraInstalled || gameState.day >= 6;
  const isDusty = gameState.day <= 2;
  const emptyStock = Object.values(gameState.supplies).some((quantity) => quantity === 0);
  const showBoard = canInteract && isOpen &&
    ((gameState.day >= 3 && gameState.unlocks.pricing) || (gameState.day >= 4 && gameState.unlocks.advertising));
  const highlightBoard = showBoard && getDayCoachHint(gameState)?.target === "offer";
  const stockEntry = canInteract && (isOpen || isDayEnd) ? (
    <button
      type="button"
      className={`cafe-cue cafe-cue--stock${isOpen && emptyStock ? " cafe-cue--empty" : ""}`}
      data-cafe-entry
      onClick={(event) => openStation("stock", event.currentTarget)}
    >
      {isDayEnd ? "Day result & restock" : emptyStock ? "Supplies · empty" : "Supplies"}
    </button>
  ) : null;
  const stationFeedback = selection?.station === activeStation && selection.initialStatus !== gameState.statusMessage
    ? gameState.statusMessage
    : null;

  return (
    <section
      className="panel cafe-panel cafe-stage"
      aria-labelledby="cafe-diorama-title"
      onKeyDown={(event) => {
        if (activeStation && event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          setSelection(null);
        }
      }}
    >
      <div className="panel-heading">
        <h2 id="cafe-diorama-title" ref={headingRef} tabIndex={-1}>The Café</h2>
        {isOpen && !shiftOver ? (
          <span className="cafe-stage__capacity">
            {actionPointsRemaining} {actionPointsRemaining === 1 ? "action" : "actions"} left
          </span>
        ) : null}
      </div>

      <div className="cafe-scene-frame" data-station={activeStation ?? undefined} ref={sceneRef}>
        <div
          className={[
            "placeholder-cafe-diorama",
            "cafe-diorama",
            cleanlinessClass,
            stressClass,
            dayClass,
            growthDayClass,
            earlyV07 ? "cafe-diorama--early-v07" : "",
            gameState.day <= 3 ? "cafe-diorama--early-service" : "",
            kassandraClass,
            weirdnessClass,
            usesApprovedDayOneScene ? "cafe-diorama--approved-day-one" : "",
          ].join(" ")}
        >
          {isOpen && coinTick?.day === gameState.day && (
            <span key={`coin-${coinTick.key}`} className="cafe-coin-tick" aria-hidden="true">
              +{formatAsche(coinTick.money)}{coinTick.rep > 0 ? " ★" : ""}
            </span>
          )}
          {isOpen && serveReaction?.day === gameState.day && (
            <span key={`serve-${serveReaction.key}`} className="cafe-serve-reaction" aria-hidden="true">
              {serveReaction.text}
            </span>
          )}
          {isOpen && ambientEvent?.day === gameState.day && (
            <span key={`ambient-${ambientEvent.key}`} className="cafe-ambient-event" aria-hidden="true">
              {ambientEvent.text}
            </span>
          )}
          {isOpen && kassandraAside?.day === gameState.day && (
            <span key={`kassandra-${kassandraAside.key}`} className="cafe-kassandra-aside" aria-hidden="true">
              {kassandraAside.text}
            </span>
          )}
          <div role="status" className="cafe-first-cup-announcement">
            {playFirstCup ? "The crema blinks." : ""}
          </div>
          <div className="cafe-world" inert={Boolean(activeStation) || introActive}>
            <img
              className="cafe-stage-base"
              src={usesApprovedDayOneScene
                ? approvedDay1StageAsset
                : DAILY_STAGE_ASSETS[Math.max(0, Math.min(6, gameState.day - 1))]}
              alt={`Isometric café room on Day ${gameState.day}, with a counter, door and windows.`}
            />
            {usesApprovedDayOneScene && (
              <div className="cafe-approved-wall-shelf">
                <img src={approvedWallShelfAsset} alt="" />
                {stockEntry}
              </div>
            )}
            {showNino && (
              <div className="cafe-staff-nino" style={{ position: "absolute", left: "56%", bottom: "17%", zIndex: 6, translate: "-50%" }} aria-hidden="true">
                <span className="cafe-staff-nino__stand" />
                <span className="cafe-staff-nino__walk" />
              </div>
            )}
            {playFirstCup && (
              <div className="cafe-first-cup" style={{ left: "42%", bottom: "58%", width: "3.25%", zIndex: 24 }} aria-hidden="true">
                <div className="cafe-first-cup__steam"><span /><span /><span /></div>
                <img src={approvedCupAsset} alt="" />
                <div className="cafe-first-cup__coffee"><span /></div>
              </div>
            )}
            {isDusty && <div className="cafe-dust" aria-hidden="true" />}
            {usesApprovedDayOneScene && gameState.equipment.clock >= 1 && (
              <img className="cafe-approved-wall-clock" src={approvedWallClockAsset} alt="" aria-hidden="true" />
            )}
            {usesApprovedDayOneScene && (
              <div className="cafe-approved-floor-plant" aria-hidden="true">
                <img src={approvedFloorPlantAsset} alt="" />
                <DayOneVines actionPointsSpent={gameState.dayManagement.actionPointsSpent} actionPointsRemaining={actionPointsRemaining} />
              </div>
            )}

            {/* Décor props — positioned absolute via CSS, tier drives sprite */}
            <div className={`cafe-decor-clock cafe-decor--tier-${gameState.decor?.clock ?? 1}`} aria-hidden="true" />
            <div className={`cafe-decor-lamp cafe-decor--tier-${gameState.decor?.lamp ?? 1}`} aria-hidden="true" />
            <div className={`cafe-plant cafe-decor-plant cafe-decor--tier-${gameState.decor?.plant ?? 1}`} aria-hidden="true" />
            <div className={`cafe-decor-plant2 cafe-decor--tier-${gameState.decor?.plant2 ?? 1}`} aria-hidden="true" />
            <div className={`cafe-furniture-shelf cafe-decor--tier-${gameState.decor?.shelf ?? 1}`}>
              {!usesApprovedDayOneScene ? stockEntry : null}
            </div>

            {/* Fantasy pets — cozy décor with a faint twist (#73 world-building) */}
            <div className="cafe-pet cafe-pet-cat" aria-hidden="true" />
            <div className="cafe-pet cafe-pet-dragon" aria-hidden="true" />
            <div className="cafe-pet cafe-pet-fluff" aria-hidden="true" />

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
              <div className="cafe-counter">
                <div className="cafe-counter__front" />
                <div className="cafe-counter__ledge" />

                <div className={`cafe-coffee-machine${gameState.equipment.machine < 1 ? " cafe-coffee-machine--unowned" : ""}`}>
                  {machineIsInteractive ? (
                    <button
                      type="button"
                      className="cafe-coffee-machine__control"
                      data-cafe-entry
                      aria-label={secondBrewGroup ? "Espresso machine, second brew group fitted" : "Inspect espresso machine"}
                      onClick={(event) => openStation("machine", event.currentTarget)}
                    >
                      {machineSprite}
                      <span className="cafe-coffee-machine__label" aria-hidden="true">
                        {secondBrewGroup ? "Second group ready" : "Inspect"}
                      </span>
                    </button>
                  ) : machineSprite}
                  {secondBrewGroup ? <span className="cafe-coffee-machine__connector" aria-hidden="true" /> : null}
                  <span className="cafe-coffee-machine__screen" />
                  {gameState.resources.stress >= 35 && (
                    <span className="cafe-coffee-machine__steam" />
                  )}
                  {gameState.resources.stress >= 55 && (
                    <span className="cafe-coffee-machine__steam cafe-coffee-machine__steam--soft" />
                  )}
                  {canInteract && gameState.dayPhase === "setup" ? (
                    <button
                      type="button"
                      className="cafe-cue cafe-cue--setup"
                      data-cafe-entry
                      onClick={(event) => openStation("setup", event.currentTarget)}
                    >
                      Set up counter
                    </button>
                  ) : null}
                  {activeStation === "setup" && gameState.equipment.machine >= 1 ? (
                    <span className="cafe-machine-ready" aria-hidden="true">Machine ready</span>
                  ) : null}
                </div>
                {canInteract && isOpen && actionPointsRemaining > 0 &&
                  (dirtyTableIds.size === 0 || gameState.equipment.seating < 1) ? (
                  <button
                    type="button"
                    className="cafe-cue cafe-cue--tidy"
                    aria-label="Tidy the room (1 action)"
                    onClick={() => {
                      if (actionPointsRemaining === 1) headingRef.current?.focus({ preventScroll: true });
                      onAction?.({ type: "clean_tables" });
                    }}
                  >
                    Tidy room
                  </button>
                ) : null}

                {gameState.equipment.grinder >= 1 && (
                  <img className="cafe-approved-counter-prop cafe-approved-counter-prop--grinder"
                    src={approvedCoffeeGrinderAsset} alt="" aria-hidden="true" />
                )}

                <img
                  className="cafe-approved-counter-prop cafe-approved-counter-prop--lamp"
                  src={approvedTableLampAsset}
                  alt=""
                  aria-hidden="true"
                />

                <img
                  className="cafe-approved-counter-prop cafe-approved-counter-prop--cup"
                  src={approvedCupAsset}
                  alt=""
                  aria-hidden="true"
                />

                <div
                  className={`cafe-register placeholder-kassandra-ui${kassandraAwake ? " cafe-register--awake" : ""}`}
                >
                  <img
                    className="cafe-pilot-asset cafe-pilot-asset--kassandra-register"
                    src={
                      usesApprovedDayOneScene
                        ? approvedKassandraRegisterAsset
                        : kassandraRegisterAsset
                    }
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

                <div
                  className={`cafe-decor-cups cafe-decor--tier-${gameState.decor?.cups ?? 1}`}
                  aria-hidden="true"
                />

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
                    const hasCemSeat = usesApprovedDayOneScene && pos === "left";
                    const hasApprovedFatouSeat = usesApprovedDayOneScene && pos === "back";
                    const className = `cafe-table cafe-table--${pos} cafe-table--tier-${gameState.equipment.seating}`;
                    const inner = (
                      <>
                        <span className="cafe-table__top" />
                        {!hasApprovedFatouSeat && <span className="cafe-chair cafe-chair--front" />}
                        {!hasCemSeat && <span className="cafe-chair cafe-chair--side" />}
                        <span className="cafe-table-plant" aria-hidden="true" />
                        {dirty && <span className="cafe-cup cafe-cup--dirty" />}
                      </>
                    );
                    const janaCanClear = canJanaClearTable(gameState);
                    const cleanLabel = janaCanClear ? "ask Jana to clear it (0 actions)" : "wipe it down (1 action)";
                    const clickable = dirty && isOpen && !shiftOver && !introActive &&
                      (actionPointsRemaining > 0 || janaCanClear) && Boolean(onCleanTable || onAction);
                    const table = clickable ? (
                      <button
                        key={pos}
                        type="button"
                        className={`${className} cafe-table--clickable`}
                        onClick={() => {
                          headingRef.current?.focus({ preventScroll: true });
                          if (onCleanTable) onCleanTable(pos);
                          else onAction?.({ type: "clean_table", tableId: pos });
                        }}
                        aria-label={`Dirty ${pos} table — ${cleanLabel}`}
                        title={cleanLabel}
                      >
                        {inner}
                        <span className="cafe-cue cafe-cue--wipe" aria-hidden="true">{janaCanClear ? "Ask Jana" : "Wipe"}</span>
                      </button>
                    ) : (
                      <div key={pos} className={className} aria-hidden="true">
                        {inner}
                      </div>
                    );
                    if (hasCemSeat) {
                      return (
                        <div key={pos} className="cafe-table cafe-table--left cafe-cem-table-group">
                          <span className="cafe-chair cafe-chair--side" aria-hidden="true" />
                          {visibleGuests.cem && guestInQueue !== "lieferfahrer-cem" && (
                            <span className="placeholder-guest placeholder-guest-seated cafe-cem-seat"
                              data-seat="left-back" data-guest="cem" aria-hidden="true">
                              <img className="cafe-pilot-asset cafe-pilot-asset--guest cafe-pilot-asset--cem"
                                src={cemSeatedAsset} alt="" aria-hidden="true" />
                            </span>
                          )}
                          {table}
                        </div>
                      );
                    }
                    if (!hasApprovedFatouSeat) return table;
                    return (
                      <div key={pos} className="cafe-table cafe-table--back cafe-fatou-table-group">
                        {table}
                        {visibleGuests.fatou && guestInQueue !== "pendlerin-fatou" && (
                          <span className="placeholder-guest placeholder-guest-seated cafe-fatou-seat"
                            data-seat="back-front" data-guest="fatou" aria-hidden="true">
                            <img className="cafe-pilot-asset cafe-pilot-asset--guest cafe-pilot-asset--fatou"
                              src={approvedFatouSeatedAsset} alt="" aria-hidden="true" />
                          </span>
                        )}
                        <span className={`cafe-chair cafe-chair--front cafe-table--tier-${gameState.equipment.seating}`}
                          aria-hidden="true" />
                      </div>
                    );
                  })}
                </>
              )}

              {/* Queue */}
              <div className="cafe-queue">
                {canInteract && !isDayEnd ? (
                  <button
                    type="button"
                    className="cafe-cue cafe-cue--door"
                    ref={doorRef}
                    data-cafe-entry
                    onClick={(event) => openStation("door", event.currentTarget)}
                  >
                    {isOpen ? "Close day" : "Open café"}
                  </button>
                ) : null}
                {showBoard ? (
                  <button
                    type="button"
                    className={`cafe-cue cafe-cue--board${highlightBoard ? " cafe-coach-pulse" : ""}`}
                    data-cafe-entry
                    onClick={(event) => openStation("board", event.currentTarget)}
                  >
                    Noticeboard
                  </button>
                ) : null}
                {isOpen && !shiftOver && (showQueueGuest ||
                paulaPhase === "walking-to-counter" ||
                paulaPhase === "walking-to-door") ? (
                  <span
                    data-guest-id={queueGuest}
                    className={[
                      "placeholder-guest",
                      "placeholder-guest-normal-01",
                      paulaPhase === "at-door" ? "placeholder-guest--at-door" : "",
                      paulaPhase === "walking" ? "placeholder-guest--arriving" : "",
                      paulaPhase === "walking-to-counter"
                        ? "placeholder-guest--walking-to-counter"
                        : paulaPhase === "walking-to-door"
                          ? "placeholder-guest--walking-to-door"
                          : "",
                      guestIsImpatient && paulaPhase === "idle"
                        ? "cafe-guest--impatient"
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onTransitionEnd={(e) => {
                      if (e.target === e.currentTarget && e.propertyName === "bottom" &&
                        paulaPhase === "walking-to-counter") setPaulaPhase("walking-to-door");
                    }}
                    onAnimationEnd={(e) => {
                      if (e.target !== e.currentTarget) return;
                      if (e.animationName === "cafe-guest-enter" && paulaPhase === "walking") {
                        setPaulaPhase("idle");
                      }
                      if (e.animationName === "cafe-guest-leave" && paulaPhase === "walking-to-door") {
                        setQueueGuest(incomingGuestId);
                        setPaulaPhase(prefersReducedMotion() ? "idle" : "at-door");
                      }
                    }}
                  >
                    <span
                      className={`cafe-pilot-asset cafe-pilot-asset--standing cafe-pilot-asset--${QUEUE_SPRITES[queueGuest]}-standing`}
                      ref={queueGuest === "herr-bohn" ? bohnRef : undefined}
                      style={queueGuest === "herr-bohn" ? { backgroundImage: `url("${bohnStanding}")` } : undefined}
                      aria-hidden="true"
                    />
                    {canTakeOrder && nextGuest ? (
                      <button
                        type="button"
                        className="cafe-order-bubble"
                        data-cafe-entry
                        aria-label={`Take order from ${nextGuest.name}`}
                        aria-description={nextGuest.orderLine || undefined}
                        onClick={(event) => openStation("service", event.currentTarget)}
                      >
                        <span className="cafe-order-bubble__line">
                          {nextGuest.orderLine ? <q>{nextGuest.orderLine}</q> : "Take order"}
                        </span>
                        <span className="cafe-order-bubble__short">{nextGuest.wants || "Take order"}</span>
                        <span className="cafe-order-bubble__arrow" aria-hidden="true">→</span>
                        {patience?.critical ? <span className="cafe-order-bubble__warning">About to leave</span> : null}
                      </button>
                    ) : null}
                  </span>
                ) : null}
                <span className="placeholder-guest placeholder-guest-normal-02" aria-hidden="true">
                  <span className="guest-status guest-status--waiting">Waiting</span>
                </span>
              </div>

              {/* Seated guests */}
              {visibleGuests.cem && guestInQueue !== "lieferfahrer-cem" && !usesApprovedDayOneScene && (
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

              {visibleGuests.mira && guestInQueue !== "nachbarin-mira" && !usesApprovedDayOneScene && (
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

              {lukasHasSeat && !usesApprovedDayOneScene && (
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

              {visibleGuests.christa && guestInQueue !== "cappuccino-christa" && (
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

              {visibleGuests.bohn && guestInQueue !== "herr-bohn" && (
                <span
                  className="placeholder-guest placeholder-guest-seated placeholder-guest-normal-07"
                  aria-hidden="true"
                >
                  <img
                    className="cafe-pilot-asset cafe-pilot-asset--guest cafe-pilot-asset--bohn"
                    src={bohnSeated}
                    ref={bohnRef}
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

              {visibleGuests.nele && !earlyV07 && (
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

              {visibleGuests.fatou && guestInQueue !== "pendlerin-fatou" && !usesApprovedDayOneScene && (!earlyV07 || !lukasHasSeat) && (
                <span
                  className={`placeholder-guest placeholder-guest-seated ${earlyV07 ? "placeholder-guest-normal-05" : "placeholder-guest-normal-09"}`}
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
        {activeStation && onAction ? (
          <CafeInteraction
            key={activeStation}
            station={activeStation}
            gameState={gameState}
            feedback={stationFeedback}
            backRef={backRef}
            onBack={() => setSelection(null)}
            onGoToDoor={() => {
              if (doorRef.current) openStation("door", doorRef.current);
            }}
            onAction={onAction}
          />
        ) : null}
      </div>
    </section>
  );
}
