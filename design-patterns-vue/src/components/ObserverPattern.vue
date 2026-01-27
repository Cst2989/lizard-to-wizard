<template>
  <div class="observer-demo">
    <h1>Observer Pattern Demo</h1>
    
    <!-- Publishers Section -->
    <div class="publishers-section">
      <h2>Publishers (Subjects)</h2>
      
      <!-- Stock Tracker -->
      <div class="publisher-card">
        <h3>📈 Stock Tracker</h3>
        <div class="publisher-controls">
          <input 
            v-model="stockForm.symbol" 
            placeholder="Stock symbol (e.g., AAPL)"
            class="input-field"
          />
          <input 
            v-model.number="stockForm.price" 
            type="number" 
            step="0.01"
            placeholder="Current price"
            class="input-field"
          />
          <input 
            v-model.number="stockForm.change" 
            type="number" 
            step="0.01"
            placeholder="Price change"
            class="input-field"
          />
          <button @click="updateStock" class="publish-btn">
            Update Stock
          </button>
        </div>
      </div>
    </div>

    <!-- Observers Section -->
    <div class="observers-section">
      <h2>Observers (Subscribers)</h2>
      
      <!-- Stock Dashboard Observer -->
      <div class="observer-card">
        <h3>💹 Stock Dashboard</h3>
        <div class="observer-controls">
          <label>
            <input 
              type="checkbox" 
              :checked="observers.stockDashboard.active"
              @change="toggleObserver('stockDashboard')"
            />
            Subscribe to Stock Updates
          </label>
        </div>
        <div class="observer-content">
          <div v-if="stocks.length > 0" class="stocks-list">
            <div 
              v-for="stock in stocks" 
              :key="stock.symbol"
              class="stock-item"
              :class="stock.trend"
            >
              <div class="stock-symbol">{{ stock.symbol }}</div>
              <div class="stock-price">${{ stock.price }}</div>
              <div class="stock-change">
                {{ stock.change > 0 ? '+' : '' }}{{ stock.change }} 
                ({{ stock.changePercent }}%)
              </div>
              <div class="stock-time">{{ formatTime(stock.timestamp) }}</div>
            </div>
          </div>
          <div v-else class="no-content">No stock data yet</div>
        </div>
      </div>

      <!-- Stock Alerts Observer -->
      <div class="observer-card">
        <h3>🔔 Stock Alerts</h3>
        <div class="observer-controls">
          <label>
            <input 
              type="checkbox" 
              :checked="observers.stockAlerts.active"
              @change="toggleObserver('stockAlerts')"
            />
            Subscribe to Stock Alerts
          </label>
          <div v-if="observers.stockAlerts.active" class="filter-controls">
            <label>Alert Threshold:</label>
            <input 
              v-model.number="observers.stockAlerts.threshold" 
              type="number" 
              step="0.01"
              placeholder="Price change threshold"
            />
          </div>
        </div>
        <div class="observer-content">
          <div v-if="stockAlerts.length > 0" class="alerts-list">
            <div 
              v-for="alert in stockAlerts" 
              :key="alert.id"
              class="alert-item"
              :class="alert.type"
            >
              <div class="alert-message">{{ alert.message }}</div>
              <div class="alert-time">{{ formatTime(alert.timestamp) }}</div>
            </div>
          </div>
          <div v-else class="no-content">No alerts yet</div>
        </div>
      </div>

      <!-- Stock Analytics Observer -->
      <div class="observer-card">
        <h3>📊 Stock Analytics</h3>
        <div class="observer-controls">
          <label>
            <input 
              type="checkbox" 
              :checked="observers.stockAnalytics.active"
              @change="toggleObserver('stockAnalytics')"
            />
            Subscribe to Stock Analytics
          </label>
        </div>
        <div class="observer-content">
          <div v-if="stockAnalytics.length > 0" class="analytics-list">
            <div 
              v-for="analytic in stockAnalytics" 
              :key="analytic.id"
              class="analytic-item"
            >
              <div class="analytic-symbol">{{ analytic.symbol }}</div>
              <div class="analytic-stats">
                <div>Avg Price: ${{ analytic.avgPrice }}</div>
                <div>Volatility: {{ analytic.volatility }}%</div>
                <div>Trend: {{ analytic.trend }}</div>
              </div>
              <div class="analytic-time">{{ formatTime(analytic.timestamp) }}</div>
            </div>
          </div>
          <div v-else class="no-content">No analytics yet</div>
        </div>
      </div>
    </div>

    <!-- Statistics -->
    <div class="stats-section">
      <h2>Observer Statistics</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-number">{{ totalObservers }}</div>
          <div class="stat-label">Active Observers</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ stockTracker.observers.length }}</div>
          <div class="stat-label">Stock Subscribers</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ stockAlerts.length }}</div>
          <div class="stat-label">Total Alerts</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ stockAnalytics.length }}</div>
          <div class="stat-label">Analytics Reports</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import { StockTracker, Observer } from '../services/observer';

