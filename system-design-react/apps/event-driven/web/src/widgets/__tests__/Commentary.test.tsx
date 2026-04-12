import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { Commentary } from '../Commentary';
import { eventBus } from '../../core/EventBus';

describe('Commentary', () => {
  beforeEach(() => {
    eventBus.removeAllListeners();
  });

  it('should show empty state initially', () => {
    render(<Commentary />);
    expect(screen.getByText('Waiting for match events...')).toBeDefined();
  });

  it('should generate commentary for MATCH_STARTED', () => {
    render(<Commentary />);

    act(() => {
      eventBus.emit({
        type: 'MATCH_STARTED',
        payload: { homeTeam: 'Arsenal', awayTeam: 'Chelsea', competition: 'Premier League' },
        timestamp: 0,
      });
    });

    expect(screen.getByTestId('commentary').textContent).toContain('Arsenal');
    expect(screen.getByTestId('commentary').textContent).toContain('Chelsea');
  });

  it('should generate commentary for GOAL_SCORED', () => {
    render(<Commentary />);

    act(() => {
      eventBus.emit({
        type: 'GOAL_SCORED',
        payload: { player: 'Saka', team: 'home', assist: 'Odegaard' },
        timestamp: 23,
      });
    });

    expect(screen.getByTestId('commentary').textContent).toContain('Saka');
    expect(screen.getByTestId('commentary').textContent).toContain('Odegaard');
  });

  it('should generate commentary for CARD_GIVEN', () => {
    render(<Commentary />);

    act(() => {
      eventBus.emit({
        type: 'CARD_GIVEN',
        payload: { player: 'Palmer', team: 'away', card: 'yellow', reason: 'Tactical foul' },
        timestamp: 31,
      });
    });

    expect(screen.getByTestId('commentary').textContent).toContain('Palmer');
    expect(screen.getByTestId('commentary').textContent).toContain('Tactical foul');
  });

  it('should clear commentary on RESET', () => {
    render(<Commentary />);

    act(() => {
      eventBus.emit({
        type: 'GOAL_SCORED',
        payload: { player: 'Saka', team: 'home', assist: 'Odegaard' },
        timestamp: 23,
      });
    });

    act(() => {
      eventBus.emit({ type: 'RESET', payload: {}, timestamp: 0 });
    });

    expect(screen.getByText('Waiting for match events...')).toBeDefined();
  });
});
