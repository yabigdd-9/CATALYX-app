---
name: catalyx-ops
description: >-
  Catalyx dev and file operations. Use when the user wants to download files,
  move or organize files and folders, keep the two Catalyx apps in sync (CATALYX-app
  and catalyx-labs-os-app / catalyx-labs-grow-os), or do a deep-dive codebase-wide
  rename. Triggers on phrases like "download this", "move these files", "organize my
  folders", "sync the two apps", "make the apps the same", "rename X to Y everywhere",
  "rename across the app", "scaffold a new page/route".
---

# Catalyx Ops

Dev and file-management workflows for the Catalyx Labs project. Pick the section that
matches what the user asked for. **Always look before you overwrite or delete** — show
the user what will change and get a yes before destructive steps.

## 1. Download files

1. Confirm the destination folder. If it doesn't exist, create it (`mkdir -p`).
2. Download with `curl -L -o <dest>/<filename> <url>` (or `wget`).
3. Report the final path and file size (`ls -lh`). For archives, ask before unzipping.

## 2. Move / organize files and folders

1. `ls -la` the source and the destination first so you know what's there.
2. Show a **dry-run plan**: list exactly what moves where. For bulk moves use
   `rsync -av --dry-run <src>/ <dest>/` and show the output.
3. Get confirmation. Then run the real `mv` / `rsync -av`.
4. If a destination file already exists, **never silently overwrite** — show both and ask.
5. Never delete the only copy of something without explicit confirmation.

## 3. Sync the two Catalyx apps

Goal: make `CATALYX-app` and `catalyx-labs-os-app` (a.k.a. `catalyx-labs-grow-os`) match.
Both are local folders on the user's Mac.

1. **Get both paths.** Default one to the current repo; ask the user for the other path.
2. **Ask which is the source of truth** (which app's version "wins") before changing anything.
3. **Diff them**, excluding noise:
   ```bash
   diff -rq <appA> <appB> \
     -x node_modules -x .git -x .next -x dist -x build -x .DS_Store
   ```
   For per-file content diffs use `git diff --no-index <appA>/<file> <appB>/<file>`.
4. **Summarize the drift by area** (e.g. "package.json differs", "app/feed-calculator differs",
   "3 files only in app B"). Don't dump raw diff — explain it.
5. **Reconcile** in the chosen direction with a dry-run first:
   ```bash
   rsync -av --dry-run --exclude node_modules --exclude .git --exclude .next \
     <source>/ <target>/
   ```
   Show it, get confirmation, then run for real (drop `--dry-run`).
6. **Re-diff** (step 3) to confirm the two are now identical. Report what changed.

Note: keep each app's own git history/`.env*` intact — exclude `.git` and never copy secrets
between repos unless asked.

## 4. Deep-dive rename across the app

Consistent codebase-wide renames (brand terms, product names — see the A-X PRO / B-X PRO
lineup in `lib/catalyx.ts` — routes, component or identifier names).

1. **Find every occurrence** before changing anything:
   - Code & strings: `Grep` for the term (case-sensitive and a case-insensitive pass).
   - Filenames/paths: `Glob` / `ls` for files or folders named after the term.
2. **Show counts per file** and flag risky spots (routes under `app/`, public strings, types).
   Watch for casing variants: `A-X PRO`, `a-x-pro`, `axPro`, `AXPro`.
3. **Apply**: use `Edit` with `replace_all` per file; rename files/folders with `git mv`.
   Update imports/route references that point at renamed paths.
4. **Verify nothing is left**: re-`Grep` the old term — expect zero results (or only
   intentional ones you call out).
5. **Build-check**: `npm run typecheck && npm run build`. Fix any breakage from the rename.

## 5. (Extra) Scaffold a new page / route

When asked to add a page, match the existing `app/` App Router conventions:
1. Look at a sibling route (e.g. `app/feed-calculator/`) for the file/layout pattern.
2. Create `app/<route>/page.tsx` following that pattern; add it to nav if the siblings are.
3. Reuse helpers from `lib/` (e.g. `lib/catalyx.ts`) rather than re-deriving data.
4. Run the verify step below.

## Verify before committing

Reusable check after any code change:
```bash
npm run typecheck && npm run build
```
Only commit/push when the user asks.
