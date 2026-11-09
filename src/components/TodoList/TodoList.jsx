import { useTranslation } from 'react-i18next';
import TodoItem from '../TodoItem/TodoItem.jsx';
import styles from './TodoList.module.css';

export default function TodoList({
  listRef,
  todos,
  selectedIds,
  onToggle,
  onRemove,
}) {
  const { t } = useTranslation();

  return (
    <section className={styles.container}>
      <ul ref={listRef} className={styles.list} aria-label={t('listLabel')}>
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            selected={selectedIds.has(todo.id)}
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
