// Mock API for Todos - Solution

export interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

const API_URL = '/api/todos';

export async function fetchTodos(): Promise<Todo[]> {
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error('Failed to fetch todos');
  }
  return response.json();
}

export async function addTodo(text: string): Promise<Todo> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!response.ok) {
    throw new Error('Failed to add todo');
  }
  return response.json();
}

export async function toggleTodo(id: number): Promise<Todo> {
  const response = await fetch(`${API_URL}/${id}/toggle`, {
    method: 'PATCH',
  });
  if (!response.ok) {
    throw new Error('Failed to toggle todo');
  }
  return response.json();
}

export async function deleteTodo(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete todo');
  }
}
