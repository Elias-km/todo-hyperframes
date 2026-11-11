import Icon from '../Icon/Icon.jsx';
import styles from './AiSpark.module.css';

export default function AiSpark({ size = 16, animated = false }) {
  return (
    <span
      className={`${styles.spark} ${animated ? styles.animated : ''}`}
      data-ai-spark-animated={animated}
      aria-hidden="true"
    >
      <Icon name="sparkles" size={size} />
    </span>
  );
}
