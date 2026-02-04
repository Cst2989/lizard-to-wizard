// Conversation list sidebar

import { useEffect, useMemo, useCallback } from 'react';
import { useChatContext, useConversations } from '../../context/ChatContext';
import { ConversationItem } from './ConversationItem';
import { SearchBar } from './SearchBar';
import './ConversationList.css';

export function ConversationList() {
  const { state, actions, dispatch } = useChatContext();
  const conversations = useConversations();

  // Load conversations on mount
  useEffect(() => {
    actions.loadConversations();
  }, [actions]);

  // Filter conversations based on search
  const filteredConversations = useMemo(() => {
    if (!state.searchQuery) return conversations;
    
    const query = state.searchQuery.toLowerCase();
    return conversations.filter(conv => {
      // Search by name (for groups) or participant names
      if (conv.name?.toLowerCase().includes(query)) return true;
      if (conv.lastMessage?.content.toLowerCase().includes(query)) return true;
      
      // Search by participant names
      const participantNames = conv.participants
        .map(id => state.users[id]?.name)
        .filter(Boolean);
      return participantNames.some(name => name?.toLowerCase().includes(query));
    });
  }, [conversations, state.searchQuery, state.users]);

  const handleSearch = useCallback((query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
  }, [dispatch]);

  const handleSelectConversation = useCallback((conversationId: string) => {
    actions.selectConversation(conversationId);
  }, [actions]);

  return (
    <aside className="conversation-list">
      <header className="conversation-list-header">
        <h2>Messages</h2>
        <div className="connection-status">
          <span className={`status-dot status-${state.connectionStatus}`} />
          {state.connectionStatus}
        </div>
      </header>
      
      <SearchBar onSearch={handleSearch} />
      
      <div className="conversation-list-items" role="listbox" aria-label="Conversations">
        {filteredConversations.length === 0 ? (
          <div className="no-conversations">
            {state.searchQuery ? 'No conversations found' : 'No conversations yet'}
          </div>
        ) : (
          filteredConversations.map(conv => (
            <ConversationItem
              key={conv.id}
              conversation={conv}
              isActive={conv.id === state.activeConversationId}
              onClick={() => handleSelectConversation(conv.id)}
            />
          ))
        )}
      </div>
    </aside>
  );
}
