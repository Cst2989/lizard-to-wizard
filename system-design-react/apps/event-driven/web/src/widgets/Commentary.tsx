import { useState } from 'react';
import { useEvent } from '../core/useEvent';
import { WILDCARD, RESET } from '../core/events';
import * as E from '../core/events';
import { GameEvent } from '../core/types';
import styles from './Commentary.module.css';

interface CommentaryEntry {
  minute: number;
  text: string;
  type: string;
}

/**
 * Commentary widget — subscribes to ALL events (*).
 * Generates natural language commentary for each event.
 */
function generateCommentary(event: GameEvent): string | null {
  const { type, payload, timestamp } = event;

  switch (type) {
    case E.MATCH_STARTED:
      return `The referee blows the whistle and we're underway! ${payload.homeTeam} kick off against ${payload.awayTeam} in this ${payload.competition} clash.`;

    case E.GOAL_SCORED:
      if (payload.assist) {
        return `GOOOAL! ${payload.player} finds the back of the net with a brilliant finish! Wonderful assist from ${payload.assist}. The crowd erupts!`;
      }
      return `GOOOAL! ${payload.player} scores! What a moment! The stadium is rocking!`;

    case E.CARD_GIVEN:
      if (payload.card === 'red') {
        return `RED CARD! ${payload.player} is sent off for ${payload.reason}. That's a huge blow. Down to ten men now.`;
      }
      return `The referee reaches for his pocket. Yellow card shown to ${payload.player} for ${payload.reason}. He'll need to be careful from here.`;

    case E.SUBSTITUTION:
      return `Tactical change: ${payload.playerOut} makes way for ${payload.playerIn}. The manager looking to change the dynamic.`;

    case E.HALF_TIME:
      return `The half-time whistle blows. The score stands at ${payload.homeScore}-${payload.awayScore}. Both teams head to the dressing room.`;

    case E.SECOND_HALF:
      return `We're back underway for the second half. Let's see if the managers have made any tactical adjustments.`;

    case E.MATCH_ENDED:
      return `It's all over! Final score: ${payload.homeScore}-${payload.awayScore}. What a match that was!`;

    case E.PENALTY:
      return payload.scored
        ? `PENALTY SCORED! ${payload.player} sends the keeper the wrong way. Cool as you like from the spot!`
        : `PENALTY MISSED! ${payload.player} can't convert from twelve yards. The keeper made a great save!`;

    case E.VAR_REVIEW:
      return `VAR check complete: the decision is ${payload.decision.replace('_', ' ')}. The original call was ${payload.originalCall}.`;

    default:
      return null;
  }
}

export function Commentary() {
  const [entries, setEntries] = useState<CommentaryEntry[]>([]);

  useEvent(WILDCARD, (event: GameEvent) => {
    if (event.type === RESET) {
      setEntries([]);
      return;
    }

    const text = generateCommentary(event);
    if (text) {
      setEntries((prev) => [
        ...prev,
        { minute: event.timestamp, text, type: event.type },
      ]);
    }
  });

  const getEntryClass = (type: string) => {
    if (type === E.GOAL_SCORED || type === E.PENALTY) return styles.entryGoal;
    if (type === E.CARD_GIVEN) return styles.entryCard;
    return styles.entry;
  };

  return (
    <div className={styles.container} data-testid="commentary">
      <div className={styles.title}>Live Commentary</div>
      <div className={styles.entries}>
        {entries.length === 0 ? (
          <div className={styles.empty}>Waiting for match events...</div>
        ) : (
          [...entries].reverse().map((entry, i) => (
            <div key={i} className={getEntryClass(entry.type)}>
              <span className={styles.minute}>{entry.minute}'</span>
              {entry.text}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
