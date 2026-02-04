/**
 * Tests for Search Query Builder - Builder Pattern
 * 
 * The Builder pattern allows constructing complex objects step by step.
 * It's perfect for building search queries with many optional parameters.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SearchQueryBuilder } from './searchQueryBuilder-task';

describe('SearchQueryBuilder - Builder Pattern', () => {
  let builder;

  beforeEach(() => {
    builder = new SearchQueryBuilder();
  });

  describe('Method Chaining', () => {
    it('should return "this" from addTextFilter for chaining', () => {
      const result = builder.addTextFilter('title', 'phone');
      expect(result).toBe(builder);
    });

    it('should return "this" from addCategory for chaining', () => {
      const result = builder.addCategory('Electronics');
      expect(result).toBe(builder);
    });

    it('should return "this" from setPriceRange for chaining', () => {
      const result = builder.setPriceRange(100, 500);
      expect(result).toBe(builder);
    });

    it('should support multiple chained calls', () => {
      const result = builder
        .addTextFilter('title', 'phone')
        .addCategory('Electronics')
        .setPriceRange(100, 500);
      
      expect(result).toBe(builder);
    });
  });

  describe('Text Filters', () => {
    it('should add text filters to query', () => {
      builder.addTextFilter('title', 'phone', 'contains');
      
      const state = builder.getCurrentState();
      expect(state.textFilters).toBeDefined();
      expect(state.textFilters.length).toBe(1);
      expect(state.textFilters[0]).toEqual({
        field: 'title',
        value: 'phone',
        operator: 'contains'
      });
    });

    it('should support multiple text filters', () => {
      builder
        .addTextFilter('title', 'phone')
        .addTextFilter('description', 'wireless');
      
      const state = builder.getCurrentState();
      expect(state.textFilters.length).toBe(2);
    });
  });

  describe('Categories', () => {
    it('should add categories to query', () => {
      builder.addCategory('Electronics');
      
      const state = builder.getCurrentState();
      expect(state.categories).toContain('Electronics');
    });

    it('should not add duplicate categories', () => {
      builder
        .addCategory('Electronics')
        .addCategory('Electronics');
      
      const state = builder.getCurrentState();
      expect(state.categories.filter(c => c === 'Electronics').length).toBe(1);
    });

    it('should remove categories', () => {
      builder
        .addCategory('Electronics')
        .addCategory('Books')
        .removeCategory('Electronics');
      
      const state = builder.getCurrentState();
      expect(state.categories).not.toContain('Electronics');
      expect(state.categories).toContain('Books');
    });
  });

  describe('Price Range', () => {
    it('should set price range', () => {
      builder.setPriceRange(100, 500);
      
      const state = builder.getCurrentState();
      expect(state.priceRange).toEqual({ min: 100, max: 500 });
    });
  });

  describe('Reset', () => {
    it('should reset all filters', () => {
      builder
        .addTextFilter('title', 'phone')
        .addCategory('Electronics')
        .setPriceRange(100, 500)
        .reset();
      
      const state = builder.getCurrentState();
      expect(state.textFilters?.length || 0).toBe(0);
      expect(state.categories?.length || 0).toBe(0);
      expect(state.priceRange).toBeNull();
    });

    it('should return "this" for chaining after reset', () => {
      const result = builder.reset();
      expect(result).toBe(builder);
    });
  });

  describe('Build Methods', () => {
    it('should build query for API', () => {
      builder
        .addTextFilter('title', 'phone')
        .addCategory('Electronics')
        .setPriceRange(100, 500);
      
      const apiQuery = builder.buildForAPI();
      
      expect(apiQuery).toBeDefined();
      expect(apiQuery.filters).toBeDefined();
      expect(apiQuery.filters.text).toBeDefined();
      expect(apiQuery.filters.categories).toContain('Electronics');
      expect(apiQuery.filters.priceRange).toEqual({ min: 100, max: 500 });
    });

    it('should build URL query string', () => {
      builder
        .addCategory('Electronics')
        .setPriceRange(100, 500);
      
      const urlQuery = builder.buildForURL();
      
      expect(typeof urlQuery).toBe('string');
      expect(urlQuery).toContain('categories=Electronics');
      expect(urlQuery).toContain('price_min=100');
      expect(urlQuery).toContain('price_max=500');
    });

    it('should build human readable query', () => {
      builder
        .addTextFilter('title', 'phone')
        .addCategory('Electronics')
        .setPriceRange(100, 500);
      
      const readable = builder.buildHumanReadable();
      
      expect(typeof readable).toBe('string');
      expect(readable.length).toBeGreaterThan(0);
      // Should contain information about the filters
      expect(readable.toLowerCase()).toMatch(/text|title|phone/i);
      expect(readable).toContain('Electronics');
      expect(readable).toMatch(/100.*500|price/i);
    });
  });

  describe('Current State', () => {
    it('should return current state for debugging', () => {
      builder.addTextFilter('title', 'test');
      
      const state = builder.getCurrentState();
      
      expect(state).toBeDefined();
      expect(typeof state).toBe('object');
    });

    it('should return a copy, not the original', () => {
      const state1 = builder.getCurrentState();
      const state2 = builder.getCurrentState();
      
      expect(state1).not.toBe(state2);
    });
  });
});

/**
 * WORKSHOP INSTRUCTIONS:
 * 
 * Implement the Builder pattern in searchQueryBuilder-task.js
 * 
 * Key concepts:
 * 1. Each method returns 'this' for method chaining
 * 2. Build methods create different output formats
 * 3. reset() clears all state
 * 
 * Methods to implement:
 * - addTextFilter(field, value, operator): Add text search filter
 * - addCategory(category): Add category (no duplicates)
 * - removeCategory(category): Remove category
 * - setPriceRange(min, max): Set price filter
 * - setSorting(field, direction): Set sort options
 * - setPagination(page, limit): Set page options
 * - reset(): Clear all filters
 * - buildForAPI(): Build object for API calls
 * - buildForURL(): Build URL query string
 * - buildHumanReadable(): Build human-readable string
 * - getCurrentState(): Return current query state
 */
