import { describe, it, expect, beforeEach } from 'vitest';
import {
  getAdminConfig,
  setHomeConfig,
  setRestaurantConfig,
  resetAdminConfig,
  HOME_VARIANTS,
  RESTAURANT_1_VARIANTS,
} from './adminState';

describe('adminState', () => {
  beforeEach(() => {
    resetAdminConfig();
  });

  it('returns the default config', () => {
    const config = getAdminConfig();
    expect(config.home).toBe('home.json');
    expect(config.restaurants['1']).toBe('restaurant-1.json');
  });

  it('changes the home config', () => {
    setHomeConfig('home-promo.json');
    expect(getAdminConfig().home).toBe('home-promo.json');
  });

  it('changes a restaurant config', () => {
    setRestaurantConfig('1', 'restaurant-1-v2.json');
    expect(getAdminConfig().restaurants['1']).toBe('restaurant-1-v2.json');
  });

  it('resets to defaults', () => {
    setHomeConfig('home-v2.json');
    resetAdminConfig();
    expect(getAdminConfig().home).toBe('home.json');
  });

  it('exports variant lists', () => {
    expect(HOME_VARIANTS).toEqual(['home.json', 'home-v2.json', 'home-promo.json']);
    expect(RESTAURANT_1_VARIANTS).toEqual(['restaurant-1.json', 'restaurant-1-v2.json']);
  });
});
