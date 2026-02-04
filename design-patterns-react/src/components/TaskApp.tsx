// components/TaskApp.tsx - Main App Component

import React, { useState } from 'react';
import { PlusCircle, RefreshCw } from 'lucide-react';
import type { WithThemeProps } from '../patterns/withTheme';
import { useTaskContext } from '../context/TaskContext';
import { ViewControls } from './ViewControls';
import { TaskList } from './TaskList';
import { AddTaskForm } from './AddTaskForm';
import { NotificationCenter } from './NotificationCenter';

export const TaskApp: React.FC<WithThemeProps> = ({ theme, toggleTheme }) => {
  const { undo, redo } = useTaskContext();
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 transition-colors duration-200">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Task Manager</h1>

          <div className="flex space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full w-10 h-10 flex items-center justify-center bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>

            <button
              onClick={undo}
              className="p-2 rounded-full w-10 h-10 flex items-center justify-center bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
              aria-label="Undo"
            >
              <RefreshCw size={16} className="transform rotate-[-45deg]" />
            </button>

            <button
              onClick={redo}
              className="p-2 rounded-full w-10 h-10 flex items-center justify-center bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
              aria-label="Redo"
            >
              <RefreshCw size={16} className="transform rotate-45" />
            </button>

            <button
              onClick={() => setShowAddForm(true)}
              className="px-3 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors flex items-center space-x-1"
            >
              <PlusCircle size={16} />
              <span>Add Task</span>
            </button>
          </div>
        </div>

        <ViewControls />

        <div className="bg-white rounded-lg shadow-md p-6 transition-colors duration-200">
          <TaskList />
        </div>

        {showAddForm && <AddTaskForm onClose={() => setShowAddForm(false)} />}

        <NotificationCenter />
      </div>
    </div>
  );
};
