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

  const filteredForecast = cityData.forecast.filter(
    (day) => day.dt >= start && day.dt <= end
  );

  res.json({
    location: cityData.location,
    forecast: filteredForecast,
    units: cityData.units,
  });
});

export const weatherApi = router;
