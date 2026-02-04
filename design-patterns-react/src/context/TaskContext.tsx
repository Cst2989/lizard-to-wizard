// context/TaskContext.tsx - Context Pattern + Command Pattern Integration

import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { Task, ViewStrategyKey } from '../types';
import { Command } from '../patterns/commands';
import { viewStrategies } from '../patterns/viewStrategies';
import { useNotificationSystem } from '../hooks/useNotificationSystem';

// Context type definition
interface TaskContextType {
  tasks: Task[];
  visibleTasks: Task[];
  executeCommand: (command: Command) => unknown;
  undo: () => boolean;
  redo: () => boolean;
  viewStrategy: ViewStrategyKey;
  setViewStrategy: React.Dispatch<React.SetStateAction<ViewStrategyKey>>;
}

// Create context
const TaskContext = createContext<TaskContextType | undefined>(undefined);

// Custom hook to use the task context
export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};

// Provider component
export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [commandHistory, setCommandHistory] = useState<Command[]>([]);
  const [currentCommandIndex, setCurrentCommandIndex] = useState<number>(-1);
  const [viewStrategy, setViewStrategy] = useState<ViewStrategyKey>('all');
  const { notify } = useNotificationSystem();

  const executeCommand = useCallback((command: Command) => {
    const result = command.execute();
    if (result !== false) {
      // Clear redo stack
      const newHistory = commandHistory.slice(0, currentCommandIndex + 1);
      newHistory.push(command);
      setCommandHistory(newHistory);
      setCurrentCommandIndex(newHistory.length - 1);
      // Force re-render by creating new array
      setTasks([...tasks]);
      notify(`Task ${command.constructor.name.replace('Command', '')} successful`, 'success');
    }
    return result;
  }, [tasks, commandHistory, currentCommandIndex, notify]);

  const undo = useCallback(() => {
    if (currentCommandIndex >= 0) {
      const command = commandHistory[currentCommandIndex];
      const result = command.undo();
      if (result) {
        setCurrentCommandIndex(currentCommandIndex - 1);
        setTasks([...tasks]);
        notify('Undo successful', 'info');
        return true;
      }
    }
    notify('Nothing to undo', 'warning');
    return false;
  }, [commandHistory, currentCommandIndex, tasks, notify]);

  const redo = useCallback(() => {
    if (currentCommandIndex < commandHistory.length - 1) {
      const command = commandHistory[currentCommandIndex + 1];
      const result = command.execute();
      if (result !== false) {
        setCurrentCommandIndex(currentCommandIndex + 1);
        setTasks([...tasks]);
        notify('Redo successful', 'info');
        return true;
      }
    }
    notify('Nothing to redo', 'warning');
    return false;
  }, [commandHistory, currentCommandIndex, tasks, notify]);

  // Add some sample tasks when the component mounts
  useEffect(() => {
    if (tasks.length === 0) {
      const sampleTasks: Task[] = [
        {
          id: '1',
          title: 'Learn Design Patterns',
          description: 'Study common JavaScript design patterns and their implementations',
          priority: 'high',
          completed: false,
          createdAt: new Date(),
        },
        {
          id: '2',
          title: 'Build Sample Application',
          description: 'Create a task management app using multiple design patterns',
          priority: 'medium',
          completed: true,
          completedAt: new Date(),
          createdAt: new Date(Date.now() - 86400000), // yesterday
        },
        {
          id: '3',
          title: 'Prepare Workshop Materials',
          description: 'Create slides and code examples for the workshop',
          priority: 'urgent',
          completed: false,
          createdAt: new Date(Date.now() - 172800000), // 2 days ago
        },
      ];
      setTasks(sampleTasks);
    }
  }, [tasks.length]);

  const value: TaskContextType = {
    tasks,
    visibleTasks: viewStrategies[viewStrategy](tasks),
    executeCommand,
    undo,
    redo,
    viewStrategy,
    setViewStrategy,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

export { TaskContext };
