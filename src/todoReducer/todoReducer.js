export function createInitialState(todos = []) {
  return {
    todos,
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

      return saveHistory(state, [
        ...state.todos,
        { id: action.id, text },
      ]);
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
