import { useEffect, useRef } from 'react';
import { eventBus } from './EventBus';
import { GameEvent } from './types';

/**
 * useEvent — subscribe to a specific event type on the EventBus.
 * Auto-cleans up the subscription when the component unmounts.
 *
 * @param eventType - The event type to subscribe to (e.g., 'GOAL_SCORED', '*')
 * @param handler - Callback invoked when the event fires
 */
export function useEvent<T = any>(
  eventType: string,
  handler: (event: GameEvent<T>) => void
): void {
  // Use ref to avoid re-subscribing on every render when handler identity changes
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const unsubscribe = eventBus.subscribe<T>(eventType, (event) => {
      handlerRef.current(event);
    });

    return unsubscribe;
  }, [eventType]);
}
