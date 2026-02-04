// hooks/useNotificationSystem-task.ts - Observer Pattern Implementation
// TODO: Implement a notification system using the Observer pattern

import { useState, useCallback } from 'react';
import type { Notification } from '../types';

// TODO: Implement the notification system hook
// This hook should:
// 1. Maintain a list of notifications
// 2. Provide a notify() function to add notifications
// 3. Auto-remove notifications after 5 seconds
// 4. Provide a removeNotification() function

export const useNotificationSystem = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const notify = useCallback((message: string, type: Notification['type'] = 'info') => {
    // TODO: Create a new notification with:
    // - Unique id (use Date.now().toString())
    // - message
    // - type
    // - timestamp (new Date())
    
    // TODO: Add notification to the list
    
    // TODO: Set up auto-remove after 5 seconds using setTimeout
  }, []);

  const removeNotification = useCallback((id: string) => {
    // TODO: Remove notification by id
  }, []);

  return { notifications, notify, removeNotification };
};
