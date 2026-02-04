// Main chat window component

import { useActiveConversation } from '../../context/ChatContext';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import './ChatWindow.css';

export function ChatWindow() {
  const activeConversation = useActiveConversation();

  if (!activeConversation) {
    return (
      <div className="chat-window empty">
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <h3>Select a conversation</h3>
          <p>Choose a conversation from the sidebar to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-window">
      <ChatHeader conversation={activeConversation} />
      <MessageList conversationId={activeConversation.id} />
      <MessageInput conversationId={activeConversation.id} />
    </div>
  );
}
