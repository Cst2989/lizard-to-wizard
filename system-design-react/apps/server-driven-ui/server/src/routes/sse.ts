// GET /api/events — SSE stream
// Sends events when admin changes config
// Both web and mobile clients listen here

import { Router } from 'express';
import { addSSEClient } from '../adminState.js';

const router = Router();

router.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Send initial keepalive
  res.write('data: {"type":"CONNECTED"}\n\n');

  const removeClient = addSSEClient((event, data) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  });

  req.on('close', removeClient);
});

export const sseRouter = router;
