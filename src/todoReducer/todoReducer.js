import { completeTaskTags } from '../filterTodos/taskTagRules.js';

function applyCachedTranslations(todos, action) {
  let changed = false;

  const result = todos.map((todo) => {
    const originalLanguage =
      todo.originalLanguage || action.sourceLanguage;

    const entry = Object.hasOwn(
      action.translations,
      todo.id
    ) ? action.translations[todo.id] : null;

    const validEntry =
      entry &&
      entry.sourceText === todo.text &&
      typeof entry.text === 'string' &&
      entry.text.trim();

    const needsLanguage = !todo.originalLanguage;
    const needsTranslation =
      validEntry &&
      todo.translations?.[action.targetLanguage] !== entry.text;

    if (!needsLanguage && !needsTranslation) return todo;

    changed = true;

    return {
      ...todo,
      originalLanguage,
      ...(needsTranslation ? {
        translations: {
          ...todo.translations,
          [action.targetLanguage]: entry.text,
        },
      } : {}),
    };
  });

  return changed ? result : todos;
}

export function createInitialState(todos = []) {
  // Una única migración en memoria al arrancar: sin petición a la IA.
  // El efecto de persistencia de App guarda los IDs corregidos.
  const normalizedTodos = todos.map((todo) => {
    if (todo.tagsVersion !== 1 || !Array.isArray(todo.conceptIds)) return todo;
    const ids = completeTaskTags(todo.text, todo.conceptIds);
    const same = ids.length === todo.conceptIds.length &&
      ids.every((id, index) => id === todo.conceptIds[index]);
    return same ? todo : { ...todo, conceptIds: ids };
  });
  return {
    todos: normalizedTodos,
    selectedIds: new Set(),
    history: [],
    future: [],
  };
}

function saveHistory(state, todos, selectedIds = state.selectedIds) {
  return {
    todos,
    selectedIds,
    history: [...state.history, state.todos],
    future: [],
  };
}

export function todoReducer(state, action) {
  switch (action.type) {
    case 'add': {
      const text = typeof action.text === 'string'
        ? action.text.trim()
        : '';

      if (!text || !action.id) return state;

      const labels = completeTaskTags(text, action.conceptIds);

      return saveHistory(state, [
        ...state.todos,
        {
          id: action.id,
          text,
          ...(action.language === 'es' || action.language === 'en'
            ? { originalLanguage: action.language }
            : {}),
          ...(labels.length > 0 ? { conceptIds: labels, tagsVersion: 1 } : {}),
        },
      ]);
    }

    case 'assignFixedTags': {
      const ids = completeTaskTags(action.text, action.conceptIds);
      if (ids.length === 0 || typeof action.id !== 'string' ||
          typeof action.text !== 'string') return state;

      const apply = (todos) => {
        let changed = false;
        const result = todos.map((todo) => {
          if (todo.id !== action.id || todo.text !== action.text) return todo;
          if (todo.tagsVersion === 1 &&
              todo.conceptIds?.length === ids.length &&
              todo.conceptIds.every((id, index) => id === ids[index])) {
            return todo;
          }
          changed = true;
          return { ...todo, conceptIds: ids, tagsVersion: 1 };
        });
        return changed ? result : todos;
      };

      return {
        ...state,
        todos: apply(state.todos),
        history: state.history.map(apply),
        future: state.future.map(apply),
      };
    }

    case 'tagOriginalLanguage': {
      if (!['es', 'en'].includes(action.language)) {
        return state;
      }

      const tag = (todos) => {
        let changed = false;

        const result = todos.map((todo) => {
          if (todo.originalLanguage) return todo;

          changed = true;
          return {
            ...todo,
            originalLanguage: action.language,
          };
        });

        return changed ? result : todos;
      };

      return {
        ...state,
        todos: tag(state.todos),
        history: state.history.map(tag),
        future: state.future.map(tag),
      };
    }

    case 'cacheTranslations': {
      if (
        !['es', 'en'].includes(action.sourceLanguage) ||
        !['es', 'en'].includes(action.targetLanguage) ||
        !action.translations ||
        typeof action.translations !== 'object'
      ) {
        return state;
      }

      return {
        ...state,
        todos: applyCachedTranslations(state.todos, action),
        history: state.history.map((snapshot) =>
          applyCachedTranslations(snapshot, action)
        ),
        future: state.future.map((snapshot) =>
          applyCachedTranslations(snapshot, action)
        ),
      };
    }

    case 'toggle': {
      if (!state.todos.some((todo) => todo.id === action.id)) {
        return state;
      }

      const selectedIds = new Set(state.selectedIds);

      if (selectedIds.has(action.id)) {
        selectedIds.delete(action.id);
      } else {
        selectedIds.add(action.id);
      }

      return { ...state, selectedIds };
    }

    case 'remove': {
      if (!state.todos.some((todo) => todo.id === action.id)) {
        return state;
      }

      const selectedIds = new Set(state.selectedIds);
      selectedIds.delete(action.id);

      return saveHistory(
        state,
        state.todos.filter((todo) => todo.id !== action.id),
        selectedIds
      );
    }

    case 'removeSelected':
      if (state.selectedIds.size === 0) return state;

      return saveHistory(
        state,
        state.todos.filter((todo) => !state.selectedIds.has(todo.id)),
        new Set()
      );

    case 'undo':
      if (state.history.length === 0) return state;

      return {
        ...state,
        todos: state.history.at(-1),
        selectedIds: new Set(),
        history: state.history.slice(0, -1),
        future: [...state.future, state.todos],
      };

    case 'redo':
      if (state.future.length === 0) return state;

      return {
        ...state,
        todos: state.future.at(-1),
        selectedIds: new Set(),
        history: [...state.history, state.todos],
        future: state.future.slice(0, -1),
      };

    default:
      return state;
  }
}
