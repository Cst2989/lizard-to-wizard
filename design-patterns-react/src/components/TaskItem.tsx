// components/TaskItem.tsx

import React from 'react';
import { Edit, Trash, CheckCircle } from 'lucide-react';
import type { Task } from '../types';
import { useTaskContext } from '../context/TaskContext';
import { CompleteTaskCommand } from '../patterns/commands';

interface TaskItemProps {
  task: Task;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const { executeCommand, tasks } = useTaskContext();

  const handleComplete = () => {
    if (!task.completed) {
      const command = new CompleteTaskCommand(tasks, task.id);
      executeCommand(command);
    }
  };

  return (
    <div
      className={`p-4 mb-3 border-l-4 rounded-md shadow-sm transition-colors duration-200 ${
        task.completed
          ? 'border-green-500 bg-green-50'
          : task.priority === 'urgent'
          ? 'border-red-500 bg-white'
          : task.priority === 'high'
          ? 'border-orange-500 bg-white'
          : task.priority === 'medium'
          ? 'border-blue-500 bg-white'
          : 'border-gray-500 bg-white'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className={`text-lg font-semibold ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
            {task.title}
          </h3>
          <p className="text-gray-600 mt-1 text-sm">{task.description}</p>

          {task.completed && (
            <div className="text-xs text-gray-500 mt-2">
              Completed: {task.completedAt ? new Date(task.completedAt).toLocaleString() : ''}
            </div>
          )}

          <div className="mt-2 text-xs">
            <span
              className={`inline-block px-2 py-1 rounded-full ${
                task.priority === 'urgent'
                  ? 'bg-red-100 text-red-800'
                  : task.priority === 'high'
                  ? 'bg-orange-100 text-orange-800'
                  : task.priority === 'medium'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
            </span>
          </div>
        </div>

        <div className="flex space-x-2">
          {!task.completed && (
            <button
              onClick={handleComplete}
              className="p-1 text-green-600 hover:text-green-800 transition-colors"
              aria-label="Complete task"
            >
              <CheckCircle size={18} />
            </button>
          )}

          <button 
            className="p-1 text-gray-600 hover:text-gray-800 transition-colors" 
            aria-label="Edit task"
          >
            <Edit size={18} />
          </button>

          <button 
            className="p-1 text-red-600 hover:text-red-800 transition-colors" 
            aria-label="Delete task"
          >
            <Trash size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
