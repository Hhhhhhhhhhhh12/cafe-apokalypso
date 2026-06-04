# Quality Checklist

Codex must read this file before any implementation task.
If a task would violate a requirement here, stop and explain the conflict instead of implementing the change.

## Accessibility Baseline

- All interactive elements (buttons, inputs, selects) must be reachable by keyboard tab order.
- All interactive elements must have a visible focus indicator. Do not set `outline: none` without a custom replacement.
- No critical information may be conveyed by color alone; always pair color with a label, icon, or text.
- All buttons and controls must have an accessible label (visible text or `aria-label`).
- Contrast ratio must meet WCAG 2.1 AA: 4.5:1 for normal text, 3:1 for large text and UI components.
- The action panel and resource HUD must be operable without a mouse.
- Do not use `dangerouslySetInnerHTML` or equivalent unsafe HTML injection.

## Security Baseline

- No API keys or secrets may exist in the frontend bundle.
- No real AI API calls are allowed in the MVP. KASSANDRA is simulated only.
- No external scripts loaded at runtime (no CDN imports, no runtime eval of user data).
- No user input may be rendered as raw HTML.
- No localStorage data may be eval'd or executed.
- No external tracking, analytics, or telemetry in the MVP.

## Save-System Safety

- localStorage load must not crash if the key is missing.
- localStorage load must not crash if the saved data is null, undefined, or malformed JSON.
- Version mismatches between saved data and current game state must fall back gracefully to a clean new-game state, not a crash.
- A visible "Reset / New Game" control must be available to the player at all times.
- Game state written to localStorage must be fully serializable: no circular references, no functions, no class instances.
- The app must remain playable after a browser reload mid-game (either save loads correctly or resets cleanly).

## MVP Smoke Test

- Day 1: orders can be taken, drinks prepared, payment accepted, tables cleaned, first coffee-machine flicker appears after closing.
- Day 2: guest behavior differences are present and the day completes without errors.
- Day 3: price adjustment and daily offers panel is functional.
- Day 4: advertising panel appears and at least one advertising action is available; Herr Grau appears.
- Day 5: at least one temporary staff option (Jana, Nino, or Nele) can be hired; Meda may appear.
- Day 6: KASSANDRA update appears and displays its first message.
- Day 7: the official apocalyptic letter is delivered; the demo ends with the Day 7 cliffhanger; Frau mit rotem Regenschirm appears.
- The hidden weirdness value must not appear in the UI before the Day 7 hook.
- No JavaScript errors in the browser console during normal play through Days 1–7.
- The app survives a browser reload mid-game (save persists or resets cleanly without errors).

## Responsive Baseline

- The game must be playable on a modern desktop browser at 1280×768 or wider.
- The layout must not overflow or break at 1024px width.
- A mobile-first layout is not required for the MVP, but the layout must not be actively broken at narrower viewport widths.
- Touch targets must be at least 44×44px where interactive elements are present.
- No horizontal scrollbar should appear at the target desktop width.

## Art Review QA

- Codex/Claude Code must read `docs/ART_PIPELINE.md` and `docs/ART_STYLEGUIDE.md` before any task that touches artwork, visual placeholders, asset metadata, UI visuals, or art-related folder structure.
- Final visual assets must not be added, generated, committed, or treated as canonical without documented user review and approval.
- Major character designs require a Character Sheet in `docs/art/` before final art production.
- Day-specific visual progression requires a Level-/Day-Sheet in `docs/art/` before final art production.
- Major UI screens or visual systems require a UI Sheet in `docs/art/` before final art production.
- Recurring props, icons, café objects, and event items require an Asset Sheet in `docs/art/` before final art production.
- Moodboard-driven style decisions and weirdness-escalation changes must be documented before they are implemented as final visuals.
- Raw AI Studio / Gemini / Nano Banana image sheets must not be committed as production assets.
- Only cropped, curated, explicitly approved pilot assets may enter the repository.
- Generated gibberish text, AI-made typography, unreadable labels, or baked-in UI text must not be used as game UI.
- UI text, buttons, values, labels, menus, and status information must remain real HTML/CSS/React text.
- CSS placeholders are allowed if clearly marked and named with the `placeholder-` prefix.
- Pilot assets must have clear filenames, documented roles, and typed metadata where they are consumed by the app.
- Pilot assets must remain replaceable; the app must still render with placeholders or fallback visuals if an asset is missing.
- No critical gameplay information may rely only on small image details inside art assets.
- Claude Code/Codex may implement placeholders, typed asset metadata, folder structure, rendering components, a small local art-review workflow, and approved pilot asset integration, but must not invent canonical final character designs or change the main 3/4 café view without approval.

## Content QA

- All 6 normal guests must be present in the data: Pendlerin Paula, Laptop-Lukas, Lieferfahrer Cem, Cappuccino-Christa, Herr Bohn, Freelancerin Nele.
- All 3 subtly strange guests must be present in the data: Herr Grau, Frau mit rotem Regenschirm, Meda.
- Nele and Meda must not be merged or confused in data, code, or copy. They are separate characters.
- All 5 basic products must be present: Filterkaffee, Espresso, Cappuccino, Croissant, Kaffee + Croissant.
- KASSANDRA messages must follow the documented tone: calm, analytical, slightly wrong, oddly specific. No overt fantasy language in week 1.
- The Day 7 hook letter text must match the version documented in `docs/GAME_DESIGN.md` and `docs/CONTENT_GUIDE.md`.
- No guest, product, or event may use final art assets without review and approval by the user. CSS placeholders are allowed if clearly marked.
- Placeholder assets must be named with the `placeholder-` prefix as documented in `docs/ART_STYLEGUIDE.md`.

## Demo Release Checklist

- `npm run build` completes without errors.
- `npm run test` passes.
- `npm run typecheck` passes.
- The deployed app loads on the configured static host (GitHub Pages target) without console errors.
- The README "Play the Demo" link points to the live demo URL once deployed.
- The README includes a screenshot or short gameplay GIF once a playable build exists.
- No secrets, API keys, `.env` files, or local-only config files are committed.
- If pilot pixel-art assets are included, raw generated image sheets are excluded and only curated approved assets are committed.
- If pilot pixel-art assets are included, the app still works when those assets are missing or replaced by placeholders.
- The repository website field points to the playable demo URL.
- `.DS_Store`, `node_modules/`, and build artifacts are excluded by `.gitignore`.
- The app is distributed as a browser-playable static web app. No desktop app packaging is part of this release.

## Out of Scope

The following are explicitly out of scope for the MVP and demo release. Do not implement them.

- Audio, sound effects, or ambient music (Phase 5)
- Full final production pixel-art asset pass (Phase 5); limited curated pilot assets are allowed for the vertical slice
- Localization / i18n file migration (Phase 5)
- Mobile-first or mobile-optimized layout (Phase 5)
- Advanced animations, full 8-direction character sets, or complete sprite-sheet animation system (Phase 1+)
- Backend server, database, user accounts, authentication (never in MVP)
- Real AI API integration (never in MVP; KASSANDRA is simulated only)
- External analytics, telemetry, or tracking
- Payment systems
- Multiple café locations
- Full apocalypse-management layer
- Desktop app packaging (the demo target is browser-playable static web app only)
