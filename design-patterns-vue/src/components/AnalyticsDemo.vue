<template>
  <div class="analytics-demo">
    <h1>Analytics Adapter Pattern Demo</h1>
    
    <div class="analytics-services">
      <div class="service-card" v-for="service in activeServices" :key="service.name">
        <h3>{{ service.name }}</h3>
        <div class="status active">Active</div>
      </div>
    </div>

    <div class="demo-actions">
      <h2>Try Analytics Events</h2>
      <div class="buttons">
        <button @click="trackPageView('home')" class="action-btn">
          Track Page View
        </button>
        <button @click="trackButtonClick('demo')" class="action-btn">
          Track Button Click
        </button>
        <button @click="trackPurchase(99.99)" class="action-btn">
          Track Purchase
        </button>
      </div>
    </div>

    <div class="event-log">
      <h2>Event Log</h2>
      <div class="log-entries">
        <div v-for="(event, index) in eventLog" :key="index" class="log-entry">
          <div class="event-header">
            <span class="timestamp">{{ event.timestamp }}</span>
            <span class="event-name">{{ event.name }}</span>
          </div>
          <div class="event-details">
            <pre class="event-data">{{ JSON.stringify(event.data, null, 2) }}</pre>
            <div class="adapters">
              <span v-for="adapter in event.adapters" :key="adapter" class="adapter-tag">
                {{ adapter }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useAnalytics } from '../composables/useAnalytics';

export default {
  name: 'AnalyticsDemo',
  setup() {
    const { analytics, track, page } = useAnalytics();

    // Get active services from the analytics manager
    const activeServices = ref([]);

    // Event log
    const eventLog = ref([]);

    // Subscribe to analytics events
    onMounted(() => {
      // Get active services from the analytics manager
      activeServices.value = analytics.adapters.map(adapter => ({
        name: adapter.name
      }));

      // Subscribe to analytics events
      analytics.addEventListener((event) => {
        eventLog.value.unshift(event);
        
        // Keep only last 10 events
        if (eventLog.value.length > 10) {
          eventLog.value = eventLog.value.slice(0, 10);
        }
      });
    });

    // Track page view
    function trackPageView(pageName) {
      page(pageName, {
        timestamp: new Date().toISOString(),
        url: window.location.href,
        path: window.location.pathname
      });
    }

    // Track button click
    function trackButtonClick(buttonName) {
      track('button_click', {
        button: buttonName,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        path: window.location.pathname
      });
    }

    // Track purchase
    function trackPurchase(amount) {
      track('purchase', {
        amount,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        path: window.location.pathname
      });
    }

    return {
      activeServices,
      eventLog,
      trackPageView,
      trackButtonClick,
      trackPurchase
    }
  }
}
</script>

<style scoped>
.analytics-demo {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

h1 {
  text-align: center;
  color: #1e293b;
  margin-bottom: 2rem;
  font-size: 2rem;
}

.analytics-services {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.service-card {
  background: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.service-card h3 {
  margin: 0 0 0.5rem 0;
  color: #1e293b;
}

.status {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  background: #e2e8f0;
  color: #64748b;
}

.status.active {
  background: #dcfce7;
  color: #16a34a;
}

.demo-actions {
  background: white;
  padding: 2rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.demo-actions h2 {
  margin: 0 0 1rem 0;
  color: #1e293b;
}

.buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.action-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.event-log {
  background: white;
  padding: 2rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.event-log h2 {
  margin: 0 0 1rem 0;
  color: #1e293b;
}

.log-entries {
  max-height: 400px;
  overflow-y: auto;
}

.log-entry {
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
  font-family: 'JetBrains Mono', monospace;
}

.log-entry:last-child {
  border-bottom: none;
}

.event-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.timestamp {
  color: #64748b;
  font-size: 0.875rem;
}

.event-name {
  color: #1e293b;
  font-weight: 500;
}

.event-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.event-data {
  margin: 0;
  padding: 0.5rem;
  background: #f8fafc;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  color: #334155;
}

.adapters {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.adapter-tag {
  background: #e2e8f0;
  color: #475569;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
}

@media (max-width: 640px) {
  .analytics-demo {
    padding: 1rem;
  }
  
  .buttons {
    flex-direction: column;
  }
  
  .action-btn {
    width: 100%;
  }
}
</style>
