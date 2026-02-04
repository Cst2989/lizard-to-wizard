// Main Chat Application component

import { ChatProvider } from '../context/ChatContext';
import { ConversationList } from './ConversationList';
import { ChatWindow } from './ChatWindow';
import './ChatApp.css';

export function ChatApp() {
  return (
    <ChatProvider>
      <div className="chat-app">
        <ConversationList />
        <ChatWindow />
      </div>
    </ChatProvider>
  );
}
