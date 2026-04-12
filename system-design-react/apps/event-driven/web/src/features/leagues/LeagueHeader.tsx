import { League } from '../../core/types';
import styles from './LeagueHeader.module.css';

interface LeagueHeaderProps {
  league: League | null;
}

const countryEmoji: Record<string, string> = {
  England: '\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62\uDB40\uDC65\uDB40\uDC6E\uDB40\uDC67\uDB40\uDC7F',
  Spain: '\uD83C\uDDEA\uD83C\uDDF8',
  Italy: '\uD83C\uDDEE\uD83C\uDDF9',
  Germany: '\uD83C\uDDE9\uD83C\uDDEA',
};

export function LeagueHeader({ league }: LeagueHeaderProps) {
  if (!league) {
    return (
      <div className={styles.header}>
        <span className={styles.icon}>&#9917;</span>
        <div className={styles.info}>
          <span className={styles.name}>All Leagues</span>
          <span className={styles.country}>All matches across competitions</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.header}>
      <span className={styles.icon}>{countryEmoji[league.country] || '&#9917;'}</span>
      <div className={styles.info}>
        <span className={styles.name}>{league.name}</span>
        <span className={styles.country}>{league.country}</span>
      </div>
    </div>
  );
}
