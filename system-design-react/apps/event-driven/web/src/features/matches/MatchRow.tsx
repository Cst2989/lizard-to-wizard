import { Match } from '../../core/types';
import { FavoriteStar } from '../favorites/FavoriteStar';
import styles from './MatchRow.module.css';

interface MatchRowProps {
  match: Match;
  isSelected: boolean;
  isFavorite: boolean;
  onSelect: () => void;
  onToggleFavorite: () => void;
}

export function MatchRow({ match, isSelected, isFavorite, onSelect, onToggleFavorite }: MatchRowProps) {
  const isLive = match.status === 'live';
  const isFinished = match.status === 'finished';

  const formatTime = (startTime: string) => {
    const date = new Date(startTime);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      className={isSelected ? styles.rowSelected : styles.row}
      onClick={onSelect}
    >
      <div className={styles.teams}>
        <div className={styles.teamLine}>
          <span className={styles.teamName}>{match.homeTeam.name}</span>
        </div>
        <div className={styles.teamLine}>
          <span className={styles.teamName}>{match.awayTeam.name}</span>
        </div>
      </div>

      {match.status !== 'upcoming' && (
        <div className={styles.score}>
          <span className={isLive ? styles.scoreLive : styles.scoreNum}>
            {match.homeScore}
          </span>
          <span className={isLive ? styles.scoreLive : styles.scoreNum}>
            {match.awayScore}
          </span>
        </div>
      )}

      <div
        className={
          isLive
            ? styles.statusLive
            : isFinished
              ? styles.statusFinished
              : styles.statusUpcoming
        }
      >
        {isLive && <span className={styles.pulse} />}
        {isLive && `${match.currentMinute}'`}
        {isFinished && 'FT'}
        {match.status === 'upcoming' && formatTime(match.startTime)}
      </div>

      <FavoriteStar isFavorite={isFavorite} onToggle={onToggleFavorite} />
    </div>
  );
}
