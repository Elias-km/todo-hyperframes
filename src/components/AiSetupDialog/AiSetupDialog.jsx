import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../Icon/Icon.jsx';
import styles from './AiSetupDialog.module.css';

const titles = {
  checking: 'aiCheckingTitle',
  available: 'aiReadyTitle',
  downloadable: 'aiDownloadTitle',
  downloading: 'aiDownloadTitle',
  unavailable: 'aiUnavailableTitle',
  error: 'aiErrorTitle',
};

const descriptions = {
  checking: 'aiCheckingDescription',
  available: 'aiReadyDescription',
  downloadable: 'aiDownloadDescription',
  downloading: 'aiDownloadingDescription',
  unavailable: 'aiUnavailableDescription',
  error: 'aiErrorDescription',
};

export default function AiSetupDialog({
  open,
  status,
  busy,
  progress,
  error,
  onClose,
  onDownload,
  onRetry,
}) {
  const { t } = useTranslation();
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const canDownload = ['downloadable', 'downloading'].includes(status);

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby="ai-dialog-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <h2 id="ai-dialog-title">
        {t(titles[status] || 'aiErrorTitle')}
      </h2>

      <p>{t(descriptions[status] || 'aiErrorDescription')}</p>
      <p className={styles.localNotice}>{t('aiLocalNote')}</p>

      {busy && (
        <div role="status" aria-live="polite">
          <p>{t('aiDownloading')}</p>
          <progress
            className={styles.progress}
            max={100}
            value={progress ?? undefined}
            aria-label={t('aiProgress')}
          />
          {progress !== null && <p>{progress}%</p>}
        </div>
      )}

      {error && <p role="alert">{t(error)}</p>}

      <div className={styles.actions}>
        {canDownload && !busy && (
          <button
            type="button"
            className={styles.primary}
            onClick={onDownload}
          >
            <Icon name="sparkles" size={18} />
            {t(status === 'downloading'
              ? 'aiContinueDownload'
              : 'aiDownload')}
          </button>
        )}

        {status === 'error' && !busy && (
          <button
            type="button"
            className={styles.primary}
            onClick={onRetry}
          >
            <Icon name="sparkles" size={18} />
            {t('aiRetry')}
          </button>
        )}

        <button
          type="button"
          className={styles.secondary}
          onClick={onClose}
        >
          {t('aiClose')}
        </button>
      </div>
    </dialog>
  );
}
