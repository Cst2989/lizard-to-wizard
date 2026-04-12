import express from 'express';
import cors from 'cors';
import leaguesRouter from './routes/leagues.js';
import matchesRouter from './routes/matches.js';
import eventsRouter from './routes/events.js';
import favoritesRouter from './routes/favorites.js';

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/leagues', leaguesRouter);
app.use('/api', matchesRouter);
app.use('/api', eventsRouter);
app.use('/api/favorites', favoritesRouter);

export default app;
