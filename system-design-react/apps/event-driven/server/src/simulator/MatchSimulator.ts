import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const allEvents = require('../data/events.json');

export interface GameEvent {
  type: string;
  payload: Record<string, any>;
  timestamp: number;
}

type EventCallback = (event: GameEvent) => void;

/**
 * MatchSimulator reads pre-scripted events from events.json and emits them
 * on a timer to simulate a live match playing out in accelerated time.
 *
 * For "live" matches it picks up from the current event index.
 * Events are emitted every 3-8 seconds (randomized for realism).
 */
export class MatchSimulator {
  private matchId: string;
  private events: GameEvent[];
  private currentIndex: number = 0;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private callback: EventCallback | null = null;
  private running: boolean = false;

  constructor(matchId: string) {
    this.matchId = matchId;
    this.events = (allEvents as Record<string, GameEvent[]>)[matchId] || [];
  }

  onEvent(callback: EventCallback): void {
    this.callback = callback;
  }

  start(): void {
    if (this.running || this.events.length === 0) return;
    this.running = true;
    this.scheduleNext();
  }

  stop(): void {
    this.running = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  getEvents(): GameEvent[] {
    return this.events;
  }

  isRunning(): boolean {
    return this.running;
  }

  private scheduleNext(): void {
    if (!this.running || this.currentIndex >= this.events.length) {
      this.running = false;
      return;
    }

    // Random delay between 3-8 seconds
    const delay = 3000 + Math.random() * 5000;

    this.timer = setTimeout(() => {
      if (!this.running) return;

      const event = this.events[this.currentIndex];
      this.currentIndex++;

      if (this.callback) {
        this.callback(event);
      }

      this.scheduleNext();
    }, delay);
  }
}
