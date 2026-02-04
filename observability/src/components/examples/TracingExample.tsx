// TracingExample - Demonstrates distributed tracing

import { useState } from 'react';
import { useTracing } from '../../hooks/useTracing';
import './Examples.css';

export function TracingExample() {
  const { startSpan, endSpan, setAttribute, addEvent } = useTracing({ component: 'TracingExample' });
  const [traces, setTraces] = useState<string[]>([]);

  const addTrace = (message: string) => {
    setTraces(prev => [...prev, message].slice(-8));
  };

  const handleSimpleSpan = () => {
    const span = startSpan('simple.operation');
    setAttribute(span, 'custom.attribute', 'test-value');
    
    addTrace(`Started span: ${span.name} (${span.spanId.slice(0, 8)}...)`);
    
    // Simulate work
    setTimeout(() => {
      endSpan(span, 'ok');
      addTrace(`Ended span: ${span.name} - ${span.duration?.toFixed(2)}ms`);
    }, Math.random() * 300 + 100);
  };

  const handleNestedSpans = async () => {
    const parentSpan = startSpan('parent.operation');
    addTrace(`Started parent: ${parentSpan.spanId.slice(0, 8)}...`);

    // First child
    const child1 = startSpan('child.operation.1');
    setAttribute(child1, 'child.index', 1);
    await new Promise(resolve => setTimeout(resolve, 100));
    endSpan(child1, 'ok');
    addTrace(`  Child 1 complete: ${child1.duration?.toFixed(2)}ms`);

    // Second child
    const child2 = startSpan('child.operation.2');
    setAttribute(child2, 'child.index', 2);
    addEvent(child2, 'processing_started');
    await new Promise(resolve => setTimeout(resolve, 150));
    addEvent(child2, 'processing_completed');
    endSpan(child2, 'ok');
    addTrace(`  Child 2 complete: ${child2.duration?.toFixed(2)}ms`);

    endSpan(parentSpan, 'ok');
    addTrace(`Parent complete: ${parentSpan.duration?.toFixed(2)}ms`);
  };

  const handleErrorSpan = () => {
    const span = startSpan('error.operation');
    addTrace(`Started span: ${span.name}`);

    setTimeout(() => {
      // Simulate error
      const error = new Error('Something went wrong');
      addEvent(span, 'exception', {
        'exception.type': error.name,
        'exception.message': error.message,
      });
      endSpan(span, 'error');
      addTrace(`Span errored: ${error.message}`);
    }, 100);
  };

  return (
    <div className="example-card">
      <h3>Tracing</h3>
      <p>Distributed tracing with spans and events.</p>
      
      <div className="button-group">
        <button onClick={handleSimpleSpan} className="btn primary">Simple Span</button>
        <button onClick={handleNestedSpans} className="btn primary">Nested Spans</button>
        <button onClick={handleErrorSpan} className="btn error">Error Span</button>
      </div>

      <div className="log-output">
        {traces.map((trace, i) => (
          <div key={i} className={`log-line ${trace.includes('error') ? 'error' : 'info'}`}>
            {trace}
          </div>
        ))}
        {traces.length === 0 && <div className="log-empty">Click buttons to create traces</div>}
      </div>
    </div>
  );
}
