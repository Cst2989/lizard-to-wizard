# Event-Driven — Live Sports Scoreboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a FlashScore-style live sports scoreboard demonstrating event-driven architecture with an Event Bus, SSE real-time updates, time travel, and multi-league navigation

**Architecture:** An EventBus singleton handles all communication between widgets. Server emits match events via SSE. Widgets subscribe to specific event types and maintain their own state. Time travel replays historical events through the same bus, proving the architecture.

**Tech Stack:** Node.js + Express + TypeScript (server), React 19 + TypeScript + Vite (web), SSE for real-time, vitest + supertest + @testing-library/react (testing)

---

## File Structure

```
apps/event-driven/
  server/
    package.json
    tsconfig.json
    vitest.config.ts
    src/
      index.ts                          Express app entry point
      data/
        leagues.json                    4 leagues: PL, La Liga, Serie A, Bundesliga
        matches.json                    8+ matches across leagues (live, finished, upcoming)
        events.json                     Detailed scripted events per match
      routes/
        leagues.ts                      GET /api/leagues
        matches.ts                      GET /api/leagues/:id/matches, GET /api/matches/:id
        events.ts                       GET /api/matches/:id/events?from=0&to=90
        favorites.ts                    GET/POST/DELETE /api/favorites
      routes/__tests__/
        leagues.test.ts
        matches.test.ts
        events.test.ts
        favorites.test.ts
      simulator/
        MatchSimulator.ts               Reads events.json, emits on timer
        __tests__/
          MatchSimulator.test.ts
      app.ts                            Express app (no listen) for testing

  web/
    package.json
    tsconfig.json
    tsconfig.app.json
    tsconfig.node.json
    vite.config.ts
    vitest.config.ts
    index.html
    src/
      main.tsx
      App.tsx
      App.css
      core/
        EventBus.ts                     subscribe, emit, clear (singleton)
        events.ts                       Event type constants
        types.ts                        GameEvent, League, Match, Team interfaces
        useEvent.ts                     Hook: subscribe to event type
        useEmit.ts                      Hook: get emit function
        __tests__/
          EventBus.test.ts
          useEvent.test.ts
          useEmit.test.ts
      api/
        client.ts                       REST calls to server
        sse.ts                          SSE connection, pushes into EventBus
      features/
        leagues/
          LeagueSidebar.tsx
          LeagueHeader.tsx
          __tests__/
            LeagueSidebar.test.tsx
        matches/
          MatchList.tsx
          MatchRow.tsx
          MatchDetail.tsx
          __tests__/
            MatchList.test.tsx
            MatchDetail.test.tsx
        favorites/
          FavoriteStar.tsx
          FavoritesFilter.tsx
          __tests__/
            FavoriteStar.test.tsx
        timeline/
          Timeline.tsx
          TimelineEvent.tsx
          TimeSlider.tsx
          __tests__/
            Timeline.test.tsx
            TimeSlider.test.tsx
      widgets/
        Scoreboard.tsx
        MatchClock.tsx
        Commentary.tsx
        PlayerStats.tsx
        FormationMap.tsx
        EventLog.tsx
        __tests__/
          Scoreboard.test.tsx
          MatchClock.test.tsx
          Commentary.test.tsx
          PlayerStats.test.tsx
          FormationMap.test.tsx
          EventLog.test.tsx
      components/
        Dashboard.tsx
```

---

## Task 1: Server Project Setup

### Step 1.1 — Initialize server project

- [ ] Create the server directory and initialize the project

```bash
mkdir -p apps/event-driven/server/src
cd apps/event-driven/server
npm init -y
npm install express cors
npm install -D typescript @types/express @types/cors @types/node vitest supertest @types/supertest tsx
```

### Step 1.2 — Create tsconfig.json

- [ ] Create `apps/event-driven/server/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "strict": true,
    "outDir": "dist",
    "rootDir": "src",
    "declaration": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src"]
}
```

### Step 1.3 — Create vitest.config.ts

- [ ] Create `apps/event-driven/server/vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
```

### Step 1.4 — Add scripts to package.json

- [ ] Update `apps/event-driven/server/package.json` scripts:

```json
{
  "name": "event-driven-server",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

### Step 1.5 — Commit

- [ ] Commit: `feat(server): initialize server project with Express + TypeScript`

```bash
cd apps/event-driven/server
git add -A
git commit -m "feat(server): initialize server project with Express + TypeScript"
```

---

## Task 2: Mock Data

### Step 2.1 — Create leagues.json

- [ ] Create `apps/event-driven/server/src/data/leagues.json`

```json
[
  { "id": "pl", "name": "Premier League", "country": "England", "icon": "england.png" },
  { "id": "laliga", "name": "La Liga", "country": "Spain", "icon": "spain.png" },
  { "id": "seriea", "name": "Serie A", "country": "Italy", "icon": "italy.png" },
  { "id": "bundes", "name": "Bundesliga", "country": "Germany", "icon": "germany.png" }
]
```

### Step 2.2 — Create matches.json

- [ ] Create `apps/event-driven/server/src/data/matches.json`

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
    "currentMinute": 90,
    "homeScore": 3,
    "awayScore": 2,
    "startTime": "2026-04-06T12:30:00Z"
  },
  {
    "id": "m3",
    "leagueId": "pl",
    "homeTeam": { "name": "Man United", "shortName": "MUN", "logo": "manutd.png" },
    "awayTeam": { "name": "Tottenham", "shortName": "TOT", "logo": "tottenham.png" },
    "status": "upcoming",
    "currentMinute": 0,
    "homeScore": 0,
    "awayScore": 0,
    "startTime": "2026-04-06T17:30:00Z"
  },
  {
    "id": "m4",
    "leagueId": "laliga",
    "homeTeam": { "name": "Real Madrid", "shortName": "RMA", "logo": "realmadrid.png" },
    "awayTeam": { "name": "Barcelona", "shortName": "BAR", "logo": "barcelona.png" },
    "status": "live",
    "currentMinute": 34,
    "homeScore": 0,
    "awayScore": 1,
    "startTime": "2026-04-06T20:00:00Z"
  },
  {
    "id": "m5",
    "leagueId": "laliga",
    "homeTeam": { "name": "Atletico Madrid", "shortName": "ATM", "logo": "atletico.png" },
    "awayTeam": { "name": "Sevilla", "shortName": "SEV", "logo": "sevilla.png" },
    "status": "finished",
    "currentMinute": 90,
    "homeScore": 1,
    "awayScore": 1,
    "startTime": "2026-04-06T18:00:00Z"
  },
  {
    "id": "m6",
    "leagueId": "seriea",
    "homeTeam": { "name": "AC Milan", "shortName": "MIL", "logo": "milan.png" },
    "awayTeam": { "name": "Inter Milan", "shortName": "INT", "logo": "inter.png" },
    "status": "live",
    "currentMinute": 55,
    "homeScore": 1,
    "awayScore": 2,
    "startTime": "2026-04-06T20:45:00Z"
  },
  {
    "id": "m7",
    "leagueId": "seriea",
    "homeTeam": { "name": "Juventus", "shortName": "JUV", "logo": "juventus.png" },
    "awayTeam": { "name": "Napoli", "shortName": "NAP", "logo": "napoli.png" },
    "status": "upcoming",
    "currentMinute": 0,
    "homeScore": 0,
    "awayScore": 0,
    "startTime": "2026-04-06T20:45:00Z"
  },
  {
    "id": "m8",
    "leagueId": "bundes",
    "homeTeam": { "name": "Bayern Munich", "shortName": "BAY", "logo": "bayern.png" },
    "awayTeam": { "name": "Borussia Dortmund", "shortName": "BVB", "logo": "dortmund.png" },
    "status": "finished",
    "currentMinute": 90,
    "homeScore": 4,
    "awayScore": 2,
    "startTime": "2026-04-06T15:30:00Z"
  }
]
```

### Step 2.3 — Create events.json

- [ ] Create `apps/event-driven/server/src/data/events.json`

```json
{
  "m1": [
    { "type": "MATCH_STARTED", "payload": { "homeTeam": "Arsenal", "awayTeam": "Chelsea", "competition": "Premier League" }, "timestamp": 0 },
    { "type": "GOAL_SCORED", "payload": { "player": "Saka", "team": "home", "assist": "Odegaard", "minute": 23 }, "timestamp": 23 },
    { "type": "CARD_GIVEN", "payload": { "player": "Palmer", "team": "away", "card": "yellow", "reason": "Tactical foul", "minute": 31 }, "timestamp": 31 },
    { "type": "HALF_TIME", "payload": { "homeScore": 1, "awayScore": 0 }, "timestamp": 45 },
    { "type": "SECOND_HALF", "payload": {}, "timestamp": 46 },
    { "type": "GOAL_SCORED", "payload": { "player": "Palmer", "team": "away", "assist": "Madueke", "minute": 52 }, "timestamp": 52 },
    { "type": "SUBSTITUTION", "payload": { "teamSide": "away", "playerOut": "Mudryk", "playerIn": "Nkunku", "minute": 58 }, "timestamp": 58 },
    { "type": "GOAL_SCORED", "payload": { "player": "Havertz", "team": "home", "assist": "Saka", "minute": 67 }, "timestamp": 67 },
    { "type": "CARD_GIVEN", "payload": { "player": "Caicedo", "team": "away", "card": "yellow", "reason": "Dissent", "minute": 72 }, "timestamp": 72 },
    { "type": "SUBSTITUTION", "payload": { "teamSide": "home", "playerOut": "Odegaard", "playerIn": "Merino", "minute": 78 }, "timestamp": 78 },
    { "type": "MATCH_ENDED", "payload": { "homeScore": 2, "awayScore": 1, "result": "home_win" }, "timestamp": 90 }
  ],
  "m2": [
    { "type": "MATCH_STARTED", "payload": { "homeTeam": "Liverpool", "awayTeam": "Man City", "competition": "Premier League" }, "timestamp": 0 },
    { "type": "GOAL_SCORED", "payload": { "player": "Salah", "team": "home", "assist": "Alexander-Arnold", "minute": 12 }, "timestamp": 12 },
    { "type": "GOAL_SCORED", "payload": { "player": "Haaland", "team": "away", "assist": "De Bruyne", "minute": 28 }, "timestamp": 28 },
    { "type": "CARD_GIVEN", "payload": { "player": "Rodri", "team": "away", "card": "yellow", "reason": "Late tackle", "minute": 33 }, "timestamp": 33 },
    { "type": "GOAL_SCORED", "payload": { "player": "Diaz", "team": "home", "assist": "Salah", "minute": 41 }, "timestamp": 41 },
    { "type": "HALF_TIME", "payload": { "homeScore": 2, "awayScore": 1 }, "timestamp": 45 },
    { "type": "SECOND_HALF", "payload": {}, "timestamp": 46 },
    { "type": "GOAL_SCORED", "payload": { "player": "Haaland", "team": "away", "assist": "Foden", "minute": 56 }, "timestamp": 56 },
    { "type": "PENALTY", "payload": { "player": "Salah", "team": "home", "scored": true, "minute": 78 }, "timestamp": 78 },
    { "type": "VAR_REVIEW", "payload": { "decision": "penalty_confirmed", "originalCall": "penalty", "minute": 77 }, "timestamp": 77 },
    { "type": "CARD_GIVEN", "payload": { "player": "Walker", "team": "away", "card": "red", "reason": "Denial of goal-scoring opportunity", "minute": 77 }, "timestamp": 77 },
    { "type": "SUBSTITUTION", "payload": { "teamSide": "home", "playerOut": "Diaz", "playerIn": "Gakpo", "minute": 80 }, "timestamp": 80 },
    { "type": "MATCH_ENDED", "payload": { "homeScore": 3, "awayScore": 2, "result": "home_win" }, "timestamp": 90 }
  ],
  "m4": [
    { "type": "MATCH_STARTED", "payload": { "homeTeam": "Real Madrid", "awayTeam": "Barcelona", "competition": "La Liga" }, "timestamp": 0 },
    { "type": "CARD_GIVEN", "payload": { "player": "Tchouameni", "team": "home", "card": "yellow", "reason": "Reckless challenge", "minute": 15 }, "timestamp": 15 },
    { "type": "GOAL_SCORED", "payload": { "player": "Lamine Yamal", "team": "away", "assist": "Pedri", "minute": 22 }, "timestamp": 22 },
    { "type": "VAR_REVIEW", "payload": { "decision": "goal_awarded", "originalCall": "offside", "minute": 22 }, "timestamp": 22 },
    { "type": "CARD_GIVEN", "payload": { "player": "Araujo", "team": "away", "card": "yellow", "reason": "Time wasting", "minute": 30 }, "timestamp": 30 }
  ],
  "m5": [
    { "type": "MATCH_STARTED", "payload": { "homeTeam": "Atletico Madrid", "awayTeam": "Sevilla", "competition": "La Liga" }, "timestamp": 0 },
    { "type": "GOAL_SCORED", "payload": { "player": "Griezmann", "team": "home", "assist": "Morata", "minute": 35 }, "timestamp": 35 },
    { "type": "HALF_TIME", "payload": { "homeScore": 1, "awayScore": 0 }, "timestamp": 45 },
    { "type": "SECOND_HALF", "payload": {}, "timestamp": 46 },
    { "type": "GOAL_SCORED", "payload": { "player": "En-Nesyri", "team": "away", "assist": "Ocampos", "minute": 68 }, "timestamp": 68 },
    { "type": "CARD_GIVEN", "payload": { "player": "Koke", "team": "home", "card": "yellow", "reason": "Persistent fouling", "minute": 75 }, "timestamp": 75 },
    { "type": "MATCH_ENDED", "payload": { "homeScore": 1, "awayScore": 1, "result": "draw" }, "timestamp": 90 }
  ],
  "m6": [
    { "type": "MATCH_STARTED", "payload": { "homeTeam": "AC Milan", "awayTeam": "Inter Milan", "competition": "Serie A" }, "timestamp": 0 },
    { "type": "GOAL_SCORED", "payload": { "player": "Lautaro Martinez", "team": "away", "assist": "Barella", "minute": 18 }, "timestamp": 18 },
    { "type": "GOAL_SCORED", "payload": { "player": "Leao", "team": "home", "assist": "Pulisic", "minute": 33 }, "timestamp": 33 },
    { "type": "HALF_TIME", "payload": { "homeScore": 1, "awayScore": 1 }, "timestamp": 45 },
    { "type": "SECOND_HALF", "payload": {}, "timestamp": 46 },
    { "type": "GOAL_SCORED", "payload": { "player": "Thuram", "team": "away", "assist": "Calhanoglu", "minute": 51 }, "timestamp": 51 },
    { "type": "SUBSTITUTION", "payload": { "teamSide": "home", "playerOut": "Pulisic", "playerIn": "Chukwueze", "minute": 55 }, "timestamp": 55 }
  ],
  "m8": [
    { "type": "MATCH_STARTED", "payload": { "homeTeam": "Bayern Munich", "awayTeam": "Borussia Dortmund", "competition": "Bundesliga" }, "timestamp": 0 },
    { "type": "GOAL_SCORED", "payload": { "player": "Kane", "team": "home", "assist": "Musiala", "minute": 8 }, "timestamp": 8 },
    { "type": "GOAL_SCORED", "payload": { "player": "Brandt", "team": "away", "assist": "Adeyemi", "minute": 21 }, "timestamp": 21 },
    { "type": "GOAL_SCORED", "payload": { "player": "Kane", "team": "home", "assist": "Sane", "minute": 37 }, "timestamp": 37 },
    { "type": "CARD_GIVEN", "payload": { "player": "Schlotterbeck", "team": "away", "card": "yellow", "reason": "Professional foul", "minute": 40 }, "timestamp": 40 },
    { "type": "HALF_TIME", "payload": { "homeScore": 2, "awayScore": 1 }, "timestamp": 45 },
    { "type": "SECOND_HALF", "payload": {}, "timestamp": 46 },
    { "type": "GOAL_SCORED", "payload": { "player": "Musiala", "team": "home", "assist": "Kane", "minute": 58 }, "timestamp": 58 },
    { "type": "GOAL_SCORED", "payload": { "player": "Fullkrug", "team": "away", "assist": "Brandt", "minute": 65 }, "timestamp": 65 },
    { "type": "SUBSTITUTION", "payload": { "teamSide": "home", "playerOut": "Sane", "playerIn": "Coman", "minute": 70 }, "timestamp": 70 },
    { "type": "GOAL_SCORED", "payload": { "player": "Kane", "team": "home", "assist": "Coman", "minute": 82 }, "timestamp": 82 },
    { "type": "CARD_GIVEN", "payload": { "player": "Can", "team": "away", "card": "red", "reason": "Violent conduct", "minute": 85 }, "timestamp": 85 },
    { "type": "MATCH_ENDED", "payload": { "homeScore": 4, "awayScore": 2, "result": "home_win" }, "timestamp": 90 }
  ]
}
```

