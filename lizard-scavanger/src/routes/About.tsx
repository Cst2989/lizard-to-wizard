export function About() {
  return (
    <div className="card">
      <h2>About this workshop</h2>
      <p>
        Everyone shares two logins. Every event you generate lands in the same
        project, tagged with your <code>attendee</code> name — filter to your
        tag to see your own signals among everyone else's.
      </p>

      <h3>Shared logins</h3>
      <p>
        <strong>Sentry:</strong>{" "}
        <code>{import.meta.env.VITE_SHARED_SENTRY_LOGIN ?? "(provided on workshop day)"}</code>
      </p>
      <p>
        <strong>Axiom:</strong>{" "}
        <code>{import.meta.env.VITE_SHARED_AXIOM_LOGIN ?? "(provided on workshop day)"}</code>
      </p>
      <p className="muted" style={{ fontSize: "0.85em" }}>
        If you share a login with your neighbours, you'll trip over each
        other's dashboards. That's a feature, not a bug — filtering is the
        lesson.
      </p>

      <h3>Rules of engagement</h3>
      <ul>
        <li>Play with just your own attendee tag.</li>
        <li>Don't break the shared dashboards — view-only, please.</li>
        <li>If you get stuck for 5 minutes, ask the room.</li>
      </ul>
    </div>
  );
}
