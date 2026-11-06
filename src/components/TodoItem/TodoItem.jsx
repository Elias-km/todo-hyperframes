import styles from './TodoItem.module.css';

export default function TodoItem({
  todo,
  selected,
  onToggle,
  onRemove,
}) {
  return (
    <li className={styles.item}>
      <button
        type="button"
        className={`${styles.button} ${selected ? styles.selected : ''}`}
        aria-pressed={selected}
        onClick={() => onToggle(todo.id)}
        onDoubleClick={() => onRemove(todo.id)}
      >
        {todo.text}
      </button>
    </li>
  );
}
