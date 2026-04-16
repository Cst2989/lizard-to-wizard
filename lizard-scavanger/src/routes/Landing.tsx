import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../lib/api";
import {
  getAttendee,
  setAttendee,
  validateNameInput,
} from "../lib/identity";

export function Landing() {
  const nav = useNavigate();
  const existing = getAttendee();
  const [name, setName] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Pre-warm the Netlify Functions to avoid cold-start lag on the first
  // level click. Fire-and-forget; we don't care if it fails.
  useEffect(() => {
    fetch("/api/health").catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationErr = validateNameInput(name);
    if (validationErr) {
      setErr(validationErr);
      return;
    }
    setBusy(true);
    setErr(null);
    const res = await register(name);
    setBusy(false);
    if (!res.ok) {
      setErr(res.error);
      return;
    }
    setAttendee(res.data.attendee);
    nav(res.data.level1Url);
  }

  return (
    <section className="hero">
      <h1>SRE Scavenger Hunt</h1>
      <p>
        You'll hunt for keys hidden inside real telemetry — traces, logs, metrics, alerts.
        Use Sentry and Axiom the way real on-call engineers do.
      </p>

      {existing && (
        <div className="card" style={{ marginTop: 32, textAlign: "left" }}>
          <p>
            You are logged in as <code>{existing}</code>. To start a fresh run,{" "}
            <a href="/reset">reset</a>.
          </p>
        </div>
      )}

      {!existing && (
        <form
          onSubmit={handleSubmit}
          style={{
            marginTop: 32,
            display: "flex",
            gap: 12,
            maxWidth: 420,
            marginInline: "auto",
          }}
        >
          <input
            type="text"
            placeholder="your display name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
          <button type="submit" disabled={busy}>
            {busy ? "…" : "Start →"}
          </button>
        </form>
      )}

      {err && (
        <p style={{ color: "var(--bad)", marginTop: 12 }}>{err}</p>
      )}

      <p className="muted" style={{ marginTop: 24, fontSize: "0.85em" }}>
        Your name is tagged on every event you generate so you can filter the
        noise. See <a href="/about">/about</a> for shared tool logins.
      </p>
    </section>
  );
}
