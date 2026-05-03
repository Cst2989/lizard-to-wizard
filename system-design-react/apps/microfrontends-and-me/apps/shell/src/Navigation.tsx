import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Event bus for inter-microfrontend communication
declare global {
  interface Window {
    __SLIDE_EVENT_BUS__?: any;
  }
}

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
}

// Initialize or reuse existing event bus on window (lazy to avoid window access at module load)
let eventBus: any;
if (typeof window !== 'undefined') {
  eventBus = window.__SLIDE_EVENT_BUS__ || new EventBus();
  window.__SLIDE_EVENT_BUS__ = eventBus;
} else {
  eventBus = new EventBus();
}

interface SlideChangeEvent {
  slideNumber: number;
  totalSlides: number;
}

const EVENTS = {
  SLIDE_CHANGED: 'slide:changed',
} as const;

export { eventBus, EVENTS, type SlideChangeEvent };

const Navigation: React.FC = () => {
  const [slideNumber, setSlideNumber] = useState<number | null>(null);

  useEffect(() => {
    // Subscribe to slide change events
    const unsubscribe = (eventBus as any).subscribe(
      EVENTS.SLIDE_CHANGED,
      (data: SlideChangeEvent) => {
        setSlideNumber(data.slideNumber);
      }
    );

    return unsubscribe;
  }, []);

  return (
    <nav style={{
      padding: '20px',
      background: '#282c34',
      marginBottom: '20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}>
      <ul style={{
        listStyle: 'none',
        display: 'flex',
        gap: '20px',
        margin: 0,
        padding: 0,
      }}>
        <li>
          <Link
            to="/"
            style={{
              color: 'white',
              textDecoration: 'none',
              fontSize: '18px',
              fontWeight: 'bold',
            }}
          >
            Home
          </Link>
        </li>
        <li>
          <Link
            to="/products"
            style={{
              color: 'white',
              textDecoration: 'none',
              fontSize: '18px',
            }}
          >
            Products
          </Link>
        </li>
        <li>
          <Link
            to="/orders"
            style={{
              color: 'white',
              textDecoration: 'none',
              fontSize: '18px',
            }}
          >
            Orders
          </Link>
        </li>
        <li>
          <Link
            to="/dashboard"
            style={{
              color: 'white',
              textDecoration: 'none',
              fontSize: '18px',
            }}
          >
            Dashboard
          </Link>
        </li>
      </ul>

      {slideNumber && (
        <div style={{
          color: '#61dafb',
          fontSize: '16px',
          fontWeight: 'bold',
          backgroundColor: 'rgba(97, 218, 251, 0.1)',
          padding: '8px 16px',
          borderRadius: '4px',
          border: '1px solid #61dafb',
        }}>
          Slide: {slideNumber}
        </div>
      )}
    </nav>
  );
};

export default Navigation;
