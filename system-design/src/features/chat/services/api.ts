// Mock API service for chat

import type { User, Message, Conversation } from '../types';
import { currentUser, allUsers, conversations, allMessages } from './mockData';

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// API response types
interface ConversationsResponse {
  conversations: Conversation[];
  hasMore: boolean;
}

interface MessagesResponse {
  messages: Message[];
  hasMore: boolean;
  oldestId: string | null;
}

interface SendMessageResponse {
  message: Message;
}

// Mock API class
class ChatAPI {
  private messageIdCounter = 1000;

  async getCurrentUser(): Promise<User> {
    await delay(200);
    return currentUser;
  }

  async getUsers(): Promise<User[]> {
    await delay(200);
    return allUsers;
  }

  async getConversations(): Promise<ConversationsResponse> {
    await delay(300);
    
    // Sort by updatedAt descending
    const sorted = [...conversations].sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
    );
    
    return {
      conversations: sorted,
      hasMore: false,
    };
  }

  async getMessages(
    conversationId: string,
    options: { before?: string; limit?: number } = {}
  ): Promise<MessagesResponse> {
    await delay(400);
    
    const { before, limit = 20 } = options;
    const messages = allMessages[conversationId] || [];
    
    let startIndex = messages.length;
    
    if (before) {
      const beforeIndex = messages.findIndex(m => m.id === before);
      if (beforeIndex !== -1) {
        startIndex = beforeIndex;
      }
    }
    
    const endIndex = startIndex;
    const start = Math.max(0, endIndex - limit);
    const slice = messages.slice(start, endIndex);
    
    return {
      messages: slice,
      hasMore: start > 0,
      oldestId: slice.length > 0 ? slice[0].id : null,
    };
  }

  async sendMessage(
    conversationId: string,
    content: string,
    _tempId: string
  ): Promise<SendMessageResponse> {
    await delay(300 + Math.random() * 200); // Variable delay
    
    const message: Message = {
      id: `msg-server-${this.messageIdCounter++}`,
      conversationId,
      senderId: currentUser.id,
      content,
      timestamp: new Date(),
      status: 'sent',
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
    }
    
    return { message };
  }

  async markAsRead(conversationId: string, lastReadMessageId: string): Promise<void> {
    await delay(100);
    
    const conv = conversations.find(c => c.id === conversationId);
    if (conv) {
      conv.unreadCount = 0;
    }
    
    // Mark messages as read
    const messages = allMessages[conversationId] || [];
    const lastReadIndex = messages.findIndex(m => m.id === lastReadMessageId);
    if (lastReadIndex !== -1) {
      for (let i = 0; i <= lastReadIndex; i++) {
        messages[i].status = 'read';
      }
    }
  }

  async searchMessages(query: string): Promise<Message[]> {
    await delay(300);
    
    const results: Message[] = [];
    const lowerQuery = query.toLowerCase();
    
    Object.values(allMessages).forEach(messages => {
      messages.forEach(msg => {
        if (msg.content.toLowerCase().includes(lowerQuery)) {
          results.push(msg);
        }
      });
    });
    
    return results.slice(0, 20);
  }
}

export const chatAPI = new ChatAPI();
