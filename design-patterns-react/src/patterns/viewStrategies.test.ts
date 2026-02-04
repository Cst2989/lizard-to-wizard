/**
 * Tests for Strategy Pattern
 * 
 * The Strategy pattern defines a family of algorithms,
 * encapsulates each one, and makes them interchangeable.
 */

import { describe, it, expect } from 'vitest';
import { viewStrategies } from './viewStrategies-task';
import type { Task } from '../types';

describe('Strategy Pattern - View Strategies', () => {
  const mockTasks: Task[] = [
    {
      id: '1',
      title: 'Active Task 1',
      description: 'Description 1',
      priority: 'high',
      completed: false,
      createdAt: new Date(),
    },
    {
      id: '2',
      title: 'Completed Task',
      description: 'Description 2',
      priority: 'medium',
      completed: true,
      completedAt: new Date(),
      createdAt: new Date(),
    },
    {
      id: '3',
      title: 'Active Task 2',
      description: 'Description 3',
      priority: 'low',
      completed: false,
      createdAt: new Date(),
    },
  ];

  describe('viewStrategies object', () => {
    it('should have all, active, and completed strategies', () => {
      expect(viewStrategies).toHaveProperty('all');
      expect(viewStrategies).toHaveProperty('active');
      expect(viewStrategies).toHaveProperty('completed');
    });

    it('all strategies should be functions', () => {
      expect(typeof viewStrategies.all).toBe('function');
      expect(typeof viewStrategies.active).toBe('function');
      expect(typeof viewStrategies.completed).toBe('function');
    });
  });

  describe('all strategy', () => {
    it('should return all tasks', () => {
      const result = viewStrategies.all(mockTasks);
      expect(result.length).toBe(3);
    });

    it('should return empty array for empty input', () => {
      const result = viewStrategies.all([]);
      expect(result.length).toBe(0);
    });
  });

  describe('active strategy', () => {
    it('should return only active (non-completed) tasks', () => {
      const result = viewStrategies.active(mockTasks);
      expect(result.length).toBe(2);
      expect(result.every(task => !task.completed)).toBe(true);
    });

    it('should return empty array if all tasks are completed', () => {
      const completedTasks: Task[] = [
        { ...mockTasks[1] },
        { ...mockTasks[1], id: '4' },
      ];
      const result = viewStrategies.active(completedTasks);
      expect(result.length).toBe(0);
    });
  });

  describe('completed strategy', () => {
    it('should return only completed tasks', () => {
      const result = viewStrategies.completed(mockTasks);
      expect(result.length).toBe(1);
      expect(result.every(task => task.completed)).toBe(true);
    });

    it('should return empty array if no tasks are completed', () => {
      const activeTasks: Task[] = [
        { ...mockTasks[0] },
        { ...mockTasks[2] },
      ];
      const result = viewStrategies.completed(activeTasks);
      expect(result.length).toBe(0);
    });
  });

  describe('strategies should not mutate original array', () => {
    it('all strategy should not mutate', () => {
      const original = [...mockTasks];
      viewStrategies.all(mockTasks);
      expect(mockTasks).toEqual(original);
    });

    it('active strategy should not mutate', () => {
      const original = [...mockTasks];
      viewStrategies.active(mockTasks);
      expect(mockTasks).toEqual(original);
    });

    it('completed strategy should not mutate', () => {
      const original = [...mockTasks];
      viewStrategies.completed(mockTasks);
      expect(mockTasks).toEqual(original);
    });
  });
});

/**
 * WORKSHOP INSTRUCTIONS:
 * 
 * Implement the Strategy pattern in viewStrategies-task.ts
 * 
 * Key concepts:
 * 1. Each strategy is a pure function with the same signature
 * 2. Strategies can be swapped at runtime
 * 3. Each strategy encapsulates a different algorithm
 * 
 * Strategies to implement:
 * - all: Return all tasks unchanged
 * - active: Filter and return only tasks where completed is false
 * - completed: Filter and return only tasks where completed is true
 */
