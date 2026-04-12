import { Router, Request, Response } from "express";
import flightsData from "../data/flights.json" with { type: "json" };

const router = Router();

router.get("/", (req: Request, res: Response) => {
  const { destination, departDate, returnDate } = req.query;

  if (!destination || !departDate || !returnDate) {
    res.status(400).json({ status: "error", message: "Missing required params: destination, departDate, returnDate" });
    return;
  }

  const dest = (destination as string).toUpperCase();
  const entry = flightsData[dest as keyof typeof flightsData];

  if (!entry) {
    res.json({
      status: "ok",
      data: { outbound: [], return: [] },
    });
    return;
  }

  res.json({
    status: "ok",
    data: {
      outbound: entry.outbound,
      return: entry.return,
    },
  });
});

export const flightsApi = router;
