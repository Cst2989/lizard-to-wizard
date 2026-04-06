# Server-Driven UI — Food Delivery App

## Overview

A food delivery app (Uber Eats-like) demonstrating **Server-Driven UI**. The server sends JSON describing what to render, and the frontend has a component registry + renderer that maps JSON nodes to React components. Two clients (web + React Native) consume the same JSON API.

**Audience:** Junior/mid developers seeing SDUI for the first time.
**Structure:** Pattern-first — `core/` contains the SDUI engine, everything else consumes it.
**Backend:** Frontend-only with mock JSON responses.

---

## Architecture

```
apps/server-driven-ui/
  web/                              React (Vite) web client
    src/
      core/
        ComponentRegistry.ts        maps string types to React components
        SDUIRenderer.tsx            walks JSON tree, looks up registry, renders
        types.ts                    SDUINode, SDUILayout, SDUIAction types
      components/
        Banner.tsx                  hero/promotional banners
        RestaurantCard.tsx          restaurant with image, rating, delivery time
        FoodItemCard.tsx            food item with price, add-to-cart
        GridLayout.tsx              renders children in a CSS grid
        ListLayout.tsx              renders children in a vertical list
        CartSummary.tsx             floating cart with item count + total
      mock-server/
        home.json                   home page: banners + restaurant list
        home-v2.json                alternate home (different banners, reordered restaurants)
        home-promo.json             holiday promo version (seasonal banners, featured section)
        restaurant-{id}.json        restaurant detail: food items
        restaurant-{id}-v2.json     alternate detail (different layout, prices, featured items)
        responses.ts                simulates fetching with delay, serves active config
      admin/
        AdminPanel.tsx              config switcher UI (side panel or separate route)
        ConfigSelector.tsx          dropdown per page to pick which JSON variant is active
        JsonPreview.tsx             live preview of the active JSON (syntax highlighted)
        adminState.ts               tracks which config is active per page
      App.tsx                       routing between home, restaurant detail, and admin
      CartContext.tsx                simple cart state (only non-SDUI state)
    package.json

  mobile/                           React Native (Expo) client
    src/
      core/
        ComponentRegistry.ts        same pattern, maps to RN components
        SDUIRenderer.tsx            same logic, renders RN components
        types.ts                    same types as web
      components/
        Banner.tsx                  uses Image, View, etc.
        RestaurantCard.tsx
        FoodItemCard.tsx
        GridLayout.tsx              uses FlatList with numColumns
        ListLayout.tsx              uses FlatList
        CartSummary.tsx
      mock-server/                  same JSON responses as web
      App.tsx
      CartContext.tsx
    package.json
```

---

## Core Types

```typescript
// core/types.ts (shared between web and mobile)

interface SDUINode {
  type: string                    // e.g., 'banner', 'restaurant-card', 'grid'
  props?: Record<string, any>     // component-specific props
  children?: SDUINode[]           // nested nodes (for layouts)
  actions?: SDUIAction[]          // user interactions
}

interface SDUIAction {
  type: string                    // e.g., 'navigate', 'add-to-cart'
  payload: Record<string, any>
}

type ComponentMap = Map<string, React.ComponentType<any>>
```

---

## Component Registry

```typescript
// core/ComponentRegistry.ts

class ComponentRegistry {
  private components: ComponentMap = new Map()

  register(type: string, component: React.ComponentType<any>): void
  get(type: string): React.ComponentType<any> | undefined
  has(type: string): boolean
}
```

Registration at app startup:
```typescript
registry.register('banner', Banner)
registry.register('restaurant-card', RestaurantCard)
registry.register('food-item-card', FoodItemCard)
registry.register('grid', GridLayout)
registry.register('list', ListLayout)
```

---

## SDUI Renderer

```typescript
// core/SDUIRenderer.tsx

function SDUIRenderer({ node, registry }: { node: SDUINode, registry: ComponentRegistry }) {
  const Component = registry.get(node.type)
  if (!Component) return null  // unknown type = skip

  const children = node.children?.map((child, i) =>
    <SDUIRenderer key={i} node={child} registry={registry} />
  )

  return <Component {...node.props} actions={node.actions}>{children}</Component>
}
```

---

## Mock Server JSON