### Step 2.4 — Commit

- [ ] Commit: `feat(server): add mock data for leagues, matches, and events`

```bash
git add apps/event-driven/server/src/data/
git commit -m "feat(server): add mock data for leagues, matches, and events"
```

---

## Task 3: Leagues & Matches REST Routes

### Step 3.1 — Create Express app factory for testing

- [ ] Create `apps/event-driven/server/src/app.ts`

```typescript
import express from 'express';
import cors from 'cors';
import { leaguesRouter } from './routes/leagues.js';
import { matchesRouter } from './routes/matches.js';
import { eventsRouter } from './routes/events.js';
import { favoritesRouter } from './routes/favorites.js';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use('/api', leaguesRouter);
  app.use('/api', matchesRouter);
  app.use('/api', eventsRouter);
  app.use('/api', favoritesRouter);

  return app;
}
```

> Note: We create this early but routes will be added incrementally. For now, comment out routes that do not exist yet and uncomment as you build them. Alternatively, create stubs. The tests below import individual routers directly via supertest on a mini-app, so this file is not required for tests to pass. It is used in Task 7 for the integration test.

### Step 3.2 — Write leagues route test

- [ ] Create `apps/event-driven/server/src/routes/__tests__/leagues.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';
import { leaguesRouter } from '../leagues.js';

function createTestApp() {
  const app = express();
  app.use('/api', leaguesRouter);
  return app;
}

describe('GET /api/leagues', () => {
  it('returns all leagues', async () => {
    const res = await request(createTestApp()).get('/api/leagues');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(4);
    expect(res.body[0]).toEqual({
      id: 'pl',
      name: 'Premier League',
      country: 'England',
      icon: 'england.png',
    });
  });

  it('each league has id, name, country, icon', async () => {
    const res = await request(createTestApp()).get('/api/leagues');

    for (const league of res.body) {
      expect(league).toHaveProperty('id');
      expect(league).toHaveProperty('name');
      expect(league).toHaveProperty('country');
      expect(league).toHaveProperty('icon');
    }
  });
});
```

### Step 3.3 — Run test (expect fail)

```bash
cd apps/event-driven/server && npx vitest run src/routes/__tests__/leagues.test.ts
# Expected: FAIL — Cannot find module '../leagues.js'
```

### Step 3.4 — Implement leagues route

- [ ] Create `apps/event-driven/server/src/routes/leagues.ts`

```typescript
import { Router } from 'express';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const leagues = require('../data/leagues.json');

export const leaguesRouter = Router();

leaguesRouter.get('/leagues', (_req, res) => {
  res.json(leagues);
});
```

### Step 3.5 — Run test (expect pass)

```bash
cd apps/event-driven/server && npx vitest run src/routes/__tests__/leagues.test.ts
# Expected: PASS
```

### Step 3.6 — Write matches route test

- [ ] Create `apps/event-driven/server/src/routes/__tests__/matches.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';
import { matchesRouter } from '../matches.js';

function createTestApp() {
  const app = express();
  app.use('/api', matchesRouter);
  return app;
}

describe('GET /api/leagues/:id/matches', () => {
  it('returns matches for a specific league', async () => {
    const res = await request(createTestApp()).get('/api/leagues/pl/matches');

    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
    for (const match of res.body) {
      expect(match.leagueId).toBe('pl');
    }
  });

  it('returns empty array for unknown league', async () => {
    const res = await request(createTestApp()).get('/api/leagues/unknown/matches');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe('GET /api/matches/:id', () => {
  it('returns a single match by ID', async () => {
    const res = await request(createTestApp()).get('/api/matches/m1');

    expect(res.status).toBe(200);
    expect(res.body.id).toBe('m1');
    expect(res.body.homeTeam.name).toBe('Arsenal');
    expect(res.body.awayTeam.name).toBe('Chelsea');
  });

  it('returns 404 for unknown match', async () => {
    const res = await request(createTestApp()).get('/api/matches/unknown');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Match not found' });
  });
});
```

### Step 3.7 — Run test (expect fail)

```bash
cd apps/event-driven/server && npx vitest run src/routes/__tests__/matches.test.ts
# Expected: FAIL — Cannot find module '../matches.js'
```

### Step 3.8 — Implement matches route

- [ ] Create `apps/event-driven/server/src/routes/matches.ts`

```typescript
import { Router } from 'express';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const matches = require('../data/matches.json');

export const matchesRouter = Router();

matchesRouter.get('/leagues/:id/matches', (req, res) => {
  const leagueId = req.params.id;
  const leagueMatches = matches.filter(
    (m: { leagueId: string }) => m.leagueId === leagueId
  );
  res.json(leagueMatches);
});

matchesRouter.get('/matches/:id', (req, res) => {
  const match = matches.find((m: { id: string }) => m.id === req.params.id);
  if (!match) {
    return res.status(404).json({ error: 'Match not found' });
  }
  res.json(match);
});
```

### Step 3.9 — Run tests (expect pass)

```bash
cd apps/event-driven/server && npx vitest run src/routes/__tests__/matches.test.ts
# Expected: PASS
```

### Step 3.10 — Commit

- [ ] Commit: `feat(server): add leagues and matches REST routes with tests`

```bash
git add apps/event-driven/server/src/routes/
git commit -m "feat(server): add leagues and matches REST routes with tests"
```

---

## Task 4: Events REST Route

### Step 4.1 — Write events route test

- [ ] Create `apps/event-driven/server/src/routes/__tests__/events.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';
import { eventsRouter } from '../events.js';

function createTestApp() {
  const app = express();
  app.use('/api', eventsRouter);
  return app;
}

describe('GET /api/matches/:id/events', () => {
  it('returns all events for a match', async () => {
    const res = await request(createTestApp()).get('/api/matches/m1/events');

    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].type).toBe('MATCH_STARTED');
  });

  it('filters events by minute range', async () => {
    const res = await request(createTestApp()).get(
      '/api/matches/m1/events?from=0&to=45'
    );

    expect(res.status).toBe(200);
    for (const event of res.body) {
      expect(event.timestamp).toBeLessThanOrEqual(45);
      expect(event.timestamp).toBeGreaterThanOrEqual(0);
    }
  });

  it('returns events up to specified minute', async () => {
    const res = await request(createTestApp()).get(
      '/api/matches/m1/events?from=0&to=30'
    );

    expect(res.status).toBe(200);
    // Should include MATCH_STARTED (0) and GOAL_SCORED (23) but not CARD_GIVEN (31)
    const types = res.body.map((e: { type: string }) => e.type);
    expect(types).toContain('MATCH_STARTED');
    expect(types).toContain('GOAL_SCORED');
    expect(types).not.toContain('CARD_GIVEN');
  });

  it('returns empty array for unknown match', async () => {
    const res = await request(createTestApp()).get('/api/matches/unknown/events');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns events sorted by timestamp', async () => {
    const res = await request(createTestApp()).get('/api/matches/m1/events');

    for (let i = 1; i < res.body.length; i++) {
      expect(res.body[i].timestamp).toBeGreaterThanOrEqual(
        res.body[i - 1].timestamp
      );
    }
  });
});
```

### Step 4.2 — Run test (expect fail)

```bash
cd apps/event-driven/server && npx vitest run src/routes/__tests__/events.test.ts
# Expected: FAIL — Cannot find module '../events.js'
```

### Step 4.3 — Implement events route

- [ ] Create `apps/event-driven/server/src/routes/events.ts`

```typescript
import { Router } from 'express';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const allEvents: Record<string, Array<{ type: string; payload: unknown; timestamp: number }>> =
  require('../data/events.json');

export const eventsRouter = Router();

eventsRouter.get('/matches/:id/events', (req, res) => {
  const matchId = req.params.id;
  const events = allEvents[matchId] ?? [];

  const from = parseInt(req.query.from as string) || 0;
  const to = parseInt(req.query.to as string) || 90;

  const filtered = events
    .filter((e) => e.timestamp >= from && e.timestamp <= to)
    .sort((a, b) => a.timestamp - b.timestamp);

  res.json(filtered);
});
```

### Step 4.4 — Run test (expect pass)

```bash
cd apps/event-driven/server && npx vitest run src/routes/__tests__/events.test.ts
# Expected: PASS
```

### Step 4.5 — Commit

- [ ] Commit: `feat(server): add events REST route with minute range filtering`

```bash
git add apps/event-driven/server/src/routes/events.ts apps/event-driven/server/src/routes/__tests__/events.test.ts
git commit -m "feat(server): add events REST route with minute range filtering"
```

---

## Task 5: Favorites REST Route

### Step 5.1 — Write favorites route test

- [ ] Create `apps/event-driven/server/src/routes/__tests__/favorites.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { favoritesRouter, resetFavorites } from '../favorites.js';

function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use('/api', favoritesRouter);
  return app;
}

describe('Favorites API', () => {
  beforeEach(() => {
    resetFavorites();
  });

  it('GET /api/favorites returns empty array initially', async () => {
    const res = await request(createTestApp()).get('/api/favorites');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('POST /api/favorites/:matchId adds a favorite', async () => {
    const app = createTestApp();

    const postRes = await request(app).post('/api/favorites/m1');
    expect(postRes.status).toBe(201);
    expect(postRes.body).toEqual({ matchId: 'm1' });

    const getRes = await request(app).get('/api/favorites');
    expect(getRes.body).toEqual(['m1']);
  });

  it('POST /api/favorites/:matchId is idempotent', async () => {
    const app = createTestApp();

    await request(app).post('/api/favorites/m1');
    await request(app).post('/api/favorites/m1');

    const res = await request(app).get('/api/favorites');
    expect(res.body).toEqual(['m1']);
  });

  it('DELETE /api/favorites/:matchId removes a favorite', async () => {
    const app = createTestApp();

    await request(app).post('/api/favorites/m1');
    const delRes = await request(app).delete('/api/favorites/m1');
    expect(delRes.status).toBe(200);

    const res = await request(app).get('/api/favorites');
    expect(res.body).toEqual([]);
  });

  it('DELETE /api/favorites/:matchId returns 404 if not found', async () => {
    const res = await request(createTestApp()).delete('/api/favorites/m999');
    expect(res.status).toBe(404);
  });
});
```

### Step 5.2 — Run test (expect fail)

```bash
cd apps/event-driven/server && npx vitest run src/routes/__tests__/favorites.test.ts
# Expected: FAIL — Cannot find module '../favorites.js'
```

### Step 5.3 — Implement favorites route

- [ ] Create `apps/event-driven/server/src/routes/favorites.ts`

```typescript
import { Router } from 'express';

let favorites: Set<string> = new Set();

export function resetFavorites() {
  favorites = new Set();
}

export const favoritesRouter = Router();

favoritesRouter.get('/favorites', (_req, res) => {
  res.json(Array.from(favorites));
});

favoritesRouter.post('/favorites/:matchId', (req, res) => {
  const { matchId } = req.params;
  favorites.add(matchId);
  res.status(201).json({ matchId });
});

favoritesRouter.delete('/favorites/:matchId', (req, res) => {
  const { matchId } = req.params;
  if (!favorites.has(matchId)) {
    return res.status(404).json({ error: 'Favorite not found' });
  }
  favorites.delete(matchId);
  res.json({ matchId });
});
```

### Step 5.4 — Run test (expect pass)

```bash
cd apps/event-driven/server && npx vitest run src/routes/__tests__/favorites.test.ts
# Expected: PASS
```

### Step 5.5 — Commit

- [ ] Commit: `feat(server): add favorites REST route with in-memory storage`

```bash
git add apps/event-driven/server/src/routes/favorites.ts apps/event-driven/server/src/routes/__tests__/favorites.test.ts
git commit -m "feat(server): add favorites REST route with in-memory storage"
```

---

## Task 6: Match Simulator + SSE

### Step 6.1 — Write MatchSimulator test

- [ ] Create `apps/event-driven/server/src/simulator/__tests__/MatchSimulator.test.ts`

```typescript
import { describe, it, expect, vi, afterEach } from 'vitest';
import { MatchSimulator } from '../MatchSimulator.js';

describe('MatchSimulator', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('emits events for a known match', () => {
    const simulator = new MatchSimulator('m1');
    const handler = vi.fn();

    simulator.onEvent(handler);
    vi.useFakeTimers();
    simulator.start();

    // Advance time to trigger first event
    vi.advanceTimersByTime(5000);

    expect(handler).toHaveBeenCalled();
    const firstEvent = handler.mock.calls[0][0];
    expect(firstEvent.type).toBe('MATCH_STARTED');

    simulator.stop();
  });

  it('emits events in timestamp order', () => {
    const simulator = new MatchSimulator('m1');
    const events: Array<{ type: string; timestamp: number }> = [];

    simulator.onEvent((event) => events.push(event));
    vi.useFakeTimers();
    simulator.start();

    // Advance enough to get several events
    vi.advanceTimersByTime(50000);

    for (let i = 1; i < events.length; i++) {
      expect(events[i].timestamp).toBeGreaterThanOrEqual(events[i - 1].timestamp);
    }

    simulator.stop();
  });

  it('stops emitting after stop() is called', () => {
    const simulator = new MatchSimulator('m1');
    const handler = vi.fn();

    simulator.onEvent(handler);
    vi.useFakeTimers();
    simulator.start();
    vi.advanceTimersByTime(5000);

    const countBeforeStop = handler.mock.calls.length;
    simulator.stop();

    vi.advanceTimersByTime(50000);
    expect(handler.mock.calls.length).toBe(countBeforeStop);
  });

  it('emits nothing for unknown match', () => {
    const simulator = new MatchSimulator('unknown');
    const handler = vi.fn();

    simulator.onEvent(handler);
    vi.useFakeTimers();
    simulator.start();
    vi.advanceTimersByTime(50000);

    expect(handler).not.toHaveBeenCalled();
    simulator.stop();
  });

  it('can start from a specific minute', () => {
    const simulator = new MatchSimulator('m1', { fromMinute: 50 });
    const events: Array<{ type: string; timestamp: number }> = [];

    simulator.onEvent((event) => events.push(event));
    vi.useFakeTimers();
    simulator.start();

    vi.advanceTimersByTime(100000);

    for (const event of events) {
      expect(event.timestamp).toBeGreaterThanOrEqual(50);
    }

    simulator.stop();
  });
});
```

### Step 6.2 — Run test (expect fail)

```bash
cd apps/event-driven/server && npx vitest run src/simulator/__tests__/MatchSimulator.test.ts
# Expected: FAIL — Cannot find module '../MatchSimulator.js'
```

### Step 6.3 — Implement MatchSimulator

- [ ] Create `apps/event-driven/server/src/simulator/MatchSimulator.ts`

```typescript
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const allEvents: Record<string, Array<{ type: string; payload: unknown; timestamp: number }>> =
  require('../data/events.json');

interface SimulatorOptions {
  fromMinute?: number;
  intervalMs?: number;
}

type EventHandler = (event: { type: string; payload: unknown; timestamp: number }) => void;

export class MatchSimulator {
  private matchId: string;
  private events: Array<{ type: string; payload: unknown; timestamp: number }>;
  private handlers: EventHandler[] = [];
  private timer: ReturnType<typeof setInterval> | null = null;
  private currentIndex = 0;
  private intervalMs: number;

  constructor(matchId: string, options: SimulatorOptions = {}) {
    this.matchId = matchId;
    this.intervalMs = options.intervalMs ?? 4000;

    const matchEvents = allEvents[matchId] ?? [];
    const fromMinute = options.fromMinute ?? 0;

    this.events = matchEvents
      .filter((e) => e.timestamp >= fromMinute)
      .sort((a, b) => a.timestamp - b.timestamp);
  }

  onEvent(handler: EventHandler): void {
    this.handlers.push(handler);
  }

  start(): void {
    if (this.events.length === 0) return;

    this.timer = setInterval(() => {
      if (this.currentIndex >= this.events.length) {
        this.stop();
        return;
      }

      const event = this.events[this.currentIndex];
      this.handlers.forEach((handler) => handler(event));
      this.currentIndex++;
    }, this.intervalMs);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
```

