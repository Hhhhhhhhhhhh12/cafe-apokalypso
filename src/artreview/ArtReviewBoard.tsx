import { useMemo, useState } from "react";
import { toJson, toMarkdown, downloadTextFile } from "./export";
import { createId } from "./id";
import { getBrowserStorage, loadCandidates, saveCandidates, type StorageLike } from "./storage";
import {
  ART_CANDIDATE_CATEGORIES,
  ART_CANDIDATE_STATUSES,
  CATEGORY_LABEL,
  STATUS_LABEL,
  type ArtCandidate,
  type ArtCandidateCategory,
  type ArtCandidateStatus
} from "./types";

/**
 * Local, backend-free tool for reviewing art candidates (character/prop
 * casting sheets, moodboard picks, …) and recording keep/refine/reject/later
 * decisions. State lives in localStorage only; nothing here touches the game
 * runtime. See docs/ART_PIPELINE.md for the review workflow this supports.
 */
export function ArtReviewBoard() {
  const [storage] = useState<StorageLike | null>(() => getBrowserStorage());
  const [candidates, setCandidates] = useState<ArtCandidate[]>(() =>
    storage ? loadCandidates(storage) : []
  );
  const [selectedId, setSelectedId] = useState<string | null>(() => candidates[0]?.id ?? null);

  function persist(next: ArtCandidate[]) {
    setCandidates(next);
    if (storage) {
      saveCandidates(next, storage);
    }
  }

  const effectiveSelectedId = selectedId ?? candidates[0]?.id ?? null;
  const selected = useMemo(
    () => candidates.find((candidate) => candidate.id === effectiveSelectedId) ?? null,
    [candidates, effectiveSelectedId]
  );

  function addCandidate(title: string, category: ArtCandidateCategory, imageRef: string) {
    const candidate: ArtCandidate = {
      id: createId(),
      title,
      category,
      status: "later",
      notes: "",
      priority: 3,
      imageRef,
      createdAt: new Date().toISOString()
    };
    persist([...candidates, candidate]);
    setSelectedId(candidate.id);
  }

  function updateCandidate(updated: ArtCandidate) {
    persist(candidates.map((c) => (c.id === updated.id ? updated : c)));
  }

  function removeCandidate(id: string) {
    persist(candidates.filter((c) => c.id !== id));
    setSelectedId((current) => (current === id ? null : current));
  }

  function exportAs(format: "markdown" | "json") {
    if (format === "markdown") {
      downloadTextFile("art-review.md", toMarkdown(candidates), "text/markdown");
    } else {
      downloadTextFile("art-review.json", toJson(candidates), "application/json");
    }
  }

  return (
    <main className="artreview">
      <header className="artreview__hero">
        <p className="artreview__eyebrow">Café Apokalypso</p>
        <h1>Art review board</h1>
        <p className="artreview__lede">
          Internal workflow tool for casting-sheet review. State lives only in this
          browser&apos;s local storage — nothing here is a game feature or a production asset.
        </p>
        <div className="artreview__export-row">
          <button type="button" onClick={() => exportAs("markdown")}>
            Export Markdown
          </button>
          <button type="button" onClick={() => exportAs("json")}>
            Export JSON
          </button>
        </div>
      </header>

      <div className="artreview__layout">
        <div className="artreview__sidebar">
          <AddCandidateForm onAdd={addCandidate} />

          <ul className="artreview__list">
            {candidates.length === 0 && (
              <li className="artreview__empty">No candidates yet — add one above.</li>
            )}
            {candidates.map((candidate) => (
              <li key={candidate.id}>
                <button
                  type="button"
                  className={`artreview__list-item${
                    candidate.id === effectiveSelectedId ? " artreview__list-item--active" : ""
                  }`}
                  onClick={() => setSelectedId(candidate.id)}
                >
                  <span className="artreview__list-title">{candidate.title}</span>
                  <span className={`artreview__badge artreview__badge--${candidate.status}`}>
                    {CATEGORY_LABEL[candidate.category]} · {STATUS_LABEL[candidate.status]}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="artreview__detail">
          {selected ? (
            <CandidateEditor
              key={selected.id}
              candidate={selected}
              onSave={updateCandidate}
              onDelete={() => removeCandidate(selected.id)}
            />
          ) : (
            <p className="artreview__hint">Select or add a candidate to start reviewing.</p>
          )}
        </div>
      </div>
    </main>
  );
}

function AddCandidateForm({
  onAdd
}: {
  onAdd: (title: string, category: ArtCandidateCategory, imageRef: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<ArtCandidateCategory>("character");
  const [imageRef, setImageRef] = useState("");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      return;
    }
    onAdd(trimmed, category, imageRef.trim());
    setTitle("");
    setImageRef("");
  }

  return (
    <form className="artreview__add-form" onSubmit={handleSubmit}>
      <h2>Add candidate</h2>
      <label>
        Title
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="e.g. Mira — seated pose v2"
        />
      </label>
      <label>
        Category
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value as ArtCandidateCategory)}
        >
          {ART_CANDIDATE_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {CATEGORY_LABEL[cat]}
            </option>
          ))}
        </select>
      </label>
      <label>
        Image reference (path or URL)
        <input
          type="text"
          value={imageRef}
          onChange={(event) => setImageRef(event.target.value)}
          placeholder="optional"
        />
      </label>
      <button type="submit" className="artreview__submit" disabled={!title.trim()}>
        Add candidate
      </button>
    </form>
  );
}

