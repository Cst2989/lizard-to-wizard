# BFF — Travel Booking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a travel booking app demonstrating the Backend for Frontend pattern with a real Node/Express server aggregating multiple inconsistent mock APIs

**Architecture:** Express server hosts mock "external" APIs (flights, hotels, weather) each with intentionally different response formats. A BFF layer aggregates them in parallel, normalizes data, and returns one clean UI-shaped response. React frontend makes a single call and renders.

**Tech Stack:** Node.js + Express + TypeScript (server), React 19 + TypeScript + Vite (web), vitest + supertest (testing)

---

## File Structure

```
apps/bff/
  server/
    package.json                          Node project with Express, vitest, supertest
    tsconfig.json                         TypeScript config for Node
    vitest.config.ts                      Vitest config
    src/
      index.ts                            Express app entry: mounts mock APIs + BFF routes + CORS
      data/
        flights.json                      5 destinations, camelCase, cents, nested segments
        hotels.json                       5 destinations, snake_case, string prices, DD-MM-YYYY
        weather.json                      5 destinations, Kelvin temps, unix timestamps, m/s wind
        currencies.json                   EUR→USD, GBP→USD, JPY→USD exchange rates
      mock-apis/
        flightsApi.ts                     GET /external/flights — camelCase response
        flightsApi.test.ts                supertest tests
        hotelsApi.ts                      GET /external/hotels — snake_case response
        hotelsApi.test.ts                 supertest tests
        weatherApi.ts                     GET /external/weather — Kelvin/unix response
        weatherApi.test.ts                supertest tests
      services/
        types.ts                          Raw types: FlightRawResponse, HotelRawResponse, WeatherRawResponse
        flightsService.ts                 Fetches /external/flights
        flightsService.test.ts            Tests
        hotelsService.ts                  Fetches /external/hotels
        hotelsService.test.ts             Tests
        weatherService.ts                 Fetches /external/weather
        weatherService.test.ts            Tests
        currencyService.ts                Currency conversion using rates
        currencyService.test.ts           Tests
      bff/
        types.ts                          Clean UI types: TripSummary, FlightOption, HotelOption, DayForecast
        tripAggregator.ts                 BFF core: parallel fetch + normalize + aggregate
        tripAggregator.test.ts            Tests
        tripController.ts                 GET /api/trip route
        tripController.test.ts            Tests

  web/
    package.json                          Vite + React 19
    tsconfig.json
    tsconfig.app.json
    tsconfig.node.json
    vite.config.ts                        Proxy /api and /external to Express server
    index.html
    src/
      main.tsx
      App.tsx                             SearchForm -> fetch -> TripSummary flow
      App.test.tsx
      App.css
      api/
        client.ts                         Single fetch to /api/trip
        types.ts                          Mirrors server BFF types
      components/
        SearchForm.tsx
        SearchForm.test.tsx
        TripSummary.tsx
        TripSummary.test.tsx
        FlightCard.tsx
        FlightCard.test.tsx
        HotelCard.tsx
        HotelCard.test.tsx
        WeatherBadge.tsx
        WeatherBadge.test.tsx
        PriceBreakdown.tsx
        PriceBreakdown.test.tsx
        LoadingStates.tsx
        LoadingStates.test.tsx
```

---

## Task 1: Server Project Setup

- [ ] **Step 1.1** Create project directory and initialize package.json

```bash
mkdir -p apps/bff/server/src
cd apps/bff/server
npm init -y
```

- [ ] **Step 1.2** Install dependencies

```bash
cd apps/bff/server
npm install express cors
npm install -D typescript @types/express @types/cors @types/node ts-node-dev vitest supertest @types/supertest
```

