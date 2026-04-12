import { Router, Request, Response } from 'express';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const matches = require('../data/matches.json');

const router = Router();

// GET /api/leagues/:id/matches — matches for a specific league
router.get('/leagues/:id/matches', (req: Request, res: Response) => {
  const leagueId = req.params.id;
  const leagueMatches = matches.filter((m: any) => m.leagueId === leagueId);
  res.json(leagueMatches);
});

// GET /api/matches/:id — single match detail
router.get('/matches/:id', (req: Request, res: Response) => {
  const matchId = req.params.id;
  const match = matches.find((m: any) => m.id === matchId);

  if (!match) {
    res.status(404).json({ error: 'Match not found' });
    return;
  }

  res.json(match);
});

export default router;
