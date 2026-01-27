<!-- pages/ProductsPage.vue -->
<template>
  <div class="products-page">
    <h1>Our Products</h1>
    <EnhancedProductList category="electronics" />
  </div>
</template>

<script>
import EnhancedProductList from './EnhancedProductList.vue';

export default {
  name: 'DecoratorPattern',
  components: {
    EnhancedProductList
  }
}
</script>

<style scoped>
.products-page {
  padding: 20px;
}

.products-page h1 {
  text-align: center;
  margin-bottom: 30px;
  color: #1f2937;
}
</style>
