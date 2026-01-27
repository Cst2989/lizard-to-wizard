<template>
  <div class="websocket-demo">
    <div :class="['status', isConnected ? 'connected' : 'disconnected']">
      Status: {{ isConnected ? 'Connected' : 'Disconnected' }}
    </div>
    
    <div class="controls">
      <button @click="connect" :disabled="isConnected">Connect</button>
      <button @click="disconnect" :disabled="!isConnected">Disconnect</button>
      <button @click="sendTestMessage" :disabled="!isConnected">Send Test Message</button>
    </div>
    
    <div class="message-input" v-if="isConnected">
      <input 
        v-model="messageToSend" 
        @keyup.enter="sendMessage"
        placeholder="Type a message..."
      />
      <button @click="sendMessage">Send</button>
    </div>
    
    <div class="messages">
      <h3>Received Messages (Echoed Back):</h3>
      <div v-if="messages.length === 0" class="no-messages">
        No messages yet. Send a message to see the echo!
      </div>
      <div 
        v-for="message in messages" 
        :key="message.id" 
        class="message"
      >
        <span class="timestamp">{{ message.timestamp }}</span>
        <span class="content">{{ message.content }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import { websocketService } from '../services/websocketService';

export default {
  name: 'WebSocket',
  setup() {
    const messages = ref([]);
    const isConnected = ref(false);
    const messageToSend = ref('');
    const url = 'wss://echo.websocket.org';

    let unsubscribe;

    onMounted(() => {
      unsubscribe = websocketService.subscribe('message', handleMessage);
      updateConnectionStatus();
      const interval = setInterval(updateConnectionStatus, 1000);
      
      onUnmounted(() => {
        clearInterval(interval);
        if (unsubscribe) {
          unsubscribe();
        }
      });
    });

    function connect() {
      websocketService.connect(url);
      updateConnectionStatus();
    }

    function disconnect() {
      websocketService.disconnect();
      updateConnectionStatus();
    }

    function sendTestMessage() {
      const testMessage = `Hello from Vue! Time: ${new Date().toLocaleTimeString()}`;
      websocketService.send(testMessage);
    }

    function sendMessage() {
      if (messageToSend.value.trim()) {
        websocketService.send(messageToSend.value);
        messageToSend.value = '';
      }
    }

    function handleMessage(data) {
      messages.value.unshift({
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        content: data
      });
      
      if (messages.value.length > 10) {
        messages.value = messages.value.slice(0, 10);
      }
    }

    function updateConnectionStatus() {
      isConnected.value = websocketService.isConnected;
    }

    return {
      messages,
      isConnected,
      messageToSend,
      connect,
      disconnect,
      sendTestMessage,
      sendMessage
    }
  }
}
</script>

<style scoped>
.websocket-demo {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.status {
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 20px;
  font-weight: bold;
  text-align: center;
  font-size: 16px;
}

.status.connected {
  background-color: #d4edda;
  color: #155724;
  border: 2px solid #c3e6cb;
}

.status.disconnected {
  background-color: #f8d7da;
  color: #721c24;
  border: 2px solid #f5c6cb;
}

.controls {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.controls button {
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  background-color: #007bff;
  color: white;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.controls button:hover:not(:disabled) {
  background-color: #0056b3;
}

.controls button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
  opacity: 0.7;
}

.message-input {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.message-input input {
  flex: 1;
  padding: 10px;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.message-input input:focus {
  outline: none;
  border-color: #007bff;
}

.message-input button {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  background-color: #28a745;
  color: white;
  cursor: pointer;
  font-weight: 500;
}

.message-input button:hover {
  background-color: #218838;
}

.messages {
  border: 2px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  max-height: 400px;
  overflow-y: auto;
  background-color: #f8f9fa;
}

.messages h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #495057;
  font-size: 18px;
}

.no-messages {
  text-align: center;
  color: #6c757d;
  font-style: italic;
  padding: 20px;
}

.message {
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 6px;
  background-color: white;
  border-left: 4px solid #007bff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.message:last-child {
  margin-bottom: 0;
}

.timestamp {
  display: block;
  font-size: 12px;
  color: #6c757d;
  margin-bottom: 6px;
  font-weight: 500;
}

.content {
  font-family: 'Courier New', monospace;
  background-color: #e9ecef;
  padding: 8px 12px;
  border-radius: 4px;
  word-break: break-word;
  font-size: 14px;
  line-height: 1.4;
  color: #000;
}
</style>
