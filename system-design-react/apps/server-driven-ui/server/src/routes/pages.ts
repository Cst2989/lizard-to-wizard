// GET /api/pages/:page
// Returns the active JSON config for the requested page
// Uses adminState to determine which variant to serve

import { Router } from 'express';
import { getConfig } from '../adminState.js';

// Import all JSON configs
import home from '../data/home.json' with { type: 'json' };
import homeV2 from '../data/home-v2.json' with { type: 'json' };
import homePromo from '../data/home-promo.json' with { type: 'json' };
import restaurant1 from '../data/restaurant-1.json' with { type: 'json' };
import restaurant1V2 from '../data/restaurant-1-v2.json' with { type: 'json' };
import restaurant2 from '../data/restaurant-2.json' with { type: 'json' };
import restaurant2V2 from '../data/restaurant-2-v2.json' with { type: 'json' };

const homeVariants: Record<string, unknown> = {
  'home': home,
  'home-v2': homeV2,
  'home-promo': homePromo,
};

const restaurantVariants: Record<string, Record<string, unknown>> = {
  '1': { 'default': restaurant1, 'v2': restaurant1V2 },
  '2': { 'default': restaurant2, 'v2': restaurant2V2 },
};

const router = Router();

router.get('/:page', (req, res) => {
  const { page } = req.params;
  const config = getConfig();

  if (page === 'home') {
    const data = homeVariants[config.home];
    if (!data) return res.status(404).json({ error: 'Unknown home variant' });
    return res.json(data);
  }

  if (page.startsWith('restaurant-')) {
    const id = page.replace('restaurant-', '');
    const variants = restaurantVariants[id];
    if (!variants) return res.status(404).json({ error: `Unknown restaurant: ${id}` });
    const variant = config.restaurants[id] ?? 'default';
    const data = variants[variant];
    if (!data) return res.status(404).json({ error: `Unknown variant: ${variant}` });
    return res.json(data);
  }

  res.status(404).json({ error: `Unknown page: ${page}` });
});

export const pagesRouter = router;
