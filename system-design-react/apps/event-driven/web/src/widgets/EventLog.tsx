import { useState } from 'react';
import { useEvent } from '../core/useEvent';
import { WILDCARD, RESET } from '../core/events';
import { GameEvent } from '../core/types';
import styles from './EventLog.module.css';

/**
 * EventLog widget — Dev tool that subscribes to ALL events (*).
 * Shows raw JSON of every event flowing through the EventBus.
 * Makes the invisible visible for debugging and learning.
 */
export function EventLog() {
  const [events, setEvents] = useState<GameEvent[]>([]);

  useEvent(WILDCARD, (event: GameEvent) => {
    if (event.type === RESET) {
      setEvents([]);
      return;
    }
    setEvents((prev) => [...prev, event]);
  });

  return (
    <div className={styles.container} data-testid="event-log">
      <div className={styles.header}>
        <span className={styles.title}>Event Log (Dev)</span>
        <span className={styles.badge}>{events.length} events</span>
      </div>
      <div className={styles.entries}>
        {events.length === 0 ? (
          <div className={styles.empty}>Listening for events on the bus...</div>
        ) : (
          [...events].reverse().map((event, i) => (
            <div key={i} className={styles.entry}>
              <span className={styles.timestamp}>[{event.timestamp}'] </span>
              <span className={styles.eventType}>{event.type}</span>
              {' '}
              {JSON.stringify(event.payload)}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
