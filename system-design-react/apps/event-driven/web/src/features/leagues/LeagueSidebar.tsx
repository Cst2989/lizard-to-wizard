import { useState, useEffect } from 'react';
import { League } from '../../core/types';
import { fetchLeagues } from '../../api/client';
import styles from './LeagueSidebar.module.css';

interface LeagueSidebarProps {
  selectedLeagueId: string | null;
  onSelectLeague: (leagueId: string | null) => void;
}

export function LeagueSidebar({ selectedLeagueId, onSelectLeague }: LeagueSidebarProps) {
  const [leagues, setLeagues] = useState<League[]>([]);

  useEffect(() => {
    fetchLeagues().then(setLeagues).catch(console.error);
  }, []);

  const countryEmoji: Record<string, string> = {
    England: '\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62\uDB40\uDC65\uDB40\uDC6E\uDB40\uDC67\uDB40\uDC7F',
    Spain: '\uD83C\uDDEA\uD83C\uDDF8',
    Italy: '\uD83C\uDDEE\uD83C\uDDF9',
    Germany: '\uD83C\uDDE9\uD83C\uDDEA',
  };

  return (
    <nav className={styles.sidebar}>
      <div className={styles.title}>Leagues</div>
      <ul className={styles.list}>
        <li
          className={selectedLeagueId === null ? styles.itemActive : styles.item}
          onClick={() => onSelectLeague(null)}
        >
          <span className={styles.flag}>All</span>
          All Leagues
        </li>
        {leagues.map((league) => (
          <li
            key={league.id}
            className={selectedLeagueId === league.id ? styles.itemActive : styles.item}
            onClick={() => onSelectLeague(league.id)}
          >
            <span className={styles.flag}>
              {countryEmoji[league.country] || league.country.slice(0, 2)}
            </span>
            {league.name}
          </li>
        ))}
      </ul>
    </nav>
  );
}
