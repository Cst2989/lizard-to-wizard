// ErrorBoundary - React Error Boundary with error tracking

import { Component, type ReactNode, type ErrorInfo } from 'react';
import { errorTracker } from '../lib/errorTracker';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Report to error tracker
    errorTracker.capture({
      type: 'react',
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack ?? undefined,
    });

    // Call optional callback
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const { fallback } = this.props;
      const { error } = this.state;

      if (typeof fallback === 'function') {
        return fallback(error!, this.handleReset);
      }

      if (fallback) {
        return fallback;
      }

      // Default fallback
      return (
        <div style={{
          padding: '20px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '8px',
          margin: '20px',
        }}>
          <h2 style={{ color: '#ef4444', margin: '0 0 10px' }}>Something went wrong</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', margin: '0 0 15px' }}>
            {error?.message}
          </p>
          <button
            onClick={this.handleReset}
            style={{
              padding: '8px 16px',
              background: '#ef4444',
              border: 'none',
              borderRadius: '4px',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
