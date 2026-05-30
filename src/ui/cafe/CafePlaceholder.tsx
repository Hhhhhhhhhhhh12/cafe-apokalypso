export function CafePlaceholder() {
  return (
    <section
      className="panel cafe-panel"
      aria-labelledby="cafe-placeholder-title"
    >
      <div className="panel-heading">
        <h2 id="cafe-placeholder-title">Heute im Café</h2>
      </div>

      <div
        className="placeholder-cafe-diorama"
        role="img"
        aria-label="Temporary block layout for the future 3/4 pixel café view. It contains a counter, tables, guest markers, and a coffee machine marker."
      >
        <div className="placeholder-cafe-wall" />
        <div className="placeholder-cafe-floor">
          <div className="placeholder-counter">
            <span>Counter</span>
          </div>
          <div className="placeholder-machine" aria-hidden="true" />
          <div className="placeholder-table placeholder-table--left">
            <span>Table</span>
          </div>
          <div className="placeholder-table placeholder-table--right">
            <span>Table</span>
          </div>
          <div className="placeholder-guest placeholder-guest-normal-01">
            <span>Guest</span>
          </div>
          <div className="placeholder-guest placeholder-guest-strange-01">
            <span>Hint</span>
          </div>
        </div>
      </div>
    </section>
  );
}
