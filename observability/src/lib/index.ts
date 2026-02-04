// Observability Library - Export all modules

// Logger
export { logger, Logger, type LogLevel, type LogEntry, type LoggerConfig } from './logger';

// Error Tracker
export { errorTracker, ErrorTracker, type ErrorReport, type Breadcrumb, type ErrorTrackerConfig } from './errorTracker';

// Metrics
export { metrics, MetricsCollector, type MetricEntry, type MetricsConfig } from './metrics';

// Web Vitals
export {
  initWebVitals,
  onLCP,
  onFID,
  onCLS,
  onINP,
  onTTFB,
  onFCP,
  type WebVitalMetric,
  type WebVitalCallback,
} from './webVitals';

// Tracing
export {
  tracer,
  createTracer,
  Tracer,
  type Span,
  type SpanEvent,
  type TraceContext,
  type TracerConfig,
} from './tracing';
