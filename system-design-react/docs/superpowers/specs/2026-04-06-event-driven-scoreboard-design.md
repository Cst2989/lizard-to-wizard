# Event-Driven — Live Sports Scoreboard (FlashScore-style)

## Overview

A live sports scoreboard app (inspired by FlashScore) demonstrating **Event-Driven Architecture** with an **Event Bus**. Components never talk to each other directly — everything flows through the bus. Features multiple leagues, match navigation, time travel through events, and favorites.

**Audience:** Junior/mid developers seeing event-driven patterns for the first time.
**Structure:** Pattern-first — `core/` contains the Event Bus and hooks, widgets subscribe independently.
**Backend:** Real Node/Express server with SSE (Server-Sent Events) for live match simulation.

---

## Architecture

```
apps/event-driven/
  server/                               Node/Express backend
    src/
      routes/
        leagues.ts                      GET /api/leagues
        matches.ts                      GET /api/leagues/:id/matches
                                        GET /api/matches/:id
        events.ts                       GET /api/matches/:id/events?from=0&to=90
                                        GET /api/matches/:id/stream (SSE)
        favorites.ts                    GET /api/favorites
                                        POST /api/favorites/:matchId
                                        DELETE /api/favorites/:matchId
      simulator/
        MatchSimulator.ts               emits events via SSE for "live" matches
      data/
        leagues.json                    Premier League, La Liga, Serie A, etc.
        matches.json                    multiple matches per league with status
        events.json                     detailed events per match (goals, cards, subs)
      index.ts                          Express app
    package.json

  web/                                  React (Vite) frontend
    src/
      core/
        EventBus.ts                     subscribe, emit, unsubscribe
        events.ts                       event type definitions and constants
        types.ts                        Event, GameEvent, League, Match types
        useEvent.ts                     hook: subscribe to specific event type
        useEmit.ts                      hook: get emit function
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
          FavoritesFilter.tsx           filter view to show only favorites
        timeline/
          Timeline.tsx                  chronological event feed for a match
          TimeSlider.tsx                scrub through match time (0'-90')
          TimelineEvent.tsx             single event row with icon + text
      widgets/
        Scoreboard.tsx                  reacts to GOAL_SCORED
        MatchClock.tsx                  reacts to time events
        Commentary.tsx                  translates events to natural language text
        PlayerStats.tsx                 reacts to GOAL_SCORED, CARD_GIVEN, SUBSTITUTION
        FormationMap.tsx                reacts to SUBSTITUTION, CARD_GIVEN
        EventLog.tsx                    dev tool: raw events flowing through the bus
      components/
        Dashboard.tsx                   main layout: sidebar + match list + detail
      api/
        client.ts                       REST calls to server
        sse.ts                          SSE connection for live match events
      App.tsx
    package.json
```

---

## Core: Event Bus

### EventBus.ts

```typescript
type EventHandler<T = any> = (event: GameEvent<T>) => void

class EventBus {
  private listeners: Map<string, Set<EventHandler>> = new Map()

  subscribe<T>(eventType: string, handler: EventHandler<T>): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set())
    }
    this.listeners.get(eventType)!.add(handler)

    // Return unsubscribe function
    return () => this.listeners.get(eventType)?.delete(handler)
  }

  emit(event: GameEvent): void {
    const handlers = this.listeners.get(event.type)
    handlers?.forEach(handler => handler(event))
  }

  // For time travel: clear all state and replay
  clear(): void {
    // Does NOT remove subscriptions — just signals widgets to reset
    this.emit({ type: 'RESET', payload: {} })
  }
}

// Singleton instance
export const eventBus = new EventBus()
```

### React Hooks

```typescript
// core/useEvent.ts
function useEvent<T>(eventType: string, handler: (event: GameEvent<T>) => void): void {
  useEffect(() => {
    const unsubscribe = eventBus.subscribe(eventType, handler)
    return unsubscribe
  }, [eventType, handler])
}

// core/useEmit.ts
function useEmit() {
  return useCallback((event: GameEvent) => eventBus.emit(event), [])
}
```

---

## Event Types

### events.ts

```typescript
// All possible game events

interface GameEvent<T = any> {
  type: string
  payload: T
  timestamp: number       // match minute
}

// Event type constants
const MATCH_STARTED = 'MATCH_STARTED'
const GOAL_SCORED = 'GOAL_SCORED'
const CARD_GIVEN = 'CARD_GIVEN'
const SUBSTITUTION = 'SUBSTITUTION'
const HALF_TIME = 'HALF_TIME'
const SECOND_HALF = 'SECOND_HALF'
const MATCH_ENDED = 'MATCH_ENDED'
const PENALTY = 'PENALTY'
const VAR_REVIEW = 'VAR_REVIEW'
const RESET = 'RESET'
```

