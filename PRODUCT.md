# Product

## Register

product

## Users

Game players discovering the demo via a portfolio link or game-sharing context. They arrive curious, not committed — the first screen must pull them in. Once inside, they are in a focused, slightly meditative play session: managing a small café day by day, noticing something is quietly, unavoidably off. The average session is 15–20 minutes. Secondary audience: hiring reviewers and collaborators evaluating craft and creative direction.

## Product Purpose

A playable 7-day vertical slice of Café Apokalypso — a cozy-absurd café management soft-roguelite browser game. The demo communicates the game's core identity: cozy micromanagement that slowly, unmistakably tips into mythological bureaucracy and low-key apocalypse. Success means the player ends Day 7 wanting to know what happens on Day 8. No backend, no accounts — runs entirely in the browser with localStorage save.

## Brand Personality

Dry, warm, precise. The game is not winking at the player; it is completely serious about its own absurdity. Three words: **cozy, witty, uncanny**. The tone is a well-run café where everything is subtly, impossibly wrong — and the staff hasn't noticed yet, or have and consider it normal.

## Anti-references

- **Stardew Valley / casual pixel**: friendly pastel color ramps, bouncy iconography, cheerful rounded corners. This game is warmer in tone but more restrained in affect.
- **Generic SaaS / dashboard**: card-heavy layouts, neutral grays, Bootstrap-ish grid logic. UI exists in a game world, not a business tool.
- **Horror / dark roguelite**: Darkest Dungeon's grimness, Slay the Spire's dungeon-crawler darkness. The palette stays warm. The weirdness is quiet, not threatening.
- **Hyper-minimalist / flat**: iOS Settings cleanliness, Material Design flatness. No warmth, no character, no texture — the opposite of this game's identity.

## Design Principles

1. **The café first, the strangeness second.** Every UI decision should make the café feel real and grounded before it makes it feel strange. The player must care about the normal before they notice the abnormal.
2. **Restraint amplifies.** The UI does not explain or dramatize the weirdness. Unusual things appear in normal UI containers, delivered in the same dry tone as the coffee order. The dissonance is the effect.
3. **Warmth through specificity, not sweetness.** Warmth comes from texture, dark wood tones, exact typography, and precise spacing — not from pastel colors or rounded-everything.
4. **Every panel has a reason.** No chrome for chrome's sake. Each UI region (HUD, diorama, action panel, KASSANDRA terminal) earns its visual presence by serving a distinct gameplay role.
5. **Escalation is earned.** Visual shifts across the 7 days (from warm café normalcy to subtle UI glitches and strange type) should feel discovered, not designed-in-advance. The day-7 screen should feel like a different place than day-1 — but only in retrospect.

## Accessibility & Inclusion

WCAG 2.1 AA. Body text ≥ 4.5:1 contrast. Large text ≥ 3:1. Touch targets ≥ 44px. Keyboard navigation throughout with visible focus rings (currently implemented via `button:focus-visible`). `prefers-reduced-motion` alternatives for all animations. Diverse guest character design (varied skin tones, body types, backgrounds) is a core project constraint per CLAUDE.md.
