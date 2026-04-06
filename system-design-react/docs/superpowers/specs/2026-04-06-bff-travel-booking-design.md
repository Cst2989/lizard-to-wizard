# BFF — Travel Booking App

## Overview

A travel booking app demonstrating the **Backend for Frontend (BFF)** pattern. The frontend calls one BFF endpoint. The BFF server aggregates data from multiple "external" services (flights, hotels, weather), normalizes inconsistent formats, and returns one clean UI-shaped response.

**Audience:** Junior/mid developers seeing BFF for the first time.
**Structure:** Pattern-first — `bff/` contains the aggregation logic, `mock-apis/` simulate messy external services.
**Backend:** Real Node/Express server (BFF is a server-side pattern — must be a real server).

---

## Architecture

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
        currencyService.ts              currency conversion utility
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

---

## Mock APIs (Intentionally Inconsistent)

The entire teaching power of this app comes from these three APIs having **different formats, conventions, and quirks**. This simulates the real world where microservices are built by different teams.

### Flights API — `/external/flights`

```
GET /external/flights?origin=NYC&destination=PAR&departDate=2026-06-01&returnDate=2026-06-07
```

Response (camelCase, prices in cents, nested segments):
```json
{
  "status": "ok",
  "data": {
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
  }
}
```

### Hotels API — `/external/hotels`

```
GET /external/hotels?destination=paris&checkin=01-06-2026&checkout=07-06-2026
```

Response (snake_case, price as string, DD-MM-YYYY dates):
```json
{
  "result_code": 200,
  "hotels_found": [
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
    }
  ]
}
```

### Weather API — `/external/weather`

```
GET /external/weather?city=Paris&startDate=1717200000&endDate=1717718400
```

Response (Kelvin temps, Unix timestamps, wind in m/s):
```json
{
  "location": { "name": "Paris", "country": "FR", "lat": 48.8566, "lon": 2.3522 },
  "forecast": [
    {
      "dt": 1717200000,
      "temp": { "min": 288.15, "max": 298.15 },
      "weather": { "id": 800, "main": "Clear", "description": "clear sky", "icon": "01d" },
      "wind": { "speed": 3.2, "deg": 180 },
      "humidity": 55,
      "precipitation_probability": 0.1
    }
  ],
  "units": "standard"
}
```

---

## BFF Layer

### tripAggregator.ts

```typescript
async function aggregateTrip(dest: string, from: string, to: string): Promise<TripSummary> {
  // 1. Call all services in parallel
  const [flights, hotels, weather] = await Promise.all([
    flightsService.search(origin, dest, from, to),
    hotelsService.search(dest, from, to),
    weatherService.getForecast(dest, from, to),
  ])

  // 2. Transform each into clean, consistent format
  const normalizedFlights = normalizeFlights(flights)   // cents → dollars, consistent shape
  const normalizedHotels = normalizeHotels(hotels)       // snake_case → camelCase, string → number
  const normalizedWeather = normalizeWeather(weather)     // Kelvin → Celsius, unix → date strings

  // 3. Aggregate
  const totalFlightCost = sum of outbound + return flight prices
  const totalHotelCost = hotel price_per_night * nights
  const totalCost = totalFlightCost + totalHotelCost (all in USD)

  // 4. Return UI-shaped response
  return { flights: normalizedFlights, hotels: normalizedHotels, weather: normalizedWeather, totalCost }
}
```

### Clean BFF Response Types

```typescript
// bff/types.ts — what the UI actually receives

interface TripSummary {
  destination: string
  dates: { from: string; to: string; nights: number }
  flights: FlightOption[]
  hotels: HotelOption[]
  weather: DayForecast[]
  totalCost: { flights: number; hotel: number; total: number; currency: string }
}

interface FlightOption {
  id: string
  airline: string
  departure: string         // ISO datetime
  arrival: string           // ISO datetime
  duration: string
  price: number             // dollars, not cents
  currency: string          // always USD
  direction: 'outbound' | 'return'
}

interface HotelOption {
  id: string
  name: string
  stars: number
  location: string          // flattened: "12 Rue de Rivoli, 1st Arr."
  pricePerNight: number     // number, not string
  totalPrice: number
  currency: string          // always USD
  rating: number            // number, not string
  reviewCount: number
  amenities: string[]
  imageUrl: string
}

interface DayForecast {
  date: string              // YYYY-MM-DD, not unix timestamp
  tempMin: number           // Celsius, not Kelvin
  tempMax: number
  condition: string         // "Clear", "Rainy", etc.
  icon: string
  humidity: number
  rainChance: number        // 0-100 percentage
}
```

---

## Frontend

### API Client

```typescript
// api/client.ts — intentionally trivial
async function getTrip(dest: string, from: string, to: string): Promise<TripSummary> {
  const res = await fetch(`/api/trip?dest=${dest}&from=${from}&to=${to}`)
  return res.json()
}
```

That's it. The frontend makes one call and gets exactly what it needs.

### Components

- **SearchForm:** Destination dropdown + date pickers + search button
- **TripSummary:** Main layout rendering flights, hotels, weather sections
- **FlightCard:** Airline, times, duration, price — simple card
- **HotelCard:** Name, stars, price/night, rating, amenities — simple card
- **WeatherBadge:** Day, icon, temp range — compact badge
- **PriceBreakdown:** Flights subtotal + hotel subtotal = total
- **LoadingStates:** Skeleton cards while BFF aggregates (simulated 1-2s delay)

### Available Destinations (Mock Data)

- Paris, Tokyo, New York, Barcelona, Rome
- Each has pre-built flight, hotel, and weather data in the JSON files

---

## Server Setup

```typescript
// index.ts
const app = express()

// Mount mock "external" APIs (simulating separate microservices)
app.use('/external/flights', flightsApi)
app.use('/external/hotels', hotelsApi)
app.use('/external/weather', weatherApi)

// Mount BFF endpoint
app.use('/api', tripController)

app.listen(3001)
```

Students can hit all endpoints directly:
- `http://localhost:3001/external/flights?...` — see the raw messy data
- `http://localhost:3001/external/hotels?...` — see different messy format
- `http://localhost:3001/api/trip?...` — see the clean BFF response

---

## Tech Stack

- **Server:** Node.js + Express + TypeScript
- **Web:** React 19 + TypeScript + Vite
- **State:** Simple useState (no complex state needed)
- **Styling:** CSS modules — keep it simple
- **Proxy:** Vite dev server proxies `/api` and `/external` to Express

---

## Teaching Moments

1. Open each mock API in browser — "look how different these are"
2. Open tripAggregator.ts — "this is the BFF, it handles the mess"
3. Open the frontend — "the UI just calls one endpoint and renders"
4. The raw service types vs clean BFF types side-by-side
5. `Promise.all` parallelization — BFF doesn't call sequentially
6. Optional exercise: remove the BFF, have frontend call all 3 APIs directly — feel the pain
