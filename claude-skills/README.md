# Catalyx Claude Code Skills

Two custom skills for Claude Code:

- **catalyx-ops** — download files, move/organize files & folders, sync the two Catalyx
  apps (CATALYX-app ↔ catalyx-labs-os-app), deep-dive codebase renames, route scaffolding.
- **catalyx-content** — reel ideas/hooks/scripts, content templates, and turning your
  GPT-generated images/videos into finished 9:16 reels.

## Install (user-level — works in every project on your Mac)

From the root of this repo on your Mac:

```bash
mkdir -p ~/.claude/skills
cp -R claude-skills/catalyx-ops claude-skills/catalyx-content ~/.claude/skills/
```

Restart Claude Code (or start a new session). The skills will appear and trigger
automatically on phrases like "sync the two apps", "rename X everywhere", or
"make me a reel from these images".

## Use only in this project instead?

Copy them into a project-level skills folder:

```bash
mkdir -p .claude/skills
cp -R claude-skills/catalyx-ops claude-skills/catalyx-content .claude/skills/
```

(Note: `.claude/` is gitignored in this repo, so the canonical copies live here in
`claude-skills/`.)
