import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('GET /api/leagues/:id/matches', () => {
  it('should return matches for Premier League', async () => {
    const res = await request(app).get('/api/leagues/pl/matches');

    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body.every((m: any) => m.leagueId === 'pl')).toBe(true);
  });

  it('should return empty array for unknown league', async () => {
    const res = await request(app).get('/api/leagues/unknown/matches');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('should return matches with correct structure', async () => {
    const res = await request(app).get('/api/leagues/pl/matches');

    for (const match of res.body) {
      expect(match).toHaveProperty('id');
      expect(match).toHaveProperty('leagueId');
      expect(match).toHaveProperty('homeTeam');
      expect(match).toHaveProperty('awayTeam');
      expect(match).toHaveProperty('status');
      expect(match).toHaveProperty('homeScore');
      expect(match).toHaveProperty('awayScore');
      expect(match.homeTeam).toHaveProperty('name');
      expect(match.homeTeam).toHaveProperty('shortName');
    }
  });
});

describe('GET /api/matches/:id', () => {
  it('should return a single match by ID', async () => {
    const res = await request(app).get('/api/matches/m1');

    expect(res.status).toBe(200);
    expect(res.body.id).toBe('m1');
    expect(res.body.homeTeam.name).toBe('Arsenal');
    expect(res.body.awayTeam.name).toBe('Chelsea');
  });

  it('should return 404 for unknown match', async () => {
    const res = await request(app).get('/api/matches/unknown');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Match not found');
  });
});
