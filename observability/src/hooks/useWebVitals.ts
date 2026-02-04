// useWebVitals - React hook for Core Web Vitals

import { useEffect, useState, useCallback } from 'react';
import { initWebVitals, type WebVitalMetric } from '../lib/webVitals';
import { metrics } from '../lib/metrics';

interface WebVitalsState {
  LCP?: WebVitalMetric;
  FID?: WebVitalMetric;
  CLS?: WebVitalMetric;
  INP?: WebVitalMetric;
  TTFB?: WebVitalMetric;
  FCP?: WebVitalMetric;
}

interface UseWebVitalsOptions {
  sendToAnalytics?: boolean;
}

export function useWebVitals(options: UseWebVitalsOptions = {}) {
  const { sendToAnalytics = true } = options;
  const [vitals, setVitals] = useState<WebVitalsState>({});

  const handleMetric = useCallback((metric: WebVitalMetric) => {
    setVitals(prev => ({
      ...prev,
      [metric.name]: metric,
    }));

    // Send to metrics collector
    if (sendToAnalytics) {
      metrics.record(`web_vitals.${metric.name.toLowerCase()}`, metric.value, {
        rating: metric.rating,
        navigationType: metric.navigationType,
      });
    }

    // Log in development
    if (import.meta.env.DEV) {
      console.log(`[WebVitals] ${metric.name}: ${metric.value.toFixed(2)} (${metric.rating})`);
    }
  }, [sendToAnalytics]);

  useEffect(() => {
    initWebVitals(handleMetric);
  }, [handleMetric]);

  return vitals;
}
