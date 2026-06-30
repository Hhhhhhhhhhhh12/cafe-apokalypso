import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { gameReducer } from "../game/engine/reducer";
import { createFreshRunState } from "../game/engine/gameState";
import {
  getBrowserStorage,
  loadGameState,
  resetSavedGameState,
  saveGameState,
  type StorageLike
} from "../game/engine/save";
import { weekOneAchievements } from "../game/data/achievements";
import type { AchievementDefinition } from "../game/types/content";
import { AchievementToast } from "../ui/components/AchievementToast";
import { ActionPanel } from "../ui/components/ActionPanel";
import { CafePlaceholder } from "../ui/cafe/CafePlaceholder";
import { IntroSequence } from "../ui/components/IntroSequence";
import { OptionsMenu } from "../ui/components/OptionsMenu";
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
  const storage = useMemo(() => getBrowserStorage(), []);
  const [gameState, dispatch] = useReducer(
    gameReducer,
    storage,
    (availableStorage) =>
      availableStorage ? loadGameState(availableStorage) : createFreshRunState()
  );

  useEffect(() => {
    if (storage) {
      saveGameState(gameState, storage);
    }
  }, [gameState, storage]);

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
  // ack flag is cleared on reset so a new café week re-shows it (roguelite tone).
  const isFreshDayOne =
    gameState.day === 1 &&
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
    if (storage) {
      resetSavedGameState(storage);
      try {
        storage.removeItem(BOOT_ACK_KEY);
      } catch {
        // ignore
      }
    }
    setBootAcknowledged(false);
    setAchievementQueue([]);
    seenAchievementsRef.current = [];
    dispatch({ type: "reset_game" });
  }

  const dayDataAttr = gameState.day >= 6 ? String(gameState.day) : undefined;

  return (
    <main className="app-shell" data-day={dayDataAttr}>
      {showBoot ? (
        <IntroSequence
          onComplete={dismissBoot}
        />
      ) : null}
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
          <OptionsMenu />
          <div className="day-card" aria-label={`Current status: Day ${gameState.day}`}>
            <span className="day-card__label">Current day</span>
            <strong>Day {gameState.day}</strong>
            <span>{gameState.phaseLabel}</span>
          </div>
        </div>
      </header>

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
          <p className="eyebrow">End of week one</p>
          <h2 id="demo-complete-title" ref={closureHeadingRef} tabIndex={-1}>
            The first café week is over
          </h2>
          <p>
            Seven days served. The official letter has arrived, the register has
            opinions it did not have on Monday, and the guestbook is still
            quietly editing the line about previous runs. Something is wrong with
            this café — and you want to know what happens on Day 8.
          </p>
          <p className="demo-complete-banner__teaser">
            Week two is where the weirdness stops being deniable. That café week
            is not built yet. For now, the loop begins again.
          </p>
          <button type="button" onClick={handleReset}>
            Start the next café week
          </button>
        </section>
      ) : null}

      <section className="workspace-grid" aria-label="Game shell workspace">
        <ResourceHud gameState={gameState} />
        <CafePlaceholder
          gameState={gameState}
        />
        <ActionPanel
          gameState={gameState}
          statusMessage={gameState.statusMessage}
          onServeProduct={(productId) => dispatch({ type: "serve_product", productId })}
          onTakeOrder={() => dispatch({ type: "take_order" })}
          onPrepareDrink={() => dispatch({ type: "prepare_drink" })}
          onCheckSupplies={() => dispatch({ type: "check_supplies" })}
          onCleanTables={() => dispatch({ type: "clean_tables" })}
          onAdjustOffer={() => dispatch({ type: "adjust_offer" })}
          onRunAdvertising={() => dispatch({ type: "run_advertising", adType: "flyer" })}
          onRunSocialAd={() => dispatch({ type: "run_advertising", adType: "social" })}
          onConsultKassandra={() => dispatch({ type: "consult_kassandra" })}
          onSelectHelper={(helperId, taskId) =>
            dispatch({ type: "select_helper", helperId, taskId })
          }
          onOpenDay={() => dispatch({ type: "open_day" })}
          onCompleteDay={() => dispatch({ type: "complete_day" })}
          onSetSupplyPurchase={(ingredient, quantity) =>
            dispatch({ type: "set_supply_purchase", ingredient, quantity })
          }
          onConfirmSupplyPurchase={() => dispatch({ type: "confirm_supply_purchase" })}
          onUpgradeDecor={(slot) => dispatch({ type: "upgrade_decor", slot })}
          onBuyEquipment={(slot) => dispatch({ type: "buy_equipment", slot })}
          onBuyUpgrade={(upgradeId) => dispatch({ type: "buy_upgrade", upgradeId })}
          onFinishSetup={() => dispatch({ type: "finish_setup" })}
          onResetGame={handleReset}
        />
        <DayProgressPanel gameState={gameState} />
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

/**
 * A brief, non-blocking "moment" when the shift opens or the day closes, so the
 * transition reads as an event rather than a silent panel swap (#PHASE3). Purely
 * presentational: it watches the phase prop and auto-dismisses. No banner fires
 * on first mount (the previous phase starts equal to the current one).
 */
function DayTransitionBanner({
  day,
  dayPhase
}: {
  day: number;
  dayPhase: "setup" | "day_start" | "open" | "day_end";
}) {
  const previousPhase = useRef(dayPhase);
  const tickRef = useRef(0);
  const [banner, setBanner] = useState<{
    key: number;
    eyebrow: string;
    title: string;
  } | null>(null);

  useEffect(() => {
    if (previousPhase.current === dayPhase) {
      return;
    }
    previousPhase.current = dayPhase;

    const next =
      dayPhase === "open"
        ? { eyebrow: `Day ${day}`, title: "The café is open" }
        : dayPhase === "day_end"
          ? { eyebrow: `Day ${day}`, title: "Day closed" }
          : null;

    if (next) {
      tickRef.current += 1;
      setBanner({ key: tickRef.current, ...next });
    }
  }, [dayPhase, day]);

  useEffect(() => {
    if (!banner) {
      return;
    }
    const timer = setTimeout(() => setBanner(null), 2200);
    return () => clearTimeout(timer);
  }, [banner]);

  if (!banner) {
    return null;
  }

  return (
    <div
      key={banner.key}
      className="day-transition-banner"
      role="status"
      aria-live="polite"
    >
      <span className="day-transition-banner__eyebrow">{banner.eyebrow}</span>
      <strong className="day-transition-banner__title">{banner.title}</strong>
    </div>
  );
}