### Event Payloads

```typescript
{ type: 'MATCH_STARTED', payload: { homeTeam: 'Arsenal', awayTeam: 'Chelsea', competition: 'Premier League' }, timestamp: 0 }

{ type: 'GOAL_SCORED', payload: { player: 'Saka', team: 'home', assist: 'Odegaard', minute: 23 }, timestamp: 23 }

{ type: 'CARD_GIVEN', payload: { player: 'Palmer', team: 'away', card: 'yellow', reason: 'Tactical foul', minute: 31 }, timestamp: 31 }

{ type: 'SUBSTITUTION', payload: { teamSide: 'away', playerOut: 'Mudryk', playerIn: 'Nkunku', minute: 58 }, timestamp: 58 }

{ type: 'HALF_TIME', payload: { homeScore: 1, awayScore: 0 }, timestamp: 45 }

{ type: 'MATCH_ENDED', payload: { homeScore: 2, awayScore: 1, result: 'home_win' }, timestamp: 90 }

{ type: 'PENALTY', payload: { player: 'Salah', team: 'home', scored: true, minute: 78 }, timestamp: 78 }

{ type: 'VAR_REVIEW', payload: { decision: 'goal_awarded', originalCall: 'offside', minute: 34 }, timestamp: 34 }
```

---

## Data Model

### leagues.json
```json
[
  { "id": "pl", "name": "Premier League", "country": "England", "icon": "england.png" },
  { "id": "laliga", "name": "La Liga", "country": "Spain", "icon": "spain.png" },
  { "id": "seriea", "name": "Serie A", "country": "Italy", "icon": "italy.png" },
  { "id": "bundes", "name": "Bundesliga", "country": "Germany", "icon": "germany.png" }
]
```

### matches.json
```json
[
  {
    "id": "m1",
    "leagueId": "pl",
    "homeTeam": { "name": "Arsenal", "shortName": "ARS", "logo": "arsenal.png" },
    "awayTeam": { "name": "Chelsea", "shortName": "CHE", "logo": "chelsea.png" },
    "status": "live",
    "currentMinute": 67,
    "homeScore": 2,
    "awayScore": 1,
    "startTime": "2026-04-06T15:00:00Z"
  },
  {
    "id": "m2",
    "leagueId": "pl",
    "homeTeam": { "name": "Liverpool", "shortName": "LIV", "logo": "liverpool.png" },
    "awayTeam": { "name": "Man City", "shortName": "MCI", "logo": "mancity.png" },
    "status": "finished",
    "homeScore": 3,
    "awayScore": 2,
    "startTime": "2026-04-06T12:30:00Z"
  },
  {
    "id": "m3",
    "leagueId": "laliga",
    "homeTeam": { "name": "Real Madrid", "shortName": "RMA", "logo": "realmadrid.png" },
    "awayTeam": { "name": "Barcelona", "shortName": "BAR", "logo": "barcelona.png" },
    "status": "live",
    "currentMinute": 34,
    "homeScore": 0,
    "awayScore": 1,
    "startTime": "2026-04-06T20:00:00Z"
  }
]
```

### events.json
```json
{
  "m1": [
    { "type": "MATCH_STARTED", "payload": { "homeTeam": "Arsenal", "awayTeam": "Chelsea" }, "timestamp": 0 },
    { "type": "GOAL_SCORED", "payload": { "player": "Saka", "team": "home", "assist": "Odegaard" }, "timestamp": 23 },
    { "type": "CARD_GIVEN", "payload": { "player": "Palmer", "team": "away", "card": "yellow" }, "timestamp": 31 },
    { "type": "HALF_TIME", "payload": { "homeScore": 1, "awayScore": 0 }, "timestamp": 45 },
    { "type": "GOAL_SCORED", "payload": { "player": "Palmer", "team": "away", "assist": "Madueke" }, "timestamp": 52 },
    { "type": "SUBSTITUTION", "payload": { "teamSide": "away", "playerOut": "Mudryk", "playerIn": "Nkunku" }, "timestamp": 58 },
    { "type": "GOAL_SCORED", "payload": { "player": "Havertz", "team": "home", "assist": "Saka" }, "timestamp": 67 }
  ]
}
```

---

## Server

### REST Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/leagues` | All leagues |
| `GET /api/leagues/:id/matches` | Matches for a league |
| `GET /api/matches/:id` | Single match details |
| `GET /api/matches/:id/events?from=0&to=90` | Events for a match, filtered by minute range |
| `GET /api/matches/:id/stream` | SSE stream for live match events |
| `GET /api/favorites` | User's favorite match IDs |
| `POST /api/favorites/:matchId` | Add to favorites |
| `DELETE /api/favorites/:matchId` | Remove from favorites |

