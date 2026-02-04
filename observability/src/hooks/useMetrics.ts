// useMetrics - React hook for recording metrics

import { useCallback, useRef, useEffect } from 'react';
import { metrics } from '../lib/metrics';

interface UseMetricsOptions {
  component?: string;
}

export function useMetrics(options: UseMetricsOptions = {}) {
  const { component } = options;
  const mountTime = useRef(performance.now());

  // Record component mount time
  useEffect(() => {
    const duration = performance.now() - mountTime.current;
    metrics.timing('component.mount', duration, { component: component ?? 'unknown' });

    return () => {
      // Could record unmount here if needed
    };
  }, [component]);

  const record = useCallback((name: string, value: number, tags?: Record<string, string>) => {
    metrics.record(name, value, { component: component ?? 'unknown', ...tags });
  }, [component]);

  const timing = useCallback((name: string, durationMs: number, tags?: Record<string, string>) => {
    metrics.timing(name, durationMs, { component: component ?? 'unknown', ...tags });
  }, [component]);

  const measure = useCallback(async <T,>(
    name: string, 
    fn: () => Promise<T>,
    tags?: Record<string, string>
  ): Promise<T> => {
    return metrics.measure(name, fn, { component: component ?? 'unknown', ...tags });
  }, [component]);

  const startTimer = useCallback((name: string, tags?: Record<string, string>) => {
    return metrics.startTimer(name, { component: component ?? 'unknown', ...tags });
  }, [component]);

  return { record, timing, measure, startTimer };
}
