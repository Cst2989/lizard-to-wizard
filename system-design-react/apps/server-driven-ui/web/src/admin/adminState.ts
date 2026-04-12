export interface AdminConfig {
  home: string;
  restaurants: Record<string, string>;
}

export const HOME_VARIANTS = ['home.json', 'home-v2.json', 'home-promo.json'];
export const RESTAURANT_1_VARIANTS = ['restaurant-1.json', 'restaurant-1-v2.json'];
export const RESTAURANT_2_VARIANTS = ['restaurant-2.json', 'restaurant-2-v2.json'];

export const HOME_VARIANT_LABELS: Record<string, string> = {
  'home.json': 'Banners on top, card grid view',
  'home-v2.json': 'Banners in middle, compact list view',
  'home-promo.json': 'Banners on bottom, cards + offer banners',
};

export const RESTAURANT_1_VARIANT_LABELS: Record<string, string> = {
  'restaurant-1.json': 'Default (list view)',
  'restaurant-1-v2.json': 'Grid view + offers',
};

export const RESTAURANT_2_VARIANT_LABELS: Record<string, string> = {
  'restaurant-2.json': 'Default (list view)',
  'restaurant-2-v2.json': 'Grid view + offers',
};

const DEFAULT_CONFIG: AdminConfig = {
  home: 'home.json',
  restaurants: { '1': 'restaurant-1.json', '2': 'restaurant-2.json' },
};

let currentConfig: AdminConfig = structuredClone(DEFAULT_CONFIG);
let listeners: Array<() => void> = [];

export function getAdminConfig(): AdminConfig {
  return currentConfig;
}

export function setHomeConfig(variant: string): void {
  currentConfig = { ...currentConfig, home: variant };
  notifyListeners();
}

export function setRestaurantConfig(id: string, variant: string): void {
  currentConfig = {
    ...currentConfig,
    restaurants: { ...currentConfig.restaurants, [id]: variant },
  };
  notifyListeners();
}

export function resetAdminConfig(): void {
  currentConfig = structuredClone(DEFAULT_CONFIG);
  notifyListeners();
}

export function subscribeAdminConfig(listener: () => void): () => void {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function notifyListeners(): void {
  listeners.forEach((l) => l());
}
