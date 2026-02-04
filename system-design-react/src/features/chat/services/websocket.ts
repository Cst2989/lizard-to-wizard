// Simulated WebSocket service for chat

import type { Message, User } from '../types';
import { users, allMessages, conversations } from './mockData';

type EventCallback<T = unknown> = (data: T) => void;

interface WebSocketEvents {
  'connection': { status: 'connected' | 'connecting' | 'disconnected' };
  'message:new': Message;
  'message:status': { messageId: string; status: Message['status'] };
  'typing:start': { conversationId: string; userId: string };
  'typing:stop': { conversationId: string; userId: string };
  'presence:change': { userId: string; status: User['status'] };
}

type EventType = keyof WebSocketEvents;

class MockWebSocket {
  private listeners = new Map<string, Set<EventCallback<unknown>>>();
  private connected = false;
  private simulationIntervals: number[] = [];
  private typingTimeouts = new Map<string, number>();

  connect(userId: string): void {
    console.log('[WebSocket] Connecting as user:', userId);
    
    // Simulate connection delay
    this.emit('connection', { status: 'connecting' });
    
    setTimeout(() => {
      this.connected = true;
      this.emit('connection', { status: 'connected' });
      console.log('[WebSocket] Connected');
      
      // Start simulations
      this.startSimulations();
    }, 500);
  }

  disconnect(): void {
    this.connected = false;
    this.simulationIntervals.forEach(id => clearInterval(id));
    this.simulationIntervals = [];
    this.typingTimeouts.forEach(id => clearTimeout(id));
    this.typingTimeouts.clear();
    this.emit('connection', { status: 'disconnected' });
    console.log('[WebSocket] Disconnected');
  }

  on<T extends EventType>(event: T, callback: EventCallback<WebSocketEvents[T]>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback as EventCallback<unknown>);
    
    return () => this.off(event, callback);
  }

  off<T extends EventType>(event: T, callback: EventCallback<WebSocketEvents[T]>): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback as EventCallback<unknown>);
    }
  }

  private emit<T extends EventType>(event: T, data: WebSocketEvents[T]): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(cb => cb(data));
    }
  }

  // Send events to server (simulated)
  send(type: string, payload: Record<string, unknown>): void {
    if (!this.connected) {
      console.warn('[WebSocket] Not connected, message queued');
      return;
    }
    
    console.log('[WebSocket] Sending:', type, payload);
    
    // Handle typing events
    if (type === 'typing:start') {
      // Simulate other user responding with typing
      const convId = payload.conversationId as string;
      this.simulateTypingResponse(convId);
    }
  }

  private startSimulations(): void {
    // Simulate random presence changes
    const presenceInterval = setInterval(() => {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const statuses: User['status'][] = ['online', 'offline', 'away'];
      const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
      
      if (randomUser.status !== newStatus) {
        randomUser.status = newStatus;
        this.emit('presence:change', { userId: randomUser.id, status: newStatus });
      }
    }, 10000); // Every 10 seconds
    
    this.simulationIntervals.push(presenceInterval);

    // Simulate incoming messages occasionally
    const messageInterval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance
        this.simulateIncomingMessage();
      }
    }, 15000); // Every 15 seconds
    
    this.simulationIntervals.push(messageInterval);
  }

  private simulateTypingResponse(conversationId: string): void {
    const conv = conversations.find(c => c.id === conversationId);
    if (!conv) return;
    
    // Find another participant
    const otherUserId = conv.participants.find(p => p !== 'user-1');
    if (!otherUserId) return;
    
    // 50% chance they start typing back
    if (Math.random() > 0.5) {
      setTimeout(() => {
        this.emit('typing:start', { conversationId, userId: otherUserId });
        
        // Stop typing after 2-4 seconds
        const timeout = setTimeout(() => {
          this.emit('typing:stop', { conversationId, userId: otherUserId });
          
          // 70% chance they send a message
          if (Math.random() > 0.3) {
            this.simulateMessageFrom(conversationId, otherUserId);
          }
        }, 2000 + Math.random() * 2000);
        
        this.typingTimeouts.set(`${conversationId}-${otherUserId}`, timeout);
      }, 1000 + Math.random() * 2000);
    }
  }

  private simulateIncomingMessage(): void {
    // Pick a random conversation
    const conv = conversations[Math.floor(Math.random() * conversations.length)];
    const otherUserId = conv.participants.find(p => p !== 'user-1');
    if (!otherUserId) return;
    
    this.simulateMessageFrom(conv.id, otherUserId);
  }

  private simulateMessageFrom(conversationId: string, senderId: string): void {
    const responses = [
      "That sounds good!",
      "Let me think about it",
      "Sure, no problem",
      "Can we talk later?",
      "I'll get back to you on that",
      "Great idea!",
      "Thanks for letting me know",
      "👍",
      "Okay!",
      "Interesting...",
    ];
    
    const message: Message = {
      id: `msg-sim-${Date.now()}`,
      conversationId,
      senderId,
      content: responses[Math.floor(Math.random() * responses.length)],
      timestamp: new Date(),
      status: 'delivered',
    };
    
    // Add to mock data
    if (!allMessages[conversationId]) {
      allMessages[conversationId] = [];
    }
    allMessages[conversationId].push(message);
    
    // Update conversation
    const conv = conversations.find(c => c.id === conversationId);
    if (conv) {
      conv.lastMessage = message;
      conv.updatedAt = message.timestamp;
      conv.unreadCount++;
    }
    
    this.emit('message:new', message);
  }

  // Simulate message status updates
  simulateMessageDelivered(messageId: string): void {
    setTimeout(() => {
      this.emit('message:status', { messageId, status: 'delivered' });
      
      // Then read after a bit
      setTimeout(() => {
        this.emit('message:status', { messageId, status: 'read' });
      }, 1000 + Math.random() * 2000);
    }, 500 + Math.random() * 1000);
  }
}

// Singleton instance
export const chatWebSocket = new MockWebSocket();
