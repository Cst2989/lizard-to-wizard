// Single conversation item in the list

import type { Conversation } from '../../types';
import { useUser, useCurrentUser } from '../../context/ChatContext';
import { Avatar } from '../shared/Avatar';
import { formatRelativeTime } from '../../helpers/formatters';
import './ConversationItem.css';

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
}

export function ConversationItem({ conversation, isActive, onClick }: ConversationItemProps) {
  const currentUser = useCurrentUser();
  
  // For direct chats, get the other participant
  const otherParticipantId = conversation.participants.find(p => p !== currentUser?.id);
  const otherUser = useUser(otherParticipantId || '');
  
  // Display name and avatar
  const displayName = conversation.type === 'group' 
    ? conversation.name 
    : otherUser?.name || 'Unknown';
  
  const displayUser = conversation.type === 'group' ? undefined : otherUser;

  return (
    <button 
      className={`conversation-item ${isActive ? 'active' : ''}`}
      onClick={onClick}
      aria-selected={isActive}
    >
      <Avatar user={displayUser} size="medium" />
      
      <div className="conversation-content">
        <div className="conversation-header">
          <span className="conversation-name">{displayName}</span>
          {conversation.lastMessage && (
            <span className="conversation-time">
              {formatRelativeTime(conversation.lastMessage.timestamp)}
            </span>
          )}
        </div>
        
        <div className="conversation-preview">
          {conversation.lastMessage ? (
            <span className="preview-text">
              {conversation.lastMessage.senderId === currentUser?.id && 'You: '}
              {conversation.lastMessage.content}
            </span>
          ) : (
            <span className="preview-empty">No messages yet</span>
          )}
          
          {conversation.unreadCount > 0 && (
            <span className="unread-badge">{conversation.unreadCount}</span>
          )}
        </div>
      </div>
    </button>
  );
}
