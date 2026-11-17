# Audio Direction — Café Apokalypso

> **Status: Exploratory / paused (2026-10-27).** This is a non-binding creative and technical idea collection, **not** approved audio direction or permission to implement. Revisit after a dedicated sound-design discussion. Linked tracking issue: [#200 — Soundtrack & Sounddesign – Konzeptphase (später)](https://github.com/Hhhhhhhhhhhh12/cafe-apokalypso/issues/200).
>
> The current [roadmap](ROADMAP.md) lists audio/music direction and sound effects in **Phase 5 (Polish)**. This document does not bring production forward or alter approved MVP scope.

## 1. Design intent

The game's soundtrack should support the existing cozy-absurd design canon: a recognizable small café whose everyday routines gradually reveal that something is strange.

**Working direction:** *cozy → subtle uncanny → apocalyptically odd*, retaining warmth, wit, and restraint. No horror soundtrack, constant chaos, exaggerated comedy stingers, or intrusive meme music.

Potential palette to evaluate, not a final genre decision:
- Warm, lightly nostalgic café-jazz / jazzhop / bossa / lo-fi textures.
- Small piano or guitar motifs, understated bass and percussion, restrained tape/analog color.
- Later, carefully dosed detuning, unusual chords, quiet synth tones, sparse cosmic or bureaucratically solemn textures.
- Music should leave room for café sound effects and gameplay feedback.
- Prefer mostly instrumental music as a first experiment, so dialogue and UI remain clear.

Reference names mentioned in discussion (e.g. *Animal Crossing*, *VA-11 Hall-A*) are **mood references only**, never permission to copy a composition, recording, recognizable motif, character or proprietary asset.

## 2. Musical identity and pacing

The candidate structure is **a few strong, recognizable musical motifs** (short recurring themes) rather than a playlist of many full-length songs.

Possible arc for the seven-day vertical slice, requiring later listening/playtesting:
- **Early days:** inviting routine, familiar café motif.
- **Middle days:** barely perceptible harmonic and textural surprises while the main motif remains identifiable.
- **Late days / selected events:** more surreal coloration, without turning the game into horror.
- **Day 7 hook:** a focused accent or rearrangement could mark the official apocalyptic letter. No mandated cue or timing yet.

Avoid programming the exact arc or defining day-by-day trigger thresholds before its musical concept is approved.

## 3. Candidate cue list (not a committed asset list)

| Cue idea | Purpose | Tentative production form |
| --- | --- | --- |
| Main theme | Title screen / identity | Recognizable theme or loop |
| Day café bed | Core management play | Quiet seamless loop |
| Late/quiet variant | Alternative calmer mood *if gameplay supports it* | Variation on same motif, not necessarily a separate night system |
| Strange-event layer | Subtle shift during selected events | Optional independent layer or variant |
| Chaos/failure sting | Short reaction without disruptive slapstick | Very short one-shot |
| Upgrade/unlock sting | Reward and positive feedback | Very short one-shot |
| Rain/ambient variant | Environmental texture *if such a state exists* | Layered ambience, not necessarily a distinct song |

A previous conversation floated 60–90-second loops and a 1.5–2-minute title theme as **initial exploration numbers only**. Real length, file sizes and looping method are undecided.

## 4. Adaptive audio (optional)

*Adaptive music* means music reacts to gameplay state, e.g. by adding/subtracting layers, changing variations or smoothly transitioning between cues.

Possible conceptual structure:
1. Base café music remains calm and recognizable.
2. A strange-event texture appears only if an appropriate game state exists.
3. Optional ambiance (rain, café room tone) operates independently of melody.
4. Brief UI or event stings do not fight gameplay feedback.

Do not add an audio engine, new gameplay state, real-time scheduler or event hooks solely because this document lists the idea. First review existing event/state APIs and whether simple fades or alternate loops are sufficient. Prefer graceful behavior even when muted or audio fails to load.

## 5. Sound effects and ambience

Ambient details may contribute as much to the café's cozy identity as the score:
- Espresso machine, grinder, kettle, steam and appliances.
- Cups, saucers, payment/register, doors/bell, chair movement, footsteps.
- Cleaning, paper, supply handling and subtle UI feedback.
- Carefully controlled atypical sounds for the increasingly strange events.
- Optional room ambience / gentle weather, only where supported by actual gameplay.

Distinguish **mechanically meaningful feedback** (must have accessible visual equivalent) from optional atmosphere. Avoid constant repeated sounds, excessive loudness and inaccessible sound-only information.

## 6. Production options (all undecided)

### Suno — concept exploration

Potential use: generating sketches, unusual combinations, mood comparisons and rough listening references, generally without vocals. Draft prompt directions from the chat:
- “Cozy pixel café, warm jazzhop, rainy evening, very subtle apocalyptic undertones, instrumental, restrained.”
- “Nostalgic café bossa, almost normal, a few gentle analog synth dissonances, instrumental.”
- “Minimal cozy café ambience with hints of surreal cosmic bureaucracy, soft piano, no vocals.”

**Do not assume Suno output is production-ready or that subscription/payment confers all required rights.** Before commercial release, independently verify the current terms applicable to the exact account, creation date, license, territory and intended distribution. Also consider copyright uncertainty and potential third-party resemblance. Avoid imitating specific living artists' voices or copyrighted songs.

### GarageBand or another DAW — composition and editing

*DAW = Digital Audio Workstation*, a music production environment for recording, arranging and mixing.

Possible tasks:
- Composing or rebuilding approved ideas as original motifs.
- Restrained arrangement, controlled mix/levels and mastering targets.
- Exporting, looping, and designing stems (separate musical layers) for adaptive music.
- Creating short stings or processing original recorded sound effects.

GarageBand is a candidate, not a binding tool. Rebuilding a generated track does not automatically resolve rights issues, so preserve source and license information.

### Other options

Original in-house composition, freelance musician/composer, or appropriately licensed sound libraries. Evaluate production time, editability, project budget and provenance before selecting a route.

## 7. Browser integration and accessibility (future technical checklist)

The deployed game is a **static Vite/React/TypeScript web app**; do not assume a native desktop audio stack.

Review before coding:
- Browser autoplay restrictions; begin/restart audio only after permitted user interaction.
- Music and sound effects independently adjustable, always including mute; optional stored user preference.
- No gameplay-critical information conveyed only as sound. Preserve clear visual feedback.
- Respect reduced stimulation and avoid startling peaks, abrupt loud effects or high-volume loops.
- Test browser/device support for compressed assets and fallbacks (such as Ogg/MP3; choose empirically).
- Seamless loop points, crossfades, transitions, perceived loudness, pause/resume and background-tab behavior.
- Mobile performance, download size, preloading and memory usage; avoid loading all cues at once.
- Keep sound assets first-party/local, avoid runtime third-party trackers, external scripts, secrets or unnecessary requests.
- Check paths and deployment constraints of static GitHub Pages before choosing asset references.

These are **questions and guardrails**, not current implementation specifications.

## 8. Rights, provenance and review gate

Before using any final audio in a public or commercial build:
1. Record creator/tool, creation date, source recording/sample details, plan/license and permitted uses for each asset.
2. Review Suno and DAW loop/library terms **at the time of usage**, not from assumptions in this document.
3. Screen for third-party copyrighted music, recognizable sound-alikes, uncleared samples and impermissible voice imitation.
4. Confirm distribution rights for the web game and any later downloadable soundtrack.
5. Prefer source files and documented license evidence in a controlled asset inventory; do not commit account credentials, purchase receipts containing personal details or restricted licensed libraries to this **public** repository.

This is a workflow reminder, not legal clearance.

## 9. Re-entry checklist (when user restarts the topic)

1. Confirm this document still reflects the desired tone and scope.
2. Listen to/select ~3 distinct stylistic directions; check references for rights and originality.
3. Choose one **small audio prototype** (e.g., a café loop and optional variation), only after approval.
4. Decide production method: Suno, GarageBand/other DAW, original composition, licensed library or hybrid.
5. Verify licensing, provenance, loop quality, browser requirements and accessibility.
6. Only then open tightly scoped implementation issues and determine acceptance tests.

## 10. Explicitly not decided

No definitive soundtrack genre, composer, tool, number of tracks, track durations, BPM, instruments, audio files, soundtrack release, license conclusion, priority increase, adaptive engine or implementation timeline has been approved. The prior discussion was exploratory; there is **no authorization to produce or integrate audio yet**.

Related: [Project canon](PROJECT_CANON.md) · [Content guide](CONTENT_GUIDE.md) · [Roadmap](ROADMAP.md) · [Quality checklist](QUALITY_CHECKLIST.md) · [Codex handoff](CODEX_HANDOFF.md) · [Audio backlog issue #200](https://github.com/Hhhhhhhhhhhh12/cafe-apokalypso/issues/200).
