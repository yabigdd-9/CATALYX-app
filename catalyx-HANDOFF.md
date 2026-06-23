# Catalyx — Project Handoff (paste the prompt below into your new chat)

## ⬇️ PASTE THIS INTO THE NEW CHAT
> I'm continuing work on Catalyx Labs content + Claude Code skills. Read this handoff for
> full context. Right now I want to: regenerate the Instagram reel covers so they show the
> REAL official product renders (never AI-invented bottles). I'll paste public HTTPS links
> to the official renders; for each one, upload it into Canva (`upload-asset-from-url`) and
> regenerate the matching 9:16 cover with the real bottle embedded via `asset_ids`, then send
> me the new links. HARD RULE: any product shown must be the official render from
> `public/brand/official/` — never a generated/stand-in bottle. Also add that rule to
> `claude-skills/catalyx-content/reference/brand-voice.md`.

---

## What this project is
- **Catalyx Labs Grow OS** — Next.js precision-cultivation app (repo: `yabigdd-9/CATALYX-app`).
- Products: A-X PRO, B-X PRO, MICRO-X, ROOT-X, VITAL-X, PK-X, RIPEN-X, TRACE-X, IRON-X, FLUSH-X
  (source of truth: `lib/catalyx.ts`). Official renders: `public/brand/official/*.png`.

## Two Claude Code skills (built this session, installed on the Mac at ~/.claude/skills/)
- **catalyx-ops** — download files, move/organize, sync the two apps (CATALYX-app ↔
  catalyx-labs-os-app), deep-dive renames, scaffold routes. Has an "Auto mode" (mostly auto,
  safe gates: confirm before overwrite/delete; never copy secrets).
- **catalyx-content** — reel ideation, templates, and the "reel factory" (point at a folder of
  images/videos → auto-assemble a 9:16 reel; safe gates; asks file-only vs publish at the end).
  Plus "make a content week" batch mode.
- Canonical copies live in the repo at `claude-skills/`. A permissions allowlist is at
  `claude-skills/settings.json` (installed/merged to `~/.claude/settings.json`).

## KEY CONSTRAINTS / decisions
- **Only show official product renders** — never AI-invented bottles. (NEW rule from user.)
- Canva can only fetch images from a **public HTTPS URL**; local repo files aren't reachable,
  so real renders must be supplied as public links (or uploaded into Canva).
- This **web session is read-only on the repo** (git push + GitHub API both return 403), so
  nothing here can be committed/pushed from the web. Deliver via files/installers; do real
  git work locally on the Mac.
- The user's content folder (GPT images/videos) lives **on the Mac** — the reel factory runs
  there, not in the web session.
- Brand voice: confident, clean, educational; no medical/guaranteed-yield claims; "general
  cultivation guidance only, follow local laws + labels."

## PENDING TASK (do this next)
1. User pastes public links to official renders (labeled by product).
2. For each: `mcp__Canva__upload-asset-from-url` → get asset_id.
3. `mcp__Canva__generate-design` (design_type `your_story`, 9:16) with `asset_ids` to embed
   the real bottle → return new cover links.
4. Add the "official renders only" rule to `claude-skills/catalyx-content/reference/brand-voice.md`.

## OFFICIAL RENDER REFERENCE (uploaded by user — REVIEW status)
Source: `README_REVIEW.txt` + `RENDER_MANIFEST_REVIEW.csv` (+ preview/lineup images).
- **STATUS: REVIEW — NOT YET OFFICIAL.** Don't label/publish output as OFFICIAL until the user
  approves the full lineup. Once approved, these replace any AI stand-in bottles everywhere.
- Uniform set: A-X PRO & B-X PRO share one 1L geometry; the seven 250mL products share one
  identical silhouette. 1L ≈ 30% larger than 250mL on the proportional canvas. Every PNG has a
  real alpha channel.
- Two folders: "Transparent PNG - Proportional Canvas" (lineups/hero/comparison) and
  "Transparent PNG - Tight Crop" (product cards/Shopify/app). Canvas 941x1672.
  Filenames: `CATALYX_<PRODUCT>_<SIZE>_Transparent_REVIEW.png`.
