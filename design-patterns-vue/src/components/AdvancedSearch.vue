<template>
  <div class="search-builder">
    <div class="search-header">
      <h2>Advanced Search Builder</h2>
      <div class="header-actions">
        <button @click="clearQuery" class="btn-secondary">Clear All</button>
        <button @click="executeSearch" class="btn-primary">Search</button>
      </div>
    </div>

    <!-- Query Summary -->
    <div class="query-summary" v-if="hasFilters">
      <h3>Current Query:</h3>
      <p>{{ humanReadableQuery }}</p>
    </div>

     <!-- Query Summary -->
     <div class="query-summary" v-if="hasFilters">
      <h3>API Query:</h3>
      <p>{{ apiQuery }}</p>
    </div>

     <!-- Query Summary -->
     <div class="query-summary" v-if="hasFilters">
      <h3>Search Query:</h3>
      <p>{{ searchQuery }}</p>
    </div>


    <!-- Text Filters -->
    <div class="filter-section">
      <h3>Text Filters</h3>
      <div class="add-filter">
        <select v-model="newTextFilter.field">
          <option value="">Select Field</option>
          <option value="title">Title</option>
          <option value="description">Description</option>
        </select>
        <input v-model="newTextFilter.value" placeholder="Search term..." />
        <button @click="addTextFilter">Add</button>
      </div>
    </div>

    <!-- Categories -->
    <div class="filter-section">
      <h3>Categories</h3>
      <div class="category-grid">
        <div 
          v-for="category in categories" 
          :key="category"
          @click="toggleCategory(category)"
          :class="{ active: selectedCategories.includes(category) }"
        >
          {{ category }}
        </div>
      </div>
    </div>

    <!-- Price Range -->
    <div class="filter-section">
      <h3>Price Range</h3>
      <input v-model.number="priceMin" type="number" placeholder="Min price" />
      <input v-model.number="priceMax" type="number" placeholder="Max price" />
      <button @click="setPriceRange">Set Range</button>
    </div>

    <!-- Results -->
    <div class="results" v-if="searchResults.length > 0">
      <h3>Search Results:</h3>
      <div v-for="result in searchResults" :key="result.id">
        {{ result.title }} - ${{ result.price }}
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { SearchQueryBuilder } from '../services/searchQueryBuilder.js';

export default {
  name: 'AdvancedSearch',
  setup() {
    // Single builder instance
    const queryBuilder = ref(new SearchQueryBuilder());

    // Form data
    const newTextFilter = ref({ field: '', value: '' });
    const selectedCategories = ref([]);
    const priceMin = ref('');
    const priceMax = ref('');
    const searchResults = ref([]);

    // Available options
    const categories = ['Electronics', 'Books', 'Clothing', 'Home'];

    // Computed
    const hasFilters = computed(() => {
      const state = queryBuilder.value.getCurrentState();
      return state.textFilters.length > 0 || 
             state.categories.length > 0 || 
             state.priceRange !== null;
    });

    const humanReadableQuery = computed(() => {
      return queryBuilder.value.buildHumanReadable();
    });

    const apiQuery = computed(() => {
      return queryBuilder.value.buildForAPI();
    });

    const searchQuery = computed(() => {
      return queryBuilder.value.buildForURL();
    });

    // Actions
    function addTextFilter() {
      if (newTextFilter.value.field && newTextFilter.value.value) {
        queryBuilder.value.addTextFilter(
          newTextFilter.value.field, 
          newTextFilter.value.value
        );
        newTextFilter.value = { field: '', value: '' };
      }
    }

    function toggleCategory(category) {
      if (selectedCategories.value.includes(category)) {
        selectedCategories.value = selectedCategories.value.filter(c => c !== category);
        queryBuilder.value.removeCategory(category);
      } else {
        selectedCategories.value.push(category);
        queryBuilder.value.addCategory(category);
      }
    }

    function setPriceRange() {
      if (priceMin.value && priceMax.value) {
        queryBuilder.value.setPriceRange(priceMin.value, priceMax.value);
      }
    }

    function clearQuery() {
      queryBuilder.value.reset();
      selectedCategories.value = [];
      priceMin.value = '';
      priceMax.value = '';
      searchResults.value = [];
    }

    function executeSearch() {
      // Build the query for API
      const apiQuery = queryBuilder.value.buildForAPI();
      console.log('Search query:', apiQuery);
      
      // Simulate API call
      searchResults.value = [
        { id: 1, title: 'Sample Product 1', price: 299 },
        { id: 2, title: 'Sample Product 2', price: 199 }
      ];
    }

    return {
      newTextFilter,
      selectedCategories,
      priceMin,
      priceMax,
      searchResults,
      categories,
      hasFilters,
      humanReadableQuery,
      apiQuery,
      searchQuery,
      addTextFilter,
      toggleCategory,
      setPriceRange,
      clearQuery,
      executeSearch
    }
  }
}
</script>


