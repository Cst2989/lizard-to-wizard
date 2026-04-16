import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { LevelContent } from "../levels/content";
import type { LevelResponse } from "../lib/api";
import { hitLevel, triggerAlert, validateNextKey } from "../lib/api";

type Phase = "lesson" | "hunting" | "solved" | "finale";

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

  async function submitKey(e: React.FormEvent) {
    e.preventDefault();
    const typed = typedKey.trim();
    if (!content.keyPattern.test(typed)) {
      setError(`Expected: ${content.keyFormatHint}`);
      return;
    }
    setBusy(true);
    setError(null);
    const res = await validateNextKey(attendee, content.n + 1, typed);
    setBusy(false);
    if (!res.ok) {
      setError("that's not the right key — keep hunting");
      return;
    }
    setPhase("solved");
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

  function continueToNext() {
    navigate(
      `/level/${content.n + 1}/${typedKey.trim().toUpperCase()}`,
    );
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
            {busy
              ? "Preparing…"
              : content.n === FINAL_LEVEL
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
              <li key={i}>{renderStep(step, attendee)}</li>
            ))}
          </ol>

          <HuntSignals
            data={huntData}
            hintDetails={content.hintDetails}
            attendee={attendee}
          />

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
            <button type="submit" disabled={busy}>
              {busy ? "…" : "Submit"}
            </button>
          </form>
          {error && <p style={{ color: "var(--bad)" }}>{error}</p>}
        </section>
      )}

      {phase === "solved" && (
        <section className="card debrief">
          <div
            style={{
              display: "inline-block",
              background: "rgba(129, 199, 132, 0.16)",
              color: "var(--good)",
              padding: "6px 14px",
              borderRadius: 999,
              fontSize: "0.85em",
              fontWeight: 600,
              marginBottom: 16,
            }}
          >
            ✅ Level {content.n} complete
          </div>
          <DebriefFull content={content} />
          <div
            style={{
              marginTop: 32,
              paddingTop: 20,
              borderTop: "1px solid var(--border)",
            }}
          >
            <button onClick={continueToNext}>
              Continue to level {content.n + 1} →
            </button>
          </div>
        </section>
      )}

      {phase === "finale" && huntData && (
        <section className="card debrief">
          <div
            style={{
              display: "inline-block",
              background: "rgba(129, 199, 132, 0.16)",
              color: "var(--good)",
              padding: "6px 14px",
              borderRadius: 999,
              fontSize: "0.85em",
              fontWeight: 600,
              marginBottom: 16,
            }}
          >
            🎉 Hunt complete
          </div>
          <DebriefFull content={content} />
          <p className="muted" style={{ marginTop: 32 }}>
            Thanks for playing.
          </p>
        </section>
      )}
    </div>
  );
}

function HuntSignals({
  data,
  hintDetails,
  attendee,
}: {
  data: LevelResponse;
  hintDetails?: LevelContent["hintDetails"];
  attendee: string;
}) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.04)",
        padding: 14,
        borderRadius: 8,
        margin: "16px 0",
      }}
    >
      {data.axiomLogsUrl && (
        <p style={{ margin: 0 }}>
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
      <details style={{ marginTop: 10 }}>
        <summary style={{ cursor: "pointer", color: "var(--muted)" }}>
          💭 stuck? show me a hint
        </summary>
        <p style={{ margin: "10px 0 6px", whiteSpace: "pre-wrap" }}>
          {data.hint}
        </p>
        {hintDetails && (
          <ol style={{ marginTop: 8 }}>
            {hintDetails.steps.map((s, i) => (
              <li key={i}>{renderStep(s, attendee)}</li>
            ))}
          </ol>
        )}
      </details>
    </div>
  );
}

function DebriefFull({ content }: { content: LevelContent }) {
  return (
    <article>
      <h2 style={{ marginTop: 0, marginBottom: 8, color: "var(--accent)" }}>
        {content.debrief.headline}
      </h2>
      <p className="muted" style={{ marginTop: 0 }}>
        Level {content.n} · {content.title}
      </p>
      {content.debrief.sections.map((s, i) => (
        <section key={i} style={{ marginTop: 28 }}>
          <h3 style={{ color: "var(--accent-2)", marginBottom: 10 }}>
            {s.title}
          </h3>
          {s.body.map((p, j) => (
            <p
              key={j}
              style={{ lineHeight: 1.6 }}
              dangerouslySetInnerHTML={{ __html: inlineFmt(p) }}
            />
          ))}
        </section>
      ))}
      {content.debrief.readings && content.debrief.readings.length > 0 && (
        <section style={{ marginTop: 28 }}>
          <h3 style={{ color: "var(--accent-2)" }}>Further reading</h3>
          <ul>
            {content.debrief.readings.map((r, i) => (
              <li key={i}>
                <a href={r.url} target="_blank" rel="noreferrer">
                  {r.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}

// Replace {attendee} / {dataset} placeholders with live values, then wrap
// any `monospace` spans (APL queries or field refs) so they render as code.
function renderStep(step: string, attendee: string): React.ReactNode {
  const dataset = import.meta.env.VITE_AXIOM_DATASET || "scavenger-prod";
  const filled = step
    .replaceAll("{attendee}", attendee)
    .replaceAll("{dataset}", dataset);
  // If the line looks like a code block (starts with two spaces or a bracket),
  // render it in a <code> block for readability.
  if (/^\s{2,}\[|^\s{2,}\|/.test(filled)) {
    return <code style={{ display: "block", padding: "4px 8px", margin: "4px 0" }}>{filled.trim()}</code>;
  }
  return filled;
}

// Render **bold** markdown inline so debrief paragraphs can emphasize terms
// without requiring a full markdown renderer.
function inlineFmt(s: string): string {
  const escaped = s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return escaped
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}
