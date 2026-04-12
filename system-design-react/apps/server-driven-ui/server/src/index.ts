import express from 'express';
import cors from 'cors';
import { pagesRouter } from './routes/pages.js';
import { adminRouter } from './routes/admin.js';
import { sseRouter } from './routes/sse.js';

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.use('/api/pages', pagesRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api/events', sseRouter);

  return app;
}

if (process.env.NODE_ENV !== 'test') {
  const app = createApp();
  const PORT = 3002;
  app.listen(PORT, () => {
    console.log(`SDUI server running on http://localhost:${PORT}`);
  });
}
