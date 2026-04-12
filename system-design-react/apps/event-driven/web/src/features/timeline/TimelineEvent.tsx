import { GameEvent } from '../../core/types';
import * as E from '../../core/events';
import styles from './TimelineEvent.module.css';

interface TimelineEventProps {
  event: GameEvent;
}

function getIcon(type: string, payload: any): { icon: string; className: string } {
  switch (type) {
    case E.GOAL_SCORED:
      return { icon: '\u26BD', className: styles.goal };
    case E.CARD_GIVEN:
      return payload.card === 'red'
        ? { icon: '\uD83D\uDFE5', className: styles.redCard }
        : { icon: '\uD83D\uDFE8', className: styles.card };
    case E.SUBSTITUTION:
      return { icon: '\uD83D\uDD04', className: styles.sub };
    case E.HALF_TIME:
    case E.SECOND_HALF:
    case E.MATCH_STARTED:
    case E.MATCH_ENDED:
      return { icon: '\uD83D\uDCEF', className: styles.whistle };
    case E.VAR_REVIEW:
      return { icon: '\uD83D\uDCFA', className: styles.var };
    case E.PENALTY:
      return { icon: '\uD83C\uDFAF', className: styles.penalty };
    default:
      return { icon: '\u2022', className: '' };
  }
}

function getText(event: GameEvent): string {
  const { type, payload } = event;
  switch (type) {
    case E.MATCH_STARTED:
      return `Kick-off: ${payload.homeTeam} vs ${payload.awayTeam}`;
    case E.GOAL_SCORED:
      return `GOAL! ${payload.player} (${payload.team})${payload.assist ? ` — assist: ${payload.assist}` : ''}`;
    case E.CARD_GIVEN:
      return `${payload.card === 'red' ? 'RED' : 'Yellow'} card: ${payload.player} (${payload.reason})`;
    case E.SUBSTITUTION:
      return `Sub: ${payload.playerIn} replaces ${payload.playerOut}`;
    case E.HALF_TIME:
      return `Half-time: ${payload.homeScore} - ${payload.awayScore}`;
    case E.SECOND_HALF:
      return 'Second half begins';
    case E.MATCH_ENDED:
      return `Full time: ${payload.homeScore} - ${payload.awayScore}`;
    case E.PENALTY:
      return `Penalty ${payload.scored ? 'SCORED' : 'MISSED'} by ${payload.player}`;
    case E.VAR_REVIEW:
      return `VAR: ${payload.decision} (original: ${payload.originalCall})`;
    default:
      return type;
  }
}

export function TimelineEvent({ event }: TimelineEventProps) {
  const { icon, className } = getIcon(event.type, event.payload);

  return (
    <div className={styles.event}>
      <span className={styles.minute}>{event.timestamp}'</span>
      <span className={`${styles.icon} ${className}`}>{icon}</span>
      <span className={styles.text}>{getText(event)}</span>
    </div>
  );
}
