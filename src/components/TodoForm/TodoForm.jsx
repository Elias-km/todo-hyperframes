import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './TodoForm.module.css';

export default function TodoForm({ open, onClose, onAdd }) {
  const { t } = useTranslation();
  const dialogRef = useRef(null);
  const [text, setText] = useState('');
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (open && !dialog.open) {
      dialog.showModal();
      dialog.querySelector('input')?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  function finishClose() {
    dialogRef.current?.close();
    setText('');
    setClosing(false);
    onClose();
  }

  function close() {
    if (!open || closing) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      finishClose();
    } else {
      setClosing(true);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();

    const value = text.trim();
    if (!value) return;

    onAdd(value);
    close();
  }

  return (
    <dialog
      ref={dialogRef}
      className={`${styles.backdrop} ${closing ? styles.closing : ''}`}
      aria-labelledby="todo-dialog-title"
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
      onAnimationEnd={(event) => {
        if (closing && event.target === event.currentTarget) {
          finishClose();
        }
      }}
    >
      <div className={styles.modal}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <label id="todo-dialog-title" htmlFor="todo-input">
            {t('addLabel')}
          </label>

          <input
            id="todo-input"
            className={styles.input}
            type="text"
            placeholder={t('placeholder')}
            autoComplete="off"
            required
            value={text}
            onChange={(event) => setText(event.target.value)}
          />

          <div className={styles.actions}>
            <button type="submit" className={styles.primaryButton}>
              {t('add')}
            </button>

            <button
              type="button"
              className={styles.secondaryButton}
              onClick={close}
            >
              {t('cancel')}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
