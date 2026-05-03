import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Only mount to DOM if this is the standalone app (not a remote module)
// When used as a remote module, the shell will handle mounting
if (document.getElementById('root')) {
  const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
  );

  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
