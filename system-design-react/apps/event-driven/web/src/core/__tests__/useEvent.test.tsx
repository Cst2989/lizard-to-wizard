import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEvent } from '../useEvent';
import { eventBus } from '../EventBus';

describe('useEvent', () => {
  beforeEach(() => {
    eventBus.removeAllListeners();
  });

  it('should subscribe to events and call the handler', () => {
    const handler = vi.fn();

    renderHook(() => useEvent('GOAL_SCORED', handler));

    act(() => {
      eventBus.emit({ type: 'GOAL_SCORED', payload: { player: 'Saka' }, timestamp: 23 });
    });

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'GOAL_SCORED', payload: { player: 'Saka' } })
    );
  });

  it('should not call handler for unrelated events', () => {
    const handler = vi.fn();

    renderHook(() => useEvent('GOAL_SCORED', handler));

    act(() => {
      eventBus.emit({ type: 'CARD_GIVEN', payload: {}, timestamp: 10 });
    });

    expect(handler).not.toHaveBeenCalled();
  });

  it('should unsubscribe on unmount', () => {
    const handler = vi.fn();

    const { unmount } = renderHook(() => useEvent('GOAL_SCORED', handler));

    act(() => {
      eventBus.emit({ type: 'GOAL_SCORED', payload: {}, timestamp: 10 });
    });
    expect(handler).toHaveBeenCalledTimes(1);

    unmount();

    act(() => {
      eventBus.emit({ type: 'GOAL_SCORED', payload: {}, timestamp: 20 });
    });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('should use latest handler via ref', () => {
    let count = 0;
    const handler1 = vi.fn(() => count++);
    const handler2 = vi.fn(() => (count += 10));

    const { rerender } = renderHook(
      ({ handler }) => useEvent('GOAL_SCORED', handler),
      { initialProps: { handler: handler1 } }
    );

    act(() => {
      eventBus.emit({ type: 'GOAL_SCORED', payload: {}, timestamp: 10 });
    });
    expect(count).toBe(1);

    rerender({ handler: handler2 });

    act(() => {
      eventBus.emit({ type: 'GOAL_SCORED', payload: {}, timestamp: 20 });
    });
    expect(count).toBe(11);
  });
});
