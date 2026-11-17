# Character sheets · off-duty cast

Baseline checked 2026-11-17 against main `cc4bfc4`. The user then approved all
four boards and instructed autonomous adoption, preserving the diorama and seats.
This approves the shown designs, not new narrative lore.

## Direction and authority

The user requested original video-game heroes after work: unarmed, understated,
recognizable as individuals rather than franchise costumes. The approved Lukas
standing counterpart is the shared style reference. Preserve varied skin tones,
ages and body shapes. Compare detail and proportions in the actual compact café,
not only in enlarged concept illustrations.

- **Approved:** the compact room and six existing seated poses, reconfirmed for
  Days 1–7; Lukas's shown standing counterpart accepted on 2026-11-17.
- **Approved on 2026-11-17:** all four [collected boards](OFF_DUTY_CAST_REVIEW_20261117.md).
  Eleven standing guests and three staff portraits are derived as transparent
  individual assets; see [provenance](OFF_DUTY_ASSET_PROVENANCE.json).
  New seating poses, animation frames and lore reveals were not part of the boards.
- **Retained baseline:** existing seated sprites and Bohn's other age variants
  remain unchanged; old sprite files remain available as references.
- **Canon:** [PROJECT_CANON](../PROJECT_CANON.md). Guest IDs/appearance timing:
  `src/game/data/guests.ts` and `src/game/data/days.ts`. Do not derive timing or
  biographies from the historical June roster.

## Guest identity references

All filenames below are under `assets/sprites/guests/`. The named file is the
identity reference, not necessarily the current standing runtime sprite.
“Board” refers to the approved collection, left-to-right order.

| Figure / runtime ID | Identity to retain | Reference filename | Approved board |
| --- | --- | --- | --- |
| Kemal / `pendler-kemal` | Broad build, brown skin, short dark hair and full beard, navy padded jacket | `placeholder-guest-kemal-v02-approved-style.png` | 1, first |
| Commuter Paula / `pendlerin-paula` | Brown bun, mustard jacket, cream shirt, practical shoulder bag | `placeholder-guest-paula-v02-approved-style.png` | 1, second |
| Fatou / `pendlerin-fatou` | Long dark hair, warm medium skin, burgundy sweater, jeans, turquoise earring | `placeholder-guest-fatou-seated-v02-front-candidate.png` | 1, third |
| Cem / `lieferfahrer-cem` | Short stocky silhouette, brown skin, olive/rust workwear; distinct from Kemal | `placeholder-guest-cem.png` | 1, fourth |
| Mira / `nachbarin-mira` | Warm brown skin, chestnut curls, teal knit, jeans | `placeholder-guest-mira-seated-v02-back-review.png` | 2, first |
| Christa / `cappuccino-christa` | Mature fuller build, auburn bob, pearl earrings, burgundy/gold wrap and cream collar | `placeholder-guest-christa-seated-v04-outfit-review.png` | 2, second |
| Nele / `freelancerin-nele` | Long copper hair, olive-grey jacket, cream top, grounded expression | `placeholder-guest-nele-seated-v04-quiet-review.png` | 2, third |
| Meda / `meda` | Deep warm skin, dark curls, dark glasses, teal dress, avoidance of eye contact | `placeholder-guest-meda-seated-v02-back-review.png` | 2, fourth |
| Bohn / `herr-bohn` | Preserve identity through all age variants; oldest has white side hair and warm vest | `placeholder-guest-bohn-oldest-standing.png` | 3, first; oldest only |
| Herr Grau / `herr-grau` | Older, balding, subdued grey/olive formalwear, odd coin | `placeholder-guest-grau.png` | 3, second |
| Red umbrella woman / `frau-roter-regenschirm` | Dark clothing/hair, reserved expression, red umbrella partly shading face | `placeholder-guest-roter-regenschirm.png` | 3, third |

Lukas / `laptop-lukas`: see [approved Lukas sheet](LUKAS_OFF_DUTY.md).
The production standing asset is
`placeholder-guest-lukas-standing-v03-off-duty-approved.png`; seated reference
remains `placeholder-guest-lukas-seated-v02-front-review.png`. His approved navy
jacket does not authorize changing the seated pose or chair automatically.

Commuter Paula is the runtime guest ID above. Do not transfer this guest's
wardrobe, dialogue or history to the owner/player Paula; the owner's intentional
blank past remains canon. Nele and Meda are distinct identities. Nele's blank
KASSANDRA classification is intentional.

## Staff wardrobe references

| Figure | Installed reference | Approved collection / boundary |
| --- | --- | --- |
| Jana | `placeholder-staff-jana.png` | Board 4, first: dark bun, white shirt and green apron retained |
| Nino | `placeholder-staff-nino.png` | Board 4, second: dark hair, glasses, white shirt and brown apron retained |
| Nele | `placeholder-staff-nele.png` | Board 4, third: approved long copper hair matches guest Nele; replaces the old staff bob |

These are workwear variants, not new people. The artwork proposal does not
change helper pricing, job unlocks, station positions or service bonuses.

## Pose and placement constraints

The actual source is `src/game/data/approvedSeats.ts`; the positions below record
its current contract. Coordinates refer to the 1254×1254 source canvas.

| Figure | Table / chair | Contact point |
| --- | --- | --- |
| Meda | left / back | 590, 790 |
| Lukas | left / front | 730, 800 |
| Mira | right / back | 590, 830 |
| Christa | right / front | 760, 823 |
| Nele | back / back | 590, 830 |
| Fatou | back / front | 760, 823 |

Keep these approved seated assets and anchors. Prepare a new transparent standing
pose only after the corresponding design is selected. Any later seated wardrobe
adaptation must preserve pose/contact and be compared with the approved version
in the café. Do not extract an entire concept board as a production sprite sheet.
Bohn's `grey-temples`, `mature`, `silver` and `oldest` variants remain distinct;
Board 3 is not approval to collapse them to one age.

## Integration verification

All 14 individual cutouts are in `assets/sprites/guests/`, with original Imagegen
outputs copied unchanged. CSS fits them inside the existing room slots; helper
artwork is now proportional and sized consistently with guests. Room geometry,
seated poses and chair anchors remain unchanged. The actual café view, service
transitions, reduced motion, portrait loading and seat contacts are checked as
one bounded package. No new native build or publication is implied.

Technical checks do not establish that the first week is enjoyable or that its
ending invites Day 8. That overall play impression remains a human review, separate
from the already documented functional week-one run.
