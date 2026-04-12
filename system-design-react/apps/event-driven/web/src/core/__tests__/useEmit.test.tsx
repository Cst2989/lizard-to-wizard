import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEmit } from '../useEmit';
import { eventBus } from '../EventBus';

describe('useEmit', () => {
  beforeEach(() => {
    eventBus.removeAllListeners();
  });

  it('should return a stable emit function', () => {
    const { result, rerender } = renderHook(() => useEmit());

    const emit1 = result.current;
    rerender();
    const emit2 = result.current;

    expect(emit1).toBe(emit2);
  });

  it('should emit events through the EventBus', () => {
    const handler = vi.fn();
    eventBus.subscribe('GOAL_SCORED', handler);

    const { result } = renderHook(() => useEmit());

    act(() => {
      result.current({
        type: 'GOAL_SCORED',
        payload: { player: 'Kane', team: 'home' },
        timestamp: 11,
      });
    });

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'GOAL_SCORED',
        payload: { player: 'Kane', team: 'home' },
      })
    );
  });

  it('should trigger wildcard subscribers', () => {
    const handler = vi.fn();
    eventBus.subscribe('*', handler);

    const { result } = renderHook(() => useEmit());

    act(() => {
      result.current({ type: 'CARD_GIVEN', payload: {}, timestamp: 30 });
    });

    expect(handler).toHaveBeenCalledTimes(1);
  });
});