### Step 6.4 — Run test (expect pass)

```bash
cd apps/event-driven/server && npx vitest run src/simulator/__tests__/MatchSimulator.test.ts
# Expected: PASS
```

### Step 6.5 — Add SSE endpoint to events route

- [ ] Update `apps/event-driven/server/src/routes/events.ts` to add the SSE stream endpoint:

```typescript
import { Router } from 'express';
import { createRequire } from 'module';
import { MatchSimulator } from '../simulator/MatchSimulator.js';

const require = createRequire(import.meta.url);
const allEvents: Record<string, Array<{ type: string; payload: unknown; timestamp: number }>> =
  require('../data/events.json');

export const eventsRouter = Router();

eventsRouter.get('/matches/:id/events', (req, res) => {
  const matchId = req.params.id;
  const events = allEvents[matchId] ?? [];

  const from = parseInt(req.query.from as string) || 0;
  const to = parseInt(req.query.to as string) || 90;

  const filtered = events
    .filter((e) => e.timestamp >= from && e.timestamp <= to)
    .sort((a, b) => a.timestamp - b.timestamp);

  res.json(filtered);
});

eventsRouter.get('/matches/:id/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const matchId = req.params.id;
  const simulator = new MatchSimulator(matchId, { intervalMs: 4000 });

  simulator.onEvent((event) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  });

  simulator.start();

  req.on('close', () => {
    simulator.stop();
  });
});
```

### Step 6.6 — Run all server tests

```bash
cd apps/event-driven/server && npx vitest run
# Expected: all tests PASS
```

### Step 6.7 — Commit

- [ ] Commit: `feat(server): add MatchSimulator and SSE stream endpoint`

```bash
git add apps/event-driven/server/src/simulator/ apps/event-driven/server/src/routes/events.ts
git commit -m "feat(server): add MatchSimulator and SSE stream endpoint"
```

---

## Task 7: Server Entry Point

### Step 7.1 — Create the Express app factory

- [ ] Create `apps/event-driven/server/src/app.ts`

```typescript
import express from 'express';
import cors from 'cors';
import { leaguesRouter } from './routes/leagues.js';
import { matchesRouter } from './routes/matches.js';
import { eventsRouter } from './routes/events.js';
import { favoritesRouter } from './routes/favorites.js';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use('/api', leaguesRouter);
  app.use('/api', matchesRouter);
  app.use('/api', eventsRouter);
  app.use('/api', favoritesRouter);

  return app;
}
```

### Step 7.2 — Create server entry point

- [ ] Create `apps/event-driven/server/src/index.ts`

```typescript
import { createApp } from './app.js';

const app = createApp();
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

### Step 7.3 — Write integration test

- [ ] Create `apps/event-driven/server/src/__tests__/integration.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';

const app = createApp();

describe('Integration: full API', () => {
  it('GET /api/leagues returns leagues', async () => {
    const res = await request(app).get('/api/leagues');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(4);
  });

  it('GET /api/leagues/pl/matches returns Premier League matches', async () => {
    const res = await request(app).get('/api/leagues/pl/matches');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
  });

  it('GET /api/matches/m1 returns Arsenal vs Chelsea', async () => {
    const res = await request(app).get('/api/matches/m1');
    expect(res.status).toBe(200);
    expect(res.body.homeTeam.name).toBe('Arsenal');
  });

  it('GET /api/matches/m1/events returns events', async () => {
    const res = await request(app).get('/api/matches/m1/events');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('favorites workflow: add, get, remove', async () => {
    await request(app).post('/api/favorites/m1');
    const getRes = await request(app).get('/api/favorites');
    expect(getRes.body).toContain('m1');

    await request(app).delete('/api/favorites/m1');
    const afterDelete = await request(app).get('/api/favorites');
    expect(afterDelete.body).not.toContain('m1');
  });
});
```

### Step 7.4 — Run integration test

```bash
cd apps/event-driven/server && npx vitest run src/__tests__/integration.test.ts
# Expected: PASS
```

### Step 7.5 — Commit

- [ ] Commit: `feat(server): add app factory, entry point, and integration tests`

```bash
git add apps/event-driven/server/src/app.ts apps/event-driven/server/src/index.ts apps/event-driven/server/src/__tests__/
git commit -m "feat(server): add app factory, entry point, and integration tests"
```

---

## Task 8: Web Project Setup

### Step 8.1 — Scaffold Vite + React project

- [ ] Create the web project

```bash
cd apps/event-driven
npm create vite@latest web -- --template react-ts
cd web
npm install
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

### Step 8.2 — Configure Vite proxy

- [ ] Update `apps/event-driven/web/vite.config.ts`

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
```

### Step 8.3 — Configure vitest

- [ ] Create `apps/event-driven/web/vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
```

### Step 8.4 — Create test setup file

- [ ] Create `apps/event-driven/web/src/test-setup.ts`

```typescript
import '@testing-library/jest-dom/vitest';
```

### Step 8.5 — Commit

- [ ] Commit: `feat(web): initialize Vite + React + TypeScript project`

```bash
git add apps/event-driven/web/
git commit -m "feat(web): initialize Vite + React + TypeScript project"
```

---

## Task 9: Event Bus Core

### Step 9.1 — Create types

- [ ] Create `apps/event-driven/web/src/core/types.ts`

```typescript
export interface GameEvent<T = any> {
  type: string;
  payload: T;
  timestamp: number;
}

export interface Team {
  name: string;
  shortName: string;
  logo: string;
}

export interface Match {
  id: string;
  leagueId: string;
  homeTeam: Team;
  awayTeam: Team;
  status: 'live' | 'finished' | 'upcoming';
  currentMinute: number;
  homeScore: number;
  awayScore: number;
  startTime: string;
}

export interface League {
  id: string;
  name: string;
  country: string;
  icon: string;
}

export interface GoalPayload {
  player: string;
  team: 'home' | 'away';
  assist: string;
  minute: number;
}

export interface CardPayload {
  player: string;
  team: 'home' | 'away';
  card: 'yellow' | 'red';
  reason: string;
  minute: number;
}

export interface SubstitutionPayload {
  teamSide: 'home' | 'away';
  playerOut: string;
  playerIn: string;
  minute: number;
}

export interface MatchStartedPayload {
  homeTeam: string;
  awayTeam: string;
  competition: string;
}

export interface HalfTimePayload {
  homeScore: number;
  awayScore: number;
}

export interface MatchEndedPayload {
  homeScore: number;
  awayScore: number;
  result: 'home_win' | 'away_win' | 'draw';
}

export interface PenaltyPayload {
  player: string;
  team: 'home' | 'away';
  scored: boolean;
  minute: number;
}

export interface VarReviewPayload {
  decision: string;
  originalCall: string;
  minute: number;
}
```

### Step 9.2 — Create event constants

- [ ] Create `apps/event-driven/web/src/core/events.ts`

```typescript
export const MATCH_STARTED = 'MATCH_STARTED';
export const GOAL_SCORED = 'GOAL_SCORED';
export const CARD_GIVEN = 'CARD_GIVEN';
export const SUBSTITUTION = 'SUBSTITUTION';
export const HALF_TIME = 'HALF_TIME';
export const SECOND_HALF = 'SECOND_HALF';
export const MATCH_ENDED = 'MATCH_ENDED';
export const PENALTY = 'PENALTY';
export const VAR_REVIEW = 'VAR_REVIEW';
export const RESET = 'RESET';

export const ALL_EVENT_TYPES = [
  MATCH_STARTED,
  GOAL_SCORED,
  CARD_GIVEN,
  SUBSTITUTION,
  HALF_TIME,
  SECOND_HALF,
  MATCH_ENDED,
  PENALTY,
  VAR_REVIEW,
  RESET,
] as const;
```

### Step 9.3 — Write EventBus test

- [ ] Create `apps/event-driven/web/src/core/__tests__/EventBus.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventBus } from '../EventBus';
import { GameEvent } from '../types';

describe('EventBus', () => {
  let bus: EventBus;

  beforeEach(() => {
    bus = new EventBus();
  });

  it('calls handler when matching event is emitted', () => {
    const handler = vi.fn();
    bus.subscribe('GOAL_SCORED', handler);

    const event: GameEvent = {
      type: 'GOAL_SCORED',
      payload: { player: 'Saka', team: 'home' },
      timestamp: 23,
    };
    bus.emit(event);

    expect(handler).toHaveBeenCalledWith(event);
  });

  it('does not call handler for non-matching event type', () => {
    const handler = vi.fn();
    bus.subscribe('GOAL_SCORED', handler);

    bus.emit({ type: 'CARD_GIVEN', payload: {}, timestamp: 10 });

    expect(handler).not.toHaveBeenCalled();
  });

  it('supports multiple handlers for the same event type', () => {
    const handler1 = vi.fn();
    const handler2 = vi.fn();
    bus.subscribe('GOAL_SCORED', handler1);
    bus.subscribe('GOAL_SCORED', handler2);

    const event: GameEvent = {
      type: 'GOAL_SCORED',
      payload: {},
      timestamp: 10,
    };
    bus.emit(event);

    expect(handler1).toHaveBeenCalledWith(event);
    expect(handler2).toHaveBeenCalledWith(event);
  });

  it('unsubscribe removes the handler', () => {
    const handler = vi.fn();
    const unsubscribe = bus.subscribe('GOAL_SCORED', handler);

    unsubscribe();
    bus.emit({ type: 'GOAL_SCORED', payload: {}, timestamp: 10 });

    expect(handler).not.toHaveBeenCalled();
  });

  it('unsubscribing one handler does not affect others', () => {
    const handler1 = vi.fn();
    const handler2 = vi.fn();
    const unsub1 = bus.subscribe('GOAL_SCORED', handler1);
    bus.subscribe('GOAL_SCORED', handler2);

    unsub1();
    bus.emit({ type: 'GOAL_SCORED', payload: {}, timestamp: 10 });

    expect(handler1).not.toHaveBeenCalled();
    expect(handler2).toHaveBeenCalled();
  });

  it('clear() emits RESET event', () => {
    const handler = vi.fn();
    bus.subscribe('RESET', handler);

    bus.clear();

    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'RESET' })
    );
  });

  it('clear() does not remove subscriptions', () => {
    const handler = vi.fn();
    bus.subscribe('GOAL_SCORED', handler);

    bus.clear();

    bus.emit({ type: 'GOAL_SCORED', payload: {}, timestamp: 10 });
    expect(handler).toHaveBeenCalled();
  });

  it('supports wildcard * subscription for all events', () => {
    const handler = vi.fn();
    bus.subscribe('*', handler);

    bus.emit({ type: 'GOAL_SCORED', payload: {}, timestamp: 10 });
    bus.emit({ type: 'CARD_GIVEN', payload: {}, timestamp: 20 });

    expect(handler).toHaveBeenCalledTimes(2);
  });

  it('emitting with no subscribers does not throw', () => {
    expect(() => {
      bus.emit({ type: 'UNKNOWN', payload: {}, timestamp: 0 });
    }).not.toThrow();
  });
});
```

### Step 9.4 — Run test (expect fail)

```bash
cd apps/event-driven/web && npx vitest run src/core/__tests__/EventBus.test.ts
# Expected: FAIL — Cannot find module '../EventBus'
```

### Step 9.5 — Implement EventBus

- [ ] Create `apps/event-driven/web/src/core/EventBus.ts`

```typescript
import type { GameEvent } from './types';

type EventHandler<T = any> = (event: GameEvent<T>) => void;

export class EventBus {
  private listeners: Map<string, Set<EventHandler>> = new Map();

  subscribe<T>(eventType: string, handler: EventHandler<T>): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(handler);

    return () => {
      this.listeners.get(eventType)?.delete(handler);
    };
  }

  emit(event: GameEvent): void {
    // Notify specific listeners
    const handlers = this.listeners.get(event.type);
    handlers?.forEach((handler) => handler(event));

    // Notify wildcard listeners
    if (event.type !== '*') {
      const wildcardHandlers = this.listeners.get('*');
      wildcardHandlers?.forEach((handler) => handler(event));
    }
  }

  clear(): void {
    this.emit({ type: 'RESET', payload: {}, timestamp: -1 });
  }
}

// Singleton instance
export const eventBus = new EventBus();
```

### Step 9.6 — Run test (expect pass)

```bash
cd apps/event-driven/web && npx vitest run src/core/__tests__/EventBus.test.ts
# Expected: PASS — all 10 tests pass
```

### Step 9.7 — Commit

- [ ] Commit: `feat(web): implement EventBus core with wildcard support and tests`

```bash
git add apps/event-driven/web/src/core/
git commit -m "feat(web): implement EventBus core with wildcard support and tests"
```

---

## Task 10: React Hooks

### Step 10.1 — Write useEvent test

- [ ] Create `apps/event-driven/web/src/core/__tests__/useEvent.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEvent } from '../useEvent';
import { eventBus } from '../EventBus';

describe('useEvent', () => {
  beforeEach(() => {
    // Reset the singleton by clearing all listeners manually
    // We use a fresh EventBus for isolation in EventBus.test.ts,
    // but hooks depend on the singleton
  });

  it('calls handler when matching event is emitted', () => {
    const handler = vi.fn();
    renderHook(() => useEvent('GOAL_SCORED', handler));

    act(() => {
      eventBus.emit({
        type: 'GOAL_SCORED',
        payload: { player: 'Saka' },
        timestamp: 23,
      });
    });

    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'GOAL_SCORED' })
    );
  });

  it('does not call handler for non-matching event', () => {
    const handler = vi.fn();
    renderHook(() => useEvent('GOAL_SCORED', handler));

    act(() => {
      eventBus.emit({ type: 'CARD_GIVEN', payload: {}, timestamp: 10 });
    });

    expect(handler).not.toHaveBeenCalled();
  });

  it('unsubscribes on unmount', () => {
    const handler = vi.fn();
    const { unmount } = renderHook(() => useEvent('GOAL_SCORED', handler));

    unmount();

    act(() => {
      eventBus.emit({
        type: 'GOAL_SCORED',
        payload: {},
        timestamp: 10,
      });
    });

    expect(handler).not.toHaveBeenCalled();
  });
});
```

### Step 10.2 — Write useEmit test

- [ ] Create `apps/event-driven/web/src/core/__tests__/useEmit.test.ts`

```typescript
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEmit } from '../useEmit';
import { eventBus } from '../EventBus';

describe('useEmit', () => {
  it('returns a stable emit function', () => {
    const { result, rerender } = renderHook(() => useEmit());
    const firstEmit = result.current;

    rerender();
    expect(result.current).toBe(firstEmit);
  });

  it('emit function pushes events into the bus', () => {
    const handler = vi.fn();
    eventBus.subscribe('TEST_EVENT', handler);

    const { result } = renderHook(() => useEmit());

    act(() => {
      result.current({ type: 'TEST_EVENT', payload: { data: 1 }, timestamp: 0 });
    });

    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'TEST_EVENT' })
    );
  });
});
```

### Step 10.3 — Run tests (expect fail)

```bash
cd apps/event-driven/web && npx vitest run src/core/__tests__/useEvent.test.ts src/core/__tests__/useEmit.test.ts
# Expected: FAIL — Cannot find modules
```

### Step 10.4 — Implement useEvent

- [ ] Create `apps/event-driven/web/src/core/useEvent.ts`

```typescript
import { useEffect, useRef } from 'react';
import { eventBus } from './EventBus';
import type { GameEvent } from './types';

export function useEvent<T = any>(
  eventType: string,
  handler: (event: GameEvent<T>) => void
): void {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const unsubscribe = eventBus.subscribe(eventType, (event) => {
      handlerRef.current(event);
    });
    return unsubscribe;
  }, [eventType]);
}
```

### Step 10.5 — Implement useEmit

- [ ] Create `apps/event-driven/web/src/core/useEmit.ts`

```typescript
import { useCallback } from 'react';
import { eventBus } from './EventBus';
import type { GameEvent } from './types';

