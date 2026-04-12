import { useState } from 'react';
import { useEvent } from '../../core/useEvent';
import { WILDCARD, RESET } from '../../core/events';
import { GameEvent } from '../../core/types';
import { TimelineEvent } from './TimelineEvent';
import styles from './Timeline.module.css';

/**
 * Timeline subscribes to ALL events (*) and shows them chronologically.
 */
export function Timeline() {
  const [events, setEvents] = useState<GameEvent[]>([]);

  useEvent(WILDCARD, (event: GameEvent) => {
    if (event.type === RESET) {
      setEvents([]);
      return;
    }
    setEvents((prev) => [...prev, event]);
  });

  return (
    <div className={styles.container}>
      <div className={styles.title}>Match Timeline</div>
      <div className={styles.events}>
        {events.length === 0 ? (
          <div className={styles.empty}>No events yet</div>
        ) : (
          events.map((event, i) => (
            <TimelineEvent key={i} event={event} />
          ))
        )}
      </div>
    </div>
  );
}
