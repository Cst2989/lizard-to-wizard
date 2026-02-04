// components/NotificationCenter.tsx

import React from 'react';
import { useNotificationSystem } from '../hooks/useNotificationSystem';

export const NotificationCenter: React.FC = () => {
  const { notifications } = useNotificationSystem();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`p-3 rounded-md shadow-md text-white animate-fadeIn ${
            notification.type === 'info'
              ? 'bg-blue-500'
              : notification.type === 'success'
              ? 'bg-green-500'
              : notification.type === 'warning'
              ? 'bg-yellow-500'
              : 'bg-red-500'
          }`}
        >
          {notification.message}
        </div>
      ))}
    </div>
  );
};
