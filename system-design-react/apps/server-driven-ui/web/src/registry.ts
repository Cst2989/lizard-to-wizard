import { ComponentRegistry } from './core/ComponentRegistry';
import { Banner } from './components/Banner';
import { RestaurantCard } from './components/RestaurantCard';
import { RestaurantListItem } from './components/RestaurantListItem';
import { FoodItemCard } from './components/FoodItemCard';
import { FoodItemRow } from './components/FoodItemRow';
import { OfferBanner } from './components/OfferBanner';
import { GridLayout } from './components/GridLayout';
import { ListLayout } from './components/ListLayout';

export const registry = new ComponentRegistry();

registry.register('banner', Banner);
registry.register('restaurant-card', RestaurantCard);
registry.register('restaurant-list-item', RestaurantListItem);
registry.register('food-item-card', FoodItemCard);
registry.register('food-item-row', FoodItemRow);
registry.register('offer-banner', OfferBanner);
registry.register('grid', GridLayout);
registry.register('list', ListLayout);
