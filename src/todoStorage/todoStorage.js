import { sanitizeTags } from '../filterTodos/filterCatalog.js';

const STORAGE_KEY = 'todo-ia:todos';
const LANGUAGES = ['es', 'en'];

function normalizeTodos(todos) {
  if (!Array.isArray(todos)) return [];
  const seen = new Set();

  return todos.flatMap((todo) => {
    if (
      !todo || typeof todo.id !== 'string' || !todo.id ||
      typeof todo.text !== 'string' || !todo.text.trim() ||
      seen.has(todo.id)
    ) {
      return [];
    }

    seen.add(todo.id);
    const result = { id: todo.id, text: todo.text };

    if (LANGUAGES.includes(todo.originalLanguage)) {
      result.originalLanguage = todo.originalLanguage;
    }

    if (
      todo.translations &&
      typeof todo.translations === 'object' &&
      !Array.isArray(todo.translations)
    ) {
      const translations = {};
      for (const language of LANGUAGES) {
        const text = todo.translations[language];
        if (typeof text === 'string' && text.trim() && text.length <= 500) {
          translations[language] = text;
        }
      }
      if (Object.keys(translations).length) {
        result.translations = translations;
      }
    }

    // La clasificación dinámica anterior no es válida en el catálogo fijo.
    // Solo los IDs generados en el nuevo sistema llevan tagsVersion=1.
    if (todo.tagsVersion === 1) {
      const ids = sanitizeTags(todo.conceptIds);
      if (ids.length) {
        result.conceptIds = ids;
        result.tagsVersion = 1;
      }
    }

    return [result];
  });
}

function readTodos(storage) {
  const raw = storage.getItem(STORAGE_KEY);
  const parsed = JSON.parse(raw ?? '[]');
  return Array.isArray(parsed) ? parsed : parsed?.todos;
}

export function loadTodos(storage = globalThis.localStorage) {
  try {
    return normalizeTodos(readTodos(storage));
  } catch {
    return [];
  }
}

export function saveTodos(todos, storage = globalThis.localStorage) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify({
      version: 3,
      todos: normalizeTodos(todos),
    }));
    return true;
  } catch {
    return false;
  }
}
