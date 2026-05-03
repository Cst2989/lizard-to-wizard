// Simple event bus for inter-microfrontend communication
type EventCallback<T = any> = (data: T) => void;

interface EventMap {
  [key: string]: EventCallback[];
}

class EventBus {
  private events: EventMap = {};

  subscribe<T = any>(eventName: string, callback: EventCallback<T>): () => void {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }

    this.events[eventName].push(callback);

    // Return unsubscribe function
    return () => {
      this.events[eventName] = this.events[eventName].filter(cb => cb !== callback);
    };
  }

  emit<T = any>(eventName: string, data?: T): void {
    if (!this.events[eventName]) {
      return;
    }

    this.events[eventName].forEach(callback => {
      callback(data);
    });
  }

  unsubscribe(eventName: string, callback: EventCallback): void {
    if (!this.events[eventName]) {
      return;
    }

    this.events[eventName] = this.events[eventName].filter(cb => cb !== callback);
  }

  unsubscribeAll(eventName: string): void {
    this.events[eventName] = [];
  }
}

// Global event bus instance
export const eventBus = new EventBus();

// Event types for slides
export interface SlideChangeEvent {
  slideNumber: number;
  totalSlides: number;
}

// Event names
export const EVENTS = {
  SLIDE_CHANGED: 'slide:changed',
} as const;
