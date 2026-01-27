import React, { useState, useEffect, useContext, createContext, useCallback } from 'react';
import type { ReactNode } from 'react';

import { Edit, Trash, CheckCircle, PlusCircle, X, RefreshCw } from 'lucide-react';

// ====== TYPES ======
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  completed: boolean;
  createdAt: Date;
  completedAt?: Date;
}

export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
}

interface TaskContextType {
  tasks: Task[];
  visibleTasks: Task[];
  executeCommand: (command: Command) => unknown;
  undo: () => boolean;
  redo: () => boolean;
  viewStrategy: ViewStrategyKey;
  setViewStrategy: React.Dispatch<React.SetStateAction<ViewStrategyKey>>;
}

// ====== CONTEXT PATTERN ======
const TaskContext = createContext<TaskContextType | undefined>(undefined);

// ====== COMMAND PATTERN ======
abstract class Command {
  abstract execute(): unknown;
  abstract undo(): unknown;
}

class AddTaskCommand extends Command {
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

class CompleteTaskCommand extends Command {
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

// ====== OBSERVER PATTERN ======
const useNotificationSystem = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const notify = useCallback((message: string, type: Notification['type'] = 'info') => {
    const notification: Notification = {
      id: Date.now().toString(),
      message,
      type,
      timestamp: new Date(),
    };

    setNotifications(prev => [...prev, notification]);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  }, []);

  return { notifications, notify };
};

// ====== STRATEGY PATTERN ======
type ViewStrategyKey = 'all' | 'active' | 'completed';
const viewStrategies: Record<ViewStrategyKey, (tasks: Task[]) => Task[]> = {
  all: (tasks: Task[]) => tasks,
  active: (tasks: Task[]) => tasks.filter(task => !task.completed),
  completed: (tasks: Task[]) => tasks.filter(task => task.completed),
};

// ====== PROVIDER COMPONENT ======
const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
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

// ====== DECORATOR PATTERN (HOC) ======
interface WithThemeProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const withTheme = <P extends object>(Component: React.ComponentType<P & WithThemeProps>) => {
  return (props: P) => {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    const toggleTheme = useCallback(() => {
      setTheme(prevTheme => {
        const newTheme = prevTheme === 'light' ? 'dark' : 'light';
        if (newTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        return newTheme;
      });
    }, []);

    // Initialize theme on mount
    useEffect(() => {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }, []);

    return <Component {...props} theme={theme} toggleTheme={toggleTheme} />;
  };
};

// ====== COMPONENTS ======
const NotificationCenter: React.FC = () => {
  const { notifications } = useNotificationSystem();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`p-3 rounded-md shadow-md text-white animate-fadeIn ${
            notification.type === 'info'
              ? 'bg-blue-500'
              : notification.type === 'success'
              ? 'bg-green-500'
              : notification.type === 'warning'
              ? 'bg-yellow-500'
              : 'bg-red-500'
          }`}
        >
          {notification.message}
        </div>
      ))}
    </div>
  );
};

const TaskItem: React.FC<{ task: Task }> = ({ task }) => {
  const context = useContext(TaskContext);
  if (!context) throw new Error('TaskContext not found');
  const { executeCommand, tasks } = context;

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

const TaskList: React.FC = () => {
  const context = useContext(TaskContext);
  if (!context) throw new Error('TaskContext not found');
  const { visibleTasks, viewStrategy } = context;

  if (visibleTasks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {viewStrategy === 'all' && 'No tasks yet. Create your first task!'}
        {viewStrategy === 'active' && 'No active tasks. Good job!'}
        {viewStrategy === 'completed' && 'No completed tasks yet.'}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {visibleTasks.map(task => (
        <TaskItem key={task.id} task={task} />
      ))}
    </div>
  );
};

const ViewControls: React.FC = () => {
  const context = useContext(TaskContext);
  if (!context) throw new Error('TaskContext not found');
  const { viewStrategy, setViewStrategy } = context;

  return (
    <div className="flex mb-6 bg-gray-100 rounded-md p-1">
      <button
        className={`flex-1 py-2 px-4 rounded-md text-center ${
          viewStrategy === 'all'
            ? 'bg-blue-500 text-white'
            : 'text-gray-700 hover:bg-gray-200'
        }`}
        onClick={() => setViewStrategy('all')}
      >
        All
      </button>
      <button
        className={`flex-1 py-2 px-4 rounded-md text-center ${
          viewStrategy === 'active'
            ? 'bg-blue-500 text-white'
            : 'text-gray-700 hover:bg-gray-200'
        }`}
        onClick={() => setViewStrategy('active')}
      >
        Active
      </button>
      <button
        className={`flex-1 py-2 px-4 rounded-md text-center ${
          viewStrategy === 'completed'
            ? 'bg-blue-500 text-white'
            : 'text-gray-700 hover:bg-gray-200'
        }`}
        onClick={() => setViewStrategy('completed')}
      >
        Completed
      </button>
    </div>
  );
};

const AddTaskForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const context = useContext(TaskContext);
  if (!context) throw new Error('TaskContext not found');
  const { executeCommand, tasks } = context;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (title.trim()) {
      const task: Omit<Task, 'id'> = {
        title: title.trim(),
        description: description.trim(),
        priority,
        completed: false,
        createdAt: new Date(),
      };

      executeCommand(new AddTaskCommand(tasks, task));
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Add New Task</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full p-2 border rounded-md h-24"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              id="priority"
              value={priority}
              onChange={e => setPriority(e.target.value as TaskPriority)}
              className="w-full p-2 border rounded-md"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600"
            >
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ====== MAIN APP COMPONENT ======
const TaskApp: React.FC<WithThemeProps> = ({ theme, toggleTheme }) => {
  const context = useContext(TaskContext);
  if (!context) throw new Error('TaskContext not found');
  const { undo, redo } = context;
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

// ====== APPLYING THE DECORATOR ======
const ThemedTaskApp = withTheme(TaskApp);

// ====== MAIN EXPORT ======
export default function App() {
  return (
    <TaskProvider>
      <ThemedTaskApp />
    </TaskProvider>
  );
}
