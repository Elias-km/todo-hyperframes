import { useEffect, useLayoutEffect, useReducer, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './i18n/i18n.js';
import Icon from './components/Icon/Icon.jsx';
import LanguageSelector from './components/LanguageSelector/LanguageSelector.jsx';
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
  const { t } = useTranslation();
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
      setShareFeedback('copied');
    } else if (result === 'failed') {
      setShareFeedback('shareFailed');
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

  const themeLabel = t({
    light: 'themeLight',
    dark: 'themeDark',
    radioactive: 'themeRadioactive',
  }[nextTheme]);

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
              <Icon name="moon" size={21} />
            ) : theme === 'dark' ? (
              <Icon name="skull" size={21} />
            ) : (
              <Icon name="sun" size={21} />
            )}
          </button>
          <LanguageSelector />
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

        <p className="description">{t('description')}</p>

        <TodoList
          todos={state.todos}
          selectedIds={state.selectedIds}
          onToggle={(id) => handleAction({ type: 'toggle', id })}
          onRemove={(id) => handleAction({ type: 'remove', id })}
        />

        <p className="sr-only" role="status">
{t('items', { count: state.todos.length })}.{' '}
          {t('selected', { count: state.selectedIds.size })}.
        </p>

        <div className="actions">
          <div className="actions-left">
            <button
              type="button"
              className="icon-button"
              aria-label={t('undo')}
              title={t('undo')}
              disabled={state.history.length === 0}
              onClick={() => handleAction({ type: 'undo' })}
            >
              <Icon name="undo" />
            </button>

            <button
              type="button"
              className="icon-button"
              aria-label={t('redo')}
              title={t('redo')}
              disabled={state.future.length === 0}
              onClick={() => handleAction({ type: 'redo' })}
            >
              <Icon name="redo" />
            </button>

            <button
              type="button"
              className="ghost-button"
              disabled={state.selectedIds.size === 0}
              onClick={() => handleAction({ type: 'removeSelected' })}
            >
              {t('delete')}
            </button>
          </div>

          <div className="actions-right">
            <button
              type="button"
              className="icon-button"
              aria-label={t('share')}
              title={t('share')}
              disabled={state.todos.length === 0}
              onClick={handleShare}
            >
              <Icon name="share" />
            </button>

            <button
              type="button"
              className="primary-button"
              onClick={() => setFormOpen(true)}
            >
              {t('add')}
            </button>
          </div>
        </div>

        {shareFeedback && (
          <p className="share-feedback" role="status">
            {t(shareFeedback)}
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
