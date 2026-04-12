import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventBus } from '../EventBus';

describe('EventBus', () => {
  let bus: EventBus;

  beforeEach(() => {
    bus = new EventBus();
  });

  describe('subscribe', () => {
    it('should subscribe to a specific event type', () => {
      const handler = vi.fn();
      bus.subscribe('GOAL_SCORED', handler);

      bus.emit({ type: 'GOAL_SCORED', payload: { player: 'Saka' }, timestamp: 23 });

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith({
        type: 'GOAL_SCORED',
        payload: { player: 'Saka' },
        timestamp: 23,
      });
    });

    it('should not trigger handler for unrelated events', () => {
      const handler = vi.fn();
      bus.subscribe('GOAL_SCORED', handler);

      bus.emit({ type: 'CARD_GIVEN', payload: { player: 'Palmer' }, timestamp: 31 });

      expect(handler).not.toHaveBeenCalled();
    });

    it('should allow multiple handlers for the same event', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      bus.subscribe('GOAL_SCORED', handler1);
      bus.subscribe('GOAL_SCORED', handler2);

      bus.emit({ type: 'GOAL_SCORED', payload: {}, timestamp: 10 });

      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(1);
    });
  });

  describe('unsubscribe', () => {
    it('should return an unsubscribe function', () => {
      const handler = vi.fn();
      const unsub = bus.subscribe('GOAL_SCORED', handler);

      bus.emit({ type: 'GOAL_SCORED', payload: {}, timestamp: 10 });
      expect(handler).toHaveBeenCalledTimes(1);

      unsub();

      bus.emit({ type: 'GOAL_SCORED', payload: {}, timestamp: 20 });
      expect(handler).toHaveBeenCalledTimes(1); // Still 1, not called again
    });

    it('should not affect other handlers when unsubscribing', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      const unsub1 = bus.subscribe('GOAL_SCORED', handler1);
      bus.subscribe('GOAL_SCORED', handler2);

      unsub1();

      bus.emit({ type: 'GOAL_SCORED', payload: {}, timestamp: 10 });
      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).toHaveBeenCalledTimes(1);
    });
  });

  describe('wildcard (*)', () => {
    it('should receive all events when subscribed to wildcard', () => {
      const handler = vi.fn();
      bus.subscribe('*', handler);

      bus.emit({ type: 'GOAL_SCORED', payload: {}, timestamp: 10 });
      bus.emit({ type: 'CARD_GIVEN', payload: {}, timestamp: 20 });
      bus.emit({ type: 'MATCH_STARTED', payload: {}, timestamp: 0 });

      expect(handler).toHaveBeenCalledTimes(3);
    });

    it('should not double-notify wildcard subscribers when emitting *', () => {
      const handler = vi.fn();
      bus.subscribe('*', handler);

      bus.emit({ type: '*', payload: {}, timestamp: 0 });

      // Should only be called once, not twice
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should trigger both specific and wildcard handlers', () => {
      const specificHandler = vi.fn();
      const wildcardHandler = vi.fn();

      bus.subscribe('GOAL_SCORED', specificHandler);
      bus.subscribe('*', wildcardHandler);

      bus.emit({ type: 'GOAL_SCORED', payload: {}, timestamp: 10 });

      expect(specificHandler).toHaveBeenCalledTimes(1);
      expect(wildcardHandler).toHaveBeenCalledTimes(1);
    });
  });

  describe('clear (reset)', () => {
    it('should emit a RESET event', () => {
      const handler = vi.fn();
      bus.subscribe('RESET', handler);

      bus.clear();

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith({
        type: 'RESET',
        payload: {},
        timestamp: 0,
      });
    });

    it('should trigger wildcard handlers on clear', () => {
      const handler = vi.fn();
      bus.subscribe('*', handler);

      bus.clear();

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should NOT remove subscriptions on clear', () => {
      const handler = vi.fn();
      bus.subscribe('GOAL_SCORED', handler);

      bus.clear();

      bus.emit({ type: 'GOAL_SCORED', payload: {}, timestamp: 10 });
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe('removeAllListeners', () => {
    it('should remove all subscriptions', () => {
      const handler = vi.fn();
      bus.subscribe('GOAL_SCORED', handler);
      bus.subscribe('*', handler);

      bus.removeAllListeners();

      bus.emit({ type: 'GOAL_SCORED', payload: {}, timestamp: 10 });
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('listenerCount', () => {
    it('should return the correct count of listeners', () => {
      expect(bus.listenerCount('GOAL_SCORED')).toBe(0);

      bus.subscribe('GOAL_SCORED', vi.fn());
      expect(bus.listenerCount('GOAL_SCORED')).toBe(1);

      bus.subscribe('GOAL_SCORED', vi.fn());
      expect(bus.listenerCount('GOAL_SCORED')).toBe(2);
    });
  });

  describe('replay scenario (time travel)', () => {
    it('should support clear + replay pattern', () => {
      const scoreHandler = vi.fn();
      bus.subscribe('GOAL_SCORED', scoreHandler);
      bus.subscribe('RESET', vi.fn());

      // Simulate initial events
      bus.emit({ type: 'GOAL_SCORED', payload: { player: 'Saka' }, timestamp: 23 });
      expect(scoreHandler).toHaveBeenCalledTimes(1);

      // Clear and replay
      bus.clear();
      bus.emit({ type: 'GOAL_SCORED', payload: { player: 'Saka' }, timestamp: 23 });
      bus.emit({ type: 'GOAL_SCORED', payload: { player: 'Palmer' }, timestamp: 52 });

      expect(scoreHandler).toHaveBeenCalledTimes(3);
    });
  });
});
