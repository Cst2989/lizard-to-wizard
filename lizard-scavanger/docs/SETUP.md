# Setup Guide

Step-by-step to get Lizard Scavenger running in a browser for the workshop. This guide assumes **zero prior setup**. Total time: ~30 minutes.

## 0. Prerequisites

- Node 20+ (`nvm use` will pick it from `.nvmrc`)
- `pnpm` (`corepack enable pnpm` if you don't have it)
- A GitHub account (Netlify links to it for deploys)

```bash
cd lizard-scavanger
pnpm install
cp .env.example .env
```

Leave `.env` empty for now — we'll fill it step by step.

## 1. Run the app locally (no telemetry)

Everything is designed to run even without Sentry/Axiom credentials. Missing env vars → the SDKs become no-ops.

```bash
pnpm dev:web    # frontend-only at http://localhost:5174
# or
pnpm dev        # full stack via netlify dev (requires netlify-cli)
```

Smoke test: open `http://localhost:5174`, pick a name, hit Start. You'll land on level 1. The "Start hunting" button will fail (no functions running in `dev:web`) — that's expected. For full backend, install the Netlify CLI and use `pnpm dev`:

```bash
npm install -g netlify-cli
pnpm dev   # now runs both frontend + functions on :8888
```

## 2. Sentry — create the workshop account

1. Visit https://sentry.io/signup/ and sign up (Business email address).
2. After signup, create a new **organization** if you're not offered one (e.g. `lizard-scavenger-wksp`).
3. Inside the org, create a **project**:
   - Platform: **Node.js**
   - Alert frequency: **On every new issue** (fine — we'll refine)
   - Team: default
   - Project name: `scavenger` (or similar)
4. Sentry will show your **DSN**. Copy it.
5. Grab the **org slug** and **project slug** from the URL (`https://sentry.io/organizations/<org>/projects/<project>/`).

Fill into `.env`:

```bash
SENTRY_DSN=https://...ingest.us.sentry.io/...
VITE_SENTRY_DSN=https://...ingest.us.sentry.io/...   # same value
SENTRY_ORG_SLUG=lizard-scavenger-wksp
SENTRY_PROJECT_SLUG=scavenger
```

### 2a. Sentry shared login for attendees

Create a **second user** inside the org (Settings → Members → Invite). Use a shared workshop email (e.g. `workshop+scavenger@yourdomain.com`) and set their role to **Member** (read-only for most views is fine). Note the credentials — you'll share them day-of.

Fill into `.env`:

```bash
SHARED_SENTRY_LOGIN=workshop+scavenger@yourdomain.com / <password>
```

### 2b. Sentry alert rule for level 5

1. In the project → **Alerts** → **Create Alert**.
2. Choose **Issues** (not Metric Alerts).
3. Conditions:
   - *When*: a new issue is created
   - *If*: the event has tag `scavenger_alert` equal to `true`
4. Action: **Send a webhook** to `https://<your-netlify-domain>.netlify.app/api/sentry-webhook`
5. Save.
6. Go to **Settings → Integrations → Webhooks** (or your Sentry UI's equivalent) and grab the webhook's **client secret** / **signing secret**.

Fill into `.env`:

```bash
SENTRY_WEBHOOK_SECRET=<the-signing-secret>
```

> **Note:** the workshop still works without this. `trigger-alert` writes to the inbox directly after ~20s as a fallback. Configuring the real Sentry alert rule replaces the fallback with a genuine webhook-driven flow (better for the debrief).

## 3. Axiom — create the workshop dataset

1. Visit https://axiom.co/signup and create an account.
2. Create an **organization** (e.g. `lizard-scavenger`).
3. Create a **dataset**: name it `scavenger-prod` (or just `scavenger`).
4. Go to **Settings → API Tokens**.
   - Create an **Ingest token** (scoped to the dataset). Copy it.
   - Create a **Query token** (read-only, scoped to the dataset). Copy it.

Fill into `.env`:

```bash
AXIOM_TOKEN=xaat-...
AXIOM_DATASET=scavenger-prod
AXIOM_QUERY_TOKEN=xapt-...
```

### 3a. Axiom dashboard for level 4

1. Dashboards → New Dashboard → name it `Scavenger Workshop`.
2. Add one chart:
   - Query (APL):

     ```
     ['scavenger-prod']
     | where metric == "lucky_number"
     | summarize latest_value = latest(value) by attendee
     | order by attendee asc
     ```
   - Visualization: **Table** (or **Bar chart** grouped by `attendee`).
3. Save, then share the dashboard and copy its URL.

Fill into `.env`:

```bash
AXIOM_DASHBOARD_URL=https://app.axiom.co/.../dashboards/...
```

### 3b. Axiom shared login for attendees

Settings → Users → Invite. Add a `workshop+…@yourdomain.com` user with **Viewer** role scoped to the `scavenger-prod` dataset. Share credentials day-of.

```bash
SHARED_AXIOM_LOGIN=workshop+scavenger@yourdomain.com / <password>
```

## 4. Workshop secret

Generate a random 32-byte secret used to derive per-attendee keys:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

```bash
WORKSHOP_SECRET=<the-64-char-hex-string>
```

**Critical:** this must stay stable across the workshop. If you rotate it mid-session, everyone's in-flight keys become invalid.

## 5. Deploy to Netlify

1. Push the repo to GitHub (if not already).
2. `netlify login` (or use the web UI at https://app.netlify.com/).
3. `netlify init` → link to GitHub → pick the `lizard-scavanger` directory as the site root.
4. Build settings are auto-detected from `netlify.toml`.
5. **Generate a Netlify Personal Access Token** (required for Netlify Blobs from the classic function runtime). Visit https://app.netlify.com/user/applications#personal-access-tokens and create one named `lizard-scavenger-blobs`. Copy it.
6. In the Netlify dashboard → **Site configuration → Environment variables**, add every var from your local `.env`, **including** `NETLIFY_PAT=<token>`. **Do not skip any** — missing env vars silently turn off features.
7. Trigger a deploy (`netlify deploy --prod`).
8. Visit the URL Netlify hands you.

### 5a. Update the Sentry alert webhook URL

Now that you have the deployed URL (`https://<site>.netlify.app`), go back to Sentry → Alerts → your rule → update the webhook target to:

```
https://<site>.netlify.app/api/sentry-webhook
```

## 6. Smoke test

From the deployed URL:

1. Open incognito, pick a name (`test1`), hit Start.
2. On level 1, click Start hunting. You should see a trace ID appear.
3. Open Sentry → Traces → search for that trace ID. Verify the `level-1` span has the `next_key` attribute.
4. Copy the key, enter it, land on level 2.
5. Continue all five levels.
6. On level 5, trigger the alert. Wait 20 seconds, refresh `/inbox/test1`. The final key should be there.

If any step fails, check:

- `netlify logs:function <fn-name>` for server-side errors
- Sentry Issues panel for captured exceptions
- The Axiom dataset for incoming events

## 7. Before the workshop

- **Print the shared logins** on a slide for attendees.
- **Reset shared blob state** if you smoke-tested with real names they might use: call `POST /api/reset { name: "..." }` or manually clear the Netlify Blobs store from the dashboard.
- **Set aside 5 min at the start** to walk through the shared tools (where to log in, how to filter by `attendee` tag).
