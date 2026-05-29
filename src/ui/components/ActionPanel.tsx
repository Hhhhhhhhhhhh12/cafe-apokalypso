import {
  getWeekOneContentSummary,
  kassandraMessages,
  weekOneDays
} from "../../game/data";

interface ActionPanelProps {
  statusMessage: string;
  onPrepareCounter: () => void;
  onCleanTables: () => void;
  onResetGame: () => void;
}

export function ActionPanel({
  statusMessage,
  onPrepareCounter,
  onCleanTables,
  onResetGame
}: ActionPanelProps) {
  const contentSummary = getWeekOneContentSummary();
  const openingDay = weekOneDays[0];
  const firstKassandraMessage = kassandraMessages[0];

  return (
    <section className="panel action-panel" aria-labelledby="actions-title">
      <div className="panel-heading">
        <p className="eyebrow">Controls</p>
        <h2 id="actions-title">Action panel</h2>
      </div>

      <div className="button-row">
        <button type="button" onClick={onPrepareCounter}>
          Prepare counter
        </button>
        <button type="button" onClick={onCleanTables}>
          Clean tables
        </button>
        <button type="button" className="secondary-button" onClick={onResetGame}>
          Reset / New Game
        </button>
      </div>

      <p className="status-message" role="status" aria-live="polite">
        {statusMessage}
      </p>

      <section className="data-preview" aria-labelledby="data-preview-title">
        <div>
          <p className="eyebrow">Data model preview</p>
          <h3 id="data-preview-title">Week-one content loaded</h3>
        </div>

        <dl className="data-summary-list">
          <div>
            <dt>Guests</dt>
            <dd>
              {contentSummary.normalGuests} normal /{" "}
              {contentSummary.subtlyStrangeGuests} strange
            </dd>
          </div>
          <div>
            <dt>Products</dt>
            <dd>{contentSummary.products}</dd>
          </div>
          <div>
            <dt>Days</dt>
            <dd>{contentSummary.days}</dd>
          </div>
          <div>
            <dt>Scripted events</dt>
            <dd>{contentSummary.scriptedEvents}</dd>
          </div>
        </dl>

        <p className="data-preview__note">
          Day 1 milestone: {openingDay.milestone}
        </p>
        <p className="data-preview__note">
          KASSANDRA is static/simulated: {firstKassandraMessage.text}
        </p>
      </section>
    </section>
  );
}
