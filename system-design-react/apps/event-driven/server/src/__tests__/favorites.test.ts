import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('Favorites API', () => {
  it('should return empty favorites initially', async () => {
    const res = await request(app).get('/api/favorites');

    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
  });

  it('should add a match to favorites', async () => {
    const res = await request(app).post('/api/favorites/m1');

    expect(res.status).toBe(201);
    expect(res.body.matchId).toBe('m1');
    expect(res.body.favorited).toBe(true);
  });

  it('should return favorites including added match', async () => {
    await request(app).post('/api/favorites/m2');
    const res = await request(app).get('/api/favorites');

    expect(res.status).toBe(200);
    expect(res.body).toContain('m2');
  });

  it('should remove a match from favorites', async () => {
    await request(app).post('/api/favorites/m3');
    const deleteRes = await request(app).delete('/api/favorites/m3');

    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.matchId).toBe('m3');
    expect(deleteRes.body.favorited).toBe(false);
  });

  it('should return 404 when removing non-favorited match', async () => {
    const res = await request(app).delete('/api/favorites/m99');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Match not in favorites');
  });
});
