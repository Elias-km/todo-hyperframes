import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './PromoVideoButton.module.css';

const VIDEO_SRC = `${import.meta.env.BASE_URL}videos/todo-ia-promo.mp4`;

export default function PromoVideoButton() {
  const { t } = useTranslation();
  const dialogRef = useRef(null);
  const videoRef = useRef(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();

      requestAnimationFrame(() => {
        const video = videoRef.current;
        if (!video) return;
        video.currentTime = 0;
        void video.play().catch(() => {});
      });
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  function closeDialog() {
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
    setOpen(false);
  }

  return (
    <>
      <div className={styles.wrap}>
        <button
          type="button"
          className={`promo-video-button ${styles.button}`}
          aria-label={t('watchPromo')}
          title={t('watchPromo')}
          onClick={() => setOpen(true)}
        >
          <span className={styles.card}>
            <span className={styles.innerFrame}>
              <span className={styles.sprocketLeft} aria-hidden="true" />
              <span className={styles.sprocketRight} aria-hidden="true" />
              <span className={styles.kicker}>VIDEO</span>
              <span className={styles.playDisc} aria-hidden="true">
                <span className={styles.playTriangle} />
              </span>
              <span className={styles.brand}>ToDo IA</span>
            </span>
          </span>
        </button>
      </div>

      <dialog
        ref={dialogRef}
        className={styles.dialog}
        onCancel={(event) => {
          event.preventDefault();
          closeDialog();
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            closeDialog();
          }
        }}
      >
        <div className={styles.modal}>
          <div className={styles.header}>
            <div className={styles.titleBlock}>
              <h2 className={styles.title}>{t('promoDialogTitle')}</h2>
              <p className={styles.subtitle}>{t('promoDialogSubtitle')}</p>
            </div>

            <button
              type="button"
              className={styles.closeButton}
              onClick={closeDialog}
            >
              {t('aiClose')}
            </button>
          </div>

          <video
            ref={videoRef}
            className={styles.video}
            controls
            playsInline
            preload="metadata"
            src={VIDEO_SRC}
          />
        </div>
      </dialog>
    </>
  );
}
