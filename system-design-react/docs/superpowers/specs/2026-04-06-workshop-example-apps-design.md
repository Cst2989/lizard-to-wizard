# System Design Workshop — Example Apps Design Spec

## Overview

Three standalone example apps for a frontend system design workshop aimed at **junior/mid developers** seeing these patterns for the first time. Each app is **pattern-first**: a `core/` folder contains the pattern's infrastructure, and the rest of the app consumes it.

All apps live as separate standalone projects under `apps/` in the workshop repo.

| App | Pattern | Domain | Backend |
|-----|---------|--------|---------|
| server-driven-ui | Server-Driven UI | Food delivery (Uber Eats-like) | Frontend-only (mock JSON) |
| bff | Backend for Frontend | Travel booking | Node/Express |
| event-driven | Event-Driven / Event Bus | Live sports scoreboard (FlashScore-like) | Node/Express |

A **microfrontends** example already exists and will be moved into the same `apps/` structure separately.

---

## App 1: Server-Driven UI — Food Delivery

### Concept

The server sends JSON describing what to render (component type, props, layout). The frontend has a component registry that maps types to React components and a renderer that walks the JSON tree. Two clients (web + React Native) consume the same JSON API.

### Architecture

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
        restaurant-{id}.json        restaurant detail: food items
        responses.ts                simulates fetching with delay
      App.tsx                       routing between home and restaurant detail
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

### Data Flow

1. Page loads, fetches JSON from mock-server (e.g., `home.json`)
2. JSON structure describes a tree of components:
   ```json
   {
     "layout": "list",
     "children": [
       { "type": "banner", "props": { "imageUrl": "...", "title": "50% off Thai" } },
       { "type": "grid", "children": [
         { "type": "restaurant-card", "props": { "name": "Sushi Place", "rating": 4.5 } }
       ]}
     ]
   }
   ```
3. SDUIRenderer recursively walks the tree, looks up each `type` in the registry, passes `props`, renders
4. Layout switching: a toggle re-fetches a different JSON variant (grid vs list layout node)
5. Cart: FoodItemCard fires an onAddToCart action, updates CartContext (local state, not server-driven)

### Key Features

- **Web client** is responsive (mobile-first CSS, grid adapts to screen size)
- **React Native client** consumes the exact same JSON, maps to native components
- `core/types.ts` is identical in both clients — same SDUINode interface
- Component registry pattern: `registry.register('banner', Banner)` then the renderer resolves it
- Adding a new component = register it, server JSON can use it immediately

### Teaching Moments

- Frontend has zero knowledge of what pages look like — it's all in the JSON
- Layout changes require no frontend deploy — just change the JSON
- Same JSON, two completely different renderers (web + native) — that's SDUI
- Registry pattern (string to component mapping) is the heart of the architecture

---

## App 2: BFF — Travel Booking

### Concept

The frontend calls one BFF endpoint instead of juggling multiple backend services. The BFF aggregates, transforms, and shapes data from separate services into exactly what the UI needs. Implemented as a real Node/Express server.

### Architecture

```
apps/bff/
  server/                               Node/Express BFF server
    src/
      bff/
        tripController.ts               GET /api/trip?dest=...&from=...&to=...
        tripAggregator.ts               BFF logic: parallel fetch + transform
        types.ts                        clean UI-shaped response types
      services/
        flightsService.ts               calls "external" flights API
        hotelsService.ts                calls "external" hotels API
        weatherService.ts               calls "external" weather API
        currencyService.ts              currency conversion
        types.ts                        raw service types (messy, inconsistent)
      mock-apis/
        flightsApi.ts                   Express router pretending to be external API
        hotelsApi.ts                    different response format on purpose
        weatherApi.ts                   yet another format
      data/
        flights.json
        hotels.json
        weather.json
        currencies.json
      index.ts                          Express app: mounts mock APIs + BFF routes
    package.json

  web/                                  React (Vite) frontend
    src/
      components/
        SearchForm.tsx                  destination + dates input
        TripSummary.tsx                 unified view: flights + hotels + weather
        FlightCard.tsx
        HotelCard.tsx
        WeatherBadge.tsx
        PriceBreakdown.tsx              aggregated total across services
        LoadingStates.tsx               skeleton UI while BFF aggregates
      api/
        client.ts                       single fetch to BFF endpoint
        types.ts                        mirrors server's clean response types
      App.tsx
    package.json
```