### home.json — Home Page
```json
{
  "type": "list",
  "children": [
    {
      "type": "banner",
      "props": {
        "imageUrl": "/images/promo-thai.jpg",
        "title": "50% off Thai Food",
        "subtitle": "This weekend only"
      },
      "actions": [{ "type": "navigate", "payload": { "to": "/restaurant/3" } }]
    },
    {
      "type": "banner",
      "props": {
        "imageUrl": "/images/free-delivery.jpg",
        "title": "Free Delivery",
        "subtitle": "On orders over $25"
      }
    },
    {
      "type": "grid",
      "props": { "columns": 2 },
      "children": [
        {
          "type": "restaurant-card",
          "props": {
            "id": "1",
            "name": "Sushi Palace",
            "imageUrl": "/images/sushi.jpg",
            "rating": 4.5,
            "deliveryTime": "25-35 min",
            "cuisine": "Japanese",
            "priceRange": "$$"
          },
          "actions": [{ "type": "navigate", "payload": { "to": "/restaurant/1" } }]
        },
        {
          "type": "restaurant-card",
          "props": {
            "id": "2",
            "name": "Bella Napoli",
            "imageUrl": "/images/pizza.jpg",
            "rating": 4.8,
            "deliveryTime": "20-30 min",
            "cuisine": "Italian",
            "priceRange": "$$$"
          },
          "actions": [{ "type": "navigate", "payload": { "to": "/restaurant/2" } }]
        }
      ]
    }
  ]
}
```

### restaurant-1.json — Restaurant Detail
```json
{
  "type": "list",
  "children": [
    {
      "type": "banner",
      "props": {
        "imageUrl": "/images/sushi-hero.jpg",
        "title": "Sushi Palace",
        "subtitle": "4.5 stars - Japanese - 25-35 min"
      }
    },
    {
      "type": "grid",
      "props": { "columns": 2 },
      "children": [
        {
          "type": "food-item-card",
          "props": {
            "id": "f1",
            "name": "Dragon Roll",
            "description": "Shrimp tempura, avocado, eel sauce",
            "price": 14.99,
            "imageUrl": "/images/dragon-roll.jpg"
          },
          "actions": [{ "type": "add-to-cart", "payload": { "itemId": "f1", "price": 14.99 } }]
        }
      ]
    }
  ]
}
```

---

## Pages and Routing

### Home Page
- Fetches `home.json`, passes root node to SDUIRenderer
- Toggle button switches between grid/list variant (re-fetches `home-grid.json` or `home-list.json`)

### Restaurant Detail Page
- URL: `/restaurant/:id`
- Fetches `restaurant-{id}.json`, passes to SDUIRenderer
- Toggle button switches grid/list for food items
- FoodItemCard add-to-cart action updates CartContext

---

## Admin Panel (Mock CMS)

The admin panel is the "aha moment" of the entire demo. It simulates what a product/marketing team would use to change the app's UI without involving developers.

### What it does

- A side panel (or `/admin` route) that shows **configuration controls** for each page
- Dropdown selectors let you pick which JSON variant is active for each page
- A live JSON preview shows the currently active configuration
- Switching a config **immediately updates the consumer app** (web and mobile would re-fetch)

### JSON Variants

Each page has multiple pre-built JSON configurations:

**Home page variants:**
| Variant | Description |
|---------|-------------|
| `home.json` | Default: 2 banners + grid of restaurants |
| `home-v2.json` | Reordered: restaurants first, banners at bottom, list layout |
| `home-promo.json` | Holiday promo: seasonal banner at top, "Featured" section, special offers badge on cards |

**Restaurant detail variants:**
| Variant | Description |
|---------|-------------|
| `restaurant-1.json` | Default: grid layout, standard prices |
| `restaurant-1-v2.json` | List layout, "Chef's Special" banner added, different item ordering, updated prices |

### How it works

```typescript
// admin/adminState.ts
// Simple state that tracks which JSON file to serve per page

interface AdminConfig {
  home: 'home.json' | 'home-v2.json' | 'home-promo.json'
  restaurants: Record<string, string>  // { "1": "restaurant-1.json" | "restaurant-1-v2.json" }
}

// Default config
const defaultConfig: AdminConfig = {
  home: 'home.json',
  restaurants: { "1": "restaurant-1.json", "2": "restaurant-2.json" }
}
```

