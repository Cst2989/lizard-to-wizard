# 🦎 Lizard Scavenger

An observability workshop game. Five levels hunting for keys hidden in real telemetry (Sentry + Axiom). Hosted on Netlify.

See `docs/superpowers/specs/2026-04-15-lizard-scavenger-design.md` for the full design.

## Dev

Requires Node 20 and pnpm.

```bash
pnpm install
pnpm dev       # runs netlify dev (frontend + functions)
# or
pnpm dev:web   # just the Vite frontend
```

## Env vars

Copy `.env.example` to `.env` and fill in credentials. A step-by-step setup guide (`docs/SETUP.md`) will walk you through creating the Sentry and Axiom accounts.

## Tests

```bash
pnpm test        # watch mode
pnpm test:run    # one-shot
pnpm typecheck
```
