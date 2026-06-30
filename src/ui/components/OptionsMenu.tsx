import { useEffect, useId, useRef, useState } from "react";

/**
 * Display & Accessibility options menu.
 *
 * Active toggles: Colourblind-friendly palette (#68).
 * Passive status: Reduced motion (already honoured by prefers-reduced-motion).
 * Future toggles: Text size, contrast, …
 */
const OPTIONS_STORAGE_KEY = "cafe-apokalypso.options.v1";

interface StoredOptions {
  colourblindMode?: boolean;
}

interface Option {
  label: string;
  detail: string;
  status: "interactive" | "respected" | "coming-soon";
}

const OPTIONS: readonly Option[] = [
  {
    label: "Reduced motion",
    status: "respected",
    detail: "Already honoured from your system setting."
  },
  {
    label: "Colourblind-friendly palette",
    status: "interactive",
    detail: "A higher-contrast, hue-independent mode."
  },
  {
    label: "Text size",
    status: "coming-soon",
    detail: "Scale the interface text up for easier reading."
  }
];

function loadOptions(): StoredOptions {
  try {
    const stored = localStorage.getItem(OPTIONS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveOptions(opts: StoredOptions): void {
  try {
    localStorage.setItem(OPTIONS_STORAGE_KEY, JSON.stringify(opts));
  } catch (e) {
    console.warn("Failed to save options:", e);
  }
}

export function OptionsMenu({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const [colourblindMode, setColourblindMode] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const colourblindCheckboxId = useId();

  // Load persisted options on mount.
  useEffect(() => {
    const stored = loadOptions();
    if (stored.colourblindMode) {
      setColourblindMode(true);
      document.documentElement.classList.add("cafe-colorblind-mode");
    }
  }, []);

  // Apply/remove colourblind mode on the document root.
  useEffect(() => {
    if (colourblindMode) {
      document.documentElement.classList.add("cafe-colorblind-mode");
    } else {
      document.documentElement.classList.remove("cafe-colorblind-mode");
    }
    // Persist to localStorage.
    saveOptions({ colourblindMode });
  }, [colourblindMode]);

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
          <ul className="options-menu__list">
            {OPTIONS.map((option) => {
              if (option.status === "interactive") {
                return (
                  <li key={option.label} className="options-menu__item">
                    <label htmlFor={colourblindCheckboxId} className="options-menu__toggle">
                      <input
                        id={colourblindCheckboxId}
                        type="checkbox"
                        checked={colourblindMode}
                        onChange={() => setColourblindMode((v) => !v)}
                        className="options-menu__toggle-input"
                      />
                      <span className="options-menu__toggle-label">{option.label}</span>
                    </label>
                    <span className="options-menu__item-detail">{option.detail}</span>
                  </li>
                );
              }
              return (
                <li key={option.label} className="options-menu__item">
                  <span className="options-menu__item-head">
                    <span className="options-menu__item-label">{option.label}</span>
                    <span className={`options-menu__tag options-menu__tag--${option.status}`}>
                      {option.status === "respected" ? "Respected" : "Coming soon"}
                    </span>
                  </span>
                  <span className="options-menu__item-detail">{option.detail}</span>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
