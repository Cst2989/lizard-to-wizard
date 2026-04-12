import { describe, it, expect, beforeAll, afterAll } from "vitest";
import express from "express";
import { flightsApi } from "../mock-apis/flightsApi.js";
import { hotelsApi } from "../mock-apis/hotelsApi.js";
import { weatherApi } from "../mock-apis/weatherApi.js";
import { aggregateTrip } from "../bff/tripAggregator.js";

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
