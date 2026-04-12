import { describe, it, expect, beforeAll, afterAll } from "vitest";
import express from "express";
import { flightsApi } from "../mock-apis/flightsApi.js";
import { hotelsApi } from "../mock-apis/hotelsApi.js";
import { weatherApi } from "../mock-apis/weatherApi.js";
import { convertToUSD } from "../services/currencyService.js";
import { fetchFlights } from "../services/flightsService.js";
import { fetchHotels } from "../services/hotelsService.js";
import { fetchWeather } from "../services/weatherService.js";

// Currency service tests
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

// Flights service tests
describe("flightsService", () => {
  const app = express();
  app.use("/external/flights", flightsApi);

  let testServer: ReturnType<typeof app.listen>;
  let baseUrl: string;

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

// Hotels service tests
describe("hotelsService", () => {
  const app = express();
  app.use("/external/hotels", hotelsApi);

  let testServer: ReturnType<typeof app.listen>;
  let baseUrl: string;

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
    const result = await fetchHotels(baseUrl, "paris", "2026-06-01", "2026-06-07");
    expect(result.hotels_found.length).toBeGreaterThan(0);
  });

  it("returns empty array for unknown destination", async () => {
    const result = await fetchHotels(baseUrl, "atlantis", "2026-06-01", "2026-06-07");
    expect(result.hotels_found).toEqual([]);
  });
});

// Weather service tests
describe("weatherService", () => {
  const app = express();
  app.use("/external/weather", weatherApi);

  let testServer: ReturnType<typeof app.listen>;
  let baseUrl: string;

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
    expect(result.forecast.length).toBeGreaterThan(0);
  });

  it("returns empty forecast for unknown city", async () => {
    const result = await fetchWeather(baseUrl, "Atlantis", "2026-06-01", "2026-06-07");
    expect(result.forecast).toEqual([]);
  });
});