```typescript
// mock-server/responses.ts — uses active config to decide which JSON to return
async function fetchPage(page: string): Promise<SDUINode> {
  const activeFile = adminConfig.getActiveFile(page)
  const response = await import(`./data/${activeFile}`)
  return response.default
}
```

### Admin Panel UI

```
┌─────────────────────────────────────┐
│  🔧 Admin Panel                     │
│                                     │
│  Home Page Config:                  │
│  ┌─────────────────────────┐        │
│  │ home.json            ▼  │        │
│  └─────────────────────────┘        │
│  Options:                           │
│  • home.json (Default)              │
│  • home-v2.json (Reordered)         │
│  • home-promo.json (Holiday)        │
│                                     │
│  Restaurant 1 Config:               │
│  ┌─────────────────────────┐        │
│  │ restaurant-1.json    ▼  │        │
│  └─────────────────────────┘        │
│                                     │
│  ── Active JSON Preview ──────────  │
│  {                                  │
│    "type": "list",                  │
│    "children": [                    │
│      { "type": "banner", ...}       │
│    ]                                │
│  }                                  │
│                                     │
└─────────────────────────────────────┘
```

### Workshop Demo Flow

1. Open the food delivery app — "here's the default home page"
2. Open the admin panel side-by-side (or in a split view)
3. Switch home config from `home.json` → `home-promo.json`
4. Watch the app update — banners change, layout changes, featured section appears
5. **"No code was changed. No deploy. The server just sent different JSON."**
6. Switch a restaurant detail to its v2 — different layout, different item order
7. Show the JSON preview — "this is all the server changed"

### Key Teaching Points

- This is how companies like Airbnb and Shopify update their apps remotely
- Marketing/product teams can change the UI without developer involvement
- A/B testing becomes trivial — serve variant A to 50% of users, variant B to the rest
- Rollbacks are instant — switch back to the previous JSON config

---

## Cart (Local State)

Cart is the one piece of state not driven by the server:

```typescript
// CartContext.tsx
interface CartItem {
  itemId: string
  name: string
  price: number
  quantity: number
}

interface CartState {
  items: CartItem[]
  total: number
}
```

CartSummary is a floating component (not in the SDUI tree) showing item count and total.

---

## Responsive Design (Web)

- Mobile-first CSS
- Grid layout: 1 column on mobile, 2 columns on tablet, 3+ on desktop
- Banner: full-width on all screens
- RestaurantCard and FoodItemCard adapt their layout (horizontal on mobile list view, vertical on grid view)

---

## React Native Client

Same JSON, different component implementations:

| Web Component | RN Component | Notes |
|--------------|-------------|-------|
| `<div className="grid">` | `<FlatList numColumns={2}>` | Grid layout |
| `<div className="list">` | `<FlatList>` | List layout |
| `<img>` | `<Image>` | Images |
| `<button onClick>` | `<Pressable onPress>` | Actions |
| CSS Grid/Flexbox | StyleSheet + Flexbox | Styling |

The `core/` folder (registry, renderer, types) is structurally identical — same pattern, different primitives.

---

## Images

All image URLs in mock JSON use placeholder services (e.g., `https://placehold.co/400x300?text=Sushi`) or free stock food images from Unsplash. No local image assets needed — keeps the project lightweight.

## Tech Stack

- **Web:** React 19 + TypeScript + Vite
- **Mobile:** React Native + Expo
- **State:** React Context (cart only)
- **Routing:** React Router (web), React Navigation (mobile)
- **Styling:** CSS modules (web), StyleSheet (mobile)

---

## Teaching Moments

1. Frontend has zero knowledge of what pages look like — it's all in the JSON
2. Adding a new component = register it + server JSON can use it
3. Layout changes require no frontend deploy — just change the JSON
4. Registry pattern (string to component mapping) is the heart of SDUI
5. Same JSON, two renderers (web + native) — the core value proposition of SDUI
6. Cart shows that not everything needs to be server-driven — local interaction state is fine
7. **Admin panel live demo** — switch configs and watch the app update instantly, no deploy, no code change
8. A/B testing and remote UI control become trivial with SDUI — just serve different JSON to different users
