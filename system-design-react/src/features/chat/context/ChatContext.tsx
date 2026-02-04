// Chat Context - Global state management

import { createContext, useContext, useReducer, useEffect, useCallback, type ReactNode } from 'react';
import type { ChatState, ChatAction, Message, User, Conversation } from '../types';
import { chatAPI } from '../services/api';
import { chatWebSocket } from '../services/websocket';

// Initial state
const initialState: ChatState = {
  currentUser: null,
  users: {},
  conversations: {},
  messages: {},
  activeConversationId: null,
  searchQuery: '',
  messagesPagination: {},
  typingUsers: {},
  onlineUsers: new Set(),
  connectionStatus: 'disconnected',
};

// Reducer
function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'SET_CURRENT_USER':
      return { ...state, currentUser: action.payload };
    
    case 'SET_USERS': {
      const users: Record<string, User> = {};
      action.payload.forEach(user => {
        users[user.id] = user;
      });
      return { ...state, users };
    }
    
    case 'SET_CONVERSATIONS': {
      const conversations: Record<string, Conversation> = {};
      action.payload.forEach(conv => {
        conversations[conv.id] = conv;
      });
      return { ...state, conversations };
    }
    
    case 'SET_ACTIVE_CONVERSATION':
      return { ...state, activeConversationId: action.payload };
    
    case 'SET_MESSAGES': {
      const { conversationId, messages: newMessages, hasMore } = action.payload;
      const messagesMap: Record<string, Message> = { ...state.messages };
      newMessages.forEach(msg => {
        messagesMap[msg.id] = msg;
      });
      
      return {
        ...state,
        messages: messagesMap,
        messagesPagination: {
          ...state.messagesPagination,
          [conversationId]: {
            hasMore,
            oldestMessageId: newMessages.length > 0 ? newMessages[0].id : null,
            isLoading: false,
          },
        },
      };
    }
    
    case 'APPEND_OLDER_MESSAGES': {
      const { conversationId, messages: olderMessages, hasMore } = action.payload;
      const messagesMap: Record<string, Message> = { ...state.messages };
      olderMessages.forEach(msg => {
        messagesMap[msg.id] = msg;
      });
      
      return {
        ...state,
        messages: messagesMap,
        messagesPagination: {
          ...state.messagesPagination,
          [conversationId]: {
            hasMore,
            oldestMessageId: olderMessages.length > 0 ? olderMessages[0].id : state.messagesPagination[conversationId]?.oldestMessageId ?? null,
            isLoading: false,
          },
        },
      };
    }
    
    case 'MESSAGE_ADDED':
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.payload.id]: action.payload,
        },
      };
    
    case 'MESSAGE_CONFIRMED': {
      const { tempId, realMessage } = action.payload;
      const newMessages = { ...state.messages };
      delete newMessages[tempId];
      newMessages[realMessage.id] = realMessage;
      return { ...state, messages: newMessages };
    }
    
    case 'MESSAGE_FAILED': {
      const { tempId, error } = action.payload;
      const msg = state.messages[tempId];
      if (!msg) return state;
      return {
        ...state,
        messages: {
          ...state.messages,
          [tempId]: { ...msg, status: 'sending' as const, content: `${msg.content} (Failed: ${error})` },
        },
      };
    }
    
    case 'MESSAGE_STATUS_UPDATED': {
      const { messageId, status } = action.payload;
      const msg = state.messages[messageId];
      if (!msg) return state;
      return {
        ...state,
        messages: {
          ...state.messages,
          [messageId]: { ...msg, status },
        },
      };
    }
    
    case 'TYPING_STARTED': {
      const { conversationId, userId } = action.payload;
      const current = state.typingUsers[conversationId] || [];
      if (current.includes(userId)) return state;
      return {
        ...state,
        typingUsers: {
          ...state.typingUsers,
          [conversationId]: [...current, userId],
        },
      };
    }
    
    case 'TYPING_STOPPED': {
      const { conversationId, userId } = action.payload;
      const current = state.typingUsers[conversationId] || [];
      return {
        ...state,
        typingUsers: {
          ...state.typingUsers,
          [conversationId]: current.filter(id => id !== userId),
        },
      };
    }
    
    case 'USER_STATUS_CHANGED': {
      const { userId, status } = action.payload;
      const user = state.users[userId];
      if (!user) return state;
      
      const onlineUsers = new Set(state.onlineUsers);
      if (status === 'online') {
        onlineUsers.add(userId);
      } else {
        onlineUsers.delete(userId);
      }
      
      return {
        ...state,
        users: {
          ...state.users,
          [userId]: { ...user, status },
        },
        onlineUsers,
      };
    }
    
    case 'CONNECTION_STATUS_CHANGED':
      return { ...state, connectionStatus: action.payload };
    
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    
    case 'SET_LOADING': {
      const { conversationId, isLoading } = action.payload;
      return {
        ...state,
        messagesPagination: {
          ...state.messagesPagination,
          [conversationId]: {
            ...state.messagesPagination[conversationId],
            isLoading,
            hasMore: state.messagesPagination[conversationId]?.hasMore ?? true,
            oldestMessageId: state.messagesPagination[conversationId]?.oldestMessageId ?? null,
          },
        },
      };
    }
    
    case 'CONVERSATION_UPDATED': {
      const conv = state.conversations[action.payload.id];
      if (!conv) return state;
      return {
        ...state,
        conversations: {
          ...state.conversations,
          [action.payload.id]: { ...conv, ...action.payload },
        },
      };
    }
    
    default:
      return state;
  }
}

