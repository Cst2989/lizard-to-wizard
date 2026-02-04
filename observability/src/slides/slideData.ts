// slides/slideData.ts - Observability presentation content

export interface Slide {
  id: string;
  title: string;
  subtitle?: string;
  content: SlideContent[];
  category: string;
}

export type SlideContent = 
  | { type: 'text'; value: string }
  | { type: 'bullets'; items: string[] }
  | { type: 'code'; language: string; value: string }
  | { type: 'diagram'; value: string }
  | { type: 'comparison'; left: { title: string; items: string[] }; right: { title: string; items: string[] } }
  | { type: 'steps'; items: { title: string; description: string }[] };

export const slides: Slide[] = [
  // ==================== INTRO ====================
  {
    id: 'intro',
    title: 'Frontend Observability',
    subtitle: 'Understanding What Your Application Is Doing',
    category: 'Introduction',
    content: [
      { type: 'text', value: 'Observability is the ability to understand what\'s happening inside your system by examining its outputs.' },
      { type: 'bullets', items: [
        'Why Observability Matters',
        'Distributed Systems Challenges',
        'The Three Pillars: Logs, Metrics, Traces',
        'Error Tracking & Propagation',
        'Dashboards & Monitoring',
        'Performance Monitoring',
        'Frontend-Specific Concerns',
      ]},
    ],
  },

  // ==================== WHY OBSERVABILITY ====================
  {
    id: 'why-observability',
    title: 'Why Observability?',
    subtitle: 'Beyond Traditional Monitoring',
    category: 'Why Observability',
    content: [
      { type: 'text', value: 'Modern applications are complex. Observability helps you ask and answer questions you didn\'t know you needed to ask.' },
      { type: 'comparison', 
        left: { title: 'Traditional Monitoring', items: [
          'Predefined dashboards',
          'Known failure modes',
          'Alert when threshold exceeded',
          'What is broken?',
        ]},
        right: { title: 'Observability', items: [
          'Ad-hoc exploration',
          'Unknown unknowns',
          'Understand system behavior',
          'Why is it broken?',
        ]}
      },
    ],
  },
  {
    id: 'observability-benefits',
    title: 'Benefits of Observability',
    subtitle: 'What You Gain',
    category: 'Why Observability',
    content: [
      { type: 'steps', items: [
        { title: 'Faster Debugging', description: 'Trace issues from user impact to root cause in minutes, not hours' },
        { title: 'Proactive Detection', description: 'Identify issues before users report them' },
        { title: 'Better Decisions', description: 'Data-driven prioritization of bugs and features' },
        { title: 'User Experience Insights', description: 'Understand real user journeys and pain points' },
        { title: 'System Understanding', description: 'Know how your distributed system actually behaves' },
      ]},
    ],
  },
  {
    id: 'three-pillars',
    title: 'The Three Pillars',
    subtitle: 'Logs, Metrics, Traces',
    category: 'Why Observability',
    content: [
      { type: 'diagram', value: `┌─────────────────────────────────────────────────────────────┐
│                      OBSERVABILITY                           │
│                                                              │
│    ┌──────────┐      ┌──────────┐      ┌──────────┐         │
│    │   LOGS   │      │ METRICS  │      │  TRACES  │         │
│    │          │      │          │      │          │         │
│    │  Events  │      │  Numbers │      │ Requests │         │
│    │  Details │      │  Trends  │      │  Flow    │         │
│    │  Context │      │  Alerts  │      │  Timing  │         │
│    └──────────┘      └──────────┘      └──────────┘         │
│         │                 │                 │                │
│         └─────────────────┼─────────────────┘                │
│                           ▼                                  │
│                 ┌──────────────────┐                         │
│                 │  FULL PICTURE    │                         │
│                 │  of your system  │                         │
│                 └──────────────────┘                         │
└─────────────────────────────────────────────────────────────┘` },
    ],
  },

  // ==================== DISTRIBUTED SYSTEMS ====================
  {
    id: 'distributed-intro',
    title: 'Distributed Systems',
    subtitle: 'The Modern Reality',
    category: 'Distributed Systems',
    content: [
      { type: 'text', value: 'Modern frontend applications interact with multiple backend services, third-party APIs, and CDNs. Understanding the full request flow is critical.' },
      { type: 'diagram', value: `┌────────────┐     ┌────────────┐     ┌────────────┐
│   Browser  │────▶│    CDN     │────▶│  API GW    │
└────────────┘     └────────────┘     └─────┬──────┘
                                            │
              ┌─────────────────────────────┼─────────────────┐
              │                             ▼                 │
              │  ┌──────────┐    ┌──────────┐   ┌──────────┐  │
              │  │  Auth    │    │  Orders  │   │  Users   │  │
              │  │ Service  │    │ Service  │   │ Service  │  │
              │  └────┬─────┘    └────┬─────┘   └────┬─────┘  │
              │       │               │              │        │
              │       └───────────────┼──────────────┘        │
              │                       ▼                       │
              │               ┌──────────────┐                │
              │               │   Database   │                │
              │               └──────────────┘                │
              └───────────────────────────────────────────────┘` },
    ],
  },
  {
    id: 'distributed-challenges',
    title: 'Distributed System Challenges',
    subtitle: 'Why Debugging Is Hard',
    category: 'Distributed Systems',
    content: [
      { type: 'bullets', items: [
        'Partial Failures - Some services up, some down',
        'Network Latency - Variable and unpredictable',
        'Race Conditions - Timing-dependent bugs',
        'Cascading Failures - One failure triggers others',
        'Data Inconsistency - Eventual consistency issues',
        'No Global Clock - Different timestamps across services',
        'Log Fragmentation - Logs scattered across services',
        'Correlation Hell - Which request caused which log?',
      ]},
    ],
  },
  {
    id: 'app-types',
    title: 'Types of Applications',
    subtitle: 'Different Observability Needs',
    category: 'Distributed Systems',
    content: [
      { type: 'comparison', 
        left: { title: 'Single Page Apps (SPAs)', items: [
          'Client-side errors critical',
          'Long session durations',
          'Rich user interactions',
          'API call performance',
          'Bundle size impacts',
        ]},
        right: { title: 'Server-Side Rendered (SSR)', items: [
          'Server errors equally important',
          'Time to First Byte (TTFB)',
          'Hydration performance',
          'Edge caching effectiveness',
          'Revalidation patterns',
        ]}
      },
      { type: 'text', value: 'Mobile apps, PWAs, and desktop apps each have unique observability considerations.' },
    ],
  },

  // ==================== LOGS ====================
  {
    id: 'logs-intro',
    title: 'Logging',
    subtitle: 'The Foundation of Observability',
    category: 'Logs',
    content: [
      { type: 'text', value: 'Logs are timestamped records of discrete events that happened in your application.' },
      { type: 'bullets', items: [
        'Events that happened (user clicked, API called)',
        'State changes (login, logout, payment)',
        'Errors and exceptions',
        'Debug information for troubleshooting',
        'Audit trails for compliance',
      ]},
    ],
  },
  {
    id: 'log-levels',
    title: 'Log Levels',
    subtitle: 'Categorizing Importance',
    category: 'Logs',
    content: [
      { type: 'steps', items: [
        { title: 'DEBUG', description: 'Detailed diagnostic info. Only in development. Performance impact.' },
        { title: 'INFO', description: 'General operational events. User actions, state changes.' },
        { title: 'WARN', description: 'Something unexpected but recoverable. Retry succeeded, deprecation.' },
        { title: 'ERROR', description: 'Something failed that should have worked. Exceptions, failed operations.' },
        { title: 'FATAL', description: 'Application cannot continue. Crash, unrecoverable state.' },
      ]},
    ],
  },
  {
    id: 'structured-logs',
    title: 'Structured Logging',
    subtitle: 'Machine-Readable Logs',
    category: 'Logs',
    content: [
      { type: 'text', value: 'Use JSON logs instead of plain text for better parsing and querying.' },
      { type: 'code', language: 'typescript', value: `// ❌ Unstructured logging
console.log("User 123 clicked button checkout at 2024-01-15T10:30:00Z");

// ✅ Structured logging
logger.info({
  event: 'button_click',
  userId: '123',
  buttonId: 'checkout',
  timestamp: new Date().toISOString(),
  page: '/cart',
  sessionId: 'abc-123',
  metadata: {
    cartValue: 99.99,
    itemCount: 3,
  }
});

// Output:
{
  "level": "info",
  "event": "button_click",
  "userId": "123",
  "buttonId": "checkout",
  "timestamp": "2024-01-15T10:30:00.000Z",
  ...
}` },
    ],
  },
  {
    id: 'frontend-logger',
    title: 'Frontend Logger Implementation',
    subtitle: 'Building a Logger',
    category: 'Logs',
    content: [
      { type: 'code', language: 'typescript', value: `type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
}

class Logger {
  private buffer: LogEntry[] = [];
  private flushInterval = 5000; // 5 seconds

  constructor() {
    setInterval(() => this.flush(), this.flushInterval);
    window.addEventListener('beforeunload', () => this.flush());
  }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: {
        ...context,
        url: window.location.href,
        userAgent: navigator.userAgent,
        sessionId: this.getSessionId(),
      },
    };
    
    this.buffer.push(entry);
    
    // Flush immediately for errors
    if (level === 'error') this.flush();
  }

  async flush() {
    if (this.buffer.length === 0) return;
    const logs = [...this.buffer];
    this.buffer = [];
    
    await fetch('/api/logs', {
      method: 'POST',
      body: JSON.stringify({ logs }),
      keepalive: true, // Ensures logs are sent on page unload
    });
  }
}` },
    ],
  },
  {
    id: 'log-collection',
    title: 'Log Collection',
    subtitle: 'Getting Logs to Your Backend',
    category: 'Logs',
    content: [
      { type: 'diagram', value: `┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   Browser   │──────▶│  Log API    │──────▶│  Log Store  │
│   (Client)  │       │  (Backend)  │       │ (Elastic,   │
│             │       │             │       │  Loki, etc) │
└─────────────┘       └─────────────┘       └──────┬──────┘
                                                   │
                      ┌────────────────────────────┘
                      ▼
              ┌──────────────┐
              │  Dashboards  │
              │  (Grafana,   │
              │   Kibana)    │
              └──────────────┘` },
      { type: 'bullets', items: [
        'Batch logs to reduce network requests',
        'Use beacon API or keepalive for reliability',
        'Compress payloads for bandwidth efficiency',
        'Sample high-volume events (not errors)',
        'Consider privacy - sanitize PII',
      ]},
    ],
  },
  {
    id: 'log-services',
    title: 'Log Management Services',
    subtitle: 'Where to Store Logs',
    category: 'Logs',
    content: [
      { type: 'bullets', items: [
        'Datadog - Full observability platform, expensive but comprehensive',
        'Elastic Stack (ELK) - Self-hosted, powerful search with Kibana',
        'Grafana Loki - Log aggregation optimized for Grafana',
        'Splunk - Enterprise-grade, expensive',
        'AWS CloudWatch - Good if already on AWS',
        'Google Cloud Logging - Good if on GCP',
        'Logtail / BetterStack - Simple, developer-friendly',
        'Sentry - Best for error tracking specifically',
      ]},
      { type: 'text', value: '💡 Consider cost, retention, query capabilities, and integration with your stack.' },
    ],
  },

  // ==================== ERRORS ====================
  {
    id: 'errors-intro',
    title: 'Error Tracking',
    subtitle: 'Catching and Understanding Failures',
    category: 'Errors',
    content: [
      { type: 'text', value: 'Errors are inevitable. Good error tracking helps you find and fix them quickly.' },
      { type: 'bullets', items: [
        'JavaScript runtime errors',
        'Unhandled promise rejections',
        'Network/API failures',
        'Rendering errors (React Error Boundaries)',
        'User-facing error states',
        'Performance degradation (errors from slowness)',
      ]},
    ],
  },
  {
    id: 'global-error-handlers',
    title: 'Global Error Handlers',
    subtitle: 'Catching All Errors',
    category: 'Errors',
    content: [
      { type: 'code', language: 'typescript', value: `// Catch synchronous errors
window.onerror = (message, source, lineno, colno, error) => {
  errorTracker.capture({
    type: 'error',
    message: String(message),
    source,
    lineno,
    colno,
    stack: error?.stack,
  });
  return false; // Let default handling continue
};

// Catch unhandled promise rejections
window.onunhandledrejection = (event) => {
  errorTracker.capture({
    type: 'unhandledrejection',
    message: event.reason?.message || String(event.reason),
    stack: event.reason?.stack,
  });
};

// React Error Boundary
class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    errorTracker.capture({
      type: 'react',
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  }
}` },
    ],
  },
  {
    id: 'error-context',
    title: 'Error Context',
    subtitle: 'The Information You Need',
    category: 'Errors',
    content: [
      { type: 'text', value: 'An error without context is nearly useless. Always include:' },
      { type: 'code', language: 'typescript', value: `interface ErrorReport {
  // Basic error info
  message: string;
  stack: string;
  type: 'error' | 'unhandledrejection' | 'react' | 'network';
  
  // Where it happened
  url: string;
  route: string;
  componentStack?: string;
  
  // Who experienced it
  userId?: string;
  sessionId: string;
  
  // When it happened
  timestamp: string;
  
  // Environment
  userAgent: string;
  viewport: { width: number; height: number };
  
  // Application state
  appVersion: string;
  featureFlags: Record<string, boolean>;
  
  // Breadcrumbs - what happened before
  breadcrumbs: Array<{
    type: 'click' | 'navigation' | 'api' | 'console';
    message: string;
    timestamp: string;
  }>;
}` },
    ],
  },
  {
    id: 'error-propagation',
    title: 'Error Propagation',
    subtitle: 'From Frontend to Backend',
    category: 'Errors',
    content: [
      { type: 'text', value: 'Connect frontend errors to backend failures using correlation IDs.' },
      { type: 'code', language: 'typescript', value: `// Generate or get correlation ID
const correlationId = response.headers.get('x-correlation-id') 
  || crypto.randomUUID();

// Include in error reports
errorTracker.capture({
  ...errorData,
  correlationId,
});

// Include in subsequent API calls
fetch('/api/data', {
  headers: {
    'x-correlation-id': correlationId,
  },
});

// Backend logs the same ID
// Now you can search logs across frontend + backend for the same request!` },
      { type: 'diagram', value: `Frontend Error                    Backend Logs
     │                                 │
     │  correlationId: "abc-123"       │
     │                                 │
     └──────────────────┬──────────────┘
                        │
                        ▼
              ┌──────────────────┐
              │ Search: abc-123  │
              │ ──────────────── │
              │ FE: Button click │
              │ FE: API call     │
              │ BE: Request recv │
              │ BE: DB query     │
              │ BE: Error thrown │
              │ FE: 500 received │
              └──────────────────┘` },
    ],
  },
  {
    id: 'error-grouping',
    title: 'Error Grouping & Deduplication',
    subtitle: 'Managing Error Volume',
    category: 'Errors',
    content: [
      { type: 'text', value: 'Thousands of the same error from different users should be grouped together.' },
      { type: 'bullets', items: [
        'Group by stack trace fingerprint',
        'Normalize dynamic values (IDs, URLs)',
        'Track: first seen, last seen, occurrence count',
        'Track: affected users count',
        'Allow marking as resolved, ignored, or assigned',
        'Reopen if error recurs after resolution',
      ]},
      { type: 'code', language: 'typescript', value: `// Generate error fingerprint for grouping
function getErrorFingerprint(error: ErrorReport): string {
  const normalized = error.stack
    ?.replace(/:\\d+:\\d+/g, '') // Remove line:col
    ?.replace(/[a-f0-9-]{36}/gi, '[id]') // Normalize UUIDs
    ?.replace(/\\d+/g, '[n]'); // Normalize numbers
  
  return hash(normalized || error.message);
}` },
    ],
  },
  {
    id: 'error-services',
    title: 'Error Tracking Services',
    subtitle: 'Specialized Tools',
    category: 'Errors',
    content: [
      { type: 'bullets', items: [
        'Sentry - Most popular, excellent source maps, breadcrumbs',
        'Bugsnag - Good stability monitoring, release tracking',
        'Rollbar - Real-time error alerting, deploy tracking',
        'TrackJS - Simple, focused on JavaScript errors',
        'LogRocket - Session replay + error tracking',
        'Datadog RUM - Part of larger observability platform',
        'New Relic Browser - APM integration',
      ]},
      { type: 'text', value: '💡 Most offer free tiers. Sentry is the most common choice for frontend teams.' },
    ],
  },

  // ==================== TRACING ====================
  {
    id: 'tracing-intro',
    title: 'Distributed Tracing',
    subtitle: 'Following Requests Across Services',
    category: 'Tracing',
    content: [
      { type: 'text', value: 'A trace represents the journey of a request through your distributed system.' },
      { type: 'diagram', value: `Trace: abc-123
├── Span: Browser (0-500ms)
│   └── Span: API Call (50-450ms)
│       └── Span: API Gateway (60-440ms)
│           ├── Span: Auth Service (70-120ms)
│           └── Span: Orders Service (130-430ms)
│               ├── Span: Database Query (150-200ms)
│               └── Span: Cache Lookup (210-220ms)

Timeline:
0ms  ──────────────────────────────────────────── 500ms
│ Browser ─────────────────────────────────────────│
│    │ API Call ────────────────────────────────│  │
│    │    │ Auth ──│                            │  │
│    │    │        │ Orders ────────────────────│  │
│    │    │        │    │ DB ─│  │ Cache │      │  │` },
    ],
  },
  {
    id: 'trace-concepts',
    title: 'Tracing Concepts',
    subtitle: 'Traces, Spans, and Context',
    category: 'Tracing',
    content: [
      { type: 'steps', items: [
        { title: 'Trace', description: 'The entire journey of a request. Has a unique trace ID.' },
        { title: 'Span', description: 'A single operation within a trace. Has timing, name, and metadata.' },
        { title: 'Parent Span', description: 'Spans can be nested. Child spans belong to parent spans.' },
        { title: 'Trace Context', description: 'Headers passed between services to link spans together.' },
        { title: 'Baggage', description: 'Custom data propagated through the trace (user ID, tenant, etc).' },
      ]},
    ],
  },
  {
    id: 'frontend-tracing',
    title: 'Frontend Tracing',
    subtitle: 'Tracing in the Browser',
    category: 'Tracing',
    content: [
      { type: 'code', language: 'typescript', value: `import { trace, context } from '@opentelemetry/api';

const tracer = trace.getTracer('frontend');

async function loadDashboard() {
  // Start a new span
  const span = tracer.startSpan('loadDashboard');
  
  try {
    // Child span for API call
    const apiSpan = tracer.startSpan('fetchData', {
      parent: span,
    });
    
    // Inject trace context into headers
    const headers = {};
    propagation.inject(context.active(), headers);
    
    const response = await fetch('/api/dashboard', { headers });
    
    apiSpan.setAttribute('http.status_code', response.status);
    apiSpan.end();
    
    // More operations...
    
    span.setStatus({ code: SpanStatusCode.OK });
  } catch (error) {
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: error.message,
    });
    span.recordException(error);
  } finally {
    span.end();
  }
}` },
    ],
  },
  {
    id: 'trace-context-propagation',
    title: 'Trace Context Propagation',
    subtitle: 'Connecting Frontend to Backend',
    category: 'Tracing',
    content: [
      { type: 'text', value: 'Pass trace context via HTTP headers so backend can continue the trace.' },
      { type: 'code', language: 'text', value: `HTTP Request Headers:
──────────────────────
traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01
             ▲  ▲                                ▲                 ▲
             │  │                                │                 │
           version  trace-id (32 hex)     span-id (16 hex)   flags

tracestate: vendor1=value1,vendor2=value2

baggage: userId=123,tenant=acme` },
      { type: 'bullets', items: [
        'W3C Trace Context is the standard format',
        'traceparent contains trace ID and parent span ID',
        'Backend creates child spans under this parent',
        'Full request journey is now connected!',
      ]},
    ],
  },
  {
    id: 'opentelemetry',
    title: 'OpenTelemetry',
    subtitle: 'The Standard for Observability',
    category: 'Tracing',
    content: [
      { type: 'text', value: 'OpenTelemetry (OTel) is an open standard for traces, metrics, and logs.' },
      { type: 'bullets', items: [
        'Vendor-neutral - send data anywhere',
        'Auto-instrumentation for common libraries',
        'Supports JavaScript, Python, Java, Go, and more',
        'Browser SDK for frontend tracing',
        'Collector for processing and exporting data',
      ]},
      { type: 'code', language: 'typescript', value: `import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { ZoneContextManager } from '@opentelemetry/context-zone';

const provider = new WebTracerProvider();

// Auto-instrument fetch calls
provider.addInstrumentation(new FetchInstrumentation({
  propagateTraceHeaderCorsUrls: [/api\\.mysite\\.com/],
}));

provider.register({
  contextManager: new ZoneContextManager(),
});` },
    ],
  },
  {
    id: 'tracing-services',
    title: 'Tracing Platforms',
    subtitle: 'Where to View Traces',
    category: 'Tracing',
    content: [
      { type: 'bullets', items: [
        'Jaeger - Open source, CNCF project, self-hosted',
        'Zipkin - Open source, simple, Twitter-originated',
        'Tempo (Grafana) - Cost-effective, Grafana integration',
        'Datadog APM - Full platform, expensive but excellent',
        'Honeycomb - Great query interface, event-based',
        'Lightstep - ServiceNow, good for microservices',
        'AWS X-Ray - Good if on AWS',
        'New Relic - Full APM suite',
      ]},
    ],
  },

  // ==================== METRICS ====================
  {
    id: 'metrics-intro',
    title: 'Metrics',
    subtitle: 'Numbers That Tell a Story',
    category: 'Metrics',
    content: [
      { type: 'text', value: 'Metrics are numerical measurements collected over time. They show trends and patterns.' },
      { type: 'bullets', items: [
        'Counter - Cumulative values (total requests)',
        'Gauge - Current value (memory usage, active users)',
        'Histogram - Distribution of values (response times)',
        'Summary - Statistical summary (percentiles)',
      ]},
    ],
  },
  {
    id: 'frontend-metrics',
    title: 'Frontend Metrics',
    subtitle: 'What to Measure',
    category: 'Metrics',
    content: [
      { type: 'comparison', 
        left: { title: 'Performance Metrics', items: [
          'Page Load Time',
          'Time to First Byte (TTFB)',
          'First Contentful Paint (FCP)',
          'Largest Contentful Paint (LCP)',
          'First Input Delay (FID)',
          'Cumulative Layout Shift (CLS)',
          'Time to Interactive (TTI)',
        ]},
        right: { title: 'Business Metrics', items: [
          'User sessions',
          'Page views per session',
          'Bounce rate',
          'Conversion rate',
          'Error rate',
          'Feature usage',
          'User satisfaction (survey)',
        ]}
      },
    ],
  },
  {
    id: 'core-web-vitals',
    title: 'Core Web Vitals',
    subtitle: 'Google\'s Performance Metrics',
    category: 'Metrics',
    content: [
      { type: 'steps', items: [
        { title: 'LCP - Largest Contentful Paint', description: 'Loading performance. Should be < 2.5s. Measures when main content is visible.' },
        { title: 'FID - First Input Delay', description: 'Interactivity. Should be < 100ms. Time until page responds to user input.' },
        { title: 'CLS - Cumulative Layout Shift', description: 'Visual stability. Should be < 0.1. How much the page layout shifts unexpectedly.' },
        { title: 'INP - Interaction to Next Paint', description: 'Replacing FID in 2024. Measures responsiveness throughout the session.' },
      ]},
      { type: 'code', language: 'typescript', value: `import { onLCP, onFID, onCLS, onINP } from 'web-vitals';

onLCP(metric => sendToAnalytics('LCP', metric));
onFID(metric => sendToAnalytics('FID', metric));
onCLS(metric => sendToAnalytics('CLS', metric));
onINP(metric => sendToAnalytics('INP', metric));` },
    ],
  },
  {
    id: 'custom-metrics',
    title: 'Custom Metrics',
    subtitle: 'Application-Specific Measurements',
    category: 'Metrics',
    content: [
      { type: 'code', language: 'typescript', value: `class MetricsCollector {
  private metrics: Map<string, number[]> = new Map();

  // Record a timing metric
  timing(name: string, durationMs: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(durationMs);
  }

  // Measure async operations
  async measure<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    try {
      return await fn();
    } finally {
      this.timing(name, performance.now() - start);
    }
  }

  // Get percentiles
  getPercentile(name: string, percentile: number): number {
    const values = this.metrics.get(name)?.sort((a, b) => a - b) || [];
    const index = Math.ceil((percentile / 100) * values.length) - 1;
    return values[index] || 0;
  }
}

// Usage
await metrics.measure('checkout_flow', async () => {
  await validateCart();
  await processPayment();
  await confirmOrder();
});` },
    ],
  },

  // ==================== DASHBOARDS ====================
  {
    id: 'dashboards-intro',
    title: 'Dashboards',
    subtitle: 'Visualizing Your Data',
    category: 'Dashboards',
    content: [
      { type: 'text', value: 'Dashboards aggregate metrics, logs, and traces into actionable insights.' },
      { type: 'bullets', items: [
        'Real-time visibility into system health',
        'Historical trends for capacity planning',
        'Alert triggers for immediate action',
        'Team alignment on what matters',
        'Evidence for decision making',
      ]},
    ],
  },
  {
    id: 'what-to-monitor',
    title: 'What to Monitor',
    subtitle: 'The RED Method',
    category: 'Dashboards',
    content: [
      { type: 'text', value: 'The RED method covers the essential metrics for request-driven services.' },
      { type: 'steps', items: [
        { title: 'Rate', description: 'Requests per second. How busy is the system?' },
        { title: 'Errors', description: 'Failed requests per second. What\'s breaking?' },
        { title: 'Duration', description: 'Time per request (p50, p95, p99). How slow is it?' },
      ]},
      { type: 'diagram', value: `┌─────────────────────────────────────────────────────────────┐
│                    API Health Dashboard                      │
├─────────────────────┬─────────────────────┬─────────────────┤
│      RATE           │      ERRORS         │    DURATION     │
│                     │                     │                 │
│   ▲                 │                     │        p99 ─────│
│   │    ╱╲          │   ▄                 │       p95 ──────│
│   │   ╱  ╲  ╱╲     │   █                 │      p50 ───────│
│   │  ╱    ╲╱  ╲    │   █  ▄              │                 │
│   │ ╱          ╲   │   █  █              │                 │
│   └──────────────▶ │   ▀  ▀  ▄           │                 │
│    1250 req/sec    │   0.5% error rate   │   p95: 245ms    │
└─────────────────────┴─────────────────────┴─────────────────┘` },
    ],
  },
  {
    id: 'golden-signals',
    title: 'The Four Golden Signals',
    subtitle: 'SRE Monitoring Philosophy',
    category: 'Dashboards',
    content: [
      { type: 'text', value: 'Google SRE\'s four signals for monitoring any service:' },
      { type: 'steps', items: [
        { title: 'Latency', description: 'Time to serve a request. Distinguish between successful and failed requests.' },
        { title: 'Traffic', description: 'Demand on your system. Requests/sec, sessions, transactions.' },
        { title: 'Errors', description: 'Rate of failed requests. Explicit (500s) and implicit (slow = error).' },
        { title: 'Saturation', description: 'How "full" your service is. CPU, memory, queue depth.' },
      ]},
    ],
  },
  {
    id: 'dashboard-types',
    title: 'Types of Dashboards',
    subtitle: 'Different Views for Different Needs',
    category: 'Dashboards',
    content: [
      { type: 'comparison', 
        left: { title: 'Operational Dashboards', items: [
          'Real-time metrics',
          'Current error rates',
          'Active alerts',
          'Service health status',
          'Used during incidents',
        ]},
        right: { title: 'Analytical Dashboards', items: [
          'Historical trends',
          'Week-over-week comparisons',
          'Capacity planning',
          'Business KPIs',
          'Used for planning',
        ]}
      },
    ],
  },
  {
    id: 'performance-dashboard',
    title: 'Performance Dashboard',
    subtitle: 'Frontend Performance at a Glance',
    category: 'Dashboards',
    content: [
      { type: 'diagram', value: `┌─────────────────────────────────────────────────────────────┐
│                 Frontend Performance                         │
├─────────────────────────────────────────────────────────────┤
│  Core Web Vitals (p75)                                       │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│  │ LCP: 2.1s   │ │ FID: 85ms   │ │ CLS: 0.08   │            │
│  │    ✓ Good   │ │    ✓ Good   │ │    ✓ Good   │            │
│  └─────────────┘ └─────────────┘ └─────────────┘            │
├─────────────────────────────────────────────────────────────┤
│  Page Load Time by Route                                     │
│  /home ████████████░░░░░░░░░░░░░░  1.2s                     │
│  /products █████████████████░░░░░  1.8s                     │
│  /checkout ████████████████████████ 2.4s                    │
├─────────────────────────────────────────────────────────────┤
│  JS Errors (24h)          │  API Latency (p95)               │
│  Total: 1,234             │  /api/products: 120ms            │
│  Unique: 12               │  /api/cart: 85ms                 │
│  Affected users: 2.3%     │  /api/checkout: 340ms            │
└─────────────────────────────────────────────────────────────┘` },
    ],
  },
  {
    id: 'alerting',
    title: 'Alerting',
    subtitle: 'When to Wake Someone Up',
    category: 'Dashboards',
    content: [
      { type: 'text', value: 'Good alerts are actionable, timely, and infrequent enough to not cause fatigue.' },
      { type: 'bullets', items: [
        'Alert on symptoms (error rate), not causes (CPU)',
        'Use multiple severity levels (page vs. ticket vs. email)',
        'Include runbooks - what to do when alerted',
        'Avoid flapping - require sustained threshold violation',
        'Group related alerts to reduce noise',
        'Review and tune regularly - delete noisy alerts',
      ]},
      { type: 'code', language: 'yaml', value: `# Example alert rule
- alert: HighErrorRate
  expr: |
    (
      sum(rate(http_requests_total{status=~"5.."}[5m]))
      / sum(rate(http_requests_total[5m]))
    ) > 0.01
  for: 5m  # Sustained for 5 minutes
  labels:
    severity: critical
  annotations:
    summary: "Error rate above 1%"
    runbook: "https://wiki/runbooks/high-error-rate"` },
    ],
  },
  {
    id: 'monitoring-tools',
    title: 'Monitoring Tools',
    subtitle: 'Popular Platforms',
    category: 'Dashboards',
    content: [
      { type: 'bullets', items: [
        'Grafana - Open source, works with many data sources',
        'Datadog - Full platform, APM + logs + metrics + RUM',
        'New Relic - Application performance monitoring',
        'Prometheus - Open source metrics, often with Grafana',
        'Kibana - Visualization for Elasticsearch/ELK',
        'Splunk - Enterprise log analysis and monitoring',
        'PagerDuty / OpsGenie - Incident management and alerting',
      ]},
      { type: 'text', value: '💡 Many teams use Grafana for dashboards + Prometheus for metrics + dedicated tool for traces/errors.' },
    ],
  },

  // ==================== REAL USER MONITORING ====================
  {
    id: 'rum-intro',
    title: 'Real User Monitoring (RUM)',
    subtitle: 'Performance from the User\'s Perspective',
    category: 'RUM',
    content: [
      { type: 'text', value: 'RUM collects performance data from actual user sessions, not synthetic tests.' },
      { type: 'comparison', 
        left: { title: 'Synthetic Monitoring', items: [
          'Controlled environment',
          'Consistent baseline',
          'Catches regressions before deploy',
          'Limited geographic coverage',
          'Doesn\'t reflect real conditions',
        ]},
        right: { title: 'Real User Monitoring', items: [
          'Actual user devices/networks',
          'Real geographic distribution',
          'Catches production-only issues',
          'Huge variation in data',
          'Reflects true user experience',
        ]}
      },
    ],
  },
  {
    id: 'rum-data',
    title: 'What RUM Captures',
    subtitle: 'User Session Data',
    category: 'RUM',
    content: [
      { type: 'bullets', items: [
        'Navigation timing (DNS, TCP, TLS, request, response)',
        'Resource timing (scripts, styles, images, fonts)',
        'Core Web Vitals (LCP, FID, CLS, INP)',
        'User interactions (clicks, scrolls, inputs)',
        'JavaScript errors with stack traces',
        'Network request failures',
        'Custom events and metrics',
        'Session recordings (optional)',
      ]},
      { type: 'code', language: 'typescript', value: `// Performance Observer for resources
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    rum.recordResource({
      name: entry.name,
      type: entry.initiatorType,
      duration: entry.duration,
      transferSize: entry.transferSize,
    });
  }
});

observer.observe({ entryTypes: ['resource'] });` },
    ],
  },
  {
    id: 'rum-services',
    title: 'RUM Services',
    subtitle: 'Platforms for Real User Monitoring',
    category: 'RUM',
    content: [
      { type: 'bullets', items: [
        'Datadog RUM - Full featured, expensive but excellent',
        'New Relic Browser - Good APM integration',
        'Sentry Performance - Error tracking + performance',
        'LogRocket - Session replay focus',
        'FullStory - Session replay + analytics',
        'Speedcurve - Performance focus, good visualizations',
        'SpeedInsights / CrUX - Free, Google data',
        'Web Vitals library - DIY, send to your own backend',
      ]},
    ],
  },

  // ==================== SUMMARY ====================
  {
    id: 'implementation-checklist',
    title: 'Implementation Checklist',
    subtitle: 'Getting Started',
    category: 'Summary',
    content: [
      { type: 'steps', items: [
        { title: 'Error Tracking', description: 'Set up Sentry or similar. Catch global errors. Add React Error Boundaries.' },
        { title: 'Logging', description: 'Implement structured logging. Set up log shipping. Define log levels.' },
        { title: 'Performance Metrics', description: 'Add web-vitals library. Track Core Web Vitals. Set up RUM.' },
        { title: 'Tracing', description: 'Add OpenTelemetry. Propagate trace context. Connect frontend to backend.' },
        { title: 'Dashboards', description: 'Set up Grafana or similar. Create operational views. Configure alerts.' },
        { title: 'Alerting', description: 'Define SLOs. Set meaningful thresholds. Create runbooks.' },
      ]},
    ],
  },
  {
    id: 'summary',
    title: 'Key Takeaways',
    subtitle: 'Observability Principles',
    category: 'Summary',
    content: [
      { type: 'bullets', items: [
        '👁️ Observability = understanding your system through its outputs',
        '📊 Three pillars: Logs (events), Metrics (numbers), Traces (requests)',
        '🔗 Use correlation IDs to connect frontend and backend',
        '⚡ Core Web Vitals are essential for user experience',
        '🚨 Alert on symptoms, not causes',
        '📈 Dashboards should answer questions, not just show data',
        '🔍 RUM shows real user experience, not just lab conditions',
        '🛠️ Start simple - error tracking first, then expand',
      ]},
      { type: 'text', value: 'You can\'t fix what you can\'t see. Invest in observability early!' },
    ],
  },
];

export const categories = [...new Set(slides.map(s => s.category))];