function CandidateEditor({
  candidate,
  onSave,
  onDelete
}: {
  candidate: ArtCandidate;
  onSave: (candidate: ArtCandidate) => void;
  onDelete: () => void;
}) {
  const [draft, setDraft] = useState<ArtCandidate>(candidate);
  const isDirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(candidate), [draft, candidate]);

  function handleDelete() {
    if (window.confirm(`Remove "${candidate.title}" from the review board?`)) {
      onDelete();
    }
  }

  return (
    <div className="artreview__editor">
      <div className="artreview__editor-header">
        <h2>{candidate.title}</h2>
        <button type="button" className="artreview__delete" onClick={handleDelete}>
          Remove
        </button>
      </div>

      <label>
        Category
        <select
          value={draft.category}
          onChange={(event) =>
            setDraft({ ...draft, category: event.target.value as ArtCandidateCategory })
          }
        >
          {ART_CANDIDATE_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {CATEGORY_LABEL[cat]}
            </option>
          ))}
        </select>
      </label>

      <fieldset className="artreview__status-group">
        <legend>Status</legend>
        {ART_CANDIDATE_STATUSES.map((status) => (
          <button
            key={status}
            type="button"
            className={`artreview__status-btn artreview__status-btn--${status}${
              draft.status === status ? " artreview__status-btn--active" : ""
            }`}
            onClick={() => setDraft({ ...draft, status: status as ArtCandidateStatus })}
          >
            {STATUS_LABEL[status]}
          </button>
        ))}
      </fieldset>

      <label>
        Priority
        <span className="artreview__priority-row">
          <input
            type="range"
            min={0}
            max={5}
            step={1}
            value={draft.priority}
            onChange={(event) => setDraft({ ...draft, priority: Number(event.target.value) })}
          />
          <span className="artreview__priority-value">{draft.priority}/5</span>
        </span>
      </label>

      <label>
        Image reference (path or URL)
        <input
          type="text"
          value={draft.imageRef}
          onChange={(event) => setDraft({ ...draft, imageRef: event.target.value })}
        />
      </label>

      <label>
        Notes
        <textarea
          value={draft.notes}
          onChange={(event) => setDraft({ ...draft, notes: event.target.value })}
          rows={6}
          placeholder="Review notes, visual direction, concerns…"
        />
      </label>

      <button
        type="button"
        className="artreview__submit"
        disabled={!isDirty}
        onClick={() => onSave(draft)}
      >
        Save changes
      </button>
    </div>
  );
}
