// App.tsx - Main Entry Point
// This app demonstrates several design patterns:
// - Command Pattern: Undo/Redo functionality (patterns/commands.ts)
// - Observer Pattern: Notification system (hooks/useNotificationSystem.ts)
// - Strategy Pattern: View filtering (patterns/viewStrategies.ts)
// - Decorator Pattern: Theme HOC (patterns/withTheme.tsx)
// - Context Pattern: Task state management (context/TaskContext.tsx)

import { TaskProvider } from './context/TaskContext';
import { TaskApp } from './components/TaskApp';
import { withTheme } from './patterns/withTheme';

// Apply the Decorator Pattern - wrap TaskApp with theme functionality
const ThemedTaskApp = withTheme(TaskApp);

// Main App Export
export default function App() {
  return (
    <TaskProvider>
      <ThemedTaskApp />
    </TaskProvider>
  );
}

// Re-export types for convenience
export * from './types';
