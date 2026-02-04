// Chat feature types

export interface User {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'away';
  lastSeen: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: Date;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  replyTo?: string;
}

export interface Conversation {
  id: string;
  type: 'direct' | 'group';
  participants: string[];
  name?: string;
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: Date;
}

export interface ChatState {
  currentUser: User | null;
  users: Record<string, User>;
  conversations: Record<string, Conversation>;
  messages: Record<string, Message>;
  
  // UI State
  activeConversationId: string | null;
  searchQuery: string;
  
  // Pagination state per conversation
  messagesPagination: Record<string, {
    hasMore: boolean;
    oldestMessageId: string | null;
    isLoading: boolean;
  }>;
  
  // Real-time state
  typingUsers: Record<string, string[]>;
  onlineUsers: Set<string>;
  
  // Connection state
  connectionStatus: 'connected' | 'connecting' | 'disconnected';
}

export type ChatAction =
  | { type: 'SET_CURRENT_USER'; payload: User }
  | { type: 'SET_USERS'; payload: User[] }
  | { type: 'SET_CONVERSATIONS'; payload: Conversation[] }
  | { type: 'SET_ACTIVE_CONVERSATION'; payload: string | null }
  | { type: 'SET_MESSAGES'; payload: { conversationId: string; messages: Message[]; hasMore: boolean } }
  | { type: 'APPEND_OLDER_MESSAGES'; payload: { conversationId: string; messages: Message[]; hasMore: boolean } }
  | { type: 'MESSAGE_ADDED'; payload: Message }
  | { type: 'MESSAGE_CONFIRMED'; payload: { tempId: string; realMessage: Message } }
  | { type: 'MESSAGE_FAILED'; payload: { tempId: string; error: string } }
  | { type: 'MESSAGE_STATUS_UPDATED'; payload: { messageId: string; status: Message['status'] } }
  | { type: 'TYPING_STARTED'; payload: { conversationId: string; userId: string } }
  | { type: 'TYPING_STOPPED'; payload: { conversationId: string; userId: string } }
  | { type: 'USER_STATUS_CHANGED'; payload: { userId: string; status: User['status'] } }
  | { type: 'CONNECTION_STATUS_CHANGED'; payload: ChatState['connectionStatus'] }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_LOADING'; payload: { conversationId: string; isLoading: boolean } }
  | { type: 'CONVERSATION_UPDATED'; payload: Partial<Conversation> & { id: string } };
