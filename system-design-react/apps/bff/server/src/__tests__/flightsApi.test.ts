import { describe, it, expect } from "vitest";
import request from "supertest";
import express from "express";
import { flightsApi } from "../mock-apis/flightsApi.js";

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
