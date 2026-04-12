import { Router, Request, Response } from 'express';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const leagues = require('../data/leagues.json');

const router = Router();

// GET /api/leagues — return all leagues
router.get('/', (_req: Request, res: Response) => {
  res.json(leagues);
});

export default router;
