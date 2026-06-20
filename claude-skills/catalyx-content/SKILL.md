---
name: catalyx-content
description: >-
  Catalyx Labs reels and social content. Use when the user wants reel/short-video ideas,
  hooks, captions, scripts, a content calendar, or wants to turn GPT-generated images and
  videos into a finished reel. Triggers on phrases like "ideas for reels", "give me a reel
  hook", "write a caption", "content calendar", "make me a reel from these images/videos",
  "turn these clips into a reel", "edit this into a short".
---

# Catalyx Content

Marketing-content workflows for Catalyx Labs (precision cultivation / plant nutrition).
Read `reference/brand-voice.md` first so everything stays on-brand and on the right side of
the legal note. Use the files in `templates/` as the output shape.

## 1. Reel ideation (ideas, hooks, scripts)

When the user wants ideas or a script:
1. Ask (or infer) the **angle**: which product or grow stage, and the goal (educate, show
   results, build trust, sell). Product + stage data lives in `lib/catalyx.ts`.
2. Produce, using `templates/reel-script.md`:
   - **Hook** (first 2 seconds — a question, bold claim, or before/after).
   - **Beats / shot list** (3–6 quick shots with what's on screen).
   - **On-screen text** per beat.
   - **Caption** + **CTA** + **hashtags**.
   - Suggested **length** (15–30s) and **posting slot**.
3. Offer 3 distinct concepts unless the user wants one. Keep claims educational, never
   medical or guaranteed-yield (see brand voice + legal note).

Good recurring formats for this brand: before/after grow results, "stop doing X to your
plants", feed-schedule explainers, product spotlight, common-mistake fixes, day-in-a-grow.

## 2. Templates

Fill these in rather than writing from scratch:
- `templates/reel-script.md` — single reel (hook / beats / on-screen text / caption / CTA).
- `templates/content-calendar.md` — a week of posts with formats and cadence.

Copy the template, fill the blanks, and hand the user the finished version.

## 3. GPT-media → reels (assembly)

Turn the user's AI-generated images/videos into a finished vertical reel (9:16).

1. **Locate the assets.** Ask for the local folder path, or pull from Google Drive
   (search for the `mcp__Google_Drive__*` tools via ToolSearch). List what you found
   and confirm the set + order with the user.
2. **Plan the cut.** Map assets to a script/beats (section 1). Confirm sequence, captions,
   and any music/voiceover direction.
3. **Assemble.** The design/video MCP tools load per session — find them at runtime with
   ToolSearch (do not assume they're loaded). Useful queries:
   - `ToolSearch "video quick cut render"` → Adobe `video_create_quick_cut`, `video_render`,
     `video_resize`, `video_render_frame` (call `adobe_mandatory_init` first per its rules).
   - `ToolSearch "canva design export"` → Canva `generate-design`, `upload-asset-from-url`,
     `export-design`.
   - `ToolSearch "image edit background"` → Adobe `image_*` (crop to 9:16, remove bg, etc.).
   Build a 9:16 sequence, add the captions/on-screen text from the script, render.
4. **Deliver.** Save/export the finished reel, report the path, and surface it with
   SendUserFile. **Confirm before any external publish/export** — exporting sends content out.
5. **Organize the output.** Offer to file the export with the `catalyx-ops` move workflow.

## 4. (Extra) Repurpose

- **Cover frame / thumbnail**: pull a strong frame (`video_render_frame`) or design a cover.
- **Carousel from a reel**: turn one reel's beats into a 3–6 slide carousel + caption set.

Always keep the voice and claims aligned with `reference/brand-voice.md`.
