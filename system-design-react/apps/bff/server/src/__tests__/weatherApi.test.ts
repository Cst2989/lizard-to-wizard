import { describe, it, expect } from "vitest";
import request from "supertest";
import express from "express";
import { weatherApi } from "../mock-apis/weatherApi.js";

const app = express();
app.use("/external/weather", weatherApi);

describe("GET /external/weather", () => {
  it("returns weather for a valid city", async () => {
    const res = await request(app)
      .get("/external/weather")
      .query({
        city: "Paris",
        startDate: "1780272000",
        endDate: "1780790400",
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
        startDate: "1780272000",
        endDate: "1780790400",
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
      .query({ startDate: "1780272000" });

    expect(res.status).toBe(400);
  });

  it("returns empty forecast for unknown city", async () => {
    const res = await request(app)
      .get("/external/weather")
      .query({
        city: "Atlantis",
        startDate: "1780272000",
        endDate: "1780790400",
      });

    expect(res.status).toBe(200);
    expect(res.body.forecast).toEqual([]);
  });

  it("filters forecast by date range", async () => {
    const res = await request(app)
      .get("/external/weather")
      .query({
        city: "Paris",
        startDate: "1780272000",
        endDate: "1780358400",
      });

    expect(res.status).toBe(200);
    res.body.forecast.forEach((day: { dt: number }) => {
      expect(day.dt).toBeGreaterThanOrEqual(1780272000);
      expect(day.dt).toBeLessThanOrEqual(1780358400);
    });
  });
});
