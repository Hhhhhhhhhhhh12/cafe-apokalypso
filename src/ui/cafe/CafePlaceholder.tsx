import { RecoveryHearts } from "./RecoveryHearts";
import { formatAsche } from "../../game/engine/currency";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { GameAction, GameState, TableId } from "../../game/types/game";
import type { GuestId } from "../../game/types/content";
import {
  canAccessBrewGroup,
  canImproveRecoveryByCleaning,
  canUseKassandra,
  getDayCoachHint,
  getAvailableProducts,
  getDioramaGuestVisibility,
  getGuestForCustomer,
  getGuestPatienceState,
  getNarrativeEventCards,
  getNextGuestPreview,
  getShiftActionBudget,
  hasSecondBrewGroup,
  isDaySevenLetterDelivered,
  isDaySevenRush,
  isEarlyKassandraConsult
} from "../../game/engine/selectors";
import "./firstCup.css";
import { useBohnAppearance } from "./bohnAppearance";
import { DayOneVines } from "./DayOneVines";
import type { StorageLike } from "../../game/engine/save";
import { canJanaClearTable, PATIENCE_TICK } from "../../game/engine/management";
import { DAY_SEVEN_SERVE_GOAL, hasShiftCleaning } from "../../game/engine/objectives";
import { CafeInteraction, type CafeStation } from "./CafeInteraction";
import { CafeShiftHelper, StaffPortrait } from "./CafeShiftHelper";
import { RecoveryFeedback } from "./RecoveryFeedback";
import { CafeTableGuest } from "./CafeTableGuest";
import { approvedSeats, type SeatedGuestId } from "../../game/data/approvedSeats";
import approvedDay1StageAsset from "../../../assets/backgrounds/placeholder-cafe-background-v12-isometric-day1-windows.png";
import approvedCoffeeMachineAsset from "../../../assets/sprites/props/placeholder-cafe-espresso-machine-v01-target-reference.png";
import approvedCoffeeGrinderAsset from "../../../assets/sprites/props/placeholder-cafe-coffee-grinder-v01-target-reference.png";
import approvedKassandraRegisterAsset from "../../../assets/sprites/props/placeholder-cafe-cash-register-v01-target-reference.png";
import approvedTableLampAsset from "../../../assets/sprites/props/placeholder-cafe-table-lamp-v01-target-reference.png";
import approvedCupAsset from "../../../assets/sprites/props/placeholder-cafe-cup-v01-target-reference.png";
import approvedWallShelfAsset from "../../../assets/sprites/props/placeholder-cafe-wall-shelf-v01-target-reference.png";
import approvedWallClockAsset from "../../../assets/sprites/props/placeholder-cafe-wall-clock-v01-target-reference.png";
import approvedFloorPlantAsset from "../../../assets/sprites/props/placeholder-cafe-floor-plant-v02-target-reference.png";

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
  const { standing: bohnStanding, spriteRef: bohnRef } = useBohnAppearance(bohnStorage, bohnOccluder);
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
  const isFinalShift = gameState.day === 7;
  const finalRush = isDaySevenRush(gameState);
  const letterDelivered = isDaySevenLetterDelivered(gameState);

  const shiftOver = gameState.cafeClosed || gameState.demoComplete;
  const showQueueGuest = isOpen && actionPointsRemaining > 0 && !shiftOver;
  const followingGuest = (finalRush || (gameState.day >= 4 && !isFinalShift)) && showQueueGuest && actionPointsRemaining > 1
    ? getGuestForCustomer(gameState, queuePosition + 1)
    : undefined;
  const canInteract = Boolean(onAction) && !shiftOver && !introActive;
  const canReadLetter = Boolean(onAction) && letterDelivered;
  const machineIsInteractive = canInteract && canAccessBrewGroup(gameState);
  const registerIsInteractive = canInteract && canUseKassandra(gameState);
  const earlyForecastAvailable = isEarlyKassandraConsult(gameState) && actionPointsRemaining > 0;
  const registerSprite = (
    <img className="cafe-pilot-asset cafe-pilot-asset--kassandra-register"
      src={approvedKassandraRegisterAsset} alt="" />
  );
  const secondBrewGroup = hasSecondBrewGroup(gameState);
  const machineSprite = (
    <img
      className="cafe-pilot-asset cafe-pilot-asset--coffee-machine"
      src={approvedCoffeeMachineAsset}
      alt=""
    />
  );
  const [selection, setSelection] = useState<StationSelection | null>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const entryRef = useRef<{ button: HTMLButtonElement; phase: GameState["dayPhase"] } | null>(null);
  const doorRef = useRef<HTMLButtonElement>(null);
  const letterRef = useRef<HTMLButtonElement>(null);
  const backRef = useRef<HTMLButtonElement>(null);

  let activeStation: CafeStation | null = null;
  if ((canInteract || canReadLetter) && selection?.day === gameState.day) {
    if (selection.station === "door" && selection.phase === "open" && isDayEnd) {
      activeStation = "stock";
    } else if (
      (canInteract || selection.station === "letter" || selection.station === "stock") &&
      selection.phase === gameState.dayPhase &&
      (selection.station !== "service" || selection.queuePosition === queuePosition)
    ) {
      activeStation = selection.station;
    }
  }
  if (selection && !activeStation) setSelection(null);

  useLayoutEffect(() => {
    const preventScroll = window.innerWidth > 760;
    if (activeStation) {
      backRef.current?.focus({ preventScroll });
    } else if (entryRef.current) {
      const entry = entryRef.current;
      entryRef.current = null;
      if ((shiftOver && !canReadLetter) || introActive) return;

      const scene = sceneRef.current;
      const firstGuest = entry.phase === "setup" && isOpen
        ? scene?.querySelector<HTMLButtonElement>(".cafe-order-bubble")
        : null;
      const next = firstGuest ?? (entry.button.isConnected
        ? entry.button
        : letterRef.current ?? scene?.querySelector<HTMLButtonElement>("[data-cafe-entry]") ?? headingRef.current);
      next?.focus({ preventScroll });
    }
  }, [activeStation, canReadLetter, introActive, isOpen, shiftOver]);

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

  const patience = getGuestPatienceState(gameState);
  const guestIsImpatient = showQueueGuest && patience &&
    (patience.critical || patience.patience / patience.max < 0.3);

  // Paula entrance phases
  const [paulaPhase, setPaulaPhase] = useState<
    "at-door" | "walking" | "idle" | "walking-to-counter" | "walking-to-door" | "leaving-queue"
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
    } else if (gameState.day >= 4 && customersServed === prevServed &&
      queuePosition > prevQueuePosition && paulaPhase === "idle" && !prefersReducedMotion()) {
      setPaulaPhase("leaving-queue");
    } else if (paulaPhase !== "walking-to-counter" && paulaPhase !== "walking-to-door" && paulaPhase !== "leaving-queue") {
      // Reduced-motion serves advance immediately. Exiting guests keep their sprite.
      setQueueGuest(incomingGuestId);
    }
  }

  // If an animation is interrupted, restore a selectable guest.
  useEffect(() => {
    if (paulaPhase === "walking") {
      const timer = setTimeout(() => setPaulaPhase("idle"), 1350);
      return () => clearTimeout(timer);
    }
    if (paulaPhase !== "walking-to-counter" && paulaPhase !== "walking-to-door" && paulaPhase !== "leaving-queue") return;
    const timer = setTimeout(() => {
      setQueueGuest(incomingGuestId);
      setPaulaPhase(prefersReducedMotion() ? "idle" : "at-door");
    }, paulaPhase === "walking-to-counter" ? 850 : 1550);
    return () => clearTimeout(timer);
  }, [incomingGuestId, paulaPhase]);

  // A2: Serve reaction bubble — first sentence of statusMessage, shown 2.5 s
  const [serveReaction, setServeReaction] = useState<SceneLine | null>(null);

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
      if (gameState.day === 4 && firstSentence) {
        setServeReaction(prev => ({ text: firstSentence, key: (prev?.key ?? 0) + 1, day: gameState.day }));
      }
      // B1 — every 2nd serve, pick a floor event
      if (gameState.day === 4 && customersServed % 2 === 0) {
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
    if (!ambientEvent) return;
    const timer = setTimeout(() => setAmbientEvent(null), 3500);
    return () => clearTimeout(timer);
  }, [ambientEvent]);

  const showNino = isOpen && gameState.day >= 3 && gameState.day !== 5 && !gameState.cafeClosed && !gameState.demoComplete &&
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

  const visibleGuests = getDioramaGuestVisibility(gameState);
  const frontOfQueue = showQueueGuest || paulaPhase === "walking-to-counter" ||
    paulaPhase === "walking-to-door" || paulaPhase === "leaving-queue" ? queueGuest : null;
  const queueIncludes = (guestId: GuestId) => frontOfQueue === guestId || followingGuest?.id === guestId;
  const seatedGuests: SeatedGuestId[] = ([
    ["laptop-lukas", visibleGuests.lukas], ["cappuccino-christa", visibleGuests.christa],
    ["pendlerin-fatou", visibleGuests.fatou], ["nachbarin-mira", visibleGuests.mira],
    ["meda", visibleGuests.meda], ["freelancerin-nele", visibleGuests.nele]
  ] as const).filter(([id, visible]) => visible && !queueIncludes(id)).map(([id]) => id);
  const nextGuest = getNextGuestPreview(gameState);
  const recovery = nextGuest?.recovery;
  const wantedProduct = getAvailableProducts(gameState).find(product => product.name === nextGuest?.wants);
  const canTakeOrder =
    canInteract && showQueueGuest && queueGuest === incomingGuestId &&
    paulaPhase === "idle";

  const cleanTable = (tableId: TableId) => {
    headingRef.current?.focus({ preventScroll: true });
    if (onCleanTable) onCleanTable(tableId);
    else onAction?.({ type: "clean_table", tableId });
  };
  const dirtyTableIds = new Set(gameState.dayManagement.dirtyTableIds);

  const showWeirdness = gameState.weirdnessVisible || gameState.day >= 7 || gameState.hiddenWeirdness >= 3;
  const kassandraAwake = gameState.kassandraInstalled || gameState.day >= 6;
  const isDusty = gameState.day <= 2;
  const emptyStock = Object.values(gameState.supplies).some((quantity) => quantity === 0);
  const showBoard = canInteract && isOpen &&
    ((gameState.day >= 3 && gameState.unlocks.pricing) || (gameState.day >= 4 && gameState.unlocks.advertising));
  const highlightBoard = showBoard && getDayCoachHint(gameState)?.target === "offer";
  const stockEntry = (canInteract && (isOpen || isDayEnd)) || canReadLetter ? (
    <button
      type="button"
      className={`cafe-cue cafe-cue--stock${isOpen && emptyStock ? " cafe-cue--empty" : ""}`}
      data-cafe-entry
      onClick={(event) => openStation("stock", event.currentTarget)}
    >
      {letterDelivered ? "Shift report" : isDayEnd ? "Day result & restock" : emptyStock ? "Supplies · empty" : "Supplies"}
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
            {isFinalShift && (
              <span className="cafe-final-checklist">
                <span>{Math.min(customersServed, DAY_SEVEN_SERVE_GOAL)}/{DAY_SEVEN_SERVE_GOAL} served</span>
                <span>{hasShiftCleaning(gameState) ? "✓ Cleaning done" : "Clean up"}</span>
                {finalRush && <span className="cafe-final-checklist__rush">Rush</span>}
              </span>
            )}
            {Boolean(gameState.dayManagement.heartsRestored) && (
              <span className="cafe-recovered"
                role="img" aria-label={`${gameState.dayManagement.heartsRestored} hearts restored`}>
                <span aria-hidden="true">♥ {gameState.dayManagement.heartsRestored}</span>
              </span>
            )}
            <span className="cafe-action-pips" role="img" aria-label={`${actionPointsRemaining} actions left`}>
              {Array.from({ length: Math.min(12, getShiftActionBudget(gameState)) }, (_, index) => (
                <span key={index} aria-hidden="true" data-filled={index < actionPointsRemaining} />
              ))}
            </span>
          </span>
        ) : null}
      </div>

      {onAction && (
        <p className="status-message" role="status" aria-live="polite" aria-atomic="true">
          <span key={gameState.statusMessage} className="status-message__text">{gameState.statusMessage}</span>
        </p>
      )}

      <div className="cafe-scene-frame" data-station={activeStation ?? undefined} ref={sceneRef}>
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
            "cafe-diorama--approved-day-one cafe-diorama--compact-week",
          ].join(" ")}
        >
          <RecoveryFeedback day={gameState.day} total={gameState.dayManagement.heartsRestored ?? 0} />
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
          <div role="status" className="cafe-first-cup-announcement">
            {playFirstCup ? "The crema blinks." : ""}
          </div>
          <div className="cafe-world" inert={Boolean(activeStation) || introActive}>
            <img
              className="cafe-stage-base"
              src={approvedDay1StageAsset}
              alt={`Isometric café room on Day ${gameState.day}, with a counter, door and windows.`}
            />
            {(
              <div className="cafe-approved-wall-shelf">
                <img src={approvedWallShelfAsset} alt="" />
                {stockEntry}
              </div>
            )}
            {showNino && (
              <div className="cafe-shift-helper cafe-shift-helper--legacy" data-helper="nino">
                <StaffPortrait helperId="nino" alt="Nino" />
              </div>
            )}
            <CafeShiftHelper gameState={gameState} />
            {playFirstCup && (
              <div className="cafe-first-cup" style={{ left: "42%", bottom: "58%", width: "3.25%", zIndex: 24 }} aria-hidden="true">
                <div className="cafe-first-cup__steam"><span /><span /><span /></div>
                <img src={approvedCupAsset} alt="" />
                <div className="cafe-first-cup__coffee"><span /></div>
              </div>
            )}
            {isDusty && <div className="cafe-dust" aria-hidden="true" />}
            {gameState.equipment.clock >= 1 && (
              <img className="cafe-approved-wall-clock" src={approvedWallClockAsset} alt="" aria-hidden="true" />
            )}
            {(
              <div className="cafe-approved-floor-plant" aria-hidden="true">
                <img src={approvedFloorPlantAsset} alt="" />
                {gameState.day === 1 && <DayOneVines actionPointsSpent={gameState.dayManagement.actionPointsSpent} actionPointsRemaining={actionPointsRemaining} />}
              </div>
            )}

            {/* Décor props — positioned absolute via CSS, tier drives sprite */}
            <div className={`cafe-decor-clock cafe-decor--tier-${gameState.decor?.clock ?? 1}`} aria-hidden="true" />
            <div className={`cafe-decor-lamp cafe-decor--tier-${gameState.decor?.lamp ?? 1}`} aria-hidden="true" />
            <div className={`cafe-plant cafe-decor-plant cafe-decor--tier-${gameState.decor?.plant ?? 1}`} aria-hidden="true" />
            <div className={`cafe-decor-plant2 cafe-decor--tier-${gameState.decor?.plant2 ?? 1}`} aria-hidden="true" />
            <div className={`cafe-furniture-shelf cafe-decor--tier-${gameState.decor?.shelf ?? 1}`} />

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
                  {finalRush && <span className="cafe-threshold-display" aria-hidden="true">THRESHOLD</span>}
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
                  {registerIsInteractive ? (
                    <button type="button" className="cafe-coffee-machine__control cafe-register__control"
                      data-cafe-entry aria-label="Open KASSANDRA at the register"
                      onClick={(event) => openStation("register", event.currentTarget)}>
                      {registerSprite}
                      <span className="cafe-coffee-machine__label" aria-hidden="true">
                        {gameState.dayManagement.kassandraConsulted ? "Forecast printed"
                          : earlyForecastAvailable ? "Forecast · 0 actions" : "KASSANDRA"}
                      </span>
                    </button>
                  ) : registerSprite}
                  <span
                    className={`cafe-register__screen${kassandraAwake ? " cafe-register__screen--active" : ""}`}
                  />
                  {finalRush && <span className="cafe-threshold-display" aria-hidden="true">THRESHOLD</span>}
                  {(gameState.day >= 7 || gameState.dayManagement.kassandraConsulted) && (
                    <span className="cafe-register__receipt cafe-register__receipt--long" aria-hidden="true" />
                  )}
                </div>

                {canReadLetter && (
                  <button type="button" className="cafe-letter" data-cafe-entry ref={letterRef}
                    data-opened={Boolean(gameState.daySevenLetterOpened)}
                    aria-label={gameState.daySevenLetterOpened ? "Read the letter again" : "Open the sealed letter"}
                    onClick={(event) => {
                      onAction?.({ type: "open_day_seven_letter" });
                      openStation("letter", event.currentTarget);
                    }}>
                    <span className="cafe-letter__paper" aria-hidden="true" />
                  </button>
                )}

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

              {/* Approved chair groups retain their geometry across all seven days. */}
              {gameState.equipment.seating >= 1 && (["left", "right", "back"] as const).map(pos => {
                const dirty = dirtyTableIds.has(pos);
                const janaCanClear = canJanaClearTable(gameState);
                const cleanLabel = janaCanClear ? "ask Jana to clear it (0 actions)" : "wipe it down (1 action)";
                const recoverySeat = recovery?.current === 1 && recovery.tableId === pos;
                const recoveryWipe = canImproveRecoveryByCleaning(gameState, pos);
                const clickable = dirty && isOpen && !shiftOver && !introActive &&
                  (actionPointsRemaining > 0 || janaCanClear) && Boolean(onCleanTable || onAction);
                const className = `cafe-table cafe-table--${pos} cafe-table--tier-${gameState.equipment.seating}`;
                const inner = <>
                  <span className="cafe-table__top" />
                  <span className="cafe-table-plant" aria-hidden="true" />
                  {dirty && <span className="cafe-cup cafe-cup--dirty" />}
                  {recoverySeat && recovery.restored === 2 &&
                    <span className="cafe-table-recovery-ready" data-recovery-table={pos} aria-hidden="true">♥</span>}
                  {clickable && <span className="cafe-cue cafe-cue--wipe" aria-hidden="true">
                    <span className="cafe-wipe-icon" />
                    {recoveryWipe && <span className="cafe-recovery-seat">♥</span>}
                    <span className="cafe-wipe-label">{janaCanClear ? "Ask Jana" : "Wipe"}</span>
                  </span>}
                </>;
                return <div key={pos} className={`cafe-table-set cafe-table-set--${pos}`} data-table-id={pos}>
                  <span className={`cafe-chair cafe-chair--side cafe-table--tier-${gameState.equipment.seating}`} aria-hidden="true" />
                  {clickable ? <button type="button" className={`${className} cafe-table--clickable`}
                    aria-label={`Dirty ${pos} table — ${cleanLabel}${recoveryWipe ? " · Enables one extra recovery heart" : ""}`}
                    title={cleanLabel} onClick={() => cleanTable(pos)}>{inner}</button> : <div className={className} aria-hidden="true">{inner}</div>}
                  {seatedGuests.filter(id => approvedSeats[id].table === pos).map(id => <CafeTableGuest key={id} guestId={id} />)}
                  <span className={`cafe-chair cafe-chair--front cafe-table--tier-${gameState.equipment.seating}`} aria-hidden="true" />
                </div>;
              })}

              <div className={`cafe-queue${paulaPhase === "at-door" || paulaPhase === "walking" ? " cafe-queue--entering" : ""}`}>
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
                paulaPhase === "walking-to-door" || paulaPhase === "leaving-queue") ? (
                  <span
                    data-guest-id={queueGuest}
                    className={[
                      "placeholder-guest",
                      "placeholder-guest-normal-01",
                      paulaPhase === "at-door" ? "placeholder-guest--at-door" : "",
                      paulaPhase === "walking" ? "placeholder-guest--arriving" : "",
                      paulaPhase === "leaving-queue" ? "placeholder-guest--leaving-queue" : "",
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
                      if ((e.animationName === "cafe-guest-leave" && paulaPhase === "walking-to-door") ||
                        (e.animationName === "cafe-guest-walkout" && paulaPhase === "leaving-queue")) {
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
                        className="cafe-order-bubble cafe-order-bubble--on-guest"
                        data-cafe-entry
                        title={nextGuest.wants || "Take order"}
                        aria-label={`Take order from ${nextGuest.name}`}
                        aria-description={[
                          nextGuest.orderLine.replace(/[.]$/, ""),
                          gameState.day >= 4 && patience
                            ? `Patience ${patience.patience / PATIENCE_TICK} of ${patience.max / PATIENCE_TICK}`
                            : null,
                          recovery ? `Resting. ${recovery.current} of 3 hearts. A served order restores ${recovery.restored}.` : null,
                          recovery?.restored === 2 ? `Clean ${recovery.tableId} table adds a recovery heart` : null,
                          patience?.critical ? "About to leave" : null
                        ].filter(Boolean).join(". ") || undefined}
                        onClick={(event) => openStation("service", event.currentTarget)}
                      >
                        <span className="cafe-order-bubble__card" aria-hidden="true">
                          <span className="serve-menu__icon" data-product={wantedProduct?.id ?? "filterkaffee"} />
                          {recovery && (
                            <span className="cafe-order-bubble__hearts" aria-hidden="true">
                              <RecoveryHearts {...recovery} />
                            </span>
                          )}
                          {gameState.day >= 4 && patience && (
                            <span className="cafe-order-bubble__patience" aria-hidden="true">
                              {Array.from({ length: patience.max / PATIENCE_TICK }, (_, index) => (
                                <span key={index} data-filled={index * PATIENCE_TICK < patience.patience} />
                              ))}
                            </span>
                          )}
                          {patience?.critical ? <span className="cafe-order-bubble__warning">!</span> : null}
                        </span>
                      </button>
                    ) : null}
                  </span>
                ) : null}
                {followingGuest && followingGuest.id !== frontOfQueue ? (
                  <span key={followingGuest.id} className="cafe-rush-queue-guest" aria-hidden="true">
                    <span className={`cafe-pilot-asset cafe-pilot-asset--standing cafe-pilot-asset--${QUEUE_SPRITES[followingGuest.id]}-standing`} />
                  </span>
                ) : null}
              </div>

              {visibleGuests.bohn && !queueIncludes("herr-bohn") && (
                <span className="cafe-standing-bohn" aria-hidden="true">
                  <img className="cafe-pilot-asset cafe-pilot-asset--guest" src={bohnStanding} ref={bohnRef} alt="" />
                </span>
              )}

              {showWeirdness && (
                <div className="cafe-weirdness-hint" aria-hidden="true">
                  <span className="cafe-clock" />
                  <span className="cafe-shadow-note" />
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
