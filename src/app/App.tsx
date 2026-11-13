import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { gameReducer } from "../game/engine/reducer";
import { createFreshRunState } from "../game/engine/gameState";
import {
  clearLegacySaves,
  getBrowserStorage,
  preserveRejectedPreviousSave,
  readGameSave,
  saveGameState,
  type StorageLike
} from "../game/engine/save";
import type { GameState } from "../game/types/game";
import { weekOneAchievements } from "../game/data/achievements";
import type { AchievementDefinition } from "../game/types/content";
import { AchievementToast } from "../ui/components/AchievementToast";
import { ActionPanel } from "../ui/components/ActionPanel";
import { CafePlaceholder } from "../ui/cafe/CafePlaceholder";
import { IntroSequence } from "../ui/components/IntroSequence";
import { OptionsMenu } from "../ui/components/OptionsMenu";
import { StorageStatusMessage } from "../ui/components/StorageStatusMessage";
import {
  resolveStorageStatusAfterSave,
  type StorageStatusKind
} from "../ui/components/storageStatus";
import { DayProgressPanel } from "../ui/panels/DayProgressPanel";
import { ResourceHud } from "../ui/panels/ResourceHud";

/** localStorage flag (separate from the game save) marking the boot splash acknowledged. */
const BOOT_ACK_KEY = "cafe-apokalypso.booted.v1";

function readBootAck(storage: StorageLike | null): boolean {
  if (!storage) {
    return false;
  }
  try {
    return storage.getItem(BOOT_ACK_KEY) === "1";
  } catch {
    return false;
  }
}

