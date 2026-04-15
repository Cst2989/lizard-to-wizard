import { useParams } from "react-router-dom";

export function Level() {
  const { n, key } = useParams();
  return (
    <div className="card">
      <h2>Level {n}</h2>
      <p className="muted">key presented: <code>{key}</code></p>
      <p className="muted">Level content coming soon.</p>
    </div>
  );
}