export function useEmit() {
  return useCallback((event: GameEvent) => {
    eventBus.emit(event);
  }, []);
}
```

### Step 10.6 — Run tests (expect pass)

```bash
cd apps/event-driven/web && npx vitest run src/core/__tests__/useEvent.test.ts src/core/__tests__/useEmit.test.ts
# Expected: PASS
```

### Step 10.7 — Commit

- [ ] Commit: `feat(web): add useEvent and useEmit hooks with tests`

```bash
git add apps/event-driven/web/src/core/useEvent.ts apps/event-driven/web/src/core/useEmit.ts apps/event-driven/web/src/core/__tests__/useEvent.test.ts apps/event-driven/web/src/core/__tests__/useEmit.test.ts
git commit -m "feat(web): add useEvent and useEmit hooks with tests"
```

---

## Task 11: API Client + SSE Client

### Step 11.1 — Create REST API client

- [ ] Create `apps/event-driven/web/src/api/client.ts`

```typescript
import type { League, Match, GameEvent } from '../core/types';

const BASE = '/api';

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(`${BASE}${url}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  return res.json();
}

export async function getLeagues(): Promise<League[]> {
  return fetchJson('/leagues');
}

export async function getMatchesByLeague(leagueId: string): Promise<Match[]> {
  return fetchJson(`/leagues/${leagueId}/matches`);
}

export async function getAllMatches(): Promise<Match[]> {
  const leagues = await getLeagues();
  const all = await Promise.all(
    leagues.map((l) => getMatchesByLeague(l.id))
  );
  return all.flat();
}

export async function getMatch(matchId: string): Promise<Match> {
  return fetchJson(`/matches/${matchId}`);
}

export async function getMatchEvents(
  matchId: string,
  from = 0,
  to = 90
): Promise<GameEvent[]> {
  return fetchJson(`/matches/${matchId}/events?from=${from}&to=${to}`);
}

export async function getFavorites(): Promise<string[]> {
  return fetchJson('/favorites');
}

export async function addFavorite(matchId: string): Promise<void> {
  await fetch(`${BASE}/favorites/${matchId}`, { method: 'POST' });
}

export async function removeFavorite(matchId: string): Promise<void> {
  await fetch(`${BASE}/favorites/${matchId}`, { method: 'DELETE' });
}
```

### Step 11.2 — Create SSE client

- [ ] Create `apps/event-driven/web/src/api/sse.ts`

```typescript
import { eventBus } from '../core/EventBus';
import type { GameEvent } from '../core/types';

export function connectToMatch(matchId: string): () => void {
  const source = new EventSource(`/api/matches/${matchId}/stream`);

  source.onmessage = (msg) => {
    const event: GameEvent = JSON.parse(msg.data);
    eventBus.emit(event);
  };

  source.onerror = () => {
    // Connection lost — browser will auto-reconnect for SSE
    console.warn(`SSE connection error for match ${matchId}`);
  };

  return () => {
    source.close();
  };
}
```

### Step 11.3 — Commit

- [ ] Commit: `feat(web): add REST API client and SSE client`

```bash
git add apps/event-driven/web/src/api/
git commit -m "feat(web): add REST API client and SSE client"
```

---

## Task 12: League Sidebar

### Step 12.1 — Write LeagueSidebar test

- [ ] Create `apps/event-driven/web/src/features/leagues/__tests__/LeagueSidebar.test.tsx`

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LeagueSidebar } from '../LeagueSidebar';
import type { League } from '../../../core/types';

const mockLeagues: League[] = [
  { id: 'pl', name: 'Premier League', country: 'England', icon: 'england.png' },
  { id: 'laliga', name: 'La Liga', country: 'Spain', icon: 'spain.png' },
];

describe('LeagueSidebar', () => {
  it('renders all leagues', () => {
    render(
      <LeagueSidebar
        leagues={mockLeagues}
        selectedLeagueId={null}
        onSelectLeague={vi.fn()}
      />
    );

    expect(screen.getByText('Premier League')).toBeInTheDocument();
    expect(screen.getByText('La Liga')).toBeInTheDocument();
  });

  it('renders "All Leagues" option', () => {
    render(
      <LeagueSidebar
        leagues={mockLeagues}
        selectedLeagueId={null}
        onSelectLeague={vi.fn()}
      />
    );

    expect(screen.getByText('All Leagues')).toBeInTheDocument();
  });

  it('calls onSelectLeague with league id when clicked', async () => {
    const onSelect = vi.fn();
    render(
      <LeagueSidebar
        leagues={mockLeagues}
        selectedLeagueId={null}
        onSelectLeague={onSelect}
      />
    );

    await userEvent.click(screen.getByText('Premier League'));
    expect(onSelect).toHaveBeenCalledWith('pl');
  });

  it('calls onSelectLeague with null when "All Leagues" is clicked', async () => {
    const onSelect = vi.fn();
    render(
      <LeagueSidebar
        leagues={mockLeagues}
        selectedLeagueId="pl"
        onSelectLeague={onSelect}
      />
    );

    await userEvent.click(screen.getByText('All Leagues'));
    expect(onSelect).toHaveBeenCalledWith(null);
  });

  it('highlights selected league', () => {
    render(
      <LeagueSidebar
        leagues={mockLeagues}
        selectedLeagueId="pl"
        onSelectLeague={vi.fn()}
      />
    );

    const plButton = screen.getByText('Premier League').closest('button');
    expect(plButton).toHaveAttribute('aria-selected', 'true');
  });
});
```

### Step 12.2 — Run test (expect fail)

```bash
cd apps/event-driven/web && npx vitest run src/features/leagues/__tests__/LeagueSidebar.test.tsx
# Expected: FAIL — Cannot find module '../LeagueSidebar'
```

### Step 12.3 — Implement LeagueSidebar

- [ ] Create `apps/event-driven/web/src/features/leagues/LeagueSidebar.tsx`

```tsx
import type { League } from '../../core/types';
import { LeagueHeader } from './LeagueHeader';

interface LeagueSidebarProps {
  leagues: League[];
  selectedLeagueId: string | null;
  onSelectLeague: (leagueId: string | null) => void;
}

export function LeagueSidebar({
  leagues,
  selectedLeagueId,
  onSelectLeague,
}: LeagueSidebarProps) {
  return (
    <nav className="league-sidebar" aria-label="Leagues">
      <button
        className={`league-item ${selectedLeagueId === null ? 'selected' : ''}`}
        aria-selected={selectedLeagueId === null}
        onClick={() => onSelectLeague(null)}
      >
        All Leagues
      </button>
      {leagues.map((league) => (
        <button
          key={league.id}
          className={`league-item ${selectedLeagueId === league.id ? 'selected' : ''}`}
          aria-selected={selectedLeagueId === league.id}
          onClick={() => onSelectLeague(league.id)}
        >
          <LeagueHeader league={league} />
        </button>
      ))}
    </nav>
  );
}
```

### Step 12.4 — Implement LeagueHeader

- [ ] Create `apps/event-driven/web/src/features/leagues/LeagueHeader.tsx`

```tsx
import type { League } from '../../core/types';

interface LeagueHeaderProps {
  league: League;
}

export function LeagueHeader({ league }: LeagueHeaderProps) {
  return (
    <span className="league-header">
      <span className="league-name">{league.name}</span>
      <span className="league-country">{league.country}</span>
    </span>
  );
}
```

### Step 12.5 — Run test (expect pass)

```bash
cd apps/event-driven/web && npx vitest run src/features/leagues/__tests__/LeagueSidebar.test.tsx
# Expected: PASS
```

### Step 12.6 — Commit

- [ ] Commit: `feat(web): add LeagueSidebar and LeagueHeader components with tests`

```bash
git add apps/event-driven/web/src/features/leagues/
git commit -m "feat(web): add LeagueSidebar and LeagueHeader components with tests"
```

---

## Task 13: Match List

### Step 13.1 — Write MatchList test

- [ ] Create `apps/event-driven/web/src/features/matches/__tests__/MatchList.test.tsx`

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MatchList } from '../MatchList';
import type { Match } from '../../../core/types';

const mockMatches: Match[] = [
  {
    id: 'm1',
    leagueId: 'pl',
    homeTeam: { name: 'Arsenal', shortName: 'ARS', logo: 'arsenal.png' },
    awayTeam: { name: 'Chelsea', shortName: 'CHE', logo: 'chelsea.png' },
    status: 'live',
    currentMinute: 67,
    homeScore: 2,
    awayScore: 1,
    startTime: '2026-04-06T15:00:00Z',
  },
  {
    id: 'm2',
    leagueId: 'pl',
    homeTeam: { name: 'Liverpool', shortName: 'LIV', logo: 'liverpool.png' },
    awayTeam: { name: 'Man City', shortName: 'MCI', logo: 'mancity.png' },
    status: 'finished',
    currentMinute: 90,
    homeScore: 3,
    awayScore: 2,
    startTime: '2026-04-06T12:30:00Z',
  },
  {
    id: 'm3',
    leagueId: 'pl',
    homeTeam: { name: 'Man United', shortName: 'MUN', logo: 'manutd.png' },
    awayTeam: { name: 'Tottenham', shortName: 'TOT', logo: 'tottenham.png' },
    status: 'upcoming',
    currentMinute: 0,
    homeScore: 0,
    awayScore: 0,
    startTime: '2026-04-06T17:30:00Z',
  },
];

describe('MatchList', () => {
  it('renders all matches', () => {
    render(
      <MatchList
        matches={mockMatches}
        favorites={[]}
        onSelectMatch={vi.fn()}
        onToggleFavorite={vi.fn()}
      />
    );

    expect(screen.getByText('Arsenal')).toBeInTheDocument();
    expect(screen.getByText('Liverpool')).toBeInTheDocument();
    expect(screen.getByText('Man United')).toBeInTheDocument();
  });

  it('sorts matches: live first, then upcoming, then finished', () => {
    render(
      <MatchList
        matches={mockMatches}
        favorites={[]}
        onSelectMatch={vi.fn()}
        onToggleFavorite={vi.fn()}
      />
    );

    const rows = screen.getAllByRole('button', { name: /match/i });
    // Live match (Arsenal) should be first
    expect(rows[0]).toHaveTextContent('Arsenal');
    // Finished match (Liverpool) should be last
    expect(rows[rows.length - 1]).toHaveTextContent('Liverpool');
  });

  it('shows score for live matches', () => {
    render(
      <MatchList
        matches={mockMatches}
        favorites={[]}
        onSelectMatch={vi.fn()}
        onToggleFavorite={vi.fn()}
      />
    );

    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('shows LIVE badge for live matches', () => {
    render(
      <MatchList
        matches={mockMatches}
        favorites={[]}
        onSelectMatch={vi.fn()}
        onToggleFavorite={vi.fn()}
      />
    );

    expect(screen.getByText("67'")).toBeInTheDocument();
  });

  it('shows FT for finished matches', () => {
    render(
      <MatchList
        matches={mockMatches}
        favorites={[]}
        onSelectMatch={vi.fn()}
        onToggleFavorite={vi.fn()}
      />
    );

    expect(screen.getByText('FT')).toBeInTheDocument();
  });

  it('calls onSelectMatch when a match row is clicked', async () => {
    const onSelect = vi.fn();
    render(
      <MatchList
        matches={mockMatches}
        favorites={[]}
        onSelectMatch={onSelect}
        onToggleFavorite={vi.fn()}
      />
    );

    const rows = screen.getAllByRole('button', { name: /match/i });
    await userEvent.click(rows[0]);
    expect(onSelect).toHaveBeenCalledWith('m1');
  });
});
```

### Step 13.2 — Run test (expect fail)

```bash
cd apps/event-driven/web && npx vitest run src/features/matches/__tests__/MatchList.test.tsx
# Expected: FAIL — Cannot find module '../MatchList'
```

### Step 13.3 — Implement MatchRow

- [ ] Create `apps/event-driven/web/src/features/matches/MatchRow.tsx`

```tsx
import type { Match } from '../../core/types';

interface MatchRowProps {
  match: Match;
  isFavorite: boolean;
  onSelect: (matchId: string) => void;
  onToggleFavorite: (matchId: string) => void;
}

function StatusBadge({ match }: { match: Match }) {
  if (match.status === 'live') {
    return <span className="status-badge live">{match.currentMinute}'</span>;
  }
  if (match.status === 'finished') {
    return <span className="status-badge finished">FT</span>;
  }
  const time = new Date(match.startTime).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
  return <span className="status-badge upcoming">{time}</span>;
}

export function MatchRow({
  match,
  isFavorite,
  onSelect,
  onToggleFavorite,
}: MatchRowProps) {
  return (
    <div className="match-row-wrapper">
      <button
        className={`match-row ${match.status}`}
        aria-label={`match ${match.homeTeam.name} vs ${match.awayTeam.name}`}
        onClick={() => onSelect(match.id)}
      >
        <span className="team home">{match.homeTeam.name}</span>
        <span className="score">
          <span>{match.homeScore}</span>
          <span className="score-separator">-</span>
          <span>{match.awayScore}</span>
        </span>
        <span className="team away">{match.awayTeam.name}</span>
        <StatusBadge match={match} />
      </button>
      <button
        className={`favorite-star ${isFavorite ? 'active' : ''}`}
        aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(match.id);
        }}
      >
        {isFavorite ? '\u2605' : '\u2606'}
      </button>
    </div>
  );
}
```

### Step 13.4 — Implement MatchList

- [ ] Create `apps/event-driven/web/src/features/matches/MatchList.tsx`

```tsx
import type { Match } from '../../core/types';
import { MatchRow } from './MatchRow';

interface MatchListProps {
  matches: Match[];
  favorites: string[];
  onSelectMatch: (matchId: string) => void;
  onToggleFavorite: (matchId: string) => void;
}

const STATUS_ORDER: Record<string, number> = {
  live: 0,
  upcoming: 1,
  finished: 2,
};

export function MatchList({
  matches,
  favorites,
  onSelectMatch,
  onToggleFavorite,
}: MatchListProps) {
  const sorted = [...matches].sort(
    (a, b) => (STATUS_ORDER[a.status] ?? 3) - (STATUS_ORDER[b.status] ?? 3)
  );

  return (
    <div className="match-list">
      {sorted.map((match) => (
        <MatchRow
          key={match.id}
          match={match}
          isFavorite={favorites.includes(match.id)}
          onSelect={onSelectMatch}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
}
```

### Step 13.5 — Run test (expect pass)

```bash
cd apps/event-driven/web && npx vitest run src/features/matches/__tests__/MatchList.test.tsx
# Expected: PASS
```

### Step 13.6 — Commit

- [ ] Commit: `feat(web): add MatchList and MatchRow components with tests`

```bash
git add apps/event-driven/web/src/features/matches/
git commit -m "feat(web): add MatchList and MatchRow components with tests"
```

---

## Task 14: Match Detail

### Step 14.1 — Write MatchDetail test

- [ ] Create `apps/event-driven/web/src/features/matches/__tests__/MatchDetail.test.tsx`

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MatchDetail } from '../MatchDetail';
import type { Match, GameEvent } from '../../../core/types';

// Mock the api modules
vi.mock('../../../api/client', () => ({
  getMatchEvents: vi.fn().mockResolvedValue([]),
}));

vi.mock('../../../api/sse', () => ({
  connectToMatch: vi.fn().mockReturnValue(vi.fn()),
}));

const finishedMatch: Match = {
  id: 'm2',
  leagueId: 'pl',
  homeTeam: { name: 'Liverpool', shortName: 'LIV', logo: 'liverpool.png' },
  awayTeam: { name: 'Man City', shortName: 'MCI', logo: 'mancity.png' },
  status: 'finished',
  currentMinute: 90,
  homeScore: 3,
  awayScore: 2,
  startTime: '2026-04-06T12:30:00Z',
};

const liveMatch: Match = {
  id: 'm1',
  leagueId: 'pl',
  homeTeam: { name: 'Arsenal', shortName: 'ARS', logo: 'arsenal.png' },
  awayTeam: { name: 'Chelsea', shortName: 'CHE', logo: 'chelsea.png' },
  status: 'live',
  currentMinute: 67,
  homeScore: 2,
  awayScore: 1,
  startTime: '2026-04-06T15:00:00Z',
};

