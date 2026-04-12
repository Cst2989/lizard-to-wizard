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
  // ─── INTRODUCTION ───────────────────────────────────────────
  {
    id: 'what-is-sdui',
    title: 'Server-Driven UI',
    subtitle: 'Let the server decide what the user sees',
    category: 'Introduction',
    content: [
      { type: 'text', value: 'What if your backend could control the exact layout, components, and behavior of your app — without shipping a new release?' },
      { type: 'bullets', items: [
        'The server sends a JSON tree describing WHAT to render',
        'The frontend has a component registry that knows HOW to render each type',
        'A recursive renderer walks the tree and builds the entire UI',
        'Used by Airbnb, Shopify, Instagram, Spotify, and Lyft',
      ] },
    ],
  },
  {
    id: 'why-sdui',
    title: 'Why Server-Driven UI?',
    subtitle: 'The problems it solves',
    category: 'Introduction',
    content: [
      { type: 'steps', items: [
        { title: 'Instant Updates', description: 'Change layouts, banners, and features without app store reviews. A/B test in real time.' },
        { title: 'Multi-Platform Consistency', description: 'Web, iOS, and Android all consume the same JSON — one backend change updates every client.' },
        { title: 'Reduce Client Complexity', description: 'Business logic lives on the server. The frontend becomes a thin renderer — simpler, more testable.' },
        { title: 'Empower Non-Engineers', description: 'Product and marketing can rearrange layouts via admin tools — no code deployment needed.' },
      ] },
    ],
  },
  {
    id: 'the-big-idea',
    title: 'The Core Idea',
    subtitle: 'Three pieces make it work',
    category: 'Introduction',
    content: [
      { type: 'steps', items: [
        { title: '1. JSON Response', description: 'The server sends a tree of { type, props, children, actions }. This is the only contract between server and client.' },
        { title: '2. Component Registry', description: 'A Map<string, Component> that translates type strings like "banner" or "restaurant-card" into actual React components.' },
        { title: '3. Recursive Renderer', description: 'A ~15 line function that walks the JSON tree, looks up each type in the registry, and renders it with its props and children.' },
      ] },
      { type: 'text', value: 'That\'s it. The entire SDUI infrastructure is about 30 lines of TypeScript. Everything else is just the components themselves.' },
    ],
  },

  // ─── THE JSON RESPONSE ──────────────────────────────────────
  {
    id: 'json-response',
    title: 'The Server Response',
    subtitle: 'One big tree of nodes',
    category: 'The JSON Response',
    content: [
      { type: 'text', value: 'The server responds with a single JSON object — a tree. The root node contains children, each child can contain more children, and so on. The entire page is described by this one response.' },
      { type: 'code', language: 'json', value:
`{
  "type": "list",                          ← root node (the page)
  "children": [                            ← array of child nodes
    { "type": "banner", "props": {...} },       ← node
    { "type": "banner", "props": {...} },       ← node
    {
      "type": "grid",                           ← node with its own children
      "props": { "columns": 2 },
      "children": [                             ← nested array of nodes
        { "type": "restaurant-card", "props": {...}, "actions": [...] },
        { "type": "restaurant-card", "props": {...}, "actions": [...] },
        { "type": "restaurant-card", "props": {...}, "actions": [...] },
        { "type": "restaurant-card", "props": {...}, "actions": [...] }
      ]
    }
  ]
}` },
      { type: 'bullets', items: [
        'The response is a tree, not a flat list — nodes contain nodes',
        'The root node is typically a layout ("list" or "grid") that holds the page structure',
        'children is the key — it makes the structure recursive and composable',
        'This is exactly how HTML works: <div> contains <ul> contains <li> — but with JSON and custom components',
      ] },
    ],
  },
  {
    id: 'json-node',
    title: 'The Node Shape',
    subtitle: 'Every node in the tree follows the same 4-field contract',
    category: 'The JSON Response',
    content: [
      { type: 'code', language: 'typescript', value:
`interface SDUINode {
  type: string;              // WHAT component to render
  props?: Record<string, unknown>;  // HOW to configure it
  children?: SDUINode[];     // WHAT'S inside it (recursive)
  actions?: SDUIAction[];    // WHAT happens when the user interacts
}` },
      { type: 'text', value: 'Every single node — the root, the banners, the grid, the restaurant cards — has this exact shape. The renderer doesn\'t need special cases. It processes every node the same way: look up the type, pass the props, recurse into children.' },
      { type: 'text', value: 'Let\'s look at each field.' },
    ],
  },
  {
    id: 'json-type',
    title: 'type — The Lookup Key',
    subtitle: 'A string that maps to a real component',
    category: 'The JSON Response',
    content: [
      { type: 'code', language: 'json', value:
`{ "type": "restaurant-card" }    →  RestaurantCard component
{ "type": "restaurant-list-item" } →  RestaurantListItem component
{ "type": "banner" }             →  Banner component
{ "type": "grid" }               →  GridLayout component
{ "type": "offer-banner" }       →  OfferBanner component` },
      { type: 'bullets', items: [
        'The type is a plain string — it has no meaning until the client looks it up in the registry',
        'If the client doesn\'t recognize the type, it returns null — the component is silently skipped',
        'This gives you forward compatibility: the server can send new types before all clients support them',
        'Old clients ignore unknown types. New clients render them. No version negotiation needed.',
      ] },
    ],
  },
  {
    id: 'json-props',
    title: 'props — Component Configuration',
    subtitle: 'Data the component needs to render',
    category: 'The JSON Response',
    content: [
      { type: 'code', language: 'json', value:
`// Props for a restaurant card
"props": {
  "name": "Sushi Palace",
  "imageUrl": "https://placehold.co/400x300/...",
  "rating": 4.5,
  "deliveryTime": "25-35 min",
  "cuisine": "Japanese",
  "priceRange": "$$"
}

// Props for a grid layout
"props": { "columns": 2 }

// Props for an offer banner
"props": { "title": "2 for 1!", "badge": "2FOR1", "backgroundColor": "#fef3c7" }` },
      { type: 'text', value: 'Props are spread directly onto the component: <RestaurantCard name="Sushi Palace" rating={4.5} ... />. The server controls what data each component receives. Different JSON configs can show different restaurants, prices, or images — same component, different props.' },
    ],
  },
  {
    id: 'json-actions',
    title: 'actions — User Interactions as Data',
    subtitle: 'What happens when the user taps',
    category: 'The JSON Response',
    content: [
      { type: 'code', language: 'typescript', value:
`interface SDUIAction {
  type: string;              // "navigate", "add-to-cart", "track"
  payload: Record<string, unknown>;  // action-specific data
}` },
      { type: 'code', language: 'json', value:
`// Navigate to a restaurant page
{ "type": "navigate", "payload": { "to": "/restaurant/3" } }

// Add an item to the cart
{ "type": "add-to-cart", "payload": { "id": "f1", "name": "Salmon Roll", "price": 12.99 } }

// Track an analytics event
{ "type": "track", "payload": { "event": "banner_clicked", "bannerId": "promo-1" } }` },
      { type: 'text', value: 'Actions are data, not code. The server says "when tapped, navigate to /restaurant/3". The client interprets that and calls router.push(). The server never sends JavaScript — it sends instructions that the client knows how to execute.' },
    ],
  },
  {
    id: 'json-home',
    title: 'A Real Response',
    subtitle: 'The home page of a food delivery app',
    category: 'The JSON Response',
    content: [
      { type: 'code', language: 'json', value:
`{
  "type": "list",
  "children": [
    {
      "type": "banner",
      "props": {
        "title": "50% off Thai Food",
        "subtitle": "This weekend only",
        "imageUrl": "https://..."
      },
      "actions": [
        { "type": "navigate", "payload": { "to": "/restaurant/3" } }
      ]
    },
    {
      "type": "grid",
      "props": { "columns": 2 },
      "children": [
        {
          "type": "restaurant-card",
          "props": { "name": "Sushi Palace", "rating": 4.5 },
          "actions": [{ "type": "navigate", "payload": { "to": "/restaurant/1" } }]
        }
      ]
    }
  ]
}` },
    ],
  },
  {
    id: 'json-switching',
    title: 'Switching Layouts',
    subtitle: 'Card view → List view — just swap the JSON',
    category: 'The JSON Response',
    content: [
      { type: 'comparison', left: {
        title: 'Card View',
        items: [
          'type: "restaurant-card"',
          'Large image on top, text below',
          'Wrapped in a 2-column grid',
          'Visual, browsing-friendly',
          'Great for discovery',
        ],
      }, right: {
        title: 'List View',
        items: [
          'type: "restaurant-list-item"',
          'Small thumbnail left, text right',
          'Wrapped in a vertical list',
          'Compact, scan-friendly',
          'Great for repeat orders',
        ],
      } },
      { type: 'text', value: 'Both components exist in the registry. The server picks which one to use by sending a different type string. No client-side feature flags, no if/else — just different JSON.' },
    ],
  },
  {
    id: 'json-banners',
    title: 'Banner Positioning',
    subtitle: 'Top, middle, or bottom — controlled by JSON order',
    category: 'The JSON Response',
    content: [
      { type: 'steps', items: [
        { title: 'Banners on TOP', description: 'Banner nodes come first in the children array, before the restaurant grid. Users see promos immediately.' },
        { title: 'Banners in MIDDLE', description: 'Banners are placed between restaurant items. Users discover them while scrolling — higher engagement.' },
        { title: 'Banners at BOTTOM', description: 'Banners appear after the restaurants, alongside offer-banner components like "2-for-1" deals.' },
      ] },
      { type: 'text', value: 'The renderer walks top to bottom. The order in JSON IS the order on screen. No CSS positioning, no z-index tricks — just move the node in the array.' },
    ],
  },
  {
    id: 'json-offers',
    title: 'Promotional Offers',
    subtitle: 'Injecting content without a deploy',
    category: 'The JSON Response',
    content: [
      { type: 'code', language: 'json', value:
`// Food items with an offer injected between them
{
  "type": "list",
  "children": [
    { "type": "food-item-row", "props": { "name": "Margherita", "price": 12.99 } },
    { "type": "food-item-row", "props": { "name": "Pepperoni", "price": 14.99 } },
    {
      "type": "offer-banner",
      "props": {
        "title": "2 for 1 on all rolls!",
        "badge": "2FOR1",
        "backgroundColor": "#fef3c7"
      }
    },
    { "type": "food-item-row", "props": { "name": "California Roll", "price": 9.99 } }
  ]
}` },
      { type: 'text', value: 'The offer-banner is just another component in the registry. The server injects it between food items in one JSON variant and omits it in another. Zero conditional logic on the frontend.' },
    ],
  },

  // ─── HOW THE FRONTEND RENDERS ───────────────────────────────
  {
    id: 'registry',
    title: 'The Component Registry',
    subtitle: 'A Map from strings to React components',
    category: 'How the Frontend Renders',
    content: [
      { type: 'code', language: 'typescript', value:
`// The props contract — every SDUI component receives this shape
interface SDUIComponentProps {
  actions?: SDUIAction[];        // server-defined interactions
  children?: React.ReactNode;    // rendered child nodes
  [key: string]: unknown;        // component-specific props (name, rating, etc.)
}

// The registry maps type strings to typed components
type ComponentMap = Map<string, React.ComponentType<SDUIComponentProps>>;

class ComponentRegistry {
  private components: ComponentMap = new Map();

  register(type: string, component: React.ComponentType<SDUIComponentProps>) {
    this.components.set(type, component);
  }

  get(type: string): React.ComponentType<SDUIComponentProps> | undefined {
    return this.components.get(type);
  }

  has(type: string): boolean {
    return this.components.has(type);
  }
}` },
      { type: 'code', language: 'typescript', value:
`// Registration — done once at app startup
const registry = new ComponentRegistry();
registry.register('banner',               Banner);
registry.register('restaurant-card',      RestaurantCard);
registry.register('restaurant-list-item', RestaurantListItem);
registry.register('food-item-card',       FoodItemCard);
registry.register('food-item-row',        FoodItemRow);
registry.register('offer-banner',         OfferBanner);
registry.register('grid',                 GridLayout);
registry.register('list',                 ListLayout);` },
      { type: 'text', value: 'Every component in the registry receives SDUIComponentProps — a shared contract. The [key: string]: unknown index signature allows component-specific props (name, rating, imageUrl) to pass through from the JSON while keeping the type system happy.' },
    ],
  },
  {
    id: 'renderer',
    title: 'The Recursive Renderer',
    subtitle: '15 lines that render any UI tree',
    category: 'How the Frontend Renders',
    content: [
      { type: 'code', language: 'tsx', value:
`function SDUIRenderer({ node, registry }) {
  // 1. Look up the component by its type string
  const Component = registry.get(node.type);
  if (!Component) return null;  // unknown type → skip silently

  // 2. Recursively render all children
  const children = node.children?.map((child, i) => (
    <SDUIRenderer key={i} node={child} registry={registry} />
  ));

  // 3. Render the component with server-provided props
  return (
    <Component {...node.props} actions={node.actions}>
      {children}
    </Component>
  );
}` },
      { type: 'bullets', items: [
        'This is the ENTIRE rendering engine',
        'It doesn\'t know what components exist — it just asks the registry',
        'Props from the JSON are spread directly onto the component',
        'Unknown types return null — forward compatibility for free',
      ] },
    ],
  },
  {
    id: 'render-flow',
    title: 'The Render Flow',
    subtitle: 'From JSON to pixels',
    category: 'How the Frontend Renders',
    content: [
      { type: 'steps', items: [
        { title: 'Fetch', description: 'Client calls GET /api/pages/home. Server responds with a JSON tree.' },
        { title: 'Parse', description: 'The root node has type: "list" with children: [banner, grid, ...]' },
        { title: 'Lookup', description: 'Renderer asks the registry: "list" → ListLayout component' },
        { title: 'Recurse', description: 'ListLayout receives its children. Each child goes through the same lookup → render cycle.' },
        { title: 'Render', description: '"banner" → Banner component with title, subtitle, imageUrl as props. "grid" → GridLayout with restaurant-card children.' },
        { title: 'Done', description: 'The entire page is built. No hardcoded layout. No if/else. Just JSON → components.' },
      ] },
    ],
  },
  {
    id: 'cross-platform',
    title: 'Same JSON, Different Renderers',
    subtitle: 'Web and mobile share the same API',
    category: 'How the Frontend Renders',
    content: [
      { type: 'comparison', left: {
        title: 'Web Registry',
        items: [
          '"banner" → <div> with <img> and CSS',
          '"grid" → CSS Grid layout',
          '"restaurant-card" → <div> with onClick',
          'React Router for navigation',
          'CSS for styling',
        ],
      }, right: {
        title: 'Mobile Registry',
        items: [
          '"banner" → <View> with <Image> and StyleSheet',
          '"grid" → FlatList with numColumns',
          '"restaurant-card" → <Pressable> with onPress',
          'React Navigation for navigation',
          'StyleSheet for styling',
        ],
      } },
      { type: 'text', value: 'The server sends identical JSON. Each platform\'s registry maps the same type strings to platform-native components. One API response, two completely different rendering targets.' },
    ],
  },

  // ─── USER INTERACTIONS ──────────────────────────────────────
  {
    id: 'action-handler',
    title: 'The Action Handler',
    subtitle: 'A single function that processes all actions',
    category: 'User Interactions',
    content: [
      { type: 'code', language: 'typescript', value:
`// Central action handler — every component delegates here
function useActionHandler() {
  const navigate = useNavigate();
  const { dispatch } = useCart();

  return (actions: SDUIAction[]) => {
    // Process ALL actions — a component can trigger multiple
    actions.forEach(action => {
      switch (action.type) {
        case 'navigate':
          navigate(action.payload.to as string);
          break;
        case 'add-to-cart':
          dispatch({ type: 'ADD_ITEM', payload: action.payload });
          break;
        case 'track':
          analytics.track(action.payload.event, action.payload);
          break;
      }
    });
  };
}` },
      { type: 'text', value: 'Actions are processed in order. A single tap can navigate AND track analytics. The handler is a hook — every component gets the same behavior without duplicating logic.' },
    ],
  },
  {
    id: 'action-navigate',
    title: 'Action: navigate',
    subtitle: 'The server controls where taps go',
    category: 'User Interactions',
    content: [
      { type: 'code', language: 'json', value:
`// Server sends this on a restaurant card:
{
  "type": "navigate",
  "payload": { "to": "/restaurant/3" }
}

// Server sends this on a promo banner:
{
  "type": "navigate",
  "payload": { "to": "/restaurant/5?promo=thai50" }
}` },
      { type: 'bullets', items: [
        'The client calls router.push(payload.to) — standard client-side routing',
        'The server controls WHERE every card, banner, and button links to',
        'Deep linking works naturally — /restaurant/3 fetches GET /api/pages/restaurant?id=3',
        'The server can redirect a card to a promo page tomorrow without any client deploy',
      ] },
    ],
  },
  {
    id: 'action-cart',
    title: 'Action: add-to-cart',
    subtitle: 'Server-defined actions with client-side state',
    category: 'User Interactions',
    content: [
      { type: 'code', language: 'json', value:
`// Server sends this on a food item:
{
  "type": "add-to-cart",
  "payload": {
    "itemId": "f1",
    "name": "Salmon Roll",
    "price": 12.99,
    "restaurantId": "1"
  }
}` },
      { type: 'code', language: 'typescript', value:
`// Client handles it with a local reducer
case 'add-to-cart':
  dispatch({
    type: 'ADD_ITEM',
    payload: action.payload  // { itemId, name, price, restaurantId }
  });
  break;` },
      { type: 'text', value: 'The server tells the client WHAT to add (item, price, restaurant). The cart state itself is client-side (useReducer). The server doesn\'t manage the cart — it just provides the data for the "Add" button.' },
    ],
  },
  {
    id: 'action-track',
    title: 'Action: track',
    subtitle: 'Analytics baked into the JSON',
    category: 'User Interactions',
    content: [
      { type: 'code', language: 'json', value:
`// Server sends this alongside navigate:
"actions": [
  { "type": "navigate", "payload": { "to": "/restaurant/3" } },
  { "type": "track", "payload": {
    "event": "restaurant_tapped",
    "restaurantId": "3",
    "position": 0,
    "experiment": "grid-vs-list",
    "variant": "grid"
  }}
]` },
      { type: 'bullets', items: [
        'Multiple actions fire on the same tap — navigate + track in one gesture',
        'The server controls what gets tracked AND what metadata is sent',
        'A/B test variant info is in the action — the server knows which layout the user saw',
        'No client-side analytics configuration needed — the server defines every event',
      ] },
    ],
  },
  {
    id: 'local-state',
    title: 'Server-Driven vs Client-Driven',
    subtitle: 'Where the boundary lives',
    category: 'User Interactions',
    content: [
      { type: 'comparison', left: {
        title: 'Server Controls',
        items: [
          'Which items to display',
          'Prices, images, descriptions',
          'Layout (card vs row, grid vs list)',
          'Available actions per component',
          'Offer banners and promotions',
          'Navigation targets',
        ],
      }, right: {
        title: 'Client Controls',
        items: [
          'Cart contents and quantities',
          'Form validation and input state',
          'Animations and transitions',
          'Scroll position',
          'Local preferences',
          'Optimistic UI updates',
        ],
      } },
      { type: 'text', value: 'The server drives WHAT you see. The client drives HOW you interact. This boundary is important — trying to server-drive everything (like cart state) introduces latency and complexity for no benefit.' },
    ],
  },

  // ─── REAL-TIME UPDATES ──────────────────────────────────────
  {
    id: 'sse',
    title: 'Live Updates with SSE',
    subtitle: 'Change the JSON, every client updates instantly',
    category: 'Real-Time Updates',
    content: [
      { type: 'steps', items: [
        { title: 'Config changes', description: 'Someone switches from card view to list view (could be an admin panel, a feature flag, or an API call).' },
        { title: 'Server broadcasts', description: 'All connected clients receive an SSE event: "CONFIG_CHANGED".' },
        { title: 'Clients re-fetch', description: 'Each client calls GET /api/pages/home to get the updated JSON tree.' },
        { title: 'UI re-renders', description: 'The renderer walks the new tree. Cards become list items. Banners move. Offers appear or disappear.' },
      ] },
      { type: 'text', value: 'Server-Sent Events are one-way (server → client), built on HTTP, auto-reconnect natively. Perfect for push notifications that trigger a re-fetch. No WebSocket complexity needed.' },
    ],
  },

  // ─── ANALYTICS & OBSERVABILITY ──────────────────────────────
  {
    id: 'analytics',
    title: 'Analytics',
    subtitle: 'The JSON tree IS your analytics data',
    category: 'Analytics & Observability',
    content: [
      { type: 'bullets', items: [
        'Every component rendered is traceable — the JSON tree IS the render tree',
        'Actions are already structured data: { type: "navigate", payload: { to: "/restaurant/3" } }',
        'You can log every action dispatch with zero additional instrumentation',
        'The server knows exactly what it sent — compare with what the client reports',
        'A/B testing is trivial: send variant A or B JSON, measure which converts better',
      ] },
      { type: 'code', language: 'typescript', value:
`// Analytics middleware — wraps action handling
function handleAction(action: SDUIAction, componentType: string) {
  // Track every interaction automatically
  analytics.track('sdui_action', {
    actionType: action.type,
    componentType,
    payload: action.payload,
    timestamp: Date.now(),
  });

  // Then execute the action
  executeAction(action);
}` },
    ],
  },
  {
    id: 'observability',
    title: 'What to Monitor',
    subtitle: 'Debugging SDUI in production',
    category: 'Analytics & Observability',
    content: [
      { type: 'steps', items: [
        { title: 'Registry Misses', description: 'The renderer got a type it doesn\'t recognize. This means the server is ahead of the client — log it as a warning, not an error.' },
        { title: 'JSON Response Size', description: 'Large payloads hurt mobile performance. Track p50/p95 response sizes. Consider pagination for long lists.' },
        { title: 'Render Duration', description: 'Time from JSON received to pixels painted. If a component is slow, you\'ll see it in the render metrics.' },
        { title: 'SSE Connection Health', description: 'Dropped connections mean clients miss config updates. Track active connections and reconnection rates.' },
      ] },
    ],
  },

  // ─── TRADEOFFS & LIMITATIONS ────────────────────────────────
  {
    id: 'tradeoffs',
    title: 'Tradeoffs',
    subtitle: 'SDUI is powerful, but not free',
    category: 'Tradeoffs & Limitations',
    content: [
      { type: 'comparison', left: {
        title: 'Advantages',
        items: [
          'Instant layout changes without releases',
          'One backend, multiple platforms',
          'A/B testing becomes trivial',
          'Non-engineers can modify UI',
          'Instant rollbacks (change the JSON back)',
        ],
      }, right: {
        title: 'Disadvantages',
        items: [
          'Limited to pre-registered components',
          'Complex interactions are harder to express',
          'JSON schema is a strict contract',
          'Performance overhead (fetch + parse + render)',
          'Three layers to debug instead of one',
        ],
      } },
    ],
  },
  {
    id: 'component-boundary',
    title: 'The Component Boundary',
    subtitle: 'You can only render what the client already knows',
    category: 'Tradeoffs & Limitations',
    content: [
      { type: 'text', value: 'SDUI lets you compose, arrange, and configure existing components. It does NOT let you create new ones from the server.' },
      { type: 'bullets', items: [
        'Want a new "video-player" component? Ship a client update first.',
        'Want to rearrange existing cards into a different layout? Just change the JSON.',
        'The registry is the boundary — if it\'s registered, the server can use it. If not, it can\'t.',
      ] },
      { type: 'text', value: 'This is a feature, not a bug. It prevents the server from running arbitrary code on the client — a critical security and stability boundary.' },
    ],
  },
  {
    id: 'app-stores',
    title: 'App Store Restrictions',
    subtitle: 'Apple and Google have opinions about this',
    category: 'Tradeoffs & Limitations',
    content: [
      { type: 'steps', items: [
        { title: 'Apple — Guideline 4.7', description: 'Apps may not download or execute code that changes features or functionality. SDUI is allowed because you\'re configuring existing components, not downloading new ones. But Apple can reject if they perceive SDUI as "changing the app\'s purpose" post-review.' },
        { title: 'Google Play — Dynamic Code Policy', description: 'Similar restrictions. Dynamically loaded code must comply with all Play policies. SDUI JSON is data, not code — but Google watches for abuse (e.g., turning a calculator into a casino).' },
        { title: 'The Safe Line', description: 'Configuring layout ≠ downloading code. The registry ships with the binary. The server picks from existing components — it cannot create new behavior. Stay on this side of the line.' },
      ] },
    ],
  },
  {
    id: 'hybrid',
    title: 'The Hybrid Approach',
    subtitle: 'Most real apps mix SDUI with native screens',
    category: 'Tradeoffs & Limitations',
    content: [
      { type: 'comparison', left: {
        title: 'Server-Driven',
        items: [
          'Home / discovery pages',
          'Search results',
          'Product listings',
          'Promotions and banners',
          'A/B tested layouts',
          'Content that changes weekly',
        ],
      }, right: {
        title: 'Hardcoded',
        items: [
          'Checkout flow',
          'Authentication',
          'Payment processing',
          'Settings and profile',
          'Camera / biometrics',
          'Complex animations',
        ],
      } },
      { type: 'text', value: 'Airbnb uses SDUI for search results and listing pages. Instagram uses it for feed layout. Neither is 100% server-driven. Use SDUI where layouts change frequently and native code where you need maximum performance or platform APIs.' },
    ],
  },
  {
    id: 'when-not',
    title: 'When NOT to Use SDUI',
    subtitle: 'It\'s a tool, not a religion',
    category: 'Tradeoffs & Limitations',
    content: [
      { type: 'bullets', items: [
        'Performance-critical screens (60fps animations, complex gestures)',
        'Small teams with fast release cycles (the overhead isn\'t worth it)',
        'Apps with very few screens (the infrastructure cost is too high)',
        'Offline-first apps (SDUI requires a server connection)',
        'Screens that rarely change (settings, about, legal)',
      ] },
      { type: 'text', value: 'If you can ship a native update in 2 hours and your layouts change once a quarter, SDUI is probably overkill. If you have 3 platforms, 50 layout variants, and a product team that experiments weekly — SDUI pays for itself fast.' },
    ],
  },

  // ─── SUMMARY ────────────────────────────────────────────────
  {
    id: 'takeaways',
    title: 'Key Takeaways',
    subtitle: 'What to remember',
    category: 'Summary',
    content: [
      { type: 'steps', items: [
        { title: 'JSON is the API', description: 'The server sends a tree of { type, props, children, actions }. This is the only contract.' },
        { title: 'Registry + Renderer = The Pattern', description: 'A component map and a recursive tree walker. ~30 lines of code. That\'s the entire SDUI infrastructure.' },
        { title: 'Actions are Data', description: 'Navigation, cart, analytics — all described in JSON. The client interprets them. The server never sends code.' },
        { title: 'Know the Boundaries', description: 'SDUI configures existing components. It doesn\'t create new ones. This is both a limitation and a security feature.' },
        { title: 'Use It Where It Matters', description: 'Discovery pages, promotions, A/B tests. Not checkout, not auth, not offline. The hybrid approach is the real-world pattern.' },
      ] },
    ],
  },
  {
    id: 'thanks',
    title: 'Thank You!',
    subtitle: 'Questions?',
    category: 'Summary',
    content: [
      { type: 'text', value: 'The entire SDUI core is ~30 lines of TypeScript:' },
      { type: 'bullets', items: [
        'SDUINode interface — the JSON contract (5 lines)',
        'ComponentRegistry class — a Map wrapper (10 lines)',
        'SDUIRenderer function — recursive tree walker (15 lines)',
        'Everything else is just the components themselves',
      ] },
      { type: 'text', value: 'SDUI is not magic. It\'s a Map, a recursive function, and a well-defined JSON contract. The power comes from putting UI decisions on the server — where you can change them instantly, for everyone, without a deploy.' },
    ],
  },
];

// Extract unique categories in order of first appearance
export const categories: string[] = [];
for (const slide of slides) {
  if (!categories.includes(slide.category)) {
    categories.push(slide.category);
  }
}