<style scoped>
.search-builder {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background-color: #f8fafc;
  min-height: 100vh;
}

.search-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 25px 30px;
  border-radius: 16px;
  margin-bottom: 30px;
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
}

.search-header h2 {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.btn-primary {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(79, 70, 229, 0.4);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(79, 70, 229, 0.6);
}

.btn-secondary {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.btn-secondary:hover {
  background-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.query-summary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 16px;
  padding: 25px;
  margin-bottom: 30px;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
}

.query-summary h3 {
  margin: 0 0 15px 0;
  font-size: 20px;
  font-weight: 600;
}

.query-summary p {
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  padding: 15px;
  margin: 0;
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.filter-section {
  background: white;
  border-radius: 16px;
  padding: 25px;
  margin-bottom: 25px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.filter-section:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.filter-section h3 {
  margin: 0 0 20px 0;
  color: #1e293b;
  font-size: 20px;
  font-weight: 700;
  position: relative;
  padding-bottom: 10px;
}

.filter-section h3::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 40px;
  height: 3px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 2px;
}

/* Text Filters */
.add-filter {
  display: grid;
  grid-template-columns: 1fr 2fr auto;
  gap: 15px;
  align-items: center;
}

.add-filter select,
.add-filter input {
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  color: #000;
  transition: all 0.3s ease;
  background-color: #f8fafc;
}

.add-filter select:focus,
.add-filter input:focus {
  outline: none;
  color: #000;
  border-color: #667eea;
  background-color: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.add-filter button {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
}

.add-filter button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.6);
}

/* Categories */
.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 15px;
}

.category-grid > div {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px 15px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  font-size: 14px;
  color: #475569;
  position: relative;
  overflow: hidden;
}

.category-grid > div::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
  transition: left 0.5s;
}

.category-grid > div:hover::before {
  left: 100%;
}

.category-grid > div:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
  border-color: #667eea;
}

.category-grid > div.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: #667eea;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
  transform: translateY(-2px);
}

/* Price Range */
.filter-section:nth-child(4) .add-filter {
  grid-template-columns: 1fr 1fr auto;
}

.filter-section input[type="number"] {
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  background-color: #f8fafc;
}

.filter-section input[type="number"]:focus {
  outline: none;
  border-color: #667eea;
  background-color: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* Results */
.results {
  background: white;
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
  margin-top: 30px;
}

.results h3 {
  margin: 0 0 20px 0;
  color: #1e293b;
  font-size: 20px;
  font-weight: 700;
  position: relative;
  padding-bottom: 10px;
}

.results h3::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 40px;
  height: 3px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 2px;
}

.results > div:not(:first-child) {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 15px 20px;
  margin-bottom: 10px;
  font-weight: 500;
  color: #475569;
  transition: all 0.3s ease;
}

.results > div:not(:first-child):hover {
  transform: translateX(5px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border-color: #667eea;
}

/* Responsive Design */
@media (max-width: 768px) {
  .search-builder {
    padding: 15px;
  }
  
  .search-header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .header-actions {
    width: 100%;
    justify-content: center;
  }
  
  .add-filter {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  
  .category-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 10px;
  }
  
  .search-header h2 {
    font-size: 24px;
  }
}

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.filter-section {
  animation: fadeInUp 0.6s ease-out;
}

.filter-section:nth-child(2) { animation-delay: 0.1s; }
.filter-section:nth-child(3) { animation-delay: 0.2s; }
.filter-section:nth-child(4) { animation-delay: 0.3s; }

/* Loading States */
.btn-primary:disabled {
  background: #94a3b8;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-primary:disabled:hover {
  transform: none;
  box-shadow: none;
}

/* Focus States for Accessibility */
button:focus,
input:focus,
select:focus {
  outline: 2px solid #667eea;
  outline-offset: 2px;
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
}
</style>
