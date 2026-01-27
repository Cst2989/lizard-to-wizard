<!-- components/ProductList.vue -->
<template>
  <div class="product-list">
    <h2>Products</h2>
    <div class="products-grid">
      <div 
        v-for="product in products" 
        :key="product.id"
        class="product-card"
        @click="$emit('product-click', product)"
      >
        <img :src="product.image" :alt="product.name" />
        <h3>{{ product.name }}</h3>
        <p class="price">${{ product.price }}</p>
        <button @click.stop="$emit('add-to-cart', product)">
          Add to Cart
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
// Simple, clean component - no loading logic
const props = defineProps({
  products: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['product-click', 'add-to-cart']);
</script>

<style scoped>
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.product-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
  cursor: pointer;
  transition: transform 0.2s;
}

.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.product-card img {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 4px;
}

.product-card h3 {
  margin: 10px 0 5px 0;
  font-size: 16px;
}

.price {
  font-size: 18px;
  font-weight: bold;
  color: #2563eb;
  margin: 10px 0;
}

.product-card button {
  width: 100%;
  padding: 8px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.product-card button:hover {
  background-color: #2563eb;
}
</style>
