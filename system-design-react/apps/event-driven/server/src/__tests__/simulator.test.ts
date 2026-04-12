import { describe, it, expect, vi, afterEach } from 'vitest';
import { MatchSimulator } from '../simulator/MatchSimulator.js';

describe('MatchSimulator', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create a simulator for a valid match', () => {
    const sim = new MatchSimulator('m1');
    expect(sim).toBeDefined();
    expect(sim.getEvents().length).toBeGreaterThan(0);
  });

  it('should create a simulator with empty events for unknown match', () => {
    const sim = new MatchSimulator('unknown');
    expect(sim.getEvents()).toEqual([]);
  });

  it('should not start if there are no events', () => {
    const sim = new MatchSimulator('m4');
    sim.start();
    expect(sim.isRunning()).toBe(false);
  });

  it('should emit events via callback', async () => {
    vi.useFakeTimers();
    const sim = new MatchSimulator('m1');
    const events: any[] = [];

    sim.onEvent((event) => {
      events.push(event);
    });

    sim.start();
    expect(sim.isRunning()).toBe(true);

    // Advance time to trigger events
    vi.advanceTimersByTime(10000);

    expect(events.length).toBeGreaterThan(0);
    expect(events[0].type).toBe('MATCH_STARTED');

    sim.stop();
    vi.useRealTimers();
  });

  it('should stop emitting after stop() is called', () => {
    vi.useFakeTimers();
    const sim = new MatchSimulator('m1');
    const events: any[] = [];

    sim.onEvent((event) => events.push(event));
    sim.start();

    vi.advanceTimersByTime(5000);
    sim.stop();

    const countAfterStop = events.length;
    vi.advanceTimersByTime(20000);

    expect(events.length).toBe(countAfterStop);
    expect(sim.isRunning()).toBe(false);

    vi.useRealTimers();
  });
});
