import { useCallback } from 'react';
import { eventBus } from './EventBus';
import { GameEvent } from './types';

/**
 * useEmit — returns a stable emit function tied to the EventBus singleton.
 *
 * Usage:
 *   const emit = useEmit();
 *   emit({ type: 'GOAL_SCORED', payload: { ... }, timestamp: 23 });
 */
export function useEmit() {
  return useCallback((event: GameEvent) => {
    eventBus.emit(event);
  }, []);
}
