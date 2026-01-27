<script setup lang="ts">
import { ref } from 'vue'
import WebSocket from './components/WebSocket.vue'
import CommandPattern from './components/CommandPattern.vue'
import ObserverPattern from './components/ObserverPattern.vue'
import DecoratorPattern from './components/DecoratorPattern.vue'
import AnalyticsDemo from './components/AnalyticsDemo.vue'
import AdvancedSearch from './components/AdvancedSearch.vue'

const currentDemo = ref('websocket')

const demos = [
  { id: 'websocket', name: 'WebSocket Demo (Singleton)', component: WebSocket },
  { id: 'search', name: 'Advanced Search (Builder)', component: AdvancedSearch },
  { id: 'analytics', name: 'Analytics Demo (Adapter)', component: AnalyticsDemo },
  { id: 'decorator', name: 'Decorator Pattern (Decorator)', component: DecoratorPattern },
  { id: 'command', name: 'Command Pattern (Command)', component: CommandPattern },
  { id: 'observer', name: 'Observer Pattern (Observer)', component: ObserverPattern }
]
</script>

<template>
  <div class="app">
    <nav class="navbar">
      <div class="nav-content">
        <div class="logo">Vue Design Patterns</div>
        <div class="nav-links">
          <button 
            v-for="demo in demos" 
            :key="demo.id"
            @click="currentDemo = demo.id"
            :class="{ active: currentDemo === demo.id }"
          >
            {{ demo.name }}
          </button>
        </div>
      </div>
    </nav>

    <main class="content">
      <component :is="demos.find(d => d.id === currentDemo)?.component" />
    </main>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  background-color: #f8fafc;
}

.navbar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
}

.nav-links {
  display: flex;
  gap: 1rem;
}

.nav-links button {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-links button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.nav-links button.active {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.4);
}

.content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

@media (max-width: 768px) {
  .nav-content {
    flex-direction: column;
    gap: 1rem;
  }
  
  .nav-links {
    width: 100%;
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
