# Catalyx Labs — Brand Voice & Facts

Use this as the source of truth for tone and product facts when writing content.

## Who it's for
Cultivators who want precision: dialed-in feeding, fewer mistakes, better results.
Range from beginners to professional growers.

## Voice
- Confident, clean, precise — "precision cultivation ecosystem."
- Educational and practical, not hypey. Teach something in every post.
- Encouraging, never condescending. Speak to growers as serious operators.
- Short, punchy lines. Plain language over jargon (explain jargon when used).

## Do
- Show real results and clear before/afters.
- Tie advice to a stage or a product where it fits naturally.
- Use specifics (stage, dose logic, what to watch for).

## Don't
- No medical claims, no "cures," no guaranteed-yield promises.
- No legal advice. Don't imply anything is legal everywhere.
- Don't overstate — keep claims to general cultivation/nutrition guidance.

## Legal note (always honor)
The app and content provide **general cultivation and plant-nutrition guidance only**.
Users are responsible for following all local laws and product label directions. Keep
content consistent with this.

## Products (from `lib/catalyx.ts`)
A-X PRO, B-X PRO, MICRO-X, ROOT-X, VITAL-X, PK-X, RIPEN-X, TRACE-X, IRON-X, FLUSH-X.
(Keys: `ax-pro`, `bx-pro`, `micro-x`, `root-x`, `vital-x`, `pk-x`, `ripen-x`, `trace-x`,
`iron-x`, `flush-x`.)

## Product imagery — OFFICIAL RENDERS ONLY (hard rule)
When any piece of content shows a product, it MUST use the official Catalyx render —
**never** an AI-generated, invented, or stand-in bottle. If no official render is available
for a product, leave the bottle out (use stage/plant/texture visuals) rather than fabricate one.

Render set source: `public/brand/official/` (status `REVIEW — NOT YET OFFICIAL` until the full
lineup is approved — do not label or publish output as OFFICIAL before sign-off).
- **Geometry classes** (canvas 941x1672, true alpha channel on every PNG):
  - 1L — A-X PRO, B-X PRO — alpha bounds (281, 259, 644, 1407).
  - 250mL — MICRO-X, ROOT-X, VITAL-X, PK-X, TRACE-X, RIPEN-X, FLUSH-X — alpha bounds (335, 500, 606, 1380).
  - 1L is ≈30% larger than 250mL on the proportional canvas — preserve relative scale in lineups.
- **Folders:** "Transparent PNG - Proportional Canvas" (lineups/hero/comparison, accurate scale)
  · "Transparent PNG - Tight Crop" (product cards / Shopify tiles / app catalogue).
- **Accent color per product** (match the render's glow on covers/overlays):
  A-X PRO green · B-X PRO green · MICRO-X blue · ROOT-X teal · VITAL-X purple · PK-X orange ·
  TRACE-X yellow · RIPEN-X red · FLUSH-X blue.
- **Filename pattern:** `CATALYX_<PRODUCT>_<SIZE>_Transparent_REVIEW.png`.
- Note: IRON-X appears in `lib/catalyx.ts` but is NOT in the current render set — no official
  render yet, so don't show an IRON-X bottle until one is supplied.

### Building covers with the real render
- **Adobe (local file):** `asset_add_file` the render PNG → (if it has a background) `image_remove_background`
  → compose 9:16 dark cover + accent glow + the real bottle + headline.
- **Canva (public URL):** `upload-asset-from-url` the render's public link → `generate-design`
  (`your_story`, 9:16) embedding it via `asset_ids`.
- Either way: real bottle in, no fabricated bottle.

## Grow stages → recommended products
- **Seedling**: ROOT-X, VITAL-X
- **Vegetative**: A-X PRO, B-X PRO, MICRO-X, ROOT-X
- **Early Flower**: PK-X, TRACE-X
- **Mid Flower**: PK-X, VITAL-X
- **Late Flower**: RIPEN-X, TRACE-X
- **Flush**: FLUSH-X

## Handy hashtag pool (trim to ~5–10 per post)
#catalyxlabs #precisioncultivation #growtips #plantnutrition #feedingschedule
#growjournal #cultivation #homegrow #growbetter
