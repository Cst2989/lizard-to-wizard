/**
 * Tests for Command Pattern
 * 
 * The Command pattern encapsulates a request as an object,
 * allowing for parameterization, queuing, and undo/redo functionality.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Command, AddTaskCommand, CompleteTaskCommand } from './commands-task';
import type { Task } from '../types';

describe('Command Pattern', () => {
  let taskList: Task[];

  beforeEach(() => {
    taskList = [];
  });

  describe('Command Base Class', () => {
    it('should be an abstract class with execute method', () => {
      // Verify concrete commands extend Command
      const addCommand = new AddTaskCommand([], { 
        title: 'Test', 
        description: '', 
        priority: 'low', 
        completed: false, 
        createdAt: new Date() 
      });
      expect(addCommand).toBeInstanceOf(Command);
      expect(typeof addCommand.execute).toBe('function');
    });

    it('should be an abstract class with undo method', () => {
      const addCommand = new AddTaskCommand([], { 
        title: 'Test', 
        description: '', 
        priority: 'low', 
        completed: false, 
        createdAt: new Date() 
      });
      expect(typeof addCommand.undo).toBe('function');
    });
  });

  describe('AddTaskCommand', () => {
    it('should add a task to the list on execute', () => {
      const newTask = {
        title: 'Test Task',
        description: 'Test Description',
        priority: 'medium' as const,
        completed: false,
        createdAt: new Date(),
      };

      const command = new AddTaskCommand(taskList, newTask);
      const result = command.execute();

      expect(taskList.length).toBe(1);
      expect(taskList[0].title).toBe('Test Task');
      expect(result).toHaveProperty('id');
    });

    it('should generate a unique id for the task', () => {
      const newTask = {
        title: 'Test Task',
        description: 'Test Description',
        priority: 'medium' as const,
        completed: false,
        createdAt: new Date(),
      };

      const command = new AddTaskCommand(taskList, newTask);
      command.execute();

      expect(taskList[0].id).toBeDefined();
      expect(typeof taskList[0].id).toBe('string');
      expect(taskList[0].id.length).toBeGreaterThan(0);
    });

    it('should remove the task on undo', () => {
      const newTask = {
        title: 'Test Task',
        description: 'Test Description',
        priority: 'medium' as const,
        completed: false,
        createdAt: new Date(),
      };

      const command = new AddTaskCommand(taskList, newTask);
      command.execute();
      expect(taskList.length).toBe(1);

      const undoResult = command.undo();
      expect(undoResult).toBe(true);
      expect(taskList.length).toBe(0);
    });

    it('should return false on undo if task not found', () => {
      const newTask = {
        title: 'Test Task',
        description: 'Test Description',
        priority: 'medium' as const,
        completed: false,
        createdAt: new Date(),
      };

      const command = new AddTaskCommand(taskList, newTask);
      // Don't execute, try to undo directly
      const undoResult = command.undo();
      expect(undoResult).toBe(false);
    });
  });

  describe('CompleteTaskCommand', () => {
    beforeEach(() => {
      taskList = [
        {
          id: '1',
          title: 'Existing Task',
          description: 'Description',
          priority: 'high',
          completed: false,
          createdAt: new Date(),
        },
      ];
    });

    it('should mark a task as completed on execute', () => {
      const command = new CompleteTaskCommand(taskList, '1');
      const result = command.execute();

      expect(taskList[0].completed).toBe(true);
      expect(taskList[0].completedAt).toBeDefined();
      expect(result).not.toBeNull();
    });

    it('should restore previous state on undo', () => {
      const command = new CompleteTaskCommand(taskList, '1');
      command.execute();
      expect(taskList[0].completed).toBe(true);

      const undoResult = command.undo();
      expect(undoResult).toBe(true);
      expect(taskList[0].completed).toBe(false);
      expect(taskList[0].completedAt).toBeUndefined();
    });

    it('should return null if task not found on execute', () => {
      const command = new CompleteTaskCommand(taskList, 'non-existent');
      const result = command.execute();

      expect(result).toBeNull();
    });

    it('should return false on undo if no previous state', () => {
      const command = new CompleteTaskCommand(taskList, '1');
      // Don't execute, try to undo directly
      const undoResult = command.undo();
      expect(undoResult).toBe(false);
    });
  });
});

/**
 * WORKSHOP INSTRUCTIONS:
 * 
 * Implement the Command pattern in commands-task.ts
 * 
 * Key concepts:
 * 1. Commands encapsulate actions as objects
 * 2. Each command has execute() and undo() methods
 * 3. Commands can be stored in a history for undo/redo
 * 
 * AddTaskCommand:
 * - Constructor: Store taskList and create task with unique id
 * - execute(): Push task to list, return task
 * - undo(): Find and remove task from list
 * 
 * CompleteTaskCommand:
 * - Constructor: Store taskList and taskId, init previousState
 * - execute(): Find task, save previous state, mark completed
 * - undo(): Restore previous state
 */
