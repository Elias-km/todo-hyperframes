import { useTranslation } from 'react-i18next';
import TodoItem from '../TodoItem/TodoItem.jsx';
import styles from './TodoList.module.css';

export default function TodoList({
  listRef,
  todos,
  selectedIds,
  onToggle,
  onRemove,
  translating = false,
  pendingTranslationIds = new Set(),
  targetLanguage = 'es',
  translationError = false,
}) {
  const { t } = useTranslation();

  return (
    <section className={styles.container}>
      <ul
        ref={listRef}
        className={styles.list}
        aria-label={t('listLabel')}
        aria-busy={translating}
      >

        {translationError && !translating && (
          <li className={styles.translationError} role="status">
            {t('translationUnavailable')}
          </li>
        )}

        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            selected={selectedIds.has(todo.id)}
            translating={translating && pendingTranslationIds.has(todo.id)}
            targetLanguage={targetLanguage}
            onToggle={onToggle}
            onRemove={onRemove}
          />
        ))}
      </ul>

      {todos.length === 0 && (
        <p className={styles.empty}>{t('empty')}</p>
      )}
    </section>
  );
}
