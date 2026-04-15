# Lizard Scavenger — SRE Observability Workshop Hunt

**Date:** 2026-04-15
**Status:** Approved (brainstorming complete; ready for implementation planning)

## Purpose

A 45–60 minute workshop game that teaches observability fundamentals — distributed traces, structured logs, async/linked spans, metrics, dashboards, and alerts — by making attendees hunt for keys hidden inside real telemetry signals. Modeled after the Rover SRE Scavenger Hunt, scaled down for a one-room workshop.

The goal is **transferable skill**, not entertainment alone: by the end, attendees have used Sentry and Axiom hands-on the same way they would on call.

## Audience & Workshop Shape

- ~5–30 attendees in one room, in front of laptops.
- Single facilitator (the host).
- One shared Sentry login and one shared Axiom login distributed at the start. **Noise is the pedagogy** — every attendee's events land in the same project; learning to filter to your own signals is the lesson.
- No facilitator dashboard. Stuck attendees ask out loud; the host filters by their display name.

## Stack

- **Frontend:** Vite + React 19, deployed as a static site on Netlify.
- **Backend:** Netlify Functions (Node 20 runtime).
- **Storage:** Netlify Blobs (per-attendee inbox + name registry + rate-limit counters).
- **Telemetry:**
  - **Sentry** — traces, errors, custom span attributes, alert rules, webhook.
  - **Axiom** — structured logs and the dashboard for the metrics level.
- **Hosting:** all on Netlify, single repo, single deploy.

## Identity & Progression

### Display name
- Landing page asks for a display name; slugified to `[a-z0-9-]`, length 3–20.
- Stored in `localStorage` and also passed as a query param on every level URL (so a fresh tab still works).
- Tagged on every Sentry span and every Axiom log as `attendee=<name>`.
- Collisions: the server checks a `names/<slug>` Blob; if taken, suggests `<name>-2`, `<name>-3`, etc.

### URL+key flow (Rover style)
- URL shape: `/level/:n/:key` — solving level N hands the attendee the key for level N+1.
- **Per-attendee, deterministic key derivation:**
  ```
  key(level, attendee) = hmacSha256(WORKSHOP_SECRET, `${attendee}:${level}`).slice(0, 8)
  ```
  Same input → same output, no DB needed for "is this the right key". Attendees can't share keys with each other because each attendee's keys are different.
- **Wrong key:** friendly "Try again" page. After 3 wrong tries → small hint. After 5 → more direct hint.
- **Correct key:** lesson page → `Start hunting` button → server emits the level's signals → attendee finds next key → enters URL.

### Per-level page structure
Every level page has 3 phases:
1. **Lesson** — 3–4 sentences explaining the concept; a 1-screenshot hint of the tool. ~60 sec read.
2. **Hunt** — instructions on what to search and where; a `Start hunting` button that emits the signals.
3. **Debrief** (after the next key is accepted) — ✅ congrats + 3 bullets: "what you used", "how it scales", "real-world tip".

### Progress storage
- **Client:** `localStorage` keys `attendee_name`, `current_level`, `unlocked_keys[]`.
- **Server:** Blob `progress/<attendee>` records `furthestLevel` + `completedAt` for each level. Used only by the bonus L6 unlock check.
- **Reset:** `/reset?name=<n>` wipes both.

## Level Catalog

| # | Concept | Server emits | Attendee task |
|---|---------|--------------|---------------|
| **1** | Distributed tracing 101 | Sentry transaction `scavenger.level.1`; root span tagged `attendee, level=1, key=<L2_key>` | Page renders trace ID → open Sentry Traces → search trace ID → read `key` attribute on span |
| **2** | Structured logs & noise | Axiom: nginx-style request log + an app log per hit, tagged `attendee, trace_id`. Decoy logs from other attendees provide the noise. | Axiom query: find your level-2 URL → grab `trace_id` → find log line containing `"L3 key:"` |
| **3** | Async / linked spans | Parent span → enqueue span → delayed worker span (faked: `setTimeout(2000)` then self-fetch). Key split into 3 fragments across span attributes. | In Sentry, expand the trace, find each of 3 spans, concatenate fragments |
| **4** | Metrics & dashboards | Axiom log `{metric:"lucky_number", value:<L5_key_digits>, attendee, level:4}` per page hit. Pre-built Axiom dashboard with one bar-chart widget grouping `latest(value)` by `attendee`. | Open dashboard → filter to their `attendee` tag → read the value next to their name |
| **5** | Alerts → action | `POST /api/trigger-alert` → Sentry event tagged `scavenger_alert=true, attendee=<name>` → Sentry alert rule webhooks `/api/sentry-webhook` → writes Blob `inbox/<attendee>` | Hit `/api/trigger-alert` → watch `/inbox/:name` populate within ~30s → final congrats |
| **6** | *(bonus, hidden)* Errors & breadcrumbs | A page that throws a deliberate exception with breadcrumbs seeded with the key | Open Sentry Issues → find your error → read the breadcrumb log |

## Architecture

```
┌─────────────────────────┐
│  Vite + React (static)  │  ← Netlify CDN
└────────────┬────────────┘
             │ /api/*
┌────────────▼────────────┐
│   Netlify Functions     │  Sentry SDK (traces, errors)
│    (serverless)         │  Axiom SDK (structured logs)
└────────────┬────────────┘
             │
     ┌───────┴────────┐
     │ Netlify Blobs  │  inbox/<name>, progress/<name>,
     │                │  names/<slug>, ratelimit/<name>
     └────────────────┘

Sentry Alert ── HMAC-signed webhook ──▶ /api/sentry-webhook ──▶ Blob.write(inbox/<name>)
```