export default {
  name: 'ObserverPattern',
  setup() {
    // Publishers (Subjects)
    const stockTracker = new StockTracker();

    // Form data
    const stockForm = reactive({
      symbol: '',
      price: 0,
      change: 0
    });

    // Observer data
    const stocks = ref([]);
    const stockAlerts = ref([]);
    const stockAnalytics = ref([]);

    // Observer states
    const observers = reactive({
      stockDashboard: {
        active: false,
        observer: null
      },
      stockAlerts: {
        active: false,
        observer: null,
        threshold: 5
      },
      stockAnalytics: {
        active: false,
        observer: null
      }
    });

    // Computed properties
    const totalObservers = computed(() => {
      return Object.values(observers).filter(obs => obs.active).length;
    });

    // Observer methods
    function toggleObserver(observerName) {
      const observer = observers[observerName];
      
      if (observer.active) {
        // Unsubscribe
        if (observer.observer) {
          observer.observer.unsubscribe();
          observer.observer = null;
        }
        observer.active = false;
      } else {
        // Subscribe
        observer.active = true;
        createObserver(observerName);
      }
    }

    function createObserver(observerName) {
      const observer = observers[observerName];
      
      switch (observerName) {
        case 'stockDashboard':
          observer.observer = new Observer(
            'Stock Dashboard',
            (stockData) => {
              console.log('Dashboard received update:', stockData);
              const existingIndex = stocks.value.findIndex(s => s.symbol === stockData.symbol);
              if (existingIndex !== -1) {
                stocks.value[existingIndex] = stockData;
              } else {
                stocks.value.push(stockData);
              }
            }
          );
          stockTracker.subscribe(observer.observer);
          break;
          
        case 'stockAlerts':
          observer.observer = new Observer(
            'Stock Alerts',
            (stockData) => {
              console.log('Alerts received update:', stockData);
              const threshold = observer.threshold;
              const changePercent = Math.abs(parseFloat(stockData.changePercent));
              
              if (changePercent >= threshold) {
                const alert = {
                  id: Date.now() + Math.random(),
                  message: `${stockData.symbol} price ${stockData.change > 0 ? 'increased' : 'decreased'} by ${changePercent}%`,
                  type: stockData.change > 0 ? 'up' : 'down',
                  timestamp: new Date()
                };
                stockAlerts.value.unshift(alert);
                
                // Keep only last 10 alerts
                if (stockAlerts.value.length > 10) {
                  stockAlerts.value = stockAlerts.value.slice(0, 10);
                }
              }
            }
          );
          stockTracker.subscribe(observer.observer);
          break;
          
        case 'stockAnalytics':
          observer.observer = new Observer(
            'Stock Analytics',
            (stockData) => {
              console.log('Analytics received update:', stockData);
              // Calculate some basic analytics
              const existingAnalytic = stockAnalytics.value.find(a => a.symbol === stockData.symbol);
              const volatility = Math.abs(parseFloat(stockData.changePercent));
              const trend = stockData.change > 0 ? 'Upward' : stockData.change < 0 ? 'Downward' : 'Stable';
              
              const analytic = {
                id: Date.now() + Math.random(),
                symbol: stockData.symbol,
                avgPrice: stockData.price,
                volatility: volatility.toFixed(2),
                trend,
                timestamp: new Date()
              };
              
              if (existingAnalytic) {
                const index = stockAnalytics.value.indexOf(existingAnalytic);
                stockAnalytics.value[index] = analytic;
              } else {
                stockAnalytics.value.unshift(analytic);
              }
              
              // Keep only last 5 analytics
              if (stockAnalytics.value.length > 5) {
                stockAnalytics.value = stockAnalytics.value.slice(0, 5);
              }
            }
          );
          stockTracker.subscribe(observer.observer);
          break;
      }
    }

    // Publisher methods
    function updateStock() {
      if (stockForm.symbol && stockForm.price) {
        console.log('Updating stock with:', stockForm);
        stockTracker.updateStock(
          stockForm.symbol.toUpperCase(),
          parseFloat(stockForm.price),
          parseFloat(stockForm.change)
        );
        
        // Reset form
        stockForm.symbol = '';
        stockForm.price = 0;
        stockForm.change = 0;
      }
    }

    // Utility methods
    function formatTime(timestamp) {
      return new Date(timestamp).toLocaleTimeString();
    }

    // Initialize observers and demo data
    onMounted(() => {
      console.log('Component mounted, initializing observers...');
      // Enable all observers by default
      Object.keys(observers).forEach(key => {
        console.log('Enabling observer:', key);
        toggleObserver(key);
      });
      
      // Generate some sample data
      setTimeout(() => {
        console.log('Sending initial stock updates...');
        stockTracker.updateStock('AAPL', 150.25, 2.35);
        stockTracker.updateStock('GOOGL', 2750.80, -15.20);
        stockTracker.updateStock('MSFT', 280.50, 5.75);
      }, 1000);
    });

    // Cleanup observers on unmount
    onUnmounted(() => {
      console.log('Component unmounting, cleaning up observers...');
      Object.values(observers).forEach(observer => {
        if (observer.observer) {
          observer.observer.unsubscribe();
        }
      });
    });

    return {
      stockForm,
      stocks,
      stockAlerts,
      stockAnalytics,
      observers,
      totalObservers,
      stockTracker,
      toggleObserver,
      updateStock,
      formatTime
    }
  }
}
</script>