describe('MatchDetail', () => {
  it('renders match header with team names', () => {
    render(<MatchDetail match={finishedMatch} />);

    expect(screen.getByText('Liverpool')).toBeInTheDocument();
    expect(screen.getByText('Man City')).toBeInTheDocument();
  });

  it('renders widget containers', () => {
    render(<MatchDetail match={finishedMatch} />);

    expect(screen.getByTestId('scoreboard-widget')).toBeInTheDocument();
    expect(screen.getByTestId('timeline-widget')).toBeInTheDocument();
    expect(screen.getByTestId('commentary-widget')).toBeInTheDocument();
  });

  it('renders time slider', () => {
    render(<MatchDetail match={finishedMatch} />);

    expect(screen.getByTestId('time-slider')).toBeInTheDocument();
  });
});
```

### Step 14.2 — Run test (expect fail)

```bash
cd apps/event-driven/web && npx vitest run src/features/matches/__tests__/MatchDetail.test.tsx
# Expected: FAIL — Cannot find module '../MatchDetail'
```

### Step 14.3 — Implement MatchDetail

- [ ] Create `apps/event-driven/web/src/features/matches/MatchDetail.tsx`

```tsx
import { useEffect, useRef } from 'react';
import type { Match } from '../../core/types';
import { eventBus } from '../../core/EventBus';
import { getMatchEvents } from '../../api/client';
import { connectToMatch } from '../../api/sse';
import { Scoreboard } from '../../widgets/Scoreboard';
import { Timeline } from '../../features/timeline/Timeline';
import { Commentary } from '../../widgets/Commentary';
import { MatchClock } from '../../widgets/MatchClock';
import { PlayerStats } from '../../widgets/PlayerStats';
import { FormationMap } from '../../widgets/FormationMap';
import { EventLog } from '../../widgets/EventLog';
import { TimeSlider } from '../../features/timeline/TimeSlider';

interface MatchDetailProps {
  match: Match;
}

export function MatchDetail({ match }: MatchDetailProps) {
  const disconnectRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Clean up previous connection
    disconnectRef.current?.();
    eventBus.clear();

    if (match.status === 'live') {
      // Connect SSE for live matches
      disconnectRef.current = connectToMatch(match.id);
    } else if (match.status === 'finished') {
      // Load all events for finished matches and replay them
      getMatchEvents(match.id).then((events) => {
        events.forEach((event) => eventBus.emit(event));
      });
    }

    return () => {
      disconnectRef.current?.();
      disconnectRef.current = null;
    };
  }, [match.id, match.status]);

  return (
    <div className="match-detail">
      <div className="match-detail-header">
        <span className="team-name home">{match.homeTeam.name}</span>
        <span className="vs">vs</span>
        <span className="team-name away">{match.awayTeam.name}</span>
      </div>

      <div data-testid="scoreboard-widget">
        <Scoreboard homeTeam={match.homeTeam.name} awayTeam={match.awayTeam.name} />
      </div>

      <div data-testid="match-clock-widget">
        <MatchClock />
      </div>

      <div data-testid="time-slider">
        <TimeSlider matchId={match.id} maxMinute={match.status === 'live' ? match.currentMinute : 90} />
      </div>

      <div data-testid="timeline-widget">
        <Timeline />
      </div>

      <div data-testid="commentary-widget">
        <Commentary />
      </div>

      <div data-testid="player-stats-widget">
        <PlayerStats />
      </div>

      <div data-testid="formation-widget">
        <FormationMap match={match} />
      </div>

      <div data-testid="event-log-widget">
        <EventLog />
      </div>
    </div>
  );
}
```

> Note: This component imports widgets that do not exist yet. The test mocks the API modules and the widgets will be created in subsequent tasks. For the test to pass, we need at least stub versions of the widgets. Create them as stubs now and fill them in later tasks, OR defer running this test until all widgets are created. The pragmatic approach: create minimal stubs for each widget in the next step.

### Step 14.4 — Create widget stubs (to be replaced in Tasks 15-22)

Create minimal stubs so MatchDetail can render. Each will be replaced with the full implementation.

- [ ] Create `apps/event-driven/web/src/widgets/Scoreboard.tsx`

```tsx
export function Scoreboard({ homeTeam, awayTeam }: { homeTeam: string; awayTeam: string }) {
  return <div>Scoreboard: {homeTeam} vs {awayTeam}</div>;
}
```

- [ ] Create `apps/event-driven/web/src/widgets/MatchClock.tsx`

```tsx
export function MatchClock() {
  return <div>MatchClock</div>;
}
```

- [ ] Create `apps/event-driven/web/src/widgets/Commentary.tsx`

```tsx
export function Commentary() {
  return <div>Commentary</div>;
}
```

- [ ] Create `apps/event-driven/web/src/widgets/PlayerStats.tsx`

```tsx
export function PlayerStats() {
  return <div>PlayerStats</div>;
}
```

- [ ] Create `apps/event-driven/web/src/widgets/FormationMap.tsx`

```tsx
import type { Match } from '../core/types';
export function FormationMap({ match }: { match: Match }) {
  return <div>FormationMap</div>;
}
```

- [ ] Create `apps/event-driven/web/src/widgets/EventLog.tsx`

```tsx
export function EventLog() {
  return <div>EventLog</div>;
}
```

- [ ] Create `apps/event-driven/web/src/features/timeline/Timeline.tsx`

```tsx
export function Timeline() {
  return <div>Timeline</div>;
}
```

- [ ] Create `apps/event-driven/web/src/features/timeline/TimeSlider.tsx`

```tsx
export function TimeSlider({ matchId, maxMinute }: { matchId: string; maxMinute: number }) {
  return <div>TimeSlider</div>;
}
```

### Step 14.5 — Run test (expect pass)

```bash
cd apps/event-driven/web && npx vitest run src/features/matches/__tests__/MatchDetail.test.tsx
# Expected: PASS
```

### Step 14.6 — Commit

- [ ] Commit: `feat(web): add MatchDetail component with widget stubs`

```bash
git add apps/event-driven/web/src/features/matches/MatchDetail.tsx apps/event-driven/web/src/widgets/ apps/event-driven/web/src/features/timeline/ apps/event-driven/web/src/features/matches/__tests__/MatchDetail.test.tsx
git commit -m "feat(web): add MatchDetail component with widget stubs"
```

---

## Task 15: Scoreboard Widget

### Step 15.1 — Write Scoreboard test

- [ ] Create `apps/event-driven/web/src/widgets/__tests__/Scoreboard.test.tsx`

```tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { Scoreboard } from '../Scoreboard';
import { eventBus } from '../../core/EventBus';

describe('Scoreboard', () => {
  beforeEach(() => {
    eventBus.clear();
  });

  it('renders team names', () => {
    render(<Scoreboard homeTeam="Arsenal" awayTeam="Chelsea" />);

    expect(screen.getByText('Arsenal')).toBeInTheDocument();
    expect(screen.getByText('Chelsea')).toBeInTheDocument();
  });

  it('starts with 0-0 score', () => {
    render(<Scoreboard homeTeam="Arsenal" awayTeam="Chelsea" />);

    const scores = screen.getAllByTestId('score-value');
    expect(scores[0]).toHaveTextContent('0');
    expect(scores[1]).toHaveTextContent('0');
  });

  it('updates home score on GOAL_SCORED for home team', () => {
    render(<Scoreboard homeTeam="Arsenal" awayTeam="Chelsea" />);

    act(() => {
      eventBus.emit({
        type: 'GOAL_SCORED',
        payload: { player: 'Saka', team: 'home', assist: 'Odegaard', minute: 23 },
        timestamp: 23,
      });
    });

    const scores = screen.getAllByTestId('score-value');
    expect(scores[0]).toHaveTextContent('1');
    expect(scores[1]).toHaveTextContent('0');
  });

  it('updates away score on GOAL_SCORED for away team', () => {
    render(<Scoreboard homeTeam="Arsenal" awayTeam="Chelsea" />);

    act(() => {
      eventBus.emit({
        type: 'GOAL_SCORED',
        payload: { player: 'Palmer', team: 'away', assist: 'Madueke', minute: 52 },
        timestamp: 52,
      });
    });

    const scores = screen.getAllByTestId('score-value');
    expect(scores[0]).toHaveTextContent('0');
    expect(scores[1]).toHaveTextContent('1');
  });

  it('accumulates multiple goals', () => {
    render(<Scoreboard homeTeam="Arsenal" awayTeam="Chelsea" />);

    act(() => {
      eventBus.emit({
        type: 'GOAL_SCORED',
        payload: { player: 'Saka', team: 'home', assist: 'Odegaard', minute: 23 },
        timestamp: 23,
      });
      eventBus.emit({
        type: 'GOAL_SCORED',
        payload: { player: 'Havertz', team: 'home', assist: 'Saka', minute: 67 },
        timestamp: 67,
      });
      eventBus.emit({
        type: 'GOAL_SCORED',
        payload: { player: 'Palmer', team: 'away', assist: 'Madueke', minute: 52 },
        timestamp: 52,
      });
    });

    const scores = screen.getAllByTestId('score-value');
    expect(scores[0]).toHaveTextContent('2');
    expect(scores[1]).toHaveTextContent('1');
  });

  it('resets score on RESET event', () => {
    render(<Scoreboard homeTeam="Arsenal" awayTeam="Chelsea" />);

    act(() => {
      eventBus.emit({
        type: 'GOAL_SCORED',
        payload: { player: 'Saka', team: 'home', assist: 'Odegaard', minute: 23 },
        timestamp: 23,
      });
    });

    act(() => {
      eventBus.emit({ type: 'RESET', payload: {}, timestamp: -1 });
    });

    const scores = screen.getAllByTestId('score-value');
    expect(scores[0]).toHaveTextContent('0');
    expect(scores[1]).toHaveTextContent('0');
  });
});
```

### Step 15.2 — Run test (expect fail)

```bash
cd apps/event-driven/web && npx vitest run src/widgets/__tests__/Scoreboard.test.tsx
# Expected: FAIL — current stub doesn't have data-testid or event handling
```

### Step 15.3 — Implement Scoreboard

- [ ] Replace `apps/event-driven/web/src/widgets/Scoreboard.tsx`

```tsx
import { useState, useCallback } from 'react';
import { useEvent } from '../core/useEvent';
import { GOAL_SCORED, RESET } from '../core/events';
import type { GameEvent, GoalPayload } from '../core/types';

interface ScoreboardProps {
  homeTeam: string;
  awayTeam: string;
}

export function Scoreboard({ homeTeam, awayTeam }: ScoreboardProps) {
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);

  useEvent<GoalPayload>(
    GOAL_SCORED,
    useCallback((event: GameEvent<GoalPayload>) => {
      if (event.payload.team === 'home') {
        setHomeScore((s) => s + 1);
      } else {
        setAwayScore((s) => s + 1);
      }
    }, [])
  );

  useEvent(
    RESET,
    useCallback(() => {
      setHomeScore(0);
      setAwayScore(0);
    }, [])
  );

  return (
    <div className="scoreboard">
      <div className="scoreboard-team home">
        <span className="team-name">{homeTeam}</span>
        <span className="score-value" data-testid="score-value">
          {homeScore}
        </span>
      </div>
      <span className="score-separator">-</span>
      <div className="scoreboard-team away">
        <span className="score-value" data-testid="score-value">
          {awayScore}
        </span>
        <span className="team-name">{awayTeam}</span>
      </div>
    </div>
  );
}
```

### Step 15.4 — Run test (expect pass)

```bash
cd apps/event-driven/web && npx vitest run src/widgets/__tests__/Scoreboard.test.tsx
# Expected: PASS
```

### Step 15.5 — Commit

- [ ] Commit: `feat(web): implement Scoreboard widget with GOAL_SCORED and RESET handling`

```bash
git add apps/event-driven/web/src/widgets/Scoreboard.tsx apps/event-driven/web/src/widgets/__tests__/Scoreboard.test.tsx
git commit -m "feat(web): implement Scoreboard widget with GOAL_SCORED and RESET handling"
```

---

## Task 16: Timeline Widget

### Step 16.1 — Write Timeline test

- [ ] Create `apps/event-driven/web/src/features/timeline/__tests__/Timeline.test.tsx`

```tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { Timeline } from '../Timeline';
import { eventBus } from '../../../core/EventBus';

