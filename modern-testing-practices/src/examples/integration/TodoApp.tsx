// TodoApp Component - Solution
import { useState, useEffect, useCallback } from 'react';
import { fetchTodos, addTodo, toggleTodo, deleteTodo, type Todo } from './api';
import './TodoApp.css';

export function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTodos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchTodos();
      setTodos(data);
    } catch (err) {
      setError('Failed to load todos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    try {
      const newTodo = await addTodo(inputValue.trim());
      setTodos((prev) => [...prev, newTodo]);
      setInputValue('');
    } catch (err) {
      setError('Failed to add todo');
    }
  };

  const handleToggle = async (id: number) => {
    try {
      const updated = await toggleTodo(id);
      setTodos((prev) =>
        prev.map((todo) => (todo.id === id ? updated : todo))
      );
    } catch (err) {
      setError('Failed to update todo');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteTodo(id);
      setTodos((prev) => prev.filter((todo) => todo.id !== id));
    } catch (err) {
      setError('Failed to delete todo');
    }
  };

  if (loading) {
    return <div className="todo-app" role="status">Loading todos...</div>;
  }

  return (
    <div className="todo-app">
      <h1>Todo List</h1>

      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}

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

      {todos.length === 0 ? (
        <p className="empty-message">No todos yet. Add one above!</p>
      ) : (
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
      )}

      <div className="todo-stats">
        {todos.filter((t) => !t.completed).length} items left
      </div>
    </div>
  );
}
