/**
 * Tests for Observer Pattern - Notification System
 * 
 * The Observer pattern defines a one-to-many dependency
 * where state changes notify all dependents automatically.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNotificationSystem } from './useNotificationSystem-task';

describe('Observer Pattern - useNotificationSystem', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Initial state', () => {
    it('should start with empty notifications array', () => {
      const { result } = renderHook(() => useNotificationSystem());
      expect(result.current.notifications).toEqual([]);
    });

    it('should return notify function', () => {
      const { result } = renderHook(() => useNotificationSystem());
      expect(typeof result.current.notify).toBe('function');
    });

    it('should return removeNotification function', () => {
      const { result } = renderHook(() => useNotificationSystem());
      expect(typeof result.current.removeNotification).toBe('function');
    });
  });

  describe('notify function', () => {
    it('should add a notification to the list', () => {
      const { result } = renderHook(() => useNotificationSystem());

      act(() => {
        result.current.notify('Test message', 'info');
      });

      expect(result.current.notifications.length).toBe(1);
      expect(result.current.notifications[0].message).toBe('Test message');
      expect(result.current.notifications[0].type).toBe('info');
    });

    it('should use info as default type', () => {
      const { result } = renderHook(() => useNotificationSystem());

      act(() => {
        result.current.notify('Test message');
      });

      expect(result.current.notifications[0].type).toBe('info');
    });

    it('should generate unique id for each notification', () => {
      const { result } = renderHook(() => useNotificationSystem());

      act(() => {
        result.current.notify('Message 1');
      });
      
      vi.advanceTimersByTime(1);
      
      act(() => {
        result.current.notify('Message 2');
      });

      expect(result.current.notifications[0].id).not.toBe(result.current.notifications[1].id);
    });

    it('should include timestamp in notification', () => {
      const { result } = renderHook(() => useNotificationSystem());

      act(() => {
        result.current.notify('Test message');
      });

      expect(result.current.notifications[0].timestamp).toBeDefined();
      expect(result.current.notifications[0].timestamp instanceof Date).toBe(true);
    });

    it('should support different notification types', () => {
      const { result } = renderHook(() => useNotificationSystem());

      act(() => {
        result.current.notify('Info', 'info');
      });
      
      vi.advanceTimersByTime(1);
      
      act(() => {
        result.current.notify('Success', 'success');
      });
      
      vi.advanceTimersByTime(1);
      
      act(() => {
        result.current.notify('Warning', 'warning');
      });
      
      vi.advanceTimersByTime(1);
      
      act(() => {
        result.current.notify('Error', 'error');
      });

      expect(result.current.notifications.map(n => n.type)).toEqual([
        'info',
        'success',
        'warning',
        'error',
      ]);
    });
  });

  describe('Auto-remove after 5 seconds', () => {
    it('should auto-remove notification after 5 seconds', () => {
      const { result } = renderHook(() => useNotificationSystem());

      act(() => {
        result.current.notify('Test message');
      });

      expect(result.current.notifications.length).toBe(1);

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(result.current.notifications.length).toBe(0);
    });

    it('should not remove notification before 5 seconds', () => {
      const { result } = renderHook(() => useNotificationSystem());

      act(() => {
        result.current.notify('Test message');
      });

      act(() => {
        vi.advanceTimersByTime(4999);
      });

      expect(result.current.notifications.length).toBe(1);
    });
  });

  describe('removeNotification function', () => {
    it('should remove notification by id', () => {
      const { result } = renderHook(() => useNotificationSystem());

      act(() => {
        result.current.notify('Test message');
      });

      const id = result.current.notifications[0].id;

      act(() => {
        result.current.removeNotification(id);
      });

      expect(result.current.notifications.length).toBe(0);
    });

    it('should only remove the specified notification', () => {
      const { result } = renderHook(() => useNotificationSystem());

      act(() => {
        result.current.notify('Message 1');
      });
      
      vi.advanceTimersByTime(1);
      
      act(() => {
        result.current.notify('Message 2');
      });

      const id = result.current.notifications[0].id;

      act(() => {
        result.current.removeNotification(id);
      });

      expect(result.current.notifications.length).toBe(1);
      expect(result.current.notifications[0].message).toBe('Message 2');
    });
  });
});

/**
 * WORKSHOP INSTRUCTIONS:
 * 
 * Implement the Observer pattern in useNotificationSystem-task.ts
 * 
 * Key concepts:
 * 1. Notifications are "observed" by UI components
 * 2. State changes (adding/removing) notify all observers
 * 3. Auto-cleanup after timeout
 * 
 * Hook should return:
 * - notifications: Array of current notifications
 * - notify(message, type): Add new notification
 * - removeNotification(id): Remove notification by id
 * 
 * Notification object:
 * - id: Unique string (use Date.now().toString())
 * - message: The notification message
 * - type: 'info' | 'success' | 'warning' | 'error'
 * - timestamp: Date when created
 */
