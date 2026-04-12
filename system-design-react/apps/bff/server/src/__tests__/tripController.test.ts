import { describe, it, expect } from "vitest";
import request from "supertest";
import express from "express";
import { flightsApi } from "../mock-apis/flightsApi.js";
import { hotelsApi } from "../mock-apis/hotelsApi.js";
import { weatherApi } from "../mock-apis/weatherApi.js";
import { tripController } from "../bff/tripController.js";

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
  }, 30000);
});