### Instrumentation contract

Every Netlify Function uses the same wrapper:

```ts
// netlify/functions/_lib/observe.ts
export const handler = withObservability(async (req, ctx) => {
  const { attendee, level } = ctx;
  ctx.span.setAttributes({ attendee, level });
  ctx.log.info('handling level', { attendee, level });
  // ... level-specific logic ...
  return { statusCode: 200, body: ... };
});
```

`withObservability` does:
1. Start a Sentry transaction (`scavenger.level.<n>`); set `attendee` and `level` tags on the scope; capture exceptions automatically.
2. Push a structured log to Axiom: `{ ts, attendee, level, trace_id, sentry_trace_id, msg, ...rest }`. The `trace_id` matches Sentry's — that's the bridge that lets attendees jump from log to trace.
3. **Failure isolation:** if Sentry or Axiom is down, requests still succeed. Telemetry is best-effort, never blocking.

### Per-level flows

```
L1: GET /api/level/1
    → emits trace with key in span attribute

L2: GET /api/level/2
    → emits 2 Axiom logs (nginx-style + app)
    → app log contains "L3 key: <key>"

L3: GET /api/level/3
    → starts parent span; returns "queued"
    → setTimeout(2000) → self-fetch /api/level/3/worker
    → worker emits child span with last key fragment

L4: GET /api/level/4
    → emits Axiom log {metric, value, attendee}
    → response includes Axiom dashboard URL

L5: POST /api/trigger-alert
    → captures Sentry event tagged scavenger_alert=true
    → (Sentry alert rule fires)
    → POST /api/sentry-webhook (HMAC-verified)
    → writes Blob inbox/<attendee> = {key, ts}

GET /api/inbox/:name
    → reads Blob, renders messages
```

### Sentry webhook security
- Sentry signs webhook payloads with HMAC-SHA256 of `SENTRY_WEBHOOK_SECRET`.
- We verify the signature **before** writing to any blob.
- Without verification, an attendee could `curl /api/sentry-webhook` to skip L5.

### Frontend routes
- `/` — signup (display name)
- `/level/:n/:key` — lesson + hunt for level N
- `/inbox/:name` — alert delivery for L5
- `/reset` — wipe localStorage + blob
- `/about` — shared Sentry & Axiom logins, workshop links

One shared `<LevelLayout>` component renders **lesson → hunt instructions → key input → debrief**.

## Limits, Errors, Ops

### Rate limiting
- Per-attendee: max **30 level-page hits/min** (Blob counter, sliding window). Beyond → 429 with friendly "slow down" page. Stops brute-force key guessing.
- `/api/trigger-alert`: max **3/min per attendee** (Sentry alert quota protection).

### Failure modes & mitigations
| Failure | What we do |
|---|---|
| Sentry down | Page renders; lesson tells them "Sentry is degraded — see #help" |
| Axiom down | Lesson page shows a banner "Axiom is degraded — using fallback log viewer" and a link to `/debug/axiom-fallback`, an emergency-only page (NOT a teaching surface) showing the last 50 events from an in-memory ring buffer. Workshop continues; we debrief that this is exactly what happens in real outages |
| Webhook never fires (L5) | After 60s, inbox page shows a "Resend key" button that re-emits the Sentry event |
| Function cold start | Pre-warm with `/api/health` ping from the landing page on load |

### Environment variables (Netlify dashboard)
```
SENTRY_DSN              public, also used by frontend SDK
SENTRY_ORG_SLUG         for trace deep-link generation
SENTRY_WEBHOOK_SECRET   verifies inbound webhook
AXIOM_TOKEN             write token
AXIOM_DATASET           e.g., 'scavenger-prod'
AXIOM_QUERY_TOKEN       read-only, for dashboard deep-link
WORKSHOP_SECRET         HMAC seed for per-attendee keys
SHARED_SENTRY_LOGIN     shown on /about
SHARED_AXIOM_LOGIN      shown on /about
```

## Testing Strategy

- **Unit (Vitest):** key derivation, signature verification, rate-limit math, level-key validators. Pure functions, fast.
- **Integration (Vitest + supertest against `netlify dev`):** each level handler emits the expected Sentry span attributes and Axiom log fields. SDKs are mocked; we assert call shapes.
- **E2E (Playwright):** scripted attendee runs through L1→L5 against a local stack. CI gate on every PR.
- **Pre-workshop smoke (`pnpm smoke`):** runs all levels as 3 fake attendees in parallel against the deployed Netlify URL. Must pass the morning of the workshop.

## Pre-Workshop Checklist (in README)

1. Create Sentry project; configure alert rule + webhook URL pointing at `/.netlify/functions/sentry-webhook`.
2. Create Axiom dataset; build the L4 dashboard; mint a query token.
3. Deploy to Netlify; set all env vars.
4. Run `pnpm smoke`.
5. Print the `/about` URL (with shared logins) on a slide for attendees.

## Out of Scope (YAGNI)

- Facilitator dashboard
- Email delivery for alerts (in-app inbox replaces it)
- Per-attendee Sentry projects
- Persistent leaderboard / cross-workshop history
- Real queue (BullMQ/SQS) — `setTimeout` self-fetch teaches the same trace shape
- Custom log search UI (Axiom is the teaching tool)
- Multi-workshop tenancy
