
const STORAGE_KEY = 'todo-ia:todos';

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
      .map(({ id, text, originalLanguage, translations }) => {
        const todo = { id, text };

        if (originalLanguage === 'es' || originalLanguage === 'en') {
          todo.originalLanguage = originalLanguage;
        }

        if (
          translations &&
          typeof translations === 'object' &&
          !Array.isArray(translations)
        ) {
          const validTranslations = {};

          for (const language of ['es', 'en']) {
            const value = translations[language];

            if (
              typeof value === 'string' &&
              value.trim() &&
              value.length <= 500
            ) {
              validTranslations[language] = value;
            }
          }

          if (Object.keys(validTranslations).length) {
            todo.translations = validTranslations;
          }
        }

        return todo;
      });
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