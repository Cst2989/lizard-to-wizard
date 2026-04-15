import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { clearAttendee, getAttendee } from "../lib/identity";
import { resetAttendee } from "../lib/api";

export function Reset() {
  const nav = useNavigate();
  const current = getAttendee();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function doReset() {
    if (!current) {
      clearAttendee();
      nav("/");
      return;
    }
    setBusy(true);
    const res = await resetAttendee(current);
    setBusy(false);
    if (!res.ok) {
      setErr(res.error);
      return;
    }
    clearAttendee();
    nav("/");
  }

  return (
    <div className="card">
      <h2>Reset</h2>
      <p>
        Wipe all server-side state for{" "}
        {current ? <code>{current}</code> : <em>(no attendee)</em>} and clear
        your browser storage.
      </p>
      <button disabled={busy} onClick={doReset}>
        {busy ? "…" : "Reset me"}
      </button>
      {err && <p style={{ color: "var(--bad)", marginTop: 12 }}>{err}</p>}
    </div>
  );
}
