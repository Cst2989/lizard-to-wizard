// Tracing - Distributed tracing implementation

interface Span {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  status: 'ok' | 'error' | 'unset';
  attributes: Record<string, string | number | boolean>;
  events: SpanEvent[];
}

interface SpanEvent {
  name: string;
  timestamp: number;
  attributes?: Record<string, string | number | boolean>;
}

interface TraceContext {
  traceId: string;
  spanId: string;
  traceFlags: number;
}

interface TracerConfig {
  serviceName: string;
  endpoint?: string;
  propagateToUrls?: RegExp[];
}

class Tracer {
  private serviceName: string;
  private endpoint: string;
  private propagateToUrls: RegExp[];
  private spans: Span[] = [];
  private currentSpan: Span | null = null;

  constructor(config: TracerConfig) {
    this.serviceName = config.serviceName;
    this.endpoint = config.endpoint ?? '/api/traces';
    this.propagateToUrls = config.propagateToUrls ?? [];
  }

  // Generate a random trace/span ID
  private generateId(length: 16 | 32 = 16): string {
    const bytes = new Uint8Array(length / 2);
    crypto.getRandomValues(bytes);
    return Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  // Start a new span
  startSpan(name: string, options?: { parent?: Span }): Span {
    const span: Span = {
      traceId: options?.parent?.traceId ?? this.generateId(32),
      spanId: this.generateId(16),
      parentSpanId: options?.parent?.spanId,
      name,
      startTime: performance.now(),
      status: 'unset',
      attributes: {
        'service.name': this.serviceName,
      },
      events: [],
    };

    this.currentSpan = span;
    return span;
  }

  // End a span
  endSpan(span: Span, status: 'ok' | 'error' = 'ok'): void {
    span.endTime = performance.now();
    span.duration = span.endTime - span.startTime;
    span.status = status;

    this.spans.push(span);

    if (this.currentSpan === span) {
      this.currentSpan = null;
    }

    // Auto-flush if we have many spans
    if (this.spans.length >= 10) {
      this.flush();
    }
  }

  // Add attribute to span
  setAttribute(span: Span, key: string, value: string | number | boolean): void {
    span.attributes[key] = value;
  }

  // Add event to span
  addEvent(span: Span, name: string, attributes?: Record<string, string | number | boolean>): void {
    span.events.push({
      name,
      timestamp: performance.now(),
      attributes,
    });
  }

  // Record exception on span
  recordException(span: Span, error: Error): void {
    span.status = 'error';
    this.addEvent(span, 'exception', {
      'exception.type': error.name,
      'exception.message': error.message,
      'exception.stacktrace': error.stack ?? '',
    });
  }

  // Get current span
  getCurrentSpan(): Span | null {
    return this.currentSpan;
  }

  // Create trace context for propagation
  getTraceContext(span: Span): TraceContext {
    return {
      traceId: span.traceId,
      spanId: span.spanId,
      traceFlags: 1, // Sampled
    };
  }

  // Format W3C Trace Context header
  formatTraceparent(span: Span): string {
    // Format: version-traceid-spanid-flags
    return `00-${span.traceId}-${span.spanId}-01`;
  }

  // Parse W3C Trace Context header
  parseTraceparent(header: string): TraceContext | null {
    const parts = header.split('-');
    if (parts.length !== 4) return null;

    return {
      traceId: parts[1],
      spanId: parts[2],
      traceFlags: parseInt(parts[3], 16),
    };
  }

  // Inject trace context into headers
  injectHeaders(span: Span, headers: Headers | Record<string, string>): void {
    const traceparent = this.formatTraceparent(span);

    if (headers instanceof Headers) {
      headers.set('traceparent', traceparent);
    } else {
      headers['traceparent'] = traceparent;
    }
  }

  // Should propagate to this URL?
  shouldPropagate(url: string): boolean {
    return this.propagateToUrls.some(pattern => pattern.test(url));
  }

  // Trace a fetch request
  async traceFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const span = this.startSpan(`HTTP ${options.method ?? 'GET'}`);
    this.setAttribute(span, 'http.url', url);
    this.setAttribute(span, 'http.method', options.method ?? 'GET');

    // Inject headers if URL matches patterns
    if (this.shouldPropagate(url)) {
      const headers = new Headers(options.headers);
      this.injectHeaders(span, headers);
      options.headers = headers;
    }

    try {
      const response = await fetch(url, options);
      this.setAttribute(span, 'http.status_code', response.status);
      this.endSpan(span, response.ok ? 'ok' : 'error');
      return response;
    } catch (error) {
      this.recordException(span, error as Error);
      this.endSpan(span, 'error');
      throw error;
    }
  }

  // Flush spans to backend
  async flush(): Promise<void> {
    if (this.spans.length === 0) return;

    const spans = [...this.spans];
    this.spans = [];

    try {
      await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spans }),
        keepalive: true,
      });
    } catch (error) {
      // Re-add spans if flush fails
      this.spans = [...spans, ...this.spans];
      console.error('Failed to flush spans:', error);
    }
  }
}

// Create a tracer instance
export function createTracer(config: TracerConfig): Tracer {
  return new Tracer(config);
}

// Default tracer instance
export const tracer = new Tracer({
  serviceName: 'frontend',
  propagateToUrls: [/\/api\//],
});

export { Tracer, type Span, type SpanEvent, type TraceContext, type TracerConfig };
