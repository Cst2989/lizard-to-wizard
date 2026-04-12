import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { Scoreboard } from '../Scoreboard';
import { eventBus } from '../../core/EventBus';

describe('Scoreboard', () => {
  beforeEach(() => {
    eventBus.removeAllListeners();
  });

  it('should render with initial score 0-0', () => {
    render(<Scoreboard />);

    const scoreboard = screen.getByTestId('scoreboard');
    expect(scoreboard.textContent).toContain('0');
  });

  it('should increment home score on home GOAL_SCORED', () => {
    render(<Scoreboard />);

    act(() => {
      eventBus.emit({
        type: 'GOAL_SCORED',
        payload: { player: 'Saka', team: 'home' },
        timestamp: 23,
      });
    });

    const scoreboard = screen.getByTestId('scoreboard');
    expect(scoreboard.textContent).toContain('1');
  });

  it('should increment away score on away GOAL_SCORED', () => {
    render(<Scoreboard />);

    act(() => {
      eventBus.emit({
        type: 'GOAL_SCORED',
        payload: { player: 'Palmer', team: 'away' },
        timestamp: 52,
      });
    });

    const scoreboard = screen.getByTestId('scoreboard');
    // Should show 0-1
    expect(scoreboard.textContent).toMatch(/0.*-.*1/);
  });

  it('should reset score on RESET event', () => {
    render(<Scoreboard />);

    act(() => {
      eventBus.emit({
        type: 'GOAL_SCORED',
        payload: { player: 'Saka', team: 'home' },
        timestamp: 23,
      });
      eventBus.emit({
        type: 'GOAL_SCORED',
        payload: { player: 'Palmer', team: 'away' },
        timestamp: 52,
      });
    });

    act(() => {
      eventBus.emit({ type: 'RESET', payload: {}, timestamp: 0 });
    });

    const scoreboard = screen.getByTestId('scoreboard');
    expect(scoreboard.textContent).toMatch(/0.*-.*0/);
  });

  it('should handle multiple goals correctly', () => {
    render(<Scoreboard />);

    act(() => {
      eventBus.emit({ type: 'GOAL_SCORED', payload: { player: 'Saka', team: 'home' }, timestamp: 23 });
      eventBus.emit({ type: 'GOAL_SCORED', payload: { player: 'Havertz', team: 'home' }, timestamp: 67 });
      eventBus.emit({ type: 'GOAL_SCORED', payload: { player: 'Palmer', team: 'away' }, timestamp: 52 });
    });

    const scoreboard = screen.getByTestId('scoreboard');
    expect(scoreboard.textContent).toMatch(/2.*-.*1/);
  });
});
