// Message list with scroll management

import { useRef, useEffect, useCallback, useLayoutEffect } from 'react';
import { useChatContext, useConversationMessages, useTypingUsers, useCurrentUser } from '../../context/ChatContext';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from '../shared/TypingIndicator';
import './MessageList.css';

interface MessageListProps {
  conversationId: string;
}

export function MessageList({ conversationId }: MessageListProps) {
  const { state, actions } = useChatContext();
  const messages = useConversationMessages(conversationId);
  const typingUsers = useTypingUsers(conversationId);
  const currentUser = useCurrentUser();
  
  const listRef = useRef<HTMLDivElement>(null);
  const previousScrollHeight = useRef(0);
  const isLoadingRef = useRef(false);
  const isAtBottomRef = useRef(true);
  
  const pagination = state.messagesPagination[conversationId];
  const isLoading = pagination?.isLoading;
  const hasMore = pagination?.hasMore ?? true;

  // Scroll to bottom on new messages (if already at bottom)
  useEffect(() => {
    if (isAtBottomRef.current && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages.length]);

  // Initial scroll to bottom
  useEffect(() => {
    if (listRef.current && messages.length > 0) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [conversationId]);

  // Restore scroll position after loading older messages
  useLayoutEffect(() => {
    if (previousScrollHeight.current > 0 && listRef.current && !isLoading) {
      const newHeight = listRef.current.scrollHeight;
      const diff = newHeight - previousScrollHeight.current;
      listRef.current.scrollTop += diff;
      previousScrollHeight.current = 0;
      isLoadingRef.current = false;
    }
  }, [messages.length, isLoading]);

  // Handle scroll
  const handleScroll = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    
    // Track if at bottom
    const threshold = 50;
    isAtBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
    
    // Load more when near top
    if (el.scrollTop < 100 && hasMore && !isLoadingRef.current) {
      isLoadingRef.current = true;
      previousScrollHeight.current = el.scrollHeight;
      actions.loadOlderMessages(conversationId);
    }
  }, [conversationId, hasMore, actions]);

  // Group messages by sender and time
  const groupedMessages = messages.map((msg, idx) => {
    const prevMsg = messages[idx - 1];
    const nextMsg = messages[idx + 1];
    
    const isSameSenderAsPrev = prevMsg?.senderId === msg.senderId;
    const isSameSenderAsNext = nextMsg?.senderId === msg.senderId;
    
    // Group if same sender and within 5 minutes
    const timeDiffPrev = prevMsg ? msg.timestamp.getTime() - prevMsg.timestamp.getTime() : Infinity;
    const timeDiffNext = nextMsg ? nextMsg.timestamp.getTime() - msg.timestamp.getTime() : Infinity;
    
    const isGroupedWithPrev = isSameSenderAsPrev && timeDiffPrev < 5 * 60 * 1000;
    const isGroupedWithNext = isSameSenderAsNext && timeDiffNext < 5 * 60 * 1000;
    
    return {
      message: msg,
      isFirstInGroup: !isGroupedWithPrev,
      isLastInGroup: !isGroupedWithNext,
      showAvatar: msg.senderId !== currentUser?.id,
    };
  });

  return (
    <div 
      className="message-list" 
      ref={listRef} 
      onScroll={handleScroll}
      role="log"
      aria-live="polite"
      aria-label="Message history"
    >
      {isLoading && hasMore && (
        <div className="loading-more">
          <span className="loading-spinner" />
          Loading older messages...
        </div>
      )}
      
      {!hasMore && messages.length > 0 && (
        <div className="conversation-start">
          Beginning of conversation
        </div>
      )}
      
      <div className="messages-container">
        {groupedMessages.map(({ message, isFirstInGroup, isLastInGroup, showAvatar }) => (
          <MessageBubble
            key={message.id}
            message={message}
            showAvatar={showAvatar}
            isFirstInGroup={isFirstInGroup}
            isLastInGroup={isLastInGroup}
          />
        ))}
      </div>
      
      {typingUsers.length > 0 && (
        <TypingIndicator names={typingUsers.map(u => u.name)} />
      )}
    </div>
  );
}
