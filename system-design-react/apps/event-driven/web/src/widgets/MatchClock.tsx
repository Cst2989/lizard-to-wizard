import { useState } from 'react';
import { useEvent } from '../core/useEvent';
import { MATCH_STARTED, HALF_TIME, SECOND_HALF, MATCH_ENDED, RESET } from '../core/events';
import styles from './MatchClock.module.css';

type MatchPeriod = 'pre_match' | 'first_half' | 'half_time' | 'second_half' | 'full_time';

/**
 * MatchClock widget — subscribes to MATCH_STARTED, HALF_TIME, SECOND_HALF, MATCH_ENDED, RESET.
 * Shows the current match period.
 */
export function MatchClock() {
  const [period, setPeriod] = useState<MatchPeriod>('pre_match');
  const [lastMinute, setLastMinute] = useState(0);

  useEvent(MATCH_STARTED, () => {
    setPeriod('first_half');
    setLastMinute(0);
  });

  useEvent(HALF_TIME, () => {
    setPeriod('half_time');
    setLastMinute(45);
  });

  useEvent(SECOND_HALF, () => {
    setPeriod('second_half');
    setLastMinute(45);
  });

  useEvent(MATCH_ENDED, () => {
    setPeriod('full_time');
    setLastMinute(90);
  });

  useEvent(RESET, () => {
    setPeriod('pre_match');
    setLastMinute(0);
  });

  const periodLabel: Record<MatchPeriod, string> = {
    pre_match: 'Pre-Match',
    first_half: '1st Half',
    half_time: 'Half Time',
    second_half: '2nd Half',
    full_time: 'Full Time',
  };

  const badgeClass =
    period === 'half_time'
      ? styles.badgeHT
      : period === 'full_time'
        ? styles.badgeFT
        : period === 'first_half' || period === 'second_half'
          ? styles.badgeLive
          : '';

  return (
    <div className={styles.clock} data-testid="match-clock">
      <span className={period === 'first_half' || period === 'second_half' ? styles.periodLive : styles.period}>
        {periodLabel[period]}
      </span>
      {badgeClass && <span className={badgeClass}>{periodLabel[period]}</span>}
    </div>
  );
}
