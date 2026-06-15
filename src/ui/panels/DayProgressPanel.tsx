import { useEffect, useRef } from "react";
import {
  getCurrentDayDefinition,
  getDayEndRecapLine,
  getNarrativeEventCards,
  getVisibleDaySevenLetter,
  getVisibleKassandraMessages,
  getVisibleStaffOptions,
  getObjectiveStatus
} from "../../game/engine/selectors";
import { getEmployeeLevel, XP_LEVEL_THRESHOLDS } from "../../game/engine/management";
import type { GameState } from "../../game/types/game";

interface DayProgressPanelProps {
  gameState: GameState;
}

export function DayProgressPanel({ gameState }: DayProgressPanelProps) {
  const currentDay = getCurrentDayDefinition(gameState);
  const eventCards = getNarrativeEventCards(gameState);
  const staffOptions = getVisibleStaffOptions(gameState);
  const kassandraMessages = getVisibleKassandraMessages(gameState);
  const daySevenLetter = getVisibleDaySevenLetter(gameState);
  const objectiveStatus = getObjectiveStatus(gameState);

  // Close-day moment: when a fresh summary lands, bring the result card into
  // view so the day's outcome is read where the eye is, not missed in the panel.
  const summary = gameState.daySummary;
  const summaryRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (summary && gameState.dayPhase === "day_end") {
      summaryRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [summary, gameState.dayPhase]);

  const net = summary
    ? Math.round((summary.moneyEarned - summary.moneySpent - summary.dailyOverhead) * 100) / 100
    : 0;

  return (
    <section className="panel day-progress-panel" aria-labelledby="day-progress-title">
      {daySevenLetter ? (
        <section
          className="letter-panel letter-panel--prominent"
          aria-labelledby="day-seven-letter-title"
        >
          <p className="eyebrow">Official notice</p>
          <h3 id="day-seven-letter-title">A letter has arrived</h3>
          <pre>{daySevenLetter}</pre>
        </section>
      ) : null}

      <div className="panel-heading">
        <p className="eyebrow">Today</p>
        <h2 id="day-progress-title">
          Day {currentDay.day}: {currentDay.title}
        </h2>
      </div>

      <p className="day-opener">{currentDay.dayOpener}</p>

      <section className="objective-card" aria-labelledby="daily-objective-title">
        <div>
          <p className="eyebrow">Daily objective</p>
          <h3 id="daily-objective-title">{objectiveStatus.objective.title}</h3>
        </div>
        <p>{objectiveStatus.objective.description}</p>
        <p className="action-hint">{objectiveStatus.objective.completionHint}</p>
        <strong className={`objective-state objective-state--${objectiveStatus.status}`}>
          {formatObjectiveStatus(objectiveStatus.status)}
        </strong>
      </section>

      <p className="day-milestone">{currentDay.milestone}</p>

      {currentDay.unlockMessage ? (
        <p className="unlock-message">{currentDay.unlockMessage}</p>
      ) : null}

      {eventCards.length > 0 ? (
        <div className="event-card-list" aria-label="Today in the café">
          {eventCards.map((event) => (
            <section
              className="inline-callout event-card"
              key={event.id}
              aria-label={event.title}
            >
              <h3>{event.title}</h3>
              <p>{event.text}</p>
            </section>
          ))}
        </div>
      ) : null}

      {staffOptions.length > 0 ? (
        <section className="inline-callout" aria-labelledby="staff-options-title">
          <h3 id="staff-options-title">Temporary help</h3>
          <p>
            {gameState.helperAssignment
              ? `${gameState.helperAssignment.flavorLine}`
              : `Choose one day helper or keep the money. Available: ${staffOptions
                  .map((staffOption) => staffOption.name)
                  .join(", ")}.`}
          </p>
          <ul className="staff-xp-list">
            {staffOptions.map((staffOption) => {
              const xp = gameState.staffXp[staffOption.id] ?? 0;
              const level = getEmployeeLevel(xp);
              const nextThreshold = XP_LEVEL_THRESHOLDS[Math.min(3, level + 1) as 1 | 2 | 3];
              const xpToNext = level < 3 ? nextThreshold - xp : null;
              return (
                <li key={staffOption.id} className="staff-xp-entry">
                  <strong>{staffOption.name}</strong>{" "}
                  <span className="staff-xp-level">Lv.{level}</span>
                  {" · "}
                  <span className="staff-xp-count">{xp} XP</span>
                  {xpToNext !== null ? (
                    <span className="staff-xp-next"> ({xpToNext} to Lv.{level + 1})</span>
                  ) : (
                    <span className="staff-xp-max"> (max.)</span>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {gameState.daySummary ? (
        <section
          ref={summaryRef}
          className="inline-callout day-result-card"
          aria-labelledby="day-summary-title"
        >
          <h3 id="day-summary-title">Day {gameState.daySummary.day} closed</h3>
          <div className="day-result-headline">
            <div className="day-result-headline__item">
              <span className="eyebrow">Rating</span>
              <strong>{gameState.daySummary.rating}</strong>
            </div>
            <div
              className={`day-result-headline__item day-result-headline__net day-result-headline__net--${
                net >= 0 ? "pos" : "neg"
              }`}
            >
              <span className="eyebrow">Net result</span>
              <strong>{net >= 0 ? `+€${net}` : `-€${Math.abs(net)}`}</strong>
            </div>
            <div className="day-result-headline__item">
              <span className="eyebrow">Served</span>
              <strong>{gameState.daySummary.customersServed}</strong>
            </div>
          </div>
          <p className="day-recap-line">{getDayEndRecapLine(gameState)}</p>
          <dl className="summary-list">
            {[
              { label: "Objective", value: `${gameState.daySummary.objectiveCompleted ? "Completed" : "Missed"} · ${gameState.daySummary.objectiveTitle}` },
              { label: "Money earned", value: `€${gameState.daySummary.moneyEarned}` },
              { label: "Money spent", value: `€${gameState.daySummary.moneySpent}` },
              { label: "Daily overhead", value: `-€${gameState.daySummary.dailyOverhead}` },
              { label: "Net profit / loss", value: (() => { const net = Math.round((gameState.daySummary!.moneyEarned - gameState.daySummary!.moneySpent - gameState.daySummary!.dailyOverhead) * 100) / 100; return net >= 0 ? `+€${net}` : `-€${Math.abs(net)}`; })() },
              { label: "Customers served", value: String(gameState.daySummary.customersServed) },
              { label: "Supplies used", value: `Coffee ${gameState.daySummary.suppliesUsed.coffee}, Milk ${gameState.daySummary.suppliesUsed.milk}, Pastries ${gameState.daySummary.suppliesUsed.pastries}` },
              ...(gameState.pendingSupplyPurchase ? [{ label: "Restock planned", value: `Coffee ${gameState.pendingSupplyPurchase.coffee}, Milk ${gameState.pendingSupplyPurchase.milk}, Pastries ${gameState.pendingSupplyPurchase.pastries}` }] : []),
              { label: "Supplies left", value: `Coffee ${gameState.daySummary.suppliesRemaining.coffee}, Milk ${gameState.daySummary.suppliesRemaining.milk}, Pastries ${gameState.daySummary.suppliesRemaining.pastries}` },
              { label: "Cleanliness", value: gameState.daySummary.cleanlinessLabel },
              { label: "Stress", value: gameState.daySummary.stressLabel },
              { label: "Reputation change", value: String(gameState.daySummary.reputationDelta) },
              { label: "Helper", value: gameState.daySummary.helperRecap ?? "None" },
            ].map(({ label, value }, i) => (
              <div key={label} style={{ "--i": i } as React.CSSProperties}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          {gameState.daySummary.flavorLines.length > 0 ? (
            <ul>
              {gameState.daySummary.flavorLines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}

      {kassandraMessages.length > 0 ? (
        <section
          className="inline-callout placeholder-kassandra-ui"
          aria-labelledby="kassandra-title"
        >
          <h3 id="kassandra-title">Day 6 unlock: KASSANDRA update</h3>
          <p>New register panel online. It is authored, simulated, and slightly too confident.</p>
          <ul>
            {kassandraMessages.map((message) => (
              <li key={message.id}>{message.text}</li>
            ))}
          </ul>
        </section>
      ) : null}
    </section>
  );
}

function formatObjectiveStatus(status: string): string {
  if (status === "completed") {
    return "Completed";
  }
  if (status === "missed") {
    return "Missed";
  }
  return "In progress";
}
