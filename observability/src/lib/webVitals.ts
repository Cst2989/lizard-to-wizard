// Web Vitals - Core Web Vitals measurement

interface WebVitalMetric {
  name: 'LCP' | 'FID' | 'CLS' | 'INP' | 'TTFB' | 'FCP';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType: string;
}

type WebVitalCallback = (metric: WebVitalMetric) => void;

// Thresholds for Core Web Vitals
const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  CLS: { good: 0.1, poor: 0.25 },
  INP: { good: 200, poor: 500 },
  TTFB: { good: 800, poor: 1800 },
  FCP: { good: 1800, poor: 3000 },
};

function getRating(name: keyof typeof THRESHOLDS, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[name];
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

// Observe Largest Contentful Paint
export function onLCP(callback: WebVitalCallback): void {
  if (!('PerformanceObserver' in window)) return;

  let lcp: PerformanceEntry | null = null;

  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    lcp = entries[entries.length - 1];
  });

  observer.observe({ type: 'largest-contentful-paint', buffered: true });

  // Report on page hide
  const reportLCP = () => {
    if (lcp) {
      callback({
        name: 'LCP',
        value: lcp.startTime,
        rating: getRating('LCP', lcp.startTime),
        delta: lcp.startTime,
        id: generateId(),
        navigationType: getNavigationType(),
      });
    }
  };

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      reportLCP();
    }
  });
}

// Observe First Input Delay
export function onFID(callback: WebVitalCallback): void {
  if (!('PerformanceObserver' in window)) return;

  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries() as PerformanceEventTiming[];
    const firstInput = entries[0];
    
    if (firstInput) {
      const delay = firstInput.processingStart - firstInput.startTime;
      callback({
        name: 'FID',
        value: delay,
        rating: getRating('FID', delay),
        delta: delay,
        id: generateId(),
        navigationType: getNavigationType(),
      });
    }
  });

  observer.observe({ type: 'first-input', buffered: true });
}

// Observe Cumulative Layout Shift
export function onCLS(callback: WebVitalCallback): void {
  if (!('PerformanceObserver' in window)) return;

  let clsValue = 0;
  let sessionValue = 0;
  let sessionEntries: PerformanceEntry[] = [];

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries() as (PerformanceEntry & { hadRecentInput: boolean; value: number })[]) {
      if (!entry.hadRecentInput) {
        const firstSessionEntry = sessionEntries[0] as PerformanceEntry | undefined;
        const lastSessionEntry = sessionEntries[sessionEntries.length - 1] as PerformanceEntry | undefined;

        // New session if gap > 1s or total > 5s
        if (
          sessionValue &&
          (entry.startTime - (lastSessionEntry?.startTime ?? 0) > 1000 ||
            entry.startTime - (firstSessionEntry?.startTime ?? 0) > 5000)
        ) {
          clsValue = Math.max(clsValue, sessionValue);
          sessionValue = 0;
          sessionEntries = [];
        }

        sessionValue += entry.value;
        sessionEntries.push(entry);
      }
    }
  });

  observer.observe({ type: 'layout-shift', buffered: true });

  // Report on page hide
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      clsValue = Math.max(clsValue, sessionValue);
      callback({
        name: 'CLS',
        value: clsValue,
        rating: getRating('CLS', clsValue),
        delta: clsValue,
        id: generateId(),
        navigationType: getNavigationType(),
      });
    }
  });
}

// Observe Interaction to Next Paint (INP)
export function onINP(callback: WebVitalCallback): void {
  if (!('PerformanceObserver' in window)) return;

  const interactions: number[] = [];

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries() as PerformanceEventTiming[]) {
      if (entry.interactionId) {
        const duration = entry.duration;
        interactions.push(duration);
      }
    }
  });

  observer.observe({ type: 'event', buffered: true });

  // Report on page hide
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && interactions.length > 0) {
      // INP is the 98th percentile of interactions
      const sorted = [...interactions].sort((a, b) => a - b);
      const idx = Math.floor(sorted.length * 0.98);
      const inp = sorted[Math.min(idx, sorted.length - 1)];

      callback({
        name: 'INP',
        value: inp,
        rating: getRating('INP', inp),
        delta: inp,
        id: generateId(),
        navigationType: getNavigationType(),
      });
    }
  });
}

// Observe Time to First Byte
export function onTTFB(callback: WebVitalCallback): void {
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  
  if (navigation) {
    const ttfb = navigation.responseStart - navigation.requestStart;
    callback({
      name: 'TTFB',
      value: ttfb,
      rating: getRating('TTFB', ttfb),
      delta: ttfb,
      id: generateId(),
      navigationType: getNavigationType(),
    });
  }
}

// Observe First Contentful Paint
export function onFCP(callback: WebVitalCallback): void {
  if (!('PerformanceObserver' in window)) return;

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.name === 'first-contentful-paint') {
        callback({
          name: 'FCP',
          value: entry.startTime,
          rating: getRating('FCP', entry.startTime),
          delta: entry.startTime,
          id: generateId(),
          navigationType: getNavigationType(),
        });
        observer.disconnect();
      }
    }
  });

  observer.observe({ type: 'paint', buffered: true });
}

function generateId(): string {
  return `v1-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function getNavigationType(): string {
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  return navigation?.type ?? 'navigate';
}

// Initialize all Web Vitals
export function initWebVitals(callback: WebVitalCallback): void {
  onLCP(callback);
  onFID(callback);
  onCLS(callback);
  onINP(callback);
  onTTFB(callback);
  onFCP(callback);
}

export type { WebVitalMetric, WebVitalCallback };