### Data Flow

1. User enters destination and dates in SearchForm
2. Frontend calls one endpoint: `GET /api/trip?dest=paris&from=2026-06-01&to=2026-06-07`
3. BFF's tripAggregator internally:
   - Calls flightsService, hotelsService, weatherService in parallel via `Promise.all`
   - Each mock API returns intentionally different formats (camelCase vs snake_case, Kelvin vs Celsius, nested vs flat)
   - Normalizes naming, converts units, flattens structures
   - Computes aggregated trip cost
   - Returns one clean, UI-shaped response
4. Frontend receives one `TripSummary` object and renders it

### Mock API Design (Intentionally Inconsistent)

- **Flights API** (`/external/flights`): camelCase, nested `segments[]` array, prices in cents
- **Hotels API** (`/external/hotels`): snake_case, `price_per_night` as string, different date format
- **Weather API** (`/external/weather`): temperature in Kelvin, wind in m/s, array of hourly forecasts

The BFF normalizes all of this into one clean shape.

### Key Features

- Real HTTP boundary — BFF is a server, not just a function
- Mock APIs simulate real-world inconsistency between microservices
- `Promise.all` parallelization visible in the aggregator
- Frontend api/client.ts is trivially simple — one fetch call

### Teaching Moments

- Mock APIs having intentionally different formats makes "why BFF?" obvious
- Students can open each mock API in browser/Postman and see the mess
- The aggregator is the hero: parallel fetch, normalize, combine
- Frontend components are simple because they receive exactly what they need
- Optional exercise: remove the BFF, have frontend call all 3 APIs directly — feel the pain

---

## App 3: Event-Driven — Live Sports Scoreboard (FlashScore-style)

### Concept

Components never talk to each other directly. Everything flows through an Event Bus. Game events (goals, cards, substitutions) are emitted and any number of independent widgets react. Features multiple leagues, match navigation, time travel through events, and favorites.

### Architecture

```
apps/event-driven/
  server/                               Node/Express backend
    src/
      routes/
        leagues.ts                      GET /api/leagues
        matches.ts                      GET /api/leagues/:id/matches, GET /api/matches/:id
        events.ts                       GET /api/matches/:id/events?from=0&to=90
        favorites.ts                    POST/GET/DELETE /api/favorites
      data/
        leagues.json                    Premier League, La Liga, Serie A, etc.
        matches.json                    multiple matches per league with status
        events.json                     detailed events per match
      simulator/
        MatchSimulator.ts               emits events via SSE for "live" matches
      index.ts
    package.json

  web/                                  React (Vite) frontend
    src/
      core/
        EventBus.ts                     subscribe, emit, unsubscribe
        events.ts                       event type definitions
        types.ts                        Event, GameEvent, League, Match types
        useEvent.ts                     hook: useEvent('GOAL_SCORED', handler)
        useEmit.ts                      hook: useEmit()
      features/
        leagues/
          LeagueSidebar.tsx             list of leagues, switch between them
          LeagueHeader.tsx              league logo, name, country
        matches/
          MatchList.tsx                 all matches for selected league
          MatchRow.tsx                  compact row: teams, score, minute, status
          MatchDetail.tsx               full match view when clicked
        favorites/
          FavoriteStar.tsx              toggle on any match
          FavoritesFilter.tsx           filter to show only favorites
        timeline/
          Timeline.tsx                  chronological event feed for a match
          TimeSlider.tsx                scrub through match time (0'-90')
          TimelineEvent.tsx             single event row with icon + text
      widgets/
        Scoreboard.tsx                  reacts to GOAL_SCORED
        MatchClock.tsx                  reacts to time events
        Commentary.tsx                  translates events to natural language
        PlayerStats.tsx                 reacts to GOAL_SCORED, CARD_GIVEN, SUBSTITUTION
        FormationMap.tsx                reacts to SUBSTITUTION, CARD_GIVEN
        EventLog.tsx                    dev tool: raw events flowing through bus
      components/
        Dashboard.tsx                   main layout: sidebar + match list + detail
      api/
        client.ts                       REST calls to server
        sse.ts                          SSE connection for live match events
      App.tsx
    package.json
```

