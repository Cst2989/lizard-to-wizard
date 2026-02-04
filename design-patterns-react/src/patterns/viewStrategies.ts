// patterns/viewStrategies.ts - Strategy Pattern Implementation

import type { Task, ViewStrategyKey } from '../types';

// View Strategies - each function filters tasks differently
export const viewStrategies: Record<ViewStrategyKey, (tasks: Task[]) => Task[]> = {
  all: (tasks: Task[]) => tasks,
  active: (tasks: Task[]) => tasks.filter(task => !task.completed),
  completed: (tasks: Task[]) => tasks.filter(task => task.completed),
};
