# Catalyx AI setup

Catalyx Copilot works for everyone with the rule engine. Live OpenAI output activates when `OPENAI_API_KEY` is set in the server environment.

## Environment

```bash
OPENAI_API_KEY=sk-proj_...
OPENAI_MODEL=gpt-5.2
```

`OPENAI_API_KEY` must stay server-only. Do not prefix it with `NEXT_PUBLIC_`.

## Evidence sources

The Copilot panel prefers Supabase-backed data when available:

- active grow profile
- recent feed logs
- recent environment logs

If Supabase data is missing or the user is signed out, the panel falls back to local saved logs. If `OPENAI_API_KEY` is missing or OpenAI returns invalid output, the rule engine returns the same JSON shape so the UI does not break.
