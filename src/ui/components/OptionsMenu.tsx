import { useEffect, useId, useRef, useState } from "react";

/**
 * Scaffold for the in-game Display & Accessibility options (GitHub #67).
 *
 * The vertical slice only *hints* that options are coming: a subtle header
 * affordance that discloses the planned toggles. The toggles' actual logic
 * (colourblind palette #68, text size, …) lands in their own issues, so this
 * panel previews them as "coming soon" and truthfully marks reduced motion as
 * already respected (the app honours prefers-reduced-motion today).
 */
interface PlannedOption {
  label: string;
  status: "respected" | "coming-soon";
  detail: string;
}

const PLANNED_OPTIONS: readonly PlannedOption[] = [
  {
    label: "Reduced motion",
    status: "respected",
    detail: "Already honoured from your system setting."
  },
  {
    label: "Colourblind-friendly palette",
    status: "coming-soon",
    detail: "A higher-contrast, hue-independent mode."
  },
  {
    label: "Text size",
    status: "coming-soon",
    detail: "Scale the interface text up for easier reading."
  }
];

export function OptionsMenu({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  // Esc closes the panel and returns focus to the trigger.
  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="options-menu">
      <button
        ref={buttonRef}
        type="button"
        className="options-menu__button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="options-menu__icon" aria-hidden="true">⚙</span>
        Display &amp; access.
      </button>

      {open ? (
        <div
          className="options-menu__panel"
          id={panelId}
          role="group"
          aria-label="Display and accessibility options"
        >
          <p className="options-menu__lead">
            Display &amp; accessibility options are on the way.
          </p>
          <ul className="options-menu__list">
            {PLANNED_OPTIONS.map((option) => (
              <li key={option.label} className="options-menu__item">
                <span className="options-menu__item-head">
                  <span className="options-menu__item-label">{option.label}</span>
                  <span className={`options-menu__tag options-menu__tag--${option.status}`}>
                    {option.status === "respected" ? "Respected" : "Coming soon"}
                  </span>
                </span>
                <span className="options-menu__item-detail">{option.detail}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
