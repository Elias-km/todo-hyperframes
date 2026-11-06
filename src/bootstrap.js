
import {
  hasSavedTodos,
  loadTodos,
  saveTodos,
} from './todoStorage/todoStorage.js';

const INITIAL_TASKS = [
  'Plan my week',
  'Buy groceries',
  'Finish my personal project',
];

export function bootstrapTodos() {
  if (hasSavedTodos()) {
    return loadTodos();
  }

  const todos = INITIAL_TASKS.map((text) => ({
    id: crypto.randomUUID(),
    text,
  }));

  saveTodos(todos);

  return todos;
}
