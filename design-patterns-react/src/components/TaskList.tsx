// components/TaskList.tsx

import React from 'react';
import { useTaskContext } from '../context/TaskContext';
import { TaskItem } from './TaskItem';

export const TaskList: React.FC = () => {
  const { visibleTasks, viewStrategy } = useTaskContext();

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