describe('Timeline', () => {
  beforeEach(() => {
    eventBus.clear();
  });

  it('renders empty timeline initially', () => {
    render(<Timeline />);
    expect(screen.getByTestId('timeline')).toBeInTheDocument();
  });

  it('adds event to timeline when event is emitted', () => {
    render(<Timeline />);

    act(() => {
      eventBus.emit({
        type: 'GOAL_SCORED',
        payload: { player: 'Saka', team: 'home', assist: 'Odegaard', minute: 23 },
        timestamp: 23,
      });
    });

    expect(screen.getByText(/Saka/)).toBeInTheDocument();
    expect(screen.getByText(/23'/)).toBeInTheDocument();
  });

  it('renders events in chronological order', () => {
    render(<Timeline />);

    act(() => {
      eventBus.emit({
        type: 'MATCH_STARTED',
        payload: { homeTeam: 'Arsenal', awayTeam: 'Chelsea' },
        timestamp: 0,
      });
      eventBus.emit({
        type: 'GOAL_SCORED',
        payload: { player: 'Saka', team: 'home', assist: 'Odegaard', minute: 23 },
        timestamp: 23,
      });
      eventBus.emit({
        type: 'CARD_GIVEN',
        payload: { player: 'Palmer', team: 'away', card: 'yellow', minute: 31 },
        timestamp: 31,
      });
    });

    const items = screen.getAllByTestId('timeline-event');
    expect(items).toHaveLength(3);
  });

  it('clears events on RESET', () => {
    render(<Timeline />);

    act(() => {
      eventBus.emit({
        type: 'GOAL_SCORED',
        payload: { player: 'Saka', team: 'home', assist: 'Odegaard', minute: 23 },
        timestamp: 23,
      });
    });

    expect(screen.getAllByTestId('timeline-event')).toHaveLength(1);

    act(() => {
      eventBus.emit({ type: 'RESET', payload: {}, timestamp: -1 });
    });

    expect(screen.queryAllByTestId('timeline-event')).toHaveLength(0);
  });

  it('shows appropriate icon for different event types', () => {
    render(<Timeline />);

    act(() => {
      eventBus.emit({
        type: 'GOAL_SCORED',
        payload: { player: 'Saka', team: 'home', assist: 'Odegaard', minute: 23 },
        timestamp: 23,
      });
    });

    expect(screen.getByText('\u26BD')).toBeInTheDocument();
  });
});
```

### Step 16.2 — Run test (expect fail)

```bash
cd apps/event-driven/web && npx vitest run src/features/timeline/__tests__/Timeline.test.tsx
# Expected: FAIL — stub doesn't have the right markup
```

### Step 16.3 — Implement TimelineEvent

- [ ] Create `apps/event-driven/web/src/features/timeline/TimelineEvent.tsx`

```tsx
import type { GameEvent } from '../../core/types';

const EVENT_ICONS: Record<string, string> = {
  MATCH_STARTED: '\uD83C\uDFE0',
  GOAL_SCORED: '\u26BD',
  CARD_GIVEN: '\uD83D\uDFE8',
  SUBSTITUTION: '\uD83D\uDD04',
  HALF_TIME: '\u23F8',
  SECOND_HALF: '\u25B6',
  MATCH_ENDED: '\uD83C\uDFC1',
  PENALTY: '\uD83C\uDFAF',
  VAR_REVIEW: '\uD83D\uDCFA',
};

function formatEventText(event: GameEvent): string {
  const p = event.payload;
  switch (event.type) {
    case 'MATCH_STARTED':
      return `Kick-off! ${p.homeTeam} vs ${p.awayTeam}`;
    case 'GOAL_SCORED':
      return `${p.player} scores!${p.assist ? ` Assist: ${p.assist}` : ''}`;
    case 'CARD_GIVEN':
      return `${p.card === 'red' ? 'Red' : 'Yellow'} card for ${p.player}`;
    case 'SUBSTITUTION':
      return `${p.playerIn} replaces ${p.playerOut}`;
    case 'HALF_TIME':
      return `Half Time: ${p.homeScore} - ${p.awayScore}`;
    case 'SECOND_HALF':
      return 'Second half begins';
    case 'MATCH_ENDED':
      return `Full Time: ${p.homeScore} - ${p.awayScore}`;
    case 'PENALTY':
      return `Penalty ${p.scored ? 'scored' : 'missed'} by ${p.player}`;
    case 'VAR_REVIEW':
      return `VAR: ${p.decision} (was ${p.originalCall})`;
    default:
      return event.type;
  }
}

interface TimelineEventProps {
  event: GameEvent;
}

export function TimelineEvent({ event }: TimelineEventProps) {
  const icon = EVENT_ICONS[event.type] ?? '\u2022';

  return (
    <div className="timeline-event" data-testid="timeline-event">
      <span className="timeline-minute">{event.timestamp}'</span>
      <span className="timeline-icon">{icon}</span>
      <span className="timeline-text">{formatEventText(event)}</span>
    </div>
  );
}
```

### Step 16.4 — Implement Timeline

- [ ] Replace `apps/event-driven/web/src/features/timeline/Timeline.tsx`

```tsx
import { useState, useCallback } from 'react';
import { useEvent } from '../../core/useEvent';
import { RESET } from '../../core/events';
import type { GameEvent } from '../../core/types';
import { TimelineEvent } from './TimelineEvent';

export function Timeline() {
  const [events, setEvents] = useState<GameEvent[]>([]);

  useEvent(
    '*',
    useCallback((event: GameEvent) => {
      if (event.type === 'RESET') {
        setEvents([]);
        return;
      }
      setEvents((prev) => [...prev, event]);
    }, [])
  );

  return (
    <div className="timeline" data-testid="timeline">
      <h3>Match Timeline</h3>
      {events.map((event, index) => (
        <TimelineEvent key={`${event.type}-${event.timestamp}-${index}`} event={event} />
      ))}
    </div>
  );
}
```

### Step 16.5 — Run test (expect pass)

```bash
cd apps/event-driven/web && npx vitest run src/features/timeline/__tests__/Timeline.test.tsx
# Expected: PASS
```

### Step 16.6 — Commit

- [ ] Commit: `feat(web): implement Timeline and TimelineEvent components`

```bash
git add apps/event-driven/web/src/features/timeline/
git commit -m "feat(web): implement Timeline and TimelineEvent components"
```

---

## Task 17: Commentary Widget

### Step 17.1 — Write Commentary test

- [ ] Create `apps/event-driven/web/src/widgets/__tests__/Commentary.test.tsx`

```tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { Commentary } from '../Commentary';
import { eventBus } from '../../core/EventBus';

describe('Commentary', () => {
  beforeEach(() => {
    eventBus.clear();
  });

  it('renders empty commentary initially', () => {
    render(<Commentary />);
    expect(screen.getByTestId('commentary')).toBeInTheDocument();
  });

  it('generates text for GOAL_SCORED', () => {
    render(<Commentary />);

    act(() => {
      eventBus.emit({
        type: 'GOAL_SCORED',
        payload: { player: 'Saka', team: 'home', assist: 'Odegaard', minute: 23 },
        timestamp: 23,
      });
    });

    expect(screen.getByText(/GOAAAL/)).toBeInTheDocument();
    expect(screen.getByText(/Saka/)).toBeInTheDocument();
  });

  it('generates text for CARD_GIVEN', () => {
    render(<Commentary />);

    act(() => {
      eventBus.emit({
        type: 'CARD_GIVEN',
        payload: { player: 'Palmer', team: 'away', card: 'yellow', reason: 'Tactical foul', minute: 31 },
        timestamp: 31,
      });
    });

    expect(screen.getByText(/Palmer/)).toBeInTheDocument();
    expect(screen.getByText(/yellow card/i)).toBeInTheDocument();
  });

  it('generates text for SUBSTITUTION', () => {
    render(<Commentary />);

    act(() => {
      eventBus.emit({
        type: 'SUBSTITUTION',
        payload: { teamSide: 'away', playerOut: 'Mudryk', playerIn: 'Nkunku', minute: 58 },
        timestamp: 58,
      });
    });

    expect(screen.getByText(/Nkunku/)).toBeInTheDocument();
    expect(screen.getByText(/Mudryk/)).toBeInTheDocument();
  });

  it('generates text for HALF_TIME', () => {
    render(<Commentary />);

    act(() => {
      eventBus.emit({
        type: 'HALF_TIME',
        payload: { homeScore: 1, awayScore: 0 },
        timestamp: 45,
      });
    });

    expect(screen.getByText(/half.time/i)).toBeInTheDocument();
  });

  it('generates text for PENALTY', () => {
    render(<Commentary />);

    act(() => {
      eventBus.emit({
        type: 'PENALTY',
        payload: { player: 'Salah', team: 'home', scored: true, minute: 78 },
        timestamp: 78,
      });
    });

    expect(screen.getByText(/Salah/)).toBeInTheDocument();
    expect(screen.getByText(/penalty/i)).toBeInTheDocument();
  });

  it('clears commentary on RESET', () => {
    render(<Commentary />);

    act(() => {
      eventBus.emit({
        type: 'GOAL_SCORED',
        payload: { player: 'Saka', team: 'home', assist: 'Odegaard', minute: 23 },
        timestamp: 23,
      });
    });

    expect(screen.getAllByTestId('commentary-line')).toHaveLength(1);

    act(() => {
      eventBus.emit({ type: 'RESET', payload: {}, timestamp: -1 });
    });

    expect(screen.queryAllByTestId('commentary-line')).toHaveLength(0);
  });
});
```

### Step 17.2 — Run test (expect fail)

```bash
cd apps/event-driven/web && npx vitest run src/widgets/__tests__/Commentary.test.tsx
# Expected: FAIL
```

### Step 17.3 — Implement Commentary

- [ ] Replace `apps/event-driven/web/src/widgets/Commentary.tsx`

```tsx
import { useState, useCallback } from 'react';
import { useEvent } from '../core/useEvent';
import type { GameEvent } from '../core/types';

function generateCommentary(event: GameEvent): string {
  const p = event.payload;
  switch (event.type) {
    case 'MATCH_STARTED':
      return `0' — And we're off! ${p.homeTeam} vs ${p.awayTeam} is underway!`;
    case 'GOAL_SCORED':
      return `${p.minute}' — GOAAAL! ${p.player} finds the back of the net!${p.assist ? ` Great assist from ${p.assist}.` : ''}`;
    case 'CARD_GIVEN':
      return `${p.minute}' — ${p.player} receives a ${p.card} card${p.reason ? ` for ${p.reason.toLowerCase()}` : ''}.`;
    case 'SUBSTITUTION':
      return `${p.minute}' — Substitution: ${p.playerIn} comes on for ${p.playerOut}.`;
    case 'HALF_TIME':
      return `45' — The referee blows for half time. Score: ${p.homeScore} - ${p.awayScore}.`;
    case 'SECOND_HALF':
      return `46' — The second half is underway!`;
    case 'MATCH_ENDED':
      return `90' — Full time! Final score: ${p.homeScore} - ${p.awayScore}.`;
    case 'PENALTY':
      return `${p.minute}' — Penalty! ${p.player} steps up... and ${p.scored ? 'scores!' : 'misses!'}`;
    case 'VAR_REVIEW':
      return `${p.minute}' — VAR review: Decision is ${p.decision} (original call: ${p.originalCall}).`;
    default:
      return `${event.timestamp}' — ${event.type}`;
  }
}

export function Commentary() {
  const [lines, setLines] = useState<Array<{ id: number; text: string }>>([]);

  useEvent(
    '*',
    useCallback((event: GameEvent) => {
      if (event.type === 'RESET') {
        setLines([]);
        return;
      }
      const text = generateCommentary(event);
      setLines((prev) => [...prev, { id: Date.now() + Math.random(), text }]);
    }, [])
  );

  return (
    <div className="commentary" data-testid="commentary">
      <h3>Live Commentary</h3>
      {lines.map((line) => (
        <p key={line.id} className="commentary-line" data-testid="commentary-line">
          {line.text}
        </p>
      ))}
    </div>
  );
}
```

### Step 17.4 — Run test (expect pass)

```bash
cd apps/event-driven/web && npx vitest run src/widgets/__tests__/Commentary.test.tsx
# Expected: PASS
```

### Step 17.5 — Commit

- [ ] Commit: `feat(web): implement Commentary widget with natural language event text`

```bash
git add apps/event-driven/web/src/widgets/Commentary.tsx apps/event-driven/web/src/widgets/__tests__/Commentary.test.tsx
git commit -m "feat(web): implement Commentary widget with natural language event text"
```

---

## Task 18: MatchClock Widget

### Step 18.1 — Write MatchClock test

- [ ] Create `apps/event-driven/web/src/widgets/__tests__/MatchClock.test.tsx`

```tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { MatchClock } from '../MatchClock';
import { eventBus } from '../../core/EventBus';

describe('MatchClock', () => {
  beforeEach(() => {
    eventBus.clear();
  });

  it('shows "Not Started" initially', () => {
    render(<MatchClock />);
    expect(screen.getByText('Not Started')).toBeInTheDocument();
  });

  it('shows "1st Half" after MATCH_STARTED', () => {
    render(<MatchClock />);

    act(() => {
      eventBus.emit({
        type: 'MATCH_STARTED',
        payload: { homeTeam: 'Arsenal', awayTeam: 'Chelsea' },
        timestamp: 0,
      });
    });

    expect(screen.getByText('1st Half')).toBeInTheDocument();
  });

  it('shows "Half Time" after HALF_TIME', () => {
    render(<MatchClock />);

    act(() => {
      eventBus.emit({
        type: 'HALF_TIME',
        payload: { homeScore: 1, awayScore: 0 },
        timestamp: 45,
      });
    });

    expect(screen.getByText('Half Time')).toBeInTheDocument();
  });

  it('shows "2nd Half" after SECOND_HALF', () => {
    render(<MatchClock />);

    act(() => {
      eventBus.emit({
        type: 'SECOND_HALF',
        payload: {},
        timestamp: 46,
      });
    });

    expect(screen.getByText('2nd Half')).toBeInTheDocument();
  });

  it('shows "Full Time" after MATCH_ENDED', () => {
    render(<MatchClock />);

    act(() => {
      eventBus.emit({
        type: 'MATCH_ENDED',
        payload: { homeScore: 2, awayScore: 1, result: 'home_win' },
        timestamp: 90,
      });
    });

    expect(screen.getByText('Full Time')).toBeInTheDocument();
  });

  it('displays the current minute', () => {
    render(<MatchClock />);

    act(() => {
      eventBus.emit({
        type: 'GOAL_SCORED',
        payload: { player: 'Saka', team: 'home', minute: 23 },
        timestamp: 23,
      });
    });

    expect(screen.getByTestId('match-minute')).toHaveTextContent("23'");
  });

  it('resets on RESET event', () => {
    render(<MatchClock />);

    act(() => {
      eventBus.emit({
        type: 'MATCH_STARTED',
        payload: {},
        timestamp: 0,
      });
    });

    act(() => {
      eventBus.emit({ type: 'RESET', payload: {}, timestamp: -1 });
    });

    expect(screen.getByText('Not Started')).toBeInTheDocument();
  });
});
```

### Step 18.2 — Run test (expect fail)

```bash
cd apps/event-driven/web && npx vitest run src/widgets/__tests__/MatchClock.test.tsx
# Expected: FAIL
```

### Step 18.3 — Implement MatchClock

- [ ] Replace `apps/event-driven/web/src/widgets/MatchClock.tsx`

```tsx
import { useState, useCallback } from 'react';
import { useEvent } from '../core/useEvent';
import type { GameEvent } from '../core/types';

type MatchPeriod = 'not_started' | '1st_half' | 'half_time' | '2nd_half' | 'full_time';

const PERIOD_LABELS: Record<MatchPeriod, string> = {
  not_started: 'Not Started',
  '1st_half': '1st Half',
  half_time: 'Half Time',
  '2nd_half': '2nd Half',
  full_time: 'Full Time',
};

export function MatchClock() {
  const [period, setPeriod] = useState<MatchPeriod>('not_started');
  const [minute, setMinute] = useState(0);

  useEvent(
    '*',
    useCallback((event: GameEvent) => {
      switch (event.type) {
        case 'RESET':
          setPeriod('not_started');
          setMinute(0);
          break;
        case 'MATCH_STARTED':
          setPeriod('1st_half');
          setMinute(0);
          break;
        case 'HALF_TIME':
          setPeriod('half_time');
          setMinute(45);
          break;
        case 'SECOND_HALF':
          setPeriod('2nd_half');
          setMinute(46);
          break;
        case 'MATCH_ENDED':
          setPeriod('full_time');
          setMinute(90);
          break;
        default:
          if (event.timestamp >= 0) {
            setMinute(event.timestamp);
          }
          break;
      }
    }, [])
  );

  return (
    <div className="match-clock">
      <span className="match-period">{PERIOD_LABELS[period]}</span>
      {period !== 'not_started' && (
        <span className="match-minute" data-testid="match-minute">
          {minute}'
        </span>
      )}
    </div>
  );
}
```

### Step 18.4 — Run test (expect pass)

```bash
cd apps/event-driven/web && npx vitest run src/widgets/__tests__/MatchClock.test.tsx
# Expected: PASS
```

### Step 18.5 — Commit

- [ ] Commit: `feat(web): implement MatchClock widget with period tracking`

```bash
git add apps/event-driven/web/src/widgets/MatchClock.tsx apps/event-driven/web/src/widgets/__tests__/MatchClock.test.tsx
git commit -m "feat(web): implement MatchClock widget with period tracking"
```

---

## Task 19: PlayerStats Widget

### Step 19.1 — Write PlayerStats test

- [ ] Create `apps/event-driven/web/src/widgets/__tests__/PlayerStats.test.tsx`

```tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { PlayerStats } from '../PlayerStats';
import { eventBus } from '../../core/EventBus';

describe('PlayerStats', () => {
  beforeEach(() => {
    eventBus.clear();
  });

  it('renders empty stats initially', () => {
    render(<PlayerStats />);
    expect(screen.getByTestId('player-stats')).toBeInTheDocument();
  });

  it('tracks goals for a player', () => {
    render(<PlayerStats />);

    act(() => {
      eventBus.emit({
        type: 'GOAL_SCORED',
        payload: { player: 'Saka', team: 'home', assist: 'Odegaard', minute: 23 },
        timestamp: 23,
      });
    });

    expect(screen.getByText('Saka')).toBeInTheDocument();
    const row = screen.getByText('Saka').closest('tr');
    expect(row).toHaveTextContent('1'); // 1 goal
  });

  it('tracks assists for a player', () => {
    render(<PlayerStats />);

    act(() => {
      eventBus.emit({
        type: 'GOAL_SCORED',
        payload: { player: 'Saka', team: 'home', assist: 'Odegaard', minute: 23 },
        timestamp: 23,
      });
    });

    expect(screen.getByText('Odegaard')).toBeInTheDocument();
  });

  it('tracks yellow cards', () => {
    render(<PlayerStats />);

    act(() => {
      eventBus.emit({
        type: 'CARD_GIVEN',
        payload: { player: 'Palmer', team: 'away', card: 'yellow', minute: 31 },
        timestamp: 31,
      });
    });

    expect(screen.getByText('Palmer')).toBeInTheDocument();
    const row = screen.getByText('Palmer').closest('tr');
    expect(row).toHaveTextContent('\uD83D\uDFE8');
  });

  it('tracks red cards', () => {
    render(<PlayerStats />);

    act(() => {
      eventBus.emit({
        type: 'CARD_GIVEN',
        payload: { player: 'Walker', team: 'away', card: 'red', minute: 77 },
        timestamp: 77,
      });
    });

    const row = screen.getByText('Walker').closest('tr');
    expect(row).toHaveTextContent('\uD83D\uDFE5');
  });

  it('accumulates multiple goals for same player', () => {
    render(<PlayerStats />);

    act(() => {
      eventBus.emit({
        type: 'GOAL_SCORED',
        payload: { player: 'Kane', team: 'home', assist: 'Musiala', minute: 8 },
        timestamp: 8,
      });
      eventBus.emit({
        type: 'GOAL_SCORED',
        payload: { player: 'Kane', team: 'home', assist: 'Sane', minute: 37 },
        timestamp: 37,
      });
    });

    const rows = screen.getAllByText('Kane');
    const row = rows[0].closest('tr');
    expect(row).toHaveTextContent('2'); // 2 goals
  });

  it('resets on RESET event', () => {
    render(<PlayerStats />);

    act(() => {
      eventBus.emit({
        type: 'GOAL_SCORED',
        payload: { player: 'Saka', team: 'home', assist: 'Odegaard', minute: 23 },
        timestamp: 23,
      });
    });

    act(() => {
      eventBus.emit({ type: 'RESET', payload: {}, timestamp: -1 });
    });

    expect(screen.queryByText('Saka')).not.toBeInTheDocument();
  });
});
```

### Step 19.2 — Run test (expect fail)

```bash
cd apps/event-driven/web && npx vitest run src/widgets/__tests__/PlayerStats.test.tsx
# Expected: FAIL
```

### Step 19.3 — Implement PlayerStats

- [ ] Replace `apps/event-driven/web/src/widgets/PlayerStats.tsx`

```tsx
import { useState, useCallback } from 'react';
import { useEvent } from '../core/useEvent';
import type { GameEvent } from '../core/types';

interface PlayerStat {
  name: string;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
}

export function PlayerStats() {
  const [stats, setStats] = useState<Map<string, PlayerStat>>(new Map());

  const getOrCreate = useCallback(
    (map: Map<string, PlayerStat>, name: string): PlayerStat => {
      return (
        map.get(name) ?? {
          name,
          goals: 0,
          assists: 0,
          yellowCards: 0,
          redCards: 0,
        }
      );
    },
    []
  );

  useEvent(
    '*',
    useCallback(
      (event: GameEvent) => {
        const p = event.payload;

        if (event.type === 'RESET') {
          setStats(new Map());
          return;
        }

        if (event.type === 'GOAL_SCORED') {
          setStats((prev) => {
            const next = new Map(prev);
            const scorer = getOrCreate(next, p.player);
            scorer.goals += 1;
            next.set(p.player, scorer);

            if (p.assist) {
              const assister = getOrCreate(next, p.assist);
              assister.assists += 1;
              next.set(p.assist, assister);
            }
            return next;
          });
        }

        if (event.type === 'CARD_GIVEN') {
          setStats((prev) => {
            const next = new Map(prev);
            const player = getOrCreate(next, p.player);
            if (p.card === 'yellow') player.yellowCards += 1;
            if (p.card === 'red') player.redCards += 1;
            next.set(p.player, player);
            return next;
          });
        }
      },
      [getOrCreate]
    )
  );

  const players = Array.from(stats.values()).sort(
    (a, b) => b.goals - a.goals || b.assists - a.assists
  );

  return (
    <div className="player-stats" data-testid="player-stats">
      <h3>Player Stats</h3>
      {players.length === 0 ? (
        <p className="no-stats">No player stats yet</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Player</th>
              <th>Goals</th>
              <th>Assists</th>
              <th>Cards</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player) => (
              <tr key={player.name}>
                <td>{player.name}</td>
                <td>{player.goals}</td>
                <td>{player.assists}</td>
                <td>
                  {player.yellowCards > 0 && '\uD83D\uDFE8'.repeat(player.yellowCards)}
                  {player.redCards > 0 && '\uD83D\uDFE5'.repeat(player.redCards)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
```

### Step 19.4 — Run test (expect pass)

```bash
cd apps/event-driven/web && npx vitest run src/widgets/__tests__/PlayerStats.test.tsx
# Expected: PASS
```

### Step 19.5 — Commit

- [ ] Commit: `feat(web): implement PlayerStats widget tracking goals, assists, and cards`

```bash
git add apps/event-driven/web/src/widgets/PlayerStats.tsx apps/event-driven/web/src/widgets/__tests__/PlayerStats.test.tsx
git commit -m "feat(web): implement PlayerStats widget tracking goals, assists, and cards"
```

---

## Task 20: FormationMap Widget

### Step 20.1 — Write FormationMap test

- [ ] Create `apps/event-driven/web/src/widgets/__tests__/FormationMap.test.tsx`

```tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { FormationMap } from '../FormationMap';
import { eventBus } from '../../core/EventBus';
import type { Match } from '../../core/types';

const mockMatch: Match = {
  id: 'm1',
  leagueId: 'pl',
  homeTeam: { name: 'Arsenal', shortName: 'ARS', logo: 'arsenal.png' },
  awayTeam: { name: 'Chelsea', shortName: 'CHE', logo: 'chelsea.png' },
  status: 'live',
  currentMinute: 67,
  homeScore: 2,
  awayScore: 1,
  startTime: '2026-04-06T15:00:00Z',
};

describe('FormationMap', () => {
  beforeEach(() => {
    eventBus.clear();
  });

  it('renders formation container', () => {
    render(<FormationMap match={mockMatch} />);
    expect(screen.getByTestId('formation-map')).toBeInTheDocument();
  });

  it('shows team names', () => {
    render(<FormationMap match={mockMatch} />);
    expect(screen.getByText('Arsenal')).toBeInTheDocument();
    expect(screen.getByText('Chelsea')).toBeInTheDocument();
  });

  it('shows substitution when SUBSTITUTION event emitted', () => {
    render(<FormationMap match={mockMatch} />);

    act(() => {
      eventBus.emit({
        type: 'SUBSTITUTION',
        payload: { teamSide: 'away', playerOut: 'Mudryk', playerIn: 'Nkunku', minute: 58 },
        timestamp: 58,
      });
    });

    expect(screen.getByText(/Nkunku/)).toBeInTheDocument();
    expect(screen.getByText(/Mudryk/)).toBeInTheDocument();
  });

  it('shows red card when red CARD_GIVEN event emitted', () => {
    render(<FormationMap match={mockMatch} />);

    act(() => {
      eventBus.emit({
        type: 'CARD_GIVEN',
        payload: { player: 'Walker', team: 'away', card: 'red', reason: 'Violent conduct', minute: 85 },
        timestamp: 85,
      });
    });

    expect(screen.getByText(/Walker/)).toBeInTheDocument();
    expect(screen.getByText(/\uD83D\uDFE5/)).toBeInTheDocument();
  });

  it('resets changes on RESET event', () => {
    render(<FormationMap match={mockMatch} />);

    act(() => {
      eventBus.emit({
        type: 'SUBSTITUTION',
        payload: { teamSide: 'away', playerOut: 'Mudryk', playerIn: 'Nkunku', minute: 58 },
        timestamp: 58,
      });
    });

    act(() => {
      eventBus.emit({ type: 'RESET', payload: {}, timestamp: -1 });
    });

    expect(screen.queryByText('Nkunku')).not.toBeInTheDocument();
  });
});
```

### Step 20.2 — Run test (expect fail)

```bash
cd apps/event-driven/web && npx vitest run src/widgets/__tests__/FormationMap.test.tsx
# Expected: FAIL
```

### Step 20.3 — Implement FormationMap

- [ ] Replace `apps/event-driven/web/src/widgets/FormationMap.tsx`

```tsx
import { useState, useCallback } from 'react';
import { useEvent } from '../core/useEvent';
import type { GameEvent, Match } from '../core/types';

interface FormationChange {
  id: number;
  type: 'substitution' | 'red_card';
  teamSide: string;
  description: string;
  minute: number;
}

interface FormationMapProps {
  match: Match;
}

export function FormationMap({ match }: FormationMapProps) {
  const [changes, setChanges] = useState<FormationChange[]>([]);

  useEvent(
    '*',
    useCallback((event: GameEvent) => {
      if (event.type === 'RESET') {
        setChanges([]);
        return;
      }

      if (event.type === 'SUBSTITUTION') {
        const p = event.payload;
        setChanges((prev) => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            type: 'substitution',
            teamSide: p.teamSide,
            description: `${p.playerIn} \u2192 ${p.playerOut}`,
            minute: p.minute ?? event.timestamp,
          },
        ]);
      }

      if (event.type === 'CARD_GIVEN' && event.payload.card === 'red') {
        const p = event.payload;
        setChanges((prev) => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            type: 'red_card',
            teamSide: p.team,
            description: `\uD83D\uDFE5 ${p.player}`,
            minute: p.minute ?? event.timestamp,
          },
        ]);
      }
    }, [])
  );

  const homeChanges = changes.filter((c) => c.teamSide === 'home');
  const awayChanges = changes.filter((c) => c.teamSide === 'away');

  return (
    <div className="formation-map" data-testid="formation-map">
      <h3>Formation</h3>
      <div className="formation-teams">
        <div className="formation-side home">
          <h4>{match.homeTeam.name}</h4>
          {homeChanges.map((c) => (
            <div key={c.id} className={`formation-change ${c.type}`}>
              {c.minute}' {c.description}
            </div>
          ))}
        </div>
        <div className="formation-side away">
          <h4>{match.awayTeam.name}</h4>
          {awayChanges.map((c) => (
            <div key={c.id} className={`formation-change ${c.type}`}>
              {c.minute}' {c.description}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### Step 20.4 — Run test (expect pass)

```bash
cd apps/event-driven/web && npx vitest run src/widgets/__tests__/FormationMap.test.tsx
# Expected: PASS
```

### Step 20.5 — Commit

- [ ] Commit: `feat(web): implement FormationMap widget with substitution and red card tracking`

```bash
git add apps/event-driven/web/src/widgets/FormationMap.tsx apps/event-driven/web/src/widgets/__tests__/FormationMap.test.tsx
git commit -m "feat(web): implement FormationMap widget with substitution and red card tracking"
```

---

## Task 21: EventLog Dev Tool

### Step 21.1 — Write EventLog test

- [ ] Create `apps/event-driven/web/src/widgets/__tests__/EventLog.test.tsx`

```tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { EventLog } from '../EventLog';
import { eventBus } from '../../core/EventBus';

describe('EventLog', () => {
  beforeEach(() => {
    eventBus.clear();
  });

  it('renders event log container', () => {
    render(<EventLog />);
    expect(screen.getByTestId('event-log')).toBeInTheDocument();
  });

  it('displays raw JSON of emitted events', () => {
    render(<EventLog />);

    act(() => {
      eventBus.emit({
        type: 'GOAL_SCORED',
        payload: { player: 'Saka', team: 'home' },
        timestamp: 23,
      });
    });

    expect(screen.getByText(/GOAL_SCORED/)).toBeInTheDocument();
    expect(screen.getByText(/Saka/)).toBeInTheDocument();
  });

  it('accumulates multiple events', () => {
    render(<EventLog />);

    act(() => {
      eventBus.emit({
        type: 'GOAL_SCORED',
        payload: { player: 'Saka' },
        timestamp: 23,
      });
      eventBus.emit({
        type: 'CARD_GIVEN',
        payload: { player: 'Palmer' },
        timestamp: 31,
      });
    });

    const entries = screen.getAllByTestId('event-log-entry');
    expect(entries).toHaveLength(2);
  });

  it('clears on RESET', () => {
    render(<EventLog />);

    act(() => {
      eventBus.emit({
        type: 'GOAL_SCORED',
        payload: { player: 'Saka' },
        timestamp: 23,
      });
    });

    act(() => {
      eventBus.emit({ type: 'RESET', payload: {}, timestamp: -1 });
    });

    expect(screen.queryAllByTestId('event-log-entry')).toHaveLength(0);
  });
});
```

### Step 21.2 — Run test (expect fail)

```bash
cd apps/event-driven/web && npx vitest run src/widgets/__tests__/EventLog.test.tsx
# Expected: FAIL
```

### Step 21.3 — Implement EventLog

- [ ] Replace `apps/event-driven/web/src/widgets/EventLog.tsx`

```tsx
import { useState, useCallback } from 'react';
import { useEvent } from '../core/useEvent';
import type { GameEvent } from '../core/types';

export function EventLog() {
  const [entries, setEntries] = useState<GameEvent[]>([]);

  useEvent(
    '*',
    useCallback((event: GameEvent) => {
      if (event.type === 'RESET') {
        setEntries([]);
        return;
      }
      setEntries((prev) => [...prev, event]);
    }, [])
  );

  return (
    <div className="event-log" data-testid="event-log">
      <h3>Event Log (Dev Tool)</h3>
      <div className="event-log-entries">
        {entries.map((entry, index) => (
          <pre
            key={`${entry.type}-${entry.timestamp}-${index}`}
            className="event-log-entry"
            data-testid="event-log-entry"
          >
            {JSON.stringify(entry, null, 2)}
          </pre>
        ))}
      </div>
    </div>
  );
}
```

### Step 21.4 — Run test (expect pass)

```bash
cd apps/event-driven/web && npx vitest run src/widgets/__tests__/EventLog.test.tsx
# Expected: PASS
```

### Step 21.5 — Commit

- [ ] Commit: `feat(web): implement EventLog dev tool widget`

```bash
git add apps/event-driven/web/src/widgets/EventLog.tsx apps/event-driven/web/src/widgets/__tests__/EventLog.test.tsx
git commit -m "feat(web): implement EventLog dev tool widget"
```

---

## Task 22: Time Slider (Time Travel)

### Step 22.1 — Write TimeSlider test

- [ ] Create `apps/event-driven/web/src/features/timeline/__tests__/TimeSlider.test.tsx`

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, fireEvent, waitFor } from '@testing-library/react';
import { TimeSlider } from '../TimeSlider';
import { eventBus } from '../../../core/EventBus';
import * as client from '../../../api/client';

// Mock the API client
vi.mock('../../../api/client', () => ({
  getMatchEvents: vi.fn(),
}));

const mockGetMatchEvents = vi.mocked(client.getMatchEvents);

describe('TimeSlider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    eventBus.clear();
  });

  it('renders a range input', () => {
    render(<TimeSlider matchId="m1" maxMinute={90} />);

    const slider = screen.getByRole('slider');
    expect(slider).toBeInTheDocument();
    expect(slider).toHaveAttribute('min', '0');
    expect(slider).toHaveAttribute('max', '90');
  });

  it('displays current minute label', () => {
    render(<TimeSlider matchId="m1" maxMinute={90} />);

    expect(screen.getByText("0'")).toBeInTheDocument();
  });

  it('fetches events and replays them when slider changes', async () => {
    const mockEvents = [
      { type: 'MATCH_STARTED', payload: { homeTeam: 'Arsenal', awayTeam: 'Chelsea' }, timestamp: 0 },
      { type: 'GOAL_SCORED', payload: { player: 'Saka', team: 'home', assist: 'Odegaard', minute: 23 }, timestamp: 23 },
    ];
    mockGetMatchEvents.mockResolvedValue(mockEvents);

    const emitSpy = vi.fn();
    eventBus.subscribe('*', emitSpy);

    render(<TimeSlider matchId="m1" maxMinute={90} />);

    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '30' } });

    await waitFor(() => {
      expect(mockGetMatchEvents).toHaveBeenCalledWith('m1', 0, 30);
    });

    // Should have emitted RESET + the two events
    await waitFor(() => {
      const types = emitSpy.mock.calls.map((call: any[]) => call[0].type);
      expect(types).toContain('RESET');
      expect(types).toContain('MATCH_STARTED');
      expect(types).toContain('GOAL_SCORED');
    });
  });

  it('updates minute label when slider changes', () => {
    render(<TimeSlider matchId="m1" maxMinute={90} />);

    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '45' } });

    expect(screen.getByText("45'")).toBeInTheDocument();
  });
});
```

### Step 22.2 — Run test (expect fail)

```bash
cd apps/event-driven/web && npx vitest run src/features/timeline/__tests__/TimeSlider.test.tsx
# Expected: FAIL
```

### Step 22.3 — Implement TimeSlider

- [ ] Replace `apps/event-driven/web/src/features/timeline/TimeSlider.tsx`

```tsx
import { useState, useCallback, useRef } from 'react';
import { eventBus } from '../../core/EventBus';
import { getMatchEvents } from '../../api/client';

