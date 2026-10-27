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
