import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('Integration: Full API flow', () => {
  it('should navigate from leagues to matches to events', async () => {
    // 1. Get all leagues
    const leaguesRes = await request(app).get('/api/leagues');
    expect(leaguesRes.status).toBe(200);
    const premierLeague = leaguesRes.body.find((l: any) => l.id === 'pl');
    expect(premierLeague).toBeDefined();

    // 2. Get matches for Premier League
    const matchesRes = await request(app).get(`/api/leagues/${premierLeague.id}/matches`);
    expect(matchesRes.status).toBe(200);
    expect(matchesRes.body.length).toBeGreaterThan(0);

    const firstMatch = matchesRes.body[0];

    // 3. Get single match detail
    const matchRes = await request(app).get(`/api/matches/${firstMatch.id}`);
    expect(matchRes.status).toBe(200);
    expect(matchRes.body.id).toBe(firstMatch.id);

    // 4. Get events for the match
    const eventsRes = await request(app).get(`/api/matches/${firstMatch.id}/events`);
    expect(eventsRes.status).toBe(200);
    expect(eventsRes.body).toBeInstanceOf(Array);
  });

  it('should support full favorites workflow', async () => {
    // Start with no favorites (may have leftovers from other tests)
    const initialRes = await request(app).get('/api/favorites');
    expect(initialRes.status).toBe(200);

    // Add favorite
    const addRes = await request(app).post('/api/favorites/m5');
    expect(addRes.status).toBe(201);

    // Verify it's in the list
    const listRes = await request(app).get('/api/favorites');
    expect(listRes.body).toContain('m5');

    // Remove favorite
    const removeRes = await request(app).delete('/api/favorites/m5');
    expect(removeRes.status).toBe(200);

    // Verify removal
    const afterRemoveRes = await request(app).get('/api/favorites');
    expect(afterRemoveRes.body).not.toContain('m5');
  });

  it('should filter events by time range for time travel', async () => {
    // Get first half events only
    const firstHalfRes = await request(app).get('/api/matches/m1/events?from=0&to=45');
    expect(firstHalfRes.status).toBe(200);

    for (const event of firstHalfRes.body) {
      expect(event.timestamp).toBeLessThanOrEqual(45);
    }

    // Get second half events only
    const secondHalfRes = await request(app).get('/api/matches/m1/events?from=46&to=90');
    expect(secondHalfRes.status).toBe(200);

    for (const event of secondHalfRes.body) {
      expect(event.timestamp).toBeGreaterThanOrEqual(46);
    }
  });

  it('should return matches across all leagues', async () => {
    const leagues = ['pl', 'laliga', 'seriea', 'bundes'];

    for (const leagueId of leagues) {
      const res = await request(app).get(`/api/leagues/${leagueId}/matches`);
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    }
  });
});
