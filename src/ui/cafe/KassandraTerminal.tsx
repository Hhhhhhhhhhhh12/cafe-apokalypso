import { useEffect, useRef, useState } from "react";
import {
  getGuestPatienceState,
  getKassandraConsultValue,
  getVisibleKassandraMessages,
  isEarlyKassandraConsult
} from "../../game/engine/selectors";
import type { GameState } from "../../game/types/game";

export function KassandraTerminal({ gameState, onConsult }: {
  gameState: GameState;
  onConsult: () => void;
}) {
  const { actionPointsRemaining, kassandraConsulted, kassandraReceipt, guestsLost } = gameState.dayManagement;
  const [initialGuestsLost] = useState(guestsLost);
  const receiptRef = useRef<HTMLHeadingElement>(null);
  const printedHere = useRef(false);
  const waiting = getGuestPatienceState(gameState);
  const early = isEarlyKassandraConsult(gameState);
  const message = getVisibleKassandraMessages(gameState)[0];
  const value = getKassandraConsultValue(gameState);

  useEffect(() => {
    if (kassandraConsulted && printedHere.current) receiptRef.current?.focus();
  }, [kassandraConsulted]);

  return (
    <div className="kassandra-terminal">
      {kassandraConsulted ? (
        <>
          <h4 ref={receiptRef} tabIndex={-1}>Forecast printed</h4>
          {kassandraReceipt && (
            <div className="kassandra-terminal__receipt">
              <strong>{kassandraReceipt[0]}</strong>
              {kassandraReceipt.slice(1).map((line, index) => <p key={index}>{line}</p>)}
            </div>
          )}
          {guestsLost > initialGuestsLost && <p role="status">The waiting guest left.</p>}
        </>
      ) : (
        <>
          <button type="button" disabled={actionPointsRemaining === 0}
            aria-describedby={`kassandra-consult-timing${actionPointsRemaining > 0 ? " kassandra-consult-value" : ""}`}
            onClick={() => {
              printedHere.current = true;
              onConsult();
            }}
          >
            Print forecast{actionPointsRemaining > 0 ? early ? " · 0 actions" : " · 1 action" : ""}
          </button>
          {actionPointsRemaining > 0 && <p id="kassandra-consult-value" className="kassandra-terminal__value">
            <span aria-hidden="true">{value === "stock-risk" ? "⚠ " : value === "covered" ? "✓ " : "— "}</span>
            {value === "stock-risk" ? "Stock risk ahead" : value === "covered" ? "Stock looks sufficient" : "No orders to inspect"}
          </p>}
          <p id="kassandra-consult-timing">
            {actionPointsRemaining === 0 ? "Requires an available action."
              : waiting?.critical ? "The waiting guest will leave."
              : waiting ? "The waiting guest loses one patience step." : "No guest waiting."}
          </p>
        </>
      )}
      {message && !kassandraConsulted && (
        <details>
          <summary>Register message</summary>
          <p>{message.text}</p>
        </details>
      )}
    </div>
  );
}
