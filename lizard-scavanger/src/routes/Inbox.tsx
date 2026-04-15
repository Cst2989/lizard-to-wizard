import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getInbox } from "../lib/api";

type Message = {
  from: string;
  subject: string;
  body: string;
  ts: string;
};

export function Inbox() {
  const { name } = useParams();
  const attendee = name ?? "";
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function poll() {
      const res = await getInbox(attendee);
      if (cancelled) return;
      if (res.ok) {
        setMessages(res.data.messages as Message[]);
      } else {
        setErr(res.error);
      }
    }
    poll();
    const interval = setInterval(poll, 3_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [attendee]);

  return (
    <div className="card">
      <h2>Inbox · <code>{attendee}</code></h2>
      <p className="muted">Polling every 3s. Messages show up here when your alerts fire.</p>
      {err && <p style={{ color: "var(--bad)" }}>{err}</p>}
      {messages && messages.length === 0 && (
        <p className="muted">
          <em>No messages yet. Trigger an alert from level 5.</em>
        </p>
      )}
      {messages?.map((m, i) => (
        <div key={i} className="card" style={{ background: "rgba(179,136,255,0.06)" }}>
          <p style={{ margin: "0 0 4px", fontSize: "0.85em" }} className="muted">
            from <code>{m.from}</code> · {new Date(m.ts).toLocaleTimeString()}
          </p>
          <p style={{ margin: "0 0 8px", fontWeight: 600 }}>{m.subject}</p>
          <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{m.body}</pre>
        </div>
      ))}
    </div>
  );
}
