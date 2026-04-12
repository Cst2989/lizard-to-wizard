import { useState, useCallback } from 'react';
import { eventBus } from '../../core/EventBus';
import { fetchMatchEvents } from '../../api/client';
import styles from './TimeSlider.module.css';

interface TimeSliderProps {
  matchId: string;
  maxMinute: number;
}

/**
 * TimeSlider — time travel through a match.
 *
 * When the user moves the slider:
 * 1. Fetches events from minute 0 to the selected minute
 * 2. Emits RESET (all widgets clear their state)
 * 3. Replays the fetched events through the EventBus synchronously
 * 4. All widgets rebuild to show the match state at that minute
 */
export function TimeSlider({ matchId, maxMinute }: TimeSliderProps) {
  const [currentMinute, setCurrentMinute] = useState(maxMinute);
  const [isReplaying, setIsReplaying] = useState(false);

  const handleSliderChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const minute = parseInt(e.target.value, 10);
      setCurrentMinute(minute);
      setIsReplaying(true);

      try {
        // 1. Fetch events up to the selected minute
        const events = await fetchMatchEvents(matchId, 0, minute);

        // 2. Reset all widgets
        eventBus.clear();

        // 3. Replay events synchronously
        for (const event of events) {
          eventBus.emit(event);
        }
      } catch (err) {
        console.error('Time travel failed:', err);
      } finally {
        setIsReplaying(false);
      }
    },
    [matchId]
  );

  return (
    <div className={styles.container} data-testid="time-slider">
      <div className={styles.label}>
        <span className={styles.title}>
          Time Travel {isReplaying ? '(replaying...)' : ''}
        </span>
        <span className={styles.minute}>{currentMinute}'</span>
      </div>
      <input
        type="range"
        className={styles.slider}
        min={0}
        max={maxMinute || 90}
        value={currentMinute}
        onChange={handleSliderChange}
        aria-label="Match minute slider"
      />
      <div className={styles.markers}>
        <span>0'</span>
        <span>15'</span>
        <span>30'</span>
        <span>45'</span>
        <span>60'</span>
        <span>75'</span>
        <span>90'</span>
      </div>
    </div>
  );
}
