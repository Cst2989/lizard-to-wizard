import { useEffect, useState } from 'react';
import { Match, GameEvent } from '../../core/types';
import { eventBus } from '../../core/EventBus';
import { fetchMatch, fetchMatchEvents } from '../../api/client';
import { connectToMatch } from '../../api/sse';
import { Scoreboard } from '../../widgets/Scoreboard';
import { MatchClock } from '../../widgets/MatchClock';
import { Commentary } from '../../widgets/Commentary';
import { PlayerStats } from '../../widgets/PlayerStats';
import { FormationMap } from '../../widgets/FormationMap';
import { EventLog } from '../../widgets/EventLog';
import { Timeline } from '../timeline/Timeline';
import { TimeSlider } from '../timeline/TimeSlider';
import styles from './MatchDetail.module.css';

interface MatchDetailProps {
  matchId: string | null;
}

export function MatchDetail({ matchId }: MatchDetailProps) {
  const [match, setMatch] = useState<Match | null>(null);

  useEffect(() => {
    if (!matchId) {
      setMatch(null);
      return;
    }

    let sseCleanup: (() => void) | null = null;

    async function loadMatch() {
      try {
        const matchData = await fetchMatch(matchId!);
        setMatch(matchData);

        // Load all events and replay them through the bus
        const events = await fetchMatchEvents(matchId!);
        eventBus.clear(); // Reset all widgets

        // Replay events synchronously so widgets build up state
        for (const event of events) {
          eventBus.emit(event);
        }

        // If live, connect SSE for future events
        if (matchData.status === 'live') {
          sseCleanup = connectToMatch(matchId!);
        }
      } catch (err) {
        console.error('Failed to load match:', err);
      }
    }

    loadMatch();

    return () => {
      if (sseCleanup) sseCleanup();
      eventBus.clear();
    };
  }, [matchId]);

  if (!matchId) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>Select a match to view details</div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>Loading...</div>
      </div>
    );
  }

  const isLive = match.status === 'live';

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.matchup}>
          <div className={styles.teamBlock}>
            <span className={styles.teamNameLarge}>{match.homeTeam.name}</span>
            <span className={styles.teamShort}>{match.homeTeam.shortName}</span>
          </div>
          <Scoreboard />
          <div className={styles.teamBlock}>
            <span className={styles.teamNameLarge}>{match.awayTeam.name}</span>
            <span className={styles.teamShort}>{match.awayTeam.shortName}</span>
          </div>
        </div>
        <MatchClock />
        <div className={isLive ? styles.matchStatusLive : styles.matchStatus}>
          {isLive && `LIVE ${match.currentMinute}'`}
          {match.status === 'finished' && 'Full Time'}
          {match.status === 'upcoming' && 'Not Started'}
        </div>
      </div>

      <div className={styles.fullWidth} style={{ padding: '0 20px', paddingTop: '16px' }}>
        <TimeSlider
          matchId={match.id}
          maxMinute={match.status === 'upcoming' ? 0 : match.currentMinute}
        />
      </div>

      <div className={styles.widgets}>
        <div className={styles.fullWidth}>
          <Timeline />
        </div>
        <Commentary />
        <PlayerStats />
        <FormationMap />
        <EventLog />
      </div>
    </div>
  );
}
