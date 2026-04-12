import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../index.js';
import { resetConfig } from '../adminState.js';

describe('Admin API', () => {
  beforeEach(() => {
    resetConfig();
  });

  describe('GET /api/admin/config', () => {
    it('returns default config', async () => {
      const app = createApp();
      const res = await request(app).get('/api/admin/config');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        home: 'home',
        restaurants: { '1': 'default', '2': 'default' },
      });
    });
  });

  describe('POST /api/admin/config', () => {
    it('updates home config', async () => {
      const app = createApp();
      const res = await request(app)
        .post('/api/admin/config')
        .send({ page: 'home', variant: 'home-v2' });
      expect(res.status).toBe(200);
      expect(res.body.home).toBe('home-v2');
    });

    it('updates restaurant config', async () => {
      const app = createApp();
      const res = await request(app)
        .post('/api/admin/config')
        .send({ page: 'restaurant-1', variant: 'v2' });
      expect(res.status).toBe(200);
      expect(res.body.restaurants['1']).toBe('v2');
    });

    it('returns 400 for unknown page', async () => {
      const app = createApp();
      const res = await request(app)
        .post('/api/admin/config')
        .send({ page: 'unknown', variant: 'v2' });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('POST /api/admin/reset', () => {
    it('resets config to defaults', async () => {
      const app = createApp();

      // Change config first
      await request(app)
        .post('/api/admin/config')
        .send({ page: 'home', variant: 'home-promo' });

      // Reset
      const res = await request(app).post('/api/admin/reset');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        home: 'home',
        restaurants: { '1': 'default', '2': 'default' },
      });
    });
  });
});
