// composables/useLoading-task.js
// TODO: Implement the Decorator pattern for adding loading states

import { ref, onMounted } from 'vue';

/**
 * Loading Decorator - Adds loading states to any data fetching operation
 * This "decorates" a fetch function with loading, error, and retry capabilities
 */
export function useLoading(fetchFunction, options = {}) {
  // TODO: Create reactive refs for state
  const data = ref(null);
  const isLoading = ref(false);
  const error = ref(null);

  // TODO: Destructure options with defaults
  const {
    immediate = true,           // Load data immediately on mount
    loadingDelay = 0,          // Delay before showing loading (prevents flashing)
    minimumLoadingTime = 500,  // Minimum time to show loading (prevents flashing)
    onSuccess = null,          // Callback when data loads successfully
    onError = null,            // Callback when error occurs
    retryAttempts = 0          // Number of retry attempts on failure
  } = options;

  const load = async (...args) => {
    // TODO: Implement load function
    // 1. Set isLoading to true (optionally with delay)
    // 2. Call fetchFunction
    // 3. Ensure minimum loading time
    // 4. Handle success/error
    // 5. Call onSuccess/onError callbacks
    // 6. Set isLoading to false
  };

  const retry = () => {
    // TODO: Reset attempts and reload
  };

  // TODO: Auto-load on mount if immediate is true
  if (immediate) {
    onMounted(() => {
      load();
    });
  }

  return {
    data,
    isLoading,
    error,
    load,
    retry,
    
    // TODO: Implement helper functions
    hasData: () => data.value !== null,
    hasError: () => error.value !== null,
    isEmpty: () => data.value !== null && (!Array.isArray(data.value) || data.value.length === 0)
  };
}
