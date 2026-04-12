import { GameEvent } from './types';
import { WILDCARD, RESET } from './events';

type EventHandler<T = any> = (event: GameEvent<T>) => void;

/**
 * EventBus — the heart of event-driven architecture.
 *
 * All communication between widgets flows through here.
 * Widgets subscribe to specific event types and react independently.
 * Supports wildcard '*' subscriptions that receive ALL events.
 */
class EventBus {
  private listeners: Map<string, Set<EventHandler>> = new Map();

  /**
   * Subscribe to a specific event type.
   * Use '*' (WILDCARD) to receive all events.
   * Returns an unsubscribe function.
   */
  subscribe<T = any>(eventType: string, handler: EventHandler<T>): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(handler as EventHandler);

    // Return unsubscribe function
    return () => {
      this.listeners.get(eventType)?.delete(handler as EventHandler);
    };
  }

  /**
   * Emit an event. Notifies:
   * 1. All handlers subscribed to this specific event type
   * 2. All wildcard ('*') handlers
   */
  emit<T = any>(event: GameEvent<T>): void {
    // Notify specific subscribers
    const handlers = this.listeners.get(event.type);
    handlers?.forEach((handler) => handler(event));

    // Notify wildcard subscribers (but don't double-notify if type IS '*')
    if (event.type !== WILDCARD) {
      const wildcardHandlers = this.listeners.get(WILDCARD);
      wildcardHandlers?.forEach((handler) => handler(event));
    }
  }

  /**
   * Clear state by emitting RESET.
   * Does NOT remove subscriptions — widgets handle RESET to clear their local state.
   * Used for time travel: reset then replay events.
   */
  clear(): void {
    this.emit({ type: RESET, payload: {}, timestamp: 0 });
  }

  /**
   * Get the count of subscribers for a given event type (useful for testing/debugging).
   */
  listenerCount(eventType: string): number {
    return this.listeners.get(eventType)?.size ?? 0;
  }

  /**
   * Remove all subscriptions (for cleanup/testing).
   */
  removeAllListeners(): void {
    this.listeners.clear();
  }
}

// Singleton instance — the single bus for the entire app
export const eventBus = new EventBus();

// Also export the class for testing
export { EventBus };
