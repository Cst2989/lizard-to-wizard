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

  const SECONDS_PER_DAY = 86400;
  const daysRequested = Math.max(1, Math.floor((end - start) / SECONDS_PER_DAY) + 1);
  const daysToReturn = Math.min(daysRequested, cityData.forecast.length);

  const forecast = cityData.forecast.slice(0, daysToReturn).map((day, i) => ({
    ...day,
    dt: start + i * SECONDS_PER_DAY,
  }));

  res.json({
    location: cityData.location,
    forecast,
    units: cityData.units,
  });
});

export const weatherApi = router;
