import { Router, Request, Response } from 'express';
import { createRequire } from 'module';
import { MatchSimulator } from '../simulator/MatchSimulator.js';

const require = createRequire(import.meta.url);
const events = require('../data/events.json');

const router = Router();

// GET /api/matches/:id/events?from=0&to=90 — events for a match filtered by minute range
router.get('/matches/:id/events', (req: Request, res: Response) => {
  const matchId = req.params.id;
  const matchEvents = events[matchId as keyof typeof events];

  if (!matchEvents) {
    res.json([]);
    return;
  }

  const from = parseInt(req.query.from as string) || 0;
  const to = parseInt(req.query.to as string) || 90;

  const filtered = (matchEvents as any[]).filter(
    (e: any) => e.timestamp >= from && e.timestamp <= to
  );

  res.json(filtered);
});

// GET /api/matches/:id/stream — SSE stream for live match events
router.get('/matches/:id/stream', (req: Request, res: Response) => {
  const matchId = req.params.id;
  const matchEvents = events[matchId as keyof typeof events];

  if (!matchEvents) {
    res.status(404).json({ error: 'No events found for match' });
    return;
  }

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const simulator = new MatchSimulator(matchId);

  simulator.onEvent((event) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  });

  simulator.start();

  req.on('close', () => {
    simulator.stop();
  });
});

export default router;
