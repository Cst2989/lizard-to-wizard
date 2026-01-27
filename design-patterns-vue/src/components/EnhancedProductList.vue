<!-- components/EnhancedProductList.vue -->
<template>
  <div class="enhanced-product-list">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading products...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon">⚠️</div>
      <h3>Oops! Something went wrong</h3>
      <p>{{ error }}</p>
      <button @click="retry" class="retry-btn">
        Try Again
      </button>
    </div>

    <!-- Empty State -->
    <div v-else-if="isEmpty()" class="empty-container">
      <div class="empty-icon">📦</div>
      <h3>No products found</h3>
      <p>We couldn't find any products. Check back later!</p>
      <button @click="load" class="refresh-btn">
        Refresh
      </button>
    </div>

    <!-- Success State - Render the actual component -->
    <ProductList
      v-else
      :products="data || []"
      @product-click="handleProductClick"
      @add-to-cart="handleAddToCart"
    />

    <!-- Refresh Button (always visible when not loading) -->
    <div v-if="!isLoading" class="actions">
      <button @click="load" class="refresh-btn">
        🔄 Refresh Products
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import ProductList from './ProductsList.vue';
import { useLoading } from '../composables/useLoading';

const props = defineProps({
  category: {
    type: String,
    default: 'all'
  }
});

// API function to fetch products
const fetchProducts = async () => {
  // Simulate API call with random delay and potential failure
  const delay = Math.random() * 2000 + 500; // 500ms to 2.5s
  await new Promise(resolve => setTimeout(resolve, delay));
  
  // Simulate 20% chance of failure for demo
  if (Math.random() < 0.2) {
    throw new Error('Failed to load products. Please try again.');
  }
  
  // Simulate different responses
  const responses = [
    [], // Empty array
    [ // Normal products
      { id: 1, name: 'Wireless Headphones', price: 99.99, image: 'https://placehold.co/600x400' },
      { id: 2, name: 'Smart Watch', price: 199.99, image: 'https://placehold.co/600x400' },
      { id: 3, name: 'Laptop Stand', price: 49.99, image: 'https://placehold.co/600x400' },
      { id: 4, name: 'USB-C Hub', price: 29.99, image: 'https://placehold.co/600x400' },
      { id: 5, name: 'Bluetooth Speaker', price: 79.99, image: 'https://placehold.co/600x400' },
      { id: 6, name: 'Phone Case', price: 19.99, image: 'https://placehold.co/600x400' }
    ]
  ];
  
  return responses[Math.random() < 0.1 ? 0 : 1]; // 10% chance of empty results
};

// Apply loading decorator to the fetch function
const {
  data,
  isLoading,
  error,
  load,
  retry,
  isEmpty
} = useLoading(fetchProducts, {
  loadingDelay: 200,        // Wait 200ms before showing loading (prevents flash)
  minimumLoadingTime: 800,  // Show loading for at least 800ms (feels more natural)
  retryAttempts: 2,         // Retry up to 2 times on failure
  onSuccess: (data) => {
    console.log(`Loaded ${data.length} products successfully`);
  },
  onError: (error) => {
    console.error('Failed to load products:', error);
  }
});

// Event handlers
function handleProductClick(product) {
  console.log('Product clicked:', product);
}

function handleAddToCart(product) {
  console.log('Added to cart:', product);
  // You could show a toast notification here
}
</script>

<style scoped>
.enhanced-product-list {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Error State */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.error-container h3 {
  color: #dc2626;
  margin-bottom: 8px;
}

.error-container p {
  color: #7f1d1d;
  margin-bottom: 20px;
}

/* Empty State */
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-container h3 {
  color: #374151;
  margin-bottom: 8px;
}

.empty-container p {
  color: #6b7280;
  margin-bottom: 20px;
}

/* Action Buttons */
.actions {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

.retry-btn,
.refresh-btn {
  padding: 10px 20px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.retry-btn:hover,
.refresh-btn:hover {
  background-color: #2563eb;
}

.retry-btn {
  background-color: #dc2626;
}

.retry-btn:hover {
  background-color: #b91c1c;
}
</style>
