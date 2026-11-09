import flagEn from '../../img/svg/flag-en.svg';
import flagEs from '../../img/svg/flag-es.svg';
import Icon from '../Icon/Icon.jsx';
import styles from './TodoItem.module.css';

export default function TodoItem({
  todo,
  selected,
  translating = false,
  targetLanguage = 'es',
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
            <span className={styles.translationSparkle}>
              <Icon name="sparkles" size={16} />
            </span>
          </span>
        )}
      </button>
    </li>
  );
}
