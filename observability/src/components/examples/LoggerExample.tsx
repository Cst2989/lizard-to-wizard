// LoggerExample - Demonstrates logging usage

import { useState } from 'react';
import { useLogger } from '../../hooks/useLogger';
import './Examples.css';

export function LoggerExample() {
  const log = useLogger({ component: 'LoggerExample' });
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (level: string, message: string) => {
    setLogs(prev => [...prev, `[${level.toUpperCase()}] ${message}`].slice(-10));
  };

  const handleDebug = () => {
    log.debug('Debug message - detailed diagnostic info');
    addLog('debug', 'Debug message - detailed diagnostic info');
  };

  const handleInfo = () => {
    log.info('User performed action', { action: 'button_click' });
    addLog('info', 'User performed action');
  };

  const handleWarn = () => {
    log.warn('Deprecated API used', { api: 'oldMethod' });
    addLog('warn', 'Deprecated API used');
  };

  const handleError = () => {
    log.error('Failed to load data', { endpoint: '/api/data' });
    addLog('error', 'Failed to load data');
  };

  return (
    <div className="example-card">
      <h3>Logger</h3>
      <p>Structured logging with levels and context.</p>
      
      <div className="button-group">
        <button onClick={handleDebug} className="btn debug">Debug</button>
        <button onClick={handleInfo} className="btn info">Info</button>
        <button onClick={handleWarn} className="btn warn">Warn</button>
        <button onClick={handleError} className="btn error">Error</button>
      </div>

      <div className="log-output">
        {logs.map((log, i) => (
          <div key={i} className={`log-line ${log.includes('[DEBUG]') ? 'debug' : log.includes('[INFO]') ? 'info' : log.includes('[WARN]') ? 'warn' : 'error'}`}>
            {log}
          </div>
        ))}
        {logs.length === 0 && <div className="log-empty">Click buttons to see logs</div>}
      </div>
    </div>
  );
}
