import { ComponentRegistry } from './core/ComponentRegistry';
import { Banner } from './components/Banner';
import { RestaurantCard } from './components/RestaurantCard';
import { FoodItemCard } from './components/FoodItemCard';
import { GridLayout } from './components/GridLayout';
import { ListLayout } from './components/ListLayout';

export const registry = new ComponentRegistry();

registry.register('banner', Banner);
registry.register('restaurant-card', RestaurantCard);
registry.register('food-item-card', FoodItemCard);
registry.register('grid', GridLayout);
registry.register('list', ListLayout);
