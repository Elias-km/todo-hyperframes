import { useEffect, useReducer, useState } from 'react';
import TodoForm from './components/TodoForm/TodoForm.jsx';
import TodoList from './components/TodoList/TodoList.jsx';
import {
  createInitialState,
  todoReducer,
} from './todoReducer/todoReducer.js';
import { saveTodos } from './todoStorage/todoStorage.js';
import { shareTodos } from './shareTodos/shareTodos.js';

export default function App({ initialTodos }) {
  const [state, dispatch] = useReducer(
    todoReducer,
    initialTodos,
    createInitialState
  );

  const [formOpen, setFormOpen] = useState(false);
  const [shareFeedback, setShareFeedback] = useState('');

  useEffect(() => {
    saveTodos(state.todos);
  }, [state.todos]);

  function handleAction(action) {
    setShareFeedback('');
    dispatch(action);
  }

  function addTodo(text) {
    handleAction({
      type: 'add',
      id: crypto.randomUUID(),
      text,
    });
  }

  async function handleShare() {
    setShareFeedback('');

    const result = await shareTodos(state.todos);

    if (result === 'copied') {
      setShareFeedback('List copied to clipboard.');
    } else if (result === 'failed') {
      setShareFeedback('Unable to share or copy the list.');
    }
  }

  return (
    <main className="app-shell">
      <section className="card" aria-labelledby="app-title">
        <h1 id="app-title" className="title">
          ToDo List React
        </h1>

        <p className="description">
          Organize your tasks with a simple, lightweight app.
          Add and remove items, select multiple tasks, undo and redo
          changes, and keep your list automatically saved in your browser.
        </p>

        <TodoList
          todos={state.todos}
          selectedIds={state.selectedIds}
          onToggle={(id) => handleAction({ type: 'toggle', id })}
          onRemove={(id) => handleAction({ type: 'remove', id })}
        />

        <p className="sr-only" role="status">
          {state.todos.length} items. {state.selectedIds.size} selected.
        </p>

        <div className="actions">
          <div className="actions-left">
            <button
              type="button"
              className="icon-button"
              aria-label="Undo"
              title="Undo"
              disabled={state.history.length === 0}
              onClick={() => handleAction({ type: 'undo' })}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M10 7L6 11L10 15" />
                <path d="M6 11H13C16.866 11 20 14.134 20 18" />
              </svg>
            </button>

            <button
              type="button"
              className="icon-button"
              aria-label="Redo"
              title="Redo"
              disabled={state.future.length === 0}
              onClick={() => handleAction({ type: 'redo' })}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M14 7L18 11L14 15" />
                <path d="M18 11H11C7.134 11 4 14.134 4 18" />
              </svg>
            </button>

            <button
              type="button"
              className="ghost-button"
              disabled={state.selectedIds.size === 0}
              onClick={() => handleAction({ type: 'removeSelected' })}
            >
              DELETE
            </button>
          </div>

          <div className="actions-right">
            <button
              type="button"
              className="icon-button"
              aria-label="Share"
              title="Share"
              disabled={state.todos.length === 0}
              onClick={handleShare}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="18" cy="5" r="2" />
                <circle cx="6" cy="12" r="2" />
                <circle cx="18" cy="19" r="2" />
                <path d="M8 12L16 6.5" />
                <path d="M8 12L16 17.5" />
              </svg>
            </button>

            <button
              type="button"
              className="primary-button"
              onClick={() => setFormOpen(true)}
            >
              ADD
            </button>
          </div>
        </div>

        {shareFeedback && (
          <p className="share-feedback" role="status">
            {shareFeedback}
          </p>
        )}
      </section>

      <TodoForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onAdd={addTodo}
      />
    </main>
  );
}
