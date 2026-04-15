import { useParams } from "react-router-dom";

export function Inbox() {
  const { name } = useParams();
  return (
    <div className="card">
      <h2>Inbox · {name}</h2>
      <p className="muted">Webhook-delivered keys will appear here.</p>
    </div>
  );
}
