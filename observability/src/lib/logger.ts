// Logger - Structured logging implementation for frontend

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
}

interface LoggerConfig {
  flushInterval?: number;
  endpoint?: string;
  minLevel?: LogLevel;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

class Logger {
  private buffer: LogEntry[] = [];
  private flushInterval: number;
  private endpoint: string;
  private minLevel: LogLevel;
  private sessionId: string;
  private intervalId?: number;

  constructor(config: LoggerConfig = {}) {
    this.flushInterval = config.flushInterval ?? 5000;
    this.endpoint = config.endpoint ?? '/api/logs';
    this.minLevel = config.minLevel ?? 'info';
    this.sessionId = this.generateSessionId();

    // Start flush interval
    this.intervalId = window.setInterval(() => this.flush(), this.flushInterval);
    
    // Flush on page unload
    window.addEventListener('beforeunload', () => this.flush());
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.minLevel];
  }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>) {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: {
        ...context,
        url: window.location.href,
        userAgent: navigator.userAgent,
        sessionId: this.sessionId,
      },
    };

    this.buffer.push(entry);

    // Also log to console in development
    if (import.meta.env.DEV) {
      const consoleFn = level === 'error' ? console.error 
        : level === 'warn' ? console.warn 
        : console.log;
      consoleFn(`[${level.toUpperCase()}]`, message, context);
    }

    // Flush immediately for errors
    if (level === 'error') {
      this.flush();
    }
  }

  debug(message: string, context?: Record<string, unknown>) {
    this.log('debug', message, context);
  }

  info(message: string, context?: Record<string, unknown>) {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, unknown>) {
    this.log('warn', message, context);
  }

  error(message: string, context?: Record<string, unknown>) {
    this.log('error', message, context);
  }

  async flush(): Promise<void> {
    if (this.buffer.length === 0) return;

    const logs = [...this.buffer];
    this.buffer = [];

    try {
      await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logs }),
        keepalive: true, // Ensures logs are sent on page unload
      });
    } catch (error) {
      // Re-add logs to buffer if flush fails
      this.buffer = [...logs, ...this.buffer];
      console.error('Failed to flush logs:', error);
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
export const logger = new Logger({
  minLevel: import.meta.env.DEV ? 'debug' : 'info',
});

export { Logger, type LogLevel, type LogEntry, type LoggerConfig };
