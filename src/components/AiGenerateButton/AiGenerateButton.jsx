import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../Icon/Icon.jsx';
import { generateTodo } from '../../generateTodo/generateTodo.js';
import styles from './AiGenerateButton.module.css';

export default function AiGenerateButton({
  ai,
  todos,
  language,
  onAdd,
}) {
  const { t } = useTranslation();

  const [generating, setGenerating] = useState(false);
  const [feedback, setFeedback] = useState('');

  async function handleGenerate() {
    if (generating) return;

    if (ai.status !== 'available' || !ai.ready) {
      ai.openDialog();
      return;
    }

    setGenerating(true);
    setFeedback('');
    ai.beginGeneration();

    try {
      const text = await generateTodo({
        language,
        existingTodos: todos,
      });

      onAdd(text);
    } catch (error) {
      if (error?.message === 'AI unavailable') {
        ai.reportUnavailable();
      } else {
        setFeedback('aiGenerateFailed');
      }
    } finally {
      ai.endGeneration();
      setGenerating(false);
    }
  }

  const disabled =
    generating ||
    ai.busy ||
    ai.status === 'checking' ||
    (ai.status === 'available' && !ai.ready);

  return (
    <div className={`ai-generate-panel ${styles.panel}`}>
      <button
        type="button"
        className={`ghost-button ai-generate-button ${styles.button} ${ai.modelIndicator}`}
        style={{
          '--ai-model-progress': `${ai.modelLoadProgress}%`,
        }}
        disabled={disabled}
        aria-busy={
          generating || ai.modelIndicator === 'ai-model-loading'
        }
        onClick={handleGenerate}
      >
        <Icon name="sparkles" size={20} />
        <span>
          {generating ? t('aiGenerating') : t('aiGenerate')}
        </span>
      </button>

      <span className="sr-only" role="status">
        {ai.modelIndicator === 'ai-model-loading'
          ? t('aiModelPreparing')
          : ai.ready ? t('aiModelReady') : ''}
      </span>

      {feedback && (
        <p role="alert" className={styles.feedback}>
          {t(feedback)}
        </p>
      )}
    </div>
  );
}
