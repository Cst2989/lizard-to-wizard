import { Routes, Route, Link } from "react-router-dom";
import { Landing } from "./routes/Landing";
import { Level } from "./routes/Level";
import { Inbox } from "./routes/Inbox";
import { About } from "./routes/About";
import { Reset } from "./routes/Reset";

export default function App() {
  return (
    <div className="app">
      <header className="app-header">
        <Link to="/" className="brand">🦎 lizard scavenger</Link>
        <nav>
          <Link to="/about">about</Link>
          <Link to="/reset">reset</Link>
        </nav>
      </header>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/level/:n/:key" element={<Level />} />
          <Route path="/inbox/:name" element={<Inbox />} />
          <Route path="/about" element={<About />} />
          <Route path="/reset" element={<Reset />} />
          <Route path="*" element={<p className="muted">lost? try <Link to="/">home</Link>.</p>} />
        </Routes>
      </main>
    </div>
  );
}
