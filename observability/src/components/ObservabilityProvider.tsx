// ObservabilityProvider - Initialize all observability tools

import { useEffect, type ReactNode } from 'react';
import { errorTracker } from '../lib/errorTracker';
import { useWebVitals } from '../hooks/useWebVitals';
import { ErrorBoundary } from './ErrorBoundary';

interface ObservabilityProviderProps {
  children: ReactNode;
  userId?: string;
}

export function ObservabilityProvider({ children, userId }: ObservabilityProviderProps) {
  // Initialize error tracking
  useEffect(() => {
    errorTracker.init();
    
    if (userId) {
      errorTracker.setUser(userId);
    }
  }, [userId]);

  // Track Web Vitals
  useWebVitals({ sendToAnalytics: true });

  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
}
