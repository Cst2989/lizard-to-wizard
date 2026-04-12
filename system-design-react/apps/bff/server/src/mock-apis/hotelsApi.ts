import { Router, Request, Response } from "express";
import hotelsData from "../data/hotels.json" with { type: "json" };

const router = Router();

router.get("/", (req: Request, res: Response) => {
  const { destination, checkin, checkout } = req.query;

  if (!destination || !checkin || !checkout) {
    res.status(400).json({ result_code: 400, error: "Missing required params: destination, checkin, checkout" });
    return;
  }

  const dest = (destination as string).toLowerCase();
  const hotels = hotelsData[dest as keyof typeof hotelsData];

  if (!hotels) {
    res.json({
      result_code: 200,
      hotels_found: [],
    });
    return;
  }

  res.json({
    result_code: 200,
    hotels_found: hotels,
  });
});

export const hotelsApi = router;
