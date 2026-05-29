# Moodboard Café Interior 001

## Status

Review result / working direction, not final production art.

## Source and commit discipline

This moodboard tracks visual references and art-direction decisions from Gemini Pro and Google AI Studio.

Important:
- Gemini and Google AI Studio outputs are design references, not implementation commits.
- Moodboard Markdown updates must not be mixed with unrelated code commits.
- Generated images and prompt notes may influence art direction, but they do not automatically become canonical game assets.
- The canonical art rules remain in `docs/ART_STYLEGUIDE.md` and `docs/ART_PIPELINE.md`.
- If a visual decision from this moodboard should become binding, it must be transferred explicitly into the relevant canonical docs.


Commit rule:
Keep visual-reference Markdown commits separate from gameplay, UI, engine, or build-system commits whenever possible. This prevents art exploration from confusing implementation history.

Branch rule:
Use a dedicated visual exploration branch for Gemini, Google AI Studio, moodboard, and prompt-reference work.

Recommended branch names:
- `art/moodboard-cafe-interior-001`
- `art/day1-day7-visual-progression`
- `art/google-ai-studio-gemini-references`

Do not mix this branch with Codex gameplay implementation branches. Only merge visual-reference work into `main` after the relevant findings are reviewed and, if necessary, summarized in `docs/ART_STYLEGUIDE.md` or `docs/ART_PIPELINE.md`.


## Tested tools

- Gemini Pro
- Google AI Studio image generation

## Prompt goal

Create visual directions for the main gameplay view of Café Apokalypso:
a cozy-absurd café management game with a 3/4 pixel-art diorama main view.

## Current finding

The strongest direction is a hybrid:

- Gemini Pro is better for clean gameplay layout, readable staging, and early-game structure.
- Google AI Studio is better for atmosphere, warmth, detail, and absurd escalation.

Preferred mix:

- Day 1 / clean slate: Gemini-style gameplay clarity, sparse layout, strong player readability, and clean starting room.
- Day 7 / escalation: AI-Studio-style cozy-absurd visual richness, stronger atmosphere, and more surprising apocalyptic weirdness.

Current user preference:

- Start from a clean slate because progression will feel more satisfying.
- Use Gemini as the strongest reference for early-game readability and layout.
- Use AI Studio as the strongest reference for later escalation, atmosphere, and charming visual absurdity.
- The ideal direction is not one tool over the other, but a controlled progression from Gemini-like clarity to AI-Studio-like richness.

## Approved direction so far

### Early game / Day 1

Use a clean, readable, playable café layout.

Preferred traits:
- clear room structure
- open floor space
- readable tables
- visible counter/service area
- obvious UI sidebar
- simple guest flow
- enough empty space for gameplay
- not too much decoration yet

Gemini’s Day 1 direction is currently the best reference for this.

### Later MVP / Day 7

Use richer AI-Studio-style escalation.

Preferred traits:
- warmer and more appealing pixel-art atmosphere
- denser props and café clutter
- strange but charming apocalyptic hints
- visual absurdity without horror
- mythological or bureaucratic weirdness as a clear hook
- still readable as a management game screen

AI Studio’s later-stage concepts are currently the best reference for this.

## Tool comparison notes

### Gemini Pro

Strengths:

- clearer gameplay screen composition
- stronger clean-slate feeling for Day 1
- better readable UI/sidebar logic
- better sense of where the player would look first
- better basis for movement flow and gameplay staging

Weaknesses:

- less atmospheric and less visually rich than AI Studio
- can feel more like a schematic game mockup than a polished visual direction
- later escalation is less charming and less surprising than AI Studio

Recent Day 1 test note:

- Gemini eventually produced a strong Day-1-style clean-slate reference after earlier generation errors.
- This image is a good reference for early-game readability, especially the sparse room, clear right-side UI, obvious café counter, and open floor space.
- The result feels more like a playable management screen than a polished mood illustration.
- It is less visually charming than AI Studio, but better for gameplay structure.
- The right-side UI is useful as a layout reference, but generated UI text and values must not be used directly.
- The room is perhaps too empty and slightly too generic, so future versions should add more warmth and personality without losing the clean-slate feeling.

### Google AI Studio

Strengths:

- stronger mood, warmth, and appeal
- more detailed and charming pixel-art atmosphere
- much better cozy-absurd escalation for later days
- stronger surprising elements: portals, strange devices, mythological or bureaucratic anomalies
- better reference for how the café can become visually delightful and weird

Weaknesses:

- early-game versions can already be too dense
- composition can become crowded
- gameplay readability is weaker than Gemini’s clean layout
- generated UI text and labels are not usable directly

Recent Day 7 test note:

