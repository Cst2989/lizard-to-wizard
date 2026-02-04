// Chat window header with conversation info

import type { Conversation } from '../../types';
import { useUser, useCurrentUser, useTypingUsers } from '../../context/ChatContext';
import { Avatar } from '../shared/Avatar';
import './ChatHeader.css';

interface ChatHeaderProps {
  conversation: Conversation;
}

export function ChatHeader({ conversation }: ChatHeaderProps) {
  const currentUser = useCurrentUser();
  const typingUsers = useTypingUsers(conversation.id);
  
  // For direct chats, get the other participant
  const otherParticipantId = conversation.participants.find(p => p !== currentUser?.id);
  const otherUser = useUser(otherParticipantId || '');
  
  // Display info
  const displayName = conversation.type === 'group' 
    ? conversation.name 
    : otherUser?.name || 'Unknown';
  
  const displayUser = conversation.type === 'group' ? undefined : otherUser;
  
  // Status text
  let statusText = '';
  if (typingUsers.length > 0) {
    const names = typingUsers.map(u => u.name);
    statusText = names.length === 1 
      ? `${names[0]} is typing...`
      : `${names.join(', ')} are typing...`;
  } else if (conversation.type === 'group') {
    statusText = `${conversation.participants.length} members`;
  } else if (otherUser) {
    statusText = otherUser.status === 'online' 
      ? 'Online'
      : otherUser.status === 'away'
      ? 'Away'
      : `Last seen ${formatLastSeen(otherUser.lastSeen)}`;
  }

  return (
    <header className="chat-header">
      <Avatar user={displayUser} size="medium" />
      
      <div className="chat-header-info">
        <h2 className="chat-header-name">{displayName}</h2>
        <p className={`chat-header-status ${typingUsers.length > 0 ? 'typing' : ''}`}>
          {statusText}
        </p>
      </div>
      
      <div className="chat-header-actions">
        <button className="header-action" aria-label="Search in conversation">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </button>
        <button className="header-action" aria-label="More options">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="1" />
            <circle cx="12" cy="5" r="1" />
            <circle cx="12" cy="19" r="1" />
          </svg>
        </button>
      </div>
    </header>
  );
}

function formatLastSeen(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
