import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../index.js';
import { resetConfig, setHomeConfig, setRestaurantConfig } from '../adminState.js';

describe('GET /api/pages', () => {
  beforeEach(() => {
    resetConfig();
  });

  it('returns home page JSON', async () => {
    const app = createApp();
    const res = await request(app).get('/api/pages/home');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('type', 'list');
    expect(res.body).toHaveProperty('children');
    expect(Array.isArray(res.body.children)).toBe(true);
  });

  it('returns restaurant-1 page JSON', async () => {
    const app = createApp();
    const res = await request(app).get('/api/pages/restaurant-1');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('type', 'list');
    expect(res.body.children[0].props.title).toBe('Sushi Palace');
  });

  it('returns restaurant-2 page JSON', async () => {
    const app = createApp();
    const res = await request(app).get('/api/pages/restaurant-2');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('type', 'list');
    expect(res.body.children[0].props.title).toBe('Bella Napoli');
  });

  it('returns 404 for unknown page', async () => {
    const app = createApp();
    const res = await request(app).get('/api/pages/unknown');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  it('switches home variant when config changes', async () => {
    const app = createApp();

    // Default home
    const res1 = await request(app).get('/api/pages/home');
    const defaultChildren = res1.body.children;

    // Switch to home-v2
    setHomeConfig('home-v2');
    const res2 = await request(app).get('/api/pages/home');
    expect(res2.status).toBe(200);
    expect(res2.body.children).not.toEqual(defaultChildren);
  });

  it('switches restaurant variant when config changes', async () => {
    const app = createApp();

    // Default restaurant-1
    const res1 = await request(app).get('/api/pages/restaurant-1');
    const defaultChildren = res1.body.children;

    // Switch to v2
    setRestaurantConfig('1', 'v2');
    const res2 = await request(app).get('/api/pages/restaurant-1');
    expect(res2.status).toBe(200);
    expect(res2.body.children).not.toEqual(defaultChildren);
  });
});
