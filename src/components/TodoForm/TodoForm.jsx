import { useEffect, useRef, useState } from 'react';
import styles from './TodoForm.module.css';

export default function TodoForm({ open, onClose, onAdd }) {
  const dialogRef = useRef(null);
  const [text, setText] = useState('');
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (open && !dialog.open) {
      dialog.showModal();
      dialog.querySelector("input")?.focus();
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
            Add item to list
          </label>

          <input
            id="todo-input"
            className={styles.input}
            type="text"
            placeholder="Type the text here..."
            autoComplete="off"
            autoFocus
            required
            value={text}
            onChange={(event) => setText(event.target.value)}
          />

          <div className={styles.actions}>
            <button type="submit" className={styles.primaryButton}>
              ADD
            </button>

            <button
              type="button"
              className={styles.secondaryButton}
              onClick={close}
            >
              CANCEL
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
