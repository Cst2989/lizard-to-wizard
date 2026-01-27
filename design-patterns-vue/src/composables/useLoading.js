// composables/useLoading.js
import { ref, onMounted } from 'vue';

/**
 * Loading Decorator - Adds loading states to any data fetching operation
 * This is the most common decorator pattern in Vue apps
 */
export function useLoading(fetchFunction, options = {}) {
  const data = ref(null);
  const isLoading = ref(false);
  const error = ref(null);

  const {
    immediate = true,           // Load data immediately on mount
    loadingDelay = 0,          // Delay before showing loading (prevents flashing)
    minimumLoadingTime = 500,  // Minimum time to show loading (prevents flashing)
    onSuccess = null,          // Callback when data loads successfully
    onError = null,            // Callback when error occurs
    retryAttempts = 0          // Number of retry attempts on failure
  } = options;

  let loadingTimeout = null;
  let minimumLoadingTimeout = null;
  let currentAttempt = 0;

  const load = async (...args) => {
    try {
      error.value = null;
      
      // Optional delay before showing loading
      if (loadingDelay > 0) {
        loadingTimeout = setTimeout(() => {
          isLoading.value = true;
        }, loadingDelay);
      } else {
        isLoading.value = true;
      }

      const startTime = Date.now();
      const result = await fetchFunction(...args);
      
      // Ensure minimum loading time (prevents flashing)
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < minimumLoadingTime) {
        await new Promise(resolve => {
          minimumLoadingTimeout = setTimeout(resolve, minimumLoadingTime - elapsedTime);
        });
      }

      data.value = result;
      currentAttempt = 0; // Reset retry attempts on success
      
      if (onSuccess) {
        onSuccess(result);
      }

    } catch (err) {
      console.error('Loading error:', err);
      
      // Retry logic
      if (currentAttempt < retryAttempts) {
        currentAttempt++;
        console.log(`Retrying... Attempt ${currentAttempt}/${retryAttempts}`);
        await new Promise(resolve => setTimeout(resolve, 1000 * currentAttempt)); // Exponential backoff
        return load(...args);
      }

      error.value = err.message || 'An error occurred';
      
      if (onError) {
        onError(err);
      }
    } finally {
      // Clear any pending timeouts
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
      }
      if (minimumLoadingTimeout) {
        clearTimeout(minimumLoadingTimeout);
      }
      
      isLoading.value = false;
    }
  };

  const retry = () => {
    currentAttempt = 0;
    load();
  };

  // Auto-load on mount if immediate is true
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
    
    // Computed helpers
    hasData: () => data.value !== null,
    hasError: () => error.value !== null,
    isEmpty: () => data.value !== null && (!Array.isArray(data.value) || data.value.length === 0)
  };
}
