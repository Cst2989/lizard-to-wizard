/**
 * Tests for WebSocket Service - Singleton Pattern
 * 
 * The Singleton pattern ensures only one instance of the WebSocket service exists.
 * This is crucial for maintaining a single connection across the application.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { websocketService } from './websocketService-task';

// Mock WebSocket
class MockWebSocket {
  constructor(url) {
    this.url = url;
    this.readyState = 0; // CONNECTING
    this.onopen = null;
    this.onmessage = null;
    this.onclose = null;
    this.onerror = null;
    
    // Simulate connection after a short delay
    setTimeout(() => {
      this.readyState = 1; // OPEN
      if (this.onopen) this.onopen({ type: 'open' });
    }, 10);
  }
  
  send(data) {
    if (this.readyState !== 1) throw new Error('WebSocket not connected');
    // Echo the message back
    setTimeout(() => {
      if (this.onmessage) this.onmessage({ data });
    }, 5);
  }
  
  close(code, reason) {
    this.readyState = 3; // CLOSED
    if (this.onclose) this.onclose({ code, reason });
  }
}

beforeEach(() => {
  vi.stubGlobal('WebSocket', MockWebSocket);
  // Reset service state if disconnect method exists
  if (websocketService.disconnect) {
    websocketService.disconnect();
  }
});

describe('WebSocket Service - Singleton Pattern', () => {
  
  describe('Singleton Instance', () => {
    it('should export a singleton instance, not a class', () => {
      expect(websocketService).toBeDefined();
      expect(typeof websocketService).toBe('object');
      expect(typeof websocketService.connect).toBe('function');
    });

    it('should always return the same instance', () => {
      // The singleton pattern means the same instance is used everywhere
      // We verify the module exports an object, not a class
      expect(typeof websocketService).toBe('object');
      expect(websocketService.constructor.name).toBe('WebSocketService');
    });
  });

  describe('Connection Management', () => {
    it('should have a connect method', () => {
      expect(typeof websocketService.connect).toBe('function');
    });

    it('should have a disconnect method', () => {
      expect(typeof websocketService.disconnect).toBe('function');
    });

    it('should have an isConnected property', () => {
      expect('isConnected' in websocketService).toBe(true);
    });

    it('should set isConnected to true after successful connection', async () => {
      websocketService.connect('wss://test.com');
      
      // Wait for connection
      await new Promise(resolve => setTimeout(resolve, 50));
      
      expect(websocketService.isConnected).toBe(true);
    });

    it('should set isConnected to false after disconnect', async () => {
      websocketService.connect('wss://test.com');
      await new Promise(resolve => setTimeout(resolve, 50));
      
      websocketService.disconnect();
      
      expect(websocketService.isConnected).toBe(false);
    });
  });

  describe('Pub/Sub Pattern', () => {
    it('should have a subscribe method', () => {
      expect(typeof websocketService.subscribe).toBe('function');
    });

    it('should return an unsubscribe function from subscribe', () => {
      const callback = vi.fn();
      const unsubscribe = websocketService.subscribe('message', callback);
      
      expect(typeof unsubscribe).toBe('function');
    });

    it('should notify subscribers when message is received', async () => {
      const callback = vi.fn();
      websocketService.subscribe('message', callback);
      
      websocketService.connect('wss://test.com');
      await new Promise(resolve => setTimeout(resolve, 50));
      
      websocketService.send('Hello');
      await new Promise(resolve => setTimeout(resolve, 50));
      
      expect(callback).toHaveBeenCalledWith('Hello');
    });

    it('should not notify after unsubscribe', async () => {
      const callback = vi.fn();
      const unsubscribe = websocketService.subscribe('message', callback);
      
      unsubscribe();
      
      websocketService.connect('wss://test.com');
      await new Promise(resolve => setTimeout(resolve, 50));
      
      websocketService.send('Hello');
      await new Promise(resolve => setTimeout(resolve, 50));
      
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('Message Sending', () => {
    it('should have a send method', () => {
      expect(typeof websocketService.send).toBe('function');
    });

    it('should send messages when connected', async () => {
      const callback = vi.fn();
      websocketService.subscribe('message', callback);
      
      websocketService.connect('wss://test.com');
      await new Promise(resolve => setTimeout(resolve, 50));
      
      websocketService.send('Test message');
      await new Promise(resolve => setTimeout(resolve, 50));
      
      expect(callback).toHaveBeenCalled();
    });
  });
});

/**
 * WORKSHOP INSTRUCTIONS:
 * 
 * Implement the Singleton pattern in websocketService-task.js
 * 
 * Key concepts:
 * 1. Only ONE instance should exist across the entire application
 * 2. Export the instance, not the class
 * 3. Implement pub/sub for message handling
 * 
 * Methods to implement:
 * - connect(url): Connect to WebSocket server
 * - disconnect(): Cleanly disconnect
 * - send(message): Send message through socket
 * - subscribe(eventType, callback): Subscribe to events, return unsubscribe function
 * - notifySubscribers(eventType, data): Notify all subscribers of an event
 * 
 * Properties:
 * - isConnected: Boolean indicating connection state
 * - socket: The WebSocket instance
 * - subscribers: Map of event types to callbacks
 */
