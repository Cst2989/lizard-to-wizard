import { describe, it, expect } from "vitest";
import request from "supertest";
import express from "express";
import { hotelsApi } from "../mock-apis/hotelsApi.js";

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
