import { useState } from 'react';
import { useEvent } from '../core/useEvent';
import { GOAL_SCORED, MATCH_STARTED, RESET } from '../core/events';
import { GameEvent } from '../core/types';
import styles from './Scoreboard.module.css';

/**
 * Scoreboard widget — subscribes to GOAL_SCORED, MATCH_STARTED, RESET.
 * Maintains and displays the current score.
 */
export function Scoreboard() {
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [flash, setFlash] = useState(false);

  useEvent(MATCH_STARTED, () => {
    setHomeScore(0);
    setAwayScore(0);
  });

  useEvent(GOAL_SCORED, (event: GameEvent) => {
    const { team } = event.payload;
    if (team === 'home') {
      setHomeScore((prev) => prev + 1);
    } else {
      setAwayScore((prev) => prev + 1);
    }
    setFlash(true);
    setTimeout(() => setFlash(false), 600);
  });

  useEvent(RESET, () => {
    setHomeScore(0);
    setAwayScore(0);
  });

  return (
    <div className={styles.scoreboard} data-testid="scoreboard">
      <span className={`${styles.score} ${flash ? styles.goalFlash : ''}`}>
        {homeScore}
      </span>
      <span className={styles.separator}>-</span>
      <span className={`${styles.score} ${flash ? styles.goalFlash : ''}`}>
        {awayScore}
      </span>
    </div>
  );
}
