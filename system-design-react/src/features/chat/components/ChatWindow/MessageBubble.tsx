// Individual message bubble

import { memo } from 'react';
import type { Message } from '../../types';
import { useUser, useCurrentUser } from '../../context/ChatContext';
import { Avatar } from '../shared/Avatar';
import { formatTime } from '../../helpers/formatters';
import './MessageBubble.css';

interface MessageBubbleProps {
  message: Message;
  showAvatar: boolean;
  isFirstInGroup: boolean;
  isLastInGroup: boolean;
}

export const MessageBubble = memo(function MessageBubble({ 
  message, 
  showAvatar,
  isFirstInGroup,
  isLastInGroup,
}: MessageBubbleProps) {
  const currentUser = useCurrentUser();
  const sender = useUser(message.senderId);
  
  const isOwn = message.senderId === currentUser?.id;
  
  // Status icon
  const StatusIcon = () => {
    switch (message.status) {
      case 'sending':
        return <span className="status-icon sending">○</span>;
      case 'sent':
        return <span className="status-icon sent">✓</span>;
      case 'delivered':
        return <span className="status-icon delivered">✓✓</span>;
      case 'read':
        return <span className="status-icon read">✓✓</span>;
      default:
        return null;
    }
  };

  return (
    <div className={`message-bubble ${isOwn ? 'own' : 'other'} ${isFirstInGroup ? 'first' : ''} ${isLastInGroup ? 'last' : ''}`}>
      {!isOwn && showAvatar && (
        <div className="message-avatar">
          {isLastInGroup && <Avatar user={sender} size="small" showStatus={false} />}
        </div>
      )}
      
      <div className="message-content-wrapper">
        {!isOwn && isFirstInGroup && (
          <span className="message-sender">{sender?.name || 'Unknown'}</span>
        )}
        
        <div className="message-content">
          <p className="message-text">{message.content}</p>
          
          <div className="message-meta">
            <span className="message-time">{formatTime(message.timestamp)}</span>
            {isOwn && <StatusIcon />}
          </div>
        </div>
      </div>
    </div>
  );
});
