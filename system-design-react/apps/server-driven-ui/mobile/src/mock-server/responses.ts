import type { SDUINode } from '../core/types';
import homeDefault from './home.json';
import homeV2 from './home-v2.json';
import homePromo from './home-promo.json';
import restaurant1 from './restaurant-1.json';
import restaurant1V2 from './restaurant-1-v2.json';

const jsonMap: Record<string, SDUINode> = {
  'home.json': homeDefault as unknown as SDUINode,
  'home-v2.json': homeV2 as unknown as SDUINode,
  'home-promo.json': homePromo as unknown as SDUINode,
  'restaurant-1.json': restaurant1 as unknown as SDUINode,
  'restaurant-1-v2.json': restaurant1V2 as unknown as SDUINode,
};

let activeHome = 'home.json';
let activeRestaurants: Record<string, string> = { '1': 'restaurant-1.json' };

export function setActiveHome(variant: string) {
  activeHome = variant;
}

export function setActiveRestaurant(id: string, variant: string) {
  activeRestaurants[id] = variant;
}

const SIMULATED_DELAY_MS = 300;

export async function fetchPage(page: string): Promise<SDUINode> {
  let activeFile: string;

  if (page === 'home') {
    activeFile = activeHome;
  } else if (page.startsWith('restaurant-')) {
    const id = page.replace('restaurant-', '');
    activeFile = activeRestaurants[id] ?? `restaurant-${id}.json`;
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
