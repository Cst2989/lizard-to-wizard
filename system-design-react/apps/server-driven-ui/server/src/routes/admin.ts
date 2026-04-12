// GET /api/admin/config — returns current config
// POST /api/admin/config — updates config
// POST /api/admin/reset — resets to defaults

import { Router } from 'express';
import { getConfig, setHomeConfig, setRestaurantConfig, resetConfig } from '../adminState.js';

const router = Router();

router.get('/config', (req, res) => {
  res.json(getConfig());
});

router.post('/config', (req, res) => {
  const { page, variant } = req.body;

  if (page === 'home') {
    setHomeConfig(variant);
  } else if (page.startsWith('restaurant-')) {
    const id = page.replace('restaurant-', '');
    setRestaurantConfig(id, variant);
  } else {
    return res.status(400).json({ error: `Unknown page: ${page}` });
  }

  res.json(getConfig());
});

router.post('/reset', (req, res) => {
  resetConfig();
  res.json(getConfig());
});

export const adminRouter = router;