export function App() {
  const isArcanaPreview = typeof window !== "undefined" &&
    new URLSearchParams(window.location?.search).get("intro") === "arcana";
  const storage = useMemo(() => isArcanaPreview ? null : getBrowserStorage(), [isArcanaPreview]);
  const [optionsPanel, setOptionsPanel] = useState<HTMLDivElement | null>(null);
  const [initialSave] = useState(() => storage ? readGameSave(storage) : null);
  const [storageStatus, setStorageStatus] = useState<StorageStatusKind | null>(() => {
    if (!initialSave) return "unavailable";
    if (initialSave.status !== "load-failed") return null;
    return initialSave.previousSaveReadFailed ? "previous-save-unprotected" : "load-failed";
  });
  const [gameState, dispatch] = useReducer(gameReducer, initialSave, (save) =>
    save?.status === "loaded" ? save.state : createFreshRunState()
  );
  // A confirmed reset saves this exact state before dispatching it.
  const savedResetStateRef = useRef<GameState | null>(null);

  const canAutoSave = storageStatus !== "load-failed" &&
    storageStatus !== "previous-save-unprotected" && storageStatus !== "protected-reset-failed";

  useEffect(() => {
    if (!storage || initialSave?.status !== "load-failed" ||
        initialSave.rejectedPreviousSave === undefined ||
        preserveRejectedPreviousSave(storage, initialSave.rejectedPreviousSave)) {
      return;
    }

    let active = true;
    queueMicrotask(() => {
      if (active) setStorageStatus("previous-save-unprotected");
    });
    return () => { active = false; };
  }, [initialSave, storage]);

  useEffect(() => {
    if (storage && canAutoSave && gameState !== savedResetStateRef.current) {
      savedResetStateRef.current = null;
      const result = saveGameState(gameState, storage);
      setStorageStatus((currentStatus) => resolveStorageStatusAfterSave(currentStatus, result.ok));
    }
  }, [gameState, storage, canAutoSave]);

  // Achievement toast queue — detect newly unlocked achievements each render
  const seenAchievementsRef = useRef<readonly string[]>(gameState.unlockedAchievements);
  const [achievementQueue, setAchievementQueue] = useState<AchievementDefinition[]>([]);
  useEffect(() => {
    const seen = seenAchievementsRef.current;
    const newIds = gameState.unlockedAchievements.filter(id => !seen.includes(id));
    if (newIds.length > 0) {
      const newDefs = weekOneAchievements.filter(a => newIds.includes(a.id));
      setAchievementQueue(q => [...q, ...newDefs]);
      seenAchievementsRef.current = gameState.unlockedAchievements;
    }
  }, [gameState.unlockedAchievements]);

  // Move focus to the closure banner when the café closes, so keyboard and
  // screen-reader users are not stranded on a now-disabled control.
  const closureHeadingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (gameState.cafeClosed || gameState.demoComplete) {
      closureHeadingRef.current?.focus();
    }
  }, [gameState.cafeClosed, gameState.demoComplete]);

  // Boot splash: show before Day 1 of a fresh run, once per browser run. The
  // ack flag is cleared on reset so a replay re-shows it (roguelite tone).
  const isFreshDayOne =
    gameState.day === 1 &&
    gameState.dayPhase === "setup" &&
    !gameState.demoComplete &&
    !gameState.cafeClosed &&
    gameState.dayManagement.customersServed === 0;
  const [bootAcknowledged, setBootAcknowledged] = useState(() => readBootAck(storage));
  const showBoot = isFreshDayOne && !bootAcknowledged;

  function dismissBoot() {
    if (storage) {
      try {
        storage.setItem(BOOT_ACK_KEY, "1");
      } catch {
        // ignore — boot just re-shows on reload if storage is unavailable
      }
    }
    setBootAcknowledged(true);
  }

  function handleReset() {
    const prompt = storage
      ? "Start over from Day 1? This replaces the browser save used by this version."
      : "Start over from Day 1? Browser storage is unavailable. The new week will only last until you reload or close the game.";
    if (!window.confirm(prompt)) {
      return;
    }

    const freshState = createFreshRunState();
    if (storage) {
      if (!saveGameState(freshState, storage).ok) {
        setStorageStatus(canAutoSave ? "reset-failed" : "protected-reset-failed");
        return;
      }
      savedResetStateRef.current = freshState;

      let cleanupFailed = !clearLegacySaves(storage).ok;
      try {
        storage.removeItem(BOOT_ACK_KEY);
      } catch {
        cleanupFailed = true;
      }
      setStorageStatus(cleanupFailed ? "cleanup-failed" : null);
    }

    setBootAcknowledged(false);
    setAchievementQueue([]);
    seenAchievementsRef.current = [];
    dispatch({ type: "reset_game", freshState });
  }

  const dayDataAttr = gameState.day >= 6 ? String(gameState.day) : undefined;

  if (showBoot && (storageStatus === null || storageStatus === "unavailable")) {
    return (
      <main className="app-shell">
        <IntroSequence
          onComplete={dismissBoot}
          notice={!isArcanaPreview && storageStatus
            ? <StorageStatusMessage status={storageStatus} />
            : undefined}
        >
          <CafePlaceholder gameState={gameState} introActive />
        </IntroSequence>
      </main>
    );
  }

  return (
    <main className="app-shell" data-day={dayDataAttr}>
      <AchievementToast
        queue={achievementQueue}
        onDequeue={() => setAchievementQueue(q => q.slice(1))}
      />
      <DayTransitionBanner day={gameState.day} dayPhase={gameState.dayPhase} />

      <header className="hero-bar" aria-labelledby="app-title">
        <div>
          <h1 id="app-title">Café Apokalypso</h1>
          <p className="intro">
            A cozy café. Seven days. Something is not quite right.
          </p>
        </div>
        <div className="hero-bar__aside">
          <OptionsMenu panelRef={setOptionsPanel} />
          <div className="day-card" aria-label={`Current status: Day ${gameState.day}`}>
            <span className="day-card__label">Current day</span>
            <strong>Day {gameState.day}</strong>
            <span>{gameState.phaseLabel}</span>
          </div>
        </div>
      </header>

      <StorageStatusMessage status={storageStatus} />

      {gameState.cafeClosed ? (
        <section className="cafe-closed-banner" role="alert" aria-labelledby="cafe-closed-title">
          <p className="eyebrow">Café closed</p>
          <h2 id="cafe-closed-title" ref={closureHeadingRef} tabIndex={-1}>
            {gameState.closureReason === "money"
              ? "Out of money"
              : "Out of standing"}
          </h2>
          <p>
            {gameState.closureReason === "money"
              ? "The till ran dry and the café could no longer cover its day. This run is over."
              : "Reputation stayed at rock bottom for two days running, and the regulars stopped coming. This run is over."}
          </p>
          <button type="button" onClick={handleReset}>
            Start a new café
          </button>
        </section>
      ) : null}

      {gameState.demoComplete ? (
        <section
          className="demo-complete-banner"
          role="alert"
          aria-labelledby="demo-complete-title"
        >
          <p className="eyebrow">Week one complete</p>
          <h2 id="demo-complete-title" ref={closureHeadingRef} tabIndex={-1}>
            7 of 7 days served
          </h2>
          <p>
            The letter is open. The register is talking. The guestbook remembers.
          </p>
          <p className="demo-complete-banner__teaser">
            Next unlock: Day 8, week two. Not built yet. Replay from Day 1.
          </p>
          <button type="button" onClick={handleReset}>
            Replay week one
          </button>
        </section>
      ) : null}

      <section className="workspace-grid workspace-grid--cafe" aria-label="Game shell workspace">
        <CafePlaceholder
          gameState={gameState}
          onAction={dispatch}
          bohnStorage={storage}
          bohnOccluder={optionsPanel}
        />
        <ResourceHud gameState={gameState} />
        <DayProgressPanel gameState={gameState} />
        <ActionPanel
          gameState={gameState}
          statusMessage={gameState.statusMessage}
          onUpgradeDecor={(slot) => dispatch({ type: "upgrade_decor", slot })}
          onBuyEquipment={(slot) => dispatch({ type: "buy_equipment", slot })}
          onBuyUpgrade={(upgradeId) => dispatch({ type: "buy_upgrade", upgradeId })}
          onResetGame={handleReset}
        />
      </section>

      <footer className="app-footer">
        <p>
          Display &amp; accessibility options — including a colour-blind-friendly
          palette — are on the way. The café would like everyone to be able to read
          the menu.
        </p>
      </footer>
    </main>
  );
}

/** Announce the new day on a day change or on the first opening. */
function DayTransitionBanner({
  day,
  dayPhase
}: {
  day: number;
  dayPhase: "setup" | "day_start" | "open" | "day_end";
}) {
  const [previous, setPrevious] = useState({ day, dayPhase });
  const [banner, setBanner] = useState<number | null>(null);

  if (previous.day !== day || previous.dayPhase !== dayPhase) {
    setPrevious({ day, dayPhase });
    if (previous.day !== day || (previous.dayPhase === "setup" && dayPhase === "open")) {
      setBanner(day);
    } else if (dayPhase === "day_end" || dayPhase === "setup") {
      setBanner(null);
    }
  }

  useEffect(() => {
    if (!banner) {
      return;
    }
    const timer = setTimeout(() => setBanner(null), 1400);
    return () => clearTimeout(timer);
  }, [banner]);

  if (!banner) {
    return null;
  }

  return (
    <div
      key={banner}
      className="day-transition-banner"
      role="status"
      aria-live="polite"
    >
      <strong className="day-transition-banner__title">Day {banner}</strong>
    </div>
  );
}