### SSE Stream (Live Matches)

```typescript
// routes/events.ts — SSE endpoint
router.get('/matches/:id/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  const matchId = req.params.id
  const simulator = new MatchSimulator(matchId)

  simulator.onEvent((event) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`)
  })

  simulator.start()  // emits events every 3-8 seconds

  req.on('close', () => simulator.stop())
})
```

### Match Simulator

```typescript
// simulator/MatchSimulator.ts
class MatchSimulator {
  // Reads pre-scripted events from events.json
  // Emits them on a timer (3-8 second intervals)
  // Simulates a match playing out in accelerated time
  // For "live" matches, picks up from currentMinute
  // For demo purposes, can replay a full match from minute 0
}
```

---

## Frontend Features

### League Navigation
- **LeagueSidebar:** Vertical list of leagues with icons and country flags
- Click a league → fetches its matches → updates MatchList
- "All" option shows matches across all leagues

### Match List
- **MatchRow:** Compact row showing:
  - Team logos + names
  - Score (bold if live)
  - Status badge: "LIVE 67'" (pulsing green), "FT" (finished), "15:00" (upcoming)
  - Favorite star
- Sorted: live first, then upcoming, then finished

### Match Detail
- Click a MatchRow → opens detail view (replaces or slides over match list)
- Contains all widgets: Scoreboard, Timeline, Commentary, PlayerStats, FormationMap
- For live matches: connects SSE → pushes events into EventBus
- For finished matches: loads all events, widgets render final state

### Favorites
- **FavoriteStar:** Toggle on any MatchRow, calls POST/DELETE to server
- **FavoritesFilter:** Toggle at top of match list, shows only starred matches
- Favorites persist via REST API (stored in memory on server, resets on restart)

### Time Travel (TimeSlider)
- Available on match detail view
- Range slider from 0' to 90' (or current minute for live matches)
- Moving the slider:
  1. Calls `GET /api/matches/:id/events?from=0&to={minute}`
  2. Emits `RESET` event (all widgets clear state)
  3. Replays returned events through EventBus in sequence
  4. All widgets rebuild to show state at that minute
- Scrubbing feels instant — events replay synchronously

---

## Widget Subscriptions

Each widget subscribes only to the events it cares about:

| Widget | Subscribes To | What It Does |
|--------|--------------|-------------|
| Scoreboard | `GOAL_SCORED`, `MATCH_STARTED`, `RESET` | Maintains and displays score |
| MatchClock | `MATCH_STARTED`, `HALF_TIME`, `SECOND_HALF`, `MATCH_ENDED`, `RESET` | Shows current match period/minute |
| Timeline | `*` (all events) | Appends each event to chronological feed with icons |
| Commentary | `*` (all events) | Generates natural-language text for each event |
| PlayerStats | `GOAL_SCORED`, `CARD_GIVEN`, `SUBSTITUTION`, `RESET` | Tracks goals, assists, cards per player |
| FormationMap | `MATCH_STARTED`, `SUBSTITUTION`, `CARD_GIVEN` (red), `RESET` | Visual lineup, shows subs and red cards |
| EventLog | `*` (all events) | Dev tool: raw JSON of every event flowing through bus |

---

## SSE to EventBus Pipeline

```typescript
// api/sse.ts
function connectToMatch(matchId: string): () => void {
  const source = new EventSource(`/api/matches/${matchId}/stream`)

  source.onmessage = (msg) => {
    const event: GameEvent = JSON.parse(msg.data)
    eventBus.emit(event)  // Push into the bus — all widgets react
  }

  // Return cleanup function
  return () => source.close()
}
```

The SSE connection is the only place that knows about the server. Widgets only know about the EventBus.

---

## Tech Stack

- **Server:** Node.js + Express + TypeScript
- **Web:** React 19 + TypeScript + Vite
- **Real-time:** Server-Sent Events (SSE)
- **State:** Each widget manages its own local state via useEvent hook
- **Styling:** CSS modules
- **Proxy:** Vite dev server proxies `/api` to Express

---

## Teaching Moments

1. **Zero coupling** — remove any widget, nothing breaks, no errors
2. **Adding a new widget** = subscribe to events, done. No wiring, no prop changes
3. **EventLog dev tool** makes the invisible visible — students watch events flow in real-time
4. **SSE → EventBus pipeline** — real-time server events flow through the same bus as replayed events
5. **Time travel** proves the architecture: entire UI state rebuilt from events alone
6. **Favorites use REST, not events** — pragmatism: event bus handles real-time game state, REST handles CRUD
7. **League/match switching** tears down SSE and bus subscriptions, reconnects to new match
8. Contrast with prop-drilling: "imagine 6 widgets all needing shared state through props"