<style scoped>
.observer-demo {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Inter', sans-serif;
}

.observer-demo h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 40px;
}

.publishers-section,
.observers-section {
  margin-bottom: 50px;
}

.publishers-section h2,
.observers-section h2,
.stats-section h2 {
  color: #34495e;
  border-bottom: 3px solid #3498db;
  padding-bottom: 10px;
  margin-bottom: 30px;
}

.publisher-card,
.observer-card {
  background: white;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 25px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid #e1e8ed;
}

.publisher-card h3,
.observer-card h3 {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 18px;
}

.publisher-controls {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  align-items: center;
}

.input-field,
.textarea-field,
.select-field {
  padding: 10px 15px;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.input-field:focus,
.textarea-field:focus,
.select-field:focus {
  outline: none;
  border-color: #3498db;
}

.textarea-field {
  min-height: 60px;
  resize: vertical;
  font-family: inherit;
}

.publish-btn {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.publish-btn:hover {
  transform: translateY(-2px);
}

.observer-controls {
  margin-bottom: 20px;
}

.observer-controls label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  margin-bottom: 10px;
}

.filter-controls {
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.observer-content {
  min-height: 100px;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
}

.no-content {
  text-align: center;
  color: #6c757d;
  font-style: italic;
}

/* Stock styles */
.stocks-list {
  display: grid;
  gap: 10px;
}

.stock-item {
  background: white;
  border-radius: 8px;
  padding: 15px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  align-items: center;
  border-left: 4px solid #95a5a6;
}

.stock-item.up { border-left-color: #27ae60; }
.stock-item.down { border-left-color: #e74c3c; }

.stock-symbol {
  font-weight: bold;
  font-size: 16px;
}

.stock-price {
  font-size: 18px;
  font-weight: 600;
}

.stock-change {
  font-weight: 500;
}

.stock-item.up .stock-change { color: #27ae60; }
.stock-item.down .stock-change { color: #e74c3c; }

.stock-time {
  font-size: 12px;
  color: #95a5a6;
  text-align: right;
}

/* Stock Alerts styles */
.alerts-list {
  display: grid;
  gap: 10px;
}

.alert-item {
  background: white;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-left: 4px solid #95a5a6;
}

.alert-item.up { border-left-color: #27ae60; }
.alert-item.down { border-left-color: #e74c3c; }

.alert-message {
  font-size: 14px;
  color: #2c3e50;
}

.alert-time {
  font-size: 11px;
  color: #95a5a6;
}

/* Stock Analytics styles */
.analytics-list {
  display: grid;
  gap: 10px;
}

.analytic-item {
  background: white;
  border-radius: 8px;
  padding: 15px;
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  align-items: center;
  border-left: 4px solid #3498db;
}

.analytic-symbol {
  font-weight: bold;
  font-size: 16px;
}

.analytic-stats {
  display: grid;
  gap: 5px;
  font-size: 14px;
  color: #5a6c7d;
}

.analytic-time {
  font-size: 12px;
  color: #95a5a6;
  text-align: right;
}

/* Stats styles */
.stats-section {
  margin-top: 50px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  padding: 25px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
}

.stat-number {
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Responsive design */
@media (max-width: 768px) {
  .publisher-controls {
    flex-direction: column;
  }
  
  .input-field,
  .textarea-field,
  .select-field {
    width: 100%;
  }
  
  .stock-item,
  .analytic-item {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
