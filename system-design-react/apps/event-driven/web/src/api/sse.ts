import { eventBus } from '../core/EventBus';
import { GameEvent } from '../core/types';

/**
 * Connect to a live match's SSE stream.
 * Each event received from the server is pushed directly into the EventBus.
 *
 * This is the ONLY place that knows about the server.
 * Widgets only know about the EventBus.
 *
 * @returns A cleanup function that closes the SSE connection.
 */
export function connectToMatch(matchId: string): () => void {
  const source = new EventSource(`/api/matches/${matchId}/stream`);

  source.onmessage = (msg: MessageEvent) => {
    try {
      const event: GameEvent = JSON.parse(msg.data);
      eventBus.emit(event);
    } catch (err) {
      console.error('Failed to parse SSE event:', err);
    }
  };

  source.onerror = () => {
    console.warn(`SSE connection error for match ${matchId}`);
  };

  // Return cleanup function
  return () => {
    source.close();
  };
}
