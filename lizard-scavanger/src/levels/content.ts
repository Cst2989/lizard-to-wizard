export type DebriefSection = {
  title: string;
  body: string[]; // paragraphs
};

export type LevelContent = {
  n: number;
  title: string;
  concept: string;
  lesson: string[]; // paragraphs shown before the hunt
  instructions: string[]; // ordered hunt steps — concise
  hintDetails?: { summary: string; steps: string[] }; // optional collapsible hint
  keyFormatHint: string;
  keyPattern: RegExp;
  tool: "Sentry" | "Axiom" | "Sentry + Inbox";
  // The full post-level lesson, revealed only after the next key is validated.
  debrief: {
    headline: string;
    sections: DebriefSection[];
    readings?: Array<{ label: string; url: string }>;
  };
};

export const LEVELS: Record<number, LevelContent> = {
  1: {
    n: 1,
    title: "Distributed Tracing 101",
    concept:
      "A trace is the story of one request — spans, timing, attributes, all stitched together by a shared trace_id.",
    lesson: [
      "Every request your server handles gets a trace — a tree of spans stitched together by a shared trace_id. Spans can carry attributes that describe the work they did.",
      "When an on-call engineer asks 'what happened for this one user?', the trace is the answer. Filter by trace_id, read the spans, done.",
    ],
    instructions: [
      "Click 'Start hunting'. The server emits a Sentry trace tagged with your attendee name.",
      "Find the 'x-trace-id' this request returned on this page.",
      "Open Sentry → Explore → Traces. Two ways to find your trace:",
      "  (a) Paste the ID into the URL: https://neciudan.sentry.io/explore/traces/trace/<YOUR_TRACE_ID>/, or",
      "  (b) Type `attendee:<yourname>` in the search box to see every trace you've ever made.",
      "Open the trace, click the 'scavenger.level-1' span in the waterfall, read its 'next_key' attribute.",
    ],
    hintDetails: {
      summary: "Stuck? Here's the full walkthrough:",
      steps: [
        "① Find the trace ID (on THIS page): open DevTools (Cmd-Opt-I / Ctrl-Shift-I) → Network tab → click 'Start hunting' again → find the /api/level-1 request → Headers → Response Headers → copy the 'x-trace-id' value.",
        "② Open the trace in Sentry — pick one of these two paths:",
        "    ‣ URL path (when you have a specific trace ID): https://neciudan.sentry.io/explore/traces/trace/<YOUR_TRACE_ID>/",
        "    ‣ Search by tag (when you want ALL your traces): Explore → Traces → search box → `attendee:<yourname>`.",
        "③ NOTE: the Explore search box does NOT accept a raw trace ID — it filters on span attributes. `attendee:dan` works; `881af5…` does not.",
        "④ In the trace view, click the span named 'scavenger.level-1' in the waterfall → a side panel shows its attributes → find 'next_key'.",
      ],
    },
    keyFormatHint: "8 uppercase hex characters",
    keyPattern: /^[0-9A-F]{8}$/i,
    tool: "Sentry",
    debrief: {
      headline: "You read a trace. You're now an observability native.",
      sections: [
        {
          title: "What you actually did",
          body: [
            "You made an HTTP request. The server wrapped its work in a Sentry span, attached your attendee name and a `next_key` attribute to that span, and responded with an `x-trace-id` header pointing at the span's trace.",
            "You pivoted from that header value into Sentry's Traces view and read a field the server had set. That pivot — from a user-visible artefact (header, error message, support ticket) into the full trace — is half of real on-call work.",
          ],
        },
        {
          title: "What a trace actually is",
          body: [
            "A **trace** is a tree of **spans**. Each span describes a unit of work: an HTTP handler, a database query, a job on a queue. A span has a name, a start/end time, and arbitrary key-value **attributes**.",
            "Spans share a **trace_id** (128-bit, typically shown as 32 hex chars). That's the glue — any span with the same trace_id belongs to the same logical request. You saw it in the `x-trace-id` header you copied.",
            "Every span also has its own **span_id** and a **parent_span_id**. That's how the tree is built.",
          ],
        },
        {
          title: "Why trace IDs live in response headers",
          body: [
            "When a user complains 'something broke at 3:47pm', you have two choices: grep logs and pray, or ask them for their trace ID. The second takes 30 seconds.",
            "Stripe, GitHub, Shopify, and most of the modern web return trace/request IDs in every response (`x-request-id`, `x-trace-id`, `cf-ray`). Their support teams are trained to ask for it first. Do this at your job.",
          ],
        },
        {
          title: "How this scales in production",
          body: [
            "A single checkout request at a SaaS company might touch 15 microservices. Without tracing, you'd have 15 separate log files to correlate manually — good luck. With tracing, you paste one ID and see the whole waterfall.",
            "Modern SDKs (Sentry, OpenTelemetry, Datadog) propagate the trace context automatically across HTTP calls, gRPC, message queues, and even async code inside one process. You rarely write propagation code yourself.",
          ],
        },
        {
          title: "Try this at work tomorrow",
          body: [
            "Open your production app's response headers. Look for `x-trace-id`, `x-request-id`, or `traceparent`. If you find one, congrats — tracing is half set up. Click it into your observability tool.",
            "If you don't find one, that's an easy win: one middleware that adds `response.headers['x-trace-id'] = currentTraceId()` unlocks the pattern forever.",
          ],
        },
      ],
    },
  },
  2: {
    n: 2,
    title: "Structured Logs & Noise",
    concept:
      "Logs are queryable when they're structured. Always include identity fields.",
    lesson: [
      "A log line with just text is nearly useless at scale. A log line with `{ attendee, trace_id, request_id }` is a first-class citizen of your observability stack.",
      "Axiom (like Splunk, Datadog Logs, Loki) lets you filter, aggregate, and join structured logs. The fields you log today are the queries you can ask tomorrow.",
    ],
    instructions: [
      "Click 'Start hunting'. The server emits TWO logs for this request: (1) an nginx access log — records that the HTTP hit happened, and (2) an app log — contains what the code logged while handling it. Both share the same `trace_id`. ⚠️ The nginx log does NOT contain the key. You need to pivot to the app log via the trace_id.",
      "Open Axiom (shared login on /about) → Explore → select the dataset.",
      "STEP 1 — find YOUR nginx log (gives you the trace_id, NOT the key):",
      "  ['{dataset}'] | where kind == \"nginx\" and attendee == \"{attendee}\"",
      "Click the most recent row. The fields panel (right side) shows `trace_id`. Copy its value — e.g. `3dc0e2866e9281592e0556faf14dc163`.",
      "STEP 2 — pivot by trace_id to find the app log (this row has the key):",
      "  ['{dataset}'] | where trace_id == \"<paste-trace-id-here>\"",
      "Two rows come back. Ignore the nginx one. The 'app' row's `msg` field reads `L3 key: <KEY>` — that's your next key.",
    ],
    hintDetails: {
      summary: "The pivot pattern + APL cheat sheet",
      steps: [
        "The whole lesson of L2 is the PIVOT: nginx log tells you 'a request happened'; app log tells you 'what the code did during it'. They're joined by a shared trace_id.",
        "Query 1 — narrow to your nginx log (filter by name):",
        "  ['{dataset}'] | where kind == \"nginx\" and attendee == \"{attendee}\"",
        "From that row, copy the `trace_id` field. Then:",
        "Query 2 — pivot to all logs for that request:",
        "  ['{dataset}'] | where trace_id == \"<copied-trace-id>\"",
        "The 'app' row in the second query's result has `msg: \"L3 key: <KEY>\"`.",
        "— — — APL basics — — —",
        "① Dataset: ['{dataset}']  (brackets + quotes; datasets are string literals).",
        "② Filter: | where field == \"value\"  (== exact match; strings in double quotes).",
        "③ Combine: | where a == \"x\" and b == \"y\"  (`and` / `or` / `not`).",
        "④ Project columns: | project _time, msg, trace_id  (optional).",
        "⑤ Sort: | order by _time desc.",
      ],
    },
    keyFormatHint: "8 uppercase hex characters",
    keyPattern: /^[0-9A-F]{8}$/i,
    tool: "Axiom",
    debrief: {
      headline: "You cut through noise. This is what on-call looks like.",
      sections: [
        {
          title: "What you actually did",
          body: [
            "You ran two queries. The first narrowed from 'all events in the dataset' to 'nginx access logs for my attendee name'. The second pivoted to a different event kind using `trace_id` as the join key.",
            "Cross-event-type pivots are the single most useful technique in log analysis. Access log tells you *a request happened*; app logs tell you *what the code did during that request*. The trace_id stitches them.",
          ],
        },
        {
          title: "Why structured > plain text",
          body: [
            "`console.log('user ' + userId + ' did the thing at ' + time)` is a crime. You can grep for it, but you can't aggregate, you can't join, and the moment the format shifts you break every existing dashboard.",
            "Structured logs are JSON (or an equivalent). Every important value is a field. Your logger library adds a timestamp, level, and request context automatically. This turns your logs from *text* into a *database*.",
          ],
        },
        {
          title: "The fields to always include",
          body: [
            "**Identity:** `user_id`, `tenant_id`, `attendee`, whatever scopes the work. Without this, you can't filter to one caller.",
            "**Correlation:** `trace_id`, `request_id`, `session_id`. Lets you stitch across services and event types.",
            "**Context:** the endpoint, the action, the resource being touched. `method=POST path=/orders order_id=42` beats `'handling a request'` every time.",
            "**Never log:** passwords, tokens, full card numbers, raw JWTs, PII that's not essential. Log the hash or a truncation if you need a breadcrumb.",
          ],
        },
        {
          title: "How this scales",
          body: [
            "Splunk, Datadog Logs, Loki, Axiom — they all work the same way. Ingest JSON, index fields, let you query. 50 GB/day and 10 ms query latency are normal.",
            "The query languages differ (SPL, Log query, LogQL, APL) but the moves are universal: filter by identity, pivot via a shared ID, aggregate by tag, chart over time.",
          ],
        },
        {
          title: "Pitfalls to avoid",
          body: [
            "**Unbounded cardinality.** If you put `trace_id` in a log field, fine — billions of distinct values is what logs are for. But if you also try to *index* by it as if it were a tag, your indexer dies. Know the difference.",
            "**Logging to console AND sending to Sentry AND ingesting to Axiom.** Pick the source of truth for each event kind. Duplication is debugging hell.",
          ],
        },
      ],
    },
  },
  3: {
    n: 3,
    title: "Async Work & Linked Spans",
    concept:
      "Traces span async boundaries. Queues, workers, background jobs all join the trace.",
    lesson: [
      "A single user action often kicks off work that finishes seconds (or minutes) later. Without tracing, you'd never know which background job belonged to which user.",
      "Modern observability SDKs propagate the trace context automatically, so a queue publish and the worker that handles it show up in the same trace tree.",
    ],
    instructions: [
      "Click 'Start hunting'. The server runs a root span with two child spans: 'enqueue' and 'worker'.",
      "Grab the trace ID from the 'x-trace-id' response header.",
      "Open Sentry → Explore → Traces. Two ways:",
      "  (a) Paste into URL: https://neciudan.sentry.io/explore/traces/trace/<YOUR_TRACE_ID>/, or",
      "  (b) Search: `attendee:<yourname>` and click the most recent trace.",
      "In the waterfall, click each of the three spans. Each has one fragment: `key_fragment_1`, `_2`, `_3`. Concatenate in order for your 8-char key.",
    ],
    hintDetails: {
      summary: "Need the steps?",
      steps: [
        "① Get the trace ID: DevTools → Network → /api/level-3 request → Response Headers → 'x-trace-id'.",
        "② Open the trace in Sentry:",
        "    ‣ URL: https://neciudan.sentry.io/explore/traces/trace/<YOUR_TRACE_ID>/",
        "    ‣ Or search `attendee:<yourname>` in Explore → Traces (the search box does NOT accept raw trace IDs — it filters on span attributes/tags).",
        "③ Click the 'scavenger.level-3' root span → attributes panel → `key_fragment_1`.",
        "④ Click the child 'enqueue' span → `key_fragment_2`.",
        "⑤ Click the child 'worker' span → `key_fragment_3`.",
        "⑥ Concatenate in order: fragment_1 + fragment_2 + fragment_3.",
      ],
    },
    keyFormatHint: "8 uppercase hex characters",
    keyPattern: /^[0-9A-F]{8}$/i,
    tool: "Sentry",
    debrief: {
      headline: "One trace, three spans, zero guesswork.",
      sections: [
        {
          title: "What you actually did",
          body: [
            "You watched a single trace contain a root HTTP span, an 'enqueue' span, and a 'worker' span. In the real world those three spans would run in three different processes — an API, a message queue, and a worker pool — but the trace tree stays intact.",
            "You split one value across three attributes and reassembled it only by reading the trace. That's exactly what 'correlating a long-running workflow' feels like during a post-mortem.",
          ],
        },
        {
          title: "How trace context actually propagates",
          body: [
            "There's a standard header called `traceparent` (defined by W3C). It looks like `00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01`: version, trace_id, span_id, flags.",
            "When service A calls service B, A's SDK injects `traceparent` into the outgoing HTTP request. B's SDK extracts it and makes its new span a child of A's. The tree grows without anyone writing code.",
            "For queues, the trace context rides on the message payload or a dedicated header. Same idea, different transport.",
          ],
        },
        {
          title: "Why async tracing matters",
          body: [
            "'The user clicked buy. 4 minutes later the confirmation email arrived. Why so slow?' Without async tracing, this is unsolvable. You'd have to know every step of the pipeline and grep each step's logs by timestamp — which assumes the clocks agree.",
            "With async tracing, you open the trace, see the enqueue span finish in 12 ms, the queue wait span sit for 3m 47s, and the send-email span run in 200 ms. The answer is right there: queue backpressure.",
          ],
        },
        {
          title: "What goes wrong in production",
          body: [
            "**Context leak:** a worker handles two jobs in sequence but the SDK's 'current span' isn't reset between them, so job B's spans land under job A's trace. Confusing.",
            "**Orphan spans:** a service forgot to propagate the context, so its spans show up with no parent. They look lonely in the Sentry Traces view.",
            "**Sampling mismatch:** service A samples 10%, service B samples 100%. You see B's spans but A's spans are missing, making the tree look broken. Keep sampling consistent across a trace.",
          ],
        },
        {
          title: "Try this at work",
          body: [
            "Next time a production job runs slow, don't look at the worker. Open the full trace from the user action. The slow span is almost never where you first look.",
          ],
        },
      ],
    },
  },
  4: {
    n: 4,
    title: "Metrics & Dashboards",
    concept:
      "Metrics aggregate facts across millions of events. Dashboards make them legible.",
    lesson: [
      "Logs and traces answer 'what happened to this one request'. Metrics answer 'how is the whole system behaving'. You need both.",
      "A dashboard is an opinion about which metrics matter. When you're on call at 3am, the right dashboard is worth 100 runbooks.",
    ],
    instructions: [
      "Click 'Start hunting' — the server emits a 'lucky_number' metric tagged with your attendee.",
      "Open the workshop Axiom dashboard (link appears after you start).",
      "The 'lucky number' widget shows one row per attendee. Find your row and read the value.",
      "That 6-digit number is your level-5 key.",
    ],
    keyFormatHint: "6 digits",
    keyPattern: /^\d{6}$/,
    tool: "Axiom",
    debrief: {
      headline: "You read a metric from a dashboard. That's 80% of on-call.",
      sections: [
        {
          title: "What you actually did",
          body: [
            "You made the server emit a sample: a number tagged with your attendee name. On the dashboard, `arg_max(_time, value) by attendee` said 'show me the latest value per attendee'. You filtered to your tag and read it.",
            "This is exactly the shape of every 'current state' metric in production — queue depth, connection count, cache hit rate — just with different math.",
          ],
        },
        {
          title: "The three metric types",
          body: [
            "**Counter:** a number that only goes up. 'How many 500 errors?' `count(...)` queries. Rates per second are counters divided by time.",
            "**Gauge:** a number at a point in time. 'How many database connections right now?' This is what you just queried — last value wins.",
            "**Histogram/distribution:** a bucket of observations you can aggregate into percentiles. 'What's the p95 response time?' Histograms are what give you percentiles — averages are lies.",
          ],
        },
        {
          title: "Cardinality — the killer",
          body: [
            "A metric's *cardinality* is the number of distinct tag combinations. `request_count{status,endpoint,method}` might have 5 × 50 × 4 = 1,000 combinations — fine. Add `user_id` and suddenly you've got 10 million combinations — this will bankrupt you.",
            "Rule of thumb: tag dimensions you need to *aggregate across* (status, endpoint, region). Log dimensions you need to *look up by* (user_id, trace_id, order_id). Mixing them up is the #1 cause of observability bill shock.",
          ],
        },
        {
          title: "RED and USE — the two methods",
          body: [
            "**RED** (for request-driven systems): **R**ate of requests, **E**rror rate, **D**uration percentiles. If you only had one dashboard, this is it.",
            "**USE** (for resource-driven systems): **U**tilization, **S**aturation, **E**rrors. Applied to CPU, memory, disk, queue depth.",
            "Most dashboards are some mix of both. When you build one, start by asking: 'what question am I answering at 3am?' and cut everything that doesn't help.",
          ],
        },
        {
          title: "Note on this workshop's 'metric'",
          body: [
            "In real production, metrics go to a time-series database (Prometheus, Mimir, Datadog, Sentry Metrics) — not to your log store. Metric storage is optimized for aggregation over long time ranges; log storage is optimized for recall of individual events.",
            "In this workshop we emit a log event tagged `metric:\"lucky_number\"` and aggregate it in Axiom. It works for teaching, but the punchline to remember is: **metrics and logs serve different queries and deserve different infrastructure.**",
          ],
        },
      ],
    },
  },
  5: {
    n: 5,
    title: "Alerts → Action",
    concept:
      "An alert is the bridge between a broken metric and a human on call.",
    lesson: [
      "Alerts turn signals into pages. A good alert is actionable, tied to a runbook, and only fires when someone actually needs to wake up.",
      "Modern alerting is webhook-driven: the alert fires → webhook → some side effect (page a human, open a ticket, post to Slack, email the team).",
    ],
    instructions: [
      "Click 'Trigger the alert' below. The server emits a Sentry event tagged `scavenger_alert=true`.",
      "A pre-configured Sentry alert rule fires, and its webhook writes to your inbox.",
      "Open your inbox at /inbox/<your-name>. Within ~20 seconds the final key will appear there.",
    ],
    keyFormatHint: "8 uppercase hex characters",
    keyPattern: /^[0-9A-F]{8}$/i,
    tool: "Sentry + Inbox",
    debrief: {
      headline: "You turned telemetry into action. That's the point of all this.",
      sections: [
        {
          title: "What you actually did",
          body: [
            "You triggered a condition the monitoring system had been told to watch for. The alert fired, hit a webhook, and the webhook wrote something to a store your UI was polling. A human (you) saw the change and reacted.",
            "Swap 'write to a blob' for 'page the on-call engineer's phone' and you have PagerDuty. Swap it for 'open a JIRA ticket' and you have the ticketing flow. The shape doesn't change.",
          ],
        },
        {
          title: "The alert → webhook → action chain",
          body: [
            "Alert: a saved query on metrics or events that fires when a threshold is crossed. Examples: 'error rate > 5% for 5 minutes', 'queue depth > 10,000', 'p95 latency doubles week over week'.",
            "Webhook: an HTTP call the alerting system makes when the alert fires. Carries the alert's payload (what fired, for which tags, at what time).",
            "Action: whatever the webhook target does. Your Slack bot posts to a channel. Your PagerDuty integration pages someone. Your internal tool auto-scales a service.",
          ],
        },
        {
          title: "Good alerts vs bad alerts",
          body: [
            "**A good alert is actionable.** 'Error rate > 5%' → you can do something. 'CPU > 80%' → maybe, maybe not. If the on-call can't act on it, it shouldn't page.",
            "**A good alert is symptom-based, not cause-based.** Alert on 'users can't check out' (symptom). Don't alert on 'Redis memory is 90% full' (a cause that may or may not matter). Symptoms catch cause *and* unknown-unknowns.",
            "**A good alert has a runbook.** One doc linked from the alert that says: what it means, what to check first, how to fix. No runbook, no alert — period.",
          ],
        },
        {
          title: "Alert fatigue is real — and dangerous",
          body: [
            "Every false page costs trust. When the on-call has been paged 40 times this week for nothing, they will miss the one real page. This is how incidents become outages become resignations.",
            "The fix: SLO-based alerting. Define a promise to your users ('99.9% of checkouts complete in under 2s'). Alert when you're *burning the budget*, not when any individual metric twitches. Google SRE's book has the playbook.",
          ],
        },
        {
          title: "Why we simulated the webhook",
          body: [
            "In this workshop, `/api/trigger-alert` writes the inbox directly, not via a Sentry webhook — because we want the workshop to work even before you configure Sentry alert rules.",
            "In production, you would wire Sentry's alert rule to POST to `/api/sentry-webhook` on your backend. The `/api/sentry-webhook` endpoint exists and verifies HMAC signatures. See `docs/SETUP.md` for how to wire it up.",
          ],
        },
      ],
    },
  },
  6: {
    n: 6,
    title: "Bonus: Errors & Breadcrumbs",
    concept:
      "Every exception becomes an Issue in Sentry, with a trail of what the code was doing before it blew up.",
    lesson: [
      "Errors without context are useless. Breadcrumbs are a short trail of events leading up to an exception — what the user clicked, what fetch call fired, what console log printed, what server-side work was in flight.",
      "You'll trigger a deliberate exception here. Sentry will capture both the browser-side breadcrumbs (your clicks and fetches on this page) and the server-side ones (three we add manually in the handler). Together they tell the story of the crash.",
    ],
    instructions: [
      "Click 'Throw the exception' — the server will capture an error on purpose.",
      "Open Sentry → Issues. Find the 'lizard-scavenger bonus finale' error tagged with your attendee.",
      "Scroll through the breadcrumbs. One of them is a congratulations message.",
    ],
    keyFormatHint: "none — just bask in the glory",
    keyPattern: /.*/,
    tool: "Sentry",
    debrief: {
      headline: "You read a crash. You've finished the hunt.",
      sections: [
        {
          title: "What you actually did",
          body: [
            "You triggered a controlled exception. Sentry captured the stack trace, the tags (your attendee), the scope (warning level), and — crucially — the breadcrumbs: a timeline of the last dozen things that happened before the crash.",
            "In production, the breadcrumbs typically include clicks, navigations, fetch calls, console logs, and custom events. When a user reports 'the app crashed', you don't have to reproduce the bug — you just read what they did.",
          ],
        },
        {
          title: "Breadcrumbs vs manual logging",
          body: [
            "You *could* add `console.log('user clicked buy')` everywhere. But that clutters logs when nothing's wrong, spams your log vendor's bill, and becomes part of the release surface you have to maintain.",
            "Breadcrumbs are better: they're only retained if an error happens. Zero cost on happy paths. When an exception fires, the last ~100 breadcrumbs get attached to the Sentry Issue automatically.",
            "Use `Sentry.addBreadcrumb({category, message, data})` for domain events you want in crash reports. Use regular logs for operational concerns you want *regardless* of whether something broke.",
          ],
        },
        {
          title: "Error grouping (fingerprints)",
          body: [
            "Sentry doesn't create one Issue per exception — it creates one Issue per *kind* of exception. The default fingerprint is the stack trace's top frame + the exception message.",
            "This means 10,000 users hitting the same null-ref in `renderOrderTotal` show up as one Issue with `events: 10,000` — not 10,000 Issues. That's what makes the tool usable.",
            "You can customize the fingerprint if defaults group too aggressively (collapsing distinct bugs) or too loosely (one bug split across 50 Issues).",
          ],
        },
        {
          title: "Releases, sourcemaps, and 'which deploy broke it'",
          body: [
            "Send a release identifier (`release: 'app@1.4.2'`) with every event. Sentry groups regressions by release and shows you 'first seen in release X'.",
            "Upload sourcemaps during the build so minified `a.b.c = null` stack frames become `OrderTotal.calculate = null`. Without sourcemaps, prod stack traces are unreadable.",
          ],
        },
        {
          title: "Don't double-report",
          body: [
            "If you `try { ... } catch (e) { logger.error(e); Sentry.captureException(e); throw e }`, you've logged the error *twice* and you might still hit your framework's global handler for a third.",
            "Pick one: let Sentry's integration auto-capture unhandled exceptions, or catch and `captureException` manually — never both. Your future self will thank you when you're debugging which of three records is authoritative.",
          ],
        },
        {
          title: "What to do next",
          body: [
            "Go back to your real app. Open Sentry. Look at an Issue you've never investigated. Read its breadcrumbs. Notice what you learn that you couldn't have learned from logs alone.",
            "That's the superpower. Thanks for playing.",
          ],
        },
      ],
    },
  },
};
