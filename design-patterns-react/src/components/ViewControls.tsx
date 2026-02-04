// components/ViewControls.tsx

import React from 'react';
import { useTaskContext } from '../context/TaskContext';

export const ViewControls: React.FC = () => {
  const { viewStrategy, setViewStrategy } = useTaskContext();

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