- AI Studio produced a strong Day-7-style reference with bureaucracy, a portal, a minotaur guest, wall notices, a visible obligation/status UI, and cozy-apocalyptic atmosphere.
- This is a good reference for later MVP escalation, especially the combination of bureaucracy and impossible café events.
- The image is not final art and should not be copied directly.
- Generated text contains errors and must not be used as actual UI copy.
- Composition is atmospheric, but future tests should preserve more of the clean Day-1 room logic so the café feels like the same place over time.

### Working synthesis

Use Gemini for structure when it is available and stable. Use AI Studio for soul.

Gemini produced a useful Day-1 clean-slate reference after several generation errors. It should remain a layout and readability reference, but the workflow should not depend on Gemini being consistently available.

If Gemini keeps returning generation errors, do not block the art process. Use the strongest Gemini Day-1 reference for clean structure and continue current visual exploration in AI Studio.

The first MVP week should feel like one café evolving over time, not like unrelated individual images. The visual direction should preserve the same room logic while increasing clutter, weirdness, and apocalyptic hints.

## Layout decision candidate

The main café view should support clear gameplay readability:

- 3/4 diorama view
- two visible walls
- counter/service zone should be easy to locate
- guest movement should be readable
- UI may live as a right-side vertical sidebar
- café logo/title area may sit top-left
- early game should start visually sparse enough to feel like a clean slate

## Visual escalation direction

The café should evolve visually from:

1. Day 1: Clean normal café / fresh start / low clutter
2. Day 3: Small strange details / barely suspicious objects or behavior
3. Day 5: Bureaucratic oddities / forms, notices, compliance pressure, odd devices
4. Day 7: Cozy-apocalyptic hook / one unmistakable impossible event while the café remains playable

Do not start with the visually overloaded version. The early game should leave room for progression.

## Approved elements

- warm café palette
- pixel-art 3/4 diorama
- cozy wooden interior
- right-side UI sidebar
- title/logo area top-left
- clear counter/service area
- visible tables and guest zones
- progressive visual weirdness
- plants, shelves, cups, menu boards, coffee gear
- strange signs, forms, devices, portals, or mythological guests later

## Rejected or caution

- do not use generated text directly as UI text
- avoid gibberish labels
- avoid too much late-game chaos in Day 1
- avoid side-view
- avoid photorealism
- avoid generic mobile-game polish
- avoid dark horror apocalypse
- avoid making Day 7 unreadable
- do not treat generated images as final assets

## Tool preference

Current working preference:

- Gemini Pro for layout and early gameplay readability.
- Google AI Studio for atmosphere, polish, and weirdness escalation.
- ChatGPT for art direction, prompts, review, and documentation.
- Codex only after direction is approved and implementation is needed.

## Next art test

Create two focused references instead of another broad moodboard batch.

### Test A: Day 1 Clean Slate

Goal:

- establish the clean starting café
- readable gameplay layout
- low clutter
- clear counter/service area
- simple left-to-right guest flow
- right-side UI/sidebar logic
- enough empty space for later progression

Primary tool/reference:

- Gemini Pro if stable
- current Gemini Day-1 image as layout and readability reference
- otherwise: use the current Gemini Day-1 reference as fixed layout reference, with new tests in AI Studio

Prompt:

```txt
Create one main gameplay view for “Café Apokalypso”.

Day 1: normal opening, clean slate.

Use a clear, readable 3/4 isometric pixel-art café diorama.

Layout:
- two visible walls
- counter/service area on the right or back-right
- guests enter from the left and move toward the counter
- seating area in the center and lower-left
- enough empty floor space for gameplay readability
- UI sidebar on the right edge
- café logo area top-left

Tone:
- cozy, warm, inviting
- early-game normal café
- no weirdness yet, except maybe one tiny almost unnoticeable odd detail
- no horror
- no cyberpunk
- no photorealism
- no poster layout
- should look like an actual playable management game screen
```

### Test B: Day 7 Same Café, Escalated

Goal:

- preserve the same room logic as Day 1
- add the first clear cozy-apocalyptic hook
- increase detail and visual delight without losing readability
- show that the café has become stranger, not replaced by a different scene

Primary tool/reference:

- Google AI Studio

Prompt:

```txt
Create one main gameplay view for “Café Apokalypso”.

Day 7: same café layout as a clean early-game 3/4 isometric pixel-art management screen, but now with the first clear cozy-apocalyptic hook.

Keep the same basic room logic:
- two visible walls
- counter/service area on the right or back-right
- guests enter from the left and move toward the counter
- seating area in the center and lower-left
- UI sidebar on the right edge
- café logo area top-left

Escalation:
- warm cozy café atmosphere
- richer details and charming clutter
- one clear apocalyptic hook
- strange bureaucracy, AI-oracle object, mythological hint, or impossible portal
- absurd and funny, not horror
- readable as an actual game screen
- no dark destruction
- no photorealism
- no side-view
```

Success question:

Can Day 1 and Day 7 plausibly be the same game and the same café, only evolved over time?
