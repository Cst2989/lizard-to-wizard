import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { initClientSentry, tagAttendee, Sentry } from "./lib/sentry";
import { getAttendee } from "./lib/identity";
import "./styles.css";

initClientSentry();
tagAttendee(getAttendee());

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Sentry.ErrorBoundary
      fallback={({ error }) => (
        <div className="app">
          <div className="card">
            <h2>Something broke.</h2>
            <p className="muted">
              This error has been reported. You can continue by reloading.
            </p>
            <pre style={{ fontSize: "0.75em" }}>{String(error)}</pre>
          </div>
        </div>
      )}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Sentry.ErrorBoundary>
  </StrictMode>
);
