import { useEffect, useLayoutEffect, useReducer, useState } from 'react';
import TodoForm from './components/TodoForm/TodoForm.jsx';
import TodoList from './components/TodoList/TodoList.jsx';
import {
  createInitialState,
  todoReducer,
} from './todoReducer/todoReducer.js';
import { saveTodos } from './todoStorage/todoStorage.js';
import { shareTodos } from './shareTodos/shareTodos.js';
import { loadTheme, saveTheme } from "./theme/theme.js";

export default function App({ initialTodos }) {
  const [state, dispatch] = useReducer(
    todoReducer,
    initialTodos,
    createInitialState
  );

  const [formOpen, setFormOpen] = useState(false);
  const [ripples, setRipples] = useState([]);
  const [theme, setTheme] = useState(loadTheme);
  const [shareFeedback, setShareFeedback] = useState('');

  useEffect(() => {
    saveTodos(state.todos);
  }, [state.todos]);

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
    saveTheme(theme);
  }, [theme]);

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

  function handleRadioactivePointerDown(event) {
    if (theme !== 'radioactive' || event.button !== 0) return;

    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();

    const ripple = {
      id: crypto.randomUUID(),
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };

    setRipples((current) => [...current.slice(-4), ripple]);

    // Deformación elástica temporal de la tarjeta.
    if (typeof card.animate === 'function') {
      card.animate(
        [
          { transform: 'scale(1) skew(0deg, 0deg)' },
          { transform: 'scale(1.008, 0.993) skew(-0.35deg, 0.2deg)' },
          { transform: 'scale(0.996, 1.006) skew(0.25deg, -0.2deg)' },
          { transform: 'scale(1.002, 0.998)' },
          { transform: 'scale(1)' },
        ],
        {
          duration: 650,
          easing: 'ease-out',
        }
      );
    }
  }

  const nextTheme = {
    light: 'dark',
    dark: 'radioactive',
    radioactive: 'light',
  }[theme];

  const themeLabel = `Switch to ${nextTheme} theme`;

  return (
    <main className="app-shell">
      <section
        className="card"
        aria-labelledby="app-title"
        onPointerDown={handleRadioactivePointerDown}
      >
        <div className="preferences">
          <button
            type="button"
            className="theme-toggle"
            aria-label={themeLabel}
            title={themeLabel}
            onClick={() => {
              setRipples([]);
              setTheme(nextTheme);
            }}
          >
            {theme === 'light' ? (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20.9 13.4A9 9 0 0 1 10.6 3.1 9 9 0 1 0 20.9 13.4Z" />
              </svg>
            ) : theme === 'dark' ? (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2c-5 0-9 4-9 9 0 3 1.5 5.1 4 6.5V21h10v-3.5c2.5-1.4 4-3.5 4-6.5 0-5-4-9-9-9Z" />
                <circle cx="9" cy="12" r="1.2" fill="currentColor" stroke="none" />
                <circle cx="15" cy="12" r="1.2" fill="currentColor" stroke="none" />
                <path d="M10 21v-3M14 21v-3" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42" />
              </svg>
            )}
          </button>
        </div>

        {theme === 'radioactive' && (
          <div className="radioactive-wave-layer" aria-hidden="true">
            {ripples.map((ripple) => (
              <span
                key={ripple.id}
                className="radioactive-wave"
                style={{
                  left: ripple.x,
                  top: ripple.y,
                }}
                onAnimationEnd={() => {
                  setRipples((current) =>
                    current.filter((item) => item.id !== ripple.id)
                  );
                }}
              />
            ))}
          </div>
        )}

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
