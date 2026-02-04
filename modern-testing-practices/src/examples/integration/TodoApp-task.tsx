// TodoApp Component - TASK
// Implement this component to make the tests pass!
import { useState, useEffect, useCallback } from 'react';
import { fetchTodos, addTodo, toggleTodo, deleteTodo, type Todo } from './api';
import './TodoApp.css';

export function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // TODO: Implement loadTodos function
  // - Set loading to true
  // - Clear any existing error
  // - Call fetchTodos() API
  // - Update todos state with the result
  // - Handle errors by setting error state
  // - Set loading to false when done
  const loadTodos = useCallback(async () => {
    // TODO: Implement this
  }, []);

  // TODO: Call loadTodos on component mount
  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  // TODO: Implement handleSubmit
  // - Prevent default form behavior
  // - Don't submit if input is empty (after trim)
  // - Call addTodo() API with trimmed input
  // - Add the new todo to state
  // - Clear the input
  // - Handle errors
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement this
  };

  // TODO: Implement handleToggle
  // - Call toggleTodo() API with the todo id
  // - Update the todo in state with the response
  // - Handle errors
  const handleToggle = async (id: number) => {
    // TODO: Implement this
    console.log('Toggle todo:', id);
  };

  // TODO: Implement handleDelete
  // - Call deleteTodo() API with the todo id
  // - Remove the todo from state
  // - Handle errors
  const handleDelete = async (id: number) => {
    // TODO: Implement this
    console.log('Delete todo:', id);
  };

  // TODO: Show loading state
  // When loading is true, return a div with role="status" containing "Loading todos..."
  if (loading) {
    return <div className="todo-app">Loading...</div>; // TODO: Fix this - needs role="status"
  }

  return (
    <div className="todo-app">
      <h1>Todo List</h1>

      {/* TODO: Show error message when error exists */}
      {/* Should be a div with role="alert" containing the error */}

      <form onSubmit={handleSubmit} className="todo-form">
        <label htmlFor="new-todo" className="visually-hidden">
          Add new todo
        </label>
        <input
          id="new-todo"
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="What needs to be done?"
          className="todo-input"
        />
        <button type="submit" className="todo-add-btn">
          Add
        </button>
      </form>

      {/* TODO: Show empty message when no todos */}
      {/* TODO: Show todo list when there are todos */}
      <ul className="todo-list" role="list">
        {todos.map((todo) => (
          <li key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
            <label className="todo-label">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => handleToggle(todo.id)}
                aria-label={`Mark "${todo.text}" as ${todo.completed ? 'incomplete' : 'complete'}`}
              />
              <span className="todo-text">{todo.text}</span>
            </label>
            <button
              onClick={() => handleDelete(todo.id)}
              className="todo-delete-btn"
              aria-label={`Delete "${todo.text}"`}
            >
              ×
            </button>
          </li>
        ))}
      </ul>

      {/* TODO: Show items left count */}
      <div className="todo-stats">
        {/* TODO: Show count of incomplete todos */} items left
      </div>
    </div>
  );
}
