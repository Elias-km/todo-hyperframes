import TodoItem from '../TodoItem/TodoItem.jsx';
import styles from './TodoList.module.css';

export default function TodoList({
  todos,
  selectedIds,
  onToggle,
  onRemove,
}) {
  return (
    <section className={styles.container}>
      <ul className={styles.list} aria-label="Lista de tareas">
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
        <p className={styles.empty}>No items yet.</p>
      )}
    </section>
  );
}
