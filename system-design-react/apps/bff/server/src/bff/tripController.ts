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
