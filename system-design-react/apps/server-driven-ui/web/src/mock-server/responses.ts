import type { SDUINode } from '../core/types';
import homeDefault from './home.json';
import homeV2 from './home-v2.json';
import homePromo from './home-promo.json';
import restaurant1 from './restaurant-1.json';
import restaurant1V2 from './restaurant-1-v2.json';
import restaurant2 from './restaurant-2.json';
import restaurant2V2 from './restaurant-2-v2.json';
import { getAdminConfig } from '../admin/adminState';

const jsonMap: Record<string, SDUINode> = {
  'home.json': homeDefault as SDUINode,
  'home-v2.json': homeV2 as SDUINode,
  'home-promo.json': homePromo as SDUINode,
  'restaurant-1.json': restaurant1 as SDUINode,
  'restaurant-1-v2.json': restaurant1V2 as SDUINode,
  'restaurant-2.json': restaurant2 as SDUINode,
  'restaurant-2-v2.json': restaurant2V2 as SDUINode,
};

const SIMULATED_DELAY_MS = 300;

export async function fetchPage(page: string): Promise<SDUINode> {
  const config = getAdminConfig();
  let activeFile: string;

  if (page === 'home') {
    activeFile = config.home;
  } else if (page.startsWith('restaurant-')) {
    const id = page.replace('restaurant-', '');
    activeFile = config.restaurants[id] ?? `restaurant-${id}.json`;
  } else {
    throw new Error(`Unknown page: ${page}`);
  }

  const node = jsonMap[activeFile];
  if (!node) {
    throw new Error(`No JSON found for: ${activeFile}`);
  }

  return new Promise((resolve) => {
    setTimeout(() => resolve(node), SIMULATED_DELAY_MS);
  });
}
