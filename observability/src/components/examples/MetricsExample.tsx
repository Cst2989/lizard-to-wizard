// MetricsExample - Demonstrates metrics collection

import { useState, useCallback } from 'react';
import { useMetrics } from '../../hooks/useMetrics';
import { metrics } from '../../lib/metrics';
import './Examples.css';

export function MetricsExample() {
  const { timing, startTimer, measure } = useMetrics({ component: 'MetricsExample' });
  const [results, setResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setResults(prev => [...prev, message].slice(-5));
  };

  const handleTiming = () => {
    const duration = Math.random() * 500 + 100; // 100-600ms
    timing('example.operation', duration);
    addResult(`Recorded timing: ${duration.toFixed(2)}ms`);
  };

  const handleTimer = useCallback(async () => {
    const stopTimer = startTimer('example.async_operation');
    
    // Simulate async work
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 200));
    
    const duration = stopTimer();
    addResult(`Timer measured: ${duration.toFixed(2)}ms`);
  }, [startTimer]);

  const handleMeasure = async () => {
    const result = await measure('example.fetch', async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 100));
      return { data: 'example' };
    });
    addResult(`Measured fetch, got: ${JSON.stringify(result)}`);
  };

  const handleStats = () => {
    const stats = metrics.getStats('example.operation');
    addResult(`Stats - P50: ${stats.p50.toFixed(0)}ms, P95: ${stats.p95.toFixed(0)}ms, Count: ${stats.count}`);
  };

  return (
    <div className="example-card">
      <h3>Metrics</h3>
      <p>Record timings and custom metrics.</p>
      
      <div className="button-group">
        <button onClick={handleTiming} className="btn primary">Record Timing</button>
        <button onClick={handleTimer} className="btn primary">Start Timer</button>
        <button onClick={handleMeasure} className="btn primary">Measure Async</button>
        <button onClick={handleStats} className="btn secondary">Get Stats</button>
      </div>

      <div className="log-output">
        {results.map((result, i) => (
          <div key={i} className="log-line info">{result}</div>
        ))}
        {results.length === 0 && <div className="log-empty">Click buttons to record metrics</div>}
      </div>
    </div>
  );
}