interface TimeSliderProps {
  matchId: string;
  maxMinute: number;
}

export function TimeSlider({ matchId, maxMinute }: TimeSliderProps) {
  const [minute, setMinute] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const replayToMinute = useCallback(
    async (targetMinute: number) => {
      const events = await getMatchEvents(matchId, 0, targetMinute);

      // Clear all widget state
      eventBus.clear();

      // Replay events synchronously through the bus
      events.forEach((event) => {
        eventBus.emit(event);
      });
    },
    [matchId]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(e.target.value);
      setMinute(value);

      // Debounce the API call
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        replayToMinute(value);
      }, 150);
    },
    [replayToMinute]
  );

  return (
    <div className="time-slider" data-testid="time-slider">
      <label className="time-slider-label">
        Time Travel: <strong>{minute}'</strong>
      </label>
      <input
        type="range"
        min={0}
        max={maxMinute}
        value={minute}
        onChange={handleChange}
        className="time-slider-input"
        aria-label="Match minute"
      />
      <div className="time-slider-range">
        <span>0'</span>
        <span>{maxMinute}'</span>
      </div>
    </div>
  );
}
```

### Step 22.4 — Run test (expect pass)

```bash
cd apps/event-driven/web && npx vitest run src/features/timeline/__tests__/TimeSlider.test.tsx
# Expected: PASS
```

### Step 22.5 — Commit

- [ ] Commit: `feat(web): implement TimeSlider with time travel event replay`

```bash
git add apps/event-driven/web/src/features/timeline/TimeSlider.tsx apps/event-driven/web/src/features/timeline/__tests__/TimeSlider.test.tsx
git commit -m "feat(web): implement TimeSlider with time travel event replay"
```

---

## Task 23: Favorites

### Step 23.1 — Write FavoriteStar test

- [ ] Create `apps/event-driven/web/src/features/favorites/__tests__/FavoriteStar.test.tsx`

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FavoriteStar } from '../FavoriteStar';

describe('FavoriteStar', () => {
  it('renders unfilled star when not a favorite', () => {
    render(
      <FavoriteStar matchId="m1" isFavorite={false} onToggle={vi.fn()} />
    );

    expect(screen.getByText('\u2606')).toBeInTheDocument();
  });

  it('renders filled star when is a favorite', () => {
    render(
      <FavoriteStar matchId="m1" isFavorite={true} onToggle={vi.fn()} />
    );

    expect(screen.getByText('\u2605')).toBeInTheDocument();
  });

  it('calls onToggle with matchId when clicked', async () => {
    const onToggle = vi.fn();
    render(
      <FavoriteStar matchId="m1" isFavorite={false} onToggle={onToggle} />
    );

    await userEvent.click(screen.getByRole('button'));
    expect(onToggle).toHaveBeenCalledWith('m1');
  });

  it('has correct aria-label for favorite state', () => {
    const { rerender } = render(
      <FavoriteStar matchId="m1" isFavorite={false} onToggle={vi.fn()} />
    );
    expect(screen.getByRole('button')).toHaveAttribute(
      'aria-label',
      'Add to favorites'
    );

    rerender(
      <FavoriteStar matchId="m1" isFavorite={true} onToggle={vi.fn()} />
    );
    expect(screen.getByRole('button')).toHaveAttribute(
      'aria-label',
      'Remove from favorites'
    );
  });
});
```

