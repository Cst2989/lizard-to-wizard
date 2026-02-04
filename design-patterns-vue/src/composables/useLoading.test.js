/**
 * Tests for useLoading Composable - Decorator Pattern
 * 
 * The Decorator pattern adds behavior to objects without modifying them.
 * useLoading "decorates" any fetch function with loading states.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useLoading } from './useLoading-task';
import { nextTick } from 'vue';

// Mock onMounted to execute callback immediately
vi.mock('vue', async () => {
  const actual = await vi.importActual('vue');
  return {
    ...actual,
    onMounted: (callback) => callback()
  };
});

describe('useLoading - Decorator Pattern', () => {
  
  describe('Return Values', () => {
    it('should return data ref', () => {
      const fetchFn = vi.fn().mockResolvedValue([]);
      const { data } = useLoading(fetchFn, { immediate: false });
      
      expect(data).toBeDefined();
      expect(data.value).toBeNull();
    });

    it('should return isLoading ref', () => {
      const fetchFn = vi.fn().mockResolvedValue([]);
      const { isLoading } = useLoading(fetchFn, { immediate: false });
      
      expect(isLoading).toBeDefined();
      expect(typeof isLoading.value).toBe('boolean');
    });

    it('should return error ref', () => {
      const fetchFn = vi.fn().mockResolvedValue([]);
      const { error } = useLoading(fetchFn, { immediate: false });
      
      expect(error).toBeDefined();
      expect(error.value).toBeNull();
    });

    it('should return load function', () => {
      const fetchFn = vi.fn().mockResolvedValue([]);
      const { load } = useLoading(fetchFn, { immediate: false });
      
      expect(typeof load).toBe('function');
    });

    it('should return retry function', () => {
      const fetchFn = vi.fn().mockResolvedValue([]);
      const { retry } = useLoading(fetchFn, { immediate: false });
      
      expect(typeof retry).toBe('function');
    });

    it('should return helper functions', () => {
      const fetchFn = vi.fn().mockResolvedValue([]);
      const { hasData, hasError, isEmpty } = useLoading(fetchFn, { immediate: false });
      
      expect(typeof hasData).toBe('function');
      expect(typeof hasError).toBe('function');
      expect(typeof isEmpty).toBe('function');
    });
  });

  describe('Loading State', () => {
    it('should set isLoading to true during fetch', async () => {
      let resolvePromise;
      const fetchFn = () => new Promise(resolve => { resolvePromise = resolve; });
      
      const { isLoading, load } = useLoading(fetchFn, { immediate: false, minimumLoadingTime: 0 });
      
      const loadPromise = load();
      await nextTick();
      
      expect(isLoading.value).toBe(true);
      
      resolvePromise([]);
      await loadPromise;
    });

    it('should set isLoading to false after fetch completes', async () => {
      const fetchFn = vi.fn().mockResolvedValue(['item1', 'item2']);
      
      const { isLoading, load } = useLoading(fetchFn, { immediate: false, minimumLoadingTime: 0 });
      
      await load();
      
      expect(isLoading.value).toBe(false);
    });
  });

  describe('Data Handling', () => {
    it('should set data after successful fetch', async () => {
      const mockData = [{ id: 1, name: 'Test' }];
      const fetchFn = vi.fn().mockResolvedValue(mockData);
      
      const { data, load } = useLoading(fetchFn, { immediate: false, minimumLoadingTime: 0 });
      
      await load();
      
      expect(data.value).toEqual(mockData);
    });

    it('should call onSuccess callback on success', async () => {
      const mockData = [{ id: 1 }];
      const fetchFn = vi.fn().mockResolvedValue(mockData);
      const onSuccess = vi.fn();
      
      const { load } = useLoading(fetchFn, { 
        immediate: false, 
        minimumLoadingTime: 0,
        onSuccess 
      });
      
      await load();
      
      expect(onSuccess).toHaveBeenCalledWith(mockData);
    });
  });

  describe('Error Handling', () => {
    it('should set error on fetch failure', async () => {
      const fetchFn = vi.fn().mockRejectedValue(new Error('Network error'));
      
      const { error, load } = useLoading(fetchFn, { 
        immediate: false, 
        minimumLoadingTime: 0,
        retryAttempts: 0 
      });
      
      await load();
      
      expect(error.value).toBe('Network error');
    });

    it('should call onError callback on failure', async () => {
      const fetchFn = vi.fn().mockRejectedValue(new Error('Failed'));
      const onError = vi.fn();
      
      const { load } = useLoading(fetchFn, { 
        immediate: false, 
        minimumLoadingTime: 0,
        retryAttempts: 0,
        onError 
      });
      
      await load();
      
      expect(onError).toHaveBeenCalled();
    });

    it('should clear error on retry', async () => {
      let callCount = 0;
      const fetchFn = vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.reject(new Error('First call failed'));
        }
        return Promise.resolve(['data']);
      });
      
      const { error, load } = useLoading(fetchFn, { 
        immediate: false, 
        minimumLoadingTime: 0,
        retryAttempts: 0 
      });
      
      await load();
      expect(error.value).toBe('First call failed');
      
      await load();
      expect(error.value).toBeNull();
    });
  });

  describe('Helper Functions', () => {
    it('hasData should return true when data exists', async () => {
      const fetchFn = vi.fn().mockResolvedValue([1, 2, 3]);
      
      const { hasData, load } = useLoading(fetchFn, { immediate: false, minimumLoadingTime: 0 });
      
      expect(hasData()).toBe(false);
      
      await load();
      
      expect(hasData()).toBe(true);
    });

    it('isEmpty should return true for empty arrays', async () => {
      const fetchFn = vi.fn().mockResolvedValue([]);
      
      const { isEmpty, load } = useLoading(fetchFn, { immediate: false, minimumLoadingTime: 0 });
      
      await load();
      
      expect(isEmpty()).toBe(true);
    });

    it('isEmpty should return false for non-empty arrays', async () => {
      const fetchFn = vi.fn().mockResolvedValue([1, 2, 3]);
      
      const { isEmpty, load } = useLoading(fetchFn, { immediate: false, minimumLoadingTime: 0 });
      
      await load();
      
      expect(isEmpty()).toBe(false);
    });
  });
});

/**
 * WORKSHOP INSTRUCTIONS:
 * 
 * Implement the Decorator pattern in useLoading-task.js
 * 
 * Key concepts:
 * 1. "Decorates" any fetch function with loading/error states
 * 2. Doesn't modify the original function
 * 3. Adds new capabilities (retry, minimum loading time, callbacks)
 * 
 * Return object:
 * - data: Ref holding the fetched data
 * - isLoading: Ref indicating loading state
 * - error: Ref holding error message
 * - load: Function to trigger fetch
 * - retry: Function to retry after error
 * - hasData: Helper returning boolean
 * - hasError: Helper returning boolean
 * - isEmpty: Helper for empty arrays
 * 
 * Options:
 * - immediate: Load on mount (default true)
 * - loadingDelay: Delay before showing loading
 * - minimumLoadingTime: Min time to show loading
 * - onSuccess: Callback on success
 * - onError: Callback on error
 * - retryAttempts: Number of retries
 */
