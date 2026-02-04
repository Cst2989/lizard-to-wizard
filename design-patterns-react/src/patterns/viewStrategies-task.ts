// patterns/viewStrategies-task.ts - Strategy Pattern Implementation
// TODO: Implement the Strategy Pattern for view filtering

import type { Task, ViewStrategyKey } from '../types';

// TODO: Implement View Strategies
// Each strategy is a function that filters tasks differently
// - 'all': Return all tasks
// - 'active': Return only tasks where completed is false
// - 'completed': Return only tasks where completed is true

export const viewStrategies: Record<ViewStrategyKey, (tasks: Task[]) => Task[]> = {
  all: (tasks: Task[]) => {
    // TODO: Return all tasks
    return [];
  },
  active: (tasks: Task[]) => {
    // TODO: Return only active (not completed) tasks
    return [];
  },
  completed: (tasks: Task[]) => {
    // TODO: Return only completed tasks
    return [];
  },
};
