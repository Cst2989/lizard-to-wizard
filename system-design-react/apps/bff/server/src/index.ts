import express from "express";
import cors from "cors";
import { flightsApi } from "./mock-apis/flightsApi.js";
import { hotelsApi } from "./mock-apis/hotelsApi.js";
import { weatherApi } from "./mock-apis/weatherApi.js";
import { tripController } from "./bff/tripController.js";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Mount mock "external" APIs (simulating separate microservices)
  app.use("/external/flights", flightsApi);
  app.use("/external/hotels", hotelsApi);
  app.use("/external/weather", weatherApi);

  // Mount BFF endpoint
  app.use("/api", tripController);

  return app;
}

// Only start listening if this file is run directly (not imported for testing)
const isDirectRun = process.argv[1]?.includes("index");
if (isDirectRun) {
  const port = process.env.PORT ?? 3001;
  const app = createApp();
  app.listen(port, () => {
    console.log(`BFF server running at http://localhost:${port}`);
    console.log(`  Mock APIs:  /external/flights, /external/hotels, /external/weather`);
    console.log(`  BFF:        /api/trip?dest=PAR&from=2026-06-01&to=2026-06-07`);
  });
}
