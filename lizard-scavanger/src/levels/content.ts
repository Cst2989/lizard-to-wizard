export type LevelContent = {
  n: number;
  title: string;
  concept: string;
  lesson: string[]; // paragraphs
  instructions: string[]; // ordered hunt steps
  keyFormatHint: string; // e.g. "8 uppercase hex characters"
  keyPattern: RegExp; // client-side validation of the typed key
  tool: "Sentry" | "Axiom" | "Sentry + Inbox";
  debrief: {
    takeaway: string;
    scalesTo: string;
    realWorldTip: string;
  };
};

export const LEVELS: Record<number, LevelContent> = {
  1: {
    n: 1,
    title: "Distributed Tracing 101",
    concept: "A trace is the story of one request — spans, timing, attributes.",
    lesson: [
      "Every request your server handles gets a trace — a tree of spans stitched together by a shared trace_id. Spans can carry attributes that describe the work they did.",
      "When an on-call engineer asks 'what happened for this one user?', the trace is the answer. Filter by trace_id, read the spans, done.",
    ],
    instructions: [
      "Click 'Start hunting'. The server will emit a Sentry trace tagged with your attendee name.",
      "Copy the trace ID shown on the page.",
      "Open Sentry (shared login on /about). Go to Traces and paste the ID.",
      "Expand the 'level-1' root span. Its `next_key` attribute is the key for level 2.",
    ],
    keyFormatHint: "8 uppercase hex characters",
    keyPattern: /^[0-9A-F]{8}$/i,
    tool: "Sentry",
    debrief: {
      takeaway: "You used a trace ID to find one request among thousands.",
      scalesTo:
        "At scale, trace IDs propagate across tens of microservices — the one tool that stitches them all together.",
      realWorldTip:
        "Include the trace_id in your error responses and support emails. Future-you will thank you.",
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
      "Click 'Start hunting'. The server emits two logs for this request: an nginx-style access log and an app log.",
      "Open Axiom (shared login on /about). Open the workshop dataset.",
      "Filter for `kind == 'nginx'` and `attendee == \"<your-name>\"`. Find the log for this URL.",
      "Copy its `trace_id`. Search for the `trace_id` (across all kinds). The app log with 'L3 key: …' is your next key.",
    ],
    keyFormatHint: "8 uppercase hex characters",
    keyPattern: /^[0-9A-F]{8}$/i,
    tool: "Axiom",
    debrief: {
      takeaway: "You used structured fields to cut through shared-log noise.",
      scalesTo:
        "Tens of millions of events per day still return the 4 lines you need — in under a second.",
      realWorldTip:
        "Never log secrets or PII. 'user_id' yes, 'password' never.",
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
      "Open the trace in Sentry.",
      "The three spans each carry one fragment (`key_fragment_1`, `_2`, `_3`). Concatenate them in order to form your 8-char key.",
    ],
    keyFormatHint: "8 uppercase hex characters",
    keyPattern: /^[0-9A-F]{8}$/i,
    tool: "Sentry",
    debrief: {
      takeaway: "One trace captured three spans across 'async' boundaries.",
      scalesTo:
        "Your user hits 'buy'. 14 services touch the order. They all show up under one trace.",
      realWorldTip:
        "When a span is surprisingly slow, the culprit is usually the queue wait — not the worker itself.",
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
      takeaway: "You found a metric value filtered to your own identity.",
      scalesTo:
        "One metric, billions of points, sub-second query — because aggregation happens at ingest, not read.",
      realWorldTip:
        "Cardinality is the killer. Never tag a metric with `user_id` or `request_id`.",
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
      takeaway: "You triggered an alert, it fanned out to a webhook, a human (you) was informed.",
      scalesTo:
        "The same pattern pages your on-call when a real user-visible SLO breaks at 3am.",
      realWorldTip:
        "Every alert needs a runbook. If you can't write one, the alert shouldn't exist.",
    },
  },
  6: {
    n: 6,
    title: "Bonus: Errors & Breadcrumbs",
    concept:
      "Every exception becomes an Issue in Sentry, with a trail of what the code was doing before it blew up.",
    lesson: [
      "Errors without context are useless. Breadcrumbs are a short trail of events leading up to an exception — what the user clicked, what query ran, what request was in flight.",
      "You'll trigger a deliberate exception here. The breadcrumbs tell you what a production-grade error report looks like.",
    ],
    instructions: [
      "Click 'Throw the exception' — the server will crash on purpose.",
      "Open Sentry → Issues. Find the 'lizard-scavenger bonus' error tagged with your attendee.",
      "Scroll through the breadcrumbs. One of them is a congratulations message.",
    ],
    keyFormatHint: "none — just bask in the glory",
    keyPattern: /.*/,
    tool: "Sentry",
    debrief: {
      takeaway: "You read breadcrumbs to reconstruct the moment an error happened.",
      scalesTo:
        "In production, you set breadcrumbs on every user interaction. When a bug pops, you replay the story.",
      realWorldTip:
        "Don't log exceptions manually AND capture them with Sentry — you'll get two records. Let the SDK own error reporting.",
    },
  },
};
