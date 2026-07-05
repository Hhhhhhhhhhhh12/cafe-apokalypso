import { useMemo, useState } from "react";
import { CafePlaceholder } from "../ui/cafe/CafePlaceholder";
import { createInitialGameState } from "../game/engine/gameState";
import type { GameState } from "../game/types/game";

/**
 * Lookbook — a single page that always shows the *current* look of the game:
 * the live diorama at a few representative states, plus every furniture and
 * character sprite straight from /assets. It reuses the real <CafePlaceholder>
 * component and the real global.css, so whatever changes in the game shows up
 * here on the next reload. Reference surface only — no game logic, no save.
 */

// --- Sprite galleries, pulled straight from the asset folders -------------
// Eager URL globs so adding/removing a PNG updates the lookbook automatically.
const propModules = import.meta.glob("../../assets/sprites/props/*.png", {
  eager: true,
  import: "default"
}) as Record<string, string>;
const guestModules = import.meta.glob("../../assets/sprites/guests/*.png", {
  eager: true,
  import: "default"
}) as Record<string, string>;

interface SpriteEntry {
  label: string;
  file: string;
  url: string;
}

function toEntries(modules: Record<string, string>, stripPrefixes: string[]): SpriteEntry[] {
  return Object.entries(modules)
    .map(([path, url]) => {
      const file = path.split("/").pop() ?? path;
      let label = file.replace(/\.png$/, "");
      for (const prefix of stripPrefixes) {
        if (label.startsWith(prefix)) {
          label = label.slice(prefix.length);
        }
      }
      label = label.replace(/-/g, " ").trim();
      return { label, file, url };
    })
    .sort((a, b) => a.label.localeCompare(b.label));
}

const propEntries = toEntries(propModules, ["placeholder-cafe-", "placeholder-"]);
const guestEntries = toEntries(guestModules, ["placeholder-guest-", "placeholder-"]);

// --- Representative diorama states ----------------------------------------
function baseState(): GameState {
  return {
    ...createInitialGameState(),
    dayPhase: "open",
    equipment: { machine: 2, seating: 2, register: 1 },
    dayManagement: {
      ...createInitialGameState().dayManagement,
      customersServed: 5,
      actionPointsRemaining: 6
    }
  };
}

interface DioramaScene {
  id: string;
  title: string;
  note: string;
  state: GameState;
}

const scenes: DioramaScene[] = [
  {
    id: "day1",
    title: "Day 1 · calm & clean",
    note: "Opening week. Low décor, tidy room, KASSANDRA still quiet.",
    state: {
      ...baseState(),
      day: 1,
      resources: { ...baseState().resources, cleanliness: 90, stress: 5, mood: "calm" },
      decor: { plant: 1, plant2: 1, shelf: 1, clock: 1, lamp: 1, cups: 1 }
    }
  },
  {
    id: "day4",
    title: "Day 4 · busy & lived-in",
    note: "Mid-week rush. Upgraded décor, rising stress, weirdness creeping in.",
    state: {
      ...baseState(),
      day: 4,
      resources: { ...baseState().resources, cleanliness: 55, stress: 45, mood: "busy" },
      decor: { plant: 2, plant2: 2, shelf: 2, clock: 2, lamp: 2, cups: 2 },
      hiddenWeirdness: 6
    }
  },
  {
    id: "day7",
    title: "Day 7 · strained & uncanny",
    note: "End of the week. Full décor, high stress, KASSANDRA awake, weirdness visible.",
    state: {
      ...baseState(),
      day: 7,
      resources: { ...baseState().resources, cleanliness: 35, stress: 75, mood: "strained" },
      decor: { plant: 3, plant2: 3, shelf: 3, clock: 3, lamp: 3, cups: 3 },
      kassandraInstalled: true,
      unlocks: { ...baseState().unlocks, kassandra: true },
      hiddenWeirdness: 14,
      weirdnessVisible: true
    }
  }
];

export function LookBook() {
  const [activeScene, setActiveScene] = useState<string>(scenes[0].id);
  const scene = useMemo(
    () => scenes.find((s) => s.id === activeScene) ?? scenes[0],
    [activeScene]
  );

  return (
    <main className="lookbook">
      <header className="lookbook__hero">
        <p className="lookbook__eyebrow">Café Apokalypso</p>
        <h1>Lookbook</h1>
        <p className="lookbook__lede">
          The current look at a glance — live diorama, furniture, characters and NPCs.
          Everything here renders from the same components and assets as the game,
          so a reload always shows the present state.
        </p>
      </header>

      <section className="lookbook__section" aria-labelledby="lb-diorama">
        <h2 id="lb-diorama">Diorama</h2>
        <p className="lookbook__hint">
          The room across the week. Pick a state to see how mood, décor and weirdness shift.
        </p>
        <div className="lookbook__tabs" role="tablist" aria-label="Diorama states">
          {scenes.map((s) => (
            <button
              key={s.id}
              role="tab"
              type="button"
              aria-selected={s.id === activeScene}
              className={`lookbook__tab${s.id === activeScene ? " lookbook__tab--active" : ""}`}
              onClick={() => setActiveScene(s.id)}
            >
              {s.title}
            </button>
          ))}
        </div>
        <p className="lookbook__scene-note">{scene.note}</p>
        <div className="lookbook__diorama-frame">
          {/* key forces a fresh mount per scene so entrance choreography re-runs */}
          <CafePlaceholder key={scene.id} gameState={scene.state} />
        </div>
      </section>

      <section className="lookbook__section" aria-labelledby="lb-furniture">
        <h2 id="lb-furniture">Furniture &amp; décor</h2>
        <p className="lookbook__hint">
          Props and décor tiers ({propEntries.length}) from{" "}
          <code>assets/sprites/props/</code>.
        </p>
        <div className="lookbook__grid">
          {propEntries.map((entry) => (
            <SpriteCard key={entry.file} entry={entry} />
          ))}
        </div>
      </section>

      <section className="lookbook__section" aria-labelledby="lb-characters">
        <h2 id="lb-characters">Characters &amp; NPCs</h2>
        <p className="lookbook__hint">
          Guests and NPCs ({guestEntries.length}) from{" "}
          <code>assets/sprites/guests/</code>.
        </p>
        <div className="lookbook__grid">
          {guestEntries.map((entry) => (
            <SpriteCard key={entry.file} entry={entry} />
          ))}
        </div>
      </section>
    </main>
  );
}

function SpriteCard({ entry }: { entry: SpriteEntry }) {
  return (
    <figure className="lookbook__card">
      <div className="lookbook__card-stage">
        <img src={entry.url} alt={entry.label} loading="lazy" />
      </div>
      <figcaption>
        <strong>{entry.label}</strong>
        <code>{entry.file}</code>
      </figcaption>
    </figure>
  );
}
