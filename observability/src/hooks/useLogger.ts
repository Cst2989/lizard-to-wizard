// useLogger - React hook for logging with component context

import { useCallback, useMemo } from 'react';
import { logger } from '../lib/logger';

interface UseLoggerOptions {
  component?: string;
  context?: Record<string, unknown>;
}

export function useLogger(options: UseLoggerOptions = {}) {
  const { component, context: baseContext } = options;

  const enhancedContext = useMemo(() => ({
    component,
    ...baseContext,
  }), [component, baseContext]);

  const debug = useCallback((message: string, context?: Record<string, unknown>) => {
    logger.debug(message, { ...enhancedContext, ...context });
  }, [enhancedContext]);

  const info = useCallback((message: string, context?: Record<string, unknown>) => {
    logger.info(message, { ...enhancedContext, ...context });
  }, [enhancedContext]);

  const warn = useCallback((message: string, context?: Record<string, unknown>) => {
    logger.warn(message, { ...enhancedContext, ...context });
  }, [enhancedContext]);

  const error = useCallback((message: string, context?: Record<string, unknown>) => {
    logger.error(message, { ...enhancedContext, ...context });
  }, [enhancedContext]);

  return { debug, info, warn, error };
}
