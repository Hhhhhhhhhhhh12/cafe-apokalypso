import {
  getAvailableGuests,
  getAvailableProducts,
  getCurrentDayDefinition,
  getCurrentDayEvents,
  getVisibleDaySevenLetter,
  getVisibleKassandraMessages,
  getVisibleStaffOptions
} from "../../game/engine/selectors";
import type { GameState } from "../../game/types/game";

interface DayProgressPanelProps {
  gameState: GameState;
}

export function DayProgressPanel({ gameState }: DayProgressPanelProps) {
  const currentDay = getCurrentDayDefinition(gameState);
  const products = getAvailableProducts(gameState);
  const guests = getAvailableGuests(gameState);
  const events = getCurrentDayEvents(gameState);
  const staffOptions = getVisibleStaffOptions(gameState);
  const kassandraMessages = getVisibleKassandraMessages(gameState);
  const daySevenLetter = getVisibleDaySevenLetter(gameState);

  return (
    <section className="panel day-progress-panel" aria-labelledby="day-progress-title">
      <div className="panel-heading">
        <p className="eyebrow">Week-one loop</p>
        <h2 id="day-progress-title">
          Day {currentDay.day}: {currentDay.title}
        </h2>
      </div>

      <p className="day-milestone">{currentDay.milestone}</p>

      <div className="data-grid" aria-label="Current day data">
        <DataList
          title="Available products"
          items={products.map((product) => product.name)}
        />
        <DataList title="Possible guests" items={guests.map((guest) => guest.name)} />
        <DataList title="Scripted beats" items={events.map((event) => event.title)} />
        <DataList title="Unlocked systems" items={[...currentDay.unlocks]} />
      </div>

      {staffOptions.length > 0 ? (
        <section className="inline-callout" aria-labelledby="staff-options-title">
          <h3 id="staff-options-title">Temporary help available</h3>
          <p>{staffOptions.map((staffOption) => staffOption.name).join(", ")}</p>
        </section>
      ) : null}

      {kassandraMessages.length > 0 ? (
        <section className="inline-callout placeholder-kassandra-ui" aria-labelledby="kassandra-title">
          <h3 id="kassandra-title">KASSANDRA update</h3>
          <ul>
            {kassandraMessages.map((message) => (
              <li key={message.id}>{message.text}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {daySevenLetter ? (
        <section className="letter-panel" aria-labelledby="day-seven-letter-title">
          <h3 id="day-seven-letter-title">Day 7 cliffhanger</h3>
          <pre>{daySevenLetter}</pre>
          <p>
            Visible weirdness: {gameState.hiddenWeirdness}. Full apocalypse
            operations remain locked for later development.
          </p>
        </section>
      ) : null}
    </section>
  );
}

interface DataListProps {
  title: string;
  items: readonly string[];
}

function DataList({ title, items }: DataListProps) {
  return (
    <section className="data-card" aria-label={title}>
      <h3>{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
