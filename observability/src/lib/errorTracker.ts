// Error Tracker - Captures and reports errors with context

interface Breadcrumb {
  type: 'click' | 'navigation' | 'api' | 'console' | 'custom';
  message: string;
  timestamp: string;
  data?: Record<string, unknown>;
}

interface ErrorReport {
  // Basic error info
  message: string;
  stack?: string;
  type: 'error' | 'unhandledrejection' | 'react' | 'network';

  // Where it happened
  url: string;
  route?: string;
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
  appVersion?: string;
  featureFlags?: Record<string, boolean>;

  // Correlation
  correlationId?: string;

  // Breadcrumbs - what happened before
  breadcrumbs: Breadcrumb[];
}

interface ErrorTrackerConfig {
  endpoint?: string;
  maxBreadcrumbs?: number;
  appVersion?: string;
  beforeSend?: (report: ErrorReport) => ErrorReport | null;
}

class ErrorTracker {
  private endpoint: string;
  private maxBreadcrumbs: number;
  private appVersion?: string;
  private breadcrumbs: Breadcrumb[] = [];
  private sessionId: string;
  private userId?: string;
  private correlationId?: string;
  private beforeSend?: (report: ErrorReport) => ErrorReport | null;

  constructor(config: ErrorTrackerConfig = {}) {
    this.endpoint = config.endpoint ?? '/api/errors';
    this.maxBreadcrumbs = config.maxBreadcrumbs ?? 50;
    this.appVersion = config.appVersion;
    this.beforeSend = config.beforeSend;
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  // Initialize global error handlers
  init() {
    // Catch synchronous errors
    window.onerror = (message, source, lineno, colno, error) => {
      this.capture({
        type: 'error',
        message: String(message),
        stack: error?.stack,
        source,
        lineno,
        colno,
      });
      return false; // Let default handling continue
    };

    // Catch unhandled promise rejections
    window.onunhandledrejection = (event) => {
      this.capture({
        type: 'unhandledrejection',
        message: event.reason?.message || String(event.reason),
        stack: event.reason?.stack,
      });
    };

    // Track clicks for breadcrumbs
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const text = target.textContent?.slice(0, 50) || '';
      const tagName = target.tagName.toLowerCase();
      const id = target.id ? `#${target.id}` : '';
      const className = target.className ? `.${target.className.split(' ')[0]}` : '';

      this.addBreadcrumb({
        type: 'click',
        message: `Clicked ${tagName}${id}${className}: "${text}"`,
      });
    });

    // Track navigation
    window.addEventListener('popstate', () => {
      this.addBreadcrumb({
        type: 'navigation',
        message: `Navigated to ${window.location.pathname}`,
      });
    });

    console.log('[ErrorTracker] Initialized');
  }

  setUser(userId: string) {
    this.userId = userId;
  }

  setCorrelationId(correlationId: string) {
    this.correlationId = correlationId;
  }

  addBreadcrumb(breadcrumb: Omit<Breadcrumb, 'timestamp'>) {
    this.breadcrumbs.push({
      ...breadcrumb,
      timestamp: new Date().toISOString(),
    });

    // Keep only the last N breadcrumbs
    if (this.breadcrumbs.length > this.maxBreadcrumbs) {
      this.breadcrumbs = this.breadcrumbs.slice(-this.maxBreadcrumbs);
    }
  }

  capture(errorData: {
    type: ErrorReport['type'];
    message: string;
    stack?: string;
    componentStack?: string;
    source?: string;
    lineno?: number;
    colno?: number;
    [key: string]: unknown;
  }) {
    let report: ErrorReport = {
      type: errorData.type,
      message: errorData.message,
      stack: errorData.stack,
      componentStack: errorData.componentStack,
      url: window.location.href,
      userId: this.userId,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      appVersion: this.appVersion,
      correlationId: this.correlationId,
      breadcrumbs: [...this.breadcrumbs],
    };

    // Allow modification before sending
    if (this.beforeSend) {
      const modified = this.beforeSend(report);
      if (modified === null) return; // Don't send
      report = modified;
    }

    this.sendReport(report);
  }

  private async sendReport(report: ErrorReport) {
    try {
      await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report),
        keepalive: true,
      });
    } catch (error) {
      console.error('[ErrorTracker] Failed to send error report:', error);
    }

    // Also log to console in development
    if (import.meta.env.DEV) {
      console.error('[ErrorTracker] Captured error:', report);
    }
  }

  // Generate fingerprint for error grouping
  static getFingerprint(error: { message: string; stack?: string }): string {
    const normalized = error.stack
      ?.replace(/:\d+:\d+/g, '') // Remove line:col
      ?.replace(/[a-f0-9-]{36}/gi, '[id]') // Normalize UUIDs
      ?.replace(/\d+/g, '[n]'); // Normalize numbers

    const str = normalized || error.message;
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }
}

// Singleton instance
export const errorTracker = new ErrorTracker({
  appVersion: '1.0.0',
});

export { ErrorTracker, type ErrorReport, type Breadcrumb, type ErrorTrackerConfig };
