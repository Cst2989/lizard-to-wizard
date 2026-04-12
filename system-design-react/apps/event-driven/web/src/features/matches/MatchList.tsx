import { Match } from '../../core/types';
import { MatchRow } from './MatchRow';
import styles from './MatchList.module.css';

interface MatchListProps {
  matches: Match[];
  selectedMatchId: string | null;
  onSelectMatch: (matchId: string) => void;
  favorites: Set<string>;
  onToggleFavorite: (matchId: string) => void;
  showFavoritesOnly: boolean;
}

export function MatchList({
  matches,
  selectedMatchId,
  onSelectMatch,
  favorites,
  onToggleFavorite,
  showFavoritesOnly,
}: MatchListProps) {
  const filtered = showFavoritesOnly
    ? matches.filter((m) => favorites.has(m.id))
    : matches;

  // Sort: live first, then upcoming, then finished
  const sorted = [...filtered].sort((a, b) => {
    const order = { live: 0, upcoming: 1, finished: 2 };
    return order[a.status] - order[b.status];
  });

  const live = sorted.filter((m) => m.status === 'live');
  const upcoming = sorted.filter((m) => m.status === 'upcoming');
  const finished = sorted.filter((m) => m.status === 'finished');

  if (sorted.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>
          {showFavoritesOnly ? 'No favorite matches' : 'No matches found'}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.list}>
        {live.length > 0 && (
          <>
            <div className={styles.statusGroup}>Live</div>
            {live.map((match) => (
              <MatchRow
                key={match.id}
                match={match}
                isSelected={match.id === selectedMatchId}
                isFavorite={favorites.has(match.id)}
                onSelect={() => onSelectMatch(match.id)}
                onToggleFavorite={() => onToggleFavorite(match.id)}
              />
            ))}
          </>
        )}
        {upcoming.length > 0 && (
          <>
            <div className={styles.statusGroup}>Upcoming</div>
            {upcoming.map((match) => (
              <MatchRow
                key={match.id}
                match={match}
                isSelected={match.id === selectedMatchId}
                isFavorite={favorites.has(match.id)}
                onSelect={() => onSelectMatch(match.id)}
                onToggleFavorite={() => onToggleFavorite(match.id)}
              />
            ))}
          </>
        )}
        {finished.length > 0 && (
          <>
            <div className={styles.statusGroup}>Finished</div>
            {finished.map((match) => (
              <MatchRow
                key={match.id}
                match={match}
                isSelected={match.id === selectedMatchId}
                isFavorite={favorites.has(match.id)}
                onSelect={() => onSelectMatch(match.id)}
                onToggleFavorite={() => onToggleFavorite(match.id)}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
