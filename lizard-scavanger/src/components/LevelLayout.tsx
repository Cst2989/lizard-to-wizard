import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { LevelContent } from "../levels/content";
import type { LevelResponse } from "../lib/api";
import { hitLevel, triggerAlert } from "../lib/api";

type Phase = "lesson" | "hunting" | "finale";

interface Props {
  content: LevelContent;
  attendee: string;
  currentKey: string;
}

const FINAL_LEVEL = 6;

export function LevelLayout({ content, attendee, currentKey }: Props) {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("lesson");
  const [huntData, setHuntData] = useState<LevelResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [typedKey, setTypedKey] = useState("");
  const [triggerMessage, setTriggerMessage] = useState<string | null>(null);

  async function startHunting() {
    setBusy(true);
    setError(null);
    const res = await hitLevel(content.n, attendee, currentKey);
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setHuntData(res.data);
    setPhase(content.n === FINAL_LEVEL ? "finale" : "hunting");
  }

  function submitKey(e: React.FormEvent) {
    e.preventDefault();
    if (!content.keyPattern.test(typedKey.trim())) {
      setError(`Expected: ${content.keyFormatHint}`);
      return;
    }
    setError(null);
    navigate(`/level/${content.n + 1}/${typedKey.trim().toUpperCase()}`);
  }

  async function doTriggerAlert() {
    setBusy(true);
    setError(null);
    const res = await triggerAlert(attendee);
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setTriggerMessage(res.data.message);
  }

  return (
    <div>
      <header style={{ marginBottom: 24 }}>
        <span className="pill">level {content.n}</span>
        <span className="pill">{content.tool}</span>
        <h2 style={{ margin: "8px 0 4px" }}>{content.title}</h2>
        <p className="muted" style={{ margin: 0 }}>
          attendee: <code>{attendee}</code>
        </p>
      </header>

      {phase === "lesson" && (
        <section className="card">
          <h3 style={{ marginTop: 0 }}>The concept</h3>
          <p>{content.concept}</p>
          {content.lesson.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          <button disabled={busy} onClick={startHunting}>
            {busy ? "Preparing…" : content.n === FINAL_LEVEL
              ? "Trigger the error →"
              : "Start hunting →"}
          </button>
          {error && <p style={{ color: "var(--bad)" }}>{error}</p>}
        </section>
      )}

      {phase === "hunting" && huntData && (
        <section className="card">
          <h3 style={{ marginTop: 0 }}>The hunt</h3>
          <ol>
            {content.instructions.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>

          <HuntSignals data={huntData} />

          {content.n === 5 && (
            <div style={{ margin: "16px 0" }}>
              <button disabled={busy} onClick={doTriggerAlert}>
                Trigger the alert
              </button>
              {triggerMessage && (
                <p className="muted" style={{ marginTop: 8 }}>
                  {triggerMessage}
                </p>
              )}
            </div>
          )}

          <h3>When you find the next key, type it below</h3>
          <p className="muted">
            Format: {content.keyFormatHint}
            {content.n === 5 && (
              <>
                {" "}
                (or open <a href={`/inbox/${attendee}`}>/inbox/{attendee}</a>)
              </>
            )}
          </p>
          <form onSubmit={submitKey} style={{ display: "flex", gap: 12 }}>
            <input
              type="text"
              placeholder="key"
              value={typedKey}
              onChange={(e) => setTypedKey(e.target.value)}
              autoFocus
            />
            <button type="submit">Go →</button>
          </form>
          {error && <p style={{ color: "var(--bad)" }}>{error}</p>}
        </section>
      )}

      {phase === "finale" && huntData && (
        <section className="card" style={{ background: "rgba(129, 199, 132, 0.08)" }}>
          <h3 style={{ marginTop: 0 }}>🎉 You've finished the hunt</h3>
          <p>
            The error has been captured and you're on the last page. Open
            Sentry → Issues to read the breadcrumbs.
          </p>
          <HuntSignals data={huntData} />
          <p className="muted" style={{ marginTop: 16 }}>
            Thanks for playing. See <a href="/about">/about</a> for the debrief.
          </p>
        </section>
      )}

      <Debrief content={content} />
    </div>
  );
}

function HuntSignals({ data }: { data: LevelResponse }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.04)",
        padding: 14,
        borderRadius: 8,
        margin: "16px 0",
      }}
    >
      {data.traceId && (
        <p style={{ margin: 0 }}>
          Trace ID: <code>{data.traceId}</code>
        </p>
      )}
      {data.sentryTraceUrl && (
        <p style={{ margin: "6px 0 0" }}>
          <a href={data.sentryTraceUrl} target="_blank" rel="noreferrer">
            open in sentry →
          </a>
        </p>
      )}
      {data.axiomLogsUrl && (
        <p style={{ margin: "6px 0 0" }}>
          <a href={data.axiomLogsUrl} target="_blank" rel="noreferrer">
            open axiom logs →
          </a>
        </p>
      )}
      {data.axiomDashboardUrl && (
        <p style={{ margin: "6px 0 0" }}>
          <a href={data.axiomDashboardUrl} target="_blank" rel="noreferrer">
            open axiom dashboard →
          </a>
        </p>
      )}
      <p className="muted" style={{ marginTop: 10 }}>
        <strong>hint:</strong> {data.hint}
      </p>
    </div>
  );
}

function Debrief({ content }: { content: LevelContent }) {
  return (
    <details className="card" style={{ marginTop: 18 }}>
      <summary style={{ cursor: "pointer", fontWeight: 600 }}>
        💡 once you solve it — takeaways
      </summary>
      <ul style={{ marginTop: 12 }}>
        <li>
          <strong>What you just did:</strong> {content.debrief.takeaway}
        </li>
        <li>
          <strong>How this scales:</strong> {content.debrief.scalesTo}
        </li>
        <li>
          <strong>Real-world tip:</strong> {content.debrief.realWorldTip}
        </li>
      </ul>
    </details>
  );
}
