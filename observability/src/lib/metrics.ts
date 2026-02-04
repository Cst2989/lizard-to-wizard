// Metrics - Performance and custom metrics collection

interface MetricEntry {
  name: string;
  value: number;
  timestamp: string;
  tags?: Record<string, string>;
}

interface MetricsConfig {
  endpoint?: string;
  flushInterval?: number;
}

class MetricsCollector {
  private endpoint: string;
  private flushInterval: number;
  private buffer: MetricEntry[] = [];
  private timings: Map<string, number[]> = new Map();
  private intervalId?: number;

  constructor(config: MetricsConfig = {}) {
    this.endpoint = config.endpoint ?? '/api/metrics';
    this.flushInterval = config.flushInterval ?? 10000;

    // Start flush interval
    this.intervalId = window.setInterval(() => this.flush(), this.flushInterval);

    // Flush on page unload
    window.addEventListener('beforeunload', () => this.flush());
  }

  // Record a single metric value
  record(name: string, value: number, tags?: Record<string, string>) {
    this.buffer.push({
      name,
      value,
      timestamp: new Date().toISOString(),
      tags,
    });
  }

  // Record a timing metric
  timing(name: string, durationMs: number, tags?: Record<string, string>) {
    // Store for percentile calculations
    if (!this.timings.has(name)) {
      this.timings.set(name, []);
    }
    this.timings.get(name)!.push(durationMs);

    // Also record as a metric
    this.record(name, durationMs, tags);
  }

  // Measure an async operation
  async measure<T>(
    name: string, 
    fn: () => Promise<T>,
    tags?: Record<string, string>
  ): Promise<T> {
    const start = performance.now();
    try {
      return await fn();
    } finally {
      const duration = performance.now() - start;
      this.timing(name, duration, tags);
    }
  }

  // Create a manual timer
  startTimer(name: string, tags?: Record<string, string>): () => number {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      this.timing(name, duration, tags);
      return duration;
    };
  }

  // Get percentile from recorded timings
  getPercentile(name: string, percentile: number): number {
    const values = this.timings.get(name)?.sort((a, b) => a - b) || [];
    if (values.length === 0) return 0;
    
    const index = Math.ceil((percentile / 100) * values.length) - 1;
    return values[Math.max(0, index)];
  }

  // Get statistics for a metric
  getStats(name: string): { min: number; max: number; avg: number; p50: number; p95: number; p99: number; count: number } {
    const values = this.timings.get(name) || [];
    if (values.length === 0) {
      return { min: 0, max: 0, avg: 0, p50: 0, p95: 0, p99: 0, count: 0 };
    }

    const sorted = [...values].sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);

    return {
      min: sorted[0],
      max: sorted[sorted.length - 1],
      avg: sum / values.length,
      p50: this.getPercentile(name, 50),
      p95: this.getPercentile(name, 95),
      p99: this.getPercentile(name, 99),
      count: values.length,
    };
  }

  async flush(): Promise<void> {
    if (this.buffer.length === 0) return;

    const metrics = [...this.buffer];
    this.buffer = [];

    try {
      await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metrics }),
        keepalive: true,
      });
    } catch (error) {
      // Re-add metrics to buffer if flush fails
      this.buffer = [...metrics, ...this.buffer];
      console.error('Failed to flush metrics:', error);
    }
  }

  destroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.flush();
  }
}

// Singleton instance
export const metrics = new MetricsCollector();

export { MetricsCollector, type MetricEntry, type MetricsConfig };