- Geometry: 1L alpha bounds (281,259,644,1407); 250mL alpha bounds (335,500,606,1380).
- Accent colors: A-X PRO green · B-X PRO green · MICRO-X blue · ROOT-X teal · VITAL-X purple ·
  PK-X orange · TRACE-X yellow · RIPEN-X red · FLUSH-X blue. (IRON-X has NO render yet.)

### Two-engine cover build (use real renders, never AI bottles)
- **Adobe (local file):** `asset_add_file` render → `image_remove_background` (if needed) →
  compose 9:16 dark cover + accent glow + bottle + headline → export PNG. No public URL needed.
- **Canva (public URL):** `upload-asset-from-url` public render link → `generate-design`
  (`your_story` 9:16) with `asset_ids`.
- **Still needed to actually build:** the render image FILES must be reachable — either on disk
  (for Adobe) or at a public HTTPS URL (for Canva). Chat-inline images are neither. As of the
  last session only README + CSV were on disk; A-X PRO, B-X PRO, VITAL-X, FLUSH-X renders were
  not provided at all.

## Deliverables already produced (files sent to user)
- `catalyx-skills-v2.tar.gz` — the two skills (install: extract to ~/.claude/skills/).
- `catalyx-reel-content-pack.md` — 11 reel scripts + 4-week posting calendar.
- `catalyx-reel-editing-breakdowns.md` — per-second cut sheets for all 11 reels.

## Install commands (Mac)
```bash
mkdir -p ~/.claude/skills && tar xzf ~/Downloads/catalyx-skills-v2.tar.gz -C ~/.claude/skills
# then merge the permissions allowlist (see settings.json in claude-skills/)
```
Run the factory locally: `run the reel factory on "<content folder>" — <reel #>`

---

## All Canva cover links generated this session (48 total, 4 options each)
NOTE: these covers used AI stand-in visuals — they're being REPLACED with real-render versions.
Keep as layout references / fallbacks.

### PK-X spotlight (early–mid flower)
Jb9G1rFX8LptZan · 1k5BConEp2xrWDB · -RZVtRGN3gOK7VW · qLTVn6m45fM2SWz
### Veg stack before/after
9L225gpdEYGB09V · MEymFsBEU4Qndjw · eMbC1cg_V5ppB2G · zcNeLm4QD5S4oRJ
### FLUSH-X mistake-fix
IcOYjOyH3_4B_-_ · I-04_oAV05jV7EE · KZPrWNtKM3rA9dK · V_1jocV3W_4hdug
### ROOT-X + VITAL-X seedling
kSkg5rXtwHMIcog · hOVe-PP_zEYbOoM · 845KC-zgVf47Np4 · KQnh6wDsGbWwzwp
### A-X PRO veg base
NXOTTmqrkXS8-hE · qp-iAYaAWL_Yx_X · mkbLs08fdlS_cgq · PF_9wqBefdfeCrb
### B-X PRO veg base
j57prSK6ZUEZi5B · yvStsD5cX7KRpAK · ZlSRnRDVfiT7FIC · GaDlZxJNQNKL0_T
### MICRO-X
_zVzS4VTujBJlXS · 3i1BKZOigTumFCH · ki1z1uP8Vb5RMo0 · ofn60f3V-yL2Gp8
### VITAL-X
PEDpC77S353PK0Y · eKBg4pBhWaaZFHz · __MFrshux6Kk1tt · l7Xj8zL4ZTtXAQD
### RIPEN-X late flower
OwX_9vdXcUZQ1UD · lkpMU8M31ba9klL · 4CZVVoRkQoPWqjD · UeRxDW5tP9XHfR9
### TRACE-X
E4PlKGggNLUDI9U · hOJ5GoeSoU5ftdv · IAceiJvpRB-99fS · 3XAe6jX6j2SZ9to
### IRON-X deficiency fix
sbjUbzg245k1sM- · SAAdDpGImWZdzkK · iNvJR9l0YvHtMOJ · AMJopOwDowtjLwJ
### Week-4 PK-X mid-flower
3wX88R0zXtOaMIc · PPXxrQhIxji0GgO · F9WzVwSWwmLucP9 · eRuPuv0DyMViB45
### Week-4 A-X PRO results
0AiQOvGQlwh2LRs · A3LlxP0opTUr3kx · mFBbZLAerO-RMUf · npzoVJDnDUNegsJ

(Full URL = https://www.canva.com/d/<ID>)