### Step 23.2 — Run test (expect fail)

```bash
cd apps/event-driven/web && npx vitest run src/features/favorites/__tests__/FavoriteStar.test.tsx
# Expected: FAIL — Cannot find module '../FavoriteStar'
```

### Step 23.3 — Implement FavoriteStar

- [ ] Create `apps/event-driven/web/src/features/favorites/FavoriteStar.tsx`

```tsx
interface FavoriteStarProps {
  matchId: string;
  isFavorite: boolean;
  onToggle: (matchId: string) => void;
}

export function FavoriteStar({ matchId, isFavorite, onToggle }: FavoriteStarProps) {
  return (
    <button
      className={`favorite-star ${isFavorite ? 'active' : ''}`}
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      onClick={() => onToggle(matchId)}
    >
      {isFavorite ? '\u2605' : '\u2606'}
    </button>
  );
}
```

### Step 23.4 — Implement FavoritesFilter

- [ ] Create `apps/event-driven/web/src/features/favorites/FavoritesFilter.tsx`

```tsx
interface FavoritesFilterProps {
  isActive: boolean;
  onToggle: () => void;
  count: number;
}

export function FavoritesFilter({ isActive, onToggle, count }: FavoritesFilterProps) {
  return (
    <button
      className={`favorites-filter ${isActive ? 'active' : ''}`}
      onClick={onToggle}
      aria-pressed={isActive}
    >
      {isActive ? '\u2605' : '\u2606'} Favorites ({count})
    </button>
  );
}
```

### Step 23.5 — Run test (expect pass)

```bash
cd apps/event-driven/web && npx vitest run src/features/favorites/__tests__/FavoriteStar.test.tsx
# Expected: PASS
```

### Step 23.6 — Commit

- [ ] Commit: `feat(web): add FavoriteStar and FavoritesFilter components`

```bash
git add apps/event-driven/web/src/features/favorites/
git commit -m "feat(web): add FavoriteStar and FavoritesFilter components"
```

---

## Task 24: Dashboard Layout & App Wiring

### Step 24.1 — Create Dashboard component

- [ ] Create `apps/event-driven/web/src/components/Dashboard.tsx`

```tsx
import { useState, useEffect, useCallback } from 'react';
import type { League, Match } from '../core/types';
import {
  getLeagues,
  getMatchesByLeague,
  getAllMatches,
  getFavorites,
  addFavorite,
  removeFavorite,
} from '../api/client';
import { LeagueSidebar } from '../features/leagues/LeagueSidebar';
import { MatchList } from '../features/matches/MatchList';
import { MatchDetail } from '../features/matches/MatchDetail';
import { FavoritesFilter } from '../features/favorites/FavoritesFilter';

export function Dashboard() {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedLeagueId, setSelectedLeagueId] = useState<string | null>(null);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Load leagues on mount
  useEffect(() => {
    getLeagues().then(setLeagues);
    getFavorites().then(setFavorites);
  }, []);

  // Load matches when league changes
  useEffect(() => {
    if (selectedLeagueId) {
      getMatchesByLeague(selectedLeagueId).then(setMatches);
    } else {
      getAllMatches().then(setMatches);
    }
  }, [selectedLeagueId]);

  const handleToggleFavorite = useCallback(
    async (matchId: string) => {
      if (favorites.includes(matchId)) {
        await removeFavorite(matchId);
        setFavorites((prev) => prev.filter((id) => id !== matchId));
      } else {
        await addFavorite(matchId);
        setFavorites((prev) => [...prev, matchId]);
      }
    },
    [favorites]
  );

  const displayedMatches = showFavoritesOnly
    ? matches.filter((m) => favorites.includes(m.id))
    : matches;

  const selectedMatch = matches.find((m) => m.id === selectedMatchId) ?? null;

  return (
    <div className="dashboard">
      <aside className="dashboard-sidebar">
        <LeagueSidebar
          leagues={leagues}
          selectedLeagueId={selectedLeagueId}
          onSelectLeague={(id) => {
            setSelectedLeagueId(id);
            setSelectedMatchId(null);
          }}
        />
      </aside>

      <main className="dashboard-main">
        <div className="dashboard-toolbar">
          <FavoritesFilter
            isActive={showFavoritesOnly}
            onToggle={() => setShowFavoritesOnly((v) => !v)}
            count={favorites.length}
          />
        </div>

        {selectedMatch ? (
          <div className="dashboard-detail">
            <button
              className="back-button"
              onClick={() => setSelectedMatchId(null)}
            >
              &larr; Back to matches
            </button>
            <MatchDetail match={selectedMatch} />
          </div>
        ) : (
          <MatchList
            matches={displayedMatches}
            favorites={favorites}
            onSelectMatch={setSelectedMatchId}
            onToggleFavorite={handleToggleFavorite}
          />
        )}
      </main>
    </div>
  );
}
```

### Step 24.2 — Wire App.tsx

- [ ] Replace `apps/event-driven/web/src/App.tsx`

```tsx
import { Dashboard } from './components/Dashboard';
import './App.css';

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Live Scoreboard</h1>
        <p className="app-subtitle">Event-Driven Architecture Demo</p>
      </header>
      <Dashboard />
    </div>
  );
}

export default App;
```

### Step 24.3 — Add base styles

- [ ] Replace `apps/event-driven/web/src/App.css`

```css
/* Reset & base */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #0a0e17;
  color: #e0e0e0;
}

.app {
  min-height: 100vh;
}

/* Header */
.app-header {
  background: #141a26;
  padding: 16px 24px;
  border-bottom: 2px solid #1e90ff;
}

.app-header h1 {
  font-size: 1.5rem;
  color: #fff;
}

.app-subtitle {
  font-size: 0.85rem;
  color: #888;
  margin-top: 2px;
}

/* Dashboard Layout */
.dashboard {
  display: flex;
  min-height: calc(100vh - 80px);
}

.dashboard-sidebar {
  width: 220px;
  background: #111822;
  border-right: 1px solid #1c2538;
  padding: 16px 0;
  flex-shrink: 0;
}

.dashboard-main {
  flex: 1;
  padding: 16px 24px;
  overflow-y: auto;
}

.dashboard-toolbar {
  margin-bottom: 16px;
}

/* League Sidebar */
.league-sidebar {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.league-item {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  border: none;
  background: transparent;
  color: #ccc;
  cursor: pointer;
  text-align: left;
  width: 100%;
  font-size: 0.9rem;
  transition: background 0.15s;
}

.league-item:hover {
  background: #1c2538;
}

.league-item.selected,
.league-item[aria-selected='true'] {
  background: #1e3a5f;
  color: #fff;
  border-left: 3px solid #1e90ff;
}

.league-header {
  display: flex;
  flex-direction: column;
}

.league-country {
  font-size: 0.75rem;
  color: #888;
}

/* Match List */
.match-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.match-row-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.match-row {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr auto 1fr auto;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #141a26;
  border: 1px solid #1c2538;
  border-radius: 6px;
  color: #e0e0e0;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.15s;
}

.match-row:hover {
  background: #1c2538;
}

.match-row.live {
  border-left: 3px solid #00e676;
}

.team.away {
  text-align: right;
}

.score {
  font-weight: 700;
  font-size: 1.1rem;
  display: flex;
  gap: 6px;
}

.score-separator {
  color: #555;
}

.status-badge {
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 600;
}

.status-badge.live {
  background: #00e676;
  color: #000;
  animation: pulse 1.5s infinite;
}

.status-badge.finished {
  background: #555;
  color: #ccc;
}

.status-badge.upcoming {
  background: #1e3a5f;
  color: #8bb4e0;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

/* Favorite */
.favorite-star {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #555;
  padding: 4px;
}

.favorite-star.active {
  color: #ffd700;
}

.favorites-filter {
  background: #1c2538;
  border: 1px solid #2a3650;
  color: #ccc;
  padding: 6px 14px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
}

.favorites-filter.active {
  background: #1e3a5f;
  border-color: #1e90ff;
  color: #ffd700;
}

/* Match Detail */
.match-detail {
  max-width: 800px;
}

.match-detail-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 20px;
  font-size: 1.3rem;
  font-weight: 700;
}

.vs {
  color: #555;
  font-weight: 400;
}

.back-button {
  background: none;
  border: none;
  color: #1e90ff;
  cursor: pointer;
  font-size: 0.9rem;
  margin-bottom: 12px;
}

/* Scoreboard */
.scoreboard {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 24px;
  background: #141a26;
  border-radius: 8px;
  margin-bottom: 16px;
}

.scoreboard-team {
  display: flex;
  align-items: center;
  gap: 12px;
}

.score-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #fff;
}

/* Match Clock */
.match-clock {
  text-align: center;
  padding: 8px;
  font-size: 1rem;
  color: #888;
  margin-bottom: 16px;
}

.match-minute {
  margin-left: 8px;
  color: #00e676;
  font-weight: 700;
}

/* Time Slider */
.time-slider {
  background: #141a26;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.time-slider-label {
  display: block;
  margin-bottom: 8px;
  font-size: 0.9rem;
  color: #ccc;
}

.time-slider-input {
  width: 100%;
  accent-color: #1e90ff;
}

.time-slider-range {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #666;
  margin-top: 4px;
}

/* Timeline */
.timeline {
  background: #141a26;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.timeline h3 {
  margin-bottom: 12px;
  font-size: 1rem;
}

.timeline-event {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 0;
  border-bottom: 1px solid #1c2538;
  font-size: 0.85rem;
}

.timeline-minute {
  color: #888;
  min-width: 30px;
  text-align: right;
}

.timeline-icon {
  font-size: 1.1rem;
}

/* Commentary */
.commentary {
  background: #141a26;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.commentary h3 {
  margin-bottom: 12px;
  font-size: 1rem;
}

.commentary-line {
  padding: 6px 0;
  border-bottom: 1px solid #1c2538;
  font-size: 0.85rem;
  line-height: 1.5;
}

/* Player Stats */
.player-stats {
  background: #141a26;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.player-stats h3 {
  margin-bottom: 12px;
  font-size: 1rem;
}

.player-stats table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.player-stats th,
.player-stats td {
  padding: 6px 10px;
  text-align: left;
  border-bottom: 1px solid #1c2538;
}

.player-stats th {
  color: #888;
  font-weight: 600;
}

.no-stats {
  color: #555;
  font-style: italic;
}

/* Formation Map */
.formation-map {
  background: #141a26;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.formation-map h3 {
  margin-bottom: 12px;
  font-size: 1rem;
}

.formation-teams {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.formation-side h4 {
  margin-bottom: 8px;
  font-size: 0.9rem;
}

.formation-change {
  font-size: 0.8rem;
  padding: 4px 0;
  color: #aaa;
}

/* Event Log */
.event-log {
  background: #0d1117;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  border: 1px solid #1c2538;
}

.event-log h3 {
  margin-bottom: 12px;
  font-size: 1rem;
  color: #1e90ff;
}

.event-log-entry {
  background: #141a26;
  padding: 8px;
  border-radius: 4px;
  margin-bottom: 4px;
  font-size: 0.75rem;
  font-family: 'Fira Code', 'Consolas', monospace;
  color: #8bb4e0;
  overflow-x: auto;
}
```

### Step 24.4 — Update main.tsx

- [ ] Replace `apps/event-driven/web/src/main.tsx`

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

### Step 24.5 — Run all web tests

```bash
cd apps/event-driven/web && npx vitest run
# Expected: all tests PASS
```

### Step 24.6 — Commit

- [ ] Commit: `feat(web): add Dashboard layout, App wiring, and base styles`

```bash
git add apps/event-driven/web/src/components/ apps/event-driven/web/src/App.tsx apps/event-driven/web/src/App.css apps/event-driven/web/src/main.tsx
git commit -m "feat(web): add Dashboard layout, App wiring, and base styles"
```

---

## Widget Subscription Reference

| Widget | Subscribes To | Resets On |
|--------|--------------|-----------|
| Scoreboard | `GOAL_SCORED` | `RESET` |
| MatchClock | `*` (reads `MATCH_STARTED`, `HALF_TIME`, `SECOND_HALF`, `MATCH_ENDED` + minute from any event) | `RESET` |
| Timeline | `*` (all events) | `RESET` |
| Commentary | `*` (all events) | `RESET` |
| PlayerStats | `*` (reads `GOAL_SCORED`, `CARD_GIVEN`) | `RESET` |
| FormationMap | `*` (reads `SUBSTITUTION`, `CARD_GIVEN` red) | `RESET` |
| EventLog | `*` (all events) | `RESET` |
| TimeSlider | N/A (emits `RESET`, replays events) | N/A |

## Event Type Constants

Used consistently across all files:

| Constant | Value |
|----------|-------|
| `MATCH_STARTED` | `'MATCH_STARTED'` |
| `GOAL_SCORED` | `'GOAL_SCORED'` |
| `CARD_GIVEN` | `'CARD_GIVEN'` |
| `SUBSTITUTION` | `'SUBSTITUTION'` |
| `HALF_TIME` | `'HALF_TIME'` |
| `SECOND_HALF` | `'SECOND_HALF'` |
| `MATCH_ENDED` | `'MATCH_ENDED'` |
| `PENALTY` | `'PENALTY'` |
| `VAR_REVIEW` | `'VAR_REVIEW'` |
| `RESET` | `'RESET'` |

## GameEvent Interface

Used consistently in both server and client:

```typescript
interface GameEvent<T = any> {
  type: string;
  payload: T;
  timestamp: number;  // match minute (0-90), -1 for RESET
}
```
