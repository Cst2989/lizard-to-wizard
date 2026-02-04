// services/websocketService-task.js
// TODO: Implement the Singleton pattern for WebSocket service

class WebSocketService {
  constructor() {
    // TODO: Initialize properties for socket, connection state, subscribers
    // Hint: You need socket, isConnected, subscribers (Map), reconnect logic
  }

  connect(url = 'wss://echo.websocket.org') {
    // TODO: Implement connection logic
    // - Check if already connected
    // - Create new WebSocket
    // - Set up onopen, onmessage, onclose, onerror handlers
    // - Handle reconnection attempts
  }

  subscribe(eventType, callback) {
    // TODO: Implement pub/sub pattern
    // - Store callbacks for event types
    // - Return unsubscribe function
  }

  notifySubscribers(eventType, data) {
    // TODO: Notify all subscribers of an event type
  }

  send(message) {
    // TODO: Send message through WebSocket
    // - Check if connected before sending
  }

  disconnect() {
    // TODO: Clean disconnect
    // - Close socket with code 1000
    // - Clear reconnect timeouts
    // - Reset state
  }
}

// TODO: Export a SINGLETON instance (not the class)
// The singleton pattern ensures only one instance exists
export const websocketService = new WebSocketService();
