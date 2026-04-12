import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('GET /api/leagues', () => {
  it('should return all leagues', async () => {
    const res = await request(app).get('/api/leagues');

    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBe(4);
  });

  it('should include Premier League', async () => {
    const res = await request(app).get('/api/leagues');

    const pl = res.body.find((l: any) => l.id === 'pl');
    expect(pl).toBeDefined();
    expect(pl.name).toBe('Premier League');
    expect(pl.country).toBe('England');
  });

  it('should include all expected leagues', async () => {
    const res = await request(app).get('/api/leagues');

    const ids = res.body.map((l: any) => l.id);
    expect(ids).toContain('pl');
    expect(ids).toContain('laliga');
    expect(ids).toContain('seriea');
    expect(ids).toContain('bundes');
  });

  it('each league should have id, name, country, and icon', async () => {
    const res = await request(app).get('/api/leagues');

    for (const league of res.body) {
      expect(league).toHaveProperty('id');
      expect(league).toHaveProperty('name');
      expect(league).toHaveProperty('country');
      expect(league).toHaveProperty('icon');
    }
  });
});
