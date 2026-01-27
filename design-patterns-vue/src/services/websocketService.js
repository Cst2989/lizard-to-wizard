// services/websocketService.js
class WebSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.subscribers = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectTimeout = null;
  }

  connect(url = 'wss://echo.websocket.org') {
    if (this.socket && this.isConnected) {
      console.log('Already connected');
      return;
    }

    console.log(`Connecting to ${url}...`);
    this.socket = new WebSocket(url);
    
    this.socket.onopen = () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      console.log('✅ WebSocket connected to:', url);
      
      // Clear any pending reconnect timeout
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = null;
      }
    };

    this.socket.onmessage = (event) => {
      console.log('📨 Received:', event.data);
      this.notifySubscribers('message', event.data);
    };

    this.socket.onclose = (event) => {
      this.isConnected = false;
      console.log('❌ WebSocket closed:', event.code, event.reason);
      
      // Only attempt reconnect if it wasn't a manual disconnect (code 1000)
      if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.attemptReconnect(url);
      }
    };

    this.socket.onerror = (error) => {
      console.error('🔥 WebSocket error:', error);
    };
  }

  subscribe(eventType, callback) {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, []);
    }
    this.subscribers.get(eventType).push(callback);

    console.log(`📡 Subscribed to ${eventType}. Total subscribers: ${this.subscribers.get(eventType).length}`);

    // Return unsubscribe function
    return () => {
      const callbacks = this.subscribers.get(eventType);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
          console.log(`📡 Unsubscribed from ${eventType}. Remaining: ${callbacks.length}`);
        }
      }
    };
  }

  notifySubscribers(eventType, data) {
    const callbacks = this.subscribers.get(eventType);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in subscriber callback:', error);
        }
      });
    }
  }

  send(message) {
    if (this.socket && this.isConnected) {
      this.socket.send(message);
      console.log('📤 Sent:', message);
    } else {
      console.warn('⚠️ Cannot send message: WebSocket not connected');
    }
  }

  attemptReconnect(url) {
    this.reconnectAttempts++;
    const delay = 1000 * this.reconnectAttempts; // Exponential backoff
    
    console.log(`🔄 Reconnecting... attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);
    
    this.reconnectTimeout = setTimeout(() => {
      this.connect(url);
    }, delay);
  }

  disconnect() {
    if (this.socket) {
      console.log('🔌 Manually disconnecting WebSocket');
      
      // Clear any pending reconnect
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = null;
      }
      
      this.socket.close(1000, 'Manual disconnect'); // Normal closure
      this.socket = null;
      this.isConnected = false;
      this.reconnectAttempts = 0;
    }
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();
