// Mock data for the chat application

import type { User, Message, Conversation } from '../types';

// Current user (you)
export const currentUser: User = {
  id: 'user-1',
  name: 'You',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=You',
  status: 'online',
  lastSeen: new Date(),
};

// Other users
export const users: User[] = [
  {
    id: 'user-2',
    name: 'Alice Johnson',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
    status: 'online',
    lastSeen: new Date(),
  },
  {
    id: 'user-3',
    name: 'Bob Smith',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
    status: 'away',
    lastSeen: new Date(Date.now() - 1000 * 60 * 15),
  },
  {
    id: 'user-4',
    name: 'Carol Williams',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carol',
    status: 'offline',
    lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: 'user-5',
    name: 'David Brown',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    status: 'online',
    lastSeen: new Date(),
  },
  {
    id: 'user-6',
    name: 'Eve Davis',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Eve',
    status: 'offline',
    lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
];

// Generate messages for a conversation
function generateMessages(conversationId: string, participantIds: string[], count: number): Message[] {
  const messages: Message[] = [];
  const now = Date.now();
  
  const sampleTexts = [
    "Hey, how are you?",
    "I'm doing great, thanks for asking!",
    "Did you see the latest update?",
    "Yes, it looks amazing!",
    "We should catch up soon",
    "Absolutely, let me know when you're free",
    "How about tomorrow afternoon?",
    "That works for me!",
    "Perfect, see you then",
    "Can't wait!",
    "By the way, did you finish the project?",
    "Almost done, just need to review a few things",
    "Let me know if you need any help",
    "Thanks, I appreciate it!",
    "No problem at all",
    "Have you tried the new feature?",
    "Not yet, is it any good?",
    "It's fantastic, you should check it out",
    "I'll take a look later today",
    "Great, let me know what you think",
  ];
  
  for (let i = 0; i < count; i++) {
    const senderId = participantIds[i % participantIds.length];
    messages.push({
      id: `msg-${conversationId}-${i}`,
      conversationId,
      senderId,
      content: sampleTexts[i % sampleTexts.length],
      timestamp: new Date(now - (count - i) * 1000 * 60 * 5), // 5 min apart
      status: 'read',
    });
  }
  
  return messages;
}

// Conversations
export const conversations: Conversation[] = [
  {
    id: 'conv-1',
    type: 'direct',
    participants: ['user-1', 'user-2'],
    unreadCount: 2,
    updatedAt: new Date(Date.now() - 1000 * 60 * 5),
  },
  {
    id: 'conv-2',
    type: 'direct',
    participants: ['user-1', 'user-3'],
    unreadCount: 0,
    updatedAt: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: 'conv-3',
    type: 'group',
    name: 'Project Team',
    participants: ['user-1', 'user-2', 'user-3', 'user-4'],
    unreadCount: 5,
    updatedAt: new Date(Date.now() - 1000 * 60 * 10),
  },
  {
    id: 'conv-4',
    type: 'direct',
    participants: ['user-1', 'user-4'],
    unreadCount: 0,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: 'conv-5',
    type: 'direct',
    participants: ['user-1', 'user-5'],
    unreadCount: 1,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60),
  },
  {
    id: 'conv-6',
    type: 'group',
    name: 'Weekend Plans',
    participants: ['user-1', 'user-5', 'user-6'],
    unreadCount: 0,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
];

// Pre-generate messages for each conversation
export const allMessages: Record<string, Message[]> = {};

conversations.forEach(conv => {
  const messageCount = Math.floor(Math.random() * 50) + 20; // 20-70 messages per convo
  allMessages[conv.id] = generateMessages(conv.id, conv.participants, messageCount);
  
  // Set last message on conversation
  const lastMsg = allMessages[conv.id][allMessages[conv.id].length - 1];
  conv.lastMessage = lastMsg;
});

// Add all users including current user
export const allUsers = [currentUser, ...users];
