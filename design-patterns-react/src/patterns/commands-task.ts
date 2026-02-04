// patterns/commands-task.ts - Command Pattern Implementation
// TODO: Implement the Command Pattern for undo/redo functionality

import type { Task } from '../types';

// Abstract Command class - defines the interface for all commands
export abstract class Command {
  abstract execute(): unknown;
  abstract undo(): unknown;
}

// TODO: Implement AddTaskCommand
// This command should:
// 1. Store the task list and the new task
// 2. execute() - Add the task to the list and return it
// 3. undo() - Remove the task from the list
export class AddTaskCommand extends Command {
  constructor(taskList: Task[], task: Omit<Task, 'id'>) {
    super();
    // TODO: Store taskList and create task with unique id
  }

  execute() {
    // TODO: Add task to list
    // Return the added task
  }

  undo() {
    // TODO: Remove task from list
    // Return true if successful, false otherwise
  }
}

// TODO: Implement CompleteTaskCommand
// This command should:
// 1. Store the task list and task ID
// 2. execute() - Mark the task as completed, save previous state
// 3. undo() - Restore the previous state
export class CompleteTaskCommand extends Command {
  constructor(taskList: Task[], taskId: string) {
    super();
    // TODO: Store taskList and taskId
    // Initialize previousState for undo
  }

  execute() {
    // TODO: Find task by id
    // Save previous state for undo
    // Mark as completed with completedAt date
    // Return the updated task
  }

  undo() {
    // TODO: Restore previous state
    // Return true if successful, false otherwise
  }
}
