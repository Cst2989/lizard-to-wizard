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

Copy `.env.example` to `.env` and fill in credentials. See **[docs/SETUP.md](docs/SETUP.md)** for a zero-to-hero step-by-step that covers Sentry signup, Axiom dataset + dashboard, Netlify deploy, and the Sentry alert rule for the level-5 webhook.

The app runs without credentials — all SDKs are no-ops when env vars are missing. You can develop UI and level logic locally, then plug in the real accounts before the workshop.

## Tests

```bash
pnpm test        # watch mode
pnpm test:run    # one-shot
pnpm typecheck
```

## Level index

| # | Concept | Tool |
|---|---------|------|
| 1 | Distributed tracing 101 | Sentry |
| 2 | Structured logs & noise | Axiom |
| 3 | Async work / linked spans | Sentry |
| 4 | Metrics & dashboards | Axiom |
| 5 | Alerts → action | Sentry + in-app inbox |
| 6 | *(bonus, hidden)* Errors & breadcrumbs | Sentry |

## Repo layout

```
lizard-scavanger/
├── src/                 # Vite + React + React Router frontend
│   ├── routes/          # Landing, Level, Inbox, About, Reset
│   ├── levels/          # Lesson + hunt + debrief content per level
│   ├── components/      # LevelLayout
│   └── lib/             # identity.ts (localStorage), api.ts
├── netlify/functions/
│   ├── _lib/            # keys, webhook, identity, blobs,
│   │                    # ratelimit, sentry, axiom, observe
│   ├── register.ts      # POST /api/register
│   ├── level-1…6.ts     # GET /api/level-N
│   ├── trigger-alert.ts # POST /api/trigger-alert
│   ├── sentry-webhook.ts# POST /api/sentry-webhook (HMAC-verified)
│   ├── inbox.ts         # GET /api/inbox
│   └── reset.ts         # POST /api/reset
├── tests/               # Vitest unit tests
└── docs/
    ├── SETUP.md         # account + deploy walkthrough
    └── superpowers/specs/   # design doc
```
