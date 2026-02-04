// Integration Tests for TodoApp - TASK VERSION
// These tests should FAIL until you implement TodoApp-task.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoApp } from './TodoApp-task';
import * as api from './api';

// Mock the API module
vi.mock('./api');

const mockTodos = [
  { id: 1, text: 'Learn testing', completed: false },
  { id: 2, text: 'Write tests', completed: true },
];

describe('TodoApp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading State', () => {
    it('shows loading message initially', () => {
      vi.mocked(api.fetchTodos).mockImplementation(() => new Promise(() => {}));
      render(<TodoApp />);

      expect(screen.getByRole('status')).toHaveTextContent(/loading/i);
    });
  });

  describe('Displaying Todos', () => {
    it('displays todos after loading', async () => {
      vi.mocked(api.fetchTodos).mockResolvedValue(mockTodos);
      render(<TodoApp />);

      await waitFor(() => {
        expect(screen.getByText('Learn testing')).toBeInTheDocument();
        expect(screen.getByText('Write tests')).toBeInTheDocument();
      });
    });

    it('shows empty message when no todos', async () => {
      vi.mocked(api.fetchTodos).mockResolvedValue([]);
      render(<TodoApp />);

      await waitFor(() => {
        expect(screen.getByText(/no todos yet/i)).toBeInTheDocument();
      });
    });

    it('shows items left count', async () => {
      vi.mocked(api.fetchTodos).mockResolvedValue(mockTodos);
      render(<TodoApp />);

      await waitFor(() => {
        expect(screen.getByText('1 items left')).toBeInTheDocument();
      });
    });
  });

  describe('Adding Todos', () => {
    it('adds a new todo when form is submitted', async () => {
      vi.mocked(api.fetchTodos).mockResolvedValue([]);
      vi.mocked(api.addTodo).mockResolvedValue({
        id: 3,
        text: 'New todo',
        completed: false,
      });

      render(<TodoApp />);
      await waitFor(() => {
        expect(screen.getByText(/no todos yet/i)).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/what needs to be done/i);
      await userEvent.type(input, 'New todo');
      await userEvent.click(screen.getByRole('button', { name: /add/i }));

      await waitFor(() => {
        expect(screen.getByText('New todo')).toBeInTheDocument();
      });
      expect(api.addTodo).toHaveBeenCalledWith('New todo');
    });

    it('clears input after adding todo', async () => {
      vi.mocked(api.fetchTodos).mockResolvedValue([]);
      vi.mocked(api.addTodo).mockResolvedValue({
        id: 3,
        text: 'New todo',
        completed: false,
      });

      render(<TodoApp />);
      await waitFor(() => {
        expect(screen.getByText(/no todos yet/i)).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/what needs to be done/i);
      await userEvent.type(input, 'New todo');
      await userEvent.click(screen.getByRole('button', { name: /add/i }));

      await waitFor(() => {
        expect(input).toHaveValue('');
      });
    });

    it('does not add empty todo', async () => {
      vi.mocked(api.fetchTodos).mockResolvedValue([]);
      render(<TodoApp />);

      await waitFor(() => {
        expect(screen.getByText(/no todos yet/i)).toBeInTheDocument();
      });

      await userEvent.click(screen.getByRole('button', { name: /add/i }));
      expect(api.addTodo).not.toHaveBeenCalled();
    });
  });

  describe('Toggling Todos', () => {
    it('toggles todo completion status', async () => {
      vi.mocked(api.fetchTodos).mockResolvedValue([mockTodos[0]]);
      vi.mocked(api.toggleTodo).mockResolvedValue({
        ...mockTodos[0],
        completed: true,
      });

      render(<TodoApp />);
      await waitFor(() => {
        expect(screen.getByText('Learn testing')).toBeInTheDocument();
      });

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();

      await userEvent.click(checkbox);

      await waitFor(() => {
        expect(checkbox).toBeChecked();
      });
      expect(api.toggleTodo).toHaveBeenCalledWith(1);
    });
  });

  describe('Deleting Todos', () => {
    it('deletes a todo when delete button is clicked', async () => {
      vi.mocked(api.fetchTodos).mockResolvedValue([mockTodos[0]]);
      vi.mocked(api.deleteTodo).mockResolvedValue(undefined);

      render(<TodoApp />);
      await waitFor(() => {
        expect(screen.getByText('Learn testing')).toBeInTheDocument();
      });

      const deleteBtn = screen.getByRole('button', { name: /delete/i });
      await userEvent.click(deleteBtn);

      await waitFor(() => {
        expect(screen.queryByText('Learn testing')).not.toBeInTheDocument();
      });
      expect(api.deleteTodo).toHaveBeenCalledWith(1);
    });
  });

  describe('Error Handling', () => {
    it('shows error message when fetch fails', async () => {
      vi.mocked(api.fetchTodos).mockRejectedValue(new Error('Network error'));
      render(<TodoApp />);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/failed to load/i);
      });
    });

    it('shows error message when add fails', async () => {
      vi.mocked(api.fetchTodos).mockResolvedValue([]);
      vi.mocked(api.addTodo).mockRejectedValue(new Error('Network error'));

      render(<TodoApp />);
      await waitFor(() => {
        expect(screen.getByText(/no todos yet/i)).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/what needs to be done/i);
      await userEvent.type(input, 'New todo');
      await userEvent.click(screen.getByRole('button', { name: /add/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/failed to add/i);
      });
    });
  });
});
