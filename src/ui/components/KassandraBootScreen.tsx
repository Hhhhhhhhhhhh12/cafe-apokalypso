import { useEffect, useRef } from "react";

interface KassandraBootScreenProps {
  onDismiss: () => void;
}

/**
 * One-time boot splash shown before Day 1 of a fresh run. KASSANDRA-flavored,
 * calm and slightly wrong. The "Previous runs: [REDACTED]" line is the earliest
 * roguelite/meta signal (see docs/DECISIONS.md — approved). Rendered as an
 * overlay on top of the workspace so the underlying app still mounts.
 */
export function KassandraBootScreen({ onDismiss }: KassandraBootScreenProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    buttonRef.current?.focus();
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onDismiss();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onDismiss]);

  return (
    <div
      className="kassandra-boot"
      role="dialog"
      aria-modal="true"
      aria-labelledby="kassandra-boot-title"
    >
      <div className="kassandra-boot__panel">
        <p className="eyebrow">KASSANDRA</p>
        <h2 id="kassandra-boot-title">Café register — booting</h2>
        <pre className="kassandra-boot__log">{`Good morning.
Initializing café week…
Customer base: not yet observed.
Previous runs: [REDACTED]`}</pre>
        <p className="kassandra-boot__note">
          The register finishes its checklist before you do. It does not explain
          the last line.
        </p>
        <button type="button" ref={buttonRef} onClick={onDismiss}>
          Open the café
        </button>
      </div>
    </div>
  );
}