### Event Bus Core

```typescript
class EventBus {
  private listeners: Map<string, Set<EventHandler>>
  subscribe(eventType: string, handler: EventHandler): () => void
  emit(event: GameEvent): void
}
```

React hooks for ergonomic usage:
```typescript
useEvent('GOAL_SCORED', (event) => {
  setScore(prev => ({ ...prev, [event.payload.team]: prev[event.payload.team] + 1 }))
})
```

### Event Types

```typescript
{ type: 'GOAL_SCORED', payload: { player: 'Messi', team: 'home', minute: 23 } }
{ type: 'CARD_GIVEN', payload: { player: 'Ramos', card: 'yellow', minute: 31 } }
{ type: 'HALF_TIME', payload: { homeScore: 1, awayScore: 0 } }
{ type: 'SUBSTITUTION', payload: { out: 'Modric', in: 'Valverde', minute: 65 } }
{ type: 'MATCH_STARTED', payload: { homeTeam: '...', awayTeam: '...' } }
{ type: 'MATCH_ENDED', payload: { finalScore: { home: 2, away: 1 } } }
```

### Data Flow

**Navigation (FlashScore-style):**
1. Left sidebar shows leagues — click to filter matches
2. Match list shows all matches: live (pulsing minute indicator), finished, upcoming
3. Click a match — opens detail view with all widgets
4. Star icon on any match — adds to favorites via REST API
5. Favorites filter — show only starred matches across all leagues

**Live matches:**
1. Server runs MatchSimulator for matches marked as "live"
2. Frontend connects via SSE to `/api/matches/:id/stream`
3. Each SSE message is pushed into the EventBus
4. All widgets react independently

**Time travel (scrubber):**
1. TimeSlider lets user scrub from minute 0' to 90'
2. Moving slider calls `GET /api/matches/:id/events?from=0&to=45`
3. Events up to that minute are replayed through the EventBus
4. All widgets re-render to show state at that point in time
5. Demonstrates: if your entire UI state can be rebuilt from events, event-driven architecture is working

**Finished matches:**
- All events already stored — no SSE needed
- TimeSlider replays historical events the same way

### Key Features

- SSE pipeline from server into EventBus for live matches
- Time travel: scrub through a match, entire UI rebuilds from events
- Multiple leagues and matches with navigation
- Favorites persisted via REST (not everything is an event — CRUD is fine for CRUD)
- EventLog dev tool shows raw events flowing through the bus

### Teaching Moments

- Zero coupling between widgets — remove any widget, nothing breaks
- Adding a new widget = subscribe to events, done
- SSE to EventBus pipeline: real-time events from server flow through the same bus as replayed events
- Time travel proves the architecture: UI state rebuilt entirely from events
- Favorites show pragmatism: REST is fine for CRUD, event bus handles real-time game state
- League/match switching tears down and reconnects bus subscriptions

---

## Shared Decisions

- **Tech stack:** React + TypeScript + Vite for all web clients, Expo for React Native (SDUI only), Node/Express for backends
- **Styling:** CSS modules or plain CSS — keep it simple, styling is not the lesson
- **No external dependencies for state:** Each app uses the minimal state approach that serves its pattern (Context for SDUI cart, EventBus for event-driven, simple useState for BFF)
- **Mock data is realistic:** Real restaurant names, real airline formats, real football leagues/players — immersion helps learning
- **Each app runs independently:** Own `package.json`, own dev server, no monorepo tooling needed
