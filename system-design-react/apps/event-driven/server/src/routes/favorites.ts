import { Router, Request, Response } from 'express';

const router = Router();

// In-memory favorites store (resets on server restart)
const favorites: Set<string> = new Set();

// GET /api/favorites — return all favorite match IDs
router.get('/', (_req: Request, res: Response) => {
  res.json(Array.from(favorites));
});

// POST /api/favorites/:matchId — add a match to favorites
router.post('/:matchId', (req: Request, res: Response) => {
  const { matchId } = req.params;
  favorites.add(matchId);
  res.status(201).json({ matchId, favorited: true });
});

// DELETE /api/favorites/:matchId — remove a match from favorites
router.delete('/:matchId', (req: Request, res: Response) => {
  const { matchId } = req.params;
  const deleted = favorites.delete(matchId);

  if (!deleted) {
    res.status(404).json({ error: 'Match not in favorites' });
    return;
  }

  res.json({ matchId, favorited: false });
});

export default router;
