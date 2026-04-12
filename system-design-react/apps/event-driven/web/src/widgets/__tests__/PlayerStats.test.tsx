import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { PlayerStats } from '../PlayerStats';
import { eventBus } from '../../core/EventBus';

describe('PlayerStats', () => {
  beforeEach(() => {
    eventBus.removeAllListeners();
  });

  it('should show empty state initially', () => {
    render(<PlayerStats />);
    expect(screen.getByText('No player events yet')).toBeDefined();
  });

  it('should track goals for a player', () => {
    render(<PlayerStats />);

    act(() => {
      eventBus.emit({
        type: 'GOAL_SCORED',
        payload: { player: 'Saka', team: 'home', assist: 'Odegaard' },
        timestamp: 23,
      });
    });

    expect(screen.getByTestId('player-stats').textContent).toContain('Saka');
    expect(screen.getByTestId('player-stats').textContent).toContain('Odegaard');
  });

  it('should track yellow cards', () => {
    render(<PlayerStats />);

    act(() => {
      eventBus.emit({
        type: 'CARD_GIVEN',
        payload: { player: 'Palmer', team: 'away', card: 'yellow', reason: 'Foul' },
        timestamp: 31,
      });
    });

    expect(screen.getByTestId('player-stats').textContent).toContain('Palmer');
  });

  it('should reset on RESET event', () => {
    render(<PlayerStats />);

    act(() => {
      eventBus.emit({
        type: 'GOAL_SCORED',
        payload: { player: 'Saka', team: 'home', assist: null },
        timestamp: 23,
      });
    });

    act(() => {
      eventBus.emit({ type: 'RESET', payload: {}, timestamp: 0 });
    });

    expect(screen.getByText('No player events yet')).toBeDefined();
  });
});
