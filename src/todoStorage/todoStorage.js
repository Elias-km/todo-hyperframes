
const STORAGE_KEY = 'todo-react:todos';

export function loadTodos(storage) {
  try {
    const raw = (storage ?? globalThis.localStorage).getItem(STORAGE_KEY);
    const data = JSON.parse(raw ?? '[]');

    if (!Array.isArray(data)) return [];

    const ids = new Set();

    return data
      .filter((todo) => {
        if (
          !todo ||
          typeof todo.id !== 'string' ||
          !todo.id ||
          typeof todo.text !== 'string' ||
          !todo.text.trim() ||
          ids.has(todo.id)
        ) {
          return false;
        }

        ids.add(todo.id);
        return true;
      })
      .map(({ id, text }) => ({ id, text }));
  } catch {
    return [];
  }
}

export function saveTodos(todos, storage) {
  try {
    (storage ?? globalThis.localStorage).setItem(
      STORAGE_KEY,
      JSON.stringify(todos)
    );

    return true;
  } catch {
    return false;
  }
}

export function hasSavedTodos(storage) {
  try {
    return (storage ?? globalThis.localStorage)
      .getItem(STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}