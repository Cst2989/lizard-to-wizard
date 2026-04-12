import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('GET /api/matches/:id/events', () => {
  it('should return all events for a match', async () => {
    const res = await request(app).get('/api/matches/m1/events');

    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('should filter events by minute range', async () => {
    const res = await request(app).get('/api/matches/m1/events?from=0&to=45');

    expect(res.status).toBe(200);
    for (const event of res.body) {
      expect(event.timestamp).toBeGreaterThanOrEqual(0);
      expect(event.timestamp).toBeLessThanOrEqual(45);
    }
  });

  it('should return events with correct structure', async () => {
    const res = await request(app).get('/api/matches/m1/events');

    for (const event of res.body) {
      expect(event).toHaveProperty('type');
      expect(event).toHaveProperty('payload');
      expect(event).toHaveProperty('timestamp');
    }
  });

  it('should return empty array for match with no events', async () => {
    const res = await request(app).get('/api/matches/m4/events');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('should return empty array for unknown match', async () => {
    const res = await request(app).get('/api/matches/unknown/events');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('should include MATCH_STARTED as first event', async () => {
    const res = await request(app).get('/api/matches/m1/events');

    expect(res.body[0].type).toBe('MATCH_STARTED');
  });

  it('should include GOAL_SCORED events with player info', async () => {
    const res = await request(app).get('/api/matches/m1/events');

    const goals = res.body.filter((e: any) => e.type === 'GOAL_SCORED');
    expect(goals.length).toBeGreaterThan(0);
    expect(goals[0].payload).toHaveProperty('player');
    expect(goals[0].payload).toHaveProperty('team');
  });
});
