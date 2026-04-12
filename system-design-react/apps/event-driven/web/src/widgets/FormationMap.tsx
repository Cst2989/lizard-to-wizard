import { useState } from 'react';
import { useEvent } from '../core/useEvent';
import { MATCH_STARTED, SUBSTITUTION, CARD_GIVEN, RESET } from '../core/events';
import { GameEvent } from '../core/types';
import styles from './FormationMap.module.css';

interface PlayerEntry {
  name: string;
  subbedOff: boolean;
  subbedIn: boolean;
  redCard: boolean;
}

interface TeamLineup {
  home: { name: string; players: Map<string, PlayerEntry> };
  away: { name: string; players: Map<string, PlayerEntry> };
}

/**
 * FormationMap widget — subscribes to MATCH_STARTED, SUBSTITUTION, CARD_GIVEN (red), RESET.
 * Shows a visual lineup with substitutions and red cards marked.
 */
export function FormationMap() {
  const [lineup, setLineup] = useState<TeamLineup | null>(null);

  useEvent(MATCH_STARTED, (event: GameEvent) => {
    setLineup({
      home: { name: event.payload.homeTeam, players: new Map() },
      away: { name: event.payload.awayTeam, players: new Map() },
    });
  });

  useEvent(SUBSTITUTION, (event: GameEvent) => {
    setLineup((prev) => {
      if (!prev) return prev;
      const next = {
        home: { ...prev.home, players: new Map(prev.home.players) },
        away: { ...prev.away, players: new Map(prev.away.players) },
      };
      const side = event.payload.teamSide === 'home' ? next.home : next.away;

      // Mark player out
      const existing = side.players.get(event.payload.playerOut);
      if (existing) {
        side.players.set(event.payload.playerOut, { ...existing, subbedOff: true });
      } else {
        side.players.set(event.payload.playerOut, { name: event.payload.playerOut, subbedOff: true, subbedIn: false, redCard: false });
      }

      // Add player in
      side.players.set(event.payload.playerIn, { name: event.payload.playerIn, subbedOff: false, subbedIn: true, redCard: false });

      return next;
    });
  });

  useEvent(CARD_GIVEN, (event: GameEvent) => {
    if (event.payload.card !== 'red') return;

    setLineup((prev) => {
      if (!prev) return prev;
      const next = {
        home: { ...prev.home, players: new Map(prev.home.players) },
        away: { ...prev.away, players: new Map(prev.away.players) },
      };
      const side = event.payload.team === 'home' ? next.home : next.away;

      const existing = side.players.get(event.payload.player);
      if (existing) {
        side.players.set(event.payload.player, { ...existing, redCard: true });
      } else {
        side.players.set(event.payload.player, { name: event.payload.player, subbedOff: false, subbedIn: false, redCard: true });
      }

      return next;
    });
  });

  useEvent(RESET, () => {
    setLineup(null);
  });

  if (!lineup) {
    return (
      <div className={styles.container}>
        <div className={styles.title}>Formation</div>
        <div className={styles.pitch}>
          <div className={styles.empty}>Waiting for match to start...</div>
        </div>
      </div>
    );
  }

  const renderTeam = (teamData: { name: string; players: Map<string, PlayerEntry> }, label: string) => (
    <div className={styles.teamSection}>
      <div className={styles.teamLabel}>{label}: {teamData.name}</div>
      <div className={styles.players}>
        {Array.from(teamData.players.values()).map((p) => {
          let cls = styles.player;
          if (p.redCard) cls = styles.playerRed;
          else if (p.subbedOff) cls = styles.playerSubbed;
          else if (p.subbedIn) cls = styles.subIn;

          return (
            <span key={p.name} className={cls}>
              {p.name}
            </span>
          );
        })}
        {teamData.players.size === 0 && (
          <span className={styles.player} style={{ opacity: 0.4 }}>No changes yet</span>
        )}
      </div>
    </div>
  );

  return (
    <div className={styles.container} data-testid="formation-map">
      <div className={styles.title}>Formation</div>
      <div className={styles.pitch}>
        <div className={styles.halfLine} />
        <div className={styles.centerCircle} />
        {renderTeam(lineup.home, 'Home')}
        {renderTeam(lineup.away, 'Away')}
      </div>
    </div>
  );
}
