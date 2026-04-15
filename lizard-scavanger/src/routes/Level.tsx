import { Link, useParams } from "react-router-dom";
import { LevelLayout } from "../components/LevelLayout";
import { LEVELS } from "../levels/content";
import { getAttendee } from "../lib/identity";

export function Level() {
  const { n, key } = useParams();
  const levelNum = parseInt(n ?? "0", 10);
  const content = LEVELS[levelNum];
  const attendee = getAttendee();

  if (!attendee) {
    return (
      <div className="card">
        <h2>Signup first</h2>
        <p>
          You need a display name before you can play. Head to <Link to="/">home</Link>.
        </p>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="card">
        <h2>Unknown level</h2>
        <p className="muted">
          No level {n}. Try <Link to="/">home</Link>.
        </p>
      </div>
    );
  }

  return <LevelLayout content={content} attendee={attendee} currentKey={key ?? ""} />;
}
