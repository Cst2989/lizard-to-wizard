// slides/slideData.ts - All slide content for the System Design presentation

export interface Slide {
  id: string;
  title: string;
  subtitle?: string;
  content: SlideContent[];
  category: string;
}

export type SlideContent = 
  | { type: 'text'; value: string }
  | { type: 'bullets'; items: string[] }
  | { type: 'code'; language: string; value: string }
  | { type: 'diagram'; value: string }
  | { type: 'comparison'; left: { title: string; items: string[] }; right: { title: string; items: string[] } }
  | { type: 'steps'; items: { title: string; description: string }[] };

export const slides: Slide[] = [
  // ==================== INTRO ====================
  {
    id: 'intro',
    title: 'Frontend System Design',
    subtitle: 'Building Scalable & Maintainable Applications',
    category: 'Introduction',
    content: [
      { type: 'text', value: 'A comprehensive guide to architecting frontend applications that scale.' },
      { type: 'bullets', items: [
        'Folder Structure Patterns',
        'Modularization & Lazy Loading',
        'Component Communication',
        'State Management',
        'Data Models',
        'Interview Frameworks (RADIO)',
        'Modern Architecture Patterns',
        'Domain-Driven Design',
      ]},
    ],
  },

  // ==================== FOLDER STRUCTURE ====================
  {
    id: 'folder-structure-intro',
    title: 'Folder Structure Patterns',
    subtitle: 'Organizing Your Codebase',
    category: 'Folder Structure',
    content: [
      { type: 'text', value: 'The way you organize your code impacts maintainability, scalability, and developer experience.' },
      { type: 'bullets', items: [
        'Flat Structure - All files in one directory',
        'By Type - Grouped by file type (components/, hooks/, utils/)',
        'By Feature - Grouped by feature/domain',
        'Hybrid - Combination of type and feature',
        'Atomic Design - atoms, molecules, organisms, templates, pages',
      ]},
    ],
  },
  {
    id: 'folder-by-type',
    title: 'Structure by Type',
    subtitle: 'Traditional Approach',
    category: 'Folder Structure',
    content: [
      { type: 'code', language: 'text', value: `src/
├── components/
│   ├── Button.tsx
│   ├── Modal.tsx
│   └── Header.tsx
├── hooks/
│   ├── useAuth.ts
│   └── useFetch.ts
├── services/
│   ├── api.ts
│   └── auth.ts
├── utils/
│   └── helpers.ts
├── types/
│   └── index.ts
└── pages/
    ├── Home.tsx
    └── Dashboard.tsx` },
      { type: 'comparison', 
        left: { title: '✅ Pros', items: ['Simple to understand', 'Works for small projects', 'Easy to find files by type'] },
        right: { title: '❌ Cons', items: ['Features scattered across folders', 'Hard to scale', 'Difficult to extract features'] }
      },
    ],
  },
  {
    id: 'folder-by-feature',
    title: 'Structure by Feature',
    subtitle: 'Domain-Centric Approach',
    category: 'Folder Structure',
    content: [
      { type: 'code', language: 'text', value: `src/
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types.ts
│   │   └── index.ts
│   ├── dashboard/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── index.ts
│   └── settings/
│       └── ...
├── shared/
│   ├── components/
│   ├── hooks/
│   └── utils/
└── app/
    ├── App.tsx
    └── routes.tsx` },
      { type: 'comparison', 
        left: { title: '✅ Pros', items: ['Features are self-contained', 'Easy to scale', 'Can extract to packages', 'Clear ownership'] },
        right: { title: '❌ Cons', items: ['More initial setup', 'Shared code decisions', 'Learning curve'] }
      },
    ],
  },
  {
    id: 'folder-atomic',
    title: 'Atomic Design',
    subtitle: 'Component Hierarchy',
    category: 'Folder Structure',
    content: [
      { type: 'text', value: 'Atomic Design breaks UI into 5 levels of abstraction.' },
      { type: 'steps', items: [
        { title: 'Atoms', description: 'Basic building blocks: Button, Input, Label, Icon' },
        { title: 'Molecules', description: 'Groups of atoms: SearchBar, FormField, Card' },
        { title: 'Organisms', description: 'Complex UI sections: Header, Sidebar, ProductList' },
        { title: 'Templates', description: 'Page layouts without real content' },
        { title: 'Pages', description: 'Templates with actual content/data' },
      ]},
    ],
  },

  // ==================== MODULARIZATION ====================
  {
    id: 'modularization-intro',
    title: 'Modularization & Lazy Loading',
    subtitle: 'Optimize Performance & Maintainability',
    category: 'Modularization',
    content: [
      { type: 'text', value: 'Breaking your app into modules improves load time and code organization.' },
      { type: 'bullets', items: [
        'Code Splitting - Load only what\'s needed',
        'Dynamic Imports - Load modules on demand',
        'Route-based Splitting - Each route is a chunk',
        'Component-level Splitting - Heavy components loaded lazily',
        'Tree Shaking - Remove unused code',
      ]},
    ],
  },
  {
    id: 'lazy-loading-react',
    title: 'Lazy Loading in React',
    subtitle: 'React.lazy & Suspense',
    category: 'Modularization',
    content: [
      { type: 'code', language: 'tsx', value: `import React, { Suspense, lazy } from 'react';

// Lazy load components
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));
const Analytics = lazy(() => import('./pages/Analytics'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/analytics" element={<Analytics />} />
      </Routes>
    </Suspense>
  );
}` },
      { type: 'bullets', items: [
        'Each route becomes a separate bundle chunk',
        'Suspense shows fallback while loading',
        'Reduces initial bundle size significantly',
      ]},
    ],
  },
  {
    id: 'module-boundaries',
    title: 'Module Boundaries',
    subtitle: 'Defining Clear Interfaces',
    category: 'Modularization',
    content: [
      { type: 'text', value: 'Each module should have a clear public API through an index file.' },
      { type: 'code', language: 'typescript', value: `// features/auth/index.ts - Public API
export { LoginForm } from './components/LoginForm';
export { useAuth } from './hooks/useAuth';
export { authService } from './services/authService';
export type { User, AuthState } from './types';

// NEVER import internal files directly:
// ❌ import { validateEmail } from 'features/auth/utils/validate';
// ✅ import { useAuth } from 'features/auth';` },
      { type: 'bullets', items: [
        'Encapsulation - Hide internal implementation',
        'Refactoring - Change internals without breaking consumers',
        'Testing - Clear surface area to test',
      ]},
    ],
  },

  // ==================== COMPONENT COMMUNICATION ====================
  {
    id: 'communication-intro',
    title: 'Component Communication',
    subtitle: 'How Components Talk to Each Other',
    category: 'Communication',
    content: [
      { type: 'text', value: 'Components need to share data and trigger actions. Choose the right pattern for each case.' },
      { type: 'steps', items: [
        { title: 'Props', description: 'Parent → Child: Direct data passing' },
        { title: 'Callbacks', description: 'Child → Parent: Event handlers passed as props' },
        { title: 'Context', description: 'Any → Any: Shared state without prop drilling' },
        { title: 'Event Bus', description: 'Any → Any: Decoupled pub/sub communication' },
        { title: 'State Management', description: 'Global: Redux, Zustand, Jotai, etc.' },
      ]},
    ],
  },
  {
    id: 'event-bus',
    title: 'Event Bus Pattern',
    subtitle: 'Decoupled Communication',
    category: 'Communication',
    content: [
      { type: 'text', value: 'An Event Bus allows components to communicate without direct references.' },
      { type: 'code', language: 'typescript', value: `// eventBus.ts
type EventCallback = (data: any) => void;

class EventBus {
  private events: Map<string, EventCallback[]> = new Map();

  on(event: string, callback: EventCallback) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(callback);
    
    // Return unsubscribe function
    return () => this.off(event, callback);
  }

  off(event: string, callback: EventCallback) {
    const callbacks = this.events.get(event);
    if (callbacks) {
      this.events.set(event, callbacks.filter(cb => cb !== callback));
    }
  }

  emit(event: string, data?: any) {
    this.events.get(event)?.forEach(cb => cb(data));
  }
}

export const eventBus = new EventBus();` },
    ],
  },
  {
    id: 'event-bus-usage',
    title: 'Using the Event Bus',
    subtitle: 'React Integration',
    category: 'Communication',
    content: [
      { type: 'code', language: 'tsx', value: `// In a component
import { useEffect } from 'react';
import { eventBus } from './eventBus';

function NotificationListener() {
  useEffect(() => {
    const unsubscribe = eventBus.on('notification', (data) => {
      showToast(data.message, data.type);
    });
    
    return unsubscribe; // Cleanup on unmount
  }, []);
  
  return null;
}

// Anywhere in your app
function SomeOtherComponent() {
  const handleSuccess = () => {
    eventBus.emit('notification', {
      message: 'Operation successful!',
      type: 'success'
    });
  };
}` },
      { type: 'comparison', 
        left: { title: '✅ When to Use', items: ['Cross-cutting concerns', 'Analytics events', 'Notifications', 'Decoupled modules'] },
        right: { title: '❌ When NOT to Use', items: ['Parent-child communication', 'Predictable data flow needed', 'Debugging is critical'] }
      },
    ],
  },

  // ==================== STATE MANAGEMENT ====================
  {
    id: 'state-intro',
    title: 'State Management',
    subtitle: 'Managing Application State',
    category: 'State',
    content: [
      { type: 'text', value: 'State is data that changes over time and affects what users see.' },
      { type: 'steps', items: [
        { title: 'UI State', description: 'Modal open, loading, form values - Local to component' },
        { title: 'Server State', description: 'API data, cache - Use React Query, SWR' },
        { title: 'URL State', description: 'Query params, route - Use router' },
        { title: 'Global State', description: 'User, theme, cart - Use state library' },
        { title: 'Form State', description: 'Validation, touched - Use form library' },
      ]},
    ],
  },
  {
    id: 'state-libraries',
    title: 'State Library Comparison',
    subtitle: 'Choose the Right Tool',
    category: 'State',
    content: [
      { type: 'bullets', items: [
        'Redux Toolkit - Full-featured, middleware, DevTools, large apps',
        'Zustand - Minimal, hooks-based, simple API, medium apps',
        'Jotai - Atomic, bottom-up, fine-grained updates',
        'Recoil - Atomic, React-like, good for complex dependencies',
        'MobX - Observable, automatic tracking, less boilerplate',
        'React Query / TanStack Query - Server state, caching, refetching',
        'XState - State machines, explicit states & transitions',
      ]},
      { type: 'text', value: '💡 Tip: Start with React\'s built-in state. Add libraries only when needed.' },
    ],
  },
  {
    id: 'state-colocation',
    title: 'State Colocation',
    subtitle: 'Keep State Close to Where It\'s Used',
    category: 'State',
    content: [
      { type: 'text', value: 'The principle of keeping state as close as possible to where it\'s used.' },
      { type: 'code', language: 'text', value: `State Location Decision Tree:

1. Does only ONE component need this state?
   → useState in that component

2. Do SIBLING components need to share?
   → Lift state to common parent

3. Do DISTANT components need it?
   → Context or State Library

4. Is it SERVER data?
   → React Query / SWR

5. Is it URL-related?
   → URL state (searchParams, hash)` },
      { type: 'text', value: '🚫 Avoid: Putting everything in global state. This hurts performance and makes debugging harder.' },
    ],
  },

  // ==================== MODELS ====================
  {
    id: 'models-intro',
    title: 'Data Models',
    subtitle: 'Structuring Your Data',
    category: 'Models',
    content: [
      { type: 'text', value: 'Well-defined data models ensure consistency across your application.' },
      { type: 'bullets', items: [
        'Define types/interfaces for all entities',
        'Separate API models from UI models',
        'Use mappers/transformers between layers',
        'Validate data at boundaries (API, forms)',
        'Consider immutability for predictable updates',
      ]},
    ],
  },
  {
    id: 'models-layers',
    title: 'Model Layers',
    subtitle: 'API vs Domain vs UI Models',
    category: 'Models',
    content: [
      { type: 'code', language: 'typescript', value: `// API Model - What the server returns
interface UserApiResponse {
  user_id: string;
  first_name: string;
  last_name: string;
  created_at: string; // ISO date string
}

// Domain Model - Core business logic
interface User {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  createdAt: Date;
}

// UI Model - What the component needs
interface UserCardProps {
  displayName: string;
  initials: string;
  memberSince: string; // "2 years ago"
}

// Mapper functions transform between layers
function toUser(api: UserApiResponse): User { ... }
function toUserCard(user: User): UserCardProps { ... }` },
    ],
  },

  // ==================== RADIO FRAMEWORK ====================
  {
    id: 'radio-intro',
    title: 'RADIO Framework',
    subtitle: 'System Design Interview Approach',
    category: 'Interviews',
    content: [
      { type: 'text', value: 'RADIO is a structured approach for frontend system design interviews.' },
      { type: 'steps', items: [
        { title: 'R - Requirements', description: 'Clarify functional & non-functional requirements' },
        { title: 'A - Architecture', description: 'High-level component diagram' },
        { title: 'D - Data Model', description: 'Define entities, relationships, API contracts' },
        { title: 'I - Interface', description: 'Component APIs, props, events' },
        { title: 'O - Optimizations', description: 'Performance, accessibility, edge cases' },
      ]},
    ],
  },
  {
    id: 'radio-requirements',
    title: 'R - Requirements',
    subtitle: 'Clarify Before You Design',
    category: 'Interviews',
    content: [
      { type: 'text', value: 'Spend 5-10 minutes gathering requirements. This shows maturity and prevents wasted effort.' },
      { type: 'comparison', 
        left: { title: 'Functional Requirements', items: [
          'What features are needed?',
          'What are the user flows?',
          'What are the core interactions?',
          'What platforms? (web, mobile, desktop)',
        ]},
        right: { title: 'Non-Functional Requirements', items: [
          'Expected scale (users, data)',
          'Performance requirements',
          'Offline support needed?',
          'Accessibility requirements',
          'i18n/l10n requirements',
        ]}
      },
    ],
  },
  {
    id: 'radio-architecture',
    title: 'A - Architecture',
    subtitle: 'High-Level Component Diagram',
    category: 'Interviews',
    content: [
      { type: 'text', value: 'Draw a component tree showing major UI sections and data flow.' },
      { type: 'diagram', value: `┌─────────────────────────────────────────────┐
│                    App                       │
│  ┌──────────┐  ┌────────────────────────┐   │
│  │  Header  │  │        Router          │   │
│  └──────────┘  │  ┌──────────────────┐  │   │
│                │  │    Dashboard     │  │   │
│                │  │  ┌────┐ ┌────┐   │  │   │
│                │  │  │Card│ │Card│   │  │   │
│                │  │  └────┘ └────┘   │  │   │
│                │  └──────────────────┘  │   │
│                └────────────────────────┘   │
│  ┌─────────────────────────────────────┐    │
│  │         State Management            │    │
│  │    (Context / Redux / Zustand)      │    │
│  └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘` },
    ],
  },
  {
    id: 'radio-data',
    title: 'D - Data Model',
    subtitle: 'Define Your Entities',
    category: 'Interviews',
    content: [
      { type: 'text', value: 'Define the core data structures and API contracts.' },
      { type: 'code', language: 'typescript', value: `// Core Entities
interface Tweet {
  id: string;
  authorId: string;
  content: string;
  timestamp: Date;
  likes: number;
  retweets: number;
  replies: Tweet[];
}

// API Contract
GET /api/feed?cursor=xyz&limit=20
Response: {
  tweets: Tweet[];
  nextCursor: string | null;
}

// State Shape
interface FeedState {
  tweets: Map<string, Tweet>;
  feedOrder: string[];
  cursor: string | null;
  isLoading: boolean;
  error: string | null;
}` },
    ],
  },
  {
    id: 'radio-optimizations',
    title: 'O - Optimizations',
    subtitle: 'Performance & Edge Cases',
    category: 'Interviews',
    content: [
      { type: 'text', value: 'Discuss optimizations to show depth of knowledge.' },
      { type: 'bullets', items: [
        'Virtualization - Render only visible items (react-window)',
        'Memoization - React.memo, useMemo, useCallback',
        'Code Splitting - Lazy load routes and heavy components',
        'Image Optimization - Lazy loading, WebP, responsive images',
        'Caching - HTTP cache, service workers, React Query',
        'Debouncing/Throttling - For search, scroll, resize',
        'Skeleton Loading - Perceived performance',
        'Error Boundaries - Graceful failure handling',
        'Accessibility - Keyboard nav, screen readers, ARIA',
      ]},
    ],
  },

  // ==================== ARCHITECTURE PATTERNS ====================
  {
    id: 'patterns-intro',
    title: 'Frontend Architecture Patterns',
    subtitle: 'Modern Approaches',
    category: 'Patterns',
    content: [
      { type: 'text', value: 'Common patterns used in production applications.' },
      { type: 'bullets', items: [
        'Backend-Driven UI (Server-Driven UI)',
        'Backend for Frontend (BFF)',
        'Micro Frontends',
        'Islands Architecture',
        'JAMstack',
      ]},
    ],
  },
  {
    id: 'backend-driven-ui',
    title: 'Backend-Driven UI',
    subtitle: 'Server-Controlled Rendering',
    category: 'Patterns',
    content: [
      { type: 'text', value: 'The server returns UI configuration that the client renders. Used by Airbnb, Shopify, Netflix.' },
      { type: 'code', language: 'json', value: `// API Response
{
  "screen": "ProductPage",
  "components": [
    {
      "type": "Header",
      "props": { "title": "iPhone 15" }
    },
    {
      "type": "ImageCarousel",
      "props": { "images": ["url1", "url2"] }
    },
    {
      "type": "PriceTag",
      "props": { "price": 999, "currency": "USD" }
    },
    {
      "type": "Button",
      "props": { "text": "Add to Cart", "action": "ADD_TO_CART" }
    }
  ]
}` },
      { type: 'comparison', 
        left: { title: '✅ Pros', items: ['No app updates needed', 'A/B testing easy', 'Consistent across platforms'] },
        right: { title: '❌ Cons', items: ['Complex client renderer', 'Limited interactivity', 'Tight server coupling'] }
      },
    ],
  },
  {
    id: 'bff-pattern',
    title: 'Backend for Frontend (BFF)',
    subtitle: 'Tailored API Layer',
    category: 'Patterns',
    content: [
      { type: 'text', value: 'A dedicated backend that serves a specific frontend, aggregating and transforming data.' },
      { type: 'diagram', value: `┌─────────────┐     ┌─────────────┐
│   Web App   │     │ Mobile App  │
└──────┬──────┘     └──────┬──────┘
       │                   │
       ▼                   ▼
┌──────────────┐    ┌──────────────┐
│   Web BFF    │    │  Mobile BFF  │
└──────┬───────┘    └───────┬──────┘
       │                    │
       └────────┬───────────┘
                ▼
    ┌───────────────────────┐
    │   Microservices       │
    │  ┌─────┐ ┌─────┐      │
    │  │User │ │Order│ ...  │
    │  └─────┘ └─────┘      │
    └───────────────────────┘` },
      { type: 'bullets', items: [
        'Each frontend gets exactly the data it needs',
        'Reduces over-fetching and under-fetching',
        'Can be maintained by the frontend team',
        'Adds a layer but simplifies clients',
      ]},
    ],
  },
  {
    id: 'microfrontends',
    title: 'Micro Frontends',
    subtitle: 'Independent Frontend Teams',
    category: 'Patterns',
    content: [
      { type: 'text', value: 'Split the frontend into smaller apps owned by different teams.' },
      { type: 'diagram', value: `┌─────────────────────────────────────────────┐
│               Container App                  │
│  ┌─────────────┐  ┌─────────────────────┐   │
│  │   Header    │  │   Navigation        │   │
│  │  (Team A)   │  │   (Shared)          │   │
│  └─────────────┘  └─────────────────────┘   │
│  ┌──────────────────────────────────────┐   │
│  │            Main Content              │   │
│  │  ┌──────────────┐ ┌──────────────┐   │   │
│  │  │  Products    │ │   Cart       │   │   │
│  │  │  (Team B)    │ │  (Team C)    │   │   │
│  │  └──────────────┘ └──────────────┘   │   │
│  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘` },
      { type: 'bullets', items: [
        'Teams can deploy independently',
        'Different tech stacks possible',
        'Implementation: Module Federation, iframes, Web Components',
        'Challenges: Shared state, consistent UX, bundle size',
      ]},
    ],
  },

  // ==================== DDD ====================
  {
    id: 'ddd-intro',
    title: 'Domain-Driven Design',
    subtitle: 'Aligning Code with Business',
    category: 'DDD',
    content: [
      { type: 'text', value: 'DDD is about modeling software to match the business domain.' },
      { type: 'bullets', items: [
        'Ubiquitous Language - Same terms in code and business',
        'Bounded Contexts - Clear boundaries between domains',
        'Entities - Objects with identity (User, Order)',
        'Value Objects - Immutable objects (Money, Address)',
        'Aggregates - Cluster of entities treated as a unit',
        'Domain Events - Something that happened in the domain',
        'Repositories - Abstract data access',
      ]},
    ],
  },
  {
    id: 'ddd-bounded-context',
    title: 'Bounded Contexts',
    subtitle: 'Define Clear Boundaries',
    category: 'DDD',
    content: [
      { type: 'text', value: 'Each bounded context has its own model and vocabulary. The same term can mean different things in different contexts.' },
      { type: 'diagram', value: `┌─────────────────┐    ┌─────────────────┐
│   Sales Context │    │ Shipping Context│
│                 │    │                 │
│  "Customer"     │    │   "Customer"    │
│  - name         │    │   - address     │
│  - email        │    │   - phone       │
│  - creditLimit  │    │   - preferences │
│                 │    │                 │
│  "Product"      │    │   "Product"     │
│  - price        │    │   - weight      │
│  - discount     │    │   - dimensions  │
└────────┬────────┘    └────────┬────────┘
         │                      │
         └──────────┬───────────┘
                    ▼
          ┌─────────────────┐
          │ Context Mapping │
          │ (Anti-corruption│
          │     Layer)      │
          └─────────────────┘` },
    ],
  },
  {
    id: 'ddd-frontend',
    title: 'DDD in Frontend',
    subtitle: 'Practical Application',
    category: 'DDD',
    content: [
      { type: 'code', language: 'typescript', value: `// Feature = Bounded Context
src/features/
├── checkout/           // Checkout Context
│   ├── domain/
│   │   ├── Cart.ts            // Entity
│   │   ├── CartItem.ts        // Entity
│   │   ├── Money.ts           // Value Object
│   │   └── events.ts          // Domain Events
│   ├── application/
│   │   ├── useCart.ts         // Use Cases
│   │   └── checkoutService.ts
│   ├── infrastructure/
│   │   └── cartRepository.ts  // Data Access
│   └── ui/
│       └── components/
│
├── catalog/            // Catalog Context
│   └── ...
│
└── shared/             // Shared Kernel
    └── ...` },
      { type: 'text', value: '💡 Each feature is self-contained with its own domain model, services, and UI.' },
    ],
  },

  // ==================== CHAT APP PRACTICAL EXAMPLE ====================
  {
    id: 'chat-intro',
    title: 'Practical Example: Chat App',
    subtitle: 'Designing WhatsApp-like Application',
    category: 'Chat App',
    content: [
      { type: 'text', value: 'Let\'s apply the RADIO framework to design a real-time chat application.' },
      { type: 'bullets', items: [
        'Requirements - What exactly are we building?',
        'Architecture - Component structure & communication',
        'Data Model - Messages, conversations, users',
        'Interface - APIs between components',
        'Optimizations - Real-time, pagination, performance',
      ]},
    ],
  },
  {
    id: 'chat-requirements',
    title: 'R - Chat Requirements',
    subtitle: 'Defining the Scope',
    category: 'Chat App',
    content: [
      { type: 'comparison', 
        left: { title: 'Functional Requirements', items: [
          '1:1 and group conversations',
          'Send text messages',
          'See message status (sent, delivered, read)',
          'Show online/offline status',
          'Message history with search',
          'Typing indicators',
          'Unread message count',
        ]},
        right: { title: 'Non-Functional Requirements', items: [
          'Real-time message delivery (<100ms)',
          'Offline support (queue messages)',
          'Load 10k+ messages efficiently',
          'Handle 100+ conversations',
          'Mobile-responsive',
          'Accessibility (screen readers)',
        ]}
      },
    ],
  },
  {
    id: 'chat-architecture',
    title: 'A - Component Architecture',
    subtitle: 'Breaking Down the UI',
    category: 'Chat App',
    content: [
      { type: 'diagram', value: `┌─────────────────────────────────────────────────────────────┐
│                        ChatApp                               │
│  ┌─────────────────────┐  ┌───────────────────────────────┐ │
│  │    ConversationList │  │        ChatWindow              │ │
│  │  ┌───────────────┐  │  │  ┌─────────────────────────┐  │ │
│  │  │ SearchBar     │  │  │  │ ChatHeader              │  │ │
│  │  └───────────────┘  │  │  │ (name, status, actions) │  │ │
│  │  ┌───────────────┐  │  │  └─────────────────────────┘  │ │
│  │  │ ConvoItem     │  │  │  ┌─────────────────────────┐  │ │
│  │  │ ConvoItem     │  │  │  │ MessageList             │  │ │
│  │  │ ConvoItem     │  │  │  │ (virtualized)           │  │ │
│  │  │ ...           │  │  │  │  ┌─────────────────┐    │  │ │
│  │  └───────────────┘  │  │  │  │ MessageBubble   │    │  │ │
│  └─────────────────────┘  │  │  └─────────────────┘    │  │ │
│                           │  └─────────────────────────┘  │ │
│                           │  ┌─────────────────────────┐  │ │
│                           │  │ MessageInput            │  │ │
│                           │  │ (typing, send, attach)  │  │ │
│                           │  └─────────────────────────┘  │ │
│                           └───────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘` },
    ],
  },
  {
    id: 'chat-component-communication',
    title: 'Component Communication',
    subtitle: 'How Components Talk',
    category: 'Chat App',
    content: [
      { type: 'text', value: 'Different relationships require different communication patterns.' },
      { type: 'code', language: 'text', value: `Communication Patterns in Chat App:

┌─────────────────┐     Props/Callbacks     ┌─────────────────┐
│ ConversationList│ ─────────────────────── │   ChatWindow    │
└────────┬────────┘     (selectedId)        └────────┬────────┘
         │                                           │
         │                                           │
         ▼                                           ▼
┌────────────────────────────────────────────────────────────┐
│                   ChatContext (Global State)                │
│  • currentUser      • conversations      • activeConvoId   │
│  • onlineUsers      • messages           • typingUsers     │
└────────────────────────────────────────────────────────────┘
         │                                           │
         ▼                                           ▼
┌────────────────────────────────────────────────────────────┐
│                   WebSocket Service                         │
│  • onMessage()     • onTyping()      • onPresence()        │
│  • sendMessage()   • sendTyping()    • subscribe()         │
└────────────────────────────────────────────────────────────┘` },
    ],
  },
  {
    id: 'chat-folder-structure',
    title: 'Folder Structure',
    subtitle: 'Feature-Based Organization',
    category: 'Chat App',
    content: [
      { type: 'code', language: 'text', value: `src/
├── features/
│   └── chat/
│       ├── components/
│       │   ├── ChatApp.tsx
│       │   ├── ConversationList/
│       │   │   ├── ConversationList.tsx
│       │   │   ├── ConversationItem.tsx
│       │   │   └── SearchBar.tsx
│       │   ├── ChatWindow/
│       │   │   ├── ChatWindow.tsx
│       │   │   ├── ChatHeader.tsx
│       │   │   ├── MessageList.tsx
│       │   │   ├── MessageBubble.tsx
│       │   │   └── MessageInput.tsx
│       │   └── shared/
│       │       ├── Avatar.tsx
│       │       └── TypingIndicator.tsx
│       ├── hooks/
│       │   ├── useMessages.ts
│       │   ├── useWebSocket.ts
│       │   └── useTypingIndicator.ts
│       ├── services/
│       │   ├── messageService.ts
│       │   └── websocketService.ts
│       ├── context/
│       │   └── ChatContext.tsx
│       ├── types.ts
│       └── index.ts` },
    ],
  },
  {
    id: 'chat-data-model',
    title: 'D - Data Model',
    subtitle: 'Core Entities',
    category: 'Chat App',
    content: [
      { type: 'code', language: 'typescript', value: `interface User {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'away';
  lastSeen: Date;
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: Date;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  replyTo?: string;  // For message replies
}

interface Conversation {
  id: string;
  type: 'direct' | 'group';
  participants: string[];  // User IDs
  name?: string;           // For group chats
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: Date;
}` },
    ],
  },
  {
    id: 'chat-state-shape',
    title: 'State Management',
    subtitle: 'Normalized State Shape',
    category: 'Chat App',
    content: [
      { type: 'code', language: 'typescript', value: `interface ChatState {
  // Normalized entities (like a database)
  users: Record<string, User>;
  conversations: Record<string, Conversation>;
  messages: Record<string, Message>;
  
  // UI State
  activeConversationId: string | null;
  searchQuery: string;
  
  // Pagination state per conversation
  messagesPagination: Record<string, {
    hasMore: boolean;
    oldestMessageId: string | null;
    isLoading: boolean;
  }>;
  
  // Real-time state
  typingUsers: Record<string, string[]>; // convoId -> userIds
  onlineUsers: Set<string>;
  
  // Connection state
  connectionStatus: 'connected' | 'connecting' | 'disconnected';
}` },
      { type: 'text', value: '💡 Normalize data to avoid duplication. Store by ID, reference by ID.' },
    ],
  },
  {
    id: 'chat-loading-messages',
    title: 'Loading Messages',
    subtitle: 'Initial Load Strategy',
    category: 'Chat App',
    content: [
      { type: 'text', value: 'How do we load messages efficiently for a conversation with 10,000+ messages?' },
      { type: 'steps', items: [
        { title: '1. Load Recent First', description: 'Fetch last 50 messages on conversation open' },
        { title: '2. Cursor-Based Pagination', description: 'Use message ID as cursor, not page numbers' },
        { title: '3. Scroll-Triggered Loading', description: 'Load older messages when scrolling to top' },
        { title: '4. Virtualize the List', description: 'Only render visible messages (react-window)' },
        { title: '5. Cache in Memory', description: 'Keep loaded messages in state for quick access' },
      ]},
    ],
  },
  {
    id: 'chat-api-design',
    title: 'API Design',
    subtitle: 'REST Endpoints',
    category: 'Chat App',
    content: [
      { type: 'code', language: 'typescript', value: `// Get conversations list
GET /api/conversations
Response: { conversations: Conversation[], hasMore: boolean }

// Get messages with cursor pagination
GET /api/conversations/:id/messages?before=<messageId>&limit=50
Response: { 
  messages: Message[], 
  hasMore: boolean,
  oldestId: string | null 
}

// Send a message (optimistic UI)
POST /api/conversations/:id/messages
Body: { content: string, tempId: string }
Response: { message: Message }  // Contains real ID

// Mark messages as read
POST /api/conversations/:id/read
Body: { lastReadMessageId: string }` },
    ],
  },
  {
    id: 'chat-pagination-edge-cases',
    title: 'Pagination Edge Cases',
    subtitle: 'Handling Tricky Scenarios',
    category: 'Chat App',
    content: [
      { type: 'bullets', items: [
        'New messages while loading older ones - Insert at correct position, don\'t break scroll',
        'User deletes message during pagination - Handle 404, skip to next cursor',
        'Duplicate messages - Use message ID as key, dedupe in reducer',
        'Network failure mid-load - Retry with exponential backoff, show error state',
        'Scroll position jump - Save scroll position before load, restore after',
        'Empty conversation - Show empty state, no infinite load loop',
        'Rapid scroll - Debounce load requests, cancel pending if direction changes',
      ]},
      { type: 'code', language: 'typescript', value: `// Debounced scroll handler
const loadMoreDebounced = useMemo(
  () => debounce(() => loadOlderMessages(), 200),
  [loadOlderMessages]
);

// Cancel on unmount or conversation change
useEffect(() => {
  return () => loadMoreDebounced.cancel();
}, [conversationId]);` },
    ],
  },
  {
    id: 'chat-scroll-position',
    title: 'Scroll Position Management',
    subtitle: 'Preserving User Experience',
    category: 'Chat App',
    content: [
      { type: 'code', language: 'tsx', value: `function MessageList({ messages, onLoadMore }) {
  const listRef = useRef<HTMLDivElement>(null);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  
  // Save scroll position before loading older messages
  const previousScrollHeight = useRef(0);
  
  const handleScroll = async () => {
    const el = listRef.current;
    if (!el || isLoadingOlder) return;
    
    // Near top? Load older messages
    if (el.scrollTop < 100) {
      previousScrollHeight.current = el.scrollHeight;
      setIsLoadingOlder(true);
      await onLoadMore();
      setIsLoadingOlder(false);
    }
  };
  
  // Restore scroll position after loading
  useLayoutEffect(() => {
    if (previousScrollHeight.current && listRef.current) {
      const newHeight = listRef.current.scrollHeight;
      const diff = newHeight - previousScrollHeight.current;
      listRef.current.scrollTop += diff;
      previousScrollHeight.current = 0;
    }
  }, [messages.length]);
}` },
    ],
  },
  {
    id: 'chat-realtime-websocket',
    title: 'Real-Time: WebSocket',
    subtitle: 'Live Communication',
    category: 'Chat App',
    content: [
      { type: 'text', value: 'WebSocket enables bidirectional real-time communication between client and server.' },
      { type: 'diagram', value: `┌──────────────┐                      ┌──────────────┐
│   Client A   │                      │   Client B   │
│  (Browser)   │                      │  (Browser)   │
└──────┬───────┘                      └───────┬──────┘
       │                                      │
       │  WebSocket Connection                │
       │  ════════════════════                │
       ▼                                      ▼
┌─────────────────────────────────────────────────────┐
│                  WebSocket Server                    │
│  ┌───────────────────────────────────────────────┐  │
│  │              Message Broker                    │  │
│  │  (Redis Pub/Sub for horizontal scaling)        │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘

Events:
→ message:new     → typing:start    → presence:online
→ message:read    → typing:stop     → presence:offline` },
    ],
  },
  {
    id: 'chat-websocket-service',
    title: 'WebSocket Service',
    subtitle: 'Client Implementation',
    category: 'Chat App',
    content: [
      { type: 'code', language: 'typescript', value: `class ChatWebSocket {
  private ws: WebSocket | null = null;
  private listeners = new Map<string, Set<Function>>();
  private reconnectAttempts = 0;
  private messageQueue: any[] = []; // Queue while disconnected
  
  connect(userId: string) {
    this.ws = new WebSocket(\`wss://api.chat.com/ws?userId=\${userId}\`);
    
    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.flushQueue(); // Send queued messages
      this.emit('connection', { status: 'connected' });
    };
    
    this.ws.onmessage = (event) => {
      const { type, payload } = JSON.parse(event.data);
      this.emit(type, payload);
    };
    
    this.ws.onclose = () => {
      this.reconnect(); // Auto-reconnect with backoff
    };
  }
  
  send(type: string, payload: any) {
    const message = JSON.stringify({ type, payload });
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(message);
    } else {
      this.messageQueue.push(message); // Queue if offline
    }
  }
}` },
    ],
  },
  {
    id: 'chat-websocket-react',
    title: 'WebSocket React Hook',
    subtitle: 'Integrating with Components',
    category: 'Chat App',
    content: [
      { type: 'code', language: 'tsx', value: `function useChatWebSocket() {
  const dispatch = useChatDispatch();
  const { currentUser } = useChatState();
  
  useEffect(() => {
    const ws = chatWebSocket.connect(currentUser.id);
    
    // Subscribe to events
    ws.on('message:new', (message: Message) => {
      dispatch({ type: 'MESSAGE_RECEIVED', payload: message });
      
      // Update conversation's last message
      dispatch({ type: 'CONVERSATION_UPDATED', payload: {
        id: message.conversationId,
        lastMessage: message,
        unreadCount: (prev) => prev + 1,
      }});
    });
    
    ws.on('typing:start', ({ conversationId, userId }) => {
      dispatch({ type: 'TYPING_STARTED', payload: { conversationId, userId }});
    });
    
    ws.on('presence:change', ({ userId, status }) => {
      dispatch({ type: 'USER_STATUS_CHANGED', payload: { userId, status }});
    });
    
    return () => ws.disconnect();
  }, [currentUser.id]);
}` },
    ],
  },
  {
    id: 'chat-optimistic-updates',
    title: 'Optimistic Updates',
    subtitle: 'Instant Feedback',
    category: 'Chat App',
    content: [
      { type: 'text', value: 'Show the message immediately, then sync with server. Rollback on failure.' },
      { type: 'code', language: 'typescript', value: `async function sendMessage(content: string) {
  const tempId = generateTempId();
  
  // 1. Optimistic update - show immediately
  const optimisticMessage: Message = {
    id: tempId,
    content,
    senderId: currentUser.id,
    conversationId: activeConversationId,
    timestamp: new Date(),
    status: 'sending',
  };
  dispatch({ type: 'MESSAGE_ADDED', payload: optimisticMessage });
  
  try {
    // 2. Send to server
    const realMessage = await api.sendMessage(activeConversationId, {
      content,
      tempId,
    });
    
    // 3. Replace temp with real message
    dispatch({ type: 'MESSAGE_CONFIRMED', payload: { tempId, realMessage }});
    
  } catch (error) {
    // 4. Rollback on failure
    dispatch({ type: 'MESSAGE_FAILED', payload: { tempId, error }});
  }
}` },
    ],
  },
  {
    id: 'chat-typing-indicator',
    title: 'Typing Indicators',
    subtitle: 'Real-Time Feedback',
    category: 'Chat App',
    content: [
      { type: 'code', language: 'typescript', value: `function useTypingIndicator(conversationId: string) {
  const ws = useChatWebSocket();
  const typingTimeoutRef = useRef<number>();
  
  const sendTyping = useCallback(
    debounce(() => {
      ws.send('typing:start', { conversationId });
      
      // Auto-stop after 3 seconds of no typing
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        ws.send('typing:stop', { conversationId });
      }, 3000);
    }, 300),
    [conversationId]
  );
  
  const stopTyping = useCallback(() => {
    clearTimeout(typingTimeoutRef.current);
    ws.send('typing:stop', { conversationId });
  }, [conversationId]);
  
  return { sendTyping, stopTyping };
}

// In MessageInput
<textarea
  onChange={(e) => {
    setContent(e.target.value);
    sendTyping();
  }}
  onBlur={stopTyping}
/>` },
    ],
  },
  {
    id: 'chat-offline-support',
    title: 'Offline Support',
    subtitle: 'Queue Messages When Disconnected',
    category: 'Chat App',
    content: [
      { type: 'text', value: 'Allow users to compose messages even when offline. Sync when connection returns.' },
      { type: 'code', language: 'typescript', value: `// Store pending messages in IndexedDB
interface PendingMessage {
  tempId: string;
  conversationId: string;
  content: string;
  createdAt: Date;
}

async function sendMessage(content: string) {
  const pending: PendingMessage = {
    tempId: generateTempId(),
    conversationId: activeConvoId,
    content,
    createdAt: new Date(),
  };
  
  // Always save to local DB first
  await db.pendingMessages.add(pending);
  
  // Show in UI with 'pending' status
  dispatch({ type: 'MESSAGE_QUEUED', payload: pending });
  
  // Try to send if online
  if (navigator.onLine) {
    await syncPendingMessages();
  }
}

// On reconnect, sync all pending
window.addEventListener('online', syncPendingMessages);` },
    ],
  },
  {
    id: 'chat-virtualization',
    title: 'List Virtualization',
    subtitle: 'Rendering 10,000+ Messages',
    category: 'Chat App',
    content: [
      { type: 'text', value: 'Only render messages visible in the viewport. Essential for performance.' },
      { type: 'code', language: 'tsx', value: `import { VariableSizeList } from 'react-window';

function VirtualizedMessageList({ messages }) {
  const listRef = useRef();
  const rowHeights = useRef(new Map()); // Cache heights
  
  // Calculate row height (messages have variable heights)
  const getRowHeight = (index: number) => {
    return rowHeights.current.get(messages[index].id) || 60;
  };
  
  const Row = ({ index, style }) => {
    const message = messages[index];
    const rowRef = useRef<HTMLDivElement>(null);
    
    // Measure and cache actual height
    useEffect(() => {
      if (rowRef.current) {
        const height = rowRef.current.getBoundingClientRect().height;
        if (rowHeights.current.get(message.id) !== height) {
          rowHeights.current.set(message.id, height);
          listRef.current?.resetAfterIndex(index);
        }
      }
    }, [message.content]);
    
    return (
      <div style={style}>
        <div ref={rowRef}>
          <MessageBubble message={message} />
        </div>
      </div>
    );
  };
}` },
    ],
  },
  {
    id: 'chat-optimizations',
    title: 'O - Optimizations',
    subtitle: 'Performance & UX',
    category: 'Chat App',
    content: [
      { type: 'bullets', items: [
        'Virtualization - Only render visible messages (react-window)',
        'Message batching - Group WebSocket updates, dispatch once',
        'Image lazy loading - Load images only when scrolled into view',
        'Skeleton loading - Show placeholders while messages load',
        'Debounce typing - Don\'t send typing event on every keystroke',
        'Connection pooling - Reuse WebSocket across tabs (SharedWorker)',
        'Read receipts batching - Batch "read" updates, send every 2 seconds',
        'Memoization - React.memo for MessageBubble, useMemo for sorted lists',
        'Background sync - Service Worker for offline queue sync',
      ]},
    ],
  },
  {
    id: 'chat-accessibility',
    title: 'Accessibility Considerations',
    subtitle: 'Inclusive Design',
    category: 'Chat App',
    content: [
      { type: 'bullets', items: [
        'Live regions - Announce new messages with aria-live="polite"',
        'Focus management - Focus input after sending, new message after receiving',
        'Keyboard navigation - Arrow keys to navigate messages, Enter to reply',
        'Screen reader labels - "Message from John at 3:45 PM: Hello!"',
        'High contrast - Ensure message bubbles have sufficient contrast',
        'Typing indicator - Announce "John is typing" to screen readers',
        'Skip links - Jump to message input, jump to latest message',
        'Reduced motion - Disable animations if prefers-reduced-motion',
      ]},
      { type: 'code', language: 'tsx', value: `// Announce new messages
<div aria-live="polite" aria-atomic="false" className="sr-only">
  {newMessage && \`New message from \${sender}: \${content}\`}
</div>` },
    ],
  },
  {
    id: 'chat-summary',
    title: 'Chat App Summary',
    subtitle: 'Key Design Decisions',
    category: 'Chat App',
    content: [
      { type: 'steps', items: [
        { title: 'Components', description: 'Feature-based structure, clear component hierarchy' },
        { title: 'Communication', description: 'Context for state, WebSocket service for real-time' },
        { title: 'Pagination', description: 'Cursor-based, scroll-triggered, handle edge cases' },
        { title: 'Real-time', description: 'WebSocket with reconnection, message queuing' },
        { title: 'Optimistic UI', description: 'Instant feedback, rollback on failure' },
        { title: 'Performance', description: 'Virtualization, batching, memoization' },
      ]},
      { type: 'text', value: '💡 This structure scales to millions of messages and thousands of users while maintaining excellent UX.' },
    ],
  },

  // ==================== SUMMARY ====================
  {
    id: 'summary',
    title: 'Key Takeaways',
    subtitle: 'System Design Principles',
    category: 'Summary',
    content: [
      { type: 'bullets', items: [
        '📁 Organize by feature, not by type, as you scale',
        '📦 Define clear module boundaries with index exports',
        '⚡ Lazy load routes and heavy components',
        '💬 Choose communication pattern based on relationship',
        '🗃️ Colocate state - only lift when necessary',
        '📊 Separate API models from domain models',
        '📻 Use RADIO framework in interviews',
        '🏗️ Consider BFF and micro frontends for scale',
        '🎯 Align code structure with business domains (DDD)',
      ]},
      { type: 'text', value: 'Remember: There\'s no one-size-fits-all. Choose patterns based on your team size, app complexity, and requirements.' },
    ],
  },
];

export const categories = [...new Set(slides.map(s => s.category))];
