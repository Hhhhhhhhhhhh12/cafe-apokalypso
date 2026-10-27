# Art Review Log

## Jana — static sprite, 2026-10-27

### Scope and approval

- Asset: [`placeholder-staff-jana.png`](../../assets/sprites/guests/placeholder-staff-jana.png).
- The project owner explicitly approved the revised Jana design, then the exact 96×96 export, and authorized adding only Jana and its verification evidence to PR #177.
- Design approval and export approval: complete. Asset update in PR #177: authorized. Merge and gameplay wiring: not authorized and not performed by this change.
- This approval covers only the static Jana sprite. Jana's existing walk sheet and every other sprite are unchanged; they receive no approval from this entry. The walk sheet does not yet match the revised static design and must be reviewed separately before any gameplay use.
- Original Jana remains recoverable from PR parent commit `f100b25dd8214925db66fc6d2577a760326a1d11`.

### Export provenance

- Revised with the built-in image-generation tool using the old Jana sprite for identity and the approved Nele draft/export for style only. Nele's files are not part of this change.
- Kept Jana's dark bun, warm skin tone, white shirt, green apron and brown shoes. The final export was derived from the visually approved Jana draft without a second generation or palette replacement.
- Draft SHA-256: `22b66ffdbc758537812c54cd3b2e50a3d0109cdd7b9fa159637de0443ccfbc4d`.
- Draft canvas: 1254×1254. Crop from alpha >40: `(463, 279, 791, 1142)` (right/bottom exclusive).
- Resize the crop to 26×68 with nearest-neighbour sampling; map alpha >=128 to 255, otherwise transparent black. Place at `(35, 20)` on a transparent 96×96 canvas. No blanket deletion of light RGB values was used, preserving the white shirt and eye highlights.

### Authorized PNG verification

| Check | Result |
| --- | --- |
| PNG integrity / decoding | Passed |
| Canvas / mode | 96×96, RGBA |
| Alpha values | Only 0 and 255; zero partially transparent pixels |
| Visible bounds | `(35, 20, 61, 88)`; right/bottom exclusive |
| Opaque pixels | 1,145 |
| Active canvas-edge pixels | 0 |
| Opaque components (8-neighbour connectivity) | One; no detached opaque specks |
| Pixel edges | Nearest-neighbour export; inspected at 6× without smoothing on light and dark backgrounds |
| Final SHA-256 | `7c720041396ea4155bfdf454a6ea5538892e33662712f2b6de0c1a34c7c9fdba` |

Four one-pixel transparent regions at `(42,58)`, `(53,58)`, `(40,64)` and `(55,64)` are the intentional symmetric spaces between arms/hands and apron, visible in the approved source. They remain enclosed even under 8-neighbour connectivity. They were reviewed and preserved, not misreported as absent or filled as damaged clothing.

The owner approved the displayed 96×96 result after this check. These are file-level and visual checks only: no app tests, build, browser/runtime check or animation validation was run for this change. The commit requests CI skipping because app-test/build execution was not included in the authorization; no fresh green CI claim is made.

### Integration boundary

No rendering code, game data, workflow or dependency changes. No merge. The existing Lookbook automatically includes PNGs from this directory, so it will display the revised file when this branch is used; this is not gameplay wiring or a gameplay acceptance check. Other batch-inventory statements remain historical and are not validated by this Jana-only entry.

## Nino — static sprite, 2026-10-27

### Scope and approval

- Asset: [`placeholder-staff-nino.png`](../../assets/sprites/guests/placeholder-staff-nino.png).
- The project owner explicitly approved Nino's revised design and then the exact 96×96 export, authorizing only Nino and its verification evidence in PR #177.
- Design and export approval: complete. Asset update in this PR: authorized. Merge and gameplay wiring: not authorized and not performed by this change.
- Nino's existing walk sheet is unchanged and remains unapproved: the earlier review found floating image remnants, and the old sheet does not match this revised static design. It must be replaced/reviewed separately before gameplay use.
- Jana, Nele and all other assets are unchanged by this update. Their approvals are not expanded by this entry. The previous Nino is recoverable from parent commit `2f1f5b98521c3deddfab6fac1f0292d7c0a1127b`.

### Export provenance

- Revised with the built-in image-generation tool using the old Nino for identity and the approved Nele/Jana exports for style only. Kept the dark hair, rectangular glasses, white shirt, brown apron, navy trousers and brown shoes.
- Draft SHA-256: `1cda2b077a1c02a85168440e775bfcede17294e12358cabe6ca2223cd8bc1731`.
- Draft canvas: 1244×1264. Crop from alpha >40: `(472, 360, 771, 1170)` (right/bottom exclusive).
- Resize the approved draft crop to 25×68 with nearest-neighbour sampling; map alpha >=128 to 255, otherwise transparent black. Place at `(35, 20)` on a transparent 96×96 canvas. No new generation, palette replacement or blanket deletion of light RGB values during export.

### Authorized PNG verification

| Check | Result |
| --- | --- |
| PNG integrity / decoding | Passed |
| Canvas / mode | 96×96, RGBA |
| Alpha values | Only 0 and 255; zero partially transparent pixels |
| Visible bounds | `(35, 20, 60, 88)`; right/bottom exclusive |
| Opaque pixels | 1,159 |
| Active canvas-edge pixels | 0 |
| Opaque components (8-neighbour connectivity) | One; no detached opaque specks |
| Pixel edges | Inspected at exact 6× nearest-neighbour enlargement on light and dark backgrounds |
| Final SHA-256 | `14165b6845c49290eae7fc08c9aecc34a8bf8fa77560718e0e0744e983cce4fc` |

Four symmetric two-pixel transparent regions (`x=41/53, y=55–56` and `x=40/54, y=58–59`) are natural spaces between arms and apron, visible in the approved source. They remain enclosed under 8-neighbour connectivity and are intentionally preserved. No transparent eye, shirt or face defects were observed in the light/dark comparison.

The owner visually approved the displayed 96×96 export after these checks. Verification is limited to the PNG and source/diff inspection; no app tests, builds, runtime or animation checks were run. The commit requests CI skipping because app tests/builds were not included in the authorization; no fresh green CI claim is made.

### Integration boundary

Only Nino's static PNG, this evidence entry and its inventory reference change. No rendering code, game data, dependencies or workflows change; no merge. The existing Lookbook will automatically display the revised PNG when this branch is used, but there is no gameplay wiring. Other batch-inventory statements remain historical and are not validated by this Nino-only entry.
