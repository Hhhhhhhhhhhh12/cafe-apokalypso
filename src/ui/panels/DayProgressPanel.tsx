import {
  getCurrentDayDefinition,
  getNarrativeEventCards,
  getVisibleDaySevenLetter,
  getVisibleKassandraMessages,
  getVisibleStaffOptions,
  getObjectiveStatus
} from "../../game/engine/selectors";
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
        <p className="eyebrow">Tagesablauf</p>
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
        <div className="event-card-list" aria-label="Heute im Café">
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
          <h3 id="staff-options-title">Day 5 unlock: temporary help</h3>
          <p>
            {gameState.helperAssignment
              ? `${gameState.helperAssignment.flavorLine}`
              : `Choose one day helper or keep the money. Available: ${staffOptions
                  .map((staffOption) => staffOption.name)
                  .join(", ")}.`}
          </p>
        </section>
      ) : null}

      {gameState.daySummary ? (
        <section className="inline-callout" aria-labelledby="day-summary-title">
          <h3 id="day-summary-title">Day-end management summary</h3>
          <p className="rating-line">
            Rating: <strong>{gameState.daySummary.rating}</strong>
          </p>
          <dl className="summary-list">
            <div>
              <dt>Objective</dt>
              <dd>
                {gameState.daySummary.objectiveCompleted ? "Completed" : "Missed"} ·{" "}
                {gameState.daySummary.objectiveTitle}
              </dd>
            </div>
            <div>
              <dt>Money earned</dt>
              <dd>€{gameState.daySummary.moneyEarned}</dd>
            </div>
            <div>
              <dt>Money spent</dt>
              <dd>€{gameState.daySummary.moneySpent}</dd>
            </div>
            <div>
              <dt>Customers served</dt>
              <dd>{gameState.daySummary.customersServed}</dd>
            </div>
            <div>
              <dt>Supplies used</dt>
              <dd>
                Coffee {gameState.daySummary.suppliesUsed.coffee}, Milk{" "}
                {gameState.daySummary.suppliesUsed.milk}, Pastries{" "}
                {gameState.daySummary.suppliesUsed.pastries}
              </dd>
            </div>
            <div>
              <dt>Restock planned</dt>
              <dd>
                Coffee {gameState.pendingSupplyPurchase.coffee}, Milk{" "}
                {gameState.pendingSupplyPurchase.milk}, Pastries{" "}
                {gameState.pendingSupplyPurchase.pastries}
              </dd>
            </div>
            <div>
              <dt>Supplies left</dt>
              <dd>
                Coffee {gameState.daySummary.suppliesRemaining.coffee}, Milk{" "}
                {gameState.daySummary.suppliesRemaining.milk}, Pastries{" "}
                {gameState.daySummary.suppliesRemaining.pastries}
              </dd>
            </div>
            <div>
              <dt>Cleanliness</dt>
              <dd>{gameState.daySummary.cleanlinessLabel}</dd>
            </div>
            <div>
              <dt>Stress</dt>
              <dd>{gameState.daySummary.stressLabel}</dd>
            </div>
            <div>
              <dt>Reputation change</dt>
              <dd>{gameState.daySummary.reputationDelta}</dd>
            </div>
            <div>
              <dt>Helper</dt>
              <dd>{gameState.daySummary.helperRecap ?? "None"}</dd>
            </div>
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