// Context
interface ChatContextValue {
  state: ChatState;
  dispatch: React.Dispatch<ChatAction>;
  actions: {
    loadConversations: () => Promise<void>;
    loadMessages: (conversationId: string) => Promise<void>;
    loadOlderMessages: (conversationId: string) => Promise<void>;
    sendMessage: (content: string) => Promise<void>;
    selectConversation: (conversationId: string | null) => void;
    sendTyping: (conversationId: string) => void;
    stopTyping: (conversationId: string) => void;
  };
}

const ChatContext = createContext<ChatContextValue | null>(null);

// Provider
export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  // Initialize app
  useEffect(() => {
    async function init() {
      try {
        // Load current user
        const user = await chatAPI.getCurrentUser();
        dispatch({ type: 'SET_CURRENT_USER', payload: user });
        
        // Load all users
        const users = await chatAPI.getUsers();
        dispatch({ type: 'SET_USERS', payload: users });
        
        // Connect WebSocket
        chatWebSocket.connect(user.id);
      } catch (error) {
        console.error('Failed to initialize chat:', error);
      }
    }
    
    init();
    
    return () => {
      chatWebSocket.disconnect();
    };
  }, []);

  // WebSocket event listeners
  useEffect(() => {
    const unsubConnection = chatWebSocket.on('connection', ({ status }) => {
      dispatch({ type: 'CONNECTION_STATUS_CHANGED', payload: status });
    });
    
    const unsubMessage = chatWebSocket.on('message:new', (message) => {
      dispatch({ type: 'MESSAGE_ADDED', payload: message });
      dispatch({
        type: 'CONVERSATION_UPDATED',
        payload: {
          id: message.conversationId,
          lastMessage: message,
          updatedAt: message.timestamp,
        },
      });
    });
    
    const unsubMessageStatus = chatWebSocket.on('message:status', ({ messageId, status }) => {
      dispatch({ type: 'MESSAGE_STATUS_UPDATED', payload: { messageId, status } });
    });
    
    const unsubTypingStart = chatWebSocket.on('typing:start', ({ conversationId, userId }) => {
      dispatch({ type: 'TYPING_STARTED', payload: { conversationId, userId } });
    });
    
    const unsubTypingStop = chatWebSocket.on('typing:stop', ({ conversationId, userId }) => {
      dispatch({ type: 'TYPING_STOPPED', payload: { conversationId, userId } });
    });
    
    const unsubPresence = chatWebSocket.on('presence:change', ({ userId, status }) => {
      dispatch({ type: 'USER_STATUS_CHANGED', payload: { userId, status } });
    });
    
    return () => {
      unsubConnection();
      unsubMessage();
      unsubMessageStatus();
      unsubTypingStart();
      unsubTypingStop();
      unsubPresence();
    };
  }, []);

  // Actions
  const loadConversations = useCallback(async () => {
    const { conversations } = await chatAPI.getConversations();
    dispatch({ type: 'SET_CONVERSATIONS', payload: conversations });
  }, []);

  const loadMessages = useCallback(async (conversationId: string) => {
    dispatch({ type: 'SET_LOADING', payload: { conversationId, isLoading: true } });
    
    try {
      const { messages, hasMore } = await chatAPI.getMessages(conversationId);
      dispatch({ type: 'SET_MESSAGES', payload: { conversationId, messages, hasMore } });
    } catch (error) {
      console.error('Failed to load messages:', error);
      dispatch({ type: 'SET_LOADING', payload: { conversationId, isLoading: false } });
    }
  }, []);

  const loadOlderMessages = useCallback(async (conversationId: string) => {
    const pagination = state.messagesPagination[conversationId];
    if (!pagination?.hasMore || pagination.isLoading) return;
    
    dispatch({ type: 'SET_LOADING', payload: { conversationId, isLoading: true } });
    
    try {
      const { messages, hasMore } = await chatAPI.getMessages(conversationId, {
        before: pagination.oldestMessageId ?? undefined,
        limit: 20,
      });
      dispatch({ type: 'APPEND_OLDER_MESSAGES', payload: { conversationId, messages, hasMore } });
    } catch (error) {
      console.error('Failed to load older messages:', error);
      dispatch({ type: 'SET_LOADING', payload: { conversationId, isLoading: false } });
    }
  }, [state.messagesPagination]);

  const sendMessage = useCallback(async (content: string) => {
    if (!state.activeConversationId || !state.currentUser) return;
    
    const tempId = `temp-${Date.now()}`;
    const conversationId = state.activeConversationId;
    
    // Optimistic update
    const optimisticMessage: Message = {
      id: tempId,
      conversationId,
      senderId: state.currentUser.id,
      content,
      timestamp: new Date(),
      status: 'sending',
    };
    
    dispatch({ type: 'MESSAGE_ADDED', payload: optimisticMessage });
    
    try {
      const { message } = await chatAPI.sendMessage(conversationId, content, tempId);
      dispatch({ type: 'MESSAGE_CONFIRMED', payload: { tempId, realMessage: message } });
      
      // Simulate delivery/read status
      chatWebSocket.simulateMessageDelivered(message.id);
      
      // Update conversation
      dispatch({
        type: 'CONVERSATION_UPDATED',
        payload: {
          id: conversationId,
          lastMessage: message,
          updatedAt: message.timestamp,
        },
      });
    } catch (error) {
      dispatch({ type: 'MESSAGE_FAILED', payload: { tempId, error: 'Network error' } });
    }
  }, [state.activeConversationId, state.currentUser]);

  const selectConversation = useCallback((conversationId: string | null) => {
    dispatch({ type: 'SET_ACTIVE_CONVERSATION', payload: conversationId });
    
    if (conversationId) {
      loadMessages(conversationId);
      
      // Mark as read
      const conv = state.conversations[conversationId];
      if (conv?.lastMessage) {
        chatAPI.markAsRead(conversationId, conv.lastMessage.id);
        dispatch({
          type: 'CONVERSATION_UPDATED',
          payload: { id: conversationId, unreadCount: 0 },
        });
      }
    }
  }, [loadMessages, state.conversations]);

  const sendTyping = useCallback((conversationId: string) => {
    chatWebSocket.send('typing:start', { conversationId });
  }, []);

  const stopTyping = useCallback((conversationId: string) => {
    chatWebSocket.send('typing:stop', { conversationId });
  }, []);

  const value: ChatContextValue = {
    state,
    dispatch,
    actions: {
      loadConversations,
      loadMessages,
      loadOlderMessages,
      sendMessage,
      selectConversation,
      sendTyping,
      stopTyping,
    },
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

// Hook
export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}

// Selector hooks for performance
export function useCurrentUser() {
  const { state } = useChatContext();
  return state.currentUser;
}

export function useConversations() {
  const { state } = useChatContext();
  return Object.values(state.conversations).sort(
    (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
  );
}

export function useActiveConversation() {
  const { state } = useChatContext();
  if (!state.activeConversationId) return null;
  return state.conversations[state.activeConversationId];
}

export function useConversationMessages(conversationId: string | null) {
  const { state } = useChatContext();
  if (!conversationId) return [];
  
  return Object.values(state.messages)
    .filter(m => m.conversationId === conversationId)
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
}

export function useTypingUsers(conversationId: string | null) {
  const { state } = useChatContext();
  if (!conversationId) return [];
  
  const userIds = state.typingUsers[conversationId] || [];
  return userIds.map(id => state.users[id]).filter(Boolean);
}

export function useUser(userId: string) {
  const { state } = useChatContext();
  return state.users[userId];
}
