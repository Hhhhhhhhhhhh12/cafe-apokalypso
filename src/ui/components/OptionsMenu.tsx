import { useEffect, useId, useRef, useState } from "react";

/**
 * Display & Accessibility options menu.
 *
 * Active toggles: Colourblind-friendly palette (#68), Larger text (#128).
 * Passive status: Reduced motion (already honoured by prefers-reduced-motion).
 */
const OPTIONS_STORAGE_KEY = "cafe-apokalypso.options.v1";

interface StoredOptions {
  colourblindMode?: boolean;
  largeText?: boolean;
}

type ToggleKey = keyof StoredOptions;

/** Root classes are how the palettes/scales reach CSS — one per toggle. */
const TOGGLE_ROOT_CLASS: Record<ToggleKey, string> = {
  colourblindMode: "cafe-colorblind-mode",
  largeText: "cafe-text-large"
};

interface Option {
  label: string;
  detail: string;
  status: "interactive" | "respected";
  key?: ToggleKey;
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
    key: "colourblindMode",
    detail: "A higher-contrast, hue-independent mode."
  },
  {
    label: "Larger text",
    status: "interactive",
    key: "largeText",
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
  // Lazy initializer: loadOptions() is try/catch-safe even where localStorage
  // is unavailable (static server render), so no load-on-mount effect needed.
  const [settings, setSettings] = useState<StoredOptions>(loadOptions);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const idPrefix = useId();

  // Sync root classes with the settings, persist changes.
  useEffect(() => {
    for (const [key, className] of Object.entries(TOGGLE_ROOT_CLASS)) {
      document.documentElement.classList.toggle(
        className,
        Boolean(settings[key as ToggleKey])
      );
    }
    saveOptions(settings);
  }, [settings]);

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
              if (option.status === "interactive" && option.key) {
                const key = option.key;
                const checkboxId = `${idPrefix}-${key}`;
                return (
                  <li key={option.label} className="options-menu__item">
                    <label htmlFor={checkboxId} className="options-menu__toggle">
                      <input
                        id={checkboxId}
                        type="checkbox"
                        checked={Boolean(settings[key])}
                        onChange={() =>
                          setSettings((prev) => ({ ...prev, [key]: !prev[key] }))
                        }
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
                    <span className="options-menu__tag options-menu__tag--respected">
                      Respected
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
