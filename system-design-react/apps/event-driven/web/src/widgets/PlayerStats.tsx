import { useState } from 'react';
import { useEvent } from '../core/useEvent';
import { GOAL_SCORED, CARD_GIVEN, SUBSTITUTION, RESET } from '../core/events';
import { GameEvent } from '../core/types';
import styles from './PlayerStats.module.css';

interface PlayerStat {
  name: string;
  team: string;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  subbedOff: boolean;
}

/**
 * PlayerStats widget — subscribes to GOAL_SCORED, CARD_GIVEN, SUBSTITUTION, RESET.
 * Tracks goals, assists, and cards per player.
 */
export function PlayerStats() {
  const [players, setPlayers] = useState<Map<string, PlayerStat>>(new Map());

  const getOrCreate = (map: Map<string, PlayerStat>, name: string, team: string): PlayerStat => {
    if (!map.has(name)) {
      map.set(name, { name, team, goals: 0, assists: 0, yellowCards: 0, redCards: 0, subbedOff: false });
    }
    return map.get(name)!;
  };

  useEvent(GOAL_SCORED, (event: GameEvent) => {
    setPlayers((prev) => {
      const next = new Map(prev);
      const scorer = getOrCreate(next, event.payload.player, event.payload.team);
      scorer.goals++;
      if (event.payload.assist) {
        const assister = getOrCreate(next, event.payload.assist, event.payload.team);
        assister.assists++;
      }
      return next;
    });
  });

  useEvent(CARD_GIVEN, (event: GameEvent) => {
    setPlayers((prev) => {
      const next = new Map(prev);
      const player = getOrCreate(next, event.payload.player, event.payload.team);
      if (event.payload.card === 'red') {
        player.redCards++;
      } else {
        player.yellowCards++;
      }
      return next;
    });
  });

  useEvent(SUBSTITUTION, (event: GameEvent) => {
    setPlayers((prev) => {
      const next = new Map(prev);
      const playerOut = getOrCreate(next, event.payload.playerOut, event.payload.teamSide);
      playerOut.subbedOff = true;
      // Register the incoming player
      getOrCreate(next, event.payload.playerIn, event.payload.teamSide);
      return next;
    });
  });

  useEvent(RESET, () => {
    setPlayers(new Map());
  });

  const playerList = Array.from(players.values()).filter(
    (p) => p.goals > 0 || p.assists > 0 || p.yellowCards > 0 || p.redCards > 0
  );

  return (
    <div className={styles.container} data-testid="player-stats">
      <div className={styles.title}>Player Stats</div>
      {playerList.length === 0 ? (
        <div className={styles.empty}>No player events yet</div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Player</th>
              <th>Goals</th>
              <th>Assists</th>
              <th>Cards</th>
            </tr>
          </thead>
          <tbody>
            {playerList.map((p) => (
              <tr key={p.name}>
                <td className={styles.playerName}>{p.name}</td>
                <td>
                  {p.goals > 0 && <span className={styles.goalBadge}>{p.goals}</span>}
                </td>
                <td>
                  {p.assists > 0 && <span className={styles.assistBadge}>{p.assists}</span>}
                </td>
                <td>
                  {p.yellowCards > 0 && (
                    <span className={styles.yellowBadge}>{p.yellowCards}</span>
                  )}
                  {p.redCards > 0 && (
                    <span className={styles.redBadge}>{p.redCards}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
