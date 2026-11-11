import flagEn from '../../img/svg/flag-en.svg';
import flagEs from '../../img/svg/flag-es.svg';
import AiSpark from '../AiSpark/AiSpark.jsx';
import styles from './TodoItem.module.css';

export default function TodoItem({
  todo,
  selected,
  translating = false,
  targetLanguage = 'es',
  activeFilterIds = new Set(),
  filterColors = {},
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
        {activeFilterIds.size > 0 && (
          <span className={styles.filterRail} aria-hidden="true">
            {todo.conceptIds
              ?.filter((id) => activeFilterIds.has(id))
              .map((id) => (
                <span
                  key={id}
                  className={styles.filterSegment}
                  data-concept-segment={id}
                  style={{ backgroundColor: filterColors[id] }}
                />
              ))}
          </span>
        )}

        <span className={styles.text}>{todo.text}</span>

        {translating && (
          <span
            className={styles.translationIndicator}
            aria-hidden="true"
          >
            <img
              className={styles.translationFlag}
              src={targetLanguage === 'en' ? flagEn : flagEs}
              alt=""
            />
            <AiSpark size={16} animated />
          </span>
        )}
      </button>
    </li>
  );
}