- [ ] **Step 1.3** Create `apps/bff/server/tsconfig.json`

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
    "resolveJsonModule": true,
    "declaration": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src"]
}
```

- [ ] **Step 1.4** Create `apps/bff/server/vitest.config.ts`

```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
```

- [ ] **Step 1.5** Update `apps/bff/server/package.json` scripts

Replace the `"scripts"` block with:

```json
{
  "name": "bff-server",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "ts-node-dev --esm --respawn src/index.ts",
    "build": "tsc",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

Keep the dependencies that npm install added.

- [ ] **Step 1.6** Run test command to verify setup

```bash
cd apps/bff/server
npx vitest run
```

Expected: `No test files found` (no error — vitest is configured correctly).

- [ ] **Step 1.7** Commit

```bash
git add apps/bff/server/
git commit -m "feat(bff): initialize server project with Express + TypeScript + vitest"
```

---

## Task 2: Mock Data Files

- [ ] **Step 2.1** Create `apps/bff/server/src/data/flights.json`

```json
{
  "PAR": {
    "outbound": [
      {
        "flightId": "AA-1234",
        "airline": "American Airlines",
        "departureTime": "2026-06-01T08:30:00Z",
        "arrivalTime": "2026-06-01T20:45:00Z",
        "priceInCents": 45000,
        "currency": "USD",
        "segments": [
          { "from": "JFK", "to": "CDG", "duration": "7h15m", "aircraft": "B777" }
        ],
        "cabinClass": "economy",
        "seatsRemaining": 12
      },
      {
        "flightId": "DL-2200",
        "airline": "Delta",
        "departureTime": "2026-06-01T14:00:00Z",
        "arrivalTime": "2026-06-02T02:30:00Z",
        "priceInCents": 38500,
        "currency": "USD",
        "segments": [
          { "from": "JFK", "to": "CDG", "duration": "7h30m", "aircraft": "A330" }
        ],
        "cabinClass": "economy",
        "seatsRemaining": 23
      }
    ],
    "return": [
      {
        "flightId": "AF-5678",
        "airline": "Air France",
        "departureTime": "2026-06-07T10:00:00Z",
        "arrivalTime": "2026-06-07T12:30:00Z",
        "priceInCents": 52000,
        "currency": "EUR",
        "segments": [
          { "from": "CDG", "to": "JFK", "duration": "8h30m", "aircraft": "A350" }
        ],
        "cabinClass": "economy",
        "seatsRemaining": 5
      }
    ]
  },
  "TYO": {
    "outbound": [
      {
        "flightId": "JL-0012",
        "airline": "Japan Airlines",
        "departureTime": "2026-06-01T11:00:00Z",
        "arrivalTime": "2026-06-02T14:00:00Z",
        "priceInCents": 125000,
        "currency": "USD",
        "segments": [
          { "from": "JFK", "to": "NRT", "duration": "14h00m", "aircraft": "B787" }
        ],
        "cabinClass": "economy",
        "seatsRemaining": 8
      }
    ],
    "return": [
      {
        "flightId": "NH-0098",
        "airline": "ANA",
        "departureTime": "2026-06-07T16:00:00Z",
        "arrivalTime": "2026-06-07T18:00:00Z",
        "priceInCents": 118000,
        "currency": "JPY",
        "segments": [
          { "from": "NRT", "to": "JFK", "duration": "13h00m", "aircraft": "B777" }
        ],
        "cabinClass": "economy",
        "seatsRemaining": 15
      }
    ]
  },
  "NYC": {
    "outbound": [
      {
        "flightId": "UA-0501",
        "airline": "United Airlines",
        "departureTime": "2026-06-01T06:00:00Z",
        "arrivalTime": "2026-06-01T09:15:00Z",
        "priceInCents": 18000,
        "currency": "USD",
        "segments": [
          { "from": "LAX", "to": "JFK", "duration": "5h15m", "aircraft": "B737" }
        ],
        "cabinClass": "economy",
        "seatsRemaining": 45
      }
    ],
    "return": [
      {
        "flightId": "B6-1122",
        "airline": "JetBlue",
        "departureTime": "2026-06-07T20:00:00Z",
        "arrivalTime": "2026-06-07T23:30:00Z",
        "priceInCents": 21500,
        "currency": "USD",
        "segments": [
          { "from": "JFK", "to": "LAX", "duration": "5h30m", "aircraft": "A321" }
        ],
        "cabinClass": "economy",
        "seatsRemaining": 30
      }
    ]
  },
  "BCN": {
    "outbound": [
      {
        "flightId": "IB-3300",
        "airline": "Iberia",
        "departureTime": "2026-06-01T22:00:00Z",
        "arrivalTime": "2026-06-02T11:30:00Z",
        "priceInCents": 55000,
        "currency": "EUR",
        "segments": [
          { "from": "JFK", "to": "BCN", "duration": "8h30m", "aircraft": "A340" }
        ],
        "cabinClass": "economy",
        "seatsRemaining": 9
      }
    ],
    "return": [
      {
        "flightId": "VY-8800",
        "airline": "Vueling",
        "departureTime": "2026-06-07T07:00:00Z",
        "arrivalTime": "2026-06-07T10:30:00Z",
        "priceInCents": 42000,
        "currency": "EUR",
        "segments": [
          { "from": "BCN", "to": "JFK", "duration": "9h30m", "aircraft": "A320" }
        ],
        "cabinClass": "economy",
        "seatsRemaining": 18
      }
    ]
  },
  "ROM": {
    "outbound": [
      {
        "flightId": "AZ-0610",
        "airline": "ITA Airways",
        "departureTime": "2026-06-01T17:00:00Z",
        "arrivalTime": "2026-06-02T07:00:00Z",
        "priceInCents": 48000,
        "currency": "EUR",
        "segments": [
          { "from": "JFK", "to": "FCO", "duration": "9h00m", "aircraft": "A330" }
        ],
        "cabinClass": "economy",
        "seatsRemaining": 14
      }
    ],
    "return": [
      {
        "flightId": "AZ-0611",
        "airline": "ITA Airways",
        "departureTime": "2026-06-07T09:00:00Z",
        "arrivalTime": "2026-06-07T13:00:00Z",
        "priceInCents": 51000,
        "currency": "EUR",
        "segments": [
          { "from": "FCO", "to": "JFK", "duration": "10h00m", "aircraft": "A330" }
        ],
        "cabinClass": "economy",
        "seatsRemaining": 7
      }
    ]
  }
}
```

- [ ] **Step 2.2** Create `apps/bff/server/src/data/hotels.json`

```json
{
  "paris": [
    {
      "hotel_id": "htl_001",
      "hotel_name": "Le Petit Paris",
      "star_rating": 4,
      "address": { "street": "12 Rue de Rivoli", "district": "1st Arr.", "city": "Paris" },
      "price_per_night": "185.50",
      "currency_code": "EUR",
      "total_price": "1298.50",
      "amenities": ["wifi", "breakfast", "pool"],
      "review_score": "8.7",
      "review_count": 342,
      "images": ["https://example.com/hotel1.jpg"],
      "available_rooms": 3
    },
    {
      "hotel_id": "htl_002",
      "hotel_name": "Hotel de la Paix",
      "star_rating": 3,
      "address": { "street": "45 Boulevard Saint-Germain", "district": "5th Arr.", "city": "Paris" },
      "price_per_night": "120.00",
      "currency_code": "EUR",
      "total_price": "840.00",
      "amenities": ["wifi", "breakfast"],
      "review_score": "7.9",
      "review_count": 198,
      "images": ["https://example.com/hotel2.jpg"],
      "available_rooms": 7
    }
  ],
  "tokyo": [
    {
      "hotel_id": "htl_010",
      "hotel_name": "Shinjuku Granbell Hotel",
      "star_rating": 4,
      "address": { "street": "2-14-5 Kabukicho", "district": "Shinjuku", "city": "Tokyo" },
      "price_per_night": "15000",
      "currency_code": "JPY",
      "total_price": "105000",
      "amenities": ["wifi", "onsen", "restaurant"],
      "review_score": "9.1",
      "review_count": 567,
      "images": ["https://example.com/hotel10.jpg"],
      "available_rooms": 5
    }
  ],
  "new york": [
    {
      "hotel_id": "htl_020",
      "hotel_name": "The Manhattan Inn",
      "star_rating": 3,
      "address": { "street": "310 W 40th St", "district": "Midtown", "city": "New York" },
      "price_per_night": "199.00",
      "currency_code": "USD",
      "total_price": "1393.00",
      "amenities": ["wifi", "gym", "bar"],
      "review_score": "7.5",
      "review_count": 421,
      "images": ["https://example.com/hotel20.jpg"],
      "available_rooms": 12
    }
  ],
  "barcelona": [
    {
      "hotel_id": "htl_030",
      "hotel_name": "Casa Bonay",
      "star_rating": 4,
      "address": { "street": "Gran Via 700", "district": "Eixample", "city": "Barcelona" },
      "price_per_night": "165.00",
      "currency_code": "EUR",
      "total_price": "1155.00",
      "amenities": ["wifi", "rooftop", "breakfast", "pool"],
      "review_score": "8.9",
      "review_count": 289,
      "images": ["https://example.com/hotel30.jpg"],
      "available_rooms": 4
    }
  ],
  "rome": [
    {
      "hotel_id": "htl_040",
      "hotel_name": "Hotel Artemide",
      "star_rating": 4,
      "address": { "street": "Via Nazionale 22", "district": "Centro Storico", "city": "Rome" },
      "price_per_night": "175.00",
      "currency_code": "EUR",
      "total_price": "1225.00",
      "amenities": ["wifi", "spa", "breakfast", "restaurant"],
      "review_score": "9.0",
      "review_count": 512,
      "images": ["https://example.com/hotel40.jpg"],
      "available_rooms": 6
    }
  ]
}
```

- [ ] **Step 2.3** Create `apps/bff/server/src/data/weather.json`

```json
{
  "Paris": {
    "location": { "name": "Paris", "country": "FR", "lat": 48.8566, "lon": 2.3522 },
    "forecast": [
      {
        "dt": 1717200000,
        "temp": { "min": 288.15, "max": 298.15 },
        "weather": { "id": 800, "main": "Clear", "description": "clear sky", "icon": "01d" },
        "wind": { "speed": 3.2, "deg": 180 },
        "humidity": 55,
        "precipitation_probability": 0.1
      },
      {
        "dt": 1717286400,
        "temp": { "min": 286.15, "max": 295.15 },
        "weather": { "id": 802, "main": "Clouds", "description": "scattered clouds", "icon": "03d" },
        "wind": { "speed": 4.1, "deg": 200 },
        "humidity": 62,
        "precipitation_probability": 0.25
      },
      {
        "dt": 1717372800,
        "temp": { "min": 284.15, "max": 291.15 },
        "weather": { "id": 500, "main": "Rain", "description": "light rain", "icon": "10d" },
        "wind": { "speed": 5.5, "deg": 220 },
        "humidity": 78,
        "precipitation_probability": 0.7
      },
      {
        "dt": 1717459200,
        "temp": { "min": 287.15, "max": 296.15 },
        "weather": { "id": 801, "main": "Clouds", "description": "few clouds", "icon": "02d" },
        "wind": { "speed": 2.8, "deg": 160 },
        "humidity": 50,
        "precipitation_probability": 0.15
      },
      {
        "dt": 1717545600,
        "temp": { "min": 289.15, "max": 299.15 },
        "weather": { "id": 800, "main": "Clear", "description": "clear sky", "icon": "01d" },
        "wind": { "speed": 2.1, "deg": 140 },
        "humidity": 45,
        "precipitation_probability": 0.05
      },
      {
        "dt": 1717632000,
        "temp": { "min": 290.15, "max": 300.15 },
        "weather": { "id": 800, "main": "Clear", "description": "clear sky", "icon": "01d" },
        "wind": { "speed": 1.8, "deg": 120 },
        "humidity": 40,
        "precipitation_probability": 0.05
      }
    ],
    "units": "standard"
  },
  "Tokyo": {
    "location": { "name": "Tokyo", "country": "JP", "lat": 35.6762, "lon": 139.6503 },
    "forecast": [
      {
        "dt": 1717200000,
        "temp": { "min": 293.15, "max": 301.15 },
        "weather": { "id": 500, "main": "Rain", "description": "light rain", "icon": "10d" },
        "wind": { "speed": 4.5, "deg": 90 },
        "humidity": 75,
        "precipitation_probability": 0.6
      },
      {
        "dt": 1717286400,
        "temp": { "min": 294.15, "max": 302.15 },
        "weather": { "id": 802, "main": "Clouds", "description": "scattered clouds", "icon": "03d" },
        "wind": { "speed": 3.8, "deg": 110 },
        "humidity": 70,
        "precipitation_probability": 0.3
      }
    ],
    "units": "standard"
  },
  "New York": {
    "location": { "name": "New York", "country": "US", "lat": 40.7128, "lon": -74.006 },
    "forecast": [
      {
        "dt": 1717200000,
        "temp": { "min": 291.15, "max": 300.15 },
        "weather": { "id": 800, "main": "Clear", "description": "clear sky", "icon": "01d" },
        "wind": { "speed": 3.0, "deg": 270 },
        "humidity": 50,
        "precipitation_probability": 0.1
      },
      {
        "dt": 1717286400,
        "temp": { "min": 290.15, "max": 298.15 },
        "weather": { "id": 801, "main": "Clouds", "description": "few clouds", "icon": "02d" },
        "wind": { "speed": 4.2, "deg": 260 },
        "humidity": 55,
        "precipitation_probability": 0.2
      }
    ],
    "units": "standard"
  },
  "Barcelona": {
    "location": { "name": "Barcelona", "country": "ES", "lat": 41.3874, "lon": 2.1686 },
    "forecast": [
      {
        "dt": 1717200000,
        "temp": { "min": 291.15, "max": 299.15 },
        "weather": { "id": 800, "main": "Clear", "description": "clear sky", "icon": "01d" },
        "wind": { "speed": 2.5, "deg": 150 },
        "humidity": 48,
        "precipitation_probability": 0.05
      },
      {
        "dt": 1717286400,
        "temp": { "min": 292.15, "max": 301.15 },
        "weather": { "id": 800, "main": "Clear", "description": "clear sky", "icon": "01d" },
        "wind": { "speed": 2.0, "deg": 130 },
        "humidity": 42,
        "precipitation_probability": 0.05
      }
    ],
    "units": "standard"
  },
  "Rome": {
    "location": { "name": "Rome", "country": "IT", "lat": 41.9028, "lon": 12.4964 },
    "forecast": [
      {
        "dt": 1717200000,
        "temp": { "min": 292.15, "max": 302.15 },
        "weather": { "id": 800, "main": "Clear", "description": "clear sky", "icon": "01d" },
        "wind": { "speed": 2.0, "deg": 170 },
        "humidity": 40,
        "precipitation_probability": 0.05
      },
      {
        "dt": 1717286400,
        "temp": { "min": 293.15, "max": 303.15 },
        "weather": { "id": 801, "main": "Clouds", "description": "few clouds", "icon": "02d" },
        "wind": { "speed": 2.3, "deg": 180 },
        "humidity": 38,
        "precipitation_probability": 0.1
      }
    ],
    "units": "standard"
  }
}
```

- [ ] **Step 2.4** Create `apps/bff/server/src/data/currencies.json`

```json
{
  "base": "USD",
  "rates": {
    "USD": 1.0,
    "EUR": 1.08,
    "GBP": 1.27,
    "JPY": 0.0067
  }
}
```

Note: Rates are expressed as "1 unit of foreign currency = X USD". So 1 EUR = 1.08 USD, 1 JPY = 0.0067 USD.

- [ ] **Step 2.5** Commit

```bash
git add apps/bff/server/src/data/
git commit -m "feat(bff): add mock data files for flights, hotels, weather, currencies"
```

---

## Task 3: Flights Mock API

- [ ] **Step 3.1** Write test `apps/bff/server/src/mock-apis/flightsApi.test.ts`

```typescript
import { describe, it, expect } from "vitest";
import request from "supertest";
import express from "express";
import { flightsApi } from "./flightsApi.js";

const app = express();
app.use("/external/flights", flightsApi);

describe("GET /external/flights", () => {
  it("returns flights for a valid destination", async () => {
    const res = await request(app)
      .get("/external/flights")
      .query({
        origin: "NYC",
        destination: "PAR",
        departDate: "2026-06-01",
        returnDate: "2026-06-07",
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.data).toHaveProperty("outbound");
    expect(res.body.data).toHaveProperty("return");
    expect(res.body.data.outbound.length).toBeGreaterThan(0);
  });

  it("returns camelCase keys and prices in cents", async () => {
    const res = await request(app)
      .get("/external/flights")
      .query({
        origin: "NYC",
        destination: "PAR",
        departDate: "2026-06-01",
        returnDate: "2026-06-07",
      });

    const flight = res.body.data.outbound[0];
    expect(flight).toHaveProperty("flightId");
    expect(flight).toHaveProperty("priceInCents");
    expect(flight).toHaveProperty("cabinClass");
    expect(flight).toHaveProperty("seatsRemaining");
    expect(typeof flight.priceInCents).toBe("number");
    expect(flight.segments).toBeInstanceOf(Array);
    expect(flight.segments[0]).toHaveProperty("from");
    expect(flight.segments[0]).toHaveProperty("duration");
  });

  it("returns 400 when destination is missing", async () => {
    const res = await request(app)
      .get("/external/flights")
      .query({ origin: "NYC" });

    expect(res.status).toBe(400);
  });

  it("returns empty arrays for unknown destination", async () => {
    const res = await request(app)
      .get("/external/flights")
      .query({
        origin: "NYC",
        destination: "ZZZ",
        departDate: "2026-06-01",
        returnDate: "2026-06-07",
      });

    expect(res.status).toBe(200);
    expect(res.body.data.outbound).toEqual([]);
    expect(res.body.data.return).toEqual([]);
  });
});
```

- [ ] **Step 3.2** Run test (should fail)

```bash
cd apps/bff/server
npx vitest run src/mock-apis/flightsApi.test.ts
```

Expected: FAIL (module not found).

- [ ] **Step 3.3** Implement `apps/bff/server/src/mock-apis/flightsApi.ts`

```typescript
import { Router, Request, Response } from "express";
import flightsData from "../data/flights.json" with { type: "json" };

const router = Router();

router.get("/", (req: Request, res: Response) => {
  const { destination, departDate, returnDate } = req.query;

  if (!destination || !departDate || !returnDate) {
    res.status(400).json({ status: "error", message: "Missing required params: destination, departDate, returnDate" });
    return;
  }

  const dest = (destination as string).toUpperCase();
  const entry = flightsData[dest as keyof typeof flightsData];

  if (!entry) {
    res.json({
      status: "ok",
      data: { outbound: [], return: [] },
    });
    return;
  }

  res.json({
    status: "ok",
    data: {
      outbound: entry.outbound,
      return: entry.return,
    },
  });
});

export const flightsApi = router;
```

- [ ] **Step 3.4** Run test (should pass)

```bash
cd apps/bff/server
npx vitest run src/mock-apis/flightsApi.test.ts
```

Expected: 4 tests pass.

- [ ] **Step 3.5** Commit

```bash
git add apps/bff/server/src/mock-apis/flightsApi.ts apps/bff/server/src/mock-apis/flightsApi.test.ts
git commit -m "feat(bff): add flights mock API with tests"
```

---

## Task 4: Hotels Mock API

- [ ] **Step 4.1** Write test `apps/bff/server/src/mock-apis/hotelsApi.test.ts`

```typescript
import { describe, it, expect } from "vitest";
import request from "supertest";
import express from "express";
import { hotelsApi } from "./hotelsApi.js";

const app = express();
app.use("/external/hotels", hotelsApi);

describe("GET /external/hotels", () => {
  it("returns hotels for a valid destination", async () => {
    const res = await request(app)
      .get("/external/hotels")
      .query({
        destination: "paris",
        checkin: "01-06-2026",
        checkout: "07-06-2026",
      });

    expect(res.status).toBe(200);
    expect(res.body.result_code).toBe(200);
    expect(res.body.hotels_found.length).toBeGreaterThan(0);
  });

  it("returns snake_case keys and string prices", async () => {
    const res = await request(app)
      .get("/external/hotels")
      .query({
        destination: "paris",
        checkin: "01-06-2026",
        checkout: "07-06-2026",
      });

    const hotel = res.body.hotels_found[0];
    expect(hotel).toHaveProperty("hotel_id");
    expect(hotel).toHaveProperty("hotel_name");
    expect(hotel).toHaveProperty("star_rating");
    expect(hotel).toHaveProperty("price_per_night");
    expect(hotel).toHaveProperty("currency_code");
    expect(hotel).toHaveProperty("total_price");
    expect(hotel).toHaveProperty("review_score");
    expect(hotel).toHaveProperty("review_count");
    expect(typeof hotel.price_per_night).toBe("string");
    expect(typeof hotel.total_price).toBe("string");
    expect(typeof hotel.review_score).toBe("string");
    expect(hotel.address).toHaveProperty("street");
    expect(hotel.address).toHaveProperty("district");
  });

  it("returns 400 when destination is missing", async () => {
    const res = await request(app)
      .get("/external/hotels")
      .query({ checkin: "01-06-2026" });

    expect(res.status).toBe(400);
  });

  it("returns empty array for unknown destination", async () => {
    const res = await request(app)
      .get("/external/hotels")
      .query({
        destination: "atlantis",
        checkin: "01-06-2026",
        checkout: "07-06-2026",
      });

    expect(res.status).toBe(200);
    expect(res.body.hotels_found).toEqual([]);
  });

  it("uses DD-MM-YYYY date format in query params", async () => {
    const res = await request(app)
      .get("/external/hotels")
      .query({
        destination: "paris",
        checkin: "01-06-2026",
        checkout: "07-06-2026",
      });

    expect(res.status).toBe(200);
    expect(res.body.hotels_found.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 4.2** Run test (should fail)

```bash
cd apps/bff/server
npx vitest run src/mock-apis/hotelsApi.test.ts
```

- [ ] **Step 4.3** Implement `apps/bff/server/src/mock-apis/hotelsApi.ts`

```typescript
import { Router, Request, Response } from "express";
import hotelsData from "../data/hotels.json" with { type: "json" };

const router = Router();

router.get("/", (req: Request, res: Response) => {
  const { destination, checkin, checkout } = req.query;

  if (!destination || !checkin || !checkout) {
    res.status(400).json({ result_code: 400, error: "Missing required params: destination, checkin, checkout" });
    return;
  }

  const dest = (destination as string).toLowerCase();
  const hotels = hotelsData[dest as keyof typeof hotelsData];

  if (!hotels) {
    res.json({
      result_code: 200,
      hotels_found: [],
    });
    return;
  }

  res.json({
    result_code: 200,
    hotels_found: hotels,
  });
});

export const hotelsApi = router;
```

- [ ] **Step 4.4** Run test (should pass)

```bash
cd apps/bff/server
npx vitest run src/mock-apis/hotelsApi.test.ts
```

Expected: 5 tests pass.

- [ ] **Step 4.5** Commit

```bash
git add apps/bff/server/src/mock-apis/hotelsApi.ts apps/bff/server/src/mock-apis/hotelsApi.test.ts
git commit -m "feat(bff): add hotels mock API with tests"
```

---

## Task 5: Weather Mock API

- [ ] **Step 5.1** Write test `apps/bff/server/src/mock-apis/weatherApi.test.ts`

```typescript
import { describe, it, expect } from "vitest";
import request from "supertest";
import express from "express";
import { weatherApi } from "./weatherApi.js";

const app = express();
app.use("/external/weather", weatherApi);

describe("GET /external/weather", () => {
  it("returns weather for a valid city", async () => {
    const res = await request(app)
      .get("/external/weather")
      .query({
        city: "Paris",
        startDate: "1717200000",
        endDate: "1717718400",
      });

    expect(res.status).toBe(200);
    expect(res.body.location).toHaveProperty("name", "Paris");
    expect(res.body.forecast.length).toBeGreaterThan(0);
    expect(res.body.units).toBe("standard");
  });

  it("returns Kelvin temps, unix timestamps, and wind in m/s", async () => {
    const res = await request(app)
      .get("/external/weather")
      .query({
        city: "Paris",
        startDate: "1717200000",
        endDate: "1717718400",
      });

    const day = res.body.forecast[0];
    expect(day).toHaveProperty("dt");
    expect(typeof day.dt).toBe("number");
    expect(day.temp).toHaveProperty("min");
    expect(day.temp).toHaveProperty("max");
    // Kelvin temps should be > 200
    expect(day.temp.min).toBeGreaterThan(200);
    expect(day.weather).toHaveProperty("main");
    expect(day.weather).toHaveProperty("icon");
    expect(day.wind).toHaveProperty("speed");
    expect(day).toHaveProperty("humidity");
    expect(day).toHaveProperty("precipitation_probability");
  });

  it("returns 400 when city is missing", async () => {
    const res = await request(app)
      .get("/external/weather")
      .query({ startDate: "1717200000" });

    expect(res.status).toBe(400);
  });

  it("returns empty forecast for unknown city", async () => {
    const res = await request(app)
      .get("/external/weather")
      .query({
        city: "Atlantis",
        startDate: "1717200000",
        endDate: "1717718400",
      });

    expect(res.status).toBe(200);
    expect(res.body.forecast).toEqual([]);
  });

  it("filters forecast by date range", async () => {
    const res = await request(app)
      .get("/external/weather")
      .query({
        city: "Paris",
        startDate: "1717200000",
        endDate: "1717286400",
      });

    expect(res.status).toBe(200);
    res.body.forecast.forEach((day: { dt: number }) => {
      expect(day.dt).toBeGreaterThanOrEqual(1717200000);
      expect(day.dt).toBeLessThanOrEqual(1717286400);
    });
  });
});
```

- [ ] **Step 5.2** Run test (should fail)

```bash
cd apps/bff/server
npx vitest run src/mock-apis/weatherApi.test.ts
```

- [ ] **Step 5.3** Implement `apps/bff/server/src/mock-apis/weatherApi.ts`

```typescript
import { Router, Request, Response } from "express";
import weatherData from "../data/weather.json" with { type: "json" };

const router = Router();

router.get("/", (req: Request, res: Response) => {
  const { city, startDate, endDate } = req.query;

  if (!city || !startDate || !endDate) {
    res.status(400).json({ error: "Missing required params: city, startDate, endDate" });
    return;
  }

  const cityName = city as string;
  const start = parseInt(startDate as string, 10);
  const end = parseInt(endDate as string, 10);

  const cityData = weatherData[cityName as keyof typeof weatherData];

  if (!cityData) {
    res.json({
      location: { name: cityName, country: "??", lat: 0, lon: 0 },
      forecast: [],
      units: "standard",
    });
    return;
  }

  const filteredForecast = cityData.forecast.filter(
    (day) => day.dt >= start && day.dt <= end
  );

  res.json({
    location: cityData.location,
    forecast: filteredForecast,
    units: cityData.units,
  });
});

export const weatherApi = router;
```

- [ ] **Step 5.4** Run test (should pass)

```bash
cd apps/bff/server
npx vitest run src/mock-apis/weatherApi.test.ts
```

Expected: 5 tests pass.

- [ ] **Step 5.5** Commit

```bash
git add apps/bff/server/src/mock-apis/weatherApi.ts apps/bff/server/src/mock-apis/weatherApi.test.ts
git commit -m "feat(bff): add weather mock API with tests"
```

---

## Task 6: Service Types (Raw)

- [ ] **Step 6.1** Create `apps/bff/server/src/services/types.ts`

```typescript
// Raw types matching the messy, inconsistent mock API responses.
// Each API was "built by a different team" — hence different conventions.

// --- Flights API (camelCase, cents, nested segments) ---

export interface FlightSegment {
  from: string;
  to: string;
  duration: string;
  aircraft: string;
}

export interface FlightRaw {
  flightId: string;
  airline: string;
  departureTime: string;
  arrivalTime: string;
  priceInCents: number;
  currency: string;
  segments: FlightSegment[];
  cabinClass: string;
  seatsRemaining: number;
}

export interface FlightRawResponse {
  status: string;
  data: {
    outbound: FlightRaw[];
    return: FlightRaw[];
  };
}

// --- Hotels API (snake_case, string prices, DD-MM-YYYY) ---

export interface HotelAddress {
  street: string;
  district: string;
  city: string;
}

export interface HotelRaw {
  hotel_id: string;
  hotel_name: string;
  star_rating: number;
  address: HotelAddress;
  price_per_night: string;
  currency_code: string;
  total_price: string;
  amenities: string[];
  review_score: string;
  review_count: number;
  images: string[];
  available_rooms: number;
}

export interface HotelRawResponse {
  result_code: number;
  hotels_found: HotelRaw[];
}

// --- Weather API (Kelvin, unix timestamps, m/s wind) ---

export interface WeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface WeatherDayRaw {
  dt: number;
  temp: { min: number; max: number };
  weather: WeatherCondition;
  wind: { speed: number; deg: number };
  humidity: number;
  precipitation_probability: number;
}

export interface WeatherRawResponse {
  location: { name: string; country: string; lat: number; lon: number };
  forecast: WeatherDayRaw[];
  units: string;
}
```

- [ ] **Step 6.2** Commit

```bash
git add apps/bff/server/src/services/types.ts
git commit -m "feat(bff): add raw service types matching inconsistent API response formats"
```

---

## Task 7: BFF Types (Clean)

- [ ] **Step 7.1** Create `apps/bff/server/src/bff/types.ts`

```typescript
// Clean, UI-shaped types. This is what the frontend receives.
// All data is normalized: consistent casing, real numbers, standard units.

export interface TripSummary {
  destination: string;
  dates: { from: string; to: string; nights: number };
  flights: FlightOption[];
  hotels: HotelOption[];
  weather: DayForecast[];
  totalCost: { flights: number; hotel: number; total: number; currency: string };
}

export interface FlightOption {
  id: string;
  airline: string;
  departure: string;    // ISO datetime
  arrival: string;      // ISO datetime
  duration: string;
  price: number;        // dollars, not cents
  currency: string;     // always "USD"
  direction: "outbound" | "return";
}

export interface HotelOption {
  id: string;
  name: string;
  stars: number;
  location: string;     // flattened: "12 Rue de Rivoli, 1st Arr."
  pricePerNight: number; // number, not string
  totalPrice: number;
  currency: string;     // always "USD"
  rating: number;       // number, not string
  reviewCount: number;
  amenities: string[];
  imageUrl: string;
}

export interface DayForecast {
  date: string;         // YYYY-MM-DD, not unix timestamp
  tempMin: number;      // Celsius, not Kelvin
  tempMax: number;
  condition: string;    // "Clear", "Rain", etc.
  icon: string;
  humidity: number;
  rainChance: number;   // 0-100 percentage
}
```

- [ ] **Step 7.2** Commit

```bash
git add apps/bff/server/src/bff/types.ts
git commit -m "feat(bff): add clean UI-shaped BFF types"
```

---

## Task 8: Services Layer

- [ ] **Step 8.1** Write test `apps/bff/server/src/services/currencyService.test.ts`

```typescript
import { describe, it, expect } from "vitest";
import { convertToUSD } from "./currencyService.js";

describe("currencyService", () => {
  it("converts EUR to USD", () => {
    const result = convertToUSD(100, "EUR");
    expect(result).toBeCloseTo(108, 0);
  });

  it("converts JPY to USD", () => {
    const result = convertToUSD(10000, "JPY");
    expect(result).toBeCloseTo(67, 0);
  });

  it("returns same amount for USD", () => {
    const result = convertToUSD(100, "USD");
    expect(result).toBe(100);
  });

  it("converts GBP to USD", () => {
    const result = convertToUSD(100, "GBP");
    expect(result).toBeCloseTo(127, 0);
  });

  it("throws for unknown currency", () => {
    expect(() => convertToUSD(100, "XYZ")).toThrow();
  });
});
```

- [ ] **Step 8.2** Implement `apps/bff/server/src/services/currencyService.ts`

```typescript
import currencyData from "../data/currencies.json" with { type: "json" };

const rates = currencyData.rates as Record<string, number>;

export function convertToUSD(amount: number, fromCurrency: string): number {
  const rate = rates[fromCurrency];
  if (rate === undefined) {
    throw new Error(`Unknown currency: ${fromCurrency}`);
  }
  return amount * rate;
}
```

- [ ] **Step 8.3** Run currency tests

```bash
cd apps/bff/server
npx vitest run src/services/currencyService.test.ts
```

Expected: 5 tests pass.

- [ ] **Step 8.4** Write test `apps/bff/server/src/services/flightsService.test.ts`

```typescript
import { describe, it, expect } from "vitest";
import request from "supertest";
import express from "express";
import { flightsApi } from "../mock-apis/flightsApi.js";
import { fetchFlights } from "./flightsService.js";

// Set up a test server with mock API
const app = express();
app.use("/external/flights", flightsApi);

let testServer: ReturnType<typeof app.listen>;
let baseUrl: string;

describe("flightsService", () => {
  beforeAll(async () => {
    testServer = app.listen(0);
    const address = testServer.address();
    const port = typeof address === "object" && address ? address.port : 0;
    baseUrl = `http://localhost:${port}`;
  });

  afterAll(() => {
    testServer.close();
  });

  it("fetches flights and returns raw response", async () => {
    const result = await fetchFlights(baseUrl, "NYC", "PAR", "2026-06-01", "2026-06-07");
    expect(result.status).toBe("ok");
    expect(result.data.outbound.length).toBeGreaterThan(0);
    expect(result.data.return.length).toBeGreaterThan(0);
  });

  it("returns empty data for unknown destination", async () => {
    const result = await fetchFlights(baseUrl, "NYC", "ZZZ", "2026-06-01", "2026-06-07");
    expect(result.data.outbound).toEqual([]);
    expect(result.data.return).toEqual([]);
  });
});
```

- [ ] **Step 8.5** Implement `apps/bff/server/src/services/flightsService.ts`

```typescript
import type { FlightRawResponse } from "./types.js";

export async function fetchFlights(
  baseUrl: string,
  origin: string,
  destination: string,
  departDate: string,
  returnDate: string
): Promise<FlightRawResponse> {
  const params = new URLSearchParams({ origin, destination, departDate, returnDate });
  const res = await fetch(`${baseUrl}/external/flights?${params}`);
  return res.json() as Promise<FlightRawResponse>;
}
```

- [ ] **Step 8.6** Run flights service tests

```bash
cd apps/bff/server
npx vitest run src/services/flightsService.test.ts
```

Expected: 2 tests pass.

- [ ] **Step 8.7** Write test `apps/bff/server/src/services/hotelsService.test.ts`

```typescript
import { describe, it, expect } from "vitest";
import express from "express";
import { hotelsApi } from "../mock-apis/hotelsApi.js";
import { fetchHotels } from "./hotelsService.js";

const app = express();
app.use("/external/hotels", hotelsApi);

let testServer: ReturnType<typeof app.listen>;
let baseUrl: string;

describe("hotelsService", () => {
  beforeAll(async () => {
    testServer = app.listen(0);
    const address = testServer.address();
    const port = typeof address === "object" && address ? address.port : 0;
    baseUrl = `http://localhost:${port}`;
  });

  afterAll(() => {
    testServer.close();
  });

  it("fetches hotels and returns raw response", async () => {
    const result = await fetchHotels(baseUrl, "paris", "2026-06-01", "2026-06-07");
    expect(result.result_code).toBe(200);
    expect(result.hotels_found.length).toBeGreaterThan(0);
  });

  it("converts dates to DD-MM-YYYY format for the API", async () => {
    // Service should accept ISO dates and convert to DD-MM-YYYY
    const result = await fetchHotels(baseUrl, "paris", "2026-06-01", "2026-06-07");
    expect(result.hotels_found.length).toBeGreaterThan(0);
  });

  it("returns empty array for unknown destination", async () => {
    const result = await fetchHotels(baseUrl, "atlantis", "2026-06-01", "2026-06-07");
    expect(result.hotels_found).toEqual([]);
  });
});
```

- [ ] **Step 8.8** Implement `apps/bff/server/src/services/hotelsService.ts`

```typescript
import type { HotelRawResponse } from "./types.js";

function toHotelDateFormat(isoDate: string): string {
  // Convert YYYY-MM-DD to DD-MM-YYYY
  const [year, month, day] = isoDate.split("-");
  return `${day}-${month}-${year}`;
}

export async function fetchHotels(
  baseUrl: string,
  destination: string,
  checkinISO: string,
  checkoutISO: string
): Promise<HotelRawResponse> {
  const checkin = toHotelDateFormat(checkinISO);
  const checkout = toHotelDateFormat(checkoutISO);
  const params = new URLSearchParams({ destination: destination.toLowerCase(), checkin, checkout });
  const res = await fetch(`${baseUrl}/external/hotels?${params}`);
  return res.json() as Promise<HotelRawResponse>;
}
```

- [ ] **Step 8.9** Run hotels service tests

```bash
cd apps/bff/server
npx vitest run src/services/hotelsService.test.ts
```

Expected: 3 tests pass.

- [ ] **Step 8.10** Write test `apps/bff/server/src/services/weatherService.test.ts`

```typescript
import { describe, it, expect } from "vitest";
import express from "express";
import { weatherApi } from "../mock-apis/weatherApi.js";
import { fetchWeather } from "./weatherService.js";

const app = express();
app.use("/external/weather", weatherApi);

let testServer: ReturnType<typeof app.listen>;
let baseUrl: string;

describe("weatherService", () => {
  beforeAll(async () => {
    testServer = app.listen(0);
    const address = testServer.address();
    const port = typeof address === "object" && address ? address.port : 0;
    baseUrl = `http://localhost:${port}`;
  });

  afterAll(() => {
    testServer.close();
  });

  it("fetches weather and returns raw response", async () => {
    const result = await fetchWeather(baseUrl, "Paris", "2026-06-01", "2026-06-07");
    expect(result.location.name).toBe("Paris");
    expect(result.forecast.length).toBeGreaterThan(0);
    expect(result.units).toBe("standard");
  });

  it("converts ISO dates to unix timestamps for the API", async () => {
    const result = await fetchWeather(baseUrl, "Paris", "2026-06-01", "2026-06-07");
    // Should work — service converts the dates internally
    expect(result.forecast.length).toBeGreaterThan(0);
  });

  it("returns empty forecast for unknown city", async () => {
    const result = await fetchWeather(baseUrl, "Atlantis", "2026-06-01", "2026-06-07");
    expect(result.forecast).toEqual([]);
  });
});
```

- [ ] **Step 8.11** Implement `apps/bff/server/src/services/weatherService.ts`

```typescript
import type { WeatherRawResponse } from "./types.js";

function toUnixTimestamp(isoDate: string): number {
  return Math.floor(new Date(isoDate).getTime() / 1000);
}

export async function fetchWeather(
  baseUrl: string,
  city: string,
  fromISO: string,
  toISO: string
): Promise<WeatherRawResponse> {
  const startDate = toUnixTimestamp(fromISO).toString();
  const endDate = toUnixTimestamp(toISO).toString();
  const params = new URLSearchParams({ city, startDate, endDate });
  const res = await fetch(`${baseUrl}/external/weather?${params}`);
  return res.json() as Promise<WeatherRawResponse>;
}
```

- [ ] **Step 8.12** Run all service tests

```bash
cd apps/bff/server
npx vitest run src/services/
```

Expected: All 13 tests pass.

- [ ] **Step 8.13** Commit

```bash
git add apps/bff/server/src/services/
git commit -m "feat(bff): add service layer with currency, flights, hotels, weather services"
```

---

## Task 9: Trip Aggregator (The BFF Core)

- [ ] **Step 9.1** Write test `apps/bff/server/src/bff/tripAggregator.test.ts`

```typescript
import { describe, it, expect } from "vitest";
import express from "express";
import { flightsApi } from "../mock-apis/flightsApi.js";
import { hotelsApi } from "../mock-apis/hotelsApi.js";
import { weatherApi } from "../mock-apis/weatherApi.js";
import { aggregateTrip } from "./tripAggregator.js";

// Set up server with all mock APIs
const app = express();
app.use("/external/flights", flightsApi);
app.use("/external/hotels", hotelsApi);
app.use("/external/weather", weatherApi);

let testServer: ReturnType<typeof app.listen>;
let baseUrl: string;

describe("tripAggregator", () => {
  beforeAll(async () => {
    testServer = app.listen(0);
    const address = testServer.address();
    const port = typeof address === "object" && address ? address.port : 0;
    baseUrl = `http://localhost:${port}`;
  });

  afterAll(() => {
    testServer.close();
  });

  it("returns a complete TripSummary", async () => {
    const result = await aggregateTrip(baseUrl, "PAR", "Paris", "2026-06-01", "2026-06-07");

    expect(result.destination).toBe("Paris");
    expect(result.dates.from).toBe("2026-06-01");
    expect(result.dates.to).toBe("2026-06-07");
    expect(result.dates.nights).toBe(6);
    expect(result.flights.length).toBeGreaterThan(0);
    expect(result.hotels.length).toBeGreaterThan(0);
    expect(result.weather.length).toBeGreaterThan(0);
    expect(result.totalCost).toHaveProperty("flights");
    expect(result.totalCost).toHaveProperty("hotel");
    expect(result.totalCost).toHaveProperty("total");
    expect(result.totalCost.currency).toBe("USD");
  });

  it("normalizes flight prices from cents to dollars", async () => {
    const result = await aggregateTrip(baseUrl, "PAR", "Paris", "2026-06-01", "2026-06-07");
    const flight = result.flights[0];

    expect(flight.price).toBeLessThan(10000); // dollars, not cents
    expect(flight.currency).toBe("USD");
    expect(flight.id).toBeDefined();
    expect(flight.airline).toBeDefined();
    expect(flight.departure).toMatch(/^\d{4}-\d{2}-\d{2}T/); // ISO format
    expect(flight.arrival).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(flight.duration).toBeDefined();
    expect(["outbound", "return"]).toContain(flight.direction);
  });

  it("normalizes hotel data from snake_case to camelCase, string to number", async () => {
    const result = await aggregateTrip(baseUrl, "PAR", "Paris", "2026-06-01", "2026-06-07");
    const hotel = result.hotels[0];

    expect(typeof hotel.pricePerNight).toBe("number");
    expect(typeof hotel.totalPrice).toBe("number");
    expect(typeof hotel.rating).toBe("number");
    expect(hotel.currency).toBe("USD");
    expect(hotel.location).toContain(","); // flattened address
    expect(hotel.id).toBeDefined();
    expect(hotel.name).toBeDefined();
    expect(hotel.stars).toBeGreaterThan(0);
    expect(hotel.amenities).toBeInstanceOf(Array);
    expect(hotel.imageUrl).toBeDefined();
  });

  it("normalizes weather from Kelvin to Celsius and unix to ISO date", async () => {
    const result = await aggregateTrip(baseUrl, "PAR", "Paris", "2026-06-01", "2026-06-07");
    const day = result.weather[0];

    // Celsius temps should be roughly 0-50, not 250-330 (Kelvin)
    expect(day.tempMin).toBeLessThan(100);
    expect(day.tempMax).toBeLessThan(100);
    expect(day.tempMin).toBeGreaterThan(-50);
    expect(day.date).toMatch(/^\d{4}-\d{2}-\d{2}$/); // YYYY-MM-DD
    expect(day.condition).toBeDefined();
    expect(day.icon).toBeDefined();
    expect(day.humidity).toBeGreaterThanOrEqual(0);
    expect(day.rainChance).toBeGreaterThanOrEqual(0);
    expect(day.rainChance).toBeLessThanOrEqual(100);
  });

  it("converts EUR hotel prices to USD", async () => {
    const result = await aggregateTrip(baseUrl, "PAR", "Paris", "2026-06-01", "2026-06-07");
    const hotel = result.hotels[0];

    // Paris hotels are in EUR, should be converted to USD
    // 185.50 EUR * 1.08 = ~200.34 USD
    expect(hotel.pricePerNight).toBeGreaterThan(185);
    expect(hotel.currency).toBe("USD");
  });

  it("converts EUR flight prices to USD", async () => {
    const result = await aggregateTrip(baseUrl, "PAR", "Paris", "2026-06-01", "2026-06-07");
    const returnFlight = result.flights.find((f) => f.direction === "return");

    // Return flight AF-5678 is 52000 cents EUR = 520 EUR * 1.08 = 561.60 USD
    expect(returnFlight).toBeDefined();
    expect(returnFlight!.price).toBeGreaterThan(520);
    expect(returnFlight!.currency).toBe("USD");
  });

  it("computes total cost correctly", async () => {
    const result = await aggregateTrip(baseUrl, "PAR", "Paris", "2026-06-01", "2026-06-07");

    expect(result.totalCost.flights).toBeGreaterThan(0);
    expect(result.totalCost.hotel).toBeGreaterThan(0);
    expect(result.totalCost.total).toBeCloseTo(
      result.totalCost.flights + result.totalCost.hotel,
      2
    );
  });

  it("calls all services in parallel (performance)", async () => {
    const start = Date.now();
    await aggregateTrip(baseUrl, "PAR", "Paris", "2026-06-01", "2026-06-07");
    const elapsed = Date.now() - start;

    // If sequential, would take 3x longer. This is a sanity check.
    // On a local server, parallel should be well under 500ms.
    expect(elapsed).toBeLessThan(2000);
  });
});
```

- [ ] **Step 9.2** Run test (should fail)

```bash
cd apps/bff/server
npx vitest run src/bff/tripAggregator.test.ts
```

- [ ] **Step 9.3** Implement `apps/bff/server/src/bff/tripAggregator.ts`

```typescript
import { fetchFlights } from "../services/flightsService.js";
import { fetchHotels } from "../services/hotelsService.js";
import { fetchWeather } from "../services/weatherService.js";
import { convertToUSD } from "../services/currencyService.js";
import type { FlightRaw, HotelRaw, WeatherDayRaw } from "../services/types.js";
import type { TripSummary, FlightOption, HotelOption, DayForecast } from "./types.js";

function normalizeFlights(
  outbound: FlightRaw[],
  returnFlights: FlightRaw[]
): FlightOption[] {
  const normalize = (flight: FlightRaw, direction: "outbound" | "return"): FlightOption => ({
    id: flight.flightId,
    airline: flight.airline,
    departure: flight.departureTime,
    arrival: flight.arrivalTime,
    duration: flight.segments[0]?.duration ?? "N/A",
    price: round2(convertToUSD(flight.priceInCents / 100, flight.currency)),
    currency: "USD",
    direction,
  });

  return [
    ...outbound.map((f) => normalize(f, "outbound")),
    ...returnFlights.map((f) => normalize(f, "return")),
  ];
}

function normalizeHotels(hotels: HotelRaw[]): HotelOption[] {
  return hotels.map((h) => ({
    id: h.hotel_id,
    name: h.hotel_name,
    stars: h.star_rating,
    location: `${h.address.street}, ${h.address.district}`,
    pricePerNight: round2(convertToUSD(parseFloat(h.price_per_night), h.currency_code)),
    totalPrice: round2(convertToUSD(parseFloat(h.total_price), h.currency_code)),
    currency: "USD",
    rating: parseFloat(h.review_score),
    reviewCount: h.review_count,
    amenities: h.amenities,
    imageUrl: h.images[0] ?? "",
  }));
}

function normalizeWeather(forecast: WeatherDayRaw[]): DayForecast[] {
  return forecast.map((day) => ({
    date: new Date(day.dt * 1000).toISOString().split("T")[0],
    tempMin: round2(day.temp.min - 273.15),
    tempMax: round2(day.temp.max - 273.15),
    condition: day.weather.main,
    icon: day.weather.icon,
    humidity: day.humidity,
    rainChance: Math.round(day.precipitation_probability * 100),
  }));
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function countNights(from: string, to: string): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round(
    (new Date(to).getTime() - new Date(from).getTime()) / msPerDay
  );
}

// Destination code to city name mapping for the hotels/weather APIs
const DEST_TO_CITY: Record<string, string> = {
  PAR: "Paris",
  TYO: "Tokyo",
  NYC: "New York",
  BCN: "Barcelona",
  ROM: "Rome",
};

export async function aggregateTrip(
  baseUrl: string,
  destCode: string,
  cityName: string,
  from: string,
  to: string
): Promise<TripSummary> {
  const hotelCity = cityName.toLowerCase();
  const weatherCity = cityName;

  // 1. Call all services in parallel
  const [flightsRaw, hotelsRaw, weatherRaw] = await Promise.all([
    fetchFlights(baseUrl, "NYC", destCode, from, to),
    fetchHotels(baseUrl, hotelCity, from, to),
    fetchWeather(baseUrl, weatherCity, from, to),
  ]);

  // 2. Normalize each
  const flights = normalizeFlights(flightsRaw.data.outbound, flightsRaw.data.return);
  const hotels = normalizeHotels(hotelsRaw.hotels_found);
  const weather = normalizeWeather(weatherRaw.forecast);

  // 3. Compute costs
  // Use cheapest outbound + cheapest return for flight cost
  const outboundFlights = flights.filter((f) => f.direction === "outbound");
  const returnFlights = flights.filter((f) => f.direction === "return");
  const cheapestOutbound = outboundFlights.length > 0
    ? Math.min(...outboundFlights.map((f) => f.price))
    : 0;
  const cheapestReturn = returnFlights.length > 0
    ? Math.min(...returnFlights.map((f) => f.price))
    : 0;
  const totalFlightCost = round2(cheapestOutbound + cheapestReturn);

  // Use first hotel's total price for hotel cost
  const totalHotelCost = hotels.length > 0 ? hotels[0].totalPrice : 0;

  const totalCost = round2(totalFlightCost + totalHotelCost);

  return {
    destination: cityName,
    dates: { from, to, nights: countNights(from, to) },
    flights,
    hotels,
    weather,
    totalCost: {
      flights: totalFlightCost,
      hotel: totalHotelCost,
      total: totalCost,
      currency: "USD",
    },
  };
}
```

- [ ] **Step 9.4** Run test (should pass)

```bash
cd apps/bff/server
npx vitest run src/bff/tripAggregator.test.ts
```

Expected: 8 tests pass.

- [ ] **Step 9.5** Commit

```bash
git add apps/bff/server/src/bff/tripAggregator.ts apps/bff/server/src/bff/tripAggregator.test.ts
git commit -m "feat(bff): add trip aggregator — parallel fetch, normalize, and aggregate"
```

---

## Task 10: Trip Controller

- [ ] **Step 10.1** Write test `apps/bff/server/src/bff/tripController.test.ts`

```typescript
import { describe, it, expect } from "vitest";
import request from "supertest";
import express from "express";
import { flightsApi } from "../mock-apis/flightsApi.js";
import { hotelsApi } from "../mock-apis/hotelsApi.js";
import { weatherApi } from "../mock-apis/weatherApi.js";
import { tripController } from "./tripController.js";

const app = express();
app.use("/external/flights", flightsApi);
app.use("/external/hotels", hotelsApi);
app.use("/external/weather", weatherApi);
app.use("/api", tripController);

describe("GET /api/trip", () => {
  it("returns a clean TripSummary response", async () => {
    const res = await request(app)
      .get("/api/trip")
      .query({ dest: "PAR", from: "2026-06-01", to: "2026-06-07" });

    expect(res.status).toBe(200);
    expect(res.body.destination).toBe("Paris");
    expect(res.body.dates.nights).toBe(6);
    expect(res.body.flights.length).toBeGreaterThan(0);
    expect(res.body.hotels.length).toBeGreaterThan(0);
    expect(res.body.weather.length).toBeGreaterThan(0);
    expect(res.body.totalCost.currency).toBe("USD");
  });

  it("returns 400 when required params are missing", async () => {
    const res = await request(app)
      .get("/api/trip")
      .query({ dest: "PAR" });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("all flight prices are in USD dollars", async () => {
    const res = await request(app)
      .get("/api/trip")
      .query({ dest: "PAR", from: "2026-06-01", to: "2026-06-07" });

    res.body.flights.forEach((f: { currency: string; price: number }) => {
      expect(f.currency).toBe("USD");
      expect(f.price).toBeLessThan(10000); // dollars, not cents
    });
  });

  it("all hotel data is normalized", async () => {
    const res = await request(app)
      .get("/api/trip")
      .query({ dest: "PAR", from: "2026-06-01", to: "2026-06-07" });

    res.body.hotels.forEach((h: { pricePerNight: unknown; rating: unknown; currency: string }) => {
      expect(typeof h.pricePerNight).toBe("number");
      expect(typeof h.rating).toBe("number");
      expect(h.currency).toBe("USD");
    });
  });

  it("weather is in Celsius with ISO dates", async () => {
    const res = await request(app)
      .get("/api/trip")
      .query({ dest: "PAR", from: "2026-06-01", to: "2026-06-07" });

    res.body.weather.forEach((w: { tempMax: number; date: string }) => {
      expect(w.tempMax).toBeLessThan(100); // Celsius, not Kelvin
      expect(w.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  it("supports all 5 destinations", async () => {
    for (const dest of ["PAR", "TYO", "NYC", "BCN", "ROM"]) {
      const res = await request(app)
        .get("/api/trip")
        .query({ dest, from: "2026-06-01", to: "2026-06-07" });

      expect(res.status).toBe(200);
      expect(res.body.flights).toBeInstanceOf(Array);
    }
  });
});
```

- [ ] **Step 10.2** Run test (should fail)

```bash
cd apps/bff/server
npx vitest run src/bff/tripController.test.ts
```

- [ ] **Step 10.3** Implement `apps/bff/server/src/bff/tripController.ts`

```typescript
import { Router, Request, Response } from "express";
import { aggregateTrip } from "./tripAggregator.js";

const router = Router();

const DEST_TO_CITY: Record<string, string> = {
  PAR: "Paris",
  TYO: "Tokyo",
  NYC: "New York",
  BCN: "Barcelona",
  ROM: "Rome",
};

router.get("/trip", async (req: Request, res: Response) => {
  const { dest, from, to } = req.query;

  if (!dest || !from || !to) {
    res.status(400).json({ error: "Missing required params: dest, from, to" });
    return;
  }

  const destCode = (dest as string).toUpperCase();
  const cityName = DEST_TO_CITY[destCode] ?? destCode;

  // Determine the base URL for internal service calls
  const protocol = req.protocol;
  const host = req.get("host");
  const baseUrl = `${protocol}://${host}`;

  const trip = await aggregateTrip(baseUrl, destCode, cityName, from as string, to as string);
  res.json(trip);
});

export const tripController = router;
```

- [ ] **Step 10.4** Run test (should pass)

```bash
cd apps/bff/server
npx vitest run src/bff/tripController.test.ts
```

Expected: 6 tests pass.

- [ ] **Step 10.5** Commit

```bash
git add apps/bff/server/src/bff/tripController.ts apps/bff/server/src/bff/tripController.test.ts
git commit -m "feat(bff): add trip controller — GET /api/trip endpoint"
```

---

## Task 11: Server Entry Point

- [ ] **Step 11.1** Write integration test `apps/bff/server/src/index.test.ts`

```typescript
import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "./index.js";

const app = createApp();

describe("integration: full server", () => {
  it("GET /external/flights returns raw camelCase data", async () => {
    const res = await request(app)
      .get("/external/flights")
      .query({
        origin: "NYC",
        destination: "PAR",
        departDate: "2026-06-01",
        returnDate: "2026-06-07",
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.data.outbound[0]).toHaveProperty("priceInCents");
  });

  it("GET /external/hotels returns raw snake_case data", async () => {
    const res = await request(app)
      .get("/external/hotels")
      .query({
        destination: "paris",
        checkin: "01-06-2026",
        checkout: "07-06-2026",
      });

    expect(res.status).toBe(200);
    expect(res.body.result_code).toBe(200);
    expect(res.body.hotels_found[0]).toHaveProperty("price_per_night");
  });

  it("GET /external/weather returns raw Kelvin data", async () => {
    const res = await request(app)
      .get("/external/weather")
      .query({
        city: "Paris",
        startDate: "1717200000",
        endDate: "1717718400",
      });

    expect(res.status).toBe(200);
    expect(res.body.forecast[0].temp.min).toBeGreaterThan(200); // Kelvin
  });

  it("GET /api/trip returns clean BFF response", async () => {
    const res = await request(app)
      .get("/api/trip")
      .query({ dest: "PAR", from: "2026-06-01", to: "2026-06-07" });

    expect(res.status).toBe(200);

    // Flights: dollars, not cents
    expect(res.body.flights[0].price).toBeLessThan(10000);
    expect(res.body.flights[0].currency).toBe("USD");

    // Hotels: numbers, not strings; USD, not EUR
    expect(typeof res.body.hotels[0].pricePerNight).toBe("number");
    expect(res.body.hotels[0].currency).toBe("USD");

    // Weather: Celsius, not Kelvin; ISO date, not unix
    expect(res.body.weather[0].tempMax).toBeLessThan(100);
    expect(res.body.weather[0].date).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    // Total cost
    expect(res.body.totalCost.total).toBeGreaterThan(0);
    expect(res.body.totalCost.currency).toBe("USD");
  });
});
```

- [ ] **Step 11.2** Run test (should fail)

```bash
cd apps/bff/server
npx vitest run src/index.test.ts
```

- [ ] **Step 11.3** Implement `apps/bff/server/src/index.ts`

```typescript
import express from "express";
import cors from "cors";
import { flightsApi } from "./mock-apis/flightsApi.js";
import { hotelsApi } from "./mock-apis/hotelsApi.js";
import { weatherApi } from "./mock-apis/weatherApi.js";
import { tripController } from "./bff/tripController.js";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Mount mock "external" APIs (simulating separate microservices)
  app.use("/external/flights", flightsApi);
  app.use("/external/hotels", hotelsApi);
  app.use("/external/weather", weatherApi);

  // Mount BFF endpoint
  app.use("/api", tripController);

  return app;
}

// Only start listening if this file is run directly (not imported for testing)
const isDirectRun = process.argv[1]?.includes("index");
if (isDirectRun) {
  const port = process.env.PORT ?? 3001;
  const app = createApp();
  app.listen(port, () => {
    console.log(`BFF server running at http://localhost:${port}`);
    console.log(`  Mock APIs:  /external/flights, /external/hotels, /external/weather`);
    console.log(`  BFF:        /api/trip?dest=PAR&from=2026-06-01&to=2026-06-07`);
  });
}
```

- [ ] **Step 11.4** Run test (should pass)

```bash
cd apps/bff/server
npx vitest run src/index.test.ts
```

Expected: 4 tests pass.

- [ ] **Step 11.5** Run all server tests

```bash
cd apps/bff/server
npx vitest run
```

Expected: All tests pass (mock APIs + services + aggregator + controller + integration).

- [ ] **Step 11.6** Commit

```bash
git add apps/bff/server/src/index.ts apps/bff/server/src/index.test.ts
git commit -m "feat(bff): add server entry point with integration tests"
```

---

## Task 12: Web Project Setup

- [ ] **Step 12.1** Scaffold Vite + React + TypeScript project

```bash
cd apps/bff
npm create vite@latest web -- --template react-ts
cd apps/bff/web
npm install
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

- [ ] **Step 12.2** Update `apps/bff/web/vite.config.ts`

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:3001",
      "/external": "http://localhost:3001",
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test-setup.ts",
  },
});
```

- [ ] **Step 12.3** Create `apps/bff/web/src/test-setup.ts`

```typescript
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 12.4** Add test script to `apps/bff/web/package.json`

Add to the `"scripts"` block:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 12.5** Verify setup

```bash
cd apps/bff/web
npx vitest run
```

Expected: No test files found (or default App.test passes if scaffolded).

- [ ] **Step 12.6** Commit

```bash
git add apps/bff/web/
git commit -m "feat(bff): scaffold web project with Vite + React + TypeScript"
```

---

## Task 13: API Client

- [ ] **Step 13.1** Create `apps/bff/web/src/api/types.ts`

```typescript
// Mirrors server's clean BFF types — what the UI receives

export interface TripSummary {
  destination: string;
  dates: { from: string; to: string; nights: number };
  flights: FlightOption[];
  hotels: HotelOption[];
  weather: DayForecast[];
  totalCost: { flights: number; hotel: number; total: number; currency: string };
}

export interface FlightOption {
  id: string;
  airline: string;
  departure: string;
  arrival: string;
  duration: string;
  price: number;
  currency: string;
  direction: "outbound" | "return";
}

export interface HotelOption {
  id: string;
  name: string;
  stars: number;
  location: string;
  pricePerNight: number;
  totalPrice: number;
  currency: string;
  rating: number;
  reviewCount: number;
  amenities: string[];
  imageUrl: string;
}

export interface DayForecast {
  date: string;
  tempMin: number;
  tempMax: number;
  condition: string;
  icon: string;
  humidity: number;
  rainChance: number;
}
```

- [ ] **Step 13.2** Create `apps/bff/web/src/api/client.ts`

```typescript
import type { TripSummary } from "./types";

export async function getTrip(dest: string, from: string, to: string): Promise<TripSummary> {
  const params = new URLSearchParams({ dest, from, to });
  const res = await fetch(`/api/trip?${params}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch trip: ${res.status}`);
  }
  return res.json();
}
```

- [ ] **Step 13.3** Commit

```bash
git add apps/bff/web/src/api/
git commit -m "feat(bff): add API client and frontend types"
```

---

## Task 14: SearchForm Component

- [ ] **Step 14.1** Write test `apps/bff/web/src/components/SearchForm.test.tsx`

```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchForm } from "./SearchForm";

describe("SearchForm", () => {
  it("renders destination dropdown with 5 cities", () => {
    render(<SearchForm onSearch={vi.fn()} isLoading={false} />);

    const select = screen.getByLabelText(/destination/i);
    expect(select).toBeInTheDocument();

    const options = screen.getAllByRole("option");
    // 5 cities + 1 placeholder
    expect(options.length).toBe(6);
  });

  it("renders date inputs for from and to", () => {
    render(<SearchForm onSearch={vi.fn()} isLoading={false} />);

    expect(screen.getByLabelText(/from/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/to/i)).toBeInTheDocument();
  });

  it("renders a search button", () => {
    render(<SearchForm onSearch={vi.fn()} isLoading={false} />);

    expect(screen.getByRole("button", { name: /search/i })).toBeInTheDocument();
  });

  it("calls onSearch with dest, from, to when submitted", async () => {
    const onSearch = vi.fn();
    const user = userEvent.setup();

    render(<SearchForm onSearch={onSearch} isLoading={false} />);

    await user.selectOptions(screen.getByLabelText(/destination/i), "PAR");
    await user.clear(screen.getByLabelText(/from/i));
    await user.type(screen.getByLabelText(/from/i), "2026-06-01");
    await user.clear(screen.getByLabelText(/to/i));
    await user.type(screen.getByLabelText(/to/i), "2026-06-07");
    await user.click(screen.getByRole("button", { name: /search/i }));

    expect(onSearch).toHaveBeenCalledWith("PAR", "2026-06-01", "2026-06-07");
  });

  it("disables button when isLoading is true", () => {
    render(<SearchForm onSearch={vi.fn()} isLoading={true} />);

    expect(screen.getByRole("button")).toBeDisabled();
  });
});
```

- [ ] **Step 14.2** Run test (should fail)

```bash
cd apps/bff/web
npx vitest run src/components/SearchForm.test.tsx
```

- [ ] **Step 14.3** Implement `apps/bff/web/src/components/SearchForm.tsx`

```tsx
import { useState, FormEvent } from "react";

interface SearchFormProps {
  onSearch: (dest: string, from: string, to: string) => void;
  isLoading: boolean;
}

const DESTINATIONS = [
  { code: "PAR", name: "Paris" },
  { code: "TYO", name: "Tokyo" },
  { code: "NYC", name: "New York" },
  { code: "BCN", name: "Barcelona" },
  { code: "ROM", name: "Rome" },
];

export function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [dest, setDest] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (dest && from && to) {
      onSearch(dest, from, to);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="search-form">
      <div className="form-field">
        <label htmlFor="destination">Destination</label>
        <select
          id="destination"
          value={dest}
          onChange={(e) => setDest(e.target.value)}
          required
        >
          <option value="">Select a destination</option>
          {DESTINATIONS.map((d) => (
            <option key={d.code} value={d.code}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-field">
        <label htmlFor="from">From</label>
        <input
          id="from"
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          required
        />
      </div>

      <div className="form-field">
        <label htmlFor="to">To</label>
        <input
          id="to"
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          required
        />
      </div>

      <button type="submit" disabled={isLoading}>
        {isLoading ? "Searching..." : "Search"}
      </button>
    </form>
  );
}
```

- [ ] **Step 14.4** Run test (should pass)

```bash
cd apps/bff/web
npx vitest run src/components/SearchForm.test.tsx
```

Expected: 5 tests pass.

- [ ] **Step 14.5** Commit

```bash
git add apps/bff/web/src/components/SearchForm.tsx apps/bff/web/src/components/SearchForm.test.tsx
git commit -m "feat(bff): add SearchForm component with tests"
```

---

## Task 15: Result Components

- [ ] **Step 15.1** Write test `apps/bff/web/src/components/FlightCard.test.tsx`

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FlightCard } from "./FlightCard";
import type { FlightOption } from "../api/types";

const flight: FlightOption = {
  id: "AA-1234",
  airline: "American Airlines",
  departure: "2026-06-01T08:30:00Z",
  arrival: "2026-06-01T20:45:00Z",
  duration: "7h15m",
  price: 450,
  currency: "USD",
  direction: "outbound",
};

describe("FlightCard", () => {
  it("renders airline name", () => {
    render(<FlightCard flight={flight} />);
    expect(screen.getByText("American Airlines")).toBeInTheDocument();
  });

  it("renders price in dollars", () => {
    render(<FlightCard flight={flight} />);
    expect(screen.getByText(/\$450/)).toBeInTheDocument();
  });

  it("renders duration", () => {
    render(<FlightCard flight={flight} />);
    expect(screen.getByText(/7h15m/)).toBeInTheDocument();
  });

  it("renders direction badge", () => {
    render(<FlightCard flight={flight} />);
    expect(screen.getByText(/outbound/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 15.2** Implement `apps/bff/web/src/components/FlightCard.tsx`

```tsx
import type { FlightOption } from "../api/types";

interface FlightCardProps {
  flight: FlightOption;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function FlightCard({ flight }: FlightCardProps) {
  return (
    <div className="flight-card">
      <div className="flight-card-header">
        <span className="airline">{flight.airline}</span>
        <span className={`direction-badge ${flight.direction}`}>
          {flight.direction}
        </span>
      </div>
      <div className="flight-card-body">
        <div className="flight-times">
          <span>{formatTime(flight.departure)}</span>
          <span className="flight-duration">{flight.duration}</span>
          <span>{formatTime(flight.arrival)}</span>
        </div>
        <div className="flight-price">${flight.price.toFixed(2)}</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 15.3** Write test `apps/bff/web/src/components/HotelCard.test.tsx`

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { HotelCard } from "./HotelCard";
import type { HotelOption } from "../api/types";

const hotel: HotelOption = {
  id: "htl_001",
  name: "Le Petit Paris",
  stars: 4,
  location: "12 Rue de Rivoli, 1st Arr.",
  pricePerNight: 200.34,
  totalPrice: 1402.38,
  currency: "USD",
  rating: 8.7,
  reviewCount: 342,
  amenities: ["wifi", "breakfast", "pool"],
  imageUrl: "https://example.com/hotel1.jpg",
};

describe("HotelCard", () => {
  it("renders hotel name", () => {
    render(<HotelCard hotel={hotel} />);
    expect(screen.getByText("Le Petit Paris")).toBeInTheDocument();
  });

  it("renders star rating", () => {
    render(<HotelCard hotel={hotel} />);
    expect(screen.getByText(/4/)).toBeInTheDocument();
  });

  it("renders price per night", () => {
    render(<HotelCard hotel={hotel} />);
    expect(screen.getByText(/\$200\.34/)).toBeInTheDocument();
  });

  it("renders review score", () => {
    render(<HotelCard hotel={hotel} />);
    expect(screen.getByText(/8\.7/)).toBeInTheDocument();
  });

  it("renders amenities", () => {
    render(<HotelCard hotel={hotel} />);
    expect(screen.getByText(/wifi/i)).toBeInTheDocument();
    expect(screen.getByText(/breakfast/i)).toBeInTheDocument();
    expect(screen.getByText(/pool/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 15.4** Implement `apps/bff/web/src/components/HotelCard.tsx`

```tsx
import type { HotelOption } from "../api/types";

interface HotelCardProps {
  hotel: HotelOption;
}

export function HotelCard({ hotel }: HotelCardProps) {
  return (
    <div className="hotel-card">
      <div className="hotel-card-header">
        <h3>{hotel.name}</h3>
        <span className="stars">{"★".repeat(hotel.stars)}{"☆".repeat(5 - hotel.stars)}</span>
      </div>
      <p className="hotel-location">{hotel.location}</p>
      <div className="hotel-card-body">
        <div className="hotel-pricing">
          <span className="price-per-night">${hotel.pricePerNight.toFixed(2)}<small>/night</small></span>
          <span className="total-price">Total: ${hotel.totalPrice.toFixed(2)}</span>
        </div>
        <div className="hotel-rating">
          <span className="rating-score">{hotel.rating}</span>
          <span className="review-count">({hotel.reviewCount} reviews)</span>
        </div>
      </div>
      <div className="hotel-amenities">
        {hotel.amenities.map((a) => (
          <span key={a} className="amenity-tag">{a}</span>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 15.5** Write test `apps/bff/web/src/components/WeatherBadge.test.tsx`

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { WeatherBadge } from "./WeatherBadge";
import type { DayForecast } from "../api/types";

const day: DayForecast = {
  date: "2026-06-01",
  tempMin: 15,
  tempMax: 25,
  condition: "Clear",
  icon: "01d",
  humidity: 55,
  rainChance: 10,
};

describe("WeatherBadge", () => {
  it("renders date", () => {
    render(<WeatherBadge day={day} />);
    expect(screen.getByText(/Jun 1/)).toBeInTheDocument();
  });

  it("renders temperature range", () => {
    render(<WeatherBadge day={day} />);
    expect(screen.getByText(/15/)).toBeInTheDocument();
    expect(screen.getByText(/25/)).toBeInTheDocument();
  });

  it("renders condition", () => {
    render(<WeatherBadge day={day} />);
    expect(screen.getByText("Clear")).toBeInTheDocument();
  });

  it("renders rain chance", () => {
    render(<WeatherBadge day={day} />);
    expect(screen.getByText(/10%/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 15.6** Implement `apps/bff/web/src/components/WeatherBadge.tsx`

```tsx
import type { DayForecast } from "../api/types";

interface WeatherBadgeProps {
  day: DayForecast;
}

function formatDate(iso: string): string {
  const date = new Date(iso + "T00:00:00");
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function WeatherBadge({ day }: WeatherBadgeProps) {
  return (
    <div className="weather-badge">
      <div className="weather-date">{formatDate(day.date)}</div>
      <div className="weather-condition">{day.condition}</div>
      <div className="weather-temps">
        <span className="temp-max">{Math.round(day.tempMax)}°</span>
        <span className="temp-min">{Math.round(day.tempMin)}°</span>
      </div>
      <div className="weather-detail">
        <span>{day.rainChance}% rain</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 15.7** Write test `apps/bff/web/src/components/PriceBreakdown.test.tsx`

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PriceBreakdown } from "./PriceBreakdown";

describe("PriceBreakdown", () => {
  const cost = { flights: 950, hotel: 1402.38, total: 2352.38, currency: "USD" };

  it("renders flights subtotal", () => {
    render(<PriceBreakdown cost={cost} />);
    expect(screen.getByText(/\$950\.00/)).toBeInTheDocument();
  });

  it("renders hotel subtotal", () => {
    render(<PriceBreakdown cost={cost} />);
    expect(screen.getByText(/\$1,402\.38/)).toBeInTheDocument();
  });

  it("renders total", () => {
    render(<PriceBreakdown cost={cost} />);
    expect(screen.getByText(/\$2,352\.38/)).toBeInTheDocument();
  });

  it("labels sections correctly", () => {
    render(<PriceBreakdown cost={cost} />);
    expect(screen.getByText(/flights/i)).toBeInTheDocument();
    expect(screen.getByText(/hotel/i)).toBeInTheDocument();
    expect(screen.getByText(/total/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 15.8** Implement `apps/bff/web/src/components/PriceBreakdown.tsx`

```tsx
interface PriceBreakdownProps {
  cost: { flights: number; hotel: number; total: number; currency: string };
}

function formatCurrency(amount: number): string {
  return amount.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export function PriceBreakdown({ cost }: PriceBreakdownProps) {
  return (
    <div className="price-breakdown">
      <h3>Price Breakdown</h3>
      <div className="price-row">
        <span>Flights</span>
        <span>{formatCurrency(cost.flights)}</span>
      </div>
      <div className="price-row">
        <span>Hotel</span>
        <span>{formatCurrency(cost.hotel)}</span>
      </div>
      <div className="price-row price-total">
        <span>Total</span>
        <span>{formatCurrency(cost.total)}</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 15.9** Write test `apps/bff/web/src/components/LoadingStates.test.tsx`

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LoadingSkeleton } from "./LoadingStates";

describe("LoadingSkeleton", () => {
  it("renders loading text", () => {
    render(<LoadingSkeleton />);
    expect(screen.getByText(/searching/i)).toBeInTheDocument();
  });

  it("renders skeleton cards", () => {
    render(<LoadingSkeleton />);
    const skeletons = screen.getAllByTestId("skeleton-card");
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 15.10** Implement `apps/bff/web/src/components/LoadingStates.tsx`

```tsx
export function LoadingSkeleton() {
  return (
    <div className="loading-skeleton">
      <p className="loading-text">Searching flights, hotels, and weather...</p>
      <div className="skeleton-grid">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton-card" data-testid="skeleton-card">
            <div className="skeleton-line skeleton-title" />
            <div className="skeleton-line skeleton-body" />
            <div className="skeleton-line skeleton-body short" />
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 15.11** Run all component tests

```bash
cd apps/bff/web
npx vitest run src/components/
```

Expected: All tests pass (SearchForm + FlightCard + HotelCard + WeatherBadge + PriceBreakdown + LoadingStates).

- [ ] **Step 15.12** Commit

```bash
git add apps/bff/web/src/components/
git commit -m "feat(bff): add result components — FlightCard, HotelCard, WeatherBadge, PriceBreakdown, LoadingStates"
```

---

## Task 16: TripSummary & App Wiring

- [ ] **Step 16.1** Write test `apps/bff/web/src/components/TripSummary.test.tsx`

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TripSummary } from "./TripSummary";
import type { TripSummary as TripSummaryType } from "../api/types";

const trip: TripSummaryType = {
  destination: "Paris",
  dates: { from: "2026-06-01", to: "2026-06-07", nights: 6 },
  flights: [
    {
      id: "AA-1234",
      airline: "American Airlines",
      departure: "2026-06-01T08:30:00Z",
      arrival: "2026-06-01T20:45:00Z",
      duration: "7h15m",
      price: 450,
      currency: "USD",
      direction: "outbound",
    },
    {
      id: "AF-5678",
      airline: "Air France",
      departure: "2026-06-07T10:00:00Z",
      arrival: "2026-06-07T12:30:00Z",
      duration: "8h30m",
      price: 561.6,
      currency: "USD",
      direction: "return",
    },
  ],
  hotels: [
    {
      id: "htl_001",
      name: "Le Petit Paris",
      stars: 4,
      location: "12 Rue de Rivoli, 1st Arr.",
      pricePerNight: 200.34,
      totalPrice: 1402.38,
      currency: "USD",
      rating: 8.7,
      reviewCount: 342,
      amenities: ["wifi", "breakfast", "pool"],
      imageUrl: "https://example.com/hotel1.jpg",
    },
  ],
  weather: [
    {
      date: "2026-06-01",
      tempMin: 15,
      tempMax: 25,
      condition: "Clear",
      icon: "01d",
      humidity: 55,
      rainChance: 10,
    },
  ],
  totalCost: { flights: 1011.6, hotel: 1402.38, total: 2413.98, currency: "USD" },
};

describe("TripSummary", () => {
  it("renders destination and dates", () => {
    render(<TripSummary trip={trip} />);
    expect(screen.getByText(/Paris/)).toBeInTheDocument();
    expect(screen.getByText(/6 nights/i)).toBeInTheDocument();
  });

  it("renders flight cards", () => {
    render(<TripSummary trip={trip} />);
    expect(screen.getByText("American Airlines")).toBeInTheDocument();
    expect(screen.getByText("Air France")).toBeInTheDocument();
  });

  it("renders hotel cards", () => {
    render(<TripSummary trip={trip} />);
    expect(screen.getByText("Le Petit Paris")).toBeInTheDocument();
  });

  it("renders weather badges", () => {
    render(<TripSummary trip={trip} />);
    expect(screen.getByText("Clear")).toBeInTheDocument();
  });

  it("renders price breakdown", () => {
    render(<TripSummary trip={trip} />);
    expect(screen.getByText(/Total/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 16.2** Implement `apps/bff/web/src/components/TripSummary.tsx`

```tsx
import type { TripSummary as TripSummaryType } from "../api/types";
import { FlightCard } from "./FlightCard";
import { HotelCard } from "./HotelCard";
import { WeatherBadge } from "./WeatherBadge";
import { PriceBreakdown } from "./PriceBreakdown";

interface TripSummaryProps {
  trip: TripSummaryType;
}

export function TripSummary({ trip }: TripSummaryProps) {
  return (
    <div className="trip-summary">
      <div className="trip-header">
        <h2>{trip.destination}</h2>
        <p>
          {trip.dates.from} to {trip.dates.to} ({trip.dates.nights} nights)
        </p>
      </div>

      <section className="trip-section">
        <h3>Flights</h3>
        <div className="card-grid">
          {trip.flights.map((f) => (
            <FlightCard key={f.id} flight={f} />
          ))}
        </div>
      </section>

      <section className="trip-section">
        <h3>Hotels</h3>
        <div className="card-grid">
          {trip.hotels.map((h) => (
            <HotelCard key={h.id} hotel={h} />
          ))}
        </div>
      </section>

      <section className="trip-section">
        <h3>Weather Forecast</h3>
        <div className="weather-grid">
          {trip.weather.map((w) => (
            <WeatherBadge key={w.date} day={w} />
          ))}
        </div>
      </section>

      <PriceBreakdown cost={trip.totalCost} />
    </div>
  );
}
```

- [ ] **Step 16.3** Run TripSummary test

```bash
cd apps/bff/web
npx vitest run src/components/TripSummary.test.tsx
```

Expected: 5 tests pass.

- [ ] **Step 16.4** Implement `apps/bff/web/src/App.tsx`

```tsx
import { useState } from "react";
import { getTrip } from "./api/client";
import type { TripSummary as TripSummaryType } from "./api/types";
import { SearchForm } from "./components/SearchForm";
import { TripSummary } from "./components/TripSummary";
import { LoadingSkeleton } from "./components/LoadingStates";
import "./App.css";

function App() {
  const [trip, setTrip] = useState<TripSummaryType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (dest: string, from: string, to: string) => {
    setIsLoading(true);
    setError(null);
    setTrip(null);

    try {
      const result = await getTrip(dest, from, to);
      setTrip(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Travel Booking</h1>
        <p className="subtitle">Powered by the BFF pattern</p>
      </header>

      <main>
        <SearchForm onSearch={handleSearch} isLoading={isLoading} />

        {isLoading && <LoadingSkeleton />}
        {error && <div className="error-message">{error}</div>}
        {trip && <TripSummary trip={trip} />}
      </main>
    </div>
  );
}

export default App;
```

- [ ] **Step 16.5** Implement `apps/bff/web/src/App.css`

```css
.app {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1rem;
  font-family: system-ui, -apple-system, sans-serif;
}

.app-header {
  text-align: center;
  margin-bottom: 2rem;
}

.app-header h1 {
  margin: 0;
  font-size: 2rem;
}

.subtitle {
  color: #666;
  margin: 0.25rem 0 0;
}

/* Search Form */
.search-form {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
  flex-wrap: wrap;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.form-field label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #555;
}

.form-field select,
.form-field input {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.95rem;
}

.search-form button {
  padding: 0.5rem 1.5rem;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.95rem;
  cursor: pointer;
}

.search-form button:disabled {
  background: #93c5fd;
  cursor: not-allowed;
}

/* Trip Summary */
.trip-summary {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.trip-header {
  margin-bottom: 1.5rem;
}

.trip-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.trip-header p {
  color: #666;
  margin: 0.25rem 0 0;
}

.trip-section {
  margin-bottom: 2rem;
}

.trip-section h3 {
  margin: 0 0 0.75rem;
  font-size: 1.1rem;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 0.5rem;
}

/* Card Grids */
.card-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
}

.weather-grid {
  display: flex;
  gap: 0.75rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

/* Flight Card */
.flight-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
}

.flight-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.airline {
  font-weight: 600;
}

.direction-badge {
  font-size: 0.75rem;
  padding: 0.15rem 0.5rem;
  border-radius: 12px;
  background: #dbeafe;
  color: #1d4ed8;
}

.direction-badge.return {
  background: #fef3c7;
  color: #92400e;
}

.flight-times {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.flight-duration {
  font-size: 0.8rem;
  color: #888;
}

.flight-card-body {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.flight-price {
  font-size: 1.2rem;
  font-weight: 700;
  color: #2563eb;
}

/* Hotel Card */
.hotel-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
}

.hotel-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.hotel-card-header h3 {
  margin: 0;
  border: none;
  padding: 0;
  font-size: 1rem;
}

.stars {
  color: #f59e0b;
  font-size: 0.9rem;
}

.hotel-location {
  color: #666;
  font-size: 0.85rem;
  margin: 0.25rem 0 0.75rem;
}

.hotel-card-body {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 0.75rem;
}

.hotel-pricing {
  display: flex;
  flex-direction: column;
}

.price-per-night {
  font-size: 1.1rem;
  font-weight: 700;
  color: #2563eb;
}

.price-per-night small {
  font-weight: 400;
  font-size: 0.8rem;
  color: #888;
}

.total-price {
  font-size: 0.8rem;
  color: #666;
}

.hotel-rating {
  text-align: right;
}

.rating-score {
  background: #2563eb;
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-weight: 600;
  font-size: 0.9rem;
}

.review-count {
  display: block;
  font-size: 0.75rem;
  color: #888;
  margin-top: 0.2rem;
}

.hotel-amenities {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.amenity-tag {
  font-size: 0.75rem;
  background: #f3f4f6;
  padding: 0.15rem 0.5rem;
  border-radius: 12px;
  color: #555;
}

/* Weather Badge */
.weather-badge {
  min-width: 100px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 0.75rem;
  text-align: center;
  flex-shrink: 0;
}

.weather-date {
  font-weight: 600;
  font-size: 0.85rem;
  margin-bottom: 0.25rem;
}

.weather-condition {
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 0.25rem;
}

.weather-temps {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

.temp-max {
  font-weight: 700;
}

.temp-min {
  color: #888;
}

.weather-detail {
  font-size: 0.75rem;
  color: #888;
  margin-top: 0.25rem;
}

/* Price Breakdown */
.price-breakdown {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
}

.price-breakdown h3 {
  margin: 0 0 0.75rem;
  font-size: 1.1rem;
}

.price-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.price-total {
  font-weight: 700;
  font-size: 1.1rem;
  border-bottom: none;
  border-top: 2px solid #333;
  margin-top: 0.5rem;
  padding-top: 0.75rem;
}

/* Loading Skeleton */
.loading-skeleton {
  margin-top: 2rem;
}

.loading-text {
  text-align: center;
  color: #888;
}

.skeleton-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(3, 1fr);
}

.skeleton-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
}

.skeleton-line {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.skeleton-title {
  height: 1.2rem;
  width: 60%;
}

.skeleton-body {
  height: 0.9rem;
  width: 100%;
}

.skeleton-body.short {
  width: 40%;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* Error */
.error-message {
  background: #fef2f2;
  color: #dc2626;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  margin-top: 1rem;
}
```

- [ ] **Step 16.6** Write test `apps/bff/web/src/App.test.tsx`

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

// Mock the API client
vi.mock("./api/client", () => ({
  getTrip: vi.fn().mockResolvedValue({
    destination: "Paris",
    dates: { from: "2026-06-01", to: "2026-06-07", nights: 6 },
    flights: [
      {
        id: "AA-1234",
        airline: "American Airlines",
        departure: "2026-06-01T08:30:00Z",
        arrival: "2026-06-01T20:45:00Z",
        duration: "7h15m",
        price: 450,
        currency: "USD",
        direction: "outbound",
      },
    ],
    hotels: [
      {
        id: "htl_001",
        name: "Le Petit Paris",
        stars: 4,
        location: "12 Rue de Rivoli, 1st Arr.",
        pricePerNight: 200.34,
        totalPrice: 1402.38,
        currency: "USD",
        rating: 8.7,
        reviewCount: 342,
        amenities: ["wifi"],
        imageUrl: "https://example.com/hotel1.jpg",
      },
    ],
    weather: [
      {
        date: "2026-06-01",
        tempMin: 15,
        tempMax: 25,
        condition: "Clear",
        icon: "01d",
        humidity: 55,
        rainChance: 10,
      },
    ],
    totalCost: { flights: 450, hotel: 1402.38, total: 1852.38, currency: "USD" },
  }),
}));

describe("App", () => {
  it("renders the header and search form", () => {
    render(<App />);
    expect(screen.getByText("Travel Booking")).toBeInTheDocument();
    expect(screen.getByLabelText(/destination/i)).toBeInTheDocument();
  });

  it("shows results after search", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.selectOptions(screen.getByLabelText(/destination/i), "PAR");
    await user.clear(screen.getByLabelText(/from/i));
    await user.type(screen.getByLabelText(/from/i), "2026-06-01");
    await user.clear(screen.getByLabelText(/to/i));
    await user.type(screen.getByLabelText(/to/i), "2026-06-07");
    await user.click(screen.getByRole("button", { name: /search/i }));

    // Wait for results to appear
    expect(await screen.findByText("Paris")).toBeInTheDocument();
    expect(await screen.findByText("American Airlines")).toBeInTheDocument();
    expect(await screen.findByText("Le Petit Paris")).toBeInTheDocument();
  });
});
```

- [ ] **Step 16.7** Run all web tests

```bash
cd apps/bff/web
npx vitest run
```

Expected: All tests pass.

- [ ] **Step 16.8** Commit

```bash
git add apps/bff/web/src/
git commit -m "feat(bff): add TripSummary, App wiring, and CSS — complete frontend"
```
