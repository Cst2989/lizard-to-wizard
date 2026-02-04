// patterns/commands.ts - Command Pattern Implementation

import type { Task } from '../types';

// Abstract Command class
export abstract class Command {
  abstract execute(): unknown;
  abstract undo(): unknown;
}

// Add Task Command
export class AddTaskCommand extends Command {
  private taskList: Task[];
  private task: Task;

  constructor(taskList: Task[], task: Omit<Task, 'id'>) {
    super();
    this.taskList = taskList;
    this.task = { ...task, id: Date.now().toString() };
  }

  execute() {
    this.taskList.push(this.task);
    return this.task;
  }

  undo() {
    const index = this.taskList.findIndex(task => task.id === this.task.id);
    if (index !== -1) {
      this.taskList.splice(index, 1);
      return true;
    }
    return false;
  }
}

// Complete Task Command
export class CompleteTaskCommand extends Command {
  private taskList: Task[];
  private taskId: string;
  private taskIndex: number;
  private previousState: Task | null;

  constructor(taskList: Task[], taskId: string) {
    super();
    this.taskList = taskList;
    this.taskId = taskId;
    this.taskIndex = -1;
    this.previousState = null;
  }

  execute() {
    this.taskIndex = this.taskList.findIndex(task => task.id === this.taskId);
    if (this.taskIndex !== -1) {
      this.previousState = { ...this.taskList[this.taskIndex] };
      this.taskList[this.taskIndex] = {
        ...this.taskList[this.taskIndex],
        completed: true,
        completedAt: new Date(),
      };
      return this.taskList[this.taskIndex];
    }
    return null;
  }

  undo() {
    if (this.taskIndex !== -1 && this.previousState) {
      this.taskList[this.taskIndex] = this.previousState;
      return true;
    }
    return false;
  }
}
