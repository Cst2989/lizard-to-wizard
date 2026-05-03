import React, { useState, useEffect } from 'react';

// Event bus that's shared with the shell for cross-app communication
// This creates a global reference that both shell and slides can access
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

const SLIDES = [
  {
    id: 1,
    title: 'Micro Frontend Architecture',
    content: 'Module Federation - Webpack-based Distributed Development',
    color: '#e3f2fd',
    details: 'Learn how we build, load, and communicate across independent micro frontends',
  },
  {
    id: 2,
    title: 'Folder Structure',
    content: `
/apps
  /shell (3000) - Main container app
    /src/App.tsx, Navigation.tsx
  /products (5001) - Vertical MFE
  /orders (5002) - Vertical MFE
  /dashboard (5003) - Vertical MFE
    \\-- Loads Slides as horizontal MFE
  /users (5004) - Vertical MFE
  /slides (5005) - Horizontal MFE

/packages
  /event-bus - Shared event communication
    `,
    color: '#f3e5f5',
  },
  {
    id: 3,
    title: 'How Micro Frontends Load',
    content: `
1. Shell registers remotes in webpack.config.js
   remotes: { products, orders, dashboard, users }

2. Shell dynamically imports apps with retry:
   const ProductsApp = lazy(() => import('products/App'))

3. Each app exposes its App component:
   exposes: { './App': './src/App.tsx' }

4. Remote entry points serve at specific ports
   products: 'http://localhost:5001/remoteEntry.js'
    `,
    color: '#e8f5e9',
  },
  {
    id: 4,
    title: 'Independent Deployment',
    content: `
Each app is completely independent:
[OK] Separate package.json & dependencies
[OK] Own webpack dev server on unique port
[OK] Can be deployed separately
[OK] Changes detected & built independently

Example: Update products/ code
  -> Only products bundle rebuilds
  -> Other apps unaffected
  -> Zero downtime deployment

Command: pnpm dev (runs all in parallel)
    `,
    color: '#fff3e0',
  },
  {
    id: 5,
    title: 'Event Bus Communication',
    content: `
Inter-microfrontend communication via global event bus:

[OK] Window object stores shared event bus
  window.__SLIDE_EVENT_BUS__

[OK] Slides app emits events:
  eventBus.emit('slide:changed', {slideNumber, totalSlides})

[OK] Dashboard & Shell subscribe:
  eventBus.subscribe('slide:changed', (data) => {...})

[OK] Cross-MFE communication without direct imports
[OK] Loose coupling - apps don't know about each other
    `,
    color: '#ffe0b2',
  },
  {
    id: 6,
    title: 'Shared Dependencies',
    content: `
React ecosystem shared between all apps:

shared: {
  react: { singleton: true, strictVersion: false },
  'react-dom': { singleton: true, strictVersion: false },
  'react-router-dom': { singleton: true, strictVersion: false }
}

Benefits:
[OK] Only ONE copy of React in browser
[OK] Version flexibility - works together
[OK] Reduced bundle size
[OK] Consistent state across apps
    `,
    color: '#f8bbd0',
  },
  {
    id: 7,
    title: 'Vertical vs Horizontal MFEs',
    content: `
VERTICAL: Loaded via shell routes
  -> Products at /products
  -> Orders at /orders
  -> Dashboard at /dashboard
  -> Users at /users

HORIZONTAL: Nested inside vertical MFEs
  -> Slides loaded inside Dashboard
  -> Slides at /dashboard -> "View Slides" button
  -> Communicates via event bus

This architecture allows flexible composition!
    `,
    color: '#c8e6c9',
  },
  {
    id: 8,
    title: 'Development Workflow',
    content: `
1. Run all servers in parallel:
   pnpm dev -> starts all 6 apps

2. Make changes to any app:
   Code changes automatically hot-reload

3. App rebuilds independently:
   Only affected app webpack rebuilds

4. Remote entry (remoteEntry.js) updates:
   Shell/Dashboard automatically picks up new version

5. Test across multiple MFEs:
   All running, all communicating via event bus

Zero-friction development experience!
    `,
    color: '#ffccbc',
  },
  {
    id: 9,
    title: 'Key Concepts',
    content: `
MODULE FEDERATION:
- Webpack feature for dynamic module loading
- Runtime dependency sharing
- Async boundary between apps

REMOTES: Apps being loaded
- products, orders, dashboard, users, slides

EXPOSES: What each app shares
- Each app exposes ./App component

SHARED: Dependencies all apps use
- React, React DOM, React Router

BOOTSTRAP PATTERN: Delayed initialization
- index.tsx -> dynamically imports('./bootstrap')
- Gives Module Federation time to setup
    `,
    color: '#d1c4e9',
  },
  {
    id: 10,
    title: 'Architecture Benefits',
    content: `
[OK] SCALABILITY: Add new MFEs without touching shell

[OK] AUTONOMY: Teams own their MFE independently

[OK] DEPLOYMENT: Deploy individual MFEs separately

[OK] TECHNOLOGY: Each MFE can use different libs
  (within shared constraints)

[OK] COMMUNICATION: Event bus for loosely coupled updates

[OK] PERFORMANCE: Lazy load MFEs only when needed

[OK] FLEXIBILITY: Vertical + Horizontal composition

This is modern micro frontend architecture!
    `,
    color: '#c5cae9',
  },
];

const App: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    // Emit slide change event
    const slideData: SlideChangeEvent = {
      slideNumber: currentSlide + 1,
      totalSlides: SLIDES.length,
    };
    eventBus.emit(EVENTS.SLIDE_CHANGED, slideData);
  }, [currentSlide]);

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const slide = SLIDES[currentSlide];

  return (
    <div style={{ fontFamily: 'Consolas, Monaco, monospace', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <div
        style={{
          backgroundColor: slide.color,
          minHeight: '75vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: '40px 60px',
          textAlign: 'left',
          overflowY: 'auto',
        }}
      >
        <h1 style={{ marginBottom: '30px', fontSize: '48px', color: '#1a1a1a' }}>{slide.title}</h1>
        <pre style={{
          fontSize: '16px',
          color: '#333',
          marginBottom: '40px',
          fontFamily: 'Consolas, Monaco, monospace',
          lineHeight: '1.8',
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
          margin: 0,
        }}>
          {slide.content}
        </pre>
        <div style={{ fontSize: '16px', color: '#666', marginTop: 'auto', paddingTop: '20px' }}>
          Slide {currentSlide + 1} of {SLIDES.length}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '20px',
          padding: '40px',
          backgroundColor: '#f5f5f5',
        }}
      >
        <button
          onClick={handlePrevious}
          disabled={currentSlide === 0}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: currentSlide === 0 ? '#ccc' : '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: currentSlide === 0 ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.3s',
          }}
        >
          {'<- Previous'}
        </button>

        <button
          onClick={handleNext}
          disabled={currentSlide === SLIDES.length - 1}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor:
              currentSlide === SLIDES.length - 1 ? '#ccc' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: currentSlide === SLIDES.length - 1 ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.3s',
          }}
        >
          {'Next ->'}
        </button>
      </div>
    </div>
  );
};

export default App;
