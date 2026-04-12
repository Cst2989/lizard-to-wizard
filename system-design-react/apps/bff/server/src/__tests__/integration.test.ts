import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../index.js";

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
        startDate: "1780272000",
        endDate: "1780790400",
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
