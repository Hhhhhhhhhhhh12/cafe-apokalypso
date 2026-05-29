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
    </section>
  );
}
