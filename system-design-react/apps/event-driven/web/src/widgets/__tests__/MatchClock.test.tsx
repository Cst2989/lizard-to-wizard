import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { MatchClock } from '../MatchClock';
import { eventBus } from '../../core/EventBus';

describe('MatchClock', () => {
  beforeEach(() => {
    eventBus.removeAllListeners();
  });

  it('should show pre-match state initially', () => {
    render(<MatchClock />);
    expect(screen.getByTestId('match-clock').textContent).toContain('Pre-Match');
  });

  it('should show 1st Half after MATCH_STARTED', () => {
    render(<MatchClock />);

    act(() => {
      eventBus.emit({
        type: 'MATCH_STARTED',
        payload: { homeTeam: 'Arsenal', awayTeam: 'Chelsea' },
        timestamp: 0,
      });
    });

    expect(screen.getByTestId('match-clock').textContent).toContain('1st Half');
  });

  it('should show Half Time after HALF_TIME', () => {
    render(<MatchClock />);

    act(() => {
      eventBus.emit({ type: 'MATCH_STARTED', payload: {}, timestamp: 0 });
      eventBus.emit({ type: 'HALF_TIME', payload: { homeScore: 1, awayScore: 0 }, timestamp: 45 });
    });

    expect(screen.getByTestId('match-clock').textContent).toContain('Half Time');
  });

  it('should show 2nd Half after SECOND_HALF', () => {
    render(<MatchClock />);

    act(() => {
      eventBus.emit({ type: 'MATCH_STARTED', payload: {}, timestamp: 0 });
      eventBus.emit({ type: 'HALF_TIME', payload: {}, timestamp: 45 });
      eventBus.emit({ type: 'SECOND_HALF', payload: {}, timestamp: 46 });
    });

    expect(screen.getByTestId('match-clock').textContent).toContain('2nd Half');
  });

  it('should show Full Time after MATCH_ENDED', () => {
    render(<MatchClock />);

    act(() => {
      eventBus.emit({ type: 'MATCH_STARTED', payload: {}, timestamp: 0 });
      eventBus.emit({ type: 'MATCH_ENDED', payload: { homeScore: 2, awayScore: 1 }, timestamp: 90 });
    });

    expect(screen.getByTestId('match-clock').textContent).toContain('Full Time');
  });

  it('should reset to Pre-Match on RESET', () => {
    render(<MatchClock />);

    act(() => {
      eventBus.emit({ type: 'MATCH_STARTED', payload: {}, timestamp: 0 });
    });

    act(() => {
      eventBus.emit({ type: 'RESET', payload: {}, timestamp: 0 });
    });

    expect(screen.getByTestId('match-clock').textContent).toContain('Pre-Match');
  });
});
