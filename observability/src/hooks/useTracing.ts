// useTracing - React hook for distributed tracing

import { useCallback, useRef, useEffect } from 'react';
import { tracer, type Span } from '../lib/tracing';

interface UseTracingOptions {
  component?: string;
}

export function useTracing(options: UseTracingOptions = {}) {
  const { component } = options;
  const componentSpan = useRef<Span | null>(null);

  // Create a span for component lifecycle
  useEffect(() => {
    if (component) {
      componentSpan.current = tracer.startSpan(`${component}.render`);
      tracer.setAttribute(componentSpan.current, 'component.name', component);
    }

    return () => {
      if (componentSpan.current) {
        tracer.endSpan(componentSpan.current, 'ok');
      }
    };
  }, [component]);

  const startSpan = useCallback((name: string): Span => {
    const parent = componentSpan.current ?? undefined;
    const span = tracer.startSpan(name, { parent });
    if (component) {
      tracer.setAttribute(span, 'component.name', component);
    }
    return span;
  }, [component]);

  const endSpan = useCallback((span: Span, status: 'ok' | 'error' = 'ok') => {
    tracer.endSpan(span, status);
  }, []);

  const setAttribute = useCallback((span: Span, key: string, value: string | number | boolean) => {
    tracer.setAttribute(span, key, value);
  }, []);

  const addEvent = useCallback((span: Span, name: string, attributes?: Record<string, string | number | boolean>) => {
    tracer.addEvent(span, name, attributes);
  }, []);

  const recordException = useCallback((span: Span, error: Error) => {
    tracer.recordException(span, error);
  }, []);

  const traceFetch = useCallback(async (url: string, options?: RequestInit) => {
    return tracer.traceFetch(url, options);
  }, []);

  return {
    startSpan,
    endSpan,
    setAttribute,
    addEvent,
    recordException,
    traceFetch,
  };
}
